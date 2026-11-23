(() => {
  'use strict';

  const C = {
    paper: '#EFECE2', park: '#9EB576', lawn: '#B8C894', forest: '#7E9A5D',
    water: '#72B2A4', shore: '#E8E0CC',
    roadMain: '#F7F3E8', roadMinor: '#E2D9C5', roadEdge: '#C5BBA6',
    flatHouse: '#D9CBB8', flatHouseEdge: '#B8A894', blockHouse: '#EDE4D3',
  };

  function setColor(map, id, prop, value) {
    try { if (map.getLayer(id)) map.setPaintProperty(id, prop, value); } catch (e) {}
  }

  function recolor(map) {
    const layers = (map.getStyle() || {}).layers || [];
    for (const layer of layers) {
      const id = layer.id;
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
        try { map.setLayerZoomRange(id, 14, 24); } catch (e) {}
        setColor(map, id, 'fill-extrusion-color', C.blockHouse);
        setColor(map, id, 'fill-extrusion-height', 9);
        setColor(map, id, 'fill-extrusion-base', 0);
        setColor(map, id, 'fill-extrusion-opacity', 1);
        setColor(map, id, 'fill-extrusion-vertical-gradient', true);
      }
    }
  }

  function paintTree(g, ox, oy, scale, shades) {
    g.save();
    g.translate(ox, oy);
    g.scale(scale, scale);
    g.fillStyle = 'rgba(80,90,60,0.22)';
    g.beginPath(); g.ellipse(14, 33, 9, 2.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9C7A55';
    g.fillRect(12.5, 20, 3, 13);
    const blobs = [
      [14, 12, 9, shades[0]],
      [8.5, 17, 6, shades[1]],
      [19.5, 17, 6, shades[2]],
      [14, 9, 6, shades[3]],
    ];
    for (const [x, y, r, col] of blobs) {
      g.fillStyle = col;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(255,250,220,0.45)';
    g.beginPath(); g.arc(11, 8, 2.4, 0, Math.PI * 2); g.fill();
    g.restore();
  }

  function addTreeIcons(map) {
    const s = 2;
    if (!map.hasImage('manameow-3d-tree-icon')) {
      const w = 28, h = 36;
      const sheet = document.createElement('canvas');
      sheet.width = w * s;
      sheet.height = h * s;
      const g = sheet.getContext('2d');
      if (!g) return false;
      g.scale(s, s);
      paintTree(g, 0, 0, 1, ['#8FAE68', '#7E9A5D', '#86A562', '#A3BF7C']);
      map.addImage('manameow-3d-tree-icon', g.getImageData(0, 0, sheet.width, sheet.height), { pixelRatio: s });
    }
    if (!map.hasImage('manameow-3d-grove-icon')) {
      const w = 52, h = 42;
      const sheet = document.createElement('canvas');
      sheet.width = w * s;
      sheet.height = h * s;
      const g = sheet.getContext('2d');
      if (!g) return false;
      g.scale(s, s);
      paintTree(g, 2, 4, 0.85, ['#7E9A5D', '#6F8B50', '#799458', '#94B16E']);
      paintTree(g, 24, 3, 0.9, ['#8FAE68', '#7D995C', '#86A462', '#A6C280']);
      paintTree(g, 12, 8, 0.95, ['#98B670', '#83A060', '#8CA967', '#B2CC8A']);
      map.addImage('manameow-3d-grove-icon', g.getImageData(0, 0, sheet.width, sheet.height), { pixelRatio: s });
    }
    return true;
  }

  function addTreeLayers(map) {
    if (!map.getSource('openmaptiles') || !addTreeIcons(map)) return;
    const all = (map.getStyle() || {}).layers || [];
    const firstBlock = all.find(l => l.type === 'fill-extrusion');
    const before = firstBlock ? firstBlock.id : undefined;
    const baseLayout = {
      'icon-anchor': 'bottom',
      'icon-pitch-alignment': 'viewport',
      'icon-rotation-alignment': 'viewport',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-padding': 0,
      visibility: 'none',
    };
    const add = (id, sourceLayer, { filter, minzoom = 11, placement = 'line', spacing = 14, image = 'manameow-3d-tree-icon', size } = {}) => {
      if (map.getLayer(id)) return;
      const layout = {
        ...baseLayout,
        'icon-image': image,
        'icon-size': size || ['interpolate', ['linear'], ['zoom'], 11, 0.42, 14, 0.72, 17, 1.05, 19, 1.3],
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

    add('manameow-3d-trees-wood-edge', 'landcover', { filter: woodFilter, minzoom: 11, placement: 'line', spacing: 12, image: 'manameow-3d-grove-icon' });
    add('manameow-3d-trees-wood-center', 'landcover', { filter: woodFilter, minzoom: 11, placement: 'point', image: 'manameow-3d-grove-icon' });
    add('manameow-3d-trees-park-edge', 'park', { minzoom: 11, placement: 'line', spacing: 14, image: 'manameow-3d-tree-icon' });
    add('manameow-3d-trees-park-center', 'park', { minzoom: 11, placement: 'point', image: 'manameow-3d-grove-icon' });
    add('manameow-3d-trees-grass-edge', 'landcover', { filter: grassFilter, minzoom: 12, placement: 'line', spacing: 18, image: 'manameow-3d-tree-icon' });
    add('manameow-3d-trees-grass-center', 'landcover', { filter: grassFilter, minzoom: 12, placement: 'point', image: 'manameow-3d-grove-icon' });
    add('manameow-3d-trees-landuse', 'landuse', { filter: greenLanduseFilter, minzoom: 13, placement: 'line', spacing: 20, image: 'manameow-3d-tree-icon' });
  }

  function setMode(map, tilted) {
    const all = (map.getStyle() || {}).layers || [];
    const show = tilted ? 'visible' : 'none';
    for (const layer of all) {
      const only3d = layer.type === 'fill-extrusion' || layer.id.indexOf('manameow-3d-') === 0;
      if (!only3d) continue;
      try { map.setLayoutProperty(layer.id, 'visibility', show); } catch (e) {}
    }
  }

  function apply(map) {
    recolor(map);
    addTreeLayers(map);
    setMode(map, map.getPitch() >= 20);
  }

  window.manaDiorama = { apply, setMode };
})();
