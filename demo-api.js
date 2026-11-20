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
    test1: { email: 'test1', password: 'test1', recoveryCode: 'DEMO-TEST1-REC' },
    test2: { email: 'test2', password: 'test2', recoveryCode: 'DEMO-TEST2-REC' },
    test3: { email: 'test3', password: 'test3', recoveryCode: 'DEMO-TEST3-REC' },
    test4: { email: 'test4', password: 'test4', recoveryCode: 'DEMO-TEST4-REC' },
    test5: { email: 'test5', password: 'test5', recoveryCode: 'DEMO-TEST5-REC' },
  };

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
    return db;
  }

  function saveDB(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {}
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
      'sample-mochi': 'mochi.jpg',
      'sample-pudding': 'pudding.jpg',
      'sample-shadow': 'shadow.jpg',
      'sample-biscuit': 'biscuit.jpg',
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
        return jsonResponse({ available: true, signedIn: true, local: true, email: user });
      }
      return jsonResponse({ available: true, signedIn: false, local: true });
    }

    // 2. Auth: Login
    if (apiPath === '/api/auth/login' && method === 'POST') {
      const body = await readBody(options);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const account = db.accounts[email];
      if (!account || account.password !== password) {
        return jsonResponse({ error: 'invalid_credentials', message: 'Invalid username/email or password.' }, 401);
      }
      setSession(email);
      return jsonResponse({ ok: true, email });
    }

    // 3. Auth: Register
    if (apiPath === '/api/auth/register' && method === 'POST') {
      const body = await readBody(options);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!email) return jsonResponse({ error: 'invalid_email', message: 'Enter a valid email or username.' }, 400);
      if (password.length < 4 || password.length > 128) {
        return jsonResponse({ error: 'invalid_password', message: 'Password must be between 4 and 128 characters.' }, 400);
      }
      if (db.accounts[email]) {
        return jsonResponse({ error: 'registration_unavailable', message: 'This account already exists.' }, 409);
      }
      const recoveryCode = 'MM-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      db.accounts[email] = { email, password, recoveryCode };
      saveDB(db);
      setSession(email);
      return jsonResponse({ ok: true, email, recoveryCode });
    }

    // 4. Auth: Reset password
    if (apiPath === '/api/auth/reset' && method === 'POST') {
      const body = await readBody(options);
      const email = String(body.email || '').trim().toLowerCase();
      const recoveryCode = String(body.recoveryCode || '').trim();
      const password = String(body.password || '');
      const account = db.accounts[email];
      if (!account || account.recoveryCode !== recoveryCode) {
        return jsonResponse({ error: 'invalid_recovery', message: 'Invalid account or recovery code.' }, 401);
      }
      account.password = password;
      saveDB(db);
      setSession(email);
      return jsonResponse({ ok: true, email });
    }

    // 5. Auth: Logout
    if (apiPath === '/api/auth/logout' && method === 'POST') {
      setSession(null);
      return jsonResponse({ ok: true });
    }

    // 6. Sightings list
    if (apiPath === '/api/sightings' && method === 'GET') {
      return jsonResponse({ sightings: db.sightings });
    }

    // 7. Create sighting
    if (apiPath === '/api/sightings' && method === 'POST') {
      if (!user) return jsonResponse({ error: 'sign_in_required', message: 'Please log in first.' }, 401);
      const body = await readBody(options);
      const sighting = {
        id: makeId('cat'),
        name: String(body.name || 'Unnamed Cat').trim(),
        category: body.category || 'stray',
        city: String(body.city || '').trim(),
        location: String(body.location || '').trim(),
        ageMonths: body.ageMonths ?? null,
        gender: body.gender || 'unknown',
        observed: body.observed || new Date().toISOString().slice(0, 10),
        note: String(body.note || '').trim(),
        image: body.image || '',
        lat: Number(body.lat),
        lng: Number(body.lng),
        x: body.x,
        y: body.y,
        status: 'approved',
        owner: user,
        createdAt: new Date().toISOString(),
      };
      db.sightings.unshift(sighting);
      saveDB(db);
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
            latestPhoto: userPhotos[0].image,
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
        saveDB(db);
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

    return jsonResponse({ error: 'not_found' }, 404);
  };
})();
