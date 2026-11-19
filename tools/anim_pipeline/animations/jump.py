"""Jump in three actions: Jump_Start (6-frame crouch, explosive extension), Jump_Air (asymmetric hang loop,
limbs dragging), Jump_Land (knees and hips soak the hit, then recover to idle)."""
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U
import config as C

def crouch(p, depth=0.22, arms_back=40):
    p.hips((0, 0.04, 0.93 - depth), rot=(18, 0, 0)); p.rot("Spine", 12); p.rot("Chest", 8); p.rot("Neck", -14); p.rot("Head", -10)
    p.foot("L", (0.13, 0, C.ANKLE_Z)); p.foot("R", (-0.13, 0, C.ANKLE_Z))
    for s in ("L", "R"): p.rot("UpperArm", arms_back, 62, 0, side=s); p.rot("LowerArm", 0, 0, -20, side=s)

def air(p, k=0.0):
    w = math.sin(k * 2 * math.pi)
    p.hips((0, 0, 1.05 + 0.01 * w), rot=(-4 + 2 * w, 0, 4)); p.rot("Spine", -3); p.rot("Chest", -4, 0, -5); p.rot("Neck", 4); p.rot("Head", 2)
    p.foot("L", (0.12, -0.16, 0.48 + 0.02 * w), pitch=10); p.foot("R", (-0.12, 0.2, 0.36 - 0.02 * w), pitch=30)     # one knee up, one trailing
    p.rot("UpperArm", -70 - 4 * w, 30, 0, side="L"); p.rot("LowerArm", 0, 0, -30, side="L")
    p.rot("UpperArm", 20 + 4 * w, 45, 0, side="R"); p.rot("LowerArm", 0, 0, -25, side="R")
    for s in ("L", "R"): p.rot("Hand", 0, 14 + 4 * w, 0, side=s)

def build(rig):
    out = []
    act, p, n = U.new_action(rig, "Jump_Start", 14)
    U.stand(p); U.arms_down(p); p.key(1)
    crouch(p); p.key(7, "LINEAR")                                  # snappy 6-frame anticipation
    p.hips((0, -0.02, 1.02), rot=(-6, 0, 0)); p.rot("Spine", -4); p.rot("Chest", -6); p.rot("Neck", 6); p.rot("Head", 4)
    p.foot("L", (0.12, 0.02, 0.16), pitch=40); p.foot("R", (-0.12, 0.02, 0.16), pitch=40)
    for s in ("L", "R"): p.rot("UpperArm", -95, 35, 0, side=s); p.rot("LowerArm", 0, 0, -12, side=s)
    p.key(10, "BEZIER")                                            # explosive extension, toes last off the floor
    air(p); p.key(n)
    out.append(("Jump_Start", act, False))
    act, p, n = U.new_action(rig, "Jump_Air", 20)
    for f in range(1, n + 1, 5): air(p, (f - 1) / n); p.key(f)
    U.close_loop(p, n, lambda p: air(p, 0)); out.append(("Jump_Air", act, True))
    act, p, n = U.new_action(rig, "Jump_Land", 18)
    air(p); p.key(1, "LINEAR")
    p.hips((0, 0.02, 0.98)); p.foot("L", (0.13, -0.03, C.ANKLE_Z + 0.03), pitch=-10); p.foot("R", (-0.13, 0.03, C.ANKLE_Z + 0.03), pitch=-10); p.key(3, "LINEAR")
    crouch(p, depth=0.26, arms_back=-25); p.rot("UpperArm", -25, 55, 0, side="L"); p.rot("UpperArm", -25, 55, 0, side="R"); p.key(6, "BEZIER")   # impact
    crouch(p, depth=0.2, arms_back=-12); p.key(10)
    U.stand(p); U.arms_down(p); p.rot("Chest", 2); p.key(15)
    U.stand(p); U.arms_down(p); p.key(n)
    out.append(("Jump_Land", act, False))
    return out

if __name__ == "__main__": U.standalone(build)
