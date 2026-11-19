(() => {
  'use strict';

  const coverage = { west: 93.6, south: -4.5, east: 119.35, north: 10 };
  const forestRegions = [
    [101.35, 4.88, .36, .69],
    [102.4, 4.59, .32, .38],
    [103.32, 2.48, .19, .22],
    [114.82, 3.81, .47, .41],
    [116.05, 5.71, .23, .34],
  ];

  function seededRandom(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  const forestDecorations = forestRegions.flatMap(([lng, lat, spreadX, spreadY], index) => {
    const random = seededRandom(451 + index * 991);
    return Array.from({ length: 24 }, () => {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random());
      return [lng + Math.cos(angle) * spreadX * radius, lat + Math.sin(angle) * spreadY * radius, random()];
    });
  });

  function tones(context, width, height, first, last) {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, first);
    gradient.addColorStop(1, last);
    return gradient;
  }

  function paperGrain(context) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 128;
    const brush = tile.getContext('2d');
    if (!brush) return null;
    const random = seededRandom(2876);
    for (let index = 0; index < 1400; index++) {
      brush.fillStyle = index % 3 ? '#80613b' : '#fffefa';
      brush.globalAlpha = .036 + random() * .12;
      brush.fillRect(random() * 128, random() * 128, .4 + random() * 1.1, .4 + random() * .8);
    }
    return context.createPattern(tile, 'repeat');
  }

  function waterRipples(context) {
    const tile = document.createElement('canvas');
    tile.width = tile.height = 136;
    const brush = tile.getContext('2d');
    if (!brush) return null;
    brush.strokeStyle = '#f0fcf3';
    brush.lineWidth = .9;
    brush.lineCap = 'round';
    for (const [x, y] of [[19, 35], [82, 101]]) {
      brush.beginPath();
      brush.moveTo(x, y);
      brush.quadraticCurveTo(x + 3, y - 2.4, x + 6, y);
      brush.quadraticCurveTo(x + 9, y + 2.4, x + 12, y);
      brush.moveTo(x + 5, y + 4);
      brush.quadraticCurveTo(x + 8, y + 2.2, x + 11, y + 4);
      brush.stroke();
    }
    return context.createPattern(tile, 'repeat');
  }

  function shape(context, points, project) {
    context.beginPath();
    points.forEach(([lng, lat], index) => {
      const point = project(lng, lat);
      if (index === 0) context.moveTo(point.x, point.y);
      else context.lineTo(point.x, point.y);
    });
    context.closePath();
  }

  function trees(context, width, height, project) {
    const visible = [];
    for (const [lng, lat, variation] of forestDecorations) {
      const { x, y } = project(lng, lat);
      if (x < -9 || y < -9 || x > width + 9 || y > height + 9 ||
          visible.some(([px, py]) => Math.hypot(x - px, y - py) < 11)) continue;
      visible.push([x, y]);
      const radius = 2.2 + variation * 1.7;
      context.strokeStyle = '#b0a285';
      context.lineWidth = .75;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x, y + radius * 1.1);
      context.stroke();
      context.fillStyle = variation > .5 ? '#a6be89' : '#b9cb9c';
      context.beginPath();
      context.moveTo(x - radius, y);
      context.quadraticCurveTo(x - 1.5 * radius, y - radius, x - .45 * radius, y - 1.05 * radius);
      context.quadraticCurveTo(x + .15 * radius, y - 2.15 * radius, x + .72 * radius, y - 1.02 * radius);
      context.quadraticCurveTo(x + 1.7 * radius, y - radius, x + radius, y);
      context.quadraticCurveTo(x, y + radius * .65, x - radius, y);
      context.fill();
    }
  }

  function fadeEdge(context, start, end, rect) {
    const gradient = context.createLinearGradient(...start, ...end);
    gradient.addColorStop(0, '#f3e7d7');
    gradient.addColorStop(1, '#f3e7d700');
    context.fillStyle = gradient;
    context.fillRect(...rect);
  }

  function renderOverview(context, { width, height, project, land, waterPattern }) {
    const northWest = project(coverage.west, coverage.north);
    const southEast = project(coverage.east, coverage.south);
    const { x: left, y: top } = northWest;
    const { x: right, y: bottom } = southEast;
    if (left >= right || top >= bottom) return;

    context.save();
    context.beginPath();
    context.rect(left, top, right - left, bottom - top);
    context.clip();
    context.fillStyle = tones(context, width, height, '#cce9e0', '#b6dcd7');
    context.fillRect(0, 0, width, height);
    if (waterPattern) {
      context.fillStyle = waterPattern;
      context.globalAlpha = .64;
      context.fillRect(0, 0, width, height);
      context.globalAlpha = 1;
    }

    context.fillStyle = tones(context, width, height, '#f8eed9', '#efdfc4');
    context.strokeStyle = '#a4c9b9';
    context.lineWidth = 1.25;
    context.lineJoin = 'round';
    for (const coast of land) {
      shape(context, coast, project);
      context.fill();
      context.stroke();
    }
    trees(context, width, height, project);

    const fade = Math.min(38, width / 10, height / 10);
    if (left > -fade) fadeEdge(context, [left, 0], [left + fade, 0], [left, 0, fade, height]);
    if (right < width + fade) fadeEdge(context, [right, 0], [right - fade, 0], [right - fade, 0, fade, height]);
    if (top > -fade) fadeEdge(context, [0, top], [0, top + fade], [0, top, width, fade]);
    if (bottom < height + fade) fadeEdge(context, [0, bottom], [0, bottom - fade], [0, bottom - fade, width, fade]);
    context.restore();
  }

  window.createStorybookFallback = function createStorybookFallback(context) {
    const grain = paperGrain(context);
    const waterPattern = waterRipples(context);
    return function drawFallback(options) {
      const { width, height, camera } = options;
      const inCoverage = camera.zoom >= 4 && camera.lng >= coverage.west && camera.lng <= coverage.east &&
        camera.lat >= coverage.south && camera.lat <= coverage.north;
      const mode = !inCoverage ? 'area' : camera.zoom >= 8.5 ? 'detail' : 'overview';

      context.save();
      context.fillStyle = mode === 'overview' ? '#f3e7d7' : tones(context, width, height, '#faf2e5', '#eee1d1');
      context.fillRect(0, 0, width, height);
      if (mode === 'overview') renderOverview(context, { ...options, waterPattern });
      if (grain) {
        context.fillStyle = grain;
        context.fillRect(0, 0, width, height);
      }
      context.restore();
      return mode;
    };
  };
})();
