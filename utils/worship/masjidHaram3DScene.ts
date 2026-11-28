import * as THREE from 'three';
import {
  HARAM_DIMENSIONS,
  HARAM_GATES,
  HaramGateInfo,
  RitualOverlayMode,
} from '../../data/worshipAndHistory/masjidHaram3DData';
import {
  createCalligraphyPlaqueTexture,
  createClockCrestTexture,
  createClockFaceTexture,
  createClockMashrabiyaTexture,
  createFacadeStoneTexture,
  createGatePlaqueTexture,
  createGraniteRockTexture,
  createKaabaRoofTexture,
  createKiswahTexture,
  createMasaFloorTexture,
  createMashrabiyaTexture,
  createMatafMarbleTexture,
  createPlazaMarbleTexture,
  createPrayerCarpetTexture,
  createTowerFacadeTexture,
  createZamzamSignTexture,
} from './masjidHaram3DTextures';

export type LightingPreset = 'day' | 'sunset' | 'night';

export interface TourHeroState {
  visible: boolean;
  x: number;
  y: number;
  z: number;
  yaw: number;
  walking: boolean;
  praying?: boolean;
  raisingHands?: boolean;
  pointingRightHand?: boolean;
  harwalah?: boolean;
  idtiba?: boolean;
  hairShort?: boolean;
}

export interface HaramSceneHandles {
  root: THREE.Group;
  roofMeshes: THREE.Mesh[];
  roofMaterials: THREE.MeshStandardMaterial[];
  gateHitboxes: THREE.Mesh[];
  gateHighlightRing: THREE.Mesh;
  pathGroup: THREE.Group;
  sunLight: THREE.DirectionalLight;
  fillLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  nightGlowLights: THREE.PointLight[];
  emissiveGoldMat: THREE.MeshStandardMaterial;
  greenMasaMat: THREE.MeshStandardMaterial;
  applyLighting: (preset: LightingPreset, scene: THREE.Scene) => void;
  setRoofCutaway: (cutaway: boolean) => void;
  showPathForGate: (gate: HaramGateInfo | null) => void;
  setRitualOverlay: (mode: RitualOverlayMode, activeTawafLap?: number, activeSaiLap?: number) => void;
  setZamzamToSafaPath: (visible: boolean) => void;
  setLandmarkToGatePath: (
    waypoints: Array<[number, number, number]> | null,
    destinationGate?: HaramGateInfo | null
  ) => void;
  sampleLandmarkToGatePoint: (t: number, out: THREE.Vector3) => boolean;
  getLandmarkToGateLength: () => number;
  setTourHeroState: (state: TourHeroState) => void;
  isWorldPointVisible: (
    cameraPos: THREE.Vector3,
    targetPoint: THREE.Vector3,
    clearanceMargin?: number
  ) => boolean;
  update: (
    elapsed: number,
    tourPlaying?: boolean,
    tourSpeed?: number,
    ritualMode?: string,
    lapTimeFrac?: number,
    isOverheadView?: boolean
  ) => void;
  dispose: () => void;
}

export function sampleTawafPoint(
  lapIndex0to6: number,
  t0to1: number,
  out = new THREE.Vector3()
): THREE.Vector3 {
  const theta = Math.PI / 4 - t0to1 * Math.PI * 2;
  const rBase = 13.6 + lapIndex0to6 * 1.45;
  const hijrClearance = Math.max(0, -Math.sin(theta)) * 2.1;
  const r = rBase + hijrClearance;
  return out.set(Math.cos(theta) * r, 0.2, Math.sin(theta) * r);
}

export function sampleSaiPoint(
  lapIndex0to6: number,
  t0to1: number,
  out = new THREE.Vector3()
): THREE.Vector3 {
  const isGoingNorth = lapIndex0to6 % 2 === 0; // Laps 1,3,5,7 Safa -> Marwah
  const laneRank = Math.floor(lapIndex0to6 / 2);
  const laneX = isGoingNorth ? 69.8 + laneRank * 1.35 : 65.4 - laneRank * 1.35;
  const z = isGoingNorth ? 62.5 - t0to1 * 125.0 : -62.5 + t0to1 * 125.0;
  // Gentle curve inward toward center axis (x=68) at Safa and Marwah viewing ends
  const endBlend = Math.max(0, 1 - Math.min(t0to1, 1 - t0to1) / 0.12);
  const smoothBlend = endBlend * endBlend * (3 - 2 * endBlend);
  const x = THREE.MathUtils.lerp(laneX, 68, smoothBlend * 0.72);
  return out.set(x, 0.24, z);
}

const _dummy = new THREE.Object3D();
const _curvePoints: THREE.Vector3[] = [];

