"""Attack_Slash: 28 frames. 8-frame wind-up (right arm and chest pull back), a 4-frame smear across the body
with a heavy torso twist, then 16 frames of follow-through and recovery."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U
import config as C

def stance(p, twist, hip_z=0.86, lean=6):
    p.hips((0, 0, hip_z), rot=(lean, 0, twist * 0.4)); p.rot("Spine", lean * 0.5, 0, twist * 0.3); p.rot("Chest", 0, 0, twist * 0.45)
    p.rot("Neck", -lean * 0.5, 0, -twist * 0.5); p.rot("Head", 0, 0, -twist * 0.35)
    p.foot("L", (0.16, -0.18, C.ANKLE_Z), yaw=-12); p.foot("R", (-0.16, 0.16, C.ANKLE_Z), yaw=20)

def build(rig):
    act, p, n = U.new_action(rig, "Attack_Slash", 28)
    stance(p, 0); U.arms_down(p, bend=40)
    p.rot("UpperArm", -30, 60, 0, side="R"); p.rot("LowerArm", 0, 0, -60, side="R"); p.key(1)
    stance(p, -42, hip_z=0.84)                                    # wind-up: chest and right arm back
    p.rot("UpperArm", 25, -10, 45, side="R"); p.rot("LowerArm", 0, 0, -75, side="R"); p.rot("Hand", 0, 0, -20, side="R")
    p.rot("UpperArm", -45, 55, 0, side="L"); p.rot("LowerArm", 0, 0, -40, side="L"); p.key(9, "LINEAR")
    stance(p, 50, hip_z=0.82, lean=10)                            # the swing: 4 frames, everything whips across
    p.rot("UpperArm", -70, 20, -70, side="R"); p.rot("LowerArm", 0, 0, -5, side="R"); p.rot("Hand", 0, 0, 25, side="R")
    p.rot("UpperArm", 20, 70, 20, side="L"); p.rot("LowerArm", 0, 0, -30, side="L"); p.key(13, "BEZIER")
    stance(p, 58, hip_z=0.81, lean=12)                            # follow-through overshoot
    p.rot("UpperArm", -60, 35, -82, side="R"); p.rot("LowerArm", 0, 0, -12, side="R"); p.rot("Hand", 0, 0, 30, side="R"); p.key(17)
    stance(p, 0); U.arms_down(p, bend=40); p.rot("UpperArm", -30, 60, 0, side="R"); p.rot("LowerArm", 0, 0, -60, side="R"); p.key(n)
    return [("Attack_Slash", act, False)]

if __name__ == "__main__": U.standalone(build)
