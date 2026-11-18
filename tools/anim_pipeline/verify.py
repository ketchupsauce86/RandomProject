"""Headless checks and stick-figure contact sheets (side and front views) of each baked action."""
import bpy
from mathutils import Vector
import config as C

LINKS = [("Hips", "Spine"), ("Spine", "Chest"), ("Chest", "Neck"), ("Neck", "Head")]

def joints(rig):
    J = {}
    for nm in C.DEFORM:
        pb = rig.pose.bones[nm]; J[nm] = (pb.head.copy(), pb.tail.copy())
    return J

def sheet(rig, act, path, cols=8, size=180):
    from PIL import Image, ImageDraw
    n = int(act["frames"]); picks = [1 + round(i * (n - 1) / (cols - 1)) for i in range(cols)]
    img = Image.new("RGB", (cols * size, size * 2), (245, 245, 250)); d = ImageDraw.Draw(img)
    import anim_utils as U; U._mute(rig, True)                 # show the baked keys alone, as an engine will
    rig.animation_data.action = act
    if hasattr(rig.animation_data, "action_slot") and act.slots: rig.animation_data.action_slot = act.slots[0]
    for c, f in enumerate(picks):
        bpy.context.scene.frame_set(f); bpy.context.view_layer.update(); J = joints(rig)
        for row, (ax, sgn) in enumerate(((1, -1), (0, -1))):       # side view (Y), front view (X)
            ox, oy, sc = c * size + size / 2, row * size + size * 0.92, size / 2.4
            P = lambda v: (ox + sgn * v[ax] * sc, oy - v[2] * sc)
            d.line([(c * size, oy), (c * size + size, oy)], fill=(190, 190, 200))
            for nm, (h, t) in J.items():
                if nm == "Root": continue
                col = (220, 70, 60) if nm.endswith(".L") else (60, 110, 220) if nm.endswith(".R") else (40, 40, 40)
                d.line([P(h), P(t)], fill=col, width=3)
            hx, hy = P(J["Head"][1]); d.ellipse([hx - 4, hy - 4, hx + 4, hy + 4], fill=(40, 40, 40))
        d.text((c * size + 4, 2), "%s f%d" % (act.name, f), fill=(0, 0, 0))
    U._mute(rig, False); img.save(path)
