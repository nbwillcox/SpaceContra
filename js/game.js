/* Core game state: the astronaut, platform physics, weapons, capsules, bullets, collisions and stage flow. */
(function (G) {
  'use strict';
  const U = G.U, C = G.C, S = G.settings, FX = G.fx, GFX = G.gfx, A = G.audio, I = G.input, St = G.stage, E = G.enemies, Bo = G.boss, TAU = U.TAU;
  const W = C.W, H = C.H, FL = C.FLOOR;
  const Game = { state: 'title', demo: true, time: 0 };
  G.game = Game;

  Game.reset = function (demo, startStage) {
    this.demo = !!demo;
    this.score = 0; this.lives = C.START_LIVES; this.stageNo = 0;
    this.lifeIdx = 0; this.nextLifeAt = C.EXTRA_LIFE_AT[0];
    this.banner = null; this.over = false; this.overDone = false; this.timer = 0;
    this.hi = G.scores.best();
    this.player = { x: 120, y: FL, vx: 0, vy: 0, face: 1, onGround: true, jumped: false, prone: false, aim: 0, phase: 0, weapon: 'N', rapid: false, shield: 0, fireCd: 0, alive: true, respawn: 0, invuln: 2, dropT: 0, t: 0, moving: false };
    FX.reset();
    this.startStage(startStage || 1);
  };

  /* ---------- scoring ---------- */
  Game.addScore = function (v) {
    this.score += v;
    if (this.demo) return;
    while (this.score >= this.nextLifeAt) {
      this.lives = Math.min(9, this.lives + 1);
      this.lifeIdx++;
      this.nextLifeAt = this.lifeIdx < C.EXTRA_LIFE_AT.length ? C.EXTRA_LIFE_AT[this.lifeIdx] : this.nextLifeAt + C.EXTRA_LIFE_EVERY;
      A.sfx.extraLife();
      this.banner = { text: 'EXTRA LIFE', sub: '', t: 0, life: 1.6, small: true };
    }
  };
  Game.award = function (v, x, y) {
    this.addScore(v);
    if (x !== undefined && v >= 150) FX.text(x - this.cam.x, y - 14, '+' + U.fmt(v), '#ffffff', v >= 1000 ? 22 : 14);
  };

  /* ---------- stage setup ---------- */
  Game.startStage = function (n) {
    const P = this.player, st = this.st = St.gen(n);
    this.stageNo = n; this.cam = { x: 0 }; this.locked = false; this.evIdx = 0;
    this.en = []; this.eb = []; this.pb = []; this.caps = []; this.boss = null; this.bossState = null; this.state = 'play';
    Object.assign(P, { x: 120, y: FL, vx: 0, vy: 0, alive: true, invuln: 2.4, onGround: true });
    this.banner = { text: 'STAGE ' + n, sub: St.THEMES[st.theme].name, t: 0, life: 2.4 };
    if (!this.demo) A.music('play', n >= 3 ? 2 : 1, [0, 2, -2, 3, 5][st.theme]);
  };
  Game.groundY = function () { return FL; };

  /* ---------- platform physics shared by the player and ground enemies ---------- */
  Game.phys = function (e, dt) {
    const prev = e.y;
    e.vy = Math.min(C.MAXFALL, e.vy + C.GRAV * dt);
    e.x += e.vx * dt; e.y += e.vy * dt;
    e.onGround = false;
    if (e.vy < 0) return;
    for (const p of this.st.plats) {
      if (e.x < p.x0 - 5 || e.x > p.x1 + 5) continue;
      if (e.dropT > 0 && !p.solid) continue;
      if (prev <= p.y + 2 && e.y >= p.y) { e.y = p.y; e.vy = 0; e.onGround = true; e.platSolid = p.solid; break; }
    }
  };

  /* ---------- bullets and capsules ---------- */
  Game.ebullet = function (x, y, vx, vy, extra) {
    if (this.eb.length > 44) return;
    this.eb.push(Object.assign({ x, y, vx, vy, ay: 0, r: 5, life: 5, dead: false }, extra || {}));
  };
  Game.clearBullets = function (fxOn) {
    if (fxOn) for (const b of this.eb) FX.sparks(b.x - this.cam.x, b.y, 2, 80, 'hsla(320,100%,65%,1)', 0.3, 1.2);
    this.eb.length = 0;
  };
  Game.dropCap = function (x, y, letter) { this.caps.push({ x, y: y + 8, vx: 0, vy: -320, letter, t: 0, life: 14, onGround: false }); };
  Game.collect = function (c) {
    const P = this.player, L = c.letter, info = GFX.art.CAPS[L];
    A.sfx.capsule(); FX.sparks(c.x - this.cam.x, c.y, 10, 150, 'hsla(50,100%,70%,1)', 0.45);
    FX.text(P.x - this.cam.x, P.y - 60, info.name, info.c, 15);
    if (L === 'R') P.rapid = true; else if (L === 'B') P.shield = 12; else if (L === '1UP') { this.lives = Math.min(9, this.lives + 1); A.sfx.extraLife(); } else P.weapon = L;
    this.addScore(200);
  };

  /* ---------- the astronaut ---------- */
  Game.killPlayer = function () {
    const P = this.player;
    if (!P.alive || P.invuln > 0 || P.shield > 0 || (G.debug && G.debug.god)) return;
    P.alive = false; P.weapon = 'N'; P.rapid = false;
    FX.explosion(P.x - this.cam.x, P.y - 20, 1.7, 15); A.sfx.playerDie(); FX.addShake(7); FX.doFlash(0.25, '255,200,200');
    if (!G.cheat.inf) this.lives--;
    if (this.lives <= 0) { this.over = true; this.overT = 2.2; A.music('off'); setTimeout(() => A.sfx.gameOver(), 600); }
    else this.player.respawn = 1.5;
  };
  Game.respawnPlayer = function () {
    const P = this.player;
    let x = this.cam.x + 110;
    for (let cx = this.cam.x + 90; cx < this.cam.x + 600; cx += 20) if (this.st.plats.some((p) => cx > p.x0 + 10 && cx < p.x1 - 10 && p.y >= FL - 110)) { x = cx; break; }
    Object.assign(P, { x, y: -50, vx: 0, vy: 0, alive: true, invuln: 2.8, onGround: false, jumped: false, prone: false });
  };
  const WEAPON = { N: { rate: 4.2 }, M: { rate: 9 }, S: { rate: 3.2 }, L: { rate: 3 }, F: { rate: 5.2 } };
  Game.shoot = function (P) {
    const f = P.face, a = P.aim, dx = Math.cos(a) * f, dy = Math.sin(a), ox = P.x + f * 4 + dx * 22, oy = P.y - (P.prone ? 10 : 22) + dy * 22, ang = Math.atan2(dy, dx);
    const w = P.weapon, shot = (da, sp, dmg, kind, life, extra) => this.pb.push(Object.assign({ x: ox, y: oy, vx: Math.cos(ang + da) * sp, vy: Math.sin(ang + da) * sp, ang: ang + da, dmg, kind, life, r: 5, pierce: false, hit: null, dead: false, t: 0 }, extra || {}));
    if (w === 'N') { if (this.pb.filter((b) => b.kind === 'N').length >= 4) return; shot(0, 640, 1, 'N', 0.9); }
    else if (w === 'M') shot(U.rand(-0.04, 0.04), 660, 1, 'M', 0.9);
    else if (w === 'S') for (const da of [-0.36, -0.18, 0, 0.18, 0.36]) shot(da, 580, 1, 'S', 0.75);
    else if (w === 'L') shot(0, 950, 2.4, 'L', 0.3, { pierce: true, hit: [], r: 7 });
    else shot(0, 430, 1.4, 'F', 0.8, { r: 9, ph: Math.random() * TAU });
    P.fireCd = 1 / (WEAPON[w].rate * (P.rapid ? 1.6 : 1));
    A.sfx.gun(w);
  };

  Game.updatePlayer = function (dt, inp) {
    const P = this.player;
    P.t += dt;
    if (P.invuln > 0) P.invuln -= dt;
    if (P.shield > 0) P.shield -= dt;
    if (P.dropT > 0) P.dropT -= dt;
    if (!P.alive) { P.respawn -= dt; if (P.respawn <= 0 && !this.over) this.respawnPlayer(); return; }
    const run = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
    P.moving = run !== 0 && P.onGround; if (run) P.face = run;
    P.prone = P.onGround && inp.d && !run;
    P.vx = P.prone ? 0 : run * C.RUN;
    if (inp.jump) {
      if (P.onGround && inp.d && !P.platSolid) { P.dropT = 0.3; P.onGround = false; P.vy = 120; }
      else if (P.onGround && !P.prone) { P.vy = C.JUMP; P.onGround = false; P.jumped = true; A.sfx.jump(); }
    }
    this.phys(P, dt);
    if (P.onGround) P.jumped = false;
    P.x = U.clamp(P.x, this.cam.x + 14, this.cam.x + W - 14);
    P.phase += dt * 14;
    P.aim = P.prone ? 0 : inp.u ? (run ? -Math.PI / 4 : -Math.PI / 2) : inp.d && (!P.onGround || run) ? (run ? Math.PI / 4 : Math.PI / 2) : 0;
    P.fireCd -= dt;
    if (inp.fire && P.fireCd <= 0) this.shoot(P);
    if (P.y > H + 70) { P.invuln = 0; P.shield = 0; this.killPlayer(); }
  };

  Game.hurtBox = function () {
    const P = this.player, spin = P.jumped && !P.onGround;
    return P.prone ? { x0: P.x - 17, x1: P.x + 17, y0: P.y - 14, y1: P.y } : spin ? { x0: P.x - 10, x1: P.x + 10, y0: P.y - 30, y1: P.y - 6 } : { x0: P.x - 8, x1: P.x + 8, y0: P.y - 38, y1: P.y };
  };

  /* ---------- bullets, capsules, contact ---------- */
  Game.updateBullets = function (dt) {
    const cam = this.cam.x;
    for (const b of this.pb) {
      b.t += dt;
      if (b.kind === 'F') { const wob = Math.cos(b.t * 18 + b.ph) * 150 * dt; b.x += -Math.sin(b.ang) * wob; b.y += Math.cos(b.ang) * wob; }
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < cam - 80 || b.x > cam + W + 80 || b.y < -80 || b.y > H + 80) { b.dead = true; continue; }
      for (const e of this.en) {
        if (e.dead) continue;
        const bx = E.box(e);
        if (b.x + b.r < bx.x0 || b.x - b.r > bx.x1 || b.y + b.r < bx.y0 || b.y - b.r > bx.y1) continue;
        if (b.pierce) { if (b.hit.indexOf(e.id) >= 0) continue; b.hit.push(e.id); }
        E.damage(this, e, b.dmg, b);
        if (!b.pierce) { b.dead = true; break; }
      }
      if (!b.dead && this.boss && this.boss.state === 'fight') { b.bt = (b.bt || 0) - dt; if (b.bt <= 0 && Bo.hit(this, this.boss, b)) { b.bt = 0.1; if (!b.pierce) b.dead = true; } }
    }
    this.pb = this.pb.filter((b) => !b.dead);
    const hb = this.hurtBox(), P = this.player;
    for (const b of this.eb) {
      b.vy += b.ay * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
      if (b.life <= 0 || b.x < cam - 100 || b.x > cam + W + 100 || b.y < -100 || b.y > H + 40) { b.dead = true; continue; }
      if (P.alive && b.x + b.r > hb.x0 && b.x - b.r < hb.x1 && b.y + b.r > hb.y0 && b.y - b.r < hb.y1) { b.dead = true; this.killPlayer(); }
    }
    this.eb = this.eb.filter((b) => !b.dead);
    for (const c of this.caps) {
      c.t += dt; c.life -= dt; this.phys(c, dt);
      if (c.onGround) c.vx *= 0.9;
      if (P.alive && Math.hypot(P.x - c.x, (P.y - 18) - (c.y - 8)) < 28) { c.dead = true; this.collect(c); }
      if (c.life <= 0 || c.y > H + 60) c.dead = true;
    }
    this.caps = this.caps.filter((c) => !c.dead);
    if (P.alive) {
      for (const e of this.en) {
        if (e.dead || e.type === 'pod') continue;
        const bx = E.box(e);
        if (bx.x1 > hb.x0 + 3 && bx.x0 < hb.x1 - 3 && bx.y1 > hb.y0 + 3 && bx.y0 < hb.y1) { this.killPlayer(); break; }
      }
      if (this.boss && P.alive && Bo.touches(this, this.boss, P)) this.killPlayer();
    }
  };

  /* ---------- main update ---------- */
  Game.update = function (dt) {
    this.time += dt;
    if (this.banner) { this.banner.t += dt; if (this.banner.t > this.banner.life) this.banner = null; }
    if (this.state === 'clear') { this.timer -= dt; FX.update(dt); this.updatePlayer(dt, { l: false, r: false, u: false, d: false, fire: false, jump: false }); if (this.timer <= 0) this.startStage(this.stageNo + 1); return; }
    const inp = this.demo ? this.autopilot() : { l: I.l, r: I.r, u: I.u, d: I.d, fire: I.fire, jump: I.takeJump() };
    this.updatePlayer(dt, inp);
    const P = this.player, st = this.st, prev = this.cam.x;
    if (!this.locked) {
      this.cam.x = Math.max(this.cam.x, P.x - 380);
      if (this.cam.x >= st.arenaX) { this.cam.x = st.arenaX; this.locked = true; }
    }
    if (this.cam.x !== prev) FX.shift(-(this.cam.x - prev), 0);
    while (this.evIdx < st.events.length && st.events[this.evIdx].x <= this.cam.x + W + 60) E.runEvent(this, st.events[this.evIdx++]);
    E.update(this, dt);
    if (this.boss) Bo.update(this, this.boss, dt);
    this.updateBullets(dt);
    FX.update(dt);
    this.flow(dt);
    if (this.over) {
      this.overT -= dt;
      if (this.overT <= 0) {
        if (this.demo) this.reset(true, 1);
        else if (!this.overDone) { this.overDone = true; if (this.onOver) this.onOver(); }
      }
    }
    if (this.demo && this.time > 110) { this.time = 0; this.reset(true, 1); }
  };

  Game.flow = function (dt) {
    if (this.over) return;
    if (this.locked && !this.bossState) {
      this.bossState = 'warn'; this.timer = 2.4;
      this.banner = { text: 'WARNING', sub: C.BOSS_NAMES[this.st.boss], t: 0, life: 2.4, warn: true };
      if (!this.demo) { A.sfx.warning(); A.music('boss', 3, [0, 2, -2, 3, 5][this.st.theme]); }
    } else if (this.bossState === 'warn') {
      this.timer -= dt;
      if (this.timer <= 0) { this.boss = Bo.create(this, this.stageNo); this.bossState = 'fight'; }
    } else if (this.bossState === 'fight' && this.boss && this.boss.state === 'done') this.beginClear();
  };
  Game.beginClear = function () {
    this.state = 'clear'; this.timer = 3.2;
    this.clearBullets(true);
    for (const e of this.en) { const c = E.center(e); FX.explosion(c.x - this.cam.x, c.y, 0.9, E.T[e.type].hue); }
    this.en = []; this.boss = null;
    const bonus = this.demo ? 0 : 5000 + 1000 * this.stageNo;
    if (bonus) { this.addScore(bonus); A.sfx.stageClear(); }
    this.banner = { text: 'STAGE ' + this.stageNo + ' CLEAR', sub: bonus ? 'BONUS  +' + U.fmt(bonus) : '', t: 0, life: 2.9 };
  };

  /* attract-mode soldier: run right, gun blazing, hop over pits and things in the way */
  Game.autopilot = function () {
    const P = this.player;
    let jump = false, up = false;
    const ahead = P.x + 70, gap = !this.st.plats.some((p) => p.solid && ahead > p.x0 && ahead < p.x1);
    if (P.onGround && gap) jump = true;
    for (const e of this.en) { if (e.dead) continue; const dx = e.x - P.x, c = E.center(e); if (e.type !== 'pod' && dx > 0 && dx < 110 && Math.abs(c.y - (P.y - 20)) < 40 && P.onGround) jump = true; if (c.y < P.y - 110 && Math.abs(dx) < 260) up = true; }
    return { l: false, r: !this.locked || this.player.x < this.st.arenaX + 600, u: up, d: false, fire: true, jump };
  };

  /* ---------- rendering (logical 960x540 space) ---------- */
  Game.hasBackdrop = true;
  Game.drawBackdrop = function (ctx) {
    const th = this.st.theme, cam = this.cam.x, A2 = GFX.art, h = St.THEMES[th].h;
    // far sky is full height; the mountains and flora only occupy the lower part of their tiles, so only that strip is blitted
    for (const [idx, k, sy] of [[0, 0.08, 0], [1, 0.3, 170], [2, 0.62, H - 190]]) {
      const tile = A2.layer(th, idx), off = -(((cam * k) % 1024) + 1024) % 1024, sh = H - sy;
      ctx.drawImage(tile, 0, sy, 1024, sh, off, sy, 1024, sh); ctx.drawImage(tile, 0, sy, 1024, sh, off + 1024, sy, 1024, sh);
    }
    const tile = A2.ground(th);
    for (const p of this.st.plats) {
      const x0 = Math.max(p.x0 - cam, -30), x1 = Math.min(p.x1 - cam, W + 30);
      if (x1 <= x0) continue;
      if (p.solid) {
        ctx.save(); ctx.beginPath(); ctx.rect(x0, p.y, x1 - x0, H - p.y); ctx.clip();
        for (let wx = Math.floor((cam + x0) / 128) * 128; wx < cam + x1; wx += 128) ctx.drawImage(tile, wx - cam, p.y);
        ctx.restore();
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; if (p.x1 - cam < W + 30) ctx.fillRect(x1 - 5, p.y, 5, H - p.y); if (p.x0 - cam > -30) ctx.fillRect(x0, p.y, 5, H - p.y);
      } else {
        ctx.fillStyle = GFX.lg(ctx, 0, p.y, 0, p.y + 12, [[0, U.hsl(h, 45, 52)], [1, U.hsl(h, 45, 18)]]); ctx.fillRect(x0, p.y, x1 - x0, 11);
        ctx.fillStyle = U.hsl(h, 90, 70, 0.9); ctx.fillRect(x0, p.y, x1 - x0, 2.5);
        const g2 = ctx.createLinearGradient(0, p.y + 11, 0, p.y + 34); g2.addColorStop(0, U.hsl(h, 90, 60, 0.28)); g2.addColorStop(1, U.hsl(h, 90, 60, 0));
        ctx.fillStyle = g2; ctx.fillRect(x0, p.y + 11, x1 - x0, 23);
      }
    }
  };

  Game.render = function (ctx) {
    const spr = GFX.spr, cam = this.cam.x, P = this.player;
    E.draw(ctx, this);
    if (this.boss) Bo.draw(ctx, this, this.boss);
    FX.drawNorm(ctx);
    for (const c of this.caps) {
      const x = c.x - cam;
      ctx.globalCompositeOperation = 'lighter'; GFX.drawGlow(ctx, 'hsla(50,100%,65%,1)', x, c.y - 8, 28, 0.4 + 0.12 * Math.sin(c.t * 8)); ctx.globalCompositeOperation = 'source-over';
      GFX.draw(ctx, spr.cap[c.letter], x, c.y - 10, 0, 1, 1, c.life < 3 ? (Math.floor(c.t * 8) % 2 ? 0.4 : 1) : 1);
    }
    for (const b of this.eb) { const k = b.r / 5.5; GFX.draw(ctx, spr.eb, b.x - cam, b.y, 0, k, k); }
    for (const b of this.pb) {
      const x = b.x - cam;
      if (b.kind === 'L') {
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        const ex = Math.cos(b.ang) * 38, ey = Math.sin(b.ang) * 38;
        for (const [w, c] of [[11, 'rgba(90,180,255,0.35)'], [4, 'rgba(255,255,255,0.95)']]) { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(x - ex, b.y - ey); ctx.lineTo(x + ex, b.y + ey); ctx.stroke(); }
        ctx.globalCompositeOperation = 'source-over';
      } else if (b.kind === 'F') { ctx.globalCompositeOperation = 'lighter'; GFX.drawGlow(ctx, 'hsla(30,100%,60%,1)', x, b.y, 20, 0.5); ctx.globalCompositeOperation = 'source-over'; GFX.draw(ctx, spr.fire, x, b.y, 0, 1, 1); }
      else GFX.draw(ctx, b.kind === 'S' ? spr.bS : b.kind === 'M' ? spr.bM : spr.bN, x, b.y, b.ang, 1, 1);
    }
    if (P.alive) {
      const blink = P.invuln > 0 ? (Math.floor(P.t * 16) % 2 ? 0.35 : 0.9) : 1;
      ctx.globalAlpha = blink;
      GFX.art.drawAstro(ctx, { x: P.x - cam, y: P.y, face: P.face, aim: P.aim, phase: P.phase, prone: P.prone, spin: P.jumped && !P.onGround, air: !P.onGround, moving: P.moving, t: P.t });
      ctx.globalAlpha = 1;
      if (P.shield > 0) {
        const low = P.shield < 3 && Math.floor(P.t * 8) % 2;
        ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,140,255,' + (low ? 0.3 : 0.8) + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(P.x - cam, P.y - 20, 30, 0, TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(190,120,255,0.14)'; ctx.fill(); ctx.globalCompositeOperation = 'source-over';
      }
    }
    ctx.globalCompositeOperation = 'lighter';
    FX.drawAdd(ctx);
    ctx.globalCompositeOperation = 'source-over';
    FX.drawText(ctx);
  };
})((window.SGS = window.SGS || {}));
