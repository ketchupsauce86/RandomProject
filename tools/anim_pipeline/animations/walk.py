"""Walk: 32-frame loop. Contact, down, passing, up on each side; hip sway and chest counter-turn; heel-to-toe."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

def build(rig):
    act, p, n = U.new_action(rig, "Walk", 32)
    stride = U.gait(p, n, speed=1.1, stance=0.6, lift=0.11, hip_z=0.885, bob=0.028, lean=4, sway=4, twist=9, arm_swing=26, elbow=18)
    act["stride"] = stride; return [("Walk", act, True)]

if __name__ == "__main__": U.standalone(build)
