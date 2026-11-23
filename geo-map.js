(() => {
  'use strict';

  const LIBRARY = 'https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs';
  const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const HOME_BOUNDS = [[99.6, 0.9], [104.75, 6.55]];
  const MIN_ZOOM = 4;
  const MAX_ZOOM = 19;
  const OVERVIEW_PITCH = 0;
  const OVERVIEW_BEARING = 0;
  const FOCUS_ZOOM = 17.5;
  const TILT_PITCH = 55;
  const TILT_BEARING = -30;
  const MAX_PITCH = 65;
  const DEGREES = Math.PI / 180;

  const colors = {
    paper: '#EFECE2', // warm watercolor paper
    ocean: '#72B2A4', // teal water
    river: '#72B2A4', // same as ocean
    woodland: '#7E9A5D', // olive green
    grass: '#9EB576', // moss green
    park: '#9EB576', // moss green for parks
    parkEdge: '#B8C894', // lighter moss edge
    neighborhood: '#EFECE2', // neutral ground
    border: '#C5BBA6', // warm gray brown
  };

  const layerPaint = {
    background: { 'background-color': colors.paper },
    natural_earth: { 'raster-opacity': ['interpolate', ['linear'], ['zoom'], 0, .18, 5, .1, 7, 0] },
    water: { 'fill-color': colors.ocean },
    waterway_river: { 'line-color': colors.river },
    waterway_other: { 'line-color': colors.river },
    waterway_tunnel: { 'line-color': colors.river },
    park: { 'fill-color': colors.park, 'fill-outline-color': colors.parkEdge, 'fill-opacity': .84 },
    park_outline: { 'line-color': colors.parkEdge },
    landcover_wood: { 'fill-color': colors.woodland, 'fill-opacity': .82 },
    landcover_grass: { 'fill-color': colors.grass, 'fill-opacity': .78 },
    landuse_residential: { 'fill-color': colors.neighborhood, 'fill-opacity': .7 },
    landcover_sand: { 'fill-color': '#EFE2C6' },
    landuse_pitch: { 'fill-color': '#A8CE78' },
    landuse_track: { 'fill-color': '#E2B69E' },
    landuse_cemetery: { 'fill-color': '#C5D59B', 'fill-opacity': .66 },
    landuse_hospital: { 'fill-color': '#F2DFD3', 'fill-opacity': .62 },
    landuse_school: { 'fill-color': '#ECE2C6', 'fill-opacity': .64 },
    aeroway_fill: { 'fill-color': '#EAE0D2' },
    aeroway_runway: { 'line-color': '#D7C8B8' },
    aeroway_taxiway: { 'line-color': '#D7C8B8' },
    boundary_2: { 'line-color': colors.border, 'line-opacity': .4 },
    boundary_3: { 'line-color': colors.border, 'line-opacity': .2 },
    boundary_disputed: { 'line-color': colors.border, 'line-opacity': .3 },
  };
  const roadColors = {
    road_motorway: ['#F7F3E8', '#C5BBA6'],
    road_motorway_link: ['#F7F3E8', '#C5BBA6'],
    road_trunk_primary: ['#F7F3E8', '#C5BBA6'],
    road_secondary_tertiary: ['#E2D9C5', '#C5BBA6'],
    road_link: ['#E2D9C5', '#C5BBA6'],
    road_minor: ['#E2D9C5', '#C5BBA6'],
    road_service_track: ['#E2D9C5', '#C5BBA6'],
  };
  const walkingPaths = new Set(['road_path_pedestrian', 'bridge_path_pedestrian', 'tunnel_path_pedestrian']);
  const stitchedRoads = new Set(['road_motorway', 'road_trunk_primary']);
  const roundedStroke = { 'line-cap': 'round', 'line-join': 'round' };

  function styleRoad(layer) {
    const id = layer.id.replace(/^(bridge|tunnel)_/, 'road_').replace('road_street', 'road_minor');
    const casing = id.endsWith('_casing');
    const road = casing ? id.slice(0, -7) : id;
    const tone = roadColors[road];
    if (/(?:^|_)rail(?:_|$)/.test(layer.id)) {
      return {
        ...layer,
        paint: { ...layer.paint, 'line-color': '#a9978c', 'line-opacity': .46 },
      };
    }
    if (!tone && !walkingPaths.has(layer.id)) return layer;
    const paint = tone ? { 'line-color': tone[casing ? 1 : 0] } : {
      'line-color': '#ab8695', 'line-dasharray': [1.3, 2.3],
    };
    return {
      ...layer,
      layout: { ...layer.layout, ...roundedStroke },
      paint: { ...layer.paint, ...paint },
    };
  }

  function roadStitches(layer) {
    return {
      ...layer,
      id: 'manameow-' + layer.id + '-stitches',
      minzoom: 11,
      paint: {
        'line-color': '#fff8e9',
        'line-width': ['interpolate', ['linear'], ['zoom'], 11, .52, 16, 1.12],
        'line-dasharray': [1.55, 3.7],
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 11, 0, 14, .57, 17, .75],
      },
    };
  }

  function styleTheMap(_previous, style) {
    const { sprite, glyphs, ...base } = style;
    const layers = style.layers.flatMap(layer => {
      if (layer.type === 'symbol') return [];
      if (layer.type === 'line') {
        const road = styleRoad(layer);
        if (stitchedRoads.has(layer.id)) return [road, roadStitches(road)];
        if (road !== layer) return [road];
      }

      if (layer.id === 'landcover_wetland' || layer.id === 'road_area_pattern') {
        return [{ ...layer, paint: { 'fill-color': layer.id === 'landcover_wetland' ? '#B7CF9B' : '#EFE7DA' } }];
      }
      const custom = layerPaint[layer.id];
      return [custom ? { ...layer, paint: { ...layer.paint, ...custom } } : layer];
    });
    return { ...base, layers };
  }

  function trySetPaint(map, layerId, prop, value) {
    try {
      if (map.getLayer(layerId)) map.setPaintProperty(layerId, prop, value);
    } catch {}
  }

  function applyWarmDioramaPalette(map) {
    const style = map.getStyle();
    if (!style?.layers) return;

    try {
      map.setLight({
        anchor: 'viewport',
        color: '#FFF5E4',
        intensity: 0.48,
        position: [1.35, 225, 42],
      });
    } catch {}

    const buildingBucket = ['%', ['floor', ['abs', ['+', ['coalesce', ['to-number', ['id'], 0], 0], ['*', ['coalesce', ['get', 'render_height'], ['get', 'height'], 8], 3]]]], 6];
    const warmBuildingColor = [
      'match', buildingBucket,
      0, '#ECE2D2', // warm cream parchment
      1, '#D3978F', // dusty terracotta rose
      2, '#95AEB8', // muted storybook slate-blue
      3, '#E5BE6E', // warm golden ochre
      4, '#B4A9B8', // soft lavender-taupe
      '#DCA68B',    // soft brick peach
    ];

    for (const layer of style.layers) {
      const id = layer.id;
      if (layer.type === 'background' && id !== 'manameow-paper-flecks') {
        trySetPaint(map, id, 'background-color', colors.paper);
      } else if (layer.type === 'fill') {
        if (id.includes('water')) {
          trySetPaint(map, id, 'fill-color', colors.ocean);
        } else if (id.includes('park') || id.includes('wood') || id.includes('forest')) {
          trySetPaint(map, id, 'fill-color', colors.park);
          trySetPaint(map, id, 'fill-outline-color', colors.parkEdge);
        } else if (id.includes('grass') || id.includes('meadow') || id.includes('pitch') || id.includes('wetland')) {
          trySetPaint(map, id, 'fill-color', colors.grass);
        } else if (layer['source-layer'] === 'building' || id.includes('building')) {
          trySetPaint(map, id, 'fill-color', '#EFE6D8');
          trySetPaint(map, id, 'fill-outline-color', '#D8C8B4');
        } else if (id.includes('residential') || id.includes('landuse')) {
          trySetPaint(map, id, 'fill-color', colors.neighborhood);
        }
      } else if (layer.type === 'line') {
        if (id.includes('waterway')) {
          trySetPaint(map, id, 'line-color', colors.river);
        } else if (id.includes('road') || id.includes('bridge') || id.includes('tunnel') || id.includes('highway')) {
          if (id.includes('casing')) {
            trySetPaint(map, id, 'line-color', id.includes('motorway') || id.includes('trunk') || id.includes('primary') ? '#C79B84' : '#DDD0BF');
          } else if (id.includes('motorway') || id.includes('trunk') || id.includes('primary')) {
            trySetPaint(map, id, 'line-color', '#E2B198');
          } else if (!id.includes('stitches') && !id.includes('path') && !id.includes('rail')) {
            trySetPaint(map, id, 'line-color', '#F7F1E7');
          }
        }
      } else if (layer.type === 'fill-extrusion') {
        try { map.setLayerZoomRange(id, 13, 24); } catch {}
        trySetPaint(map, id, 'fill-extrusion-color', warmBuildingColor);
        trySetPaint(map, id, 'fill-extrusion-opacity', 0.94);
        trySetPaint(map, id, 'fill-extrusion-vertical-gradient', true);
      }
    }
  }

  function drawRipple(context, x, y) {
    context.beginPath();
    context.moveTo(x, y);
    context.quadraticCurveTo(x + 3, y - 3, x + 6, y);
    context.quadraticCurveTo(x + 9, y + 3, x + 12, y);
    context.moveTo(x + 6, y + 5);
    context.quadraticCurveTo(x + 9, y + 3, x + 12, y + 5);
    context.stroke();
  }

  function storyImage(map, id, width, height, paint) {
    if (map.hasImage(id)) return true;
    const sheet = document.createElement('canvas');
    sheet.width = width * 2;
    sheet.height = height * 2;
    const brush = sheet.getContext('2d');
    if (!brush) return false;
    brush.scale(2, 2);
    brush.lineCap = brush.lineJoin = 'round';
    paint(brush);
    map.addImage(id, brush.getImageData(0, 0, sheet.width, sheet.height), { pixelRatio: 2 });
    return true;
  }

  function storyShape(brush, fill, stroke, path) {
    brush.beginPath();
    path(brush);
    brush.closePath();
    brush.fillStyle = fill;
    brush.fill();
    if (stroke) {
      brush.strokeStyle = stroke;
      brush.stroke();
    }
  }

  function storyEllipse(brush, x, y, rx, ry, color) {
    storyShape(brush, color, null, pen => pen.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2));
  }

  function drawStoryTree(brush, x, y, size, crown, shaded) {
    brush.save();
    brush.translate(x, y);
    brush.scale(size, size);
    brush.lineWidth = 1.25;
    storyEllipse(brush, 1, 11, 11, 3, '#57684624');
    storyShape(brush, '#a18058', '#74674c', pen => {
      pen.moveTo(-2, 12); pen.lineTo(-2, 3); pen.lineTo(2, 3); pen.lineTo(2, 12);
    });
    storyShape(brush, crown, '#667e54', pen => {
      pen.moveTo(-8, 5); pen.bezierCurveTo(-14, 4, -14, -3, -9, -5);
      pen.bezierCurveTo(-11, -11, -6, -15, -2, -14);
      pen.bezierCurveTo(2, -19, 9, -15, 9, -10);
      pen.bezierCurveTo(17, -9, 17, 1, 11, 5);
      pen.bezierCurveTo(9, 10, -7, 9, -8, 5);
    });
    storyShape(brush, shaded, null, pen => {
      pen.moveTo(12, -6); pen.bezierCurveTo(12, 1, 6, 4, -1, 4);
      pen.quadraticCurveTo(-6, 4, -10, 1); pen.bezierCurveTo(-8, 9, 11, 9, 13, 3);
      pen.quadraticCurveTo(15, -1, 12, -6);
    });
    brush.strokeStyle = '#f6eeab99';
    brush.lineWidth = 1.5;
    brush.beginPath();
    brush.moveTo(-7, -7); brush.quadraticCurveTo(-6, -13, -1, -12); brush.stroke();
    brush.restore();
  }

  function drawStoryMountain(brush) {
    brush.lineWidth = 1.5;
    storyEllipse(brush, 37, 43, 30, 4, '#55684a26');
    storyShape(brush, '#aebd89', '#738761', pen => {
      pen.moveTo(4, 43); pen.quadraticCurveTo(12, 36, 17, 25);
      pen.quadraticCurveTo(21, 18, 25, 19); pen.quadraticCurveTo(35, 30, 40, 43);
    });
    storyShape(brush, '#8eb196', '#657f67', pen => {
      pen.moveTo(19, 43); pen.quadraticCurveTo(29, 31, 39, 12);
      pen.quadraticCurveTo(42, 7, 45, 10); pen.quadraticCurveTo(54, 28, 69, 43);
    });
    storyShape(brush, '#779c87', null, pen => {
      pen.moveTo(43, 12); pen.quadraticCurveTo(49, 30, 64, 41);
      pen.lineTo(44, 41); pen.quadraticCurveTo(50, 33, 41, 21);
    });
    brush.strokeStyle = '#eee6b8ba';
    brush.beginPath();
    brush.moveTo(30, 33); brush.quadraticCurveTo(35, 28, 40, 17); brush.stroke();
    drawStoryTree(brush, 27, 40, .38, '#9fba79', '#86a36a');
    drawStoryTree(brush, 51, 41, .34, '#a2bd7f', '#84a371');
  }

  // These summit coordinates are from OpenFreeMap's zoom-7 mountain_peak source.
  // Lower-resolution tiles omit them, so reuse a few summits only in the overview.
  const overviewSummits = [
    [100.8662, 5.4294], [101.2974, 4.69], [102.2353, 4.6332],
    [102.0939, 3.8231], [102.6082, 2.3731], [116.5588, 6.075],
  ];

  function drawStoryCottage(brush, roof, wall) {
    const ink = '#795a4b';
    brush.lineWidth = 1.45;
    storyEllipse(brush, 30, 47, 23, 4, '#84634b30');
    storyShape(brush, '#c59770', ink, pen => {
      pen.moveTo(35, 14); pen.lineTo(35, 7); pen.lineTo(42, 7); pen.lineTo(42, 18);
    });
    storyShape(brush, wall, ink, pen => {
      pen.moveTo(12, 22); pen.lineTo(47, 23); pen.lineTo(48, 43);
      pen.quadraticCurveTo(47, 47, 42, 46); pen.lineTo(14, 46); pen.quadraticCurveTo(11, 45, 11, 41);
    });
    storyShape(brush, roof, ink, pen => {
      pen.moveTo(6, 25); pen.lineTo(27, 8); pen.quadraticCurveTo(29, 6, 33, 9);
      pen.lineTo(53, 26); pen.quadraticCurveTo(49, 29, 44, 27); pen.lineTo(9, 28);
      pen.quadraticCurveTo(5, 28, 6, 25);
    });
    brush.strokeStyle = '#fff1cd8f';
    brush.lineWidth = 1.1;
    brush.beginPath();
    brush.moveTo(12, 23); brush.lineTo(28, 11); brush.moveTo(19, 22); brush.lineTo(32, 13);
    brush.moveTo(26, 22); brush.lineTo(35, 16); brush.stroke();
    brush.lineWidth = 1.1;
    storyShape(brush, '#aa775c', ink, pen => {
      pen.moveTo(26, 46); pen.lineTo(26, 37); pen.quadraticCurveTo(31, 29, 35, 37); pen.lineTo(35, 46);
    });
    for (const x of [16, 38]) {
      storyShape(brush, '#fdf0b5', ink, pen => pen.rect(x, 32, 6, 7));
      brush.strokeStyle = '#a47c54';
      brush.beginPath(); brush.moveTo(x + 3, 32.5); brush.lineTo(x + 3, 38.5); brush.stroke();
    }
    storyEllipse(brush, 33, 41, .7, .8, '#ffdda0');
    storyEllipse(brush, 11, 45, 5, 2.2, '#9cad72');
    storyEllipse(brush, 47, 45, 5, 2.3, '#9cad72');
  }

  function installStorybookArt(map) {
    const layers = map.getStyle().layers;
    const next = layer => layers[layers.indexOf(layer) + 1]?.id;
    const zoom = (values) => ['interpolate', ['linear'], ['zoom'], ...values];
    const pattern = (id, anchor, alpha, paint, size = 128) => {
      const layer = layers.find(candidate => candidate.id === anchor);
      if (!layer || !storyImage(map, id, size, size, paint)) return;
      map.addLayer({ ...layer, id, paint: { 'fill-pattern': id, 'fill-opacity': alpha } }, next(layer));
    };

    if (storyImage(map, 'manameow-paper-flecks', 128, 128, brush => {
      for (let index = 0; index < 48; index++) {
        const x = (13 + index * 43) % 128;
        const y = (8 + index * 19 + Math.floor(index / 5) * 7) % 128;
        storyEllipse(brush, x, y, index % 6 ? .43 : .8, .45, index % 2 ? '#af8b5337' : '#fffdf38a');
      }
    })) {
      map.addLayer({
        id: 'manameow-paper-flecks', type: 'background',
        paint: { 'background-pattern': 'manameow-paper-flecks', 'background-opacity': .67 },
      }, next(layers.find(layer => layer.id === 'background')));
    }

    pattern('manameow-water-ripples', 'water', zoom([4, .53, 6, .9, 11, .46, 15, .37]), brush => {
      brush.strokeStyle = '#e8f2dce6';
      brush.lineWidth = 1.45;
      drawRipple(brush, 15, 22); drawRipple(brush, 77, 57);
      drawRipple(brush, 35, 98); drawRipple(brush, 101, 108);
      storyEllipse(brush, 73, 12, 1.2, .75, '#e1f4e0ab');
      storyEllipse(brush, 6, 65, 1.2, .75, '#e1f4e0ab');
    });
    pattern('manameow-woodland-groves', 'landcover_wood', zoom([4, .57, 7, .69, 15, .72]), brush => {
      drawStoryTree(brush, 23, 35, .53, '#a4bd78', '#88a864');
      drawStoryTree(brush, 34, 41, .72, '#98b976', '#7d9c66');
      drawStoryTree(brush, 95, 70, .7, '#a7c07e', '#85a468');
      drawStoryTree(brush, 82, 77, .45, '#b8ca84', '#92ac6a');
      drawStoryTree(brush, 29, 107, .63, '#aac182', '#8aa66d');
      drawStoryTree(brush, 109, 115, .47, '#a5be78', '#86a367');
    });
    pattern('manameow-meadow-sprigs', 'landcover_grass', zoom([4, .32, 10, .43, 16, .72]), brush => {
      for (const [x, y] of [[17, 29], [65, 99], [99, 47]]) {
        storyEllipse(brush, x, y, 6.9, 2, '#778b4f36');
        storyEllipse(brush, x - 3.7, y - 1.9, 3.7, 2.4, '#9eae69');
        storyEllipse(brush, x + .6, y - 3.1, 3.4, 3.6, '#a6b470');
        storyEllipse(brush, x + 3.4, y - 1.5, 3.9, 2.25, '#93a466');
        storyEllipse(brush, x - .6, y - 4.6, 2, .74, '#e8e8b2b8');
      }
      brush.lineWidth = .9;
      brush.strokeStyle = '#8ca15eab';
      for (const [x, y] of [[50, 55], [111, 111], [91, 12], [23, 87]]) {
        brush.beginPath();
        brush.moveTo(x, y); brush.quadraticCurveTo(x - 1, y - 4, x - 3, y - 5);
        brush.moveTo(x, y); brush.quadraticCurveTo(x + 1, y - 3, x + 3, y - 4);
        brush.stroke();
      }
    });
    pattern('manameow-park-groves', 'park', zoom([4, .65, 11, .72, 16, .82]), brush => {
      drawStoryTree(brush, 20, 28, .66, '#9EC86A', '#7FA854');
      drawStoryTree(brush, 81, 61, .72, '#E2A84E', '#C98A3D');
      drawStoryTree(brush, 94, 69, .48, '#A9D174', '#86B05B');
      drawStoryTree(brush, 39, 104, .54, '#94BE62', '#759D4B');
      for (const [x, y] of [[41, 36], [95, 92], [47, 119], [115, 19], [52, 69]]) {
        storyEllipse(brush, x, y, 2.6, 1.8, '#e6be80');
        storyEllipse(brush, x - 1, y - 1, 1.25, .9, '#fff1ba');
      }
    });

    if (map.getSource('openmaptiles') && storyImage(map, 'manameow-mountain', 72, 51, drawStoryMountain)) {
      const mountainIcon = {
        'icon-image': 'manameow-mountain', 'icon-anchor': 'bottom', 'icon-padding': [12],
        'icon-rotation-alignment': 'viewport',
      };
      map.addSource('manameow-overview-summits', {
        type: 'geojson', data: {
          type: 'FeatureCollection',
          features: overviewSummits.map(coordinates => ({
            type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates },
          })),
        },
      });
      map.addLayer({
        id: 'manameow-overview-mountains', type: 'symbol', source: 'manameow-overview-summits', maxzoom: 7,
        layout: { ...mountainIcon, 'icon-size': zoom([4, .42, 7, .55]) },
        paint: { 'icon-opacity': .88 },
      });
      map.addLayer({
        id: 'manameow-mountains', type: 'symbol', source: 'openmaptiles', 'source-layer': 'mountain_peak', minzoom: 7,
        filter: ['>=', ['to-number', ['get', 'ele'], 0], 650],
        layout: {
          ...mountainIcon, 'icon-size': zoom([7, .55, 10, .74, 16, .9]),
          'symbol-sort-key': ['-', ['to-number', ['get', 'ele'], 0]],
        },
        paint: { 'icon-opacity': .88 },
      });
    }

    // Preserve OpenFreeMap liberty 3D buildings without overlaying flat 2D cottages.
  }

  // Generalized coastlines for the built-in overview. The streets and boundaries
  // in the online map come from OpenStreetMap via OpenFreeMap.
  const land = [
    [[98, 10], [105.1, 10], [105.3, 8], [104.55, 6.5], [103.48, 5.43],
      [103.13, 5.2], [103.43, 4.47], [103.45, 3.9], [103.39, 3.14],
      [103.78, 2.62], [103.98, 2.31], [104.23, 1.63], [104.18, 1.37],
      [103.7, 1.42], [103.5, 1.3], [103.32, 1.52], [103.43, 1.82],
      [102.68, 2.09], [102.31, 2.21], [101.91, 2.44], [101.64, 2.8],
      [101.3, 2.93], [101.19, 3.29], [100.93, 3.71], [100.72, 3.9],
      [100.54, 4.13], [100.66, 4.38], [100.55, 4.76], [100.36, 5.09],
      [100.4, 5.53], [100.34, 6.04], [100.11, 6.33], [100.14, 6.49],
      [99.92, 6.71], [99.76, 6.97], [99.67, 7.11], [99.5, 7.6],
      [99.08, 8.21], [98.51, 8.37], [98.5, 8.92]],
    [[93.6, 6.9], [95.21, 5.59], [95.88, 5.55], [97.11, 5.23],
      [98.04, 4.83], [98.27, 4.43], [98.67, 4.1], [99.06, 3.57],
      [99.86, 3.19], [100.19, 2.77], [100.7, 2.26], [101.24, 2.12],
      [101.71, 1.76], [102.12, 1.4], [102.49, 1.14], [103.03, 0.98],
      [103.39, 0.58], [103.49, 0], [104.05, -0.72], [104.91, -1.14],
      [105.9, -2.5], [105.45, -4.5], [98.1, -4.5], [93.6, 0]],
    [[108.57, .84], [109.03, 1.71], [109.71, 1.8], [110.57, 1.47],
      [111.3, 1.93], [111.89, 2.69], [112.78, 2.83], [113.43, 3.17],
      [113.93, 4.14], [114.72, 4.95], [115.31, 5.19], [115.5, 5.84],
      [116.12, 6.08], [116.58, 6.68], [117.11, 7.05], [117.3, 6.76],
      [117.65, 6.67], [117.63, 6.32], [118, 6.12], [117.93, 5.81],
      [118.62, 5.62], [119.17, 5.09], [118.56, 4.73], [118.12, 4.27],
      [117.56, 4.11], [117.65, 3.72], [118.02, 2.37], [117.66, 1.43],
      [118.07, -.02], [117.17, -1.01], [116.63, -1.96], [116.31, -3.59],
      [114.49, -4.15], [112.64, -3.41], [110.37, -2.53], [109.04, -1.18]],
    [[100.16, 5.47], [100.29, 5.48], [100.33, 5.38], [100.27, 5.26],
      [100.17, 5.30], [100.16, 5.37]],
    [[103.6, 1.36], [103.72, 1.43], [103.94, 1.42], [104.04, 1.33],
      [103.86, 1.23], [103.65, 1.27]],
    [[99.63, 6.4], [99.75, 6.43], [99.85, 6.29], [99.78, 6.26],
      [99.64, 6.28]],
    [[104.08, 0.95], [104.21, 1.04], [104.36, 1.01], [104.41, 0.9],
      [104.18, 0.74], [104.09, 0.83]],
    [[104.39, .97], [104.44, 1.12], [104.57, 1.19], [104.64, 1.08],
      [104.58, .93], [104.47, .87]]
  ];

  const clamp = (value, lower, upper) => Math.max(lower, Math.min(upper, value));
  const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + lat * DEGREES / 2)) / DEGREES;
  const geographicY = y => (2 * Math.atan(Math.exp(y * DEGREES)) - Math.PI / 2) / DEGREES;
  const factorFor = zoom => 512 * 2 ** zoom / 360;
  const normaliseCenter = coords => ({
    lng: clamp(coords.lng, -180, 180),
    lat: clamp(coords.lat, -85.051129, 85.051129)
  });

  function fallbackCamera(width, height) {
    const padding = Math.min(62, Math.max(24, width * .1));
    const [[west, south], [east, north]] = HOME_BOUNDS;
    const fit = Math.min((width - 2 * padding) / (east - west),
      (height - 2 * padding) / (mercatorY(north) - mercatorY(south)));
    return {
      lng: (west + east) / 2,
      lat: geographicY((mercatorY(south) + mercatorY(north)) / 2),
      zoom: clamp(Math.log2(Math.max(1, fit) * 360 / 512), MIN_ZOOM, 7)
    };
  }

  function createManaMap(container, { cards = [], select: selectCard, onPick, onTiltChange, translate } = {}) {
    const canvas = document.createElement('canvas');
    const engine = document.createElement('div');
    const pinLayer = document.createElement('div');
    const fallbackCredit = document.createElement('span');
    const context = canvas.getContext('2d');
    const storybookFallback = context && window.createStorybookFallback?.(context);
    let fallbackLoading = false;
    let map = null;
    let loaded = false;
    let picking = false;
    let selectedId = null;
    let width = Math.max(container.clientWidth, 1);
    let height = Math.max(container.clientHeight, 1);
    let camera = fallbackCamera(width, height);
    let atHome = true;
    let drag = null;
    let frame = null;
    let pins = [];

    container.classList.add('mana-map');
    canvas.className = 'mana-map__schematic';
    canvas.tabIndex = 0;
    canvas.setAttribute('aria-label', 'Map overview. Arrow keys move the map. Use plus or minus to zoom.');
    engine.className = 'mana-map__engine';
    engine.setAttribute('aria-hidden', 'true');
    engine.inert = true;
    pinLayer.className = 'mana-map__pins';
    fallbackCredit.className = 'mana-map__schematic-credit';
    fallbackCredit.setAttribute('role', 'status');
    container.prepend(canvas, engine, pinLayer, fallbackCredit);

    function project(lng, lat) {
      if (loaded) return map.project([lng, lat]);
      const scale = factorFor(camera.zoom);
      return {
        x: width / 2 + (lng - camera.lng) * scale,
        y: height / 2 - (mercatorY(lat) - mercatorY(camera.lat)) * scale
      };
    }

    function unproject(x, y) {
      const scale = factorFor(camera.zoom);
      return {
        lng: camera.lng + (x - width / 2) / scale,
        lat: geographicY(mercatorY(camera.lat) - (y - height / 2) / scale)
      };
    }

    function drawSchematic() {
      let mode = 'area';
      if (storybookFallback) {
        mode = storybookFallback({ width, height, camera, project, land });
      } else if (context) {
        context.fillStyle = '#f3e7d7';
        context.fillRect(0, 0, width, height);
      }

      const [key, defaultLabel] = fallbackLoading
        ? ['mapFallbackLoading', 'Loading the live map…']
        : {
          overview: ['mapFallbackOverview', 'Live map unavailable · approximate overview'],
          detail: ['mapFallbackDetail', 'Live map unavailable · street detail unavailable'],
          area: ['mapFallbackArea', 'Live map unavailable for this view'],
        }[mode];
      const label = translate?.(key) ?? defaultLabel;
      if (fallbackCredit.textContent !== label) fallbackCredit.textContent = label;
    }

    function drawPins() {
      const placed = [];
      pins.forEach(({ card, button }) => {
        const point = project(card.lng, card.lat);
        const { x, y } = point;
        button.hidden = x < -18 || y < -18 || x > width + 18 || y > height + 18;
        if (button.hidden) return;

        // Offset overlapping buttons so each sighting remains independently selectable.
        let offset = 0;
        let candidate = 0;
        while (placed.some(pin => Math.abs(pin.x - x - offset) < 53 && Math.abs(pin.y - y) < 48)) {
          candidate += 1;
          offset = Math.ceil(candidate / 2) * 54 * (candidate % 2 ? 1 : -1);
        }
        placed.push({ x: x + offset, y });
        button.style.left = `${x + offset}px`;
        button.style.top = `${y}px`;
        button.style.zIndex = card.id === selectedId ? '10000' : String(Math.max(1, Math.round(y)));
        button.classList.toggle('mana-map__pin--active', card.id === selectedId);
        if (x + offset >= 0 && x + offset <= width && y >= 0 && y <= height) window.loadManaPixelCatCoat?.(button);
      });
    }

    function render() {
      frame = null;
      if (!loaded) drawSchematic();
      drawPins();
    }

    function scheduleRender() {
      if (frame === null) frame = requestAnimationFrame(render);
    }

    function setCards(nextCards) {
      const existing = new Map(pins.map(pin => [pin.card.id,pin]));
      pins = nextCards.filter(card => Number.isFinite(card.lat) && Number.isFinite(card.lng))
        .map(card => {
          let pin = existing.get(card.id);
          if (!pin) {
            const button = document.createElement('button');
            const paw = document.createElement('span');
            const label = document.createElement('span');
            button.className = 'mana-map__pin';
            button.type = 'button';
            paw.className = 'mana-map__paw';
            paw.setAttribute('aria-hidden', 'true');
            label.className = 'mana-map__pin-name';
            button.append(paw, label);
            pin = { card, button, label };
            button.addEventListener('click', () => {
              const { id, lat, lng } = pin.card;
              if (picking) onPick?.({ lat, lng });
              else selectCard?.(id);
            });
            pinLayer.append(button);
          }
          pin.card = card;
          window.attachManaPixelCat?.(pin.button, card);
          pin.button.dataset.category = String(card.category ?? '').toLowerCase();
          pin.button.setAttribute('aria-label', card.name);
          pin.label.textContent = card.name;
          existing.delete(card.id);
          return pin;
        });
      for (const pin of existing.values()) pin.button.remove();
      scheduleRender();
    }

    function center(coords, zoom = coords?.zoom) {
      if (!coords) {
        if (!loaded) return { ...camera };
        const { lng, lat } = map.getCenter();
        return { lng, lat, zoom: map.getZoom() };
      }
      if (!Number.isFinite(coords.lng) || !Number.isFinite(coords.lat)) return center();
      atHome = false;
      camera = {
        ...normaliseCenter(coords),
        zoom: clamp(zoom ?? center().zoom, MIN_ZOOM, MAX_ZOOM)
      };
      if (loaded) {
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        map.easeTo({ center: [camera.lng, camera.lat], zoom: camera.zoom, duration: reduceMotion ? 0 : 350 });
      } else if (map) {
        // Ask for the nearby tiles even if the initial overview is still loading.
        map.jumpTo({ center: [camera.lng, camera.lat], zoom: camera.zoom });
      }
      scheduleRender();
      return { ...camera };
    }

    let lastTilted = false;
    function syncTiltState() {
      const tilted = Boolean(loaded && map && map.getPitch() >= 20);
      if (tilted !== lastTilted) {
        lastTilted = tilted;
        if (map) window.manaDiorama?.setMode(map, tilted);
        onTiltChange?.(tilted);
      }
    }

    function toggleTilt() {
      if (!loaded || !map) return false;
      const nextTilted = map.getPitch() < 20;
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      map.easeTo({
        pitch: nextTilted ? TILT_PITCH : OVERVIEW_PITCH,
        bearing: nextTilted ? TILT_BEARING : OVERVIEW_BEARING,
        duration: reduceMotion ? 0 : 450,
      });
      return nextTilted;
    }

    function select(id, { onArrive } = {}) {
      selectedId = id;
      const match = pins.find(({ card }) => card.id === id);
      if (match) {
        const current = center();
        const targetZoom = clamp(Math.max(current.zoom, FOCUS_ZOOM), MIN_ZOOM, MAX_ZOOM);
        atHome = false;
        camera = { ...normaliseCenter(match.card), zoom: targetZoom };
        if (loaded) {
          const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
          const alreadyClose = current.zoom >= FOCUS_ZOOM - 0.5;
          const duration = reduceMotion ? 0 : (alreadyClose ? 350 : 850);
          if (onArrive) {
            if (duration === 0) {
              queueMicrotask(() => { if (selectedId === id) onArrive(); });
            } else {
              let settled = false;
              const finish = () => {
                if (settled) return;
                settled = true;
                if (selectedId === id) onArrive();
              };
              map.once('moveend', finish);
              setTimeout(finish, duration + 150);
            }
          }
          map.flyTo({
            center: [camera.lng, camera.lat],
            zoom: camera.zoom,
            duration,
            essential: true,
          });
        } else if (map) {
          map.jumpTo({
            center: [camera.lng, camera.lat],
            zoom: camera.zoom,
          });
          onArrive?.();
        } else {
          onArrive?.();
        }
      }
      scheduleRender();
    }

    function zoomBy(factor) {
      if (!Number.isFinite(factor) || factor <= 0) return;
      const current = center();
      center(current, current.zoom + Math.log2(factor));
    }

    function reset() {
      camera = fallbackCamera(width, height);
      atHome = true;
      selectedId = null;
      if (loaded) {
        map.jumpTo({
          center: [camera.lng, camera.lat],
          zoom: camera.zoom,
          pitch: OVERVIEW_PITCH,
          bearing: OVERVIEW_BEARING,
        });
      }
      scheduleRender();
    }

    function setPicking(value) {
      picking = Boolean(value);
      container.classList.toggle('mana-map--picking', picking);
      canvas.setAttribute('aria-label', picking ?
        'Map overview. Use arrow keys to move and Enter to choose the centre of the map.' :
        'Map overview. Arrow keys move the map. Use plus or minus to zoom.');
    }

    function sizeMap() {
      width = Math.max(container.clientWidth, 1);
      height = Math.max(container.clientHeight, 1);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
      map?.resize();
      if (atHome) reset();
      scheduleRender();
    }

    function pan(dx, dy) {
      const p = unproject(width / 2 - dx, height / 2 - dy);
      camera = { ...camera, ...normaliseCenter(p) };
      atHome = false;
      scheduleRender();
    }

    canvas.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = { pointer: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', event => {
      if (drag?.pointer !== event.pointerId) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      Object.assign(drag, { x: event.clientX, y: event.clientY, moved: true });
      canvas.classList.add('mana-map__schematic--dragging');
      pan(dx, dy);
    });
    canvas.addEventListener('pointerup', event => {
      if (drag?.pointer !== event.pointerId) return;
      if (picking && !drag.moved) {
        const bounds = canvas.getBoundingClientRect();
        onPick?.(unproject(event.clientX - bounds.left, event.clientY - bounds.top));
      }
      drag = null;
      canvas.classList.remove('mana-map__schematic--dragging');
    });
    canvas.addEventListener('lostpointercapture', () => {
      drag = null;
      canvas.classList.remove('mana-map__schematic--dragging');
    });
    canvas.addEventListener('wheel', event => {
      event.preventDefault();
      zoomBy(event.deltaY < 0 ? 1.25 : .8);
    }, { passive: false });
    canvas.addEventListener('keydown', event => {
      const steps = { ArrowLeft: [56, 0], ArrowUp: [0, 56], ArrowRight: [-56, 0], ArrowDown: [0, -56] };
      if (event.key in steps) pan(...steps[event.key]);
      else if (event.key === '+' || event.key === '=') zoomBy(2);
      else if (event.key === '-') zoomBy(.5);
      else if (event.key === 'Enter' && picking) onPick?.({ lat: camera.lat, lng: camera.lng });
      else return;
      event.preventDefault();
    });

    const resizeObserver = new ResizeObserver(sizeMap);
    resizeObserver.observe(container);
    setCards(cards);
    sizeMap();

    function showFallback() {
      fallbackLoading = false;
      if (loaded) camera = center();
      loaded = false;
      container.classList.remove('mana-map--online');
      engine.setAttribute('aria-hidden', 'true');
      engine.inert = true;
      canvas.tabIndex = 0;
      canvas.removeAttribute('aria-hidden');
      scheduleRender();
    }

    // Preserve the current camera when a connection returns after an offline launch.
    let connecting = false;
    async function connectMap() {
      if (connecting || loaded || !navigator.onLine) return;
      connecting = true;
      fallbackLoading = true;
      scheduleRender();
      try {
        const library = await import(LIBRARY);
        if (!navigator.onLine) return;
        map?.remove();
        map = null;
        attachMap(library);
      } catch {
        showFallback();
      } finally {
        connecting = false;
      }
    }

    function attachMap({ Map, AttributionControl }) {
      map = new Map({
        container: engine, style: STYLE, center: [camera.lng, camera.lat], zoom: camera.zoom,
        pitch: OVERVIEW_PITCH, bearing: OVERVIEW_BEARING,
        minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, maxPitch: MAX_PITCH, dragRotate: true, touchPitch: true,
        renderWorldCopies: false, cooperativeGestures: false, attributionControl: false,
        transformStyle: styleTheMap
      });
      map.addControl(new AttributionControl({ compact: true }), 'bottom-right');
      map.on('style.load', () => {
        applyWarmDioramaPalette(map);
      });
      map.once('load', () => {
        if (!navigator.onLine) {
          showFallback();
          return;
        }
        fallbackLoading = false;
        map.jumpTo({
          center: [camera.lng, camera.lat],
          zoom: camera.zoom,
          pitch: OVERVIEW_PITCH,
          bearing: OVERVIEW_BEARING,
        });
        applyWarmDioramaPalette(map);
        installStorybookArt(map);
        window.manaDiorama?.apply(map);
        loaded = true;
        container.classList.add('mana-map--online');
        engine.removeAttribute('aria-hidden');
        engine.inert = false;
        canvas.tabIndex = -1;
        canvas.setAttribute('aria-hidden', 'true');
        scheduleRender();
      });
      map.on('error', () => {
        if (!loaded) showFallback();
      });
      map.on('webglcontextlost', showFallback);
      map.on('webglcontextrestored', () => requestAnimationFrame(connectMap));
      map.on('move', scheduleRender);
      map.on('pitch', () => { syncTiltState(); scheduleRender(); });
      map.on('rotate', scheduleRender);
      map.on('movestart', event => { if (event.originalEvent) atHome = false; });
      map.on('click', ({ lngLat }) => { if (picking) onPick?.({ lng: lngLat.lng, lat: lngLat.lat }); });
      map.getCanvas().addEventListener('keydown', event => {
        if (event.key !== 'Enter' || !picking) return;
        const { lng, lat } = center();
        onPick?.({ lng, lat });
      });
    }

    window.addEventListener('online', connectMap);
    window.addEventListener('offline', showFallback);
    connectMap();

    return { setCards, select, zoomBy, reset, setPicking, center, toggleTilt };
  }

  window.createManaMap = createManaMap;
})();
