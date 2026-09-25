(function () {
  'use strict';

  const DEBUG = false;
  const FRAME_COUNT = 300;
  const FRAME_PATH = 'assets/perfume-frames/ezgif-frame-';
  const FRAME_EXT = '.jpg';
  const SECTION_HEIGHT = '500vh';

  const section = document.getElementById('perfume-scroll');
  const canvas = document.getElementById('perfume-canvas');
  if (!section || !canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = /(?:\?|&)reduceMotion=1(?:&|$)/.test(window.location.search);
  const frames = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let currentFrame = -1;
  let debugEl = null;

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

    // Force a redraw after any resize / pin layout change
    if (currentFrame >= 0) {
      const saved = currentFrame;
      currentFrame = -1;
      drawFrame(saved);
    }
  }

  function drawFrame(index) {
    const img = frames[index];
    if (!img || !img.complete || !img.naturalWidth) return;
    if (index === currentFrame) return;

    currentFrame = index;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = canvas.width / dpr;
    const ch = canvas.height / dpr;
    if (cw < 2 || ch < 2) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    // Slight zoom so the bottle fills more and empty black sky is cropped
    const scale = Math.max(cw / iw, ch / ih) * 1.08;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.clearRect(0, 0, cw, ch);
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

  function createDebugOverlay() {
    if (!DEBUG) return;
    debugEl = document.createElement('div');
    debugEl.className = 'perfume-scroll-debug';
    debugEl.setAttribute('aria-hidden', 'true');
    section.appendChild(debugEl);
    updateDebug(0, 0);
  }

  function preloadFrames(onFirstFrame) {
    let firstShown = false;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      frames[i] = img;

      img.onload = function () {
        loadedCount++;
        if (!firstShown && i === 0) {
          firstShown = true;
          setupCanvasSize();
          drawFrame(0);
          if (onFirstFrame) onFirstFrame();
        } else if (i === currentFrame) {
          const saved = currentFrame;
          currentFrame = -1;
          drawFrame(saved);
        }
        if (loadedCount === FRAME_COUNT && typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
          setupCanvasSize();
        }
        updateDebug(
          Math.max(currentFrame, 0),
          currentFrame < 0 ? 0 : currentFrame / Math.max(FRAME_COUNT - 1, 1)
        );
      };

      img.onerror = function () {
        loadedCount++;
        if (loadedCount === FRAME_COUNT && typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
          setupCanvasSize();
        }
      };

      img.src = frameSrc(i);
    }
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
      scrub: true,
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
        const frameIndex = clamp(Math.floor(progress * (FRAME_COUNT - 1)), 0, FRAME_COUNT - 1);
        drawFrame(frameIndex);
        updateCallouts(progress);
        updateDebug(frameIndex, progress);
      }
    });

    // Ensure first paint after pin spacer is created
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
