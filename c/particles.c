// Inverted particle engine, written in C and compiled to WebAssembly.
// It moves thousands of tiny particles every frame (dust, pollen, fireflies, sparks, debris)
// and writes their positions, colours and sizes straight into arrays that three.js draws.
// No C library is used, so it builds with plain clang:  see tools/build_wasm.sh
#define MAXP 12000
#define EXPORT __attribute__((visibility("default"),used))

typedef struct { float x,y,z, vx,vy,vz, r,g,b, life,age, size, grav, drag, glow, seed; int kind; } P;
enum { DEAD=0, MOTE=1, POLLEN=2, FIREFLY=3, SPARK=4, DEBRIS=5, EMBER=6 };

static P ps[MAXP];
// what three.js reads (one entry per particle)
float outPos[MAXP*3];
float outCol[MAXP*4];   // r, g, b, alpha
float outSize[MAXP];
float outGlow[MAXP];
static int count=0;     // particles drawn this frame
static unsigned rngS=2463534242u;
static float T=0;

static float rnd(void){ rngS^=rngS<<13; rngS^=rngS>>17; rngS^=rngS<<5; return (rngS&0xffffff)/16777216.0f; }
static float rr(float a,float b){ return a+(b-a)*rnd(); }
static float fabsf_(float v){ return v<0?-v:v; }
// a fast sine good to about 0.001, enough for wobble and flicker
static float sn(float x){ const float TP=6.2831853f; x=x*(1.0f/TP); x=x-(float)(int)x; if(x<0) x+=1; x=x*TP-3.14159265f;
  float y=1.27323954f*x-0.405284735f*x*fabsf_(x); return -(0.225f*(y*fabsf_(y)-y)+y); }
static float wrap(float v,float c,float h){ float d=v-c; float w=2*h; while(d>h) d-=w; while(d<-h) d+=w; return c+d; }

EXPORT float* posPtr(void){ return outPos; } EXPORT float* colPtr(void){ return outCol; } EXPORT float* sizePtr(void){ return outSize; } EXPORT float* glowPtr(void){ return outGlow; }
EXPORT int maxParticles(void){ return MAXP; }

static P* grab(void){ for(int k=0;k<64;k++){ int i=(int)(rnd()*MAXP); if(ps[i].kind==DEAD||(ps[i].kind>=SPARK&&ps[i].age>ps[i].life*0.6f)) return &ps[i]; }
  for(int i=0;i<MAXP;i++) if(ps[i].kind==DEAD) return &ps[i]; return &ps[(int)(rnd()*MAXP)]; }

// clear everything (a new match or a mode change)
EXPORT void reset(void){ for(int i=0;i<MAXP;i++) ps[i].kind=DEAD; }

// fill a box of half-size h around (cx,cy,cz) with n floating particles of one kind
// kind: 1 dust motes, 2 pollen and seeds, 3 fireflies
EXPORT void ambient(int kind,int n,float cx,float cy,float cz,float h,float r,float g,float b){
  for(int k=0;k<n;k++){ P*p=grab(); p->kind=kind; p->x=cx+rr(-h,h); p->y=cy+rr(-h,h); p->z=cz+rr(-h,h);
    p->vx=rr(-.15f,.15f); p->vy=rr(-.1f,.1f); p->vz=rr(-.15f,.15f); p->r=r; p->g=g; p->b=b; p->age=0; p->life=1e9f; p->seed=rr(0,100);
    p->grav=0; p->drag=0; p->glow=kind==FIREFLY?1.f:kind==MOTE?.35f:0.f; p->size=kind==MOTE?rr(.025f,.06f):kind==POLLEN?rr(.05f,.11f):rr(.08f,.14f); } }

// a burst at a point: kind 4 sparks (glowing, fall, fade), 5 debris chips (fall and bounce), 6 embers (rise)
EXPORT void burst(int kind,int n,float x,float y,float z,float speed,float r,float g,float b,float size){
  for(int k=0;k<n;k++){ P*p=grab(); p->kind=kind; p->x=x; p->y=y; p->z=z;
    float dx=rr(-1,1),dy=rr(-1,1),dz=rr(-1,1); float l=dx*dx+dy*dy+dz*dz+1e-4f; float s=speed*rr(.35f,1.f);
    // a quick inverse square root
    float inv; { float hx=.5f*l; int i=*(int*)&l; i=0x5f3759df-(i>>1); inv=*(float*)&i; inv=inv*(1.5f-hx*inv*inv); }
    p->vx=dx*inv*s; p->vy=dy*inv*s+(kind==EMBER?speed*.4f:speed*.25f); p->vz=dz*inv*s;
    float tint=rr(.85f,1.15f); p->r=r*tint; p->g=g*tint; p->b=b*tint; p->age=0; p->seed=rr(0,100);
    p->life=kind==SPARK?rr(.25f,.7f):kind==DEBRIS?rr(.7f,1.4f):rr(.8f,1.8f);
    p->grav=kind==SPARK?-14.f:kind==DEBRIS?-18.f:2.5f; p->drag=kind==SPARK?2.2f:kind==DEBRIS?.6f:1.6f;
    p->glow=kind==DEBRIS?0.f:1.f; p->size=size*(kind==DEBRIS?rr(.7f,1.3f):rr(.6f,1.2f)); } }

