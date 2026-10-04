/* Stage bosses: Defense Wall (cannons then core), Iron Walker (stomps and lobs), Alien Heart (opens and spits) and the Mothership. */
(function (G) {
  'use strict';
  const U = G.U, C = G.C, FX = G.fx, GFX = G.gfx, A = G.audio, E = G.enemies, St = G.stage, TAU = U.TAU;
  const Bo = {};
  G.boss = Bo;
  const FL = C.FLOOR;

  Bo.create = function (g, n) {
    const kind = St.bossIdx(n), s = 1 + 0.3 * St.cycle(n), ax = g.st.arenaX;
    const part = (k, dx, dy, r, hp) => ({ k, dx, dy, r, hp: Math.round(hp * s), maxhp: Math.round(hp * s), alive: true, hitT: 0, cd: U.rand(0.8, 1.8), x: 0, y: 0 });
    const b = { kind, name: C.BOSS_NAMES[kind], x: ax + 810, y: FL, t: 0, state: 'fight', hit: 0, dieT: 0, s, parts: [], id: n, bx: ax + 810, face: -1, cd: 2, ph: 0, vy: 0, air: false, open: false, cyc: 0, spin: 0 };
    if (kind === 0) { b.parts = [part('gun', -6, -300, 22, 14), part('gun', -6, -190, 22, 14), part('top', 22, -388, 16, 8)]; b.core = { dx: 40, dy: -118, r: 32, hp: Math.round(38 * s), maxhp: Math.round(38 * s) }; }
    else if (kind === 1) { b.x = ax + 700; b.y = 0; b.core = { dx: 0, dy: -70, r: 52, hp: Math.round(80 * s), maxhp: Math.round(80 * s), solid: true }; }
    else if (kind === 2) { b.x = ax + 790; b.y = FL - 190; b.core = { dx: 0, dy: 0, r: 64, hp: Math.round(100 * s), maxhp: Math.round(100 * s), solid: true }; }
    else { b.x = ax + 720; b.y = 190; b.bx = b.x; b.parts = [part('gun', -90, 24, 16, 10), part('gun', 0, 44, 16, 10), part('gun', 90, 24, 16, 10)]; b.core = { dx: 0, dy: 62, r: 28, hp: Math.round(40 * s), maxhp: Math.round(40 * s) }; }
    return b;
  };
  Bo.exposed = (b) => (b.kind === 0 || b.kind === 3 ? !b.parts.some((p) => p.alive) : b.kind === 2 ? b.open : true);
  const baseY = (b) => (b.kind === 3 || b.kind === 2 ? b.y : b.kind === 1 ? FL + b.y : FL);
  const place = (b) => { for (const p of b.parts) { p.x = b.x + p.dx; p.y = baseY(b) + p.dy; } b.core.x = b.x + b.core.dx; b.core.y = baseY(b) + b.core.dy; };

  Bo.update = function (g, b, dt) {
    b.t += dt; if (b.hit > 0) b.hit -= dt;
    for (const p of b.parts) if (p.hitT > 0) p.hitT -= dt;
    const pl = g.player, aim = (x, y, sp, off, extra) => { const a = Math.atan2(pl.y - 24 - y, pl.x - x) + (off || 0); g.ebullet(x, y, Math.cos(a) * sp, Math.sin(a) * sp, extra); };
    if (b.state === 'dying') {
      b.dieT -= dt;
      if (Math.random() < 0.45) { FX.explosion(b.x - g.cam.x + U.rand(-90, 90), b.core.y + U.rand(-120, 120), U.rand(0.9, 1.7), U.rand(0, 50)); FX.addShake(5); }
      if (b.dieT <= 0) { b.state = 'done'; FX.explosion(b.x - g.cam.x, b.core.y, 4, 30); FX.doFlash(0.6, '255,230,200'); A.sfx.boom(); }
      return;
    }
    const enter = Math.max(0, 1 - b.t / 1.4);
    if (b.kind === 0) { b.x = b.bx + enter * 400; }
    else if (b.kind === 1) {
      const lo = g.st.arenaX + 470, hi = g.st.arenaX + 860, dx = pl.x - b.x; b.face = dx > 0 ? 1 : -1;
      if (!b.air) { b.x = U.clamp(b.x + b.face * 55 * dt - (enter > 0 ? 300 * dt * enter : 0), lo, hi); b.cd -= dt;
        if (b.cd <= 0 && enter <= 0) { const r = Math.random(); b.cd = U.rand(2.3, 3.6) / Math.sqrt(b.s);
          if (r < 0.4) { for (let k = -1; k <= 1; k++) aim(b.x + b.face * 50, FL - 100, 280, k * 0.2); A.sfx.enemyShot(); }
          else if (r < 0.7) { for (let k = 0; k < 2; k++) g.ebullet(b.x + b.face * 40, FL - 130, b.face * (190 + k * 90), -420, { ay: 760, r: 9 }); A.sfx.enemyShot(); }
          else { b.air = true; b.vy = -820; b.vx = b.face * 250; } } }
      else { b.vy += 1900 * dt; b.y += b.vy * dt; b.x = U.clamp(b.x + b.vx * dt, lo, hi + 60);
        if (b.y >= 0 && b.vy > 0) { b.y = 0; b.air = false; FX.addShake(8); A.sfx.thud(); for (const sd of [-1, 1]) g.ebullet(b.x, FL - 10, sd * 250, 0, { r: 12, low: true, life: 3 }); } }
    } else if (b.kind === 2) {
      b.x = b.bx + enter * 400; b.ph += dt; b.cyc += dt;
      const per = b.cyc % 5.6; b.open = per > 3.2;
      b.spin -= dt;
      if (!b.open && b.spin <= 0 && enter <= 0) { b.spin = 0.22; b.a = (b.a || 0) + 0.5; g.ebullet(b.x, b.y, Math.cos(b.a) * -190, Math.sin(b.a) * 190, { r: 7 }); }
      b.cd -= dt;
      if (b.open && b.cd <= 0) { b.cd = 1.05; for (let k = -2; k <= 2; k++) aim(b.x, b.y, 250, k * 0.25); A.sfx.enemyShot(); }
      b.sp = (b.sp === undefined ? 3.5 : b.sp) - dt;
      if (b.sp <= 0 && enter <= 0) { b.sp = 4.6; if (g.en.filter((e) => e.type === 'leaper').length < 3) { const e = E.spawn(g, 'leaper', b.x - 50, FL, {}); e.vx = -120; e.onGround = false; A.sfx.spawnBot(); } }
    } else {
      b.x = b.bx + Math.sin(b.t * 0.7) * 170 + enter * 400; b.y = 190 + Math.sin(b.t * 1.1) * 70;
      for (const p of b.parts) if (p.alive) { p.cd -= dt; if (p.cd <= 0 && enter <= 0) { p.cd = U.rand(1.8, 2.6) / Math.sqrt(b.s); aim(b.x + p.dx, b.y + p.dy, 270); A.sfx.enemyShot(); } }
      b.cd -= dt;
      if (b.cd <= 0 && enter <= 0) { b.cd = 2.6; g.ebullet(b.x + U.rand(-60, 60), b.y + 50, 0, 30, { ay: 520, r: 10 }); if (Bo.exposed(b)) for (let k = -2; k <= 2; k++) aim(b.x, b.y + 62, 240, k * 0.3); }
    }
    if (b.kind === 0) {
      for (const p of b.parts) if (p.alive) { p.cd -= dt; if (p.cd <= 0 && enter <= 0) { p.cd = p.k === 'top' ? 1.5 : 2.4; if (p.k === 'top') aim(p.x, p.y, 260); else for (let k = 0; k < 3; k++) setTimeout(() => { if (b.state === 'fight') aim(p.x, p.y, 300); }, k * 150); A.sfx.enemyShot(); } }
      if (Bo.exposed(b)) { b.cd -= dt; if (b.cd <= 0) { b.cd = 1.7; for (let k = -2; k <= 2; k++) aim(b.core.x, b.core.y, 250, k * 0.22); } }
    }
    place(b);
  };

  function hurtPart(g, b, p, dmg) {
    p.hp -= dmg; p.hitT = 0.1; A.sfx.hit();
    FX.sparks(p.x - g.cam.x, p.y, 4, 120, 'hsla(30,100%,70%,1)', 0.3, 1.4);
    if (p.hp <= 0) { p.alive = false; FX.explosion(p.x - g.cam.x, p.y, 1.5, 25); A.sfx.partBreak(); FX.addShake(6); g.award(1500, p.x, p.y); if (Bo.exposed(b) && b.kind !== 2) { g.banner = { text: 'CORE EXPOSED', sub: '', t: 0, life: 1.5, small: true }; FX.doFlash(0.3, '255,200,200'); } }
  }
  function hurtCore(g, b, dmg) {
    const c = b.core;
    c.hp -= dmg; b.hit = 0.08; A.sfx.hit();
    FX.sparks(c.x - g.cam.x, c.y, 4, 140, 'hsla(10,100%,70%,1)', 0.3, 1.5);
    if (c.hp <= 0 && b.state !== 'dying') { b.state = 'dying'; b.dieT = 2.6; g.clearBullets(true); g.award(12000 + g.stageNo * 600, c.x, c.y); A.sfx.boom(); }
  }
  /* a shot at world point (x,y): returns true if the boss stopped it */
  Bo.hit = function (g, b, bl) {
    if (b.state !== 'fight' || b.t < 1.4) return false;
    for (const p of b.parts) {
      if (!p.alive) continue;
      const dx = bl.x - p.x, dy = bl.y - p.y, rr = p.r + bl.r;
      if (dx * dx + dy * dy < rr * rr) { if (bl.pierce && p.hitT > 0) return true; hurtPart(g, b, p, bl.dmg); return true; }
    }
    const c = b.core, dx = bl.x - c.x, dy = bl.y - c.y, rr = c.r + bl.r;
    if (dx * dx + dy * dy < rr * rr) {
      if (bl.pierce && b.hit > 0) return true;
      if (c.solid && b.kind === 1) hurtCore(g, b, bl.dmg * (bl.y < c.y - 36 ? 2 : 1));
      else if (Bo.exposed(b)) hurtCore(g, b, bl.dmg);
      else { FX.sparks(bl.x - g.cam.x, bl.y, 2, 90, 'hsla(190,100%,75%,1)', 0.2, 1.2); b.hit = 0.05; }
      return true;
    }
    return false;
  };
  Bo.touches = function (g, b, p) {
    if (b.state !== 'fight' || b.t < 1.4) return false;
    const x = p.x, y = p.y - 20;
    for (const q of b.parts) { if (!q.alive) continue; if ((x - q.x) * (x - q.x) + (y - q.y) * (y - q.y) < (q.r + 8) * (q.r + 8)) return true; }
    const c = b.core;
    return (x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < (c.r + 8) * (c.r + 8);
  };

  /* ---------- drawing ---------- */
  function drawWall(ctx, g, b, sx, fl, ex) {
    const cam = g.cam.x, c = b.core, t = b.t, x0 = sx - 36, w = 190;
    ctx.fillStyle = GFX.lg(ctx, x0, 0, x0 + w, 0, [[0, '#8a96b4'], [0.5, '#4a5470'], [1, '#232a40']]); ctx.fillRect(x0, FL - 410, w, 410);
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 1.4; for (let y = FL - 400; y < FL; y += 38) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); }
    ctx.strokeStyle = '#ffb347'; ctx.lineWidth = 3; ctx.strokeRect(x0, FL - 410, w, 410);
    for (const p of b.parts) {
      if (!p.alive) continue;
      const a = Math.atan2(g.player.y - p.y, g.player.x - p.x), px = p.x - cam;
      ctx.strokeStyle = '#e8d0b0'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(px, p.y); ctx.lineTo(px + Math.cos(a) * 30, p.y + Math.sin(a) * 30); ctx.stroke();
      ctx.fillStyle = p.hitT > 0 ? '#fff' : GFX.rg(ctx, px - 4, p.y - 4, 2, p.r + 4, [[0, '#ffe0c0'], [1, '#5a2418']]); ctx.beginPath(); ctx.arc(px, p.y, p.r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#ffc890'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.fillStyle = ex ? 'rgba(255,60,60,' + (0.7 + 0.3 * Math.sin(t * 12)) + ')' : '#2a3048'; ctx.beginPath(); ctx.arc(c.x - cam, c.y, c.r, 0, TAU); ctx.fill(); ctx.strokeStyle = ex ? '#ffd0d0' : '#8a96b4'; ctx.lineWidth = 3; ctx.stroke();
    if (!ex) { ctx.strokeStyle = '#1a1e30'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(c.x - cam - c.r, c.y); ctx.lineTo(c.x - cam + c.r, c.y); ctx.stroke(); } else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(c.x - cam, c.y, 8, 0, TAU); ctx.fill(); }
  }
  function drawWalker(ctx, b, sx, fl) {
    const x = sx, y = FL + b.y, f = b.face, st = Math.sin(b.t * 6) * (b.air ? 0 : 8);
    ctx.lineCap = 'round';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sd * 20, y - 70); ctx.lineTo(x + sd * 30 + st * sd, y - 34); ctx.lineTo(x + sd * 26 + st * sd, y); ctx.lineWidth = 16; ctx.strokeStyle = fl ? '#fff' : '#3a4668'; ctx.stroke(); }
    ctx.fillStyle = fl ? '#ffffff' : GFX.lg(ctx, 0, y - 150, 0, y - 60, [[0, '#9aa8d0'], [1, '#3a4668']]); ctx.fillRect(x - 46, y - 150, 92, 84);
    ctx.strokeStyle = '#d8e4ff'; ctx.lineWidth = 2.4; ctx.strokeRect(x - 46, y - 150, 92, 84);
    ctx.fillStyle = fl ? '#fff' : '#6a7aa0'; ctx.beginPath(); ctx.arc(x + f * 6, y - 168, 22, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ff4a3a'; ctx.beginPath(); ctx.arc(x + f * 14, y - 170, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffd0a0'; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(x + f * 30, y - 110); ctx.lineTo(x + f * 78, y - 100); ctx.stroke();
  }
  function drawHeart(ctx, b, sx, fl) {
    const x = sx, y = b.core.y, t = b.t, pulse = 1 + Math.sin(t * 5) * 0.04;
    ctx.fillStyle = GFX.rg(ctx, x - 14, y - 16, 6, 78 * pulse, fl ? [[0, '#fff'], [1, '#ffd0e0']] : [[0, '#ffc0d8'], [0.45, '#e0306c'], [1, '#3a0618']]); ctx.beginPath(); ctx.arc(x, y, 66 * pulse, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(70,0,30,0.5)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + 0.3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * 20, y + Math.sin(a) * 20); ctx.quadraticCurveTo(x + Math.cos(a + 0.5) * 44, y + Math.sin(a + 0.5) * 44, x + Math.cos(a) * 64, y + Math.sin(a) * 64); ctx.stroke(); }
    ctx.fillStyle = '#1a0212'; ctx.beginPath(); ctx.ellipse(x, y, 26, 26 * (b.open ? 0.9 : 0.06), 0, 0, TAU); ctx.fill();
    if (b.open) { ctx.fillStyle = '#ffec6a'; ctx.beginPath(); ctx.arc(x, y, 12, 0, TAU); ctx.fill(); ctx.fillStyle = '#2a0412'; ctx.fillRect(x - 2, y - 10, 4, 20); }
    else { ctx.strokeStyle = '#ff9ac0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 30, y); ctx.lineTo(x + 30, y); ctx.stroke(); }
  }
  function drawShip(ctx, g, b, sx, ex) {
    const cam = g.cam.x, x = sx, y = b.y, c = b.core;
    ctx.fillStyle = GFX.lg(ctx, 0, y - 30, 0, y + 40, [[0, '#c8d4f0'], [0.5, '#6a789c'], [1, '#262e48']]); ctx.beginPath(); ctx.ellipse(x, y, 130, 38, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e0ecff'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.fillStyle = 'rgba(120,220,255,0.6)'; ctx.beginPath(); ctx.ellipse(x, y - 22, 46, 20, 0, Math.PI, 0); ctx.fill();
    for (const p of b.parts) { if (!p.alive) continue; ctx.fillStyle = p.hitT > 0 ? '#fff' : '#ffb06a'; ctx.beginPath(); ctx.arc(p.x - cam, p.y, p.r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff0d0'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = ex ? 'rgba(255,70,70,' + (0.7 + 0.3 * Math.sin(b.t * 12)) + ')' : '#3a4262'; ctx.beginPath(); ctx.arc(c.x - cam, c.y, c.r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#e0ecff'; ctx.lineWidth = 2.4; ctx.stroke();
  }
  Bo.draw = function (ctx, g, b) {
    if (b.state === 'done') return;
    const sx = b.x - g.cam.x, fl = b.hit > 0, ex = Bo.exposed(b);
    ctx.save();
    ctx.globalAlpha = b.state === 'dying' ? 0.5 + 0.5 * Math.sin(b.t * 40) : 1;
    if (b.kind === 0) drawWall(ctx, g, b, sx, fl, ex);
    else if (b.kind === 1) drawWalker(ctx, b, sx, fl);
    else if (b.kind === 2) drawHeart(ctx, b, sx, fl);
    else drawShip(ctx, g, b, sx, ex);
    ctx.restore();
  };
})((window.SGS = window.SGS || {}));
