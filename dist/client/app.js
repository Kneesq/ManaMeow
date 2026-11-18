(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };
  const translations = {
    zh: {
      skip:'跳到地图', account:'我的账号', add:'添加猫咪', findCats:'找猫', menu:'菜单', language:'语言',
      mapLabel:'猫咪地图', mapControls:'地图控件', filter:'猫咪分类', pick:'点击地图放置标记。', cancel:'取消',
      stray:'流浪猫', pet:'家猫', cafe:'猫咖', all:'全部', search:'猫名、城市或地点',
      profileDemo:'示例肖像与大概位置。', name:'猫咪名字', nameExample:'例如 Milo', category:'分类', city:'城市或城镇', cityExample:'例如怡保',
      around:'附近的公共地标', placeExample:'例如公园附近', selectPin:'在地图上选点', pinNone:'尚未选择位置', pinSet:'已选好大概位置',
      observed:'目击日期', photo:'照片', photoHelp:'支持 JPG、PNG 和 WebP，最大 10 MB。请上传你有权分享的照片。', note:'补充说明（选填）', noteExample:'有什么特征能帮助别人认出这只猫？', submit:'提交审核', saveDraft:'保存草稿',
      noMatches:'没有符合条件的猫咪。', close:'关闭', zoomIn:'放大', zoomOut:'缩小', resetMap:'重置地图',
      signIn:'使用 ChatGPT 登录', signOut:'退出登录', signPrompt:'登录后可以投稿和查看审核状态。',
      accountOffline:'目前可浏览示例、搜索及保存本机草稿。正式投稿需要连接网站服务。', myIntro:'已登录。你可以跟踪自己的投稿。', noMine:'你还没有投稿。',
      localMode:'本机预览仅支持保存文字和地点草稿。', onlineMode:'记录猫咪出现的大概位置。审核通过后，照片和记录才会出现在地图上。',
      needPin:'请先在地图上选一个大概位置。', useMalaysia:'请选择马来西亚境内的地点。', needPhoto:'请添加猫咪照片。', badPhoto:'请选择小于 10 MB 的有效 JPG、PNG 或 WebP 照片。', failed:'保存失败，请稍后再试。',
      submitted:'投稿成功，等待审核。', draftSaved:'已在本机保存草稿。', pending:'待审核', approved:'已通过', rejected:'未通过', review:'审核投稿', spotted:'目击于', loading:'加载中…'
    },
    ms: {
      skip:'Langkau ke peta', account:'Akaun saya', add:'Tambah kucing', findCats:'Cari kucing', menu:'Menu', language:'Bahasa',
      mapLabel:'Peta penampakan kucing', mapControls:'Kawalan peta', filter:'Kategori kucing', pick:'Ketik peta untuk meletakkan penanda.', cancel:'Batal',
      stray:'Jalanan', pet:'Peliharaan', cafe:'Kafe', all:'Semua', search:'Nama kucing, bandar atau tempat',
      profileDemo:'Gambar ilustrasi dan contoh lokasi anggaran.', name:'Nama kucing', nameExample:'Cth. Milo', category:'Kategori', city:'Bandar', cityExample:'Cth. Ipoh',
      around:'Mercu tanda awam terdekat', placeExample:'Cth. Berhampiran taman', selectPin:'Pilih penanda', pinNone:'Tiada penanda dipilih', pinSet:'Lokasi anggaran dipilih',
      observed:'Tarikh ditemui', photo:'Gambar', photoHelp:'JPG, PNG atau WebP sehingga 10 MB. Pilih gambar yang anda dibenarkan kongsi.', note:'Catatan (pilihan)', noteExample:'Apakah ciri yang membantu orang mengenali kucing ini?', submit:'Hantar untuk semakan', saveDraft:'Simpan draf',
      noMatches:'Tiada padanan.', close:'Tutup', zoomIn:'Zum masuk', zoomOut:'Zum keluar', resetMap:'Tetapkan semula peta',
      signIn:'Log masuk dengan ChatGPT', signOut:'Log keluar', signPrompt:'Log masuk untuk menghantar penampakan dan menyemak status.',
      accountOffline:'Anda boleh melayari contoh, membuat carian dan menyimpan draf pada peranti ini. Penghantaran memerlukan perkhidmatan laman web.', myIntro:'Anda telah log masuk. Pantau kiriman anda di sini.', noMine:'Belum ada kiriman.',
      localMode:'Dalam pratonton setempat, anda boleh menyimpan draf teks dan lokasi sahaja.', onlineMode:'Pilih lokasi anggaran. Gambar dan penampakan muncul pada peta selepas diluluskan.',
      needPin:'Pilih lokasi anggaran pada peta dahulu.', useMalaysia:'Pilih lokasi di Malaysia.', needPhoto:'Sila tambah gambar kucing.', badPhoto:'Pilih fail JPG, PNG atau WebP yang sah dan lebih kecil daripada 10 MB.', failed:'Gagal menyimpan. Cuba lagi.',
      submitted:'Kiriman diterima dan menunggu semakan.', draftSaved:'Draf disimpan pada peranti ini.', pending:'Menunggu', approved:'Diluluskan', rejected:'Ditolak', review:'Semak kiriman', spotted:'Ditemui pada', loading:'Memuatkan…'
    },
    en: {
      close:'Close', zoomIn:'Zoom in', zoomOut:'Zoom out', resetMap:'Reset map view', pinSet:'Approximate pin selected',
      signIn:'Sign in with ChatGPT', signOut:'Sign out', signPrompt:'Sign in to submit sightings and check their status.',
      accountOffline:'You can browse the sample sightings and save a draft to this device. Submissions need a connection to the website service.',
      myIntro:'You’re signed in. Follow your submissions here.', noMine:'You haven’t submitted a sighting yet.', saveDraft:'Save draft',
      localMode:'This local preview can save a text and location draft to this browser.', onlineMode:'Choose an approximate location. Your photo and sighting appear on the map once reviewed.',
      needPin:'Choose an approximate location on the map first.',
      useMalaysia:'Choose a location in Malaysia.', needPhoto:'Add a photo of the cat.', badPhoto:'Choose a valid JPG, PNG or WebP under 10 MB.',
      failed:'Couldn’t save this sighting. Please try again.', submitted:'Sighting sent for review.', draftSaved:'Draft saved on this device.',
      pending:'Pending review', approved:'Approved', rejected:'Rejected', review:'Review submissions', spotted:'Last spotted', loading:'Loading…'
    }
  };
  const labels = {};
  for (const entry of $$('[data-i]')) labels[entry.dataset.i] = entry.textContent;
  for (const entry of $$('[data-label]')) labels[entry.dataset.label] = entry.getAttribute('aria-label');
  for (const entry of $$('[data-placeholder]')) labels[entry.dataset.placeholder] = entry.placeholder;
  const dateFormat = locale => new Intl.DateTimeFormat(locale, { dateStyle:'medium', timeZone:'Asia/Kuala_Lumpur' });
  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem(key); } catch {} }
  };
  const samples = [
    { id:'mochi', name:'Mochi', category:'stray', city:'Kuala Lumpur', location:'Perdana Botanical Garden area', lat:3.14, lng:101.68, image:'mochi.jpg', observed:'2026-11-16', note:'An orange tabby who likes to nap in the shade. You can spot a little white patch under the chin.' },
    { id:'pudding', name:'Pudding', category:'cafe', city:'George Town, Penang', location:'George Town heritage district', lat:5.42, lng:100.33, image:'pudding.jpg', observed:'2026-11-14', note:'A fluffy cream café cat with amber eyes. She likes to watch the street from the window.' },
    { id:'shadow', name:'Shadow', category:'stray', city:'Johor Bahru', location:'Dataran Bandaraya area', lat:1.46, lng:103.74, image:'shadow.jpg', observed:'2026-11-12', note:'A quiet charcoal cat often seen sitting close to the hedges. Give him a little space if you spot him.' },
    { id:'biscuit', name:'Biscuit', category:'pet', city:'Petaling Jaya', location:'Taman Jaya Park area', lat:3.10, lng:101.65, image:'biscuit.jpg', observed:'2026-11-10', note:'A tabby with a white bib who likes to watch the world go by on walks with her person.' }
  ].map(cat => ({ ...cat, sample:true }));
  const sampleNotes = {
    zh: ['这只橘猫喜欢在阴凉处打盹，下巴有一小块白毛。','这只猫咖里的奶油色长毛猫有琥珀色眼睛，喜欢坐在窗边看街景。','一只安静的深灰色猫，常坐在树篱附近。遇见时可以留些距离。','一只胸前有白毛的虎斑猫，喜欢跟主人散步时看看四周。'],
    ms: ['Kucing jingga ini gemar tidur di tempat teduh dan mempunyai tompok putih di bawah dagu.','Kucing kafe berbulu krim ini suka melihat jalan dari tingkap.','Kucing berwarna kelabu gelap ini sering duduk berhampiran pagar tanaman. Beri sedikit ruang jika menemuinya.','Kucing belang berdada putih ini suka memerhati suasana ketika berjalan bersama penjaganya.']
  };
  const state = { lang:storage.get('manameow-lang') || 'en', category:'all', cats:samples, account:{available:false}, pin:null, picking:false };
  if (!(state.lang in translations)) state.lang = 'en';
  const t = key => translations[state.lang][key] || translations.en[key] || labels[key] || key;
  const search = $('#cat-search');
  const searchPanel = $('#search-panel');
  const filterButtons = $$('.filters button');
  const mapElement = $('#map');
  const catDialog = $('#cat-dialog');
  const upload = $('#upload-dialog');
  const accountDialog = $('#account-dialog');
  const form = $('#sighting-form');
  const submit = $('#submit-sighting');
  const uploadError = $('#upload-error');
  const dateInput = form.elements.observed;
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Kuala_Lumpur'}).format(new Date());
  dateInput.max = today;
  dateInput.value = today;

  const map = window.createManaMap?.(mapElement, {
    cards: state.cats, select: id => { if (!state.picking) openCat(id); }, onPick: acceptPin
  });
  $('#zoom-in').addEventListener('click', () => map?.zoomBy(1.6));
  $('#zoom-out').addEventListener('click', () => map?.zoomBy(1/1.6));
  $('#reset-map').addEventListener('click', () => map?.reset());

  function openSearchResult(cat) {
    searchPanel.hidePopover();
    map?.select(cat.id);
    openCat(cat.id);
  }
  function renderResult(cat) {
    const button = node('button','cat-row');
    button.type = 'button';
    const image = node(cat.image ? 'img' : 'span', cat.image ? '' : 'photo-placeholder');
    if (cat.image) {
      image.src = cat.image;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      image.width = image.height = 45;
    } else {
      image.append(node('span','paw'));
      image.setAttribute('aria-hidden','true');
    }
    const copy = node('span');
    copy.append(node('strong','',cat.name), node('small','',cat.city));
    button.append(image,copy,node('span','badge ' + cat.category,t(cat.category)));
    button.addEventListener('click', () => openSearchResult(cat));
    const item = node('li');
    item.append(button);
    return item;
  }
  function renderMapList() {
    const query = search.value.trim().toLocaleLowerCase();
    const cats = state.cats.filter(cat => (state.category === 'all' || cat.category === state.category) &&
      [cat.name,cat.city,cat.location].join(' ').toLocaleLowerCase().includes(query));
    $('#cat-list').replaceChildren(...cats.map(renderResult));
    $('#search-empty').hidden = !!cats.length;
    $('#search-toggle').dataset.filtered = String(Boolean(query) || state.category !== 'all');
    map?.setCards(cats);
  }
  function renderLanguage() {
    document.documentElement.lang = state.lang === 'zh' ? 'zh-Hans' : state.lang;
    for (const el of $$('[data-i]')) el.textContent = t(el.dataset.i);
    for (const el of $$('[data-placeholder]')) el.placeholder = t(el.dataset.placeholder);
    for (const el of $$('[data-label]')) el.setAttribute('aria-label',t(el.dataset.label));
    for (const el of $$('[data-close]')) el.setAttribute('aria-label',t('close'));
    renderPin();
    renderMapList();
  }
  $('#lang').value = state.lang;
  $('#lang').addEventListener('change', event => {
    state.lang = event.target.value;
    storage.set('manameow-lang', state.lang);
    renderLanguage();
  });
  search.addEventListener('input', renderMapList);
  for (const button of filterButtons) button.addEventListener('click', () => {
    state.category = button.dataset.category;
    for (const other of filterButtons) other.setAttribute('aria-pressed', String(other === button));
    renderMapList();
  });

  function openCat(id) {
    const cat = state.cats.find(item => item.id === id);
    if (!cat) return;
    const photo = $('#cat-image');
    photo.hidden = !cat.image;
    if (cat.image) {
      photo.src = cat.image;
      photo.alt = cat.name;
    } else photo.removeAttribute('src');
    $('#cat-category').className = 'badge ' + cat.category;
    $('#cat-category').textContent = t(cat.category);
    $('#cat-title').textContent = cat.name;
    $('#cat-location').textContent = [cat.location, cat.city].filter(Boolean).join(' · ');
    const translatedNote = cat.sample && sampleNotes[state.lang]?.[samples.findIndex(item => item.id === id)];
    $('#cat-note').textContent = translatedNote || cat.note || '';
    $('#cat-date').textContent = cat.observed ? t('spotted') + ' · ' + dateFormat(state.lang).format(new Date(cat.observed + 'T12:00:00+08:00')) : '';
    $('#cat-demo').hidden = !cat.sample;
    if (!catDialog.open) catDialog.showModal();
  }
  for (const close of $$('[data-close]')) close.addEventListener('click', () => close.closest('dialog').close());
  for (const dialog of $$('dialog')) dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });

  async function request(path, options) {
    if (!/^https?:$/.test(location.protocol)) return null;
    try {
      const response = await fetch(path, {headers:{Accept:'application/json'}, signal:AbortSignal.timeout(8000), ...options});
      if (!response.headers.get('content-type')?.includes('application/json')) return null;
      const payload = await response.json();
      return { ok:response.ok, payload };
    } catch {
      return null;
    }
  }
  const accountLoad = request('./api/account').then(result => {
    if (result?.ok) state.account = result.payload;
  });
  async function refreshCats() {
    const result = await request('./api/sightings');
    if (!result?.ok || !Array.isArray(result.payload.sightings)) return;
    state.cats = [...result.payload.sightings, ...samples];
    renderMapList();
  }
  function link(label, url, primary) {
    const item = node('a', 'button ' + (primary ? 'primary' : 'secondary'), label);
    item.href = url;
    item.target = '_top';
    return item;
  }
  async function openAccount() {
    const links = $('#account-links');
    const mine = $('#my-sightings');
    const message = $('#account-message');
    links.replaceChildren();
    mine.replaceChildren();
    message.textContent = t('loading');
    if (!accountDialog.open) accountDialog.showModal();
    await accountLoad;
    if (!state.account.available) {
      message.textContent = t('accountOffline');
      return;
    }
    if (!state.account.signedIn) {
      message.textContent = t('signPrompt');
      if (state.account.signInUrl) links.append(link(t('signIn'),state.account.signInUrl,true));
      return;
    }
    message.textContent = t('myIntro');
    if (state.account.moderator) links.append(link(t('review'),'./review',false));
    if (state.account.signOutUrl) links.append(link(t('signOut'),state.account.signOutUrl,false));
    const result = await request('./api/sightings/mine');
    if (!result?.ok) {
      mine.replaceChildren(node('li','fine',t('failed')));
      return;
    }
    const sightings = result.payload.sightings;
    mine.replaceChildren(...(sightings.length ? sightings.map(cat => {
      const item = node('li');
      item.append(node('strong','',cat.name), node('p','fine', cat.city + ' · ' + t(cat.status)));
      return item;
    }) : [node('li','fine',t('noMine'))]));
  }
  $('#account').addEventListener('click', () => {
    $('#settings-panel').hidePopover();
    openAccount();
  });

  function restoreDraft() {
    let draft;
    try { draft = JSON.parse(storage.get('manameow-draft')); } catch { return; }
    if (!draft) return;
    for (const name of ['name','category','city','location','observed','note']) if (draft[name]) form.elements[name].value = draft[name];
    state.pin = draft.pin || null;
  }
  const online = () => state.account.available && state.account.signedIn;
  async function openUpload() {
    await accountLoad;
    if (state.account.available && !state.account.signedIn) return openAccount();
    if (state.picking) stopPicking();
    showError('');
    $('#upload-mode').textContent = t(online() ? 'onlineMode' : 'localMode');
    submit.textContent = t(online() ? 'submit' : 'saveDraft');
    renderPin();
    if (!upload.open) upload.showModal();
  }
  $('#add-cat').addEventListener('click', openUpload);
  function renderPin() {
    $('#pin-status').textContent = t(state.pin ? 'pinSet' : 'pinNone');
  }
  function stopPicking() {
    state.picking = false;
    map?.setPicking(false);
    $('#map-instruction').hidden = true;
  }
  function acceptPin(coords) {
    if (!state.picking) return;
    const {lat,lng} = coords;
    stopPicking();
    if (lat < .8 || lat > 7.6 || lng < 99 || lng > 120) {
      openUpload().then(() => showError(t('useMalaysia')));
      return;
    }
    state.pin = {lat: Math.round(lat*100)/100,lng: Math.round(lng*100)/100};
    openUpload();
  }
  $('#pick-location').addEventListener('click', () => {
    if (!map) {
      showError(t('failed'));
      return;
    }
    upload.close();
    state.picking = true;
    map.setPicking(true);
    $('#map-instruction').hidden = false;
    $('#cancel-pick').focus({preventScroll:true});
  });
  $('#cancel-pick').addEventListener('click', openUpload);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.picking) openUpload();
  });

  function showError(message) {
    uploadError.hidden = !message;
    uploadError.textContent = message;
  }
  async function encodePhoto(file) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 10*1024*1024) throw new Error(t('badPhoto'));
    const url = URL.createObjectURL(file);
    try {
      const photo = new Image();
      photo.src = url;
      await photo.decode();
      if (!photo.naturalWidth || !photo.naturalHeight) throw new Error(t('badPhoto'));
      const scale = Math.min(1, 850 / Math.max(photo.naturalWidth, photo.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1,Math.round(photo.naturalWidth * scale));
      canvas.height = Math.max(1,Math.round(photo.naturalHeight * scale));
      const ctx = canvas.getContext('2d', {alpha:false});
      ctx.fillStyle = '#fffaf2';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(photo,0,0,canvas.width,canvas.height);
      let encoded = canvas.toDataURL('image/jpeg', .75);
      if (encoded.length > 640000) encoded = canvas.toDataURL('image/jpeg', .55);
      if (encoded.length > 640000) throw new Error(t('badPhoto'));
      return encoded;
    } catch {
      throw new Error(t('badPhoto'));
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  let toastTimer;
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {element.hidden = true;},4000);
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    showError('');
    if (!state.pin) return showError(t('needPin'));
    const data = new FormData(form);
    const fields = {};
    for (const key of ['name','category','city','location','observed','note']) fields[key] = String(data.get(key) || '').trim();
    if (!online()) {
      if (!storage.set('manameow-draft', JSON.stringify({...fields,pin:state.pin}))) return showError(t('failed'));
      upload.close();
      toast(t('draftSaved'));
      return;
    }
    const file = data.get('image');
    if (!file?.size) return showError(t('needPhoto'));
    submit.disabled = true;
    try {
      fields.image = await encodePhoto(file);
      const result = await request('./api/sightings', {
        method:'POST', headers:{Accept:'application/json','Content-Type':'application/json'}, body:JSON.stringify({...fields,...state.pin})
      });
      if (!result?.ok) return showError(result?.payload?.message || t('failed'));
      storage.remove('manameow-draft');
      state.pin = null;
      form.reset();
      dateInput.value = today;
      upload.close();
      toast(t('submitted'));
    } catch (error) {
      showError(error.message || t('failed'));
    } finally {
      submit.disabled = false;
    }
  });
  restoreDraft();
  renderLanguage();
  refreshCats();
  if (location.hash === '#account') openAccount();
})();
