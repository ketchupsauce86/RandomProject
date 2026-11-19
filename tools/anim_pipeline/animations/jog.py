"""Directional jogs (24-frame loops): forward, back, left, right. Feet lock to the ground in every direction;
going sideways the swinging foot passes in front so the legs never cross through each other."""
import sys, os; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

DIRS = {"Jog_Fwd": ((0, -1), 9, 0, False), "Jog_Bwd": ((0, 1), -5, 0, False),
        "Jog_Left": ((1, 0), 3, 14, True), "Jog_Right": ((-1, 0), 3, -14, True)}

def build(rig):
    out = []
    for name, (d, lean, yaw, side) in DIRS.items():
        act, p, n = U.new_action(rig, name, 24)
        act["stride"] = U.gait(p, n, speed=2.0 if not side else 1.7, direction=d, stance=0.42, lift=0.15, hip_z=0.86, bob=0.035, flight=0.02,
               lean=lean, sway=3, twist=10 if not side else 5, arm_swing=34 if not side else 20, elbow=60, arm_down=70, side_step=side, yaw=yaw)
        out.append((name, act, True))
    return out

if __name__ == "__main__": U.standalone(build)
