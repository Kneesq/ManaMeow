(() => {
  'use strict';

  // Soft, light pastel 16-bit cute palette
  const C = {
    ground: '#CBE09E',       // light fresh spring meadow
    residential: '#D7E6B4',  // airy pastel green neighborhood blocks
    park: '#B3D182',         // soft moss green park
    lawn: '#C3DB96',         // light pastel grass
    forest: '#97BC6E',       // gentle pixel woodland green
    water: '#94D4CA',        // soft pastel aqua water
    shore: '#F5EFE0',        // light cream bank
    roadMain: '#7C828B',     // soft pastel slate-grey road (keeps white-line asphalt design without looking dark)
    roadMinor: '#898F98',    // lighter pastel grey minor road
    roadEdge: '#6E747D',     // soft outer road shoulder
    roadSideLine: '#FFFFFF', // crisp solid white side-edge lines
    roadDash: '#FFFFFF',     // crisp white dashed centerline
    flatHouse: '#F5E1C2',
    flatHouseEdge: '#A48472',
    roofTop: '#FBF1DF',
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

  function drawPixelTree(px, ox, oy, shades) {
    const [out, dark, mid, light] = shades;
    px(ox + 3, oy + 18, 10, 2, 'rgba(74,90,58,0.28)');
    px(ox + 6, oy + 14, 4, 5, '#57402D');
    px(ox + 7, oy + 14, 2, 4, '#8E6849');
    px(ox + 5, oy + 1, 6, 1, out);
    px(ox + 3, oy + 2, 10, 1, out);
    px(ox + 2, oy + 3, 12, 2, out);
    px(ox + 1, oy + 5, 14, 7, out);
    px(ox + 2, oy + 12, 12, 2, out);
    px(ox + 4, oy + 14, 8, 1, out);
    px(ox + 5, oy + 2, 6, 1, mid);
    px(ox + 3, oy + 3, 10, 2, mid);
    px(ox + 2, oy + 5, 12, 7, mid);
    px(ox + 4, oy + 12, 8, 2, mid);
    px(ox + 3, oy + 11, 10, 2, dark);
    px(ox + 10, oy + 7, 4, 4, dark);
    px(ox + 11, oy + 5, 2, 3, dark);
    px(ox + 4, oy + 12, 8, 1, dark);
    px(ox + 5, oy + 2, 5, 2, light);
    px(ox + 3, oy + 4, 6, 3, light);
    px(ox + 4, oy + 3, 2, 1, '#CFE59B');
    px(ox + 3, oy + 6, 2, 2, light);
  }

  function drawPixelHill(px) {
    const out = '#4A5A3A';
    const mid = '#9AC06C';
    const dark = '#7AA352';
    const light = '#B2D282';
    px(2, 17, 28, 2, 'rgba(74,90,58,0.20)');
    px(11, 2, 10, 1, out);
    px(8, 3, 16, 1, out);
    px(6, 4, 20, 2, out);
    px(4, 6, 24, 3, out);
    px(2, 9, 28, 4, out);
    px(1, 13, 30, 4, out);
    px(11, 3, 10, 1, mid);
    px(8, 4, 16, 2, mid);
    px(6, 6, 20, 3, mid);
    px(4, 9, 24, 4, mid);
    px(2, 13, 28, 4, mid);
    px(18, 5, 5, 2, dark);
    px(20, 7, 6, 3, dark);
    px(22, 10, 6, 3, dark);
    px(23, 13, 6, 4, dark);
    px(11, 3, 6, 2, light);
    px(8, 5, 6, 2, light);
    px(6, 7, 5, 2, light);
    px(10, 11, 2, 1, dark);
    px(16, 13, 2, 1, dark);
    px(7, 14, 1, 1, dark);
  }

  function installPixelSprites(map) {
    const s = 2;
    const sh1 = ['#4A5A3A', '#6E944B', '#8FB663', '#B4D17E'];
    const sh2 = ['#4A5A3A', '#648844', '#82A958', '#A6C672'];
    const sh3 = ['#4A5A3A', '#759B52', '#97BE6B', '#BEDB89'];

    if (!map.hasImage('manameow-3d-tree-icon')) {
      const c = makePixelCanvas(16, 20, s, px => drawPixelTree(px, 0, 0, sh1));
      if (c) map.addImage('manameow-3d-tree-icon', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-3d-grove-icon')) {
      const c = makePixelCanvas(30, 24, s, px => {
        drawPixelTree(px, 1, 1, sh2);
        drawPixelTree(px, 13, 0, sh1);
        drawPixelTree(px, 7, 4, sh3);
      });
      if (c) map.addImage('manameow-3d-grove-icon', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-pixel-hill-icon')) {
      const c = makePixelCanvas(32, 20, s, drawPixelHill);
      if (c) map.addImage('manameow-pixel-hill-icon', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-pixel-water-tile')) {
      const c = makePixelCanvas(32, 32, s, px => {
        px(4, 7, 5, 1, 'rgba(244,252,248,0.65)');
        px(6, 9, 3, 1, 'rgba(244,252,248,0.45)');
        px(19, 17, 6, 1, 'rgba(244,252,248,0.65)');
        px(21, 19, 3, 1, 'rgba(244,252,248,0.45)');
        px(9, 26, 4, 1, 'rgba(244,252,248,0.55)');
        px(26, 5, 3, 1, 'rgba(244,252,248,0.50)');
      });
      if (c) map.addImage('manameow-pixel-water-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-pixel-grass-tile')) {
      const c = makePixelCanvas(32, 32, s, px => {
        const tufts = [[5, 8], [21, 6], [13, 19], [26, 24], [7, 27]];
        for (const [x, y] of tufts) {
          px(x, y, 1, 2, 'rgba(104,136,68,0.45)');
          px(x + 2, y + 1, 1, 1, 'rgba(104,136,68,0.45)');
          px(x + 1, y - 1, 1, 1, 'rgba(218,236,164,0.5)');
        }
      });
      if (c) map.addImage('manameow-pixel-grass-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // 16-bit pixel-art warm cream building wall with tiny cozy windows (for 3D walls)
    if (!map.hasImage('manameow-pixel-wall-tile')) {
      const c = makePixelCanvas(16, 16, s, px => {
        px(0, 0, 16, 16, '#F2DAB4');
        // Subtle horizontal floor band
        px(0, 0, 16, 1, '#D8BC95');
        px(0, 8, 16, 1, '#E6CCA5');
        // Two cute pixel windows on upper row
        for (const wx of [2, 10]) {
          px(wx, 2, 4, 5, '#8D7156');
          px(wx + 1, 3, 2, 3, '#C7B69B');
          px(wx + 1, 3, 1, 1, '#EDE4D1');
        }
        // Two cute pixel windows on lower row
        for (const wx of [2, 10]) {
          px(wx, 10, 4, 5, '#8D7156');
          px(wx + 1, 11, 2, 3, '#C7B69B');
          px(wx + 1, 11, 1, 1, '#EDE4D1');
        }
      });
      if (c) map.addImage('manameow-pixel-wall-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    // Soft semi-transparent corrugated/shingle roof rib texture
    if (!map.hasImage('manameow-pixel-roof-tile')) {
      const c = makePixelCanvas(16, 16, s, px => {
        for (let x = 0; x < 16; x += 4) {
          px(x, 0, 1, 16, 'rgba(90, 62, 48, 0.08)');
          px(x + 1, 0, 1, 16, 'rgba(255, 250, 242, 0.18)');
        }
        px(0, 7, 16, 1, 'rgba(255, 252, 246, 0.28)');
        px(0, 8, 16, 1, 'rgba(90, 62, 48, 0.10)');
      });
      if (c) map.addImage('manameow-pixel-roof-tile', c.g.getImageData(0, 0, c.sheet.width, c.sheet.height), { pixelRatio: s });
    }
    return true;
  }

  function recolor(map) {
    try {
      map.setLight({
        anchor: 'viewport',
        color: '#FFF8E8',
        intensity: 0.38,
        position: [1.3, 215, 48],
      });
    } catch (e) {}

    const layers = (map.getStyle() || {}).layers || [];
    for (const layer of layers) {
      const id = layer.id;
      if (id === 'manameow-water-ripples' || id === 'manameow-meadow-sprigs' || id === 'manameow-paper-flecks' || id.includes('-stitches')) {
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
          setColor(map, id, 'fill-outline-color', C.lawn);
        } else if (/grass|meadow|pitch|wetland|cemetery/.test(id)) {
          setColor(map, id, 'fill-color', C.lawn);
        } else if (layer['source-layer'] === 'building' || id.includes('building')) {
          // Hide liberty's default building fill (replaced by our crisp pixel building layers)
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
            setColor(map, id, 'line-color', '#E5D3B3');
          } else if (/motorway|trunk|primary/.test(id)) {
            setColor(map, id, 'line-color', C.roadMain);
          } else {
            setColor(map, id, 'line-color', C.roadMinor);
          }
        }
      } else if (layer.type === 'fill-extrusion') {
        // Hide liberty's default 3D extrusion (replaced by our uniform pixel 3D buildings)
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

    // 1. Pixel water ripples & grass tufts
    const waterLayer = all.find(l => l.id === 'water');
    if (waterLayer && !map.getLayer('manameow-pixel-water')) {
      try {
        map.addLayer({
          ...waterLayer,
          id: 'manameow-pixel-water',
          paint: { 'fill-pattern': 'manameow-pixel-water-tile', 'fill-opacity': 0.85 },
        }, nextOf('water'));
      } catch (e) {}
    }
    const grassLayer = all.find(l => l.id === 'landcover_grass');
    if (grassLayer && !map.getLayer('manameow-pixel-grass')) {
      try {
        map.addLayer({
          ...grassLayer,
          id: 'manameow-pixel-grass',
          paint: { 'fill-pattern': 'manameow-pixel-grass-tile', 'fill-opacity': 0.85 },
        }, nextOf('landcover_grass'));
      } catch (e) {}
    }

    // 2. Dark charcoal asphalt roads with crisp white side lines & white dashed centerline
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
              13, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 5.8, ['secondary', 'tertiary'], 4.3, 3.0],
              16, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 19, ['secondary', 'tertiary'], 14.4, 10.8],
              19, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 35, ['secondary', 'tertiary'], 26.8, 20.4],
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
              16, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 16.2, ['secondary', 'tertiary'], 12.0, 8.8],
              19, ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], 30.5, ['secondary', 'tertiary'], 23.0, 17.2],
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
            'line-dasharray': [4, 4],
            'line-opacity': 0.95,
          },
        }, beforeBuildings);
      } catch (e) {}
    }

    // 3. Stylized top-down roofs (terracotta red, chestnut brown, tangerine ochre, slate grey) with shadow + shingle ribs + dark border
    const roofBucket = [
      '%',
      ['floor', ['abs', ['+', ['coalesce', ['to-number', ['id'], 0], 0], ['*', ['coalesce', ['get', 'render_height'], ['get', 'height'], 6], 7]]]],
      5,
    ];
    const roofColor = [
      'match', roofBucket,
      0, '#E89B8C', // soft pastel coral-peach
      1, '#D9A78B', // warm milk-tea caramel
      2, '#F2BE82', // soft apricot-butter
      3, '#D3DCE6', // light pastel sky-grey flat roof
      '#E4B5A0',    // warm blush-cocoa
    ];
    const roofOutline = [
      'match', roofBucket,
      3, '#8E9BAA', // soft slate parapet for grey roofs
      '#A48472',    // soft warm-taupe border for pastel roofs
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
            'fill-color': 'rgba(110, 96, 82, 0.16)',
            'fill-translate': [4, 4],
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
            'fill-opacity': 0.9,
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
            'line-color': roofOutline,
            'line-width': ['interpolate', ['linear'], ['zoom'], 13, 1.2, 16, 2.2, 18, 2.8],
          },
        });
      } catch (e) {}
    }

    // 4. Uniform 3D pixel-art buildings (visible in 3D tilted mode only: windowed cream walls + matching colored roof cap)
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

    // 5. Lush pixel-art trees & groves
    const baseLayout = {
      'icon-anchor': 'bottom',
      'icon-pitch-alignment': 'viewport',
      'icon-rotation-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-padding': 0,
    };
    const addTree = (id, sourceLayer, { filter, minzoom = 11, placement = 'line', spacing = 14, image = 'manameow-3d-tree-icon' } = {}) => {
      if (map.getLayer(id)) return;
      const layout = {
        ...baseLayout,
        'icon-image': image,
        'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.52, 14, 0.82, 17, 1.15, 19, 1.4],
        'symbol-placement': placement,
      };
      if (placement === 'line') layout['symbol-spacing'] = spacing;
      const def = { id, type: 'symbol', source: 'openmaptiles', 'source-layer': sourceLayer, minzoom, layout };
      if (filter) def.filter = filter;
      try { map.addLayer(def); } catch (e) {}
    };
    const woodFilter = ['==', ['get', 'class'], 'wood'];
    const grassFilter = ['==', ['get', 'class'], 'grass'];
    const greenLanduseFilter = ['in', ['get', 'class'], ['literal', ['cemetery', 'school', 'hospital', 'pitch', 'stadium', 'track']]];

    addTree('manameow-pixel-trees-wood-edge', 'landcover', { filter: woodFilter, minzoom: 11, placement: 'line', spacing: 11, image: 'manameow-3d-grove-icon' });
    addTree('manameow-pixel-trees-wood-center', 'landcover', { filter: woodFilter, minzoom: 11, placement: 'point', image: 'manameow-3d-grove-icon' });
    addTree('manameow-pixel-trees-park-edge', 'park', { minzoom: 11, placement: 'line', spacing: 13, image: 'manameow-3d-tree-icon' });
    addTree('manameow-pixel-trees-park-center', 'park', { minzoom: 11, placement: 'point', image: 'manameow-3d-grove-icon' });
    addTree('manameow-pixel-trees-grass-edge', 'landcover', { filter: grassFilter, minzoom: 12, placement: 'line', spacing: 18, image: 'manameow-3d-tree-icon' });
    addTree('manameow-pixel-trees-grass-center', 'landcover', { filter: grassFilter, minzoom: 12, placement: 'point', image: 'manameow-3d-grove-icon' });
    addTree('manameow-pixel-trees-landuse', 'landuse', { filter: greenLanduseFilter, minzoom: 13, placement: 'line', spacing: 20, image: 'manameow-3d-tree-icon' });
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
