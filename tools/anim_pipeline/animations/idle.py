"""Idle: a 60-frame breathing loop. Hips bob, the chest swells against them, elbows drift out, head tilts."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

def pose(p, k):     # k: 0..1 around the breath
    import math
    b = (1 - math.cos(k * 2 * math.pi)) / 2          # 0 exhaled .. 1 inhaled
    U.stand(p, hip_z=0.93 - 0.012 * (1 - b))
    p.rot("Hips", 0, 0, 2); p.rot("Spine", -1 * b, 0, -1); p.rot("Chest", -3 * b + 1, 2 * math.sin(k * 2 * math.pi), -1)
    p.rot("Neck", 2 - 1.5 * b); p.rot("Head", 1 - 2 * b, 4 * math.sin(k * 2 * math.pi + 0.8), 3)
    for s in ("L", "R"):
        p.rot("Shoulder", 0, -3 * b, 0, side=s)
        p.rot("UpperArm", -4, 74 - 5 * b, 0, side=s); p.rot("LowerArm", 0, 0, -16 - 4 * b, side=s); p.rot("Hand", 0, 10, 0, side=s)

def build(rig):
    act, p, n = U.new_action(rig, "Idle", 60)
    for i, k in enumerate((0, 0.25, 0.5, 0.75)):
        pose(p, k); p.key(1 + k * (n - 1))
    U.close_loop(p, n, lambda p: pose(p, 0))
    return [("Idle", act, True)]

if __name__ == "__main__": U.standalone(build)
