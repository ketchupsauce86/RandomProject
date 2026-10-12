// Inverted outfits: original themed skins for the soldier character. Each skin repaints the soldier's
// armor texture region by region (plates, cloth, undersuit, straps, metal trim, accent stripes and the visor)
// keeping the original shading, scuffs and wear, then adds 3D gear on the skeleton: capes, hats, hair,
// horns, halos, wings, emblems and more. The Heroes & Villains set and the named anime skins are Kash's own picks:
// fan-made tributes for this personal project. Every other skin is an original design.
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
  // Kash's anime picks, in Kash's order: a sculpted head and hair, a smooth body in a build that suits them, the
  // outfit painted on (decals for the fine lines), and signature gear. p..v colour the icon and the armor fallback.
  S('Naruto','anime',4,{body:{build:'avg',skin:'#f2c49e',top:'#ff7a1a',upper:'#233c7a',upperZ:143,pants:'#ff7a1a',collar:'#f4f4f0',sandals:1,sole:'#1a2440',strap:'#233c7a',
      decals:[{d:'narutoZip',a:0.42,z0:104,z1:152.5},{d:'narutoSpiral',side:1,a:0.6,z0:126,z1:150}]},
    p:'#ff7a1a',c:'#233c7a',s:'#16161a',k:'#233c7a',m:'#2a2a30',x:'#ff7a1a',v:'#1a1a1e',noVisor:1,cel:1,
    acc:[['animeHead','#f2c49e','naruto'],['animeHair','naruto','#f7c516','#ffe27a'],['leafband','#233c7a','#c9cfd8'],['collar','naruto','#f4f4f0']]}),
  S('Luffy','anime',4,{body:{build:'fit',skin:'#eab58c',top:'#d0202a',sleeves:'elbow',roll:'#a8161e',openW:[5,0.2],pants:'#3a6fc0',legs:'knee',cuffBand:'#8fb4e6',
      belt:'#f2c81e',beltZ:[102.5,109],sandals:1,sole:'#9a7448',strap:'#5a3a22',decals:[{d:'luffyChest',a:0.95,z0:104,z1:152}]},
    p:'#d0202a',c:'#3a6fc0',s:'#e2a882',k:'#f2c81e',m:'#e2a882',x:'#d0202a',v:'#1a1a1e',fin:[0.05,0.8],noVisor:1,cel:1,
    acc:[['animeHead','#eab58c','luffy'],['animeHair','luffy','#141418'],['strawHat','#ecc976','#c4161c'],['sash','#f2c81e','left']]}),
  S('Saitama','anime',4,{body:{build:'fit',skin:'#f2c49e',top:'#f6cf1e',pants:'#f6cf1e',collar:'#f6cf1e',gloves:'#d42020',shoes:'#d42020',shoeTop:44,belt:'#161616',beltZ:[103,108],
      decals:[{d:'saitamaZip',a:0.3,z0:104,z1:152.5}]},
    p:'#f6cf1e',c:'#f6cf1e',s:'#d9ac10',k:'#161616',m:'#d42020',x:'#f6cf1e',v:'#1a1a1e',fin:[0.05,0.6],noVisor:1,cel:1,
    acc:[['animeHead','#f2c49e','saitama'],['cape','#f8f8f4','#e8e8e2','clasps'],['buckle','#d8b418'],['gloveCuff','#d42020']]}),
  S('Goku','anime',4,{body:{build:'fit',skin:'#f2c49e',top:'#f47a12',sleeves:'short',sleeve:'#1d3a8f',pants:'#f47a12',collar:'#1d3a8f',belt:'#1d3a8f',beltZ:[103,109],cuff:'#1d3a8f',cuffFrom:56,
      shoes:'#1d3a8f',shoeTop:34,decals:[{d:'gokuGi',a:0.9,z0:118,z1:153},{d:'gokuBack',side:1,a:0.7,z0:126,z1:150}]},
    p:'#f47a12',c:'#1d3a8f',s:'#16285a',k:'#1d3a8f',m:'#1d3a8f',x:'#f47a12',v:'#1a1a1e',fin:[0.05,0.8],noVisor:1,cel:1,
    acc:[['animeHead','#f2c49e','goku'],['animeHair','goku','#141418'],['sash','#1d3a8f','front']]}),
  S('Eren','anime',4,{body:{build:'avg',skin:'#efc39f',top:'#a07848',inner:'#f2efe8',cut:'below',jacketEnd:127,pants:'#efece4',collar:'#f2efe8',belt:'#4a2f1e',beltZ:[103,108],
      shoes:'#5a3a24',shoeTop:44,legBands:[[92,1.3,'#4a2f1e'],[80,1.3,'#4a2f1e'],[68,1.2,'#4a2f1e']],decals:[{d:'erenFront',a:1.0,z0:104,z1:152.5}]},
    p:'#a07848',c:'#efece4',s:'#2a2a2a',k:'#4a2f1e',m:'#a8b0b8',x:'#efece4',v:'#1a1a1e',fin:[0.05,0.8],noVisor:1,cel:1,
    acc:[['animeHead','#efc39f','eren'],['animeHair','eren','#3a2417','#4e3220'],['cape','#2f5a3a','#24462e','wings'],['odm','#a8b0b8','#3a2a1e']]}),
  S('Gojo','anime',4,{body:{build:'slim',skin:'#f4d2b6',top:'#1c1e33',pants:'#1c1e33',collar:'#1c1e33',shoes:'#0e0f16',shoeTop:12,coat:{hem:90,gap:0.1,flare:3}},big:[1,1.04],
    p:'#1c1e33',c:'#1c1e33',s:'#0c0d12',k:'#22252e',m:'#3a3f4a',x:'#2a3a6a',v:'#1a1a1e',fin:[0.1,0.7],noVisor:1,cel:1,
    acc:[['animeHead','#f4d2b6','gojo'],['animeHair','gojo','#eef1f6','#cdd6e4'],['blindfold','#141418'],['collar','gojo','#1c1e33'],['palms','#4ab0ff']]}),
  S('Tanjiro','anime',4,{body:{build:'avg',skin:'#f2c49e',top:'#1a1a1e',check:['#1f9a74','#141414'],openW:[4.5,0.12],pants:'#1a1a1e',belt:'#f2efe6',beltZ:[103,108],
      wrap:'#f2efe6',wrapZ:47,sandals:1,sole:'#cdb37a',strap:'#2a2a2a',toe:'#f2efe6',coat:{hem:80,gap:0.42,flare:4,check:1},sleeveShell:1,collar:'#1a1a1e',decals:[{d:'tanjiroFront',a:0.75,z0:106,z1:152.5}]},
    p:'#1a1a1e',c:'#1f9a74',s:'#101014',k:'#e8e4da',m:'#3a3a40',x:'#1a1a1e',v:'#1a1a1e',fin:[0.05,0.8],noVisor:1,cel:1,
    acc:[['animeHead','#f2c49e','tanjiro'],['animeHair','tanjiro','#4a1416','#b83a2e'],['earrings'],['katana','#141414','hip'],['collar','tanjiro','#1a1a1e']]}),
  S('Light Yagami','anime',4,{body:{build:'slim',skin:'#f4cfae',top:'#7d87b2',pants:'#737ca8',collar:'#f4f2ee',cuff:'#f4f2ee',cuffFrom:63,shoes:'#3a2a22',shoeTop:11,tie:'#3a3d46',lapel:'#646e98',
      coat:{hem:88,gap:0.14,flare:2},decals:[{d:'lightFront',a:0.85,z0:104,z1:152.5}]},
    p:'#9aa3c6',c:'#8a93b8',s:'#f2f0ea',k:'#3a3d46',m:'#8a7a60',x:'#9aa3c6',v:'#1a1a1e',fin:[0.05,0.75],noVisor:1,cel:1,
    acc:[['animeHead','#f4cfae','light'],['animeHair','light','#9a5a2c','#b86e36'],['book']]}),
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
// Body zones: which part of the body each texel of the armor atlas is painted onto, found by drawing every
// triangle of the soldier mesh into the atlas, coloured by where it sits in the bind pose (Z up, centimetres,
// arms out in a T). Lets a skin colour by body part (bare arms, shorts, boots) as well as by armor region.
const ZN=['','head','chest','belly','upperArm','foreArm','hand','thigh','shin','foot'];
let zoneMap=null;
function zones(geo,size){
  if(zoneMap&&zoneMap.size===size) return zoneMap.z;
  const cv=document.createElement('canvas'); cv.width=cv.height=size; const x=cv.getContext('2d'); x.imageSmoothingEnabled=false;
  const p=geo.attributes.position, uv=geo.attributes.uv, ix=geo.index, n=ix?ix.count:p.count, at=k=>ix?ix.getX(k):k;
  const zoneOf=(px,pz)=>{ const ax=Math.abs(px); if(pz>150&&ax<11) return 1; if(ax>22&&pz>105) return ax>70?6:ax>45?5:4; if(pz>118) return 2; if(pz>90) return 3; if(pz>50) return 7; if(pz>12) return 8; return 9; };
  for(let t=0;t<n;t+=3){ const a=at(t), b=at(t+1), c=at(t+2), z=zoneOf((p.getX(a)+p.getX(b)+p.getX(c))/3,(p.getZ(a)+p.getZ(b)+p.getZ(c))/3);
    x.fillStyle=x.strokeStyle=`rgb(${z*25},0,0)`; x.lineWidth=1.5; x.beginPath(); x.moveTo(uv.getX(a)*size,uv.getY(a)*size); x.lineTo(uv.getX(b)*size,uv.getY(b)*size); x.lineTo(uv.getX(c)*size,uv.getY(c)*size); x.closePath(); x.fill(); x.stroke(); }
  const d=x.getImageData(0,0,size,size).data, z=new Uint8Array(size*size); for(let i=0;i<z.length;i++) z[i]=Math.round(d[i*4]/25);
  zoneMap={size,z}; return z;
}
// Paints a skin: returns canvases for the body colour and for what glows. zone: colours by body part (see zones)
function paint(img,skin,size,geo){
  const zc=skin.zone&&geo?ZN.map(k=>skin.zone[k]?hex(skin.zone[k]):null):null, zm=zc?zones(geo,size):null;
  if(!atlas||atlas.size!==size) atlas=analyse(img,size);
  const cols=[...REG].map(k=>hex(skin[k])), glow=new Set([...(skin.g||'')].map(k=>REGION[k]).filter(v=>v!=null)),
    pat=skin.pat?{reg:REGION[skin.pat[0]],kind:skin.pat[1],col:hex(skin.pat[2])}:null, n=size*size;
  const cv=document.createElement('canvas'); cv.width=cv.height=size; const ctx=cv.getContext('2d'), id=ctx.createImageData(size,size), o=id.data;
  let gcv=null, gd=null, gid=null; if(glow.size){ gcv=document.createElement('canvas'); gcv.width=gcv.height=size; gid=gcv.getContext('2d').createImageData(size,size); gd=gid.data; }
  for(let i=0;i<n;i++){
    const c=atlas.cls[i], s=atlas.lum[i]; let col=cols[c];
    if(zm&&zc[zm[i]]){ const z=zc[zm[i]], k=c===2||c===3?0.72:c===4?1.08:1; col=[z[0]*k,z[1]*k,z[2]*k]; } // straps and undersuit stay a shade darker so the seams still read
    if(pat&&pat.reg===c){ const a=patternAt(pat.kind,(i%size)/size,Math.floor(i/size)/size); if(a>0){ const pc=pat.col; col=[col[0]+(pc[0]-col[0])*a,col[1]+(pc[1]-col[1])*a,col[2]+(pc[2]-col[2])*a]; } }
    // keep the original shading: darker texels (scuffs, seams) darken the new colour; light ones lift it a little
    let sh=c===2?0.6+0.4*s:Math.min(1.35,s); if(skin.cel) sh=1+(Math.max(0.55,sh)-1)*0.4; // cel: flat anime colour, only soft shading
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
  if(kind.startsWith('kanji:')){ x.fillStyle=bg; x.beginPath(); x.arc(0,0,46,0,7); x.fill(); x.lineWidth=4; x.strokeStyle=fg; x.stroke(); x.fillStyle=fg; x.font='bold 60px "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", "WenQuanYi Zen Hei", serif'; x.textAlign='center'; x.textBaseline='middle'; x.fillText(kind.slice(6),0,4); return cv; }
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

// ---------------------------------------------------------------- anime faces
// A face painted onto the sculpted head: the canvas wraps all the way round (x is the angle around the head with the
// face in the middle; y runs from the crown down to the chin). Drawn at 512x256 and scaled up 2x for crisp lines.
const FACES={
  naruto:{eye:'#2f86e8',brow:'#c99a10',mouth:'grin',marks:'whiskers',big:1},
  luffy:{eye:'#1a1a1a',brow:'#141414',mouth:'grin',marks:'stitch',big:1,round:1},
  saitama:{eye:'dot',brow:'#c7956a',mouth:'flat',thin:1},
  goku:{eye:'#141414',brow:'#141414',mouth:'smirk',sharp:1},
  eren:{eye:'#2aa58f',brow:'#3a2417',mouth:'frown',sharp:1,angry:1},
  gojo:{eye:null,brow:null,mouth:'teeth'},
  tanjiro:{eye:'#b0303a',brow:'#5a1a1a',mouth:'smile',marks:'scar',big:1},
  light:{eye:'#9a4a24',brow:'#7a4422',mouth:'smirk',sharp:1,narrow:1}
};
function faceCanvas(kind,skin){
  const f=FACES[kind]||FACES.naruto, W=1024, H=512, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d');
  x.fillStyle=skin; x.fillRect(0,0,W,H); x.scale(2,2);
  const cx=256, ey=128; x.lineCap='round'; x.lineJoin='round';
  // a soft shade under the jaw and a little blush
  const shade=x.createLinearGradient(0,176,0,256); shade.addColorStop(0,'rgba(0,0,0,0)'); shade.addColorStop(1,'rgba(110,50,30,.3)'); x.fillStyle=shade; x.fillRect(0,176,512,80);
  for(const s of [-1,1]){ const g=x.createRadialGradient(cx+s*36,ey+24,0,cx+s*36,ey+24,13); g.addColorStop(0,'rgba(255,120,110,.25)'); g.addColorStop(1,'rgba(255,120,110,0)'); x.fillStyle=g; x.fillRect(cx+s*36-13,ey+11,26,26); }
  const ex0=f.narrow?27:29;
  if(f.eye==='dot') for(const s of [-1,1]){ const ex=cx+s*ex0; // Saitama's plain, unbothered eyes
    x.fillStyle='#fbfbfb'; x.beginPath(); x.ellipse(ex,ey+1,9,7,0,0,7); x.fill(); x.fillStyle='#1a1a1a'; x.beginPath(); x.arc(ex,ey+2,2.6,0,7); x.fill();
    x.strokeStyle='#2a1a14'; x.lineWidth=2; x.beginPath(); x.moveTo(ex-10,ey-2); x.quadraticCurveTo(ex,ey-8,ex+10,ey-2); x.stroke(); }
  else if(f.eye) for(const s of [-1,1]){ // big anime eyes: white, iris, pupil, two highlights, a heavy upper lash line
    const ex=cx+s*ex0, w=f.sharp?18:f.big?17:16, h=f.sharp?11:f.round?18:16;
    x.save(); x.beginPath();
    if(f.sharp){ x.moveTo(ex-s*w,ey+3); x.quadraticCurveTo(ex,ey-h-2,ex+s*w,ey-4); x.quadraticCurveTo(ex+s*3,ey+h,ex-s*w,ey+3); }
    else x.ellipse(ex,ey,w*0.82,h,0,0,7);
    x.closePath(); x.fillStyle='#fbfbfb'; x.fill(); x.clip();
    const ix=ex-s*1, ir=f.sharp?w*0.5:w*0.6;
    const ig=x.createLinearGradient(0,ey-h,0,ey+h); ig.addColorStop(0,'#000'); ig.addColorStop(0.45,f.eye); ig.addColorStop(1,f.eye); x.fillStyle=ig; x.beginPath(); x.ellipse(ix,ey+1,ir,h*1.02,0,0,7); x.fill();
    x.fillStyle='rgba(0,0,0,.85)'; x.beginPath(); x.ellipse(ix,ey+1,ir*0.42,h*0.5,0,0,7); x.fill();
    x.fillStyle='#ffffff'; x.beginPath(); x.ellipse(ix-s*4,ey-4,3.6,4.2,0,0,7); x.fill(); x.beginPath(); x.arc(ix+s*3,ey+5,1.5,0,7); x.fill(); x.restore();
    x.strokeStyle='#141414'; x.lineWidth=f.sharp?3.6:3.4; x.beginPath();
    if(f.sharp){ x.moveTo(ex-s*(w+1),ey+3); x.quadraticCurveTo(ex,ey-h-3,ex+s*(w+2),ey-5); }
    else x.ellipse(ex,ey,w*0.82+0.6,h+0.6,0,Math.PI*1.05,Math.PI*1.95);
    x.stroke(); x.lineWidth=1.6; x.beginPath(); x.moveTo(ex+s*(w-1),ey-4); x.lineTo(ex+s*(w+5),ey-8); x.stroke(); // lash flick
    x.strokeStyle='rgba(60,30,20,.5)'; x.lineWidth=1.2; x.beginPath(); x.moveTo(ex-w*0.6,ey+h*0.85+(f.sharp?-2:0)); x.quadraticCurveTo(ex,ey+h+2,ex+w*0.6,ey+h*0.85+(f.sharp?-2:0)); x.stroke(); }
  if(f.brow) for(const s of [-1,1]){ const ex=cx+s*ex0, by=f.round?ey-27:ey-23; x.strokeStyle=f.brow; x.lineWidth=f.thin?2:4.6; x.beginPath();
    if(f.angry){ x.moveTo(ex-s*15,by+1); x.lineTo(ex+s*12,by-6); }
    else if(f.sharp){ x.moveTo(ex-s*14,by+2); x.quadraticCurveTo(ex,by-4,ex+s*15,by-2); }
    else { x.moveTo(ex-s*14,by+1); x.quadraticCurveTo(ex,by-6,ex+s*14,by); } x.stroke(); }
  // nose: a small shadow on one side, the way anime draws it
  x.fillStyle='rgba(150,80,55,.55)'; x.beginPath(); x.moveTo(cx+1,ey+12); x.lineTo(cx-3,ey+22); x.lineTo(cx+2,ey+21); x.closePath(); x.fill();
  const my=ey+38; x.strokeStyle='#5a1f1a'; x.lineWidth=2.6;
  if(f.mouth==='grin'){ x.fillStyle='#7a1f1f'; x.beginPath(); x.moveTo(cx-17,my-5); x.quadraticCurveTo(cx,my+17,cx+17,my-5); x.quadraticCurveTo(cx,my-1,cx-17,my-5); x.fill(); x.stroke();
    x.fillStyle='#ffffff'; x.beginPath(); x.moveTo(cx-15,my-4); x.quadraticCurveTo(cx,my,cx+15,my-4); x.quadraticCurveTo(cx,my+4,cx-15,my-4); x.fill(); }
  else if(f.mouth==='teeth'){ x.fillStyle='#ffffff'; x.beginPath(); x.moveTo(cx-18,my-5); x.quadraticCurveTo(cx,my+13,cx+18,my-5); x.quadraticCurveTo(cx,my-1,cx-18,my-5); x.fill(); x.stroke();
    x.lineWidth=1; x.strokeStyle='rgba(90,40,30,.5)'; x.beginPath(); x.moveTo(cx-16,my-1); x.quadraticCurveTo(cx,my+4,cx+16,my-1); x.stroke(); }
  else if(f.mouth==='smile'){ x.beginPath(); x.moveTo(cx-10,my-2); x.quadraticCurveTo(cx,my+6,cx+10,my-2); x.stroke(); }
  else if(f.mouth==='smirk'){ x.beginPath(); x.moveTo(cx-9,my); x.quadraticCurveTo(cx+2,my+3,cx+11,my-5); x.stroke(); }
  else if(f.mouth==='frown'){ x.beginPath(); x.moveTo(cx-9,my+2); x.quadraticCurveTo(cx,my-3,cx+9,my+2); x.stroke(); }
  else { x.beginPath(); x.moveTo(cx-6,my); x.lineTo(cx+6,my); x.stroke(); }
  if(f.marks==='whiskers') for(const s of [-1,1]) for(let i=0;i<3;i++){ x.strokeStyle='#4a2e1c'; x.lineWidth=2.6; x.beginPath(); x.moveTo(cx+s*31,ey+15+i*6.5); x.quadraticCurveTo(cx+s*40,ey+13+i*7,cx+s*48,ey+12+i*7.5); x.stroke(); }
  // Luffy's scar sits under his left eye (the right side of the canvas is the character's left)
  if(f.marks==='stitch'){ x.strokeStyle='#8a3a2a'; x.lineWidth=2.2; x.beginPath(); x.moveTo(cx+18,ey+19); x.lineTo(cx+38,ey+19); x.stroke(); for(const d of [22,28,34]){ x.beginPath(); x.moveTo(cx+d,ey+15); x.lineTo(cx+d,ey+23); x.stroke(); } }
  // Tanjiro's scar: a dark red flame-shaped mark on his left forehead
  if(f.marks==='scar'){ x.fillStyle='rgba(140,30,30,.92)'; x.beginPath(); x.moveTo(cx+14,ey-30); x.quadraticCurveTo(cx+22,ey-52,cx+46,ey-46); x.quadraticCurveTo(cx+34,ey-42,cx+36,ey-34); x.quadraticCurveTo(cx+26,ey-38,cx+14,ey-30); x.fill(); }
  return cv;
}
// a hanafuda card: a red rising sun over a mountain, on cream
function hanafudaCanvas(){ const cv=document.createElement('canvas'); cv.width=32; cv.height=48; const x=cv.getContext('2d');
  x.fillStyle='#f4ecd8'; x.fillRect(0,0,32,48); x.fillStyle='#d2302a'; x.beginPath(); x.arc(16,18,9,0,7); x.fill();
  x.fillStyle='#2a2a2a'; x.beginPath(); x.moveTo(0,48); x.lineTo(10,30); x.lineTo(18,38); x.lineTo(26,28); x.lineTo(32,36); x.lineTo(32,48); x.fill();
  x.strokeStyle='#141414'; x.lineWidth=2; x.strokeRect(1,1,30,46); return cv; }
// Tanjiro's haori: green and black checks
function checkCanvas(a,b){ const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d'); x.fillStyle=a; x.fillRect(0,0,128,128); x.fillStyle=b;
  for(let i=0;i<8;i++) for(let j=0;j<8;j++) if((i+j)%2) x.fillRect(i*16,j*16,16,16); return cv; }
// Naruto's headband plate: a spiral leaf scratched into steel
function leafCanvas(){ const cv=document.createElement('canvas'); cv.width=128; cv.height=64; const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,0,64); g.addColorStop(0,'#e8ecf0'); g.addColorStop(1,'#9aa2ac'); x.fillStyle=g; x.fillRect(0,0,128,64);
  x.strokeStyle='#3a3f46'; x.lineWidth=3.5; x.lineCap='round'; x.beginPath();
  for(let t=0;t<9;t+=0.1){ const r=2+t*1.9; x.lineTo(64+Math.cos(t)*r,32+Math.sin(t)*r); } x.stroke();
  x.beginPath(); x.moveTo(64+Math.cos(9)*19,32+Math.sin(9)*19); x.lineTo(46,14); x.lineTo(70,13); x.stroke();
  x.fillStyle='#5a6068'; for(const [px,py] of [[8,8],[120,8],[8,56],[120,56]]){ x.beginPath(); x.arc(px,py,3,0,7); x.fill(); } return cv; }
// the Wings of Freedom: a blue wing over a white one, on a shield
function wingsCanvas(){ const cv=document.createElement('canvas'); cv.width=cv.height=128; const x=cv.getContext('2d'); x.translate(64,64);
  x.fillStyle='#f2efe6'; x.strokeStyle='#2a2a2a'; x.lineWidth=4; x.beginPath(); x.moveTo(-46,-50); x.lineTo(46,-50); x.lineTo(46,10); x.quadraticCurveTo(40,44,0,58); x.quadraticCurveTo(-40,44,-46,10); x.closePath(); x.fill(); x.stroke();
  const wing=(s,c)=>{ x.save(); x.scale(s,1); x.fillStyle=c; x.beginPath(); x.moveTo(-2,30); x.quadraticCurveTo(-8,-10,-38,-34); x.quadraticCurveTo(-30,-14,-36,-6); x.quadraticCurveTo(-24,-4,-30,8); x.quadraticCurveTo(-18,8,-22,20); x.quadraticCurveTo(-12,20,-2,30); x.fill(); x.strokeStyle='#1a1a1a'; x.lineWidth=2; x.stroke(); x.restore(); };
  wing(1,'#ffffff'); wing(-1,'#2a5ab8'); return cv; }
// the Death Note
function noteCanvas(){ const cv=document.createElement('canvas'); cv.width=64; cv.height=90; const x=cv.getContext('2d');
  x.fillStyle='#121214'; x.fillRect(0,0,64,90); x.fillStyle='#e8e8e8'; x.font='bold 11px Georgia, serif'; x.textAlign='center'; x.fillText('DEATH',32,40); x.fillText('NOTE',32,54); return cv; }

// ---------------------------------------------------------------- anime bodies
// A smooth body in place of the armored soldier: tubes swept through the skeleton's joints in the bind pose
// (centimetres, Z up, +Y to the front, +X the character's right, arms out in a T) and skinned to the same bones, so
// every animation and aim pose still drives it. Clothes are vertex colours; skin.body says where shirt, sleeves,
// trousers and shoes end for each character, and decals paint crisp detail (zips, scars, ties) on a thin skin over it.
const ss=(a,b,x)=>{ const t=Math.min(1,Math.max(0,(x-a)/(b-a))); return t*t*(3-2*t); };
const CM=0.011; // gear is modelled in metres at the character's scale: one bind-pose centimetre is 0.011
// three builds: average, athletic (Saitama, Goku, Luffy) and slim (Light, Gojo). Torso rings are [half width, half depth]
const BUILDS={
  avg:{torso:[[14,10],[17.5,12.2],[17,12.8],[17.4,12.6],[18.4,12.4],[18.6,10.6],[6.8,6.6],[6,5.8]],arm:1,leg:1},
  fit:{torso:[[13.6,9.8],[15.8,11.4],[15,11.4],[16.8,12.6],[19.6,13.2],[20.4,11.2],[7.4,7.2],[6.4,6.2]],arm:1.13,leg:1.03},
  slim:{torso:[[13,9.4],[15.4,11],[14.4,10.6],[15,10.8],[16.6,11],[17.4,9.8],[6.2,6],[5.6,5.4]],arm:0.9,leg:0.92}};
const TORSO=[['Hips',97,0.5],['Hips',103,0.5],['Spine',115.6,1.2],['Spine1',126.7,1.6],['Spine2',139.3,1.4],['Spine2',148,-0.5],['Neck',153.6,0],['Head',163,0]];
let BIND=null; // bone positions in the bind pose, filled in by the first body built
// the torso at height z: centre y and the two half-axes, for fitting gear to it
function torsoAt(build,z){ const bd=BUILDS[build]||BUILDS.avg; let i=TORSO.findIndex(t=>t[1]>=z); i=i<1?1:i;
  const A=TORSO[i-1], B=TORSO[i], t=Math.max(0,Math.min(1,(z-A[1])/(B[1]-A[1]))), y=n=>BIND&&BIND[n]?BIND[n].y:0, r0=bd.torso[i-1], r1=bd.torso[i];
  return {y:(y(A[0])+A[2])*(1-t)+(y(B[0])+B[2])*t, rx:r0[0]+(r1[0]-r0[0])*t, ry:r0[1]+(r1[1]-r0[1])*t}; }
// a bind-pose point (cm) in a spine bone's gear frame (+X the character's left, +Y up, +Z front)
function onBone(bone,x,y,z){ const B=BIND&&BIND[bone]||{x:0,y:0,z:0}; return [-(x-B.x)*CM,(z-B.z)*CM,(y-B.y)*CM]; }
// a point on the torso's surface at height z, x across (cm, + is the character's right), front or back
function torsoPt(build,x,z,back,out=0){ const t=torsoAt(build,z), k=Math.min(0.98,Math.abs(x)/(t.rx+out)); return [x,t.y+(back?-1:1)*(t.ry+out)*Math.sqrt(1-k*k),z]; }
const chk=(i,j)=>((i%2)+2)%2^((j%2)+2)%2; // a check pattern from two cell numbers

// ---- decals: x across the body as seen (cm from the middle, + is the viewer's right), y down from the top edge
const DECALS={
  narutoZip:(d,b)=>{ d.band(-1.5,1.5,106,151.5,b.zip||'#233c7a'); d.band(-0.25,0.25,106,151.5,'#9aa6b8'); d.rect(0.2,147,1.4,4.5,'#d8dde4','#5a6270'); },
  narutoSpiral:d=>{ const x=d.x, [cx,cy]=[d.X(0,138),d.Y(138)], r=d.s*5.5; x.strokeStyle='#c8282a'; x.lineWidth=d.s*1.1; x.lineCap='round'; x.beginPath();
    for(let t=0;t<11;t+=0.15){ const rr=r*t/11; x.lineTo(cx+Math.cos(t)*rr,cy+Math.sin(t)*rr); } x.stroke(); },
  luffyChest:(d,b)=>{ d.open(b.skin,b.openW[0],b.openW[1],108.6); const x=d.x, P=(c,z)=>[d.X(c,z),d.Y(z)], ln=(pts,w,c)=>{ x.strokeStyle=c; x.lineWidth=w*d.s; x.lineCap='round'; x.beginPath(); pts.forEach(p=>x.lineTo(...P(...p))); x.stroke(); };
    // muscle lines: under the chest, down the middle, three rows of abs, the navel
    for(const s of [-1,1]) ln([[s*13,133],[s*8,130],[s*1.5,130.5]],0.45,'rgba(150,80,50,.55)');
    ln([[0,129],[0,109]],0.4,'rgba(150,80,50,.45)');
    for(const z of [124,118.5,113]) for(const s of [-1,1]) ln([[s*1.2,z],[s*4,z+0.6],[s*6.5,z+0.2]],0.38,'rgba(150,80,50,.45)');
    ln([[0,107.2],[0,106.6]],0.6,'rgba(120,60,40,.6)');
    // the X-shaped scar, stitched
    for(const s of [-1,1]){ ln([[s*-8.5,146],[s*8.5,128]],1.3,'#b0503e'); ln([[s*-8.5,146],[s*8.5,128]],0.45,'#e08a74'); }
    for(let i=0;i<5;i++) for(const s of [-1,1]){ const t=0.12+i*0.19, c=s*(-8.5+17*t), z=146-18*t; ln([[c-1.1,z-1.1*s],[c+1.1,z+1.1*s]],0.3,'#8a3a2a'); }
    // yellow buttons down the edge of the open shirt
    for(const z of [146,138,130,122]) d.dot(-(b.openW[0]+(152-z)*b.openW[1]+1.4),z,0.85,'#f2c81e','#8a6a10'); },
  saitamaZip:d=>{ d.band(-0.2,0.2,106,151.5,'#b8960a'); d.rect(-0.7,148.5,1.4,3,'#d8b418','#8a6a10'); },
  gokuGi:(d,b)=>{ const x=d.x; x.fillStyle=b.sleeve; x.beginPath(); x.moveTo(d.X(-8,153),d.Y(153)); x.lineTo(d.X(0,129),d.Y(129)); x.lineTo(d.X(8,153),d.Y(153)); x.fill();
    x.strokeStyle='#c45a0e'; x.lineWidth=d.s*0.6; x.beginPath(); x.moveTo(d.X(-8.4,153),d.Y(153)); x.lineTo(d.X(0,128.5),d.Y(128.5)); x.lineTo(d.X(8.4,153),d.Y(153)); x.stroke();
    d.kanji(9,140,3.8,'悟'); },
  gokuBack:d=>d.kanji(0,138,6.5,'悟'),
  erenFront:(d,b)=>{ const x=d.x; x.fillStyle=b.inner; x.beginPath(); x.moveTo(d.X(-6.5,152),d.Y(152)); x.lineTo(d.X(-5,127),d.Y(127)); x.lineTo(d.X(5,127),d.Y(127)); x.lineTo(d.X(6.5,152),d.Y(152)); x.fill();
    for(const s of [-1,1]) d.band(s*6.6-0.6,s*6.6+0.6,127,151,'#7a5630');
    const st='#4a2f1e'; for(const s of [-1,1]) d.band(s*4.5-0.8,s*4.5+0.8,106,152,st); d.band(-11,11,132.2,134,st);
    for(const s of [-1,1]) d.rect(s*4.5-1,132,2,2.2,'#b8bcc2','#5a5f66');
    d.img(window.__wingsCv||(window.__wingsCv=wingsCanvas()),10.5,141,4.6); },
  tanjiroFront:(d,b)=>{ d.open(b.top,b.openW[0],b.openW[1],106); for(const z of [146,138,130,122,114]) d.dot(0,z,0.75,'#d4b040','#6a5010'); },
  lightFront:(d,b)=>{ const x=d.x, V=[[-7.5,152.5],[0,121],[7.5,152.5]];
    x.fillStyle='#f4f2ee'; x.beginPath(); V.forEach(([c,z])=>x.lineTo(d.X(c,z),d.Y(z))); x.fill();
    for(const s of [-1,1]){ x.fillStyle='#e2e0da'; x.strokeStyle='#9a9890'; x.lineWidth=d.s*0.15; x.beginPath(); x.moveTo(d.X(s*1.2,152),d.Y(152)); x.lineTo(d.X(s*6.8,152.5),d.Y(152.5)); x.lineTo(d.X(s*3.6,146.5),d.Y(146.5)); x.closePath(); x.fill(); x.stroke(); }
    x.fillStyle=b.tie||'#3a3d46'; x.beginPath(); for(const [c,z] of [[-1.5,151],[1.5,151],[1,148],[-1,148]]) x.lineTo(d.X(c,z),d.Y(z)); x.fill();
    x.beginPath(); for(const [c,z] of [[-1,148],[1,148],[2,123],[0,121.4],[-2,123]]) x.lineTo(d.X(c,z),d.Y(z)); x.fill();
    x.strokeStyle='rgba(255,255,255,.12)'; x.lineWidth=d.s*0.35; for(let z=124;z<147;z+=3.2){ x.beginPath(); x.moveTo(d.X(-1.8,z),d.Y(z)); x.lineTo(d.X(1.8,z+1.6),d.Y(z+1.6)); x.stroke(); }
    // lapels: a darker fold of the jacket along each side of the V, with a notch
    for(const s of [-1,1]){ x.fillStyle=b.lapel||'#7b85ad'; x.beginPath(); for(const [c,z] of [[7.5,152.5],[11.5,147],[10,145.5],[10.6,140],[2.2,124],[0.2,121]]) x.lineTo(d.X(s*c,z),d.Y(z)); x.fill(); }
    for(const z of [117.5,109.5]) d.dot(0,z,0.75,'#2a2c36','#14151a');
    x.strokeStyle='rgba(40,44,60,.6)'; x.lineWidth=d.s*0.25; x.beginPath(); x.moveTo(d.X(8,137),d.Y(137)); x.lineTo(d.X(12.5,137.6),d.Y(137.6)); x.stroke(); },
};
function decalCanvas(spec,b){
  const s=10, R=17, w=Math.round(2*spec.a*R*s), h=Math.round((spec.z1-spec.z0)*s), cv=document.createElement('canvas'); cv.width=w; cv.height=h; const x=cv.getContext('2d');
  const d={x,s,w,h,X:(c,z)=>w/2+c/(torsoAt(b.build,z==null?140:z).rx*spec.a)*(w/2),Y:z=>(spec.z1-z)*s};
  d.band=(c0,c1,z0,z1,col)=>{ x.fillStyle=col; x.beginPath(); for(let z=z0;z<=z1;z+=2) x.lineTo(d.X(c0,z),d.Y(z)); for(let z=z1;z>=z0;z-=2) x.lineTo(d.X(c1,z),d.Y(z)); x.lineTo(d.X(c1,z0),d.Y(z0)); x.fill(); };
  d.rect=(c,z,cw,ch,col,line)=>{ const X0=d.X(c,z), X1=d.X(c+cw,z); x.fillStyle=col; x.fillRect(X0,d.Y(z+ch),X1-X0,ch*s); if(line){ x.strokeStyle=line; x.lineWidth=s*0.15; x.strokeRect(X0,d.Y(z+ch),X1-X0,ch*s); } };
  d.dot=(c,z,r,col,line)=>{ x.fillStyle=col; x.beginPath(); x.arc(d.X(c,z),d.Y(z),r*s,0,7); x.fill(); if(line){ x.strokeStyle=line; x.lineWidth=s*0.18; x.stroke(); } };
  d.kanji=(c,z,r,ch)=>{ d.dot(c,z,r,'#ffffff','#141414'); x.lineWidth=s*0.35; x.stroke(); x.fillStyle='#141414'; x.font=`bold ${r*1.45*s}px serif`; x.textAlign='center'; x.textBaseline='middle'; x.fillText(ch,d.X(c,z),d.Y(z)+r*0.08*s); };
  d.open=(col,w0,k,lo)=>{ x.fillStyle=col; x.beginPath(); for(let z=lo;z<=152.6;z+=1) x.lineTo(d.X(-(w0+(152-z)*k),z),d.Y(z)); for(let z=152.6;z>=lo;z-=1) x.lineTo(d.X(w0+(152-z)*k,z),d.Y(z)); x.fill(); };
  d.img=(im,c,z,size)=>x.drawImage(im,d.X(c,z)-size*s/2,d.Y(z)-size*s/2,size*s,size*s);
  DECALS[spec.d](d,b); return cv;
}

function bodyGeometry(T,skel,b){
  const nm=n=>n.replace(/^mixamorig:?/,''), idx={}, at={};
  skel.bones.forEach((bn,i)=>{ idx[nm(bn.name)]=i; at[nm(bn.name)]=new T.Vector3().setFromMatrixPosition(new T.Matrix4().copy(skel.boneInverses[i]).invert()); });
  if(!BIND){ BIND={}; for(const k in at) BIND[k]={x:at[k].x,y:at[k].y,z:at[k].z}; }
  const bd=BUILDS[b.build]||BUILDS.avg, AM=bd.arm, LM=bd.leg;
  const P=[], N=[], F=[], SI=[], SW=[], I=[], c=new T.Color(), V=(x,y,z)=>new T.Vector3(x,y,z);
  const K=(bone,p,rx,ry)=>({bone:idx[bone]!=null?idx[bone]:idx.Hips,p,rx,ry});
  // sweeps a tube through the keys; ref is where the ry radius points (the front, or up for feet). o.a0/a1 leave
  // a tube open (a coat's front), o.cap<0 leaves its ends open, o.w(p) overrides the skin weights
  function tube(keys,ref,paint,o={}){
    const seg=o.seg||16, capK=o.cap==null?1:o.cap, a0=o.a0==null?Math.PI/2-Math.PI/seg:o.a0, a1=o.a1==null?a0+Math.PI*2:o.a1, R=[];
    for(let k=0;k<keys.length-1;k++){ const A=keys[k], B=keys[k+1], n=Math.max(2,Math.ceil(A.p.distanceTo(B.p)/2.5));
      for(let j=0;j<n;j++){ const t=j/n; R.push({p:A.p.clone().lerp(B.p,t),rx:A.rx+(B.rx-A.rx)*t,ry:A.ry+(B.ry-A.ry)*t,k,t}); } }
    const Z=keys[keys.length-1]; R.push({p:Z.p.clone(),rx:Z.rx,ry:Z.ry,k:keys.length-2,t:1});
    R.forEach((r,i)=>{ const a=R[Math.max(0,i-1)].p, z=R[Math.min(R.length-1,i+1)].p; r.d=z.clone().sub(a).normalize(); });
    // round both ends off with shrinking rings
    const cap=(r,dir)=>{ const out=[]; for(let q=1;q<=4;q++){ const f=q/4, s=Math.cos(f*Math.PI/2)||0.001, m=Math.min(r.rx,r.ry)*Math.sin(f*Math.PI/2)*capK;
      out.push(Object.assign({},r,{p:r.p.clone().addScaledVector(r.d,dir*m),rx:r.rx*s,ry:r.ry*s})); } return out; };
    const rings=capK>0?[...cap(R[0],-1).reverse(),...R,...cap(R[R.length-1],1)]:R, base=P.length/3;
    for(const r of rings){
      const fr=ref.clone().addScaledVector(r.d,-ref.dot(r.d)).normalize(), sd=new T.Vector3().crossVectors(fr,r.d).normalize(); r.fr=fr; r.sd=sd;
      // weights: the span's bone, easing into the next joint's bone toward its end and out of the last one at its start
      const A=keys[r.k], B=keys[r.k+1], Pk=keys[r.k-1], w=[[A.bone,1]];
      if(B.bone!==A.bone){ const x=0.5*ss(0.55,1,r.t); w[0][1]-=x; w.push([B.bone,x]); }
      if(Pk&&Pk.bone!==A.bone){ const x=0.5*(1-ss(0,0.45,r.t)); w[0][1]-=x; w.push([Pk.bone,x]); }
      r.w=w;
      for(let s=0;s<=seg;s++){ const an=a0+(a1-a0)*s/seg, cs=Math.cos(an), sn=Math.sin(an);
        const p=r.p.clone().addScaledVector(sd,cs*r.rx).addScaledVector(fr,sn*r.ry), n=sd.clone().multiplyScalar(cs/r.rx).addScaledVector(fr,sn/r.ry).normalize();
        P.push(p.x,p.y,p.z); N.push(n.x,n.y,n.z); const ww=o.w?o.w(p,n):w;
        for(let q=0;q<4;q++){ SI.push(ww[q]?ww[q][0]:0); SW.push(ww[q]?Math.max(0,ww[q][1]):0); } } }
    const v=i=>V(P[i*3],P[i*3+1],P[i*3+2]), nv=i=>V(N[i*3],N[i*3+1],N[i*3+2]);
    // wind every quad to face outward (checked against its own normals: tubes run in different directions)
    const R2=Math.floor(rings.length/2), q0=base+R2*(seg+1)+2, flip=v(q0+seg+1).sub(v(q0)).cross(v(q0+1).sub(v(q0))).dot(nv(q0))<0;
    for(let r=0;r<rings.length-1;r++) for(let s=0;s<seg;s++){ const a=base+r*(seg+1)+s, b2=a+seg+1;
      if(flip) I.push(a,a+1,b2, a+1,b2+1,b2); else I.push(a,b2,a+1, a+1,b2,b2+1);
      // clothes are painted per quad, from its middle, so every hem and cuff is a crisp cel-shaded edge
      const m=V(0,0,0), n=V(0,0,0); for(const i of [a,a+1,b2,b2+1]){ m.add(v(i)); n.add(nv(i)); } m.multiplyScalar(0.25);
      c.set(paint(m,n.normalize(),a0+(a1-a0)*(s+0.5)/seg)); F.push(c.r,c.g,c.b,c.r,c.g,c.b); }
    return rings;
  }
  const sk=b.skin, top=b.top, FRONT=V(0,1,0), UPV=V(0,0,1), y=n=>at[n]?at[n].y:0;
  const ck=b.check, chkAt=(an,z,cell=7)=>ck[chk(Math.floor(an/(Math.PI/8)),Math.floor(z/cell))];
  // torso and neck
  const torso=tube(TORSO.map(([bn,z,dy],i)=>K(bn,V(0,y(bn)+dy,z),bd.torso[i][0],bd.torso[i][1])),FRONT,(p,n,an)=>{
    const z=p.z, bz=b.beltZ||[103,108.5];
    if(z>151.5) return b.collar||sk;
    if(b.belt&&z>bz[0]&&z<bz[1]) return b.belt;
    if(z<106) return b.pants;
    if(b.cut==='open'&&n.y>0.2&&Math.abs(p.x)<b.openW[0]+(152-z)*b.openW[1]) return b.inner;
    if(b.cut==='below'&&z<b.jacketEnd) return b.inner;
    if(b.upper&&z>(b.upperZ||142)) return b.upper;
    return ck?chkAt(an,z):top; },{seg:32,cap:0.3}); // a flat seat: a round end would hang between the legs
  // a coat's skirt below the waist: flares over the hips and follows the thighs as they swing
  if(b.coat){ const C=b.coat, t0=torsoAt(b.build,107), hy=y('Hips')+0.5, fl=C.flare||3, g=C.gap||0.1, Hi=idx.Hips, Ll=idx.LeftUpLeg, Rl=idx.RightUpLeg;
    tube([K('Hips',V(0,hy,107.5),t0.rx+0.7,t0.ry+0.7),K('Hips',V(0,hy,99),Math.max(t0.rx+2.2,21),Math.max(t0.ry+1.6,13.6)),K('Hips',V(0,hy,C.hem),21.5+fl,14.2+fl*0.6)],FRONT,(p,n,an)=>C.check?chkAt(an,p.z):top,
      {seg:28,cap:-1,a0:Math.PI/2+g,a1:Math.PI*2.5-g,w:p=>{ const t=ss(104,C.hem,p.z)*0.75*(0.4+0.6*Math.max(0,(p.y-hy)/14)), fl2=Math.min(1,Math.max(0,0.5-p.x/24)); return [[Hi,1-t],[Ll,t*fl2],[Rl,t*(1-fl2)]]; }}); }
  for(const s of [-1,1]){ const L=s<0?'Left':'Right', x=v=>s*v;
    // legs
    tube([K(L+'UpLeg',V(x(9.4),0,104),10*LM,10.2*LM),K(L+'UpLeg',V(x(9.8),0.5,94),10.4*LM,10.8*LM),K(L+'UpLeg',V(x(9.9),1,76),8.8*LM,9.2*LM),K(L+'Leg',V(x(9.9),1.5,57.5),6.6*LM,6.9*LM),
          K(L+'Leg',V(x(9.9),0.6,44),7*LM,7.8*LM),K(L+'Leg',V(x(9.8),-1.6,21),4.8,5),K(L+'Foot',V(x(9.8),-2.8,13.2),5,5.3)],FRONT,p=>{
      const z=p.z, st=b.shoeTop||0;
      if(z<st) return b.shoes;
      for(const [bz,h,col] of b.legBands||[]) if(Math.abs(z-bz)<h) return col;
      if(b.legs==='knee'){ if(z<52) return sk; if(b.cuffBand&&z<55.5) return b.cuffBand; }
      if(b.wrap&&z<(b.wrapZ||46)) return b.wrap;
      if(b.sandals&&z<13.5) return b.toe||sk;
      return b.pants; });
    // feet: shoes, or sandals (sole, straps, bare toes or white tabi)
    tube([K(L+'Foot',V(x(9.8),-6.5,7.4),4.8,5.4),K(L+'Foot',V(x(10.2),2,5.4),5.6,5),K(L+'ToeBase',V(x(11.4),12.5,3.6),5.4,3.6),K(L+'ToeBase',V(x(11.8),17.5,3.2),4.4,2.8)],UPV,p=>{
      if(!b.sandals) return b.shoes;
      if(p.z<2.3) return b.sole||b.shoes;
      if(p.y>3&&p.y<7||p.y<-3&&p.z<9.5&&p.z>6.5) return b.strap||b.sole;
      return b.toe||sk; },{seg:14});
    // arms and hands
    const H=at[L+'Hand']||V(x(68),-5.7,147.9), hy=H.y, hz=H.z;
    tube([K(L+'Shoulder',V(x(8),-5.8,149.5),7*AM,7*AM),K(L+'Arm',V(x(20.9),hy,hz),6.8*AM,6.9*AM),K(L+'Arm',V(x(31),hy,hz),6.1*AM,6.2*AM),K(L+'ForeArm',V(x(44),hy,hz),4.9*AM,5.1*AM),
          K(L+'ForeArm',V(x(53),hy,hz),5.2*AM,5.5*AM),K(L+'ForeArm',V(x(65),hy,hz),3.7*Math.sqrt(AM),4.2*Math.sqrt(AM)),K(L+'Hand',V(x(68.1),hy-0.6,hz),2.8,4.3),K(L+'Hand',V(x(76),hy-0.9,hz),2.6,5),
          K(L+'HandMiddle1',V(x(82.6),hy-0.9,hz),1.9,4.5),K(L+'HandMiddle2',V(x(86),hy-0.9,hz),1.6,4.1),K(L+'HandMiddle3',V(x(89.5),hy-0.9,hz),1.2,3.3)],FRONT,p=>{
      const ax=Math.abs(p.x), sl=b.sleeves||'long', lim=sl==='long'?66:sl==='short'?33:sl==='elbow'?47:22;
      if(ax>66.5) return b.gloves||sk;
      if(b.cuff&&ax>(b.cuffFrom||58)) return b.cuff;
      if(ax>=lim) return sk;
      if(b.roll&&ax>lim-3.5) return b.roll;
      if(ax<22) return b.upper&&p.z>(b.upperZ||142)-2?b.upper:top;
      if(b.upper&&ax<26) return b.upper;
      return b.sleeve||top; },{seg:12});
    const t1=at[L+'HandThumb1'], t2=at[L+'HandThumb2'];
    if(t1&&t2) tube([K(L+'HandThumb1',t1.clone().add(V(x(-2),0,0)),1.5,1.6),K(L+'HandThumb2',t2,1.3,1.4),K(L+'HandThumb'+(idx[L+'HandThumb3']!=null?3:2),t2.clone().lerp(t1,-1),1.1,1.1)],UPV,()=>b.gloves||sk,{seg:10});
    // a haori's wide sleeves, hanging open below the arm
    if(b.sleeveShell) tube([K(L+'Arm',V(x(16),hy,hz-0.5),7.6,8.4),K(L+'Arm',V(x(30),hy,hz-1.6),9,10.4),K(L+'ForeArm',V(x(44),hy,hz-2.6),9.6,11.2),K(L+'ForeArm',V(x(49),hy,hz-2.8),9.8,11.4)],UPV,
      (p,n,an)=>ck?ck[chk(Math.floor(an/(Math.PI/4)),Math.floor(Math.abs(p.x)/6.5))]:top,{seg:16,cap:-1});
  }
  // decals: a thin skin over the torso, skinned exactly like it, with a painted texture
  const D=[]; // [positions, normals, uvs, skin indices, weights] per decal
  for(const spec of b.decals||[]){
    const ctr=spec.side?Math.PI*1.5:Math.PI/2, A0=ctr-spec.a, nu=Math.ceil(spec.a*16), nv=Math.ceil((spec.z1-spec.z0)/1.4), main=torso.filter(r=>r.t!=null&&r.p.z>=96.9);
    const at2=z=>{ let j=main.findIndex(r=>r.p.z>=z); j=Math.max(1,j<0?main.length-1:j); const A=main[j-1], B=main[j], t=Math.max(0,Math.min(1,(z-A.p.z)/(B.p.z-A.p.z)||0)), wm={};
      for(const [bn,w] of A.w) wm[bn]=(wm[bn]||0)+w*(1-t); for(const [bn,w] of B.w) wm[bn]=(wm[bn]||0)+w*t;
      return {p:A.p.clone().lerp(B.p,t),rx:A.rx+(B.rx-A.rx)*t,ry:A.ry+(B.ry-A.ry)*t,fr:A.fr.clone().lerp(B.fr,t).normalize(),sd:A.sd.clone().lerp(B.sd,t).normalize(),w:Object.entries(wm).sort((p,q)=>q[1]-p[1]).slice(0,4)}; };
    const g=[[],[],[],[],[]], grid=[];
    for(let j=0;j<=nv;j++){ const z=spec.z0+(spec.z1-spec.z0)*j/nv, r=at2(z), row=[];
      for(let i=0;i<=nu;i++){ const an=A0+2*spec.a*i/nu, cs=Math.cos(an), sn=Math.sin(an), off=0.22;
        const p=r.p.clone().addScaledVector(r.sd,cs*(r.rx+off)).addScaledVector(r.fr,sn*(r.ry+off)), n=r.sd.clone().multiplyScalar(cs/r.rx).addScaledVector(r.fr,sn/r.ry).normalize();
        row.push({p,n,u:i/nu,v:j/nv,w:r.w}); } grid.push(row); }
    const put=q=>{ g[0].push(q.p.x,q.p.y,q.p.z); g[1].push(q.n.x,q.n.y,q.n.z); g[2].push(q.u,q.v); for(let k=0;k<4;k++){ g[3].push(q.w[k]?+q.w[k][0]:0); g[4].push(q.w[k]?q.w[k][1]:0); } };
    for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a=grid[j][i], b2=grid[j][i+1], c2=grid[j+1][i], d2=grid[j+1][i+1];
      const fl=b2.p.clone().sub(a.p).cross(c2.p.clone().sub(a.p)).dot(a.n)<0; for(const q of fl?[a,c2,b2,b2,c2,d2]:[a,b2,c2,b2,d2,c2]) put(q); }
    D.push(g); }
  // unrolled: each triangle gets its own three corners so it can carry one colour
  const n=I.length, nd=D.reduce((s,g)=>s+g[0].length/3,0), tot=n+nd, a3=new Float32Array(tot*3), n3=new Float32Array(tot*3), c3=new Float32Array(tot*3).fill(1), u2=new Float32Array(tot*2), i4=new Uint16Array(tot*4), w4=new Float32Array(tot*4);
  for(let k=0;k<n;k++){ const v=I[k], f=Math.floor(k/3);
    for(let q=0;q<3;q++){ a3[k*3+q]=P[v*3+q]; n3[k*3+q]=N[v*3+q]; c3[k*3+q]=F[f*3+q]; }
    for(let q=0;q<4;q++){ i4[k*4+q]=SI[v*4+q]; w4[k*4+q]=SW[v*4+q]; } }
  const geo=new T.BufferGeometry(); let o=n; geo.addGroup(0,n,0);
  D.forEach((g,k)=>{ const m=g[0].length/3; a3.set(g[0],o*3); n3.set(g[1],o*3); u2.set(g[2],o*2); i4.set(g[3],o*4); w4.set(g[4],o*4); geo.addGroup(o,m,k+1); o+=m; });
  geo.setAttribute('position',new T.BufferAttribute(a3,3)); geo.setAttribute('normal',new T.BufferAttribute(n3,3)); geo.setAttribute('color',new T.BufferAttribute(c3,3)); geo.setAttribute('uv',new T.BufferAttribute(u2,2));
  geo.setAttribute('skinIndex',new T.BufferAttribute(i4,4)); geo.setAttribute('skinWeight',new T.BufferAttribute(w4,4));
  geo.userData.decals=(b.decals||[]).map(spec=>decalCanvas(spec,b));
  return geo;
}
// anime cel shading: three flat bands of light
let toonRamp=null;
function ramp(T){ if(!toonRamp){ toonRamp=new T.DataTexture(new Uint8Array([40,40,40,255,64,64,64,255,86,86,86,255]),3,1,T.RGBAFormat); toonRamp.minFilter=toonRamp.magFilter=T.NearestFilter; toonRamp.generateMipmaps=false; toonRamp.needsUpdate=true; } return toonRamp; }
function bodyMaterial(T,geo){ const body=new T.MeshToonMaterial({vertexColors:true,gradientMap:ramp(T),skinning:true,side:T.DoubleSide}), dc=geo&&geo.userData.decals||[];
  if(!dc.length) return body;
  return [body,...dc.map(cv=>{ const t=new T.CanvasTexture(cv); t.anisotropy=4; return new T.MeshToonMaterial({map:t,gradientMap:ramp(T),skinning:true,transparent:true,alphaTest:0.5,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}); })]; }
