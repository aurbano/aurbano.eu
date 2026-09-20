/*
 * Animated hat-family tiling, using the exact H7/H8 geometry in the shared core.
 * Only the edge ratio changes: tile area, camera position, and viewport scale
 * stay fixed. Shared boundaries move together rather than pulling apart.
 */
(() => {
  'use strict';

  const {
    createMorphingPatch, evaluateMorph, MORPH_CENTER, MORPH_MIN, MORPH_MAX,
  } = require('./einstein-tiling-core.js');

  const PERIOD = 24000;
  const FRAME_INTERVAL = 1000 / 30;
  const COLORS = [
    [76, 140, 76],
    [255, 167, 64],
    [144, 190, 109],
    [255, 215, 90],
    [200, 220, 140],
  ];

  class EinsteinRenderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.patch = createMorphingPatch(5);
      this.vertices = new Float64Array(this.patch.tileCount * 26);
      this.groups = COLORS.map(() => []);
      this.palette = COLORS.map(([r, g, b]) => ({
        fill: `rgba(${r}, ${g}, ${b}, 0.24)`,
        stroke: `rgba(${r}, ${g}, ${b}, 0.4)`,
      }));
      for (let tile = 0; tile < this.patch.tileCount; tile++) {
        this.groups[this.patch.colors[tile]].push(tile * 26);
      }
      this.elapsed = 0;
      this.animationId = null;
      this.lastTimestamp = null;
      this.lastDrawTimestamp = null;
      this._resize();

      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => this._resize(), 100);
      });
    }

    _resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.ceil(this.width * this.dpr);
      this.canvas.height = Math.ceil(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.scale = Math.max(this.width < 768 ? 6.5 : 10.5,
        Math.max(this.width, this.height) / 112);
      this._drawFrame();
    }

    _drawFrame() {
      const t = MORPH_CENTER + (MORPH_MAX - MORPH_MIN) / 2 *
        Math.sin(this.elapsed / PERIOD * Math.PI * 2);
      evaluateMorph(this.patch, t, this.vertices);

      const ctx = this.ctx;
      const points = this.vertices;
      const halfWidth = this.width / (2 * this.scale);
      const halfHeight = this.height / (2 * this.scale);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(this.dpr * this.scale, 0, 0, -this.dpr * this.scale,
        this.dpr * this.width / 2, this.dpr * this.height / 2);
      ctx.lineWidth = 0.65 / this.scale;
      ctx.lineJoin = 'round';

      // Batch by color and cull offscreen hats. Neither the topology nor the
      // coordinate buffers are allocated again during animation.
      for (let color = 0; color < this.groups.length; color++) {
        ctx.beginPath();
        for (const offset of this.groups[color]) {
          const x = points[offset];
          const y = points[offset + 1];
          // Every hat in the animated interval fits within eight world units
          // of its first vertex, including reflected hats.
          if (Math.abs(x) > halfWidth + 8 || Math.abs(y) > halfHeight + 8) continue;
          ctx.moveTo(x, y);
          for (let vertex = 1; vertex < 13; vertex++) {
            const index = offset + vertex * 2;
            ctx.lineTo(points[index], points[index + 1]);
          }
          ctx.closePath();
        }
        ctx.fillStyle = this.palette[color].fill;
        ctx.strokeStyle = this.palette[color].stroke;
        ctx.fill();
        ctx.stroke();
      }
    }

    render = (timestamp) => {
      if (this.lastTimestamp !== null) this.elapsed += timestamp - this.lastTimestamp;
      this.lastTimestamp = timestamp;
      if (this.lastDrawTimestamp === null ||
          timestamp - this.lastDrawTimestamp >= FRAME_INTERVAL - 0.5) {
        this._drawFrame();
        this.lastDrawTimestamp = timestamp;
      }
      this.animationId = requestAnimationFrame(this.render);
    }

    start() {
      if (this.animationId === null) this.animationId = requestAnimationFrame(this.render);
    }

    stop() {
      if (this.animationId !== null) cancelAnimationFrame(this.animationId);
      this.animationId = null;
      this.lastTimestamp = null;
      this.lastDrawTimestamp = null;
    }
  }

  function init() {
    const canvas = document.getElementById('einstein-tiling-canvas');
    if (!canvas) return;
    const renderer = new EinsteinRenderer(canvas);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncAnimation = () => {
      if (document.hidden || reducedMotion.matches) renderer.stop();
      else renderer.start();
    };
    syncAnimation();
    reducedMotion.addEventListener('change', syncAnimation);
    document.addEventListener('visibilitychange', syncAnimation);
    window.einsteinTiling = renderer;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
