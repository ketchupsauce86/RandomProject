# Inverted animation pipeline report

Blender 5.3.0, 30 fps, timing x1.00. Built 2026-11-18 02:01.

Rig `InvertedRig`: 20 deform bones (exported), 8 control bones (IK targets and poles, not exported). Mesh `InvertedBlockout`: 152 verts.

| Action | Frames | Range | Loop | Stride per loop (m) | Lowest foot z (m) |
|---|---|---|---|---|---|
| Idle | 60 | 1-60 | yes |  | 0.030 |
| Walk | 32 | 1-32 | yes | 1.17 | 0.030 |
| Run | 20 | 1-20 | yes | 2.00 | 0.030 |
| Jog_Fwd | 24 | 1-24 | yes | 1.60 | 0.030 |
| Jog_Bwd | 24 | 1-24 | yes | 1.60 | 0.030 |
| Jog_Left | 24 | 1-24 | yes | 1.36 | 0.030 |
| Jog_Right | 24 | 1-24 | yes | 1.36 | 0.030 |
| Skip | 24 | 1-24 | yes | 1.44 | 0.030 |
| Jump_Start | 14 | 1-14 | no |  | 0.005 |
| Jump_Air | 20 | 1-20 | yes |  | 0.199 |
| Jump_Land | 18 | 1-18 | no |  | 0.030 |
| Attack_Slash | 28 | 1-28 | no |  | 0.030 |
| Interact | 30 | 1-30 | no |  | 0.030 |
| Death | 35 | 1-35 | no |  | 0.030 |
| Climb | 40 | 1-40 | yes | 0.73 | 0.193 |
| Hurdle | 26 | 1-26 | no |  | 0.023 |
| Swing | 48 | 1-48 | yes |  | 0.018 |
| Crawl | 36 | 1-36 | yes | 0.84 | 0.120 |

Export: `Inverted_Anims.glb` (glTF binary, deform bones only, NLA tracks as animations, sampled every frame, IK baked to FK);
`Inverted_Anims.fbx`: written (NLA strips, no leaf bones, Y-primary bones).
