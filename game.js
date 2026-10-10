(() => {
  // src/game.ts
  (function() {
    "use strict";
    const $ = (id) => document.getElementById(id);
    window.addEventListener("error", (e) => {
      const el = $("err");
      if (el) el.textContent = "Something broke: " + e.message;
    });
    if (!window.THREE) {
      $("err").textContent = "The 3D engine did not load. Check your internet connection and reload.";
      return;
    }
    const T = THREE, V = T.Vector3;
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, t) => a + (b - a) * t;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const smooth = (e0, e1, x) => {
      const t = clamp((x - e0) / (e1 - e0), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const fmtTime = (s) => {
      s = Math.max(0, Math.ceil(s));
      return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
    };
    function angLerp(a, b, t) {
      let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      return a + d * t;
    }
    const DIFF = { easy: { dmg: 0.28, spread: 1.7, react: [0.9, 1.5], cad: 2.6, head: 0.04, range: 65, cover: 0.2 }, normal: { dmg: 0.4, spread: 1.15, react: [0.6, 1.1], cad: 2, head: 0.08, range: 80, cover: 0.4 }, hard: { dmg: 0.8, spread: 0.5, react: [0.18, 0.38], cad: 1.15, head: 0.24, range: 130, cover: 0.7 } };
    const ZG = { L: 125, H: 90, BOTS: 50, state: "float", t: 0, camRoll: 0, flash: 0, blocks: [], flyers: [], pads: [] };
    const diff = "hard";
    const GRAV = 30;
    const RAR = [{ n: "Common", c: "#a4abb5", m: 1 }, { n: "Uncommon", c: "#55c95f", m: 1.05 }, { n: "Rare", c: "#3fa0f5", m: 1.1 }, { n: "Epic", c: "#b866f5", m: 1.16 }, { n: "Legendary", c: "#f5a83b", m: 1.22 }];
    const WEAP = {
      ar: { name: "Assault Rifle", short: "AR", dmg: 30, rate: 0.16, mag: 30, reload: 2.2, spread: 0.012, bloom: 0.035, auto: true, ammo: "medium", range: 320, pellets: 1, head: 1.5, recoil: 6e-3, pref: 24 },
      smg: { name: "SMG", short: "SMG", dmg: 17, rate: 0.075, mag: 30, reload: 2, spread: 0.03, bloom: 0.03, auto: true, ammo: "light", range: 160, pellets: 1, head: 1.5, recoil: 4e-3, pref: 12 },
      pump: { name: "Pump Shotgun", short: "PUMP", dmg: 9.5, rate: 0.95, mag: 5, reload: 4, spread: 0.075, bloom: 0, auto: false, ammo: "shells", range: 45, pellets: 10, head: 1.6, recoil: 0.05, falloff: true, pref: 5 },
      pistol: { name: "Pistol", short: "PISTOL", dmg: 24, rate: 0.2, mag: 16, reload: 1.4, spread: 0.015, bloom: 0.03, auto: false, ammo: "light", range: 180, pellets: 1, head: 1.8, recoil: 0.012, pref: 18 },
      sniper: { name: "Bolt Sniper", short: "SNIPER", dmg: 105, rate: 1.6, mag: 1, reload: 2.4, spread: 15e-4, bloom: 0, auto: false, ammo: "heavy", range: 700, pellets: 1, head: 2.5, recoil: 0.05, zoom: true, pref: 55 }
    };
    const CONS = {
      mini: { name: "Small Shield", short: "MINI", time: 2, shield: 25, cap: 50, stack: 6, give: 3, color: "#7cc8ff" },
      big: { name: "Shield Potion", short: "BIG POT", time: 4, shield: 50, cap: 100, stack: 3, give: 1, color: "#3d7bff" }
    };
    const NAMES = ["Pixel_Pete", "OrbitOllie", "JoltJess", "NovaNate", "FlipFiona", "HoverHugo", "LoopLarry", "SpinSally", "ZipZane", "BounceBea", "DashDev", "GlideGwen", "TwirlTom", "VoidVic", "SkySkye", "PogoPaul", "RicoRay", "TumbleTess", "QuasarQuin", "DizzyDee", "WobbleWes", "ComboCleo", "StaticStan", "FuzzFelix", "RocketRue", "PingPia", "BlinkBo", "SlingSid", "KiteKira", "MothMilo", "DriftDot", "NoScopeNora", "LlamaDrama", "FloatBot9000", "SweatyTaco", "CrankKing", "DriftRat", "ShieldSipper", "GravGus", "CeilingChaser", "TiltedTina", "ZeroGoblin", "BoxFighter", "DustyDan", "BananaBro", "CornerCarl", "BlockBrenda", "HeadshotHank", "WarpWendy"];
    const canvas = $("c");
    const renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    const scene = new T.Scene();
    scene.fog = new T.Fog(15132908, 70, 330);
    renderer.setClearColor(15132908);
    const camera = new T.PerspectiveCamera(72, 1, 0.1, 2600);
    function resize() {
      renderer.setSize(innerWidth, innerHeight);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
    addEventListener("resize", resize);
    resize();
    const hemi = new T.HemisphereLight(16777215, 12172998, 0.95);
    scene.add(hemi);
    const sun = new T.DirectionalLight(16777215, 0.55);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 420 });
    sun.shadow.bias = -8e-4;
    scene.add(sun);
    scene.add(sun.target);
    const SUN_DIR = new V(0.5, 1, 0.35).normalize();
    function canvasTex(w, h, draw) {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      draw(c.getContext("2d"), w, h);
      const t = new T.CanvasTexture(c);
      t.anisotropy = 4;
      return t;
    }
    const Lam = (o) => new T.MeshLambertMaterial(o);
    const colorMats = /* @__PURE__ */ new Map();
    function colorMat(c) {
      if (!colorMats.has(c)) colorMats.set(c, Lam({ color: c }));
      return colorMats.get(c);
    }
    const GEO = {
      handle: new T.CylinderGeometry(0.04, 0.04, 0.95, 6),
      pickHead: new T.BoxGeometry(0.7, 0.1, 0.1),
      puff: new T.SphereGeometry(0.22, 6, 4),
      shell: new T.BoxGeometry(0.04, 0.04, 0.1)
    };
    const glowTex = canvasTex(64, 64, (g) => {
      const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, "rgba(255,255,255,1)");
      gr.addColorStop(0.25, "rgba(255,255,255,.55)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 64);
    });
    const beamTex = canvasTex(8, 64, (g) => {
      const gr = g.createLinearGradient(0, 64, 0, 0);
      gr.addColorStop(0, "rgba(255,255,255,.95)");
      gr.addColorStop(0.5, "rgba(255,255,255,.3)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 8, 64);
    });
    const ringTex = canvasTex(128, 128, (g) => {
      const gr = g.createRadialGradient(64, 64, 30, 64, 64, 62);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.55, "rgba(255,255,255,.95)");
      gr.addColorStop(0.7, "rgba(255,255,255,.35)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    });
    const sparkTex = canvasTex(32, 32, (g) => {
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(16, 0);
      g.quadraticCurveTo(18, 14, 32, 16);
      g.quadraticCurveTo(18, 18, 16, 32);
      g.quadraticCurveTo(14, 18, 0, 16);
      g.quadraticCurveTo(14, 14, 16, 0);
      g.fill();
    });
    const flashMat = new T.SpriteMaterial({ map: glowTex, color: 16761946, blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false });
    const BX = (w, h, d) => new T.BoxGeometry(w, h, d);
    const GPh = (c, s, sp) => new T.MeshPhongMaterial({ color: c, shininess: s, specular: sp == null ? 2763306 : sp });
    const GUN_MAT = {
      poly: GPh(1974050, 12, 1447446),
      steel: GPh(3093047, 60, 4868682),
      dark: GPh(1381912, 35),
      bare: GPh(9080726, 90, 8947848),
      wood: GPh(7226149, 18),
      glass: new T.MeshPhongMaterial({ color: 1056814, specular: 16777215, shininess: 140, emissive: 529440 }),
      dot: new T.MeshBasicMaterial({ color: 16722474 })
    };
    const FURN = [GPh(2500394, 14), GPh(4936503, 14), GPh(3886694, 24), GPh(5192550, 24), GPh(13214266, 90, 16773296)];
    function prof(pts, w, bev) {
      const s = new T.Shape();
      s.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) {
        const p = pts[i];
        if (p.length === 4) s.quadraticCurveTo(p[0], p[1], p[2], p[3]);
        else s.lineTo(p[0], p[1]);
      }
      const b = bev == null ? 5e-3 : bev, d = Math.max(2e-3, w - 2 * b);
      return new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 8 }).translate(0, 0, -d / 2).rotateY(-Math.PI / 2);
    }
    const gtube = (r1, r2, l, s, flat) => {
      const g = new T.CylinderGeometry(r1, r2, l, s || 14);
      if (flat) g.rotateY(Math.PI / s);
      return g.rotateX(Math.PI / 2);
    };
    const ribs = (n, z0, dz, y, w) => Array.from({ length: n }, (_, i) => [BX(w || 0.05, 8e-3, 0.012), "dark", 0, y, z0 - i * dz]);
    const GUARD = (z0, z1, y) => [[BX(0.012, 8e-3, z0 - z1), "dark", 0, y, (z0 + z1) / 2], [BX(0.012, 0.03, 8e-3), "dark", 0, y + 0.015, z1], [BX(6e-3, 0.03, 8e-3), "dark", 0, y + 0.02, (z0 + z1) / 2 + 5e-3]];
    const REDDOT = (y, z) => [[BX(0.036, 0.04, 0.06), "dark", 0, y, z], [gtube(0.015, 0.015, 4e-3), "glass", 0, y + 4e-3, z - 0.031], [BX(4e-3, 4e-3, 2e-3), "dot", 0, y + 4e-3, z + 0.02]];
    const GUN_PARTS = {
      ar: () => [
        // M4-style carbine
        [prof([[0.2, -0.015], [0.2, 0.06], [-0.12, 0.06], [-0.12, -0.015]], 0.062), "steel", 0, 0, 0],
        [BX(4e-3, 0.028, 0.1), "dark", 0.032, 0.022, 0.05],
        [BX(0.05, 0.012, 0.03), "dark", 0, 0.052, 0.21],
        [prof([[0.17, -0.015], [0.17, -0.07], [0.12, -0.085], [0.02, -0.085], [0, -0.07], [-0.1, -0.07], [-0.11, -0.015]], 0.058), "steel", 0, 0, 0],
        [prof([[-5e-3, -0.07], [-0.085, -0.07], [-0.095, -0.2, -0.14, -0.31], [-0.07, -0.33], [-0.02, -0.2, -5e-3, -0.07]], 0.05), "poly", 0, 0, 0],
        [prof([[0.13, -0.07], [0.075, -0.07], [0.105, -0.24], [0.16, -0.25], [0.17, -0.23]], 0.045), "poly", 0, 0, 0],
        ...GUARD(0.07, -5e-3, -0.1),
        [BX(0.045, 0.018, 0.66), "dark", 0, 0.068, -0.15],
        ...ribs(22, 0.17, 0.03, 0.08),
        [gtube(0.043, 0.043, 0.36, 8, true), "furn", 0, 0.014, -0.3],
        [BX(0.012, 0.012, 0.3), "dark", 0.047, 0.014, -0.3],
        [BX(0.012, 0.012, 0.3), "dark", -0.047, 0.014, -0.3],
        [BX(0.02, 0.012, 0.3), "dark", 0, -0.032, -0.3],
        [gtube(0.048, 0.048, 0.02, 16), "dark", 0, 0.014, -0.11],
        [gtube(0.013, 0.013, 0.15, 12), "steel", 0, 0.014, -0.555],
        [prof([[-0.47, 0], [-0.47, 0.03], [-0.48, 0.1], [-0.495, 0.1], [-0.51, 0.03], [-0.51, 0]], 0.024, 3e-3), "dark", 0, 0, 0],
        [gtube(0.02, 0.02, 0.06, 10), "dark", 0, 0.014, -0.64],
        [gtube(0.021, 0.021, 0.22, 12), "steel", 0, 0.026, 0.31],
        [prof([[0.28, 0.055], [0.5, 0.062], [0.52, 0.05], [0.52, -0.1], [0.49, -0.105], [0.4, -0.03], [0.28, -5e-3]], 0.05), "furn", 0, 0, 0],
        [BX(0.054, 0.165, 0.02), "dark", 0, -0.02, 0.53],
        [BX(0.03, 0.03, 0.035), "dark", 0, 0.094, 0.15]
      ],
      smg: () => [
        // MP5-style
        [gtube(0.035, 0.035, 0.42, 14), "steel", 0, 0.022, -0.01],
        [BX(0.04, 0.014, 0.34), "dark", 0, 0.06, 0],
        ...ribs(11, 0.15, 0.03, 0.07, 0.044),
        [prof([[0.14, -5e-3], [0.14, -0.05], [0.02, -0.05], [-0.03, -0.02], [-0.03, -5e-3]], 0.05), "poly", 0, 0, 0],
        [prof([[0.13, -0.05], [0.08, -0.05], [0.1, -0.2], [0.15, -0.21], [0.16, -0.19]], 0.045), "poly", 0, 0, 0],
        ...GUARD(0.07, 5e-3, -0.075),
        [prof([[-0.04, -0.01], [-0.1, -0.01], [-0.12, -0.15, -0.16, -0.27], [-0.12, -0.29], [-0.07, -0.15, -0.04, -0.01]], 0.03), "dark", 0, 0, 0],
        [gtube(0.042, 0.036, 0.17, 12), "furn", 0, 6e-3, -0.16],
        [gtube(0.012, 0.012, 0.2, 10), "steel", 0, 0.022, -0.33],
        [gtube(0.018, 0.018, 0.05, 10), "dark", 0, 0.022, -0.445],
        [gtube(0.02, 0.02, 0.03, 12), "dark", 0, 0.075, -0.2],
        [gtube(0.018, 0.018, 0.03, 12), "dark", 0, 0.075, 0.17],
        [gtube(6e-3, 6e-3, 0.22, 6), "steel", 0.026, 0.03, 0.3],
        [gtube(6e-3, 6e-3, 0.22, 6), "steel", -0.026, 0.03, 0.3],
        [prof([[0.4, 0.05], [0.43, 0.05], [0.43, -0.08], [0.4, -0.08]], 0.06), "poly", 0, 0, 0]
      ],
      pump: () => [
        // 870-style pump shotgun
        [prof([[0.2, -0.04], [0.2, 0.05], [-0.1, 0.05], [-0.12, 0.03], [-0.12, -0.04]], 0.06), "steel", 0, 0, 0],
        [BX(4e-3, 0.03, 0.08), "dark", 0.031, 0.015, 0.04],
        [prof([[0.16, -0.04], [0.16, -0.06], [0, -0.06], [-0.02, -0.04]], 0.04), "dark", 0, 0, 0],
        ...GUARD(0.13, 0.05, -0.075),
        [gtube(0.02, 0.02, 0.64, 14), "steel", 0, 0.025, -0.42],
        [BX(0.012, 8e-3, 0.6), "dark", 0, 0.049, -0.42],
        [new T.SphereGeometry(6e-3, 8, 6), "bare", 0, 0.057, -0.72],
        [gtube(0.017, 0.017, 0.5, 12), "steel", 0, -0.02, -0.35],
        [gtube(0.019, 0.019, 0.03, 12), "dark", 0, -0.02, -0.615],
        [gtube(0.036, 0.036, 0.2, 14), "pump", 0, -0.012, -0.38],
        ...Array.from({ length: 6 }, (_, i) => [gtube(0.038, 0.038, 0.01, 14), "pump", 0, -0.012, -0.46 + i * 0.03]),
        [prof([[0.2, 0.04], [0.23, 0.045], [0.52, 0], [0.535, -0.02], [0.535, -0.135], [0.49, -0.135], [0.28, -0.08], [0.21, -0.07, 0.2, -0.04]], 0.05), "stock", 0, 0, 0],
        [BX(0.054, 0.14, 0.022), "dark", 0, -0.067, 0.545]
      ],
      pistol: () => [
        // Glock-style
        [prof([[0.08, 0], [0.08, 0.075], [-0.24, 0.075], [-0.25, 0.065], [-0.25, 0]], 0.05, 4e-3), "steel", 0, 0, 0],
        ...Array.from({ length: 5 }, (_, i) => [BX(0.054, 0.04, 4e-3), "dark", 0, 0.045, 0.035 + i * 0.01]),
        [prof([[0.07, -5e-3], [0.07, 5e-3], [-0.24, 5e-3], [-0.24, -0.025], [-0.04, -0.03], [-0.03, -0.02]], 0.046), "poly", 0, 0, 0],
        [prof([[0.085, 0], [0, -0.02], [0.03, -0.18], [0.1, -0.18], [0.1, -0.03]], 0.045), "poly", 0, 0, 0],
        ...GUARD(0, -0.06, -0.065),
        [BX(0.03, 0.012, 0.012), "dark", 0, 0.082, 0.07],
        [BX(6e-3, 0.012, 8e-3), "dark", 0, 0.082, -0.23],
        [gtube(0.011, 0.011, 0.012, 10), "dark", 0, 0.045, -0.25]
      ],
      sniper: () => [
        // bolt-action precision rifle
        [gtube(0.032, 0.032, 0.32, 14), "steel", 0, 0.02, 0],
        [BX(0.07, 0.01, 0.01), "bare", 0.05, 0.02, 0.12],
        [new T.SphereGeometry(0.014, 10, 8), "dark", 0.09, 0.02, 0.12],
        [gtube(0.024, 0.016, 0.78, 14), "steel", 0, 0.02, -0.55],
        [gtube(0.026, 0.026, 0.12, 10), "dark", 0, 0.02, -1],
        [BX(0.056, 0.012, 0.03), "dark", 0, 0.02, -0.98],
        [prof([[-0.5, -5e-3], [0.18, -5e-3], [0.3, 0.04], [0.6, 0.045], [0.62, 0.03], [0.62, -0.13], [0.58, -0.14], [0.38, -0.07], [0.24, -0.07], [0.21, -0.2], [0.14, -0.2], [0.12, -0.07], [-0.45, -0.065], [-0.5, -0.04]], 0.07), "furn", 0, 0, 0],
        ...GUARD(0.11, 0.03, -0.085),
        [BX(0.04, 0.06, 0.09), "dark", 0, -0.09, -0.02],
        [gtube(0.02, 0.02, 0.3, 14), "dark", 0, 0.12, 0],
        [gtube(0.02, 0.034, 0.08, 16), "dark", 0, 0.12, -0.19],
        [gtube(0.034, 0.034, 0.06, 16), "dark", 0, 0.12, -0.26],
        [gtube(0.031, 0.031, 4e-3, 16), "glass", 0, 0.12, -0.291],
        [gtube(0.03, 0.02, 0.06, 14), "dark", 0, 0.12, 0.18],
        [new T.CylinderGeometry(0.014, 0.014, 0.03, 10), "dark", 0, 0.15, 0],
        [new T.CylinderGeometry(0.012, 0.012, 0.03, 10).rotateZ(Math.PI / 2), "dark", 0.03, 0.12, 0],
        [gtube(0.024, 0.024, 0.02, 14), "steel", 0, 0.12, -0.08],
        [gtube(0.024, 0.024, 0.02, 14), "steel", 0, 0.12, 0.08],
        [BX(0.02, 0.07, 0.02), "steel", 0, 0.075, -0.08],
        [BX(0.02, 0.07, 0.02), "steel", 0, 0.075, 0.08]
      ]
    };
    const MUZZLE = { ar: [0.014, -0.67], smg: [0.022, -0.47], pump: [0.025, -0.74], pistol: [0.045, -0.26], sniper: [0.02, -1.06] };
    const EXTRA = {
      ar: [[2, ...REDDOT(0.1, 0.02)], [3, [prof([[-0.34, -0.04], [-0.38, -0.04], [-0.375, -0.13], [-0.345, -0.13]], 0.03), "poly", 0, 0, 0]], [4, [gtube(0.026, 0.026, 0.18, 16), "dark", 0, 0.014, -0.76]]],
      smg: [[2, ...REDDOT(0.09, 0.02)], [3, [prof([[-0.13, -0.03], [-0.17, -0.03], [-0.165, -0.12], [-0.135, -0.12]], 0.03), "poly", 0, 0, 0]], [4, [gtube(0.024, 0.024, 0.16, 16), "dark", 0, 0.022, -0.55]]],
      pump: [[2, [BX(6e-3, 0.045, 0.1), "dark", 0.034, -5e-3, 0.08], ...[0.05, 0.07, 0.09, 0.11].map((z) => [new T.CylinderGeometry(9e-3, 9e-3, 0.04, 8), "shell", 0.04, -5e-3, z])], [3, [BX(0.03, 0.03, 0.02), "dark", 0, 0.065, 0.16]], [4, ...REDDOT(0.075, 0.05)]],
      pistol: [[2, [BX(0.035, 0.03, 0.06), "dark", 0, -0.03, -0.19], [gtube(0.012, 0.012, 4e-3, 10), "glass", 0, -0.03, -0.221]], [3, ...REDDOT(0.095, 0)], [4, [BX(0.05, 0.07, 0.035), "steel", 0, 0.04, -0.27]]],
      sniper: [[2, [BX(0.012, 0.012, 0.2), "steel", 0.02, -0.08, -0.38], [BX(0.012, 0.012, 0.2), "steel", -0.02, -0.08, -0.38]], [4, [gtube(0.032, 0.032, 0.2, 16), "dark", 0, 0.02, -1.16]]]
    };
    const SUPP = { ar: [4, -0.18], smg: [4, -0.16], pistol: [4, -0.03], sniper: [4, -0.2] };
    const SHELL_MAT = GPh(11740715, 30);
    function partMat(mk, r) {
      return mk === "furn" || mk === "pump" ? FURN[r] : mk === "stock" ? r < 2 ? GUN_MAT.wood : FURN[r] : mk === "shell" ? SHELL_MAT : GUN_MAT[mk];
    }
    const gunGeoCache = {};
    function mergeParts(parts) {
      const pos = [], nor = [], uv = [], m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler(), one = new T.Vector3(1, 1, 1);
      for (const [geo, , x, y, z, rx] of parts) {
        e.set(rx || 0, 0, 0);
        m.compose(new T.Vector3(x, y, z), q.setFromEuler(e), one);
        const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(m);
        pos.push(...g.attributes.position.array);
        nor.push(...g.attributes.normal.array);
        if (g.attributes.uv) uv.push(...g.attributes.uv.array);
        else uv.push(...new Array(g.attributes.position.count * 2).fill(0));
        g.dispose();
      }
      const out = new T.BufferGeometry();
      out.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      out.setAttribute("normal", new T.Float32BufferAttribute(nor, 3));
      out.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      out.computeBoundingSphere();
      return out;
    }
    function makeGunModel(id, r) {
      const key = id + r;
      if (!gunGeoCache[key]) {
        const parts = GUN_PARTS[id]();
        for (const [minR, ...ps] of EXTRA[id]) if (r >= minR) parts.push(...ps);
        const by = {};
        for (const p of parts) {
          if (p[1] === "pump") {
            p[4] += 0.38;
          }
          (by[p[1]] = by[p[1]] || []).push(p);
        }
        gunGeoCache[key] = Object.keys(by).map((mk) => [mk, mergeParts(by[mk])]);
      }
      const g = new T.Group();
      for (const [mk, geo] of gunGeoCache[key]) {
        const m = new T.Mesh(geo, partMat(mk, r));
        m.castShadow = true;
        if (mk === "pump") {
          m.position.z = -0.38;
          g.userData.pump = m;
        }
        g.add(m);
      }
      const s = SUPP[id], mz = new T.Object3D();
      mz.position.set(0, MUZZLE[id][0], MUZZLE[id][1] + (s && r >= s[0] ? s[1] : 0));
      g.add(mz);
      g.userData.muzzle = mz;
      return g;
    }
    const consGeo = {};
    function makeConsModel(id) {
      const g = new T.Group(), add = (geo, col, x, y, z, rz) => {
        const m = new T.Mesh(geo, typeof col === "number" ? colorMat(col) : col);
        m.position.set(x || 0, y || 0, z || 0);
        if (rz) m.rotation.z = rz;
        m.castShadow = true;
        g.add(m);
        return m;
      };
      if (!consGeo.neck) {
        Object.assign(consGeo, { flaskS: new T.SphereGeometry(0.16, 14, 10), flaskB: new T.SphereGeometry(0.23, 14, 10), neck: new T.CylinderGeometry(0.06, 0.06, 0.14, 10), cork: new T.CylinderGeometry(0.07, 0.07, 0.06, 10) });
      }
      {
        const big = id === "big", liquid = Lam({ color: CONS[id].color, emissive: new T.Color(CONS[id].color).multiplyScalar(0.5) });
        add(big ? consGeo.flaskB : consGeo.flaskS, liquid);
        add(consGeo.neck, 14675967, 0, big ? 0.27 : 0.2, 0);
        add(consGeo.cork, 9067058, 0, big ? 0.36 : 0.29, 0);
      }
      return g;
    }
    const auraCache = /* @__PURE__ */ new Map();
    function auraMats(col) {
      if (auraCache.has(col)) return auraCache.get(col);
      const c = new T.Color(col);
      const o = {
        halo: new T.SpriteMaterial({ map: glowTex, color: c, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8, fog: false }),
        spark: new T.SpriteMaterial({ map: sparkTex, color: c.clone().lerp(new T.Color(16777215), 0.45), blending: T.AdditiveBlending, depthWrite: false, transparent: true, fog: false }),
        beam: new T.MeshBasicMaterial({ map: beamTex, color: c, blending: T.AdditiveBlending, depthWrite: false, transparent: true, side: T.DoubleSide, opacity: 0.75 }),
        ring: new T.MeshBasicMaterial({ map: ringTex, color: c, blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.95 })
      };
      auraCache.set(col, o);
      return o;
    }
    let AC = null, NB = null, BB = null, master = null, bus = null, verb = null, AMB = null, volume = 0.8;
    const lastSfx = {};
    try {
      const v = parseFloat(localStorage.getItem("stormIslandVol"));
      if (v >= 0 && v <= 1) volume = v;
    } catch (e) {
    }
    function noiseBuf(brown, sec) {
      const b = AC.createBuffer(1, AC.sampleRate * sec | 0, AC.sampleRate), d = b.getChannelData(0);
      let last = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        if (brown) {
          last = (last + 0.02 * w) / 1.02;
          d[i] = last * 3.5;
        } else d[i] = w;
      }
      return b;
    }
    function makeIR(sec) {
      const len = AC.sampleRate * sec | 0, b = AC.createBuffer(2, len, AC.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let i = 0; i < len; i++) {
          const k = i / len;
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 3.2) * (i < AC.sampleRate * 0.012 ? 0 : 1);
        }
      }
      return b;
    }
    function initAudio() {
      try {
        if (!AC) {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          AC = ctx;
          const comp = AC.createDynamicsCompressor();
          comp.threshold.value = -16;
          comp.knee.value = 10;
          comp.ratio.value = 5;
          comp.attack.value = 2e-3;
          comp.release.value = 0.25;
          comp.connect(AC.destination);
          master = AC.createGain();
          master.gain.value = volume;
          master.connect(comp);
          bus = AC.createGain();
          bus.gain.value = 0.5;
          bus.connect(master);
          verb = AC.createConvolver();
          verb.buffer = makeIR(2.6);
          const vg = AC.createGain();
          vg.gain.value = 0.45;
          verb.connect(vg);
          vg.connect(master);
          NB = noiseBuf(false, 2);
          BB = noiseBuf(true, 4);
          initAmbience();
        }
        if (AC.state === "suspended") AC.resume();
      } catch (e) {
        AC = null;
      }
    }
    function setVolume(v) {
      volume = v;
      if (master) master.gain.setTargetAtTime(v, AC.currentTime, 0.05);
      try {
        localStorage.setItem("stormIslandVol", String(v));
      } catch (e) {
      }
    }
    function voice(pos, o) {
      let vol = o.gain == null ? 1 : o.gain, pan = 0, cut = 0, delay = 0, wet = o.wet == null ? 0.1 : o.wet;
      if (pos && player) {
        const d = pos.distanceTo(camera.position), R = o.range || 120;
        if (d > R) return null;
        vol *= Math.pow(1 - d / R, 1.4) / (1 + d / 50);
        if (d > 8) {
          cut = clamp(15e3 * Math.exp(-d / 60), 450, 15e3);
          wet += Math.min(0.4, d / 300);
        }
        if (d > 35) delay = Math.min(0.8, d / 343);
        const rx = Math.cos(player.yaw), rz = -Math.sin(player.yaw), dx = pos.x - camera.position.x, dz = pos.z - camera.position.z, h = Math.hypot(dx, dz) || 1;
        pan = clamp((dx * rx + dz * rz) / h, -1, 1) * 0.85;
      }
      if (vol < 3e-3) return null;
      const out = AC.createGain();
      out.gain.value = vol;
      let n = out;
      if (cut) {
        const f = AC.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = cut;
        n.connect(f);
        n = f;
      }
      if (pan && AC.createStereoPanner) {
        const sp = AC.createStereoPanner();
        sp.pan.value = pan;
        n.connect(sp);
        n = sp;
      }
      n.connect(bus);
      if (wet > 0) {
        const s = AC.createGain();
        s.gain.value = wet;
        n.connect(s);
        s.connect(verb);
      }
      return { out, t: AC.currentTime + 4e-3 + delay, end: 0 };
    }
    function env(p, t, a, dur, g) {
      p.setValueAtTime(1e-4, t);
      p.exponentialRampToValueAtTime(Math.max(2e-4, g), t + a);
      p.exponentialRampToValueAtTime(1e-4, t + Math.max(dur, a + 0.01));
    }
    function nz(v, o) {
      const t = v.t + (o.at || 0), dur = o.dur || 0.1, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
      s.buffer = o.brown ? BB : NB;
      s.loop = true;
      if (o.rate) s.playbackRate.value = o.rate;
      f.type = o.type || "lowpass";
      f.frequency.setValueAtTime(o.f || 1e3, t);
      if (o.f1) f.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
      f.Q.value = o.q == null ? 0.7 : o.q;
      env(g.gain, t, o.a || 2e-3, dur, o.g == null ? 1 : o.g);
      s.connect(f);
      f.connect(g);
      g.connect(v.out);
      s.start(t, Math.random() * 1.5);
      s.stop(t + dur + 0.05);
      v.end = Math.max(v.end, (o.at || 0) + dur);
    }
    function tn(v, o) {
      const t = v.t + (o.at || 0), dur = o.dur || 0.1, s = AC.createOscillator(), g = AC.createGain();
      s.type = o.type || "sine";
      s.frequency.setValueAtTime(o.f || 440, t);
      if (o.f1) s.frequency.exponentialRampToValueAtTime(o.f1, t + dur);
      if (o.det) s.detune.value = o.det;
      env(g.gain, t, o.a || 2e-3, dur, o.g == null ? 1 : o.g);
      if (o.lp) {
        const f = AC.createBiquadFilter();
        f.type = "lowpass";
        f.frequency.value = o.lp;
        s.connect(f);
        f.connect(g);
      } else s.connect(g);
      g.connect(v.out);
      s.start(t);
      s.stop(t + dur + 0.05);
      v.end = Math.max(v.end, (o.at || 0) + dur);
    }
    function done(v) {
      const ms = (v.t - AC.currentTime + v.end + 0.4) * 1e3;
      setTimeout(() => {
        try {
          v.out.disconnect();
        } catch (e) {
        }
      }, ms);
    }
    const glt = (v, at, f, n, g, step) => {
      const R = [1, 1.5, 0.75, 2, 1.25, 0.5];
      for (let i = 0; i < n; i++) tn(v, { at: at + i * (step || 0.03), type: "square", f: f * R[(i * 7 + n) % 6], dur: (step || 0.03) * 0.7, g, lp: 3600 });
    };
    const chk = (v, at, f, g) => {
      nz(v, { at, type: "bandpass", f: f || 2600, q: 2.5, dur: 0.03, g: g || 0.7 });
      nz(v, { at, type: "lowpass", f: 500, dur: 0.04, g: (g || 0.7) * 0.6 });
    };
    const GUN_SFX = {
      ar: (v, p) => {
        nz(v, { type: "highpass", f: 2600, dur: 0.045, g: 0.9 });
        nz(v, { type: "bandpass", f: 950 * p, q: 0.9, dur: 0.13, g: 1.2 });
        tn(v, { f: 150 * p, f1: 48, dur: 0.1, g: 0.9 });
        nz(v, { brown: true, type: "lowpass", f: 1300, f1: 250, dur: 0.42, g: 0.45, a: 8e-3 });
        tn(v, { type: "triangle", f: 2900 * p, f1: 2500, dur: 0.07, g: 0.07 });
      },
      // AR: punchy, with a metallic ring
      smg: (v, p) => {
        nz(v, { type: "highpass", f: 3400, dur: 0.03, g: 0.8 });
        nz(v, { type: "bandpass", f: 1700 * p, q: 1.1, dur: 0.07, g: 1 });
        tn(v, { f: 210 * p, f1: 90, dur: 0.05, g: 0.6 });
        nz(v, { type: "lowpass", f: 1800, f1: 400, dur: 0.2, g: 0.25, a: 5e-3 });
        tn(v, { type: "square", f: 330 * p, f1: 260, dur: 0.035, g: 0.07, lp: 2400 });
      },
      // SMG: a buzzy zip
      pistol: (v, p) => {
        nz(v, { type: "highpass", f: 3e3, dur: 0.035, g: 0.9 });
        nz(v, { type: "bandpass", f: 1250 * p, q: 1, dur: 0.1, g: 1 });
        tn(v, { type: "triangle", f: 1850 * p, f1: 1700, dur: 0.09, g: 0.12 });
        tn(v, { f: 170 * p, f1: 60, dur: 0.08, g: 0.7 });
        nz(v, { brown: true, type: "lowpass", f: 1500, f1: 300, dur: 0.3, g: 0.3, a: 6e-3 });
      },
      pump: (v, p) => {
        nz(v, { type: "highpass", f: 2e3, dur: 0.05, g: 1 });
        nz(v, { brown: true, type: "lowpass", f: 1100 * p, f1: 200, dur: 0.32, g: 1.6 });
        tn(v, { f: 95 * p, f1: 34, dur: 0.35, g: 1.3 });
        tn(v, { f: 46, f1: 28, dur: 0.5, g: 0.9 });
        nz(v, { brown: true, type: "lowpass", f: 600, f1: 120, dur: 0.8, g: 0.5, a: 0.02 });
        chk(v, 0.42, 2200, 0.6);
        chk(v, 0.55, 1800, 0.7);
        nz(v, { at: 0.43, type: "bandpass", f: 900, f1: 1600, q: 1.5, dur: 0.1, g: 0.25 });
      },
      sniper: (v, p) => {
        nz(v, { type: "highpass", f: 4200, dur: 0.06, g: 1.3 });
        nz(v, { type: "bandpass", f: 700 * p, q: 0.8, dur: 0.25, g: 1.4 });
        tn(v, { f: 80 * p, f1: 28, dur: 0.6, g: 1.4 });
        nz(v, { brown: true, type: "lowpass", f: 500, f1: 90, dur: 1.5, g: 0.7, a: 0.03 });
        tn(v, { at: 0.02, f: 2600 * p, f1: 500, dur: 0.55, g: 0.05 });
        chk(v, 0.75, 2400, 0.6);
        nz(v, { at: 0.86, type: "bandpass", f: 1400, f1: 3e3, q: 2, dur: 0.09, g: 0.35 });
        chk(v, 1, 2e3, 0.7);
      }
    };
    const STEP_SFX = {
      magOut: (v) => {
        chk(v, 0, 3e3, 0.5);
        nz(v, { at: 0.02, type: "bandpass", f: 1200, f1: 700, q: 1.5, dur: 0.09, g: 0.35 });
      },
      magIn: (v) => {
        nz(v, { type: "bandpass", f: 1700, q: 2, dur: 0.035, g: 1 });
        tn(v, { type: "triangle", f: 620, f1: 300, dur: 0.05, g: 0.35 });
        nz(v, { type: "lowpass", f: 350, dur: 0.07, g: 0.6 });
      },
      charge: (v) => {
        chk(v, 0, 2800, 0.7);
        nz(v, { at: 0.03, type: "bandpass", f: 1600, f1: 3200, q: 2, dur: 0.06, g: 0.3 });
        chk(v, 0.09, 3200, 0.8);
        tn(v, { at: 0.09, type: "triangle", f: 2300, dur: 0.1, g: 0.08 });
      },
      slide: (v) => {
        nz(v, { type: "bandpass", f: 2e3, f1: 3600, q: 2, dur: 0.06, g: 0.35 });
        chk(v, 0.07, 3400, 0.8);
      },
      shell: (v) => {
        nz(v, { type: "bandpass", f: 1400, q: 2, dur: 0.04, g: 0.6 });
        tn(v, { f: 420, f1: 250, dur: 0.04, g: 0.3 });
      },
      pump: (v) => {
        chk(v, 0, 2200, 0.7);
        chk(v, 0.13, 1800, 0.8);
      },
      boltUp: (v) => {
        chk(v, 0, 2600, 0.6);
        nz(v, { at: 0.03, type: "bandpass", f: 1500, f1: 900, q: 2, dur: 0.08, g: 0.35 });
      },
      round: (v) => {
        nz(v, { type: "bandpass", f: 2400, q: 3, dur: 0.03, g: 0.6 });
        tn(v, { type: "triangle", f: 3100, dur: 0.06, g: 0.08 });
      },
      boltDown: (v) => {
        nz(v, { type: "bandpass", f: 900, f1: 1700, q: 2, dur: 0.08, g: 0.35 });
        chk(v, 0.09, 2200, 0.9);
      }
    };
    const FOOT = {
      rock: (v, g) => {
        nz(v, { type: "highpass", f: 1800, dur: 0.025, g: 0.35 * g });
        nz(v, { type: "lowpass", f: 260, dur: 0.06, g: 0.5 * g });
      }
    };
    const PICK_NOTES = [784, 988, 1175, 1568, 1976];
    const SFX = {
      swing: (v) => {
        nz(v, { type: "bandpass", f: 500, f1: 2600, q: 1.2, dur: 0.17, g: 0.55, a: 0.04 });
      },
      chop: (v, o) => {
        if (o.mat === "stone") {
          nz(v, { type: "highpass", f: 2500, dur: 0.04, g: 0.9 });
          tn(v, { type: "triangle", f: 1300 * rnd(0.95, 1.05), dur: 0.22, g: 0.2 });
          tn(v, { type: "triangle", f: 1870 * rnd(0.95, 1.05), dur: 0.16, g: 0.14 });
          tn(v, { f: 260, f1: 140, dur: 0.08, g: 0.6 });
        } else {
          nz(v, { type: "highpass", f: 3e3, dur: 0.02, g: 0.6 });
          nz(v, { type: "bandpass", f: 520 * rnd(0.9, 1.1), q: 2.5, dur: 0.08, g: 1.2 });
          tn(v, { f: 220 * rnd(0.9, 1.1), f1: 110, dur: 0.09, g: 0.7 });
        }
      },
      empty: (v) => {
        nz(v, { type: "bandpass", f: 3e3, q: 4, dur: 0.02, g: 0.6 });
        tn(v, { type: "square", f: 220, dur: 0.02, g: 0.12, lp: 1500 });
      },
      hit: (v) => {
        tn(v, { f: 1250, dur: 0.05, g: 0.45 });
        tn(v, { type: "triangle", f: 2500, dur: 0.04, g: 0.2 });
        nz(v, { type: "lowpass", f: 400, dur: 0.06, g: 0.5 });
      },
      head: (v) => {
        tn(v, { f: 2093, dur: 0.42, g: 0.4 });
        tn(v, { f: 3136, dur: 0.3, g: 0.22 });
        tn(v, { f: 4186, dur: 0.18, g: 0.12 });
        nz(v, { type: "highpass", f: 6e3, dur: 0.03, g: 0.4 });
        nz(v, { type: "lowpass", f: 400, dur: 0.06, g: 0.5 });
      },
      shield: (v) => {
        tn(v, { f: 1500, f1: 2300, dur: 0.1, g: 0.3 });
        nz(v, { type: "bandpass", f: 5e3, q: 6, dur: 0.1, g: 0.6 });
      },
      shieldBreak: (v) => {
        for (let i = 0; i < 9; i++) nz(v, { at: i * 0.02, type: "highpass", f: rnd(4e3, 8e3), dur: 0.05, g: 0.6 });
        tn(v, { type: "triangle", f: 2400, f1: 500, dur: 0.32, g: 0.3 });
        tn(v, { f: 300, f1: 120, dur: 0.15, g: 0.5 });
      },
      hurt: (v) => {
        nz(v, { type: "lowpass", f: 350, dur: 0.16, g: 1.2 });
        tn(v, { f: 110, f1: 48, dur: 0.14, g: 0.9 });
        nz(v, { type: "bandpass", f: 900, q: 1, dur: 0.08, g: 0.3 });
      },
      elim: (v) => {
        glt(v, 0, 880, 5, 0.05, 0.025);
        tn(v, { type: "triangle", f: 659, dur: 0.13, g: 0.4 });
        tn(v, { at: 0.07, type: "triangle", f: 988, dur: 0.15, g: 0.4 });
        tn(v, { at: 0.14, type: "triangle", f: 1319, dur: 0.42, g: 0.45 });
        tn(v, { at: 0.14, f: 2637, dur: 0.3, g: 0.08 });
        tn(v, { f: 130, f1: 55, dur: 0.28, g: 0.8 });
        nz(v, { at: 0.14, type: "highpass", f: 5e3, dur: 0.25, g: 0.18 });
      },
      pickup: (v, o) => {
        const it = o.item || {};
        if (it.kind === "gun") {
          chk(v, 0, 1900, 0.6);
          chk(v, 0.06, 2400, 0.5);
          const n = (it.r || 0) + 1;
          for (let i = 0; i < n; i++) tn(v, { at: 0.06 + i * 0.055, type: "triangle", f: PICK_NOTES[i], dur: 0.2, g: 0.2 });
          if (it.r >= 3) {
            nz(v, { at: 0.12, type: "highpass", f: 7e3, dur: 0.35, g: 0.12, a: 0.05 });
            glt(v, 0.3, PICK_NOTES[n - 1], 4, 0.04, 0.03);
          }
        } else if (it.kind === "cons") {
          tn(v, { f: 1700, dur: 0.14, g: 0.22 });
          tn(v, { at: 0.01, f: 2550, dur: 0.1, g: 0.12 });
          nz(v, { type: "bandpass", f: 3e3, q: 3, dur: 0.03, g: 0.3 });
        } else {
          tn(v, { f: 520, f1: 950, dur: 0.06, g: 0.3 });
          nz(v, { type: "bandpass", f: 2e3, q: 2, dur: 0.03, g: 0.3 });
        }
      },
      useStart: (v) => {
        {
          tn(v, { f: 400, f1: 1300, dur: 0.04, g: 0.4 });
          nz(v, { type: "highpass", f: 3e3, dur: 0.02, g: 0.4 });
          for (let i = 0; i < 4; i++) tn(v, { at: 0.25 + i * 0.2, f: rnd(240, 380), f1: rnd(500, 700), dur: 0.07, g: 0.22 });
        }
      },
      gulp: (v) => {
        tn(v, { type: "sine", f: 210, f1: 95, dur: 0.11, g: 0.4 });
        tn(v, { at: 0.05, type: "sine", f: 520, f1: 900, dur: 0.05, g: 0.12 });
      },
      healDone: (v) => {
        tn(v, { type: "triangle", f: 880, f1: 1760, dur: 0.35, g: 0.25 });
        tn(v, { at: 0.1, f: 1320, dur: 0.45, g: 0.14 });
        nz(v, { type: "highpass", f: 6e3, dur: 0.4, g: 0.12, a: 0.05 });
      },
      jump: (v) => {
        nz(v, { type: "bandpass", f: 800, f1: 1700, q: 1, dur: 0.13, g: 0.22, a: 0.02 });
      },
      land: (v, o) => {
        const k = clamp((o.v || 10) / 18, 0.3, 1.3);
        nz(v, { brown: true, type: "lowpass", f: 320, dur: 0.14, g: k });
        tn(v, { f: 90, f1: 42, dur: 0.12, g: 0.7 * k });
        FOOT.rock(v, 1.2);
      },
      step: (v, o) => {
        FOOT.rock(v, o.g || 1);
      },
      whiz: (v) => {
        nz(v, { type: "bandpass", f: 3800, f1: 1100, q: 3, dur: 0.17, g: 0.9, a: 0.03 });
        tn(v, { f: 1500, f1: 600, dur: 0.15, g: 0.07 });
      },
      impact: (v, o) => {
        const m = o.mat;
        if (m === "wood") {
          nz(v, { type: "bandpass", f: 620, q: 2, dur: 0.06, g: 0.8 });
          tn(v, { f: 230, f1: 140, dur: 0.05, g: 0.35 });
        } else if (m === "stone") {
          nz(v, { type: "highpass", f: 2200, dur: 0.04, g: 0.7 });
          if (Math.random() < 0.25) tn(v, { f: rnd(2200, 3e3), f1: 1e3, dur: 0.25, g: 0.12 });
        } else if (m === "flesh") nz(v, { type: "lowpass", f: 320, dur: 0.08, g: 0.7 });
        else {
          nz(v, { type: "lowpass", f: 900, dur: 0.08, g: 0.55 });
          nz(v, { type: "highpass", f: 3500, dur: 0.02, g: 0.2 });
        }
      },
      gravUp: (v) => {
        tn(v, { type: "sawtooth", f: 80, f1: 420, dur: 0.9, g: 0.28, lp: 1600, a: 0.02 });
        nz(v, { type: "bandpass", f: 700, f1: 2800, dur: 0.8, g: 0.4, a: 0.05 });
        tn(v, { at: 0.75, type: "sine", f: 70, f1: 40, dur: 0.5, g: 0.5 });
      },
      gravDown: (v) => {
        tn(v, { type: "sine", f: 520, f1: 140, dur: 0.9, g: 0.28, a: 0.02 });
        tn(v, { at: 0.1, type: "triangle", f: 660, dur: 0.25, g: 0.14 });
        tn(v, { at: 0.32, type: "triangle", f: 880, dur: 0.35, g: 0.14 });
      },
      slam: (v, o) => {
        const g = o && o.v || 1;
        tn(v, { type: "sine", f: 110, f1: 38, dur: 0.5, g: 0.7 * g, a: 5e-3 });
        nz(v, { type: "lowpass", f: 900, f1: 200, dur: 0.35, g: 0.6 * g, a: 5e-3 });
        nz(v, { at: 0.02, type: "bandpass", f: 2400, q: 1, dur: 0.12, g: 0.35 * g });
      },
      shatter: (v) => {
        for (let i = 0; i < 7; i++) tn(v, { at: i * 0.035 + Math.random() * 0.02, type: "triangle", f: rnd(1800, 4200), f1: rnd(900, 2e3), dur: 0.12, g: 0.07 });
        nz(v, { type: "highpass", f: 5e3, dur: 0.35, g: 0.18, a: 0.01 });
      },
      boost: (v) => {
        tn(v, { type: "sine", f: 180, f1: 900, dur: 0.35, g: 0.3, a: 0.01 });
        nz(v, { type: "bandpass", f: 700, f1: 2400, dur: 0.3, g: 0.3, a: 0.02 });
      },
      propel: (v) => {
        nz(v, { type: "bandpass", f: 500, f1: 1600, dur: 0.4, g: 0.4, a: 0.03 });
      },
      alarm: (v, o) => {
        tn(v, { type: "square", f: o.hi ? 960 : 720, dur: 0.17, g: 0.26, lp: 2600, a: 0.01 });
      },
      stormWarn: (v) => {
        tn(v, { type: "sawtooth", f: 98, dur: 1.2, g: 0.28, a: 0.25, lp: 700 });
        tn(v, { type: "sawtooth", f: 98, det: 14, dur: 1.2, g: 0.2, a: 0.25, lp: 700 });
        tn(v, { at: 1, type: "sawtooth", f: 73, dur: 1.6, g: 0.3, a: 0.25, lp: 600 });
        tn(v, { at: 1, type: "sawtooth", f: 73, det: -12, dur: 1.6, g: 0.22, a: 0.25, lp: 600 });
        glt(v, 0.9, 147, 8, 0.08, 0.05);
      },
      victory: (v) => {
        [523, 659, 784, 1047, 1319].forEach((f, i) => {
          tn(v, { at: i * 0.12, type: "triangle", f, dur: 0.3, g: 0.3 });
          tn(v, { at: i * 0.12, f: f / 2, dur: 0.3, g: 0.12 });
        });
        [523, 659, 784, 1047].forEach((f) => tn(v, { at: 0.66, type: "triangle", f, dur: 1.6, g: 0.16, a: 0.03 }));
        nz(v, { at: 0.66, type: "highpass", f: 6e3, dur: 1.2, g: 0.12, a: 0.1 });
      },
      defeat: (v) => {
        [392, 311, 262].forEach((f, i) => tn(v, { at: i * 0.28, type: "triangle", f, dur: i === 2 ? 1.3 : 0.35, g: 0.3, lp: 1600 }));
        tn(v, { at: 0.56, f: 131, dur: 1.4, g: 0.25 });
      },
      ui: (v) => {
        tn(v, { type: "triangle", f: 1200, f1: 1500, dur: 0.05, g: 0.18 });
        glt(v, 0.02, 1600, 2, 0.035, 0.02);
      }
    };
    const SFX_OPT = {
      ar: { range: 320 },
      smg: { range: 260 },
      pistol: { range: 280 },
      pump: { range: 300, wet: 0.15 },
      sniper: { range: 600, wet: 0.25 },
      step: { range: 40, wet: 0.03 },
      impact: { range: 70 },
      whiz: { range: 20, wet: 0 },
      chop: { range: 80 },
      stormWarn: { wet: 0.5 },
      victory: { wet: 0.3 },
      defeat: { wet: 0.3 },
      land: { wet: 0.03 }
    };
    const SFX_GAP = { impact: 0.03, whiz: 0.08, hit: 0.035, head: 0.035, shield: 0.035, step: 0.02 };
    function sfx(kind, pos, o) {
      if (!AC || !bus) return;
      o = o || {};
      const gap = SFX_GAP[kind], now = AC.currentTime;
      if (gap && kind !== "step" || gap && !pos) {
        if (lastSfx[kind] != null && now - lastSfx[kind] < gap) return;
        lastSfx[kind] = now;
      }
      const opt = SFX_OPT[kind] || {}, v = voice(pos, { range: opt.range, wet: opt.wet, gain: o.gain });
      if (!v) return;
      if (GUN_SFX[kind]) GUN_SFX[kind](v, rnd(0.94, 1.06));
      else if (kind === "reloadStep") STEP_SFX[o.step](v);
      else if (SFX[kind]) SFX[kind](v, o);
      done(v);
    }
    function loopSrc(brown, rate) {
      const s = AC.createBufferSource();
      s.buffer = brown ? BB : NB;
      s.loop = true;
      s.playbackRate.value = rate || 1;
      s.start();
      return s;
    }
    function chain(...n) {
      for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]);
      return n[n.length - 1];
    }
    function filt(type, f, q) {
      const b = AC.createBiquadFilter();
      b.type = type;
      b.frequency.value = f;
      b.Q.value = q == null ? 0.7 : q;
      return b;
    }
    function gainN(v) {
      const g = AC.createGain();
      g.gain.value = v || 0;
      return g;
    }
    function initAmbience() {
      const out = gainN(0.9);
      out.connect(master);
      const A = { out };
      A.windF = filt("bandpass", 500, 0.6);
      A.wind = gainN();
      chain(loopSrc(true, 1), A.windF, A.wind, out);
      A.hum = gainN();
      const trem = gainN(0.5);
      chain(trem, A.hum, out);
      for (const f of [110, 165, 220]) {
        const o = AC.createOscillator();
        o.frequency.value = f;
        o.connect(trem);
        o.start();
      }
      const lfo = AC.createOscillator(), lg = gainN(0.25);
      lfo.frequency.value = 0.3;
      chain(lfo, lg, trem.gain);
      lfo.start();
      AMB = A;
    }
    function footsteps(dt) {
      for (const e of combatants) {
        if (!e.alive || !e.onGround) {
          e.stepD = 0;
          continue;
        }
        const s = Math.hypot(e.vel.x, e.vel.z);
        if (s < 1) {
          e.stepD = 0;
          continue;
        }
        e.stepD = (e.stepD || 0) + s * dt;
        const stride = e.crouch ? 1.5 : s > 9 ? 2.3 : 1.85;
        if (e.stepD < stride) continue;
        e.stepD -= stride;
        const g = (e.crouch ? 0.35 : s > 9 ? 1.25 : 0.9) * (e.isPlayer ? 0.6 : 1.3);
        if (e.isPlayer) sfx("step", null, { g });
        else if (e.pos.distanceTo(camera.position) < 40) sfx("step", e.pos, { g });
      }
    }
    function updateAudio(dt) {
      if (!AC || !AMB) return;
      const A = AMB, t = AC.currentTime, p = player, T2 = (par, v, k) => par.setTargetAtTime(v, t, k || 0.15);
      const live = state === "play" && p;
      T2(A.out.gain, state === "paused" ? 0.25 : 1, 0.2);
      if (state === "paused") return;
      if (!live) {
        T2(A.hum.gain, state === "menu" ? 0.02 : 0, 0.3);
        T2(A.wind.gain, 0, 0.5);
        return;
      }
      const gust = 0.75 + 0.25 * Math.sin(t * 0.37) * Math.sin(t * 0.71 + 1);
      T2(A.wind.gain, p.alive ? p.zgPropel ? 0.22 : 0.04 * gust : 0.03, 0.25);
      T2(A.windF.frequency, p.zgPropel ? 900 : 420, 0.3);
      T2(A.hum.gain, 0.025, 0.4);
      footsteps(dt);
    }
    let state = "menu", fallbackLook = false, locked = false, matchUsed = false, sens = 1;
    let world = null, colliders, structMeshes, charMeshes, combatants, bots, player = null, effects;
    let matchTime = 0, aliveCount = 0, targetsDirty = true, ads = false, hurtFlash = 0, hitT = 0, bannerT = 0, toastT = 0, camShake = 0;
    const keys = {}, mouse = { l: false, r: false };
    const ray = new T.Raycaster();
    const tv1 = new V(), tv2 = new V(), tv3 = new V(), tv4 = new V();
    function refreshTargets() {
      if (!targetsDirty) return;
      rebuildMeshGrid();
      targetsDirty = false;
    }
    function registerPiece(p) {
      p.etype = "piece";
      for (const m of p.meshes) {
        m.userData.ent = p;
        m.castShadow = true;
        m.receiveShadow = true;
        structMeshes.push(m);
      }
      colliders.add(p.box);
      targetsDirty = true;
      return p;
    }
    function boxOf(cx, cy, cz, sx, sy, sz) {
      return { min: { x: cx - sx / 2, y: cy - sy / 2, z: cz - sz / 2 }, max: { x: cx + sx / 2, y: cy + sy / 2, z: cz + sz / 2 } };
    }
    let SOLDIER = null;
    const MODEL_SCALE = 1.1;
    const _ikA = new V(), _ikB = new V(), _ikC = new V(), _ikT = new V(), _v1 = new V(), _v2 = new V(), _v3 = new V(), _v4 = new V(), _qP = new T.Quaternion(), _qD = new T.Quaternion(), _qI = new T.Quaternion();
    function rotateBoneWorld(bone, axisW, ang) {
      if (!(Math.abs(ang) > 1e-5)) return;
      bone.parent.getWorldQuaternion(_qP);
      _qD.setFromAxisAngle(axisW, ang);
      _qI.copy(_qP).invert();
      bone.quaternion.premultiply(_qP).premultiply(_qD).premultiply(_qI);
      bone.updateMatrixWorld(true);
    }
    const _hq = new T.Quaternion(), _hm0 = new T.Matrix4(), _hm1 = new T.Matrix4(), _hw = (o) => o.getWorldPosition(new V());
    function poseHand(B, sd, F, N, curl) {
      const h = B[sd + "Hand"], s = sd === "Right" ? 1 : -1, hp = _hw(h);
      const f0 = _hw(B[sd + "HandMiddle1"]).sub(hp).normalize(), a0 = _hw(B[sd + "HandPinky1"]).sub(_hw(B[sd + "HandIndex1"]));
      a0.addScaledVector(f0, -a0.dot(f0)).normalize();
      const n0 = new V().crossVectors(f0, a0).multiplyScalar(s);
      const f1 = F.clone().normalize(), n1 = N.clone().addScaledVector(f1, -N.dot(f1)).normalize(), a1 = new V().crossVectors(n1, f1).multiplyScalar(s);
      _hm0.makeBasis(f0, a0, n0).transpose();
      _hm1.makeBasis(f1, a1, n1).multiply(_hm0);
      _hq.setFromRotationMatrix(_hm1);
      h.parent.getWorldQuaternion(_qP);
      _qI.copy(_qP).invert();
      h.quaternion.premultiply(_qP).premultiply(_hq).premultiply(_qI);
      h.updateMatrixWorld(true);
      if (curl) {
        const ax = a1.multiplyScalar(-s);
        for (const fg of ["Index", "Middle", "Ring", "Pinky"]) for (const k of [1, 2, 3]) {
          const b = B[sd + "Hand" + fg + k];
          if (b) rotateBoneWorld(b, ax, curl * (k === 1 ? 0.8 : 1));
        }
      }
    }
    function solveIK(A, B, C, target, pole) {
      A.getWorldPosition(_ikA);
      B.getWorldPosition(_ikB);
      C.getWorldPosition(_ikC);
      _ikT.copy(target);
      const lab = _ikA.distanceTo(_ikB), lcb = _ikB.distanceTo(_ikC), lat = clamp(_ikT.distanceTo(_ikA), 0.01, lab + lcb - 2e-3);
      const ac = _v1.subVectors(_ikC, _ikA).normalize(), ab = _v2.subVectors(_ikB, _ikA).normalize();
      const ba = _v3.subVectors(_ikA, _ikB).normalize(), bc = _v4.subVectors(_ikC, _ikB).normalize();
      const acab0 = Math.acos(clamp(ac.dot(ab), -1, 1)), babc0 = Math.acos(clamp(ba.dot(bc), -1, 1));
      const acab1 = Math.acos(clamp((lcb * lcb - lab * lab - lat * lat) / (-2 * lab * lat), -1, 1)), babc1 = Math.acos(clamp((lat * lat - lab * lab - lcb * lcb) / (-2 * lab * lcb), -1, 1));
      const axis0 = new V().crossVectors(ac, ab);
      if (axis0.lengthSq() < 1e-8) {
        if (pole) axis0.crossVectors(ac, _v2.subVectors(pole, _ikA));
        else axis0.set(1, 0, 0);
      }
      axis0.normalize();
      rotateBoneWorld(A, axis0, acab1 - acab0);
      rotateBoneWorld(B, axis0, babc1 - babc0);
      C.getWorldPosition(_ikC);
      A.getWorldPosition(_ikA);
      const ac2 = _v1.subVectors(_ikC, _ikA), at = _v2.subVectors(_ikT, _ikA);
      const axis1 = new V().crossVectors(ac2, at);
      if (axis1.lengthSq() > 1e-10) rotateBoneWorld(A, axis1.normalize(), ac2.angleTo(at));
      if (pole) {
        B.getWorldPosition(_ikB);
        const ax = _v3.copy(at).normalize();
        const pb = _v1.subVectors(_ikB, _ikA);
        pb.addScaledVector(ax, -pb.dot(ax));
        const pp = _v4.subVectors(pole, _ikA);
        pp.addScaledVector(ax, -pp.dot(ax));
        if (pb.lengthSq() > 1e-6 && pp.lengthSq() > 1e-6) {
          const s = new V().crossVectors(pb, pp).dot(ax) < 0 ? -1 : 1;
          rotateBoneWorld(A, ax, pb.angleTo(pp) * s);
        }
      }
    }
    function loadSoldier(done2) {
      if (!T.GLTFLoader || !T.SkeletonUtils) {
        done2(false);
        return;
      }
      let finished = false;
      const fin = (ok) => {
        if (!finished) {
          finished = true;
          done2(ok);
        }
      };
      setTimeout(() => fin(false), 15e3);
      const ready = (gl) => {
        SOLDIER = { scene: gl.scene, clips: {} };
        gl.animations.forEach((a) => SOLDIER.clips[a.name] = a);
        fin(true);
      };
      try {
        if (!window.SOLDIER_GLB) {
          fin(false);
          return;
        }
        const bin = atob(window.SOLDIER_GLB), buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        new T.GLTFLoader().parse(buf.buffer, "", ready, () => fin(false));
      } catch (e) {
        fin(false);
      }
    }
    const HIT_GEO = { head: new T.BoxGeometry(0.34, 0.36, 0.34), chest: new T.BoxGeometry(0.56, 0.62, 0.36), legs: new T.BoxGeometry(0.5, 1, 0.34) };
    const hitMat = new T.MeshBasicMaterial({ visible: false });
    const GUN_S = 0.95;
    const HOLD = {
      ar: { r: [0.015, -0.09, 0.21], l: [-0.03, -0.065, -0.17], g: [-0.04, -0.17, -0.24] },
      smg: { r: [0.015, -0.08, 0.2], l: [-0.03, -0.05, -0.1], g: [-0.04, -0.17, -0.26] },
      pump: { r: [0.015, -0.06, 0.3], l: [-0.03, -0.08, -0.18], g: [-0.04, -0.19, -0.2] },
      pistol: { r: [0.015, -0.05, 0.13], l: [-0.035, -0.08, 0.1], g: [-0.1, -0.13, -0.37], lf: [0.3, -0.3, -0.9], ln: [0.9, 0.4, 0] },
      sniper: { r: [0.015, -0.09, 0.26], l: [-0.03, -0.08, -0.2], g: [-0.04, -0.17, -0.22] }
    };
    const SWING_T = 0.42, PICK_HIT = 0.52;
    const PICK_REST = [0, 0.2, -0.16, -0.3, 0.55, 0.75, -0.35, -0.7, 0.55, -0.2, 0, 0];
    const PICK_KEYS = [
      [
        PICK_REST,
        [0.3, 0.14, 0.14, -0.02, 0.35, 0.55, 0.75, 0.1, 0.75, -0.65, -0.5, -0.06],
        [0.52, 0.05, -0.15, -0.48, 0.2, 0.25, -0.95, -0.3, -0.95, -0.1, 0.3, 0.24],
        [0.68, -0.2, -0.42, -0.36, -0.5, -0.25, -0.8, -0.5, -0.6, 0.35, 0.42, 0.18],
        [1, ...PICK_REST.slice(1)]
      ],
      [
        PICK_REST,
        [0.3, -0.5, 0.1, -0.06, -0.35, 0.55, 0.75, -0.1, 0.75, -0.65, 0.5, -0.06],
        [0.52, 0.15, -0.15, -0.48, 0.15, 0.25, -0.95, 0.3, -0.95, -0.1, -0.2, 0.24],
        [0.68, 0.3, -0.4, -0.3, 0.65, -0.2, -0.7, 0.5, -0.6, 0.35, -0.42, 0.18],
        [1, ...PICK_REST.slice(1)]
      ]
    ];
    const _pd = new V(), _ps = new V(), _pz = new V(), _pm = new T.Matrix4();
    function pickPose(e) {
      const K = PICK_KEYS[e.swingSide || 0], k = e.swingT > 0 ? clamp(1 - e.swingT / SWING_T, 0, 1) : 0;
      let i = 0;
      while (i < K.length - 2 && k > K[i + 1][0]) i++;
      const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)], u = clamp((k - b[0]) / (c[0] - b[0]), 0, 1), u2 = u * u, u3 = u2 * u;
      const m = (j) => 0.5 * (2 * b[j] + (c[j] - a[j]) * u + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * u2 + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * u3);
      _pd.set(m(4), m(5), m(6)).normalize();
      _ps.set(m(7), m(8), m(9));
      _ps.addScaledVector(_pd, -_ps.dot(_pd)).normalize();
      _pz.crossVectors(_ps, _pd);
      return { h: new V(m(1), m(2), m(3)), q: new T.Quaternion().setFromRotationMatrix(_pm.makeBasis(_ps, _pd, _pz)), tw: m(10), ln: m(11) };
    }
    function makeCharacterGLB() {
      const g = new T.Group();
      g.rotation.order = "YXZ";
      const spin = new T.Group();
      g.add(spin);
      const model = T.SkeletonUtils.clone(SOLDIER.scene);
      model.scale.setScalar(MODEL_SCALE);
      spin.add(model);
      const bones = {};
      model.traverse((o) => {
        if (o.isBone) bones[o.name.replace(/^mixamorig:?/, "")] = o;
        if (o.isMesh) {
          o.castShadow = true;
          o.frustumCulled = false;
        }
      });
      const mixer = new T.AnimationMixer(model), act = {};
      for (const n of ["Idle", "Walk", "Run", "TPose"]) {
        const a = mixer.clipAction(SOLDIER.clips[n]);
        a.play();
        a.setEffectiveWeight(n === "Idle" ? 1 : 0);
        a.time = Math.random() * a.getClip().duration;
        act[n] = a;
      }
      const gunMount = new T.Group();
      gunMount.scale.setScalar(GUN_S);
      g.add(gunMount);
      const pickG = new T.Group();
      const handle = new T.Mesh(GEO.handle, colorMat(7031338));
      handle.position.y = 0.35;
      const ph = new T.Mesh(GEO.pickHead, colorMat(12109014));
      ph.position.set(0, 0.78, 0);
      pickG.add(handle, ph);
      pickG.visible = false;
      g.add(pickG);
      const consG = new T.Group();
      consG.visible = false;
      g.add(consG);
      const flash = new T.Sprite(flashMat);
      flash.scale.setScalar(0.8);
      flash.visible = false;
      const hb = { head: new T.Mesh(HIT_GEO.head, hitMat), chest: new T.Mesh(HIT_GEO.chest, hitMat), legs: new T.Mesh(HIT_GEO.legs, hitMat) };
      g.add(hb.head, hb.chest, hb.legs);
      return { glb: true, g, spin, model, bones, mixer, act, gunMount, pick: pickG, consG, consId: "", flash, hb, parts: [hb.head, hb.chest, hb.legs], head: hb.head, heldKey: "", held: null, w: { Idle: 1, Walk: 0, Run: 0, TPose: 0 } };
    }
    const SK = window.SKINS || null, skinMats = /* @__PURE__ */ new Map(), gearMats = {};
    function skinMaterials(skin, body, visor) {
      let m = skinMats.get(skin.i);
      if (m) return m;
      const fin = skin.fin || [0.15, 0.7], src = body.map, cv = SK.paint(src.image, skin, 512);
      const tex = (t) => {
        const x = new T.CanvasTexture(t);
        x.flipY = src.flipY;
        x.encoding = src.encoding;
        x.wrapS = src.wrapS;
        x.wrapT = src.wrapT;
        x.anisotropy = 4;
        return x;
      };
      const b = body.clone();
      b.map = tex(cv.map);
      b.color.set(16777215);
      b.metalness = Math.min(fin[0], 0.6);
      b.roughness = fin[1];
      if (cv.glow) {
        b.emissive = new T.Color(16777215);
        b.emissiveMap = tex(cv.glow);
        b.emissiveIntensity = 0.9;
      }
      const v = visor.clone();
      v.map = null;
      v.color.set(skin.v);
      v.metalness = 0.6;
      v.roughness = 0.18;
      if ((skin.g || "").includes("v")) {
        v.emissive = new T.Color(skin.v);
        v.emissiveIntensity = 0.85;
      }
      m = { body: b, visor: v };
      skinMats.set(skin.i, m);
      return m;
    }
    function applySkin(c, skin) {
      if (!c.glb || !SK || !skin) return;
      if (!c.baseMats) {
        c.baseMats = {};
        c.model.traverse((o) => {
          if (o.isMesh) c.baseMats[o.name] = o.material;
        });
      }
      for (const o of c.gear || []) {
        o.parent && o.parent.remove(o);
        o.traverse((m) => {
          if (m.isMesh) m.geometry.dispose();
        });
      }
      c.gear = [];
      c.capes = [];
      c.flaps = [];
      c.bobs = [];
      c.skin = skin;
      const mats = skin.def ? null : skinMaterials(skin, c.baseMats.vanguard_Mesh, c.baseMats.vanguard_visor);
      c.model.traverse((o) => {
        if (o.isMesh) o.material = mats ? o.name === "vanguard_visor" ? mats.visor : mats.body : c.baseMats[o.name];
        if (o.name === "vanguard_visor") o.visible = !skin.noVisor;
      });
      const big = skin.big || [1, 1];
      c.model.scale.set(MODEL_SCALE * big[0], MODEL_SCALE * big[1], MODEL_SCALE * big[0]);
      c.g.updateMatrixWorld(true);
      const ws = new V(), sc = new V(), qq = new T.Quaternion();
      c.g.getWorldScale(ws);
      for (const [kind, ...args] of skin.acc) {
        for (const [bn, obj] of SK.gear(T, kind, args, gearMats)) {
          const bone = c.bones[bn];
          if (!bone) continue;
          bone.matrixWorld.decompose(tv1, qq, sc);
          const wrap = new T.Group();
          wrap.scale.setScalar(ws.x / sc.x);
          wrap.add(obj);
          bone.add(wrap);
          c.gear.push(wrap);
          obj.traverse((o) => {
            if (o.isMesh) o.frustumCulled = false;
            if (o.userData.cape) c.capes.push(o);
            if (o.userData.flap) c.flaps.push(o);
            if (o.userData.bob) c.bobs.push(o);
          });
        }
      }
    }
    const _cq1 = new T.Quaternion(), _cq2 = new T.Quaternion(), _cq3 = new T.Quaternion(), UPX = new T.Vector3(1, 0, 0), UPY = new T.Vector3(0, 1, 0), _cf = new T.Vector3();
    function swayGear(e, c, speed, dt) {
      var _a;
      if (!c.capes || !c.capes.length && !c.flaps.length && !c.bobs.length) return;
      const t = performance.now() / 1e3, air = !e.onGround ? 0.35 : 0;
      const tgt = 0.06 + clamp(speed / 7, 0, 1) * 0.55 + air + Math.sin(t * (3 + speed * 0.6) + e.walkT) * 0.04 * (0.3 + clamp(speed / 7, 0, 1));
      for (const o of c.capes) {
        o.userData.rx = lerp(o.userData.rx || 0, tgt, 1 - Math.exp(-6 * dt));
        if (o.userData.cape === "hang") {
          o.parent.getWorldQuaternion(_cq1);
          _cf.set(0, 0, 1).applyQuaternion(_cq1);
          _cf.y = 0;
          if (_cf.lengthSq() < 0.09) {
            c.spin.getWorldQuaternion(_cq2);
            _cf.set(0, 0, -1).applyQuaternion(_cq2);
            _cf.y = 0;
          }
          _cq2.setFromAxisAngle(UPY, Math.atan2(_cf.x, _cf.z)).multiply(_cq3.setFromAxisAngle(UPX, o.userData.rx + 0.08)).premultiply(_cq1.invert());
          o.quaternion.copy(_cq2);
        } else o.rotation.x = ((_a = o.userData.baseX) != null ? _a : o.userData.baseX = o.rotation.x) + o.userData.rx;
      }
      for (const o of c.flaps) o.rotation.y = o.userData.flap * (0.45 + Math.sin(t * 2.2) * 0.1 + air * 0.35);
      for (const o of c.bobs) o.position.y = 0.42 + Math.sin(t * 2) * 0.012;
    }
    const UP = new V(0, 1, 0);
    const _pc = new V(), TAU = Math.PI * 2;
    const easeIO = (k) => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const wrapPi = (a) => (a % TAU + TAU * 1.5) % TAU - Math.PI;
    function bodyPose(e, g, c, a, dt) {
      const tx = e.zgFloat ? e.zgTx || 0 : 0, tz = (e.bankT || 0) + (e.zgRoll || 0);
      c.spin.position.set(0, 0, 0);
      D(g.rotation, "x", tx, a * 0.5);
      D(g.rotation, "z", tz, a * 0.4);
      _pc.set(0, 1, 0).applyEuler(g.rotation);
      g.position.set(e.pos.x - _pc.x, e.pos.y + 1 - _pc.y, e.pos.z - _pc.z);
    }
    function motionState(e, dt) {
      const A = e.anim, fx = -Math.sin(e.yaw), fz = -Math.cos(e.yaw), fwd = e.vel.x * fx + e.vel.z * fz, side = -e.vel.x * fz + e.vel.z * fx, speed = Math.hypot(e.vel.x, e.vel.z);
      const yr = wrapPi(e.yaw - (A.lastYaw == null ? e.yaw : A.lastYaw)) / Math.max(dt, 1e-3);
      A.lastYaw = e.yaw;
      e.bankT = e.onGround ? clamp(yr * 0.03, -0.22, 0.22) * smooth(4, 10, speed) : 0;
      const aS = 1 - Math.exp(-7 * dt);
      D(A, "sprint", e.onGround ? smooth(8.6, 10.6, speed) : e.zgPropel ? 1 : 0, aS);
      A.land = Math.max(0, (A.land || 0) - dt * 3.2);
      A.hit = Math.max(0, (A.hit || 0) - dt * 5);
      A.draw = Math.min(1, (A.draw == null ? 1 : A.draw) + dt * 3.5);
      return { fx, fz, fwd, side, speed };
    }
    const crackTex = canvasTex(256, 256, (g, w) => {
      g.clearRect(0, 0, w, w);
      g.strokeStyle = "rgba(40,44,52,.85)";
      g.lineCap = "round";
      for (let i = 0; i < 14; i++) {
        let a = i / 14 * TAU + Math.random() * 0.3, x = w / 2, y = w / 2, r = 0;
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(x, y);
        while (r < w * 0.48) {
          r += rnd(10, 22);
          a += rnd(-0.35, 0.35);
          x = w / 2 + Math.cos(a) * r;
          y = w / 2 + Math.sin(a) * r;
          g.lineTo(x, y);
          g.lineWidth = Math.max(1, g.lineWidth - 0.6);
        }
        g.stroke();
      }
      const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w * 0.2);
      gr.addColorStop(0, "rgba(30,34,40,.55)");
      gr.addColorStop(1, "rgba(30,34,40,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, w);
    });
    const shardGeo = new T.BoxGeometry(0.16, 0.16, 0.16), shardMats = [16777215, 14278115, 10134190, 6091007].map((c) => new T.MeshBasicMaterial({ color: c, transparent: true }));
    const _dq = new T.Quaternion(), _dv = new V(), _dn = new V(), BACK = new V(0, 0, 1);
    function deathKind(weapon, info) {
      return info && info.explosive ? "explosion" : weapon === "flying block" ? "block" : weapon === "Pickaxe" ? "pickaxe" : "shot";
    }
    function startDeath(t, kind, info) {
      const dir = (info && info.dir ? info.dir.clone() : new V(rnd(-1, 1), rnd(-0.3, 0.3), rnd(-1, 1))).normalize();
      const sp = { shot: info && info.head ? 11 : 7, pickaxe: 24, block: Math.max(30, (info && info.speed || 0) * 1.7), explosion: 30 }[kind];
      const d = t.death = {
        kind,
        t: 0,
        c: new V(t.pos.x, t.pos.y + 1, t.pos.z),
        vel: t.vel.clone().multiplyScalar(0.3).addScaledVector(dir, sp),
        q: new T.Quaternion().setFromEuler(new T.Euler(t.zgRoll > 1.5 ? 0 : 0, t.yaw, t.zgRoll || 0, "YXZ")),
        av: new V(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(kind === "shot" ? info && info.head ? 7 : 2.5 : kind === "pickaxe" ? 14 : 9),
        stuck: null,
        shatterAt: kind === "shot" ? 2.2 : 3,
        spread: 0
      };
      if (kind === "shot" && info && info.head) d.av.set(-dir.z, 0, dir.x).multiplyScalar(9);
      if (kind === "explosion") t.ch.model.traverse((o) => {
        if (o.isMesh && o.material && o.material.color) {
          o.material = o.material.clone();
          o.material.color.multiplyScalar(0.25);
        }
      });
      if (t === player) camShake = Math.max(camShake, kind === "shot" ? 0.4 : 1);
    }
    function deathMove(d, dt) {
      if (ZG.state === "ceil") d.vel.y += GRAV * dt;
      if (d.kind === "shot") d.vel.multiplyScalar(Math.exp(-0.5 * dt));
      d.c.addScaledVector(d.vel, dt);
      const r = 0.7;
      _dn.set(0, 0, 0);
      if (d.c.x < -ZG.L + r) {
        d.c.x = -ZG.L + r;
        _dn.set(1, 0, 0);
      } else if (d.c.x > ZG.L - r) {
        d.c.x = ZG.L - r;
        _dn.set(-1, 0, 0);
      }
      if (d.c.z < -ZG.L + r) {
        d.c.z = -ZG.L + r;
        _dn.set(0, 0, 1);
      } else if (d.c.z > ZG.L - r) {
        d.c.z = ZG.L - r;
        _dn.set(0, 0, -1);
      }
      if (d.c.y < r) {
        d.c.y = r;
        _dn.set(0, 1, 0);
      } else if (d.c.y > ZG.H - r) {
        d.c.y = ZG.H - r;
        _dn.set(0, -1, 0);
      }
      for (const b of ZG.blocks) {
        const px = b.sx / 2 + r - Math.abs(d.c.x - b.x), py = b.sy / 2 + r - Math.abs(d.c.y - b.y), pz = b.sz / 2 + r - Math.abs(d.c.z - b.z);
        if (px <= 0 || py <= 0 || pz <= 0) continue;
        if (px < py && px < pz) {
          const s = d.c.x > b.x ? 1 : -1;
          d.c.x += s * px;
          _dn.set(s, 0, 0);
        } else if (py < pz) {
          const s = d.c.y > b.y ? 1 : -1;
          d.c.y += s * py;
          _dn.set(0, s, 0);
        } else {
          const s = d.c.z > b.z ? 1 : -1;
          d.c.z += s * pz;
          _dn.set(0, 0, s);
        }
        break;
      }
      return _dn.lengthSq() > 0 ? _dn : null;
    }
    function slamFx(p, n, big) {
      const crack = new T.Mesh(new T.PlaneGeometry(big ? 7 : 4.5, big ? 7 : 4.5), new T.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
      crack.position.copy(p).addScaledVector(n, 0.05);
      crack.lookAt(_dv.copy(crack.position).add(n));
      crack.rotation.z = Math.random() * TAU;
      world.add(crack);
      effects.push({ t: 0, dur: 7, obj: crack, upd: (e, k) => {
        crack.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      }, done: () => {
        crack.geometry.dispose();
        crack.material.dispose();
      } });
      const ring = new T.Mesh(new T.RingGeometry(0.6, 1, 40), new T.MeshBasicMaterial({ color: 16777215, transparent: true, side: T.DoubleSide, depthWrite: false }));
      ring.position.copy(p).addScaledVector(n, 0.12);
      ring.lookAt(_dv.copy(ring.position).add(n));
      world.add(ring);
      effects.push({ t: 0, dur: 0.5, obj: ring, upd: (e, k) => {
        ring.scale.setScalar(1 + k * (big ? 9 : 6));
        ring.material.opacity = 0.9 * (1 - k);
      }, done: () => {
        ring.geometry.dispose();
        ring.material.dispose();
      } });
      for (let i = 0; i < 10; i++) {
        const q = p.clone().addScaledVector(n, 0.3).add(new V(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(1.2));
        puff(q, 15132908);
      }
      sfx("slam", p.clone(), { v: big ? 1 : 0.7 });
    }
    function shatter(t) {
      const g = t.ch.g;
      g.visible = false;
      const c = t.death.c, n = 30;
      for (let i = 0; i < n; i++) {
        const m = new T.Mesh(shardGeo, shardMats[i % 4].clone());
        m.position.copy(c).add(new V(rnd(-0.35, 0.35), rnd(-0.9, 0.9), rnd(-0.2, 0.2)).applyQuaternion(t.death.q));
        world.add(m);
        const v = new V(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(2, 8)), s = rnd(0.8, 1.8), w = new V(rnd(-8, 8), rnd(-8, 8), rnd(-8, 8));
        effects.push({ t: 0, dur: rnd(0.8, 1.4), obj: m, upd: (e, k, dt) => {
          m.position.addScaledVector(v, dt);
          v.multiplyScalar(Math.exp(-1.5 * dt));
          m.rotation.x += w.x * dt;
          m.rotation.y += w.y * dt;
          m.scale.setScalar(s * (1 - k));
          m.material.opacity = 1 - k * k;
        }, done: () => m.material.dispose() });
      }
      sfx("shatter", c.clone());
    }
    function deathPose(e, g, c, dt) {
      const d = e.death;
      if (!d) {
        g.visible = false;
        return;
      }
      d.t += dt;
      e.deadT = d.t;
      if (!d.stuck) {
        _dq.setFromEuler(new T.Euler(d.av.x * dt, d.av.y * dt, d.av.z * dt));
        d.q.premultiply(_dq);
        d.av.multiplyScalar(Math.exp(-(d.kind === "shot" ? 0.6 : 0.2) * dt));
        const n = deathMove(d, dt);
        if (n) {
          const hard = d.vel.length() > 12 || d.kind !== "shot";
          if (hard) {
            d.stuck = { n: n.clone(), t: 0 };
            d.vel.set(0, 0, 0);
            d.q.setFromUnitVectors(BACK, _dv.copy(n).negate());
            d.q.premultiply(_dq.setFromAxisAngle(n, Math.random() * TAU));
            d.c.addScaledVector(n, 0.25);
            d.shatterAt = d.t + 1.6;
            slamFx(_dv.copy(d.c).addScaledVector(n, -0.3), n, d.kind !== "pickaxe");
            if (e === player || e.pos.distanceTo(camera.position) < 25) camShake = Math.max(camShake, e === player ? 1.2 : 0.4);
          } else {
            d.vel.addScaledVector(n, -1.6 * d.vel.dot(n));
            d.vel.multiplyScalar(0.5);
          }
        }
      } else d.stuck.t += dt;
      d.spread = Math.min(d.kind === "shot" ? 0.45 : 1, d.spread + dt * (d.stuck ? 8 : 3));
      const W = c.w;
      W.TPose = d.spread;
      W.Idle = 1 - d.spread;
      W.Walk = W.Run = 0;
      for (const k in c.act) c.act[k].setEffectiveWeight(W[k]);
      c.mixer.update(d.t < 0.3 ? dt * 0.3 : 0);
      const s = d.stuck ? Math.exp(-d.stuck.t * 7) * Math.sin(Math.min(1, d.stuck.t * 12) * Math.PI) : 0;
      c.spin.scale.set(1 + 0.3 * s, 1 + 0.15 * s, 1 - 0.55 * s);
      g.quaternion.copy(d.q);
      _pc.set(0, 1, 0).applyQuaternion(d.q);
      g.position.copy(d.c).sub(_pc);
      e.pos.copy(d.c).y -= 1;
      if (d.t >= d.shatterAt && g.visible) shatter(e);
    }
    const _qm = new T.Quaternion();
    const CONS_S = { mini: 0.62, big: 0.55 };
    function setConsHeld(c, id) {
      if (!c.consG) return;
      id = id || "";
      if (c.consId !== id) {
        c.consId = id;
        while (c.consG.children.length) c.consG.remove(c.consG.children[0]);
        if (id) {
          const m = makeConsModel(id);
          m.scale.setScalar(CONS_S[id]);
          m.traverse((o) => {
            if (o.isMesh) o.castShadow = true;
          });
          c.consG.add(m);
        }
      }
      c.consG.visible = !!id;
    }
    function healFx(p, col, n, spd) {
      for (let i = 0; i < n; i++) {
        const mat = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false }), m = new T.Mesh(GEO.puff, mat), v = new V(rnd(-1, 1), rnd(0.4, 1.4), rnd(-1, 1)).multiplyScalar(spd);
        m.position.copy(p);
        world.add(m);
        effects.push({ t: 0, dur: rnd(0.45, 0.8), obj: m, upd: (e, k, dt) => {
          m.position.addScaledVector(v, dt);
          m.scale.setScalar(0.32 * Math.sin(Math.min(1, k * 1.4) * Math.PI) + 0.02);
          mat.opacity = 0.95 * (1 - k * k);
        }, done: () => mat.dispose() });
      }
    }
    const _cq = new T.Quaternion(), _cm = new T.Matrix4();
    function consPlace(c, p, y, x) {
      const g = c.g;
      y = y.clone().normalize();
      const z = new V().crossVectors(x, y).normalize();
      x = new V().crossVectors(y, z);
      _cm.makeBasis(x, y, z);
      _cq.setFromRotationMatrix(_cm);
      g.getWorldQuaternion(_qP);
      c.consG.quaternion.copy(_qP.invert().multiply(_cq));
      c.consG.position.copy(g.worldToLocal(p.clone()));
    }
    function consPose(e, c, id, k, rightB, fwdB, upB, dt) {
      const B = c.bones, A = e.anim, w = (o) => o.getWorldPosition(new V()), dur = CONS[id].time, near = e === player || e.pos.distanceTo(camera.position) < 30, at = e === player ? null : e.pos;
      const rS = w(B.RightArm), lS = w(B.LeftArm), head = w(B.Head), mouth = head.clone().addScaledVector(upB, 0.05).addScaledVector(fwdB, 0.12), chest = w(B.Spine2).addScaledVector(fwdB, 0.2);
      const poleR = rS.clone().addScaledVector(rightB, 0.5).addScaledVector(upB, -0.6).addScaledVector(fwdB, -0.2), poleL = lS.clone().addScaledVector(rightB, -0.5).addScaledVector(upB, -0.6).addScaledVector(fwdB, -0.2);
      const ik = (sd, t, pole) => solveIK(B[sd + "Arm"], B[sd + "ForeArm"], B[sd + "Hand"], t, pole);
      const bell = (a, b) => k < a || k > b ? 0 : Math.sin((k - a) / (b - a) * Math.PI);
      const idle = chest.clone().addScaledVector(rightB, 0.17).addScaledVector(upB, -0.14).addScaledVector(fwdB, 0.08).addScaledVector(upB, 0.015 * Math.sin(matchTime * 2.4 + e.walkT));
      const tick = (key, period) => {
        const n = Math.floor(k * dur / period);
        if (A[key] !== n) {
          const first = A[key] == null || A[key] > n;
          A[key] = n;
          return !first;
        }
        return false;
      };
      {
        const big = id === "big", u = Math.max(0, k), ka = k < 0 ? 0 : smooth(0, 0.14, k), kl = smooth(0.82, 0.94, u), dr = ka * (1 - kl), prog = clamp((u - 0.14) / 0.68, 0, 1);
        const nd = fwdB.clone().negate().addScaledVector(upB, -0.15 - 0.95 * prog).normalize(), gq = k >= 0 ? Math.sin(u * dur * TAU * 2.2) : 0;
        const drinkP = mouth.clone().addScaledVector(nd, -(big ? 0.2 : 0.16)).addScaledVector(nd, 0.015 * gq), pos = idle.clone().lerp(drinkP, dr);
        const yAx = upB.clone().lerp(nd, dr).normalize();
        consPlace(c, pos, yAx, rightB);
        rotateBoneWorld(B.Neck, rightB, (0.42 + (big ? 0.15 : 0)) * dr * (0.6 + 0.4 * prog) + 0.06 * gq * dr);
        rotateBoneWorld(B.Spine1, rightB, (big ? 0.22 : 0.1) * dr);
        const shake = bell(0.84, 1);
        if (shake) rotateBoneWorld(B.Neck, upB, 0.28 * shake * Math.sin(u * dur * 42));
        const hold = pos.clone().addScaledVector(rightB, 0.075).addScaledVector(yAx, -0.04);
        ik("Right", hold, poleR);
        poseHand(B, "Right", fwdB.clone().addScaledVector(rightB, -0.3), rightB.clone().negate(), 0.9);
        if (big && k >= 0) {
          const bot = pos.clone().addScaledVector(yAx, -0.17).addScaledVector(rightB, -0.03), wipe = bell(0.86, 0.98);
          const lt = wipe ? mouth.clone().addScaledVector(fwdB, 0.06).addScaledVector(upB, -0.05).addScaledVector(rightB, lerp(-0.14, 0.14, clamp((u - 0.86) / 0.12, 0, 1))) : bot.clone().addScaledVector(rightB, -0.04).addScaledVector(upB, -0.04);
          const lw = Math.max(dr, wipe);
          if (lw > 0.01) {
            const natL = w(B.LeftHand);
            ik("Left", natL.lerp(lt, lw), poleL);
            poseHand(B, "Left", wipe ? rightB : rightB.clone().addScaledVector(fwdB, 0.4), wipe ? fwdB.clone().negate() : yAx, 0.5);
          }
        }
        if (k >= 0 && dr > 0.5 && near && tick("gulpN", 1 / 2.2)) {
          sfx("gulp", at);
          healFx(mouth.clone().addScaledVector(fwdB, 0.08), CONS[id].color, 2, 1.2);
        }
      }
    }
    const ZG_STROKE = [[0, 0.18, 0.12, 0.38], [0.2, 0.12, 0.5, 0.32], [0.45, 0.56, 0.3, 0.12], [0.66, 0.4, -0.18, 0.08], [0.86, 0.14, -0.04, 0.3], [1, 0.18, 0.12, 0.38]];
    function zgStroke(u) {
      let i = 0;
      while (i < ZG_STROKE.length - 2 && u > ZG_STROKE[i + 1][0]) i++;
      const a = ZG_STROKE[i], b = ZG_STROKE[i + 1], k = easeIO(clamp((u - a[0]) / (b[0] - a[0]), 0, 1));
      return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
    }
    function animateGLB(e, dt) {
      const c = e.ch, A = e.anim, B = c.bones, g = c.g;
      g.position.copy(e.pos);
      g.rotation.y = e.yaw;
      const a = 1 - Math.exp(-14 * dt), aS = 1 - Math.exp(-7 * dt);
      if (!e.alive) {
        c.flash.visible = false;
        deathPose(e, g, c, dt);
        return;
      }
      g.visible = !(e.isPlayer && ads && isScoped());
      if (!e.isPlayer) {
        const cd = e.pos.distanceTo(camera.position);
        if (cd > 70) {
          e.animAcc = (e.animAcc || 0) + dt;
          if (e.animAcc < (cd > 150 ? 0.2 : 0.1)) return;
          dt = e.animAcc;
          e.animAcc = 0;
        }
      }
      const { fx, fz, fwd, side, speed } = motionState(e, dt);
      let held = null, pickaxe = false;
      if (e.isPlayer) {
        const it = curItem();
        if (it && it.kind === "gun") held = it;
        else if (!it) pickaxe = true;
      } else held = e.gun;
      let cons = null, useK = -1;
      if (e.isPlayer) {
        const it = curItem();
        if (it && it.kind === "cons") {
          cons = it.id;
          if (e.consuming && e.consuming.it === it) useK = e.consuming.t / e.consuming.dur;
        }
      } else if (e.healT > 0) {
        cons = "big";
        useK = clamp(1 - e.healT / 2.5, 0, 1);
        held = null;
      }
      setHeld(e, held);
      setConsHeld(c, cons);
      D(A, "crouch", e.crouch ? 1 : 0, a * 0.7);
      D(A, "air", !e.onGround && !e.zgFloat ? 1 : 0, a);
      A.recoil = Math.max(0, A.recoil - dt * 8);
      A.flash -= dt;
      c.flash.visible = A.flash > 0;
      A.pumpT += dt;
      const aiming = e.isPlayer ? ads || mouse.l || !!e.reloading : A.recoil > 0.05 || !!e.enemy;
      D(A, "sprPose", held && !aiming ? A.sprint : 0, aS);
      const s = e.onGround ? speed : 0, back = fwd < -0.5 ? -1 : 1;
      const wRun = smooth(3.5, 6.5, s), wWalk = smooth(0.3, 2, s) * (1 - wRun), wT = 0;
      const wIdle = Math.max(0, 1 - wRun - wWalk - wT), W = c.w;
      D(W, "Idle", wIdle, aS);
      D(W, "Walk", wWalk, aS);
      D(W, "Run", wRun, aS);
      D(W, "TPose", wT, aS);
      for (const n in c.act) c.act[n].setEffectiveWeight(W[n]);
      c.act.Walk.setEffectiveTimeScale(back * clamp(s / 1.8, 0.7, 1.6));
      c.act.Run.setEffectiveTimeScale(back * clamp(s / (5.5 + 1.2 * A.sprint), 0.8, 2.15));
      const near = !player || e === player || e.pos.distanceTo(camera.position) < 70;
      c.mixer.update(dt);
      swayGear(e, c, s + (e.onGround ? 0 : Math.hypot(e.vel.x, e.vel.z) * 0.3), dt);
      bodyPose(e, g, c, a, dt);
      c.model.position.y = 0;
      g.updateMatrixWorld(true);
      c.model.getWorldQuaternion(_qm);
      const rightB = new V(1, 0, 0).applyQuaternion(_qm), fwdB = new V(0, 0, -1).applyQuaternion(_qm), upB = new V(0, 1, 0).applyQuaternion(_qm);
      const bend = (sd, th, kn) => {
        rotateBoneWorld(B[sd + "UpLeg"], rightB, th);
        rotateBoneWorld(B[sd + "Leg"], rightB, kn);
      };
      const cr = A.crouch, crE = Math.max(cr, e.onGround ? A.land * 0.75 : 0), right = _v1.set(Math.cos(e.yaw), 0, -Math.sin(e.yaw)).clone(), fwdV = new V(fx, 0, fz);
      let feet = null;
      if (near && crE > 0.01) {
        feet = [B.LeftFoot.getWorldPosition(new V()), B.RightFoot.getWorldPosition(new V())];
        if (A.air > 0.5) {
          feet[0].y += 0.25 * A.air;
          feet[1].y += 0.4 * A.air;
        }
      }
      c.model.position.y = -0.48 * crE;
      let sqY = 1;
      if (e.zgFloat) {
        const kz = 1 - Math.exp(-8 * dt);
        D(A, "zgP", e.zgPropel ? 1 : 0, kz);
        D(A, "zgS", e.zgPropel ? 0 : smooth(1.5, 7, e.vel.length()), 1 - Math.exp(-4 * dt));
        A.zgT = (A.zgT || e.walkT) + dt * lerp(3.2, 13, A.zgP);
        A.zgB = ((A.zgB || 0) + dt * (0.45 + 0.95 * A.zgS)) % 1;
        A.zgI = (A.zgI || e.walkT * 3) + dt;
        const P = A.zgP, Sw = A.zgS * (1 - P), I = (1 - P) * (1 - A.zgS), u = A.zgB;
        c.model.position.y += I * 0.07 * Math.sin(A.zgI * 1.5);
        sqY = 1 + I * 0.025 * Math.sin(A.zgI * 1.5 + 1) + Sw * (0.11 * Math.max(0, Math.cos(TAU * u * 2.5)) * (u < 0.2 ? 1 : 0) - 0.07 * Math.max(0, Math.sin(TAU * (u - 0.5)))) + P * (0.07 + 0.02 * Math.sin(A.zgT * 2));
      } else if (A.zgP) {
        A.zgP = 0;
        A.zgS = 0;
      }
      c.spin.scale.set(1 / Math.sqrt(sqY), sqY, 1 / Math.sqrt(sqY));
      c.spin.position.y += 1 - sqY;
      g.updateMatrixWorld(true);
      if (feet) {
        for (const [i, sd] of [[0, "Left"], [1, "Right"]]) {
          const hip = B[sd + "UpLeg"].getWorldPosition(new V());
          const pole = hip.clone().addScaledVector(fwdV, 1.2).add(new V(0, -0.4, 0));
          solveIK(B[sd + "UpLeg"], B[sd + "Leg"], B[sd + "Foot"], feet[i], pole);
        }
      }
      if (near) {
        if (e.zgFloat) {
          const P = A.zgP, Sw = A.zgS * (1 - P), I = (1 - P) * (1 - A.zgS), u = A.zgB, tI = A.zgI;
          const frog = Math.max(0, Math.sin(TAU * (u - 0.5))), snap = Math.max(0, Math.cos(TAU * u * 2.5)) * (u < 0.2 ? 1 : 0);
          for (const [sd, off, sx] of [["Left", 0, -1], ["Right", Math.PI, 1]]) {
            const t = A.zgT + off, ti = tI * 1.3 + off;
            const th = I * (0.35 + 0.38 * Math.sin(ti)) + Sw * (1.15 * frog - 0.18 * snap) + P * (0.7 + Math.sin(t) * 1.05);
            const kn = I * (0.55 + 0.5 * (Math.sin(ti + 1.1) + 1) / 2) + Sw * (0.15 + 1.9 * frog) + P * (0.5 + 1.25 * Math.max(0, Math.sin(t + 1.3)));
            bend(sd, th, -kn);
            rotateBoneWorld(B[sd + "UpLeg"], fwdB, -sx * (I * (0.16 + 0.06 * Math.sin(ti * 0.7)) + Sw * 0.6 * frog));
          }
          rotateBoneWorld(B.Neck, rightB, 0.45 * P + 0.35 * Sw + (e.zgTx || 0) * -0.3);
          rotateBoneWorld(B.Neck, upB, 0.3 * I * Math.sin(tI * 0.45));
          rotateBoneWorld(B.Hips, fwdB, 0.12 * I * Math.sin(tI * 0.8));
          rotateBoneWorld(B.Spine1, rightB, 0.1 * I * Math.sin(tI * 1.1) - 0.22 * Sw * frog + 0.18 * Sw * snap);
        } else if (A.air > 0.02) {
          const up = clamp(e.vel.y / 10.5, -1, 1), tk = smooth(-0.5, 0.6, up) * A.air;
          bend("Left", 0.35 * A.air + 0.95 * tk, -(0.35 * A.air + 1.35 * tk));
          bend("Right", 0.12 * A.air + 0.5 * tk, -(0.55 * A.air + 0.95 * tk));
          if (!held && !(pickaxe && e.swingT > 0)) {
            const lift = tk * 1.9 + A.air * 0.25, out = Math.max(0, A.air - tk) * 0.85;
            rotateBoneWorld(B.LeftArm, rightB, lift);
            rotateBoneWorld(B.RightArm, rightB, lift);
            rotateBoneWorld(B.LeftArm, fwdB, out);
            rotateBoneWorld(B.RightArm, fwdB, -out);
          }
        } else if (e.onGround && A.sprint > 0.02) {
          const sp2 = A.sprint * (1 - cr), d = B.LeftFoot.getWorldPosition(new V()).sub(B.RightFoot.getWorldPosition(new V())).dot(fwdB), dn = clamp(d / 0.5, -1, 1);
          const vd = (dn - (A.dn == null ? dn : A.dn)) / Math.max(dt, 1e-3);
          A.dn = dn;
          D(A, "swingL", clamp(vd * 0.35, -1, 1), 1 - Math.exp(-18 * dt));
          const lift = 1 - Math.abs(dn) * 0.6;
          bend("Left", 0.32 * dn * sp2 + 0.25 * sp2 * Math.max(0, A.swingL), -1 * sp2 * Math.max(0, A.swingL) * lift);
          bend("Right", -0.32 * dn * sp2 + 0.25 * sp2 * Math.max(0, -A.swingL), -1 * sp2 * Math.max(0, -A.swingL) * lift);
        }
      }
      const twist = speed > 1.2 ? clamp(Math.atan2(side, Math.abs(fwd)) * back, -0.85, 0.85) : 0;
      D(A, "twist", twist, aS);
      if (near) {
        rotateBoneWorld(B.Hips, UP, A.twist);
        rotateBoneWorld(B.Spine, UP, -A.twist * 0.5);
        rotateBoneWorld(B.Spine1, UP, -A.twist * 0.5);
      }
      const pitch = e.isPlayer ? e.pitch : e.aimPitch || 0, sp = A.sprPose, pE = pitch * (1 - sp);
      if (near) {
        const lean = -0.28 * cr - (held ? 0.06 : 0) * Math.min(1, s / 4) - 0.34 * A.sprint;
        rotateBoneWorld(B.Spine, right, lean);
        if (A.sprint > 0.01) rotateBoneWorld(B.Neck, right, 0.2 * A.sprint);
        if (held) {
          for (const n of ["Spine", "Spine1", "Spine2"]) rotateBoneWorld(B[n], right, pE / 3);
        } else rotateBoneWorld(B.Neck, right, pitch * 0.5);
        D(A, "stance", held ? 1 - sp : 0, aS);
        if (A.stance > 0.01) {
          const st = A.stance * (held && held.id === "pistol" ? 0.5 : 1);
          rotateBoneWorld(B.Spine1, upB, -0.24 * st);
          rotateBoneWorld(B.Spine2, upB, -0.16 * st);
          rotateBoneWorld(B.Neck, upB, 0.4 * st);
          if (B.LeftShoulder) rotateBoneWorld(B.LeftShoulder, upB, -0.25 * st);
        }
        if (A.hit > 0.01) {
          rotateBoneWorld(B.Spine1, right, 0.32 * A.hit);
          rotateBoneWorld(B.Neck, right, 0.25 * A.hit);
        }
        if (pickaxe && e.swingT > 0) {
          const P = pickPose(e);
          rotateBoneWorld(B.Spine1, UP, P.tw);
          rotateBoneWorld(B.Spine2, UP, P.tw * 0.5);
          rotateBoneWorld(B.Spine1, right, P.ln);
        }
      }
      const zgArms = (sides) => {
        const Sw = A.zgS * (1 - A.zgP), I = 1 - Sw, u = A.zgB, tI = A.zgI;
        for (const sd of sides) {
          const sx = sd === "Right" ? 1 : -1, ph = sx > 0 ? 0 : 1.7, sh = B[sd + "Arm"].getWorldPosition(new V());
          const st = zgStroke(u), out = I * (0.42 + 0.07 * Math.sin(tI * 1.1 + ph)) + Sw * st[0], up = I * (-0.16 + 0.15 * Math.sin(tI * 0.9 + ph)) + Sw * st[1], fw = I * (0.08 + 0.08 * Math.sin(tI * 0.7 + ph)) + Sw * st[2];
          const t = sh.clone().addScaledVector(rightB, sx * out).addScaledVector(upB, up).addScaledVector(fwdB, fw);
          solveIK(B[sd + "Arm"], B[sd + "ForeArm"], B[sd + "Hand"], t, sh.clone().addScaledVector(rightB, sx * 0.6).addScaledVector(upB, 0.05).addScaledVector(fwdB, -0.3));
          rotateBoneWorld(B[sd + "Hand"], fwdB, sx * (0.45 * I * Math.sin(tI * 2.1 + ph) + 0.5 * Sw * Math.sin(TAU * u)));
        }
      };
      c.pick.visible = pickaxe && !(e.zgFloat && ((A.zgP || 0) > 0.3 || A.zgS * (1 - A.zgP) > 0.35) && !(e.swingT > 0));
      if (cons && near) {
        consPose(e, c, cons, useK, rightB, fwdB, upB, dt);
      } else if (near && e.zgFloat && (A.zgP || 0) > 0.3 && !held && !(e.swingT > 0)) {
        const t = A.zgT * 1.15;
        for (const [sd, sx] of [["Left", -1], ["Right", 1]]) {
          rotateBoneWorld(B[sd + "Arm"], rightB, Math.sin(t + (sx > 0 ? 0 : Math.PI)) * 1.9 * A.zgP);
          rotateBoneWorld(B[sd + "Arm"], fwdB, sx * (0.35 + Math.cos(t * 2 + sx) * 0.3) * A.zgP);
          rotateBoneWorld(B[sd + "ForeArm"], rightB, -0.4 - Math.max(0, Math.sin(t + (sx > 0 ? 0.6 : Math.PI + 0.6))) * 1.1);
        }
      } else if (near && e.zgFloat && !held && !(pickaxe && c.pick.visible)) {
        zgArms(["Left", "Right"]);
      } else if (held) {
        const H = HOLD[held.id], S = c.gunMount.scale.x;
        D(A, "reload", (e.isPlayer ? !!e.reloading : e.reloadT > 0) ? 1 : 0, a);
        const sh = B.RightArm.getWorldPosition(new V());
        g.worldToLocal(sh);
        const adsK = e.isPlayer && ads ? 1 : 0, cp = Math.cos(pE), sn = Math.sin(pE), dk = Math.pow(1 - A.draw, 2);
        const tp = e.isPlayer && !adsK ? 1 - sp : 0;
        const o = new V(H.g[0] - S * H.r[0] - 0.08 * adsK - 0.06 * sp + 0.16 * tp, H.g[1] - S * H.r[1] + 0.04 * adsK - 0.12 * sp - 0.35 * dk + 0.03 * tp, H.g[2] - S * H.r[2] + A.recoil * 0.09 + 0.06 * sp);
        const oy = o.y * cp - o.z * sn, oz = o.y * sn + o.z * cp;
        const dn = (A.dn || 0) * A.sprint;
        c.gunMount.position.set(sh.x + o.x, sh.y + oy + 0.035 * sp * (Math.abs(A.dn || 0) - 0.5), sh.z + oz);
        c.gunMount.rotation.set(pE + A.recoil * 0.22 - 0.45 * A.reload - 0.5 * sp - 1 * dk, 0.35 * sp + 0.1 * dn, 0.6 * A.reload + 0.45 * sp + 0.08 * dn);
        if (near && c.held) {
          c.gunMount.updateMatrixWorld(true);
          const rt = c.gunMount.localToWorld(new V(...H.r)), lt = c.gunMount.localToWorld(new V(...H.l));
          if (A.reload > 0.05) {
            lt.lerp(c.gunMount.localToWorld(new V(0, -0.32, -0.05)), A.reload * (0.5 + 0.5 * Math.sin(matchTime * 8)));
          }
          const rS = B.RightArm.getWorldPosition(new V()), lS = B.LeftArm.getWorldPosition(new V());
          solveIK(B.RightArm, B.RightForeArm, B.RightHand, rt, rS.clone().addScaledVector(right, 0.3).add(new V(0, -0.8, 0)).addScaledVector(fwdV, -0.1));
          solveIK(B.LeftArm, B.LeftForeArm, B.LeftHand, lt, lS.clone().addScaledVector(right, -0.5).add(new V(0, -0.7, 0)));
          const gq = c.gunMount.getWorldQuaternion(new T.Quaternion()), dir = (a2) => new V(...a2).applyQuaternion(gq);
          poseHand(B, "Right", dir([-0.1, -0.1, -0.99]), dir([-1, 0, 0.1]), 0.75);
          if (A.reload < 0.5) poseHand(B, "Left", dir(H.lf || [0.45, 0.1, -0.9]), dir(H.ln || [0, 1, 0]), 0.55);
        }
      } else if (pickaxe && near) {
        const P = pickPose(e), sh = B.RightArm.getWorldPosition(new V());
        const tgt = g.localToWorld(g.worldToLocal(sh.clone()).add(P.h));
        const grip = A.air < 0.02 || e.swingT > 0 || e.zgFloat;
        const pump = e.onGround && !(e.swingT > 0) ? A.sprint * (1 - cr) : 0, dn = A.dn || 0;
        if (pump > 0.01) {
          rotateBoneWorld(B.LeftArm, rightB, -0.8 * dn * pump);
          rotateBoneWorld(B.RightArm, rightB, 0.8 * dn * pump);
          rotateBoneWorld(B.LeftForeArm, rightB, 0.55 * pump);
          rotateBoneWorld(B.RightForeArm, rightB, 0.55 * pump);
        }
        const natR = B.RightHand.getWorldPosition(new V()), natL = B.LeftHand.getWorldPosition(new V());
        if (grip) solveIK(B.RightArm, B.RightForeArm, B.RightHand, tgt.lerp(natR, pump), sh.clone().addScaledVector(right, 0.6).add(new V(0, -0.5, 0)));
        c.pick.quaternion.copy(P.q);
        if (pump > 0.01) c.pick.quaternion.premultiply(_qm.setFromAxisAngle(_v2.set(1, 0, 0), (0.45 * dn - 0.8) * pump));
        D(A, "pk2", e.swingT > 0 ? 1 : 0, 1 - Math.exp(-20 * dt));
        const rest = grip ? (1 - A.pk2) * (1 - pump) : 0;
        const hw = B.RightHand.getWorldPosition(new V());
        if (rest > 0.01) {
          g.updateMatrixWorld(true);
          const hd2 = new V(0, 1, 0).applyQuaternion(c.pick.getWorldQuaternion(new T.Quaternion()));
          const pn = rightB.clone().negate();
          pn.addScaledVector(hd2, -pn.dot(hd2)).normalize();
          const pf = new V().crossVectors(hd2.clone().negate(), pn);
          poseHand(B, "Right", pf, pn, 0.8 * rest);
          hw.addScaledVector(pf, 0.07 * rest).addScaledVector(pn, 0.03 * rest);
        }
        g.worldToLocal(hw);
        c.pick.position.copy(hw);
        const w2 = A.pk2 * (1 - pump);
        if (grip && w2 > 0.01) {
          c.pick.updateMatrixWorld(true);
          const lS = B.LeftArm.getWorldPosition(new V());
          solveIK(B.LeftArm, B.LeftForeArm, B.LeftHand, natL.clone().lerp(c.pick.localToWorld(new V(0, 0.15, 0)), w2), lS.clone().addScaledVector(right, -0.6).add(new V(0, -0.5, 0)));
        } else if (e.zgFloat) zgArms(["Left"]);
      }
      if (c.held && c.held.userData.pump) {
        const k = clamp(A.pumpT / 0.45, 0, 1);
        c.held.userData.pump.position.z = -0.38 + (A.pumpT > 0 && A.pumpT < 0.45 ? Math.sin(k * Math.PI) * 0.14 : 0);
      }
      const hd = B.Head.getWorldPosition(new V());
      g.worldToLocal(hd);
      c.hb.head.position.set(hd.x, hd.y + 0.1, hd.z);
      const ch = B.Spine2.getWorldPosition(new V());
      g.worldToLocal(ch);
      c.hb.chest.position.set(ch.x, ch.y - 0.12, ch.z);
      const hp = B.Hips.getWorldPosition(new V());
      g.worldToLocal(hp);
      const lh = Math.max(0.4, hp.y + 0.05);
      c.hb.legs.scale.y = lh;
      c.hb.legs.position.set(hp.x, lh / 2, hp.z);
    }
    function makeCombatant(name, isPlayer) {
      const ch = makeCharacterGLB();
      world.add(ch.g);
      const e = {
        etype: "char",
        name,
        isPlayer,
        ch,
        pos: new V(),
        vel: new V(),
        yaw: 0,
        pitch: 0,
        hp: 100,
        shield: 0,
        alive: true,
        onGround: false,
        kills: 0,
        radius: 0.45,
        height: 2,
        walkT: Math.random() * 6,
        swingT: 0,
        deadT: 0,
        crouch: false,
        reloadT: 0,
        anim: { crouch: 0, air: 0, recoil: 0, flash: 0, reload: 0, pumpT: 9, twist: 0, sprint: 0, sprPose: 0, stance: 0, pk2: 0, zgP: 0, zgS: 0, land: 0, hit: 0, draw: 1 }
      };
      if (SK) applySkin(ch, isPlayer ? equippedSkin() : pickBotSkin());
      ch.parts.forEach((m) => {
        m.userData.ent = e;
        m.userData.part = m === ch.head ? "head" : "body";
        charMeshes.push(m);
      });
      combatants.push(e);
      targetsDirty = true;
      return e;
    }
    function setHeld(e, it) {
      const c = e.ch, key = it ? it.id + ":" + it.r : "";
      if (c.heldKey === key) return;
      c.heldKey = key;
      if (c.held) {
        c.gunMount.remove(c.held);
        c.held = null;
      }
      if (it) {
        const m = makeGunModel(it.id, it.r);
        c.gunMount.add(m);
        c.held = m;
        m.userData.muzzle.add(c.flash);
        e.anim.draw = 0;
      }
    }
    function muzzlePos(e, out) {
      const c = e.ch;
      if (c.held) return c.held.userData.muzzle.getWorldPosition(out);
      return out.set(e.pos.x, e.pos.y + 1.5, e.pos.z);
    }
    const KICK = { ar: 0.55, smg: 0.35, pump: 1, pistol: 0.6, sniper: 1 };
    function fireFx(e, w, id) {
      const A = e.anim;
      A.recoil = Math.min(1.2, A.recoil + KICK[id]);
      A.flash = 0.05;
      e.ch.flash.scale.setScalar(rnd(0.6, 1.1) * (id === "pump" || id === "sniper" ? 1.5 : 1));
      e.ch.flash.material.rotation = Math.random() * 6;
      if (id === "pump") A.pumpT = -0.15;
      if (!player || e.pos.distanceTo(player.pos) > 45 || !e.ch.held) return;
      const m = new T.Mesh(GEO.shell, colorMat(13936202));
      e.ch.held.getWorldPosition(m.position);
      world.add(m);
      const v = new V(Math.cos(e.yaw) * rnd(2, 3.5), rnd(2.5, 4), -Math.sin(e.yaw) * rnd(2, 3.5));
      effects.push({ t: 0, dur: 0.6, obj: m, upd: (ef, k, dt) => {
        v.y -= GRAV * dt;
        m.position.addScaledVector(v, dt);
        m.rotation.x += dt * 20;
        m.rotation.y += dt * 14;
      } });
    }
    function isScoped() {
      const it = curItem();
      return !!(it && it.kind === "gun" && WEAP[it.id].zoom);
    }
    function D(o, k, t, a) {
      o[k] += (t - o[k]) * a;
    }
    class BoxGrid {
      constructor(cs) {
        this.cs = cs;
        this.cells = /* @__PURE__ */ new Map();
        this.size = 0;
        this.stamp = 0;
        this.out = [];
      }
      keys(b, f) {
        const cs = this.cs;
        for (let ix = Math.floor(b.min.x / cs); ix <= Math.floor(b.max.x / cs); ix++) for (let iz = Math.floor(b.min.z / cs); iz <= Math.floor(b.max.z / cs); iz++) f(ix * 73856093 ^ iz * 19349663);
      }
      add(b) {
        if (b._in) return;
        b._in = true;
        this.size++;
        this.keys(b, (k) => {
          let c = this.cells.get(k);
          if (!c) this.cells.set(k, c = []);
          c.push(b);
        });
      }
      delete(b) {
        if (!b._in) return;
        b._in = false;
        this.size--;
        this.keys(b, (k) => {
          const c = this.cells.get(k);
          if (c) {
            const i = c.indexOf(b);
            if (i >= 0) {
              c[i] = c[c.length - 1];
              c.pop();
            }
          }
        });
      }
      near(x, z, r) {
        const cs = this.cs, st = ++this.stamp, out = this.out;
        out.length = 0;
        for (let ix = Math.floor((x - r) / cs); ix <= Math.floor((x + r) / cs); ix++) for (let iz = Math.floor((z - r) / cs); iz <= Math.floor((z + r) / cs); iz++) {
          const c = this.cells.get(ix * 73856093 ^ iz * 19349663);
          if (c) {
            for (const b of c) if (b._st !== st) {
              b._st = st;
              out.push(b);
            }
          }
        }
        return out;
      }
    }
    const MESH_CS = 48;
    let meshGrid = null;
    function meshKey(ix, iz) {
      return ix * 73856093 ^ iz * 19349663;
    }
    function rebuildMeshGrid() {
      meshGrid = /* @__PURE__ */ new Map();
      const w = new V();
      for (const m of structMeshes) {
        m.getWorldPosition(w);
        const k = meshKey(Math.floor(w.x / MESH_CS), Math.floor(w.z / MESH_CS));
        let c = meshGrid.get(k);
        if (!c) meshGrid.set(k, c = []);
        c.push(m);
      }
    }
    const _segOut = [];
    const structsAlong = (o, d, len) => meshesAlong(o, d, len, false).filter((m) => m.userData.ent && m.userData.ent.etype === "piece");
    function meshesAlong(o, d, len, withChars) {
      refreshTargets();
      const out = _segOut;
      out.length = 0;
      const ex = o.x + d.x * len, ez = o.z + d.z * len, pad = 8;
      const x0 = Math.floor((Math.min(o.x, ex) - pad) / MESH_CS), x1 = Math.floor((Math.max(o.x, ex) + pad) / MESH_CS), z0 = Math.floor((Math.min(o.z, ez) - pad) / MESH_CS), z1 = Math.floor((Math.max(o.z, ez) + pad) / MESH_CS);
      for (let ix = x0; ix <= x1; ix++) for (let iz = z0; iz <= z1; iz++) {
        const c = meshGrid.get(meshKey(ix, iz));
        if (c) for (const m of c) out.push(m);
      }
      if (withChars) for (const m of charMeshes) out.push(m);
      return out;
    }
    function boxRay(o, d, far) {
      let t = far;
      const L = ZG.L;
      if (d.x > 0) t = Math.min(t, (L - o.x) / d.x);
      else if (d.x < 0) t = Math.min(t, (-L - o.x) / d.x);
      if (d.z > 0) t = Math.min(t, (L - o.z) / d.z);
      else if (d.z < 0) t = Math.min(t, (-L - o.z) / d.z);
      if (d.y > 0) t = Math.min(t, (ZG.H - o.y) / d.y);
      else if (d.y < 0) t = Math.min(t, -o.y / d.y);
      return Math.max(0, t);
    }
    function hasLOS(a, b) {
      tv3.subVectors(b, a);
      const dist = tv3.length();
      if (dist < 0.01) return true;
      tv3.divideScalar(dist);
      ray.set(a, tv3);
      ray.near = 0.5;
      ray.far = dist - 0.5;
      return ray.intersectObjects(meshesAlong(a, tv3, dist, false), false).length === 0;
    }
    function jitter(dir, s, out) {
      out.copy(dir);
      out.x += (Math.random() + Math.random() - 1) * s;
      out.y += (Math.random() + Math.random() - 1) * s;
      out.z += (Math.random() + Math.random() - 1) * s;
      return out.normalize();
    }
    const tracerMat = new T.LineBasicMaterial({ color: 16773808, transparent: true, opacity: 0.9 });
    function fireRay(shooter, origin, dir, w, rar, mult, muzzle, near) {
      ray.set(origin, dir);
      ray.near = near || 0;
      ray.far = w.range;
      const hits = ray.intersectObjects(meshesAlong(origin, dir, w.range, true), false);
      let hit = null;
      for (const h of hits) {
        if (h.object.userData.ent === shooter) continue;
        hit = h;
        break;
      }
      const hd = hit ? hit.distance : w.range, td = boxRay(origin, dir, hd);
      const end = new V();
      if (td < hd) {
        end.copy(origin).addScaledVector(dir, td);
        puff(end, 14540253);
        sfx("impact", end, { mat: "stone" });
      } else if (hit) {
        end.copy(hit.point);
        const ent = hit.object.userData.ent;
        let dmg = w.dmg * rar.m * mult;
        if (w.falloff) dmg *= clamp(1 - (hit.distance - 8) / 30, 0.25, 1);
        if (ent.etype === "char") {
          const head = hit.object.userData.part === "head";
          if (head) dmg *= w.head;
          hurt(ent, dmg, shooter, { head, point: hit.point, weapon: w.name, dir });
          if (ent !== player && shooter !== player) sfx("impact", end, { mat: "flesh" });
        } else {
          puff(end, 14540253);
          sfx("impact", end, { mat: "stone" });
        }
      } else end.copy(origin).addScaledVector(dir, Math.min(w.range, 250));
      if (shooter !== player && player.alive && !(hit && hit.object.userData.ent === player)) {
        const hx = player.pos.x - origin.x, hy = player.pos.y + 1.5 - origin.y, hz = player.pos.z - origin.z, len = origin.distanceTo(end);
        const k = clamp(hx * dir.x + hy * dir.y + hz * dir.z, 0, len), cx = origin.x + dir.x * k, cy = origin.y + dir.y * k, cz = origin.z + dir.z * k;
        if (k > 2 && Math.hypot(player.pos.x - cx, player.pos.y + 1.5 - cy, player.pos.z - cz) < 3) sfx("whiz", new V(cx, cy, cz));
      }
      tracer(muzzle, end);
    }
    function hurt(t, amt, src, info) {
      if (!t.alive) return;
      info = info || {};
      amt = Math.max(1, Math.round(amt));
      let left = amt, sh = 0;
      if (t.shield > 0) {
        sh = Math.min(t.shield, left);
        t.shield -= sh;
        left -= sh;
      }
      t.hp -= left;
      t.anim.hit = Math.min(1, (t.anim.hit || 0) + 0.35 + amt / 50);
      if (src === player && t !== player) {
        player.dmgDealt += amt;
        showDmg(info.point || t.pos.clone().add(new V(0, 1.4, 0)), amt, info.head ? "head" : sh > 0 ? "shield" : "");
        hitMarker(info.head);
        sfx(sh > 0 && t.shield <= 0 ? "shieldBreak" : info.head ? "head" : sh > 0 ? "shield" : "hit");
      }
      if (t === player) {
        hurtFlash = Math.min(1, hurtFlash + 0.3 + amt / 90);
        sfx("hurt");
      }
      if (!t.isPlayer && src && src !== t && src.alive) {
        t.healT = 0;
        if (t.enemy !== src) {
          t.enemy = src;
          t.seenAt = matchTime - 0.2;
        }
        t.lastSeen = src.pos.clone();
        t.lastSeenT = matchTime;
      }
      if (t.hp <= 0) eliminate(t, src, info.weapon, info);
    }
    function eliminate(t, killer, weapon, info) {
      if (!t.alive) return;
      t.alive = false;
      t.hp = 0;
      t.deadT = 0;
      aliveCount--;
      startDeath(t, deathKind(weapon, info), info);
      charMeshes = charMeshes.filter((m) => m.userData.ent !== t);
      targetsDirty = true;
      feed(killer ? `${killer.name} eliminated ${t.name}${weapon ? " \xB7 " + weapon : ""}` : weapon ? `${t.name} ${t === player ? "were" : "was"} hit by a ${weapon}` : `${t.name} was eliminated`, killer === player || t === player);
      if (killer) {
        killer.kills++;
        if (killer === player) {
          sfx("elim");
          banner("Eliminated", t.name + " \xB7 " + aliveCount + " left", 2);
        }
      }
      if (killer && killer.alive && killer !== t) {
        const add = 50, hp = Math.min(100 - killer.hp, add);
        killer.hp += hp;
        killer.shield = Math.min(100, killer.shield + add - hp);
      }
      if (t === player) endMatch(false, killer, weapon);
      else if (player.alive && aliveCount <= 1) endMatch(true);
    }
    function curItem() {
      const p = player;
      return p.sel === 0 ? null : p.slots[p.sel];
    }
    function cancelActions() {
      player.consuming = null;
      player.reloading = null;
    }
    function playerFire() {
      const p = player;
      if (p.consuming) return;
      const it = curItem();
      if (!it) {
        if (p.fireCd > 0) return;
        p.fireCd = 0.42;
        p.swingSide = p.swingT > 0 || p.comboT > 0 ? 1 - (p.swingSide || 0) : 0;
        p.swingT = SWING_T;
        p.comboT = SWING_T + 0.3;
        p.hitT = SWING_T * PICK_HIT;
        sfx("swing");
        return;
      }
      if (it.kind === "cons") return startConsume(it);
      gunFire(it);
    }
    function pickaxeHit() {
      const p = player;
      if (curItem()) return;
      camera.getWorldDirection(tv1);
      ray.set(camera.position, tv1);
      ray.near = camDistNow;
      ray.far = camDistNow + 4.2;
      const hits = ray.intersectObjects(meshesAlong(camera.position, tv1, camDistNow + 4.2, true), false);
      const h = hits.find((x) => x.object.userData.ent !== p);
      if (h) {
        const ent = h.object.userData.ent;
        if (ent.etype === "char") hurt(ent, 20, p, { point: h.point, weapon: "Pickaxe", dir: tv1.clone() });
        else sfx("chop", null, { mat: "stone" });
      }
    }
    function gunFire(it) {
      const p = player;
      const w = WEAP[it.id];
      if (p.reloading || p.fireCd > 0) return;
      p.fireCd = w.rate;
      let spread = w.spread + w.bloom * p.bloom;
      if (ads) spread *= w.zoom ? 0.1 : 0.45;
      if (Math.hypot(p.vel.x, p.vel.z) > 3) spread += 0.01;
      if (p.crouch) spread *= 0.7;
      p.bloom = Math.min(1, p.bloom + 0.25);
      camera.getWorldDirection(tv1);
      muzzlePos(p, tv2);
      for (let i = 0; i < w.pellets; i++) {
        jitter(tv1, spread, tv4);
        fireRay(p, camera.position, tv4, w, RAR[it.r], 1, tv2, camDistNow + 0.4);
      }
      p.pitch = Math.min(1.25, p.pitch + w.recoil * rnd(0.6, 1));
      p.yaw += rnd(-1, 1) * w.recoil * 0.3;
      fireFx(p, w, it.id);
      sfx(it.id);
    }
    function startConsume(it) {
      const p = player, c = CONS[it.id];
      if (p.shield >= c.cap) return toast("Shield full");
      p.reloading = null;
      p.consuming = { it, t: 0, dur: c.time };
      sfx("useStart", null, { id: it.id });
    }
    function finishConsume() {
      const p = player, it = p.consuming.it, c = CONS[it.id];
      p.consuming = null;
      p.shield = Math.min(c.cap, p.shield + c.shield);
      sfx("healDone");
      healFx(p.pos.clone().add(new V(0, p.zgRoll > 1.5 ? 0.7 : 1.3, 0)), 7321343, 16, 2.4);
      it.count--;
      if (it.count <= 0) {
        const i = p.slots.indexOf(it);
        if (i > 0) p.slots[i] = null;
      }
      refreshHotbar();
    }
    function selectSlot(n) {
      const p = player;
      if (p.sel !== n) cancelActions();
      p.sel = n;
      refreshHotbar();
    }
    function makeBot(i) {
      const b = makeCombatant(NAMES[i % NAMES.length] + (i >= NAMES.length ? Math.floor(i / NAMES.length) + 1 : ""), false);
      Object.assign(b, {
        gun: null,
        inv: [],
        think: 0,
        fireCd: 0,
        reloadT: 0,
        enemy: null,
        seenAt: 0,
        lastSeen: null,
        lastSeenT: -99,
        react: rnd(DIFF[diff].react[0], DIFF[diff].react[1]),
        skill: rnd(0.8, 1.2),
        mag: 0,
        goal: null,
        stuckT: 0,
        lastPos: new V(),
        strafe: 1,
        strafeT: 0,
        healT: 0,
        swapT: 0,
        aimPitch: 0
      });
      return b;
    }
    function rollRarity(q) {
      const x = Math.random() + q * 0.22;
      return x < 0.42 ? 0 : x < 0.68 ? 1 : x < 0.86 ? 2 : x < 0.97 ? 3 : 4;
    }
    function armBot(b) {
      const main = { kind: "gun", id: pick(["ar", "ar", "ar", "smg", "smg", "sniper", "pistol"]), r: rollRarity(0.55) };
      b.inv = [main];
      if (Math.random() < 0.7) b.inv.push({ kind: "gun", id: "pump", r: rollRarity(0.5) });
      b.gun = main;
      b.mag = WEAP[main.id].mag;
      b.shield = pick([25, 50, 50, 75, 100]);
    }
    function botShoot(b, e, d) {
      const w = WEAP[b.gun.id];
      const Df = DIFF[diff];
      b.fireCd = w.rate * (w.auto ? Df.cad : Df.cad * 0.7) + rnd(0, 0.15);
      b.burst = (b.burst || 0) + 1;
      if (w.auto && b.burst % 5 === 0) b.fireCd += rnd(0.7, 1.1);
      const origin = muzzlePos(b, new V());
      const lag = 0.28, hy = Math.random() < Df.head ? e.crouch ? 1.45 : 1.8 : e.crouch ? 0.9 : 1.25;
      const aim = new V(e.pos.x - e.vel.x * lag, e.pos.y + 1 + (e.zgRoll > 1.5 ? -1 : 1) * (hy - 1) - e.vel.y * lag, e.pos.z - e.vel.z * lag);
      const dir = aim.sub(origin).normalize(), out = new V();
      const warm = 1 + 1.5 * Math.max(0, 1 - (matchTime - b.seenAt) / 3);
      const tsp = Math.hypot(e.vel.x, e.vel.z);
      const s = (w.spread + 0.024 * b.skill + d * 35e-5 + tsp * 35e-4 + 8e-3 + (e.crouch ? 6e-3 : 0)) * Df.spread * warm;
      for (let i = 0; i < w.pellets; i++) {
        jitter(dir, s, out);
        fireRay(b, origin, out, w, RAR[b.gun.r], Df.dmg, origin, 0.3);
      }
      fireFx(b, w, b.gun.id);
      sfx(b.gun.id, b.pos);
    }
    function updateActions(dt) {
      const p = player;
      p.fireCd -= dt;
      p.bloom = Math.max(0, p.bloom - dt * 2.2);
      if (p.swingT > 0) p.swingT -= dt;
      if (p.comboT > 0) p.comboT -= dt;
      if (p.hitT > 0) {
        p.hitT -= dt;
        if (p.hitT <= 0) pickaxeHit();
      }
      if (p.consuming) {
        if (curItem() !== p.consuming.it) p.consuming = null;
        else {
          p.consuming.t += dt;
          if (p.consuming.t >= p.consuming.dur) finishConsume();
        }
      }
      const it = curItem();
      ads = state === "play" && mouse.r && p.alive && !!it && it.kind === "gun";
      if (!p.alive || state !== "play") return;
      if (mouse.l && (!it || it.kind === "gun" && WEAP[it.id].auto)) playerFire();
    }
    function onPrimaryDown() {
      const p = player;
      if (!p.alive) return;
      const it = curItem();
      if (it && it.kind === "cons") startConsume(it);
      else playerFire();
    }
    function tracer(a, b) {
      const geo = new T.BufferGeometry().setFromPoints([a.clone(), b.clone()]);
      const mat = tracerMat.clone();
      const l = new T.Line(geo, mat);
      world.add(l);
      effects.push({ t: 0, dur: 0.07, obj: l, upd: (e, k) => {
        mat.opacity = 0.9 * (1 - k);
      }, done: () => {
        geo.dispose();
        mat.dispose();
      } });
    }
    function puff(p, col) {
      const mat = new T.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8 });
      const m = new T.Mesh(GEO.puff, mat);
      m.position.copy(p);
      world.add(m);
      effects.push({ t: 0, dur: 0.3, obj: m, upd: (e, k) => {
        m.scale.setScalar(1 + k * 2.5);
        mat.opacity = 0.8 * (1 - k);
      }, done: () => mat.dispose() });
    }
    function updateEffects(dt) {
      for (let i = effects.length - 1; i >= 0; i--) {
        const e = effects[i];
        e.t += dt;
        const k = Math.min(1, e.t / e.dur);
        e.upd(e, k, dt);
        if (k >= 1) {
          world.remove(e.obj);
          if (e.done) e.done();
          effects.splice(i, 1);
        }
      }
    }
    const SVG = (inner) => `<svg viewBox="0 0 64 24" width="52" height="20" fill="currentColor" aria-hidden="true">${inner}</svg>`;
    const ICONS = {
      pick: SVG('<rect x="10" y="10.5" width="42" height="3" rx="1.5" transform="rotate(-20 32 12)"/><path d="M42 1c7 1 12 5 14 12l-3 1c-2-5-6-9-11-10z"/><path d="M42 1c-4 2-7 5-8 9l3 1c1-3 3-6 6-7z"/>'),
      ar: SVG('<polygon points="2,9 15,8 15,15 4,17"/><rect x="15" y="7" width="30" height="7" rx="1"/><rect x="45" y="9" width="17" height="3"/><rect x="21" y="3" width="13" height="3" rx="1.5"/><polygon points="20,14 26,14 24,21 18,21"/><polygon points="30,14 36,14 37,22 31,22"/>'),
      smg: SVG('<rect x="8" y="10" width="12" height="2"/><rect x="8" y="10" width="2" height="7"/><rect x="18" y="7" width="22" height="8" rx="1"/><rect x="40" y="9" width="8" height="3"/><rect x="47" y="8" width="7" height="5" rx="1"/><rect x="27" y="15" width="5" height="9"/><polygon points="20,15 25,15 23,21 18,21"/>'),
      pump: SVG('<polygon points="1,9 12,8 12,14 3,17"/><rect x="12" y="7" width="12" height="7" rx="1"/><rect x="24" y="7.5" width="38" height="3"/><rect x="24" y="11" width="28" height="2.5"/><rect x="33" y="10" width="11" height="5" rx="1"/><polygon points="14,14 19,14 17,20 12,20"/>'),
      pistol: SVG('<rect x="18" y="6" width="28" height="7" rx="1"/><rect x="46" y="8" width="3" height="3"/><polygon points="20,13 29,13 27,23 18,23"/><path d="M29 13h6v3a3 3 0 0 1-3 3h-3z" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
      sniper: SVG('<polygon points="0,9 12,8 12,14 0,17"/><rect x="12" y="8" width="20" height="6" rx="1"/><rect x="32" y="9.5" width="27" height="2.5"/><rect x="58" y="8.5" width="5" height="4" rx="1"/><rect x="15" y="2" width="16" height="4.5" rx="2.2"/><polygon points="16,14 21,14 19,20 14,20"/>'),
      mini: SVG('<rect x="29" y="3" width="6" height="5" rx="1"/><circle cx="32" cy="15" r="7"/>'),
      big: SVG('<rect x="28" y="1" width="8" height="5" rx="1"/><path d="M27 6h10l5 7v8a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2v-8z"/>')
    };
    const slotEls = [];
    for (let i = 0; i < 6; i++) {
      const d = document.createElement("div");
      d.className = "slot";
      d.innerHTML = `<span class="key">${i + 1}</span><span class="ic"></span><span class="nm"></span><span class="sb"></span>`;
      $("hotbar").appendChild(d);
      slotEls.push(d);
    }
    function refreshHotbar() {
      const p = player;
      if (!p) return;
      for (let i = 0; i < 6; i++) {
        const el = slotEls[i], it = i === 0 ? null : p.slots[i];
        let nm = "", sb = "", col = "";
        let ic = "";
        if (i === 0) {
          const eq = equippedPick();
          nm = "PICKAXE";
          col = eq ? RAR[eq.rar].c : "#c9d2de";
          ic = eq ? "px" + eq.i : "pick";
        } else if (it && it.kind === "gun") {
          nm = WEAP[it.id].short;
          col = RAR[it.r].c;
          sb = "\u221E";
          ic = it.id;
        } else if (it) {
          nm = CONS[it.id].short;
          col = CONS[it.id].color;
          sb = "\xD7" + it.count;
          ic = it.id;
        }
        el.style.setProperty("--rc", col || "transparent");
        if (el.dataset.ic !== ic) {
          el.dataset.ic = ic;
          el.children[1].innerHTML = ic ? ICONS[ic] || pickIcon(ic) : "";
        }
        el.children[2].textContent = nm;
        el.children[3].textContent = sb;
        el.classList.toggle("sel", p.sel === i);
        el.classList.toggle("empty", i > 0 && !it);
      }
    }
    const dmgPool = [];
    let dmgIdx = 0;
    for (let i = 0; i < 40; i++) {
      const d = document.createElement("div");
      d.className = "dn";
      d.hidden = true;
      $("dmg").appendChild(d);
      dmgPool.push({ el: d, pos: new V(), t: 0, live: false });
    }
    function showDmg(pos, txt, cls) {
      const d = dmgPool[dmgIdx++ % dmgPool.length];
      d.pos.copy(pos);
      d.pos.x += rnd(-0.3, 0.3);
      d.pos.y += rnd(0, 0.3);
      d.t = 0;
      d.live = true;
      d.el.textContent = txt;
      d.el.className = "dn " + (cls || "");
    }
    function updateDmg(dt) {
      for (const d of dmgPool) {
        if (!d.live) continue;
        d.t += dt;
        if (d.t > 0.9) {
          d.live = false;
          d.el.hidden = true;
          continue;
        }
        tv1.copy(d.pos);
        tv1.y += d.t * 1.2;
        tv1.project(camera);
        if (tv1.z > 1) {
          d.el.hidden = true;
          continue;
        }
        d.el.hidden = false;
        const x = (tv1.x + 1) / 2 * innerWidth, y = (1 - tv1.y) / 2 * innerHeight, sc = d.t < 0.1 ? 1.5 - d.t * 5 : 1;
        d.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${sc})`;
        d.el.style.opacity = d.t > 0.6 ? (0.9 - d.t) / 0.3 : 1;
      }
    }
    function hitMarker(head) {
      const h = $("hitmark");
      h.classList.toggle("head", !!head);
      hitT = 0.15;
    }
    function banner(main, sub, dur) {
      $("bannerMain").textContent = main;
      $("bannerSub").textContent = sub || "";
      $("banner").hidden = false;
      bannerT = dur || 3;
    }
    function toast(msg) {
      $("toast").textContent = msg;
      $("toast").hidden = false;
      toastT = 1.8;
    }
    function feed(text, mine) {
      const d = document.createElement("div");
      d.className = "fl" + (mine ? " mine" : "");
      d.textContent = text;
      const f = $("feed");
      f.prepend(d);
      while (f.children.length > 6) f.lastChild.remove();
      setTimeout(() => d.remove(), 8e3);
    }
    function hudTick() {
      const p = player;
      $("hpNum").textContent = Math.max(0, Math.ceil(p.hp));
      $("hpFill").style.width = clamp(p.hp, 0, 100) + "%";
      $("shNum").textContent = Math.ceil(p.shield);
      $("shFill").style.width = clamp(p.shield, 0, 100) + "%";
      $("aliveN").textContent = aliveCount;
      $("killN").textContent = p.kills;
      const st = $("gravTxt");
      st.textContent = ZG.state === "warn" ? "Gravity flip!" : ZG.state === "ceil" ? "Ceiling \xB7 " + Math.ceil(ZG.t) + "s" : "Zero-G";
      st.className = ZG.state === "warn" ? "flip" : ZG.state === "ceil" ? "ceil" : "";
      const it = curItem();
      if (it && it.kind === "gun") $("ammo").textContent = "\u221E";
      else $("ammo").textContent = "";
      refreshHotbar();
    }
    function hudFrame(dt) {
      const p = player;
      hurtFlash = Math.max(0, hurtFlash - dt * 1.5);
      $("hurt").style.opacity = hurtFlash;
      const sf = $("stFill");
      sf.style.width = p.stam + "%";
      sf.classList.toggle("low", !!p.stamLock || p.stam < 25);
      $("greenfx").style.opacity = ZG.flash;
      $("alarm").style.opacity = ZG.state === "warn" ? 0.55 + 0.45 * Math.sin(matchTime * Math.PI * 8) : ZG.state === "ceil" ? 0.12 : 0;
      hitT -= dt;
      $("hitmark").style.opacity = hitT > 0 ? 1 : 0;
      if (bannerT > 0) {
        bannerT -= dt;
        if (bannerT <= 0) $("banner").hidden = true;
      }
      if (toastT > 0) {
        toastT -= dt;
        if (toastT <= 0) $("toast").hidden = true;
      }
      const it = curItem();
      const bl = 1 + p.bloom * 1.5 + (ads ? -0.4 : 0);
      $("xhair").style.transform = `translate(-50%,-50%) scale(${bl})`;
      $("xhair").hidden = !p.alive;
      $("scope").hidden = !(ads && it && WEAP[it.id] && WEAP[it.id].zoom);
      const busy = p.consuming || p.reloading;
      if (p.consuming) {
        $("usebar").hidden = false;
        $("uselabel").textContent = "Drinking " + CONS[p.consuming.it.id].name;
        $("usefill").style.width = p.consuming.t / p.consuming.dur * 100 + "%";
      } else if (p.reloading) {
        $("usebar").hidden = false;
        $("uselabel").textContent = "Reloading";
        $("usefill").style.width = p.reloading.t / p.reloading.dur * 100 + "%";
      } else if (!busy) $("usebar").hidden = true;
      updateDmg(dt);
    }
    const mapC = $("map"), mctx = mapC.getContext("2d"), MAPS = 180;
    let mapBase = null;
    function renderMapBase() {
      mapBase = document.createElement("canvas");
      mapBase.width = mapBase.height = MAPS;
      const g = mapBase.getContext("2d");
      g.fillStyle = "#eef0f3";
      g.fillRect(0, 0, MAPS, MAPS);
      g.strokeStyle = "#c4c8ce";
      g.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        g.beginPath();
        g.moveTo(i * MAPS / 8, 0);
        g.lineTo(i * MAPS / 8, MAPS);
        g.moveTo(0, i * MAPS / 8);
        g.lineTo(MAPS, i * MAPS / 8);
        g.stroke();
      }
      const k = MAPS / (2 * ZG.L);
      for (const b of [...ZG.blocks].sort((a, c) => a.y - c.y)) {
        const l = Math.round(235 - b.y / ZG.H * 90);
        g.fillStyle = `rgb(${l - 12},${l - 8},${l})`;
        g.fillRect((b.x - b.sx / 2 + ZG.L) * k, (b.z - b.sz / 2 + ZG.L) * k, b.sx * k, b.sz * k);
        g.strokeStyle = "rgba(90,96,106,.6)";
        g.strokeRect((b.x - b.sx / 2 + ZG.L) * k, (b.z - b.sz / 2 + ZG.L) * k, b.sx * k, b.sz * k);
      }
    }
    function drawMap() {
      const g = mctx, k = MAPS / (2 * ZG.L), p = player;
      g.drawImage(mapBase, 0, 0);
      g.fillStyle = "#ff3347";
      for (const f of ZG.flyers || []) g.fillRect((f.pos.x - f.h.x + ZG.L) * k, (f.pos.z - f.h.z + ZG.L) * k, Math.max(3, f.h.x * 2 * k), Math.max(3, f.h.z * 2 * k));
      g.fillStyle = "#5cf0ff";
      for (const pd of ZG.pads || []) {
        g.beginPath();
        g.arc((pd.pos.x + ZG.L) * k, (pd.pos.z + ZG.L) * k, 2.2, 0, TAU);
        g.fill();
      }
      g.save();
      g.translate((p.pos.x + ZG.L) * k, (p.pos.z + ZG.L) * k);
      g.rotate(Math.atan2(-Math.cos(p.yaw), -Math.sin(p.yaw)));
      g.beginPath();
      g.moveTo(7, 0);
      g.lineTo(-5, 4.5);
      g.lineTo(-2.5, 0);
      g.lineTo(-5, -4.5);
      g.closePath();
      g.fillStyle = "#ffd23f";
      g.strokeStyle = "#1b2440";
      g.lineWidth = 1.5;
      g.fill();
      g.stroke();
      g.restore();
    }
    let camOverride = null;
    const camFwd = new V(), camRight = new V(), _zc = new V();
    let camDist = 4.2, camDistNow = 4.2, fov = 72;
    function updateCamera(dt) {
      if (state === "armory") {
        updateArmory(dt);
        return;
      }
      if (camOverride) {
        camera.position.copy(camOverride.pos);
        camera.lookAt(camOverride.look);
        return;
      }
      camera.up.set(0, 1, 0);
      if (state === "menu" || !player) {
        const t = performance.now() / 1e3 * 0.04;
        camera.position.set(Math.cos(t) * 60, ZG.H * 0.55, Math.sin(t) * 60);
        camera.lookAt(0, ZG.H * 0.4, 0);
        if (camera.fov !== 60) {
          camera.fov = 60;
          camera.updateProjectionMatrix();
        }
        return;
      }
      const p = player;
      if (!p.alive) {
        const a = matchTime * 0.25;
        camera.position.set(p.pos.x + Math.cos(a) * 9, p.pos.y + 3.5, p.pos.z + Math.sin(a) * 9);
        clampToBox(camera.position);
        camera.lookAt(p.pos.x, p.pos.y + 1, p.pos.z);
        return;
      }
      const cp = Math.cos(p.pitch);
      camFwd.set(-Math.sin(p.yaw) * cp, Math.sin(p.pitch), -Math.cos(p.yaw) * cp);
      camRight.set(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
      const pivot = tv1.set(p.pos.x, p.pos.y + 1.7 - 0.5 * p.anim.crouch, p.pos.z);
      const gun = !!curItem() && curItem().kind === "gun", dist = ads ? 2 : gun ? 3.4 : 4.6, side = ads ? 0.8 : gun ? 1.1 : 0.85;
      pivot.y += ads ? 0.05 : gun ? 0.3 : 0.45;
      const sp = p.anim.sprint || 0;
      pivot.y += Math.abs(Math.sin(matchTime * 8.5)) * 0.07 * sp * (p.onGround ? 1 : 0) - (p.anim.land || 0) * 0.25;
      camDist = lerp(camDist, dist + 0.45 * sp, 1 - Math.exp(-12 * dt));
      const start = tv2.copy(pivot).addScaledVector(camRight, side);
      let d = camDist;
      tv3.copy(camFwd).negate();
      ray.set(start, tv3);
      ray.near = 0;
      ray.far = camDist;
      const h = ray.intersectObjects(structsAlong(start, tv3, camDist), false);
      if (h.length) d = Math.max(0.4, h[0].distance - 0.25);
      camDistNow = d;
      camera.position.copy(start).addScaledVector(camFwd, -d);
      tv3.set(start.x + camFwd.x * 60, start.y + camFwd.y * 60, start.z + camFwd.z * 60);
      if (ZG.camRoll > 1e-3) {
        const ax = tv4.set(-Math.sin(p.yaw), 0, -Math.cos(p.yaw)), c = _zc.set(p.pos.x, p.pos.y + 1, p.pos.z);
        camera.position.sub(c).applyAxisAngle(ax, ZG.camRoll).add(c);
        tv3.sub(c).applyAxisAngle(ax, ZG.camRoll).add(c);
        camera.up.set(0, 1, 0).applyAxisAngle(ax, ZG.camRoll);
      }
      clampToBox(camera.position);
      camera.lookAt(tv3);
      if (camShake > 0) {
        camShake = Math.max(0, camShake - dt * (camShake > 0.3 ? 1.1 : 0.5));
        const s = camShake * camShake * 0.9 + camShake * 0.15;
        camera.position.x += rnd(-s, s);
        camera.position.y += rnd(-s, s);
        camera.position.z += rnd(-s, s);
        camera.rotation.z += rnd(-s, s) * 0.04;
      }
      const it = curItem(), tf = ads ? it && WEAP[it.id].zoom ? 20 : 52 : 72 + 7 * sp;
      fov = lerp(fov, tf, 1 - Math.exp(-14 * dt));
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    function clampToBox(v) {
      const m = ZG.L - 0.4;
      v.x = clamp(v.x, -m, m);
      v.z = clamp(v.z, -m, m);
      v.y = clamp(v.y, 0.4, ZG.H - 0.4);
      return v;
    }
    function updateSun() {
      const f = state === "menu" || !player ? tv4.set(0, 0, 0) : player.pos;
      sun.position.copy(f).addScaledVector(SUN_DIR, 200);
      sun.target.position.copy(f);
    }
    const ARM_IDS = ["ar", "smg", "pump", "pistol", "sniper"], ARM_Y = 420;
    let armIdx = 0, armGroup = null, armGuns = [];
    function buildArmory() {
      if (armMode === "picks" && PX) return buildPickStand();
      if (armMode === "skins" && SK) return buildSkinStand();
      if (armGroup) scene.remove(armGroup);
      armGroup = new T.Group();
      armGroup.position.set(0, ARM_Y, 0);
      armGuns = [];
      const id = ARM_IDS[armIdx];
      for (let r = 0; r < 5; r++) {
        const holder = new T.Group();
        holder.position.x = (r - 2) * (id === "sniper" ? 2.15 : 1.65);
        const gm = makeGunModel(id, r);
        gm.scale.setScalar(id === "pistol" ? 2 : id === "sniper" ? 1.05 : 1.3);
        holder.add(gm);
        const halo = new T.Sprite(auraMats(RAR[r].c).halo);
        halo.scale.setScalar(1.6 + r * 0.25);
        halo.position.z = -0.6;
        holder.add(halo);
        armGroup.add(holder);
        armGuns.push(holder);
      }
      scene.add(armGroup);
      const w = WEAP[id];
      $("armName").textContent = w.name;
      $("armName").style.color = "";
      $("armKick").textContent = "Armory";
      $("armNote").textContent = "";
      $("armPower").hidden = true;
      $("armStats").textContent = `Damage ${w.dmg * w.pellets > w.dmg ? w.dmg + " \xD7 " + w.pellets : w.dmg} \xB7 ${w.auto ? "Full auto" : "Single shot"}`;
      $("armLabels").innerHTML = RAR.map((r) => `<span style="color:${r.c}">${r.n}</span>`).join("");
    }
    function openArmory() {
      state = "armory";
      if (world) world.visible = false;
      $("menu").hidden = true;
      $("armory").hidden = false;
      buildArmory();
      $("armNext").focus();
    }
    function closeArmory() {
      state = "menu";
      if (world) world.visible = true;
      $("armory").hidden = true;
      $("menu").hidden = false;
      if (armGroup) {
        scene.remove(armGroup);
        armGroup = null;
      }
      $("armoryBtn").focus();
    }
    function updateArmory(dt) {
      dt = dt || 1 / 60;
      const t = performance.now() / 1e3;
      if (armMode === "picks" && PX) return updatePickStand(t);
      if (armMode === "skins" && SK) return updateSkinStand(t, dt);
      armGuns.forEach((h, i) => {
        h.rotation.y = Math.PI / 2 + Math.sin(t * 0.8 + i * 0.5) * 0.55;
        h.position.y = Math.sin(t * 1.6 + i) * 0.06;
      });
      const dist = Math.max(6, (ARM_IDS[armIdx] === "sniper" ? 13 : 10.5) / camera.aspect);
      camera.position.set(0, ARM_Y + 0.2, dist);
      camera.lookAt(0, ARM_Y, 0);
      if (camera.fov !== 50) {
        camera.fov = 50;
        camera.updateProjectionMatrix();
      }
      const labels = $("armLabels").children;
      armGuns.forEach((h, i) => {
        h.getWorldPosition(tv1);
        tv1.y -= 0.75;
        tv1.project(camera);
        const el = labels[i];
        if (el) {
          el.style.left = (tv1.x + 1) / 2 * innerWidth + "px";
          el.style.top = (1 - tv1.y) / 2 * innerHeight + "px";
        }
      });
    }
    const PX = window.PICKAXES || null;
    const PX_TRAIL = { embers: 16747039, snow: 16777215, bubbles: 12578815, bats: 10181887, sparkles: 16777215, stars: 16769658, spray: 16727972, bolts: 16773754, coins: 16765503, leaves: 5493099, ash: 10132130, wisps: 13172718 };
    let armMode = "guns", pxIdx = 0, pxShown = [];
    const pxCache = /* @__PURE__ */ new Map();
    function svgTexture(svg, w, h) {
      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;
      const tex = new T.CanvasTexture(cv);
      const img = new Image();
      img.onload = () => {
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        tex.needsUpdate = true;
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      return tex;
    }
    function svgPathShape(d) {
      const sh = new T.Shape(), tk = d.match(/[MLHVCQZ]|-?\d*\.?\d+/gi);
      let i = 0, cmd = "", x = 0, y = 0;
      const n = () => parseFloat(tk[i++]);
      while (i < tk.length) {
        if (/[a-z]/i.test(tk[i])) cmd = tk[i++].toUpperCase();
        if (cmd === "M") {
          x = n();
          y = n();
          sh.moveTo(x, -y);
          cmd = "L";
        } else if (cmd === "L") {
          x = n();
          y = n();
          sh.lineTo(x, -y);
        } else if (cmd === "H") {
          x = n();
          sh.lineTo(x, -y);
        } else if (cmd === "V") {
          y = n();
          sh.lineTo(x, -y);
        } else if (cmd === "C") {
          const a = n(), b = n(), c = n(), e = n();
          x = n();
          y = n();
          sh.bezierCurveTo(a, -b, c, -e, x, -y);
        } else if (cmd === "Q") {
          const a = n(), b = n();
          x = n();
          y = n();
          sh.quadraticCurveTo(a, -b, x, -y);
        } else if (cmd === "Z") cmd = "";
        else i++;
      }
      return sh;
    }
    function makePickaxe3D(it, held) {
      const Z = PX.SIZES[it.sz], L = Z.L, HS = PX.headScale(it), alpha = it.x.alpha || 1;
      const g = new T.Group(), inner = new T.Group();
      g.add(inner);
      const Ph = (o) => new T.MeshPhongMaterial(Object.assign({ shininess: 45, specular: 3815994 }, o));
      const mat = (o) => {
        const m = Ph(o);
        if (alpha < 1) {
          m.transparent = true;
          m.opacity = alpha;
        }
        return m;
      };
      const tex = svgTexture(PX.headSVG(it), 512, 282);
      tex.repeat.set(1 / 200, 1 / 110);
      tex.offset.set(0, 100 / 110);
      const geo = new T.ExtrudeGeometry(svgPathShape(PX.SHAPES[it.shape]), { depth: 14, bevelEnabled: true, bevelThickness: 4.5, bevelSize: 2.6, bevelSegments: 4, curveSegments: 14 });
      geo.translate(-100, 48, -7);
      const hg = new T.Group();
      hg.position.set(100, -48, 0);
      hg.scale.setScalar(HS);
      inner.add(hg);
      const sideCol = new T.Color(it.h1).lerp(new T.Color(it.h2), 0.5).lerp(new T.Color(it.edge), 0.35);
      hg.add(new T.Mesh(geo, [mat({ map: tex, emissive: 16777215, emissiveMap: tex, emissiveIntensity: 0.12 }), mat({ color: sideCol, emissive: sideCol.clone().multiplyScalar(0.12), shininess: 70 })]));
      const collar = new T.Mesh(new T.CylinderGeometry(11, 11, 26, 16), Ph({ color: it.edge, shininess: 80, specular: 6710886 }));
      collar.scale.z = 0.95;
      collar.position.set(0, -1, 0);
      hg.add(collar);
      if (it.x.gem) {
        const gm = Ph({ color: it.x.gem, emissive: new T.Color(it.x.gem).multiplyScalar(0.4), shininess: 120, specular: 16777215 }), gg = new T.SphereGeometry(6, 16, 12);
        for (const z of [13, -13]) {
          const gem = new T.Mesh(gg, gm);
          gem.position.set(0, -1, z);
          gem.scale.z = 0.55;
          hg.add(gem);
        }
      }
      const htex = svgTexture(PX.handleStripSVG(it), 64, Math.round(L * 4));
      const handle = new T.Mesh(new T.CylinderGeometry(7, 7, L, 16), Ph({ map: htex, shininess: 25, specular: 2236962 }));
      handle.position.set(100, -(50 + L / 2), 0);
      inner.add(handle);
      const pe = -(50 + L), pom = it.x.pom, pc = it.x.gem || it.edge, add = (geo2, col, y, em) => {
        const m = new T.Mesh(geo2, Ph({ color: col, shininess: 70, emissive: em ? new T.Color(col).multiplyScalar(0.6) : 0 }));
        m.position.set(100, y, 0);
        inner.add(m);
        return m;
      };
      if (it.hs === "bone") {
        for (const dx of [-9, 9]) {
          const b = add(new T.SphereGeometry(6.5, 12, 10), it.ha, pe);
          b.position.x += dx;
        }
      } else if (pom === "spike") add(new T.ConeGeometry(7, 18, 10), it.edge, pe - 9).rotation.x = Math.PI;
      else if (pom === "ball") add(new T.SphereGeometry(9, 16, 12), 14885947, pe - 6);
      else if (pom === "crown") add(new T.CylinderGeometry(10, 8, 12, 6), 16765503, pe - 6);
      else if (pom === "skull") add(new T.SphereGeometry(9, 14, 12), 15919830, pe - 7);
      else if (pom === "lure") add(new T.SphereGeometry(5, 12, 10), 16773754, pe - 10, true);
      else add(new T.CylinderGeometry(9, 9, 10, 14), pc, pe - 3);
      if (it.x.glow && !held) {
        const halo = new T.Sprite(auraMats(it.x.glow).halo);
        halo.scale.setScalar(170 * HS);
        halo.position.set(100, -46, -25);
        inner.add(halo);
      }
      if (it.x.parts && !held) {
        const ring = new T.Group(), sm = auraMats("#" + new T.Color(PX_TRAIL[it.x.parts] || 16777215).getHexString()).spark;
        for (let k = 0; k < 10; k++) {
          const s = new T.Sprite(sm), a = k / 10 * Math.PI * 2;
          s.position.set(Math.cos(a) * (70 + k % 3 * 18), k % 4 * 30 - 60, Math.sin(a) * (70 + k % 3 * 18));
          s.scale.setScalar(14 + k % 3 * 6);
          ring.add(s);
        }
        ring.position.set(100, -60, 0);
        inner.add(ring);
        g.userData.trail = ring;
      }
      if (held) {
        inner.position.set(-100, 50 + L - 16, 0);
        g.scale.setScalar(54e-4);
        return g;
      }
      const top = 48 - 56 * HS, bot = 50 + L + 18;
      inner.position.set(-100, (top + bot) / 2, 0);
      g.scale.setScalar(0.016);
      g.rotation.z = -0.55;
      return g;
    }
    function disposeObj(o) {
      o.traverse((m) => {
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => {
            if (x.map) x.map.dispose();
            x.dispose();
          });
        }
      });
    }
    function pickModel(i) {
      let m = pxCache.get(i);
      if (m) {
        pxCache.delete(i);
        pxCache.set(i, m);
        return m;
      }
      m = makePickaxe3D(PX.ITEMS[i]);
      pxCache.set(i, m);
      if (pxCache.size > 12) {
        const old = pxCache.keys().next().value;
        disposeObj(pxCache.get(old));
        pxCache.delete(old);
      }
      return m;
    }
    function buildPickStand() {
      if (armGroup) scene.remove(armGroup);
      armGroup = new T.Group();
      armGroup.position.set(0, ARM_Y, 0);
      armGuns = [];
      pxShown = [];
      const N = PX.ITEMS.length;
      for (const o of [-1, 1, 0]) {
        const h = new T.Group();
        h.add(pickModel((pxIdx + o + N) % N));
        h.position.set(o * 4.3, 0, o ? -1.5 : 0);
        h.scale.setScalar(o ? 0.55 : 1);
        h.userData.o = o;
        armGroup.add(h);
        pxShown.push(h);
      }
      scene.add(armGroup);
      const it = PX.ITEMS[pxIdx], r = RAR[it.rar], Z = PX.SIZES[it.sz];
      $("armKick").textContent = `${it.set.n} set \xB7 ${pxIdx + 1} of ${N}`;
      $("armName").textContent = it.n;
      $("armName").style.color = r.c;
      $("armLabels").innerHTML = "";
      $("armPower").hidden = true;
      $("armStats").textContent = `${r.n} \xB7 ${Z.n} size`;
      showEquip();
      $("armNote").textContent = "";
      [...$("armSets").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === it.set.id)));
    }
    function updatePickStand(t) {
      for (const h of pxShown) {
        const o = h.userData.o;
        h.rotation.y = o ? Math.sin(t * 0.7 + o) * 0.5 : t * 0.9;
        h.position.y = Math.sin(t * 1.5 + o) * 0.08;
        const tr = h.children[0] && h.children[0].userData.trail;
        if (tr) tr.rotation.y = t * 0.8;
      }
      const dist = Math.max(7.5, 11 / camera.aspect);
      camera.position.set(0, ARM_Y + 0.3, dist);
      camera.lookAt(0, ARM_Y, 0);
      if (camera.fov !== 50) {
        camera.fov = 50;
        camera.updateProjectionMatrix();
      }
    }
    function setArmMode(m) {
      if (m === "picks" && !PX || m === "skins" && !(SK && SOLDIER)) return;
      armMode = m;
      $("armEquip").hidden = m === "guns";
      $("armGunsTab").setAttribute("aria-pressed", String(m === "guns"));
      $("armPicksTab").setAttribute("aria-pressed", String(m === "picks"));
      $("armSkinsTab").setAttribute("aria-pressed", String(m === "skins"));
      $("armSets").hidden = m === "guns";
      $("armSets").setAttribute("aria-label", m === "skins" ? "Skin theme" : "Pickaxe set");
      $("armSets").innerHTML = m === "skins" ? SK.THEMES.map((t) => `<button data-s="${t.id}" aria-pressed="false">${t.n}</button>`).join("") : m === "picks" ? PX.SETS.map((s) => `<button data-s="${s.id}" aria-pressed="false">${s.n}</button>`).join("") : "";
      buildArmory();
    }
    function armStep(d) {
      if (armMode === "picks" && PX) {
        const N = PX.ITEMS.length;
        pxIdx = (pxIdx + d + N) % N;
      } else if (armMode === "skins" && SK) {
        const N = SK.ITEMS.length;
        skIdx = (skIdx + d + N) % N;
      } else armIdx = (armIdx + d + 5) % 5;
      buildArmory();
    }
    if (!PX) $("armPicksTab").hidden = true;
    $("armSets").addEventListener("click", (ev) => {
      const b = ev.target.closest("button");
      if (!b) return;
      if (armMode === "skins") skIdx = SK.ITEMS.findIndex((i) => i.t === b.dataset.s);
      else pxIdx = PX.ITEMS.findIndex((i) => i.set.id === b.dataset.s);
      buildArmory();
    });
    $("armSkinsTab").addEventListener("click", () => setArmMode("skins"));
    var skIdx = 0, skShown = [];
    function studioLights(gr) {
      const k = new T.DirectionalLight(16774374, 0.9);
      k.position.set(2, 3, 5);
      const r = new T.DirectionalLight(12572927, 0.6);
      r.position.set(-3, 2, -4);
      gr.add(k, k.target, r, r.target);
    }
    function standChar(skin) {
      const c = makeCharacterGLB();
      c.pick.visible = false;
      applySkin(c, skin);
      return c;
    }
    function buildSkinStand() {
      if (armGroup) scene.remove(armGroup);
      for (const c of skShown) for (const o of c.gear || []) o.traverse((m) => {
        if (m.isMesh) m.geometry.dispose();
      });
      armGroup = new T.Group();
      armGroup.position.set(0, ARM_Y, 0);
      armGuns = [];
      skShown = [];
      const N = SK.ITEMS.length;
      studioLights(armGroup);
      for (const o of [-1, 1, 0]) {
        const c = standChar(SK.ITEMS[(skIdx + o + N) % N]);
        c.g.position.set(o * 2.1, o ? 0.15 : 0, o ? -1.6 : 0);
        c.g.scale.setScalar(o ? 0.7 : 1);
        c.g.userData.o = o;
        armGroup.add(c.g);
        skShown.push(c);
      }
      scene.add(armGroup);
      const it = SK.ITEMS[skIdx], r = RAR[it.r];
      $("armKick").textContent = `${it.theme.n} \xB7 ${skIdx + 1} of ${N}`;
      $("armName").textContent = it.n;
      $("armName").style.color = r.c;
      $("armLabels").innerHTML = "";
      $("armPower").hidden = true;
      $("armStats").textContent = `${r.n} outfit`;
      $("armNote").textContent = "";
      showEquip();
      [...$("armSets").children].forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.s === it.t)));
    }
    function updateSkinStand(t, dt) {
      for (const c of skShown) {
        const o = c.g.userData.o;
        c.g.rotation.y = c.g.userData.yaw != null ? c.g.userData.yaw : o ? 0.5 * o : Math.PI + t * 0.6;
        c.mixer.update(dt);
        swayGear({ onGround: true, walkT: 0 }, c, 0, dt);
      }
      const dist = armGroup.userData.dist || Math.max(4.6, 6.2 / camera.aspect);
      camera.position.set(0, ARM_Y + 1.25, dist);
      camera.lookAt(0, ARM_Y + 1, 0);
      if (camera.fov !== 50) {
        camera.fov = 50;
        camera.updateProjectionMatrix();
      }
    }
    $("armGunsTab").addEventListener("click", () => setArmMode("guns"));
    let equippedName = "Standard Issue";
    try {
      const v = localStorage.getItem("stormIslandPick");
      if (v && PX && PX.ITEMS.some((i) => i.n === v)) equippedName = v;
    } catch (e) {
    }
    function equippedPick() {
      return PX ? PX.ITEMS.find((i) => i.n === equippedName) || null : null;
    }
    function pickIcon(ic) {
      const it = PX && PX.ITEMS[+ic.slice(2)];
      return it ? PX.pickSVG(it, "hb").replace('<svg viewBox="0 0 200 200"', '<svg viewBox="24 22 152 152" width="30" height="30" aria-hidden="true"') : "";
    }
    function showEquip() {
      const on = armMode === "skins" ? SK.ITEMS[skIdx].n === equippedSkinName() : PX && PX.ITEMS[pxIdx].n === equippedName, b = $("armEquip");
      b.textContent = on ? "Equipped \u2713" : "Equip";
      b.setAttribute("aria-pressed", String(!!on));
    }
    function showPickNote() {
      const eq = equippedPick(), sk = equippedSkin(), esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
      $("pickNote").innerHTML = [["Skin", sk ? sk.n : "Default Trooper"], ["Pickaxe", eq ? eq.n : "Default"]].map(([k, v]) => `<span class="lochip"><i>${esc(k)}</i>${esc(v)}</span>`).join("");
    }
    var skinName = null;
    function equippedSkinName() {
      if (skinName == null) {
        skinName = "Default Trooper";
        try {
          const v = localStorage.getItem("stormIslandSkin");
          if (v && SK && SK.ITEMS.some((i) => i.n === v)) skinName = v;
        } catch (e) {
        }
      }
      return skinName;
    }
    function equippedSkin() {
      return SK ? SK.ITEMS.find((i) => i.n === equippedSkinName()) || SK.ITEMS[0] : null;
    }
    function pickBotSkin() {
      return Math.random() < 0.1 ? SK.ITEMS[0] : SK.ITEMS[1 + Math.floor(Math.random() * (SK.ITEMS.length - 1))];
    }
    function applyPickSkin(e) {
      const eq = equippedPick();
      if (!eq || !e || !e.ch) return;
      const c = e.ch;
      for (const o of [...c.pick.children]) {
        c.pick.remove(o);
        if (o.userData.skin) disposeObj(o);
      }
      const w = new T.Group();
      w.userData.skin = true;
      w.add(makePickaxe3D(eq, true));
      c.pick.add(w);
    }
    function equipCurrent() {
      if (armMode === "skins") {
        const it = SK.ITEMS[skIdx];
        skinName = it.n;
        try {
          localStorage.setItem("stormIslandSkin", it.n);
        } catch (e) {
        }
        showEquip();
        showPickNote();
        if (player) applySkin(player.ch, it);
        sfx("pickup", null, { item: { kind: "gun", r: it.r } });
        return;
      }
      equippedName = PX.ITEMS[pxIdx].n;
      try {
        localStorage.setItem("stormIslandPick", equippedName);
      } catch (e) {
      }
      showEquip();
      showPickNote();
      applyPickSkin(player);
      refreshHotbar();
      sfx("pickup", null, { item: { kind: "gun", r: PX.ITEMS[pxIdx].rar } });
    }
    $("armEquip").addEventListener("click", equipCurrent);
    $("lockerBtn").addEventListener("click", () => {
      const eq = equippedPick();
      if (eq) pxIdx = eq.i;
      const sk = equippedSkin();
      if (sk) skIdx = sk.i;
      openArmory();
      setArmMode(SK && SOLDIER ? "skins" : "picks");
      $("armEquip").focus();
    });
    if (!PX && !SK) $("lockerBtn").hidden = true;
    if (!SK) $("armSkinsTab").hidden = true;
    showPickNote();
    $("armPicksTab").addEventListener("click", () => setArmMode("picks"));
    const zgMats = {};
    function zgGridTex(cells, minor) {
      return canvasTex(512, 512, (g, w) => {
        g.fillStyle = "#f6f7f9";
        g.fillRect(0, 0, w, w);
        g.strokeStyle = "rgba(120,128,142,.16)";
        g.lineWidth = 1;
        for (let i = 0; i <= cells * minor; i++) {
          const x = i * w / (cells * minor);
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, w);
          g.moveTo(0, x);
          g.lineTo(w, x);
          g.stroke();
        }
        g.strokeStyle = "rgba(110,118,132,.45)";
        g.lineWidth = 3;
        for (let i = 0; i <= cells; i++) {
          const x = i * w / cells;
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x, w);
          g.moveTo(0, x);
          g.lineTo(w, x);
          g.stroke();
        }
      });
    }
    function zgMat(hex) {
      if (!zgMats[hex]) zgMats[hex] = Lam({ color: hex });
      return zgMats[hex];
    }
    const zgEdgeMat = new T.LineBasicMaterial({ color: 9080985, transparent: true, opacity: 0.55 });
    function zgSolid(mesh, box) {
      const p = registerPiece({ kind: "zg", hp: 1e9, maxHp: 1e9, obj: mesh, meshes: [mesh], box });
      p.solid = true;
      return p;
    }
    function buildZeroG() {
      const L = ZG.L, H = ZG.H;
      const faces = [[[0, 0, 0], [-Math.PI / 2, 0, 0], 2 * L, 2 * L], [[0, H, 0], [Math.PI / 2, 0, 0], 2 * L, 2 * L], [[0, H / 2, -L], [0, 0, 0], 2 * L, H], [[0, H / 2, L], [0, Math.PI, 0], 2 * L, H], [[-L, H / 2, 0], [0, Math.PI / 2, 0], 2 * L, H], [[L, H / 2, 0], [0, -Math.PI / 2, 0], 2 * L, H]];
      for (const [pos, rot, w, h] of faces) {
        const tex = zgGridTex(4, 4);
        tex.wrapS = tex.wrapT = T.RepeatWrapping;
        tex.repeat.set(w / 32, h / 32);
        const m = new T.Mesh(new T.PlaneGeometry(w, h), Lam({ map: tex }));
        m.position.set(...pos);
        m.rotation.set(...rot);
        m.receiveShadow = true;
        world.add(m);
      }
      const seam = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(2 * L - 0.2, H - 0.2, 2 * L - 0.2)), new T.LineBasicMaterial({ color: 10134190 }));
      seam.position.y = H / 2;
      world.add(seam);
      const cols = [16777215, 16777215, 15790579, 14672614, 13225427, 11449274, 9278363], placed = [];
      const fits = (x, y, z, sx, sy, sz, pad) => Math.abs(x) + sx / 2 < L - 4 && Math.abs(z) + sz / 2 < L - 4 && y - sy / 2 >= 0 && y + sy / 2 <= H && !placed.some((b) => Math.abs(b.x - x) < (b.sx + sx) / 2 + pad && Math.abs(b.y - y) < (b.sy + sy) / 2 + pad && Math.abs(b.z - z) < (b.sz + sz) / 2 + pad);
      const add = (x, y, z, sx, sy, sz, col) => {
        placed.push({ x, y, z, sx, sy, sz });
        const m = new T.Mesh(new T.BoxGeometry(sx, sy, sz), zgMat(col));
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        world.add(m);
        const ep = new T.EdgesGeometry(m.geometry).attributes.position.array;
        for (let i = 0; i < ep.length; i += 3) edges.push(ep[i] + x, ep[i + 1] + y, ep[i + 2] + z);
        zgSolid(m, boxOf(x, y, z, sx, sy, sz));
      };
      const edges = [];
      for (let i = 0; i < 18; i++) {
        const s = rnd(4, 7), x = rnd(-L + 12, L - 12), z = rnd(-L + 12, L - 12);
        if (fits(x, H / 2, z, s, H, s, 6)) add(x, H / 2, z, s, H, s, pick([14672614, 13225427]));
      }
      let n = 0, tries = 0;
      while (n < 320 && tries < 14e3) {
        tries++;
        const kind = Math.random();
        let sx, sy, sz;
        if (kind < 0.45) {
          sx = sy = sz = rnd(3, 9);
        } else if (kind < 0.75) {
          sx = rnd(8, 18);
          sz = rnd(8, 18);
          sy = rnd(1.2, 2.5);
        } else if (kind < 0.9) {
          sx = rnd(2, 4);
          sz = rnd(2, 4);
          sy = rnd(10, 22);
        } else {
          sx = rnd(10, 24);
          sz = rnd(2, 3);
          sy = rnd(5, 10);
        }
        const x = rnd(-L + 6, L - 6), z = rnd(-L + 6, L - 6), y = Math.random() < 0.15 ? sy / 2 : rnd(4, H - 4);
        if (!fits(x, y, z, sx, sy, sz, 3)) continue;
        add(x, y, z, sx, sy, sz, pick(cols));
        n++;
      }
      const eg = new T.BufferGeometry();
      eg.setAttribute("position", new T.Float32BufferAttribute(edges, 3));
      world.add(new T.LineSegments(eg, zgEdgeMat));
      ZG.blocks = placed;
    }
    function zgFree(x, y, z, m) {
      m = m || 1.2;
      if (Math.abs(x) > ZG.L - 3 || Math.abs(z) > ZG.L - 3 || y < 1 || y > ZG.H - 4) return false;
      return !ZG.blocks.some((b) => Math.abs(b.x - x) < b.sx / 2 + m && Math.abs(b.y - (y + 1)) < b.sy / 2 + m + 1 && Math.abs(b.z - z) < b.sz / 2 + m);
    }
    function zgSpawn(e, i, n) {
      for (let k = 0; k < 400; k++) {
        const a = i / n * Math.PI * 2 + rnd(-0.3, 0.3), r = rnd(ZG.L * 0.35, ZG.L * 0.85), x = Math.cos(a) * r, z = Math.sin(a) * r, y = rnd(8, ZG.H - 14);
        if (zgFree(x, y, z, 2)) {
          e.pos.set(x, y, z);
          break;
        }
      }
      e.vel.set(0, 0, 0);
      e.onGround = false;
      e.zgFloat = true;
      e.zgRoll = 0;
      e.stam = 100;
      e.yaw = Math.atan2(e.pos.x, e.pos.z);
    }
    function zgMove(e, dt) {
      const p = e.pos, r = e.radius, h = 2;
      let hitY = 0;
      if (ZG.state === "ceil") {
        e.vel.y = Math.min(38, e.vel.y + GRAV * dt);
      }
      for (const ax of ["x", "z", "y"]) {
        const d = e.vel[ax] * dt;
        if (!d) continue;
        p[ax] += d;
        for (const b of colliders.near(p.x, p.z, r + 1)) {
          if (p.x + r <= b.min.x || p.x - r >= b.max.x || p.z + r <= b.min.z || p.z - r >= b.max.z || p.y + h <= b.min.y || p.y >= b.max.y) continue;
          if (ax === "y") {
            if (d > 0) {
              p.y = b.min.y - h;
              hitY = 1;
            } else {
              p.y = b.max.y;
              hitY = -1;
            }
            e.vel.y = 0;
          } else {
            p[ax] = d > 0 ? b.min[ax] - r : b.max[ax] + r;
            e.vel[ax] *= -0.2;
          }
        }
      }
      const L = ZG.L - r - 0.1;
      if (p.x < -L) {
        p.x = -L;
        e.vel.x = 0;
      } else if (p.x > L) {
        p.x = L;
        e.vel.x = 0;
      }
      if (p.z < -L) {
        p.z = -L;
        e.vel.z = 0;
      } else if (p.z > L) {
        p.z = L;
        e.vel.z = 0;
      }
      if (p.y < 0.05) {
        p.y = 0.05;
        if (e.vel.y < 0) e.vel.y = 0;
        hitY = -1;
      } else if (p.y + h > ZG.H - 0.05) {
        p.y = ZG.H - 0.05 - h;
        if (e.vel.y > 0) e.vel.y = 0;
        hitY = 1;
      }
      const was = e.onGround;
      e.onGround = ZG.state === "ceil" && hitY === 1;
      if (e.onGround && !was && e.zgFall > 8) {
        e.anim.land = clamp(e.zgFall / 20, 0.3, 1);
        if (e === player) {
          sfx("land", null, { v: e.zgFall, surf: "rock" });
          camShake = Math.max(camShake, 0.35);
        }
      }
      e.zgFall = e.onGround ? 0 : Math.max(0, e.vel.y);
      e.zgFloat = ZG.state !== "ceil";
    }
    function zgStamina(e, want, dt) {
      if (e.stamLock && e.stam > 33) e.stamLock = false;
      const can = want && !e.stamLock && e.stam > 0;
      if (can) {
        e.stam = Math.max(0, e.stam - 34 * dt);
        e.stamRest = 0;
        if (e.stam <= 0) {
          e.stamLock = true;
          if (e === player) toast("No stamina");
        }
      } else {
        e.stamRest = (e.stamRest || 0) + dt;
        if (e.stamRest > 0.6) e.stam = Math.min(100, e.stam + 22 * dt);
      }
      return can;
    }
    const _zf = new V(), _zr = new V(), _zw = new V();
    function updatePlayerZG(dt) {
      const p = player;
      if (!p.alive) {
        p.wantJump = false;
        return;
      }
      const flip = ZG.camRoll > Math.PI / 2, cp = Math.cos(p.pitch);
      let mx = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), mz = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
      if (flip) mx = -mx;
      const my = (keys.Space ? 1 : 0) - (keys.KeyC || keys.ControlLeft ? 1 : 0);
      _zr.set(Math.cos(p.yaw), 0, -Math.sin(p.yaw));
      p.crouch = false;
      if (ZG.state !== "ceil") {
        const prop = zgStamina(p, (keys.ShiftLeft || keys.ShiftRight) && mz > 0 && !ads, dt);
        if (prop && !p.zgPropel) sfx("propel");
        p.zgPropel = prop;
        _zf.set(-Math.sin(p.yaw) * cp, Math.sin(p.pitch), -Math.cos(p.yaw) * cp);
        const sp = prop ? 22 : ads ? 5.5 : 9;
        _zw.set(0, 0, 0).addScaledVector(_zf, mz).addScaledVector(_zr, mx);
        _zw.y += my;
        if (_zw.lengthSq() > 1) _zw.normalize();
        _zw.multiplyScalar(sp);
        const k = 1 - Math.exp(-(prop ? 2.6 : 2.2) * (p.boostT > 0 ? 0.12 : 1) * dt);
        p.vel.lerp(_zw, k);
        p.zgTx = prop ? -1.25 : -0.75 * clamp(mz, 0, 1) * (curItem() && curItem().kind === "gun" ? 0.2 : 1);
      } else {
        p.zgPropel = false;
        zgStamina(p, false, dt);
        const sprint = (keys.ShiftLeft || keys.ShiftRight) && mz > 0 && !ads;
        p.sprinting = sprint && p.onGround;
        const sp = ads ? 4.5 : sprint ? 11 : 7.5, fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw), k = 1 - Math.exp(-(p.onGround ? 14 : 3) * dt);
        p.vel.x = lerp(p.vel.x, (fx * mz + _zr.x * mx) * sp, k);
        p.vel.z = lerp(p.vel.z, (fz * mz + _zr.z * mx) * sp, k);
        if (p.onGround && p.wantJump) {
          p.vel.y = -10.5;
          p.onGround = false;
          sfx("jump");
        }
        p.zgTx = 0;
      }
      p.wantJump = false;
      zgMove(p, dt);
    }
    function updateZG(dt) {
      ZG.t -= dt;
      ZG.flash = Math.max(0, ZG.flash - dt * 1.2);
      if (ZG.state === "float" && ZG.t <= 0) {
        ZG.state = "warn";
        ZG.t = 3;
        banner("Gravity flip!", "", 3);
        sfx("stormWarn");
      } else if (ZG.state === "warn") {
        if (Math.floor(ZG.t * 4) !== Math.floor((ZG.t + dt) * 4)) sfx("alarm", null, { hi: Math.floor(ZG.t * 4) % 2 === 0 });
        if (ZG.t <= 0) {
          ZG.state = "ceil";
          ZG.t = rnd(14, 20);
          for (const e of combatants) {
            e.zgRoll = Math.PI;
            e.vel.y = Math.max(e.vel.y, 6);
            e.zgPropel = false;
          }
          sfx("gravUp");
          camShake = Math.max(camShake, 0.5);
          banner("Upside down!", "", 2.5);
        }
      } else if (ZG.state === "ceil" && ZG.t <= 0) {
        ZG.state = "float";
        ZG.t = rnd(24, 36);
        ZG.flash = 1;
        for (const e of combatants) {
          e.zgRoll = 0;
          e.onGround = false;
          e.vel.y = -rnd(2, 4);
        }
        sfx("gravDown");
        banner("Zero-G", "", 2);
      }
      const want = ZG.state === "ceil" ? Math.PI : 0;
      ZG.camRoll += (want - ZG.camRoll) * (1 - Math.exp(-5 * dt));
      if (Math.abs(want - ZG.camRoll) < 2e-3) ZG.camRoll = want;
    }
    function updateBotZG(b, dt) {
      if (!b.alive) return;
      b.think -= dt;
      b.fireCd -= dt;
      b.reloadT -= dt;
      b.swapT -= dt;
      b.strafeT -= dt;
      if (b.enemy && !b.enemy.alive) b.enemy = null;
      const ceil = ZG.state === "ceil", c = tv1.set(b.pos.x, b.pos.y + 1, b.pos.z);
      if (b.think <= 0) {
        b.think = rnd(0.15, 0.3);
        let best = null;
        const near = [];
        for (const o of combatants) {
          if (o === b || !o.alive) continue;
          const d = Math.hypot(o.pos.x - b.pos.x, o.pos.y - b.pos.y, o.pos.z - b.pos.z);
          if (d < 160) near.push([d, o]);
        }
        near.sort((x, y) => x[0] - y[0]);
        for (let i = 0; i < Math.min(6, near.length); i++) {
          const o = near[i][1];
          if (hasLOS(c, tv2.set(o.pos.x, o.pos.y + 1, o.pos.z))) {
            best = o;
            break;
          }
        }
        if (best) {
          if (best !== b.enemy) b.seenAt = matchTime;
          b.enemy = best;
          b.lastSeen = best.pos.clone();
          b.lastSeenT = matchTime;
        } else if (b.enemy && matchTime - b.lastSeenT > 0.8) b.enemy = null;
        if (!b.enemy && (!b.goal || Math.random() < 0.05)) {
          for (let k = 0; k < 20; k++) {
            const x = rnd(-ZG.L + 8, ZG.L - 8), y = rnd(4, ZG.H - 8), z = rnd(-ZG.L + 8, ZG.L - 8);
            if (zgFree(x, y, z)) {
              b.goal = new V(x, y, z);
              break;
            }
          }
        }
      }
      const wish = _zw.set(0, 0, 0);
      let speed = 9, prop = false;
      if (b.enemy) {
        const e = b.enemy, dx = e.pos.x - b.pos.x, dy = e.pos.y - b.pos.y, dz = e.pos.z - b.pos.z, d = Math.hypot(dx, dy, dz) || 1, dh = Math.hypot(dx, dz) || 1;
        const want = d < 12 && b.inv[1] ? b.inv[1] : b.inv[0];
        if (want !== b.gun && b.swapT <= 0) {
          b.gun = want;
          b.mag = WEAP[want.id].mag;
          b.fireCd = Math.max(b.fireCd, 0.3);
          b.swapT = 1.2;
        }
        b.yaw = angLerp(b.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-12 * dt));
        b.aimPitch = Math.atan2(dy, dh) * (b.zgRoll > 1.5 ? -1 : 1);
        if (b.strafeT <= 0) {
          b.strafe = Math.random() < 0.5 ? -1 : 1;
          b.vstrafe = rnd(-1, 1);
          b.strafeT = rnd(0.4, 1.1);
        }
        const pref = WEAP[b.gun.id].pref, fwd = d > pref + 5 ? 1 : d < pref - 4 ? -0.7 : 0;
        wish.set(dx / d * fwd + -dz / dh * b.strafe * 0.9, ceil ? 0 : dy / d * fwd + b.vstrafe * 0.7, dz / d * fwd + dx / dh * b.strafe * 0.9);
        if (!ceil && d > pref + 25) prop = zgStamina(b, true, dt);
        if (matchTime - b.seenAt > b.react && b.fireCd <= 0 && b.reloadT <= 0) botShoot(b, e, d);
      } else if (b.goal) {
        const g = b.goal, dx = g.x - b.pos.x, dy = g.y - b.pos.y, dz = g.z - b.pos.z, d = Math.hypot(dx, dy, dz);
        if (d < 3) b.goal = null;
        else {
          wish.set(dx / d, ceil ? 0 : dy / d, dz / d);
          b.yaw = angLerp(b.yaw, Math.atan2(-dx, -dz), 1 - Math.exp(-5 * dt));
        }
        b.aimPitch = 0;
      }
      if (!prop) zgStamina(b, false, dt);
      b.zgPropel = prop;
      const m = 10;
      if (b.pos.x < -ZG.L + m) wish.x += 1;
      if (b.pos.x > ZG.L - m) wish.x -= 1;
      if (b.pos.z < -ZG.L + m) wish.z += 1;
      if (b.pos.z > ZG.L - m) wish.z -= 1;
      if (!ceil) {
        if (b.pos.y < 4) wish.y += 1;
        if (b.pos.y > ZG.H - 8) wish.y -= 1;
      }
      dodgeFlyers(b, wish, ceil);
      if (wish.lengthSq() > 1) wish.normalize();
      if (ceil) {
        speed = 7.5;
        const k = 1 - Math.exp(-(b.onGround ? 12 : 3) * dt);
        b.vel.x = lerp(b.vel.x, wish.x * speed, k);
        b.vel.z = lerp(b.vel.z, wish.z * speed, k);
        if (b.enemy && b.onGround && Math.random() < dt * 0.6) b.vel.y = -10.5;
        b.zgTx = 0;
      } else {
        speed = prop ? 21 : 9;
        b.vel.lerp(wish.multiplyScalar(speed), 1 - Math.exp(-2.4 * (b.boostT > 0 ? 0.12 : 1) * dt));
        b.zgTx = prop ? -1.25 : b.enemy ? -0.1 : -0.6;
      }
      b.stuckT = (b.stuckT || 0) + dt;
      if (b.stuckT > 1) {
        if (b.pos.distanceTo(b.lastPos) < 1 && wish.lengthSq() > 0.1) {
          b.goal = null;
          b.vstrafe = -(b.vstrafe || 1);
          if (!ceil) b.vel.y += rnd(-6, 6);
        }
        b.lastPos.copy(b.pos);
        b.stuckT = 0;
      }
      zgMove(b, dt);
    }
    const FLY_N = 24, FLY_GRACE = 3;
    const flyMat = Lam({ color: 15214652, emissive: 5898256 });
    const flyEdge = new T.LineBasicMaterial({ color: 16765141 });
    function buildFlyers() {
      ZG.flyers = [];
      for (let i = 0; i < FLY_N; i++) {
        const cube = Math.random() < 0.6, s = cube ? rnd(3, 5.5) : 0, hx = cube ? s / 2 : rnd(1.2, 2), hy = cube ? s / 2 : rnd(1.2, 2), hz = cube ? s / 2 : rnd(3, 5);
        const m = new T.Mesh(new T.BoxGeometry(hx * 2, hy * 2, hz * 2), flyMat);
        m.castShadow = true;
        m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), flyEdge));
        world.add(m);
        const f = { m, h: new V(hx, hy, hz), pos: new V(), vel: new V(), spin: new V(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).multiplyScalar(0.6), whizT: 0 };
        for (let k = 0; k < 200; k++) {
          f.pos.set(rnd(-ZG.L + 8, ZG.L - 8), rnd(8, ZG.H - 8), rnd(-ZG.L + 8, ZG.L - 8));
          if (!flyHitsBlock(f) && !combatants.some((e) => e.pos.distanceTo(f.pos) < 22)) break;
        }
        f.vel.set(rnd(-1, 1), rnd(-0.6, 0.6), rnd(-1, 1)).normalize().multiplyScalar(rnd(12, 22));
        m.position.copy(f.pos);
        ZG.flyers.push(f);
      }
    }
    function flyHitsBlock(f) {
      for (const b of ZG.blocks) if (Math.abs(b.x - f.pos.x) < b.sx / 2 + f.h.x && Math.abs(b.y - f.pos.y) < b.sy / 2 + f.h.y && Math.abs(b.z - f.pos.z) < b.sz / 2 + f.h.z) return b;
      return null;
    }
    function updateFlyers(dt) {
      for (const f of ZG.flyers) {
        f.pos.addScaledVector(f.vel, dt);
        const lim = { x: ZG.L, y: ZG.H, z: ZG.L };
        for (const ax of ["x", "y", "z"]) {
          const lo = ax === "y" ? f.h.y : -lim[ax] + f.h[ax], hi = lim[ax] - f.h[ax];
          if (f.pos[ax] < lo) {
            f.pos[ax] = lo;
            f.vel[ax] = Math.abs(f.vel[ax]);
          } else if (f.pos[ax] > hi) {
            f.pos[ax] = hi;
            f.vel[ax] = -Math.abs(f.vel[ax]);
          }
        }
        const b = flyHitsBlock(f);
        if (b) {
          const px = b.sx / 2 + f.h.x - Math.abs(f.pos.x - b.x), py = b.sy / 2 + f.h.y - Math.abs(f.pos.y - b.y), pz = b.sz / 2 + f.h.z - Math.abs(f.pos.z - b.z);
          const ax = px < py && px < pz ? "x" : py < pz ? "y" : "z", c = { x: b.x, y: b.y, z: b.z }[ax], sgn = f.pos[ax] > c ? 1 : -1, pen = { x: px, y: py, z: pz }[ax];
          f.pos[ax] += sgn * pen;
          f.vel[ax] = sgn * Math.abs(f.vel[ax]);
          sfx("impact", f.pos.clone(), { mat: "stone" });
        }
        f.m.position.copy(f.pos);
        f.m.rotation.x += f.spin.x * dt;
        f.m.rotation.y += f.spin.y * dt;
        f.m.rotation.z += f.spin.z * dt;
        if (matchTime > FLY_GRACE) for (const e of combatants) {
          if (!e.alive) continue;
          if (Math.abs(e.pos.x - f.pos.x) < f.h.x + e.radius && Math.abs(e.pos.y + 1 - f.pos.y) < f.h.y + 1 && Math.abs(e.pos.z - f.pos.z) < f.h.z + e.radius) {
            puff(e.pos.clone().add(new V(0, 1, 0)), 16724807);
            sfx("impact", e.pos.clone(), { mat: "stone" });
            if (e === player) camShake = Math.max(camShake, 1);
            eliminate(e, null, "flying block", { dir: f.vel.clone(), speed: f.vel.length() });
          }
        }
        f.whizT -= dt;
        if (player && player.alive && f.whizT <= 0 && f.pos.distanceTo(player.pos) < 9) {
          f.whizT = 1;
          sfx("whiz", f.pos.clone());
        }
      }
    }
    function dodgeFlyers(b, wish, ceil) {
      for (const f of ZG.flyers) {
        tv3.subVectors(b.pos, f.pos);
        tv3.y += 1;
        const d = tv3.length();
        if (d > 16 || tv3.dot(f.vel) <= 0) continue;
        tv3.multiplyScalar(2 / d);
        if (ceil) tv3.y = 0;
        wish.add(tv3);
      }
    }
    const PAD_R = 1.7, PAD_V = 34;
    const padTex = canvasTex(128, 128, (g, w) => {
      g.clearRect(0, 0, w, w);
      g.strokeStyle = "#ffffff";
      g.lineWidth = 12;
      g.lineCap = "round";
      g.lineJoin = "round";
      for (const y of [34, 70, 106]) {
        g.beginPath();
        g.moveTo(26, y);
        g.lineTo(64, y - 26);
        g.lineTo(102, y);
        g.stroke();
      }
    });
    padTex.wrapT = T.RepeatWrapping;
    function addPad(pos, n) {
      const g = new T.Group();
      g.position.copy(pos);
      g.quaternion.setFromUnitVectors(UP, n);
      const base = new T.Mesh(new T.CylinderGeometry(PAD_R, PAD_R + 0.2, 0.25, 28), Lam({ color: 1911354, emissive: 678512 }));
      base.position.y = 0.12;
      g.add(base);
      const arrows = new T.Mesh(new T.PlaneGeometry(PAD_R * 1.5, PAD_R * 1.5), new T.MeshBasicMaterial({ map: padTex, color: 6091007, transparent: true, depthWrite: false }));
      arrows.rotation.x = -Math.PI / 2;
      arrows.position.y = 0.27;
      g.add(arrows);
      const glow = new T.Mesh(new T.CylinderGeometry(PAD_R, PAD_R, 2.2, 28, 1, true), new T.MeshBasicMaterial({ color: 6091007, transparent: true, opacity: 0.18, side: T.DoubleSide, depthWrite: false, blending: T.AdditiveBlending }));
      glow.position.y = 1.25;
      g.add(glow);
      world.add(g);
      ZG.pads.push({ pos: pos.clone(), n: n.clone(), g, glow, arrows, pulse: 0 });
    }
    function buildPads() {
      ZG.pads = [];
      const L = ZG.L, H = ZG.H, down = new V(0, -1, 0);
      const clear = (x, z, y0, y1) => !ZG.blocks.some((b) => Math.abs(b.x - x) < b.sx / 2 + PAD_R + 1 && Math.abs(b.z - z) < b.sz / 2 + PAD_R + 1 && b.y + b.sy / 2 > y0 && b.y - b.sy / 2 < y1);
      const spot = (y0, y1) => {
        for (let k = 0; k < 200; k++) {
          const x = rnd(-L + 10, L - 10), z = rnd(-L + 10, L - 10);
          if (clear(x, z, y0, y1)) return [x, z];
        }
        return null;
      };
      for (let i = 0; i < 12; i++) {
        const s = spot(0, 4);
        if (s) addPad(new V(s[0], 0.02, s[1]), UP);
      }
      for (let i = 0; i < 12; i++) {
        const s = spot(H - 4, H);
        if (s) addPad(new V(s[0], H - 0.02, s[1]), down);
      }
      for (const [n, wall] of [[new V(1, 0, 0), new V(-L + 0.02, 0, 0)], [new V(-1, 0, 0), new V(L - 0.02, 0, 0)], [new V(0, 0, 1), new V(0, 0, -L + 0.02)], [new V(0, 0, -1), new V(0, 0, L - 0.02)]]) {
        for (let k = 0; k < 3; k++) {
          const t = rnd(-L + 15, L - 15), y = rnd(12, H - 12);
          const p = wall.clone();
          if (n.x) p.z = t;
          else p.x = t;
          p.y = y;
          addPad(p, n);
        }
      }
      const flats = ZG.blocks.filter((b) => b.sx >= 8 && b.sz >= 8 && b.sy <= 2.6);
      flats.sort(() => Math.random() - 0.5);
      for (const b of flats.slice(0, 14)) {
        const top = Math.random() < 0.5;
        addPad(new V(b.x, top ? b.y + b.sy / 2 + 0.02 : b.y - b.sy / 2 - 0.02, b.z), top ? UP : down);
      }
    }
    function updatePads(dt) {
      for (const pd of ZG.pads) {
        pd.pulse = Math.max(0, pd.pulse - dt * 2.5);
        pd.arrows.material.map.offset.y -= dt * 0.6;
        pd.glow.material.opacity = 0.14 + 0.5 * pd.pulse;
        pd.glow.scale.y = 1 + pd.pulse * 1.5;
        pd.glow.position.y = 1.25 * (1 + pd.pulse * 1.5);
      }
      for (const e of combatants) {
        if (!e.alive) continue;
        e.padT = Math.max(0, (e.padT || 0) - dt);
        e.boostT = Math.max(0, (e.boostT || 0) - dt);
        if (e.padT > 0) continue;
        for (const pd of ZG.pads) {
          tv3.set(e.pos.x, e.pos.y + 1, e.pos.z).sub(pd.pos);
          const along = tv3.dot(pd.n);
          if (along < -0.5 || along > 2.6) continue;
          tv3.addScaledVector(pd.n, -along);
          if (tv3.length() > PAD_R + 0.3) continue;
          e.vel.addScaledVector(pd.n, -e.vel.dot(pd.n)).addScaledVector(pd.n, PAD_V);
          e.onGround = false;
          e.padT = 0.6;
          e.boostT = 1.1;
          pd.pulse = 1;
          sfx("boost", pd.pos.clone());
          if (e === player) camShake = Math.max(camShake, 0.3);
          break;
        }
      }
    }
    function newMatch() {
      if (world) scene.remove(world);
      world = new T.Group();
      scene.add(world);
      colliders = new BoxGrid(8);
      structMeshes = [];
      charMeshes = [];
      combatants = [];
      bots = [];
      effects = [];
      matchTime = 0;
      targetsDirty = true;
      hurtFlash = 0;
      buildZeroG();
      ZG.state = "float";
      ZG.t = rnd(20, 26);
      ZG.camRoll = 0;
      ZG.flash = 0;
      player = makeCombatant("You", true);
      Object.assign(player, {
        slots: [null, { kind: "gun", id: "ar", r: 3, ammo: WEAP.ar.mag }, { kind: "gun", id: "pump", r: 3, ammo: WEAP.pump.mag }, { kind: "gun", id: "smg", r: 2, ammo: WEAP.smg.mag }, { kind: "cons", id: "big", count: 2 }, { kind: "cons", id: "mini", count: 3 }],
        sel: 1,
        ammo: { light: 150, medium: 240, heavy: 12, shells: 48 },
        fireCd: 0,
        bloom: 0,
        reloading: null,
        consuming: null,
        dmgDealt: 0,
        wantJump: false,
        shield: 50
      });
      zgSpawn(player, 0, ZG.BOTS + 1);
      player.pitch = 0;
      applyPickSkin(player);
      for (let i = 0; i < ZG.BOTS; i++) {
        const b = makeBot(i);
        bots.push(b);
        zgSpawn(b, i + 1, ZG.BOTS + 1);
        armBot(b);
        b.react = rnd(0.14, 0.3);
        b.skill = rnd(0.5, 0.8);
        b.lastPos = b.pos.clone();
      }
      aliveCount = combatants.length;
      buildFlyers();
      buildPads();
      renderMapBase();
    }
    function startMatch() {
      initAudio();
      if (matchUsed) newMatch();
      matchUsed = true;
      $("menu").hidden = true;
      $("over").hidden = true;
      $("pause").hidden = true;
      $("hud").hidden = false;
      $("feed").innerHTML = "";
      state = "play";
      refreshHotbar();
      hudTick();
      banner("Inverted", "", 2.5);
      requestLock();
    }
    function endMatch(win, killer, cause) {
      if (state === "over") return;
      state = "over";
      const place = win ? 1 : aliveCount + 1;
      for (const k in keys) keys[k] = false;
      mouse.l = mouse.r = false;
      ads = false;
      $("overPlace").textContent = "#" + place;
      $("overTitle").textContent = win ? "Victory!" : "Eliminated";
      $("overSub").textContent = win ? "" : killer ? "Eliminated by " + killer.name : cause ? "Hit by a " + cause : "Eliminated";
      $("stElims").textContent = player.kills;
      $("stDmg").textContent = Math.round(player.dmgDealt);
      $("stTime").textContent = fmtTime(matchTime);
      if (win) {
        banner("Victory!", "#1 of " + combatants.length, 4);
        sfx("victory");
      } else sfx("defeat");
      setTimeout(() => {
        if (document.pointerLockElement) document.exitPointerLock();
        $("over").hidden = false;
        $("againBtn").focus();
      }, win ? 1800 : 2800);
    }
    function pauseGame() {
      if (state !== "play") return;
      state = "paused";
      for (const k in keys) keys[k] = false;
      mouse.l = mouse.r = false;
      $("pause").hidden = false;
    }
    function resumeGame() {
      if (state !== "paused") return;
      $("pause").hidden = true;
      state = "play";
      initAudio();
      requestLock();
    }
    function requestLock() {
      wasLocked = false;
      try {
        canvas.focus();
        window.focus();
      } catch (e) {
      }
      try {
        const r = canvas.requestPointerLock();
        if (r && r.catch) r.catch(() => {
          fallbackLook = true;
        });
      } catch (e) {
        fallbackLook = true;
      }
      setTimeout(() => {
        if (state === "play" && !locked) fallbackLook = true;
      }, 900);
    }
    const sensInputs = [$("sens"), $("sens2")];
    try {
      const s = parseFloat(localStorage.getItem("stormIslandSens"));
      if (s > 0) {
        sens = s;
      }
    } catch (e) {
    }
    sensInputs.forEach((inp) => {
      inp.value = sens;
      inp.addEventListener("input", () => {
        sens = parseFloat(inp.value) || 1;
        sensInputs.forEach((o) => {
          if (o !== inp) o.value = sens;
        });
        try {
          localStorage.setItem("stormIslandSens", String(sens));
        } catch (e) {
        }
      });
    });
    const volInputs = [$("vol"), $("vol2")];
    volInputs.forEach((inp) => {
      inp.value = volume;
      inp.addEventListener("input", () => {
        initAudio();
        setVolume(parseFloat(inp.value));
        volInputs.forEach((o) => {
          if (o !== inp) o.value = volume;
        });
      });
      inp.addEventListener("change", () => sfx("ui"));
    });
    addEventListener("pointerdown", () => initAudio());
    addEventListener("click", (ev) => {
      const t = ev.target;
      if (t.closest && t.closest("button")) sfx("ui");
    });
    $("playBtn").addEventListener("click", startMatch);
    $("armoryBtn").addEventListener("click", openArmory);
    $("armBack").addEventListener("click", closeArmory);
    $("armPrev").addEventListener("click", () => armStep(-1));
    $("armNext").addEventListener("click", () => armStep(1));
    addEventListener("keydown", (ev) => {
      if (state !== "armory") return;
      if (ev.key === "ArrowRight") armStep(1);
      else if (ev.key === "ArrowLeft") armStep(-1);
      else if (ev.key === "Escape") closeArmory();
    });
    $("againBtn").addEventListener("click", startMatch);
    $("resumeBtn").addEventListener("click", resumeGame);
    function goHome() {
      if (document.pointerLockElement) document.exitPointerLock();
      state = "menu";
      for (const k in keys) keys[k] = false;
      mouse.l = mouse.r = false;
      ads = false;
      for (const id of ["pause", "over", "hud"]) $(id).hidden = true;
      $("menu").hidden = false;
      $("playBtn").focus();
    }
    $("quitBtn").addEventListener("click", goHome);
    $("homeBtn").addEventListener("click", goHome);
    canvas.addEventListener("click", () => {
      if (state === "play" && !locked && !fallbackLook) requestLock();
    });
    let wasLocked = false;
    document.addEventListener("pointerlockchange", () => {
      locked = document.pointerLockElement === canvas;
      if (locked) {
        wasLocked = true;
        fallbackLook = false;
      } else if (wasLocked && state === "play") pauseGame();
    });
    document.addEventListener("pointerlockerror", () => {
      fallbackLook = true;
      if (state === "play") toast("Mouse lock unavailable");
    });
    const KEY_ALIAS = { ArrowUp: "KeyW", ArrowLeft: "KeyA", ArrowDown: "KeyS", ArrowRight: "KeyD" };
    function keyCode(ev) {
      let c = ev.code || "";
      if (KEY_ALIAS[c]) return KEY_ALIAS[c];
      if (!c || c === "Unidentified") {
        const k = (ev.key || "").toLowerCase();
        if (KEY_ALIAS[ev.key]) return KEY_ALIAS[ev.key];
        if (k === " ") return "Space";
        if (k === "shift") return "ShiftLeft";
        if (k === "escape") return "Escape";
        if (/^[a-z]$/.test(k)) return "Key" + k.toUpperCase();
        if (/^[0-9]$/.test(k)) return "Digit" + k;
      }
      return c;
    }
    document.addEventListener("keydown", (ev) => {
      const c = keyCode(ev), p = player;
      if (["Space", "Tab", "KeyW", "KeyA", "KeyS", "KeyD"].includes(c) && state === "play") ev.preventDefault();
      if (state === "paused" && (c === "Enter" || c === "Space")) {
        resumeGame();
        return;
      }
      if (state !== "play") return;
      keys[c] = true;
      if (ev.repeat) return;
      if (c === "Escape" && fallbackLook) {
        pauseGame();
        return;
      }
      if (c.startsWith("Digit")) {
        const n = +c.slice(5);
        if (n >= 1 && n <= 6) selectSlot(n - 1);
      } else if (c === "Space") p.wantJump = true;
    }, true);
    document.addEventListener("keyup", (ev) => {
      keys[keyCode(ev)] = false;
    }, true);
    addEventListener("blur", () => {
      for (const k in keys) keys[k] = false;
      mouse.l = mouse.r = false;
    });
    canvas.addEventListener("mousedown", (ev) => {
      canvas.focus();
      if (state !== "play") return;
      if (ev.button === 0) {
        mouse.l = true;
        onPrimaryDown();
      } else if (ev.button === 2) mouse.r = true;
    });
    addEventListener("mouseup", (ev) => {
      if (ev.button === 0) mouse.l = false;
      else if (ev.button === 2) mouse.r = false;
    });
    canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());
    addEventListener("mousemove", (ev) => {
      if (state !== "play" || !player || !locked && !fallbackLook) return;
      const it = curItem();
      const s = 22e-4 * sens * (ads ? it && WEAP[it.id].zoom ? 0.3 : 0.6 : 1);
      player.yaw -= (ev.movementX || 0) * s * (ZG.camRoll > Math.PI / 2 ? -1 : 1);
      player.pitch = clamp(player.pitch - (ev.movementY || 0) * s, -1.35, 1.25);
    });
    addEventListener("wheel", (ev) => {
      if (state !== "play" || !player) return;
      selectSlot((player.sel + (ev.deltaY > 0 ? 1 : -1) + 6) % 6);
    }, { passive: true });
    function update(dt) {
      if (player && !player.alive && player.death && player.death.t < 1.6) dt *= 0.4;
      matchTime += dt;
      updateZG(dt);
      updateFlyers(dt);
      updatePads(dt);
      updatePlayerZG(dt);
      updateActions(dt);
      for (const b of bots) updateBotZG(b, dt);
      for (const e of combatants) animateGLB(e, dt);
      updateEffects(dt);
    }
    let lastT = performance.now(), hudAcc = 0, perfStage = 0, perfFrames = 0, perfTime = 0;
    function loop(now) {
      requestAnimationFrame(loop);
      const dt = Math.min(0.15, Math.max(0, (now - lastT) / 1e3));
      lastT = now;
      if (state === "play" || state === "over") {
        const n = Math.ceil(dt / 0.034);
        for (let i = 0; i < n; i++) update(dt / n);
      }
      if (state === "play" && perfStage < 3) {
        perfFrames++;
        perfTime += dt;
        if (perfTime > 4) {
          const f = perfFrames / perfTime;
          perfFrames = 0;
          perfTime = 0;
          if (f >= 45) perfStage = 3;
          else if (perfStage === 0) {
            perfStage = 1;
            renderer.setPixelRatio(1);
            resize();
          } else if (perfStage === 1) {
            perfStage = 2;
            sun.shadow.mapSize.set(1024, 1024);
            if (sun.shadow.map) {
              sun.shadow.map.dispose();
              sun.shadow.map = null;
            }
          } else {
            perfStage = 3;
            if (f < 30) sun.castShadow = false;
          }
        }
      }
      updateCamera(dt);
      updateSun();
      updateAudio(dt);
      if (state !== "menu" && state !== "armory" && player) {
        hudAcc += dt;
        if (hudAcc > 0.1) {
          hudAcc = 0;
          hudTick();
        }
        hudFrame(dt);
        drawMap();
      }
      renderer.render(scene, camera);
    }
    $("playBtn").disabled = true;
    $("playBtn").textContent = "Loading\u2026";
    loadSoldier((ok) => {
      if (!ok) {
        $("err").textContent = "The character model did not load. Reload the page to try again.";
        return;
      }
      newMatch();
      $("playBtn").disabled = false;
      $("playBtn").textContent = "Enter the box";
    });
    requestAnimationFrame(loop);
    window.__game = {
      keys,
      camera,
      sfx: (k, o) => sfx(k, null, o),
      get audioOk() {
        return !!(AC && bus && AMB);
      },
      setCam: (p, l) => {
        camOverride = p ? { pos: new V(...p), look: new V(...l) } : null;
      },
      openArmory,
      setArm: (i) => {
        armIdx = i;
        buildArmory();
      },
      setArmMode,
      setPick: (i) => {
        pxIdx = i;
        buildArmory();
      },
      setSkin: (i) => {
        skIdx = i;
        buildArmory();
      },
      lineup: (ids, yaw) => {
        if (armGroup) scene.remove(armGroup);
        armGroup = new T.Group();
        armGroup.position.set(0, ARM_Y, 0);
        skShown = [];
        ids.forEach((id, k) => {
          const c = standChar(SK.ITEMS[id]);
          c.g.position.x = (k - (ids.length - 1) / 2) * 1.25;
          c.g.userData.o = 0;
          c.g.userData.yaw = yaw;
          armGroup.add(c.g);
          skShown.push(c);
        });
        studioLights(armGroup);
        armGroup.userData.dist = ids.length * 0.75 + 1.6;
        scene.add(armGroup);
      },
      fire: () => playerFire(),
      kill: (e, weapon, info) => eliminate(e, null, weapon, info),
      colliderCount: () => colliders.size,
      get state() {
        return state;
      },
      get player() {
        return player;
      },
      get bots() {
        return bots;
      },
      get alive() {
        return aliveCount;
      },
      get ZG() {
        return ZG;
      },
      startMatch,
      update,
      setState: (s) => state = s
    };
  })();
})();
