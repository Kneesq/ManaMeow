(() => {
  const isStaticDemo =
    location.hostname.endsWith('.github.io') ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1' ||
    location.protocol === 'file:';
  if (!isStaticDemo) return;

  const STORAGE_KEY = 'manameow_demo_db_v1';
  const SESSION_KEY = 'manameow_demo_session_v1';

  const DEFAULT_ACCOUNTS = {
    test1: { email: 'test1', username: 'test1', password: 'test1', recoveryCode: 'DEMO-TEST1-REC' },
    test2: { email: 'test2', username: 'test2', password: 'test2', recoveryCode: 'DEMO-TEST2-REC' },
    test3: { email: 'test3', username: 'test3', password: 'test3', recoveryCode: 'DEMO-TEST3-REC' },
    test4: { email: 'test4', username: 'test4', password: 'test4', recoveryCode: 'DEMO-TEST4-REC' },
    test5: { email: 'test5', username: 'test5', password: 'test5', recoveryCode: 'DEMO-TEST5-REC' },
  };

  function fuzzCoordinate(lat, lng) {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat, lng };
    const distM = 200 + Math.random() * 300;
    const angle = Math.random() * 2 * Math.PI;
    const dLat = (distM * Math.cos(angle)) / 111320;
    const cosLat = Math.max(Math.cos((lat * Math.PI) / 180), 0.01);
    const dLng = (distM * Math.sin(angle)) / (111320 * cosLat);
    return {
      lat: Math.round((lat + dLat) * 100000) / 100000,
      lng: Math.round((lng + dLng) * 100000) / 100000,
    };
  }

  function findAccount(db, identifier) {
    const key = String(identifier || '').trim().toLowerCase();
    if (!key) return null;
    if (db.accounts[key]) return { key, account: db.accounts[key] };
    for (const [k, acc] of Object.entries(db.accounts)) {
      if ((acc.username || '').toLowerCase() === key || (acc.email || '').toLowerCase() === key) {
        return { key: k, account: acc };
      }
    }
    return null;
  }

  function loadDB() {
    let db = null;
    try {
      db = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {}
    if (!db || typeof db !== 'object') db = {};
    db.accounts = { ...DEFAULT_ACCOUNTS, ...(db.accounts || {}) };
    if (!Array.isArray(db.sightings)) db.sightings = [];
    if (!db.photos || typeof db.photos !== 'object') db.photos = {};
    if (!db.comments || typeof db.comments !== 'object') db.comments = {};
    if (!db.likes || typeof db.likes !== 'object') db.likes = {};
    if (!db.nicknames || typeof db.nicknames !== 'object') db.nicknames = {};
    if (!db.publicNames || typeof db.publicNames !== 'object') db.publicNames = {};
    if (!db.videos || typeof db.videos !== 'object') db.videos = {};
    if (!db.relations || typeof db.relations !== 'object') db.relations = {};
    if (!Array.isArray(db.mergeRequests)) db.mergeRequests = [];
    if (!db.privateLocations || typeof db.privateLocations !== 'object') db.privateLocations = {};
    return db;
  }

  function saveDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return true;
    } catch {
      return false;
    }
  }

  function getSession() {
    try {
      const s = localStorage.getItem(SESSION_KEY);
      return s || null;
    } catch {
      return null;
    }
  }

  function setSession(email) {
    try {
      if (email) localStorage.setItem(SESSION_KEY, email);
      else localStorage.removeItem(SESSION_KEY);
    } catch {}
  }

  function jsonResponse(payload, status = 200) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  function makeId(prefix) {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function photoKey(catId, photoId) {
    return `${catId}::${photoId}`;
  }

  function formatPhoto(db, catId, raw, user) {
    const key = photoKey(catId, raw.id);
    const likers = Array.isArray(db.likes[key]) ? db.likes[key] : [];
    const status = raw.status || 'approved';
    return {
      id: raw.id,
      catId,
      image: raw.image,
      caption: raw.caption || '',
      createdAt: raw.createdAt || new Date().toISOString(),
      status,
      shareable: status === 'approved',
      mine: Boolean(user && raw.owner === user),
      liked: Boolean(user && likers.includes(user)),
      likeCount: likers.length,
    };
  }

  function originalPhoto(db, catId, user) {
    const sighting = db.sightings.find((s) => s.id === catId);
    const key = photoKey(catId, 'original');
    const likers = Array.isArray(db.likes[key]) ? db.likes[key] : [];
    const sampleImages = {
      mochi: 'mochi.jpg',
      pudding: 'pudding.jpg',
      shadow: 'shadow.jpg',
      biscuit: 'biscuit.jpg',
    };
    const image = sighting?.image || sampleImages[catId] || null;
    if (!image) return null;
    return {
      id: 'original',
      catId,
      image,
      caption: sighting?.note || '',
      createdAt: sighting?.createdAt || sighting?.observed || '',
      status: 'approved',
      shareable: true,
      mine: Boolean(user && sighting && sighting.owner === user),
      liked: Boolean(user && likers.includes(user)),
      likeCount: likers.length,
    };
  }

  function parseApiPath(input) {
    const rawUrl = typeof input === 'string' ? input : input?.url || '';
    try {
      const url = new URL(rawUrl, location.href);
      const idx = url.pathname.indexOf('/api/');
      if (idx === -1) return null;
      return { apiPath: url.pathname.slice(idx), searchParams: url.searchParams };
    } catch {
      return null;
    }
  }

  async function readBody(options) {
    if (!options?.body) return {};
    try {
      return JSON.parse(typeof options.body === 'string' ? options.body : await new Response(options.body).text());
    } catch {
      return {};
    }
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function demoFetch(input, options = {}) {
    const parsed = parseApiPath(input);
    if (!parsed) return nativeFetch(input, options);

    const { apiPath } = parsed;
    const method = (options.method || (typeof input !== 'string' && input?.method) || 'GET').toUpperCase();
    const db = loadDB();
    const user = getSession();

    // 1. Account status
    if (apiPath === '/api/account' && method === 'GET') {
      if (user && db.accounts[user]) {
        const acc = db.accounts[user];
        return jsonResponse({ available: true, signedIn: true, local: true, email: acc.email || user, username: acc.username || user });
      }
      return jsonResponse({ available: true, signedIn: false, local: true });
    }

    // 2. Auth: Login (by username or email)
    if (apiPath === '/api/auth/login' && method === 'POST') {
      const body = await readBody(options);
      const found = findAccount(db, body.username || body.email);
      const password = String(body.password || '');
      if (!found || found.account.password !== password) {
        return jsonResponse({ error: 'invalid_credentials', message: 'Invalid username/email or password.' }, 401);
      }
      setSession(found.key);
      return jsonResponse({ ok: true, email: found.account.email, username: found.account.username || found.key });
    }

    // 3. Auth: Register (requires unique username + email)
    if (apiPath === '/api/auth/register' && method === 'POST') {
      const body = await readBody(options);
      const email = String(body.email || '').trim().toLowerCase();
      const username = String(body.username || '').trim() || email.split('@')[0];
      const password = String(body.password || '');
      if (!email) return jsonResponse({ error: 'invalid_email', message: 'Enter a valid email.' }, 400);
      if (username.length < 2 || username.length > 32) {
        return jsonResponse({ error: 'invalid_username', message: 'Username must be 2 to 32 characters.' }, 400);
      }
      if (password.length < 4 || password.length > 128) {
        return jsonResponse({ error: 'invalid_password', message: 'Password must be between 4 and 128 characters.' }, 400);
      }
      if (findAccount(db, email) || findAccount(db, username)) {
        return jsonResponse({ error: 'registration_unavailable', message: 'This email or username already exists.' }, 409);
      }
      const key = username.toLowerCase();
      const recoveryCode = 'MM-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      db.accounts[key] = { email, username, password, recoveryCode };
      saveDB(db);
      setSession(key);
      return jsonResponse({ ok: true, email, username, recoveryCode });
    }

    // 4. Auth: Reset password
    if (apiPath === '/api/auth/reset' && method === 'POST') {
      const body = await readBody(options);
      const found = findAccount(db, body.email || body.username);
      const recoveryCode = String(body.recoveryCode || '').trim();
      const password = String(body.password || '');
      if (!found || found.account.recoveryCode !== recoveryCode) {
        return jsonResponse({ error: 'invalid_recovery', message: 'Invalid account or recovery code.' }, 401);
      }
      found.account.password = password;
      saveDB(db);
      setSession(found.key);
      return jsonResponse({ ok: true, email: found.account.email, username: found.account.username || found.key });
    }

    // 5. Auth: Logout
    if (apiPath === '/api/auth/logout' && method === 'POST') {
      setSession(null);
      return jsonResponse({ ok: true });
    }

    // 6. Sightings list (hide merged source cats)
    if (apiPath === '/api/sightings' && method === 'GET') {
      const active = db.sightings.filter((s) => !s.mergedIntoCatId);
      return jsonResponse({ sightings: active });
    }

    // 7. Create sighting (supports guest upload + pet fuzzy location)
    if (apiPath === '/api/sightings' && method === 'POST') {
      const body = await readBody(options);
      const name = String(body.name || '').trim();
      if (!name) return jsonResponse({ error: 'invalid_name', message: 'Please enter the cat name.' }, 400);
      if (!body.image) return jsonResponse({ error: 'need_photo', message: 'Please attach a cat photo.' }, 400);
      const category = body.category || 'stray';
      const hideLocation = Boolean(category === 'pet' && body.hideLocation);
      const rawLat = Number(body.lat);
      const rawLng = Number(body.lng);
      const hasCoords = Number.isFinite(rawLat) && Number.isFinite(rawLng);
      const pubCoords = hasCoords && hideLocation ? fuzzCoordinate(rawLat, rawLng) : { lat: rawLat, lng: rawLng };
      const id = makeId('cat');
      const acc = user ? db.accounts[user] : null;
      const sighting = {
        id,
        name,
        category,
        city: String(body.city || '').trim(),
        location: String(body.location || '').trim(),
        ageMonths: body.ageMonths ?? null,
        gender: body.gender || 'unknown',
        observed: body.observed || new Date().toISOString().slice(0, 10),
        note: String(body.note || '').trim(),
        image: body.image || '',
        lat: hasCoords ? pubCoords.lat : 3.139,
        lng: hasCoords ? pubCoords.lng : 101.6869,
        x: body.x,
        y: body.y,
        status: 'approved',
        owner: user || null,
        creatorName: acc ? (acc.username || user) : null,
        guestName: user ? null : (String(body.guestName || '').trim() || 'Anonymous'),
        isLocationHidden: hideLocation,
        createdAt: new Date().toISOString(),
      };
      if (hideLocation && hasCoords && user) {
        db.privateLocations[id] = { creatorId: user, exactLat: rawLat, exactLng: rawLng };
      }
      db.sightings.unshift(sighting);
      if (!saveDB(db)) {
        db.sightings.shift();
        return jsonResponse({ error: 'storage_full', message: 'Browser storage is full. Try a smaller photo or clear old demo data.' }, 507);
      }
      return jsonResponse({ sighting }, 201);
    }

    // 8. My sightings
    if (apiPath === '/api/sightings/mine' && method === 'GET') {
      if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
      const mine = db.sightings.filter((s) => s.owner === user);
      return jsonResponse({ sightings: mine });
    }

    // 9. My collection
    if (apiPath === '/api/collection' && method === 'GET') {
      if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
      const cats = [];
      for (const [catId, list] of Object.entries(db.photos)) {
        const userPhotos = (list || []).filter((p) => p.owner === user);
        if (userPhotos.length) {
          cats.push({
            catId,
            photoCount: userPhotos.length,
            latestPhoto: { image: userPhotos[0].image },
            nickname: db.nicknames[`${user}::${catId}`] || null,
          });
        }
      }
      return jsonResponse({ cats, cursor: null });
    }

    // 10. Cat nickname: PUT /api/cats/:catId/nickname
    const nickMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/nickname$/);
    if (nickMatch && method === 'PUT') {
      if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
      const catId = decodeURIComponent(nickMatch[1]);
      const body = await readBody(options);
      const nickname = body.nickname ? String(body.nickname).trim() : null;
      const key = `${user}::${catId}`;
      if (nickname) db.nicknames[key] = nickname;
      else delete db.nicknames[key];
      saveDB(db);
      return jsonResponse({ nickname });
    }

    // 11. Cat gallery: GET/POST /api/cats/:catId/photos
    const galleryMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/photos$/);
    if (galleryMatch) {
      const catId = decodeURIComponent(galleryMatch[1]);
      if (method === 'GET') {
        const list = Array.isArray(db.photos[catId]) ? db.photos[catId] : [];
        const formatted = list.map((p) => formatPhoto(db, catId, p, user));
        const photos = formatted.filter((p) => p.shareable);
        const myPhotos = user ? formatted.filter((p) => p.mine) : [];
        const nickname = user ? db.nicknames[`${user}::${catId}`] || null : null;
        return jsonResponse({
          original: originalPhoto(db, catId, user),
          nickname,
          photos,
          myPhotos,
          photosCursor: null,
          myPhotosCursor: null,
        });
      }
      if (method === 'POST') {
        if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
        const body = await readBody(options);
        const raw = {
          id: makeId('photo'),
          image: body.image || '',
          caption: String(body.caption || '').trim(),
          status: body.share ? 'approved' : 'private',
          owner: user,
          createdAt: new Date().toISOString(),
        };
        if (!Array.isArray(db.photos[catId])) db.photos[catId] = [];
        db.photos[catId].unshift(raw);
        if (!saveDB(db)) {
          db.photos[catId].shift();
          return jsonResponse({ error: 'storage_full', message: 'Browser storage is full. Try a smaller photo.' }, 507);
        }
        return jsonResponse({ photo: formatPhoto(db, catId, raw, user) }, 201);
      }
    }

    // 12. Photo detail / like / share / comments
    const photoMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/photos\/([^/]+)(?:\/(like|share|comments))?$/);
    if (photoMatch) {
      const catId = decodeURIComponent(photoMatch[1]);
      const photoId = decodeURIComponent(photoMatch[2]);
      const action = photoMatch[3] || '';
      const list = Array.isArray(db.photos[catId]) ? db.photos[catId] : [];
      const raw = photoId === 'original' ? null : list.find((p) => p.id === photoId);
      const getPhotoObj = () => (photoId === 'original' ? originalPhoto(db, catId, user) : raw ? formatPhoto(db, catId, raw, user) : null);

      if (!action && method === 'GET') {
        const photo = getPhotoObj();
        if (!photo) return jsonResponse({ error: 'not_found' }, 404);
        const key = photoKey(catId, photoId);
        const comments = (db.comments[key] || []).map((c) => ({
          id: c.id,
          text: c.text,
          createdAt: c.createdAt,
          status: 'approved',
          mine: Boolean(user && c.owner === user),
        }));
        return jsonResponse({ photo, comments });
      }

      if (action === 'like' && method === 'PUT') {
        if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
        const body = await readBody(options);
        const key = photoKey(catId, photoId);
        const set = new Set(Array.isArray(db.likes[key]) ? db.likes[key] : []);
        if (body.liked) set.add(user);
        else set.delete(user);
        db.likes[key] = [...set];
        saveDB(db);
        return jsonResponse({ liked: set.has(user), likeCount: set.size });
      }

      if (action === 'share' && method === 'POST') {
        if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
        if (!raw || raw.owner !== user) return jsonResponse({ error: 'not_found' }, 404);
        raw.status = 'approved';
        saveDB(db);
        return jsonResponse({ photo: formatPhoto(db, catId, raw, user) });
      }

      if (action === 'comments' && method === 'POST') {
        if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
        const body = await readBody(options);
        const text = String(body.text || '').trim();
        if (!text) return jsonResponse({ error: 'invalid_comment' }, 400);
        const key = photoKey(catId, photoId);
        if (!Array.isArray(db.comments[key])) db.comments[key] = [];
        const entry = { id: makeId('cmt'), text, owner: user, createdAt: new Date().toISOString() };
        db.comments[key].push(entry);
        saveDB(db);
        return jsonResponse({
          comment: { id: entry.id, text: entry.text, createdAt: entry.createdAt, status: 'approved', mine: true },
        }, 201);
      }
    }

    // 13. SPEC: Cat extended profile data (public names, relations, videos, timeline, merge requests)
    const specMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/spec$/);
    if (specMatch && method === 'GET') {
      const catId = decodeURIComponent(specMatch[1]);
      const sighting = db.sightings.find((s) => s.id === catId);
      const isPet = sighting?.category === 'pet';
      const isOwner = Boolean(user && sighting && sighting.owner === user);
      const creatorLabel = sighting
        ? (sighting.creatorName ? '@' + sighting.creatorName : (sighting.owner ? '@' + sighting.owner : (sighting.guestName || 'Anonymous')))
        : '@ManaMeow';
      const publicNames = Array.isArray(db.publicNames[catId]) ? db.publicNames[catId] : [];
      const videos = Array.isArray(db.videos[catId]) ? db.videos[catId] : [];
      const userRel = user ? (db.relations[user] || { favorite: [], following: [] }) : { favorite: [], following: [] };
      const photos = (Array.isArray(db.photos[catId]) ? db.photos[catId] : []).filter((p) => (p.status || 'approved') === 'approved');
      const orig = originalPhoto(db, catId, user);
      const timeline = [
        ...(orig ? [{ id: 'orig', type: 'sighting', mediaUrl: orig.image, caption: orig.caption || 'First discovered', uploader: creatorLabel, createdAt: orig.createdAt || '' }] : []),
        ...photos.map((p) => ({ id: p.id, type: 'photo', mediaUrl: p.image, caption: p.caption || '', uploader: p.owner ? '@' + p.owner : 'Anonymous', createdAt: p.createdAt || '' })),
        ...videos.map((v) => ({ id: v.id, type: 'video', mediaUrl: v.url, caption: v.caption || '', uploader: v.owner ? '@' + v.owner : (v.guestName || 'Anonymous'), createdAt: v.createdAt || '' })),
      ].sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0));
      const mergeRequests = db.mergeRequests.filter((r) => r.status === 'pending' && (r.targetCatId === catId || r.sourceCatId === catId));
      return jsonResponse({
        catId,
        isPet,
        isOwner,
        isLocationHidden: Boolean(sighting?.isLocationHidden),
        creatorLabel,
        publicNames,
        relations: {
          favorite: userRel.favorite.includes(catId),
          following: userRel.following.includes(catId),
        },
        videos,
        timeline,
        mergeRequests,
      });
    }

    // 14. SPEC: Public multi-names (3-5 slots)
    const pubNameMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/public-names(?:\/([^/]+))?$/);
    if (pubNameMatch) {
      const catId = decodeURIComponent(pubNameMatch[1]);
      const nameId = pubNameMatch[2] ? decodeURIComponent(pubNameMatch[2]) : null;
      const sighting = db.sightings.find((s) => s.id === catId);
      const isPet = sighting?.category === 'pet';
      const isOwner = Boolean(user && sighting && sighting.owner === user);

      if (method === 'POST') {
        if (!user) return jsonResponse({ error: 'sign_in_required', message: 'Please log in to add a name.' }, 401);
        if (isPet && !isOwner) return jsonResponse({ error: 'forbidden', message: 'Only the pet owner can edit public names.' }, 403);
        const body = await readBody(options);
        const name = String(body.name || '').trim();
        if (!name || name.length > 40) return jsonResponse({ error: 'invalid_name', message: 'Enter a name (1–40 chars).' }, 400);
        if (!Array.isArray(db.publicNames[catId])) db.publicNames[catId] = [];
        if (db.publicNames[catId].length >= 5) return jsonResponse({ error: 'limit_reached', message: 'Maximum 5 public names reached.' }, 400);
        if (db.publicNames[catId].some((n) => n.name.toLowerCase() === name.toLowerCase())) {
          return jsonResponse({ error: 'duplicate', message: 'This name already exists.' }, 409);
        }
        const entry = { id: makeId('name'), name, createdBy: user, createdAt: new Date().toISOString() };
        db.publicNames[catId].push(entry);
        saveDB(db);
        return jsonResponse({ publicNames: db.publicNames[catId] }, 201);
      }
      if (method === 'DELETE' && nameId) {
        if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
        const list = Array.isArray(db.publicNames[catId]) ? db.publicNames[catId] : [];
        const target = list.find((n) => n.id === nameId);
        if (!target) return jsonResponse({ error: 'not_found' }, 404);
        if (isPet && !isOwner) return jsonResponse({ error: 'forbidden' }, 403);
        if (!isOwner && target.createdBy !== user) return jsonResponse({ error: 'forbidden' }, 403);
        db.publicNames[catId] = list.filter((n) => n.id !== nameId);
        saveDB(db);
        return jsonResponse({ publicNames: db.publicNames[catId] });
      }
    }

    // 15. SPEC: Favorite / Following toggle
    const relMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/relation$/);
    if (relMatch && method === 'PUT') {
      if (!user) return jsonResponse({ error: 'sign_in_required', message: 'Please log in first.' }, 401);
      const catId = decodeURIComponent(relMatch[1]);
      const body = await readBody(options);
      const type = body.type === 'following' ? 'following' : 'favorite';
      if (!db.relations[user]) db.relations[user] = { favorite: [], following: [] };
      const set = new Set(db.relations[user][type]);
      if (body.active) set.add(catId);
      else set.delete(catId);
      db.relations[user][type] = [...set];
      saveDB(db);
      return jsonResponse({
        favorite: db.relations[user].favorite.includes(catId),
        following: db.relations[user].following.includes(catId),
      });
    }

    // 16. SPEC: Videos upload
    const vidMatch = apiPath.match(/^\/api\/cats\/([^/]+)\/videos$/);
    if (vidMatch && method === 'POST') {
      const catId = decodeURIComponent(vidMatch[1]);
      const body = await readBody(options);
      if (!body.url) return jsonResponse({ error: 'invalid_video', message: 'Please choose a video.' }, 400);
      if (!Array.isArray(db.videos[catId])) db.videos[catId] = [];
      const entry = {
        id: makeId('vid'),
        url: body.url,
        caption: String(body.caption || '').trim(),
        owner: user || null,
        guestName: user ? null : 'Anonymous',
        createdAt: new Date().toISOString(),
      };
      db.videos[catId].unshift(entry);
      if (!saveDB(db)) {
        db.videos[catId].shift();
        return jsonResponse({ error: 'storage_full', message: 'Video too large for local demo storage (try a short clip < 2MB).' }, 507);
      }
      return jsonResponse({ video: entry }, 201);
    }

    // 17. SPEC: Account Pawprints Library (Favorites, Following, Discovered, Pending Merges)
    if (apiPath === '/api/account/pawprints' && method === 'GET') {
      if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
      const userRel = db.relations[user] || { favorite: [], following: [] };
      const discovered = db.sightings.filter((s) => s.owner === user && !s.mergedIntoCatId);
      const pendingMerges = db.mergeRequests.filter((r) => r.status === 'pending');
      return jsonResponse({
        favorites: userRel.favorite,
        following: userRel.following,
        discovered,
        pendingMerges,
      });
    }

    // 18. SPEC: Duplicate Cat Merge Requests (Two-party mutual consent)
    if (apiPath === '/api/merge-requests' && method === 'POST') {
      if (!user) return jsonResponse({ error: 'sign_in_required', message: 'Please log in to request a merge.' }, 401);
      const body = await readBody(options);
      const targetCatId = String(body.targetCatId || '').trim();
      const sourceCatId = String(body.sourceCatId || '').trim();
      if (!targetCatId || !sourceCatId || targetCatId === sourceCatId) {
        return jsonResponse({ error: 'invalid_merge', message: 'Select two different cats.' }, 400);
      }
      const targetCat = db.sightings.find((s) => s.id === targetCatId);
      const sourceCat = db.sightings.find((s) => s.id === sourceCatId);
      const req = {
        id: makeId('merge'),
        targetCatId,
        sourceCatId,
        targetName: body.targetName || targetCat?.name || targetCatId,
        sourceName: body.sourceName || sourceCat?.name || sourceCatId,
        targetCreator: targetCat?.owner || null,
        sourceCreator: sourceCat?.owner || null,
        requestedBy: user,
        targetApproved: Boolean(targetCat?.owner === user),
        sourceApproved: Boolean(sourceCat?.owner === user),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      db.mergeRequests.unshift(req);
      saveDB(db);
      return jsonResponse({ request: req }, 201);
    }

    const mergeConfirmMatch = apiPath.match(/^\/api\/merge-requests\/([^/]+)\/confirm$/);
    if (mergeConfirmMatch && method === 'POST') {
      if (!user) return jsonResponse({ error: 'sign_in_required' }, 401);
      const reqId = decodeURIComponent(mergeConfirmMatch[1]);
      const body = await readBody(options);
      const req = db.mergeRequests.find((r) => r.id === reqId);
      if (!req) return jsonResponse({ error: 'not_found' }, 404);
      if (body.approve === false) {
        req.status = 'rejected';
        saveDB(db);
        return jsonResponse({ request: req });
      }
      // In demo mode, allow approving the side matching current user, or if a cat has no owner (sample/guest), allow approving that side
      if (!req.targetApproved && (!req.targetCreator || req.targetCreator === user)) req.targetApproved = true;
      if (!req.sourceApproved && (!req.sourceCreator || req.sourceCreator === user)) req.sourceApproved = true;
      if (req.targetApproved && req.sourceApproved) {
        // Execute merge: move photos, videos, public names from source -> target
        if (Array.isArray(db.photos[req.sourceCatId])) {
          db.photos[req.targetCatId] = [...(db.photos[req.targetCatId] || []), ...db.photos[req.sourceCatId]];
        }
        if (Array.isArray(db.videos[req.sourceCatId])) {
          db.videos[req.targetCatId] = [...(db.videos[req.targetCatId] || []), ...db.videos[req.sourceCatId]];
        }
        if (Array.isArray(db.publicNames[req.sourceCatId])) {
          const cur = db.publicNames[req.targetCatId] || [];
          for (const n of db.publicNames[req.sourceCatId]) {
            if (cur.length < 5 && !cur.some((x) => x.name.toLowerCase() === n.name.toLowerCase())) cur.push(n);
          }
          db.publicNames[req.targetCatId] = cur;
        }
        const src = db.sightings.find((s) => s.id === req.sourceCatId);
        if (src) src.mergedIntoCatId = req.targetCatId;
        req.status = 'merged';
      }
      saveDB(db);
      return jsonResponse({ request: req });
    }

    return jsonResponse({ error: 'not_found' }, 404);
  };
})();