// the ink line round a mesh: the same mesh drawn inside out and pushed out along its normals by w
function inkMat(T,w,skinning){ const m=new T.MeshBasicMaterial({color:0x15151a,side:T.BackSide,skinning:!!skinning});
  m.onBeforeCompile=sh=>{ sh.uniforms.inkW={value:w}; sh.vertexShader='uniform float inkW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n  transformed += normal * inkW;'); }; return m; }
let bodyInk=null, hiddenM=null;
function bodyOutline(T,geo){ bodyInk=bodyInk||inkMat(T,0.6,true); const dc=geo&&geo.userData.decals||[];
  if(!dc.length) return bodyInk; hiddenM=hiddenM||new T.MeshBasicMaterial({visible:false}); return [bodyInk,...dc.map(()=>hiddenM)]; }

// ---------------------------------------------------------------- anime heads and hair
// Heads are sculpted, not spheres: a unit sphere bent into an anime head (a V jaw and pointed chin, a flat face, a
// full skull), in the Head bone's frame (+X the character's left, +Y up, +Z the face). Hair is a cap over the skull
// plus tapered locks that bend and hug the head, all one mesh per style so a crowd of bots stays cheap.
const HD=[0.094,0.106,0.1], HCN=[0,0.098,0.02];
function headPt(x,y,z){ // a point on the unit sphere -> the same point on the anime head (gear metres, centred)
  if(y<0){ const t=Math.min(1,-y); x*=1-0.42*Math.pow(t,1.6); if(z>0){ y*=1+0.35*t*z; z*=1-0.05*t; z+=0.1*t*t*t; } else z*=1-0.3*t*t; }
  else if(z<0) z*=1+0.06*y;
  if(z>0.45) z=0.45+(z-0.45)*0.7;
  return [x*HD[0],y*HD[1],z*HD[2]]; }
