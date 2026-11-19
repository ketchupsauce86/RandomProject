"""Global settings for the Inverted animation pipeline (stylised, snappy, low-poly).

Blender space: Z up, the character faces -Y, its left side is +X. Armature-space rotations in the
helpers are (x, y, z) degrees about the armature axes: +X pitches a vertical bone forward and swings a
hanging leg back; on the left arm +Y swings it down and +Z swings it back. The right side mirrors
(x, -y, -z).
"""
FPS = 30
TIMING = 1.0            # multiply every animation's length (1.0 = as authored)
RIG_NAME = "InvertedRig"
MESH_NAME = "InvertedBlockout"

# deform skeleton: name, head, tail, parent
BONES = [
    ("Root",        (0, 0, 0),           (0, 0.25, 0),          None),
    ("Hips",        (0, 0, 0.95),        (0, 0, 1.08),          "Root"),
    ("Spine",       (0, 0, 1.08),        (0, 0, 1.25),          "Hips"),
    ("Chest",       (0, 0, 1.25),        (0, 0, 1.45),          "Spine"),
    ("Neck",        (0, 0, 1.45),        (0, 0, 1.55),          "Chest"),
    ("Head",        (0, 0, 1.55),        (0, 0, 1.80),          "Neck"),
    ("Shoulder.L",  (0.04, 0, 1.42),     (0.18, 0, 1.42),       "Chest"),
    ("UpperArm.L",  (0.18, 0, 1.42),     (0.45, 0.02, 1.42),    "Shoulder.L"),
    ("LowerArm.L",  (0.45, 0.02, 1.42),  (0.70, 0, 1.42),       "UpperArm.L"),
    ("Hand.L",      (0.70, 0, 1.42),     (0.80, 0, 1.42),       "LowerArm.L"),
    ("UpperLeg.L",  (0.10, 0, 0.95),     (0.10, -0.03, 0.52),   "Hips"),
    ("LowerLeg.L",  (0.10, -0.03, 0.52), (0.10, 0, 0.10),       "UpperLeg.L"),
    ("Foot.L",      (0.10, 0, 0.10),     (0.10, -0.16, 0.03),   "LowerLeg.L"),
]
# animation controls (not exported): IK targets ride on Root
CONTROLS = [
    ("IK_Foot.L",    (0.10, 0, 0.10),    (0.10, -0.16, 0.03)),
    ("Pole_Knee.L",  (0.10, -0.70, 0.52), (0.10, -0.80, 0.52)),
    ("IK_Hand.L",    (0.70, 0, 1.42),    (0.80, 0, 1.42)),
    ("Pole_Elbow.L", (0.45, 0.60, 1.42), (0.45, 0.70, 1.42)),
]

def mirror_name(n):
    return n[:-2] + (".R" if n.endswith(".L") else ".L") if n[-2:] in (".L", ".R") else n

def mirror_vec(v):
    return (-v[0], v[1], v[2])

def all_bones():
    out = []
    for n, h, t, p in BONES:
        out.append((n, h, t, p))
        if n.endswith(".L"):
            out.append((mirror_name(n), mirror_vec(h), mirror_vec(t), mirror_name(p) if p else None))
    return out

def all_controls():
    out = []
    for n, h, t in CONTROLS:
        out.append((n, h, t))
        out.append((mirror_name(n), mirror_vec(h), mirror_vec(t)))
    return out

DEFORM = [b[0] for b in all_bones()]
ANKLE_Z = 0.10
