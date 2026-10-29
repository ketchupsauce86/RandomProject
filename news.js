// The News panel on the home screen (ui.js draws it). The releases themselves come from version.js;
// this file adds the hand-written parts: announcements at the top, and the chapters the releases are grouped into.
window.GAME_NEWS={
 // newest first; soon marks something that hasn't shipped yet
 announcements:[
  {tag:'Out now',emoji:'💥',title:'Power-ups, remastered',body:'Every pickaxe power got a visual overhaul: light-ribbon trails, glowing energy orbs, spinning sawblades, carved pumpkins, layered explosions with smoke and debris, rune circles, light pillars, slash waves, laser beams and a charge-up orb in your hand.',c1:'#ff3fa4',c2:'#ffb02a'},
  {tag:'Out now',emoji:'✨',title:'Smoother moves, flashier powers',body:'Weapons are held in a natural ready stance (two-handers with both hands), emotes no longer bend wrists the wrong way, and every pickaxe power got glowing trails, force fields, energy walls and bigger blasts.',c1:'#19e3ff',c2:'#9b5cff'},
  {tag:'Out now',emoji:'🎅',title:'Ten Christmas skins',body:'A whole new Christmas theme in the Locker: Santa Claus, Mrs. Claus, an Elf, Rudolph, Frosty, a Gingerbread Man, a golden Nutcracker, Jack Frost, Krampus and a glowing Christmas Tree.',c1:'#c8161f',c2:'#1f9a46'},
  {tag:'Out now',emoji:'🎄',title:'Christmas pickaxes reforged',body:'All 10 Christmas pickaxes are now festive weapons: crossed Candy Canes, a Nutcracker spear, an ice-blue Frostbite greatsword, an Ornament Breaker pair, and Krampus\'s claw scythe.',c1:'#ff4d5e',c2:'#2fd67a'},
  {tag:'Out now',emoji:'🏝️',title:'Storm Island is back',body:'The battle royale returns as a second mode: jump out of the jet, skydive, glide down, loot chests and outrun the storm. Plus smoother movement, a swing for every weapon, and dancing on the move.',c1:'#7a4cff',c2:'#ff3fd4'},
  {tag:'Out now',emoji:'💃',title:'Emotes and a real gravity flip',body:'Press B to dance (hold B for the emote wheel): Floss, Wave, Robot, Dab and more. The gravity flip is now a real sequence: brace, tumble, and a superhero landing on the ceiling.',c1:'#ff3fa4',c2:'#5cf0ff'},
  {tag:'Out now',emoji:'⚔️',title:'Pickaxes reforged',body:'71 pickaxes are now dual blades, greatswords, reaper scythes, spears, battle axes and twin daggers. Same moves, way more style.',c1:'#ff8a1f',c2:'#b866f5'},
  {tag:'Halloween',emoji:'🎃',title:'The Halloween crew has new names',body:'Say hi to the Jack-o-Lantern, Spooky Shadow, Grim Reaper, Candy Corn, Witch\'s Wart, Glossy Ghost and the Pumpkin King.',c1:'#ff8a1f',c2:'#6a2a9a'},
 ],
 // each chapter starts at a release (the middle number of the version) and runs until the next one
 chapters:[
  {from:40,emoji:'⚔️',n:'Reforged',d:'Real sounds, new weapons, emotes and Storm Island'},
  {from:30,emoji:'🍥',n:'Anime Arc',d:'Heroes, their skins and their signature moves'},
  {from:24,emoji:'🤖',n:'The Hundred',d:'100 bots and a lot of light'},
  {from:14,emoji:'🌌',n:'Zero-G Box',d:'Gravity became optional'},
  {from:1,emoji:'🏝️',n:'Storm Island',d:'Where it all began'},
 ],
};
