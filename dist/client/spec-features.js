(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const el = (tag, cls = '', text = '') => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  };

  window.createManaSpecFeatures = function createManaSpecFeatures({
    getCats,
    getAccount,
    requestLogin,
    request,
    refreshCats,
    focusCat,
    toast,
  }) {
    let activeCat = null;
    let activeTab = 'photos';
    let pawTab = 'favorites';

    const creditEl = $('#cat-credit');
    const privacyBadge = $('#cat-privacy-badge');
    const publicNamesBox = $('#cat-public-names');
    const publicNamesSlots = $('#public-names-slots');
    const publicNameHint = $('#public-name-hint');
    const publicNameForm = $('#public-name-form');
    const favBtn = $('#fav-cat-btn');
    const followBtn = $('#follow-cat-btn');
    const tabButtons = [...document.querySelectorAll('[data-profile-tab]')];
    const photosSections = [...document.querySelectorAll('#cat-dialog .profile-photos')];
    const videosPanel = $('#cat-videos-panel');
    const videoList = $('#cat-video-list');
    const videoEmpty = $('#cat-videos-empty');
    const videoForm = $('#cat-video-form');
    const timelinePanel = $('#cat-timeline-panel');
    const timelineList = $('#cat-timeline-list');
    const timelineEmpty = $('#cat-timeline-empty');
    const mergeToggle = $('#merge-toggle-btn');
    const mergeForm = $('#cat-merge-form');
    const mergeSelect = $('#merge-target-select');
    const mergePendingList = $('#cat-merge-pending');

    function setProfileTab(tab) {
      activeTab = tab;
      for (const btn of tabButtons) {
        btn.setAttribute('aria-selected', String(btn.dataset.profileTab === tab));
      }
      for (const sec of photosSections) sec.hidden = tab !== 'photos';
      if (videosPanel) videosPanel.hidden = tab !== 'videos';
      if (timelinePanel) timelinePanel.hidden = tab !== 'timeline';
    }

    for (const btn of tabButtons) {
      btn.addEventListener('click', () => setProfileTab(btn.dataset.profileTab));
    }

    function fmtDate(val) {
      const ts = Date.parse(val);
      if (!ts) return '';
      return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(ts);
    }

    async function loadCatSpec(cat) {
      activeCat = cat;
      setProfileTab('photos');
      if (mergeForm) mergeForm.hidden = true;
      const res = await request('./api/cats/' + encodeURIComponent(cat.id) + '/spec');
      if (!res?.ok || activeCat?.id !== cat.id) return;
      renderCatSpec(cat, res.payload);
    }

    function renderCatSpec(cat, data) {
      if (creditEl) {
        creditEl.replaceChildren();
        creditEl.append('Credit by ');
        if (data.creatorUsername) {
          const btn = el('button', 'credit-link', '@' + data.creatorUsername);
          btn.type = 'button';
          btn.addEventListener('click', () => openUserProfile(data.creatorUsername));
          creditEl.append(btn);
        } else {
          creditEl.append(el('span', '', data.creatorLabel || 'Anonymous'));
        }
      }
      if (privacyBadge) {
        privacyBadge.hidden = !(data.isLocationHidden || cat.isLocationHidden);
      }

      // Public multi-naming slots (3 to 5)
      if (publicNamesBox && publicNamesSlots) {
        publicNamesSlots.replaceChildren();
        const names = data.publicNames || [];
        const canEdit = !data.isPet || data.isOwner;
        const slotCount = Math.max(3, Math.min(5, names.length + (canEdit && names.length < 5 ? 1 : 0)));
        for (let i = 0; i < slotCount; i++) {
          const item = names[i];
          if (item) {
            const chip = el('span', 'name-slot');
            chip.append(el('span', '', item.name));
            const acc = getAccount();
            const canRemove = acc.signedIn && (data.isOwner || (!data.isPet && (item.createdBy === acc.username || item.createdBy === acc.email)));
            if (canRemove) {
              const del = el('button', 'name-slot-remove', '×');
              del.type = 'button';
              del.setAttribute('aria-label', 'Remove ' + item.name);
              del.addEventListener('click', async () => {
                await request('./api/cats/' + encodeURIComponent(cat.id) + '/public-names/' + encodeURIComponent(item.id), { method: 'DELETE' });
                loadCatSpec(cat);
              });
              chip.append(del);
            }
            publicNamesSlots.append(chip);
          } else {
            publicNamesSlots.append(el('span', 'name-slot name-slot--empty', '空位 ' + (i + 1)));
          }
        }
        if (publicNameHint) {
          publicNameHint.textContent = data.isPet
            ? (data.isOwner ? '家猫主人管理（最多 5 个称呼）' : '家猫档案由主人管理（只读）')
            : `街猫多元命名（${names.length}/5）`;
        }
        if (publicNameForm) {
          publicNameForm.hidden = !canEdit || names.length >= 5;
        }
      }

      // Favorite & Follow buttons
      if (favBtn) {
        favBtn.setAttribute('aria-pressed', String(Boolean(data.relations?.favorite)));
        favBtn.textContent = data.relations?.favorite ? '♥ 已收藏' : '♡ 收藏';
      }
      if (followBtn) {
        followBtn.setAttribute('aria-pressed', String(Boolean(data.relations?.following)));
        followBtn.textContent = data.relations?.following ? '★ 追踪中' : '☆ 追踪';
      }

      // Videos tab
      if (videoList && videoEmpty) {
        const videos = data.videos || [];
        videoEmpty.hidden = videos.length > 0;
        videoList.replaceChildren(...videos.map((v) => {
          const li = el('li', 'spec-video-card');
          const vid = document.createElement('video');
          vid.src = v.url;
          vid.controls = true;
          vid.playsInline = true;
          li.append(vid);
          if (v.caption) li.append(el('p', '', v.caption));
          li.append(el('p', 'fine', `${v.owner ? '@' + v.owner : (v.guestName || 'Anonymous')} · ${fmtDate(v.createdAt)}`));
          return li;
        }));
      }

      // Timeline tab
      if (timelineList && timelineEmpty) {
        const items = data.timeline || [];
        timelineEmpty.hidden = items.length > 0;
        timelineList.replaceChildren(...items.map((item) => {
          const li = el('li', 'spec-timeline-item');
          if (item.type === 'video' && item.mediaUrl) {
            const vid = document.createElement('video');
            vid.src = item.mediaUrl;
            vid.className = 'spec-timeline-thumb';
            vid.muted = true;
            li.append(vid);
          } else if (item.mediaUrl) {
            const img = document.createElement('img');
            img.src = item.mediaUrl;
            img.alt = '';
            img.className = 'spec-timeline-thumb';
            li.append(img);
          }
          const body = el('div');
          const label = item.type === 'video' ? '影片' : item.type === 'photo' ? '照片' : '目击档案';
          body.append(el('div', 'spec-timeline-meta', `${label} · ${item.uploader || 'Anonymous'} · ${fmtDate(item.createdAt)}`));
          body.append(el('div', '', item.caption || '更新了一则猫咪动态'));
          li.append(body);
          return li;
        }));
      }

      // Duplicate merge pending requests
      if (mergePendingList) {
        const reqs = data.mergeRequests || [];
        mergePendingList.replaceChildren(...reqs.map((r) => renderMergeCard(r, () => loadCatSpec(cat))));
      }
      if (mergeSelect) {
        const others = getCats().filter((c) => c.id !== cat.id);
        mergeSelect.replaceChildren(...others.map((c) => {
          const opt = document.createElement('option');
          opt.value = c.id;
          opt.textContent = `${c.name}${c.city ? ' · ' + c.city : ''}`;
          return opt;
        }));
      }
    }

    function renderMergeCard(r, onUpdated) {
      const card = el('div', 'merge-card');
      card.append(el('strong', '', `合并申请：${r.sourceName} → ${r.targetName}`));
      const statusText = `原创建者：${r.targetApproved ? '✓ 已同意' : '待确认'} ｜ 相似猫创建者：${r.sourceApproved ? '✓ 已同意' : '待确认'}`;
      card.append(el('p', 'fine', statusText));
      const actions = el('div', 'merge-card-actions');
      const approveBtn = el('button', 'button primary', '同意合并');
      approveBtn.type = 'button';
      approveBtn.addEventListener('click', async () => {
        if (!getAccount().signedIn) return requestLogin(() => approveBtn.click());
        const res = await request('./api/merge-requests/' + encodeURIComponent(r.id) + '/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approve: true }),
        });
        if (res?.ok) {
          toast(res.payload.request.status === 'merged' ? '双方已同意，猫咪档案合并完成！' : '已记录你的同意，等待另一方确认。');
          await refreshCats();
          onUpdated?.();
        }
      });
      const rejectBtn = el('button', 'button secondary', '拒绝');
      rejectBtn.type = 'button';
      rejectBtn.addEventListener('click', async () => {
        if (!getAccount().signedIn) return requestLogin(() => rejectBtn.click());
        const res = await request('./api/merge-requests/' + encodeURIComponent(r.id) + '/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approve: false }),
        });
        if (res?.ok) {
          toast('已拒绝该合并申请');
          onUpdated?.();
        }
      });
      actions.append(approveBtn, rejectBtn);
      card.append(actions);
      return card;
    }

    publicNameForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeCat) return;
      if (!getAccount().signedIn) return requestLogin(() => publicNameForm.requestSubmit());
      const input = publicNameForm.elements.publicName;
      const name = String(input.value || '').trim();
      if (!name) return;
      const res = await request('./api/cats/' + encodeURIComponent(activeCat.id) + '/public-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res?.ok) return toast(res?.payload?.message || '添加失败');
      input.value = '';
      loadCatSpec(activeCat);
    });

    async function toggleRelation(type, btn) {
      if (!activeCat) return;
      if (!getAccount().signedIn) return requestLogin(() => toggleRelation(type, btn));
      const next = btn.getAttribute('aria-pressed') !== 'true';
      const res = await request('./api/cats/' + encodeURIComponent(activeCat.id) + '/relation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, active: next }),
      });
      if (res?.ok) loadCatSpec(activeCat);
    }

    favBtn?.addEventListener('click', () => toggleRelation('favorite', favBtn));
    followBtn?.addEventListener('click', () => toggleRelation('following', followBtn));

    videoForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeCat) return;
      const file = videoForm.elements.video?.files?.[0];
      if (!file) return toast('请先选择一个短视频文件');
      if (file.size > 4 * 1024 * 1024) return toast('本地预览模式请上传 4MB 以内的短视频（接入 Supabase 后支持 50MB）');
      const caption = String(videoForm.elements.caption?.value || '').trim();
      const reader = new FileReader();
      reader.onload = async () => {
        const res = await request('./api/cats/' + encodeURIComponent(activeCat.id) + '/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: reader.result, caption }),
        });
        if (!res?.ok) return toast(res?.payload?.message || '影片上传失败');
        videoForm.reset();
        toast('影片已添加到档案与时间轴');
        loadCatSpec(activeCat);
      };
      reader.readAsDataURL(file);
    });

    mergeToggle?.addEventListener('click', () => {
      if (mergeForm) mergeForm.hidden = !mergeForm.hidden;
    });

    mergeForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!activeCat) return;
      if (!getAccount().signedIn) return requestLogin(() => mergeForm.requestSubmit());
      const otherId = mergeSelect?.value;
      const other = getCats().find((c) => c.id === otherId);
      if (!other) return;
      const res = await request('./api/merge-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCatId: other.id,
          sourceCatId: activeCat.id,
          targetName: other.name,
          sourceName: activeCat.name,
        }),
      });
      if (!res?.ok) return toast(res?.payload?.message || '发起合并申请失败');
      mergeForm.hidden = true;
      toast('已发起足迹合并申请，需双方确认');
      loadCatSpec(activeCat);
    });

    // Account Pawprints Library (Favorites / Following / Discovered)
    const pawSection = $('#pawprints-library');
    const pawList = $('#pawprints-list');
    const pawEmpty = $('#pawprints-empty');
    const pawMerges = $('#pawprints-merges');
    const pawTabBtns = [...document.querySelectorAll('[data-paw-tab]')];
    let pawData = null;

    function renderPawTab() {
      if (!pawData || !pawList || !pawEmpty) return;
      for (const b of pawTabBtns) b.setAttribute('aria-selected', String(b.dataset.pawTab === pawTab));
      const allCats = getCats();
      const mapById = new Map(allCats.map((c) => [c.id, c]));
      let items = [];
      if (pawTab === 'favorites') items = (pawData.favorites || []).map((id) => mapById.get(id)).filter(Boolean);
      else if (pawTab === 'following') items = (pawData.following || []).map((id) => mapById.get(id)).filter(Boolean);
      else items = pawData.discovered || [];

      pawEmpty.hidden = items.length > 0;
      pawEmpty.textContent = pawTab === 'favorites' ? '还没有收藏的猫咪。' : pawTab === 'following' ? '还没有追踪中的猫咪。' : '还没有发现并上传过的猫咪。';
      pawList.replaceChildren(...items.map((cat) => {
        const li = el('li', 'pawprints-item');
        if (cat.image) {
          const img = document.createElement('img');
          img.src = cat.image;
          img.alt = '';
          li.append(img);
        }
        const info = el('div', 'pawprints-item-info');
        info.append(el('strong', '', cat.name));
        info.append(el('span', '', [cat.category === 'pet' ? '家猫' : '街猫', cat.city || cat.location].filter(Boolean).join(' · ')));
        li.append(info);
        li.addEventListener('click', () => {
          $('#account-dialog')?.close();
          focusCat(cat.id);
        });
        return li;
      }));
    }

    for (const b of pawTabBtns) {
      b.addEventListener('click', () => {
        pawTab = b.dataset.pawTab;
        renderPawTab();
      });
    }

    async function loadPawprints() {
      if (!pawSection) return;
      if (!getAccount().signedIn) {
        pawSection.hidden = true;
        return;
      }
      const res = await request('./api/account/pawprints');
      if (!res?.ok) {
        pawSection.hidden = true;
        return;
      }
      pawData = res.payload;
      pawSection.hidden = false;
      const discBtn = pawTabBtns.find((b) => b.dataset.pawTab === 'discovered');
      if (discBtn) discBtn.textContent = `我发现的 (${(pawData.discovered || []).length})`;
      renderPawTab();
      if (pawMerges) {
        const merges = pawData.pendingMerges || [];
        pawMerges.replaceChildren(...merges.map((r) => renderMergeCard(r, loadPawprints)));
      }
    }

    // Public User Profile Dialog (opened by clicking Credit by @username)
    const userDialog = $('#user-profile-dialog');
    const userTitle = $('#user-profile-title');
    const userSubtitle = $('#user-profile-subtitle');
    const userCatsList = $('#user-profile-cats');
    const userCatsEmpty = $('#user-profile-empty');

    async function openUserProfile(username) {
      if (!userDialog || !username) return;
      const clean = String(username).replace(/^@/, '').trim();
      if (userTitle) userTitle.textContent = '@' + clean;
      if (userSubtitle) userSubtitle.textContent = '加载中…';
      if (userCatsList) userCatsList.replaceChildren();
      if (userCatsEmpty) userCatsEmpty.hidden = true;
      const catDialog = $('#cat-dialog');
      if (catDialog?.open) catDialog.close();
      if (!userDialog.open) userDialog.showModal();

      const res = await request('./api/users/' + encodeURIComponent(clean) + '/profile');
      if (!res?.ok) {
        if (userSubtitle) userSubtitle.textContent = '暂时无法读取该用户档案。';
        return;
      }
      const payload = res.payload;
      let items = payload.discovered || [];
      if (payload.isOfficial && !items.length) {
        items = getCats().filter((c) => c.sample);
      }
      if (userTitle) userTitle.textContent = '@' + (payload.username || clean);
      if (userSubtitle) {
        userSubtitle.textContent = payload.isOfficial
          ? `ManaMeow 官方示例猫咪（共 ${items.length} 只）`
          : `已发现并公开分享的猫咪（共 ${items.length} 只）`;
      }
      if (userCatsEmpty) userCatsEmpty.hidden = items.length > 0;
      if (userCatsList) {
        userCatsList.replaceChildren(...items.map((cat) => {
          const li = el('li', 'pawprints-item');
          if (cat.image) {
            const img = document.createElement('img');
            img.src = cat.image;
            img.alt = '';
            li.append(img);
          }
          const info = el('div', 'pawprints-item-info');
          info.append(el('strong', '', cat.name));
          info.append(el('span', '', [cat.category === 'pet' ? '家猫' : '街猫', cat.city || cat.location].filter(Boolean).join(' · ')));
          li.append(info);
          li.addEventListener('click', () => {
            userDialog.close();
            focusCat(cat.id);
          });
          return li;
        }));
      }
    }

    return { loadCatSpec, loadPawprints, openUserProfile };
  };
})();
