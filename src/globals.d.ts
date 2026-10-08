// Globals loaded by <script> tags in index.html before game.js runs.
import type * as ThreeNS from 'three';

declare global {
  // three.js r128 from the CDN, plus the two example add-ons that attach themselves to it
  const THREE: typeof ThreeNS & { GLTFLoader: any; SkeletonUtils: any };
  interface Window {
    THREE: typeof THREE;
    gsap: any;
    SOLDIER_GLB: string;
    SKINS: any;
    PICKAXES: any;
    GAME_VERSION: any;
    webkitAudioContext: typeof AudioContext;
    __game: any;
  }
}
export {};
