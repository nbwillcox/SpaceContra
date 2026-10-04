/* Procedural art: the astronaut, alien enemies, capsules and the parallax backdrops for each world. */
(function (G) {
  'use strict';
  const U = G.U, C = G.C, GFX = G.gfx, TAU = U.TAU;
  const mk = GFX.mk, lg = GFX.lg, rg = GFX.rg, poly = GFX.poly, flashOf = GFX.flashOf;
  const A = {};
  GFX.art = A;

  /* ---- the astronaut (drawn live: run cycle, jump spin, prone, aim) ---- */
  A.drawAstro = function (ctx, s) {
    const f = s.face, ph = s.phase;
    ctx.save(); ctx.translate(s.x, s.y); ctx.scale(f, 1);
    if (s.spin) {
      ctx.translate(0, -16); ctx.rotate(s.t * 14);
      ctx.fillStyle = lg(ctx, 0, -11, 0, 11, [[0, '#ffffff'], [1, '#9fb4e0']]); ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill();
      ctx.fillStyle = '#35c8f2'; ctx.beginPath(); ctx.ellipse(5, -2, 4.4, 3.4, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 11, 0.4, 1.6); ctx.stroke();
      ctx.restore(); return;
    }
    const prone = s.prone, by = prone ? -9 : 0;
    if (prone) {
      ctx.fillStyle = '#e8f0ff'; ctx.beginPath(); ctx.ellipse(-2, -8, 15, 6, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = lg(ctx, 0, -20, 0, -8, [[0, '#ffffff'], [1, '#8aa0d0']]); ctx.beginPath(); ctx.arc(10, -11, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = '#35c8f2'; ctx.beginPath(); ctx.ellipse(13, -12, 3.6, 2.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7a8aa8'; ctx.fillRect(-14, -12, 7, 8);
    } else {
      const sw = s.moving ? Math.sin(ph) : 0, sw2 = s.moving ? Math.sin(ph + Math.PI) : 0;
      ctx.strokeStyle = '#cfd8ee'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-1, by - 12); ctx.lineTo(-1 + sw * 8, by - 2 - (s.air ? 4 : 0) + Math.abs(sw) * -3); ctx.moveTo(1, by - 12); ctx.lineTo(1 + sw2 * 8, by - 2 - (s.air ? 2 : 0) + Math.abs(sw2) * -3); ctx.stroke();
      ctx.fillStyle = '#4a5a82'; ctx.beginPath(); ctx.arc(-1 + sw * 8, by - 1, 3, 0, TAU); ctx.arc(1 + sw2 * 8, by - 1, 3, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7a8aa8'; ctx.fillRect(-9, by - 31, 6, 15);
      ctx.fillStyle = lg(ctx, 0, by - 34, 0, by - 10, [[0, '#ffffff'], [1, '#a9bbe4']]); ctx.beginPath(); ctx.ellipse(0, by - 21, 7.5, 11, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = lg(ctx, 0, by - 42, 0, by - 30, [[0, '#ffffff'], [1, '#8aa0d0']]); ctx.beginPath(); ctx.arc(1, by - 35, 7.6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#052a44'; ctx.beginPath(); ctx.ellipse(4, by - 35, 4.8, 3.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#52f0ff'; ctx.fillRect(2, by - 36.4, 5, 1.6);
    }
    // gun: pivots around the shoulder along the aim angle
    const gx = prone ? 8 : 4, gy = prone ? -10 : by - 22;
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(s.aim);
    ctx.fillStyle = '#9aa4c0'; ctx.fillRect(-2, -2.4, 9, 5);
    ctx.fillStyle = lg(ctx, 0, -2, 0, 2, [[0, '#6a7490'], [1, '#2a3048']]); ctx.fillRect(6, -2, 12, 4);
    ctx.fillStyle = '#ffb347'; ctx.fillRect(17, -2, 3, 4);
    ctx.restore();
    ctx.restore();
  };

  /* ---- alien enemies: sprites face left ---- */
  function drawGrunt(fr) {
    return (x) => {
      x.shadowColor = 'rgba(110,255,100,0.8)'; x.shadowBlur = 6;
      const sw = fr ? 1 : -1;
      x.strokeStyle = '#2f8a2a'; x.lineWidth = 5; x.lineCap = 'round';
      x.beginPath(); x.moveTo(-2, 8); x.lineTo(-2 + sw * 8, 18); x.moveTo(3, 8); x.lineTo(3 - sw * 8, 18); x.stroke();
      x.fillStyle = lg(x, 0, -12, 0, 12, [[0, '#d0ffb0'], [0.5, '#52d83a'], [1, '#1c5a1c']]);
      x.beginPath(); x.ellipse(1, 0, 8, 12, 0.15, 0, TAU); x.fill();
      x.beginPath(); x.ellipse(-3, -14, 9, 8, 0, 0, TAU); x.fill();
      x.shadowBlur = 0; x.strokeStyle = '#c8ffb0'; x.lineWidth = 1.3; x.stroke();
      x.fillStyle = '#ff3b3b'; x.beginPath(); x.arc(-7, -14, 2.6, 0, TAU); x.arc(-1, -15, 2.2, 0, TAU); x.fill();
      x.strokeStyle = '#2f8a2a'; x.lineWidth = 3; x.beginPath(); x.moveTo(-4, -2); x.lineTo(-14, 4 + sw * 2); x.stroke();
      x.fillStyle = '#ffec6a'; x.beginPath(); x.moveTo(-14, 4 + sw * 2); x.lineTo(-18, 2 + sw * 2); x.lineTo(-15, 7 + sw * 2); x.fill();
    };
  }
  function drawSniper(x) {
    x.shadowColor = 'rgba(255,120,90,0.8)'; x.shadowBlur = 6;
    x.fillStyle = lg(x, 0, -14, 0, 18, [[0, '#ffd0b0'], [0.5, '#e0603a'], [1, '#5a1a10']]);
    x.beginPath(); x.ellipse(2, 2, 9, 15, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(-2, -16, 8, 7, 0, 0, TAU); x.fill();
    x.shadowBlur = 0; x.strokeStyle = '#ffd8c0'; x.lineWidth = 1.3; x.stroke();
    x.fillStyle = '#ffec6a'; x.beginPath(); x.arc(-6, -16, 2.4, 0, TAU); x.fill();
    x.fillStyle = '#3a2a2a'; x.fillRect(-26, -2, 26, 4); x.fillStyle = '#ff6a3d'; x.fillRect(-28, -2, 3, 4);
    x.strokeStyle = '#8a2a1a'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(0, 15); x.lineTo(-3, 20); x.moveTo(5, 15); x.lineTo(8, 20); x.stroke();
  }
  function drawFlyer(fr) {
    return (x) => {
      x.shadowColor = 'rgba(255,80,200,0.9)'; x.shadowBlur = 7;
      const w = fr ? -9 : 7;
      x.fillStyle = lg(x, -20, 0, 20, 0, [[0, '#6a1a5a'], [0.5, '#e84cc0'], [1, '#6a1a5a']]);
      poly(x, [[-4, -2], [-22, w - 8], [-12, 2], [0, 4], [12, 2], [22, w - 8], [4, -2]]); x.fill();
      x.fillStyle = rg(x, -2, -3, 1, 10, [[0, '#ffd8f4'], [0.5, '#ff5ac8'], [1, '#6a0a58']]);
      x.beginPath(); x.ellipse(0, 1, 9, 8, 0, 0, TAU); x.fill();
      x.shadowBlur = 0; x.fillStyle = '#ffec6a'; x.beginPath(); x.arc(-3, 0, 2.2, 0, TAU); x.arc(3, 0, 2.2, 0, TAU); x.fill();
    };
  }
  function drawPod(x) {
    x.shadowColor = 'rgba(180,220,255,0.9)'; x.shadowBlur = 8;
    x.fillStyle = lg(x, 0, -12, 0, 12, [[0, '#f4f8ff'], [0.5, '#9fb0d0'], [1, '#3a4460']]);
    x.beginPath(); x.ellipse(0, 0, 24, 11, 0, 0, TAU); x.fill();
    x.shadowBlur = 0; x.strokeStyle = '#d8e8ff'; x.lineWidth = 1.5; x.stroke();
    poly(x, [[-24, 0], [-34, -10], [-30, 4]]); x.fillStyle = '#7a88aa'; x.fill(); poly(x, [[24, 0], [34, -10], [30, 4]]); x.fill();
    x.fillStyle = '#10142c'; x.beginPath(); x.ellipse(0, 0, 12, 7, 0, 0, TAU); x.fill();
    x.fillStyle = '#ff6a3d'; x.fillRect(-26, 4, 5, 3); x.fillRect(21, 4, 5, 3);
  }
  function drawPillbox(open) {
    return (x) => {
      x.shadowColor = open ? 'rgba(255,90,60,0.95)' : 'rgba(150,170,210,0.7)'; x.shadowBlur = 7;
      x.fillStyle = lg(x, 0, -18, 0, 18, [[0, '#b8c4dc'], [0.5, '#5d6a88'], [1, '#262e44']]);
      x.beginPath(); x.moveTo(-22, 18); x.lineTo(-22, 0); x.quadraticCurveTo(-22, -16, 0, -16); x.quadraticCurveTo(22, -16, 22, 0); x.lineTo(22, 18); x.closePath(); x.fill();
      x.shadowBlur = 0; x.strokeStyle = '#e0ecff'; x.lineWidth = 1.5; x.stroke();
      if (open) { x.fillStyle = '#1a0606'; x.beginPath(); x.ellipse(0, -2, 13, 9, 0, 0, TAU); x.fill(); x.fillStyle = '#ff4a3a'; x.beginPath(); x.arc(0, -2, 5, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(-1, -3, 1.6, 0, TAU); x.fill(); }
      else { x.strokeStyle = 'rgba(15,20,36,0.7)'; x.lineWidth = 2; x.beginPath(); x.moveTo(-14, -2); x.lineTo(14, -2); x.stroke(); x.fillStyle = '#ff6a3d'; x.fillRect(-3, -8, 6, 3); }
    };
  }
  function drawLeaper(x) {
    x.shadowColor = 'rgba(255,190,60,0.9)'; x.shadowBlur = 6;
    x.fillStyle = lg(x, 0, -10, 0, 12, [[0, '#ffe8a0'], [0.5, '#e8a020'], [1, '#6a3a08']]);
    x.beginPath(); x.ellipse(0, 0, 14, 11, 0, 0, TAU); x.fill();
    x.shadowBlur = 0; x.strokeStyle = '#fff0c0'; x.lineWidth = 1.3; x.stroke();
    x.strokeStyle = '#a86a10'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.moveTo(-8, 8); x.lineTo(-16, 14); x.moveTo(8, 8); x.lineTo(16, 14); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.arc(-6, -4, 4, 0, TAU); x.arc(2, -5, 3.4, 0, TAU); x.fill(); x.fillStyle = '#2a0808'; x.beginPath(); x.arc(-7, -4, 1.8, 0, TAU); x.arc(1, -5, 1.5, 0, TAU); x.fill();
  }

  /* ---- capsules and shots ---- */
  const CAPS = { S: { c: '#ff5a5a', name: 'SPREAD' }, M: { c: '#ffb347', name: 'MACHINE GUN' }, L: { c: '#5ab4ff', name: 'LASER' }, F: { c: '#ffd24a', name: 'FLAME' }, R: { c: '#d8e8ff', name: 'RAPID' }, B: { c: '#c88aff', name: 'BARRIER' }, '1UP': { c: '#7dff8a', name: '1UP' } };
  A.CAPS = CAPS;
  function drawCap(k) {
    return (x) => {
      const P = CAPS[k];
      x.shadowColor = P.c; x.shadowBlur = 8;
      x.fillStyle = P.c; poly(x, [[-9, -2], [-20, -10], [-16, 3]]); x.fill(); poly(x, [[9, -2], [20, -10], [16, 3]]); x.fill();
      x.fillStyle = lg(x, 0, -10, 0, 10, [[0, '#ffffff'], [0.3, P.c], [1, '#1a1a2a']]); x.beginPath(); x.ellipse(0, 0, 11, 9, 0, 0, TAU); x.fill();
      x.shadowBlur = 0; x.strokeStyle = '#ffffff'; x.lineWidth = 1.5; x.stroke();
      x.fillStyle = '#10142c'; x.font = '900 ' + (k === '1UP' ? 8 : 12) + 'px "Segoe UI", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(k, 0, 1);
    };
  }
  function drawBullet(col, w, h) {
    return (x) => { x.shadowColor = col; x.shadowBlur = 6; x.fillStyle = '#ffffff'; x.beginPath(); x.ellipse(0, 0, w, h, 0, 0, TAU); x.fill(); x.shadowBlur = 0; x.fillStyle = col; x.beginPath(); x.ellipse(0, 0, w * 0.6, h * 0.6, 0, 0, TAU); x.fill(); };
  }
  function drawEBullet(x) {
    x.fillStyle = rg(x, 0, 0, 0, 7, [[0, '#ffffff'], [0.35, '#ff9aef'], [0.75, '#ff2dc0'], [1, 'rgba(255,40,200,0)']]);
    x.beginPath(); x.arc(0, 0, 7, 0, TAU); x.fill();
  }
  function drawFire(x) {
    x.fillStyle = rg(x, 0, 0, 0, 9, [[0, '#ffffff'], [0.3, '#ffe27a'], [0.7, '#ff7a1a'], [1, 'rgba(255,60,0,0)']]);
    x.beginPath(); x.arc(0, 0, 9, 0, TAU); x.fill();
  }
  GFX.initArt = function () {
    const s = GFX.spr = {};
    s.grunt = [mk(46, 50, drawGrunt(0)), mk(46, 50, drawGrunt(1))]; s.sniper = mk(54, 56, drawSniper);
    s.flyer = [mk(56, 40, drawFlyer(0)), mk(56, 40, drawFlyer(1))]; s.pod = mk(76, 36, drawPod);
    s.pill = [mk(54, 50, drawPillbox(false)), mk(54, 50, drawPillbox(true))]; s.leaper = mk(46, 40, drawLeaper);
    s.cap = {}; for (const k in CAPS) s.cap[k] = mk(52, 32, drawCap(k));
    s.bN = mk(16, 10, drawBullet('#ffd24a', 5, 3)); s.bM = mk(14, 8, drawBullet('#ffb347', 4, 2.6)); s.bS = mk(14, 10, drawBullet('#ff5a5a', 4.6, 3.4));
    s.eb = mk(22, 22, drawEBullet); s.fire = mk(26, 26, drawFire);
    s.flash = {}; s.flash.grunt = flashOf(s.grunt[0]); s.flash.sniper = flashOf(s.sniper); s.flash.leaper = flashOf(s.leaper); s.flash.pill = flashOf(s.pill[1]); s.flash.flyer = flashOf(s.flyer[0]);
  };

  /* ---- parallax layers (seamless 1024 px tiles) and ground ---- */
  const tiles = {};
  A.layer = function (theme, idx) {
    const key = theme + '|' + idx;
    if (tiles[key]) return tiles[key];
    const h = G.stage.THEMES[theme].h, N = 1024, H = C.H, c = document.createElement('canvas');
    c.width = N; c.height = H;
    const x = c.getContext('2d'), rnd = GFX.mulberry(theme * 13 + idx * 5 + 2);
    if (idx === 0) {
      x.fillStyle = lg(x, 0, 0, 0, H, [[0, U.hsl(h + 20, 55, 6)], [0.65, U.hsl(h, 55, 16)], [1, U.hsl(h, 50, 10)]]); x.fillRect(0, 0, N, H);
      for (let i = 0; i < 110; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.15 + rnd() * 0.6) + ')'; x.fillRect(rnd() * N, rnd() * H * 0.7, 1.4, 1.4); }
      x.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 6; i++) { const cx = rnd() * N, cy = 40 + rnd() * 200, r = 120 + rnd() * 160; for (const ox of [-N, 0, N]) { x.fillStyle = rg(x, cx + ox, cy, 0, r, [[0, U.hsl(h + rnd() * 50, 70, 40, 0.18)], [1, U.hsl(h, 70, 30, 0)]]); x.fillRect(cx + ox - r, cy - r, r * 2, r * 2); } }
      x.globalCompositeOperation = 'source-over';
      x.fillStyle = rg(x, 700, 120, 4, 70, [[0, U.hsl(h + 30, 80, 80)], [0.6, U.hsl(h + 30, 60, 45)], [1, U.hsl(h, 40, 15)]]); x.beginPath(); x.arc(700, 120, 52, 0, TAU); x.fill();
    } else if (idx === 1) {
      const ph = [rnd() * TAU, rnd() * TAU, rnd() * TAU];
      x.fillStyle = U.hsl(h, 45, 11); x.beginPath(); x.moveTo(0, H);
      for (let i = 0; i <= N; i += 8) { const k = i / N * TAU; x.lineTo(i, 330 - 70 * Math.max(0, Math.sin(k * 2 + ph[0])) - 45 * Math.abs(Math.sin(k * 5 + ph[1])) - 20 * Math.sin(k * 11 + ph[2])); }
      x.lineTo(N, H); x.closePath(); x.fill(); x.strokeStyle = U.hsl(h, 80, 45, 0.45); x.lineWidth = 2; x.stroke();
    } else {
      x.fillStyle = U.hsl(h, 55, 8);
      for (let i = 0; i < 18; i++) { const px = i * (N / 18) + rnd() * 20, th = 50 + rnd() * 90, w = 5 + rnd() * 9; x.beginPath(); x.moveTo(px - w, H); x.quadraticCurveTo(px - w, H - th * 0.6, px + (rnd() - 0.5) * 30, H - th); x.quadraticCurveTo(px + w, H - th * 0.6, px + w, H); x.fill(); }
      x.fillStyle = U.hsl(h, 80, 55, 0.5); for (let i = 0; i < 40; i++) x.fillRect(rnd() * N, H - 20 - rnd() * 100, 2, 2);
    }
    return (tiles[key] = c);
  };
  const gt = {};
  A.ground = function (theme) {
    if (gt[theme]) return gt[theme];
    const h = G.stage.THEMES[theme].h, w = 128, hh = C.H - C.FLOOR, c = document.createElement('canvas');
    c.width = w; c.height = hh;
    const x = c.getContext('2d'), rnd = GFX.mulberry(theme * 3 + 1);
    x.fillStyle = lg(x, 0, 0, 0, hh, [[0, U.hsl(h, 40, 24)], [1, U.hsl(h, 45, 8)]]); x.fillRect(0, 0, w, hh);
    for (let i = 0; i < 60; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,' + (0.04 + rnd() * 0.07) + ')' : 'rgba(0,0,0,' + (0.1 + rnd() * 0.15) + ')'; const r = 2 + rnd() * 6; x.fillRect(rnd() * w, 6 + rnd() * (hh - 6), r, r * 0.6); }
    x.fillStyle = U.hsl(h, 85, 55, 0.9); x.fillRect(0, 0, w, 3); x.fillStyle = U.hsl(h, 90, 70, 0.5); x.fillRect(0, 3, w, 2);
    return (gt[theme] = c);
  };
})((window.SGS = window.SGS || {}));
