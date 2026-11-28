import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Compass,
  DoorOpen,
  Eye,
  EyeOff,
  Footprints,
  MapPin,
  Moon,
  RotateCcw,
  Sun,
  Sunset,
  ChevronDown,
  ChevronUp,
  Navigation,
  X,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  Route,
  Settings,
} from 'lucide-react';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import {
  buildExteriorLandmarkToGateWaypoints,
  HARAM_GATES,
  HARAM_LANDMARKS,
  HaramGateDirection,
  HaramGateInfo,
  HaramLandmarkInfo,
  TOUR_EXTERIOR_ORIGINS,
  TourExteriorLandmarkOrigin,
  UMRAH_3D_TOUR_STOPS,
} from '../../data/worshipAndHistory/masjidHaram3DData';
import {
  buildMasjidHaramScene,
  HaramSceneHandles,
  LightingPreset,
  sampleSaiPoint,
  sampleTawafPoint,
} from '../../utils/worship/masjidHaram3DScene';
import { Calculator3DStyles } from '../../utils/styles/calculator3DStyles';
import { useLanguage } from '../../context/LanguageContext';

export interface MasjidHaram3DViewerProps {
  s3d: Calculator3DStyles;
  onClose?: () => void;
  initialFocus?: 'exterior' | 'kaaba' | 'gates' | 'masa' | 'walk' | 'tour';
  tourOnly?: boolean;
}

type ViewerMode = 'orbit' | 'walk';
type DockTab = 'landmarks' | 'gates' | 'tour' | 'settings';
type TourViewMode = 'overhead' | 'closeup';

interface ProjectedPin {
  id: string;
  label: string;
  subLabel?: string;
  x: number;
  y: number;
  visible: boolean;
  kind: 'gate' | 'landmark';
  isMajor?: boolean;
  distance: number;
}

interface TourRitualBanner {
  key: string;
  badgeAr: string;
  badgeEn: string;
  textAr: string;
  textEn?: string;
  repeatCount?: { current: number; total: number };
  tone: 'gold' | 'emerald';
}

const _projVec = new THREE.Vector3();
const _walkForward = new THREE.Vector3();
const _walkRight = new THREE.Vector3();
const _heroPos = new THREE.Vector3();
const _heroNext = new THREE.Vector3();
const _tourCamPos = new THREE.Vector3();
const _tourCamTarget = new THREE.Vector3();
const _camOffsetVec = new THREE.Vector3();
const _visTestVec = new THREE.Vector3();

const sampleWaypoints = (
  waypoints: ReadonlyArray<[number, number, number]>,
  t: number,
  out: THREE.Vector3
) => {
  if (waypoints.length === 0) {
    out.set(0, 0, 0);
    return out;
  }
  if (waypoints.length === 1) {
    out.set(waypoints[0][0], waypoints[0][1], waypoints[0][2]);
    return out;
  }
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  let totalLen = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    totalLen += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  }
  if (totalLen < 1e-4) {
    const last = waypoints[waypoints.length - 1];
    out.set(last[0], last[1], last[2]);
    return out;
  }
  let targetDist = clamped * totalLen;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const segLen = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (targetDist <= segLen || i === waypoints.length - 2) {
      const u = segLen > 1e-4 ? THREE.MathUtils.clamp(targetDist / segLen, 0, 1) : 1;
      out.set(
        THREE.MathUtils.lerp(a[0], b[0], u),
        THREE.MathUtils.lerp(a[1], b[1], u),
        THREE.MathUtils.lerp(a[2], b[2], u)
      );
      return out;
    }
    targetDist -= segLen;
  }
  const last = waypoints[waypoints.length - 1];
  out.set(last[0], last[1], last[2]);
  return out;
};

const ZAMZAM_TO_SAFA_WAYPOINTS: ReadonlyArray<[number, number, number]> = [
  [16.8, 0.22, 7.6],
  [34.0, 0.22, 6.0],
  [58.0, 0.22, 6.0],
  [64.5, 0.22, 22.0],
  [64.5, 0.22, 48.0],
  [68.0, 0.78, 64.5],
];

// Maps uniform lap time [0..1] to Sa'i corridor position [0..1] (125m total; fixed green Harwalah zone at z in [+12.5, +37.5] in first half near Safa)
const SAI_FAST_SPEED_MULT = 1.7;
const SAI_FAST_WEIGHT = 25 / SAI_FAST_SPEED_MULT;
const SAI_TOTAL_TIME_WEIGHT = 25 + SAI_FAST_WEIGHT + 75;
const SAI_EVEN_T_START = 25 / SAI_TOTAL_TIME_WEIGHT;
const SAI_EVEN_T_END = (25 + SAI_FAST_WEIGHT) / SAI_TOTAL_TIME_WEIGHT;
const SAI_EVEN_U_START = 25 / 125;
const SAI_EVEN_U_END = 50 / 125;
const SAI_ODD_T_START = 75 / SAI_TOTAL_TIME_WEIGHT;
const SAI_ODD_T_END = (75 + SAI_FAST_WEIGHT) / SAI_TOTAL_TIME_WEIGHT;
const SAI_ODD_U_START = 75 / 125;
const SAI_ODD_U_END = 100 / 125;

const mapSaiSpeedProgress = (t: number, lapIdx: number): number => {
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  const isEven = lapIdx % 2 === 0;
  const tStart = isEven ? SAI_EVEN_T_START : SAI_ODD_T_START;
  const tEnd = isEven ? SAI_EVEN_T_END : SAI_ODD_T_END;
  const uStart = isEven ? SAI_EVEN_U_START : SAI_ODD_U_START;
  const uEnd = isEven ? SAI_EVEN_U_END : SAI_ODD_U_END;
  if (clamped < tStart) {
    return (clamped / tStart) * uStart;
  }
  if (clamped <= tEnd) {
    return uStart + ((clamped - tStart) / (tEnd - tStart)) * (uEnd - uStart);
  }
  return uEnd + ((clamped - tEnd) / (1 - tEnd)) * (1 - uEnd);
};

const detectSoftwareWebGL = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
};

const getDeviceLightingPreset = (now = new Date()): LightingPreset => {
  const hm = now.getHours() + now.getMinutes() / 60;
  // Sunrise twilight (05:00-06:15) & Sunset golden hour (16:45-18:45)
  if ((hm >= 5 && hm < 6.25) || (hm >= 16.75 && hm < 18.75)) {
    return 'sunset';
  }
  // Daytime (06:15-16:45)
  if (hm >= 6.25 && hm < 16.75) {
    return 'day';
  }
  // Nighttime (18:45-05:00)
  return 'night';
};

