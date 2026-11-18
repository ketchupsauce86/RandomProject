"""Reusable animation helpers: pose in armature-space terms, keyframe with chosen interpolation,
mirror .L/.R, close loops, a foot-locked gait generator, and the IK -> FK bake for game export."""
import math, bpy
from mathutils import Vector, Matrix, Quaternion, Euler
import config as C

def smooth(k): k = max(0.0, min(1.0, k)); return k * k * (3 - 2 * k)
def lerp(a, b, k): return a + (b - a) * k
def ease_out(k): k = max(0.0, min(1.0, k)); return 1 - (1 - k) ** 3
def ease_in(k): k = max(0.0, min(1.0, k)); return k ** 3

def _drot(x, y, z):
    r = math.radians
    return (Matrix.Rotation(r(x), 3, "X") @ Matrix.Rotation(r(y), 3, "Y") @ Matrix.Rotation(r(z), 3, "Z")).to_quaternion()

class Pose:
    """Set a pose, then key() it. FK rotations are deltas about armature axes from the bone's rest
    (see config.py); IK targets and the hips take armature-space positions."""
    def __init__(self, rig, action):
        self.rig, self.action, self.touched = rig, action, set()
        self.reset()

    def reset(self):
        for pb in self.rig.pose.bones:
            pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0); pb.scale = (1, 1, 1)
        for s in ("L", "R"): self.arm_ik(s, 0)                 # every action keys its own arm IK (off unless it says so)
        self.touched = set()

    def _pb(self, n): self.touched.add(n); return self.rig.pose.bones[n]

    def rot(self, name, x=0, y=0, z=0, side=None):
        """side='L'/'R' picks the bone '<name>.<side>' and mirrors the angles for R."""
        if side: name = name + "." + side
        if name.endswith(".R"): y, z = -y, -z
        pb = self._pb(name); R = pb.bone.matrix_local.to_quaternion()
        pb.rotation_quaternion = R.inverted() @ _drot(x, y, z) @ R

    def move(self, name, pos, rot=None, side=None):
        """Put a bone parented to Root (controls) or the Hips at an armature-space position (absolute: give
        the right side's own coordinates)."""
        if side: name = name + "." + side
        if name.endswith(".R") and rot: rot = (rot[0], -rot[1], -rot[2])   # (positions are absolute; only angles mirror)
        pb = self._pb(name); M = pb.bone.matrix_local
        pb.location = M.to_3x3().inverted() @ (Vector(pos) - M.translation)
        if rot is not None:
            R = M.to_quaternion(); pb.rotation_quaternion = R.inverted() @ _drot(*rot) @ R

    def hips(self, pos=(0, 0, 0.95), rot=(0, 0, 0)):
        self.move("Hips", pos); self.rot("Hips", *rot)

    def foot(self, side, pos, pitch=0, yaw=0, roll=0):
        self.move("IK_Foot", pos, (pitch, roll, yaw), side=side)

    def hand(self, side, pos, w=1.0, rot=(0, 0, 0)):
        self.move("IK_Hand", pos, rot, side=side)
        self.arm_ik(side, w)

    def arm_ik(self, side, w):
        pb = self.rig.pose.bones["LowerArm." + side]; pb.constraints["IK"].influence = w
        hb = self.rig.pose.bones["Hand." + side]; hb.constraints["HandIK"].influence = w
        self._ik_keys = getattr(self, "_ik_keys", set()) | {side}

    def poles(self, knee=(0.1, -0.7, 0.52), elbow=(0.45, 0.6, 1.2)):
        for s in ("L", "R"):
            m = 1 if s == "L" else -1
            self.move("Pole_Knee", (knee[0] * m, knee[1], knee[2]), side=s); self.move("Pole_Elbow", (elbow[0] * m, elbow[1], elbow[2]), side=s)

    def key(self, frame, interp="BEZIER"):
        f = round(frame)
        for n in [b.name for b in self.rig.pose.bones]:          # every bone, every key pose: nothing holds a later key early
            pb = self.rig.pose.bones[n]
            pb.keyframe_insert("location", frame=f); pb.keyframe_insert("rotation_quaternion", frame=f)
        for s in getattr(self, "_ik_keys", ()):
            for b, c in (("LowerArm." + s, "IK"), ("Hand." + s, "HandIK")):
                self.rig.pose.bones[b].constraints[c].keyframe_insert("influence", frame=f)
        set_interp(self.action, f, interp)

