(() => {
  'use strict';

  // Logical 16-bit pixel canvas (16:9 widescreen, upscaled crisp with image-rendering: pixelated)
  const W = 480;
  const H = 270;

  // Walkable zones in normalized [0..1] scene coordinates (park, sidewalks, crossroads, bridge, east meadow)
  const WALK_ZONES = [
    { x1: 0.08, y1: 0.28, x2: 0.35, y2: 0.54 }, // Left park grass
    { x1: 0.39, y1: 0.16, x2: 0.45, y2: 0.88 }, // Vertical main road & sidewalks
    { x1: 0.08, y1: 0.59, x2: 0.45, y2: 0.68 }, // Horizontal left road
    { x1: 0.45, y1: 0.18, x2: 0.90, y2: 0.25 }, // Upper right sidewalk
    { x1: 0.48, y1: 0.52, x2: 0.72, y2: 0.72 }, // Center-right yard & riverside grass
    { x1: 0.74, y1: 0.54, x2: 0.82, y2: 0.63 }, // Wooden bridge
    { x1: 0.79, y1: 0.66, x2: 0.92, y2: 0.86 }, // Bottom-right meadow across river
  ];

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickWalkPoint() {
    const z = WALK_ZONES[Math.floor(Math.random() * WALK_ZONES.length)];
    return { x: rand(z.x1, z.x2), y: rand(z.y1, z.y2) };
  }

  // Pixel drawing helpers
  function makePx(g) {
    return (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    };
  }

  function drawTree(px, x, y) {
    const out = '#2B3B28';
    const dark = '#4E8C4A';
    const mid = '#74B862';
    const light = '#9ED87E';
    const hi = '#C0EC9F';
    px(x + 3, y + 23, 18, 4, 'rgba(30,48,28,0.28)');
    px(x + 8, y + 18, 8, 7, '#3D2B1F');
    px(x + 9, y + 18, 6, 6, '#9B6F4B');
    px(x + 10, y + 18, 2, 6, '#B88962');
    px(x + 6, y + 1, 12, 2, out);
    px(x + 3, y + 3, 18, 2, out);
    px(x + 1, y + 5, 22, 11, out);
    px(x + 3, y + 16, 18, 3, out);
    px(x + 6, y + 19, 12, 1, out);
    px(x + 6, y + 2, 12, 2, mid);
    px(x + 4, y + 4, 16, 2, mid);
    px(x + 2, y + 6, 20, 9, mid);
    px(x + 4, y + 15, 16, 3, mid);
    px(x + 3, y + 14, 18, 3, dark);
    px(x + 16, y + 8, 6, 6, dark);
    px(x + 5, y + 17, 14, 2, dark);
    px(x + 6, y + 3, 9, 3, light);
    px(x + 3, y + 6, 11, 4, light);
    px(x + 6, y + 4, 4, 2, hi);
  }

  function drawBush(px, x, y) {
    const out = '#2B3B28';
    px(x + 2, y + 11, 14, 3, 'rgba(30,48,28,0.26)');
    px(x + 4, y + 1, 10, 2, out);
    px(x + 2, y + 3, 14, 2, out);
    px(x + 1, y + 5, 16, 6, out);
    px(x + 3, y + 11, 12, 1, out);
    px(x + 4, y + 2, 10, 2, '#9ED87E');
    px(x + 2, y + 4, 14, 5, '#74B862');
    px(x + 4, y + 4, 6, 2, '#9ED87E');
    px(x + 3, y + 8, 12, 3, '#4E8C4A');
  }

  function drawBench(px, x, y) {
    const out = '#2B211A';
    px(x + 2, y + 13, 30, 3, 'rgba(30,48,28,0.28)');
    px(x, y, 34, 6, out);
    px(x + 1, y + 1, 32, 2, '#C78E5A');
    px(x + 1, y + 4, 32, 1, '#A66F41');
    px(x, y + 7, 34, 4, out);
    px(x + 1, y + 8, 32, 2, '#D8A26E');
    px(x + 3, y + 11, 3, 3, out);
    px(x + 28, y + 11, 3, 3, out);
  }

  function drawHouse(px, x, y, w, h, roofMain, roofDark, roofLight) {
    const out = '#2A201A';
    const roofH = Math.round(h * 0.52);
    const wallY = y + roofH;
    const wallH = h - roofH;
    // Shadow
    px(x + 4, y + 6, w + 2, h - 2, 'rgba(30,48,28,0.22)');
    // Wall box
    px(x + 2, wallY, w - 4, wallH, out);
    px(x + 3, wallY + 1, w - 6, wallH - 2, '#F5E7CA');
    for (let sy = wallY + 4; sy < wallY + wallH - 2; sy += 4) {
      px(x + 3, sy, w - 6, 1, '#E2CFA9');
    }
    // Door
    const dx = x + Math.round(w / 2) - 5;
    const dy = wallY + wallH - 13;
    px(dx, dy, 10, 12, out);
    px(dx + 1, dy + 1, 8, 10, '#9E6846');
    px(dx + 7, dy + 6, 1, 1, '#F8E3A3');
    // Windows
    for (const wx of [x + 6, x + w - 14]) {
      if (wx + 8 < dx || wx > dx + 10) {
        px(wx, wallY + 5, 8, 8, out);
        px(wx + 1, wallY + 6, 6, 6, '#90D0EB');
        px(wx + 1, wallY + 6, 2, 2, '#E6F9FF');
        px(wx + 3, wallY + 6, 1, 6, out);
        px(wx + 1, wallY + 9, 6, 1, out);
      }
    }
    // Chimney
    px(x + w - 14, y + 2, 7, 10, out);
    px(x + w - 13, y + 3, 5, 8, '#8E8A84');
    // Pitched Roof
    px(x, y, w, roofH + 2, out);
    px(x + 1, y + 1, w - 2, roofH, roofMain);
    px(x + 1, y + 1, w - 2, 3, roofLight);
    px(x + 1, y + roofH - 2, w - 2, 3, roofDark);
    for (let rx = x + 4; rx < x + w - 2; rx += 5) {
      px(rx, y + 1, 1, roofH, roofDark);
    }
    for (let ry = y + 6; ry < y + roofH; ry += 5) {
      px(x + 1, ry, w - 2, 1, 'rgba(36,24,20,0.18)');
    }
  }

  function renderTownBackground(canvas, shimmerPhase = 0) {
    canvas.width = W;
    canvas.height = H;
    const g = canvas.getContext('2d');
    if (!g) return;
    g.imageSmoothingEnabled = false;
    const px = makePx(g);

    // 1. Base pastel 90s RPG meadow grass
    px(0, 0, W, H, '#A9D68A');
    // Subtle grass pixel tufts & tiny wildflowers
    const grassDots = [
      [24, 90], [66, 78], [118, 96], [150, 128], [46, 138], [88, 146],
      [246, 162], [290, 152], [268, 206], [428, 198], [398, 232], [448, 242],
    ];
    for (const [gx, gy] of grassDots) {
      px(gx, gy, 2, 3, '#88BA6A');
      px(gx + 3, gy + 1, 2, 2, '#88BA6A');
      px(gx + 1, gy - 1, 2, 1, '#C9ECAC');
    }
    const flowers = [
      [78, 130, '#E87A72', '#FFE882'], [134, 138, '#FFE882', '#FFFDF7'],
      [148, 142, '#7AC2EE', '#FFFDF7'], [382, 88, '#E87A72', '#FFE882'],
      [412, 92, '#FFE882', '#FFFDF7'], [404, 224, '#E87A72', '#FFFDF7'],
      [432, 212, '#FFE882', '#FFFDF7'], [366, 246, '#FFFDF7', '#FFE882'],
    ];
    for (const [fx, fy, petal, mid] of flowers) {
      px(fx, fy - 2, 2, 5, petal);
      px(fx - 2, fy, 5, 2, petal);
      px(fx, fy, 2, 2, mid);
    }

    // 2. Main Roads + Sidewalks + Zebra Crosswalks
    // Vertical road (x: 184..226)
    px(176, 0, 58, H, '#7E6C5A');
    px(178, 0, 54, H, '#F6EFE0'); // brick sidewalk
    px(186, 0, 38, H, '#DDD4BF'); // road surface
    // Horizontal left road (y: 158..194)
    px(0, 150, 188, 52, '#7E6C5A');
    px(0, 152, 188, 48, '#F6EFE0');
    px(0, 160, 188, 32, '#DDD4BF');
    // Upper-right road (y: 44..72)
    px(224, 38, W - 224, 40, '#7E6C5A');
    px(224, 40, W - 224, 36, '#F6EFE0');
    px(224, 47, W - 224, 22, '#DDD4BF');
    // Clean intersection fill
    px(186, 152, 38, 48, '#DDD4BF');
    px(186, 40, 38, 36, '#DDD4BF');
    // Sidewalk brick lines
    for (let y = 4; y < H; y += 8) {
      px(178, y, 7, 1, '#DDD0B8');
      px(225, y, 7, 1, '#DDD0B8');
    }
    for (let x = 4; x < 178; x += 8) {
      px(x, 152, 1, 7, '#DDD0B8');
      px(x, 193, 1, 7, '#DDD0B8');
    }
    // White zebra crosswalks
    for (let i = 0; i < 4; i++) {
      px(191 + i * 8, 144, 5, 11, '#FFFFFF');
      px(191 + i * 8, 199, 5, 11, '#FFFFFF');
      px(164, 163 + i * 7, 11, 4, '#FFFFFF');
    }

    // 3. Winding Pastel-Blue Pixel River (bottom-right)
    const riverSegs = [
      [410, 102, 70, 34], [380, 114, 62, 34], [354, 132, 54, 38],
      [338, 160, 48, 40], [312, 190, 54, 40], [278, 214, 64, 40],
      [256, 236, 56, 36],
    ];
    // Dirt bank outer
    for (const [rx, ry, rw, rh] of riverSegs) px(rx - 4, ry - 4, rw + 8, rh + 8, '#8E6B4B');
    // White foam inner
    for (const [rx, ry, rw, rh] of riverSegs) px(rx - 1, ry - 1, rw + 2, rh + 2, '#E6F8FF');
    // Bright pastel blue water
    for (const [rx, ry, rw, rh] of riverSegs) px(rx + 1, ry + 1, rw - 2, rh - 2, '#7ACAF0');
    // Animated subtle pixel water sparkles
    const shift = shimmerPhase % 2 === 0 ? 0 : 3;
    const ripples = [[432, 118], [392, 130], [368, 152], [326, 206], [292, 232], [274, 252]];
    for (const [wx, wy] of ripples) {
      px(wx + shift, wy, 9, 2, 'rgba(255,255,255,0.75)');
      px(wx + 4 - shift, wy + 4, 5, 1, 'rgba(255,255,255,0.55)');
    }

    // Wooden pixel bridge across river
    px(352, 148, 44, 24, '#2A201A');
    px(353, 149, 42, 22, '#C88E5B');
    for (let bx = 357; bx < 394; bx += 6) px(bx, 149, 1, 22, '#8F5D34');
    px(353, 149, 42, 3, '#E0AC78');
    px(353, 168, 42, 3, '#9E6840');
    // Bridge posts
    px(358, 171, 4, 6, '#5E3D23');
    px(386, 171, 4, 6, '#5E3D23');

    // 4. Cozy 90s RPG Town Houses
    // Top-right row
    drawHouse(px, 244, 2, 54, 42, '#E5857A', '#C26359', '#F4A69D');
    drawHouse(px, 304, 2, 50, 42, '#72B8B2', '#529690', '#96D4CE');
    drawHouse(px, 360, 2, 54, 42, '#E8C07A', '#C59A54', '#F6D79E');
    drawHouse(px, 420, 2, 52, 42, '#E5857A', '#C26359', '#F4A69D');
    // Mid-right twin houses
    drawHouse(px, 244, 78, 48, 46, '#72B8B2', '#529690', '#96D4CE');
    drawHouse(px, 298, 78, 48, 46, '#72B8B2', '#529690', '#96D4CE');
    // Bottom-left row
    drawHouse(px, 6, 200, 48, 48, '#E5857A', '#C26359', '#F4A69D');
    drawHouse(px, 60, 200, 48, 48, '#72B8B2', '#529690', '#96D4CE');
    drawHouse(px, 114, 200, 56, 48, '#E5857A', '#C26359', '#F4A69D');

    // 5. Park Bench, Trees & Bushes
    drawBench(px, 102, 68);
    const trees = [
      [14, 42], [134, 18], [16, 102], [244, 148], [228, 184], [344, 68], [442, 160],
    ];
    for (const [tx, ty] of trees) drawTree(px, tx, ty);
    const bushes = [
      [56, 72], [146, 68], [58, 118], [148, 194], [228, 224], [438, 78], [452, 232],
    ];
    for (const [bx, by] of bushes) drawBush(px, bx, by);
  }

  window.createManaRpgScene = function createManaRpgScene(container, { onSelectCat } = {}) {
    const root = document.createElement('div');
    root.className = 'rpg-scene';
    root.hidden = true;
    root.setAttribute('aria-label', '3D Pixel Cat Town View');

    const canvas = document.createElement('canvas');
    canvas.className = 'rpg-scene__canvas';
    const actorsLayer = document.createElement('div');
    actorsLayer.className = 'rpg-scene__actors';
    const areaPill = document.createElement('div');
    areaPill.className = 'rpg-scene__area-pill';

    root.append(canvas, actorsLayer, areaPill);
    container.append(root);

    let active = false;
    let rafId = null;
    let shimmerTimer = null;
    let shimmerPhase = 0;
    let lastTime = 0;
    let actors = [];

    function spawnActors(cats, focusCatId) {
      actorsLayer.replaceChildren();
      actors = [];
      // Pick up to 8 cats (always include focusCat first!)
      const ordered = [...cats];
      if (focusCatId) {
        const idx = ordered.findIndex(c => c.id === focusCatId);
        if (idx > 0) {
          const [picked] = ordered.splice(idx, 1);
          ordered.unshift(picked);
        }
      }
      const chosen = ordered.slice(0, 8);

      chosen.forEach((cat, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'rpg-cat';
        btn.setAttribute('aria-label', cat.name);
        window.createManaPixelCat?.(btn, cat);
        window.loadManaPixelCatCoat?.(btn);

        const nameEl = document.createElement('span');
        nameEl.className = 'rpg-cat__name';
        nameEl.textContent = cat.name;
        const emoteEl = document.createElement('span');
        emoteEl.className = 'rpg-cat__emote';
        emoteEl.hidden = true;

        btn.append(nameEl, emoteEl);
        btn.addEventListener('click', () => onSelectCat?.(cat.id));
        actorsLayer.append(btn);

        // Place first/focused cat right near the middle park/crosswalk so user sees it immediately
        const start = i === 0 ? { x: 0.42, y: 0.56 } : pickWalkPoint();
        const actor = {
          cat,
          btn,
          emoteEl,
          x: start.x,
          y: start.y,
          tx: start.x,
          ty: start.y,
          dir: Math.random() < 0.5 ? 1 : -1,
          state: 'idle',
          timer: rand(0.6, 2.2),
          walkClock: 0,
          speed: rand(0.032, 0.052),
        };
        btn.style.left = `${actor.x * 100}%`;
        btn.style.top = `${actor.y * 100}%`;
        btn.style.zIndex = String(Math.round(actor.y * 1000));
        actors.push(actor);
      });
    }

    function setEmote(actor, text, isHeart = false) {
      actor.emoteEl.textContent = text;
      actor.emoteEl.classList.toggle('rpg-cat__emote--heart', isHeart);
      actor.emoteEl.hidden = !text;
    }

    function pickNextAction(actor) {
      actor.btn.classList.remove('rpg-cat--hop');
      const roll = Math.random();
      if (roll < 0.55) {
        // Walk to a new random walkable spot
        const dest = pickWalkPoint();
        actor.tx = dest.x;
        actor.ty = dest.y;
        actor.state = 'walk';
        actor.timer = 9;
        setEmote(actor, '');
      } else if (roll < 0.72) {
        // Nap with Zzz
        actor.state = 'nap';
        actor.timer = rand(2.5, 4.5);
        actor.btn.style.setProperty('--rpg-frame', '0px');
        setEmote(actor, 'Zzz');
      } else if (roll < 0.88) {
        // Happy meow / heart / music note
        actor.state = 'emote';
        actor.timer = rand(2.0, 3.4);
        actor.btn.style.setProperty('--rpg-frame', '0px');
        const notes = [['♥', true], ['♪', false], ['Meow!', false], ['~', false]];
        const [txt, heart] = notes[Math.floor(Math.random() * notes.length)];
        setEmote(actor, txt, heart);
      } else {
        // Playful hop!
        actor.state = 'hop';
        actor.timer = 1.1;
        actor.btn.style.setProperty('--rpg-frame', '-48px');
        actor.btn.classList.add('rpg-cat--hop');
        setEmote(actor, '!', true);
      }
    }

    function tick(now) {
      if (!active) return;
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      for (const a of actors) {
        a.timer -= dt;
        if (a.state === 'walk') {
          const dx = a.tx - a.x;
          const dy = a.ty - a.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.008 || a.timer <= 0) {
            a.btn.style.setProperty('--rpg-frame', '0px');
            pickNextAction(a);
          } else {
            const step = Math.min(dist, a.speed * dt);
            a.x += (dx / dist) * step;
            a.y += (dy / dist) * step;
            if (Math.abs(dx) > 0.002) a.dir = dx >= 0 ? 1 : -1;
            a.walkClock += dt * 7.5;
            const frameIdx = Math.floor(a.walkClock) % 4;
            a.btn.style.setProperty('--rpg-frame', `${-frameIdx * 48}px`);
            a.btn.style.setProperty('--rpg-dir', String(a.dir));
            a.btn.style.left = `${a.x * 100}%`;
            a.btn.style.top = `${a.y * 100}%`;
            a.btn.style.zIndex = String(Math.round(a.y * 1000));
          }
        } else if (a.timer <= 0) {
          pickNextAction(a);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function open({ cats = [], focusCat = null, areaLabel = '' } = {}) {
      active = true;
      root.hidden = false;
      shimmerPhase = 0;
      renderTownBackground(canvas, shimmerPhase);
      areaPill.textContent = areaLabel
        ? `📍 ${areaLabel} · 点击猫咪查看档案`
        : '🐾 像素小镇场景 · 点击猫咪查看档案';
      spawnActors(cats, focusCat?.id);
      lastTime = performance.now();
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);
      clearInterval(shimmerTimer);
      shimmerTimer = setInterval(() => {
        if (!active) return;
        shimmerPhase += 1;
        renderTownBackground(canvas, shimmerPhase);
      }, 650);
    }

    function close() {
      active = false;
      root.hidden = true;
      cancelAnimationFrame(rafId);
      clearInterval(shimmerTimer);
      actors = [];
      actorsLayer.replaceChildren();
    }

    function isOpen() {
      return active;
    }

    return { open, close, isOpen };
  };
})();
