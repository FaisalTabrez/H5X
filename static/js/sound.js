window.h5xSound = (() => {
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // c major pentatonic, one note per gold word
  const btn = document.querySelector('#snd');
  let ac = null, on = false;
  try { on = localStorage.getItem('h5x-sound') === 'on'; } catch (e) {}
  const paint = () => { btn.textContent = on ? 'sound on' : 'sound off'; btn.setAttribute('aria-pressed', String(on)); btn.classList.toggle('on', on); };
  const audio = () => {
    if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); }
    if (ac.state === 'suspended') ac.resume();
    return ac;
  };
  function tone(freq, { dur = 0.16, type = 'triangle', vol = 0.05, at = 0, glide = 0 } = {}) {
    if (!on) return;
    const a = audio();
    if (!a) return;
    const t = a.currentTime + at, o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }
  btn.addEventListener('click', () => {
    on = !on;
    try { localStorage.setItem('h5x-sound', on ? 'on' : 'off'); } catch (e) {}
    paint();
    if (on) NOTES.forEach((f, i) => tone(f, { at: i * 0.055, dur: 0.22, vol: 0.035 }));
  });
  // browsers keep audio asleep until the first gesture
  addEventListener('pointerdown', () => on && audio(), { once: true });
  paint();
  function noise(dur, { vol = 0.06, freq = 1800, q = 0.8, at = 0 } = {}) {
    if (!on) return;
    const a = audio();
    if (!a) return;
    const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3;
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q; g.gain.value = vol;
    src.connect(f).connect(g).connect(a.destination);
    src.start(a.currentTime + at);
  }
  return {
    note: (i) => tone(NOTES[i % NOTES.length], { dur: 0.22, vol: 0.045 }),
    theme: (to) => { tone(659.25, { dur: 0.09, type: 'sine', vol: 0.04 }); tone(to === 'light' ? 987.77 : 440, { dur: 0.14, type: 'sine', vol: 0.04, at: 0.07 }); },
    tick: (speed) => tone(1300 + Math.min(1, speed * 6) * 900, { dur: 0.025, type: 'square', vol: 0.012 }),
    thump: () => tone(190, { dur: 0.12, type: 'sine', vol: 0.06, glide: 120 }),
    shatter: () => { noise(0.28, { vol: 0.11, freq: 2400 }); tone(150, { dur: 0.22, type: 'sine', vol: 0.07, glide: 60 }); },
    dock: (k) => tone(NOTES[Math.min(5, Math.floor(k * 6))] * 2, { dur: 0.045, type: 'triangle', vol: 0.016 }),
    lock: () => { tone(523.25, { dur: 0.16, type: 'sine', vol: 0.04 }); tone(783.99, { dur: 0.26, type: 'sine', vol: 0.035, at: 0.06 }); },
  };
})();
