#!/usr/bin/env python3
"""Retarget the hero moves made in Blender (RegularJump.blend) onto the game's soldier rig.

Input:  tools/hero_moves_export.json, written by Blender: for each move, one loop of frames with every hero
        bone's armature-space rotation and the hips offset from the root (in place, no forward travel).
Output: moves.js (window.HERO_MOVES): three.js-ready quaternion tracks for the mixamo bones in soldier.js.

How: both rigs are put in one space (glTF, y up, facing -z). At rest, each soldier bone is swung so it points
the same way as its hero bone (the soldier stands in a T-pose, the hero with its arms down); after that,
every frame the soldier bone takes on the hero bone's world rotation. Bones the hero rig has no match for
(Spine1, the fingers, the toes) keep their rest pose.

    python3 tools/retarget_moves.py
"""
import base64, json, math, re, struct, sys
import numpy as np

ROOT = __file__.rsplit('/tools/', 1)[0]
FPS = 24
OUT_FPS = 48
MAP = {'hips': 'Hips', 'spine': 'Spine', 'chest': 'Spine2', 'neck': 'Neck', 'head': 'Head'}
for s, S in (('L', 'Left'), ('R', 'Right')):
    MAP.update({f'shoulder.{s}': f'{S}Shoulder', f'upper_arm.{s}': f'{S}Arm', f'forearm.{s}': f'{S}ForeArm',
                f'hand.{s}': f'{S}Hand', f'thigh.{s}': f'{S}UpLeg', f'shin.{s}': f'{S}Leg', f'foot.{s}': f'{S}Foot'})
# where each soldier bone points: toward this child
AIM = {'Hips': 'Spine', 'Spine': 'Spine1', 'Spine2': 'Neck', 'Neck': 'Head', 'Head': 'HeadTop_End'}
for S in ('Left', 'Right'):
    AIM.update({f'{S}Shoulder': f'{S}Arm', f'{S}Arm': f'{S}ForeArm', f'{S}ForeArm': f'{S}Hand',
                f'{S}Hand': f'{S}HandMiddle1', f'{S}UpLeg': f'{S}Leg', f'{S}Leg': f'{S}Foot', f'{S}Foot': f'{S}ToeBase'})
# Blender (z up, hero facing -y) to the soldier's glTF space (y up, facing -z, its left at -x)
C = np.array([[-1, 0, 0], [0, 0, 1], [0, 1, 0]], float)
# forward speed of each move in Blender (metres per frame), for the stride the game syncs the feet to
SPEED = {'Walk': 0.045, 'Sprint': 0.2, 'Crouch': 0.028, 'Swim': 0.035, 'Slide': 0.0}
LOOP = {'Walk': True, 'Sprint': True, 'Crouch': True, 'Swim': True, 'Slide': True}


def quat_to_mat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def mat_to_quat(m):
    t = m[0, 0] + m[1, 1] + m[2, 2]
    if t > 0:
        s = math.sqrt(t + 1) * 2
        q = [(m[2, 1] - m[1, 2]) / s, (m[0, 2] - m[2, 0]) / s, (m[1, 0] - m[0, 1]) / s, 0.25 * s]
    elif m[0, 0] > m[1, 1] and m[0, 0] > m[2, 2]:
        s = math.sqrt(1 + m[0, 0] - m[1, 1] - m[2, 2]) * 2
        q = [0.25 * s, (m[0, 1] + m[1, 0]) / s, (m[0, 2] + m[2, 0]) / s, (m[2, 1] - m[1, 2]) / s]
    elif m[1, 1] > m[2, 2]:
        s = math.sqrt(1 + m[1, 1] - m[0, 0] - m[2, 2]) * 2
        q = [(m[0, 1] + m[1, 0]) / s, 0.25 * s, (m[1, 2] + m[2, 1]) / s, (m[0, 2] - m[2, 0]) / s]
    else:
        s = math.sqrt(1 + m[2, 2] - m[0, 0] - m[1, 1]) * 2
        q = [(m[0, 2] + m[2, 0]) / s, (m[1, 2] + m[2, 1]) / s, 0.25 * s, (m[1, 0] - m[0, 1]) / s]
    q = np.array(q)
    return q / np.linalg.norm(q)


def slerp(a, b, t):
    if np.dot(a, b) < 0: b = -b
    d = min(1.0, float(np.dot(a, b))); th = math.acos(d)
    if th < 1e-5: return a
    return (math.sin((1 - t) * th) * a + math.sin(t * th) * b) / math.sin(th)


def upsample(V, loop, m):
    """Catmull-Rom through the rows of V, m samples per key. A loop's last row repeats its first, and its ends
    take their neighbours from the other end; otherwise the ends are held."""
    n = len(V)
    def at(i):
        if loop:
            return V[i % (n - 1)]
        return V[min(max(i, 0), n - 1)]
    out = []
    for i in range(n - 1):
        p0, p1, p2, p3 = at(i - 1) if (loop or i > 0) else V[0], V[i], V[i + 1], at(i + 2)
        if loop and i == 0: p0 = V[n - 2]
        for s in range(m):
            t = s / m; t2 = t * t; t3 = t2 * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(V[-1])
    return np.array(out)


