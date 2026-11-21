/* ==========================================================
   crayon.js — pequeño motor de dibujo "a crayón" sobre canvas
   Todo se dibuja en un lienzo lógico de 1080 x 1920 (vertical).
   Cada cuadro las líneas "tiemblan" un poquito (line boil),
   como en las películas hechas a mano cuadro por cuadro.
   ========================================================== */
(function () {
  const W = 1080, H = 1920;

  const COL = {
    red: '#e63946', darkred: '#a4161a', orange: '#f4a261', yellow: '#f6c945',
    green: '#6ab04c', darkgreen: '#3d7a2a', blue: '#3a86ff', sky: '#9ed4f0',
    navy: '#264e86', purple: '#9b5de5', pink: '#ff70a6', lightpink: '#ffc2d6',
    brown: '#8b5a2b', darkbrown: '#5a3a1e', black: '#2b2b2b', grey: '#8d8d8d',
    white: '#fffdf7', skin: '#f2c495', cream: '#fff3d6', jeans: '#8fb8e8',
    cake: '#f7d9a8', frost: '#ff9ec4', silver: '#cfd4da'
  };

  let ctx = null;
  let R = Math.random;

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const J = (a) => (R() * 2 - 1) * a;

  /* ---------- textura cerosa por color ---------- */
  const texCache = {};
  function texCanvas(color) {
    if (texCache[color]) return texCache[color];
    const s = 128, c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    g.fillStyle = color; g.fillRect(0, 0, s, s);
    const d = g.getImageData(0, 0, s, s), r = mulberry(color.length * 977 + 13);
    for (let i = 0; i < d.data.length; i += 4) {
      const x = (i / 4) % s, y = (i / 4 / s) | 0;
      const streak = Math.sin(y * 0.8 + Math.sin(x * 0.13) * 2.5) * 0.5 + 0.5;
      const n = r();
      const a = n < 0.09 ? 0.08 : (0.62 + 0.38 * r()) * (0.72 + 0.28 * streak);
      d.data[i + 3] = a * 255;
    }
    g.putImageData(d, 0, 0);
    return (texCache[color] = c);
  }
  const patCache = new WeakMap();
  function pat(color) {
    let m = patCache.get(ctx);
    if (!m) { m = {}; patCache.set(ctx, m); }
    if (!m[color]) m[color] = ctx.createPattern(texCanvas(color), 'repeat');
    return m[color];
  }

  /* ---------- geometría ---------- */
  function dist(a, b) { return Math.hypot(b[0] - a[0], b[1] - a[1]); }
  function resample(pts, step) {
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const n = Math.max(1, Math.ceil(dist(a, b) / step));
      for (let k = 1; k <= n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  function cut(pts, p) {
    if (p >= 1) return pts;
    let total = 0;
    for (let i = 1; i < pts.length; i++) total += dist(pts[i - 1], pts[i]);
    let target = total * p, acc = 0;
    const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const d = dist(pts[i - 1], pts[i]);
      if (acc + d >= target) {
        const k = (target - acc) / (d || 1), a = pts[i - 1], b = pts[i];
        out.push([a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]);
        return out;
      }
      acc += d; out.push(pts[i]);
    }
    return out;
  }
  function tracePath(pts, j) {
    const q = pts.map(p => [p[0] + J(j), p[1] + J(j)]);
    ctx.beginPath();
    ctx.moveTo(q[0][0], q[0][1]);
    for (let i = 1; i < q.length - 1; i++) {
      const mx = (q[i][0] + q[i + 1][0]) / 2, my = (q[i][1] + q[i + 1][1]) / 2;
      ctx.quadraticCurveTo(q[i][0], q[i][1], mx, my);
    }
    const l = q[q.length - 1];
    ctx.lineTo(l[0], l[1]);
  }

  /* ---------- primitivas ---------- */
  function line(pts, color, w = 7, o = {}) {
    const p = o.p == null ? 1 : o.p;
    if (p <= 0 || pts.length < 2) return;
    let P = cut(pts, p);
    P = resample(P, o.step || 20);
    if (P.length < 2) return;
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = pat(color);
    const passes = o.passes || 2;
    for (let k = 0; k < passes; k++) {
      ctx.globalAlpha = (o.alpha == null ? 0.92 : o.alpha) * (k ? 0.65 : 1);
      ctx.lineWidth = w * (0.85 + R() * 0.3) * (k ? 0.7 : 1);
      tracePath(P, o.j == null ? 2.2 : o.j);
      ctx.stroke();
    }
    ctx.restore();
  }

  function ellipse(cx, cy, rx, ry, o = {}) {
    const n = o.n || Math.max(14, Math.round((rx + ry) / 6));
    const a0 = o.a0 == null ? -0.5 : o.a0;
    const a1 = o.a1 == null ? a0 + Math.PI * 2 + 0.28 : o.a1;
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * i / n;
      pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return pts;
  }
  function rect(x, y, w, h) {
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h], [x, y], [x + Math.min(14, w / 4), y]];
  }
  function heartPts(cx, cy, s) {
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([cx + x * s, cy + y * s]);
    }
    return pts;
  }
  function starPts(cx, cy, r1, r2, n = 5, rot = -Math.PI / 2) {
    const pts = [];
    for (let i = 0; i <= n * 2; i++) {
      const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return pts;
  }

  function fill(pts, color, o = {}) {
    if (pts.length < 3) return;
    ctx.save();
    ctx.beginPath();
    pts.forEach((p, i) => i ? ctx.lineTo(p[0] + J(1.5), p[1] + J(1.5)) : ctx.moveTo(p[0], p[1]));
    ctx.closePath();
    ctx.clip();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of pts) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); }
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, D = Math.hypot(x1 - x0, y1 - y0) / 2 + 10;
    const gap = o.gap || Math.max(7, Math.min(13, D / 6));
    ctx.translate(cx, cy);
    ctx.rotate((o.angle == null ? -0.65 : o.angle) + J(0.05));
    ctx.strokeStyle = pat(color);
    ctx.lineJoin = 'round';
    ctx.lineWidth = gap * 1.45;
    ctx.globalAlpha = o.alpha == null ? 0.88 : o.alpha;
    ctx.beginPath();
    let left = true;
    ctx.moveTo(-D, -D);
    for (let y = -D; y <= D + gap; y += gap) {
      ctx.lineTo((left ? D : -D) + J(5), y + J(2));
      left = !left;
    }
    ctx.stroke();
    ctx.restore();
  }

  /* relleno + contorno */
  function shape(pts, fillColor, strokeColor, w = 6, o = {}) {
    if (fillColor) fill(pts, fillColor, o);
    if (strokeColor) line(pts, strokeColor, w, { p: o.p, j: o.j });
  }

  /* ---------- texto ---------- */
  const FONT = '"Gochi Hand", "Comic Sans MS", cursive';
  const FONT_TITLE = '"Cabin Sketch", "Gochi Hand", cursive';

  function measure(str, size, font = FONT) {
    ctx.font = `${size}px ${font}`;
    return ctx.measureText(str).width;
  }
  function wrap(str, maxW, size, font = FONT) {
    ctx.font = `${size}px ${font}`;
    const out = [];
    for (const para of str.split('\n')) {
      let cur = '';
      for (const word of para.split(' ')) {
        const test = cur ? cur + ' ' + word : word;
        if (ctx.measureText(test).width > maxW && cur) { out.push(cur); cur = word; }
        else cur = test;
      }
      out.push(cur);
    }
    return out;
  }
  /* escribe texto letra por letra; `count` = letras visibles */
  function text(str, x, y, o = {}) {
    const size = o.size || 48, font = o.font || FONT, color = o.color || COL.black;
    const count = o.count == null ? Infinity : o.count;
    ctx.save();
    ctx.font = `${size}px ${font}`;
    ctx.textBaseline = 'alphabetic';
    const total = ctx.measureText(str).width;
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    const jr = o.jr == null ? 0.035 : o.jr;
    let i = 0;
    for (const ch of str) {
      if (i >= count) break;
      const w = ctx.measureText(ch).width;
      ctx.save();
      ctx.translate(cx + w / 2, y + J(1.2));
      ctx.rotate(J(jr));
      if (o.outline) {
        ctx.lineWidth = o.outlineW || size * 0.12;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = pat(o.outline);
        ctx.strokeText(ch, -w / 2, 0);
      }
      ctx.fillStyle = pat(color);
      ctx.globalAlpha = 0.95;
      ctx.fillText(ch, -w / 2, 0);
      ctx.restore();
      cx += w; i++;
    }
    ctx.restore();
    return total;
  }
  /* párrafo con salto de línea y revelado progresivo */
  function paragraph(str, x, y, maxW, o = {}) {
    const size = o.size || 46, lh = o.lh || size * 1.32;
    const lines = wrap(str, maxW, size, o.font);
    let left = o.count == null ? Infinity : o.count;
    lines.forEach((ln, i) => {
      if (left <= 0) return;
      text(ln, o.align === 'left' ? x : x, y + i * lh, Object.assign({}, o, { count: left }));
      left -= ln.length + 1;
    });
    return lines.length * lh;
  }

  /* ---------- papel ---------- */
  function makePaper(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#fbf4e3'; g.fillRect(0, 0, w, h);
    const d = g.getImageData(0, 0, w, h), r = mulberry(42);
    for (let i = 0; i < d.data.length; i += 4) {
      const n = (r() - 0.5) * 16;
      d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n - 2;
    }
    g.putImageData(d, 0, 0);
    g.globalAlpha = 0.06;
    g.strokeStyle = '#a08560';
    for (let i = 0; i < (w * h) / 6000; i++) {
      const x = r() * w, y = r() * h, a = r() * Math.PI, l = 6 + r() * 22;
      g.lineWidth = 0.6 + r();
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    g.globalAlpha = 1;
    const v = g.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(120,80,30,0)');
    v.addColorStop(1, 'rgba(120,80,30,0.22)');
    g.fillStyle = v; g.fillRect(0, 0, w, h);
    return c;
  }

  /* ---------- utilidades de animación ---------- */
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const back = (x) => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };

  window.Crayon = {
    W, H, COL, FONT, FONT_TITLE,
    begin(c, seed) { ctx = c; R = mulberry(seed * 7919 + 1); },
    get ctx() { return ctx; },
    rand: () => R(), J,
    line, fill, shape, ellipse, rect, heartPts, starPts,
    text, paragraph, wrap, measure, makePaper, pat,
    clamp, seg, ease, back, mulberry
  };
})();