// move everything; (cx,cy,cz) is the camera, h the half-size of the box ambient particles wrap inside,
// (ux,uy,uz) which way is up right now (gravity flips in Zero-G), (wx,wz) the wind, floor the height debris bounces on
EXPORT int step(float dt,float cx,float cy,float cz,float h,float ux,float uy,float uz,float wx,float wz,float floorY){
  T+=dt; int n=0;
  for(int i=0;i<MAXP;i++){ P*p=&ps[i]; if(p->kind==DEAD) continue; p->age+=dt;
    if(p->age>p->life){ p->kind=DEAD; continue; }
    float a=1;
    if(p->kind<=FIREFLY){
      float s=p->seed, t=T;
      if(p->kind==MOTE){ p->vx+=sn(t*.31f+s)*.02f*dt; p->vy+=sn(t*.23f+s*1.7f)*.02f*dt; p->vz+=sn(t*.27f+s*2.3f)*.02f*dt; a=.55f+.45f*sn(t*.9f+s); }
      else if(p->kind==POLLEN){ p->vx+=(wx-p->vx)*.4f*dt+sn(t*.7f+s)*.25f*dt; p->vz+=(wz-p->vz)*.4f*dt+sn(t*.6f+s*1.3f)*.25f*dt; p->vy+=(sn(t*.5f+s*.7f)*.12f-p->vy)*.5f*dt; a=.8f; }
      else { p->vx+=sn(t*1.3f+s)*.6f*dt; p->vy+=sn(t*1.1f+s*1.9f)*.5f*dt; p->vz+=sn(t*1.2f+s*2.7f)*.6f*dt; p->vx*=1-.8f*dt; p->vy*=1-.8f*dt; p->vz*=1-.8f*dt;
        float f=sn(t*2.2f+s*3.1f); a=f>0?f*f:0; }
      p->x+=p->vx*dt; p->y+=p->vy*dt; p->z+=p->vz*dt;
      p->x=wrap(p->x,cx,h); p->y=wrap(p->y,cy,h); p->z=wrap(p->z,cz,h);
      // fade near the edge of the box so nothing pops in
      float ex=fabsf_(p->x-cx)/h, ey=fabsf_(p->y-cy)/h, ez=fabsf_(p->z-cz)/h; float e=ex>ey?ex:ey; e=e>ez?e:ez; if(e>.75f) a*=(1-e)*4;
    } else {
      float k=p->age/p->life;
      p->vx+=ux*p->grav*dt; p->vy+=uy*p->grav*dt; p->vz+=uz*p->grav*dt;
      float d=1-p->drag*dt; if(d<0) d=0; p->vx*=d; p->vy*=d; p->vz*=d;
      if(p->kind==EMBER){ p->vx+=sn(T*3+p->seed)*1.5f*dt; p->vz+=sn(T*2.6f+p->seed*1.4f)*1.5f*dt; }
      p->x+=p->vx*dt; p->y+=p->vy*dt; p->z+=p->vz*dt;
      if(p->kind==DEBRIS&&uy>.5f&&p->y<floorY&&p->vy<0){ p->y=floorY; p->vy*=-.35f; p->vx*=.6f; p->vz*=.6f; }
      a=p->kind==SPARK?1-k*k:p->kind==DEBRIS?(k<.7f?1:(1-k)/.3f):(k<.2f?k*5:1-(k-.2f)/.8f);
    }
    if(a<=.003f) continue;
    float sz=p->size; if(p->kind==SPARK) sz*=1-.6f*(p->age/p->life);
    outPos[n*3]=p->x; outPos[n*3+1]=p->y; outPos[n*3+2]=p->z;
    outCol[n*4]=p->r; outCol[n*4+1]=p->g; outCol[n*4+2]=p->b; outCol[n*4+3]=a;
    outSize[n]=sz; outGlow[n]=p->glow; n++; }
  count=n; return n; }