def set_interp(action, frame, mode):
    for fc in fcurves(action):
        for kp in fc.keyframe_points:
            if abs(kp.co.x - frame) < 0.5:
                kp.interpolation = mode
                if mode == "BEZIER": kp.handle_left_type = kp.handle_right_type = "AUTO_CLAMPED"

def fcurves(action):
    """Blender 4.4+ keeps F-curves in layered channelbags; older versions on the action."""
    if hasattr(action, "fcurves") and len(getattr(action, "fcurves", [])):
        return list(action.fcurves)
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for bag in strip.channelbags:
                out += list(bag.fcurves)
    return out

def new_action(rig, name, frames):
    """A fresh action on the rig, frames 1..frames scaled by config.TIMING."""
    rig.animation_data_create()
    act = bpy.data.actions.new(name + "_ctrl"); act.use_fake_user = False
    rig.animation_data.action = act
    if hasattr(rig.animation_data, "action_slot") and act.slots:
        rig.animation_data.action_slot = act.slots[0]
    n = max(2, round(frames * C.TIMING))
    act["frames"] = n
    bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, n
    p = Pose(rig, act); p.poles(); return act, p, n

def mirror_side(s): return "R" if s == "L" else "L"

# ---- foot-locked gait: a planted foot slides back at exactly the travel speed, so nothing slips in game
def gait(p, n, speed, direction=(0, -1), stance=0.6, lift=0.12, hip_z=0.88, bob=0.03, flight=0.0,
         lean=6, sway=3, twist=8, arm_swing=28, elbow=35, arm_down=72, knee_lift=0.0, side_step=False, yaw=0, extra=None):
    """Keys every frame 1..n of an in-place loop. direction: travel in armature XY (forward is -Y).
    Returns the loop's stride (metres travelled per loop) so the game can sync its feet."""
    dur = n / C.FPS; L = speed * stance * dur      # how far a planted foot slides back (= speed x stance time)
    d = Vector((direction[0], direction[1], 0)).normalized()
    for f in range(1, n + 1):
        t = (f - 1) / n
        hz = hip_z; foot_lo = {}
        for s, off in (("L", 0.0), ("R", 0.5)):
            u = (t + off) % 1.0; base = Vector((0.11 if s == "L" else -0.11, 0, C.ANKLE_Z))
            if u < stance:
                k = u / stance; pos = base + d * (L / 2 - L * k)
                pitch = lerp(-14, 0, smooth(k / 0.25)) + lerp(0, 22, smooth((k - 0.7) / 0.3))   # heel strike -> flat -> toe off
                pos.z += 0.165 * math.sin(math.radians(max(0, pitch)))   # toe-off: the heel rises, the toes stay on the floor
                foot_lo[s] = 1 - abs(k - 0.5) * 2
            else:
                k = (u - stance) / (1 - stance); pos = base + d * (-L / 2 + L * smooth(k))
                pos.z += lift * math.sin(math.pi * k) ** 0.8 + knee_lift * math.sin(math.pi * k)
                if side_step: pos.y -= 0.08 * math.sin(math.pi * k)       # the swinging foot passes in front
                pitch = lerp(28, -14, smooth(k)); foot_lo[s] = 0
                pos.z += 0.165 * math.sin(math.radians(max(0, pitch))) * (1 - smooth(k / 0.3))
            p.foot(s, tuple(pos), pitch=pitch)
        w = max(foot_lo.values())
        hz += -bob * w + (flight * (1 - w) if flight else bob * 0.6 * (1 - w))
        ph = t * 2 * math.pi
        lat = math.cos(ph) * 0.025 * (sway / 3)
        p.hips((lat, 0, hz), rot=(lean, 0, yaw + math.sin(ph) * twist * 0.6))
        p.rot("Spine", lean * 0.4, 0, -yaw * 0.5 - math.sin(ph) * twist * 0.7)
        p.rot("Chest", lean * 0.2, math.cos(ph) * sway, -math.sin(ph) * twist * 0.7)
        p.rot("Neck", -lean * 0.4); p.rot("Head", -lean * 0.3, 0, math.sin(ph) * twist * 0.3)
        for s, sg in (("L", 1), ("R", -1)):
            sw = math.sin(ph + (0 if s == "L" else math.pi))       # arm opposite its leg
            p.rot("Shoulder", 0, 0, -sw * 4, side=s)
            p.rot("UpperArm", sw * arm_swing, arm_down, 0, side=s)
            p.rot("LowerArm", 0, 0, -(elbow + max(0, -sw) * elbow * 0.6), side=s)
            p.rot("Hand", 0, 10, 0, side=s)
        if extra: extra(p, f, t)
        p.key(f, "LINEAR")
    return speed * dur

