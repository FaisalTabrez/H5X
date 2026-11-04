/* Adapted from H7-Tex/TX, commit 8204b29. H5X is extruded into 3D and drawn as ASCII or coloured pixels.
   it sways and a ripple runs through it. the cursor is its light, and the blocks
   under it part and rise to meet it. drag spins it. a tap breaks it into its blocks, and they find their own way home. */
(function () {
  const box = document.querySelector('.art'), canvas = document.querySelector('#art');
  if (!box || !canvas) return;
  const ctx = canvas.getContext('2d');
  const sound = window.h5xSound;
  const root = document.documentElement;
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const current = () => root.dataset.theme || (mq.matches ? 'dark' : 'light');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const styles = [...document.querySelectorAll('[data-mark-style]')];
  let markStyle = new URLSearchParams(location.search).get('mark');
  if(markStyle==='pixels')markStyle='logo';
  if (!['ascii','logo'].includes(markStyle)) {
    try { markStyle = localStorage.getItem('h5x-mark-style'); } catch {}
  }
  if (!['ascii','logo'].includes(markStyle)) markStyle = 'logo';
  function paintStyle() {
    styles.forEach(button => button.setAttribute('aria-pressed',String(button.dataset.markStyle===markStyle)));
    box.dataset.style = markStyle;
    box.dataset.logo = 'official';
    box.setAttribute('aria-label',markStyle==='logo'?'The official H5X logo in animated pixels, preserving the orange 5':'The official brushstroke H5X logo drawn in animated ASCII characters');
  }
  paintStyle();
  const GLYPH = window.H5XLogo.rows;
  const GW = GLYPH[0].length, GH = GLYPH.length, UNIT = GW/18;
  const FACE = '+*#%@', SIDE = '.,-~:;=!*#';
  const DEPTH = GW*.035, S = 1, OVER = 0.14, TAU = Math.PI * 2;
  const on = (x, y) => y >= 0 && y < GH && x >= 0 && x < GW && GLYPH[y][x] !== '0';
  const IDX = GLYPH.map(() => []);
  let count = 0;
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (on(x, y)) IDX[y][x] = ++count;
  const at = (x, y) => (on(x, y) ? IDX[y][x] : 0);
  // one entry per block: home, offset p, velocity v, tilt r, spin w, and surface points [lx, ly, lz, nx, ny, nz, front, neighbour]
  // a side that touches a neighbour (neighbour = its index + 1) only shows once one of the two has moved
  const BLOCKS = [];
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
    if (!on(x, y)) continue;
    const pts = [];
    const face = (n, f, front, nb) => { for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) pts.push([...f((i + 0.5) / S - 0.5, (j + 0.5) / S - 0.5), ...n, front, nb]); };
    face([0, 0, 1], (a, b) => [a, b, DEPTH / 2], 1, 0);
    face([0, 0, -1], (a, b) => [a, b, -DEPTH / 2], 1, 0);
    face([-1, 0, 0], (a, b) => [-0.5, a, b * DEPTH], 0, at(x - 1, y));
    face([1, 0, 0], (a, b) => [0.5, a, b * DEPTH], 0, at(x + 1, y));
    face([0, 1, 0], (a, b) => [a, 0.5, b * DEPTH], 0, at(x, y - 1));
    face([0, -1, 0], (a, b) => [a, -0.5, b * DEPTH], 0, at(x, y + 1));
    BLOCKS.push({ hx: x - (GW - 1) / 2, hy: (GH-1)/2 - y, tone:GLYPH[y][x], p: [0, 0, 0], v: [0, 0, 0], r: [0, 0, 0], w: [0, 0, 0], hold: 0, show: -1, away: false, rest: true, sx: 0, sy: 0, hsx: 0, hsy: 0, pts });
  }

  let W, H, BW, BH, cw, ch, cols, rows, zb, raf = 0, visible = true, last = 0, t = 2.2, clock = 0;
  let turn = 0, turnVel = 0, lean = [0, 0], aim = [0, 0], light = [-0.4, 0.45], cursor = null, press = null, userSpin = false, tickAt = 0;
  let view = [1, 0, 1, 0], rings = [], nextPop = 12, pending = 0, total = 0, lastDock = 0;
  function size() {
    const dpr = Math.min(2, devicePixelRatio || 1), r = box.getBoundingClientRect();
    BW = r.width; BH = r.height; W = BW * (1 + 2 * OVER); H = BH * (1 + 2 * OVER);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const fs = Math.max(7.5, Math.min(11, BW / 52));
    ctx.font = `${fs}px Fragment, ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    if (markStyle!=='ascii') cw = ch = Math.max(2.5,Math.min(5,Math.round(BW/112)));
    else { cw = ctx.measureText('M').width; ch = fs * 1.2; }
    cols = Math.floor(W / cw); rows = Math.floor(H / ch);
    zb = new Float32Array(cols * rows);
  }

  // view space (x right, y up, z toward the viewer) back into the model's own space
  const toModel = (x, y, z) => { const [ca, sa, cb, sb] = view, Y = y * cb + z * sb, Z = -y * sb + z * cb; return [x * ca - Z * sa, Y, x * sa + Z * ca]; };

  // a tap: every block near it is thrown outward in a ring around the tap, toward or away from the viewer, tumbling
  function shatter(px, py) {
    if (still.matches || window.h5xMotionPaused) return;
    const R = Math.max(BW, BH) * 0.7;
    pending = 0;
    for (const b of BLOCKS) {
      const dx = b.sx - px, dy = b.sy - py, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / R);
      if (f > 0) {
        const out = (5 + 9 * f) * (0.75 + Math.random() * 0.5)*UNIT, deep = (Math.random() * 1.7 - 0.45) * 13 * f*UNIT;
        const m = toModel((dx / d) * out, (-dy / d) * out, deep);
        for (let i = 0; i < 3; i++) { b.v[i] += m[i]; b.w[i] += (Math.random() - 0.5) * 16 * f; }
        b.hold = clock + 0.3 + (d / R) * 0.35 + Math.random() * 0.15;
        b.away = true;
      }
      if (b.away) pending++;
    }
    total = pending;
    rings.push({ x: px, y: py, t: clock });
    sound.shatter();
    kick();
  }

  // the first time it's drawn, the blocks come in from in front of the screen and land left to right
  function arrive() {
    pending = BLOCKS.length; total = 0;
    for (const b of BLOCKS) {
      b.p = [(Math.random() - 0.5) * 12*UNIT, (Math.random() - 0.5) * 8*UNIT, (7 + Math.random() * 5)*UNIT];
      b.r = [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6];
      b.hold = b.show = 0.1 + ((b.hx + (GW - 1) / 2) / (GW - 1)) * 0.55 + Math.random() * 0.12;
      b.away = true; b.rest = false;
    }
  }

  function assemble() {
    pending=total=0;rings=[];turn=turnVel=0;lean=[0,0];aim=[0,0];cursor=null;press=null;
    for(const b of BLOCKS){b.p=[0,0,0];b.v=[0,0,0];b.r=[0,0,0];b.w=[0,0,0];b.hold=0;b.show=-1;b.away=false;b.rest=true;}
  }

  const point = (e) => { const r = canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  box.addEventListener('pointermove', (e) => {
    const [x, y] = point(e);
    aim = [(x - W / 2) / BW, (y - H / 2) / BH];
    cursor = e.pointerType === 'mouse' ? [x, y] : null;
    if (press) {
      if (!press.moved && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) { press.moved = true; userSpin = true; tickAt = turn; sound.thump(); }
      if (press.moved) turnVel += (e.clientX - press.last) * 0.0022;
      press.last = e.clientX;
    }
    kick();
  });
  box.addEventListener('pointerleave', () => { aim = [0, 0]; cursor = null; kick(); });
  box.addEventListener('pointerdown', (e) => { press = { x: e.clientX, y: e.clientY, last: e.clientX, moved: false }; box.setPointerCapture(e.pointerId); kick(); });
  box.addEventListener('pointerup', (e) => { if (press && !press.moved) shatter(...point(e)); press = null; });
  box.addEventListener('pointercancel', () => (press = null));

  function step(dt, moving) {
    const [ca, sa, cb, sb] = view, toward = [-cb * sa, sb, cb * ca]; // toward the viewer, in model space
    const reach = BW * 0.2;
    let busy = false;
    for (const b of BLOCKS) {
      // the cursor parts the blocks around it, and the nearest rise toward the viewer
      let lift = 0, part = [0, 0, 0];
      if (cursor && moving && !press) {
        const dx = b.hsx - cursor[0], dy = b.hsy - cursor[1], d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / reach);
        lift = f * f * 1.2*UNIT;
        if (f) part = toModel((dx / d) * f * 1.1*UNIT, (-dy / d) * f * 1.1*UNIT, 0);
      }
      if (clock < b.hold) {
        // thrown: drift, slowing, still tumbling
        const k = Math.exp(-2.4 * dt), kw = Math.exp(-1.1 * dt);
        for (let i = 0; i < 3; i++) { b.v[i] *= k; b.w[i] *= kw; }
      } else {
        // home: a spring with a little overshoot, and each tumble unwinds to the nearest whole turn
        for (let i = 0; i < 3; i++) {
          b.v[i] += ((toward[i] * lift + part[i] - b.p[i]) * 52 - b.v[i] * 9.5) * dt;
          b.w[i] += ((Math.round(b.r[i] / TAU) * TAU - b.r[i]) * 38 - b.w[i] * 8.5) * dt;
        }
      }
      // how far it still is from where it wants to be, counting speed and leftover tumble
      let e = 0;
      for (let i = 0; i < 3; i++) {
        b.p[i] += b.v[i] * dt; b.r[i] += b.w[i] * dt;
        e += Math.abs(b.p[i] - toward[i] * lift - part[i]) + Math.abs(b.v[i]) * 0.1 + Math.abs(b.r[i] - Math.round(b.r[i] / TAU) * TAU) + Math.abs(b.w[i]) * 0.1;
      }
      if (b.away && clock >= b.hold && e < 0.08) {
        b.away = false; pending--;
        if (total && clock - lastDock > 0.04) { lastDock = clock; sound.dock(1 - pending / total); }
        if (total && pending === 0) sound.lock();
      }
      b.rest = e < 0.002 && !lift && !part[0] && !part[1] && !part[2];
      if (b.rest) { b.p = [0, 0, 0]; b.v = [0, 0, 0]; b.r = [0, 0, 0]; b.w = [0, 0, 0]; }
      busy ||= !b.rest || lift > 0;
    }
    // now and then, when nothing is happening, one block taps out and back
    if (moving && !cursor && !press && !pending && clock > nextPop) {
      const b = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
      for (let i = 0; i < 3; i++) { b.v[i] += toward[i] * 6*UNIT; b.w[i] += (Math.random() - 0.5) * 3; }
      nextPop = clock + 9 + Math.random() * 9;
      busy = true;
    }
    return busy;
  }

  let busy = false;
  function draw(now) {
    const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
    const moving = !still.matches && !window.h5xMotionPaused;
    clock += dt;
    if (moving) t += dt;
    // The brushstroke stays readable during idle motion; dragging still spins it.
    turn += turnVel; turnVel *= press?.moved ? 0.85 : 0.955;
    // a ratchet tick every 15 degrees while someone is spinning it by hand
    if (userSpin) {
      if (Math.abs(turn - tickAt) > 0.26) { tickAt = turn; sound.tick(Math.abs(turnVel)); }
      if (!press && Math.abs(turnVel) < 0.004) userSpin = false;
    }
    // once it slows, settle back to facing front
    if (!press?.moved && Math.abs(turnVel) < 0.01) { const home = Math.round(turn / TAU) * TAU; turn += (home - turn) * 0.06; }
    const ease = moving ? 0.08 : 1;
    lean[0] += (aim[0] - lean[0]) * ease; lean[1] += (aim[1] - lean[1]) * ease;
    // the light sits where the cursor is; without one it rests up and to the left
    const lt = cursor ? [-0.4 + aim[0] * 1.8, 0.45 - aim[1] * 1.8] : [-0.4, 0.45];
    light[0] += (lt[0] - light[0]) * ease * 0.9; light[1] += (lt[1] - light[1]) * ease * 0.9;
    const ln = Math.hypot(light[0], light[1], 0.8), Lx = light[0] / ln, Ly = light[1] / ln, Lz = 0.8 / ln;

    const A = (moving ? 0.24 * Math.sin(t * 0.5) : 0.12) + turn + lean[0] * 0.4;
    const B = (moving ? 0.18 * Math.sin(t * 0.33) : 0.12) - 0.08 + lean[1] * 0.4;
    const ca = Math.cos(A), sa = Math.sin(A), cb = Math.cos(B), sb = Math.sin(B);
    view = [ca, sa, cb, sb];
    busy = step(dt, moving);
    const dist = GW*1.6, K = Math.min(BW*.88/(GW+1),BH*.86/(GH+1))*dist, cx = W / 2, cy = H / 2;
    const dark = current() === 'dark';
    zb.fill(0);
    const cells = new Map();
    for (const b of BLOCKS) {
      const alpha = Math.max(0, Math.min(1, (clock - b.show) / 0.35));
      if (!alpha) { b.sx = b.sy = -1e4; continue; }
      let m = null;
      if (!b.rest) {
        const [rx, ry, rz] = b.r, cx_ = Math.cos(rx), sx_ = Math.sin(rx), cy_ = Math.cos(ry), sy_ = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
        m = [cy_ * cz, sx_ * sy_ * cz - cx_ * sz, cx_ * sy_ * cz + sx_ * sz, cy_ * sz, sx_ * sy_ * sz + cx_ * cz, cx_ * sy_ * sz - sx_ * cz, -sy_, sx_ * cy_, cx_ * cy_];
      }
      const ox = b.hx + b.p[0], oy = b.hy + b.p[1], oz = b.p[2];
      {
        // where the block sits on screen, and where its home is, for the cursor and for taps
        const X = ox * ca + oz * sa, Z = -ox * sa + oz * ca, Y2 = oy * cb - Z * sb, Z2 = oy * sb + Z * cb, o = 1 / (dist - Z2);
        b.sx = cx + X * K * o; b.sy = cy - Y2 * K * o;
        const hX = b.hx * ca, hZ = -b.hx * sa, hY = b.hy * cb - hZ * sb, hO = 1 / (dist - (b.hy * sb + hZ * cb));
        b.hsx = cx + hX * K * hO; b.hsy = cy - hY * K * hO;
      }
      for (const pt of b.pts) {
        if (pt[7] && b.rest && BLOCKS[pt[7] - 1].rest) continue;
        let lx = pt[0], ly = pt[1], lz = pt[2], nx0 = pt[3], ny = pt[4], nz0 = pt[5];
        if (m) {
          const ax = lx, ay = ly, az = lz, bx = nx0, by = ny, bz = nz0;
          lx = m[0] * ax + m[1] * ay + m[2] * az; ly = m[3] * ax + m[4] * ay + m[5] * az; lz = m[6] * ax + m[7] * ay + m[8] * az;
          nx0 = m[0] * bx + m[1] * by + m[2] * bz; ny = m[3] * bx + m[4] * by + m[5] * bz; nz0 = m[6] * bx + m[7] * by + m[8] * bz;
        }
        const x0 = ox + lx, y = oy + ly;
        // ripple: the glyph bends along its length like cloth in a breeze; the phase stays pinned to each block's home
        const ph = 0.75 * (b.hx + pt[0])/UNIT - t * 2.1 + (b.hy + pt[1])/UNIT * 0.25;
        const w = moving ? 0.22*UNIT * Math.sin(ph) : 0, slope = moving ? 0.165 * Math.cos(ph) : 0;
        const z = oz + lz + w, nx = nx0 - slope * nz0, nz = nz0 + slope * nx0;
        const X = x0 * ca + z * sa, Z = -x0 * sa + z * ca;
        const Y2 = y * cb - Z * sb, Z2 = y * sb + Z * cb;
        if (dist - Z2 < 3) continue;
        const NX = nx * ca + nz * sa, NZ = -nx * sa + nz * ca;
        const NY2 = ny * cb - NZ * sb, NZ2 = ny * sb + NZ * cb;
        const ooz = 1 / (dist - Z2);
        const c = Math.floor((cx + X * K * ooz) / cw), r = Math.floor((cy - Y2 * K * ooz) / ch);
        if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
        const i = r * cols + c;
        if (ooz <= zb[i]) continue;
        zb[i] = ooz;
        const L = Math.max(0, Math.min(0.999, 0.5 + 0.5 * (NX * Lx + NY2 * Ly + NZ2 * Lz)));
        cells.set(i, pt[6] ? [FACE[Math.floor(L * FACE.length)], 1, alpha,b.tone] : [SIDE[Math.floor((dark ? L : 1 - L) * SIDE.length)], 0, alpha * 0.82,b.tone]);
      }
    }
    const css = getComputedStyle(root), ink = css.getPropertyValue('--ink'), acc = css.getPropertyValue('--acc');
    ctx.clearRect(0, 0, W, H);
    for (const [i, [g, f, a, tone]] of cells) {
      const x=(i%cols)*cw,y=Math.floor(i/cols)*ch;
      ctx.globalAlpha = a;
      if (markStyle!=='ascii') {
        const gap=cw>=5?1:0.6;
        ctx.fillStyle=tone==='2'?(f?'#ff4d00':'#bd3900'):dark?`hsl(40 15% ${f?90:53}%)`:`hsl(35 15% ${f?17:41}%)`;
        ctx.fillRect(x+gap/2,y+gap/2,cw-gap,ch-gap);
        if (f&&cw>=5) {
          ctx.fillStyle=tone==='2'?'#ff9a5a':dark?'#ffffff':'#756f65';
          ctx.globalAlpha=a*.45;
          ctx.fillRect(x+gap/2,y+gap/2,cw-gap,1);
        }
      } else {
        ctx.fillStyle = tone==='2' ? '#ff4d00' : ink;
        ctx.fillText(g,x,y);
      }
    }
    // the ring a tap leaves: a circle of dots running out from it, behind the blocks
    ctx.fillStyle = ink;
    rings = rings.filter((g) => {
      const age = clock - g.t, R = age * BW * 1.5, max = BW * 0.85;
      if (R > max) return false;
      ctx.globalAlpha = 0.8 * (1 - R / max);
      const n = Math.max(12, Math.floor((TAU * R) / (cw * 1.7)));
      for (let k = 0; k < n; k++) {
        const c = Math.floor((g.x + Math.cos((k / n) * TAU) * R) / cw), r = Math.floor((g.y + Math.sin((k / n) * TAU) * R) / ch);
        if (c >= 0 && c < cols && r >= 0 && r < rows && !cells.has(r * cols + c)) {
          if(markStyle!=='ascii'){ctx.fillStyle='#ff4d00';ctx.fillRect(c*cw+cw*.3,r*ch+ch*.3,cw*.4,ch*.4);}
          else ctx.fillText('·', c * cw, r * ch);
        }
      }
      return true;
    });
    ctx.globalAlpha = 1;
  }
  // one loop at a time; theme changes and resizes just ask for the next frame
  const loop = (now) => { raf = 0; draw(now); if (visible && ((!still.matches && !window.h5xMotionPaused) || busy || rings.length || Math.abs(turnVel) > 0.001 || press)) raf = requestAnimationFrame(loop); };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  styles.forEach(button=>button.addEventListener('click',()=>{
    markStyle=button.dataset.markStyle;
    try{localStorage.setItem('h5x-mark-style',markStyle);}catch{}
    const url=new URL(location.href);url.searchParams.set('mark',markStyle);history.replaceState(null,'',url);
    assemble();paintStyle();size();draw(performance.now());kick();sound.note(markStyle==='logo'?2:0);
  }));
  new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible) kick(); }).observe(box);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) kick(); });
  addEventListener('resize', () => { size(); kick(); });
  mq.addEventListener('change', kick);
  still.addEventListener('change',()=>{if(still.matches)assemble();kick();});
  document.querySelectorAll('[data-set]').forEach((b) => b.addEventListener('click', kick));
  document.addEventListener('h5x:motion',()=>{if(window.h5xMotionPaused)assemble();kick();});
  document.addEventListener('h5x:scatter', () => shatter(W/2, H/2));
  new ResizeObserver(() => { if(box.clientWidth){size();kick();} }).observe(box);
  document.fonts.ready.then(() => { size(); if (!still.matches&&!window.h5xMotionPaused) arrive(); kick(); });
})();