const dirOf=(az,el)=>[Math.sin(az)*Math.cos(el),Math.sin(el),Math.cos(az)*Math.cos(el)];
const headAt=(az,el,k=1)=>headPt(...dirOf(az,el)).map(v=>v*k);
// a surface from f(u,v) -> [x,y,z] (u wraps around, v runs top to bottom), with normals facing away from the origin
function gridGeo(T,nu,nv,f,col){
  const P=[], N=[], UV=[], C=[], I=[], e=1e-3, A=new T.Vector3(), B=new T.Vector3(), n=new T.Vector3();
  for(let j=0;j<=nv;j++) for(let i=0;i<=nu;i++){ const u=i/nu, v=j/nv, p=f(u,v); P.push(p[0],p[1],p[2]); UV.push(u,1-v);
    const a=f(u+e,v), b=f(u-e,v), c=f(u,Math.min(1,v+e)), d=f(u,Math.max(0,v-e)); A.set(a[0]-b[0],a[1]-b[1],a[2]-b[2]); B.set(c[0]-d[0],c[1]-d[1],c[2]-d[2]); n.crossVectors(A,B);
    if(n.lengthSq()<1e-16) n.set(p[0],p[1],p[2]); if(n.x*p[0]+n.y*p[1]+n.z*p[2]<0) n.negate(); n.normalize(); N.push(n.x,n.y,n.z);
    if(col){ const cc=col(u,v); C.push(cc.r,cc.g,cc.b); } }
  for(let j=0;j<nv;j++) for(let i=0;i<nu;i++){ const a=j*(nu+1)+i, b=a+nu+1; I.push(a,b,a+1, a+1,b,b+1); }
  return orient({P,N,UV,C,I}); }
