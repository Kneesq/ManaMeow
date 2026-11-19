(() => {
  'use strict';

  const frameWidth = 24;
  const frameHeight = 16;
  const fallbackAtlases = new Map();
  const photoAtlases = new Map();
  const sprites = new WeakMap();
  const pending = [];
  const sampleSize = 40;
  let active = 0;

  const coats = [
    { // Ginger tabby
      O: '#6b382a', B: '#dc8951', H: '#f4af72', S: '#bf6240', M: '#f8d4a0',
      F: '#fff1d2', I: '#ed9e88', W: '#fff5cf', E: '#503b30', P: '#913d44',
      markings: [[9, 7, 'SS'], [10, 8, 'S'], [11, 7, 'SS'], [12, 8, 'S'],
        [15, 4, 'S'], [15, 5, 'S'], [17, 4, 'S']],
    },
    { // Tuxedo
      O: '#37303c', B: '#57525f', H: '#766e7e', S: '#46404d', M: '#fff1dd',
      F: '#fff6e8', I: '#c28896', W: '#f6f7b7', E: '#302b37', P: '#9e5a70',
      markings: [[14, 7, 'MF'], [14, 8, 'FF'], [13, 9, 'MF'], [13, 10, 'FF'],
        [15, 6, 'M'], [16, 7, 'M']],
    },
    { // Calico
      O: '#654643', B: '#f3dbc0', H: '#fdf1d5', S: '#dfb899', M: '#fff2d6',
      F: '#fff7e6', I: '#e59a91', W: '#f9f2cf', E: '#413d37', P: '#975057',
      A: '#dc8a55', C: '#78606b',
      markings: [[8, 7, 'AA'], [8, 8, 'AAA'], [7, 9, 'AAAA'], [8, 10, 'AA'],
        [11, 7, 'C'], [12, 8, 'CC'], [12, 9, 'CCC'], [13, 10, 'C'],
        [14, 3, 'A'], [14, 4, 'AAA'], [14, 5, 'AA'], [15, 6, 'A'], [18, 4, 'C']],
    },
    { // Blue-gray
      O: '#414453', B: '#838b9d', H: '#a9b1bd', S: '#667082', M: '#c6c9ce',
      F: '#e5e4dd', I: '#c998a6', W: '#f3e8b9', E: '#343746', P: '#805363',
      markings: [[9, 7, 'SS'], [10, 8, 'SS'], [11, 9, 'S'], [13, 7, 'S'],
        [14, 8, 'S'], [15, 4, 'S'], [17, 4, 'S']],
    },
    { // Seal point
      O: '#574047', B: '#d8c0a2', H: '#f3dfbe', S: '#ae897c', M: '#b49891',
      F: '#7a6064', I: '#c78f92', W: '#b3e2ed', E: '#416677', P: '#654653',
      C: '#8d6c70',
      markings: [[13, 3, 'C'], [18, 3, 'C'], [16, 5, 'C'], [16, 6, 'C'],
        [16, 7, 'CC'], [17, 8, 'C'], [17, 9, 'C']],
    },
    { // Ivory
      O: '#795a4e', B: '#f0dcc1', H: '#fff1d3', S: '#dbba9c', M: '#fff1d5',
      F: '#fff8e5', I: '#edaaa0', W: '#d9eece', E: '#4b6455', P: '#a25c66',
      markings: [[10, 8, 'H'], [11, 9, 'H'], [13, 8, 'H'], [14, 6, 'H']],
    },
  ];

  const body = [
    [13, 1, 'OO...OO'],
    [13, 2, 'OIO.OIO'],
    [12, 3, 'OIIBOIBO'],
    [12, 4, 'OBHHHBBBO'],
    [11, 5, 'OOHHHBHWBO'],
    [8, 6, 'OOOOHBHHBEBBO'],
    [7, 7, 'OBBHHBBBBBBPBBO'],
    [6, 8, 'OHBBBBBBBBBMFFO'],
    [6, 9, 'OBBBBBBBBBMFFO'],
    [6, 10, 'OSBBBBBBBSMMO'],
    [6, 11, 'OSBSBSSSOOOO'],
    [7, 12, 'OOOSSSOO'],
  ];

  const tails = [
    [[2, 3, 'OO'], [2, 4, 'OHO'], [2, 5, 'OSBO'], [3, 6, 'OSBO'],
      [4, 7, 'OSBBO'], [5, 8, 'OSSBO'], [6, 9, 'OOO']],
    [[1, 4, 'OO'], [1, 5, 'OHO'], [2, 6, 'OSBO'], [3, 7, 'OSBBO'],
      [4, 8, 'OSSBO'], [5, 9, 'OOOO']],
    [[2, 5, 'OO'], [2, 6, 'OHOO'], [3, 7, 'OSBBO'], [4, 8, 'OSBBO'],
      [5, 9, 'OSSBO'], [6, 10, 'OOO']],
    [[2, 4, 'OO'], [2, 5, 'OHOO'], [3, 6, 'OSBO'], [4, 7, 'OSBBO'],
      [5, 8, 'OSSBO'], [6, 9, 'OOO']],
  ];

  // The far paws, then the near paws, through four alternating footfalls.
  const steps = [
    [[9, 0], [13, 0], [7, 0], [15, 0]],
    [[6, 1], [14, 0], [9, 0], [12, 1]],
    [[7, 0], [15, 1], [10, 1], [13, 0]],
    [[8, 0], [12, 1], [6, 1], [15, 0]],
  ];

  function drawRows(ctx, coat, rows) {
    for (const [x, y, row] of rows) {
      for (let index = 0; index < row.length; index++) {
        const color = coat[row[index]];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(x + index, y, 1, 1);
      }
    }
  }

  function drawPaws(ctx, coat, frame, start, end) {
    const far = start === 0;
    for (const [x, raised] of steps[frame].slice(start, end)) {
      const y = 12 - raised;
      drawRows(ctx, coat, [
        [x, y - 1, far ? 'OSO' : 'OBO'],
        [x, y, far ? 'OSO' : 'OBO'],
        [x + (raised ? 1 : 0), y + 1, far ? 'OSO' : 'OFO'],
        [x + (raised ? 1 : 0), y + 2, 'OOO'],
      ]);
    }
  }

  function createAtlas(coat) {
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * steps.length;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    for (let frame = 0; frame < steps.length; frame++) {
      ctx.save();
      ctx.translate(frame * frameWidth, 0);
      drawRows(ctx, coat, tails[frame]);
      drawPaws(ctx, coat, frame, 0, 2);
      drawRows(ctx, coat, body);
      drawRows(ctx, coat, coat.markings);
      drawPaws(ctx, coat, frame, 2, 4);
      ctx.restore();
    }
    return canvas.toDataURL();
  }

  function stableHash(value) {
    let hash = 2166136261;
    for (const character of String(value)) {
      hash = Math.imul(hash ^ character.codePointAt(0), 16777619);
    }
    return (hash ^ (hash >>> 16)) >>> 0;
  }

  const rgb = (red, green, blue) => [red, green, blue];
  const luminance = ([r, g, b]) => .2126 * r + .7152 * g + .0722 * b;
  const mix = (left, right, amount) => left.map((channel, index) => channel + (right[index] - channel) * amount);
  const hex = (color) => '#' + color.map(value => Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0')).join('');
  const contrast = (color, amount) => mix([luminance(color), luminance(color), luminance(color)], color, amount);

  function averageBand(sorted, start, end) {
    const band = sorted.slice(Math.floor(sorted.length * start), Math.max(1, Math.ceil(sorted.length * end)));
    return band.reduce((total, color) => total.map((channel, index) => channel + color[index] / band.length), [0, 0, 0]);
  }

  function sampleCoat(data) {
    const face = [];
    const chest = [];
    for (let y = 0; y < sampleSize; y++) {
      const row = (y + .5) / sampleSize;
      for (let x = 0; x < sampleSize; x++) {
        const col = (x + .5) / sampleSize;
        const central = ((col - .51) / .30) ** 2 + ((row - .48) / .32) ** 2 < 1;
        const fur = central && row > .25 && row < .71 && !(row > .37 && row < .48 && Math.abs(col - .52) > .095);
        const bib = row > .63 && row < .94 && Math.abs(col - .52) < .17;
        if (!fur && !bib) continue;

        const start = (y * sampleSize + x) * 4;
        const [r, g, b, a] = data.subarray(start, start + 4);
        // Ignore transparent edges and saturated foliage/sky in the portrait crop.
        if (a < 220 || (g > r + 9 && g > b + 13) || b > r + 27) continue;
        const color = rgb(r, g, b);
        if (fur) face.push(color);
        if (bib) chest.push(color);
      }
    }
    if (face.length < 42) return null;
    face.sort((a, b) => luminance(a) - luminance(b));
    chest.sort((a, b) => luminance(a) - luminance(b));

    const low = averageBand(face, .09, .24);
    const mid = averageBand(face, .36, .72);
    const high = averageBand(face, .75, .96);
    const bib = chest.length >= 20 ? averageBand(chest, .62, .94) : high;
    const brightness = luminance(mid);
    const shadowGap = brightness - luminance(low);
    const faceContrast = luminance(high) - luminance(low);
    const bibIsPale = luminance(bib) > 150 && luminance(bib) - brightness > 32 && bib[0] - bib[2] < 65;
    const charcoal = brightness < 108 && mid[0] - mid[2] < 42;
    const ginger = mid[0] - mid[1] > 36 && mid[0] - mid[2] > 75;
    const light = rgb(255, 241, 218);
    const ink = rgb(53, 43, 47);
    const broadTone = charcoal
      ? mix(mid, rgb(brightness - 2, brightness + 1, brightness + 8), .78)
      : contrast(mix(mid, high, .32), ginger ? 1.25 : 1.06);
    const base = mix(broadTone, light, charcoal ? .075 : brightness > 151 ? .29 : .13);
    const shade = mix(broadTone, ink, charcoal ? .21 : .27);
    const stripe = mix(contrast(low, ginger ? 1.18 : 1), ink, .19);
    const cream = bibIsPale ? mix(bib, light, .45) : mix(base, light, charcoal ? .12 : .31);

    let markings = [];
    if (!charcoal && shadowGap > 30 && brightness < 160) {
      markings = [[9, 7, 'TT'], [10, 8, 'T'], [11, 7, 'TT'], [12, 8, 'T'], [15, 4, 'T'], [15, 5, 'T'], [17, 4, 'T']];
      if (faceContrast > 75) markings.push([8, 9, 'T'], [11, 9, 'T'], [13, 7, 'T'], [14, 8, 'T'], [15, 6, 'T']);
    }
    if (bibIsPale) {
      markings.push([16, 8, 'FF'], [15, 9, 'MF'], [15, 10, 'FM']);
      if (faceContrast > 75) markings.push([16, 5, 'M'], [16, 6, 'M'], [16, 7, 'MF']);
    }

    return {
      O: hex(mix(shade, ink, .68)), B: hex(base), H: hex(mix(base, light, charcoal ? .23 : .32)),
      S: hex(shade), T: hex(stripe), M: hex(mix(base, cream, .67)), F: hex(cream),
      I: hex(mix(base, rgb(231, 160, 151), .47)), W: '#f6e9b7', E: '#3b302e', P: '#a46760', markings,
    };
  }

  function portraitFor(card) {
    if (!card.image) return null;
    try {
      const url = new URL(card.image, document.baseURI);
      if (!['https:', 'http:', 'file:', 'data:', 'blob:'].includes(url.protocol)) return null;
      const version = card.avatarUpdatedAt ?? card.updatedAt;
      if (version && url.origin === location.origin && /^https?:$/.test(url.protocol)) {
        url.searchParams.set('avatar', String(version));
      }
      return { url: url.href, crossOrigin: /^https?:$/.test(url.protocol) && url.origin !== location.origin };
    } catch {
      return null;
    }
  }

  function readPortrait({ url, crossOrigin }) {
    return new Promise(resolve => {
      const image = new Image();
      if (crossOrigin) image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.fetchPriority = 'low';
      image.onerror = () => resolve(null);
      image.onload = () => {
        try {
          const size = Math.min(image.naturalWidth, image.naturalHeight);
          if (!size) return resolve(null);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = sampleSize;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(null);
          ctx.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, sampleSize, sampleSize);
          const coat = sampleCoat(ctx.getImageData(0, 0, sampleSize, sampleSize).data);
          resolve(coat ? createAtlas(coat) : null);
        } catch {
          resolve(null);
        }
      };
      image.src = url;
    });
  }

  function atlasFor(portrait) {
    const { url } = portrait;
    const cached = photoAtlases.get(url);
    if (cached) {
      photoAtlases.delete(url);
      photoAtlases.set(url, cached);
      return cached;
    }
    const result = readPortrait(portrait);
    photoAtlases.set(url, result);
    if (photoAtlases.size > 100) photoAtlases.delete(photoAtlases.keys().next().value);
    return result;
  }

  function loadPendingPortraits() {
    while (active < 3 && pending.length) {
      const { button, portrait } = pending.shift();
      const sprite = sprites.get(button);
      if (sprite.portrait !== portrait) continue;
      if (!button.isConnected || button.hidden) {
        sprite.started = false;
        continue;
      }
      active++;
      atlasFor(portrait).then(atlas => {
        if (atlas && sprite.portrait === portrait) sprite.body.style.backgroundImage = `url("${atlas}")`;
      }).finally(() => {
        active--;
        loadPendingPortraits();
      });
    }
  }

  function addSprite(button, id) {
    const hash = stableHash(id);
    const coatIndex = hash % coats.length;
    if (!fallbackAtlases.has(coatIndex)) fallbackAtlases.set(coatIndex, createAtlas(coats[coatIndex]));
    const atlas = fallbackAtlases.get(coatIndex);
    if (!atlas) return;

    const sprite = document.createElement('span');
    const body = document.createElement('span');
    sprite.className = 'mana-pixel-cat';
    sprite.setAttribute('aria-hidden', 'true');
    body.className = 'mana-pixel-cat__body';
    body.style.backgroundImage = `url("${atlas}")`;

    const direction = hash & 16 ? -1 : 1;
    const distance = 5 + ((hash >>> 10) % 3);
    const duration = 2950 + ((hash >>> 14) % 1050);
    sprite.style.setProperty('--cat-from-x', `${-distance * direction}px`);
    sprite.style.setProperty('--cat-to-x', `${distance * direction}px`);
    sprite.style.setProperty('--cat-to-y', `-${1 + ((hash >>> 20) % 3)}px`);
    sprite.style.setProperty('--cat-direction', direction);
    sprite.style.setProperty('--cat-reverse', -direction);
    sprite.style.setProperty('--cat-duration', `${duration}ms`);
    sprite.style.setProperty('--cat-delay', `-${hash % duration}ms`);

    sprite.append(body);
    button.prepend(sprite);
    button.classList.add('mana-map__pin--pixel');
    const state = { body, fallback: body.style.backgroundImage, portrait: null, started: false };
    sprites.set(button, state);
    return state;
  }

  window.attachManaPixelCat = function attachManaPixelCat(button, card) {
    const sprite = sprites.get(button) ?? addSprite(button, card.id ?? card.name);
    if (!sprite) return;
    const portrait = portraitFor(card);
    if (sprite.portrait?.url === portrait?.url) return;
    sprite.portrait = portrait;
    sprite.started = false;
    sprite.body.style.backgroundImage = sprite.fallback;
  };

  window.loadManaPixelCatCoat = function loadManaPixelCatCoat(button) {
    const sprite = sprites.get(button);
    if (!sprite?.portrait || sprite.started) return;
    sprite.started = true;
    pending.push({ button, portrait: sprite.portrait });
    loadPendingPortraits();
  };
})();
