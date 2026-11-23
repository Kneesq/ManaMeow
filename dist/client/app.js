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
      catchIt:'抓拍！', viewProfilePhoto:'查看照片', editNickname:'我的昵称', personalNickname:'你给这只猫取的昵称',
      nicknameHint:'仅自己可见。留空即可移除。', saveNickname:'保存昵称', myCollection:'我的收藏',
      communityPhotos:'社区照片', collectionEmpty:'拍下你的第一张照片。', collectionGuest:'登录后可以收藏照片。',
      loadMorePhotos:'加载更多', loadMoreOwnPhotos:'从我的收藏加载更多照片', loadMoreCommunityPhotos:'加载更多社区照片', loadPhotosFailed:'无法加载更多照片，请重试。',
      collectionIndexEmpty:'抓拍过的猫咪会出现在这里。', collectionCount:'{count} 张照片', collectionIndexError:'无法加载收藏。', collectionRetry:'重试',
      privatePhoto:'仅自己', publishedPhoto:'已公开', likePhoto:'点赞', sharePhoto:'分享', postToCommunity:'投稿到社区',
      photoLink:'照片链接', photoComments:'评论', noComments:'还没有评论。', commentLogin:'登录后评论',
      photoCaption:'照片说明',
      writeComment:'写评论', sendComment:'发送', commentYou:'你', commentGuest:'猫友', commentSubmitted:'评论已提交审核。',
      sharedLinkCopied:'已复制照片链接。', photoUnavailable:'这张照片暂不可用。', photoActionFailed:'操作失败，请再试一次。', caughtPrivately:'照片已存到你的收藏。',
      shareReady:'请再次点击分享。',
      profileUnavailable:'暂时无法打开这只猫的档案。',
      shareProfile:'分享档案', profileLink:'猫咪档案链接', profileLinkCopied:'已复制猫咪档案链接。',
      locationTitle:'要使用当前位置吗？', locationHint:'查看你附近的地图。', locationRequest:'使用我的位置', locationSkip:'探索地图',
      locateMap:'我的位置', locationCancel:'取消定位', locationProgress:'正在定位…', locationDenied:'请在浏览器设置中允许定位后重试。', locationFailed:'暂时无法获取位置，请重试。', locationTimedOut:'定位超时，请重试。', locationUnsupported:'此页面无法使用浏览器定位。',
      mapFallbackLoading:'正在加载实时地图…', mapFallbackOverview:'实时地图暂不可用 · 已显示简略地图', mapFallbackDetail:'实时地图暂不可用 · 无法显示街道细节', mapFallbackArea:'当前视图的实时地图暂不可用',
      login:'登录', email:'邮箱', password:'密码', forgotPassword:'忘记密码？', register:'注册', resetPassword:'重设密码', newPassword:'新密码', recoveryCode:'恢复码', recoveryPrompt:'请输入注册时保存的恢复码。', saveRecovery:'保存恢复码', saveRecoveryHelp:'请把这段恢复码存到安全的地方。忘记密码时会用到它。', copyCode:'复制恢复码', copied:'已复制', done:'完成', passwordHelp:'至少 10 个字符。', emailLogin:'用邮箱登录', signedInAs:'已登录', authFailed:'操作失败，请重试。', invalid_email:'请输入有效的邮箱。', invalid_password:'密码长度需要为 10 至 128 个字符。', invalid_credentials:'邮箱或密码不正确。', invalid_recovery:'邮箱或恢复码不正确。', registration_unavailable:'这个邮箱暂时无法注册。', auth_unavailable:'邮箱账号服务暂时不可用。', rate_limited:'尝试次数太多，请稍后重试。', sessionUnavailable:'浏览器未保存登录状态，请重试登录。',
      age:'年龄', gender:'性别', ageMonths:'年龄（月）', unknown:'未知', female:'雌性', male:'雄性', photos:'照片', addPhoto:'添加照片', profilePhoto:'头像', animation:'猫咪动画', noPhotos:'还没有照片。', photoOffline:'连接网站后可以上传照片。', photoFailed:'照片上传失败，请再试一次。', photoSubmitted:'照片已提交审核。',
      skip:'跳到地图', account:'我的账号', add:'添加猫咪', findCats:'找猫', menu:'菜单', language:'语言',
      mapLabel:'猫咪地图', mapControls:'地图控件', filter:'猫咪分类', pick:'点击地图放置标记。', cancel:'取消',
      stray:'流浪猫', pet:'家猫', cafe:'猫咖', all:'全部', search:'猫名、城市或地点',
      profileDemo:'示例档案', name:'猫咪名字', nameExample:'例如 Milo', category:'分类', city:'城市或城镇', cityExample:'例如怡保',
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
      catchIt:'Tangkap!', viewProfilePhoto:'Lihat gambar', editNickname:'Nama panggilan saya', personalNickname:'Nama panggilan anda untuk kucing ini',
      nicknameHint:'Hanya anda boleh melihatnya. Kosongkan untuk memadam.', saveNickname:'Simpan nama panggilan', myCollection:'Koleksi saya',
      communityPhotos:'Gambar komuniti', collectionEmpty:'Ambil gambar pertama anda.', collectionGuest:'Log masuk untuk menyimpan gambar.',
      loadMorePhotos:'Muat lagi', loadMoreOwnPhotos:'Muat lagi gambar daripada koleksi saya', loadMoreCommunityPhotos:'Muat lagi gambar komuniti', loadPhotosFailed:'Gambar lain tidak dapat dimuatkan. Cuba lagi.',
      collectionIndexEmpty:'Gambar yang anda simpan akan muncul di sini.', collectionCount:'{count} gambar', collectionIndexError:'Koleksi tidak dapat dimuatkan.', collectionRetry:'Cuba lagi',
      privatePhoto:'Peribadi', publishedPhoto:'Disiarkan', likePhoto:'Suka', sharePhoto:'Kongsi', postToCommunity:'Hantar kepada komuniti',
      photoLink:'Pautan gambar', photoComments:'Komen', noComments:'Belum ada komen.', commentLogin:'Log masuk untuk komen',
      photoCaption:'Kapsyen gambar',
      writeComment:'Tulis komen', sendComment:'Hantar', commentYou:'Anda', commentGuest:'Pencinta kucing', commentSubmitted:'Komen dihantar untuk semakan.',
      sharedLinkCopied:'Pautan gambar disalin.', photoUnavailable:'Gambar ini tidak tersedia.', photoActionFailed:'Tindakan gagal. Cuba lagi.', caughtPrivately:'Gambar disimpan dalam koleksi anda.',
      shareReady:'Ketik Kongsi sekali lagi.',
      profileUnavailable:'Profil kucing ini tidak tersedia.',
      shareProfile:'Kongsi profil', profileLink:'Pautan profil kucing', profileLinkCopied:'Pautan profil kucing disalin.',
      locationTitle:'Guna lokasi semasa?', locationHint:'Lihat peta di sekitar anda.', locationRequest:'Guna lokasi saya', locationSkip:'Terokai peta',
      locateMap:'Lokasi saya', locationCancel:'Batal pengesanan lokasi', locationProgress:'Mengesan lokasi…', locationDenied:'Benarkan akses lokasi dalam tetapan pelayar dan cuba lagi.', locationFailed:'Lokasi tidak dapat dikesan. Cuba lagi.', locationTimedOut:'Masa untuk mengesan lokasi tamat. Cuba lagi.', locationUnsupported:'Pelayar tidak dapat mengesan lokasi pada halaman ini.',
      mapFallbackLoading:'Memuatkan peta langsung…', mapFallbackOverview:'Peta langsung tidak tersedia · gambaran anggaran', mapFallbackDetail:'Peta langsung tidak tersedia · butiran jalan tidak tersedia', mapFallbackArea:'Peta langsung tidak tersedia untuk paparan ini',
      login:'Log masuk', email:'E-mel', password:'Kata laluan', forgotPassword:'Lupa kata laluan?', register:'Daftar', resetPassword:'Tetapkan semula kata laluan', newPassword:'Kata laluan baharu', recoveryCode:'Kod pemulihan', recoveryPrompt:'Masukkan kod pemulihan yang disimpan semasa mendaftar.', saveRecovery:'Simpan kod pemulihan', saveRecoveryHelp:'Simpan kod ini di tempat selamat untuk menetapkan semula kata laluan.', copyCode:'Salin kod', copied:'Disalin', done:'Selesai', passwordHelp:'Sekurang-kurangnya 10 aksara.', emailLogin:'Log masuk dengan e-mel', signedInAs:'Log masuk sebagai', authFailed:'Tindakan gagal. Cuba lagi.', invalid_email:'Masukkan alamat e-mel yang sah.', invalid_password:'Gunakan kata laluan antara 10 hingga 128 aksara.', invalid_credentials:'E-mel atau kata laluan tidak tepat.', invalid_recovery:'E-mel atau kod pemulihan tidak tepat.', registration_unavailable:'Pendaftaran untuk e-mel ini tidak tersedia.', auth_unavailable:'Akaun e-mel tidak tersedia buat sementara waktu.', rate_limited:'Terlalu banyak percubaan. Cuba lagi kemudian.', sessionUnavailable:'Pelayar tidak menyimpan sesi. Cuba log masuk sekali lagi.',
      age:'Umur', gender:'Jantina', ageMonths:'Umur (bulan)', unknown:'Tidak diketahui', female:'Betina', male:'Jantan', photos:'Gambar', addPhoto:'Tambah gambar', profilePhoto:'Foto profil', animation:'Animasi kucing', noPhotos:'Belum ada gambar.', photoOffline:'Sambung ke laman untuk memuat naik gambar.', photoFailed:'Gambar gagal dimuat naik. Cuba lagi.', photoSubmitted:'Gambar dihantar untuk semakan.',
      skip:'Langkau ke peta', account:'Akaun saya', add:'Tambah kucing', findCats:'Cari kucing', menu:'Menu', language:'Bahasa',
      mapLabel:'Peta penampakan kucing', mapControls:'Kawalan peta', filter:'Kategori kucing', pick:'Ketik peta untuk meletakkan penanda.', cancel:'Batal',
      stray:'Jalanan', pet:'Peliharaan', cafe:'Kafe', all:'Semua', search:'Nama kucing, bandar atau tempat',
      profileDemo:'Contoh profil', name:'Nama kucing', nameExample:'Cth. Milo', category:'Kategori', city:'Bandar', cityExample:'Cth. Ipoh',
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
      collectionEmpty:'Take your first photo.', collectionGuest:'Log in to save photos.',
      loadPhotosFailed:'Couldn’t load more photos. Try again.',
      collectionIndexEmpty:'Cats you photograph will appear here.', collectionCount:'{count} photos', collectionCountOne:'{count} photo', collectionIndexError:'Couldn’t load your collection.', collectionRetry:'Try again',
      privatePhoto:'Private', publishedPhoto:'Published', commentYou:'You', commentGuest:'Cat lover', commentSubmitted:'Comment sent for review.',
      photoCaption:'Caption',
      sharedLinkCopied:'Photo link copied.', photoUnavailable:'This photo is unavailable.', photoActionFailed:'Something went wrong. Try again.', caughtPrivately:'Photo saved to your collection.',
      shareReady:'Tap Share again.',
      profileUnavailable:'This cat profile is unavailable.',
      shareProfile:'Share profile', profileLink:'Cat profile link', profileLinkCopied:'Cat profile link copied.',
      locationCancel:'Cancel location lookup', locationProgress:'Finding your location…', locationDenied:'Allow location access in browser settings, then try again.', locationFailed:'Couldn’t find your location. Try again.', locationTimedOut:'Finding your location took too long. Try again.', locationUnsupported:'Location is unavailable on this page.',
      mapFallbackLoading:'Loading the live map…', mapFallbackOverview:'Live map unavailable · approximate overview', mapFallbackDetail:'Live map unavailable · street detail unavailable', mapFallbackArea:'Live map unavailable for this view',
      saveRecovery:'Save your recovery code', emailLogin:'Log in with email', signedInAs:'Signed in as', authFailed:'Something went wrong. Try again.', sessionUnavailable:'This browser didn’t keep the session. Try logging in again.',
      photoOffline:'Connect to the site to upload a photo.', photoFailed:'Couldn’t upload this photo. Try again.', photoSubmitted:'Photo sent for review.',
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
    { id:'mochi', ageMonths:30, gender:'female', name:'Mochi', category:'stray', city:'Kuala Lumpur', location:'Perdana Botanical Garden area', lat:3.14, lng:101.68, image:'mochi.jpg', observed:'2026-11-16', note:'An orange tabby who likes to nap in the shade. You can spot a little white patch under the chin.' },
    { id:'pudding', ageMonths:26, gender:'female', name:'Pudding', category:'cafe', city:'George Town, Penang', location:'George Town heritage district', lat:5.42, lng:100.33, image:'pudding.jpg', observed:'2026-11-14', note:'A fluffy cream café cat with amber eyes. She likes to watch the street from the window.' },
    { id:'shadow', ageMonths:36, gender:'male', name:'Shadow', category:'stray', city:'Johor Bahru', location:'Dataran Bandaraya area', lat:1.46, lng:103.74, image:'shadow.jpg', observed:'2026-11-12', note:'A quiet charcoal cat often seen sitting close to the hedges. Give him a little space if you spot him.' },
    { id:'biscuit', ageMonths:18, gender:'female', name:'Biscuit', category:'pet', city:'Petaling Jaya', location:'Taman Jaya Park area', lat:3.10, lng:101.65, image:'biscuit.jpg', observed:'2026-11-10', note:'A tabby with a white bib who likes to watch the world go by on walks with her person.' }
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
  const upload = $('#upload-dialog');
  const accountDialog = $('#account-dialog');
  const collectionSection = $('#account-collection');
  const collectionList = $('#account-collection-cats');
  const collectionMore = $('#account-collection-more');
  const collectionStatus = $('#account-collection-status');
  let accountView = 0;
  let accountCollection = null;
  const form = $('#sighting-form');
  const submit = $('#submit-sighting');
  const uploadError = $('#upload-error');
  const dateInput = form.elements.observed;
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Kuala_Lumpur'}).format(new Date());
  dateInput.max = today;
  dateInput.value = today;

  const tiltButton = $('#tilt-map');
  const map = window.createManaMap?.(mapElement, {
    cards: state.cats,
    select: id => {
      if (state.picking) return;
      const currentZoom = map?.center?.()?.zoom ?? 0;
      map?.select(id);
      if (currentZoom >= 16) openCat(id);
    },
    onPick: acceptPin,
    onTiltChange: tilted => {
      if (!tiltButton) return;
      tiltButton.setAttribute('aria-pressed', String(tilted));
      tiltButton.textContent = tilted ? '2D' : '3D';
    },
    translate: t
  });
  $('#zoom-in').addEventListener('click', () => map?.zoomBy(1.6));
  $('#zoom-out').addEventListener('click', () => map?.zoomBy(1/1.6));
  tiltButton?.addEventListener('click', () => map?.toggleTilt?.());
  $('#reset-map').addEventListener('click', () => map?.reset());


  const motionControl = $('#cat-animation');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const applyMotionPreference = () => {
    const enabled = !motionPreference.matches && storage.get('manameow-cat-motion') !== 'off';
    motionControl.checked = enabled;
    motionControl.disabled = motionPreference.matches;
    mapElement.dataset.motion = enabled ? 'on' : 'off';
  };
  motionControl.addEventListener('change', () => {
    storage.set('manameow-cat-motion', motionControl.checked ? 'on' : 'off');
    applyMotionPreference();
  });
  motionPreference.addEventListener('change', applyMotionPreference);
  applyMotionPreference();

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
    renderLoginLabel();
    profiles?.languageChanged();
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

  const profiles = window.createManaProfiles?.({
    t, getLang: () => state.lang, getAccount: () => state.account, waitForAccount: () => accountLoad,
    request, encodePhoto, toast,
    requestLogin: showEmailLogin,
    sampleNote: cat => cat.sample && sampleNotes[state.lang]?.[samples.findIndex(item => item.id === cat.id)],
  });

  function openCat(id) {
    const cat = state.cats.find(item => item.id === id);
    if (cat) profiles?.open(cat);
  }

  const authDialog = $('#auth-dialog');
  const authDone = $('#auth-done');
  const authForms = $$('[data-auth-form]');
  const authHeadings = {login:'login',register:'register',reset:'resetPassword',recovery:'saveRecovery'};
  const authErrors = new Set(['invalid_email','invalid_password','invalid_credentials','invalid_recovery','registration_unavailable','auth_unavailable','rate_limited']);
  let authBusy = false;
  let authVerified = false;
  let afterEmailLogin = null;

  function authMessage(message = '') {
    const error = $('#auth-error');
    error.textContent = message;
    error.hidden = !message;
  }

  function setAuthMode(mode, email = '') {
    $('#auth-title').textContent = t(authHeadings[mode]);
    $('#auth-recovery').hidden = mode !== 'recovery';
    $('#copy-code').textContent = t('copyCode');
    authMessage();
    for (const form of authForms) {
      form.reset();
      form.hidden = form.dataset.authForm !== mode;
      if (!form.hidden) form.elements.email.value = email;
    }
    if (mode !== 'recovery') $('#recovery-value').textContent = '';
  }

  function showEmailLogin(onSuccess = null) {
    if (authDialog.open) return;
    if (accountDialog.open) accountDialog.close();
    afterEmailLogin = onSuccess;
    authVerified = false;
    authDialog.returnValue = '';
    setAuthMode('login');
    authDialog.showModal();
    $('#auth-login').elements.email.focus();
  }

  function openEmailLogin() {
    if (state.account.signedIn) return openAccount();
    showEmailLogin();
  }

  $('#login-toggle').addEventListener('click',openEmailLogin);
  authDialog.addEventListener('cancel',event => { if (authBusy) event.preventDefault(); });
  authDialog.addEventListener('close',() => {
    if (authDialog.open) return;
    const resume = authVerified && authDialog.returnValue === 'signed-in' ? afterEmailLogin : null;
    afterEmailLogin = null;
    authVerified = false;
    for (const form of authForms) form.reset();
    $('#recovery-value').textContent = '';
    resume?.();
  });
  for (const button of $$('[data-auth-open]')) {
    button.addEventListener('click',() => {
      const email = authForms.find(form => !form.hidden)?.elements.email.value || '';
      setAuthMode(button.dataset.authOpen,email);
      authForms.find(form => !form.hidden)?.elements.email.focus();
    });
  }

  authDone.addEventListener('click',() => {
    if (!authBusy) authDialog.close(authVerified ? 'signed-in' : '');
  });
  $('#copy-code').addEventListener('click',async () => {
    const code = $('#recovery-value');
    try {
      await navigator.clipboard.writeText(code.textContent);
      $('#copy-code').textContent = t('copied');
    } catch {
      code.focus();
      window.getSelection()?.selectAllChildren(code);
    }
  });

  for (const form of authForms) {
    form.addEventListener('submit',async event => {
      event.preventDefault();
      if (authBusy) return;
      const submitButton = form.querySelector('button[type=submit]');
      const closeButton = authDialog.querySelector('[data-close]');
      const switches = $$('[data-auth-open]');
      const fields = Object.fromEntries(new FormData(form));
      fields.email = String(fields.email).trim();
      authMessage();
      authBusy = true;
      submitButton.disabled = closeButton.disabled = authDone.disabled = true;
      switches.forEach(button => { button.disabled = true; });
      try {
        const result = await request('./api/auth/' + form.dataset.authForm,{
          method:'POST', headers:{Accept:'application/json','Content-Type':'application/json'},
          body:JSON.stringify(fields), signal:AbortSignal.timeout(15000)
        });
        form.elements.password.value = '';
        if (!result?.ok) {
          const key = result?.payload?.error;
          const message = state.lang !== 'en' && authErrors.has(key) ? t(key) : result?.payload?.message;
          authMessage(message || t('authFailed'));
          return;
        }
        const recoveryCode = result.payload.recoveryCode;
        if (recoveryCode) {
          setAuthMode('recovery');
          $('#recovery-value').textContent = recoveryCode;
          $('#copy-code').focus();
        }
        accountLoad = refreshAccount();
        const account = await accountLoad;
        if (!authDialog.open) return;
        authVerified = Boolean(account?.signedIn && account.local);
        if (!authVerified) authMessage(t('sessionUnavailable'));
        else if (!recoveryCode) authDialog.close('signed-in');
      } finally {
        authBusy = false;
        submitButton.disabled = closeButton.disabled = authDone.disabled = false;
        switches.forEach(button => { button.disabled = false; });
      }
    });
  }

  function renderLoginLabel() {
    $('#login-toggle').setAttribute('aria-label',t(state.account.signedIn ? 'account' : 'login'));
  }

  for (const close of $$('[data-close]')) close.addEventListener('click', () => close.closest('dialog').close());
  for (const dialog of $$('dialog')) dialog.addEventListener('click', event => {
    if (event.target !== dialog || (dialog === authDialog && authBusy)) return;
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
  async function refreshAccount() {
    const result = await request('./api/account');
    if (result?.ok) {
      const previous = state.account;
      state.account = result.payload;
      if (['available','signedIn','local','email'].some(key => previous[key] !== state.account[key])) {
        profiles?.accountChanged();
        if (!state.account.signedIn) clearAccountCollection();
        else if (accountCollection && accountDialog.open) startAccountCollection();
      }
    }
    renderLoginLabel();
    return result?.ok ? result.payload : null;
  }
  let accountLoad = refreshAccount();
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

  function clearAccountCollection() {
    accountCollection = null;
    collectionSection.hidden = true;
    collectionList.replaceChildren();
    collectionMore.hidden = true;
    collectionStatus.hidden = true;
    collectionStatus.textContent = '';
  }

  function startAccountCollection() {
    clearAccountCollection();
    const collection = {cursor:null, busy:false, loaded:false, catIds:new Set()};
    accountCollection = collection;
    collectionSection.hidden = false;
    loadAccountCollection(collection);
  }

  function collectionRow(entry, collection) {
    const cat = state.cats.find(item => item.id === entry.catId) || entry.cat;
    if (!cat?.name) return null;
    const button = node('button','cat-row collection-row');
    button.type = 'button';
    const image = node('img');
    image.src = entry.latestPhoto?.image || cat.image || 'manameow-logo.png?v=2';
    image.alt = '';
    image.width = image.height = 45;
    image.loading = 'lazy';
    const count = Number(entry.photoCount) || 0;
    const countLabel = t(state.lang === 'en' && count === 1 ? 'collectionCountOne' : 'collectionCount')
      .replace('{count}',new Intl.NumberFormat(state.lang).format(count));
    const title = node('div','collection-name');
    title.append(node('strong','',entry.nickname || cat.name));
    if (entry.nickname && entry.nickname !== cat.name) title.append(node('small','',cat.name));
    button.append(image,title,node('span','fine collection-count',countLabel));
    button.addEventListener('click', () => {
      if (accountCollection !== collection || !state.account.signedIn) return;
      accountDialog.close();
      profiles?.open(cat);
    });
    const row = node('li');
    row.append(button);
    return row;
  }

  async function loadAccountCollection(collection) {
    if (!collection || collection.busy || (collection.loaded && !collection.cursor) || !state.account.signedIn) return;
    collection.busy = true;
    collectionMore.setAttribute('aria-disabled','true');
    collectionStatus.textContent = collection.loaded ? '' : t('loading');
    collectionStatus.hidden = collection.loaded;
    const query = collection.cursor ? '?' + new URLSearchParams({cursor:collection.cursor}) : '';
    const result = await request('./api/collection' + query);
    if (accountCollection !== collection || !accountDialog.open || !state.account.signedIn) return;
    collection.busy = false;
    collectionMore.setAttribute('aria-disabled','false');
    const retry = !result?.ok || !Array.isArray(result.payload.cats);
    if (retry && result?.payload?.error === 'sign_in_required') {
      const view = accountView;
      accountLoad = refreshAccount();
      await accountLoad;
      if (view !== accountView || !accountDialog.open) return;
      if (!state.account.signedIn) {
        openAccount();
        return;
      }
      if (accountCollection !== collection) return;
    }
    const added = [];
    if (!retry) {
      for (const entry of result.payload.cats) {
        if (!entry.catId || collection.catIds.has(entry.catId)) continue;
        const row = collectionRow(entry,collection);
        if (!row) continue;
        collection.catIds.add(entry.catId);
        added.push(row);
      }
      collectionList.append(...added);
      const next = result.payload.cursor;
      collection.cursor = typeof next === 'string' && next && next !== collection.cursor ? next : null;
      collection.loaded = true;
    }
    collectionStatus.textContent = retry ? t('collectionIndexError') : collection.catIds.size ? '' : t('collectionIndexEmpty');
    collectionStatus.hidden = !collectionStatus.textContent;
    collectionMore.dataset.i = retry ? 'collectionRetry' : 'loadMorePhotos';
    collectionMore.textContent = t(collectionMore.dataset.i);
    const moreHadFocus = document.activeElement === collectionMore;
    collectionMore.hidden = !retry && !collection.cursor;
    if (moreHadFocus && collectionMore.hidden && added.length) added[0].firstElementChild.focus();
  }

  collectionMore.addEventListener('click', () => loadAccountCollection(accountCollection));
  accountDialog.addEventListener('close', () => {
    if (accountDialog.open) return;
    accountView += 1;
    clearAccountCollection();
  });

  async function openAccount() {
    const view = ++accountView;
    clearAccountCollection();
    const links = $('#account-links');
    const mine = $('#my-sightings');
    const message = $('#account-message');
    links.replaceChildren();
    mine.replaceChildren();
    message.textContent = t('loading');
    if (!accountDialog.open) accountDialog.showModal();
    await accountLoad;
    if (view !== accountView || !accountDialog.open) return;
    if (!state.account.available) {
      message.textContent = t('accountOffline');
      return;
    }
    if (!state.account.signedIn) {
      message.textContent = t('signPrompt');
      const email = node('button','button primary',t('emailLogin'));
      email.type = 'button';
      email.addEventListener('click',openEmailLogin);
      links.append(email);
      if (state.account.signInUrl) links.append(link(t('signIn'),state.account.signInUrl,false));
      return;
    }
    message.textContent = state.account.local && state.account.email
      ? t('signedInAs') + ' ' + state.account.email
      : t('myIntro');
    startAccountCollection();
    if (state.account.moderator || state.account.platformModerator) links.append(link(t('review'),'./review',false));
    if (state.account.local) {
      const logout = node('button','button secondary',t('signOut'));
      logout.type = 'button';
      logout.addEventListener('click',async () => {
        logout.disabled = true;
        const result = await request('./api/auth/logout',{method:'POST'});
        if (result?.ok) {
          accountLoad = refreshAccount();
          await accountLoad;
          accountDialog.close();
        } else {
          message.textContent = result?.payload?.message || t('authFailed');
          logout.disabled = false;
        }
      });
      links.append(logout);
    } else if (state.account.signOutUrl) {
      links.append(link(t('signOut'),state.account.signOutUrl,false));
    }
    const result = await request('./api/sightings/mine');
    if (view !== accountView || !accountDialog.open || !state.account.signedIn) return;
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
    for (const name of ['name','category','city','location','observed','note','ageMonths','gender']) if (draft[name] != null) form.elements[name].value = draft[name];
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
  let pickingFromDialog = false;
  function startPicking(fromDialog = false) {
    if (!map) {
      openUpload().then(() => showError(t('failed')));
      return;
    }
    if (upload.open) upload.close();
    pickingFromDialog = fromDialog;
    state.picking = true;
    map.setPicking(true);
    $('#map-instruction').hidden = false;
    $('#cancel-pick').focus({preventScroll:true});
  }
  async function startAddCat() {
    await accountLoad;
    if (state.account.available && !state.account.signedIn) {
      showEmailLogin(() => startPicking(false));
      return;
    }
    startPicking(false);
  }
  $('#add-cat').addEventListener('click', startAddCat);
  function renderPin() {
    $('#pin-status').textContent = state.pin
      ? `${t('pinSet')} (${state.pin.lat.toFixed(4)}, ${state.pin.lng.toFixed(4)})`
      : t('pinNone');
  }
  function stopPicking() {
    state.picking = false;
    map?.setPicking(false);
    $('#map-instruction').hidden = true;
  }
  function cancelPicking() {
    const reopen = pickingFromDialog;
    pickingFromDialog = false;
    stopPicking();
    if (reopen) openUpload();
  }
  function acceptPin(coords) {
    if (!state.picking) return;
    const {lat,lng} = coords;
    pickingFromDialog = false;
    stopPicking();
    state.pin = {lat: Math.round(lat*100000)/100000, lng: Math.round(lng*100000)/100000};
    openUpload();
  }
  $('#pick-location').addEventListener('click', () => startPicking(true));
  $('#cancel-pick').addEventListener('click', cancelPicking);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.picking) cancelPicking();
  });

  const photoInput = form.elements.image;
  const photoPreview = $('#upload-photo-preview');
  let previewObjectUrl = null;
  function clearPhotoPreview() {
    if (previewObjectUrl) { URL.revokeObjectURL(previewObjectUrl); previewObjectUrl = null; }
    if (photoPreview) { photoPreview.removeAttribute('src'); photoPreview.hidden = true; }
  }
  photoInput?.addEventListener('change', () => {
    clearPhotoPreview();
    const file = photoInput.files?.[0];
    if (!file || !photoPreview) return;
    previewObjectUrl = URL.createObjectURL(file);
    photoPreview.src = previewObjectUrl;
    photoPreview.hidden = false;
  });

  function showError(message) {
    uploadError.hidden = !message;
    uploadError.textContent = message;
  }
  async function encodePhoto(file) {
    const isImage = Boolean(file && ((file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(file.name || '')));
    if (!isImage || file.size > 20*1024*1024) throw new Error(t('badPhoto'));
    const url = URL.createObjectURL(file);
    try {
      const photo = new Image();
      photo.src = url;
      await photo.decode();
      if (!photo.naturalWidth || !photo.naturalHeight) throw new Error(t('badPhoto'));
      const scale = Math.min(1, 720 / Math.max(photo.naturalWidth, photo.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1,Math.round(photo.naturalWidth * scale));
      canvas.height = Math.max(1,Math.round(photo.naturalHeight * scale));
      const ctx = canvas.getContext('2d', {alpha:false});
      ctx.fillStyle = '#fffaf2';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(photo,0,0,canvas.width,canvas.height);
      let encoded = canvas.toDataURL('image/jpeg', .72);
      if (encoded.length > 480000) encoded = canvas.toDataURL('image/jpeg', .52);
      if (encoded.length > 640000) encoded = canvas.toDataURL('image/jpeg', .38);
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
    const age = String(data.get('ageMonths') || '').trim();
    fields.ageMonths = age === '' ? null : Number(age);
    fields.gender = String(data.get('gender') || 'unknown');
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
      clearPhotoPreview();
      dateInput.value = today;
      upload.close();
      toast(t('submitted'));
      await refreshCats();
      if (result.payload?.sighting?.id) map?.select?.(result.payload.sighting.id);
    } catch (error) {
      showError(error.message || t('failed'));
    } finally {
      submit.disabled = false;
    }
  });
  async function initializeLocation(startupEnabled = true) {
    const dialog = $('#location-dialog');
    const control = $('#locate-map');
    const requestButton = $('#location-request');
    const skipButton = $('#location-skip');
    const progress = $('#location-status');
    const geolocation = window.isSecureContext && navigator.geolocation;
    const available = Boolean(map && typeof geolocation?.getCurrentPosition === 'function');
    const startup = new AbortController();
    let lookup = null;

    function setLookup(next) {
      lookup = next;
      const inDialog = next?.source === 'dialog';
      requestButton.disabled = inDialog;
      progress.hidden = !inDialog;
      progress.textContent = inDialog ? t('locationProgress') : '';
      control.setAttribute('aria-busy', String(Boolean(next)));
      control.dataset.label = next ? 'locationCancel' : 'locateMap';
      control.setAttribute('aria-label', t(control.dataset.label));
    }

    function cancelStartup() {
      startup.abort();
      if (lookup?.source === 'startup') setLookup(null);
    }

    function startLookup(source) {
      if (!available) return toast(t('locationUnsupported'));
      if (lookup) return;
      const current = {source};
      setLookup(current);
      if (source === 'dialog') skipButton.focus({preventScroll:true});

      function settle({latitude: lat, longitude: lng} = {}, errorKey = 'locationFailed') {
        // getCurrentPosition cannot be cancelled, so only the newest active request may move the map.
        if (lookup !== current || (source === 'dialog' && !dialog.open)) return;
        setLookup(null);
        if (source === 'startup') cancelStartup();
        if (source === 'dialog') dialog.close();
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return toast(t(errorKey));
        map.center({lat, lng}, 16);
      }

      const errors = {1:'locationDenied', 3:'locationTimedOut'};
      try {
        geolocation.getCurrentPosition(
          position => settle(position.coords),
          error => settle(undefined, errors[error.code]),
          {enableHighAccuracy:true, timeout:12000, maximumAge:30000}
        );
      } catch {
        settle();
      }
    }

    control.addEventListener('click', () => {
      if (lookup) {
        setLookup(null);
        cancelStartup();
        return;
      }
      cancelStartup();
      startLookup('control');
    });
    requestButton.addEventListener('click', () => startLookup('dialog'));
    skipButton.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      if (lookup?.source === 'dialog') setLookup(null);
      $('#search-toggle').focus({preventScroll:true});
    });

    if (!available || !startupEnabled) return;
    for (const type of ['pointerdown', 'keydown', 'wheel']) {
      document.addEventListener(type, event => {
        if (!control.contains(event.target)) cancelStartup();
      }, {capture:true, passive:true, signal:startup.signal});
    }

    let timer;
    let permission = 'prompt';
    try {
      if (navigator.permissions?.query) {
        const pending = navigator.permissions.query({name:'geolocation'});
        permission = await Promise.race([
          pending.then(status => status.state),
          new Promise(resolve => { timer = setTimeout(() => resolve('prompt'), 250); }),
        ]);
      }
    } catch {
      // Some browsers support location without exposing its permission state.
    } finally {
      clearTimeout(timer);
    }
    if (startup.signal.aborted) return;
    if (permission === 'granted') {
      startLookup('startup');
      return;
    }
    cancelStartup();
    if (permission !== 'denied') dialog.showModal();
  }

  restoreDraft();
  renderLanguage();
  refreshCats();
  const sharedLink = profiles?.openSharedLink(id => state.cats.find(cat => cat.id === id));
  initializeLocation(!sharedLink);
})();
