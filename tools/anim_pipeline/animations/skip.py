"""Skip: 24-frame playful loop. Short contacts, a hop off each foot, high knees and big arm swings."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

def build(rig):
    act, p, n = U.new_action(rig, "Skip", 24)
    act["stride"] = U.gait(p, n, speed=1.8, stance=0.3, lift=0.08, knee_lift=0.28, hip_z=0.88, bob=0.02, flight=0.11, lean=3, sway=5, twist=7, arm_swing=58, elbow=55, arm_down=60)
    return [("Skip", act, True)]

if __name__ == "__main__": U.standalone(build)
