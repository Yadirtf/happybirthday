/* ==========================================================
   scenes.js — las páginas del libro
   Cada escena: { dur(st), draw(t, st, live), tap(x, y, t, st, fx), auto(t, st, fx), hold }
   - dur: segundos que dura la animación de entrada
   - tap: interacción (devuelve true si la consumió)
   - auto: lo que pasa solo cuando se graba el video
   ========================================================== */
(function () {
  const C = Crayon, P = Props, COL = C.COL, K = window.CONTENT;
  const { seg, ease, back, text, paragraph, line, shape, ellipse, rect } = C;
  const CPS = 30; // letras por segundo del narrador

  const IMG = {};
  function loadImages() {
    const list = { moto: 'assets/fotos/moto.jpeg', juntos1: 'assets/fotos/juntos-1.jpeg', juntos2: 'assets/fotos/juntos-2.jpeg' };
    return Promise.all(Object.entries(list).map(([k, src]) => new Promise(res => {
      const im = new Image();
      im.onload = im.onerror = () => res();
      im.src = src; IMG[k] = im;
    })));
  }

  /* ---------- piezas comunes ---------- */
  function header(title, t) {
    const p = ease(seg(t, 0, 0.8));
    text(title, 540, 150, { size: 66, color: COL.navy, count: Math.ceil(title.length * p) });
    const w = C.measure(title, 66) / 2 + 20;
    line([[540 - w, 182], [540 + w, 176]], COL.pink, 8, { p: seg(t, 0.4, 1.0) });
  }
  function hint(str, t, live, show) {
    if (!live || !show) return;
    const a = 0.55 + Math.sin(t * 4) * 0.35;
    const ctx = C.ctx; ctx.save(); ctx.globalAlpha = a;
    text('( ' + str + ' )', 540, 245, { size: 40, color: COL.purple });
    ctx.restore();
  }
  function narrate(str, t, start) {
    const n = Math.max(0, (t - start) * CPS);
    if (n <= 0) return;
    shape(rect(70, 1470, 940, 360), COL.white, null, 0, { alpha: 0.55, gap: 18 });
    line(rect(70, 1470, 940, 360), COL.orange, 5, { p: seg(t, start - 0.2, start + 0.5) });
    paragraph(str, 540, 1555, 860, { size: 50, lh: 66, count: n, color: COL.black });
  }
  const textTime = (s) => s.length / CPS;

  /* ======================= PORTADA ======================= */
  const portada = {
    hold: 2.5,
    dur: () => 3.4,
    draw(t, st, live) {
      const open = st.open ? ease(seg(t - st.open, 0, 0.7)) : 0;
      const ctx = C.ctx;
      ctx.save();
      ctx.translate(540 - open * 300, 960); ctx.scale(1 - open * 0.15, 1); ctx.translate(-540, -960);
      // tapa del libro
      shape(rect(110, 230, 860, 1460), COL.pink, null, 0, { gap: 15, alpha: 0.75 });
      line(rect(110, 230, 860, 1460), COL.darkred, 9, { p: seg(t, 0, 1) });
      line([[150, 230], [150, 1690]], Props.shade(COL.pink), 10, { p: seg(t, 0.3, 1) });
      line(rect(170, 290, 750, 1340), COL.white, 5, { p: seg(t, 0.6, 1.6), alpha: 0.8 });

      text(K.portada.arriba, 545, 520, { size: 80, color: COL.white, outline: COL.darkred, count: Math.ceil(K.portada.arriba.length * seg(t, 0.8, 1.4)) });
      const s = back(seg(t, 1.2, 1.9));
      if (s > 0) {
        ctx.save(); ctx.translate(545, 690); ctx.scale(s, s);
        text(K.nombre, 0, 0, { size: 190, color: COL.yellow, outline: COL.darkred, outlineW: 26, font: C.FONT_TITLE });
        ctx.restore();
      }
      // estrella con 25
      const sp = back(seg(t, 1.8, 2.5));
      if (sp > 0) {
        ctx.save(); ctx.translate(545, 1060); ctx.scale(sp, sp); ctx.rotate(Math.sin(t * 2) * 0.05);
        P.star(0, 0, 230, COL.yellow);
        text(String(K.edad), 0, 70, { size: 200, color: COL.red, outline: COL.white, outlineW: 14, font: C.FONT_TITLE });
        ctx.restore();
      }
      const bl = seg(t, 2.2, 3);
      if (bl > 0) {
        P.balloon(260, 1290 - 40 * ease(bl), COL.blue, t, 0.9);
        P.balloon(830, 1250 - 40 * ease(bl), COL.purple, t + 1, 0.9);
        P.heart(270, 420, 3.2, COL.red);
        P.heart(830, 420, 2.6, COL.yellow);
        P.star(820, 880, 34, COL.white);
        P.star(260, 880, 28, COL.white);
      }
      paragraph(K.portada.abajo, 545, 1530, 640, { size: 44, color: COL.white, outline: COL.darkred, outlineW: 8, count: (t - 2.6) * 50 });
      ctx.restore();
      if (live && !st.open && t > 2.6) {
        ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(t * 4) * 0.4;
        text('✎ ' + K.portada.boton, 540, 1800, { size: 52, color: COL.navy });
        ctx.restore();
      }
    },
    tap(x, y, t, st, fx) {
      if (st.open) return true;
      st.open = t; fx.pop(); fx.music();
      setTimeout(() => fx.next(), 650);
      return true;
    },
    auto(t, st, fx) { if (!st.open && t > 4.6) { st.open = t; fx.pop(); } }
  };

  /* ======================= CAP 1: niños ======================= */
  const kids = [
    { name: K.nombre, x: 540, hair: 'long', hairColor: COL.brown, shirt: COL.pink, pants: COL.purple, label: COL.pink },
    { name: K.hermana, x: 290, hair: 'long', hairColor: COL.darkbrown, shirt: COL.green, pants: COL.navy, label: COL.green },
    { name: K.primo, x: 800, hair: 'short', hairColor: COL.black, shirt: COL.red, pants: COL.blue, label: COL.red }
  ];
  const cap1 = {
    hold: 2.5,
    dur: () => 1.6 + textTime(K.capitulos[0].texto),
    draw(t, st, live) {
      const ch = K.capitulos[0];
      P.sky(t);
      P.sun(900, 420, 70, t);
      P.cloud(220 + Math.sin(t * 0.3) * 30, 400, 0.9);
      P.ground(1200, COL.green, ease(seg(t, 0, 0.6)));
      P.house(80, 1200, 230, 200, { p: seg(t, 0.2, 1.2), color: COL.yellow });
      P.tree(960, 1210, 0.8);
      for (const f of [[170, 1300, COL.red], [420, 1330, COL.purple], [700, 1310, COL.yellow], [930, 1340, COL.pink]]) P.flower(f[0], f[1], f[2], t);
      // pelota entre Tati y Yadir
      const bt = (t * 0.7) % 2, k = bt < 1 ? bt : 2 - bt;
      const bx = 330 + k * 430, by = 1000 - Math.sin(k * Math.PI) * 220;
      if (t > 1.2) shape(ellipse(bx, by, 32, 32), COL.blue, COL.navy, 5), line(ellipse(bx, by, 32, 12), COL.white, 4);
      kids.forEach((kd, i) => {
        const s = back(seg(t, 0.8 + i * 0.2, 1.4 + i * 0.2));
        if (s <= 0) return;
        const j = st.jump && st.jump[i] != null ? Math.max(0, Math.sin(seg(t - st.jump[i], 0, 0.6) * Math.PI)) * 120 : 0;
        P.person(kd.x, 1290, 0.62 * s, { hair: kd.hair, hairColor: kd.hairColor, shirt: kd.shirt, pants: kd.pants, t: t + i, jump: j, wave: i === 0, flip: i === 2 });
        const lp = seg(t, 1.8 + i * 0.25, 2.4 + i * 0.25);
        if (lp > 0) {
          text(kd.name, kd.x, 920 - (i === 0 ? 40 : 0), { size: 58, color: kd.label, count: Math.ceil(kd.name.length * lp * 2) });
          line([[kd.x, 940 - (i === 0 ? 40 : 0)], [kd.x + 10, 990 - (i === 0 ? 40 : 0)]], kd.label, 5, { p: lp });
        }
        if (st.jump && st.jump[i] != null && t - st.jump[i] < 1.6) P.bubble(kd.x, 760, '¡yo!', 46);
      });
      header(ch.titulo, t);
      hint(ch.pista, t, live, true);
      narrate(ch.texto, t, 1.2);
    },
    tap(x, y, t, st, fx) {
      for (let i = 0; i < kids.length; i++) {
        if (Math.abs(x - kids[i].x) < 110 && y > 970 && y < 1310) {
          st.jump = st.jump || {}; st.jump[i] = t; fx.boing(); return true;
        }
      }
      return false;
    },
    auto(t, st, fx) {
      const d = this.dur();
      [0, 1, 2].forEach(i => {
        st.jump = st.jump || {};
        if (t > d - 1.5 + i * 0.4 && st.jump[i] == null) { st.jump[i] = t; fx.boing(); }
      });
    }
  };

  /* ======================= CAP 2: el cole ======================= */
  const cap2 = {
    hold: 2.5,
    dur: () => 1.6 + textTime(K.capitulos[1].texto),
    draw(t, st, live) {
      const ch = K.capitulos[1];
      P.sky(t);
      P.cloud(850 + Math.sin(t * 0.3) * 30, 420, 0.8);
      P.ground(1230, COL.green, ease(seg(t, 0, 0.5)));
      shape([[380, 1230], [700, 1230], [1000, 1480], [80, 1480]], COL.grey, null, 0, { alpha: 0.35 });
      const ring = st.ring != null ? Math.max(0, 1 - (t - st.ring) / 1.6) : 0;
      const sp = back(seg(t, 0.2, 1));
      if (sp > 0) {
        const ctx = C.ctx; ctx.save(); ctx.translate(540, 1230); ctx.scale(sp, sp); ctx.translate(-540, -1230);
        P.school(540, 1230, t, { ring });
        ctx.restore();
      }
      if (ring > 0) {
        text('¡RIIIING!', 540, 520, { size: 80, color: COL.red, outline: COL.yellow, font: C.FONT_TITLE });
        for (const sgn of [-1, 1]) for (let k = 0; k < 3; k++) line([[540 + sgn * (70 + k * 20), 640 - k * 22], [540 + sgn * (110 + k * 30), 620 - k * 40]], COL.orange, 6);
      }
      // los tres caminando con morrales
      const walk = ease(seg(t, 0.6, 2.8));
      const run = st.ring != null ? ease(seg(t - st.ring, 0.2, 1.4)) : 0;
      kids.forEach((kd, i) => {
        const x = -150 + walk * (230 + i * 150) + run * 120;
        const j = ring > 0 ? Math.abs(Math.sin((t - st.ring) * 9 + i)) * 60 * ring : 0;
        P.person(x, 1420 - i * 4, 0.6, { hair: kd.hair, hairColor: kd.hairColor, shirt: COL.white, sleeve: COL.white, pants: COL.navy, t: t + i, walk: walk < 1 || run > 0 && run < 1 ? t * 9 + i : 0, backpack: [COL.pink, COL.green, COL.red][i], jump: j });
      });
      header(ch.titulo, t);
      hint(ch.pista, t, live, st.ring == null);
      narrate(ch.texto, t, 1.2);
    },
    tap(x, y, t, st, fx) {
      if (Math.abs(x - 540) < 130 && y > 480 && y < 760) { st.ring = t; fx.bell(); return true; }
      return false;
    },
    auto(t, st, fx) { if (st.ring == null && t > this.dur() - 1.2) { st.ring = t; fx.bell(); } }
  };

  /* ======================= CAP 3: casa nueva ======================= */
  const adults = [
    { hair: 'long', hairColor: COL.darkbrown, shirt: COL.green, pants: COL.navy },
    { hair: 'long', hairColor: COL.brown, shirt: COL.purple, pants: COL.jeans },
    { hair: 'short', hairColor: COL.black, shirt: COL.red, pants: COL.navy, glasses: true }
  ];
  const cap3 = {
    hold: 2.5,
    dur: () => 1.6 + textTime(K.capitulos[2].texto),
    draw(t, st, live) {
      const ch = K.capitulos[2];
      P.sky(t);
      P.sun(160, 420, 60, t);
      P.ground(1250, COL.green, ease(seg(t, 0, 0.5)));
      P.house(560, 1250, 380, 330, { p: seg(t, 0.2, 1.2), color: COL.sky, roof: COL.purple, chimney: true });
      // letrero
      const found = st.found != null ? ease(seg(t - st.found, 0, 0.5)) : 0;
      if (t > 1) {
        line([[470, 1250], [470, 960]], COL.darkbrown, 10);
        const ctx = C.ctx; ctx.save(); ctx.translate(470, 900); ctx.scale(1, 1 - Math.sin(found * Math.PI) * 0.9);
        shape(rect(-200, -70, 400, 130), found > 0.5 ? COL.yellow : COL.white, COL.darkbrown, 6);
        text(found > 0.5 ? '¡NUESTRA CASA!' : 'SE ARRIENDA', 0, 18, { size: found > 0.5 ? 40 : 54, color: found > 0.5 ? COL.red : COL.black, font: C.FONT_TITLE });
        ctx.restore();
      }
      // los tres buscando
      const walk = ease(seg(t, 0.4, 2.6));
      adults.forEach((a, i) => {
        const x = -200 + walk * (300 + i * 115);
        const j = found > 0 ? Math.abs(Math.sin((t - st.found) * 7 + i)) * 50 : 0;
        P.person(x, 1430 - (i % 2) * 10, 0.62, Object.assign({ t: t + i, walk: walk < 1 ? t * 9 + i : 0, jump: j, wave: found > 0 && i === 1 }, a));
      });
      if (walk >= 1 && found === 0) {
        // lupa
        const lx = 300 + Math.sin(t * 2) * 30;
        line([[lx, 1110], [lx + 50, 1170]], COL.darkbrown, 10);
        line(ellipse(lx - 20, 1085, 36, 36), COL.grey, 7);
      }
      if (found > 0) for (let k = 0; k < 6; k++) {
        const ht = (t - st.found) * 0.8 + k / 6;
        P.heart(430 + k * 70 + Math.sin(ht * 6) * 20, 1100 - (ht % 1) * 500, 2.2, [COL.red, COL.pink][k % 2]);
      }
      header(ch.titulo, t);
      hint(ch.pista, t, live, st.found == null);
      narrate(ch.texto, t, 1.2);
    },
    tap(x, y, t, st, fx) {
      if (st.found == null && Math.abs(x - 470) < 200 && y > 800 && y < 1000) { st.found = t; fx.tada(); return true; }
      return false;
    },
    auto(t, st, fx) { if (st.found == null && t > this.dur() - 1.2) { st.found = t; fx.tada(); } }
  };

  /* ======================= CAP 4: hoy ======================= */
  const cap4 = {
    hold: 2.5,
    dur: () => 1.6 + textTime(K.capitulos[3].texto),
    draw(t, st, live) {
      const ch = K.capitulos[3];
      P.sky(t, { color: COL.lightpink });
      P.ground(1260, COL.green, ease(seg(t, 0, 0.5)));
      P.house(60, 1260, 300, 260, { p: seg(t, 0.2, 1.1), color: COL.orange, roof: COL.brown });
      P.house(720, 1260, 300, 260, { p: seg(t, 0.4, 1.3), color: COL.yellow, roof: COL.red });
      if (t > 1.2) {
        text('los abuelos', 210, 1340, { size: 46, color: COL.darkbrown });
        text('Dayana y Tati', 870, 1340, { size: 46, color: COL.darkbrown });
      }
      // camino de corazones (arco)
      const arc = [];
      for (let i = 0; i <= 30; i++) {
        const k = i / 30;
        arc.push([250 + k * 580, 820 - Math.sin(k * Math.PI) * 300]);
      }
      const ap = seg(t, 1.2, 2.6);
      for (let i = 0; i < 30; i += 2) {
        if (i / 30 > ap) break;
        line([arc[i], arc[i + 1]], COL.red, 6);
      }
      // corazones viajando
      const sends = (st.sends || []).concat([0.5, 2, 3.5].map(v => v + 2.6));
      for (const s0 of sends) {
        const k = (t - s0) / 1.8;
        if (k < 0 || k > 1) continue;
        const kk = (s0 * 13 | 0) % 2 ? k : 1 - k;
        const p = arc[Math.min(30, Math.round(kk * 30))];
        P.heart(p[0], p[1] - 10, 3 + Math.sin(k * Math.PI) * 1.5, COL.red);
      }
      if (ap >= 1) {
        P.heart(250, 820, 2.5 + Math.sin(t * 5) * 0.4, COL.pink);
        P.heart(830, 820, 2.5 + Math.sin(t * 5 + 1) * 0.4, COL.pink);
      }
      header(ch.titulo, t);
      hint(ch.pista, t, live, !(st.sends && st.sends.length));
      narrate(ch.texto, t, 1.4);
    },
    tap(x, y, t, st, fx) {
      if (y > 450 && y < 1300) { (st.sends = st.sends || []).push(t); fx.pop(); return true; }
      return false;
    },
    auto(t, st, fx) {
      st.sends = st.sends || [];
      const d = this.dur();
      if (st.sends.length < 3 && t > d - 1.6 + st.sends.length * 0.35) { st.sends.push(t); fx.pop(); }
    }
  };

  /* ======================= CAP 5: la motera ======================= */
  const cap5 = {
    hold: 3.5,
    dur: () => 1.8 + textTime(K.capitulos[4].texto),
    draw(t, st, live) {
      const ch = K.capitulos[4];
      const ctx = C.ctx;
      const pin = back(seg(t, 0.2, 1));
      if (pin > 0) {
        ctx.save(); ctx.translate(540, 680); ctx.scale(pin, pin); ctx.translate(-540, -680);
        P.photo(IMG.moto, 540, 680, 540, -0.05, { h: 700, focusY: 0.55, frame: COL.red });
        ctx.restore();
      }
      if (t > 1.1) {
        text('¡la motera!', 880, 380, { size: 52, color: COL.red, count: Math.ceil((t - 1.1) * 20) });
        line([[860, 400], [830, 480], [770, 520]], COL.red, 6, { p: seg(t, 1.4, 1.9) });
        line([[805, 505], [770, 520], [790, 485]], COL.red, 6, { p: seg(t, 1.8, 2.0) });
        P.star(190, 380, 34, COL.yellow);
        P.heart(170, 1010, 2.6, COL.pink);
      }
      // carretera
      const ry = 1330;
      shape(rect(-20, ry - 40, 1120, 120), COL.grey, null, 0, { alpha: 0.7 });
      for (let x = -40; x < 1100; x += 160) line([[x + ((st.go != null ? (t - st.go) * 900 : 0) % 160) * -1 + 160, ry + 20], [x + 80 + ((st.go != null ? (t - st.go) * 900 : 0) % 160) * -1 + 160, ry + 20]], COL.yellow, 8);
      // la moto
      let mx = 280, lean = 0, wind = false;
      if (st.go != null) {
        const k = (t - st.go) / 2.2;
        if (k < 1) {
          mx = 280 + Math.pow(k, 1.6) * 1500;
          if (mx > 1400) mx = -400 + (mx - 1400);
          lean = -0.05; wind = true;
          for (let i = 0; i < 4; i++) line([[mx - 300 - i * 50, ry - 120 - i * 50], [mx - 420 - i * 70, ry - 120 - i * 50]], COL.navy, 5, { alpha: 0.6 });
          for (let i = 0; i < 3; i++) shape(ellipse(mx - 280 - i * 70, ry + 10 - i * 10, 30 + i * 12, 24 + i * 8), COL.cream, COL.grey, 3, { alpha: 0.7 });
          text('¡BRRRUM!', 540, 1170, { size: 84, color: COL.red, outline: COL.yellow, font: C.FONT_TITLE });
        } else { mx = Math.min(280, -400 + (k - 1) * 1200); if (mx < 280) wind = true; }
      }
      const ms = 0.55 * back(seg(t, 0.6, 1.3));
      if (ms > 0) P.moto(mx, ry + 10, ms, t, { spin: st.go != null ? (t - st.go) * 20 : t * 0.5, bob: true, lean, wind, light: true });
      header(ch.titulo, t);
      hint(ch.pista, t, live, st.go == null);
      narrate(ch.texto, t, 1.4);
    },
    tap(x, y, t, st, fx) {
      if (y > 1050 && y < 1420 && (st.go == null || t - st.go > 3.2)) { st.go = t; fx.brum(); return true; }
      return false;
    },
    auto(t, st, fx) { if (st.go == null && t > this.dur() - 1.6) { st.go = t; fx.brum(); } }
  };

  /* ======================= CAP 6: nosotros ======================= */
  const cap6 = {
    hold: 3,
    dur: () => 1.8 + textTime(K.capitulos[5].texto),
    draw(t, st, live) {
      const ch = K.capitulos[5];
      const ctx = C.ctx;
      const wig = (i) => st.wig && st.wig[i] != null ? Math.sin((t - st.wig[i]) * 20) * 0.08 * Math.max(0, 1 - (t - st.wig[i])) : 0;
      const a = back(seg(t, 0.2, 0.9));
      if (a > 0) {
        ctx.save(); ctx.translate(500, 560); ctx.scale(a, a); ctx.translate(-500, -560);
        P.photo(IMG.juntos1, 500, 560, 740, -0.06 + wig(0), { h: 360, polaroid: true, caption: ch.fotos[0], frame: COL.purple, focusY: 0.3 });
        ctx.restore();
      }
      const b = back(seg(t, 0.7, 1.4));
      if (b > 0) {
        ctx.save(); ctx.translate(600, 1050); ctx.scale(b, b); ctx.translate(-600, -1050);
        P.photo(IMG.juntos2, 640, 1130, 390, 0.05 + wig(1), { h: 420, polaroid: true, caption: ch.fotos[1], frame: COL.blue, focusY: 0.35 });
        ctx.restore();
      }
      if (t > 1.4) {
        P.heart(180, 1000, 3 + Math.sin(t * 4) * 0.3, COL.red);
        P.heart(240, 1160, 2, COL.pink);
        P.star(930, 820, 30, COL.yellow);
        P.star(160, 320, 26, COL.yellow);
      }
      for (const w of Object.values(st.wig || {})) {
        const k = t - w;
        if (k > 1.6) continue;
        for (let i = 0; i < 5; i++) P.heart(300 + i * 120 + Math.sin(k * 5 + i) * 20, 1300 - k * 500 - i * 30, 2, [COL.red, COL.pink][i % 2]);
      }
      header(ch.titulo, t);
      hint(ch.pista, t, live, !st.wig);
      narrate(ch.texto, t, 1.6);
    },
    tap(x, y, t, st, fx) {
      if (y > 300 && y < 800) { (st.wig = st.wig || {})[0] = t; fx.pop(); return true; }
      if (y > 800 && y < 1440) { (st.wig = st.wig || {})[1] = t; fx.pop(); return true; }
      return false;
    },
    auto(t, st, fx) {
      const d = this.dur();
      if ((!st.wig || st.wig[0] == null) && t > d - 1.5) { (st.wig = st.wig || {})[0] = t; fx.pop(); }
      if (st.wig && st.wig[1] == null && t > d - 0.8) { st.wig[1] = t; fx.pop(); }
    }
  };

  /* ======================= PASTEL ======================= */
  const cake = {
    hold: 5,
    dur: () => 1.4 + textTime(K.capitulos[6].texto),
    ready: (st) => st.out && st.out[0] && st.out[1],
    draw(t, st, live) {
      const ch = K.capitulos[6];
      st.out = st.out || [false, false];
      st.smoke = st.smoke || [null, null];
      const allOut = st.out[0] && st.out[1];
      if (allOut && st.done == null) st.done = t;
      const dark = st.done != null ? 0 : 0.18 * ease(seg(t, 0, 1));
      if (dark > 0) shape(rect(-20, -20, 1120, 1960), COL.navy, null, 0, { alpha: dark, gap: 20 });
      const sp = back(seg(t, 0.2, 1));
      const ctx = C.ctx;
      ctx.save(); ctx.translate(540, 1300); ctx.scale(sp, sp); ctx.translate(-540, -1300);
      const smoke = st.smoke.map(s => s == null ? null : t - s);
      P.cake(540, 1330, t, { out: st.out, smoke });
      ctx.restore();
      P.balloon(140, 520, COL.red, t, 0.8);
      P.balloon(950, 560, COL.yellow, t + 2, 0.8);
      if (st.done != null) {
        const k = t - st.done;
        st.conf = st.conf || P.makeConfetti(90, t);
        P.confetti(st.conf, t);
        const s = back(seg(k, 0.2, 0.9));
        if (s > 0) {
          ctx.save(); ctx.translate(540, 330); ctx.scale(s, s); ctx.rotate(Math.sin(t * 3) * 0.03);
          text('¡Feliz', 0, -70, { size: 120, color: COL.pink, outline: COL.darkred, outlineW: 16, font: C.FONT_TITLE });
          text('cumpleaños,', 0, 60, { size: 110, color: COL.yellow, outline: COL.darkred, outlineW: 16, font: C.FONT_TITLE });
          text(K.nombre + '!', 0, 210, { size: 150, color: COL.blue, outline: COL.navy, outlineW: 16, font: C.FONT_TITLE });
          ctx.restore();
        }
        narrate(ch.despues, t, st.done + 0.8);
      } else {
        header(ch.titulo, t);
        hint(ch.pista, t, live, true);
        narrate(ch.texto, t, 0.8);
      }
    },
    tap(x, y, t, st, fx) {
      st.out = st.out || [false, false];
      st.smoke = st.smoke || [null, null];
      if (y > 700 && y < 1350) {
        let i = x < 540 ? 0 : 1;
        if (st.out[i]) i = 1 - i;
        if (!st.out[i]) { st.out[i] = true; st.smoke[i] = t; fx.blow(); if (st.out[0] && st.out[1]) fx.tada(); }
        return true;
      }
      return false;
    },
    blowAll(t, st, fx) {
      st.out = st.out || [false, false]; st.smoke = st.smoke || [null, null];
      for (let i = 0; i < 2; i++) if (!st.out[i]) { st.out[i] = true; st.smoke[i] = t; }
      fx.blow(); fx.tada();
    },
    auto(t, st, fx) {
      const d = this.dur();
      st.out = st.out || [false, false]; st.smoke = st.smoke || [null, null];
      if (!st.out[0] && t > d - 0.4) { st.out[0] = true; st.smoke[0] = t; fx.blow(); }
      if (!st.out[1] && t > d + 0.3) { st.out[1] = true; st.smoke[1] = t; fx.blow(); fx.tada(); }
    }
  };

  /* ======================= CARTA ======================= */
  const carta = {
    hold: 4,
    dur: () => 1.5 + (K.carta.texto.length + K.carta.firma.length) / 34,
    draw(t, st, live) {
      // hoja de cuaderno
      const ctx = C.ctx;
      const s = ease(seg(t, 0, 0.6));
      ctx.save(); ctx.translate(540, 960); ctx.rotate(-0.015); ctx.scale(0.9 + s * 0.1, 0.9 + s * 0.1); ctx.globalAlpha = s; ctx.translate(-540, -960);
      ctx.fillStyle = '#fffdf6'; ctx.fillRect(70, 100, 940, 1730);
      ctx.strokeStyle = 'rgba(58,134,255,0.28)'; ctx.lineWidth = 2;
      for (let y = 300; y < 1800; y += 62) { ctx.beginPath(); ctx.moveTo(70, y); ctx.lineTo(1010, y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(230,57,70,0.45)'; ctx.beginPath(); ctx.moveTo(170, 100); ctx.lineTo(170, 1830); ctx.stroke();
      for (let y = 220; y < 1800; y += 190) { ctx.fillStyle = '#efe4cc'; ctx.beginPath(); ctx.arc(115, y, 16, 0, 7); ctx.fill(); }
      ctx.restore();
      const n = (t - 0.8) * 34;
      text(K.carta.titulo, 200, 250, { size: 64, color: COL.red, align: 'left', count: n });
      const h = paragraph(K.carta.texto, 200, 360, 760, { size: 44, lh: 62, align: 'left', color: COL.navy, count: n - K.carta.titulo.length });
      const firmaN = n - K.carta.titulo.length - K.carta.texto.length;
      paragraph(K.carta.firma, 960, 360 + h + 70, 700, { size: 52, lh: 64, align: 'right', color: COL.purple, count: firmaN });
      if (firmaN > K.carta.firma.length) {
        P.heart(880, 1760, 3.2 + Math.sin(t * 5) * 0.3, COL.red);
        P.star(260, 1740, 30, COL.yellow);
      }
    }
  };

  window.Scenes = { list: [portada, cap1, cap2, cap3, cap4, cap5, cap6, cake, carta], loadImages, IMG };
})();
