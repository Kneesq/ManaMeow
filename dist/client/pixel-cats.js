(() => {
  'use strict';

  const frameWidth = 24;
  const frameHeight = 16;
  const cache = new Map();

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

  function createAtlas(coatIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth * steps.length;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const coat = coats[coatIndex];
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

  window.attachManaPixelCat = function attachManaPixelCat(button, id) {
    if (button.classList.contains('mana-map__pin--pixel')) return;
    const hash = stableHash(id);
    const coatIndex = hash % coats.length;
    if (!cache.has(coatIndex)) cache.set(coatIndex, createAtlas(coatIndex));
    const atlas = cache.get(coatIndex);
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
  };
})();
