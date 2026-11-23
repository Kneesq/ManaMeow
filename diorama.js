(() => {
  'use strict';

  // Cozy 16-bit pixel-art palette matching the approved ManaMeow mockup
  const C = {
    paper: '#F0E6D2',
    park: '#A4C373',
    lawn: '#B5CE84',
    forest: '#85AC5C',
    water: '#7CC2B6',
    shore: '#EFE5CE',
    roadMain: '#F4EBDA',
    roadMinor: '#ECE0CA',
    roadEdge: '#B39E84',
    flatHouse: '#F4DFC0',
    flatHouseEdge: '#9F8365',
    blockHouse: '#F4DFC0',
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
    // Ground shadow
    px(ox + 3, oy + 18, 10, 2, 'rgba(74,90,58,0.28)');
    // Trunk
    px(ox + 6, oy + 14, 4, 5, '#57402D');
    px(ox + 7, oy + 14, 2, 4, '#8E6849');
    // Canopy outline (rounded 16-bit tree silhouette)
    px(ox + 5, oy + 1, 6, 1, out);
    px(ox + 3, oy + 2, 10, 1, out);
    px(ox + 2, oy + 3, 12, 2, out);
    px(ox + 1, oy + 5, 14, 7, out);
    px(ox + 2, oy + 12, 12, 2, out);
    px(ox + 4, oy + 14, 8, 1, out);
    // Mid foliage fill
    px(ox + 5, oy + 2, 6, 1, mid);
    px(ox + 3, oy + 3, 10, 2, mid);
    px(ox + 2, oy + 5, 12, 7, mid);
    px(ox + 4, oy + 12, 8, 2, mid);
    // Bottom-right shading
    px(ox + 3, oy + 11, 10, 2, dark);
    px(ox + 10, oy + 7, 4, 4, dark);
    px(ox + 11, oy + 5, 2, 3, dark);
    px(ox + 4, oy + 12, 8, 1, dark);
    // Top-left highlights
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
    // Hill silhouette
    px(11, 2, 10, 1, out);
    px(8, 3, 16, 1, out);
    px(6, 4, 20, 2, out);
    px(4, 6, 24, 3, out);
    px(2, 9, 28, 4, out);
    px(1, 13, 30, 4, out);
    // Fill
    px(11, 3, 10, 1, mid);
    px(8, 4, 16, 2, mid);
    px(6, 6, 20, 3, mid);
    px(4, 9, 24, 4, mid);
    px(2, 13, 28, 4, mid);
    // Right shade
    px(18, 5, 5, 2, dark);
    px(20, 7, 6, 3, dark);
    px(22, 10, 6, 3, dark);
    px(23, 13, 6, 4, dark);
    // Left highlight
    px(11, 3, 6, 2, light);
    px(8, 5, 6, 2, light);
    px(6, 7, 5, 2, light);
    // Pixel grass dots
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
    return true;
  }

  function recolor(map) {
    try {
      map.setLight({
        anchor: 'viewport',
        color: '#FFF8E8',
        intensity: 0.42,
        position: [1.3, 215, 45],
      });
    } catch (e) {}

    const layers = (map.getStyle() || {}).layers || [];
    for (const layer of layers) {
      const id = layer.id;
      if (id === 'manameow-water-ripples' || id === 'manameow-meadow-sprigs' || id === 'manameow-paper-flecks') {
        try { map.setLayoutProperty(id, 'visibility', 'none'); } catch (e) {}
        continue;
      }
      if (id === 'manameow-mountains' || id === 'manameow-overview-mountains') {
        try { map.setLayoutProperty(id, 'icon-image', 'manameow-pixel-hill-icon'); } catch (e) {}
        continue;
      }
      if (id.startsWith('manameow-')) continue;

      if (layer.type === 'background') {
        setColor(map, id, 'background-color', C.paper);
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
          setColor(map, id, 'fill-color', C.flatHouse);
          setColor(map, id, 'fill-outline-color', C.flatHouseEdge);
        } else if (/residential|landuse|hospital|school/.test(id)) {
          setColor(map, id, 'fill-color', C.paper);
        }
      } else if (layer.type === 'line') {
        if (id.includes('waterway')) {
          setColor(map, id, 'line-color', C.water);
        } else if (/road|bridge|tunnel|highway/.test(id) && !/rail|path|stitches/.test(id)) {
          if (id.includes('casing')) setColor(map, id, 'line-color', C.roadEdge);
          else if (/motorway|trunk|primary/.test(id)) setColor(map, id, 'line-color', C.roadMain);
          else setColor(map, id, 'line-color', C.roadMinor);
        }
      } else if (layer.type === 'fill-extrusion') {
        // Uniform warm-cream flat-roof pixel-style blocks in 3D mode
        try { map.setLayerZoomRange(id, 14, 24); } catch (e) {}
        setColor(map, id, 'fill-extrusion-color', C.blockHouse);
        setColor(map, id, 'fill-extrusion-height', 11);
        setColor(map, id, 'fill-extrusion-base', 0);
        setColor(map, id, 'fill-extrusion-opacity', 1);
        setColor(map, id, 'fill-extrusion-vertical-gradient', true);
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

    // Pixel water ripples & grass tufts (visible in both 2D & 3D)
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

    // Lush pixel-art trees & groves (visible in both 2D & 3D, upright in 3D!)
    const firstBlock = all.find(l => l.type === 'fill-extrusion');
    const before = firstBlock ? firstBlock.id : undefined;
    const baseLayout = {
      'icon-anchor': 'bottom',
      'icon-pitch-alignment': 'viewport',
      'icon-rotation-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-padding': 0,
    };
    const add = (id, sourceLayer, { filter, minzoom = 11, placement = 'line', spacing = 14, image = 'manameow-3d-tree-icon' } = {}) => {
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
      try { map.addLayer(def, before); } catch (e) {}
    };
    const woodFilter = ['==', ['get', 'class'], 'wood'];
    const grassFilter = ['==', ['get', 'class'], 'grass'];
    const greenLanduseFilter = ['in', ['get', 'class'], ['literal', ['cemetery', 'school', 'hospital', 'pitch', 'stadium', 'track']]];

    add('manameow-pixel-trees-wood-edge', 'landcover', { filter: woodFilter, minzoom: 11, placement: 'line', spacing: 11, image: 'manameow-3d-grove-icon' });
    add('manameow-pixel-trees-wood-center', 'landcover', { filter: woodFilter, minzoom: 11, placement: 'point', image: 'manameow-3d-grove-icon' });
    add('manameow-pixel-trees-park-edge', 'park', { minzoom: 11, placement: 'line', spacing: 13, image: 'manameow-3d-tree-icon' });
    add('manameow-pixel-trees-park-center', 'park', { minzoom: 11, placement: 'point', image: 'manameow-3d-grove-icon' });
    add('manameow-pixel-trees-grass-edge', 'landcover', { filter: grassFilter, minzoom: 12, placement: 'line', spacing: 18, image: 'manameow-3d-tree-icon' });
    add('manameow-pixel-trees-grass-center', 'landcover', { filter: grassFilter, minzoom: 12, placement: 'point', image: 'manameow-3d-grove-icon' });
    add('manameow-pixel-trees-landuse', 'landuse', { filter: greenLanduseFilter, minzoom: 13, placement: 'line', spacing: 20, image: 'manameow-3d-tree-icon' });
  }

  function setMode(map, tilted) {
    const all = (map.getStyle() || {}).layers || [];
    const show = tilted ? 'visible' : 'none';
    for (const layer of all) {
      if (layer.type === 'fill-extrusion') {
        try { map.setLayoutProperty(layer.id, 'visibility', show); } catch (e) {}
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
