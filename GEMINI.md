# Mana Miao (`mana-miao`)

A single-file, client-side interactive community cat map web application for discovering, tracking, and caring for stray and pet cats.

## Tech Stack & Architecture

- **Single-file app**: Everything lives in `index.html` (HTML, CSS, Tailwind config, and vanilla JavaScript). No build step, package manager, or backend server is required.
- **Styling**: Tailwind CSS via CDN (`https://cdn.tailwindcss.com`) with custom pastel theme tokens (`cream`, `peach`, `blush`, `lilac`, `mint`, `butter`, `coral`, `sky`, `latte`, `mocha`, `paw`) and Google Fonts (`Nunito` for display, `Quicksand` for body).
- **Rendering**: Full-viewport HTML5 `<canvas id="mapCanvas">` rendering a `2400 × 1800` world with pan, scroll/pinch zoom (`0.3`–`3.0`), hover detection, landmarks, nature elements, and interactive cat markers.
- **Persistence**: Client-side `localStorage` under key `mm_cats`, seeded from `defaultCats` when empty.

## Key Features & Sections in `index.html`

- **Floating Navbar & Left Drawer**: Hamburger menu (`#drawer`) with About, TNR Guide, and Map Layer Filters (`stray`, `pet`, `landmarks`, `nature`).
- **Interactive Map**:
  - Click a cat marker to open the **Cat Profile Modal** (details, photos, lightbox, and comments).
  - Double-click on desktop or long-press (`600ms`) on touch devices to drop a pin and open the **New Cat Form Modal** (`saveNewCat`, `handlePhotoUpload`).
  - Zoom controls (`zoomMap`, `resetView`).
- **Procedural Assets**: `generateCatPhoto(seed, size)` generates fallback canvas portraits when a cat has no uploaded photos.

## Development & Preview

- Open `index.html` directly in a browser or serve the workspace directory with any static HTTP server.
- Note: Tailwind CSS and Google Fonts load from external CDNs, so an internet connection is needed for full styling.
- When editing `index.html`, preserve the pastel color palette, glassmorphic UI style (`.glass`), and `localStorage` schema (`id`, `name`, `type`, `neutered`, `location`, `x`, `y`, `photos`, `comments`).