export const MasjidHaram3DViewer: React.FC<MasjidHaram3DViewerProps> = ({
  s3d,
  onClose,
  initialFocus = 'exterior',
  tourOnly = false,
}) => {
  const { language, isRTL } = useLanguage();
  const isEn = language === 'en';
  const startsInTour = tourOnly || initialFocus === 'tour';

  const mountRef = useRef<HTMLDivElement | null>(null);
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<ViewerMode>(initialFocus === 'walk' ? 'walk' : 'orbit');
  const [dockTab, setDockTab] = useState<DockTab>(
    startsInTour ? 'tour' : initialFocus === 'gates' ? 'gates' : 'landmarks'
  );
  const [dockExpanded, setDockExpanded] = useState<boolean>(true);
  const [lighting, setLighting] = useState<LightingPreset>(() => getDeviceLightingPreset());
  const [roofCutaway, setRoofCutaway] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [gateFilter, setGateFilter] = useState<'all' | HaramGateDirection>('all');
  const [selectedGate, setSelectedGate] = useState<HaramGateInfo | null>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<HaramLandmarkInfo | null>(() => {
    if (startsInTour || initialFocus === 'gates') return null;
    return (
      HARAM_LANDMARKS.find((l) =>
        initialFocus === 'kaaba'
          ? l.id === 'kaaba'
          : initialFocus === 'masa'
            ? l.id === 'safa-marwah'
            : l.id === 'exterior-overview'
      ) || HARAM_LANDMARKS[0]
    );
  });
  const [activeTourIdx, setActiveTourIdx] = useState<number>(0);
  const [tourPhase, setTourPhase] = useState<'choose-landmark' | 'active'>('choose-landmark');
  const [tourViewMode, setTourViewMode] = useState<TourViewMode>('overhead');
  const [selectedTourOrigin, setSelectedTourOrigin] = useState<TourExteriorLandmarkOrigin | null>(null);
  const [tourDockVisible, setTourDockVisible] = useState<boolean>(true);
  const [tourPlaying, setTourPlaying] = useState<boolean>(false);
  const [tourSpeed, setTourSpeed] = useState<1 | 2>(1);
  const [tourProgress, setTourProgress] = useState<number>(0);
  const [liveLapBadge, setLiveLapBadge] = useState<{ kind: 'tawaf' | 'sai'; lap: number } | null>(null);
  const [tourRitualBanner, setTourRitualBanner] = useState<TourRitualBanner | null>(null);
  const [gateRouteOrigin, setGateRouteOrigin] = useState<TourExteriorLandmarkOrigin | null>(null);
  const [gateRoutePlaying, setGateRoutePlaying] = useState<boolean>(false);
  const [gateRouteFinished, setGateRouteFinished] = useState<boolean>(false);
  const [gateRouteProgress, setGateRouteProgress] = useState<number>(0);
  const [webglError, setWebglError] = useState<boolean>(false);
  const [sceneReady, setSceneReady] = useState<boolean>(false);
  const [pins, setPins] = useState<ProjectedPin[]>([]);
  const [joystickKnob, setJoystickKnob] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mutable refs for 60fps Three.js loop without tearing down WebGL
  const modeRef = useRef<ViewerMode>(mode);
  const dockTabRef = useRef<DockTab>(dockTab);
  const showLabelsRef = useRef<boolean>(showLabels);
  const roofCutawayRef = useRef<boolean>(roofCutaway);
  const selectedGateRef = useRef<HaramGateInfo | null>(selectedGate);
  const selectedLandmarkRef = useRef<HaramLandmarkInfo | null>(selectedLandmark);
  const activeTourIdxRef = useRef<number>(activeTourIdx);
  const tourPhaseRef = useRef<'choose-landmark' | 'active'>(tourPhase);
  const tourViewModeRef = useRef<TourViewMode>(tourViewMode);
  const selectedTourOriginRef = useRef<TourExteriorLandmarkOrigin | null>(selectedTourOrigin);
  const tourDockVisibleRef = useRef<boolean>(tourDockVisible);
  const tourPlayingRef = useRef<boolean>(tourPlaying);
  const tourSpeedRef = useRef<1 | 2>(tourSpeed);
  const tourProgressRef = useRef<number>(0);
  const tourFollowCamRef = useRef<boolean>(true);
  const tourCamDetachedRef = useRef<boolean>(false);
  const gateRouteOriginRef = useRef<TourExteriorLandmarkOrigin | null>(gateRouteOrigin);
  const gateRoutePlayingRef = useRef<boolean>(gateRoutePlaying);
  const gateRouteFinishedRef = useRef<boolean>(gateRouteFinished);
  const gateRouteProgressRef = useRef<number>(0);
  const gateRouteDurationRef = useRef<number>(12);
  const sceneHandlesRef = useRef<HaramSceneHandles | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const takbirBadgeRef = useRef<HTMLDivElement | null>(null);
  const heroBannerRef = useRef<HTMLDivElement | null>(null);
  const tourBannerActiveRef = useRef<boolean>(false);

  // Camera smooth transition state (exponentially damped, cancelled on user touch)
  const camAnimRef = useRef<{
    active: boolean;
    pos: THREE.Vector3;
    target: THREE.Vector3;
  }>({
    active: false,
    pos: new THREE.Vector3(-152, 108, 174),
    target: new THREE.Vector3(0, 8, 8),
  });

  // First-person walkthrough state
  const walkStateRef = useRef<{
    yaw: number;
    pitch: number;
    joyX: number; // -1..1
    joyY: number; // -1..1 (positive = forward)
    keys: Record<string, boolean>;
    looking: boolean;
    lastPointerX: number;
    lastPointerY: number;
    lookPointerId: number | null;
  }>({
    yaw: 0,
    pitch: -0.05,
    joyX: 0,
    joyY: 0,
    keys: {},
    looking: false,
    lastPointerX: 0,
    lastPointerY: 0,
    lookPointerId: null,
  });

  // Phone hardware back button, WebView back gesture & Escape key handler
  useEffect(() => {
    const unregisterBack = onClose
      ? registerBackInterceptor(() => {
          onClose();
          return true;
        })
      : undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unregisterBack?.();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    modeRef.current = mode;
    if (controlsRef.current) {
      controlsRef.current.enabled = mode === 'orbit';
    }
    if (mode === 'walk' && cameraRef.current) {
      const cam = cameraRef.current;
      // If camera is high up in aerial mode, gently drop down to eye level in southern courtyard or near selected gate
      if (cam.position.y > 14) {
        const startPos = selectedGateRef.current
          ? new THREE.Vector3(
              selectedGateRef.current.exteriorCamera[0] * 0.45 + selectedGateRef.current.position[0] * 0.55,
              2.45,
              selectedGateRef.current.exteriorCamera[2] * 0.45 + selectedGateRef.current.position[2] * 0.55
            )
          : new THREE.Vector3(0, 2.45, 76);
        camAnimRef.current.pos.copy(startPos);
        camAnimRef.current.target.set(0, 2.45, 0);
        camAnimRef.current.active = true;
      }
      // Compute current yaw/pitch looking toward Kaaba
      const dir = new THREE.Vector3(0, 2.45, 0).sub(cam.position).normalize();
      walkStateRef.current.yaw = Math.atan2(-dir.x, -dir.z);
      walkStateRef.current.pitch = 0;
    }
  }, [mode]);

  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);

  useEffect(() => {
    dockTabRef.current = dockTab;
  }, [dockTab]);

  useEffect(() => {
    activeTourIdxRef.current = activeTourIdx;
  }, [activeTourIdx]);

  useEffect(() => {
    tourPhaseRef.current = tourPhase;
  }, [tourPhase]);

  useEffect(() => {
    tourViewModeRef.current = tourViewMode;
  }, [tourViewMode]);

  useEffect(() => {
    selectedTourOriginRef.current = selectedTourOrigin;
  }, [selectedTourOrigin]);

  useEffect(() => {
    tourDockVisibleRef.current = tourDockVisible;
  }, [tourDockVisible]);

  useEffect(() => {
    tourPlayingRef.current = tourPlaying;
  }, [tourPlaying]);

  useEffect(() => {
    tourSpeedRef.current = tourSpeed;
  }, [tourSpeed]);

  useEffect(() => {
    selectedLandmarkRef.current = selectedLandmark;
  }, [selectedLandmark]);

  useEffect(() => {
    selectedGateRef.current = selectedGate;
    if (!gateRouteOriginRef.current) {
      sceneHandlesRef.current?.showPathForGate(selectedGate);
    }
  }, [selectedGate]);

  useEffect(() => {
    if (sceneHandlesRef.current && threeSceneRef.current) {
      sceneHandlesRef.current.applyLighting(lighting, threeSceneRef.current);
    }
  }, [lighting]);

  useEffect(() => {
    roofCutawayRef.current = roofCutaway;
    sceneHandlesRef.current?.setRoofCutaway(roofCutaway);
  }, [roofCutaway]);

  const stopGateRouteTour = useCallback((restoreGatePath = true) => {
    gateRouteOriginRef.current = null;
    gateRoutePlayingRef.current = false;
    gateRouteFinishedRef.current = false;
    gateRouteProgressRef.current = 0;
    setGateRouteOrigin(null);
    setGateRoutePlaying(false);
    setGateRouteFinished(false);
    setGateRouteProgress(0);
    sceneHandlesRef.current?.setLandmarkToGatePath(null);
    if (restoreGatePath && selectedGateRef.current) {
      sceneHandlesRef.current?.showPathForGate(selectedGateRef.current);
    }
  }, []);

  const flyToView = useCallback(
    (camPos: [number, number, number], targetPos: [number, number, number], forceOrbit = false) => {
      if (forceOrbit && modeRef.current !== 'orbit') {
        setMode('orbit');
      }
      camAnimRef.current.pos.set(camPos[0], camPos[1], camPos[2]);
      camAnimRef.current.target.set(targetPos[0], targetPos[1], targetPos[2]);
      camAnimRef.current.active = true;

      // Also align walk yaw/pitch if currently in walk mode
      const dx = targetPos[0] - camPos[0];
      const dy = targetPos[1] - camPos[1];
      const dz = targetPos[2] - camPos[2];
      const horiz = Math.hypot(dx, dz) || 1;
      walkStateRef.current.yaw = Math.atan2(-dx, -dz);
      walkStateRef.current.pitch = THREE.MathUtils.clamp(Math.atan2(dy, horiz), -0.8, 0.8);
    },
    []
  );

  const handleSelectLandmark = useCallback(
    (lm: HaramLandmarkInfo) => {
      stopGateRouteTour(false);
      setSelectedLandmark(lm);
      setSelectedGate(null);
      flyToView(lm.cameraOffset, lm.targetOffset, true);
    },
    [flyToView, stopGateRouteTour]
  );

  const handleSelectGate = useCallback(
    (gate: HaramGateInfo, enterInside = false) => {
      stopGateRouteTour(false);
      setSelectedGate(gate);
      setSelectedLandmark(null);
      if (enterInside) {
        setMode('walk');
        const startX = gate.exteriorCamera[0] * 0.4 + gate.position[0] * 0.6;
        const startZ = gate.exteriorCamera[2] * 0.4 + gate.position[2] * 0.6;
        flyToView([startX, 2.5, startZ], gate.interiorWalkPoint, false);
      } else {
        flyToView(gate.exteriorCamera, [gate.position[0], 5, gate.position[2]], true);
      }
    },
    [flyToView, stopGateRouteTour]
  );

  const handleStartGateRouteFromLandmark = useCallback(
    (gate: HaramGateInfo, origin: TourExteriorLandmarkOrigin) => {
      const handles = sceneHandlesRef.current;
      const waypoints = buildExteriorLandmarkToGateWaypoints(origin.landmarkId, gate);
      gateRouteOriginRef.current = origin;
      gateRoutePlayingRef.current = true;
      gateRouteFinishedRef.current = false;
      gateRouteProgressRef.current = 0;

      setGateRouteOrigin(origin);
      setGateRoutePlaying(true);
      setGateRouteFinished(false);
      setGateRouteProgress(0);
      setSelectedGate(gate);
      selectedGateRef.current = gate;
      setSelectedLandmark(null);
      setRoofCutaway(false);
      setShowLabels(true);
      showLabelsRef.current = true;
      setDockExpanded(false);
      if (modeRef.current !== 'orbit') {
        setMode('orbit');
      }
      camAnimRef.current.active = false;
      tourCamDetachedRef.current = false;
      tourFollowCamRef.current = true;

      if (handles) {
        handles.showPathForGate(null);
        handles.setLandmarkToGatePath(waypoints, gate);
        const len = handles.getLandmarkToGateLength();
        gateRouteDurationRef.current = Math.max(8, Math.min(22, len / 12));
      }
    },
    []
  );

  const handleEnterFromSelectedGate = useCallback(() => {
    if (!selectedGate) return;
    stopGateRouteTour(true);
    setMode('walk');
    const startX = selectedGate.position[0];
    const startZ = selectedGate.position[2];
    const target: [number, number, number] =
      selectedGate.leadsTo === 'masa'
        ? [68, 2.6, selectedGate.position[2] >= 0 ? 34 : -34]
        : [0, 3.2, 0];
    flyToView([startX, 2.5, startZ], target, false);
  }, [selectedGate, flyToView, stopGateRouteTour]);

  const handleEnterSafaMarwahWalk = useCallback(() => {
    setRoofCutaway(false);
    setMode('walk');
    const lmId = selectedLandmark?.id;
    if (lmId === 'marwah-mount') {
      flyToView([68, 2.45, -52], [68, 2.35, -70], false);
    } else if (lmId === 'safa-mount') {
      flyToView([68, 2.45, 52], [68, 2.35, 70], false);
    } else {
      flyToView([68, 2.45, 56], [68, 2.45, -56], false);
    }
  }, [selectedLandmark, flyToView]);

  const handleTourStop = useCallback(
    (idx: number, autoPlay = true) => {
      const clamped = (idx + UMRAH_3D_TOUR_STOPS.length) % UMRAH_3D_TOUR_STOPS.length;
      setActiveTourIdx(clamped);
      activeTourIdxRef.current = clamped;
      tourProgressRef.current = 0;
      setTourProgress(0);
      setLiveLapBadge(null);
      camAnimRef.current.active = false;
      tourCamDetachedRef.current = false;
      tourFollowCamRef.current = true;
      if (autoPlay) {
        setTourPlaying(true);
        tourPlayingRef.current = true;
        setTourDockVisible(false);
        tourDockVisibleRef.current = false;
      }
      if (modeRef.current !== 'orbit') {
        setMode('orbit');
      }
      const stop = UMRAH_3D_TOUR_STOPS[clamped];
      const origin = selectedTourOriginRef.current;
      if ((clamped === 0 || clamped === 1) && origin) {
        const g = HARAM_GATES.find((item) => item.id === origin.nearestGateId) || null;
        setSelectedGate(g);
        setSelectedLandmark(null);
      } else {
        setSelectedGate(null);
        if (stop.landmarkId) {
          const lm = HARAM_LANDMARKS.find((item) => item.id === stop.landmarkId) || null;
          setSelectedLandmark(lm);
        } else {
          setSelectedLandmark(null);
        }
      }
    },
    []
  );

  const handleSelectTourExteriorLandmark = useCallback(
    (origin: TourExteriorLandmarkOrigin) => {
      setSelectedTourOrigin(origin);
      selectedTourOriginRef.current = origin;
      setTourPhase('active');
      tourPhaseRef.current = 'active';
      setTourDockVisible(false);
      tourDockVisibleRef.current = false;
      setRoofCutaway(false);
      setShowLabels(true);
      showLabelsRef.current = true;
      handleTourStop(0, true);
    },
    [handleTourStop]
  );

  const handleEnterTourTab = useCallback(() => {
    stopGateRouteTour(false);
    setDockTab('tour');
    dockTabRef.current = 'tour';
    setTourPhase('choose-landmark');
    tourPhaseRef.current = 'choose-landmark';
    setTourDockVisible(true);
    tourDockVisibleRef.current = true;
    setDockExpanded(true);
    setSelectedTourOrigin(null);
    selectedTourOriginRef.current = null;
    setTourPlaying(false);
    tourPlayingRef.current = false;
    tourProgressRef.current = 0;
    setTourProgress(0);
    setLiveLapBadge(null);
    setSelectedGate(null);
    setSelectedLandmark(null);
    setRoofCutaway(false);
    setShowLabels(true);
    showLabelsRef.current = true;
    flyToView([-162, 128, 186], [0, 12, 0], true);
  }, [flyToView, stopGateRouteTour]);

  // Initialize Three.js WebGL scene once on mount
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'none';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    threeSceneRef.current = scene;

    // Studio environment reflection for gold, marble & glass materials
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.5, 1400);
    const startLm =
      HARAM_LANDMARKS.find((l) =>
        initialFocus === 'kaaba'
          ? l.id === 'kaaba'
          : initialFocus === 'masa'
            ? l.id === 'safa-marwah'
            : l.id === 'exterior-overview'
      ) || HARAM_LANDMARKS[0];
    if (tourOnly || initialFocus === 'tour') {
      const isPortrait = width < height;
      if (isPortrait) {
        camera.position.set(-200, 155, 230);
      } else {
        camera.position.set(-162, 128, 186);
      }
    } else {
      camera.position.set(...startLm.cameraOffset);
    }
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.screenSpacePanning = false;
    controls.minDistance = 4.5;
    controls.maxDistance = 380;
    controls.maxPolarAngle = Math.PI / 2 - 0.035;
    if (tourOnly || initialFocus === 'tour') {
      controls.target.set(0, 12, 0);
    } else {
      controls.target.set(...startLm.targetOffset);
    }
    controls.enabled = modeRef.current === 'orbit';
    controlsRef.current = controls;

    // Cancel automatic camera glide if user grabs screen or scrolls zoom
    const onControlStart = () => {
      camAnimRef.current.active = false;
      tourFollowCamRef.current = false;
    };
    controls.addEventListener('start', onControlStart);

    // Build complete Masjid al-Haram scene
    const handles = buildMasjidHaramScene(renderer, isSoftwareGl);
    scene.add(handles.root);
    handles.applyLighting(lighting, scene);
    sceneHandlesRef.current = handles;

    if (!isSoftwareGl) {
      try {
        renderer.compile(scene, camera);
      } catch {}
    }

    // Raycaster for tapping Gates directly on the 3D canvas
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    const activePointers = new Set<number>();
    let pointerDownXY = {
      x: 0,
      y: 0,
      time: 0,
      onCanvas: false,
      pointerId: -1,
      hadMultiTouch: false,
      wasDetached: false,
    };

    const onPointerDown = (e: PointerEvent) => {
      activePointers.add(e.pointerId);
      if (activePointers.size > 1) {
        pointerDownXY.hadMultiTouch = true;
        tourCamDetachedRef.current = true;
        tourFollowCamRef.current = false;
        return;
      }
      pointerDownXY = {
        x: e.clientX,
        y: e.clientY,
        time: performance.now(),
        onCanvas: true,
        pointerId: e.pointerId,
        hadMultiTouch: false,
        wasDetached: tourCamDetachedRef.current,
      };
      if (modeRef.current === 'walk') {
        camAnimRef.current.active = false;
        walkStateRef.current.looking = true;
        walkStateRef.current.lookPointerId = e.pointerId;
        walkStateRef.current.lastPointerX = e.clientX;
        walkStateRef.current.lastPointerY = e.clientY;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (pointerDownXY.onCanvas && e.pointerId === pointerDownXY.pointerId) {
        if (Math.hypot(e.clientX - pointerDownXY.x, e.clientY - pointerDownXY.y) >= 10) {
          tourCamDetachedRef.current = true;
        }
      }
      if (
        modeRef.current === 'walk' &&
        walkStateRef.current.looking &&
        walkStateRef.current.lookPointerId === e.pointerId
      ) {
        const dx = e.clientX - walkStateRef.current.lastPointerX;
        const dy = e.clientY - walkStateRef.current.lastPointerY;
        walkStateRef.current.lastPointerX = e.clientX;
        walkStateRef.current.lastPointerY = e.clientY;
        walkStateRef.current.yaw -= dx * 0.0045;
        walkStateRef.current.pitch = THREE.MathUtils.clamp(
          walkStateRef.current.pitch - dy * 0.0038,
          -0.95,
          1.05
        );
      }
    };

    const onPointerCancel = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (walkStateRef.current.lookPointerId === e.pointerId) {
        walkStateRef.current.looking = false;
        walkStateRef.current.lookPointerId = null;
      }
      if (e.pointerId === pointerDownXY.pointerId) {
        pointerDownXY.onCanvas = false;
      }
    };

    const onWheel = () => {
      tourCamDetachedRef.current = true;
      tourFollowCamRef.current = false;
    };

    const onPointerUp = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      if (walkStateRef.current.lookPointerId === e.pointerId) {
        walkStateRef.current.looking = false;
        walkStateRef.current.lookPointerId = null;
      }
      if (!pointerDownXY.onCanvas || e.pointerId !== pointerDownXY.pointerId) return;
      pointerDownXY.onCanvas = false;
      if (pointerDownXY.hadMultiTouch) return;

      const dist = Math.hypot(e.clientX - pointerDownXY.x, e.clientY - pointerDownXY.y);
      const dt = performance.now() - pointerDownXY.time;
      if (dist >= 10 || dt >= 350) {
        tourCamDetachedRef.current = true;
        return;
      }

      if (dockTabRef.current === 'tour') {
        if (tourPhaseRef.current === 'active') {
          const isTourCompleted =
            activeTourIdxRef.current >= UMRAH_3D_TOUR_STOPS.length - 1 &&
            tourProgressRef.current >= 0.99;

          if (isTourCompleted) {
            if (pointerDownXY.wasDetached) {
              if (modeRef.current !== 'orbit') setMode('orbit');
              camAnimRef.current.active = false;
              tourCamDetachedRef.current = false;
              tourFollowCamRef.current = true;
            } else {
              handleTourStop(0, true);
            }
          } else if (tourPlayingRef.current && !pointerDownXY.wasDetached) {
            // Tap while playing -> pause temporarily so user can rotate/zoom/inspect freely
            tourPlayingRef.current = false;
            setTourPlaying(false);
            tourFollowCamRef.current = false;
            tourDockVisibleRef.current = true;
            setTourDockVisible(true);
            setDockExpanded(true);
          } else {
            // Tap after pausing or after moving/zooming -> restore original tour view & continue
            if (modeRef.current !== 'orbit') setMode('orbit');
            camAnimRef.current.active = false;
            tourCamDetachedRef.current = false;
            tourFollowCamRef.current = true;
            tourDockVisibleRef.current = false;
            setTourDockVisible(false);
            tourPlayingRef.current = true;
            setTourPlaying(true);
          }
        }
        return;
      }

      if (
        dockTabRef.current === 'gates' &&
        gateRouteOriginRef.current &&
        selectedGateRef.current
      ) {
        if (gateRouteFinishedRef.current) {
          if (pointerDownXY.wasDetached) {
            if (modeRef.current !== 'orbit') setMode('orbit');
            camAnimRef.current.active = false;
            tourCamDetachedRef.current = false;
            tourFollowCamRef.current = true;
          }
          setDockExpanded(true);
        } else if (gateRoutePlayingRef.current && !pointerDownXY.wasDetached) {
          // Tap while gate-route tour is playing -> pause temporarily & show controls
          gateRoutePlayingRef.current = false;
          setGateRoutePlaying(false);
          tourFollowCamRef.current = false;
          setDockExpanded(true);
        } else {
          // Tap after pausing or after moving/zooming -> restore tour camera & resume gate tour
          if (modeRef.current !== 'orbit') setMode('orbit');
          camAnimRef.current.active = false;
          tourCamDetachedRef.current = false;
          tourFollowCamRef.current = true;
          gateRoutePlayingRef.current = true;
          setGateRoutePlaying(true);
          setDockExpanded(false);
        }
        return;
      }

      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(handles.gateHitboxes, false);
      if (hits.length > 0) {
        const gateId = hits[0].object.userData?.gateId;
        const gate = HARAM_GATES.find((g) => g.id === gateId);
        if (gate) {
          handleSelectGate(gate, false);
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      walkStateRef.current.keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      walkStateRef.current.keys[e.code] = false;
    };

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    domEl.addEventListener('webglcontextlost', onContextLost);
    domEl.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
    ro?.observe(container);
    window.addEventListener('resize', onResize);

    // Animation loop with software WebGL pacing guard
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let lastPinUpdate = 0;

    const projectLabels = (nowMs: number) => {
      if (nowMs - lastPinUpdate < 75) return; // ~13Hz DOM projection keeps mobile silky smooth
      lastPinUpdate = nowMs;

      const isTourTab = dockTabRef.current === 'tour';

      if (!showLabelsRef.current && !isTourTab) {
        setPins((prev) => (prev.length > 0 ? [] : prev));
        return;
      }

      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const nextPins: ProjectedPin[] = [];

      const exteriorTourLandmarkIds = TOUR_EXTERIOR_ORIGINS.map((o) => o.landmarkId);

      const getLandmarkPinYOffset = (lm: HaramLandmarkInfo) => {
        if (exteriorTourLandmarkIds.includes(lm.id)) return 18;
        if (lm.id === 'kaaba') return 3.65;
        if (lm.id === 'hijr-ismail') return 0.9;
        if (lm.id === 'black-stone' || lm.id === 'yemeni-corner') return 0.85;
        if (lm.id === 'safa-mount' || lm.id === 'marwah-mount') return 2.6;
        return 2.2;
      };

      const isLandmarkActuallyVisible = (lm: HaramLandmarkInfo) => {
        if (exteriorTourLandmarkIds.includes(lm.id)) {
          _visTestVec.set(lm.position[0], lm.position[1] + 18, lm.position[2]);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 14.0);
        }
        if (lm.id === 'kaaba') {
          const topVisible = handles.isWorldPointVisible(
            camera.position,
            _visTestVec.set(0, 8.2, 0),
            0.65
          );
          if (topVisible) return true;
          return handles.isWorldPointVisible(
            camera.position,
            _visTestVec.set(0, 5.2, 0),
            4.9
          );
        }
        if (lm.id === 'black-stone') {
          if (camera.position.y < 22) {
            const dx = camera.position.x - lm.position[0];
            const dz = camera.position.z - lm.position[2];
            const len = Math.hypot(dx, dz) || 1;
            if ((dx / len) * 0.653 + (dz / len) * 0.757 <= 0.14) return false;
          }
          _visTestVec.set(3.6, 1.65, 4.1);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.35);
        }
        if (lm.id === 'yemeni-corner') {
          if (camera.position.y < 22) {
            const dx = camera.position.x - lm.position[0];
            const dz = camera.position.z - lm.position[2];
            const len = Math.hypot(dx, dz) || 1;
            if ((dx / len) * -0.653 + (dz / len) * 0.757 <= 0.14) return false;
          }
          _visTestVec.set(-3.6, 1.65, 4.1);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.35);
        }
        if (lm.id === 'multazam-door') {
          if (camera.position.y < 22) {
            const dx = camera.position.x - lm.position[0];
            const dz = camera.position.z - lm.position[2];
            const len = Math.hypot(dx, dz) || 1;
            if (dx / len <= 0.15) return false;
          }
          _visTestVec.set(3.65, 2.8, 1.3);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.35);
        }
        if (lm.id === 'hijr-ismail') {
          _visTestVec.set(0, 1.75, -7.2);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.45);
        }
        if (lm.id === 'maqam-ibrahim') {
          _visTestVec.set(11.5, 2.9, -0.6);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 1.1);
        }
        if (lm.id === 'zamzam') {
          _visTestVec.set(15.5, 1.5, 7.5);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.6);
        }
        if (lm.id === 'safa-mount') {
          _visTestVec.set(68, 2.6, 64.5);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.6);
        }
        if (lm.id === 'marwah-mount') {
          _visTestVec.set(68, 2.6, -64.5);
          return handles.isWorldPointVisible(camera.position, _visTestVec, 0.6);
        }
        _visTestVec.set(lm.position[0], lm.position[1] + 2.2, lm.position[2]);
        return handles.isWorldPointVisible(camera.position, _visTestVec, 0.8);
      };

      // Strict label filtering during Umrah Tour: hide all unrelated & occluded landmarks & gates
      if (isTourTab) {
        if (tourPhaseRef.current === 'choose-landmark') {
          HARAM_LANDMARKS.forEach((lm) => {
            if (!exteriorTourLandmarkIds.includes(lm.id)) return;
            _projVec.set(lm.position[0], lm.position[1] + getLandmarkPinYOffset(lm), lm.position[2]);
            const dist = camera.position.distanceTo(_projVec);
            if (dist > 650) return;
            if (!isLandmarkActuallyVisible(lm)) return;
            _projVec.project(camera);
            if (_projVec.z > 1 || _projVec.z < -1) return;
            const sx = ((_projVec.x + 1) / 2) * w;
            const sy = ((-_projVec.y + 1) / 2) * h;
            if (sx < 20 || sx > w - 20 || sy < 48 || sy > h - 135) return;
            nextPins.push({
              id: lm.id,
              label: isEn ? lm.nameEn : lm.nameAr,
              x: sx,
              y: sy,
              visible: true,
              kind: 'landmark',
              distance: dist,
            });
          });
          setPins(nextPins);
          return;
        }

        const origin = selectedTourOriginRef.current || TOUR_EXTERIOR_ORIGINS[0];
        const activeStop = UMRAH_3D_TOUR_STOPS[activeTourIdxRef.current] || UMRAH_3D_TOUR_STOPS[0];
        let allowedLandmarkIds: string[] = [];

        switch (activeStop.ritualMode) {
          case 'arrival':
            allowedLandmarkIds = [origin.landmarkId];
            break;
          case 'gate-entry':
            allowedLandmarkIds = ['kaaba'];
            break;
          case 'black-stone':
            allowedLandmarkIds = ['black-stone'];
            break;
          case 'tawaf-7':
            allowedLandmarkIds = ['kaaba', 'hijr-ismail', 'black-stone', 'yemeni-corner'];
            break;
          case 'maqam-prayer':
            allowedLandmarkIds = ['maqam-ibrahim'];
            break;
          case 'zamzam':
            allowedLandmarkIds = ['zamzam', 'safa-mount'];
            break;
          case 'safa-dua':
            allowedLandmarkIds = ['safa-mount'];
            break;
          case 'sai-7':
            allowedLandmarkIds = ['safa-mount', 'marwah-mount'];
            break;
          case 'marwah-tahallul':
            allowedLandmarkIds = ['marwah-mount'];
            break;
        }

        HARAM_LANDMARKS.forEach((lm) => {
          if (!allowedLandmarkIds.includes(lm.id)) return;
          const isExteriorTower = exteriorTourLandmarkIds.includes(lm.id);
          _projVec.set(lm.position[0], lm.position[1] + getLandmarkPinYOffset(lm), lm.position[2]);
          const dist = camera.position.distanceTo(_projVec);
          if (dist > (isExteriorTower ? 600 : 320)) return;
          if (!isLandmarkActuallyVisible(lm)) return;
          _projVec.project(camera);
          if (_projVec.z > 1 || _projVec.z < -1) return;
          const sx = ((_projVec.x + 1) / 2) * w;
          const sy = ((-_projVec.y + 1) / 2) * h;
          if (sx < 24 || sx > w - 24 || sy < 58 || sy > h - 140) return;
          nextPins.push({
            id: lm.id,
            label: isEn ? lm.nameEn : lm.nameAr,
            x: sx,
            y: sy,
            visible: true,
            kind: 'landmark',
            distance: dist,
          });
        });

        setPins(nextPins);
        return;
      }

      // Active Gate-Route Tour (Gates tab): show only the starting exterior landmark pin when visible
      if (dockTabRef.current === 'gates' && gateRouteOriginRef.current && selectedGateRef.current) {
        const startLm = HARAM_LANDMARKS.find(
          (lm) => lm.id === gateRouteOriginRef.current?.landmarkId
        );
        if (startLm && isLandmarkActuallyVisible(startLm)) {
          _projVec.set(startLm.position[0], startLm.position[1] + 18, startLm.position[2]);
          const dist = camera.position.distanceTo(_projVec);
          _projVec.project(camera);
          if (_projVec.z <= 1 && _projVec.z >= -1) {
            const sx = ((_projVec.x + 1) / 2) * w;
            const sy = ((-_projVec.y + 1) / 2) * h;
            if (sx >= 20 && sx <= w - 20 && sy >= 14 && sy <= h - 90) {
              nextPins.push({
                id: startLm.id,
                label: isEn ? startLm.nameEn : startLm.nameAr,
                x: sx,
                y: sy,
                visible: true,
                kind: 'landmark',
                distance: dist,
              });
            }
          }
        }
        setPins(nextPins);
        return;
      }

      // Gates Tab with a Selected Gate: gate name & number are already shown on the 3D gate plaque
      if (dockTabRef.current === 'gates' && selectedGateRef.current) {
        setPins(nextPins);
        return;
      }

      // Standard Landmarks & Gates Mode: Key interior & exterior orientation landmarks (occlusion-checked)
      const landmarkIds = [
        'kaaba',
        'black-stone',
        'hijr-ismail',
        'maqam-ibrahim',
        'zamzam',
        'safa-marwah',
        'safa-mount',
        'marwah-mount',
        'clock-tower',
        'jabal-omar',
        'al-safwah',
        'shamiyah-towers',
        'makkah-hilton',
        'ghazzah-towers',
        'dar-al-tawhid',
        'ibrahim-khalil-hotels',
        'eastern-tunnels-plazas',
      ];
      HARAM_LANDMARKS.forEach((lm) => {
        if (!landmarkIds.includes(lm.id)) return;
        const isExteriorTower = exteriorTourLandmarkIds.includes(lm.id);
        _projVec.set(lm.position[0], lm.position[1] + getLandmarkPinYOffset(lm), lm.position[2]);
        const dist = camera.position.distanceTo(_projVec);
        if (dist > (isExteriorTower ? 650 : 230)) return;
        if (!isLandmarkActuallyVisible(lm)) return;
        _projVec.project(camera);
        if (_projVec.z > 1 || _projVec.z < -1) return;
        const sx = ((_projVec.x + 1) / 2) * w;
        const sy = ((-_projVec.y + 1) / 2) * h;
        if (sx < 24 || sx > w - 24 || sy < 58 || sy > h - 140) return;
        nextPins.push({
          id: lm.id,
          label: isEn ? lm.nameEn : lm.nameAr,
          x: sx,
          y: sy,
          visible: true,
          kind: 'landmark',
          distance: dist,
        });
      });

      setPins(nextPins);
    };

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    let lastTourUiSync = 0;
    let lastLapShownKey = '';
    let lastBannerKey = '';
    let activeLapTimeFrac = 0;

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.08);
      const elapsed = clock.getElapsedTime();
      const nowMs = performance.now();
      const activeStop = UMRAH_3D_TOUR_STOPS[activeTourIdxRef.current] || UMRAH_3D_TOUR_STOPS[0];
      activeLapTimeFrac = 0;

      // Living Animated Umrah Tour Choreography (like a real 3D video walkthrough)
      const isTourTab = dockTabRef.current === 'tour';
      let heroTakbirThisFrame = false;

      if (isTourTab && tourPhaseRef.current === 'choose-landmark') {
        handles.setTourHeroState({
          visible: false,
          x: 0,
          y: 0,
          z: 0,
          yaw: 0,
          walking: false,
        });
        if (lastLapShownKey !== '') {
          lastLapShownKey = '';
          setLiveLapBadge(null);
        }
        if (lastBannerKey !== '') {
          lastBannerKey = '';
          setTourRitualBanner(null);
        }
        tourBannerActiveRef.current = false;
        handles.setRitualOverlay('none', 0, 0);
        handles.setZamzamToSafaPath(false);
        handles.setRoofCutaway(roofCutawayRef.current);
      } else if (isTourTab) {
        const stop = UMRAH_3D_TOUR_STOPS[activeTourIdxRef.current] || UMRAH_3D_TOUR_STOPS[0];
        if (tourPlayingRef.current) {
          tourProgressRef.current += (delta * tourSpeedRef.current) / Math.max(2, stop.durationSec);
          if (tourProgressRef.current >= 1) {
            if (activeTourIdxRef.current >= UMRAH_3D_TOUR_STOPS.length - 1) {
              // Tour finished completely: stop at end of Step 9 and reveal bottom card
              tourProgressRef.current = 1;
              setTourProgress(1);
              tourPlayingRef.current = false;
              setTourPlaying(false);
              tourDockVisibleRef.current = true;
              setTourDockVisible(true);
              setDockExpanded(true);
            } else {
              const nextIdx = activeTourIdxRef.current + 1;
              activeTourIdxRef.current = nextIdx;
              tourProgressRef.current = 0;
              tourCamDetachedRef.current = false;
              tourFollowCamRef.current = true;
              setActiveTourIdx(nextIdx);
              const nextStop = UMRAH_3D_TOUR_STOPS[nextIdx];
              const origin = selectedTourOriginRef.current;
              if ((nextIdx === 0 || nextIdx === 1) && origin) {
                const g = HARAM_GATES.find((item) => item.id === origin.nearestGateId) || null;
                setSelectedGate(g);
                setSelectedLandmark(null);
              } else {
                setSelectedGate(null);
                if (nextStop.landmarkId) {
                  const lm = HARAM_LANDMARKS.find((item) => item.id === nextStop.landmarkId) || null;
                  setSelectedLandmark(lm);
                } else {
                  setSelectedLandmark(null);
                }
              }
            }
          }
        }

        // activeStop is already defined at tick start
        const origin = selectedTourOriginRef.current || TOUR_EXTERIOR_ORIGINS[0];
        const p = THREE.MathUtils.clamp(tourProgressRef.current, 0, 1);

        let heroWalking = false;
        let heroPraying = false;
        let heroHands = false;
        let heroPointingRight = false;
        let heroHarwalah = false;
        let heroIdtiba = false;
        let heroHairShort = false;
        let heroYaw = 0;
        let activeTawafLap = 0;
        let activeSaiLap = 0;

        const isOverheadTour = tourViewModeRef.current === 'overhead';

        if (activeStop.ritualMode === 'arrival') {
          _heroPos.set(
            THREE.MathUtils.lerp(origin.step1Start[0], origin.step1End[0], p),
            THREE.MathUtils.lerp(origin.step1Start[1], origin.step1End[1], p),
            THREE.MathUtils.lerp(origin.step1Start[2], origin.step1End[2], p)
          );
          heroYaw = Math.atan2(
            origin.step1End[0] - origin.step1Start[0],
            origin.step1End[2] - origin.step1Start[2]
          );
          heroWalking = tourPlayingRef.current;
          if (isOverheadTour) {
            const sx = THREE.MathUtils.lerp(origin.gateOverviewCamStart[0], origin.gateOverviewCamEnd[0], p);
            const sz = THREE.MathUtils.lerp(origin.gateOverviewCamStart[2], origin.gateOverviewCamEnd[2], p);
            const tx = (origin.step1Start[0] + origin.gateOverviewTarget[0]) * 0.5;
            const tz = (origin.step1Start[2] + origin.gateOverviewTarget[2]) * 0.5;
            _tourCamPos.set(tx + (sx - tx) * 1.15, 62, tz + (sz - tz) * 1.15);
            _tourCamTarget.set(tx, 2, tz);
          } else {
            const dx = origin.step1End[0] - origin.step1Start[0];
            const dz = origin.step1End[2] - origin.step1Start[2];
            const len = Math.hypot(dx, dz) || 1;
            const fx = dx / len;
            const fz = dz / len;
            const px = -fz;
            const pz = fx;
            _tourCamPos.set(
              _heroPos.x - fx * 12.5 + px * 4.5,
              5.8,
              _heroPos.z - fz * 12.5 + pz * 4.5
            );
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.45, _heroPos.z);
          }
        } else if (activeStop.ritualMode === 'gate-entry') {
          sampleWaypoints(origin.step2Waypoints, p, _heroPos);
          sampleWaypoints(origin.step2Waypoints, Math.min(1, p + 0.03), _heroNext);
          heroYaw = Math.atan2(_heroNext.x - _heroPos.x, _heroNext.z - _heroPos.z);
          heroWalking = tourPlayingRef.current;

          if (isOverheadTour) {
            _tourCamPos.set(_heroPos.x * 0.65, 68, _heroPos.z * 0.65 + 14);
            _tourCamTarget.set(_heroPos.x * 0.55, 1.5, _heroPos.z * 0.55);
          } else {
            // Trail directly behind the pilgrim along the gate corridor so the pilgrim stays centered
            if (p < 0.16) {
              const p1 = origin.step2Waypoints[Math.min(1, origin.step2Waypoints.length - 1)];
              const dx = p1[0] - origin.step2Waypoints[0][0];
              const dz = p1[2] - origin.step2Waypoints[0][2];
              const len = Math.hypot(dx, dz) || 1;
              const fx = dx / len;
              const fz = dz / len;
              const preBlend = p / 0.16;
              sampleWaypoints(origin.step2Waypoints, 0.02, _heroNext);
              _tourCamPos.set(
                THREE.MathUtils.lerp(origin.step2Waypoints[0][0] - fx * 10.5, _heroNext.x, preBlend),
                4.1,
                THREE.MathUtils.lerp(origin.step2Waypoints[0][2] - fz * 10.5, _heroNext.z, preBlend)
              );
            } else {
              const camProgress = Math.max(0.02, p - 0.14);
              sampleWaypoints(origin.step2Waypoints, camProgress, _tourCamPos);
              const rCam = Math.hypot(_tourCamPos.x, _tourCamPos.z);
              const insideMatafT = THREE.MathUtils.clamp((40 - rCam) / 14, 0, 1);
              _tourCamPos.y = THREE.MathUtils.lerp(4.1, 5.4, insideMatafT);
            }
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.45, _heroPos.z);
          }
        } else if (activeStop.ritualMode === 'black-stone') {
          _heroPos.set(9.4, 0.22, 9.4);
          heroYaw = Math.atan2(-1, -1); // Facing Black Stone corner
          heroHands = true;
          heroIdtiba = true; // Uncover right shoulder preparing for Tawaf
          if (isOverheadTour) {
            const orbit = p * 0.35;
            _tourCamPos.set(10 + 6 * Math.cos(0.6 + orbit), 36, 10 + 6 * Math.sin(0.6 + orbit));
            _tourCamTarget.set(5.5, 1.5, 5.5);
          } else {
            const orbit = p * 0.35;
            _tourCamPos.set(
              _heroPos.x + 8.5 * Math.cos(0.45 + orbit),
              4.0,
              _heroPos.z + 8.5 * Math.sin(0.45 + orbit)
            );
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
          }
        } else if (activeStop.ritualMode === 'tawaf-7') {
          // First 3 circuits (Ramal) are brisker than circuits 4-7; after each lap, stop at Black Stone line, face Qiblah, raise right hand & show "الله أكبر"
          const tawafSplit = 3 / (3 + 4 * 1.45);
          const totalLap =
            p < tawafSplit
              ? (p / tawafSplit) * 3
              : 3 + ((p - tawafSplit) / (1 - tawafSplit)) * 4;
          const lapIdx = Math.min(6, Math.floor(totalLap));
          const lapTimeFrac = totalLap - Math.floor(totalLap);
          const TAWAF_WALK_END = 0.76;
          activeLapTimeFrac = lapTimeFrac;
          activeTawafLap = lapIdx + 1;
          heroIdtiba = true; // Right shoulder uncovered during Tawaf

          if (lapTimeFrac < TAWAF_WALK_END) {
            const walkFrac = lapTimeFrac / TAWAF_WALK_END;
            sampleTawafPoint(lapIdx, walkFrac, _heroPos);
            sampleTawafPoint(lapIdx, Math.min(0.999, walkFrac + 0.018), _heroNext);
            heroYaw = Math.atan2(_heroNext.x - _heroPos.x, _heroNext.z - _heroPos.z);
            heroWalking = tourPlayingRef.current;
            heroHarwalah = lapIdx < 3; // Brisk Ramal stride in circuits 1-3
          } else {
            const istilamT = (lapTimeFrac - TAWAF_WALK_END) / (1 - TAWAF_WALK_END);
            sampleTawafPoint(lapIdx, 0, _heroPos);
            sampleTawafPoint(lapIdx, 0.018, _heroNext);
            const walkYaw = Math.atan2(_heroNext.x - _heroPos.x, _heroNext.z - _heroPos.z);
            const qiblahYaw = Math.atan2(3.25 - _heroPos.x, 3.7 - _heroPos.z);
            const turnIn = THREE.MathUtils.smoothstep(istilamT, 0, 0.24);
            const turnOut = lapIdx < 6 ? THREE.MathUtils.smoothstep(istilamT, 0.82, 1.0) : 0;
            const faceQiblah = turnIn * (1 - turnOut);
            let angleDiff = ((qiblahYaw - walkYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
            if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            heroYaw = walkYaw + angleDiff * faceQiblah;
            heroPointingRight = istilamT >= 0.12 && istilamT <= 0.90;
            heroTakbirThisFrame = istilamT >= 0.10 && istilamT <= 0.92;
          }

          if (isOverheadTour) {
            const wCurrTawaf = container.clientWidth || window.innerWidth;
            const hCurrTawaf = container.clientHeight || window.innerHeight;
            const aspectTawaf = wCurrTawaf / Math.max(1, hCurrTawaf);
            const halfTanVTawaf = Math.tan(THREE.MathUtils.degToRad(27));
            const minSpanTawaf = Math.min(halfTanVTawaf, halfTanVTawaf * aspectTawaf);
            // True top-down overhead camera showing the Holy Kaaba + 7 Tawaf circuits, brought 30% closer downward
            const tawafOverheadY = Math.min(93, Math.max(46, (29.5 / Math.max(0.21, minSpanTawaf)) * 0.70));
            _tourCamPos.set(0, tawafOverheadY, 1.8);
            _tourCamTarget.set(0, 0, 0);
          } else {
            // Close-up 3rd-person follow camera keeping the pilgrim dead-center with Kaaba behind/left
            const radLen = Math.hypot(_heroPos.x, _heroPos.z) || 1;
            const rx = _heroPos.x / radLen;
            const rz = _heroPos.z / radLen;
            const fwdX = rz;
            const fwdZ = -rx;
            _tourCamPos.set(
              _heroPos.x + rx * 9.8 - fwdX * 3.4,
              4.3,
              _heroPos.z + rz * 9.8 - fwdZ * 3.4
            );
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
          }
        } else if (activeStop.ritualMode === 'maqam-prayer') {
          _heroPos.set(15.2, 0.22, -0.6);
          heroYaw = -Math.PI / 2; // Facing Maqam Ibrahim & Kaaba
          heroPraying = true;
          heroIdtiba = false; // Both shoulders covered for prayer
          if (isOverheadTour) {
            _tourCamPos.set(15.5, 34, 4.5 - p * 3);
            _tourCamTarget.set(12.2, 1.5, -0.6);
          } else {
            _tourCamPos.set(22.2, 4.0, 2.8 - p * 3.2);
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.2, _heroPos.z);
          }
        } else if (activeStop.ritualMode === 'zamzam') {
          heroIdtiba = false;
          if (p < 0.22) {
            const tWalk = p / 0.22;
            _heroPos.set(
              THREE.MathUtils.lerp(15.2, 16.8, tWalk),
              0.22,
              THREE.MathUtils.lerp(-0.6, 7.6, tWalk)
            );
            heroYaw = Math.atan2(1.6, 8.2);
            heroWalking = tourPlayingRef.current;
            if (isOverheadTour) {
              _tourCamPos.set(_heroPos.x + 2, 42, _heroPos.z + 10);
              _tourCamTarget.set(_heroPos.x, 1.2, _heroPos.z);
            } else {
              _tourCamPos.set(
                THREE.MathUtils.lerp(22.8, 24.8, tWalk),
                4.4,
                THREE.MathUtils.lerp(3.0, 11.8, tWalk)
              );
              _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
            }
          } else if (p < 0.40) {
            _heroPos.set(16.8, 0.22, 7.6);
            heroYaw = Math.atan2(-1, -0.45);
            heroHands = true;
            if (isOverheadTour) {
              _tourCamPos.set(18.8, 42, 17.6);
              _tourCamTarget.set(16.5, 1.2, 7.6);
            } else {
              _tourCamPos.set(24.8, 4.4, 11.8);
              _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
            }
          } else {
            const safaT = (p - 0.40) / 0.60;
            sampleWaypoints(ZAMZAM_TO_SAFA_WAYPOINTS, safaT, _heroPos);
            sampleWaypoints(ZAMZAM_TO_SAFA_WAYPOINTS, Math.min(1, safaT + 0.03), _heroNext);
            heroYaw = Math.atan2(_heroNext.x - _heroPos.x, _heroNext.z - _heroPos.z);
            heroWalking = tourPlayingRef.current;

            if (isOverheadTour) {
              _tourCamPos.set(_heroPos.x * 0.78 + 6, 48, _heroPos.z * 0.78 + 12);
              _tourCamTarget.set(_heroPos.x, 1.2, _heroPos.z);
            } else {
              if (safaT < 0.16) {
                const blendCam = safaT / 0.16;
                sampleWaypoints(ZAMZAM_TO_SAFA_WAYPOINTS, 0.02, _heroNext);
                _tourCamPos.set(
                  THREE.MathUtils.lerp(24.8, _heroNext.x, blendCam),
                  4.4,
                  THREE.MathUtils.lerp(11.8, _heroNext.z, blendCam)
                );
              } else {
                const camU = Math.max(0.02, safaT - 0.14);
                sampleWaypoints(ZAMZAM_TO_SAFA_WAYPOINTS, camU, _tourCamPos);
                _tourCamPos.y = _tourCamPos.x > 42 ? 3.8 : 4.4;
              }
              _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
            }
          }
        } else if (activeStop.ritualMode === 'safa-dua') {
          _heroPos.set(68, 0.85, 64.5);
          heroYaw = Math.atan2(-1, -0.45); // Facing Kaaba from atop Safa
          heroHands = true;
          heroIdtiba = false; // Both shoulders covered in Sa'i
          if (isOverheadTour) {
            _tourCamPos.set(68 + Math.sin(p * 1.4) * 3, 40, 56);
            _tourCamTarget.set(68, 1.5, 65.5);
          } else {
            _tourCamPos.set(68 + Math.sin(p * 1.6) * 2.2, 3.8, 53.5);
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
          }
        } else if (activeStop.ritualMode === 'sai-7') {
          const SAI_WALK_END = 0.58;
          const SAI_TOTAL_UNITS = 6 + SAI_WALK_END;
          const unitPos = p * SAI_TOTAL_UNITS;
          const lapIdx = Math.min(6, Math.floor(unitPos));
          const lapTimeFrac =
            lapIdx < 6
              ? unitPos - lapIdx
              : Math.min(1, (unitPos - 6) / SAI_WALK_END) * SAI_WALK_END;
          activeSaiLap = lapIdx + 1;
          heroIdtiba = false; // Both shoulders covered during Sa'i

          if (lapTimeFrac < SAI_WALK_END) {
            const walkFrac = lapTimeFrac / SAI_WALK_END;
            // Normal walk outside green markers, brisk Harwalah acceleration inside green zone (first half: z in [12.5, 37.5])
            const lapSpatialFrac = mapSaiSpeedProgress(walkFrac, lapIdx);
            const nextSpatialFrac = mapSaiSpeedProgress(Math.min(1, walkFrac + 0.015), lapIdx);
            sampleSaiPoint(lapIdx, lapSpatialFrac, _heroPos);
            sampleSaiPoint(lapIdx, nextSpatialFrac, _heroNext);
            heroYaw = Math.atan2(_heroNext.x - _heroPos.x, _heroNext.z - _heroPos.z);
            heroWalking = tourPlayingRef.current;
            heroHarwalah = _heroPos.z >= 12.5 && _heroPos.z <= 37.5;
          } else {
            // Stop at Mount Marwah (end of laps 1, 3, 5) or Mount Safa (end of laps 2, 4, 6), face Kaaba, raise hands, and recite dhikr 3x
            const stopT = THREE.MathUtils.clamp((lapTimeFrac - SAI_WALK_END) / (1 - SAI_WALK_END), 0, 1);
            const isAtMarwah = lapIdx % 2 === 0;
            const stepBlend = THREE.MathUtils.smoothstep(stopT, 0, 0.10);
            sampleSaiPoint(lapIdx, 1, _heroPos);
            _heroPos.x = THREE.MathUtils.lerp(_heroPos.x, 68, stepBlend);
            _heroPos.y = THREE.MathUtils.lerp(_heroPos.y, 0.85, stepBlend);
            _heroPos.z = THREE.MathUtils.lerp(_heroPos.z, isAtMarwah ? -64.5 : 64.5, stepBlend);

            const arriveYaw = isAtMarwah ? Math.PI : 0;
            const kaabaYaw = Math.atan2(-1, isAtMarwah ? 0.45 : -0.45);
            let angleDiff = kaabaYaw - arriveYaw;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            const turnIn = THREE.MathUtils.smoothstep(stopT, 0, 0.18);
            const turnOut = THREE.MathUtils.smoothstep(stopT, 0.90, 1.0);
            const nextDepartYaw = isAtMarwah ? 0 : Math.PI;
            let departDiff = nextDepartYaw - kaabaYaw;
            while (departDiff > Math.PI) departDiff -= Math.PI * 2;
            while (departDiff < -Math.PI) departDiff += Math.PI * 2;
            heroYaw =
              turnOut > 0
                ? kaabaYaw + departDiff * turnOut
                : arriveYaw + angleDiff * turnIn;

            heroWalking = false;
            heroHands = stopT < 0.92;
            heroHarwalah = false;
          }

          if (isOverheadTour) {
            // True top-down overhead camera for Sa'i, brought 30% closer downward with gentle Z tracking
            const wCurrSai = container.clientWidth || window.innerWidth;
            const hCurrSai = container.clientHeight || window.innerHeight;
            const aspectSai = wCurrSai / Math.max(1, hCurrSai);
            const halfTanVSai = Math.tan(THREE.MathUtils.degToRad(27));
            const saiTargetZ = THREE.MathUtils.clamp(_heroPos.z * 0.35, -22, 22);
            if (wCurrSai < hCurrSai) {
              const saiOverheadY = Math.min(130, Math.max(108, (80 / halfTanVSai) * 0.70));
              _tourCamPos.set(68, saiOverheadY, saiTargetZ + 2.2);
            } else {
              const saiOverheadY = Math.min(116, Math.max(68, (80 / (halfTanVSai * aspectSai)) * 0.70));
              _tourCamPos.set(68 + 2.2, saiOverheadY, saiTargetZ);
            }
            _tourCamTarget.set(68, 0, saiTargetZ);
          } else {
            // Close-up camera inside Al-Mas'a gallery keeping the pilgrim centered in frame
            if (lapTimeFrac < SAI_WALK_END) {
              const isGoingNorth = lapIdx % 2 === 0;
              const camZ = THREE.MathUtils.clamp(_heroPos.z + (isGoingNorth ? 9.0 : -9.0), -68, 68);
              const nearEnd = THREE.MathUtils.clamp((Math.abs(camZ) - 58) / 10, 0, 1);
              const baseCamX = THREE.MathUtils.lerp(_heroPos.x, 68, 0.48);
              const camX = THREE.MathUtils.lerp(baseCamX, isGoingNorth ? 71.5 : 64.5, nearEnd);
              const camY = THREE.MathUtils.lerp(3.9, 4.35, nearEnd);
              _tourCamPos.set(camX, camY, camZ);
              _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
            } else {
              const isAtMarwah = lapIdx % 2 === 0;
              if (isAtMarwah) {
                _tourCamPos.set(70.0, 3.8, -53.5);
              } else {
                _tourCamPos.set(66.0, 3.8, 53.5);
              }
              _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
            }
          }
        } else {
          // marwah-tahallul
          _heroPos.set(68, 0.85, -64.5);
          heroYaw = Math.atan2(-1, 0.45); // Facing Kaaba from atop Marwah
          heroHands = p < 0.78;
          heroIdtiba = false; // Both shoulders covered
          heroHairShort = p >= 0.82; // Long hair during final dua (3x) -> short cropped hair upon Tahallul
          if (isOverheadTour) {
            _tourCamPos.set(68 + Math.sin(p * 1.4) * 3, 40, -56);
            _tourCamTarget.set(68, 1.5, -65.5);
          } else {
            _tourCamPos.set(68 + Math.sin(p * 1.6) * 2.2, 3.8, -53.5);
            _tourCamTarget.set(_heroPos.x, _heroPos.y + 1.35, _heroPos.z);
          }
        }

        // If on mobile portrait screen, push camera back slightly for close-up non-Mas'a-corridor stops
        const wCurr = container.clientWidth || window.innerWidth;
        const hCurr = container.clientHeight || window.innerHeight;
        if (wCurr < hCurr && !isOverheadTour && activeStop.ritualMode !== 'sai-7') {
          const portraitZoomOut = Math.min(1.40, Math.max(1.18, (hCurr / wCurr) * 0.65));
          _camOffsetVec.subVectors(_tourCamPos, _tourCamTarget);
          _tourCamPos.copy(_tourCamTarget).addScaledVector(_camOffsetVec, portraitZoomOut);
        }

        handles.setTourHeroState({
          visible: true,
          x: _heroPos.x,
          y: _heroPos.y,
          z: _heroPos.z,
          yaw: heroYaw,
          walking: heroWalking,
          praying: heroPraying,
          raisingHands: heroHands,
          pointingRightHand: heroPointingRight,
          harwalah: heroHarwalah,
          idtiba: heroIdtiba,
          hairShort: heroHairShort,
        });

        handles.setRitualOverlay(activeStop.overlay, activeTawafLap, activeSaiLap);
        handles.setZamzamToSafaPath(activeStop.ritualMode === 'zamzam');
        handles.setRoofCutaway(
          isOverheadTour && activeStop.ritualMode === 'gate-entry'
            ? true
            : roofCutawayRef.current
        );

        if (tourFollowCamRef.current && modeRef.current === 'orbit') {
          const posLambda =
            isOverheadTour && activeStop.ritualMode === 'tawaf-7'
              ? 6.5
              : activeStop.ritualMode === 'tawaf-7' || activeStop.ritualMode === 'sai-7'
                ? 5.5
                : 4.2;
          const targetLambda =
            isOverheadTour && activeStop.ritualMode === 'tawaf-7'
              ? 12.0
              : activeStop.ritualMode === 'tawaf-7' || activeStop.ritualMode === 'sai-7'
                ? 6.5
                : posLambda;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, _tourCamPos.x, posLambda, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, _tourCamPos.y, posLambda, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, _tourCamPos.z, posLambda, delta);

          controls.target.x = THREE.MathUtils.damp(controls.target.x, _tourCamTarget.x, targetLambda, delta);
          controls.target.y = THREE.MathUtils.damp(controls.target.y, _tourCamTarget.y, targetLambda, delta);
          controls.target.z = THREE.MathUtils.damp(controls.target.z, _tourCamTarget.z, targetLambda, delta);
        }

        let nextBanner: TourRitualBanner | null = null;
        if (activeStop.ritualMode === 'black-stone') {
          nextBanner = {
            key: 'black-stone-dua',
            badgeAr: 'عند الوصول للكعبة ورفع اليدين · بداية الطواف',
            badgeEn: 'At the Kaaba · Raising Hands',
            textAr:
              'بِسْمِ اللهِ، وَاللهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ، وَتَصْدِيقًا بِكِتَابِكَ، وَوَفَاءً بِعَهْدِكَ، وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ.',
            tone: 'gold',
          };
        } else if (activeStop.ritualMode === 'maqam-prayer') {
          nextBanner = {
            key: 'maqam-prayer-dua',
            badgeAr: 'صلاة ركعتي الطواف خلف مقام إبراهيم',
            badgeEn: 'Two Rak‘ahs Behind Maqam Ibrahim',
            textAr:
              '﴿وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى﴾ · يُسنُّ قراءة ﴿قُلْ يَا أَيُّهَا الْكَافِرُونَ﴾ في الركعة الأولى و﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾ في الثانية بعد الفاتحة',
            textEn:
              'Recite Surah Al-Kafirun in the 1st Rak‘ah and Surah Al-Ikhlas in the 2nd Rak‘ah after Al-Fatihah.',
            tone: 'gold',
          };
        } else if (activeStop.ritualMode === 'zamzam') {
          if (p < 0.54) {
            nextBanner = {
              key: 'zamzam-drink-dua',
              badgeAr: 'عند الشرب من ماء زمزم والدعاء',
              badgeEn: 'Drinking Zamzam Water & Supplicating',
              textAr:
                'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا وَاسِعًا، وَشِفَاءً مِنْ كُلِّ دَاءٍ · يُستحب التضلع من ماء زمزم والدعاء بما شاء',
              textEn:
                'O Allah, I ask You for beneficial knowledge, abundant provision, and healing from every ailment.',
              tone: 'emerald',
            };
          } else {
            nextBanner = {
              key: 'safa-approach-ayah',
              badgeAr: 'عند الاقتراب من جبل الصفا لأول مرة',
              badgeEn: 'Approaching Mount Safa for the First Time',
              textAr:
                '﴿إِنَّ الصَّفَا وَالْمَرْوَةَ مِن شَعَائِرِ اللَّهِ فَمَنْ حَجَّ الْبَيْتَ أَوِ اعْتَمَرَ فَلَا جُنَاحَ عَلَيْهِ أَن يَطَّوَّفَ بِهِمَا وَمَن تَطَوَّعَ خَيْرًا فَإِنَّ اللَّهَ شَاكِرٌ عَلِيمٌ﴾',
              tone: 'emerald',
            };
          }
        } else if (activeStop.ritualMode === 'safa-dua') {
          const rep = p < 1 / 3 ? 1 : p < 2 / 3 ? 2 : 3;
          nextBanner = {
            key: `safa-dua-${rep}`,
            badgeAr: 'على جبل الصفا · يُقال ثلاث مرات',
            badgeEn: 'At Mount Safa · Recited 3 Times',
            textAr:
              'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.',
            repeatCount: { current: rep, total: 3 },
            tone: 'gold',
          };
        } else if (activeStop.ritualMode === 'sai-7') {
          const SAI_WALK_END = 0.58;
          const SAI_TOTAL_UNITS = 6 + SAI_WALK_END;
          const unitPos = p * SAI_TOTAL_UNITS;
          const lapIdx = Math.min(6, Math.floor(unitPos));
          const lapTimeFrac =
            lapIdx < 6
              ? unitPos - lapIdx
              : Math.min(1, (unitPos - 6) / SAI_WALK_END) * SAI_WALK_END;

          if (lapIdx < 6 && lapTimeFrac >= SAI_WALK_END) {
            const stopT = THREE.MathUtils.clamp((lapTimeFrac - SAI_WALK_END) / (1 - SAI_WALK_END), 0, 1);
            const isAtMarwah = lapIdx % 2 === 0;
            const rep = stopT < 1 / 3 ? 1 : stopT < 2 / 3 ? 2 : 3;
            nextBanner = {
              key: `sai-stop-${lapIdx}-${rep}`,
              badgeAr: isAtMarwah
                ? `على جبل المروة · الشوط ${activeSaiLap} · يُقال ثلاث مرات`
                : `على جبل الصفا · الشوط ${activeSaiLap} · يُقال ثلاث مرات`,
              badgeEn: isAtMarwah
                ? `At Mount Marwah · Lap ${activeSaiLap} · Recited 3 Times`
                : `At Mount Safa · Lap ${activeSaiLap} · Recited 3 Times`,
              textAr:
                'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.',
              repeatCount: { current: rep, total: 3 },
              tone: 'gold',
            };
          } else {
            nextBanner = {
              key: `sai-adhkar-${activeSaiLap}`,
              badgeAr:
                activeSaiLap > 0
                  ? `أثناء السعي بين الصفا والمروة · الشوط ${activeSaiLap} من 7`
                  : 'أثناء السعي بين الصفا والمروة',
              badgeEn:
                activeSaiLap > 0
                  ? `During Sa'i between Safa & Marwah · Lap ${activeSaiLap} / 7`
                  : "During Sa'i between Safa & Marwah",
              textAr: 'أدعية وأذكار مستحبة',
              textEn: 'Recommended Supplications & Remembrance',
              tone: 'emerald',
            };
          }
        } else if (activeStop.ritualMode === 'marwah-tahallul' && p < 0.78) {
          const rep = p < 0.26 ? 1 : p < 0.52 ? 2 : 3;
          nextBanner = {
            key: `marwah-dua-${rep}`,
            badgeAr: 'على جبل المروة · يُقال ثلاث مرات',
            badgeEn: 'At Mount Marwah · Recited 3 Times',
            textAr:
              'اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، اللهُ أَكْبَرُ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزَابَ وَحْدَهُ.',
            repeatCount: { current: rep, total: 3 },
            tone: 'gold',
          };
        }

        tourBannerActiveRef.current = Boolean(nextBanner);
        const nextBannerKey = nextBanner ? nextBanner.key : '';
        if (nextBannerKey !== lastBannerKey) {
          lastBannerKey = nextBannerKey;
          setTourRitualBanner(nextBanner);
        }

        if (nowMs - lastTourUiSync > 90) {
          lastTourUiSync = nowMs;
          setTourProgress(p);
          const lapKey =
            activeTawafLap > 0
              ? `tawaf-${activeTawafLap}`
              : activeSaiLap > 0
                ? `sai-${activeSaiLap}`
                : '';
          if (lapKey !== lastLapShownKey) {
            lastLapShownKey = lapKey;
            if (activeTawafLap > 0) setLiveLapBadge({ kind: 'tawaf', lap: activeTawafLap });
            else if (activeSaiLap > 0) setLiveLapBadge({ kind: 'sai', lap: activeSaiLap });
            else setLiveLapBadge(null);
          }
        }
      } else if (
        dockTabRef.current === 'gates' &&
        gateRouteOriginRef.current &&
        selectedGateRef.current
      ) {
        handles.setZamzamToSafaPath(false);
        handles.setRitualOverlay('none', 0, 0);

        const destGate = selectedGateRef.current;
        if (gateRoutePlayingRef.current && !gateRouteFinishedRef.current) {
          gateRouteProgressRef.current += delta / Math.max(4, gateRouteDurationRef.current);
          if (gateRouteProgressRef.current >= 1) {
            gateRouteProgressRef.current = 1;
            gateRoutePlayingRef.current = false;
            gateRouteFinishedRef.current = true;
            setGateRouteProgress(1);
            setGateRoutePlaying(false);
            setGateRouteFinished(true);
            setDockExpanded(true);
          }
        }

        const gp = THREE.MathUtils.clamp(gateRouteProgressRef.current, 0, 1);
        const hasCurve = handles.sampleLandmarkToGatePoint(gp, _heroPos);
        if (hasCurve) {
          if (gp >= 0.98) {
            _heroNext.set(destGate.position[0], _heroPos.y, destGate.position[2]);
          } else {
            handles.sampleLandmarkToGatePoint(Math.min(1, gp + 0.025), _heroNext);
          }
          const dirX = _heroNext.x - _heroPos.x;
          const dirZ = _heroNext.z - _heroPos.z;
          const dirLen = Math.hypot(dirX, dirZ) || 1;
          const heroYaw = Math.atan2(dirX, dirZ);

          handles.setTourHeroState({
            visible: true,
            x: _heroPos.x,
            y: 0.22,
            z: _heroPos.z,
            yaw: heroYaw,
            walking: gateRoutePlayingRef.current && !gateRouteFinishedRef.current,
            praying: false,
            raisingHands: false,
            harwalah: false,
            idtiba: false,
            hairShort: false,
          });

          if (tourFollowCamRef.current && modeRef.current === 'orbit') {
            const insideExp =
              Math.abs(_heroPos.x) < 56 && _heroPos.z < -60 && _heroPos.z > -115;
            const camDist = insideExp ? 14 : 24;
            const camH = insideExp ? 7.2 : 14.5;
            const ux = dirX / dirLen;
            const uz = dirZ / dirLen;

            _tourCamPos.set(_heroPos.x - ux * camDist, camH, _heroPos.z - uz * camDist);
            const gateFocus = THREE.MathUtils.smoothstep(gp, 0.82, 1.0);
            _tourCamTarget.set(
              THREE.MathUtils.lerp(_heroPos.x + ux * 10, destGate.position[0], gateFocus),
              THREE.MathUtils.lerp(2.6, 5.2, gateFocus),
              THREE.MathUtils.lerp(_heroPos.z + uz * 10, destGate.position[2], gateFocus)
            );

            const followLambda = 4.6;
            camera.position.x = THREE.MathUtils.damp(
              camera.position.x,
              _tourCamPos.x,
              followLambda,
              delta
            );
            camera.position.y = THREE.MathUtils.damp(
              camera.position.y,
              _tourCamPos.y,
              followLambda,
              delta
            );
            camera.position.z = THREE.MathUtils.damp(
              camera.position.z,
              _tourCamPos.z,
              followLambda,
              delta
            );

            controls.target.x = THREE.MathUtils.damp(
              controls.target.x,
              _tourCamTarget.x,
              followLambda,
              delta
            );
            controls.target.y = THREE.MathUtils.damp(
              controls.target.y,
              _tourCamTarget.y,
              followLambda,
              delta
            );
            controls.target.z = THREE.MathUtils.damp(
              controls.target.z,
              _tourCamTarget.z,
              followLambda,
              delta
            );
          }
        }

        if (nowMs - lastTourUiSync > 90) {
          lastTourUiSync = nowMs;
          setGateRouteProgress(gp);
        }
      } else {
        handles.setZamzamToSafaPath(false);
        handles.setRoofCutaway(roofCutawayRef.current);
        handles.setTourHeroState({
          visible: false,
          x: 0,
          y: 0,
          z: 0,
          yaw: 0,
          walking: false,
        });
        if (lastLapShownKey !== '') {
          lastLapShownKey = '';
          setLiveLapBadge(null);
        }
        if (lastBannerKey !== '') {
          lastBannerKey = '';
          setTourRitualBanner(null);
        }
        tourBannerActiveRef.current = false;
        handles.setRitualOverlay('none', 0, 0);
      }

      // Smooth damped camera preset transitions
      if (camAnimRef.current.active) {
        const lambda = 6.5;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, camAnimRef.current.pos.x, lambda, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, camAnimRef.current.pos.y, lambda, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, camAnimRef.current.pos.z, lambda, delta);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, camAnimRef.current.target.x, lambda, delta);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, camAnimRef.current.target.y, lambda, delta);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, camAnimRef.current.target.z, lambda, delta);

        if (
          camera.position.distanceTo(camAnimRef.current.pos) < 0.25 &&
          controls.target.distanceTo(camAnimRef.current.target) < 0.25
        ) {
          camAnimRef.current.active = false;
        }
      }

      if (modeRef.current === 'orbit') {
        controls.update();
      } else {
        // First-Person Walkthrough movement (Joystick + WASD/Arrows)
        const ws = walkStateRef.current;
        const keyFwd = (ws.keys['KeyW'] || ws.keys['ArrowUp'] ? 1 : 0) - (ws.keys['KeyS'] || ws.keys['ArrowDown'] ? 1 : 0);
        const keySide = (ws.keys['KeyD'] || ws.keys['ArrowRight'] ? 1 : 0) - (ws.keys['KeyA'] || ws.keys['ArrowLeft'] ? 1 : 0);

        const moveFwd = THREE.MathUtils.clamp(ws.joyY + keyFwd, -1, 1);
        const moveSide = THREE.MathUtils.clamp(ws.joyX + keySide, -1, 1);

        if (!camAnimRef.current.active) {
          if (Math.abs(moveFwd) > 0.04 || Math.abs(moveSide) > 0.04) {
            const speed = 18 * delta;
            _walkForward.set(-Math.sin(ws.yaw), 0, -Math.cos(ws.yaw)).normalize();
            _walkRight.set(Math.cos(ws.yaw), 0, -Math.sin(ws.yaw)).normalize();

            const nextX = camera.position.x + (_walkForward.x * moveFwd + _walkRight.x * moveSide) * speed;
            const nextZ = camera.position.z + (_walkForward.z * moveFwd + _walkRight.z * moveSide) * speed;

            // Keep inside outer plaza bounds & outside solid Kaaba / Safa-Marwah rock outcrops
            const clampedX = THREE.MathUtils.clamp(nextX, -110, 120);
            const clampedZ = THREE.MathUtils.clamp(nextZ, -160, 122);
            const insideKaabaBox = Math.abs(clampedX) < 4.5 && Math.abs(clampedZ) < 5.0;
            const insideSafaRock = Math.abs(clampedX - 68) < 4.2 && Math.abs(clampedZ - 70) < 3.8;
            const insideMarwahRock = Math.abs(clampedX - 68) < 4.2 && Math.abs(clampedZ + 70) < 3.8;
            if (!insideKaabaBox && !insideSafaRock && !insideMarwahRock) {
              camera.position.x = clampedX;
              camera.position.z = clampedZ;
            }
          }
          camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.45, 8, delta);

          // Apply smooth look direction
          const lookDist = 12;
          const cosP = Math.cos(ws.pitch);
          const tx = camera.position.x - Math.sin(ws.yaw) * cosP * lookDist;
          const ty = camera.position.y + Math.sin(ws.pitch) * lookDist;
          const tz = camera.position.z - Math.cos(ws.yaw) * cosP * lookDist;
          camera.lookAt(tx, ty, tz);
        }
      }

      handles.update(
        elapsed,
        tourPlayingRef.current,
        tourSpeedRef.current,
        isTourTab && tourPhaseRef.current === 'active' ? activeStop?.ritualMode || '' : '',
        activeLapTimeFrac,
        tourViewModeRef.current === 'overhead'
      );
      renderer.render(scene, camera);

      const isOverheadStep =
        isTourTab &&
        tourPhaseRef.current === 'active' &&
        tourViewModeRef.current === 'overhead';
      const badgeHeadY = _heroPos.y + (isOverheadStep ? 4.4 : 2.9);

      if (takbirBadgeRef.current) {
        if (heroTakbirThisFrame) {
          const w = container.clientWidth || window.innerWidth;
          const h = container.clientHeight || window.innerHeight;
          _projVec.set(_heroPos.x, badgeHeadY, _heroPos.z);
          _projVec.project(camera);
          if (_projVec.z <= 1 && _projVec.z >= -1) {
            const sx = ((_projVec.x + 1) / 2) * w;
            const sy = ((-_projVec.y + 1) / 2) * h;
            takbirBadgeRef.current.style.display = 'block';
            takbirBadgeRef.current.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
          } else {
            takbirBadgeRef.current.style.display = 'none';
          }
        } else {
          takbirBadgeRef.current.style.display = 'none';
        }
      }

      if (heroBannerRef.current) {
        const el = heroBannerRef.current;
        if (
          isTourTab &&
          tourPhaseRef.current === 'active' &&
          tourBannerActiveRef.current &&
          !heroTakbirThisFrame
        ) {
          const w = container.clientWidth || window.innerWidth;
          const h = container.clientHeight || window.innerHeight;
          _projVec.set(_heroPos.x, badgeHeadY, _heroPos.z);
          _projVec.project(camera);
          if (_projVec.z <= 1 && _projVec.z >= -1) {
            const rawX = ((_projVec.x + 1) / 2) * w;
            const rawY = ((-_projVec.y + 1) / 2) * h;
            const elW = el.offsetWidth || 260;
            const elH = el.offsetHeight || 80;
            const halfW = elW / 2;
            const sx = THREE.MathUtils.clamp(rawX, halfW + 10, Math.max(halfW + 10, w - halfW - 10));
            const topMin = (tourDockVisibleRef.current || !tourOnly ? 148 : 16) + elH;
            const sy = THREE.MathUtils.clamp(rawY, Math.min(topMin, h - 24), h - 24);
            el.style.visibility = 'visible';
            el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
          } else {
            el.style.visibility = 'hidden';
          }
        } else {
          el.style.visibility = 'hidden';
        }
      }

      projectLabels(nowMs);

      if (!sceneReady) setSceneReady(true);

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    if (isSoftwareGl) {
      frameId = window.setTimeout(tick, 16);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      ro?.disconnect();
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlStart);
      controls.dispose();
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      domEl.removeEventListener('webglcontextrestored', onContextRestored);
      handles.dispose();
      envRT.dispose();
      renderer.dispose();
    };
  }, [initialFocus, tourOnly, isEn]);

  // Virtual Joystick Touch Handlers
  const updateJoystickFromEvent = (clientX: number, clientY: number) => {
    const base = joystickBaseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setJoystickKnob({ x: dx, y: dy });
    walkStateRef.current.joyX = dx / maxR;
    walkStateRef.current.joyY = -dy / maxR; // up = forward (+1)
  };

  const resetJoystick = () => {
    setJoystickKnob({ x: 0, y: 0 });
    walkStateRef.current.joyX = 0;
    walkStateRef.current.joyY = 0;
  };

  const filteredGates = useMemo(() => {
    return HARAM_GATES.filter((g) => {
      if (gateFilter !== 'all' && g.direction !== gateFilter) return false;
      return true;
    });
  }, [gateFilter]);

  const directionLabels: Array<{ id: 'all' | HaramGateDirection; ar: string; en: string }> = [
    { id: 'all', ar: 'الكل', en: 'All' },
    { id: 'south', ar: 'الجنوب', en: 'South' },
    { id: 'west', ar: 'الغرب', en: 'West' },
    { id: 'north', ar: 'الشمال', en: 'North' },
    { id: 'east', ar: 'الشرق والمسعى', en: 'East & Mas\'a' },
    { id: 'expansion', ar: 'التوسعة الثالثة', en: '3rd Expansion' },
  ];

  const surfaceHudBg = s3d.isBlackTheme
    ? 'rgba(12, 14, 18, 0.90)'
    : 'rgba(15, 23, 42, 0.86)';

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-[#0b1220]"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Dedicated Isolated 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* Loading / WebGL Error Fallback */}
      {!sceneReady && !webglError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0f172a] text-white px-6 text-center">
          <Compass className="w-10 h-10 text-amber-400 animate-spin mb-3" />
          <p className="text-sm font-extrabold">
            {tourOnly
              ? isEn
                ? 'Preparing 3D Umrah Tour…'
                : 'جارٍ تجهيز الجولة المجسمة للعمرة…'
              : isEn
                ? 'Building 3D Masjid al-Haram…'
                : 'جارٍ تجهيز المجسم ثلاثي الأبعاد للمسجد الحرام…'}
          </p>
        </div>
      )}

      {webglError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0f172a] text-white px-6 text-center gap-3">
          <p className="text-base font-extrabold text-amber-300">
            {isEn ? '3D Graphics Context Unavailable' : 'تعذر تشغيل محرك الرسوميات ثلاثي الأبعاد'}
          </p>
          <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
            {isEn
              ? 'Please ensure hardware acceleration / WebGL is supported on this device.'
              : 'يرجى التأكد من دعم WebGL على هذا الجهاز وإعادة المحاولة.'}
          </p>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
            >
              {isEn ? 'Back' : 'رجوع'}
            </button>
          )}
        </div>
      )}

      {/* Projected Semantic DOM Pins (Always sharp RTL/LTR text, clickable) */}
      {(showLabels || dockTab === 'tour' || (dockTab === 'gates' && selectedGate)) &&
        pins.map((pin) => {
          const isActive =
            dockTab === 'tour'
              ? tourPhase === 'active' &&
                ((pin.kind === 'gate' && selectedTourOrigin?.nearestGateId === pin.id) ||
                  (pin.kind === 'landmark' &&
                    (selectedLandmark?.id === pin.id ||
                      (activeTourIdx === 0 && selectedTourOrigin?.landmarkId === pin.id))))
              : (pin.kind === 'gate' && selectedGate?.id === pin.id) ||
                (pin.kind === 'landmark' && selectedLandmark?.id === pin.id);
          return (
            <button
              key={pin.id}
              type="button"
              onClick={() => {
                if (dockTab === 'tour') {
                  if (tourPhase === 'choose-landmark') {
                    const origin = TOUR_EXTERIOR_ORIGINS.find((o) => o.landmarkId === pin.id);
                    if (origin) handleSelectTourExteriorLandmark(origin);
                  }
                  return;
                }
                if (pin.kind === 'gate') {
                  const g = HARAM_GATES.find((item) => item.id === pin.id);
                  if (g) handleSelectGate(g, false);
                } else {
                  const lm = HARAM_LANDMARKS.find((item) => item.id === pin.id);
                  if (lm) handleSelectLandmark(lm);
                }
              }}
              style={{
                transform: `translate3d(${pin.x}px, ${pin.y}px, 0) translate(-50%, -100%)`,
                backgroundColor: isActive
                  ? '#f59e0b'
                  : pin.kind === 'gate'
                    ? 'rgba(15, 23, 42, 0.86)'
                    : 'rgba(6, 78, 59, 0.88)',
                color: isActive ? '#0f172a' : '#ffffff',
                borderColor: isActive ? '#fde68a' : 'rgba(255,255,255,0.22)',
              }}
              className="absolute top-0 left-0 z-10 px-2 py-0.5 rounded-lg border text-[10.5px] font-extrabold whitespace-nowrap shadow-md cursor-pointer transition-colors"
            >
              {pin.label}
            </button>
          );
        })}

      {/* Floating "الله أكبر" badge above pilgrim head upon completing each Tawaf circuit */}
      <div
        ref={takbirBadgeRef}
        style={{
          display: 'none',
          transform: 'translate3d(0px, 0px, 0) translate(-50%, -100%)',
        }}
        className="absolute top-0 left-0 z-20 pointer-events-none px-3 py-1 rounded-xl bg-emerald-700/95 border-2 border-amber-300 text-amber-200 font-extrabold text-sm sm:text-base shadow-xl whitespace-nowrap"
      >
        الله أكبر
      </div>

      {/* Floating Ritual Dhikr Badge anchored directly above the 3D pilgrim character (matching "الله أكبر" badge) */}
      <div
        ref={heroBannerRef}
        style={{
          visibility: 'hidden',
          transform: 'translate3d(0px, 0px, 0) translate(-50%, -100%)',
        }}
        className="absolute top-0 left-0 z-20 pointer-events-none w-max max-w-[min(86vw,340px)] px-3 py-1 rounded-xl bg-emerald-700/95 border-2 border-amber-300 text-amber-200 font-extrabold text-xs sm:text-sm leading-snug text-center shadow-xl"
      >
        {dockTab === 'tour' && tourPhase === 'active' && tourRitualBanner && (
          <span dir={isEn && tourRitualBanner.textEn ? 'ltr' : 'rtl'}>
            {isEn && tourRitualBanner.textEn
              ? tourRitualBanner.textEn
              : tourRitualBanner.textAr}
            {tourRitualBanner.repeatCount && (
              <span className="ms-1.5 text-[11px] text-amber-300">
                ({tourRitualBanner.repeatCount.current}/{tourRitualBanner.repeatCount.total})
              </span>
            )}
          </span>
        )}
      </div>

      {/* Live Detailed Umrah Tour Plan Card when in Tour Tab (hidden during active tour in tourOnly mode until completion or screen tap) */}
      {dockTab === 'tour' && !(tourOnly && tourPhase === 'active' && !tourDockVisible) && (
        <div
          className="absolute left-3 right-3 z-20 flex justify-center pointer-events-none"
          style={{
            top: 'max(12px, var(--app-safe-top, env(safe-area-inset-top, 0px)))',
          }}
        >
          {tourPhase === 'choose-landmark' ? (
            <div
              className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-amber-400/35 px-3.5 py-2.5 text-white shadow-2xl space-y-2"
              style={{ backgroundColor: surfaceHudBg }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-[10.5px]">
                  {isEn ? 'Choose Your Exterior Starting Landmark' : 'اختر معلماً خارج الحرم لبدء جولة العمرة'}
                </span>
                <span className="text-[10px] font-bold text-emerald-300">
                  {isEn ? 'Nearest Gate View' : 'الانطلاق من أقرب باب'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-100 leading-relaxed">
                {isEn
                  ? 'Choose your preferred view mode below, then tap any famous landmark surrounding Masjid al-Haram to begin the Umrah tour.'
                  : 'اختر أولاً طريقة الرؤية المناسبة لك بالأسفل، ثم اضغط على أي معلم مشهور خارج الحرم من الشاشة أو القائمة لبدء جولة العمرة.'}
              </p>
              <div className="pt-1.5 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold text-amber-200">
                  {isEn ? 'Tour View Angle:' : 'زاوية الرؤية في الجولة:'}
                </span>
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTourViewMode('overhead')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      tourViewMode === 'overhead'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-white/85 hover:bg-white/10'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Overhead View' : 'الرؤية من الأعلى'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTourViewMode('closeup')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      tourViewMode === 'closeup'
                        ? 'bg-emerald-400 text-slate-950'
                        : 'text-white/85 hover:bg-white/10'
                    }`}
                  >
                    <Footprints className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Close-up View' : 'الرؤية من قرب'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            (() => {
              const activeStop = UMRAH_3D_TOUR_STOPS[activeTourIdx];
              const origin = selectedTourOrigin || TOUR_EXTERIOR_ORIGINS[0];
              const nearestGate = HARAM_GATES.find((g) => g.id === origin.nearestGateId);
              const gateName = nearestGate
                ? isEn
                  ? `${nearestGate.nameEn} (${nearestGate.number})`
                  : `${nearestGate.nameAr} (باب ${nearestGate.number})`
                : '';

              const dynamicPhase =
                activeTourIdx === 0
                  ? isEn
                    ? `1. From ${origin.nameEn} to ${gateName}`
                    : `١. من ${origin.nameAr} إلى ${gateName}`
                  : activeTourIdx === 1
                    ? isEn
                      ? `2. Entering ${gateName} → Kaaba`
                      : `٢. الدخول من ${gateName} نحو الكعبة`
                    : isEn
                      ? activeStop.phaseEn
                      : activeStop.phaseAr;

              const dynamicDetail =
                activeTourIdx === 0
                  ? isEn
                    ? `Starting outside the Sanctuary from ${origin.nameEn}, facing ${gateName} clearly before entering Masjid al-Haram.`
                    : `الانطلاق من محيط ${origin.nameAr} (${origin.directionAr}) بمشهد خارجي واضح يظهر فيه ${gateName} كاملاً قبل دخول المسجد الحرام.`
                  : activeTourIdx === 1
                    ? isEn
                      ? `Entering through ${gateName} with the right foot and walking directly inside toward the Holy Kaaba in the Mataf.`
                      : `الدخول بالقدم اليمنى عبر ${gateName} والسير في أروقة المسجد الحرام وصولاً إلى الكعبة المشرفة في صحن المطاف.`
                    : isEn
                      ? activeStop.detailEn
                      : activeStop.detailAr;

              return (
                <div
                  className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-amber-400/35 px-3.5 py-2.5 text-white shadow-2xl space-y-1.5"
                  style={{ backgroundColor: surfaceHudBg }}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-[10.5px] shrink-0">
                        {dynamicPhase}
                      </span>
                      {liveLapBadge && (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[10.5px] shrink-0 animate-pulse">
                          {liveLapBadge.kind === 'tawaf'
                            ? isEn
                              ? `Tawaf Lap ${liveLapBadge.lap} / 7`
                              : `الطواف: الشوط ${liveLapBadge.lap} من 7`
                            : isEn
                              ? `Sa'i Lap ${liveLapBadge.lap} / 7`
                              : `السعي: الشوط ${liveLapBadge.lap} من 7`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          const next: TourViewMode = tourViewMode === 'overhead' ? 'closeup' : 'overhead';
                          setTourViewMode(next);
                          tourViewModeRef.current = next;
                          if (modeRef.current !== 'orbit') setMode('orbit');
                          camAnimRef.current.active = false;
                          tourCamDetachedRef.current = false;
                          tourFollowCamRef.current = true;
                        }}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors flex items-center gap-1 border ${
                          tourViewMode === 'overhead'
                            ? 'bg-amber-400/20 text-amber-200 border-amber-400/40 hover:bg-amber-400/30'
                            : 'bg-emerald-400/20 text-emerald-200 border-emerald-400/40 hover:bg-emerald-400/30'
                        }`}
                      >
                        {tourViewMode === 'overhead' ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>{isEn ? 'Overhead' : 'من الأعلى'}</span>
                          </>
                        ) : (
                          <>
                            <Footprints className="w-3 h-3" />
                            <span>{isEn ? 'Close-up' : 'من قرب'}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleEnterTourTab}
                        className="px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-amber-200 text-[10px] font-extrabold cursor-pointer"
                      >
                        {isEn ? 'Change Landmark' : 'تغيير المعلم'}
                      </button>
                      <span className="text-[10px] font-bold text-slate-300">
                        {isEn
                          ? `Step ${activeTourIdx + 1} / ${UMRAH_3D_TOUR_STOPS.length}`
                          : `الخطوة ${activeTourIdx + 1} من ${UMRAH_3D_TOUR_STOPS.length}`}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-100 leading-relaxed">{dynamicDetail}</p>

                  {tourRitualBanner ? (
                    <div
                      className={`rounded-xl border px-2.5 py-2 space-y-1 ${
                        tourRitualBanner.tone === 'gold'
                          ? 'bg-amber-500/10 border-amber-400/40'
                          : 'bg-emerald-500/10 border-emerald-400/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-extrabold ${
                            tourRitualBanner.tone === 'gold' ? 'text-amber-300' : 'text-emerald-300'
                          }`}
                        >
                          {isEn ? tourRitualBanner.badgeEn : tourRitualBanner.badgeAr}
                        </span>
                        {tourRitualBanner.repeatCount && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-extrabold text-[10px]">
                            {isEn
                              ? `${tourRitualBanner.repeatCount.current} / ${tourRitualBanner.repeatCount.total}`
                              : `المرة ${tourRitualBanner.repeatCount.current} من ${tourRitualBanner.repeatCount.total}`}
                          </span>
                        )}
                      </div>
                      <p
                        dir="rtl"
                        className={`text-xs sm:text-sm font-bold leading-relaxed ${
                          tourRitualBanner.tone === 'gold' ? 'text-amber-100' : 'text-emerald-100'
                        }`}
                      >
                        {isEn && tourRitualBanner.textEn
                          ? tourRitualBanner.textEn
                          : tourRitualBanner.textAr}
                      </p>
                    </div>
                  ) : (
                    activeStop.duaAr && (
                      <p className="text-[11px] font-bold text-emerald-300 leading-snug">
                        {isEn ? activeStop.duaEn : activeStop.duaAr}
                      </p>
                    )
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Selected Landmark Info Banner (never shown in Tour tab, Gates tab, or during landmark-to-gate walk) */}
      {dockTab !== 'tour' &&
        dockTab !== 'gates' &&
        !gateRouteOrigin &&
        (selectedGate || (selectedLandmark && selectedLandmark.id !== 'exterior-overview')) && (
        <div
          className="absolute left-3 right-3 z-20 flex justify-center pointer-events-none"
          style={{
            top: 'max(12px, var(--app-safe-top, env(safe-area-inset-top, 0px)))',
          }}
        >
          <div
            className="pointer-events-auto w-full max-w-xl rounded-2xl border border-white/15 px-3.5 py-2.5 text-white flex items-start justify-between gap-3 shadow-2xl"
            style={{ backgroundColor: surfaceHudBg }}
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs sm:text-sm font-extrabold text-amber-300">
                  {selectedGate
                    ? isEn
                      ? `${selectedGate.nameEn} · Gate ${selectedGate.number}`
                      : `${selectedGate.nameAr} · باب رقم ${selectedGate.number}`
                    : isEn
                      ? selectedLandmark!.nameEn
                      : selectedLandmark!.nameAr}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-200 leading-relaxed line-clamp-2">
                {selectedGate
                  ? isEn
                    ? selectedGate.descriptionEn
                    : selectedGate.descriptionAr
                  : isEn
                    ? selectedLandmark!.descriptionEn
                    : selectedLandmark!.descriptionAr}
              </p>
              {selectedLandmark?.ritualNoteAr && (
                <p className="text-[11px] font-bold text-emerald-300 leading-snug">
                  {isEn ? selectedLandmark.ritualNoteEn : selectedLandmark.ritualNoteAr}
                </p>
              )}
              {selectedGate && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleEnterFromSelectedGate}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-amber-300 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>
                      {isEn
                        ? 'Enter through this gate'
                        : selectedGate.leadsTo === 'masa'
                          ? 'ادخل من الباب إلى المسعى'
                          : 'ادخل من الباب إلى الكعبة'}
                    </span>
                  </button>
                </div>
              )}
              {!selectedGate &&
                selectedLandmark &&
                (selectedLandmark.id === 'safa-marwah' ||
                  selectedLandmark.id === 'safa-mount' ||
                  selectedLandmark.id === 'marwah-mount') && (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleEnterSafaMarwahWalk}
                      className="px-3 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-emerald-300 transition-colors"
                    >
                      <Footprints className="w-3.5 h-3.5" />
                      <span>
                        {isEn ? 'Walk Inside Al-Mas\'a (Safa & Marwah)' : 'تجول مشياً داخل الصفا والمروة'}
                      </span>
                    </button>
                  </div>
                )}
            </div>
            <button
              type="button"
              onClick={() => {
                stopGateRouteTour(false);
                setSelectedGate(null);
                setSelectedLandmark(null);
              }}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center shrink-0 cursor-pointer"
              aria-label={isEn ? 'Close info' : 'إغلاق'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Virtual Touch Joystick in First-Person Walk Mode */}
      {mode === 'walk' && (
        <div
          className={`absolute z-20 flex flex-col items-center gap-1.5 ${
            isRTL ? 'right-4' : 'left-4'
          }`}
          style={{
            bottom: dockExpanded ? '210px' : '64px',
            transition: 'bottom 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div
            ref={joystickBaseRef}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              updateJoystickFromEvent(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.buttons === 0 && e.pointerType === 'mouse') return;
              if (walkStateRef.current.lookPointerId === e.pointerId) return;
              if (Math.abs(walkStateRef.current.joyX) > 0 || Math.abs(walkStateRef.current.joyY) > 0 || e.pressure > 0) {
                updateJoystickFromEvent(e.clientX, e.clientY);
              }
            }}
            onPointerUp={resetJoystick}
            onPointerCancel={resetJoystick}
            className="w-24 h-24 rounded-full border-2 border-white/25 flex items-center justify-center relative touch-none cursor-grab active:cursor-grabbing"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }}
          >
            <div
              className="w-10 h-10 rounded-full bg-amber-400 shadow-md border-2 border-white pointer-events-none"
              style={{
                transform: `translate3d(${joystickKnob.x}px, ${joystickKnob.y}px, 0)`,
              }}
            />
          </div>
          <span className="text-[10px] font-bold text-white/90 bg-black/55 px-2 py-0.5 rounded-md">
            {isEn ? 'Move · Drag screen to look' : 'تحرك بالدائرة · اسحب الشاشة للنظر'}
          </span>
        </div>
      )}

      {/* Collapsible Bottom Control Dock (Hidden completely during active tour until completion or screen tap) */}
      {!(dockTab === 'tour' && tourPhase === 'active' && !tourDockVisible) && (
      <div
        className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-2xl flex flex-col items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Collapse / Expand Handle */}
        <button
          type="button"
          onClick={() => {
            if (dockTab === 'tour' && tourPhase === 'active' && dockExpanded) {
              setTourDockVisible(false);
              tourDockVisibleRef.current = false;
            } else {
              setDockExpanded((v) => !v);
            }
          }}
          className="px-3.5 py-1 rounded-t-xl border border-b-0 border-white/15 text-[11px] font-extrabold text-white flex items-center gap-1.5 cursor-pointer"
          style={{ backgroundColor: surfaceHudBg }}
        >
          {dockExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          <span>
            {dockExpanded
              ? isEn
                ? 'Hide Controls'
                : 'إخفاء القائمة'
              : tourOnly || dockTab === 'tour'
                ? isEn
                  ? 'Show Tour Controls'
                  : 'إظهار عناصر الجولة'
                : isEn
                  ? 'Show Gates & Landmarks'
                  : 'إظهار الأبواب والمعالم'}
          </span>
        </button>

        {dockExpanded && (
          <div
            className="w-full rounded-2xl border border-white/15 text-white p-2.5 space-y-2 shadow-2xl"
            style={{ backgroundColor: surfaceHudBg }}
          >
            {/* Dock Tabs (hidden in standalone extracted Umrah Tour view) */}
            {!tourOnly && (
            <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  stopGateRouteTour(true);
                  setTourPlaying(false);
                  setTourDockVisible(true);
                  tourDockVisibleRef.current = true;
                  setDockTab('landmarks');
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  dockTab === 'landmarks' ? 'bg-amber-400 text-slate-950' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{isEn ? 'Landmarks' : 'المعالم'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTourPlaying(false);
                  setTourDockVisible(true);
                  tourDockVisibleRef.current = true;
                  setDockTab('gates');
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  dockTab === 'gates' ? 'bg-amber-400 text-slate-950' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <DoorOpen className="w-3.5 h-3.5" />
                <span>{isEn ? 'Gates' : 'الأبواب'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopGateRouteTour(true);
                  setTourPlaying(false);
                  setTourDockVisible(true);
                  tourDockVisibleRef.current = true;
                  setDockTab('settings');
                }}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                  dockTab === 'settings' ? 'bg-amber-400 text-slate-950' : 'text-white/85 hover:bg-white/10'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isEn ? 'Settings' : 'الإعدادات'}</span>
              </button>
            </div>
            )}

            {/* Tab 4: Settings & Visual Controls */}
            {dockTab === 'settings' && (
              <div className="space-y-2 py-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode((m) => (m === 'orbit' ? 'walk' : 'orbit'))}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      mode === 'walk' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    <Footprints className="w-4 h-4" />
                    <span>{mode === 'walk' ? (isEn ? 'Walking Mode' : 'وضع المشي') : (isEn ? 'Walk Mode' : 'تجول مشياً')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoofCutaway((v) => !v)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      roofCutaway ? 'bg-amber-400 text-slate-950' : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    {roofCutaway ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{roofCutaway ? (isEn ? 'Show Roofs' : 'إظهار الأسقف') : (isEn ? 'Cutaway' : 'كشف الداخل')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setLighting((p) => (p === 'day' ? 'sunset' : p === 'sunset' ? 'night' : 'day'))
                    }
                    className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {lighting === 'day' ? (
                      <Sun className="w-4 h-4 text-amber-300" />
                    ) : lighting === 'sunset' ? (
                      <Sunset className="w-4 h-4 text-orange-300" />
                    ) : (
                      <Moon className="w-4 h-4 text-sky-300" />
                    )}
                    <span>
                      {lighting === 'day' ? (isEn ? 'Day Light' : 'إضاءة نهارية') : lighting === 'sunset' ? (isEn ? 'Sunset' : 'غروب') : (isEn ? 'Night' : 'ليلي')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLabels((v) => !v)}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                      showLabels ? 'bg-white/20 text-amber-300' : 'bg-white/10 text-white/60'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>{showLabels ? (isEn ? 'Labels ON' : 'المسميات ظاهرة') : (isEn ? 'Labels OFF' : 'المسميات مخفية')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGate(null);
                      setRoofCutaway(false);
                      setTourPlaying(false);
                      setMode('orbit');
                      handleSelectLandmark(HARAM_LANDMARKS[0]);
                    }}
                    className="col-span-2 sm:col-span-2 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{isEn ? 'Reset View' : 'إعادة ضبط العرض'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 1: Landmarks Quick Strip */}
            {dockTab === 'landmarks' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                  {HARAM_LANDMARKS.map((lm) => {
                    const isSel = selectedLandmark?.id === lm.id;
                    return (
                      <button
                        key={lm.id}
                        type="button"
                        onClick={() => handleSelectLandmark(lm)}
                        className={`px-3 py-1.5 rounded-xl text-[11.5px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors border ${
                          isSel
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                            : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                        }`}
                      >
                        {isEn ? lm.nameEn : lm.nameAr}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10.5px] text-slate-300 text-center">
                  {mode === 'orbit'
                    ? isEn
                      ? '1 finger: Rotate 360° · 2 fingers: Pinch zoom & pan · Tap any gate'
                      : 'إصبع واحد: تدوير 360° · إصبعان: تقريب وتبعيد وتحريك · اضغط على أي باب للدخول'
                    : isEn
                      ? 'Joystick: Walk inside/outside · Drag screen: Look around'
                      : 'الدائرة: مشي داخل وخارج الحرم · اسحب الشاشة للالتفات حولك'}
                </p>
              </div>
            )}

            {/* Tab 2: Categorized All Haram Gates */}
            {dockTab === 'gates' && (
              <div className="space-y-2">
                {/* Direction Filter */}
                <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                  {directionLabels.map((d) => {
                    const active = gateFilter === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setGateFilter(d.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                          active ? 'bg-emerald-500 text-slate-950 font-extrabold' : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        {isEn ? d.en : d.ar}
                      </button>
                    );
                  })}
                </div>

                {/* Matching Gates Horizontal Scroll */}
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                  {filteredGates.length === 0 ? (
                    <span className="text-xs text-slate-300 px-2 py-1">
                      {isEn ? 'No gates match your search' : 'لا توجد أبواب مطابقة للبحث'}
                    </span>
                  ) : (
                    filteredGates.map((gate) => {
                      const isSel = selectedGate?.id === gate.id;
                      return (
                        <button
                          key={gate.id}
                          type="button"
                          onClick={() => handleSelectGate(gate, false)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                            isSel
                              ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                              : gate.isMajor
                                ? 'bg-amber-500/20 text-amber-200 border-amber-400/35 hover:bg-amber-500/30'
                                : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
                          }`}
                        >
                          <span className="font-mono text-[10px] opacity-85">#{gate.number}</span>
                          <span>{isEn ? gate.nameEn : gate.nameAr}</span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Surrounding Exterior Landmarks — appears below selected gate to walk from landmark to gate */}
                {selectedGate && (
                  <div className="pt-1.5 border-t border-white/10 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[10.5px]">
                      <span className="font-extrabold text-emerald-300">
                        {isEn
                          ? `Walk to ${selectedGate.nameEn} from a surrounding landmark:`
                          : `اختر معلماً محيطاً للانطلاق منه إلى ${selectedGate.nameAr}:`}
                      </span>
                      {gateRouteOrigin && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              if (gateRouteFinished) {
                                handleStartGateRouteFromLandmark(selectedGate, gateRouteOrigin);
                                return;
                              }
                              const next = !gateRoutePlaying;
                              if (next) {
                                if (modeRef.current !== 'orbit') setMode('orbit');
                                camAnimRef.current.active = false;
                                tourCamDetachedRef.current = false;
                                tourFollowCamRef.current = true;
                                setDockExpanded(false);
                              } else {
                                tourFollowCamRef.current = false;
                              }
                              gateRoutePlayingRef.current = next;
                              setGateRoutePlaying(next);
                            }}
                            className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] flex items-center gap-1 cursor-pointer ${
                              gateRoutePlaying
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                            }`}
                          >
                            {gateRouteFinished ? (
                              <RotateCcw className="w-3 h-3" />
                            ) : gateRoutePlaying ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                            <span>
                              {gateRouteFinished
                                ? isEn
                                  ? 'Replay'
                                  : 'إعادة'
                                : gateRoutePlaying
                                  ? isEn
                                    ? 'Pause'
                                    : 'إيقاف'
                                  : isEn
                                    ? 'Resume'
                                    : 'متابعة'}
                            </span>
                          </button>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-200 font-bold text-[10px]">
                            {gateRouteFinished
                              ? isEn
                                ? 'Arrived'
                                : 'تم الوصول للباب'
                              : `${Math.round(gateRouteProgress * 100)}%`}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                      {TOUR_EXTERIOR_ORIGINS.map((origin) => {
                        const isSelOrigin = gateRouteOrigin?.landmarkId === origin.landmarkId;
                        return (
                          <button
                            key={origin.landmarkId}
                            type="button"
                            onClick={() => handleStartGateRouteFromLandmark(selectedGate, origin)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer border transition-colors flex items-center gap-1.5 ${
                              isSelOrigin
                                ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-extrabold'
                                : 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30 hover:bg-emerald-500/30'
                            }`}
                          >
                            <Route className="w-3 h-3 shrink-0" />
                            <span>{isEn ? origin.nameEn : origin.nameAr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Live Video-Like Guided Umrah Step-by-Step 3D Tour */}
            {dockTab === 'tour' &&
              (tourPhase === 'choose-landmark' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
                    {TOUR_EXTERIOR_ORIGINS.map((origin) => {
                      const gate = HARAM_GATES.find((g) => g.id === origin.nearestGateId);
                      return (
                        <button
                          key={origin.landmarkId}
                          type="button"
                          onClick={() => handleSelectTourExteriorLandmark(origin)}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-slate-950 border border-white/15 hover:border-amber-300 text-start transition-colors shrink-0 cursor-pointer group"
                        >
                          <div className="text-[11.5px] font-extrabold whitespace-nowrap">
                            {isEn ? origin.nameEn : origin.nameAr}
                          </div>
                          {gate && (
                            <div className="text-[10px] text-amber-300 group-hover:text-slate-900 font-bold whitespace-nowrap">
                              {isEn
                                ? `Nearest: ${gate.nameEn} (${gate.number})`
                                : `أقرب باب: ${gate.nameAr} (${gate.number})`}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                (() => {
                  const origin = selectedTourOrigin || TOUR_EXTERIOR_ORIGINS[0];
                  const nearestGate = HARAM_GATES.find((g) => g.id === origin.nearestGateId);
                  const gateLabel = nearestGate
                    ? isEn
                      ? `${nearestGate.nameEn} (${nearestGate.number})`
                      : `${nearestGate.nameAr} (${nearestGate.number})`
                    : '';
                  const currentStop = UMRAH_3D_TOUR_STOPS[activeTourIdx];
                  const currentTitle =
                    activeTourIdx === 0
                      ? isEn
                        ? `1. Approach ${gateLabel}`
                        : `١. التوجه نحو ${gateLabel}`
                      : activeTourIdx === 1
                        ? isEn
                          ? `2. Enter ${gateLabel} → Kaaba`
                          : `٢. الدخول من ${gateLabel} للكعبة`
                        : isEn
                          ? currentStop.titleEn
                          : currentStop.titleAr;

                  return (
                    <div className="space-y-2">
                      {/* Video Player Controls + Progress Bar */}
                      <div className="flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const next = !tourPlaying;
                            if (next) {
                              if (
                                activeTourIdx >= UMRAH_3D_TOUR_STOPS.length - 1 &&
                                tourProgressRef.current >= 0.99
                              ) {
                                handleTourStop(0, true);
                                return;
                              }
                              if (modeRef.current !== 'orbit') setMode('orbit');
                              camAnimRef.current.active = false;
                              tourCamDetachedRef.current = false;
                              tourFollowCamRef.current = true;
                              setTourDockVisible(false);
                              tourDockVisibleRef.current = false;
                            } else {
                              tourFollowCamRef.current = false;
                            }
                            setTourPlaying(next);
                            tourPlayingRef.current = next;
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer shrink-0 ${
                            tourPlaying
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                          }`}
                        >
                          {tourPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{tourPlaying ? (isEn ? 'Pause' : 'إيقاف') : isEn ? 'Play' : 'تشغيل'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleTourStop(activeTourIdx - 1, true)}
                          className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          {isEn ? 'Prev' : 'السابق'}
                        </button>

                        <div className="flex-1 min-w-0 px-1 space-y-1">
                          <div className="text-[11px] font-extrabold text-amber-300 truncate text-center">
                            {currentTitle}
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-[width] duration-100"
                              style={{ width: `${Math.round(tourProgress * 100)}%` }}
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleTourStop(activeTourIdx + 1, true)}
                          className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-bold cursor-pointer shrink-0"
                        >
                          {isEn ? 'Next' : 'التالي'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setTourSpeed((s) => (s === 1 ? 2 : 1))}
                          className="px-2 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-mono font-extrabold text-amber-300 cursor-pointer shrink-0"
                          title={isEn ? 'Toggle playback speed' : 'سرعة العرض'}
                        >
                          {tourSpeed}x
                        </button>
                      </div>

                      {/* All 9 Umrah Plan Steps Horizontal Selector */}
                      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar pb-0.5">
                        {UMRAH_3D_TOUR_STOPS.map((st, idx) => {
                          const active = idx === activeTourIdx;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => handleTourStop(idx, true)}
                              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap shrink-0 cursor-pointer border transition-colors ${
                                active
                                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                                  : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20'
                              }`}
                            >
                              {isEn ? st.phaseEn : st.phaseAr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default MasjidHaram3DViewer;
