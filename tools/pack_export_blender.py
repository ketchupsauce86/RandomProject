"""Export moves from the CC0 animation packs (Quaternius Universal Animation Library, Kenney Animated Characters)
in the same form as the hero moves, so tools/retarget_moves.py can put them on the soldier rig. Credits: CREDITS.md.

The packs themselves are not in the repo (download them free from quaternius.com and kenney.nl). Which moves are taken,
and their names in the game files, is tools/pack_moves_pick.json. Run it with Blender in the background (it opens
its own empty scene), or with the `bpy` Python module (pip install bpy):

    blender -b --factory-startup --python tools/pack_export_blender.py -- tools/pack_moves_export.json.gz \
        tools/pack_moves_pick.json UAL1_Standard.glb run.fbx jump.fbx
    python3 tools/retarget_moves.py          # writes moves.js (Kash's moves) and packmoves.js (these)

pick.json: {"<name>": {"src": "<action>" or ["<action>", ...] played back to back, "loop": 0/1, "pack": "...",
"inplace": 2 for no travel at all (a roll), "trim": [from, to] fractions}, ...}.
For each mapped bone it writes a rest frame whose y axis points down the bone to the next joint (whatever way the pack's
importer laid its bones), and every frame that frame's world rotation, in the hero's space (z up, facing -y, its left
at +x). The hips offset is in hero metres (the hips 0.95 m up at rest), in place: no forward travel.
"""
import bpy, json, re, sys
from mathutils import Matrix, Vector

FPS = 30
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]  # (blender -b ... -- args, or python with the bpy module)
OUT, PICK, FILES = argv[0], json.load(open(argv[1])), argv[2:]

# hero bone: candidate names in the pack (lowercase, letters and digits only, mixamorig: dropped), best first.
# {s} is the side letter (l/r) and {S} the side word (left/right).
CANDS = {
    'hips': ['pelvis', 'hips', 'hip'],
    'spine': ['spine01', 'spine'],
    'chest': ['spine03', 'upperchest', 'spine2', 'chest', 'spine02'],
    'neck': ['neck01', 'neck'],
    'head': ['head'],
    'shoulder': ['clavicle{s}', '{S}shoulder', 'shoulder{s}'],
    'upper_arm': ['upperarm{s}', '{S}arm', '{S}upperarm', 'arm{s}'],
    'forearm': ['lowerarm{s}', '{S}forearm', 'forearm{s}', '{S}lowerarm'],
    'hand': ['hand{s}', '{S}hand'],
    'thigh': ['thigh{s}', '{S}upleg', '{S}upperleg', 'upperleg{s}'],
    'shin': ['calf{s}', '{S}leg', '{S}lowerleg', 'lowerleg{s}', 'shin{s}'],
    'foot': ['foot{s}', '{S}foot'],
}
AIM = {'hips': 'spine', 'spine': 'chest', 'chest': 'neck', 'neck': 'head', 'head': None}
for s in 'LR':
    AIM.update({f'shoulder.{s}': f'upper_arm.{s}', f'upper_arm.{s}': f'forearm.{s}', f'forearm.{s}': f'hand.{s}',
                f'hand.{s}': None, f'thigh.{s}': f'shin.{s}', f'shin.{s}': f'foot.{s}', f'foot.{s}': None})


def norm(n):
    return re.sub(r'[^a-z0-9]', '', n.lower().replace('mixamorig', ''))


def map_bones(arm):
    names = {norm(b.name): b.name for b in arm.data.bones}
    found = {}
    for hb, cands in CANDS.items():
        for side in ([None] if '{s}' not in ''.join(cands) and '{S}' not in ''.join(cands) else ['L', 'R']):
            key = hb if side is None else f'{hb}.{side}'
            found[key] = None
            for c in cands:
                c = c.replace('{s}', (side or '').lower()).replace('{S}', {'L': 'left', 'R': 'right', None: ''}[side])
                if c in names and names[c] not in found.values(): found[key] = names[c]; break
    return found


def end_dir(arm, bone):
    """for a bone at the end of a chain (head, hand, foot): toward its longest-reaching child or its tail"""
    b = arm.data.bones[bone]
    kids = [c for c in b.children if 'twist' not in c.name.lower()]
    if b.name.lower().startswith(('hand', 'wrist')) or 'hand' in b.name.lower():
        mids = [c for c in kids if 'middle' in c.name.lower()]
        if mids: return mids[0].head_local
    if 'foot' in b.name.lower():
        toes = [c for c in kids if 'toe' in c.name.lower() or 'ball' in c.name.lower()]
        if toes: return toes[0].head_local
    return b.tail_local