# ---- loops and mirroring
def close_loop(p, n, frame_one_pose):
    """Make the last frame identical to the first (seamless loop): re-key frame n from frame 1's pose."""
    frame_one_pose(p); p.key(n)

def mirror_pose_dict(pose):
    """{'UpperArm.L': (x,y,z)} -> the same dict with .L/.R swapped and angles mirrored."""
    out = {}
    for k, v in pose.items():
        out[C.mirror_name(k)] = (v[0], -v[1], -v[2]) if len(v) == 3 else v
    return out

# ---- IK -> FK bake: sample the visual pose each frame, write plain rotations/locations on the deform bones
def bake(rig, act, name, loop=False):
    n = int(act["frames"]); scene = bpy.context.scene; rest = {b.name: b.matrix_local.copy() for b in rig.data.bones}
    rig.animation_data.action = act                              # (a script may build several actions before any is baked)
    if hasattr(rig.animation_data, "action_slot") and act.slots: rig.animation_data.action_slot = act.slots[0]
    mats = []
    for f in range(1, n + 1):
        scene.frame_set(f); bpy.context.view_layer.update()
        mats.append({nm: rig.pose.bones[nm].matrix.copy() for nm in C.DEFORM})
    out = bpy.data.actions.new(name); out.use_fake_user = True; out["frames"] = n; out["loop"] = int(loop)
    rig.animation_data.action = out
    if hasattr(rig.animation_data, "action_slot") and out.slots:
        rig.animation_data.action_slot = out.slots[0]
    _mute(rig, True)
    for f, M in enumerate(mats, start=1):
        for nm in C.DEFORM:
            pb = rig.pose.bones[nm]; par = pb.parent
            if par is None: basis = rest[nm].inverted() @ M[nm]
            else: basis = (M[par.name] @ rest[par.name].inverted() @ rest[nm]).inverted() @ M[nm]
            loc, q, _ = basis.decompose()
            pb.location = loc; pb.rotation_quaternion = q
            if nm in ("Root", "Hips"): pb.keyframe_insert("location", frame=f)
            pb.keyframe_insert("rotation_quaternion", frame=f)
    for fc in fcurves(out):
        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
    _mute(rig, False)
    bpy.data.actions.remove(act)
    return out

def _mute(rig, on):
    for pb in rig.pose.bones:
        for c in pb.constraints: c.mute = on

def stats(rig, act):
    """Feet below the floor, and how far a planted foot drifts (metres per frame) - for the report."""
    n = int(act["frames"]); scene = bpy.context.scene; low = 9; rig.animation_data.action = act
    if hasattr(rig.animation_data, "action_slot") and act.slots: rig.animation_data.action_slot = act.slots[0]
    _mute(rig, True)
    for f in range(1, n + 1):
        scene.frame_set(f); bpy.context.view_layer.update()
        for s in ("L", "R"):
            low = min(low, (rig.pose.bones["Foot." + s].matrix @ Vector((0, 0, 0))).z, (rig.pose.bones["Foot." + s].tail).z)
    _mute(rig, False)
    return {"lowest_foot_z": round(low, 3)}

def arms_down(p, down=72, bend=14, fwd=0):
    for s in ("L", "R"):
        p.rot("UpperArm", fwd, down, 0, side=s); p.rot("LowerArm", 0, 0, -bend, side=s); p.rot("Hand", 0, 8, 0, side=s)

def stand(p, hip_z=0.93, spread=0.12):
    p.hips((0, 0, hip_z)); p.foot("L", (spread, 0, C.ANKLE_Z), yaw=-8); p.foot("R", (-spread, 0, C.ANKLE_Z), yaw=8)

def standalone(build):
    """Run one animation script on its own in headless Blender: build, bake and report."""
    import rig_builder
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    rig = rig_builder.ensure_rig()
    for name, act, loop in build(rig):
        out = bake(rig, act, name, loop)
        keys = sum(len(fc.keyframe_points) for fc in fcurves(out))
        print("OK %-14s frames=%3d loop=%d fcurves=%d keys=%d %s" % (name, out["frames"], loop, len(fcurves(out)), keys, stats(rig, out)))
