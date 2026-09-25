# Vela Veli Vo

A static perfume brand experience for **Vela Veli Vo**. The site presents the fragrance collection, brand story, newsletter signup, shopping-bag interactions, and a cinematic scroll-controlled product animation for **No. 17 Eau de Parfum**.

This is intentionally a plain HTML/CSS/JavaScript project. It does not use React, Next.js, Tailwind, npm, or a build step.

## Quick Start

### Requirements

- A modern browser such as Chrome, Firefox, Edge, or Safari
- Python 3, or any other static HTTP server
- Internet access for the GSAP CDN scripts used by the scroll animation

### Run locally

From the project root:

```bash
python3 -m http.server 8765
```

Open:

```text
http://localhost:8765/
```

The perfume animation is available directly on the landing page. No query string or hash is required.

To stop the server, press `Ctrl+C` in the terminal.

> Prefer an HTTP server over opening `index.html` directly with `file://`. Relative assets and CDN behavior are more reliable through `http://localhost`.

## Project Structure

```text
vella/
├── index.html                         Main page markup and section order
├── styles.css                         Existing global/site styles
├── script.js                          Existing collection, search, bag, and form logic
├── perfume-scroll.css                 Isolated perfume animation styles
├── perfume-scroll.js                  Isolated canvas and scroll animation logic
├── README.md                          Project documentation
├── .vscode/
│   └── launch.json                    VS Code browser launch configuration
├── WhatsApp Image ...jpeg             Brand logo image used in the header
└── assets/
    ├── *.jpeg / *.png                 Existing product and brand assets
    └── perfume-frames/
        ├── ezgif-frame-001.jpg
        ├── ...
        └── ezgif-frame-300.jpg
```

## Page Sections

The sections are assembled in `index.html` in this order:

1. Announcement bar and navigation
2. Hero section
3. Scrolling ticker
4. No. 17 cinematic perfume animation
5. Fragrance collection and filters
6. Brand manifesto / story
7. Newsletter signup
8. Footer

The existing website behavior remains in `script.js`. The perfume feature is intentionally isolated in its own HTML section, stylesheet, and JavaScript file.

## Perfume Scroll Animation

### User experience

The user scrolls through a tall cinematic section. The animation begins with the complete bottle and progresses through the supplied frame sequence:

```text
Complete bottle
  -> cap separates
  -> collar and spray mechanism reveal
  -> internal components reveal
  -> bottle disassembles
  -> final exploded perfume
```

Scrolling upward reverses the same sequence because the current frame is calculated directly from scroll progress.

### HTML integration

The section lives in `index.html` under:

```html
<section id="perfume-scroll">
```

Its main elements are:

- `.perfume-scroll-stage`: the viewport-height pinned stage
- `.perfume-scroll-info`: the No. 17 product copy
- `.perfume-scroll-media`: the visual area
- `#perfume-canvas`: the single canvas used to render frames
- `.perfume-callout`: temporary product-detail labels shown at selected progress ranges

No individual `<img>` element is created for every frame. The animation uses one canvas.

### JavaScript flow

`perfume-scroll.js` works as follows:

1. Finds `#perfume-scroll` and `#perfume-canvas`.
2. Creates an in-memory `Image` object for each of the 300 frames.
3. Builds each frame URL from the shared naming pattern:

   ```text
   assets/perfume-frames/ezgif-frame-001.jpg
   assets/perfume-frames/ezgif-frame-002.jpg
   ...
   assets/perfume-frames/ezgif-frame-300.jpg
   ```

4. Draws frame 001 as soon as it is available.
5. Registers GSAP `ScrollTrigger` after the first frame is ready.
6. Pins `.perfume-scroll-stage` while the section is scrolled.
7. Converts ScrollTrigger progress into a frame index:

   ```js
   frameIndex = Math.floor(progress * (FRAME_COUNT - 1));
   ```

8. Draws the selected frame with `CanvasRenderingContext2D.drawImage()`.
9. Refreshes ScrollTrigger after all frames have loaded so layout measurements are accurate.

### Rendering behavior

The source frames are 1280 x 720 JPEGs. The canvas:

- Uses the available visual area
- Preserves the source aspect ratio
- Centers the image
- Uses a device-pixel-ratio cap of 2 for sharper rendering without excessive memory use
- Resizes when the browser viewport changes
- Uses a small cover-style zoom so the product fills the visual area

### Scroll configuration

The main values are defined at the top of `perfume-scroll.js`:

```js
const FRAME_COUNT = 300;
const FRAME_PATH = 'assets/perfume-frames/ezgif-frame-';
const FRAME_EXT = '.jpg';
const SECTION_HEIGHT = '500vh';
```

To change the scroll duration, adjust `SECTION_HEIGHT`. A taller value gives the user more scroll distance and a slower cinematic reveal.

## Reduced Motion

For a static first-frame mode, open:

```text
http://localhost:8765/?reduceMotion=1
```

In this mode:

- The section is reduced to one viewport height
- ScrollTrigger is not initialized
- The first perfume frame remains visible
- Callouts use a static state

