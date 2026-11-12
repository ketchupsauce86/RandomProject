// Inverted sidekicks: 120 original little companions that follow you into both modes. Pets, aliens, lab
// creations, bots, sea critters, mythic beasts, spooks, bugs, elementals, sweets and a few made just for the box.
// Every one is built here out of three.js shapes (no model files) from one of 18 body plans, then dressed with
// ears, tails, horns, antennae, wings, hats and glows, and brought to life with its own idle, walk/fly cycle,
// blinks, look-arounds and a happy spin when you get an elimination. All names and designs are original.
(function(){
const TAU=Math.PI*2;
const THEMES=[
 {id:'pets',n:'Pets',c:'#ffb86b',d:'Good dogs, cool cats and a few fluffballs.'},
 {id:'aliens',n:'Aliens',c:'#7dff6a',d:'Visitors from very far away. They come in peace (mostly).'},
 {id:'lab',n:'Lab Creations',c:'#5cf0ff',d:'Grown in jars, zapped to life, and only slightly unstable.'},
 {id:'bots',n:'Bots & Drones',c:'#9fc8ff',d:'Beeps, boops and spinning propellers.'},
 {id:'ocean',n:'Deep Blue',c:'#2fd6c8',d:'They swim through the air like it is water.'},
 {id:'mythic',n:'Mythic',c:'#ff7a3a',d:'Tiny dragons and legendary beasts, pocket sized.'},
 {id:'spooky',n:'Spooky',c:'#b07cff',d:'Friendly ghosts and creepy cuties.'},
 {id:'bugs',n:'Bugs & Critters',c:'#a8e05a',d:'Buzzing, glowing and hopping along.'},
 {id:'elements',n:'Elementals',c:'#ffd23f',d:'Little spirits of fire, ice, storm and stone.'},
 {id:'sweets',n:'Sweets & Snacks',c:'#ff8fc8',d:'Sugar-coated sidekicks. Do not eat.'},
 {id:'inverted',n:'Inverted',c:'#5cf0ff',d:'Made for the box and nowhere else.'},
];
// body plans that walk beside your feet (the rest float by your shoulder)
const WALK={quad:1,blob:1,alien:1,sprout:1,jar:1,cube:1,crab:1};
const KIND_N={quad:'Pet',blob:'Blob',alien:'Little walker',sprout:'Sprout',jar:'Lab jar',cube:'Block buddy',crab:'Scuttler',bird:'Flyer',drone:'Drone',jelly:'Jelly',ghost:'Ghost',fish:'Swimmer',bug:'Bug',dragon:'Dragon',noodle:'Noodle',saucer:'Saucer',wisp:'Spirit',octo:'Tentacler'};

// [name, theme, rarity 0-4, body plan, [main, accent, extra], options, flavor]
// options: ears point|flop|round|long|tuft|gills · tail wag|fluff|curl|stub|long|spade|flame · eyes big|dot|glow|one|three|visor|happy|stalk|compound|angry
// mouth smile|grin|fang|o|cat|flat|none · horns nub|uni|curl|antler · ant ball|zig|glow · acc crown|tophat|party|bow|halo|goggles|headphones|dome|beanie|witch|flower|bandana|leaf|bolts|scarf|cap
// glow (colour) · alpha · s (size) · snout dog|pig|beak · body (a variant of the plan) · wing feather|bat|bug|butterfly · fly (a walker that floats) · spots (colour)
const RAW=[
 // ---------- Pets
 ['Biscuit','pets',0,'quad',['#e8a85a','#fff0d8','#3a2418'],{ears:'flop',tail:'wag',snout:'dog',mouth:'smile',cheeks:1},'A very good pup. The best pup. Follows you everywhere.'],
 ['Pepper','pets',0,'quad',['#2a2630','#f4f2ee','#7ad85a'],{ears:'point',tail:'long',eyeC:'#3a8a2a',mouth:'cat',whisk:1,leg:0.1},'Knocks things off shelves in zero-g. Nobody knows how.'],
 ['Mochi','pets',1,'quad',['#f6f2f4','#ffc8d8','#2a1a20'],{ears:'long',tail:'stub',mouth:'cat',cheeks:1,leg:0.07,body:'chunky'},'Soft, round and always chewing something.'],
 ['Waffles','pets',1,'quad',['#e88a3a','#fff4e8','#2a1a10'],{ears:'point',tail:'stub',snout:'dog',mouth:'smile',leg:0.06,body:'long'},'Short legs, big heart, very loud.'],
 ['Truffle','pets',1,'quad',['#ffb0c0','#ff8aa0','#2a1418'],{ears:'point',tail:'curl',snout:'pig',eyes:'dot',cheeks:1,leg:0.08},'Can sniff out a chest from across the island.'],
 ['Sprig','pets',2,'quad',['#f07a2a','#fff4ea','#2a1a10'],{ears:'point',tail:'fluff',snout:'dog',mouth:'smile',tailTip:'#fff4ea',paw:'#2a1a10'},'Quick, clever, and a little bit sneaky.'],
 ['Pudding','pets',0,'quad',['#f0c890','#fff4e0','#2a1a10'],{ears:'round',tail:'stub',eyes:'dot',cheeks:1,leg:0.05,body:'chunky',mouth:'o'},'Stores snacks in its cheeks for later.'],
 ['Puddles','pets',0,'bird',['#ffd84a','#ff9a2a','#2a1a10'],{eyes:'dot',cheeks:1,feet:1},'Learned to fly before it learned to quack.'],
 ['Captain Squawk','pets',2,'bird',['#e83a3a','#ffd23f','#2a6ad8'],{crest:1,eyes:'dot',tailC:'#2a6ad8',wingC:'#2a6ad8',acc:'bandana'},'Repeats everything you say, but louder.'],
 ['Professor Hoots','pets',2,'bird',['#8a6a4a','#f0dcc0','#ffb21a'],{ears:'tuft',eyes:'big',eyeC:'#ff9a1a',acc:'goggles',body:'round'},'Has read every book in the box twice.'],
 ['Shellby','pets',1,'quad',['#7ac85a','#3a7a3a','#c8e88a'],{shell:1,eyes:'dot',mouth:'smile',leg:0.05,tail:'stub',cheeks:1},'Slow and steady wins the storm.'],
 ['Bamboo Bao','pets',2,'quad',['#f6f6f2','#2a2630','#2a2630'],{ears:'round',earC:'#2a2630',patch:'#2a2630',tail:'stub',eyes:'dot',mouth:'smile',body:'chunky',leg:0.07,paw:'#2a2630'},'Naps a lot. Snacks a lot. Naps again.'],
 ['Gilly','pets',3,'quad',['#ffa8c8','#ff6aa0','#2a1420'],{ears:'gills',tail:'long',eyes:'dot',mouth:'smile',cheeks:1,leg:0.05,body:'long',glow:'#ff8ac0'},'Smiles all the time. Regrows anything.'],
 ['Woolly','pets',1,'quad',['#f6f4ee','#3a3430','#f6f4ee'],{fluffy:1,ears:'flop',earC:'#3a3430',headC:'#3a3430',tail:'stub',eyes:'dot',leg:0.08,paw:'#3a3430'},'A walking cloud. Bounces when it lands.'],
 ['Sir Barksalot','pets',4,'quad',['#f0c860','#fff4d0','#2a1a10'],{ears:'flop',tail:'wag',snout:'dog',mouth:'smile',acc:'crown',scarf:'#c8202c',glow:'#ffd23f'},'Knighted for bravery. Still chases its tail.'],
 // ---------- Aliens
 ['Zib','aliens',0,'alien',['#7ad84a','#c8f08a','#1a1420'],{ant:'ball',eyes:'big',mouth:'smile'},'Came for the storm. Stayed for the snacks.'],
 ['Glubb','aliens',1,'blob',['#a85aff','#e0b8ff','#1a1420'],{eyes:'three',mouth:'grin',alpha:0.82,core:'#ffd23f'},'Three eyes, zero worries.'],
 ['Quix','aliens',1,'alien',['#2ad8c0','#a8fff0','#1a1420'],{ant:'zig',eyes:'one',tall:1,mouth:'o'},'Sees everything with one very big eye.'],
 ['Blip','aliens',2,'saucer',['#c8ccd8','#ff5aa8','#5cf0ff'],{pilot:'#ff8ac0'},'A tiny pilot in a tiny saucer. Beeps hello.'],
 ['Orbit Ollie','aliens',2,'alien',['#ff9a3a','#ffe0b0','#1a1420'],{ant:'ball',acc:'dome',jet:1,fly:1,eyes:'big'},'Flies everywhere with a jetpack it built itself.'],
 ['Vexo','aliens',2,'alien',['#e83a4a','#ffb0a0','#ffd23f'],{horns:'nub',eyes:'angry',eyeC:'#ffd23f',mouth:'fang'},'Looks grumpy. Is actually very friendly.'],
 ['Squibbit','aliens',1,'octo',['#b8f04a','#f0ffb0','#1a1420'],{eyes:'big',mouth:'smile',cheeks:1},'Waves all eight arms at once when happy.'],
 ['Moonpup','aliens',3,'quad',['#8a6ad8','#d0c0ff','#5cf0ff'],{ears:'point',ant:'glow',eyes:'three',tail:'wag',glow:'#9a7aff',snout:'dog'},'A space dog that howls at three moons.'],
 ['Gazer','aliens',2,'alien',['#3a8ad8','#a8d8ff','#1a1420'],{eyes:'stalk',mouth:'grin'},'Its eyes go up, down, and all around.'],
 ['Orbo','aliens',3,'wisp',['#2a1a4a','#9a5aff','#ff3b8a'],{el:'void',eyes:'one',eyeC:'#ff3b8a'},'Watches the storm. Knows where it is going.'],
 ['Zorblax Supreme','aliens',4,'saucer',['#ffd23f','#c9a227','#7dff6a'],{pilot:'#7ad84a',pilotAcc:'crown',glow:'#ffd23f'},'Ruler of six galaxies. Visiting on holiday.'],
 ['Fizzle','aliens',2,'jelly',['#5cf0ff','#a8fff8','#ffffff'],{glow:'#5cf0ff',eyes:'dot'},'A space jelly that crackles like soda.'],
 ['Krill-9','aliens',1,'crab',['#9a5aff','#d8b8ff','#7dff6a'],{eyes:'stalkdot',eyeC:'#7dff6a',glow:'#9a5aff'},'Ninth of its name. Pinches politely.'],
 ['Stardust','aliens',3,'wisp',['#c8a8ff','#ffffff','#ffd23f'],{el:'star',eyes:'happy'},'A cloud of stars that learned to giggle.'],
 // ---------- Lab Creations
 ['Noggin','lab',2,'jar',['#5aff8a','#c9cfd8','#ff8ab0'],{inside:'brain'},'A brain in a jar with a lot of opinions.'],
 ['Iris','lab',2,'jar',['#5cb8ff','#c9a227','#ffffff'],{inside:'eye'},'Never blinks. Never misses a thing.'],
 ['Specimen 42','lab',3,'jar',['#ffd23f','#7a8b94','#7ad84a'],{inside:'blob',glow:'#ffd23f'},'Do not tap the glass. It taps back.'],
 ['Goo-Goo','lab',0,'blob',['#7ad84a','#c8ffa8','#1a1420'],{eyes:'big',mouth:'smile',alpha:0.8,drips:1},'A friendly slime. Leaves a little trail.'],
 ['Fluxy','lab',1,'blob',['#c85aff','#f0c8ff','#5cf0ff'],{eyes:'dot',mouth:'o',alpha:0.75,core:'#5cf0ff',glow:'#c85aff'},'Has a tiny storm inside it.'],
 ['Whiskers McGee','lab',1,'quad',['#a8a8b0','#ffc8d0','#7dff6a'],{ears:'round',earC:'#ffc8d0',tail:'long',tailC:'#ffc8d0',eyes:'dot',whisk:1,spots:'#7dff6a',glowSpots:1,leg:0.05},'Escaped from the lab. Glows a bit.'],
 ['Stitchworth','lab',3,'quad',['#8aa88a','#5a6a5a','#c9cfd8'],{ears:'flop',tail:'wag',snout:'dog',acc:'bolts',stitch:1,mouth:'fang',eyes:'big',eyeC:'#ffd23f'},'Put together from spare parts. Loves you anyway.'],
 ['Gelbert','lab',1,'cube',['#7af0d8','#ffffff','#1a1420'],{body:'gel',eyes:'big',mouth:'smile'},'A cube of jelly that wobbles when it walks.'],
 ['Tadley','lab',0,'fish',['#3a4a3a','#7a9a6a','#1a1420'],{body:'tad',eyes:'big',mouth:'smile'},'Will be a frog someday. Not yet.'],
 ['Dr. Snips','lab',2,'crab',['#c9cfd8','#7a8b94','#5cf0ff'],{acc:'goggles',eyes:'big',metal:1},'Runs experiments on snacks. Results: delicious.'],
 ['Sproingle','lab',1,'noodle',['#ff7a2a','#ffe0a0','#1a1420'],{stripes:1,eyes:'big',mouth:'smile'},'Boings when it is happy. Always happy.'],
 ['Plasma Pup','lab',4,'quad',['#5cf0ff','#d8ffff','#ffffff'],{ears:'point',tail:'flame',snout:'dog',alpha:0.72,glow:'#5cf0ff',eyes:'glow',eyeC:'#ffffff',emis:0.6},'Pure energy in the shape of a good boy.'],
 ['Mixmatch','lab',3,'dragon',['#7ad84a','#ffd23f','#3a8ad8'],{wing:'feather',wingC:'#3a8ad8',snout:'beak',tail:'fluff'},'Part bird, part lizard, part mystery.'],
 ['Petri','lab',0,'blob',['#ffb04a','#ffe8c0','#1a1420'],{eyes:'dot',mouth:'smile',spots:'#ff5a2a',cheeks:1},'Grew in a dish. Grew some more.'],
 // ---------- Bots & Drones
 ['Beep','bots',0,'drone',['#f4f6fa','#5cf0ff','#1a2030'],{rotor:'prop'},'Says beep. Means hello.'],
 ['Boop','bots',0,'drone',['#ff9a3a','#ffe14a','#1a2030'],{rotor:'ring'},'Says boop. Means goodbye. Never leaves.'],
 ['Scout-7','bots',1,'drone',['#8a949c','#ff3b3b','#1a2030'],{body:'box',rotor:'jet',eyes:'one'},'Scans every block for loot.'],
 ['Whirly','bots',1,'drone',['#2ad8c0','#ffffff','#1a2030'],{rotor:'prop',arms:1},'Two propellers, two hands, all helpful.'],
 ['Sparky','bots',1,'cube',['#ffd23f','#3a3a40','#5cf0ff'],{body:'tv',ant:'glow',eyes:'glow',eyeC:'#5cf0ff'},'Charges up between matches.'],
 ['Tinbot','bots',1,'alien',['#c9cfd8','#7a8b94','#ff7a1a'],{eyes:'visor',eyeC:'#ff7a1a',ant:'ball',metal:1,mouth:'none'},'Walks a little stiffly. Means well.'],
 ['Chirp-Bot','bots',2,'bird',['#c9cfd8','#3fa0ff','#5cf0ff'],{eyes:'glow',eyeC:'#5cf0ff',metal:1,crest:1},'A robot bird that sings in binary.'],
 ['Widget','bots',2,'drone',['#3fa0ff','#ffd23f','#1a2030'],{rotor:'prop',arms:1,acc:'goggles'},'Fixes things you did not know were broken.'],
 ['Mecha Mutt','bots',3,'quad',['#c9cfd8','#3a4a5a','#ff3b3b'],{ears:'point',tail:'stub',eyes:'visor',eyeC:'#ff3b3b',ant:'ball',metal:1,snout:'dog',mouth:'none'},'Fetch protocol: enabled.'],
 ['Pixel','bots',2,'cube',['#2a2a3a','#ff3fa4','#ff3fa4'],{body:'tv',eyes:'glow',eyeC:'#ff3fa4'},'Its face is a screen. It changes its mood.'],
 ['Vigil','bots',4,'drone',['#1a1a22','#ffd23f','#ff3b3b'],{rotor:'ring',eyes:'one',eyeC:'#ff3b3b',glow:'#ffd23f'},'Keeps watch while you build.'],
 ['Rusty Bolts','bots',0,'cube',['#b8743a','#6a4a2a','#ffd23f'],{body:'rust',eyes:'glow',eyeC:'#ffd23f',mouth:'flat'},'Squeaks a bit. Oil helps.'],
 // ---------- Deep Blue
 ['Puffington','ocean',1,'fish',['#ffd84a','#fff0a8','#1a1420'],{body:'puffer',eyes:'big',mouth:'o'},'Puffs up when surprised. Surprised a lot.'],
 ['Finnegan','ocean',0,'fish',['#ff7a1a','#ffffff','#1a1420'],{stripes:1,eyes:'big',mouth:'smile'},'Swims through the air like it is nothing.'],
 ['Lumo','ocean',3,'fish',['#1a2a5a','#3a5a9a','#7dfff0'],{body:'angler',eyes:'dot',mouth:'fang',glow:'#7dfff0'},'Brings its own light to dark places.'],
 ['Squidge','ocean',1,'octo',['#a85ad8','#e0b8ff','#1a1420'],{eyes:'big',mouth:'smile'},'Squishy, squiggly and a great hugger.'],
 ['Drifty','ocean',1,'jelly',['#ff8ac8','#ffd0e8','#ffffff'],{eyes:'dot',mouth:'smile'},'Goes wherever the wind takes it.'],
 ['Snapper','ocean',0,'crab',['#e83a2a','#ff9a8a','#1a1420'],{eyes:'stalkdot'},'Snip snap. Sideways is the best way.'],
 ['Shelly','ocean',1,'crab',['#ff9a6a','#f0d8b0','#1a1420'],{shell:'#c88aff',eyes:'stalkdot'},'Lives in a shell it found on Storm Island.'],
 ['Eelectra','ocean',3,'noodle',['#1a3a8a','#5cf0ff','#5cf0ff'],{stripes:1,glow:'#5cf0ff',eyes:'glow',eyeC:'#5cf0ff',fins:1},'Zaps anyone who gets too close.'],
 ['Coral','ocean',2,'fish',['#ff6a9a','#ffd0a0','#1a1420'],{eyes:'big',mouth:'smile',fins:'big'},'Fancy fins. Knows it.'],
 ['Abyss King','ocean',4,'octo',['#2a1a4a','#5a3a8a','#5cf0ff'],{eyes:'glow',eyeC:'#5cf0ff',acc:'crown',glow:'#5cf0ff',spots:'#5cf0ff',glowSpots:1},'Ruler of the deepest, darkest trench.'],
 // ---------- Mythic
 ['Scorch','mythic',3,'dragon',['#e83a2a','#ffd23f','#ff7a1a'],{horns:'nub',wing:'bat',wingC:'#ff9a3a'},'Sneezes sparks. Lights the campfire.'],
 ['Frostwing','mythic',3,'dragon',['#8ad8ff','#f4fbff','#5cf0ff'],{horns:'curl',wing:'bat',wingC:'#c8f0ff',glow:'#9fe6ff'},'Breathes snowflakes when it yawns.'],
 ['Pip the Gryphling','mythic',2,'dragon',['#d8a860','#fff0d0','#ffb21a'],{wing:'feather',wingC:'#f4f2ee',snout:'beak',ears:'tuft',tail:'fluff'},'Half eagle, half lion cub, all cuddles.'],
 ['Starhorn','mythic',4,'quad',['#fff8fc','#ffc8f0','#9a7aff'],{horns:'uni',tail:'fluff',tailC:'#c8a8ff',mane:'#ff9ad8',glow:'#ffc8f0',eyes:'big',leg:0.14},'Leaves a trail of glitter wherever it trots.'],
 ['Ashling','mythic',4,'bird',['#ff7a1a','#ffd23f','#e8401a'],{crest:1,tail:'flame',glow:'#ff9a3a',emis:0.5,eyes:'glow',eyeC:'#ffffff'},'Rises from the ashes every match.'],
 ['Zephyr','mythic',3,'noodle',['#3ac88a','#ffd23f','#1a1420'],{horns:'antler',whisk:1,fins:1,eyes:'big'},'Rides the wind round the storm.'],
 ['Moss','mythic',2,'dragon',['#5a9a4a','#c8e08a','#3a6a2a'],{horns:'nub',wing:'bat',wingC:'#8ac85a',s:0.9},'A forest dragon. Smells like rain.'],
 ['Cirrus','mythic',3,'quad',['#f4f8ff','#c8e0ff','#3a6ad8'],{wing:'feather',wingC:'#ffffff',mane:'#a8c8ff',tail:'fluff',tailC:'#a8c8ff',fly:1,leg:0.13,eyes:'big'},'A winged pony that naps on clouds.'],
 ['Wisptail','mythic',3,'quad',['#f4f2fa','#c8b8ff','#5cf0ff'],{ears:'point',tail:'flame',tailC:'#5cf0ff',snout:'dog',glow:'#5cf0ff',eyes:'happy'},'Its tail is a little blue flame. Never goes out.'],
 ['Grumble','mythic',2,'quad',['#8a8a94','#5a5a64','#ffb21a'],{ears:'point',horns:'nub',wing:'bat',wingC:'#6a6a74',tail:'spade',eyes:'angry',eyeC:'#ffb21a',mouth:'fang',body:'chunky'},'A gargoyle that guards your loot.'],
 // ---------- Spooky
 ['Sheetley','spooky',0,'ghost',['#f4f6fa','#d8dce8','#1a1420'],{eyes:'dot',mouth:'o',cheeks:1},'A shy little ghost. Says boo very quietly.'],
 ['Wisp-o','spooky',1,'ghost',['#9fe6ff','#5cb8ff','#1a3a6a'],{alpha:0.7,glow:'#9fe6ff',eyes:'dot',mouth:'smile'},'You can see right through it.'],
 ['Batsy','spooky',1,'bird',['#4a2a6a','#8a5aaa','#ff3b8a'],{ears:'point',wing:'bat',eyes:'big',mouth:'fang',feet:1},'Hangs upside down on the ceiling. Loves gravity flips.'],
 ['Gourdy','spooky',1,'blob',['#ff8a1f','#3a6a2a','#ffd23f'],{body:'pumpkin',eyes:'glow',eyeC:'#ffd23f',mouth:'fang'},'Carved with a smile, lit from inside.'],
 ['Bonesy','spooky',2,'quad',['#f4f0e4','#2a2630','#2a2630'],{ears:'flop',tail:'long',snout:'dog',bones:1,eyes:'glow',eyeC:'#7dff6a'},'A skeleton dog that fetches its own bones.'],
 ['Hexie','spooky',2,'blob',['#5ad86a','#4a2a6a','#ffd23f'],{acc:'witch',eyes:'big',mouth:'grin',alpha:0.85},'Practicing spells. Mostly turns things green.'],
 ['Mummy Mo','spooky',2,'alien',['#e8e0c8','#c8bca0','#ffd23f'],{wrap:1,eyes:'one',eyeC:'#ffd23f',mouth:'none'},'Very old. Still learning to dance.'],
 ['Nyx','spooky',3,'quad',['#1a1424','#3a2a4a','#ffd23f'],{ears:'point',tail:'long',eyes:'glow',eyeC:'#ffd23f',whisk:1,glow:'#9a5aff',mouth:'cat'},'Black cat, lucky charm.'],
 ['Webster','spooky',1,'bug',['#2a2630','#ff3b5a','#ffffff'],{body:'spider',eyes:'big'},'Dangles from a thread and waves eight legs.'],
 ['Lanternling','spooky',4,'ghost',['#c8ffd8','#7dff9a','#1a3a2a'],{alpha:0.8,glow:'#7dff9a',lantern:1,eyes:'happy',mouth:'smile',acc:'witch'},'Lights the way for lost travellers.'],
 // ---------- Bugs & Critters
 ['Buzzby','bugs',0,'bug',['#ffd23f','#1a1420','#1a1420'],{stripes:1,eyes:'big',mouth:'smile',ant:'ball'},'Busy, buzzy and very fluffy.'],
 ['Dotty','bugs',0,'bug',['#e83a2a','#1a1420','#1a1420'],{body:'lady',eyes:'dot'},'Seven spots. Counts them every morning.'],
 ['Flicker','bugs',2,'bug',['#4a5a3a','#ffe14a','#1a1420'],{body:'firefly',glow:'#ffe14a',eyes:'big',ant:'ball'},'Blinks its light to say hello.'],
 ['Flutter','bugs',2,'bug',['#3a2a4a','#ff7ae0','#5cf0ff'],{wing:'butterfly',eyes:'dot',ant:'ball'},'Wings like stained glass.'],
 ['Snailbert','bugs',1,'blob',['#c8e08a','#e8a85a','#1a1420'],{body:'snail',eyes:'stalk',mouth:'smile'},'Not fast. Not in a hurry. Always on time.'],
 ['Hopscotch','bugs',0,'blob',['#5ad84a','#e8ffb0','#1a1420'],{body:'frog',eyes:'big',mouth:'grin',cheeks:1},'Ribbit. Hop. Ribbit. Hop.'],
 ['Major Mandible','bugs',3,'bug',['#3a8a4a','#c9a227','#1a1420'],{body:'beetle',horns:'uni',eyes:'dot'},'Can lift a hundred times its own weight.'],
 ['Lumina','bugs',3,'bug',['#f4f0e8','#c8e8ff','#9fe6ff'],{wing:'butterfly',body:'moth',glow:'#c8e8ff',eyes:'big',ant:'feather'},'Follows the brightest light in the box: you.'],
 // ---------- Elementals
 ['Cinderling','elements',1,'wisp',['#ff7a1a','#ffd23f','#ffffff'],{el:'fire',eyes:'happy'},'A tiny campfire with a big personality.'],
 ['Shardy','elements',1,'wisp',['#9fe6ff','#f4fbff','#1a3a6a'],{el:'ice',eyes:'dot',mouth:'smile'},'Keeps your drinks cold.'],
 ['Zapp','elements',2,'wisp',['#c8ccd8','#ffe14a','#1a1420'],{el:'storm',eyes:'angry',eyeC:'#ffe14a'},'A grumpy thundercloud. Rumbles when it naps.'],
 ['Pebble','elements',0,'wisp',['#9a8a7a','#c8b8a0','#1a1420'],{el:'rock',eyes:'dot',mouth:'smile'},'A pebble that floats. That is the whole thing.'],
 ['Droplet','elements',0,'blob',['#3aa8ff','#a8e0ff','#1a1420'],{body:'drop',alpha:0.75,eyes:'big',mouth:'smile'},'Splashes when it lands.'],
 ['Bramble','elements',1,'wisp',['#5ad84a','#a8f07a','#2a4a1a'],{el:'leaf',eyes:'happy',mouth:'smile'},'Smells like fresh-cut grass.'],
 ['Nova','elements',4,'wisp',['#ffd23f','#fff8d0','#ff9a1a'],{el:'star',eyes:'glow',eyeC:'#ffffff',glow:'#ffd23f'},'A star that was born early.'],
 ['Voidling','elements',3,'wisp',['#1a0a2a','#7a3aff','#ff3bff'],{el:'void',eyes:'glow',eyeC:'#ff3bff'},'A little hole in space. Wants a hug.'],
 ['Drizzle','elements',2,'wisp',['#a8b8c8','#5cb8ff','#1a1420'],{el:'cloud',eyes:'happy',mouth:'smile'},'Brings its own rain. Waters your plants.'],
 // ---------- Sweets & Snacks
 ['Gumdrop','sweets',0,'blob',['#ff3a5a','#ffb0c0','#1a1420'],{body:'drop',alpha:0.85,eyes:'dot',mouth:'smile',sugar:1},'Sweet, squishy and a bit sticky.'],
 ['Sprinkles','sweets',1,'blob',['#e8a85a','#ff8ac8','#1a1420'],{body:'donut',eyes:'big',mouth:'smile'},'Rolls everywhere it goes.'],
 ['Cocoa Bean','sweets',0,'quad',['#6a3a1a','#c88a5a','#2a1a10'],{ears:'flop',tail:'wag',snout:'dog',mouth:'smile',spots:'#4a2410'},'A chocolate pup. Melts your heart.'],
 ['Mallow','sweets',0,'cube',['#fff8f4','#ffd8e8','#1a1420'],{body:'mallow',eyes:'happy',mouth:'smile',cheeks:1},'Toasty on the outside, fluffy on the inside.'],
 ['Taffy','sweets',1,'noodle',['#ff8ac8','#ffffff','#1a1420'],{stripes:1,eyes:'big',mouth:'smile',cheeks:1},'Stretches. And stretches. And stretches.'],
 ['Scoops','sweets',2,'blob',['#ffc8e0','#e8b070','#e8202c'],{body:'scoop',eyes:'happy',mouth:'smile'},'Never melts, even on Storm Island.'],
 ['Wobbles','sweets',1,'blob',['#7ad84a','#d8ffb0','#1a1420'],{body:'jelly',alpha:0.7,eyes:'big',mouth:'grin'},'Jiggles even when it is standing still.'],
 ['Muffin Top','sweets',2,'sprout',['#ffc8e0','#7ac8ff','#e8202c'],{body:'cupcake',eyes:'big',mouth:'smile',cheeks:1},'Frosted, sprinkled and cherry-topped.'],
 ['Crumbs','sweets',2,'alien',['#c87a3a','#ffffff','#1a1420'],{icing:1,eyes:'dot',mouth:'smile',cheeks:1},'A cookie on the run. You will never catch it.'],
 ['Sugarwing','sweets',4,'dragon',['#ffb0e0','#b0f0ff','#ffd23f'],{horns:'curl',wing:'bat',wingC:'#c8b0ff',glow:'#ffb0e0',spots:'#ffffff'},'A rock candy dragon that sparkles.'],
 ['Kernel','sweets',1,'blob',['#fff4c8','#ffd23f','#1a1420'],{body:'popcorn',eyes:'dot',mouth:'o'},'Pops when it gets excited.'],
 // ---------- Inverted
 ['Blocky','inverted',1,'cube',['#f4f6f9','#9aa2b0','#1a1420'],{body:'grid',eyes:'dot',mouth:'smile'},'One of the floating blocks from the box. It woke up.'],
 ['Flipside','inverted',2,'cube',['#ff3b3b','#5cf0ff','#1a1420'],{body:'flip',eyes:'big',mouth:'grin'},'Does a flip whenever gravity does.'],
 ['Gravvy','inverted',3,'wisp',['#5cf0ff','#f4f6f9','#1a1420'],{el:'blocks',eyes:'happy',glow:'#5cf0ff'},'Little blocks orbit round it like moons.'],
 ['Squall','inverted',2,'ghost',['#6a5a9a','#ffe14a','#1a1420'],{body:'cloud',eyes:'angry',eyeC:'#ffe14a',bolt:1},'A piece of the storm that came along for the ride.'],
 ['Jetsy','inverted',1,'drone',['#3a7ad8','#f4f6fa','#1a2030'],{body:'jet',rotor:'jet'},'A tiny copy of the jet. Drops you off in style.'],
 ['Boosty','inverted',2,'drone',['#1a1a22','#ffd23f','#5cf0ff'],{rotor:'ring',body:'pad',eyes:'glow',eyeC:'#5cf0ff'},'A booster pad that learned to fly.'],
 ['Glitch','inverted',4,'cube',['#2a1a3a','#ff3fa4','#5cf0ff'],{body:'glitch',eyes:'glow',eyeC:'#5cf0ff',glow:'#ff3fa4'},'Something went wrong. It went right.'],
 ['Chesty','inverted',3,'cube',['#8a5a2a','#ffd23f','#ffe14a'],{body:'chest',eyes:'big',mouth:'grin',glow:'#ffd23f'},'A treasure chest with legs. Opens up when happy.'],
 ['Neon','inverted',3,'quad',['#1a1a2a','#5cf0ff','#ff3fa4'],{ears:'point',tail:'wag',snout:'dog',neon:'#5cf0ff',eyes:'glow',eyeC:'#5cf0ff',glow:'#5cf0ff'},'Glows in the dark, and in the light.'],
];
// a few more so every page has plenty
RAW.push(
 ['Noodle Jr.','pets',1,'noodle',['#f0c890','#fff4e0','#1a1420'],{s:1.25,eyes:'dot',mouth:'smile',ears:'round',cheeks:1},'A very long dog. Nobody knows where it ends.'],
 ['Pounce','pets',2,'quad',['#f0a04a','#fff0d8','#2a1a10'],{ears:'point',tail:'long',stripesBody:'#c86a1a',whisk:1,mouth:'cat',eyeC:'#3a8a2a'},'Stalks your crosshair. Pounces on elims.'],
 ['Blorbo','aliens',0,'blob',['#ff6ad8','#ffc8f0','#1a1420'],{eyes:'one',ant:'ball',mouth:'grin'},'Just a little guy. Loves you.'],
 ['Sprocket','bots',1,'crab',['#ffb21a','#3a3a40','#5cf0ff'],{eyes:'visor',eyeC:'#5cf0ff',metal:1},'A spider bot that climbs the walls of the box.'],
 ['Barnacle Bill','ocean',2,'crab',['#5a8a9a','#c8d8d0','#1a1420'],{shell:'#e8e0c8',eyes:'stalkdot',acc:'cap'},'An old sea crab with stories to tell.'],
 ['Puffball','spooky',0,'bird',['#2a2630','#ffd23f','#ffd23f'],{ears:'point',eyes:'glow',eyeC:'#ffd23f',fluffy:1},'A round black owl that hoots at midnight.'],
 ['Fernsby','elements',0,'sprout',['#7ad84a','#c86a3a','#ff8ac0'],{body:'pot',eyes:'big',mouth:'smile',flower:1,cheeks:1},'A potted plant that wanders off. Water daily.'],
 ['Pricklepuff','elements',1,'sprout',['#4aa84a','#e8a85a','#ff5aa8'],{body:'cactus',eyes:'dot',mouth:'smile'},'Hug carefully.'],
 ['Capshroom','elements',1,'sprout',['#e83a3a','#f4f0e4','#ffffff'],{body:'shroom',eyes:'dot',mouth:'smile',cheeks:1},'Grows in the shady corners of the box.'],
 ['Glowcap','lab',2,'sprout',['#3a5aff','#c8f0ff','#5cf0ff'],{body:'shroom',eyes:'happy',glow:'#5cf0ff',glowSpots:1},'A mushroom that grew next to the reactor.'],
 ['Bok Bok','pets',0,'bird',['#f4f2ee','#e8202c','#ffb21a'],{crest:1,crestC:'#e8202c',eyes:'dot',feet:1,body:'round'},'A chicken who believes it can fly. It can.'],
);
// rarity spread and theme order for the locker rail
const S=(r)=>({n:r[0],t:r[1],r:r[2],k:r[3],c:r[4],o:r[5]||{},d:r[6]});
const ITEMS=[{n:'Solo',t:'pets',r:0,k:'none',c:['#5cf0ff','#5cf0ff','#5cf0ff'],o:{},d:'No sidekick. Just you and the box.',solo:true}];
for(const th of THEMES) for(const r of RAW) if(r[1]===th.id) ITEMS.push(S(r));
ITEMS.forEach((it,i)=>{ it.i=i; it.theme=THEMES.find(t=>t.id===it.t); it.walker=!!WALK[it.k]&&!it.o.fly; it.kn=KIND_N[it.k]||''; });

// ================= the builder =================
let T=null, INK=null, GRAD=null, HALO=null; const MATS=new Map(), GEO=new Map();
function init(three){ if(T) return; T=three;
  const d=new Uint8Array([95,95,95,255,165,165,165,255,225,225,225,255]); GRAD=new T.DataTexture(d,3,1,T.RGBAFormat); GRAD.minFilter=GRAD.magFilter=T.NearestFilter; GRAD.generateMipmaps=false; GRAD.needsUpdate=true;
  INK=new T.MeshBasicMaterial({color:0x1a1424,side:T.BackSide});
  const cv=document.createElement('canvas'); cv.width=cv.height=64; const x=cv.getContext('2d'), g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'rgba(255,255,255,1)'); g.addColorStop(0.3,'rgba(255,255,255,.5)'); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(0,0,64,64); HALO=new T.CanvasTexture(cv);
}
// shared materials and geometry (never disposed; every sidekick reuses them)
function M(col,o){ o=o||{}; const k=col+'|'+(o.e||0)+'|'+(o.a||1)+'|'+(o.ds?1:0)+'|'+(o.flat?1:0)+'|'+(o.add?1:0); let m=MATS.get(k); if(m) return m;
  m=o.flat?new T.MeshBasicMaterial({color:col}):new T.MeshToonMaterial({color:col,gradientMap:GRAD});
  if(o.e&&!o.flat){ m.emissive=new T.Color(col); m.emissiveIntensity=o.e; }
  if(o.a&&o.a<1){ m.transparent=true; m.opacity=o.a; m.depthWrite=false; }
  if(o.ds) m.side=T.DoubleSide; if(o.add){ m.transparent=true; m.blending=T.AdditiveBlending; m.depthWrite=false; }
  m.userData.keep=true; MATS.set(k,m); return m; }
const G=(k,f)=>{ let g=GEO.get(k); if(!g){ g=f(); g.userData.keep=true; GEO.set(k,g); } return g; };
const sph=(n)=>G('s'+(n||18),()=>new T.SphereGeometry(1,n||18,Math.round((n||18)*0.7)));
const hemi=()=>G('hemi',()=>new T.SphereGeometry(1,18,8,0,TAU,0,Math.PI/2));
const cylT=(rt,rb,n)=>G('c'+rt+'_'+rb+'_'+(n||10),()=>{ const g=new T.CylinderGeometry(rt==null?1:rt,rb==null?1:rb,1,n||10); g.translate(0,-0.5,0); return g; }); // top at 0, hangs down to -1
const cyl=(rt,rb,n)=>G('C'+rt+'_'+rb+'_'+(n||12),()=>new T.CylinderGeometry(rt==null?1:rt,rb==null?1:rb,1,n||12));
const cone=(n)=>G('k'+(n||10),()=>{ const g=new T.ConeGeometry(1,1,n||10); g.translate(0,0.5,0); return g; }); // base at 0, tip at +1
const box=()=>G('b',()=>new T.BoxGeometry(1,1,1));
const tor=(tube,arc,n)=>G('t'+tube+'_'+(arc||0),()=>new T.TorusGeometry(1,tube,8,n||24,arc||TAU));
const oct=()=>G('o',()=>new T.OctahedronGeometry(1,0));
const ico=()=>G('i',()=>new T.IcosahedronGeometry(1,0));
const circ=()=>G('ci',()=>new T.CircleGeometry(1,20));
function P(par,geo,mat,pos,scl,o){ const m=new T.Mesh(geo,mat); if(pos) m.position.set(pos[0],pos[1],pos[2]); if(scl!=null){ if(typeof scl==='number') m.scale.setScalar(scl); else m.scale.set(scl[0],scl[1],scl[2]); }
  m.castShadow=!(mat.transparent); if(o&&o.rot) m.rotation.set(o.rot[0],o.rot[1],o.rot[2]);
  if(o&&o.ink){ const k=new T.Mesh(geo,INK); k.scale.setScalar(1+o.ink); m.add(k); } par.add(m); return m; }
function Gp(par,pos,rot){ const g=new T.Group(); if(pos) g.position.set(pos[0],pos[1],pos[2]); if(rot) g.rotation.set(rot[0],rot[1],rot[2]); par.add(g); return g; }
function halo(par,col,size,pos){ const s=new T.Sprite(new T.SpriteMaterial({map:HALO,color:col,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0.65})); s.scale.setScalar(size); if(pos) s.position.set(pos[0],pos[1],pos[2]); par.add(s); return s; }
function rng(s){ let h=2166136261; for(const ch of s) h=Math.imul(h^ch.charCodeAt(0),16777619); return ()=>{ h=Math.imul(h^(h>>>15),2246822507); h=Math.imul(h^(h>>>13),3266489909); h^=h>>>16; return (h>>>0)/4294967296; }; }
const _z=()=>new T.Vector3(0,0,1);
// a point on a sphere of radius R: ax round to the right from the front (-Z), ay up
function onS(ax,ay){ return new T.Vector3(Math.sin(ax)*Math.cos(ay),Math.sin(ay),-Math.cos(ax)*Math.cos(ay)); }
// a group stuck to the surface of a head with its +Z pointing out
let _m4=null;
function stick(head,R,ax,ay,flat){ const g=new T.Group(); if(flat){ g.position.set(Math.sin(ax)*R,Math.sin(ay)*R,-R); g.rotation.y=Math.PI; }
  else { const n=onS(ax,ay); g.position.copy(n).multiplyScalar(R*0.96); _m4=_m4||new T.Matrix4(); _m4.lookAt(n,new T.Vector3(),new T.Vector3(0,1,0)); g.quaternion.setFromRotationMatrix(_m4); } head.add(g); return g; }
const mt=(x,c,o)=>M(c,Object.assign({e:x.o.emis||0,a:x.o.alpha||1},o||{}));
const inkK=(x,k)=>x.o.alpha?0:k;

// ---- faces: eyes, mouth, cheeks, ears, horns, antennae and hats, on a head of radius R (facing -Z)
function face(x,head,R,f){ f=f||{}; const o=x.o, c=x.c, st=o.eyes||'big', ec=o.eyeC||'#1a1420', fl=!!f.flat, ey=f.ey!=null?f.ey:0.14, my=f.my!=null?f.my:-0.28;
  const two=(ax,ay,fn)=>{ for(const s of[-1,1]){ const g=stick(head,R,s*ax,ay,fl); fn(g,s); x.blinks.push(g); } };
  const W=M('#ffffff'), D=M(ec), HL=M('#ffffff',{flat:1});
  const bigEye=(g,s,sc)=>{ sc=sc||1; P(g,sph(14),W,[0,0,0],[R*.25*sc,R*.29*sc,R*.12],{ink:0.14}); P(g,sph(12),D,[0,-R*.03*sc,R*.07],[R*.16*sc,R*.19*sc,R*.08]); P(g,sph(8),HL,[R*.06*sc,R*.07*sc,R*.14],R*.055*sc); };
  if(st==='big'||st==='angry') two(0.4,ey,(g,s)=>{ bigEye(g,s,o.eyeS); if(st==='angry') P(g,box(),M('#1a1420'),[s*-R*0.04,R*.33,R*.08],[R*.34,R*.07,R*.06],{rot:[0,0,s*0.45]}); });
  else if(st==='dot') two(0.36,ey,(g)=>{ P(g,sph(10),D,[0,0,0],[R*.12,R*.15,R*.08]); P(g,sph(6),HL,[R*.04,R*.05,R*.07],R*.04); });
  else if(st==='glow') two(0.38,ey,(g)=>{ P(g,sph(12),M(ec,{e:1.2}),[0,0,0],[R*.17,R*.2,R*.08]); });
  else if(st==='happy') two(0.38,ey,(g)=>{ P(g,tor(0.22,Math.PI,10),M('#1a1420'),[0,-R*.04,R*.02],R*.13); });
  else if(st==='one'){ const g=stick(head,R,0,ey+0.05,fl); x.blinks.push(g); P(g,sph(16),W,[0,0,0],[R*.42,R*.42,R*.16],{ink:0.1}); P(g,sph(12),D,[0,0,R*.1],[R*.24,R*.26,R*.1]); P(g,sph(8),HL,[R*.09,R*.1,R*.2],R*.08); }
  else if(st==='three'){ two(0.45,ey-0.04,(g)=>bigEye(g,1,0.8)); const g=stick(head,R,0,ey+0.32,fl); x.blinks.push(g); bigEye(g,1,0.85); }
  else if(st==='visor'){ const g=stick(head,R,0,ey,fl); x.blinks.push(g); P(g,box(),M('#14141e'),[0,0,0],[R*1.3,R*.38,R*.12],{ink:0.08}); for(const s of[-1,1]) P(g,sph(10),M(ec,{e:1.4}),[s*R*.3,0,R*.07],[R*.14,R*.11,R*.05]); }
  else if(st==='compound') two(0.75,ey,(g)=>{ P(g,sph(14),M('#1a1420'),[0,0,0],[R*.33,R*.38,R*.25]); P(g,sph(6),HL,[R*.1,R*.12,R*.22],R*.07); });
  else if(st==='stalk'||st==='stalkdot'){ const big=st==='stalk'; for(const s of[-1,1]){ const p=Gp(head,[s*R*.35,R*(big?.8:.5),0],[0,0,s*-0.25]); P(p,cylT(1,1,8),mt(x,c[0]),[0,R*(big?.7:.55),0],[R*.09,R*(big?.7:.55),R*.09]);
      const e=Gp(p,[0,R*(big?.75:.6),0]); x.blinks.push(e); if(big) bigEye(e,s,1.5); else { P(e,sph(10),W,[0,0,0],R*.2,{ink:0.12}); P(e,sph(8),D,[0,0,-R*.13],[R*.11,R*.11,R*.08]); }
      x.A.push((t,dt,mv)=>{ p.rotation.z=s*-0.25+0.18*Math.sin(t*2.3+s); p.rotation.x=0.12*Math.sin(t*1.7+s*2)-mv*0.2; }); } }
  // mouth
  const mo=o.mouth||(st==='visor'?'none':'smile'), MK=M('#2a1420');
  if(mo!=='none'){ const g=stick(head,R,0,my,fl);
    if(mo==='smile'||mo==='grin'||mo==='fang'){ const w=mo==='grin'?R*.26:R*.17; P(g,tor(0.2,Math.PI,12),MK,[0,R*.04,0],w,{rot:[0,0,Math.PI]});
      if(mo==='fang') for(const s of[-1,1]) P(g,cone(6),M('#ffffff'),[s*w*0.6,-w*0.35,R*.02],[R*.04,-R*.09,R*.03]); }
    else if(mo==='o') P(g,sph(10),MK,[0,0,0],[R*.09,R*.11,R*.05]);
    else if(mo==='cat') for(const s of[-1,1]) P(g,tor(0.25,Math.PI,10),MK,[s*R*.085,R*.03,0],R*.085,{rot:[0,0,Math.PI]});
    else if(mo==='flat') P(g,box(),MK,[0,0,0],[R*.3,R*.05,R*.04]); }
  if(o.cheeks){ const pk=M('#ff8aa8',{a:0.75}); for(const s of[-1,1]){ const g=stick(head,R,s*0.66,my+0.08,fl); P(g,sph(10),pk,[0,0,0],[R*.14,R*.09,R*.04]); } }
  if(o.whisk){ const wm=M('#f4f2ee'); for(const s of[-1,1]) for(const k of[-1,1]){ const g=stick(head,R,s*0.45,my+0.06,fl); P(g,cylT(1,1,4),wm,[0,0,0],[R*.02,R*.5,R*.02],{rot:[0,0,s*(1.45+k*0.18)]}); } }
  // ears
  const ec2=o.earC||c[0], inner=M(c[1]), em=mt(x,ec2), et=o.ears; const ears=[];
  if(et==='point') for(const s of[-1,1]){ const p=Gp(head,[s*R*.52,R*.62,0],[0,0,-s*0.38]); P(p,cone(8),em,[0,0,0],[R*.3,R*.62,R*.2],{ink:inkK(x,0.12)}); P(p,cone(8),inner,[0,R*.06,-R*.07],[R*.17,R*.42,R*.08]); ears.push([p,s,-s*0.38,'z']); }
  if(et==='tuft') for(const s of[-1,1]){ const p=Gp(head,[s*R*.5,R*.7,0],[0,0,-s*0.5]); P(p,cone(6),em,[0,0,0],[R*.18,R*.45,R*.12]); ears.push([p,s,-s*0.5,'z']); }
  if(et==='round') for(const s of[-1,1]){ const p=Gp(head,[s*R*.62,R*.62,0]); P(p,sph(12),em,[0,0,0],[R*.3,R*.3,R*.12],{ink:inkK(x,0.12)}); P(p,sph(10),inner,[0,0,-R*.06],[R*.18,R*.18,R*.06]); ears.push([p,s,0,'z']); }
  if(et==='flop') for(const s of[-1,1]){ const p=Gp(head,[s*R*.78,R*.38,0],[0,0,s*0.25]); P(p,sph(12),em,[0,-R*.42,0],[R*.22,R*.5,R*.3],{ink:inkK(x,0.12)}); ears.push([p,s,s*0.25,'z']); }
  if(et==='long') for(const s of[-1,1]){ const p=Gp(head,[s*R*.35,R*.75,0],[0,0,-s*0.18]); P(p,sph(12),em,[0,R*.7,0],[R*.2,R*.75,R*.12],{ink:inkK(x,0.12)}); P(p,sph(10),inner,[0,R*.68,-R*.07],[R*.11,R*.58,R*.06]); ears.push([p,s,-s*0.18,'x']); }
  if(et==='gills') for(const s of[-1,1]) for(let k=0;k<3;k++){ const p=Gp(head,[s*R*.82,R*(.25-k*0.25),0],[0,0,s*(-0.5+k*0.5)]); P(p,cylT(1,0.5,6),M(c[1],{e:0.3}),[0,R*.55,0],[R*.08,R*.55,R*.08]); P(p,sph(8),M(c[1],{e:0.3}),[0,R*.55,0],R*.1); ears.push([p,s,s*(-0.5+k*0.5),'z']); }
  if(ears.length) x.A.push((t)=>{ const tw=Math.max(0,Math.sin(t*0.9+x.seed*5))>0.96?Math.sin(t*40)*0.25:0; for(const [p,s,b,ax] of ears){ const w=b+s*(0.06*Math.sin(t*2.2+s)+tw)*(et==='flop'?-1.6:1); if(ax==='x') p.rotation.x=0.15*Math.sin(t*1.8+s)+tw; else p.rotation.z=w; } });
  // horns
  const hm=M(o.hornC||c[1]);
  if(o.horns==='nub') for(const s of[-1,1]) P(head,cone(8),hm,[s*R*.42,R*.72,0],[R*.14,R*.32,R*.14],{rot:[0,0,-s*0.35],ink:0.1});
  if(o.horns==='uni'){ const u=P(head,cone(10),M(c[2]==='#1a1420'?c[1]:c[2],{e:0.25}),[0,R*.78,-R*.32],[R*.13,R*.85,R*.13],{rot:[-0.5,0,0],ink:0.1}); for(let k=1;k<4;k++) P(u,tor(0.18),M('#ffffff'),[0,k*0.22,0],[1-k*0.22,1-k*0.22,1-k*0.22],{rot:[Math.PI/2,0,0]}); }
  if(o.horns==='curl') for(const s of[-1,1]) P(head,tor(0.32,Math.PI*1.2,12),hm,[s*R*.6,R*.62,R*.1],R*.24,{rot:[0,s*Math.PI/2,s>0?0.6:2.55],ink:0.08});
  if(o.horns==='antler') for(const s of[-1,1]){ const p=Gp(head,[s*R*.35,R*.8,0],[0,0,-s*0.4]); P(p,cylT(1,1,6),hm,[0,R*.7,0],[R*.06,R*.7,R*.06]); for(let k=0;k<2;k++){ const q=Gp(p,[0,R*(.35+k*0.25),0],[0,0,-s*0.9]); P(q,cylT(1,1,6),hm,[0,R*.3,0],[R*.05,R*.3,R*.05]); } }
  // antennae
  if(o.ant) for(const s of[-1,1]){ const p=Gp(head,[s*R*.3,R*.85,0],[0,0,-s*0.3]), L=o.ant==='feather'?R*.9:R*.75; P(p,cylT(1,1,6),M(o.ant==='glow'?c[1]:'#2a2630'),[0,L,0],[R*.04,L,R*.04]);
    if(o.ant==='zig'){ const q=Gp(p,[0,L,0],[0,0,s*1.2]); P(q,cylT(1,1,6),M('#2a2630'),[0,R*.4,0],[R*.04,R*.4,R*.04]); P(q,sph(8),M(c[1],{e:0.4}),[0,R*.42,0],R*.1); }
    else if(o.ant==='feather') P(p,sph(10),M(c[1],{a:0.9}),[0,L*0.6,-R*.08],[R*.09,L*0.45,R*.2]);
    else { P(p,sph(10),M(o.ant==='glow'?c[2]:c[1],{e:o.ant==='glow'?1.1:0.2}),[0,L,0],R*.13); if(o.ant==='glow') halo(p,c[2],R*1.1,[0,L,0]); }
    x.A.push((t,dt,mv)=>{ p.rotation.z=-s*0.3+0.2*Math.sin(t*3.1+s*1.3); p.rotation.x=0.15*Math.sin(t*2.3+s)+mv*0.35; }); }
  // hats and gear
  acc(x,head,R,o.acc);
  if(o.mane) for(let k=0;k<5;k++) P(head,sph(10),M(o.mane),[0,R*(.75-k*.18),R*(.25+k*.2)],[R*.16,R*.22,R*.2]);
  if(o.headC){ /* recoloured head handled by the caller */ }
}
function acc(x,head,R,a){ if(!a) return; const c=x.c;
  if(a==='crown'){ const g=Gp(head,[0,R*.88,0]); const gm=M('#ffd23f',{e:0.15}); P(g,cyl(1,1,16),gm,[0,R*.1,0],[R*.38,R*.2,R*.38],{ink:0.06}); for(let k=0;k<5;k++){ const a2=k/5*TAU; P(g,cone(6),gm,[Math.sin(a2)*R*.33,R*.2,Math.cos(a2)*R*.33],[R*.09,R*.22,R*.09]); } P(g,sph(8),M('#e8202c',{e:0.4}),[0,R*.12,-R*.38],R*.07); }
  if(a==='tophat'){ const g=Gp(head,[0,R*.85,0]); P(g,cyl(1,1,16),M('#1a1420'),[0,0,0],[R*.6,R*.06,R*.6]); P(g,cyl(1,1,16),M('#1a1420'),[0,R*.3,0],[R*.38,R*.55,R*.38],{ink:0.05}); P(g,cyl(1,1,16),M('#e8202c'),[0,R*.1,0],[R*.39,R*.1,R*.39]); }
  if(a==='party'){ const g=Gp(head,[R*.15,R*.8,0],[0,0,-0.25]); P(g,cone(12),M('#ff5aa8'),[0,0,0],[R*.3,R*.8,R*.3],{ink:0.06}); P(g,sph(8),M('#ffd23f'),[0,R*.82,0],R*.1); }
  if(a==='witch'){ const g=Gp(head,[0,R*.78,0],[-0.15,0,0.12]); P(g,cyl(1,1,18),M('#2a1a3a'),[0,0,0],[R*.85,R*.05,R*.85]); P(g,cone(12),M('#2a1a3a'),[0,0,0],[R*.45,R*1.05,R*.45],{ink:0.05}); P(g,cyl(1,1,16),M(x.c[1]==='#4a2a6a'?'#ffd23f':'#9a5aff'),[0,R*.1,0],[R*.45,R*.09,R*.45]); }
  if(a==='bow'){ const g=Gp(head,[R*.35,R*.75,0],[0,0,-0.4]); const bm=M('#ff5aa8'); for(const s of[-1,1]) P(g,cone(8),bm,[0,0,0],[R*.16,R*.3,R*.1],{rot:[0,0,s*Math.PI/2]}); P(g,sph(8),bm,[0,0,0],R*.09); }
  if(a==='halo'){ const h=P(head,tor(0.12),M('#ffe14a',{e:1}),[0,R*1.25,0],R*.42,{rot:[Math.PI/2,0,0]}); x.A.push((t)=>{ h.position.y=R*(1.25+0.05*Math.sin(t*2)); }); }
  if(a==='goggles'){ const g=Gp(head,[0,R*.45,0]); P(g,tor(0.1),M('#3a2a20'),[0,0,0],[R*1.0,R*1.0,R*1.0],{rot:[Math.PI/2,0,0]}); for(const s of[-1,1]){ const q=stick(head,R,s*0.38,0.62); P(q,tor(0.3,TAU,14),M('#c9a227'),[0,0,0],R*.17); P(q,circ(),M('#9fe6ff',{e:0.4}),[0,0,0.002],R*.15); } }
  if(a==='headphones'){ P(head,tor(0.09,Math.PI,16),M('#2a2630'),[0,R*.1,0],R*1.0,{rot:[0,Math.PI/2,0]}); for(const s of[-1,1]) P(head,cyl(1,1,14),M('#ff3fa4'),[s*R*.98,R*.05,0],[R*.25,R*.12,R*.25],{rot:[0,0,Math.PI/2]}); }
  if(a==='dome') P(head,sph(20),M('#c8f0ff',{a:0.28}),[0,R*.05,0],R*1.28);
  if(a==='beanie'){ P(head,hemi(),M(c[1]),[0,R*.35,0],[R*1.03,R*.75,R*1.03]); P(head,sph(8),M('#ffffff'),[0,R*1.12,0],R*.15); }
  if(a==='cap'){ P(head,hemi(),M('#2a5aa8'),[0,R*.4,0],[R*.95,R*.6,R*.95]); P(head,cyl(1,1,16),M('#2a5aa8'),[0,R*.42,-R*.55],[R*.45,R*.04,R*.5]); }
  if(a==='bandana') P(head,tor(0.14),M('#e8202c'),[0,R*.42,0],[R*.93,R*.93,R*.93],{rot:[Math.PI/2+0.15,0,0]});
  if(a==='flower'){ const g=Gp(head,[R*.4,R*.7,0]); for(let k=0;k<5;k++){ const a2=k/5*TAU; P(g,sph(8),M('#ff8ac0'),[Math.cos(a2)*R*.14,Math.sin(a2)*R*.14,0],[R*.1,R*.1,R*.05]); } P(g,sph(8),M('#ffd23f'),[0,0,-R*.02],R*.07); }
  if(a==='bolts') for(const s of[-1,1]) P(head,cyl(1,1,8),M('#c9cfd8'),[s*R*.95,-R*.25,0],[R*.09,R*.3,R*.09],{rot:[0,0,Math.PI/2]});
}
// a chain of segments (tails, tentacles, noodles): each one a child of the last, so bending adds up
function chain(par,n,len,r0,r1,mat,o){ o=o||{}; const segs=[]; let p=par;
  for(let i=0;i<n;i++){ const g=Gp(p,i?[0,0,len]:[0,0,0]); const r=r0+(r1-r0)*i/Math.max(1,n-1); P(g,sph(10),mat,[0,0,len*0.5],[r,r,len*0.62+r*0.4],{ink:o.ink}); segs.push(g); p=g; }
  return segs; }
// wings on a pivot at pos (one each side); flap(t,mv) gives the angle
function wings(x,par,pos,type,size,col){ const ps=[], c=x.c; const wc=col||x.o.wingC||c[1];
  for(const s of[-1,1]){ const p=Gp(par,[s*pos[0],pos[1],pos[2]]), inner=Gp(p); inner.scale.x=s;
    if(type==='bat'){ if(!GEO.has('batw')){ const sh=new T.Shape(); sh.moveTo(0,0.06); sh.lineTo(0.95,0.4); sh.lineTo(1,0.12); sh.quadraticCurveTo(0.86,0.0,0.78,-0.25); sh.quadraticCurveTo(0.64,-0.1,0.52,-0.3); sh.quadraticCurveTo(0.38,-0.08,0.26,-0.26); sh.quadraticCurveTo(0.14,-0.06,0,-0.06); const g=new T.ShapeGeometry(sh,8); g.rotateX(-Math.PI/2); g.userData.keep=true; GEO.set('batw',g); }
      P(inner,GEO.get('batw'),M(wc,{ds:1}),[0,0,0],[size,1,size]); P(inner,cylT(1,1,6),M(c[0]),[0,0,0],[0.012,size*0.98,0.012],{rot:[0,0,-Math.PI/2+0.4]}); }
    else if(type==='bug'){ P(inner,circ(),M('#e8f8ff',{a:0.45,ds:1}),[size*0.55,0,size*0.12],[size*0.6,size*0.28,1],{rot:[-Math.PI/2,0,0.3]}); P(inner,circ(),M('#e8f8ff',{a:0.4,ds:1}),[size*0.45,-0.005,-size*0.15],[size*0.45,size*0.22,1],{rot:[-Math.PI/2,0,-0.2]}); }
    else if(type==='butterfly'){ const wm=M(wc,{ds:1,e:x.o.glow?0.25:0}), sp=M(c[2],{ds:1,e:0.3}); P(inner,circ(),wm,[size*0.5,0,-size*0.2],[size*0.55,size*0.45,1],{rot:[-Math.PI/2,0,0.5]}); P(inner,circ(),sp,[size*0.55,0.002,-size*0.22],[size*0.22,size*0.18,1],{rot:[-Math.PI/2,0,0.5]});
      P(inner,circ(),wm,[size*0.4,-0.003,size*0.25],[size*0.4,size*0.32,1],{rot:[-Math.PI/2,0,-0.6]}); }
    else { const wm=mt(x,wc); for(let k=0;k<3;k++) P(inner,sph(10),k?M(c[k===1?1:0]):wm,[size*(0.5-k*0.05),-0.005*k,size*(0.05+k*0.12)],[size*(0.55-k*0.1),0.022,size*(0.2-k*0.03)],{rot:[0,-0.25*k,0],ink:k?0:inkK(x,0.05)}); }
    ps.push([p,s]); }
  return ps; }
function flap(ps,a){ for(const [p,s] of ps) p.rotation.z=s*a; }
// a head on a group: a ball of radius R in colour col, then the face
function head(x,par,pos,R,col,f){ const h=Gp(par,pos); P(h,sph(20),mt(x,col),[0,0,0],f&&f.scl?[R*f.scl[0],R*f.scl[1],R*f.scl[2]]:R,{ink:inkK(x,0.06)}); face(x,h,R,f); return h; }
function spots(x,mesh,col,n,glowy){ const r=x.rand, m=M(col,{e:glowy?1:0}); for(let i=0;i<n;i++){ const ax=(r()-0.5)*TAU, ay=(r()-0.3)*1.4, nn=onS(ax,ay); const s=P(mesh,sph(8),m,[nn.x*0.97,nn.y*0.97,nn.z*0.97],[0.2+r()*0.12,0.2+r()*0.12,0.06]); s.quaternion.setFromUnitVectors(_z(),nn); } }
function tail(x,par,type,col){ const o=x.o, c=x.c, cm=mt(x,col||o.tailC||c[0]);
  if(type==='wag'){ const s=chain(par,3,0.045,0.03,0.018,cm,{ink:inkK(x,0.12)}); par.rotation.x=-0.7; x.A.push((t,dt,mv)=>{ const f=7+7*mv; for(let i=0;i<s.length;i++) s[i].rotation.y=0.45*Math.sin(t*f-i*0.6); }); }
  else if(type==='long'){ const s=chain(par,6,0.04,0.022,0.014,cm,{ink:inkK(x,0.14)}); par.rotation.x=-0.9; x.A.push((t)=>{ for(let i=0;i<s.length;i++){ s[i].rotation.y=0.3*Math.sin(t*2-i*0.5); s[i].rotation.x=-0.12+0.08*Math.sin(t*1.3-i*0.4); } }); }
  else if(type==='fluff'){ const p=Gp(par,[0,0,0],[-0.6,0,0]); const m=P(p,sph(14),cm,[0,0,0.09],[0.06,0.06,0.11],{ink:inkK(x,0.07)}); if(o.tailTip) P(m,sph(10),M(o.tailTip),[0,0.1,0.75],0.55); x.A.push((t,dt,mv)=>{ p.rotation.y=0.35*Math.sin(t*(3+5*mv)); p.rotation.x=-0.6+0.1*Math.sin(t*1.5); }); }
  else if(type==='curl') P(par,tor(0.3,Math.PI*1.6,12),cm,[0,0.02,0.03],0.035,{rot:[0,Math.PI/2,0]});
  else if(type==='stub') P(par,sph(10),cm,[0,0,0.015],0.035,{ink:inkK(x,0.12)});
  else if(type==='spade'){ const s=chain(par,4,0.045,0.018,0.014,cm); par.rotation.x=-0.5; P(s[3],cone(4),cm,[0,0,0.05],[0.04,0.06,0.015],{rot:[Math.PI/2,0,0]}); x.A.push((t)=>{ for(let i=0;i<s.length;i++) s[i].rotation.y=0.3*Math.sin(t*2.5-i*0.6); }); }
  else if(type==='flame'){ const p=Gp(par,[0,0,0],[-0.9,0,0]); const fm=M(o.tailC||o.glow||'#ff9a3a',{e:1,a:0.85}); const f1=P(p,cone(8),fm,[0,0,0],[0.04,0.13,0.04]), f2=P(p,cone(8),M('#ffffff',{e:1,a:0.8}),[0,0,0],[0.02,0.07,0.02]); halo(p,o.tailC||o.glow||'#ff9a3a',0.22,[0,0.08,0]);
    x.A.push((t)=>{ const k=1+0.15*Math.sin(t*17)+0.1*Math.sin(t*23); f1.scale.y=0.13*k; f2.scale.y=0.07*k; p.rotation.z=0.2*Math.sin(t*3); }); }
}

// ---- body plans. Each builds into b (a group whose origin is between the feet, or the middle of a flyer at y=0.25)
const KINDS={
quad(x,b){ const o=x.o, c=x.c, L=o.leg||0.11, w=o.body==='chunky'?1.15:1, l=o.body==='long'?1.55:o.body==='chunky'?1.05:1.22, Y=L+0.11;
  const tor_=Gp(b,[0,Y,0]); const bm=P(tor_,sph(20),mt(x,c[0]),[0,0,0],[0.14*w,0.12*w,0.14*l],{ink:inkK(x,0.06)});
  if(!o.fluffy&&!o.neon&&!o.bones) P(bm,sph(14),mt(x,c[1]),[0,-0.32,-0.22],[0.74,0.7,0.82]);
  if(o.spots) spots(x,bm,o.spots,7,o.glowSpots); if(o.patch) P(bm,sph(14),M(o.patch),[0,0.2,0.1],[1.01,0.6,0.55]);
  if(o.stripesBody) for(let k=0;k<3;k++) P(bm,tor(0.12),M(o.stripesBody),[0,0,-0.2+k*0.35],[0.98-Math.abs(k-1)*0.05,0.98,0.98],{rot:[0,0,0]}).rotation.set(0,Math.PI/2,Math.PI/2);
  if(o.neon) for(let k=0;k<3;k++) P(bm,tor(0.05),M(o.neon,{e:1.3}),[0,0,-0.4+k*0.4],[1.01,1.01,1.01]).rotation.set(0,0,0);
  if(o.bones) for(let k=0;k<4;k++) P(bm,tor(0.08,Math.PI,12),M('#2a2630'),[0,0.1,-0.45+k*0.3],[1.0,0.95,1],{rot:[0,Math.PI/2,0]});
  if(o.fluffy){ const fm=M(c[0]); for(let k=0;k<12;k++){ const a=k/12*TAU; P(tor_,sph(10),fm,[Math.cos(a)*0.11*w,0.03+0.05*Math.sin(a*2),Math.sin(a)*0.13*l],0.065,{ink:0.08}); } P(tor_,sph(10),fm,[0,0.09,0],[0.1,0.06,0.13]); }
  if(o.shell){ const sh=P(tor_,sph(16),M(c[1]),[0,0.035,0.01],[0.16,0.12,0.18],{ink:0.06}); spots(x,sh,c[2],6); P(tor_,tor(0.15),M(c[2]),[0,0.0,0.01],[0.16,0.18,0.03],{rot:[Math.PI/2,0,0]}).scale.set(0.16,0.18,0.12); }
  if(o.scarf) P(tor_,tor(0.25),M(o.scarf),[0,0.06,-0.13*l],[0.08,0.08,0.08],{rot:[Math.PI/2-0.4,0,0]});
  if(o.stitch) for(let k=0;k<4;k++) P(bm,box(),M('#2a2630'),[0.15*(k-1.5),0.97,0],[0.03,0.04,0.25]);
  if(o.wing) x.wings=wings(x,tor_,[0.08*w,0.08,-0.02],o.wing,o.wing==='bat'?0.2:0.2);
  // head (with a snout for dogs and pigs)
  const R=o.headR||0.11, hp=Gp(tor_,[0,0.1,-0.14*l]), sn=o.snout==='dog'||o.snout==='pig';
  const hd=head(x,hp,[0,0,-0.02],R,o.headC||c[0],{ey:sn?0.22:0.12,my:sn?-0.55:-0.3});
  if(o.snout==='dog'){ P(hd,sph(14),mt(x,o.headC?c[0]:c[1]),[0,-R*.32,-R*.78],[R*.48,R*.36,R*.45],{ink:inkK(x,0.12)}); P(hd,sph(10),M('#1a1420'),[0,-R*.14,-R*1.18],[R*.15,R*.1,R*.1]); }
  if(o.snout==='pig'){ P(hd,cyl(1,1,14),M(c[1]),[0,-R*.18,-R*.95],[R*.3,R*.15,R*.22],{rot:[Math.PI/2,0,0],ink:0.1}); for(const s of[-1,1]) P(hd,sph(6),M('#5a2a30'),[s*R*.1,-R*.18,-R*1.04],R*.06); }
  if(o.snout==='beak') P(hd,cone(8),M('#ffb21a'),[0,-R*.15,-R*.85],[R*.25,R*.5,R*.2],{rot:[-Math.PI/2,0,0],ink:0.1});
  // legs: two segments each (shoulder/elbow in front, hip/knee behind) posed by 2-bone IK onto feet that plant on the
  // ground and step through a real quadruped gait: a four-beat walk, a diagonal trot, then a rotary gallop with a
  // moment in the air. The elbows point back and the knees forward like a real dog's, and the paws stay flat.
  const legs=[]; const pm=M(o.paw||c[1]), lm=mt(x,o.legC||c[0]), l1=(L+0.02)*0.55, l2=(L+0.02)*0.5, HY=(L+0.02)-Y; // hip height relative to the torso centre
  for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const hip=[sx*0.08*w,HY+0.0,sz*0.085*l], p=Gp(tor_,hip);
    P(p,cylT(1,0.85,8),lm,[0,0,0],[0.036,l1,0.036],{ink:inkK(x,0.12)}); const kn=Gp(p,[0,-l1,0]); P(kn,sph(8),lm,[0,0,0],0.03);
    P(kn,cylT(1,0.8,8),lm,[0,0,0],[0.03,l2,0.03],{ink:inkK(x,0.12)}); const pw=Gp(kn,[0,-l2,0]); P(pw,sph(10),pm,[0,-0.008,-0.01],[0.04,0.026,0.05],{ink:inkK(x,0.1)});
    legs.push({p,kn,pw,hip,front:sz<0,left:sx<0}); }
  if(o.tail){ const tp=Gp(tor_,[0,0.04,0.135*l]); tail(x,tp,o.tail); }
  if(o.glow) x.halo=halo(tor_,o.glow,0.6,[0,0,0]);
  x.h=Y+0.2+R;
  // gait footfall offsets [LF,RF,LH,RH] (fraction of a stride) and the share of the stride each foot is down
  const GAIT={walk:{off:[0.25,0.75,0,0.5],duty:0.68},trot:{off:[0,0.5,0.5,0],duty:0.5},gallop:{off:[0.5,0.6,0,0.1],duty:0.32},hop:{off:[0.5,0.56,0,0.04],duty:0.34}};
  const hopper=o.ears==='long', slow=!!o.shell; // bunnies bound with both back feet together; tortoises only ever walk
  const ik=(lg,tz,ty)=>{ // foot target (tz,ty) from the hip in torso space: upper and lower angles about X
    const D=Math.min(Math.hypot(tz,ty),l1+l2-0.002), a0=Math.atan2(-tz,-ty), ca=clamp1((l1*l1+D*D-l2*l2)/(2*l1*D)), cb=clamp1((l1*l1+l2*l2-D*D)/(2*l1*l2));
    const al=Math.acos(ca), be=Math.PI-Math.acos(cb), s=lg.front?-1:1; // front: elbow back, hind: knee forward
    lg.p.rotation.x=a0+s*al; lg.kn.rotation.x=-s*be; lg.pw.rotation.x=-(lg.p.rotation.x+lg.kn.rotation.x)-tor_.rotation.x; };
  const st={cyc:0,sit:0,still:0,trot:0,gal:0,sniff:0,sniffT:4};
  x.A.push((t,dt,mv,air,S)=>{
    const spd=S&&S.spd!=null?S.spd:mv*5;                          // ground speed in m/s
    st.trot+=((spd>1.3?1:0)-st.trot)*Math.min(1,dt*4); st.gal+=((spd>3.4?1:0)-st.gal)*Math.min(1,dt*4);
    if(slow) st.trot=st.gal=0; if(hopper) st.gal=st.trot;
    const G0=GAIT.walk, G1=GAIT.trot, G2=hopper?GAIT.hop:GAIT.gallop, k1=st.trot*(1-st.gal), k2=st.gal, k0=1-k1-k2;
    const duty=G0.duty*k0+G1.duty*k1+G2.duty*k2;
    const f=spd<0.05?0:slow?Math.min(1.6,0.6+spd*0.3):Math.min(4.2,0.9+spd*0.55); st.cyc=(st.cyc+dt*f)%1;       // strides per second
    const move=Math.min(1,spd/0.4), A=(0.045+Math.min(spd,6)*0.014)*(L/0.11)*move;   // stride length
    // sitting down after standing still a while, up again the moment it moves
    st.still=spd<0.05&&!air?st.still+dt:0; st.sit+=((st.still>3.5?1:0)-st.sit)*Math.min(1,dt*(st.still>3.5?2.2:7));
    const sit=st.sit*(o.fly?0:1);
    // body: two dips per stride at a walk, a bounce at the trot, a rocking leap at the gallop; a little roll with the hips
    const c2=TAU*st.cyc, sus=k2*Math.max(0,Math.sin(c2))*0.045*move;
    tor_.position.y=Y-(k0*0.006*(1+Math.cos(2*c2))+k1*0.01*Math.abs(Math.sin(c2*2)))*move+sus+0.003*Math.sin(t*2.6)-sit*0.05;
    tor_.position.z=sit*0.03;
    tor_.rotation.x=air?0.12*Math.sin(t*1.4):k2*0.16*Math.sin(c2+0.6)*move+sit*0.5;           // nose up while sitting
    tor_.rotation.z=air?0:(k0*0.035+k1*0.02)*Math.sin(c2)*move;
    bm.scale.y=0.12*w*(1+0.03*Math.sin(t*2.6));
    // feet
    for(let i=0;i<4;i++){ const lg=legs[i], off=G0.off[i]*k0+G1.off[i]*k1+G2.off[i]*k2;
      let fz=0, fy=0;
      if(air){ fz=0.03*Math.sin(t*7+i*1.6); fy=0.025+0.02*Math.cos(t*7+i*1.6); }
      else if(move>0.001){ const u=(st.cyc+off)%1;
        if(u<duty){ fz=-A/2+A*(u/duty); }                                              // planted: the body walks over it
        else { const s=(u-duty)/(1-duty), e=s*s*(3-2*s); fz=A/2-A*e; fy=(0.025+0.02*k2)*(L/0.11)*Math.sin(Math.PI*s)*move; } } // swing: lift, reach forward
      // where the hip is now (the torso bobs, pitches and sits), and the foot target from it, in torso space
      const cp=Math.cos(tor_.rotation.x), sp=Math.sin(tor_.rotation.x), hy=lg.hip[1], hz=lg.hip[2];
      const hipY=tor_.position.y+hy*cp-hz*sp, hipZ=tor_.position.z+hy*sp+hz*cp;
      let gz=hz+fz, gy=fy;
      if(!lg.front&&sit>0){ gz=hz-0.05*sit+fz; }                                         // hind paws tuck forward under the sit
      const wz=gz-hipZ, wy=gy-hipY;                                                       // world (b) space vector hip -> foot
      ik(lg, wy*-sp+wz*cp, wy*cp+wz*sp);                                                  // rotate into the torso's frame
    }
    // head: nods with the front feet at a walk, steadies at speed, looks around, sniffs the ground now and then
    st.sniffT-=dt; if(st.sniffT<0&&st.sniff<=0&&!air&&spd<1.2){ st.sniff=2.2; st.sniffT=6+Math.random()*8; }
    const sn=st.sniff>0?Math.sin(Math.PI*Math.min(1,(2.2-st.sniff)/2.2)):0; if(st.sniff>0) st.sniff-=dt;
    hp.rotation.y=(0.38*Math.sin(t*0.41)+0.1*Math.sin(t*1.3))*(1-move*0.8)*(1-sn);
    hp.rotation.z=0.12*Math.sin(t*0.57)*(1-move);
    hp.rotation.x=k0*0.07*Math.sin(2*c2)*move-0.1*k2*move+sn*(0.55+0.06*Math.sin(t*14))-sit*0.45-tor_.rotation.x*0.5;
    if(x.wings) flap(x.wings,(air||o.fly?0.5:0.15)+(air||o.fly?0.6:0.1)*Math.sin(t*(air||o.fly?9:2)));
  });
},
blob(x,b){ const o=x.o, c=x.c, bt=o.body, jig=Gp(b,[0,0,0]), R=0.15; let bm, hR=0.185, hy=0.15, fo={ey:0.18,my:-0.1};
  const mm=mt(x,c[0]);
  if(bt==='pumpkin'){ for(let k=0;k<6;k++){ const a=k/6*Math.PI; const s=P(jig,sph(16),mm,[0,0.14,0],[0.16,0.13,0.08],{ink:0.06}); s.rotation.y=a; } bm=jig.children[0]; P(jig,cylT(1,1,6),M(c[1]),[0,0.3,0],[0.02,0.06,0.02],{rot:[0,0,0.3]}); hR=0.17; fo={ey:0.15,my:-0.2}; }
  else if(bt==='donut'){ bm=P(jig,tor(0.45,TAU,28),mm,[0,0.17,0],0.12,{ink:0.05}); P(jig,tor(0.47,Math.PI*1.1,24),M(c[1]),[0,0.17,-0.004],0.122,{rot:[0,0,-0.05]}); const r=x.rand; for(let k=0;k<12;k++){ const a=r()*Math.PI, rr=0.12+(r()-0.5)*0.05; P(jig,box(),M(['#ffd23f','#5cf0ff','#ffffff','#7ad84a'][k%4]),[Math.cos(a)*rr,0.17+Math.sin(a)*rr,-0.06],[0.018,0.006,0.006],{rot:[0,0,r()*3]}); }
    hR=0.12; hy=0.17; fo={ey:-0.9,my:-1.25,flat:1}; }
  else if(bt==='scoop'){ P(jig,cone(14),M(c[1]),[0,0.17,0],[0.09,-0.17,0.09],{ink:0.06}); bm=P(jig,sph(18),mm,[0,0.22,0],[0.12,0.1,0.12],{ink:0.06}); P(jig,tor(0.3),mm,[0,0.18,0],[0.11,0.11,0.11],{rot:[Math.PI/2,0,0]}); P(jig,sph(10),M(c[2]),[0,0.335,0],0.03,{ink:0.1}); hR=0.128; hy=0.22; fo={ey:0.1,my:-0.2}; }
  else if(bt==='popcorn'){ const r=x.rand; bm=P(jig,sph(14),mm,[0,0.14,0],0.12,{ink:0.06}); for(let k=0;k<9;k++){ const n=onS(r()*TAU,(r()-0.2)*1.2); P(jig,sph(10),M(k%3?c[0]:c[1]),[n.x*0.1,0.14+n.y*0.1,n.z*0.1+0.03],0.05+r()*0.02,{ink:0.1}); } hR=0.13; hy=0.14; }
  else if(bt==='drop'){ bm=P(jig,sph(18),mm,[0,0.13,0],[0.14,0.13,0.14],{ink:inkK(x,0.06)}); P(jig,cone(14),mm,[0,0.21,0],[0.085,0.14,0.085]); hR=0.148; hy=0.13; }
  else if(bt==='frog'){ bm=P(jig,sph(18),mm,[0,0.12,0],[0.17,0.11,0.15],{ink:0.06}); P(bm,sph(14),M(c[1]),[0,-0.3,-0.25],[0.8,0.7,0.8]); for(const s of[-1,1]){ P(jig,sph(10),mm,[s*0.12,0.03,-0.04],[0.06,0.03,0.08],{ink:0.1}); }
    const hh=Gp(jig,[0,0.13,0]); for(const s of[-1,1]){ const e=Gp(hh,[s*0.07,0.11,-0.06]); P(e,sph(12),mm,[0,0,0],0.05,{ink:0.1}); const g=Gp(e,[0,0.005,-0.035]); x.blinks.push(g); P(g,sph(10),M('#ffffff'),[0,0,0],[0.035,0.035,0.02]); P(g,sph(8),M('#1a1420'),[0,0,-0.015],[0.02,0.024,0.01]); }
    const g=stick(hh,0.15,0,-0.05); P(g,tor(0.12,Math.PI,14),M('#2a1420'),[0,0,0],0.09,{rot:[0,0,Math.PI]}); if(o.cheeks) for(const s of[-1,1]) P(stick(hh,0.15,s*0.65,-0.05),sph(8),M('#ff8aa8',{a:0.7}),[0,0,0],[0.022,0.014,0.006]); hR=0; }
  else if(bt==='snail'){ bm=P(jig,sph(16),mm,[0,0.05,-0.03],[0.09,0.06,0.17],{ink:0.06}); const sh=Gp(jig,[0,0.14,0.04]); P(sh,tor(0.42,TAU,20),M(c[1]),[0,0,0],0.075,{rot:[0,Math.PI/2,0],ink:0.06}); P(sh,sph(12),M(c[1]),[0,0,0],[0.05,0.06,0.06]); P(sh,tor(0.35,TAU,16),M('#c86a2a'),[0.02,0,0],0.04,{rot:[0,Math.PI/2,0]});
    const hh=Gp(jig,[0,0.11,-0.17]); P(hh,sph(14),mm,[0,0,0],0.07,{ink:0.08}); face(x,hh,0.07,{ey:0.2,my:-0.2}); hR=0; x.A.push((t,dt,mv)=>{ bm.scale.z=0.17*(1+0.08*Math.sin(t*2+mv*x.ph)); hh.position.z=-0.17-0.012*Math.sin(t*2+mv*x.ph); }); }
  else if(bt==='jelly'){ bm=P(jig,cyl(0.75,1,18),mm,[0,0.12,0],[0.15,0.22,0.15]); P(jig,cyl(1,1,18),M(c[1],{a:0.8}),[0,0.24,0],[0.11,0.02,0.11]); hR=0.16; hy=0.12; fo={ey:0.25,my:-0.05}; }
  else { bm=P(jig,sph(20),mm,[0,0.15,0],[0.18,0.16,0.18],{ink:inkK(x,0.05)}); }
  if(o.core){ const k=P(jig,sph(12),M(o.core,{e:1}),[0,0.13,0.02],0.06); x.A.push((t)=>{ k.rotation.y=t; k.scale.setScalar(0.06*(1+0.15*Math.sin(t*4))); }); }
  if(o.spots&&bm) spots(x,bm,o.spots,6,o.glowSpots);
  if(o.sugar&&bm){ const r=x.rand; for(let k=0;k<14;k++){ const n=onS(r()*TAU,(r()-0.3)*1.3); P(bm,box(),M('#ffffff'),[n.x,n.y,n.z],0.05,{rot:[r()*3,r()*3,0]}); } }
  if(o.drips) for(let k=0;k<4;k++){ const a=k/4*TAU+0.4; P(jig,sph(8),mm,[Math.cos(a)*0.14,0.025,Math.sin(a)*0.14],[0.04,0.03,0.04]); }
  if(hR) { const hh=Gp(jig,[0,hy,0]); face(x,hh,hR,fo); }
  if(o.glow) x.halo=halo(jig,o.glow,0.6,[0,0.15,0]);
  x.h=0.34;
  x.A.push((t,dt,mv,air)=>{ const hop=air?0:Math.abs(Math.sin(x.ph*0.7)), up=hop*0.1*Math.min(1,mv*1.6), land=mv>0.05&&!air?Math.max(0,1-hop*4):0;
    const wob=0.05*Math.sin(t*3.2+x.seed)+(bt==='jelly'?0.05*Math.sin(t*9):0);
    jig.position.y=up; jig.scale.set(1-wob*0.6+land*0.1,1+wob-land*0.18,1-wob*0.6+land*0.1);
    if(air){ jig.rotation.z=0.15*Math.sin(t*1.3); jig.rotation.x=0.1*Math.sin(t*1.1); } else { jig.rotation.z=0; jig.rotation.x=-0.1*mv; } });
},
bird(x,b){ const o=x.o, c=x.c, fat=o.body==='round'||o.fluffy, mm=mt(x,c[0]); const bd=Gp(b,[0,0.25,0]);
  const bm=P(bd,sph(20),mm,[0,0,0],fat?[0.14,0.14,0.14]:[0.12,0.13,0.14],{ink:inkK(x,0.06)}); P(bm,sph(14),mt(x,c[1]),[0,-0.22,-0.42],[0.7,0.72,0.6]);
  if(o.fluffy){ for(let k=0;k<8;k++){ const a=k/8*TAU; P(bd,sph(8),mm,[Math.cos(a)*0.12,-0.06+0.04*Math.sin(a*3),Math.sin(a)*0.12],0.04); } }
  const hh=Gp(bd,[0,0.09,-0.05]); face(x,hh,0.11,{ey:0.25,my:-0.5}); const R=0.11;
  if(o.mouth!=='fang') P(hh,cone(8),M(o.beakC||(c[1]==='#ff9a2a'?c[1]:'#ffb21a')),[0,-R*.15,-R*.9],[R*.25,R*.45,R*.2],{rot:[-Math.PI/2,0,0],ink:0.12});
  if(o.crest) for(let k=0;k<3;k++) P(hh,cone(6),M(o.crestC||c[1]),[0,R*.85,R*(0.1+k*0.2)],[R*.12,R*.5,R*.12],{rot:[0.4+k*0.3,0,0]});
  x.wings=wings(x,bd,[0.1,0.03,0.01],o.wing||'feather',o.wing==='bat'?0.22:0.17,o.wingC||c[0]);
  if(o.tail==='flame') tail(x,Gp(bd,[0,-0.02,0.12]),'flame'); else { const tp=Gp(bd,[0,-0.02,0.12],[0.5,0,0]); for(let k=-1;k<=1;k++) P(tp,sph(8),M(o.tailC||c[0]),[k*0.03,0,0.05],[0.025,0.012,0.06],{rot:[0,k*0.4,0]}); }
  const feet=[]; if(o.feet!==0) for(const s of[-1,1]){ const p=Gp(bd,[s*0.05,-0.12,0]); P(p,cylT(1,1,6),M('#ffb21a'),[0,0,0],[0.012,0.05,0.012]); P(p,sph(6),M('#ffb21a'),[0,-0.05,-0.01],[0.022,0.01,0.028]); feet.push(p); }
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0,0]);
  x.h=0.5;
  x.A.push((t,dt,mv)=>{ const f=o.wing==='bat'?7:11; const fl=Math.sin(t*f*(1+mv*0.6)); flap(x.wings,0.35+0.75*fl); bd.position.y=0.25-0.02*fl; hh.rotation.y=0.4*Math.sin(t*0.5); hh.rotation.x=0.1*Math.sin(t*3.1);
    feet.forEach((p,i)=>p.rotation.x=0.3*Math.sin(t*3+i)); });
},
drone(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.25,0]), mm=M(c[0]); let R=0.13, fo={ey:0.0,my:-0.4};
  if(o.body==='box'){ P(bd,box(),mm,[0,0,0],[0.22,0.18,0.2],{ink:0.05}); fo.flat=1; R=0.1; }
  else if(o.body==='jet'){ P(bd,sph(18),mm,[0,0,0],[0.09,0.09,0.2],{ink:0.06}); for(const s of[-1,1]) P(bd,box(),mm,[s*0.12,0,0.02],[0.16,0.015,0.07],{rot:[0,s*0.3,0]}); P(bd,box(),M(c[1]),[0,0.07,0.15],[0.015,0.08,0.06]); P(bd,sph(12),M('#5cb8ff',{e:0.3}),[0,0.04,-0.1],[0.05,0.04,0.07]); R=0.09; fo={ey:0.15,my:-0.25}; }
  else if(o.body==='pad'){ P(bd,cyl(1,1,24),mm,[0,0,0],[0.14,0.1,0.14],{ink:0.05}); P(bd,cyl(1,1,24),M(c[1],{e:0.6}),[0,0,0],[0.142,0.025,0.142]); for(let k=0;k<3;k++) P(bd,cone(3),M(c[1],{e:0.8}),[0,0.051,0.05-k*0.05],[0.04,0.035,0.001],{rot:[-Math.PI/2,0,0]}); R=0.14; fo={ey:0.05,my:-0.25}; }
  else { P(bd,sph(22),mm,[0,0,0],R,{ink:0.05}); P(bd,tor(0.12),M(c[1]),[0,0,0],R*1.01,{rot:[Math.PI/2,0,0]}); }
  if(R){ const hh=Gp(bd,[0,0,0]); if(!o.eyes||o.eyes==='big'){ const g=stick(hh,R,0,0,fo.flat); P(g,sph(16),M(c[2]),[0,0,0],[R*.7,R*.5,R*.2]); } face(x,hh,R*(o.body==='box'?1:1.02),Object.assign({},fo,{ey:0.02,my:-0.2}));
    x.A.push((t)=>{ hh.rotation.y=0.25*Math.sin(t*0.7); }); }
  else { const g=Gp(bd,[0,0.035,0]); x.blinks.push(g); for(const s of[-1,1]) P(g,sph(10),M(o.eyeC||c[2],{e:1.3}),[s*0.04,0,-0.08],[0.022,0.008,0.026]); }
  const rot=o.rotor||'prop'; let spin=null, flames=[];
  if(rot==='prop'){ const pole=Gp(bd,[0,R||0.06,0]); P(pole,cyl(1,1,6),M('#3a3a40'),[0,0.03,0],[0.01,0.06,0.01]); spin=Gp(pole,[0,0.06,0]); for(const s of[0,1]) P(spin,box(),M(c[1]),[0,0,0],[0.26,0.008,0.035],{rot:[0,s*Math.PI/2,0.1]}); P(spin,sph(8),M(c[1]),[0,0,0],0.02); }
  if(rot==='ring'){ spin=Gp(bd,[0,-0.01,0]); P(spin,tor(0.08),M(c[1],{e:0.8}),[0,0,0],0.2,{rot:[Math.PI/2,0,0]}); for(let k=0;k<4;k++){ const a=k/4*TAU; P(spin,sph(6),M('#ffffff',{e:1}),[Math.cos(a)*0.2,0,Math.sin(a)*0.2],0.018); } }
  if(rot==='jet') for(const s of(o.body==='jet'?[0]:[-1,1])){ const p=Gp(bd,[s*0.07,-(o.body==='jet'?0:0.09),o.body==='jet'?0.2:0.02],[o.body==='jet'?Math.PI/2:0,0,0]); P(p,cyl(0.8,1,10),M('#3a3a40'),[0,0,0],[0.03,0.06,0.03]); const f=P(p,cone(8),M('#ffb21a',{e:1,a:0.85}),[0,-0.03,0],[0.022,-0.09,0.022]); flames.push(f); halo(p,'#ff9a3a',0.12,[0,-0.06,0]); }
  if(o.arms){ for(const s of[-1,1]){ const p=Gp(bd,[s*0.13,-0.02,0],[0,0,s*0.6]); P(p,cylT(1,1,6),M('#3a3a40'),[0,0,0],[0.012,0.09,0.012]); P(p,sph(8),M(c[1]),[0,-0.09,0],0.025); x.A.push((t)=>{ p.rotation.z=s*(0.6+0.25*Math.sin(t*2.1+s)); p.rotation.x=0.3*Math.sin(t*1.7); }); } }
  if(o.glow) x.halo=halo(bd,o.glow,0.55,[0,0,0]);
  x.h=0.45;
  x.A.push((t,dt,mv)=>{ if(spin) spin.rotation.y+=dt*(rot==='ring'?2.5:28); for(const f of flames) f.scale.y=-0.09*(1+0.3*Math.sin(t*31)+mv*0.6); bd.rotation.z=0.06*Math.sin(t*1.7); });
},
alien(x,b){ const o=x.o, c=x.c, mm=mt(x,c[0]), Y=0.1; const torso=Gp(b,[0,Y,0]);
  const bm=P(torso,sph(16),mm,[0,0.075,0],[0.075,0.095,0.07],{ink:inkK(x,0.08)}); if(!o.wrap&&!o.icing) P(bm,sph(12),mt(x,c[1]),[0,-0.15,-0.4],[0.75,0.7,0.7]);
  if(o.icing){ for(let k=0;k<3;k++) P(bm,sph(8),M('#e8202c'),[0,0.4-k*0.35,-0.95],0.13); }
  if(o.wrap) for(let k=0;k<4;k++) P(bm,tor(0.12),M(c[1]),[0,-0.6+k*0.4,0],[1.0,1.0,1.0],{rot:[Math.PI/2+(k%2?0.2:-0.2),0,0]});
  const R=0.13, hh=Gp(torso,[0,0.27,0]); P(hh,sph(20),mm,[0,0,0],o.tall?[R,R*1.25,R*0.95]:[R,R*0.95,R*0.92],{ink:inkK(x,0.06)});
  face(x,hh,R,{ey:o.eyes==='one'?0.05:0.08,my:-0.4});
  if(o.wrap) for(let k=0;k<3;k++) P(hh,tor(0.1),M(c[1]),[0,R*(-0.5+k*0.45),0],[R*1.0,R*1.0,R*1.0],{rot:[Math.PI/2+(k%2?0.25:-0.15),0,0]});
  if(o.icing) for(let k=0;k<2;k++) P(hh,tor(0.08,Math.PI,12),M('#ffffff'),[0,R*0.65-k*0.05,0],[R*0.8,R*0.8,R*0.8],{rot:[0,Math.PI/2,0]});
  const legs=[], arms=[]; const lm=o.metal?M(c[1]):mm;
  for(const s of[-1,1]){ const p=Gp(b,[s*0.042,Y+0.01,0]); P(p,cylT(1,0.9,8),lm,[0,0,0],[0.028,Y-0.02,0.028],{ink:inkK(x,0.12)}); P(p,sph(10),M(o.metal?c[1]:c[1]),[0,-(Y-0.02),-0.012],[0.034,0.024,0.046],{ink:inkK(x,0.1)}); legs.push([p,s]);
    const a=Gp(torso,[s*0.07,0.12,0],[0,0,s*0.35]); P(a,cylT(1,0.8,8),lm,[0,0,0],[0.022,0.085,0.022],{ink:inkK(x,0.12)}); P(a,sph(10),mt(x,c[o.metal?1:0]),[0,-0.09,0],0.028,{ink:inkK(x,0.1)}); arms.push([a,s]); }
  let flames=[]; if(o.jet){ const pk=Gp(torso,[0,0.08,0.075]); for(const s of[-1,1]){ P(pk,cyl(1,1,10),M('#c9cfd8'),[s*0.035,0,0],[0.03,0.11,0.03],{ink:0.08}); const f=P(pk,cone(8),M('#ffb21a',{e:1,a:0.85}),[s*0.035,-0.055,0],[0.022,-0.08,0.022]); flames.push(f); halo(pk,'#ff9a3a',0.14,[s*0.035,-0.1,0]); } }
  if(o.glow) x.halo=halo(torso,o.glow,0.6,[0,0.2,0]);
  x.h=Y+0.27+R*1.2;
  x.A.push((t,dt,mv,air,S)=>{ const ph=x.ph, ch=S&&S.cheer>=0&&S.cheer<1;
    for(const [p,s] of legs) p.rotation.x=air?0.4*Math.sin(t*3+s):0.75*mv*Math.sin(ph+(s>0?Math.PI:0));
    for(const [a,s] of arms){ a.rotation.x=air?0.2*Math.sin(t*2+s):-0.7*mv*Math.sin(ph+(s>0?Math.PI:0))+0.08*Math.sin(t*1.6+s); a.rotation.z=s*(ch?2.6+0.3*Math.sin(t*14):air?1.1+0.2*Math.sin(t*2.6+s):0.3+0.06*Math.sin(t*1.9+s)); }
    torso.position.y=Y+(air?0:Math.abs(Math.sin(ph))*0.02*mv); torso.rotation.z=air?0:0.09*mv*Math.sin(ph); hh.rotation.z=0.1*Math.sin(t*0.63); hh.rotation.y=0.35*Math.sin(t*0.4)*(1-mv);
    for(const f of flames) f.scale.y=-0.08*(1+0.35*Math.sin(t*29)); });
},
jelly(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.3,0]); const bell=Gp(bd); P(bell,hemi(),M(c[0],{a:0.78,ds:1,e:o.glow?0.4:0.1}),[0,0,0],[0.15,0.13,0.15]); P(bell,sph(14),M(c[1],{e:o.glow?0.8:0.2,a:0.9}),[0,0.03,0],[0.08,0.06,0.08]);
  P(bell,tor(0.12),M(c[1],{a:0.9}),[0,0,0],0.15,{rot:[Math.PI/2,0,0]}); const hh=Gp(bell,[0,0.05,0]); face(x,hh,0.13,{ey:0.15,my:-0.1});
  const tents=[]; const tm=M(c[1],{a:0.8,e:o.glow?0.5:0}); for(let k=0;k<7;k++){ const a=k/7*TAU; const p=Gp(bd,[Math.cos(a)*0.11,0,Math.sin(a)*0.11],[Math.PI/2,0,0]); const s=chain(p,4,0.05,0.016,0.008,tm); tents.push([p,s,a]); }
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0,0]);
  x.h=0.5;
  x.A.push((t,dt,mv)=>{ const pu=Math.sin(t*3.2); bell.scale.set(1+0.08*pu,1-0.1*pu,1+0.08*pu); bd.position.y=0.3+0.02*Math.sin(t*3.2-1);
    for(const [p,s,a] of tents) for(let i=0;i<s.length;i++){ s[i].rotation.x=0.25*Math.sin(t*3.2-i*0.7+a)+mv*0.25; s[i].rotation.y=0.2*Math.sin(t*2.1-i*0.6+a*2); } });
},
ghost(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.18,0]); let body;
  if(o.body==='cloud'){ const cm=mt(x,c[0]); body=Gp(bd); for(const [px,py,r] of [[0,0.1,0.12],[-0.1,0.06,0.09],[0.1,0.06,0.09],[0.05,0.16,0.08],[-0.06,0.15,0.07]]) P(body,sph(14),cm,[px,py,0],r,{ink:0.07}); const hh=Gp(bd,[0,0.08,0]); face(x,hh,0.12,{ey:0.15,my:-0.2});
    if(o.bolt){ const bl=Gp(bd,[0,-0.04,0]); const bm=M(c[1],{e:1.2}); P(bl,box(),bm,[0,-0.03,0],[0.02,0.08,0.02],{rot:[0,0,0.4]}); P(bl,box(),bm,[0.01,-0.09,0],[0.02,0.07,0.02],{rot:[0,0,-0.4]}); x.A.push((t)=>{ bl.visible=(t*1.3%2)<0.25; }); } }
  else { if(!GEO.has('ghost')){ const pts=[]; for(let i=0;i<=8;i++){ const a=i/8*Math.PI/2; pts.push(new T.Vector2(0.14*Math.sin(a),0.2+0.14*Math.cos(a))); } pts.push(new T.Vector2(0.15,0.12),new T.Vector2(0.165,0.04),new T.Vector2(0.18,0)); const g=new T.LatheGeometry(pts,22); g.userData.keep=true; GEO.set('ghost',g); }
    body=P(bd,GEO.get('ghost'),mt(x,c[0],{ds:1,e:o.glow?0.25:0}),[0,-0.08,0],1); const hm=mt(x,c[0]); const bumps=[];
    for(let k=0;k<8;k++){ const a=k/8*TAU; bumps.push(P(bd,sph(10),hm,[Math.cos(a)*0.16,-0.08,Math.sin(a)*0.16],0.035)); }
    const hh=Gp(bd,[0,0.12,0]); face(x,hh,0.14,{ey:0.15,my:-0.12});
    const arms=[]; for(const s of[-1,1]){ const p=Gp(bd,[s*0.15,0.05,0]); P(p,sph(10),hm,[s*0.03,-0.02,0],[0.04,0.025,0.03]); arms.push([p,s]); }
    if(o.lantern){ const lp=Gp(arms[1][0],[0.05,-0.03,0]); P(lp,cylT(1,1,4),M('#2a2630'),[0,0,0],[0.005,0.05,0.005]); P(lp,cyl(0.7,1,8),M('#2a2630'),[0,-0.05,0],[0.035,0.012,0.035]); const lb=P(lp,sph(10),M('#ffe14a',{e:1.5}),[0,-0.085,0],0.03); halo(lp,'#ffe14a',0.35,[0,-0.085,0]); P(lp,cyl(1,0.7,8),M('#2a2630'),[0,-0.12,0],[0.035,0.012,0.035]); x.A.push((t)=>{ lp.rotation.z=0.25*Math.sin(t*1.8); lb.scale.setScalar(0.03*(1+0.1*Math.sin(t*11))); }); }
    x.A.push((t)=>{ bumps.forEach((m,k)=>m.position.y=-0.08+0.02*Math.sin(t*4-k*0.9)); for(const [p,s] of arms) p.rotation.z=s*0.4*Math.sin(t*2.3+s); }); }
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0.06,0]);
  x.h=0.45;
  x.A.push((t,dt,mv)=>{ bd.rotation.z=0.12*Math.sin(t*1.4); bd.position.y=0.18+0.03*Math.sin(t*1.9); bd.rotation.x=mv*0.3; });
},
fish(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.25,0]), mm=mt(x,c[0]); const bt=o.body;
  const sz=bt==='puffer'?[0.14,0.13,0.14]:bt==='tad'?[0.11,0.1,0.12]:bt==='angler'?[0.13,0.12,0.15]:[0.09,0.12,0.16];
  const bm=P(bd,sph(20),mm,[0,0,0],sz,{ink:0.05}); P(bm,sph(14),M(c[1]),[0,-0.4,-0.1],[0.75,0.65,0.85]);
  if(o.stripes) for(let k=0;k<2;k++) P(bm,tor(0.12),M(c[1]),[0,0,-0.35+k*0.55],[1.0-k*0.08,1.0-k*0.08,1],{rot:[0,0,0]});
  if(bt==='puffer') for(let k=0;k<16;k++){ const n=onS(k*2.4,(k%5-2)*0.45); const sp=P(bd,cone(6),M(c[1]),[n.x*0.13,n.y*0.12,n.z*0.13],[0.012,0.04,0.012]); sp.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),n); }
  const hh=Gp(bd,[0,0.02,0]); face(x,hh,bt==='tad'?0.11:0.12,{ey:0.12,my:-0.25});
  const tp=Gp(bd,[0,0,sz[2]*0.9]); const tl=P(tp,cone(8),M(bt==='tad'?c[0]:c[1]),[0,0,0],[bt==='tad'?0.05:0.08,bt==='tad'?0.2:0.11,0.02],{rot:[Math.PI/2,0,0],ink:0.06}); tl.rotation.set(Math.PI/2,0,0);
  const dor=P(bd,cone(6),M(c[1]),[0,sz[1]*0.9,0.02],[0.012,o.fins==='big'?0.09:0.06,0.05],{rot:[-0.4,0,0]});
  const fins=[]; for(const s of[-1,1]){ const p=Gp(bd,[s*sz[0]*0.9,-0.02,-0.02]); P(p,sph(8),M(c[1],{a:0.9}),[s*0.03,0,0.01],o.fins==='big'?[0.05,0.008,0.04]:[0.035,0.006,0.025]); fins.push([p,s]); }
  if(bt==='angler'){ const p=Gp(bd,[0,sz[1]*0.9,-0.05],[-0.6,0,0]); const s=chain(p,3,0.04,0.006,0.006,M(c[0])); s.forEach(g=>g.rotation.x=-0.5); P(s[2],sph(10),M(c[2],{e:1.6}),[0,0,0.05],0.025); halo(s[2],c[2],0.25,[0,0,0.05]); x.A.push((t)=>{ s[0].rotation.y=0.3*Math.sin(t*1.7); }); }
  if(o.glow&&bt!=='angler') x.halo=halo(bd,o.glow,0.6,[0,0,0]);
  x.h=0.5;
  x.A.push((t,dt,mv)=>{ const f=5*(1+mv); tp.rotation.y=0.55*Math.sin(t*f); bd.rotation.y=-0.12*Math.sin(t*f); for(const [p,s] of fins) p.rotation.z=s*(0.2+0.4*Math.sin(t*6+s));
    if(bt==='puffer'){ const k=1+0.08*Math.sin(t*1.2); bd.scale.setScalar(k); } });
},
bug(x,b){ const o=x.o, c=x.c, bt=o.body, bd=Gp(b,[0,0.27,0]), mm=mt(x,c[0]);
  let wingT=o.wing||'bug', wsz=o.wing==='butterfly'?0.2:0.14, legsN=6;
  if(bt==='spider'){ wingT=null; legsN=8; const th=Gp(b,[0,0.6,0]); P(th,cylT(1,1,4),M('#ffffff',{a:0.6}),[0,0.5,0],[0.003,0.5,0.003]); x.A.push((t)=>{ bd.position.y=0.27+0.04*Math.sin(t*1.3); }); }
  const ab=P(bd,sph(18),bt==='lady'||bt==='beetle'?M(c[1]):mm,[0,0,0.07],bt==='spider'?[0.1,0.09,0.1]:[0.08,0.08,0.11],{ink:inkK(x,0.06)});
  if(o.stripes) for(let k=0;k<3;k++) P(ab,tor(0.18),M(c[1]),[0,0,-0.4+k*0.4],[1-Math.abs(k-1)*0.1,1-Math.abs(k-1)*0.1,1]);
  if(bt==='firefly'){ const gl=P(bd,sph(14),M(c[1],{e:1.6}),[0,-0.01,0.15],0.06); const h=halo(bd,c[1],0.5,[0,0,0.15]); x.A.push((t)=>{ const k=0.5+0.5*Math.sin(t*2.5); gl.material===gl.material; h.material.opacity=0.25+0.6*k; gl.scale.setScalar(0.055+0.01*k); }); }
  if(bt==='lady'||bt==='beetle'){ for(const s of[-1,1]){ const sh=P(bd,sph(16),M(c[0]),[s*0.04,0.02,0.07],[0.06,0.075,0.12],{ink:0.07}); if(bt==='lady') for(let k=0;k<3;k++) P(sh,sph(8),M('#1a1420'),[s*0.45,0.6,-0.5+k*0.5],[0.3,0.3,0.25]); } }
  if(bt==='moth'){ P(bd,sph(10),M('#ffffff'),[0,0.03,-0.04],[0.075,0.06,0.06]); }
  const R=0.075; const hh=Gp(bd,[0,0.01,-0.09]); P(hh,sph(16),mm,[0,0,0],R,{ink:inkK(x,0.08)}); face(x,hh,R,{ey:0.1,my:-0.35});
  if(o.horns==='uni') {}
  if(wingT){ x.wings=wings(x,bd,[0.03,0.07,0.02],wingT,wsz,o.wingC); }
  const legs=[]; for(let k=0;k<legsN;k++){ const s=k%2?1:-1, i=Math.floor(k/2); const p=Gp(bd,[s*0.05,-0.03,-0.03+i*(legsN>6?0.03:0.04)],[0,0,s*(bt==='spider'?-1.2:-0.4)]); P(p,cylT(1,1,4),M('#1a1420'),[0,0,0],[0.007,bt==='spider'?0.1:0.07,0.007]); if(bt==='spider'){ const q=Gp(p,[0,-0.1,0],[0,0,s*1.4]); P(q,cylT(1,1,4),M('#1a1420'),[0,0,0],[0.006,0.08,0.006]); } legs.push([p,s,i]); }
  if(o.glow&&bt!=='firefly') x.halo=halo(bd,o.glow,0.6,[0,0,0]);
  x.h=0.45;
  x.A.push((t,dt,mv)=>{ if(x.wings){ if(wingT==='butterfly') flap(x.wings,0.15+0.9*Math.max(0,Math.sin(t*7*(1+mv*0.4)))); else flap(x.wings,0.3+0.4*Math.sin(t*70)); }
    for(const [p,s,i] of legs) p.rotation.x=0.25*Math.sin(t*(bt==='spider'?4:3)+i*1.3+s);
    ab.rotation.x=0.08*Math.sin(t*2); hh.rotation.y=0.3*Math.sin(t*0.6); if(bt!=='spider') bd.position.y=0.27+0.012*Math.sin(t*9); });
},
dragon(x,b){ const o=x.o, c=x.c, s0=o.s||1, bd=Gp(b,[0,0.25,0]), mm=mt(x,c[0]);
  const bm=P(bd,sph(20),mm,[0,0,0],[0.1,0.1,0.14],{ink:0.06}); P(bm,sph(14),M(c[1]),[0,-0.35,-0.25],[0.72,0.7,0.82]);
  if(o.spots) spots(x,bm,o.spots,8,true);
  if(o.snout!=='beak') for(let k=0;k<4;k++) P(bd,cone(6),M(c[1]),[0,0.09-k*0.006,-0.04+k*0.05],[0.02,0.04,0.02],{rot:[0.3,0,0]});
  const R=0.1, hp=Gp(bd,[0,0.1,-0.12]); const hh=head(x,hp,[0,0,0],R,c[0],{ey:0.25,my:-0.6});
  if(o.snout==='beak') P(hh,cone(8),M('#ffb21a'),[0,-R*.15,-R*.85],[R*.3,R*.55,R*.25],{rot:[-Math.PI/2,0,0],ink:0.1});
  else { P(hh,sph(14),mm,[0,-R*.3,-R*.75],[R*.55,R*.4,R*.5],{ink:0.1}); for(const s of[-1,1]) P(hh,sph(6),M('#1a1420'),[s*R*.18,-R*.15,-R*1.2],R*.05); }
  const puff=P(hh,cone(8),M(c[2],{e:1.2,a:0.85}),[0,-R*.3,-R*1.2],[R*.25,R*.9,R*.25],{rot:[-Math.PI/2,0,0]}); puff.visible=false;
  x.wings=wings(x,bd,[0.07,0.07,0],o.wing||'bat',0.24,o.wingC);
  const tp=Gp(bd,[0,0,0.13]); if(o.tail==='fluff') tail(x,tp,'fluff',c[1]); else { const s=chain(tp,5,0.045,0.04,0.015,mm,{ink:0.1}); tp.rotation.x=0.3; P(s[4],cone(4),M(c[1]),[0,0,0.05],[0.035,0.05,0.012],{rot:[Math.PI/2,0,0]}); x.A.push((t)=>{ for(let i=0;i<s.length;i++){ s[i].rotation.y=0.25*Math.sin(t*2-i*0.6); s[i].rotation.x=0.1*Math.sin(t*1.5-i*0.5); } }); }
  const lg=[]; for(const [sx,sz] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ const p=Gp(bd,[sx*0.06,-0.07,sz*0.06]); P(p,sph(8),mm,[0,-0.02,0],[0.025,0.035,0.03]); lg.push(p); }
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0,0]);
  x.h=0.5;
  x.A.push((t,dt,mv,air,S)=>{ const fl=Math.sin(t*6*(1+mv*0.4)); flap(x.wings,0.25+0.7*fl); bd.position.y=0.25+0.025*fl; hp.rotation.x=0.06*Math.sin(t*6); hp.rotation.y=0.3*Math.sin(t*0.45);
    const ch=S&&S.cheer>=0&&S.cheer<1; puff.visible=ch&&S.cheer>0.45; if(puff.visible) puff.scale.y=R*0.9*(0.6+0.6*Math.sin(t*30)); lg.forEach((p,i)=>p.rotation.x=0.3*Math.sin(t*3+i)); });
},
sprout(x,b){ const o=x.o, c=x.c, bt=o.body||'pot', jig=Gp(b); let hh, hR=0.11;
  if(bt==='pot'){ P(jig,cyl(1,0.75,16),M(c[1]),[0,0.07,0],[0.1,0.13,0.1],{ink:0.06}); P(jig,cyl(1,1,16),M(c[1]),[0,0.135,0],[0.11,0.02,0.11]); P(jig,cyl(1,1,16),M('#5a3a20'),[0,0.14,0],[0.095,0.01,0.095]);
    hh=Gp(jig,[0,0.24,0]); P(hh,sph(18),mt(x,c[0]),[0,0,0],hR,{ink:0.06}); face(x,hh,hR,{ey:0.1,my:-0.3});
    const lv=[]; for(const s of[-1,1]){ const p=Gp(hh,[0,hR*0.9,0],[0,0,s*0.6]); P(p,sph(10),M(c[0]),[0,0.06,0],[0.03,0.07,0.012],{ink:0.1}); lv.push([p,s]); }
    if(o.flower){ const f=Gp(hh,[0,hR+0.07,0]); for(let k=0;k<6;k++){ const a=k/6*TAU; P(f,sph(8),M(c[2]),[Math.cos(a)*0.035,0.0,Math.sin(a)*0.035],[0.025,0.01,0.025]); } P(f,sph(8),M('#ffd23f'),[0,0.005,0],0.02); x.A.push((t,dt,mv,air,S)=>{ f.rotation.y+=dt*(S&&S.cheer>=0&&S.cheer<1?12:0.5); }); }
    x.A.push((t)=>{ for(const [p,s] of lv) p.rotation.z=s*(0.6+0.2*Math.sin(t*2.2+s)); }); }
  else if(bt==='cupcake'){ const w=P(jig,cyl(1,0.75,14),M(c[1]),[0,0.07,0],[0.1,0.13,0.1],{ink:0.06}); for(let k=0;k<7;k++){ const a=k/7*TAU; P(jig,box(),M('#ffffff'),[Math.cos(a)*0.088,0.07,Math.sin(a)*0.088],[0.008,0.12,0.008],{rot:[0,-a,Math.cos(a)*0.0]}); }
    hh=Gp(jig,[0,0.17,0]); hR=0.12; P(hh,sph(18),M(c[0]),[0,0,0],[0.12,0.08,0.12],{ink:0.06}); P(hh,sph(14),M(c[0]),[0,0.06,0],[0.08,0.06,0.08],{ink:0.07}); P(hh,sph(10),M(c[2]),[0,0.13,0],0.028,{ink:0.1});
    const r=x.rand; for(let k=0;k<10;k++){ const n=onS(r()*TAU,0.3+r()*0.9); P(hh,box(),M(['#ffd23f','#5cf0ff','#7ad84a','#ffffff'][k%4]),[n.x*0.115,n.y*0.08+0.005,n.z*0.115],[0.016,0.005,0.005],{rot:[0,r()*3,0]}); }
    face(x,hh,0.12,{ey:-0.15,my:-0.5}); }
  else if(bt==='cactus'){ P(jig,cyl(1,0.8,14),M(c[1]),[0,0.04,0],[0.08,0.08,0.08],{ink:0.06}); const cb=P(jig,sph(18),M(c[0]),[0,0.17,0],[0.08,0.12,0.08],{ink:0.06}); for(let k=0;k<5;k++) P(cb,tor(0.05),M('#3a8a3a'),[0,0,0],[0.995,1,1],{rot:[0,k/5*Math.PI,0]}).scale.set(1.0,1.0,1.0);
    for(const s of[-1,1]){ const p=Gp(jig,[s*0.075,0.15,0],[0,0,s*-0.3]); P(p,cylT(1,1,8),M(c[0]),[0,0,0],[0.025,0.05,0.025],{rot:[0,0,s*Math.PI/2]}); const q=P(p,sph(10),M(c[0]),[s*0.05,0.03,0],[0.025,0.05,0.025]); x.A.push((t)=>{ p.rotation.z=s*(-0.3+0.15*Math.sin(t*2+s)); }); }
    const r=x.rand; for(let k=0;k<14;k++){ const n=onS(r()*TAU,(r()-0.4)*1.4); const sp=P(cb,cone(4),M('#fff8e0'),[n.x,n.y,n.z],[0.03,0.12,0.03]); sp.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),n); }
    const f=Gp(jig,[0,0.29,0]); for(let k=0;k<5;k++){ const a=k/5*TAU; P(f,sph(8),M(c[2]),[Math.cos(a)*0.025,0,Math.sin(a)*0.025],[0.02,0.01,0.02]); }
    hh=Gp(jig,[0,0.17,0]); face(x,hh,0.08,{ey:0.15,my:-0.15}); }
  else if(bt==='shroom'){ const st=P(jig,cyl(0.8,1,14),M(c[1]),[0,0.09,0],[0.07,0.15,0.07],{ink:0.06}); hh=Gp(jig,[0,0.09,0]); face(x,hh,0.075,{ey:0.1,my:-0.35});
    const cap=Gp(jig,[0,0.15,0]); const cm=P(cap,hemi(),M(c[0],{e:o.glow?0.35:0}),[0,0,0],[0.15,0.12,0.15],{ink:0.05}); P(cap,cyl(1,1,18),M(c[1]),[0,0.002,0],[0.148,0.01,0.148]); spots(x,cm,c[2],6,o.glowSpots);
    x.A.push((t,dt,mv)=>{ cap.rotation.z=0.06*Math.sin(t*1.8); cap.rotation.x=0.05*Math.sin(t*1.3)-mv*0.1; }); }
  const ft=[]; for(const s of[-1,1]) ft.push([P(b,sph(10),M(bt==='shroom'?c[1]:'#5a3a20'),[s*0.05,0.012,0],[0.03,0.018,0.04]),s]);
  if(o.glow) x.halo=halo(jig,o.glow,0.6,[0,0.18,0]);
  x.h=0.36;
  x.A.push((t,dt,mv,air)=>{ const hop=air?0:Math.abs(Math.sin(x.ph*0.8))*mv; jig.position.y=hop*0.05; jig.rotation.z=(air?0.15*Math.sin(t*1.3):0.1*mv*Math.sin(x.ph*0.8))+0.04*Math.sin(t*1.1);
    for(const [f,s] of ft) f.position.z=air?0:0.03*mv*Math.sin(x.ph+(s>0?Math.PI:0)); if(hh) hh.rotation.y=0.25*Math.sin(t*0.5); });
},
noodle(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.27,0]), mm=mt(x,c[0]); const R=0.085;
  const hh=Gp(bd,[0,0,-0.12]); P(hh,sph(18),mm,[0,0,0],[R,R*0.95,R*1.05],{ink:0.07}); face(x,hh,R,{ey:0.15,my:-0.35});
  if(o.whisk) for(const s of[-1,1]){ const p=Gp(hh,[s*R*.4,-R*.2,-R*.85],[0,0,0]); const w=chain(p,3,0.03,0.005,0.004,M(c[1])); w.forEach(g=>g.rotation.y=s*0.6); x.A.push((t)=>{ w.forEach((g,i)=>g.rotation.x=0.3*Math.sin(t*2+i)); }); }
  const segs=[]; let p=Gp(bd,[0,0,-0.08]); const n=o.ears==='round'?6:8;
  for(let i=0;i<n;i++){ const g=Gp(p,[0,0,i?0.05:0]); const r=0.07*(1-i/n*0.55); P(g,sph(12),o.stripes&&i%2?M(c[1],{e:o.glow?0.8:0}):mm,[0,0,0.025],[r,r,0.05],{ink:0.08}); if(o.fins&&i%2===0) P(g,cone(4),M(c[1],{e:o.glow?0.6:0}),[0,r*0.8,0.025],[0.008,0.035,0.025]); segs.push(g); p=g; }
  if(o.ears==='round'){ for(const [sx,sz] of [[-1,0],[1,0],[-1,1],[1,1]]){ P(segs[sz?n-2:1],sph(8),mm,[sx*0.05,-0.05,0.02],[0.02,0.04,0.02]); } P(segs[n-1],cone(6),mm,[0,0,0.04],[0.02,0.06,0.02],{rot:[Math.PI/2,0,0]}); }
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0,0.1]);
  x.h=0.45;
  x.A.push((t,dt,mv)=>{ const f=3*(1+mv); for(let i=0;i<segs.length;i++){ segs[i].rotation.y=0.38*Math.sin(t*f-i*0.75); segs[i].rotation.x=0.12*Math.sin(t*f*0.6-i*0.5); } hh.rotation.y=-0.25*Math.sin(t*f+0.8); bd.rotation.y=0; });
},
saucer(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.24,0]); const disk=P(bd,sph(28),M(c[0]),[0,0,0],[0.2,0.05,0.2],{ink:0.05}); P(bd,tor(0.15,TAU,32),M(c[1]),[0,0,0],0.19,{rot:[Math.PI/2,0,0]});
  P(bd,sph(18),M('#3a3a40'),[0,-0.025,0],[0.09,0.035,0.09]);
  const lights=[]; const ring=Gp(bd); for(let k=0;k<10;k++){ const a=k/10*TAU; lights.push(P(ring,sph(6),M(c[2],{e:1.4}),[Math.cos(a)*0.19,-0.005,Math.sin(a)*0.19],0.016)); }
  const pil=Gp(bd,[0,0.06,0]); P(pil,sph(16),M(o.pilot||'#7ad84a'),[0,0,0],0.055); face(x,pil,0.055,{ey:0.15,my:-0.35}); if(o.pilotAcc) acc(x,pil,0.055,o.pilotAcc);
  P(bd,hemi(),M('#c8f0ff',{a:0.3}),[0,0.035,0],0.09);
  const beam=P(bd,cone(16),M(c[2],{flat:1,add:1,a:0.3}),[0,-0.035,0],[0.1,-0.25,0.1]);
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0,0]);
  x.h=0.42;
  x.A.push((t,dt,mv)=>{ ring.rotation.y=t*1.5; lights.forEach((l,k)=>l.visible=((Math.floor(t*8)+k)%3)!==0); bd.rotation.z=0.1*Math.sin(t*1.3); bd.rotation.x=0.07*Math.sin(t*1.7)+mv*0.2;
    beam.material.opacity=0.2+0.12*Math.sin(t*6); beam.scale.y=-0.25*(1+0.1*Math.sin(t*3)); pil.rotation.y=0.6*Math.sin(t*0.6); });
},
wisp(x,b){ const o=x.o, c=x.c, el=o.el||'fire', bd=Gp(b,[0,0.26,0]); const R=0.1; let core, shell;
  const solid=el==='rock'||el==='leaf'||el==='blocks'||el==='cloud';
  if(el==='cloud'){ const cm=M(c[0]); for(const [px,py,r] of [[0,0.02,0.1],[-0.09,-0.01,0.075],[0.09,-0.01,0.075],[0.04,0.08,0.07],[-0.05,0.07,0.06]]) P(bd,sph(14),cm,[px,py,0],r,{ink:0.07});
    const drops=[]; for(let k=0;k<5;k++) drops.push(P(bd,sph(6),M(c[1]),[(k-2)*0.04,-0.1,0],[0.008,0.018,0.008])); x.A.push((t)=>{ drops.forEach((d,k)=>{ const u=(t*0.9+k*0.37)%1; d.position.y=-0.08-u*0.18; d.visible=u<0.9; }); }); }
  else if(el==='rock'){ core=P(bd,ico(),M(c[0]),[0,0,0],R*1.05,{ink:0.06}); }
  else if(el==='blocks'){ core=P(bd,box(),M(c[1]),[0,0,0],R*1.4,{ink:0.06}); P(core,box(),M(c[0],{e:0.9}),[0,0,0],1.02).scale.set(1.02,0.15,1.02); }
  else if(el==='leaf'){ core=P(bd,sph(16),M(c[0]),[0,0,0],R,{ink:0.06}); for(let k=0;k<5;k++){ const a=k/5*TAU; P(bd,sph(8),M(c[1]),[Math.cos(a)*0.02,R*0.95,Math.sin(a)*0.02],[0.02,0.05,0.012],{rot:[Math.sin(a)*0.8,0,-Math.cos(a)*0.8]}); } }
  else { core=P(bd,sph(16),M(c[1],{e:1.4}),[0,0,0],R*0.55); shell=P(bd,el==='ice'?oct():sph(18),M(c[0],{a:el==='void'?0.92:0.7,e:el==='void'?0.2:0.6}),[0,0,0],el==='ice'?[R*1.1,R*1.4,R*1.1]:R,{ink:el==='void'?0.06:0}); }
  if(el==='fire'){ const fl=[]; for(let k=0;k<3;k++) fl.push(P(bd,cone(8),M(k?c[1]:c[0],{e:1.2,a:0.85}),[(k-1)*0.03,R*0.6,0],[0.045-k*0.01,0.12+k*0.02,0.045-k*0.01])); x.A.push((t)=>{ fl.forEach((f,k)=>{ f.scale.y=(0.12+k*0.02)*(1+0.25*Math.sin(t*(13+k*4)+k)); f.rotation.z=0.15*Math.sin(t*(5+k)); }); }); }
  if(el==='storm'){ const cm=M(c[0]); for(const [px,py,r] of [[-0.08,0.0,0.07],[0.08,0.0,0.07],[0,0.07,0.08]]) P(bd,sph(12),cm,[px,py,0],r,{ink:0.08}); const bl=P(bd,box(),M(c[1],{e:1.5}),[0,-0.12,0],[0.02,0.08,0.02],{rot:[0,0,0.5]}); x.A.push((t)=>{ bl.visible=(t*1.7%1.6)<0.18; }); }
  if(el==='star'){ for(let k=0;k<5;k++){ const a=k/5*TAU; P(bd,cone(4),M(c[0],{e:1}),[Math.sin(a)*R*0.8,Math.cos(a)*R*0.8,0],[0.035,0.07,0.02],{rot:[0,0,-a]}); } }
  // orbiting bits
  const orb=Gp(bd), bits=[]; const bm=el==='fire'?M(c[1],{e:1.3}):el==='ice'?M(c[1],{e:0.4}):el==='storm'?M(c[1],{e:1.3}):el==='rock'?M(c[1]):el==='leaf'?M(c[1]):el==='void'?M(c[2],{e:1.2}):el==='blocks'?M(c[1]):el==='cloud'?null:M(c[2],{e:1});
  if(bm) for(let k=0;k<5;k++){ const a=k/5*TAU, r0=0.16+(k%2)*0.04; const g=el==='rock'?ico():el==='ice'?oct():el==='blocks'?box():el==='leaf'?sph(8):el==='star'?oct():sph(8); const s=el==='leaf'?[0.025,0.01,0.04]:el==='blocks'?0.035:0.02+(k%2)*0.008;
    bits.push([P(orb,g,bm,[Math.cos(a)*r0,0,Math.sin(a)*r0],s,{ink:solid?0.12:0}),a,r0,k]); }
  const hh=Gp(bd,[0,0,0]); face(x,hh,el==='blocks'?R*0.7:el==='ice'?R*0.95:R,{ey:0.1,my:-0.3,flat:el==='blocks'});
  if(!solid||o.glow) x.halo=halo(bd,o.glow||c[el==='void'?2:1],el==='void'?0.55:0.75,[0,0,0]);
  x.h=0.45;
  x.A.push((t,dt,mv)=>{ orb.rotation.y=t*(el==='void'?-1.6:1.2); orb.rotation.x=0.4*Math.sin(t*0.5); for(const [m,a,r,k] of bits){ m.position.y=0.03*Math.sin(t*2+k); m.rotation.x=t*(1+k*0.3); m.rotation.y=t; }
    if(core&&!solid) core.scale.setScalar(R*0.55*(1+0.12*Math.sin(t*7)+0.06*Math.sin(t*13))); if(core&&solid) core.rotation.y=0.3*Math.sin(t*0.7);
    if(shell&&el==='ice') shell.rotation.y=t*0.6; if(x.halo) x.halo.material.opacity=0.45+0.2*Math.sin(t*3); });
},
octo(x,b){ const o=x.o, c=x.c, bd=Gp(b,[0,0.24,0]), mm=mt(x,c[0]); const R=0.13; const hh=Gp(bd,[0,0.08,0]);
  const hm=P(hh,sph(20),mm,[0,0,0],[R,R*1.12,R],{ink:0.06}); if(o.spots) spots(x,hm,o.spots,7,o.glowSpots); face(x,hh,R,{ey:-0.05,my:-0.42});
  const tents=[]; const tm=mt(x,c[0]); for(let k=0;k<8;k++){ const a=k/8*TAU+0.2; const p=Gp(bd,[Math.sin(a)*0.07,-0.01,-Math.cos(a)*0.07]); p.rotation.order='YXZ'; p.rotation.y=-a+Math.PI; p.rotation.x=0.9; const s=chain(p,5,0.035,0.028,0.012,tm,{ink:0.1}); tents.push([p,s,a]); }
  if(o.glow) x.halo=halo(bd,o.glow,0.7,[0,0.05,0]);
  x.h=0.45;
  x.A.push((t,dt,mv)=>{ const pu=Math.sin(t*2.4); hh.scale.set(1-0.04*pu,1+0.05*pu,1-0.04*pu); for(const [p,s,a] of tents){ p.rotation.x=0.9+0.25*pu+mv*0.4; for(let i=0;i<s.length;i++) s[i].rotation.x=-0.25+0.3*Math.sin(t*2.4-i*0.7+a); } bd.rotation.y=0.2*Math.sin(t*0.5); });
},
jar(x,b){ const o=x.o, c=x.c, J=Gp(b,[0,0.08,0]); const H=0.22;
  P(J,cyl(1,1,18),M(c[1]),[0,0.01,0],[0.11,0.03,0.11],{ink:0.06}); P(J,cyl(1,1,18),M(c[1]),[0,H+0.015,0],[0.105,0.03,0.105],{ink:0.06}); P(J,cyl(0.6,1,12),M(c[1]),[0,H+0.045,0],[0.04,0.03,0.04]);
  const liq=P(J,cyl(1,1,18),M(c[0],{a:0.5,e:0.4}),[0,H/2,0],[0.092,H*0.88,0.092]); P(J,cyl(1,1,20),M('#e8f8ff',{a:0.25}),[0,H/2+0.01,0],[0.1,H,0.1]);
  const bulb=P(J,sph(10),M(o.glow||c[0],{e:1.2}),[0,H+0.08,0],0.022); halo(J,o.glow||c[0],0.2,[0,H+0.08,0]);
  const inn=Gp(J,[0,H*0.5,0]); const ins=o.inside||'brain';
  if(ins==='brain'){ const bm=P(inn,sph(16),M(c[2]),[0,0,0],[0.06,0.05,0.065],{ink:0.08}); for(let k=0;k<4;k++) P(bm,tor(0.08,Math.PI,12),M('#e86a90'),[0,0.2,-0.5+k*0.33],[0.95,0.95,0.95],{rot:[0,Math.PI/2,0]}); P(bm,box(),M('#e86a90'),[0,0.5,0],[0.05,0.5,1.6]); const g=stick(inn,0.06,0,0.1); x.blinks.push(g); for(const s of[-1,1]) P(g,sph(8),M('#1a1420'),[s*0.022,0,0],[0.008,0.012,0.006]); }
  if(ins==='eye'){ const e=Gp(inn); P(e,sph(18),M('#ffffff'),[0,0,0],0.065,{ink:0.06}); P(e,sph(12),M('#3a8ad8'),[0,0,-0.05],[0.035,0.035,0.02]); P(e,sph(10),M('#1a1420'),[0,0,-0.062],[0.02,0.02,0.012]); P(e,sph(6),M('#ffffff',{flat:1}),[0.012,0.012,-0.068],0.007); x.blinks.push(e); x.A.push((t)=>{ e.rotation.y=0.6*Math.sin(t*0.8); e.rotation.x=0.3*Math.sin(t*1.3); }); }
  if(ins==='blob'){ P(inn,sph(14),M(c[2]),[0,-0.02,0],[0.05,0.045,0.05],{ink:0.08}); const hh=Gp(inn,[0,-0.01,0]); face(Object.assign({},x,{o:{eyes:'big',mouth:'smile'}}),hh,0.05,{ey:0.15,my:-0.3}); }
  const bub=[]; for(let k=0;k<4;k++) bub.push(P(J,sph(6),M('#ffffff',{a:0.6}),[(k-1.5)*0.03,0,0.04*(k%2?1:-1)],0.008+k*0.002));
  const legs=[]; for(let k=0;k<4;k++){ const a=k/4*TAU+Math.PI/4; const p=Gp(b,[Math.sin(a)*0.09,0.09,-Math.cos(a)*0.09],[0,-a,0]); const up=Gp(p,[0,0,0],[-0.9,0,0]); P(up,cylT(1,1,6),M('#5a6470'),[0,0,0],[0.012,0.06,0.012]); const lo=Gp(up,[0,-0.06,0],[1.9,0,0]); P(lo,cylT(1,0.6,6),M('#5a6470'),[0,0,0],[0.011,0.1,0.011]); P(up,sph(6),M(c[1]),[0,0,0],0.018); legs.push([p,up,k]); }
  x.h=0.42;
  x.A.push((t,dt,mv,air)=>{ legs.forEach(([p,up,k])=>{ up.rotation.x=-0.9+(air?0.3*Math.sin(t*4+k):0.35*mv*Math.sin(x.ph+k*Math.PI/2)); }); J.position.y=0.08+(air?0:0.01*Math.abs(Math.sin(x.ph*2))*mv)+0.004*Math.sin(t*2);
    inn.position.y=H*0.5+0.012*Math.sin(t*1.6); inn.rotation.y=0.3*Math.sin(t*0.5); bub.forEach((m,k)=>{ const u=(t*0.35+k*0.27)%1; m.position.y=0.02+u*(H-0.04); m.visible=u<0.95; }); bulb.scale.setScalar(0.022*(1+0.2*Math.sin(t*5))); J.rotation.z=0.04*Math.sin(t*1.2); });
},
cube(x,b){ const o=x.o, c=x.c, bt=o.body, Y=0.06, S=0.2; const jig=Gp(b,[0,Y,0]), bx=Gp(jig,[0,S/2,0]); let lid=null;
  const mm=bt==='gel'?M(c[0],{a:0.65}):bt==='grid'?gridMat(c[0],c[1]):M(c[0],{e:bt==='glitch'?0.2:0});
  if(bt==='mallow'){ P(bx,cyl(1,1,20),mm,[0,0,0],[S*0.55,S*0.95,S*0.55],{ink:0.05}); P(bx,cyl(1,1,20),M('#f0c890'),[0,S*0.47,0],[S*0.55,S*0.02,S*0.55]); }
  else P(bx,box(),mm,[0,0,0],bt==='chest'?[S*1.1,S*0.62,S*0.8]:[S,S,S],{ink:bt==='gel'?0:0.04});
  if(bt==='gel') P(bx,box(),M(c[1],{a:0.4}),[0,-S*0.1,0],[S*0.4,S*0.4,S*0.4],{rot:[0.5,0.5,0]});
  if(bt==='tv'){ P(bx,box(),M('#14141e'),[0,0.01,-S*0.5],[S*0.82,S*0.66,0.01]); P(bx,box(),M(c[1]),[0,-S*0.42,-S*0.5],[S*0.7,S*0.06,0.012]); }
  if(bt==='rust'){ for(const sx of[-1,1]) for(const sy of[-1,1]) P(bx,sph(6),M(c[1]),[sx*S*0.4,sy*S*0.4,-S*0.51],0.01); P(bx,box(),M(c[1]),[0,0,0],[S*1.02,S*0.12,S*1.02]); }
  if(bt==='present'){ P(bx,box(),M(c[1]),[0,0,0],[S*1.02,S*1.02,S*0.2]); P(bx,box(),M(c[1]),[0,0,0],[S*0.2,S*1.02,S*1.02]); }
  if(bt==='chest'){ for(const sx of[-1,1]) P(bx,box(),M(c[1]),[sx*S*0.45,0,0],[S*0.08,S*0.64,S*0.82]); const lp=Gp(bx,[0,S*0.31,S*0.4]); lid=Gp(lp); P(lid,cyl(1,1,16,),M(c[0]),[0,0,-S*0.4],[S*0.4,S*1.1,S*0.4],{rot:[0,0,Math.PI/2],ink:0.04}).scale.set(S*0.4,S*1.1,S*0.32);
    for(const sx of[-1,1]) P(lid,box(),M(c[1]),[sx*S*0.45,S*0.05,-S*0.4],[S*0.085,S*0.25,S*0.82]); P(bx,box(),M(c[1]),[0,S*0.12,-S*0.41],[S*0.12,S*0.15,0.02]); const gl=P(bx,box(),M(c[2],{e:1.5}),[0,S*0.31,0],[S*1.0,0.01,S*0.7]); halo(bx,c[2],0.35,[0,S*0.4,0]);
    x.A.push((t,dt,mv,air,S2)=>{ const ch=S2&&S2.cheer>=0&&S2.cheer<1; lid.rotation.x=ch?-1.1:-(0.12+0.12*Math.max(0,Math.sin(t*1.7))); }); }
  if(bt==='glitch'){ const g1=P(jig,box(),M('#ff3fa4',{a:0.5,add:1}),[0,S/2,0],S*1.02), g2=P(jig,box(),M('#5cf0ff',{a:0.5,add:1}),[0,S/2,0],S*1.02);
    x.A.push((t)=>{ const on=(Math.sin(t*3.1)+Math.sin(t*7.3))>1.2; g1.visible=g2.visible=on; if(on){ g1.position.x=0.02*Math.sin(t*60); g2.position.x=-0.02*Math.sin(t*50); bx.position.x=0.01*Math.sin(t*90); } else bx.position.x=0; }); }
  const hh=Gp(bx,[0,bt==='chest'?-S*0.08:S*0.03,0]); face(x,hh,bt==='chest'?S*0.4:S*0.5,{flat:1,ey:0.2,my:-0.45});
  if(o.ant){ /* face() already added antennae on top of the face group: lift them to the top of the box */ }
  const feet=[], arms=[]; for(const s of[-1,1]){ feet.push([P(b,box(),M(c[1]===c[0]?'#3a3a40':c[1]),[s*S*0.25,0.02,0],[S*0.28,0.04,S*0.38],{ink:0.06}),s]); const a=Gp(bx,[s*S*0.55,-S*0.05,0]); P(a,box(),mm,[s*0.012,-0.03,0],[0.03,0.07,0.03],{ink:0.08}); arms.push([a,s]); }
  if(o.glow) x.halo=halo(bx,o.glow,0.6,[0,0,0]);
  x.h=Y+S+0.05; let flipT=0;
  x.A.push((t,dt,mv,air)=>{ for(const [f,s] of feet) f.position.z=air?0.02*Math.sin(t*3+s):0.035*mv*Math.sin(x.ph+(s>0?Math.PI:0)); for(const [a,s] of arms) a.rotation.x=air?0.4*Math.sin(t*2+s):-0.6*mv*Math.sin(x.ph+(s>0?Math.PI:0))+0.1*Math.sin(t*1.5+s);
    jig.position.y=Y+(air?0:Math.abs(Math.sin(x.ph))*0.02*mv); jig.rotation.z=(air?0.15*Math.sin(t*1.2):0.08*mv*Math.sin(x.ph))+0.03*Math.sin(t*1.3);
    if(bt==='flip'){ flipT+=dt; const P2=6, u=flipT%P2; bx.rotation.x=u<0.7?-TAU*easeIO(u/0.7):0; jig.position.y+=u<0.7?Math.sin(Math.PI*u/0.7)*0.12:0; }
    if(bt==='gel'){ const w=0.05*Math.sin(t*6); bx.scale.set(1-w,1+w,1-w); } });
},
crab(x,b){ const o=x.o, c=x.c, Y=0.07, mm=o.metal?M(c[0]):mt(x,c[0]); const bd=Gp(b,[0,Y,0]);
  const bm=P(bd,sph(18),mm,[0,0.05,0],[0.13,0.085,0.1],{ink:0.06}); P(bm,sph(14),M(c[1]),[0,-0.45,-0.2],[0.85,0.6,0.8]);
  if(o.shell){ const sh=Gp(bd,[0,0.12,0.04],[0.3,0,0]); P(sh,cone(14),M(o.shell),[0,-0.02,0],[0.09,0.16,0.09],{ink:0.06}); for(let k=0;k<3;k++) P(sh,tor(0.15),M('#ffffff'),[0,0.02+k*0.04,0],[0.08-k*0.022,0.08-k*0.022,0.08-k*0.022],{rot:[Math.PI/2,0,0]}); }
  const hh=Gp(bd,[0,0.07,-0.04]); face(x,hh,0.075,{ey:0.3,my:-0.2}); if(o.acc&&o.acc!=='goggles') {}
  const claws=[]; for(const s of[-1,1]){ const p=Gp(bd,[s*0.12,0.04,-0.05],[0,s*-0.5,0]); P(p,cylT(1,1,6),mm,[0,0,0],[0.018,0.07,0.018],{rot:[Math.PI/2.4,0,0]}); const cw=Gp(p,[0,0.03,-0.07]); const top=Gp(cw), bot=Gp(cw);
    P(top,sph(10),mm,[0,0.012,-0.03],[0.035,0.018,0.045],{ink:0.1}); P(bot,sph(10),mm,[0,-0.012,-0.025],[0.03,0.014,0.038],{ink:0.1}); claws.push([p,top,bot,s]); }
  const legs=[]; for(const s of[-1,1]) for(let k=0;k<3;k++){ const p=Gp(bd,[s*0.1,0.02,0.0+k*0.035],[0,s*(0.3-k*0.35),0]); const q=Gp(p,[0,0,0],[0,0,s*-0.5]); P(q,cylT(1,1,5),mm,[0,0,0],[0.01,0.06,0.01],{rot:[0,0,s*1.3]}); const r=Gp(q,[s*0.058,-0.016,0],[0,0,s*-1.2]); P(r,cylT(1,0.5,5),mm,[0,0,0],[0.009,0.06,0.009]); legs.push([q,s,k]); }
  if(o.glow) x.halo=halo(bd,o.glow,0.6,[0,0.05,0]);
  x.h=0.3;
  x.A.push((t,dt,mv,air,S)=>{ const ch=S&&S.cheer>=0&&S.cheer<1; for(const [p,top,bot,s] of claws){ const op=ch?0.5+0.5*Math.sin(t*20):Math.max(0,Math.sin(t*2.3+s))>0.85?0.5*Math.abs(Math.sin(t*14)):0.08; top.rotation.x=-op; bot.rotation.x=op*0.6; p.rotation.x=(ch?-0.9:0)+0.1*Math.sin(t*1.5+s); }
    for(const [q,s,k] of legs) q.rotation.z=s*-0.5+(air?0.3*Math.sin(t*5+k+s):0.3*mv*Math.sin(x.ph*1.4+k*2+(s>0?Math.PI:0))); bd.position.y=Y+0.004*Math.sin(t*2.2)+(air?0:Math.abs(Math.sin(x.ph*1.4))*0.012*mv); bd.rotation.z=0.06*mv*Math.sin(x.ph*1.4); });
},
none(x,b){ x.h=0.3; },
};
let GRID=null; function gridMat(a,b2){ if(!GRID){ const cv=document.createElement('canvas'); cv.width=cv.height=64; const g=cv.getContext('2d'); g.fillStyle=a; g.fillRect(0,0,64,64); g.strokeStyle=b2; g.lineWidth=2; for(let i=0;i<=64;i+=16){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,64); g.moveTo(0,i); g.lineTo(64,i); g.stroke(); } g.lineWidth=5; g.strokeRect(0,0,64,64);
  const tx=new T.CanvasTexture(cv); GRID=new T.MeshToonMaterial({map:tx,gradientMap:GRAD}); GRID.userData.keep=true; } return GRID; }