export function buildMasjidHaramScene(
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean
): HaramSceneHandles {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const root = new THREE.Group();
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  // --- Procedural Textures ---
  const kiswahPlainTex = track(createKiswahTexture(false, maxAniso));
  const kiswahSitaraTex = track(createKiswahTexture(true, maxAniso));
  const kaabaRoofTex = track(createKaabaRoofTexture(maxAniso));
  const matafTex = track(createMatafMarbleTexture(maxAniso));
  const plazaTex = track(createPlazaMarbleTexture(maxAniso));
  const carpetTex = track(createPrayerCarpetTexture(maxAniso));
  const stoneTex = track(createFacadeStoneTexture(maxAniso));
  const mashrabiyaTex = track(createMashrabiyaTexture(maxAniso));
  const masaFloorTex = track(createMasaFloorTexture(maxAniso));
  const rockTex = track(createGraniteRockTexture(maxAniso));
  const safaPlaqueTex = track(createCalligraphyPlaqueTexture('جبل الصفا', 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ', '#0a3d2e', maxAniso));
  const marwahPlaqueTex = track(createCalligraphyPlaqueTexture('جبل المروة', 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ', '#0a3d2e', maxAniso));
  const zamzamSignTex = track(createZamzamSignTexture(maxAniso));
  const clockFaceTex = track(createClockFaceTexture(maxAniso));
  const clockCrestTex = track(createClockCrestTexture('اللَّهُ أَكْبَرُ', true, maxAniso));
  const clockBandTex = track(
    createClockCrestTexture('سُبْحَانَ اللَّهِ وَبِحَمْدِهِ · سُبْحَانَ اللَّهِ الْعَظِيمِ', false, maxAniso)
  );
  const clockMashrabiyaTex = track(createClockMashrabiyaTexture(maxAniso));
  const abrajPodiumTex = track(createTowerFacadeTexture('#e6d7be', '#40362b', '#cfa23a', maxAniso));
  const abrajTowerTex = track(createTowerFacadeTexture('#ede3d0', '#28546a', '#cfa23a', maxAniso));
  const safwahTowerTex = track(createTowerFacadeTexture('#eee1c8', '#4d3d2f', '#c99b34', maxAniso));
  const hiltonMakkahTex = track(createTowerFacadeTexture('#e4ccb0', '#2b5b5c', '#9c7b4c', maxAniso));
  const jabalOmarTex = track(createTowerFacadeTexture('#f0e9db', '#346282', '#d4af53', maxAniso));
  const shamiyahTowerTex = track(createTowerFacadeTexture('#e4dccb', '#253e55', '#bfa062', maxAniso));
  const ghazzahTowerTex = track(createTowerFacadeTexture('#e8dac1', '#473c30', '#c99f48', maxAniso));
  const qubaisPalaceTex = track(createTowerFacadeTexture('#f2e6cf', '#6e5235', '#d4af53', maxAniso));
  const qushashiyahTowerTex = track(createTowerFacadeTexture('#ebe1cf', '#2f5060', '#cca349', maxAniso));
  const libraryPlaqueTex = track(
    createCalligraphyPlaqueTexture(
      'مكتبة مكة المكرمة',
      'شعب علي · أمام باب السلام',
      '#0a3d2e',
      maxAniso
    )
  );

  // --- Shared PBR Materials ---
  const matafMat = track(
    new THREE.MeshStandardMaterial({
      map: matafTex,
      roughness: 0.24,
      metalness: 0.05,
    })
  );
  const masaFloorMat = track(
    new THREE.MeshStandardMaterial({
      map: masaFloorTex,
      roughness: 0.22,
      metalness: 0.06,
    })
  );
  const plazaMat = track(
    new THREE.MeshStandardMaterial({
      map: plazaTex,
      roughness: 0.42,
      metalness: 0.04,
    })
  );
  const carpetMat = track(
    new THREE.MeshStandardMaterial({
      map: carpetTex,
      roughness: 0.9,
      metalness: 0.0,
    })
  );
  const stoneMat = track(
    new THREE.MeshStandardMaterial({
      map: stoneTex,
      color: 0xf4ead8,
      roughness: 0.62,
      metalness: 0.05,
    })
  );
  const warmGraniteMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x7b6a58,
      roughness: 0.55,
      metalness: 0.08,
    })
  );
  const darkMarbleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x35302a,
      roughness: 0.34,
      metalness: 0.14,
    })
  );
  const whiteMarbleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xfaf8f5,
      roughness: 0.25,
      metalness: 0.06,
    })
  );
  const bronzeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x4b3822,
      roughness: 0.38,
      metalness: 0.72,
    })
  );
  const mashrabiyaMat = track(
    new THREE.MeshStandardMaterial({
      map: mashrabiyaTex,
      roughness: 0.45,
      metalness: 0.35,
      emissive: new THREE.Color(0x8c6222),
      emissiveIntensity: 0.22,
    })
  );
  const goldMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xe6be53,
      roughness: 0.2,
      metalness: 0.92,
      clearcoat: 0.65,
    })
  );
  const chromeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xdbe2ea,
      roughness: 0.16,
      metalness: 0.9,
    })
  );
  const darkGreenMarbleMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1a382c,
      roughness: 0.28,
      metalness: 0.12,
    })
  );
  const coolerBeigeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf2ebdc,
      roughness: 0.38,
      metalness: 0.06,
    })
  );
  const coolerLidMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.42,
      metalness: 0.14,
    })
  );
  const coolBlueTapMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.24,
      metalness: 0.28,
    })
  );
  const zamzamSignMat = track(
    new THREE.MeshStandardMaterial({
      map: zamzamSignTex,
      emissive: new THREE.Color(0x064e3b),
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.12,
    })
  );
  const emissiveGoldMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf5d46e,
      emissive: new THREE.Color(0xdca935),
      emissiveIntensity: 0.28,
      roughness: 0.24,
      metalness: 0.85,
    })
  );
  const lampGlowMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xfff7d6,
      emissive: new THREE.Color(0xfde68a),
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.1,
    })
  );
  const greenMasaMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: new THREE.Color(0x059669),
      emissiveIntensity: 0.75,
      roughness: 0.28,
      metalness: 0.2,
    })
  );
  const domeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf3ede2,
      roughness: 0.42,
      metalness: 0.08,
    })
  );
  const canopyMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xf8f3e8,
      roughness: 0.58,
      metalness: 0.04,
      side: THREE.DoubleSide,
    })
  );
  const rockMat = track(
    new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.9,
      metalness: 0.03,
      flatShading: true,
    })
  );
  const abrajPodiumMat = track(
    new THREE.MeshStandardMaterial({
      map: abrajPodiumTex,
      roughness: 0.52,
      metalness: 0.14,
    })
  );
  const abrajTowerMat = track(
    new THREE.MeshStandardMaterial({
      map: abrajTowerTex,
      roughness: 0.44,
      metalness: 0.24,
    })
  );
  const abrajCopperRoofMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x4b4337,
      roughness: 0.36,
      metalness: 0.45,
    })
  );
  const safwahTowerMat = track(
    new THREE.MeshStandardMaterial({
      map: safwahTowerTex,
      roughness: 0.46,
      metalness: 0.22,
    })
  );
  const hiltonMakkahMat = track(
    new THREE.MeshStandardMaterial({
      map: hiltonMakkahTex,
      roughness: 0.45,
      metalness: 0.25,
    })
  );
  const jabalOmarMat = track(
    new THREE.MeshStandardMaterial({
      map: jabalOmarTex,
      roughness: 0.38,
      metalness: 0.32,
    })
  );
  const shamiyahTowerMat = track(
    new THREE.MeshStandardMaterial({
      map: shamiyahTowerTex,
      roughness: 0.42,
      metalness: 0.28,
    })
  );
  const ghazzahTowerMat = track(
    new THREE.MeshStandardMaterial({
      map: ghazzahTowerTex,
      roughness: 0.48,
      metalness: 0.2,
    })
  );
  const qubaisPalaceMat = track(
    new THREE.MeshStandardMaterial({
      map: qubaisPalaceTex,
      roughness: 0.46,
      metalness: 0.18,
    })
  );
  const qushashiyahTowerMat = track(
    new THREE.MeshStandardMaterial({
      map: qushashiyahTowerTex,
      roughness: 0.43,
      metalness: 0.24,
    })
  );
  const emeraldDomeMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0f513b,
      roughness: 0.32,
      metalness: 0.25,
    })
  );
  const libraryPlaqueMat = track(
    new THREE.MeshStandardMaterial({
      map: libraryPlaqueTex,
      emissive: new THREE.Color(0x0a3d2e),
      emissiveIntensity: 0.35,
      roughness: 0.34,
    })
  );
  const jabalRockMat = track(
    new THREE.MeshStandardMaterial({
      map: rockTex,
      color: 0x877764,
      roughness: 0.92,
      metalness: 0.04,
      flatShading: true,
    })
  );
  const towerGlassMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0x22495e,
      roughness: 0.16,
      metalness: 0.72,
      clearcoat: 0.85,
    })
  );
  const clockHousingMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0b3326,
      roughness: 0.36,
      metalness: 0.32,
    })
  );
  const clockMashrabiyaMat = track(
    new THREE.MeshStandardMaterial({
      map: clockMashrabiyaTex,
      emissiveMap: clockMashrabiyaTex,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 0.16,
      roughness: 0.38,
      metalness: 0.4,
    })
  );
  const clockCrestMat = track(
    new THREE.MeshStandardMaterial({
      map: clockCrestTex,
      emissiveMap: clockCrestTex,
      emissive: new THREE.Color(0xfef3c7),
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.25,
    })
  );
  const clockBandMat = track(
    new THREE.MeshStandardMaterial({
      map: clockBandTex,
      emissiveMap: clockBandTex,
      emissive: new THREE.Color(0xfde68a),
      emissiveIntensity: 0.32,
      roughness: 0.3,
      metalness: 0.25,
    })
  );
  const clockDialMat = track(
    new THREE.MeshStandardMaterial({
      map: clockFaceTex,
      emissiveMap: clockFaceTex,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.22,
      roughness: 0.24,
      metalness: 0.12,
    })
  );
  const clockHandDarkMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x0c1a15,
      roughness: 0.28,
      metalness: 0.48,
    })
  );

  // Helper: Real carved Pointed Islamic Arch Bay (Shape + Hole + ExtrudeGeometry)
  const createPointedArchBayGeometry = (
    bayW: number,
    bayH: number,
    archSpan: number,
    springY: number,
    apexY: number,
    depth: number
  ) => {
    const hw = bayW / 2;
    const hs = archSpan / 2;
    const outer = new THREE.Shape();
    outer.moveTo(-hw, 0);
    outer.lineTo(-hw, bayH);
    outer.lineTo(hw, bayH);
    outer.lineTo(hw, 0);
    outer.lineTo(hs, 0);
    outer.lineTo(hs, springY);
    outer.quadraticCurveTo(hs * 0.92, apexY * 0.94, 0, apexY);
    outer.quadraticCurveTo(-hs * 0.92, apexY * 0.94, -hs, springY);
    outer.lineTo(-hs, 0);
    outer.closePath();

    const geo = new THREE.ExtrudeGeometry(outer, {
      depth,
      bevelEnabled: false,
      curveSegments: 10,
    });
    geo.translate(0, 0, -depth / 2);
    return track(geo);
  };

  // Roof materials (can become translucent during cutaway mode)
  const roofMatStandard = track(
    new THREE.MeshStandardMaterial({
      color: 0xe3d7c3,
      roughness: 0.58,
      metalness: 0.05,
      transparent: true,
      opacity: 1,
    })
  );
  const roofMatAccent = track(
    new THREE.MeshStandardMaterial({
      color: 0xebe1d2,
      roughness: 0.5,
      metalness: 0.08,
      transparent: true,
      opacity: 1,
    })
  );
  const roofMeshes: THREE.Mesh[] = [];
  const roofMaterials: THREE.MeshStandardMaterial[] = [roofMatStandard, roofMatAccent];

  // =========================================================================
  // 1. ARCHITECTURAL OUTER PLAZA PODIUM & COURTYARD DETAILS (NO EXTERNAL PYRAMIDS)
  // =========================================================================
  const exteriorGroup = new THREE.Group();
  root.add(exteriorGroup);

  // Outer Marble Plaza Platform (clean architectural plinth — everything outside deleted)
  const plazaGeo = track(new THREE.BoxGeometry(238, 0.5, 296));
  const plazaMesh = new THREE.Mesh(plazaGeo, plazaMat);
  plazaMesh.position.set(6, -0.25, -18);
  plazaMesh.receiveShadow = !isSoftwareGl;
  exteriorGroup.add(plazaMesh);

  // Stepped Granite & White Marble Base Podium Skirt
  const plinthUpper = new THREE.Mesh(
    track(new THREE.BoxGeometry(241, 0.9, 299)),
    whiteMarbleMat
  );
  plinthUpper.position.set(6, -0.95, -18);
  exteriorGroup.add(plinthUpper);

  const plinthLower = new THREE.Mesh(
    track(new THREE.BoxGeometry(246, 1.4, 304)),
    darkMarbleMat
  );
  plinthLower.position.set(6, -2.1, -18);
  exteriorGroup.add(plinthLower);

  // Perimeter Plaza Balustrade Walls (segmented around plaza borders with entrance staircases)
  const plazaMinX = -113;
  const plazaMaxX = 125;
  const plazaMinZ = -166;
  const plazaMaxZ = 130;

  const addPlazaWallRail = (x1: number, z1: number, x2: number, z2: number) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    if (len < 1) return;
    const cx = (x1 + x2) / 2;
    const cz = (z1 + z2) / 2;
    const ang = Math.atan2(x2 - x1, z2 - z1);
    const rail = new THREE.Mesh(track(new THREE.BoxGeometry(0.9, 1.15, len)), stoneMat);
    rail.position.set(cx, 0.57, cz);
    rail.rotation.y = ang;
    exteriorGroup.add(rail);

    const coping = new THREE.Mesh(track(new THREE.BoxGeometry(1.15, 0.22, len + 0.2)), whiteMarbleMat);
    coping.position.set(cx, 1.22, cz);
    coping.rotation.y = ang;
    exteriorGroup.add(coping);
  };

  // South Plaza Border with wide central staircase opening
  addPlazaWallRail(plazaMinX, plazaMaxZ, -22, plazaMaxZ);
  addPlazaWallRail(22, plazaMaxZ, plazaMaxX, plazaMaxZ);
  // North Plaza Border with central opening
  addPlazaWallRail(plazaMinX, plazaMinZ, -24, plazaMinZ);
  addPlazaWallRail(24, plazaMinZ, plazaMaxX, plazaMinZ);
  // West Plaza Border with central opening
  addPlazaWallRail(plazaMinX, plazaMinZ, plazaMinX, -8);
  addPlazaWallRail(plazaMinX, 44, plazaMinX, plazaMaxZ);
  // East Plaza Border with central opening
  addPlazaWallRail(plazaMaxX, plazaMinZ, plazaMaxX, -20);
  addPlazaWallRail(plazaMaxX, 20, plazaMaxX, plazaMaxZ);

  // Plaza Access Staircases at the 4 main outer approaches
  const addPlazaStairs = (cx: number, cz: number, rotY: number, width: number) => {
    const stairGroup = new THREE.Group();
    stairGroup.position.set(cx, 0, cz);
    stairGroup.rotation.y = rotY;
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(
        track(new THREE.BoxGeometry(width, 0.42, 1.2)),
        s % 2 === 0 ? whiteMarbleMat : stoneMat
      );
      step.position.set(0, -0.22 - s * 0.42, s * 1.15);
      stairGroup.add(step);
    }
    exteriorGroup.add(stairGroup);
  };
  addPlazaStairs(0, plazaMaxZ + 0.6, 0, 44);
  addPlazaStairs(0, plazaMinZ - 0.6, Math.PI, 48);
  addPlazaStairs(plazaMinX - 0.6, 18, -Math.PI / 2, 52);
  addPlazaStairs(plazaMaxX + 0.6, 0, Math.PI / 2, 40);

  // Detailed Makkah Courtyard Shading Umbrellas (Composite pole + rib arms + pitched canopy + night lantern)
  const umbrellaPositions: Array<[number, number]> = [
    // South Plaza
    [-46, 84], [-26, 84], [24, 84], [46, 84],
    [-46, 106], [46, 106],
    // West Plaza
    [-86, -24], [-86, 4], [-86, 42],
    // East Plaza
    [98, -36], [98, 0], [98, 36],
    // North 3rd Expansion Plaza
    [-46, -138], [-20, -138], [20, -138], [46, -138],
  ];
  const umbBaseGeo = track(new THREE.CylinderGeometry(1.15, 1.4, 1.2, 8));
  const umbMastGeo = track(new THREE.CylinderGeometry(0.32, 0.42, 10.6, 8));
  const umbCanopyGeo = track(new THREE.ConeGeometry(6.4, 1.6, 4, 1, true));
  const umbCapGeo = track(new THREE.ConeGeometry(0.65, 1.1, 4));

  const umbBaseInst = new THREE.InstancedMesh(umbBaseGeo, whiteMarbleMat, umbrellaPositions.length);
  const umbMastInst = new THREE.InstancedMesh(umbMastGeo, stoneMat, umbrellaPositions.length);
  const umbCanopyInst = new THREE.InstancedMesh(umbCanopyGeo, canopyMat, umbrellaPositions.length);
  const umbCapInst = new THREE.InstancedMesh(umbCapGeo, goldMat, umbrellaPositions.length);

  umbrellaPositions.forEach(([x, z], idx) => {
    _dummy.position.set(x, 0.6, z);
    _dummy.rotation.set(0, Math.PI / 4, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    umbBaseInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(x, 5.8, z);
    _dummy.rotation.set(0, 0, 0);
    _dummy.updateMatrix();
    umbMastInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(x, 11.4, z);
    _dummy.rotation.set(0, Math.PI / 4, 0);
    _dummy.updateMatrix();
    umbCanopyInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(x, 12.6, z);
    _dummy.rotation.set(0, Math.PI / 4, 0);
    _dummy.updateMatrix();
    umbCapInst.setMatrixAt(idx, _dummy.matrix);
  });
  [umbBaseInst, umbMastInst, umbCanopyInst, umbCapInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    exteriorGroup.add(inst);
  });

  // Exterior Plaza Candelabra Lamp Columns (InstancedMesh)
  const plazaLampCoords: Array<[number, number]> = [
    [-68, 92], [-14, 108], [14, 108], [68, 92],
    [-96, -54], [-96, -12], [-96, 28], [-96, 68],
    [108, -56], [108, -18], [108, 18], [108, 56],
    [-68, -148], [-32, -148], [32, -148], [68, -148],
    [-82, -110], [82, -110],
  ];
  const lampPoleGeo = track(new THREE.CylinderGeometry(0.16, 0.26, 7.6, 8));
  const lampHeadGeo = track(new THREE.SphereGeometry(0.58, 10, 8));
  const lampPoleInst = new THREE.InstancedMesh(lampPoleGeo, bronzeMat, plazaLampCoords.length);
  const lampHeadInst = new THREE.InstancedMesh(lampHeadGeo, lampGlowMat, plazaLampCoords.length);
  plazaLampCoords.forEach(([lx, lz], idx) => {
    _dummy.position.set(lx, 3.8, lz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    lampPoleInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(lx, 7.9, lz);
    _dummy.updateMatrix();
    lampHeadInst.setMatrixAt(idx, _dummy.matrix);
  });
  lampPoleInst.instanceMatrix.needsUpdate = true;
  lampHeadInst.instanceMatrix.needsUpdate = true;
  lampPoleInst.computeBoundingSphere();
  lampHeadInst.computeBoundingSphere();
  exteriorGroup.add(lampPoleInst, lampHeadInst);

  // Exterior Escalator & Ablution Pavilions (adds architectural realism to outer plazas)
  const addEscalatorPavilion = (px: number, pz: number, rotY = 0) => {
    const pav = new THREE.Group();
    pav.position.set(px, 0, pz);
    pav.rotation.y = rotY;
    const base = new THREE.Mesh(track(new THREE.BoxGeometry(10, 0.8, 6.5)), whiteMarbleMat);
    base.position.y = 0.4;
    const body = new THREE.Mesh(track(new THREE.BoxGeometry(9.2, 3.6, 5.6)), stoneMat);
    body.position.y = 2.6;
    const archWin = new THREE.Mesh(track(new THREE.BoxGeometry(7.2, 2.4, 5.8)), mashrabiyaMat);
    archWin.position.y = 2.6;
    const roof = new THREE.Mesh(track(new THREE.BoxGeometry(10.6, 0.55, 7.0)), goldMat);
    roof.position.y = 4.65;
    pav.add(base, body, archWin, roof);
    exteriorGroup.add(pav);
  };
  addEscalatorPavilion(-74, 68, Math.PI / 5);
  addEscalatorPavilion(76, 82, -Math.PI / 6);
  addEscalatorPavilion(-84, -74, Math.PI / 2);
  addEscalatorPavilion(84, -84, Math.PI / 2);

  // =========================================================================
  // 2. KAABA COMPOSITE HERO MODEL (CENTER [0,0,0] — HIGH REALISM REDESIGN)
  // =========================================================================
  const kaabaGroup = new THREE.Group();
  root.add(kaabaGroup);

  const { kaabaWidth: kw, kaabaDepth: kd, kaabaHeight: kh } = HARAM_DIMENSIONS;

  // (a) Multi-tier Chamfered Shadharwan Marble Plinth + Dark Marble Collar + Brass Tie-Rings
  const shadharwanLower = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.96, 0.24, kd + 0.96)),
    whiteMarbleMat
  );
  shadharwanLower.position.set(0, 0.12, 0);
  shadharwanLower.receiveShadow = true;

  const shadharwanUpper = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.72, 0.26, kd + 0.72)),
    whiteMarbleMat
  );
  shadharwanUpper.position.set(0, 0.36, 0);
  shadharwanUpper.receiveShadow = true;

  const shadharwanTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.76, 0.08, kd + 0.76)),
    darkMarbleMat
  );
  shadharwanTrim.position.set(0, 0.51, 0);
  kaabaGroup.add(shadharwanLower, shadharwanUpper, shadharwanTrim);

  // Al-Multazam marble slab inlay on East Shadharwan between Bab al-Kaaba & Black Stone
  const multazamSlab = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.42, 0.06, 1.95)),
    darkGreenMarbleMat
  );
  multazamSlab.position.set(kw / 2 + 0.26, 0.53, 2.35);
  kaabaGroup.add(multazamSlab);

  // Brass Kiswah Tie-Rings (Halqat al-Shadharwan) arrayed along all 4 sides via InstancedMesh
  const tieRingGeo = track(new THREE.TorusGeometry(0.11, 0.028, 6, 14));
  const tiePlateGeo = track(new THREE.BoxGeometry(0.16, 0.16, 0.06));
  const tieRingCoords: Array<[number, number, number, number]> = [];
  // South & North (outside Hatim ends)
  for (let i = -2; i <= 2; i++) {
    tieRingCoords.push([i * 1.12, 0.42, kd / 2 + 0.42, 0]);
    if (Math.abs(i) === 2) {
      tieRingCoords.push([i * 1.32, 0.42, -kd / 2 - 0.42, Math.PI]);
    }
  }
  // East & West
  for (let i = -2; i <= 2; i++) {
    tieRingCoords.push([kw / 2 + 0.42, 0.42, i * 1.25, Math.PI / 2]);
    tieRingCoords.push([-kw / 2 - 0.42, 0.42, i * 1.25, -Math.PI / 2]);
  }
  const tieRingInst = new THREE.InstancedMesh(tieRingGeo, goldMat, tieRingCoords.length);
  const tiePlateInst = new THREE.InstancedMesh(tiePlateGeo, bronzeMat, tieRingCoords.length);
  tieRingCoords.forEach(([tx, ty, tz, ry], idx) => {
    _dummy.position.set(tx, ty, tz);
    _dummy.rotation.set(0.25, ry, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    tieRingInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(tx - Math.sin(ry) * 0.04, ty + 0.05, tz - Math.cos(ry) * 0.04);
    _dummy.rotation.set(0, ry, 0);
    _dummy.updateMatrix();
    tiePlateInst.setMatrixAt(idx, _dummy.matrix);
  });
  tieRingInst.instanceMatrix.needsUpdate = true;
  tiePlateInst.instanceMatrix.needsUpdate = true;
  tieRingInst.computeBoundingSphere();
  tiePlateInst.computeBoundingSphere();
  kaabaGroup.add(tieRingInst, tiePlateInst);

  // (b) Kaaba main body with 6-material array (+X East has Sitara curtain, +Y has detailed roof pavers)
  const kiswahPlainMat = track(
    new THREE.MeshStandardMaterial({
      map: kiswahPlainTex,
      roughness: 0.74,
      metalness: 0.09,
    })
  );
  const kiswahEastMat = track(
    new THREE.MeshStandardMaterial({
      map: kiswahSitaraTex,
      roughness: 0.68,
      metalness: 0.16,
    })
  );
  const kaabaRoofMat = track(
    new THREE.MeshStandardMaterial({
      map: kaabaRoofTex,
      roughness: 0.46,
      metalness: 0.05,
    })
  );
  const kaabaBodyGeo = track(new THREE.BoxGeometry(kw, kh, kd));
  const kaabaMesh = new THREE.Mesh(kaabaBodyGeo, [
    kiswahEastMat,
    kiswahPlainMat,
    kaabaRoofMat,
    kaabaRoofMat,
    kiswahPlainMat,
    kiswahPlainMat,
  ]);
  kaabaMesh.position.set(0, kh / 2 + 0.35, 0);
  kaabaMesh.castShadow = !isSoftwareGl;
  kaabaMesh.receiveShadow = !isSoftwareGl;
  kaabaGroup.add(kaabaMesh);

  // (c) Multi-band 3D Golden Hizam Belt Relief & Corner Seam Trim
  const hizamCenterY = kh * 0.72 + 0.35;
  const hizamUpperRail = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.12, 0.11, kd + 0.12)),
    emissiveGoldMat
  );
  hizamUpperRail.position.set(0, hizamCenterY + 0.36, 0);
  const hizamLowerRail = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.12, 0.11, kd + 0.12)),
    emissiveGoldMat
  );
  hizamLowerRail.position.set(0, hizamCenterY - 0.36, 0);
  const hizamBaseBorder = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.08, 0.09, kd + 0.08)),
    goldMat
  );
  hizamBaseBorder.position.set(0, 0.66, 0);
  kaabaGroup.add(hizamUpperRail, hizamLowerRail, hizamBaseBorder);

  // Subtle vertical golden Kiswah corner trims on Iraqi (+X, -Z) & Shami (-X, -Z) corners
  const cornerSeamGeo = track(new THREE.BoxGeometry(0.14, kh - 0.2, 0.14));
  [
    [kw / 2 + 0.01, kh / 2 + 0.35, -kd / 2 - 0.01],
    [-kw / 2 - 0.01, kh / 2 + 0.35, -kd / 2 - 0.01],
  ].forEach(([cx, cy, cz]) => {
    const seam = new THREE.Mesh(cornerSeamGeo, bronzeMat);
    seam.position.set(cx, cy, cz);
    kaabaGroup.add(seam);
  });

  // (c2) Detailed Recessed 3D Bab al-Kaaba (+X East Wall at z = 0.75)
  const kaabaDoorGroup = new THREE.Group();
  kaabaDoorGroup.position.set(kw / 2 + 0.03, 0, 0.75);
  kaabaGroup.add(kaabaDoorGroup);

  // Outer carved golden doorway frame + arched crown lintel
  const doorOuterFrame = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.16, 3.35, 1.72)),
    goldMat
  );
  doorOuterFrame.position.set(0.03, 3.18, 0);
  const doorRecessBacking = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.08, 3.05, 1.44)),
    bronzeMat
  );
  doorRecessBacking.position.set(0.08, 3.12, 0);
  // Twin solid gold door leaves with central astragal & embossed medallions
  const doorLeafGeo = track(new THREE.BoxGeometry(0.07, 2.78, 0.64));
  const doorLeafL = new THREE.Mesh(doorLeafGeo, emissiveGoldMat);
  doorLeafL.position.set(0.11, 3.05, -0.35);
  const doorLeafR = new THREE.Mesh(doorLeafGeo, emissiveGoldMat);
  doorLeafR.position.set(0.11, 3.05, 0.35);
  const doorAstragal = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.09, 2.82, 0.08)),
    goldMat
  );
  doorAstragal.position.set(0.12, 3.05, 0);
  // Arched upper lintel plaque & twin circular door knockers
  const doorArchCrown = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.76, 0.76, 0.14, 16, 1, false, 0, Math.PI)),
    goldMat
  );
  doorArchCrown.rotation.z = Math.PI / 2;
  doorArchCrown.position.set(0.05, 4.78, 0);
  const doorKnockerGeo = track(new THREE.TorusGeometry(0.07, 0.022, 6, 12));
  const knockerL = new THREE.Mesh(doorKnockerGeo, goldMat);
  knockerL.rotation.y = Math.PI / 2;
  knockerL.position.set(0.16, 2.95, -0.18);
  const knockerR = new THREE.Mesh(doorKnockerGeo, goldMat);
  knockerR.rotation.y = Math.PI / 2;
  knockerR.position.set(0.16, 2.95, 0.18);
  // Carved marble threshold sill beneath Bab al-Kaaba
  const doorSill = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.32, 0.22, 1.82)),
    whiteMarbleMat
  );
  doorSill.position.set(0.08, 1.48, 0);
  kaabaDoorGroup.add(
    doorOuterFrame,
    doorRecessBacking,
    doorLeafL,
    doorLeafR,
    doorAstragal,
    doorArchCrown,
    knockerL,
    knockerR,
    doorSill
  );

  // (d) Stepped Roof Parapet Rim, Bab al-Tawbah Roof Hatch & Ornate Mizab Al-Rahmah
  const parapetGeo = track(new THREE.BoxGeometry(kw + 0.26, 0.38, kd + 0.26));
  const parapet = new THREE.Mesh(parapetGeo, darkMarbleMat);
  parapet.position.set(0, kh + 0.35, 0);
  const parapetCap = new THREE.Mesh(
    track(new THREE.BoxGeometry(kw + 0.32, 0.12, kd + 0.32)),
    whiteMarbleMat
  );
  parapetCap.position.set(0, kh + 0.56, 0);
  // Raised Bab al-Tawbah roof hatch shelter on Kaaba rooftop
  const roofHatch = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.45, 0.65, 1.85)),
    whiteMarbleMat
  );
  roofHatch.position.set(1.2, kh + 0.68, -1.4);
  const roofHatchTop = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.55, 0.12, 1.95)),
    goldMat
  );
  roofHatchTop.position.set(1.2, kh + 1.04, -1.4);
  kaabaGroup.add(parapet, parapetCap, roofHatch, roofHatchTop);

  // Ornate Mizab Al-Rahmah (golden water spout with side rails, bracket & tip finials)
  const mizabGroup = new THREE.Group();
  mizabGroup.position.set(0, kh + 0.24, -kd / 2 - 0.72);
  const mizabBase = new THREE.Mesh(track(new THREE.BoxGeometry(0.48, 0.18, 1.9)), goldMat);
  const mizabWallL = new THREE.Mesh(track(new THREE.BoxGeometry(0.07, 0.28, 1.9)), emissiveGoldMat);
  mizabWallL.position.set(-0.21, 0.14, 0);
  const mizabWallR = new THREE.Mesh(track(new THREE.BoxGeometry(0.07, 0.28, 1.9)), emissiveGoldMat);
  mizabWallR.position.set(0.21, 0.14, 0);
  const mizabBracket = new THREE.Mesh(track(new THREE.BoxGeometry(0.26, 0.26, 0.95)), bronzeMat);
  mizabBracket.position.set(0, -0.18, 0.42);
  mizabBracket.rotation.x = 0.28;
  mizabGroup.add(mizabBase, mizabWallL, mizabWallR, mizabBracket);
  // Delicate golden finials along spout tip
  const mizabSpikeGeo = track(new THREE.ConeGeometry(0.032, 0.16, 6));
  [-0.16, 0, 0.16].forEach((sx) => {
    const spike = new THREE.Mesh(mizabSpikeGeo, emissiveGoldMat);
    spike.position.set(sx, 0.34, -0.92);
    mizabGroup.add(spike);
  });
  kaabaGroup.add(mizabGroup);

  // (e) Black Stone (Al-Hajar Al-Aswad) sculpted silver bezel & volcanic inner core (+X, +Z)
  const silverMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xdce1e8,
      roughness: 0.16,
      metalness: 0.95,
    })
  );
  const blackStoneGroup = new THREE.Group();
  blackStoneGroup.position.set(kw / 2 + 0.04, 1.48, kd / 2 + 0.04);
  blackStoneGroup.rotation.y = Math.PI / 4;
  const blackStoneBezel = new THREE.Mesh(
    track(new THREE.TorusGeometry(0.32, 0.11, 10, 20)),
    silverMat
  );
  blackStoneBezel.scale.set(0.86, 1.18, 1.0);
  const blackStoneBacking = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.39, 0.44, 0.22, 16)),
    silverMat
  );
  blackStoneBacking.rotation.x = Math.PI / 2;
  blackStoneBacking.position.z = -0.06;
  const blackStoneCore = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.21, 12, 12)),
    darkMarbleMat
  );
  blackStoneCore.scale.set(0.82, 1.08, 0.72);
  blackStoneCore.position.z = 0.04;
  blackStoneGroup.add(blackStoneBacking, blackStoneBezel, blackStoneCore);
  kaabaGroup.add(blackStoneGroup);

  // (f) Yemeni Corner ornate gold-bronze vertical casing (-X, +Z)
  const yemeniCornerGroup = new THREE.Group();
  yemeniCornerGroup.position.set(-kw / 2 - 0.02, 0, kd / 2 + 0.02);
  const yemeniCorner = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.3, 2.55, 0.3)),
    goldMat
  );
  yemeniCorner.position.y = 1.65;
  const yemeniCollar = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.36, 0.16, 0.36)),
    bronzeMat
  );
  yemeniCollar.position.y = 2.95;
  yemeniCornerGroup.add(yemeniCorner, yemeniCollar);
  kaabaGroup.add(yemeniCornerGroup);

  // (g) Hijr Ismail / Al-Hatim (curved semicircular marble wall + dark-green marble coping + inner pavement + bollards + 3 ornate lanterns)
  const hatimShape = new THREE.Shape();
  const hatimOuterR = 4.65;
  const hatimInnerR = 3.9;
  hatimShape.absarc(0, 0, hatimOuterR, 0, Math.PI, false);
  hatimShape.lineTo(-hatimInnerR, 0);
  hatimShape.absarc(0, 0, hatimInnerR, Math.PI, 0, true);
  hatimShape.closePath();

  const hatimGeo = track(
    new THREE.ExtrudeGeometry(hatimShape, {
      depth: 1.24,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 2,
    })
  );
  hatimGeo.rotateX(Math.PI / 2);
  const hatimWall = new THREE.Mesh(hatimGeo, whiteMarbleMat);
  hatimWall.position.set(0, 1.26, -kd / 2 - 0.85);
  hatimWall.castShadow = !isSoftwareGl;
  hatimWall.receiveShadow = !isSoftwareGl;
  kaabaGroup.add(hatimWall);

  // Dark green/black bevelled marble coping crowning Al-Hatim wall
  const hatimCopingGeo = track(
    new THREE.ExtrudeGeometry(hatimShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.03,
      bevelSegments: 1,
    })
  );
  hatimCopingGeo.rotateX(Math.PI / 2);
  const hatimCoping = new THREE.Mesh(hatimCopingGeo, darkGreenMarbleMat);
  hatimCoping.position.set(0, 1.38, -kd / 2 - 0.85);
  kaabaGroup.add(hatimCoping);

  // Inner Hijr Ismail Marble Pavement + golden accent border ring
  const hatimFloor = new THREE.Mesh(
    track(new THREE.CircleGeometry(hatimInnerR, 24, 0, Math.PI)),
    whiteMarbleMat
  );
  hatimFloor.rotation.x = -Math.PI / 2;
  hatimFloor.rotation.z = Math.PI;
  hatimFloor.position.set(0, 0.12, -kd / 2 - 0.85);
  const hatimBorderRing = new THREE.Mesh(
    track(new THREE.RingGeometry(hatimInnerR - 0.35, hatimInnerR - 0.12, 24, 1, 0, Math.PI)),
    darkMarbleMat
  );
  hatimBorderRing.rotation.x = -Math.PI / 2;
  hatimBorderRing.rotation.z = Math.PI;
  hatimBorderRing.position.set(0, 0.135, -kd / 2 - 0.85);
  kaabaGroup.add(hatimFloor, hatimBorderRing);

  // 3 Tall Ornate Mamluk/Ottoman Golden Lanterns crowning Al-Hatim
  const hatimLanternBaseGeo = track(new THREE.CylinderGeometry(0.28, 0.36, 0.38, 8));
  const hatimLanternGeo = track(new THREE.CylinderGeometry(0.15, 0.22, 1.75, 10));
  const hatimOrbGeo = track(new THREE.CylinderGeometry(0.24, 0.18, 0.48, 8));
  const hatimCapGeo = track(new THREE.ConeGeometry(0.26, 0.34, 8));
  [
    [-4.28, -kd / 2 - 0.85],
    [4.28, -kd / 2 - 0.85],
    [0, -kd / 2 - 5.14],
  ].forEach(([lx, lz]) => {
    const lBase = new THREE.Mesh(hatimLanternBaseGeo, whiteMarbleMat);
    lBase.position.set(lx, 0.2, lz);
    const lantern = new THREE.Mesh(hatimLanternGeo, goldMat);
    lantern.position.set(lx, 1.15, lz);
    const orb = new THREE.Mesh(hatimOrbGeo, lampGlowMat);
    orb.position.set(lx, 2.24, lz);
    const lCap = new THREE.Mesh(hatimCapGeo, goldMat);
    lCap.position.set(lx, 2.65, lz);
    kaabaGroup.add(lBase, lantern, orb, lCap);
  });

  // (h) Tawaf Start Green Line extending from Black Stone corner (+X, +Z)
  const tawafLine = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.34, 0.03, 31)),
    greenMasaMat
  );
  tawafLine.rotation.y = -Math.PI / 4;
  tawafLine.position.set(14.5, 0.07, 14.8);
  kaabaGroup.add(tawafLine);

  // =========================================================================
  // 3. MAQAM IBRAHIM, ZAMZAM STATIONS & MATAF DETAILS
  // =========================================================================
  const maqamGroup = new THREE.Group();
  maqamGroup.position.set(11.5, 0, -0.6);
  root.add(maqamGroup);

  const mqPlinth = new THREE.Mesh(track(new THREE.CylinderGeometry(1.75, 1.95, 0.22, 16)), whiteMarbleMat);
  mqPlinth.position.y = 0.11;
  const mqBase = new THREE.Mesh(track(new THREE.CylinderGeometry(1.15, 1.35, 0.36, 8)), whiteMarbleMat);
  mqBase.position.y = 0.38;
  const mqMid = new THREE.Mesh(track(new THREE.CylinderGeometry(0.76, 0.86, 1.18, 8)), goldMat);
  mqMid.position.y = 1.12;
  const mqGlass = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.62, 0.62, 1.0, 12)),
    track(
      new THREE.MeshPhysicalMaterial({
        color: 0xe6f7ff,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.55,
      })
    )
  );
  mqGlass.position.y = 2.05;
  const mqDome = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.7, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
    goldMat
  );
  mqDome.position.y = 2.55;
  const mqFinial = new THREE.Mesh(track(new THREE.ConeGeometry(0.12, 0.55, 8)), goldMat);
  mqFinial.position.y = 3.4;
  maqamGroup.add(mqPlinth, mqBase, mqMid, mqGlass, mqDome, mqFinial);

  // Zamzam Well Monument (East-Southeast) + Decorative Brass Medallion
  const zamzamGroup = new THREE.Group();
  zamzamGroup.position.set(15.5, 0.08, 7.5);
  const zamzamOuter = new THREE.Mesh(track(new THREE.CylinderGeometry(1.35, 1.45, 0.08, 8)), goldMat);
  const zamzamInner = new THREE.Mesh(track(new THREE.CylinderGeometry(0.95, 0.95, 0.11, 8)), darkMarbleMat);
  zamzamGroup.add(zamzamOuter, zamzamInner);
  root.add(zamzamGroup);

  // =========================================================================
  // 3B. BATCHED ZAMZAM WATER COOLER RACKS (كولمنات زمزم) & DRINKING FOUNTAINS (حنفيات المياه)
  // =========================================================================
  // Collectors populated across Mataf perimeter, Riwaq halls, Fahd Wing, 3rd Expansion, Al-Mas'a & Outer Plazas
  const colmanRacks: Array<{ x: number; z: number; rotY: number; barrels: number }> = [];
  const drinkingFountains: Array<{ x: number; z: number; rotY: number; taps: number }> = [];

  // Imam Prayer Niche & Minbar near South Mataf Edge + Imam Prayer Carpet
  const mihrabGroup = new THREE.Group();
  mihrabGroup.position.set(0, 0, 41.2);
  const mihrabArch = new THREE.Mesh(track(new THREE.BoxGeometry(2.8, 3.4, 0.8)), whiteMarbleMat);
  mihrabArch.position.y = 1.7;
  const mihrabInlay = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, 2.4, 0.9)), goldMat);
  mihrabInlay.position.y = 1.4;
  const minbarBase = new THREE.Mesh(track(new THREE.BoxGeometry(1.3, 2.6, 2.2)), bronzeMat);
  minbarBase.position.set(3.2, 1.3, 0.4);
  const imamCarpet = new THREE.Mesh(track(new THREE.BoxGeometry(4.2, 0.04, 3.2)), carpetMat);
  imamCarpet.position.set(0, 0.07, -1.9);
  mihrabGroup.add(mihrabArch, mihrabInlay, minbarBase, imamCarpet);
  root.add(mihrabGroup);

  // =========================================================================
  // 4. AL-MATAF FLOOR, MULTI-LEVEL RIWAQ ARCHES & COMPLETE PERIMETER WALLS
  // =========================================================================
  const matafGroup = new THREE.Group();
  root.add(matafGroup);

  // Mataf Circular White Thassos Marble Courtyard
  const matafFloor = new THREE.Mesh(
    track(new THREE.CircleGeometry(HARAM_DIMENSIONS.matafOuterRadius + 1, 64)),
    matafMat
  );
  matafFloor.rotation.x = -Math.PI / 2;
  matafFloor.position.y = 0.05;
  matafFloor.receiveShadow = !isSoftwareGl;
  matafGroup.add(matafFloor);

  // Prayer Carpet Ring in Outer Riwaq
  const riwaqCarpetRing = new THREE.Mesh(
    track(new THREE.RingGeometry(HARAM_DIMENSIONS.riwaqInnerRadius - 1, HARAM_DIMENSIONS.riwaqOuterRadius + 1, 64)),
    carpetMat
  );
  riwaqCarpetRing.rotation.x = -Math.PI / 2;
  riwaqCarpetRing.position.y = 0.08;
  matafGroup.add(riwaqCarpetRing);

  // Inner Mataf-to-Riwaq Marble Balustrade Curb (with wide passages)
  const innerCurbSegments = 48;
  const curbGeo = track(new THREE.BoxGeometry(4.2, 0.85, 0.55));
  const curbCoords: Array<[number, number, number]> = [];
  for (let i = 0; i < innerCurbSegments; i++) {
    const ang = (i / innerCurbSegments) * Math.PI * 2;
    // Open passages at main cardinal & Mas'a / Expansion directions
    if (Math.abs(ang) < 0.35 || Math.abs(ang + Math.PI / 2) < 0.35 || Math.abs(ang - Math.PI / 2) < 0.16 || Math.abs(Math.abs(ang) - Math.PI) < 0.16) {
      continue;
    }
    curbCoords.push([Math.cos(ang) * 42.3, Math.sin(ang) * 42.3, -ang + Math.PI / 2]);
  }
  const curbInst = new THREE.InstancedMesh(curbGeo, whiteMarbleMat, curbCoords.length);
  curbCoords.forEach(([cx, cz, ry], idx) => {
    _dummy.position.set(cx, 0.45, cz);
    _dummy.rotation.set(0, ry, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    curbInst.setMatrixAt(idx, _dummy.matrix);
  });
  curbInst.instanceMatrix.needsUpdate = true;
  curbInst.computeBoundingSphere();
  matafGroup.add(curbInst);

  // Riwaq Circular Colonnade Pillars (Composite Base + Shaft + Capital)
  const circularGateOpenings: Array<{ ang: number; isMajor: boolean }> = HARAM_GATES.filter(
    (g) =>
      g.direction !== 'expansion' &&
      g.id !== 'gate-13' &&
      g.id !== 'gate-15' &&
      g.id !== 'gate-19' &&
      g.id !== 'gate-22' &&
      g.id !== 'gate-25'
  ).map((g) => ({
    ang: Math.atan2(g.position[2], g.position[0]),
    isMajor: Boolean(g.isMajor),
  }));
  // Keep interior Riwaq walkway aligned with King Fahd West Wing entrance (x = -58, z = 24)
  circularGateOpenings.push({ ang: Math.atan2(24, -58), isMajor: true });

  const isNearGateAngle = (ang: number, threshold?: number, usePerGateSize = false) => {
    for (let i = 0; i < circularGateOpenings.length; i++) {
      let diff = Math.abs(ang - circularGateOpenings[i].ang);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      const limit = usePerGateSize
        ? circularGateOpenings[i].isMajor
          ? 0.112
          : 0.088
        : threshold ?? 0.088;
      if (diff < limit) return true;
    }
    return false;
  };

  const pillarPositions: Array<[number, number, number]> = []; // x, z, ang
  const rings = [44, 51, 58];
  rings.forEach((radius, rIdx) => {
    const count = 48 + rIdx * 8;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      if (Math.abs(ang) < 0.52) continue; // Open to Mas'a
      if (Math.abs(ang + Math.PI / 2) < 0.44) continue; // Open to 3rd Expansion
      if (isNearGateAngle(ang)) continue;
      pillarPositions.push([Math.cos(ang) * radius, Math.sin(ang) * radius, ang]);
    }
  });

  const colH = HARAM_DIMENSIONS.riwaqHeight - 0.5;
  const colBaseGeo = track(new THREE.BoxGeometry(1.65, 0.55, 1.65));
  const colDadoGeo = track(new THREE.CylinderGeometry(0.68, 0.74, 0.85, 8));
  const colShaftGeo = track(new THREE.CylinderGeometry(0.52, 0.62, colH - 2.1, 12));
  const colNeckGeo = track(new THREE.TorusGeometry(0.56, 0.07, 6, 12));
  const colCapGeo = track(new THREE.CylinderGeometry(0.92, 0.56, 0.85, 8));
  const colAbacusGeo = track(new THREE.BoxGeometry(1.72, 0.28, 1.72));

  const colBaseInst = new THREE.InstancedMesh(colBaseGeo, whiteMarbleMat, pillarPositions.length);
  const colDadoInst = new THREE.InstancedMesh(colDadoGeo, warmGraniteMat, pillarPositions.length);
  const colShaftInst = new THREE.InstancedMesh(colShaftGeo, stoneMat, pillarPositions.length);
  const colNeckInst = new THREE.InstancedMesh(colNeckGeo, goldMat, pillarPositions.length);
  const colCapInst = new THREE.InstancedMesh(colCapGeo, goldMat, pillarPositions.length);
  const colAbacusInst = new THREE.InstancedMesh(colAbacusGeo, whiteMarbleMat, pillarPositions.length);
  colShaftInst.castShadow = !isSoftwareGl;
  colShaftInst.receiveShadow = !isSoftwareGl;

  pillarPositions.forEach(([px, pz, ang], idx) => {
    _dummy.position.set(px, 0.275, pz);
    _dummy.rotation.set(0, -ang, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    colBaseInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(px, 0.96, pz);
    _dummy.updateMatrix();
    colDadoInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(px, (colH - 1.5) / 2 + 1.15, pz);
    _dummy.updateMatrix();
    colShaftInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(px, colH - 0.62, pz);
    _dummy.rotation.set(Math.PI / 2, 0, 0);
    _dummy.updateMatrix();
    colNeckInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(px, colH - 0.16, pz);
    _dummy.rotation.set(0, -ang, 0);
    _dummy.updateMatrix();
    colCapInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(px, colH + 0.32, pz);
    _dummy.updateMatrix();
    colAbacusInst.setMatrixAt(idx, _dummy.matrix);
  });
  [colBaseInst, colDadoInst, colShaftInst, colNeckInst, colCapInst, colAbacusInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    matafGroup.add(inst);
  });

  // Outer Mataf Edge (r = 40.2) & Riwaq Inner Hall (r = 55.4) Zamzam Colmans & Drinking Fountains
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2 + 0.14;
    const normAng = Math.atan2(Math.sin(ang), Math.cos(ang));
    if (Math.abs(normAng) < 0.48 || Math.abs(normAng + Math.PI / 2) < 0.42) continue;
    if (isNearGateAngle(normAng, 0.15, true)) continue;

    if (i % 2 === 0) {
      colmanRacks.push({
        x: Math.cos(normAng) * 40.3,
        z: Math.sin(normAng) * 40.3,
        rotY: -normAng - Math.PI / 2,
        barrels: 4,
      });
    } else {
      drinkingFountains.push({
        x: Math.cos(normAng) * 40.3,
        z: Math.sin(normAng) * 40.3,
        rotY: -normAng - Math.PI / 2,
        taps: 4,
      });
    }
  }
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2 + 0.22;
    const normAng = Math.atan2(Math.sin(ang), Math.cos(ang));
    if (Math.abs(normAng) < 0.52 || Math.abs(normAng + Math.PI / 2) < 0.44) continue;
    if (isNearGateAngle(normAng, 0.16, true)) continue;
    if (i % 2 === 0) {
      colmanRacks.push({
        x: Math.cos(normAng) * 55.4,
        z: Math.sin(normAng) * 55.4,
        rotY: -normAng - Math.PI / 2,
        barrels: 4,
      });
    } else {
      drinkingFountains.push({
        x: Math.cos(normAng) * 55.4,
        z: Math.sin(normAng) * 55.4,
        rotY: -normAng - Math.PI / 2,
        taps: 4,
      });
    }
  }

  // Real Multi-Tier Carved Pointed Islamic Arch Bays along Inner (r = 43.2) & Mid (r = 52.5) Riwaq Rings
  const innerArchCoords: Array<[number, number, number]> = [];
  const innerRingCount = 48;
  for (let i = 0; i < innerRingCount; i++) {
    const ang = ((i + 0.5) / innerRingCount) * Math.PI * 2;
    if (Math.abs(ang) < 0.5 || Math.abs(ang + Math.PI / 2) < 0.42) continue;
    if (isNearGateAngle(ang, 0.055)) continue;
    innerArchCoords.push([Math.cos(ang) * 43.2, Math.sin(ang) * 43.2, -ang + Math.PI / 2]);
  }
  const groundArchBayGeo = createPointedArchBayGeometry(5.68, 6.2, 4.1, 3.3, 5.35, 0.92);
  const upperArchBayGeo = createPointedArchBayGeometry(5.68, 5.5, 3.85, 2.8, 4.65, 0.86);
  const archCorniceGeo = track(new THREE.BoxGeometry(5.76, 0.28, 1.08));

  const groundArchInst = new THREE.InstancedMesh(groundArchBayGeo, stoneMat, innerArchCoords.length);
  const upperArchInst = new THREE.InstancedMesh(upperArchBayGeo, stoneMat, innerArchCoords.length);
  const archCorniceInst = new THREE.InstancedMesh(archCorniceGeo, goldMat, innerArchCoords.length * 2);

  innerArchCoords.forEach(([ax, az, ry], idx) => {
    _dummy.position.set(ax, 0, az);
    _dummy.rotation.set(0, ry, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    groundArchInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(ax, 6.2, az);
    _dummy.updateMatrix();
    upperArchInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(ax, 6.18, az);
    _dummy.updateMatrix();
    archCorniceInst.setMatrixAt(idx * 2, _dummy.matrix);

    _dummy.position.set(ax, HARAM_DIMENSIONS.riwaqHeight + 0.25, az);
    _dummy.updateMatrix();
    archCorniceInst.setMatrixAt(idx * 2 + 1, _dummy.matrix);
  });
  [groundArchInst, upperArchInst, archCorniceInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    matafGroup.add(inst);
  });

  // Middle Arcade Ring (r = 52.5) for authentic multi-aisle interior architectural depth
  const midArchCoords: Array<[number, number, number]> = [];
  const midRingCount = 54;
  for (let i = 0; i < midRingCount; i++) {
    const ang = ((i + 0.5) / midRingCount) * Math.PI * 2;
    if (Math.abs(ang) < 0.52 || Math.abs(ang + Math.PI / 2) < 0.44) continue;
    if (isNearGateAngle(ang, 0.06)) continue;
    midArchCoords.push([Math.cos(ang) * 52.5, Math.sin(ang) * 52.5, -ang + Math.PI / 2]);
  }
  const midGroundArchGeo = createPointedArchBayGeometry(6.15, 6.2, 4.45, 3.4, 5.4, 0.85);
  const midUpperArchGeo = createPointedArchBayGeometry(6.15, 5.5, 4.2, 2.8, 4.7, 0.8);
  const midGroundArchInst = new THREE.InstancedMesh(midGroundArchGeo, stoneMat, midArchCoords.length);
  const midUpperArchInst = new THREE.InstancedMesh(midUpperArchGeo, stoneMat, midArchCoords.length);
  midArchCoords.forEach(([ax, az, ry], idx) => {
    _dummy.position.set(ax, 0, az);
    _dummy.rotation.set(0, ry, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    midGroundArchInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(ax, 6.2, az);
    _dummy.updateMatrix();
    midUpperArchInst.setMatrixAt(idx, _dummy.matrix);
  });
  midGroundArchInst.instanceMatrix.needsUpdate = true;
  midUpperArchInst.instanceMatrix.needsUpdate = true;
  midGroundArchInst.computeBoundingSphere();
  midUpperArchInst.computeBoundingSphere();
  matafGroup.add(midGroundArchInst, midUpperArchInst);

  // 2nd-Floor Mezzanine Slab & Balustrade inside Riwaq (y = 6.2)
  const mezzFloorShape = new THREE.Shape();
  mezzFloorShape.absarc(0, 0, 61.5, -0.45, Math.PI * 1.42, false);
  mezzFloorShape.absarc(0, 0, 44.6, Math.PI * 1.42, -0.45, true);
  mezzFloorShape.closePath();
  const mezzFloorGeo = track(new THREE.ExtrudeGeometry(mezzFloorShape, { depth: 0.45, bevelEnabled: false }));
  mezzFloorGeo.rotateX(Math.PI / 2);
  const mezzFloor = new THREE.Mesh(mezzFloorGeo, whiteMarbleMat);
  mezzFloor.position.y = 6.2;
  roofMeshes.push(mezzFloor);
  matafGroup.add(mezzFloor);

  // Mezzanine Inner Balustrade Railing & Roof Parapet Railing facing Mataf
  const mezzRailGeo = track(new THREE.TorusGeometry(44.6, 0.24, 6, 64, Math.PI * 1.72));
  const mezzRail = new THREE.Mesh(mezzRailGeo, whiteMarbleMat);
  mezzRail.rotation.x = Math.PI / 2;
  mezzRail.rotation.z = 0.45;
  mezzRail.position.y = 7.05;
  matafGroup.add(mezzRail);

  const roofInnerParapet = new THREE.Mesh(
    track(new THREE.TorusGeometry(42.4, 0.32, 6, 64, Math.PI * 1.72)),
    whiteMarbleMat
  );
  roofInnerParapet.rotation.x = Math.PI / 2;
  roofInnerParapet.rotation.z = 0.45;
  roofInnerParapet.position.y = HARAM_DIMENSIONS.riwaqHeight + 0.9;
  matafGroup.add(roofInnerParapet);

  // COMPLETE CONTINUOUS OUTER RIWAQ PERIMETER WALL (r = 62.5) — EXACT FLUSH ARCS BETWEEN EVERY GATE & CORNER
  const wallBayCoords: Array<[number, number, number, number]> = [];
  const addWallArc = (startAng: number, endAng: number) => {
    const span = endAng - startAng;
    if (span <= 0.008) return;
    const bayCount = Math.max(1, Math.ceil((span * 62.5) / 4.8));
    const step = span / bayCount;
    for (let k = 0; k < bayCount; k++) {
      const a = startAng + (k + 0.5) * step;
      const bayWidth = step * 62.5 + 0.45;
      wallBayCoords.push([Math.cos(a) * 62.5, Math.sin(a) * 62.5, -a + Math.PI / 2, bayWidth]);
    }
  };

  // Angles [0..2π) around Kaaba: SE corner -> Gate 5 -> Gate 1 -> Gate 88 -> Fahd South -> Fahd North -> Gate 70 -> Gate 62 -> NW/North -> Gate 45 -> NE
  const g5Ang = Math.atan2(59, 26); // 1.156
  const g1Ang = Math.atan2(63, -10); // 1.728
  const g88Ang = Math.atan2(49, -41.5); // 2.273
  const g70Ang = Math.atan2(-6, -63.5) + Math.PI * 2; // 3.236
  const g62Ang = Math.atan2(-34, -54) + Math.PI * 2; // 3.703
  const g45Ang = Math.PI * 1.5; // 4.7124
  const angSeCorner = Math.atan2(50.37, 37); // 0.937
  const angNwCorner = Math.atan2(-54.2, -31) + Math.PI * 2; // 4.193
  const angNeCorner = Math.atan2(-54.2, 31) + Math.PI * 2; // 5.232
  const angG53Path = Math.atan2(-60, -39) + Math.PI * 2; // 4.136

  addWallArc(angSeCorner, g5Ang - 0.068);
  addWallArc(g5Ang + 0.068, g1Ang - 0.068);
  addWallArc(g1Ang + 0.068, g88Ang - 0.068);
  // Fahd North end (z = -1, x = -62.5 => ang = 3.158) -> Gate 70 -> Gate 62 -> NW connWall
  addWallArc(3.152, g70Ang - 0.040);
  addWallArc(g70Ang + 0.040, g62Ang - 0.068);
  addWallArc(g62Ang + 0.068, angG53Path - 0.048);
  // North Riwaq flanking Bab Al-Fath (Gate 45) seamlessly between x = -31 and x = +31
  addWallArc(angNwCorner, g45Ang - 0.068);
  addWallArc(g45Ang + 0.068, angNeCorner);

  const baseBayW = 5.3;
  const wallBodyGeo = track(new THREE.BoxGeometry(baseBayW, HARAM_DIMENSIONS.riwaqHeight + 0.6, 1.35));
  const wallDadoGeo = track(new THREE.BoxGeometry(baseBayW + 0.05, 2.2, 1.5));
  const wallWinGeo = track(new THREE.BoxGeometry(3.2, 6.2, 1.46));
  const wallWinFrameGeo = track(new THREE.BoxGeometry(3.56, 6.55, 1.38));
  const wallWinSillGeo = track(new THREE.BoxGeometry(3.76, 0.28, 1.72));
  const wallMerlonGeo = track(new THREE.BoxGeometry(1.1, 1.15, 0.85));

  const wallBodyInst = new THREE.InstancedMesh(wallBodyGeo, stoneMat, wallBayCoords.length);
  const wallDadoInst = new THREE.InstancedMesh(wallDadoGeo, warmGraniteMat, wallBayCoords.length);
  const wallWinInst = new THREE.InstancedMesh(wallWinGeo, mashrabiyaMat, wallBayCoords.length);
  const wallWinFrameInst = new THREE.InstancedMesh(wallWinFrameGeo, whiteMarbleMat, wallBayCoords.length);
  const wallWinSillInst = new THREE.InstancedMesh(wallWinSillGeo, goldMat, wallBayCoords.length);
  const wallMerlonInst = new THREE.InstancedMesh(wallMerlonGeo, whiteMarbleMat, wallBayCoords.length * 3);

  wallBayCoords.forEach(([wx, wz, ry, bayW], idx) => {
    const sx = bayW / baseBayW;
    _dummy.position.set(wx, (HARAM_DIMENSIONS.riwaqHeight + 0.6) / 2, wz);
    _dummy.rotation.set(0, ry, 0);
    _dummy.scale.set(sx, 1, 1);
    _dummy.updateMatrix();
    wallBodyInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(wx, 1.1, wz);
    _dummy.updateMatrix();
    wallDadoInst.setMatrixAt(idx, _dummy.matrix);

    const winScale = Math.min(1.15, sx);
    _dummy.position.set(wx, 6.4, wz);
    _dummy.scale.set(winScale, 1, 1);
    _dummy.updateMatrix();
    wallWinInst.setMatrixAt(idx, _dummy.matrix);
    wallWinFrameInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(wx, 3.2, wz);
    _dummy.updateMatrix();
    wallWinSillInst.setMatrixAt(idx, _dummy.matrix);

    // 3 crenellated parapet merlons crowning each wall bay
    _dummy.scale.set(1, 1, 1);
    for (let m = -1; m <= 1; m++) {
      const tx = wx + Math.cos(ry) * (m * bayW * 0.31);
      const tz = wz - Math.sin(ry) * (m * bayW * 0.31);
      _dummy.position.set(tx, HARAM_DIMENSIONS.riwaqHeight + 1.15, tz);
      _dummy.updateMatrix();
      wallMerlonInst.setMatrixAt(idx * 3 + (m + 1), _dummy.matrix);
    }
  });
  [wallBodyInst, wallDadoInst, wallWinInst, wallWinFrameInst, wallWinSillInst, wallMerlonInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    matafGroup.add(inst);
  });

  // Hanging Golden Chandeliers inside Riwaq Colonnades
  const chandelierCoords: Array<[number, number, number]> = [];
  for (let i = 0; i < 28; i++) {
    const ang = (i / 28) * Math.PI * 2;
    if (Math.abs(ang) < 0.5 || Math.abs(ang + Math.PI / 2) < 0.44) continue;
    chandelierCoords.push([Math.cos(ang) * 47.5, 4.6, Math.sin(ang) * 47.5]);
  }
  const chandRingGeo = track(new THREE.TorusGeometry(1.1, 0.12, 6, 16));
  const chandCoreGeo = track(new THREE.SphereGeometry(0.42, 8, 8));
  const chandRingInst = new THREE.InstancedMesh(chandRingGeo, goldMat, chandelierCoords.length);
  const chandCoreInst = new THREE.InstancedMesh(chandCoreGeo, lampGlowMat, chandelierCoords.length);
  chandelierCoords.forEach(([cx, cy, cz], idx) => {
    _dummy.position.set(cx, cy, cz);
    _dummy.rotation.set(Math.PI / 2, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    chandRingInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(cx, cy + 0.15, cz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.updateMatrix();
    chandCoreInst.setMatrixAt(idx, _dummy.matrix);
  });
  chandRingInst.instanceMatrix.needsUpdate = true;
  chandCoreInst.instanceMatrix.needsUpdate = true;
  chandRingInst.computeBoundingSphere();
  chandCoreInst.computeBoundingSphere();
  matafGroup.add(chandRingInst, chandCoreInst);

  // Riwaq Roof Ring & Ottoman Domes (can be toggled semi-transparent to see inside)
  const riwaqRoofShape = new THREE.Shape();
  riwaqRoofShape.absarc(0, 0, HARAM_DIMENSIONS.riwaqOuterRadius + 0.5, -0.48, Math.PI * 1.44, false);
  riwaqRoofShape.absarc(0, 0, HARAM_DIMENSIONS.riwaqInnerRadius - 1, Math.PI * 1.44, -0.48, true);
  riwaqRoofShape.closePath();

  const riwaqRoofGeo = track(
    new THREE.ExtrudeGeometry(riwaqRoofShape, {
      depth: 1.4,
      bevelEnabled: false,
    })
  );
  riwaqRoofGeo.rotateX(Math.PI / 2);
  const riwaqRoof = new THREE.Mesh(riwaqRoofGeo, roofMatStandard);
  riwaqRoof.position.y = HARAM_DIMENSIONS.riwaqHeight + 0.4;
  roofMeshes.push(riwaqRoof);
  matafGroup.add(riwaqRoof);

  // North-East Riwaq Roof Segment (between Expansion & Mas'a)
  const neRoofGeo = track(
    new THREE.RingGeometry(
      HARAM_DIMENSIONS.riwaqInnerRadius - 1,
      HARAM_DIMENSIONS.riwaqOuterRadius + 0.5,
      20,
      1,
      Math.PI * 0.22,
      Math.PI * 0.25
    )
  );
  const neRoof = new THREE.Mesh(neRoofGeo, roofMatStandard);
  neRoof.rotation.x = -Math.PI / 2;
  neRoof.position.y = HARAM_DIMENSIONS.riwaqHeight + 0.2;
  roofMeshes.push(neRoof);
  matafGroup.add(neRoof);

  // Ottoman Domes Ring above the Riwaq Roof (InstancedMesh)
  const ottomanDomeGeo = track(new THREE.SphereGeometry(2.35, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2));
  const domeCoords: Array<[number, number]> = [];
  for (let i = 0; i < 42; i++) {
    const ang = (i / 42) * Math.PI * 2;
    if (Math.abs(ang) < 0.45 || Math.abs(ang + Math.PI / 2) < 0.42) continue;
    domeCoords.push([Math.cos(ang) * 51, Math.sin(ang) * 51]);
  }
  const domesInst = new THREE.InstancedMesh(ottomanDomeGeo, domeMat, domeCoords.length);
  domeCoords.forEach(([dx, dz], idx) => {
    _dummy.position.set(dx, HARAM_DIMENSIONS.riwaqHeight + 0.45, dz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 0.85, 1);
    _dummy.updateMatrix();
    domesInst.setMatrixAt(idx, _dummy.matrix);
  });
  domesInst.instanceMatrix.needsUpdate = true;
  domesInst.computeBoundingSphere();
  matafGroup.add(domesInst);

  // =========================================================================
  // 4B. SOLID WING EXTENSIONS (KING FAHD WEST WING & NE/SE TRANSITION GALLERIES)
  // =========================================================================
  // King Fahd West-Southwest Expansion Wing (solid enclosed prayer hall behind Gate 79)
  const fahdWingGroup = new THREE.Group();
  root.add(fahdWingGroup);

  const fahdFloor = new THREE.Mesh(track(new THREE.BoxGeometry(24, 0.14, 46)), carpetMat);
  fahdFloor.position.set(-66, 0.08, 22);
  const fahdRoof = new THREE.Mesh(track(new THREE.BoxGeometry(24, 1.4, 46)), roofMatStandard);
  fahdRoof.position.set(-66, 13.6, 22);
  roofMeshes.push(fahdRoof);
  fahdWingGroup.add(fahdFloor, fahdRoof);

  // Outer West Wall of King Fahd Wing (leaving portal gap at Gate 79 z = 24, x = -78.5)
  [
    { z: 8.5, d: 21 },
    { z: 37.5, d: 17 },
  ].forEach(({ z, d }) => {
    const seg = new THREE.Mesh(track(new THREE.BoxGeometry(1.5, 13.6, d)), stoneMat);
    seg.position.set(-78, 6.8, z);
    const win = new THREE.Mesh(track(new THREE.BoxGeometry(1.62, 6.8, d * 0.65)), mashrabiyaMat);
    win.position.set(-78, 7.2, z);
    const winFrame = new THREE.Mesh(track(new THREE.BoxGeometry(1.56, 7.2, d * 0.68)), whiteMarbleMat);
    winFrame.position.set(-78, 7.2, z);
    const winSill = new THREE.Mesh(track(new THREE.BoxGeometry(1.88, 0.28, d * 0.7)), goldMat);
    winSill.position.set(-78, 3.65, z);
    const dado = new THREE.Mesh(track(new THREE.BoxGeometry(1.68, 2.2, d + 0.1)), warmGraniteMat);
    dado.position.set(-78, 1.1, z);
    fahdWingGroup.add(seg, win, winFrame, winSill, dado);
  });
  // Interior Marble Columns & Zamzam Stations inside King Fahd Wing (clear of Gate 79 z = 24 axis)
  [-62, -71].forEach((fx) => {
    [7, 16, 32, 40].forEach((fz) => {
      const fBase = new THREE.Mesh(track(new THREE.BoxGeometry(1.5, 0.6, 1.5)), whiteMarbleMat);
      fBase.position.set(fx, 0.3, fz);
      const fShaft = new THREE.Mesh(track(new THREE.CylinderGeometry(0.5, 0.58, 12.2, 10)), stoneMat);
      fShaft.position.set(fx, 6.6, fz);
      const fCap = new THREE.Mesh(track(new THREE.CylinderGeometry(0.85, 0.52, 0.8, 8)), goldMat);
      fCap.position.set(fx, 12.9, fz);
      fahdWingGroup.add(fBase, fShaft, fCap);
    });
  });
  colmanRacks.push(
    { x: -76.2, z: 7.5, rotY: Math.PI / 2, barrels: 4 },
    { x: -76.2, z: 39.5, rotY: Math.PI / 2, barrels: 4 }
  );
  drinkingFountains.push(
    { x: -76.2, z: 13.5, rotY: Math.PI / 2, taps: 4 },
    { x: -76.2, z: 34.5, rotY: Math.PI / 2, taps: 4 }
  );
  // North & South End Walls of King Fahd Wing (extending seamlessly into circular Riwaq & Bab Ibrahim)
  [
    { wz: -1, cx: -66, w: 24 },
    { wz: 45, cx: -60, w: 36 },
  ].forEach(({ wz, cx, w }) => {
    const endW = new THREE.Mesh(track(new THREE.BoxGeometry(w, 13.6, 1.5)), stoneMat);
    endW.position.set(cx, 6.8, wz);
    const endWin = new THREE.Mesh(track(new THREE.BoxGeometry(w * 0.65, 6.4, 1.62)), mashrabiyaMat);
    endWin.position.set(cx, 7.2, wz);
    const endDado = new THREE.Mesh(track(new THREE.BoxGeometry(w + 0.1, 2.2, 1.68)), warmGraniteMat);
    endDado.position.set(cx, 1.1, wz);
    fahdWingGroup.add(endW, endWin, endDado);
  });
  // Twin Iconic Domes crowning King Fahd Wing
  [10, 34].forEach((dz) => {
    const fDome = new THREE.Mesh(
      track(new THREE.SphereGeometry(6.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
      domeMat
    );
    fDome.position.set(-66, 14.2, dz);
    const fSpire = new THREE.Mesh(track(new THREE.ConeGeometry(0.28, 2.2, 8)), goldMat);
    fSpire.position.set(-66, 21.8, dz);
    fahdWingGroup.add(fDome, fSpire);
  });

  // Seamless South-East Corner Transition Gallery (x = 37..63, z = 40..57.8) — solid walls flanking Bab Ismail (gate-8) & connecting to Bab Al-Safa (gate-13) and circular Riwaq
  const seFloor = new THREE.Mesh(track(new THREE.BoxGeometry(22, 0.14, 18)), carpetMat);
  seFloor.position.set(48, 0.08, 49);
  const seRoof = new THREE.Mesh(track(new THREE.BoxGeometry(22, 1.3, 16.4)), roofMatStandard);
  seRoof.position.set(48, HARAM_DIMENSIONS.riwaqHeight + 0.4, 48.2);
  roofMeshes.push(seRoof);
  fahdWingGroup.add(seFloor, seRoof);

  [
    { x: 39.2, w: 4.8 },
    { x: 56.75, w: 13.1 },
  ].forEach(({ x, w }) => {
    const seWall = new THREE.Mesh(track(new THREE.BoxGeometry(w, HARAM_DIMENSIONS.riwaqHeight + 0.4, 1.3)), stoneMat);
    seWall.position.set(x, (HARAM_DIMENSIONS.riwaqHeight + 0.4) / 2, 57.8);
    const seWin = new THREE.Mesh(track(new THREE.BoxGeometry(w * 0.58, 6.2, 1.42)), mashrabiyaMat);
    seWin.position.set(x, 6.4, 57.8);
    const seDado = new THREE.Mesh(track(new THREE.BoxGeometry(w + 0.1, 2.2, 1.48)), warmGraniteMat);
    seDado.position.set(x, 1.1, 57.8);
    fahdWingGroup.add(seWall, seWin, seDado);
  });

  // SE Corner West-Closing Return Wall connecting x = 37.0 (seWall) directly into circular Riwaq (z = 50.0)
  const seReturnWall = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.3, HARAM_DIMENSIONS.riwaqHeight + 0.4, 8.6)),
    stoneMat
  );
  seReturnWall.position.set(37.0, (HARAM_DIMENSIONS.riwaqHeight + 0.4) / 2, 54.1);
  const seReturnWin = new THREE.Mesh(track(new THREE.BoxGeometry(1.42, 6.2, 4.8)), mashrabiyaMat);
  seReturnWin.position.set(37.0, 6.4, 54.1);
  const seReturnDado = new THREE.Mesh(track(new THREE.BoxGeometry(1.48, 2.2, 8.7)), warmGraniteMat);
  seReturnDado.position.set(37.0, 1.1, 54.1);
  fahdWingGroup.add(seReturnWall, seReturnWin, seReturnDado);

  // Seamless North-East Corner Transition Gallery (x = 37..59, z = -59.5..-41) — clear behind Bab Al-Mudda'a (gate-40 at x = 42, z = -60)
  const neCornerFloor = new THREE.Mesh(track(new THREE.BoxGeometry(22, 0.14, 18.5)), carpetMat);
  neCornerFloor.position.set(48, 0.08, -50.25);
  const neCornerRoof = new THREE.Mesh(track(new THREE.BoxGeometry(22, 1.3, 17.5)), roofMatStandard);
  neCornerRoof.position.set(48, HARAM_DIMENSIONS.riwaqHeight + 0.4, -49.75);
  roofMeshes.push(neCornerRoof);
  fahdWingGroup.add(neCornerFloor, neCornerRoof);

  // =========================================================================
  // 5. AL-MAS'A GALLERY (SAFA & MARWAH — FULL INTERIOR & EXTERIOR ARCHITECTURE)
  // =========================================================================
  const masaGroup = new THREE.Group();
  const masaOverheadMeshes: THREE.Object3D[] = [];
  root.add(masaGroup);

  const masaX = HARAM_DIMENSIONS.masaX;
  const masaW = HARAM_DIMENSIONS.masaWidth + 1.5; // 17.5m
  const masaRoofY = 14.5;

  // Polished dual-track corridor floor connecting Safa (+Z) to Marwah (-Z)
  const masaFloor = new THREE.Mesh(
    track(new THREE.BoxGeometry(masaW, 0.14, 164)),
    masaFloorMat
  );
  masaFloor.position.set(masaX, 0.08, 0);
  masaFloor.receiveShadow = !isSoftwareGl;
  masaGroup.add(masaFloor);

  // Central Raised Marble & Brass Track Divider (split around z = 0 for Bab Al-Salam crossing)
  const centerDividerGeo = track(new THREE.BoxGeometry(0.7, 0.55, 51));
  const centerRailGeo = track(new THREE.BoxGeometry(0.22, 0.18, 51));
  [-31.5, 31.5].forEach((dz) => {
    const divSeg = new THREE.Mesh(centerDividerGeo, whiteMarbleMat);
    divSeg.position.set(masaX, 0.35, dz);
    const railSeg = new THREE.Mesh(centerRailGeo, goldMat);
    railSeg.position.set(masaX, 0.85, dz);
    masaGroup.add(divSeg, railSeg);
  });

  // Complete East Outer Wall of Al-Mas'a (x = 76.6) — exact solid masonry spans between all East gates & corners
  [
    { z: -55.7, d: 50.2 },
    { z: -15.0, d: 21.2 },
    { z: 15.0, d: 21.2 },
    { z: 55.7, d: 50.2 },
  ].forEach(({ z, d }) => {
    const fullBay = new THREE.Mesh(track(new THREE.BoxGeometry(1.3, masaRoofY, d)), stoneMat);
    fullBay.position.set(masaX + 8.6, masaRoofY / 2, z);
    const winBay = new THREE.Mesh(track(new THREE.BoxGeometry(1.42, 6.4, d * 0.65)), mashrabiyaMat);
    winBay.position.set(masaX + 8.6, 7.6, z);
    const dado = new THREE.Mesh(track(new THREE.BoxGeometry(1.45, 2.1, d + 0.1)), warmGraniteMat);
    dado.position.set(masaX + 8.6, 1.05, z);
    masaGroup.add(fullBay, winBay, dado);
  });
  // Upper stone header above minor East gates (gate-22 & gate-15)
  [-28, 28].forEach((gz) => {
    const topWall = new THREE.Mesh(track(new THREE.BoxGeometry(1.3, 1.8, 5.4)), stoneMat);
    topWall.position.set(masaX + 8.6, 13.6, gz);
    masaGroup.add(topWall);
  });

  // West Inner Wall / Pointed Arch Colonnade of Al-Mas'a (x = 59.4) — seamlessly joins Riwaq & encloses extended Safa/Marwah wings
  const masaArchBayGeo = createPointedArchBayGeometry(5.92, 6.8, 4.3, 3.6, 5.9, 0.95);
  const masaUpperArchGeo = createPointedArchBayGeometry(5.92, masaRoofY - 6.8, 4.1, 3.5, 6.4, 0.95);
  for (let i = 0; i < 27; i++) {
    const z = -76.96 + i * 5.92;
    const isWidePassage = Math.abs(z) < 8 || Math.abs(z - 40) < 6.5 || Math.abs(z + 40) < 6.5;
    if (!isWidePassage) {
      const lowerArch = new THREE.Mesh(masaArchBayGeo, stoneMat);
      lowerArch.rotation.y = Math.PI / 2;
      lowerArch.position.set(masaX - 8.6, 0, z);
      const upperScreen = new THREE.Mesh(
        track(new THREE.BoxGeometry(1.05, 5.8, 5.6)),
        mashrabiyaMat
      );
      upperScreen.position.set(masaX - 8.6, 10.2, z);
      masaGroup.add(lowerArch, upperScreen);
    }
    const upperArch = new THREE.Mesh(masaUpperArchGeo, stoneMat);
    upperArch.rotation.y = Math.PI / 2;
    upperArch.position.set(masaX - 8.6, 6.8, z);
    masaGroup.add(upperArch);
  }

  // South-East & North-East End Walls flanking Safa (gate-13) and Marwah (gate-25) portals seamlessly
  [
    { z: 80.8, label: 'safa' },
    { z: -80.8, label: 'marwah' },
  ].forEach(({ z }) => {
    const sideL = new THREE.Mesh(track(new THREE.BoxGeometry(4.4, masaRoofY, 1.6)), stoneMat);
    sideL.position.set(masaX - 6.9, masaRoofY / 2, z);
    const sideR = new THREE.Mesh(track(new THREE.BoxGeometry(4.4, masaRoofY, 1.6)), stoneMat);
    sideR.position.set(masaX + 6.9, masaRoofY / 2, z);
    const sideLDado = new THREE.Mesh(track(new THREE.BoxGeometry(4.5, 2.2, 1.72)), warmGraniteMat);
    sideLDado.position.set(masaX - 6.9, 1.1, z);
    const sideRDado = new THREE.Mesh(track(new THREE.BoxGeometry(4.5, 2.2, 1.72)), warmGraniteMat);
    sideRDado.position.set(masaX + 6.9, 1.1, z);
    masaGroup.add(sideL, sideR, sideLDado, sideRDado);
  });

  // Interior Colonade Pillars & Pointed Arches along both sides of Al-Mas'a (with plinths, brass collars & golden capitals)
  const masaPillarBaseGeo = track(new THREE.BoxGeometry(1.38, 0.55, 1.38));
  const masaPillarGeo = track(new THREE.CylinderGeometry(0.46, 0.55, masaRoofY - 1.8, 12));
  const masaPillarNeckGeo = track(new THREE.TorusGeometry(0.5, 0.06, 6, 12));
  const masaPillarCapGeo = track(new THREE.CylinderGeometry(0.78, 0.48, 0.72, 8));

  const masaPillarBaseInst = new THREE.InstancedMesh(masaPillarBaseGeo, warmGraniteMat, 54);
  const masaPillarInst = new THREE.InstancedMesh(masaPillarGeo, whiteMarbleMat, 54);
  const masaPillarNeckInst = new THREE.InstancedMesh(masaPillarNeckGeo, goldMat, 54);
  const masaPillarCapInst = new THREE.InstancedMesh(masaPillarCapGeo, goldMat, 54);
  for (let i = 0; i < 27; i++) {
    const pz = -76.96 + i * 5.92;
    [masaX - 7.8, masaX + 7.8].forEach((px, sideIdx) => {
      const idx = i * 2 + sideIdx;
      _dummy.position.set(px, 0.275, pz);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      masaPillarBaseInst.setMatrixAt(idx, _dummy.matrix);

      _dummy.position.set(px, (masaRoofY - 1.0) / 2 + 0.35, pz);
      _dummy.updateMatrix();
      masaPillarInst.setMatrixAt(idx, _dummy.matrix);

      _dummy.position.set(px, masaRoofY - 1.25, pz);
      _dummy.rotation.set(Math.PI / 2, 0, 0);
      _dummy.updateMatrix();
      masaPillarNeckInst.setMatrixAt(idx, _dummy.matrix);

      _dummy.position.set(px, masaRoofY - 0.85, pz);
      _dummy.rotation.set(0, 0, 0);
      _dummy.updateMatrix();
      masaPillarCapInst.setMatrixAt(idx, _dummy.matrix);
    });
  }
  [masaPillarBaseInst, masaPillarInst, masaPillarNeckInst, masaPillarCapInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    masaGroup.add(inst);
  });

  // Continuous Pointed Arch Arcade along East inner side of Mas'a (x = 75.6)
  const eastInteriorArchInst = new THREE.InstancedMesh(masaUpperArchGeo, stoneMat, 26);
  for (let i = 0; i < 26; i++) {
    const az = -75 + i * 6.0;
    _dummy.position.set(masaX + 7.6, 6.8, az);
    _dummy.rotation.set(0, Math.PI / 2, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    eastInteriorArchInst.setMatrixAt(i, _dummy.matrix);
  }
  eastInteriorArchInst.instanceMatrix.needsUpdate = true;
  eastInteriorArchInst.computeBoundingSphere();
  masaGroup.add(eastInteriorArchInst);

  // 2nd Floor Mezzanine Balconies & Balustrades inside Al-Mas'a (y = 6.8)
  [-6.8, 6.8].forEach((offsetX) => {
    const balconySlab = new THREE.Mesh(track(new THREE.BoxGeometry(2.8, 0.45, 150)), stoneMat);
    balconySlab.position.set(masaX + offsetX, 6.8, 0);
    const balconyRail = new THREE.Mesh(track(new THREE.BoxGeometry(0.28, 0.95, 150)), whiteMarbleMat);
    balconyRail.position.set(masaX + (offsetX > 0 ? offsetX - 1.3 : offsetX + 1.3), 7.5, 0);
    const goldRailTop = new THREE.Mesh(track(new THREE.BoxGeometry(0.32, 0.14, 150)), goldMat);
    goldRailTop.position.set(masaX + (offsetX > 0 ? offsetX - 1.3 : offsetX + 1.3), 8.02, 0);
    masaOverheadMeshes.push(balconySlab, balconyRail, goldRailTop);
    masaGroup.add(balconySlab, balconyRail, goldRailTop);
  });

  // High Vaulted Mas'a Roof (cutaway-capable, flush within perimeter walls so no portal is clipped)
  const masaRoof = new THREE.Mesh(
    track(new THREE.BoxGeometry(masaW + 0.6, 1.1, 161.6)),
    roofMatAccent
  );
  masaRoof.position.set(masaX, masaRoofY + 0.55, 0);
  roofMeshes.push(masaRoof);
  masaOverheadMeshes.push(masaRoof);
  masaGroup.add(masaRoof);

  // Transverse Coffered Ceiling Beams & Hanging Chandeliers inside Al-Mas'a
  const masaRibGeo = track(new THREE.BoxGeometry(masaW - 0.6, 0.75, 0.65));
  const masaChandGeo = track(new THREE.TorusGeometry(1.25, 0.14, 6, 16));
  const masaBulbGeo = track(new THREE.SphereGeometry(0.45, 8, 8));
  for (let z = -66; z <= 66; z += 11) {
    const rib = new THREE.Mesh(masaRibGeo, stoneMat);
    rib.position.set(masaX, masaRoofY - 0.3, z);
    const chand = new THREE.Mesh(masaChandGeo, goldMat);
    chand.rotation.x = Math.PI / 2;
    chand.position.set(masaX, masaRoofY - 2.3, z);
    const bulb = new THREE.Mesh(masaBulbGeo, lampGlowMat);
    bulb.position.set(masaX, masaRoofY - 2.1, z);
    masaOverheadMeshes.push(rib, chand, bulb);
    masaGroup.add(rib, chand, bulb);
  }

  // Al-Milayn Al-Akhdarayn (Prominent Green-Lit Harwalah Acceleration Zone in the FIRST HALF of Al-Mas'a near Safa, z = +12.5..+37.5)
  [12.5, 25.0, 37.5].forEach((gz) => {
    const greenArchTop = new THREE.Mesh(
      track(new THREE.BoxGeometry(masaW - 1.2, 0.75, 0.9)),
      greenMasaMat
    );
    greenArchTop.position.set(masaX, 11.8, gz);
    const greenColL = new THREE.Mesh(track(new THREE.BoxGeometry(0.55, 11.4, 0.7)), greenMasaMat);
    greenColL.position.set(masaX - 7.8, 5.7, gz);
    const greenColR = new THREE.Mesh(track(new THREE.BoxGeometry(0.55, 11.4, 0.7)), greenMasaMat);
    greenColR.position.set(masaX + 7.8, 5.7, gz);
    masaGroup.add(greenArchTop, greenColL, greenColR);
  });
  const harwalahFloorMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x065f46,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 0.42,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.72,
    })
  );
  const harwalahFloorZone = new THREE.Mesh(
    track(new THREE.BoxGeometry(masaW - 2.0, 0.03, 25.0)),
    harwalahFloorMat
  );
  harwalahFloorZone.position.set(masaX, 0.155, 25.0);
  const greenBorderL = new THREE.Mesh(track(new THREE.BoxGeometry(masaW - 1.8, 0.05, 0.45)), greenMasaMat);
  greenBorderL.position.set(masaX, 0.17, 37.5);
  const greenBorderR = new THREE.Mesh(track(new THREE.BoxGeometry(masaW - 1.8, 0.05, 0.45)), greenMasaMat);
  greenBorderR.position.set(masaX, 0.17, 12.5);
  const greenFloorStripL = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 0.05, 25.4)), greenMasaMat);
  greenFloorStripL.position.set(masaX - 7.1, 0.17, 25.0);
  const greenFloorStripR = new THREE.Mesh(track(new THREE.BoxGeometry(0.4, 0.05, 25.4)), greenMasaMat);
  greenFloorStripR.position.set(masaX + 7.1, 0.17, 25.0);
  masaGroup.add(harwalahFloorZone, greenBorderL, greenBorderR, greenFloorStripL, greenFloorStripR);

  // Zamzam Water Cooler Stations (كولمنات زمزم) & Drinking Water Fountains (حنفيات المياه) along BOTH sides of Al-Mas'a
  // Tucked cleanly at x = masaX ± 7.35 (outside all 7 Sa'i lanes [62.7..73.85], avoiding East gates & green arches)
  [-56, -20, 18.5, 50.5].forEach((cz) => {
    colmanRacks.push({ x: masaX - 7.35, z: cz, rotY: Math.PI / 2, barrels: 4 });
  });
  [-50, -14, 31.5, 56.5].forEach((fz) => {
    drinkingFountains.push({ x: masaX - 7.35, z: fz, rotY: Math.PI / 2, taps: 4 });
  });
  [-56, -40, -16, 18.5, 50.5].forEach((cz) => {
    colmanRacks.push({ x: masaX + 7.35, z: cz, rotY: -Math.PI / 2, barrels: 4 });
  });
  [-50, -20, 31.5, 56.5].forEach((fz) => {
    drinkingFountains.push({ x: masaX + 7.35, z: fz, rotY: -Math.PI / 2, taps: 4 });
  });

  // Mount Safa (+Z = 46) & Mount Marwah (-Z = -46) — Rich Interior Viewing Galleries + Domes
  const createSafaMarwahMount = (zPos: number, isSafa: boolean) => {
    const g = new THREE.Group();
    g.position.set(masaX, 0, zPos);

    // Multi-tier marble terrace base
    const terrace1 = new THREE.Mesh(track(new THREE.CylinderGeometry(7.8, 8.3, 0.45, 24)), whiteMarbleMat);
    terrace1.position.y = 0.22;
    const terrace2 = new THREE.Mesh(track(new THREE.CylinderGeometry(6.2, 6.7, 0.45, 24)), whiteMarbleMat);
    terrace2.position.y = 0.65;

    // Multi-layered Makkah granite rock outcrop
    const rock1 = new THREE.Mesh(track(new THREE.DodecahedronGeometry(3.8, 1)), rockMat);
    rock1.scale.set(1.35, 0.56, 0.95);
    rock1.position.set(0, 1.55, isSafa ? 0.8 : -0.8);

    const rock2 = new THREE.Mesh(track(new THREE.DodecahedronGeometry(2.6, 1)), rockMat);
    rock2.scale.set(1.1, 0.65, 0.95);
    rock2.position.set(-1.6, 2.05, isSafa ? 1.5 : -1.5);

    const rock3 = new THREE.Mesh(track(new THREE.DodecahedronGeometry(2.2, 1)), rockMat);
    rock3.scale.set(1.2, 0.6, 0.9);
    rock3.position.set(1.7, 1.85, isSafa ? 1.2 : -1.2);

    // Curved Marble & Gold Viewing Balustrade facing the corridor
    const railArc = new THREE.Mesh(
      track(new THREE.TorusGeometry(6.4, 0.18, 6, 20, Math.PI)),
      whiteMarbleMat
    );
    railArc.rotation.x = Math.PI / 2;
    railArc.rotation.z = isSafa ? Math.PI : 0;
    railArc.position.y = 1.65;

    const railGoldCap = new THREE.Mesh(
      track(new THREE.TorusGeometry(6.4, 0.1, 6, 20, Math.PI)),
      goldMat
    );
    railGoldCap.rotation.x = Math.PI / 2;
    railGoldCap.rotation.z = isSafa ? Math.PI : 0;
    railGoldCap.position.y = 1.82;

    // Illuminated Arabic Signage Plaque facing inward along the Mas'a corridor
    const plaqueMat = track(
      new THREE.MeshStandardMaterial({
        map: isSafa ? safaPlaqueTex : marwahPlaqueTex,
        emissive: new THREE.Color(0x0d4f3c),
        emissiveIntensity: 0.45,
        roughness: 0.35,
      })
    );
    const plaqueMesh = new THREE.Mesh(track(new THREE.BoxGeometry(8.4, 2.8, 0.32)), plaqueMat);
    plaqueMesh.position.set(0, 7.2, isSafa ? -5.8 : 5.8);
    if (!isSafa) plaqueMesh.rotation.y = Math.PI;

    // Grand Dome & Skylight Drum above Safa / Marwah
    const drum = new THREE.Mesh(
      track(new THREE.CylinderGeometry(8.6, 8.9, 2.4, 24, 1, true)),
      stoneMat
    );
    drum.position.y = masaRoofY + 1.2;

    const bigDome = new THREE.Mesh(
      track(new THREE.SphereGeometry(8.7, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
      domeMat
    );
    bigDome.position.y = masaRoofY + 2.4;

    const spire = new THREE.Mesh(track(new THREE.ConeGeometry(0.3, 2.4, 8)), goldMat);
    spire.position.y = masaRoofY + 12.1;

    // Interior Hanging Chandelier right above the Mount
    const mountChand = new THREE.Mesh(track(new THREE.TorusGeometry(2.1, 0.16, 6, 18)), goldMat);
    mountChand.rotation.x = Math.PI / 2;
    mountChand.position.y = masaRoofY - 2.6;

    masaOverheadMeshes.push(drum, bigDome, spire, mountChand);
    g.add(terrace1, terrace2, rock1, rock2, rock3, railArc, railGoldCap, plaqueMesh, drum, bigDome, spire, mountChand);
    return g;
  };
  masaGroup.add(createSafaMarwahMount(HARAM_DIMENSIONS.safaZ, true));
  masaGroup.add(createSafaMarwahMount(HARAM_DIMENSIONS.marwahZ, false));

  // =========================================================================
  // 6. 3RD SAUDI EXPANSION (NORTHERN KING ABDULLAH EXPANSION -Z — FULLY ENCLOSED)
  // =========================================================================
  const expGroup = new THREE.Group();
  root.add(expGroup);

  // Prayer Carpet Hall + Central Marble Processional Aisle
  const expFloor = new THREE.Mesh(track(new THREE.BoxGeometry(116, 0.14, 56)), carpetMat);
  expFloor.position.set(0, 0.08, -88);
  expFloor.receiveShadow = !isSoftwareGl;
  expGroup.add(expFloor);

  const expCentralAisle = new THREE.Mesh(track(new THREE.BoxGeometry(11, 0.05, 56)), matafMat);
  expCentralAisle.position.set(0, 0.17, -88);
  expGroup.add(expCentralAisle);

  // Complete North, East, West & South-Wing Perimeter Walls of the 3rd Expansion (Height 14.8m)
  const expH = 14.8;
  // North Wall Segments (z = -116, x from -58 to +58, flush against Gate 100, 104, 142 pillars)
  [
    { x: -43.5, w: 29 },
    { x: -14.0, w: 18 },
    { x: 14.0, w: 18 },
    { x: 43.5, w: 29 },
  ].forEach(({ x, w }) => {
    const seg = new THREE.Mesh(track(new THREE.BoxGeometry(w, expH, 1.8)), stoneMat);
    seg.position.set(x, expH / 2, -116);
    const win = new THREE.Mesh(track(new THREE.BoxGeometry(w * 0.68, 7.2, 1.92)), mashrabiyaMat);
    win.position.set(x, 7.6, -116);
    const dado = new THREE.Mesh(track(new THREE.BoxGeometry(w + 0.1, 2.2, 1.95)), warmGraniteMat);
    dado.position.set(x, 1.1, -116);
    expGroup.add(seg, win, dado);
  });

  // East & West Walls of 3rd Expansion (x = ±58, z = -116..-60, leaving clean openings at z = -86)
  [-58, 58].forEach((wx) => {
    [
      { z: -71.5, d: 23 },
      { z: -102.5, d: 27 },
    ].forEach(({ z, d }) => {
      const seg = new THREE.Mesh(track(new THREE.BoxGeometry(1.8, expH, d)), stoneMat);
      seg.position.set(wx, expH / 2, z);
      const win = new THREE.Mesh(track(new THREE.BoxGeometry(1.92, 7.2, d * 0.68)), mashrabiyaMat);
      win.position.set(wx, 7.6, z);
      const dado = new THREE.Mesh(track(new THREE.BoxGeometry(1.95, 2.2, d + 0.1)), warmGraniteMat);
      dado.position.set(wx, 1.1, z);
      expGroup.add(seg, win, dado);
    });
  });

  // Connecting South-West & South-East Transition Walls (z = -60) split cleanly around Bab Al-Quds (x = -39) and Bab Al-Mudda'a (x = 42)
  [
    { wx: -49.8, w: 16.4 },
    { wx: -33.7, w: 5.4 },
    { wx: 35.2, w: 8.4 },
    { wx: 51.3, w: 13.4 },
  ].forEach(({ wx, w }) => {
    const connWall = new THREE.Mesh(track(new THREE.BoxGeometry(w, expH - 1.5, 1.6)), stoneMat);
    connWall.position.set(wx, (expH - 1.5) / 2, -60);
    const connWin = new THREE.Mesh(track(new THREE.BoxGeometry(w * 0.62, 6.2, 1.72)), mashrabiyaMat);
    connWin.position.set(wx, 6.4, -60);
    const connDado = new THREE.Mesh(track(new THREE.BoxGeometry(w + 0.1, 2.2, 1.78)), warmGraniteMat);
    connDado.position.set(wx, 1.1, -60);
    expGroup.add(connWall, connWin, connDado);
  });

  // Short N-S Return Walls sealing x = ±31 (connWall -> North Riwaq wall) and x = +58.6 (connWall -> Marwah sideL)
  [-31, 31].forEach((rx) => {
    const ret = new THREE.Mesh(track(new THREE.BoxGeometry(1.5, expH - 1.5, 6.4)), stoneMat);
    ret.position.set(rx, (expH - 1.5) / 2, -57.0);
    expGroup.add(ret);
  });
  const neMarwahRet = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, expH - 1.5, 4.6)), stoneMat);
  neMarwahRet.position.set(58.6, (expH - 1.5) / 2, -58.2);
  expGroup.add(neMarwahRet);

  // Instanced Granite Columns inside 3rd Expansion (with marble plinths, brass rings & gilded capitals)
  const expColCoords: Array<[number, number]> = [];
  for (let x = -50; x <= 50; x += 12.5) {
    if (Math.abs(x) < 9) continue;
    for (let z = -110; z <= -66; z += 11) {
      expColCoords.push([x, z]);
    }
  }
  const expColGeo = track(new THREE.CylinderGeometry(0.64, 0.76, expH - 2.4, 12));
  const expColBaseGeo = track(new THREE.BoxGeometry(1.9, 0.9, 1.9));
  const expColNeckGeo = track(new THREE.TorusGeometry(0.68, 0.08, 6, 12));
  const expColCapGeo = track(new THREE.CylinderGeometry(1.12, 0.68, 1.05, 8));

  const expColInst = new THREE.InstancedMesh(expColGeo, stoneMat, expColCoords.length);
  const expColBaseInst = new THREE.InstancedMesh(expColBaseGeo, whiteMarbleMat, expColCoords.length);
  const expColNeckInst = new THREE.InstancedMesh(expColNeckGeo, goldMat, expColCoords.length);
  const expColCapInst = new THREE.InstancedMesh(expColCapGeo, goldMat, expColCoords.length);
  expColCoords.forEach(([cx, cz], idx) => {
    _dummy.position.set(cx, (expH - 1.4) / 2 + 0.5, cz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    expColInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(cx, 0.45, cz);
    _dummy.updateMatrix();
    expColBaseInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(cx, expH - 1.55, cz);
    _dummy.rotation.set(Math.PI / 2, 0, 0);
    _dummy.updateMatrix();
    expColNeckInst.setMatrixAt(idx, _dummy.matrix);

    _dummy.position.set(cx, expH - 0.98, cz);
    _dummy.rotation.set(0, 0, 0);
    _dummy.updateMatrix();
    expColCapInst.setMatrixAt(idx, _dummy.matrix);
  });
  [expColInst, expColBaseInst, expColNeckInst, expColCapInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    expGroup.add(inst);
  });

  // Zamzam Colman Racks & Drinking Fountains inside 3rd Saudi Expansion wings (clear of central nave & cross passages)
  colmanRacks.push(
    { x: -12.8, z: -72, rotY: Math.PI / 2, barrels: 4 },
    { x: 12.8, z: -72, rotY: -Math.PI / 2, barrels: 4 },
    { x: -12.8, z: -99, rotY: Math.PI / 2, barrels: 4 },
    { x: 12.8, z: -99, rotY: -Math.PI / 2, barrels: 4 }
  );
  drinkingFountains.push(
    { x: -37.5, z: -72, rotY: Math.PI / 2, taps: 4 },
    { x: 37.5, z: -72, rotY: -Math.PI / 2, taps: 4 },
    { x: -37.5, z: -99, rotY: Math.PI / 2, taps: 4 },
    { x: 37.5, z: -99, rotY: -Math.PI / 2, taps: 4 }
  );

  // Grand Pointed Nave Arches flanking the Central Processional Aisle inside 3rd Expansion (x = ±9.5)
  const expNaveArchGeo = createPointedArchBayGeometry(11.0, expH - 0.6, 8.2, 6.8, 12.2, 1.15);
  const expNaveInst = new THREE.InstancedMesh(expNaveArchGeo, stoneMat, 10);
  for (let i = 0; i < 5; i++) {
    const az = -110 + i * 11.0;
    _dummy.position.set(-9.5, 0, az);
    _dummy.rotation.set(0, Math.PI / 2, 0);
    _dummy.scale.set(1, 1, 1);
    _dummy.updateMatrix();
    expNaveInst.setMatrixAt(i * 2, _dummy.matrix);

    _dummy.position.set(9.5, 0, az);
    _dummy.updateMatrix();
    expNaveInst.setMatrixAt(i * 2 + 1, _dummy.matrix);
  }
  expNaveInst.instanceMatrix.needsUpdate = true;
  expNaveInst.computeBoundingSphere();
  expGroup.add(expNaveInst);

  // 2nd Floor Mezzanine Gallery inside 3rd Expansion Wings (x = ±10..57)
  [-33.5, 33.5].forEach((mx) => {
    const expMezz = new THREE.Mesh(track(new THREE.BoxGeometry(47, 0.48, 54)), whiteMarbleMat);
    expMezz.position.set(mx, 7.4, -88);
    const expRail = new THREE.Mesh(track(new THREE.BoxGeometry(0.32, 1.0, 54)), whiteMarbleMat);
    expRail.position.set(mx > 0 ? 10.1 : -10.1, 8.1, -88);
    roofMeshes.push(expMezz);
    expGroup.add(expMezz, expRail);
  });

  // 3rd Expansion Roof (cutaway-capable, flush within perimeter walls)
  const expRoof = new THREE.Mesh(track(new THREE.BoxGeometry(116, 1.6, 56)), roofMatStandard);
  expRoof.position.set(0, expH, -88);
  roofMeshes.push(expRoof);
  expGroup.add(expRoof);

  // Grand Central Dome + Flanking Domes + Interior Chandeliers of King Abdullah Expansion
  const expMainDome = new THREE.Mesh(
    track(new THREE.SphereGeometry(13.0, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2)),
    domeMat
  );
  expMainDome.position.set(0, expH + 0.8, -88);
  const expMainFinial = new THREE.Mesh(track(new THREE.ConeGeometry(0.45, 3.2, 8)), goldMat);
  expMainFinial.position.set(0, expH + 15.2, -88);
  const expMainChand = new THREE.Mesh(track(new THREE.TorusGeometry(3.6, 0.22, 8, 22)), goldMat);
  expMainChand.rotation.x = Math.PI / 2;
  expMainChand.position.set(0, expH - 2.6, -88);
  expGroup.add(expMainDome, expMainFinial, expMainChand);

  [-34, 34].forEach((dx) => {
    const sideDome = new THREE.Mesh(
      track(new THREE.SphereGeometry(7.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2)),
      domeMat
    );
    sideDome.position.set(dx, expH + 0.8, -88);
    const sideChand = new THREE.Mesh(track(new THREE.TorusGeometry(2.1, 0.16, 6, 16)), goldMat);
    sideChand.rotation.x = Math.PI / 2;
    sideChand.position.set(dx, expH - 2.4, -88);
    expGroup.add(sideDome, sideChand);
  });

  // =========================================================================
  // 7. ALL 13 ICONIC MINARETS (COMPOSITE 9-PART MODELS)
  // =========================================================================
  const minaretsGroup = new THREE.Group();
  root.add(minaretsGroup);

  const minaretBaseGeo = track(new THREE.BoxGeometry(3.4, 12.5, 3.4));
  const minaretMidGeo = track(new THREE.CylinderGeometry(1.4, 1.72, 14.5, 8));
  const minaretBalconyGeo = track(new THREE.CylinderGeometry(2.3, 1.55, 1.35, 12));
  const minaretBalcRailGeo = track(new THREE.CylinderGeometry(2.35, 2.35, 0.65, 12, 1, true));
  const minaretUpperGeo = track(new THREE.CylinderGeometry(0.98, 1.24, 10.2, 10));
  const minaretCupolaGeo = track(new THREE.SphereGeometry(1.3, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2));
  const minaretCrescentGeo = track(new THREE.TorusGeometry(0.68, 0.15, 8, 16, Math.PI * 1.45));

  const createMinaret = (x: number, z: number, heightScale = 1) => {
    const m = new THREE.Group();
    m.position.set(x, 0, z);
    m.scale.set(1, heightScale, 1);

    const base = new THREE.Mesh(minaretBaseGeo, stoneMat);
    base.position.y = 6.25;
    base.castShadow = !isSoftwareGl;

    const mid = new THREE.Mesh(minaretMidGeo, stoneMat);
    mid.position.y = 19.6;

    const balc1 = new THREE.Mesh(minaretBalconyGeo, whiteMarbleMat);
    balc1.position.y = 27.2;

    const balc1Rail = new THREE.Mesh(minaretBalcRailGeo, goldMat);
    balc1Rail.position.y = 28.05;

    const upper = new THREE.Mesh(minaretUpperGeo, stoneMat);
    upper.position.y = 32.6;

    const balc2 = new THREE.Mesh(minaretBalconyGeo, goldMat);
    balc2.scale.set(0.82, 0.8, 0.82);
    balc2.position.y = 38.0;

    const cupola = new THREE.Mesh(minaretCupolaGeo, whiteMarbleMat);
    cupola.position.y = 38.7;

    const spire = new THREE.Mesh(track(new THREE.CylinderGeometry(0.11, 0.17, 2.9, 6)), emissiveGoldMat);
    spire.position.y = 41.0;

    const crescent = new THREE.Mesh(minaretCrescentGeo, emissiveGoldMat);
    crescent.position.y = 42.9;
    crescent.rotation.z = Math.PI * 0.78;

    m.add(base, mid, balc1, balc1Rail, upper, balc2, cupola, spire, crescent);
    return m;
  };

  const minaretCoords: Array<[number, number, number]> = [
    [-16, 65, 1.06], [-4, 65, 1.06],
    [-80, 16, 1.06], [-80, 32, 1.06],
    [-57, -28, 0.98], [-50, -40, 0.98],
    [-6, -65, 1.0], [6, -65, 1.0],
    [-9, -118, 1.24], [9, -118, 1.24],
    [77, 56, 1.0], [79, 8.5, 0.98], [77, -56, 1.0],
  ];
  minaretCoords.forEach(([mx, mz, sc]) => {
    minaretsGroup.add(createMinaret(mx, mz, sc));
  });

  // =========================================================================
  // 8. ALL HARAM GATES (MONUMENTAL PORTALS, CARVED ARCHES, BRONZE DOORS & HITBOXES)
  // =========================================================================
  const gatesGroup = new THREE.Group();
  root.add(gatesGroup);
  const gateHitboxes: THREE.Mesh[] = [];

  const majorPortalPillarGeo = track(new THREE.BoxGeometry(1.75, 15.2, 2.5));
  const majorFlankColGeo = track(new THREE.CylinderGeometry(0.42, 0.48, 11.4, 10));
  const majorFlankCapGeo = track(new THREE.CylinderGeometry(0.66, 0.44, 0.65, 8));
  const majorPortalLintelGeo = track(new THREE.BoxGeometry(11.4, 3.4, 2.7));
  const majorPortalArchGeo = track(new THREE.TorusGeometry(3.4, 0.48, 8, 16, Math.PI));
  const majorTransomGeo = track(new THREE.BoxGeometry(6.8, 3.2, 0.48));
  const majorDoorLeafGeo = track(new THREE.BoxGeometry(0.24, 7.2, 2.2));
  const majorDoorBossGeo = track(new THREE.BoxGeometry(0.32, 0.68, 0.68));
  const majorDoorHandleGeo = track(new THREE.TorusGeometry(0.18, 0.04, 6, 12));
  const majorThresholdGeo = track(new THREE.BoxGeometry(8.8, 0.12, 3.6));

  const minorPortalPillarGeo = track(new THREE.BoxGeometry(1.1, 11.2, 1.8));
  const minorFlankColGeo = track(new THREE.CylinderGeometry(0.28, 0.34, 8.6, 8));
  const minorPortalLintelGeo = track(new THREE.BoxGeometry(6.6, 2.2, 2.0));
  const minorTransomGeo = track(new THREE.BoxGeometry(4.0, 2.2, 0.42));
  const minorDoorLeafGeo = track(new THREE.BoxGeometry(0.18, 5.4, 1.4));
  const minorThresholdGeo = track(new THREE.BoxGeometry(5.2, 0.1, 2.6));
  const gateLampGeo = track(new THREE.SphereGeometry(0.38, 8, 8));
  const gateBracketGeo = track(new THREE.BoxGeometry(0.22, 0.2, 0.65));
  const hitboxGeo = track(new THREE.BoxGeometry(9.5, 14, 6));

  const majorPlaqueGeo = track(new THREE.PlaneGeometry(8.8, 2.5));
  const minorPlaqueGeo = track(new THREE.PlaneGeometry(5.6, 1.7));

  HARAM_GATES.forEach((gate) => {
    const gWrap = new THREE.Group();
    const [gx, , gz] = gate.position;
    gWrap.position.set(gx, 0, gz);

    let yaw = 0;
    if (gate.id === 'gate-8' || gate.id === 'gate-13') yaw = 0;
    else if (gate.id === 'gate-25') yaw = Math.PI;
    else if (gate.id === 'gate-119' || gate.direction === 'east') yaw = Math.PI / 2;
    else if (gate.id === 'gate-160' || gate.id === 'gate-79') yaw = -Math.PI / 2;
    else if (gate.direction === 'north' || gate.direction === 'expansion') yaw = Math.PI;
    else {
      yaw = Math.atan2(gx, gz);
    }
    gWrap.rotation.y = yaw;

    const plaqueTex = track(
      createGatePlaqueTexture(gate.nameAr, gate.number, Boolean(gate.isMajor), maxAniso)
    );
    const plaqueMat = track(
      new THREE.MeshBasicMaterial({
        map: plaqueTex,
      })
    );

    if (gate.isMajor) {
      const pL = new THREE.Mesh(majorPortalPillarGeo, stoneMat);
      pL.position.set(-4.4, 7.6, 0);
      const pR = new THREE.Mesh(majorPortalPillarGeo, stoneMat);
      pR.position.set(4.4, 7.6, 0);

      // Flanking marble half-columns & golden capitals
      const colL = new THREE.Mesh(majorFlankColGeo, whiteMarbleMat);
      colL.position.set(-3.45, 5.7, 1.12);
      const colR = new THREE.Mesh(majorFlankColGeo, whiteMarbleMat);
      colR.position.set(3.45, 5.7, 1.12);
      const capL = new THREE.Mesh(majorFlankCapGeo, goldMat);
      capL.position.set(-3.45, 11.6, 1.12);
      const capR = new THREE.Mesh(majorFlankCapGeo, goldMat);
      capR.position.set(3.45, 11.6, 1.12);

      const lintel = new THREE.Mesh(majorPortalLintelGeo, whiteMarbleMat);
      lintel.position.set(0, 15.8, 0);
      const arch = new THREE.Mesh(majorPortalArchGeo, goldMat);
      arch.position.set(0, 11.0, 1.05);
      const transom = new THREE.Mesh(majorTransomGeo, mashrabiyaMat);
      transom.position.set(0, 12.2, 0.25);
      const trim = new THREE.Mesh(track(new THREE.BoxGeometry(11.8, 0.6, 2.8)), goldMat);
      trim.position.set(0, 17.6, 0);

      // Stepped white marble entrance landing
      const threshold = new THREE.Mesh(majorThresholdGeo, whiteMarbleMat);
      threshold.position.set(0, 0.05, 0);

      // Gate name & number plaque mounted directly on front & back of the portal lintel
      const plaqueFront = new THREE.Mesh(majorPlaqueGeo, plaqueMat);
      plaqueFront.position.set(0, 15.8, 1.42);
      const plaqueBack = new THREE.Mesh(majorPlaqueGeo, plaqueMat);
      plaqueBack.position.set(0, 15.8, -1.42);
      plaqueBack.rotation.y = Math.PI;

      // Open bronze double-doors inside portal with brass Islamic bosses & pull rings
      const doorL = new THREE.Mesh(majorDoorLeafGeo, bronzeMat);
      doorL.position.set(-3.2, 3.6, -1.1);
      const doorR = new THREE.Mesh(majorDoorLeafGeo, bronzeMat);
      doorR.position.set(3.2, 3.6, -1.1);
      [2.1, 4.8].forEach((by) => {
        const bL = new THREE.Mesh(majorDoorBossGeo, goldMat);
        bL.position.set(-3.2, by, -1.1);
        const bR = new THREE.Mesh(majorDoorBossGeo, goldMat);
        bR.position.set(3.2, by, -1.1);
        gWrap.add(bL, bR);
      });
      const ringL = new THREE.Mesh(majorDoorHandleGeo, goldMat);
      ringL.rotation.y = Math.PI / 2;
      ringL.position.set(-3.04, 2.6, -1.1);
      const ringR = new THREE.Mesh(majorDoorHandleGeo, goldMat);
      ringR.rotation.y = Math.PI / 2;
      ringR.position.set(3.04, 2.6, -1.1);

      // Twin wall-bracketed entrance lanterns
      const brL = new THREE.Mesh(gateBracketGeo, bronzeMat);
      brL.position.set(-4.4, 4.5, 1.3);
      const brR = new THREE.Mesh(gateBracketGeo, bronzeMat);
      brR.position.set(4.4, 4.5, 1.3);
      const lampL = new THREE.Mesh(gateLampGeo, lampGlowMat);
      lampL.position.set(-4.4, 4.85, 1.55);
      const lampR = new THREE.Mesh(gateLampGeo, lampGlowMat);
      lampR.position.set(4.4, 4.85, 1.55);

      gWrap.add(
        pL, pR, colL, colR, capL, capR, lintel, arch, transom, trim, threshold,
        plaqueFront, plaqueBack, doorL, doorR, ringL, ringR, brL, brR, lampL, lampR
      );
    } else {
      const pL = new THREE.Mesh(minorPortalPillarGeo, stoneMat);
      pL.position.set(-2.6, 5.6, 0);
      const pR = new THREE.Mesh(minorPortalPillarGeo, stoneMat);
      pR.position.set(2.6, 5.6, 0);

      const colL = new THREE.Mesh(minorFlankColGeo, whiteMarbleMat);
      colL.position.set(-1.95, 4.3, 0.78);
      const colR = new THREE.Mesh(minorFlankColGeo, whiteMarbleMat);
      colR.position.set(1.95, 4.3, 0.78);

      const lintel = new THREE.Mesh(minorPortalLintelGeo, stoneMat);
      lintel.position.set(0, 11.8, 0);
      const transom = new THREE.Mesh(minorTransomGeo, mashrabiyaMat);
      transom.position.set(0, 9.2, 0.15);
      const goldBadge = new THREE.Mesh(track(new THREE.BoxGeometry(2.8, 0.58, 2.1)), goldMat);
      goldBadge.position.set(0, 10.6, 0);
      const threshold = new THREE.Mesh(minorThresholdGeo, whiteMarbleMat);
      threshold.position.set(0, 0.04, 0);

      // Gate name & number plaque mounted directly on front & back of the minor gate lintel
      const plaqueFront = new THREE.Mesh(minorPlaqueGeo, plaqueMat);
      plaqueFront.position.set(0, 11.85, 1.06);
      const plaqueBack = new THREE.Mesh(minorPlaqueGeo, plaqueMat);
      plaqueBack.position.set(0, 11.85, -1.06);
      plaqueBack.rotation.y = Math.PI;

      const doorL = new THREE.Mesh(minorDoorLeafGeo, bronzeMat);
      doorL.position.set(-1.85, 2.7, -0.7);
      const doorR = new THREE.Mesh(minorDoorLeafGeo, bronzeMat);
      doorR.position.set(1.85, 2.7, -0.7);

      const lampL = new THREE.Mesh(gateLampGeo, lampGlowMat);
      lampL.scale.setScalar(0.75);
      lampL.position.set(-2.6, 3.9, 1.02);
      const lampR = new THREE.Mesh(gateLampGeo, lampGlowMat);
      lampR.scale.setScalar(0.75);
      lampR.position.set(2.6, 3.9, 1.02);

      gWrap.add(
        pL, pR, colL, colR, lintel, transom, goldBadge, threshold,
        plaqueFront, plaqueBack, doorL, doorR, lampL, lampR
      );
    }

    const hitbox = new THREE.Mesh(
      hitboxGeo,
      track(new THREE.MeshBasicMaterial({ visible: false }))
    );
    hitbox.position.set(0, 7, 0);
    hitbox.layers.set(1);
    hitbox.userData.gateId = gate.id;
    gWrap.add(hitbox);
    gateHitboxes.push(hitbox);

    gatesGroup.add(gWrap);
  });

  // =========================================================================
  // 8B. OUTER PLAZA DRINKING FOUNTAINS & BATCHED ZAMZAM COLMAN / FOUNTAIN RENDERING
  // =========================================================================
  // Outer plaza stations placed cleanly beside major entrances (clear of gate centerlines)
  colmanRacks.push(
    { x: -24, z: 71, rotY: 0, barrels: 4 },
    { x: 14, z: 68, rotY: 0, barrels: 4 },
    { x: -86, z: 12, rotY: -Math.PI / 2, barrels: 4 },
    { x: -16, z: -124, rotY: Math.PI, barrels: 4 }
  );
  drinkingFountains.push(
    { x: 4, z: 71, rotY: 0, taps: 4 },
    { x: -86, z: 36, rotY: -Math.PI / 2, taps: 4 },
    { x: 86, z: 12, rotY: Math.PI / 2, taps: 4 },
    { x: 16, z: -124, rotY: Math.PI, taps: 4 },
    { x: 58, z: 86, rotY: 0, taps: 4 },
    { x: 58, z: -86, rotY: Math.PI, taps: 4 }
  );

  // Render all Zamzam Colman Racks via InstancedMesh
  const totalBarrels = colmanRacks.reduce((sum, r) => sum + r.barrels, 0);
  if (colmanRacks.length > 0 && totalBarrels > 0) {
    const rackBaseGeo = track(new THREE.BoxGeometry(2.1, 0.34, 0.56));
    const rackTrayGeo = track(new THREE.BoxGeometry(2.02, 0.06, 0.24));
    const rackSignPostGeo = track(new THREE.CylinderGeometry(0.025, 0.025, 1.38, 6));
    const rackSignGeo = track(new THREE.BoxGeometry(1.75, 0.42, 0.05));
    const colmanBodyGeo = track(new THREE.CylinderGeometry(0.165, 0.165, 0.68, 12));
    const colmanLidGeo = track(new THREE.CylinderGeometry(0.172, 0.172, 0.09, 12));
    const colmanBandGeo = track(new THREE.CylinderGeometry(0.169, 0.169, 0.07, 12));
    const colmanSpoutGeo = track(new THREE.BoxGeometry(0.04, 0.05, 0.11));

    const rackBaseInst = new THREE.InstancedMesh(rackBaseGeo, whiteMarbleMat, colmanRacks.length);
    const rackTrayInst = new THREE.InstancedMesh(rackTrayGeo, chromeMat, colmanRacks.length);
    const rackPostInst = new THREE.InstancedMesh(rackSignPostGeo, chromeMat, colmanRacks.length * 2);
    const rackSignInst = new THREE.InstancedMesh(rackSignGeo, zamzamSignMat, colmanRacks.length);

    const barrelBodyInst = new THREE.InstancedMesh(colmanBodyGeo, coolerBeigeMat, totalBarrels);
    const barrelLidInst = new THREE.InstancedMesh(colmanLidGeo, coolerLidMat, totalBarrels);
    const barrelBandInst = new THREE.InstancedMesh(colmanBandGeo, goldMat, totalBarrels);
    const barrelSpoutInst = new THREE.InstancedMesh(colmanSpoutGeo, coolBlueTapMat, totalBarrels);

    let bIdx = 0;
    colmanRacks.forEach((rack, rIdx) => {
      const cosR = Math.cos(rack.rotY);
      const sinR = Math.sin(rack.rotY);

      _dummy.position.set(rack.x, 0.17, rack.z);
      _dummy.rotation.set(0, rack.rotY, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      rackBaseInst.setMatrixAt(rIdx, _dummy.matrix);

      // Drip tray along front edge (+Z local)
      _dummy.position.set(rack.x + sinR * 0.22, 0.37, rack.z + cosR * 0.22);
      _dummy.updateMatrix();
      rackTrayInst.setMatrixAt(rIdx, _dummy.matrix);

      // Header sign & twin chrome posts
      [-0.86, 0.86].forEach((ox, pSide) => {
        _dummy.position.set(
          rack.x + cosR * ox - sinR * 0.18,
          0.92,
          rack.z - sinR * ox - cosR * 0.18
        );
        _dummy.updateMatrix();
        rackPostInst.setMatrixAt(rIdx * 2 + pSide, _dummy.matrix);
      });
      _dummy.position.set(rack.x - sinR * 0.16, 1.48, rack.z - cosR * 0.16);
      _dummy.updateMatrix();
      rackSignInst.setMatrixAt(rIdx, _dummy.matrix);

      // Individual cylindrical Zamzam thermal colmans
      const span = (rack.barrels - 1) * 0.46;
      for (let b = 0; b < rack.barrels; b++) {
        const ox = -span / 2 + b * 0.46;
        const bx = rack.x + cosR * ox - sinR * 0.04;
        const bz = rack.z - sinR * ox - cosR * 0.04;

        _dummy.position.set(bx, 0.72, bz);
        _dummy.rotation.set(0, rack.rotY, 0);
        _dummy.updateMatrix();
        barrelBodyInst.setMatrixAt(bIdx, _dummy.matrix);

        _dummy.position.set(bx, 1.09, bz);
        _dummy.updateMatrix();
        barrelLidInst.setMatrixAt(bIdx, _dummy.matrix);

        _dummy.position.set(bx, 0.84, bz);
        _dummy.updateMatrix();
        barrelBandInst.setMatrixAt(bIdx, _dummy.matrix);

        // Chilled water tap facing +Z local
        _dummy.position.set(bx + sinR * 0.19, 0.56, bz + cosR * 0.19);
        _dummy.updateMatrix();
        barrelSpoutInst.setMatrixAt(bIdx, _dummy.matrix);
        bIdx++;
      }
    });
    [
      rackBaseInst,
      rackTrayInst,
      rackPostInst,
      rackSignInst,
      barrelBodyInst,
      barrelLidInst,
      barrelBandInst,
      barrelSpoutInst,
    ].forEach((inst) => {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      root.add(inst);
    });
  }

  // Render all Marble Drinking Water Fountain Stations (حنفيات المياه) via InstancedMesh
  const totalTaps = drinkingFountains.reduce((sum, f) => sum + f.taps, 0);
  if (drinkingFountains.length > 0 && totalTaps > 0) {
    const fPedestalGeo = track(new THREE.BoxGeometry(2.25, 0.78, 0.58));
    const fBasinGeo = track(new THREE.BoxGeometry(2.04, 0.1, 0.36));
    const fSplashGeo = track(new THREE.BoxGeometry(2.18, 0.72, 0.12));
    const fSignGeo = track(new THREE.BoxGeometry(1.78, 0.4, 0.06));
    const fTapStemGeo = track(new THREE.CylinderGeometry(0.025, 0.032, 0.24, 8));
    const fTapNozzleGeo = track(new THREE.BoxGeometry(0.035, 0.04, 0.15));
    const fTapCapGeo = track(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8));

    const fPedInst = new THREE.InstancedMesh(fPedestalGeo, whiteMarbleMat, drinkingFountains.length);
    const fBasinInst = new THREE.InstancedMesh(fBasinGeo, chromeMat, drinkingFountains.length);
    const fSplashInst = new THREE.InstancedMesh(fSplashGeo, darkGreenMarbleMat, drinkingFountains.length);
    const fSignInst = new THREE.InstancedMesh(fSignGeo, zamzamSignMat, drinkingFountains.length);

    const fTapStemInst = new THREE.InstancedMesh(fTapStemGeo, chromeMat, totalTaps);
    const fTapNozzleInst = new THREE.InstancedMesh(fTapNozzleGeo, chromeMat, totalTaps);
    const fTapCapInst = new THREE.InstancedMesh(fTapCapGeo, goldMat, totalTaps);

    let tIdx = 0;
    drinkingFountains.forEach((f, fIdx) => {
      const cosR = Math.cos(f.rotY);
      const sinR = Math.sin(f.rotY);

      _dummy.position.set(f.x, 0.39, f.z);
      _dummy.rotation.set(0, f.rotY, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      fPedInst.setMatrixAt(fIdx, _dummy.matrix);

      _dummy.position.set(f.x + sinR * 0.06, 0.81, f.z + cosR * 0.06);
      _dummy.updateMatrix();
      fBasinInst.setMatrixAt(fIdx, _dummy.matrix);

      _dummy.position.set(f.x - sinR * 0.22, 1.14, f.z - cosR * 0.22);
      _dummy.updateMatrix();
      fSplashInst.setMatrixAt(fIdx, _dummy.matrix);

      _dummy.position.set(f.x - sinR * 0.16, 1.32, f.z - cosR * 0.16);
      _dummy.updateMatrix();
      fSignInst.setMatrixAt(fIdx, _dummy.matrix);

      const span = (f.taps - 1) * 0.48;
      for (let t = 0; t < f.taps; t++) {
        const ox = -span / 2 + t * 0.48;
        const tx = f.x + cosR * ox - sinR * 0.12;
        const tz = f.z - sinR * ox - cosR * 0.12;

        _dummy.position.set(tx, 0.96, tz);
        _dummy.rotation.set(0, f.rotY, 0);
        _dummy.updateMatrix();
        fTapStemInst.setMatrixAt(tIdx, _dummy.matrix);

        _dummy.position.set(tx + sinR * 0.07, 1.07, tz + cosR * 0.07);
        _dummy.updateMatrix();
        fTapNozzleInst.setMatrixAt(tIdx, _dummy.matrix);

        _dummy.position.set(tx, 1.11, tz);
        _dummy.updateMatrix();
        fTapCapInst.setMatrixAt(tIdx, _dummy.matrix);
        tIdx++;
      }
    });
    [fPedInst, fBasinInst, fSplashInst, fSignInst, fTapStemInst, fTapNozzleInst, fTapCapInst].forEach((inst) => {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      root.add(inst);
    });
  }

  // Glowing Selection Ring
  const gateHighlightRing = new THREE.Mesh(
    track(new THREE.RingGeometry(4.4, 5.6, 28)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      })
    )
  );
  gateHighlightRing.rotation.x = -Math.PI / 2;
  gateHighlightRing.position.y = 0.22;
  gateHighlightRing.visible = false;
  root.add(gateHighlightRing);

  // =========================================================================
  // 9. DYNAMIC ROUTE PATH GROUP (GATE -> INTERIOR -> KAABA / MASA)
  // =========================================================================
  const pathGroup = new THREE.Group();
  root.add(pathGroup);
  let activePathMat: THREE.MeshStandardMaterial | null = null;
  let activePathGeo: THREE.BufferGeometry | null = null;
  const pathOrbs: THREE.Mesh[] = [];
  let currentCurve: THREE.CatmullRomCurve3 | null = null;

  const orbGeo = track(new THREE.SphereGeometry(0.65, 10, 10));
  const orbMat = track(new THREE.MeshBasicMaterial({ color: 0xfef08a }));

  const showPathForGate = (gate: HaramGateInfo | null) => {
    while (pathGroup.children.length > 0) {
      pathGroup.remove(pathGroup.children[0]);
    }
    pathOrbs.length = 0;
    if (activePathGeo) {
      activePathGeo.dispose();
      activePathGeo = null;
    }
    if (activePathMat) {
      activePathMat.dispose();
      activePathMat = null;
    }
    currentCurve = null;

    if (!gate) {
      gateHighlightRing.visible = false;
      return;
    }

    gateHighlightRing.position.set(gate.position[0], 0.25, gate.position[2]);
    gateHighlightRing.visible = true;

    _curvePoints.length = 0;
    const outsidePt = new THREE.Vector3(
      gate.exteriorCamera[0] * 0.35 + gate.position[0] * 0.65,
      0.45,
      gate.exteriorCamera[2] * 0.35 + gate.position[2] * 0.65
    );
    const gatePt = new THREE.Vector3(gate.position[0], 0.45, gate.position[2]);
    const insidePt = new THREE.Vector3(gate.interiorWalkPoint[0], 0.45, gate.interiorWalkPoint[2]);

    _curvePoints.push(outsidePt, gatePt, insidePt);

    if (gate.leadsTo === 'masa') {
      const targetZ = gate.position[2] >= 0 ? HARAM_DIMENSIONS.safaZ - 6 : HARAM_DIMENSIONS.marwahZ + 6;
      _curvePoints.push(new THREE.Vector3(HARAM_DIMENSIONS.masaX, 0.45, targetZ));
    } else if (gate.leadsTo === 'expansion') {
      _curvePoints.push(new THREE.Vector3(0, 0.45, -45));
      _curvePoints.push(new THREE.Vector3(0, 0.45, -18));
    } else {
      const dirToKaaba = insidePt.clone().setY(0).normalize().multiplyScalar(15);
      _curvePoints.push(new THREE.Vector3(dirToKaaba.x, 0.45, dirToKaaba.z));
    }

    currentCurve = new THREE.CatmullRomCurve3(_curvePoints);
    activePathGeo = new THREE.TubeGeometry(currentCurve, 44, 0.42, 8, false);
    activePathMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: new THREE.Color(0xf59e0b),
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.92,
    });
    const tubeMesh = new THREE.Mesh(activePathGeo, activePathMat);
    pathGroup.add(tubeMesh);

    for (let i = 0; i < 4; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      pathGroup.add(orb);
      pathOrbs.push(orb);
    }
  };

  // =========================================================================
  // 9A. EXTERIOR LANDMARK -> SELECTED GATE NAVIGATION LINE
  // =========================================================================
  const landmarkGatePathGroup = new THREE.Group();
  root.add(landmarkGatePathGroup);
  let landmarkGateCurve: THREE.CatmullRomCurve3 | null = null;
  let landmarkGateGeo: THREE.BufferGeometry | null = null;
  let landmarkGateMat: THREE.MeshStandardMaterial | null = null;
  let landmarkStartRingGeo: THREE.BufferGeometry | null = null;
  let landmarkStartRingMat: THREE.MeshBasicMaterial | null = null;
  const landmarkGateOrbs: THREE.Mesh[] = [];
  const navArrowGeo = track(new THREE.ConeGeometry(0.45, 1.05, 8));
  navArrowGeo.rotateX(Math.PI / 2);

  const setLandmarkToGatePath = (
    waypoints: Array<[number, number, number]> | null,
    destinationGate?: HaramGateInfo | null
  ) => {
    while (landmarkGatePathGroup.children.length > 0) {
      landmarkGatePathGroup.remove(landmarkGatePathGroup.children[0]);
    }
    landmarkGateOrbs.length = 0;
    if (landmarkGateGeo) {
      landmarkGateGeo.dispose();
      landmarkGateGeo = null;
    }
    if (landmarkGateMat) {
      landmarkGateMat.dispose();
      landmarkGateMat = null;
    }
    if (landmarkStartRingGeo) {
      landmarkStartRingGeo.dispose();
      landmarkStartRingGeo = null;
    }
    if (landmarkStartRingMat) {
      landmarkStartRingMat.dispose();
      landmarkStartRingMat = null;
    }
    landmarkGateCurve = null;

    if (!waypoints || waypoints.length < 2) {
      return;
    }

    const pts = waypoints.map((w) => new THREE.Vector3(w[0], w[1] + 0.14, w[2]));
    landmarkGateCurve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.22);

    landmarkGateMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 1.05,
      roughness: 0.2,
      metalness: 0.25,
      transparent: true,
      opacity: 0.95,
    });
    landmarkGateGeo = new THREE.TubeGeometry(landmarkGateCurve, 110, 0.42, 8, false);
    const tube = new THREE.Mesh(landmarkGateGeo, landmarkGateMat);
    landmarkGatePathGroup.add(tube);

    // Starting beacon ring right at the exterior landmark plaza
    landmarkStartRingGeo = new THREE.RingGeometry(1.8, 2.7, 24);
    landmarkStartRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const startRing = new THREE.Mesh(landmarkStartRingGeo, landmarkStartRingMat);
    startRing.rotation.x = -Math.PI / 2;
    startRing.position.set(pts[0].x, 0.26, pts[0].z);
    landmarkGatePathGroup.add(startRing);

    // Directional arrowheads along the exterior route toward the gate
    const arrowCount = Math.max(3, Math.min(9, Math.floor(landmarkGateCurve.getLength() / 32)));
    for (let i = 1; i <= arrowCount; i++) {
      const u = i / (arrowCount + 1);
      const pos = landmarkGateCurve.getPointAt(u);
      const tan = landmarkGateCurve.getTangentAt(u);
      const arrow = new THREE.Mesh(navArrowGeo, landmarkGateMat);
      arrow.position.copy(pos).setY(pos.y + 0.24);
      arrow.lookAt(pos.x + tan.x, pos.y + 0.24, pos.z + tan.z);
      landmarkGatePathGroup.add(arrow);
    }

    for (let i = 0; i < 6; i++) {
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.scale.setScalar(0.85);
      landmarkGatePathGroup.add(orb);
      landmarkGateOrbs.push(orb);
    }

    if (destinationGate) {
      gateHighlightRing.position.set(destinationGate.position[0], 0.25, destinationGate.position[2]);
      gateHighlightRing.visible = true;
    }
  };

  const sampleLandmarkToGatePoint = (t: number, out: THREE.Vector3): boolean => {
    if (!landmarkGateCurve) return false;
    landmarkGateCurve.getPointAt(THREE.MathUtils.clamp(t, 0, 1), out);
    return true;
  };

  const getLandmarkToGateLength = (): number => {
    return landmarkGateCurve ? landmarkGateCurve.getLength() : 0;
  };

  // =========================================================================
  // 9B. ICONIC EXTERIOR MAKKAH LANDMARKS (AUTHENTIC ARCHITECTURAL SHAPES & COLORS)
  // =========================================================================
  const landmarksGroup = new THREE.Group();
  root.add(landmarksGroup);

  // Reusable architectural Makkah high-rise tower builder with setbacks, corner wings, and distinct crown styles
  type TowerCrownStyle = 'pyramid' | 'stepped-arch' | 'lantern' | 'octagonal';
  const buildMakkahTower = (
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    mat: THREE.Material,
    crownStyle: TowerCrownStyle = 'stepped-arch',
    roofMat: THREE.Material = abrajCopperRoofMat,
    includeBase = true
  ) => {
    const tg = new THREE.Group();
    tg.position.set(x, 0, z);

    const baseH = includeBase ? 6.5 : 0;
    if (includeBase) {
      const base = new THREE.Mesh(
        track(new THREE.BoxGeometry(w + 2.4, baseH, d + 2.4)),
        stoneMat
      );
      base.position.y = baseH / 2;
      const baseTrim = new THREE.Mesh(
        track(new THREE.BoxGeometry(w + 2.7, 0.55, d + 2.7)),
        goldMat
      );
      baseTrim.position.y = baseH;
      tg.add(base, baseTrim);
    }

    // Main lower/mid tower shaft (cruciform setback profile for authentic Makkah skyscraper silhouette)
    const lowerH = h * 0.68;
    const shaft = new THREE.Mesh(track(new THREE.BoxGeometry(w, lowerH, d)), mat);
    shaft.position.y = baseH + lowerH / 2;
    const ribA = new THREE.Mesh(
      track(new THREE.BoxGeometry(w * 0.62, lowerH, d + 1.1)),
      mat
    );
    ribA.position.y = baseH + lowerH / 2;
    const ribB = new THREE.Mesh(
      track(new THREE.BoxGeometry(w + 1.1, lowerH, d * 0.62)),
      mat
    );
    ribB.position.y = baseH + lowerH / 2;

    const midCornice = new THREE.Mesh(
      track(new THREE.BoxGeometry(w + 1.4, 0.65, d + 1.4)),
      goldMat
    );
    midCornice.position.y = baseH + lowerH;

    // Upper setback tier
    const upperH = h * 0.32;
    const upperW = w * 0.84;
    const upperD = d * 0.84;
    const upperShaft = new THREE.Mesh(
      track(new THREE.BoxGeometry(upperW, upperH, upperD)),
      mat
    );
    upperShaft.position.y = baseH + lowerH + upperH / 2;

    const topCornice = new THREE.Mesh(
      track(new THREE.BoxGeometry(upperW + 0.9, 0.6, upperD + 0.9)),
      goldMat
    );
    topCornice.position.y = baseH + h + 0.25;

    tg.add(shaft, ribA, ribB, midCornice, upperShaft, topCornice);

    const roofBaseY = baseH + h + 0.55;
    if (crownStyle === 'pyramid') {
      // Iconic Hajar / Zamzam 4-sided pitched copper-bronze roof + golden finial
      const pyrR = Math.min(upperW, upperD) * 0.66;
      const pyrH = Math.max(5.5, Math.min(upperW, upperD) * 0.58);
      const pyr = new THREE.Mesh(
        track(new THREE.ConeGeometry(pyrR, pyrH, 4)),
        roofMat
      );
      pyr.rotation.y = Math.PI / 4;
      pyr.position.y = roofBaseY + pyrH / 2;
      const spire = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.14, 0.32, 3.8, 8)),
        goldMat
      );
      spire.position.y = roofBaseY + pyrH + 1.7;
      tg.add(pyr, spire);
    } else if (crownStyle === 'octagonal') {
      // Makkah Towers octagonal stepped glass & bronze dome crown
      const oct = new THREE.Mesh(
        track(new THREE.CylinderGeometry(upperW * 0.42, upperW * 0.48, 4.4, 8)),
        mat
      );
      oct.position.y = roofBaseY + 2.2;
      const cap = new THREE.Mesh(
        track(new THREE.CylinderGeometry(upperW * 0.18, upperW * 0.42, 3.2, 8)),
        roofMat
      );
      cap.position.y = roofBaseY + 6.0;
      const finial = new THREE.Mesh(
        track(new THREE.CylinderGeometry(0.12, 0.26, 2.8, 8)),
        goldMat
      );
      finial.position.y = roofBaseY + 8.8;
      tg.add(oct, cap, finial);
    } else if (crownStyle === 'lantern') {
      // Jabal Omar modern illuminated Islamic glass roof lantern
      const parapet = new THREE.Mesh(
        track(new THREE.BoxGeometry(upperW * 0.78, 3.6, upperD * 0.78)),
        towerGlassMat
      );
      parapet.position.y = roofBaseY + 1.8;
      const crownTrim = new THREE.Mesh(
        track(new THREE.BoxGeometry(upperW * 0.82, 0.5, upperD * 0.82)),
        emissiveGoldMat
      );
      crownTrim.position.y = roofBaseY + 3.8;
      tg.add(parapet, crownTrim);
    } else {
      // Stepped Islamic parapet crown with 4 corner pinnacles
      const crown = new THREE.Mesh(
        track(new THREE.BoxGeometry(upperW * 0.76, 3.8, upperD * 0.76)),
        mat
      );
      crown.position.y = roofBaseY + 1.9;
      const cap = new THREE.Mesh(
        track(new THREE.BoxGeometry(upperW * 0.56, 2.4, upperD * 0.56)),
        roofMat
      );
      cap.position.y = roofBaseY + 5.0;
      const cxOff = upperW * 0.36;
      const czOff = upperD * 0.36;
      [
        [-cxOff, -czOff],
        [cxOff, -czOff],
        [-cxOff, czOff],
        [cxOff, czOff],
      ].forEach(([px, pz]) => {
        const pin = new THREE.Mesh(track(new THREE.CylinderGeometry(0.25, 0.4, 3.2, 8)), goldMat);
        pin.position.set(px, roofBaseY + 1.6, pz);
        tg.add(pin);
      });
      tg.add(crown, cap);
    }
    return tg;
  };

  // -------------------------------------------------------------------------
  // 1) ABRAJ AL-BAIT / MAKKAH ROYAL CLOCK TOWER (SOUTH, [-10, 0, 162])
  // -------------------------------------------------------------------------
  const clockComplex = new THREE.Group();
  clockComplex.position.set(-10, 0, 162);
  landmarksGroup.add(clockComplex);

  // Grand Stepped Shopping Mall & Sandstone-Granite Podium facing King Abdulaziz Gate (1)
  const abrajPodium1 = new THREE.Mesh(
    track(new THREE.BoxGeometry(96, 13.5, 38)),
    abrajPodiumMat
  );
  abrajPodium1.position.set(0, 6.75, 0);
  const abrajPodium2 = new THREE.Mesh(
    track(new THREE.BoxGeometry(88, 9.5, 32)),
    stoneMat
  );
  abrajPodium2.position.set(0, 18.25, 0);
  const abrajArchTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(90, 0.85, 33.4)),
    goldMat
  );
  abrajArchTrim.position.set(0, 23.2, 0);

  // Monumental Central Podium Entrance Arch Portal (north facade facing Haram at z = -19.2)
  const abrajPortalFrame = new THREE.Mesh(
    track(new THREE.BoxGeometry(20, 14.5, 2.2)),
    stoneMat
  );
  abrajPortalFrame.position.set(0, 7.25, -18.8);
  const abrajPortalRecess = new THREE.Mesh(
    track(new THREE.BoxGeometry(13.5, 11.2, 1.2)),
    clockHousingMat
  );
  abrajPortalRecess.position.set(0, 5.6, -19.5);
  const abrajPortalGlow = new THREE.Mesh(
    track(new THREE.BoxGeometry(9.5, 8.2, 0.6)),
    lampGlowMat
  );
  abrajPortalGlow.position.set(0, 4.1, -19.9);
  const abrajPortalCornice = new THREE.Mesh(
    track(new THREE.BoxGeometry(21, 1.0, 2.6)),
    goldMat
  );
  abrajPortalCornice.position.set(0, 14.8, -18.8);

  // Flanking Podium Arcade Bays along the North Promenade
  [-34, -22, 22, 34].forEach((ax) => {
    const archBay = new THREE.Mesh(track(new THREE.BoxGeometry(7.2, 9.2, 1.4)), stoneMat);
    archBay.position.set(ax, 4.6, -19.1);
    const archGlass = new THREE.Mesh(track(new THREE.BoxGeometry(4.6, 6.6, 0.8)), towerGlassMat);
    archGlass.position.set(ax, 3.6, -19.5);
    clockComplex.add(archBay, archGlass);
  });

  clockComplex.add(
    abrajPodium1,
    abrajPodium2,
    abrajArchTrim,
    abrajPortalFrame,
    abrajPortalRecess,
    abrajPortalGlow,
    abrajPortalCornice
  );

  // 6 Flanking Abraj Al-Bait Residential Towers:
  // Zamzam & Hajar (prominent front pair with iconic copper-bronze pyramidal crowns),
  // plus Safa, Marwah, Qibla, Sarah with stepped Islamic arched crowns.
  const flankingSpecs: Array<{
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
    crown: TowerCrownStyle;
  }> = [
    { x: -20, z: -4, w: 15.5, d: 15.5, h: 52, crown: 'pyramid' }, // Zamzam Tower
    { x: 20, z: -4, w: 15.5, d: 15.5, h: 52, crown: 'pyramid' }, // Hajar Tower
    { x: -34, z: 2, w: 15, d: 15, h: 42, crown: 'stepped-arch' }, // Safa Tower
    { x: 34, z: 2, w: 15, d: 15, h: 42, crown: 'stepped-arch' }, // Marwah Tower
    { x: -25, z: 12, w: 14, d: 14, h: 38, crown: 'stepped-arch' }, // Qibla Tower
    { x: 25, z: 12, w: 14, d: 14, h: 38, crown: 'stepped-arch' }, // Sarah Tower
  ];
  flankingSpecs.forEach(({ x, z, w, d, h, crown }) => {
    const fl = buildMakkahTower(x, z, w, d, h, abrajTowerMat, crown, abrajCopperRoofMat, false);
    fl.position.y = 22.8;
    clockComplex.add(fl);
  });

  // Central Monumental Makkah Royal Clock Tower Shaft (stepped ivory limestone & teal glass ribs)
  const ctLowerBody = new THREE.Mesh(
    track(new THREE.BoxGeometry(20.5, 42, 20.5)),
    abrajTowerMat
  );
  ctLowerBody.position.set(0, 44, 0);
  const ctLowerRibX = new THREE.Mesh(
    track(new THREE.BoxGeometry(22.2, 40, 12.8)),
    abrajTowerMat
  );
  ctLowerRibX.position.set(0, 44, 0);
  const ctLowerRibZ = new THREE.Mesh(
    track(new THREE.BoxGeometry(12.8, 40, 22.2)),
    abrajTowerMat
  );
  ctLowerRibZ.position.set(0, 44, 0);

  // 4 Octagonal Corner Buttress Piers rising up the Clock Tower shaft
  [
    [-9.6, -9.6],
    [9.6, -9.6],
    [-9.6, 9.6],
    [9.6, 9.6],
  ].forEach(([bx, bz]) => {
    const buttress = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.9, 2.4, 44, 8)),
      stoneMat
    );
    buttress.position.set(bx, 45, bz);
    clockComplex.add(buttress);
  });

  const ctShaftCornice = new THREE.Mesh(
    track(new THREE.BoxGeometry(21.6, 1.1, 21.6)),
    goldMat
  );
  ctShaftCornice.position.set(0, 65.2, 0);

  // Upper Mashrabiya Diamond-Lattice Collar directly below the Clock Housing
  const ctMashrabiyaCollar = new THREE.Mesh(
    track(new THREE.BoxGeometry(17.8, 20.2, 17.8)),
    clockMashrabiyaMat
  );
  ctMashrabiyaCollar.position.set(0, 75.6, 0);

  // Cantilevered golden balcony beneath the 4 clock dials
  const ctSubClockDeck = new THREE.Mesh(
    track(new THREE.BoxGeometry(19.6, 1.4, 19.6)),
    goldMat
  );
  ctSubClockDeck.position.set(0, 85.9, 0);

  // Deep Emerald-Mosaic Square Clock Housing (y = 86.6 .. 106.4)
  const ctClockBox = new THREE.Mesh(
    track(new THREE.BoxGeometry(16.6, 19.8, 16.6)),
    clockHousingMat
  );
  ctClockBox.position.set(0, 96.5, 0);

  // 4 Chamfered Corner Pinnacles flanking the Clock Housing
  [
    [-8.3, -8.3],
    [8.3, -8.3],
    [-8.3, 8.3],
    [8.3, 8.3],
  ].forEach(([px, pz]) => {
    const col = new THREE.Mesh(
      track(new THREE.CylinderGeometry(1.15, 1.35, 22.4, 8)),
      stoneMat
    );
    col.position.set(px, 97.6, pz);
    const cap = new THREE.Mesh(
      track(new THREE.ConeGeometry(1.3, 3.2, 8)),
      goldMat
    );
    cap.position.set(px, 110.4, pz);
    clockComplex.add(col, cap);
  });

  // 4 Giant Illuminated Royal Clock Faces (North facing Kaaba, South, East, West)
  // Each face includes: 1024x1024 pearlescent dial + 3D golden circular bezel +
  // live 3D Makkah-time hands + arched "الله أكبر" golden crest above + Tasbih band below!
  const dialPlaneGeo = track(new THREE.PlaneGeometry(14.4, 14.4));
  const dialBezelGeo = track(new THREE.TorusGeometry(6.05, 0.3, 10, 48));
  const crestPlaneGeo = track(new THREE.PlaneGeometry(13.8, 4.6));
  const crestHoodGeo = track(new THREE.BoxGeometry(14.4, 0.55, 0.7));
  const bandPlaneGeo = track(new THREE.PlaneGeometry(14.6, 2.3));

  const hourHandGeo = track(new THREE.BoxGeometry(0.46, 3.85, 0.14));
  hourHandGeo.translate(0, 1.45, 0);
  const hourGoldStripeGeo = track(new THREE.BoxGeometry(0.14, 3.2, 0.17));
  hourGoldStripeGeo.translate(0, 1.45, 0);

  const minHandGeo = track(new THREE.BoxGeometry(0.32, 5.45, 0.14));
  minHandGeo.translate(0, 2.15, 0);
  const minGoldStripeGeo = track(new THREE.BoxGeometry(0.1, 4.8, 0.17));
  minGoldStripeGeo.translate(0, 2.15, 0);

  const centerBossGeo = track(new THREE.CylinderGeometry(0.48, 0.48, 0.28, 16));
  centerBossGeo.rotateX(Math.PI / 2);

  const clockHandPivots: Array<{ hourPivot: THREE.Group; minutePivot: THREE.Group }> = [];

  [0, Math.PI, Math.PI / 2, -Math.PI / 2].forEach((rotY) => {
    const faceGroup = new THREE.Group();
    faceGroup.position.set(0, 0, 0);
    faceGroup.rotation.y = rotY;
    clockComplex.add(faceGroup);

    // Dial panel centered at y = 96.4, flush outside ctClockBox (+/- 8.38)
    const dial = new THREE.Mesh(dialPlaneGeo, clockDialMat);
    dial.position.set(0, 96.4, 8.38);
    faceGroup.add(dial);

    // 3D Gold Circular Bezel Frame around the clock dial
    const bezel = new THREE.Mesh(dialBezelGeo, goldMat);
    bezel.position.set(0, 96.4, 8.46);
    faceGroup.add(bezel);

    // Sculpted 3D Hour & Minute Hand Pivots
    const hourPivot = new THREE.Group();
    hourPivot.position.set(0, 96.4, 8.54);
    const hourMesh = new THREE.Mesh(hourHandGeo, clockHandDarkMat);
    const hourTrim = new THREE.Mesh(hourGoldStripeGeo, goldMat);
    hourPivot.add(hourMesh, hourTrim);

    const minutePivot = new THREE.Group();
    minutePivot.position.set(0, 96.4, 8.64);
    const minMesh = new THREE.Mesh(minHandGeo, clockHandDarkMat);
    const minTrim = new THREE.Mesh(minGoldStripeGeo, goldMat);
    minutePivot.add(minMesh, minTrim);

    const centerBoss = new THREE.Mesh(centerBossGeo, goldMat);
    centerBoss.position.set(0, 96.4, 8.68);

    faceGroup.add(hourPivot, minutePivot, centerBoss);
    clockHandPivots.push({ hourPivot, minutePivot });

    // Arched "الله أكبر" Golden Calligraphy Crest directly above the dial
    const crest = new THREE.Mesh(crestPlaneGeo, clockCrestMat);
    crest.position.set(0, 106.0, 8.42);
    const crestHood = new THREE.Mesh(crestHoodGeo, goldMat);
    crestHood.position.set(0, 108.4, 8.56);
    faceGroup.add(crest, crestHood);

    // Illuminated Tasbih Calligraphy Ribbon directly beneath the dial
    const band = new THREE.Mesh(bandPlaneGeo, clockBandMat);
    band.position.set(0, 87.9, 8.42);
    faceGroup.add(band);
  });

  // Observation Deck, Golden Louvered Lantern Crown, Jewel Sphere & 23m Golden Crescent
  const ctUpperDeck = new THREE.Mesh(
    track(new THREE.BoxGeometry(18.6, 1.8, 18.6)),
    goldMat
  );
  ctUpperDeck.position.set(0, 109.2, 0);

  const ctLanternBody = new THREE.Mesh(
    track(new THREE.CylinderGeometry(4.8, 7.2, 11.5, 8)),
    towerGlassMat
  );
  ctLanternBody.position.set(0, 115.8, 0);

  // 8 Golden Vertical Ribs framing the Lantern Observation Crown
  for (let r = 0; r < 8; r++) {
    const a = (r / 8) * Math.PI * 2;
    const rib = new THREE.Mesh(track(new THREE.BoxGeometry(0.45, 11.8, 0.85)), goldMat);
    rib.position.set(Math.cos(a) * 6.0, 115.8, Math.sin(a) * 6.0);
    rib.rotation.y = -a;
    clockComplex.add(rib);
  }

  const ctLanternRing = new THREE.Mesh(
    track(new THREE.CylinderGeometry(5.2, 5.2, 1.6, 12)),
    emissiveGoldMat
  );
  ctLanternRing.position.set(0, 121.8, 0);

  // Glowing "Jewel" Observation Sphere (الجوهرة) below the needle spire
  const ctJewelSphere = new THREE.Mesh(
    track(new THREE.SphereGeometry(2.55, 16, 12)),
    lampGlowMat
  );
  ctJewelSphere.position.set(0, 124.8, 0);
  const ctJewelRing = new THREE.Mesh(
    track(new THREE.TorusGeometry(2.7, 0.28, 8, 24)),
    goldMat
  );
  ctJewelRing.position.set(0, 124.8, 0);
  ctJewelRing.rotation.x = Math.PI / 2;

  // Slender Octagonal Gold-and-Ivory Needle Spire
  const ctSpire = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.38, 1.9, 11.5, 8)),
    goldMat
  );
  ctSpire.position.set(0, 132.2, 0);

  // Sculpted 23-Meter Golden Crescent (الهلال الذهبي) opening skyward
  const ctCrescentGroup = new THREE.Group();
  ctCrescentGroup.position.set(0, 140.2, 0);
  const ctCrescentOuter = new THREE.Mesh(
    track(new THREE.TorusGeometry(2.65, 0.56, 10, 24, Math.PI * 1.48)),
    emissiveGoldMat
  );
  ctCrescentOuter.rotation.z = Math.PI * 0.76;
  const ctCrescentBase = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.72, 10, 8)),
    emissiveGoldMat
  );
  ctCrescentBase.position.set(0, -2.5, 0);
  ctCrescentGroup.add(ctCrescentOuter, ctCrescentBase);

  clockComplex.add(
    ctLowerBody,
    ctLowerRibX,
    ctLowerRibZ,
    ctShaftCornice,
    ctMashrabiyaCollar,
    ctSubClockDeck,
    ctClockBox,
    ctUpperDeck,
    ctLanternBody,
    ctLanternRing,
    ctJewelSphere,
    ctJewelRing,
    ctSpire,
    ctCrescentGroup
  );

  // -------------------------------------------------------------------------
  // 2) AL-SAFWAH TOWERS (SOUTH-EAST, [56..78, 0, 152] — near Ajyad & Safa Gate 13)
  // -------------------------------------------------------------------------
  const safwahComplex = new THREE.Group();
  landmarksGroup.add(safwahComplex);
  const safwahPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(44, 12.5, 24)),
    abrajPodiumMat
  );
  safwahPodium.position.set(65, 6.25, 152);
  const safwahPodiumTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(45, 0.7, 25)),
    goldMat
  );
  safwahPodiumTrim.position.set(65, 12.7, 152);
  safwahComplex.add(safwahPodium, safwahPodiumTrim);

  [
    { x: 51, z: 150, w: 12, d: 14, h: 36 },
    { x: 63, z: 154, w: 14, d: 15, h: 42 },
    { x: 76, z: 151, w: 13, d: 14, h: 34 },
  ].forEach(({ x, z, w, d, h }) => {
    const tw = buildMakkahTower(x, z, w, d, h, safwahTowerMat, 'stepped-arch', bronzeMat, false);
    tw.position.y = 12.8;
    safwahComplex.add(tw);
  });

  // -------------------------------------------------------------------------
  // 3) MAKKAH TOWERS & MAKKAH HILTON (SOUTH-WEST, [-80..-108, 0, 140..148])
  // -------------------------------------------------------------------------
  const hiltonComplex = new THREE.Group();
  landmarksGroup.add(hiltonComplex);
  const hiltonPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(46, 11.5, 28)),
    abrajPodiumMat
  );
  hiltonPodium.position.set(-90, 5.75, 144);
  const hiltonPodiumTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(47, 0.7, 29)),
    goldMat
  );
  hiltonPodiumTrim.position.set(-90, 11.7, 144);
  hiltonComplex.add(hiltonPodium, hiltonPodiumTrim);

  [
    { x: -77, z: 146, w: 15, d: 15, h: 38 },
    { x: -91, z: 144, w: 16, d: 16, h: 41 },
    { x: -104, z: 140, w: 14, d: 14, h: 34 },
  ].forEach(({ x, z, w, d, h }) => {
    const tw = buildMakkahTower(x, z, w, d, h, hiltonMakkahMat, 'octagonal', darkGreenMarbleMat, false);
    tw.position.y = 11.8;
    hiltonComplex.add(tw);
  });

  // -------------------------------------------------------------------------
  // 4) JABAL OMAR TOWERS (WEST, x = -140..-168 — facing King Fahd Gate 79 & Bab Al-Umrah 62)
  // -------------------------------------------------------------------------
  const jabalOmarComplex = new THREE.Group();
  landmarksGroup.add(jabalOmarComplex);

  // Terraced Makkah granite hillside & commercial mall podium along Jabal Omar
  const joHillBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(46, 8.5, 96)),
    jabalRockMat
  );
  joHillBase.position.set(-152, 4.25, 6);
  const joMallPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(40, 9.0, 90)),
    stoneMat
  );
  joMallPodium.position.set(-150, 12.5, 6);
  const joPodiumTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(41, 0.7, 91)),
    goldMat
  );
  joPodiumTrim.position.set(-150, 17.2, 6);
  jabalOmarComplex.add(joHillBase, joMallPodium, joPodiumTrim);

  // Twin & Stepped Jabal Omar Towers (Conrad / Hyatt / Marriott / Hilton Suites)
  const jabalOmarSpecs: Array<{
    x: number;
    z: number;
    w: number;
    d: number;
    h: number;
    crown: TowerCrownStyle;
  }> = [
    { x: -142, z: 40, w: 16, d: 16, h: 40, crown: 'lantern' },
    { x: -142, z: 18, w: 18, d: 16, h: 48, crown: 'lantern' },
    { x: -142, z: -6, w: 17, d: 16, h: 44, crown: 'lantern' },
    { x: -140, z: -30, w: 15, d: 15, h: 36, crown: 'stepped-arch' },
    { x: -162, z: 10, w: 17, d: 18, h: 46, crown: 'stepped-arch' },
  ];
  jabalOmarSpecs.forEach(({ x, z, w, d, h, crown }) => {
    const tw = buildMakkahTower(x, z, w, d, h, jabalOmarMat, crown, towerGlassMat, false);
    tw.position.y = 17.4;
    jabalOmarComplex.add(tw);
  });

  // Iconic Jabal Omar Elevated Sky-Bridges linking the front twin towers
  [29, 6].forEach((bz) => {
    const bridge = new THREE.Mesh(
      track(new THREE.BoxGeometry(10, 4.2, 7.5)),
      jabalOmarMat
    );
    bridge.position.set(-142, 42, bz);
    jabalOmarComplex.add(bridge);
  });

  // -------------------------------------------------------------------------
  // 5) SHAMIYAH / JABAL AL-KAABA TOWERS (NORTH-WEST) & AL-GHAZZAH TOWERS (NORTH-EAST)
  // -------------------------------------------------------------------------
  const shamiyahHill = new THREE.Mesh(
    track(new THREE.BoxGeometry(48, 7.5, 24)),
    jabalRockMat
  );
  shamiyahHill.position.set(-84, 3.75, -154);
  const shamiyahPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(44, 7.5, 20)),
    stoneMat
  );
  shamiyahPodium.position.set(-84, 11.25, -154);
  landmarksGroup.add(shamiyahHill, shamiyahPodium);

  const shamTw1 = buildMakkahTower(-96, -152, 18, 16, 36, shamiyahTowerMat, 'stepped-arch', towerGlassMat, false);
  shamTw1.position.y = 15.0;
  const shamTw2 = buildMakkahTower(-72, -156, 17, 15, 32, shamiyahTowerMat, 'lantern', towerGlassMat, false);
  shamTw2.position.y = 15.0;
  landmarksGroup.add(shamTw1, shamTw2);

  // Al-Ghazzah District Towers (North-East near Bab Al-Marwah 25)
  const ghazzahPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(36, 9.5, 20)),
    abrajPodiumMat
  );
  ghazzahPodium.position.set(104, 4.75, -148);
  landmarksGroup.add(ghazzahPodium);
  const ghz1 = buildMakkahTower(95, -148, 16, 16, 34, ghazzahTowerMat, 'stepped-arch', bronzeMat, false);
  ghz1.position.y = 9.6;
  const ghz2 = buildMakkahTower(114, -146, 14, 14, 29, ghazzahTowerMat, 'stepped-arch', bronzeMat, false);
  ghz2.position.y = 9.6;
  landmarksGroup.add(ghz1, ghz2);

  // -------------------------------------------------------------------------
  // 6) JABAL ABI QUBAIS & AL-SAFA ROYAL PALACE (EAST-SOUTHEAST, [156, 0, 60])
  // -------------------------------------------------------------------------
  const qubaisComplex = new THREE.Group();
  qubaisComplex.position.set(156, 0, 60);
  landmarksGroup.add(qubaisComplex);

  // Grounded granite rocky mountain ridge rising behind Al-Safa Palace
  const qubaisTerrainBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(38, 10.5, 48)),
    jabalRockMat
  );
  qubaisTerrainBase.position.set(2, 2.45, 0);
  const qubaisRidgeUpper = new THREE.Mesh(
    track(new THREE.BoxGeometry(24, 9.5, 40)),
    jabalRockMat
  );
  qubaisRidgeUpper.position.set(9, 10.5, 0);
  qubaisComplex.add(qubaisTerrainBase, qubaisRidgeUpper);

  // Faceted natural Makkah granite rocky peaks framing the mountain slope
  [
    { x: 11, y: 16.5, z: -14, sx: 6.2, sy: 4.8, sz: 7.4 },
    { x: 13, y: 18.2, z: 2, sx: 7.0, sy: 5.5, sz: 8.2 },
    { x: 10, y: 16.0, z: 16, sx: 6.0, sy: 4.6, sz: 6.8 },
    { x: -12, y: 8.5, z: -19, sx: 4.4, sy: 2.8, sz: 4.2 },
    { x: -12, y: 8.5, z: 19, sx: 4.4, sy: 2.8, sz: 4.2 },
  ].forEach((crag) => {
    const rock = new THREE.Mesh(track(new THREE.DodecahedronGeometry(1.4, 1)), jabalRockMat);
    rock.scale.set(crag.sx, crag.sy, crag.sz);
    rock.position.set(crag.x, crag.y, crag.z);
    qubaisComplex.add(rock);
  });

  // Terraced Stone Retaining Podium facing west toward Bab Al-Safa & Bab Bani Shaibah
  const qubaisPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(26, 7.2, 34)),
    stoneMat
  );
  qubaisPodium.position.set(-4, 10.8, 0);
  const qubaisPodiumTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(27, 0.75, 35)),
    goldMat
  );
  qubaisPodiumTrim.position.set(-4, 14.6, 0);
  qubaisComplex.add(qubaisPodium, qubaisPodiumTrim);

  // Al-Safa Royal Palace Main Body & Mashrabiya Arched Gallery
  const palaceBody = new THREE.Mesh(
    track(new THREE.BoxGeometry(19, 12.5, 26)),
    qubaisPalaceMat
  );
  palaceBody.position.set(-3.5, 21.2, 0);
  const palacePortico = new THREE.Mesh(
    track(new THREE.BoxGeometry(2.4, 9.6, 18)),
    mashrabiyaMat
  );
  palacePortico.position.set(-13.2, 19.8, 0);
  const palaceCornice = new THREE.Mesh(
    track(new THREE.BoxGeometry(20.4, 0.9, 27.4)),
    goldMat
  );
  palaceCornice.position.set(-3.5, 27.8, 0);
  qubaisComplex.add(palaceBody, palacePortico, palaceCornice);

  // Corner Palatial Octagonal Turrets + Golden Caps
  [
    [-11.5, -11.5],
    [-11.5, 11.5],
    [4.5, -11.5],
    [4.5, 11.5],
  ].forEach(([tx, tz]) => {
    const turret = new THREE.Mesh(
      track(new THREE.CylinderGeometry(2.6, 2.9, 15.2, 8)),
      stoneMat
    );
    turret.position.set(tx, 22.4, tz);
    const turretCap = new THREE.Mesh(
      track(new THREE.SphereGeometry(2.7, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2)),
      goldMat
    );
    turretCap.position.set(tx, 30.0, tz);
    qubaisComplex.add(turret, turretCap);
  });

  // Grand Central Dome & Finial crowning Al-Safa Palace
  const palaceDrum = new THREE.Mesh(
    track(new THREE.CylinderGeometry(5.6, 6.0, 3.2, 16)),
    darkGreenMarbleMat
  );
  palaceDrum.position.set(-3.5, 29.8, 0);
  const palaceDome = new THREE.Mesh(
    track(new THREE.SphereGeometry(5.5, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
    domeMat
  );
  palaceDome.position.set(-3.5, 31.4, 0);
  const palaceSpire = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.14, 0.34, 4.2, 8)),
    goldMat
  );
  palaceSpire.position.set(-3.5, 38.6, 0);
  qubaisComplex.add(palaceDrum, palaceDome, palaceSpire);

  // -------------------------------------------------------------------------
  // 7) MAKKAH LIBRARY & SHI'B ALI PAVILION (EAST CENTER, [154, 0, -6])
  // -------------------------------------------------------------------------
  const libraryComplex = new THREE.Group();
  libraryComplex.position.set(154, 0, -6);
  landmarksGroup.add(libraryComplex);

  // Grounded Marble & Stone Terrace Platform aligned with East Central Plaza Stairs
  const libBaseLower = new THREE.Mesh(
    track(new THREE.BoxGeometry(34, 6.2, 42)),
    warmGraniteMat
  );
  libBaseLower.position.set(0, 0.3, 0);
  const libBaseUpper = new THREE.Mesh(
    track(new THREE.BoxGeometry(30, 4.2, 38)),
    whiteMarbleMat
  );
  libBaseUpper.position.set(0, 5.4, 0);
  const libPodiumTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(31, 0.65, 39)),
    goldMat
  );
  libPodiumTrim.position.set(0, 7.6, 0);
  libraryComplex.add(libBaseLower, libBaseUpper, libPodiumTrim);

  // Wide Ceremonial Entry Steps descending west toward Bab Al-Salam (gate-19)
  for (let s = 0; s < 4; s++) {
    const libStep = new THREE.Mesh(
      track(new THREE.BoxGeometry(1.4, 0.85, 16 - s * 1.2)),
      s % 2 === 0 ? whiteMarbleMat : stoneMat
    );
    libStep.position.set(-15.6 - s * 0.95, 6.6 - s * 1.4, 0);
    libraryComplex.add(libStep);
  }

  // Historic Makkah Library Pavilion (Site of the Prophet's ﷺ Birthplace in Shi'b Ali)
  const libPavilion = new THREE.Mesh(
    track(new THREE.BoxGeometry(15.5, 10.2, 18.5)),
    stoneMat
  );
  libPavilion.position.set(-5.5, 12.8, 0);
  const libFacade = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.4, 7.4, 14.5)),
    mashrabiyaMat
  );
  libFacade.position.set(-13.4, 12.2, 0);
  const libPortalFrame = new THREE.Mesh(
    track(new THREE.BoxGeometry(1.9, 8.8, 6.8)),
    goldMat
  );
  libPortalFrame.position.set(-13.6, 12.4, 0);
  const libPlaque = new THREE.Mesh(
    track(new THREE.BoxGeometry(0.4, 2.4, 6.2)),
    libraryPlaqueMat
  );
  libPlaque.position.set(-14.7, 15.6, 0);
  const libCornice = new THREE.Mesh(
    track(new THREE.BoxGeometry(16.6, 0.8, 19.6)),
    goldMat
  );
  libCornice.position.set(-5.5, 18.2, 0);
  libraryComplex.add(libPavilion, libFacade, libPortalFrame, libPlaque, libCornice);

  // Iconic Emerald Dome of Makkah Library
  const libDrum = new THREE.Mesh(
    track(new THREE.CylinderGeometry(4.6, 5.0, 2.8, 16)),
    stoneMat
  );
  libDrum.position.set(-5.5, 19.8, 0);
  const libDome = new THREE.Mesh(
    track(new THREE.SphereGeometry(4.6, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2)),
    emeraldDomeMat
  );
  libDome.position.set(-5.5, 21.2, 0);
  const libSpire = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.12, 0.28, 3.6, 8)),
    goldMat
  );
  libSpire.position.set(-5.5, 27.2, 0);
  libraryComplex.add(libDrum, libDome, libSpire);

  // Flanking Shi'b Ali / Al-Qushashiyah Heritage Terrace Towers behind the Library
  const shibTw1 = buildMakkahTower(7, -11, 13, 13, 25, qubaisPalaceMat, 'stepped-arch', bronzeMat, false);
  shibTw1.position.y = 7.6;
  const shibTw2 = buildMakkahTower(7, 11, 13, 13, 22, qushashiyahTowerMat, 'octagonal', emeraldDomeMat, false);
  shibTw2.position.y = 7.6;
  libraryComplex.add(shibTw1, shibTw2);

  // -------------------------------------------------------------------------
  // 8) AL-QUSHASHIYAH & AL-MARWAH PLAZA TOWERS (EAST-NORTHEAST, [154, 0, -72])
  // -------------------------------------------------------------------------
  const qushashiyahComplex = new THREE.Group();
  landmarksGroup.add(qushashiyahComplex);

  const qushRockBase = new THREE.Mesh(
    track(new THREE.BoxGeometry(34, 8.2, 52)),
    jabalRockMat
  );
  qushRockBase.position.set(155, 1.3, -72);
  const qushPodium = new THREE.Mesh(
    track(new THREE.BoxGeometry(30, 6.8, 48)),
    abrajPodiumMat
  );
  qushPodium.position.set(154, 8.6, -72);
  const qushPodiumTrim = new THREE.Mesh(
    track(new THREE.BoxGeometry(31, 0.7, 49)),
    goldMat
  );
  qushPodiumTrim.position.set(154, 12.2, -72);
  qushashiyahComplex.add(qushRockBase, qushPodium, qushPodiumTrim);

  [
    { x: 149, z: -56, w: 14, d: 14, h: 33, crown: 'lantern' as TowerCrownStyle, roof: towerGlassMat },
    { x: 157, z: -72, w: 16, d: 15, h: 38, crown: 'stepped-arch' as TowerCrownStyle, roof: bronzeMat },
    { x: 149, z: -88, w: 14, d: 14, h: 31, crown: 'octagonal' as TowerCrownStyle, roof: emeraldDomeMat },
  ].forEach(({ x, z, w, d, h, crown, roof }) => {
    const tw = buildMakkahTower(x, z, w, d, h, qushashiyahTowerMat, crown, roof, false);
    tw.position.y = 12.4;
    qushashiyahComplex.add(tw);
  });

  // Elevated Sky-Bridge connecting the Al-Qushashiyah front towers
  const qushBridge = new THREE.Mesh(
    track(new THREE.BoxGeometry(8.5, 3.8, 9.5)),
    qushashiyahTowerMat
  );
  qushBridge.position.set(151, 31, -64);
  qushashiyahComplex.add(qushBridge);

  // =========================================================================
  // 10. THREE-POINT STUDIO + INTERIOR MASA & MATAF LIGHTING RIG
  // =========================================================================
  const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0xc7b396, 0.92);
  hemiLight.position.set(0, 120, 0);
  root.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff5e4, 1.95);
  sunLight.position.set(95, 130, 85);
  sunLight.castShadow = !isSoftwareGl;
  if (!isSoftwareGl) {
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    const d = 105;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 360;
    sunLight.shadow.bias = -0.0006;
    sunLight.shadow.normalBias = 0.03;
  }
  root.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.68);
  fillLight.position.set(-100, 75, -95);
  root.add(fillLight);

  // Dedicated Interior Floodlights (Kaaba, Safa, Mas'a Green Zone, Marwah, Expansion)
  const nightGlowLights: THREE.PointLight[] = [];
  const kaabaFlood = new THREE.PointLight(0xffebc2, 0.85, 80, 1.4);
  kaabaFlood.position.set(0, 18, 0);
  root.add(kaabaFlood);
  nightGlowLights.push(kaabaFlood);

  const safaInteriorLight = new THREE.PointLight(0xfff1cf, 1.5, 52, 1.3);
  safaInteriorLight.position.set(masaX, 11.5, 66);
  root.add(safaInteriorLight);
  nightGlowLights.push(safaInteriorLight);

  const masaGreenLight = new THREE.PointLight(0x6ee7b7, 1.65, 56, 1.3);
  masaGreenLight.position.set(masaX, 10.5, 0);
  root.add(masaGreenLight);
  nightGlowLights.push(masaGreenLight);

  const marwahInteriorLight = new THREE.PointLight(0xfff1cf, 1.5, 52, 1.3);
  marwahInteriorLight.position.set(masaX, 11.5, -66);
  root.add(marwahInteriorLight);
  nightGlowLights.push(marwahInteriorLight);

  const expInteriorLight = new THREE.PointLight(0xfff0cc, 1.2, 85, 1.4);
  expInteriorLight.position.set(0, 12.0, -88);
  root.add(expInteriorLight);
  nightGlowLights.push(expInteriorLight);

  const applyLighting = (preset: LightingPreset, scene: THREE.Scene) => {
    if (preset === 'day') {
      const sky = new THREE.Color(0xdbeafe);
      scene.background = sky;
      scene.fog = new THREE.FogExp2(0xdbeafe, 0.0014);
      hemiLight.color.setHex(0xe0f2fe);
      hemiLight.groundColor.setHex(0xcab598);
      hemiLight.intensity = 0.95;
      sunLight.color.setHex(0xfff6e5);
      sunLight.intensity = 2.0;
      sunLight.position.set(95, 130, 85);
      fillLight.color.setHex(0xbae6fd);
      fillLight.intensity = 0.68;
      emissiveGoldMat.emissiveIntensity = 0.25;
      greenMasaMat.emissiveIntensity = 0.65;
      lampGlowMat.emissiveIntensity = 0.7;
      kaabaFlood.intensity = 0.75;
      safaInteriorLight.intensity = 1.45;
      masaGreenLight.intensity = 1.55;
      marwahInteriorLight.intensity = 1.45;
      expInteriorLight.intensity = 1.15;
      clockDialMat.emissive.setHex(0xffffff);
      clockDialMat.emissiveIntensity = 0.22;
      clockCrestMat.emissiveIntensity = 0.28;
      clockBandMat.emissiveIntensity = 0.26;
      clockMashrabiyaMat.emissiveIntensity = 0.14;
    } else if (preset === 'sunset') {
      const sky = new THREE.Color(0xfdba74);
      scene.background = sky;
      scene.fog = new THREE.FogExp2(0xf3a678, 0.0014);
      hemiLight.color.setHex(0xfed7aa);
      hemiLight.groundColor.setHex(0x5b4636);
      hemiLight.intensity = 0.82;
      sunLight.color.setHex(0xff9e54);
      sunLight.intensity = 2.15;
      sunLight.position.set(-140, 42, 65);
      fillLight.color.setHex(0x818cf8);
      fillLight.intensity = 0.58;
      emissiveGoldMat.emissiveIntensity = 0.78;
      greenMasaMat.emissiveIntensity = 0.95;
      lampGlowMat.emissiveIntensity = 1.15;
      kaabaFlood.intensity = 2.2;
      safaInteriorLight.intensity = 2.1;
      masaGreenLight.intensity = 2.0;
      marwahInteriorLight.intensity = 2.1;
      expInteriorLight.intensity = 1.85;
      clockDialMat.emissive.setHex(0xd1fae5);
      clockDialMat.emissiveIntensity = 0.65;
      clockCrestMat.emissiveIntensity = 0.72;
      clockBandMat.emissiveIntensity = 0.68;
      clockMashrabiyaMat.emissiveIntensity = 0.42;
    } else {
      const sky = new THREE.Color(0x0b1220);
      scene.background = sky;
      scene.fog = new THREE.FogExp2(0x0b1220, 0.0013);
      hemiLight.color.setHex(0x334155);
      hemiLight.groundColor.setHex(0x1e293b);
      hemiLight.intensity = 0.92;
      sunLight.color.setHex(0x93c5fd);
      sunLight.intensity = 0.88;
      sunLight.position.set(-70, 125, -60);
      fillLight.color.setHex(0xfde68a);
      fillLight.intensity = 0.72;
      emissiveGoldMat.emissiveIntensity = 1.38;
      greenMasaMat.emissiveIntensity = 1.4;
      lampGlowMat.emissiveIntensity = 1.5;
      kaabaFlood.intensity = 3.8;
      safaInteriorLight.intensity = 2.8;
      masaGreenLight.intensity = 2.7;
      marwahInteriorLight.intensity = 2.8;
      expInteriorLight.intensity = 2.6;
      clockDialMat.emissive.setHex(0xa7f3d0);
      clockDialMat.emissiveIntensity = 1.25;
      clockCrestMat.emissiveIntensity = 1.28;
      clockBandMat.emissiveIntensity = 1.18;
      clockMashrabiyaMat.emissiveIntensity = 0.78;
    }
  };

  let targetRoofOpacity = 1;
  const setRoofCutaway = (cutaway: boolean) => {
    targetRoofOpacity = cutaway ? 0.14 : 1;
    roofMeshes.forEach((m) => {
      m.castShadow = !cutaway && !isSoftwareGl;
    });
  };

  // =========================================================================
  // 11. LIVING UMRAH TOUR VISUALS: 7 TAWAF CIRCUITS + 7 SA'I LAPS + HERO PILGRIM + AMBIENT CROWD
  // =========================================================================
  const ritualOverlayGroup = new THREE.Group();
  root.add(ritualOverlayGroup);

  const tawaf7Group = new THREE.Group();
  tawaf7Group.visible = false;
  ritualOverlayGroup.add(tawaf7Group);

  const sai7Group = new THREE.Group();
  sai7Group.visible = false;
  ritualOverlayGroup.add(sai7Group);

  const tawafRingMats: THREE.MeshStandardMaterial[] = [];
  const tawafRingCurves: THREE.CatmullRomCurve3[] = [];
  const tawafOrbs: Array<{ mesh: THREE.Mesh; lap: number; phase: number }> = [];

  const arrowConeGeo = track(new THREE.ConeGeometry(0.32, 0.78, 8));
  arrowConeGeo.rotateX(Math.PI / 2);
  const flowOrbGeo = track(new THREE.SphereGeometry(0.34, 8, 8));

  // Build all 7 Tawaf Circuit Rings around the Kaaba (outside Hijr Ismail)
  for (let lap = 0; lap < 7; lap++) {
    const pts: THREE.Vector3[] = [];
    const segs = 40;
    for (let s = 0; s < segs; s++) {
      pts.push(sampleTawafPoint(lap, s / segs, new THREE.Vector3()));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    tawafRingCurves.push(curve);

    const isRamal = lap < 3;
    const baseColor = isRamal ? 0xf59e0b : 0x10b981;
    const ringMat = track(
      new THREE.MeshStandardMaterial({
        color: baseColor,
        emissive: new THREE.Color(baseColor),
        emissiveIntensity: 0.75,
        roughness: 0.25,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
      })
    );
    tawafRingMats.push(ringMat);

    const ringGeo = track(new THREE.TubeGeometry(curve, 72, 0.16, 6, true));
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    tawaf7Group.add(ringMesh);

    // 2 directional arrowheads per circuit showing counter-clockwise flow
    [0.12, 0.62].forEach((u) => {
      const pos = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      const arrow = new THREE.Mesh(arrowConeGeo, ringMat);
      arrow.position.copy(pos).setY(0.34);
      arrow.lookAt(pos.x + tan.x, 0.34, pos.z + tan.z);
      tawaf7Group.add(arrow);
    });

    const orb = new THREE.Mesh(flowOrbGeo, lampGlowMat);
    tawaf7Group.add(orb);
    tawafOrbs.push({ mesh: orb, lap, phase: lap * 0.14 });
  }

  // Build all 7 Sa'i Laps inside Al-Mas'a: Golden-amber in normal walking zones, distinct vivid Green in Harwalah zone (z in -8.5..8.5)
  const saiNormalMats: THREE.MeshStandardMaterial[] = [];
  const saiFastMats: THREE.MeshStandardMaterial[] = [];
  const saiLapCurves: THREE.CatmullRomCurve3[] = [];
  const saiOrbs: Array<{ mesh: THREE.Mesh; lap: number; phase: number }> = [];

  for (let lap = 0; lap < 7; lap++) {
    const pts: THREE.Vector3[] = [];
    const segs = 28;
    for (let s = 0; s <= segs; s++) {
      pts.push(sampleSaiPoint(lap, s / segs, new THREE.Vector3()));
    }
    const curve = new THREE.CatmullRomCurve3(pts, false);
    saiLapCurves.push(curve);

    const normalMat = track(
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: new THREE.Color(0xd97706),
        emissiveIntensity: 0.72,
        roughness: 0.25,
        metalness: 0.2,
        transparent: true,
        opacity: 0.9,
      })
    );
    const fastMat = track(
      new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: new THREE.Color(0x10b981),
        emissiveIntensity: 1.05,
        roughness: 0.2,
        metalness: 0.2,
        transparent: true,
        opacity: 0.96,
      })
    );
    saiNormalMats.push(normalMat);
    saiFastMats.push(fastMat);

    // Normal & green Harwalah segments aligned to fixed green zone z in [+12.5, +37.5] (first half from Safa)
    const buildSubPoints = (uStart: number, uEnd: number, count: number) => {
      const sub: THREE.Vector3[] = [];
      for (let k = 0; k <= count; k++) {
        sub.push(sampleSaiPoint(lap, THREE.MathUtils.lerp(uStart, uEnd, k / count), new THREE.Vector3()));
      }
      return new THREE.CatmullRomCurve3(sub, false);
    };

    const isGoingNorth = lap % 2 === 0;
    const uFastA = isGoingNorth ? 25 / 125 : 75 / 125;
    const uFastB = isGoingNorth ? 50 / 125 : 100 / 125;
    const normCurve1 = buildSubPoints(0, uFastA, isGoingNorth ? 10 : 18);
    const fastCurve = buildSubPoints(uFastA, uFastB, 10);
    const normCurve2 = buildSubPoints(uFastB, 1, isGoingNorth ? 18 : 10);

    sai7Group.add(new THREE.Mesh(track(new THREE.TubeGeometry(normCurve1, 18, 0.15, 6, false)), normalMat));
    sai7Group.add(new THREE.Mesh(track(new THREE.TubeGeometry(fastCurve, 14, 0.21, 6, false)), fastMat));
    sai7Group.add(new THREE.Mesh(track(new THREE.TubeGeometry(normCurve2, 18, 0.15, 6, false)), normalMat));

    // Directional chevron arrows in normal & Harwalah zones
    [
      { u: isGoingNorth ? 0.10 : 0.30, mat: normalMat },
      { u: isGoingNorth ? 0.30 : 0.70, mat: fastMat },
      { u: isGoingNorth ? 0.70 : 0.90, mat: normalMat },
    ].forEach(({ u, mat }) => {
      const pos = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      const arrow = new THREE.Mesh(arrowConeGeo, mat);
      arrow.position.copy(pos).setY(0.38);
      arrow.lookAt(pos.x + tan.x, 0.38, pos.z + tan.z);
      sai7Group.add(arrow);
    });

    const orb = new THREE.Mesh(flowOrbGeo, lampGlowMat);
    sai7Group.add(orb);
    saiOrbs.push({ mesh: orb, lap, phase: lap * 0.17 });
  }

  let currentActiveTawafLap = 0;
  let currentActiveSaiLap = 0;
  const setRitualOverlay = (
    mode: RitualOverlayMode,
    activeTawafLap = 0,
    activeSaiLap = 0
  ) => {
    tawaf7Group.visible = mode === 'tawaf' || mode === 'both';
    sai7Group.visible = mode === 'sai' || mode === 'both';
    currentActiveTawafLap = activeTawafLap;
    currentActiveSaiLap = activeSaiLap;

    tawafRingMats.forEach((mat, idx) => {
      const isHighlighted = activeTawafLap > 0 && idx + 1 === activeTawafLap;
      mat.emissiveIntensity = isHighlighted ? 1.85 : activeTawafLap > 0 ? 0.45 : 0.85;
      mat.opacity = isHighlighted ? 1 : activeTawafLap > 0 ? 0.55 : 0.92;
    });
    saiNormalMats.forEach((mat, idx) => {
      const isHighlighted = activeSaiLap > 0 && idx + 1 === activeSaiLap;
      mat.emissiveIntensity = isHighlighted ? 1.75 : activeSaiLap > 0 ? 0.42 : 0.78;
      mat.opacity = isHighlighted ? 1 : activeSaiLap > 0 ? 0.55 : 0.9;
    });
    saiFastMats.forEach((mat, idx) => {
      const isHighlighted = activeSaiLap > 0 && idx + 1 === activeSaiLap;
      mat.emissiveIntensity = isHighlighted ? 2.15 : activeSaiLap > 0 ? 0.68 : 1.05;
      mat.opacity = isHighlighted ? 1 : activeSaiLap > 0 ? 0.72 : 0.96;
    });
  };

  // Dedicated Illuminated Path from Zamzam Well -> Bab Al-Salam wide passage -> Mount Safa
  const zamzamToSafaGroup = new THREE.Group();
  zamzamToSafaGroup.visible = false;
  ritualOverlayGroup.add(zamzamToSafaGroup);

  const zamzamSafaPts = [
    new THREE.Vector3(16.8, 0.36, 7.6),
    new THREE.Vector3(34.0, 0.36, 6.0),
    new THREE.Vector3(58.0, 0.36, 6.0),
    new THREE.Vector3(64.5, 0.36, 22.0),
    new THREE.Vector3(64.5, 0.36, 48.0),
    new THREE.Vector3(67.6, 0.72, 64.5),
  ];
  const zamzamSafaCurve = new THREE.CatmullRomCurve3(zamzamSafaPts);
  const zamzamSafaMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: new THREE.Color(0x10b981),
      emissiveIntensity: 1.05,
      roughness: 0.2,
      metalness: 0.25,
      transparent: true,
      opacity: 0.94,
    })
  );
  const zamzamSafaTubeGeo = track(new THREE.TubeGeometry(zamzamSafaCurve, 56, 0.24, 8, false));
  const zamzamSafaMesh = new THREE.Mesh(zamzamSafaTubeGeo, zamzamSafaMat);
  zamzamToSafaGroup.add(zamzamSafaMesh);

  [0.2, 0.52, 0.84].forEach((u) => {
    const pos = zamzamSafaCurve.getPointAt(u);
    const tan = zamzamSafaCurve.getTangentAt(u);
    const arrow = new THREE.Mesh(arrowConeGeo, zamzamSafaMat);
    arrow.scale.setScalar(1.35);
    arrow.position.copy(pos).setY(pos.y + 0.14);
    arrow.lookAt(pos.x + tan.x, pos.y + 0.14, pos.z + tan.z);
    zamzamToSafaGroup.add(arrow);
  });

  const zamzamSafaOrbs: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const orb = new THREE.Mesh(flowOrbGeo, orbMat);
    orb.scale.setScalar(1.15);
    zamzamToSafaGroup.add(orb);
    zamzamSafaOrbs.push(orb);
  }

  const setZamzamToSafaPath = (visible: boolean) => {
    zamzamToSafaGroup.visible = visible;
  };

  // Living 3D Ihram Hero Pilgrim Avatar (Idtiba right shoulder uncovered vs covered + long-to-short hair)
  const ihramWhiteMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.65,
      metalness: 0.02,
      emissive: new THREE.Color(0xfef9c3),
      emissiveIntensity: 0.14,
    })
  );
  const skinMat = track(
    new THREE.MeshStandardMaterial({
      color: 0xd9a77e,
      roughness: 0.68,
      metalness: 0.02,
    })
  );
  const hairMat = track(
    new THREE.MeshStandardMaterial({
      color: 0x1e1714,
      roughness: 0.84,
      metalness: 0.04,
    })
  );
  const heroGroup = new THREE.Group();
  heroGroup.visible = false;
  root.add(heroGroup);

  const heroBodyPivot = new THREE.Group();
  heroGroup.add(heroBodyPivot);

  // Note: Local +Z is forward facing; in Three.js (+X cross +Y = +Z), -X is character's RIGHT side and +X is LEFT side.
  const skinTorsoMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.27, 0.32, 0.70, 12)), skinMat);
  skinTorsoMesh.position.y = 1.18;
  const izarMesh = new THREE.Mesh(track(new THREE.CylinderGeometry(0.32, 0.37, 0.62, 12)), ihramWhiteMat);
  izarMesh.position.y = 0.62;
  const headMesh = new THREE.Mesh(track(new THREE.SphereGeometry(0.21, 14, 12)), skinMat);
  headMesh.position.y = 1.74;

  // Idtiba' Rida' Wrap: covers waist + diagonal sash over LEFT shoulder (+X) leaving RIGHT shoulder (-X) clearly uncovered
  const idtibaGroup = new THREE.Group();
  const idtibaWaist = new THREE.Mesh(track(new THREE.CylinderGeometry(0.305, 0.335, 0.34, 12)), ihramWhiteMat);
  idtibaWaist.position.y = 1.00;
  const idtibaDiagSash = new THREE.Mesh(track(new THREE.BoxGeometry(0.58, 0.24, 0.44)), ihramWhiteMat);
  idtibaDiagSash.position.set(0.04, 1.32, 0);
  idtibaDiagSash.rotation.z = -0.58;
  const idtibaLeftShoulderPad = new THREE.Mesh(track(new THREE.SphereGeometry(0.14, 10, 8)), ihramWhiteMat);
  idtibaLeftShoulderPad.scale.set(1.1, 0.72, 1.45);
  idtibaLeftShoulderPad.position.set(0.22, 1.48, 0);
  idtibaGroup.add(idtibaWaist, idtibaDiagSash, idtibaLeftShoulderPad);
  idtibaGroup.visible = false;

  // Full Covered Rida': covers BOTH left (+X) and right (-X) shoulders (for Sa'i, Marwah, Prayer, etc.)
  const coveredRidaGroup = new THREE.Group();
  const coveredTorso = new THREE.Mesh(track(new THREE.CylinderGeometry(0.295, 0.345, 0.72, 12)), ihramWhiteMat);
  coveredTorso.position.y = 1.18;
  const coveredShoulderR = new THREE.Mesh(track(new THREE.SphereGeometry(0.14, 10, 8)), ihramWhiteMat);
  coveredShoulderR.scale.set(1.15, 0.74, 1.45);
  coveredShoulderR.position.set(-0.22, 1.48, 0);
  const coveredShoulderL = new THREE.Mesh(track(new THREE.SphereGeometry(0.14, 10, 8)), ihramWhiteMat);
  coveredShoulderL.scale.set(1.15, 0.74, 1.45);
  coveredShoulderL.position.set(0.22, 1.48, 0);
  coveredRidaGroup.add(coveredTorso, coveredShoulderR, coveredShoulderL);

  // Relatively Long Hair (before Tahallul) vs Short Cropped Hair (after completing Sa'i at Safa & Marwah)
  const longHairGroup = new THREE.Group();
  const longHairCrown = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.232, 14, 12)),
    hairMat
  );
  longHairCrown.scale.set(1.04, 1.0, 1.08);
  longHairCrown.position.set(0, 1.775, -0.028);
  const longHairBackFlow = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.226, 0.258, 0.29, 12, 1, false, Math.PI * 0.52, Math.PI * 0.96)),
    hairMat
  );
  longHairBackFlow.position.set(0, 1.635, -0.025);
  longHairGroup.add(longHairCrown, longHairBackFlow);

  const shortHairGroup = new THREE.Group();
  const shortHairCap = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.214, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.52)),
    hairMat
  );
  shortHairCap.position.set(0, 1.755, -0.014);
  shortHairCap.rotation.x = -0.18;
  shortHairGroup.add(shortHairCap);
  shortHairGroup.visible = false;

  const legGeo = track(new THREE.CylinderGeometry(0.11, 0.09, 0.55, 8));
  legGeo.translate(0, -0.25, 0);
  const legR = new THREE.Mesh(legGeo, skinMat);
  legR.position.set(-0.14, 0.52, 0);
  const legL = new THREE.Mesh(legGeo, skinMat);
  legL.position.set(0.14, 0.52, 0);

  const armGeo = track(new THREE.CylinderGeometry(0.08, 0.07, 0.58, 8));
  armGeo.translate(0, -0.26, 0);
  const armSleeveGeo = track(new THREE.CylinderGeometry(0.095, 0.088, 0.25, 8));
  armSleeveGeo.translate(0, -0.11, 0);

  // Right arm (-X): bare skin arm, plus removable white shoulder sleeve when shoulders are covered
  const armR = new THREE.Mesh(armGeo, skinMat);
  armR.position.set(-0.34, 1.48, 0);
  const armRSleeve = new THREE.Mesh(armSleeveGeo, ihramWhiteMat);
  armR.add(armRSleeve);

  // Left arm (+X): always has white Rida' drape over left shoulder
  const armL = new THREE.Mesh(armGeo, skinMat);
  armL.position.set(0.34, 1.48, 0);
  const armLSleeve = new THREE.Mesh(armSleeveGeo, ihramWhiteMat);
  armL.add(armLSleeve);

  // Glowing golden foot halo + floating diamond beacon so hero is unmistakable
  const heroHalo = new THREE.Mesh(
    track(new THREE.RingGeometry(0.65, 0.92, 24)),
    track(
      new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
      })
    )
  );
  heroHalo.rotation.x = -Math.PI / 2;
  heroHalo.position.y = 0.08;

  const heroBeacon = new THREE.Mesh(track(new THREE.OctahedronGeometry(0.26, 0)), emissiveGoldMat);
  heroBeacon.position.y = 2.45;

  heroBodyPivot.add(
    skinTorsoMesh,
    izarMesh,
    idtibaGroup,
    coveredRidaGroup,
    headMesh,
    longHairGroup,
    shortHairGroup,
    legL,
    legR,
    armL,
    armR
  );
  heroGroup.add(heroHalo, heroBeacon);

  let heroState: TourHeroState = {
    visible: false,
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    walking: false,
  };
  const setTourHeroState = (state: TourHeroState) => {
    heroState = state;
    heroGroup.visible = state.visible;
    heroGroup.position.set(state.x, state.y, state.z);
    heroGroup.rotation.y = state.yaw;

    const isIdtiba = Boolean(state.idtiba);
    idtibaGroup.visible = isIdtiba;
    coveredRidaGroup.visible = !isIdtiba;
    armRSleeve.visible = !isIdtiba;

    const isShortHair = Boolean(state.hairShort);
    longHairGroup.visible = !isShortHair;
    shortHairGroup.visible = isShortHair;
  };

  // Living Ambient Pilgrims in Mataf & Al-Mas'a (InstancedMesh for 60fps performance)
  const matafCrowdCount = isSoftwareGl ? 24 : 44;
  const masaCrowdCount = isSoftwareGl ? 14 : 26;
  const crowdBodyGeo = track(new THREE.CylinderGeometry(0.22, 0.3, 1.35, 8));
  const crowdHeadGeo = track(new THREE.SphereGeometry(0.17, 8, 6));

  const matafCrowdBodyInst = new THREE.InstancedMesh(crowdBodyGeo, ihramWhiteMat, matafCrowdCount);
  const matafCrowdHeadInst = new THREE.InstancedMesh(crowdHeadGeo, skinMat, matafCrowdCount);
  const masaCrowdBodyInst = new THREE.InstancedMesh(crowdBodyGeo, ihramWhiteMat, masaCrowdCount);
  const masaCrowdHeadInst = new THREE.InstancedMesh(crowdHeadGeo, skinMat, masaCrowdCount);
  root.add(matafCrowdBodyInst, matafCrowdHeadInst, masaCrowdBodyInst, masaCrowdHeadInst);

  const matafCrowdSeeds = Array.from({ length: matafCrowdCount }, (_, i) => ({
    lap: i % 7,
    phase: (i / matafCrowdCount + (i % 3) * 0.07) % 1,
    speed: 0.011 + (i < matafCrowdCount * 0.4 ? 0.004 : 0),
  }));
  const masaCrowdSeeds = Array.from({ length: masaCrowdCount }, (_, i) => ({
    lap: i % 7,
    phase: (i / masaCrowdCount + (i % 5) * 0.05) % 1,
    speed: 0.016 + (i % 3) * 0.002,
  }));

  const _orbPos = new THREE.Vector3();
  const _crowdPos = new THREE.Vector3();
  const _visRaycaster = new THREE.Raycaster();
  _visRaycaster.layers.set(0);
  const _visDir = new THREE.Vector3();
  const labelOccluderRoots: THREE.Object3D[] = [
    kaabaMesh,
    parapet,
    hatimWall,
    matafGroup,
    fahdWingGroup,
    masaGroup,
    expGroup,
    minaretsGroup,
    gatesGroup,
    landmarksGroup,
  ];
  const isWorldPointVisible = (
    cameraPos: THREE.Vector3,
    targetPoint: THREE.Vector3,
    clearanceMargin = 0.65
  ): boolean => {
    _visDir.subVectors(targetPoint, cameraPos);
    const dist = _visDir.length();
    if (dist <= Math.max(0.25, clearanceMargin + 0.1)) return true;
    _visDir.divideScalar(dist);
    _visRaycaster.set(cameraPos, _visDir);
    _visRaycaster.near = 0.25;
    _visRaycaster.far = dist - clearanceMargin;
    const hits = _visRaycaster.intersectObjects(labelOccluderRoots, true);
    for (let i = 0; i < hits.length; i++) {
      const obj = hits[i].object as THREE.Mesh;
      const mat = obj.material;
      const m = Array.isArray(mat) ? mat[0] : mat;
      if (m && m.transparent && (m.opacity ?? 1) < 0.75) {
        continue;
      }
      return false;
    }
    return true;
  };

  const update = (
    elapsed: number,
    tourPlaying: boolean = true,
    tourSpeed: number = 1,
    ritualMode: string = '',
    lapTimeFrac: number = 0,
    isOverheadView: boolean = true
  ) => {
    roofMaterials.forEach((mat) => {
      mat.opacity += (targetRoofOpacity - mat.opacity) * 0.14;
      mat.depthWrite = mat.opacity > 0.85;
    });

    if (gateHighlightRing.visible) {
      const scale = 1 + Math.sin(elapsed * 3.5) * 0.08;
      gateHighlightRing.scale.set(scale, scale, 1);
    }

    if (currentCurve && pathOrbs.length > 0) {
      for (let i = 0; i < pathOrbs.length; i++) {
        const t = ((elapsed * 0.26) + i / pathOrbs.length) % 1;
        currentCurve.getPointAt(t, _orbPos);
        pathOrbs[i].position.copy(_orbPos);
      }
    }

    // Animate 7-Tawaf circuit flow orbs
    if (tawaf7Group.visible) {
      for (let i = 0; i < tawafOrbs.length; i++) {
        const item = tawafOrbs[i];
        const speed = item.lap < 3 ? 0.065 : 0.048;
        const u = (elapsed * speed + item.phase) % 1;
        tawafRingCurves[item.lap].getPointAt(u, _orbPos);
        item.mesh.position.copy(_orbPos).setY(0.32);
        const s = currentActiveTawafLap > 0 && item.lap + 1 === currentActiveTawafLap ? 1.55 : 0.9;
        item.mesh.scale.setScalar(s);
      }
    }

    // Animate 7-Sa'i lane flow orbs
    if (sai7Group.visible) {
      for (let i = 0; i < saiOrbs.length; i++) {
        const item = saiOrbs[i];
        const u = (elapsed * 0.045 + item.phase) % 1;
        saiLapCurves[item.lap].getPointAt(u, _orbPos);
        item.mesh.position.copy(_orbPos).setY(0.36);
        const s = currentActiveSaiLap > 0 && item.lap + 1 === currentActiveSaiLap ? 1.6 : 0.92;
        item.mesh.scale.setScalar(s);
      }
    }

    // Animate Zamzam -> Safa guidance path orbs
    if (zamzamToSafaGroup.visible) {
      for (let i = 0; i < zamzamSafaOrbs.length; i++) {
        const u = (elapsed * 0.22 + i / zamzamSafaOrbs.length) % 1;
        zamzamSafaCurve.getPointAt(u, _orbPos);
        zamzamSafaOrbs[i].position.copy(_orbPos).setY(_orbPos.y + 0.16);
      }
    }

    // Animate exterior landmark -> gate path orbs
    if (landmarkGateCurve && landmarkGateOrbs.length > 0) {
      for (let i = 0; i < landmarkGateOrbs.length; i++) {
        const u = (elapsed * 0.14 + i / landmarkGateOrbs.length) % 1;
        landmarkGateCurve.getPointAt(u, _orbPos);
        landmarkGateOrbs[i].position.copy(_orbPos).setY(_orbPos.y + 0.2);
      }
    }

    // Drive all 4 faces of Makkah Royal Clock hands to live Makkah local time (UTC+3)
    const makkahSecTotal = ((Date.now() / 1000) + 3 * 3600) % 43200;
    const hourRotZ = -((makkahSecTotal / 43200) * Math.PI * 2);
    const minuteRotZ = -(((makkahSecTotal % 3600) / 3600) * Math.PI * 2);
    for (let i = 0; i < clockHandPivots.length; i++) {
      clockHandPivots[i].hourPivot.rotation.z = hourRotZ;
      clockHandPivots[i].minutePivot.rotation.z = minuteRotZ;
    }

    // Open Al-Mas'a roof/domes/balconies during overhead rituals inside/near Al-Mas'a so tracks and pilgrim are unobstructed from directly above
    const isOverheadRitual =
      isOverheadView &&
      (ritualMode === 'arrival' ||
        ritualMode === 'gate-entry' ||
        ritualMode === 'black-stone' ||
        ritualMode === 'tawaf-7' ||
        ritualMode === 'maqam-prayer' ||
        ritualMode === 'zamzam' ||
        ritualMode === 'safa-dua' ||
        ritualMode === 'sai-7' ||
        ritualMode === 'marwah-tahallul');
    if (masaOverheadMeshes.length > 0) {
      const hideMasaOverhead =
        isOverheadView &&
        (ritualMode === 'sai-7' ||
          ritualMode === 'safa-dua' ||
          ritualMode === 'marwah-tahallul' ||
          ritualMode === 'zamzam');
      const showMasaOverhead = !hideMasaOverhead;
      for (let i = 0; i < masaOverheadMeshes.length; i++) {
        masaOverheadMeshes[i].visible = showMasaOverhead;
      }
    }

    // Animate living Hero Pilgrim stride / prayer / raised hands
    if (heroGroup.visible) {
      heroGroup.scale.setScalar(isOverheadRitual ? 1.85 : 1);
      heroBeacon.rotation.y = elapsed * 2.4;
      heroBeacon.position.y = 2.42 + Math.sin(elapsed * 3.5) * 0.12;
      const haloPulse = (isOverheadRitual ? 1.35 : 1) * (1 + Math.sin(elapsed * 4.2) * 0.1);
      heroHalo.scale.set(haloPulse, haloPulse, 1);

      if (heroState.praying) {
        heroBodyPivot.position.y = -0.35;
        heroBodyPivot.rotation.x = 0.28 + Math.sin(elapsed * 1.4) * 0.12;
        legL.rotation.x = -0.9;
        legR.rotation.x = -0.9;
        armL.rotation.x = -0.45;
        armR.rotation.x = -0.45;
      } else if (heroState.pointingRightHand) {
        heroBodyPivot.position.y = 0;
        heroBodyPivot.rotation.x = 0;
        legL.rotation.x = 0;
        legR.rotation.x = 0;
        armL.rotation.x = 0;
        armR.rotation.x = -1.9 + Math.sin(elapsed * 2.6) * 0.06;
      } else if (heroState.raisingHands) {
        heroBodyPivot.position.y = 0;
        heroBodyPivot.rotation.x = 0;
        legL.rotation.x = 0;
        legR.rotation.x = 0;
        armL.rotation.x = -2.2 + Math.sin(elapsed * 2.2) * 0.08;
        armR.rotation.x = -2.2 + Math.sin(elapsed * 2.2) * 0.08;
      } else if (heroState.walking) {
        const strideFreq = heroState.harwalah ? 8.2 : 5.4;
        const swingAmp = heroState.harwalah ? 0.56 : 0.38;
        const swing = Math.sin(elapsed * strideFreq) * swingAmp;
        heroBodyPivot.position.y = Math.abs(Math.cos(elapsed * strideFreq)) * 0.06;
        heroBodyPivot.rotation.x = heroState.harwalah ? 0.1 : 0.03;
        legL.rotation.x = swing;
        legR.rotation.x = -swing;
        armL.rotation.x = -swing * 0.75;
        armR.rotation.x = swing * 0.75;
      } else {
        heroBodyPivot.position.y = 0;
        heroBodyPivot.rotation.x = 0;
        legL.rotation.x = 0;
        legR.rotation.x = 0;
        armL.rotation.x = 0;
        armR.rotation.x = 0;
      }
    }

    // Animate ambient Mataf crowd (counter-clockwise around Kaaba)
    const crowdSpeedScale = tourPlaying ? tourSpeed : 0;
    const tawafPauseScale = (ritualMode === 'tawaf-7' && lapTimeFrac >= 0.76) ? 0.15 : 1.0;

    for (let i = 0; i < matafCrowdCount; i++) {
      const seed = matafCrowdSeeds[i];
      const effectiveSpeed = seed.speed * crowdSpeedScale * tawafPauseScale;
      const t = (elapsed * effectiveSpeed + seed.phase) % 1;
      sampleTawafPoint(seed.lap, t, _crowdPos);
      const bob = Math.abs(Math.sin(elapsed * 6 + i)) * 0.06;
      _dummy.position.set(_crowdPos.x, 0.72 + bob, _crowdPos.z);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      matafCrowdBodyInst.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(_crowdPos.x, 1.54 + bob, _crowdPos.z);
      _dummy.updateMatrix();
      matafCrowdHeadInst.setMatrixAt(i, _dummy.matrix);
    }
    matafCrowdBodyInst.instanceMatrix.needsUpdate = true;
    matafCrowdHeadInst.instanceMatrix.needsUpdate = true;

    // Animate ambient Al-Mas'a crowd (walking North & South along all 7 lanes)
    for (let i = 0; i < masaCrowdCount; i++) {
      const seed = masaCrowdSeeds[i];
      const effectiveSpeed = seed.speed * crowdSpeedScale;
      const t = (elapsed * effectiveSpeed + seed.phase) % 1;
      sampleSaiPoint(seed.lap, t, _crowdPos);
      const inGreenZone = _crowdPos.z >= 12.5 && _crowdPos.z <= 37.5;
      const bob = Math.abs(Math.sin(elapsed * (inGreenZone ? 9 : 6) + i)) * 0.06;
      _dummy.position.set(_crowdPos.x, 0.74 + bob, _crowdPos.z);
      _dummy.rotation.set(0, 0, 0);
      _dummy.scale.set(1, 1, 1);
      _dummy.updateMatrix();
      masaCrowdBodyInst.setMatrixAt(i, _dummy.matrix);

      _dummy.position.set(_crowdPos.x, 1.56 + bob, _crowdPos.z);
      _dummy.updateMatrix();
      masaCrowdHeadInst.setMatrixAt(i, _dummy.matrix);
    }
    masaCrowdBodyInst.instanceMatrix.needsUpdate = true;
    masaCrowdHeadInst.instanceMatrix.needsUpdate = true;
  };

  const dispose = () => {
    showPathForGate(null);
    setLandmarkToGatePath(null);
    disposables.forEach((d) => {
      try {
        d.dispose();
      } catch {}
    });
  };

  return {
    root,
    roofMeshes,
    roofMaterials,
    gateHitboxes,
    gateHighlightRing,
    pathGroup,
    sunLight,
    fillLight,
    hemiLight,
    nightGlowLights,
    emissiveGoldMat,
    greenMasaMat,
    applyLighting,
    setRoofCutaway,
    showPathForGate,
    setRitualOverlay,
    setZamzamToSafaPath,
    setLandmarkToGatePath,
    sampleLandmarkToGatePoint,
    getLandmarkToGateLength,
    setTourHeroState,
    isWorldPointVisible,
    update,
    dispose,
  };
}