The default landing page intentionally runs the animation without requiring a query parameter, which makes the normal `/` URL behave consistently during local testing.

## Debugging

Debug output is available in `perfume-scroll.js` but disabled by default:

```js
const DEBUG = false;
```

Temporarily change it to:

```js
const DEBUG = true;
```

Then reload the page. The overlay reports:

- Current frame number
- Total frame count
- Scroll progress from `0.000` to `1.000`
- Number of loaded frames

After debugging, return `DEBUG` to `false` before committing.

### Debug checklist

If the animation does not work:

1. Open the browser DevTools Console and look for JavaScript or image errors.
2. Confirm the page is opened at `http://localhost:8765/`, not only as a local file.
3. Confirm the first frame loads:

   ```text
   http://localhost:8765/assets/perfume-frames/ezgif-frame-001.jpg
   ```

4. Confirm both GSAP CDN files load before `perfume-scroll.js`:
   - `gsap.min.js`
   - `ScrollTrigger.min.js`
5. Enable `DEBUG` and verify that progress and frame number change while scrolling.
6. If progress changes but the image does not, inspect the frame path, frame count, and canvas drawing code.
7. If all frames fail, check the Network tab for incorrect filenames or a missing asset folder.
8. If the page shows only the first frame, check whether `?reduceMotion=1` is present.

## Editing Guide

### Change the perfume copy or callouts

Edit the No. 17 section in `index.html`. Callout visibility is controlled by the `data-from` and `data-to` values:

```html
<div class="perfume-callout" data-from="0.18" data-to="0.42">
```

Values represent normalized scroll progress from `0` to `1`.

### Change the animation styling

Edit `perfume-scroll.css`. Keep perfume-specific selectors scoped to `#perfume-scroll` or prefixed with `perfume-` so the existing site is not affected.

Important layout controls:

- `#perfume-scroll`: total scroll height and background
- `.perfume-scroll-stage`: pinned viewport-height layout
- `.perfume-scroll-info`: left-side product details
- `.perfume-scroll-media`: canvas container
- `@media (max-width: 720px)`: stacked mobile layout

### Replace or add frames

Keep the current convention unless the JavaScript is updated at the same time:

```text
ezgif-frame-001.jpg
 ezgif-frame-002.jpg
 ...
 ezgif-frame-300.jpg
```

If the number of frames changes, update `FRAME_COUNT`. If the prefix or extension changes, update `FRAME_PATH` and `FRAME_EXT`.

Do not rename or delete the original source frame folder outside this repository. The browser uses the copied frames under `assets/perfume-frames/`.

### Change the GSAP version

The CDN scripts are loaded near the end of `index.html`, before `perfume-scroll.js`:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```

Keep that order. `perfume-scroll.js` expects `gsap` and `ScrollTrigger` to already exist.

## Existing Site JavaScript

`script.js` is separate from the perfume feature and currently handles:

- Rendering the ten fragrance cards
- Collection category filters
- Search by fragrance name or group
- Add-to-bag and remove-from-bag interactions
- Bag drawer open/close behavior
- Toast notifications
- Newsletter form feedback
- Header search and mobile menu shortcuts

Avoid rewriting `script.js` for perfume animation changes. This separation keeps the feature easier to debug and reduces the risk of breaking the existing store interactions.

## Browser and Performance Notes

- The animation preloads all 300 JPEG frames into browser memory for reliable scrubbing.
- This is approximately 8.8 MB of frame assets in the current repository, before browser decoding overhead.
- The first frame is displayed as soon as it loads; the remaining frames continue loading.
- The page needs network access to download GSAP from jsDelivr unless GSAP is later vendored locally.
- On slower devices, the main cost is image decoding and memory rather than the canvas itself.
- Avoid adding a second animation library or creating hundreds of frame elements in the DOM.

## Verification Checklist

Before handing work to another developer, verify:

- [ ] `http://localhost:8765/` opens without a query parameter
- [ ] The hero and existing navigation still work
- [ ] The perfume section appears after the ticker
- [ ] The first frame shows a complete bottle
- [ ] Scrolling down changes the frame sequence
- [ ] Scrolling up reverses the sequence
- [ ] The final frame remains visible at the end of the section
- [ ] The animation works at a mobile viewport width
- [ ] Resizing the browser does not distort the canvas
- [ ] `?reduceMotion=1` shows the static fallback
- [ ] `DEBUG` is set back to `false`
- [ ] No unrelated files are included in the commit

## Git Workflow

The perfume animation work belongs on:

```text
feature/perfume-scroll-animation
```

Do not push this work directly to `main`. Before committing, confirm the branch:

```bash
git branch --show-current
git status --short
```

Useful commands:

```bash
git diff
git log -1 --oneline
git push origin feature/perfume-scroll-animation
```

## Known Scope

This project is a front-end prototype/static experience. The bag, newsletter, and product interactions are client-side demonstrations only; they do not currently connect to a backend, payment provider, inventory system, or email service.

The perfume animation uses the supplied 2D frame sequence. It does not generate a 3D model, use an MP4/GIF, or recreate the disassembly with CSS.
