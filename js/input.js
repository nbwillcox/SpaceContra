/* Run-and-gun controls. Arrows / WASD run and aim, X / J / click fires, Space / Z / K jumps (down + jump drops through a ledge), P pauses.
   Secret code on the keyboard: up up down down B A right shift enter. */
(function (G) {
  'use strict';
  const I = { l: false, r: false, u: false, d: false, fire: false, _jump: false, jumpHeld: false, _pause: false, _any: false };
  const MAP = { ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r', ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', KeyX: 'fire', KeyJ: 'fire' };
  const JUMPS = new Set(['Space', 'KeyZ', 'KeyK']);
  const GAME_KEYS = new Set([...Object.keys(MAP), ...JUMPS, 'ShiftLeft', 'ShiftRight']);
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'KeyB', 'KeyA', 'ArrowRight', 'Shift', 'Enter'];
  let ci = 0;

  I.takeJump = () => { const b = I._jump; I._jump = false; return b; };
  I.takePause = () => { const b = I._pause; I._pause = false; return b; };
  I.takeAny = () => { const b = I._any; I._any = false; return b; };
  I.clear = () => { I.l = I.r = I.u = I.d = I.fire = I.jumpHeld = false; I._jump = I._pause = I._any = false; };

  function typing(t) { const n = t && t.tagName; return n === 'INPUT' || n === 'TEXTAREA' || n === 'SELECT'; }
  function code(e) {
    const k = e.code === 'ShiftLeft' || e.code === 'ShiftRight' ? 'Shift' : e.code;
    if (k === CODE[ci]) ci++;
    else ci = k === CODE[0] ? 1 : 0;
    if (ci === CODE.length) {
      ci = 0;
      G.cheat.inf = true;
      if (G.audio && G.audio.sfx) G.audio.sfx.extraLife();
      if (G.ui && G.ui.toast) G.ui.toast('CHEAT ON: INFINITE LIVES');
      e.preventDefault();
      return true;
    }
    return false;
  }
  window.addEventListener('keydown', (e) => {
    if (typing(e.target)) return;
    if (!e.repeat && code(e)) return;
    const c = e.code, m = MAP[c];
    if (m) I[m] = true;
    else if (JUMPS.has(c)) { if (!e.repeat) I._jump = true; I.jumpHeld = true; }
    else if ((c === 'KeyP' || c === 'Escape') && !e.repeat) I._pause = true;
    if (!e.repeat) I._any = true;
    if (GAME_KEYS.has(c) && e.target.tagName !== 'BUTTON') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    const m = MAP[e.code];
    if (m) I[m] = false; else if (JUMPS.has(e.code)) I.jumpHeld = false;
  });
  window.addEventListener('blur', () => I.clear());
  I.bind = function (canvas) {
    canvas.addEventListener('mousedown', (e) => { if (e.button === 0) I.fire = true; I._any = true; e.preventDefault(); });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  };
  window.addEventListener('mouseup', (e) => { if (e.button === 0) I.fire = false; });

  G.input = I;
})((window.SGS = window.SGS || {}));
