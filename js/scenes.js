/* ==========================================================
   scenes.js — "Receta secreta: cómo se hace una Dayana"
   Cada escena: { dur(st), draw(t, st, live), tap(x, y, t, st, fx), auto(t, st, fx), hold, ready(st) }
   - dur: segundos que dura la animación de entrada
   - tap: interacción (devuelve true si la consumió)
   - auto: lo que pasa solo cuando se graba el video
   En cada ingrediente, después de la interacción, los muñequitos
   saltan a la olla con un "¡plop!".
   ========================================================== */
(function () {
  const C = Crayon, P = Props, COL = C.COL, K = window.CONTENT, PG = K.paginas;
  const { seg, ease, back, text, paragraph, line, shape, ellipse, rect, clamp } = C;
  const CPS = 30; // letras por segundo del narrador
  const lerp = (a, b, k) => a + (b - a) * k;

  const IMG = {};
  function loadImages() {
    const list = { moto: 'assets/fotos/moto.jpeg', juntos1: 'assets/fotos/juntos-1.jpeg', juntos2: 'assets/fotos/juntos-2.jpeg' };
    return Promise.all(Object.entries(list).map(([k, src]) => new Promise(res => {
      const im = new Image();
      im.onload = im.onerror = () => res();
      im.src = src; IMG[k] = im;
    })));
  }

  /* ---------- los muñequitos ---------- */
  const DAYANA = { hair: 'long', hairColor: '#e2b862', skin: '#fbe3cf', shirt: COL.pink, pants: COL.purple };
  const TATI = { hair: 'long', hairColor: '#1f1a17', skin: '#d6a06b', shirt: COL.green, pants: COL.navy };
  const YADIR = { hair: 'short', hairColor: '#1f1a17', skin: '#c98d5b', shirt: COL.red, pants: COL.blue };
  const TIA = { hair: 'medium', hairColor: '#1f1a17', skin: '#e6b88c', shirt: '#2a9d8f', pants: COL.brown, apron: true };
  const DANI = { hair: 'short', hairColor: '#9a6a3a', skin: '#f6d6bb', shirt: COL.blue, pants: COL.navy };
  const ASLEI = { hair: 'pigtails', hairColor: '#1f1a17', skin: '#e6b88c', shirt: COL.yellow, pants: COL.pink };
  const as = (base, extra) => Object.assign({}, base, extra);

  /* ---------- piezas comunes ---------- */
  function header(title, t) {
    const parts = title.split(' · ');
    const kicker = parts.length > 1 ? parts[0] : null, main = parts.length > 1 ? parts[1] : parts[0];
    const p = ease(seg(t, 0, 0.8));
    if (kicker) text(kicker, 540, 118, { size: 46, color: COL.pink, count: Math.ceil(kicker.length * p * 1.5) });
    let size = 64;
    const w0 = C.measure(main, size);
    if (w0 > 960) size = Math.floor(size * 960 / w0);
    const y = kicker ? 196 : 160;
    text(main, 540, y, { size, color: COL.navy, count: Math.ceil(main.length * p) });
    const w = Math.min(480, C.measure(main, size) / 2 + 20);
    line([[540 - w, y + 30], [540 + w, y + 24]], COL.orange, 7, { p: seg(t, 0.4, 1.0) });
  }
  function hint(str, t, live, show) {
    if (!live || !show || t < 1) return;
    const ctx = C.ctx; ctx.save(); ctx.globalAlpha = 0.55 + Math.sin(t * 4) * 0.35;
    text('( ' + str + ' )', 540, 290, { size: 40, color: COL.purple });
    ctx.restore();
  }
  function narrate(str, t, start) {
    const n = Math.max(0, (t - start) * CPS);
    if (n <= 0) return;
    shape(rect(60, 1480, 960, 350), COL.white, null, 0, { alpha: 0.6, gap: 18 });
    line(rect(60, 1480, 960, 350), COL.orange, 5, { p: seg(t, start - 0.2, start + 0.5) });
    paragraph(str, 540, 1560, 880, { size: 47, lh: 62, count: n, color: COL.black });
  }
  const textTime = (s) => s.length / CPS;

  /* ---------- la olla y el salto de los muñequitos ---------- */
  const POT = { x: 920, y: 1415, s: 0.72 };
  const HOP = 0.7, STAG = 0.16;
  function hopState(st, t, i) {
    if (st.pot == null) return 0;
    return seg(t, st.pot + i * STAG, st.pot + i * STAG + HOP);
  }
  function hopXY(x, y, s, k) {
    if (k <= 0) return [x, y, s];
    return [lerp(x, POT.x, k), lerp(y, POT.y - 110, k) - Math.sin(k * Math.PI) * 380, s * (1 - k * 0.8)];
  }
  function drawCast(cast, t, st) {
    cast.forEach((c, i) => {
      const k = hopState(st, t, i);
      if (k >= 1) return;
      const [x, y, s] = hopXY(c.x, c.y, c.s, k);
      const ctx = C.ctx;
      if (k > 0) { ctx.save(); ctx.translate(x, y - 150 * s); ctx.rotate(k * 5); ctx.translate(-x, -(y - 150 * s)); }
      if (c.draw) c.draw(x, y, s, k);
      else P.person(x, y, s, Object.assign({ t: t + i }, c.o, k > 0 ? { walk: 0, jump: 0, wave: false, mouth: 'o' } : {}));
      if (k > 0) ctx.restore();
    });
  }
  function drawPot(t, st, n, idx) {
    const end = st.pot == null ? Infinity : st.pot + (n - 1) * STAG + HOP;
    const splash = st.pot == null ? 0 : seg(t, end - 0.15, end + 0.9);
    P.pot(POT.x, POT.y, POT.s, t, { splash, label: String(idx) });
  }

  /* Fábrica de páginas-ingrediente */
  function ingredient(cfg) {
    const k = cfg.k;
    return {
      hold: cfg.hold || 5,
      dur: () => 1.4 + textTime(k.texto),
      ready: (st) => st.pot != null,
      draw(t, st, live) {
        if (st.inter != null && st.pot == null && t > st.inter + (cfg.potDelay || 2.4)) { st.pot = t; Sound.fx.boing(); }
        if (st.pot != null && !st.plopped && t > st.pot + HOP + 0.2) { st.plopped = true; Sound.fx.pop(); }
        cfg.bg(t, st);
        const cast = cfg.cast(t, st);
        drawCast(cast, t, st);
        if (cfg.fg) cfg.fg(t, st);
        drawPot(t, st, cast.length, cfg.n);
        header(k.titulo, t);
        hint(k.pista, t, live, st.inter == null);
        if (live && st.inter != null && st.pot == null && t > st.inter + 1.2) {
          const ctx = C.ctx; ctx.save(); ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.4;
          text('¡a la olla!', POT.x - 20, POT.y - 210, { size: 44, color: COL.red });
          ctx.restore();
        }
        narrate(k.texto, t, 1.1);
      },
      tap(x, y, t, st, fx) {
        if (st.inter != null && st.pot == null && Math.hypot(x - POT.x, y - (POT.y - 80)) < 160) { st.pot = t; fx.boing(); return true; }
        if (st.inter == null && cfg.hit(x, y, t, st)) { st.inter = t; if (cfg.onInter) cfg.onInter(fx, st, t); return true; }
        return false;
      },
      auto(t, st, fx) {
        if (st.inter == null && t > this.dur() - 1.0) { st.inter = t; if (cfg.onInter) cfg.onInter(fx, st, t); }
      }
    };
  }
  const near = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) < r;
  function sceneBase(t, o = {}) {
    P.sky(t, { color: o.sky || COL.sky, h: 1300 });
    if (o.sun !== false) P.sun(o.sunX || 140, 420, 56, t);
    if (o.cloud !== false) P.cloud((o.cloudX || 820) + Math.sin(t * 0.3) * 30, 420, 0.75);
    P.ground(o.ground || 1240, o.groundColor || COL.green, ease(seg(t, 0, 0.5)));
  }

  /* ======================= PORTADA ======================= */
  const portada = {
    hold: 2.5,
    dur: () => 3.4,
    draw(t, st, live) {
      const open = st.open ? ease(seg(t - st.open, 0, 0.7)) : 0;
      const ctx = C.ctx;
      ctx.save();
      ctx.translate(540 - open * 300, 960); ctx.scale(1 - open * 0.15, 1); ctx.translate(-540, -960);
      // tapa del recetario
      shape(rect(110, 200, 860, 1500), '#f28b5b', null, 0, { gap: 15, alpha: 0.75 });
      line(rect(110, 200, 860, 1500), COL.darkbrown, 9, { p: seg(t, 0, 1) });
      line([[150, 200], [150, 1700]], P.shade('#f28b5b'), 10, { p: seg(t, 0.3, 1) });
      // manteles a cuadros
      for (let i = 0; i < 7; i++) shape(rect(170 + i * 110, 1590, 55, 55), COL.white, null, 0, { alpha: 0.6 });
      // manchitas de chocolate
      shape(ellipse(820, 330, 46, 34), COL.darkbrown, null, 0, { alpha: 0.45 });
      shape(ellipse(870, 380, 14, 12), COL.darkbrown, null, 0, { alpha: 0.45 });
      text(K.portada.arriba, 545, 400, { size: 96, color: COL.cream, outline: COL.darkbrown, count: Math.ceil(K.portada.arriba.length * seg(t, 0.6, 1.3)), font: C.FONT_TITLE });
      text(K.portada.medio, 545, 520, { size: 64, color: COL.white, outline: COL.darkbrown, outlineW: 8, count: Math.ceil(K.portada.medio.length * seg(t, 1.0, 1.5)) });
      const s = back(seg(t, 1.3, 2.0));
      if (s > 0) {
        ctx.save(); ctx.translate(545, 700); ctx.scale(s, s);
        text(K.nombre, 0, 0, { size: 190, color: COL.yellow, outline: COL.darkred, outlineW: 26, font: C.FONT_TITLE });
        ctx.restore();
      }
      // la olla con los tres asomados
      const pp = back(seg(t, 1.8, 2.5));
      if (pp > 0) {
        ctx.save(); ctx.translate(545, 1190); ctx.scale(pp, pp); ctx.translate(-545, -1190);
        [[as(TATI, {}), 440], [as(DAYANA, {}), 545], [as(YADIR, {}), 650]].forEach(([o, x], i) => {
          P.person(x, 1220 + Math.abs(Math.sin(t * 3 + i)) * -16, 0.42, Object.assign({ t: t + i, wave: i === 1 }, o));
        });
        P.pot(545, 1330, 1.5, t, {});
        ctx.restore();
      }
      // sello
      const sp = back(seg(t, 2.3, 2.8));
      if (sp > 0) {
        ctx.save(); ctx.translate(800, 960); ctx.rotate(0.25); ctx.scale(sp, sp);
        line(ellipse(0, 0, 130, 64), COL.red, 7);
        text(K.portada.sello, 0, 14, { size: 40, color: COL.red });
        ctx.restore();
      }
      paragraph(K.portada.abajo, 545, 1450, 680, { size: 42, color: COL.white, outline: COL.darkbrown, outlineW: 8, count: (t - 2.6) * 50 });
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

  /* ======================= PASO 1: el horno ======================= */
  const origen = {
    hold: 4,
    dur: () => 1.4 + textTime(PG.origen.texto),
    ready: (st) => st.inter != null,
    draw(t, st, live) {
      const k = PG.origen;
      P.sky(t, { color: COL.cream, h: 1300 });
      shape(rect(-20, 1200, 1120, 300), '#d9b38c', null, 0, { alpha: 0.6 });
      // azulejos
      for (let i = 0; i < 9; i++) line([[i * 130, 700], [i * 130, 1200]], COL.sky, 3, { alpha: 0.4 });
      for (let j = 0; j < 4; j++) line([[0, 720 + j * 130], [1080, 720 + j * 130]], COL.sky, 3, { alpha: 0.4 });
      // corazones que vuelan al horno
      const fly = seg(t, 1.0, 2.4);
      if (fly < 1 && t > 0.6) {
        const e = ease(fly);
        P.heart(lerp(150, 520, e), lerp(560, 860, e) - Math.sin(e * Math.PI) * 120, 4, COL.red);
        P.heart(lerp(930, 560, e), lerp(560, 860, e) - Math.sin(e * Math.PI) * 120, 4, COL.pink);
        if (fly < 0.6) {
          text(k.etiquetas[0], 190, 470, { size: 40, color: COL.darkred });
          text(k.etiquetas[1], 880, 470, { size: 40, color: COL.darkred });
        }
      }
      const shake = st.inter == null && fly >= 1 ? 0.6 : 0;
      const glow = st.inter != null ? ease(seg(t - st.inter, 0, 0.4)) : (fly >= 1 ? 0.15 : 0);
      P.oven(540, 1220, t, { shake, glow });
      if (st.inter != null) {
        const d = t - st.inter;
        if (d < 1.6) text('¡DING!', 540, 680, { size: 110, color: COL.red, outline: COL.yellow, font: C.FONT_TITLE });
        // salen los tres bebés
        [[TATI, 300], [DAYANA, 540], [YADIR, 780]].forEach(([o, x], i) => {
          const kk = ease(seg(d, 0.3 + i * 0.2, 1.0 + i * 0.2));
          if (kk <= 0) return;
          const bx = lerp(540, x, kk), by = lerp(1100, 1390, kk) - Math.sin(kk * Math.PI) * 300;
          P.person(bx, by, 0.42, as(o, { t: t + i, wave: kk >= 1 && i === 1, shirt: COL.white, pants: COL.white, mouth: kk < 1 ? 'o' : null }));
        });
      }
      header(k.titulo, t);
      hint(k.pista, t, live, st.inter == null && fly >= 1);
      narrate(k.texto, t, 1.1);
    },
    tap(x, y, t, st, fx) {
      if (st.inter == null && x > 280 && x < 800 && y > 800 && y < 1260) { st.inter = t; fx.tada(); return true; }
      return false;
    },
    auto(t, st, fx) { if (st.inter == null && t > this.dur() - 1.0) { st.inter = t; fx.tada(); } }
  };

  /* ======================= INGREDIENTE 1: la tía ======================= */
  const tia = ingredient({
    k: PG.tia, n: 1,
    bg(t) { sceneBase(t); P.house(40, 1240, 250, 230, { color: COL.yellow, roof: COL.red }); },
    cast(t, st) {
      const hug = Math.sin(t * 3) * 0.08;
      return [
        { x: 360, y: 1290, s: 0.5, o: as(TATI, {}) },
        { x: 470, y: 1300, s: 0.5, o: as(DAYANA, { wave: true }) },
        { x: 620, y: 1270, s: 0.85, o: as(TIA, { armL: Math.PI - 0.5 + hug, armR: 0.35 - hug, mouth: st.inter != null ? 'laugh' : null }) },
        { x: 730, y: 1290, s: 0.5, o: as(YADIR, { armL: Math.PI - 0.15, armR: Math.PI - 0.45, flip: false }) }
      ];
    },
    fg(t, st) {
      if (st.inter != null && (st.pot == null || t < st.pot + 0.4)) {
        const d = t - st.inter;
        P.bubbleLines(560, 700, [PG.tia.globo], 56, { tail: 610, color: COL.purple });
        for (let i = 0; i < 4; i++) P.heart(560 + Math.sin(d * 3 + i) * 120, 900 - ((d * 0.6 + i / 4) % 1) * 300, 2.2, [COL.red, COL.pink][i % 2]);
      }
    },
    hit: (x, y) => x > 520 && x < 720 && y > 850 && y < 1290,
    onInter: (fx) => fx.tada()
  });

  /* ======================= INGREDIENTE 2: Tati y el chantaje ======================= */
  const tati = ingredient({
    k: PG.tati, n: 2,
    bg(t, st) {
      P.sky(t, { color: COL.lightpink, h: 1300 });
      shape(rect(-20, 1240, 1120, 260), '#d9b38c', null, 0, { alpha: 0.6 });
      // ventana
      shape(rect(700, 470, 240, 200), COL.sky, COL.darkbrown, 6);
      line([[820, 470], [820, 670]], COL.darkbrown, 4); line([[700, 570], [940, 570]], COL.darkbrown, 4);
      P.table(120, 560, 1050);
      P.cookieJar(330, 1048, true);
    },
    cast(t, st) {
      const busted = st.inter != null;
      const sneak = Math.sin(t * 4) * 0.15;
      return [
        { x: 250, y: 1300, s: 0.5, o: as(DAYANA, { armR: busted ? -1.9 : -1.2 + sneak, armL: busted ? -1.2 : Math.PI - 1.2, mouth: busted ? 'o' : null }) },
        { x: 440, y: 1300, s: 0.5, o: as(YADIR, { armL: busted ? Math.PI + 1.2 : Math.PI + 0.8 - sneak, armR: busted ? -1.9 : 1.2, mouth: busted ? 'o' : null }) },
        { x: 730, y: 1300, s: 0.56, o: as(TATI, { armL: Math.PI - 0.4, armR: busted ? -0.3 : 1.2, mouth: busted ? 'laugh' : 'flat' }),
          draw: null }
      ];
    },
    fg(t, st) {
      if (st.inter != null && (st.pot == null || t < st.pot + 0.4)) {
        P.bubbleLines(560, 650, PG.tati.globo, 46, { tail: 700 });
        text('!', 250, 990, { size: 90, color: COL.red, font: C.FONT_TITLE });
        text('!', 440, 990, { size: 90, color: COL.red, font: C.FONT_TITLE });
        // libretica de Tati
        shape(rect(770, 1080, 60, 76), COL.yellow, COL.darkbrown, 4);
      }
    },
    hit: (x, y) => x > 620 && x < 860 && y > 950 && y < 1300,
    onInter: (fx) => fx.boing()
  });

  /* ======================= INGREDIENTE 3: el cole ======================= */
  const cole = ingredient({
    k: PG.cole, n: 3, potDelay: 2.6,
    bg(t, st) {
      sceneBase(t, { sun: false, cloudX: 160 });
      const ring = st.inter != null ? Math.max(0, 1 - (t - st.inter) / 1.6) : 0;
      const sp = back(seg(t, 0.2, 1));
      if (sp > 0) {
        const ctx = C.ctx; ctx.save(); ctx.translate(520, 1240); ctx.scale(sp * 0.9, sp * 0.9); ctx.translate(-520, -1240);
        P.school(520, 1240, t, { ring });
        ctx.restore();
      }
      if (ring > 0) text('¡RIIIING!', 520, 590, { size: 76, color: COL.red, outline: COL.yellow, font: C.FONT_TITLE });
    },
    cast(t, st) {
      const walk = ease(seg(t, 0.6, 2.8));
      const ring = st.inter != null ? Math.max(0, 1 - (t - st.inter) / 1.6) : 0;
      return [DAYANA, TATI, YADIR].map((o, i) => ({
        x: -150 + walk * (260 + i * 150), y: 1400 - i * 4, s: 0.55,
        o: as(o, { shirt: COL.white, sleeve: COL.white, pants: COL.navy, walk: walk < 1 ? t * 9 + i : 0, backpack: [COL.pink, COL.green, COL.red][i], jump: ring > 0 ? Math.abs(Math.sin((t - st.inter) * 9 + i)) * 60 * ring : 0 })
      }));
    },
    hit: (x, y) => near(x, y, 520, 650, 160),
    onInter: (fx) => fx.bell()
  });

  /* ======================= INGREDIENTE 4: la motera ======================= */
  const moto = ingredient({
    k: PG.moto, n: 4, potDelay: 3,
    bg(t, st) {
      const ctx = C.ctx;
      const pin = back(seg(t, 0.2, 1));
      if (pin > 0) {
        ctx.save(); ctx.translate(540, 700); ctx.scale(pin, pin); ctx.translate(-540, -700);
        P.photo(IMG.moto, 540, 700, 440, -0.05, { h: 560, focusY: 0.55, frame: COL.red });
        ctx.restore();
      }
      if (st.inter != null) {
        const s = back(seg(t - st.inter, 1.0, 1.5));
        if (s > 0) {
          ctx.save(); ctx.translate(690, 900); ctx.rotate(-0.2); ctx.scale(s, s);
          line(rect(-170, -46, 340, 86), COL.red, 7);
          text(PG.moto.sello, 0, 14, { size: 44, color: COL.red, font: C.FONT_TITLE });
          ctx.restore();
        }
      }
      shape(rect(-20, 1240, 1120, 140), COL.grey, null, 0, { alpha: 0.7 });
      for (let x = 0; x < 1100; x += 160) line([[x, 1310], [x + 80, 1310]], COL.yellow, 8);
    },
    cast(t, st) {
      let mx = 300, lean = 0, wob = 0;
      if (st.inter != null) {
        const d = t - st.inter;
        const k = clamp(d / 2.2);
        mx = 300 + ease(k) * 260;
        wob = Math.sin(d * 9) * 0.12 * (1 - k);
        lean = wob;
      }
      return [
        { x: mx, y: 1330, s: 0.5, draw: (x, y, s) => P.moto(x, y, s, t, { spin: t * 3, bob: true, lean, hair: DAYANA.hairColor, skin: DAYANA.skin, light: st.inter != null }) },
        { x: 760, y: 1300, s: 0.55, o: as(YADIR, { wave: st.inter != null, walk: 0 }) }
      ];
    },
    fg(t, st) {
      if (st.inter != null) {
        const d = t - st.inter;
        if (d < 2.4 && st.pot == null) {
          P.bubble(420 + ease(clamp(d / 2.2)) * 220, 1000, PG.moto.globos[0], 40);
          if (d > 1) P.bubble(800, 930, PG.moto.globos[1], 40);
        }
      }
    },
    hit: (x, y) => y > 1050 && y < 1400 && x < 700,
    onInter: (fx) => fx.brum()
  });

  /* ======================= INGREDIENTE 5: Danielito ======================= */
  const danielito = ingredient({
    k: PG.danielito, n: 5, potDelay: 3,
    bg(t, st) {
      sceneBase(t, { sky: COL.lightpink, sunX: 900, cloudX: 260 });
      // universidad al fondo
      shape(rect(560, 900, 300, 340), COL.cream, COL.darkbrown, 5);
      shape([[540, 900], [710, 800], [880, 900], [540, 900]], COL.blue, COL.navy, 5);
      for (let i = 0; i < 4; i++) line([[590 + i * 75, 960], [590 + i * 75, 1240]], COL.darkbrown, 6);
      text('U', 710, 880, { size: 54, color: COL.white, font: C.FONT_TITLE });
      const fly = seg(t, 0.4, 2.0);
      if (fly < 1) P.stork(lerp(-200, 420, ease(fly)), 520 + Math.sin(t * 3) * 20, t, true);
      else P.stork(420 + (t - 2) * 300, 520 - (t - 2) * 60, t, false);
    },
    cast(t, st) {
      const hasBaby = t > 2.0;
      return [
        { x: 230, y: 1300, s: 0.8, o: as(TIA, { armR: -0.25, armL: Math.PI - 1.2 }) },
        { x: 380, y: 1310, s: 0.78, draw: (x, y, s, k) => {
          P.person(x, y, s, as(DAYANA, { t, armL: Math.PI - 0.9, armR: 0.5, mouth: st.inter != null ? 'laugh' : null }));
          if (k > 0) return;
          P.books(x - 92 * s, y - 210 * s);
          if (hasBaby) {
            shape(ellipse(x + 88 * s, y - 220 * s, 46 * s, 36 * s), COL.lightpink, COL.pink, 4);
            shape(ellipse(x + 96 * s, y - 246 * s, 22 * s, 20 * s), DANI.skin, '#b07a4f', 3);
          }
          if (st.inter != null) {
            const d = t - st.inter, f = ease(seg(d, 0, 0.8));
            P.gradCap(x + 4 * s, lerp(300, y - 432 * s, f), -0.12, s * 0.85);
          }
        } }
      ];
    },
    fg(t, st) {
      if (st.inter != null) {
        const d = t - st.inter, s = back(seg(d, 0.6, 1.2));
        if (s > 0) {
          const ctx = C.ctx; ctx.save(); ctx.translate(540, 470); ctx.scale(s, s);
          shape(rect(-260, -70, 520, 110), COL.yellow, COL.orange, 6);
          text(PG.danielito.titulo2, 0, 20, { size: 80, color: COL.purple, font: C.FONT_TITLE });
          ctx.restore();
          P.star(220, 470, 30, COL.yellow); P.star(860, 470, 30, COL.yellow);
        }
      }
    },
    hit: (x, y) => x > 260 && x < 500 && y > 900 && y < 1320,
    onInter: (fx) => fx.tada()
  });

  /* ======================= INGREDIENTE 6: el rancho ======================= */
  const rancho = ingredient({
    k: PG.rancho, n: 6,
    bg(t, st) {
      sceneBase(t, { sunX: 160, cloudX: 860 });
      P.tree(80, 1240, 0.7);
      P.house(500, 1240, 380, 300, { color: '#c98b55', roof: COL.darkbrown, door: COL.darkbrown, chimney: true });
      // humo / corazones de la chimenea
      for (let i = 0; i < 4; i++) {
        const kk = (t * 0.4 + i / 4) % 1;
        if (st.inter != null) P.heart(790 + Math.sin(kk * 6) * 20, 760 - kk * 260, 2.2, COL.pink);
        else shape(ellipse(790 + Math.sin(kk * 6) * 20, 760 - kk * 260, 20 + kk * 20, 16 + kk * 14), COL.white, COL.grey, 3, { alpha: 1 - kk });
      }
      const sw = st.inter != null ? Math.sin((t - st.inter) * 8) * 0.2 * Math.max(0, 1 - (t - st.inter) / 2) : 0;
      P.signpost(690, 1080, PG.rancho.letrero, { h: 120, rot: sw, color: '#e0b07a', size: 44, font: C.FONT_TITLE });
      P.clothesline(140, 480, 860, t);
    },
    cast(t, st) {
      const j = (i) => st.inter != null ? Math.abs(Math.sin((t - st.inter) * 7 + i)) * 40 * Math.max(0, 1 - (t - st.inter) / 2) : 0;
      return [
        { x: 130, y: 1330, s: 0.72, o: as(TIA, { jump: j(0) }) },
        { x: 250, y: 1330, s: 0.66, o: as(TATI, { jump: j(1) }) },
        { x: 370, y: 1335, s: 0.66, o: as(DAYANA, { jump: j(2), armR: 0.6 }) },
        { x: 450, y: 1340, s: 0.3, o: as(DANI, { jump: j(3), wave: true }) },
        { x: 560, y: 1335, s: 0.66, o: as(YADIR, { jump: j(4), backpack: COL.orange, wave: true }) }
      ];
    },
    hit: (x, y) => near(x, y, 690, 960, 170),
    onInter: (fx) => fx.tada()
  });

  /* ======================= INGREDIENTE 7: Aslei ======================= */
  const aslei = ingredient({
    k: PG.aslei, n: 7, potDelay: 3.2,
    bg(t, st) {
      P.sky(t, { color: COL.cream, h: 1300 });
      shape(rect(-20, 1240, 1120, 260), '#c9a27a', null, 0, { alpha: 0.6 });
      // sofá
      shape(rect(120, 1000, 520, 120), COL.purple, P.shade(COL.purple), 5);
      shape(rect(100, 1100, 560, 90), COL.purple, P.shade(COL.purple), 5);
      // letrero
      const ctx = C.ctx; ctx.save(); ctx.translate(540, 470); ctx.rotate(-0.03);
      shape(rect(-330, -50, 660, 90), COL.white, COL.red, 5);
      text(PG.aslei.letrero, 0, 14, { size: 42, color: COL.red });
      ctx.restore();
    },
    cast(t, st) {
      const inter = st.inter != null, d = inter ? t - st.inter : 0;
      const tug = inter && d > 1.6 ? 0 : Math.sin(t * 7) * 20;
      const hugging = inter && d > 1.6;
      const list = [
        { x: 450, y: 1340, s: 0.72, o: as(YADIR, { armL: Math.PI + 0.9, armR: -0.9, sweat: !hugging, mouth: 'o' }) },
        { x: hugging ? 460 : 400 + tug, y: 1400, s: 0.3, o: as(DANI, { armR: hugging ? 0.2 : -0.1, mouth: hugging ? null : 'flat', flip: false }) },
        { x: hugging ? 540 : 600 + tug, y: 1400, s: 0.3, o: as(ASLEI, { armL: hugging ? Math.PI - 0.2 : Math.PI + 0.1, mouth: hugging ? null : 'flat' }) }
      ];
      if (inter) {
        const a = back(seg(d, 0.3, 0.9));
        if (a > 0) {
          list.unshift({ x: 150, y: 1320, s: 0.72 * a, o: as(TIA, { mouth: 'laugh', armR: -0.6 }) });
          list.push({ x: 760, y: 1320, s: 0.72 * a, o: as(DAYANA, { mouth: 'laugh', armL: Math.PI + 0.6, flip: true }) });
        }
      }
      return list;
    },
    fg(t, st) {
      const inter = st.inter != null, d = inter ? t - st.inter : 0;
      if (st.pot != null && t > st.pot + 0.6) { /* ya todos están en la olla */ }
      else if (!inter || d <= 1.6) P.teddy(500 + Math.sin(t * 7) * 20, 1280, Math.sin(t * 7) * 0.3);
      else for (let i = 0; i < 3; i++) P.heart(500 + (i - 1) * 50, 1180 - ((d + i * 0.3) % 1) * 120, 1.8, COL.red);
      if (inter && st.pot == null) {
        P.bubbleLines(450, 700, PG.aslei.quejas, 40, { tail: 450 });
        if (d > 0.8) { P.bubble(200, 880, PG.aslei.risa, 40); P.bubble(780, 880, PG.aslei.risa, 40); }
      }
    },
    hit: (x, y) => y > 1150 && y < 1420 && x > 300 && x < 700,
    onInter: (fx) => fx.boing()
  });

  /* ======================= INGREDIENTE 8: casa nueva ======================= */
  const casa = ingredient({
    k: PG.casa, n: 8,
    bg(t, st) {
      sceneBase(t, { sunX: 160 });
      P.house(500, 1240, 380, 320, { color: COL.sky, roof: COL.purple, chimney: true });
      const found = st.inter != null ? ease(seg(t - st.inter, 0, 0.5)) : 0;
      if (t > 1) {
        line([[420, 1240], [420, 960]], COL.darkbrown, 10);
        const ctx = C.ctx; ctx.save(); ctx.translate(420, 900); ctx.scale(1, 1 - Math.sin(found * Math.PI) * 0.9);
        shape(rect(-200, -70, 400, 130), found > 0.5 ? COL.yellow : COL.white, COL.darkbrown, 6);
        text(found > 0.5 ? '¡NUESTRA CASA!' : 'SE ARRIENDA', 0, 18, { size: found > 0.5 ? 40 : 54, color: found > 0.5 ? COL.red : COL.black, font: C.FONT_TITLE });
        ctx.restore();
      }
      if (found > 0) for (let k = 0; k < 6; k++) {
        const ht = (t - st.inter) * 0.8 + k / 6;
        P.heart(400 + k * 70 + Math.sin(ht * 6) * 20, 1100 - (ht % 1) * 500, 2.2, [COL.red, COL.pink][k % 2]);
      }
    },
    cast(t, st) {
      const walk = ease(seg(t, 0.4, 2.6));
      const found = st.inter != null;
      return [TATI, DAYANA, YADIR].map((o, i) => ({
        x: -200 + walk * (300 + i * 110), y: 1400 - (i % 2) * 10, s: 0.6,
        o: as(o, { walk: walk < 1 ? t * 9 + i : 0, jump: found ? Math.abs(Math.sin((t - st.inter) * 7 + i)) * 50 : 0, wave: found && i === 1 })
      }));
    },
    fg(t, st) {
      if (st.inter == null && t > 2.6) {
        const lx = 300 + Math.sin(t * 2) * 30;
        line([[lx, 1060], [lx + 50, 1120]], COL.darkbrown, 10);
        line(ellipse(lx - 20, 1035, 36, 36), COL.grey, 7);
      }
    },
    hit: (x, y) => near(x, y, 420, 900, 210),
    onInter: (fx) => fx.tada()
  });

  /* ======================= INGREDIENTE 9: Villagarzón → Mocoa ======================= */
  const cerquita = ingredient({
    k: PG.cerquita, n: 9, potDelay: 3.4,
    bg(t, st) {
      const raining = st.inter != null;
      P.sky(t, { color: raining ? '#b8c4d6' : COL.sky, h: 1300 });
      if (!raining) P.sun(540, 420, 50, t);
      P.ground(1240, COL.green, ease(seg(t, 0, 0.5)));
      // carretera cortita
      shape([[-20, 1290], [1100, 1270], [1100, 1350], [-20, 1370]], COL.grey, null, 0, { alpha: 0.7 });
      P.signpost(110, 1250, PG.cerquita.pueblos[0], { h: 200, size: 38, color: COL.green, textColor: COL.white });
      P.house(700, 1240, 300, 260, { color: COL.yellow, roof: COL.red });
      P.signpost(620, 1250, PG.cerquita.pueblos[1], { h: 330, size: 38, color: COL.green, textColor: COL.white });
      P.cloud(360, 560, 1.0);
      if (raining) { P.cloud(600, 520, 0.9); P.rain(t, 200, 900, 620, 1240, 1); }
      if (raining && t - st.inter > 1.6) P.mattress(850, 1235);
    },
    cast(t, st) {
      const walk = ease(seg(t, 0.4, 2.6));
      const d = st.inter != null ? t - st.inter : 0;
      return [
        { x: lerp(-100, 470, walk), y: 1370, s: 0.58, o: as(YADIR, { walk: walk < 1 ? t * 9 : 0, backpack: COL.orange, armR: st.inter != null ? -1.6 : undefined }) },
        { x: 640, y: 1250, s: 0.58 * back(seg(d, 0.8, 1.3)), o: as(DAYANA, { wave: st.inter != null, mouth: 'laugh', flip: true }) }
      ].filter(c => c.s > 0.01);
    },
    fg(t, st) {
      if (st.inter != null && st.pot == null) {
        const d = t - st.inter;
        if (d > 0.4) P.bubble(400, 860, PG.cerquita.pregunta, 40);
        if (d > 1.2) P.bubble(760, 760, PG.cerquita.respuesta, 52);
      }
    },
    hit: (x, y) => y > 400 && y < 760,
    onInter: (fx) => fx.blow()
  });

  /* ======================= REVOLVER ======================= */
  const revolver = {
    hold: 4,
    dur: () => 1.2 + textTime(PG.revolver.texto),
    ready: (st) => (st.stir || 0) >= 4,
    draw(t, st, live) {
      const k = PG.revolver, ctx = C.ctx;
      P.sky(t, { color: COL.cream, h: 1300 });
      shape(rect(-20, 1240, 1120, 260), '#d9b38c', null, 0, { alpha: 0.6 });
      const stir = st.stir || 0, last = st.lastStir || -9;
      const spoon = stir > 0 ? (t - last < 0.6 ? (t - last) * 12 : 0) + stir * 2 : null;
      const out = stir >= 4 ? t - st.doneAt : -1;
      ctx.save(); ctx.translate(540, 1300); ctx.scale(1, 1); ctx.translate(-540, -1300);
      P.pot(540, 1330, 2.1, t, { spoon, liquid: stir >= 4 ? COL.yellow : COL.pink, label: stir < 4 ? stir + ' / 4' : '♥' });
      ctx.restore();
      // brillos
      if (out >= 0) {
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 + t;
          line([[540 + Math.cos(a) * 280, 1000 + Math.sin(a) * 120], [540 + Math.cos(a) * 330, 1000 + Math.sin(a) * 150]], COL.yellow, 7);
        }
        const a1 = back(seg(out, 0.2, 0.9)), a2 = back(seg(out, 0.6, 1.3));
        if (a1 > 0) {
          ctx.save(); ctx.translate(lerp(540, 400, a1), lerp(1100, 560, a1)); ctx.scale(a1, a1);
          P.photo(IMG.juntos1, 0, 0, 560, -0.07, { h: 270, polaroid: true, caption: k.fotos[0], frame: COL.purple, focusY: 0.3 });
          ctx.restore();
        }
        if (a2 > 0) {
          ctx.save(); ctx.translate(lerp(540, 760, a2), lerp(1100, 700, a2)); ctx.scale(a2, a2);
          P.photo(IMG.juntos2, 0, 0, 300, 0.06, { h: 340, polaroid: true, caption: k.fotos[1], frame: COL.blue, focusY: 0.35 });
          ctx.restore();
        }
      }
      header(k.titulo, t);
      hint(k.pista, t, live, stir < 4);
      narrate(k.texto, t, 1.0);
    },
    stirOnce(t, st, fx) {
      if ((st.stir || 0) >= 4) return;
      st.stir = (st.stir || 0) + 1; st.lastStir = t; fx.pop();
      if (st.stir >= 4) { st.doneAt = t; fx.tada(); }
    },
    tap(x, y, t, st, fx) {
      if (y > 850 && y < 1450) { this.stirOnce(t, st, fx); return true; }
      return false;
    },
    auto(t, st, fx) {
      const d = this.dur();
      if (t > d - 1.6 + (st.stir || 0) * 0.45 && (st.stir || 0) < 4) this.stirOnce(t, st, fx);
    }
  };

  /* ======================= PASTEL ======================= */
  const cake = {
    hold: 5,
    dur: () => 1.4 + textTime(PG.pastel.texto),
    ready: (st) => st.out && st.out[0] && st.out[1],
    draw(t, st, live) {
      const ch = PG.pastel;
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
      P.balloon(140, 560, COL.red, t, 0.8);
      P.balloon(950, 600, COL.yellow, t + 2, 0.8);
      if (st.done != null) {
        const k = t - st.done;
        st.conf = st.conf || P.makeConfetti(90, t);
        P.confetti(st.conf, t);
        const s = back(seg(k, 0.2, 0.9));
        if (s > 0) {
          ctx.save(); ctx.translate(540, 330); ctx.scale(s, s); ctx.rotate(Math.sin(t * 3) * 0.03);
          text('¡Feliz', 0, -70, { size: 120, color: COL.pink, outline: COL.darkred, outlineW: 16, font: C.FONT_TITLE });
          text('cumpleaños,', 0, 60, { size: 110, color: COL.yellow, outline: COL.darkred, outlineW: 16, font: C.FONT_TITLE });
          text((K.apodo || K.nombre) + '!', 0, 210, { size: 150, color: COL.blue, outline: COL.navy, outlineW: 16, font: C.FONT_TITLE });
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
      paragraph(K.carta.firma, 960, 360 + h + 70, 760, { size: 50, lh: 64, align: 'right', color: COL.purple, count: firmaN });
      if (firmaN > K.carta.firma.length) {
        P.heart(880, 1760, 3.2 + Math.sin(t * 5) * 0.3, COL.red);
        P.star(260, 1740, 30, COL.yellow);
      }
    }
  };

  window.Scenes = { list: [portada, origen, tia, tati, cole, moto, danielito, rancho, aslei, casa, cerquita, revolver, cake, carta], loadImages, IMG };
})();
