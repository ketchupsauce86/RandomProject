// ================= [v1.72] graphics: post-processing, quality levels and the C particle engine =================
// The scene is drawn into an HDR buffer, then: soft corner shading (SSAO, Ultra), glow around bright things (bloom),
// and one finishing pass (filmic highlights, colour grade, vignette, edge smoothing, a hit pulse, dither).
// Everything falls back to the plain renderer when a piece is missing (old GPU, the add-on scripts did not load).
// The particles (dust, pollen, fireflies, sparks, embers, chips) are moved by c/particles.c, compiled to WebAssembly.

export const GFX_LEVELS = ['Low', 'Medium', 'High', 'Ultra'];
// per level: pixel ratio cap, sun shadow map, multisampling, bloom, edge smoothing in the finishing pass, corner shading, particles
const LV = [
  { pr: 1, shadow: 1024, msaa: 0, bloom: false, fxaa: false, ao: false, post: false, parts: 0.3 },
  { pr: 1.25, shadow: 2048, msaa: 0, bloom: true, fxaa: true, ao: false, post: true, parts: 0.6 },
  { pr: 1.5, shadow: 2048, msaa: 4, bloom: true, fxaa: false, ao: false, post: true, parts: 1 },
  { pr: 2, shadow: 4096, msaa: 0, bloom: true, fxaa: true, ao: true, post: true, parts: 1 },
];

const QUAD_VS = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';

// corner shading from the depth buffer alone: normals from depth, 10 taps on a spiral turned per pixel
const AO_FS = `
uniform sampler2D tDepth; uniform vec2 px; uniform float near, far, tanH, aspect, radius, strength; varying vec2 vUv;
float lin(float d){ float z=d*2.0-1.0; return 2.0*near*far/(far+near-z*(far-near)); }
vec3 pos(vec2 uv){ float z=lin(texture2D(tDepth,uv).x); return vec3((uv*2.0-1.0)*vec2(aspect*tanH,tanH)*z,-z); }
void main(){
  float d=texture2D(tDepth,vUv).x; if(d>=0.9999){ gl_FragColor=vec4(1.0); return; }
  vec3 p=pos(vUv), px1=pos(vUv+vec2(px.x,0.0)), px0=pos(vUv-vec2(px.x,0.0)), py1=pos(vUv+vec2(0.0,px.y)), py0=pos(vUv-vec2(0.0,px.y));
  vec3 dx=abs(px1.z-p.z)<abs(p.z-px0.z)?px1-p:p-px0, dy=abs(py1.z-p.z)<abs(p.z-py0.z)?py1-p:p-py0;
  vec3 n=normalize(cross(dx,dy));
  float z=-p.z, rpx=radius/(z*tanH)*0.5, ang=6.2831853*fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715)))), occ=0.0;
  for(int i=0;i<10;i++){ float fi=(float(i)+0.5)/10.0, a=ang+fi*15.0; vec2 o=vec2(cos(a),sin(a))*rpx*sqrt(fi); o.x/=aspect;
    vec3 s=pos(vUv+o)-p; float l=length(s); occ+=max(0.0,dot(n,s)/(l+1e-4)-0.2-0.004*z)*smoothstep(radius*1.6,radius*0.4,l); }
  float ao=1.0-strength*occ/10.0*smoothstep(75.0,35.0,z);
  gl_FragColor=vec4(vec3(clamp(ao,0.0,1.0)),1.0);
}`;

