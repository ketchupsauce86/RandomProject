"""Crawl: 36-frame loop on hands and knees. Diagonal pairs move together; planted hands and knees slide back at
the crawl speed so nothing skates; the spine waves side to side."""
import sys, os, math; sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import anim_utils as U

def build(rig):
    act, p, n = U.new_action(rig, "Crawl", 36)
    speed, st = 0.7, 0.62; dur = n / 30; L = speed * st * dur
    p.poles(knee=(0.15, -0.6, -0.4), elbow=(0.5, 0.4, 0.2))
    for f in range(1, n + 1):
        t = (f - 1) / n; ph = t * 2 * math.pi
        def step(off):
            u = (t + off) % 1
            if u < st: k = u / st; return L / 2 - L * k, 0
            k = (u - st) / (1 - st); return -L / 2 + L * U.smooth(k), math.sin(math.pi * k)
        for s, sg, off in (("L", 1, 0.0), ("R", -1, 0.5)):
            y, a = step(off); p.hand(s, (sg * 0.2, -0.62 - y, 0.06 + 0.08 * a), 1.0, rot=(-90, 0, 0))
            y, a = step(off + 0.5); p.foot(s, (sg * 0.13, 0.42 - y, 0.12 + 0.06 * a), pitch=-75)     # shins flat, knees down
        p.hips((0.02 * math.sin(ph), 0.08, 0.52 + 0.012 * math.sin(2 * ph)), rot=(84, 0, 6 * math.sin(ph)))
        p.rot("Spine", 4, 0, -6 * math.sin(ph)); p.rot("Chest", 2, 0, -6 * math.sin(ph))
        p.rot("Neck", -40); p.rot("Head", -30, 0, 6 * math.sin(ph))
        p.key(f, "LINEAR")
    act["stride"] = speed * dur
    return [("Crawl", act, True)]

if __name__ == "__main__": U.standalone(build)
