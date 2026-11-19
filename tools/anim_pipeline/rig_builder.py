"""Finds a humanoid armature with the pipeline's bone names, or builds one: a clean low-poly blockout
skinned rigidly to a T-pose skeleton with IK legs (on) and IK arms (off until an animation keys them)."""
import math, bpy
from mathutils import Vector
import config as C

def find_rig():
    for ob in bpy.data.objects:
        if ob.type == "ARMATURE" and all(n in ob.data.bones for n in C.DEFORM):
            return ob
    return None

def _box(bm_verts, faces, c, size, axis_from, axis_to):
    pass

def build_rig():
    arm = bpy.data.armatures.new(C.RIG_NAME)
    rig = bpy.data.objects.new(C.RIG_NAME, arm)
    bpy.context.scene.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.object.mode_set(mode="EDIT")
    eb = arm.edit_bones
    for n, h, t, p in C.all_bones():
        b = eb.new(n); b.head = h; b.tail = t; b.roll = 0
        if p: b.parent = eb[p]; b.use_connect = (Vector(eb[p].tail) - Vector(h)).length < 1e-4 and not n.startswith("Shoulder") and n != "Hips"
    for n, h, t in C.all_controls():
        b = eb.new(n); b.head = h; b.tail = t; b.roll = 0; b.parent = eb["Root"]; b.use_deform = False
    bpy.ops.object.mode_set(mode="POSE")
    for pb in rig.pose.bones:
        pb.rotation_mode = "QUATERNION"
    for s in ("L", "R"):
        ik = rig.pose.bones["LowerLeg." + s].constraints.new("IK")
        ik.name = "IK"; ik.target = rig; ik.subtarget = "IK_Foot." + s; ik.pole_target = rig; ik.pole_subtarget = "Pole_Knee." + s
        ik.pole_angle = math.radians(-90); ik.chain_count = 2
        cr = rig.pose.bones["Foot." + s].constraints.new("COPY_ROTATION"); cr.name = "FootIK"; cr.target = rig; cr.subtarget = "IK_Foot." + s
        ik = rig.pose.bones["LowerArm." + s].constraints.new("IK")
        ik.name = "IK"; ik.target = rig; ik.subtarget = "IK_Hand." + s; ik.pole_target = rig; ik.pole_subtarget = "Pole_Elbow." + s
        ik.pole_angle = math.radians(-90 if s == "L" else -90); ik.chain_count = 2; ik.influence = 0
        cr = rig.pose.bones["Hand." + s].constraints.new("COPY_ROTATION"); cr.name = "HandIK"; cr.target = rig; cr.subtarget = "IK_Hand." + s; cr.influence = 0
    for n, _, _ in C.all_controls():
        rig.data.bones[n].hide = False
    bpy.ops.object.mode_set(mode="OBJECT")
    _blockout(rig)
    return rig

# low-poly blockout: one box per bone (thickness per part), rigidly weighted, flat shaded
THICK = {"Hips": (0.30, 0.18), "Spine": (0.26, 0.16), "Chest": (0.36, 0.22), "Neck": (0.08, 0.08), "Head": (0.24, 0.26),
         "Shoulder": (0.08, 0.08), "UpperArm": (0.09, 0.09), "LowerArm": (0.075, 0.075), "Hand": (0.08, 0.04),
         "UpperLeg": (0.14, 0.14), "LowerLeg": (0.11, 0.11), "Foot": (0.10, 0.06)}

def _blockout(rig):
    verts, faces, groups = [], [], []
    for n, h, t, p in C.all_bones():
        key = n.split(".")[0]
        if key not in THICK: continue
        h, t = Vector(h), Vector(t); ax = (t - h); L = ax.length; ax.normalize()
        up = Vector((0, 0, 1)) if abs(ax.z) < 0.9 else Vector((0, -1, 0))
        a = ax.cross(up).normalized(); b = a.cross(ax).normalized()
        w, d = THICK[key]; i0 = len(verts)
        for k in (0, 1):
            c = h + ax * (L * k)
            for sa, sb in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                verts.append(c + a * (sa * w / 2) + b * (sb * d / 2))
        faces += [(i0, i0+1, i0+2, i0+3), (i0+7, i0+6, i0+5, i0+4)] + [(i0+j, i0+(j+1) % 4, i0+4+(j+1) % 4, i0+4+j) for j in range(4)]
        groups.append((n, list(range(i0, i0 + 8))))
    me = bpy.data.meshes.new(C.MESH_NAME); me.from_pydata([tuple(v) for v in verts], [], faces); me.update()
    ob = bpy.data.objects.new(C.MESH_NAME, me); bpy.context.scene.collection.objects.link(ob)
    for n, idx in groups:
        vg = ob.vertex_groups.new(name=n); vg.add(idx, 1.0, "REPLACE")
    mat = bpy.data.materials.new("Blockout"); mat.diffuse_color = (0.92, 0.55, 0.25, 1); me.materials.append(mat)
    ob.parent = rig; m = ob.modifiers.new("Armature", "ARMATURE"); m.object = rig
    return ob

def ensure_rig():
    return find_rig() or build_rig()

if __name__ == "__main__":
    r = ensure_rig(); print("RIG", r.name, len(r.data.bones), "bones")
