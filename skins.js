// Inverted outfits: original themed skins for the soldier character. Each skin repaints the soldier's
// armor texture region by region (plates, cloth, undersuit, straps, metal trim, accent stripes and the visor)
// keeping the original shading, scuffs and wear, then adds 3D gear on the skeleton: capes, hats, hair,
// horns, halos, wings, emblems and more. The Heroes & Villains set is Kash's own picks: fan-made tributes for
// this personal project. Every other theme is an original design.
(function(){

const THEMES=[
  {id:'heroes',n:'Heroes & Villains'},{id:'anime',n:'Anime'},{id:'west',n:'Wild West'},{id:'cyber',n:'Cyber Neon'},
  {id:'myth',n:'Myth & Fantasy'},{id:'space',n:'Space'},{id:'ops',n:'Special Ops'},{id:'street',n:'Street & Sports'},
  {id:'spooky',n:'Spooky'}
];

// p plate · c cloth · s undersuit · k straps · m metal · x stripes · v visor · g which parts glow
// pat: pattern painted onto one region · fin: metalness/roughness · acc: 3D gear
const S=(n,t,r,o)=>Object.assign({n,t,r},o);
const ITEMS=[
  // ---------- Superheroes
  S('Default Trooper','heroes',0,{p:'#e9c39c',c:'#556140',s:'#1d1f22',k:'#4a3a28',m:'#7a8b94',x:'#b0221c',v:'#20262c',def:true,acc:[]}),
  // big: [width, height] scale of the whole body · Kash's picks, in Kash's order
  S('Hulk','heroes',4,{p:'#4f9a2e',c:'#5a2d82',s:'#3c7a22',k:'#3a1d5a',m:'#3c7a22',x:'#5a2d82',v:'#2f6a1c',fin:[0.05,0.8],big:[1.38,1.16],
    acc:[['muscles','#4f9a2e'],['hair','#151515','slick']]}),
  S('Captain America','heroes',4,{p:'#1f3f9a',c:'#c4161c',s:'#16285a',k:'#8a5a2a',m:'#e8e8ec',x:'#ffffff',v:'#1f3f9a',fin:[0.2,0.5],pat:['c','stripes','#ffffff'],
    acc:[['emblem','star','#ffffff','#1f3f9a'],['roundShield','#c4161c','#e8e8ec','#1f3f9a'],['helmWings','#ffffff']]}),
  S('Iron Man','heroes',4,{p:'#b3121f',c:'#e0b13a',s:'#3a0a0c',k:'#e0b13a',m:'#f2d27a',x:'#e0b13a',v:'#e0b13a',g:'x',fin:[0.85,0.25],
    acc:[['reactor','#9fefff'],['faceplate','#e0b13a','#cff6ff'],['palms','#9fefff']]}),
  S('The Creepster','heroes',4,{p:'#6a2a9a',c:'#3aa04a',s:'#2a0e3e',k:'#f28a1a',m:'#3aa04a',x:'#f28a1a',v:'#f4f1ea',fin:[0.1,0.6],pat:['p','pinstripe','#4a1a72'],
    noVisor:1,acc:[['jokerMask','#f4f1ea','#c4161c'],['hair','#3aa04a','slick'],['bowtie','#3aa04a']]}),
  S('Harley Quinn','heroes',4,{p:'#ff5aa8',c:'#141414',s:'#0a0a0a',k:'#141414',m:'#d8d8d8',x:'#2a7bff',v:'#141414',fin:[0.15,0.55],pat:['p','diamond','#141414'],
    acc:[['pigtails','#ff5aa8','#2a7bff'],['choker','#141414','#d8d8d8'],['emblem','heart','#ff5aa8','#141414']]}),
  S('Spider-Man','heroes',4,{p:'#c8121e',c:'#1c3fa8',s:'#0e1f54',k:'#1c3fa8',m:'#c8121e',x:'#1a1a1a',v:'#c8121e',fin:[0.05,0.55],pat:['p','web','#1a1a1a'],
    acc:[['spiderEyes','#f4f6f8','#1a1a1a'],['emblem','spider','#1a1a1a','#c8121e']]}),
  S('Batman','heroes',4,{p:'#4a4e56',c:'#18191c',s:'#0c0c0e',k:'#e0b13a',m:'#18191c',x:'#e0b13a',v:'#18191c',fin:[0.15,0.6],
    acc:[['cape','#111214','#1e2024'],['ears','#18191c'],['emblem','bat','#141414','#f2c230'],['belt','#e0b13a']]}),
  S('Robin Hood','heroes',3,{p:'#2f6a2a',c:'#9a1f1a',s:'#1a2a12',k:'#6a4422',m:'#c9a227',x:'#9a1f1a',v:'#1a2a12',fin:[0.05,0.85],
    acc:[['hood','#2f6a2a','#9a1f1a'],['bow','#7a4a22','#e8e0c8'],['belt','#6a4422']]}),
  S('Superman','heroes',4,{p:'#1f4fc8',c:'#c4161c',s:'#123080',k:'#c4161c',m:'#f2c230',x:'#c4161c',v:'#1f4fc8',fin:[0.15,0.45],
    acc:[['cape','#c4161c','#8a0d12'],['emblem','super','#c4161c','#f2c230'],['hair','#101010','slick'],['belt','#f2c230']]}),
  S('Thanos','heroes',4,{p:'#d4a43a',c:'#2a4aa8',s:'#5a3a7a',k:'#2a4aa8',m:'#f2d27a',x:'#7a4aa8',v:'#7a4a9a',fin:[0.75,0.3],big:[1.24,1.12],
    acc:[['crest','#d4a43a'],['gauntlet','#d4a43a'],['muscles','#7a4a9a'],['pauldrons','#d4a43a']]}),
  // ---------- Anime
  S('Kaze Ninja','anime',3,{p:'#ff7a1a',c:'#1c2b4a',s:'#0f1626',k:'#1c2b4a',m:'#c9cfd8',x:'#1c2b4a',v:'#2b3a55',
    acc:[['hair','#ffd21f','spiky'],['headband','#1c2b4a','#c9cfd8'],['katana','#1c2b4a']]}),
  S('Ronin Blade','anime',4,{p:'#a3161a',c:'#141414',s:'#0a0a0a',k:'#d4a13a',m:'#d4a13a',x:'#d4a13a',v:'#141414',fin:[0.3,0.5],
    acc:[['hair','#141414','tail'],['katana','#a3161a'],['pauldrons','#a3161a']]}),
  S('Sakura Spirit','anime',3,{p:'#ffd1e3',c:'#ffffff',s:'#5b2140',k:'#e05c97',m:'#ffe9f2',x:'#ff7eb6',v:'#ff9ccc',g:'v',
    acc:[['hair','#ff8cc0','long'],['emblem','flower','#ff7eb6','#ffffff']]}),
  S('Mecha Pilot 01','anime',4,{p:'#f2f3f5',c:'#2d5bd6',s:'#191c22',k:'#d8262d',m:'#2d5bd6',x:'#d8262d',v:'#5cf0ff',g:'v',fin:[0.4,0.35],
    acc:[['antenna','#d8262d','#5cf0ff'],['pauldrons','#f2f3f5'],['jetpack','#f2f3f5','#5cf0ff']]}),
  S('Golden Fist','anime',4,{p:'#ff8a1a',c:'#1d3a8f',s:'#0e1a40',k:'#1d3a8f',m:'#ffd700',x:'#ffd700',v:'#ffd700',g:'xv',
    acc:[['hair','#ffe14a','wild',1],['emblem','fist','#1d3a8f','#ff8a1a']]}),
  S('Oni Hunter','anime',3,{p:'#3a0d10',c:'#c9b48a',s:'#1a0606',k:'#c9b48a',m:'#e9d9b0',x:'#ff3b2f',v:'#ff3b2f',g:'xv',
    acc:[['horns','#e9d9b0'],['hair','#f0f0f0','wild'],['katana','#3a0d10']]}),
  S('Neko Idol','anime',2,{p:'#c9b8ff',c:'#ffffff',s:'#3a2e66',k:'#ff9ccc',m:'#ffffff',x:'#ff9ccc',v:'#ff9ccc',g:'v',
    acc:[['ears','#c9b8ff','#ff9ccc'],['hair','#c9b8ff','long'],['emblem','heart','#ff9ccc','#ffffff']]}),
  S('Shadow Shinobi','anime',3,{p:'#1a1a22',c:'#4b2a6b',s:'#0a0a0e',k:'#4b2a6b',m:'#77708a',x:'#9b5cff',v:'#9b5cff',g:'xv',
    acc:[['scarf','#7a1f2b'],['katana','#1a1a22'],['headband','#4b2a6b','#9aa1b0']]}),
  S('Thunder Kid','anime',2,{p:'#2f6df0',c:'#f2f2f2',s:'#101a33',k:'#ffd21f',m:'#ffd21f',x:'#ffd21f',v:'#9fdcff',g:'x',
    acc:[['hair','#101010','spiky'],['emblem','bolt','#ffd21f','#2f6df0']]}),
  S('Spirit Fox','anime',3,{p:'#f6f1e6',c:'#d6402b',s:'#2a120c',k:'#d6402b',m:'#ffd27a',x:'#ff7a33',v:'#ff7a33',g:'xv',
    acc:[['ears','#f6f1e6','#d6402b'],['tail','#ff8a3d','#ffffff'],['hair','#f6f1e6','long']]}),
  // ---------- Wild West
  S('Desert Marshal','west',3,{p:'#c49a6c',c:'#7a4a2a',s:'#2a1a10',k:'#5a3a22',m:'#d8b25a',x:'#8a2a1a',v:'#3a2a1a',fin:[0.1,0.85],pat:['c','denim','#5d3a22'],
    acc:[['hat','#8a5a32','#2a1a10'],['badge','#e3c04a'],['holster','#5a3a22'],['scarf','#8a2a1a']]}),
  S('Black Hat Outlaw','west',3,{p:'#403830',c:'#5e5044',s:'#141210',k:'#5a2a1a',m:'#b8a98a',x:'#7a1a14',v:'#141210',fin:[0.1,0.9],
    acc:[['hat','#161412','#7a1a14'],['bandana','#a3221a'],['holster','#3a2a1a']]}),
  S('Gold Rush','west',4,{p:'#e0b13a',c:'#6b4423',s:'#2a1a0c',k:'#3a2614',m:'#fff1b0',x:'#ffffff',v:'#5a4010',fin:[0.75,0.3],
    acc:[['hat','#e0b13a','#3a2614'],['badge','#ffffff'],['holster','#3a2614']]}),
  S('Bounty Hunter','west',2,{p:'#7d6a52',c:'#3f4a36',s:'#1d1d18',k:'#4d3826',m:'#9a9a8a',x:'#b07a3a',v:'#2a2a24',fin:[0.1,0.9],pat:['p','worn','#5d4a36'],
    acc:[['hat','#5a4632','#2a1d12'],['poncho','#8a4a2a','#d9b27a'],['holster','#3a2a1a']]}),
  S('Rodeo Star','west',2,{p:'#f2efe8',c:'#c8212e',s:'#1d2a55',k:'#1d2a55',m:'#c0c6cf',x:'#c8212e',v:'#1d2a55',
    acc:[['hat','#f2efe8','#c8212e'],['badge','#c0c6cf'],['scarf','#1d2a55']]}),
  S('Canyon Ranger','west',1,{p:'#a6763f',c:'#55623a',s:'#262b1a',k:'#3d2b18',m:'#a39b80',x:'#d2a050',v:'#262b1a',fin:[0.1,0.9],
    acc:[['hat','#6d5233','#3d2b18'],['bandana','#3d5a7a']]}),
  // ---------- Cyber Neon
  S('Neon Runner','cyber',3,{p:'#15151f',c:'#ff2bd6',s:'#07070c',k:'#22e6ff',m:'#22e6ff',x:'#22e6ff',v:'#ff2bd6',g:'xvc',fin:[0.4,0.35],
    acc:[['emblem','chip','#22e6ff','#15151f',1],['antenna','#15151f','#ff2bd6']]}),
  S('Glitch','cyber',4,{p:'#0f1a14',c:'#0f1a14',s:'#050805',k:'#1aff6b',m:'#1aff6b',x:'#1aff6b',v:'#1aff6b',g:'xv',pat:['p','digital','#1aff6b'],
    acc:[['emblem','glitch','#1aff6b','#0f1a14',1]]}),
  S('Synthwave','cyber',3,{p:'#2a0f4f',c:'#ff6a3d',s:'#12062a',k:'#ff2bd6',m:'#ffd34f',x:'#ff2bd6',v:'#ffd34f',g:'xv',pat:['p','grid','#ff2bd6'],
    acc:[['emblem','sun','#ffd34f','#ff2bd6'],['jetpack','#2a0f4f','#ff2bd6']]}),
  S('Chrome Ghost','cyber',4,{p:'#e4e8ee',c:'#9aa2ac',s:'#2a2e33',k:'#5a6068',m:'#ffffff',x:'#ffffff',v:'#ffffff',g:'v',fin:[0.6,0.2],
    acc:[['pauldrons','#d9dee5'],['antenna','#8a929c','#ffffff']]}),
  S('Circuit Breaker','cyber',2,{p:'#1b2a3a',c:'#1b2a3a',s:'#0a1018',k:'#ffb21a',m:'#ffb21a',x:'#ffb21a',v:'#ffb21a',g:'xv',pat:['c','circuit','#ffb21a'],
    acc:[['emblem','chip','#ffb21a','#1b2a3a',1]]}),
  S('Laser Lotus','cyber',3,{p:'#ffffff',c:'#00c2a8',s:'#0c2a2a',k:'#00c2a8',m:'#ff5ca8',x:'#ff5ca8',v:'#00ffd5',g:'xv',
    acc:[['hair','#00ffd5','long'],['emblem','flower','#ff5ca8','#ffffff',1]]}),
  // ---------- Myth & Fantasy
  S('Dragon Knight','myth',4,{p:'#5a1414',c:'#2a2a2a',s:'#120606',k:'#c9a227',m:'#c9a227',x:'#ff5a1a',v:'#ff5a1a',g:'xv',fin:[0.55,0.4],pat:['p','scales','#3a0c0c'],
    acc:[['horns','#2a2a2a'],['wings','#5a1414','#2a0808'],['pauldrons','#5a1414']]}),
  S('Holy Paladin','myth',4,{p:'#f2efe6',c:'#2a4fa3',s:'#1a2340',k:'#d4a43a',m:'#d4a43a',x:'#ffe08a',v:'#ffe08a',g:'v',fin:[0.6,0.3],
    acc:[['halo','#ffe08a'],['cape','#2a4fa3','#162a5a'],['emblem','shield','#d4a43a','#f2efe6'],['pauldrons','#d4a43a']]}),
  S('Frost Warden','myth',3,{p:'#bfe6ff',c:'#2a3f6b',s:'#101a2e',k:'#ffffff',m:'#ffffff',x:'#7fe0ff',v:'#7fe0ff',g:'xv',pat:['p','ice','#e8f7ff'],
    acc:[['crown','#bfe6ff',1],['cape','#ffffff','#7fb6e0']]}),
  S('Forest Druid','myth',2,{p:'#5b7a3a',c:'#7a5a33',s:'#1e2a12',k:'#4a3220',m:'#c9b88a',x:'#9cff5a',v:'#9cff5a',g:'v',fin:[0,0.95],pat:['p','leaf','#3d5a24'],
    acc:[['horns','#8a6a42','antler'],['cape','#3d5a24','#2a3a18']]}),
  S('Bone King','myth',4,{p:'#e8e0c8',c:'#2a2a2a',s:'#0c0c0c',k:'#5a5a5a',m:'#c9a227',x:'#4dff9e',v:'#4dff9e',g:'xv',
    acc:[['crown','#c9a227'],['emblem','skull','#0c0c0c','#e8e0c8'],['cape','#141414','#2a6b4a']]}),
  S('Storm Valkyrie','myth',3,{p:'#c0c8d2',c:'#3a5a8a',s:'#16243a',k:'#d4a43a',m:'#ffffff',x:'#9fd8ff',v:'#9fd8ff',g:'xv',fin:[0.7,0.3],
    acc:[['wings','#ffffff','#c0c8d2'],['hair','#ffe08a','long'],['emblem','bolt','#9fd8ff','#3a5a8a']]}),
  // ---------- Space
  S('Astro Explorer','space',2,{p:'#f4f4f2',c:'#ff7a1a',s:'#2a2a2a',k:'#8a8a8a',m:'#c0c6cf',x:'#ff7a1a',v:'#d4a43a',fin:[0.2,0.6],
    acc:[['jetpack','#f4f4f2','#7fd4ff'],['antenna','#c0c6cf','#ff3b2f'],['emblem','planet','#ff7a1a','#f4f4f2']]}),
  S('Nebula Drifter','space',4,{p:'#1a1040',c:'#3a1a6b',s:'#08051a',k:'#7a5aff',m:'#b9a6ff',x:'#ff6be6',v:'#7affff',g:'xv',pat:['p','nebula','#ff6be6'],
    acc:[['emblem','planet','#7affff','#1a1040',1],['halo','#7affff']]}),
  S('Moon Walker','space',1,{p:'#d9d9d9',c:'#7a7a7a',s:'#2a2a2a',k:'#4a4a4a',m:'#ffffff',x:'#3a7fc2',v:'#2a2a2a',fin:[0.1,0.7],pat:['p','craters','#a9a9a9'],
    acc:[['jetpack','#d9d9d9','#ffffff']]}),
  S('Star Admiral','space',3,{p:'#1d2a4f',c:'#e6e6e6',s:'#0c1226',k:'#d4a43a',m:'#d4a43a',x:'#d4a43a',v:'#7fd4ff',g:'v',
    acc:[['cape','#1d2a4f','#d4a43a'],['emblem','star','#d4a43a','#1d2a4f'],['pauldrons','#d4a43a']]}),
  S('Alien Envoy','space',3,{p:'#6bd65a',c:'#2a3a6b',s:'#0c1a10',k:'#2a3a6b',m:'#c9ffc0',x:'#c9ffc0',v:'#101010',g:'x',
    acc:[['antenna','#6bd65a','#c9ffc0'],['antenna2','#6bd65a','#c9ffc0']]}),
  // ---------- Special Ops
  S('Arctic Ops','ops',1,{p:'#e9eef2',c:'#b9c4cc',s:'#3a4048',k:'#7a8590',m:'#9aa4ae',x:'#5a6670',v:'#20262c',pat:['p','camo','#a9b4be'],acc:[]}),
  S('Jungle Recon','ops',1,{p:'#4f6a3a',c:'#3a4a2a',s:'#1a2012',k:'#4a3a22',m:'#6a7060',x:'#2a3420',v:'#1a2012',pat:['p','camo','#2a3a1e'],acc:[['headband','#2a3420','#2a3420']]}),
  S('Dune Ops','ops',1,{p:'#cdb185',c:'#a88a5a',s:'#3a3020',k:'#6a5434',m:'#9a8a6a',x:'#7a5a2a',v:'#3a3020',pat:['p','camo','#a38a60'],acc:[['scarf','#a88a5a']]}),
  S('Urban Ghost','ops',2,{p:'#5a5f66',c:'#3a3e44',s:'#16181b',k:'#26292d',m:'#8a9098',x:'#ff4a3a',v:'#ff4a3a',g:'v',pat:['p','digital','#3e4248'],acc:[['bandana','#26292d']]}),
  S('Midnight Strike','ops',2,{p:'#1a1d22',c:'#22262c',s:'#0a0b0d',k:'#30343a',m:'#4a5058',x:'#3aff5a',v:'#3aff5a',g:'v',fin:[0.3,0.5],acc:[['pauldrons','#1a1d22']]}),
  // ---------- Street & Sports
  S('Hoop Legend','street',2,{p:'#f26b1d',c:'#1a1a1a',s:'#0c0c0c',k:'#ffffff',m:'#ffffff',x:'#ffffff',v:'#1a1a1a',acc:[['headband','#ffffff','#ffffff'],['emblem','ball','#f26b1d','#1a1a1a']]}),
  S('Graffiti King','street',3,{p:'#ffe14a',c:'#2a2a2a',s:'#141414',k:'#ff3b8a',m:'#3ad1ff',x:'#ff3b8a',v:'#3ad1ff',g:'v',pat:['p','splat','#ff3b8a'],acc:[['hair','#3ad1ff','spiky'],['emblem','crown','#ffe14a','#2a2a2a']]}),
  S('Gridiron','street',2,{p:'#7a1a2a',c:'#d4a43a',s:'#2a0a10',k:'#ffffff',m:'#ffffff',x:'#ffffff',v:'#2a0a10',fin:[0.3,0.4],acc:[['pauldrons','#7a1a2a'],['emblem','num','#ffffff','#7a1a2a']]}),
  S('Skate Rat','street',1,{p:'#3a7fc2',c:'#e9e4d3',s:'#1a2a3a',k:'#c8212e',m:'#e9e4d3',x:'#c8212e',v:'#1a2a3a',pat:['c','check','#1a1a1a'],acc:[['hat2','#c8212e']]}),
  S('Track Star','street',1,{p:'#ffffff',c:'#1d6bf2',s:'#0c1f4a',k:'#1d6bf2',m:'#d0d0d0',x:'#1d6bf2',v:'#1d6bf2',acc:[['headband','#1d6bf2','#ffffff']]}),
  // ---------- Spooky
  S('Pumpkin Rider','spooky',3,{p:'#f27a1a',c:'#2a1a0c',s:'#120a04',k:'#3a6b2a',m:'#3a6b2a',x:'#ffb21a',v:'#ffb21a',g:'xv',acc:[['emblem','jack','#ffb21a','#2a1a0c',1],['cape','#2a1a0c','#f27a1a'],['hat','#1a1a1a','#f27a1a','witch']]}),
  S('Grave Walker','spooky',2,{p:'#7a8a6a',c:'#3a3a40',s:'#141418',k:'#4a3a2a',m:'#9aa08a',x:'#9cff5a',v:'#9cff5a',g:'v',pat:['p','worn','#5a6a4a'],acc:[['emblem','skull','#141418','#d8d8c8']]}),
  S('Vampire Count','spooky',4,{p:'#1a1a1f',c:'#8a0f1f',s:'#0a0a0c',k:'#c9a227',m:'#c9a227',x:'#ff2b3a',v:'#ff2b3a',g:'xv',fin:[0.3,0.4],acc:[['cape','#0a0a0c','#8a0f1f'],['emblem','fang','#ff2b3a','#1a1a1f'],['hair','#0a0a0c','slick']]}),
  S('Specter','spooky',3,{p:'#dfe8f0',c:'#9fb2c4',s:'#3a4a5a',k:'#9fb2c4',m:'#ffffff',x:'#9fffff',v:'#9fffff',g:'xvp',acc:[['halo','#9fffff'],['scarf','#dfe8f0']]}),
];
ITEMS.forEach((it,i)=>{ it.i=i; it.theme=THEMES.find(t=>t.id===it.t); });

// ---------------------------------------------------------------- texture repaint
const hex=h=>{ const n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; };
const lumOf=(r,g,b)=>0.3*r+0.59*g+0.11*b;
// region of each texel of the soldier's armor atlas, and its shading relative to that region's average
let atlas=null;
function analyse(img,size){
  const cv=document.createElement('canvas'); cv.width=cv.height=size; const ctx=cv.getContext('2d'); ctx.drawImage(img,0,0,size,size);
  const d=ctx.getImageData(0,0,size,size).data, n=size*size, cls=new Uint8Array(n), lum=new Float32Array(n), sum=new Float64Array(7), cnt=new Float64Array(7);
  for(let i=0;i<n;i++){ const r=d[i*4]/255, g=d[i*4+1]/255, b=d[i*4+2]/255, L=lumOf(r,g,b), mx=Math.max(r,g,b), mn=Math.min(r,g,b), sat=mx>0?(mx-mn)/mx:0; let c;
    if(r-g>0.22&&r-b>0.22&&sat>0.5) c=5;                    // red accent stripes
    else if(L<0.12) c=2;                                     // black undersuit
    else if(b>=r-0.01&&sat<0.32&&L>0.18) c=4;               // blue-grey metal
    else if(g>=r-0.03&&g>b+0.03) c=1;                        // olive cloth
    else if(r>g&&L>0.42) c=0;                                // tan armor plates
    else c=3;                                                // brown straps, scuffs and grime
    cls[i]=c; lum[i]=L; sum[c]+=L; cnt[c]++; }
  const avg=[...sum].map((s,i)=>cnt[i]?s/cnt[i]:0.5);
  for(let i=0;i<n;i++) lum[i]/=avg[cls[i]];
  return {size,cls,lum};
}
// cheap value noise for patterns
const hash=(x,y)=>{ let h=x*374761393+y*668265263; h=(h^(h>>>13))*1274126177; return ((h^(h>>>16))>>>0)/4294967296; };
function vnoise(x,y){ const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
  const a=hash(xi,yi), b=hash(xi+1,yi), c=hash(xi,yi+1), d=hash(xi+1,yi+1); return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v; }
const fbm=(x,y)=>vnoise(x,y)*0.55+vnoise(x*2.1,y*2.1)*0.3+vnoise(x*4.3,y*4.3)*0.15;
function patternAt(kind,u,v){ // 0..1 amount of the pattern colour at atlas coordinate u,v
  switch(kind){
    case 'camo': { const f=fbm(u*9,v*9); return f>0.56?1:f>0.47?0.5:0; }
    case 'digital': { const q=fbm(Math.floor(u*64)/64*10,Math.floor(v*64)/64*10); return q>0.57?1:q>0.49?0.45:0; }
    case 'carbon': { const a=Math.floor(u*160)+Math.floor(v*160); return (a%2)*0.6*(0.6+0.4*Math.sin((u+v)*1000)); }
    case 'stars': return hash(Math.floor(u*90),Math.floor(v*90))>0.985?1:0;
    case 'ice': { const f=fbm(u*14,v*14); return Math.max(0,1-Math.abs(f-0.5)*16)*0.9; }
    case 'scales': { const x=u*60, y=v*60+((Math.floor(u*60)%2)*0.5), dx=x-Math.floor(x)-0.5, dy=y-Math.floor(y)-0.2; return Math.hypot(dx,dy)>0.45?0.8:0; }
    case 'grid': { const x=(u*40)%1, y=(v*40)%1; return (x<0.07||y<0.07)?1:0; }
    case 'circuit': { const x=Math.floor(u*48), y=Math.floor(v*48), h=hash(x,y), fx=(u*48)%1, fy=(v*48)%1;
      return (h<0.35&&Math.abs(fy-0.5)<0.08)||(h>0.7&&Math.abs(fx-0.5)<0.08)||(h>0.93&&Math.hypot(fx-0.5,fy-0.5)<0.2)?1:0; }
    case 'leaf': { const f=fbm(u*22,v*22); return f>0.6?1:0; }
    case 'nebula': { const f=fbm(u*6+3,v*6), s=hash(Math.floor(u*120),Math.floor(v*120))>0.99?1:0; return Math.max(s,Math.max(0,f-0.45)*1.8); }
    case 'craters': { const x=u*30, y=v*30, h=hash(Math.floor(x),Math.floor(y)), d=Math.hypot(x%1-0.5,y%1-0.5); return h>0.6&&d<0.3*h?(d>0.22*h?0.3:0.8):0; }
    case 'worn': { const f=fbm(u*30,v*30); return f>0.62?0.8:0; }
    case 'denim': { return (Math.sin((u+v)*1600)*0.5+0.5)*0.35+fbm(u*80,v*80)*0.25; }
    case 'splat': { const f=fbm(u*12+7,v*12); return f>0.64?1:0; }
    case 'check': { return (Math.floor(u*50)+Math.floor(v*50))%2; }
    case 'stripes': { return Math.floor(v*36)%2; }
    case 'pinstripe': { return (u*90)%1<0.12?1:0; }
    case 'diamond': { const x=u*24, y=v*24, dx=Math.abs(x%1-0.5), dy=Math.abs(y%1-0.5); return ((Math.floor(x)+Math.floor(y))%2)&&dx+dy<0.5?1:0; }
    case 'web': { // spokes and rings around a few centres, like a spider's web
      let best=0; for(const [cx,cy] of [[0.25,0.25],[0.75,0.3],[0.3,0.75],[0.75,0.78]]){ const dx=u-cx, dy=v-cy, r=Math.hypot(dx,dy), a=Math.atan2(dy,dx);
        const spoke=Math.abs(Math.sin(a*6))<0.08*(0.04/Math.max(r,0.04))?1:0, ring=Math.abs((r*38)%1-0.5)>0.44?1:0; best=Math.max(best,r<0.3?Math.max(spoke,ring):0); } return best; }
  }
  return 0;
}
const REG='pcskmx', REGION={p:0,c:1,s:2,k:3,m:4,x:5};
// Paints a skin: returns canvases for the body colour and for what glows.
function paint(img,skin,size){
  if(!atlas||atlas.size!==size) atlas=analyse(img,size);
  const cols=[...REG].map(k=>hex(skin[k])), glow=new Set([...(skin.g||'')].map(k=>REGION[k]).filter(v=>v!=null)),
    pat=skin.pat?{reg:REGION[skin.pat[0]],kind:skin.pat[1],col:hex(skin.pat[2])}:null, n=size*size;
  const cv=document.createElement('canvas'); cv.width=cv.height=size; const ctx=cv.getContext('2d'), id=ctx.createImageData(size,size), o=id.data;
  let gcv=null, gd=null, gid=null; if(glow.size){ gcv=document.createElement('canvas'); gcv.width=gcv.height=size; gid=gcv.getContext('2d').createImageData(size,size); gd=gid.data; }
  for(let i=0;i<n;i++){
    const c=atlas.cls[i], s=atlas.lum[i]; let col=cols[c];
    if(pat&&pat.reg===c){ const a=patternAt(pat.kind,(i%size)/size,Math.floor(i/size)/size); if(a>0){ const pc=pat.col; col=[col[0]+(pc[0]-col[0])*a,col[1]+(pc[1]-col[1])*a,col[2]+(pc[2]-col[2])*a]; } }
    // keep the original shading: darker texels (scuffs, seams) darken the new colour; light ones lift it a little
    const sh=c===2?0.6+0.4*s:Math.min(1.35,s);
    o[i*4]=Math.min(255,col[0]*sh*255); o[i*4+1]=Math.min(255,col[1]*sh*255); o[i*4+2]=Math.min(255,col[2]*sh*255); o[i*4+3]=255;
    if(gd&&glow.has(c)){ gd[i*4]=col[0]*255; gd[i*4+1]=col[1]*255; gd[i*4+2]=col[2]*255; } if(gd) gd[i*4+3]=255;
  }
  ctx.putImageData(id,0,0); if(gcv) gcv.getContext('2d').putImageData(gid,0,0);
  return {map:cv,glow:gcv};
}

// ---------------------------------------------------------------- emblems
function emblemCanvas(kind,fg,bg){
  const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d');
  x.translate(64,64);
  // shield-shaped plate with a bevelled rim
  const plate=()=>{ x.beginPath(); x.moveTo(-50,-46); x.lineTo(50,-46); x.lineTo(50,4); x.quadraticCurveTo(46,40,0,58); x.quadraticCurveTo(-46,40,-50,4); x.closePath(); };
  const own={super:1,bat:1,spider:1}[kind];
  if(!own){ x.fillStyle=bg; plate(); x.fill(); x.lineWidth=7; x.strokeStyle=fg; plate(); x.stroke(); }
  x.fillStyle=fg; x.strokeStyle=fg; x.lineCap='round'; x.lineJoin='round';
  const star=(r,ri,pts)=>{ x.beginPath(); for(let i=0;i<pts*2;i++){ const a=-Math.PI/2+i*Math.PI/pts, rr=i%2?ri:r; x.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+2); } x.closePath(); x.fill(); };
  switch(kind){
    case 'star': star(34,14,5); break;
    case 'super': { // the diamond crest with a big S
      const dia=()=>{ x.beginPath(); x.moveTo(-56,-34); x.lineTo(56,-34); x.lineTo(62,-18); x.lineTo(0,56); x.lineTo(-62,-18); x.closePath(); };
      x.fillStyle=bg; dia(); x.fill(); x.lineWidth=7; x.strokeStyle=fg; dia(); x.stroke();
      x.fillStyle=fg; x.font='900 68px Georgia, serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText('S',0,2); break; }
    case 'bat': { // a yellow oval with a bat in it
      x.fillStyle=bg; x.beginPath(); x.ellipse(0,0,60,38,0,0,7); x.fill(); x.lineWidth=5; x.strokeStyle=fg; x.stroke(); x.fillStyle=fg; x.beginPath();
      [[-54,-6],[-34,-22],[-30,-10],[-14,-14],[-8,-26],[-4,-14],[4,-14],[8,-26],[14,-14],[30,-10],[34,-22],[54,-6],[40,6],[28,2],[18,16],[8,8],[0,26],[-8,8],[-18,16],[-28,2],[-40,6]].forEach(p=>x.lineTo(p[0],p[1])); x.closePath(); x.fill(); break; }
    case 'spider': { // body, head and eight legs
      x.fillStyle=fg; x.beginPath(); x.ellipse(0,10,11,20,0,0,7); x.fill(); x.beginPath(); x.arc(0,-16,8,0,7); x.fill(); x.lineWidth=5; x.strokeStyle=fg;
      for(const sd of [-1,1]) for(let i=0;i<4;i++){ const y0=-6+i*8; x.beginPath(); x.moveTo(sd*6,y0); x.lineTo(sd*(26+i*2),y0-14+i*6); x.lineTo(sd*(34+i*3),y0+(i<2?-22:18)); x.stroke(); } break; }
    case 'bolt': x.beginPath(); [[8,-40],[-22,6],[-2,6],[-10,42],[24,-8],[4,-8],[14,-40]].forEach(p=>x.lineTo(p[0],p[1])); x.closePath(); x.fill(); break;
    case 'flame': x.beginPath(); x.moveTo(0,42); x.bezierCurveTo(-34,30,-26,-6,-6,-38); x.bezierCurveTo(-6,-14,6,-12,10,-24); x.bezierCurveTo(30,4,28,34,0,42); x.fill(); break;
    case 'eye': x.beginPath(); x.moveTo(-38,2); x.quadraticCurveTo(0,-34,38,2); x.quadraticCurveTo(0,38,-38,2); x.fill(); x.fillStyle=bg; x.beginPath(); x.arc(0,2,13,0,7); x.fill(); x.fillStyle=fg; x.beginPath(); x.arc(0,2,6,0,7); x.fill(); break;
    case 'atom': x.lineWidth=5; for(let i=0;i<3;i++){ x.save(); x.rotate(i*Math.PI/3); x.beginPath(); x.ellipse(0,2,36,13,0,0,7); x.stroke(); x.restore(); } x.beginPath(); x.arc(0,2,8,0,7); x.fill(); break;
    case 'sun': x.beginPath(); x.arc(0,2,16,0,7); x.fill(); x.lineWidth=6; for(let i=0;i<8;i++){ const a=i*Math.PI/4; x.beginPath(); x.moveTo(Math.cos(a)*24,Math.sin(a)*24+2); x.lineTo(Math.cos(a)*36,Math.sin(a)*36+2); x.stroke(); } break;
    case 'wing': x.beginPath(); x.moveTo(-36,20); x.quadraticCurveTo(-30,-30,30,-34); x.quadraticCurveTo(8,-22,26,-14); x.quadraticCurveTo(4,-6,18,4); x.quadraticCurveTo(-4,10,6,18); x.quadraticCurveTo(-16,26,-36,20); x.fill(); break;
    case 'snow': x.lineWidth=5; for(let i=0;i<3;i++){ x.save(); x.translate(0,2); x.rotate(i*Math.PI/3); x.beginPath(); x.moveTo(0,-36); x.lineTo(0,36); x.moveTo(-9,-26); x.lineTo(0,-18); x.lineTo(9,-26); x.moveTo(-9,26); x.lineTo(0,18); x.lineTo(9,26); x.stroke(); x.restore(); } break;
    case 'flower': for(let i=0;i<5;i++){ x.save(); x.translate(0,2); x.rotate(i*Math.PI*2/5); x.beginPath(); x.ellipse(0,-18,11,18,0,0,7); x.fill(); x.restore(); } x.fillStyle=bg; x.beginPath(); x.arc(0,2,8,0,7); x.fill(); break;
    case 'fist': x.fillRect(-22,-20,44,34); for(let i=0;i<4;i++){ x.beginPath(); x.arc(-16+i*11,-20,6,0,7); x.fill(); } x.fillRect(-14,14,28,20); x.fillStyle=bg; x.fillRect(-23,-6,46,3); break;
    case 'heart': x.beginPath(); x.moveTo(0,38); x.bezierCurveTo(-48,6,-26,-38,0,-14); x.bezierCurveTo(26,-38,48,6,0,38); x.fill(); break;
    case 'chip': x.fillRect(-20,-18,40,40); x.lineWidth=4; for(let i=-1;i<=1;i++){ [[-20,0,-34,0],[20,0,34,0],[0,-18,0,-32],[0,22,0,36]].forEach(([a,b,c,d])=>{ x.beginPath(); x.moveTo(a+(b===0?0:i*12),b+(b===0?i*12+2:0)); x.lineTo(c+(d===0?0:i*12),d+(d===0?i*12+2:0)); x.stroke(); }); } x.fillStyle=bg; x.fillRect(-10,-8,20,20); break;
    case 'glitch': for(let i=0;i<9;i++){ x.globalAlpha=0.5+0.5*((i*37)%7)/7; x.fillRect(-36+((i*23)%30),-34+i*8,24+((i*41)%30),5); } x.globalAlpha=1; break;
    case 'shield': x.lineWidth=7; x.beginPath(); x.moveTo(0,-34); x.lineTo(0,38); x.moveTo(-28,-6); x.lineTo(28,-6); x.stroke(); break;
    case 'skull': x.beginPath(); x.arc(0,-6,28,Math.PI,0); x.lineTo(28,10); x.lineTo(16,20); x.lineTo(16,34); x.lineTo(-16,34); x.lineTo(-16,20); x.lineTo(-28,10); x.closePath(); x.fill(); x.fillStyle=bg; x.beginPath(); x.arc(-11,0,8,0,7); x.arc(11,0,8,0,7); x.fill(); x.beginPath(); x.moveTo(0,10); x.lineTo(-5,18); x.lineTo(5,18); x.fill(); break;
    case 'planet': x.beginPath(); x.arc(0,2,20,0,7); x.fill(); x.lineWidth=5; x.beginPath(); x.ellipse(0,2,38,10,-0.35,0,7); x.stroke(); break;
    case 'ball': x.beginPath(); x.arc(0,2,32,0,7); x.fill(); x.strokeStyle=bg; x.lineWidth=4; x.beginPath(); x.moveTo(-32,2); x.lineTo(32,2); x.moveTo(0,-30); x.lineTo(0,34); x.stroke(); x.beginPath(); x.arc(-34,2,22,-1,1); x.stroke(); x.beginPath(); x.arc(34,2,22,Math.PI-1,Math.PI+1); x.stroke(); break;
    case 'crown': x.beginPath(); [[-32,24],[-32,-14],[-16,4],[0,-28],[16,4],[32,-14],[32,24]].forEach(p=>x.lineTo(p[0],p[1])); x.closePath(); x.fill(); break;
    case 'num': x.font='bold 64px Arial, sans-serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(String(10+Math.floor(Math.random()*89)),0,6); break;
    case 'jack': x.beginPath(); x.moveTo(-26,-14); x.lineTo(-8,-14); x.lineTo(-17,-28); x.fill(); x.beginPath(); x.moveTo(26,-14); x.lineTo(8,-14); x.lineTo(17,-28); x.fill(); x.beginPath(); x.moveTo(-30,6); x.lineTo(-20,14); x.lineTo(-10,6); x.lineTo(0,14); x.lineTo(10,6); x.lineTo(20,14); x.lineTo(30,6); x.quadraticCurveTo(0,44,-30,6); x.fill(); break;
    case 'fang': x.beginPath(); x.moveTo(-26,-24); x.quadraticCurveTo(-24,14,-14,30); x.quadraticCurveTo(-10,0,-4,-24); x.fill(); x.beginPath(); x.moveTo(26,-24); x.quadraticCurveTo(24,14,14,30); x.quadraticCurveTo(10,0,4,-24); x.fill(); break;
  }
  return cv;
}

// ---------------------------------------------------------------- 3D gear
// Every builder returns [boneName, object] pairs. Objects are in metres in the bone's frame: +Y runs along
// the bone (up for the spine and head), +Z is the character's front.
function gear(T,kind,a,mats){
  const L=(c,o={})=>{ const k=c+JSON.stringify(o); if(!mats[k]) mats[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:0.6,metalness:0.1},o)); return mats[k]; };
  const glowM=c=>L(c,{emissive:c,emissiveIntensity:1.4,roughness:0.4});
  const M=(geo,mat,x=0,y=0,z=0)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; return m; };
  const G=()=>new T.Group(), out=[];
  switch(kind){
    case 'cape': { // hangs from the shoulders, flaring out; sways in the run (see swayCape)
      // narrow at the shoulders, flaring and folding toward the hem; the sides wrap toward the body
      const g=G(), geo=new T.PlaneGeometry(1,1,10,14), p=geo.attributes.position;
      for(let i=0;i<p.count;i++){ const u=p.getX(i), t=0.5-p.getY(i), hw=0.19+t*0.2, x=u*2*hw;
        p.setXYZ(i,x,-t*1.12,(u*2)*(u*2)*0.07*(1-t*0.4)-Math.sin(u*Math.PI*5)*0.022*t-0.01); }
      geo.computeVertexNormals();
      const o=M(geo,L(a[0],{side:T.BackSide,roughness:0.75})), i=M(geo,L(a[1],{side:T.FrontSide,roughness:0.8}));
      const hinge=G(); hinge.add(o,i); hinge.position.set(0,0.17,-0.15); hinge.userData.cape='hang'; g.add(hinge);
      for(const s of [-1,1]) g.add(M(new T.SphereGeometry(0.032,10,8),L('#d4a43a',{metalness:0.8,roughness:0.3}),s*0.17,0.19,0.08));
      out.push(['Spine2',g]); break; }
    case 'emblem': {
      const tex=new T.CanvasTexture(emblemCanvas(a[0],a[1],a[2])); tex.anisotropy=4;
      const mat=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:0.5,roughness:0.35,metalness:0.4,polygonOffset:true,polygonOffsetFactor:-4});
      if(a[3]){ mat.emissive=new T.Color(0xffffff); mat.emissiveMap=tex; mat.emissiveIntensity=0.7; }
      const m=M(new T.PlaneGeometry(0.2,0.2),mat,0,0.07,0.185); m.rotation.x=-0.12; out.push(['Spine2',m]); break; }
    case 'pauldrons': for(const sd of ['Left','Right']){
      const g=G(), sh=M(new T.SphereGeometry(0.12,14,8,0,Math.PI*2,0,Math.PI*0.45),L(a[0],{metalness:0.5,roughness:0.35}));
      sh.scale.set(1,0.85,1.15); sh.rotation.z=-Math.PI/2; g.add(sh); g.position.set(0.04,0.03,0); out.push([sd+'Arm',g]); } break;
    case 'hair': { // spiky, wild, tail, long or slick, sticking out from under the helmet
      const g=G(), mat=a[2]?L(a[0],{emissive:a[0],emissiveIntensity:0.55,roughness:0.45}):L(a[0],{roughness:0.5}), st=a[1], spike=(len,r,x,y,z,rx,rz)=>{ const m=M(new T.ConeGeometry(r,len,6),mat,x,y,z); m.geometry.translate(0,len/2,0); m.rotation.set(rx,0,rz); g.add(m); };
      if(st==='spiky'||st==='wild'){ const n=st==='wild'?14:10, l=st==='wild'?0.3:0.22;
        for(let i=0;i<n;i++){ const a2=i/n*Math.PI*2, lift=0.5+0.5*Math.sin(i*2.3); spike(l*(0.7+0.5*lift),0.055,Math.sin(a2)*0.1,0.2,Math.cos(a2)*0.06-0.06,-0.8-Math.cos(a2)*0.6+(st==='wild'?-0.3:0),-Math.sin(a2)*0.9); }
        spike(l*1.2,0.06,0,0.24,-0.04,-0.4,0); }
      else if(st==='tail'){ const k=M(new T.SphereGeometry(0.06,10,8),mat,0,0.2,-0.14); g.add(k); spike(0.32,0.05,0,0.2,-0.16,-2.6,0); }
      else if(st==='long'){ const lock=(len,r,x,y,z,rx,rz)=>{ const m=M(new T.CylinderGeometry(r,r*0.25,len,7),mat,x,y,z); m.geometry.translate(0,-len/2,0); m.scale.z=0.55; m.rotation.set(rx,0,rz); g.add(m); };
        for(let i=0;i<7;i++){ const u=i/6-0.5; lock(0.46-Math.abs(u)*0.12,0.05,u*0.22,0.2,-0.12-Math.cos(u*2)*0.02,0.22,u*0.25); }
        for(const s of [-1,1]) lock(0.32,0.04,s*0.135,0.18,-0.01,0.05,s*0.12); }
      else if(st==='slick'){ const m=M(new T.SphereGeometry(0.16,14,10,0,Math.PI*2,0,Math.PI*0.55),mat,0,0.12,-0.04); m.scale.set(1,0.8,1.15); g.add(m); spike(0.12,0.04,0,0.17,0.12,1.9,0); }
      out.push(['Head',g]); break; }
    case 'headband': { const g=G(), band=M(new T.CylinderGeometry(0.152,0.152,0.05,24,1,true),L(a[0],{side:T.DoubleSide}),0,0.13,0.0); g.add(band);
      const plate=M(new T.BoxGeometry(0.11,0.05,0.012),L(a[1],{metalness:0.8,roughness:0.25}),0,0.13,0.152); g.add(plate);
      for(const s of [-1,1]){ const t=M(new T.BoxGeometry(0.04,0.24,0.008),L(a[0]),s*0.03,0.03,-0.17); t.rotation.set(0.35,0,s*0.25); g.add(t); }
      out.push(['Head',g]); break; }
    case 'katana': { const g=G(); g.position.set(0,0.0,-0.2); g.rotation.z=0.75;
      g.add(M(new T.CylinderGeometry(0.022,0.026,0.82,8),L(a[0],{roughness:0.35,metalness:0.2}),0,-0.12,0));
      g.add(M(new T.CylinderGeometry(0.05,0.05,0.012,12),L('#c9a227',{metalness:0.9,roughness:0.3}),0,0.3,0));
      g.add(M(new T.CylinderGeometry(0.018,0.018,0.24,8),L('#141414',{roughness:0.9}),0,0.43,0));
      out.push(['Spine2',g]); break; }
    case 'hat': { const g=G(), witch=a[2]==='witch';
      const brim=M(new T.CylinderGeometry(witch?0.32:0.3,witch?0.32:0.3,0.015,28),L(a[0],{roughness:0.85}),0,0,0);
      if(!witch){ const p=brim.geometry.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i); p.setY(i,p.getY(i)+Math.pow(Math.abs(x)/0.3,3)*0.08-Math.max(0,z/0.3)*0.02); } brim.geometry.computeVertexNormals(); }
      g.add(brim);
      if(witch){ const c=M(new T.ConeGeometry(0.16,0.42,18),L(a[0],{roughness:0.85}),0,0.21,0); c.rotation.x=-0.25; g.add(c); }
      else { const crown=M(new T.CylinderGeometry(0.13,0.16,0.15,18),L(a[0],{roughness:0.85}),0,0.075,0); crown.scale.z=1.15; g.add(crown);
        const dent=M(new T.SphereGeometry(0.1,12,6,0,Math.PI*2,0,Math.PI/2),L(a[0],{roughness:0.85}),0,0.13,0); dent.scale.set(1.1,0.35,1.3); g.add(dent); }
      const band=M(new T.CylinderGeometry(0.162,0.162,0.035,18,1,true),L(a[1]),0,0.03,0); band.scale.z=1.15; g.add(band);
      g.position.set(0,witch?0.22:0.255,0.0); g.rotation.x=-0.08; out.push(['Head',g]); break; }
    case 'hat2': { const g=G(); const cap=M(new T.SphereGeometry(0.16,16,10,0,Math.PI*2,0,Math.PI/2),L(a[0]),0,0,0); cap.scale.set(1,0.75,1.1); g.add(cap);
      const bill=M(new T.CylinderGeometry(0.13,0.13,0.012,16,1,false,-Math.PI/2,Math.PI),L(a[0]),0,0,-0.12); bill.scale.z=0.9; g.add(bill); g.position.set(0,0.2,0); out.push(['Head',g]); break; }
    case 'bandana': { const m=M(new T.SphereGeometry(0.15,16,10,-Math.PI*0.4,Math.PI*0.8,Math.PI*0.5,Math.PI*0.35),L(a[0],{side:T.DoubleSide,roughness:0.85}),0,0.12,0.03); m.scale.set(1.02,1,1.05); out.push(['Head',m]);
      const tip=M(new T.ConeGeometry(0.07,0.1,3),L(a[0],{roughness:0.85}),0,-0.02,0.14); tip.rotation.x=Math.PI; out.push(['Head',tip]); break; }
    case 'badge': { const sh=new T.Shape(); for(let i=0;i<10;i++){ const an=Math.PI/2+i*Math.PI/5, r=i%2?0.018:0.042; sh.lineTo(Math.cos(an)*r,Math.sin(an)*r); }
      const m=M(new T.ExtrudeGeometry(sh,{depth:0.008,bevelEnabled:true,bevelThickness:0.003,bevelSize:0.003,bevelSegments:1}),L(a[0],{metalness:0.9,roughness:0.25}),0.09,0.1,0.17); out.push(['Spine2',m]); break; }
    case 'holster': { const g=G(); g.add(M(new T.BoxGeometry(0.06,0.2,0.1),L(a[0],{roughness:0.8}),0,-0.1,0));
      const grip=M(new T.BoxGeometry(0.035,0.1,0.05),L('#3a2414',{roughness:0.6}),0,0.03,0.03); grip.rotation.x=0.3; g.add(grip);
      g.add(M(new T.TorusGeometry(0.2,0.018,6,24),L(a[0],{roughness:0.8}),-0.17,0.02,0)).rotation.x=Math.PI/2;
      g.position.set(0.17,0,0); out.push(['Hips',g]); break; }
    case 'scarf': { const g=G(), m=L(a[0],{roughness:0.9}); const r=M(new T.TorusGeometry(0.12,0.045,8,20),m,0,0.02,0.01); r.rotation.x=Math.PI/2; r.scale.set(1,1.1,1); g.add(r);
      const tail=M(new T.BoxGeometry(0.08,0.36,0.02),m,0.06,-0.16,-0.14); tail.rotation.set(0.25,0,0.12); tail.userData.cape=true; g.add(tail); out.push(['Neck',g]); break; }
    case 'poncho': { const g=G(), geo=new T.CylinderGeometry(0.2,0.42,0.38,8,1,true); const m=M(geo,L(a[0],{side:T.DoubleSide,roughness:0.95}),0,0.05,0.0); m.scale.z=0.7; g.add(m);
      const stripe=M(new T.CylinderGeometry(0.37,0.4,0.05,8,1,true),L(a[1],{side:T.DoubleSide,roughness:0.95}),0,-0.07,0); stripe.scale.z=0.71; g.add(stripe); out.push(['Spine2',g]); break; }
    case 'horns': for(const s of [-1,1]){ const g=G(); if(a[1]==='antler'){ const m=L(a[0],{roughness:0.8});
        const b=M(new T.CylinderGeometry(0.012,0.02,0.25,6),m,0,0.12,0); g.add(b); for(let i=0;i<3;i++){ const t=M(new T.CylinderGeometry(0.008,0.014,0.1,5),m,0,0.08+i*0.06,0); t.geometry.translate(0,0.05,0); t.rotation.z=-0.9; g.add(t); } g.rotation.z=-s*0.5; }
      else { for(let i=0;i<5;i++){ const r=0.032*(1-i/5)+0.006, seg=M(new T.CylinderGeometry(r*0.8,r,0.07,8),L(a[0],{roughness:0.4}),0,0,0); seg.position.set(-s*0.0,i*0.06,i*i*0.008); seg.rotation.x=i*0.18; g.add(seg); } g.rotation.z=-s*0.6; }
      g.position.set(s*0.11,0.21,0.02); out.push(['Head',g]); } break;
    case 'ears': for(const s of [-1,1]){ const g=G(); const o=M(new T.ConeGeometry(0.06,0.12,4),L(a[0]),0,0.06,0); o.scale.z=0.45; g.add(o);
      if(a[1]){ const i=M(new T.ConeGeometry(0.035,0.08,4),L(a[1]),0,0.05,0.018); i.scale.z=0.3; g.add(i); }
      g.position.set(s*0.1,0.25,0.0); g.rotation.z=-s*0.3; out.push(['Head',g]); } break;
    case 'halo': { const m=M(new T.TorusGeometry(0.15,0.012,8,32),glowM(a[0]),0,0.42,-0.04); m.rotation.x=Math.PI/2-0.25; m.userData.bob=true; out.push(['Head',m]); break; }
    case 'crown': { const g=G(), mat=a[1]?glowM(a[0]):L(a[0],{metalness:0.9,roughness:0.25});
      g.add(M(new T.CylinderGeometry(0.15,0.15,0.05,20,1,true),mat)); for(let i=0;i<8;i++){ const an=i/8*Math.PI*2, sp=M(new T.ConeGeometry(0.025,0.1,4),mat,Math.sin(an)*0.15,0.07,Math.cos(an)*0.15); g.add(sp); }
      g.position.set(0,0.27,0); out.push(['Head',g]); break; }
    case 'antenna': case 'antenna2': { const g=G(), s=kind==='antenna'?1:-1; g.add(M(new T.CylinderGeometry(0.008,0.01,0.22,6),L(a[0],{metalness:0.6,roughness:0.3}),0,0.11,0)); g.add(M(new T.SphereGeometry(0.025,10,8),glowM(a[1]),0,0.23,0));
      g.position.set(s*0.14,0.2,-0.02); g.rotation.z=-s*0.25; out.push(['Head',g]); break; }
    case 'wings': for(const s of [-1,1]){ const sh=new T.Shape(); sh.moveTo(0,0); sh.quadraticCurveTo(0.3,0.35,0.75,0.4); sh.quadraticCurveTo(0.6,0.25,0.68,0.1); sh.quadraticCurveTo(0.5,0.05,0.55,-0.12); sh.quadraticCurveTo(0.35,-0.15,0.38,-0.32); sh.quadraticCurveTo(0.15,-0.2,0,0);
      const m=M(new T.ShapeGeometry(sh),L(a[0],{side:T.DoubleSide,roughness:0.6})), g=G(); m.scale.x=s; g.add(m); const b=M(new T.CylinderGeometry(0.02,0.012,0.8,6),L(a[1]),s*0.36,0.22,0.0); b.rotation.z=-s*1.1; g.add(b);
      g.position.set(s*0.08,0.12,-0.2); g.rotation.y=s*0.45; g.userData.flap=s; out.push(['Spine2',g]); } break;
    case 'jetpack': { const g=G(), body=L(a[0],{metalness:0.5,roughness:0.35}); g.add(M(new T.BoxGeometry(0.3,0.36,0.14),body));
      for(const s of [-1,1]){ g.add(M(new T.CylinderGeometry(0.06,0.06,0.42,12),body,s*0.12,-0.02,-0.05)); const n=M(new T.CylinderGeometry(0.045,0.065,0.08,12),L('#3a3a3a',{metalness:0.8,roughness:0.3}),s*0.12,-0.27,-0.05); g.add(n);
        const f=M(new T.SphereGeometry(0.04,8,6),glowM(a[1]),s*0.12,-0.31,-0.05); g.add(f); }
      g.position.set(0,0.0,-0.24); out.push(['Spine2',g]); break; }
    case 'muscles': { // big biceps, forearms, chest and traps in the skin colour
      const m=L(a[0],{roughness:0.7});
      for(const sd of ['Left','Right']){ const b=M(new T.SphereGeometry(0.095,12,10),m,0,0.13,0.02); b.scale.set(1.1,1.5,1.05); out.push([sd+'Arm',b]);
        const f=M(new T.SphereGeometry(0.075,12,10),m,0,0.1,0); f.scale.set(1,1.7,1); out.push([sd+'ForeArm',f]);
        const t=M(new T.SphereGeometry(0.08,12,10),m,0,0.02,-0.02); t.scale.set(1.2,0.8,1); out.push([sd+'Shoulder',t]); }
      const g=G(); for(const sx of [-1,1]){ const p=M(new T.SphereGeometry(0.1,14,10),m,sx*0.08,0.05,0.13); p.scale.set(1.1,0.75,0.6); g.add(p); } out.push(['Spine2',g]); break; }
    case 'roundShield': { // red, white and blue rings with a white star, worn on the back
      const g=G(), ring=(r,c,z)=>{ const d=M(new T.CylinderGeometry(r,r,0.025,32),L(c,{metalness:0.6,roughness:0.3}),0,0,z); d.rotation.x=Math.PI/2; g.add(d); };
      ring(0.26,a[0],0); ring(0.21,a[1],0.004); ring(0.16,a[0],0.008); ring(0.11,a[2],0.012);
      const sh=new T.Shape(); for(let i=0;i<10;i++){ const an=Math.PI/2+i*Math.PI/5, r=i%2?0.04:0.095; sh.lineTo(Math.cos(an)*r,Math.sin(an)*r); }
      g.add(M(new T.ExtrudeGeometry(sh,{depth:0.006,bevelEnabled:false}),L(a[1],{metalness:0.6,roughness:0.3}),0,0,0.026));
      g.rotation.y=Math.PI; g.position.set(0,0.0,-0.21); out.push(['Spine2',g]); break; }
    case 'helmWings': for(const s2 of [-1,1]){ const sh=new T.Shape(); sh.moveTo(0,0); sh.lineTo(0.09,0.03); sh.lineTo(0.08,0.06); sh.lineTo(0.1,0.08); sh.lineTo(0,0.05);
      const m=M(new T.ShapeGeometry(sh),L(a[0],{side:T.DoubleSide}),s2*0.15,0.14,0.02); m.scale.x=s2; m.rotation.y=s2*-1.2; out.push(['Head',m]); } break;
    case 'reactor': { const g=G(); g.add(M(new T.CylinderGeometry(0.045,0.045,0.02,24),glowM(a[0]),0,0,0)); const r=M(new T.TorusGeometry(0.05,0.01,8,24),L('#8a8f96',{metalness:0.9,roughness:0.25}),0,0,0); r.rotation.x=Math.PI/2; g.add(r);
      g.rotation.x=Math.PI/2-0.12; g.position.set(0,0.07,0.19); out.push(['Spine2',g]); break; }
    case 'faceplate': { const g=G(), plate=M(new T.SphereGeometry(0.155,18,12,Math.PI*0.08,Math.PI*0.84,Math.PI*0.25,Math.PI*0.5),L(a[0],{metalness:0.9,roughness:0.22}),0,0.12,0.012); plate.scale.set(1,1.08,1.08); g.add(plate);
      for(const sx of [-1,1]){ const e=M(new T.BoxGeometry(0.05,0.014,0.01),glowM(a[1]),sx*0.045,0.15,0.168); e.rotation.z=sx*-0.18; g.add(e); }
      g.add(M(new T.BoxGeometry(0.07,0.006,0.01),L('#5a1010'),0,0.06,0.165)); out.push(['Head',g]); break; }
    case 'palms': for(const sd of ['Left','Right']){ const m=M(new T.CylinderGeometry(0.022,0.022,0.01,16),glowM(a[0]),0,0.07,0.03); m.rotation.x=Math.PI/2; out.push([sd+'Hand',m]); } break;
    case 'jokerMask': { const g=G(), f=G(), face=M(new T.SphereGeometry(0.152,20,14,Math.PI*0.12,Math.PI*0.76,Math.PI*0.22,Math.PI*0.5),L(a[0],{roughness:0.5,side:T.DoubleSide}),0,0,0); f.add(face); // a face-shaped shell over the front of the helmet
      for(const sx of [-1,1]){ const e=M(new T.SphereGeometry(0.024,10,8),L('#1a1a1a'),sx*0.05,0.03,0.142); e.scale.set(1.3,0.8,0.4); f.add(e); }
      const smile=M(new T.TorusGeometry(0.06,0.012,8,20,Math.PI),L(a[1],{roughness:0.4}),0,-0.03,0.142); smile.rotation.z=Math.PI; f.add(smile);
      f.position.set(0,0.13,0.012); f.scale.set(1.08,1.05,1.4); g.add(f); out.push(['Head',g]); break; } // stretched forward so the helmet's nose ridge stays tucked inside
    case 'bowtie': { const g=G(), m=L(a[0]); for(const sx of [-1,1]){ const c=M(new T.ConeGeometry(0.035,0.06,4),m,sx*0.03,0,0); c.rotation.z=sx*Math.PI/2; g.add(c); } g.add(M(new T.SphereGeometry(0.016,8,6),m)); g.position.set(0,0.0,0.12); out.push(['Neck',g]); break; }
    case 'pigtails': for(const s2 of [-1,1]){ const g=G(), m=L(s2<0?a[0]:a[1],{roughness:0.5}); g.add(M(new T.SphereGeometry(0.035,10,8),L('#141414'),0,0,0));
      for(let i=0;i<5;i++){ const t=M(new T.SphereGeometry(0.055-i*0.007,10,8),m,s2*(0.03+i*0.015),-0.04-i*0.055,-0.01-i*0.01); g.add(t); }
      g.position.set(s2*0.13,0.2,-0.04); g.userData.cape=true; out.push(['Head',g]); } break;
    case 'choker': { const g=G(), r=M(new T.TorusGeometry(0.085,0.012,8,24),L(a[0]),0,0.02,0.01); r.rotation.x=Math.PI/2; g.add(r); for(let i=0;i<6;i++){ const an=-0.9+i*0.36, st=M(new T.ConeGeometry(0.01,0.025,4),L(a[1],{metalness:0.9,roughness:0.2}),Math.sin(an)*0.095,0.02,Math.cos(an)*0.095); st.rotation.set(Math.PI/2,0,0); st.rotation.z=-an; g.add(st); } out.push(['Neck',g]); break; }
    case 'spiderEyes': for(const sx of [-1,1]){ const g=G(), sh=new T.Shape(); sh.moveTo(0,0); sh.quadraticCurveTo(0.06,0.05,0.07,-0.01); sh.quadraticCurveTo(0.04,-0.04,0,0);
      const o=M(new T.ShapeGeometry(sh),L(a[1]),0,0,0); o.scale.set(1.25,1.25,1); g.add(o); const w=M(new T.ShapeGeometry(sh),L(a[0],{emissive:a[0],emissiveIntensity:0.25}),0.006,0,0.002); g.add(w);
      g.scale.x=sx; g.position.set(sx*0.02,0.16,0.158); g.rotation.y=sx*0.35; out.push(['Head',g]); } break;
    case 'belt': { const g=G(), r=M(new T.TorusGeometry(0.17,0.025,6,28),L(a[0],{metalness:0.6,roughness:0.35}),0,0.05,0); r.rotation.x=Math.PI/2; r.scale.set(1,0.75,1); g.add(r);
      for(let i=0;i<6;i++){ const an=-1.1+i*0.45, pz=M(new T.BoxGeometry(0.04,0.05,0.03),L(a[0],{metalness:0.6,roughness:0.35}),Math.sin(an)*0.17,0.05,Math.cos(an)*0.13); pz.rotation.y=an; g.add(pz); } out.push(['Hips',g]); break; }
    case 'hood': { const g=G(), m=L(a[0],{side:T.DoubleSide,roughness:0.9}), h=M(new T.SphereGeometry(0.168,16,12,Math.PI*0.7,Math.PI*1.6,0,Math.PI*0.6),m,0,0.115,-0.025); h.scale.set(1.02,1.08,1.08); g.add(h);
      const tip=M(new T.ConeGeometry(0.05,0.16,8),m,0,0.15,-0.18); tip.rotation.x=-2.3; g.add(tip);
      const fe=M(new T.ConeGeometry(0.012,0.2,4),L(a[1]),0.14,0.25,-0.04); fe.rotation.z=-0.5; g.add(fe); out.push(['Head',g]); break; }
    case 'bow': { // cosmetic only: a longbow and quiver across the back
      const g=G(), wood=L(a[0],{roughness:0.7}), arc=M(new T.TorusGeometry(0.42,0.014,6,30,Math.PI*0.9),wood,0,0,0); arc.rotation.z=Math.PI*0.55; g.add(arc);
      const st=M(new T.CylinderGeometry(0.003,0.003,0.82,4),L(a[1]),0.06,0,0); g.add(st); g.rotation.set(0,0,0.5); g.position.set(-0.02,0.02,-0.2);
      const q=G(), qv=M(new T.CylinderGeometry(0.05,0.045,0.42,12),L('#5a3a1a',{roughness:0.8})); q.add(qv);
      for(let i=0;i<4;i++){ const ar=M(new T.CylinderGeometry(0.005,0.005,0.2,4),wood,(i%2-0.5)*0.03,0.25,(i>>1)*0.025-0.012); q.add(ar); const fl=M(new T.BoxGeometry(0.03,0.05,0.003),L('#e8e0c8'),(i%2-0.5)*0.03,0.33,(i>>1)*0.025-0.012); q.add(fl); }
      q.position.set(0.08,0.05,-0.18); q.rotation.z=-0.45; out.push(['Spine2',g],['Spine2',q]); break; }
    case 'crest': { const g=G(), m=L(a[0],{metalness:0.9,roughness:0.25}); const cap=M(new T.SphereGeometry(0.165,18,10,0,Math.PI*2,0,Math.PI*0.5),m,0,0.12,-0.01); cap.scale.set(1.02,1,1.1); g.add(cap);
      for(const sx of [-1,1]){ const f=M(new T.BoxGeometry(0.02,0.16,0.06),m,sx*0.16,0.16,0.0); f.rotation.z=sx*-0.35; g.add(f); }
      const ridge=M(new T.BoxGeometry(0.02,0.06,0.28),m,0,0.27,-0.02); g.add(ridge); out.push(['Head',g]); break; }
    case 'gauntlet': { // a golden glove built onto the hand's own bones, so it curls with the fingers. Fingers run along +y;
      // the back of the hand faces +x. Stones: four on the knuckles, one on the thumb, the big one on the back of the hand.
      const gold=L(a[0],{metalness:0.6,roughness:0.3,emissive:'#3a2600',emissiveIntensity:0.6}), st=(g,c,r,x,y,z)=>{ const m=M(new T.SphereGeometry(r,10,8),glowM(c),x,y,z); m.scale.x=0.6; g.add(m); };
      const hand=G(); hand.add(M(new T.BoxGeometry(0.078,0.19,0.12),gold,0.004,0.1,0.012));
      const cuff=M(new T.CylinderGeometry(0.066,0.058,0.09,14),gold,0,-0.005,0.01); cuff.scale.z=1.2; hand.add(cuff);
      const rim=M(new T.TorusGeometry(0.068,0.008,6,18),gold,0,0.04,0.01); rim.rotation.x=Math.PI/2; rim.scale.y=1.2; hand.add(rim);
      st(hand,'#ff8a1a',0.022,0.042,0.1,0.012); out.push(['LeftHand',hand]);
      const gems={Index:'#b04aff',Middle:'#2a7bff',Ring:'#ff2a2a',Pinky:'#ffd21f',Thumb:'#3aff6a'};
      for(const f of ['Thumb','Index','Middle','Ring','Pinky']) for(let k=1;k<=3;k++){ const g=G(), len=k===3?0.032:0.042;
        g.add(M(new T.BoxGeometry(0.034,len,0.03),gold,0,len/2,0)); if(k===1) st(g,gems[f],0.011,0.018,0.008,0);
        out.push(['LeftHand'+f+k,g]); }
      break; }
    case 'tail': { const g=G(); for(let i=0;i<6;i++){ const r=0.06+Math.sin(i/5*Math.PI)*0.05; g.add(M(new T.SphereGeometry(r,10,8),L(i>3?a[1]:a[0],{roughness:0.9}),0,-i*0.07,-i*0.06-0.02)); }
      g.position.set(0,-0.05,-0.14); g.rotation.x=-0.5; g.userData.cape=true; out.push(['Hips',g]); break; }
  }
  return out;
}

window.SKINS={THEMES,ITEMS,paint,gear,emblemCanvas,RAR_N:['Common','Uncommon','Rare','Epic','Legendary']};
})();
