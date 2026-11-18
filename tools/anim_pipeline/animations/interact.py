"""Interact: 30 frames. Bend the knees, lean in, reach down with the right hand, grab, bring it to the chest."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U
import config as C

def build(rig):
    act, p, n = U.new_action(rig, "Interact", 30)
    U.stand(p); U.arms_down(p); p.arm_ik("R", 0); p.key(1)
    p.hips((0, 0.06, 0.8), rot=(22, 0, 6)); p.rot("Spine", 18); p.rot("Chest", 10, 0, 6); p.rot("Neck", -10); p.rot("Head", 12)
    p.foot("L", (0.13, -0.08, C.ANKLE_Z)); p.foot("R", (-0.13, 0.08, C.ANKLE_Z + 0.05), pitch=18)
    p.hand("R", (-0.16, -0.5, 0.45), 1.0, rot=(60, 0, 0)); p.rot("UpperArm", -20, 60, 0, side="L"); p.key(10)     # reach
    p.hips((0, 0.07, 0.78), rot=(24, 0, 6)); p.hand("R", (-0.16, -0.52, 0.42), 1.0, rot=(75, 0, 0)); p.key(14, "LINEAR")  # grab
    p.hips((0, 0.02, 0.9), rot=(6, 0, 2)); p.rot("Spine", 4); p.rot("Chest", 0); p.rot("Head", 4)
    p.hand("R", (-0.1, -0.28, 1.15), 1.0, rot=(-20, 0, 0)); p.key(22)                                               # to the chest
    U.stand(p); U.arms_down(p); p.hand("R", (-0.25, 0.05, 0.75), 0.0); p.key(n)
    return [("Interact", act, False)]

if __name__ == "__main__": U.standalone(build)
