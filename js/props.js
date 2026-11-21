/* ==========================================================
   props.js — personajes y objetos dibujados a crayón
   ========================================================== */
(function () {
  const C = Crayon, COL = C.COL;
  const { line, fill, shape, ellipse, rect, J } = C;

  /* ---------------- personas ----------------
     (x, y) = punto entre los pies. s = escala (1 ≈ 420 px de alto)
     o: { hair, hairColor, shirt, pants, shoes, glasses, wave, walk, jump, flip, t } */
  function person(x, y, s, o) {
    const ctx = C.ctx, t = o.t || 0;
    ctx.save();
    ctx.translate(x, y - (o.jump || 0));
    ctx.scale(s * (o.flip ? -1 : 1), s);

    const sw = o.walk ? Math.sin(o.walk) * 26 : 0;
    // piernas
    line([[-20, -135], [-24 + sw, -60], [-26 + sw, 0]], o.pants || COL.navy, 17);
    line([[20, -135], [24 - sw, -60], [26 - sw, 0]], o.pants || COL.navy, 17);
    shape(ellipse(-30 + sw, -2, 24, 12), o.shoes || COL.black, COL.black, 4);
    shape(ellipse(30 - sw, -2, 24, 12), o.shoes || COL.black, COL.black, 4);

    // pelo largo (detrás)
    if (o.hair === 'long' || o.hair === 'pony' || o.hair === 'medium') {
      const len = o.hair === 'long' ? 110 : o.hair === 'medium' ? 45 : 70;
      shape(ellipse(0, -330 + len * 0.25, 76, 70 + len * 0.45), o.hairColor, null, 0, { angle: 1.3 });
    }

    // cuerpo
    const body = [[-46, -285], [46, -285], [64, -128], [-64, -128]];
    shape(body, o.shirt || COL.red, null);
    line(body.concat([body[0]]), shade(o.shirt || COL.red), 5);
    if (o.backpack) shape(rect(o.flip ? 40 : -98, -270, 58, 110), o.backpack, COL.black, 4);

    // brazos
    const armL = o.armL != null ? o.armL : Math.PI - 1.2 - sw * 0.004;
    let armR = o.armR != null ? o.armR : 1.2 + sw * 0.004;
    if (o.wave) armR = -0.9 + Math.sin(t * 9) * 0.35;
    arm(-44, -268, armL, o);
    arm(44, -268, armR, o);

    // cabeza
    const skin = o.skin || COL.skin;
    shape(ellipse(-58, -345, 10, 14), skin, '#b07a4f', 3);
    shape(ellipse(58, -345, 10, 14), skin, '#b07a4f', 3);
    shape(ellipse(0, -348, 58, 62), skin, '#b07a4f', 4);

    // pelo arriba
    const top = [];
    for (let i = 0; i <= 16; i++) {
      const a = Math.PI + 0.05 + (Math.PI - 0.1) * i / 16;
      top.push([Math.cos(a) * 66, -352 + Math.sin(a) * 68]);
    }
    if (o.hair === 'short') {
      top.push([52, -372], [30, -362], [0, -368], [-30, -360], [-55, -372]);
    } else {
      top.push([60, -330], [40, -372], [10, -380], [-20, -376], [-52, -372], [-64, -320]);
    }
    shape(top, o.hairColor || COL.black, null, 0, { angle: 0.4 });
    if (o.hair === 'pigtails') {
      shape(ellipse(-78, -330, 22, 40), o.hairColor, null);
      shape(ellipse(78, -330, 22, 40), o.hairColor, null);
      shape(ellipse(-64, -360, 9, 9), COL.pink);
      shape(ellipse(64, -360, 9, 9), COL.pink);
    }
    if (o.apron) {
      shape([[-34, -250], [34, -250], [48, -140], [-48, -140]], COL.white, COL.grey, 3, { alpha: 0.9 });
      line([[-40, -230], [40, -230]], COL.grey, 3);
    }
    if (o.hair === 'pony') {
      const sway = Math.sin(t * 5) * 8;
      shape(ellipse(-82 + sway, -330, 26, 54), o.hairColor, null);
    }

    // cara
    const blink = (t % 3.7) < 0.12;
    if (blink) {
      line([[-30, -350], [-14, -350]], COL.black, 4);
      line([[14, -350], [30, -350]], COL.black, 4);
    } else {
      shape(ellipse(-22, -350, 6, 8), COL.black);
      shape(ellipse(22, -350, 6, 8), COL.black);
    }
    shape(ellipse(-36, -322, 11, 7), COL.pink, null, 0, { alpha: 0.45 });
    shape(ellipse(36, -322, 11, 7), COL.pink, null, 0, { alpha: 0.45 });
    if (o.mouth === 'o') shape(ellipse(0, -322, 10, 13), COL.darkred, COL.darkred, 3);
    else if (o.mouth === 'laugh') shape(ellipse(0, -326, 20, 16, { a0: 0, a1: Math.PI }), COL.darkred, COL.darkred, 3);
    else if (o.mouth === 'flat') line([[-14, -324], [14, -326]], COL.darkred, 4);
    else line(ellipse(0, -330, 20, 13, { a0: 0.35, a1: Math.PI - 0.35, n: 8 }), COL.darkred, 4);
    if (o.sweat) for (const d of [[-70, -390], [74, -380]]) shape([[d[0], d[1] - 18], [d[0] + 8, d[1]], [d[0], d[1] + 6], [d[0] - 8, d[1]]], COL.sky, COL.blue, 3);
    if (o.glasses) {
      line(ellipse(-22, -350, 17, 15), COL.grey, 3);
      line(ellipse(22, -350, 17, 15), COL.grey, 3);
      line([[-5, -352], [5, -352]], COL.grey, 3);
    }
    ctx.restore();
  }
  function arm(sx, sy, a, o) {
    const L = 118, ex = sx + Math.cos(a) * L * 0.5, ey = sy + Math.sin(a) * L * 0.5;
    const hx = sx + Math.cos(a) * L, hy = sy + Math.sin(a) * L;
    line([[sx, sy], [ex + (sx < 0 ? -6 : 6), ey], [hx, hy]], o.sleeve || o.shirt || COL.red, 15);
    shape(ellipse(hx, hy, 11, 11), o.skin || COL.skin, '#b07a4f', 3);
  }
  function shade(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) * 0.6 | 0, g = ((n >> 8) & 255) * 0.6 | 0, b = (n & 255) * 0.6 | 0;
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* --------------- escenario --------------- */
  function sky(t, o = {}) {
    shape(rect(-20, -20, 1120, o.h || 1380), o.color || COL.sky, null, 0, { alpha: 0.35, gap: 16 });
  }
  function sun(x, y, r, t) {
    const ctx = C.ctx;
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * 0.3);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      line([[Math.cos(a) * (r + 18), Math.sin(a) * (r + 18)], [Math.cos(a) * (r + 60), Math.sin(a) * (r + 60)]], COL.orange, 9);
    }
    ctx.restore();
    shape(ellipse(x, y, r, r), COL.yellow, COL.orange, 6);
    shape(ellipse(x - r * 0.35, y - r * 0.1, 6, 8), COL.black);
    shape(ellipse(x + r * 0.35, y - r * 0.1, 6, 8), COL.black);
    line(ellipse(x, y + r * 0.1, r * 0.4, r * 0.3, { a0: 0.4, a1: Math.PI - 0.4, n: 8 }), COL.darkred, 4);
  }
  function cloud(x, y, s) {
    const pts = [];
    const bumps = [[-90, 0, 50], [-40, -35, 60], [30, -40, 62], [85, -5, 50], [40, 25, 50], [-35, 25, 50]];
    const c = C.ctx; c.save(); c.translate(x, y); c.scale(s, s);
    for (const b of bumps) shape(ellipse(b[0], b[1], b[2], b[2] * 0.8), COL.white, null, 0, { alpha: 0.95 });
    for (const b of bumps.slice(0, 4)) line(ellipse(b[0], b[1], b[2], b[2] * 0.8, { a0: Math.PI * 1.05, a1: Math.PI * 1.95 }), COL.blue, 4, { alpha: 0.5 });
    c.restore();
  }
  function ground(y, color = COL.green, p = 1) {
    if (p <= 0) return;
    const w = 1100 * p;
    shape([[-20, y], [w, y - 8], [w, 2000], [-20, 2000]], color, null, 0, { angle: -0.15, gap: 14 });
    line([[-20, y], [270, y - 10], [540, y + 4], [810, y - 6], [1100, y]], COL.darkgreen, 7, { p });
    for (let x = 20; x < w; x += 70) line([[x, y + 4], [x + 8, y - 22], [x + 16, y + 4]], COL.darkgreen, 4);
  }
  function flower(x, y, color, t) {
    line([[x, y], [x + Math.sin(t * 2 + x) * 4, y - 60]], COL.darkgreen, 5);
    const cx = x + Math.sin(t * 2 + x) * 4, cy = y - 70;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      shape(ellipse(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14, 11, 11), color);
    }
    shape(ellipse(cx, cy, 9, 9), COL.yellow);
  }
  function tree(x, y, s) {
    const c = C.ctx; c.save(); c.translate(x, y); c.scale(s, s);
    shape([[-22, 0], [-16, -170], [16, -170], [24, 0]], COL.brown, COL.darkbrown, 5);
    shape(ellipse(0, -250, 120, 110), COL.green, COL.darkgreen, 6);
    shape(ellipse(-60, -200, 70, 60), COL.green, null);
    shape(ellipse(60, -205, 70, 60), COL.green, null);
    for (const a of [[-40, -270], [35, -230], [10, -300]]) shape(ellipse(a[0], a[1], 12, 12), COL.red);
    c.restore();
  }
  function house(x, y, w, h, o = {}) {
    const p = o.p == null ? 1 : o.p;
    shape(rect(x, y - h, w, h), o.color || COL.yellow, COL.darkbrown, 6, { p });
    const roof = [[x - 30, y - h], [x + w / 2, y - h - w * 0.55], [x + w + 30, y - h], [x - 30, y - h]];
    shape(roof, o.roof || COL.red, COL.darkred, 6, { p });
    if (p < 1) return;
    const dw = w * 0.24;
    shape(rect(x + w * 0.5 - dw / 2, y - h * 0.48, dw, h * 0.48), o.door || COL.brown, COL.darkbrown, 5);
    shape(ellipse(x + w * 0.5 + dw * 0.25, y - h * 0.24, 5, 5), COL.yellow);
    const ww = w * 0.2;
    for (const wx of [x + w * 0.1, x + w * 0.9 - ww]) {
      shape(rect(wx, y - h * 0.8, ww, ww), COL.sky, COL.darkbrown, 4);
      line([[wx + ww / 2, y - h * 0.8], [wx + ww / 2, y - h * 0.8 + ww]], COL.darkbrown, 3);
      line([[wx, y - h * 0.8 + ww / 2], [wx + ww, y - h * 0.8 + ww / 2]], COL.darkbrown, 3);
    }
    if (o.chimney) shape(rect(x + w * 0.72, y - h - w * 0.42, w * 0.12, w * 0.2), COL.brown, COL.darkbrown, 4);
  }
  function heart(x, y, s, color = COL.red, o = {}) {
    shape(C.heartPts(x, y, s), color, o.outline === false ? null : shade(color), Math.max(3, s * 0.7), o);
  }
  function star(x, y, r, color = COL.yellow) {
    shape(C.starPts(x, y, r, r * 0.45), color, COL.orange, 4);
  }
  function balloon(x, y, color, t, s = 1) {
    const bx = x + Math.sin(t * 1.3 + x) * 12, by = y + Math.sin(t * 1.7 + x * 0.3) * 16;
    line([[bx, by + 70 * s], [bx - 10, by + 140 * s], [bx + 6, by + 220 * s]], COL.grey, 3);
    shape(ellipse(bx, by, 52 * s, 66 * s), color, shade(color), 5);
    shape(ellipse(bx - 18 * s, by - 24 * s, 9 * s, 14 * s), COL.white, null, 0, { alpha: 0.8 });
    shape([[bx - 9, by + 66 * s], [bx + 9, by + 66 * s], [bx, by + 78 * s]], color, null);
  }
  function bubble(x, y, str, size = 44, color = COL.black) {
    const w = C.measure(str, size) + 50, h = size * 1.5;
    shape(ellipse(x, y, w / 2, h / 2 + 6), COL.white, COL.black, 4);
    line([[x - 12, y + h / 2], [x - 26, y + h / 2 + 34], [x + 10, y + h / 2 + 2]], COL.black, 4);
    C.text(str, x, y + size * 0.33, { size, color });
  }

  /* --------------- moto con Dayana --------------- */
  function moto(x, y, s, t, o = {}) {
    const ctx = C.ctx;
    ctx.save(); ctx.translate(x, y + (o.bob ? Math.sin(t * 30) * 2 : 0)); ctx.scale(s, s);
    const spin = (o.spin || 0);
    // ruedas
    for (const wx of [-150, 150]) {
      shape(ellipse(wx, 0, 72, 72), COL.black, COL.black, 8, { alpha: 0.9 });
      shape(ellipse(wx, 0, 44, 44), COL.silver, COL.black, 4);
      for (let i = 0; i < 4; i++) {
        const a = spin + i * Math.PI / 4;
        line([[wx + Math.cos(a) * 40, Math.sin(a) * 40], [wx - Math.cos(a) * 40, -Math.sin(a) * 40]], COL.grey, 4);
      }
    }
    // chasis
    line([[-150, 0], [-60, -40], [60, -40], [150, 0]], COL.grey, 10);
    line([[150, 0], [110, -150]], COL.silver, 12);
    shape([[-60, -40], [60, -40], [40, 20], [-40, 20]], COL.grey, COL.black, 4); // motor
    shape([[-190, -60], [-60, -95], [-40, -55], [-160, -40]], COL.black, COL.black, 4); // guardabarro trasero
    shape([[-110, -110], [10, -110], [20, -78], [-120, -72]], COL.black, null); // sillín
    shape([[0, -125], [95, -135], [115, -95], [30, -70], [-10, -80]], COL.red, COL.darkred, 5); // tanque
    line([[-150, -10], [-250, -18]], COL.silver, 12); // exhosto
    line([[110, -150], [90, -190], [70, -195]], COL.black, 7); // manubrio
    shape(ellipse(140, -140, 22, 26), COL.yellow, COL.orange, 4); // farola
    if (o.light) shape([[160, -150], [330, -200], [330, -80], [160, -130]], COL.yellow, null, 0, { alpha: 0.35 });

    // Dayana (camiseta negra, short de jean, tenis plateados, cola de caballo)
    const lean = o.lean || 0;
    ctx.save(); ctx.rotate(lean);
    line([[-40, -120], [40, -70], [70, 10]], COL.jeans, 26); // pierna
    shape(ellipse(80, 18, 30, 14), COL.silver, COL.black, 4);
    shape([[-80, -125], [-15, -120], [10, -260], [-60, -270]], COL.black, null); // torso
    line([[-20, -245], [40, -215], [85, -190]], COL.black, 18); // brazo
    shape(ellipse(88, -190, 13, 13), o.skin || COL.skin, '#b07a4f', 3);
    shape(ellipse(-10, -325, 52, 56), o.skin || COL.skin, '#b07a4f', 4);
    const wind = o.wind ? Math.sin(t * 20) * 10 : Math.sin(t * 3) * 5;
    shape([[-60, -340], [-130 - (o.wind ? 40 : 0), -330 + wind], [-150 - (o.wind ? 60 : 0), -290 + wind], [-70, -305]], o.hair || COL.brown, null); // cola
    const top = [];
    for (let i = 0; i <= 14; i++) {
      const a = Math.PI + 0.1 + (Math.PI - 0.2) * i / 14;
      top.push([-10 + Math.cos(a) * 58, -330 + Math.sin(a) * 60]);
    }
    top.push([40, -350], [0, -360], [-50, -340]);
    shape(top, o.hair || COL.brown, null);
    shape(ellipse(12, -330, 6, 7), COL.black);
    line(ellipse(10, -305, 18, 12, { a0: 0.2, a1: Math.PI - 0.6, n: 8 }), COL.darkred, 4);
    shape(ellipse(25, -312, 9, 6), COL.pink, null, 0, { alpha: 0.5 });
    ctx.restore();
    ctx.restore();
  }

  /* --------------- colegio --------------- */
  function school(x, y, t, o = {}) {
    const w = 560, h = 420;
    shape(rect(x - w / 2, y - h, w, h), COL.orange, COL.darkbrown, 6);
    shape([[x - w / 2 - 30, y - h], [x, y - h - 170], [x + w / 2 + 30, y - h], [x - w / 2 - 30, y - h]], COL.red, COL.darkred, 6);
    // campana
    const ring = o.ring ? Math.sin(t * 40) * 0.35 * o.ring : 0;
    const c = C.ctx; c.save(); c.translate(x, y - h - 95); c.rotate(ring);
    shape([[-34, 30], [-26, -16], [0, -34], [26, -16], [34, 30]], COL.yellow, COL.orange, 5);
    shape(ellipse(0, 36, 9, 9), COL.darkbrown);
    c.restore();
    C.text('COLEGIO', x, y - h + 80, { size: 64, color: COL.white, outline: COL.darkbrown, font: C.FONT_TITLE });
    // ventanas
    for (let i = 0; i < 4; i++) {
      const wx = x - w / 2 + 40 + i * 132;
      if (i === 1 || i === 2) continue;
      shape(rect(wx, y - h + 130, 80, 80), COL.sky, COL.darkbrown, 4);
    }
    shape(rect(x - 70, y - 200, 140, 200), COL.brown, COL.darkbrown, 5);
    line([[x, y - 200], [x, y]], COL.darkbrown, 4);
    // bandera
    line([[x + w / 2 - 20, y - h], [x + w / 2 - 20, y - h - 200]], COL.darkbrown, 6);
    const fw = Math.sin(t * 4) * 8;
    shape([[x + w / 2 - 20, y - h - 200], [x + w / 2 + 70, y - h - 190 + fw], [x + w / 2 - 20, y - h - 160]], COL.yellow, null);
    shape([[x + w / 2 - 20, y - h - 160], [x + w / 2 + 70, y - h - 150 + fw], [x + w / 2 - 20, y - h - 140]], COL.blue, null);
    shape([[x + w / 2 - 20, y - h - 140], [x + w / 2 + 70, y - h - 130 + fw], [x + w / 2 - 20, y - h - 120]], COL.red, null);
  }

  /* --------------- foto enmarcada --------------- */
  function photo(img, cx, cy, w, rot, o = {}) {
    const ctx = C.ctx;
    if (!img || !img.complete || !img.naturalWidth) return;
    const ar = img.naturalHeight / img.naturalWidth;
    const h = o.h || w * ar;
    // recorte centrado si se fuerza alto
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (o.h) {
      const want = o.h / w;
      if (want > ar) { sw = sh / want; sx = (img.naturalWidth - sw) / 2; }
      else { sh = sw * want; sy = (img.naturalHeight - sh) * (o.focusY == null ? 0.5 : o.focusY); }
    }
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    const pad = o.polaroid ? 26 : 18, bottom = o.polaroid ? 110 : 18;
    // sombra
    ctx.fillStyle = 'rgba(60,40,20,0.18)';
    ctx.fillRect(-w / 2 - pad + 10, -h / 2 - pad + 14, w + pad * 2, h + pad + bottom);
    ctx.fillStyle = '#fffdf6';
    ctx.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad + bottom);
    ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);
    // marco de crayón
    line(rect(-w / 2 - pad + 4, -h / 2 - pad + 4, w + pad * 2 - 8, h + pad + bottom - 8), o.frame || COL.pink, 8);
    // cinta
    for (const sgn of [-1, 1]) {
      ctx.save();
      ctx.translate(sgn * (w / 2 - 20), -h / 2 - pad);
      ctx.rotate(sgn * 0.6);
      ctx.fillStyle = 'rgba(246, 201, 69, 0.55)';
      ctx.fillRect(-60, -18, 120, 36);
      ctx.restore();
    }
    if (o.caption) C.text(o.caption, 0, h / 2 + bottom - 30, { size: 54, color: o.captionColor || COL.navy });
    ctx.restore();
  }

  /* --------------- pastel --------------- */
  function cake(x, y, t, o = {}) {
    // mesa
    shape(rect(x - 420, y, 840, 40), COL.brown, COL.darkbrown, 6);
    shape(ellipse(x, y - 6, 360, 34), COL.white, COL.grey, 4); // plato
    // pisos
    const tiers = [[340, 170, COL.cake], [260, 150, COL.lightpink], [180, 120, COL.cake]];
    let ty = y - 20;
    tiers.forEach(([w, h, c], i) => {
      shape(rect(x - w, ty - h, w * 2, h), c, COL.darkbrown, 6);
      // glaseado
      const drip = [];
      for (let k = 0; k <= 12; k++) {
        const dx = x - w + (w * 2) * k / 12;
        drip.push([dx, ty - h + (k % 2 ? 46 : 18)]);
      }
      shape([[x - w - 6, ty - h - 8], [x + w + 6, ty - h - 8]].concat(drip.reverse()), COL.frost, COL.pink, 4);
      for (let k = 0; k < 7; k++) shape(ellipse(x - w + 40 + k * (w * 2 - 80) / 6, ty - h / 2 + 20, 9, 9), [COL.red, COL.yellow, COL.blue, COL.green][k % 4]);
      ty -= h;
    });
    o.top = ty;
    // velitas con forma de número
    const digits = o.digits || ['2', '5'];
    digits.forEach((d, i) => {
      const cx = x + (i ? 70 : -70), base = ty - 8;
      numberCandle(d, cx, base, i ? COL.blue : COL.pink);
      const out = o.out && o.out[i];
      const fx = cx, fy = base - 230;
      if (!out) {
        const f = Math.sin(t * 14 + i) * 4;
        shape([[fx, fy - 70 + f], [fx + 22, fy - 18], [fx, fy], [fx - 22, fy - 18]], COL.orange, null);
        shape([[fx, fy - 44 + f], [fx + 11, fy - 14], [fx, fy - 4], [fx - 11, fy - 14]], COL.yellow, null);
      } else if (o.smoke && o.smoke[i] != null) {
        const st = o.smoke[i];
        if (st < 2) for (let k = 0; k < 3; k++) {
          const yy = fy - 20 - st * 120 - k * 40;
          line([[fx + Math.sin(st * 6 + k) * 16, yy], [fx + Math.sin(st * 6 + k + 1) * 16, yy - 40]], COL.grey, 6, { alpha: 0.6 * (1 - st / 2) });
        }
      }
      line([[fx, fy + 4], [fx, fy + 24]], COL.black, 4);
    });
  }
  function numberCandle(d, cx, base, color) {
    const w = 60, h = 200, x0 = cx - w / 2, y0 = base - h;
    const P = {
      '2': [[x0, y0 + 40], [x0 + 15, y0], [x0 + w - 6, y0 + 8], [x0 + w, y0 + 60], [x0, base], [x0 + w + 6, base]],
      '5': [[x0 + w + 4, y0], [x0 + 4, y0], [x0, y0 + 90], [x0 + w, y0 + 100], [x0 + w + 4, base - 30], [x0 + w - 18, base], [x0 - 4, base - 10]]
    }[d];
    if (!P) return;
    line(P, color, 34, { passes: 3, j: 1.5 });
    line(P, '#ffffff', 8, { alpha: 0.5, j: 1 });
  }

  /* --------------- confeti --------------- */
  function confetti(list, t) {
    for (const c of list) {
      const y = c.y + (t - c.t0) * c.v;
      if (y > 2000 || t < c.t0) continue;
      const x = c.x + Math.sin((t - c.t0) * c.w + c.ph) * 40;
      const ctx = C.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate((t - c.t0) * c.r);
      if (c.k === 0) shape(rect(-14, -8, 28, 16), c.c, null);
      else if (c.k === 1) heart(0, 0, 1.8, c.c, { outline: false });
      else star(0, 0, 16, c.c);
      ctx.restore();
    }
  }
  function makeConfetti(n, t0, seed = 3) {
    const r = C.mulberry(seed), cols = [COL.red, COL.yellow, COL.blue, COL.green, COL.pink, COL.purple, COL.orange];
    const out = [];
    for (let i = 0; i < n; i++) out.push({ x: r() * 1080, y: -100 - r() * 900, v: 260 + r() * 320, w: 1 + r() * 3, ph: r() * 6, r: (r() - 0.5) * 6, c: cols[i % cols.length], k: (r() * 3) | 0, t0 });
    return out;
  }


  /* =============== cocina y utilería de la receta =============== */
  function pot(x, y, s, t, o = {}) {
    const ctx = C.ctx; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    // fueguito
    for (let i = -2; i <= 2; i++) {
      const f = Math.sin(t * 12 + i * 2) * 8;
      shape([[i * 34, -10 + f], [i * 34 + 18, 30], [i * 34 - 18, 30]], i % 2 ? COL.yellow : COL.orange, null);
    }
    shape(rect(-120, 28, 240, 18), COL.grey, COL.black, 4);
    // olla
    const body = [[-110, -130], [110, -130], [96, 0], [-96, 0]];
    shape(body, '#5b6472', COL.black, 6);
    shape(ellipse(0, -130, 118, 26), o.liquid || COL.pink, COL.black, 5);
    for (let i = 0; i < 3; i++) {
      const bt = (t * 0.9 + i * 0.33) % 1;
      shape(ellipse(-50 + i * 50, -134 - bt * 20, 8 + bt * 6, 6 + bt * 4), COL.white, null, 0, { alpha: 0.7 * (1 - bt) });
    }
    line([[-110, -110], [-150, -112], [-150, -80], [-104, -78]], COL.black, 8);
    line([[110, -110], [150, -112], [150, -80], [104, -78]], COL.black, 8);
    // vapor
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.5 + i / 3) % 1;
      line([[-40 + i * 40 + Math.sin(k * 6 + i) * 14, -170 - k * 120], [-40 + i * 40 + Math.sin(k * 6 + i + 1) * 14, -210 - k * 120]], COL.grey, 5, { alpha: 0.5 * (1 - k) });
    }
    if (o.label) C.text(o.label, 0, -48, { size: 40, color: COL.white });
    if (o.splash > 0 && o.splash < 1) {
      const k = o.splash;
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI + (i / 7) * Math.PI;
        const r = 60 + k * 130;
        shape(ellipse(Math.cos(a) * r, -140 + Math.sin(a) * r * 0.9 + k * k * 120, 12, 12), COL.pink, null, 0, { alpha: 1 - k });
      }
      C.text('¡plop!', 0, -260 - k * 40, { size: 70, color: COL.red, outline: COL.white, font: C.FONT_TITLE });
    }
    if (o.spoon != null) {
      ctx.save(); ctx.translate(Math.cos(o.spoon) * 50, -140); ctx.rotate(-0.4 + Math.sin(o.spoon) * 0.3);
      line([[0, 0], [60, -230]], COL.brown, 16);
      shape(ellipse(0, 6, 22, 30), COL.brown, COL.darkbrown, 4);
      ctx.restore();
    }
    ctx.restore();
  }
  function oven(x, y, t, o = {}) {
    const shake = o.shake ? Math.sin(t * 50) * 6 * o.shake : 0;
    const ctx = C.ctx; ctx.save(); ctx.translate(x + shake, y);
    shape(rect(-230, -400, 460, 400), COL.silver, COL.black, 7);
    shape(rect(-230, -400, 460, 80), COL.grey, COL.black, 5);
    for (let i = 0; i < 4; i++) shape(ellipse(-150 + i * 100, -360, 22, 22), COL.white, COL.black, 4);
    const glow = o.glow || 0;
    shape(rect(-170, -290, 340, 230), glow > 0 ? COL.yellow : '#3a3a3a', COL.black, 6, { alpha: 0.6 + glow * 0.4 });
    line([[-130, -330 + 10], [130, -330 + 10]], COL.black, 8);
    if (glow > 0) for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      line([[Math.cos(a) * 260, -175 + Math.sin(a) * 200], [Math.cos(a) * (300 + glow * 40), -175 + Math.sin(a) * (240 + glow * 40)]], COL.yellow, 8);
    }
    ctx.restore();
  }
  function stork(x, y, t, carrying) {
    const ctx = C.ctx; ctx.save(); ctx.translate(x, y);
    const flap = Math.sin(t * 10) * 40;
    shape([[-20, -10], [-120, -40 - flap], [-60, 10]], COL.white, COL.grey, 4);
    shape(ellipse(0, 0, 70, 34), COL.white, COL.grey, 4);
    line([[50, -10], [80, -70]], COL.white, 16);
    shape(ellipse(88, -80, 22, 20), COL.white, COL.grey, 4);
    shape(ellipse(94, -84, 4, 4), COL.black);
    line([[106, -78], [170, -66]], COL.orange, 8);
    shape([[20, -10], [90, -50 + flap], [40, 10]], COL.white, COL.grey, 4);
    line([[-10, 30], [-40, 80]], COL.orange, 5); line([[10, 30], [-10, 80]], COL.orange, 5);
    if (carrying) {
      line([[150, -64], [150, 20]], COL.grey, 3);
      shape(ellipse(150, 50, 40, 32), COL.lightpink, COL.pink, 4);
      shape(ellipse(150, 30, 18, 16), COL.skin, '#b07a4f', 3);
    }
    ctx.restore();
  }
  function signpost(x, y, str, o = {}) {
    line([[x, y], [x, y - (o.h || 260)]], COL.darkbrown, 12);
    const w = C.measure(str, o.size || 46) + 60;
    const sy = y - (o.h || 260);
    const ctx = C.ctx; ctx.save(); ctx.translate(x, sy); ctx.rotate(o.rot || 0);
    shape(rect(-w / 2, -50, w, 90), o.color || COL.orange, COL.darkbrown, 6);
    C.text(str, 0, 12, { size: o.size || 46, color: o.textColor || COL.darkbrown, font: o.font || C.FONT });
    ctx.restore();
  }
  function bubbleLines(x, y, lines, size = 40, o = {}) {
    let w = 0; for (const l of lines) w = Math.max(w, C.measure(l, size));
    w += 60; const lh = size * 1.2, h = lines.length * lh + 34;
    shape(ellipse(x, y, w / 2 + 10, h / 2 + 10), o.fill || COL.white, COL.black, 4);
    const tx = o.tail != null ? o.tail : x - 20;
    line([[tx - 14, y + h / 2 + 4], [tx - 30 + (o.tailDir || 0), y + h / 2 + 46], [tx + 14, y + h / 2 + 2]], COL.black, 4);
    lines.forEach((l, i) => C.text(l, x, y - h / 2 + 22 + lh * (i + 0.78), { size, color: o.color || COL.black }));
  }
  function clothesline(x0, x1, y, t) {
    line([[x0, y], [(x0 + x1) / 2, y + 30], [x1, y]], COL.grey, 4);
    const cols = [COL.red, COL.blue, COL.yellow, COL.green, COL.pink];
    for (let i = 0; i < 5; i++) {
      const k = (i + 0.5) / 5, cx = x0 + (x1 - x0) * k, cy = y + Math.sin(k * Math.PI) * 30;
      const sw = Math.sin(t * 3 + i) * 5;
      if (i % 2) shape([[cx - 30, cy], [cx + 30, cy], [cx + 36 + sw, cy + 70], [cx - 24 + sw, cy + 70]], cols[i], null);
      else shape([[cx - 34, cy], [cx + 34, cy], [cx + 26 + sw, cy + 46], [cx + 14 + sw, cy + 46], [cx + 10 + sw, cy + 80], [cx - 10 + sw, cy + 80], [cx - 14 + sw, cy + 46], [cx - 26 + sw, cy + 46]], cols[i], null);
    }
  }
  function books(x, y) {
    shape(rect(x - 40, y - 20, 80, 20), COL.red, COL.darkred, 3);
    shape(rect(x - 36, y - 40, 74, 20), COL.blue, COL.navy, 3);
    shape(rect(x - 42, y - 60, 82, 20), COL.green, COL.darkgreen, 3);
  }
  function gradCap(x, y, rot = 0, sc = 1) {
    const ctx = C.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    shape([[-80, 0], [0, -34], [80, 0], [0, 34]], COL.black, COL.black, 4);
    shape(rect(-40, 10, 80, 34), COL.black, null);
    line([[60, 2], [80, 60]], COL.yellow, 6);
    shape(ellipse(80, 66, 10, 12), COL.yellow);
    ctx.restore();
  }
  function rain(t, x0, x1, y0, y1, k = 1) {
    const r = C.mulberry(5);
    for (let i = 0; i < 40 * k; i++) {
      const x = x0 + r() * (x1 - x0), sp = 900 + r() * 400, off = r();
      const y = y0 + ((t * sp / (y1 - y0) + off) % 1) * (y1 - y0);
      line([[x, y], [x - 8, y + 34]], COL.blue, 4, { alpha: 0.7 });
    }
  }
  function mattress(x, y) {
    shape(rect(x - 120, y - 40, 240, 40), COL.white, COL.grey, 4);
    shape(rect(x - 120, y - 40, 150, 40), COL.purple, null, 0, { alpha: 0.8 });
    shape(ellipse(x + 80, y - 52, 40, 18), COL.white, COL.grey, 3);
  }
  function teddy(x, y, rot = 0) {
    const ctx = C.ctx; ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    shape(ellipse(0, 20, 30, 34), COL.brown, COL.darkbrown, 3);
    shape(ellipse(0, -26, 24, 22), COL.brown, COL.darkbrown, 3);
    shape(ellipse(-18, -44, 9, 9), COL.brown, COL.darkbrown, 3);
    shape(ellipse(18, -44, 9, 9), COL.brown, COL.darkbrown, 3);
    shape(ellipse(-8, -28, 3, 3), COL.black); shape(ellipse(8, -28, 3, 3), COL.black);
    ctx.restore();
  }
  function table(x0, x1, y) {
    shape(rect(x0, y, x1 - x0, 26), COL.brown, COL.darkbrown, 5);
    line([[x0 + 30, y + 26], [x0 + 30, y + 190]], COL.darkbrown, 12);
    line([[x1 - 30, y + 26], [x1 - 30, y + 190]], COL.darkbrown, 12);
  }
  function cookieJar(x, y, open) {
    shape([[x - 60, y], [x + 60, y], [x + 70, y - 130], [x - 70, y - 130]], COL.sky, COL.navy, 4, { alpha: 0.6 });
    for (const c of [[-25, -30], [20, -40], [-5, -80], [30, -95]]) shape(ellipse(x + c[0], y + c[1], 24, 22), '#c8873f', COL.darkbrown, 3);
    if (!open) shape(rect(x - 74, y - 150, 148, 22), COL.red, COL.darkred, 4);
    C.text('galletas', x, y - 170, { size: 30, color: COL.navy });
  }

  window.Props = { pot, oven, stork, signpost, bubbleLines, clothesline, books, gradCap, rain, mattress, teddy, cookieJar, table,
    person, sky, sun, cloud, ground, flower, tree, house, heart, star, balloon, bubble, moto, school, photo, cake, confetti, makeConfetti, shade };
})();
