/* Stage generation: a floor with pits, floating ledges and bridges, scripted enemy groups, flying capsule pods and a boss arena at the end. */
(function (G) {
  'use strict';
  const U = G.U, C = G.C;
  const St = {};
  G.stage = St;
  const FL = C.FLOOR;
  St.THEMES = [{ h: 125, name: 'JUNGLE RIDGE' }, { h: 195, name: 'ICE CAVERNS' }, { h: 22, name: 'MAGMA FIELDS' }, { h: 318, name: 'HIVE WORLD' }, { h: 215, name: 'STEEL FORTRESS' }];
  St.themeIdx = (n) => (n - 1) % 5;
  St.bossIdx = (n) => (n - 1) % 4;
  St.cycle = (n) => Math.floor((n - 1) / 4);

  St.gen = function (n) {
    const rnd = G.gfx.mulberry(n * 7717 + 3), ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), d = Math.min(3.2, 1 + (n - 1) * 0.16);
    const len = 6000 + 350 * Math.min(6, n), arenaX = len - 900, plats = [], events = [];
    let x = 0, seg = 0, podX = 700;
    const letters = ['S', 'S', 'S', 'M', 'M', 'L', 'L', 'F', 'F', 'R', 'R', 'B'];
    while (x < arenaX - 700) {
      const L = seg === 0 ? 1000 : ri(480, 900);
      plats.push({ x0: x, x1: x + L, y: FL, solid: true });
      const ledges = [];
      if (seg > 0 && rnd() < 0.75) { const w = ri(190, 330), lx = x + ri(60, Math.max(61, L - w - 40)); const p = { x0: lx, x1: lx + w, y: FL - 100, solid: false }; plats.push(p); ledges.push(p); if (rnd() < 0.5) { const w2 = ri(150, 260), p2 = { x0: lx + ri(20, Math.max(21, w - 100)), x1: 0, y: FL - 200, solid: false }; p2.x1 = p2.x0 + w2; plats.push(p2); ledges.push(p2); } }
      const groups = Math.max(1, Math.floor((L - 200) / (300 / Math.sqrt(d))));
      for (let i = 0; i < groups; i++) {
        const ex = x + 220 + (L - 360) * (i + rnd() * 0.5) / groups;
        if (seg === 0 && ex < 560) continue;
        const r = rnd(), onLedge = ledges.length && rnd() < 0.5, lp = onLedge ? U.pick(ledges) : null, ey = lp ? lp.y : FL, exx = lp ? U.clamp(ex, lp.x0 + 30, lp.x1 - 30) : ex;
        if (r < 0.28) events.push({ x: ex, type: 'runners', n: ri(2, 2 + Math.floor(d)), y: FL });
        else if (r < 0.46) events.push({ x: exx, type: 'sniper', y: ey });
        else if (r < 0.60) events.push({ x: exx, type: 'turret', y: ey });
        else if (r < 0.74) events.push({ x: exx, type: 'pillbox', y: ey, cap: rnd() < 0.55 ? U.pick(letters) : null });
        else if (r < 0.88) events.push({ x: ex, type: 'flyers', n: ri(3, 4 + Math.floor(d)) });
        else events.push({ x: ex, type: 'leaper', y: FL });
      }
      while (podX < x + L) { events.push({ x: podX, type: 'pod', letter: n >= 2 && rnd() < 0.05 ? '1UP' : U.pick(letters) }); podX += ri(900, 1300); }
      x += L;
      if (x < arenaX - 700) {
        if (rnd() < 0.55) { x += ri(100, 140); }
        else { const gap = ri(210, 300); plats.push({ x0: x + gap * 0.33 - 45, x1: x + gap * 0.33 + 45, y: FL - 30, solid: false }); plats.push({ x0: x + gap * 0.66 - 45, x1: x + gap * 0.66 + 45, y: FL - 30, solid: false }); x += gap; }
      }
      seg++;
    }
    plats.push({ x0: x - 40, x1: arenaX + 1700, y: FL, solid: true });
    plats.push({ x0: arenaX + 130, x1: arenaX + 340, y: FL - 190, solid: false }, { x0: arenaX + 380, x1: arenaX + 620, y: FL - 100, solid: false });
    events.sort((a, b) => a.x - b.x);
    return { n, len, arenaX, endX: arenaX + 1500, plats, events, theme: St.themeIdx(n), boss: St.bossIdx(n) };
  };
})((window.SGS = window.SGS || {}));
