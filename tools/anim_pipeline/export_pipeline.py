"""Builds the rig, runs every animation script, bakes IK to FK, stacks the actions as NLA tracks and exports
out/Inverted_Anims.glb (+ .fbx), stick-figure sheets in out/sheets/ and out/REPORT.md.
Run: blender --background --python tools/anim_pipeline/export_pipeline.py   (or: python3 export_pipeline.py with the bpy module)"""
import sys, os, time, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
import config as C, rig_builder, anim_utils as U, verify

ORDER = ["idle", "walk", "run", "jog", "skip", "jump", "attack_melee", "interact", "death", "climb", "hurdle", "swing", "crawl"]
OUT = os.path.join(HERE, "out")

def main():
    os.makedirs(os.path.join(OUT, "sheets"), exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.context.scene.render.fps = C.FPS
    rig = rig_builder.ensure_rig()
    baked = []
    for mod in ORDER:
        m = importlib.import_module("animations." + mod)
        for name, act, loop in m.build(rig):
            stride = act.get("stride")
            out = U.bake(rig, act, name, loop)
            if stride: out["stride"] = stride
            baked.append(out)
            verify.sheet(rig, out, os.path.join(OUT, "sheets", name + ".png"))
    rows = []
    for a in baked:
        rows.append((a.name, int(a["frames"]), bool(a["loop"]), a.get("stride"), U.stats(rig, a)["lowest_foot_z"]))
    # NLA: one muted track per action, so engines see every clip by name
    rig.animation_data.action = None
    for a in baked:
        tr = rig.animation_data.nla_tracks.new(); tr.name = a.name
        st = tr.strips.new(a.name, 1, a); st.action_frame_end = a["frames"]; tr.mute = True
    for pb in rig.pose.bones:
        for c in pb.constraints: c.mute = True                  # the baked keys already hold the IK result
    bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, max(r[1] for r in rows)
    glb = os.path.join(OUT, "Inverted_Anims.glb")
    gl = dict(filepath=glb, export_format="GLB", export_animations=True, export_def_bones=True, export_anim_single_armature=True,
              export_animation_mode="NLA_TRACKS", export_optimize_animation_size=True, export_force_sampling=True, export_frame_step=1)
    try: bpy.ops.export_scene.gltf(**gl)
    except TypeError: gl.pop("export_animation_mode"); bpy.ops.export_scene.gltf(**gl)
    fbx = os.path.join(OUT, "Inverted_Anims.fbx"); fbx_ok = True
    try:
        bpy.ops.export_scene.fbx(filepath=fbx, use_selection=False, add_leaf_bones=False, bake_anim=True, bake_anim_use_nla_strips=True,
                                 bake_anim_use_all_actions=False, bake_anim_simplify_factor=0.0, primary_bone_axis="Y", secondary_bone_axis="X")
    except Exception as e: fbx_ok = repr(e)
    deform = [b for b in rig.data.bones if b.use_deform]
    with open(os.path.join(OUT, "REPORT.md"), "w") as f:
        f.write("# Inverted animation pipeline report\n\nBlender %s, %d fps, timing x%.2f. Built %s.\n\n" % (bpy.app.version_string, C.FPS, C.TIMING, time.strftime("%Y-%m-%d %H:%M")))
        f.write("Rig `%s`: %d deform bones (exported), %d control bones (IK targets and poles, not exported). Mesh `%s`: %d verts.\n\n" % (
            rig.name, len(deform), len(rig.data.bones) - len(deform), C.MESH_NAME, len(bpy.data.objects[C.MESH_NAME].data.vertices)))
        f.write("| Action | Frames | Range | Loop | Stride per loop (m) | Lowest foot z (m) |\n|---|---|---|---|---|---|\n")
        for n, fr, lp, sd, lz in rows:
            f.write("| %s | %d | 1-%d | %s | %s | %.3f |\n" % (n, fr, fr, "yes" if lp else "no", "%.2f" % sd if sd else "", lz))
        f.write("\nExport: `%s` (glTF binary, deform bones only, NLA tracks as animations, sampled every frame, IK baked to FK);\n" % os.path.basename(glb))
        f.write("`%s`: %s.\n" % (os.path.basename(fbx), "written (NLA strips, no leaf bones, Y-primary bones)" if fbx_ok is True else "not written: " + str(fbx_ok)))
    print("EXPORTED", glb, os.path.getsize(glb), "bytes;", len(rows), "actions; fbx", fbx_ok)

if __name__ == "__main__": main()
