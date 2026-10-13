/* Touch controls for SpaceContra: a floating stick (run, aim up/down and diagonals, crouch), FIRE and JUMP (hold for a higher jump), pause. Read by js/mobile.js. */
window.TOUCH_CFG = {
  id: 'spacecontra', title: 'SpaceContra', orient: 'landscape', accent: '#ff6a3d',
  hint: '<b>Left thumb</b>: floating stick to run and aim &nbsp; <b>Right thumb</b>: <b>FIRE</b> and <b>JUMP</b> &nbsp; down + jump drops through a ledge',
  unlock: () => window.SGS && window.SGS.audio && window.SGS.audio.resume(),
  pause: { pos: { r: 12, t: 46 } },                                                /* just under the HUD bar */
  controls: [
    { t: 'stick', id: 'run', zone: [0, 0.18, 0.5, 1], mode: '8', keys: { l: 'ArrowLeft', r: 'ArrowRight', u: 'ArrowUp', d: 'ArrowDown' }, r: 56 },
    { t: 'btn', id: 'fire', label: 'FIRE', key: 'KeyX', hold: true, size: 84, pos: { r: 18, b: 26 } },
    { t: 'btn', id: 'jump', label: 'JUMP', key: 'Space', hold: true, size: 84, pos: { r: 120, b: 66 } },
  ],
};
