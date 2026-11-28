/// <reference types="vite/client" />
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
    Map as MapLibreMap,
    Marker as MapLibreMarker,
    LngLatBounds,
    getRTLTextPluginStatus,
    setRTLTextPlugin,
    setWorkerUrl,
    type SkySpecification,
    type StyleSpecification
} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';
import SunCalc from 'suncalc';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { InAppPermissionModal } from '../System/InAppPermissionModal';
import { requestCameraPermission } from '../../utils/notifications/permissionHelper';
import { hexToRgba } from '../../utils/styles/flatDesignTokens';
import { Kaaba3DIcon, KaabaAR3DMonument, Sun3DIcon, Moon3DIcon, Shadow3DIcon, Phone3DIcon, Qibla3DArrow, Compass3DLetter, Compass3DCenterDome } from './Qibla3DIcons';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const calcDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const buildGeodesicQiblaPoints = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
    steps = 64
): [number, number][] => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;

    const phi1 = toRad(lat1);
    const lam1 = toRad(lng1);
    const phi2 = toRad(lat2);
    const lam2 = toRad(lng2);

    const x1 = Math.cos(phi1) * Math.cos(lam1);
    const y1 = Math.cos(phi1) * Math.sin(lam1);
    const z1 = Math.sin(phi1);

    const x2 = Math.cos(phi2) * Math.cos(lam2);
    const y2 = Math.cos(phi2) * Math.sin(lam2);
    const z2 = Math.sin(phi2);

    const dot = Math.min(1, Math.max(-1, x1 * x2 + y1 * y2 + z1 * z2));
    const omega = Math.acos(dot);

    if (omega < 0.0002) {
        return [
            [lng1, lat1],
            [lng2, lat2]
        ];
    }

    const sinOmega = Math.sin(omega);
    const coords: [number, number][] = [];

    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const a = Math.sin((1 - t) * omega) / sinOmega;
        const b = Math.sin(t * omega) / sinOmega;
        const x = a * x1 + b * x2;
        const y = a * y1 + b * y2;
        const z = a * z1 + b * z2;
        const lat = toDeg(Math.atan2(z, Math.hypot(x, y)));
        const lng = toDeg(Math.atan2(y, x));
        coords.push([lng, lat]);
    }

    return coords;
};

let cachedLibertyBaseStyle: StyleSpecification | null = null;
let workerUrlConfigured = false;
let rtlPluginInitialized = false;

const ensureMapLibreWorkerAndRTL = () => {
    if (!workerUrlConfigured) {
        workerUrlConfigured = true;
        try {
            if (typeof setWorkerUrl === 'function' && maplibreWorkerUrl) {
                setWorkerUrl(maplibreWorkerUrl);
            }
        } catch {
            // Ignore if already configured
        }
    }
    if (rtlPluginInitialized) return;
    rtlPluginInitialized = true;
    try {
        if (
            typeof getRTLTextPluginStatus === 'function' &&
            getRTLTextPluginStatus() === 'unavailable'
        ) {
            setRTLTextPlugin(
                'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
                true
            ).catch(() => {});
        }
    } catch {
        // Ignore if already registered
    }
};

const get3DSkyConfig = (isBlackTheme: boolean): SkySpecification =>
    isBlackTheme
        ? {
              'sky-color': '#020617',
              'sky-horizon-blend': 0.5,
              'horizon-color': '#0f172a',
              'horizon-fog-blend': 0.65,
              'fog-color': '#09090b',
              'fog-ground-blend': 0.45,
              'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 0.9, 12, 0.55]
          }
        : {
              'sky-color': '#38bdf8',
              'sky-horizon-blend': 0.55,
              'horizon-color': '#e0f2fe',
              'horizon-fog-blend': 0.72,
              'fog-color': '#f0f9ff',
              'fog-ground-blend': 0.45,
              'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 0.92, 12, 0.55]
          };

const buildFallback3DStyle = (): StyleSpecification => ({
    version: 8,
    sources: {
        openmaptiles: {
            type: 'vector',
            url: 'https://tiles.openfreemap.org/planet'
        }
    },
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#ede6d8' }
        },
        {
            id: 'water',
            type: 'fill',
            source: 'openmaptiles',
            'source-layer': 'water',
            paint: { 'fill-color': '#3b82f6' }
        },
        {
            id: 'boundary_2',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'boundary',
            filter: ['==', ['get', 'admin_level'], 2],
            paint: { 'line-color': '#94a3b8', 'line-width': 1 }
        },
        {
            id: 'building-3d',
            type: 'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            minzoom: 12,
            paint: {
                'fill-extrusion-color': '#e2e8f0',
                'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 12],
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                'fill-extrusion-opacity': 0.9
            }
        }
    ]
});

const buildEnhanced3DMapStyle = async (options: {
    isBlackTheme: boolean;
    is3DMode: boolean;
    isEn: boolean;
}): Promise<StyleSpecification> => {
    const { isBlackTheme, is3DMode, isEn } = options;

    if (!cachedLibertyBaseStyle) {
        try {
            const response = await fetch('https://tiles.openfreemap.org/styles/liberty');
            if (response.ok) {
                cachedLibertyBaseStyle = (await response.json()) as StyleSpecification;
            }
        } catch {
            // Fallback below
        }
    }

    const style: StyleSpecification = cachedLibertyBaseStyle
        ? JSON.parse(JSON.stringify(cachedLibertyBaseStyle))
        : buildFallback3DStyle();

    style.sources = {
        ...style.sources,
        ...(is3DMode
            ? {
                  'satellite-imagery': {
                      type: 'raster',
                      tiles: [
                          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                      ],
                      tileSize: 256,
                      maxzoom: 17
                  },
                  'terrain-dem': {
                      type: 'raster-dem',
                      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
                      tileSize: 256,
                      maxzoom: 15,
                      encoding: 'terrarium'
                  }
              }
            : {}),
        'hillshade-dem': {
            type: 'raster-dem',
            tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 15,
            encoding: 'terrarium'
        }
    };

    const localizedLabelExpression: any = isEn
        ? ['coalesce', ['get', 'name:en'], ['get', 'name:latin'], ['get', 'name']]
        : ['coalesce', ['get', 'name:ar'], ['get', 'name:nonlatin'], ['get', 'name'], ['get', 'name_en']];

    const transformedLayers: any[] = [];
    let reliefInserted = false;
    let hillshadeInsertedFor2D = false;

    const hillshade2DLayer: any = {
        id: 'terrain-hillshade',
        type: 'hillshade',
        source: 'hillshade-dem',
        minzoom: 2,
        paint: {
            'hillshade-method': 'multidirectional',
            'hillshade-exaggeration': isBlackTheme ? 0.72 : 0.88,
            'hillshade-illumination-direction': 315,
            'hillshade-highlight-color': isBlackTheme ? '#fde68a' : '#fffbeb',
            'hillshade-shadow-color': isBlackTheme ? '#020617' : '#334155',
            'hillshade-accent-color': isBlackTheme ? '#78350f' : '#92400e'
        }
    };

    for (const layer of style.layers || []) {
        const nextLayer = { ...layer, paint: { ...(layer.paint || {}) }, layout: { ...(layer.layout || {}) } };

        if (nextLayer.id === 'background') {
            if (is3DMode) {
                nextLayer.paint['background-color'] = isBlackTheme ? '#09090b' : '#0f172a';
                transformedLayers.push(nextLayer);
                transformedLayers.push({
                    id: 'satellite-imagery',
                    type: 'raster',
                    source: 'satellite-imagery',
                    paint: isBlackTheme
                        ? {
                              'raster-opacity': 0.88,
                              'raster-brightness-max': 0.56,
                              'raster-contrast': 0.24,
                              'raster-saturation': -0.1
                          }
                        : {
                              'raster-opacity': 0.96,
                              'raster-contrast': 0.14,
                              'raster-saturation': 0.14
                          }
                });
                transformedLayers.push({
                    id: 'terrain-hillshade',
                    type: 'hillshade',
                    source: 'hillshade-dem',
                    paint: {
                        'hillshade-method': 'multidirectional',
                        'hillshade-exaggeration': isBlackTheme ? 0.72 : 0.9,
                        'hillshade-illumination-direction': 315,
                        'hillshade-highlight-color': isBlackTheme ? '#fde68a' : '#fffbeb',
                        'hillshade-shadow-color': isBlackTheme ? '#020617' : '#0f172a',
                        'hillshade-accent-color': isBlackTheme ? '#78350f' : '#334155'
                    }
                });
                reliefInserted = true;
            } else {
                nextLayer.paint['background-color'] = isBlackTheme ? '#18181b' : '#f4e8cd';
                transformedLayers.push(nextLayer);
            }
            continue;
        }

        if (is3DMode) {
            // Skip opaque flat fills that would hide the 3D satellite/mountain terrain
            if (
                nextLayer.id === 'natural_earth' ||
                nextLayer.id === 'park' ||
                nextLayer.id === 'park_outline' ||
                nextLayer.id.startsWith('landuse_') ||
                nextLayer.id.startsWith('landcover_') ||
                nextLayer.id === 'building'
            ) {
                continue;
            }
        } else {
            // Vivid 2D terrain & landcover colors
            if (nextLayer.id === 'natural_earth') {
                nextLayer.paint['raster-opacity'] = isBlackTheme
                    ? ['interpolate', ['exponential', 1.4], ['zoom'], 0, 0.38, 6, 0.16]
                    : ['interpolate', ['exponential', 1.4], ['zoom'], 0, 0.9, 6, 0.45];
                nextLayer.paint['raster-saturation'] = isBlackTheme ? -0.15 : 0.55;
                nextLayer.paint['raster-contrast'] = 0.35;
                if (isBlackTheme) {
                    nextLayer.paint['raster-brightness-max'] = 0.48;
                }
            } else if (nextLayer.id === 'landcover_wood') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#14532d' : '#22c55e';
                nextLayer.paint['fill-opacity'] = isBlackTheme ? 0.6 : 0.52;
            } else if (nextLayer.id === 'landcover_grass') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#166534' : '#86efac';
                nextLayer.paint['fill-opacity'] = isBlackTheme ? 0.5 : 0.62;
            } else if (nextLayer.id === 'park') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#15803d' : '#4ade80';
                nextLayer.paint['fill-opacity'] = isBlackTheme ? 0.48 : 0.55;
            } else if (nextLayer.id === 'park_outline') {
                nextLayer.paint['line-color'] = isBlackTheme ? '#22c55e' : '#16a34a';
            } else if (nextLayer.id === 'landcover_sand') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#451a03' : '#fcd34d';
                nextLayer.paint['fill-opacity'] = isBlackTheme ? 0.48 : 0.5;
            } else if (nextLayer.id === 'landcover_wetland') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#115e59' : '#2dd4bf';
                nextLayer.paint['fill-opacity'] = 0.48;
            } else if (nextLayer.id === 'landcover_ice') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#1e293b' : '#f0f9ff';
            } else if (nextLayer.id === 'landuse_residential') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#27272a' : '#e7e5e4';
                nextLayer.paint['fill-opacity'] = 0.72;
            } else if (nextLayer.id === 'building') {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#3f3f46' : '#cbd5e1';
                nextLayer.paint['fill-outline-color'] = isBlackTheme ? '#52525b' : '#94a3b8';
            }
        }

        if (nextLayer.id === 'water') {
            if (!is3DMode && !hillshadeInsertedFor2D) {
                // Place hillshade right under water so mountain ranges get relief shading while seas stay pure blue
                transformedLayers.push(hillshade2DLayer);
                hillshadeInsertedFor2D = true;
            }

            if (is3DMode) {
                nextLayer.paint['fill-color'] = isBlackTheme ? '#082f49' : '#0284c7';
                nextLayer.paint['fill-opacity'] = isBlackTheme ? 0.34 : 0.16;
            } else {
                nextLayer.paint['fill-color'] = isBlackTheme
                    ? '#0c4a6e'
                    : ['interpolate', ['linear'], ['zoom'], 2, '#1d8cf8', 8, '#2899ff', 14, '#38a3ff'];
                nextLayer.paint['fill-opacity'] = 1;
            }
            transformedLayers.push(nextLayer);
            transformedLayers.push({
                id: 'water-shelf-glow',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'water',
                filter: ['!=', ['get', 'brunnel'], 'tunnel'],
                paint: {
                    'line-color': isBlackTheme ? '#0ea5e9' : '#7dd3fc',
                    'line-width': ['interpolate', ['linear'], ['zoom'], 2, 2.5, 8, 5.5, 13, 8],
                    'line-blur': ['interpolate', ['linear'], ['zoom'], 2, 2, 8, 3.5, 13, 5],
                    'line-opacity': is3DMode ? (isBlackTheme ? 0.45 : 0.4) : (isBlackTheme ? 0.55 : 0.5)
                }
            });
            transformedLayers.push({
                id: 'water-coast-rim',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'water',
                filter: ['!=', ['get', 'brunnel'], 'tunnel'],
                paint: {
                    'line-color': isBlackTheme ? '#38bdf8' : (is3DMode ? '#e0f2fe' : '#0369a1'),
                    'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.9, 8, 1.4, 13, 2],
                    'line-opacity': is3DMode ? (isBlackTheme ? 0.6 : 0.78) : (isBlackTheme ? 0.75 : 0.68)
                }
            });
            continue;
        }

        if (nextLayer.id === 'waterway_river' || nextLayer.id === 'waterway_other') {
            nextLayer.paint['line-color'] = isBlackTheme ? '#0ea5e9' : (is3DMode ? '#38bdf8' : '#0284c7');
            nextLayer.paint['line-opacity'] = is3DMode ? 0.65 : 0.92;
        }

        if (nextLayer.id.startsWith('boundary_')) {
            nextLayer.paint['line-color'] = isBlackTheme
                ? 'rgba(253, 230, 138, 0.58)'
                : is3DMode
                ? 'rgba(255, 255, 255, 0.58)'
                : 'rgba(51, 65, 85, 0.72)';
        }

        if (
            is3DMode &&
            (nextLayer.id.startsWith('road_') || nextLayer.id.startsWith('bridge_') || nextLayer.id.startsWith('tunnel_')) &&
            nextLayer.type === 'line'
        ) {
            nextLayer.minzoom = Math.max(nextLayer.minzoom || 0, 10);
            nextLayer.paint['line-opacity'] = 0.55;
        }

        if (nextLayer.id === 'building-3d') {
            nextLayer.minzoom = 12;
            nextLayer.layout.visibility = is3DMode ? 'visible' : 'none';
            nextLayer.paint = {
                'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                'fill-extrusion-height': [
                    'case',
                    ['>', ['coalesce', ['get', 'render_height'], 0], 0],
                    ['get', 'render_height'],
                    14
                ],
                'fill-extrusion-color': isBlackTheme
                    ? [
                          'interpolate',
                          ['linear'],
                          ['coalesce', ['get', 'render_height'], 14],
                          0,
                          '#27272a',
                          25,
                          '#3f3f46',
                          70,
                          '#52525b',
                          160,
                          '#71717a'
                      ]
                    : [
                          'interpolate',
                          ['linear'],
                          ['coalesce', ['get', 'render_height'], 14],
                          0,
                          '#e2e8f0',
                          25,
                          '#f8fafc',
                          70,
                          '#cbd5e1',
                          160,
                          '#94a3b8'
                      ],
                'fill-extrusion-opacity': 0.92
            };
        }

        if (
            nextLayer.type === 'symbol' &&
            nextLayer.layout['text-field'] &&
            !nextLayer.id.includes('shield') &&
            !nextLayer.id.includes('arrow')
        ) {
            nextLayer.layout['text-field'] = localizedLabelExpression;
            const isWaterLabel = nextLayer.id.includes('water');
            if (is3DMode || isBlackTheme) {
                nextLayer.paint['text-color'] = isWaterLabel ? '#bae6fd' : '#ffffff';
                nextLayer.paint['text-halo-color'] = isWaterLabel ? 'rgba(8, 47, 73, 0.92)' : 'rgba(15, 23, 42, 0.92)';
                nextLayer.paint['text-halo-width'] = 1.8;
                nextLayer.paint['text-halo-blur'] = 0.8;
            } else {
                nextLayer.paint['text-color'] = isWaterLabel ? '#075985' : '#0f172a';
                nextLayer.paint['text-halo-color'] = isWaterLabel ? 'rgba(224, 242, 254, 0.95)' : 'rgba(255, 255, 255, 0.95)';
                nextLayer.paint['text-halo-width'] = 2;
                nextLayer.paint['text-halo-blur'] = 0.5;
            }
        }

        transformedLayers.push(nextLayer);
    }

    if (is3DMode && !reliefInserted) {
        transformedLayers.unshift(
            {
                id: 'satellite-imagery',
                type: 'raster',
                source: 'satellite-imagery',
                paint: { 'raster-opacity': 0.95 }
            },
            {
                id: 'terrain-hillshade',
                type: 'hillshade',
                source: 'hillshade-dem',
                paint: { 'hillshade-method': 'multidirectional', 'hillshade-exaggeration': 0.9 }
            }
        );
    } else if (!is3DMode && !hillshadeInsertedFor2D) {
        transformedLayers.unshift(hillshade2DLayer);
    }

    style.layers = transformedLayers;
    if (is3DMode) {
        style.terrain = { source: 'terrain-dem', exaggeration: 3.2 };
        style.sky = get3DSkyConfig(isBlackTheme);
    }

    return style;
};

