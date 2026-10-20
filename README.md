# Inverted

A 3D zero-gravity shooter that runs in the browser. You and 100 bots float inside a huge white box full of floating blocks. Swim through the air, propel yourself into fights, and when the lights flash red, gravity flips and everyone slams onto the ceiling to fight upside down. Red flying blocks zoom around the box and knock out anyone they touch, blue booster pads launch you across it, and every gun has infinite ammo. Last one floating wins, and every elimination heals you and adds shield. You start every match with the Mirror Fractal Guns and the Bouncer Ball. Vending machines on the floor and ceiling sell an RPG (5 elims), a Grenade Launcher vest (10 elims), the Mirror Fractal Guns (15 elims, two golden pistols that shoot bouncing light) and the Bouncer Ball armour (20 elims, Q to bounce around the box for 5 seconds, 1 minute to recharge) for the elims you have earned. They also sell a Paintball Gun (10 elims): full-auto paintballs in bright colours that splat on the walls and blocks.

**Play online:** https://ketchupsauce86.github.io/RandomProject/ (updates automatically about a minute after `main` changes; hard refresh with Ctrl+Shift+R to get the newest version).

Needs a keyboard and mouse. The **Armory** button shows every gun design, and its **Pickaxes** tab shows 100 pickaxes in 3D across ten themed sets. Open the **Locker** to equip a pickaxe or one of 56 original skins in nine themes, each with repainted armor and 3D gear like capes, hats, hair, wings and halos. The bots wear them too. Turn on **Random each match** in the Locker to get a surprise pickaxe or skin (or both) every match.

## Controls

| Key | Action |
| --- | --- |
| WASD | Swim toward where you look |
| Mouse | Look |
| Space / C | Swim up / down (Space jumps off the ceiling) |
| Shift | Propel forward fast (uses the stamina bar); sprint on the ceiling |
| Left click | Shoot, swing pickaxe, drink a potion |
| Right click | Aim down sights |
| 1–9 / wheel | Switch slots |
| E | Use a vending machine |
| Q | Bouncer Ball |
| R | Reload MF Guns |

## Code

The game is written in **TypeScript** in `src/`, and bundled into `game.js`, which `index.html` loads. `game.js` is committed so GitHub Pages can serve the game as plain files, so rebuild it whenever you change `src/`:

```
npm install        # once: TypeScript and esbuild
npm run check      # type-check src/
npm run build      # bundle src/ into game.js
npm run watch      # rebuild on every save while you work
```

Other files:

- `skins.js`: the skins (`window.SKINS`).
- `pickaxes.js`: the pickaxes (`window.PICKAXES`).
- `ui.js`: the home screen polish: version badge, What's new list, a GLSL glitch-light layer and GSAP motion.
- `soldier.js`: the character rig, packed as base64 glTF.
- `version.js`: the version badge (see below).
- `sounds/` and `sounds.js`: recorded sound effects that replace synthesized ones (see below).

## Sounds

Every sound starts out synthesized in code (the `BANK` list in `src/game.ts`), and any of them can be swapped for a real recording. Put the file in `sounds/`, named after the bank sound it replaces, with a take number if you have several versions (the game picks one at random each time):

```
sounds/pistol-1.ogg   sounds/pistol-2.ogg   sounds/boom-1.ogg
```

Then list it for the game (no rebuild of `game.js` needed):

```
python3 tools/sound_manifest.py
```

This rewrites `sounds.js`. Recordings still get the game's 3D panning, distance muffling, reverb and random pitch, and are levelled to match the synth mix. If a file is missing or can't be decoded, the synthesized version plays instead. Use `.ogg` or `.mp3`, keep each file short and small, only use sounds you're allowed to share (CC0 is easiest), and credit them in `sounds/CREDITS.md`.

## Version

The version badge in the top-right corner of the home screen opens a **What's new** list, and the pause screen shows the version too. Every merged pull request is one release (v1.13.0 is the 13th). Before opening a pull request, stamp the next version:

```
python3 tools/stamp_version.py --next "Short title of this release"
```

This rewrites `version.js` from the game's git history.

## Built with

TypeScript, HTML and CSS, GLSL shaders (the glitch light on the home screen in `ui.js`), and Python (the version stamper). Libraries: three.js r128 for the 3D world (with its GLTFLoader and SkeletonUtils, loaded from cdnjs and jsDelivr) and GSAP for the home screen motion. esbuild bundles the TypeScript.

Most sound is synthesized live in the browser with the Web Audio API, with a few CC0 recordings from Kenney in `sounds/`. Each gun has its own layered shot, plus reload steps, distant echoes and bullet whizzes. Sounds in the world are panned left and right, muffled with distance, and arrive later from far away. When your health drops to 35 or below you hear your heartbeat, faster and louder the lower it gets. The home screen and pause screen have a volume slider.

Characters use the Soldier model and its Idle, Walk, Run and T-Pose motion-capture clips from the three.js examples (animations from Mixamo), packed into `soldier.js`. Swimming, propelling, aiming, recoil and drinking are layered on top live, with two-bone inverse kinematics for the arms and legs.
