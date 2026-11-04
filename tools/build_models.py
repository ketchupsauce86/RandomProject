#!/usr/bin/env python3
"""Build the game's Blender models and pack them into models.js.

Each model is made from code with Blender's Python module (bpy), so nobody has
to open Blender to change one: edit its build function below and rerun

    pip install bpy        # once (the bpy package is Blender itself)
    python3 tools/build_models.py
    python3 tools/build_models.py --render   # also save a preview PNG of each in tools/previews/

Models are exported as glTF binary (.glb, no Draco compression, so three.js r128's
GLTFLoader reads them as is) and written to models.js as base64, like soldier.js,
so GitHub Pages serves them as plain files. Units are metres; Blender's Z-up becomes
three.js's Y-up on export.
"""
import argparse, base64, math, pathlib, tempfile

import bpy

ROOT = pathlib.Path(__file__).resolve().parent.parent


# ---------- helpers ----------

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def hexcol(h):
    """sRGB hex -> the linear RGBA Blender's colour sockets want."""
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(h >> 16 & 255), lin(h >> 8 & 255), lin(h & 255), 1.0)

def mat(name, color, rough=0.6, metal=0.0, emit=None):
    """A Principled BSDF material: the only kind the glTF exporter turns into a game material."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = hexcol(color)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    if emit is not None:
        p.inputs['Emission Color'].default_value = hexcol(emit)
        p.inputs['Emission Strength'].default_value = 1.0  # above 1 needs an extension r128 ignores
    return m

def give(obj, material, bevel=0.0, segs=3):
    obj.data.materials.append(material)
    if bevel:
        b = obj.modifiers.new('bevel', 'BEVEL')
        b.width, b.segments, b.limit_method = bevel, segs, 'ANGLE'
    bpy.ops.object.shade_auto_smooth() if bevel else bpy.ops.object.shade_smooth()
    return obj

def join(name):
    bpy.ops.object.select_all(action='SELECT')
    bpy.context.view_layer.objects.active = bpy.context.selected_objects[0]
    for o in bpy.context.selected_objects:  # bake the bevels in before joining
        bpy.context.view_layer.objects.active = o
        for m in list(o.modifiers):
            bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.ops.object.join()
    obj = bpy.context.active_object
    obj.name = name
    return obj


# ---------- models ----------

def booster_pad():
    """The booster pad: PAD_R (3.4 m) across the top, 0.35 m tall, origin at the bottom centre.
    The game lays its animated arrows and glow column on top of it."""
    navy = mat('pad_base', 0x1d2a3a, rough=0.55)
    plate = mat('pad_plate', 0x2b4460, rough=0.45)
    cyan = mat('pad_glow', 0x5cf0ff, rough=0.3, emit=0x5cf0ff)
    gold = mat('pad_bolt', 0xffc23a, rough=0.35, metal=0.2, emit=0x5a3600)

    # a chunky tapered base with soft cartoon bevels
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=3.65, radius2=3.4, depth=0.3, location=(0, 0, 0.15))
    give(bpy.context.active_object, navy, bevel=0.07)
    # the raised plate the arrows sit on
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=2.7, depth=0.08, location=(0, 0, 0.31))
    give(bpy.context.active_object, plate, bevel=0.025, segs=2)
    # glowing rings: one round the plate, a thin one round the foot
    bpy.ops.mesh.primitive_torus_add(major_radius=2.95, minor_radius=0.1, major_segments=48, minor_segments=8, location=(0, 0, 0.3))
    give(bpy.context.active_object, cyan)
    bpy.ops.mesh.primitive_torus_add(major_radius=3.6, minor_radius=0.045, major_segments=48, minor_segments=6, location=(0, 0, 0.05))
    give(bpy.context.active_object, cyan)
    # eight squashed gold bolts round the rim
    for i in range(8):
        a = i / 8 * math.tau + math.pi / 8
        bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=6, radius=0.15, location=(3.22 * math.cos(a), 3.22 * math.sin(a), 0.3))
        bpy.context.active_object.scale.z = 0.45
        bpy.ops.object.transform_apply(scale=True)
        give(bpy.context.active_object, gold)
    # four glowing chevron studs on the side, pointing up the launch direction
    for i in range(4):
        a = i / 4 * math.tau
        bpy.ops.mesh.primitive_cube_add(size=1, location=(3.5 * math.cos(a), 3.5 * math.sin(a), 0.16), rotation=(0, -0.14, a))
        bpy.context.active_object.scale = (0.06, 0.55, 0.1)
        bpy.ops.object.transform_apply(scale=True)
        give(bpy.context.active_object, cyan)
    return join('BoosterPad')


MODELS = {'pad': booster_pad}


# ---------- export ----------

def render_preview(path):
    scene = bpy.context.scene
    bpy.ops.object.camera_add(location=(7.5, -7.5, 5.2))
    cam = bpy.context.active_object
    cam.data.lens = 42
    track = cam.constraints.new('TRACK_TO')
    bpy.ops.object.empty_add(location=(0, 0, 0.1))
    track.target = bpy.context.active_object
    scene.camera = cam
    bpy.ops.object.light_add(type='SUN', rotation=(0.7, 0.2, 0.6))
    bpy.context.active_object.data.energy = 3.5
    world = bpy.data.worlds.new('w')
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = hexcol(0xe6e8ec)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.8
    scene.world = world
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 48
    scene.cycles.device = 'CPU'
    scene.render.resolution_x, scene.render.resolution_y = 960, 600
    scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)

def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument('--render', action='store_true', help='also render a preview PNG of each model')
    args = ap.parse_args()
    packed = {}
    with tempfile.TemporaryDirectory() as tmp:
        for key, build in MODELS.items():
            reset()
            build()
            glb = pathlib.Path(tmp) / f'{key}.glb'
            bpy.ops.export_scene.gltf(filepath=str(glb), export_format='GLB', export_apply=True,
                                      export_draco_mesh_compression_enable=False, export_yup=True)
            packed[key] = base64.b64encode(glb.read_bytes()).decode()
            print(f'{key}: {glb.stat().st_size / 1024:.1f} KB')
            if args.render:
                out = ROOT / 'tools' / 'previews'
                out.mkdir(exist_ok=True)
                render_preview(out / f'{key}.png')
    lines = ',\n'.join(f'  {k}: "{v}"' for k, v in packed.items())
    (ROOT / 'models.js').write_text(
        '/* Models built in Blender by tools/build_models.py, packed as base64 glTF binary. Rebuild with: python3 tools/build_models.py */\n'
        f'window.MODELS = {{\n{lines}\n}};\n')
    print('wrote models.js')

if __name__ == '__main__':
    main()
