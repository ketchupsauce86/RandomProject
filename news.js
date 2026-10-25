// The News panel on the home screen (ui.js draws it). The releases themselves come from version.js;
// this file adds the hand-written parts: announcements at the top, and the chapters the releases are grouped into.
window.GAME_NEWS={
 // newest first; soon marks something that hasn't shipped yet
 announcements:[
  {tag:'Coming next',emoji:'🎄',title:'Christmas pickaxe rework',body:'The Christmas set is next to be reforged into brand new weapons. Candy cane blades, frosted swords and a sleigh-load of surprises are on the way.',c1:'#ff4d5e',c2:'#2fd67a',soon:true},
  {tag:'Out now',emoji:'💃',title:'Emotes and a real gravity flip',body:'Press B to dance (hold B for the emote wheel): Floss, Wave, Robot, Dab and more. The gravity flip is now a real sequence: brace, tumble, and a superhero landing on the ceiling.',c1:'#ff3fa4',c2:'#5cf0ff'},
  {tag:'Out now',emoji:'⚔️',title:'Pickaxes reforged',body:'71 pickaxes are now dual blades, greatswords, reaper scythes, spears, battle axes and twin daggers. Same moves, way more style.',c1:'#ff8a1f',c2:'#b866f5'},
  {tag:'Halloween',emoji:'🎃',title:'The Halloween crew has new names',body:'Say hi to the Jack-o-Lantern, Spooky Shadow, Grim Reaper, Candy Corn, Witch\'s Wart, Glossy Ghost and the Pumpkin King.',c1:'#ff8a1f',c2:'#6a2a9a'},
 ],
 // each chapter starts at a release (the middle number of the version) and runs until the next one
 chapters:[
  {from:40,emoji:'⚔️',n:'Reforged',d:'Real sounds, paint and brand new weapons'},
  {from:30,emoji:'🍥',n:'Anime Arc',d:'Heroes, their skins and their signature moves'},
  {from:24,emoji:'🤖',n:'The Hundred',d:'100 bots and a lot of light'},
  {from:14,emoji:'🌌',n:'Zero-G Box',d:'Gravity became optional'},
  {from:1,emoji:'🏝️',n:'Storm Island',d:'Where it all began'},
 ],
};
