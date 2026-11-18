"""Run: 20-frame sprint loop with a real flight phase, a strong forward lean and pumping bent arms."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

def build(rig):
    act, p, n = U.new_action(rig, "Run", 20)
    act["stride"] = U.gait(p, n, speed=3.0, stance=0.34, lift=0.24, knee_lift=0.08, hip_z=0.845, bob=0.04, flight=0.06, lean=15, sway=3, twist=13, arm_swing=48, elbow=78, arm_down=66)
    return [("Run", act, True)]

if __name__ == "__main__": U.standalone(build)
