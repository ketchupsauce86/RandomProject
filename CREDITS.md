# Credits

Inverted is made by Kash. These are the outside assets in the game and who made them. Every one of them is
**CC0 1.0 Universal** (public domain, https://creativecommons.org/publicdomain/zero/1.0/), so crediting isn't
required, but they made the game better and deserve a thank you.

## Animations (`packmoves.js`)

The moves are retargeted onto the game's soldier rig by `tools/pack_export_blender.py` and `tools/retarget_moves.py`.
In the game they have their own names (see `PM_EMOTES`, `PM_EMOTES2` and `PM_EMOTES3` in `src/game.ts`). The props they hold
(rollercoaster, gloves, sword and the rest) are made in code from simple shapes, no outside models.

- **Universal Animation Library (Standard)** by **Quaternius** (https://quaternius.com, https://www.patreon.com/quaternius). License: CC0 1.0.
- **Animated Characters: Protagonists** by **Kenney** (https://kenney.nl). License: CC0 1.0.

The walk, sprint, crouch walk and swim in `moves.js` are Quaternius moves too (from the pack's root-motion file, so the
game knows how far each stride goes; `tools/pack_loco_pick.json`). The slide in `moves.js` was made by Kash in Blender.

Since v1.72 the pack clips also play during matches: the dodge roll, sitting at a campfire, kneeling at a workbench,
casting at a shrine, driving a hover kart, treading water, crouching and flinching when hit.

## Sounds (`sounds/`)

A few CC0 sound recordings by **Kenney** (https://kenney.nl). See `sounds/CREDITS.md`.

## Character model and its clips (`soldier.js`)

The Soldier model and its Idle, Walk, Run and T-Pose clips come from the three.js examples (animations from Mixamo).