def ortho(m):
    u, _, vt = np.linalg.svd(m)
    r = u @ vt
    if np.linalg.det(r) < 0:
        u[:, -1] *= -1
        r = u @ vt
    return r


def swing(a, b):
    """the smallest rotation taking direction a onto direction b"""
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b)
    v = np.cross(a, b); c = float(np.dot(a, b))
    if c < -0.9999:
        p = np.cross(a, [1, 0, 0])
        if np.linalg.norm(p) < 1e-3: p = np.cross(a, [0, 1, 0])
        p /= np.linalg.norm(p)
        return 2 * np.outer(p, p) - np.eye(3)
    k = np.array([[0, -v[2], v[1]], [v[2], 0, -v[0]], [-v[1], v[0], 0]])
    return np.eye(3) + k + k @ k / (1 + c)


def load_soldier():
    s = open(f'{ROOT}/soldier.js').read()
    b = base64.b64decode(re.search(r'"([A-Za-z0-9+/=]{1000,})"', s).group(1))
    n = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + n])
    nodes = j['nodes']
    parent = {}
    for i, nd in enumerate(nodes):
        for c in nd.get('children', []): parent[c] = i
    local = []
    for nd in nodes:
        m = np.eye(4)
        m[:3, :3] = quat_to_mat(nd.get('rotation', [0, 0, 0, 1])) @ np.diag(nd.get('scale', [1, 1, 1]))
        m[:3, 3] = nd.get('translation', [0, 0, 0])
        local.append(m)
    world = [None] * len(nodes)
    def W(i):
        if world[i] is None: world[i] = (W(parent[i]) if i in parent else np.eye(4)) @ local[i]
        return world[i]
    names = {nd.get('name', '').replace('mixamorig:', ''): i for i, nd in enumerate(nodes)}
    return nodes, parent, local, [W(i) for i in range(len(nodes))], names


