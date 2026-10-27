(() => {
  'use strict';

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const smooth = (a, b, value) => {
    const p = clamp((value - a) / (b - a));
    return p * p * (3 - 2 * p);
  };
  const mix = (a, b, p) => a + (b - a) * p;
  function randomGenerator(seed) {
    return () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  function glowTexture() {
    const layer = document.createElement('canvas');
    layer.width = layer.height = 512;
    const context = layer.getContext('2d');
    const light = context.createRadialGradient(256, 256, 0, 256, 256, 256);
    light.addColorStop(0, 'rgba(255,183,97,.6)');
    light.addColorStop(.1, 'rgba(222,112,53,.28)');
    light.addColorStop(.36, 'rgba(119,40,33,.14)');
    light.addColorStop(.73, 'rgba(71,23,37,.06)');
    light.addColorStop(1, 'rgba(30,12,27,0)');
    context.fillStyle = light;
    context.fillRect(0, 0, 512, 512);
    return layer;
  }

  class PersonalIntroScene {
    constructor(canvas, {emblemUrl} = {}) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', {alpha: false});
      this.emblemUrl = emblemUrl;
      const samples = window.SpikeSiteIntroSamples;
      this._samples = Array.isArray(samples) && samples.length === 41 * 41 ? samples : null;
      this._sampled = !!this._samples;
      this._destroyed = false;
      this._ready = null;
      this.glow = this.context ? glowTexture() : null;
      const rand = randomGenerator(8652026);
      this.stars = Array.from({length: 132}, () => ({
        x: rand(), y: rand(), depth: .2 + rand() * .8,
        brightness: .14 + rand() * .37, phase: rand() * 6.28
      }));
      this.particles = [];
      this.createParticles();
      this.resize();
    }

    get sampled() { return this._sampled; }

    createParticles(pixels) {
      const rand = randomGenerator(8101987);
      this.particles.length = 0;
      const grid = 41;
      for (let row = 0; row < grid; row++) {
        for (let col = 0; col < grid; col++) {
          const x = (col + .5) * 240 / grid;
          const y = (row + .5) * 240 / grid;
          let colour;
          // Precompute these same SVG pixel colours once, so slow image decoding
          // and file-origin canvas restrictions cannot change the opening picture.
          if (this._samples) {
            colour = this._samples[row * grid + col];
            if (colour === null) continue;
          } else if (pixels) {
            const offset = (Math.floor(y) * 240 + Math.floor(x)) * 4;
            if (pixels[offset + 3] < 150 || Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]) < 65) continue;
            colour = `${pixels[offset]},${pixels[offset + 1]},${pixels[offset + 2]}`;
          } else {
            if (Math.hypot(x - 120, y - 120) > 103) continue;
            // Recognisable negative-space hat in the file-origin sampling fallback.
            if (y > 42 && y < 100 && ((x - 118) ** 2 / 47 ** 2 + (y - 87) ** 2 / 47 ** 2 < 1)) continue;
            if (y >= 100 && y < 115 && x > 48 && x < 187) continue;
            if (Math.hypot((x - 113) / 1.6, y - 151) < 14) continue;
            colour = `${Math.round(253 - y * .12)},${Math.round(178 - y * .35)},${Math.round(100 - y * .21)}`;
          }
          const band = this.particles.length % 3;
          const radius = .15 + Math.sqrt(rand()) * .94;
          this.particles.push({
            tx: (x - 120) / 240, ty: (y - 120) / 240,
            angle: radius * 5.5 + band * Math.PI * 2 / 3 + (rand() - .5) * .43,
            radius, depth: .35 + rand() * .85,
            phase: rand() * Math.PI * 2, size: .45 + rand() * .75,
            colour, delay: rand() * .24
          });
        }
      }
    }

    ready() {
      if (this._ready) return this._ready;
      if (this._samples) { this._ready = Promise.resolve(this); return this._ready; }
      this._ready = new Promise((resolve) => {
        if (!this.context || !this.emblemUrl) { resolve(this); return; }
        const img = new Image();
        let finished = false;
        let timer;
        const complete = () => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          img.onload = img.onerror = null;
          resolve(this);
        };
        img.onload = () => {
          if (this._destroyed) { complete(); return; }
          try {
            const sample = document.createElement('canvas');
            sample.width = sample.height = 240;
            const context = sample.getContext('2d', {willReadFrequently: true});
            context.drawImage(img, 0, 0, 240, 240);
            this.createParticles(context.getImageData(0, 0, 240, 240).data);
            this._sampled = true;
          } catch { /* file:// can deny pixel reads; the native approximation remains. */ }
          complete();
        };
        img.onerror = complete;
        timer = setTimeout(complete, 900);
        img.src = this.emblemUrl;
      });
      return this._ready;
    }

    resize() {
      if (this._destroyed) return;
      const bounds = this.canvas.getBoundingClientRect();
      this.width = Math.max(1, bounds.width || innerWidth);
      this.height = Math.max(1, bounds.height || innerHeight);
      this.dpr = Math.min(devicePixelRatio || 1, this.width <= 600 ? 1.25 : 1.5);
      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);
      this.logoSize = this.width <= 600 ? 140 : 176;
    }

    render(time) {
      const ctx = this.context;
      if (!ctx || this._destroyed) return;
      const t = Math.max(0, time);
      const w = this.width;
      const h = this.height;
      const cx = w * .5;
      const cy = h * .42;
      const span = Math.max(w * .69, h * .69);
      const gathering = smooth(1.12, 3.28, t);
      const settling = smooth(2.35, 3.55, t);
      const calm = 1 - smooth(3.15, 3.95, t);
      const bloom = smooth(4.7, 5.8, t);
      ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#09070b';
      ctx.fillRect(0, 0, w, h);

      // Large cached glows give the moving particles depth without per-frame blurs.
      const hazeSize = span * (1.7 - gathering * .5);
      ctx.globalAlpha = .46 + Math.sin(t * .6) * .035;
      ctx.drawImage(this.glow, cx - hazeSize / 2, cy - hazeSize * .28, hazeSize, hazeSize * .56);
      ctx.globalAlpha = .18 * calm;
      ctx.drawImage(this.glow, cx - span * .9 + t * 7, cy - span * .18, span * 1.8, span * .36);

      // Quiet far stars, with a small camera drift rather than random twinkling.
      for (const star of this.stars) {
        const x = (star.x - .5) * w * 1.12 + cx + Math.sin(t * .09 + star.phase) * 5 * star.depth;
        const y = (star.y - .5) * h * 1.08 + h * .5 + Math.cos(t * .08 + star.phase) * 3;
        ctx.globalAlpha = star.brightness * (1 - settling * .74) * (1 - bloom);
        ctx.fillStyle = '#e6d6cb';
        ctx.fillRect(x, y, star.depth < .75 ? .7 : 1.1, star.depth < .75 ? .7 : 1.1);
      }

      // Three gently tilted orbit bands collapse into precisely sampled emblem pixels.
      ctx.save();
      ctx.translate(cx, cy);
      for (const particle of this.particles) {
        const localSettle = smooth(2.3 + particle.delay, 3.5 + particle.delay * .25, t);
        const angle = particle.angle + t * (.055 + particle.depth * .065) + gathering * 1.35;
        const radius = particle.radius * span * (1 - gathering * .91);
        const rx = Math.cos(angle) * radius;
        const ry = Math.sin(angle) * radius * .34;
        const ox = rx * .965 - ry * .262;
        const oy = rx * .262 + ry * .965;
        const x = mix(ox, particle.tx * this.logoSize, localSettle);
        const y = mix(oy, particle.ty * this.logoSize, localSettle);
        const brightness = .19 + .53 * particle.depth + .17 * Math.sin(particle.phase + t * .62);
        const alpha = (1 - smooth(3.28, 3.8, t)) * clamp(brightness + localSettle * .24);
        const size = mix(particle.size * (1 + gathering * .35), this.logoSize / 66, localSettle);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${particle.colour})`;
        if (gathering > .15 && localSettle < .8) {
          const trail = (1 - localSettle) * gathering * 6 * particle.depth;
          ctx.strokeStyle = `rgb(${particle.colour})`;
          ctx.lineWidth = Math.max(.5, size * .65);
          ctx.beginPath();
          ctx.moveTo(x - Math.cos(angle + .8) * trail, y - Math.sin(angle + .8) * trail * .34);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, Math.max(.25, size), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // A restrained warm halo remains behind the crisp DOM emblem as dust subsides.
      const core = this.logoSize * (2.2 + (1 - gathering) * 2);
      ctx.globalAlpha = (.12 + gathering * .09) * (1 - bloom);
      ctx.drawImage(this.glow, cx - core / 2, cy - core / 2, core, core);

      // Ivory expands continuously into the light page; no cut to a separate frame.
      if (bloom > 0) {
        const radius = Math.max(w, h) * (.08 + bloom * 1.5);
        const light = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        light.addColorStop(0, `rgba(255,247,235,${bloom})`);
        light.addColorStop(.35, `rgba(250,243,239,${bloom * .96})`);
        light.addColorStop(.75, `rgba(248,246,251,${bloom * .89})`);
        light.addColorStop(1, `rgba(248,246,251,${bloom * .8})`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = light;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalAlpha = 1;
    }

    destroy() {
      this._destroyed = true;
      this.particles.length = 0;
      this.stars.length = 0;
      this.glow = null;
    }
  }

  window.PersonalIntroScene = PersonalIntroScene;
})();