const createKaabaMarkerElement = (label: string, isFocused = false): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'qibla-3d-divicon';
    el.innerHTML = `
        <div class="qibla-3d-marker-root ${isFocused ? 'is-focused' : ''}">
            <div class="qibla-3d-beacon-ring" style="color:${isFocused ? '#FBBF24' : '#F59E0B'};"></div>
            <div class="qibla-3d-marker-shadow"></div>
            <div class="qibla-3d-marker-stand">
                <div class="qibla-3d-marker-bob">
                    <div class="qibla-3d-marker-tag" style="background:linear-gradient(135deg,#18181b,#27272a);color:#FDE68A;border:1px solid ${isFocused ? 'rgba(251,191,36,0.9)' : 'rgba(251,191,36,0.45)'};">${label}</div>
                    <svg width="52" height="56" viewBox="0 0 64 68" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 8px 10px rgba(0,0,0,0.38));">
                        <defs>
                            <linearGradient id="kMapTop" x1="12" y1="8" x2="52" y2="28" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#475569"/>
                                <stop offset="55%" stop-color="#1E293B"/>
                                <stop offset="100%" stop-color="#0F172A"/>
                            </linearGradient>
                            <linearGradient id="kMapLeft" x1="10" y1="18" x2="32" y2="54" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#334155"/>
                                <stop offset="100%" stop-color="#0F172A"/>
                            </linearGradient>
                            <linearGradient id="kMapRight" x1="32" y1="22" x2="54" y2="54" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#1E293B"/>
                                <stop offset="100%" stop-color="#020617"/>
                            </linearGradient>
                            <linearGradient id="kMapGold" x1="10" y1="22" x2="54" y2="42" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#FEF08A"/>
                                <stop offset="45%" stop-color="#F59E0B"/>
                                <stop offset="100%" stop-color="#B45309"/>
                            </linearGradient>
                            <linearGradient id="kMapBase" x1="8" y1="48" x2="56" y2="62" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#F8FAFC"/>
                                <stop offset="100%" stop-color="#CBD5E1"/>
                            </linearGradient>
                        </defs>
                        <path d="M32 63L8 51L32 39L56 51L32 63Z" fill="url(#kMapBase)" stroke="#94A3B8" stroke-width="1"/>
                        <path d="M8 51L32 63V60L8 48V51Z" fill="#94A3B8"/>
                        <path d="M56 51L32 63V60L56 48V51Z" fill="#64748B"/>
                        <path d="M12 20L32 10L52 20L32 30L12 20Z" fill="url(#kMapTop)"/>
                        <path d="M12 20L32 30V56L12 46V20Z" fill="url(#kMapLeft)"/>
                        <path d="M52 20L32 30V56L52 46V20Z" fill="url(#kMapRight)"/>
                        <path d="M12 26.5L32 36.5L52 26.5V31.5L32 41.5L12 31.5V26.5Z" fill="url(#kMapGold)"/>
                        <path d="M18 28.5L26 32.5M40 32.5L47 29" stroke="#FEF9C3" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
                        <path d="M38.5 39.5L44.5 36.5V48.5L38.5 51.5V39.5Z" fill="url(#kMapGold)" stroke="#78350F" stroke-width="0.6"/>
                        <ellipse cx="32" cy="49" rx="1.6" ry="2.2" fill="#E2E8F0"/>
                        <ellipse cx="32" cy="49" rx="0.9" ry="1.4" fill="#0F172A"/>
                        <path d="M12 20L32 30L52 20" stroke="#FDE047" stroke-width="1.2" stroke-opacity="0.7" fill="none"/>
                    </svg>
                </div>
            </div>
        </div>
    `;
    return el;
};

const createUserLocationMarkerElement = (pinColor: string, label: string, isFocused = false): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'qibla-3d-divicon is-user-marker';
    el.innerHTML = `
        <div class="qibla-3d-marker-root ${isFocused ? 'is-focused' : ''}">
            <div class="qibla-3d-beacon-ring is-user" style="color:${pinColor};"></div>
            <div class="qibla-3d-marker-shadow is-user"></div>
            <div class="qibla-3d-exact-dot" style="background:${pinColor};"></div>
            <div class="qibla-3d-marker-stand">
                <div class="qibla-3d-marker-bob is-user">
                    <div class="qibla-3d-marker-tag" style="background:${pinColor};color:#FFFFFF;border:1px solid ${isFocused ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)'};">${label}</div>
                    <svg width="42" height="50" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 7px 10px rgba(0,0,0,0.34));">
                        <defs>
                            <radialGradient id="uPinBody" cx="35%" cy="28%" r="72%">
                                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.75"/>
                                <stop offset="28%" stop-color="${pinColor}"/>
                                <stop offset="100%" stop-color="#0F172A" stop-opacity="0.92"/>
                            </radialGradient>
                        </defs>
                        <path d="M24 4C13.507 4 5 12.507 5 23C5 36.2 21.4 51.2 23.15 52.75C23.63 53.18 24.37 53.18 24.85 52.75C26.6 51.2 43 36.2 43 23C43 12.507 34.493 4 24 4Z" fill="${pinColor}"/>
                        <path d="M24 4C13.507 4 5 12.507 5 23C5 36.2 21.4 51.2 23.15 52.75C23.63 53.18 24.37 53.18 24.85 52.75C26.6 51.2 43 36.2 43 23C43 12.507 34.493 4 24 4Z" fill="url(#uPinBody)" opacity="0.45"/>
                        <path d="M12.5 19.5C13.5 13 18.5 8.5 24 8.5" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity="0.72"/>
                        <circle cx="24" cy="22" r="9.5" fill="#FFFFFF" fill-opacity="0.95"/>
                        <circle cx="24" cy="22" r="5" fill="${pinColor}"/>
                        <circle cx="22.3" cy="20.3" r="1.7" fill="#FFFFFF" opacity="0.9"/>
                    </svg>
                </div>
            </div>
        </div>
    `;
    return el;
};

const buildAccuracyCircleGeoJson = (lat: number, lng: number, radiusMeters?: number | null) => {
    if (!radiusMeters || !isFinite(radiusMeters) || radiusMeters < 2 || radiusMeters > 2500) {
        return {
            type: 'FeatureCollection' as const,
            features: [] as any[]
        };
    }
    const steps = 48;
    const earthRadius = 6378137;
    const latRad = (lat * Math.PI) / 180;
    const dLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const dLng = (radiusMeters / (earthRadius * Math.cos(latRad))) * (180 / Math.PI);
    const ring: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
        const theta = (i / steps) * 2 * Math.PI;
        ring.push([lng + dLng * Math.cos(theta), lat + dLat * Math.sin(theta)]);
    }
    return {
        type: 'FeatureCollection' as const,
        features: [
            {
                type: 'Feature' as const,
                properties: {},
                geometry: {
                    type: 'Polygon' as const,
                    coordinates: [ring]
                }
            }
        ]
    };
};

const getQiblaModeStyles = (theme: any) => {
    const isBlackTheme =
        theme?.bgColor === '#000000' ||
        theme?.name === 'أبيض وأسود' ||
        theme?.name === 'اسود' ||
        theme?.name === 'black';
    const primaryColor = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || theme?.accent || '#2E7D5E');
    const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
    const surfaceCardClass = isBlackTheme
        ? 'bg-[#18181b] text-white'
        : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white';
    const softRowClass = isBlackTheme
        ? 'bg-white/5 text-white'
        : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white';

    return {
        isBlackTheme,
        primaryColor,
        btnTextColor,
        surfaceCardClass,
        softRowClass
    };
};

const buildQiblaArcPoints2D = (lat1: number, lng1: number, lat2: number, lng2: number, steps = 36): [number, number][] => {
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const dist = Math.hypot(dLat, dLng);
    if (dist < 0.005) {
        return [[lat1, lng1], [lat2, lng2]];
    }
    const midLat = (lat1 + lat2) / 2;
    const midLng = (lng1 + lng2) / 2;
    const arcLift = Math.min(Math.max(dist * 0.14, 0.08), 8);
    const ctrlLat = midLat + arcLift;
    const ctrlLng = midLng - (dLat / dist) * (arcLift * 0.35);

    const points: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const oneMinusT = 1 - t;
        const pLat = oneMinusT * oneMinusT * lat1 + 2 * oneMinusT * t * ctrlLat + t * t * lat2;
        const pLng = oneMinusT * oneMinusT * lng1 + 2 * oneMinusT * t * ctrlLng + t * t * lng2;
        points.push([pLat, pLng]);
    }
    return points;
};

interface VisualQibla2DControllerProps {
    lat: number;
    lng: number;
    fitTrigger: number;
    mapInstanceRef: React.MutableRefObject<L.Map | null>;
    onZoomChange: (zoom: number) => void;
}

const VisualQibla2DController = ({
    lat,
    lng,
    fitTrigger,
    mapInstanceRef,
    onZoomChange
}: VisualQibla2DControllerProps) => {
    const map = useMap();

    useEffect(() => {
        mapInstanceRef.current = map;
        onZoomChange(map.getZoom());

        const handleZoomEnd = () => {
            onZoomChange(map.getZoom());
        };

        map.on('zoomend', handleZoomEnd);
        return () => {
            map.off('zoomend', handleZoomEnd);
            if (mapInstanceRef.current === map) {
                mapInstanceRef.current = null;
            }
        };
    }, [map, mapInstanceRef, onZoomChange]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            map.invalidateSize();
            const bounds = L.latLngBounds([
                [lat, lng],
                [KAABA_LAT, KAABA_LNG]
            ]);
            map.fitBounds(bounds, {
                padding: [62, 62],
                maxZoom: 14,
                animate: fitTrigger > 0,
                duration: 0.75
            });
        }, 100);

        return () => window.clearTimeout(timer);
    }, [map, lat, lng, fitTrigger]);

    return null;
};

