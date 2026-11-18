"""Death: 35 frames. Recoil, knees buckle, the body drops backward and settles flat on Z = 0 without clipping."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U
import config as C

def build(rig):
    act, p, n = U.new_action(rig, "Death", 35)
    U.stand(p); U.arms_down(p); p.key(1)
    p.hips((0, 0.04, 0.94), rot=(-12, 0, 0)); p.rot("Spine", -10); p.rot("Chest", -14); p.rot("Neck", 12); p.rot("Head", 14)
    for s in ("L", "R"): p.rot("UpperArm", -40, 30, 0, side=s); p.rot("LowerArm", 0, 0, -50, side=s)
    p.key(5, "LINEAR")                                                           # the hit snaps the chest back
    p.hips((0, 0.2, 0.62), rot=(-30, 0, 8)); p.foot("L", (0.14, -0.14, C.ANKLE_Z), pitch=-10); p.foot("R", (-0.14, -0.06, C.ANKLE_Z))
    for s in ("L", "R"): p.rot("UpperArm", -60, 10, 0, side=s)
    p.key(13)                                                                    # knees buckle
    p.hips((0, 0.42, 0.2), rot=(-82, 0, 10)); p.rot("Spine", -6); p.rot("Chest", -4); p.rot("Neck", -4); p.rot("Head", 10, 0, 20)
    p.foot("L", (0.16, -0.4, 0.2), pitch=-30); p.foot("R", (-0.18, -0.3, 0.16), pitch=-20)
    for s in ("L", "R"): p.rot("UpperArm", -10, -20, 20, side=s); p.rot("LowerArm", 0, 0, -10, side=s)
    p.key(21, "LINEAR")                                                          # hits the floor
    p.hips((0, 0.44, 0.23), rot=(-80, 0, 10)); p.foot("L", (0.17, -0.42, 0.14), pitch=-40); p.foot("R", (-0.18, -0.33, 0.12), pitch=-30); p.key(25)   # small bounce
    p.hips((0, 0.45, 0.18), rot=(-85, 0, 10)); p.foot("L", (0.18, -0.44, 0.09), pitch=-62); p.foot("R", (-0.2, -0.35, 0.09), pitch=-62)
    for s in ("L", "R"): p.rot("UpperArm", 0, -30, 25, side=s)
    p.key(n)                                                                     # settles
    return [("Death", act, False)]

if __name__ == "__main__": U.standalone(build)