def main(src='hero_moves_export.json', dst='moves.js', var='HERO_MOVES', head=None, only_mapped=False, swap=None):
    import gzip
    ex = json.load(gzip.open(f'{ROOT}/tools/{src}', 'rt') if src.endswith('.gz') else open(f'{ROOT}/tools/{src}'))
    meta = ex.get('meta', {})  # per clip: fps, loop, speed (the CC0 packs carry their own; Kash's moves use the tables above)
    in_fps = ex.get('fps', FPS); out_fps = ex.get('out_fps', OUT_FPS)
    nodes, parent, local, world, idx = load_soldier()
    rot = lambda m: ortho(m[:3, :3])
    pos = lambda m: m[:3, 3]
    # facing check: the toes point along -z, the left arm sits at -x
    toe = pos(world[idx['LeftToe_End']]) - pos(world[idx['LeftFoot']])
    assert toe[2] < 0 and pos(world[idx['LeftArm']])[0] < 0, 'soldier is not facing -z with its left at -x'
    hips_rest = pos(world[idx['Hips']])
    k = hips_rest[1] / 0.95  # hero hips stand 0.95 m up; soldier units per hero metre
    def offsets(rest_json):
        rest = {b: np.array(v['m']).reshape(3, 3) for b, v in rest_json.items()}
        # per mapped bone: offset O so that soldier world rotation = hero world rotation (glTF space) @ O
        O = {}
        for hb, mb in MAP.items():
            Hr = C @ rest[hb]  # the bone axes in glTF world space (only the world frame changes)
            Mr = rot(world[idx[mb]])
            d_m = pos(world[idx[AIM[mb]]]) - pos(world[idx[mb]])
            d_h = Hr @ np.array([0, 1, 0])
            A = swing(d_m, d_h) @ Mr
            O[mb] = Hr.T @ A
        return O
    O0 = offsets(ex['rest'])
    inv_map = {v: k_ for k_, v in MAP.items()}
    # bones to write, parents before children (everything under Hips except the fingers' ends)
    order = []
    def walk(i):
        nm = nodes[i].get('name', '').replace('mixamorig:', '')
        order.append(nm)
        for c in nodes[i].get('children', []): walk(c)
    walk(idx['Hips'])
    order = [n for n in order if not n.endswith(('_End', '4'))]
    out = {'fps': out_fps, 'clips': {}}
    for clip, frames in ex['clips'].items():
        O = offsets(ex['rest_of'][clip]) if clip in ex.get('rest_of', {}) else O0  # (a pack's rig has its own rest)
        loop = meta[clip]['loop'] if clip in meta else LOOP[clip]
        speed = meta[clip].get('speed', 0.0) if clip in meta else SPEED[clip]
        # a pack clip only writes the bones it moves (plus Spine1, which follows them); the fingers keep their rest
        keep = [n for n in order if not only_mapped or n in inv_map or n == 'Spine1']
        raw = {f'mixamorig:{n}.quaternion': [] for n in keep}
        raw['mixamorig:Hips.position'] = []
        allf = frames + ([frames[0]] if loop else [])
        prevq = {}
        for fr in allf:
            Wp = {}
            # the mapped bones' world rotations first, so Spine1 (no match in the hero rig) can sit halfway between
            # Spine and Spine2 and the back curves through all three instead of bending at two joints
            tgt = {n: ortho(C @ np.array(fr["r"][inv_map[n]]).reshape(3, 3) @ O[n]) for n in order if n in inv_map}
            for n in order:
                i = idx[n]
                pw = rot(world[parent[i]]) if n == 'Hips' else Wp[nodes[parent[i]]['name'].replace('mixamorig:', '')]
                if n in tgt:
                    Wn = tgt[n]
                elif n == 'Spine1':
                    a_ = pw @ rot(local[i]); b_ = tgt['Spine2'] @ rot(local[idx['Spine2']]).T
                    Wn = quat_to_mat(slerp(mat_to_quat(a_), mat_to_quat(b_), 0.5))
                else:
                    Wn = pw @ rot(local[i])
                Wp[n] = Wn
                q = mat_to_quat(pw.T @ Wn)
                if n in prevq and np.dot(q, prevq[n]) < 0: q = -q
                prevq[n] = q
                if n in keep: raw[f'mixamorig:{n}.quaternion'].append(q)
            hp = C @ np.array(fr['hp']) * k
            P = np.array([hips_rest[0] + hp[0], hp[1], hips_rest[2] + hp[2]])
            pm = world[parent[idx['Hips']]]
            raw['mixamorig:Hips.position'].append((np.linalg.inv(pm) @ np.append(P, 1))[:3])
        # 24 fps keys played back with straight lines between them give the motion a corner at every key (it reads
        # as stiff, robotic). Resample through a smooth Catmull-Rom curve at OUT_FPS; loops wrap their neighbours.
        tracks = {}
        for name, vals in raw.items():
            V = np.array(vals); quat = name.endswith('quaternion')
            sm = upsample(V, loop, out_fps // in_fps)
            if quat:
                for j in range(1, len(sm)):
                    if np.dot(sm[j], sm[j - 1]) < 0: sm[j] = -sm[j]
                sm = sm / np.linalg.norm(sm, axis=1, keepdims=True)
            tracks[name] = [round(float(v), 4 if quat else 3) for v in sm.ravel()]
        n = (len(allf) - 1) * (out_fps // in_fps) + 1
        out['clips'][clip] = {'n': n, 'dur': round((len(allf) - 1) / in_fps, 5), 'stride': round(speed * len(frames) * k, 4), 'loop': int(bool(loop)), 'tracks': tracks}
        if not only_mapped: del out['clips'][clip]['loop']  # (moves.js stays exactly as it was)
    out['unit'] = round(float(k), 5)
    if swap:  # clips from another export (the CC0 packs' walk, sprint, crouch and swim) take the place of these
        for c, v in main(swap, None).items(): out['clips'][c] = v
    if dst is None: return out['clips']
    head = head or ('Hero moves: Walk, Sprint, Crouch and Swim from the CC0 Quaternius Universal Animation Library (see CREDITS.md),\n'
                    '   Slide made by Kash in Blender (RegularJump.blend); retargeted onto the soldier rig by tools/retarget_moves.py.')
    js = ('/* ' + head + '\n   Generated: do not edit by hand. */\nwindow.' + var + '=' + json.dumps(out, separators=(',', ':')) + ';\n')
    open(f'{ROOT}/{dst}', 'w').write(js)
    print(dst, len(js), 'bytes;', {c: (v['n'], v['stride']) for c, v in out['clips'].items()}, 'unit', k)


if __name__ == '__main__':
    import os
    # Kash's own moves, with the walk, sprint, crouch and swim swapped for the Quaternius ones (tools/pack_loco_pick.json)
    main(swap='pack_loco_export.json.gz' if os.path.exists(f'{ROOT}/tools/pack_loco_export.json.gz') else None)
    # the CC0 moves from Quaternius and Kenney (see CREDITS.md), exported from Blender by tools/pack_export_blender.py
    if os.path.exists(f'{ROOT}/tools/pack_moves_export.json.gz'):
        main('pack_moves_export.json.gz', 'packmoves.js', 'PACK_MOVES', only_mapped=True,
             head='CC0 moves from the Quaternius Universal Animation Library and Kenney Animated Characters (see CREDITS.md),\n'
                  '   retargeted onto the soldier rig by tools/retarget_moves.py.')
