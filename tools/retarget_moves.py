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


def main():
    ex = json.load(open(f'{ROOT}/tools/hero_moves_export.json'))
    nodes, parent, local, world, idx = load_soldier()
    rot = lambda m: ortho(m[:3, :3])
    pos = lambda m: m[:3, 3]
    # facing check: the toes point along -z, the left arm sits at -x
    toe = pos(world[idx['LeftToe_End']]) - pos(world[idx['LeftFoot']])
    assert toe[2] < 0 and pos(world[idx['LeftArm']])[0] < 0, 'soldier is not facing -z with its left at -x'
    hips_rest = pos(world[idx['Hips']])
    k = hips_rest[1] / 0.95  # hero hips stand 0.95 m up; soldier units per hero metre
    rest = {b: np.array(v['m']).reshape(3, 3) for b, v in ((b, v) for b, v in ex['rest'].items())}
    # per mapped bone: offset O so that soldier world rotation = hero world rotation (glTF space) @ O
    O = {}
    for hb, mb in MAP.items():
        Hr = C @ rest[hb]  # the bone axes in glTF world space (only the world frame changes)
        Mr = rot(world[idx[mb]])
        d_m = pos(world[idx[AIM[mb]]]) - pos(world[idx[mb]])
        d_h = Hr @ np.array([0, 1, 0])
        A = swing(d_m, d_h) @ Mr
        O[mb] = Hr.T @ A
    inv_map = {v: k_ for k_, v in MAP.items()}
    # bones to write, parents before children (everything under Hips except the fingers' ends)
    order = []
    def walk(i):
        nm = nodes[i].get('name', '').replace('mixamorig:', '')
        order.append(nm)
        for c in nodes[i].get('children', []): walk(c)
    walk(idx['Hips'])
    order = [n for n in order if not n.endswith(('_End', '4'))]
    out = {'fps': FPS, 'clips': {}}
    for clip, frames in ex['clips'].items():
        tracks = {f'mixamorig:{n}.quaternion': [] for n in order}
        tracks['mixamorig:Hips.position'] = []
        allf = frames + ([frames[0]] if LOOP[clip] else [])
        prevq = {}
        for fr in allf:
            Wp = {}
            for n in order:
                i = idx[n]
                pw = rot(world[parent[i]]) if n == 'Hips' else Wp[nodes[parent[i]]['name'].replace('mixamorig:', '')]
                if n in inv_map:
                    Hp = C @ np.array(fr["r"][inv_map[n]]).reshape(3, 3)
                    Wn = ortho(Hp @ O[n])
                else:
                    Wn = pw @ rot(local[i])
                Wp[n] = Wn
                q = mat_to_quat(pw.T @ Wn)
                if n in prevq and np.dot(q, prevq[n]) < 0: q = -q
                prevq[n] = q
                tracks[f'mixamorig:{n}.quaternion'] += [round(float(v), 4) for v in q]
            hp = C @ np.array(fr['hp']) * k
            P = np.array([hips_rest[0] + hp[0], hp[1], hips_rest[2] + hp[2]])
            pm = world[parent[idx['Hips']]]
            lp = np.linalg.inv(pm) @ np.append(P, 1)
            tracks['mixamorig:Hips.position'] += [round(float(v), 3) for v in lp[:3]]
        n = len(allf)
        out['clips'][clip] = {'n': n, 'dur': round((n - 1) / FPS, 5), 'stride': round(SPEED[clip] * len(frames) * k, 4), 'tracks': tracks}
    out['unit'] = round(float(k), 5)
    js = ('/* Hero moves made in Blender (RegularJump.blend), retargeted onto the soldier rig by tools/retarget_moves.py.\n'
          '   Generated: do not edit by hand. */\nwindow.HERO_MOVES=' + json.dumps(out, separators=(',', ':')) + ';\n')
    open(f'{ROOT}/moves.js', 'w').write(js)
    print('moves.js', len(js), 'bytes;', {c: (v['n'], v['stride']) for c, v in out['clips'].items()}, 'unit', k)


if __name__ == '__main__':
    main()
