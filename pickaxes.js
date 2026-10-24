// Inverted pickaxes: 100 designs in ten themed sets, each with a shape, size and power-up.
// Shared data plus 2D SVG drawing; the game turns the head drawings into 3D models in the Armory.
(function(){

const RAR=[{n:'Common',c:'#a4abb5'},{n:'Uncommon',c:'#55c95f'},{n:'Rare',c:'#3fa0f5'},{n:'Epic',c:'#b866f5'},{n:'Legendary',c:'#f5a83b'}];

const SETS=[
 {id:'halloween',n:'Halloween',c:'#ff8a1f',d:'Carved, cursed and a little bit spooky.'},
 {id:'christmas',n:'Christmas',c:'#ff4d5e',d:'Wrapped up, frosted over and ready to deck some walls.'},
 {id:'graffiti',n:'Graffiti',c:'#ff3fa4',d:'Fresh paint, loud tags and drips on everything.'},
 {id:'arcade',n:'Neon Arcade',c:'#19e3ff',d:'Pixels, lasers and a high score to beat.'},
 {id:'deepsea',n:'Deep Sea',c:'#2fd6c8',d:'Pulled up from the bottom of the ocean.'},
 {id:'volcanic',n:'Volcanic',c:'#ff5a1f',d:'Forged in lava, still warm to the touch.'},
 {id:'sweet',n:'Sweet Tooth',c:'#ff8fc8',d:'Sugar-coated and surprisingly sturdy.'},
 {id:'cosmic',n:'Cosmic',c:'#9d86ff',d:'Mined from meteors and starlight.'},
 {id:'wild',n:'Wild',c:'#53d16b',d:'Straight out of the jungle, teeth included.'},
 {id:'storm',n:'Inverted',c:'#ffd23f',d:'Made for this box and nowhere else.'},
 {id:'anime',n:'Anime',c:'#ff7a2a',d:'Signature moves from your favourite heroes. Tap and hold for two different attacks.'},
];

// [name, rarity, head shape, head top, head bottom, edge, handle style, handle a, handle b, pattern, pattern color, extras{parts,gem,glow,drip,pom}, flavor]
const RAW={
halloween:[
 ['Jack-o-Lantern',2,'classic','#ffa23a','#c4430c','#6d2304','wrap','#3c6b2a','#24401a','jack','#ffe14d',{parts:'embers',glow:'#ffb13d'},'Carved fresh every October 31st. The grin never fades.'],
 ['Spooky Shadow',3,'bat','#3d2a55','#140b20','#b07cff','bone','#d8ccb0','#8f8064','none','',{parts:'bats',glow:'#9b5cff',gem:'#ff3b5c'},'It only comes out after sundown.'],
 ['Grave Digger',1,'hammer','#9aa0a6','#4d5257','#2d3134','plain','#7a5634','#4a3018','cracks','#7fbf5a',{},'Six feet is a good start.'],
 ['Grim Reaper',4,'scythe','#3a3a46','#0b0b10','#cfd6e0','twist','#2a2230','#5e4a70','none','',{parts:'wisps',glow:'#7cffb2',gem:'#7cffb2',pom:'skull'},'Everyone pays eventually.'],
 ['Candy Corn',1,'classic','#fff6d8','#ffb000','#a35a00','plain','#fff6d8','#e0c9a0','bands','',{bands:['#fff6d8','#ffb000','#ff6a00']},'Nobody admits they like candy corn. This one does.'],
 ['Witch\'s Wart',2,'crescent','#8bff6a','#1f7a2a','#0d3a14','twist','#4a2a6a','#2a1640','dots','#c9ff9e',{parts:'bubbles',glow:'#6dff6a'},'Stirred clockwise, three times, under a full moon.'],
 ['Bone Pick',2,'claw','#f6eedb','#b9a985','#6b5d40','bone','#efe5cd','#a6957a','none','',{pom:'skull'},'Borrowed from a skeleton. It wants it back.'],
 ['Spider Silk',3,'classic','#2b2b33','#09090c','#5a5a66','wrap','#1b1b20','#c8c8d4','web','#e8e8f2',{gem:'#ff2d2d'},'Spun overnight by something with too many legs.'],
 ['Glossy Ghost',3,'wing','#f2fcff','#8fcfff','#5aa0d6','twist','#cdeeff','#7fb8e6','none','',{parts:'wisps',glow:'#9fe6ff',alpha:.82},'Swings right through walls. Mostly.'],
 ['Pumpkin King',4,'axe','#ff9a2a','#b13a00','#ffd23f','wrap','#2c4a1c','#ffd23f','jack','#fff27a',{parts:'embers',glow:'#ff8a1f',gem:'#54ff7a'},'Rules the patch with an iron stem.'],
],
christmas:[
 ['Candy Cane Classic',1,'hook','#ffffff','#e9e4e4','#b3122a','twist','#ffffff','#e3243b','stripes','#e3243b',{},'Peppermint flavored. Do not lick.'],
 ['Holly Jolly',2,'leaf','#3fd06e','#16673a','#0b3d22','wrap','#7a4a26','#c8202f','berries','#e3243b',{parts:'snow'},'Hang it over a doorway and see what happens.'],
 ['Gingerbread Smash',2,'hammer','#c97a3e','#7a3f19','#4a240c','twist','#ffffff','#e3243b','icing','#ffffff',{gem:'#3fd06e'},'Run, run, as fast as you can.'],
 ['Nutcracker Guard',3,'axe','#e3243b','#7d0f1c','#ffd23f','wrap','#1f2a6b','#ffd23f','none','',{gem:'#ffd23f',glow:'#ffcf5a'},'Stands at attention all night long.'],
 ['Frostbite',3,'crystal','#ecfbff','#6cc4ff','#2a7fc4','plain','#bfe8ff','#5aa8e0','frost','#ffffff',{parts:'snow',glow:'#9be3ff',alpha:.92},'Cold enough to chip a glacier.'],
 ['Sleigh Bell',2,'crescent','#ffe27a','#c08a00','#7a5400','wrap','#7a1020','#ffd23f','dots','#fff4c0',{parts:'sparkles'},'You can hear it coming from a mile away.'],
 ['Ugly Sweater',1,'blocky','#e3243b','#9a1020','#5a0812','plain','#2fae5b','#16673a','knit','#ffffff',{},'Grandma made it. You have to use it.'],
 ['Ornament Breaker',2,'classic','#5a8cff','#16308c','#0b1a55','plain','#c9d2de','#7c8696','shine','#ffffff',{gem:'#e9eef7',parts:'sparkles'},'Shatters on impact, then puts itself back together.'],
 ['North Star',4,'star','#fff3b0','#f5a83b','#a35a00','wrap','#16308c','#ffd23f','none','',{parts:'stars',glow:'#ffe27a',gem:'#ffffff'},'Always points you toward the presents.'],
 ['Krampus Claw',4,'claw','#2a1a1a','#0a0505','#ff3b2f','bone','#3a2a24','#1a100c','cracks','#ff3b2f',{parts:'embers',glow:'#ff3b2f',pom:'spike'},'For the naughty list only.'],
],
graffiti:[
 ['Fresh Tag',1,'classic','#ffffff','#d8dce6','#20202a','wrap','#20202a','#ff3fa4','tag','#ff3fa4',{drip:'#ff3fa4'},'First piece on a clean wall.'],
 ['Drip Lord',3,'axe','#9b4dff','#4b16b0','#22075e','wrap','#121212','#c6ff3d','tag','#c6ff3d',{drip:'#c6ff3d',glow:'#9b4dff'},'Never wipes the drips. That is the style.'],
 ['Wildstyle',4,'bolt','#ff3fa4','#19e3ff','#120a24','twist','#ff3fa4','#19e3ff','tag','#120a24',{parts:'spray',glow:'#ff3fa4',drip:'#ffe14d'},'Letters so tangled only the artist can read them.'],
 ['Wet Paint',2,'crescent','#ffe14d','#f5b400','#7a5400','wrap','#c9d2de','#20202a','none','',{drip:'#ffe14d'},'The sign said do not touch. It got touched.'],
 ['Throw-Up',2,'blocky','#ff8a3d','#e0461f','#ffffff','plain','#20202a','#3a3a46','halftone','#ffd0a6',{},'Big bubble letters, done in thirty seconds flat.'],
 ['Back Alley',1,'hammer','#c0533a','#7a2a1a','#3a120a','wrap','#5a5a66','#20202a','bricks','#e8c8b8',{},'Every great crew starts behind the dumpsters.'],
 ['Burner',3,'claw','#ff3fa4','#ff8a1f','#3a0a24','twist','#20202a','#ff3fa4','flames','#ffe14d',{glow:'#ff6a3d',parts:'spray'},'A piece so hot it scorches the brick.'],
 ['Stencil',2,'classic','#20202a','#0a0a10','#ffffff','plain','#e8e8f2','#9a9aa8','checker','#ffffff',{},'Cut, sprayed, peeled. Perfect edges every time.'],
 ['Spray Can',2,'hammer','#19e3ff','#0a7a9a','#063a4a','wrap','#c9d2de','#19e3ff','none','',{drip:'#ffffff',parts:'spray',gem:'#ffffff'},'Shake well before swinging.'],
 ['Rooftop King',4,'wing','#ffd23f','#ff3fa4','#20202a','wrap','#20202a','#ffd23f','tag','#20202a',{drip:'#19e3ff',glow:'#ff3fa4',gem:'#19e3ff',pom:'crown'},'Tagged the highest roof on the island.'],
],
arcade:[
 ['Pixel Pick',1,'pixel','#19e3ff','#0a6a9a','#04303f','pixel','#ffd23f','#c08a00','none','',{},'Eight bits of pure mining power.'],
 ['Synthwave',3,'crescent','#ffb13d','#ff3fd8','#3a0a4a','plain','#2a0a3a','#ff3fd8','scan','#3a0a4a',{glow:'#ff3fd8'},'Drive into the sunset. Mine on the way.'],
 ['Glitch',3,'saw','#19e3ff','#ff3fd8','#0a0a14','plain','#20202a','#19e3ff','glitch','#ffffff',{glow:'#19e3ff'},'It loaded wrong and nobody fixed it.'],
 ['Circuit Breaker',2,'classic','#1a3048','#08121e','#19e3ff','wrap','#0a1420','#19e3ff','circuit','#19e3ff',{glow:'#19e3ff',gem:'#19e3ff'},'Runs at 9000 volts. Keep it away from water.'],
 ['High Score',2,'blocky','#ffe14d','#f5a800','#5a3a00','plain','#20202a','#3a3a46','checker','#fff3b0',{parts:'stars'},'Three letters on the leaderboard. Yours.'],
 ['Laser Edge',4,'scythe','#121820','#05070a','#39ff88','plain','#121820','#39ff88','none','',{glow:'#39ff88',edge2:'#39ff88',gem:'#39ff88'},'Cuts in a perfectly straight line.'],
 ['Joystick',1,'hammer','#e3243b','#8a0f1c','#3a0a10','plain','#20202a','#3a3a46','shine','#ffffff',{pom:'ball'},'Up, up, down, down, swing.'],
 ['Hologram',3,'crystal','#9ffcff','#7a8cff','#19e3ff','plain','#7fe6ff','#3a6aff','scan','#ffffff',{glow:'#19e3ff',alpha:.7,parts:'sparkles'},'You can see right through it. It still works.'],
 ['Bit Crusher',2,'pixel','#ff3fd8','#8a0f7a','#3a0434','pixel','#19e3ff','#0a6a9a','none','',{},'Breaks walls into tiny little squares.'],
 ['Overclock',4,'bolt','#ffffff','#19e3ff','#0a6a9a','twist','#ffffff','#19e3ff','none','',{glow:'#19e3ff',parts:'bolts'},'Running way past what the manual allows.'],
],
deepsea:[
 ['Coral Reef',2,'claw','#ff8a8a','#d6455b','#6a1424','rope','#e8d8b0','#a68a5a','dots','#ffd0d0',{parts:'bubbles'},'Grown, not forged. Took about a thousand years.'],
 ['Shark Bite',2,'saw','#a6bccc','#4a6378','#1e2c38','wrap','#2a3a48','#a6bccc','shine','#ffffff',{},'You are going to need a bigger pickaxe.'],
 ['Kraken',4,'claw','#9a5ae0','#3a1563','#1a0730','twist','#3a1563','#9a5ae0','suckers','#f0d8ff',{parts:'bubbles',glow:'#b866f5',gem:'#2fd6c8'},'Released from the depths. Grip carefully.'],
 ['Anglerfish',3,'crescent','#1a2a48','#060c18','#2fd6c8','plain','#0c1626','#2a3a58','dots','#2fd6c8',{gem:'#fff27a',glow:'#fff27a',pom:'lure'},'The light is the last thing you see.'],
 ['Tidebreaker',3,'wing','#7affea','#0a8aa0','#06404a','wrap','#0a3a48','#7affea','waves','#e8ffff',{parts:'bubbles'},'Splits the waves in half.'],
 ['Pearl Diver',1,'classic','#ffffff','#c6c0e6','#7a72a6','rope','#e8d8b0','#a68a5a','shine','#ffffff',{gem:'#f4efff'},'Holds its breath for four whole minutes.'],
 ['Sunken Treasure',2,'axe','#e8b84a','#8a5a10','#3a2404','plain','#5a3a1a','#3a2410','cracks','#4ad6a0',{parts:'coins'},'X marks the spot. The spot was very deep.'],
 ['Abyssal',4,'scythe','#0a2a48','#02060c','#2fd6c8','twist','#06121e','#2fd6c8','none','',{glow:'#2fd6c8',edge2:'#2fd6c8',parts:'bubbles',gem:'#2fd6c8'},'From the part of the ocean with no name.'],
 ['Jellyfish',3,'crescent','#ffc8f0','#c86aff','#8a2aa0','twist','#ffd8f4','#c86aff','none','',{glow:'#ff8ae0',alpha:.75,parts:'wisps'},'Wobbly on the outside, electric on the inside.'],
 ['Driftwood',1,'hammer','#b08a5a','#6a4a28','#3a2410','rope','#e8d8b0','#a68a5a','grain','#5a3a1a',{},'Washed up on the beach one morning.'],
],
volcanic:[
 ['Magma Core',3,'classic','#3a2a2a','#120a0a','#ff5a1f','plain','#2a1a14','#4a2a1a','cracks','#ff7a1a',{glow:'#ff5a1f',parts:'embers'},'Do not hold it by the head.'],
 ['Obsidian',2,'crystal','#3a3048','#0a0710','#b866f5','plain','#1a1420','#3a3048','shine','#ffffff',{},'Volcanic glass, sharp enough to split a rock.'],
 ['Eruption',4,'bolt','#ffe14d','#ff3a0a','#5a0a00','twist','#2a1414','#ff5a1f','flames','#fff3b0',{glow:'#ff5a1f',parts:'embers'},'The mountain picked a side.'],
 ['Basalt',1,'hammer','#6a6a72','#2e2e34','#1a1a1e','plain','#4a4a50','#2e2e34','cracks','#ff8a3d',{},'Cooled lava, still a little grumpy.'],
 ['Ember Fang',3,'claw','#ff5a3a','#8a0a0a','#3a0404','wrap','#2a1414','#ff8a3d','flames','#ffb13d',{glow:'#ff5a3a',parts:'embers'},'Bites, then burns.'],
 ['Ash Cloud',2,'wing','#8a8a92','#3a3a42','#1a1a20','plain','#3a3a42','#5a5a62','none','',{parts:'ash'},'Leaves a gray trail everywhere it goes.'],
 ['Dragon Scale',4,'axe','#3fd06e','#0a5a2a','#ffd23f','wrap','#3a0a0a','#ffd23f','scales','#0a3a1a',{glow:'#ff5a1f',parts:'embers',gem:'#ff3b2f'},'Shed by a dragon who will not miss it.'],
 ['Fire Opal',2,'crescent','#ffb13d','#ff3a0a','#5a0a00','plain','#2a1414','#5a2a1a','shine','#fff3b0',{gem:'#ffe14d',parts:'sparkles'},'Looks like it has a tiny sunset trapped inside.'],
 ['Pumice',1,'blocky','#d8d4cc','#9a948a','#5a544a','plain','#6a5a4a','#4a3a2a','holes','#7a746a',{},'Light as a feather. Hits like a rock.'],
 ['Phoenix Feather',3,'wing','#ffe14d','#e3243b','#5a0a0a','wrap','#5a0a0a','#ffd23f','flames','#fff3b0',{glow:'#ff8a1f',parts:'embers'},'Every time it breaks, it comes back.'],
],
sweet:[
 ['Lollipop Swirl',2,'crescent','#ffffff','#ffd8ec','#ff3fa4','plain','#ffffff','#e8e8f2','stripes','#ff3fa4',{},'Lasts longer than any lollipop should.'],
 ['Gummy Bear',1,'blocky','#ff5a6a','#c41a2a','#7a0a14','plain','#ff8a9a','#c41a2a','shine','#ffffff',{alpha:.85},'Squishy. Somehow still breaks walls.'],
 ['Sprinkle Smash',2,'hammer','#ffb6dc','#ff6aae','#8a2a5a','plain','#c97a3e','#7a3f19','sprinkles','',{},'Extra sprinkles. Always extra sprinkles.'],
 ['Bubblegum Pop',2,'classic','#ffb6dc','#ff5aae','#8a1a5a','twist','#ffffff','#ff8ac8','shine','#ffffff',{parts:'bubbles'},'Blow a bubble, swing, pop.'],
 ['Chocolate Bar',1,'blocky','#8a5a3a','#4a2a14','#2a1408','plain','#e8e0d0','#b0a890','checker','#5a3418',{},'Snap off a piece. It grows back.'],
 ['Sour Blast',3,'bolt','#d6ff3d','#3fd06e','#1a5a0a','twist','#ffe14d','#d6ff3d','dots','#ffffff',{parts:'sparkles',glow:'#d6ff3d'},'Makes your whole face scrunch up.'],
 ['Rock Candy',3,'crystal','#c8f0ff','#6aaaff','#2a5ad6','plain','#f0e8d8','#b0a890','shine','#ffffff',{alpha:.85,parts:'sparkles',glow:'#8ac8ff'},'Grown on a string for two whole weeks.'],
 ['Ice Cream Dream',3,'wing','#fff6d8','#ff9ad6','#8a3a6a','wrap','#d8a868','#a87838','bands','',{bands:['#ff9ad6','#fff6d8','#8a5a3a'],gem:'#e3243b'},'Three scoops and a cherry on top.'],
 ['Cotton Candy',4,'crescent','#ffb6e6','#8ad6ff','#5a5ad6','twist','#ffffff','#ffb6e6','none','',{parts:'sparkles',glow:'#ffb6e6',alpha:.9},'Melts on contact with rain. Luckily it never rains.'],
 ['Sugar Rush',4,'saw','#ff5a6a','#7a5aff','#20202a','twist','#ffe14d','#ff3fa4','rainbow','',{parts:'stars',glow:'#ff8ac8'},'Swings twice as fast. Crashes at 3 PM.'],
],
cosmic:[
 ['Supernova',4,'crescent','#3a1a6a','#0a0420','#ffe14d','twist','#1a0a3a','#9d86ff','galaxy','',{glow:'#ffd23f',parts:'stars',gem:'#ffffff'},'Brighter than a billion suns, for about a week.'],
 ['Meteorite',2,'hammer','#4a4a5a','#1a1a24','#0a0a10','plain','#3a3a46','#20202a','cracks','#6ac8ff',{parts:'embers'},'Fell out of the sky into a chest.'],
 ['Moonbeam',2,'crescent','#f4f6ff','#a8b0d0','#5a6288','plain','#d8dcef','#8890b0','holes','#c8cce0',{parts:'stars'},'Glows softly when the moon is up.'],
 ['Black Hole',3,'classic','#14101e','#000000','#b866f5','twist','#0a0612','#b866f5','rings','#b866f5',{glow:'#b866f5',gem:'#000000'},'Pulls loot toward you. Probably.'],
 ['Nebula',3,'wing','#2a1a5a','#0a0420','#ff8ae0','plain','#1a0a3a','#9d86ff','galaxy','',{parts:'stars',glow:'#ff8ae0'},'A cloud of stardust, pressed into a blade.'],
 ['Comet Tail',3,'scythe','#e8fbff','#6ac8ff','#2a6aa0','plain','#c8e8ff','#6aa0d0','none','',{parts:'sparkles',glow:'#9fe6ff'},'Comes around once every seventy years.'],
 ['Saturn Ring',1,'axe','#f0d8a0','#b08a4a','#5a4018','plain','#8a6a3a','#5a4018','bands','',{bands:['#f0d8a0','#d0a868','#a87838']},'Has its own set of rings, and a lot of moons.'],
 ['Stardust',2,'crystal','#ffd8f8','#c86aff','#6a2a9a','plain','#e8d8ff','#a88ad8','shine','#ffffff',{parts:'sparkles',alpha:.9},'Leaves glitter on everything it touches.'],
 ['Rocket Fuel',2,'bolt','#ffffff','#c9d2de','#e3243b','wrap','#c9d2de','#e3243b','none','',{parts:'embers',glow:'#ff8a1f'},'Three, two, one, swing.'],
 ['Event Horizon',4,'claw','#1a0a3a','#000000','#ffb13d','twist','#0a0612','#ffb13d','galaxy','',{glow:'#ffb13d',parts:'stars',gem:'#ffb13d'},'Nothing that gets close ever comes back.'],
],
wild:[
 ['Vine Whip',1,'leaf','#7ae06a','#2a8a3a','#0a3a14','bamboo','#b0c86a','#6a8a2a','veins','#d8ffc8',{},'Grew around a stick one summer and never let go.'],
 ['Tiger Stripe',2,'axe','#ffa23a','#d6600a','#2a1408','wrap','#20202a','#ffa23a','tiger','#20140a',{},'Stalks walls silently, then pounces.'],
 ['Jaguar',2,'classic','#ffd27a','#d69a2a','#4a2a08','plain','#6a4a28','#3a2410','spots','#3a2408',{},'Fastest pickaxe in the rainforest.'],
 ['Raptor Claw',3,'claw','#e8d8b0','#9a8058','#3a2a14','bone','#d8ccb0','#8f8064','none','',{parts:'leaves',pom:'spike'},'Clever girl.'],
 ['Bamboo Breaker',1,'hammer','#a8d86a','#5a8a2a','#2a4a0a','bamboo','#b0c86a','#6a8a2a','bamboo','#3a5a1a',{},'Bends in the wind. Never snaps.'],
 ['Toucan',2,'crescent','#ffd23f','#ff6a1a','#20202a','plain','#20202a','#3a3a46','bands','',{bands:['#ffe14d','#ff8a1f','#20202a']},'All beak, all bite.'],
 ['Venom',3,'scythe','#c6ff3d','#2a8a0a','#0a1a04','twist','#0a1a04','#c6ff3d','scales','#1a4a0a',{glow:'#c6ff3d',drip:'#c6ff3d'},'One scratch and walls start feeling sick.'],
 ['Temple Idol',4,'blocky','#ffd23f','#b07a10','#5a3a04','wrap','#5a3a1a','#ffd23f','glyphs','#7a5004',{gem:'#3fd06e',glow:'#ffd23f',parts:'sparkles'},'Swap it with a bag of sand. Then run.'],
 ['Parrot Plume',3,'wing','#ff3a3a','#3a6aff','#20202a','wrap','#ffd23f','#3a6aff','bands','',{bands:['#ff3a3a','#ffd23f','#3a6aff'],parts:'leaves'},'Repeats everything you say. Loudly.'],
 ['Canopy King',4,'leaf','#ffe27a','#3fa04a','#ffd23f','bamboo','#d8b04a','#8a6a1a','veins','#fff6c8',{gem:'#3fd06e',glow:'#ffe27a',parts:'leaves',pom:'crown'},'Rules from the treetops.'],
],
storm:[
 ['Standard Issue',0,'classic','#c9d2de','#8892a2','#4a5262','plain','#6b4a2a','#4a3018','none','',{},'The one you drop in with. Today it gets a name.'],
 ['Storm Chaser',4,'bolt','#c8a8ff','#5a1ab0','#ffd23f','twist','#2a0a5a','#9b5cff','none','',{glow:'#9b5cff',parts:'bolts',gem:'#ffd23f'},'Runs toward the storm while everyone runs away.'],
 ['Supply Drop',2,'hammer','#3fa0f5','#1a5aa8','#0a2a5a','plain','#c9d2de','#7c8696','planks','#0a2a5a',{gem:'#ffd23f'},'Falls from the sky with a parachute. Always.'],
 ['Private Jet',3,'wing','#f4f6fa','#a8b2c4','#4a5262','wrap','#20202a','#c9d2de','shine','#ffffff',{parts:'embers',gem:'#3fa0f5'},'Survived the explosion. Mostly in one piece.'],
 ['Last One Standing',4,'crescent','#ffe27a','#d69a10','#7a4a00','wrap','#7a1020','#ffd23f','shine','#ffffff',{parts:'sparkles',glow:'#ffd23f',gem:'#ff3b5c',pom:'crown'},'Only shows up for the final circle.'],
 ['Golden Chest',3,'blocky','#ffd23f','#b07a10','#5a3a04','plain','#8a5a2a','#5a3a1a','planks','#7a5004',{parts:'coins',glow:'#ffd23f'},'Hit E to open. Swing to keep.'],
 ['Shield Potion',2,'crystal','#a8e0ff','#45b0ff','#0a4a8a','plain','#c9d2de','#7c8696','shine','#ffffff',{parts:'bubbles',alpha:.88,glow:'#45b0ff'},'Plus fifty shield on every hit. In spirit.'],
 ['Medkit',1,'hammer','#ffffff','#d8dce6','#7c8696','plain','#c9d2de','#7c8696','cross','#e3243b',{},'Ten seconds to heal. One second to swing.'],
 ['Wall Builder',1,'blocky','#c99a5a','#8a5a2a','#4a2a10','plain','#6b4a2a','#4a3018','planks','#6a4018',{},'Gathered every plank on the island.'],
 ['Eye of the Storm',3,'crescent','#c8a8ff','#3a0a8a','#1a0440','twist','#2a0a5a','#c8a8ff','swirl','#e8d8ff',{glow:'#9b5cff',parts:'wisps',gem:'#ffffff'},'Calm in the middle. Not on the edges.'],
],
};

// name: [shape, size, power-up, what it does]
const EXTRA={
'Jack-o-Lantern':['classic','m','Pumpkin Bomb','Every 5th hit drops a pumpkin that bursts for 30 damage.'],
'Spooky Shadow':['bat','l','Bat Swarm','Hits release three bats that ping nearby enemies on your map.'],
'Grave Digger':['shovel','l','Dig Deep','Harvesting stone gives double materials.'],
'Grim Reaper':['scythe','g','Soul Harvest','Eliminations with it restore 50 health.'],
'Candy Corn':['classic','t','Sugar High','Move 15% faster while it\'s out.'],
'Witch\'s Wart':['crescent','s','Bubbling Brew','Hits leave a green puddle that slows enemies.'],
'Bone Pick':['claw','m','Rattle','Hitting a wall reveals enemies behind it for 2 seconds.'],
'Spider Silk':['sickle','m','Web Shot','Every 4th swing fires a web that roots an enemy for 1 second.'],
'Glossy Ghost':['wing','l','Phase Swing','Your swings pass straight through your own builds.'],
'Pumpkin King':['double','g','Harvest Moon','Doubles all materials gathered at night.'],
'Candy Cane Classic':['hook','s','Peppermint Rush','A short speed boost after every wall you break.'],
'Holly Jolly':['leaf','m','Mistletoe','Healing items heal 25% more.'],
'Gingerbread Smash':['mallet','g','Cookie Crumble','Broken walls drop a cookie that heals 10.'],
'Nutcracker Guard':['halberd','l','Crack the Shell','Deals double damage to enemy shields.'],
'Frostbite':['crystal','m','Deep Freeze','Frozen builds take 50% more damage from everyone.'],
'Sleigh Bell':['crescent','t','Jingle','Hear a bell whenever an enemy swings within 10 meters.'],
'Ugly Sweater':['blocky','m','Cozy','Take 20% less storm damage.'],
'Ornament Breaker':['mace','m','Shatter','Each hit sprays glass shards for 5 extra damage.'],
'North Star':['star','l','Guiding Light','Shows the nearest chest on your map.'],
'Krampus Claw':['claw','g','Naughty List','Marks the last enemy you hit for 10 seconds.'],
'Fresh Tag':['classic','s','Tag It','Enemies you hit stay marked with paint for 5 seconds.'],
'Drip Lord':['axe','m','Slick Drip','Leaves a paint trail that speeds up teammates.'],
'Wildstyle':['bolt','l','Remix','Every swing rolls a random bonus: harvest, speed or damage.'],
'Wet Paint':['crescent','m','Slippery','Enemies who walk through your paint slide for 1 second.'],
'Throw-Up':['blocky','g','Bubble Letters','Breaking a wall pops a bubble that blocks one bullet.'],
'Back Alley':['hammer','m','Brick by Brick','Brick walls you build start with 20% more health.'],
'Burner':['claw','m','Scorch','Sets enemy builds on fire for 3 seconds.'],
'Stencil':['classic','t','Clean Edges','Edits finish 30% faster.'],
'Spray Can':['hammer','s','Smoke Cloud','Every 6th hit puffs a smoke cloud you can hide in.'],
'Rooftop King':['wing','g','High Ground','Deal 20% more damage when you\'re above your target.'],
'Pixel Pick':['pixel','t','Extra Life','Once per match, survive a hit that would knock you out.'],
'Synthwave':['crescent','l','Retro Drive','Sprint 10% faster with it out.'],
'Glitch':['saw','m','Lag Spike','Hits sometimes blink you a short hop forward.'],
'Circuit Breaker':['classic','m','Short Circuit','Hits shut down enemy traps for 5 seconds.'],
'High Score':['blocky','s','Combo','Each hit in a row harvests 2 more, up to +10.'],
'Laser Edge':['scythe','g','Laser Cut','Slices clean through one wall with every swing.'],
'Joystick':['hammer','t','Button Mash','Swings 25% faster.'],
'Hologram':['crystal','l','Decoy','Every 20 seconds, a hologram of you runs the other way.'],
'Bit Crusher':['pixel','g','Downscale','Builds you break burst into tiny blocks worth bonus materials.'],
'Overclock':['bolt','l','Overdrive','Swing speed doubles for 5 seconds after an elimination.'],
'Coral Reef':['claw','m','Reef Shield','Standing still regenerates 1 shield a second.'],
'Shark Bite':['saw','l','Frenzy','Deals 25% more damage to enemies below half health.'],
'Kraken':['claw','g','Tentacle Grab','Pulls the enemy you hit one step toward you.'],
'Anglerfish':['sickle','m','Lure','Its light reveals enemies hiding in dark places.'],
'Tidebreaker':['trident','l','Riptide','Swim twice as fast while holding it.'],
'Pearl Diver':['classic','t','Deep Breath','Hold your breath underwater twice as long.'],
'Sunken Treasure':['axe','m','Gold Rush','Chests you open give one extra item.'],
'Abyssal':['scythe','g','Crushing Depths','Hits slow enemies by 20% for 2 seconds.'],
'Jellyfish':['crescent','s','Sting','Hits zap for 5 bonus damage over time.'],
'Driftwood':['hammer','m','Float','You fall slower while it\'s out.'],
'Magma Core':['mace','m','Molten','Hits leave lava on the ground that burns for 4 seconds.'],
'Obsidian':['gem','s','Razor Glass','Critical hits deal double damage.'],
'Eruption':['bolt','g','Eruption','Every 10th hit blasts all nearby builds.'],
'Basalt':['mallet','l','Rock Solid','You take no knockback while swinging.'],
'Ember Fang':['claw','m','Ignite','Enemies you hit burn for 3 damage a second.'],
'Ash Cloud':['wing','l','Smokescreen','Hides you from the enemy minimap for 5 seconds after a hit.'],
'Dragon Scale':['double','g','Dragon Breath','Every 8th swing breathes a cone of fire.'],
'Fire Opal':['crescent','t','Heat Shimmer','You\'re harder to see while crouching.'],
'Pumice':['blocky','s','Featherweight','Jump 20% higher.'],
'Phoenix Feather':['wing','l','Rebirth','Once per match, come back with 30 health.'],
'Lollipop Swirl':['crescent','s','Sugar Coat','Your builds get 10% more health.'],
'Gummy Bear':['blocky','t','Bounce','Your first fall each match takes no damage.'],
'Sprinkle Smash':['mallet','g','Sprinkle Burst','Hits spray sprinkles that mark enemies.'],
'Bubblegum Pop':['classic','m','Bubble Shield','Every 15 seconds, blocks the next 20 damage.'],
'Chocolate Bar':['blocky','m','Snack Break','Every heal item also gives +10 shield.'],
'Sour Blast':['bolt','m','Pucker Up','Enemies you hit have shaky aim for 2 seconds.'],
'Rock Candy':['crystal','l','Sugar Crystal','Harvesting sometimes drops a crystal worth 25 of each material.'],
'Ice Cream Dream':['drill','l','Brain Freeze','Enemies you hit build and edit slower for 2 seconds.'],
'Cotton Candy':['crescent','g','Sweet Cloud','Glide down from any height while it\'s out.'],
'Sugar Rush':['saw','l','Sugar Rush','Swing and move 30% faster for 5 seconds after a harvest streak.'],
'Supernova':['star','g','Supernova','Every 12th hit explodes for 40 damage around you.'],
'Meteorite':['mace','l','Impact','Landing a swing from a jump damages enemies nearby.'],
'Moonbeam':['crescent','m','Low Gravity','Your jumps float for an extra second.'],
'Black Hole':['classic','m','Gravity Well','Pulls nearby loot toward you.'],
'Nebula':['wing','l','Stardust Cloud','Silences your footsteps for 5 seconds after a hit.'],
'Comet Tail':['scythe','l','Comet Dash','Dash forward 6 meters every 15 seconds.'],
'Saturn Ring':['axe','t','Orbit','Two rings orbit you and block 10 damage each.'],
'Stardust':['crystal','s','Make a Wish','Chests you open are more likely to hold rare loot.'],
'Rocket Fuel':['drill','m','Liftoff','Launch straight up once a minute.'],
'Event Horizon':['claw','g','Event Horizon','Enemies you hit can\'t build for 3 seconds.'],
'Vine Whip':['leaf','l','Overgrowth','Your builds slowly repair themselves.'],
'Tiger Stripe':['axe','m','Pounce','Your first hit after sprinting deals double damage.'],
'Jaguar':['classic','s','Night Vision','See enemy outlines in tall grass and shadows.'],
'Raptor Claw':['sickle','m','Pack Hunter','Deal 15% more damage when a teammate is close.'],
'Bamboo Breaker':['hammer','l','Bend, Don\'t Break','Your builds take 20% less damage.'],
'Toucan':['drill','t','Beak Peck','Swings twice as fast, but each hit harvests a little less.'],
'Venom':['scythe','g','Toxic','Hits poison enemies for 15 damage over 5 seconds.'],
'Temple Idol':['blocky','m','Ancient Curse','Whoever loots your elimination takes 20 damage.'],
'Parrot Plume':['wing','m','Copycat','Copies the last power-up an enemy used on you.'],
'Canopy King':['leaf','g','Treetop','Stand on treetops like they\'re platforms.'],
'Standard Issue':['classic','m','Reliable','No power-up. Steady damage, steady speed, never lets you down.'],
'Storm Chaser':['bolt','l','Storm Walker','Take no storm damage for your first 10 seconds in it.'],
'Supply Drop':['mallet','g','Airdrop','Once per match, call in your own supply drop.'],
'Private Jet':['wing','l','Jet Boost','Redeploy your glider once per match.'],
'Last One Standing':['halberd','g','Final Circle','Deal 25% more damage in the last three circles.'],
'Golden Chest':['blocky','m','Lucky Find','Chests sometimes drop an extra Legendary weapon.'],
'Shield Potion':['gem','s','Shield Up','Every 10 hits gives +10 shield.'],
'Medkit':['hammer','s','Field Medic','Bandages and medkits use 30% faster.'],
'Wall Builder':['hammer','l','Master Builder','Your builds finish 40% faster.'],
'Eye of the Storm':['crescent','l','Calm Center','Heal 2 health a second inside the safe zone.'],
};
// what each pickaxe's two moves do, for the locker (the moves themselves are POWERS in src/game.ts)
const MOVES={
 "Jack-o-Lantern":["Swing drops a little pumpkin bomb that bursts a second later for 30 damage.","Lob a giant jack-o'-lantern that splits into 5 mini pumpkin bombs when it lands."],
 "Spooky Shadow":["Swing lets out 3 bats that fly to the nearest enemy and nip it.","Turn into a bat swarm and fly fast for 2 seconds, biting everyone you pass through."],
 "Grave Digger":["Shovel scoop flings grave dirt that blinds the target for 1 second.","Slam the shovel to raise 3 floating tombstones that block bullets for 6 seconds."],
 "Grim Reaper":["Wide scythe sweep that hits everyone in front of you.","Spin the scythe in a full circle around you. Every enemy it hits heals you 10."],
 "Candy Corn":["Quick jab that spits 3 candy corn darts.","Spray a fan of 15 candy corn darts."],
 "Witch's Wart":["Hits splash green brew that slows the target.","Throw a bubbling potion that leaves a green cloud. Anyone inside is slowed and poisoned for 5 seconds."],
 "Bone Pick":["Hits show the target's skeleton through walls for 3 seconds.","Throw a bone boomerang that hits on the way out and again on the way back."],
 "Spider Silk":["Hits web the target in place for 1 second.","Shoot a web line at a wall and zip straight to it."],
 "Glossy Ghost":["Swing passes through blocks and hits whoever is behind them.","Go ghost: invisible and bulletproof for 2 seconds, then reappear with a scream that stuns everyone close."],
 "Pumpkin King":["Heavy double-axe chop that does big damage.","Summon 6 flaming pumpkins that circle you for 6 seconds and burn anyone they touch."],
 "Candy Cane Classic":["Hook swing that yanks the target toward you.","Hook onto a block and swing around it like a grappling hook."],
 "Holly Jolly":["Every hit heals you 5.","Hang a sprig of mistletoe. Stay near it to heal 10 a second for 5 seconds."],
 "Gingerbread Smash":["Mallet smash that sends the target spinning away.","Drop a gingerbread man that runs at the nearest enemy and explodes."],
 "Nutcracker Guard":["Long-reach halberd thrust.","Lunge forward 10 meters spear first, cracking any shield you hit."],
 "Frostbite":["Hits chill the target and slow it down.","Blast a cone of frost that freezes enemies into ice blocks."],
 "Sleigh Bell":["Hits ring a bell that stuns the target for half a second.","Ride a flying sleigh for 3 seconds that drops exploding presents behind you."],
 "Ugly Sweater":["Hits tangle the target in yarn and slow it.","Pull on a cozy sweater that soaks up the next 50 damage."],
 "Ornament Breaker":["Each hit sprays glass shards for 5 extra damage.","Throw a giant ornament that shatters into 12 flying shards."],
 "North Star":["Swing fires a small star that homes in on the nearest enemy.","Call down a beam of starlight on the spot you aim at, one second later."],
 "Krampus Claw":["Claw rake that marks the target on your screen for 10 seconds.","Chains shoot out and drag every marked enemy toward you."],
 "Fresh Tag":["Hits paint the target. Painted enemies take 10% more damage for 5 seconds.","Spray a big tag on a wall. Enemies near it show up for everyone for 8 seconds."],
 "Drip Lord":["Swing drips a paint trail in the air.","Dash forward leaving a long paint trail. You fly faster along it."],
 "Wildstyle":["Every swing adds a random bonus: fire, ice or a zap.","Spin the paint wheel and hit with fire, ice and zap all at once."],
 "Wet Paint":["Splatter that sends the target sliding away.","Throw a bucket that leaves a slippery paint cloud. Anyone in it can't stop drifting."],
 "Throw-Up":["Hits pop out a bubble letter that blocks one bullet.","Blow a giant bubble around yourself that blocks bullets for 3 seconds."],
 "Back Alley":["Brick smash that knocks the target back.","Throw down a floating brick wall in front of you as cover for 6 seconds."],
 "Burner":["Hits set the target on fire.","Hold the spray can like a flamethrower for 2 seconds."],
 "Stencil":["Precise strike that crits on head hits.","Cut a straight stencil line through the air that hits everyone along it."],
 "Spray Can":["Hits puff a little cloud of paint smoke.","Throw a smoke can that makes a big cloud you can hide in."],
 "Rooftop King":["Deals 20% more damage when you're above the target.","Leap up high and dive-bomb down onto the target."],
 "Pixel Pick":["8-bit hit with a coin sound. Every 25 hits banks one extra life (once per match).","Fire a stream of pixel blocks like an old-school shooter."],
 "Synthwave":["Swing leaves a neon streak that hurts anyone who touches it.","Retro drive: fly 40% faster for 4 seconds with a neon trail behind you."],
 "Glitch":["Hits sometimes blink you a short hop forward.","Teleport to wherever you aim, up to 20 meters away."],
 "Circuit Breaker":["Hits zap and stun for half a second.","Send out an EMP pulse that stuns everyone close and jams their guns for 2 seconds."],
 "High Score":["Each hit in a row adds 2 damage, up to 10 extra.","Cash in your combo for a blast that grows with your streak."],
 "Laser Edge":["Laser slash that cuts straight through blocks.","Fire a laser beam for 2 seconds."],
 "Joystick":["Swings 25% faster.","Button mash: a rapid flurry of 10 hits."],
 "Hologram":["Hits leave a flickering copy of you for a second.","Send out a hologram of you that flies the other way. Bots chase it."],
 "Bit Crusher":["Hits pixelate the target and slow it.","Shrink the target to tiny for 3 seconds. Tiny enemies take double damage."],
 "Overclock":["After an elimination, swing speed doubles for 5 seconds.","Overclock yourself: move, swing and shoot 50% faster for 4 seconds."],
 "Coral Reef":["Hits throw off sharp coral bits.","Grow a coral shell around yourself that blocks 40 damage."],
 "Shark Bite":["Deals 25% more damage to enemies under half health.","Shark lunge: torpedo forward and bite the first enemy you reach."],
 "Kraken":["Tentacle swing that pulls the target toward you.","Tentacles burst out of the nearest wall and grab every enemy close by for 2 seconds."],
 "Anglerfish":["Hits leave a glowing lure on the target so you can see it through walls.","Dangle a glowing lure that draws bots toward it, then snap it shut for big damage."],
 "Tidebreaker":["Trident stab with long reach.","Throw the trident. It flies back to your hand and hits again on the way."],
 "Pearl Diver":["Quick strike that pops out a pearl that bounces off walls.","Fire 5 pearls that bounce around the box."],
 "Sunken Treasure":["Hits sometimes knock a coin loose for the vending machines.","Throw an anchor on a chain. It drags you to wherever it lands."],
 "Abyssal":["Hits slow the target by 20% for 2 seconds.","Open a dark pressure zone that slows and hurts everyone inside it."],
 "Jellyfish":["Hits sting for a little damage over time.","Release 4 jellyfish that drift around and sting anyone who touches them."],
 "Driftwood":["Heavy thump that knocks the target back.","Ride a wave of driftwood forward, bowling enemies out of the way."],
 "Magma Core":["Hits leave floating lava blobs that burn.","Throw a ball of lava that explodes where it lands."],
 "Obsidian":["Critical hits do double damage.","Fire a barrage of razor glass shards."],
 "Eruption":["Every 10th hit blasts everything around you.","Charge up and erupt in a huge blast all around you."],
 "Basalt":["You take no knockback while swinging.","Rock armor: take half damage for 4 seconds, but move slower."],
 "Ember Fang":["Hits set the target on fire.","Fire-bite dash: lunge forward and burn the first enemy you hit."],
 "Ash Cloud":["Hits puff ash that blinds the target for 1 second.","Hide inside an ash cloud. Bots lose track of you for 5 seconds."],
 "Dragon Scale":["Every 8th swing breathes a quick cone of fire.","Breathe dragon fire in a cone for 2 seconds."],
 "Fire Opal":["Hits make you shimmer and harder to see for 1 second.","Opal flare: a blinding flash in front of you."],
 "Pumice":["Light, fast swing.","Push off with a burst of rock that launches you forward fast."],
 "Phoenix Feather":["Swing throws fire feather darts.","Become a firebird and fly forward in flames, burning everything you touch. Once per match you also rise back with 30 health."],
 "Lollipop Swirl":["Hits make the target dizzy, so its aim shakes.","Spin a giant lollipop in front of you that blocks bullets."],
 "Gummy Bear":["Bouncy hit that sends the target bouncing off the walls.","Throw a gummy bear that sticks to anything and pops."],
 "Sprinkle Smash":["Hits spray sprinkles that mark enemies.","Rain a shower of sprinkles over an area."],
 "Bubblegum Pop":["Hits stick gum on the target and slow it.","Blow a gum bubble and float inside it. It blocks 40 damage."],
 "Chocolate Bar":["Each hit snaps off a piece that heals you 5.","Eat the whole bar: heal 40 over 4 seconds."],
 "Sour Blast":["Hits make the target pucker and miss for 2 seconds.","Spray a sour cone. Nobody in it can aim for 2 seconds."],
 "Rock Candy":["Hits throw off sugar crystals.","Grow candy crystal spikes out of a wall."],
 "Ice Cream Dream":["Hits give brain freeze and slow the target.","Throw a scoop that freezes whoever it hits."],
 "Cotton Candy":["Fluffy hit that slows the target.","Throw a cotton candy cloud that traps everyone in it for 2 seconds."],
 "Sugar Rush":["Each hit in a row makes you a little faster.","Sugar rush: move and swing 30% faster for 5 seconds."],
 "Supernova":["Hits throw off star sparks.","Charge up and explode for 40 damage all around you."],
 "Meteorite":["Heavy smash that hits hard.","Call meteors raining down on the spot you aim at."],
 "Moonbeam":["Swing throws a glowing crescent wave.","Fire a moonbeam laser at the target."],
 "Black Hole":["Hits pull the target in close.","Throw a mini black hole that sucks in everyone close for 3 seconds."],
 "Nebula":["Hits leave stardust that hides your sound.","Turn into a nebula: invisible for 4 seconds while you drift slowly."],
 "Comet Tail":["Swing leaves comet sparks behind.","Comet dash: blast 15 meters forward through enemies."],
 "Saturn Ring":["Throw a ring like a disc.","Two rings orbit you. Each one blocks 10 damage."],
 "Stardust":["Sparkly hit that sometimes grants a small heal.","Make a wish: get a random big boost (full heal, shield, or speed)."],
 "Rocket Fuel":["Drill thrust with a small rocket push.","Blast off in the direction you aim, hitting anything in the way."],
 "Event Horizon":["Hits lock the target's gun for 1 second.","Open a time-stop field. Everything inside freezes for 2 seconds."],
 "Vine Whip":["Long whip lash.","Shoot a vine to pull yourself to a wall, or pull an enemy to you."],
 "Tiger Stripe":["First hit after sprinting does double damage.","Pounce: leap onto the target."],
 "Jaguar":["Hits show the target through walls for 3 seconds.","Stalk: go invisible until your next swing (up to 6 seconds). That swing does double damage."],
 "Raptor Claw":["Triple claw slash.","Call two raptor spirits that chase the nearest enemy."],
 "Bamboo Breaker":["Bamboo staff strike.","Spin the staff to block bullets from the front and sides."],
 "Toucan":["Pecks twice as fast.","Beak drill: a rapid flurry of pecks."],
 "Venom":["Hits poison the target.","Spit a venom glob that bursts into a poison cloud."],
 "Temple Idol":["Hits curse the target. If it's eliminated, the curse explodes.","Ancient curse: everyone you can see takes double damage for 3 seconds."],
 "Parrot Plume":["Hits copy the last effect an enemy used on you, like fire, ice or a zap.","Send a parrot that flies to an enemy and pecks it for 4 seconds."],
 "Canopy King":["Leaf blade slash.","Whip up a leaf storm that spins around you."],
 "Standard Issue":["Reliable chop. No tricks.","Power chop: charge up to triple damage."],
 "Storm Chaser":["Hits arc lightning to a second enemy close by.","Call a storm cloud that strikes lightning around you for 4 seconds."],
 "Supply Drop":["Crate smash.","Call in a supply drop on your aim point. It crushes whoever is under it and gives you a random shop item."],
 "Private Jet":["Wing swing.","Jet boost forward with an afterburner trail."],
 "Last One Standing":["Hits do more damage the fewer players are left.","Crown slam: a golden shockwave that knocks everyone back."],
 "Golden Chest":["Hits throw off golden coin sparks.","Burst a golden chest open and blast loot shards forward."],
 "Shield Potion":["Every 10 hits gives you 10 shield.","Drink a shield splash: 25 shield."],
 "Medkit":["Every hit heals you 3.","Patch up: heal 30 over 3 seconds."],
 "Wall Builder":["Hammer hit.","Hammer out a floating plank wall as cover."],
 "Eye of the Storm":["Hits send out a gust that pushes the target away.","Become the eye of the storm: a whirlwind pushes bullets and enemies away for 3 seconds."],
};
const SIZES={t:{n:'Tiny',L:72,hs:.72,dmg:14,spd:1.5,hv:8},s:{n:'Short',L:100,hs:.88,dmg:18,spd:1.25,hv:10},m:{n:'Standard',L:130,hs:1,dmg:20,spd:1,hv:12},l:{n:'Long',L:168,hs:1.02,dmg:24,spd:.9,hv:12},g:{n:'Giant',L:156,hs:1.3,dmg:32,spd:.7,hv:16}};

const ITEMS=[];
SETS.forEach(s=>(RAW[s.id]||[]).forEach(r=>{
  const [n,rar,shape,h1,h2,edge,hs,ha,hb,pat,pc,x,flav]=r;
  const [shp,sz,pw,pwd]=EXTRA[n];
  const mv=MOVES[n]; // the tap and hold moves replace the old battle-royale power-ups
  ITEMS.push({i:ITEMS.length,set:s,n,rar,shape:shp||shape,h1,h2,edge,hs,ha,hb,pat,pc,x:x||{},flav,sz,pw,tap:mv[0],hold:mv[1],pwd:'Tap: '+mv[0]+' Hold: '+mv[1]});
}));
// Most pickaxes aren't pickaxes any more: each one is reforged into a weapon form below that keeps its colours,
// artwork and moves. The Christmas set is next in line for its own rework, so it stays as it is for now.
const FORM_OF={
 'Jack-o-Lantern':'greatsword','Spooky Shadow':'sabre','Grim Reaper':'reaper','Candy Corn':'dagger','Witch\'s Wart':'spear','Bone Pick':'sabre','Spider Silk':'dagger','Glossy Ghost':'bigaxe',
 'Fresh Tag':'sabre','Drip Lord':'greatsword','Wildstyle':'spear','Wet Paint':'reaper','Throw-Up':'bigaxe','Burner':'dagger','Stencil':'sabre','Rooftop King':'greatsword',
 'Pixel Pick':'dagger','Synthwave':'sabre','Glitch':'greatsword','Circuit Breaker':'spear','High Score':'bigaxe','Laser Edge':'reaper','Hologram':'greatsword','Bit Crusher':'bigaxe','Overclock':'spear',
 'Coral Reef':'sabre','Shark Bite':'greatsword','Kraken':'reaper','Anglerfish':'dagger','Pearl Diver':'sabre','Sunken Treasure':'bigaxe','Abyssal':'reaper','Jellyfish':'spear',
 'Obsidian':'dagger','Eruption':'greatsword','Ember Fang':'sabre','Ash Cloud':'reaper','Dragon Scale':'bigaxe','Fire Opal':'dagger','Pumice':'spear','Phoenix Feather':'sabre',
 'Lollipop Swirl':'spear','Gummy Bear':'dagger','Bubblegum Pop':'sabre','Chocolate Bar':'greatsword','Sour Blast':'bigaxe','Rock Candy':'greatsword','Cotton Candy':'reaper','Sugar Rush':'sabre',
 'Supernova':'greatsword','Moonbeam':'reaper','Black Hole':'sabre','Nebula':'greatsword','Comet Tail':'spear','Saturn Ring':'bigaxe','Stardust':'dagger','Event Horizon':'sabre',
 'Vine Whip':'spear','Tiger Stripe':'bigaxe','Jaguar':'sabre','Raptor Claw':'dagger','Venom':'reaper','Temple Idol':'bigaxe','Parrot Plume':'spear','Canopy King':'greatsword',
 'Storm Chaser':'spear','Private Jet':'sabre','Last One Standing':'greatsword','Golden Chest':'bigaxe','Shield Potion':'dagger','Eye of the Storm':'reaper',
};
// sy stretches the blade along the handle, Lk scales the handle, guard swaps the collar for a crossguard, dual puts one in each hand
const FORMS={
 greatsword:{n:'Greatsword',sy:3.3,Lk:.5,guard:1},
 sabre:{n:'Dual blades',sy:2.2,Lk:.42,guard:1,dual:1},
 dagger:{n:'Twin daggers',sy:1.25,Lk:.34,guard:1,dual:1},
 spear:{n:'Spear',sy:1.4,Lk:1.7},
 reaper:{n:'Reaper scythe',sy:1,Lk:1.85},
 bigaxe:{n:'Battle axe',sy:1,Lk:1.25},
};
ITEMS.forEach(it=>{ const f=FORM_OF[it.n]; if(f){ it.shape=f; it.form=FORMS[f]; } });
const formOf=it=>it.form||null, pickLen=it=>Math.round(SIZES[it.sz].L*(it.form?it.form.Lk:1));
// the Anime set: not pickaxes at all but each hero's own way of fighting (the game gives them their own models and moves)
const ANIME=[
 {n:'Shadow Kunai',hero:'Naruto',anime:'kunai',short:'KUNAI',c:'#ff8a1f',pw:'Shred',pwd:'Tap to slash. Hold to throw fans of kunai that cut straight through.',flav:'Believe it.'},
 {n:'Gum-Gum Fists',hero:'Luffy',anime:'rubber',short:'FISTS',c:'#e8342c',pw:'Gatling',pwd:'Tap for a stretching Pistol punch. Hold for a Gatling of rubber fists.',flav:'Gonna be King of the Pirates.'},
 {n:'Serious Fist',hero:'Saitama',anime:'saitama',short:'FISTS',c:'#ffd23f',pw:'Serious Series',pwd:'Tap for a Normal Punch shockwave. Hold for Consecutive Normal Punches.',flav:'OK.'},
 {n:'Super Saiyan',hero:'Goku',anime:'goku',short:'SAIYAN',c:'#ffc21a',pw:'Power Up',pwd:'Tap for a golden Super Saiyan strike. Hold to power up, then let go to blast everyone around you away.',flav:'I am the hope of the universe.'},
 {n:'Attack Titan',hero:'Eren',anime:'titan',short:'TITAN',c:'#c4553f',pw:'Titan Shift',pwd:'Tap to turn into the Attack Titan for a few seconds and punch people flying. Hold for a titan barrage.',flav:'If you win, you live.'},
 {n:'Nichirin Sword',hero:'Tanjiro',anime:'nichirin',short:'SWORD',c:'#2a7dff',pw:'Water Breathing',pwd:'Tap for Water Breathing slashes. Hold to stand on guard: bullets from the front ring off the blade, and some fly back at the shooter.',flav:'Set your heart ablaze.'},
 {n:'Death Note',hero:'Light Yagami',anime:'deathnote',short:'NOTE',c:'#e8e8ec',pw:'Kira',pwd:'Tap to write a name and fire a black-and-white death beam. Hold to keep writing for a bigger beam that pierces everyone.',flav:'I am justice.'},
];
const animeSet=SETS.find(s=>s.id==='anime');
ANIME.forEach(a=>ITEMS.push(Object.assign({i:ITEMS.length,set:animeSet,rar:4,shape:'classic',h1:a.c,h2:a.c,edge:'#222',hs:'plain',ha:'#333',hb:'#222',pat:'none',pc:'',x:{},sz:'m'},a)));

// ---------- drawing ----------
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const mirror=pts=>{const r=pts.slice().reverse().map(([x,y])=>[200-x,y]);return'M'+pts.concat(r).map(p=>p.join(' ')).join(' L')+'Z'};
const SHAPES={
 classic:'M100 32 C70 30 42 40 18 66 L26 72 C50 54 74 48 100 52 C126 48 150 54 174 72 L182 66 C158 40 130 30 100 32Z',
 axe:'M100 32 L64 30 C48 22 32 20 22 24 C12 42 12 66 24 84 C34 74 48 64 64 58 L100 54 C126 50 150 56 176 72 L182 66 C158 42 130 32 100 32Z',
 hammer:'M100 34 L58 34 L58 22 L20 22 Q16 22 16 26 L16 64 Q16 68 20 68 L58 68 L58 54 L100 52 C126 48 150 56 176 72 L182 66 C158 42 130 32 100 34Z',
 crescent:'M100 26 C60 24 24 40 8 86 C30 60 62 50 100 54 C138 50 170 60 192 86 C176 40 140 24 100 26Z',
 scythe:'M100 32 C140 18 182 30 198 74 C176 56 142 48 100 54 L80 54 C66 56 50 62 38 72 C44 58 56 42 80 34Z',
 crystal:'M100 28 L76 18 L62 34 L42 24 L34 42 L12 48 L26 60 L48 56 L70 60 L100 54 L130 60 L152 56 L174 60 L188 48 L166 42 L158 24 L138 34 L124 18Z',
 star:'M100 26 L84 30 L70 14 L64 34 L40 34 L52 46 L18 58 L56 58 L68 70 L76 56 L100 54 L124 56 L132 70 L144 58 L182 58 L148 46 L160 34 L136 34 L130 14 L116 30Z',
 claw:'M100 30 C80 28 58 34 40 50 C28 60 20 72 18 88 C30 72 44 62 60 56 C50 66 44 76 46 90 C56 72 72 60 100 54 C128 60 144 72 154 90 C156 76 150 66 140 56 C156 62 170 72 182 88 C180 72 172 60 160 50 C142 34 120 28 100 30Z',
 saw:'M100 30 C66 28 36 40 14 66 L24 70 L30 62 L36 66 L42 58 L50 62 L56 54 L66 58 L72 52 L82 56 L88 50 L100 54 L112 50 L118 56 L128 52 L134 58 L144 54 L150 62 L158 58 L164 66 L170 62 L176 70 L186 66 C164 40 134 28 100 30Z',
 hook:'M100 32 C86 32 74 30 60 26 C44 20 26 22 18 36 C10 50 18 66 32 66 C42 66 48 58 46 50 L38 50 C38 56 34 58 30 57 C24 55 22 46 26 40 C32 32 44 32 56 36 C70 42 86 52 100 54 C126 50 150 56 176 72 L182 66 C158 42 130 32 100 32Z',
 wing:'M100 32 C120 20 150 10 180 8 C170 30 170 50 186 76 C152 58 126 52 100 54 C74 52 48 58 14 76 C30 50 30 30 20 8 C50 10 80 20 100 32Z',
 bat:'M100 32 C130 20 162 20 192 40 C184 50 182 58 186 72 C174 62 164 62 156 72 C150 62 138 60 128 66 C122 58 112 54 100 56 C88 54 78 58 72 66 C62 60 50 62 44 72 C36 62 26 62 14 72 C18 58 16 50 8 40 C38 20 70 20 100 32Z',
 bolt:'M100 32 L130 26 L146 10 L146 28 L186 24 L156 46 L172 50 L122 58 L100 54 L78 58 L28 50 L44 46 L14 24 L54 28 L54 10 L70 26Z',
 leaf:'M100 32 C70 16 34 20 10 50 C38 64 72 60 100 54 C128 60 162 64 190 50 C166 20 130 16 100 32Z',
 blocky:'M100 30 L40 30 L16 48 L16 68 L40 56 L100 54 L160 56 L184 68 L184 48 L160 30Z',
 double:'M100 34 L64 32 C50 22 32 16 20 18 C10 40 10 70 20 90 C34 80 50 70 64 60 L100 56 L136 60 C150 70 166 80 180 90 C190 70 190 40 180 18 C168 16 150 22 136 32Z',
 halberd:'M100 2 L108 30 L140 28 C156 22 172 20 182 24 C190 44 188 66 178 84 C166 72 150 62 136 58 L100 56 L80 56 L58 66 L64 54 L44 52 L66 44 L92 32Z',
 trident:'M36 58 L36 40 C36 30 40 22 46 14 L48 34 C50 40 58 44 70 44 L92 44 L92 16 L100 0 L108 16 L108 44 L130 44 C142 44 150 40 152 34 L154 14 C160 22 164 30 164 40 L164 58Z',
 mace:'M100.0 -4.0 L109.2 7.8 L124.0 6.0 L122.2 20.8 L134.0 30.0 L122.2 39.2 L124.0 54.0 L109.2 52.2 L100.0 64.0 L90.8 52.2 L76.0 54.0 L77.8 39.2 L66.0 30.0 L77.8 20.8 L76.0 6.0 L90.8 7.8Z',
 drill:'M84 30 L196 46 L84 62 L74 62 L74 30Z',
 mallet:'M100 32 L12 22 Q4 22 4 30 L4 70 Q4 78 12 78 L100 66 L188 78 Q196 78 196 70 L196 30 Q196 22 188 22Z',
 sickle:'M100 32 C128 8 178 4 194 40 C176 24 146 28 122 50 L100 56 L86 54 L86 34Z',
 shovel:'M66 54 L66 20 C66 6 84 -4 100 -8 C116 -4 134 6 134 20 L134 54 L112 58 L88 58Z',
 gem:'M100 4 L150 28 L178 48 L100 74 L22 48 L50 28Z',
 greatsword:'M82 57 L82 4 L100 -10 L118 4 L118 57Z',
 sabre:'M90 57 L90 8 C92 -1 101 -7 114 -10 C107 0 110 9 110 57Z',
 dagger:'M86 57 L86 22 L100 -10 L114 22 L114 57Z',
 spear:'M100 -10 C116 8 120 32 107 57 L93 57 C80 32 84 8 100 -10Z',
 reaper:'M107 26 C80 2 36 -8 2 18 C12 22 22 36 26 56 C42 36 68 32 94 57 L107 57Z',
 bigaxe:'M108 34 L72 38 C56 34 38 20 24 -6 C2 28 2 70 24 104 C38 80 56 66 72 62 L108 66 L126 50Z',
 pixel:mirror([[100,28],[60,28],[60,32],[44,32],[44,36],[32,36],[32,42],[24,42],[24,50],[18,50],[18,66],[28,66],[28,58],[36,58],[36,52],[50,52],[50,50],[100,50]]),
};
const SHAPE_NAMES={greatsword:'Greatsword',sabre:'Dual blades',dagger:'Twin daggers',spear:'Spear',reaper:'Reaper scythe',bigaxe:'Battle axe',double:'Double axe',halberd:'Halberd',trident:'Trident',mace:'Spiked mace',drill:'Drill',mallet:'Giant mallet',sickle:'Sickle',shovel:'Shovel',gem:'Gem',classic:'Classic pick',axe:'Axe and spike',hammer:'Hammer and spike',crescent:'Crescent',scythe:'Scythe',crystal:'Crystal shards',star:'Star',claw:'Triple claw',saw:'Serrated',hook:'Hook',wing:'Wings',bat:'Bat wings',bolt:'Lightning',leaf:'Leaf',blocky:'Block',pixel:'Pixel'};
const HANDLE_NAMES={plain:'Smooth',wrap:'Wrapped grip',twist:'Twisted',bone:'Bone',bamboo:'Bamboo',rope:'Rope bound',pixel:'Pixel'};

function patternSVG(it,id,R){
  const c=it.pc, p=it.pat; let s='';
  const line=(d,w,col,o)=>`<path d="${d}" fill="none" stroke="${col||c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${o?` opacity="${o}"`:''}/>`;
  switch(p){
  case 'stripes':{s+=`<pattern id="${id}st" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="7" height="16" fill="${c}"/></pattern><rect x="0" y="0" width="200" height="100" fill="url(#${id}st)"/>`;break}
  case 'tiger':{for(let k=0;k<9;k++){const x=22+k*20+(k>4?6:0); if(Math.abs(x-100)<14) continue; s+=line(`M${x} ${20+R()*8} Q${x+8} ${40} ${x-4} ${58+R()*12} L${x+4} ${48}`,5);}break}
  case 'bands':{const b=it.x.bands; s+=`<rect x="0" y="0" width="200" height="38" fill="${b[0]}"/><rect x="0" y="38" width="200" height="14" fill="${b[1]}"/><rect x="0" y="52" width="200" height="60" fill="${b[2]}"/>`;break}
  case 'rainbow':{['#ff5a6a','#ff9a3a','#ffe14d','#5ad66a','#3fa0f5','#9b5cff'].forEach((col,k)=>s+=`<rect x="0" y="${14+k*12}" width="200" height="12" fill="${col}"/>`);break}
  case 'dots':{s+=`<pattern id="${id}dt" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="6" cy="6" r="2.6" fill="${c}"/></pattern><rect width="200" height="100" fill="url(#${id}dt)" opacity=".75"/>`;break}
  case 'halftone':{for(let y=24;y<92;y+=8)for(let x=8;x<196;x+=8){const r=Math.max(0,(y-30)/20);if(r>0)s+=`<circle cx="${x+(y%16?4:0)}" cy="${y}" r="${Math.min(3.4,r)}" fill="${c}"/>`;}break}
  case 'holes':{for(let k=0;k<22;k++)s+=`<circle cx="${12+R()*176}" cy="${18+R()*66}" r="${1.5+R()*3}" fill="${c}"/>`;break}
  case 'suckers':{for(let k=0;k<16;k++){const x=16+R()*168,y=50+R()*34;s+=`<circle cx="${x}" cy="${y}" r="${2.5+R()*2.5}" fill="none" stroke="${c}" stroke-width="1.8"/>`;}break}
  case 'spots':{for(let k=0;k<18;k++){const x=14+R()*172,y=24+R()*50;s+=`<path d="M${x} ${y} a4 3.5 0 1 1 1 0" fill="none" stroke="${c}" stroke-width="2.6"/>`;s+=`<circle cx="${x+0.5}" cy="${y-3}" r="1.6" fill="${c}"/>`;}break}
  case 'cracks':{for(let k=0;k<5;k++){let x=20+R()*160,y=24+R()*10,d=`M${x} ${y}`;for(let j=0;j<5;j++){x+=(R()-.5)*22;y+=6+R()*9;d+=` L${x.toFixed(1)} ${y.toFixed(1)}`;}s+=line(d,2.4);s+=line(d,6,c,.25);}break}
  case 'circuit':{for(let k=0;k<7;k++){let x=18+R()*164,y=28+R()*10,d=`M${x} ${y}`;const dir=x<100?-1:1;y+=8+R()*14;d+=` L${x} ${y}`;x+=dir*(8+R()*18);d+=` L${x.toFixed(0)} ${y.toFixed(0)}`;s+=line(d,1.8);s+=`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="2.4" fill="${c}"/>`;}break}
  case 'tag':{s+=line('M30 50 C40 30 52 34 50 48 C48 60 62 58 68 40 C72 30 80 46 76 52',4);s+=line('M124 44 C130 30 144 30 146 44 C148 56 136 58 140 46 C144 36 160 38 164 52 L172 44',4);s+=line('M40 62 L74 50',2.4,c,.8);break}
  case 'web':{for(let a=0;a<12;a++){const t=a/12*Math.PI*2;s+=line(`M100 46 L${100+Math.cos(t)*120} ${46+Math.sin(t)*120}`,1.1);}for(const r of[22,38,56,76])s+=`<circle cx="100" cy="46" r="${r}" fill="none" stroke="${c}" stroke-width="1.1"/>`;break}
  case 'jack':{for(const side of[-1,1]){const ex=100+side*44;s+=`<path d="M${ex-7} 48 L${ex} 38 L${ex+7} 48Z" fill="${c}"/>`;}s+=`<path d="M40 56 L48 60 L54 56 L60 60 L66 56" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M134 56 L140 60 L146 56 L152 60 L160 56" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`;break}
  case 'berries':{for(const cx of[64,136]){s+=`<path d="M${cx-12} 40 Q${cx-4} 34 ${cx} 44 Q${cx+4} 34 ${cx+12} 40 Q${cx+4} 46 ${cx} 44 Q${cx-4} 46 ${cx-12} 40Z" fill="#0b4a26"/>`;for(const [dx,dy] of[[-3,46],[3,47],[0,51]])s+=`<circle cx="${cx+dx}" cy="${dy}" r="3.4" fill="${c}"/><circle cx="${cx+dx-1}" cy="${dy-1.2}" r="1" fill="#fff" opacity=".7"/>`;}break}
  case 'icing':{s+=line('M14 40 Q22 32 30 40 T46 40 T62 40 T78 40 T94 40',3.2);s+=line('M106 40 Q114 32 122 40 T138 40 T154 40 T170 40 T186 40',3.2);for(let k=0;k<8;k++)s+=`<circle cx="${20+k*22+(k>3?8:0)}" cy="54" r="2.4" fill="${['#e3243b','#3fd06e','#ffffff'][k%3]}"/>`;break}
  case 'frost':{s+=`<linearGradient id="${id}fr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient><rect width="200" height="100" fill="url(#${id}fr)"/>`;for(let k=0;k<6;k++){const x=20+R()*160,y=30+R()*20;s+=line(`M${x-5} ${y} L${x+5} ${y} M${x} ${y-5} L${x} ${y+5} M${x-3.5} ${y-3.5} L${x+3.5} ${y+3.5} M${x+3.5} ${y-3.5} L${x-3.5} ${y+3.5}`,1.2);}break}
  case 'knit':{for(let y=30;y<86;y+=12){let d=`M0 ${y}`;for(let x=0;x<=200;x+=10)d+=` L${x} ${y+((x/10)%2?5:0)}`;s+=line(d,2.6);}break}
  case 'checker':{s+=`<pattern id="${id}ck" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="${c}"/><rect x="8" y="8" width="8" height="8" fill="${c}"/></pattern><rect width="200" height="100" fill="url(#${id}ck)" opacity=".55"/>`;break}
  case 'bricks':{for(let y=22,r=0;y<92;y+=9,r++){s+=line(`M0 ${y} L200 ${y}`,1.4);for(let x=(r%2?10:0);x<200;x+=20)s+=line(`M${x} ${y} L${x} ${y+9}`,1.4);}break}
  case 'flames':{for(let k=0;k<7;k++){const x=18+k*27,h=26+R()*20;s+=`<path d="M${x-12} 96 C${x-12} ${88-h*.4} ${x-4} ${86-h*.6} ${x} ${88-h} C${x+4} ${86-h*.6} ${x+12} ${88-h*.4} ${x+12} 96Z" fill="${c}" opacity=".85"/>`;}break}
  case 'scan':{for(let y=16;y<96;y+=5)s+=`<rect x="0" y="${y}" width="200" height="1.6" fill="${c}" opacity=".35"/>`;break}
  case 'glitch':{for(let k=0;k<8;k++){const y=22+R()*60,w=20+R()*50,x=R()*160;s+=`<rect x="${x}" y="${y}" width="${w}" height="${2+R()*4}" fill="${['#19e3ff','#ff3fd8','#ffffff'][k%3]}" opacity=".9"/>`;}break}
  case 'waves':{for(let y=34;y<90;y+=10){let d=`M0 ${y}`;for(let x=0;x<200;x+=20)d+=` q5 -5 10 0 t10 0`;s+=line(d,1.8,c,.8);}break}
  case 'scales':{s+=`<pattern id="${id}sc" width="14" height="10" patternUnits="userSpaceOnUse"><path d="M0 10 A7 7 0 0 1 14 10" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M-7 5 A7 7 0 0 1 7 5 M7 5 A7 7 0 0 1 21 5" fill="none" stroke="${c}" stroke-width="1.6"/></pattern><rect width="200" height="100" fill="url(#${id}sc)" opacity=".8"/>`;break}
  case 'sprinkles':{const cols=['#ffffff','#ffe14d','#3fa0f5','#55c95f','#b866f5','#ff5a6a'];for(let k=0;k<30;k++){const x=12+R()*176,y=20+R()*50;s+=`<rect x="${x}" y="${y}" width="6" height="2.2" rx="1.1" fill="${cols[k%6]}" transform="rotate(${R()*180} ${x+3} ${y+1})"/>`;}break}
  case 'galaxy':{s+=`<radialGradient id="${id}g1"><stop offset="0" stop-color="#ff6ad8" stop-opacity=".9"/><stop offset="1" stop-color="#ff6ad8" stop-opacity="0"/></radialGradient><radialGradient id="${id}g2"><stop offset="0" stop-color="#4ad6ff" stop-opacity=".85"/><stop offset="1" stop-color="#4ad6ff" stop-opacity="0"/></radialGradient><ellipse cx="50" cy="52" rx="44" ry="22" fill="url(#${id}g1)"/><ellipse cx="146" cy="48" rx="48" ry="22" fill="url(#${id}g2)"/><ellipse cx="96" cy="40" rx="30" ry="14" fill="url(#${id}g1)" opacity=".6"/>`;for(let k=0;k<34;k++)s+=`<circle cx="${8+R()*184}" cy="${10+R()*80}" r="${R()<.15?1.6:.8}" fill="#fff"/>`;break}
  case 'rings':{for(const r of[18,30,44,60,78])s+=`<ellipse cx="100" cy="48" rx="${r}" ry="${r*.42}" fill="none" stroke="${c}" stroke-width="1.6" opacity="${1-r/100}"/>`;break}
  case 'veins':{s+=line('M100 46 C70 44 40 44 14 50',2);s+=line('M100 46 C130 44 160 44 186 50',2);for(let k=0;k<5;k++){const x=30+k*14;s+=line(`M${x} 46 L${x-8} 36 M${x} 47 L${x-8} 56`,1.4);s+=line(`M${200-x} 46 L${208-x} 36 M${200-x} 47 L${208-x} 56`,1.4);}break}
  case 'bamboo':{for(const x of[34,60,140,166])s+=line(`M${x} 14 L${x} 96`,2.6);break}
  case 'grain':{for(let k=0;k<7;k++){const y=26+k*7;s+=line(`M10 ${y} C50 ${y-4} 70 ${y+4} 110 ${y} S170 ${y-3} 194 ${y+2}`,1.3,c,.7);}break}
  case 'planks':{for(const x of[46,76,124,154])s+=line(`M${x} 10 L${x} 96`,2.2);for(const x of[30,62,138,170])s+=`<circle cx="${x}" cy="36" r="2" fill="${c}"/><circle cx="${x}" cy="56" r="2" fill="${c}"/>`;break}
  case 'glyphs':{const g=['M0 0 h8 v8 h-8z M3 3 h2 v2 h-2z','M4 0 L8 8 L0 8Z','M0 4 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0 M4 0 v8','M0 0 L8 8 M8 0 L0 8'];for(let k=0;k<12;k++){const col=k%6,row=Math.floor(k/6);const gx=(col<3?28+col*16:126+(col-3)*16),gy=36+row*13;s+=`<path d="${g[k%4]}" transform="translate(${gx} ${gy})" fill="none" stroke="${c}" stroke-width="1.6"/>`;}break}
  case 'cross':{for(const cx of[40,148])s+=`<path d="M${cx-4} ${34} h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8z" fill="${c}"/>`;break}
  case 'swirl':{let d='M100 46';for(let t=0;t<14;t+=.3){const r=3+t*5.4;d+=` L${(100+Math.cos(t)*r*1.6).toFixed(1)} ${(46+Math.sin(t)*r*.6).toFixed(1)}`;}s+=line(d,2.2,c,.75);break}
  case 'shine':break;
  }
  return s;
}

function handleSVG(it,id,L){
  const a=it.ha,b=it.hb,E=50+L; let s=`<linearGradient id="${id}hg" x1="0" x2="1"><stop offset="0" stop-color="${b}"/><stop offset=".45" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  s+=`<clipPath id="${id}hc"><rect x="93" y="50" width="14" height="${L}" rx="6"/></clipPath>`;
  s+=`<rect x="93" y="50" width="14" height="${L}" rx="6" fill="url(#${id}hg)" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>`; let o='';
  const g0=E-Math.min(66,L*.5);
  switch(it.hs){
   case 'wrap': for(let y=g0;y<E;y+=9)o+=`<path d="M92 ${y} L108 ${y-6} L108 ${y-2} L92 ${y+4}Z" fill="${b}" opacity=".9"/>`; break;
   case 'twist': for(let y=52;y<E+6;y+=12)o+=`<path d="M92 ${y} L108 ${y-8} L108 ${y-3} L92 ${y+5}Z" fill="${b}"/>`; break;
   case 'rope': for(let y=g0;y<E;y+=5)o+=`<path d="M92 ${y} L108 ${y-4}" stroke="${b}" stroke-width="2"/>`; break;
   case 'bamboo': for(let y=82;y<E-8;y+=36)o+=`<rect x="92" y="${y}" width="16" height="4" rx="2" fill="${b}"/>`; break;
   case 'bone': o+=`<rect x="92" y="60" width="16" height="2" fill="${b}" opacity=".6"/><rect x="92" y="${E-10}" width="16" height="2" fill="${b}" opacity=".6"/>`; break;
   case 'pixel': for(let y=56;y<E;y+=12)o+=`<rect x="93" y="${y}" width="14" height="6" fill="${b}"/>`; break;
  }
  if(it.hs==='bone') s+=`<circle cx="91" cy="${E}" r="6.5" fill="${a}" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/><circle cx="109" cy="${E}" r="6.5" fill="${a}" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>`;
  s+=`<g clip-path="url(#${id}hc)">${o}<rect x="95" y="50" width="3" height="${L}" fill="#fff" opacity=".18"/></g>`;
  return s;
}

function pommelSVG(it){
  const edge=it.edge, g=it.x.gem, p=it.x.pom;
  if(p==='skull')return`<g transform="translate(100 186)"><path d="M-9 -2 C-9 -12 9 -12 9 -2 L9 3 L5 3 L5 7 L-5 7 L-5 3 L-9 3Z" fill="#f2ead6" stroke="#3a3020" stroke-width="1.5"/><circle cx="-3.6" cy="-3" r="2.4" fill="${it.x.glow||'#20202a'}"/><circle cx="3.6" cy="-3" r="2.4" fill="${it.x.glow||'#20202a'}"/></g>`;
  if(p==='spike')return`<path d="M93 180 L100 198 L107 180Z" fill="${edge}" stroke="rgba(0,0,0,.5)" stroke-width="1.5"/>`;
  if(p==='ball')return`<circle cx="100" cy="186" r="9" fill="#e3243b" stroke="#5a0a10" stroke-width="1.5"/><circle cx="97" cy="183" r="3" fill="#fff" opacity=".6"/>`;
  if(p==='crown')return`<path d="M90 180 L90 192 L110 192 L110 180 L105 186 L100 178 L95 186Z" fill="#ffd23f" stroke="#7a4a00" stroke-width="1.5"/>`;
  if(p==='lure')return`<path d="M100 180 C100 188 110 190 112 196" fill="none" stroke="${edge}" stroke-width="2"/><circle cx="112" cy="197" r="4.5" fill="#fff27a"/>`;
  return`<rect x="91" y="176" width="18" height="10" rx="4" fill="${g||edge}" stroke="rgba(0,0,0,.5)" stroke-width="1.5"/>`;
}

const PART={
 embers:(R,c)=>`<circle cx="0" cy="0" r="${1.4+R()*1.6}" fill="${['#ffb13d','#ff6a1a','#ffe14d'][Math.floor(R()*3)]}"/>`,
 snow:(R)=>`<circle cx="0" cy="0" r="${1.2+R()*1.8}" fill="#ffffff" opacity=".9"/>`,
 bubbles:(R)=>`<circle cx="0" cy="0" r="${2+R()*3.5}" fill="rgba(255,255,255,.12)" stroke="rgba(220,250,255,.75)" stroke-width="1"/>`,
 bats:(R)=>`<path d="M0 0 C-4 -4 -8 -4 -11 -1 C-8 -1 -7 1 -6 3 C-4 1 -2 1 0 3 C2 1 4 1 6 3 C7 1 8 -1 11 -1 C8 -4 4 -4 0 0Z" fill="#140b20" transform="scale(${.8+R()*.6})"/>`,
 sparkles:(R)=>`<path d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4Z" fill="#fff" transform="scale(${.5+R()*.7})"/>`,
 stars:(R)=>`<path d="M0 -5 L1.5 -1.6 L5 -1.5 L2.3 0.8 L3.1 4.5 L0 2.5 L-3.1 4.5 L-2.3 0.8 L-5 -1.5 L-1.5 -1.6Z" fill="#ffe27a" transform="scale(${.6+R()*.6})"/>`,
 spray:(R)=>{let s='';for(let k=0;k<6;k++)s+=`<circle cx="${(R()-.5)*10}" cy="${(R()-.5)*10}" r="${.6+R()}" fill="${['#ff3fa4','#19e3ff','#ffe14d'][k%3]}"/>`;return s},
 bolts:(R)=>`<path d="M2 -8 L-3 1 L1 1 L-2 8 L4 -2 L0 -2Z" fill="#fff27a" transform="scale(${.8+R()*.5})"/>`,
 coins:(R)=>`<ellipse cx="0" cy="0" rx="${3+R()}" ry="4" fill="#ffd23f" stroke="#a36a00" stroke-width="1"/>`,
 leaves:(R)=>`<path d="M0 -5 C4 -3 4 3 0 5 C-4 3 -4 -3 0 -5Z" fill="${['#53d16b','#2a8a3a','#a8d86a'][Math.floor(R()*3)]}" transform="rotate(${R()*180})"/>`,
 ash:(R)=>`<circle cx="0" cy="0" r="${1+R()*2.2}" fill="#9a9aa2" opacity=".75"/>`,
 wisps:(R)=>`<circle cx="0" cy="0" r="${2+R()*3}" fill="rgba(210,255,240,.55)"/>`,
};

const ANIME_ART={
 // two crossed kunai over Naruto's orange swirl
 kunai:id=>{ const k=(r)=>`<g transform="rotate(${r} 100 100)"><circle cx="100" cy="168" r="9" fill="none" stroke="#3a3d44" stroke-width="4.5"/><rect x="95" y="122" width="10" height="38" rx="2" fill="#e8dcc0"/>`+
   [0,1,2,3,4].map(i=>`<path d="M95 ${126+i*7}l10 4" stroke="#a89a78" stroke-width="2"/>`).join('')+`<rect x="92" y="116" width="16" height="7" rx="2" fill="#3a3d44"/><path d="M100 30 L116 92 L100 118 L84 92Z" fill="url(#${id}b)" stroke="#16181c" stroke-width="2.5" stroke-linejoin="round"/><path d="M100 34 L100 116" stroke="#fff" stroke-opacity=".35" stroke-width="2"/></g>`;
   return `<defs><linearGradient id="${id}b" x1="0" x2="1"><stop offset="0" stop-color="#5a606b"/><stop offset=".5" stop-color="#c9ced6"/><stop offset="1" stop-color="#3b4048"/></linearGradient></defs>`+
   `<circle cx="100" cy="100" r="62" fill="#ff8a1f" opacity=".22"/><path d="M100 100m-40 0a40 40 0 1 0 40-40a28 28 0 1 1-28 28a16 16 0 1 0 16-16" fill="none" stroke="#ff8a1f" stroke-width="7" stroke-linecap="round" opacity=".7"/>`+k(-32)+k(32); },
 // a rubber arm stretching out of a red sleeve into a big fist, with the straw hat
 rubber:id=>`<circle cx="100" cy="100" r="62" fill="#e8342c" opacity=".18"/><path d="M34 150 C70 150 70 92 104 90 C130 88 132 70 140 64" fill="none" stroke="#f2c49a" stroke-width="15" stroke-linecap="round"/><path d="M34 150 C70 150 70 92 104 90 C130 88 132 70 140 64" fill="none" stroke="#c98d66" stroke-width="15" stroke-linecap="round" stroke-dasharray="2 13" opacity=".5"/>`+
   `<rect x="14" y="136" width="30" height="28" rx="6" fill="#e8342c" stroke="#8a1612" stroke-width="2.5" transform="rotate(-8 29 150)"/><g transform="translate(150 56) rotate(-30)"><rect x="-22" y="-20" width="44" height="40" rx="13" fill="#f2c49a" stroke="#8a5a3a" stroke-width="2.5"/>`+
   [-13,-4,5,14].map(x=>`<path d="M${x} -20 v14" stroke="#8a5a3a" stroke-width="2"/>`).join('')+`<rect x="-26" y="-2" width="12" height="18" rx="5" fill="#f2c49a" stroke="#8a5a3a" stroke-width="2"/></g>`+
   `<g transform="translate(64 50)"><ellipse cx="0" cy="8" rx="34" ry="9" fill="#f0cf6a" stroke="#9a7a2a" stroke-width="2"/><path d="M-18 8 C-18 -16 18 -16 18 8Z" fill="#f0cf6a" stroke="#9a7a2a" stroke-width="2"/><rect x="-18" y="0" width="36" height="7" fill="#d4232a"/></g>`,
 // a red-gloved fist punching out of shockwave rings
 saitama:id=>`<circle cx="100" cy="100" r="62" fill="#ffd23f" opacity=".2"/>`+[0,1,2].map(i=>`<ellipse cx="${132+i*12}" cy="${76-i*7}" rx="${20+i*12}" ry="${32+i*16}" transform="rotate(-30 ${132+i*12} ${76-i*7})" fill="none" stroke="#fff" stroke-width="${5-i*1.4}" opacity="${0.9-i*0.25}"/>`).join('')+
   `<path d="M30 168 L70 128" stroke="#ffd23f" stroke-width="26" stroke-linecap="round"/><rect x="58" y="104" width="34" height="34" rx="6" fill="#d4232a" transform="rotate(-45 75 121)"/>`+
   `<g transform="translate(108 92) rotate(-45)"><rect x="-26" y="-24" width="52" height="46" rx="14" fill="#e8342c" stroke="#7a1010" stroke-width="3"/>`+[-15,-5,5,15].map(x=>`<path d="M${x} -24 v14" stroke="#7a1010" stroke-width="2.5"/>`).join('')+`<rect x="-30" y="-4" width="14" height="20" rx="6" fill="#e8342c" stroke="#7a1010" stroke-width="2.5"/><path d="M-18 -18 h20" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/></g>`,
};
ANIME_ART.goku=id=>`<defs><linearGradient id="${id}h" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f0a010"/><stop offset=".6" stop-color="#ffd23a"/><stop offset="1" stop-color="#fff2a8"/></linearGradient></defs>`+
  `<circle cx="100" cy="104" r="64" fill="#ffc21a" opacity=".2"/>`+[0,1,2,3,4,5,6,7,8].map(i=>{ const a=-Math.PI*0.95+i*Math.PI*0.95/4, x=100+Math.cos(a)*74, y=118+Math.sin(a)*74; return `<path d="M${100+Math.cos(a-0.12)*46} ${118+Math.sin(a-0.12)*46} L${x} ${y} L${100+Math.cos(a+0.12)*46} ${118+Math.sin(a+0.12)*46}Z" fill="#ffd84a" opacity=".55"/>`; }).join('')+
  // the spiky golden hair, swept up
  `<path d="M44 150 L50 104 L26 86 L60 84 L50 46 L80 70 L84 26 L104 62 L122 22 L128 66 L156 40 L148 82 L178 82 L152 104 L158 150 C140 124 120 118 100 118 C80 118 60 124 44 150Z" fill="url(#${id}h)" stroke="#9a5a08" stroke-width="3" stroke-linejoin="round"/>`+
  `<path d="M74 118 L86 96 L92 120 L100 92 L108 120 L116 96 L126 118" fill="#ffd23a" stroke="#9a5a08" stroke-width="2.5" stroke-linejoin="round"/>`+
  [[58,58],[150,60],[40,120],[164,126]].map(([x,y])=>`<path d="M${x} ${y-8} L${x+3} ${y-2} L${x+9} ${y} L${x+3} ${y+2} L${x} ${y+8} L${x-3} ${y+2} L${x-9} ${y} L${x-3} ${y-2}Z" fill="#fff6c0"/>`).join('');
ANIME_ART.nichirin=id=>`<defs><pattern id="${id}c" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#1f7a4a"/><rect width="10" height="10" fill="#111"/><rect x="10" y="10" width="10" height="10" fill="#111"/></pattern><clipPath id="${id}k"><circle cx="100" cy="100" r="62"/></clipPath></defs>`+
  `<circle cx="100" cy="100" r="62" fill="url(#${id}c)" opacity=".35"/><g clip-path="url(#${id}k)" fill="none" stroke-linecap="round"><path d="M30 150 C60 90 120 70 176 60" stroke="#1f6fe0" stroke-width="16" opacity=".85"/><path d="M34 160 C70 112 120 98 180 92" stroke="#6fb8ff" stroke-width="8" opacity=".8"/><path d="M28 140 C60 84 118 62 172 50" stroke="#e6f4ff" stroke-width="4"/></g>`+
  `<g transform="rotate(42 100 100)"><path d="M95 12 C101 22 104 30 104 40 L104 130 L96 130 L96 34Z" fill="#16181c" stroke="#d8dee8" stroke-width="2"/><path d="M103 30 L103 130" stroke="#d8dee8" stroke-width="2.5"/>`+
  `<path d="M78 128 L122 128 L130 136 L122 144 L78 144 L70 136Z" fill="#26282c" stroke="#0a0a0c" stroke-width="2"/><rect x="94" y="144" width="12" height="46" rx="4" fill="#15233a"/>`+[0,1,2,3].map(i=>`<path d="M100 ${149+i*10} l4 4 l-4 4 l-4 -4Z" fill="#e8e2d0"/>`).join('')+`</g>`;
ANIME_ART.deathnote=id=>`<circle cx="100" cy="100" r="62" fill="#e8e8ec" opacity=".14"/><g transform="rotate(-10 92 100)"><rect x="46" y="34" width="96" height="130" rx="4" fill="#0c0c0e" stroke="#3a3a40" stroke-width="2.5"/><rect x="138" y="38" width="7" height="122" fill="#efe9dc"/>`+
  `<text x="94" y="94" text-anchor="middle" font-family="Times New Roman,serif" font-weight="700" font-size="20" fill="#f2f2f2">DEATH</text><text x="94" y="118" text-anchor="middle" font-family="Times New Roman,serif" font-weight="700" font-size="20" fill="#f2f2f2">NOTE</text></g>`+
  `<circle cx="150" cy="150" r="20" fill="#c8141c" stroke="#6a0a0e" stroke-width="2.5"/><path d="M150 130 q2 -8 6 -12" stroke="#4a2e18" stroke-width="3" fill="none"/><ellipse cx="160" cy="122" rx="8" ry="3.5" fill="#2f8a3a" transform="rotate(-20 160 122)"/><path d="M141 141 q4 -4 9 -3" stroke="#fff" stroke-opacity=".55" stroke-width="3" fill="none" stroke-linecap="round"/>`;
ANIME_ART.titan=id=>`<circle cx="100" cy="104" r="64" fill="#c4553f" opacity=".18"/>`+
  [[62,70,16],[140,60,20],[150,96,14],[54,104,12]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#d9d1cb" opacity=".75"/>`).join('')+
  `<path d="M60 176 L72 136 L128 136 L140 176Z" fill="#a24634" stroke="#5a1c12" stroke-width="3"/>`+[78,92,106,120].map(x=>`<path d="M${x} 140 L${x-4} 174" stroke="#7a2e22" stroke-width="2"/>`).join('')+
  `<rect x="58" y="86" width="84" height="58" rx="18" fill="#b3553f" stroke="#5a1c12" stroke-width="3.5"/>`+[78,98,118].map(x=>`<path d="M${x} 86 v20" stroke="#5a1c12" stroke-width="3"/>`).join('')+
  `<rect x="50" y="110" width="24" height="30" rx="10" fill="#b3553f" stroke="#5a1c12" stroke-width="3"/><path d="M68 96 h40" stroke="#e8907a" stroke-width="3" stroke-linecap="round" opacity=".7"/>`+
  `<path d="M118 6 L92 52 L112 54 L86 96 L132 44 L112 42 L132 6Z" fill="#ffd23f" stroke="#a87808" stroke-width="2.5" stroke-linejoin="round"/>`;
function pickSVG(it,suffix){
  if(it.anime) return `<svg viewBox="0 0 200 200" role="img" aria-label="${it.n}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="182" rx="52" ry="7" fill="#000" opacity=".28"/>${ANIME_ART[it.anime]('a'+it.i+(suffix||''))}</svg>`;
  const id='p'+it.i+suffix, R=rng(it.i*9973+7), x=it.x, alpha=x.alpha||1, F=formOf(it), L=pickLen(it), HS=headScale(it), SY=F?F.sy:1;
  const top=48-58*HS*SY, bot=50+L+18, cy=(top+bot)/2, SC=F?Math.min(1.4,230/(bot-top)):.7;
  const d=SHAPES[it.shape];
  let defs=`<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${it.h1}"/><stop offset="1" stop-color="${it.h2}"/></linearGradient><clipPath id="${id}c"><path d="${d}"/></clipPath><linearGradient id="${id}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  if(x.glow) defs+=`<filter id="${id}f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b"/><feFlood flood-color="${x.glow}" flood-opacity=".9"/><feComposite in2="b" operator="in" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  const pat=patternSVG(it,id,R);
  let drips='';
  if(x.drip){for(const [dx,len] of [[70,18],[84,30],[118,22],[134,12],[52,10]]){drips+=`<path d="M${dx-3} 48 L${dx-3} ${50+len} a3 3 0 0 0 6 0 L${dx+3} 48Z" fill="${x.drip}"/>`;}}
  const head=`<g${x.glow?` filter="url(#${id}f)"`:''}><g opacity="${alpha}"><path d="${d}" fill="url(#${id}h)"/><g clip-path="url(#${id}c)">${pat}<path d="${d}" fill="url(#${id}gl)"/></g></g><path d="${d}" fill="none" stroke="${it.edge}" stroke-width="${x.edge2?3.2:2.4}" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>${drips}</g>`;
  const collar=F&&F.guard?`<rect x="70" y="53" width="60" height="10" rx="4" fill="${it.edge}" stroke="rgba(0,0,0,.5)" stroke-width="1.5"/><rect x="72" y="55" width="56" height="2.5" rx="1" fill="#fff" opacity=".25"/>`+(x.gem?`<circle cx="100" cy="58" r="6" fill="${x.gem}" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>`:''):`<rect x="89" y="36" width="22" height="26" rx="5" fill="${it.edge}" stroke="rgba(0,0,0,.5)" stroke-width="1.5"/><rect x="91" y="38" width="5" height="22" rx="2" fill="#fff" opacity=".22"/>`+(x.gem?`<circle cx="100" cy="49" r="6" fill="${x.gem}" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/><circle cx="98" cy="47" r="2" fill="#fff" opacity=".8"/>`:'');
  let parts='';
  if(x.parts&&PART[x.parts]){for(let k=0;k<10;k++){const a=R()*Math.PI*2,r=(44+L*.12)+R()*28;const px=100+Math.cos(a)*r,py=96+Math.sin(a)*r*.9;parts+=`<g transform="translate(${px.toFixed(1)} ${py.toFixed(1)})">${PART[x.parts](R)}</g>`;}}
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${it.n} pickaxe" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs><ellipse cx="100" cy="182" rx="${30+L*.18}" ry="7" fill="#000" opacity=".28"/>${parts}<g class="swing">${(F&&F.dual?[[30,1],[-30,-1]]:[[36,1]]).map(([r,m])=>`<g transform="translate(100 100) rotate(${r}) scale(${(SC*m).toFixed(3)} ${SC.toFixed(3)}) translate(-100 ${(-cy).toFixed(1)})">${handleSVG(it,id,L)}<g transform="translate(0 ${L-130})">${pommelSVG(it)}</g><g transform="translate(100 48) scale(${HS} ${(HS*SY).toFixed(3)}) translate(-100 -48)">${head}</g><g transform="translate(100 48) scale(${HS}) translate(-100 -48)">${collar}</g></g>`).join('')}</g></svg>`;
}


// head only (no handle, collar or trail), drawn on a 200 x 110 board starting at y = -10, for 3D face textures
function headSVG(it){
  const id='h'+it.i, R=rng(it.i*9973+7), x=it.x, d=SHAPES[it.shape];
  let defs=`<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${it.h1}"/><stop offset="1" stop-color="${it.h2}"/></linearGradient><clipPath id="${id}c"><path d="${d}"/></clipPath><linearGradient id="${id}gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 200 110" width="512" height="282"><defs>${defs}</defs><rect x="0" y="-10" width="200" height="110" fill="${it.edge}"/><path d="${d}" fill="url(#${id}h)"/><g clip-path="url(#${id}c)">${patternSVG(it,id,R)}</g><path d="${d}" fill="none" stroke="${it.edge}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
}
// handle as a flat strip, for wrapping around a 3D cylinder
function handleStripSVG(it){
  const L=pickLen(it), id='g'+it.i;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="93 50 14 ${L}" width="64" height="${Math.round(L*4)}">${handleSVG(it,id,L)}</svg>`;
}
// how much a giant head is shrunk so wide shapes still fit (matches pickSVG)
function headScale(it){ const Z=SIZES[it.sz], WIDE={mallet:.8,double:.86,crescent:.9,wing:.9,bat:.9,scythe:.9,claw:.92,leaf:.92,bigaxe:.86,reaper:.9}; return Math.min(it.form&&it.form.sy>1?1.1:9,Z.hs*(Z.hs>1?(WIDE[it.shape]||1):1)); }
window.PICKAXES={headScale,FORMS,formOf,pickLen,SETS,ITEMS,SIZES,SHAPES,SHAPE_NAMES,HANDLE_NAMES,pickSVG,headSVG,handleStripSVG};
})();
