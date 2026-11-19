(() => {
  'use strict';
  const ui = Object.fromEntries([...document.querySelectorAll('#catch-dialog, #catch-dialog [id]')]
    .map(el => [el.id.slice(6), el]));
  const copy = {
    en: {
      title:'Catch it', review:'Your catch', close:'Close', photos:'Photos', shutter:'Take photo', retake:'Retake',
      start:'Opening camera…', blocked:'Allow camera access or choose a photo.', unavailable:'Camera unavailable. Choose a photo to continue.',
      paused:'Camera paused.', restart:'Open camera', native:'Use device camera', photo:'Your photo',
      caption:'Photo caption (optional)', captionLimit:'Keep your caption to 160 characters.',
      also:'Also share on this cat’s profile', save:'Save to collection', share:'Save & submit for sharing', saving:'Saving…',
      failed:'Couldn’t save your catch. Try again.', invalid:'Choose a JPG, PNG or WebP photo under 10 MB.', login:'Sign in to save this catch.'
    },
    zh: {
      title:'捕捉它', review:'这次的捕捉', close:'关闭', photos:'相册', shutter:'拍照', retake:'重拍',
      start:'正在打开相机…', blocked:'请允许使用相机，也可以从相册选一张。', unavailable:'相机暂时不可用，可以从相册选一张。',
      paused:'相机已暂停。', restart:'开启相机', native:'使用设备相机', photo:'你拍的照片',
      caption:'照片说明（选填）', captionLimit:'照片说明最多可输入 160 个字符。',
      also:'同时分享到这只猫的档案', save:'存进我的收藏', share:'收藏并提交分享', saving:'正在保存…',
      failed:'照片暂时没存好，请重试。', invalid:'请选择小于 10 MB 的 JPG、PNG 或 WebP 照片。', login:'请先登录，再保存这张照片。'
    },
    ms: {
      title:'Tangkap gambar', review:'Hasil tangkapan', close:'Tutup', photos:'Galeri', shutter:'Ambil gambar', retake:'Ambil semula',
      start:'Membuka kamera…', blocked:'Benarkan akses kamera atau pilih gambar.', unavailable:'Kamera tidak tersedia. Pilih gambar untuk meneruskan.',
      paused:'Kamera dijeda.', restart:'Buka kamera', native:'Guna kamera peranti', photo:'Gambar anda',
      caption:'Kapsyen gambar (pilihan)', captionLimit:'Hadkan kapsyen kepada 160 aksara.',
      also:'Kongsi juga pada profil kucing ini', save:'Simpan ke koleksi', share:'Simpan & hantar untuk dikongsi', saving:'Menyimpan…',
      failed:'Gambar gagal disimpan. Cuba lagi.', invalid:'Pilih JPG, PNG atau WebP yang lebih kecil daripada 10 MB.', login:'Log masuk untuk menyimpan gambar ini.'
    }
  };
  let session = null;
  let stream = null;
  let generation = 0;
  let shooting = false;
  const active = ticket => Boolean(session && ui.dialog.open && generation === ticket);
  const words = () => copy[session?.lang] || copy.en;
  const release = media => media?.getTracks().forEach(track => track.stop());

  function stopCamera() {
    generation++;
    shooting = false;
    release(stream);
    stream = null;
    ui.video.pause();
    ui.video.srcObject = null;
    ui.shutter.disabled = true;
  }
  function message(text = '') {
    ui.error.textContent = text;
    ui.error.hidden = !text;
  }
  function cameraNotice(key) {
    ui.video.hidden = ui.guides.hidden = true;
    ui.wait.hidden = false;
    ui['camera-status'].textContent = words()[key];
    ui.restart.hidden = key === 'start';
    ui.native.hidden = key === 'start' || key === 'paused' || !('capture' in ui['device-picker']);
  }
  function saveLabel() {
    ui.save.textContent = session?.saving ? words().saving : ui.public.checked ? words().share : words().save;
  }
  function clearDraft() {
    session.image = null;
    session.requestId = null;
    ui.still.removeAttribute('src');
    ui.still.hidden = ui.review.hidden = true;
    ui['live-tools'].hidden = false;
    ui.caption.value = '';
    ui.public.checked = false;
    ui.title.textContent = words().title;
    message();
  }
  async function startCamera() {
    if (!session || session.saving) return;
    stopCamera();
    clearDraft();
    const ticket = generation;
    cameraNotice('start');
    if (!navigator.mediaDevices?.getUserMedia) return cameraNotice('unavailable');
    try {
      const media = await navigator.mediaDevices.getUserMedia({audio:false, video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:960}}});
      if (!active(ticket) || document.hidden) {
        release(media);
        if (active(ticket)) cameraNotice('paused');
        return;
      }
      stream = media;
      ui.video.srcObject = media;
      await ui.video.play();
      if (!active(ticket)) return;
      ui.wait.hidden = true;
      ui.video.hidden = ui.guides.hidden = false;
      ui.shutter.disabled = !ui.video.videoWidth;
      const track = media.getVideoTracks()[0];
      track?.addEventListener('ended', () => {
        if (active(ticket)) { stopCamera(); cameraNotice('unavailable'); }
      }, {once:true});
    } catch (error) {
      if (!active(ticket)) return;
      stopCamera();
      cameraNotice(error.name === 'NotAllowedError' ? 'blocked' : 'unavailable');
    }
  }
  function review(image) {
    stopCamera();
    session.image = image;
    session.requestId = crypto.randomUUID();
    ui.video.hidden = ui.guides.hidden = ui.wait.hidden = ui['live-tools'].hidden = true;
    ui.still.src = image;
    ui.still.hidden = ui.review.hidden = false;
    ui.title.textContent = words().review;
    saveLabel();
    message();
    ui.save.focus({preventScroll:true});
  }
  async function useFile(file) {
    if (!file || !session) return;
    stopCamera();
    cameraNotice('paused');
    const ticket = generation;
    try {
      const result = await session.encodePhoto(file);
      if (active(ticket)) review(result);
    } catch {
      if (active(ticket)) message(words().invalid);
    }
  }
  async function shoot() {
    if (!stream || !ui.video.videoWidth || ui.shutter.disabled) return;
    shooting = true;
    ui.shutter.disabled = true;
    const ticket = generation;
    try {
      // Crop the camera frame to the same area shown in the viewfinder.
      const {videoWidth:w, videoHeight:h} = ui.video;
      const ratio = ui.video.clientWidth / ui.video.clientHeight;
      const sw = Math.min(w, h * ratio), sh = Math.min(h, w / ratio);
      const scale = Math.min(1, 850 / Math.max(sw, sh));
      const frame = document.createElement('canvas');
      frame.width = Math.max(1, Math.round(sw * scale));
      frame.height = Math.max(1, Math.round(sh * scale));
      frame.getContext('2d').drawImage(ui.video,(w-sw)/2,(h-sh)/2,sw,sh,0,0,frame.width,frame.height);
      const file = await new Promise(resolve => frame.toBlob(resolve,'image/png'));
      if (!file) throw new Error();
      if (active(ticket)) await useFile(file);
    } catch {
      if (active(ticket)) { shooting = false; message(words().unavailable); ui.shutter.disabled = false; }
    }
  }
  async function save() {
    const current = session;
    if (!current?.image || current.saving) return;
    if (current.isSignedIn && !current.isSignedIn()) {
      message(words().login);
      current.onAuthRequired?.();
      return;
    }
    const caption = ui.caption.value.trim();
    if (caption.length > ui.caption.maxLength) {
      message(words().captionLimit);
      ui.caption.focus({preventScroll:true});
      return;
    }
    message();
    current.saving = true;
    ui.save.disabled = ui.caption.disabled = ui.public.disabled = ui.retake.disabled = ui.close.disabled = true;
    saveLabel();
    let result;
    try {
      const response = await fetch('/api/cats/' + encodeURIComponent(current.cat.id) + '/photos', {
        method:'POST', credentials:'same-origin', signal:AbortSignal.timeout(25000),
        headers:{Accept:'application/json','Content-Type':'application/json'},
        body:JSON.stringify({image:current.image,caption,share:ui.public.checked,clientRequestId:current.requestId})
      });
      if (session !== current) return;
      if (response.status === 401) {
        message(words().login);
        current.onAuthRequired?.();
        return;
      }
      if (!response.ok) throw new Error();
      result = (await response.json()).photo;
      if (!result?.id) throw new Error();
    } catch {
      if (session === current) message(words().failed);
      return;
    } finally {
      current.saving = false;
      if (session === current) {
        ui.save.disabled = ui.caption.disabled = ui.public.disabled = ui.retake.disabled = ui.close.disabled = false;
        saveLabel();
      }
    }
    if (session !== current) return;
    ui.dialog.close();
    current.onSaved?.(result);
  }

  function open(options) {
    if (!options?.cat || ui.dialog.open) return;
    session = {...options,saving:false};
    const t = words();
    ui.subject.textContent = session.cat.name;
    ui.close.setAttribute('aria-label',t.close);
    ui['choose-label'].textContent = t.photos;
    ui.shutter.setAttribute('aria-label',t.shutter);
    ui.retake.textContent = t.retake;
    ui.restart.textContent = t.restart;
    ui.native.textContent = t.native;
    ui.still.alt = t.photo + ' · ' + session.cat.name;
    ui['caption-label'].textContent = t.caption;
    ui['public-label'].textContent = t.also;
    ui.dialog.showModal();
    startCamera();
  }
  ui.close.addEventListener('click', () => { if (!session?.saving) ui.dialog.close(); });
  ui.dialog.addEventListener('cancel', e => { if (session?.saving) e.preventDefault(); });
  ui.dialog.addEventListener('click', e => {
    if (session?.saving && e.target === ui.dialog) e.stopImmediatePropagation();
  });
  ui.dialog.addEventListener('close', () => {
    if (ui.dialog.open) return;
    stopCamera();
    ui.still.removeAttribute('src');
    ui.caption.value = '';
    session = null;
  });
  const pause = () => {
    if (!session || !stream) return;
    stopCamera();
    cameraNotice('paused');
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
  window.addEventListener('pagehide', () => {
    if (session && !session.image) { stopCamera(); cameraNotice('paused'); }
  });
  const updateShutter = () => {
    if (stream && !shooting && !ui.video.hidden) ui.shutter.disabled = !ui.video.videoWidth;
  };
  ui.video.addEventListener('loadeddata', updateShutter);
  ui.video.addEventListener('resize', updateShutter);
  ui.shutter.addEventListener('click', shoot);
  ui.choose.addEventListener('click', () => ui.picker.click());
  ui.native.addEventListener('click', () => ui['device-picker'].click());
  for (const input of [ui.picker,ui['device-picker']]) input.addEventListener('change', () => {
    const file = input.files[0];
    input.value = '';
    useFile(file);
  });
  ui.retake.addEventListener('click', startCamera);
  ui.restart.addEventListener('click', startCamera);
  ui.public.addEventListener('change', saveLabel);
  ui.save.addEventListener('click', save);
  window.ManaCatch = {open};
})();