// flip the winding if the triangles face inward (the ink line is the back faces, so this matters)
function orient(m){ for(let t=0;t<m.I.length;t+=3){ const [a,b,c]=[m.I[t],m.I[t+1],m.I[t+2]], p=k=>[m.P[k*3],m.P[k*3+1],m.P[k*3+2]], A=p(a), B=p(b), C=p(c);
    const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]], v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]], x=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]], l=Math.hypot(...x);
    if(l<1e-12) continue; if(x[0]*m.N[a*3]+x[1]*m.N[a*3+1]+x[2]*m.N[a*3+2]<0) for(let q=0;q<m.I.length;q+=3){ const s=m.I[q+1]; m.I[q+1]=m.I[q+2]; m.I[q+2]=s; } break; }
  return m; }
function toGeo(T,m){ const g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(m.P,3)); g.setAttribute('normal',new T.Float32BufferAttribute(m.N,3));
  if(m.UV&&m.UV.length) g.setAttribute('uv',new T.Float32BufferAttribute(m.UV,2)); if(m.C&&m.C.length) g.setAttribute('color',new T.Float32BufferAttribute(m.C,3)); g.setIndex(m.I); return g; }
function merge(ms){ const o={P:[],N:[],UV:[],C:[],I:[]}; for(const m of ms){ const b=o.P.length/3; o.P.push(...m.P); o.N.push(...m.N); o.C.push(...m.C); for(const i of m.I) o.I.push(i+b); } return o; }
function headGeo(T){ return toGeo(T,gridGeo(T,48,32,(u,v)=>{ const az=-Math.PI+Math.PI*2*u, th=Math.PI*v; return headPt(Math.sin(th)*Math.sin(az),Math.cos(th),Math.sin(th)*Math.cos(az)); })); }
// one lock of hair: rooted under the cap at (a around from the face, e up from the eyes), heading o out, u up the
// head, s sideways, bending along b as it goes, never closer to the head than h; flat, tapering to a point
function lockMesh(L,c0,c1){
  const K=10, M=6, n0=headAt(L.a,L.e), root=n0.map(v=>v*(L.r||0.93)), nl=Math.hypot(n0[0]/HD[0]**2,n0[1]/HD[1]**2,n0[2]/HD[2]**2), nn=[n0[0]/HD[0]**2/nl,n0[1]/HD[1]**2/nl,n0[2]/HD[2]**2/nl];
  let ea=[nn[2],0,-nn[0]], el=Math.hypot(...ea); ea=el<1e-4?[1,0,0]:ea.map(v=>v/el); const no=[nn[1]*ea[2]-nn[2]*ea[1],nn[2]*ea[0]-nn[0]*ea[2],nn[0]*ea[1]-nn[1]*ea[0]];
  const o=L.o==null?1:L.o, u=L.u||0, s=L.s||0, d0=[0,1,2].map(k=>nn[k]*o+no[k]*u+ea[k]*s), dl=Math.hypot(...d0), dir=d0.map(v=>v/dl), b=L.b||[0,0,0], h=L.h||1.04, l=L.l, w=L.w||0.045;
  const pts=[]; for(let k=0;k<=K;k++){ const t=k/K;
    // c: the lock clings to the skull, sweeping down over it (and s sideways) and lifting off by c toward the tip
    if(L.c!=null){ const ang=l/0.1*t; pts.push(headAt(L.a+s*ang,L.e-ang,(k?h:L.r||0.93)+L.c*t*t)); continue; }
    let q=[0,1,2].map(i=>root[i]+dir[i]*l*t+b[i]*l*t*t);
    if(k>0){ const r=Math.hypot(q[0]/HD[0],q[1]/HD[1],q[2]/HD[2]), sp=headPt(q[0]/HD[0]/r,q[1]/HD[1]/r,q[2]/HD[2]/r), rs=Math.hypot(...sp), rq=Math.hypot(...q); if(rq<rs*h) q=q.map(v=>v*rs*h/rq); }
    pts.push(q); }
  const m={P:[],N:[],UV:[],C:[],I:[]};
  for(let k=0;k<=K;k++){ const t=k/K, p=pts[k], a=pts[Math.max(0,k-1)], z=pts[Math.min(K,k+1)]; let tg=[z[0]-a[0],z[1]-a[1],z[2]-a[2]]; const tl=Math.hypot(...tg)||1; tg=tg.map(v=>v/tl);
    const rl=Math.hypot(p[0]/HD[0]**2,p[1]/HD[1]**2,p[2]/HD[2]**2)||1; let nf=[p[0]/HD[0]**2/rl,p[1]/HD[1]**2/rl,p[2]/HD[2]**2/rl]; const dt=nf[0]*tg[0]+nf[1]*tg[1]+nf[2]*tg[2];
    nf=nf.map((v,i)=>v-dt*tg[i]); const nl2=Math.hypot(...nf)||1; nf=nf.map(v=>v/nl2); let bk=[tg[1]*nf[2]-tg[2]*nf[1],tg[2]*nf[0]-tg[0]*nf[2],tg[0]*nf[1]-tg[1]*nf[0]];
    const tw=(L.tw||0)*t; if(tw){ const cb=Math.cos(tw), sb=Math.sin(tw), b2=bk.map((v,i)=>v*cb+nf[i]*sb); nf=nf.map((v,i)=>v*cb-bk[i]*sb); bk=b2; }
    const pr=L.sf?Math.pow(1-Math.pow(t,2.2),0.65)*(1+0.1*Math.sin(Math.PI*t)):Math.pow(1-t,0.85)*(1+0.3*Math.sin(Math.PI*t)), // sf: a soft, rounded end instead of a point
      wd=w*pr, th=w*(L.th||0.42)*pr, cc=c1?ss(0.3,1,t):0;
    for(let q=0;q<M;q++){ const f=q/M*Math.PI*2, cs=Math.cos(f), sn=Math.sin(f);
      m.P.push(...[0,1,2].map(i=>p[i]+bk[i]*cs*wd+nf[i]*sn*th));
      if(wd<1e-5) m.N.push(...tg); else { const nv=[0,1,2].map(i=>bk[i]*cs/wd+nf[i]*sn/th), l2=Math.hypot(...nv); m.N.push(...nv.map(v=>v/l2)); }
      m.C.push(c0.r+(c1?(c1.r-c0.r)*cc:0),c0.g+(c1?(c1.g-c0.g)*cc:0),c0.b+(c1?(c1.b-c0.b)*cc:0)); } }
  for(let k=0;k<K;k++) for(let q=0;q<M;q++){ const a=k*M+q, b2=k*M+(q+1)%M, c2=a+M, d2=b2+M; m.I.push(a,c2,b2, b2,c2,d2); }
  return orient(m); }
