"""Builds every pipeline animation and writes tools/inverted_moves_export.json.gz in the same format as
tools/pack_export_blender.py, so tools/retarget_moves.py can put them on the game's soldier (invmoves.js).
Run: python3 tools/anim_pipeline/export_for_game.py   then   python3 tools/retarget_moves.py"""
import sys, os, json, gzip, importlib
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import bpy
import config as C, rig_builder, anim_utils as U
from export_pipeline import ORDER

MAP = {"hips": "Hips", "spine": "Spine", "chest": "Chest", "neck": "Neck", "head": "Head"}
for s in "LR":
    MAP.update({f"shoulder.{s}": f"Shoulder.{s}", f"upper_arm.{s}": f"UpperArm.{s}", f"forearm.{s}": f"LowerArm.{s}",
                f"hand.{s}": f"Hand.{s}", f"thigh.{s}": f"UpperLeg.{s}", f"shin.{s}": f"LowerLeg.{s}", f"foot.{s}": f"Foot.{s}"})
flat = lambda m: [round(v, 5) for row in m for v in row]

def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene; sc.render.fps = C.FPS
    rig = rig_builder.ensure_rig()
    rest = {hb: {"m": flat(rig.data.bones[b].matrix_local.to_3x3())} for hb, b in MAP.items()}
    hip0 = rig.data.bones["Hips"].matrix_local.translation
    out = {"fps": C.FPS, "out_fps": C.FPS * 2, "rest": rest, "clips": {}, "meta": {}}
    for mod in ORDER:
        for name, act, loop in importlib.import_module("animations." + mod).build(rig):
            stride = act.get("stride") or 0.0
            b = U.bake(rig, act, name, loop); U._mute(rig, True)
            n = int(b["frames"]); last = n - 1 if loop else n       # a loop's last frame repeats its first
            seq = []
            for f in range(1, last + 1):
                sc.frame_set(f); bpy.context.view_layer.update()
                fr = {"r": {}, "hp": None}
                for hb, bn in MAP.items():
                    M = rig.pose.bones[bn].matrix
                    fr["r"][hb] = flat(M.to_3x3().normalized())
                    if hb == "hips":
                        p = rig.matrix_world @ M.translation
                        fr["hp"] = [round(p.x - hip0.x, 4), round(p.y - hip0.y, 4), round(p.z, 4)]
                seq.append(fr)
            out["clips"]["INV_" + name] = seq
            out["meta"]["INV_" + name] = {"loop": int(loop), "speed": stride / max(1, len(seq)), "pack": "Inverted pipeline"}
            print("CLIP", name, len(seq), "frames", "loop" if loop else "", stride)
    dst = os.path.join(HERE, "..", "inverted_moves_export.json.gz")
    with gzip.open(dst, "wt") as f: json.dump(out, f, separators=(",", ":"))
    print("WROTE", dst, os.path.getsize(dst))

if __name__ == "__main__": main()
