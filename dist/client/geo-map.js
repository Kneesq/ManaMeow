(() => {
  'use strict';

  const LIBRARY = 'https://unpkg.com/maplibre-gl@6.19.0/dist/maplibre-gl.mjs';
  const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
  const HOME_BOUNDS = [[99.6, 0.9], [104.75, 6.55]];
  const MIN_ZOOM = 4;
  const MAX_ZOOM = 17;
  const DEGREES = Math.PI / 180;

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

  const forests = [
    [[101.08, 5.83], [101.5, 6.07], [102.02, 5.75], [102.27, 5.23], [102.64, 4.91],
      [102.52, 4.4], [102.15, 4.25], [102.06, 3.73], [101.57, 3.48], [101.69, 3.88],
      [101.36, 4.24], [101.45, 4.82], [101.13, 5.23]],
    [[102.62, 4.55], [103.03, 4.43], [103.22, 4.03], [103.16, 3.54], [102.74, 3.37],
      [102.49, 3.77]],
    [[102.91, 2.92], [103.37, 2.96], [103.51, 2.69], [103.3, 2.37], [102.99, 2.48]],
    [[95.66, 5.16], [96.49, 5.1], [97.34, 4.54], [97.69, 4.19], [98.01, 3.24],
      [98.96, 2.29], [99.3, 1.43], [100.4, 0.4], [100.68, -0.61], [100.1, -.72],
      [99.21, .62], [98.4, 1.91], [97.56, 2.12], [96.67, 3.37]],
    [[110.12, 1], [111.05, 1.51], [112.68, 2.2], [113.95, 3.54], [114.43, 3.55],
      [115.38, 4.9], [117.28, 5.41], [117.72, 4.8], [116.47, 3.7], [115.49, 1.17],
      [114.82, -.83], [113.42, -.89], [112.19, .18], [110.4, .07]]
  ];

  const border = [[100.12, 6.47], [100.54, 6.46], [101.07, 6.27], [101.31, 5.82],
    [101.48, 5.78], [101.72, 5.71], [102.08, 6.28]];
  const roads = [
    [[100.41, 6.45], [100.37, 6.13], [100.46, 5.64], [100.44, 5.38], [100.56, 5.1],
      [100.86, 4.89], [101.09, 4.6], [101.18, 4.26], [101.42, 3.84], [101.63, 3.35],
      [101.71, 3.14], [101.96, 2.74], [102.23, 2.29], [102.75, 2.23], [103.11, 1.87],
      [103.68, 1.49]],
    [[101.68, 3.18], [101.86, 3.4], [102.08, 3.53], [102.42, 3.48],
      [102.66, 3.59], [103.08, 3.72], [103.29, 3.81]],
    [[103.29, 3.81], [103.27, 4.18], [103.21, 4.68], [103.10, 5.19],
      [102.71, 5.67], [102.43, 5.88], [102.25, 6.12]],
    [[101.23, 4.38], [101.64, 4.48], [101.95, 4.68], [102.22, 5.11],
      [102.43, 5.41], [102.43, 5.88]],
    [[102.94, 2.39], [103.09, 2.56], [103.33, 2.54], [103.56, 2.49],
      [103.82, 2.41], [103.97, 2.31]]
  ];
  const places = [
    [102.23, 4.36, 'PENINSULAR MALAYSIA', 4, 8, 'region'],
    [100.87, 6.94, 'THAILAND', 4, 8, 'region'],
    [98.55, 2.05, 'SUMATRA', 4, 8, 'region'],
    [112.78, 2.13, 'SARAWAK', 4, 8, 'region'],
    [117.12, 5.67, 'SABAH', 4, 8, 'region'],
    [99.2, 3.15, 'Strait of Malacca', 4, 8, 'sea'],
    [105.85, 5.45, 'South China Sea', 4, 8, 'sea'],
    [100.32, 5.42, 'George Town', 4, 17, 'city'],
    [101.69, 3.14, 'Kuala Lumpur', 4, 17, 'city'],
    [103.73, 1.49, 'Johor Bahru', 4, 17, 'city'],
    [102.25, 6.12, 'Kota Bharu', 5, 17, 'city'],
    [103.13, 5.34, 'Kuala Terengganu', 5, 17, 'city'],
    [103.33, 3.82, 'Kuantan', 5, 17, 'city'],
    [101.09, 4.60, 'Ipoh', 5, 17, 'city'],
    [102.25, 2.2, 'Melaka', 6, 17, 'city'],
    [103.82, 1.27, 'Singapore', 6, 17, 'city'],
    [116.07, 5.98, 'Kota Kinabalu', 5, 17, 'city'],
    [110.36, 1.55, 'Kuching', 5, 17, 'city']
  ];

  const clamp = (value, lower, upper) => Math.max(lower, Math.min(upper, value));
  const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + lat * DEGREES / 2)) / DEGREES;
  const geographicY = y => (2 * Math.atan(Math.exp(y * DEGREES)) - Math.PI / 2) / DEGREES;
  const factorFor = zoom => 512 * 2 ** zoom / 360;
  const normaliseCenter = coords => ({
    lng: clamp(coords.lng, 92, 124),
    lat: clamp(coords.lat, -5.5, 12)
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

  function createManaMap(container, { cards = [], select: selectCard, onPick } = {}) {
    const canvas = document.createElement('canvas');
    const engine = document.createElement('div');
    const pinLayer = document.createElement('div');
    const fallbackCredit = document.createElement('span');
    const context = canvas.getContext('2d');
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
    fallbackCredit.textContent = 'Simplified map · approximate locations';
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

    function path(points, closed = false) {
      context.beginPath();
      points.forEach(([lng, lat], index) => {
        const { x, y } = project(lng, lat);
        if (index) context.lineTo(x, y);
        else context.moveTo(x, y);
      });
      if (closed) context.closePath();
    }

    function drawSchematic() {
      if (!context) return;
      const water = context.createLinearGradient(0, 0, width, height);
      water.addColorStop(0, '#d9edeb');
      water.addColorStop(1, '#c6e1e2');
      context.fillStyle = water;
      context.fillRect(0, 0, width, height);

      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.fillStyle = '#f4f0db';
      context.strokeStyle = '#aecac1';
      context.lineWidth = 1.5;
      land.forEach(points => {
        path(points, true);
        context.fill();
        context.stroke();
      });

      context.fillStyle = '#dbe6c9';
      forests.forEach(points => {
        path(points, true);
        context.fill();
      });

      context.strokeStyle = '#a3aa94';
      context.lineWidth = 1.2;
      context.setLineDash([3, 5]);
      path(border);
      context.stroke();
      context.setLineDash([]);

      if (camera.zoom >= 5) {
        roads.forEach(points => {
          path(points);
          context.strokeStyle = '#e7cdae';
          context.lineWidth = 2.7;
          context.stroke();
          context.strokeStyle = '#fffaf0';
          context.lineWidth = 1.25;
          context.stroke();
        });
      }

      places.forEach(([lng, lat, name, min, max, type]) => {
        if (camera.zoom < min || camera.zoom > max) return;
        const { x, y } = project(lng, lat);
        if (type === 'city') {
          context.fillStyle = '#987f69';
          context.beginPath();
          context.arc(x, y, 2, 0, Math.PI * 2);
          context.fill();
        }
        context.textAlign = type === 'city' ? 'left' : 'center';
        context.font = type === 'sea' ? 'italic 12px Georgia, serif' :
          type === 'region' ? '700 10px system-ui, sans-serif' : '550 11px system-ui, sans-serif';
        context.fillStyle = type === 'sea' ? '#5d7880' : type === 'region' ? '#728269' : '#645846';
        if (type === 'city') {
          context.lineWidth = 3;
          context.strokeStyle = '#f7f3e4';
          context.strokeText(name, x + 5, y + 4);
        }
        context.fillText(name, x + (type === 'city' ? 5 : 0), y + 4);
      });
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
        while (placed.some(pin => Math.abs(pin.x - x - offset) < 42 && Math.abs(pin.y - y) < 44)) {
          candidate += 1;
          offset = Math.ceil(candidate / 2) * 44 * (candidate % 2 ? 1 : -1);
        }
        placed.push({ x: x + offset, y });
        button.style.left = `${x + offset}px`;
        button.style.top = `${y}px`;
        button.classList.toggle('mana-map__pin--active', card.id === selectedId);
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
      pins = nextCards.filter(card => Number.isFinite(card.lat) && Number.isFinite(card.lng))
        .map(card => {
          const button = document.createElement('button');
          const paw = document.createElement('span');
          const label = document.createElement('span');
          button.className = 'mana-map__pin';
          button.type = 'button';
          button.dataset.category = String(card.category ?? '').toLowerCase();
          button.setAttribute('aria-label', card.name);
          button.title = card.name;
          paw.className = 'mana-map__paw';
          paw.setAttribute('aria-hidden', 'true');
          label.className = 'mana-map__pin-name';
          label.textContent = card.name;
          button.append(paw, label);
          button.addEventListener('click', () => {
            if (picking) onPick?.({ lat: card.lat, lng: card.lng });
            else selectCard?.(card.id);
          });
          return { card, button };
        });
      pinLayer.replaceChildren(...pins.map(pin => pin.button));
      scheduleRender();
    }

    function center(coords, zoom = coords?.zoom) {
      if (!coords) {
        if (!loaded) return { ...camera };
        const { lng, lat } = map.getCenter();
        return { lng, lat, zoom: map.getZoom() };
      }
      atHome = false;
      camera = {
        ...normaliseCenter(coords),
        zoom: clamp(zoom ?? center().zoom, MIN_ZOOM, MAX_ZOOM)
      };
      if (loaded) {
        const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
        map.easeTo({ center: [camera.lng, camera.lat], zoom: camera.zoom, duration: reduceMotion ? 0 : 350 });
      }
      scheduleRender();
      return { ...camera };
    }

    function select(id) {
      selectedId = id;
      const match = pins.find(({ card }) => card.id === id);
      if (match) center(match.card, Math.max(center().zoom, 9.5));
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
      if (loaded) map.jumpTo({ center: [camera.lng, camera.lat], zoom: camera.zoom });
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
      if (!event.ctrlKey && !event.metaKey) return;
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
      if (loaded) camera = center();
      loaded = false;
      container.classList.remove('mana-map--online');
      engine.setAttribute('aria-hidden', 'true');
      engine.inert = true;
      canvas.tabIndex = 0;
      canvas.removeAttribute('aria-hidden');
      scheduleRender();
    }

    // The schematic stays interactive while the online map loads or when it is unavailable.
    if (navigator.onLine) import(LIBRARY).then(({ Map, AttributionControl }) => {
      map = new Map({
        container: engine, style: STYLE, center: [camera.lng, camera.lat], zoom: camera.zoom,
        minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM, maxPitch: 0, dragRotate: false,
        renderWorldCopies: false, cooperativeGestures: true, attributionControl: false
      });
      map.addControl(new AttributionControl({ compact: true }), 'bottom-right');
      map.once('load', () => {
        map.jumpTo({ center: [camera.lng, camera.lat], zoom: camera.zoom });
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
      map.on('move', scheduleRender);
      map.on('movestart', event => { if (event.originalEvent) atHome = false; });
      map.on('click', ({ lngLat }) => { if (picking) onPick?.({ lng: lngLat.lng, lat: lngLat.lat }); });
      map.getCanvas().addEventListener('keydown', event => {
        if (event.key !== 'Enter' || !picking) return;
        const { lng, lat } = center();
        onPick?.({ lng, lat });
      });
    }).catch(showFallback);

    return { setCards, select, zoomBy, reset, setPicking, center };
  }

  window.createManaMap = createManaMap;
})();
