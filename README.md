# SpaceContra

A free, retro-flavored run-and-gun platformer in chunky pixel art, with a head nod to the classic 8-bit arcade shooters. A little astronaut runs, jumps and shoots across strange alien worlds overrun by invaders, grabs weapon capsules, and takes down a giant boss at the end of every stage.

**Play it in your browser:** https://nbwillcox.github.io/SpaceContra/

Everything is generated in code: the pixel-art sprites, backdrops and terrain are built at startup by a tiny software rasteriser, and all sound effects and music are synthesized with the Web Audio API. There are no image or audio files and no build step. A sibling of [SpaceGalaShooter](https://github.com/nbwillcox/SpaceGalaShooter), [SpaceCentiShooter](https://github.com/nbwillcox/SpaceCentiShooter), [SpaceVaderShooter](https://github.com/nbwillcox/SpaceVaderShooter), [SpaceStroids](https://github.com/nbwillcox/SpaceStroids), [SpaceCommand](https://github.com/nbwillcox/SpaceCommand), [lightCycles](https://github.com/nbwillcox/lightCycles), [SpaceRoboShooter](https://github.com/nbwillcox/SpaceRoboShooter), [SpaceBricks](https://github.com/nbwillcox/SpaceBricks), [SpaceSidePews](https://github.com/nbwillcox/SpaceSidePews), [SpaceFrogger](https://github.com/nbwillcox/SpaceFrogger) and [SpaceDug](https://github.com/nbwillcox/SpaceDug), with the same look and feel.

## Controls

| Action | Keys |
| --- | --- |
| Run left / right | `←` `→` or `A` `D` |
| Aim up (up-forward while running) | `↑` or `W` |
| Aim down (down-forward while running or in the air), lie prone on the ground | `↓` or `S` |
| Fire (hold to keep firing) | `X`, `J` or left mouse button |
| Jump | `Space`, `Z` or `K` |
| Drop through a ledge | `↓` + jump |
| Pause | `P` or `Esc` |

Desktop browsers with a keyboard only for now. The playfield stretches to fill the whole window, so ultrawide screens simply show more of the world. There is a secret code on the keyboard too: up, up, down, down, B, A, right, shift, enter.

## Gameplay

- You have 3 lives and any hit is fatal. A new life drops in from the top with a few seconds of invulnerability, but you lose your weapon power-ups.
- Run to the right through ridges, ice caverns, magma fields, hive worlds and steel fortresses. Jump the pits, hop up to the floating ledges and keep shooting. Hold jump for a full leap or tap it for a short hop.
- **Every stage is different:** each world mixes its own stretches of floor and ways to cross the gaps between them.
  - **Platforms:** stepping stones, hovering platforms that slide or lift, crumbling slabs that fall a moment after you land, energy platforms that blink in and out, and spring pads that fling you onto high ledges.
  - **Traps:** spike strips, flame and plasma jets (watch for the warning flicker), and spikes or boulders that drop when you walk under them.
- **Aliens:** runners rush you (some shoot), snipers pick you off from ledges, turrets and pillboxes guard the path, swooping flyers dive in, and leapers jump at you.
- **Weapon capsules** come from flying pods (shoot them open) and pillboxes:
  - **S** Spread shot
  - **M** Machine gun
  - **L** Piercing laser
  - **F** Flame spiral
  - **R** Rapid fire (faster firing for any weapon)
  - **B** Barrier (a short burst of invincibility)
  - **1UP** Extra life
- **Bosses** wait at the end of every stage: the Defense Wall (knock out the cannons, then the core), the Iron Walker (jump the shockwaves, shoot the head for double damage), the Alien Heart (it only takes damage when it opens up) and the Mothership. Then it all loops, tougher each time.
- Extra lives at 20,000 and 50,000 points, and local top-10 high scores with arcade-style 3-letter initials (stored in your browser).

## Run locally

It is plain HTML/CSS/JS. Either open `index.html` directly, or serve the folder:

```bash
python -m http.server 8000
```

then visit http://localhost:8000. Add `?stage=N` to the URL to start at stage N.

## License and attribution

Licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/): free to play, share and remix **non-commercially**, as long as you give credit and **link back to this repository**: https://github.com/nbwillcox/SpaceContra

This is an original game inspired by classic arcade shooters. It uses no assets, names or code from any existing game.