const clamp1=v=>v<-1?-1:v>1?1:v;
const easeIO=u=>u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;

// build one sidekick: returns a Group; root.userData.sk.tick(t, dt, {mv: 0..1 speed, air: floating, cheer: 0..1 or -1, sad: 0..1})
function build(three,it){ init(three);
  const root=new T.Group(), bob=Gp(root), body=Gp(bob); root.name='sidekick:'+it.n;
  const r=rng(it.n), x={it,o:it.o||{},c:it.c,A:[],blinks:[],rand:r,seed:r()*10,ph:r()*6,walker:it.walker,h:0.4};
  (KINDS[it.k]||KINDS.none)(x,body);
  const sc=it.o.s||1; body.scale.setScalar(sc);
  let blinkT=1+r()*3; const ky=new T.Vector3();
  function tick(t,dt,S){ S=S||{}; const mv=Math.min(1,S.mv||0), air=!x.walker||!!S.air; dt=Math.min(dt,0.1);
    x.ph+=dt*(4+10*mv);
    bob.position.set(0,0,0); bob.rotation.set(0,0,0); bob.scale.set(1,1,1);
    if(!x.walker){ bob.position.y=0.035*Math.sin(t*2.1+x.seed); bob.rotation.x=0.25*mv; }
    else if(air){ bob.position.y=0.025*Math.sin(t*1.7+x.seed); }
    for(const f of x.A) f(t,dt,mv,air,S);
    // blink every few seconds (both eyes together)
    blinkT-=dt; let bl=1; if(blinkT<0){ bl=Math.max(0.08,Math.abs(blinkT+0.07)/0.07); if(blinkT<-0.14) blinkT=1.8+r()*3.5; }
    for(const g of x.blinks) g.scale.y=bl;
    // a happy hop and spin
    const ch=S.cheer; if(ch!=null&&ch>=0&&ch<1){ bob.position.y+=Math.sin(Math.PI*ch)*(x.walker?0.28:0.18); bob.rotation.y+=easeIO(ch)*TAU; const sq=ch<0.12?1-ch*2:1; bob.scale.set(2-sq,sq,2-sq); }
    if(S.sad){ bob.rotation.x+=0.4*S.sad; bob.position.y-=0.03*S.sad; }
  }
  root.userData.sk={tick,walker:x.walker,h:x.h*sc,it,halo:x.halo};
  root.traverse(m=>{ if(m.isMesh||m.isSprite) m.userData.sk=true; });
  return root;
}
// a small round icon for places without 3D (theme chips): the main colour with the accent
function chip(it){ return `<svg viewBox="0 0 40 40"><circle cx="20" cy="22" r="14" fill="${it.c[0]}"/><circle cx="20" cy="27" r="7" fill="${it.c[1]}"/><circle cx="15" cy="19" r="2.6" fill="#1a1420"/><circle cx="25" cy="19" r="2.6" fill="#1a1420"/></svg>`; }
window.SIDEKICKS={THEMES,ITEMS,build,chip,WALK};
})();
