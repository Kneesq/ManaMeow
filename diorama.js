(() => {
  'use strict';

  // Authentic 1990s 16-bit SNES / GBA RPG overworld palette
  const C = {
    ground: '#67C459',       // bright nostalgic 90s RPG meadow green
    residential: '#73CC64',  // cozy town grass
    park: '#58B64C',         // rich park grass
    lawn: '#6EC85F',         // light meadow grass
    forest: '#3D8C3B',       // classic deep RPG woodland green
    water: '#34A8EB',        // bright 90s RPG river blue
    shore: '#7A5438',        // pixel dirt riverbank
    roadMain: '#CFC4A8',     // classic RPG tiled beige-grey road
    roadMinor: '#D8CEB4',    // slightly lighter side street
    roadEdge: '#332820',     // crisp dark pixel outline
    roadSideLine: '#F5EEDB', // pale cream pixel sidewalk curb
    roadDash: '#FFFFFF',     // crisp white pixel center dashes
  };

  function setColor(map, id, prop, value) {
    try { if (map.getLayer(id)) map.setPaintProperty(id, prop, value); } catch (e) {}
  }

  function makePixelCanvas(pw, ph, scale, draw) {
    const sheet = document.createElement('canvas');
    sheet.width = pw * scale;
    sheet.height = ph * scale;
    const g = sheet.getContext('2d');
    if (!g) return null;
    g.imageSmoothingEnabled = false;
    const px = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(Math.round(x) * scale, Math.round(y) * scale, Math.round(w) * scale, Math.round(h) * scale);
    };
    draw(px);
    return { sheet, g };
  }

  // Classic 90s 16-bit RPG chunky pixel tree with dark outline, dithered shading & shadow
  function draw90sTree(px, ox, oy) {
    const out = '#1F2A1D';
    const dark = '#2E6E35';
    const mid = '#4CA348';
    const light = '#7BD158';
    const hi = '#A8E677';
    // Ground shadow
    px(ox + 3, oy + 18, 12, 3, 'rgba(20,34,18,0.34)');
    px(ox + 5, oy + 20, 8, 1, 'rgba(20,34,18,0.22)');
    // Trunk
    px(ox + 6, oy + 14, 5, 5, '#2A1D15');
    px(ox + 7, oy + 14, 3, 4, '#8A5A3A');
    px(ox + 7, oy + 14, 1, 4, '#A8744E');
    // Outer dark pixel silhouette
    px(ox + 5, oy + 1, 7, 1, out);
    px(ox + 3, oy + 2, 11, 1, out);
    px(ox + 2, oy + 3, 13, 2, out);
    px(ox + 1, oy + 5, 15, 7, out);
    px(ox + 2, oy + 12, 13, 2, out);
    px(ox + 4, oy + 14, 9, 1, out);
    // Mid foliage fill
    px(ox + 5, oy + 2, 7, 1, mid);
    px(ox + 3, oy + 3, 11, 2, mid);
    px(ox + 2, oy + 5, 13, 7, mid);
    px(ox + 4, oy + 12, 9, 2, mid);
    // Bottom & right deep shading + 90s dither pixels
    px(ox + 3, oy + 11, 11, 2, dark);
    px(ox + 4, oy + 13, 9, 1, dark);
    px(ox + 11, oy + 7, 4, 4, dark);
    px(ox + 12, oy + 5, 2, 3, dark);
    px(ox + 3, oy + 10, 1, 1, dark);
    px(ox + 5, oy + 10, 1, 1, dark);
    px(ox + 7, oy + 10, 1, 1, dark);
    px(ox + 9, oy + 10, 1, 1, dark);
    // Top-left sunlit highlight
    px(ox + 5, oy + 2, 6, 2, light);
    px(ox + 3, oy + 4, 7, 3, light);
    px(ox + 3, oy + 7, 3, 2, light);
    px(ox + 5, oy + 3, 3, 1, hi);
    px(ox + 4, oy + 4, 2, 1, hi);
  }

  // Classic 90s RPG round bush
  function draw90sBush(px, ox, oy) {
    const out = '#1F2A1D';
    px(ox + 2, oy + 9, 9, 2, 'rgba(20,34,18,0.32)');
    px(ox + 3, oy + 1, 7, 1, out);
    px(ox + 2, oy + 2, 9, 1, out);
    px(ox + 1, oy + 3, 11, 5, out);
    px(ox + 2, oy + 8, 9, 1, out);
    px(ox + 3, oy + 2, 7, 1, '#7BD158');
    px(ox + 2, oy + 3, 9, 4, '#4CA348');
    px(ox + 3, oy + 3, 4, 2, '#7BD158');
    px(ox + 2, oy + 6, 9, 2, '#2E6E35');
  }

  function draw90sHill(px) {
    const out = '#1F2A1D';
    px(2, 17, 28, 2, 'rgba(20,34,18,0.28)');
    px(11, 2, 10, 1, out);
    px(8, 3, 16, 1, out);
    px(6, 4, 20, 2, out);
    px(4, 6, 24, 3, out);
    px(2, 9, 28, 4, out);
    px(1, 13, 30, 4, out);
    px(11, 3, 10, 1, '#58B64C');
    px(8, 4, 16, 2, '#58B64C');
    px(6, 6, 20, 3, '#58B64C');
    px(4, 9, 24, 4, '#58B64C');
    px(2, 13, 28, 4, '#58B64C');
    px(18, 5, 5, 2, '#3D8C3B');
    px(20, 7, 6, 3, '#3D8C3B');
    px(22, 10, 6, 3, '#3D8C3B');
    px(23, 13, 6, 4, '#3D8C3B');
    px(11, 3, 6, 2, '#7BD158');
    px(8, 5, 6, 2, '#7BD158');
    px(6, 7, 5, 2, '#7BD158');
  }

  function installPixelSprites(map) {
    const s = 2;

    if (!map.hasImage('manameow-3d-tree-icon')) {
      const c = makePixelCanvas(18, 22, s, px => draw90sTree(px, 0, 0));
      if (c) map.addImage('manameow-3d-tree-icon', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-3d-grove-icon')) {
      const c = makePixelCanvas(30, 26, s, px => {
        draw90sTree(px, 1, 1);
        draw90sBush(px, 16, 12);
        draw90sTree(px, 11, 4);
      });
      if (c) map.addImage('manameow-3d-grove-icon', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-pixel-hill-icon')) {
      const c = makePixelCanvas(32, 20, s, draw90sHill);
      if (c) map.addImage('manameow-pixel-hill-icon', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // 90s RPG bright blue water with crisp white pixel wave dashes
    if (!map.hasImage('manameow-pixel-water-tile')) {
      const c = makePixelCanvas(32, 32, s, px => {
        px(4, 7, 6, 1, 'rgba(255,255,255,0.85)');
        px(6, 9, 3, 1, 'rgba(180,235,255,0.75)');
        px(19, 17, 6, 1, 'rgba(255,255,255,0.85)');
        px(21, 19, 3, 1, 'rgba(180,235,255,0.75)');
        px(8, 26, 5, 1, 'rgba(255,255,255,0.80)');
        px(24, 5, 4, 1, 'rgba(255,255,255,0.70)');
      });
      if (c) map.addImage('manameow-pixel-water-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // 90s RPG grass blades + tiny colorful pixel wildflowers (red, yellow, blue, white)
    if (!map.hasImage('manameow-pixel-grass-tile')) {
      const c = makePixelCanvas(48, 48, s, px => {
        // Grass blades
        for (const [x, y] of [[6, 8], [24, 6], [40, 18], [14, 30], [34, 38], [8, 42]]) {
          px(x, y, 1, 2, 'rgba(34,94,38,0.45)');
          px(x + 2, y + 1, 1, 2, 'rgba(34,94,38,0.45)');
          px(x + 1, y - 1, 1, 1, 'rgba(168,230,119,0.65)');
        }
        // Pixel wildflowers (red, yellow, white)
        const flowers = [
          [12, 16, '#E8534A', '#FFE36E'],
          [32, 12, '#FFE36E', '#FFFFFF'],
          [22, 34, '#FFFFFF', '#FFE36E'],
          [42, 30, '#E8534A', '#FFFFFF'],
        ];
        for (const [fx, fy, petal, center] of flowers) {
          px(fx, fy - 1, 1, 3, petal);
          px(fx - 1, fy, 3, 1, petal);
          px(fx, fy, 1, 1, center);
        }
      });
      if (c) map.addImage('manameow-pixel-grass-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // Dark-outlined jagged leafy border for large 90s forest blocks
    if (!map.hasImage('manameow-forest-sawtooth-edge')) {
      const c = makePixelCanvas(16, 8, s, px => {
        px(0, 2, 16, 4, '#1F2A1D');
        for (let x = 0; x < 16; x += 4) {
          px(x + 1, 1, 2, 6, '#1F2A1D');
          px(x + 1, 2, 2, 4, '#3D8C3B');
          px(x, 3, 4, 2, '#4CA348');
        }
      });
      if (c) map.addImage('manameow-forest-sawtooth-edge', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // Classic 90s RPG forest floor dither flecks
    if (!map.hasImage('manameow-forest-flecks-tile')) {
      const c = makePixelCanvas(32, 32, s, px => {
        for (const [x, y] of [[4, 6], [18, 4], [26, 16], [10, 22], [22, 26]]) {
          px(x, y, 3, 2, 'rgba(30,68,30,0.45)');
          px(x + 1, y - 1, 2, 1, 'rgba(110,185,82,0.4)');
        }
      });
      if (c) map.addImage('manameow-forest-flecks-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // 90s RPG pixel-shingle roof lines (semi-transparent overlay on red/teal/cream roofs)
    if (!map.hasImage('manameow-pixel-roof-tile')) {
      const c = makePixelCanvas(16, 16, s, px => {
        for (let x = 0; x < 16; x += 4) {
          px(x, 0, 1, 16, 'rgba(28, 18, 16, 0.22)');
          px(x + 1, 0, 1, 16, 'rgba(255, 252, 240, 0.16)');
        }
        for (let y = 0; y < 16; y += 8) {
          px(0, y, 16, 1, 'rgba(28, 18, 16, 0.18)');
        }
        px(0, 7, 16, 1, 'rgba(255, 252, 240, 0.28)');
      });
      if (c) map.addImage('manameow-pixel-roof-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // 90s RPG wooden-siding house wall with dark-outlined pixel windows (for 3D mode)
    if (!map.hasImage('manameow-pixel-wall-tile')) {
      const c = makePixelCanvas(16, 16, s, px => {
        px(0, 0, 16, 16, '#F4E6C8');
        for (let y = 0; y < 16; y += 4) px(0, y, 16, 1, '#DECBA6');
        for (const wx of [2, 10]) {
          px(wx, 2, 4, 5, '#261D17');
          px(wx + 1, 3, 2, 3, '#88C8E8');
          px(wx + 1, 3, 1, 1, '#E6F8FF');
          px(wx, 10, 4, 5, '#261D17');
          px(wx + 1, 11, 2, 3, '#88C8E8');
          px(wx + 1, 11, 1, 1, '#E6F8FF');
        }
      });
      if (c) map.addImage('manameow-pixel-wall-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    return true;
  }

  function recolor(map) {
    try {
      map.setLight({
        anchor: 'viewport',
        color: '#FFFDF2',
        intensity: 0.4,
        position: [1.3, 215, 48],
      });
    } catch (e) {}

    const layers = (map.getStyle() || {}).layers || [];
    for (const layer of layers) {
      const id = layer.id;
      if (id === 'manameow-water-ripples' || id === 'manameow-meadow-sprigs' || id === 'manameow-paper-flecks' || id === 'manameow-woodland-groves' || id === 'manameow-park-groves' || id.includes('-stitches')) {
        try { map.setLayoutProperty(id, 'visibility', 'none'); } catch (e) {}
        continue;
      }
      if (id === 'manameow-mountains' || id === 'manameow-overview-mountains') {
        try { map.setLayoutProperty(id, 'icon-image', 'manameow-pixel-hill-icon'); } catch (e) {}
        continue;
      }
      if (id.startsWith('manameow-')) continue;

      if (layer.type === 'background') {
        setColor(map, id, 'background-color', C.ground);
      } else if (layer.type === 'fill') {
        if (id.includes('water')) {
          setColor(map, id, 'fill-color', C.water);
          setColor(map, id, 'fill-outline-color', C.shore);
        } else if (id.includes('wood') || id.includes('forest')) {
          setColor(map, id, 'fill-color', C.forest);
        } else if (id.includes('park')) {
          setColor(map, id, 'fill-color', C.park);
          setColor(map, id, 'fill-outline-color', '#3E9438');
        } else if (/grass|meadow|pitch|wetland|cemetery/.test(id)) {
          setColor(map, id, 'fill-color', C.lawn);
        } else if (layer['source-layer'] === 'building' || id.includes('building')) {
          try { map.setLayoutProperty(id, 'visibility', 'none'); } catch (e) {}
        } else if (id.includes('residential')) {
          setColor(map, id, 'fill-color', C.residential);
          setColor(map, id, 'fill-opacity', 0.85);
        } else if (/landuse|hospital|school|aeroway/.test(id)) {
          setColor(map, id, 'fill-color', C.residential);
          setColor(map, id, 'fill-opacity', 0.65);
        }
      } else if (layer.type === 'line') {
        if (id.includes('waterway')) {
          setColor(map, id, 'line-color', C.water);
        } else if (/road|bridge|tunnel|highway/.test(id) && !/rail|stitches/.test(id)) {
          if (id.includes('casing')) {
            setColor(map, id, 'line-color', C.roadEdge);
            setColor(map, id, 'line-opacity', 1);
          } else if (id.includes('path')) {
            setColor(map, id, 'line-color', '#E8DDB8');
          } else if (/motorway|trunk|primary/.test(id)) {
            setColor(map, id, 'line-color', C.roadMain);
          } else {
            setColor(map, id, 'line-color', C.roadMinor);
          }
        }
      } else if (layer.type === 'fill-extrusion') {
        try { map.setLayoutProperty(id, 'visibility', 'none'); } catch (e) {}
      }
    }
  }

  function addPixelLayers(map) {
    if (!map.getSource('openmaptiles') || !installPixelSprites(map)) return;
    const all = (map.getStyle() || {}).layers || [];
    const nextOf = (id) => {
      const idx = all.findIndex(l => l.id === id);
      return idx >= 0 ? all[idx + 1]?.id : undefined;
    };

    // 1. 90s RPG bright blue water ripples + crisp dirt & white foam riverbank
    const waterLayer = all.find(l => l.id === 'water');
    if (waterLayer) {
      if (!map.getLayer('manameow-pixel-water')) {
        try {
          map.addLayer({
            ...waterLayer,
            id: 'manameow-pixel-water',
            paint: { 'fill-pattern': 'manameow-pixel-water-tile', 'fill-opacity': 0.9 },
          }, nextOf('water'));
        } catch (e) {}
      }
      if (!map.getLayer('manameow-pixel-water-bank')) {
        try {
          map.addLayer({
            id: 'manameow-pixel-water-bank',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'water',
            minzoom: 11,
            paint: {
              'line-color': '#7A5438',
              'line-width': ['interpolate', ['linear'], ['zoom'], 11, 1.5, 16, 4.5],
            },
          }, nextOf('water'));
        } catch (e) {}
      }
      if (!map.getLayer('manameow-pixel-water-foam')) {
        try {
          map.addLayer({
            id: 'manameow-pixel-water-foam',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'water',
            minzoom: 12,
            paint: {
              'line-color': '#E8F8FF',
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 2],
              'line-dasharray': [2, 2],
            },
          }, nextOf('water'));
        } catch (e) {}
      }
    }

    // 1b. 90s RPG grass tufts & wildflowers on grass and parks
    for (const targetId of ['landcover_grass', 'park']) {
      const baseLayer = all.find(l => l.id === targetId);
      const pid = 'manameow-pixel-' + targetId;
      if (baseLayer && !map.getLayer(pid)) {
        try {
          map.addLayer({
            ...baseLayer,
            id: pid,
            paint: { 'fill-pattern': 'manameow-pixel-grass-tile', 'fill-opacity': 0.92 },
          }, nextOf(targetId));
        } catch (e) {}
      }
    }

    // 2. Classic 90s RPG tiled beige-grey roads with dark pixel outline & cream sidewalk curb
    const firstBuilding = all.find(l => l['source-layer'] === 'building' || l.type === 'fill-extrusion');
    const beforeBuildings = firstBuilding ? firstBuilding.id : undefined;
    const roadClasses = ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service', 'track'];
    const roadFilter = ['in', ['get', 'class'], ['literal', roadClasses]];

    if (!map.getLayer('manameow-pixel-road-casing')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-road-casing',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          minzoom: 12,
          filter: roadFilter,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': C.roadEdge,
            'line-width': [
              'interpolate', ['exponential', 1.5], ['zoom'],
              12, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 6, ['secondary', 'tertiary'], 4.5, 3],
              16, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 22, ['secondary', 'tertiary'], 17, 13],
              19, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 40, ['secondary', 'tertiary'], 31, 24],
            ],
          },
        }, beforeBuildings);
      } catch (e) {}
    }
    if (!map.getLayer('manameow-pixel-road-sideline')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-road-sideline',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          minzoom: 13,
          filter: roadFilter,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': C.roadSideLine,
            'line-width': [
              'interpolate', ['exponential', 1.5], ['zoom'],
              13, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 5.6, ['secondary', 'tertiary'], 4.2, 2.8],
              16, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 19.2, ['secondary', 'tertiary'], 14.6, 11.0],
              19, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 35.5, ['secondary', 'tertiary'], 27.2, 20.8],
            ],
          },
        }, beforeBuildings);
      } catch (e) {}
    }
    if (!map.getLayer('manameow-pixel-road-fill')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-road-fill',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          minzoom: 12,
          filter: roadFilter,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], C.roadMain, C.roadMinor],
            'line-width': [
              'interpolate', ['exponential', 1.5], ['zoom'],
              12, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 3.8, ['secondary', 'tertiary'], 2.6, 1.8],
              16, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 15.2, ['secondary', 'tertiary'], 11.2, 8.2],
              19, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 28.5, ['secondary', 'tertiary'], 21.5, 16.0],
            ],
          },
        }, beforeBuildings);
      } catch (e) {}
    }
    if (!map.getLayer('manameow-pixel-road-dash')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-road-dash',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'transportation',
          minzoom: 13,
          filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor']]],
          layout: { 'line-cap': 'butt', 'line-join': 'round' },
          paint: {
            'line-color': C.roadDash,
            'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1.0, 16, 1.6, 19, 2.4],
            'line-dasharray': [3, 3],
            'line-opacity': 0.9,
          },
        }, beforeBuildings);
      } catch (e) {}
    }

    // 3. 90s SNES RPG red, teal & cream tiled roofs + crisp dark pixel outline + pixel drop shadow
    const roofBucket = [
      '%',
      ['floor', ['abs', ['+', ['coalesce', ['to-number', ['id'], 0], 0], ['*', ['coalesce', ['get', 'render_height'], ['get', 'height'], 6], 7]]]],
      3,
    ];
    const roofColor = [
      'match', roofBucket,
      0, '#D9534A', // classic 90s RPG red roof
      1, '#329C94', // classic 90s RPG teal roof
      '#E2B46E',    // warm cream-ochre roof
    ];

    if (!map.getLayer('manameow-pixel-building-shadow')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-building-shadow',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 13,
          paint: {
            'fill-color': 'rgba(24, 34, 22, 0.30)',
            'fill-translate': ['interpolate', ['linear'], ['zoom'], 13, ['literal', [3, 3]], 16, ['literal', [5, 5]], 19, ['literal', [8, 8]]],
          },
        });
      } catch (e) {}
    }
    if (!map.getLayer('manameow-pixel-building-fill')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-building-fill',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 13,
          paint: {
            'fill-color': roofColor,
            'fill-opacity': 1,
          },
        });
      } catch (e) {}
    }
    if (!map.getLayer('manameow-pixel-building-texture')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-building-texture',
          type: 'fill',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 14,
          paint: {
            'fill-pattern': 'manameow-pixel-roof-tile',
            'fill-opacity': 0.95,
          },
        });
      } catch (e) {}
    }
    if (!map.getLayer('manameow-pixel-building-outline')) {
      try {
        map.addLayer({
          id: 'manameow-pixel-building-outline',
          type: 'line',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 13,
          layout: { 'line-join': 'miter' },
          paint: {
            'line-color': '#261D17',
            'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1.5, 16, 2.4, 18, 3.0],
          },
        });
      } catch (e) {}
    }

    // 4. Uniform 3D 90s RPG houses (wooden siding + blue pixel windows + red/teal/ochre roof cap)
    if (!map.getLayer('manameow-3d-building-walls')) {
      try {
        map.addLayer({
          id: 'manameow-3d-building-walls',
          type: 'fill-extrusion',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 13,
          layout: { visibility: 'none' },
          paint: {
            'fill-extrusion-pattern': 'manameow-pixel-wall-tile',
            'fill-extrusion-base': 0,
            'fill-extrusion-height': 10.5,
            'fill-extrusion-opacity': 1,
            'fill-extrusion-vertical-gradient': true,
          },
        });
      } catch (e) {}
    }
    if (!map.getLayer('manameow-3d-building-roof')) {
      try {
        map.addLayer({
          id: 'manameow-3d-building-roof',
          type: 'fill-extrusion',
          source: 'openmaptiles',
          'source-layer': 'building',
          minzoom: 13,
          layout: { visibility: 'none' },
          paint: {
            'fill-extrusion-color': roofColor,
            'fill-extrusion-base': 10.5,
            'fill-extrusion-height': 12.2,
            'fill-extrusion-opacity': 1,
            'fill-extrusion-vertical-gradient': false,
          },
        });
      } catch (e) {}
    }

    // 5. Large woodland areas: deep RPG forest green + dither flecks + dark-outlined sawtooth perimeter
    const woodLayer = all.find(l => l.id === 'landcover_wood');
    if (woodLayer) {
      if (!map.getLayer('manameow-forest-shadow')) {
        try {
          map.addLayer({
            ...woodLayer,
            id: 'manameow-forest-shadow',
            paint: {
              'fill-color': 'rgba(20, 34, 18, 0.24)',
              'fill-translate': ['interpolate', ['linear'], ['zoom'], 11, ['literal', [3, 3]], 16, ['literal', [6, 6]], 19, ['literal', [9, 9]]],
            },
          }, 'landcover_wood');
        } catch (e) {}
      }
      if (!map.getLayer('manameow-forest-flecks')) {
        try {
          map.addLayer({
            ...woodLayer,
            id: 'manameow-forest-flecks',
            paint: { 'fill-pattern': 'manameow-forest-flecks-tile', 'fill-opacity': 0.9 },
          }, nextOf('landcover_wood'));
        } catch (e) {}
      }
      if (!map.getLayer('manameow-forest-sawtooth')) {
        try {
          map.addLayer({
            id: 'manameow-forest-sawtooth',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'landcover',
            filter: ['==', ['get', 'class'], 'wood'],
            minzoom: 11,
            layout: { 'line-join': 'round' },
            paint: {
              'line-pattern': 'manameow-forest-sawtooth-edge',
              'line-width': ['interpolate', ['linear'], ['zoom'], 11, 5, 15, 9, 18, 14],
            },
          }, nextOf('landcover_wood'));
        } catch (e) {}
      }
    }

    // 6. Randomly scattered 90s RPG trees (relaxed spacing across all zoom levels, never dense rows)
    const treeBucket = ['%', ['floor', ['abs', ['coalesce', ['to-number', ['id'], 0], 0]]], 5];
    const randomTreeImage = [
      'match', treeBucket,
      0, 'manameow-3d-grove-icon',
      2, 'manameow-3d-grove-icon',
      'manameow-3d-tree-icon',
    ];
    const randomOffset = [
      'match', treeBucket,
      0, ['literal', [-14, 10]],
      1, ['literal', [16, -12]],
      2, ['literal', [-10, -16]],
      3, ['literal', [14, 14]],
      ['literal', [4, -8]],
    ];
    const treeScale = ['interpolate', ['exponential', 1.55], ['zoom'], 12, 0.55, 15, 1.0, 17, 1.45, 19, 2.0];
    const relaxedPadding = ['interpolate', ['linear'], ['zoom'], 12, 22, 15, 42, 17, 68, 19, 96];

    const addTree = (id, sourceLayer, { filter, minzoom = 12, placement = 'point', spacing = 145 } = {}) => {
      if (map.getLayer(id)) return;
      const layout = {
        'icon-anchor': 'bottom',
        'icon-pitch-alignment': 'viewport',
        'icon-rotation-alignment': 'viewport',
        'icon-allow-overlap': false,
        'icon-ignore-placement': false,
        'icon-padding': relaxedPadding,
        'icon-image': randomTreeImage,
        'icon-offset': randomOffset,
        'icon-size': treeScale,
        'symbol-placement': placement,
      };
      if (placement === 'line') layout['symbol-spacing'] = spacing;
      const def = { id, type: 'symbol', source: 'openmaptiles', 'source-layer': sourceLayer, minzoom, layout };
      if (filter) def.filter = filter;
      try { map.addLayer(def); } catch (e) {}
    };
    const woodFilter = ['==', ['get', 'class'], 'wood'];
    const grassFilter = ['==', ['get', 'class'], 'grass'];

    addTree('manameow-pixel-trees-wood-center', 'landcover', { filter: woodFilter, minzoom: 12, placement: 'point' });
    addTree('manameow-pixel-trees-wood-scatter', 'landcover', { filter: woodFilter, minzoom: 12, placement: 'line', spacing: 145 });
    addTree('manameow-pixel-trees-park-center', 'park', { minzoom: 12, placement: 'point' });
    addTree('manameow-pixel-trees-grass-center', 'landcover', { filter: grassFilter, minzoom: 13, placement: 'point' });
  }

  function setMode(map, tilted) {
    const show3d = tilted ? 'visible' : 'none';
    for (const id of ['manameow-3d-building-walls', 'manameow-3d-building-roof']) {
      if (map.getLayer(id)) {
        try { map.setLayoutProperty(id, 'visibility', show3d); } catch (e) {}
      }
    }
  }

  function apply(map) {
    installPixelSprites(map);
    recolor(map);
    addPixelLayers(map);
    setMode(map, map.getPitch() >= 20);
  }

  window.manaDiorama = { apply, setMode };
})();
