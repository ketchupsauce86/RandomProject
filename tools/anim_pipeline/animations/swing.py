"""Swing: 48-frame loop hanging from a bar overhead (z = 2.25). The body swings like a pendulum from the
hands, the legs lag and pump (knees tuck on the backswing, kick out in front)."""
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U
from mathutils import Vector, Matrix

BAR = 2.25

def build(rig):
    act, p, n = U.new_action(rig, "Swing", 48)
    p.poles(knee=(0.1, -0.7, 0.4), elbow=(0.7, 0.3, 1.9))
    for f in range(1, n + 1):
        t = (f - 1) / n; ph = t * 2 * math.pi; th = math.radians(32) * math.sin(ph)    # + swings the body forward (-Y)
        R = Matrix.Rotation(-th, 3, "X")                                                 # about the bar
        hip = Vector((0, 0, BAR)) + R @ Vector((0, 0.0, -1.32))
        p.hips(tuple(hip), rot=(-math.degrees(th) * 0.8, 0, 0))
        lag = math.radians(18) * math.sin(ph - 1.1); kick = math.sin(ph - 0.5)
        RL = Matrix.Rotation(-(th + lag), 3, "X")
        for s, sg in (("L", 1), ("R", -1)):
            p.hand(s, (sg * 0.22, 0, BAR), 1.0, rot=(-90, 0, 0))
            leg = Vector((sg * 0.11, 0, 0)) + RL @ Vector((0, -0.18 * max(0, -kick), -0.84 + 0.22 * max(0, -kick)))
            p.foot(s, tuple(hip + leg), pitch=20 * kick)
        p.rot("Spine", -4 * math.sin(ph)); p.rot("Chest", -8 * math.sin(ph - 0.4)); p.rot("Neck", 10 * math.sin(ph)); p.rot("Head", 6)
        p.key(f, "LINEAR")
    return [("Swing", act, True)]

if __name__ == "__main__": U.standalone(build)
