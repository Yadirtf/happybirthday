/* ==========================================================
   audio.js — cajita musical y efectos, todo generado (sin archivos)
   La salida también va a un "stream" para poder grabarla en el video.
   ========================================================== */
(function () {
  let ac = null, master = null, musicGain = null, dest = null;
  let musicOn = true, musicTimer = null, nextNote = 0, noteIdx = 0, loopCount = 0;

  // Cumpleaños feliz (dominio público) en notas MIDI + duración en tiempos
  const M = [
    [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
    [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
    [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
    [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3]
  ];
  const BEAT = 0.5;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.8;
    musicGain = ac.createGain(); musicGain.gain.value = 0.5;
    musicGain.connect(master);
    master.connect(ac.destination);
    if (ac.createMediaStreamDestination) { dest = ac.createMediaStreamDestination(); master.connect(dest); }
  }

  function bell(freq, at, dur = 1.4, vol = 0.18, out = musicGain) {
    const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain();
    o1.type = 'sine'; o2.type = 'triangle';
    o1.frequency.value = freq; o2.frequency.value = freq * 2;
    const g2 = ac.createGain(); g2.gain.value = 0.25;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(out);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o1.start(at); o2.start(at); o1.stop(at + dur + 0.05); o2.stop(at + dur + 0.05);
  }

  function schedule() {
    if (!ac) return;
    while (nextNote < ac.currentTime + 0.3) {
      const [m, d] = M[noteIdx];
      const oct = loopCount % 2 ? 12 : 0;
      bell(hz(m + 12 + (oct ? -12 : 0)), nextNote, Math.max(0.8, d * BEAT * 1.6));
      // acompañamiento suave en la segunda vuelta
      if (oct && d >= 1) bell(hz(m - 12), nextNote, d * BEAT * 1.8, 0.07);
      nextNote += d * BEAT;
      noteIdx++;
      if (noteIdx >= M.length) { noteIdx = 0; loopCount++; nextNote += BEAT * 2; }
    }
  }
  function startMusic(restart) {
    init(); if (!ac) return;
    if (restart || !musicTimer) { noteIdx = 0; loopCount = 0; nextNote = ac.currentTime + 0.15; }
    if (!musicTimer) musicTimer = setInterval(schedule, 80);
    musicGain.gain.setTargetAtTime(musicOn ? 0.5 : 0, ac.currentTime, 0.05);
  }
  function setMusic(on) {
    musicOn = on;
    if (ac) musicGain.gain.setTargetAtTime(on ? 0.5 : 0, ac.currentTime, 0.1);
  }

  function noise(dur) {
    const b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = b; return s;
  }

  const fx = {
    pop() {
      init(); if (!ac) return;
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(220, t + 0.12);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
    },
    boing() {
      init(); if (!ac) return;
      const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(660, t + 0.18); o.frequency.exponentialRampToValueAtTime(330, t + 0.35);
      g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.45);
    },
    bell() {
      init(); if (!ac) return;
      const t = ac.currentTime;
      for (let i = 0; i < 10; i++) bell(i % 2 ? 1568 : 1760, t + i * 0.07, 0.4, 0.12, master);
    },
    tada() {
      init(); if (!ac) return;
      const t = ac.currentTime;
      [72, 76, 79, 84].forEach((m, i) => bell(hz(m), t + i * 0.09, 1.2, 0.18, master));
    },
    brum() {
      init(); if (!ac) return;
      const t = ac.currentTime, o = ac.createOscillator(), lfo = ac.createOscillator(), lg = ac.createGain(), g = ac.createGain(), f = ac.createBiquadFilter();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(55, t); o.frequency.linearRampToValueAtTime(140, t + 0.9); o.frequency.linearRampToValueAtTime(90, t + 1.8);
      lfo.frequency.value = 28; lg.gain.value = 18; lfo.connect(lg); lg.connect(o.frequency);
      f.type = 'lowpass'; f.frequency.value = 700;
      g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.28, t + 0.08); g.gain.setValueAtTime(0.28, t + 1.2); g.gain.exponentialRampToValueAtTime(0.001, t + 2);
      o.connect(f); f.connect(g); g.connect(master);
      o.start(t); lfo.start(t); o.stop(t + 2.1); lfo.stop(t + 2.1);
    },
    blow() {
      init(); if (!ac) return;
      const t = ac.currentTime, n = noise(0.7), f = ac.createBiquadFilter(), g = ac.createGain();
      f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6;
      g.gain.setValueAtTime(0.001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.08); g.gain.exponentialRampToValueAtTime(0.001, t + 0.65);
      n.connect(f); f.connect(g); g.connect(master); n.start(t);
    }
  };

  window.Sound = {
    init, startMusic, setMusic, fx,
    get musicOn() { return musicOn; },
    get stream() { return dest ? dest.stream : null; },
    get ctx() { return ac; }
  };
})();
