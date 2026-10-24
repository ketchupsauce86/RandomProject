(function(){
'use strict';
// $ looks up an element by id (typed loosely: it can be a canvas, an input or a plain element)
const $=(id:string):any=>document.getElementById(id), $q=(sel:string):any=>document.querySelector(sel);
window.addEventListener('error',e=>{ const el=$('err'); if(el) el.textContent='Something broke: '+e.message; });
if(!window.THREE){ $('err').textContent='The 3D engine did not load. Check your internet connection and reload.'; return; }
const T=THREE, V=T.Vector3;

// ================= helpers =================
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const smooth=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
const fmtTime=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
function angLerp(a,b,t){ let d=((b-a+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI; return a+d*t; }

// ================= constants =================
const DIFF={easy:{dmg:0.28,spread:1.7,react:[0.9,1.5],cad:2.6,head:0.04,range:65,cover:0.2},normal:{dmg:0.4,spread:1.15,react:[0.6,1.1],cad:2.0,head:0.08,range:80,cover:0.4},hard:{dmg:0.8,spread:0.5,react:[0.18,0.38],cad:1.15,head:0.24,range:130,cover:0.7}};
// the Zero-G Box: a huge white box (L is half its width, H its height) and 20 bots (see the Zero-G Box section)
const ZG={L:125,H:90,BOTS:100,state:'float',t:0,camRoll:0,flash:0,blocks:[],flyers:[],pads:[],vend:[]};
const diff='hard'; // bots always play on hard
const GRAV=30;
const RAR=[{n:'Common',c:'#a4abb5',m:1},{n:'Uncommon',c:'#55c95f',m:1.05},{n:'Rare',c:'#3fa0f5',m:1.1},{n:'Epic',c:'#b866f5',m:1.16},{n:'Legendary',c:'#f5a83b',m:1.22}];
const WEAP={
  ar:{name:'Assault Rifle',short:'AR',dmg:30,rate:0.16,mag:30,reload:2.2,spread:0.012,bloom:0.035,auto:true,ammo:'medium',range:320,pellets:1,head:1.5,recoil:0.006,pref:24},
  smg:{name:'SMG',short:'SMG',dmg:17,rate:0.075,mag:30,reload:2,spread:0.03,bloom:0.03,auto:true,ammo:'light',range:160,pellets:1,head:1.5,recoil:0.004,pref:12},
  pump:{name:'Pump Shotgun',short:'PUMP',dmg:9.5,rate:0.95,mag:5,reload:4,spread:0.075,bloom:0,auto:false,ammo:'shells',range:45,pellets:10,head:1.6,recoil:0.05,falloff:true,pref:5},
  pistol:{name:'Pistol',short:'PISTOL',dmg:24,rate:0.2,mag:16,reload:1.4,spread:0.015,bloom:0.03,auto:false,ammo:'light',range:180,pellets:1,head:1.8,recoil:0.012,pref:18},
  sniper:{name:'Bolt Sniper',short:'SNIPER',dmg:105,rate:1.6,mag:1,reload:2.4,spread:0.0015,bloom:0,auto:false,ammo:'heavy',range:700,pellets:1,head:2.5,recoil:0.05,zoom:true,pref:55},
  // bought at the vending machines: fires a rocket (see the RPG section) instead of a bullet
  // two golden winged pistols, fired in turn; each shot is a beam of light that bounces off every surface
  mf:{name:'Mirror Fractal Guns',short:'MF GUNS',dmg:24,rate:0.12,mag:1,reload:0,spread:0.004,bloom:0.012,auto:true,ammo:'light',range:400,pellets:1,head:1.5,recoil:0.004,pref:20,beam:true,col:'#ffd23f'},
  rpg:{name:'RPG',short:'RPG',dmg:140,rate:1.4,mag:1,reload:0,spread:0,bloom:0,auto:false,ammo:'heavy',range:400,pellets:1,head:1,recoil:0.07,pref:30,proj:'rocket',col:'#4fd34f'},
  // more vending-machine guns (see the New guns section): sp says which special attack they fire
  frz:{name:'Freeze Ray',short:'FREEZE',dmg:5,rate:0.08,mag:1,reload:0,spread:0,bloom:0,auto:true,ammo:'light',range:55,pellets:1,head:1.3,recoil:0.0012,pref:20,col:'#7fe3ff',sp:'frz'},
  tsr:{name:'Taser',short:'TASER',dmg:20,rate:0.8,mag:1,reload:0,spread:0,bloom:0,auto:false,ammo:'light',range:30,pellets:1,head:1.3,recoil:0.03,pref:14,col:'#ffe14a',sp:'tsr'},
  flm:{name:'Flamethrower',short:'FLAMES',dmg:3,rate:0.06,mag:1,reload:0,spread:0,bloom:0,auto:true,ammo:'light',range:17,pellets:1,head:1,recoil:0.001,pref:10,col:'#ff7a1a',sp:'flm'},
  pb:{name:'Paintball Gun',short:'PAINT',dmg:12,rate:0.11,mag:1,reload:0,spread:0.014,bloom:0,auto:true,ammo:'light',range:200,pellets:1,head:1.6,recoil:0.004,pref:22,col:'#ff3fa4',sp:'pb'},
  drone:{name:'Robot Drone',short:'DRONE',dmg:11,rate:0.3,mag:1,reload:0,spread:0,bloom:0,auto:false,ammo:'light',range:90,pellets:1,head:1.5,recoil:0,pref:30,col:'#ff5a3c',sp:'drone'},
};
const CONS={
  mini:{name:'Small Shield',short:'MINI',time:2,shield:25,cap:50,stack:6,give:3,color:'#7cc8ff'},
  big:{name:'Shield Potion',short:'BIG POT',time:4,shield:50,cap:100,stack:3,give:1,color:'#3d7bff'},
};
const NAMES=['Pixel_Pete','OrbitOllie','JoltJess','NovaNate','FlipFiona','HoverHugo','LoopLarry','SpinSally','ZipZane','BounceBea','DashDev','GlideGwen','TwirlTom','VoidVic','SkySkye','PogoPaul','RicoRay','TumbleTess','QuasarQuin','DizzyDee','WobbleWes','ComboCleo','StaticStan','FuzzFelix','RocketRue','PingPia','BlinkBo','SlingSid','KiteKira','MothMilo','DriftDot','NoScopeNora','LlamaDrama','FloatBot9000','SweatyTaco','CrankKing','DriftRat','ShieldSipper','GravGus','CeilingChaser','TiltedTina','ZeroGoblin','BoxFighter','DustyDan','BananaBro','CornerCarl','BlockBrenda','HeadshotHank','WarpWendy'];
// ================= renderer & scene =================
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();
scene.fog=new T.Fog(0xe6e8ec,70,330); renderer.setClearColor(0xe6e8ec);
const camera=new T.PerspectiveCamera(72,1,0.1,2600);
function resize(){ renderer.setSize(innerWidth,innerHeight); camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize',resize); resize();

// a clean white studio light inside the box
const hemi=new T.HemisphereLight(0xffffff,0xb9bec6,0.95); scene.add(hemi);
const sun=new T.DirectionalLight(0xffffff,0.55);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-70,right:70,top:70,bottom:-70,near:10,far:420});
sun.shadow.bias=-0.0008; scene.add(sun); scene.add(sun.target);
const SUN_DIR=new V(0.5,1,0.35).normalize();

// ================= textures, materials, geometry =================
function canvasTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new T.CanvasTexture(c); t.anisotropy=4; return t; }
const Lam=(o)=>new T.MeshLambertMaterial(o);

const colorMats=new Map();
function colorMat(c){ if(!colorMats.has(c)) colorMats.set(c,Lam({color:c})); return colorMats.get(c); }
const GEO={
  handle:new T.CylinderGeometry(0.04,0.04,0.95,6), pickHead:new T.BoxGeometry(0.7,0.1,0.1),
  puff:new T.SphereGeometry(0.22,6,4), shell:new T.BoxGeometry(0.04,0.04,0.1),
};

// ================= glow textures, gun & item models =================
const glowTex=canvasTex(64,64,(g)=>{ const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.25,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64); });
const beamTex=canvasTex(8,64,(g)=>{ const gr=g.createLinearGradient(0,64,0,0); gr.addColorStop(0,'rgba(255,255,255,.95)'); gr.addColorStop(0.5,'rgba(255,255,255,.3)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,8,64); });
const ringTex=canvasTex(128,128,(g)=>{ const gr=g.createRadialGradient(64,64,30,64,64,62); gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(0.55,'rgba(255,255,255,.95)'); gr.addColorStop(0.7,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128); });
const sparkTex=canvasTex(32,32,(g)=>{ g.fillStyle='#fff'; g.beginPath(); g.moveTo(16,0); g.quadraticCurveTo(18,14,32,16); g.quadraticCurveTo(18,18,16,32); g.quadraticCurveTo(14,18,0,16); g.quadraticCurveTo(14,14,16,0); g.fill(); });
const flashMat=new T.SpriteMaterial({map:glowTex,color:0xffc45a,blending:T.AdditiveBlending,depthWrite:false,transparent:true,fog:false});
const BX=(w,h,d)=>new T.BoxGeometry(w,h,d);
// ---- guns: realistic models. Receivers, grips, stocks and magazines are side profiles [z,y] extruded to their
// width; barrels, tubes and optics are turned parts. Every part of one material is merged into one mesh.
const GPh=(c,s,sp?)=>new T.MeshPhongMaterial({color:c,shininess:s,specular:sp==null?0x2a2a2a:sp});
const GUN_MAT={poly:GPh(0x1e1f22,12,0x161616),steel:GPh(0x2f3237,60,0x4a4a4a),dark:GPh(0x151618,35),bare:GPh(0x8a8f96,90,0x888888),wood:GPh(0x6e4325,18),
  glass:new T.MeshPhongMaterial({color:0x10202e,specular:0xffffff,shininess:140,emissive:0x081420}),dot:new T.MeshBasicMaterial({color:0xff2a2a}),
  green:GPh(0x4f9e2c,45,0x3a5a3a),olive:GPh(0x2c5a1c,30), // green and olive: the RPG's warhead
  gold:GPh(0xd9a72e,120,0xfff2b0),wing:new T.MeshPhongMaterial({color:0xffd75a,emissive:0x8a5a00,shininess:140,specular:0xffffff,side:T.DoubleSide}), // the Mirror Fractal Guns
  ice:new T.MeshPhongMaterial({color:0x9fe8ff,emissive:0x1f6f95,specular:0xffffff,shininess:150,transparent:true,opacity:0.85}),frost:GPh(0xe9eef4,70,0x9ab0c0), // Freeze Ray
  volt:GPh(0xf2c418,55,0x8a7a30),cyan:new T.MeshBasicMaterial({color:0x8fe3ff}), // Taser
  tank:GPh(0xc8321e,80,0x997070),brass:GPh(0xb08a3c,90,0xffe0a0), // Flamethrower
  white:GPh(0xf2f4f7,50,0x8a8a8a),red:new T.MeshBasicMaterial({color:0xff3b30}), // the drone's remote
  pbody:GPh(0xff2f8f,70,0xffb0d8),balls:GPh(0xffe23a,60,0xffffff), // Paintball Gun: the body and the paintballs in the hopper
  hopper:new T.MeshPhongMaterial({color:0x9fe0ff,specular:0xffffff,shininess:120,transparent:true,opacity:0.4,depthWrite:false})};
// rarity shows as the cerakote finish on the furniture: black, olive drab, slate blue, plum, gold
const FURN=[GPh(0x26272a,14),GPh(0x4b5337,14),GPh(0x3b4e66,24),GPh(0x4f3b66,24),GPh(0xc9a23a,90,0xfff0b0)];
function prof(pts,w,bev?){
  const s=new T.Shape(); s.moveTo(pts[0][0],pts[0][1]);
  for(let i=1;i<pts.length;i++){ const p=pts[i]; if(p.length===4) s.quadraticCurveTo(p[0],p[1],p[2],p[3]); else s.lineTo(p[0],p[1]); }
  const b=bev==null?0.005:bev, d=Math.max(0.002,w-2*b);
  return new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:8}).translate(0,0,-d/2).rotateY(-Math.PI/2);
}
const gtube=(r1,r2,l,s?,flat?)=>{ const g=new T.CylinderGeometry(r1,r2,l,s||14); if(flat) g.rotateY(Math.PI/s); return g.rotateX(Math.PI/2); }; // r1 at the back (+z)
const ribs=(n,z0,dz,y,w?)=>Array.from({length:n},(_,i)=>[BX(w||0.05,0.008,0.012),'dark',0,y,z0-i*dz]);
const GUARD=(z0,z1,y)=>[[BX(0.012,0.008,z0-z1),'dark',0,y,(z0+z1)/2],[BX(0.012,0.03,0.008),'dark',0,y+0.015,z1],[BX(0.006,0.03,0.008),'dark',0,y+0.02,(z0+z1)/2+0.005]];
const REDDOT=(y,z)=>[[BX(0.036,0.04,0.06),'dark',0,y,z],[gtube(0.015,0.015,0.004),'glass',0,y+0.004,z-0.031],[BX(0.004,0.004,0.002),'dot',0,y+0.004,z+0.02]];
const GUN_PARTS={
  ar:()=>[ // M4-style carbine
    [prof([[0.2,-0.015],[0.2,0.06],[-0.12,0.06],[-0.12,-0.015]],0.062),'steel',0,0,0],[BX(0.004,0.028,0.1),'dark',0.032,0.022,0.05],[BX(0.05,0.012,0.03),'dark',0,0.052,0.21],
    [prof([[0.17,-0.015],[0.17,-0.07],[0.12,-0.085],[0.02,-0.085],[0,-0.07],[-0.1,-0.07],[-0.11,-0.015]],0.058),'steel',0,0,0],
    [prof([[-0.005,-0.07],[-0.085,-0.07],[-0.095,-0.2,-0.14,-0.31],[-0.07,-0.33],[-0.02,-0.2,-0.005,-0.07]],0.05),'poly',0,0,0],
    [prof([[0.13,-0.07],[0.075,-0.07],[0.105,-0.24],[0.16,-0.25],[0.17,-0.23]],0.045),'poly',0,0,0],...GUARD(0.07,-0.005,-0.1),
    [BX(0.045,0.018,0.66),'dark',0,0.068,-0.15],...ribs(22,0.17,0.03,0.08),
    [gtube(0.043,0.043,0.36,8,true),'furn',0,0.014,-0.3],[BX(0.012,0.012,0.3),'dark',0.047,0.014,-0.3],[BX(0.012,0.012,0.3),'dark',-0.047,0.014,-0.3],[BX(0.02,0.012,0.3),'dark',0,-0.032,-0.3],
    [gtube(0.048,0.048,0.02,16),'dark',0,0.014,-0.11],[gtube(0.013,0.013,0.15,12),'steel',0,0.014,-0.555],
    [prof([[-0.47,0],[-0.47,0.03],[-0.48,0.1],[-0.495,0.1],[-0.51,0.03],[-0.51,0]],0.024,0.003),'dark',0,0,0],[gtube(0.02,0.02,0.06,10),'dark',0,0.014,-0.64],
    [gtube(0.021,0.021,0.22,12),'steel',0,0.026,0.31],[prof([[0.28,0.055],[0.5,0.062],[0.52,0.05],[0.52,-0.1],[0.49,-0.105],[0.4,-0.03],[0.28,-0.005]],0.05),'furn',0,0,0],
    [BX(0.054,0.165,0.02),'dark',0,-0.02,0.53],[BX(0.03,0.03,0.035),'dark',0,0.094,0.15]],
  smg:()=>[ // MP5-style
    [gtube(0.035,0.035,0.42,14),'steel',0,0.022,-0.01],[BX(0.04,0.014,0.34),'dark',0,0.06,0],...ribs(11,0.15,0.03,0.07,0.044),
    [prof([[0.14,-0.005],[0.14,-0.05],[0.02,-0.05],[-0.03,-0.02],[-0.03,-0.005]],0.05),'poly',0,0,0],[prof([[0.13,-0.05],[0.08,-0.05],[0.1,-0.2],[0.15,-0.21],[0.16,-0.19]],0.045),'poly',0,0,0],
    ...GUARD(0.07,0.005,-0.075),[prof([[-0.04,-0.01],[-0.1,-0.01],[-0.12,-0.15,-0.16,-0.27],[-0.12,-0.29],[-0.07,-0.15,-0.04,-0.01]],0.03),'dark',0,0,0],
    [gtube(0.042,0.036,0.17,12),'furn',0,0.006,-0.16],[gtube(0.012,0.012,0.2,10),'steel',0,0.022,-0.33],[gtube(0.018,0.018,0.05,10),'dark',0,0.022,-0.445],
    [gtube(0.02,0.02,0.03,12),'dark',0,0.075,-0.2],[gtube(0.018,0.018,0.03,12),'dark',0,0.075,0.17],
    [gtube(0.006,0.006,0.22,6),'steel',0.026,0.03,0.3],[gtube(0.006,0.006,0.22,6),'steel',-0.026,0.03,0.3],[prof([[0.4,0.05],[0.43,0.05],[0.43,-0.08],[0.4,-0.08]],0.06),'poly',0,0,0]],
  pump:()=>[ // 870-style pump shotgun
    [prof([[0.2,-0.04],[0.2,0.05],[-0.1,0.05],[-0.12,0.03],[-0.12,-0.04]],0.06),'steel',0,0,0],[BX(0.004,0.03,0.08),'dark',0.031,0.015,0.04],
    [prof([[0.16,-0.04],[0.16,-0.06],[0.0,-0.06],[-0.02,-0.04]],0.04),'dark',0,0,0],...GUARD(0.13,0.05,-0.075),
    [gtube(0.02,0.02,0.64,14),'steel',0,0.025,-0.42],[BX(0.012,0.008,0.6),'dark',0,0.049,-0.42],[new T.SphereGeometry(0.006,8,6),'bare',0,0.057,-0.72],
    [gtube(0.017,0.017,0.5,12),'steel',0,-0.02,-0.35],[gtube(0.019,0.019,0.03,12),'dark',0,-0.02,-0.615],
    [gtube(0.036,0.036,0.2,14),'pump',0,-0.012,-0.38],...Array.from({length:6},(_,i)=>[gtube(0.038,0.038,0.01,14),'pump',0,-0.012,-0.46+i*0.03]),
    [prof([[0.2,0.04],[0.23,0.045],[0.52,0.0],[0.535,-0.02],[0.535,-0.135],[0.49,-0.135],[0.28,-0.08],[0.21,-0.07,0.2,-0.04]],0.05),'stock',0,0,0],[BX(0.054,0.14,0.022),'dark',0,-0.067,0.545]],
  pistol:()=>[ // Glock-style
    [prof([[0.08,0],[0.08,0.075],[-0.24,0.075],[-0.25,0.065],[-0.25,0]],0.05,0.004),'steel',0,0,0],...Array.from({length:5},(_,i)=>[BX(0.054,0.04,0.004),'dark',0,0.045,0.035+i*0.01]),
    [prof([[0.07,-0.005],[0.07,0.005],[-0.24,0.005],[-0.24,-0.025],[-0.04,-0.03],[-0.03,-0.02]],0.046),'poly',0,0,0],
    [prof([[0.085,0.0],[0.0,-0.02],[0.03,-0.18],[0.1,-0.18],[0.1,-0.03]],0.045),'poly',0,0,0],...GUARD(0.0,-0.06,-0.065),
    [BX(0.03,0.012,0.012),'dark',0,0.082,0.07],[BX(0.006,0.012,0.008),'dark',0,0.082,-0.23],[gtube(0.011,0.011,0.012,10),'dark',0,0.045,-0.25]],
  sniper:()=>[ // bolt-action precision rifle
    [gtube(0.032,0.032,0.32,14),'steel',0,0.02,0],[BX(0.07,0.01,0.01),'bare',0.05,0.02,0.12],[new T.SphereGeometry(0.014,10,8),'dark',0.09,0.02,0.12],
    [gtube(0.024,0.016,0.78,14),'steel',0,0.02,-0.55],[gtube(0.026,0.026,0.12,10),'dark',0,0.02,-1.0],[BX(0.056,0.012,0.03),'dark',0,0.02,-0.98],
    [prof([[-0.5,-0.005],[0.18,-0.005],[0.3,0.04],[0.6,0.045],[0.62,0.03],[0.62,-0.13],[0.58,-0.14],[0.38,-0.07],[0.24,-0.07],[0.21,-0.2],[0.14,-0.2],[0.12,-0.07],[-0.45,-0.065],[-0.5,-0.04]],0.07),'furn',0,0,0],
    ...GUARD(0.11,0.03,-0.085),[BX(0.04,0.06,0.09),'dark',0,-0.09,-0.02],
    [gtube(0.02,0.02,0.3,14),'dark',0,0.12,0],[gtube(0.02,0.034,0.08,16),'dark',0,0.12,-0.19],[gtube(0.034,0.034,0.06,16),'dark',0,0.12,-0.26],[gtube(0.031,0.031,0.004,16),'glass',0,0.12,-0.291],
    [gtube(0.03,0.02,0.06,14),'dark',0,0.12,0.18],[new T.CylinderGeometry(0.014,0.014,0.03,10),'dark',0,0.15,0],[new T.CylinderGeometry(0.012,0.012,0.03,10).rotateZ(Math.PI/2),'dark',0.03,0.12,0],
    [gtube(0.024,0.024,0.02,14),'steel',0,0.12,-0.08],[gtube(0.024,0.024,0.02,14),'steel',0,0.12,0.08],[BX(0.02,0.07,0.02),'steel',0,0.075,-0.08],[BX(0.02,0.07,0.02),'steel',0,0.075,0.08]],
  mf:()=>{ // two gold pistols side by side (the left one 0.3 m over), each with a golden wing on both sides of the slide
    const W=[[-0.2,0.07],[-0.05,0.075],[0.03,0.1,0.1,0.17],[0.16,0.26],[0.11,0.215],[0.13,0.27],[0.07,0.205],[0.08,0.25],[0.01,0.18],[0.01,0.215],[-0.06,0.15],[-0.07,0.17],[-0.13,0.11]];
    const one=x=>[...GUN_PARTS.pistol().map(q=>{ const r=[...q]; r[1]=r[1]==='steel'?'gold':r[1]==='poly'?'dark':r[1]; r[2]+=x; return r; }),
      [prof(W,0.006,0.002),'wing',x+0.034,0,0],[prof(W,0.006,0.002),'wing',x-0.034,0,0]];
    return [...one(0),...one(-0.3)]; },
  rpg:()=>[ // RPG-7 style: black tube with a flared blast cone, two grips and a side optic; the green warhead sits in the muzzle
    [gtube(0.036,0.036,0.92,16),'poly',0,0.06,0.04],[gtube(0.075,0.042,0.2,18),'poly',0,0.06,0.6],[gtube(0.078,0.078,0.014,18),'dark',0,0.06,0.7],
    [gtube(0.048,0.048,0.26,14),'dark',0,0.06,-0.02],...Array.from({length:5},(_,i)=>[gtube(0.05,0.05,0.008,14),'poly',0,0.06,-0.13+i*0.055]),
    [gtube(0.045,0.045,0.04,14),'dark',0,0.06,-0.4],[gtube(0.04,0.04,0.03,14),'dark',0,0.06,0.48],
    [prof([[0.17,0.03],[0.11,0.03],[0.125,-0.14],[0.185,-0.155],[0.2,-0.135]],0.042),'poly',0,0,0],...GUARD(0.105,0.035,-0.005),
    [prof([[-0.06,0.03],[-0.11,0.03],[-0.105,-0.11],[-0.055,-0.11]],0.036),'poly',0,0,0],
    [BX(0.03,0.05,0.13),'dark',-0.068,0.115,0.13],[BX(0.04,0.012,0.04),'dark',-0.045,0.09,0.13],[gtube(0.018,0.018,0.04,12),'dark',-0.068,0.125,0.21],[gtube(0.016,0.016,0.004,12),'glass',-0.068,0.125,0.064],
    [BX(0.008,0.035,0.01),'dark',0,0.11,-0.36],[BX(0.03,0.03,0.01),'dark',0,0.105,0.0],
    [gtube(0.05,0.05,0.14,18),'green',0,0.06,-0.5],[gtube(0.05,0.02,0.15,18),'green',0,0.06,-0.645],[gtube(0.02,0.007,0.05,12),'olive',0,0.06,-0.745],
    [gtube(0.052,0.052,0.014,18),'olive',0,0.06,-0.455],[gtube(0.03,0.05,0.04,14),'olive',0,0.06,-0.415]],
  frz:()=>[ // Freeze Ray: white body, a glowing coolant canister on top, frost coils round the barrel and a flared emitter dish
    [prof([[0.18,-0.012],[0.18,0.062],[0.02,0.075],[-0.13,0.07],[-0.17,0.045],[-0.17,-0.012]],0.07),'frost',0,0,0],[BX(0.074,0.012,0.3),'dark',0,0.028,0.0],
    [prof([[0.13,-0.012],[0.075,-0.012],[0.105,-0.2],[0.16,-0.21],[0.17,-0.19]],0.046),'poly',0,0,0],...GUARD(0.07,0.0,-0.05),
    [prof([[-0.07,-0.012],[-0.12,-0.012],[-0.112,-0.13],[-0.08,-0.13]],0.036),'poly',0,0,0],
    [prof([[0.18,0.05],[0.42,0.045],[0.44,0.025],[0.44,-0.09],[0.41,-0.1],[0.3,-0.03],[0.18,-0.012]],0.05),'frost',0,0,0],[BX(0.054,0.12,0.02),'dark',0,-0.025,0.45],
    [gtube(0.032,0.026,0.26,14),'steel',0,0.03,-0.28],...[0,1,2,3].map(i=>[gtube(0.046,0.046,0.014,18),'ice',0,0.03,-0.2-i*0.045]),
    [gtube(0.028,0.06,0.05,18),'frost',0,0.03,-0.43],[gtube(0.05,0.05,0.006,18),'ice',0,0.03,-0.456],
    [gtube(0.028,0.028,0.17,12),'ice',0,0.115,0.02],[gtube(0.032,0.032,0.02,12),'steel',0,0.115,0.115],[gtube(0.032,0.032,0.02,12),'steel',0,0.115,-0.075],
    [BX(0.012,0.04,0.012),'steel',0,0.085,0.07],[BX(0.012,0.04,0.012),'steel',0,0.085,-0.03]],
  tsr:()=>[ // Taser: a chunky yellow pistol with a black cartridge on the front and two blue prongs
    ...GUN_PARTS.pistol().map(q=>{ const r=[...q]; r[1]=r[1]==='steel'?'volt':r[1]==='poly'?'dark':r[1]; return r; }),
    [BX(0.06,0.07,0.07),'dark',0,0.035,-0.28],[BX(0.064,0.012,0.074),'volt',0,0.075,-0.28],
    [BX(0.008,0.008,0.012),'cyan',0.016,0.05,-0.32],[BX(0.008,0.008,0.012),'cyan',-0.016,0.05,-0.32],[BX(0.008,0.008,0.012),'cyan',0.016,0.018,-0.32],[BX(0.008,0.008,0.012),'cyan',-0.016,0.018,-0.32]],
  flm:()=>[ // Flamethrower: a long steel wand under a ribbed heat shield, twin red fuel tanks on top, a pilot light at the nozzle
    [gtube(0.03,0.03,0.72,14),'steel',0,0.02,-0.16],[gtube(0.036,0.05,0.09,16),'dark',0,0.02,-0.56],[gtube(0.05,0.05,0.008,16),'brass',0,0.02,-0.607],
    [gtube(0.05,0.05,0.3,10,true),'dark',0,0.02,-0.33],...Array.from({length:6},(_,i)=>[gtube(0.054,0.054,0.01,10,true),'steel',0,0.02,-0.21-i*0.048]),
    [gtube(0.008,0.008,0.18,8),'brass',0,-0.04,-0.5],[prof([[0.2,-0.01],[0.2,0.06],[-0.02,0.06],[-0.04,-0.01]],0.064),'steel',0,0,0],
    [prof([[0.13,-0.01],[0.075,-0.01],[0.105,-0.2],[0.16,-0.21],[0.17,-0.19]],0.046),'poly',0,0,0],...GUARD(0.07,0.0,-0.05),
    [prof([[-0.17,-0.03],[-0.22,-0.03],[-0.215,-0.17],[-0.175,-0.17]],0.04),'poly',0,0,0],
    [gtube(0.045,0.045,0.34,16),'tank',0.05,0.12,0.04],[gtube(0.045,0.045,0.34,16),'tank',-0.05,0.12,0.04],
    [new T.SphereGeometry(0.045,14,10),'tank',0.05,0.12,0.21],[new T.SphereGeometry(0.045,14,10),'tank',-0.05,0.12,0.21],[new T.SphereGeometry(0.045,14,10),'tank',0.05,0.12,-0.13],[new T.SphereGeometry(0.045,14,10),'tank',-0.05,0.12,-0.13],
    [gtube(0.016,0.016,0.03,10),'brass',0.05,0.12,-0.185],[gtube(0.016,0.016,0.03,10),'brass',-0.05,0.12,-0.185],[BX(0.15,0.012,0.02),'dark',0,0.07,0.12],[BX(0.15,0.012,0.02),'dark',0,0.07,-0.06],
    [new T.TorusGeometry(0.03,0.007,6,14,Math.PI*1.4).rotateY(Math.PI/2),'brass',0,0.09,-0.23],
    [prof([[0.2,0.05],[0.4,0.035],[0.42,0.015],[0.42,-0.08],[0.39,-0.09],[0.3,-0.03],[0.2,-0.01]],0.05),'dark',0,0,0]],
  pb:()=>[ // Paintball Gun: a pink marker with a long steel barrel, a clear hopper of paintballs on top and a silver air tank for a stock
    [prof([[0.16,-0.01],[0.16,0.06],[-0.12,0.06],[-0.14,0.035],[-0.14,-0.01]],0.056),'pbody',0,0,0],[BX(0.06,0.01,0.26),'dark',0,0.025,0.01],
    [prof([[0.13,-0.01],[0.075,-0.01],[0.105,-0.2],[0.16,-0.21],[0.17,-0.19]],0.046),'poly',0,0,0],...GUARD(0.07,0.0,-0.05),
    [prof([[-0.06,-0.01],[-0.1,-0.01],[-0.095,-0.12],[-0.065,-0.12]],0.034),'poly',0,0,0],
    [gtube(0.024,0.022,0.42,14),'steel',0,0.035,-0.35],[gtube(0.03,0.03,0.022,14),'pbody',0,0.035,-0.55],[gtube(0.029,0.029,0.016,14),'dark',0,0.035,-0.15],
    [new T.CylinderGeometry(0.022,0.026,0.07,12),'pbody',0,0.09,-0.02],[new T.SphereGeometry(0.075,16,12).scale(0.9,0.8,1.3),'hopper',0,0.17,0.0],
    ...[[0,0.14,0.03],[0.025,0.15,-0.04],[-0.025,0.15,0.01],[0.02,0.19,0.05],[-0.02,0.19,-0.03],[0,0.2,0.0],[0,0.15,-0.08]].map(([x,y,z])=>[new T.SphereGeometry(0.021,10,8),'balls',x,y,z]),
    [gtube(0.024,0.024,0.04,12),'dark',0,0.0,0.18],[gtube(0.042,0.042,0.22,16),'bare',0,0.0,0.31],[new T.SphereGeometry(0.042,16,10).scale(1,1,0.6),'bare',0,0.0,0.42]],
  drone:()=>[ // the drone's remote: a white controller with two sticks, a little screen and an antenna with a red light
    [BX(0.17,0.04,0.1),'white',0,0,0.02],[BX(0.05,0.04,0.07),'white',0.075,-0.01,0.06],[BX(0.05,0.04,0.07),'white',-0.075,-0.01,0.06],
    [new T.CylinderGeometry(0.012,0.016,0.03,10),'dark',0.045,0.032,0.03],[new T.CylinderGeometry(0.012,0.016,0.03,10),'dark',-0.045,0.032,0.03],
    [new T.CylinderGeometry(0.018,0.018,0.006,12),'dark',0.045,0.048,0.03],[new T.CylinderGeometry(0.018,0.018,0.006,12),'dark',-0.045,0.048,0.03],
    [BX(0.06,0.004,0.035),'glass',0,0.022,0.0],[BX(0.012,0.006,0.012),'red',0,0.022,0.045],
    [new T.CylinderGeometry(0.004,0.005,0.2,6),'steel',0.07,0.1,-0.02],[new T.SphereGeometry(0.012,8,6),'red',0.07,0.2,-0.02]],
};
// muzzle [y, z] per gun
const MUZZLE={ar:[0.014,-0.67],smg:[0.022,-0.47],pump:[0.025,-0.74],pistol:[0.045,-0.26],sniper:[0.02,-1.06],rpg:[0.06,-0.42],mf:[0.045,-0.26],frz:[0.03,-0.46],tsr:[0.035,-0.33],flm:[0.02,-0.62],pb:[0.035,-0.57],drone:[0.03,-0.05]};
// attachments unlocked at higher rarities: [minimum rarity, ...parts]; SUPP moves the muzzle out past a suppressor
const EXTRA={
  ar:[[2,...REDDOT(0.1,0.02)],[3,[prof([[-0.34,-0.04],[-0.38,-0.04],[-0.375,-0.13],[-0.345,-0.13]],0.03),'poly',0,0,0]],[4,[gtube(0.026,0.026,0.18,16),'dark',0,0.014,-0.76]]],
  smg:[[2,...REDDOT(0.09,0.02)],[3,[prof([[-0.13,-0.03],[-0.17,-0.03],[-0.165,-0.12],[-0.135,-0.12]],0.03),'poly',0,0,0]],[4,[gtube(0.024,0.024,0.16,16),'dark',0,0.022,-0.55]]],
  pump:[[2,[BX(0.006,0.045,0.1),'dark',0.034,-0.005,0.08],...[0.05,0.07,0.09,0.11].map(z=>[new T.CylinderGeometry(0.009,0.009,0.04,8),'shell',0.04,-0.005,z])],[3,[BX(0.03,0.03,0.02),'dark',0,0.065,0.16]],[4,...REDDOT(0.075,0.05)]],
  pistol:[[2,[BX(0.035,0.03,0.06),'dark',0,-0.03,-0.19],[gtube(0.012,0.012,0.004,10),'glass',0,-0.03,-0.221]],[3,...REDDOT(0.095,0.0)],[4,[BX(0.05,0.07,0.035),'steel',0,0.04,-0.27]]],
  sniper:[[2,[BX(0.012,0.012,0.2),'steel',0.02,-0.08,-0.38],[BX(0.012,0.012,0.2),'steel',-0.02,-0.08,-0.38]],[4,[gtube(0.032,0.032,0.2,16),'dark',0,0.02,-1.16]]],
  rpg:[], mf:[], frz:[], tsr:[], flm:[], pb:[], drone:[],
};
const SUPP={ar:[4,-0.18],smg:[4,-0.16],pistol:[4,-0.03],sniper:[4,-0.2]};
const SHELL_MAT=GPh(0xb3262b,30);
function partMat(mk,r){ return mk==='furn'||mk==='pump'?FURN[r]:mk==='stock'?(r<2?GUN_MAT.wood:FURN[r]):mk==='shell'?SHELL_MAT:GUN_MAT[mk]; }
const gunGeoCache={};
function mergeParts(parts){ // parts of one material -> one BufferGeometry
  const pos=[], nor=[], uv=[], m=new T.Matrix4(), q=new T.Quaternion(), e=new T.Euler(), one=new T.Vector3(1,1,1);
  for(const [geo,,x,y,z,rx] of parts){ e.set(rx||0,0,0); m.compose(new T.Vector3(x,y,z),q.setFromEuler(e),one);
    const g=(geo.index?geo.toNonIndexed():geo.clone()).applyMatrix4(m);
    pos.push(...g.attributes.position.array); nor.push(...g.attributes.normal.array); if(g.attributes.uv) uv.push(...g.attributes.uv.array); else uv.push(...new Array(g.attributes.position.count*2).fill(0)); g.dispose(); }
  const out=new T.BufferGeometry(); out.setAttribute('position',new T.Float32BufferAttribute(pos,3)); out.setAttribute('normal',new T.Float32BufferAttribute(nor,3)); out.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  out.computeBoundingSphere(); return out;
}
function makeGunModel(id,r){
  const key=id+r;
  if(!gunGeoCache[key]){ const parts=GUN_PARTS[id](); for(const [minR,...ps] of EXTRA[id]) if(r>=minR) parts.push(...ps);
    const by={}; for(const p of parts){ if(p[1]==='pump'){ p[4]+=0.38; } (by[p[1]]=by[p[1]]||[]).push(p); }
    gunGeoCache[key]=Object.keys(by).map(mk=>[mk,mergeParts(by[mk])]); }
  const g=new T.Group();
  for(const [mk,geo] of gunGeoCache[key]){ const m=new T.Mesh(geo,partMat(mk,r)); m.castShadow=true;
    if(mk==='pump'){ m.position.z=-0.38; g.userData.pump=m; } if(mk==='wing') g.userData.wings=(g.userData.wings||[]).concat(m); if(mk==='green'||mk==='olive') (g.userData.warhead=g.userData.warhead||[]).push(m); g.add(m); }
  const s=SUPP[id], mz=new T.Object3D(); mz.position.set(0,MUZZLE[id][0],MUZZLE[id][1]+(s&&r>=s[0]?s[1]:0)); g.add(mz); g.userData.muzzle=mz;
  if(id==='mf'){ // a second muzzle on the left gun, and a golden aura with sparkles round both
    const mz2=new T.Object3D(); mz2.position.set(-0.3,MUZZLE.mf[0],MUZZLE.mf[1]); g.add(mz2); g.userData.muzzles=[mz,mz2]; g.userData.sparks=[];
    for(const x of [0,-0.3]){ const h=new T.Sprite(mfAuraMat); h.position.set(x,0.03,-0.08); h.scale.setScalar(0.55); g.add(h);
      for(let i=0;i<5;i++){ const sp=new T.Sprite(mfSparkMat); sp.scale.setScalar(0.05); sp.userData.o=[x,i/5*TAU,0.13+0.04*(i%2)]; g.add(sp); g.userData.sparks.push(sp); } } }
  // the Freeze Ray's canister and dish glow; the Flamethrower has a little blue pilot flame; the remote's light blinks
  const glow=(col,x,y,z,s)=>{ const h=new T.Sprite(auraMats(col).halo); h.position.set(x,y,z); h.scale.setScalar(s); g.add(h); return h; };
  if(id==='frz'){ glow(0x7fe3ff,0,0.115,0.02,0.28); g.userData.pilot=glow(0x7fe3ff,0,0.03,-0.47,0.16); }
  if(id==='flm') g.userData.pilot=glow(0x4aa8ff,0,-0.04,-0.6,0.12);
  if(id==='tsr') g.userData.pilot=glow(0x8fe3ff,0,0.035,-0.33,0.1);
  if(id==='drone') g.userData.pilot=glow(0xff3b30,0.07,0.2,-0.02,0.08);
  return g;
}
const mfAuraMat=new T.SpriteMaterial({map:glowTex,color:0xffc93a,transparent:true,opacity:0.32,depthWrite:false});
const mfSparkMat=new T.SpriteMaterial({map:sparkTex,color:0xffb000,transparent:true,depthWrite:false});
const consGeo:Record<string,any>={};
function makeConsModel(id){
  const g=new T.Group(), add=(geo,col,x?,y?,z?,rz?)=>{ const m=new T.Mesh(geo,typeof col==='number'?colorMat(col):col); m.position.set(x||0,y||0,z||0); if(rz) m.rotation.z=rz; m.castShadow=true; g.add(m); return m; };
  if(!consGeo.neck){ Object.assign(consGeo,{flaskS:new T.SphereGeometry(0.16,14,10),flaskB:new T.SphereGeometry(0.23,14,10),neck:new T.CylinderGeometry(0.06,0.06,0.14,10),cork:new T.CylinderGeometry(0.07,0.07,0.06,10)}); }
  { const big=id==='big', liquid=Lam({color:CONS[id].color,emissive:new T.Color(CONS[id].color).multiplyScalar(0.5)});
    add(big?consGeo.flaskB:consGeo.flaskS,liquid); add(consGeo.neck,0xdfefff,0,big?0.27:0.2,0); add(consGeo.cork,0x8a5a32,0,big?0.36:0.29,0); }
  return g;
}
const auraCache=new Map();
function auraMats(col){
  if(auraCache.has(col)) return auraCache.get(col); const c=new T.Color(col);
  const o={halo:new T.SpriteMaterial({map:glowTex,color:c,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0.8,fog:false}),
    spark:new T.SpriteMaterial({map:sparkTex,color:c.clone().lerp(new T.Color(0xffffff),0.45),blending:T.AdditiveBlending,depthWrite:false,transparent:true,fog:false}),
    beam:new T.MeshBasicMaterial({map:beamTex,color:c,blending:T.AdditiveBlending,depthWrite:false,transparent:true,side:T.DoubleSide,opacity:0.75}),
    ring:new T.MeshBasicMaterial({map:ringTex,color:c,blending:T.AdditiveBlending,depthWrite:false,transparent:true,opacity:0.95})};
  auraCache.set(col,o); return o;
}

// ================= audio =================
// Sounds are synthesized live with the Web Audio API (unless a recording in sounds/ replaces them): layers of filtered noise and oscillators
// shaped by envelopes. Sounds in the world are placed in 3D (quieter, muffled and later with distance,
// panned left/right) and share a reverb. Looping ambience (the rush of air when you propel and the hum of
// the box's lights) follows what is happening around you.
let AC=null,NB=null,BB=null,master=null,bus=null,verb=null,AMB=null,volume=0.8;
// how many sounds are playing right now: far-off ones are dropped once it gets crowded, so the mix never clips or crackles
const VOICES:number[]=[], VOICE_MAX=36;
const lastSfx={};
try{ const v=parseFloat(localStorage.getItem('stormIslandVol')); if(v>=0&&v<=1) volume=v; }catch(e){}
function noiseBuf(brown,sec){
  const b=AC.createBuffer(1,(AC.sampleRate*sec)|0,AC.sampleRate), d=b.getChannelData(0); let last=0;
  for(let i=0;i<d.length;i++){ const w=Math.random()*2-1; if(brown){ last=(last+0.02*w)/1.02; d[i]=last*3.5; } else d[i]=w; }
  return b;
}
function makeIR(sec){
  const len=(AC.sampleRate*sec)|0, b=AC.createBuffer(2,len,AC.sampleRate);
  for(let c=0;c<2;c++){ const d=b.getChannelData(c); for(let i=0;i<len;i++){ const k=i/len; d[i]=(Math.random()*2-1)*Math.pow(1-k,3.2)*(i<AC.sampleRate*0.012?0:1); } }
  return b;
}
function initAudio(){
  try{
    if(!AC){
      const ctx=new (window.AudioContext||window.webkitAudioContext)(); AC=ctx;
      const comp=AC.createDynamicsCompressor(); comp.threshold.value=-16; comp.knee.value=10; comp.ratio.value=5; comp.attack.value=0.002; comp.release.value=0.25; comp.connect(AC.destination);
      master=AC.createGain(); master.gain.value=volume; master.connect(comp);
      bus=AC.createGain(); bus.gain.value=0.5; bus.connect(master);
      verb=AC.createConvolver(); verb.buffer=makeIR(2.6); const vg=AC.createGain(); vg.gain.value=0.45; verb.connect(vg); vg.connect(master);
      NB=noiseBuf(false,2); BB=noiseBuf(true,4);
      initAmbience(); warmBank(); loadSoundFiles();
    }
    if(AC.state==='suspended') AC.resume();
  }catch(e){ AC=null; }
}
function setVolume(v){ volume=v; if(master) master.gain.setTargetAtTime(v,AC.currentTime,0.05); try{ localStorage.setItem('stormIslandVol',String(v)); }catch(e){} }
// --- one sound = a voice (position, pan, distance filter, reverb send) holding several layers
function voice(pos,o){
  let vol=o.gain==null?1:o.gain, pan=0, cut=0, delay=0, wet=o.wet==null?0.1:o.wet;
  if(pos&&player){
    const d=pos.distanceTo(camera.position), R=o.range||120; if(d>R) return null;
    vol*=Math.pow(1-d/R,1.4)/(1+d/50);
    if(d>8){ cut=clamp(15000*Math.exp(-d/60),450,15000); wet+=Math.min(0.4,d/300); }
    if(d>35) delay=Math.min(0.8,d/343);
    const rx=Math.cos(player.yaw), rz=-Math.sin(player.yaw), dx=pos.x-camera.position.x, dz=pos.z-camera.position.z, h=Math.hypot(dx,dz)||1;
    pan=clamp((dx*rx+dz*rz)/h,-1,1)*0.85;
  }
  if(vol<0.003) return null;
  const now=AC.currentTime; while(VOICES.length&&VOICES[0]<now) VOICES.shift();
  if(pos&&(VOICES.length>=VOICE_MAX||VOICES.length>=VOICE_MAX/2&&vol<0.12)) return null;
  const out=AC.createGain(); out.gain.value=vol; let n=out;
  if(cut){ const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=cut; n.connect(f); n=f; }
  if(pan&&AC.createStereoPanner){ const sp=AC.createStereoPanner(); sp.pan.value=pan; n.connect(sp); n=sp; }
  n.connect(bus); if(wet>0){ const s=AC.createGain(); s.gain.value=wet; n.connect(s); s.connect(verb); }
  return {out,t:AC.currentTime+0.004+delay,end:0};
}
function env(p,t,a,dur,g){ p.setValueAtTime(0.0001,t); p.exponentialRampToValueAtTime(Math.max(0.0002,g),t+a); p.exponentialRampToValueAtTime(0.0001,t+Math.max(dur,a+0.01)); }
// filtered noise layer
function nz(v,o){
  const t=v.t+(o.at||0), dur=o.dur||0.1, s=AC.createBufferSource(), f=AC.createBiquadFilter(), g=AC.createGain();
  s.buffer=o.brown?BB:NB; s.loop=true; if(o.rate) s.playbackRate.value=o.rate;
  f.type=o.type||'lowpass'; f.frequency.setValueAtTime(o.f||1000,t); if(o.f1) f.frequency.exponentialRampToValueAtTime(o.f1,t+dur); f.Q.value=o.q==null?0.7:o.q;
  env(g.gain,t,o.a||0.002,dur,o.g==null?1:o.g);
  s.connect(f); f.connect(g); g.connect(v.out); s.start(t,Math.random()*1.5); s.stop(t+dur+0.05);
  v.end=Math.max(v.end,(o.at||0)+dur);
}
// oscillator layer, optionally low-passed
function tn(v,o){
  const t=v.t+(o.at||0), dur=o.dur||0.1, s=AC.createOscillator(), g=AC.createGain();
  s.type=o.type||'sine'; s.frequency.setValueAtTime(o.f||440,t); if(o.f1) s.frequency.exponentialRampToValueAtTime(o.f1,t+dur); if(o.det) s.detune.value=o.det;
  env(g.gain,t,o.a||0.002,dur,o.g==null?1:o.g);
  if(o.lp){ const f=AC.createBiquadFilter(); f.type='lowpass'; f.frequency.value=o.lp; s.connect(f); f.connect(g); } else s.connect(g);
  g.connect(v.out); s.start(t); s.stop(t+dur+0.05);
  v.end=Math.max(v.end,(o.at||0)+dur);
}
function done(v){ const e=v.t+Math.min(v.end,0.6); let i=VOICES.length; while(i&&VOICES[i-1]>e) i--; VOICES.splice(i,0,e); const ms=(v.t-AC.currentTime+v.end+0.4)*1000; setTimeout(()=>{ try{ v.out.disconnect(); }catch(e){} },ms); }
// --- the sample bank. Plain oscillators and beeps sound synthetic, so most sounds are now rendered once,
// on first use, with simple physical models: a muzzle blast with the box's early reflections, struck metal and
// glass as banks of inharmonic modes, panel footsteps, and so on. Each sound gets a few random takes so
// repeats never sound identical, then plays back like a recording.
let SR=48000;
const rbj=(x,type,f,q)=>{ const w=2*Math.PI*Math.min(f,SR*0.45)/SR, c=Math.cos(w), s=Math.sin(w), a=s/(2*q), a0=1+a; let b0,b1,b2;
  if(type==='lp'){ b0=(1-c)/2; b1=1-c; b2=b0; } else if(type==='hp'){ b0=(1+c)/2; b1=-(1+c); b2=b0; } else { b0=a; b1=0; b2=-a; }
  b0/=a0; b1/=a0; b2/=a0; const a1=-2*c/a0, a2=(1-a)/a0; let x1=0,x2=0,y1=0,y2=0;
  for(let i=0;i<x.length;i++){ const xi=x[i], y=b0*xi+b1*x1+b2*x2-a1*y1-a2*y2; x2=x1; x1=xi; y2=y1; y1=y; x[i]=y; } return x; };
const SN=sec=>new Float32Array(Math.max(1,Math.ceil(sec*SR)));
// a burst of noise that dies away (decay is the time constant in seconds); brown is darker
const burst=(sec,decay,brown?,att?)=>{ const x=SN(sec); let b=0; const at=(att||0)*SR;
  for(let i=0;i<x.length;i++){ let w=Math.random()*2-1; if(brown){ b=b*0.985+w*0.12; w=b*2.5; } x[i]=w*Math.exp(-i/(decay*SR))*(at&&i<at?i/at:1); } return x; };
const mixIn=(dst,src,at,g)=>{ const o=Math.round(at*SR); for(let i=0;i<src.length&&i+o<dst.length;i++) dst[i+o]+=src[i]*g; return dst; };
// struck objects: decaying sines at the object's mode frequencies [Hz, decay s, level]
const modes=(dst,at,list,g)=>{ const o=Math.round(at*SR); for(const [f,d,a] of list){ if(f>SR*0.45) continue; const w=2*Math.PI*f/SR, ph=Math.random()*6.283, n=Math.min(dst.length-o,Math.ceil(d*6*SR));
  for(let i=0;i<n;i++) dst[i+o]+=Math.sin(w*i+ph)*Math.exp(-i/(d*SR))*a*g; } return dst; };
// metal: the inharmonic ratios of a struck bar or plate, each take slightly different
const metal=(f,decay,n?)=>[1,2.32,4.25,6.63,9.38,12.1].slice(0,n||6).map((r,k)=>[f*r*rnd(0.97,1.03),decay/(1+k*0.7),1/(1+k*0.6)]);
const glass=(f,decay)=>[1,2.71,5.12,8.3].map((r,k)=>[f*r*rnd(0.95,1.05),decay/(1+k*0.5),0.8/(1+k*0.4)]);
const panel=()=>[[rnd(170,210),0.035,1],[rnd(400,460),0.022,0.7],[rnd(900,1050),0.012,0.45],[rnd(2100,2500),0.006,0.3]]; // the box's hard white panels
const comb=(x,f,fb)=>{ const D=Math.max(1,Math.round(SR/f)); for(let i=D;i<x.length;i++) x[i]+=x[i-D]*fb; return x; };
const sat=(x,drive)=>{ for(let i=0;i<x.length;i++) x[i]=Math.tanh(x[i]*drive); return x; };
const norm=(x,peak)=>{ let m=0; for(let i=0;i<x.length;i++) m=Math.max(m,Math.abs(x[i])); if(m>0) for(let i=0;i<x.length;i++) x[i]*=peak/m; return x; };
const fadeOut=x=>{ const n=Math.min(512,x.length); for(let i=0;i<n;i++) x[x.length-1-i]*=i/n; return x; };
const amp=(x,fn)=>{ for(let i=0;i<x.length;i++) x[i]*=fn(i/SR); return x; };
// a sweeping band of noise (whooshes, hisses): f0 to f1 over the length
const sweep=(sec,f0,f1,q,shape)=>{ const x=SN(sec), blk=256; let b=0, x1=0,x2=0,y1=0,y2=0;
  for(let s=0;s<x.length;s+=blk){ const k=s/x.length, f=f0*Math.pow(f1/f0,k), w=2*Math.PI*Math.min(f,SR*0.45)/SR, al=Math.sin(w)/(2*q), a0=1+al, b0=al/a0, b2=-al/a0, a1=-2*Math.cos(w)/a0, a2=(1-al)/a0;
    for(let i=s;i<Math.min(s+blk,x.length);i++){ const xi=Math.random()*2-1, y=b0*xi+b2*x2-a1*y1-a2*y2; x2=x1; x1=xi; y2=y1; y1=y; x[i]=y*shape(i/x.length); } } return x; };
// a gunshot: muzzle crack and pressure wave, the gun's own body, the action cycling, then the box answering back
function gunshot(P){
  const x=SN(P.tail+0.25), nw=Math.round(0.0014*SR);
  for(let i=0;i<nw*2;i++) x[i]+=(i<nw?1:-1)*(1-(i%nw)/nw)*P.nw;
  mixIn(x,rbj(burst(0.02,0.0015),'hp',P.crack,0.7),0,1.5);
  mixIn(x,rbj(burst(P.bd*5,P.bd),'bp',P.body*rnd(0.92,1.08),P.q),0.0004,P.bg);
  mixIn(x,rbj(rbj(burst(P.td*5,P.td,true),'lp',P.thump,0.8),'lp',P.thump,0.7),0.001,P.tg);
  sat(x,P.drive);
  if(P.mech) modes(x,P.mech*rnd(0.9,1.1),metal(rnd(2300,2900),0.006,4),0.06);
  const dry=x.slice(0,Math.ceil(0.08*SR));
  for(const [d,g] of P.refl) mixIn(x,rbj(dry.slice(),'lp',P.rf||2800,0.7),d*rnd(0.85,1.15),g*rnd(0.8,1.1));
  mixIn(x,rbj(burst(P.tail,P.tail/5,true,0.01),'lp',P.tf,0.6),0.006,P.tg2);
  return norm(x,0.95);
}
const ROOM=[[0.019,0.32],[0.034,0.24],[0.052,0.2],[0.077,0.14],[0.11,0.1],[0.15,0.07]];
const BANK:any={
  ar:()=>gunshot({nw:0.9,crack:2600,body:950,q:0.9,bd:0.028,bg:1.1,thump:170,td:0.045,tg:1.3,drive:2.4,mech:0.032,refl:ROOM,tail:0.9,tf:900,tg2:0.32}),
  smg:()=>gunshot({nw:0.6,crack:3400,body:1600,q:1.1,bd:0.018,bg:1,thump:230,td:0.03,tg:0.8,drive:2,mech:0.025,refl:ROOM.slice(0,4),tail:0.55,tf:1200,tg2:0.22}),
  pistol:()=>gunshot({nw:0.8,crack:3000,body:1250,q:1,bd:0.024,bg:1,thump:190,td:0.04,tg:1,drive:2.2,mech:0.028,refl:ROOM,tail:0.75,tf:1000,tg2:0.28}),
  pump:()=>gunshot({nw:1.2,crack:2000,body:640,q:0.7,bd:0.05,bg:1.4,thump:110,td:0.08,tg:2,drive:3,refl:ROOM.map(([d,g])=>[d*1.1,g*1.3]),tail:1.3,tf:700,tg2:0.45}),
  sniper:()=>gunshot({nw:1.4,crack:4000,body:620,q:0.8,bd:0.045,bg:1.4,thump:85,td:0.12,tg:2.2,drive:3.2,refl:[[0.04,0.4],[0.09,0.3],[0.16,0.24],[0.26,0.18],[0.4,0.12]],rf:1800,tail:2.2,tf:520,tg2:0.55}),
  // light guns: an electric snap ringing through a metal tube, then a fizzing tail
  mf:()=>{ const x=SN(0.4); mixIn(x,rbj(burst(0.02,0.002),'hp',3500,0.7),0,1.2); const s=comb(sweep(0.18,5200,900,3,k=>Math.pow(1-k,2.2)),rnd(1400,1700),0.55); mixIn(x,s,0.001,0.9);
    mixIn(x,rbj(burst(0.35,0.08),'hp',5000,0.7),0.01,0.25); return norm(sat(x,1.6),0.9); },
  zap:()=>{ const x=SN(0.12); mixIn(x,rbj(burst(0.01,0.0015),'hp',4000,0.7),0,1); mixIn(x,comb(sweep(0.08,6000,2000,4,k=>1-k),rnd(2400,3000),0.5),0,0.6); return norm(x,0.8); },
  rpg:()=>{ const x=gunshot({nw:1.4,crack:1800,body:420,q:0.7,bd:0.06,bg:1.2,thump:90,td:0.12,tg:2.2,drive:2.6,refl:ROOM,tail:1.2,tf:600,tg2:0.4});
    const hiss=rbj(sweep(1.1,700,2600,0.8,k=>Math.min(1,k*12)*Math.pow(1-k,1.5)*(0.8+0.2*Math.random())),'hp',300,0.7); const y=SN(1.3); mixIn(y,x,0,1); mixIn(y,hiss,0.03,0.35); return norm(y,0.95); },
  boom:()=>{ const x=SN(2.6), nw=Math.round(0.004*SR); for(let i=0;i<nw*2;i++) x[i]+=(i<nw?1:-1)*(1-(i%nw)/nw);
    mixIn(x,rbj(burst(0.05,0.004),'hp',1500,0.7),0,1.2); mixIn(x,rbj(rbj(burst(2.5,0.5,true,0.004),'lp',900,0.7),'lp',400,0.7),0,2.4);
    mixIn(x,rbj(burst(1.6,0.25,true),'lp',90,0.9),0,2); for(let i=0;i<14;i++) mixIn(x,rbj(burst(0.02,0.003),'bp',rnd(1500,4500),2),rnd(0.1,1.3),rnd(0.15,0.4));
    for(const [d,g] of ROOM) mixIn(x,rbj(x.slice(0,Math.ceil(0.1*SR)),'lp',1500,0.7),d*1.6,g); return norm(sat(x,1.8),0.95); },
  // hitmarker: a short, dull thwack; headshot: a helmet ping
  hit:()=>{ const x=SN(0.12); mixIn(x,rbj(burst(0.06,0.012,true),'lp',420,0.8),0,1.4); mixIn(x,rbj(burst(0.03,0.004),'bp',rnd(1000,1300),1.6),0,0.7); mixIn(x,rbj(burst(0.01,0.0012),'hp',4000,0.7),0,0.35); return norm(x,0.8); },
  head:()=>{ const x=SN(0.6); mixIn(x,rbj(burst(0.01,0.0015),'hp',3000,0.7),0,0.8); modes(x,0,metal(rnd(2050,2250),0.16,5),0.6); mixIn(x,rbj(burst(0.05,0.01,true),'lp',500,0.8),0,0.6); return norm(x,0.85); },
  shield:()=>{ const x=SN(0.3); modes(x,0,glass(rnd(3300,3900),0.05),0.5); mixIn(x,rbj(burst(0.12,0.03),'hp',5500,0.7),0,0.5); mixIn(x,rbj(burst(0.03,0.006,true),'lp',600,0.8),0,0.4); return norm(x,0.75); },
  shieldBreak:()=>{ const x=SN(0.7); mixIn(x,rbj(burst(0.02,0.003),'hp',2500,0.7),0,1); for(let i=0;i<22;i++) modes(x,rnd(0,0.22)*rnd(0,1),glass(rnd(2200,6500),rnd(0.02,0.08)),rnd(0.15,0.35));
    mixIn(x,rbj(burst(0.6,0.12),'hp',4500,0.7),0.01,0.35); mixIn(x,rbj(burst(0.12,0.03,true),'lp',300,0.8),0,0.8); return norm(x,0.9); },
  hurt:()=>{ const x=SN(0.25); mixIn(x,rbj(burst(0.2,0.04,true),'lp',300,0.9),0,1.5); mixIn(x,rbj(burst(0.06,0.012),'bp',800,1),0,0.4); return norm(x,0.85); },
  elim:()=>{ const x=SN(1.1); mixIn(x,rbj(burst(0.4,0.08,true),'lp',220,0.9),0,1.6); mixIn(x,rbj(burst(0.02,0.003),'hp',2500,0.7),0,0.6); modes(x,0.01,metal(rnd(1150,1250),0.35,5),0.35); modes(x,0.06,metal(rnd(1700,1800),0.3,4),0.18); return norm(x,0.9); },
  // handling: gun parts clacking, bottles, caps and coins
  clack:()=>{ const x=SN(0.12); mixIn(x,rbj(burst(0.02,0.0025),'bp',rnd(1800,2600),1.4),0,1); modes(x,0,metal(rnd(1400,1900),0.012,4),0.4); mixIn(x,rbj(burst(0.03,0.006,true),'lp',500,0.8),0,0.4); return norm(x,0.85); },
  click:()=>{ const x=SN(0.05); mixIn(x,rbj(burst(0.008,0.0009),'hp',2500,0.7),0,1); modes(x,0,metal(rnd(3000,3600),0.004,3),0.5); return norm(x,0.7); },
  shimmer:()=>{ const x=SN(1.2); for(let i=0;i<6;i++) modes(x,i*0.045,metal(rnd(2600,4200),0.35,3),0.25); mixIn(x,rbj(burst(1,0.25,false,0.05),'hp',7000,0.7),0,0.2); return norm(x,0.6); },
  bottle:()=>{ const x=SN(0.3); modes(x,0,[[rnd(650,750),0.03,1],[rnd(1600,1800),0.018,0.6],[rnd(3100,3500),0.01,0.4]],0.6); mixIn(x,rbj(burst(0.01,0.002),'hp',2000,0.7),0,0.6);
    mixIn(x,amp(rbj(burst(0.25,0.08,true,0.02),'bp',450,2.5),t=>0.6+0.4*Math.sin(t*70)),0.03,0.5); return norm(x,0.75); },
  fizz:()=>{ const x=SN(0.9); for(let i=0;i<40;i++) mixIn(x,rbj(burst(0.006,0.0008),'hp',rnd(3000,7000),0.7),rnd(0,0.85),rnd(0.1,0.5)); mixIn(x,rbj(burst(0.8,0.4,false,0.05),'hp',6000,0.7),0,0.12); return norm(x,0.5); },
  gulp:()=>{ const x=SN(0.25); mixIn(x,rbj(rbj(burst(0.1,0.03,true,0.01),'bp',rnd(230,280),5),'lp',800,0.7),0,1); mixIn(x,rbj(rbj(burst(0.08,0.02,true,0.01),'bp',rnd(450,520),5),'lp',1200,0.7),0.07,0.6); return norm(x,0.7); },
  coin:()=>{ const x=SN(0.5); modes(x,0,metal(rnd(3600,4200),0.12,4),0.5); modes(x,rnd(0.08,0.12),metal(rnd(3600,4200),0.09,4),0.35); modes(x,rnd(0.16,0.2),metal(rnd(3600,4200),0.06,4),0.2); return norm(x,0.6); },
  thunk:()=>{ const x=SN(0.35); mixIn(x,rbj(burst(0.25,0.05,true),'lp',260,0.9),0,1.6); modes(x,0,[[rnd(120,150),0.06,1],[rnd(310,350),0.03,0.5]],0.5); mixIn(x,rbj(burst(0.02,0.004),'bp',1500,1.2),0,0.4); return norm(x,0.85); },
  whir:()=>{ const x=amp(rbj(burst(0.5,0.4,true,0.05),'bp',380,3),t=>0.7+0.3*Math.sin(t*2*Math.PI*48)); return norm(x,0.5); },
  // footsteps and hits on the box panels
  step:()=>{ const x=SN(0.12); mixIn(x,rbj(burst(0.006,0.0009),'hp',2200,0.7),0,0.5); modes(x,0,panel(),0.6); mixIn(x,rbj(burst(0.04,0.008,true),'lp',300,0.8),0,0.6);
    const toe=rnd(0.025,0.04); mixIn(x,rbj(burst(0.005,0.0008),'hp',2600,0.7),toe,0.25); modes(x,toe,panel(),0.25); return norm(x,0.8); },
  impact:()=>{ const x=SN(0.2); mixIn(x,rbj(burst(0.01,0.0012),'hp',2400,0.7),0,1); modes(x,0,panel(),0.5); mixIn(x,rbj(burst(0.06,0.012),'bp',rnd(1200,2000),1),0,0.4); return norm(x,0.75); },
  ricochet:()=>{ const x=SN(0.45); mixIn(x,rbj(burst(0.01,0.0012),'hp',2400,0.7),0,1); mixIn(x,sweep(0.4,rnd(3200,4200),rnd(1200,1700),14,k=>Math.pow(1-k,1.6)),0.005,0.5); return norm(x,0.6); },
  flesh:()=>{ const x=SN(0.1); mixIn(x,rbj(burst(0.08,0.015,true),'lp',350,0.9),0,1); mixIn(x,rbj(burst(0.02,0.004),'bp',700,1.2),0,0.4); return norm(x,0.7); },
  slam:()=>{ const x=SN(0.6); mixIn(x,rbj(burst(0.5,0.1,true),'lp',200,0.9),0,1.8); modes(x,0,panel().map(([f,d,a])=>[f*0.7,d*3,a]),0.6); mixIn(x,rbj(burst(0.03,0.005),'hp',1800,0.7),0,0.5); return norm(sat(x,1.4),0.9); },
  shatter:()=>{ const x=SN(0.6); for(let i=0;i<16;i++) modes(x,rnd(0,0.25)*rnd(0,1),glass(rnd(1800,5200),rnd(0.02,0.07)),rnd(0.15,0.3)); mixIn(x,rbj(burst(0.4,0.08),'hp',4000,0.7),0,0.3); return norm(x,0.7); },
  clink:()=>{ const x=SN(0.25); modes(x,0,metal(rnd(2300,2800),0.05,5),0.5); modes(x,rnd(0.05,0.09),metal(rnd(2300,2800),0.03,5),0.25); return norm(x,0.5); },
  crackle:()=>{ const x=SN(0.3); for(let i=0;i<6;i++) mixIn(x,rbj(burst(0.01,0.0015),'bp',rnd(1500,4500),1.5),rnd(0,0.2),rnd(0.3,1)); mixIn(x,rbj(burst(0.3,0.08,true),'lp',500,0.8),0,0.4); return norm(x,0.6); },
  // movement: air and the box itself
  whoosh:()=>norm(sweep(0.45,350,1800,0.9,k=>Math.sin(Math.PI*Math.pow(k,0.7))),0.6),
  launch:()=>{ const x=SN(0.6); mixIn(x,rbj(burst(0.2,0.04,true),'lp',180,0.9),0,1.4); mixIn(x,sweep(0.5,400,2400,0.8,k=>Math.min(1,k*15)*Math.pow(1-k,1.4)),0.01,0.6); return norm(x,0.8); },
  groanUp:()=>{ const x=SN(1.5); mixIn(x,rbj(burst(1.5,0.6,true,0.4),'lp',120,1),0,1.2); modes(x,0.1,[[rnd(85,95),0.6,1],[rnd(141,150),0.45,0.6],[rnd(229,240),0.3,0.4]],0.3); mixIn(x,sweep(1.2,300,2600,0.8,k=>Math.sin(Math.PI*k)),0.1,0.5); return norm(x,0.85); },
  groanDown:()=>{ const x=SN(1.5); mixIn(x,sweep(1.1,2400,250,0.8,k=>Math.sin(Math.PI*k)),0,0.6); mixIn(x,rbj(burst(0.6,0.15,true),'lp',150,0.9),0.9,1.3); modes(x,0.9,panel().map(([f,d,a])=>[f*0.6,d*4,a]),0.4); return norm(x,0.85); },
  // the gravity alarm: a mechanical bell hammered fast, like a factory klaxon
  bell:()=>{ const x=SN(0.4), f=rnd(980,1040); for(let i=0;i<8;i++) modes(x,i*0.024,[[f,0.08,1],[f*2.76,0.04,0.5],[f*5.4,0.02,0.3]],0.4); return norm(x,0.7); },
  quake:()=>{ const x=SN(2.8); mixIn(x,amp(rbj(burst(2.8,1.4,true,0.6),'lp',110,1),t=>0.75+0.25*Math.sin(t*9)*Math.sin(t*3.1)),0,1.4); modes(x,0.3,[[rnd(60,66),1,1],[rnd(97,104),0.7,0.6],[rnd(151,160),0.5,0.4]],0.3); mixIn(x,rbj(burst(2.2,0.9,true,0.3),'bp',600,1.5),0.2,0.3); return norm(x,0.85); },
  // Freeze Ray: a cold hiss of venting gas with ice ticking in it (one take every shot, so they overlap into a stream)
  frost:()=>{ const x=SN(0.32); mixIn(x,sweep(0.32,rnd(7500,8500),rnd(3800,4600),1.1,k=>Math.sin(Math.PI*Math.min(1,k*1.6))*(1-k*0.6)),0,0.9);
    mixIn(x,rbj(burst(0.3,0.2,true,0.03),'bp',rnd(900,1200),0.9),0,0.25); for(let i=0;i<5;i++) modes(x,rnd(0,0.25),glass(rnd(3500,6500),rnd(0.01,0.03)),rnd(0.04,0.1)); return norm(x,0.6); },
  // someone freezing solid: ice crackling over them, a deep creak and a crunch
  freeze:()=>{ const x=SN(1); for(let i=0;i<30;i++) modes(x,0.35*Math.pow(Math.random(),0.7),glass(rnd(2200,6500),rnd(0.015,0.05)),rnd(0.08,0.22));
    mixIn(x,rbj(burst(0.4,0.07,true),'lp',260,0.9),0.32,1.3); modes(x,0.3,[[rnd(180,220),0.12,1],[rnd(470,520),0.07,0.5]],0.4); mixIn(x,sweep(0.4,1800,9000,1.3,k=>Math.pow(1-k,1.5)),0,0.25); return norm(x,0.85); },
  // Taser: the snap of the cartridge, then a harsh electric buzz with crackles riding on it
  taser:()=>{ const x=SN(0.6); mixIn(x,rbj(burst(0.015,0.0018),'hp',3000,0.7),0,1.3); const hz=rnd(110,130);
    mixIn(x,amp(rbj(burst(0.55,0.3),'bp',rnd(1900,2400),1.6),t=>(0.55+0.45*Math.sign(Math.sin(t*2*Math.PI*hz)))*Math.min(1,(0.55-t)/0.1)),0.01,0.8);
    for(let i=0;i<12;i++) mixIn(x,rbj(burst(0.006,0.0008),'hp',rnd(3000,7000),0.7),rnd(0.02,0.5),rnd(0.3,0.8)); return norm(sat(x,2.2),0.85); },
  // stunned: the body buzzing and crackling
  stun:()=>{ const x=SN(0.4), hz=rnd(95,110); mixIn(x,amp(rbj(burst(0.4,0.3),'bp',rnd(2400,3000),1.4),t=>(0.5+0.5*Math.sign(Math.sin(t*2*Math.PI*hz)))*Math.sin(Math.PI*t/0.4)),0,0.7);
    for(let i=0;i<8;i++) mixIn(x,rbj(burst(0.005,0.0008),'hp',rnd(3000,6000),0.7),rnd(0,0.36),rnd(0.3,0.9)); return norm(sat(x,1.8),0.7); },
  // Flamethrower: a rushing, fluttering roar of burning gas (overlapping takes make it continuous)
  flame:()=>{ const x=SN(0.5), fl=rnd(11,17), win=t=>Math.min(1,t/0.05,(0.5-t)/0.16);
    mixIn(x,amp(rbj(rbj(burst(0.5,9,true),'lp',650,0.7),'hp',60,0.7),t=>win(t)*(0.7+0.3*Math.sin(t*2*Math.PI*fl))),0,1.4);
    mixIn(x,amp(rbj(burst(0.5,9),'bp',rnd(1500,2200),0.7),t=>win(t)*(0.6+0.4*Math.random())),0,0.3);
    for(let i=0;i<4;i++) mixIn(x,rbj(burst(0.008,0.0012),'bp',rnd(1500,4000),1.5),rnd(0.05,0.4),rnd(0.15,0.35)); return norm(x,0.75); },
  // the whoomph when the gas first catches
  ignite:()=>{ const x=SN(0.7); mixIn(x,rbj(burst(0.6,0.15,true,0.03),'lp',380,0.8),0,1.5); mixIn(x,sweep(0.5,300,1500,0.9,k=>Math.sin(Math.PI*Math.pow(k,0.5))*(1-k)),0,0.6); return norm(sat(x,1.4),0.85); },
  // the drone: rotor hum (blade-pass flutter) and a small-calibre gun
  rotor:()=>{ const x=SN(0.6), bp=rnd(85,100); mixIn(x,amp(rbj(burst(0.6,9,true),'bp',rnd(220,280),1.5),t=>Math.sin(Math.PI*t/0.6)*(0.55+0.45*Math.sin(t*2*Math.PI*bp))),0,1);
    modes(x,0,[[bp*4,0.6,0.25],[bp*8,0.4,0.12]],0.3); return norm(amp(x,t=>Math.sin(Math.PI*t/0.6)),0.5); },
  droneShot:()=>gunshot({nw:0.45,crack:4200,body:2100,q:1.2,bd:0.012,bg:0.8,thump:320,td:0.02,tg:0.45,drive:1.8,mech:0.02,refl:ROOM.slice(0,3),tail:0.35,tf:1500,tg2:0.15}),
  // anime moves: a blade cutting air with a steel ring, a thrown kunai's whistle and thunk, a rubber arm's twang,
  // a fist landing, and Saitama's shockwave (a deep blast of air with the box ringing after it)
  slash:()=>{ const x=SN(0.35); mixIn(x,sweep(0.2,1600,6500,1.6,k=>Math.sin(Math.PI*k)),0,0.8); modes(x,0.06,metal(rnd(3900,4500),0.14,4),0.22); return norm(x,0.7); },
  kunai:()=>{ const x=SN(0.35); mixIn(x,sweep(0.3,rnd(5200,6000),rnd(2400,2800),9,k=>Math.sin(Math.PI*k)*(1-k*0.5)),0,0.6); mixIn(x,sweep(0.2,500,2400,0.9,k=>Math.sin(Math.PI*k)),0,0.5); return norm(x,0.6); },
  stick:()=>{ const x=SN(0.3); mixIn(x,rbj(burst(0.08,0.012,true),'lp',650,0.8),0,1.2); modes(x,0.002,metal(rnd(2400,2900),0.06,4),0.35); return norm(x,0.75); },
  stretch:()=>{ const x=SN(0.42); let ph=0; const f0=rnd(70,90), f1=rnd(260,330), vb=rnd(18,26);
    for(let i=0;i<x.length;i++){ const t=i/SR, f=f0*Math.pow(f1/f0,Math.min(1,t/0.18))*(1+0.06*Math.sin(t*2*Math.PI*vb)); ph+=2*Math.PI*f/SR; x[i]=(Math.sin(ph)+0.35*Math.sin(2*ph)+0.15*Math.sin(3*ph))*Math.min(1,t/0.008)*Math.exp(-t/0.16); }
    mixIn(x,sweep(0.3,500,2600,0.9,k=>Math.sin(Math.PI*k)),0,0.5); return norm(x,0.75); },
  punch:()=>{ const x=SN(0.3); mixIn(x,rbj(burst(0.2,0.035,true),'lp',280,0.9),0,1.8); mixIn(x,rbj(burst(0.012,0.0018),'hp',2400,0.7),0,0.7); mixIn(x,rbj(burst(0.05,0.008),'bp',rnd(700,900),1.2),0,0.5); return norm(sat(x,1.5),0.85); },
  shock:()=>{ const x=SN(2), nw=Math.round(0.003*SR); for(let i=0;i<nw*2;i++) x[i]+=(i<nw?1:-1)*(1-(i%nw)/nw)*1.2;
    mixIn(x,rbj(burst(1.4,0.32,true,0.004),'lp',200,0.9),0,2.2); mixIn(x,sweep(0.9,3500,250,0.8,k=>Math.pow(1-k,2)),0.005,0.9); mixIn(x,rbj(burst(0.03,0.004),'hp',2000,0.7),0,0.9);
    for(const [d,g] of ROOM) mixIn(x,rbj(x.slice(0,Math.ceil(0.12*SR)),'lp',1200,0.7),d*2,g); return norm(sat(x,1.6),0.95); },
  shockS:()=>{ const x=SN(0.5); mixIn(x,rbj(burst(0.3,0.06,true,0.002),'lp',260,0.9),0,1.8); mixIn(x,sweep(0.3,3000,400,0.8,k=>Math.pow(1-k,2)),0.003,0.6); mixIn(x,rbj(burst(0.01,0.0015),'hp',2200,0.7),0,0.6); return norm(sat(x,1.4),0.85); },
  // Goku: the rising roar of powering up, the buzzing ki hum, the burst
  ssjUp:()=>{ const x=SN(1); mixIn(x,sweep(0.9,180,2600,1.1,k=>Math.min(1,k*6)*Math.pow(1-k,0.8)),0,1); mixIn(x,rbj(burst(1,0.5,true,0.08),'lp',150,0.9),0,1.2);
    for(let i=0;i<10;i++) mixIn(x,rbj(burst(0.01,0.0015),'bp',rnd(2000,5000),1.5),rnd(0.1,0.8),rnd(0.2,0.5)); return norm(sat(x,1.4),0.8); },
  kiHum:()=>{ const x=SN(0.6), hz=rnd(55,62); let ph=0; for(let i=0;i<x.length;i++){ const t=i/SR; ph+=2*Math.PI*hz*(1+0.02*Math.sin(t*40))/SR; x[i]=(Math.sin(ph)+0.5*Math.sin(2*ph)+0.3*Math.sin(3.02*ph))*Math.sin(Math.PI*t/0.6); }
    mixIn(x,amp(rbj(burst(0.6,9,true),'bp',rnd(380,460),2),t=>Math.sin(Math.PI*t/0.6)*(0.6+0.4*Math.sin(t*2*Math.PI*hz))),0,0.8);
    for(let i=0;i<5;i++) mixIn(x,rbj(burst(0.008,0.0012),'bp',rnd(2500,6000),1.5),rnd(0,0.55),rnd(0.15,0.35)); return norm(sat(x,1.3),0.7); },
  ssjBurst:()=>{ const x=SN(2), nw=Math.round(0.004*SR); for(let i=0;i<nw*2;i++) x[i]+=(i<nw?1:-1)*(1-(i%nw)/nw)*1.2;
    mixIn(x,rbj(burst(1.5,0.4,true,0.004),'lp',170,0.9),0,2.2); mixIn(x,sweep(1.1,4500,300,0.8,k=>Math.pow(1-k,1.6)),0.004,1); mixIn(x,sweep(0.6,900,5000,1.4,k=>Math.sin(Math.PI*k)),0,0.45);
    for(let i=0;i<14;i++) mixIn(x,rbj(burst(0.01,0.0015),'bp',rnd(1800,6000),1.5),rnd(0,0.6)*rnd(0,1),rnd(0.2,0.6));
    for(const [d,g] of ROOM) mixIn(x,rbj(x.slice(0,Math.ceil(0.12*SR)),'lp',1400,0.7),d*2.2,g); return norm(sat(x,1.6),0.95); },
  // Eren: the lightning, the roar, the steam, and the weight of a titan's fist
  thunder:()=>{ const x=SN(2.4); mixIn(x,rbj(burst(0.03,0.004),'hp',1800,0.7),0,1.6); for(let i=0;i<6;i++) mixIn(x,rbj(burst(0.02,0.003),'hp',rnd(1200,3000),0.7),rnd(0.005,0.08),rnd(0.4,0.9));
    mixIn(x,amp(rbj(burst(2.3,0.7,true,0.02),'lp',140,0.9),t=>0.7+0.3*Math.sin(t*13)*Math.sin(t*4.7)),0.02,2.2); return norm(sat(x,1.5),0.95); },
  roar:()=>{ const x=SN(1.4); let ph=0; const f0=rnd(62,72);
    for(let i=0;i<x.length;i++){ const t=i/SR, f=f0*(1+0.25*Math.sin(Math.PI*Math.min(1,t/1.2)))*(1+0.04*Math.sin(t*2*Math.PI*7)); ph+=2*Math.PI*f/SR; let w=0; for(let h=1;h<9;h++) w+=Math.sin(h*ph)/h; x[i]=w*Math.min(1,t/0.12)*Math.max(0,1-Math.pow(t/1.4,3)); }
    rbj(x,'bp',rnd(420,520),1.2); mixIn(x,rbj(burst(1.4,0.6,true,0.1),'bp',300,1.5),0,0.6); return norm(sat(x,2.2),0.85); },
  steam:()=>{ const x=SN(1.2); mixIn(x,rbj(sweep(1.2,3500,6500,0.7,k=>Math.min(1,k*20)*Math.pow(1-k,1.3)),'hp',2500,0.7),0,1); mixIn(x,rbj(burst(1.1,0.4,true),'lp',300,0.8),0,0.3); return norm(x,0.6); },
  titanSwing:()=>norm(sweep(0.5,120,650,0.9,k=>Math.sin(Math.PI*Math.pow(k,0.6))),0.7),
  titanHit:()=>{ const x=SN(0.9); mixIn(x,rbj(burst(0.6,0.09,true),'lp',170,0.9),0,2.2); mixIn(x,rbj(burst(0.02,0.003),'hp',1800,0.7),0,0.6); mixIn(x,rbj(burst(0.08,0.015),'bp',rnd(450,600),1.2),0,0.7);
    modes(x,0.004,panel().map(([f,d,a])=>[f*0.55,d*4,a]),0.5); return norm(sat(x,1.8),0.95); },
  // Tanjiro: the blade cutting air, a clean hit, and bullets ringing off steel
  katana:()=>{ const x=SN(0.4); mixIn(x,sweep(0.26,900,7200,2.2,k=>Math.pow(Math.sin(Math.PI*k),1.5)),0,1); mixIn(x,sweep(0.18,3000,9000,4,k=>Math.sin(Math.PI*k)),0.05,0.35); return norm(x,0.7); },
  bladeHit:()=>{ const x=SN(0.4); mixIn(x,rbj(burst(0.12,0.02,true),'lp',420,0.8),0,1.2); mixIn(x,sweep(0.12,6000,2500,2,k=>Math.pow(1-k,2)),0,0.8); modes(x,0.004,metal(rnd(2900,3400),0.08,4),0.25); mixIn(x,rbj(burst(0.2,0.05),'bp',rnd(500,700),0.8),0.01,0.35); return norm(sat(x,1.3),0.8); },
  clang:()=>{ const x=SN(0.9); mixIn(x,rbj(burst(0.008,0.001),'hp',3000,0.7),0,1.2); modes(x,0,metal(rnd(1700,2100),0.35,6),0.9); modes(x,0.001,metal(rnd(4200,4800),0.12,3),0.4); mixIn(x,rbj(burst(0.04,0.008,true),'lp',600,0.8),0,0.4); return norm(x,0.85); },
  // Light: the cover flipping open, the pen scratching, the beam and what it hits
  bookOpen:()=>{ const x=SN(0.35); mixIn(x,rbj(burst(0.12,0.04),'bp',rnd(1400,1800),0.9),0,0.8); mixIn(x,rbj(burst(0.05,0.01,true),'lp',400,0.8),0.1,1); mixIn(x,sweep(0.2,800,3000,1,k=>Math.sin(Math.PI*k)),0,0.4); return norm(x,0.6); },
  scribble:()=>{ const x=SN(0.16); for(let i=0;i<5;i++) mixIn(x,rbj(rbj(burst(0.03,0.012),'bp',rnd(2500,5000),2.5),'hp',1500,0.7),rnd(0,0.12),rnd(0.5,1)); return norm(x,0.45); },
  deathBeam:()=>{ const x=SN(1.6); mixIn(x,rbj(burst(1.2,0.35,true,0.01),'lp',110,0.9),0,2); mixIn(x,sweep(1,2600,180,1.2,k=>Math.pow(1-k,1.3)),0.01,1);
    const f=rnd(110,118); modes(x,0.02,[[f,0.9,1],[f*1.5,0.7,0.6],[f*2,0.6,0.5],[f*3.02,0.4,0.35]],0.35); mixIn(x,rbj(burst(0.02,0.003),'hp',2400,0.7),0,0.8); return norm(sat(x,1.5),0.9); },
  deathHit:()=>{ const x=SN(0.7); mixIn(x,rbj(burst(0.4,0.08,true),'lp',200,0.9),0,2); mixIn(x,rbj(burst(0.015,0.002),'hp',2500,0.7),0,0.8); modes(x,0.003,[[rnd(78,84),0.4,1],[rnd(160,170),0.2,0.5]],0.4); return norm(sat(x,1.6),0.9); },
  // Paintball Gun: a puff of compressed air with a hollow pop and the bolt's tock; the ball bursting wetly on what it hits
  pbShot:()=>{ const x=SN(0.35); mixIn(x,rbj(rbj(burst(0.08,0.012,true),'bp',rnd(520,640),1.4),'lp',1600,0.7),0,1.4); mixIn(x,comb(rbj(burst(0.05,0.008),'bp',rnd(900,1100),1.2),rnd(300,340),0.5),0,0.6);
    mixIn(x,rbj(burst(0.25,0.05,false,0.004),'hp',3500,0.7),0.004,0.35); modes(x,0.012,[[rnd(1700,1900),0.01,1],[rnd(3400,3800),0.006,0.5]],0.25); return norm(x,0.8); },
  splat:()=>{ const x=SN(0.4); mixIn(x,rbj(burst(0.12,0.02,true),'lp',rnd(700,900),0.8),0,1.5); mixIn(x,amp(rbj(burst(0.2,0.05),'bp',rnd(1300,1700),1.1),t=>0.55+0.45*Math.sin(t*2*Math.PI*rnd(55,75))),0.005,0.5);
    for(let i=0;i<6;i++) mixIn(x,rbj(burst(0.01,0.0015),'bp',rnd(2500,5500),2),rnd(0.03,0.25),rnd(0.1,0.3)); return norm(x,0.75); },
  // a heartbeat: lub-dub, two soft low thumps felt more than heard
  heart:()=>{ const x=SN(0.6); for(const [at,g] of [[0,1],[0.16,0.7]]){ mixIn(x,rbj(rbj(burst(0.16,0.03,true),'lp',110,0.9),'lp',110,0.9),at,1.6*g); modes(x,at,[[rnd(46,52),0.07,1],[rnd(78,86),0.04,0.4]],0.5*g); } return norm(x,0.85); },
  pop:()=>{ const x=SN(0.4); mixIn(x,rbj(burst(0.02,0.002),'hp',2500,0.7),0,1.2); mixIn(x,rbj(burst(0.3,0.06,true),'lp',260,0.9),0,1.2); mixIn(x,comb(rbj(burst(0.2,0.04),'bp',900,1),rnd(380,420),0.6),0.005,0.4); return norm(x,0.85); },
};
// end-of-match stings: still music, but played by warm, detuned ensembles with a timpani roll rather than bleeps
const stack=(x,at,freqs,dur,att,cut)=>{ const o=Math.round(at*SR), n=Math.min(x.length-o,Math.ceil(dur*SR));
  for(const f of freqs) for(const dt of [-0.004,0,0.005]){ const w=2*Math.PI*f*(1+dt)/SR; let ph=Math.random()*6.28;
    for(let i=0;i<n;i++){ ph+=w; const t=i/SR, e=Math.min(1,t/att)*Math.exp(-t/(dur*0.6)); x[i+o]+=(Math.sin(ph)+0.35*Math.sin(2*ph)+0.18*Math.sin(3*ph))*e*0.12; } }
  return x; };
const timp=(x,at,f,g)=>{ modes(x,at,[[f,0.5,1],[f*1.5,0.35,0.5],[f*1.98,0.25,0.35]],g); mixIn(x,rbj(burst(0.2,0.04,true),'lp',300,0.8),at,g*0.8); return x; };
BANK.victory=()=>{ const x=SN(3.2); timp(x,0,98,0.6); timp(x,0.18,98,0.5); timp(x,0.36,131,0.7); stack(x,0.36,[262,330,392,523],2.6,0.06,0); for(let i=0;i<6;i++) modes(x,0.4+i*0.07,metal(rnd(2600,3600),0.4,3),0.08); return norm(x,0.85); };
BANK.defeat=()=>{ const x=SN(3); timp(x,0,73,0.8); stack(x,0.05,[147,175,220],1.1,0.15,0); stack(x,0.9,[131,156,196],1.9,0.2,0); return norm(rbj(x,'lp',2200,0.7),0.8); };
// --- recorded samples. Any bank sound can be replaced by real recordings: drop sounds/<name>-1.ogg, -2.ogg ...
// into the repo and run tools/sound_manifest.py, which lists them in sounds.js (window.SOUND_FILES). They are
// fetched once sound is unlocked, mixed to mono and levelled like the synth takes, and take over from then on;
// a file that is missing or can't be decoded just leaves the synth version playing.
const FILE_BANK=new Map();
function loadSoundFiles(){
  const files=window.SOUND_FILES||{};
  for(const name of Object.keys(files)){
    Promise.all(files[name].map(u=>fetch(u).then(r=>{ if(!r.ok) throw new Error(u); return r.arrayBuffer(); }).then(d=>AC.decodeAudioData(d)).catch(()=>null)))
      .then(bufs=>{ const a=[];
        for(const b of bufs){ if(!b) continue; const x=new Float32Array(b.length);
          for(let c=0;c<b.numberOfChannels;c++){ const d=b.getChannelData(c); for(let i=0;i<x.length;i++) x[i]+=d[i]/b.numberOfChannels; }
          const m=AC.createBuffer(1,x.length,b.sampleRate); m.getChannelData(0).set(norm(fadeOut(x),0.95)); a.push(m); }
        if(a.length) FILE_BANK.set(name,a); });
  }
}
const SBK=new Map();
function takes(name){ const f=FILE_BANK.get(name); if(f) return f; let a=SBK.get(name); if(a) return a; SR=AC.sampleRate; const N=name==='victory'||name==='defeat'||name==='quake'?1:4; a=[];
  for(let i=0;i<N;i++){ const x=fadeOut(BANK[name]()), b=AC.createBuffer(1,x.length,SR); b.getChannelData(0).set(x); a.push(b); } SBK.set(name,a); return a; }
// play one take of a sample in a voice: g is the level, rate the pitch, at a delay
function smp(v,name,o?){ o=o||{}; const a=takes(name), b=a[Math.floor(Math.random()*a.length)], t=v.t+(o.at||0), s=AC.createBufferSource(), g=AC.createGain();
  s.buffer=b; s.playbackRate.value=(o.rate||1)*rnd(0.97,1.03); g.gain.value=o.g==null?1:o.g; s.connect(g); g.connect(v.out); s.start(t);
  v.end=Math.max(v.end,(o.at||0)+b.duration/s.playbackRate.value); }
// render the bank a little at a time once sound is unlocked, so the first shot doesn't hitch
function warmBank(){ const names=Object.keys(BANK).filter(n=>!(window.SOUND_FILES||{})[n]); let i=0; const step=()=>{ if(i<names.length){ takes(names[i++]); setTimeout(step,30); } }; setTimeout(step,200); }
// a mechanical click: gun parts, latches, buttons
const chk=(v,at,f,g)=>{ smp(v,'click',{at,g:(g||0.7)*0.9,rate:(f||2600)/2900}); };
// --- guns: one recorded-style take each, a touch of random pitch so no two shots match
const GUN_SFX={
  ar:(v,p)=>{ smp(v,'ar',{rate:p}); },
  smg:(v,p)=>{ smp(v,'smg',{rate:p}); },
  pistol:(v,p)=>{ smp(v,'pistol',{rate:p}); },
  pump:(v,p)=>{ smp(v,'pump',{rate:p}); smp(v,'clack',{at:0.42,g:0.5,rate:0.8}); smp(v,'clack',{at:0.55,g:0.6,rate:0.7}); },
  mf:(v,p)=>{ smp(v,'mf',{rate:p,g:0.8}); }, // Mirror Fractal Guns: an electric snap
  rpg:(v,p)=>{ smp(v,'rpg',{rate:p}); },
  frz:(v,p)=>{ smp(v,'frost',{rate:p,g:0.55}); },
  tsr:(v,p)=>{ smp(v,'taser',{rate:p,g:0.9}); },
  flm:(v,p)=>{ smp(v,'flame',{rate:p*0.95,g:0.8}); },
  pb:(v,p)=>{ smp(v,'pbShot',{rate:p,g:0.75}); },
  droneShot:(v,p)=>{ smp(v,'droneShot',{rate:p*1.1,g:0.6}); },
  sniper:(v,p)=>{ smp(v,'sniper',{rate:p}); chk(v,0.75,2400,0.6); smp(v,'clack',{at:0.86,g:0.4}); chk(v,1.0,2000,0.7); },
};
const STEP_SFX={
  magOut:v=>{ chk(v,0,3000,0.5); smp(v,'clack',{at:0.02,g:0.35,rate:0.8}); },
  magIn:v=>{ smp(v,'clack',{g:0.9}); chk(v,0.02,2200,0.5); },
  charge:v=>{ chk(v,0,2800,0.7); smp(v,'clack',{at:0.06,g:0.5,rate:1.2}); chk(v,0.09,3200,0.8); },
  slide:v=>{ smp(v,'clack',{g:0.5,rate:1.3}); chk(v,0.07,3400,0.8); },
  shell:v=>{ smp(v,'clack',{g:0.5,rate:0.7}); },
  pump:v=>{ smp(v,'clack',{g:0.6,rate:0.8}); smp(v,'clack',{at:0.13,g:0.7,rate:0.7}); },
  boltUp:v=>{ chk(v,0,2600,0.6); smp(v,'clack',{at:0.03,g:0.4,rate:0.9}); },
  round:v=>{ smp(v,'clink',{g:0.5,rate:1.2}); },
  boltDown:v=>{ smp(v,'clack',{g:0.45,rate:0.9}); chk(v,0.09,2200,0.9); },
};
// footsteps on the box's hard white panels
const FOOT={ rock:(v,g)=>{ smp(v,'step',{g:0.9*g}); } };
const SFX={
  tick:v=>{ smp(v,'click',{g:0.25,rate:1.3}); }, // the locker rail clicking past a card
  swing:v=>{ smp(v,'whoosh',{g:0.5,rate:1.6}); },
  chop:(v,o)=>{ if(o.mat==='stone'){ smp(v,'impact',{g:1}); smp(v,'clink',{g:0.3,rate:0.6}); } else smp(v,'thunk',{g:0.9,rate:1.6}); },
  empty:v=>{ smp(v,'click',{g:0.7,rate:0.8}); },
  hit:v=>{ smp(v,'hit',{g:0.9}); },
  head:v=>{ smp(v,'head',{g:0.8}); smp(v,'hit',{g:0.6}); },
  shield:v=>{ smp(v,'shield',{g:0.7}); },
  shieldBreak:v=>{ smp(v,'shieldBreak',{g:0.9}); },
  hurt:v=>{ smp(v,'hurt',{g:1}); },
  elim:v=>{ smp(v,'elim',{g:1}); },
  pickup:(v,o)=>{ const it=o.item||{};
    if(it.kind==='gun'){ smp(v,'clack',{g:0.7}); smp(v,'clack',{at:0.07,g:0.6,rate:0.85}); if(it.r>=2) smp(v,'shimmer',{at:0.05,g:0.12+0.1*(it.r-2)}); }
    else if(it.kind==='cons') smp(v,'bottle',{g:0.7});
    else smp(v,'clack',{g:0.5,rate:1.2}); },
  useStart:v=>{ smp(v,'click',{g:0.5,rate:0.7}); smp(v,'fizz',{at:0.05,g:0.35}); },
  gulp:v=>{ smp(v,'gulp',{g:0.7}); },
  healDone:v=>{ smp(v,'shimmer',{g:0.35}); },
  jump:v=>{ smp(v,'whoosh',{g:0.25,rate:1.3}); },
  land:(v,o)=>{ const k=clamp((o.v||10)/18,0.3,1.3); smp(v,'slam',{g:0.35*k,rate:1.3}); FOOT.rock(v,1.2); },
  step:(v,o)=>{ FOOT.rock(v,o.g||1); },
  whiz:v=>{ nz(v,{type:'bandpass',f:3800,f1:1100,q:3,dur:0.17,g:0.9,a:0.03}); },
  impact:(v,o)=>{ const m=o.mat;
    if(m==='flesh') smp(v,'flesh',{g:0.8});
    else if(m==='wood') smp(v,'thunk',{g:0.6,rate:1.8});
    else if(Math.random()<0.2) smp(v,'ricochet',{g:0.6}); else smp(v,'impact',{g:0.7}); },
  gravUp:v=>{ smp(v,'groanUp',{g:0.8}); },
  gravDown:v=>{ smp(v,'groanDown',{g:0.8}); },
  slam:(v,o)=>{ smp(v,'slam',{g:(o&&o.v)||1}); },
  shatter:v=>{ smp(v,'shatter',{g:0.7}); },
  boom:v=>{ smp(v,'boom',{g:1.2}); },
  zapB:v=>{ smp(v,'zap',{g:0.35,rate:rnd(0.9,1.15)}); },
  boing:(v,o)=>{ smp(v,'launch',{g:o&&o.small?0.4:0.9}); },
  ballOn:v=>{ smp(v,'launch',{g:0.6,rate:0.8}); smp(v,'zap',{at:0.12,g:0.3,rate:0.6}); },
  ballPop:v=>{ smp(v,'pop',{g:0.9}); },
  splat:v=>{ smp(v,'splat',{g:0.6,rate:rnd(0.9,1.15)}); },
  heart:(v,o)=>{ smp(v,'heart',{g:o.g||0.8}); },
  crackle:v=>{ smp(v,'crackle',{g:0.6}); },
  clink:v=>{ smp(v,'clink',{g:0.5}); },
  unhook:v=>{ smp(v,'clack',{g:0.5,rate:0.8}); },
  pin:v=>{ smp(v,'clink',{g:0.5,rate:1.4}); chk(v,0,3200,0.5); },
  buy:v=>{ smp(v,'coin',{g:0.6}); smp(v,'whir',{at:0.12,g:0.3}); smp(v,'thunk',{at:0.45,g:0.9}); },
  deny:v=>{ smp(v,'thunk',{g:0.5,rate:1.3}); smp(v,'click',{at:0.08,g:0.4,rate:0.6}); },
  boost:v=>{ smp(v,'launch',{g:0.5,rate:1.2}); },
  propel:v=>{ smp(v,'whoosh',{g:0.35}); },
  alarm:(v,o)=>{ smp(v,'bell',{g:0.45,rate:o.hi?1.2:1}); },
  stormWarn:v=>{ smp(v,'quake',{g:0.8}); },
  victory:v=>{ smp(v,'victory',{g:0.9}); },
  defeat:v=>{ smp(v,'defeat',{g:0.85}); },
  ui:v=>{ smp(v,'click',{g:0.35}); },
  freeze:v=>{ smp(v,'freeze',{g:0.9}); },
  slash:v=>{ smp(v,'slash',{g:0.6}); }, kunai:v=>{ smp(v,'kunai',{g:0.6}); }, stick:v=>{ smp(v,'stick',{g:0.6}); },
  stretch:(v,o)=>{ smp(v,'stretch',{g:0.7*(o.gain==null?1:1)}); }, punch:v=>{ smp(v,'punch',{g:0.9}); smp(v,'hit',{g:0.4,rate:0.8}); },
  shock:v=>{ smp(v,'shock',{g:1.1}); }, shockS:v=>{ smp(v,'shockS',{g:0.7}); },
  ssjUp:v=>{ smp(v,'ssjUp',{g:0.8}); }, ssjHum:(v,o)=>{ smp(v,'kiHum',{g:0.35+0.4*(o.k||0),rate:0.9+0.35*(o.k||0)}); }, ssjFull:v=>{ smp(v,'shimmer',{g:0.5,rate:0.8}); smp(v,'crackle',{g:0.7}); },
  ssjBurst:(v,o)=>{ smp(v,'ssjBurst',{g:0.6+0.5*(o.k||0)}); }, ssjHit:v=>{ smp(v,'zap',{g:0.4,rate:0.7}); smp(v,'crackle',{at:0.03,g:0.5}); },
  katana:v=>{ smp(v,'katana',{g:0.7}); }, bladeHit:v=>{ smp(v,'bladeHit',{g:0.9}); }, clang:(v,o)=>{ smp(v,'clang',{g:0.75*(o.v||1),rate:rnd(0.92,1.1)}); smp(v,'zap',{g:0.15,rate:1.4}); },
  bookOpen:v=>{ smp(v,'bookOpen',{g:0.6}); }, scribble:v=>{ smp(v,'scribble',{g:0.45,rate:rnd(0.9,1.15)}); }, deathBeam:(v,o)=>{ smp(v,'deathBeam',{g:0.75+0.4*(o.k||0)}); }, deathHit:v=>{ smp(v,'deathHit',{g:0.9}); },
  titanBolt:v=>{ smp(v,'thunder',{g:1.1}); smp(v,'steam',{at:0.15,g:0.5}); }, roar:v=>{ smp(v,'roar',{g:0.85}); }, steam:v=>{ smp(v,'steam',{g:0.7}); },
  titanSwing:v=>{ smp(v,'titanSwing',{g:0.7}); }, titanHit:(v,o)=>{ smp(v,'titanHit',{g:o.v||1}); smp(v,'hit',{g:0.5,rate:0.6}); }, titanWhiff:(v,o)=>{ smp(v,'thunk',{g:0.5*(o.v||1),rate:0.6}); },
  thaw:v=>{ smp(v,'shatter',{g:0.8,rate:1.15}); smp(v,'freeze',{g:0.3,rate:1.6}); },
  stun:v=>{ smp(v,'stun',{g:0.55}); },
  ignite:v=>{ smp(v,'ignite',{g:0.8}); },
  rotor:v=>{ smp(v,'rotor',{g:0.5}); },
  droneUp:v=>{ smp(v,'whir',{g:0.5,rate:1.4}); smp(v,'launch',{at:0.05,g:0.4,rate:1.4}); chk(v,0,2800,0.6); },
  droneDown:v=>{ smp(v,'pop',{g:0.8,rate:1.2}); smp(v,'shatter',{at:0.02,g:0.4,rate:0.8}); },
};
// range is how far away a sound carries; wet is how much reverb it gets
const SFX_OPT={pb:{range:150},splat:{range:60,wet:0.05},katana:{range:80},bladeHit:{range:100},clang:{range:150},bookOpen:{range:40},scribble:{range:30},deathBeam:{range:500,wet:0.45},deathHit:{range:250,wet:0.2},ssjBurst:{range:500,wet:0.4},ssjHit:{range:120},titanBolt:{range:700,wet:0.5},roar:{range:400,wet:0.35},steam:{range:80},titanSwing:{range:120},titanHit:{range:300,wet:0.25},titanWhiff:{range:150},shock:{range:500,wet:0.4},shockS:{range:200,wet:0.15},punch:{range:80},stretch:{range:90},kunai:{range:80},stick:{range:60},slash:{range:60},mf:{range:260},frz:{range:120},tsr:{range:160},flm:{range:170,wet:0.1},droneShot:{range:220},rotor:{range:55,wet:0.03},freeze:{range:120},thaw:{range:120},stun:{range:70},ignite:{range:140},droneUp:{range:80},droneDown:{range:160},zapB:{range:60},boing:{range:120},ballPop:{range:160},rpg:{range:420,wet:0.2},boom:{range:700,wet:0.5},crackle:{range:45,wet:0.05},clink:{range:50},smg:{range:260},pistol:{range:280},pump:{range:300,wet:0.15},sniper:{range:600,wet:0.25},
  step:{range:40,wet:0.03},impact:{range:70},whiz:{range:20,wet:0},chop:{range:80},stormWarn:{wet:0.5},victory:{wet:0.3},defeat:{wet:0.3},land:{wet:0.03}};
const SFX_GAP={clang:0.04,scribble:0.08,bladeHit:0.05,ssjHum:0.3,ssjHit:0.05,titanSwing:0.1,titanHit:0.08,steam:0.3,stretch:0.045,shockS:0.06,punch:0.03,frz:0.07,flm:0.2,stun:0.15,freeze:0.05,thaw:0.05,tick:0.035,zapB:0.03,crackle:0.05,clink:0.03,impact:0.03,whiz:0.08,hit:0.035,head:0.035,shield:0.035,step:0.02};
function sfx(kind,pos?,o?){
  if(!AC||!bus) return; o=o||{};
  const gap=SFX_GAP[kind], now=AC.currentTime; if(gap&&kind!=='step'||gap&&!pos){ if(lastSfx[kind]!=null&&now-lastSfx[kind]<gap) return; lastSfx[kind]=now; }
  const opt=SFX_OPT[kind]||{}, v=voice(pos,{range:opt.range,wet:opt.wet,gain:o.gain}); if(!v) return;
  if(GUN_SFX[kind]) GUN_SFX[kind](v,rnd(0.94,1.06)); else if(kind==='reloadStep') STEP_SFX[o.step](v); else if(SFX[kind]) SFX[kind](v,o);
  done(v);
}
// --- looping ambience
function loopSrc(brown,rate){ const s=AC.createBufferSource(); s.buffer=brown?BB:NB; s.loop=true; s.playbackRate.value=rate||1; s.start(); return s; }
function chain(...n){ for(let i=0;i<n.length-1;i++) n[i].connect(n[i+1]); return n[n.length-1]; }
function filt(type,f,q){ const b=AC.createBiquadFilter(); b.type=type; b.frequency.value=f; b.Q.value=q==null?0.7:q; return b; }
function gainN(v?){ const g=AC.createGain(); g.gain.value=v||0; return g; }
function initAmbience(){
  const out=gainN(0.9); out.connect(master);
  const A:any={out};
  // air rushing past while you propel, and the low hum of the box's lights
  A.windF=filt('bandpass',500,0.6); A.wind=gainN(); chain(loopSrc(true,1),A.windF,A.wind,out);
  A.hum=gainN(); const trem=gainN(0.5); chain(trem,A.hum,out);
  chain(loopSrc(true,0.6),filt('bandpass',95,3),trem); chain(loopSrc(true,0.9),filt('lowpass',400,0.7),gainN(0.35),trem); // the box's room tone: a low rumble, no pure tones
  const lfo=AC.createOscillator(), lg=gainN(0.2); lfo.frequency.value=0.13; chain(lfo,lg,trem.gain); lfo.start();
  AMB=A;
}
function footsteps(dt){
  for(const e of combatants){
    if(!e.alive||!e.onGround){ e.stepD=0; continue; }
    const s=Math.hypot(e.vel.x,e.vel.z); if(s<1){ e.stepD=0; continue; }
    e.stepD=(e.stepD||0)+s*dt; const stride=e.crouch?1.5:s>9?2.3:1.85;
    if(e.stepD<stride) continue; e.stepD-=stride;
    const g=(e.crouch?0.35:s>9?1.25:0.9)*(e.isPlayer?0.6:1.3);
    if(e.isPlayer) sfx('step',null,{g}); else if(e.pos.distanceTo(camera.position)<40) sfx('step',e.pos,{g});
  }
}
const HEART_HP=35; let heartT=0;
function updateAudio(dt){
  if(!AC||!AMB) return; const A=AMB, t=AC.currentTime, p=player, T=(par,v,k?)=>par.setTargetAtTime(v,t,k||0.15);
  const live=state==='play'&&p;
  T(A.out.gain,state==='paused'?0.25:1,0.2);
  if(state==='paused') return;
  if(!live){ T(A.hum.gain,state==='menu'?0.02:0,0.3); T(A.wind.gain,0,0.5); return; }
  const gust=0.75+0.25*Math.sin(t*0.37)*Math.sin(t*0.71+1);
  T(A.wind.gain,p.alive?(p.zgPropel?0.22:0.04*gust):0.03,0.25); T(A.windF.frequency,p.zgPropel?900:420,0.3);
  T(A.hum.gain,0.025,0.4);
  // low health: your heartbeat, faster and louder the closer you are to going down
  if(p.alive&&p.hp<=HEART_HP){ heartT-=dt; if(heartT<=0){ const k=1-clamp(p.hp/HEART_HP,0,1); heartT=1.05-0.45*k; sfx('heart',null,{g:0.5+0.5*k}); } } else heartT=0;
  footsteps(dt);
}

// ================= world state =================
let state='menu', fallbackLook=false, locked=false, matchUsed=false, sens=1;
let world=null, colliders, structMeshes, charMeshes, combatants, bots, player=null, effects;
let matchTime=0, aliveCount=0, targetsDirty=true, ads=false, hurtFlash=0, hitT=0, bannerT=0, toastT=0, camShake=0;
const keys:Record<string,boolean>={}, mouse={l:false,r:false};
const ray=new T.Raycaster();
const tv1=new V(), tv2=new V(), tv3=new V(), tv4=new V();
function refreshTargets(){ if(!targetsDirty) return; rebuildMeshGrid(); targetsDirty=false; }

// ================= blocks =================
// the box's blocks are solid pieces: they stop people (colliders), bullets and sight (structMeshes)
function registerPiece(p){ p.etype='piece'; for(const m of p.meshes){ m.userData.ent=p; m.castShadow=true; m.receiveShadow=true; structMeshes.push(m); } colliders.add(p.box); targetsDirty=true; return p; }
function boxOf(cx,cy,cz,sx,sy,sz){ return {min:{x:cx-sx/2,y:cy-sy/2,z:cz-sz/2},max:{x:cx+sx/2,y:cy+sy/2,z:cz+sz/2}}; }
// ================= characters (the soldier rig: skinned model + motion-captured clips + procedural IK) =================
let SOLDIER=null; const MODEL_SCALE=1.1;
const _ikA=new V(),_ikB=new V(),_ikC=new V(),_ikT=new V(),_v1=new V(),_v2=new V(),_v3=new V(),_v4=new V(),_qP=new T.Quaternion(),_qD=new T.Quaternion(),_qI=new T.Quaternion();
function rotateBoneWorld(bone,axisW,ang){
  if(!(Math.abs(ang)>1e-5)) return;
  bone.parent.getWorldQuaternion(_qP); _qD.setFromAxisAngle(axisW,ang); _qI.copy(_qP).invert();
  bone.quaternion.premultiply(_qP).premultiply(_qD).premultiply(_qI); bone.updateMatrixWorld(true);
}
// Turn a hand so its fingers point along F with the palm facing N (world directions), then curl the fingers by
// `curl` radians per joint, as if wrapped around a grip. Uses the knuckles to find how the hand is turned now.
const _hq=new T.Quaternion(), _hm0=new T.Matrix4(), _hm1=new T.Matrix4(), _hw=o=>o.getWorldPosition(new V());
function poseHand(B,sd,F,N,curl){
  const h=B[sd+'Hand'], s=sd==='Right'?1:-1, hp=_hw(h); // right hand: palm = fingers x (index to pinky); left hand is mirrored
  const f0=_hw(B[sd+'HandMiddle1']).sub(hp).normalize(), a0=_hw(B[sd+'HandPinky1']).sub(_hw(B[sd+'HandIndex1']));
  a0.addScaledVector(f0,-a0.dot(f0)).normalize(); const n0=new V().crossVectors(f0,a0).multiplyScalar(s);
  const f1=F.clone().normalize(), n1=N.clone().addScaledVector(f1,-N.dot(f1)).normalize(), a1=new V().crossVectors(n1,f1).multiplyScalar(s);
  _hm0.makeBasis(f0,a0,n0).transpose(); _hm1.makeBasis(f1,a1,n1).multiply(_hm0); _hq.setFromRotationMatrix(_hm1);
  h.parent.getWorldQuaternion(_qP); _qI.copy(_qP).invert(); h.quaternion.premultiply(_qP).premultiply(_hq).premultiply(_qI); h.updateMatrixWorld(true);
  if(curl){ const ax=a1.multiplyScalar(-s); for(const fg of ['Index','Middle','Ring','Pinky']) for(const k of [1,2,3]){ const b=B[sd+'Hand'+fg+k]; if(b) rotateBoneWorld(b,ax,curl*(k===1?0.8:1)); } }
}
function solveIK(A,B,C,target,pole){
  A.getWorldPosition(_ikA); B.getWorldPosition(_ikB); C.getWorldPosition(_ikC); _ikT.copy(target);
  const lab=_ikA.distanceTo(_ikB), lcb=_ikB.distanceTo(_ikC), lat=clamp(_ikT.distanceTo(_ikA),0.01,lab+lcb-0.002);
  const ac=_v1.subVectors(_ikC,_ikA).normalize(), ab=_v2.subVectors(_ikB,_ikA).normalize();
  const ba=_v3.subVectors(_ikA,_ikB).normalize(), bc=_v4.subVectors(_ikC,_ikB).normalize();
  const acab0=Math.acos(clamp(ac.dot(ab),-1,1)), babc0=Math.acos(clamp(ba.dot(bc),-1,1));
  const acab1=Math.acos(clamp((lcb*lcb-lab*lab-lat*lat)/(-2*lab*lat),-1,1)), babc1=Math.acos(clamp((lat*lat-lab*lab-lcb*lcb)/(-2*lab*lcb),-1,1));
  const axis0=new V().crossVectors(ac,ab); if(axis0.lengthSq()<1e-8){ if(pole) axis0.crossVectors(ac,_v2.subVectors(pole,_ikA)); else axis0.set(1,0,0); } axis0.normalize();
  rotateBoneWorld(A,axis0,acab1-acab0); rotateBoneWorld(B,axis0,babc1-babc0);
  C.getWorldPosition(_ikC); A.getWorldPosition(_ikA);
  const ac2=_v1.subVectors(_ikC,_ikA), at=_v2.subVectors(_ikT,_ikA);
  const axis1=new V().crossVectors(ac2,at); if(axis1.lengthSq()>1e-10) rotateBoneWorld(A,axis1.normalize(),ac2.angleTo(at));
  if(pole){ B.getWorldPosition(_ikB); const ax=_v3.copy(at).normalize();
    const pb=_v1.subVectors(_ikB,_ikA); pb.addScaledVector(ax,-pb.dot(ax)); const pp=_v4.subVectors(pole,_ikA); pp.addScaledVector(ax,-pp.dot(ax));
    if(pb.lengthSq()>1e-6&&pp.lengthSq()>1e-6){ const s=new V().crossVectors(pb,pp).dot(ax)<0?-1:1; rotateBoneWorld(A,ax,pb.angleTo(pp)*s); } }
}
function loadSoldier(done){
  if(!T.GLTFLoader||!T.SkeletonUtils){ done(false); return; }
  let finished=false; const fin=ok=>{ if(!finished){ finished=true; done(ok); } };
  setTimeout(()=>fin(false),15000);
  const ready=gl=>{ SOLDIER={scene:gl.scene,clips:{}}; gl.animations.forEach(a=>SOLDIER.clips[a.name]=a); fin(true); };
  try{ if(!window.SOLDIER_GLB){ fin(false); return; }
    const bin=atob(window.SOLDIER_GLB), buf=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) buf[i]=bin.charCodeAt(i);
    new T.GLTFLoader().parse(buf.buffer,'',ready,()=>fin(false)); }
  catch(e){ fin(false); }
}
const HIT_GEO={head:new T.BoxGeometry(0.34,0.36,0.34),chest:new T.BoxGeometry(0.56,0.62,0.36),legs:new T.BoxGeometry(0.5,1,0.34)};
const hitMat=new T.MeshBasicMaterial({visible:false});
// How each gun is held: up at the chest with the barrel level, right hand on the grip, left hand
// palm up under the barrel, stock tucked under the arm. In gun space (x right, y up, z back): r is the right wrist
// on the pistol grip and l the left wrist under the handguard or pump. g is where the right wrist sits relative to
// the right shoulder in body space (x right, y up, z back), before the aim pitch.
const GUN_S=0.95;
const HOLD={ar:{r:[0.015,-0.09,0.21],l:[-0.03,-0.065,-0.17],g:[-0.04,-0.17,-0.24]},smg:{r:[0.015,-0.08,0.2],l:[-0.03,-0.05,-0.1],g:[-0.04,-0.17,-0.26]},
  pump:{r:[0.015,-0.06,0.3],l:[-0.03,-0.08,-0.18],g:[-0.04,-0.19,-0.2]},pistol:{r:[0.015,-0.05,0.13],l:[-0.035,-0.08,0.1],g:[-0.1,-0.13,-0.37],lf:[0.3,-0.3,-0.9],ln:[0.9,0.4,0]},
  sniper:{r:[0.015,-0.09,0.26],l:[-0.03,-0.08,-0.2],g:[-0.04,-0.17,-0.22]},
  mf:{r:[0.015,-0.05,0.13],l:[-0.315,-0.05,0.13],g:[-0.03,-0.13,-0.4],lf:[0.1,-0.1,-0.99],ln:[1,0,0.1]}, // one gun in each hand
  rpg:{r:[0.015,0.01,0.23],l:[-0.035,-0.03,-0.03],g:[-0.02,0,-0.22],lf:[0.35,-0.25,-0.9],ln:[0.95,0.2,0]}, // the RPG rests on the shoulder
  frz:{r:[0.015,-0.09,0.2],l:[-0.03,-0.075,-0.06],g:[-0.04,-0.17,-0.25]},tsr:{r:[0.015,-0.05,0.13],l:[-0.035,-0.08,0.1],g:[-0.1,-0.13,-0.37],lf:[0.3,-0.3,-0.9],ln:[0.9,0.4,0]},
  flm:{r:[0.015,-0.09,0.2],l:[-0.03,-0.08,-0.15],g:[-0.04,-0.17,-0.23]},pb:{r:[0.015,-0.09,0.2],l:[-0.03,-0.07,-0.08],g:[-0.04,-0.17,-0.25]},drone:{r:[0.085,-0.03,0.11],l:[-0.085,-0.03,0.11],g:[-0.16,-0.24,-0.33],lf:[0.2,0.2,-0.95],ln:[0.3,0.9,0]}}; // the remote in both hands, thumbs on the sticks
// The pickaxe swing: both hands on the pickaxe, quick wind-up over one shoulder, a diagonal chop that
// lands the head on the crosshair, a follow-through across the body, and alternating forehand/backhand combos.
// Body frame: x right, y up, z back. Keys: [t, grip x,y,z from the right shoulder, handle dir x,y,z, spike dir x,y,z, torso twist, lean]
const SWING_T=0.42, PICK_HIT=0.52;
// at rest the pickaxe sits on the right shoulder: the right hand holds the handle low in front of the chest, the
// handle runs up over the top of the shoulder and the head rests just behind it
const PICK_REST=[0,-0.06,-0.24,-0.22,0.22,0.83,0.5,0,-0.5,0.83,0,0];
// Tanjiro's guard: both hands on the hilt in front of the chest, blade angled up across the body, edge out
const PICK_GUARD=[0,-0.2,-0.3,-0.42,-0.55,0.8,-0.25,0.1,0.25,-1,0,0];
const PICK_KEYS=[
  [PICK_REST,[0.3,0.14,0.14,-0.02,0.35,0.55,0.75,0.1,0.75,-0.65,-0.5,-0.06],[0.52,0.05,-0.15,-0.48,0.2,0.25,-0.95,-0.3,-0.95,-0.1,0.3,0.24],
   [0.68,-0.2,-0.42,-0.36,-0.5,-0.25,-0.8,-0.5,-0.6,0.35,0.42,0.18],[1,...PICK_REST.slice(1)]],
  [PICK_REST,[0.3,-0.5,0.1,-0.06,-0.35,0.55,0.75,-0.1,0.75,-0.65,0.5,-0.06],[0.52,0.15,-0.15,-0.48,0.15,0.25,-0.95,0.3,-0.95,-0.1,-0.2,0.24],
   [0.68,0.3,-0.4,-0.3,0.65,-0.2,-0.7,0.5,-0.6,0.35,-0.42,0.18],[1,...PICK_REST.slice(1)]]];
const _pd=new V(), _ps=new V(), _pz=new V(), _pm=new T.Matrix4();
const _qFlip=new T.Quaternion().setFromAxisAngle(new V(0,1,0),Math.PI);
// dual blades: the left arm mirrors the right arm's pickaxe pose, with the second blade mirrored in its fist
function dualLeft(c,B,g,P,rightB,upB,fwdB,rest){
  const shL=B.LeftArm.getWorldPosition(new V()), hL=P.h.clone(); hL.x=-hL.x;
  solveIK(B.LeftArm,B.LeftForeArm,B.LeftHand,g.localToWorld(g.worldToLocal(shL.clone()).add(hL)),shL.clone().addScaledVector(rightB,-0.5).addScaledVector(upB,-0.55).addScaledVector(fwdB,-0.1));
  const q=P.q; c.pickL.quaternion.set(q.x,-q.y,-q.z,q.w).multiply(_qFlip); c.pickL.visible=true;
  const hwL=B.LeftHand.getWorldPosition(new V());
  if(rest>0.01){ g.updateMatrixWorld(true); const hd=new V(0,1,0).applyQuaternion(c.pickL.getWorldQuaternion(new T.Quaternion()));
    const pn=rightB.clone(); pn.addScaledVector(hd,-pn.dot(hd)).normalize(); const pf=new V().crossVectors(hd,pn);
    poseHand(B,'Left',pf,pn,0.8*rest); hwL.addScaledVector(pf,0.07*rest).addScaledVector(pn,0.03*rest); }
  g.worldToLocal(hwL); c.pickL.position.copy(hwL);
}
function pickPose(e){
  const K=PICK_KEYS[e.swingSide||0], k=e.swingT>0?clamp(1-e.swingT/SWING_T,0,1):0;
  let i=0; while(i<K.length-2&&k>K[i+1][0]) i++;
  // Catmull-Rom through the keys so the arc never stops and restarts between them
  const a=K[Math.max(0,i-1)], b=K[i], c=K[i+1], d=K[Math.min(K.length-1,i+2)], u=clamp((k-b[0])/(c[0]-b[0]),0,1), u2=u*u, u3=u2*u;
  const gk=e.swingT>0?0:(e.guardK||0), br=gk*0.015*Math.sin(matchTime*2.4); // on guard: the sword up across the body, breathing a little
  const m=j=>gk>0?PICK_REST[j]+(PICK_GUARD[j]-PICK_REST[j])*gk+(j===2?br:0):0.5*(2*b[j]+(c[j]-a[j])*u+(2*a[j]-5*b[j]+4*c[j]-d[j])*u2+(3*b[j]-a[j]-3*c[j]+d[j])*u3);
  // orientation: handle along +y, spike along +x of the pickaxe model
  _pd.set(m(4),m(5),m(6)).normalize(); _ps.set(m(7),m(8),m(9)); _ps.addScaledVector(_pd,-_ps.dot(_pd)).normalize(); _pz.crossVectors(_ps,_pd);
  return {h:new V(m(1),m(2),m(3)),q:new T.Quaternion().setFromRotationMatrix(_pm.makeBasis(_ps,_pd,_pz)),tw:m(10),ln:m(11)};
}
function makeCharacterGLB(){
  const g=new T.Group(); g.rotation.order='YXZ';
  const spin=new T.Group(); g.add(spin);
  const model=T.SkeletonUtils.clone(SOLDIER.scene); model.scale.setScalar(MODEL_SCALE); spin.add(model);
  const bones={};
  model.traverse(o=>{ if(o.isBone) bones[o.name.replace(/^mixamorig:?/,'')]=o; if(o.isMesh){ o.castShadow=true; o.frustumCulled=false; } });
  const mixer=new T.AnimationMixer(model), act={};
  for(const n of ['Idle','Walk','Run','TPose']){ const a=mixer.clipAction(SOLDIER.clips[n]); a.play(); a.setEffectiveWeight(n==='Idle'?1:0); a.time=Math.random()*a.getClip().duration; act[n]=a; }
  const gunMount=new T.Group(); gunMount.scale.setScalar(GUN_S); g.add(gunMount);
  const pickG=new T.Group(); const handle=new T.Mesh(GEO.handle,colorMat(0x6b4a2a)); handle.position.y=0.35; const ph=new T.Mesh(GEO.pickHead,colorMat(0xb8c4d6)); ph.position.set(0,0.78,0); pickG.add(handle,ph); pickG.visible=false; g.add(pickG);
  const consG=new T.Group(); consG.visible=false; g.add(consG);
  const flash=new T.Sprite(flashMat); flash.scale.setScalar(0.8); flash.visible=false;
  const hb={head:new T.Mesh(HIT_GEO.head,hitMat),chest:new T.Mesh(HIT_GEO.chest,hitMat),legs:new T.Mesh(HIT_GEO.legs,hitMat)}; g.add(hb.head,hb.chest,hb.legs);
  return {glb:true,g,spin,model,bones,mixer,act,gunMount,pick:pickG,consG,consId:'',flash,hb,parts:[hb.head,hb.chest,hb.legs],head:hb.head,heldKey:'',held:null,w:{Idle:1,Walk:0,Run:0,TPose:0}};
}
// ---- outfits: repaint the soldier's armor and hang themed gear on its bones (see skins.js)
const SK=window.SKINS||null, skinMats=new Map(), gearMats={};
function skinMaterials(skin,body,visor,geo){
  let m=skinMats.get(skin.i); if(m) return m;
  const fin=skin.fin||[0.15,0.7], src=body.map, cv=SK.paint(src.image,skin,512,geo);
  const tex=t=>{ const x=new T.CanvasTexture(t); x.flipY=src.flipY; x.encoding=src.encoding; x.wrapS=src.wrapS; x.wrapT=src.wrapT; x.anisotropy=4; return x; };
  const b=body.clone(); b.map=tex(cv.map); b.color.set(0xffffff); b.metalness=Math.min(fin[0],0.6); b.roughness=fin[1];
  if(cv.glow){ b.emissive=new T.Color(0xffffff); b.emissiveMap=tex(cv.glow); b.emissiveIntensity=0.9; }
  const v=visor.clone(); v.map=null; v.color.set(skin.v); v.metalness=0.6; v.roughness=0.18;
  if((skin.g||'').includes('v')){ v.emissive=new T.Color(skin.v); v.emissiveIntensity=0.85; }
  m={body:b,visor:v}; skinMats.set(skin.i,m); return m;
}
function applySkin(c,skin){
  if(!c.glb||!SK||!skin) return;
  if(!c.baseMats){ c.baseMats={}; c.model.traverse(o=>{ if(o.isMesh) c.baseMats[o.name]=o.material; }); }
  for(const o of c.gear||[]){ o.parent&&o.parent.remove(o); o.traverse(m=>{ if(m.isMesh&&!m.geometry.userData.keep) m.geometry.dispose(); }); }
  c.gear=[]; c.gearFar=false; c.capes=[]; c.flaps=[]; c.bobs=[]; c.skin=skin;
  if(c.animeBody){ c.animeBody.parent&&c.animeBody.parent.remove(c.animeBody); c.animeBody=null; }
  let geo=null; c.model.traverse(o=>{ if(o.name==='vanguard_Mesh') geo=o.geometry; });
  const mats=skin.def||skin.body?null:skinMaterials(skin,c.baseMats.vanguard_Mesh,c.baseMats.vanguard_visor,geo);
  c.model.traverse(o=>{ if(o.isMesh) o.material=mats?(o.name==='vanguard_visor'?mats.visor:mats.body):c.baseMats[o.name]; if(o.name==='vanguard_visor') o.visible=!skin.noVisor&&!skin.body; if(o.name==='vanguard_Mesh') o.visible=!skin.body; }); // masks like the Joker's replace the visor
  if(skin.body){ // anime skins swap the armored soldier for a smooth body on the same skeleton (see skins.js)
    let sm=null; c.model.traverse(o=>{ if(o.name==='vanguard_Mesh') sm=o; });
    let bm=skinMats.get('body'+skin.i); if(!bm){ const geo=SK.bodyGeometry(T,sm.skeleton,skin.body); bm={geo,mat:SK.bodyMaterial(T,geo),line:SK.bodyOutline(T,geo)}; skinMats.set('body'+skin.i,bm); }
    const m=new T.SkinnedMesh(bm.geo,bm.mat); m.name='animeBody'; m.castShadow=true; m.frustumCulled=false; m.position.copy(sm.position); m.quaternion.copy(sm.quaternion); m.scale.copy(sm.scale);
    sm.parent.add(m); m.bind(sm.skeleton,sm.bindMatrix); c.animeBody=m;
    const ol=new T.SkinnedMesh(bm.geo,bm.line); ol.name='animeBodyLine'; ol.frustumCulled=false; m.add(ol); ol.bind(sm.skeleton,sm.bindMatrix); }
  const big=skin.big||[1,1]; c.model.scale.set(MODEL_SCALE*big[0],MODEL_SCALE*big[1],MODEL_SCALE*big[0]); // Hulk and Thanos are bigger (looks only)
  c.g.updateMatrixWorld(true); const ws=new V(), sc=new V(), qq=new T.Quaternion(); c.g.getWorldScale(ws);
  for(const [kind,...args] of skin.acc){
    for(const [bn,obj] of SK.gear(T,kind,args,gearMats,{slim:!!skin.body,build:skin.body&&skin.body.build})){
      const bone=c.bones[bn]; if(!bone) continue; bone.matrixWorld.decompose(tv1,qq,sc);
      const wrap=new T.Group(); wrap.scale.setScalar(ws.x/sc.x); // gear is modelled in metres at the character's own scale
      wrap.add(obj); bone.add(wrap); c.gear.push(wrap);
      obj.traverse(o=>{ if(o.isMesh) o.frustumCulled=false; if(o.userData.cape) c.capes.push(o); if(o.userData.flap) c.flaps.push(o); if(o.userData.bob) c.bobs.push(o); });
    }
  }
}
// capes and tails trail behind when running and falling; wings breathe; halos float
const _cq1=new T.Quaternion(), _cq2=new T.Quaternion(), _cq3=new T.Quaternion(), _cu=new T.Vector3(), _cx=new T.Vector3(), _cmat=new T.Matrix4(), UPX=new T.Vector3(1,0,0), UPY=new T.Vector3(0,1,0), _cf=new T.Vector3();
function swayGear(e,c,speed,dt){
  if(!c.capes||(!c.capes.length&&!c.flaps.length&&!c.bobs.length)) return;
  const t=performance.now()/1000, air=!e.onGround?0.35:0;
  const tgt=0.06+clamp(speed/7,0,1)*0.55+air+Math.sin(t*(3+speed*0.6)+e.walkT)*0.04*(0.3+clamp(speed/7,0,1));
  for(const o of c.capes){ o.userData.rx=lerp(o.userData.rx||0,tgt,1-Math.exp(-6*dt));
    if(o.userData.cape==='hang'){ // a cape hangs from the shoulders down the length of the body, whatever the spine is doing
      // face the way the chest faces (the torso twists to aim), hang along the body (not world gravity: in zero-g the
      // body lies flat and a cape hanging straight down would cut through it), flare back with speed
      c.spin.getWorldQuaternion(_cq2); _cu.set(0,1,0).applyQuaternion(_cq2);
      o.parent.getWorldQuaternion(_cq1); _cf.set(0,0,1).applyQuaternion(_cq1); _cf.addScaledVector(_cu,-_cf.dot(_cu));
      if(_cf.lengthSq()<0.09){ _cf.set(0,0,-1).applyQuaternion(_cq2); _cf.addScaledVector(_cu,-_cf.dot(_cu)); }
      _cf.normalize(); _cx.crossVectors(_cu,_cf); _cmat.makeBasis(_cx,_cu,_cf); _cq2.setFromRotationMatrix(_cmat);
      _cq2.multiply(_cq3.setFromAxisAngle(UPX,o.userData.rx+0.18)).premultiply(_cq1.invert()); o.quaternion.copy(_cq2); }
    else o.rotation.x=(o.userData.baseX??(o.userData.baseX=o.rotation.x))+o.userData.rx; }
  for(const o of c.flaps) o.rotation.y=o.userData.flap*(0.45+Math.sin(t*2.2)*0.1+air*0.35);
  for(const o of c.bobs) o.position.y=0.42+Math.sin(t*2)*0.012;
}
const UP=new V(0,1,0);
// Whole-body motion: in zero-g the body tilts into the swim (e.zgTx), and on the ceiling it is rolled over
// (e.zgRoll). It turns about the middle of the body, not the feet.
const _pc=new V(), TAU=Math.PI*2;
const easeIO=k=>k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
const wrapPi=a=>((a%TAU)+TAU*1.5)%TAU-Math.PI;
// [S2] put the root where the middle of the body (1 m up) lands on e.pos, whatever the tilt and roll
function placeAboutMiddle(e,g){ _pc.set(0,1,0).applyEuler(g.rotation); g.position.set(e.pos.x-_pc.x,e.pos.y+1-_pc.y,e.pos.z-_pc.z); }
// [S2] whole-body tilt (zero-g) and roll (ceiling, bank). X is the frame's animation context (animCtx)
function bodyPose(e,g,c,a,dt,X){
  const tx=e.zgFloat?(e.zgTx||0):0, tz=(e.bankT||0)+(e.zgRoll||0);
  c.spin.position.set(0,0,0);
  D(g.rotation,'x',tx,a*0.5); D(g.rotation,'z',tz,a*0.4);
  placeAboutMiddle(e,g);
}
// [S0] a damped spring toward x: o[k] is the value and o[k+'V'] its velocity, f the frequency in Hz, z the damping ratio
// (1 = no overshoot). Sub-stepped, so the 0.3 s steps of throttled far bots cannot blow it up. Returns the value.
function spring(o,k,x,f,z,dt){ const w=TAU*f, kv=k+'V'; let p=o[k]||0, v=o[kv]||0; const n=Math.max(1,Math.ceil(dt*w/0.5)), h=dt/n;
  for(let i=0;i<n;i++){ v+=(-w*w*(p-x)-2*z*w*v)*h; p+=v*h; } o[k]=p; o[kv]=v; return p; }
// per-frame motion inputs for the animator
function motionState(e,dt){
  const A=e.anim, fx=-Math.sin(e.yaw), fz=-Math.cos(e.yaw), fwd=e.vel.x*fx+e.vel.z*fz, side=-e.vel.x*fz+e.vel.z*fx, speed=Math.hypot(e.vel.x,e.vel.z);
  const yr=wrapPi(e.yaw-(A.lastYaw==null?e.yaw:A.lastYaw))/Math.max(dt,1e-3); A.lastYaw=e.yaw;
  e.bankT=e.onGround?clamp(yr*0.03,-0.22,0.22)*smooth(4,10,speed):0;
  const aS=1-Math.exp(-7*dt);
  D(A,'sprint',e.onGround?smooth(8.6,10.6,speed):e.zgPropel?1:0,aS);
  A.land=Math.max(0,(A.land||0)-dt*3.2); A.hit=Math.max(0,(A.hit||0)-dt*5); A.draw=Math.min(1,(A.draw==null?1:A.draw)+dt*3.5);
  return {fx,fz,fwd,side,speed};
}
// ---- deaths: each cause plays out differently, then the body shatters into glowing cubes
//   shot      knocked back along the bullet and tumbles away limp (headshots flip harder)
//   pickaxe   batted away spinning, and splats on whatever it hits
//   block     slammed by the flying block into the nearest wall or block, spread-eagle, with a crater
//   explosion blown outward, blackened, and splatted
const crackTex=canvasTex(256,256,(g,w)=>{ g.clearRect(0,0,w,w); g.strokeStyle='rgba(40,44,52,.85)'; g.lineCap='round';
  for(let i=0;i<14;i++){ let a=i/14*TAU+Math.random()*0.3, x=w/2, y=w/2, r=0; g.lineWidth=5; g.beginPath(); g.moveTo(x,y);
    while(r<w*0.48){ r+=rnd(10,22); a+=rnd(-0.35,0.35); x=w/2+Math.cos(a)*r; y=w/2+Math.sin(a)*r; g.lineTo(x,y); g.lineWidth=Math.max(1,g.lineWidth-0.6); } g.stroke(); }
  const gr=g.createRadialGradient(w/2,w/2,0,w/2,w/2,w*0.2); gr.addColorStop(0,'rgba(30,34,40,.55)'); gr.addColorStop(1,'rgba(30,34,40,0)'); g.fillStyle=gr; g.fillRect(0,0,w,w); });
const shardGeo=new T.BoxGeometry(0.16,0.16,0.16), shardMats=[0xffffff,0xd9dde3,0x9aa2ae,0x5cf0ff].map(c=>new T.MeshBasicMaterial({color:c,transparent:true}));
const _dq=new T.Quaternion(), _dv=new V(), _dn=new V(), BACK=new V(0,0,1);
const _iceTint=new T.Color(0xbfeeff);
function deathKind(weapon,info){ return info&&info.explosive?'explosion':info&&info.frozen||weapon==='Freeze Ray'?'ice':weapon==='Fire'||weapon==='Flamethrower'?'burn':weapon==='flying block'?'block':weapon==='Pickaxe'||info&&info.melee?'pickaxe':'shot'; }
function startDeath(t,kind,info){
  const dir=(info&&info.dir?info.dir.clone():new V(rnd(-1,1),rnd(-0.3,0.3),rnd(-1,1))).normalize();
  const sp={shot:info&&info.head?11:7,pickaxe:24,block:Math.max(30,(info&&info.speed||0)*1.7),explosion:30,burn:3,ice:3}[kind];
  const d:any=t.death={kind,t:0,c:new V(t.pos.x,t.pos.y+1,t.pos.z),vel:t.vel.clone().multiplyScalar(0.3).addScaledVector(dir,sp),
    q:new T.Quaternion().setFromEuler(new T.Euler(t.zgRoll>1.5?0:0,t.yaw,t.zgRoll||0,'YXZ')),
    av:new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(kind==='shot'?(info&&info.head?7:2.5):kind==='burn'?1.5:kind==='pickaxe'?14:9),
    stuck:null,shatterAt:kind==='shot'?2.2:kind==='burn'?2.6:kind==='ice'?0.55:3,spread:0,fx:0};
  if(kind==='ice'){ d.av.multiplyScalar(0.15); t.ch.model.traverse(o=>{ if(o.isMesh&&o.material&&o.material.color){ o.material=o.material.clone(); o.material.color.lerp(_iceTint,0.65); if(o.material.emissive) o.material.emissive.setHex(0x0d3a52); } }); }
  if(kind==='shot'&&info&&info.head) d.av.set(-dir.z,0,dir.x).multiplyScalar(9);
  if(kind==='explosion'||kind==='burn') t.ch.model.traverse(o=>{ if(o.isMesh&&o.material&&o.material.color){ o.material=o.material.clone(); o.material.color.multiplyScalar(0.25); } });
  if(t===player) camShake=Math.max(camShake,kind==='shot'?0.4:1);
  // the body eases out of whatever it was doing, and what was in its hands stays in its hands
  const c=t.ch; poseSnap(c,0.3); c.lcDead=true; d.props=[];
  for(const [o,h] of [[c.gunMount,'RightHand'],[c.pick,'RightHand'],[c.pickL,'LeftHand'],[c.consG,'RightHand'],[c.handG,'RightHand']] as any[])
    if(o&&o.visible&&(o!==c.gunMount||c.held)) d.props.push([o,c.bones[h],propRel(o,c.bones[h],new T.Matrix4())]);
}
// moves a dead body; returns the surface normal when it slams into something
function deathMove(d,dt){
  if(ZG.state==='ceil') d.vel.y+=GRAV*dt;
  if(d.kind==='shot'||d.kind==='burn'||d.kind==='ice') d.vel.multiplyScalar(Math.exp(-(d.kind==='ice'?3:0.5)*dt));
  d.c.addScaledVector(d.vel,dt); const r=0.7;
  _dn.set(0,0,0);
  if(d.c.x<-ZG.L+r){ d.c.x=-ZG.L+r; _dn.set(1,0,0); } else if(d.c.x>ZG.L-r){ d.c.x=ZG.L-r; _dn.set(-1,0,0); }
  if(d.c.z<-ZG.L+r){ d.c.z=-ZG.L+r; _dn.set(0,0,1); } else if(d.c.z>ZG.L-r){ d.c.z=ZG.L-r; _dn.set(0,0,-1); }
  if(d.c.y<r){ d.c.y=r; _dn.set(0,1,0); } else if(d.c.y>ZG.H-r){ d.c.y=ZG.H-r; _dn.set(0,-1,0); }
  for(const b of ZG.blocks){ const px=b.sx/2+r-Math.abs(d.c.x-b.x), py=b.sy/2+r-Math.abs(d.c.y-b.y), pz=b.sz/2+r-Math.abs(d.c.z-b.z); if(px<=0||py<=0||pz<=0) continue;
    if(px<py&&px<pz){ const s=d.c.x>b.x?1:-1; d.c.x+=s*px; _dn.set(s,0,0); } else if(py<pz){ const s=d.c.y>b.y?1:-1; d.c.y+=s*py; _dn.set(0,s,0); } else { const s=d.c.z>b.z?1:-1; d.c.z+=s*pz; _dn.set(0,0,s); } break; }
  return _dn.lengthSq()>0?_dn:null;
}
function slamFx(p,n,big){
  const crack=new T.Mesh(new T.PlaneGeometry(big?7:4.5,big?7:4.5),new T.MeshBasicMaterial({map:crackTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
  crack.position.copy(p).addScaledVector(n,0.05); crack.lookAt(_dv.copy(crack.position).add(n)); crack.rotation.z=Math.random()*TAU; world.add(crack);
  effects.push({t:0,dur:7,obj:crack,upd:(e,k)=>{ crack.material.opacity=k<0.7?1:1-(k-0.7)/0.3; },done:()=>{ crack.geometry.dispose(); crack.material.dispose(); }});
  const ring=new T.Mesh(new T.RingGeometry(0.6,1,40),new T.MeshBasicMaterial({color:0xffffff,transparent:true,side:T.DoubleSide,depthWrite:false}));
  ring.position.copy(p).addScaledVector(n,0.12); ring.lookAt(_dv.copy(ring.position).add(n)); world.add(ring);
  effects.push({t:0,dur:0.5,obj:ring,upd:(e,k)=>{ ring.scale.setScalar(1+k*(big?9:6)); ring.material.opacity=0.9*(1-k); },done:()=>{ ring.geometry.dispose(); ring.material.dispose(); }});
  for(let i=0;i<10;i++){ const q=p.clone().addScaledVector(n,0.3).add(new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(1.2)); puff(q,0xe6e8ec); }
  sfx('slam',p.clone(),{v:big?1:0.7});
}
function shatter(t){
  const g=t.ch.g; g.visible=false; const c=t.death.c, n=30;
  for(let i=0;i<n;i++){ const m=new T.Mesh(shardGeo,shardMats[i%4].clone()); m.position.copy(c).add(new V(rnd(-0.35,0.35),rnd(-0.9,0.9),rnd(-0.2,0.2)).applyQuaternion(t.death.q)); world.add(m);
    const v=new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(rnd(2,8)), s=rnd(0.8,1.8), w=new V(rnd(-8,8),rnd(-8,8),rnd(-8,8));
    effects.push({t:0,dur:rnd(0.8,1.4),obj:m,upd:(e,k,dt)=>{ m.position.addScaledVector(v,dt); v.multiplyScalar(Math.exp(-1.5*dt)); m.rotation.x+=w.x*dt; m.rotation.y+=w.y*dt; m.scale.setScalar(s*(1-k)); m.material.opacity=1-k*k; },done:()=>m.material.dispose()}); }
  sfx('shatter',c.clone());
}
function deathPose(e,g,c,dt){
  const d=e.death; if(!d){ g.visible=false; return; }
  d.t+=dt; e.deadT=d.t;
  if(!d.stuck){
    _dq.setFromEuler(new T.Euler(d.av.x*dt,d.av.y*dt,d.av.z*dt)); d.q.premultiply(_dq); d.av.multiplyScalar(Math.exp(-(d.kind==='shot'?0.6:0.2)*dt));
    const n=deathMove(d,dt);
    if(n){ const hard=d.vel.length()>12||(d.kind!=='shot'&&d.kind!=='burn'&&d.kind!=='ice');
      if(hard){ // splat: back to the surface, arms and legs flung wide
        d.stuck={n:n.clone(),t:0}; d.vel.set(0,0,0); d.q.setFromUnitVectors(BACK,_dv.copy(n).negate()); d.q.premultiply(_dq.setFromAxisAngle(n,Math.random()*TAU));
        d.c.addScaledVector(n,0.25); d.shatterAt=d.t+1.6; slamFx(_dv.copy(d.c).addScaledVector(n,-0.3),n,d.kind!=='pickaxe');
        if(e===player||e.pos.distanceTo(camera.position)<25) camShake=Math.max(camShake,e===player?1.2:0.4); }
      else { d.vel.addScaledVector(n,-1.6*d.vel.dot(n)); d.vel.multiplyScalar(0.5); }
    }
  } else d.stuck.t+=dt;
  // pose: limp for gunshots, spread-eagle for everything else (blend toward the T-pose clip)
  d.spread=d.kind==='ice'?0:Math.min(d.kind==='shot'||d.kind==='burn'?0.45:1,d.spread+dt*(d.stuck?8:3));
  // blown up or burned: the body smoulders until it breaks apart
  if((d.kind==='explosion'||d.kind==='burn')&&g.visible){ d.fx+=dt; if(d.fx>0.06){ d.fx=0; flame(_dv.copy(d.c).add(new V(rnd(-0.4,0.4),rnd(-0.7,0.7),rnd(-0.4,0.4))),rnd(0.5,0.9),rnd(0.35,0.6),new V(rnd(-0.5,0.5),rnd(1,2.5),rnd(-0.5,0.5))); } }
  const W=c.w; W.TPose=d.spread; W.Idle=(1-d.spread); W.Walk=W.Run=0; for(const k in c.act) c.act[k].setEffectiveWeight(W[k]);
  c.mixer.update(d.kind==='ice'?0:d.t<0.3?dt*0.3:0); // frozen bodies keep the pose they froze in
  // squash against the wall right after the hit
  const s=d.stuck?Math.exp(-d.stuck.t*7)*Math.sin(Math.min(1,d.stuck.t*12)*Math.PI):0; c.spin.scale.set(1+0.3*s,1+0.15*s,1-0.55*s);
  g.quaternion.copy(d.q); _pc.set(0,1,0).applyQuaternion(d.q); g.position.copy(d.c).sub(_pc);
  e.pos.copy(d.c).y-=1;
  g.updateMatrixWorld(true); poseBlend(c,dt); poseStore(c);
  if(d.props) for(const [o,h,rel] of d.props) propPlace(o,h,rel);
  if(d.t>=d.shatterAt&&g.visible) shatter(e);
}
const _qm=new T.Quaternion();
// ---- potions in hand: chugged with the head thrown back, a gulp at a time, then an "ahh" shake (the big one
// ends with a wipe of the mouth)
const CONS_S={mini:0.62,big:0.55};
function setConsHeld(c,id){ if(!c.consG) return; id=id||'';
  if(c.consId!==id){ c.consId=id; while(c.consG.children.length) c.consG.remove(c.consG.children[0]); if(id){ const m=makeConsModel(id); m.scale.setScalar(CONS_S[id]); m.traverse((o:any)=>{ if(o.isMesh) o.castShadow=true; }); c.consG.add(m); } }
  c.consG.visible=!!id; }
function healFx(p,col,n,spd){ for(let i=0;i<n;i++){ const mat=new T.MeshBasicMaterial({color:col,transparent:true,opacity:0.95,depthWrite:false}), m=new T.Mesh(GEO.puff,mat), v=new V(rnd(-1,1),rnd(0.4,1.4),rnd(-1,1)).multiplyScalar(spd);
  m.position.copy(p); world.add(m); effects.push({t:0,dur:rnd(0.45,0.8),obj:m,upd:(e,k,dt)=>{ m.position.addScaledVector(v,dt); m.scale.setScalar(0.32*Math.sin(Math.min(1,k*1.4)*Math.PI)+0.02); mat.opacity=0.95*(1-k*k); },done:()=>mat.dispose()}); } }
const _cq=new T.Quaternion(), _cm=new T.Matrix4();
// place the item: world position p, its up axis along y, its x axis roughly along x
function consPlace(c,p,y,x){ const g=c.g; y=y.clone().normalize(); const z=new V().crossVectors(x,y).normalize(); x=new V().crossVectors(y,z);
  _cm.makeBasis(x,y,z); _cq.setFromRotationMatrix(_cm); g.getWorldQuaternion(_qP); c.consG.quaternion.copy(_qP.invert().multiply(_cq)); c.consG.position.copy(g.worldToLocal(p.clone())); }
function consPose(e,c,id,k,rightB,fwdB,upB,dt){
  const B=c.bones, A=e.anim, w=o=>o.getWorldPosition(new V()), dur=CONS[id].time, near=e===player||e.pos.distanceTo(camera.position)<30, at=e===player?null:e.pos;
  const rS=w(B.RightArm), lS=w(B.LeftArm), head=w(B.Head), mouth=head.clone().addScaledVector(upB,0.05).addScaledVector(fwdB,0.12), chest=w(B.Spine2).addScaledVector(fwdB,0.2);
  const poleR=rS.clone().addScaledVector(rightB,0.5).addScaledVector(upB,-0.6).addScaledVector(fwdB,-0.2), poleL=lS.clone().addScaledVector(rightB,-0.5).addScaledVector(upB,-0.6).addScaledVector(fwdB,-0.2);
  const ik=(sd,t,pole)=>solveIK(B[sd+'Arm'],B[sd+'ForeArm'],B[sd+'Hand'],t,pole);
  const bell=(a,b)=>k<a||k>b?0:Math.sin((k-a)/(b-a)*Math.PI);
  // holding it ready: potions shown off at chest height, the kit and the roll at the belly
  const idle=chest.clone().addScaledVector(rightB,0.17).addScaledVector(upB,-0.14).addScaledVector(fwdB,0.08).addScaledVector(upB,0.015*Math.sin(matchTime*2.4+e.walkT));
  const tick=(key,period)=>{ const n=Math.floor(k*dur/period); if(A[key]!==n){ const first=A[key]==null||A[key]>n; A[key]=n; return !first; } return false; };
  {
    const big=id==='big', u=Math.max(0,k), ka=k<0?0:smooth(0,0.14,k), kl=smooth(0.82,0.94,u), dr=ka*(1-kl), prog=clamp((u-0.14)/0.68,0,1);
    const nd=fwdB.clone().negate().addScaledVector(upB,-0.15-0.95*prog).normalize(), gq=k>=0?Math.sin(u*dur*TAU*2.2):0;
    const drinkP=mouth.clone().addScaledVector(nd,-(big?0.2:0.16)).addScaledVector(nd,0.015*gq), pos=idle.clone().lerp(drinkP,dr);
    const yAx=upB.clone().lerp(nd,dr).normalize();
    consPlace(c,pos,yAx,rightB);
    // head back, a nod with every gulp, then a happy shake
    rotateBoneWorld(B.Neck,rightB,(0.42+(big?0.15:0))*dr*(0.6+0.4*prog)+0.06*gq*dr); rotateBoneWorld(B.Spine1,rightB,(big?0.22:0.1)*dr);
    const shake=bell(0.84,1); if(shake) rotateBoneWorld(B.Neck,upB,0.28*shake*Math.sin(u*dur*42));
    const hold=pos.clone().addScaledVector(rightB,0.075).addScaledVector(yAx,-0.04);
    ik('Right',hold,poleR); poseHand(B,'Right',fwdB.clone().addScaledVector(rightB,-0.3),rightB.clone().negate(),0.9);
    if(big&&k>=0){ const bot=pos.clone().addScaledVector(yAx,-0.17).addScaledVector(rightB,-0.03), wipe=bell(0.86,0.98);
      const lt=wipe?mouth.clone().addScaledVector(fwdB,0.06).addScaledVector(upB,-0.05).addScaledVector(rightB,lerp(-0.14,0.14,clamp((u-0.86)/0.12,0,1))):bot.clone().addScaledVector(rightB,-0.04).addScaledVector(upB,-0.04);
      const lw=Math.max(dr,wipe); if(lw>0.01){ const natL=w(B.LeftHand); ik('Left',natL.lerp(lt,lw),poleL); poseHand(B,'Left',wipe?rightB:rightB.clone().addScaledVector(fwdB,0.4),wipe?fwdB.clone().negate():yAx,0.5); } }
    if(k>=0&&dr>0.5&&near&&tick('gulpN',1/2.2)){ sfx('gulp',at); healFx(mouth.clone().addScaledVector(fwdB,0.08),CONS[id].color,2,1.2); }
  }
}
// breaststroke hand path for zero-g swimming, as [out, up, forward] from the shoulder over one stroke
// (glide with the arms out in front, sweep wide, pull in under the chest, then shoot forward again)
const ZG_STROKE=[[0,0.16,0.42,0.34],[0.18,0.14,0.5,0.3],[0.42,0.52,0.28,0.14],[0.6,0.36,-0.12,0.1],[0.76,0.12,-0.08,0.26],[0.9,0.12,0.22,0.36]];
// front crawl hand path [out, up, forward]: reach overhead, catch, pull under the chest, push past the hip, recover high
const FREESTYLE=[[0,0.1,0.62,0.18],[0.14,0.14,0.52,0.32],[0.34,0.04,0.12,0.36],[0.54,0.16,-0.42,0.14],[0.68,0.24,-0.4,-0.06],[0.84,0.34,0.14,-0.22]];
// a closed Catmull-Rom loop through timed keys, so the hand flows through every point without stopping
function loopPath(K,u){ const n=K.length; let i=n-1; for(let j=0;j<n;j++) if(u>=K[j][0]) i=j;
  const t0=K[i][0], t1=i+1<n?K[i+1][0]:1, k=clamp((u-t0)/(t1-t0),0,1), a=K[(i+n-1)%n], b=K[i], c=K[(i+1)%n], d=K[(i+2)%n], k2=k*k, k3=k2*k;
  return [1,2,3].map(j=>0.5*(2*b[j]+(c[j]-a[j])*k+(2*a[j]-5*b[j]+4*c[j]-d[j])*k2+(3*b[j]-a[j]-3*c[j]+d[j])*k3)); }
function zgStroke(u){ return loopPath(ZG_STROKE,u); }
// breaststroke legs: the knees draw up while the arms pull, kick out hard as the arms shoot forward, then glide
const frogK=u=>u<0.3?0:u<0.7?smooth(0.3,0.7,u):u<0.84?1-smooth(0.7,0.84,u):0;
// ---- with 100 players, only draw the characters the camera can see: far ones drop their gear and gun, and only close ones cast shadows
const _frus=new T.Frustum(), _pv=new T.Matrix4(), _csph=new T.Sphere(new V(),2.6);
const SHADOW_D=45, GEAR_D=80;
function charShadow(c,on){ const k=(on?'1':'0')+c.heldKey+c.consId+(c.gear?c.gear.length:0); if(c.shadK===k) return; c.shadK=k;
  const f=(o:any)=>{ if(o.isMesh) o.castShadow=on; }; c.spin.traverse(f); c.gunMount.traverse(f); c.consG.traverse(f); }
function cullChars(){ if(!combatants) return;
  camera.updateMatrixWorld(); _pv.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse); _frus.setFromProjectionMatrix(_pv);
  for(const e of combatants){ const c=e.ch; if(!c||!c.glb) continue;
    _csph.center.set(e.pos.x,e.pos.y+1,e.pos.z); const d=_csph.center.distanceTo(camera.position);
    const see=e===player||_frus.intersectsSphere(_csph), far=d>GEAR_D&&e!==player;
    c.inView=see; c.spin.visible=see&&!(e===player&&bv(e,'hide')); c.gunMount.visible=see&&!far;
    if(c.gear&&c.gearFar!==far){ c.gearFar=far; for(const w of c.gear) w.visible=!far; }
    charShadow(c,see&&(e===player||d<SHADOW_D)); }
}
// ---- [S1] inertial pose blend (inertialization: what Unreal's Inertialization node does, after Bollo, GDC 2018).
// When what drives the body changes, the jump between the last shown pose and the new one is kept as a per-joint
// offset that dies away on a quintic curve which starts with the joints' own velocity, so nothing pops or hitches.
// Every stream may call poseSnap.
//   poseSnap(c,dur)  what drives the body just changed: fade from the last stored pose into the new one over dur s.
//                    No-op until a pose has been stored; called again before the blend starts, the longer dur wins
//   poseBlend(c,dt)  apply that fade to this frame's pose (animPost, after every layer); held props follow the hands
//   poseStore(c)     remember this frame's final pose (animPost, last)
const _blq=new T.Quaternion(), _blq2=new T.Quaternion(), _blv=new V(), _blvS=new V(), _blmA=new T.Matrix4(), _blmB=new T.Matrix4();
function blBones(c){ return c.blB||(c.blB=Object.values(c.bones)); } // every joint, fingers too, in a fixed order
function poseStore(c){ const bs=blBones(c), n=bs.length;
  if(!c.blLast){ c.blLast=new Float32Array(n*4); c.blPrev=new Float32Array(n*4); }
  const P=c.blPrev; c.blPrev=c.blLast; c.blLast=P; // last becomes prev; this frame overwrites the old prev
  for(let i=0;i<n;i++) bs[i].quaternion.toArray(P,i*4);
  if(!c.blHave){ c.blPrev.set(P); c.blHave=true; }
  c.blDtL=c.blFDt||0; c.blFDt=0; }
function poseSnap(c,dur){ if(!c||!c.blHave) return;
  if(c.blNew){ c.blD=Math.max(c.blD,dur); return; }
  const n=c.blLast.length; if(!c.blSrc){ c.blSrc=new Float32Array(n); c.blSrcP=new Float32Array(n); }
  c.blSrc.set(c.blLast); c.blSrcP.set(c.blPrev); c.blSrcDt=c.blDtL; c.blNew=true; c.blD=dur; c.blT=0; }
// the offset left after t seconds: x0 at t=0 moving at v0 (<=0, toward the new pose), 0 with no velocity at t1
function inertX(x0,v0,t,t1){ if(t>=t1) return 0; const t2=t1*t1, a0=Math.max(0,(-8*v0*t1-20*x0)/t2);
  const A=-(a0*t2+6*v0*t1+12*x0)/(2*t2*t2*t1), B=(3*a0*t2+16*v0*t1+30*x0)/(2*t2*t2), C=-(3*a0*t2+12*v0*t1+20*x0)/(2*t2*t1);
  return Math.max(0,((((A*t+B)*t+C)*t+a0*0.5)*t+v0)*t+x0); }
// the axis-angle of q (shortest way round) into o[i*3..], returns the angle
function qAxis(q,o,i){ if(q.w<0){ q.x=-q.x; q.y=-q.y; q.z=-q.z; q.w=-q.w; } const s=Math.sqrt(q.x*q.x+q.y*q.y+q.z*q.z); if(s<1e-7) return 0;
  o[i]=q.x/s; o[i+1]=q.y/s; o[i+2]=q.z/s; return 2*Math.atan2(s,q.w); }
function poseBlend(c,dt){ c.blFDt=dt; if(!c.blNew&&!(c.blT<c.blD)) return;
  const bs=blBones(c), n=bs.length; c.model.updateMatrixWorld(true); blPropsGrab(c);
  if(c.blNew){ c.blNew=false; if(!c.blAx){ c.blAx=new Float32Array(n*3); c.blX=new Float32Array(n*3); c.blW=new Float32Array(3); }
    const S=c.blSrc, SP=c.blSrcP, sd=c.blSrcDt, okV=sd>1e-4&&sd<0.08, X=c.blX, W=c.blW;
    for(let i=0;i<n;i++){ _blq.fromArray(S,i*4).multiply(_blq2.copy(bs[i].quaternion).invert()); // offset: new pose -> last shown pose
      const x0=qAxis(_blq,c.blAx,i*3); X[i*3]=x0; if(!(x0>1e-4)){ X[i*3]=0; continue; }
      let v0=0; if(okV){ _blq.fromArray(S,i*4).multiply(_blq2.fromArray(SP,i*4).invert()); const a=qAxis(_blq,W,0); // how the joint was turning
        if(a>1e-5) v0=clamp(a/sd*(W[0]*c.blAx[i*3]+W[1]*c.blAx[i*3+1]+W[2]*c.blAx[i*3+2]),-25,0); } // only the part heading toward the new pose
      X[i*3+1]=v0; X[i*3+2]=v0<0?Math.min(c.blD,-5*x0/v0):c.blD; } }
  c.blT+=dt; const t=c.blT, X=c.blX;
  for(let i=0;i<n;i++){ const x0=X[i*3]; if(!x0) continue; const x=inertX(x0,X[i*3+1],t,X[i*3+2]); if(x<1e-5) continue;
    bs[i].quaternion.premultiply(_blq.setFromAxisAngle(_blv.fromArray(c.blAx,i*3),x)); }
  c.model.updateMatrixWorld(true); blPropsFollow(c); }
// props held in a hand ride along with it while the blend moves the hand: [prop, hand bone] pairs that are in a hand
// this frame (the gun only when the arms were posed onto it; the Death Note book lives in the world)
function blPropList(c){ const L=c.blPL||(c.blPL=[]); L.length=0; if(c.lcDead) return L;
  if(c.lcGunIK&&c.held) L.push(c.gunMount,'RightHand'); if(c.pick.visible) L.push(c.pick,'RightHand'); if(c.pickL&&c.pickL.visible) L.push(c.pickL,'LeftHand');
  if(c.consG.visible) L.push(c.consG,'RightHand'); if(c.handG&&c.handG.visible) L.push(c.handG,'RightHand'); if(c.lcBook&&c.lcBook.visible) L.push(c.lcBook,'LeftHand');
  return L; }
// world transform of a prop from its local one (its matrixWorld may be stale: the layers only set position/quaternion)
function propWorld(o,m){ return m.compose(o.position,o.quaternion,o.scale).premultiply(o.parent.matrixWorld); }
function propRel(o,hand,m){ return m.copy(hand.matrixWorld).invert().multiply(propWorld(o,_blmA)); }
function propPlace(o,hand,rel){ _blmA.multiplyMatrices(hand.matrixWorld,rel); _blmB.copy(o.parent.matrixWorld).invert().multiply(_blmA); _blmB.decompose(o.position,o.quaternion,_blvS); }
function blPropsGrab(c){ const L=blPropList(c), R=c.blRel||(c.blRel=[]); for(let i=0;i<L.length;i+=2) propRel(L[i],c.bones[L[i+1]],R[i>>1]||(R[i>>1]=new T.Matrix4())); }
function blPropsFollow(c){ const L=c.blPL, R=c.blRel; for(let i=0;i<L.length;i+=2) propPlace(L[i],c.bones[L[i+1]],R[i>>1]); }
// Per character, per frame. Each layer below is owned by one stream: [S0] shared scaffold, [S1] locomotion and body,
// [S2] zero-g and the gravity flip, [S3] combat, [S4] emotes, hero and camera. They share one context object X (animCtx),
// run in this order, and each stream edits only its own layers.
function animateGLB(e,dt){
  const c=e.ch, g=c.g; g.position.copy(e.pos); g.rotation.y=e.emote?e.emote.yaw:e.yaw; g.scale.setScalar((e.titanS||1)*(e.tinyT>0?0.45:1));
  const a=1-Math.exp(-14*dt), aS=1-Math.exp(-7*dt);
  if(!e.alive){ c.flash.visible=false; deathPose(e,g,c,dt); return; }
  c.lcDead=false;
  if(lockedUp(e)){ c.flash.visible=false; placeAboutMiddle(e,g); c.lcLock=true;
    if(e.stun>0&&!(e.frozen>0)){ const j=0.045*Math.min(1,e.stun*2); g.position.x+=rnd(-j,j); g.position.y+=rnd(-j,j); g.position.z+=rnd(-j,j); } return; }
  if(c.lcLock){ c.lcLock=false; if(c.blHave){ c.blPrev.set(c.blLast); c.blDtL=0; } poseSnap(c,0.3); } // thawed or shaken off the stun: ease out of the held pose (it was still)
  g.visible=!(e.isPlayer&&ads&&isScoped());
  if(!e.isPlayer){ const cd=e.pos.distanceTo(camera.position);
    if(cd>45||c.inView===false){ e.animAcc=(e.animAcc||0)+dt; if(e.animAcc<(c.inView===false?0.3:cd>140?0.2:cd>80?0.1:0.05)){ placeAboutMiddle(e,g); return; } /* keep the tilt/roll offset between poses, or the body jumps */ dt=e.animAcc; e.animAcc=0; } } // off screen or far away: pose less often
  const X=animCtx(e,dt,a,aS);   // [S0] motion, what is in hand, shared inputs (X.dt is the throttled dt; a and aS come from the frame's dt)
  animClips(e,X);               // [S1] clip weights and time scales, X.near, mixer.update
  swayGear(e,c,X.s+(e.onGround?0:Math.hypot(e.vel.x,e.vel.z)*0.3),X.dt); // [S4] capes and gear
  bodyPose(e,g,c,a,X.dt,X);     // [S2] zero-g tilt, ceiling roll and bank
  animAxes(X);                  // [S0] body axes X.rightB/fwdB/upB
  animLegs(e,X);                // [S1] crouch and landing squash: plant the feet, drop the body
  animZG(e,X);                  // [S2] zero-g bob, squash and stretch
  g.updateMatrixWorld(true);
  animFeet(e,X);                // [S1] foot IK back onto the planted feet
  if(X.near&&!animZGLegs(e,X)) animLegPose(e,X); // [S2] bouncer and zero-g legs, else [S1] jump and sprint legs
  animTorso(e,X);               // [S1] strafe twist, crouch and sprint lean, aim pitch
  animCombatTorso(e,X);         // [S3] rifle stance
  animHit(e,X);                 // [S1] flinch when hit
  animSwingTorso(e,X);          // [S3] pickaxe swing twist and lean
  animArms(e,X);                // [S0] the hands: one arm layer per frame
  applyArmOverrides(e,X);       // [S0] X.armOv pulls a hand toward a target on top of that layer
  animProps(e,X);               // [S3] moving parts of the held gun
  animPost(e,X);                // [S1] pose blend, then store the final pose
  animHitboxes(e,X);            // [S0] hitboxes follow the skeleton
}
// [S0] the frame's shared context X: motion, what is in hand, smoothing rates, aim pitch. Later layers add to it
// (near, s, back, body axes, cr, crE, feet, busy, branch); writes to anim fields stay in e.anim, not X
function animCtx(e,dt,a,aS){
  const c=e.ch, A=e.anim, B=c.bones, g=c.g;
  const {fx,fz,fwd,side,speed}=motionState(e,dt);
  let held=null, pickaxe=false;
  if(e.isPlayer){ const it=curItem(); if(it&&it.kind==='gun') held=it; else if(!it) pickaxe=true; }
  else held=e.gun;
  // a potion in hand: k<0 just holding it, 0..1 how far through drinking it
  let cons=null, useK=-1;
  if(e.isPlayer){ const it=curItem(); if(it&&it.kind==='cons'){ cons=it.id; if(e.consuming&&e.consuming.it===it) useK=e.consuming.t/e.consuming.dur; } }
  else if(e.healT>0){ cons='big'; useK=clamp(1-e.healT/2.5,0,1); held=null; }
  if(e.emote){ held=null; pickaxe=false; cons=null; } // [S4] an emote puts everything away
  setHeld(e,held); setConsHeld(c,cons);
  D(A,'crouch',e.crouch?1:0,a*0.7); D(A,'air',!e.onGround&&!e.zgFloat?1:0,a);
  const X:any={e,dt,a,aS,c,A,B,g,fx,fz,fwd,side,speed,held,pickaxe,cons,useK,armOv:{}};
  animCombatState(e,X); // [S3]
  X.pitch=e.isPlayer?e.pitch:(e.aimPitch||0); X.sp=A.sprPose; X.pE=X.pitch*(1-X.sp);
  return X;
}
// [S3] combat timers and the sprint carry: recoil settles, the muzzle flash and the pump run out, and a gun nobody is
// aiming drops into the low sprint carry (A.sprPose)
function animCombatState(e,X){ const {c,A,held,dt,aS}=X;
  A.recoil=Math.max(0,A.recoil-dt*8); A.flash-=dt; c.flash.visible=A.flash>0; A.pumpT+=dt;
  const aiming=X.aiming=e.isPlayer?(ads||mouse.l||!!e.reloading):(A.recoil>0.05||!!e.enemy);
  D(A,'sprPose',held&&!aiming?A.sprint:0,aS);
}
// [S1] clip blending (the soldier ships with Idle, Walk, Run and T-pose; everything else is layered on top)
function animClips(e,X){ const {c,A,fwd,speed,aS,dt}=X;
  const s=X.s=e.onGround?speed:0, back=X.back=fwd<-0.5?-1:1;
  const wRun=smooth(3.5,6.5,s), wWalk=smooth(0.3,2,s)*(1-wRun), wT=0;
  const wIdle=Math.max(0,1-wRun-wWalk-wT), W=c.w;
  D(W,'Idle',wIdle,aS); D(W,'Walk',wWalk,aS); D(W,'Run',wRun,aS); D(W,'TPose',wT,aS);
  for(const n in c.act) c.act[n].setEffectiveWeight(W[n]);
  c.act.Walk.setEffectiveTimeScale(back*clamp(s/1.8,0.7,1.6)); c.act.Run.setEffectiveTimeScale(back*clamp(s/(5.5+1.2*A.sprint),0.8,2.15)); // sprinting takes longer strides instead of faster steps
  // near: every procedural layer runs. Hysteresis (in under 50 m, out past 56 m) so bots on the edge do not flicker,
  // and a long blend across the switch
  const nr=!player||e===player||e.pos.distanceTo(camera.position)<(c.lcNear?56:50);
  if(c.lcNear!==undefined&&nr!==c.lcNear) poseSnap(c,0.4); c.lcNear=nr; X.near=nr;
  c.mixer.update(dt);
}
// [S0] body-relative axes (they follow the swim tilt and the roll onto the ceiling)
function animAxes(X){ const {c,g}=X;
  c.model.position.y=0; g.updateMatrixWorld(true);
  c.model.getWorldQuaternion(_qm);
  X.rightB=new V(1,0,0).applyQuaternion(_qm); X.fwdB=new V(0,0,-1).applyQuaternion(_qm); X.upB=new V(0,1,0).applyQuaternion(_qm);
  X.right=X.rightB; X.fwdV=X.fwdB; // body axes, so poses still work rolled onto the ceiling
}
// [S0] swing a leg: th at the hip, kn at the knee, both about the body's right axis
function bend(X,sd,th,kn){ rotateBoneWorld(X.B[sd+'UpLeg'],X.rightB,th); rotateBoneWorld(X.B[sd+'Leg'],X.rightB,kn); }
// [S1] legs: crouch and the squash after a landing lower the body while IK keeps the feet planted (animFeet)
function animLegs(e,X){ const {c,A,B,near,upB}=X;
  const cr=X.cr=A.crouch, crE=X.crE=Math.max(cr,e.onGround?A.land*0.75:0);
  let feet=null;
  if(near&&crE>0.01){ feet=[B.LeftFoot.getWorldPosition(new V()),B.RightFoot.getWorldPosition(new V())]; if(A.air>0.5){ feet[0].addScaledVector(upB,0.25*A.air); feet[1].addScaledVector(upB,0.4*A.air); } }
  X.feet=feet;
  c.model.position.y=-0.48*crE;
}
// [S2] zero-g: a lazy bob while drifting, and cartoon squash and stretch: long on the kick, squashed on the tuck
function animZG(e,X){ const {c,A,dt}=X;
  let sqY=1;
  if(e.zgFloat){ const kz=1-Math.exp(-8*dt); D(A,'zgP',e.zgPropel?1:0,kz); D(A,'zgS',e.zgPropel?0:smooth(1.5,7,e.vel.length()),1-Math.exp(-4*dt));
    A.zgT=(A.zgT||e.walkT)+dt*lerp(3.2,13,A.zgP); A.zgB=((A.zgB||0)+dt*(0.4+0.5*A.zgS))%1; A.zgI=(A.zgI||e.walkT*3)+dt; A.zgF=((A.zgF||0)+dt*0.95)%1;
    const P=A.zgP, Sw=A.zgS*(1-P), I=(1-P)*(1-A.zgS), u=A.zgB;
    c.model.position.y+=I*0.05*Math.sin(A.zgI*1.2)+Sw*0.06*(frogK(u)-0.5); // drifting bobs gently; each kick surges the body forward
    sqY=1+I*0.008*Math.sin(A.zgI*1.2+1); }
  else if(A.zgP){ A.zgP=0; A.zgS=0; }
  c.spin.scale.set(1/Math.sqrt(sqY),sqY,1/Math.sqrt(sqY)); c.spin.position.y+=1-sqY; // squash about the middle of the body
}
// [S1] foot IK: the feet go back where animLegs planted them
function animFeet(e,X){ const {B,feet,fwdV,upB}=X;
  if(feet){ for(const [i,sd] of [[0,'Left'],[1,'Right']]){ const hip=B[sd+'UpLeg'].getWorldPosition(new V()); const pole=hip.clone().addScaledVector(fwdV,1.2).addScaledVector(upB,-0.4); solveIK(B[sd+'UpLeg'],B[sd+'Leg'],B[sd+'Foot'],feet[i],pole); } }
}
// [S2] the legs inside the bouncer ball and in zero-g. Returns true when it posed the legs (the jump and sprint legs then stay off)
function animZGLegs(e,X){ const {A,B,rightB,upB,fwdB}=X;
  if(e.bounceT>0){ bend(X,'Left',1.7,-2.3); bend(X,'Right',1.6,-2.2); rotateBoneWorld(B.Spine1,rightB,0.35); rotateBoneWorld(B.Neck,rightB,0.4); return true; }
  if(e.zgFloat){
    // three ways to move in zero-g, blended: drifting (a lazy bicycle with the knees falling apart), swimming
    // (a big frog kick timed to the arm stroke) and propelling (legs pedal like a cartoon character running on air)
    const P=A.zgP, Sw=A.zgS*(1-P), I=(1-P)*(1-A.zgS), u=A.zgB, tI=A.zgI;
    // sprinting: a quick flutter kick from the hips with loose knees, three kicks to every arm stroke
    const frog=frogK(u), glide=u>=0.84||u<0.12?1:0, fl=TAU*3*(A.zgF||0);
    for(const [sd,off,sx] of [['Left',0,-1],['Right',Math.PI,1]] as [string,number,number][]){ const ti=tI*0.9+off, tf=fl+off;
      const th=I*(0.3+0.22*Math.sin(ti))+Sw*(0.05+1.05*frog)+P*(0.1+0.26*Math.sin(tf));
      const kn=I*(0.5+0.3*(Math.sin(ti+1.1)+1)/2)+Sw*(0.1+1.7*frog)+P*(0.18+0.38*Math.max(0,Math.sin(tf+1.2)));
      bend(X,sd,th,-kn); rotateBoneWorld(B[sd+'UpLeg'],fwdB,-sx*(I*(0.14+0.05*Math.sin(ti*0.7))+Sw*0.5*frog)); }
    const roll=Math.sin(TAU*((A.zgF||0)+0.12)); // the body rolls toward the arm that is pulling
    rotateBoneWorld(B.Spine1,upB,0.32*P*roll); rotateBoneWorld(B.Hips,upB,-0.12*P*roll);
    rotateBoneWorld(B.Neck,rightB,0.4*P+0.3*Sw+(e.zgTx||0)*-0.3); rotateBoneWorld(B.Neck,upB,0.25*I*Math.sin(tI*0.4)-0.2*P*roll);
    rotateBoneWorld(B.Hips,fwdB,0.08*I*Math.sin(tI*0.7)); rotateBoneWorld(B.Spine1,rightB,0.07*I*Math.sin(tI*0.9)-0.14*Sw*frog+0.06*Sw*glide);
    return true; }
  return false;
}
// [S1] jump and sprint legs (near only; animZGLegs goes first)
function animLegPose(e,X){ const {A,B,rightB,fwdB,held,pickaxe,cr,dt}=X;
  if(A.air>0.02){
    // jump: knees tuck on the way up, legs reach down for the landing, arms swing up then out for balance
    const up=clamp(e.vel.y/10.5,-1,1), tk=smooth(-0.5,0.6,up)*A.air;
    bend(X,'Left',0.35*A.air+0.95*tk,-(0.35*A.air+1.35*tk)); bend(X,'Right',0.12*A.air+0.5*tk,-(0.55*A.air+0.95*tk));
    if(!held&&!(pickaxe&&e.swingT>0)){ const lift=tk*1.9+A.air*0.25, out=Math.max(0,A.air-tk)*0.85;
      rotateBoneWorld(B.LeftArm,rightB,lift); rotateBoneWorld(B.RightArm,rightB,lift); rotateBoneWorld(B.LeftArm,fwdB,out); rotateBoneWorld(B.RightArm,fwdB,-out); }
  } else if(e.onGround&&A.sprint>0.02){
    // sprint: on top of the run clip, a longer stride and a high knee on whichever leg is swinging through
    const sp=A.sprint*(1-cr), d=B.LeftFoot.getWorldPosition(new V()).sub(B.RightFoot.getWorldPosition(new V())).dot(fwdB), dn=clamp(d/0.5,-1,1);
    const vd=(dn-(A.dn==null?dn:A.dn))/Math.max(dt,1e-3); A.dn=dn; D(A,'swingL',clamp(vd*0.35,-1,1),1-Math.exp(-18*dt));
    const lift=1-Math.abs(dn)*0.6;
    bend(X,'Left',0.32*dn*sp+0.25*sp*Math.max(0,A.swingL),-1.0*sp*Math.max(0,A.swingL)*lift); bend(X,'Right',-0.32*dn*sp+0.25*sp*Math.max(0,-A.swingL),-1.0*sp*Math.max(0,-A.swingL)*lift);
  }
}
// [S1] upper body: strafe twist, crouch and sprint lean, aim pitch (the flinch is animHit)
function animTorso(e,X){ const {A,B,near,upB,right,speed,side,fwd,back,aS,cr,held,s,pitch,pE}=X;
  const twist=speed>1.2?clamp(Math.atan2(side,Math.abs(fwd))*back,-0.85,0.85):0; D(A,'twist',twist,aS);
  if(near){ rotateBoneWorld(B.Hips,upB,A.twist); rotateBoneWorld(B.Spine,upB,-A.twist*0.5); rotateBoneWorld(B.Spine1,upB,-A.twist*0.5); }
  if(near){ const lean=-0.28*cr-(held?0.06:0)*Math.min(1,s/4)-0.34*A.sprint; rotateBoneWorld(B.Spine,right,lean); if(A.sprint>0.01) rotateBoneWorld(B.Neck,right,0.2*A.sprint); // lean into a sprint, eyes up
    if(held){ for(const n of ['Spine','Spine1','Spine2']) rotateBoneWorld(B[n],right,pE/3); } else rotateBoneWorld(B.Neck,right,pitch*0.5); }
}
// [S3] rifle stance: the chest turns a little toward the gun side so the left hand can reach under the barrel, eyes stay on target
function animCombatTorso(e,X){ const {A,B,near,upB,held,sp,aS}=X; if(!near) return;
  D(A,'stance',held?1-sp:0,aS); if(A.stance>0.01){ const st=A.stance*(held&&held.id==='pistol'?0.5:held&&held.id==='mf'?0.1:1);
    rotateBoneWorld(B.Spine1,upB,-0.24*st); rotateBoneWorld(B.Spine2,upB,-0.16*st); rotateBoneWorld(B.Neck,upB,0.4*st); if(B.LeftShoulder) rotateBoneWorld(B.LeftShoulder,upB,-0.25*st); }
}
// [S1] flinch when hit
function animHit(e,X){ const {A,B,near,right}=X; if(!near) return;
  if(A.hit>0.01){ rotateBoneWorld(B.Spine1,right,0.32*A.hit); rotateBoneWorld(B.Neck,right,0.25*A.hit); }
}
// [S3] the pickaxe swing twists and leans the chest
function animSwingTorso(e,X){ const {B,near,upB,right,pickaxe}=X; if(!near) return;
  if(pickaxe&&e.swingT>0){ const P=pickPose(e); rotateBoneWorld(B.Spine1,upB,P.tw); rotateBoneWorld(B.Spine2,upB,P.tw*0.5); rotateBoneWorld(B.Spine1,right,P.ln); }
}
// [S0] the hands: exactly one arm layer runs each frame, the first that applies in this order. When the layer, near,
// the held gun or the pickaxe changes, poseSnap lets S1's blend hide the switch.
function animArms(e,X){ const {c,A,B,near,held,pickaxe,cons,rightB,fwdB,upB}=X;
  X.busy=e.swingT>0||e.guardK>0.05;
  c.pick.visible=pickaxe&&!e.writing; if(c.pickL) c.pickL.visible=false; // it stays on the shoulder while you swim (the Death Note opens out of the hand to write)
  if(e.isPlayer) syncVest(e);
  let br=0;
  if(e.emote&&near){ br=1; emotePose(e,X); }                                            // [S4]
  else if(e.bounceT>0&&near){ br=2; bounceArms(e,X); }                                  // [S2]
  else if(e.throwA&&near){ br=3; throwPose(e,c,rightB,fwdB,upB); }                      // [S3]
  else if(cons&&near){ br=4; consPose(e,c,cons,X.useK,rightB,fwdB,upB,X.dt); }          // [S3]
  else if(near&&pickaxe&&e.fistSt&&!((A.zgP||0)>0.3&&!(e.punches&&e.punches.length))){ br=5; fistArms(e,B,rightB,upB,fwdB); } // [S3]
  else if(near&&pickaxe&&e.writing){ br=6; noteArms(e,B,rightB,upB,fwdB); }             // [S3]
  else if(near&&e.zgFloat&&!held&&!(pickaxe&&c.pick.visible)){ br=7; zgArms(e,X,['Left','Right']); } // [S2]
  else if(held){ br=8; gunArms(e,X); }                                                   // [S3] far bots too (the gun mount)
  else if(pickaxe&&near){ br=9; pickArms(e,X); }                                         // [S3]
  X.branch=br; const key=(near?1:0)+'|'+br+'|'+c.heldKey+'|'+(pickaxe?1:0); if(c.blKey!==key){ c.blKey=key; poseSnap(c,0.16); }
}
// [S2] hugging the knees inside the bouncer ball
function bounceArms(e,X){ const {B,rightB,upB,fwdB}=X;
  for(const sd of ['Left','Right']){ const k=B[sd+'Leg'].getWorldPosition(new V()).addScaledVector(fwdB,0.12), sh=B[sd+'Arm'].getWorldPosition(new V());
    solveIK(B[sd+'Arm'],B[sd+'ForeArm'],B[sd+'Hand'],k,sh.clone().addScaledVector(rightB,sd==='Left'?-0.5:0.5).addScaledVector(upB,-0.3)); }
}
// [S2] zero-g arms: drifting, they float out and wave like a jellyfish; swimming, a big breaststroke (reach, sweep
// wide, pull, tuck) on the same beat as the frog kick
// sprinting (propelling) is a front crawl: the arms take turns reaching overhead, pulling down under the body to
// the hip and swinging back over with the elbow high, while the body rolls from side to side with each pull
function zgArms(e,X,sides){ const A=e.anim, {B,rightB,upB,fwdB}=X; const P=A.zgP||0, Sw=A.zgS*(1-P), I=Math.max(0,1-Sw-P), u=A.zgB, tI=A.zgI;
  for(const sd of sides){ const sx=sd==='Right'?1:-1, ph=sx>0?0:1.7, sh=B[sd+'Arm'].getWorldPosition(new V());
    const st=zgStroke(u), fr=loopPath(FREESTYLE,((A.zgF||0)+(sx>0?0:0.5))%1);
    const out=I*(0.4+0.06*Math.sin(tI*0.9+ph))+Sw*st[0]+P*fr[0], up=I*(-0.2+0.1*Math.sin(tI*0.7+ph))+Sw*st[1]+P*fr[1], fw=I*(0.1+0.07*Math.sin(tI*0.55+ph))+Sw*st[2]+P*fr[2];
    const t=sh.clone().addScaledVector(rightB,sx*out).addScaledVector(upB,up).addScaledVector(fwdB,fw);
    const pole=sh.clone().addScaledVector(rightB,sx*0.6).addScaledVector(upB,0.05-0.05*P).addScaledVector(fwdB,-0.3-0.15*P);
    solveIK(B[sd+'Arm'],B[sd+'ForeArm'],B[sd+'Hand'],t,pole);
    rotateBoneWorld(B[sd+'Hand'],fwdB,sx*(0.3*I*Math.sin(tI*1.6+ph)+0.4*Sw*Math.sin(TAU*u))); } }
// [S3] a gun in hand: the mount is placed for everyone (far bots too), the arms reach for it only when near
function gunArms(e,X){ const {c,A,B,g,near,held,a,sp,pE,right,upB,fwdV}=X;
  const H=HOLD[held.id], S=c.gunMount.scale.x; D(A,'reload',(e.isPlayer?!!e.reloading:e.reloadT>0)?1:0,a);
  const sh=B.RightArm.getWorldPosition(new V()); g.worldToLocal(sh);
  const adsK=e.isPlayer&&ads?1:0, cp=Math.cos(pE), sn=Math.sin(pE), dk=Math.pow(1-A.draw,2);
  // sprinting carries the gun low and canted; switching weapons raises the new one into place
  const tp=e.isPlayer&&!adsK?1-sp:0; // third person: carry the gun out to the side so the camera can see it
  const o=new V(H.g[0]-S*H.r[0]-0.08*adsK-0.06*sp+0.16*tp,H.g[1]-S*H.r[1]+0.04*adsK-0.12*sp-0.35*dk+0.03*tp,H.g[2]-S*H.r[2]+A.recoil*0.09+0.06*sp);
  const oy=o.y*cp-o.z*sn, oz=o.y*sn+o.z*cp;
  const dn=(A.dn||0)*A.sprint; c.gunMount.position.set(sh.x+o.x,sh.y+oy+0.035*sp*(Math.abs(A.dn||0)-0.5),sh.z+oz); // the gun bobs and sways with the sprint stride
  c.gunMount.rotation.set(pE+A.recoil*0.22-0.45*A.reload-0.5*sp-1.0*dk,0.35*sp+0.1*dn,0.6*A.reload+0.45*sp+0.08*dn);
  if(near&&c.held){ c.gunMount.updateMatrixWorld(true);
    const rt=c.gunMount.localToWorld(new V(...H.r)), lt=c.gunMount.localToWorld(new V(...H.l));
    if(A.reload>0.05){ lt.lerp(c.gunMount.localToWorld(new V(0,-0.32,-0.05)),A.reload*(0.5+0.5*Math.sin(matchTime*8))); }
    const rS=B.RightArm.getWorldPosition(new V()), lS=B.LeftArm.getWorldPosition(new V());
    solveIK(B.RightArm,B.RightForeArm,B.RightHand,rt,rS.clone().addScaledVector(right,0.3).addScaledVector(upB,-0.8).addScaledVector(fwdV,-0.1));
    solveIK(B.LeftArm,B.LeftForeArm,B.LeftHand,lt,lS.clone().addScaledVector(right,-0.5).addScaledVector(upB,-0.7));
    // right hand wrapped round the grip, left hand palm up under the barrel
    const gq=c.gunMount.getWorldQuaternion(new T.Quaternion()), dir=a=>new V(...a).applyQuaternion(gq);
    poseHand(B,'Right',dir([-0.1,-0.1,-0.99]),dir([-1,0,0.1]),0.75);
    if(A.reload<0.5) poseHand(B,'Left',dir(H.lf||[0.45,0.1,-0.9]),dir(H.ln||[0,1,0]),0.55);
  }
}
// [S3] the pickaxe: resting on the right shoulder, or swung with both hands (dual blades: one in each hand)
function pickArms(e,X){ const {c,A,B,g,busy,cr,dt,rightB,upB,fwdB,right}=X;
  const P=pickPose(e), sh=B.RightArm.getWorldPosition(new V());
  const tgt=g.localToWorld(g.worldToLocal(sh.clone()).add(P.h));
  // sprinting: the left arm pumps while the pickaxe stays on the shoulder, riding up and down a little with the stride
  const pump=e.onGround&&!busy&&!c.pickL?A.sprint*(1-cr):0, dn=A.dn||0;
  if(pump>0.01){ rotateBoneWorld(B.LeftArm,rightB,-0.8*dn*pump); rotateBoneWorld(B.LeftForeArm,rightB,0.55*pump); tgt.addScaledVector(upB,0.025*Math.abs(dn)*pump); }
  if(!busy){ tgt.addScaledVector(upB,0.008*Math.sin(matchTime*1.7+(e.walkT||0))); } // breathing: the shoulder rises and falls a touch
  const natL=B.LeftHand.getWorldPosition(new V());
  solveIK(B.RightArm,B.RightForeArm,B.RightHand,tgt,sh.clone().addScaledVector(right,0.5).addScaledVector(upB,-0.55).addScaledVector(fwdB,-0.1));
  c.pick.quaternion.copy(P.q);
  // at rest the right fist closes round the handle (knuckles out) and the handle runs through the palm
  D(A,'pk2',e.swingT>0||e.guardK>0.3?1:0,1-Math.exp(-20*dt)); const rest=1-A.pk2;
  const hw=B.RightHand.getWorldPosition(new V());
  if(rest>0.01){ g.updateMatrixWorld(true); const hd=new V(0,1,0).applyQuaternion(c.pick.getWorldQuaternion(new T.Quaternion()));
    const pn=rightB.clone().negate(); pn.addScaledVector(hd,-pn.dot(hd)).normalize(); const pf=new V().crossVectors(hd.clone().negate(),pn);
    poseHand(B,'Right',pf,pn,0.8*rest); hw.addScaledVector(pf,0.07*rest).addScaledVector(pn,0.03*rest); }
  g.worldToLocal(hw); c.pick.position.copy(hw);
  // swinging, the left hand joins just above the right; at rest it hangs free
  const w2=A.pk2*(1-pump);
  if(c.pickL) dualLeft(c,B,g,P,rightB,upB,fwdB,rest);
  else if(w2>0.01){ c.pick.updateMatrixWorld(true); const lS=B.LeftArm.getWorldPosition(new V());
    solveIK(B.LeftArm,B.LeftForeArm,B.LeftHand,natL.clone().lerp(c.pick.localToWorld(new V(0,0.15,0)),w2),lS.clone().addScaledVector(right,-0.6).addScaledVector(upB,-0.5)); }
  else if(e.zgFloat) zgArms(e,X,['Left']);
}
// [S0] any layer can pull a hand toward a world target on top of the arm layer: X.armOv.Left={t,pole,w} re-solves the
// left arm toward lerp(hand,t,w), w 0..1 (pole: optional world elbow hint). Nothing to do on most frames.
const _ao1=new V(), _ao2=new V(), _ao3=new V(), ARM_SIDES=['Left','Right'];
function applyArmOverrides(e,X){ const O=X.armOv; if(!O||!(O.Left||O.Right)) return; const B=X.B;
  for(const sd of ARM_SIDES){ const o=O[sd]; if(!o||!(o.w>0.001)) continue; const sh=B[sd+'Arm'].getWorldPosition(_ao1), t=B[sd+'Hand'].getWorldPosition(_ao2).lerp(o.t,Math.min(1,o.w));
    const pole=o.pole||_ao3.copy(sh).addScaledVector(X.rightB,sd==='Left'?-0.5:0.5).addScaledVector(X.upB,-0.6).addScaledVector(X.fwdB,-0.2);
    solveIK(B[sd+'Arm'],B[sd+'ForeArm'],B[sd+'Hand'],t,pole); } }
// [S3] moving parts of the held gun: sparks and wings, the next rocket, the pump
function animProps(e,X){ const {c,A}=X;
  if(c.held&&c.held.userData.sparks){ const t=matchTime; for(const sp of c.held.userData.sparks){ const [x,a,r]=sp.userData.o; sp.position.set(x+Math.cos(a+t*3)*r*0.6,0.03+Math.sin(a*2+t*4)*0.06,-0.08+Math.sin(a+t*3)*r); sp.scale.setScalar(0.04+0.03*Math.abs(Math.sin(t*6+a*3))); sp.material.rotation=t*2; }
    for(const w of c.held.userData.wings) w.scale.y=1+0.06*Math.sin(matchTime*5); }
  if(c.held&&c.held.userData.warhead){ const k=e.isPlayer?clamp(e.fireCd/0.45,0,1):0; for(const m of c.held.userData.warhead){ m.visible=k<0.98; m.position.z=-0.5*k; } } // a new rocket slides into the muzzle
  if(c.held&&c.held.userData.pump){ const k=clamp(A.pumpT/0.45,0,1); c.held.userData.pump.position.z=-0.38+(A.pumpT>0&&A.pumpT<0.45?Math.sin(k*Math.PI)*0.14:0); }
}
// [S1] after every layer: blend out a layer switch (poseSnap), then remember the final pose
function animPost(e,X){ const c=X.c;
  c.lcGunIK=X.near&&X.branch===8&&!!c.held; c.lcBook=X.branch===6?e.dnBook:null; // what the hands are holding (props ride the blend)
  poseBlend(c,X.dt); poseStore(c); }
// [S0] hitboxes follow the skeleton
function animHitboxes(e,X){ const {c,B,g}=X;
  const hd=B.Head.getWorldPosition(new V()); g.worldToLocal(hd); c.hb.head.position.set(hd.x,hd.y+0.1,hd.z);
  const ch=B.Spine2.getWorldPosition(new V()); g.worldToLocal(ch); c.hb.chest.position.set(ch.x,ch.y-0.12,ch.z);
  const hp=B.Hips.getWorldPosition(new V()); g.worldToLocal(hp); const lh=Math.max(0.4,hp.y+0.05); c.hb.legs.scale.y=lh; c.hb.legs.position.set(hp.x,lh/2,hp.z);
}
// ================= emotes =================
// [S4] dances and emotes (Stream 4 fills this section). While one plays, e.emote={E,t,yaw}: animateGLB turns the body
// to e.emote.yaw, animCtx puts every item away and animArms gives the arm layer to emotePose.
function emotePose(e,X){}
// ================= characters =================
// everyone in the match: the player and the bots share these fields; bots and the player add their own on top
type Combatant=Record<string,any>;
function makeCombatant(name,isPlayer):Combatant{
  const ch=makeCharacterGLB(); world.add(ch.g);
  const e:Combatant={etype:'char',name,isPlayer,ch,pos:new V(),vel:new V(),yaw:0,pitch:0,hp:100,shield:0,alive:true,onGround:false,kills:0,radius:0.45,height:2.0,walkT:Math.random()*6,swingT:0,deadT:0,crouch:false,reloadT:0,
    anim:{crouch:0,air:0,recoil:0,flash:0,reload:0,pumpT:9,twist:0,sprint:0,sprPose:0,stance:0,pk2:0,zgP:0,zgS:0,land:0,hit:0,draw:1}};
  if(SK) applySkin(ch,isPlayer?equippedSkin():pickBotSkin());
  ch.parts.forEach(m=>{ m.userData.ent=e; m.userData.part=(m===ch.head)?'head':'body'; charMeshes.push(m); });
  combatants.push(e); targetsDirty=true; return e;
}
function setHeld(e,it){
  const c=e.ch, key=it?it.id+':'+it.r:''; if(c.heldKey===key) return; c.heldKey=key;
  if(c.held){ c.gunMount.remove(c.held); c.held=null; }
  if(it){ const m=makeGunModel(it.id,it.r); c.gunMount.add(m); c.held=m; m.userData.muzzle.add(c.flash); e.anim.draw=0; }
}
function muzzlePos(e,out){ const c=e.ch; if(c.held) return (c.held.userData.muzzles?c.held.userData.muzzles[e.anim.mfSide||0]:c.held.userData.muzzle).getWorldPosition(out); return out.set(e.pos.x,e.pos.y+1.5,e.pos.z); }
const KICK={ar:0.55,smg:0.35,pump:1,pistol:0.6,sniper:1,rpg:1.3,mf:0.3,frz:0.1,tsr:0.8,flm:0.06,pb:0.12,drone:0.15};
function fireFx(e,w,id){
  const A=e.anim; A.recoil=Math.min(1.2,A.recoil+KICK[id]); A.flash=0.05; e.ch.flash.scale.setScalar(rnd(0.6,1.1)*(id==='pump'||id==='sniper'?1.5:1)); e.ch.flash.material.rotation=Math.random()*6;
  if(id==='pump') A.pumpT=-0.15;
  if(id==='rpg'){ rpgBackblast(e); return; }
  if(WEAP[id].sp){ A.flash=0; return; } // the special guns make their own light: no muzzle flash, no brass
  if(id==='mf'&&e.ch.held&&e.ch.held.userData.muzzles){ e.ch.held.userData.muzzles[A.mfSide||0].add(e.ch.flash); return; }
  if(!player||e.pos.distanceTo(player.pos)>45||!e.ch.held) return;
  const m=new T.Mesh(GEO.shell,colorMat(0xd4a64a)); e.ch.held.getWorldPosition(m.position); world.add(m);
  const v=new V(Math.cos(e.yaw)*rnd(2,3.5),rnd(2.5,4),-Math.sin(e.yaw)*rnd(2,3.5));
  effects.push({t:0,dur:0.6,obj:m,upd:(ef,k,dt)=>{ v.y-=GRAV*dt; m.position.addScaledVector(v,dt); m.rotation.x+=dt*20; m.rotation.y+=dt*14; }});
}
function isScoped(){ const it=curItem(); return !!(it&&it.kind==='gun'&&WEAP[it.id].zoom); }
function D(o,k,t,a){ o[k]+=(t-o[k])*a; }
// ================= physics =================
// Collision boxes live in a grid of 8 m cells so movement only checks the blocks around you, not the whole box.
class BoxGrid{
  cs:number; cells:Map<number,any[]>; size:number; stamp:number; out:any[];
  constructor(cs){ this.cs=cs; this.cells=new Map(); this.size=0; this.stamp=0; this.out=[]; }
  keys(b,f){ const cs=this.cs; for(let ix=Math.floor(b.min.x/cs);ix<=Math.floor(b.max.x/cs);ix++) for(let iz=Math.floor(b.min.z/cs);iz<=Math.floor(b.max.z/cs);iz++) f(ix*73856093^iz*19349663); }
  add(b){ if(b._in) return; b._in=true; this.size++; this.keys(b,k=>{ let c=this.cells.get(k); if(!c) this.cells.set(k,c=[]); c.push(b); }); }
  delete(b){ if(!b._in) return; b._in=false; this.size--; this.keys(b,k=>{ const c=this.cells.get(k); if(c){ const i=c.indexOf(b); if(i>=0){ c[i]=c[c.length-1]; c.pop(); } } }); }
  near(x,z,r){ const cs=this.cs, st=++this.stamp, out=this.out; out.length=0;
    for(let ix=Math.floor((x-r)/cs);ix<=Math.floor((x+r)/cs);ix++) for(let iz=Math.floor((z-r)/cs);iz<=Math.floor((z+r)/cs);iz++){
      const c=this.cells.get(ix*73856093^iz*19349663); if(c) for(const b of c) if(b._st!==st){ b._st=st; out.push(b); } }
    return out; }
}
// Meshes that block bullets and sight, bucketed into 48 m cells; a ray only tests the cells its segment crosses.
const MESH_CS=48; let meshGrid=null;
function meshKey(ix,iz){ return ix*73856093^iz*19349663; }
const _mb=new T.Box3();
function rebuildMeshGrid(){ meshGrid=new Map();
  for(const m of structMeshes){ _mb.setFromObject(m); // a big block goes in every cell it covers, not just the one under its middle
    for(let ix=Math.floor(_mb.min.x/MESH_CS);ix<=Math.floor(_mb.max.x/MESH_CS);ix++) for(let iz=Math.floor(_mb.min.z/MESH_CS);iz<=Math.floor(_mb.max.z/MESH_CS);iz++){
      const k=meshKey(ix,iz); let c=meshGrid.get(k); if(!c) meshGrid.set(k,c=[]); c.push(m); } } }
let _segSt=0;
const _segOut=[];
const structsAlong=(o,d,len)=>meshesAlong(o,d,len,false).filter(m=>m.userData.ent&&m.userData.ent.etype==='piece');
function meshesAlong(o,d,len,withChars){
  refreshTargets(); const out=_segOut; out.length=0;
  const ex=o.x+d.x*len, ez=o.z+d.z*len, pad=8;
  const x0=Math.floor((Math.min(o.x,ex)-pad)/MESH_CS), x1=Math.floor((Math.max(o.x,ex)+pad)/MESH_CS), z0=Math.floor((Math.min(o.z,ez)-pad)/MESH_CS), z1=Math.floor((Math.max(o.z,ez)+pad)/MESH_CS);
  const st=++_segSt; for(let ix=x0;ix<=x1;ix++) for(let iz=z0;iz<=z1;iz++){ const c=meshGrid.get(meshKey(ix,iz)); if(c) for(const m of c) if(m.userData.segSt!==st){ m.userData.segSt=st; out.push(m); } }
  if(withChars) for(const m of charMeshes) out.push(m);
  return out;
}
// how far a ray from inside the box travels before it hits a wall, the floor or the ceiling
function boxRay(o,d,far){
  let t=far; const L=ZG.L;
  if(d.x>0) t=Math.min(t,(L-o.x)/d.x); else if(d.x<0) t=Math.min(t,(-L-o.x)/d.x);
  if(d.z>0) t=Math.min(t,(L-o.z)/d.z); else if(d.z<0) t=Math.min(t,(-L-o.z)/d.z);
  if(d.y>0) t=Math.min(t,(ZG.H-o.y)/d.y); else if(d.y<0) t=Math.min(t,-o.y/d.y);
  return Math.max(0,t);
}
function hasLOS(a,b){
  tv3.subVectors(b,a); const dist=tv3.length(); if(dist<0.01) return true; tv3.divideScalar(dist); ray.set(a,tv3); ray.near=0.5; ray.far=dist-0.5;
  return ray.intersectObjects(meshesAlong(a,tv3,dist,false),false).length===0;
}

// ================= combat =================
function jitter(dir,s,out){ out.copy(dir); out.x+=(Math.random()+Math.random()-1)*s; out.y+=(Math.random()+Math.random()-1)*s; out.z+=(Math.random()+Math.random()-1)*s; return out.normalize(); }
const tracerMat=new T.LineBasicMaterial({color:0xfff2b0,transparent:true,opacity:0.9});
function fireRay(shooter,origin,dir,w,rar,mult,muzzle,near){
  ray.set(origin,dir); ray.near=near||0; ray.far=w.range;
  const hits=ray.intersectObjects(meshesAlong(origin,dir,w.range,true),false);
  let hit=null; for(const h of hits){ if(h.object.userData.ent===shooter) continue; hit=h; break; }
  const hd=hit?hit.distance:w.range, td=boxRay(origin,dir,hd);
  const end=new V();
  if(td<hd){ end.copy(origin).addScaledVector(dir,td); puff(end,0xdddddd); sfx('impact',end,{mat:'stone'}); }
  else if(hit){
    end.copy(hit.point); const ent=hit.object.userData.ent;
    let dmg=w.dmg*rar.m*mult; if(w.falloff) dmg*=clamp(1-(hit.distance-8)/30,0.25,1);
    if(ent===player&&blocks(player,dir)){ end.copy(swordPoint(player)); deflect(player,shooter,end,dir,dmg); }
    else if(ent.etype==='char'){ const head=hit.object.userData.part==='head'; if(head) dmg*=w.head; hurt(ent,dmg,shooter,{head,point:hit.point,weapon:w.name,dir}); if(ent!==player&&shooter!==player) sfx('impact',end,{mat:'flesh'}); }
    else { puff(end,0xdddddd); sfx('impact',end,{mat:'stone'}); }
  } else end.copy(origin).addScaledVector(dir,Math.min(w.range,250));
  // bullets that just miss your head whiz past
  if(shooter!==player&&player.alive&&!(hit&&hit.object.userData.ent===player)){
    const hx=player.pos.x-origin.x, hy=player.pos.y+1.5-origin.y, hz=player.pos.z-origin.z, len=origin.distanceTo(end);
    const k=clamp(hx*dir.x+hy*dir.y+hz*dir.z,0,len), cx=origin.x+dir.x*k, cy=origin.y+dir.y*k, cz=origin.z+dir.z*k;
    if(k>2&&Math.hypot(player.pos.x-cx,player.pos.y+1.5-cy,player.pos.z-cz)<3) sfx('whiz',new V(cx,cy,cz));
  }
  tracer(muzzle,end);
}
function hurt(t,amt,src,info){
  if(!t.alive) return; if(t.bounceT>0){ if(src===player||t===player) sfx('boing',t.pos.clone(),{small:true}); return; } // the Bouncer Ball shrugs everything off info=info||{};
  if(t.pb){ if(bv(t,'ghost')) return; amt*=bv(t,'armor',1); } // power-up buffs: bulletproof, rock armour
  if(t.markT>0) amt*=t.markMul||1; if(t.tinyT>0) amt*=2;
  if(t===player&&src&&src!==t){ if(t.bubbles>0&&!info.soft){ t.bubbles--; puff(t.pos.clone().add(new V(0,1.3,0)),0xff8fc8); sfx('boing',null,{small:true}); return; }
    if(t.absorb>0){ const a=Math.min(t.absorb,amt); t.absorb-=a; amt-=a; if(amt<=0){ mote(pwMats(PC).spark,chest(t),0.6,0.2,rv(2),6); return; } } }
  amt=Math.max(1,Math.round(amt)); let left=amt, sh=0;
  if(t.shield>0){ sh=Math.min(t.shield,left); t.shield-=sh; left-=sh; }
  t.hp-=left; t.anim.hit=Math.min(1,(t.anim.hit||0)+0.35+amt/50);
  if(src===player&&t!==player){ player.dmgDealt+=amt; showDmg(info.point||t.pos.clone().add(new V(0,1.4,0)),amt,info.head?'head':(sh>0?'shield':'')); hitMarker(info.head); if(!info.soft||sh>0&&t.shield<=0) sfx(sh>0&&t.shield<=0?'shieldBreak':info.head?'head':(sh>0?'shield':'hit')); }
  if(t===player){ hurtFlash=Math.min(1,hurtFlash+0.3+amt/90); sfx('hurt'); }
  if(!t.isPlayer&&src&&src!==t&&src.alive){ t.healT=0; if(t.enemy!==src){ t.enemy=src; t.seenAt=matchTime-0.2; } t.lastSeen=src.pos.clone(); t.lastSeenT=matchTime; }
  if(t.hp<=0&&t===player&&t.pwLives>0){ t.pwLives--; t.hp=30; buff(t,'ghost',1.5); pwBlast(chest(t),{r:7,dmg:20,fire:true}); banner('Back again','',1.5); return; } // Phoenix Feather and Pixel Pick extra lives
  if(t.hp<=0){ if(t.frozen>0) info.frozen=true; eliminate(t,src,info.weapon,info); }
}
function eliminate(t,killer,weapon,info?){
  if(!t.alive) return; if(killer===t) killer=null; // hit by your own ricochet: no credit
  t.alive=false; t.hp=0; t.deadT=0; aliveCount--; startDeath(t,deathKind(weapon,info),info);
  charMeshes=charMeshes.filter(m=>m.userData.ent!==t); targetsDirty=true;
  feed(killer?`${killer.name} eliminated ${t.name}${weapon?' · '+weapon:''}`:weapon?`${t.name} ${t===player?'were':'was'} hit by a ${weapon}`:`${t.name} was eliminated`,killer===player||t===player);
  if(killer){ killer.kills++; if(killer===player){ player.bank++; sfx('elim'); banner('Eliminated',t.name+' · '+(aliveCount)+' left',2); pwOnKill(t); } }
  if(t.curse){ const c=t.curse; t.curse=null; if(c.alive) pwBlast(chest(t),{src:c,r:6,dmg:30,col:0xffc21a,name:'Ancient Curse'}); } // Temple Idol: the curse goes off
  // every elimination heals the winner and tops up their shield
  if(killer&&killer.alive&&killer!==t){ const add=50, hp=Math.min(100-killer.hp,add); killer.hp+=hp; killer.shield=Math.min(100,killer.shield+add-hp); }
  if(t===player) endMatch(false,killer,weapon);
  else if(player.alive&&aliveCount<=1) endMatch(true);
}
function curItem(){ const p=player; return p.sel===0?null:p.slots[p.sel]; }
function cancelActions(){ player.consuming=null; player.reloading=null; if(player.throwA&&!player.throwA.released) player.throwA=null; }
function playerFire(){
  const p=player; if(p.consuming||lockedUp(p)) return;
  const it=curItem();
  if(!it){
    if(animeSt){ animeTap(p); return; }
    if(POW){ pwSwing(p); return; }
    if(p.fireCd>0) return; p.fireCd=0.42; p.swingSide=p.swingT>0||p.comboT>0?1-(p.swingSide||0):0; p.swingT=SWING_T; p.comboT=SWING_T+0.3; p.hitT=SWING_T*PICK_HIT; sfx('swing');
    return;
  }
  if(it.kind==='cons') return startConsume(it);
  if(it.kind==='vest') return startThrow(it);
  gunFire(it);
}
// the pickaxe connects partway through the swing, when the head comes down
function pickaxeHit(){
  const p=player; if(curItem()) return; if(animeSt==='kunai'){ kunaiSlash(p); return; } if(animeSt==='nichirin'){ nichirinSlash(p); return; } if(POW){ pwHit(p); return; }
  camera.getWorldDirection(tv1); ray.set(camera.position,tv1); ray.near=camDistNow; ray.far=camDistNow+4.2;
  const hits=ray.intersectObjects(meshesAlong(camera.position,tv1,camDistNow+4.2,true),false); const h=hits.find(x=>x.object.userData.ent!==p);
  if(h){ const ent=h.object.userData.ent;
    if(ent.etype==='char') hurt(ent,20,p,{point:h.point,weapon:'Pickaxe',dir:tv1.clone()}); else sfx('chop',null,{mat:'stone'}); }
}
function gunFire(it){
  const p=player;
  const w=WEAP[it.id];
  if(p.reloading||p.fireCd>0) return;
  p.fireCd=w.rate/bv(p,'swing',1); // infinite ammo: no magazines, no reloads
  if(w.sp){ specialFire(p,it,w); return; }
  if(w.beam){ if(!(it.ammo>0)){ startReload(it); return; } p.anim.mfSide=(p.anim.mfSide||0)^1; let spread=w.spread+w.bloom*p.bloom; if(ads) spread*=0.5; p.bloom=Math.min(1,p.bloom+0.12);
    camera.getWorldDirection(tv1); muzzlePos(p,tv2); const o=tv2.clone(), at=aimPoint(p,tv1,w.range); fireBolt(p,o,jitter(at.sub(o).normalize(),spread,new V()),w); it.ammo--; if(it.ammo<=0) startReload(it);
    p.pitch=Math.min(1.25,p.pitch+w.recoil*rnd(0.6,1)); fireFx(p,w,it.id); sfx('mf'); return; }
  if(w.proj){ camera.getWorldDirection(tv1); muzzlePos(p,tv2); const o=tv2.clone(), at=aimPoint(p,tv1,w.range);
    launchRocket(p,o,at.sub(o).normalize()); p.pitch=Math.min(1.25,p.pitch+w.recoil); fireFx(p,w,it.id); sfx('rpg'); camShake=Math.max(camShake,0.35); return; }
  let spread=w.spread+w.bloom*p.bloom; if(ads) spread*=w.zoom?0.1:0.45; if(Math.hypot(p.vel.x,p.vel.z)>3) spread+=0.01;  if(p.crouch) spread*=0.7;
  p.bloom=Math.min(1,p.bloom+0.25);
  camera.getWorldDirection(tv1); muzzlePos(p,tv2);
  for(let i=0;i<w.pellets;i++){ jitter(tv1,spread,tv4); fireRay(p,camera.position,tv4,w,RAR[it.r],1,tv2,camDistNow+0.4); }
  p.pitch=Math.min(1.25,p.pitch+w.recoil*rnd(0.6,1)); p.yaw+=rnd(-1,1)*w.recoil*0.3;
  fireFx(p,w,it.id); sfx(it.id);
}
function startConsume(it){ const p=player, c=CONS[it.id];
  if(p.shield>=c.cap) return toast('Shield full');
  p.reloading=null; p.consuming={it,t:0,dur:c.time}; sfx('useStart',null,{id:it.id}); }
function finishConsume(){ const p=player, it=p.consuming.it, c=CONS[it.id]; p.consuming=null;
  p.shield=Math.min(c.cap,p.shield+c.shield);
  sfx('healDone'); healFx(p.pos.clone().add(new V(0,p.zgRoll>1.5?0.7:1.3,0)),0x6fb6ff,16,2.4); it.count--; if(it.count<=0){ const i=p.slots.indexOf(it); if(i>0) p.slots[i]=null; } refreshHotbar(); }
// the MF Guns never run out, but every 30 shots they need a reload (R reloads early)
function startReload(it){ const p=player; if(!it||it.id!=='mf'||p.reloading||it.ammo>=MF_CLIP) return; p.reloading={it,t:0,dur:MF_RELOAD}; sfx('clink'); }
function selectSlot(n){ const p=player; if(p.sel!==n) cancelActions(); p.sel=n; refreshHotbar(); }
// ================= bots =================
function makeBot(i){
  const b=makeCombatant(NAMES[i%NAMES.length]+(i>=NAMES.length?Math.floor(i/NAMES.length)+1:''),false);
  Object.assign(b,{gun:null,inv:[],think:0,fireCd:0,reloadT:0,enemy:null,seenAt:0,lastSeen:null,lastSeenT:-99,react:rnd(DIFF[diff].react[0],DIFF[diff].react[1]),skill:rnd(0.8,1.2),mag:0,goal:null,stuckT:0,lastPos:new V(),
    strafe:1,strafeT:0,healT:0,swapT:0,aimPitch:0});
  return b;
}
// rarity: 0 common .. 4 legendary; q nudges it up
function rollRarity(q){ const x=Math.random()+q*0.22; return x<0.42?0:x<0.68?1:x<0.86?2:x<0.97?3:4; }
function armBot(b){
  const main={kind:'gun',id:pick(['ar','ar','ar','smg','smg','sniper','pistol']),r:rollRarity(0.55)};
  b.inv=[main]; if(Math.random()<0.7) b.inv.push({kind:'gun',id:'pump',r:rollRarity(0.5)});
  b.gun=main; b.mag=WEAP[main.id].mag; b.shield=pick([25,50,50,75,100]);
}
function botShoot(b,e,d){
  const w=WEAP[b.gun.id];
  const Df=DIFF[diff];
  b.fireCd=w.rate*(w.auto?Df.cad:Df.cad*0.7)+rnd(0,0.15); b.burst=(b.burst||0)+1; if(w.auto&&b.burst%5===0) b.fireCd+=rnd(0.7,1.1);
  const origin=muzzlePos(b,new V());
  // bots aim where you WERE a moment ago, so strafing and jumping make them miss
  const lag=0.28, hy=Math.random()<Df.head?(e.crouch?1.45:1.8):(e.crouch?0.9:1.25);
  const aim=new V(e.pos.x-e.vel.x*lag,e.pos.y+1+(e.zgRoll>1.5?-1:1)*(hy-1)-e.vel.y*lag,e.pos.z-e.vel.z*lag);
  const dir=aim.sub(origin).normalize(), out=new V();
  const warm=1+1.5*Math.max(0,1-(matchTime-b.seenAt)/3);
  const tsp=Math.hypot(e.vel.x,e.vel.z);
  const s=(w.spread+0.024*b.skill+d*0.00035+tsp*0.0035+0.008+(e.crouch?0.006:0))*Df.spread*warm*(b.dazeT>0?4:1); // dazed: shaky aim
  for(let i=0;i<w.pellets;i++){ jitter(dir,s,out); fireRay(b,origin,out,w,RAR[b.gun.r],Df.dmg,origin,0.3); }
  fireFx(b,w,b.gun.id); sfx(b.gun.id,b.pos);
}
// ================= player =================
function updateActions(dt){
  const p=player; p.fireCd-=dt; p.bloom=Math.max(0,p.bloom-dt*2.2); if(p.swingT>0) p.swingT-=dt; if(p.comboT>0) p.comboT-=dt; if(p.hitT>0){ p.hitT-=dt; if(p.hitT<=0) pickaxeHit(); }
  if(p.consuming){ if(curItem()!==p.consuming.it) p.consuming=null; else { p.consuming.t+=dt; if(p.consuming.t>=p.consuming.dur) finishConsume(); } }
  if(p.reloading){ const r=p.reloading; if(curItem()!==r.it) p.reloading=null; else { r.t+=dt; if(r.t>=r.dur){ r.it.ammo=MF_CLIP; p.reloading=null; sfx('clink'); } } }
  updateThrow(dt);
  const it=curItem();
  ads=state==='play'&&mouse.r&&p.alive&&!!it&&it.kind==='gun';
  if(!p.alive||state!=='play') return;
  if(!it&&animeSt){ if(mouse.l){ p.aHold=(p.aHold||0)+dt; if(p.aHold>ANIME_HOLD) animeHold(p,dt); } else { if(p.aCharge>0) kiRelease(p); p.guard=false; p.aHold=0; p.aGap=0; } } // tap and hold moves; let go of a charge to fire it // tap and hold moves
  else if(mouse.l&&(!it&&!POW||(it&&it.kind==='gun'&&WEAP[it.id].auto))) playerFire(); // a held pickaxe does its power-up instead (pwInput)
}
function onPrimaryDown(){
  const p=player; if(!p.alive) return;
  const it=curItem(); if(it&&it.kind==='cons') startConsume(it); else playerFire();
}

// ================= effects =================
function tracer(a,b){ const geo=new T.BufferGeometry().setFromPoints([a.clone(),b.clone()]); const mat=tracerMat.clone(); const l=new T.Line(geo,mat); world.add(l); effects.push({t:0,dur:0.07,obj:l,upd:(e,k)=>{ mat.opacity=0.9*(1-k); },done:()=>{ geo.dispose(); mat.dispose(); }}); }
function puff(p,col){ const mat=new T.MeshBasicMaterial({color:col,transparent:true,opacity:0.8}); const m=new T.Mesh(GEO.puff,mat); m.position.copy(p); world.add(m); effects.push({t:0,dur:0.3,obj:m,upd:(e,k)=>{ m.scale.setScalar(1+k*2.5); mat.opacity=0.8*(1-k); },done:()=>mat.dispose()}); }
function updateEffects(dt){
  for(let i=effects.length-1;i>=0;i--){ const e=effects[i]; e.t+=dt; const k=Math.min(1,e.t/e.dur); e.upd(e,k,dt); if(k>=1){ world.remove(e.obj); if(e.done) e.done(); effects.splice(i,1); } }

}

// ================= HUD =================
// icon artwork for the shop items (also drawn on the vending machines' fronts)
const ICON_IN={
  rpg:'<rect x="6" y="9" width="40" height="5" rx="1"/><polygon points="2,7 8,9 8,14 2,16"/><path d="M46 8h6l9 3.5-9 3.5h-6z" fill="#4fd34f"/><polygon points="20,14 25,14 23,21 18,21"/><polygon points="33,14 37,14 37,19 33,19"/><rect x="18" y="4" width="9" height="4" rx="1"/>',
  gren:'<rect x="20" y="2" width="22" height="20" rx="4" opacity=".45"/><ellipse cx="31" cy="14" rx="7" ry="8"/><rect x="28" y="3" width="6" height="4" rx="1"/><path d="M34 4h4l2 9-2 1z"/><circle cx="25" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>',
  mf:'<path d="M14 10h14v5h-6l-2 7h-5l1-7h-2z"/><path d="M36 10h14v5h-2l1 7h-5l-2-7h-6z"/><path d="M14 10C8 4 4 6 2 3c4 1 6 0 12 4z" fill="#ffd23f"/><path d="M50 10c6-6 10-4 12-7-4 1-6 0-12 4z" fill="#ffd23f"/>',
  frz:'<path d="M4 9h10v6H6z"/><path d="M14 8h24l4 3v4H22l-2 7h-6l2-7h-2z"/><rect x="21" y="2" width="13" height="5" rx="2.5" fill="#bff3ff"/><path d="M42 9h5l9-5v15l-9-5h-5z" fill="#bff3ff"/><path d="M58 6l4-2M58 11.5h5M58 17l4 2" stroke="#bff3ff" stroke-width="1.5"/>',
  tsr:'<path d="M16 7h28v8H30l-2 8h-8l2-8h-6z"/><rect x="44" y="6" width="7" height="10" rx="1" fill="#202226"/><path d="M51 8h3M51 14h3" stroke="#8fe3ff" stroke-width="1.6"/><path d="M57 3l-2 6h4l-3 7" fill="none" stroke="#8fe3ff" stroke-width="1.5"/>',
  flm:'<path d="M3 9h7v5H5z"/><rect x="10" y="9" width="38" height="4" rx="1"/><rect x="34" y="8" width="14" height="6" rx="1" opacity=".7"/><rect x="48" y="8" width="4" height="6"/><rect x="14" y="2" width="22" height="6" rx="3" fill="#c8321e"/><path d="M17 13h5l-2 8h-5z"/><path d="M38 13h4v6h-4z"/><path d="M53 11c3-5 7-4 9-8-1 5 1 7-3 12 0-2-3-3-6-4z" fill="#ffb02a"/>',
  drone:'<rect x="24" y="8" width="16" height="9" rx="4.5"/><rect x="6" y="9.5" width="52" height="2.5" rx="1"/><rect x="1" y="5" width="16" height="2" rx="1"/><rect x="47" y="5" width="16" height="2" rx="1"/><rect x="8" y="6" width="2" height="5"/><rect x="54" y="6" width="2" height="5"/><circle cx="32" cy="13" r="2.2" fill="#ff3b30"/><rect x="30.5" y="17" width="3" height="4"/>',
  pb:'<path d="M12 9h26v6H24l-2 8h-7l2-8h-5z"/><rect x="38" y="10" width="20" height="3" rx="1"/><rect x="56" y="9" width="4" height="5" rx="1" fill="#ff3fa4"/><rect x="1" y="9.5" width="11" height="5" rx="2.5" opacity=".75"/><ellipse cx="26" cy="5" rx="7" ry="4.5" opacity=".55"/><circle cx="23.5" cy="5" r="1.8" fill="#ffe23a"/><circle cx="28" cy="4.5" r="1.8" fill="#3fd0ff"/>',
  bounce:'<circle cx="32" cy="12" r="10"/><path d="M22 12c4-3 16-3 20 0M24 6c4 3 12 3 16 0M24 18c4-3 12-3 16 0" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="1.4"/>',
};
const SVG=inner=>`<svg viewBox="0 0 64 24" width="52" height="20" fill="currentColor" aria-hidden="true">${inner}</svg>`;
const ICONS={
  pick:SVG('<rect x="10" y="10.5" width="42" height="3" rx="1.5" transform="rotate(-20 32 12)"/><path d="M42 1c7 1 12 5 14 12l-3 1c-2-5-6-9-11-10z"/><path d="M42 1c-4 2-7 5-8 9l3 1c1-3 3-6 6-7z"/>'),
  ar:SVG('<polygon points="2,9 15,8 15,15 4,17"/><rect x="15" y="7" width="30" height="7" rx="1"/><rect x="45" y="9" width="17" height="3"/><rect x="21" y="3" width="13" height="3" rx="1.5"/><polygon points="20,14 26,14 24,21 18,21"/><polygon points="30,14 36,14 37,22 31,22"/>'),
  smg:SVG('<rect x="8" y="10" width="12" height="2"/><rect x="8" y="10" width="2" height="7"/><rect x="18" y="7" width="22" height="8" rx="1"/><rect x="40" y="9" width="8" height="3"/><rect x="47" y="8" width="7" height="5" rx="1"/><rect x="27" y="15" width="5" height="9"/><polygon points="20,15 25,15 23,21 18,21"/>'),
  pump:SVG('<polygon points="1,9 12,8 12,14 3,17"/><rect x="12" y="7" width="12" height="7" rx="1"/><rect x="24" y="7.5" width="38" height="3"/><rect x="24" y="11" width="28" height="2.5"/><rect x="33" y="10" width="11" height="5" rx="1"/><polygon points="14,14 19,14 17,20 12,20"/>'),
  pistol:SVG('<rect x="18" y="6" width="28" height="7" rx="1"/><rect x="46" y="8" width="3" height="3"/><polygon points="20,13 29,13 27,23 18,23"/><path d="M29 13h6v3a3 3 0 0 1-3 3h-3z" fill="none" stroke="currentColor" stroke-width="1.6"/>'),
  sniper:SVG('<polygon points="0,9 12,8 12,14 0,17"/><rect x="12" y="8" width="20" height="6" rx="1"/><rect x="32" y="9.5" width="27" height="2.5"/><rect x="58" y="8.5" width="5" height="4" rx="1"/><rect x="15" y="2" width="16" height="4.5" rx="2.2"/><polygon points="16,14 21,14 19,20 14,20"/>'),

  rpg:SVG(ICON_IN.rpg), gren:SVG(ICON_IN.gren), mf:SVG(ICON_IN.mf), bounce:SVG(ICON_IN.bounce), frz:SVG(ICON_IN.frz), tsr:SVG(ICON_IN.tsr), flm:SVG(ICON_IN.flm), pb:SVG(ICON_IN.pb), drone:SVG(ICON_IN.drone),
  mini:SVG('<rect x="29" y="3" width="6" height="5" rx="1"/><circle cx="32" cy="15" r="7"/>'),
  big:SVG('<rect x="28" y="1" width="8" height="5" rx="1"/><path d="M27 6h10l5 7v8a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2v-8z"/>'),
};
const slotEls=[];
const NSLOT=9;
for(let i=0;i<NSLOT;i++){ const d=document.createElement('div'); d.className='slot'; d.innerHTML=`<span class="key">${i+1}</span><span class="ic"></span><span class="nm"></span><span class="sb"></span>`; $('hotbar').appendChild(d); slotEls.push(d); }
function refreshHotbar(){
  const p=player; if(!p) return;
  for(let i=0;i<NSLOT;i++){ const el=slotEls[i], it=i===0?null:p.slots[i]; let nm='', sb='', col=''; el.hidden=i>=6&&!it;
    let ic='';
    if(i===0){ const eq=equippedPick(); nm=eq&&eq.short||'PICKAXE'; col=eq?RAR[eq.rar].c:'#c9d2de'; ic=eq?'px'+eq.i:'pick'; } else if(it&&it.kind==='gun'){ nm=WEAP[it.id].short; col=WEAP[it.id].col||RAR[it.r].c; sb=it.id==='drone'?(p.drone?'LIVE':it.cd>0?Math.ceil(it.cd)+'s':''):'∞'; ic=it.id; } else if(it&&it.kind==='vest'){ nm='GRENADES'; col='#a7b85a'; sb='×'+it.count; ic='gren'; } else if(it){ nm=CONS[it.id].short; col=CONS[it.id].color; sb='×'+it.count; ic=it.id; }
    el.style.setProperty('--rc',col||'transparent'); if(el.dataset.ic!==ic){ el.dataset.ic=ic; el.children[1].innerHTML=ic?(ICONS[ic]||pickIcon(ic)):''; } el.children[2].textContent=nm; el.children[3].textContent=sb;
    el.classList.toggle('sel',p.sel===i); el.classList.toggle('empty',i>0&&!it); }
}
const dmgPool=[]; let dmgIdx=0;
for(let i=0;i<40;i++){ const d=document.createElement('div'); d.className='dn'; d.hidden=true; $('dmg').appendChild(d); dmgPool.push({el:d,pos:new V(),t:0,live:false}); }
function showDmg(pos,txt,cls){ const d=dmgPool[dmgIdx++%dmgPool.length]; d.pos.copy(pos); d.pos.x+=rnd(-0.3,0.3); d.pos.y+=rnd(0,0.3); d.t=0; d.live=true; d.el.textContent=txt; d.el.className='dn '+(cls||''); }
function updateDmg(dt){
  for(const d of dmgPool){ if(!d.live) continue; d.t+=dt; if(d.t>0.9){ d.live=false; d.el.hidden=true; continue; }
    tv1.copy(d.pos); tv1.y+=d.t*1.2; tv1.project(camera); if(tv1.z>1){ d.el.hidden=true; continue; }
    d.el.hidden=false; const x=(tv1.x+1)/2*innerWidth, y=(1-tv1.y)/2*innerHeight, sc=d.t<0.1?1.5-d.t*5:1;
    d.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-50%) scale(${sc})`; d.el.style.opacity=d.t>0.6?(0.9-d.t)/0.3:1; }
}
function hitMarker(head){ const h=$('hitmark'); h.classList.toggle('head',!!head); hitT=0.15; }
function banner(main,sub,dur){ $('bannerMain').textContent=main; $('bannerSub').textContent=sub||''; $('banner').hidden=false; bannerT=dur||3; }
function toast(msg){ $('toast').textContent=msg; $('toast').hidden=false; toastT=1.8; }
function feed(text,mine){ const d=document.createElement('div'); d.className='fl'+(mine?' mine':''); d.textContent=text; const f=$('feed'); f.prepend(d); while(f.children.length>6) f.lastChild.remove(); setTimeout(()=>d.remove(),8000); }
function hudTick(){
  const p=player;
  $('hpNum').textContent=Math.max(0,Math.ceil(p.hp)); $('hpFill').style.width=clamp(p.hp,0,100)+'%';
  $('shNum').textContent=Math.ceil(p.shield); $('shFill').style.width=clamp(p.shield,0,100)+'%';
  $('aliveN').textContent=aliveCount; $('killN').textContent=p.kills;
  const st=$('gravTxt'); st.textContent=ZG.state==='warn'?'Gravity flip!':ZG.state==='ceil'?'Ceiling · '+Math.ceil(ZG.t)+'s':'Zero-G'; st.className=ZG.state==='warn'?'flip':ZG.state==='ceil'?'ceil':'';
  const it=curItem();
  $('bankN').textContent=p.bank;
  if(slotEls[0]) slotEls[0].children[3].textContent=POW&&p.pwCd>0?Math.ceil(p.pwCd)+'s':''; // the pickaxe's hold move recharging
  $('ability').hidden=!p.bouncer; if(p.bouncer){ const cd=Math.ceil(p.bouncer.cd); $('abilityCd').textContent=p.bounceT>0?String(Math.ceil(p.bounceT)):cd>0?String(cd):''; $('ability').classList.toggle('ready',!cd&&!(p.bounceT>0)); $('ability').classList.toggle('on',p.bounceT>0); }
  if(it&&it.kind==='gun'&&it.id==='drone') $('ammo').textContent=p.drone?String(Math.max(0,Math.ceil(DRONE_LIFE-p.drone.t))):it.cd>0?Math.ceil(it.cd)+'s':'READY';
  else if(it&&it.kind==='gun'&&it.id==='mf') $('ammo').innerHTML=it.ammo+'<small>/ '+MF_CLIP+'</small>'; else if(it&&it.kind==='gun') $('ammo').textContent='∞'; else if(it&&it.kind==='vest') $('ammo').textContent=String(it.count);
  else $('ammo').textContent='';
  refreshHotbar();
}
function hudFrame(dt){
  const p=player;
  hurtFlash=Math.max(0,hurtFlash-dt*1.5); $('hurt').style.opacity=hurtFlash;
  const sf=$('stFill'); sf.style.width=p.stam+'%'; sf.classList.toggle('low',!!p.stamLock||p.stam<25);
  $('greenfx').style.opacity=ZG.flash;
  $('alarm').style.opacity=ZG.state==='warn'?0.55+0.45*Math.sin(matchTime*Math.PI*8):ZG.state==='ceil'?0.12:0;
  hitT-=dt; $('hitmark').style.opacity=hitT>0?1:0;
  if(bannerT>0){ bannerT-=dt; if(bannerT<=0) $('banner').hidden=true; }
  if(toastT>0){ toastT-=dt; if(toastT<=0) $('toast').hidden=true; }
  const it=curItem();
  const bl=1+p.bloom*1.5+(ads?-0.4:0); $('xhair').style.transform=`translate(-50%,-50%) scale(${bl})`;
  $('xhair').hidden=!p.alive;
  $('scope').hidden=!(ads&&it&&WEAP[it.id]&&WEAP[it.id].zoom);
  const busy=p.consuming||p.reloading;
  if(p.consuming){ $('usebar').hidden=false; $('uselabel').textContent='Drinking '+CONS[p.consuming.it.id].name; $('usefill').style.width=(p.consuming.t/p.consuming.dur*100)+'%'; }
  else if(p.reloading){ $('usebar').hidden=false; $('uselabel').textContent='Reloading'; $('usefill').style.width=(p.reloading.t/p.reloading.dur*100)+'%'; }
  else if(!busy) $('usebar').hidden=true;
  const vm=p.alive&&!shopOpen&&nearMachine(); $('prompt').hidden=!vm; if(vm&&$('prompt').dataset.k!=='shop'){ $('prompt').dataset.k='shop'; $('prompt').innerHTML='<kbd>E</kbd>Shop'; }
  if(shopOpen&&(!p.alive||!nearMachine(7))) closeShop();
  updateDmg(dt);
}
// ================= minimap =================
// a top-down plan of the box: blocks shaded by height (higher is darker), you as the yellow arrow
const mapC=$('map'), mctx=mapC.getContext('2d'), MAPS=180; let mapBase=null;
function renderMapBase(){
  mapBase=document.createElement('canvas'); mapBase.width=mapBase.height=MAPS; const g=mapBase.getContext('2d');
  g.fillStyle='#eef0f3'; g.fillRect(0,0,MAPS,MAPS); g.strokeStyle='#c4c8ce'; g.lineWidth=1;
  for(let i=0;i<=8;i++){ g.beginPath(); g.moveTo(i*MAPS/8,0); g.lineTo(i*MAPS/8,MAPS); g.moveTo(0,i*MAPS/8); g.lineTo(MAPS,i*MAPS/8); g.stroke(); }
  const k=MAPS/(2*ZG.L);
  for(const b of [...ZG.blocks].sort((a,c)=>a.y-c.y)){ const l=Math.round(235-b.y/ZG.H*90); g.fillStyle=`rgb(${l-12},${l-8},${l})`; g.fillRect((b.x-b.sx/2+ZG.L)*k,(b.z-b.sz/2+ZG.L)*k,b.sx*k,b.sz*k); g.strokeStyle='rgba(90,96,106,.6)'; g.strokeRect((b.x-b.sx/2+ZG.L)*k,(b.z-b.sz/2+ZG.L)*k,b.sx*k,b.sz*k); }
}
function drawMap(){
  const g=mctx, k=MAPS/(2*ZG.L), p=player; g.drawImage(mapBase,0,0);
  g.fillStyle='#ff3347'; for(const f of ZG.flyers||[]) g.fillRect((f.pos.x-f.h.x+ZG.L)*k,(f.pos.z-f.h.z+ZG.L)*k,Math.max(3,f.h.x*2*k),Math.max(3,f.h.z*2*k));
  g.fillStyle='#ffd23f'; g.strokeStyle='#1b2440'; g.lineWidth=1; for(const v of ZG.vend||[]){ g.fillRect((v.pos.x+ZG.L)*k-3.5,(v.pos.z+ZG.L)*k-3.5,7,7); g.strokeRect((v.pos.x+ZG.L)*k-3.5,(v.pos.z+ZG.L)*k-3.5,7,7); }
  g.fillStyle='#5cf0ff'; for(const pd of ZG.pads||[]){ g.beginPath(); g.arc((pd.pos.x+ZG.L)*k,(pd.pos.z+ZG.L)*k,2.2,0,TAU); g.fill(); }
  g.save(); g.translate((p.pos.x+ZG.L)*k,(p.pos.z+ZG.L)*k); g.rotate(Math.atan2(-Math.cos(p.yaw),-Math.sin(p.yaw)));
  g.beginPath(); g.moveTo(7,0); g.lineTo(-5,4.5); g.lineTo(-2.5,0); g.lineTo(-5,-4.5); g.closePath(); g.fillStyle='#ffd23f'; g.strokeStyle='#1b2440'; g.lineWidth=1.5; g.fill(); g.stroke(); g.restore();
}

// ================= camera =================
let camOverride=null;
const camFwd=new V(), camRight=new V(), _zc=new V(); let camDist=4.2, camDistNow=4.2, fov=72;
function updateCamera(dt){
  if(state==='armory'){ updateArmory(dt); return; }
  if(camOverride){ camera.position.copy(camOverride.pos); camera.lookAt(camOverride.look); return; }
  camera.up.set(0,1,0);
  // home screen: a slow orbit round the inside of the box
  if(state==='menu'||!player){ const t=performance.now()/1000*0.04; camera.position.set(Math.cos(t)*60,ZG.H*0.55,Math.sin(t)*60); camera.lookAt(0,ZG.H*0.4,0); if(camera.fov!==60){ camera.fov=60; camera.updateProjectionMatrix(); } return; }
  const p=player;
  if(!p.alive){ const a=matchTime*0.25; camera.position.set(p.pos.x+Math.cos(a)*9,p.pos.y+3.5,p.pos.z+Math.sin(a)*9); clampToBox(camera.position); camera.lookAt(p.pos.x,p.pos.y+1,p.pos.z); return; }
  const cp=Math.cos(p.pitch); camFwd.set(-Math.sin(p.yaw)*cp,Math.sin(p.pitch),-Math.cos(p.yaw)*cp); camRight.set(Math.cos(p.yaw),0,-Math.sin(p.yaw));
  const pivot=tv1.set(p.pos.x,p.pos.y+1.7-0.5*p.anim.crouch,p.pos.z);
  const gun=!!curItem()&&curItem().kind==='gun', dist=p.bounceT>0?7.5:ads?2.0:gun?3.4:4.6, side=ads?0.8:gun?1.1:0.85; pivot.y+=ads?0.05:gun?0.3:0.45;
  // sprinting on the ceiling: a little head bob and the camera eases back
  const sp=p.anim.sprint||0; pivot.y+=Math.abs(Math.sin(matchTime*8.5))*0.07*sp*(p.onGround?1:0)-(p.anim.land||0)*0.25;
  const tS=p.titanS||1; pivot.y+=1.55*(tS-1); // a titan's eyes are way up high, and the camera backs off to fit it in
  camDist=lerp(camDist,(dist+0.45*sp)*(1+0.4*(tS-1)),1-Math.exp(-12*dt));
  const start=tv2.copy(pivot).addScaledVector(camRight,side); let d=camDist;
  // pull in so a block never comes between the camera and you
  tv3.copy(camFwd).negate(); ray.set(start,tv3); ray.near=0; ray.far=camDist; const h=ray.intersectObjects(structsAlong(start,tv3,camDist),false); if(h.length) d=Math.max(0.4,h[0].distance-0.25);
  camDistNow=d;
  camera.position.copy(start).addScaledVector(camFwd,-d);
  tv3.set(start.x+camFwd.x*60,start.y+camFwd.y*60,start.z+camFwd.z*60);
  // upside down on the ceiling: the whole view rolls over around the body, so the ceiling becomes your floor
  if(ZG.camRoll>0.001){ const ax=tv4.set(-Math.sin(p.yaw),0,-Math.cos(p.yaw)), c=_zc.set(p.pos.x,p.pos.y+1,p.pos.z);
    camera.position.sub(c).applyAxisAngle(ax,ZG.camRoll).add(c); tv3.sub(c).applyAxisAngle(ax,ZG.camRoll).add(c); camera.up.set(0,1,0).applyAxisAngle(ax,ZG.camRoll); }
  clampToBox(camera.position);
  camera.lookAt(tv3);
  if(camShake>0){ camShake=Math.max(0,camShake-dt*(camShake>0.3?1.1:0.5)); const s=camShake*camShake*0.9+camShake*0.15; camera.position.x+=rnd(-s,s); camera.position.y+=rnd(-s,s); camera.position.z+=rnd(-s,s); camera.rotation.z+=rnd(-s,s)*0.04; }
  const it=curItem(), tf=ads?(it&&WEAP[it.id].zoom?20:52):72+7*sp;
  fov=lerp(fov,tf,1-Math.exp(-14*dt)); camera.fov=fov; camera.updateProjectionMatrix();
}
function clampToBox(v){ const m=ZG.L-0.4; v.x=clamp(v.x,-m,m); v.z=clamp(v.z,-m,m); v.y=clamp(v.y,0.4,ZG.H-0.4); return v; }
function updateSun(){ const f=(state==='menu'||!player)?tv4.set(0,0,0):player.pos; sun.position.copy(f).addScaledVector(SUN_DIR,200); sun.target.position.copy(f); }

// ================= locker (guns, pickaxes and skins in a 3D studio) =================
// The model stands on a pedestal; OrbitControls lets you drag to spin round it and scroll to zoom.
// The rail along the bottom is a GSAP Draggable strip of cards: drag or fling it and the card that
// lands in the middle is the one shown. Skin cards get little portraits rendered from the real model.
const ARM_IDS=['ar','smg','pump','pistol','sniper','rpg','mf','tsr','frz','flm','pb','drone'], ARM_Y=420;
const SHOP_GUN=id=>SHOP.find(x=>x.id===id);
let armIdx=0, armGroup=null, armGuns=[];
const LK:any={stage:null,item:null,orbit:null,idle:0,kind:'',n:0,center:-1,shown:-1,step:128,vx:0,lx:0,lt:0,drag:null,swapT:0,thumbs:new Map(),thumbBusy:0,wheelT:0,ring:null,glow:null,rim:null};
const GS=window.gsap||null, calmUI=matchMedia('(prefers-reduced-motion: reduce)').matches;
function lkRadial(inner,outer){ const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d'), g=x.createRadialGradient(64,64,0,64,64,64); g.addColorStop(0,inner); g.addColorStop(1,outer); x.fillStyle=g; x.fillRect(0,0,128,128); return new T.CanvasTexture(cv); }
function lkStage(){
  if(LK.stage) return LK.stage;
  const st=new T.Group();
  // backdrop: a violet dome with a neon horizon line
  const dome=new T.Mesh(new T.SphereGeometry(40,32,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
    vertexShader:'varying vec3 p;void main(){p=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec3 p;void main(){float h=p.y*0.5+0.5;vec3 c=mix(vec3(0.03,0.02,0.09),vec3(0.19,0.09,0.4),smoothstep(0.3,0.5,h));c=mix(c,vec3(0.06,0.03,0.17),smoothstep(0.52,0.95,h));c+=vec3(0.36,0.94,1.0)*0.16*exp(-pow((h-0.49)*28.0,2.0));gl_FragColor=vec4(c,1.0);}'}));
  dome.position.y=1; dome.renderOrder=-1; st.add(dome);
  // floor: a faint grid that fades into the dark
  const cv=document.createElement('canvas'); cv.width=cv.height=512; const x=cv.getContext('2d');
  x.strokeStyle='rgba(140,120,255,0.55)'; x.lineWidth=1.2; for(let i=0;i<=512;i+=32){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,512); x.moveTo(0,i); x.lineTo(512,i); x.stroke(); }
  x.globalCompositeOperation='destination-in'; const fg=x.createRadialGradient(256,256,0,256,256,256); fg.addColorStop(0,'rgba(0,0,0,0.9)'); fg.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=fg; x.fillRect(0,0,512,512);
  const floor=new T.Mesh(new T.PlaneGeometry(24,24),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false,fog:false})); floor.rotation.x=-Math.PI/2; floor.position.y=-0.15; st.add(floor);
  // pedestal: a dark disc, a glowing rim and a pool of light under it
  const ped=new T.Mesh(new T.CylinderGeometry(0.85,0.95,0.14,48),new T.MeshPhongMaterial({color:0x151030,shininess:70,specular:0x40357a})); ped.position.y=-0.075; st.add(ped);
  const ring=new T.Mesh(new T.TorusGeometry(0.9,0.02,8,80),new T.MeshBasicMaterial({color:0x5cf0ff,fog:false})); ring.rotation.x=Math.PI/2; ring.position.y=-0.004; st.add(ring);
  const glow=new T.Mesh(new T.PlaneGeometry(4.2,4.2),new T.MeshBasicMaterial({map:lkRadial('rgba(255,255,255,0.75)','rgba(255,255,255,0)'),color:0x5cf0ff,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false})); glow.rotation.x=-Math.PI/2; glow.position.y=-0.148; st.add(glow);
  const blob=new T.Mesh(new T.PlaneGeometry(1.3,1.3),new T.MeshBasicMaterial({map:lkRadial('rgba(0,0,0,0.6)','rgba(0,0,0,0)'),transparent:true,depthWrite:false,fog:false})); blob.rotation.x=-Math.PI/2; blob.position.y=0.002; st.add(blob);
  // lights: warm key, cool fill and a rim tinted by the item's rarity
  const hemi=new T.HemisphereLight(0xd8d0ff,0x2a1850,0.55), key=new T.DirectionalLight(0xfff4e6,0.85), rim=new T.DirectionalLight(0x5cf0ff,0.9);
  key.position.set(2.5,4,5); rim.position.set(-3,2.5,-4); st.add(hemi,key,key.target,rim,rim.target);
  Object.assign(LK,{stage:st,ring,glow,rim,blob,ped});
  return st;
}
function lkTint(col){ const c=new T.Color(col); LK.ring.material.color.copy(c); LK.glow.material.color.copy(c); LK.rim.color.copy(c).lerp(new T.Color(0xffffff),0.3); }
function lkOrbit(){
  if(LK.orbit||!T.OrbitControls) return LK.orbit;
  const o=new T.OrbitControls(camera,canvas); Object.assign(o,{enableDamping:true,dampingFactor:0.08,enablePan:false,rotateSpeed:0.75,zoomSpeed:0.8,autoRotate:true,autoRotateSpeed:1.3,enabled:false});
  o.addEventListener('start',()=>{ LK.idle=0; o.autoRotate=false; });
  o.addEventListener('end',()=>{ LK.idle=0.001; });
  canvas.addEventListener('dblclick',()=>{ if(state==='armory') lkFrame(true); });
  LK.orbit=o; return o;
}
// where the camera rests for each kind of item (pos is the offset from the target)
function lkView(){
  if(armMode==='guns') return {t:[0,1.0,0],d:SHOP_GUN(ARM_IDS[armIdx])?Math.max(4.5,6/camera.aspect):Math.max(6.5,(ARM_IDS[armIdx]==='sniper'?13:10.5)/camera.aspect),h:0.6,min:3,max:16,az:1.0,spin:false};
  if(armMode==='picks') return {t:[0,1.15,0],d:Math.max(5,6/camera.aspect),h:0.35,min:2,max:9,az:Infinity,spin:true};
  return {t:[0,0.9,0],d:Math.max(5.4,6.6/camera.aspect),h:0.5,min:1.3,max:8,az:Infinity,spin:true};
}
function lkFrame(anim){
  const v=lkView(), o=lkOrbit(), tg=new V(v.t[0],ARM_Y+v.t[1],v.t[2]), to=new V(tg.x,tg.y+v.h,tg.z+v.d);
  if(camera.fov!==40){ camera.fov=40; camera.updateProjectionMatrix(); } lkOffset();
  if(!o){ camera.position.copy(to); camera.lookAt(tg); return; }
  Object.assign(o,{minDistance:v.min,maxDistance:v.max,minAzimuthAngle:-v.az,maxAzimuthAngle:v.az,minPolarAngle:0.25,maxPolarAngle:1.72,autoRotate:v.spin}); LK.idle=0;
  if(anim&&GS&&!calmUI){ GS.to(o.target,{x:tg.x,y:tg.y,z:tg.z,duration:0.7,ease:'power3.inOut'}); GS.to(camera.position,{x:to.x,y:to.y,z:to.z,duration:0.7,ease:'power3.inOut'}); }
  else { o.target.copy(tg); camera.position.copy(to); o.update(); }
}
// the rail covers the bottom of the screen, so the picture is nudged up to centre the model in what is left
function lkOffset(){ const r=$('armRail'), h=r?r.offsetHeight:0, W=innerWidth, H=innerHeight; if(h) camera.setViewOffset(W,H,0,h*0.5,W,H); else camera.clearViewOffset(); }
// ---- the item on the pedestal: the old one slides out, the new one slides in
function lkDispose(obj){ if(obj.userData.px) disposeObj(obj); const c=obj.userData.ch; if(c) for(const o of c.gear||[]) o.traverse(m=>{ if(m.isMesh&&!m.geometry.userData.keep) m.geometry.dispose(); }); }
function lkPut(obj,dir){
  const old=LK.item; LK.item=obj; armGroup.add(obj);
  if(old){ if(GS&&!calmUI&&dir){ GS.killTweensOf(old.position); GS.to(old.position,{x:-dir*2.6,duration:0.35,ease:'power2.in'}); GS.to(old.scale,{x:0.5,y:0.5,z:0.5,duration:0.35,ease:'power2.in',onComplete:()=>{ armGroup&&armGroup.remove(old); lkDispose(old); skShown=skShown.filter(c=>c.g!==old.userData.chG); }}); }
    else { armGroup.remove(old); lkDispose(old); skShown=skShown.filter(c=>c.g!==old.userData.chG); } }
  if(GS&&!calmUI&&dir){ const s=obj.scale.x; obj.position.x=dir*2.6; obj.scale.setScalar(s*0.5); GS.to(obj.position,{x:0,duration:0.55,ease:'power3.out'}); GS.to(obj.scale,{x:s,y:s,z:s,duration:0.55,ease:'back.out(1.6)'}); }
}
function buildArmory(dir?){
  if(!armGroup){ armGroup=new T.Group(); armGroup.position.set(0,ARM_Y,0); armGroup.add(lkStage()); scene.add(armGroup); }
  if(armMode==='picks'&&PX) return buildPickStand(dir);
  if(armMode==='skins'&&SK) return buildSkinStand(dir);
  const holder=new T.Group(); armGuns=[];
  const id=ARM_IDS[armIdx], shopIt=SHOP_GUN(id);
  if(shopIt){ const h=new T.Group(); h.position.set(0,1.0,0); const gm=makeGunModel(id,4); gm.scale.setScalar(id==='drone'?5:id==='tsr'?3.2:id==='mf'?2.4:2.1); h.add(gm);
    const halo=new T.Sprite(auraMats(shopIt.col).halo); halo.scale.setScalar(2.6); halo.position.z=-0.6; h.add(halo); holder.add(h); armGuns.push(h); }
  else for(let r=0;r<5;r++){ const h=new T.Group(); h.position.set((r-2)*(id==='sniper'?2.15:1.65),1.0,0); const gm=makeGunModel(id,r); gm.scale.setScalar(id==='pistol'?2:id==='sniper'?1.05:1.3); h.add(gm);
    const halo=new T.Sprite(auraMats(RAR[r].c).halo); halo.scale.setScalar(1.6+r*0.25); halo.position.z=-0.6; h.add(halo);
    holder.add(h); armGuns.push(h); }
  LK.ped.visible=LK.ring.visible=LK.blob.visible=false; lkTint('#5cf0ff');
  lkPut(holder,dir||0); lkFrame(true);
  const w=WEAP[id], fx={frz:'Freezes',tsr:'Stuns',flm:'Burns',pb:'Splats paint',drone:'Hunts for 15s'}[id];
  lkInfo(w.name,(shopIt?'Shop · '+shopIt.price+' elims':'Armory')+' · '+(armIdx+1)+' of '+ARM_IDS.length,null,id==='drone'?`Damage ${DRONE_W.dmg} · ${fx}`:`Damage ${w.dmg*w.pellets>w.dmg?w.dmg+' × '+w.pellets:w.dmg} · ${w.auto?'Full auto':'Single shot'}${fx?' · '+fx:''}`);
  $('armLabels').innerHTML=shopIt?'':RAR.map(r=>`<span style="color:${r.c}">${r.n}</span>`).join('');
}
function lkInfo(name,kick,rar,stats){
  $('armName').textContent=name; $('armName').style.fontSize=name.length>11?'clamp(24px,2.6vw,34px)':''; $('armKick').textContent=kick; $('armStats').textContent=stats||''; $('armNote').textContent=''; $('armPower').hidden=true;
  const rb=$('armRar'); rb.hidden=!rar; if(rar){ rb.textContent=rar.n; } $q('.lk-info').style.setProperty('--rc',rar?rar.c:'#5cf0ff');
}
function openArmory(){ state='armory'; if(world) world.visible=false; (scene.fog as any).far=1e5;
  const o=lkOrbit(); if(o) o.enabled=true;
  if(GS&&!calmUI){ $('armory').hidden=false; GS.fromTo('#armory .lk-top, #armory #armSets',{y:-24,opacity:0},{y:0,opacity:1,duration:0.45,ease:'power3.out',stagger:0.06});
    GS.fromTo('#armory .lk-info',{x:-40,opacity:0},{x:0,opacity:1,duration:0.5,ease:'power3.out',delay:0.1}); GS.fromTo('#armRail',{y:60,opacity:0},{y:0,opacity:1,duration:0.5,ease:'power3.out',delay:0.12});
    GS.to('#menu',{opacity:0,duration:0.2,onComplete:()=>{ $('menu').hidden=true; GS.set('#menu',{opacity:1}); }}); }
  else { $('menu').hidden=true; $('armory').hidden=false; }
}
function closeArmory(){ state='menu'; if(world) world.visible=true; (scene.fog as any).far=330; const o=LK.orbit; if(o) o.enabled=false; camera.clearViewOffset();
  $('armory').hidden=true; $('menu').hidden=false; if(GS&&!calmUI) GS.fromTo('#menu',{opacity:0},{opacity:1,duration:0.35});
  if(armGroup){ if(LK.item){ lkDispose(LK.item); LK.item=null; } scene.remove(armGroup); armGroup.remove(LK.stage); armGroup=null; } skShown=[]; LK.shown=-1; LK.center=-1; $('armLabels').innerHTML='';
  $('lockerBtn').focus(); showPickNote(); }
function updateArmory(dt){ dt=dt||1/60;
  const t=performance.now()/1000;
  if(armGroup&&armGroup.userData.dist) return updateLineup(t,dt);
  if(armMode==='picks'&&PX) updatePickStand(t);
  else if(armMode==='skins'&&SK) updateSkinStand(t,dt);
  else armGuns.forEach((h,i)=>{ h.rotation.y=Math.PI/2+Math.sin(t*0.8+i*0.5)*0.55; h.position.y=1.0+Math.sin(t*1.6+i)*0.06; });
  if(LK.ring) LK.ring.material.opacity=1, LK.glow.material.opacity=0.75+0.25*Math.sin(t*2.2);
  const o=LK.orbit;
  if(o){ if(LK.idle>0){ LK.idle+=dt; if(LK.idle>3&&lkView().spin){ o.autoRotate=true; LK.idle=0; } }
    if(armMode==='skins'){ const d=camera.position.distanceTo(o.target), y=ARM_Y+lerp(1.5,0.95,smooth(1.4,4,d)); o.target.y+=(y-o.target.y)*Math.min(1,dt*6); } // zooming in looks at the face
    o.update(); }
  else lkFrame(false);
  const labels=$('armLabels').children;
  if(armMode==='guns') armGuns.forEach((h,i)=>{ h.getWorldPosition(tv1); tv1.y-=0.75; tv1.project(camera); const el=labels[i]; if(el){ el.style.left=((tv1.x+1)/2*innerWidth)+'px'; el.style.top=((1-tv1.y)/2*innerHeight)+'px'; } });
  if(armMode==='skins') lkThumbTick();
}
// ================= armory: pickaxes in 3D =================
// Each pickaxe design from pickaxes.js becomes a model: the head outline is extruded into a solid,
// its face wears the 2D artwork as a texture, and the handle, collar, gem and pommel are built around it.
const PX=window.PICKAXES||null;
const PX_TRAIL={embers:0xff8a1f,snow:0xffffff,bubbles:0xbfefff,bats:0x9b5cff,sparkles:0xffffff,stars:0xffe27a,spray:0xff3fa4,bolts:0xfff27a,coins:0xffd23f,leaves:0x53d16b,ash:0x9a9aa2,wisps:0xc8ffee};
let armMode='guns', pxIdx=0, pxShown=[]; const pxCache=new Map();
function svgTexture(svg,w,h){
  const cv=document.createElement('canvas'); cv.width=w; cv.height=h; const tex=new T.CanvasTexture(cv);
  const img=new Image(); img.onload=()=>{ cv.getContext('2d').drawImage(img,0,0,w,h); tex.needsUpdate=true; };
  img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg); return tex;
}
// absolute M/L/H/V/C/Q/Z path data to a THREE.Shape (SVG y runs down, so it is flipped)
function svgPathShape(d){
  const sh=new T.Shape(), tk=d.match(/[MLHVCQZ]|-?\d*\.?\d+/gi); let i=0, cmd='', x=0, y=0; const n=()=>parseFloat(tk[i++]);
  while(i<tk.length){
    if(/[a-z]/i.test(tk[i])) cmd=tk[i++].toUpperCase();
    if(cmd==='M'){ x=n(); y=n(); sh.moveTo(x,-y); cmd='L'; }
    else if(cmd==='L'){ x=n(); y=n(); sh.lineTo(x,-y); }
    else if(cmd==='H'){ x=n(); sh.lineTo(x,-y); }
    else if(cmd==='V'){ y=n(); sh.lineTo(x,-y); }
    else if(cmd==='C'){ const a=n(),b=n(),c=n(),e=n(); x=n(); y=n(); sh.bezierCurveTo(a,-b,c,-e,x,-y); }
    else if(cmd==='Q'){ const a=n(),b=n(); x=n(); y=n(); sh.quadraticCurveTo(a,-b,x,-y); }
    else if(cmd==='Z') cmd='';
    else i++;
  }
  return sh;
}
function makePickaxe3D(it,held?,one?){
  if(it.anime) return makeAnime3D(it,held);
  const F=PX.formOf(it), SY=F?F.sy:1;
  if(F&&F.dual&&!held&&!one){ // a pair: the two blades crossed, the second turned round so both edges face out
    const g=new T.Group(), a=makePickaxe3D(it,false,true), b=makePickaxe3D(it,false,true);
    a.rotation.z=-0.42; b.rotation.set(0,Math.PI,-0.42); a.position.x=-0.25; b.position.x=0.25; g.add(a,b); g.userData.trail=a.userData.trail; return g; }
  const L=PX.pickLen(it), HS=PX.headScale(it), alpha=it.x.alpha||1;
  const g=new T.Group(), inner=new T.Group(); g.add(inner);
  const Ph=(o)=>new T.MeshPhongMaterial(Object.assign({shininess:45,specular:0x3a3a3a},o));
  const mat=(o)=>{ const m=Ph(o); if(alpha<1){ m.transparent=true; m.opacity=alpha; } return m; };
  // head: extruded outline, artwork on both faces, edge color on the sides
  const tex=svgTexture(PX.headSVG(it),512,282); tex.repeat.set(1/200,1/110); tex.offset.set(0,100/110);
  const geo=new T.ExtrudeGeometry(svgPathShape(PX.SHAPES[it.shape]),{depth:14,bevelEnabled:true,bevelThickness:4.5,bevelSize:2.6,bevelSegments:4,curveSegments:14});
  geo.translate(-100,48,-7);
  const hg=new T.Group(); hg.position.set(100,-48,0); hg.scale.setScalar(HS); inner.add(hg);
  const sideCol=new T.Color(it.h1).lerp(new T.Color(it.h2),0.5).lerp(new T.Color(it.edge),0.35);
  const blade=new T.Mesh(geo,[mat({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:0.12}),mat({color:sideCol,emissive:sideCol.clone().multiplyScalar(0.12),shininess:70})]);
  blade.scale.y=SY; if(F&&F.sy>1) blade.scale.z=0.6; hg.add(blade); // swords: a long, thinner blade
  const gy=F&&F.guard?-10:-1; // swords get a crossguard instead of the collar
  const collar=new T.Mesh(F&&F.guard?new T.BoxGeometry(62,10,20):new T.CylinderGeometry(11,11,26,16),Ph({color:it.edge,shininess:80,specular:0x666666})); collar.scale.z=0.95; collar.position.set(0,gy,0); hg.add(collar);
  if(it.x.gem){ const gm=Ph({color:it.x.gem,emissive:new T.Color(it.x.gem).multiplyScalar(0.4),shininess:120,specular:0xffffff}), gg=new T.SphereGeometry(6,16,12);
    for(const z of[13,-13]){ const gem=new T.Mesh(gg,gm); gem.position.set(0,gy,F&&F.guard?z*0.85:z); gem.scale.z=0.55; hg.add(gem); } }
  // handle: the 2D handle strip wrapped around a cylinder
  const htex=svgTexture(PX.handleStripSVG(it),64,Math.round(L*4));
  const handle=new T.Mesh(new T.CylinderGeometry(7,7,L,16),Ph({map:htex,shininess:25,specular:0x222222})); handle.position.set(100,-(50+L/2),0); inner.add(handle);
  // pommel
  const pe=-(50+L), pom=it.x.pom, pc=it.x.gem||it.edge, add=(geo,col,y,em?)=>{ const m=new T.Mesh(geo,Ph({color:col,shininess:70,emissive:em?new T.Color(col).multiplyScalar(0.6):0x000000})); m.position.set(100,y,0); inner.add(m); return m; };
  if(it.hs==='bone'){ for(const dx of[-9,9]){ const b=add(new T.SphereGeometry(6.5,12,10),it.ha,pe); b.position.x+=dx; } }
  else if(pom==='spike') add(new T.ConeGeometry(7,18,10),it.edge,pe-9).rotation.x=Math.PI;
  else if(pom==='ball') add(new T.SphereGeometry(9,16,12),0xe3243b,pe-6);
  else if(pom==='crown') add(new T.CylinderGeometry(10,8,12,6),0xffd23f,pe-6);
  else if(pom==='skull') add(new T.SphereGeometry(9,14,12),0xf2ead6,pe-7);
  else if(pom==='lure') add(new T.SphereGeometry(5,12,10),0xfff27a,pe-10,true);
  else add(new T.CylinderGeometry(9,9,10,14),pc,pe-3);
  // glow and trail
  if(it.x.glow&&!held){ const halo=new T.Sprite(auraMats(it.x.glow).halo); halo.scale.setScalar(170*HS*Math.sqrt(SY)); halo.position.set(100,-46+(SY-1)*28*HS,-25); inner.add(halo); }
  if(it.x.parts&&!held){ const ring=new T.Group(), sm=auraMats('#'+new T.Color(PX_TRAIL[it.x.parts]||0xffffff).getHexString()).spark;
    for(let k=0;k<10;k++){ const s=new T.Sprite(sm), a=k/10*Math.PI*2; s.position.set(Math.cos(a)*(70+(k%3)*18),(k%4)*30-60,Math.sin(a)*(70+(k%3)*18)); s.scale.setScalar(14+(k%3)*6); ring.add(s); }
    ring.position.set(100,-60,0); inner.add(ring); g.userData.trail=ring; }
  if(held){ inner.position.set(-100,50+L-16,0); g.scale.setScalar(0.0054); return g; } // grip near the pommel sits at the origin
  const top=48-58*HS*SY, bot=50+L+18; inner.position.set(-100,(top+bot)/2,0);
  g.scale.setScalar(0.016*Math.min(1,250/(bot-top))); g.rotation.z=-0.55;
  return g;
}
function disposeObj(o){ o.traverse(m=>{ if(m.isMesh){ m.geometry.dispose(); (Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{ if(x.map) x.map.dispose(); x.dispose(); }); } }); }
function pickModel(i){
  let m=pxCache.get(i); if(m){ pxCache.delete(i); pxCache.set(i,m); return m; }
  m=makePickaxe3D(PX.ITEMS[i]); pxCache.set(i,m);
  if(pxCache.size>12){ const old=pxCache.keys().next().value; disposeObj(pxCache.get(old)); pxCache.delete(old); }
  return m;
}
function buildPickStand(dir?){
  const it=PX.ITEMS[pxIdx], r=RAR[it.rar], Z=PX.SIZES[it.sz];
  const h=new T.Group(), m=makePickaxe3D(it); h.userData.px=true; h.add(m); h.position.y=1.15; h.scale.setScalar(0.55); pxShown=[h];
  LK.ped.visible=LK.ring.visible=LK.blob.visible=true; lkTint(r.c);
  lkPut(h,dir||0); if(LK.kind!=='picks'||dir==null) lkFrame(true);
  lkInfo(it.n,`${it.set.n} set · ${pxIdx+1} of ${PX.ITEMS.length}`,r,it.anime?`${it.hero} · ${it.pw}`:it.form?`${it.form.n} · ${Z.n} size`:`${Z.n} size`); $('armNote').textContent=it.pwd||'';
  $('armLabels').innerHTML='';
  showEquip();
  [...$('armSets').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===it.set.id)));
}
function updatePickStand(t){
  for(const h of pxShown){ h.position.y=1.15+Math.sin(t*1.5)*0.06; const tr=h.children[0]&&h.children[0].userData.trail; if(tr) tr.rotation.y=t*0.8; }
}
// ---- the rail: one card per item, dragged with GSAP Draggable and flung with momentum
function lkCards(){
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const card=(i,col,name,art)=>`<button class="lk-card" role="option" aria-selected="false" data-i="${i}" style="--rc:${col}" aria-label="${esc(name)}">${art}<span class="nm">${esc(name)}</span></button>`;
  if(armMode==='skins') return SK.ITEMS.map((it,i)=>card(i,RAR[it.r].c,it.n,'<span class="ph"></span><canvas width="160" height="200" hidden></canvas>'));
  if(armMode==='picks') return PX.ITEMS.map((it,i)=>card(i,RAR[it.rar].c,it.n,`<span class="art">${PX.pickSVG(it,'lk'+i)}</span>`));
  return ARM_IDS.map((id,i)=>card(i,WEAP[id].col||'#5cf0ff',WEAP[id].name,`<span class="art gun">${ICONS[id]}</span>`));
}
function lkIdx(){ return armMode==='skins'?skIdx:armMode==='picks'?pxIdx:armIdx; }
function lkRail(){
  const tr=$('armTrack'); LK.kind=armMode; tr.innerHTML=lkCards().join(''); LK.n=tr.children.length; LK.center=-1;
  if(armMode==='skins') for(const [i,cv] of LK.thumbs) lkPaint(i,cv);
  lkMeasure(); lkSetX(lkX(lkIdx())); lkMoved(); lkMarkEq();
}
function lkMeasure(){ const c=$('armTrack').children; LK.step=c.length>1?c[1].offsetLeft-c[0].offsetLeft:128; LK.cw=c[0]?c[0].offsetWidth:116;
  if(LK.drag) LK.drag.applyBounds({minX:lkX(LK.n-1)-LK.step*0.6,maxX:lkX(0)+LK.step*0.6}); }
function lkX(i){ return $('armRail').clientWidth/2-(i*LK.step+LK.cw/2); }
function lkGetX(){ return GS?+GS.getProperty('#armTrack','x'):LK.x||0; }
function lkSetX(x){ LK.x=x; if(GS) GS.set('#armTrack',{x}); else $('armTrack').style.transform=`translateX(${x}px)`; if(LK.drag) LK.drag.update(); }
function lkAt(x){ return clamp(Math.round(($('armRail').clientWidth/2-LK.cw/2-x)/LK.step),0,LK.n-1); }
// the card in the middle changes: light it up, show its name now, and swap the model once the rail settles
function lkMoved(){
  const c=lkAt(lkGetX()); if(c===LK.center) return;
  const cards=$('armTrack').children, prev=cards[LK.center]; if(prev){ prev.classList.remove('on'); prev.setAttribute('aria-selected','false'); }
  LK.center=c; const el=cards[c]; if(el){ el.classList.add('on'); el.setAttribute('aria-selected','true'); }
  if(LK.shown!==c&&LK.shown>=0) sfx('tick',null,{});
  clearTimeout(LK.swapT); LK.swapT=setTimeout(()=>lkSelect(c),160);
}
function lkSelect(i){
  if(i===lkIdx()&&LK.shown===i&&LK.item) return;
  const d=Math.sign(i-lkIdx())||1; LK.shown=i;
  if(armMode==='skins') skIdx=i; else if(armMode==='picks') pxIdx=i; else armIdx=i;
  buildArmory(LK.item?d:0);
}
function lkGo(i,dur?){ i=clamp(i,0,LK.n-1); const tr=$('armTrack');
  if(GS){ GS.killTweensOf(tr); GS.to(tr,{x:lkX(i),duration:dur==null?0.5:dur,ease:'power3.out',onUpdate:()=>{ if(LK.drag) LK.drag.update(); lkMoved(); },onComplete:()=>{ clearTimeout(LK.swapT); lkSelect(i); }}); }
  else { lkSetX(lkX(i)); lkMoved(); clearTimeout(LK.swapT); lkSelect(i); } }
function lkMarkEq(){ const cards=$('armTrack').children; let e=-1;
  if(armMode==='skins'){ const s=equippedSkin(); e=s&&!skinRandom?s.i:-1; } else if(armMode==='picks'){ const p=equippedPick(); e=p&&!pickRandom?p.i:-1; }
  for(let i=0;i<cards.length;i++) cards[i].classList.toggle('eq',i===e); }
function lkInitRail(){
  const rail=$('armRail'), tr=$('armTrack'), D=window.Draggable;
  if(GS&&D){ GS.registerPlugin(D);
    LK.drag=D.create(tr,{type:'x',trigger:rail,edgeResistance:0.8,minimumMovement:5,dragClickables:true,allowContextMenu:true,
      onPress(){ GS.killTweensOf(tr); LK.vx=0; LK.lt=performance.now(); LK.lx=this.x; },
      onDrag(){ const now=performance.now(), ms=Math.max(1,now-LK.lt); LK.vx=lerp(LK.vx,(this.x-LK.lx)/ms*1000,0.4); LK.lt=now; LK.lx=this.x; lkMoved(); },
      onDragEnd(){ if(performance.now()-LK.lt>90) LK.vx=0; const land=this.x+clamp(LK.vx,-5000,5000)*0.45; const i=lkAt(land), dist=Math.abs(lkX(i)-this.x);
        lkGo(i,clamp(0.35+dist/2400,0.35,1.1)); },
      onClick(e){ const c=e.target.closest&&e.target.closest('.lk-card'); if(c) lkGo(+c.dataset.i); }})[0];
    const sets=$('armSets'); D.create(sets,{type:'scrollLeft',dragClickables:true,minimumMovement:6,allowContextMenu:true});
  } else tr.addEventListener('click',e=>{ const c=e.target.closest('.lk-card'); if(c) lkGo(+c.dataset.i); });
  rail.addEventListener('wheel',e=>{ e.preventDefault(); const now=performance.now(); if(now-LK.wheelT<110) return; const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY; if(Math.abs(d)<4) return; LK.wheelT=now; lkGo(LK.center+(d>0?1:-1),0.35); },{passive:false});
  addEventListener('resize',()=>{ if(state==='armory'){ lkMeasure(); lkSetX(lkX(LK.center)); lkFrame(false); } });
}
// ---- skin portraits for the cards: each one is the real model rendered once, off screen
let TH=null;
function lkThumb(i){
  if(!TH){ const W=160,H=200, sc=new T.Scene(); sc.add(new T.HemisphereLight(0xf0ecff,0x4a3880,1.05)); const k=new T.DirectionalLight(0xfff4e6,1.1); k.position.set(2,3,5); const r=new T.DirectionalLight(0x9fe8ff,0.8); r.position.set(-3,2,-4); sc.add(k,r);
    const cam=new T.PerspectiveCamera(22,W/H,0.1,40); cam.position.set(0,1.0,5.9); cam.lookAt(0,0.9,0); TH={W,H,sc,cam,rt:new T.WebGLRenderTarget(W,H),px:new Uint8Array(W*H*4)}; }
  const c:any=standChar(SK.ITEMS[i]); c.g.rotation.y=Math.PI-0.35; c.mixer.update(0.35); swayGear({onGround:true,walkT:0},c,0,1/60); TH.sc.add(c.g); c.g.updateMatrixWorld(true);
  const cc=new T.Color(); renderer.getClearColor(cc); const ca=renderer.getClearAlpha();
  renderer.setRenderTarget(TH.rt); renderer.setClearColor(0x000000,0); renderer.clear(); renderer.render(TH.sc,TH.cam); renderer.readRenderTargetPixels(TH.rt,0,0,TH.W,TH.H,TH.px); renderer.setRenderTarget(null); renderer.setClearColor(cc,ca);
  TH.sc.remove(c.g); for(const o of c.gear||[]) o.traverse(m=>{ if(m.isMesh&&!m.geometry.userData.keep) m.geometry.dispose(); });
  const cv=document.createElement('canvas'); cv.width=TH.W; cv.height=TH.H; const x=cv.getContext('2d'), im=x.createImageData(TH.W,TH.H), row=TH.W*4;
  for(let y=0;y<TH.H;y++) im.data.set(TH.px.subarray((TH.H-1-y)*row,(TH.H-y)*row),y*row); x.putImageData(im,0,0);
  return cv;
}
function lkPaint(i,cv){ const el=$('armTrack').children[i]; if(!el||LK.kind!=='skins') return; const c=el.querySelector('canvas'); if(!c||!c.hidden) return; c.getContext('2d').drawImage(cv,0,0); c.hidden=false; const ph=el.querySelector('.ph'); if(ph) ph.remove(); }
// one portrait every other frame, nearest to the middle card first
function lkThumbTick(){
  if(LK.kind!=='skins'||(LK.thumbBusy=(LK.thumbBusy+1)%2)) return;
  const n=LK.n, c=Math.max(0,LK.center); let pick=-1;
  for(let d=0;d<n&&pick<0;d++){ for(const i of[c+d,c-d]) if(i>=0&&i<n&&!LK.thumbs.has(i)){ pick=i; break; } }
  if(pick<0) return; const cv=lkThumb(pick); LK.thumbs.set(pick,cv); lkPaint(pick,cv); if(pick===(equippedSkin()||{}).i) showPickNote();
}
function setArmMode(m){
  if(m==='picks'&&!PX||m==='skins'&&!(SK&&SOLDIER)) return; armMode=m; $('armEquip').hidden=$('armRandom').hidden=m==='guns';
  $('armGunsTab').setAttribute('aria-pressed',String(m==='guns')); $('armPicksTab').setAttribute('aria-pressed',String(m==='picks')); $('armSkinsTab').setAttribute('aria-pressed',String(m==='skins'));
  const on=$(m==='guns'?'armGunsTab':m==='picks'?'armPicksTab':'armSkinsTab'), pill=$q('.seg .pill');
  if(pill){ const v={x:on.offsetLeft-4,width:on.offsetWidth}; if(GS&&!calmUI&&pill.style.width) GS.to(pill,{...v,duration:0.35,ease:'power3.out'}); else { pill.style.width=v.width+'px'; pill.style.transform=`translateX(${v.x}px)`; if(GS) GS.set(pill,v); } }
  $('armSets').hidden=m==='guns'; $('armSets').setAttribute('aria-label',m==='skins'?'Skin theme':'Pickaxe set');
  $('armSets').innerHTML=m==='skins'?SK.THEMES.map(t=>`<button data-s="${t.id}" aria-pressed="false">${t.n}</button>`).join(''):m==='picks'?PX.SETS.map(s=>`<button data-s="${s.id}" aria-pressed="false">${s.n}</button>`).join(''):'';
  LK.shown=lkIdx(); buildArmory(); lkRail(); lkFrame(true);
}
function armStep(d){ lkGo(LK.center+d,0.4); }
if(!PX) $('armPicksTab').hidden=true;
$('armSets').addEventListener('click',ev=>{ const b=ev.target.closest('button'); if(!b) return;
  lkGo(armMode==='skins'?SK.ITEMS.findIndex(i=>i.t===b.dataset.s):PX.ITEMS.findIndex(i=>i.set.id===b.dataset.s),0.8); });
$('armSkinsTab').addEventListener('click',()=>setArmMode('skins'));
// ---- skins in the locker
var skIdx=0, skShown=[];
function studioLights(gr){ const k=new T.DirectionalLight(0xfff4e6,0.9); k.position.set(2,3,5); const r=new T.DirectionalLight(0xbfd8ff,0.6); r.position.set(-3,2,-4); gr.add(k,k.target,r,r.target); }
function standChar(skin){ const c=makeCharacterGLB(); c.pick.visible=false; applySkin(c,skin); return c; }
function buildSkinStand(dir?){
  const it=SK.ITEMS[skIdx], r=RAR[it.r], c=standChar(it), h=new T.Group();
  c.g.rotation.y=Math.PI; h.add(c.g); h.userData.ch=c; h.userData.chG=c.g; skShown.push(c);
  LK.ped.visible=LK.ring.visible=LK.blob.visible=true; lkTint(r.c);
  lkPut(h,dir||0); if(LK.kind!=='skins'||dir==null) lkFrame(true);
  lkInfo(it.n,`${it.theme.n} · ${skIdx+1} of ${SK.ITEMS.length}`,r,'Outfit');
  $('armLabels').innerHTML='';
  showEquip(); [...$('armSets').children].forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.s===it.t)));
}
function updateSkinStand(t,dt){
  for(const c of skShown){ c.mixer.update(dt); swayGear({onGround:true,walkT:0},c,0,dt); }
}
// a fixed row of skins for screenshots (test hook)
function updateLineup(t,dt){
  for(const c of skShown){ c.g.rotation.y=c.g.userData.yaw; c.mixer.update(dt); swayGear({onGround:true,walkT:0},c,0,dt); }
  camera.position.set(0,ARM_Y+1.25,armGroup.userData.dist); camera.lookAt(0,ARM_Y+1.0,0); if(camera.fov!==50){ camera.fov=50; camera.updateProjectionMatrix(); }
}
$('armGunsTab').addEventListener('click',()=>setArmMode('guns'));
lkInitRail();
// ---- locker: the equipped pickaxe is the one you carry into matches (looks only, every pickaxe plays the same)
let equippedName='Standard Issue';
// pickaxes that were renamed: a saved equip under the old name carries over
const PICK_RENAMED={"Jack's Grin":'Jack-o-Lantern','Night Wing':'Spooky Shadow',"Reaper's Toll":'Grim Reaper','Candy Corn Crusher':'Candy Corn',"Witch's Brew":"Witch's Wart",'Ghost Light':'Glossy Ghost'};
try{ let v=localStorage.getItem('stormIslandPick'); if(v&&PICK_RENAMED[v]){ v=PICK_RENAMED[v]; localStorage.setItem('stormIslandPick',v); } if(v&&PX&&PX.ITEMS.some(i=>i.n===v)) equippedName=v; }catch(e){}
function equippedPick(){ return PX?PX.ITEMS.find(i=>i.n===equippedName)||null:null; }
// Random: a fresh pickaxe and/or skin is rolled at the start of every match (the last one rolled stays equipped)
let pickRandom=false, skinRandom=false;
try{ pickRandom=localStorage.getItem('stormIslandPickRandom')==='1'; skinRandom=localStorage.getItem('stormIslandSkinRandom')==='1'; }catch(e){}
function rollLoadout(){
  if(pickRandom&&PX) equippedName=PX.ITEMS[Math.floor(Math.random()*PX.ITEMS.length)].n;
  if(skinRandom&&SK) skinName=SK.ITEMS[Math.floor(Math.random()*SK.ITEMS.length)].n; }
function setRandom(on){ if(armMode==='skins') skinRandom=on; else pickRandom=on;
  try{ localStorage.setItem(armMode==='skins'?'stormIslandSkinRandom':'stormIslandPickRandom',on?'1':'0'); }catch(e){} }
const DICE='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><g fill="currentColor"><circle cx="8" cy="8" r="1.6"/><circle cx="16" cy="8" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="8" cy="16" r="1.6"/><circle cx="16" cy="16" r="1.6"/></g></svg>';
function pickIcon(ic){ const it=PX&&PX.ITEMS[+ic.slice(2)]; return it?PX.pickSVG(it,'hb').replace('<svg viewBox="0 0 200 200"','<svg viewBox="24 22 152 152" width="30" height="30" aria-hidden="true"'):''; }
function showEquip(){ const rand=armMode==='skins'?skinRandom:pickRandom, on=!rand&&(armMode==='skins'?SK.ITEMS[skIdx].n===equippedSkinName():PX&&PX.ITEMS[pxIdx].n===equippedName), b=$('armEquip'); b.textContent=on?'Equipped ✓':'Equip'; b.setAttribute('aria-pressed',String(!!on));
  const r=$('armRandom'); r.innerHTML=DICE+(rand?' Random each match ✓':' Random each match'); r.setAttribute('aria-pressed',String(rand)); }
function showPickNote(){ const eq=equippedPick(), sk=equippedSkin(), esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // the loadout cards on the home screen: a portrait of your skin and your pickaxe; each opens its tab in the locker
  let th=null; if(sk&&SOLDIER){ th=LK.thumbs.get(sk.i); if(!th){ th=lkThumb(sk.i); LK.thumbs.set(sk.i,th); } }
  const card=(go,k,v,col,art)=>`<button class="locard" data-go="${go}" style="--rc:${col}"><span class="lothumb">${art}</span><span class="lotxt"><i>${esc(k)}</i>${esc(v)}</span></button>`;
  $('pickNote').innerHTML=(SK?skinRandom?card('skins','Skin','Random','var(--neon)',DICE):card('skins','Skin',sk?sk.n:'Default Trooper',RAR[sk?sk.r:0].c,th?'<canvas width="160" height="200"></canvas>':''):'')
    +(PX?pickRandom?card('picks','Pickaxe','Random','var(--neon)',DICE):card('picks','Pickaxe',eq?eq.n:'Default',RAR[eq?eq.rar:0].c,eq?PX.pickSVG(eq,'lo'):ICONS.pick):'');
  const cv=$q('#pickNote canvas'); if(cv&&th) cv.getContext('2d').drawImage(th,0,0); }
function openLocker(mode){ const eq=equippedPick(); if(eq) pxIdx=eq.i; const sk=equippedSkin(); if(sk) skIdx=sk.i; openArmory(); setArmMode(mode); $('armEquip').focus(); }
$('pickNote').addEventListener('click',ev=>{ const b=ev.target.closest('.locard'); if(b) openLocker(b.dataset.go==='skins'&&SK&&SOLDIER?'skins':'picks'); });
// the equipped skin; bots dress up at random (a few stay in the classic armor)
var skinName=null;
function equippedSkinName(){ if(skinName==null){ skinName='Default Trooper'; try{ const v=localStorage.getItem('stormIslandSkin'); if(v&&SK&&SK.ITEMS.some(i=>i.n===v)) skinName=v; }catch(e){} } return skinName; }
function equippedSkin(){ return SK?SK.ITEMS.find(i=>i.n===equippedSkinName())||SK.ITEMS[0]:null; }
function pickBotSkin(){ return Math.random()<0.1?SK.ITEMS[0]:SK.ITEMS[1+Math.floor(Math.random()*(SK.ITEMS.length-1))]; }
function applyPickSkin(e){
  const eq=equippedPick(); if(!eq||!e||!e.ch) return;
  if(e===player){ animeSt=eq.anime||null; e.punches=[]; pwEquip(eq); } e.fistSt=['rubber','saitama','goku','titan'].includes(eq.anime); if(e===player){ endTitan(e,true); kiStop(e); stopWriting(e); e.guard=false; e.guardK=0; }
  dressPick(e.ch,eq);
}
// put a pickaxe's model in a character's hand (and the second blade of a dual pair in the other)
function dressPick(c,eq){
  for(const o of [...c.pick.children]){ c.pick.remove(o); if(o.userData.skin) disposeObj(o); }
  const w=new T.Group(); w.userData.skin=true; w.add(makePickaxe3D(eq,true)); c.pick.add(w);
  if(c.pickL){ c.g.remove(c.pickL); disposeObj(c.pickL); c.pickL=null; }
  const F=c.form=PX.formOf(eq); if(F&&F.dual){ c.pickL=new T.Group(); const w2=new T.Group(); w2.userData.skin=true; w2.add(makePickaxe3D(eq,true)); c.pickL.add(w2); c.pickL.visible=false; c.g.add(c.pickL); } // c.form: the weapon form (null for a plain pickaxe) for the swing classes [S3]
}
function equipCurrent(){
  setRandom(false);
  if(armMode==='skins'){ const it=SK.ITEMS[skIdx]; skinName=it.n; try{ localStorage.setItem('stormIslandSkin',it.n); }catch(e){} showEquip(); showPickNote(); lkMarkEq(); if(player) applySkin(player.ch,it); sfx('pickup',null,{item:{kind:'gun',r:it.r}}); return; }
  equippedName=PX.ITEMS[pxIdx].n; try{ localStorage.setItem('stormIslandPick',equippedName); }catch(e){} showEquip(); showPickNote(); lkMarkEq(); applyPickSkin(player); refreshHotbar(); sfx('pickup',null,{item:{kind:'gun',r:PX.ITEMS[pxIdx].rar}}); }
$('armEquip').addEventListener('click',equipCurrent);
$('armRandom').addEventListener('click',()=>{ const on=!(armMode==='skins'?skinRandom:pickRandom); setRandom(on); showEquip(); showPickNote(); lkMarkEq(); sfx(on?'pickup':'ui',null,{item:{kind:'gun',r:2}}); });
$('lockerBtn').addEventListener('click',()=>openLocker(SK&&SOLDIER?'skins':'picks'));
if(!PX&&!SK) $('lockerBtn').hidden=true; if(!SK) $('armSkinsTab').hidden=true; showPickNote();

$('armPicksTab').addEventListener('click',()=>setArmMode('picks'));

// ================= Zero-G Box =================
// The whole game: a huge white box full of floating white and gray blocks, no gravity and 20 tough bots.
// You swim through the air (Space up, C down); Shift kicks you forward in a burst, cartoon style, and
// drains stamina. Every so often the lights flash red and gravity flips: everyone is slammed onto the
// ceiling and fights upside down until the lights flash green and gravity lets go again.
const zgMats={};
function zgGridTex(cells,minor){ return canvasTex(512,512,(g,w)=>{ g.fillStyle='#f6f7f9'; g.fillRect(0,0,w,w);
  g.strokeStyle='rgba(120,128,142,.16)'; g.lineWidth=1; for(let i=0;i<=cells*minor;i++){ const x=i*w/(cells*minor); g.beginPath(); g.moveTo(x,0); g.lineTo(x,w); g.moveTo(0,x); g.lineTo(w,x); g.stroke(); }
  g.strokeStyle='rgba(110,118,132,.45)'; g.lineWidth=3; for(let i=0;i<=cells;i++){ const x=i*w/cells; g.beginPath(); g.moveTo(x,0); g.lineTo(x,w); g.moveTo(0,x); g.lineTo(w,x); g.stroke(); } }); }
function zgMat(hex){ if(!zgMats[hex]) zgMats[hex]=Lam({color:hex}); return zgMats[hex]; }
const zgEdgeMat=new T.LineBasicMaterial({color:0x8a9099,transparent:true,opacity:0.55});
function zgSolid(mesh,box){ const p=registerPiece({kind:'zg',hp:1e9,maxHp:1e9,obj:mesh,meshes:[mesh],box}); p.solid=true; return p; }
const BLK=3; // how much bigger the floating blocks are than they used to be
function buildZeroG(){
  const L=ZG.L, H=ZG.H;
  // the box itself: floor, ceiling and four walls, faced inward, with a faint measuring grid
  const faces=[[[0,0,0],[-Math.PI/2,0,0],2*L,2*L],[[0,H,0],[Math.PI/2,0,0],2*L,2*L],[[0,H/2,-L],[0,0,0],2*L,H],[[0,H/2,L],[0,Math.PI,0],2*L,H],[[-L,H/2,0],[0,Math.PI/2,0],2*L,H],[[L,H/2,0],[0,-Math.PI/2,0],2*L,H]];
  for(const [pos,rot,w,h] of faces as [[number,number,number],[number,number,number],number,number][]){ const tex=zgGridTex(4,4); tex.wrapS=tex.wrapT=T.RepeatWrapping; tex.repeat.set(w/32,h/32);
    const m=new T.Mesh(new T.PlaneGeometry(w,h),Lam({map:tex})); m.position.set(...pos); m.rotation.set(...rot); m.receiveShadow=true; world.add(m); }
  // glowing seams along the box's edges
  const seam=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(2*L-0.2,H-0.2,2*L-0.2)),new T.LineBasicMaterial({color:0x9aa2ae})); seam.position.y=H/2; world.add(seam);
  // the blocks: white, light gray and gray, floating at every height, plus a few floor-to-ceiling pillars
  const cols=[0xffffff,0xffffff,0xf0f1f3,0xdfe2e6,0xc9cdd3,0xaeb3ba,0x8d939b], placed=[];
  const fits=(x,y,z,sx,sy,sz,pad)=>Math.abs(x)+sx/2<L-4&&Math.abs(z)+sz/2<L-4&&y-sy/2>=0&&y+sy/2<=H&&!placed.some(b=>Math.abs(b.x-x)<(b.sx+sx)/2+pad&&Math.abs(b.y-y)<(b.sy+sy)/2+pad&&Math.abs(b.z-z)<(b.sz+sz)/2+pad);
  const add=(x,y,z,sx,sy,sz,col)=>{ placed.push({x,y,z,sx,sy,sz});
    const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),zgMat(col)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; world.add(m);
    const ep=new T.EdgesGeometry(m.geometry).attributes.position.array; for(let i=0;i<ep.length;i+=3) edges.push(ep[i]+x,ep[i+1]+y,ep[i+2]+z); zgSolid(m,boxOf(x,y,z,sx,sy,sz)); };
  const edges=[];
  for(let i=0;i<18;i++){ const s=rnd(4,7)*BLK, x=rnd(-L+12,L-12), z=rnd(-L+12,L-12); if(fits(x,H/2,z,s,H,s,6)) add(x,H/2,z,s,H,s,pick([0xdfe2e6,0xc9cdd3])); }
  let n=0, tries=0;
  while(n<120&&tries<14000){ tries++; const kind=Math.random(); let sx,sy,sz;
    if(kind<0.45){ sx=sy=sz=rnd(3,9); } else if(kind<0.75){ sx=rnd(8,18); sz=rnd(8,18); sy=rnd(1.2,2.5); } else if(kind<0.9){ sx=rnd(2,4); sz=rnd(2,4); sy=rnd(10,22); } else { sx=rnd(10,24); sz=rnd(2,3); sy=rnd(5,10); }
    sx*=BLK; sy*=BLK; sz*=BLK; if(sy>H*0.75) sy=H*0.75; // blocks are 3x their old size
    const x=rnd(-L+6,L-6), z=rnd(-L+6,L-6), y=Math.random()<0.15?sy/2:rnd(sy/2+2,H-sy/2-2);
    if(!fits(x,y,z,sx,sy,sz,3)) continue; add(x,y,z,sx,sy,sz,pick(cols)); n++; }
  const eg=new T.BufferGeometry(); eg.setAttribute('position',new T.Float32BufferAttribute(edges,3)); world.add(new T.LineSegments(eg,zgEdgeMat));
  ZG.blocks=placed;
}
// is a person-sized space at p free of blocks?
function zgFree(x,y,z,m?){ m=m||1.2; if(Math.abs(x)>ZG.L-3||Math.abs(z)>ZG.L-3||y<1||y>ZG.H-4) return false;
  return !ZG.blocks.some(b=>Math.abs(b.x-x)<b.sx/2+m&&Math.abs(b.y-(y+1))<b.sy/2+m+1&&Math.abs(b.z-z)<b.sz/2+m); }
function zgSpawn(e,i,n){ for(let k=0;k<400;k++){ const a=(i/n)*Math.PI*2+rnd(-0.3,0.3), r=rnd(ZG.L*0.35,ZG.L*0.85), x=Math.cos(a)*r, z=Math.sin(a)*r, y=rnd(8,ZG.H-14); if(zgFree(x,y,z,2)){ e.pos.set(x,y,z); break; } }
  e.vel.set(0,0,0); e.onGround=false; e.zgFloat=true; e.zgRoll=0; e.stam=100; e.yaw=Math.atan2(e.pos.x,e.pos.z); }
// moves someone through the box: no gravity while floating, pulled up onto the ceiling after a flip
function zgMove(e,dt){
  const p=e.pos, r=e.radius, h=2.0; let hitY=0;
  if(ZG.state==='ceil'){ e.vel.y=Math.min(38,e.vel.y+GRAV*dt); }
  for(const ax of ['x','z','y']){ const d=e.vel[ax]*dt; if(!d) continue; p[ax]+=d;
    for(const b of colliders.near(p.x,p.z,r+1)){
      if(p.x+r<=b.min.x||p.x-r>=b.max.x||p.z+r<=b.min.z||p.z-r>=b.max.z||p.y+h<=b.min.y||p.y>=b.max.y) continue;
      if(ax==='y'){ if(d>0){ p.y=b.min.y-h; hitY=1; } else { p.y=b.max.y; hitY=-1; } e.vel.y=0; }
      else { p[ax]=d>0?b.min[ax]-r:b.max[ax]+r; e.vel[ax]*=-0.2; } } }
  const L=ZG.L-r-0.1;
  if(p.x<-L){ p.x=-L; e.vel.x=0; } else if(p.x>L){ p.x=L; e.vel.x=0; }
  if(p.z<-L){ p.z=-L; e.vel.z=0; } else if(p.z>L){ p.z=L; e.vel.z=0; }
  if(p.y<0.05){ p.y=0.05; if(e.vel.y<0) e.vel.y=0; hitY=-1; } else if(p.y+h>ZG.H-0.05){ p.y=ZG.H-0.05-h; if(e.vel.y>0) e.vel.y=0; hitY=1; }
  const was=e.onGround; e.onGround=ZG.state==='ceil'&&hitY===1;
  if(e.onGround&&!was&&e.zgFall>8){ e.anim.land=clamp(e.zgFall/20,0.3,1); if(e===player){ sfx('land',null,{v:e.zgFall,surf:'rock'}); camShake=Math.max(camShake,0.35); } }
  e.zgFall=e.onGround?0:Math.max(0,e.vel.y);
  e.zgFloat=ZG.state!=='ceil';
}
// stamina: the propel burst drains it; it refills after a short rest, and running dry locks it until it is a third full
function zgStamina(e,want,dt){
  if(e.stamLock&&e.stam>33) e.stamLock=false;
  const can=want&&!e.stamLock&&e.stam>0;
  if(can){ e.stam=Math.max(0,e.stam-34*dt); e.stamRest=0; if(e.stam<=0){ e.stamLock=true; if(e===player) toast('No stamina'); } }
  else { e.stamRest=(e.stamRest||0)+dt; if(e.stamRest>0.6) e.stam=Math.min(100,e.stam+22*dt); }
  return can;
}
const _zf=new V(), _zr=new V(), _zw=new V();
function updatePlayerZG(dt){
  const p=player; if(!p.alive){ p.wantJump=false; return; }
  if(p.bounceT>0){ p.wantJump=false; updateBounce(p,dt); return; }
  if(lockedUp(p)){ p.wantJump=false; p.zgPropel=false; p.vel.multiplyScalar(Math.exp(-(p.frozen>0?8:3)*dt)); zgMove(p,dt); return; } // frozen or stunned: no control
  const flip=ZG.camRoll>Math.PI/2, cp=Math.cos(p.pitch);
  let mx=(keys.KeyD?1:0)-(keys.KeyA?1:0), mz=(keys.KeyW?1:0)-(keys.KeyS?1:0); if(flip) mx=-mx;
  const my=(keys.Space?1:0)-(keys.KeyC||keys.ControlLeft?1:0);
  _zr.set(Math.cos(p.yaw),0,-Math.sin(p.yaw)); p.crouch=false;
  if(ZG.state!=='ceil'){
    // swim toward where you look; Shift kicks you forward fast
    const prop=zgStamina(p,(keys.ShiftLeft||keys.ShiftRight)&&mz>0&&!ads,dt);
    if(prop&&!p.zgPropel) sfx('propel'); p.zgPropel=prop;
    _zf.set(-Math.sin(p.yaw)*cp,Math.sin(p.pitch),-Math.cos(p.yaw)*cp);
    const sp=(prop?22:ads?5.5:9)*slowK(p)*bv(p,'spd',1);
    _zw.set(0,0,0).addScaledVector(_zf,mz).addScaledVector(_zr,mx); _zw.y+=my; if(_zw.lengthSq()>1) _zw.normalize(); _zw.multiplyScalar(sp);
    const k=1-Math.exp(-(prop?2.6:2.2)*(p.boostT>0?0.12:1)*dt); p.vel.lerp(_zw,k);
    p.zgTx=prop?-1.25:-0.75*clamp(mz,0,1)*(curItem()&&curItem().kind==='gun'?0.2:1);
  } else {
    p.zgPropel=false; zgStamina(p,false,dt);
    const sprint=(keys.ShiftLeft||keys.ShiftRight)&&mz>0&&!ads; p.sprinting=sprint&&p.onGround;
    const sp=(ads?4.5:sprint?11:7.5)*slowK(p)*bv(p,'spd',1), fx=-Math.sin(p.yaw), fz=-Math.cos(p.yaw), k=1-Math.exp(-(p.onGround?14:3)*dt);
    p.vel.x=lerp(p.vel.x,(fx*mz+_zr.x*mx)*sp,k); p.vel.z=lerp(p.vel.z,(fz*mz+_zr.z*mx)*sp,k);
    if(p.onGround&&p.wantJump){ p.vel.y=-10.5; p.onGround=false; sfx('jump'); }
    p.zgTx=0;
  }
  p.wantJump=false; zgMove(p,dt);
}
// the flip cycle: float, a red warning, the ceiling, then a green all-clear
function updateZG(dt){
  ZG.t-=dt; ZG.flash=Math.max(0,ZG.flash-dt*1.2);
  if(ZG.state==='float'&&ZG.t<=0){ ZG.state='warn'; ZG.t=3; banner('Gravity flip!','',3); sfx('stormWarn'); }
  else if(ZG.state==='warn'){ if(Math.floor(ZG.t*4)!==Math.floor((ZG.t+dt)*4)) sfx('alarm',null,{hi:Math.floor(ZG.t*4)%2===0});
    if(ZG.t<=0){ ZG.state='ceil'; ZG.t=rnd(14,20); for(const e of combatants){ e.zgRoll=Math.PI; e.vel.y=Math.max(e.vel.y,6); e.zgPropel=false; } sfx('gravUp'); camShake=Math.max(camShake,0.5); banner('Upside down!','',2.5); } }
  else if(ZG.state==='ceil'&&ZG.t<=0){ ZG.state='float'; ZG.t=rnd(24,36); ZG.flash=1; for(const e of combatants){ e.zgRoll=0; e.onGround=false; e.vel.y=-rnd(2,4); } sfx('gravDown'); banner('Zero-G','',2); }
  const want=ZG.state==='ceil'?Math.PI:0; ZG.camRoll+=(want-ZG.camRoll)*(1-Math.exp(-5*dt)); if(Math.abs(want-ZG.camRoll)<0.002) ZG.camRoll=want;
}
// bots turn smoothly, at most a turn and a bit per second, so they never snap round
const BOT_TURN=7;
function botTurn(b,want,k,dt){ const d=wrapPi(want-b.yaw), step=d*(1-Math.exp(-k*dt)), mx=BOT_TURN*dt; b.yaw=wrapPi(b.yaw+clamp(step,-mx,mx)); }
function updateBotZG(b,dt){
  if(!b.alive) return;
  if(b.knockT>0){ b.knockT-=dt; b.zgPropel=false; b.vel.multiplyScalar(Math.exp(-0.6*dt)); zgMove(b,dt); return; } // knocked flying
  if(lockedUp(b)){ b.zgPropel=false; b.zgTx=0; b.vel.multiplyScalar(Math.exp(-(b.frozen>0?8:3)*dt)); zgMove(b,dt); return; } // frozen or stunned: can't move, turn or shoot
  b.think-=dt; b.fireCd-=dt; b.reloadT-=dt; b.swapT-=dt; b.strafeT-=dt;
  if(b.enemy&&(!b.enemy.alive||bv(b.enemy,'hide')||b.blindT>0)) b.enemy=null; // invisible, or blinded by a power-up
  const ceil=ZG.state==='ceil', c=tv1.set(b.pos.x,b.pos.y+1,b.pos.z);
  if(b.think<=0){ b.think=rnd(0.15,0.3);
    let best=null; const near=[];
    for(const o of combatants){ if(o===b||!o.alive||bv(o,'hide')||b.blindT>0) continue; const d=Math.hypot(o.pos.x-b.pos.x,o.pos.y-b.pos.y,o.pos.z-b.pos.z); if(d<160) near.push([d,o]); }
    near.sort((x,y)=>x[0]-y[0]); let bd=1e9; for(let i=0;i<Math.min(6,near.length);i++){ const o=near[i][1]; if(hasLOS(c,tv2.set(o.pos.x,o.pos.y+1,o.pos.z))){ best=o; bd=near[i][0]; break; } }
    // stick with the current target while it is still in sight, unless someone much closer turns up (no flicking between targets)
    const cur=b.enemy; if(cur&&cur!==best&&cur.alive){ const dc=Math.hypot(cur.pos.x-b.pos.x,cur.pos.y-b.pos.y,cur.pos.z-b.pos.z); if(dc<160&&dc<bd*1.6+6&&hasLOS(c,tv2.set(cur.pos.x,cur.pos.y+1,cur.pos.z))) best=cur; }
    if(best){ if(best!==b.enemy) b.seenAt=matchTime; b.enemy=best; b.lastSeen=best.pos.clone(); b.lastSeenT=matchTime; }
    else if(b.enemy&&matchTime-b.lastSeenT>0.8) b.enemy=null;
    if(!b.enemy&&(!b.goal||Math.random()<0.05)){ for(let k=0;k<20;k++){ const x=rnd(-ZG.L+8,ZG.L-8), y=rnd(4,ZG.H-8), z=rnd(-ZG.L+8,ZG.L-8); if(zgFree(x,y,z)){ b.goal=new V(x,y,z); break; } } }
  }
  const wish=_zw.set(0,0,0); let speed=9, prop=false;
  if(b.enemy){ const e=b.enemy, dx=e.pos.x-b.pos.x, dy=e.pos.y-b.pos.y, dz=e.pos.z-b.pos.z, d=Math.hypot(dx,dy,dz)||1, dh=Math.hypot(dx,dz)||1;
    const want=d<12&&b.inv[1]?b.inv[1]:b.inv[0];
    if(want!==b.gun&&b.swapT<=0){ b.gun=want; b.mag=WEAP[want.id].mag; b.fireCd=Math.max(b.fireCd,0.3); b.swapT=1.2; }
    botTurn(b,Math.atan2(-dx,-dz),12,dt); b.aimPitch=lerp(b.aimPitch||0,Math.atan2(dy,dh)*(b.zgRoll>1.5?-1:1),1-Math.exp(-10*dt));
    if(b.strafeT<=0){ b.strafe=Math.random()<0.5?-1:1; b.vstrafe=rnd(-1,1); b.strafeT=rnd(0.4,1.1); }
    const pref=WEAP[b.gun.id].pref, fwd=d>pref+5?1:d<pref-4?-0.7:0;
    wish.set(dx/d*fwd+(-dz/dh)*b.strafe*0.9,ceil?0:dy/d*fwd+b.vstrafe*0.7,dz/d*fwd+(dx/dh)*b.strafe*0.9);
    if(!ceil&&d>pref+25) prop=zgStamina(b,true,dt);
    if(matchTime>(b.wake||SPAWN_GRACE)&&matchTime-b.seenAt>b.react&&b.fireCd<=0&&b.reloadT<=0&&!(b.jamT>0)) botShoot(b,e,d); // nobody fires in the first few seconds, then bots join in one by one (b.wake) so 100 guns don't all go off on the same frame
  } else if(b.goal){ const g=b.goal, dx=g.x-b.pos.x, dy=g.y-b.pos.y, dz=g.z-b.pos.z, d=Math.hypot(dx,dy,dz);
    if(d<3) b.goal=null; else { wish.set(dx/d,ceil?0:dy/d,dz/d); botTurn(b,Math.atan2(-dx,-dz),5,dt); } b.aimPitch=lerp(b.aimPitch||0,0,1-Math.exp(-6*dt)); }
  if(!prop) zgStamina(b,false,dt); b.zgPropel=prop;
  // keep off the walls
  const m=10; if(b.pos.x<-ZG.L+m) wish.x+=1; if(b.pos.x>ZG.L-m) wish.x-=1; if(b.pos.z<-ZG.L+m) wish.z+=1; if(b.pos.z>ZG.L-m) wish.z-=1;
  if(!ceil){ if(b.pos.y<4) wish.y+=1; if(b.pos.y>ZG.H-8) wish.y-=1; }
  dodgeFlyers(b,wish,ceil);
  if(wish.lengthSq()>1) wish.normalize();
  const slow=slowK(b);
  if(ceil){ speed=7.5*slow; const k=1-Math.exp(-(b.onGround?12:3)*dt); b.vel.x=lerp(b.vel.x,wish.x*speed,k); b.vel.z=lerp(b.vel.z,wish.z*speed,k); if(b.enemy&&b.onGround&&Math.random()<dt*0.6) b.vel.y=-10.5; b.zgTx=0; }
  else { speed=(prop?21:9)*slow; b.vel.lerp(wish.multiplyScalar(speed),1-Math.exp(-2.4*(b.boostT>0?0.12:1)*dt)); b.zgTx=prop?-1.25:b.enemy?-0.1:-0.6; }
  // stuck behind a block: pick a new way
  b.stuckT=(b.stuckT||0)+dt; if(b.stuckT>1){ if(b.pos.distanceTo(b.lastPos)<1&&(wish.lengthSq()>0.1)){ b.goal=null; b.vstrafe=-(b.vstrafe||1); if(!ceil) b.vel.y+=rnd(-6,6); } b.lastPos.copy(b.pos); b.stuckT=0; }
  zgMove(b,dt);
}
// ================= flying blocks & booster pads =================
// Flying blocks: dark blocks with red edges that fly around the box and bounce off everything.
// Touching one is an instant elimination, shield or not.
const FLY_N=24, FLY_GRACE=3, SPAWN_GRACE=5;
const flyMat=Lam({color:0xe8283c,emissive:0x5a0010});
const flyEdge=new T.LineBasicMaterial({color:0xffd0d5});
function buildFlyers(){
  ZG.flyers=[];
  for(let i=0;i<FLY_N;i++){
    const cube=Math.random()<0.6, s=cube?rnd(3,5.5):0, hx=cube?s/2:rnd(1.2,2), hy=cube?s/2:rnd(1.2,2), hz=cube?s/2:rnd(3,5);
    const m=new T.Mesh(new T.BoxGeometry(hx*2,hy*2,hz*2),flyMat); m.castShadow=true;
    m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry),flyEdge)); world.add(m);
    const f={m,h:new V(hx,hy,hz),pos:new V(),vel:new V(),spin:new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(0.6),whizT:0};
    for(let k=0;k<200;k++){ f.pos.set(rnd(-ZG.L+8,ZG.L-8),rnd(8,ZG.H-8),rnd(-ZG.L+8,ZG.L-8)); if(!flyHitsBlock(f)&&!combatants.some(e=>e.pos.distanceTo(f.pos)<22)) break; }
    f.vel.set(rnd(-1,1),rnd(-0.6,0.6),rnd(-1,1)).normalize().multiplyScalar(rnd(12,22));
    m.position.copy(f.pos); ZG.flyers.push(f);
  }
}
function flyHitsBlock(f){ for(const b of ZG.blocks) if(Math.abs(b.x-f.pos.x)<b.sx/2+f.h.x&&Math.abs(b.y-f.pos.y)<b.sy/2+f.h.y&&Math.abs(b.z-f.pos.z)<b.sz/2+f.h.z) return b; return null; }
function updateFlyers(dt){
  for(const f of ZG.flyers){
    f.pos.addScaledVector(f.vel,dt);
    // bounce off the box walls, floor and ceiling
    const lim={x:ZG.L,y:ZG.H,z:ZG.L};
    for(const ax of ['x','y','z']){ const lo=ax==='y'?f.h.y:-lim[ax]+f.h[ax], hi=lim[ax]-f.h[ax];
      if(f.pos[ax]<lo){ f.pos[ax]=lo; f.vel[ax]=Math.abs(f.vel[ax]); } else if(f.pos[ax]>hi){ f.pos[ax]=hi; f.vel[ax]=-Math.abs(f.vel[ax]); } }
    // bounce off the floating blocks, pushed out along the shallowest side
    const b=flyHitsBlock(f);
    if(b){ const px=b.sx/2+f.h.x-Math.abs(f.pos.x-b.x), py=b.sy/2+f.h.y-Math.abs(f.pos.y-b.y), pz=b.sz/2+f.h.z-Math.abs(f.pos.z-b.z);
      const ax=px<py&&px<pz?'x':py<pz?'y':'z', c={x:b.x,y:b.y,z:b.z}[ax], sgn=f.pos[ax]>c?1:-1, pen={x:px,y:py,z:pz}[ax];
      f.pos[ax]+=sgn*pen; f.vel[ax]=sgn*Math.abs(f.vel[ax]); sfx('impact',f.pos.clone(),{mat:'stone'}); }
    f.m.position.copy(f.pos); f.m.rotation.x+=f.spin.x*dt; f.m.rotation.y+=f.spin.y*dt; f.m.rotation.z+=f.spin.z*dt;
    // anyone touching it is out
    if(matchTime>FLY_GRACE) for(const e of combatants){ if(!e.alive||e.bounceT>0) continue;
      if(Math.abs(e.pos.x-f.pos.x)<f.h.x+e.radius&&Math.abs(e.pos.y+1-f.pos.y)<f.h.y+1&&Math.abs(e.pos.z-f.pos.z)<f.h.z+e.radius){
        puff(e.pos.clone().add(new V(0,1,0)),0xff3347); sfx('impact',e.pos.clone(),{mat:'stone'}); if(e===player) camShake=Math.max(camShake,1);
        eliminate(e,null,'flying block',{dir:f.vel.clone(),speed:f.vel.length()}); } }
    // a whoosh when one flies close past you
    f.whizT-=dt; if(player&&player.alive&&f.whizT<=0&&f.pos.distanceTo(player.pos)<9){ f.whizT=1; sfx('whiz',f.pos.clone()); }
  }
}
// bots steer away from flying blocks heading their way
function dodgeFlyers(b,wish,ceil){
  for(const f of ZG.flyers){ tv3.subVectors(b.pos,f.pos); tv3.y+=1; const d=tv3.length(); if(d>16||tv3.dot(f.vel)<=0) continue;
    tv3.multiplyScalar(2/d); if(ceil) tv3.y=0; wish.add(tv3); }
}
// Booster pads: glowing pads on the floor, ceiling, walls and big flat blocks that launch you away from them.
const PAD_R=3.4, PAD_V=34;
const padTex=canvasTex(128,128,(g,w)=>{ g.clearRect(0,0,w,w); g.strokeStyle='#ffffff'; g.lineWidth=12; g.lineCap='round'; g.lineJoin='round';
  for(const y of [34,70,106]){ g.beginPath(); g.moveTo(26,y); g.lineTo(64,y-26); g.lineTo(102,y); g.stroke(); } });
padTex.wrapT=T.RepeatWrapping;
function addPad(pos,n){
  const g=new T.Group(); g.position.copy(pos); g.quaternion.setFromUnitVectors(UP,n);
  const base=new T.Mesh(new T.CylinderGeometry(PAD_R,PAD_R+0.2,0.25,28),Lam({color:0x1d2a3a,emissive:0x0a5a70})); base.position.y=0.12; g.add(base);
  const arrows=new T.Mesh(new T.PlaneGeometry(PAD_R*1.5,PAD_R*1.5),new T.MeshBasicMaterial({map:padTex,color:0x5cf0ff,transparent:true,depthWrite:false}));
  arrows.rotation.x=-Math.PI/2; arrows.position.y=0.27; g.add(arrows);
  const glow=new T.Mesh(new T.CylinderGeometry(PAD_R,PAD_R,2.2,28,1,true),new T.MeshBasicMaterial({color:0x5cf0ff,transparent:true,opacity:0.18,side:T.DoubleSide,depthWrite:false,blending:T.AdditiveBlending}));
  glow.position.y=1.25; g.add(glow); world.add(g);
  ZG.pads.push({pos:pos.clone(),n:n.clone(),g,glow,arrows,pulse:0});
}
function buildPads(){
  ZG.pads=[]; const L=ZG.L, H=ZG.H, down=new V(0,-1,0);
  const clear=(x,z,y0,y1)=>!ZG.blocks.some(b=>Math.abs(b.x-x)<b.sx/2+PAD_R+1&&Math.abs(b.z-z)<b.sz/2+PAD_R+1&&b.y+b.sy/2>y0&&b.y-b.sy/2<y1);
  const spot=(y0,y1)=>{ for(let k=0;k<200;k++){ const x=rnd(-L+10,L-10), z=rnd(-L+10,L-10); if(clear(x,z,y0,y1)) return [x,z]; } return null; };
  for(let i=0;i<12;i++){ const s=spot(0,4); if(s) addPad(new V(s[0],0.02,s[1]),UP); }
  for(let i=0;i<12;i++){ const s=spot(H-4,H); if(s) addPad(new V(s[0],H-0.02,s[1]),down); }
  for(const [n,wall] of [[new V(1,0,0),new V(-L+0.02,0,0)],[new V(-1,0,0),new V(L-0.02,0,0)],[new V(0,0,1),new V(0,0,-L+0.02)],[new V(0,0,-1),new V(0,0,L-0.02)]] as [any,any][]){
    for(let k=0;k<3;k++){ const t=rnd(-L+15,L-15), y=rnd(12,H-12); const p=wall.clone(); if(n.x) p.z=t; else p.x=t; p.y=y; addPad(p,n); } }
  // on top of and under some big flat blocks
  const flats=ZG.blocks.filter(b=>b.sx>=8*BLK&&b.sz>=8*BLK&&b.sy<=2.6*BLK); flats.sort(()=>Math.random()-0.5);
  for(const b of flats.slice(0,14)){ const top=Math.random()<0.5; addPad(new V(b.x,top?b.y+b.sy/2+0.02:b.y-b.sy/2-0.02,b.z),top?UP:down); }
}
function updatePads(dt){
  for(const pd of ZG.pads){ pd.pulse=Math.max(0,pd.pulse-dt*2.5); pd.arrows.material.map.offset.y-=dt*0.6; pd.glow.material.opacity=0.14+0.5*pd.pulse; pd.glow.scale.y=1+pd.pulse*1.5; pd.glow.position.y=1.25*(1+pd.pulse*1.5); }
  for(const e of combatants){ if(!e.alive||e.bounceT>0) continue; e.padT=Math.max(0,(e.padT||0)-dt); e.boostT=Math.max(0,(e.boostT||0)-dt); if(e.padT>0) continue;
    for(const pd of ZG.pads){ tv3.set(e.pos.x,e.pos.y+1,e.pos.z).sub(pd.pos); const along=tv3.dot(pd.n); if(along<-0.5||along>2.6) continue;
      tv3.addScaledVector(pd.n,-along); if(tv3.length()>PAD_R+0.3) continue;
      e.vel.addScaledVector(pd.n,-e.vel.dot(pd.n)).addScaledVector(pd.n,PAD_V); e.onGround=false; e.padT=0.6; e.boostT=1.1; pd.pulse=1;
      sfx('boost',pd.pos.clone()); if(e===player) camShake=Math.max(camShake,0.3); break; } }
}
// ================= explosions & fire =================
// Explosions hurt everyone in range (less toward the edge) and throw them away from the blast; your own
// explosions never hurt you. The box is white, so fire and smoke use normal blending to show up against it.
let projs=[], fires=[];
const flameTex=canvasTex(64,128,(g)=>{ for(let i=0;i<26;i++){ const k=i/25, y=112-k*98, r=27*(1-k*0.8)*(0.65+0.35*Math.sin(k*Math.PI*0.9+0.3));
  const gr=g.createRadialGradient(32,y,0,32,y,r); gr.addColorStop(0,'rgba(255,255,255,.24)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.beginPath(); g.arc(32,y,r,0,TAU); g.fill(); } });
const scorchTex=canvasTex(256,256,(g,w)=>{ const gr=g.createRadialGradient(128,128,10,128,128,126); gr.addColorStop(0,'rgba(18,14,12,.95)'); gr.addColorStop(0.55,'rgba(30,24,20,.75)'); gr.addColorStop(1,'rgba(40,34,30,0)');
  g.fillStyle=gr; g.fillRect(0,0,w,w); for(let i=0;i<70;i++){ const a=Math.random()*TAU, r=Math.random()*90; g.fillStyle=`rgba(255,${90+Math.random()*90|0},20,${Math.random()*0.5})`; g.beginPath(); g.arc(128+Math.cos(a)*r,128+Math.sin(a)*r,Math.random()*5+1,0,TAU); g.fill(); } });
const smokeMat=new T.SpriteMaterial({map:glowTex,color:0x55575c,transparent:true,depthWrite:false,opacity:0.6});
const fireMat=new T.SpriteMaterial({map:glowTex,color:0xff7a1a,transparent:true,depthWrite:false});
const flameMat=new T.SpriteMaterial({map:flameTex,color:0xff8a1f,transparent:true,depthWrite:false});
// one licking flame: rises, shrinks and goes from yellow to red
const _fc1=new T.Color(0xffd34a), _fc2=new T.Color(0xe8380e);
function flame(p,size,life,vel){ const m=flameMat.clone(), s=new T.Sprite(m); s.position.copy(p); world.add(s); const v=vel.clone();
  effects.push({t:0,dur:life,obj:s,upd:(e,k,dt)=>{ s.position.addScaledVector(v,dt); s.scale.set(size*(1-k*0.6),size*1.7*(1-k*0.4),1); m.color.copy(_fc1).lerp(_fc2,k); m.opacity=0.95*(1-k*k); },done:()=>m.dispose()}); }
function smoke(p,size,life,vel,dark?){ const m=smokeMat.clone(); if(dark) m.color.setHex(0x2e2f33); const s=new T.Sprite(m); s.position.copy(p); world.add(s); const v=vel.clone(), r0=Math.random()*6;
  effects.push({t:0,dur:life,obj:s,upd:(e,k,dt)=>{ s.position.addScaledVector(v,dt); v.multiplyScalar(Math.exp(-1.2*dt)); s.scale.setScalar(size*(0.4+1.1*Math.sqrt(k))); m.rotation=r0+k; m.opacity=0.6*(1-k); },done:()=>m.dispose()}); }
// a scorch mark on the surface with normal n
function scorch(p,n,r,life){ const m=new T.Mesh(new T.PlaneGeometry(r*2,r*2),new T.MeshBasicMaterial({map:scorchTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}));
  m.position.copy(p).addScaledVector(n,0.04); m.lookAt(_dv.copy(m.position).add(n)); m.rotation.z=Math.random()*TAU; world.add(m);
  effects.push({t:0,dur:life,obj:m,upd:(e,k)=>{ m.material.opacity=k<0.8?1:1-(k-0.8)/0.2; },done:()=>{ m.geometry.dispose(); m.material.dispose(); }}); }
function explode(p,o){
  // o: {r, dmg, src, weapon, n (surface normal or null), fire}
  const r=o.r;
  for(const t of combatants){ if(!t.alive||t===o.src) continue; tv3.set(t.pos.x,t.pos.y+1,t.pos.z).sub(p); const d=tv3.length(); if(d>r) continue;
    const k=1-d/r, dir=d>0.01?tv3.divideScalar(d).clone():new V(0,1,0);
    t.vel.addScaledVector(dir,22*k); hurt(t,o.dmg*(0.3+0.7*k),o.src,{explosive:true,dir,weapon:o.weapon,point:p.clone()}); }
  // the fireball: a hot core, rolling fire, black smoke, a shock sphere and flying debris
  const core=new T.Mesh(new T.SphereGeometry(1,18,14),new T.MeshBasicMaterial({color:0xfff0a0,transparent:true,depthWrite:false})); core.position.copy(p); world.add(core);
  effects.push({t:0,dur:0.35,obj:core,upd:(e,k)=>{ core.scale.setScalar(0.5+r*0.55*Math.sqrt(k)); core.material.color.setHex(k<0.4?0xfff0a0:0xff9a2a); core.material.opacity=1-k; },done:()=>{ core.geometry.dispose(); core.material.dispose(); }});
  const shock=new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,opacity:0.4,side:T.DoubleSide})); shock.position.copy(p); world.add(shock);
  effects.push({t:0,dur:0.3,obj:shock,upd:(e,k)=>{ shock.scale.setScalar(1+r*1.3*k); shock.material.opacity=0.4*(1-k); },done:()=>{ shock.geometry.dispose(); shock.material.dispose(); }});
  const bias=o.n||new V(0,0,0);
  for(let i=0;i<26;i++){ const v=new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().add(bias).normalize().multiplyScalar(rnd(4,11)*r/10);
    const m=fireMat.clone(), s=new T.Sprite(m), sz=rnd(2.6,4.6)*r/10; s.position.copy(p); world.add(s); m.color.setHex(pick([0xff7a1a,0xffa22a,0xff5410,0xffc23a]));
    effects.push({t:0,dur:rnd(0.5,0.9),obj:s,upd:(e,k,dt)=>{ s.position.addScaledVector(v,dt); v.multiplyScalar(Math.exp(-3*dt)); s.scale.setScalar(sz*(0.6+1.4*Math.sqrt(k))); m.color.lerp(_fc2,dt*2); m.opacity=1-k*k; },done:()=>m.dispose()}); }
  for(let i=0;i<14;i++) smoke(p.clone().add(new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(r*0.25)),rnd(3,5.5)*r/10,rnd(1.8,3.2),new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).add(bias).multiplyScalar(rnd(2,5)),i%2===0);
  for(let i=0;i<14;i++){ const m=new T.Mesh(shardGeo,colorMat(pick([0x26272a,0x3a3a3a,0x8d939b]))), v=new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().add(bias).multiplyScalar(rnd(10,22)), w=new V(rnd(-9,9),rnd(-9,9),rnd(-9,9));
    m.position.copy(p); world.add(m); effects.push({t:0,dur:rnd(0.8,1.4),obj:m,upd:(e,k,dt)=>{ if(ZG.state==='ceil') v.y+=GRAV*dt; m.position.addScaledVector(v,dt); m.rotation.x+=w.x*dt; m.rotation.y+=w.y*dt; m.scale.setScalar(1-k); }}); }
  if(o.n) scorch(p,o.n,r*0.55,14);
  if(o.n){ const ring=new T.Mesh(new T.RingGeometry(0.7,1,48),new T.MeshBasicMaterial({color:0xffb04a,transparent:true,side:T.DoubleSide,depthWrite:false}));
    ring.position.copy(p).addScaledVector(o.n,0.15); ring.lookAt(_dv.copy(ring.position).add(o.n)); world.add(ring);
    effects.push({t:0,dur:0.45,obj:ring,upd:(e,k)=>{ ring.scale.setScalar(1+k*r*1.4); ring.material.opacity=0.85*(1-k); },done:()=>{ ring.geometry.dispose(); ring.material.dispose(); }}); }
  if(o.fire&&o.n) firePatch(p,o.n,o.src);
  const dp=player?p.distanceTo(player.pos):99; camShake=Math.max(camShake,clamp(1.5-dp/45,0,1.4));
  sfx('boom',p.clone(),{gain:o.big?1.2:0.9});
}
// a burning patch left behind: flames lick up from a scorched circle and burn anyone standing in it
const FIRE_R=4.5, FIRE_T=8;
function firePatch(p,n,src){
  const f={p:p.clone().addScaledVector(n,0.05),n:n.clone(),src,t:0,tick:0,spawn:0,crack:0,u:new V(),v:new V()};
  f.u.set(1,0,0); if(Math.abs(n.x)>0.9) f.u.set(0,1,0); f.u.addScaledVector(n,-f.u.dot(n)).normalize(); f.v.crossVectors(n,f.u);
  scorch(p,n,FIRE_R*1.15,FIRE_T+5); fires.push(f);
}
function updateFires(dt){
  for(let i=fires.length-1;i>=0;i--){ const f=fires[i]; f.t+=dt; if(f.t>FIRE_T){ fires.splice(i,1); continue; }
    const fade=f.t>FIRE_T-1.5?(FIRE_T-f.t)/1.5:1;
    f.spawn+=dt*55*fade; while(f.spawn>1){ f.spawn--; const a=Math.random()*TAU, r=Math.sqrt(Math.random())*FIRE_R;
      const q=f.p.clone().addScaledVector(f.u,Math.cos(a)*r).addScaledVector(f.v,Math.sin(a)*r), big=1-r/FIRE_R*0.5;
      flame(q.addScaledVector(f.n,0.5),rnd(1.5,2.6)*big,rnd(0.45,0.8),f.n.clone().multiplyScalar(rnd(1.6,3.2)));
      if(Math.random()<0.12) smoke(q.clone().addScaledVector(f.n,1.5),rnd(1.5,2.5),rnd(1.5,2.2),f.n.clone().multiplyScalar(rnd(1.5,3)),true); }
    f.crack-=dt; if(f.crack<=0){ f.crack=rnd(0.15,0.4); sfx('crackle',f.p.clone()); }
    f.tick-=dt; if(f.tick<=0){ f.tick=0.25;
      for(const e of combatants){ if(!e.alive||e===f.src) continue; tv3.set(e.pos.x,e.pos.y+1,e.pos.z).sub(f.p); const h=tv3.dot(f.n); if(h<-0.5||h>3.2) continue;
        tv3.addScaledVector(f.n,-h); if(tv3.length()>FIRE_R+e.radius) continue; hurt(e,4,f.src,{weapon:'Fire',dir:f.n.clone(),point:e.pos.clone().add(new V(0,1,0))}); } } }
}

// ================= RPG =================
// The rocket leaves the muzzle at 45 m/s and speeds up, trailing fire and smoke, and blows up on the first
// thing it touches (or after 5 seconds). The blast leaves a burning patch on the surface it hit.
const RK_GEO={body:new T.CylinderGeometry(0.05,0.05,0.32,14).rotateX(Math.PI/2),nose:new T.CylinderGeometry(0.008,0.05,0.24,14).rotateX(Math.PI/2),tail:new T.CylinderGeometry(0.028,0.04,0.3,10).rotateX(Math.PI/2),fin:BX(0.006,0.1,0.12)};
function rocketModel(){
  const g=new T.Group(), add=(geo,mat,z,rz?)=>{ const m=new T.Mesh(geo,mat); m.position.z=z; if(rz!=null) m.rotation.z=rz; m.castShadow=true; g.add(m); return m; };
  add(RK_GEO.nose,GUN_MAT.green,0.28); add(RK_GEO.body,GUN_MAT.green,0.02); add(RK_GEO.tail,GUN_MAT.dark,-0.29);
  for(let i=0;i<4;i++){ const f=add(RK_GEO.fin,GUN_MAT.dark,-0.4,i*Math.PI/2); f.position.x=Math.sin(i*Math.PI/2)*0.07; f.position.y=Math.cos(i*Math.PI/2)*0.07; }
  const glow=new T.Sprite(fireMat.clone()); glow.material.color.setHex(0xffb03a); glow.position.z=-0.55; glow.scale.setScalar(0.9); g.add(glow); g.userData.glow=glow;
  g.scale.setScalar(1.5); return g;
}
// where the crosshair is pointing: the first thing along the camera's line of sight
function aimPoint(shooter,dir,far){
  ray.set(camera.position,dir); ray.near=camDistNow+0.4; ray.far=far;
  const hits=ray.intersectObjects(meshesAlong(camera.position,dir,far,true),false); const h=hits.find(x=>x.object.userData.ent!==shooter);
  const d=boxRay(camera.position,dir,h?h.distance:far); return camera.position.clone().addScaledVector(dir,Math.max(d,6));
}
function launchRocket(src,o,dir){
  const m=rocketModel(); m.position.copy(o); m.lookAt(_dv.copy(o).add(dir)); world.add(m);
  projs.push({kind:'rocket',src,m,pos:o.clone(),vel:dir.clone().multiplyScalar(45),t:0,trail:0});
}
// a backblast of smoke out of the back of the tube
function rpgBackblast(e){ const c=e.ch; if(!c.held) return; c.held.updateMatrixWorld(true);
  const back=c.held.localToWorld(new V(0,0.06,0.75)), dir=back.clone().sub(c.held.localToWorld(new V(0,0.06,0))).normalize();
  for(let i=0;i<8;i++) smoke(back.clone(),rnd(0.8,1.6),rnd(0.8,1.4),dir.clone().multiplyScalar(rnd(4,9)).add(new V(rnd(-1,1),rnd(-1,1),rnd(-1,1))));
  for(let i=0;i<4;i++) flame(back.clone(),rnd(0.5,0.8),0.2,dir.clone().multiplyScalar(rnd(5,8))); }
// the surface normal where the box or a block stops a segment, if it does
function segHit(o,dir,len,src){
  const tb=boxRay(o,dir,len); let n=null, d=len;
  if(tb<len){ d=tb; const q=o.clone().addScaledVector(dir,tb), L=ZG.L;
    n=q.x<=-L+0.01?new V(1,0,0):q.x>=L-0.01?new V(-1,0,0):q.z<=-L+0.01?new V(0,0,1):q.z>=L-0.01?new V(0,0,-1):q.y<=0.01?new V(0,1,0):new V(0,-1,0); }
  ray.set(o,dir); ray.near=0; ray.far=d;
  const hits=ray.intersectObjects(meshesAlong(o,dir,d,true),false); const h=hits.find(x=>x.object.userData.ent!==src);
  if(h){ const ent=h.object.userData.ent; return {d:h.distance,ent:ent&&ent.etype==='char'?ent:null,head:h.object.userData.part==='head',n:ent&&ent.etype==='char'?null:h.face?h.face.normal.clone():null}; }
  return n?{d,ent:null,n}:null;
}
function updateProjs(dt){
  for(let i=projs.length-1;i>=0;i--){ const P=projs[i]; P.t+=dt;
    if(P.kind==='rocket'){
      P.vel.multiplyScalar(1+dt*0.9); const sp=P.vel.length(); if(sp>85) P.vel.multiplyScalar(85/sp);
      const len=P.vel.length()*dt, dir=P.vel.clone().normalize(), h=segHit(P.pos,dir,len,P.src);
      if(h||P.t>5){ const at=P.pos.clone().addScaledVector(dir,h?Math.max(0,h.d-0.15):len);
        let n=h&&h.n?h.n:null;
        if(!n){ const s=segHit(at,dir,8,P.src); if(s&&s.n&&!s.ent){ const q=at.clone().addScaledVector(dir,s.d); explode(at,{r:10,dmg:140,src:P.src,weapon:'RPG',n:null,big:true}); firePatch(q,s.n,P.src); removeProj(i); continue; } }
        explode(at,{r:10,dmg:140,src:P.src,weapon:'RPG',n,fire:true,big:true}); removeProj(i); continue; }
      // the trail: smoke every half metre, a flicker of flame at the tail
      P.trail+=len; const tail=P.pos.clone().addScaledVector(dir,-0.7);
      while(P.trail>0.5){ P.trail-=0.5; smoke(tail.clone().addScaledVector(dir,-P.trail),rnd(0.7,1.1),rnd(1.1,1.7),new V(rnd(-0.4,0.4),rnd(-0.4,0.4),rnd(-0.4,0.4))); }
      flame(tail,rnd(0.5,0.8),0.12,dir.clone().multiplyScalar(-6));
      P.pos.addScaledVector(dir,len); P.m.position.copy(P.pos); P.m.lookAt(_dv.copy(P.pos).add(dir)); P.m.rotateZ(P.t*12);
      const gl=P.m.userData.glow; gl.scale.setScalar(rnd(0.7,1.1));
      if(player&&player.alive&&P.src!==player&&P.pos.distanceTo(player.pos)<10) sfx('whiz',P.pos.clone());
    } else if(P.kind==='paint') updatePaint(P,i,dt); else updateGrenade(P,i,dt);
  }
}
function removeProj(i){ const P=projs[i]; world.remove(P.m); projs.splice(i,1); }

// ================= grenade vest =================
// The Grenade Launcher is a vest with six pineapple grenades strapped across the chest. Left click unhooks
// one, pulls the pin and throws it; it bounces, blinks and goes off after two seconds (or on hitting someone).
// A new grenade is strapped back on every 2.5 seconds.
const GREN_N=6, GREN_REGEN=2.5, THROW_T=0.9, THROW_REL=0.64;
const pineTex=canvasTex(64,64,(g,w)=>{ g.fillStyle='#4c5530'; g.fillRect(0,0,w,w); const n=8, s=w/n;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){ const x=i*s, y=j*s; g.fillStyle='#6b7744'; g.fillRect(x+1.5,y+1.5,s-3,s-3); g.fillStyle='#8a9658'; g.fillRect(x+1.5,y+1.5,s-3,2); g.fillStyle='#39401f'; g.fillRect(x+1.5,y+s-3,s-3,1.5); } });
const GRN:Record<string,any>={};
function grenadeParts(){ if(GRN.body) return GRN;
  GRN.body=new T.SphereGeometry(1,16,14).scale(0.03,0.038,0.03); GRN.fuse=new T.CylinderGeometry(0.011,0.013,0.026,10); GRN.cap=new T.CylinderGeometry(0.014,0.014,0.008,10);
  GRN.spoon=new T.BoxGeometry(0.01,0.058,0.005); GRN.ring=new T.TorusGeometry(0.011,0.0022,6,16);
  GRN.mBody=new T.MeshPhongMaterial({color:0xffffff,map:pineTex,bumpMap:pineTex,bumpScale:0.6,shininess:18}); GRN.mSteel=GPh(0x6c6f66,70,0x888888); GRN.mSpoon=GPh(0x6f7650,40);
  return GRN; }
function makeGrenade(){ const P=grenadeParts(), g=new T.Group();
  const add=(geo,mat,x,y,z)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; };
  add(P.body,P.mBody,0,0,0); add(P.fuse,P.mSteel,0,0.045,0); add(P.cap,P.mSteel,0,0.06,0);
  const sp=add(P.spoon,P.mSpoon,0.022,0.03,0); sp.rotation.z=-0.32; const ring=add(P.ring,P.mSteel,-0.024,0.05,0); ring.rotation.y=Math.PI/2; g.userData.ring=ring; g.userData.spoon=sp;
  return g; }
// the vest itself, worn on the upper chest bone (metres; +y up the spine, +z out of the chest)
const vestMats={shell:GPh(0x55603a,8,0x111111),web:GPh(0x3a4126,6,0x111111),buckle:GPh(0x1d1e1c,40)};
function makeVest(){
  const g=new T.Group(), M=(geo,mat,x,y,z)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; };
  const shell=M(new T.CylinderGeometry(0.205,0.218,0.3,24,1,true),vestMats.shell,0,0.02,0.015); shell.scale.set(1.08,1,0.92); shell.material.side=T.DoubleSide;
  const belt=M(new T.TorusGeometry(0.21,0.016,6,30),vestMats.web,0,-0.12,0.015); belt.rotation.x=Math.PI/2; belt.scale.set(1.08,0.92,1);
  for(const sx of [-1,1]){ const st=M(new T.TorusGeometry(0.15,0.02,6,16,Math.PI),vestMats.web,sx*0.1,0.13,0.0); st.rotation.y=Math.PI/2; st.scale.set(1,1,0.55); }
  const gs=[];
  for(let i=0;i<GREN_N;i++){ const col=i%3, row=Math.floor(i/3), x=(col-1)*0.095, y=row?-0.055:0.075, z=0.205*Math.sqrt(1-Math.pow(x/0.23,2))+0.03;
    const pouch=M(new T.BoxGeometry(0.078,0.02,0.05),vestMats.web,x,y-0.045,z-0.006); pouch.rotation.y=-x*1.4;
    const gr=makeGrenade(); gr.position.set(x,y,z); gr.rotation.y=-x*1.4; g.add(gr); gs.push(gr);
    const strap=M(new T.BoxGeometry(0.07,0.013,0.008),vestMats.web,x,y+0.005,z+0.03); strap.rotation.y=-x*1.4; M(new T.BoxGeometry(0.014,0.016,0.01),vestMats.buckle,x+0.02,y+0.005,z+0.033).rotation.y=-x*1.4; }
  g.userData.gs=gs; return g;
}
function vestItem(e){ return e.isPlayer?e.slots.find(s=>s&&s.kind==='vest'):null; }
function syncVest(e){
  const c=e.ch, it=vestItem(e);
  if(it&&!c.vest){ c.g.updateMatrixWorld(true); const bone=c.bones.Spine2, ws=new V(), sc=new V(); c.g.getWorldScale(ws); bone.matrixWorld.decompose(tv1,_qP,sc);
    const wrap=new T.Group(); wrap.scale.setScalar(ws.x/sc.x); const v=makeVest(); wrap.add(v); bone.add(wrap); c.vest=v; v.traverse((o:any)=>{ if(o.isMesh) o.frustumCulled=false; });
    c.handG=makeGrenade(); c.handG.scale.setScalar(MODEL_SCALE); c.handG.visible=false; c.g.add(c.handG); }
  if(!c.vest) return;
  const n=it?it.count:0, T0=e.throwA;
  c.vest.userData.gs.forEach((gr,i)=>{ gr.visible=i<n&&!(T0&&T0.grabbed&&!T0.released&&i===n-1); });
}
function startThrow(it){ const p=player; if(p.throwA) return; if(it.count<=0){ sfx('empty'); return; } p.throwA={t:0,it,grabbed:false,pinned:true,released:false}; }
function updateThrow(dt){
  const p=player; if(!p) return;
  for(const s of p.slots) if(s&&s.kind==='vest'&&s.count<GREN_N){ s.regen=(s.regen||0)+dt; if(s.regen>=GREN_REGEN){ s.regen=0; s.count++; refreshHotbar(); } }
  const A=p.throwA; if(!A) return; A.t+=dt; const k=A.t/THROW_T, c=p.ch;
  if(!A.grabbed&&k>=0.24){ A.grabbed=true; sfx('unhook'); }
  if(A.pinned&&k>=0.47){ A.pinned=false; sfx('pin'); if(c.handG){ const r=c.handG.userData.ring, w=r.getWorldPosition(new V()); pinFly(w); } }
  if(!A.released&&k>=THROW_REL){ A.released=true; A.it.count--; refreshHotbar();
    const from=c.handG?c.handG.getWorldPosition(new V()):p.pos.clone().add(new V(0,1.6,0)); camera.getWorldDirection(tv1);
    const at=aimPoint(p,tv1,120), dir=at.sub(from).normalize(), vel=dir.multiplyScalar(30).addScaledVector(p.vel,0.5); if(ZG.state==='ceil') vel.y-=5;
    const m=makeGrenade(); m.scale.setScalar(1.6); m.userData.ring.visible=false; m.userData.spoon.visible=false; m.position.copy(from); world.add(m);
    const blink=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xff2030,transparent:true,depthWrite:false})); blink.position.y=0.1; blink.scale.setScalar(0.35); m.add(blink);
    projs.push({kind:'gren',src:p,m,blink,pos:from.clone(),vel,spin:new V(rnd(-14,14),rnd(-14,14),rnd(-14,14)),t:0,fuse:2,lastN:null,lastNT:-9,clink:0});
    sfx('swing'); }
  if(k>=1) p.throwA=null;
}
// the pin and its ring spin away from the left hand
function pinFly(p){ const m=new T.Mesh(grenadeParts().ring,GRN.mSteel); m.scale.setScalar(1.3); m.position.copy(p); world.add(m); const v=new V(rnd(-2,2),rnd(1,3),rnd(-2,2));
  effects.push({t:0,dur:1.2,obj:m,upd:(e,k,dt)=>{ m.position.addScaledVector(v,dt); m.rotation.x+=dt*16; m.rotation.y+=dt*11; m.scale.setScalar(1.3*(1-k*k)); }}); }
function updateGrenade(P,i,dt){
  P.fuse-=dt; P.clink-=dt;
  if(ZG.state==='ceil') P.vel.y+=GRAV*0.8*dt; P.vel.multiplyScalar(Math.exp(-0.15*dt));
  P.pos.addScaledVector(P.vel,dt); const r=0.12, L=ZG.L; let n=null;
  if(P.pos.x<-L+r){ P.pos.x=-L+r; n=new V(1,0,0); } else if(P.pos.x>L-r){ P.pos.x=L-r; n=new V(-1,0,0); }
  if(P.pos.z<-L+r){ P.pos.z=-L+r; n=new V(0,0,1); } else if(P.pos.z>L-r){ P.pos.z=L-r; n=new V(0,0,-1); }
  if(P.pos.y<r){ P.pos.y=r; n=new V(0,1,0); } else if(P.pos.y>ZG.H-r){ P.pos.y=ZG.H-r; n=new V(0,-1,0); }
  for(const b of ZG.blocks){ const px=b.sx/2+r-Math.abs(P.pos.x-b.x), py=b.sy/2+r-Math.abs(P.pos.y-b.y), pz=b.sz/2+r-Math.abs(P.pos.z-b.z); if(px<=0||py<=0||pz<=0) continue;
    if(px<py&&px<pz){ const s=P.pos.x>b.x?1:-1; P.pos.x+=s*px; n=new V(s,0,0); } else if(py<pz){ const s=P.pos.y>b.y?1:-1; P.pos.y+=s*py; n=new V(0,s,0); } else { const s=P.pos.z>b.z?1:-1; P.pos.z+=s*pz; n=new V(0,0,s); } break; }
  if(n){ const vn=P.vel.dot(n); if(vn<0){ P.vel.addScaledVector(n,-1.5*vn).multiplyScalar(0.72); P.spin.multiplyScalar(0.6); if(-vn>2&&P.clink<=0){ P.clink=0.08; sfx('clink',P.pos.clone()); } } P.lastN=n; P.lastNT=P.fuse; }
  P.m.position.copy(P.pos); P.m.rotation.x+=P.spin.x*dt; P.m.rotation.y+=P.spin.y*dt; P.m.rotation.z+=P.spin.z*dt;
  // the light blinks faster as the fuse runs down
  const rate=P.fuse>1?4:P.fuse>0.5?8:16; P.blink.visible=Math.sin(P.fuse*rate*TAU)>0;
  let hitE=false; for(const e of combatants){ if(!e.alive||e===P.src) continue; if(Math.hypot(e.pos.x-P.pos.x,e.pos.y+1-P.pos.y,e.pos.z-P.pos.z)<1.1){ hitE=true; break; } }
  if(P.fuse<=0||hitE){ const onSurf=P.lastN&&P.lastNT-P.fuse<0.25; explode(P.pos.clone(),{r:7.5,dmg:110,src:P.src,weapon:'Grenade',n:onSurf?P.lastN:null}); removeProj(i); }
}
// The throw: the right hand reaches to the chest and unhooks the top grenade, brings it in front of the chest
// where the left hand pulls the pin, winds back over the shoulder and throws overarm, then follows through.
// Times are fractions of the throw; positions are from the right shoulder in body axes [right, up, forward].
const _cr=(a,b,c,d,u)=>{ const u2=u*u, u3=u2*u; return new V().addScaledVector(a,-0.5*u3+u2-0.5*u).addScaledVector(b,1.5*u3-2.5*u2+1).addScaledVector(c,-1.5*u3+2*u2+0.5*u).addScaledVector(d,0.5*u3-0.5*u2); };
function pathAt(keys,k){ let i=0; while(i<keys.length-2&&k>keys[i+1][0]) i++; const a=keys[Math.max(0,i-1)][1], b=keys[i][1], c=keys[i+1][1], d=keys[Math.min(keys.length-1,i+2)][1];
  return _cr(a,b,c,d,clamp((k-keys[i][0])/(keys[i+1][0]-keys[i][0]),0,1)); }
function throwPose(e,c,rightB,fwdB,upB){
  const B=c.bones, A=e.throwA, k=clamp(A.t/THROW_T,0,1), w=o=>o.getWorldPosition(new V());
  const rS=w(B.RightArm), lS=w(B.LeftArm), natR=w(B.RightHand), natL=w(B.LeftHand), chest=w(B.Spine2).addScaledVector(fwdB,0.36).addScaledVector(upB,0.02);
  const rel=(o,x,y,z)=>o.clone().addScaledVector(rightB,x).addScaledVector(upB,y).addScaledVector(fwdB,z);
  const it=A.it, gi=Math.max(0,it.count-1), gObj=c.vest&&c.vest.userData.gs[gi], gp=gObj?w(gObj):rel(chest,0,0,-0.1);
  const grab=gp.clone().addScaledVector(fwdB,0.05).addScaledVector(upB,-0.08).addScaledVector(rightB,0.02);
  // body twist: the chest turns away to wind up, then whips round into the throw
  const bell=(a,b)=>k<a||k>b?0:Math.sin((k-a)/(b-a)*Math.PI);
  const tw=-0.42*bell(0.42,0.68)+0.5*bell(0.6,0.92); rotateBoneWorld(B.Spine1,upB,tw*0.6); rotateBoneWorld(B.Spine2,upB,tw*0.4); rotateBoneWorld(B.Spine1,rightB,-0.15*bell(0.45,0.66)+0.22*bell(0.62,0.9));
  const R=[[0,natR],[0.12,rel(grab,0,-0.04,0.06)],[0.24,grab],[0.34,rel(gp,0,0.0,0.2)],[0.47,rel(chest,0.06,-0.04,0)],[0.58,rel(rS,0.14,0.3,-0.3)],[THROW_REL,rel(rS,0.02,0.32,0.3)],[0.74,rel(rS,-0.12,0.05,0.55)],[0.86,rel(rS,-0.3,-0.25,0.35)],[1,natR]];
  const L=[[0,natL],[0.3,natL],[0.44,rel(chest,-0.02,-0.02,0.02)],[0.53,rel(chest,-0.28,-0.04,-0.02)],[0.64,rel(lS,-0.08,0.12,0.5)],[0.8,rel(lS,-0.1,0.0,0.45)],[1,natL]];
  const elbowUp=bell(0.45,0.75), poleR=rS.clone().addScaledVector(rightB,0.5).addScaledVector(upB,-0.6+0.9*elbowUp).addScaledVector(fwdB,-0.15);
  solveIK(B.RightArm,B.RightForeArm,B.RightHand,pathAt(R,k),poleR);
  solveIK(B.LeftArm,B.LeftForeArm,B.LeftHand,pathAt(L,k),lS.clone().addScaledVector(rightB,-0.5).addScaledVector(upB,-0.6).addScaledVector(fwdB,-0.1));
  // fingers close round the grenade while it is held
  const hold=A.grabbed&&!A.released, h=w(B.RightHand), f0=w(B.RightHandMiddle1).sub(h).normalize(), a0=w(B.RightHandPinky1).sub(w(B.RightHandIndex1)); a0.addScaledVector(f0,-a0.dot(f0)).normalize();
  const n0=new V().crossVectors(f0,a0);
  poseHand(B,'Right',f0,n0,hold?0.85:k<0.24?0.3*k/0.24:0.2);
  if(k>0.4&&k<0.56) poseHand(B,'Left',w(B.LeftHandMiddle1).sub(w(B.LeftHand)),rightB,0.9); // pinching the pin ring
  if(c.handG){ c.handG.visible=hold; if(hold){ const pc=h.clone().addScaledVector(f0,0.075).addScaledVector(n0,0.04); c.handG.position.copy(c.g.worldToLocal(pc));
    c.g.getWorldQuaternion(_qP); B.RightHand.getWorldQuaternion(_cq); c.handG.quaternion.copy(_qP.invert().multiply(_cq)); c.handG.userData.ring.visible=A.pinned; } }
}

// ================= Mirror Fractal Guns =================
// Each shot is a beam of golden light that bounces off walls, floor, ceiling and blocks up to 16 times,
// going through everyone in its way (each person is hit once per shot). Your own beams never hurt you.
// Each shot is a bolt of light that ricochets round the whole arena for a few seconds, off every block, wall,
// floor and ceiling. It hurts anyone it passes through, the shooter included once it has left the muzzle.
const MF_CLIP=30, MF_RELOAD=1.6;
const BOLT_V=260, BOLT_LIFE=4, BOLT_TRAIL=18, BOLT_SELF=0.25, BOLT_RE=0.35, BOLT_SEEK=150, BOLT_BEND=0.8;
const beamGeo=new T.CylinderGeometry(1,1,1,6,1,true);
const boltCore=new T.MeshBasicMaterial({color:0xffe680,transparent:true,depthWrite:false,fog:false});
const boltGlow=new T.MeshBasicMaterial({color:0xffa31a,transparent:true,opacity:0.6,depthWrite:false,fog:false});
const boltHeadMat=new T.SpriteMaterial({map:glowTex,color:0xffb21a,transparent:true,depthWrite:false,fog:false}); // normal blending: additive vanishes on the white box
let bolts=[], zapT=0;
function wallNormal(q){ const L=ZG.L; return q.x<=-L+0.02?new V(1,0,0):q.x>=L-0.02?new V(-1,0,0):q.z<=-L+0.02?new V(0,0,1):q.z>=L-0.02?new V(0,0,-1):q.y<=0.02?new V(0,1,0):new V(0,-1,0); }
function fireBolt(src,origin,dir,w){
  const g=new T.Group(), segs=[];
  for(let i=0;i<4;i++){ const sg=new T.Group(); for(const [m,r] of [[boltCore,0.09],[boltGlow,0.28]] as [any,number][]){ const c=new T.Mesh(beamGeo,m); c.scale.set(r,1,r); sg.add(c); } sg.visible=false; g.add(sg); segs.push(sg); }
  const head=new T.Sprite(boltHeadMat); head.scale.setScalar(2); g.add(head); world.add(g);
  bolts.push({src,w,pos:origin.clone(),dir:dir.clone().normalize(),t:0,pts:[origin.clone()],hit:new Map(),g,segs,head,bounces:0});
}
function boltSparks(p){ const s=new T.Sprite(mfSparkMat.clone()); s.position.copy(p); s.scale.setScalar(1.4); s.material.rotation=Math.random()*TAU; world.add(s);
  effects.push({t:0,dur:0.25,obj:s,upd:(e,k)=>{ s.material.opacity=1-k; s.scale.setScalar(1.4*(1-k*0.6)); },done:()=>s.material.dispose()}); }
// a bolt is a fat beam of light: anyone whose body comes within a hand's width of its path is hit (head shots near the head)
const BOLT_R=0.75, _bq=new V(), _bh=new V();
function segDist(o,d,len,p){ _bq.subVectors(p,o); const t=clamp(_bq.dot(d),0,len); return _bq.addScaledVector(d,-t).length(); }
function boltHits(B,o,d,len){
  for(const ent of combatants){ if(!ent.alive) continue; if(ent===B.src&&B.t<BOLT_SELF) continue;
    const cx=ent.pos.x, cy=ent.pos.y+1, cz=ent.pos.z; _bh.set(cx,cy,cz); if(segDist(o,d,len,_bh)>2.2) continue; // quick reject
    const up=ent.zgRoll>1.5?-1:1; // upside down the head is at the bottom
    const dHead=segDist(o,d,len,_bh.set(cx,cy+0.72*up,cz)), dChest=segDist(o,d,len,_bh.set(cx,cy+0.25*up,cz)), dLegs=segDist(o,d,len,_bh.set(cx,cy-0.45*up,cz));
    if(Math.min(dHead,dChest,dLegs)>BOLT_R) continue;
    const last=B.hit.get(ent); if(last!=null&&B.t-last<BOLT_RE) continue; B.hit.set(ent,B.t);
    const head=dHead<0.35&&dHead<=dChest; _bh.set(cx,cy,cz);
    hurt(ent,B.w.dmg*(head?B.w.head:1),B.src,{head,point:_bh.clone(),weapon:B.w.name,dir:d.clone()}); }
}
// trick shots: a bolt flies dead straight, but every time it bounces it comes off the surface angled toward the
// nearest enemy it can see from there (leading them a little), so it finds people through the ricochets
const _bs=new V();
function boltBounceAim(B,o,n){
  let best=null, bd=BOLT_SEEK;
  for(const e of combatants){ if(!e.alive||e===B.src) continue; const h=B.hit.get(e); if(h!=null&&B.t-h<BOLT_RE) continue;
    const dx=e.pos.x-o.x, dy=e.pos.y+1-o.y, dz=e.pos.z-o.z, d=Math.hypot(dx,dy,dz); if(d>=bd||(dx*n.x+dy*n.y+dz*n.z)<0.1*d) continue;
    if(!hasLOS(o,_bs.set(e.pos.x,e.pos.y+1,e.pos.z))) continue; bd=d; best=e; }
  if(!best) return;
  const lead=bd/BOLT_V; _bs.set(best.pos.x+best.vel.x*lead-o.x,best.pos.y+1+best.vel.y*lead-o.y,best.pos.z+best.vel.z*lead-o.z).normalize();
  _bs.x+=rnd(-0.02,0.02); _bs.y+=rnd(-0.02,0.02); _bs.z+=rnd(-0.02,0.02);
  B.dir.lerp(_bs.normalize(),BOLT_BEND).normalize(); if(B.dir.dot(n)<0.05) B.dir.addScaledVector(n,0.1-B.dir.dot(n)).normalize();
}
function updateBolts(dt){
  for(let i=bolts.length-1;i>=0;i--){ const B=bolts[i]; B.t+=dt;
    if(B.t>=BOLT_LIFE){ world.remove(B.g); bolts.splice(i,1); continue; }
    let left=BOLT_V*dt;
    for(let k=0;k<6&&left>1e-3;k++){ const o=B.pos, d=B.dir;
      ray.set(o,d); ray.near=0.02; ray.far=left; const hs=ray.intersectObjects(meshesAlong(o,d,left,false),false); let dist=left, n=null;
      if(hs.length&&hs[0].face){ dist=hs[0].distance; n=hs[0].face.normal.clone().transformDirection(hs[0].object.matrixWorld); }
      const tb=boxRay(o,d,dist); if(tb<dist){ dist=Math.max(0,tb); n=wallNormal(_dv.copy(o).addScaledVector(d,dist)); }
      boltHits(B,o,d,dist);
      o.addScaledVector(d,dist); left-=dist;
      if(!n) break;
      if(n.dot(d)>0) n.negate(); d.reflect(n).normalize(); o.addScaledVector(n,0.03); boltBounceAim(B,o,n); B.pts.push(o.clone()); B.bounces++;
      if(B.bounces%3===1) boltSparks(o); if(player&&o.distanceTo(player.pos)<35&&matchTime-zapT>0.06){ zapT=matchTime; sfx('zapB',o.clone()); }
    }
    // the trail: the last few metres of the path, bending round each bounce
    const fade=Math.min(1,(BOLT_LIFE-B.t)/0.6); let budget=BOLT_TRAIL, a=B.pos, s=0;
    for(let j=B.pts.length-1;j>=0&&s<B.segs.length&&budget>0.01;j--){ const b=B.pts[j], len=a.distanceTo(b); if(len<0.01) continue;
      const L=Math.min(len,budget), sg=B.segs[s++]; _dv.subVectors(b,a).normalize(); sg.visible=true; sg.scale.y=L; sg.quaternion.setFromUnitVectors(UP,_dv); sg.position.copy(a).addScaledVector(_dv,L/2);
      budget-=L; a=b; }
    for(;s<B.segs.length;s++) B.segs[s].visible=false;
    if(B.pts.length>8) B.pts.splice(0,B.pts.length-8);
    B.head.position.copy(B.pos); B.head.scale.setScalar(2*fade); B.g.traverse((c:any)=>{ if(c.isMesh) c.scale.x=c.scale.z=(c.material===boltCore?0.09:0.28)*fade; });
  }
}

// ================= Bouncer Ball =================
// Armour you keep once bought. Q wraps you in a glowing ball that bounces around the whole box at high speed
// for 5 seconds, knocking people out of the way, then pops wherever it ends up. You can't be hurt inside it.
// One minute to recharge.
const BOUNCE_T=5, BOUNCE_CD=60, BALL_R=1.4, BALL_V=42;
const ballMat=new T.MeshPhongMaterial({color:0x5cc8ff,emissive:0x0a3a5a,transparent:true,opacity:0.32,shininess:140,specular:0xffffff,depthWrite:false,side:T.DoubleSide});
const ballEdge=new T.LineBasicMaterial({color:0xd8f6ff,transparent:true,opacity:0.8});
const ballGeo=new T.IcosahedronGeometry(1,2), ballEdgeGeo=new T.EdgesGeometry(new T.IcosahedronGeometry(1.01,1));
function startBounce(p){
  if(!p.bouncer||!p.alive||p.bounceT>0) return; if(p.bouncer.cd>0){ sfx('deny'); return; }
  cancelActions(); p.throwA=null; p.bounceT=BOUNCE_T; p.bounceHit=new Set(); p.bounceKick=0;
  const a=Math.random()*TAU, dir=new V(Math.cos(a),rnd(-0.5,0.5),Math.sin(a)).normalize(); camera.getWorldDirection(tv1); p.vel.copy(dir.lerp(tv1,0.5).normalize().multiplyScalar(BALL_V));
  if(!p.ball){ const g=new T.Group(); g.add(new T.Mesh(ballGeo,ballMat)); g.add(new T.LineSegments(ballEdgeGeo,ballEdge)); p.ball=g; }
  p.ball.scale.setScalar(0.01); world.add(p.ball); sfx('ballOn'); camShake=Math.max(camShake,0.3);
}
const _bc=new V();
function updateBounce(p,dt){
  p.bounceT-=dt; p.zgPropel=false; p.onGround=false; p.zgFloat=true; p.zgTx=0;
  const c=_bc.set(p.pos.x,p.pos.y+1,p.pos.z), r=BALL_R; let n=null;
  c.addScaledVector(p.vel,dt);
  if(c.x<-ZG.L+r){ c.x=-ZG.L+r; n=new V(1,0,0); } else if(c.x>ZG.L-r){ c.x=ZG.L-r; n=new V(-1,0,0); }
  if(c.z<-ZG.L+r){ c.z=-ZG.L+r; n=new V(0,0,1); } else if(c.z>ZG.L-r){ c.z=ZG.L-r; n=new V(0,0,-1); }
  if(c.y<r){ c.y=r; n=new V(0,1,0); } else if(c.y>ZG.H-r){ c.y=ZG.H-r; n=new V(0,-1,0); }
  for(const b of ZG.blocks){ const px=b.sx/2+r-Math.abs(c.x-b.x), py=b.sy/2+r-Math.abs(c.y-b.y), pz=b.sz/2+r-Math.abs(c.z-b.z); if(px<=0||py<=0||pz<=0) continue;
    if(px<py&&px<pz){ const s=c.x>b.x?1:-1; c.x+=s*px; n=new V(s,0,0); } else if(py<pz){ const s=c.y>b.y?1:-1; c.y+=s*py; n=new V(0,s,0); } else { const s=c.z>b.z?1:-1; c.z+=s*pz; n=new V(0,0,s); } break; }
  // a bounce: reflect, with a random kick so the path is never the same twice
  if(n&&p.vel.dot(n)<0){ p.vel.reflect(n).normalize().add(new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(0.45)); if(p.vel.dot(n)<0.2) p.vel.addScaledVector(n,0.6); p.vel.normalize().multiplyScalar(BALL_V);
    p.bounceKick=1; sfx('boing',c.clone()); camShake=Math.max(camShake,0.25); for(let i=0;i<4;i++) puff(c.clone().addScaledVector(n,-r),0xbfeaff); }
  p.pos.set(c.x,c.y-1,c.z);
  // anyone in the way is knocked flying
  for(const e of combatants){ if(e===p||!e.alive||p.bounceHit.has(e)) continue; tv3.set(e.pos.x,e.pos.y+1,e.pos.z).sub(c); const d=tv3.length(); if(d>r+0.7) continue;
    p.bounceHit.add(e); e.vel.addScaledVector(tv3.normalize(),30); hurt(e,30,p,{weapon:'Bouncer Ball',dir:tv3.clone(),point:e.pos.clone().add(new V(0,1,0))}); sfx('slam',c.clone(),{v:0.6}); }
  // the ball: grows in, rolls along its path, squashes on each bounce
  const B=p.ball, gin=Math.min(1,(BOUNCE_T-p.bounceT)/0.2); p.bounceKick=Math.max(0,p.bounceKick-dt*5);
  B.position.copy(c); B.scale.setScalar(r*gin*(1+0.12*p.bounceKick)); B.children[0].material.opacity=0.32;
  _dv.crossVectors(UP,p.vel); if(_dv.lengthSq()>1e-4){ B.rotateOnWorldAxis(_dv.normalize(),BALL_V*dt/r); }
  if(p.bounceT<=0) endBounce(p);
}
function endBounce(p){
  p.bounceT=0; p.bouncer.cd=BOUNCE_CD; p.vel.multiplyScalar(0.15); if(p.ball) world.remove(p.ball);
  const c=new V(p.pos.x,p.pos.y+1,p.pos.z);
  for(let i=0;i<26;i++){ const m=new T.Mesh(shardGeo,shardMats[3].clone()); m.position.copy(c).add(new V(rnd(-1,1),rnd(-1,1),rnd(-1,1)).normalize().multiplyScalar(BALL_R)); world.add(m);
    const v=m.position.clone().sub(c).normalize().multiplyScalar(rnd(5,10)); effects.push({t:0,dur:rnd(0.5,0.9),obj:m,upd:(e,k,dt)=>{ m.position.addScaledVector(v,dt); m.rotation.x+=dt*9; m.scale.setScalar(1-k); m.material.opacity=1-k; },done:()=>m.material.dispose()}); }
  sfx('ballPop',c.clone()); camShake=Math.max(camShake,0.35);
}
function updateBouncerCd(dt){ const p=player; if(p&&p.bouncer&&p.bouncer.cd>0&&!(p.bounceT>0)) p.bouncer.cd=Math.max(0,p.bouncer.cd-dt); }

// ================= new guns: Freeze Ray, Taser, Flamethrower, Robot Drone =================
// Each one leaves a mark on whoever it hits: the Freeze Ray chills them until they freeze solid in a block of ice,
// the Taser locks them up with electricity, the Flamethrower sets them on fire, and the drone hunts them down.
// Frozen and stunned people can't move, turn or shoot (see updatePlayerZG, updateBotZG and animateGLB).
const FRZ_T=2.4, FRZ_IMMUNE=1, STUN_T=1.5, BURN_T=3;
// what the crosshair is on: the first person or surface along the camera's line of sight
function aimHit(src,dir,range){
  const o=camera.position; ray.set(o,dir); ray.near=camDistNow+0.4; ray.far=range;
  const hits=ray.intersectObjects(meshesAlong(o,dir,range,true),false), h=hits.find(x=>x.object.userData.ent!==src);
  const hd=h?h.distance:range, td=boxRay(o,dir,hd);
  if(td<hd) return {p:o.clone().addScaledVector(dir,td),ent:null,head:false,wall:true};
  if(h){ const ent=h.object.userData.ent, ch=ent&&ent.etype==='char'; return {p:h.point.clone(),ent:ch?ent:null,head:ch&&h.object.userData.part==='head',wall:!ch}; }
  return {p:o.clone().addScaledVector(dir,range),ent:null,head:false,wall:false};
}
// a stretched cylinder from a to b
const _sg=new V();
function placeSeg(m,a,b,r){ _sg.subVectors(b,a); const L=_sg.length()||0.001; m.scale.set(r,L,r); m.quaternion.setFromUnitVectors(UP,_sg.divideScalar(L)); m.position.copy(a).addScaledVector(_sg,L/2); }
const coldCore=new T.MeshBasicMaterial({color:0xd6f6ff,transparent:true,depthWrite:false,fog:false});
const coldGlow=new T.MeshBasicMaterial({color:0x37a9f0,transparent:true,depthWrite:false,fog:false,side:T.DoubleSide,opacity:0.45}); // solid colour, not additive: additive light vanishes against the white box
const zapCore=new T.MeshBasicMaterial({color:0xc9f0ff,transparent:true,depthWrite:false,fog:false});
const zapGlow=new T.MeshBasicMaterial({color:0x2a7dff,transparent:true,depthWrite:false,fog:false,opacity:0.4});
const snowMat=new T.SpriteMaterial({map:sparkTex,color:0x8fdcff,transparent:true,depthWrite:false});
const mistMat=new T.SpriteMaterial({map:glowTex,color:0x7ccdf5,transparent:true,depthWrite:false,opacity:0.6});
const voltMat=new T.SpriteMaterial({map:sparkTex,color:0x3f9bff,transparent:true,depthWrite:false});
const jetMat=new T.SpriteMaterial({map:glowTex,color:0xffd27a,transparent:true,depthWrite:false});
// a little sprite that drifts and fades
function mote(mat,p,size,life,vel,spin?){ const m=mat.clone(), s=new T.Sprite(m); s.position.copy(p); s.scale.setScalar(size); m.rotation=Math.random()*TAU; world.add(s); const v=vel.clone(), w=spin||0;
  effects.push({t:0,dur:life,obj:s,upd:(e,k,dt)=>{ s.position.addScaledVector(v,dt); v.multiplyScalar(Math.exp(-2*dt)); m.rotation+=w*dt; m.opacity=(1-k)*(mat.opacity==null?1:mat.opacity); s.scale.setScalar(size*(1+k*0.6)); },done:()=>m.dispose()}); }
const rv=(s)=>new V(rnd(-s,s),rnd(-s,s),rnd(-s,s));

// ---- Freeze Ray: a wavering beam of cold. Every hit chills the target a little more; fully chilled, they freeze solid.
function frostBeam(a,b,hit){
  const g=new T.Group(), core=new T.Mesh(beamGeo,coldCore), glw=new T.Mesh(beamGeo,coldGlow); g.add(glw); g.add(core); world.add(g);
  const ph=Math.random()*TAU, len=a.distanceTo(b);
  effects.push({t:0,dur:0.11,obj:g,upd:(e,k)=>{ const f=1-k; placeSeg(core,a,b,0.035*f+0.012); placeSeg(glw,a,b,(0.17+0.05*Math.sin(ph+matchTime*40))*f); }});
  // frost spirals along the beam, and a cloud of cold where it lands
  _dv.subVectors(b,a).normalize();
  for(let i=0;i<2;i++){ const q=a.clone().addScaledVector(_dv,Math.random()*len); mote(snowMat,q.add(rv(0.25)),rnd(0.12,0.25),rnd(0.35,0.6),rv(0.8).addScaledVector(_dv,2),rnd(-4,4)); }
  if(hit){ mote(mistMat,b.clone().add(rv(0.2)),rnd(0.6,1),rnd(0.3,0.5),rv(1.2)); mote(snowMat,b.clone(),rnd(0.3,0.5),0.25,rv(3),6); }
}
function frzFire(p,w){
  camera.getWorldDirection(tv1); const m=muzzlePos(p,new V()), h=nearMiss(p,tv1,aimHit(p,tv1,w.range+camDistNow),m,0.8);
  frostBeam(m,h.p,!!h.ent||h.wall);
  if(h.ent) chill(h.ent,p,w,h.head,h.p,tv1);
  p.pitch=Math.min(1.25,p.pitch+w.recoil*rnd(0.5,1)); fireFx(p,w,'frz'); sfx('frz');
}
function chill(t,src,w,head,pt,dir){
  hurt(t,w.dmg*(head?w.head:1),src,{head,point:pt,weapon:w.name,dir:dir.clone(),soft:true});
  if(!t.alive||t.bounceT>0||t.frozen>0||t.frzImm>0) return;
  t.chill=Math.min(1,(t.chill||0)+0.12); if(t.chill>=1) freezeChar(t);
}
const iceGeo=new T.BoxGeometry(1.3,2.4,1.3,2,3,2), iceEdge=new T.EdgesGeometry(new T.BoxGeometry(1.3,2.4,1.3));
{ const a=iceGeo.attributes.position; for(let i=0;i<a.count;i++) a.setXYZ(i,a.getX(i)*rnd(0.94,1.08),a.getY(i)*rnd(0.97,1.04),a.getZ(i)*rnd(0.94,1.08)); iceGeo.computeVertexNormals(); }
const iceMat=new T.MeshPhongMaterial({color:0xc4f1ff,emissive:0x1a5878,specular:0xffffff,shininess:140,transparent:true,opacity:0.5,depthWrite:false,flatShading:true});
const iceEdgeMat=new T.LineBasicMaterial({color:0xf2fcff,transparent:true,opacity:0.8});
const icicleGeo=new T.ConeGeometry(0.09,0.5,5);
function freezeChar(t){
  t.chill=0; t.frozen=FRZ_T; t.vel.multiplyScalar(0.15); t.burn=null;
  if(!t.ice){ const g=new T.Group(), m=new T.Mesh(iceGeo,iceMat); g.add(m); g.add(new T.LineSegments(iceEdge,iceEdgeMat));
    for(let i=0;i<7;i++){ const c=new T.Mesh(icicleGeo,iceMat), a=Math.random()*TAU, y=rnd(-1.1,1.1); c.position.set(Math.cos(a)*0.66,y,Math.sin(a)*0.66); c.rotation.set(rnd(-0.6,0.6)+(y>0?0:Math.PI),0,rnd(-0.6,0.6)); c.scale.setScalar(rnd(0.6,1.3)); g.add(c); }
    g.rotation.y=Math.random()*TAU; g.scale.setScalar(0.2); world.add(g); t.ice=g; t.iceT=0; }
  placeIce(t); const c=new V(t.pos.x,t.pos.y+1,t.pos.z);
  for(let i=0;i<10;i++) mote(mistMat,c.clone().add(rv(0.6)),rnd(0.8,1.4),rnd(0.5,0.9),rv(2.5));
  for(let i=0;i<8;i++) mote(snowMat,c.clone().add(rv(0.7)),rnd(0.2,0.4),rnd(0.4,0.7),rv(4),rnd(-6,6));
  sfx('freeze',c);
}
function placeIce(t){ const g=t.ice; if(!g) return; t.iceT=(t.iceT||0)+0.016; g.position.set(t.pos.x,t.pos.y+1,t.pos.z); const k=Math.min(1,g.scale.x+0.12); g.scale.setScalar(k<1?k:1+0.015*Math.sin(matchTime*3)); }
function thaw(t,dead?){
  const g=t.ice; if(!g) return; world.remove(g); t.ice=null; t.frozen=0; t.frzImm=FRZ_IMMUNE;
  const c=g.position.clone();
  for(let i=0;i<22;i++){ const m=new T.Mesh(shardGeo,iceMat), v=rv(1).normalize().multiplyScalar(rnd(3,9)), w=rv(9), s=rnd(0.8,2.2); m.position.copy(c).add(new V(rnd(-0.6,0.6),rnd(-1.1,1.1),rnd(-0.6,0.6))); world.add(m);
    effects.push({t:0,dur:rnd(0.7,1.2),obj:m,upd:(e,k,dt)=>{ if(ZG.state==='ceil') v.y+=GRAV*dt; m.position.addScaledVector(v,dt); m.rotation.x+=w.x*dt; m.rotation.y+=w.y*dt; m.scale.setScalar(s*(1-k)); }}); }
  for(let i=0;i<8;i++) mote(mistMat,c.clone().add(rv(0.6)),rnd(0.7,1.2),rnd(0.4,0.7),rv(3));
  sfx(dead?'freeze':'thaw',c);
}

// a beam or arc is fat: someone just off the crosshair line (within r metres of it) still gets caught
function nearMiss(p,dir,h,m,r){ if(h.ent) return h; let best=null, bd=r; const lim=camera.position.distanceTo(h.p);
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z); const d=segDist(camera.position,dir,lim,_dv); if(d<bd&&hasLOS(m,_dv)){ bd=d; best=e; } }
  return best?{p:new V(best.pos.x,best.pos.y+1.1,best.pos.z),ent:best,head:false,wall:false}:h; }
// ---- Taser: a crackling arc of electricity that locks whoever it touches up for a moment
// a jagged bolt of lightning from a to b that flickers into a new shape every frame
function zapArc(a,b,dur,thick,core?,glow?){
  const n=Math.max(4,Math.min(12,Math.round(a.distanceTo(b)/1.6))), g=new T.Group(), segs=[];
  for(let i=0;i<n;i++){ const c=new T.Mesh(beamGeo,core||zapCore), gl=new T.Mesh(beamGeo,glow||zapGlow); g.add(gl); g.add(c); segs.push([c,gl]); }
  world.add(g); const pts=Array.from({length:n+1},()=>new V()), d=new V().subVectors(b,a), L=d.length(), side=new V(), up2=new V();
  d.normalize(); side.crossVectors(d,Math.abs(d.y)<0.9?UP:new V(1,0,0)).normalize(); up2.crossVectors(d,side);
  const shape=()=>{ for(let i=0;i<=n;i++){ const k=i/n, j=i===0||i===n?0:L*0.06*Math.sin(Math.PI*k)+0.08; pts[i].copy(a).addScaledVector(d,L*k).addScaledVector(side,rnd(-j,j)).addScaledVector(up2,rnd(-j,j)); } };
  let acc=1;
  effects.push({t:0,dur,obj:g,upd:(e,k,dt)=>{ acc+=dt; if(acc>0.03){ acc=0; shape(); } const f=1-k*k;
    for(let i=0;i<n;i++){ placeSeg(segs[i][0],pts[i],pts[i+1],(thick||0.03)*f); placeSeg(segs[i][1],pts[i],pts[i+1],(thick||0.03)*4*f); } }});
}
function tsrFire(p,w){
  camera.getWorldDirection(tv1); const m=muzzlePos(p,new V()), range=w.range+camDistNow; let h=aimHit(p,tv1,range);
  // the prongs spread a little, so a near miss still catches someone close to the line
  h=nearMiss(p,tv1,h,m,1.1);
  zapArc(m,h.p,0.2,0.03); mote(voltMat,m.clone(),0.5,0.12,new V(),8);
  if(h.ent){ hurt(h.ent,w.dmg*(h.head?w.head:1),p,{head:h.head,point:h.p,weapon:w.name,dir:tv1.clone()}); if(h.ent.alive) stunChar(h.ent); }
  else if(h.wall) for(let i=0;i<6;i++) mote(voltMat,h.p.clone(),rnd(0.2,0.45),rnd(0.15,0.3),rv(6),10);
  p.pitch=Math.min(1.25,p.pitch+w.recoil); fireFx(p,w,'tsr'); sfx('tsr');
}
function stunChar(t){ if(t.bounceT>0) return; if(t===player) t.lastFx='stun'; t.stun=Math.max(t.stun||0,STUN_T); t.stunFx=0; sfx('stun',t.pos.clone()); }
// little arcs crawling over a stunned body
function bodyArc(t){ const up=t.zgRoll>1.5?-1:1, c=new V(t.pos.x,t.pos.y+1,t.pos.z), a=c.clone().add(new V(rnd(-0.45,0.45),rnd(-0.9,0.9)*up,rnd(-0.45,0.45))), b=c.clone().add(new V(rnd(-0.45,0.45),rnd(-0.9,0.9)*up,rnd(-0.45,0.45)));
  zapArc(a,b,0.09,0.012); if(Math.random()<0.5) mote(voltMat,a,rnd(0.2,0.35),0.12,rv(2),9); }

// ---- Flamethrower: a roaring jet of burning gas. It licks round anyone in the cone and leaves them burning.
function jetFlame(p,vel,life,size){ const m=jetMat.clone(), s=new T.Sprite(m); s.position.copy(p); m.rotation=Math.random()*TAU; world.add(s); const v=vel.clone(), w=rnd(-3,3);
  effects.push({t:0,dur:life,obj:s,upd:(e,k,dt)=>{ s.position.addScaledVector(v,dt); v.multiplyScalar(Math.exp(-1.6*dt)); v.y+=(ZG.state==='ceil'?-1:1)*3*dt; m.rotation+=w*dt;
    s.scale.setScalar(size*(0.5+3.2*Math.sqrt(k))); m.color.copy(_fc1).lerp(_fc2,Math.min(1,k*1.3)); if(k<0.15) m.color.lerp(_jw,1-k/0.15); m.opacity=k<0.75?0.9:0.9*(1-(k-0.75)/0.25); },done:()=>m.dispose()}); }
const _jw=new T.Color(0xfff6d8);
function flmFire(p,w){
  camera.getWorldDirection(tv1); const m=muzzlePos(p,new V()), at=aimPoint(p,tv1,w.range+camDistNow+6), dir=at.sub(m).normalize();
  if(!(p.flmT>0)) sfx('ignite',m.clone()); p.flmT=0.25;
  flameJet(p,m,dir,w); fireFx(p,w,'flm'); sfx('flm');
}
function flameJet(src,m,dir,w){
  // the jet stops at the first wall or block
  ray.set(m,dir); ray.near=0; ray.far=w.range; const hs=ray.intersectObjects(meshesAlong(m,dir,w.range,false),false);
  let L=Math.min(w.range,boxRay(m,dir,w.range)); if(hs.length) L=Math.min(L,hs[0].distance);
  for(let i=0;i<3;i++){ const sp=rnd(22,28), v=dir.clone().multiplyScalar(sp).add(rv(2.2)); jetFlame(m.clone().addScaledVector(dir,0.15+i*0.3),v,Math.max(0.12,Math.min(0.62,L/sp*1.25))*rnd(0.85,1.1),rnd(0.22,0.34)); }
  if(Math.random()<0.25) smoke(m.clone().addScaledVector(dir,Math.min(L,w.range)*rnd(0.6,1)),rnd(1.2,2),rnd(0.8,1.3),dir.clone().multiplyScalar(3).add(rv(1)),true);
  if(L<w.range&&Math.random()<0.5){ const q=m.clone().addScaledVector(dir,L-0.3); flame(q,rnd(0.9,1.5),rnd(0.3,0.5),rv(1.5)); }
  // anyone inside the cone (wider the further it goes) and not behind cover gets burned
  for(const e of combatants){ if(!e.alive||e===src) continue; _dv.set(e.pos.x-m.x,e.pos.y+1-m.y,e.pos.z-m.z); const along=_dv.dot(dir); if(along<0||along>L+0.6) continue;
    const perp=_dv.addScaledVector(dir,-along).length(); if(perp>0.45+along*0.17+e.radius) continue;
    if(!hasLOS(m,_dv.set(e.pos.x,e.pos.y+1,e.pos.z))) continue;
    hurt(e,w.dmg,src,{weapon:w.name,point:_dv.clone(),dir:dir.clone(),soft:true}); if(e.alive) ignite(e,src); }
}
function ignite(t,src){ if(t.bounceT>0) return; if(t===player) t.lastFx='burn'; if(t.frozen>0){ t.frozen=Math.min(t.frozen,0.05); return; } // fire melts ice
  if(!t.burn) sfx('ignite',t.pos.clone(),{gain:0.5}); t.burn={t:BURN_T,src,tick:t.burn?t.burn.tick:0.5,fx:0}; t.chill=0; }

// ---- statuses: ticked for everyone, every frame
function updateStatus(e,dt){
  if(!e.alive){ if(e.ice) thaw(e,true); e.burn=null; e.stun=0; e.chill=0; return; }
  if(e.frzImm>0) e.frzImm-=dt;
  if(e.chill>0&&!(e.frozen>0)){ e.chill=Math.max(0,e.chill-dt*0.3); if(e.chill>0.2&&Math.random()<dt*14*e.chill&&e.ch.g.visible) mote(snowMat,new V(e.pos.x,e.pos.y+1,e.pos.z).add(rv(0.5)),rnd(0.12,0.22),rnd(0.4,0.7),new V(rnd(-0.3,0.3),-0.6,rnd(-0.3,0.3))); }
  if(e.frozen>0){ e.frozen-=dt; placeIce(e); if(e.frozen<=0) thaw(e); }
  if(e.stun>0){ e.stun-=dt; e.stunFx-=dt; if(e.stunFx<=0&&e.ch.g.visible){ e.stunFx=0.06; bodyArc(e); } }
  if(e.burn){ const b=e.burn; b.t-=dt; b.tick-=dt; b.fx-=dt;
    if(b.fx<=0&&e.ch.g.visible){ b.fx=0.05; const up=e.zgRoll>1.5?-1:1; flame(new V(e.pos.x+rnd(-0.35,0.35),e.pos.y+1+rnd(-0.8,0.6)*up,e.pos.z+rnd(-0.35,0.35)),rnd(0.5,0.85),rnd(0.3,0.5),new V(rnd(-0.4,0.4),rnd(1.5,2.6)*up,rnd(-0.4,0.4))); }
    if(b.tick<=0){ b.tick=0.5; if(Math.random()<0.6) sfx('crackle',e.pos.clone()); hurt(e,4,b.src&&b.src.alive?b.src:null,{weapon:'Fire',soft:true}); if(!e.alive) return; }
    if(b.t<=0) e.burn=null; }
}
// how much a chill slows someone down (frozen and stunned people don't move at all, see the movement code)
const slowK=e=>1-0.55*(e.chill||0);
const lockedUp=e=>e.frozen>0||e.stun>0;

// ---- Robot Drone: a little quadcopter that flies off your shoulder and hunts. Holding the remote, it goes after
// whoever is nearest your crosshair (click to send it at them); otherwise it picks the nearest enemy itself.
// It shoots for 15 seconds, then pops, and the remote needs a short recharge.
const DRONE_LIFE=15, DRONE_CD=12, DRONE_W={name:'Robot Drone',dmg:11,range:90,head:1.5};
let drones=[];
const DRN:any={};
function droneModel(){
  if(!DRN.body) Object.assign(DRN,{body:new T.SphereGeometry(0.42,22,14),visor:new T.SphereGeometry(0.43,22,10,-0.9,1.8,1.05,0.75),arm:BX(1.9,0.06,0.09),motor:new T.CylinderGeometry(0.09,0.11,0.14,14),
    blade:BX(0.66,0.012,0.07),disc:new T.CircleGeometry(0.36,24).rotateX(-Math.PI/2),gun:gtube(0.035,0.035,0.34,12),eye:new T.SphereGeometry(0.06,12,8),ant:new T.CylinderGeometry(0.008,0.01,0.34,6),
    white:GPh(0xf2f4f7,60,0x9a9a9a),orange:GPh(0xff5a3c,50,0x553322),disc_m:new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.14,depthWrite:false,side:T.DoubleSide})});
  const g=new T.Group(), add=(geo,mat,x,y,z)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; g.add(m); return m; };
  add(DRN.body,DRN.white,0,0,0).scale.set(1,0.62,1.15); add(DRN.visor,GUN_MAT.dark,0,0.02,0).scale.set(1,0.62,1.15);
  const eye=add(DRN.eye,GUN_MAT.red,0,0.03,0.46); const halo=new T.Sprite(auraMats(0xff3b30).halo); halo.scale.setScalar(0.5); halo.position.set(0,0.03,0.5); g.add(halo);
  for(const r of [Math.PI/4,-Math.PI/4]){ const a=add(DRN.arm,GUN_MAT.dark,0,0.04,0); a.rotation.y=r; }
  const props=[]; for(const [x,z] of [[0.67,0.67],[-0.67,0.67],[0.67,-0.67],[-0.67,-0.67]]){ add(DRN.motor,DRN.orange,x,0.1,z);
    const p=new T.Group(); p.position.set(x,0.19,z); const b1=new T.Mesh(DRN.blade,GUN_MAT.dark), b2=new T.Mesh(DRN.blade,GUN_MAT.dark); b2.rotation.y=Math.PI/2; p.add(b1); p.add(b2); p.add(new T.Mesh(DRN.disc,DRN.disc_m)); g.add(p); props.push(p); }
  const gun=new T.Group(); gun.position.set(0,-0.24,0.12); const barrel=new T.Mesh(DRN.gun,GUN_MAT.steel); barrel.position.z=0.12; gun.add(barrel); const mz=new T.Object3D(); mz.position.z=0.3; gun.add(mz); g.add(gun);
  const ant=add(DRN.ant,GUN_MAT.steel,0.12,0.36,-0.25); const tip=new T.Sprite(auraMats(0xff3b30).halo); tip.scale.setScalar(0.18); tip.position.set(0.12,0.54,-0.25); g.add(tip);
  const thr=new T.Sprite(auraMats(0x5cf0ff).halo); thr.scale.setScalar(0.9); thr.position.y=-0.3; g.add(thr);
  g.scale.setScalar(1.25); g.userData={props,gun,mz,eye,halo,tip,thr}; return g;
}
function droneFire(p,it){
  if(p.drone){ // already flying: send it after whoever is under the crosshair
    const t=crosshairTarget(p,0.985); if(t){ p.drone.target=t; p.drone.lock=1.5; sfx('ui'); } return; }
  if(it.cd>0){ sfx('deny'); return; }
  const m=muzzlePos(p,new V()), g=droneModel(); g.position.copy(m); world.add(g);
  const D={owner:p,item:it,g,pos:m.clone(),vel:new V(0,4,0).addScaledVector(new V(Math.cos(p.yaw),0,-Math.sin(p.yaw)),3),t:0,think:0,fire:0.6,target:null,lock:0,orb:Math.random()*TAU,hum:0,yaw:p.yaw};
  drones.push(D); p.drone=D; fireFx(p,WEAP.drone,'drone'); sfx('droneUp',m.clone()); refreshHotbar();
}
// the enemy nearest the middle of the screen (within a narrow cone) that the camera can see
function crosshairTarget(p,minCos){
  camera.getWorldDirection(tv1); let best=null, bc=minCos;
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x-camera.position.x,e.pos.y+1-camera.position.y,e.pos.z-camera.position.z); const d=_dv.length(); if(d>160) continue;
    const c=_dv.dot(tv1)/d; if(c>bc&&hasLOS(camera.position,_dv.set(e.pos.x,e.pos.y+1,e.pos.z))){ bc=c; best=e; } }
  return best;
}
function droneTarget(D){
  const p=D.owner;
  if(D.lock>0&&D.target&&D.target.alive) return D.target;
  if(p===player&&curItem()&&curItem().id==='drone'){ const t=crosshairTarget(p,0.96); if(t) return t; }
  if(D.target&&D.target.alive&&D.target.pos.distanceTo(D.pos)<110) return D.target;
  let best=null, bd=110, seen=false;
  for(const e of combatants){ if(!e.alive||e===p) continue; const d=e.pos.distanceTo(D.pos); if(d>=bd&&seen) continue; if(d>=110) continue;
    const los=hasLOS(D.pos,_dv.set(e.pos.x,e.pos.y+1,e.pos.z)); if(seen&&!los) continue; if(!seen&&los){ seen=true; bd=d; best=e; continue; } if(d<bd){ bd=d; best=e; } }
  return best;
}
function droneGone(D,i){ drones.splice(i,1); world.remove(D.g); if(D.owner.drone===D) D.owner.drone=null; D.item.cd=DRONE_CD;
  const c=D.pos.clone(); for(let k=0;k<10;k++){ const m=new T.Mesh(shardGeo,k%2?DRN.white:DRN.orange), v=rv(1).normalize().multiplyScalar(rnd(4,10)), w=rv(10); m.position.copy(c); world.add(m);
    effects.push({t:0,dur:rnd(0.6,1),obj:m,upd:(e,k2,dt)=>{ m.position.addScaledVector(v,dt); m.rotation.x+=w.x*dt; m.rotation.z+=w.z*dt; m.scale.setScalar(1-k2); }}); }
  for(let k=0;k<6;k++) smoke(c.clone().add(rv(0.4)),rnd(1,1.8),rnd(0.8,1.3),rv(2),true); puff(c,0xffffff); sfx('droneDown',c); if(D.owner===player) refreshHotbar(); }
const _dw=new V(), _dd=new V();
function updateDrones(dt){
  if(player&&player.slots) for(const it of player.slots) if(it&&it.id==='drone'&&it.cd>0&&!player.drone) it.cd=Math.max(0,it.cd-dt);
  for(let i=drones.length-1;i>=0;i--){ const D=drones[i], u=D.g.userData; D.t+=dt; D.think-=dt; D.fire-=dt; D.lock-=dt;
    if(D.t>DRONE_LIFE||!D.owner.alive){ droneGone(D,i); continue; }
    if(D.think<=0){ D.think=0.25; D.target=droneTarget(D); }
    const T2=D.target&&D.target.alive?D.target:null, up=ZG.state==='ceil'?-1:1;
    // where to hover: up and off to one side of the target, circling it; with nobody to hunt, over its owner's shoulder
    if(T2){ D.orb+=dt*0.7; _dw.set(T2.pos.x+Math.cos(D.orb)*7,T2.pos.y+1+4.5*up,T2.pos.z+Math.sin(D.orb)*7); }
    else { const o=D.owner; _dw.set(o.pos.x+Math.cos(o.yaw)*1.6+Math.sin(o.yaw)*1.2,o.pos.y+1+2.6*up,o.pos.z-Math.sin(o.yaw)*1.6+Math.cos(o.yaw)*1.2); }
    _dw.x=clamp(_dw.x,-ZG.L+2,ZG.L-2); _dw.z=clamp(_dw.z,-ZG.L+2,ZG.L-2); _dw.y=clamp(_dw.y,1.5,ZG.H-1.5);
    _dd.subVectors(_dw,D.pos); const far=_dd.length(); _dd.multiplyScalar(Math.min(26,far*1.8)/(far||1));
    D.vel.lerp(_dd,1-Math.exp(-2.6*dt)); D.pos.addScaledVector(D.vel,dt);
    // push out of blocks and keep inside the box
    for(const b of ZG.blocks){ const r=0.9, px=b.sx/2+r-Math.abs(D.pos.x-b.x), py=b.sy/2+r-Math.abs(D.pos.y-b.y), pz=b.sz/2+r-Math.abs(D.pos.z-b.z); if(px<=0||py<=0||pz<=0) continue;
      if(px<py&&px<pz){ D.pos.x+=(D.pos.x>b.x?1:-1)*px; D.vel.x*=-0.3; } else if(py<pz){ D.pos.y+=(D.pos.y>b.y?1:-1)*py; D.vel.y*=-0.3; } else { D.pos.z+=(D.pos.z>b.z?1:-1)*pz; D.vel.z*=-0.3; } }
    D.pos.x=clamp(D.pos.x,-ZG.L+1,ZG.L-1); D.pos.z=clamp(D.pos.z,-ZG.L+1,ZG.L-1); D.pos.y=clamp(D.pos.y,1,ZG.H-1);
    // turn to face the target (or where it's flying) and bank into the turn; a gentle bob on top
    const fx=T2?T2.pos.x-D.pos.x:D.vel.x, fz=T2?T2.pos.z-D.pos.z:D.vel.z; if(fx*fx+fz*fz>0.01) D.yaw=D.yaw+wrapPi(Math.atan2(fx,fz)-D.yaw)*(1-Math.exp(-6*dt));
    const sY=Math.sin(D.yaw), cY=Math.cos(D.yaw), vf=D.vel.x*sY+D.vel.z*cY, vs=D.vel.x*cY-D.vel.z*sY;
    D.g.position.copy(D.pos); D.g.position.y+=Math.sin(D.t*3.1)*0.12; D.g.rotation.set(clamp(vf*0.025,-0.4,0.4),D.yaw,clamp(-vs*0.03,-0.45,0.45)+(up<0?Math.PI:0),'YXZ');
    for(const p of u.props) p.rotation.y+=dt*48;
    const warn=D.t>DRONE_LIFE-3; u.halo.visible=u.eye.visible=!warn||Math.sin(D.t*22)>0; u.tip.visible=Math.sin(D.t*6)>0;
    D.hum-=dt; if(D.hum<=0){ D.hum=0.42; sfx('rotor',D.pos.clone()); }
    // aim the gun and shoot when the target's in sight
    if(T2){ _dd.set(T2.pos.x,T2.pos.y+1.1,T2.pos.z); D.g.updateMatrixWorld(true); const lp=D.g.worldToLocal(_dd.clone()); u.gun.rotation.set(-Math.atan2(lp.y-u.gun.position.y,Math.hypot(lp.x,lp.z-u.gun.position.z)),Math.atan2(lp.x,lp.z-u.gun.position.z),0);
      if(D.fire<=0){ const mz=u.mz.getWorldPosition(new V()), dist=mz.distanceTo(_dd);
        if(dist<DRONE_W.range&&hasLOS(mz,_dd)){ D.fire=0.3; const lead=dist/300; _dd.x+=T2.vel.x*lead; _dd.z+=T2.vel.z*lead; _dd.y+=T2.vel.y*lead;
          const dir=jitter(_dd.sub(mz).normalize(),0.018,new V()); fireRay(D.owner,mz,dir,DRONE_W,RAR[2],1,mz,0.3);
          mote(voltMat,mz,0.6,0.06,new V()); mote(fireMat,mz,0.45,0.05,new V()); sfx('droneShot',mz); }
        else D.fire=0.15; } }
    else u.gun.rotation.x*=Math.exp(-4*dt);
  }
}
// the special guns' shot: called from gunFire
function specialFire(p,it,w){
  if(lockedUp(p)) return;
  if(w.sp==='frz') frzFire(p,w); else if(w.sp==='tsr') tsrFire(p,w); else if(w.sp==='flm') flmFire(p,w); else if(w.sp==='pb') pbFire(p,w); else if(w.sp==='drone') droneFire(p,it);
}
// ---- Paintball Gun: fast paintballs in random bright colours. They burst on whoever they hit and leave splats on the
// box and the blocks, which fade after a while (only the newest SPLAT_MAX stay).
const PAINT=[0xff2f8f,0xffe23a,0x3fd0ff,0x62ff7a,0xff7a1a,0xa65cff], SPLAT_MAX=160, SPLAT_LIFE=45;
const pbBallGeo=new T.SphereGeometry(0.07,10,8), splatGeo=new T.PlaneGeometry(1,1);
const splatTex=canvasTex(128,128,(g)=>{ g.fillStyle='#fff'; g.beginPath(); for(let i=0;i<=24;i++){ const a=i/24*TAU, r=34+Math.random()*14; if(i) g.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r); else g.moveTo(64+Math.cos(a)*r,64+Math.sin(a)*r); } g.fill();
  for(let i=0;i<14;i++){ const a=Math.random()*TAU, r=rnd(44,60), s=rnd(2,7); g.beginPath(); g.arc(64+Math.cos(a)*r,64+Math.sin(a)*r,s,0,TAU); g.fill(); g.beginPath(); g.ellipse(64+Math.cos(a)*(r-10),64+Math.sin(a)*(r-10),s*0.7,8,a+Math.PI/2,0,TAU); g.fill(); } });
const PM:any={}; function paintMats(c){ return PM[c]||(PM[c]={ball:new T.MeshBasicMaterial({color:c}),dot:new T.SpriteMaterial({map:glowTex,color:c,transparent:true,depthWrite:false}),
  splat:new T.MeshBasicMaterial({map:splatTex,color:c,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})}); }
let splats=[];
function pbFire(p,w){
  camera.getWorldDirection(tv1); const o=muzzlePos(p,new V()), at=aimPoint(p,tv1,w.range), dir=jitter(at.sub(o).normalize(),w.spread,new V());
  const c=pick(PAINT), m=new T.Mesh(pbBallGeo,paintMats(c).ball); m.position.copy(o); world.add(m);
  projs.push({kind:'paint',src:p,m,pos:o,vel:dir.multiplyScalar(90),t:0,col:c,w});
  p.pitch=Math.min(1.25,p.pitch+w.recoil*rnd(0.5,1)); fireFx(p,w,'pb'); sfx('pb');
}
function updatePaint(P,i,dt){
  if(ZG.state==='ceil') P.vel.y+=GRAV*0.3*dt; // a slight arc while gravity is on
  const len=P.vel.length()*dt, dir=P.vel.clone().normalize(), h=segHit(P.pos,dir,len,P.src);
  if(h||P.t>3){ const at=P.pos.clone().addScaledVector(dir,h?h.d:len);
    if(h&&h.ent) hurt(h.ent,P.w.dmg*(h.head?P.w.head:1),P.src,{head:h.head,point:at,weapon:P.w.name,dir});
    if(h) paintBurst(at,h.n,P.col,dir); removeProj(i); return; }
  P.pos.addScaledVector(dir,len); P.m.position.copy(P.pos);
}
function paintBurst(at,n,c,dir){
  const M=paintMats(c);
  for(let i=0;i<7;i++) mote(M.dot,at.clone(),rnd(0.15,0.35),rnd(0.25,0.45),rv(3).addScaledVector(n||dir,n?3:-2));
  if(n){ const m=new T.Mesh(splatGeo,M.splat), s=rnd(0.55,1.1); m.position.copy(at).addScaledVector(n,0.02); m.lookAt(_dv.copy(m.position).add(n)); m.rotateZ(Math.random()*TAU); m.scale.setScalar(s); world.add(m);
    splats.push({m,t:0}); if(splats.length>SPLAT_MAX) world.remove(splats.shift().m); }
  sfx('splat',at);
}
function updateSplats(dt){ for(let i=splats.length-1;i>=0;i--){ const S=splats[i]; S.t+=dt; if(S.t>SPLAT_LIFE){ world.remove(S.m); splats.splice(i,1); } else if(S.t>SPLAT_LIFE-3) S.m.scale.multiplyScalar(1-dt*0.6); } }
// ================= pickaxe power-ups =================
// Every pickaxe outside the Anime set has two moves (the list is in POWERS below; pickaxes.js has the words the
// locker shows). A tap swings it as usual with that pickaxe's own extra on top: something that happens to whoever
// it hits, a little projectile, a faster, longer or wider swing. Holding the button past a quarter of a second does
// its special move, which then recharges for a few seconds (the number on the pickaxe's hotbar slot). Some special
// moves fire once, some keep going while you hold (up to a limit), and some charge up and go off when you let go.
// The moves are built from a small kit: thrown things (pwShot), blasts (pwBlast), clouds that linger (pwZone),
// dashes, cones, beams, things that circle you, floating walls, grapples, strikes from above and timed buffs.
let POW=null, PC=0xffffff; // the equipped pickaxe's moves and its main colour
let pwShots=[], pwZones=[], pwWalls=[], pwLaters=[];
const PW_BASE=20, PW_REACH=4.2;
// ---- timed buffs on anyone: speed (spd), swing speed (swing), damage taken (armor), invisible (hide),
// bulletproof (ghost), blocking bullets (guard: 1 from the front, 2 from everywhere), healing per second (regen)
function buff(e,k,t,v?){ if(v==null) v=1; e.pb=e.pb||{}; const b=e.pb[k]; if(b&&b.t>0&&b.t>t&&b.v===v) return; e.pb[k]={t,v}; }
const bv=(e,k,d?)=>e&&e.pb&&e.pb[k]&&e.pb[k].t>0?e.pb[k].v:(d==null?0:d);
// ---- colours and little materials, made once per colour
const PWM=new Map();
function pwMats(col){ let m=PWM.get(col); if(m) return m; const c=new T.Color(col);
  m={solid:new T.MeshPhongMaterial({color:c,emissive:c.clone().multiplyScalar(0.3),shininess:70,specular:0x444444}),
    flat:new T.MeshBasicMaterial({color:c,transparent:true,depthWrite:false,side:T.DoubleSide}),
    soft:new T.SpriteMaterial({map:glowTex,color:c,transparent:true,depthWrite:false,opacity:0.6}),
    spark:new T.SpriteMaterial({map:sparkTex,color:c,transparent:true,depthWrite:false}),
    fog:new T.MeshBasicMaterial({color:c,transparent:true,depthWrite:false,opacity:0.13,side:T.DoubleSide}),
    glass:new T.MeshBasicMaterial({color:c,transparent:true,depthWrite:false,opacity:0.45,side:T.DoubleSide})};
  PWM.set(col,m); return m; }
const pwGeo={orb:new T.SphereGeometry(0.25,16,12),dart:new T.ConeGeometry(0.07,0.5,6).rotateX(Math.PI/2),disc:new T.TorusGeometry(0.34,0.06,6,24),
  crescent:new T.TorusGeometry(0.7,0.07,5,20,Math.PI),star:new T.OctahedronGeometry(0.3),box:new T.BoxGeometry(0.34,0.34,0.34),shard:new T.TetrahedronGeometry(0.2),
  stem:new T.CylinderGeometry(0.04,0.05,0.16,6),bone:new T.CylinderGeometry(0.05,0.05,0.6,8).rotateZ(Math.PI/2),knob:new T.SphereGeometry(0.09,8,6),
  wing:(()=>{ const s=new T.Shape(); s.moveTo(0,0); s.lineTo(0.45,0.18); s.lineTo(0.36,0.02); s.lineTo(0.5,-0.08); s.lineTo(0.3,-0.06); s.lineTo(0.2,-0.16); s.lineTo(0,-0.05); return new T.ShapeGeometry(s); })(),
  ring:new T.RingGeometry(0.82,1,40),sphere:new T.SphereGeometry(1,24,16),cone:new T.ConeGeometry(0.12,0.6,5)};
// what a thrown thing looks like; +z is the way it flies
function pwLook(look,col,size){
  const g=new T.Group(), M=pwMats(col), add=(geo,mat,x?,y?,z?,s?)=>{ const m=new T.Mesh(geo,mat); m.position.set(x||0,y||0,z||0); if(s) m.scale.setScalar(s); g.add(m); return m; };
  if(look==='pumpkin'){ add(pwGeo.orb,pwMats(0xff8a1f).solid).scale.set(1.15,0.9,1.15); add(pwGeo.stem,pwMats(0x3d7a2a).solid,0,0.26,0); }
  else if(look==='dart') add(pwGeo.dart,M.solid);
  else if(look==='disc') add(pwGeo.disc,M.solid).rotation.x=Math.PI/2;
  else if(look==='crescent'){ const m=add(pwGeo.crescent,M.solid); m.rotation.set(Math.PI/2,0,Math.PI); }
  else if(look==='star') add(pwGeo.star,M.solid);
  else if(look==='box'||look==='gift'||look==='crate'){ add(pwGeo.box,M.solid).scale.setScalar(look==='crate'?4:look==='gift'?1.3:1); if(look==='gift'){ add(pwGeo.box,pwMats(0xffd23f).solid).scale.set(1.4,0.3,1.4); add(pwGeo.box,pwMats(0xffd23f).solid).scale.set(0.3,1.4,1.4); } }
  else if(look==='shard') add(pwGeo.shard,M.solid);
  else if(look==='bone'){ add(pwGeo.bone,M.solid); for(const x of [-0.3,0.3]) for(const y of [-0.06,0.06]) add(pwGeo.knob,M.solid,x,y,0); }
  else if(look==='bubble') add(pwGeo.orb,M.glass);
  else if(look==='bat'||look==='parrot'){ add(pwGeo.knob,M.solid,0,0,0,1.4); for(const sx of [1,-1]){ const w=add(pwGeo.wing,M.flat); w.scale.set(sx,1,1); w.rotation.x=-Math.PI/2; w.userData.flap=sx; } }
  else if(look==='jelly'){ const m=add(pwGeo.orb,M.glass); m.scale.set(1.3,0.9,1.3); for(let i=0;i<5;i++){ const t=add(pwGeo.dart,M.solid,Math.cos(i*1.26)*0.18,-0.32,Math.sin(i*1.26)*0.18); t.rotation.x=0; t.scale.set(0.4,0.4,1.2); } }
  else if(look==='ginger'){ add(pwGeo.box,M.solid,0,0,0).scale.set(1.4,1.8,0.6); add(pwGeo.orb,M.solid,0,0.48,0,0.9); }
  else if(look==='raptor'){ const m=add(pwGeo.cone,M.solid); m.rotation.x=Math.PI/2; m.scale.set(1.5,2,1.5); add(pwGeo.knob,M.solid,0,0.05,0.25,1.3); }
  else if(look==='holo'){ const m=add(pwGeo.box,M.glass); m.scale.set(1.8,5.2,1.2); m.position.y=1; }
  else add(pwGeo.orb,M.solid);
  if(look!=='holo'&&look!=='crate'){ const h=new T.Sprite(M.soft); h.scale.setScalar(1.1); g.add(h); }
  g.scale.setScalar(size||1); return g;
}
// ---- statuses (on top of the ones the guns already have: chill, frozen, stun and burn)
function pwSlow(e,a){ if(!e.alive||e.frozen>0||e.bounceT>0) return; e.chill=Math.min(0.85,(e.chill||0)+a); }
function pwStun(e,t){ if(!e.alive||e.bounceT>0) return; if(!(e.stun>0)) sfx('stun',e.pos.clone()); e.stun=Math.max(e.stun||0,t); e.stunFx=0; }
function pwPoison(e,src,dps,t){ if(!e.alive||e.bounceT>0) return; e.poison={t,dps,src,tick:0.5}; }
function pwBlind(e,t){ e.blindT=Math.max(e.blindT||0,t); if(!e.isPlayer) e.enemy=null; }
function pwDaze(e,t){ e.dazeT=Math.max(e.dazeT||0,t); }
function pwJam(e,t){ e.jamT=Math.max(e.jamT||0,t); }
function pwMark(e,t,mul,col){ e.markT=Math.max(e.markT||0,t); e.markMul=Math.max(e.markT>t?e.markMul||1:1,mul||1); e.markCol=col||PC; }
function pwReveal(e,t,col){ e.revealT=Math.max(e.revealT||0,t); e.revealCol=col||PC; }
function pwKnock(e,dir,f){ if(!e.alive||e.bounceT>0||e===player) return; e.vel.addScaledVector(dir,f); e.knockT=Math.max(e.knockT||0,f/45); }
function pwPull(e,to,f){ _dv.set(to.x-e.pos.x,to.y-1-e.pos.y,to.z-e.pos.z); const d=_dv.length(); if(d<1.5) return; pwKnock(e,_dv.divideScalar(d).clone(),Math.min(f,d*3)); }
function pwHeal(p,n){ if(!p.alive||n<=0) return; const h=Math.min(100-p.hp,n); p.hp+=h; if(h>0&&Math.random()<0.5) healFx(p.pos.clone().add(new V(0,1.3,0)),0x5ee07a,3,1.6); }
function pwShield(p,n){ p.shield=Math.min(100,p.shield+n); healFx(p.pos.clone().add(new V(0,1.3,0)),0x6fb6ff,6,2); }
const chest=e=>new V(e.pos.x,e.pos.y+(e.zgRoll>1.5?0.8:1.2),e.pos.z);
const lookDir=()=>{ camera.getWorldDirection(tv1); return tv1.clone(); };
const enemies=(p)=>combatants.filter(e=>e.alive&&e!==p);
// ticked for everyone every frame: poison, the shorter statuses and the little marker over a marked head
const tagMat=new Map();
function pwStatus(e,dt){
  if(e.pb) for(const k in e.pb) if(e.pb[k].t>0) e.pb[k].t-=dt;
  for(const k of ['blindT','dazeT','jamT','markT','revealT','tinyT']) if(e[k]>0) e[k]-=dt;
  if(!e.alive){ e.poison=null; if(e.tag) e.tag.visible=false; return; }
  if(e.poison){ const P=e.poison; P.t-=dt; P.tick-=dt; if(P.tick<=0){ P.tick=0.5; hurt(e,P.dps*0.5,P.src&&P.src.alive?P.src:null,{weapon:'Poison',soft:true}); if(e.ch.g.visible) for(let i=0;i<3;i++) mote(pwMats(0x7be04a).soft,chest(e).add(rv(0.4)),rnd(0.25,0.4),0.5,new V(0,rnd(0.5,1.2),0)); } if(P.t<=0) e.poison=null; }
  const show=e!==player&&(e.markT>0||e.revealT>0||!!e.curse);
  if(show&&!e.tag){ const m=new T.SpriteMaterial({map:sparkTex,color:0xffffff,depthTest:false,depthWrite:false,transparent:true}); e.tag=new T.Sprite(m); e.tag.renderOrder=20; world.add(e.tag); }
  if(e.tag){ e.tag.visible=show; if(show){ const up=e.zgRoll>1.5?-1:1; e.tag.position.set(e.pos.x,e.pos.y+1+1.5*up,e.pos.z); e.tag.material.color.setHex(e.curse?0xffc21a:e.markT>0?e.markCol:e.revealCol); e.tag.scale.setScalar(0.7+0.12*Math.sin(matchTime*8)); } }
}
// ---- blasts: everyone within r takes damage (less at the edge) and gets pushed away
function pwBlast(at,o){
  const src=o.src||player, r=o.r, col=o.col||PC;
  if(o.fire) explode(at,{r,dmg:0,src,weapon:o.name||POW&&POW.name});
  else { const s=new T.Mesh(pwGeo.sphere,pwMats(col).flat.clone()); s.position.copy(at); world.add(s);
    effects.push({t:0,dur:0.35,obj:s,upd:(e,k)=>{ s.scale.setScalar(0.4+r*Math.sqrt(k)); s.material.opacity=0.5*(1-k); },done:()=>s.material.dispose()});
    const ring=new T.Mesh(shockRing,pwMats(col).flat.clone()); ring.position.copy(at); ring.lookAt(camera.position); world.add(ring);
    effects.push({t:0,dur:0.4,obj:ring,upd:(e,k)=>{ ring.scale.setScalar(0.5+r*1.2*k); ring.material.opacity=0.9*(1-k); },done:()=>ring.material.dispose()});
    for(let i=0;i<Math.min(24,6+r*2);i++) mote(pwMats(col).spark,at.clone(),rnd(0.3,0.6),rnd(0.3,0.6),rv(1).normalize().multiplyScalar(rnd(4,10)*r/5),rnd(-6,6));
    sfx(r>6?'boom':'shockS',at.clone(),{gain:0.7}); camShake=Math.max(camShake,clamp(1.2-at.distanceTo(player.pos)/40,0,0.6)*Math.min(1,r/6)); }
  for(const e of combatants){ if(!e.alive||e===src) continue; tv3.set(e.pos.x,e.pos.y+1,e.pos.z).sub(at); const d=tv3.length(); if(d>r+0.4) continue;
    if(!o.thru&&!hasLOS(at,tv2.set(e.pos.x,e.pos.y+1,e.pos.z))) continue;
    const k=1-Math.min(1,d/(r+0.4)), dir=d>0.01?tv3.divideScalar(d).clone():new V(0,1,0);
    if(o.dmg) hurt(e,o.dmg*(0.4+0.6*k),src,{dir,weapon:o.name||POW&&POW.name,point:e.pos.clone().add(new V(0,1,0)),explosive:true});
    if(e.alive){ if(o.kb!==0) pwKnock(e,dir,(o.kb||14)*(0.5+0.5*k)); if(o.each) o.each(e,k); } }
}
// ---- thrown things. o: look, col, size, speed, n and spread (a fan), life, r (how close counts as a hit), dmg,
// pierce (keeps going through people), bounce (times it bounces off walls), home (how hard it turns toward the
// nearest enemy), boomer (comes back), fuse (goes off after this long), stop (stops dead after this long, for
// things that hang in the air), latch {dur,dps} (holds on and keeps hurting), every (hits again after this long
// instead of breaking), hit(e,P) and end(at,P) for the extras, stick (stays stuck in a wall)
function pwShot(p,o){
  const dir0=o.dir||null, origin=o.from?o.from.clone():chest(p).addScaledVector(lookDir(),0.9);
  const at=dir0?null:aimPoint(p,lookDir(),160), base=dir0?dir0.clone():at.sub(origin).normalize();
  const side=new V().crossVectors(base,Math.abs(base.y)>0.95?new V(1,0,0):UP).normalize(), up2=new V().crossVectors(side,base);
  const n=o.n||1, out=[];
  for(let i=0;i<n;i++){ const d=base.clone(); if(n>1){ const a=(i/(n-1)-0.5)*2*(o.spread||0.2); d.addScaledVector(side,a).addScaledVector(up2,o.vspread?rnd(-o.vspread,o.vspread):0).normalize(); } else if(o.spread) d.addScaledVector(side,rnd(-o.spread,o.spread)).addScaledVector(up2,rnd(-o.spread,o.spread)).normalize();
    const m=pwLook(o.look||'orb',o.col||PC,o.size||1); m.position.copy(origin); world.add(m);
    const P={o,src:p,m,pos:origin.clone(),vel:d.multiplyScalar(o.speed==null?60:o.speed),t:0,hit:new Map(),bounces:o.bounce||0,tgt:null,think:0,back:false,latch:null,stuck:false,trail:0};
    pwShots.push(P); out.push(P); }
  return out;
}
function pwShotEnd(i,at?){ const P=pwShots[i]; pwShots.splice(i,1); world.remove(P.m); if(P.o.end) P.o.end(at||P.pos.clone(),P); }
function pwNearest(pos,src,r,exclude?){ let best=null, bd=r; for(const e of combatants){ if(!e.alive||e===src||exclude&&exclude.has(e)) continue; const d=Math.hypot(e.pos.x-pos.x,e.pos.y+1-pos.y,e.pos.z-pos.z); if(d<bd){ bd=d; best=e; } } return best; }
const _pws=new V(), _pn=new V();
function updatePwShots(dt){
  for(let i=pwShots.length-1;i>=0;i--){ const P=pwShots[i], o=P.o; P.t+=dt;
    for(const c of P.m.children) if(c.userData.flap) c.rotation.y=c.userData.flap*0.6*Math.sin(P.t*24);
    if(P.latch){ const e=P.latch; if(!e.alive||P.t>P.lt){ pwShotEnd(i); continue; } P.pos.set(e.pos.x,e.pos.y+(e.zgRoll>1.5?0.2:1.9),e.pos.z).add(new V(Math.cos(P.t*6)*0.5,0,Math.sin(P.t*6)*0.5)); P.m.position.copy(P.pos);
      P.tick=(P.tick||0)-dt; if(P.tick<=0){ P.tick=0.4; if(o.latch.dps) hurt(e,o.latch.dps*0.4,P.src,{weapon:POW.name,point:P.pos.clone(),soft:true}); if(o.hit&&e.alive) o.hit(e,P); } continue; }
    if(P.stuck){ if(P.t>(o.fuse||P.t)){ pwShotEnd(i); } continue; }
    if((o.fuse&&P.t>=o.fuse)||P.t>(o.life||2)){ pwShotEnd(i); continue; }
    if(o.stop&&P.t>o.stop) P.vel.multiplyScalar(Math.exp(-6*dt));
    if(o.home){ P.think-=dt; if(P.think<=0){ P.think=0.2; if(!P.tgt||!P.tgt.alive) P.tgt=o.chase&&o.chase.alive?o.chase:pwNearest(P.pos,P.src,o.homeR||60,o.every?null:P.hit); }
      if(P.tgt&&P.t>(o.homeDelay||0)){ const sp=P.vel.length()||1; _pws.set(P.tgt.pos.x,P.tgt.pos.y+1,P.tgt.pos.z).sub(P.pos).normalize().multiplyScalar(sp); P.vel.lerp(_pws,1-Math.exp(-o.home*dt)).setLength(sp); } }
    if(o.boomer&&!P.back&&P.t>(o.life||2)*0.45){ P.back=true; P.hit.clear(); }
    if(P.back){ const sp=Math.max(30,P.vel.length()), c=chest(P.src); _pws.copy(c).sub(P.pos); if(_pws.length()<1.6){ pwShotEnd(i); continue; } P.vel.lerp(_pws.normalize().multiplyScalar(sp),1-Math.exp(-8*dt)); }
    const sp=P.vel.length(); if(sp<0.01){ P.m.position.copy(P.pos); continue; }
    const dir=_pn.copy(P.vel).divideScalar(sp); let len=sp*dt;
    // people along the way
    let done=false;
    for(const e of combatants){ if(!e.alive||e===P.src) continue; const last=P.hit.get(e); if(last!=null&&(!o.every||P.t-last<o.every)) continue;
      _dv.set(e.pos.x,e.pos.y+1,e.pos.z); if(segDist(P.pos,dir,len,_dv)>(o.r||0.6)+0.4) continue;
      P.hit.set(e,P.t); const at=_dv.clone(); if(o.dmg) hurt(e,o.dmg,P.src,{weapon:POW?POW.name:'Pickaxe',point:at,dir:dir.clone(),soft:o.soft});
      if(o.hit&&e.alive) o.hit(e,P);
      if(o.latch){ P.latch=e; P.lt=P.t+o.latch.dur; done=true; break; }
      if(!o.pierce&&!o.every&&!P.back){ pwShotEnd(i,at); done=true; break; } }
    if(done) continue;
    // walls and blocks
    ray.set(P.pos,dir); ray.near=0; ray.far=len; const hs=ray.intersectObjects(meshesAlong(P.pos,dir,len,false),false); let wall=-1, nrm=null;
    if(hs.length){ wall=hs[0].distance; nrm=hs[0].face?hs[0].face.normal.clone().transformDirection(hs[0].object.matrixWorld):null; }
    const tb=boxRay(P.pos,dir,len); if(tb<len&&(wall<0||tb<wall)){ wall=tb; const q=P.pos.clone().addScaledVector(dir,tb), L=ZG.L;
      nrm=q.x<=-L+0.05?new V(1,0,0):q.x>=L-0.05?new V(-1,0,0):q.z<=-L+0.05?new V(0,0,1):q.z>=L-0.05?new V(0,0,-1):q.y<=0.05?new V(0,1,0):new V(0,-1,0); }
    if(wall>=0){ P.pos.addScaledVector(dir,Math.max(0,wall-0.05));
      if(P.bounces>0&&nrm){ P.bounces--; P.vel.reflect(nrm).multiplyScalar(0.92); if(o.bounceHome){ const t=pwNearest(P.pos,P.src,80); if(t) P.vel.copy(_pws.set(t.pos.x,t.pos.y+1,t.pos.z).sub(P.pos).normalize().multiplyScalar(sp)); } sfx('boing',P.pos.clone(),{small:true}); }
      else if(P.back) P.pos.addScaledVector(P.vel,dt*0);
      else if(o.stick||o.fuse&&!o.boomOnWall){ P.stuck=true; P.vel.set(0,0,0); }
      else { pwShotEnd(i); continue; } }
    else P.pos.addScaledVector(dir,len);
    P.m.position.copy(P.pos); if(o.spin) P.m.rotateZ(o.spin*dt); else P.m.lookAt(_pws.copy(P.pos).add(P.vel));
    if(o.trail){ P.trail-=dt; if(P.trail<=0){ P.trail=0.03; mote(pwMats(o.trail).soft,P.pos.clone(),rnd(0.3,0.5)*(o.size||1),0.35,new V()); } }
  }
}
// ---- clouds and fields that sit in the air (or follow you) for a while. o: at or follow, r, dur, col, every (how
// often each() runs on the enemies inside), each(e), self(p,dt) while you're inside, end(at)
function pwZone(o){
  const Z={o,t:0,tick:0,pos:(o.at||chest(o.follow||player)).clone(),m:null,fx:0};
  if(!o.bare){ const m=new T.Mesh(pwGeo.sphere,pwMats(o.col||PC).fog.clone()); m.scale.setScalar(0.1); m.position.copy(Z.pos); world.add(m); Z.m=m; }
  pwZones.push(Z); return Z;
}
function updatePwZones(dt){
  for(let i=pwZones.length-1;i>=0;i--){ const Z=pwZones[i], o=Z.o; Z.t+=dt;
    if(Z.t>o.dur){ if(Z.m) world.remove(Z.m); pwZones.splice(i,1); if(o.end) o.end(Z.pos.clone(),Z); continue; }
    if(o.follow) Z.pos.copy(chest(o.follow));
    const fade=Math.min(1,Z.t*4,(o.dur-Z.t)*2);
    if(Z.m){ Z.m.position.copy(Z.pos); Z.m.scale.setScalar(o.r*Math.min(1,Z.t*5)); Z.m.material.opacity=(o.op||0.13)*fade; }
    Z.fx-=dt; if(Z.fx<=0){ Z.fx=o.fxRate||0.05; const a=rv(1).normalize().multiplyScalar(Math.sqrt(Math.random())*o.r);
      mote(pwMats(o.col||PC)[o.spark?'spark':'soft'],Z.pos.clone().add(a),rnd(0.6,1.4)*(o.puff||1),rnd(0.6,1.1),o.swirl?new V(-a.z,0,a.x).normalize().multiplyScalar(o.swirl):rv(0.6),o.spark?4:0); }
    if(o.self&&player.alive&&player.pos.distanceTo(Z.pos)<o.r+1) o.self(player,dt,Z);
    Z.tick-=dt; if(Z.tick<=0){ Z.tick=o.every||0.25;
      if(o.each) for(const e of combatants){ if(!e.alive||e===(o.src||player)) continue; if(Math.hypot(e.pos.x-Z.pos.x,e.pos.y+1-Z.pos.y,e.pos.z-Z.pos.z)>o.r+0.5) continue; o.each(e,Z); } } }
}
// ---- floating walls of cover: real blocks that stop bullets and people, gone after a while
function pwWall(p,o){
  camera.getWorldDirection(tv1); const f=new V(tv1.x,0,tv1.z); if(f.lengthSq()<0.01) f.set(0,0,-1); f.normalize();
  const along=Math.abs(f.x)>Math.abs(f.z)?'x':'z', c=chest(p).addScaledVector(tv1,o.dist||4), n=o.n||1, out=[];
  for(let k=0;k<n;k++){ const off=(k-(n-1)/2)*(o.gap||((o.w||4)+0.4)), x=c.x+(along==='z'?off:0), z=c.z+(along==='x'?off:0);
    const sx=along==='x'?(o.d||0.5):(o.w||4), sz=along==='z'?(o.d||0.5):(o.w||4), sy=o.h||3;
    const m=new T.Mesh(new T.BoxGeometry(sx,sy,sz),pwMats(o.col||PC).solid); m.position.set(x,c.y,z); world.add(m);
    const piece={meshes:[m],box:boxOf(x,c.y,z,sx,sy,sz)}; registerPiece(piece); m.scale.setScalar(0.05);
    const W={m,piece,t:0,dur:o.dur||6}; pwWalls.push(W); out.push(W);
    for(let i=0;i<8;i++) mote(pwMats(o.col||PC).soft,m.position.clone().add(rv(1.2)),rnd(0.8,1.4),0.5,rv(2)); }
  sfx('chop',c.clone(),{mat:'stone'}); return out;
}
function updatePwWalls(dt){
  for(let i=pwWalls.length-1;i>=0;i--){ const W=pwWalls[i]; W.t+=dt; const k=Math.min(1,W.t*6, (W.dur-W.t)*3); W.m.scale.setScalar(Math.max(0.05,k));
    if(W.t>W.dur){ pwWalls.splice(i,1); world.remove(W.m); W.m.geometry.dispose(); const j=structMeshes.indexOf(W.m); if(j>=0) structMeshes.splice(j,1); colliders.delete(W.piece.box); targetsDirty=true; puff(W.m.position,0xdddddd); } }
}
// ---- things that happen a little later
function later(t,f){ pwLaters.push({t,f}); }
function updateLaters(dt){ for(let i=pwLaters.length-1;i>=0;i--){ const L=pwLaters[i]; L.t-=dt; if(L.t<=0){ pwLaters.splice(i,1); L.f(); } } }
// ---- a strike from above: a ring warns where it lands, then a column of light (or a falling thing) and a blast
function pwStrike(at,o){
  const col=o.col||PC, ring=new T.Mesh(shockRing,pwMats(col).flat.clone()); ring.position.copy(at); ring.lookAt(at.clone().add(UP)); world.add(ring);
  const d=o.delay||0.8; effects.push({t:0,dur:d,obj:ring,upd:(e,k)=>{ ring.scale.setScalar((o.r||5)*(1.2-0.2*k)); ring.material.opacity=0.35+0.4*Math.abs(Math.sin(k*20)); },done:()=>ring.material.dispose()});
  if(o.fall){ const m=pwLook(o.fall,col,o.fallSize||2), top=new V(at.x+rnd(-6,6),Math.min(ZG.H-1,at.y+40),at.z+rnd(-6,6)); m.position.copy(top); world.add(m);
    effects.push({t:0,dur:d,obj:m,upd:(e,k)=>{ m.position.lerpVectors(top,at,k*k); if(o.fallTrail&&Math.random()<0.7) flame(m.position.clone(),rnd(1,1.6),0.3,rv(1)); }}); }
  later(d,()=>{ if(!o.fall){ const top=new V(at.x,Math.min(ZG.H,at.y+60),at.z), b=new T.Mesh(beamGeo,pwMats(col).flat.clone()); world.add(b);
      effects.push({t:0,dur:0.4,obj:b,upd:(e,k)=>{ placeSeg(b,top,at,(o.r||5)*0.35*(1-k)+0.05); b.material.opacity=0.7*(1-k); },done:()=>b.material.dispose()}); }
    pwBlast(at,Object.assign({},o,{r:o.r||5})); if(o.after) o.after(at); });
}
// ---- melee: whoever is in front of you, within reach
function pwTargets(p,reach,cosMin,all,thru){
  const dir=lookDir(), c=chest(p), out=[];
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z).sub(c); const d=_dv.length(); if(d>reach+0.5) continue; if(d>1.2&&_dv.dot(dir)<cosMin*d) continue;
    const at=new V(e.pos.x,e.pos.y+1.1,e.pos.z); if(!thru&&!hasLOS(c,at)) continue; out.push({d,e,at}); }
  out.sort((a,b)=>a.d-b.d); return all?out:out.slice(0,1);
}
function pwMelee(p,dmg,o?){ o=o||{}; const hits=pwTargets(p,PW_REACH*(o.reach||1),o.wide?0.35:0.6,!!o.wide,!!o.thru), dir=lookDir();
  for(const h of hits){ hurt(h.e,dmg,p,{point:h.at,weapon:POW?POW.name:'Pickaxe',dir,melee:true}); if(o.each&&h.e.alive) o.each(h.e,h.at); cutFx(h.at); }
  return hits; }
// ---- a dash: you fly fast for a moment, hurting whoever you touch. o: speed, dur, dmg, each(e), col, dir, first (stop at the first one), end(p)
function pwDash(p,o){ p.dash={o,t:0,dir:(o.dir||lookDir()).clone(),hit:new Set()}; sfx('propel'); }
// ---- a cone in front of you, for one moment of a held move. o: range, w (how fast it widens), dmg, each(e), col, fire
function pwCone(p,o,dt){
  const m=chest(p).addScaledVector(lookDir(),0.8), at=aimPoint(p,lookDir(),(o.range||12)+camDistNow+4), dir=at.sub(m).normalize();
  if(o.fire){ flameJet(p,m,dir,{range:o.range||12,dmg:(o.dmg||5),name:POW.name}); return; }
  for(let i=0;i<2;i++){ const v=dir.clone().multiplyScalar(rnd(18,24)).add(rv(2.5)); mote(pwMats(o.col||PC).soft,m.clone().addScaledVector(dir,0.3),rnd(0.5,0.8),Math.min(0.6,(o.range||12)/20),v); }
  p.coneTick=(p.coneTick||0)-dt; if(p.coneTick>0) return; p.coneTick=0.12;
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x-m.x,e.pos.y+1-m.y,e.pos.z-m.z); const along=_dv.dot(dir); if(along<0||along>(o.range||12)+0.6) continue;
    const perp=_dv.addScaledVector(dir,-along).length(); if(perp>0.5+along*(o.w||0.2)+0.4) continue; if(!hasLOS(m,_dv.set(e.pos.x,e.pos.y+1,e.pos.z))) continue;
    if(o.dmg) hurt(e,o.dmg,p,{weapon:POW.name,point:_dv.clone(),dir:dir.clone(),soft:true}); if(o.each&&e.alive) o.each(e); }
}
// a burst of the cone all at once (a single puff rather than a held spray)
function pwConeBurst(p,o){ const dir=lookDir(), c=chest(p);
  for(let i=0;i<26;i++){ const v=dir.clone().add(rv(o.w||0.35)).normalize().multiplyScalar(rnd(14,26)); mote(pwMats(o.col||PC).soft,c.clone().addScaledVector(dir,0.8),rnd(0.6,1.1),rnd(0.4,0.7),v); }
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z).sub(c); const d=_dv.length(); if(d>(o.range||12)) continue; if(_dv.dot(dir)<(o.cos||0.75)*d) continue;
    if(!hasLOS(c,tv2.set(e.pos.x,e.pos.y+1,e.pos.z))) continue; if(o.dmg) hurt(e,o.dmg,p,{weapon:POW.name,point:tv2.clone(),dir:dir.clone()}); if(o.each&&e.alive) o.each(e); }
  sfx(o.sfx||'shockS',c.clone()); }
// ---- a beam from your hand to whatever the crosshair is on, for one moment of a held move
function pwBeam(p,o,dt){
  const dir=lookDir(), hand=p.ch.bones.RightHand.getWorldPosition(new V()), h=nearMiss(p,dir,aimHit(p,dir,(o.range||70)+camDistNow),hand,1);
  const g=new T.Group(), core=new T.Mesh(beamGeo,pwMats(0xffffff).flat), glw=new T.Mesh(beamGeo,pwMats(o.col||PC).flat); g.add(glw); g.add(core); world.add(g);
  effects.push({t:0,dur:0.05,obj:g,upd:(e,k)=>{ placeSeg(core,hand,h.p,0.05); placeSeg(glw,hand,h.p,(o.w||0.2)*(1+0.2*Math.sin(matchTime*50))); }});
  if(Math.random()<0.5) mote(pwMats(o.col||PC).spark,h.p.clone(),rnd(0.4,0.7),0.2,rv(4),8);
  if(h.ent){ p.beamTick=(p.beamTick||0)-dt; if(p.beamTick<=0){ p.beamTick=0.1; hurt(h.ent,(o.dps||40)*0.1,p,{weapon:POW.name,point:h.p,dir,soft:true}); if(o.each&&h.ent.alive) o.each(h.ent); } }
}
// ---- things that circle you: o: n, r, dur, look, col, dmg, each(e), absorb (each one soaks up this much)
function pwOrbit(p,o){ if(p.orbit) for(const m of p.orbit.ms) world.remove(m);
  const ms=[]; for(let i=0;i<o.n;i++){ const m=pwLook(o.look,o.col||PC,o.size||1); world.add(m); ms.push(m); }
  p.orbit={o,t:0,ms,cd:new Map()}; if(o.absorb) p.absorb=(p.absorb||0)+o.absorb*o.n; }
function updateOrbit(p,dt){ const O=p.orbit; if(!O) return; O.t+=dt; const o=O.o;
  if(o.absorb&&O.ms.length>Math.ceil((p.absorb||0)/o.absorb)){ const m=O.ms.pop(); world.remove(m); puff(m.position,o.col||PC); }
  if(O.t>o.dur||!p.alive||!O.ms.length){ for(const m of O.ms) world.remove(m); if(o.absorb) p.absorb=0; p.orbit=null; return; }
  const c=chest(p);
  O.ms.forEach((m,i)=>{ const a=O.t*(o.spin||3)+i*TAU/O.ms.length; m.position.set(c.x+Math.cos(a)*o.r,c.y+Math.sin(O.t*2+i)*0.3,c.z+Math.sin(a)*o.r); m.rotation.y=-a;
    if(o.dmg||o.each) for(const e of combatants){ if(!e.alive||e===p) continue; if(Math.hypot(e.pos.x-m.position.x,e.pos.y+1-m.position.y,e.pos.z-m.position.z)>1.4) continue;
      const last=O.cd.get(e)||-9; if(O.t-last<0.5) continue; O.cd.set(e,O.t); if(o.dmg) hurt(e,o.dmg,p,{weapon:POW.name,point:m.position.clone(),soft:true}); if(o.each&&e.alive) o.each(e); } });
}
// ---- a line out to a wall that reels you in (or, if it catches someone, reels them in to you)
function pwGrapple(p,o){
  const dir=lookDir(), h=aimHit(p,dir,(o.range||70)+camDistNow), hand=p.ch.bones.RightHand.getWorldPosition(new V());
  const line=new T.Mesh(beamGeo,pwMats(o.col||PC).flat); world.add(line);
  if(h.ent&&o.pullEnemy){ const e=h.ent; pwKnock(e,chest(p).sub(chest(e)).normalize(),Math.min(40,chest(p).distanceTo(chest(e))*2.2)); pwStun(e,0.5);
    effects.push({t:0,dur:0.35,obj:line,upd:()=>placeSeg(line,p.ch.bones.RightHand.getWorldPosition(new V()),chest(e),0.035)}); sfx('stretch'); return; }
  if(!(h.wall||h.ent)){ world.remove(line); sfx('deny'); return false; }
  p.grap={to:h.p.clone(),t:0,line,o}; sfx('stick',h.p.clone()); return true;
}
function pwTeleport(p,range){
  const dir=lookDir(), c=chest(p), h=aimHit(p,dir,range+camDistNow), d=Math.max(0,Math.min(range,c.distanceTo(h.p)-1.5)), to=c.clone().addScaledVector(dir,d);
  for(let i=0;i<14;i++){ mote(pwMats(PC).spark,c.clone().add(rv(0.7)),rnd(0.3,0.6),0.4,rv(3),9); mote(pwMats(PC).spark,to.clone().add(rv(0.7)),rnd(0.3,0.6),0.4,rv(3),9); }
  p.pos.set(clamp(to.x,-ZG.L+1,ZG.L-1),clamp(to.y-1.2,0.2,ZG.H-2.2),clamp(to.z,-ZG.L+1,ZG.L-1)); p.vel.multiplyScalar(0.3); sfx('zapB',to.clone());
}
// a short-lived trail of hurt behind you (Synthwave's neon)
function pwHazard(at,col,dmg,dur,r?){ pwZone({at,r:r||1.6,dur:dur||1.5,col,bare:true,every:0.3,fxRate:0.04,puff:0.6,each:e=>hurt(e,dmg,player,{weapon:POW.name,soft:true})}); }
// give the player a random shop item they don't have, into a free slot (the Supply Drop)
function giveShopItem(){ const p=player, opts=SHOP.filter(it=>it.id!=='bounce'&&!ownsItem(it.id)); let slot=-1; for(let k=6;k<NSLOT;k++) if(!p.slots[k]){ slot=k; break; }
  if(!opts.length||slot<0){ pwShield(p,25); return 'Shield'; } const it=pick(opts);
  p.slots[slot]=it.id==='mf'?{kind:'gun',id:'mf',r:4,ammo:MF_CLIP}:it.id==='gren'?{kind:'vest',id:'gren',count:GREN_N,regen:0}:{kind:'gun',id:it.id,r:4,ammo:1,cd:0}; refreshHotbar(); return it.name; }

// ---- equipping, input and the per-frame update
function pwEquip(eq){
  POW=eq&&!eq.anime&&POWERS[eq.n]?Object.assign({name:eq.n},POWERS[eq.n]):null; PC=eq?new T.Color(eq.h1).getHex():0xffffff;
  const p=player; if(!p) return; if(p.orbit){ for(const m of p.orbit.ms) world.remove(m); p.orbit=null; } if(p.grap){ world.remove(p.grap.line); p.grap=null; } p.dash=null; p.ride=null;
  p.pwCd=0; p.pwOn=false; p.pwHits=0; p.pwSwings=0; p.pwCombo=0; p.pwComboT=0; p.pwLives=POW&&POW.lives?POW.lives:0; p.pwEarned=false; p.absorb=0; p.bubbles=0; p.pb={};
}
function pwSwing(p){ // a tap: the ordinary swing, sped up or slowed down by the pickaxe
  if(p.fireCd>0) return; const T0=POW.tap; p.fireCd=0.42/((T0.spd||1)*bv(p,'swing',1));
  p.swingSide=p.swingT>0||p.comboT>0?1-(p.swingSide||0):0; p.swingT=SWING_T/Math.max(1,(T0.spd||1)*0.8); p.comboT=p.swingT+0.3; p.hitT=p.swingT*PICK_HIT; sfx('swing');
  if(p.pwAmbush&&bv(p,'hide')){ p.pb.hide.t=0; }
}
function pwHit(p){ // where the swing lands
  const T0=POW.tap; p.pwSwings++;
  const hits=pwTargets(p,PW_REACH*(T0.reach||1),T0.wide?0.35:0.6,!!T0.wide,!!T0.thru), dir=lookDir();
  for(const h of hits){ const e=h.e; let dmg=PW_BASE*(T0.dmg||1);
    if(T0.mod) dmg*=T0.mod(p,e); if(p.pwAmbush){ dmg*=2; p.pwAmbush=false; }
    if(T0.combo){ p.pwCombo=p.pwComboT>0?Math.min(5,p.pwCombo+1):0; p.pwComboT=2; dmg+=p.pwCombo*2; }
    const crit=T0.crit&&Math.random()<T0.crit; if(crit) dmg*=2;
    hurt(e,dmg,p,{point:h.at,weapon:POW.name,dir,melee:true,head:crit}); p.pwHits++;
    if(e.alive&&T0.hit) T0.hit(p,e,h.at);
    if(T0.knock&&e.alive) pwKnock(e,dir,T0.knock); if(T0.pull&&e.alive) pwPull(e,chest(p),T0.pull);
    if(T0.heal) pwHeal(p,T0.heal); }
  if(!hits.length){ const h=aimHit(p,dir,camDistNow+PW_REACH); if(h.wall) sfx('chop',h.p,{mat:'stone'}); }
  if(T0.swing) T0.swing(p,hits);
}
// holding the button: once-moves fire as soon as the hold starts; held moves run until you let go (or run out); charged
// moves fire when you let go
function pwInput(p,dt){
  const H=POW.hold;
  if(mouse.l){ p.aHold=(p.aHold||0)+dt; if(p.aHold<=ANIME_HOLD||lockedUp(p)) return;
    if(p.pwOn){ p.pwT+=dt; if(H.kind==='chan'){ H.tick(p,dt,p.pwT); if(p.pwT>=H.max) pwHoldEnd(p); } else if(H.kind==='charge'){ const k=Math.min(1,p.pwT/H.max); if(Math.random()<0.6) mote(pwMats(PC).soft,chest(p).add(rv(1).normalize().multiplyScalar(2.2-1.4*k)),rnd(0.3,0.6)*(0.6+k),0.25,new V()); p.anim.hit=Math.max(p.anim.hit||0,0.15*k); } return; }
    if(p.pwFired) return; p.pwFired=true;
    if(p.pwCd>0){ sfx('deny'); return; }
    if(!H.kind||H.kind==='once'){ const ok=H.go(p); if(ok!==false){ p.pwCd=H.cd; p.swingT=SWING_T; p.swingSide=0; } else p.pwCd=0.5; }
    else { p.pwOn=true; p.pwT=0; if(H.start) H.start(p); if(H.kind==='charge') sfx('useStart',null,{id:'big'}); }
  } else { if(p.pwOn) pwHoldEnd(p); p.aHold=0; p.pwFired=false; }
}
function pwHoldEnd(p){ const H=POW.hold; if(!p.pwOn) return; p.pwOn=false; if(H.kind==='charge'){ H.go(p,Math.min(1,p.pwT/H.max)); p.swingT=SWING_T; } else if(H.end) H.end(p); p.pwCd=H.cd; }
function pwOnKill(t){ if(POW&&POW.tap.kill) POW.tap.kill(player,t); }
function pwUpdate(dt){
  const p=player; if(!p) return;
  updatePwShots(dt); updatePwZones(dt); updatePwWalls(dt); updateLaters(dt); updateOrbit(p,dt);
  if(p.pwCd>0) p.pwCd=Math.max(0,p.pwCd-dt); if(p.pwComboT>0) p.pwComboT-=dt;
  if(!p.alive){ p.dash=null; if(p.grap){ world.remove(p.grap.line); p.grap=null; } return; }
  if(POW&&!curItem()&&state==='play') pwInput(p,dt); else if(p.pwOn) pwHoldEnd(p);
  if(bv(p,'regen')) pwHeal(p,bv(p,'regen')*dt);
  if(p.ride&&p.ride.t>0){ p.ride.t-=dt; p.vel.copy(lookDir().multiplyScalar(p.ride.speed)); p.boostT=0.3; if(p.ride.tick) p.ride.tick(p,dt); }
  if(p.dash){ const D=p.dash, o=D.o; D.t+=dt; p.vel.copy(D.dir).multiplyScalar(o.speed||40); p.boostT=0.3;
    if(Math.random()<0.8) mote(pwMats(o.col||PC).soft,chest(p).add(rv(0.4)),rnd(0.6,1.1),0.4,new V());
    for(const e of combatants){ if(!e.alive||e===p||D.hit.has(e)) continue; if(Math.hypot(e.pos.x-p.pos.x,e.pos.y-p.pos.y,e.pos.z-p.pos.z)>2.4) continue; D.hit.add(e);
      if(o.dmg) hurt(e,o.dmg,p,{weapon:POW.name,point:chest(e),dir:D.dir.clone(),melee:true}); if(o.each&&e.alive) o.each(e); if(o.first){ D.t=o.dur; break; } }
    if(D.t>=o.dur){ p.dash=null; p.vel.multiplyScalar(0.35); if(o.end) o.end(p); } }
  if(p.grap){ const G=p.grap; G.t+=dt; const hand=p.ch.bones.RightHand.getWorldPosition(new V()); placeSeg(G.line,hand,G.to,0.035);
    _pws.copy(G.to).sub(chest(p)); const d=_pws.length(); if(d<2.4||G.t>1.8||mouse.r){ world.remove(G.line); p.grap=null; p.vel.multiplyScalar(0.4); }
    else { p.vel.copy(_pws.divideScalar(d).multiplyScalar(G.o.speed||42)); p.boostT=0.3; } }
  if(bv(p,'hide')&&Math.random()<0.4) mote(pwMats(0xbfc8d6).soft,chest(p).add(rv(0.5)),rnd(0.3,0.5),0.3,new V());
  if(bv(p,'guard')&&p.guardFx!==false&&Math.random()<0.5) mote(pwMats(PC).spark,chest(p).add(rv(1).normalize().multiplyScalar(1.3)),rnd(0.2,0.4),0.25,new V(),6);
}

// ---- every pickaxe's two moves. tap: dmg/spd/reach (multipliers), wide (hits everyone in front), thru (through
// blocks), knock/pull, heal, crit, combo, mod(p,e) (a damage multiplier), hit(p,e,at) and swing(p,hits) for the
// extras, kill(p,t) after an elimination. hold: kind once/chan/charge, cd (recharge), max (how long a held or
// charged move can go), go/tick/start/end.
const fan=(p,o)=>pwShot(p,o);
const cutLine=(p,len,col,dmg,each?)=>{ const dir=lookDir(), a=chest(p), b=a.clone().addScaledVector(dir,len), m=new T.Mesh(beamGeo,pwMats(col).flat.clone()); world.add(m);
  effects.push({t:0,dur:0.3,obj:m,upd:(e,k)=>{ placeSeg(m,a,b,0.09*(1-k)+0.01); m.material.opacity=1-k; },done:()=>m.material.dispose()});
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z); if(segDist(a,dir,len,_dv)>1.3) continue; hurt(e,dmg,p,{weapon:POW.name,point:_dv.clone(),dir}); if(each&&e.alive) each(e); cutFx(_dv.clone()); } sfx('katana',a.clone()); };
const POWERS={
// ---------- Halloween
"Jack-o-Lantern":{tap:{swing:p=>fan(p,{look:'pumpkin',speed:9,fuse:1,size:1,dmg:0,stick:true,end:at=>pwBlast(at,{r:4.5,dmg:30,col:0xff8a1f})})},
  hold:{cd:9,go:p=>{ fan(p,{look:'pumpkin',size:2.6,speed:34,life:3,boomOnWall:true,end:at=>{ pwBlast(at,{r:6,dmg:40,fire:true}); for(let i=0;i<5;i++) fan(p,{from:at,dir:rv(1).normalize(),look:'pumpkin',speed:12,fuse:0.9,stick:true,end:a=>pwBlast(a,{r:4,dmg:22,col:0xff8a1f})}); }}); }}},
"Spooky Shadow":{tap:{swing:p=>fan(p,{look:'bat',col:0x3a2a5a,n:3,spread:0.35,speed:26,home:5,homeR:40,life:2.5,dmg:6,size:0.8})},
  hold:{cd:8,go:p=>pwDash(p,{speed:36,dur:2,dmg:15,col:0x3a2a5a,each:e=>pwSlow(e,0.2)})}},
"Grave Digger":{tap:{hit:(p,e,at)=>{ pwBlind(e,1); for(let i=0;i<6;i++) mote(pwMats(0x6b4a2a).soft,at.clone(),rnd(0.3,0.6),0.5,rv(3)); }},
  hold:{cd:10,go:p=>{ pwWall(p,{n:3,w:1.6,h:2.6,d:0.6,dist:4,dur:6,col:0x4e5360,gap:2.2}); }}},
"Grim Reaper":{tap:{wide:true,dmg:1.1},
  hold:{cd:8,go:p=>{ const c=chest(p), ring=new T.Mesh(pwGeo.crescent,pwMats(0x9b5cff).flat.clone()); ring.position.copy(c); world.add(ring);
    effects.push({t:0,dur:0.5,obj:ring,upd:(e,k)=>{ ring.position.copy(chest(p)); ring.rotation.set(Math.PI/2,0,k*TAU*1.2); ring.scale.setScalar(5.5); ring.material.opacity=1-k; },done:()=>ring.material.dispose()});
    for(const e of enemies(p)){ if(chest(e).distanceTo(c)>6) continue; hurt(e,32,p,{weapon:POW.name,point:chest(e),melee:true}); pwHeal(p,10); cutFx(chest(e)); } sfx('katana',c.clone()); }}},
"Candy Corn":{tap:{spd:1.15,swing:p=>fan(p,{look:'dart',col:0xffb02a,n:3,spread:0.08,speed:70,dmg:6,life:1})},
  hold:{cd:6,go:p=>fan(p,{look:'dart',col:0xffb02a,n:15,spread:0.4,vspread:0.08,speed:65,dmg:7,life:1.1})}},
"Witch's Wart":{tap:{hit:(p,e,at)=>{ pwSlow(e,0.35); for(let i=0;i<5;i++) mote(pwMats(0x5be04a).soft,at.clone(),rnd(0.3,0.6),0.5,rv(2.5)); }},
  hold:{cd:9,go:p=>fan(p,{look:'orb',col:0x5be04a,speed:38,life:2,boomOnWall:true,end:at=>pwZone({at,r:6,dur:5,col:0x5be04a,each:e=>{ pwSlow(e,0.18); pwPoison(e,player,8,1); }})})}},
"Bone Pick":{tap:{hit:(p,e)=>pwReveal(e,3,0xf2ecd8)},
  hold:{cd:6,go:p=>fan(p,{look:'bone',col:0xf2ecd8,speed:45,life:1.4,boomer:true,pierce:true,dmg:28,spin:18,size:1.4})}},
"Spider Silk":{tap:{hit:(p,e)=>pwStun(e,1)},
  hold:{cd:5,go:p=>pwGrapple(p,{col:0xf4f6fa,speed:46})}},
"Glossy Ghost":{tap:{thru:true},
  hold:{cd:12,go:p=>{ buff(p,'ghost',2); buff(p,'hide',2); sfx('zapB');
    later(2,()=>{ if(!p.alive) return; pwBlast(chest(p),{r:8,dmg:12,col:0xbfe8ff,kb:10,each:e=>pwStun(e,1.2)}); sfx('roar',p.pos.clone()); }); }}},
"Pumpkin King":{tap:{dmg:1.6,spd:0.8},
  hold:{cd:12,go:p=>pwOrbit(p,{n:6,r:2.6,dur:6,look:'pumpkin',col:0xff8a1f,size:1.3,dmg:8,each:e=>ignite(e,p)})}},
// ---------- Christmas
"Candy Cane Classic":{tap:{pull:18},
  hold:{cd:5,go:p=>pwGrapple(p,{col:0xff4d5e,speed:44})}},
"Holly Jolly":{tap:{heal:5},
  hold:{cd:12,go:p=>{ pwZone({at:chest(p),r:5,dur:5,col:0x2f9a4a,spark:true,self:(q,dt)=>pwHeal(q,10*dt)}); sfx('healDone'); }}},
"Gingerbread Smash":{tap:{dmg:1.15,knock:26},
  hold:{cd:9,go:p=>fan(p,{look:'ginger',col:0xb0703a,speed:16,home:3,homeR:70,life:6,size:1.3,r:0.9,end:at=>pwBlast(at,{r:5,dmg:40,fire:true})})}},
"Nutcracker Guard":{tap:{reach:1.6},
  hold:{cd:7,go:p=>pwDash(p,{speed:42,dur:0.25,dmg:30,col:0xc9a227,each:e=>{ if(e.shield>0){ e.shield=0; sfx('shieldBreak'); } }})}},
"Frostbite":{tap:{hit:(p,e)=>pwSlow(e,0.3)},
  hold:{kind:'chan',cd:8,max:1.6,tick:(p,dt)=>pwCone(p,{range:14,w:0.18,dmg:2,col:0x9fe3ff,each:e=>{ if(e.frozen>0||e.frzImm>0) return; e.chill=Math.min(1,(e.chill||0)+0.16); if(e.chill>=1) freezeChar(e); }},dt)}},
"Sleigh Bell":{tap:{hit:(p,e)=>pwStun(e,0.5)},
  hold:{cd:12,go:p=>{ p.ride={t:3,speed:28,drop:0,tick:(q,dt)=>{ q.ride.drop-=dt; if(Math.random()<0.5) mote(pwMats(0xffd23f).spark,chest(q).add(rv(0.6)),rnd(0.3,0.5),0.5,new V(),6);
      if(q.ride.drop<=0){ q.ride.drop=0.4; fan(q,{from:q.pos.clone(),dir:lookDir().negate(),look:'gift',col:0xe8283c,speed:2,fuse:1,stick:true,end:at=>pwBlast(at,{r:4,dmg:22,col:0xe8283c})}); } }}; sfx('pickup'); }}},
"Ugly Sweater":{tap:{hit:(p,e)=>pwSlow(e,0.25)},
  hold:{cd:12,go:p=>{ p.absorb=Math.max(p.absorb||0,50); for(let i=0;i<14;i++) mote(pwMats(0x2f9a4a).soft,chest(p).add(rv(1)),rnd(0.5,0.9),0.6,rv(1)); sfx('useStart',null,{id:'big'}); }}},
"Ornament Breaker":{tap:{hit:(p,e,at)=>{ for(const o of enemies(p)) if(o!==e&&chest(o).distanceTo(at)<3) hurt(o,5,p,{weapon:POW.name,soft:true}); hurt(e,5,p,{weapon:POW.name,soft:true}); for(let i=0;i<6;i++) mote(pwMats(0xd8eefc).spark,at.clone(),rnd(0.2,0.4),0.35,rv(6),9); }},
  hold:{cd:7,go:p=>fan(p,{look:'orb',col:0xe8283c,size:2,speed:42,life:2,boomOnWall:true,end:at=>{ for(let i=0;i<12;i++) fan(p,{from:at,dir:rv(1).normalize(),look:'shard',col:0xd8eefc,speed:30,life:0.6,dmg:8}); sfx('shatter',at); }})}},
"North Star":{tap:{swing:p=>fan(p,{look:'star',col:0xfff2a8,speed:40,home:6,homeR:50,life:2,dmg:8})},
  hold:{cd:8,go:p=>pwStrike(aimPoint(p,lookDir(),150),{delay:1,r:6,dmg:50,col:0xfff2a8})}},
"Krampus Claw":{tap:{hit:(p,e)=>pwMark(e,10,1.1,0xb01a2a)},
  hold:{cd:9,go:p=>{ let n=0; for(const e of enemies(p)){ if(!(e.markT>0)||chest(e).distanceTo(chest(p))>70) continue; n++; zapArc(chest(p),chest(e),0.35,0.03,pwMats(0x444444).flat,pwMats(0xb01a2a).flat); hurt(e,10,p,{weapon:POW.name}); pwPull(e,chest(p),40); pwStun(e,0.5); }
    if(!n){ sfx('deny'); return false; } sfx('stretch'); }}},
// ---------- Graffiti
"Fresh Tag":{tap:{hit:(p,e)=>pwMark(e,5,1.1,0xff3fa4)},
  hold:{cd:10,go:p=>{ const at=aimHit(p,lookDir(),120).p; pwZone({at,r:25,dur:8,col:0xff3fa4,op:0.04,each:e=>pwReveal(e,0.6,0xff3fa4)}); for(let i=0;i<20;i++) mote(pwMats(0xff3fa4).soft,at.clone().add(rv(1.5)),rnd(0.8,1.4),1,rv(1)); sfx('ui'); }}},
"Drip Lord":{tap:{swing:p=>{ for(let i=0;i<4;i++) mote(pwMats(0x9b5cff).soft,chest(p).addScaledVector(lookDir(),1).add(rv(0.5)),rnd(0.3,0.5),1,new V(0,-1,0)); }},
  hold:{cd:8,go:p=>{ pwDash(p,{speed:34,dur:0.6,col:0x9b5cff}); buff(p,'spd',4,1.4); }}},
"Wildstyle":{tap:{hit:(p,e)=>{ const r=Math.random(); if(r<0.34) ignite(e,p); else if(r<0.67) pwSlow(e,0.4); else { pwStun(e,0.5); zapArc(chest(p),chest(e),0.15,0.03); } }},
  hold:{cd:8,go:p=>pwConeBurst(p,{range:11,cos:0.72,dmg:25,col:0xff3fa4,each:e=>{ ignite(e,p); pwSlow(e,0.5); pwStun(e,0.6); }})}},
"Wet Paint":{tap:{knock:20},
  hold:{cd:9,go:p=>fan(p,{look:'orb',col:0x3fa0f5,size:1.4,speed:36,life:2,boomOnWall:true,end:at=>pwZone({at,r:6,dur:6,col:0x3fa0f5,each:e=>{ e.knockT=Math.max(e.knockT||0,0.4); e.vel.add(rv(3)); }})})}},
"Throw-Up":{tap:{hit:p=>{ p.bubbles=Math.min(3,(p.bubbles||0)+1); }},
  hold:{cd:12,go:p=>{ buff(p,'guard',3,2); const b=new T.Mesh(pwGeo.sphere,pwMats(0xff8fc8).fog.clone()); world.add(b);
    effects.push({t:0,dur:3,obj:b,upd:(e,k)=>{ b.position.copy(chest(p)); b.scale.setScalar(1.7+0.05*Math.sin(e.t*9)); b.material.opacity=0.3*(1-k*k); },done:()=>b.material.dispose()}); sfx('boing'); }}},
"Back Alley":{tap:{knock:16},
  hold:{cd:10,go:p=>{ pwWall(p,{w:5,h:3.4,d:0.7,dist:4,dur:6,col:0xa8452a}); }}},
"Burner":{tap:{hit:(p,e)=>ignite(e,p)},
  hold:{kind:'chan',cd:8,max:2,tick:(p,dt)=>pwCone(p,{range:13,dmg:6,fire:true},dt)}},
"Stencil":{tap:{dmg:1.1,crit:0.3},
  hold:{cd:7,go:p=>cutLine(p,30,0xffffff,40)}},
"Spray Can":{tap:{hit:(p,e,at)=>{ pwBlind(e,0.5); for(let i=0;i<4;i++) mote(pwMats(0x8892a2).soft,at.clone(),rnd(0.6,1),0.8,rv(1)); }},
  hold:{cd:12,go:p=>fan(p,{look:'box',col:0x8892a2,speed:34,life:1.5,boomOnWall:true,end:at=>pwZone({at,r:8,dur:8,col:0x8892a2,op:0.35,puff:2,fxRate:0.03,each:e=>pwBlind(e,0.5),self:q=>buff(q,'hide',0.3)})})}},
"Rooftop King":{tap:{mod:(p,e)=>((p.pos.y-e.pos.y)*(ZG.state==='ceil'?-1:1)>1.5?1.2:1)},
  hold:{cd:8,go:p=>{ const t=crosshairTarget(p,0.97); p.vel.y+=(ZG.state==='ceil'?-1:1)*18; sfx('jump');
    later(0.35,()=>{ if(!p.alive) return; const to=t&&t.alive?chest(t):aimPoint(p,lookDir(),60); pwDash(p,{dir:to.sub(chest(p)).normalize(),speed:48,dur:0.6,first:true,dmg:20,col:0xff3fa4,end:q=>pwBlast(chest(q),{r:5,dmg:30,col:0xff3fa4})}); }); }}},
// ---------- Neon Arcade
"Pixel Pick":{tap:{hit:p=>{ if(!p.pwEarned&&p.pwHits>=25){ p.pwEarned=true; p.pwLives=(p.pwLives||0)+1; toast('Extra life'); sfx('pickup'); } }},
  hold:{kind:'chan',cd:7,max:2,tick:(p,dt)=>{ p.pxT=(p.pxT||0)-dt; if(p.pxT<=0){ p.pxT=0.08; fan(p,{look:'box',col:0x19e3ff,speed:65,dmg:7,life:1.2,spread:0.03}); sfx('tick'); } }}},
"Synthwave":{tap:{swing:p=>pwHazard(chest(p).addScaledVector(lookDir(),2),0xff3fa4,4,1.5)},
  hold:{cd:10,go:p=>{ buff(p,'spd',4,1.4); let k=0; const drop=()=>{ if(!p.alive||k++>26) return; pwHazard(chest(p),0xff3fa4,4,1.6); later(0.15,drop); }; drop(); }}},
"Glitch":{tap:{hit:p=>{ if(Math.random()<0.3) pwTeleport(p,3); }},
  hold:{cd:6,go:p=>pwTeleport(p,20)}},
"Circuit Breaker":{tap:{hit:(p,e)=>{ pwStun(e,0.5); zapArc(chest(p),chest(e),0.15,0.03); }},
  hold:{cd:11,go:p=>pwBlast(chest(p),{r:10,dmg:15,col:0x3f9bff,kb:6,each:e=>{ pwStun(e,1); pwJam(e,2); zapArc(chest(p),chest(e),0.3,0.03); }})}},
"High Score":{tap:{combo:true},
  hold:{cd:6,go:p=>{ const c=p.pwComboT>0?p.pwCombo:0; pwBlast(chest(p).addScaledVector(lookDir(),4),{r:6+c,dmg:15+c*8,col:0xffd23f}); showDmg(chest(p).add(new V(0,1,0)),'x'+(c+1),'head'); p.pwCombo=0; p.pwComboT=0; }}},
"Laser Edge":{tap:{thru:true},
  hold:{kind:'chan',cd:8,max:2,tick:(p,dt)=>{ pwBeam(p,{col:0xff2a4a,dps:60,w:0.16},dt); if(Math.random()<0.3) sfx('zapB'); }}},
"Joystick":{tap:{spd:1.25},
  hold:{kind:'chan',cd:6,max:1,tick:(p,dt)=>{ p.flT=(p.flT||0)-dt; if(p.flT<=0){ p.flT=0.1; p.swingSide=1-(p.swingSide||0); p.swingT=SWING_T*0.4; pwMelee(p,8); sfx('swing'); } }}},
"Hologram":{tap:{hit:p=>{ buff(p,'hide',0.6); for(let i=0;i<8;i++) mote(pwMats(0x19e3ff).soft,chest(p).add(rv(0.6)),rnd(0.5,0.8),0.8,new V()); }},
  hold:{cd:14,go:p=>{ const [h]=fan(p,{look:'holo',col:0x19e3ff,dir:lookDir().negate(),from:p.pos.clone(),speed:12,life:6,size:1}); buff(p,'hide',3);
    for(const b of bots){ if(b.alive&&b.enemy===player){ b.enemy=null; b.goal=h.pos; b.think=3; } } sfx('zapB'); }}},
"Bit Crusher":{tap:{hit:(p,e,at)=>{ pwSlow(e,0.3); for(let i=0;i<5;i++) mote(pwMats(0x19e3ff).spark,at.clone(),rnd(0.2,0.35),0.4,rv(4)); }},
  hold:{cd:10,go:p=>{ const t=crosshairTarget(p,0.97); if(!t){ sfx('deny'); return false; } t.tinyT=3; zapArc(chest(p),chest(t),0.3,0.04,pwMats(0xffffff).flat,pwMats(0x19e3ff).flat); sfx('zapB',t.pos.clone()); }}},
"Overclock":{tap:{kill:p=>{ buff(p,'swing',5,2); toast('Overdrive'); }},
  hold:{cd:15,go:p=>{ buff(p,'spd',4,1.5); buff(p,'swing',4,1.5); sfx('zapB'); }}},
// ---------- Deep Sea
"Coral Reef":{tap:{hit:(p,e,at)=>{ for(const o of enemies(p)) if(chest(o).distanceTo(at)<3) hurt(o,6,p,{weapon:POW.name,soft:true}); for(let i=0;i<5;i++) mote(pwMats(0xff7f6a).spark,at.clone(),rnd(0.2,0.4),0.4,rv(5),8); }},
  hold:{cd:12,go:p=>{ p.absorb=Math.max(p.absorb||0,40); for(let i=0;i<16;i++) mote(pwMats(0xff7f6a).soft,chest(p).add(rv(1)),rnd(0.5,0.9),0.7,rv(1)); sfx('useStart',null,{id:'big'}); }}},
"Shark Bite":{tap:{mod:(p,e)=>e.hp<50?1.25:1},
  hold:{cd:7,go:p=>pwDash(p,{speed:46,dur:0.5,first:true,dmg:40,col:0x7c8696})}},
"Kraken":{tap:{pull:16},
  hold:{cd:11,go:p=>{ let n=0; for(const e of enemies(p)){ if(chest(e).distanceTo(chest(p))>14) continue; n++; pwStun(e,2); hurt(e,10,p,{weapon:POW.name}); const from=chest(e).add(rv(4)); zapArc(from,chest(e),2,0.06,pwMats(0x6a2a7a).solid,pwMats(0x9b4ab0).flat); }
    pwBlast(chest(p),{r:3,dmg:0,col:0x6a2a7a,kb:0}); if(!n) sfx('deny'); }}},
"Anglerfish":{tap:{hit:(p,e)=>pwReveal(e,4,0x9fffcf)},
  hold:{cd:12,go:p=>fan(p,{look:'orb',col:0x9fffcf,speed:30,stop:0.5,life:3.6,size:1.2,trail:0x9fffcf,
    end:at=>pwBlast(at,{r:7,dmg:50,col:0x2fd6c8})}).forEach(P=>{ for(const b of bots){ if(b.alive&&b.pos.distanceTo(P.pos)<60){ b.enemy=null; b.goal=P.pos; b.think=3; } } })}},
"Tidebreaker":{tap:{reach:1.5},
  hold:{cd:6,go:p=>fan(p,{look:'dart',col:0x2fd6c8,size:3,speed:55,life:1.2,boomer:true,pierce:true,dmg:35})}},
"Pearl Diver":{tap:{swing:p=>fan(p,{look:'orb',col:0xf4f0ff,size:0.6,speed:50,bounce:2,dmg:8,life:2})},
  hold:{cd:6,go:p=>fan(p,{look:'orb',col:0xf4f0ff,size:0.8,n:5,spread:0.25,speed:50,bounce:4,bounceHome:true,dmg:10,life:3})}},
"Sunken Treasure":{tap:{hit:(p,e,at)=>{ if(Math.random()<0.05){ p.bank++; showDmg(at,'+1','head'); sfx('pickup'); } for(let i=0;i<3;i++) mote(pwMats(0xffd23f).spark,at.clone(),rnd(0.2,0.35),0.4,rv(4),8); }},
  hold:{cd:6,go:p=>pwGrapple(p,{col:0x5a4a2a,speed:40,range:80})}},
"Abyssal":{tap:{hit:(p,e)=>pwSlow(e,0.36)},
  hold:{cd:11,go:p=>{ const at=aimHit(p,lookDir(),80).p; pwZone({at,r:7,dur:5,col:0x1a2a5a,op:0.22,each:e=>{ pwSlow(e,0.3); hurt(e,5,p,{weapon:POW.name,soft:true}); }}); }}},
"Jellyfish":{tap:{hit:(p,e)=>pwPoison(e,p,3,3)},
  hold:{cd:10,go:p=>fan(p,{look:'jelly',col:0xff8fe0,n:4,spread:0.5,speed:6,home:1.2,homeR:40,life:8,every:1,dmg:10,size:1.4,hit:e=>pwStun(e,0.4)})}},
"Driftwood":{tap:{dmg:1.1,knock:22},
  hold:{cd:8,go:p=>pwDash(p,{speed:30,dur:0.8,dmg:18,col:0x8a6a4a,each:e=>pwKnock(e,lookDir().add(rv(0.5)).normalize(),30)})}},
// ---------- Volcanic
"Magma Core":{tap:{hit:(p,e,at)=>pwZone({at,r:2,dur:4,col:0xff5a1f,op:0.3,every:0.5,each:o=>ignite(o,p)})},
  hold:{cd:8,go:p=>fan(p,{look:'orb',col:0xff5a1f,size:2,speed:40,life:2.5,trail:0xff9a2a,boomOnWall:true,end:at=>pwBlast(at,{r:7,dmg:45,fire:true})})}},
"Obsidian":{tap:{crit:0.25},
  hold:{cd:7,go:p=>fan(p,{look:'shard',col:0x20202a,n:12,spread:0.14,vspread:0.06,speed:80,dmg:9,life:1})}},
"Eruption":{tap:{hit:(p,e)=>{ if(p.pwHits%10===0) pwBlast(chest(p),{r:6,dmg:30,fire:true}); }},
  hold:{kind:'charge',cd:10,max:1.5,go:(p,k)=>pwBlast(chest(p),{r:6+6*k,dmg:30+40*k,fire:true})}},
"Basalt":{tap:{hit:p=>buff(p,'armor',0.5,0.9)},
  hold:{cd:12,go:p=>{ buff(p,'armor',4,0.5); buff(p,'spd',4,0.75); for(let i=0;i<12;i++) mote(pwMats(0x4a4a52).soft,chest(p).add(rv(1)),rnd(0.6,1),0.6,rv(1)); sfx('chop',null,{mat:'stone'}); }}},
"Ember Fang":{tap:{hit:(p,e)=>ignite(e,p)},
  hold:{cd:7,go:p=>pwDash(p,{speed:42,dur:0.45,first:true,dmg:30,col:0xff5a1f,each:e=>ignite(e,p)})}},
"Ash Cloud":{tap:{hit:(p,e)=>pwBlind(e,1)},
  hold:{cd:12,go:p=>pwZone({follow:p,r:6,dur:5,col:0x3a3a40,op:0.35,puff:2,fxRate:0.03,each:e=>pwBlind(e,0.6),self:q=>buff(q,'hide',0.3)})}},
"Dragon Scale":{tap:{swing:p=>{ if(p.pwSwings%8===0) for(let i=0;i<8;i++) pwCone(p,{range:10,dmg:3,fire:true},0.05); }},
  hold:{kind:'chan',cd:9,max:2,tick:(p,dt)=>pwCone(p,{range:16,dmg:8,fire:true},dt)}},
"Fire Opal":{tap:{hit:p=>buff(p,'hide',1)},
  hold:{cd:9,go:p=>{ const f=new T.Sprite(pwMats(0xffffff).soft.clone()); f.position.copy(chest(p).addScaledVector(lookDir(),2)); world.add(f);
    effects.push({t:0,dur:0.4,obj:f,upd:(e,k)=>{ f.scale.setScalar(2+14*k); f.material.opacity=1-k; },done:()=>f.material.dispose()});
    pwConeBurst(p,{range:25,cos:0.7,dmg:5,col:0xffe8c0,each:e=>{ pwBlind(e,2.5); pwDaze(e,2.5); }}); }}},
"Pumice":{tap:{spd:1.3,dmg:0.85},
  hold:{cd:5,go:p=>{ pwDash(p,{speed:50,dur:0.35,col:0xc8c0b0}); for(let i=0;i<10;i++) mote(pwMats(0xc8c0b0).soft,chest(p).add(rv(0.6)),rnd(0.5,0.9),0.6,rv(3)); }}},
"Phoenix Feather":{lives:1,tap:{swing:p=>fan(p,{look:'dart',col:0xff7a1a,n:3,spread:0.1,speed:60,dmg:5,life:1,trail:0xffb02a,hit:e=>ignite(e,player)})},
  hold:{cd:12,go:p=>pwDash(p,{speed:32,dur:1.4,dmg:15,col:0xff7a1a,each:e=>ignite(e,p)})}},
// ---------- Sweet Tooth
"Lollipop Swirl":{tap:{hit:(p,e)=>pwDaze(e,2)},
  hold:{kind:'chan',cd:8,max:3,start:p=>{ p.lolly=pwLook('disc',0xff8fc8,4); world.add(p.lolly); },tick:(p)=>{ buff(p,'guard',0.15,1); p.lolly.position.copy(chest(p).addScaledVector(lookDir(),1.2)); p.lolly.lookAt(chest(p)); p.lolly.rotateZ(matchTime*10); },end:p=>{ world.remove(p.lolly); p.lolly=null; }}},
"Gummy Bear":{tap:{knock:28,hit:(p,e)=>sfx('boing',e.pos.clone(),{small:true})},
  hold:{cd:7,go:p=>fan(p,{look:'orb',col:0xff4d5e,size:1.3,speed:40,life:3,fuse:1.6,stick:true,latch:{dur:1.6,dps:0},end:at=>pwBlast(at,{r:5,dmg:40,col:0xff4d5e})})}},
"Sprinkle Smash":{tap:{hit:(p,e,at)=>{ pwMark(e,4,1.1,0xff8fc8); for(let i=0;i<6;i++) mote(pwMats(pick([0xff4d5e,0x3fa0f5,0xffd23f,0x53d16b])).spark,at.clone(),rnd(0.2,0.35),0.5,rv(5),9); }},
  hold:{cd:9,go:p=>{ const at=aimPoint(p,lookDir(),120); for(let i=0;i<20;i++) later(i*0.07,()=>pwStrike(at.clone().add(new V(rnd(-3.5,3.5),rnd(-1,1),rnd(-3.5,3.5))),{delay:0.4,r:2.6,dmg:8,kb:4,col:pick([0xff4d5e,0x3fa0f5,0xffd23f,0x53d16b]),each:e=>pwMark(e,4,1.1,0xff8fc8)})); }}},
"Bubblegum Pop":{tap:{hit:(p,e)=>pwSlow(e,0.3)},
  hold:{cd:12,go:p=>{ p.absorb=Math.max(p.absorb||0,40); const b=new T.Mesh(pwGeo.sphere,pwMats(0xff8fc8).fog.clone()); world.add(b);
    effects.push({t:0,dur:6,obj:b,upd:(e,k)=>{ b.visible=(p.absorb||0)>0; b.position.copy(chest(p)); b.scale.setScalar(1.6); b.material.opacity=0.32; },done:()=>b.material.dispose()}); sfx('boing'); }}},
"Chocolate Bar":{tap:{heal:5},
  hold:{cd:14,go:p=>{ buff(p,'regen',4,10); sfx('healDone'); }}},
"Sour Blast":{tap:{hit:(p,e)=>pwDaze(e,2)},
  hold:{cd:8,go:p=>pwConeBurst(p,{range:12,cos:0.75,dmg:10,col:0xc8f04a,each:e=>{ pwDaze(e,2); pwJam(e,2); }})}},
"Rock Candy":{tap:{hit:(p,e,at)=>{ for(const o of enemies(p)) if(chest(o).distanceTo(at)<3) hurt(o,6,p,{weapon:POW.name,soft:true}); for(let i=0;i<5;i++) mote(pwMats(0xff9ad8).spark,at.clone(),rnd(0.2,0.4),0.4,rv(5),8); }},
  hold:{cd:10,go:p=>{ const at=aimHit(p,lookDir(),80).p; for(let i=0;i<9;i++){ const m=new T.Mesh(pwGeo.cone,pwMats(pick([0xff9ad8,0xa8e0ff,0xfff2a8])).solid); m.position.copy(at).add(rv(2)); m.lookAt(chest(p)); m.rotateX(Math.PI/2); world.add(m);
      effects.push({t:0,dur:2,obj:m,upd:(e,k)=>{ m.scale.setScalar(k<0.1?k*40:4*(1-Math.max(0,k-0.8)*5)); }}); }
    pwBlast(at,{r:5,dmg:35,col:0xff9ad8,each:e=>pwStun(e,0.5)}); }}},
"Ice Cream Dream":{tap:{hit:(p,e)=>pwSlow(e,0.35)},
  hold:{cd:8,go:p=>fan(p,{look:'orb',col:0xfff0f4,size:1.6,speed:50,life:2,hit:e=>freezeChar(e),end:at=>pwZone({at,r:3,dur:2,col:0xbfeaff,each:o=>pwSlow(o,0.3)})})}},
"Cotton Candy":{tap:{hit:(p,e)=>pwSlow(e,0.3)},
  hold:{cd:11,go:p=>fan(p,{look:'bubble',col:0xffb0e0,size:2,speed:30,life:1.5,boomOnWall:true,end:at=>pwZone({at,r:6,dur:4,col:0xffb0e0,op:0.35,puff:2,each:e=>{ if(!e.ccT||matchTime-e.ccT>4){ e.ccT=matchTime; pwStun(e,2); } }})})}},
"Sugar Rush":{tap:{hit:p=>buff(p,'spd',3,Math.min(1.25,bv(p,'spd',1)+0.05))},
  hold:{cd:12,go:p=>{ buff(p,'spd',5,1.3); buff(p,'swing',5,1.3); sfx('pickup'); }}},
// ---------- Cosmic
"Supernova":{tap:{hit:(p,e,at)=>{ for(const o of enemies(p)) if(o!==e&&chest(o).distanceTo(at)<3) hurt(o,4,p,{weapon:POW.name,soft:true}); for(let i=0;i<6;i++) mote(pwMats(0xfff2a8).spark,at.clone(),rnd(0.2,0.4),0.4,rv(6),9); }},
  hold:{kind:'charge',cd:11,max:1.6,go:(p,k)=>pwBlast(chest(p),{r:7+5*k,dmg:15+25*k,col:0xfff2a8,kb:20})}},
"Meteorite":{tap:{dmg:1.35,spd:0.85},
  hold:{cd:11,go:p=>{ const at=aimPoint(p,lookDir(),150); for(let i=0;i<5;i++) later(i*0.2,()=>pwStrike(at.clone().add(new V(rnd(-6,6),0,rnd(-6,6))),{delay:0.9,r:4,dmg:30,fire:true,fall:'orb',fallSize:3,fallTrail:true,col:0x6a5a4a})); }}},
"Moonbeam":{tap:{swing:p=>fan(p,{look:'crescent',col:0xcfe0ff,speed:55,dmg:12,pierce:true,life:0.6,size:1.2})},
  hold:{kind:'chan',cd:8,max:2,tick:(p,dt)=>pwBeam(p,{col:0xcfe0ff,dps:45,w:0.3},dt)}},
"Black Hole":{tap:{pull:20},
  hold:{cd:12,go:p=>fan(p,{look:'orb',col:0x0a0a14,size:1.6,speed:30,stop:0.6,life:0.9,end:at=>pwZone({at,r:12,dur:3,col:0x5a3a9a,op:0.25,swirl:6,every:0.15,each:e=>{ pwPull(e,at.clone().add(new V(0,1,0)),9); hurt(e,1.5,player,{weapon:POW.name,soft:true}); },end:a=>pwBlast(a,{r:5,dmg:25,col:0x9d86ff})})})}},
"Nebula":{tap:{hit:(p,e,at)=>{ buff(p,'hide',1); for(let i=0;i<5;i++) mote(pwMats(0x9d86ff).soft,at.clone(),rnd(0.4,0.7),0.8,rv(1)); }},
  hold:{cd:14,go:p=>{ buff(p,'hide',4); buff(p,'spd',4,0.7); sfx('zapB'); }}},
"Comet Tail":{tap:{dmg:1.05,swing:p=>{ for(let i=0;i<5;i++) mote(pwMats(0xa8d8ff).spark,chest(p).addScaledVector(lookDir(),1.5),rnd(0.2,0.4),0.5,rv(3),8); }},
  hold:{cd:6,go:p=>pwDash(p,{speed:50,dur:0.3,dmg:25,col:0xa8d8ff})}},
"Saturn Ring":{tap:{swing:p=>fan(p,{look:'disc',col:0xe8c890,speed:45,dmg:12,bounce:1,life:1.2,spin:20})},
  hold:{cd:12,go:p=>pwOrbit(p,{n:2,r:1.8,dur:10,look:'disc',col:0xe8c890,size:1.6,absorb:10,dmg:6,spin:2.5})}},
"Stardust":{tap:{hit:p=>{ if(Math.random()<0.2) pwHeal(p,5); }},
  hold:{cd:15,go:p=>{ const r=Math.random(); if(r<0.34){ p.hp=100; toast('Full heal'); } else if(r<0.67){ pwShield(p,50); toast('Shield'); } else { buff(p,'spd',6,1.5); toast('Speed'); }
    for(let i=0;i<20;i++) mote(pwMats(0xfff2a8).spark,chest(p).add(rv(1.2)),rnd(0.3,0.6),0.8,rv(2),8); sfx('healDone'); }}},
"Rocket Fuel":{tap:{hit:p=>p.vel.addScaledVector(lookDir(),6)},
  hold:{cd:8,go:p=>{ pwDash(p,{speed:55,dur:0.6,dmg:25,col:0xff9a2a,each:e=>pwKnock(e,lookDir(),24)}); for(let i=0;i<10;i++) flame(chest(p),rnd(0.8,1.3),0.4,lookDir().multiplyScalar(-rnd(6,12)).add(rv(2))); sfx('rpg'); }}},
"Event Horizon":{tap:{hit:(p,e)=>pwJam(e,1)},
  hold:{cd:14,go:p=>{ const at=aimHit(p,lookDir(),80).p; pwZone({at,r:8,dur:2.4,col:0x5a3a9a,op:0.3,every:0.2,each:e=>{ if(!(e.frozen>0)&&!(e.frzImm>0)) freezeChar(e); }}); sfx('freeze',at); }}},
// ---------- Wild
"Vine Whip":{tap:{reach:1.7},
  hold:{cd:6,go:p=>pwGrapple(p,{col:0x3d9a3a,speed:44,pullEnemy:true})}},
"Tiger Stripe":{tap:{mod:p=>p.zgPropel||p.sprinting?2:1},
  hold:{cd:7,go:p=>{ const t=crosshairTarget(p,0.96), dir=t?chest(t).sub(chest(p)).normalize():lookDir(); pwDash(p,{dir,speed:45,dur:0.6,first:true,dmg:35,col:0xff9a2a,each:e=>pwKnock(e,dir,20)}); sfx('roar',p.pos.clone()); }}},
"Jaguar":{tap:{hit:(p,e)=>pwReveal(e,3,0xffc21a)},
  hold:{cd:12,go:p=>{ buff(p,'hide',6); p.pwAmbush=true; sfx('zapB'); }}},
"Raptor Claw":{tap:{dmg:1.25,hit:(p,e,at)=>{ cutFx(at.clone().add(new V(0,0.3,0))); cutFx(at.clone().add(new V(0,-0.3,0))); }},
  hold:{cd:10,go:p=>fan(p,{look:'raptor',col:0x53d16b,n:2,spread:0.3,speed:28,home:4,homeR:80,life:5,every:0.8,dmg:20,trail:0x53d16b,size:1.3})}},
"Bamboo Breaker":{tap:{dmg:1.1,knock:10},
  hold:{kind:'chan',cd:8,max:3,tick:p=>{ buff(p,'guard',0.15,2); p.swingT=Math.max(p.swingT,0.1); }}},
"Toucan":{tap:{spd:2,dmg:0.65},
  hold:{kind:'chan',cd:6,max:1.2,tick:(p,dt)=>{ p.flT=(p.flT||0)-dt; if(p.flT<=0){ p.flT=0.07; p.swingSide=1-(p.swingSide||0); p.swingT=SWING_T*0.3; pwMelee(p,6); sfx('swing',null,{gain:0.5}); } }}},
"Venom":{tap:{hit:(p,e)=>pwPoison(e,p,3,5)},
  hold:{cd:9,go:p=>fan(p,{look:'orb',col:0x7be04a,speed:40,life:2,boomOnWall:true,end:at=>pwZone({at,r:6,dur:5,col:0x7be04a,each:e=>pwPoison(e,player,6,1.5)})})}},
"Temple Idol":{tap:{hit:(p,e)=>{ e.curse=p; }},
  hold:{cd:15,go:p=>{ const c=chest(p), dir=lookDir(); let n=0; for(const e of enemies(p)){ _dv.copy(chest(e)).sub(c); const d=_dv.length(); if(d>90||_dv.dot(dir)<0.5*d||!hasLOS(c,chest(e))) continue; pwMark(e,3,2,0xffc21a); n++; }
    for(let i=0;i<16;i++) mote(pwMats(0xffc21a).spark,c.clone().add(rv(1)),rnd(0.3,0.6),0.6,rv(3),8); if(!n){ sfx('deny'); return false; } sfx('roar',p.pos.clone()); }}},
"Parrot Plume":{tap:{hit:(p,e)=>{ const f=p.lastFx||pick(['burn','chill','stun']); if(f==='burn') ignite(e,p); else if(f==='chill') pwSlow(e,0.4); else pwStun(e,0.5); }},
  hold:{cd:10,go:p=>fan(p,{look:'parrot',col:0x2ac44a,speed:30,home:6,homeR:90,life:4,latch:{dur:4,dps:8},size:1.4})}},
"Canopy King":{tap:{wide:true,dmg:1.1,swing:p=>{ for(let i=0;i<5;i++) mote(pwMats(0x53d16b).soft,chest(p).addScaledVector(lookDir(),1.4).add(rv(0.8)),rnd(0.3,0.5),0.6,rv(3)); }},
  hold:{kind:'chan',cd:9,max:3,start:p=>{ p.leaf=pwZone({follow:p,r:6,dur:3,col:0x53d16b,op:0.08,swirl:9,fxRate:0.02,every:0.25,each:e=>{ hurt(e,6,player,{weapon:POW.name,soft:true}); pwKnock(e,chest(e).sub(chest(player)).normalize(),6); }}); },tick:()=>{},end:p=>{ if(p.leaf) p.leaf.t=p.leaf.o.dur; }}},
// ---------- Inverted
"Standard Issue":{tap:{},
  hold:{kind:'charge',cd:3,max:1.2,go:(p,k)=>{ p.swingT=SWING_T; pwMelee(p,PW_BASE*(1+2*k)); if(k>0.9) camShake=Math.max(camShake,0.25); }}},
"Storm Chaser":{tap:{hit:(p,e)=>{ const o=pwNearest(chest(e),p,12,new Set([e])); if(o){ zapArc(chest(e),chest(o),0.2,0.03,pwMats(0xffffff).flat,pwMats(0x9b5cff).flat); hurt(o,10,p,{weapon:POW.name}); } }},
  hold:{cd:12,go:p=>{ pwZone({follow:p,r:18,dur:4,col:0x5a1ab0,op:0.05,every:0.5,each:()=>{} }); let k=0; const bolt=()=>{ if(!p.alive||k++>=8) return; const e=pwNearest(chest(p),p,18); if(e){ zapArc(chest(e).add(new V(rnd(-2,2),12,rnd(-2,2))),chest(e),0.25,0.06,pwMats(0xffffff).flat,pwMats(0x9b5cff).flat); hurt(e,20,p,{weapon:POW.name}); pwStun(e,0.4); sfx('tsr',e.pos.clone()); } later(0.5,bolt); }; bolt(); }}},
"Supply Drop":{tap:{dmg:1.2},
  hold:{cd:30,go:p=>{ const at=aimPoint(p,lookDir(),120); pwStrike(at,{delay:1.2,r:4,dmg:60,col:0x3fa0f5,fall:'crate',fallSize:1,after:()=>{ const n=giveShopItem(); toast(n); sfx('buy'); }}); }}},
"Private Jet":{tap:{swing:p=>{ for(let i=0;i<3;i++) mote(pwMats(0xffffff).spark,chest(p).addScaledVector(lookDir(),1.4),rnd(0.2,0.4),0.4,rv(4),8); }},
  hold:{cd:7,go:p=>{ pwDash(p,{speed:48,dur:0.7,dmg:15,col:0xffd27a}); let k=0; const burn=()=>{ if(k++>12||!p.alive) return; for(let i=0;i<2;i++) jetFlame(chest(p),lookDir().multiplyScalar(-14).add(rv(2)),0.35,0.3); later(0.05,burn); }; burn(); sfx('rpg'); }}},
"Last One Standing":{tap:{mod:()=>1+0.5*(1-aliveCount/combatants.length)},
  hold:{cd:10,go:p=>pwBlast(chest(p),{r:10,dmg:25,kb:35,col:0xffd23f})}},
"Golden Chest":{tap:{swing:p=>{ for(let i=0;i<5;i++) mote(pwMats(0xffd23f).spark,chest(p).addScaledVector(lookDir(),1.4),rnd(0.2,0.4),0.5,rv(5),8); }},
  hold:{cd:8,go:p=>fan(p,{look:'shard',col:0xffd23f,n:8,spread:0.3,vspread:0.08,speed:60,dmg:9,life:1})}},
"Shield Potion":{tap:{hit:p=>{ if(p.pwHits%10===0) pwShield(p,10); }},
  hold:{cd:12,go:p=>{ pwShield(p,25); sfx('healDone'); }}},
"Medkit":{tap:{heal:3},
  hold:{cd:14,go:p=>{ buff(p,'regen',3,10); sfx('healDone'); }}},
"Wall Builder":{tap:{swing:p=>{ for(let i=0;i<3;i++) mote(pwMats(0xc99a5a).soft,chest(p).addScaledVector(lookDir(),1.6),rnd(0.2,0.4),0.5,rv(3)); }},
  hold:{cd:10,go:p=>{ pwWall(p,{w:5,h:3.4,d:0.5,dist:4,dur:6,col:0xc99a5a}); }}},
"Eye of the Storm":{tap:{knock:20},
  hold:{kind:'chan',cd:10,max:3,start:p=>{ p.eye=pwZone({follow:p,r:10,dur:3,col:0xc8a8ff,op:0.07,swirl:12,fxRate:0.02,every:0.2,each:e=>pwKnock(e,chest(e).sub(chest(player)).normalize(),8)}); },tick:p=>buff(p,'guard',0.15,2),end:p=>{ if(p.eye) p.eye.t=p.eye.o.dur; }}},
};

// ================= anime pickaxes: Naruto, Luffy, Saitama =================
// The Anime set replaces the pickaxe with a hero's own way of fighting. A tap does one move; holding the button
// past a quarter of a second starts the hold move, which keeps going until you let go.
//  Shadow Kunai (Naruto): tap slashes everyone just in front; hold throws fans of three kunai that cut through
//    everyone in their path and stick in the walls.
//  Gum-Gum Fists (Luffy): tap is the Pistol, a fist that stretches out up to 16 m and snaps back; hold is the
//    Gatling, a blur of stretching fists from both arms.
//  Serious Fist (Saitama): tap is a Normal Punch whose shockwave blasts everyone in a long cone off their feet;
//    hold is Consecutive Normal Punches, a barrage of smaller shockwaves.
let animeSt=null; // the equipped anime style, or null for an ordinary pickaxe
const ANIME_HOLD=0.26;
const skinMat=new T.MeshPhongMaterial({color:0xf2c49a,shininess:25,specular:0x332211});
const KNM:any={};
function kunaiModel(){ // grip at the origin, blade up +y, about 36 cm long
  if(!KNM.blade) Object.assign(KNM,{blade:new T.ConeGeometry(0.032,0.17,4).translate(0,0.085,0).scale(1,1,0.28),back:new T.ConeGeometry(0.032,0.035,4).rotateX(Math.PI).translate(0,-0.0175,0).scale(1,1,0.28),
    grip:new T.CylinderGeometry(0.011,0.012,0.11,10),guard:new T.CylinderGeometry(0.018,0.018,0.012,10),ring:new T.TorusGeometry(0.022,0.006,8,20),
    steel:new T.MeshPhongMaterial({color:0x4a4f58,shininess:120,specular:0xd8dde6}),wrap:new T.MeshPhongMaterial({color:0xe2d4b0,shininess:8}),dark:GPh(0x2a2d33,40)});
  const g=new T.Group(), add=(geo,m,y)=>{ const o=new T.Mesh(geo,m); o.position.y=y; o.castShadow=true; g.add(o); return o; };
  add(KNM.blade,KNM.steel,0.082); add(KNM.back,KNM.steel,0.082); add(KNM.guard,KNM.dark,0.074); add(KNM.grip,KNM.wrap,0.012);
  for(let i=0;i<5;i++){ const b=add(KNM.guard,KNM.dark,-0.03+i*0.02); b.scale.set(0.72,0.25,0.72); }
  add(KNM.ring,KNM.dark,-0.066); return g;
}
const FSM:any={};
function fistModel(mat){ // a closed fist, knuckles toward +z, about 12 cm across
  if(!FSM.palm) Object.assign(FSM,{palm:new T.SphereGeometry(0.06,16,12),knuck:new T.SphereGeometry(0.026,12,8),thumb:new T.CylinderGeometry(0.022,0.024,0.07,10)});
  const g=new T.Group(), p=new T.Mesh(FSM.palm,mat); p.scale.set(1.05,0.9,1); g.add(p);
  for(let i=0;i<4;i++){ const k=new T.Mesh(FSM.knuck,mat); k.position.set(-0.042+i*0.028,0.022,0.045); k.scale.set(1,1.15,1.1); g.add(k); }
  const th=new T.Mesh(FSM.thumb,mat); th.position.set(-0.05,-0.02,0.02); th.rotation.set(0.4,0,1.2); g.add(th); g.traverse((o:any)=>{ if(o.isMesh) o.castShadow=true; }); return g;
}
const KTM:any={};
function katanaModel(){ // Tanjiro's black Nichirin blade: grip at the origin, blade up +y with the edge along +x, a metre long
  if(!KTM.steel) Object.assign(KTM,{steel:new T.MeshPhongMaterial({color:0x16181c,shininess:140,specular:0x8a94a8}),edge:new T.MeshPhongMaterial({color:0xd8dee8,shininess:160,specular:0xffffff}),
    iron:GPh(0x26282c,50,0x555555),wrap:GPh(0x15233a,15),dia:GPh(0xe8e2d0,10)});
  const g=new T.Group(), add=(geo,m,x,y,z?)=>{ const o=new T.Mesh(geo,m); o.position.set(x,y,z||0); o.castShadow=true; g.add(o); return o; };
  const bs=new T.Shape(); bs.moveTo(-0.014,0); bs.lineTo(0.014,0); bs.lineTo(0.014,0.66); bs.quadraticCurveTo(0.012,0.73,-0.006,0.76); bs.lineTo(-0.014,0.68); bs.lineTo(-0.014,0);
  add(new T.ExtrudeGeometry(bs,{depth:0.006,bevelEnabled:true,bevelThickness:0.002,bevelSize:0.002,bevelSegments:1}),KTM.steel,0,0.235,-0.003);
  const es=new T.Shape(); es.moveTo(0.009,0); es.lineTo(0.016,0); es.lineTo(0.016,0.66); es.quadraticCurveTo(0.014,0.73,-0.004,0.765); es.quadraticCurveTo(0.01,0.72,0.009,0.66); es.lineTo(0.009,0);
  add(new T.ExtrudeGeometry(es,{depth:0.0075,bevelEnabled:false}),KTM.edge,0,0.235,-0.0037);
  const ts=add(new T.CylinderGeometry(0.045,0.045,0.012,6),KTM.iron,0,0.225); ts.rotation.y=Math.PI/6; // the hexagonal tsuba
  add(new T.BoxGeometry(0.03,0.02,0.018),KTM.iron,0,0.207);
  add(new T.CylinderGeometry(0.015,0.016,0.24,10),KTM.wrap,0,0.075);
  for(let i=0;i<7;i++){ const d=add(new T.BoxGeometry(0.012,0.012,0.002),KTM.dia,0,-0.025+i*0.032,0.0155); d.rotation.z=Math.PI/4; const d2=add(new T.BoxGeometry(0.012,0.012,0.002),KTM.dia,0,-0.025+i*0.032,-0.0155); d2.rotation.z=Math.PI/4; }
  add(new T.CylinderGeometry(0.017,0.016,0.02,10),KTM.iron,0,-0.05);
  return g;
}
// the locker and held models for the Anime set
function makeAnime3D(it,held){
  const g=new T.Group();
  if(it.anime==='kunai'){ if(held){ g.add(kunaiModel()); return g; }
    for(const r of [-0.5,0.5]){ const k=kunaiModel(); k.rotation.z=r; k.position.y=-0.04; g.add(k); }
    const sw=new T.Sprite(auraMats(0xff8a1f).halo); sw.scale.setScalar(0.55); sw.position.set(0,0.06,-0.08); g.add(sw); g.scale.setScalar(4.6); g.position.y=-0.15; return g; }
  if(it.anime==='nichirin'){ if(held){ g.add(katanaModel()); return g; }
    const k=katanaModel(); k.rotation.z=-0.75; k.position.set(0.18,-0.38,0); g.add(k);
    for(const [r,c,o] of [[0.36,0x1f6fe0,0.85],[0.44,0x6fb8ff,0.6],[0.29,0xe6f4ff,0.8]] as [number,number,number][]){ const w=new T.Mesh(new T.TorusGeometry(r,0.018,6,48,Math.PI*1.3),new T.MeshBasicMaterial({color:c,transparent:true,opacity:o})); w.rotation.set(0.3,0.2,r*7); g.add(w); }
    g.scale.setScalar(2.1); return g; }
  if(it.anime==='deathnote'){ const b=noteModel(); if(held){ g.add(b); return g; }
    b.rotation.set(-0.15,-0.4,0.12); b.position.y=-0.16; g.add(b);
    const ap=new T.Mesh(new T.SphereGeometry(0.06,20,14),GPh(0xc8141c,60,0x553333)); ap.scale.set(1,0.9,1); ap.position.set(0.16,-0.1,0.08); g.add(ap);
    const st=new T.Mesh(new T.CylinderGeometry(0.005,0.006,0.04,6),GPh(0x4a2e18,10)); st.position.set(0.165,-0.035,0.08); st.rotation.z=-0.3; g.add(st);
    const lf=new T.Mesh(new T.SphereGeometry(0.018,10,6),GPh(0x2f8a3a,20)); lf.scale.set(1.6,0.35,0.8); lf.position.set(0.185,-0.03,0.08); g.add(lf);
    g.scale.setScalar(4.4); g.position.y=0.15; return g; }
  if(held) return g; // fists: the hands are the weapon
  if(it.anime==='goku'){ // an orange-sleeved fist with Goku's blue wristband, wreathed in spiky Super Saiyan flames
    const gi=GPh(0xf27a1a,25), band=GPh(0x1f4fb8,40), gold=new T.MeshBasicMaterial({color:0xffc928,transparent:true,opacity:0.9,side:T.DoubleSide});
    const sl=new T.Mesh(new T.CylinderGeometry(0.065,0.075,0.3,16),gi); sl.rotation.x=Math.PI/2; sl.position.z=-0.24; g.add(sl);
    const cf=new T.Mesh(new T.CylinderGeometry(0.066,0.066,0.07,16),band); cf.rotation.x=Math.PI/2; cf.position.z=-0.06; g.add(cf);
    const f=fistModel(skinMat); f.scale.setScalar(1.45); f.position.z=0.05; g.add(f);
    for(let i=0;i<11;i++){ const a=i/11*TAU, sp=new T.Mesh(new T.ConeGeometry(0.05,rnd(0.28,0.42),5),gold); sp.position.set(Math.cos(a)*0.17,Math.sin(a)*0.17,-0.1); sp.rotation.z=a-Math.PI/2; sp.rotateX(-0.5); g.add(sp); }
    const glow=new T.Sprite(auraMats(0xffc21a).halo); glow.scale.setScalar(0.9); glow.position.z=-0.1; g.add(glow);
    g.rotation.set(-0.35,0.9,0); g.scale.setScalar(2.3); return g; }
  if(it.anime==='titan'){ // a huge raw-muscle titan fist with a bolt of lightning striking it, steam rising off
    const mus=GPh(0x8f2f22,20), dark=GPh(0x5a1a12,10), bolt=new T.MeshBasicMaterial({color:0xffd23f});
    const fa=new T.Mesh(new T.CylinderGeometry(0.07,0.09,0.36,16),mus); fa.rotation.x=Math.PI/2; fa.position.z=-0.24; g.add(fa);
    for(let i=0;i<5;i++){ const st=new T.Mesh(new T.BoxGeometry(0.006,0.004,0.3),dark); const a=-0.9+i*0.45; st.position.set(Math.sin(a)*0.08,Math.cos(a)*0.08,-0.24); st.rotation.z=-a; g.add(st); }
    const f=fistModel(mus); f.scale.setScalar(1.6); f.position.z=0.05; g.add(f);
    const pts=[[0.05,0.62],[-0.06,0.42],[0.04,0.4],[-0.07,0.16]]; for(let i=0;i<3;i++){ const a=new V(pts[i][0],pts[i][1],0.04), b=new V(pts[i+1][0],pts[i+1][1],0.04), m=new T.Mesh(beamGeo,bolt); placeSeg(m,a,b,0.018); g.add(m); }
    for(let i=0;i<4;i++){ const st=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:0xcfc6bf,transparent:true,opacity:0.7,depthWrite:false})); st.scale.setScalar(0.18+i*0.04); st.position.set(rnd(-0.1,0.1),0.1+i*0.07,rnd(-0.15,0.05)); g.add(st); }
    g.rotation.set(-0.3,0.8,0); g.scale.setScalar(2.3); g.position.y=-0.2; return g; }
  if(it.anime==='rubber'){
    const red=GPh(0xd4232a,30), hat=GPh(0xf0cf6a,20), band=GPh(0xc81f26,30);
    const curve=new T.CatmullRomCurve3([new V(-0.5,-0.35,0),new V(-0.2,-0.3,0.05),new V(0,0,0),new V(0.22,0.25,-0.05),new V(0.42,0.3,0)]);
    const arm=new T.Mesh(new T.TubeGeometry(curve,40,0.045,12,false),skinMat); g.add(arm);
    const sl=new T.Mesh(new T.CylinderGeometry(0.075,0.085,0.16,16),red); sl.position.set(-0.55,-0.36,0); sl.rotation.z=Math.PI/2; g.add(sl);
    const f=fistModel(skinMat); f.position.set(0.48,0.3,0); f.rotation.y=Math.PI/2; f.scale.setScalar(1.5); g.add(f);
    const h=new T.Group(); h.position.set(-0.22,0.32,0); h.rotation.set(0.25,0,-0.25); g.add(h);
    const brim=new T.Mesh(new T.CylinderGeometry(0.24,0.25,0.015,32),hat), dome=new T.Mesh(new T.SphereGeometry(0.13,24,12,0,TAU,0,Math.PI/2),hat), rib=new T.Mesh(new T.CylinderGeometry(0.132,0.132,0.04,24,1,true),band);
    dome.position.y=0.005; rib.position.y=0.03; h.add(brim); h.add(dome); h.add(rib);
    g.traverse((o:any)=>{ if(o.isMesh) o.castShadow=true; }); g.scale.setScalar(2.1); return g; }
  // Saitama: a red-gloved fist punching out of a yellow sleeve, shockwave rings round it
  const glove=GPh(0xd8262c,50,0x553333), suit=GPh(0xf5cf2e,25);
  const sl=new T.Mesh(new T.CylinderGeometry(0.06,0.07,0.32,16),suit); sl.rotation.x=Math.PI/2; sl.position.z=-0.22; g.add(sl);
  const cuff=new T.Mesh(new T.CylinderGeometry(0.068,0.062,0.08,16),glove); cuff.rotation.x=Math.PI/2; cuff.position.z=-0.04; g.add(cuff);
  const f=fistModel(glove); f.scale.setScalar(1.45); f.position.z=0.06; g.add(f);
  const rm=new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.55,side:T.DoubleSide,depthWrite:false});
  for(let i=0;i<3;i++){ const r=new T.Mesh(new T.TorusGeometry(0.16+i*0.09,0.008-i*0.002,8,48),rm); r.position.z=0.2+i*0.1; g.add(r); }
  g.rotation.set(-0.35,0.9,0); g.scale.setScalar(2.4); return g;
}

// ---- input
function animeTap(p){
  if(p.fireCd>0||lockedUp(p)) return;
  if(animeSt==='kunai'){ p.fireCd=0.34; p.swingSide=p.swingT>0||p.comboT>0?1-(p.swingSide||0):0; p.swingT=SWING_T*0.75; p.comboT=SWING_T+0.3; p.hitT=SWING_T*0.75*PICK_HIT; sfx('slash'); }
  else if(animeSt==='rubber'){ p.fireCd=0.5; punch(p,'Right',{dur:0.5,reach:16,dmg:32,kb:30,name:'Gum-Gum Pistol',stretch:true}); sfx('stretch'); }
  else if(animeSt==='nichirin'){ p.fireCd=0.38; p.swingSide=p.swingT>0||p.comboT>0?1-(p.swingSide||0):0; p.swingT=SWING_T*0.8; p.comboT=SWING_T+0.3; p.hitT=SWING_T*0.8*PICK_HIT; sfx('katana'); }
  else if(animeSt==='deathnote'){ if(!p.writing){ p.fireCd=0.6; startWriting(p); } }
  else if(animeSt==='goku'){ p.fireCd=0.55; punch(p,'Right',{dur:0.3,reach:0,dmg:36,kb:44,name:'Super Saiyan Strike',shock:0.8,gold:true}); kiFlash(p,0.6); sfx('ssjHit'); }
  else if(animeSt==='titan'){ if(p.titan&&p.titanS>2){ p.fireCd=0.45; titanPunch(p,'Right'); } else if(!p.titan&&!(p.titanCd>0)){ p.fireCd=0.6; titanStart(p); } else { p.fireCd=0.35; punch(p,'Right',{dur:0.28,reach:0,dmg:12,kb:8,name:'Punch',shock:0.25}); } }
  else { p.fireCd=0.6; punch(p,'Right',{dur:0.34,reach:0,dmg:45,kb:52,name:'Normal Punch',shock:1}); }
}
function animeHold(p,dt){
  if(lockedUp(p)) return;
  if(animeSt==='goku'){ kiCharge(p,dt); return; }
  if(animeSt==='nichirin'){ p.guard=true; return; }
  if(animeSt==='deathnote'){ if(p.writing) p.writing.hold=true; return; }
  p.aGap=(p.aGap||0)-dt; if(p.aGap>0) return;
  const sd=(p.aSide=(p.aSide||0)^1)?'Right':'Left';
  if(animeSt==='kunai'){ p.aGap=0.3; p.swingSide=1-(p.swingSide||0); p.swingT=SWING_T*0.55; p.comboT=SWING_T; throwKunai(p); }
  else if(animeSt==='rubber'){ p.aGap=0.055; punch(p,sd,{dur:0.24,reach:rnd(8,11),dmg:7,kb:1.5,name:'Gum-Gum Gatling',stretch:true,spread:0.1,soft:true}); sfx('stretch',null,{gain:0.45}); }
  else if(animeSt==='titan'){ if(p.titan&&p.titanS>2){ p.aGap=0.26; titanPunch(p,sd,true); } else if(!p.titan&&!(p.titanCd>0)) titanStart(p); else { p.aGap=0.2; punch(p,sd,{dur:0.2,reach:0,dmg:8,kb:4,name:'Punch',shock:0.2,soft:true}); } }
  else { p.aGap=0.085; punch(p,sd,{dur:0.17,reach:0,dmg:10,kb:3,name:'Consecutive Normal Punches',shock:0.5,spread:0.05,soft:true}); }
}
// ---- Naruto: kunai
const cutMat=new T.MeshBasicMaterial({color:0x2a7dff,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0.8});
const slashMat=new T.MeshBasicMaterial({color:0x7cc4ff,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0.75});
// a quick X of cuts where a blade lands
function cutFx(p){ for(const r of [0.7,-0.7]){ const m=new T.Mesh(beamGeo,cutMat), a=p.clone().add(new V(-0.45,0.45*r,0)), b=p.clone().add(new V(0.45,-0.45*r,0)); placeSeg(m,a,b,0.025); m.lookAt(camera.position); placeSeg(m,a,b,0.025); world.add(m);
  effects.push({t:0,dur:0.22,obj:m,upd:(e,k)=>{ m.scale.x=m.scale.z=0.025*(1-k); }}); } }
// the swish of a kunai cutting the air in front of you: a thin crescent that fades
const slashGeo=new T.TorusGeometry(1.6,0.035,4,32,Math.PI*0.75);
function slashFx(p,side){ camera.getWorldDirection(tv1); const m=new T.Mesh(slashGeo,slashMat.clone()), c=new V(p.pos.x,p.pos.y+1.3,p.pos.z).addScaledVector(tv1,1.2);
  m.position.copy(c); m.lookAt(c.clone().add(tv1)); m.rotateZ(side?2.6:-0.6); world.add(m);
  effects.push({t:0,dur:0.2,obj:m,upd:(e,k)=>{ m.rotateZ((side?-1:1)*0.12); m.material.opacity=0.75*(1-k); m.scale.setScalar(1+k*0.3); },done:()=>m.material.dispose()}); }
function kunaiSlash(p){
  camera.getWorldDirection(tv1); slashFx(p,p.swingSide); const c=new V(p.pos.x,p.pos.y+1.2,p.pos.z); let n=0;
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z).sub(c); const d=_dv.length(); if(d>4.2||_dv.dot(tv1)<0.55*d) continue;
    const at=new V(e.pos.x,e.pos.y+1.1,e.pos.z); if(!hasLOS(c,at)) continue; hurt(e,26,p,{point:at,weapon:'Shadow Kunai',dir:tv1.clone(),melee:true}); cutFx(at); n++; }
  if(!n){ const h=aimHit(p,tv1,camDistNow+4.2); if(h.wall){ sfx('chop',h.p,{mat:'stone'}); for(let i=0;i<5;i++) mote(voltMat,h.p.clone(),rnd(0.15,0.3),0.15,rv(5),10); } }
}
let kunais=[];
function throwKunai(p){
  camera.getWorldDirection(tv1); const hand=p.ch.bones.RightHand.getWorldPosition(new V()), at=aimPoint(p,tv1,140), base=at.sub(hand).normalize();
  const side=new V().crossVectors(base,UP); if(side.lengthSq()<1e-4) side.set(1,0,0); side.normalize();
  for(const i of [-1,0,1]){ const d=base.clone().addScaledVector(side,i*0.07).normalize(), m=kunaiModel(); m.scale.setScalar(2.2); m.position.copy(hand); m.quaternion.setFromUnitVectors(UP,d); world.add(m);
    kunais.push({src:p,m,pos:hand.clone(),dir:d,t:0,hit:new Set(),stuck:false}); }
  sfx('kunai');
}
const KUNAI_V=75;
function updateKunais(dt){
  for(let i=kunais.length-1;i>=0;i--){ const K=kunais[i]; K.t+=dt;
    if(K.stuck){ if(K.t>3){ world.remove(K.m); kunais.splice(i,1); } continue; }
    if(K.t>1.6){ world.remove(K.m); kunais.splice(i,1); continue; }
    let len=KUNAI_V*dt; ray.set(K.pos,K.dir); ray.near=0; ray.far=len; const hs=ray.intersectObjects(meshesAlong(K.pos,K.dir,len,false),false); let wall=false;
    if(hs.length){ len=hs[0].distance; wall=true; } const tb=boxRay(K.pos,K.dir,len); if(tb<len){ len=tb; wall=true; }
    // cut straight through everyone along the way
    for(const e of combatants){ if(!e.alive||e===K.src||K.hit.has(e)) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z); if(segDist(K.pos,K.dir,len,_dv)>0.65) continue;
      K.hit.add(e); const at=_dv.clone(); hurt(e,18,K.src,{point:at,weapon:'Shadow Kunai',dir:K.dir.clone(),melee:true}); cutFx(at); }
    K.pos.addScaledVector(K.dir,len); K.m.position.copy(K.pos);
    if(wall){ K.stuck=true; K.t=0; K.m.position.addScaledVector(K.dir,0.12); sfx('stick',K.pos.clone()); for(let j=0;j<3;j++) mote(voltMat,K.pos.clone(),rnd(0.12,0.25),0.12,rv(4),10); } }
}
// ---- Luffy and Saitama: punches. Each punch runs out and back over its duration; the arm reaches full length
// on the way out, then (Luffy) the fist keeps stretching out ahead of the hand. It lands at the far point.
function punch(p,sd,o){
  camera.getWorldDirection(tv1); const dir=tv1.clone(); if(o.spread){ dir.x+=rnd(-o.spread,o.spread); dir.y+=rnd(-o.spread,o.spread)*0.6; dir.z+=rnd(-o.spread,o.spread); dir.normalize(); }
  let reach=o.reach;
  if(reach>0){ const sh=p.ch.bones[sd+'Arm'].getWorldPosition(new V()); ray.set(sh,dir); ray.near=0.3; ray.far=reach; const hs=ray.intersectObjects(meshesAlong(sh,dir,reach,false),false);
    if(hs.length) reach=Math.max(1,hs[0].distance-0.4); reach=Math.min(reach,Math.max(1,boxRay(sh,dir,reach)-0.4)); }
  const P={sd,t:0,dur:o.dur,dir,reach,o,hit:false,vis:null};
  if(o.stretch){ const g=new T.Group(), tube=new T.Mesh(beamGeo,skinMat), f=fistModel(skinMat); f.scale.setScalar(1.25); g.add(tube); g.add(f); g.userData={tube,f}; world.add(g); P.vis=g; }
  (p.punches=p.punches||[]).push(P);
}
// how far out a punch is: snaps out in the first 40%, eases back after
const punchK=k=>k<0.4?1-Math.pow(1-k/0.4,3):(u=>1-u*u*(3-2*u))((k-0.4)/0.6);
function updatePunches(p,dt){
  const ext={Right:0,Left:0}; if(!p.punches) return;
  for(let i=p.punches.length-1;i>=0;i--){ const P=p.punches[i]; P.t+=dt; const k=Math.min(1,P.t/P.dur), s=punchK(k);
    ext[P.sd]=Math.max(ext[P.sd],P.o.stretch?Math.min(1,s*3):s);
    if(!P.hit&&k>=0.36){ P.hit=true; landPunch(p,P); }
    if(k>=1){ if(P.vis) world.remove(P.vis); p.punches.splice(i,1); } }
  p.punchExt=ext;
}
function landPunch(p,P){
  const o=P.o, sh=p.ch.bones[P.sd+'Arm'].getWorldPosition(new V());
  const knock=(e,at)=>{ hurt(e,o.dmg,p,{point:at,weapon:o.name,dir:P.dir.clone(),melee:true,soft:o.soft}); if(!e.alive||e.bounceT>0) return; e.vel.addScaledVector(P.dir,o.kb); e.knockT=Math.max(e.knockT||0,o.kb/45); };
  if(o.stretch){ // the fist lands on the first person near its path
    let best=null, bd=1e9; const len=P.reach+0.6;
    for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z); if(segDist(sh,P.dir,len,_dv)>1.1) continue; const a=_dv.clone().sub(sh).dot(P.dir); if(a<bd&&hasLOS(sh,_dv)){ bd=a; best=e; } }
    const tip=sh.clone().addScaledVector(P.dir,best?Math.min(bd,P.reach):P.reach);
    if(best){ knock(best,tip); P.reach=Math.min(P.reach,Math.max(0.6,bd-0.5)); punchFx(tip,o.soft?0.5:1); }
    else if(P.reach<o.reach-0.5){ puff(tip,0xe6e8ec); sfx('chop',tip,{mat:'stone'}); }
    return; }
  if(o.titan){ titanLand(p,P,sh,knock); return; }
  // shockwave: everyone in a cone in front, with nothing in the way
  const R=18*o.shock, cosA=o.shock>=1?0.9:0.93;
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z).sub(sh); const d=_dv.length(); if(d>R) continue;
    const c=_dv.dot(P.dir)/(d||1); if(c<(d<2.5?0.5:cosA)) continue; const at=new V(e.pos.x,e.pos.y+1,e.pos.z); if(!hasLOS(sh,at)) continue; knock(e,at); }
  shockFx(sh.clone().addScaledVector(P.dir,0.7),P.dir,o.shock,o.gold);
}
// Luffy's stretching arms: a rubber tube from the hand out to the fist
function drawPunches(p){
  if(!p.punches) return;
  for(const P of p.punches){ if(!P.vis) continue; const k=Math.min(1,P.t/P.dur), s=punchK(k), hand=p.ch.bones[P.sd+'Hand'].getWorldPosition(new V());
    const st=Math.max(0,s*P.reach), tip=hand.clone().addScaledVector(P.dir,0.06+st), u=P.vis.userData;
    u.tube.visible=st>0.15; placeSeg(u.tube,hand,tip,0.042/Math.sqrt(1+st*0.08)); u.f.position.copy(tip); u.f.lookAt(tip.clone().add(P.dir)); }
}
const shockRing=new T.RingGeometry(0.82,1,48), shockCone=new T.ConeGeometry(1,1,32,1,true).rotateX(-Math.PI/2).translate(0,0,0.5);
function shockFx(at,dir,scale,gold?){
  const look=at.clone().add(dir);
  for(const [delay,col,op] of (gold?[[0,0xffd84a,0.9],[0.05,0xf0a018,0.6],[0.11,0xfff1b0,0.7]]:[[0,0xd8ecff,0.85],[0.05,0x8aa6c4,0.5],[0.11,0xffffff,0.6]]) as [number,number,number][]){
    const m=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:col,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false})); m.position.copy(at); m.lookAt(look); world.add(m);
    effects.push({t:0,dur:0.45+delay,obj:m,upd:(e,k,dt)=>{ const u=Math.max(0,e.t-delay)/0.45; m.position.copy(at).addScaledVector(dir,u*9*scale); m.scale.setScalar(0.3+u*4.5*scale); m.material.opacity=e.t<delay?0:op*(1-u); },done:()=>m.material.dispose()}); }
  const cone=new T.Mesh(shockCone,new T.MeshBasicMaterial({color:gold?0xffcf3a:0xbcd6f0,transparent:true,opacity:0.35,side:T.DoubleSide,depthWrite:false})); cone.position.copy(at); cone.lookAt(look); world.add(cone);
  effects.push({t:0,dur:0.32,obj:cone,upd:(e,k)=>{ const L=18*scale*Math.sqrt(k)+0.5; cone.scale.set(L*0.45,L*0.45,L); cone.material.opacity=0.35*(1-k); },done:()=>cone.material.dispose()});
  for(let i=0;i<(scale>=1?14:4);i++){ const d=dir.clone().add(rv(0.35)).normalize(); mote(gold?kiMat:mistMat,at.clone(),rnd(0.5,1)*scale+0.3,rnd(0.35,0.6),d.multiplyScalar(rnd(14,26)*scale)); }
  if(scale>=1){ camShake=Math.max(camShake,0.7); sfx('shock',at.clone()); } else { camShake=Math.max(camShake,0.12); sfx('shockS',at.clone()); }
}
function punchFx(p,s){ for(let i=0;i<(s>=1?8:3);i++) mote(mistMat,p.clone(),rnd(0.4,0.8)*s,rnd(0.2,0.35),rv(5*s)); const r=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:0xffffff,transparent:true,side:T.DoubleSide,depthWrite:false}));
  r.position.copy(p); r.lookAt(camera.position); world.add(r); effects.push({t:0,dur:0.2,obj:r,upd:(e,k)=>{ r.scale.setScalar((0.3+k*1.4)*s); r.material.opacity=1-k; },done:()=>r.material.dispose()}); sfx('punch',p.clone(),{gain:s}); }
// the arms with fists: up in a guard in front of the chin, thrown straight down the crosshair to punch
const _fa=new V();
function fistArms(e,B,rightB,upB,fwdB){
  const aim=e.isPlayer?camera.getWorldDirection(_fa):fwdB, ext=e.punchExt||{Right:0,Left:0}, S=e.titanS||1, ch=e.aCharge>0?Math.min(1,e.aCharge*3):0;
  for(const [sd,sx] of [['Right',1],['Left',-1]] as [string,number][]){
    const sh=B[sd+'Arm'].getWorldPosition(new V()), x=ext[sd];
    let t=sh.clone().addScaledVector(fwdB,0.3*S).addScaledVector(upB,-0.1*S).addScaledVector(rightB,-sx*0.13*S);
    if(ch>0) t.lerp(sh.clone().addScaledVector(upB,-0.5*S).addScaledVector(rightB,sx*0.2*S).addScaledVector(fwdB,0.08*S),ch); // powering up: fists clenched down at the sides
    t.lerp(sh.clone().addScaledVector(aim,0.64*S).addScaledVector(rightB,-sx*0.05*S),x);
    solveIK(B[sd+'Arm'],B[sd+'ForeArm'],B[sd+'Hand'],t,sh.clone().addScaledVector(rightB,sx*0.5*S).addScaledVector(upB,-0.6*S));
    poseHand(B,sd,x>0.5?aim:upB.clone().multiplyScalar(0.8).addScaledVector(fwdB,0.5),x>0.5?upB.clone().negate():rightB.clone().multiplyScalar(-sx),1.35); }
}
// ---- Goku: Super Saiyan. Tap is a golden strike with a ki shockwave; hold to power up (gold aura, crackling ki),
// then let go and the whole charge bursts out of you in every direction, blasting everyone nearby away.
const kiMat=new T.SpriteMaterial({map:glowTex,color:0xffc21a,transparent:true,depthWrite:false,opacity:0.85}); // solid colours: additive light vanishes against the white box
const kiCore=new T.MeshBasicMaterial({color:0xfff6c8,transparent:true,depthWrite:false,fog:false});
const kiGlow=new T.MeshBasicMaterial({color:0xffa800,transparent:true,depthWrite:false,fog:false,opacity:0.5});
const KI_MAX=1.4;
const _kc=new V(), _ku=new V();
// the middle of the body and which way is up along it (so it is right on the ceiling and mid-roll too)
function bodyAxis(p){ const B=p.ch.bones, h=B.Hips.getWorldPosition(_kc), hd=B.Head.getWorldPosition(_ku); hd.sub(h); const L=hd.length()||1; hd.divideScalar(L); h.addScaledVector(hd,L*0.45); return {c:h.clone(),up:hd.clone(),L}; }
function kiAura(p){
  const g=new T.Group(), mk=(col,op)=>new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false,side:T.DoubleSide}));
  const outer=mk(0xffd23a,0.2), inner=mk(0xfff0a0,0.18); g.add(outer); g.add(inner); g.userData={outer,inner}; world.add(g); return g;
}
function kiStop(p){ if(p.kiAura){ world.remove(p.kiAura); disposeObj(p.kiAura); p.kiAura=null; } p.aCharge=0; }
function kiFlash(p,k){ const {c,up}=bodyAxis(p); for(let i=0;i<Math.round(6+10*k);i++){ const d=rv(1).normalize(); mote(kiMat,c.clone().addScaledVector(d,0.4),rnd(0.3,0.6)*(0.6+k),rnd(0.25,0.45),d.multiplyScalar(rnd(3,7)*(0.5+k)).addScaledVector(up,2)); } }
function kiCharge(p,dt){
  const was=p.aCharge||0; p.aCharge=Math.min(KI_MAX,was+dt);
  if(!p.kiAura){ p.kiAura=kiAura(p); sfx('ssjUp'); p.kiSnd=0.55; }
  p.kiSnd-=dt; if(p.kiSnd<=0){ p.kiSnd=0.5; sfx('ssjHum',null,{k:p.aCharge/KI_MAX}); }
  if(was<KI_MAX&&p.aCharge>=KI_MAX){ sfx('ssjFull'); kiFlash(p,1); camShake=Math.max(camShake,0.3); }
}
// the aura and the sparks while charging; called every frame
function updateKi(p,dt){
  if(!p.kiAura) return; if(!p.alive||curItem()||animeSt!=='goku'){ kiStop(p); return; }
  const k=p.aCharge/KI_MAX, {c,up,L}=bodyAxis(p), u=p.kiAura.userData, t=matchTime;
  p.kiAura.position.copy(c); p.kiAura.quaternion.setFromUnitVectors(UP,up);
  const f=1+0.06*Math.sin(t*31)+0.04*Math.sin(t*47), w=(0.55+0.35*k)*f, h=(L*0.95+0.5*k)*f;
  u.outer.scale.set(w,h,w); u.inner.scale.set(w*0.78,h*0.86,w*0.78); u.outer.position.y=0.15*k; u.outer.material.opacity=0.12+0.16*k+0.05*Math.sin(t*23); u.inner.material.opacity=0.1+0.14*k;
  // gold flames licking upward off the body
  if(Math.random()<dt*(25+55*k)){ const a=Math.random()*TAU, r=w*rnd(0.4,0.9), side=new V(Math.cos(a),0,Math.sin(a)).applyQuaternion(p.kiAura.quaternion);
    mote(kiMat,c.clone().addScaledVector(side,r).addScaledVector(up,rnd(-0.6,0.2)*L),rnd(0.18,0.35)*(0.7+k),rnd(0.3,0.5),up.clone().multiplyScalar(rnd(3,6)*(0.6+k))); }
  // crackling ki once it is well charged
  if(k>0.55&&Math.random()<dt*(8+14*k)){ const a=c.clone().add(rv(w*0.8)), b=a.clone().add(rv(0.6)).addScaledVector(up,rnd(0.2,0.6)); zapArc(a,b,0.08,0.012,kiCore,kiGlow); }
}
function kiRelease(p){
  const k=Math.min(1,p.aCharge/KI_MAX); kiStop(p); if(!p.alive||lockedUp(p)) return;
  const {c}=bodyAxis(p), R=7+11*k, dmg=14+46*k, kb=22+48*k;
  for(const e of combatants){ if(!e.alive||e===p) continue; const at=new V(e.pos.x,e.pos.y+1,e.pos.z), d=at.distanceTo(c); if(d>R||!hasLOS(c,at)) continue;
    const dir=at.clone().sub(c).normalize(), fall=1-0.5*d/R;
    hurt(e,dmg*fall,p,{point:at,weapon:'Super Saiyan Burst',dir,melee:true}); if(!e.alive||e.bounceT>0) continue; e.vel.addScaledVector(dir,kb*fall); e.knockT=Math.max(e.knockT||0,kb*fall/45); }
  // a golden dome blasting outward, two rings and a storm of ki
  const dome=new T.Mesh(new T.SphereGeometry(1,32,20),new T.MeshBasicMaterial({color:0xffcf2a,transparent:true,opacity:0.5,depthWrite:false,side:T.DoubleSide})); dome.position.copy(c); world.add(dome);
  effects.push({t:0,dur:0.5,obj:dome,upd:(e,q)=>{ dome.scale.setScalar(0.5+R*Math.sqrt(q)); dome.material.opacity=0.5*(1-q); },done:()=>{ dome.geometry.dispose(); dome.material.dispose(); }});
  for(const [ax,del] of [[new V(1,0,0),0],[new V(0.3,0,1),0.06]] as [any,number][]){ const r=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:0xffa800,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false})); r.position.copy(c); r.lookAt(c.clone().add(ax.clone().cross(UP).add(UP).normalize())); world.add(r);
    effects.push({t:0,dur:0.5+del,obj:r,upd:(e)=>{ const u=Math.max(0,e.t-del)/0.5; r.scale.setScalar(0.5+R*1.1*u); r.material.opacity=e.t<del?0:0.85*(1-u); },done:()=>r.material.dispose()}); }
  for(let i=0;i<Math.round(14+26*k);i++){ const d=rv(1).normalize(); mote(kiMat,c.clone(),rnd(0.4,0.9)*(0.6+k),rnd(0.35,0.6),d.multiplyScalar(rnd(12,26)*(0.5+k))); }
  for(let i=0;i<Math.round(2+5*k);i++){ const d=rv(1).normalize(); zapArc(c.clone().addScaledVector(d,0.5),c.clone().addScaledVector(d,rnd(2,4)*(0.5+k)),0.18,0.02,kiCore,kiGlow); }
  camShake=Math.max(camShake,0.35+0.6*k); sfx('ssjBurst',c.clone(),{k});
}
// ---- Eren: the Attack Titan. Tap (or hold) and lightning strikes: you grow into a 15-metre... well, a 3x titan for a few
// seconds, steaming, punching people clean across the box, then shrink back. A titan punch hits a big area in front.
const TITAN={S:3.2,GROW:0.5,ON:4.5,SHRINK:0.6,CD:7};
const steamMat=new T.SpriteMaterial({map:glowTex,color:0xa49a92,transparent:true,depthWrite:false,opacity:0.55});
const titanBoltCore=new T.MeshBasicMaterial({color:0xfffbe0,transparent:true,depthWrite:false,fog:false});
const titanBoltGlow=new T.MeshBasicMaterial({color:0xffc400,transparent:true,depthWrite:false,fog:false,opacity:0.55});
const TITAN_SKIN=new T.Color(0xb3553f);
function steamPuff(p,n,spread,big?){ const {c,up,L}=bodyAxis(p); for(let i=0;i<n;i++) mote(steamMat,c.clone().add(rv(spread)).addScaledVector(up,rnd(-0.4,0.6)*L),rnd(0.5,1.1)*(big||1),rnd(0.6,1.1),up.clone().multiplyScalar(rnd(1,2.5)).add(rv(1))); }
function titanStart(p){
  if(p.titan||!p.alive) return; p.titan={t:0,punched:false,tinted:false}; p.titanS=1;
  const {c}=bodyAxis(p), top=c.clone().add(new V(rnd(-3,3),24,rnd(-3,3))); clampToBox(top);
  zapArc(top,c,0.4,0.14,titanBoltCore,titanBoltGlow); zapArc(top.clone().add(rv(3)),c,0.3,0.07,titanBoltCore,titanBoltGlow);
  const flash=new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshBasicMaterial({color:0xffe066,transparent:true,opacity:0.7,depthWrite:false})); flash.position.copy(c); world.add(flash);
  effects.push({t:0,dur:0.35,obj:flash,upd:(e,k)=>{ flash.scale.setScalar(1+k*6); flash.material.opacity=0.7*(1-k); },done:()=>{ flash.geometry.dispose(); flash.material.dispose(); }});
  steamPuff(p,16,1.2,1.4); camShake=Math.max(camShake,0.9); sfx('titanBolt',c.clone());
}
// the titan's skin: raw red muscle. The materials are cloned so nobody else wearing the same skin changes.
function titanTint(p,on){
  if(on){ p.titanMats=[]; p.ch.g.traverse((o:any)=>{ if(!o.isMesh||Array.isArray(o.material)||!o.material.color) return; const c=o.material.color, lum=c.r*0.3+c.g*0.59+c.b*0.11; if(lum<0.06) return; // leave the ink outline alone
      p.titanMats.push([o,o.material]); const m=o.material.clone(); m.color.lerp(TITAN_SKIN,0.72); o.material=m; }); }
  else if(p.titanMats){ for(const [o,m] of p.titanMats){ o.material.dispose(); o.material=m; } p.titanMats=null; }
}
function endTitan(p,instant){ if(!p.titan) return; titanTint(p,false); p.titan=null; p.titanS=1; p.titanCd=instant?0:TITAN.CD; if(!instant&&p.alive){ steamPuff(p,22,0.8); sfx('steam',p.pos.clone()); } }
function updateTitan(p,dt){
  if(p.titanCd>0) p.titanCd-=dt; const Tn=p.titan; if(!Tn) return;
  if(!p.alive||animeSt!=='titan'){ endTitan(p,true); return; }
  if(curItem()&&Tn.t<TITAN.GROW+TITAN.ON) Tn.t=TITAN.GROW+TITAN.ON; // swapped to a gun: turn back
  Tn.t+=dt; const t=Tn.t, G=TITAN.GROW, O=TITAN.ON;
  const back=x=>{ const c1=1.7, c3=c1+1; return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2); }; // overshoots a touch, then settles
  p.titanS=t<G?1+(TITAN.S-1)*back(t/G):t<G+O?TITAN.S:1+(TITAN.S-1)*(1-smooth(0,1,(t-G-O)/TITAN.SHRINK));
  if(!Tn.tinted&&t>G*0.3){ Tn.tinted=true; titanTint(p,true); sfx('roar',p.pos.clone()); }
  if(!Tn.punched&&t>=G){ Tn.punched=true; if(!curItem()) titanPunch(p,'Right'); }
  if(Math.random()<dt*(t>G+O?40:9)) steamPuff(p,1,0.6*p.titanS/TITAN.S+0.3,p.titanS/2);
  if(t>=G+O+TITAN.SHRINK) endTitan(p,false);
}
function titanPunch(p,sd,soft?){ punch(p,sd,{dur:soft?0.34:0.46,reach:0,dmg:soft?22:40,kb:soft?40:62,name:'Titan Punch',titan:true,soft}); sfx('titanSwing',p.pos.clone()); }
// a titan fist lands: everyone in a big area in front of it goes flying
function titanLand(p,P,sh,knock){
  const S=p.titanS||1, tip=sh.clone().addScaledVector(P.dir,0.64*S), zone=sh.clone().addScaledVector(P.dir,3.6); let n=0;
  for(const e of combatants){ if(!e.alive||e===p) continue; const at=new V(e.pos.x,e.pos.y+1,e.pos.z); _dv.copy(at).sub(sh); const d=_dv.length();
    if(at.distanceTo(zone)>4.6&&!(d<11&&_dv.dot(P.dir)>0.8*d)) continue; if(!hasLOS(sh,at)) continue; knock(e,at); n++; }
  for(let i=0;i<12;i++) mote(steamMat,tip.clone(),rnd(0.6,1.2),rnd(0.35,0.6),P.dir.clone().multiplyScalar(rnd(4,10)).add(rv(5)));
  const r=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:0x8f7f74,transparent:true,side:T.DoubleSide,depthWrite:false})); r.position.copy(tip); r.lookAt(tip.clone().add(P.dir)); world.add(r);
  effects.push({t:0,dur:0.35,obj:r,upd:(e,k)=>{ r.scale.setScalar(0.6+k*6); r.position.copy(tip).addScaledVector(P.dir,k*3); r.material.opacity=0.8*(1-k); },done:()=>r.material.dispose()});
  camShake=Math.max(camShake,P.o.soft?0.3:0.6); sfx(n?'titanHit':'titanWhiff',tip.clone(),{v:P.o.soft?0.7:1});
}
// ---- Tanjiro: the Nichirin sword. Tap for Water Breathing slashes (a crescent of water follows the blade); hold to
// stand on guard, sword up across your body: bullets fired at you from the front ring off the blade, and some fly
// straight back at whoever shot them.
const waterMat=new T.MeshBasicMaterial({color:0x1f6fe0,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0.8});
const foamMat=new T.MeshBasicMaterial({color:0xe6f4ff,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0.9});
const dropMat=new T.SpriteMaterial({map:glowTex,color:0x3b8cff,transparent:true,depthWrite:false,opacity:0.85});
const sparkOMat=new T.SpriteMaterial({map:sparkTex,color:0xffb02e,transparent:true,depthWrite:false});
const waveGeo=new T.TorusGeometry(2.2,0.11,6,40,Math.PI*0.8), foamGeo=new T.TorusGeometry(2.25,0.035,4,40,Math.PI*0.8);
function waterSlash(p,side){
  camera.getWorldDirection(tv1); const c=new V(p.pos.x,p.pos.y+1.3,p.pos.z).addScaledVector(tv1,1.4), g=new T.Group(), w=new T.Mesh(waveGeo,waterMat.clone()), f=new T.Mesh(foamGeo,foamMat.clone());
  g.add(w); g.add(f); g.position.copy(c); g.lookAt(c.clone().add(tv1)); g.rotateZ(side?2.5:-0.7); world.add(g);
  effects.push({t:0,dur:0.28,obj:g,upd:(e,k)=>{ g.rotateZ((side?-1:1)*0.16); g.scale.setScalar(0.8+k*0.45); w.material.opacity=0.8*(1-k*k); f.material.opacity=0.9*(1-k); },done:()=>{ w.material.dispose(); f.material.dispose(); }});
  for(let i=0;i<10;i++){ const a=(side?2.5:-0.7)+rnd(0,2.4)*(side?-1:1), q=c.clone().add(new V(Math.cos(a)*2,Math.sin(a)*2,0).applyQuaternion(g.quaternion)); mote(dropMat,q,rnd(0.12,0.26),rnd(0.3,0.5),rv(2).addScaledVector(tv1,3)); }
}
function nichirinSlash(p){
  camera.getWorldDirection(tv1); waterSlash(p,p.swingSide); const c=new V(p.pos.x,p.pos.y+1.2,p.pos.z); let n=0;
  for(const e of combatants){ if(!e.alive||e===p) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z).sub(c); const d=_dv.length(); if(d>5.2||_dv.dot(tv1)<0.5*d) continue;
    const at=new V(e.pos.x,e.pos.y+1.1,e.pos.z); if(!hasLOS(c,at)) continue; hurt(e,34,p,{point:at,weapon:'Nichirin Sword',dir:tv1.clone(),melee:true,soft:true});
    if(e.alive&&!(e.bounceT>0)){ e.vel.addScaledVector(tv1,9); e.knockT=Math.max(e.knockT||0,0.2); } cutFx(at); for(let i=0;i<6;i++) mote(dropMat,at.clone(),rnd(0.15,0.3),rnd(0.3,0.5),rv(4)); n++; }
  if(n) sfx('bladeHit',c.clone());
  else { const h=aimHit(p,tv1,camDistNow+5.2); if(h.wall){ sfx('clang',h.p,{v:0.5}); for(let i=0;i<6;i++) mote(sparkOMat,h.p.clone(),rnd(0.12,0.25),0.15,rv(6),10); } }
}
function updateGuard(p,dt){ const on=!!p.guard&&animeSt==='nichirin'&&!curItem()&&p.alive&&!lockedUp(p); p.guardK=Math.max(0,Math.min(1,(p.guardK||0)+(on?dt*9:-dt*6))); if(!on) p.guard=false; }
// a shot coming at you from in front, while you're on guard
function blocks(p,dir){ const g=bv(p,'guard'); if(g>=2) return true; if(!(p.guardK>0.6)&&!g) return false; camera.getWorldDirection(tv2); return -dir.dot(tv2)>0.3; }
function swordPoint(p){ const h=p.ch.bones.RightHand.getWorldPosition(new V()); camera.getWorldDirection(tv2); return h.addScaledVector(tv2,0.25).add(new V(0,0.3,0)); }
function deflect(p,shooter,at,dir,dmg){
  for(let i=0;i<9;i++) mote(sparkOMat,at.clone(),rnd(0.12,0.28),rnd(0.12,0.25),rv(7).addScaledVector(dir,-4),10);
  const r=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:0x2a7dff,transparent:true,side:T.DoubleSide,depthWrite:false})); r.position.copy(at); r.lookAt(at.clone().sub(dir)); world.add(r);
  effects.push({t:0,dur:0.18,obj:r,upd:(e,k)=>{ r.scale.setScalar(0.15+k*0.9); r.material.opacity=1-k; },done:()=>r.material.dispose()});
  sfx('clang',at.clone()); p.anim.hit=Math.min(1,(p.anim.hit||0)+0.15); camShake=Math.max(camShake,0.12);
  // half the time it goes straight back where it came from
  if(shooter&&shooter.alive&&Math.random()<0.5){ const tgt=new V(shooter.pos.x,shooter.pos.y+1.2,shooter.pos.z); if(hasLOS(at,tgt)){ tracer(at,tgt); hurt(shooter,dmg*0.7,p,{point:tgt,weapon:POW&&bv(p,'guard')?POW.name:'Nichirin Deflect',dir:tgt.clone().sub(at).normalize()}); return; } }
  const out=dir.clone().multiplyScalar(-1).add(rv(0.8)).normalize(); tracer(at,at.clone().addScaledVector(out,rnd(8,20)));
}
// ---- Light Yagami: the Death Note. Tap: Light flips the notebook open and writes a name (whoever is under your
// crosshair), then a black-and-white death beam shoots out of the page and knocks them flying. Hold to keep
// writing: the longer the name, the bigger the beam, and a full page pierces straight through everyone in its path.
const NOTE_TAP=0.45, NOTE_MAX=1.6;
const DN:any={};
function coverTex(){ if(DN.cover) return DN.cover; const cv=document.createElement('canvas'); cv.width=256; cv.height=340; const x=cv.getContext('2d');
  x.fillStyle='#0c0c0e'; x.fillRect(0,0,256,340); x.fillStyle='#f2f2f2'; x.textAlign='center'; x.font='bold 40px "Times New Roman",serif'; x.fillText('DEATH',128,150); x.fillText('NOTE',128,196);
  x.strokeStyle='#2a2a2e'; x.lineWidth=3; x.strokeRect(10,10,236,320); DN.cover=new T.CanvasTexture(cv); return DN.cover; }
function noteModel(){ // the closed notebook, held by its bottom edge, standing up +y
  const g=new T.Group(), black=new T.MeshPhongMaterial({color:0x111114,shininess:40}), cov=new T.MeshPhongMaterial({map:coverTex(),shininess:40}), pages=new T.MeshPhongMaterial({color:0xefe9dc});
  const b=new T.Mesh(new T.BoxGeometry(0.2,0.27,0.03),[pages,black,black,black,cov,black]); b.position.set(0,0.12,0); b.castShadow=true; g.add(b); return g; }
// the open book while writing, and the page the name goes on
function openBook(p){
  if(p.dnBook) return p.dnBook;
  const g=new T.Group(), cv=document.createElement('canvas'); cv.width=256; cv.height=340; const tex=new T.CanvasTexture(cv);
  const pageL=new T.Mesh(new T.PlaneGeometry(0.2,0.27),new T.MeshBasicMaterial({map:pageTex(),side:T.DoubleSide})), pageR=new T.Mesh(new T.PlaneGeometry(0.2,0.27),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));
  pageL.position.x=-0.102; pageL.rotation.y=0.12; pageR.position.x=0.102; pageR.rotation.y=-0.12; g.add(pageL); g.add(pageR);
  const back=new T.Mesh(new T.BoxGeometry(0.42,0.28,0.01),new T.MeshPhongMaterial({color:0x111114})); back.position.z=-0.012; g.add(back);
  const pen=new T.Group(), body=new T.Mesh(new T.CylinderGeometry(0.006,0.007,0.14,8),new T.MeshPhongMaterial({color:0x1a1a1f,shininess:80})), nib=new T.Mesh(new T.ConeGeometry(0.006,0.02,8),new T.MeshPhongMaterial({color:0xc8ccd4,shininess:120}));
  body.position.y=0.08; nib.rotation.x=Math.PI; nib.position.y=0.005; pen.add(body); pen.add(nib); g.add(pen);
  g.userData={cv,ctx:cv.getContext('2d'),tex,pen,shown:-1}; g.visible=false; g.scale.setScalar(1.3); world.add(g); p.dnBook=g; return g; }
function pageTex(){ if(DN.page) return DN.page; const cv=document.createElement('canvas'); cv.width=256; cv.height=340; const x=cv.getContext('2d'); ruled(x);
  x.fillStyle='#1b1b20'; x.font='italic 22px "Segoe Script","Brush Script MT",cursive'; ['Kurou Otoharada','Lind L. Tailor','Raye Penber','Naomi Misora'].forEach((n,i)=>{ x.globalAlpha=0.75; x.fillText(n,22,58+i*38); });
  DN.page=new T.CanvasTexture(cv); return DN.page; }
function ruled(x){ x.fillStyle='#efe9dc'; x.fillRect(0,0,256,340); x.strokeStyle='rgba(60,70,90,0.25)'; x.lineWidth=1; for(let y=40;y<330;y+=38){ x.beginPath(); x.moveTo(14,y+6); x.lineTo(242,y+6); x.stroke(); } }
function drawName(p,n){
  const u=p.dnBook.userData; if(u.shown===n) return; u.shown=n; const x=u.ctx, w=p.writing; ruled(x);
  x.fillStyle='#111'; x.font='italic 30px "Segoe Script","Brush Script MT",cursive'; x.fillText(w.name.slice(0,n),20,96);
  if(n>=w.name.length&&w.hold){ x.font='italic 15px serif'; x.fillStyle='#3a1010'; x.fillText('heart attack',26,134); }
  u.tex.needsUpdate=true; }
function startWriting(p){
  if(lockedUp(p)) return; const t=crosshairTarget(p,0.9); openBook(p);
  p.writing={t:0,hold:false,tgt:t,name:t?t.name:'???',scr:0}; p.dnBook.visible=true; p.dnBook.userData.shown=-1; sfx('bookOpen');
}
function stopWriting(p){ p.writing=null; if(p.dnBook) p.dnBook.visible=false; }
function updateWriting(p,dt){
  const w=p.writing; if(!w) return; if(!p.alive||curItem()||animeSt!=='deathnote'||lockedUp(p)){ stopWriting(p); return; }
  w.t+=dt; w.scr-=dt; if(w.scr<=0){ w.scr=0.13; sfx('scribble',null); }
  // the name runs onto the page as you write; holding, it fills in over the whole charge
  const k=w.hold?Math.min(1,w.t/NOTE_MAX):Math.min(1,w.t/NOTE_TAP); drawName(p,Math.ceil(k*w.name.length));
  if(w.hold&&Math.random()<dt*10*k) mote(inkMat,p.dnOrigin?p.dnOrigin.clone().add(rv(0.15)):new V(p.pos.x,p.pos.y+1.3,p.pos.z),rnd(0.1,0.22),rnd(0.4,0.7),rv(0.4).add(new V(0,0.6,0)));
  if(!w.hold&&w.t>=NOTE_TAP) deathBeam(p,0);
  else if(w.hold&&(!mouse.l||w.t>=NOTE_MAX+0.6)) deathBeam(p,clamp((w.t-NOTE_TAP)/(NOTE_MAX-NOTE_TAP),0,1));
}
// arms while writing: the left hand holds the open book up in front of the chest, the right hand scribbles with the pen
const _nX=new V(), _nY=new V(), _nZ=new V(), _nm=new T.Matrix4();
function noteArms(e,B,rightB,upB,fwdB){
  const bk=openBook(e), u=bk.userData, ch=B.Spine2.getWorldPosition(new V()), t=matchTime;
  // held up out in front and a little to the right, tipped back toward the over-the-shoulder camera so you can read it
  const c=ch.addScaledVector(fwdB,0.44).addScaledVector(upB,0.06).addScaledVector(rightB,0.14);
  _nZ.copy(upB).multiplyScalar(0.55).addScaledVector(fwdB,-0.75).addScaledVector(rightB,0.3).normalize(); _nX.copy(rightB).addScaledVector(_nZ,-rightB.dot(_nZ)).normalize(); _nY.crossVectors(_nZ,_nX);
  bk.position.copy(c); bk.quaternion.setFromRotationMatrix(_nm.makeBasis(_nX,_nY,_nZ)); bk.updateMatrixWorld(true);
  const w=e.writing, k=w?Math.min(1,w.t/(w.hold?NOTE_MAX:NOTE_TAP)):0;
  u.pen.position.set(0.04+0.12*k+0.008*Math.sin(t*31),0.04+0.012*Math.sin(t*17),0.004); u.pen.rotation.set(-0.5,0.35,-0.25+0.12*Math.sin(t*23));
  e.dnOrigin=bk.localToWorld(new V(0.1,0.16,0.05));
  const lS=B.LeftArm.getWorldPosition(new V()), rS=B.RightArm.getWorldPosition(new V());
  solveIK(B.LeftArm,B.LeftForeArm,B.LeftHand,bk.localToWorld(new V(-0.2,-0.03,-0.03)),lS.clone().addScaledVector(rightB,-0.5).addScaledVector(upB,-0.6));
  u.pen.updateMatrixWorld(true); const grip=u.pen.localToWorld(new V(0,0.06,0));
  solveIK(B.RightArm,B.RightForeArm,B.RightHand,grip,rS.clone().addScaledVector(rightB,0.5).addScaledVector(upB,-0.6));
  poseHand(B,'Left',_nY.clone(),_nZ.clone().negate(),0.4); poseHand(B,'Right',_nZ.clone().negate().addScaledVector(_nY,0.4),rightB.clone().negate(),0.9);
}
const inkMat=new T.SpriteMaterial({map:glowTex,color:0x141418,transparent:true,depthWrite:false,opacity:0.8});
const dbCore=new T.MeshBasicMaterial({color:0x08080a,transparent:true,depthWrite:false,fog:false});
const dbSheath=new T.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false,fog:false,opacity:0.85});
const dbHaze=new T.MeshBasicMaterial({color:0x6a6a70,transparent:true,depthWrite:false,fog:false,opacity:0.3,side:T.DoubleSide});
let bwT=0;
function deathBeam(p,power){
  const from=(p.dnOrigin||new V(p.pos.x,p.pos.y+1.3,p.pos.z)).clone(), named=p.writing&&p.writing.tgt; stopWriting(p);
  camera.getWorldDirection(tv1); const dir=tv1.clone(); let h=aimHit(p,dir,160+camDistNow); h=nearMiss(p,dir,h,from,1.2+power*0.8);
  // if the crosshair has wandered off, the beam still finds whoever's name is on the page
  if(!h.ent&&named&&named.alive){ const at=new V(named.pos.x,named.pos.y+1.1,named.pos.z); if(hasLOS(from,at)&&at.distanceTo(from)<160) h={p:at,ent:named,head:false,wall:false}; }
  const end=h.p.clone(), bd=end.clone().sub(from).normalize(), L=from.distanceTo(end);
  const hits=[]; if(h.ent) hits.push(h.ent);
  if(power>0.5){ for(const e of combatants){ if(!e.alive||e===p||hits.includes(e)) continue; _dv.set(e.pos.x,e.pos.y+1,e.pos.z); if(segDist(from,bd,L+1,_dv)<1+0.6*power&&hasLOS(from,_dv)) hits.push(e); } }
  const dmg=40+50*power, kb=36+40*power;
  for(const e of hits){ const at=new V(e.pos.x,e.pos.y+1.1,e.pos.z); hurt(e,dmg,p,{point:at,weapon:'Death Note',dir:bd.clone()}); if(e.alive&&!(e.bounceT>0)){ e.vel.addScaledVector(bd,kb); e.knockT=Math.max(e.knockT||0,kb/45); } deathBurst(at,0.7+0.6*power); }
  // the beam: a black core in a white sheath in grey haze, with black and white rings racing down it
  const g=new T.Group(), core=new T.Mesh(beamGeo,dbCore.clone()), sh=new T.Mesh(beamGeo,dbSheath.clone()), hz=new T.Mesh(beamGeo,dbHaze.clone()); g.add(hz); g.add(sh); g.add(core); world.add(g);
  const r0=0.07+0.08*power;
  effects.push({t:0,dur:0.45+0.2*power,obj:g,upd:(e,k)=>{ const f=1-k*k; placeSeg(core,from,end,r0*f); placeSeg(sh,from,end,r0*2.6*f*(1+0.15*Math.sin(e.t*60))); placeSeg(hz,from,end,r0*6*f); sh.material.opacity=0.85*f; hz.material.opacity=0.3*f; },done:()=>{ core.material.dispose(); sh.material.dispose(); hz.material.dispose(); }});
  for(let i=0;i<6+Math.round(6*power);i++){ const ring=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:i%2?0xffffff:0x0b0b0e,transparent:true,side:T.DoubleSide,depthWrite:false,opacity:0})); ring.lookAt(bd); world.add(ring); const d0=i*0.035;
    effects.push({t:0,dur:0.4+d0,obj:ring,upd:(e)=>{ const u=Math.max(0,e.t-d0)/0.4; ring.position.copy(from).addScaledVector(bd,L*u); ring.lookAt(ring.position.clone().add(bd)); ring.scale.setScalar(r0*(5+4*u)); ring.material.opacity=e.t<d0?0:0.9*(1-u); },done:()=>ring.material.dispose()}); }
  for(let i=0;i<12;i++){ const q=from.clone().addScaledVector(bd,Math.random()*L); mote(inkMat,q.add(rv(0.3)),rnd(0.2,0.45)*(1+power),rnd(0.4,0.8),rv(1.5)); }
  if(!hits.length&&h.wall) deathBurst(end,0.5);
  bwT=0.22+0.3*power; camShake=Math.max(camShake,0.25+0.4*power); p.fireCd=0.5; sfx('deathBeam',from.clone(),{k:power});
}
function deathBurst(at,s){
  const fl=new T.Mesh(new T.SphereGeometry(1,20,14),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.9,depthWrite:false})); fl.position.copy(at); world.add(fl);
  effects.push({t:0,dur:0.3,obj:fl,upd:(e,k)=>{ fl.scale.setScalar(s*(0.3+k*1.6)); fl.material.opacity=0.9*(1-k); },done:()=>{ fl.geometry.dispose(); fl.material.dispose(); }});
  const r=new T.Mesh(shockRing,new T.MeshBasicMaterial({color:0x0b0b0e,transparent:true,side:T.DoubleSide,depthWrite:false})); r.position.copy(at); r.lookAt(camera.position); world.add(r);
  effects.push({t:0,dur:0.35,obj:r,upd:(e,k)=>{ r.scale.setScalar(s*(0.4+k*3)); r.material.opacity=1-k; },done:()=>r.material.dispose()});
  for(let i=0;i<10;i++) mote(inkMat,at.clone(),rnd(0.25,0.5)*s,rnd(0.4,0.7),rv(5*s)); sfx('deathHit',at.clone());
}
// the world drains to black and white for a moment when the beam fires
function updateBW(dt){ if(bwT>0){ bwT-=dt; renderer.domElement.style.filter=bwT>0?`grayscale(${Math.min(1,bwT*6)}) contrast(${1+Math.min(0.35,bwT*2)})`:''; } }
// ================= vending machines =================
// Six vending machines, three standing on the floor and three hanging from the ceiling. Walk up, press E and
// spend your elims: every elimination you get is one elim to spend.
const SHOP=[{id:'rpg',name:'RPG',price:5,col:'#4fd34f'},{id:'gren',name:'Grenade Launcher',price:10,col:'#a7b85a'},{id:'tsr',name:'Taser',price:10,col:'#ffe14a'},{id:'pb',name:'Paintball Gun',price:10,col:'#ff3fa4'},{id:'frz',name:'Freeze Ray',price:15,col:'#7fe3ff'},
  {id:'flm',name:'Flamethrower',price:15,col:'#ff7a1a'},{id:'mf',name:'Mirror Fractal Guns',price:15,col:'#ffd23f'},{id:'bounce',name:'Bouncer Ball',price:20,col:'#5cc8ff'},{id:'drone',name:'Robot Drone',price:25,col:'#ff5a3c'}];
let shopOpen=false;
function vendFrontSVG(){
  const nr=Math.ceil(SHOP.length/2), rh=260/nr, sc=Math.min(1.6,(rh-20)/24);
  const rows=SHOP.map((it,i)=>{ const col=Math.floor(i/nr), row=i%nr, x=14+col*116, y=82+row*rh;
    return `<g transform="translate(${x+6} ${y+3}) scale(${sc.toFixed(2)})" fill="${it.id==='rpg'||it.id==='tsr'?'#202226':it.id==='drone'?'#e9eef7':it.col}" color="${it.col}">${it.id==='drone'?'<rect x="0" y="0" width="64" height="24" rx="4" fill="#2b3550"/>':''}${ICON_IN[it.id]}</g>`+
      `<text x="${x+108}" y="${y+rh-5}" text-anchor="end" font-family="Arial Black,Arial" font-weight="900" font-size="${rh<60?17:20}" fill="#ffd23f">${it.price}</text>`+
      (row<nr-1&&i+1<SHOP.length?`<rect x="${x+2}" y="${y+rh-1}" width="108" height="2" fill="#c6cfdd"/>`:''); }).join('')+`<rect x="127" y="80" width="2" height="258" fill="#c6cfdd"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 420"><rect width="256" height="420" fill="#121a2c"/>`+
    `<rect x="10" y="10" width="236" height="58" rx="10" fill="#0b1020" stroke="#5cf0ff" stroke-width="4"/>`+
    `<text x="128" y="52" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="36" fill="#5cf0ff" letter-spacing="4">SHOP</text>`+
    `<rect x="10" y="76" width="236" height="266" rx="6" fill="#e9eef7"/>${rows}`+
    `<path d="M14 80h60L34 338H14z" fill="#ffffff" opacity=".35"/>`+
    `<rect x="18" y="356" width="150" height="50" rx="6" fill="#05070d" stroke="#2b3550" stroke-width="2"/>`+
    [0,1,2].map(r=>[0,1].map(cc=>`<circle cx="${196+cc*24}" cy="${362+r*18}" r="7" fill="${r===0&&cc===0?'#ffd23f':'#2b3550'}"/>`).join('')).join('')+`</svg>`;
}
let vendTex=null;
function buildVending(){
  ZG.vend=[]; if(!vendTex) vendTex=svgTexture(vendFrontSVG(),512,840);
  const L=ZG.L, H=ZG.H, W=2.4, Hh=3.8, Dd=1.6;
  const bodyMat=GPh(0x1a2236,60,0x445066), trimMat=new T.LineBasicMaterial({color:0xffd23f}), front=new T.MeshBasicMaterial({map:vendTex});
  const signMat=new T.MeshBasicMaterial({color:0x5cf0ff}), floorGlow=new T.MeshBasicMaterial({map:glowTex,color:0x5cf0ff,transparent:true,opacity:0.5,depthWrite:false});
  for(let i=0;i<6;i++){
    const ceil=i>=3, a=(i%3)/3*TAU+(ceil?Math.PI/3:0)+rnd(-0.3,0.3);
    let spot=null;
    for(let k=0;k<300&&!spot;k++){ const r=rnd(0.3,0.7)*L, x=Math.cos(a)*r+rnd(-8,8), z=Math.sin(a)*r+rnd(-8,8), cy=ceil?H-Hh/2:Hh/2;
      if(!ZG.blocks.some(b=>Math.abs(b.x-x)<b.sx/2+4&&Math.abs(b.z-z)<b.sz/2+4&&Math.abs(b.y-cy)<b.sy/2+Hh/2+3)) spot=[x,cy,z]; }
    if(!spot) continue;
    const [x,cy,z]=spot, yaw=Math.abs(x)>Math.abs(z)?(x>0?-Math.PI/2:Math.PI/2):(z>0?Math.PI:0); // face the middle of the box, square to the walls
    const g=new T.Group(); g.position.set(x,ceil?H:0,z); g.rotation.set(0,yaw,ceil?Math.PI:0,'YXZ');
    const body=new T.Mesh(new T.BoxGeometry(W,Hh,Dd),bodyMat); body.position.y=Hh/2; body.castShadow=true; body.receiveShadow=true; g.add(body);
    const ed=new T.LineSegments(new T.EdgesGeometry(body.geometry),trimMat); body.add(ed);
    const f=new T.Mesh(new T.PlaneGeometry(W-0.24,Hh-0.3),front); f.position.set(0,Hh/2,Dd/2+0.01); g.add(f);
    const sign=new T.Mesh(new T.BoxGeometry(W+0.1,0.12,Dd+0.1),signMat); sign.position.y=Hh+0.06; g.add(sign);
    const glow=new T.Mesh(new T.PlaneGeometry(6,6),floorGlow); glow.rotation.x=-Math.PI/2; glow.position.set(0,0.03,Dd/2+1.6); g.add(glow);
    world.add(g); g.updateMatrixWorld(true);
    const sx=Math.abs(Math.sin(yaw))>0.5?Dd:W, sz=Math.abs(Math.sin(yaw))>0.5?W:Dd;
    zgSolid(body,boxOf(x,cy,z,sx,Hh,sz)); ZG.blocks.push({x,y:cy,z,sx,sy:Hh,sz});
    const fwd=new V(0,0,1).applyQuaternion(g.quaternion), up=new V(0,1,0).applyQuaternion(g.quaternion);
    ZG.vend.push({g,pos:new V(x,cy,z),use:new V(x,ceil?H:0,z).addScaledVector(fwd,Dd/2+1.2).addScaledVector(up,1.6)});
  }
}
function nearMachine(r?){ const p=player; if(!p||!ZG.vend) return null; r=r||4.5; let best=null, bd=r;
  for(const v of ZG.vend){ const d=Math.hypot(p.pos.x-v.use.x,p.pos.y+1-v.use.y,p.pos.z-v.use.z); if(d<bd){ bd=d; best=v; } } return best; }
function renderShop(){
  const p=player; $('shopBank').textContent=String(p.bank);
  $('shopList').innerHTML=SHOP.map((it,i)=>{ const owned=ownsItem(it.id);
    const st=owned?'Owned':it.price+' elims', cls=owned?'owned':p.bank<it.price?'poor':'';
    return `<button class="shopitem ${cls}" data-i="${i}" style="--ic:${it.col}"><span class="k">${i+1}</span><span class="ic">${ICONS[it.id]}</span><span class="nm">${it.name}</span><span class="pr">${st}</span></button>`; }).join('');
}
function ownsItem(id){ const p=player; return id==='bounce'?!!p.bouncer:id==='gren'?p.slots.some(s=>s&&s.kind==='vest'):p.slots.some(s=>s&&s.id===id); }
function openShop(){ shopOpen=true; renderShop(); $('shop').hidden=false; sfx('ui'); }
function closeShop(){ if(!shopOpen) return; shopOpen=false; $('shop').hidden=true; }
function buyItem(i){
  const p=player, it=SHOP[i]; if(!it){ sfx('deny'); return; }
  if(ownsItem(it.id)){ sfx('deny'); return; }
  if(p.bank<it.price){ sfx('deny'); toast('Need '+it.price+' elims'); return; }
  if(it.id==='bounce'){ p.bank-=it.price; p.bouncer={cd:0}; sfx('buy'); renderShop(); hudTick(); return; } // armour: no slot, Q to use
  let slot=-1; for(let k=6;k<NSLOT;k++) if(!p.slots[k]){ slot=k; break; }
  if(slot<0&&p.sel>=6) slot=p.sel; if(slot<0){ sfx('deny'); toast('Hotbar full · select slot 7–9 to swap'); return; }
  const old=p.slots[slot]; if(old&&old.id==='drone'&&p.drone) droneGone(p.drone,drones.indexOf(p.drone));
  p.bank-=it.price; p.slots[slot]=it.id==='mf'?{kind:'gun',id:'mf',r:4,ammo:MF_CLIP}:it.id==='gren'?{kind:'vest',id:'gren',count:GREN_N,regen:0}:{kind:'gun',id:it.id,r:4,ammo:1,cd:0};
  sfx('buy'); selectSlot(slot); renderShop(); refreshHotbar(); hudTick();
}
$('shopList').addEventListener('click',ev=>{ const b=(ev.target as Element).closest('button'); if(b) buyItem(+(b as HTMLElement).dataset.i); });
// ================= match flow =================
function newMatch(){
  if(world) scene.remove(world);
  world=new T.Group(); scene.add(world);
  colliders=new BoxGrid(8); structMeshes=[]; charMeshes=[]; combatants=[]; bots=[]; effects=[];
  matchTime=0; targetsDirty=true; hurtFlash=0;
  buildZeroG(); buildVending(); projs=[]; splats=[]; bolts=[]; fires=[]; drones=[]; kunais=[]; pwShots=[]; pwZones=[]; pwWalls=[]; pwLaters=[]; shopOpen=false; $('shop').hidden=true;
  ZG.state='float'; ZG.t=rnd(20,26); ZG.camRoll=0; ZG.flash=0;
  rollLoadout(); player=makeCombatant('You',true);
  Object.assign(player,{slots:[null,{kind:'gun',id:'ar',r:3,ammo:WEAP.ar.mag},{kind:'gun',id:'pump',r:3,ammo:WEAP.pump.mag},{kind:'gun',id:'smg',r:2,ammo:WEAP.smg.mag},{kind:'cons',id:'big',count:2},{kind:'cons',id:'mini',count:3},{kind:'gun',id:'mf',r:4,ammo:MF_CLIP},null,null],
    sel:1,bank:0,throwA:null,bouncer:{cd:0},bounceT:0,ball:null,ammo:{light:150,medium:240,heavy:12,shells:48},fireCd:0,bloom:0,reloading:null,consuming:null,dmgDealt:0,wantJump:false,shield:50});
  zgSpawn(player,0,ZG.BOTS+1); player.pitch=0; applyPickSkin(player);
  for(let i=0;i<ZG.BOTS;i++){ const b=makeBot(i); bots.push(b); zgSpawn(b,i+1,ZG.BOTS+1); armBot(b); b.react=rnd(0.14,0.3); b.wake=SPAWN_GRACE+rnd(0,6); b.skill=rnd(0.5,0.8); b.lastPos=b.pos.clone(); }
  aliveCount=combatants.length;
  buildFlyers(); buildPads();
  renderMapBase();
}
function startMatch(){
  initAudio();
  if(matchUsed) newMatch(); matchUsed=true;
  $('menu').hidden=true; $('over').hidden=true; $('pause').hidden=true; $('hud').hidden=false; $('feed').innerHTML='';
  state='play'; refreshHotbar(); hudTick();
  try{ renderer.compile(scene,camera); }catch(e){} // build every skin's shaders now, not in the middle of the first fight
  banner('Inverted','',2.5);
  requestLock();
}
function endMatch(win,killer?,cause?){
  if(state==='over') return; closeShop(); state='over';
  const place=win?1:aliveCount+1;
  for(const k in keys) keys[k]=false; mouse.l=mouse.r=false; ads=false;
  $('overPlace').textContent='#'+place;
  $('overTitle').textContent=win?'Victory!':'Eliminated'; $('over').classList.toggle('win',!!win);
  $('overSub').textContent=win?'':(killer?'Eliminated by '+killer.name:cause?'Hit by a '+cause:'Eliminated');
  $('stElims').textContent=player.kills; $('stDmg').textContent=Math.round(player.dmgDealt); $('stTime').textContent=fmtTime(matchTime);
  if(win){ banner('Victory!','#1 of '+combatants.length,4); sfx('victory'); } else sfx('defeat');
  setTimeout(()=>{ if(document.pointerLockElement) document.exitPointerLock(); $('over').hidden=false; $('againBtn').focus(); },win?1800:2800);
}
function pauseGame(){ if(state!=='play') return; closeShop(); state='paused'; for(const k in keys) keys[k]=false; mouse.l=mouse.r=false; $('pause').hidden=false; }
function resumeGame(){ if(state!=='paused') return; $('pause').hidden=true; state='play'; initAudio(); requestLock(); }
function requestLock(){
  wasLocked=false;
  try{ canvas.focus(); window.focus(); }catch(e){}
  try{ const r=canvas.requestPointerLock(); if(r&&r.catch) r.catch(()=>{ fallbackLook=true; }); }
  catch(e){ fallbackLook=true; }
  setTimeout(()=>{ if(state==='play'&&!locked) fallbackLook=true; },900);
}

// ================= input =================
const sensInputs=[$('sens'),$('sens2')];
try{ const s=parseFloat(localStorage.getItem('stormIslandSens')); if(s>0){ sens=s; } }catch(e){}
sensInputs.forEach(inp=>{ inp.value=sens; inp.addEventListener('input',()=>{ sens=parseFloat(inp.value)||1; sensInputs.forEach(o=>{ if(o!==inp) o.value=sens; }); try{ localStorage.setItem('stormIslandSens',String(sens)); }catch(e){} }); });
const volInputs=[$('vol'),$('vol2')];
volInputs.forEach(inp=>{ inp.value=volume; inp.addEventListener('input',()=>{ initAudio(); setVolume(parseFloat(inp.value)); volInputs.forEach(o=>{ if(o!==inp) o.value=volume; }); }); inp.addEventListener('change',()=>sfx('ui')); });
// audio can only start after a click; menu buttons also get a soft click
addEventListener('pointerdown',()=>initAudio());
addEventListener('click',ev=>{ const t=ev.target as Element; if(t.closest&&t.closest('button')) sfx('ui'); });
$('playBtn').addEventListener('click',startMatch);
$('armoryBtn').addEventListener('click',()=>{ openArmory(); setArmMode('guns'); }); $('armBack').addEventListener('click',closeArmory);
$('armPrev').addEventListener('click',()=>armStep(-1)); $('armNext').addEventListener('click',()=>armStep(1));
addEventListener('keydown',ev=>{ if(state!=='armory') return; if(ev.key==='ArrowRight') armStep(1); else if(ev.key==='ArrowLeft') armStep(-1); else if(ev.key==='Escape') closeArmory(); });
$('againBtn').addEventListener('click',startMatch);
$('resumeBtn').addEventListener('click',resumeGame);
// back to the home screen from the pause or results screen
function goHome(){ if(document.pointerLockElement) document.exitPointerLock(); state='menu'; for(const k in keys) keys[k]=false; mouse.l=mouse.r=false; ads=false;
  for(const id of ['pause','over','hud']) $(id).hidden=true; $('menu').hidden=false; $('playBtn').focus(); }
$('quitBtn').addEventListener('click',goHome); $('homeBtn').addEventListener('click',goHome);

canvas.addEventListener('click',()=>{ if(state==='play'&&!locked&&!fallbackLook) requestLock(); });
let wasLocked=false;
document.addEventListener('pointerlockchange',()=>{ locked=document.pointerLockElement===canvas; if(locked){ wasLocked=true; fallbackLook=false; } else if(wasLocked&&state==='play') pauseGame(); });
document.addEventListener('pointerlockerror',()=>{ fallbackLook=true; if(state==='play') toast('Mouse lock unavailable'); });
const KEY_ALIAS={ArrowUp:'KeyW',ArrowLeft:'KeyA',ArrowDown:'KeyS',ArrowRight:'KeyD'};
function keyCode(ev){
  let c=ev.code||'';
  if(KEY_ALIAS[c]) return KEY_ALIAS[c];
  if(!c||c==='Unidentified'){ const k=(ev.key||'').toLowerCase(); if(KEY_ALIAS[ev.key]) return KEY_ALIAS[ev.key]; if(k===' ') return 'Space'; if(k==='shift') return 'ShiftLeft'; if(k==='escape') return 'Escape'; if(/^[a-z]$/.test(k)) return 'Key'+k.toUpperCase(); if(/^[0-9]$/.test(k)) return 'Digit'+k; }
  return c;
}
document.addEventListener('keydown',ev=>{
  const c=keyCode(ev), p=player;
  if(['Space','Tab','KeyW','KeyA','KeyS','KeyD'].includes(c)&&state==='play') ev.preventDefault();
  if(state==='paused'&&(c==='Enter'||c==='Space')){ resumeGame(); return; }
  if(state!=='play') return;
  keys[c]=true; if(ev.repeat) return;

  if(c==='Escape'&&fallbackLook){ pauseGame(); return; }

  if(shopOpen){ if(c.startsWith('Digit')){ const n=+c.slice(5); if(n>=1&&n<=SHOP.length) buyItem(n-1); } else if(c==='KeyE'||c==='Escape') closeShop(); return; }
  if(c==='KeyE'&&p.alive&&nearMachine()) openShop();
  else if(c==='KeyQ') startBounce(p);
  else if(c==='KeyR'&&p.alive) startReload(curItem());
  else if(c.startsWith('Digit')){ const n=+c.slice(5); if(n>=1&&n<=NSLOT&&(n<=6||p.slots[n-1])) selectSlot(n-1); }


  else if(c==='Space') p.wantJump=true;
},true);
document.addEventListener('keyup',ev=>{ keys[keyCode(ev)]=false; },true);
addEventListener('blur',()=>{ for(const k in keys) keys[k]=false; mouse.l=mouse.r=false; });
canvas.addEventListener('mousedown',ev=>{ canvas.focus(); if(state!=='play') return; if(ev.button===0){ mouse.l=true; onPrimaryDown(); } else if(ev.button===2) mouse.r=true; });
addEventListener('mouseup',ev=>{ if(ev.button===0) mouse.l=false; else if(ev.button===2) mouse.r=false; });
canvas.addEventListener('contextmenu',ev=>ev.preventDefault());
addEventListener('mousemove',ev=>{
  if(state!=='play'||!player||(!locked&&!fallbackLook)) return;
  const it=curItem(); const s=0.0022*sens*(ads?(it&&WEAP[it.id].zoom?0.3:0.6):1);
  player.yaw-=(ev.movementX||0)*s*(ZG.camRoll>Math.PI/2?-1:1); player.pitch=clamp(player.pitch-(ev.movementY||0)*s,-1.35,1.25);
});
addEventListener('wheel',ev=>{ if(state!=='play'||!player||shopOpen) return; const d=ev.deltaY>0?1:-1; let n=player.sel;
  for(let k=0;k<NSLOT;k++){ n=(n+d+NSLOT)%NSLOT; if(n<6||player.slots[n]) break; } selectSlot(n); },{passive:true});

// ================= main loop =================
function update(dt){
  if(player&&!player.alive&&player.death&&player.death.t<1.6) dt*=0.4; // slow motion while you go down
  matchTime+=dt;
  updateZG(dt);
  updateFlyers(dt);
  updatePads(dt);
  updatePlayerZG(dt);
  updateActions(dt); pwUpdate(dt);
  updateProjs(dt); updateSplats(dt); updateBolts(dt); updateFires(dt); updateBouncerCd(dt); updateDrones(dt); if(player.flmT>0) player.flmT-=dt;
  for(const e of combatants){ updateStatus(e,dt); pwStatus(e,dt); }
  updatePunches(player,dt); updateKunais(dt); updateTitan(player,dt); updateKi(player,dt); updateGuard(player,dt); updateWriting(player,dt); updateBW(dt);
  for(const b of bots) updateBotZG(b,dt);
  for(const e of combatants) animateGLB(e,dt);
  drawPunches(player);
  updateEffects(dt);
}
let lastT=performance.now(), hudAcc=0, perfStage=0, perfFrames=0, perfTime=0;
// ---- the home screen: your character in front of the box, skin on and pickaxe resting on the shoulder.
// Drawn as its own little scene over the box so it never clips into the blocks; hidden on narrow screens.
const HERO:any={scene:new T.Scene(),cam:new T.PerspectiveCamera(26,1,0.1,60),c:null,key:'',t:0};
{ HERO.scene.add(new T.HemisphereLight(0xd8e2ff,0x3a2a5a,0.85)); const k=new T.DirectionalLight(0xfff4e6,0.95); k.position.set(2,3,5); const r=new T.DirectionalLight(0xff7ae0,0.7); r.position.set(-4,2,-3); const f=new T.DirectionalLight(0x5cf0ff,0.55); f.position.set(4,1,-4);
  HERO.scene.add(k,k.target,r,r.target,f,f.target);
  const ring=new T.Mesh(new T.PlaneGeometry(1.8,1.8),new T.MeshBasicMaterial({map:glowTex,color:0x5cf0ff,transparent:true,opacity:0.55,depthWrite:false,blending:T.AdditiveBlending})); ring.rotation.x=-Math.PI/2; ring.position.y=0.01; HERO.scene.add(ring); HERO.ring=ring;
  HERO.cam.position.set(0,1.0,8.2); HERO.cam.lookAt(0,0.98,0); }
function heroFrame(dt){
  if(!SOLDIER) return false;
  const W=innerWidth, H=innerHeight; if(W<900||H<520) return false;
  const sk=equippedSkin(), eq=equippedPick(), key=(sk?sk.n:'')+'|'+(eq?eq.n:'');
  if(!HERO.c||HERO.key!==key){ if(HERO.c) HERO.scene.remove(HERO.c.g); const c=makeCharacterGLB(); if(sk) applySkin(c,sk); if(eq) dressPick(c,eq); c.pick.visible=!!eq; HERO.c=c; HERO.key=key; HERO.scene.add(c.g); }
  const c=HERO.c, B=c.bones, g=c.g; HERO.t+=dt; const t=HERO.t;
  g.rotation.y=Math.PI-0.45+0.12*Math.sin(t*0.35); // a three-quarter view, turning a touch
  c.mixer.update(dt); swayGear({onGround:true,walkT:0},c,0,dt); g.updateMatrixWorld(true);
  c.model.getWorldQuaternion(_qm); const rightB=new V(1,0,0).applyQuaternion(_qm), fwdB=new V(0,0,-1).applyQuaternion(_qm), upB=new V(0,1,0).applyQuaternion(_qm);
  if(eq&&!eq.anime||eq&&eq.anime==='nichirin'||eq&&eq.anime==='kunai'){
    const P=pickPose({swingT:0,guardK:0,swingSide:0}), sh=B.RightArm.getWorldPosition(new V());
    const tgt=g.localToWorld(g.worldToLocal(sh.clone()).add(P.h)).addScaledVector(upB,0.008*Math.sin(t*1.7));
    solveIK(B.RightArm,B.RightForeArm,B.RightHand,tgt,sh.clone().addScaledVector(rightB,0.5).addScaledVector(upB,-0.55).addScaledVector(fwdB,-0.1));
    c.pick.quaternion.copy(P.q); g.updateMatrixWorld(true);
    const hw=B.RightHand.getWorldPosition(new V()), hd=new V(0,1,0).applyQuaternion(c.pick.getWorldQuaternion(new T.Quaternion()));
    const pn=rightB.clone().negate(); pn.addScaledVector(hd,-pn.dot(hd)).normalize(); const pf=new V().crossVectors(hd.clone().negate(),pn);
    poseHand(B,'Right',pf,pn,0.8); hw.addScaledVector(pf,0.07).addScaledVector(pn,0.03); g.worldToLocal(hw); c.pick.position.copy(hw);
    if(c.pickL) dualLeft(c,B,g,P,rightB,upB,fwdB,1);
  } else c.pick.visible=false; // the fists and the Death Note have nothing to rest on a shoulder
  HERO.ring.material.opacity=0.45+0.12*Math.sin(t*2);
  // sit the character just right of the middle of the screen, between the logo and the play card
  const F=eq&&PX.formOf(eq), long=!!(F&&F.Lk>1); HERO.cam.position.set(0,long?1.2:1.0,long?9.8:8.2); HERO.cam.lookAt(0,long?1.25:0.98,0); // step back for scythes and spears
  HERO.cam.aspect=W/H; HERO.cam.setViewOffset(W,H,-W*0.09,0,W,H); HERO.cam.updateProjectionMatrix();
  return true;
}
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(0.15,Math.max(0,(now-lastT)/1000)); lastT=now;
  if(state==='play'||state==='over'){ const n=Math.ceil(dt/0.034); for(let i=0;i<n;i++) update(dt/n); }
  // slow machine: drop the pixel ratio (measured after the opening seconds, so loading hiccups don't count), then shadow quality, then shadows
  if(state==='play'&&perfStage<3&&matchTime>2.5){ perfFrames++; perfTime+=dt; if(perfTime>4){ const f=perfFrames/perfTime; perfFrames=0; perfTime=0;
    if(f>=45) perfStage=3;
    else if(perfStage===0){ perfStage=1; renderer.setPixelRatio(1); resize(); }
    else if(perfStage===1){ perfStage=2; sun.shadow.mapSize.set(1024,1024); if(sun.shadow.map){ (sun.shadow.map as any).dispose(); sun.shadow.map=null; } }
    else { perfStage=3; if(f<30) sun.castShadow=false; } } }
  updateCamera(dt); updateSun(); updateAudio(dt); if(state!=='armory') cullChars();
  if(state!=='menu'&&state!=='armory'&&player){ hudAcc+=dt; if(hudAcc>0.1){ hudAcc=0; hudTick(); } hudFrame(dt); drawMap(); }
  renderer.render(scene,camera);
  if(state==='menu'&&!$('menu').hidden&&heroFrame(dt)){ renderer.autoClear=false; renderer.clearDepth(); renderer.render(HERO.scene,HERO.cam); renderer.autoClear=true; }
}
$('playBtn').disabled=true; $('playBtn').textContent='Loading…';
loadSoldier(ok=>{
  if(!ok){ $('err').textContent='The character model did not load. Reload the page to try again.'; return; }
  newMatch(); $('playBtn').disabled=false; $('playBtn').textContent='Enter the box'; showPickNote(); });
requestAnimationFrame(loop);
// hooks for automated tests and screenshots
window.__game={keys,camera,sfx:(k,o)=>sfx(k,null,o),get audioOk(){return !!(AC&&bus&&AMB);},setCam:(p,l)=>{ camOverride=p?{pos:new V(...p),look:new V(...l)}:null; },
  pause:()=>pauseGame(),bank:n=>{ initAudio(); return n?takes(n):Object.keys(BANK); },openArmory,setArm:i=>{armIdx=i;buildArmory();},setArmMode,setPick:i=>{pxIdx=i;buildArmory();},setSkin:i=>{skIdx=i;buildArmory();},
  lineup:(ids,yaw)=>{ if(armGroup) scene.remove(armGroup); armGroup=new T.Group(); armGroup.position.set(0,ARM_Y,0); skShown=[]; ids.forEach((id,k)=>{ const c=standChar(SK.ITEMS[id]); c.g.position.x=(k-(ids.length-1)/2)*1.25; c.g.userData.o=0; c.g.userData.yaw=yaw; armGroup.add(c.g); skShown.push(c); }); studioLights(armGroup); armGroup.userData.dist=ids.length*0.75+1.6; scene.add(armGroup); },
  equipPick:n=>{ equippedName=n; applyPickSkin(player); refreshHotbar(); }, get POW(){return POW;}, get pw(){return {shots:pwShots.length,zones:pwZones.length,zd:pwZones.map(z=>{ const e=combatants.find(c=>c!==player&&c.alive); return e?+z.pos.distanceTo(e.pos).toFixed(1):-1; }),pd:+chest(player).distanceTo(camera.position).toFixed(1),walls:pwWalls.map(w=>[w.m.position.toArray().map(Math.round),w.m.scale.x,w.m.visible])};},
  renderer,scene,mouse,shop:()=>openShop(),fire:()=>playerFire(),kill:(e,weapon,info)=>eliminate(e,null,weapon,info),colliderCount:()=>colliders.size,get state(){return state;},get player(){return player;},get bots(){return bots;},get alive(){return aliveCount;},get ZG(){return ZG;},get splats(){return splats.length;},get heartT(){return heartT;},startMatch,update,setState:s=>state=s};
})();
