// Home screen polish: the version badge and the News panel (releases from version.js, announcements and chapters from news.js), a WebGL glitch-light
// layer drawn over the live box (raw GLSL, no three.js), and GSAP motion. Everything here is optional
// decoration: if GSAP or WebGL is missing the menu still works and simply sits still.
(()=>{
  const $=id=>document.getElementById(id), gs=window.gsap, V=window.GAME_VERSION||{version:'dev',date:'',build:'',notes:[]};
  const calm=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- version badge, pause line and What's new
  $('verNum').textContent=V.version;
  $('pauseVer').textContent=`Inverted v${V.version}`;
  $('wnMeta').textContent=`v${V.version} · build ${V.build} · ${V.date}`;
  const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  // News: announcements (news.js), the newest release, then every release grouped into chapters with a few fun tags
  const N=window.GAME_NEWS||{announcements:[],chapters:[]}, notes=(V.notes||[]).map(n=>({...n,title:String(n.title).replace(/\s*\(v[\d.]+\)$/,''),m:+String(n.v).split('.')[1]||0}));
  const TAGS=[['🔫','Weapons',/gun|rpg|grenade|ray|taser|flame|drone|paintball|\bmf\b|sniper|weapon|ammo|blade|sword/i],['⛏️','Pickaxes',/pickaxe|\bpicks?\b|power-up/i],
    ['🎨','Style',/skin|locker|loadout|look|outfit|glow|font|homepage|ui\b|news/i],['🔊','Sound',/sound|audio|heartbeat/i],['🌍','World',/island|box|block|gravity|zero-g|booster|jet|vending|season|bus/i],
    ['🏃','Moves',/swim|jump|animation|somersault|arms|glider|drop|swing|shoulder|death/i],['⚡','Speed',/lag|smoother|faster/i],['🤖','Bots',/bots?\b|100 players/i]];
  const tagsOf=t=>TAGS.filter(x=>x[2].test(t)).slice(0,2).map(x=>`<span class="tg">${x[0]} ${x[1]}</span>`).join('');
  const fmt=d=>{ const x=new Date(d+'T12:00:00'); return isNaN(x)?d:x.toLocaleDateString(undefined,{month:'short',day:'numeric'}); };
  $('wnAnnc').innerHTML=(N.announcements||[]).map(a=>`<article class="an${a.soon?' soon':''}" style="--c1:${esc(a.c1)};--c2:${esc(a.c2)}"><span class="em" aria-hidden="true">${esc(a.emoji)}</span><span class="tag">${esc(a.tag)}</span><h3>${esc(a.title)}</h3><p>${esc(a.body)}</p></article>`).join('');
  const top=notes[0];
  $('wnLatest').innerHTML=top?`<div class="latest"><span class="big">v${esc(top.v)}</span><span class="lbl"><b>New</b>Latest update · ${esc(fmt(top.date))}</span><span class="t">${esc(top.title)}</span><span class="tags">${tagsOf(top.title)}</span></div>`:'';
  const chaps=(N.chapters||[]).slice().sort((a,b)=>b.from-a.from);
  $('wnList').innerHTML=chaps.map((c,i)=>{ const hi=i?chaps[i-1].from:Infinity, rows=notes.filter(n=>n.m>=c.from&&n.m<hi); if(!rows.length) return '';
    return `<details class="chap"${i===0?' open':''}><summary><span class="ce" aria-hidden="true">${esc(c.emoji)}</span><span class="cn">${esc(c.n)}</span><span class="cd">${esc(c.d)}</span><span class="cc">${rows.length} update${rows.length>1?'s':''}</span></summary><ol>`+
      rows.map(n=>`<li><span class="v">v${esc(n.v)}</span><span class="t">${esc(n.title)}</span><span class="d">${esc(fmt(n.date))}</span><span class="tags">${tagsOf(n.title)}</span></li>`).join('')+`</ol></details>`; }).join('');
  const first=notes[notes.length-1];
  $('wnFoot').textContent=first?`${notes.length} updates since ${fmt(first.date)} · thanks for playing ✨`:'';
  // the newest announcement also sits under the logo; the badge shows a dot until this version's news has been opened
  const an=(N.announcements||[])[0];
  if(an){ const b=$('anncBtn'); b.hidden=false; b.querySelector('.annc-tag').textContent=`${an.emoji} ${an.tag}`; b.querySelector('.annc-txt').textContent=an.title; b.setAttribute('aria-label',`${an.tag}: ${an.title}. Open the news`); }
  let seen=''; try{ seen=localStorage.getItem('invertedNewsSeen')||''; }catch(e){}
  if(seen!==V.version) $('verBtn').classList.add('has-new');
  console.info(`%c Inverted v${V.version} `,'background:#5cf0ff;color:#1a0b45;font-weight:700;border-radius:3px');

  // ---- drawer and modal, animated in and out
  const show=(el,from)=>{ el.hidden=false; if(gs&&!calm) gs.fromTo(el,from,{x:0,y:0,opacity:1,duration:0.35,ease:'power3.out'}); };
  const hide=(el,to)=>{ if(el.hidden) return; if(gs&&!calm) gs.to(el,{...to,opacity:0,duration:0.22,ease:'power2.in',onComplete:()=>{ el.hidden=true; gs.set(el,{clearProps:'all'}); }}); else el.hidden=true; };
  const drawer=$('controlsDrawer'), wn=$('whatsNew'), cBtn=$('controlsBtn');
  const openDrawer=()=>{ show(drawer,{x:60,opacity:0}); cBtn.setAttribute('aria-expanded','true'); $('controlsClose').focus(); };
  const closeDrawer=()=>{ hide(drawer,{x:60}); cBtn.setAttribute('aria-expanded','false'); };
  cBtn.addEventListener('click',()=>drawer.hidden?openDrawer():closeDrawer());
  $('controlsClose').addEventListener('click',()=>{ closeDrawer(); cBtn.focus(); });
  const openNews=()=>{ show(wn,{y:24,opacity:0}); if(gs&&!calm) gs.from('#whatsNew .an, #whatsNew .latest, #whatsNew .chap',{y:14,opacity:0,stagger:0.05,duration:0.3,delay:0.1,ease:'power2.out'}); $('wnClose').focus();
    $('verBtn').classList.remove('has-new'); try{ localStorage.setItem('invertedNewsSeen',V.version); }catch(e){} };
  $('verBtn').addEventListener('click',openNews); $('anncBtn').addEventListener('click',openNews);
  const closeWn=()=>{ hide(wn,{y:16}); $('verBtn').focus(); };
  $('wnClose').addEventListener('click',closeWn);
  wn.addEventListener('click',e=>{ if(e.target===wn) closeWn(); });
  addEventListener('keydown',e=>{ if(e.key!=='Escape'||$('menu').hidden) return; if(!wn.hidden) closeWn(); else if(!drawer.hidden){ closeDrawer(); cBtn.focus(); } });

  // GSAP normally slows its clock after a long frame; the game's loading frames are long, so that froze the intro half way
  if(gs) gs.ticker.lagSmoothing(0);

  // ---- pause and match-end cards pop in; the end-of-match numbers count up
  const watch=(el,fn)=>new MutationObserver(()=>{ if(!el.hidden) fn(); }).observe(el,{attributes:true,attributeFilter:['hidden']});
  if(gs&&!calm){
    watch($('pause'),()=>gs.fromTo('#pause .card',{y:30,scale:0.94,opacity:0},{y:0,scale:1,opacity:1,duration:0.35,ease:'back.out(1.7)'}));
    watch($('over'),()=>{ gs.fromTo('#over .card',{y:50,opacity:0},{y:0,opacity:1,duration:0.5,ease:'power3.out'});
      gs.fromTo('#overPlace',{scale:0.4,opacity:0},{scale:1,opacity:1,duration:0.7,ease:'elastic.out(1,0.55)',delay:0.15});
      gs.from('#over .statrow div',{y:20,opacity:0,stagger:0.08,duration:0.4,delay:0.35,ease:'power2.out'});
      gs.from('#over .btnrow > *',{y:16,opacity:0,stagger:0.08,duration:0.35,delay:0.6,ease:'power2.out'});
      for(const id of ['stElims','stDmg']){ const el=$(id), end=parseInt(el.textContent,10)||0, o={v:0}; gs.to(o,{v:end,duration:1,delay:0.4,ease:'power2.out',onUpdate:()=>{ el.textContent=Math.round(o.v); }}); } });
  }

  // ---- GSAP: the lobby slides in, the logo glitches now and then, the play button breathes
  if(gs&&!calm){
    const tl=gs.timeline({defaults:{ease:'power3.out'}});
    tl.from('.topbar',{y:-30,opacity:0,duration:0.6})
      .from('.logo .l1',{x:-120,skewX:-18,opacity:0,duration:0.7},'-=0.3')
      .from('.logo .l2',{x:-120,skewX:-18,opacity:0,duration:0.7},'-=0.55')
      .from('.annc',{x:-40,opacity:0,duration:0.5},'-=0.35')
      .from('.loadout > *',{y:24,opacity:0,stagger:0.08,duration:0.45},'-=0.3')
      .from('.playcard',{x:60,opacity:0,duration:0.55},'-=0.5');
    // a short burst of jitter on the logo, like a bad signal
    const glitch=()=>{ if(!$('menu').hidden){ const g=gs.timeline();
        for(let i=0;i<5;i++) g.to('.logo span',{x:()=>gs.utils.random(-10,10),skewX:()=>gs.utils.random(-12,12),duration:0.05,ease:'none'});
        g.to('.logo span',{x:0,skewX:0,duration:0.08}); }
      gs.delayedCall(gs.utils.random(2.5,5.5),glitch); };
    gs.delayedCall(2.4,glitch);
    // the play button breathes once it has slid in (starting earlier fought the slide and left it stuck off to the side)
    tl.call(()=>gs.to('#playBtn',{scale:1.025,duration:1.1,repeat:-1,yoyo:true,ease:'sine.inOut'}));
    // every menu button gets a little lift on hover
    document.querySelectorAll('#menu .btn2, #menu .chip').forEach(b=>{
      b.addEventListener('pointerenter',()=>gs.to(b,{y:-3,duration:0.2,ease:'power2.out'}));
      b.addEventListener('pointerleave',()=>gs.to(b,{y:0,duration:0.25,ease:'power2.out'})); });
  }

  // ---- WebGL glitch light over the box: aurora ribbons, scanlines, a sweeping signal tear and drifting
  // pixels. Blended with "screen" so it only ever adds light. Drawn at half resolution, menu only.
  const cv=$('fx'), gl=cv.getContext('webgl',{premultipliedAlpha:false,antialias:false});
  if(!gl){ cv.remove(); return; }
  const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.0,1.0);}';
  const FS=`precision mediump float;uniform vec2 r;uniform float t;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*n(p);p*=2.03;a*=0.5;}return v;}
    void main(){vec2 uv=gl_FragCoord.xy/r;float asp=r.x/r.y;vec2 q=vec2(uv.x*asp,uv.y);
      vec3 c=vec3(0.0);
      // aurora ribbons along the top
      for(int i=0;i<3;i++){float fi=float(i);float y=0.78+0.07*fi+0.05*sin(q.x*1.7+t*0.25+fi*2.1)+0.04*fbm(vec2(q.x*2.0+t*0.1,fi));
        float b=exp(-pow((uv.y-y)*(22.0-fi*4.0),2.0))*(0.55+0.45*fbm(vec2(q.x*6.0-t*0.4,fi*3.0)));
        c+=b*mix(vec3(0.15,1.0,0.85),vec3(1.0,0.25,0.85),0.5+0.5*sin(fi*1.9+q.x*0.8+t*0.15))*0.45;}
      // the signal tear: a band that sweeps down the screen, shifting color channels
      float sy=fract(t*0.07);float band=smoothstep(0.03,0.0,abs(uv.y-1.0+sy))*step(0.4,h(vec2(floor(uv.y*90.0),floor(t*12.0))));
      c+=band*vec3(0.25,0.9,1.0)*0.35+band*vec3(1.0,0.2,0.8)*0.2*step(0.5,h(vec2(floor(uv.x*30.0),floor(t*20.0))));
      // drifting pixel motes
      vec2 g=floor(vec2(q.x*70.0,uv.y*70.0+t*1.5));float m=step(0.996,h(g))*(0.5+0.5*sin(t*4.0+h(g+3.0)*30.0));
      c+=m*mix(vec3(0.4,1.0,1.0),vec3(1.0,0.5,0.95),h(g+7.0))*0.8;
      // scanlines and a violet edge glow
      c+=vec3(0.06,0.03,0.12)*(0.5+0.5*sin(gl_FragCoord.y*1.6));
      float v=length((uv-0.5)*vec2(1.0,0.8));c+=vec3(0.35,0.12,0.6)*smoothstep(0.45,0.95,v)*0.35;
      gl_FragColor=vec4(c,1.0);}`;
  const sh=(type,src)=>{ const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try{ prog=gl.createProgram(); gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS)); gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS)); gl.linkProgram(prog); if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog)); }
  catch(e){ console.warn('Menu effect unavailable:',e.message); cv.remove(); return; }
  gl.useProgram(prog);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(prog,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  const uR=gl.getUniformLocation(prog,'r'), uT=gl.getUniformLocation(prog,'t');
  const fit=()=>{ const s=0.5; cv.width=Math.max(1,Math.round(innerWidth*s)); cv.height=Math.max(1,Math.round(innerHeight*s)); gl.viewport(0,0,cv.width,cv.height); };
  addEventListener('resize',fit); fit();
  const t0=performance.now();
  const frame=now=>{ requestAnimationFrame(frame); const on=!$('menu').hidden; cv.style.display=on?'':'none'; if(!on) return;
    gl.uniform2f(uR,cv.width,cv.height); gl.uniform1f(uT,calm?12:(now-t0)/1000); gl.drawArrays(gl.TRIANGLES,0,3); };
  requestAnimationFrame(frame);
})();
