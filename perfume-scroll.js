(function () {
  'use strict';

  const DEBUG = false;
  const FRAME_COUNT = 600;
  const useOriginalFrames = new URLSearchParams(window.location.search).get('resolution') === '540p';
  const FRAME_PATH = useOriginalFrames ? 'assets/scrollframes/frame-' : 'assets/scrollframes-1080/frame-';
  const FRAME_EXT = '.jpg';
  const SECTION_HEIGHT = '550vh';
  const FRAME_CACHE_RADIUS = 12;

  const section = document.getElementById('perfume-scroll');
  const canvas = document.getElementById('perfume-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = /(?:\?|&)reduceMotion=1(?:&|$)/.test(window.location.search);
  const frames = new Array(FRAME_COUNT);
  const everLoaded = new Uint8Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = -1;
  let requestedTargetFrame = 0;
  let debugEl = null;
  let pendingProgress = 0;
  let renderScheduled = false;
  let lastRenderTime = 0;
  const FRAME_INTERVAL = 1000 / 90;

  function frameSrc(index) {
    return FRAME_PATH + String(index + 1).padStart(3, '0') + FRAME_EXT;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setupCanvasSize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const media = section.querySelector('.perfume-scroll-media') || canvas.parentElement;
    const rect = media.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (currentFrame >= 0) {
      const saved = currentFrame;
      currentFrame = -1;
      drawFrame(saved);
    }
  }

  function getNearestLoadedFrame(targetIndex) {
    targetIndex = clamp(targetIndex, 0, FRAME_COUNT - 1);
    if (frames[targetIndex] && frames[targetIndex].complete && frames[targetIndex].naturalWidth) {
      return targetIndex;
    }
    for (let offset = 1; offset < FRAME_COUNT; offset++) {
      const prev = targetIndex - offset;
      if (prev >= 0 && frames[prev] && frames[prev].complete && frames[prev].naturalWidth) {
        return prev;
      }
      const next = targetIndex + offset;
      if (next < FRAME_COUNT && frames[next] && frames[next].complete && frames[next].naturalWidth) {
        return next;
      }
    }
    return -1;
  }

  function loadFrame(index) {
    if (index < 0 || index >= FRAME_COUNT || frames[index]) return;

    const img = new Image();
    frames[index] = img;
    img.onload = function () {
      if (!everLoaded[index]) {
        everLoaded[index] = 1;
        loadedCount++;
      }
      if (index === requestedTargetFrame || currentFrame < 0) {
        currentFrame = -1;
        drawFrame(requestedTargetFrame);
      }
      updateDebug(Math.max(currentFrame, 0), currentFrame < 0 ? 0 : currentFrame / Math.max(FRAME_COUNT - 1, 1));
    };
    img.onerror = function () {
      if (frames[index] === img) frames[index] = null;
    };
    img.src = frameSrc(index);
  }

  function preloadWindow(targetIndex) {
    requestedTargetFrame = clamp(targetIndex, 0, FRAME_COUNT - 1);
    const firstKept = Math.max(0, requestedTargetFrame - FRAME_CACHE_RADIUS);
    const lastKept = Math.min(FRAME_COUNT - 1, requestedTargetFrame + FRAME_CACHE_RADIUS);

    for (let index = 0; index < FRAME_COUNT; index++) {
      if (frames[index] && (index < firstKept || index > lastKept)) {
        const img = frames[index];
        img.onload = null;
        img.onerror = null;
        if (!img.complete) img.src = '';
        frames[index] = null;
      }
    }

    loadFrame(requestedTargetFrame);
    for (let offset = 1; offset <= FRAME_CACHE_RADIUS; offset++) {
      loadFrame(requestedTargetFrame + offset);
      loadFrame(requestedTargetFrame - offset);
    }
  }

  function drawFrame(index) {
    const actualIndex = getNearestLoadedFrame(index);
    if (actualIndex < 0) return;
    if (actualIndex === currentFrame) return;

    currentFrame = actualIndex;

    const img = frames[actualIndex];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    if (cw < 2 || ch < 2) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.min(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.fillStyle = '#f7eee2';
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function updateDebug(frameIndex, progress) {
    if (!DEBUG || !debugEl) return;
    debugEl.innerHTML =
      '<strong>PERFUME DEBUG</strong>' +
      '<span>Frame: ' + (frameIndex + 1) + ' / ' + FRAME_COUNT + '</span>' +
      '<span>Progress: ' + progress.toFixed(3) + '</span>' +
      '<span>Loaded: ' + loadedCount + ' / ' + FRAME_COUNT + '</span>';
  }

  function updateCallouts(progress) {
    const callouts = section.querySelectorAll('.perfume-callout');
    callouts.forEach(function (el) {
      const from = Number(el.dataset.from || 0);
      const to = Number(el.dataset.to || 1);
      const active = progress >= from && progress <= to;
      el.classList.toggle('is-active', active);
    });
  }

  function updateScrollProduct(progress) {
    const rail = section.querySelector('.perfume-product-rail');
    const copy = section.querySelector('.perfume-scroll-copy');
    const products = section.querySelectorAll('.scroll-product');
    if (!rail || !copy || !products.length) return;

    const productIndex = clamp(Math.floor(progress * products.length), 0, products.length - 1);
    const product = products[productIndex];
    if (!product) return;

    // The third fragrance plays over the darker, shadowed scene; switch its
    // copy to warm ivory so it stays clear against that background.
    copy.dataset.tone = productIndex === 2 ? 'light' : 'dark';

    products.forEach(function (item, index) {
      item.classList.toggle('is-active', index === productIndex);
    });

    rail.style.setProperty('--product-index', productIndex);
    section.style.setProperty('--product-color', product.dataset.color || '#ded5c6');
    copy.classList.remove('is-entering');
    void copy.offsetWidth;
    copy.querySelector('.perfume-scroll-number').textContent = String(productIndex + 1).padStart(2, '0') + ' / 05';
    copy.querySelector('.perfume-scroll-title').textContent = product.dataset.name;
    copy.querySelector('.perfume-scroll-type').textContent = product.dataset.type;
    copy.querySelector('.perfume-scroll-description').textContent = product.dataset.description;
    copy.classList.add('is-entering');
  }

  // Coalesce scroll updates and draw at no more than 90 frames per second.
  // requestAnimationFrame still follows the display's refresh rate, so slower
  // displays naturally render at their own maximum.
  function renderScrollProgress(timestamp) {
    if (timestamp - lastRenderTime < FRAME_INTERVAL) {
      requestAnimationFrame(renderScrollProgress);
      return;
    }

    lastRenderTime = timestamp;
    renderScheduled = false;
    const progress = pendingProgress;
    const frameIndex = clamp(Math.floor(progress * (FRAME_COUNT - 1)), 0, FRAME_COUNT - 1);
    preloadWindow(frameIndex);
    drawFrame(frameIndex);
    updateCallouts(progress);
    updateScrollProduct(progress);
    updateDebug(frameIndex, progress);
  }

  function queueScrollProgress(progress) {
    pendingProgress = progress;
    if (renderScheduled) return;
    renderScheduled = true;
    requestAnimationFrame(renderScrollProgress);
  }

  function createDebugOverlay() {
    if (!DEBUG) return;
    debugEl = document.createElement('div');
    debugEl.className = 'perfume-scroll-debug';
    debugEl.setAttribute('aria-hidden', 'true');
    section.appendChild(debugEl);
    updateDebug(0, 0);
  }

  function preloadFrames(onFirstFrame) {
    const firstImg = new Image();
    frames[0] = firstImg;
    firstImg.onload = function () {
      everLoaded[0] = 1;
      loadedCount = 1;
      setupCanvasSize();
      drawFrame(0);
      if (onFirstFrame) onFirstFrame();
      preloadWindow(0);
    };
    firstImg.onerror = function () {
      frames[0] = null;
      preloadWindow(0);
    };
    firstImg.src = frameSrc(0);
  }

  function initScrollAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      setupCanvasSize();
      drawFrame(0);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const stage = section.querySelector('.perfume-scroll-stage');

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.1,
      pin: stage,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefresh: function () {
        setupCanvasSize();
      },
      onEnter: function () {
        setupCanvasSize();
      },
      onEnterBack: function () {
        setupCanvasSize();
      },
      onUpdate: function (self) {
        const progress = clamp(self.progress, 0, 1);
        queueScrollProgress(progress);
      }
    });

    requestAnimationFrame(function () {
      setupCanvasSize();
      if (currentFrame < 0) drawFrame(0);
    });
  }

  function initReducedMotion() {
    section.classList.add('perfume-scroll--reduced');
    section.style.height = '100vh';
    setupCanvasSize();
    drawFrame(0);
    updateCallouts(0.35);
    updateScrollProduct(0.35);
    updateDebug(0, 0);
  }

  function updateStackMode() {
    section.classList.toggle('is-stacked', window.innerWidth <= 720);
  }

  function init() {
    section.style.height = prefersReducedMotion ? '100vh' : SECTION_HEIGHT;
    createDebugOverlay();
    updateStackMode();
    setupCanvasSize();

    window.addEventListener('resize', function () {
      updateStackMode();
      setupCanvasSize();
      updateScrollProduct(0);
    });

    preloadFrames(function () {
      if (prefersReducedMotion) {
        initReducedMotion();
      } else {
        initScrollAnimation();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
