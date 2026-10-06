# Storm Island

A 3D battle royale that runs in the browser. You and 19 bots are flying over an island in a private jet when an engine catches fire and the jet explodes, throwing everyone clear to glide down. Then you loot chests, harvest materials, build walls, floors and ramps, and outlast the shrinking storm.

**Play online:** https://ketchupsauce86.github.io/RandomProject/ (updates automatically about a minute after `main` changes; hard refresh with Ctrl+Shift+R to get the newest version).

Or open `index.html` in a browser (Chrome or Edge works best), pick a bot difficulty, and click **Drop in**. Needs a keyboard and mouse. The **Armory** button shows every gun design, and its **Pickaxes** tab shows 100 pickaxes in 3D across ten themed sets. Open the **Locker** to equip one: you carry it into every match. Like Fortnite, every pickaxe plays the same (the power-ups are just for fun); when you harvest, hit the glowing blue weak spot for double damage and extra materials. The Locker also has a **Skins** tab with 56 original outfits in nine themes (Superheroes, Anime, Wild West, Cyber Neon, Myth & Fantasy, Space, Special Ops, Street & Sports, Spooky), each with repainted armor and 3D gear like capes, hats, hair, wings and halos. The bots wear them too.

## Controls

| Key | Action |
| --- | --- |
| WASD | Move |
| Mouse | Look |
| Space | Jump / bail out of the jet early / open or close the glider |
| Shift | Sprint |
| W / S while gliding | Dive / brake (the glider follows your mouse; A / D carve) |
| V | Crouch |
| Left click | Shoot, swing pickaxe, place builds |
| Right click | Aim down sights |
| 1–6 / wheel | Switch slots |
| E | Open chests, pick up loot |
| R | Reload |
| Z / X / C | Build wall / floor / ramp |
| Q | Toggle build mode |
| G | Edit a build (click tiles, G to confirm, right-click to reset) |
| F | Swap wood and stone |

All sound is synthesized live in the browser with the Web Audio API, so there are no audio files. Each gun has its own layered shot, plus reload steps, distant echoes and bullet whizzes. Footsteps change with the ground under you (grass, sand, rock, wood and water), and wind, waves, birds, the storm, the jet engine and nearby chests all have their own ambience. Sounds in the world are panned left and right, muffled with distance, and arrive later from far away. The menu and pause screen have a volume slider.

Built with [three.js](https://threejs.org/) r128 plus its GLTFLoader and SkeletonUtils (loaded from cdnjs and jsDelivr).

Characters use the Soldier model and its Idle, Walk, Run and T-Pose motion-capture clips from the three.js examples (animations from Mixamo), packed into `soldier.js`. Arm, leg and spine poses for aiming, crouching, recoil and gliding are solved live with two-bone inverse kinematics. If `soldier.js` is missing, the game falls back to simple block characters.
