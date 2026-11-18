"""Climb: 40-frame loop up a wall in front (y = -0.34). Hands and feet grip in diagonal pairs; a gripping hand
or foot slides down at exactly the climbing speed, so nothing slips on the wall."""
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

WALL = -0.34

def build(rig):
    act, p, n = U.new_action(rig, "Climb", 40)
    speed, grip = 0.55, 0.62; dur = n / 30; L = speed * grip * dur
    p.poles(knee=(0.25, -0.9, 0.6), elbow=(0.6, 0.5, 1.2))
    for f in range(1, n + 1):
        t = (f - 1) / n
        def limb(off, z0):
            u = (t + off) % 1
            if u < grip: k = u / grip; return z0 + L / 2 - L * k, 0
            k = (u - grip) / (1 - grip); return z0 - L / 2 + L * U.smooth(k), math.sin(math.pi * k)
        for s, sg, off in (("L", 1, 0.0), ("R", -1, 0.5)):
            hz, ha = limb(off, 1.78); p.hand(s, (sg * 0.24, WALL + 0.06 + 0.07 * ha, hz), 1.0, rot=(-80, 0, 0))
            fz, fa = limb(off + 0.5, 0.42); p.foot(s, (sg * 0.15, WALL + 0.12 + 0.08 * fa, fz), pitch=-25 - 20 * fa)
        ph = t * 2 * math.pi
        p.hips((0.03 * math.sin(ph), -0.02, 0.98 + 0.02 * math.sin(2 * ph)), rot=(6, 0, 6 * math.sin(ph)))
        p.rot("Spine", 4, 0, -4 * math.sin(ph)); p.rot("Chest", 2, 4 * math.sin(ph), -6 * math.sin(ph))
        p.rot("Neck", -14); p.rot("Head", -10, 0, 8 * math.sin(ph))
        p.key(f, "LINEAR")
    act["stride"] = speed * dur
    return [("Climb", act, True)]

if __name__ == "__main__": U.standalone(build)
