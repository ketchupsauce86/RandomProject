"""Hurdle: 26 frames, in place. Take off from the right foot, lead leg shoots straight out, trail leg folds out to
the side over the bar, the opposite arm reaches for the lead foot, then snap down and run out."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U
import config as C

def build(rig):
    act, p, n = U.new_action(rig, "Hurdle", 26)
    def arms(l, r, el=50):
        p.rot("UpperArm", l, 66, 0, side="L"); p.rot("LowerArm", 0, 0, -el, side="L")
        p.rot("UpperArm", r, 66, 0, side="R"); p.rot("LowerArm", 0, 0, -el, side="R")
    p.hips((0, 0, 0.86), rot=(12, 0, 0)); p.foot("L", (0.11, 0.3, 0.2), pitch=30); p.foot("R", (-0.11, -0.25, C.ANKLE_Z), pitch=-10); arms(-35, 35); p.key(1)
    p.hips((0, 0.02, 0.84), rot=(16, 0, -6)); p.foot("L", (0.11, -0.2, 0.42), pitch=0); p.foot("R", (-0.11, 0.12, C.ANKLE_Z + 0.06), pitch=22); arms(30, -60); p.key(6, "LINEAR")   # take-off
    p.hips((0, 0, 1.08), rot=(30, 0, -8)); p.rot("Spine", 14); p.rot("Chest", 6, 0, 8); p.rot("Neck", -24); p.rot("Head", -14)
    p.foot("L", (0.12, -0.72, 0.78), pitch=-20)                                       # lead leg straight out
    p.foot("R", (-0.42, 0.2, 0.68), pitch=10, yaw=70, roll=60)                        # trail leg folded out sideways
    p.poles(knee=(0.1, -0.7, 0.52)); p.move("Pole_Knee", (-1.0, 0.0, 0.8), side="R")
    p.rot("UpperArm", 50, 60, 0, side="L"); p.rot("LowerArm", 0, 0, -40, side="L"); p.rot("UpperArm", -85, 40, 0, side="R"); p.rot("LowerArm", 0, 0, -10, side="R")
    p.key(11)
    p.hips((0, 0, 1.04), rot=(24, 0, -4)); p.foot("L", (0.12, -0.5, 0.45), pitch=-5); p.foot("R", (-0.36, 0.0, 0.62), pitch=0, yaw=50, roll=40); p.key(15)
    p.hips((0, 0, 0.84), rot=(10, 0, 0)); p.rot("Spine", 4); p.rot("Chest", 2); p.rot("Neck", -6); p.rot("Head", -4)
    p.foot("L", (0.11, -0.08, C.ANKLE_Z), pitch=-6); p.foot("R", (-0.14, -0.2, 0.36), pitch=10, yaw=0, roll=0)
    p.poles(); arms(-30, 30); p.key(19, "LINEAR")                                          # snap the lead leg down
    p.hips((0, 0, 0.87), rot=(12, 0, 0)); p.foot("L", (0.11, 0.25, C.ANKLE_Z + 0.04), pitch=18); p.foot("R", (-0.11, -0.3, 0.22), pitch=0); arms(35, -35); p.key(n)
    return [("Hurdle", act, False)]

if __name__ == "__main__": U.standalone(build)
