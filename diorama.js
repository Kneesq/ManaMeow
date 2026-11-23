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

  function addTreeIcon(map) {
    if (map.hasImage('manameow-3d-tree-icon')) return true;
    const w = 28, h = 36, s = 2;
    const sheet = document.createElement('canvas');
    sheet.width = w * s;
    sheet.height = h * s;
    const g = sheet.getContext('2d');
    if (!g) return false;
    g.scale(s, s);
    g.fillStyle = 'rgba(80,90,60,0.22)';
    g.beginPath(); g.ellipse(14, 33, 9, 2.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#9C7A55';
    g.fillRect(12.5, 20, 3, 13);
    const blobs = [[14, 12, 9, '#8FAE68'], [8.5, 17, 6, '#7E9A5D'], [19.5, 17, 6, '#86A562'], [14, 9, 6, '#A3BF7C']];
    for (const [x, y, r, col] of blobs) {
      g.fillStyle = col;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = 'rgba(255,250,220,0.45)';
    g.beginPath(); g.arc(11, 8, 2.4, 0, Math.PI * 2); g.fill();
    map.addImage('manameow-3d-tree-icon', g.getImageData(0, 0, sheet.width, sheet.height), { pixelRatio: s });
    return true;
  }

  function addTreeLayers(map) {
    if (!map.getSource('openmaptiles') || !addTreeIcon(map)) return;
    const all = (map.getStyle() || {}).layers || [];
    const firstBlock = all.find(l => l.type === 'fill-extrusion');
    const before = firstBlock ? firstBlock.id : undefined;
    const icon = {
      'icon-image': 'manameow-3d-tree-icon',
      'icon-anchor': 'bottom',
      'icon-pitch-alignment': 'viewport',
      'icon-rotation-alignment': 'viewport',
      'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.55, 16, 0.9, 18, 1.2],
      'symbol-placement': 'line',
      'symbol-spacing': 30,
      visibility: 'none',
    };
    const add = (id, sourceLayer, filter) => {
      if (map.getLayer(id)) return;
      const def = { id, type: 'symbol', source: 'openmaptiles', 'source-layer': sourceLayer, minzoom: 13, layout: icon };
      if (filter) def.filter = filter;
      try { map.addLayer(def, before); } catch (e) {}
    };
    add('manameow-3d-trees-park', 'park');
    add('manameow-3d-trees-wood', 'landcover', ['==', ['get', 'class'], 'wood']);
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
