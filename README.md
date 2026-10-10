# Inverted

A 3D zero-gravity shooter that runs in the browser. You and 50 bots float inside a huge white box full of floating blocks. Swim through the air, propel yourself into fights, and when the lights flash red, gravity flips and everyone slams onto the ceiling to fight upside down. Red flying blocks zoom around the box and knock out anyone they touch, blue booster pads launch you across it, and every gun has infinite ammo. Last one floating wins, and every elimination heals you and adds shield. Vending machines on the floor and ceiling sell an RPG (5 elims) and a Grenade Launcher vest (10 elims) for the elims you have earned.

**Play online:** https://ketchupsauce86.github.io/RandomProject/ (updates automatically about a minute after `main` changes; hard refresh with Ctrl+Shift+R to get the newest version).

Needs a keyboard and mouse. The **Armory** button shows every gun design, and its **Pickaxes** tab shows 100 pickaxes in 3D across ten themed sets. Open the **Locker** to equip a pickaxe or one of 56 original skins in nine themes, each with repainted armor and 3D gear like capes, hats, hair, wings and halos. The bots wear them too.

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

## Version

The version badge in the top-right corner of the home screen opens a **What's new** list, and the pause screen shows the version too. Every merged pull request is one release (v1.13.0 is the 13th). Before opening a pull request, stamp the next version:

```
python3 tools/stamp_version.py --next "Short title of this release"
```

This rewrites `version.js` from the game's git history.

## Built with

TypeScript, HTML and CSS, GLSL shaders (the glitch light on the home screen in `ui.js`), and Python (the version stamper). Libraries: three.js r128 for the 3D world (with its GLTFLoader and SkeletonUtils, loaded from cdnjs and jsDelivr) and GSAP for the home screen motion. esbuild bundles the TypeScript.

All sound is synthesized live in the browser with the Web Audio API, so there are no audio files. Each gun has its own layered shot, plus reload steps, distant echoes and bullet whizzes. Sounds in the world are panned left and right, muffled with distance, and arrive later from far away. The home screen and pause screen have a volume slider.

Characters use the Soldier model and its Idle, Walk, Run and T-Pose motion-capture clips from the three.js examples (animations from Mixamo), packed into `soldier.js`. Swimming, propelling, aiming, recoil and drinking are layered on top live, with two-bone inverse kinematics for the arms and legs.
