# Game memory (project notes for Claude)

## Owner & working style
- Owner: Kash. Be really, really nice. Do everything yourself — no subagents.
- Every new feature goes into BOTH modes: **Zero-G Box** and **Storm Island**.
- Flow: branch `claude/charming-cray-54vvkc` reset from `origin/main` → draft PR → on "merge": mark ready, merge, unsubscribe.
- Keep it original: no copyrighted characters, no real players' names, no copied Fortnite emotes.

## Tech
- three.js r128 + TypeScript (`src/game.ts`) bundled by esbuild into `game.js`. No `CapsuleGeometry` in r128.
- `skins.js`: `S(name,theme,rarity,{...})` + `gear(T,kind,a,mats,opt)`; helpers toonHead, pumpkinHead, reindeerHead, nutHead, treeBody, ghostBody, snowpal, INKED outlines, TN toon mats; `hide` hides the soldier.
- `pickaxes.js`: ANIME items; renames migrate via `PICK_RENAMED` in game.ts.
- Guns: `GUNV` variants read via `WI(item)`. Emotes: `EMOTES`, `EM_ORDER`, `EM_IC`.
- Release: `python3 tools/stamp_version.py --next`, add a `news.js` entry, update `version.js`.
- Test: `python3 -m http.server` + Playwright; `__game.pwGo`, `brOpenChest`, `setState('frozen')` + `update(1/60)`.

## History
- v1.46 Christmas skins · v1.47 weapon holds/emote hands/power-up FX · v1.48 remastered FX
- v1.49 cookie Gingerbread Man + ink outlines · v1.50 Storm Island skydive/glide/crash anims
- v1.51 bigger Storm Island, 7 kingdoms, made-up gamer tags · v1.52 Arsenal: 50 guns + K-key store
- v1.53 Arsenal in Armory · v1.54 unique look per gun
- v1.55 Shifting Halls: bigger moving Zero-G box, spikes, ZG chests, all guns in chests/vending
- v1.56 Profile, stats, local season ladder (no backend) · v1.57 Flurry the Snowpal
- v1.58 skin themes trimmed to heroes, anime, Halloween, Christmas
- v1.59 Christmas/Halloween rebuilt (Dasher the Reindeer, Jingle the Elf)
- v1.60 original Heroes & Anime cast · v1.61 MF guns don't home, removed from loadout, harder bots
- v1.62 six original emotes · v1.63 original anime pickaxes (Shadow Kunai, Elastic Fists, Calm Fist,
  Radiant Surge, Colossus Form, Tidecutter Blade, Spell Tome) + closer camera
