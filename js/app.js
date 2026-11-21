/* ==========================================================
   app.js — controla el libro, la navegación y la grabación del video
   ========================================================== */
(function () {
  const C = Crayon, S = Scenes.list, W = C.W, H = C.H;
  const FPS = 12; // "a dos", como la animación hecha a mano

  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);
  let paper = null, scale = 1;

  /* --------- un "reproductor" de escenas reutilizable (pantalla y video) --------- */
  function Player(cnv, opts) {
    const g = cnv.getContext('2d');
    const self = {
      cnv, g, idx: 0, t0: 0, st: {}, frame: 0, trans: null, live: opts.live,
      paper: null, scale: 1,
      resize() {
        self.scale = cnv.width / W;
        self.paper = C.makePaper(cnv.width, cnv.height);
        self.snap = document.createElement('canvas');
        self.snap.width = cnv.width; self.snap.height = cnv.height;
      },
      time(now) { return (now - self.t0) / 1000; },
      go(i, now) {
        if (i < 0 || i >= S.length) return;
        self.snap.getContext('2d').drawImage(cnv, 0, 0);
        self.trans = { start: now, dir: i > self.idx ? 1 : -1 };
        self.idx = i; self.t0 = now; self.st = {};
      },
      render(now) {
        self.frame++;
        C.begin(g, self.frame % 3);
        g.setTransform(1, 0, 0, 1, 0, 0);
        g.drawImage(self.paper, 0, 0);
        g.setTransform(self.scale, 0, 0, self.scale, 0, 0);
        const sc = S[self.idx];
        sc.draw(self.time(now), self.st, self.live);
        // vuelta de página
        if (self.trans) {
          const k = (now - self.trans.start) / 650;
          if (k >= 1) self.trans = null;
          else {
            const e = C.ease(k), d = self.trans.dir;
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.save();
            g.translate(cnv.width / 2 - d * e * cnv.width * 1.1, cnv.height / 2);
            g.rotate(-d * e * 0.25);
            g.shadowColor = 'rgba(60,40,20,0.35)'; g.shadowBlur = 40 * self.scale;
            g.drawImage(self.snap, -cnv.width / 2, -cnv.height / 2);
            g.restore();
          }
        }
      }
    };
    self.resize();
    return self;
  }

  /* ------------------------- pantalla ------------------------- */
  const player = Player(canvas, { live: true });

  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight - 0;
    let h = vh, w = h * W / H;
    if (w > vw) { w = vw; h = w * H / W; }
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.round(w * dpr), ph = Math.round(h * dpr);
    if (pw !== canvas.width) { canvas.width = pw; canvas.height = ph; player.resize(); }
    const ui = $('ui'); ui.style.width = w + 'px';
  }
  window.addEventListener('resize', fit);

  const fx = Object.assign({}, Sound.fx, {
    next: () => goTo(player.idx + 1),
    music: () => Sound.startMusic()
  });

  function goTo(i) {
    if (i < 0 || i >= S.length) return;
    player.go(i, performance.now());
    updateUI();
  }
  function updateUI() {
    $('prev').disabled = player.idx === 0;
    $('next').style.visibility = player.idx === S.length - 1 ? 'hidden' : 'visible';
    $('end').classList.toggle('show', player.idx === S.length - 1);
        $('dots').innerHTML = S.map((_, i) => `<i class="${i === player.idx ? 'on' : ''}"></i>`).join('');
  }

  let lastFrame = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    if (recording) return;
    if (now - lastFrame < 1000 / FPS - 2) return;
    lastFrame = now;
    player.render(now);
    const sc = S[player.idx], t = player.time(now);
    const done = t > sc.dur(player.st) && (!sc.ready || sc.ready(player.st));
    $('next').classList.toggle('pulse', done);
    $('mic').classList.toggle('show', !!sc.blowAll && !(sc.ready && sc.ready(player.st)));
  }

  function toLogical(e) {
    const r = canvas.getBoundingClientRect();
    return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height];
  }
  canvas.addEventListener('pointerdown', (e) => {
    Sound.init();
    const [x, y] = toLogical(e), now = performance.now();
    const sc = S[player.idx], t = player.time(now);
    if (sc.tap && sc.tap(x, y, t, player.st, fx)) return;
    // si la página aún se está dibujando, la completamos
    const d = sc.dur(player.st);
    if (t < d) player.t0 -= (d - t) * 1000;
  });
  $('next').onclick = () => { Sound.init(); fx.music(); Sound.fx.pop(); goTo(player.idx + 1); };
  $('prev').onclick = () => { Sound.fx.pop(); goTo(player.idx - 1); };
  $('again').onclick = () => goTo(0);
  window.addEventListener('keydown', (e) => {
    if (recording) return;
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); $('next').click(); }
    if (e.key === 'ArrowLeft') $('prev').click();
  });
  $('music').onclick = () => {
    Sound.init();
    Sound.setMusic(!Sound.musicOn);
    if (Sound.musicOn) Sound.startMusic();
    $('music').textContent = Sound.musicOn ? '♫' : '♪̸';
    $('music').classList.toggle('off', !Sound.musicOn);
  };

  /* -------------- soplar de verdad con el micrófono -------------- */
  $('mic').onclick = async () => {
    try {
      Sound.init();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const a = Sound.ctx, src = a.createMediaStreamSource(stream), an = a.createAnalyser();
      an.fftSize = 512; src.connect(an);
      const buf = new Float32Array(an.fftSize);
      let loud = 0;
      $('mic').textContent = '🎤 ¡sopla fuerte!';
      const iv = setInterval(() => {
        an.getFloatTimeDomainData(buf);
        let s = 0; for (const v of buf) s += v * v;
        const rms = Math.sqrt(s / buf.length);
        loud = rms > 0.12 ? loud + 1 : Math.max(0, loud - 1);
        const sc = S[player.idx];
        if (loud > 4 && sc.blowAll) {
          sc.blowAll(player.time(performance.now()), player.st, fx);
          stop();
        }
        if (!sc.blowAll) stop();
      }, 50);
      function stop() { clearInterval(iv); stream.getTracks().forEach(t => t.stop()); $('mic').textContent = '🎤 soplar de verdad'; }
    } catch (err) {
      $('mic').textContent = 'sin micrófono, usa los dedos';
    }
  };

  /* --------------------- grabar y descargar el video --------------------- */
  let recording = false, cancelRec = false;
  function pickMime() {
    const opts = ['video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    for (const m of opts) if (window.MediaRecorder && MediaRecorder.isTypeSupported(m)) return m;
    return '';
  }
  async function recordVideo() {
    if (recording) return;
    const modal = $('rec'), bar = $('recbar'), msg = $('recmsg'), dl = $('recdl');
    dl.style.display = 'none';
    modal.classList.add('show');
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      msg.textContent = 'Este navegador no puede grabar video. Prueba en Chrome, Edge o Firefox desde un computador.';
      return;
    }
    recording = true; cancelRec = false;
    msg.textContent = 'Grabando la película… deja esta pestaña abierta 🎬';
    const rc = document.createElement('canvas');
    rc.width = 720; rc.height = 1280;
    const prev = $('recprev');
    prev.innerHTML = ''; prev.appendChild(rc);
    const rp = Player(rc, { live: false });

    Sound.init();
    Sound.startMusic(true);
    const tracks = rc.captureStream(24).getVideoTracks();
    if (Sound.stream) tracks.push(...Sound.stream.getAudioTracks());
    const mime = pickMime();
    let rec;
    try { rec = new MediaRecorder(new MediaStream(tracks), mime ? { mimeType: mime, videoBitsPerSecond: 5e6 } : {}); }
    catch (e) { rec = new MediaRecorder(new MediaStream(tracks)); }
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };

    // duración total
    const plan = S.map(s => s.dur({}) + (s.hold || 2.5));
    const total = plan.reduce((a, b) => a + b, 0);
    const recFx = Object.assign({}, Sound.fx, { next() {}, music() {} });

    rec.start(500);
    const t0 = performance.now();
    rp.idx = 0; rp.t0 = t0; rp.st = {};
    let segEnd = t0 + plan[0] * 1000;

    await new Promise((resolve) => {
      const iv = setInterval(() => {
        const now = performance.now();
        if (cancelRec) { clearInterval(iv); resolve(); return; }
        if (now >= segEnd) {
          if (rp.idx >= S.length - 1) { clearInterval(iv); resolve(); return; }
          rp.go(rp.idx + 1, now);
          segEnd = now + plan[rp.idx] * 1000;
        }
        const sc = S[rp.idx];
        if (sc.auto) sc.auto(rp.time(now), rp.st, recFx);
        rp.render(now);
        bar.style.width = Math.min(100, (now - t0) / 10 / total) + '%';
      }, 1000 / FPS);
    });

    await new Promise((res) => { rec.onstop = res; rec.stop(); });
    recording = false;
    if (cancelRec) { modal.classList.remove('show'); return; }
    const type = (rec.mimeType || mime || 'video/webm').split(';')[0];
    const blob = new Blob(chunks, { type });
    const ext = type.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(blob);
    dl.href = url; dl.download = `feliz-cumple-${window.CONTENT.nombre.toLowerCase()}.${ext}`;
    dl.style.display = 'inline-block';
    msg.textContent = '¡Listo! Tu video está listo para descargar.';
    bar.style.width = '100%';
    dl.click();
  }
  $('download').onclick = recordVideo;
  $('download2').onclick = recordVideo;
  $('recclose').onclick = () => { cancelRec = true; $('rec').classList.remove('show'); };

  /* ------------------------- arranque ------------------------- */
  async function boot() {
    try {
      await Promise.all([
        document.fonts.load('60px "Gochi Hand"'),
        document.fonts.load('60px "Cabin Sketch"'),
        document.fonts.load('bold 60px "Cabin Sketch"')
      ]);
    } catch (e) { /* sin internet: letra de respaldo */ }
    await Scenes.loadImages();
    fit();
    player.t0 = performance.now();
    updateUI();
    $('loading').remove();
    requestAnimationFrame(loop);
  }
  boot();
})();
