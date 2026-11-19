(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const tileTime = value => Date.parse(value) || 0;
  const galleryRoute = catId => './api/cats/' + encodeURIComponent(catId) + '/photos';
  const photoRoute = (catId, photoId) => galleryRoute(catId) + '/' + encodeURIComponent(photoId);

  function element(tag, className = '', text = '') {
    const result = document.createElement(tag);
    if (className) result.className = className;
    if (text) result.textContent = text;
    return result;
  }

  function json(method, fields) {
    return {method, headers:{Accept:'application/json', 'Content-Type':'application/json'}, body:JSON.stringify(fields)};
  }

  window.createManaProfiles = function createManaProfiles({
    t, getLang, getAccount, waitForAccount, requestLogin, request, encodePhoto, sampleNote, toast
  }) {
    const profileDialog = $('#cat-dialog');
    const photoDialog = $('#photo-dialog');
    const nicknameForm = $('#nickname-form');
    const nicknameButton = $('#edit-nickname');
    const nicknameSave = nicknameForm.querySelector('button[type=submit]');
    const commentForm = $('#comment-form');
    const commentSend = commentForm.querySelector('button[type=submit]');
    const likeButton = $('#photo-like');
    const postButton = $('#photo-post');
    const shareFallback = $('#photo-copy-link');
    const photoImage = $('#viewer-image');
    const catchButton = $('#catch-cat');
    const albums = [
      {name:'mine', photos:'myPhotos', cursor:'myPhotosCursor', list:$('#my-cat-photos'), more:$('#more-my-photos')},
      {name:'community', photos:'photos', cursor:'photosCursor', list:$('#cat-photos'), more:$('#more-community-photos')},
    ];
    let profile = null;
    let viewer = null;
    let accountRevision = 0;
    let dateLocale;
    let dateFormatter;

    function date(value) {
      const lang = getLang();
      if (dateLocale !== lang) {
        dateLocale = lang;
        dateFormatter = new Intl.DateTimeFormat(lang,{dateStyle:'medium', timeZone:'Asia/Kuala_Lumpur'});
      }
      return dateFormatter.format(value);
    }

    function setStatus(selector, key = '', error = false) {
      const status = $(selector);
      status.hidden = !key;
      status.classList.toggle('error', error);
      status.textContent = key ? t(key) : '';
    }

    function setTime(target, value) {
      const timestamp = tileTime(value);
      target.hidden = !timestamp;
      target.textContent = timestamp ? date(timestamp) : '';
      if (timestamp) target.dateTime = value;
      else target.removeAttribute('datetime');
      return target.textContent;
    }

    function setNicknameForm(open, value = '') {
      nicknameForm.hidden = !open;
      nicknameButton.setAttribute('aria-expanded', String(open));
      if (open) {
        nicknameForm.elements.nickname.value = value;
        nicknameForm.elements.nickname.focus();
      } else nicknameForm.reset();
    }

    function profileAge(ageMonths) {
      if (!Number.isInteger(ageMonths) || ageMonths < 0) return t('unknown');
      const part = (value, unit) => new Intl.NumberFormat(getLang(), {style:'unit', unit, unitDisplay:'long'}).format(value);
      const years = Math.floor(ageMonths / 12);
      const months = ageMonths % 12;
      return years ? [part(years, 'year'), months ? part(months, 'month') : ''].filter(Boolean).join(' ') : part(months, 'month');
    }

    function originalFallback(cat) {
      return cat.image ? {id:'original', catId:cat.id, image:cat.image, createdAt:cat.createdAt || cat.observed} : null;
    }

    function renderProfile(current) {
      const {cat, gallery} = current;
      const avatar = $('#cat-image');
      avatar.hidden = !cat.image;
      $('#cat-avatar').disabled = !gallery.original?.image;
      $('#cat-avatar-fallback').hidden = !!cat.image;
      if (cat.image) avatar.src = cat.image;
      else avatar.removeAttribute('src');
      $('#cat-category').className = 'badge ' + cat.category;
      $('#cat-category').hidden = !cat.category;
      $('#cat-category').textContent = cat.category ? t(cat.category) : '';
      $('#cat-title').textContent = cat.name;
      const nickname = getAccount().signedIn ? gallery.nickname : '';
      $('#cat-nickname').textContent = nickname || '';
      $('#cat-nickname').hidden = !nickname;
      $('#cat-age').textContent = profileAge(cat.ageMonths);
      $('#cat-gender').textContent = t(cat.gender || 'unknown');
      const location = $('#cat-location');
      location.textContent = [cat.location, cat.city].filter(Boolean).join(' · ');
      location.hidden = !location.textContent;
      const note = $('#cat-note');
      note.textContent = sampleNote(cat) || cat.note || '';
      note.hidden = !note.textContent;
      const observed = $('#cat-date');
      observed.textContent = tileTime(cat.observed) ? t('spotted') + ' · ' + date(tileTime(cat.observed)) : '';
      observed.hidden = !observed.textContent;
      $('#cat-demo').hidden = !cat.sample;
    }

    function visibilityLabel(entry) {
      if (entry.status === 'private') return t('privatePhoto');
      if (entry.status === 'pending') return t('pending');
      if (entry.status === 'rejected') return t('rejected');
      return entry.shareable ? t('publishedPhoto') : '';
    }

    function renderTiles(list, cat, photos, personal) {
      const entries = photos.filter(entry => entry?.image).sort((a,b) => tileTime(b.createdAt) - tileTime(a.createdAt));
      list.replaceChildren(...entries.map(entry => {
        const tile = element('button','photo-tile');
        tile.type = 'button';
        tile.dataset.photoId = entry.id;
        const thumbnail = element('img');
        thumbnail.src = entry.image;
        thumbnail.alt = '';
        thumbnail.loading = 'lazy';
        thumbnail.decoding = 'async';
        thumbnail.width = thumbnail.height = 180;
        tile.append(thumbnail);
        const status = personal ? visibilityLabel(entry) : '';
        if (status) tile.append(element('span','photo-visibility',status));
        const dateLabel = tileTime(entry.createdAt) ? date(tileTime(entry.createdAt)) : '';
        tile.setAttribute('aria-label', [t('viewProfilePhoto'), cat.name, entry.caption, dateLabel, status].filter(Boolean).join(' · '));
        tile.addEventListener('click', () => openViewer(cat,entry,{origin:tile}));
        const item = element('li');
        item.append(tile);
        return item;
      }));
      return entries.length;
    }

    function renderAlbums(current) {
      const {cat, gallery} = current;
      const signedIn = getAccount().signedIn;
      const own = signedIn ? gallery.myPhotos.filter(photo => photo.id !== 'original') : [];
      const ownIds = new Set(own.map(photo => photo.id));
      const community = gallery.photos.filter(photo => photo.id !== 'original' && !photo.mine && photo.shareable && !ownIds.has(photo.id));
      if (gallery.original) {
        if (gallery.original.mine && signedIn) own.push(gallery.original);
        else community.push(gallery.original);
      }
      const ownCount = renderTiles($('#my-cat-photos'),cat,own,true);
      const communityCount = renderTiles($('#cat-photos'),cat,community,false);
      const ownEmpty = $('#my-cat-photos-empty');
      ownEmpty.hidden = Boolean(ownCount) || current.loading;
      ownEmpty.textContent = t(signedIn ? 'collectionEmpty' : 'collectionGuest');
      $('#cat-photos-empty').hidden = Boolean(communityCount) || current.loading;
      renderAlbumButtons(current);
    }

    function renderAlbumButtons(current) {
      for (const album of albums) {
        const paging = current.paging.has(album.name);
        const allowed = album.name !== 'mine' || getAccount().signedIn;
        album.more.hidden = !allowed || !current.gallery[album.cursor];
        album.more.setAttribute('aria-busy',String(paging));
        album.more.setAttribute('aria-disabled',String(Boolean(current.loading || paging)));
      }
    }

    function newPhotos(photos, known = new Set()) {
      return photos.filter(photo => {
        if (!photo?.id || photo.id === 'original' || known.has(photo.id)) return false;
        known.add(photo.id);
        return true;
      });
    }

    function readCursor(value) {
      return typeof value === 'string' && value ? value : null;
    }

    async function loadGallery(current) {
      const version = ++current.version;
      current.loading = true;
      current.paging.clear();
      renderAlbumButtons(current);
      const result = await request(galleryRoute(current.cat.id));
      if (profile !== current || current.version !== version || !profileDialog.open) return;
      current.loading = false;
      if (result?.ok) {
        const gallery = result.payload;
        current.gallery = {
          original: gallery.original || originalFallback(current.cat),
          nickname: gallery.nickname,
          photos: Array.isArray(gallery.photos) ? newPhotos(gallery.photos) : [],
          myPhotos: Array.isArray(gallery.myPhotos) && getAccount().signedIn ? newPhotos(gallery.myPhotos) : [],
          photosCursor: readCursor(gallery.photosCursor),
          myPhotosCursor: getAccount().signedIn ? readCursor(gallery.myPhotosCursor) : null,
        };
      }
      renderProfile(current);
      renderAlbums(current);
    }

    function openProfile(cat, {directLink} = {}) {
      const current = {cat, directLink, version:0, loading:true, paging:new Set(), gallery:{original:originalFallback(cat), photos:[], myPhotos:[]}};
      profile = current;
      nicknameSave.disabled = false;
      setNicknameForm(false);
      setStatus('#profile-status');
      renderProfile(current);
      renderAlbums(current);
      if (!profileDialog.open) profileDialog.showModal();
      loadGallery(current);
    }

    async function loadMore(album) {
      const current = profile;
      const cursor = current?.gallery[album.cursor];
      if (!cursor || current.loading || current.paging.has(album.name)) return;
      if (album.name === 'mine' && !getAccount().signedIn) return;
      const version = current.version;
      current.paging.add(album.name);
      renderAlbumButtons(current);
      setStatus('#profile-status');
      const params = new URLSearchParams({album:album.name,cursor});
      const result = await request(galleryRoute(current.cat.id) + '?' + params);
      if (profile !== current || current.version !== version || !profileDialog.open) return;
      current.paging.delete(album.name);
      const page = result?.payload?.[album.photos];
      if (!result?.ok || !Array.isArray(page)) {
        renderAlbumButtons(current);
        if (result?.payload?.error === 'sign_in_required') requestLogin();
        else setStatus('#profile-status','loadPhotosFailed',true);
        return;
      }
      const previous = current.gallery[album.photos];
      const added = newPhotos(page,new Set(previous.map(photo => photo.id)));
      current.gallery[album.photos] = [...previous, ...added];
      const next = readCursor(result.payload[album.cursor]);
      current.gallery[album.cursor] = next === cursor ? null : next;
      const focusWasOnButton = document.activeElement === album.more;
      renderAlbums(current);
      if (album.more.hidden && focusWasOnButton) {
        const firstAdded = [...album.list.querySelectorAll('[data-photo-id]')].find(tile => tile.dataset.photoId === added[0]?.id);
        (firstAdded || catchButton).focus();
      }
    }

    for (const album of albums) album.more.addEventListener('click', () => loadMore(album));

    function renderComments(comments) {
      const items = comments.map(comment => {
        const item = element('li','photo-comment');
        const heading = element('header');
        const timestamp = element('time','fine');
        setTime(timestamp,comment.createdAt);
        heading.append(element('strong','',t(comment.mine ? 'commentYou' : 'commentGuest')),timestamp);
        if (comment.status === 'pending') heading.append(element('span','photo-visibility',t('pending')));
        item.append(heading,element('p','',comment.text));
        return item;
      });
      $('#photo-comments').replaceChildren(...items);
      $('#photo-comments-empty').hidden = Boolean(items.length);
    }

    function renderViewer(current) {
      const {cat, entry, busy, loading} = current;
      if (photoImage.getAttribute('src') !== entry.image) photoImage.src = entry.image;
      photoImage.alt = cat.name;
      $('#photo-title').textContent = cat.name;
      const caption = $('#viewer-caption');
      caption.textContent = entry.caption || '';
      caption.hidden = !caption.textContent;
      setTime($('#viewer-date'),entry.createdAt);
      const status = $('#viewer-visibility');
      status.textContent = entry.mine ? visibilityLabel(entry) : '';
      status.hidden = !status.textContent;
      const isPublic = Boolean(entry.shareable && !loading);
      likeButton.hidden = !isPublic;
      likeButton.disabled = busy.has('like');
      likeButton.setAttribute('aria-pressed',String(Boolean(entry.liked)));
      $('#photo-like-count').textContent = new Intl.NumberFormat(getLang()).format(entry.likeCount || 0);
      $('#photo-share').hidden = !isPublic;
      postButton.hidden = !(entry.mine && entry.status === 'private' && !loading);
      postButton.disabled = busy.has('post');
      $('#photo-discussion').hidden = !isPublic;
      commentForm.hidden = !isPublic || !getAccount().signedIn;
      commentSend.disabled = busy.has('comment');
      $('#comment-login').hidden = !isPublic || Boolean(getAccount().signedIn);
      renderComments(current.comments);
      if (current.focusComment && !commentForm.hidden && photoDialog.open) {
        current.focusComment = false;
        commentForm.elements.comment.focus();
      }
    }

    async function loadViewer(current) {
      const version = ++current.version;
      current.loading = true;
      renderViewer(current);
      const result = await request(photoRoute(current.cat.id,current.entry.id));
      if (viewer !== current || current.version !== version || !photoDialog.open) return;
      current.loading = false;
      if (result?.ok) {
        current.entry = result.payload.photo;
        current.comments = Array.isArray(result.payload.comments) ? result.payload.comments : [];
      } else {
        // Never leave guest controls enabled when the server cannot confirm visibility.
        current.entry = {...current.entry, shareable:false};
        if (current.entry.id !== 'original') setStatus('#photo-view-status','photoUnavailable',true);
      }
      renderViewer(current);
    }

    function openViewer(cat, entry, {origin, details, directLink} = {}) {
      viewer = {
        cat, entry, origin, directLink, version:0, busy:new Set(),
        loading:!details, comments:details?.comments || [],
      };
      setStatus('#photo-view-status');
      shareFallback.hidden = true;
      shareFallback.querySelector('input').value = '';
      commentForm.reset();
      renderViewer(viewer);
      if (!photoDialog.open) photoDialog.showModal();
      if (!details) loadViewer(viewer);
    }

    function viewStillOpen(current) {
      return viewer === current && photoDialog.open;
    }

    async function requireSession(isCurrent, onError, onSuccess) {
      await waitForAccount();
      if (!isCurrent()) return false;
      const account = getAccount();
      if (account.signedIn) return true;
      if (account.available) requestLogin(onSuccess);
      else onError('photoOffline');
      return false;
    }

    function failedMutation(result, error) {
      if (result?.payload?.error === 'sign_in_required') requestLogin();
      else error('photoActionFailed');
    }

    async function modifyViewer(kind, modify) {
      const current = viewer;
      if (!current || current.loading || current.busy.has(kind)) return;
      const revision = accountRevision;
      const isCurrent = () => viewStillOpen(current) && revision === accountRevision;
      const feedback = key => setStatus('#photo-view-status',key,true);
      current.busy.add(kind);
      renderViewer(current);
      setStatus('#photo-view-status');
      try {
        if (!await requireSession(() => viewStillOpen(current),feedback) || !isCurrent() || current.loading) return;
        await modify(current, isCurrent, feedback);
      } finally {
        if (revision === accountRevision) {
          current.busy.delete(kind);
          if (isCurrent()) renderViewer(current);
        }
      }
    }

    likeButton.addEventListener('click', () => modifyViewer('like', async (current,isCurrent,feedback) => {
      if (!current.entry.shareable) return;
      const result = await request(photoRoute(current.cat.id,current.entry.id) + '/like', json('PUT',{liked:!current.entry.liked}));
      if (!isCurrent()) return;
      if (!result?.ok) return failedMutation(result,feedback);
      current.entry = {...current.entry, liked:result.payload.liked, likeCount:result.payload.likeCount};
    }));

    postButton.addEventListener('click', () => modifyViewer('post', async (current,isCurrent,feedback) => {
      if (!current.entry.mine || current.entry.status !== 'private') return;
      const result = await request(photoRoute(current.cat.id,current.entry.id) + '/share', {method:'POST'});
      if (!result?.ok) {
        if (isCurrent()) failedMutation(result,feedback);
        return;
      }
      if (profile?.cat.id === current.cat.id) loadGallery(profile);
      if (!isCurrent()) return;
      current.entry = result.payload.photo;
      setStatus('#photo-view-status','photoSubmitted');
    }));

    commentForm.addEventListener('submit', event => {
      event.preventDefault();
      const text = commentForm.elements.comment.value.trim();
      if (!text) return;
      modifyViewer('comment', async (current,isCurrent,feedback) => {
        if (!current.entry.shareable) return;
        const result = await request(photoRoute(current.cat.id,current.entry.id) + '/comments', json('POST',{text}));
        if (!isCurrent()) return;
        if (!result?.ok) return failedMutation(result,feedback);
        if (result.payload.comment) current.comments.push(result.payload.comment);
        commentForm.reset();
        setStatus('#photo-view-status','commentSubmitted');
      });
    });
    $('#comment-login').addEventListener('click', async () => {
      const current = viewer;
      if (!current?.entry.shareable) return;
      const isCurrent = () => viewStillOpen(current);
      const focusComposer = () => {
        if (!isCurrent()) return;
        current.focusComment = true;
        renderViewer(current);
      };
      if (await requireSession(isCurrent,key => setStatus('#photo-view-status',key,true),focusComposer)) focusComposer();
    });

    function photoUrl(catId, photoId) {
      const url = new URL(location.pathname,location.origin);
      url.searchParams.set('cat',catId);
      url.searchParams.set('photo',photoId);
      return url.href;
    }

    $('#photo-share').addEventListener('click', async () => {
      const current = viewer;
      if (!current?.entry.shareable) return;
      if (!getAccount().signedIn) {
        const isCurrent = () => viewStillOpen(current);
        const hint = () => { if (isCurrent()) setStatus('#photo-view-status','shareReady'); };
        if (await requireSession(isCurrent,key => setStatus('#photo-view-status',key,true),hint)) hint();
        return;
      }
      setStatus('#photo-view-status');
      const url = photoUrl(current.cat.id,current.entry.id);
      if (typeof navigator.share === 'function') {
        try {
          await navigator.share({title:current.cat.name + ' · ManaMeow',url});
          return;
        } catch (error) {
          if (error.name === 'AbortError') return;
        }
      }
      if (!viewStillOpen(current)) return;
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(url);
        if (viewStillOpen(current)) setStatus('#photo-view-status','sharedLinkCopied');
      } catch {
        if (!viewStillOpen(current)) return;
        const input = shareFallback.querySelector('input');
        input.value = url;
        shareFallback.hidden = false;
        input.focus();
        input.select();
      }
    });

    $('#cat-avatar').addEventListener('click', event => {
      if (profile?.gallery.original) openViewer(profile.cat,profile.gallery.original,{origin:event.currentTarget});
    });

    nicknameButton.addEventListener('click', async () => {
      const current = profile;
      const isCurrent = () => current && profile === current && profileDialog.open;
      if (!await requireSession(isCurrent,key => setStatus('#profile-status',key,true))) return;
      setStatus('#profile-status');
      setNicknameForm(nicknameForm.hidden,current.gallery.nickname || '');
    });

    $('#cancel-nickname').addEventListener('click', () => {
      setNicknameForm(false);
      nicknameButton.focus();
    });

    nicknameForm.addEventListener('submit', async event => {
      event.preventDefault();
      const current = profile;
      if (!current || nicknameSave.disabled) return;
      const nickname = nicknameForm.elements.nickname.value.trim() || null;
      const revision = accountRevision;
      const isCurrent = () => profile === current && profileDialog.open && revision === accountRevision;
      const feedback = key => setStatus('#profile-status',key,true);
      nicknameSave.disabled = true;
      setStatus('#profile-status');
      try {
        if (!await requireSession(isCurrent,feedback)) return;
        const route = './api/cats/' + encodeURIComponent(current.cat.id) + '/nickname';
        const result = await request(route,json('PUT',{nickname}));
        if (!isCurrent()) return;
        if (!result?.ok) return failedMutation(result,feedback);
        current.gallery.nickname = result.payload.nickname;
        renderProfile(current);
        setNicknameForm(false);
        nicknameButton.focus();
        loadGallery(current);
      } finally {
        if (isCurrent()) nicknameSave.disabled = false;
      }
    });

    catchButton.addEventListener('click', async () => {
      const current = profile;
      if (!current) return;
      if (!window.ManaCatch?.open) return setStatus('#profile-status','photoOffline',true);
      const isCurrent = () => profile === current && profileDialog.open;
      const openCamera = () => {
        if (!isCurrent() || !getAccount().signedIn) return;
        setStatus('#profile-status');
        window.ManaCatch.open({
          cat:current.cat, lang:getLang(), encodePhoto,
          isSignedIn:() => Boolean(getAccount().signedIn),
          onAuthRequired:() => requestLogin(),
          onSaved: photo => {
            if (!isCurrent()) return;
            setStatus('#profile-status',photo?.status === 'private' ? 'caughtPrivately' : 'photoSubmitted');
            loadGallery(current);
          },
        });
      };
      if (await requireSession(isCurrent,key => setStatus('#profile-status',key,true),openCamera)) openCamera();
    });

    function clearSharedAddress(current) {
      if (!current?.directLink || location.href !== current.directLink) return;
      const url = new URL(location.href);
      url.searchParams.delete('cat');
      url.searchParams.delete('photo');
      history.replaceState(history.state,'',url);
    }

    photoDialog.addEventListener('close', () => {
      const previous = viewer;
      viewer = null;
      photoImage.removeAttribute('src');
      photoImage.alt = '';
      $('#photo-comments').replaceChildren();
      commentForm.reset();
      shareFallback.querySelector('input').value = '';
      clearSharedAddress(previous);
      if (!profileDialog.open) return;
      const originalTrigger = previous?.origin;
      const replacement = [...profileDialog.querySelectorAll('[data-photo-id]')].find(tile => tile.dataset.photoId === previous?.entry.id);
      (originalTrigger?.isConnected ? originalTrigger : replacement || catchButton).focus({preventScroll:true});
    });

    profileDialog.addEventListener('close', () => {
      if (profileDialog.open) return;
      clearSharedAddress(profile);
      profile = null;
      setNicknameForm(false);
      $('#my-cat-photos').replaceChildren();
      $('#cat-nickname').textContent = '';
    });

    async function loadSharedLink(catId, photoId, href, findCat) {
      let cat = findCat(catId);
      let details;
      if (photoId || !cat) {
        const result = await request(photoRoute(catId,photoId || 'original'));
        if (result?.ok && result.payload.photo?.shareable) {
          details = result.payload;
          cat ||= details.cat;
        }
      }
      if (location.href !== href || document.querySelector('dialog[open]')) return;
      if (photoId && (!details || !cat?.name)) return toast(t('photoUnavailable'));
      if (!cat?.name) return toast(t('profileUnavailable'));
      if (!photoId) {
        openProfile(cat,{directLink:href});
        return;
      }
      openProfile(cat);
      openViewer(cat,details.photo,{details,directLink:href});
    }

    function openSharedLink(findCat) {
      const url = new URL(location.href);
      const catId = url.searchParams.get('cat');
      const photoId = url.searchParams.get('photo');
      if (!/^[a-z0-9-]{1,36}$/.test(catId || '')) return false;
      if (photoId !== null && !/^(original|[a-f0-9-]{36})$/.test(photoId)) return false;
      loadSharedLink(catId,photoId,url.href,findCat);
      return true;
    }

    function accountChanged() {
      accountRevision += 1;
      if (profile && profileDialog.open) {
        const current = profile;
        current.gallery = {original:originalFallback(current.cat), photos:[], myPhotos:[]};
        setNicknameForm(false);
        nicknameSave.disabled = false;
        current.loading = true;
        renderProfile(current);
        renderAlbums(current);
        loadGallery(current);
      }
      if (!viewer || !photoDialog.open) return;
      if (viewer.entry.mine && !viewer.entry.shareable) {
        photoDialog.close();
        return;
      }
      viewer.busy.clear();
      viewer.comments = [];
      commentForm.reset();
      loadViewer(viewer);
    }

    function languageChanged() {
      if (profile) {
        renderProfile(profile);
        renderAlbums(profile);
      }
      if (viewer) renderViewer(viewer);
    }

    return {open:openProfile, openSharedLink, accountChanged, languageChanged};
  };
})();