// hair styles: hl is the hairline (angle down from the crown at the face, the sides and the nape); locks as above
const R=(n,a0,a1,f)=>Array.from({length:n},(_,i)=>{ const t=n===1?0.5:i/(n-1), a=a0+(a1-a0)*t, j=Math.sin(i*12.9898+n*3.1)*0.5; return Object.assign({a},f(a,j,i)); });
const RING=(n,f)=>Array.from({length:n},(_,i)=>{ const a=-Math.PI+(i+0.5)/n*Math.PI*2, j=Math.sin(i*12.9898+n*3.1)*0.5; return Object.assign({a},f(a,j,i)); });
const HAIR={
  naruto:{hl:[0.95,1.5,1.85],locks:()=>[
    ...RING(9,(a,j)=>({e:1.0+j*0.15,l:0.12+j*0.03,w:0.052,o:1,u:0.45,s:j*0.3,b:[0,0.22,-0.08]})),
    ...R(7,1.0,Math.PI*2-1.0,(a,j)=>({e:0.5+j*0.12,l:0.12+j*0.02,w:0.05,o:1,u:0.05,s:j*0.3,b:[0,0.06,-0.12]})),
    ...R(5,2.1,Math.PI*2-2.1,(a,j)=>({e:0.12,l:0.1,w:0.045,o:1,u:-0.45,s:j*0.3,b:[0,-0.08,-0.15]})),
    {a:Math.PI,e:1.38,l:0.13,w:0.055,o:1,u:0.35},{a:0,e:1.3,l:0.12,w:0.055,o:1,u:0.6,b:[0,0.15,-0.1]},
    ...R(3,-0.38,0.38,(a,j)=>({e:0.8,l:0.1,w:0.05,o:0.9,u:0.6,s:a*0.5,b:[0,0.15,0.05]})),
    ...[-0.85,-0.62,0.62,0.85].map(a=>({a,e:0.62,l:0.085,w:0.042,o:0.4,u:-1,s:Math.sign(a)*0.12,b:[0,-0.25,0.12],h:1.12})),
    ...[-1,1].map(s=>({a:s*1.55,e:0.3,l:0.1,w:0.046,o:0.8,u:-0.5,b:[0,-0.05,-0.05]}))]},
  luffy:{hl:[1.0,1.5,1.9],locks:()=>[
    ...R(7,-0.75,0.75,(a,j)=>({e:0.56,l:0.042+j*0.012,w:0.04,o:0.5,u:-1,s:j*0.45,b:[0,-0.2,0.1],h:1.08})),
    ...R(12,0.9,Math.PI*2-0.9,(a,j)=>({e:0.32+j*0.1,l:0.065+j*0.02,w:0.042,o:0.9,u:-0.6,s:j*0.7,h:1.0})),
    ...R(6,2.2,Math.PI*2-2.2,(a,j)=>({e:-0.02,l:0.055,w:0.036,o:0.7,u:-1,s:j*0.5})),
    ...[-1,1].map(s=>({a:s*1.45,e:0.12,l:0.06,w:0.035,o:0.6,u:-1,s:s*0.3}))]},
  goku:{hl:[0.95,1.45,1.75],locks:()=>[
    ...[[0.35,1.15,0.17,0.6,0.4],[-0.45,1.1,0.16,0.6,-0.4],[1.25,0.85,0.17,0.25,0.1],[-1.25,0.85,0.17,0.25,-0.1],[1.75,0.35,0.15,0,0],[-1.75,0.35,0.15,0,0],
        [2.35,0.8,0.17,0.3,0],[-2.35,0.8,0.17,0.3,0],[Math.PI,1.0,0.18,0.45,0],[2.75,0.3,0.15,-0.2,0],[-2.75,0.3,0.15,-0.2,0],[Math.PI,0.42,0.15,-0.1,0],
        [0,1.35,0.16,0.7,0],[2.0,1.25,0.15,0.5,0],[-2.0,1.25,0.15,0.5,0]].map(([a,e,l,u,s])=>({a,e,l,u,s,w:0.072,th:0.5,o:1,b:[0,0.1,-0.04]})),
    ...[[0,0.72,0.075,0.1],[-0.33,0.7,0.045,-0.3],[0.38,0.68,0.045,0.3],[-0.72,0.56,0.065,-0.4],[0.74,0.56,0.065,0.4]].map(([a,e,l,s])=>({a,e,l,s,w:0.052,o:0.45,u:-1,b:[0,-0.2,0.12],h:1.06})),
    ...[-1,1].map(s=>({a:s*1.45,e:0.12,l:0.07,w:0.035,o:0.4,u:-1}))]},
  eren:{hl:[0.92,1.55,2.0],locks:()=>[ // short, straight and layered, parted in the middle with pointed bangs
    ...R(14,0.6,Math.PI*2-0.6,(a,j)=>({e:1.45,l:0.17+j*0.03,w:0.075,th:0.5,c:0.02,s:j*0.12,h:1.06,sf:1})),
    ...R(8,1.5,Math.PI*2-1.5,(a,j)=>({e:0.8,l:0.11+j*0.02,w:0.07,o:0.2,u:-1,s:j*0.2,h:1.07})),
    ...[-1.35,-1.05,1.05,1.35].map(a=>({a,e:0.8,l:0.12,w:0.065,o:0.15,u:-1,s:-Math.sign(a)*0.1,b:[0,-0.3,0.05],h:1.08})),
    ...[-0.72,-0.46,-0.18,0.08,0.34,0.6].map((a,i)=>({a,e:1.25,l:[0.13,0.1,0.125,0.12,0.1,0.12][i],w:0.06,o:0.2,u:-1,s:a<0?-0.35:0.35,b:[0,-0.2,0.18],h:1.09}))]},
  gojo:{hl:[1.0,1.45,1.75],locks:()=>[
    ...RING(14,(a,j)=>({e:0.62,l:0.085+j*0.022,w:0.056,o:0.9,u:0.6,s:j*0.4,b:[0,0.2,-0.03]})),
    ...RING(10,(a,j)=>({e:1.0,l:0.09+j*0.022,w:0.06,o:0.9,u:0.6,s:j*0.35,b:[0,0.22,-0.03]})),
    ...RING(4,(a,j)=>({e:1.4,l:0.09,w:0.06,o:1,u:0.3,s:j*0.3,b:[0,0.15,0]})),
    ...R(3,-0.4,0.4,(a,j)=>({e:0.74,l:0.1,w:0.055,o:0.9,u:0.8,s:j*0.3,b:[0,0.2,0.06]})),
    ...[-1,1].map(s=>({a:s*0.28,e:0.55,l:0.07,w:0.034,o:0.4,u:-1,s:s*0.2,b:[0,-0.2,0.12],h:1.13}))]},
  tanjiro:{hl:[0.95,1.5,1.9],locks:()=>[ // thick, messy layers that fall outward in spiky points, dark at the roots and red at the tips
    ...R(11,0.6,Math.PI*2-0.6,(a,j)=>({e:1.4,l:0.15+j*0.03,w:0.075,th:0.5,c:0.07,s:j*0.25,h:1.07})),
    ...R(12,0.9,Math.PI*2-0.9,(a,j)=>({e:0.75+j*0.12,l:0.12+j*0.03,w:0.065,o:0.45,u:-1,s:j*0.6,b:[0,-0.1,0],h:1.08})),
    ...R(7,1.9,Math.PI*2-1.9,(a,j)=>({e:0.25,l:0.1,w:0.055,o:0.5,u:-1,s:j*0.4,h:1.05})),
    ...[-0.7,-0.4,-0.08,0.72].map((a,i)=>({a,e:1.15,l:[0.13,0.1,0.12,0.13][i],w:0.06,o:0.3,u:-1,s:a*0.3,b:[0,-0.2,0.15],h:1.08})), // a gap over the scar
    ...[-1,1].map(s=>({a:s*1.35,e:0.5,l:0.1,w:0.05,o:0.4,u:-1}))]},
  light:{hl:[0.9,1.55,2.05],locks:()=>[ // smooth, full layers: bangs to the eyes, sides over the ears to the jaw, back to the nape
    ...R(14,0.95,Math.PI*2-0.95,(a,j)=>({e:1.45,l:0.19+j*0.02,w:0.08,th:0.5,c:0.03,s:j*0.06,h:1.07,sf:1})),
    ...R(9,1.3,Math.PI*2-1.3,(a,j)=>({e:0.85,l:0.13+j*0.02,w:0.075,o:0.15,u:-1,s:j*0.15,b:[0,-0.25,-0.04],h:1.07,sf:1})),
    ...[-1.3,-1.0,1.0,1.3].map(a=>({a,e:0.85,l:0.15,w:0.07,o:0.15,u:-1,s:-Math.sign(a)*0.1,b:[0,-0.3,0.06],h:1.08,sf:1})),
    ...[-0.75,-0.48,-0.22,0.04,0.3,0.55,0.78].map((a,i)=>({a,e:1.3,l:[0.13,0.08,0.1,0.105,0.08,0.1,0.13][i],w:0.065,o:0.2,u:-1,s:a*0.35,b:[0,-0.25,0.2],h:1.09}))]},
};
function hairGeo(T,style,col,tipCol){
  const st=HAIR[style], c0=new T.Color(col), c1=tipCol?new T.Color(tipCol):null, [hf,hs,hb]=st.hl;
  const hl=az=>{ const c=Math.cos(az); return hs+(hf-hs)*Math.pow(Math.max(0,c),1.5)+(hb-hs)*Math.pow(Math.max(0,-c),1.5); };
  const cap=gridGeo(T,40,14,(u,v)=>{ const az=-Math.PI+Math.PI*2*u, th=v*hl(az); return headPt(Math.sin(th)*Math.sin(az),Math.cos(th),Math.sin(th)*Math.cos(az)).map(x=>x*1.035); },()=>c0);
  return toGeo(T,merge([cap,...st.locks().map(L=>lockMesh(L,c0,c1))]));
}