const createKaabaLeafletIcon = (label: string, isFocused = false) =>
    L.divIcon({
        className: 'qibla-3d-divicon',
        iconSize: [78, 92],
        iconAnchor: [39, 80],
        html: createKaabaMarkerElement(label, isFocused).innerHTML
    });

const createUserLocationLeafletIcon = (pinColor: string, label: string, isFocused = false) =>
    L.divIcon({
        className: 'qibla-3d-divicon is-user-marker',
        iconSize: [70, 86],
        iconAnchor: [35, 86],
        html: createUserLocationMarkerElement(pinColor, label, isFocused).innerHTML
    });

export const VisualQibla = ({
    lat,
    lng,
    gpsAccuracy,
    theme
}: {
    lat: number;
    lng: number;
    gpsAccuracy?: number | null;
    theme: any;
    cardBorderColor?: string;
}) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [is3DMode, setIs3DMode] = useState(false);
    const [fitTrigger2D, setFitTrigger2D] = useState(0);
    const [focusedTarget, setFocusedTarget] = useState<'user' | 'kaaba' | null>(null);
    const [currentZoom, setCurrentZoom] = useState(4);
    const [isMapReady, setIsMapReady] = useState(false);
    const [webglError, setWebglError] = useState(false);

    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const map3DInstanceRef = useRef<MapLibreMap | null>(null);
    const map2DInstanceRef = useRef<L.Map | null>(null);
    const kaabaMarkerRef = useRef<MapLibreMarker | null>(null);
    const userMarkerRef = useRef<MapLibreMarker | null>(null);
    const focusedTargetRef = useRef<'user' | 'kaaba' | null>(null);
    const previous3DViewRef = useRef<{ center: [number, number]; zoom: number; pitch: number; bearing: number } | null>(null);
    const previous2DViewRef = useRef<{ center: [number, number]; zoom: number } | null>(null);
    const is3DModeRef = useRef(is3DMode);
    is3DModeRef.current = is3DMode;
    const latestCoordsRef = useRef<{
        lat: number;
        lng: number;
        gpsAccuracy?: number | null;
        geodesicPoints: [number, number][];
    }>({ lat, lng, gpsAccuracy, geodesicPoints: [] });
    const rotateHoldTimerRef = useRef<number | null>(null);
    const rotateRafRef = useRef<number | null>(null);
    const didHoldRotateRef = useRef(false);

    const { isBlackTheme, primaryColor, btnTextColor, surfaceCardClass } = getQiblaModeStyles(theme);

    const mapAccentColor = isBlackTheme ? '#D97706' : primaryColor;
    const distanceKm = useMemo(() => Math.round(calcDistanceKm(lat, lng, KAABA_LAT, KAABA_LNG)), [lat, lng]);
    const geodesicPoints = useMemo(() => buildGeodesicQiblaPoints(lat, lng, KAABA_LAT, KAABA_LNG), [lat, lng]);
    latestCoordsRef.current = { lat, lng, gpsAccuracy, geodesicPoints };
    const arcPoints2D = useMemo(() => buildQiblaArcPoints2D(lat, lng, KAABA_LAT, KAABA_LNG), [lat, lng]);

    const kaabaLeafletIcon = useMemo(
        () => createKaabaLeafletIcon(isEn ? 'Holy Kaaba' : 'الكعبة المشرفة', focusedTarget === 'kaaba'),
        [isEn, focusedTarget]
    );
    const userLeafletIcon = useMemo(
        () => createUserLocationLeafletIcon(mapAccentColor, isEn ? 'Your Location' : 'موقعك', focusedTarget === 'user'),
        [mapAccentColor, isEn, focusedTarget]
    );

    const fit3DRouteBounds = useCallback(
        (map: MapLibreMap, animate: boolean, use3DPerspective = is3DModeRef.current) => {
            const cur = latestCoordsRef.current;
            const bounds = new LngLatBounds([cur.lng, cur.lat], [cur.lng, cur.lat]);
            bounds.extend([KAABA_LNG, KAABA_LAT]);
            const cam = map.cameraForBounds(bounds, {
                padding: use3DPerspective
                    ? { top: 96, bottom: 96, left: 64, right: 64 }
                    : { top: 82, bottom: 82, left: 56, right: 56 },
                maxZoom: use3DPerspective ? 13 : 14
            });
            const fallbackCenter: [number, number] = [(cur.lng + KAABA_LNG) / 2, (cur.lat + KAABA_LAT) / 2];
            const targetCenter = cam?.center ?? fallbackCenter;
            const targetZoom = Math.max(2, (cam?.zoom ?? 4.2) - (use3DPerspective ? 0.55 : 0.35));

            const cameraOptions = {
                center: targetCenter,
                zoom: targetZoom,
                pitch: use3DPerspective ? 46 : 0,
                bearing: use3DPerspective ? -6 : 0
            };

            if (animate) {
                map.easeTo({ ...cameraOptions, duration: 850 });
            } else {
                map.jumpTo(cameraOptions);
            }
        },
        []
    );
    const fit3DRouteBoundsRef = useRef(fit3DRouteBounds);
    fit3DRouteBoundsRef.current = fit3DRouteBounds;

    const handleMarkerFocusToggle = useCallback(
        (target: 'user' | 'kaaba') => {
            const map = map3DInstanceRef.current;
            if (!map) {
                const map2D = map2DInstanceRef.current;
                if (!map2D) return;
                const currentFocus = focusedTargetRef.current;
                if (currentFocus === target) {
                    const prev = previous2DViewRef.current;
                    focusedTargetRef.current = null;
                    setFocusedTarget(null);
                    previous2DViewRef.current = null;
                    if (prev) {
                        map2D.flyTo(prev.center, prev.zoom, { animate: true, duration: 0.9 });
                    } else {
                        const bounds = L.latLngBounds([[lat, lng], [KAABA_LAT, KAABA_LNG]]);
                        map2D.flyToBounds(bounds, { padding: [62, 62], maxZoom: 14, animate: true, duration: 0.9 });
                    }
                    return;
                }
                if (currentFocus === null) {
                    const c = map2D.getCenter();
                    previous2DViewRef.current = { center: [c.lat, c.lng], zoom: map2D.getZoom() };
                }
                focusedTargetRef.current = target;
                setFocusedTarget(target);
                map2D.flyTo(target === 'kaaba' ? [KAABA_LAT, KAABA_LNG] : [lat, lng], 17, { animate: true, duration: 1.1 });
                return;
            }

            const use3D = is3DModeRef.current;
            const currentFocus = focusedTargetRef.current;

            if (currentFocus === target) {
                const prev = previous3DViewRef.current;
                focusedTargetRef.current = null;
                setFocusedTarget(null);
                previous3DViewRef.current = null;

                if (prev) {
                    map.flyTo({
                        center: prev.center,
                        zoom: prev.zoom,
                        pitch: use3D ? Math.max(prev.pitch, 45) : 0,
                        bearing: use3D ? prev.bearing : 0,
                        duration: 950
                    });
                } else {
                    fit3DRouteBounds(map, true, use3D);
                }
                return;
            }

            if (currentFocus === null) {
                const center = map.getCenter();
                previous3DViewRef.current = {
                    center: [center.lng, center.lat],
                    zoom: map.getZoom(),
                    pitch: map.getPitch(),
                    bearing: map.getBearing()
                };
            }

            focusedTargetRef.current = target;
            setFocusedTarget(target);

            const targetCoords: [number, number] =
                target === 'kaaba' ? [KAABA_LNG, KAABA_LAT] : [lng, lat];

            map.flyTo({
                center: targetCoords,
                zoom: target === 'user' ? 17.8 : 16.4,
                pitch: use3D ? 62 : 0,
                bearing: use3D ? 22 : 0,
                duration: 1250
            });
        },
        [fit3DRouteBounds, lat, lng]
    );

    const handleMarkerFocusToggleRef = useRef(handleMarkerFocusToggle);
    handleMarkerFocusToggleRef.current = handleMarkerFocusToggle;

    const user2DHandlers = useMemo(
        () => ({
            click: (e: L.LeafletMouseEvent) => {
                L.DomEvent.stopPropagation(e);
                handleMarkerFocusToggleRef.current('user');
            }
        }),
        []
    );

    const kaaba2DHandlers = useMemo(
        () => ({
            click: (e: L.LeafletMouseEvent) => {
                L.DomEvent.stopPropagation(e);
                handleMarkerFocusToggleRef.current('kaaba');
            }
        }),
        []
    );

    const handleToggle3DMode = useCallback(() => {
        focusedTargetRef.current = null;
        setFocusedTarget(null);
        previous3DViewRef.current = null;
        previous2DViewRef.current = null;
        setWebglError(false);
        setIs3DMode((prev) => !prev);
    }, []);

    const handleCenterRoute = useCallback(() => {
        focusedTargetRef.current = null;
        setFocusedTarget(null);
        previous3DViewRef.current = null;
        previous2DViewRef.current = null;
        const map = map3DInstanceRef.current;
        if (map) {
            fit3DRouteBounds(map, true, is3DModeRef.current);
            return;
        }
        setFitTrigger2D((c) => c + 1);
    }, [fit3DRouteBounds]);

    const handleZoomIn = useCallback(() => {
        if (map3DInstanceRef.current) {
            map3DInstanceRef.current.zoomIn({ duration: 300 });
        } else {
            map2DInstanceRef.current?.zoomIn();
        }
    }, []);

    const handleZoomOut = useCallback(() => {
        if (map3DInstanceRef.current) {
            map3DInstanceRef.current.zoomOut({ duration: 300 });
        } else {
            map2DInstanceRef.current?.zoomOut();
        }
    }, []);

    const stopContinuousCameraMotion = useCallback(() => {
        if (rotateHoldTimerRef.current !== null) {
            window.clearTimeout(rotateHoldTimerRef.current);
            rotateHoldTimerRef.current = null;
        }
        if (rotateRafRef.current !== null) {
            window.cancelAnimationFrame(rotateRafRef.current);
            rotateRafRef.current = null;
        }
    }, []);

    const startContinuousCameraMotion = useCallback(
        (axis: 'bearing' | 'pitch', direction: -1 | 1) => {
            stopContinuousCameraMotion();
            didHoldRotateRef.current = false;

            rotateHoldTimerRef.current = window.setTimeout(() => {
                didHoldRotateRef.current = true;
                let lastTime = performance.now();

                const step = (now: number) => {
                    const map = map3DInstanceRef.current;
                    if (!map || !is3DModeRef.current) {
                        stopContinuousCameraMotion();
                        return;
                    }
                    const dt = Math.min((now - lastTime) / 1000, 0.05);
                    lastTime = now;
                    if (axis === 'bearing') {
                        map.setBearing(map.getBearing() + direction * 75 * dt);
                    } else {
                        const nextPitch = Math.min(75, Math.max(15, map.getPitch() + direction * 45 * dt));
                        map.setPitch(nextPitch);
                    }
                    rotateRafRef.current = window.requestAnimationFrame(step);
                };

                rotateRafRef.current = window.requestAnimationFrame(step);
            }, 220);
        },
        [stopContinuousCameraMotion]
    );

    const handleStepCamera3D = useCallback((axis: 'bearing' | 'pitch', direction: -1 | 1) => {
        if (didHoldRotateRef.current) {
            didHoldRotateRef.current = false;
            return;
        }
        const map = map3DInstanceRef.current;
        if (map && is3DModeRef.current) {
            if (axis === 'bearing') {
                map.easeTo({
                    bearing: map.getBearing() + direction * 35,
                    duration: 320
                });
            } else {
                map.easeTo({
                    pitch: Math.min(75, Math.max(15, map.getPitch() + direction * 15)),
                    duration: 320
                });
            }
        }
    }, []);

    useEffect(() => stopContinuousCameraMotion, [stopContinuousCameraMotion]);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (!isOnline || webglError || !mapContainerRef.current) return;

        let cancelled = false;
        let dashAnimId: number | null = null;
        let readyFallbackTimer: number | null = null;
        let routeLayersAttached = false;
        let map: MapLibreMap | null = null;

        ensureMapLibreWorkerAndRTL();
        setIsMapReady(false);
        setWebglError(false);

        const attachQiblaRouteAndReady = (targetMap: MapLibreMap) => {
            if (cancelled || routeLayersAttached) return;
            routeLayersAttached = true;

            try {
                const live = latestCoordsRef.current;

                if (!targetMap.getSource('user-accuracy-circle')) {
                    targetMap.addSource('user-accuracy-circle', {
                        type: 'geojson',
                        data: buildAccuracyCircleGeoJson(live.lat, live.lng, live.gpsAccuracy)
                    });
                }

                if (!targetMap.getSource('qibla-route')) {
                    const routeGeoJson = {
                        type: 'FeatureCollection' as const,
                        features: [
                            {
                                type: 'Feature' as const,
                                properties: {},
                                geometry: {
                                    type: 'LineString' as const,
                                    coordinates: live.geodesicPoints
                                }
                            }
                        ]
                    };

                    targetMap.addSource('qibla-route', {
                        type: 'geojson',
                        data: routeGeoJson
                    });
                }

                const firstLabelLayerId = targetMap
                    .getStyle()
                    ?.layers?.find((l) => l.type === 'symbol' && l.id.startsWith('label_'))?.id;

                if (!targetMap.getLayer('user-accuracy-fill')) {
                    targetMap.addLayer(
                        {
                            id: 'user-accuracy-fill',
                            type: 'fill',
                            source: 'user-accuracy-circle',
                            paint: {
                                'fill-color': mapAccentColor,
                                'fill-opacity': 0.14
                            }
                        },
                        firstLabelLayerId
                    );
                }

                if (!targetMap.getLayer('user-accuracy-stroke')) {
                    targetMap.addLayer(
                        {
                            id: 'user-accuracy-stroke',
                            type: 'line',
                            source: 'user-accuracy-circle',
                            paint: {
                                'line-color': mapAccentColor,
                                'line-width': 1.6,
                                'line-opacity': 0.55
                            }
                        },
                        firstLabelLayerId
                    );
                }

                if (!targetMap.getLayer('qibla-route-shadow')) {
                    targetMap.addLayer(
                        {
                            id: 'qibla-route-shadow',
                            type: 'line',
                            source: 'qibla-route',
                            layout: { 'line-cap': 'round', 'line-join': 'round' },
                            paint: {
                                'line-color': '#0f172a',
                                'line-width': 9,
                                'line-blur': 4,
                                'line-opacity': isBlackTheme ? 0.55 : 0.28,
                                'line-translate': [0, 4]
                            }
                        },
                        firstLabelLayerId
                    );
                }

                if (!targetMap.getLayer('qibla-route-glow')) {
                    targetMap.addLayer(
                        {
                            id: 'qibla-route-glow',
                            type: 'line',
                            source: 'qibla-route',
                            layout: { 'line-cap': 'round', 'line-join': 'round' },
                            paint: {
                                'line-color': mapAccentColor,
                                'line-width': 8,
                                'line-blur': 3,
                                'line-opacity': 0.5
                            }
                        },
                        firstLabelLayerId
                    );
                }

                if (!targetMap.getLayer('qibla-route-core')) {
                    targetMap.addLayer(
                        {
                            id: 'qibla-route-core',
                            type: 'line',
                            source: 'qibla-route',
                            layout: { 'line-cap': 'round', 'line-join': 'round' },
                            paint: {
                                'line-color': mapAccentColor,
                                'line-width': 4,
                                'line-opacity': 0.98
                            }
                        },
                        firstLabelLayerId
                    );
                }

                if (!targetMap.getLayer('qibla-route-dash')) {
                    targetMap.addLayer(
                        {
                            id: 'qibla-route-dash',
                            type: 'line',
                            source: 'qibla-route',
                            layout: { 'line-cap': 'round', 'line-join': 'round' },
                            paint: {
                                'line-color': '#ffffff',
                                'line-width': 2.2,
                                'line-opacity': 0.9,
                                'line-dasharray': [0, 4, 3]
                            }
                        },
                        firstLabelLayerId
                    );
                }

                const dashArraySequence = [
                    [0, 4, 3],
                    [0.5, 4, 2.5],
                    [1, 4, 2],
                    [1.5, 4, 1.5],
                    [2, 4, 1],
                    [2.5, 4, 0.5],
                    [3, 4, 0],
                    [0, 0.5, 3, 3.5],
                    [0, 1, 3, 3],
                    [0, 1.5, 3, 2.5],
                    [0, 2, 3, 2],
                    [0, 2.5, 3, 1.5],
                    [0, 3, 3, 1],
                    [0, 3.5, 3, 0.5]
                ];
                let dashStep = 0;
                let lastTick = 0;
                const animateDash = (ts: number) => {
                    if (cancelled) return;
                    if (ts - lastTick > 75) {
                        lastTick = ts;
                        dashStep = (dashStep + 1) % dashArraySequence.length;
                        if (targetMap.getLayer('qibla-route-dash')) {
                            targetMap.setPaintProperty('qibla-route-dash', 'line-dasharray', dashArraySequence[dashStep]);
                        }
                    }
                    dashAnimId = window.requestAnimationFrame(animateDash);
                };
                dashAnimId = window.requestAnimationFrame(animateDash);

                if (is3DMode) {
                    targetMap.setTerrain({ source: 'terrain-dem', exaggeration: 3.2 });
                    if (typeof targetMap.setSky === 'function') {
                        targetMap.setSky(get3DSkyConfig(isBlackTheme));
                    }
                }

                fit3DRouteBoundsRef.current(targetMap, false, is3DMode);
            } catch {
                // Keep map interactive even if an overlay layer update fails transiently
            } finally {
                if (readyFallbackTimer !== null) {
                    window.clearTimeout(readyFallbackTimer);
                    readyFallbackTimer = null;
                }
                setIsMapReady(true);
            }
        };

        const initMap = async () => {
            try {
                const style = await buildEnhanced3DMapStyle({
                    isBlackTheme,
                    is3DMode,
                    isEn
                });

                if (cancelled || !mapContainerRef.current) return;

                const initCoords = latestCoordsRef.current;
                const midLng = (initCoords.lng + KAABA_LNG) / 2;
                const midLat = (initCoords.lat + KAABA_LAT) / 2;

                map = new MapLibreMap({
                    container: mapContainerRef.current,
                    style,
                    center: [midLng, midLat],
                    zoom: 3.5,
                    minZoom: 2,
                    maxZoom: 19,
                    maxPitch: is3DMode ? 75 : 0,
                    pitch: is3DMode ? 46 : 0,
                    bearing: is3DMode ? -6 : 0,
                    dragRotate: is3DMode,
                    pitchWithRotate: is3DMode,
                    touchPitch: is3DMode,
                    attributionControl: { compact: true }
                });

                map3DInstanceRef.current = map;

                map.on('error', () => {
                    // Gracefully swallow transient tile/network warnings so the 3D scene stays responsive
                });

                const updateZoom = () => {
                    if (map) setCurrentZoom(Math.round(map.getZoom() * 10) / 10);
                };
                map.on('zoom', updateZoom);
                map.on('zoomend', updateZoom);

                map.once('style.load', () => {
                    if (map) attachQiblaRouteAndReady(map);
                });

                map.once('load', () => {
                    if (map) attachQiblaRouteAndReady(map);
                });

                readyFallbackTimer = window.setTimeout(() => {
                    if (!cancelled) {
                        if (map && map.isStyleLoaded()) {
                            attachQiblaRouteAndReady(map);
                        } else {
                            setIsMapReady(true);
                        }
                    }
                }, 2200);

                const userEl = createUserLocationMarkerElement(
                    mapAccentColor,
                    isEn ? 'Your Location' : 'موقعك',
                    focusedTargetRef.current === 'user'
                );
                userEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleMarkerFocusToggleRef.current('user');
                });
                const initUserCoords = latestCoordsRef.current;
                userMarkerRef.current = new MapLibreMarker({
                    element: userEl,
                    anchor: 'bottom',
                    pitchAlignment: 'viewport',
                    rotationAlignment: 'viewport'
                })
                    .setLngLat([initUserCoords.lng, initUserCoords.lat])
                    .addTo(map);

                const kaabaEl = createKaabaMarkerElement(
                    isEn ? 'Holy Kaaba' : 'الكعبة المشرفة',
                    focusedTargetRef.current === 'kaaba'
                );
                kaabaEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    handleMarkerFocusToggleRef.current('kaaba');
                });
                kaabaMarkerRef.current = new MapLibreMarker({
                    element: kaabaEl,
                    anchor: 'bottom',
                    pitchAlignment: 'viewport',
                    rotationAlignment: 'viewport'
                })
                    .setLngLat([KAABA_LNG, KAABA_LAT])
                    .addTo(map);
            } catch {
                if (!cancelled) {
                    setWebglError(true);
                }
            }
        };

        initMap();

        return () => {
            cancelled = true;
            if (readyFallbackTimer !== null) {
                window.clearTimeout(readyFallbackTimer);
            }
            if (dashAnimId !== null) {
                window.cancelAnimationFrame(dashAnimId);
            }
            userMarkerRef.current?.remove();
            userMarkerRef.current = null;
            kaabaMarkerRef.current?.remove();
            kaabaMarkerRef.current = null;
            if (map) {
                map.remove();
            }
            if (map3DInstanceRef.current === map) {
                map3DInstanceRef.current = null;
            }
        };
    }, [isOnline, is3DMode, webglError, isBlackTheme, isEn, mapAccentColor]);

    // Smoothly update user pin, Qibla beam, and GPS accuracy halo when live phone GPS refines
    useEffect(() => {
        const map = map3DInstanceRef.current;
        if (!map) return;

        userMarkerRef.current?.setLngLat([lng, lat]);

        const routeSource = map.getSource('qibla-route') as any;
        if (routeSource && typeof routeSource.setData === 'function') {
            routeSource.setData({
                type: 'FeatureCollection',
                features: [
                    {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: geodesicPoints
                        }
                    }
                ]
            });
        }

        const accSource = map.getSource('user-accuracy-circle') as any;
        if (accSource && typeof accSource.setData === 'function') {
            accSource.setData(buildAccuracyCircleGeoJson(lat, lng, gpsAccuracy));
        }

        if (focusedTargetRef.current === 'user') {
            map.easeTo({ center: [lng, lat], duration: 450 });
        }
    }, [lat, lng, gpsAccuracy, geodesicPoints, isMapReady]);

    // Reflect focused marker visual highlight on existing 3D markers
    useEffect(() => {
        const kaabaRoot = kaabaMarkerRef.current?.getElement().querySelector('.qibla-3d-marker-root');
        const userRoot = userMarkerRef.current?.getElement().querySelector('.qibla-3d-marker-root');
        if (kaabaRoot) {
            kaabaRoot.classList.toggle('is-focused', focusedTarget === 'kaaba');
        }
        if (userRoot) {
            userRoot.classList.toggle('is-focused', focusedTarget === 'user');
        }
    }, [focusedTarget]);

    if (!isOnline) {
        return (
            <div className={`app-page-card border-0 w-full h-full rounded-3xl flex flex-col items-center justify-center p-6 text-center ${surfaceCardClass}`}>
                <div className={`app-inner-3d-box border-0 w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                    <i className="fa-solid fa-wifi text-4xl opacity-70" style={{ color: primaryColor }}></i>
                </div>
                <h3 className="text-xl font-black mb-2">
                    {isEn ? 'No Internet Connection' : 'لا يوجد اتصال بالإنترنت'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {isEn 
                        ? 'The interactive map requires an active internet connection to load map layers. Please check your network and try again.' 
                        : 'الخريطة تتطلب اتصالاً بالإنترنت لتحميل الطبقات والتضاريس. يرجى التحقق من اتصالك والمحاولة مرة أخرى.'}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col pt-1 pb-4">
            <div className="flex-1 min-h-0 w-full relative">
                <div className="qibla-3d-map-stage w-full h-full relative">
                    {/* Soft Floor Cast Shadow beneath the sculpted 3D map */}
                    <div
                        className={`qibla-3d-floor-shadow pointer-events-none ${is3DMode ? 'opacity-100' : 'opacity-0'}`}
                    />

                    {/* Sculpted Map Frame */}
                    <div
                        className={`qibla-3d-map-board relative w-full h-full z-0 ${
                            is3DMode ? 'qibla-3d-active' : ''
                        } ${isBlackTheme ? 'qibla-3d-map-dark' : ''}`}
                    >
                        {/* Clipped Map Viewport */}
                        <div
                            className="qibla-3d-map-viewport relative w-full h-full rounded-[28px] overflow-hidden"
                            style={{
                                backgroundColor: isBlackTheme ? '#09090b' : (is3DMode ? '#0f172a' : '#2899ff')
                            }}
                        >
                            {!webglError ? (
                                <>
                                    <div
                                        ref={mapContainerRef}
                                        className="w-full h-full"
                                        dir="ltr"
                                    />

                                    {!isMapReady && (
                                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-slate-900/15 backdrop-blur-[1px]">
                                            <div
                                                className={`app-page-card border-0 px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 ${surfaceCardClass}`}
                                            >
                                                <i className="fa-solid fa-spinner fa-spin" style={{ color: mapAccentColor }}></i>
                                                <span>
                                                    {is3DMode
                                                        ? isEn
                                                            ? 'Loading 3D terrain...'
                                                            : 'جاري تحميل التضاريس ثلاثية الأبعاد...'
                                                        : isEn
                                                        ? 'Loading HD map...'
                                                        : 'جاري تحميل الخريطة عالية الدقة...'}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <MapContainer
                                    center={[lat, lng]}
                                    zoom={4}
                                    minZoom={2}
                                    maxZoom={19}
                                    zoomControl={false}
                                    style={{ height: '100%', width: '100%', background: 'transparent' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        maxZoom={19}
                                    />
                                    <VisualQibla2DController
                                        lat={lat}
                                        lng={lng}
                                        fitTrigger={fitTrigger2D}
                                        mapInstanceRef={map2DInstanceRef}
                                        onZoomChange={setCurrentZoom}
                                    />
                                    <Polyline
                                        positions={arcPoints2D}
                                        pathOptions={{
                                            color: '#0f172a',
                                            weight: 6,
                                            opacity: 0.14,
                                            lineCap: 'round'
                                        }}
                                    />
                                    <Polyline
                                        positions={arcPoints2D}
                                        pathOptions={{
                                            color: mapAccentColor,
                                            weight: 5,
                                            opacity: 0.28,
                                            lineCap: 'round'
                                        }}
                                    />
                                    <Polyline
                                        positions={arcPoints2D}
                                        pathOptions={{
                                            color: mapAccentColor,
                                            weight: 3.2,
                                            opacity: 0.96,
                                            dashArray: '10 10',
                                            lineCap: 'round',
                                            className: 'qibla-3d-arc-flow'
                                        }}
                                    />
                                    <LeafletMarker
                                        position={[lat, lng]}
                                        icon={userLeafletIcon}
                                        eventHandlers={user2DHandlers}
                                    />
                                    <LeafletMarker
                                        position={[KAABA_LAT, KAABA_LNG]}
                                        icon={kaabaLeafletIcon}
                                        eventHandlers={kaaba2DHandlers}
                                    />
                                </MapContainer>
                            )}

                            {/* Subtle 3D Viewport Rim Sheen */}
                            {is3DMode && (
                                <div
                                    className="pointer-events-none absolute inset-0 z-[5]"
                                    style={{
                                        boxShadow: isBlackTheme
                                            ? 'inset 0 8px 18px rgba(0,0,0,0.6), inset 0 -6px 14px rgba(255,255,255,0.06)'
                                            : 'inset 0 8px 18px rgba(15,23,42,0.12), inset 0 -6px 14px rgba(255,255,255,0.3)'
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* إطار علوي تفاعلي يعرض المسافة وأزرار التحكم */}
                <div className="pointer-events-none absolute top-3 inset-x-3 z-20 flex items-center justify-between gap-2">
                    <div
                        className={`pointer-events-auto app-page-card border-0 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-black backdrop-blur-md ${surfaceCardClass}`}
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.88)' : 'rgba(255,255,255,0.9)'
                        }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full animate-pulse shrink-0"
                            style={{ backgroundColor: mapAccentColor }}
                        ></span>
                        <span className="tabular-nums">
                            {distanceKm.toLocaleString(isEn ? 'en-US' : 'ar-EG')}{' '}
                            {isEn ? 'km to Kaaba' : 'كم إلى الكعبة'}
                        </span>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={handleToggle3DMode}
                            className={`app-page-card border-0 px-3 py-1.5 rounded-2xl text-xs font-black transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${surfaceCardClass}`}
                            style={
                                is3DMode
                                    ? { backgroundColor: primaryColor, color: btnTextColor }
                                    : { backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.88)' : 'rgba(255,255,255,0.9)' }
                            }
                            title={isEn ? 'Toggle 3D Map' : 'تبديل العرض ثلاثي الأبعاد'}
                        >
                            <i className="fa-solid fa-cube text-[11px]"></i>
                            <span>{is3DMode ? '3D' : '2D'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleCenterRoute}
                            className={`app-page-card border-0 w-8 h-8 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer ${surfaceCardClass}`}
                            style={{
                                backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.88)' : 'rgba(255,255,255,0.9)',
                                color: mapAccentColor
                            }}
                            title={isEn ? 'Center Qibla Route' : 'توسيط مسار القبلة'}
                            aria-label={isEn ? 'Center Qibla Route' : 'توسيط مسار القبلة'}
                        >
                            <i className="fa-solid fa-crosshairs text-xs"></i>
                        </button>
                    </div>
                </div>

                {/* شريط أزرار التحكم بالأسفل: التكبير والتصغير + الاستدارة والإمالة ثلاثية الأبعاد في نفس الصف */}
                <div
                    className="pointer-events-none absolute bottom-3.5 left-3.5 z-20 flex items-center gap-1.5"
                    dir="ltr"
                >
                    <button
                        type="button"
                        onClick={handleZoomIn}
                        disabled={currentZoom >= 19}
                        className={`pointer-events-auto app-page-card border-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-45 disabled:cursor-default ${surfaceCardClass}`}
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                            color: mapAccentColor
                        }}
                        title={isEn ? 'Zoom In' : 'تكبير الخريطة'}
                        aria-label={isEn ? 'Zoom In' : 'تكبير الخريطة'}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    <button
                        type="button"
                        onClick={handleZoomOut}
                        disabled={currentZoom <= 2}
                        className={`pointer-events-auto app-page-card border-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer disabled:opacity-45 disabled:cursor-default ${surfaceCardClass}`}
                        style={{
                            backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                            color: mapAccentColor
                        }}
                        title={isEn ? 'Zoom Out' : 'تصغير الخريطة'}
                        aria-label={isEn ? 'Zoom Out' : 'تصغير الخريطة'}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>

                    {is3DMode && !webglError && (
                        <>
                            <button
                                type="button"
                                onPointerDown={() => startContinuousCameraMotion('bearing', -1)}
                                onPointerUp={stopContinuousCameraMotion}
                                onPointerLeave={stopContinuousCameraMotion}
                                onPointerCancel={stopContinuousCameraMotion}
                                onClick={() => handleStepCamera3D('bearing', -1)}
                                className={`pointer-events-auto app-page-card border-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none ${surfaceCardClass}`}
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                                    color: mapAccentColor
                                }}
                                title={isEn ? 'Rotate Left' : 'استدارة لليسار'}
                                aria-label={isEn ? 'Rotate Left' : 'استدارة لليسار'}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onPointerDown={() => startContinuousCameraMotion('bearing', 1)}
                                onPointerUp={stopContinuousCameraMotion}
                                onPointerLeave={stopContinuousCameraMotion}
                                onPointerCancel={stopContinuousCameraMotion}
                                onClick={() => handleStepCamera3D('bearing', 1)}
                                className={`pointer-events-auto app-page-card border-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none ${surfaceCardClass}`}
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                                    color: mapAccentColor
                                }}
                                title={isEn ? 'Rotate Right' : 'استدارة لليمين'}
                                aria-label={isEn ? 'Rotate Right' : 'استدارة لليمين'}
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onPointerDown={() => startContinuousCameraMotion('pitch', 1)}
                                onPointerUp={stopContinuousCameraMotion}
                                onPointerLeave={stopContinuousCameraMotion}
                                onPointerCancel={stopContinuousCameraMotion}
                                onClick={() => handleStepCamera3D('pitch', 1)}
                                className={`pointer-events-auto app-page-card border-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none ${surfaceCardClass}`}
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                                    color: mapAccentColor
                                }}
                                title={isEn ? 'Tilt Horizon Up' : 'إمالة المنظور للأفق'}
                                aria-label={isEn ? 'Tilt Horizon Up' : 'إمالة المنظور للأفق'}
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onPointerDown={() => startContinuousCameraMotion('pitch', -1)}
                                onPointerUp={stopContinuousCameraMotion}
                                onPointerLeave={stopContinuousCameraMotion}
                                onPointerCancel={stopContinuousCameraMotion}
                                onClick={() => handleStepCamera3D('pitch', -1)}
                                className={`pointer-events-auto app-page-card border-0 w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center transition-all active:scale-90 cursor-pointer select-none ${surfaceCardClass}`}
                                style={{
                                    backgroundColor: isBlackTheme ? 'rgba(24,24,27,0.9)' : 'rgba(255,255,255,0.92)',
                                    color: mapAccentColor
                                }}
                                title={isEn ? 'Tilt Top-Down' : 'إمالة المنظور للأسفل'}
                                aria-label={isEn ? 'Tilt Top-Down' : 'إمالة المنظور للأسفل'}
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const getARThemePalette = (
    theme: any,
    themeKey?: string,
    isNightMode?: boolean,
    homeThemeVariant?: string
) => {
    const isBlackTheme =
        Boolean(isNightMode) ||
        themeKey === 'black_gold' ||
        themeKey === 'deep_black' ||
        theme?.bgColor === '#000000' ||
        theme?.name === 'أبيض وأسود' ||
        theme?.name === 'اسود' ||
        theme?.name === 'black';

    if (isBlackTheme) {
        return {
            isBlackTheme: true,
            accent: '#f59e0b',
            accentLight: '#fde047',
            cardBg: 'radial-gradient(circle at 50% 42%, #27272a 0%, #18181b 54%, #09090b 100%)',
            cardBorder: '3px solid rgba(255,255,255,0.22)',
            cardShadow: '0 10px 0 #050507, 0 22px 38px rgba(0,0,0,0.82), inset 0 6px 18px rgba(0,0,0,0.72)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 #064e3b, 0 22px 40px rgba(34,197,94,0.34), inset 0 6px 18px rgba(0,0,0,0.68)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(245,158,11,0.08) 0%, rgba(9,9,11,0.48) 62%, rgba(9,9,11,0.86) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.16) 0%, rgba(9,9,11,0.45) 62%, rgba(9,9,11,0.84) 100%)',
            gridColor: 'rgba(255,255,255,0.14)',
            pillBg: 'linear-gradient(145deg, rgba(39,39,42,0.88) 0%, rgba(9,9,11,0.92) 100%)',
            pillText: '#ffffff',
            pillBorder: '1px solid rgba(255,255,255,0.2)',
            pillShadow: '0 4px 0 rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.25)',
            dialOuterBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.12) 0%, rgba(39,39,42,0.45) 65%, rgba(9,9,11,0.65) 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, rgba(34,197,94,0.22) 0%, rgba(6,78,59,0.26) 65%, rgba(9,9,11,0.55) 100%)',
            dialOuterBorder: '3px solid rgba(255,255,255,0.28)',
            dialOuterShadow: '0 8px 0 rgba(0,0,0,0.65), 0 18px 34px rgba(0,0,0,0.65), inset 0 4px 16px rgba(255,255,255,0.14)',
            dialOuterAlignedShadow: '0 8px 0 rgba(20,83,45,0.85), 0 0 38px rgba(34,197,94,0.45), inset 0 4px 16px rgba(34,197,94,0.3)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(39,39,42,0.4) 0%, rgba(24,24,27,0.55) 65%, rgba(9,9,11,0.7) 100%)',
            dialInnerBorder: '1px solid rgba(255,255,255,0.16)',
            dialInnerShadow: 'inset 0 6px 18px rgba(0,0,0,0.55), inset 0 -3px 10px rgba(255,255,255,0.08)',
            ringBorder: '1.5px dashed rgba(255,255,255,0.18)',
            notchBg: 'linear-gradient(145deg, #f8fafc, #94a3b8)',
            notchIconColor: '#0f172a',
            tickColor: 'rgba(255,255,255,0.34)',
            cardinalSecondary: '#cbd5e1',
            beamGradient: 'linear-gradient(90deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
            statusBg: 'linear-gradient(145deg, rgba(39,39,42,0.92) 0%, rgba(9,9,11,0.96) 100%)',
            statusText: '#ffffff',
            statusBorder: '1.5px solid rgba(255,255,255,0.24)',
            statusShadow: '0 5px 0 #020617, 0 12px 24px rgba(0,0,0,0.62), inset 0 1.5px 2px rgba(255,255,255,0.22)',
            errorCardBg: 'linear-gradient(145deg, rgba(39,39,42,0.92) 0%, rgba(9,9,11,0.96) 100%)',
            errorCardBorder: '1px solid rgba(248,113,113,0.4)',
            errorTextClass: 'text-red-300',
        };
    }

    const isSky = homeThemeVariant === 'sky' || themeKey === 'sky_mode' || theme?.bgColor?.toUpperCase() === '#E0F2FE';
    const isEmerald = homeThemeVariant === 'emerald' || themeKey === 'emerald_mode' || theme?.bgColor?.toUpperCase() === '#D1FAE5';
    const isBurgundy = homeThemeVariant === 'burgundy' || themeKey === 'burgundy_mode' || theme?.bgColor?.toUpperCase() === '#FFE4E6';

    if (isSky) {
        return {
            isBlackTheme: false,
            accent: '#0284c7',
            accentLight: '#7dd3fc',
            cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #F0F9FF 48%, #BAE6FD 100%)',
            cardBorder: '3px solid rgba(2, 132, 199, 0.42)',
            cardShadow: '0 10px 0 rgba(3, 105, 161, 0.24), 0 20px 36px rgba(2, 132, 199, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(224,242,254,0.36) 64%, rgba(186,230,253,0.68) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
            gridColor: 'rgba(2, 132, 199, 0.18)',
            pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
            pillText: '#0C4A6E',
            pillBorder: '1px solid rgba(2, 132, 199, 0.28)',
            pillShadow: '0 4px 0 rgba(3, 105, 161, 0.18), 0 8px 16px rgba(2, 132, 199, 0.12), inset 0 1.5px 1px #FFFFFF',
            dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #E0F2FE 55%, #BAE6FD 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
            dialOuterBorder: '3px solid rgba(2, 132, 199, 0.36)',
            dialOuterShadow: '0 8px 0 rgba(3, 105, 161, 0.22), 0 18px 30px rgba(2, 132, 199, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
            dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(240,249,255,0.88) 65%, rgba(224,242,254,0.94) 100%)',
            dialInnerBorder: '1px solid rgba(2, 132, 199, 0.24)',
            dialInnerShadow: 'inset 0 5px 14px rgba(3, 105, 161, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
            ringBorder: '1.5px dashed rgba(2, 132, 199, 0.26)',
            notchBg: 'linear-gradient(145deg, #FFFFFF, #BAE6FD)',
            notchIconColor: '#0369a1',
            tickColor: 'rgba(3, 105, 161, 0.36)',
            cardinalSecondary: '#0369a1',
            beamGradient: 'linear-gradient(90deg, #bae6fd 0%, #0284c7 50%, #075985 100%)',
            statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
            statusText: '#0C4A6E',
            statusBorder: '1.5px solid rgba(2, 132, 199, 0.32)',
            statusShadow: '0 5px 0 rgba(3, 105, 161, 0.22), 0 12px 24px rgba(2, 132, 199, 0.16), inset 0 1.5px 2px #FFFFFF',
            errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
            errorTextClass: 'text-red-600',
        };
    }

    if (isEmerald) {
        return {
            isBlackTheme: false,
            accent: '#059669',
            accentLight: '#6ee7b7',
            cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #ECFDF5 48%, #A7F3D0 100%)',
            cardBorder: '3px solid rgba(5, 150, 105, 0.42)',
            cardShadow: '0 10px 0 rgba(4, 120, 87, 0.24), 0 20px 36px rgba(5, 150, 105, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(209,250,229,0.36) 64%, rgba(167,243,208,0.68) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
            gridColor: 'rgba(5, 150, 105, 0.18)',
            pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
            pillText: '#064E3B',
            pillBorder: '1px solid rgba(5, 150, 105, 0.28)',
            pillShadow: '0 4px 0 rgba(4, 120, 87, 0.18), 0 8px 16px rgba(5, 150, 105, 0.12), inset 0 1.5px 1px #FFFFFF',
            dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #D1FAE5 55%, #A7F3D0 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
            dialOuterBorder: '3px solid rgba(5, 150, 105, 0.36)',
            dialOuterShadow: '0 8px 0 rgba(4, 120, 87, 0.22), 0 18px 30px rgba(5, 150, 105, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
            dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(236,253,245,0.88) 65%, rgba(209,250,229,0.94) 100%)',
            dialInnerBorder: '1px solid rgba(5, 150, 105, 0.24)',
            dialInnerShadow: 'inset 0 5px 14px rgba(4, 120, 87, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
            ringBorder: '1.5px dashed rgba(5, 150, 105, 0.26)',
            notchBg: 'linear-gradient(145deg, #FFFFFF, #A7F3D0)',
            notchIconColor: '#047857',
            tickColor: 'rgba(4, 120, 87, 0.36)',
            cardinalSecondary: '#047857',
            beamGradient: 'linear-gradient(90deg, #a7f3d0 0%, #059669 50%, #065f46 100%)',
            statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #ECFDF5 100%)',
            statusText: '#064E3B',
            statusBorder: '1.5px solid rgba(5, 150, 105, 0.32)',
            statusShadow: '0 5px 0 rgba(4, 120, 87, 0.22), 0 12px 24px rgba(5, 150, 105, 0.16), inset 0 1.5px 2px #FFFFFF',
            errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
            errorTextClass: 'text-red-600',
        };
    }

    if (isBurgundy) {
        return {
            isBlackTheme: false,
            accent: '#9f1239',
            accentLight: '#fda4af',
            cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #FFF1F2 48%, #FECDD3 100%)',
            cardBorder: '3px solid rgba(159, 18, 57, 0.42)',
            cardShadow: '0 10px 0 rgba(136, 19, 55, 0.24), 0 20px 36px rgba(159, 18, 57, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
            cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
            cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
            vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(255,228,230,0.36) 64%, rgba(254,205,211,0.68) 100%)',
            vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
            gridColor: 'rgba(159, 18, 57, 0.18)',
            pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
            pillText: '#4C0519',
            pillBorder: '1px solid rgba(159, 18, 57, 0.28)',
            pillShadow: '0 4px 0 rgba(136, 19, 55, 0.18), 0 8px 16px rgba(159, 18, 57, 0.12), inset 0 1.5px 1px #FFFFFF',
            dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #FFE4E6 55%, #FECDD3 100%)',
            dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
            dialOuterBorder: '3px solid rgba(159, 18, 57, 0.36)',
            dialOuterShadow: '0 8px 0 rgba(136, 19, 55, 0.22), 0 18px 30px rgba(159, 18, 57, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
            dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
            dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(255,241,242,0.88) 65%, rgba(255,228,230,0.94) 100%)',
            dialInnerBorder: '1px solid rgba(159, 18, 57, 0.24)',
            dialInnerShadow: 'inset 0 5px 14px rgba(136, 19, 55, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
            ringBorder: '1.5px dashed rgba(159, 18, 57, 0.26)',
            notchBg: 'linear-gradient(145deg, #FFFFFF, #FECDD3)',
            notchIconColor: '#881337',
            tickColor: 'rgba(136, 19, 55, 0.36)',
            cardinalSecondary: '#881337',
            beamGradient: 'linear-gradient(90deg, #fecdd3 0%, #9f1239 50%, #4c0519 100%)',
            statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF1F2 100%)',
            statusText: '#4C0519',
            statusBorder: '1.5px solid rgba(159, 18, 57, 0.32)',
            statusShadow: '0 5px 0 rgba(136, 19, 55, 0.22), 0 12px 24px rgba(159, 18, 57, 0.16), inset 0 1.5px 2px #FFFFFF',
            errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
            errorTextClass: 'text-red-600',
        };
    }

    // Gold (default light theme)
    return {
        isBlackTheme: false,
        accent: '#d97706',
        accentLight: '#fde047',
        cardBg: 'linear-gradient(155deg, #FFFFFF 0%, #FFFBEB 48%, #FEF08A 100%)',
        cardBorder: '3px solid rgba(217, 119, 6, 0.45)',
        cardShadow: '0 10px 0 rgba(180, 83, 9, 0.24), 0 20px 36px rgba(180, 83, 9, 0.18), inset 0 4px 16px rgba(255, 255, 255, 0.92)',
        cardAlignedBorder: '3px solid rgba(34,197,94,0.8)',
        cardAlignedShadow: '0 10px 0 rgba(21,128,61,0.32), 0 22px 38px rgba(34,197,94,0.24), inset 0 4px 16px rgba(255,255,255,0.9)',
        vignetteBg: 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.08) 0%, rgba(254,249,195,0.36) 64%, rgba(254,240,138,0.68) 100%)',
        vignetteAlignedBg: 'radial-gradient(circle at 50% 48%, rgba(34,197,94,0.12) 0%, rgba(220,252,231,0.36) 64%, rgba(187,247,208,0.68) 100%)',
        gridColor: 'rgba(180, 83, 9, 0.18)',
        pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
        pillText: '#78350F',
        pillBorder: '1px solid rgba(217, 119, 6, 0.3)',
        pillShadow: '0 4px 0 rgba(180, 83, 9, 0.18), 0 8px 16px rgba(180, 83, 9, 0.12), inset 0 1.5px 1px #FFFFFF',
        dialOuterBg: 'linear-gradient(145deg, #FFFFFF 0%, #FEF3C7 55%, #FDE68A 100%)',
        dialOuterAlignedBg: 'radial-gradient(circle at 38% 30%, #FFFFFF 0%, #DCFCE7 60%, #86EFAC 100%)',
        dialOuterBorder: '3px solid rgba(217, 119, 6, 0.38)',
        dialOuterShadow: '0 8px 0 rgba(180, 83, 9, 0.22), 0 18px 30px rgba(180, 83, 9, 0.16), inset 0 3px 8px rgba(255, 255, 255, 0.95)',
        dialOuterAlignedShadow: '0 8px 0 rgba(21,128,61,0.32), 0 0 34px rgba(34,197,94,0.32), inset 0 4px 14px rgba(255,255,255,0.9)',
        dialInnerBg: 'radial-gradient(circle at 38% 30%, rgba(255,255,255,0.94) 0%, rgba(255,251,235,0.88) 65%, rgba(254,243,199,0.94) 100%)',
        dialInnerBorder: '1px solid rgba(217, 119, 6, 0.26)',
        dialInnerShadow: 'inset 0 5px 14px rgba(180, 83, 9, 0.14), inset 0 -3px 10px rgba(255, 255, 255, 0.9)',
        ringBorder: '1.5px dashed rgba(217, 119, 6, 0.28)',
        notchBg: 'linear-gradient(145deg, #FFFFFF, #FDE68A)',
        notchIconColor: '#92400e',
        tickColor: 'rgba(180, 83, 9, 0.36)',
        cardinalSecondary: '#92400e',
        beamGradient: 'linear-gradient(90deg, #fef08a 0%, #f59e0b 50%, #b45309 100%)',
        statusBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)',
        statusText: '#78350F',
        statusBorder: '1.5px solid rgba(217, 119, 6, 0.34)',
        statusShadow: '0 5px 0 rgba(180, 83, 9, 0.22), 0 12px 24px rgba(180, 83, 9, 0.16), inset 0 1.5px 2px #FFFFFF',
        errorCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
        errorCardBorder: '1px solid rgba(239, 68, 68, 0.28)',
        errorTextClass: 'text-red-600',
    };
};

export const ARQibla = ({ qiblaDirection, heading, isAligned, theme, themeKey, isNightMode, homeThemeVariant }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const [showCameraPermissionModal, setShowCameraPermissionModal] = useState(false);
    const { primaryColor, btnTextColor } = getQiblaModeStyles(theme);
    const arPalette = getARThemePalette(theme, themeKey, isNightMode, homeThemeVariant);

    const startCamera = async () => {
        try {
            setError('');
            const perm = await requestCameraPermission();
            if (!perm.granted) {
                setError(isEn ? 'Unable to access camera. Please grant camera permission.' : 'تعذر الوصول إلى الكاميرا. يرجى منح الصلاحية.');
                setShowCameraPermissionModal(true);
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                try {
                    await videoRef.current.play();
                } catch (err: any) {
                    const isAutoplayError = 
                        err.name === 'NotAllowedError' || 
                        (err.message && (
                            err.message.includes('user agent') || 
                            err.message.includes('platform') || 
                            err.message.includes('permission') ||
                            err.message.includes('interact')
                        ));

                    if (err.name !== 'AbortError' && !isAutoplayError) {
                        console.error('Camera video play failed:', err);
                    }
                }
            }
        } catch (err) {
            setError(isEn ? 'Unable to access camera. Please grant camera permission.' : 'تعذر الوصول إلى الكاميرا. يرجى منح الصلاحية.');
            setShowCameraPermissionModal(true);
        }
    };

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isEn]);

    const rotation = qiblaDirection - heading;
    const arAccent = isAligned ? '#22c55e' : arPalette.accent;

    return (
        <div className="w-full h-full flex flex-col pt-1 pb-4">
            <div
                className="relative w-full h-full flex-1 rounded-[28px] overflow-hidden flex flex-col items-center justify-between py-4 px-3.5 select-none"
                style={{
                    background: arPalette.cardBg,
                    border: isAligned ? arPalette.cardAlignedBorder : arPalette.cardBorder,
                    boxShadow: isAligned ? arPalette.cardAlignedShadow : arPalette.cardShadow
                }}
            >
                {/* Live Camera Backdrop */}
                {!error && (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className={`absolute inset-0 w-full h-full object-cover ${arPalette.isBlackTheme ? 'opacity-65' : 'opacity-75'}`}
                    />
                )}

                {/* 3D Atmospheric Spatial Vignette & Horizon Glow */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                        background: isAligned ? arPalette.vignetteAlignedBg : arPalette.vignetteBg
                    }}
                />

                {/* 3D Perspective Spatial Floor Grid */}
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-44 overflow-hidden opacity-55"
                    style={{ perspective: '340px' }}
                >
                    <div
                        className="w-full h-full origin-bottom"
                        style={{
                            transform: 'rotateX(64deg) scale(1.35)',
                            backgroundImage: `linear-gradient(to right, ${isAligned ? 'rgba(34,197,94,0.3)' : arPalette.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${isAligned ? 'rgba(34,197,94,0.3)' : arPalette.gridColor} 1px, transparent 1px)`,
                            backgroundSize: '30px 30px',
                            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 92%)',
                            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 92%)'
                        }}
                    />
                </div>

                {/* 4 Sculpted 3D Corner AR Viewfinder Brackets */}
                <div className="pointer-events-none absolute top-3.5 left-3.5 w-6 h-6 border-t-[3px] border-l-[3px] rounded-tl-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />
                <div className="pointer-events-none absolute top-3.5 right-3.5 w-6 h-6 border-t-[3px] border-r-[3px] rounded-tr-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />
                <div className="pointer-events-none absolute bottom-3.5 left-3.5 w-6 h-6 border-b-[3px] border-l-[3px] rounded-bl-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />
                <div className="pointer-events-none absolute bottom-3.5 right-3.5 w-6 h-6 border-b-[3px] border-r-[3px] rounded-br-xl" style={{ borderColor: arAccent, filter: `drop-shadow(0 0 6px ${arAccent}88)` }} />

                <InAppPermissionModal
                    isOpen={showCameraPermissionModal}
                    type="camera"
                    onClose={() => setShowCameraPermissionModal(false)}
                    onGranted={() => {
                        setShowCameraPermissionModal(false);
                        startCamera();
                    }}
                />

                {/* Top 3D HUD Telemetry Pills */}
                <div className="relative z-10 w-full flex items-center justify-between gap-2 px-1">
                    <div
                        className="px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black backdrop-blur-md"
                        style={{
                            background: arPalette.pillBg,
                            color: arPalette.pillText,
                            border: arPalette.pillBorder,
                            boxShadow: arPalette.pillShadow
                        }}
                    >
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: arAccent }} />
                        <span className="tabular-nums">
                            {isEn ? `Qibla ${Math.round(qiblaDirection)}°` : `القبلة ${Math.round(qiblaDirection)}°`}
                        </span>
                    </div>

                    <div
                        className="px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black backdrop-blur-md"
                        style={{
                            background: isAligned
                                ? 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)'
                                : arPalette.pillBg,
                            color: isAligned ? '#ffffff' : arPalette.pillText,
                            border: isAligned ? '1px solid rgba(134,239,172,0.7)' : arPalette.pillBorder,
                            boxShadow: isAligned
                                ? '0 4px 0 #14532d, 0 8px 18px rgba(34,197,94,0.45), inset 0 1px 1px rgba(255,255,255,0.45)'
                                : arPalette.pillShadow
                        }}
                    >
                        <i className={`fa-solid ${isAligned ? 'fa-check-circle' : 'fa-compass'} text-[11px]`}></i>
                        <span className="tabular-nums">
                            {isAligned
                                ? (isEn ? 'Aligned' : 'متجه للقبلة')
                                : (isEn ? `Heading ${Math.round(heading)}°` : `الاتجاه ${Math.round(heading)}°`)}
                        </span>
                    </div>
                </div>

                {/* Center 3D Holographic AR Gyroscopic Reticle & Kaaba Monument */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-2">
                    <div
                        className="relative w-[252px] h-[252px] sm:w-[276px] sm:h-[276px] rounded-full flex items-center justify-center transition-all duration-300"
                        style={{
                            background: isAligned ? arPalette.dialOuterAlignedBg : arPalette.dialOuterBg,
                            padding: '9px',
                            border: isAligned ? '3px solid rgba(74,222,128,0.88)' : arPalette.dialOuterBorder,
                            boxShadow: isAligned ? arPalette.dialOuterAlignedShadow : arPalette.dialOuterShadow
                        }}
                    >
                        {/* Fixed Top Camera Target Notch */}
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center"
                                style={{
                                    background: isAligned
                                        ? 'linear-gradient(145deg, #4ade80, #16a34a)'
                                        : arPalette.notchBg,
                                    boxShadow: arPalette.isBlackTheme
                                        ? '0 3px 0 rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.45)'
                                        : '0 3px 0 rgba(0,0,0,0.16), 0 4px 10px rgba(0,0,0,0.12), inset 0 1.5px 1px #FFFFFF'
                                }}
                            >
                                <i className="fa-solid fa-caret-down text-xs" style={{ color: isAligned ? '#ffffff' : arPalette.notchIconColor }}></i>
                            </div>
                        </div>

                        {/* Inner Recessed Glass Dial */}
                        <div
                            className="relative w-full h-full rounded-full flex items-center justify-center backdrop-blur-[2px]"
                            style={{
                                background: arPalette.dialInnerBg,
                                border: isAligned ? '1px solid rgba(134,239,172,0.5)' : arPalette.dialInnerBorder,
                                boxShadow: arPalette.dialInnerShadow
                            }}
                        >
                            {/* Concentric Holographic Ring */}
                            <div
                                className="absolute inset-8 rounded-full pointer-events-none"
                                style={{
                                    border: isAligned ? '1.5px dashed rgba(34,197,94,0.45)' : arPalette.ringBorder
                                }}
                            />

                            {/* Rotating Compass Ticks & 3D Cardinal Letters */}
                            <div
                                className="absolute w-full h-full transition-transform duration-300 ease-out pointer-events-none"
                                style={{ transform: `rotate(${-heading}deg)` }}
                            >
                                {Array.from({ length: 24 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="absolute top-0 left-1/2 w-full h-1/2 -translate-x-1/2"
                                        style={{ transform: `rotate(${i * 15}deg)`, transformOrigin: '50% 100%' }}
                                    >
                                        <div
                                            className={`mx-auto rounded-full ${i % 6 === 0 ? 'w-1 h-2.5 mt-1 opacity-0' : (i % 2 === 0 ? 'w-0.5 h-2 mt-1' : 'w-0.5 h-1 mt-1.5')}`}
                                            style={{
                                                background: isAligned ? 'rgba(34,197,94,0.6)' : arPalette.tickColor
                                            }}
                                        />
                                    </div>
                                ))}

                                <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'N' : 'ش'} color={arPalette.accent} size={24} isPrimary />
                                </div>
                                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'S' : 'ج'} color={arPalette.cardinalSecondary} size={20} />
                                </div>
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'W' : 'غ'} color={arPalette.cardinalSecondary} size={20} />
                                </div>
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <Compass3DLetter letter={isEn ? 'E' : 'ق'} color={arPalette.cardinalSecondary} size={20} />
                                </div>
                            </div>

                            {/* Rotating 3D Qibla Guidance Beam & Pointer Arrow */}
                            <div
                                className="absolute w-full h-full transition-transform duration-500 ease-out pointer-events-none"
                                style={{ transform: `rotate(${rotation}deg)` }}
                            >
                                {/* 3D Qibla Directional Arrow at Perimeter */}
                                <div className="absolute inset-0">
                                    <Qibla3DArrow color={isAligned ? '#22c55e' : arPalette.accent} />
                                </div>

                                {/* 3D Glowing Guidance Beam connecting Center Dome to Monument */}
                                <div
                                    className="absolute top-[52px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                                    style={{
                                        background: isAligned
                                            ? 'linear-gradient(90deg, #86efac 0%, #22c55e 50%, #15803d 100%)'
                                            : arPalette.beamGradient,
                                        boxShadow: `0 0 12px ${arAccent}`
                                    }}
                                />

                                {/* Upright 3D Sculpted Kaaba Monument Orbiting in AR Space */}
                                <div
                                    className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-500"
                                    style={{
                                        top: isAligned ? '52px' : '38px',
                                        transform: `rotate(${-rotation}deg) scale(${isAligned ? 1.12 : 0.96})`
                                    }}
                                >
                                    <KaabaAR3DMonument
                                        size={isAligned ? 96 : 84}
                                        isAligned={isAligned}
                                        accentColor={arPalette.accent}
                                        accentLightColor={arPalette.accentLight}
                                    />
                                </div>
                            </div>

                            {/* Center 3D Spherical Target Dome */}
                            <div className="relative z-20 flex items-center justify-center pointer-events-none">
                                <Compass3DCenterDome color={arAccent} size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Controls: Compact 3D Camera Permission Prompt (if needed) + 3D Status Pill */}
                <div className="relative z-10 w-full flex flex-col items-center gap-2.5">
                    {error && (
                        <div
                            className="w-full max-w-sm px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-3 backdrop-blur-md"
                            style={{
                                background: arPalette.errorCardBg,
                                border: arPalette.errorCardBorder,
                                boxShadow: arPalette.isBlackTheme
                                    ? '0 6px 0 rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.16)'
                                    : '0 4px 0 rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.08), inset 0 1.5px 1px #FFFFFF'
                            }}
                        >
                            <p className={`${arPalette.errorTextClass} text-[11px] sm:text-xs font-bold text-start leading-snug flex-1`}>
                                {error}
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowCameraPermissionModal(true)}
                                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all active:scale-95"
                                style={{
                                    backgroundColor: arPalette.isBlackTheme ? primaryColor : arPalette.accent,
                                    color: arPalette.isBlackTheme ? btnTextColor : '#FFFFFF',
                                    boxShadow: arPalette.isBlackTheme
                                        ? '0 4px 0 rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.45)'
                                        : '0 3px 0 rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.4)'
                                }}
                            >
                                {isEn ? 'Enable Camera' : 'تفعيل الكاميرا'}
                            </button>
                        </div>
                    )}

                    <div
                        className="px-6 py-2.5 rounded-full font-black text-sm sm:text-base flex items-center gap-2.5 backdrop-blur-md transition-all duration-300"
                        style={{
                            background: isAligned
                                ? 'linear-gradient(145deg, #22c55e 0%, #15803d 100%)'
                                : arPalette.statusBg,
                            color: isAligned ? '#ffffff' : arPalette.statusText,
                            border: isAligned ? '1.5px solid rgba(134,239,172,0.78)' : arPalette.statusBorder,
                            boxShadow: isAligned
                                ? '0 5px 0 #14532d, 0 12px 26px rgba(34,197,94,0.45), inset 0 1.5px 2px rgba(255,255,255,0.45)'
                                : arPalette.statusShadow
                        }}
                    >
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                                backgroundColor: isAligned ? '#ffffff' : arAccent,
                                boxShadow: isAligned ? '0 0 8px #ffffff' : `0 0 8px ${arAccent}`
                            }}
                        />
                        <span>
                            {isAligned
                                ? (isEn ? 'Facing Qibla' : 'أنت متجه للقبلة الآن')
                                : (isEn ? 'Point camera towards the Kaaba' : 'وجّه الكاميرا نحو مجسم الكعبة')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const SunMoonQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [time, setTime] = useState(new Date());
    const { isBlackTheme, primaryColor, surfaceCardClass, softRowClass } = getQiblaModeStyles(theme);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const moonPos = SunCalc.getMoonPosition(time, lat, lng);

    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const moonHeading = (moonPos.azimuth * 180 / Math.PI + 180) % 360;

    const sunDiff = Math.abs((sunHeading - qiblaDirection + 540) % 360 - 180);
    const moonDiff = Math.abs((moonHeading - qiblaDirection + 540) % 360 - 180);

    const CompassDial = ({ targetHeading, targetType, targetColor }: { targetHeading: number; targetType: 'sun' | 'moon'; targetColor: string }) => (
        <div
            className="relative w-[272px] h-[272px] sm:w-[292px] sm:h-[292px] rounded-full flex items-center justify-center mx-auto mt-12 mb-6 select-none"
            style={{
                background: isBlackTheme
                    ? 'linear-gradient(145deg, #3f3f46 0%, #18181b 52%, #09090b 100%)'
                    : 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)',
                padding: '10px',
                boxShadow: isBlackTheme
                    ? '0 10px 0 #050507, 0 22px 36px rgba(0,0,0,0.78), inset 0 2px 3px rgba(255,255,255,0.22)'
                    : '0 10px 0 #cbd5e1, 0 22px 36px rgba(15,23,42,0.2), inset 0 2px 4px rgba(255,255,255,0.98)'
            }}
        >
            {/* Phone heading indicator (fixed above top rim, borderless 3D) */}
            <div
                className="border-0 absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
            >
                <Phone3DIcon size={38} />
            </div>

            {/* القرص الداخلي الغائر والمجسم */}
            <div
                className="relative w-full h-full rounded-full flex items-center justify-center"
                style={{
                    background: isBlackTheme
                        ? 'radial-gradient(circle at 35% 28%, #27272a 0%, #18181b 58%, #09090b 100%)'
                        : 'radial-gradient(circle at 35% 28%, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%)',
                    boxShadow: isBlackTheme
                        ? 'inset 0 6px 14px rgba(0,0,0,0.85), inset 0 -3px 8px rgba(255,255,255,0.08)'
                        : 'inset 0 6px 14px rgba(15,23,42,0.14), inset 0 -4px 10px rgba(255,255,255,0.95)'
                }}
            >
                {/* حلقات زخرفية غائرة لتعزيز العمق */}
                <div
                    className="absolute inset-5 rounded-full pointer-events-none"
                    style={{
                        border: isBlackTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.07)',
                        boxShadow: isBlackTheme ? 'inset 0 1px 2px rgba(0,0,0,0.6)' : 'inset 0 1px 2px rgba(15,23,42,0.06)'
                    }}
                />
                <div
                    className="absolute inset-11 rounded-full pointer-events-none"
                    style={{
                        border: isBlackTheme ? '1px dashed rgba(255,255,255,0.07)' : '1px dashed rgba(15,23,42,0.06)'
                    }}
                />

                {/* لمعة زجاجية علوية */}
                <div
                    className="absolute inset-1.5 rounded-full pointer-events-none"
                    style={{
                        background: isBlackTheme
                            ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 44%)'
                            : 'linear-gradient(155deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 46%)'
                    }}
                />

                {/* Rotating dial */}
                <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                    {/* علامات التدريج المعدنية المجسمة */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute top-0 left-1/2 w-full h-1/2 pointer-events-none -translate-x-1/2"
                            style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: '50% 100%' }}
                        >
                            <div
                                className={`mx-auto rounded-full ${i % 3 === 0 ? 'w-1 h-2.5 mt-1 opacity-0' : 'w-0.5 h-2 mt-1.5'}`}
                                style={{
                                    background: isBlackTheme ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.65)',
                                    boxShadow: '0 1px 1px rgba(0,0,0,0.18)'
                                }}
                            />
                        </div>
                    ))}

                    {/* أحرف الاتجاهات المجسمة ثلاثية الأبعاد */}
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'N' : 'ش'} color={primaryColor} size={30} isPrimary />
                    </div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'S' : 'ج'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                    </div>
                    <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'W' : 'غ'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                    </div>
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                        <Compass3DLetter letter={isEn ? 'E' : 'ق'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                    </div>

                    {/* Qibla marker */}
                    <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                        <div
                            className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-transform duration-300 ease-out"
                            style={{ transform: `rotate(${heading - qiblaDirection}deg)` }}
                        >
                            <Kaaba3DIcon size={46} tone="emerald" />
                        </div>
                        {/* 3D Cylindrical Needle to Qibla */}
                        <div
                            className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                            style={{
                                background: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 55%, #047857 100%)',
                                boxShadow: '0 2px 6px rgba(16,185,129,0.42)'
                            }}
                        ></div>
                    </div>

                    {/* Target marker (Sun/Moon) */}
                    <div className="absolute w-full h-full" style={{ transform: `rotate(${targetHeading}deg)` }}>
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                            {targetType === 'sun' ? <Sun3DIcon size={48} /> : <Moon3DIcon size={46} />}
                        </div>
                        {/* 3D Cylindrical Needle to Target */}
                        <div
                            className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                            style={{
                                background: targetType === 'sun'
                                    ? 'linear-gradient(90deg, #fef08a 0%, #f59e0b 55%, #b45309 100%)'
                                    : 'linear-gradient(90deg, #bae6fd 0%, #3b82f6 55%, #1d4ed8 100%)',
                                boxShadow: `0 2px 6px ${targetColor}66`
                            }}
                        ></div>
                    </div>
                </div>

                {/* القبة المركزية المجسمة */}
                <div className="absolute z-10 flex items-center justify-center pointer-events-none">
                    <Compass3DCenterDome color={primaryColor} size={26} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full shrink-0 flex flex-col gap-5 pb-4" dir={isEn ? 'ltr' : 'rtl'}>
            <div className={`app-page-card border-0 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden ${surfaceCardClass}`}>
                <div className={`absolute top-4 ${isEn ? 'left-4' : 'right-4'} text-yellow-500 opacity-10`}><i className="fa-solid fa-sun text-6xl"></i></div>
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Sun' : 'تحديد القبلة عن طريق الشمس'}
                </h3>
                
                <div className={`app-inner-3d-box border-0 mb-6 p-4 rounded-2xl max-w-sm ${isBlackTheme ? 'bg-white/10' : 'bg-amber-50/90 dark:bg-amber-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-amber-700 dark:text-amber-300">
                        {isEn 
                            ? 'Point your phone (red marker) toward the Sun to verify direction, then rotate your phone until the green Kaaba aligns with the red phone icon to face the Qibla.' 
                            : 'وجه هاتفك (العلامة الحمراء) نحو الشمس في السماء لمطابقة الاتجاه، ثم أدر هاتفك نحو الكعبة الخضراء حتى تتطابق مع أيقونة الهاتف الحمراء لتكون متجهاً للقبلة.'}
                    </p>
                </div>
                
                <CompassDial targetHeading={sunHeading} targetType="sun" targetColor="#eab308" />

                <div className="w-full space-y-2.5 mb-4">
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Sun Direction:' : 'اتجاه الشمس:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(sunHeading)}°</span>
                    </div>
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div className={`app-inner-3d-box border-0 p-4 rounded-2xl w-full ${isBlackTheme ? 'bg-white/10' : 'bg-amber-50/90 dark:bg-amber-950/30'}`}>
                    <p className="font-black text-amber-600 dark:text-amber-400 text-sm">
                        {isEn 
                            ? `Qibla is ${Math.round(sunDiff)}° away from the Sun` 
                            : `القبلة تبعد عن الشمس بـ ${Math.round(sunDiff)} درجة`}
                    </p>
                </div>
            </div>

            <div className={`app-page-card border-0 p-6 sm:p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden ${surfaceCardClass}`}>
                <div className={`absolute top-4 ${isEn ? 'left-4' : 'right-4'} text-blue-400 opacity-10`}><i className="fa-solid fa-moon text-6xl"></i></div>
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Moon' : 'تحديد القبلة عن طريق القمر'}
                </h3>
                
                <div
                    className="app-inner-3d-box border-0 mb-6 p-4 rounded-2xl max-w-sm"
                    style={{ backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.14 : 0.09) }}
                >
                    <p className="text-sm leading-relaxed font-bold" style={{ color: primaryColor }}>
                        {isEn 
                            ? 'Point your phone (red marker) toward the Moon to verify direction, then rotate your phone until the green Kaaba aligns with the red phone icon to face the Qibla.' 
                            : 'وجه هاتفك (العلامة الحمراء) نحو القمر في السماء لمطابقة الاتجاه، ثم أدر هاتفك نحو الكعبة الخضراء حتى تتطابق مع أيقونة الهاتف الحمراء لتكون متجهاً للقبلة.'}
                    </p>
                </div>
                
                <CompassDial targetHeading={moonHeading} targetType="moon" targetColor="#60a5fa" />

                <div className="w-full space-y-2.5 mb-4">
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Moon Direction:' : 'اتجاه القمر:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(moonHeading)}°</span>
                    </div>
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div
                    className="app-inner-3d-box border-0 p-4 rounded-2xl w-full"
                    style={{ backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.14 : 0.09) }}
                >
                    <p className="font-black text-sm" style={{ color: primaryColor }}>
                        {isEn 
                            ? `Qibla is ${Math.round(moonDiff)}° away from the Moon` 
                            : `القبلة تبعد عن القمر بـ ${Math.round(moonDiff)} درجة`}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ShadowQibla = ({ lat, lng, qiblaDirection, heading, theme }: any) => {
    const { language } = useLanguage();
    const isEn = language === 'en';
    const [time, setTime] = useState(new Date());
    const { isBlackTheme, primaryColor, surfaceCardClass, softRowClass } = getQiblaModeStyles(theme);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const sunPos = SunCalc.getPosition(time, lat, lng);
    const sunHeading = (sunPos.azimuth * 180 / Math.PI + 180) % 360;
    const shadowHeading = (sunHeading + 180) % 360;
    const shadowDiff = Math.abs((shadowHeading - qiblaDirection + 540) % 360 - 180);

    return (
        <div className={`app-page-card border-0 w-full shrink-0 flex flex-col items-center justify-start p-6 sm:p-8 rounded-3xl text-center relative overflow-hidden mb-4 ${surfaceCardClass}`} dir={isEn ? 'ltr' : 'rtl'}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <i className="fa-solid fa-person-rays text-[15rem]"></i>
            </div>
            
            <div className="z-10 flex flex-col items-center w-full">
                <h3 className="text-2xl font-black mb-4" style={{ color: primaryColor }}>
                    {isEn ? 'Qibla Direction by Shadow' : 'تحديد القبلة عن طريق الظل'}
                </h3>
                
                <div className={`app-inner-3d-box border-0 mb-6 p-4 rounded-2xl w-full max-w-md ${isBlackTheme ? 'bg-white/10' : 'bg-emerald-50/90 dark:bg-emerald-950/30'}`}>
                    <p className="text-sm leading-relaxed font-bold text-emerald-700 dark:text-emerald-300">
                        {isEn 
                            ? 'Place a stick vertically on flat ground; its shadow points opposite to the Sun. Point your phone (red marker) toward the shadow to verify direction, then rotate your phone until the green Kaaba aligns with the red phone icon to face the Qibla.' 
                            : 'ضع عصا بشكل عمودي على الأرض المستوية؛ ظل العصا يشير إلى الاتجاه المعاكس للشمس. وجه هاتفك (العلامة الحمراء) نحو الظل لمطابقة الاتجاه، ثم أدر هاتفك نحو الكعبة الخضراء حتى تتطابق مع أيقونة الهاتف الحمراء لتكون متجهاً للقبلة.'}
                    </p>
                </div>

                <div
                    className="relative w-[272px] h-[272px] sm:w-[292px] sm:h-[292px] rounded-full flex items-center justify-center mx-auto mt-12 mb-6 select-none"
                    style={{
                        background: isBlackTheme
                            ? 'linear-gradient(145deg, #3f3f46 0%, #18181b 52%, #09090b 100%)'
                            : 'linear-gradient(145deg, #ffffff 0%, #e2e8f0 55%, #cbd5e1 100%)',
                        padding: '10px',
                        boxShadow: isBlackTheme
                            ? '0 10px 0 #050507, 0 22px 36px rgba(0,0,0,0.78), inset 0 2px 3px rgba(255,255,255,0.22)'
                            : '0 10px 0 #cbd5e1, 0 22px 36px rgba(15,23,42,0.2), inset 0 2px 4px rgba(255,255,255,0.98)'
                    }}
                >
                    {/* Phone heading indicator (fixed above top rim, borderless 3D) */}
                    <div
                        className="border-0 absolute -top-10 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center pointer-events-none"
                    >
                        <Phone3DIcon size={38} />
                    </div>

                    {/* القرص الداخلي الغائر والمجسم */}
                    <div
                        className="relative w-full h-full rounded-full flex items-center justify-center"
                        style={{
                            background: isBlackTheme
                                ? 'radial-gradient(circle at 35% 28%, #27272a 0%, #18181b 58%, #09090b 100%)'
                                : 'radial-gradient(circle at 35% 28%, #ffffff 0%, #f8fafc 60%, #e2e8f0 100%)',
                            boxShadow: isBlackTheme
                                ? 'inset 0 6px 14px rgba(0,0,0,0.85), inset 0 -3px 8px rgba(255,255,255,0.08)'
                                : 'inset 0 6px 14px rgba(15,23,42,0.14), inset 0 -4px 10px rgba(255,255,255,0.95)'
                        }}
                    >
                        {/* حلقات زخرفية غائرة لتعزيز العمق */}
                        <div
                            className="absolute inset-5 rounded-full pointer-events-none"
                            style={{
                                border: isBlackTheme ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.07)',
                                boxShadow: isBlackTheme ? 'inset 0 1px 2px rgba(0,0,0,0.6)' : 'inset 0 1px 2px rgba(15,23,42,0.06)'
                            }}
                        />
                        <div
                            className="absolute inset-11 rounded-full pointer-events-none"
                            style={{
                                border: isBlackTheme ? '1px dashed rgba(255,255,255,0.07)' : '1px dashed rgba(15,23,42,0.06)'
                            }}
                        />

                        {/* لمعة زجاجية علوية */}
                        <div
                            className="absolute inset-1.5 rounded-full pointer-events-none"
                            style={{
                                background: isBlackTheme
                                    ? 'linear-gradient(155deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0) 44%)'
                                    : 'linear-gradient(155deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 46%)'
                            }}
                        />

                        {/* Rotating dial */}
                        <div className="absolute w-full h-full transition-transform duration-300 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                            {/* علامات التدريج المعدنية المجسمة */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 w-full h-1/2 pointer-events-none -translate-x-1/2"
                                    style={{ transform: `rotate(${i * 30}deg)`, transformOrigin: '50% 100%' }}
                                >
                                    <div
                                        className={`mx-auto rounded-full ${i % 3 === 0 ? 'w-1 h-2.5 mt-1 opacity-0' : 'w-0.5 h-2 mt-1.5'}`}
                                        style={{
                                            background: isBlackTheme ? 'rgba(255,255,255,0.28)' : 'rgba(148,163,184,0.65)',
                                            boxShadow: '0 1px 1px rgba(0,0,0,0.18)'
                                        }}
                                    />
                                </div>
                            ))}

                            {/* أحرف الاتجاهات المجسمة ثلاثية الأبعاد */}
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'N' : 'ش'} color={primaryColor} size={30} isPrimary />
                            </div>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'S' : 'ج'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                            </div>
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'W' : 'غ'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                            </div>
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                                <Compass3DLetter letter={isEn ? 'E' : 'ق'} color={isBlackTheme ? '#a1a1aa' : '#94a3b8'} size={24} />
                            </div>

                            {/* Qibla marker */}
                            <div className="absolute w-full h-full" style={{ transform: `rotate(${qiblaDirection}deg)` }}>
                                <div
                                    className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10 transition-transform duration-300 ease-out"
                                    style={{ transform: `rotate(${heading - qiblaDirection}deg)` }}
                                >
                                    <Kaaba3DIcon size={46} tone="emerald" />
                                </div>
                                {/* 3D Cylindrical Needle to Qibla */}
                                <div
                                    className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                                    style={{
                                        background: 'linear-gradient(90deg, #6ee7b7 0%, #10b981 55%, #047857 100%)',
                                        boxShadow: '0 2px 6px rgba(16,185,129,0.42)'
                                    }}
                                ></div>
                            </div>

                            {/* Shadow marker */}
                            <div className="absolute w-full h-full" style={{ transform: `rotate(${shadowHeading}deg)` }}>
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
                                    <Shadow3DIcon size={48} color={primaryColor} />
                                </div>
                                {/* 3D Cylindrical Needle to Shadow */}
                                <div
                                    className="absolute top-[74px] bottom-1/2 left-1/2 w-1.5 -translate-x-1/2 rounded-full"
                                    style={{
                                        background: isBlackTheme
                                            ? 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 55%, #64748b 100%)'
                                            : `linear-gradient(90deg, ${primaryColor}bb 0%, ${primaryColor} 60%, #0f172a88 100%)`,
                                        boxShadow: `0 2px 6px ${primaryColor}55`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* القبة المركزية المجسمة */}
                        <div className="absolute z-10 flex items-center justify-center pointer-events-none">
                            <Compass3DCenterDome color={primaryColor} size={26} />
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-2.5 mt-4">
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Current Shadow Direction:' : 'اتجاه الظل الحالي:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums">{Math.round(shadowHeading)}°</span>
                    </div>
                    <div className={`app-inner-3d-box border-0 flex justify-between items-center p-3.5 rounded-2xl ${softRowClass}`}>
                        <span className="text-sm font-bold opacity-80">{isEn ? 'Qibla Direction:' : 'اتجاه القبلة:'}</span>
                        <span className="font-mono text-lg font-black tabular-nums" style={{ color: primaryColor }}>{Math.round(qiblaDirection)}°</span>
                    </div>
                </div>

                <div 
                    className="app-inner-3d-box border-0 mt-4 p-4 rounded-2xl w-full"
                    style={{ backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.14 : 0.09) }}
                >
                    <p className="font-black text-sm" style={{ color: primaryColor }}>
                        {isEn 
                            ? `Qibla is ${Math.round(shadowDiff)}° away from the Shadow` 
                            : `القبلة تبعد عن الظل بـ ${Math.round(shadowDiff)} درجة`}
                    </p>
                </div>

            </div>
        </div>
    );
};