def export():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.fps = FPS
    out = {'fps': FPS, 'out_fps': FPS, 'rest': None, 'clips': {}, 'meta': {}, 'maps': {}}
    need, seqs = {}, {}  # action name -> its rate in the file (None: as imported); action name -> (frames, rest)
    for w in PICK.values():
        for k in (w['src'] if isinstance(w['src'], list) else [w['src']]): need[k] = w.get('src_fps')
    for f in FILES:
        before = set(bpy.data.objects); before_a = set(bpy.data.actions)
        if f.lower().endswith(('.glb', '.gltf')): bpy.ops.import_scene.gltf(filepath=f)
        else: bpy.ops.import_scene.fbx(filepath=f, automatic_bone_orientation=False)
        file_fps = sc.render.fps / sc.render.fps_base; sc.render.fps = FPS; sc.render.fps_base = 1  # (the importer sets the file's rate)
        arms = [o for o in bpy.data.objects if o not in before and o.type == 'ARMATURE']
        acts = [a for a in bpy.data.actions if a not in before_a]
        print('FILE', f, 'armatures', [a.name for a in arms], 'actions', len(acts))
        if not arms: continue
        arm = arms[0]; bmap = map_bones(arm)
        print('MAP', {k: v for k, v in bmap.items()})
        if any(v is None for v in bmap.values()):
            print('  missing', [k for k, v in bmap.items() if v is None]); continue
        Mw = arm.matrix_world
        rest_w = {hb: (Mw @ arm.data.bones[b].matrix_local) for hb, b in bmap.items()}
        # facing: the hero's left is +x, up is +z
        lft = rest_w['thigh.L'].translation - rest_w['thigh.R'].translation; lft.z = 0; lft.normalize()
        ang = Vector((lft.x, lft.y)).angle_signed(Vector((1, 0)))
        F = Matrix.Rotation(-ang, 4, 'Z') if abs(ang) > 1e-4 else Matrix.Identity(4)
        hip_rest = (F @ rest_w['hips']).translation; scale = 0.95 / hip_rest.z
        # rest frames: y down the bone to the next joint, x from the bone's own x
        frames0 = {}
        for hb, b in bmap.items():
            R = (F @ rest_w[hb]).to_3x3().normalized()
            a = AIM[hb]
            tip = (F @ Mw @ end_dir(arm, b)) if a is None else (F @ rest_w[a]).translation
            y = (tip - (F @ rest_w[hb]).translation).normalized()
            x = R.col[0] - y * R.col[0].dot(y); x.normalize(); z = x.cross(y)
            frames0[hb] = Matrix((x, y, z)).transposed()
        rest = {hb: {'m': [v for row in m for v in row]} for hb, m in frames0.items()}
        for act in acts:
            key = act.name.split('|')[-1]
            if key not in need: continue
            ad = arm.animation_data or arm.animation_data_create(); ad.action = act
            if hasattr(ad, 'action_slot') and getattr(act, 'slots', None) and len(act.slots): ad.action_slot = act.slots[0]
            f0, f1 = act.frame_range; src_fps = need[key] or file_fps
            n = max(2, int(round((f1 - f0) / src_fps * FPS)) + 1)
            seq = []
            for i in range(n):
                t = f0 + (f1 - f0) * i / (n - 1)
                sc.frame_set(int(t), subframe=t - int(t))
                fr = {'r': {}, 'hp': None}
                for hb, b in bmap.items():
                    pb = arm.pose.bones[b]
                    W = (F @ Mw @ pb.matrix).to_3x3().normalized()
                    R0 = (F @ rest_w[hb]).to_3x3().normalized()
                    m = W @ R0.transposed() @ frames0[hb]
                    fr['r'][hb] = [v for row in m for v in row]
                    if hb == 'hips':
                        p = (F @ Mw @ pb.matrix).translation
                        fr['hp'] = [(p.x - hip_rest.x) * scale, (p.y - hip_rest.y) * scale, p.z * scale]
                seq.append(fr)
            seqs[key] = (seq, rest)
            print('ACTION', key, len(seq), 'frames at', src_fps, 'fps in the file')
        # list every action in the file, for picking
        print('ACTIONS', sorted(a.name.split('|')[-1] for a in acts))
    # each pick: one action, or several played back to back (src as a list)
    for g, w in PICK.items():
        srcs = w['src'] if isinstance(w['src'], list) else [w['src']]
        if any(k not in seqs for k in srcs): print('SKIP', g, 'missing', [k for k in srcs if k not in seqs]); continue
        s = []
        for k in srcs:
            part = [dict(fr, hp=list(fr['hp'])) for fr in seqs[k][0]]
            if w.get('trim'): part = part[int(w['trim'][0] * len(part)):int(w['trim'][1] * len(part)) or None]
            # in place: take out each part's drift (root motion) so the move stays on the spot
            d0 = list(part[0]['hp']); d1 = list(part[-1]['hp'])
            for i, fr in enumerate(part):
                u = i / max(1, len(part) - 1) if w.get('inplace', 1) else 0
                fr['hp'][0] -= d0[0] + (d1[0] - d0[0]) * u
                fr['hp'][1] -= d0[1] + (d1[1] - d0[1]) * u
                if w.get('inplace') == 2: fr['hp'][1] = 0.0  # (a roll or dive: no travel at all, it turns over on the spot)
            s += part[:-1] if k != srcs[-1] else part
        if w.get('loop'): s = s[:-1]  # (the retargeter closes a loop by repeating the first frame)
        out['clips'][g] = s
        out.setdefault('rest_of', {})[g] = seqs[srcs[0]][1]  # each pack's rig has its own rest pose
        if out['rest'] is None: out['rest'] = seqs[srcs[0]][1]
        out['meta'][g] = {'loop': int(bool(w.get('loop'))), 'speed': 0.0, 'pack': w.get('pack', ''), 'src': srcs}
        print('CLIP', g, '<-', srcs, len(s), 'frames')
    def rnd(x):
        if isinstance(x, float): return round(x, 5)
        if isinstance(x, list): return [rnd(v) for v in x]
        if isinstance(x, dict): return {k: rnd(v) for k, v in x.items()}
        return x
    import gzip  # (gzipped: the frames are big)
    with (gzip.open(OUT, 'wt') if OUT.endswith('.gz') else open(OUT, 'w')) as fh: json.dump(rnd(out), fh, separators=(',', ':'))
    print('WROTE', OUT, sorted(out['clips']))


export()