// ---------------------------------------------------------------- 3D gear
// anime heads: centre, radius and stretch of the head sphere in the Head bone's frame (big enough to hide the helmet)
let HC, HR, HS, SLIM=false; // set per call: the soldier's helmet needs a big head to hide it, the anime body a natural one
// Every builder returns [boneName, object] pairs. Objects are in metres in the bone's frame: +Y runs along
// the bone (up for the spine and head), +Z is the character's front.
function gear(T,kind,a,mats,opt){
  SLIM=!!(opt&&opt.slim); if(SLIM){ HC=[0,0.1,0.015]; HR=0.12; HS=[1.0,1.12,1.1]; } else { HC=[0,0.11,0.035]; HR=0.165; HS=[1.0,1.12,1.26]; }
  const L=(c,o={})=>{ const k=c+JSON.stringify(o); if(!mats[k]) mats[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:0.6,metalness:0.1},o)); return mats[k]; };
  const glowM=c=>L(c,{emissive:c,emissiveIntensity:1.4,roughness:0.4});
  const M=(geo,mat,x=0,y=0,z=0)=>{ const m=new T.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; return m; };
  const G=()=>new T.Group(), out=[];
  const TX=(k,f)=>mats['tex:'+k]||(mats['tex:'+k]=new T.CanvasTexture(f())); // painted textures are shared by everyone wearing them
  // anime pieces: toon materials, shared geometry, and an ink line (the mesh again, inside out, pushed out by w)
  const BLD=opt&&opt.build||'avg', TN=(c,o={})=>{ const k='toon'+c+JSON.stringify(o); return mats[k]||(mats[k]=new T.MeshToonMaterial(Object.assign({color:c,gradientMap:ramp(T)},o))); };
  const GEO=(k,f)=>mats['geo:'+k]||(mats['geo:'+k]=f(),mats['geo:'+k].userData.keep=true,mats['geo:'+k]), INKED=(m,w)=>{ const o=new T.Mesh(m.geometry,mats['ink'+w]||(mats['ink'+w]=inkMat(T,w))); m.add(o); return m; };
  switch(kind){
    case 'cape': { // hangs from the shoulders, flaring out; sways in the run (see swayCape)
      // narrow at the shoulders, flaring and folding toward the hem; the sides wrap toward the body
      // anime bodies: fitted to the build, wider at the shoulders and wrapping further round them
      const sh=SLIM?torsoAt(BLD,146):null, B2=BIND&&BIND.Spine2?BIND.Spine2.y:0, hw0=SLIM?(sh.rx+2.5)*CM:0.19, wrap=SLIM?0.12:0.07;
      const g=G(), geo=new T.PlaneGeometry(1,1,10,14), p=geo.attributes.position;
      for(let i=0;i<p.count;i++){ const u=p.getX(i), t=0.5-p.getY(i), hw=hw0+t*0.2, x=u*2*hw;
        p.setXYZ(i,x,-t*1.12,(u*2)*(u*2)*wrap*(1-t*0.4)-Math.sin(u*Math.PI*5)*0.022*t-0.01); }
      geo.computeVertexNormals();
      const o=M(geo,SLIM?TN(a[0],{side:T.BackSide}):L(a[0],{side:T.BackSide,roughness:0.75})), i=M(geo,SLIM?TN(a[1]):L(a[1],{side:T.FrontSide,roughness:0.8}));
      const hinge=G(); hinge.add(o,i); hinge.position.set(0,SLIM?0.15:0.17,SLIM?(sh.y-sh.ry-1.2-B2)*CM:-0.15); hinge.userData.cape='hang'; g.add(hinge);
      if(a[2]==='wings'){ const w=M(new T.PlaneGeometry(0.3,0.3),mats.wings||(mats.wings=new T.MeshStandardMaterial({map:TX('wings',wingsCanvas),transparent:true,alphaTest:0.5,roughness:0.7,polygonOffset:true,polygonOffsetFactor:-4})),0,-0.6,-0.035); w.rotation.y=Math.PI; hinge.add(w);
        const hd=INKED(M(GEO('hood',()=>new T.SphereGeometry(0.075,14,10).scale(1.7,0.6,0.85)),SLIM?TN(a[0]):L(a[0])),0.003); hd.position.set(0,0.165,SLIM?(sh.y-sh.ry-2.5-B2)*CM:-0.17); g.add(hd); } // the folded-down hood
      if(!SLIM||a[2]==='clasps') for(const s of [-1,1]){ const q=SLIM?onBone('Spine2',...torsoPt(BLD,s*8.5,152.5,false,0.9)):[s*0.17,0.19,0.08]; g.add(M(new T.SphereGeometry(SLIM?0.026:0.032,10,8).scale(1,1,SLIM?0.6:1),SLIM?TN('#2a2a2e'):L('#d4a43a',{metalness:0.8,roughness:0.3}),q[0],q[1],q[2])); }
      out.push(['Spine2',g]); break; }
    case 'emblem': {
      const tex=new T.CanvasTexture(emblemCanvas(a[0],a[1],a[2])); tex.anisotropy=4;
      const mat=new T.MeshStandardMaterial({map:tex,transparent:true,alphaTest:0.5,roughness:0.35,metalness:0.4,polygonOffset:true,polygonOffsetFactor:-4});
      if(a[3]){ mat.emissive=new T.Color(0xffffff); mat.emissiveMap=tex; mat.emissiveIntensity=0.7; }
      const m=M(new T.PlaneGeometry(SLIM?0.15:0.2,SLIM?0.15:0.2),mat,SLIM?0.07:0,0.07,SLIM?0.15:0.185); m.rotation.x=-0.12; out.push(['Spine2',m]); break; }
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
    case 'katana': { const g=G(), hip=a[1]==='hip'; // on the back, or at the left hip with the hilt forward (Tanjiro)
      if(hip){ g.position.set((torsoAt(BLD,104).rx+3)*CM,0.0,0.03); g.rotation.x=1.25; } else { g.position.set(0,0.0,SLIM?-0.165:-0.2); g.rotation.z=0.75; }
      g.add(M(new T.CylinderGeometry(0.022,0.026,0.82,8),L(a[0],{roughness:0.35,metalness:0.2}),0,-0.12,0));
      g.add(M(new T.CylinderGeometry(0.05,0.05,0.012,12),L('#c9a227',{metalness:0.9,roughness:0.3}),0,0.3,0));
      g.add(M(new T.CylinderGeometry(0.018,0.018,0.24,8),L('#141414',{roughness:0.9}),0,0.43,0));
      out.push([hip?'Hips':'Spine2',g]); break; }
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
    case 'belt': { const g=G(), r=M(new T.TorusGeometry(SLIM?0.2:0.17,0.025,6,28),L(a[0],{metalness:0.6,roughness:0.35}),0,0.05,0); r.rotation.x=Math.PI/2; r.scale.set(1,0.75,1); g.add(r);
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
    // ---- anime: sculpted head, hair and outfit pieces, cel shaded with an ink line to match the anime body
    case 'animeHead': { // [skin tone, face]
      const tex=TX('face'+a[1]+a[0],()=>faceCanvas(a[1],a[0])); tex.anisotropy=4;
      const g=G(), h=INKED(M(GEO('head',()=>headGeo(T)),mats['head'+a[1]+a[0]]||(mats['head'+a[1]+a[0]]=new T.MeshToonMaterial({map:tex,gradientMap:ramp(T)}))),0.0045);
      h.position.set(...HCN); g.add(h);
      for(const s of [-1,1]){ const p=headAt(s*Math.PI/2,-0.14), e=INKED(M(GEO('ear',()=>new T.SphereGeometry(0.018,12,10).scale(0.42,1.15,0.72)),TN(a[0])),0.003);
        e.position.set(HCN[0]+p[0]*0.97,HCN[1]+p[1],HCN[2]+p[2]-0.006); e.rotation.y=s*0.3; g.add(e); } // small ears, tucked close
      out.push(['Head',g]); break; }
    case 'animeHair': { // [style, colour, tip colour]
      const h=INKED(M(GEO('hair'+a.join(),()=>hairGeo(T,a[0],a[1],a[2])),mats.hairToon||(mats.hairToon=new T.MeshToonMaterial({vertexColors:true,gradientMap:ramp(T)}))),0.0035);
      h.position.set(...HCN); out.push(['Head',h]); break; }
    case 'leafband': { // [cloth, steel] the leaf-village forehead protector, fitted round the head over the hair cap
      const g=G(); g.position.set(...HCN);
      g.add(INKED(M(GEO('band',()=>toGeo(T,gridGeo(T,40,2,(u,v)=>headAt(-Math.PI+Math.PI*2*u,0.52-0.24*v,1.075)))),TN(a[0])),0.003));
      g.add(INKED(M(GEO('plate',()=>toGeo(T,gridGeo(T,12,3,(u,v)=>headAt(-0.52+1.04*u,0.56-0.31*v,1.1)))),mats.leafT||(mats.leafT=new T.MeshToonMaterial({map:TX('leaf',leafCanvas),gradientMap:ramp(T)}))),0.003));
      const k=headAt(Math.PI,0.4,1.08); g.add(M(new T.SphereGeometry(0.02,10,8).scale(1.2,0.9,0.7),TN(a[0]),k[0],k[1],k[2]));
      for(const s of [-1,1]){ const t=M(new T.BoxGeometry(0.034,0.2,0.006).translate(0,-0.1,0),TN(a[0]),k[0]+s*0.018,k[1],k[2]-0.006); t.rotation.set(0.2,0,s*0.22); t.userData.cape=true; g.add(t); }
      out.push(['Head',g]); break; }
    case 'blindfold': { // [cloth] Gojo's black band over the eyes
      const g=INKED(M(GEO('blind',()=>toGeo(T,gridGeo(T,40,2,(u,v)=>headAt(-Math.PI+Math.PI*2*u,0.24-0.36*v,1.05)))),TN(a[0])),0.003); g.position.set(...HCN); out.push(['Head',g]); break; }
    case 'strawHat': { // [straw, band] sized to sit over the hair
      const g=G(), straw=TN(a[0],{side:T.DoubleSide});
      g.add(INKED(M(GEO('crown',()=>new T.SphereGeometry(1,24,10,0,Math.PI*2,0,Math.PI/2).scale(HD[0]*1.22,0.088,HD[2]*1.26)),TN(a[0])),0.0035));
      const brim=M(GEO('brim',()=>{ const r=new T.RingGeometry(0.09,0.27,40,3).rotateX(-Math.PI/2).scale(1,1,1.08), p=r.attributes.position;
        for(let i=0;i<p.count;i++){ const d=Math.hypot(p.getX(i),p.getZ(i)); p.setY(i,-Math.max(0,d-0.15)*0.2); } r.computeVertexNormals(); return r; }),straw); g.add(brim);
      g.add(M(GEO('hatband',()=>new T.CylinderGeometry(1,1,0.032,28,1,true).translate(0,0.016,0).scale(HD[0]*1.235,1,HD[2]*1.275)),TN(a[1],{side:T.DoubleSide})));
      g.position.set(HCN[0],HCN[1]+HD[1]*0.42,HCN[2]-0.006); g.rotation.x=-0.12; out.push(['Head',g]); break; }
    case 'gloveCuff': for(const sd of ['Left','Right']){ // [colour] Saitama's flared red glove cuffs
      out.push([sd+'Hand',M(GEO('cuff',()=>new T.CylinderGeometry(0.058,0.068,0.06,18,1,true).translate(0,-0.035,0)),TN(a[0],{side:T.DoubleSide}))]); } break;
    case 'sash': { // [colour, 'left' | 'front'] a knot at the waist with two tails that swing
      const p=onBone('Hips',...torsoPt(BLD,a[1]==='left'?-9:0,105.5,false,1.4)), g=G(); g.position.set(...p); if(a[1]==='left') g.rotation.y=0.55;
      g.add(INKED(M(GEO('knot',()=>new T.SphereGeometry(0.026,12,8).scale(1.35,0.85,0.6)),TN(a[0])),0.003));
      for(const s of [-1,1]){ const t=M(GEO('tail',()=>new T.BoxGeometry(0.045,0.17,0.008).translate(0,-0.085,0)),TN(a[0]),s*0.012,-0.005,0.008); t.rotation.set(0.1,0,s*0.28); t.userData.cape=true; g.add(t); }
      out.push(['Hips',g]); break; }
    case 'buckle': { const b=M(GEO('buckle',()=>new T.CylinderGeometry(0.03,0.03,0.012,20).rotateX(Math.PI/2)),TN(a[0])); b.position.set(...onBone('Hips',...torsoPt(BLD,0,105.5,false,0.5))); out.push(['Hips',b]); break; }
    case 'collar': { // [style, colour] a stand-up collar round the neck, higher at the back
      const [rb,rt,y0,hf,hb]={naruto:[0.1,0.106,-0.04,0.045,0.07],gojo:[0.092,0.09,-0.045,0.045,0.1],tanjiro:[0.088,0.086,-0.035,0.03,0.06]}[a[0]];
      const geo=GEO('collar'+a[0],()=>toGeo(T,gridGeo(T,32,2,(u,v)=>{ const az=-Math.PI+Math.PI*2*u, h=hf+(hb-hf)*(1-Math.cos(az))/2, r=rb+(rt-rb)*(1-v);
        return [Math.sin(az)*r,y0+h*(1-v),Math.cos(az)*r*0.95]; })));
      out.push(['Neck',M(geo,TN(a[1],{side:T.DoubleSide}))]); break; }
    case 'earrings': { const mat=mats.hanafuda||(mats.hanafuda=new T.MeshToonMaterial({map:TX('hanafuda',hanafudaCanvas),gradientMap:ramp(T),side:T.DoubleSide}));
      for(const s of [-1,1]){ const p=headAt(s*Math.PI/2,-0.3), c=M(GEO('card',()=>new T.PlaneGeometry(0.032,0.05).translate(0,-0.03,0)),mat,HCN[0]+p[0]*0.98,HCN[1]+p[1],HCN[2]+p[2]-0.008); c.rotation.y=s*Math.PI/2; out.push(['Head',c]); } break; }
    case 'book': { const cover=mats.note||(mats.note=new T.MeshStandardMaterial({map:TX('note',noteCanvas),roughness:0.6})), dark=L('#121214',{roughness:0.6}), page=L('#ece6d6');
      const b=M(new T.BoxGeometry(0.03,0.2,0.14),[dark,dark,page,page,cover,dark],(torsoAt(BLD,100).rx+3.5)*CM,-0.02,0.02); b.rotation.set(0,Math.PI/2,0.1); out.push(['Hips',b]); break; }
    case 'odm': { // [steel, strap] the maneuver gear's blade boxes on the hips, in front of the cloak
      const st=L(a[0],{metalness:0.8,roughness:0.3}), dk=TN(a[1]), g=G(), X=(torsoAt(BLD,100).rx+4.5)*CM;
      for(const s of [-1,1]){ const bx=INKED(M(GEO('odmbox',()=>new T.BoxGeometry(0.05,0.1,0.25)),st,s*X,-0.08,0.04),0.003); bx.rotation.x=-0.22; g.add(bx);
        g.add(M(GEO('odmgrip',()=>new T.BoxGeometry(0.04,0.05,0.07)),dk,s*X,-0.03,0.19)); }
      out.push(['Hips',g]); break; }
    case 'tail': { const g=G(); for(let i=0;i<6;i++){ const r=0.06+Math.sin(i/5*Math.PI)*0.05; g.add(M(new T.SphereGeometry(r,10,8),L(i>3?a[1]:a[0],{roughness:0.9}),0,-i*0.07,-i*0.06-0.02)); }
      g.position.set(0,-0.05,-0.14); g.rotation.x=-0.5; g.userData.cape=true; out.push(['Hips',g]); break; }
  }
  return out;
}

window.SKINS={THEMES,ITEMS,paint,gear,emblemCanvas,bodyGeometry,bodyMaterial,bodyOutline,RAR_N:['Common','Uncommon','Rare','Epic','Legendary']};
})();