// the finishing pass
const FINAL_FS = `
uniform sampler2D tScene, tAO; uniform vec2 px; uniform float dbg, useAO, useFXAA, vig, sat, con, pulse, time, grain, warm; uniform vec3 pulseCol;
varying vec2 vUv;
// highlights roll off softly instead of clipping to flat white; everything below about 0.9 is left as the artist made it
vec3 film(vec3 c){ vec3 k=max(c-0.88,0.0); return min(c,0.88)+k/(1.0+k*7.5); }
vec3 tap(vec2 uv){ return film(texture2D(tScene,uv).rgb); }
float luma(vec3 c){ return dot(c,vec3(0.299,0.587,0.114)); }
vec3 fxaa(vec2 uv){
  vec3 rgbM=tap(uv); float lM=luma(rgbM);
  float lNW=luma(tap(uv+vec2(-1.0,-1.0)*px)), lNE=luma(tap(uv+vec2(1.0,-1.0)*px)), lSW=luma(tap(uv+vec2(-1.0,1.0)*px)), lSE=luma(tap(uv+vec2(1.0,1.0)*px));
  float lMin=min(lM,min(min(lNW,lNE),min(lSW,lSE))), lMax=max(lM,max(max(lNW,lNE),max(lSW,lSE)));
  if(lMax-lMin<max(0.04,lMax*0.11)) return rgbM;
  vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));
  float red=max((lNW+lNE+lSW+lSE)*0.03125,0.0078125), rcp=1.0/(min(abs(dir.x),abs(dir.y))+red);
  dir=clamp(dir*rcp,-8.0,8.0)*px;
  vec3 a=0.5*(tap(uv+dir*(1.0/3.0-0.5))+tap(uv+dir*(2.0/3.0-0.5)));
  vec3 b=a*0.5+0.25*(tap(uv-dir*0.5)+tap(uv+dir*0.5)); float lB=luma(b);
  return (lB<lMin||lB>lMax)?a:b;
}
void main(){
  vec2 uv=vUv, c=uv-0.5; float r2=dot(c,c);
  vec3 col;
  if(pulse>0.001){ vec2 o=c*pulse*0.012; col=vec3(tap(uv+o).r,tap(uv).g,tap(uv-o).b); } // a hit splits the colours toward the edges for a moment
  else col=useFXAA>0.5?fxaa(uv):tap(uv);
  if(useAO>0.5){ float ao=(texture2D(tAO,uv).r*2.0+texture2D(tAO,uv+vec2(px.x,px.y)*1.5).r+texture2D(tAO,uv-vec2(px.x,px.y)*1.5).r+texture2D(tAO,uv+vec2(px.x,-px.y)*1.5).r+texture2D(tAO,uv+vec2(-px.x,px.y)*1.5).r)/6.0;
    col*=mix(vec3(0.42,0.36,0.52),vec3(1.0),ao); } // corners shade toward a cool violet, not grey
  if(dbg>0.5) col=vec3(texture2D(tAO,uv).r);
  float l=luma(col);
  col=mix(vec3(l),col,sat);                                   // richer colour
  col=(col-0.5)*con+0.5;                                      // a touch more contrast
  col+=warm*vec3(0.012,0.004,-0.014)*smoothstep(0.35,0.9,l);  // warm highlights
  col+=warm*vec3(-0.008,0.0,0.014)*(1.0-smoothstep(0.0,0.4,l)); // cool shadows
  col*=1.0-vig*smoothstep(0.12,0.62,r2);                      // darker corners draw the eye to the middle
  col=mix(col,pulseCol,pulse*0.12*smoothstep(0.05,0.5,r2));
  float n=fract(sin(dot(gl_FragCoord.xy+time*61.0,vec2(12.9898,78.233)))*43758.5453);
  col+=(n-0.5)*(grain+1.0/255.0);                             // dither: no banding in the sky
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}`;

// what glows: bright AND colourful things (pads, beams, sparks, neon) well before plain white walls in sunlight
const BRIGHT_FS = `
uniform sampler2D tDiffuse; uniform float luminosityThreshold, satK; varying vec2 vUv;
void main(){ vec3 c=texture2D(tDiffuse,vUv).rgb; float mx=max(c.r,max(c.g,c.b)), mn=min(c.r,min(c.g,c.b)), sat=mx>1e-3?(mx-mn)/mx:0.0;
  float t=mix(luminosityThreshold,luminosityThreshold*0.74,smoothstep(0.25,0.7,sat)), w=smoothstep(t,t+0.3,mx)*(1.0+satK*sat);
  gl_FragColor=vec4(min(c,vec3(3.0))*w,1.0); }`;

const PART_VS = `
attribute vec4 pcol; attribute float psize, pglow; uniform float scale; varying vec4 vC; varying float vG;
void main(){ vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv; gl_PointSize=clamp(psize*scale/max(0.1,-mv.z),1.0,64.0);
  vC=pcol; vG=pglow; float f=smoothstep(0.6,2.0,-mv.z); vC.a*=f; }`;
const PART_FS = `
varying vec4 vC; varying float vG;
void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d)*2.0; if(r>1.0) discard;
  float core=smoothstep(1.0,0.55,r), halo=pow(1.0-r,2.2);
  float a=mix(core,halo*1.3+core*0.5,vG);
  gl_FragColor=vec4(vC.rgb*(1.0+vG*1.6),vC.a*a); }`;

