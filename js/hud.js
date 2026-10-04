/* HUD, banners and the decorative side panels. */
(function (G) {
  'use strict';
  const U = G.U, C = G.C, GFX = G.gfx, TAU = U.TAU;
  const W = C.W, H = C.H;
  const HUD = {};
  const FONT = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';

  const GS = 2, gcache = new Map();
  function glowText(ctx, s, x, y, size, color, align, weight, glow) {
    const key = s + '|' + size + '|' + color + '|' + weight + '|' + glow;
    let e = gcache.get(key);
    if (!e) {
      if (gcache.size > 120) gcache.clear();
      const f = weight + ' ' + (size * GS) + 'px ' + FONT, c = document.createElement('canvas'), cx = c.getContext('2d');
      cx.font = f;
      const tw = cx.measureText(s).width, pad = 16 * GS;
      c.width = Math.ceil(tw + pad * 2); c.height = Math.ceil(size * GS * 1.5 + pad * 2);
      cx.font = f; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic';
      cx.shadowColor = glow; cx.shadowBlur = 10 * GS; cx.fillStyle = color; cx.fillText(s, pad, pad + size * GS);
      e = { c, tw: tw / GS, pad: pad / GS, by: pad / GS + size };
      gcache.set(key, e);
    }
    const ox = align === 'center' ? -e.tw / 2 : align === 'right' ? -e.tw : 0;
    ctx.drawImage(e.c, x + ox - e.pad, y - e.by, e.c.width / GS, e.c.height / GS);
  }
  function txt(ctx, s, x, y, size, color, align, weight, glow) {
    weight = weight || 800;
    if (glow) { glowText(ctx, s, x, y, size, color, align, weight, glow); return; }
    ctx.font = weight + ' ' + size + 'px ' + FONT;
    ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color; ctx.fillText(s, x, y);
  }
  HUD.txt = txt;

  HUD.draw = function (ctx, g) {
    if (g.demo) return;
    const P = g.player, st = g.st, inf = G.cheat.inf;
    const grad = ctx.createLinearGradient(0, 0, 0, 58);
    grad.addColorStop(0, 'rgba(2,4,18,0.88)'); grad.addColorStop(1, 'rgba(2,4,18,0.1)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, 58);
    txt(ctx, 'SCORE', 18, 15, 11, '#ff6a3d', 'left', 800);
    txt(ctx, U.fmt(g.score), 18, 38, 24, '#ffffff', 'left', 800, 'rgba(120,200,255,0.8)');
    txt(ctx, 'HIGH SCORE', W / 2, 15, 11, '#ff6a3d', 'center', 800);
    txt(ctx, U.fmt(Math.max(g.hi, g.score)), W / 2, 38, 24, '#9fe8ff', 'center', 800, 'rgba(120,200,255,0.8)');
    txt(ctx, 'STAGE ' + g.stageNo, W - 18, 15, 11, '#ff6a3d', 'right', 800);
    txt(ctx, G.stage.THEMES[st.theme].name, W - 18, 36, 14, '#ffffff', 'right', 800, 'rgba(120,200,255,0.6)');
    // lives: helmet icons (or infinity when the code is on)
    for (let i = 0; i < Math.min(inf ? 1 : g.lives, 6); i++) { const x = 188 + i * 22; ctx.fillStyle = '#e8f0ff'; ctx.beginPath(); ctx.arc(x, 28, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#35c8f2'; ctx.beginPath(); ctx.ellipse(x + 3, 28, 4.4, 3.4, 0, 0, TAU); ctx.fill(); }
    txt(ctx, inf ? 'x ∞' : g.lives > 6 ? 'x' + g.lives : '', 214, 33, 14, inf ? '#ffd24a' : '#ffffff', 'left', 800);
    // weapon badge
    const wl = P.weapon, col = wl === 'N' ? '#d8e4ff' : GFX.art.CAPS[wl].c;
    ctx.fillStyle = 'rgba(10,16,40,0.8)'; ctx.fillRect(18, 46, 30, 8); ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.strokeRect(18, 46, 30, 8);
    txt(ctx, wl === 'N' ? 'RIFLE' : GFX.art.CAPS[wl].name, 54, 54, 10, col, 'left', 800);
    if (P.rapid) txt(ctx, 'RAPID', 130, 54, 10, '#d8e8ff', 'left', 800);
    if (P.shield > 0) txt(ctx, 'BARRIER ' + Math.ceil(P.shield), 180, 54, 10, '#c88aff', 'left', 800);
    // progress and boss bar
    if (!g.boss) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(W / 2 - 90, 48, 180, 5); ctx.fillStyle = '#ff6a3d'; ctx.fillRect(W / 2 - 90, 48, 180 * U.clamp(g.cam.x / st.arenaX, 0, 1), 5); }
    else {
      const b = g.boss, k = U.clamp(b.core.hp / b.core.maxhp, 0, 1);
      txt(ctx, b.name, W / 2, 62, 12, '#ffb0a0', 'center', 800);
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(W / 2 - 160, 68, 320, 8); ctx.fillStyle = '#ff5a5a'; ctx.fillRect(W / 2 - 160, 68, 320 * k, 8); ctx.strokeStyle = 'rgba(255,200,190,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(W / 2 - 160, 68, 320, 8);
    }
    HUD.banner(ctx, g);
  };

  HUD.banner = function (ctx, g) {
    const b = g.banner;
    if (!b) return;
    const k = b.t / b.life;
    const a = k < 0.1 ? k / 0.1 : k > 0.82 ? Math.max(0, (1 - k) / 0.18) : 1;
    const sc = 1 + (k < 0.1 ? (0.1 - k) * 3 : 0);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(W / 2, H * 0.36);
    if (b.warn) {
      const flick = Math.floor(b.t * 4) % 2;
      const g2 = ctx.createLinearGradient(0, -50, 0, 50);
      g2.addColorStop(0, 'rgba(255,40,40,0)'); g2.addColorStop(0.5, 'rgba(255,40,40,' + (flick ? 0.5 : 0.28) + ')'); g2.addColorStop(1, 'rgba(255,40,40,0)');
      ctx.fillStyle = g2; ctx.fillRect(-W / 2, -50, W, 100);
      ctx.scale(sc, sc);
      txt(ctx, 'WARNING', 0, 12, 56, flick ? '#ff6a6a' : '#ffffff', 'center', 900, 'rgba(255,40,40,1)');
      txt(ctx, b.sub, 0, 44, 15, '#ffd0d0', 'center', 700);
    } else if (b.small) {
      txt(ctx, b.text, 0, 0, 26, '#7dffb8', 'center', 900, 'rgba(60,255,160,0.9)');
    } else {
      ctx.scale(sc, sc);
      txt(ctx, b.text, 0, 0, b.text.length > 18 ? 30 : 46, '#ffffff', 'center', 900, 'rgba(255,140,90,1)');
      if (b.sub) txt(ctx, b.sub, 0, 36, 22, '#ffd24a', 'center', 800, 'rgba(255,200,60,0.9)');
    }
    ctx.restore();
  };

  /* decorative panels on wide windows; coords are screen pixels */
  const paintSides = function (ctx, v, g) {
    const sw = v.ox;
    if (sw < 150) return;
    const sc = Math.min(1.15, sw / 240), cx1 = sw / 2, cx2 = v.ox + W * v.s + sw / 2, top = v.oy + 70 * sc;
    const col = 'rgba(160,215,255,0.8)';
    ctx.save();
    txt(ctx, 'SPACE CONTRA', cx1, top, 15 * sc, '#ffffff', 'center', 900, 'rgba(255,140,90,0.9)');
    const help = ['RUN / AIM', 'ARROWS  /  W A S D', 'FIRE', 'X  /  J  /  CLICK', 'JUMP', 'SPACE  /  Z  /  K', 'DROP DOWN', 'DOWN + JUMP', 'PAUSE', 'P  /  ESC'];
    help.forEach((s, i) => txt(ctx, s, cx1, top + 44 * sc + i * 19 * sc, (i % 2 ? 12 : 10) * sc, i % 2 ? col : '#ff6a3d', 'center', i % 2 ? 700 : 800));
    txt(ctx, 'TOP SOLDIERS', cx2, top, 15 * sc, '#ffffff', 'center', 900, 'rgba(255,140,90,0.9)');
    G.scores.list.slice(0, 7).forEach((r, i) => txt(ctx, (i + 1) + '. ' + r.name + '  ' + U.fmt(r.score), cx2, top + 34 * sc + i * 22 * sc, 13 * sc, i === 0 ? '#ffd24a' : col, 'center', 700));
    txt(ctx, 'CAPSULES', cx2, top + 210 * sc, 10 * sc, '#ff6a3d', 'center', 800);
    txt(ctx, 'S SPREAD  M MACHINE GUN', cx2, top + 228 * sc, 11 * sc, col, 'center', 700);
    txt(ctx, 'L LASER  F FLAME', cx2, top + 244 * sc, 11 * sc, col, 'center', 700);
    txt(ctx, 'R RAPID  B BARRIER', cx2, top + 260 * sc, 11 * sc, col, 'center', 700);
    txt(ctx, 'FREE TO PLAY & SHARE', cx2, top + 292 * sc, 10 * sc, '#ff6a3d', 'center', 800);
    txt(ctx, 'github.com/nbwillcox/SpaceContra', cx2, top + 310 * sc, 11 * sc, col, 'center', 700);
    ctx.restore();
  };

  let sideCache = null, sideKey = '';
  HUD.sides = function (ctx, v, g) {
    if (v.ox < 150) return;
    const key = [v.w, v.h, v.rs.toFixed(2), Math.round(v.ox), Math.round(v.oy), v.s.toFixed(3), G.scores.list.slice(0, 7).map((r) => r.name + r.score).join(',')].join('|');
    if (key !== sideKey || !sideCache) {
      sideKey = key;
      const pw = Math.round(v.ox * v.rs), ph = Math.round(v.h * v.rs);
      const full = document.createElement('canvas');
      full.width = Math.round(v.w * v.rs); full.height = ph;
      const x = full.getContext('2d');
      x.scale(v.rs, v.rs);
      paintSides(x, v, g);
      const strip = (sx) => { const c = document.createElement('canvas'); c.width = pw; c.height = ph; c.getContext('2d').drawImage(full, sx, 0, pw, ph, 0, 0, pw, ph); return c; };
      sideCache = { l: strip(0), r: strip(full.width - pw) };
    }
    ctx.drawImage(sideCache.l, 0, 0, v.ox, v.h);
    ctx.drawImage(sideCache.r, v.w - v.ox, 0, v.ox, v.h);
  };

  G.hud = HUD;
})((window.SGS = window.SGS || {}));