export function makeGfx(T: any, renderer: any, scene: any, camera: any, sun: any) {
  const E: any = T, gl = renderer.getContext(), gl2 = renderer.capabilities.isWebGL2;
  const canPost = !!(E.FullScreenQuad && gl2), canBloom = canPost && !!(E.UnrealBloomPass && E.CopyShader && E.LuminosityHighPassShader);
  const hdr = gl2 && !!renderer.extensions.get('EXT_color_buffer_float');
  let level = 2, L = LV[level], rt: any = null, aoRT: any = null, bloom: any = null, W = 1, H = 1, time = 0, failed = false;
  const G: any = { level, pulse: 0, pulseCol: new T.Color(0xff2a4a), bloomStrength: 0.42, bloomThreshold: 0.86, bloomRadius: 0.55, sat: 1.1, con: 1.05, vig: 0.26, warm: 1, ao: 1 };
  const size = new T.Vector2();
  const quad = canPost ? new E.FullScreenQuad(null) : null;
  const aoMat = new T.ShaderMaterial({ uniforms: { tDepth: { value: null }, px: { value: new T.Vector2() }, near: { value: 0.1 }, far: { value: 1000 }, tanH: { value: 1 }, aspect: { value: 1 }, radius: { value: 1.5 }, strength: { value: 1.5 } }, vertexShader: QUAD_VS, fragmentShader: AO_FS, depthTest: false, depthWrite: false });
  const finMat = new T.ShaderMaterial({ uniforms: { tScene: { value: null }, tAO: { value: null }, px: { value: new T.Vector2() }, useAO: { value: 0 }, dbg: { value: 0 }, useFXAA: { value: 0 }, vig: { value: 0.26 }, sat: { value: 1.1 }, con: { value: 1.05 }, pulse: { value: 0 }, time: { value: 0 }, grain: { value: 0.012 }, warm: { value: 1 }, pulseCol: { value: G.pulseCol } }, vertexShader: QUAD_VS, fragmentShader: FINAL_FS, depthTest: false, depthWrite: false });

  function dispose() { if (rt) { if (rt.depthTexture) rt.depthTexture.dispose(); rt.dispose(); rt = null; } if (aoRT) { aoRT.dispose(); aoRT = null; } if (bloom) { bloom.dispose && bloom.dispose(); bloom = null; } }
  function build() {
    dispose(); L = LV[level]; renderer.getDrawingBufferSize(size); W = Math.max(2, size.x); H = Math.max(2, size.y);
    if (!L.post || !canPost || failed) return;
    try {
      const opt: any = { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, type: hdr ? T.HalfFloatType : T.UnsignedByteType, depthBuffer: true, stencilBuffer: false };
      if (L.msaa && T.WebGLMultisampleRenderTarget) { rt = new T.WebGLMultisampleRenderTarget(W, H, opt); rt.samples = Math.min(L.msaa, renderer.capabilities.maxSamples || 4); }
      else { rt = new T.WebGLRenderTarget(W, H, opt); if (L.ao) { rt.depthTexture = new T.DepthTexture(W, H); rt.depthTexture.type = T.UnsignedIntType; } }
      if (L.ao) aoRT = new T.WebGLRenderTarget(W, H, { minFilter: T.LinearFilter, magFilter: T.LinearFilter, format: T.RGBAFormat, depthBuffer: false, stencilBuffer: false });
      if (L.bloom && canBloom && hdr) { bloom = new E.UnrealBloomPass(new T.Vector2(W >> 1, H >> 1), G.bloomStrength, G.bloomRadius, G.bloomThreshold);
        bloom.highPassUniforms = { tDiffuse: { value: null }, luminosityThreshold: { value: 1 }, satK: { value: 0.3 } };
        bloom.materialHighPassFilter = new T.ShaderMaterial({ uniforms: bloom.highPassUniforms, vertexShader: QUAD_VS, fragmentShader: BRIGHT_FS, depthTest: false, depthWrite: false }); }
    } catch (err) { failed = true; dispose(); }
  }
  // the sun's shadow map follows the level
  function shadows() { const s = LV[level].shadow; if (sun.shadow.mapSize.x !== s) { sun.shadow.mapSize.set(s, s); if (sun.shadow.map) { sun.shadow.map.dispose(); sun.shadow.map = null; } } sun.shadow.radius = level >= 2 ? 2.2 : 1.2; }
  G.setLevel = (n: number) => { level = G.level = Math.max(0, Math.min(3, n | 0)); L = LV[level]; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, L.pr)); shadows(); build(); if (G.onLevel) G.onLevel(level); };
  G.resize = () => build();
  G.pixelRatio = () => LV[level].pr;
  G.partScale = () => LV[level].parts;
  // draw the frame
  G.render = (dt: number) => {
    time += dt; G.pulse = Math.max(0, G.pulse - dt * 2.2);
    if (!rt) { renderer.setRenderTarget(null); renderer.render(scene, camera); return; }
    try {
      renderer.setRenderTarget(rt); renderer.render(scene, camera);
      const u = finMat.uniforms; u.useAO.value = 0;
      if (aoRT && rt.depthTexture && G.ao > 0) { const a = aoMat.uniforms; a.tDepth.value = rt.depthTexture; a.px.value.set(1 / W, 1 / H); a.near.value = camera.near; a.far.value = camera.far; a.tanH.value = Math.tan(camera.fov * Math.PI / 360); a.aspect.value = camera.aspect; a.strength.value = 3.4 * G.ao;
        quad.material = aoMat; renderer.setRenderTarget(aoRT); quad.render(renderer); u.useAO.value = 1; u.tAO.value = aoRT.texture; }
      if (bloom && G.bloomStrength > 0.01) { bloom.strength = G.bloomStrength; bloom.threshold = G.bloomThreshold; bloom.radius = G.bloomRadius; bloom.render(renderer, null, rt, dt, false); }
      u.tScene.value = rt.texture; u.px.value.set(1 / W, 1 / H); u.useFXAA.value = L.fxaa ? 1 : 0; u.vig.value = G.vig; u.sat.value = G.sat; u.con.value = G.con; u.warm.value = G.warm; u.pulse.value = Math.min(1.5, G.pulse); u.time.value = time % 100; u.dbg.value = G.debugAO ? 1 : 0;
      quad.material = finMat; renderer.setRenderTarget(null); quad.render(renderer);
    } catch (err) { failed = true; dispose(); renderer.setRenderTarget(null); renderer.render(scene, camera); }
  };

  // ---- particles, moved in C (c/particles.c -> particles.wasm.js)
  const P: any = { ok: false, n: 0 }; G.P = P;
  const b64 = (window as any).PARTICLES_WASM;
  if (b64 && typeof WebAssembly === 'object') {
    try {
      const bin = atob(b64), buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      const inst = new WebAssembly.Instance(new WebAssembly.Module(buf), {}), X: any = inst.exports, N = X.maxParticles(), mem = X.memory.buffer;
      const geo = new T.BufferGeometry();
      const aPos = new T.BufferAttribute(new Float32Array(mem, X.posPtr(), N * 3), 3), aCol = new T.BufferAttribute(new Float32Array(mem, X.colPtr(), N * 4), 4), aSize = new T.BufferAttribute(new Float32Array(mem, X.sizePtr(), N), 1), aGlow = new T.BufferAttribute(new Float32Array(mem, X.glowPtr(), N), 1);
      for (const a of [aPos, aCol, aSize, aGlow]) a.setUsage(T.DynamicDrawUsage);
      geo.setAttribute('position', aPos); geo.setAttribute('pcol', aCol); geo.setAttribute('psize', aSize); geo.setAttribute('pglow', aGlow); geo.setDrawRange(0, 0);
      const mat = new T.ShaderMaterial({ uniforms: { scale: { value: 600 } }, vertexShader: PART_VS, fragmentShader: PART_FS, transparent: true, depthWrite: false, fog: false });
      const pts = new T.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 5; pts.userData.keep = true;
      P.ok = true; P.X = X; P.points = pts; P.max = N;
      P.reset = () => { X.reset(); geo.setDrawRange(0, 0); };
      P.ambient = (kind: number, n: number, c: any, h: number, col: number) => { const k = new T.Color(col); X.ambient(kind, Math.round(n * LV[level].parts), c.x, c.y, c.z, h, k.r, k.g, k.b); };
      P.burst = (kind: number, n: number, at: any, speed: number, col: number, sz: number) => { const k = new T.Color(col); X.burst(kind, Math.max(1, Math.round(n * (0.4 + 0.6 * LV[level].parts))), at.x, at.y, at.z, speed, k.r, k.g, k.b, sz); };
      P.step = (dt: number, cam: any, h: number, up: any, wx: number, wz: number, floorY: number) => {
        P.n = X.step(dt, cam.x, cam.y, cam.z, h, up.x, up.y, up.z, wx, wz, floorY);
        geo.setDrawRange(0, P.n); aPos.needsUpdate = aCol.needsUpdate = aSize.needsUpdate = aGlow.needsUpdate = true;
        mat.uniforms.scale.value = renderer.getDrawingBufferSize(size).y / (2 * Math.tan(camera.fov * Math.PI / 360)); };
    } catch (err) { P.ok = false; }
  }
  return G;
}
