import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Road, Vehicle, Incident, NewsArticle } from '../types';
import { Language, TRANSLATIONS, getLocalizedHighwayName } from '../translations';
import {
  Layers,
  Filter,
  Truck,
  AlertTriangle,
  Hospital,
  Warehouse,
  Shield,
  Maximize2,
  Minimize2,
  RefreshCw,
  Compass,
  Radio,
  Globe,
  Map as MapIcon,
  Flame,
  Newspaper,
  Download,
  HardDrive,
  WifiOff,
  Wifi
} from 'lucide-react';
import { DownloadOfflineMapModal } from './DownloadOfflineMapModal';
import {
  setupLeafletOfflineTileHandling,
  offlineMapManager,
  OfflineMapPackage
} from '../services/offlineMapService';
import { OfflineSyncService } from '../services/offlineSync';

export type GisViewMode = 'Satellite' | 'Road Map' | 'Accessibility Heatmap';
export type MapViewScope = 'world' | 'india' | 'ner';

interface GisMapProps {
  roads: Road[];
  vehicles: Vehicle[];
  incidents: Incident[];
  newsArticles?: NewsArticle[];
  onSelectRoad?: (road: Road) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectIncident?: (incident: Incident) => void;
  onSelectNewsArticle?: (article: NewsArticle) => void;
  onOpenNewsRadar?: () => void;
  selectedRoadId?: string | null;
  selectedVehicleId?: string | null;
  emergencyModeActive?: boolean;
  lang?: Language;
  initialViewMode?: GisViewMode;
  onViewModeChange?: (mode: GisViewMode) => void;
}

const TILE_CONFIGS: Record<
  GisViewMode,
  {
    url: string;
    attribution: string;
    maxZoom: number;
    subdomains?: string;
  }
> = {
  Satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  'Road Map': {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  },
  'Accessibility Heatmap': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB & OpenStreetMap contributors',
    subdomains: 'abcd',
    maxZoom: 19
  }
};

export const GisMap: React.FC<GisMapProps> = ({
  roads,
  vehicles,
  incidents,
  newsArticles = [],
  onSelectRoad,
  onSelectVehicle,
  onSelectIncident,
  onSelectNewsArticle,
  onOpenNewsRadar,
  selectedRoadId,
  selectedVehicleId,
  emergencyModeActive = false,
  lang = 'en',
  initialViewMode = 'Road Map',
  onViewModeChange
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const roadLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const newsLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeView, setActiveView] = useState<GisViewMode>(initialViewMode);
  const [activeScope, setActiveScope] = useState<MapViewScope>('ner');
  const [mapReady, setMapReady] = useState<boolean>(false);

  const currentLang: Language = (lang as Language) || ('en' as Language);
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;

  const [filters, setFilters] = useState({
    roads: true,
    vehicles: true,
    incidents: true,
    newsAlerts: true,
    weatherAlerts: true,
    hospitals: true,
    reliefCenters: true,
    bridges: true
  });

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Offline Map Tile Download & Cache States
  const [showOfflineDownloadModal, setShowOfflineDownloadModal] = useState(false);
  const [offlinePackages, setOfflinePackages] = useState<OfflineMapPackage[]>([]);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(OfflineSyncService.isSimulatedOffline());
  const [storageInfo, setStorageInfo] = useState<{ formattedSize: string; totalTiles: number }>({
    formattedSize: '0 KB',
    totalTiles: 0
  });

  // Listen for offline packages & simulation state
  useEffect(() => {
    const unsubPkgs = offlineMapManager.subscribe((pkgs) => {
      setOfflinePackages(pkgs);
      offlineMapManager.getStorageUsage().then((info) => {
        setStorageInfo({ formattedSize: info.formattedSize, totalTiles: info.totalTiles });
      });
    });

    const unsubSync = OfflineSyncService.subscribe((_, isOnline) => {
      setIsOfflineSimulated(OfflineSyncService.isSimulatedOffline());
    });

    return () => {
      unsubPkgs();
      unsubSync();
    };
  }, []);

  const handlePanToOfflineArea = (
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
    zoom?: number
  ) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.fitBounds(
      [
        [bounds.minLat, bounds.minLng],
        [bounds.maxLat, bounds.maxLng]
      ],
      { maxZoom: zoom || 9, padding: [30, 30] }
    );
  };

  const getCurrentMapBounds = () => {
    if (!mapInstanceRef.current) return null;
    const b = mapInstanceRef.current.getBounds();
    return {
      minLat: b.getSouth(),
      maxLat: b.getNorth(),
      minLng: b.getWest(),
      maxLng: b.getEast()
    };
  };

  // Initialize Global World Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Guard against React 19 / StrictMode remounts having leftover leaflet id
    if ((mapContainerRef.current as any)?._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Complete World Map with smooth zooming from global scale down to road-level precision
    const map = L.map(mapContainerRef.current, {
      center: [26.2, 92.5],
      zoom: 7,
      zoomControl: false,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create layer groups in order: heatmap underneath roads, markers, and news disruptions
    heatmapLayerGroupRef.current = L.layerGroup().addTo(map);
    roadLayerGroupRef.current = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = L.layerGroup().addTo(map);
    newsLayerGroupRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    // Automatic container resize observer to prevent grey tiles and layout clipping
    let resizeTimer: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      setMapReady(false);
      try {
        map.remove();
      } catch (e) {
        // ignore if already removed
      }
      mapInstanceRef.current = null;
      if (mapContainerRef.current && (mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // Synchronize Base Tile Layer with activeView
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    const config = TILE_CONFIGS[activeView];
    const newTileLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
      subdomains: config.subdomains || 'abc'
    }).addTo(map);

    // Enable CacheStorage tile interception and offline grid tile fallback
    setupLeafletOfflineTileHandling(newTileLayer);

    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;

    if (onViewModeChange) {
      onViewModeChange(activeView);
    }
  }, [activeView, mapReady, onViewModeChange]);

  // Update Map Elements & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !roadLayerGroupRef.current || !markerLayerGroupRef.current || !heatmapLayerGroupRef.current) return;

    roadLayerGroupRef.current.clearLayers();
    markerLayerGroupRef.current.clearLayers();
    heatmapLayerGroupRef.current.clearLayers();

    // ----------------------------------------------------
    // ACCESSIBILITY HEATMAP OVERLAY (When Heatmap view selected)
    // ----------------------------------------------------
    if (activeView === 'Accessibility Heatmap') {
      // 1. Accessibility Heat Flow Corridors
      roads.forEach((road) => {
        let auraColor = '#10b981'; // Green Accessible
        let coreColor = '#34d399';
        let auraWeight = 22;
        let auraOpacity = 0.4;

        if (road.status === 'MODERATE') {
          auraColor = '#eab308'; // Amber Caution
          coreColor = '#fde047';
          auraWeight = 24;
          auraOpacity = 0.5;
        } else if (road.status === 'HIGH_RISK') {
          auraColor = '#f97316'; // Orange High Risk
          coreColor = '#fb923c';
          auraWeight = 26;
          auraOpacity = 0.6;
        } else if (road.status === 'BLOCKED') {
          auraColor = '#ef4444'; // Red Blocked
          coreColor = '#f87171';
          auraWeight = 30;
          auraOpacity = 0.75;
        }

        // Ambient glow line
        const auraLine = L.polyline(road.coordinates, {
          color: auraColor,
          weight: auraWeight,
          opacity: auraOpacity,
          lineCap: 'round',
          lineJoin: 'round'
        });

        // Core line
        const coreLine = L.polyline(road.coordinates, {
          color: coreColor,
          weight: 7,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        });

        const localizedName = getLocalizedHighwayName(road.code, currentLang);
        const displayName = localizedName !== road.code ? `${road.code} (${localizedName})` : `${road.code} — ${road.name}`;

        auraLine.bindTooltip(
          `<div class="px-2.5 py-1.5 bg-black text-white text-xs border border-neutral-700 font-mono shadow-lg">
            <div class="font-bold text-[#ff3e00] uppercase tracking-wide">Accessibility Heat Profile</div>
            <div class="font-bold text-sm mt-0.5">${displayName}</div>
            <div class="flex items-center gap-2 mt-1">
              <span class="text-neutral-400">Flow Index:</span>
              <strong class="${road.status === 'BLOCKED' ? 'text-red-400' : road.status === 'HIGH_RISK' ? 'text-orange-400' : road.status === 'MODERATE' ? 'text-yellow-400' : 'text-emerald-400'}">
                ${100 - road.riskScore}% Accessibility
              </strong>
            </div>
            <div class="text-[10px] text-neutral-400 mt-0.5">Status: ${road.status} • Risk: ${road.riskScore}/100</div>
          </div>`,
          { sticky: true }
        );

        auraLine.on('click', () => {
          if (onSelectRoad) onSelectRoad(road);
        });

        heatmapLayerGroupRef.current?.addLayer(auraLine);
        heatmapLayerGroupRef.current?.addLayer(coreLine);
      });

      // 2. Multi-tier Heat Density Disruption Halos around Incidents
      incidents.forEach((inc) => {
        const isCrit = inc.severity === 'Critical' || inc.severity === 'High';
        const primaryColor = isCrit ? '#ef4444' : '#f59e0b';
        const midColor = isCrit ? '#dc2626' : '#d97706';
        const coreColor = isCrit ? '#991b1b' : '#b45309';

        const outerCircle = L.circle([inc.lat, inc.lng], {
          radius: 22000,
          fillColor: primaryColor,
          fillOpacity: 0.18,
          stroke: false
        });

        const midCircle = L.circle([inc.lat, inc.lng], {
          radius: 12000,
          fillColor: midColor,
          fillOpacity: 0.35,
          stroke: false
        });

        const coreCircle = L.circle([inc.lat, inc.lng], {
          radius: 4500,
          fillColor: coreColor,
          fillOpacity: 0.7,
          color: '#ffffff',
          weight: 1.5,
          dashArray: '4, 4'
        });

        coreCircle.bindTooltip(
          `<div class="p-2 bg-black border border-red-600 text-xs text-white font-mono leading-relaxed shadow-lg">
            <div class="text-red-400 font-bold uppercase">Hazard Disruption Hotspot</div>
            <div class="font-bold mt-0.5">${inc.type} — ${inc.incidentCode} (${inc.severity})</div>
            <div class="text-neutral-300 text-[11px] mt-0.5">${inc.description}</div>
            <div class="text-[10px] text-amber-400 font-bold mt-1">Impact: Direct Disruption (${isCrit ? '-75%' : '-45%'} Flow)</div>
          </div>`,
          { sticky: true }
        );

        coreCircle.on('click', () => {
          if (onSelectIncident) onSelectIncident(inc);
        });

        heatmapLayerGroupRef.current?.addLayer(outerCircle);
        heatmapLayerGroupRef.current?.addLayer(midCircle);
        heatmapLayerGroupRef.current?.addLayer(coreCircle);
      });

      // 3. Emergency Service Catchment Halos
      const strategicHospitals = [
        { name: 'Tawang District Hospital', lat: 27.586, lng: 91.86 },
        { name: 'Tomo Riba Institute, Itanagar', lat: 27.1, lng: 93.62 },
        { name: 'NEIGRIHMS Shillong', lat: 25.59, lng: 91.93 },
        { name: 'Guwahati Medical Central Depot', lat: 26.15, lng: 91.77 },
        { name: 'Kohima Civil Hospital', lat: 25.67, lng: 94.1 }
      ];

      strategicHospitals.forEach((h) => {
        const serviceHalo = L.circle([h.lat, h.lng], {
          radius: 16000,
          fillColor: '#06b6d4',
          fillOpacity: 0.16,
          color: '#22d3ee',
          weight: 1.5,
          dashArray: '5, 5'
        });

        serviceHalo.bindTooltip(
          `<div class="p-1.5 bg-black border border-cyan-500 text-xs text-cyan-200 font-mono shadow-lg">
            <div class="font-bold text-cyan-400 uppercase">Emergency Service Catchment</div>
            <div class="text-[11px] font-bold mt-0.5">${h.name}</div>
            <div class="text-[10px] text-neutral-400">16 km Rapid Response Radius</div>
          </div>`,
          { sticky: true }
        );

        heatmapLayerGroupRef.current?.addLayer(serviceHalo);
      });
    }

    // ----------------------------------------------------
    // 1. Draw Road Corridors (When enabled in filters)
    // ----------------------------------------------------
    if (filters.roads) {
      roads.forEach((road) => {
        let color = '#10b981'; // Green Accessible
        let weight = activeView === 'Satellite' ? 5 : 4;
        let dashArray: string | undefined = undefined;

        if (road.status === 'MODERATE') {
          color = '#eab308'; // Yellow
          weight = activeView === 'Satellite' ? 6 : 5;
        } else if (road.status === 'HIGH_RISK') {
          color = '#f97316'; // Orange
          weight = activeView === 'Satellite' ? 7 : 6;
        } else if (road.status === 'BLOCKED') {
          color = '#ef4444'; // Red
          weight = activeView === 'Satellite' ? 8 : 7;
          dashArray = '8, 8';
        }

        const isSelected = selectedRoadId === road.id;
        if (isSelected) {
          weight += 3;
        }

        // On Satellite view, add an outer dark outline for crisp contrast
        if (activeView === 'Satellite') {
          const casing = L.polyline(road.coordinates, {
            color: '#000000',
            weight: weight + 3,
            opacity: 0.8,
            lineJoin: 'round'
          });
          roadLayerGroupRef.current?.addLayer(casing);
        }

        const polyline = L.polyline(road.coordinates, {
          color,
          weight,
          opacity: isSelected ? 1.0 : activeView === 'Accessibility Heatmap' ? 0.7 : 0.9,
          dashArray,
          lineJoin: 'round'
        });

        const localizedName = getLocalizedHighwayName(road.code, currentLang);
        const roadTitle = localizedName !== road.code ? `${road.code} (${localizedName})` : `${road.code} — ${road.name}`;

        polyline.bindTooltip(
          `<div class="px-2 py-1 bg-slate-900 text-xs border border-slate-700 rounded font-sans shadow-lg">
            <strong class="text-cyan-400 font-bold">${roadTitle}</strong><br/>
            <span class="${road.status === 'BLOCKED' ? 'text-red-400 font-bold' : road.status === 'HIGH_RISK' ? 'text-orange-400' : road.status === 'MODERATE' ? 'text-yellow-400' : 'text-emerald-400'}">
              Status: ${road.status} (Risk: ${road.riskScore}/100)
            </span>
          </div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        polyline.on('click', () => {
          if (onSelectRoad) onSelectRoad(road);
        });

        roadLayerGroupRef.current?.addLayer(polyline);
      });
    }

    // ----------------------------------------------------
    // 2. Draw Vehicles
    // ----------------------------------------------------
    if (filters.vehicles) {
      vehicles.forEach((vehicle) => {
        const isEmergency = vehicle.type === 'EMERGENCY';
        const isSelected = selectedVehicleId === vehicle.id;

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-1.5 rounded-full ${
              vehicle.riskLevel === 'CRITICAL' || vehicle.status === 'DELAYED'
                ? 'bg-red-500 animate-ping opacity-75'
                : isEmergency
                ? 'bg-cyan-400/40'
                : 'bg-emerald-500/20'
            }"></div>
            <div class="relative w-8 h-8 rounded-full border-2 ${
              isSelected
                ? 'border-white ring-4 ring-cyan-500 bg-cyan-600'
                : isEmergency
                ? 'border-cyan-400 bg-slate-900 text-cyan-300'
                : 'border-emerald-400 bg-slate-900 text-emerald-300'
            } flex items-center justify-center shadow-lg shadow-black/80 font-mono text-[10px] font-bold">
              ${isEmergency ? '🚑' : '🚚'}
            </div>
            <div class="absolute -bottom-4 bg-slate-950/90 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap text-slate-200">
              ${vehicle.vehicleNumber}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-vehicle-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([vehicle.currentLocation.lat, vehicle.currentLocation.lng], { icon });

        marker.bindTooltip(
          `<div class="p-2 bg-slate-900 border border-slate-700 text-xs rounded text-slate-100 font-sans leading-relaxed shadow-lg">
            <div class="font-bold text-cyan-400">${vehicle.vehicleNumber} (${vehicle.type})</div>
            <div>Cargo: <span class="text-amber-300">${vehicle.cargo}</span></div>
            <div>Driver: ${vehicle.driverName}</div>
            <div>ETA: <span class="font-mono text-emerald-400">${vehicle.eta}</span> | Speed: ${vehicle.speedKmH} km/h</div>
            <div class="text-[10px] text-slate-400 mt-1">${vehicle.currentLocation.name}</div>
          </div>`,
          { sticky: true }
        );

        marker.on('click', () => {
          if (onSelectVehicle) onSelectVehicle(vehicle);
        });

        markerLayerGroupRef.current?.addLayer(marker);
      });
    }

    // ----------------------------------------------------
    // 3. Draw Incidents
    // ----------------------------------------------------
    if (filters.incidents) {
      incidents.forEach((incident) => {
        const isCritical = incident.severity === 'Critical' || incident.severity === 'High';

        const iconHtml = `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse opacity-60' : 'bg-amber-500/30'}"></div>
            <div class="relative w-8 h-8 rounded-full border-2 ${
              isCritical ? 'border-red-500 bg-red-950/90 text-red-200' : 'border-amber-400 bg-amber-950/90 text-amber-200'
            } flex items-center justify-center shadow-lg shadow-black text-xs font-bold">
              ${incident.type === 'Landslide' ? '⛰️' : incident.type === 'Flood' ? '🌊' : '⚠️'}
            </div>
            <div class="absolute -top-4 bg-red-950/90 text-[9px] px-1 py-0.2 rounded border border-red-800 text-red-300 font-mono">
              ${incident.severity.toUpperCase()}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-incident-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([incident.lat, incident.lng], { icon });

        marker.bindTooltip(
          `<div class="p-2 bg-slate-900 border border-red-800 text-xs rounded text-slate-100 font-sans leading-relaxed shadow-lg">
            <div class="font-bold text-red-400">${incident.incidentCode} — ${incident.type} (${incident.severity})</div>
            <div class="text-slate-300 text-[11px] mt-0.5">${incident.description}</div>
            <div class="text-[10px] text-amber-300 mt-1">Impact: ${incident.aiClassification?.roadImpact || 'High'}</div>
          </div>`,
          { sticky: true }
        );

        marker.on('click', () => {
          if (onSelectIncident) onSelectIncident(incident);
        });

        markerLayerGroupRef.current?.addLayer(marker);
      });
    }

    // ----------------------------------------------------
    // 4. Strategic Landmarks (Hospitals & Relief Hubs)
    // ----------------------------------------------------
    if (filters.hospitals) {
      const strategicHospitals = [
        { name: 'Tawang District Hospital', lat: 27.586, lng: 91.86, type: 'hospital' },
        { name: 'Tomo Riba Institute of Health Sciences, Itanagar', lat: 27.1, lng: 93.62, type: 'hospital' },
        { name: 'NEIGRIHMS Shillong', lat: 25.59, lng: 91.93, type: 'hospital' },
        { name: 'Guwahati Medical College & Central Depot', lat: 26.15, lng: 91.77, type: 'warehouse' },
        { name: 'Kohima District Civil Hospital', lat: 25.67, lng: 94.1, type: 'hospital' }
      ];

      strategicHospitals.forEach((h) => {
        const iconHtml = `
          <div class="w-6 h-6 rounded-md border border-cyan-400/80 bg-slate-900/90 text-cyan-300 flex items-center justify-center text-[10px] shadow">
            ${h.type === 'hospital' ? '🏥' : '🏢'}
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-hub-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([h.lat, h.lng], { icon });
        marker.bindTooltip(
          `<div class="p-1.5 bg-slate-900 border border-cyan-800 text-xs rounded text-cyan-200 shadow-lg">${h.name}</div>`,
          { sticky: true }
        );
        markerLayerGroupRef.current?.addLayer(marker);
      });
    }

    // 5. Live News Road Disruption Indicators (Strictly Indian territory)
    // ------------------------------------------------------------------
    if (newsLayerGroupRef.current) {
      newsLayerGroupRef.current.clearLayers();
      if (filters.newsAlerts && newsArticles && newsArticles.length > 0) {
        newsArticles.forEach((art) => {
          if (!art.coordinates || art.coordinates.length !== 2) return;
          const [lat, lng] = art.coordinates;
          // Guard: Strictly within Indian bounds
          if (lat < 8 || lat > 37.5 || lng < 68 || lng > 98) return;

          const isBlocked = art.detectedStatus === 'BLOCKED';
          const isHighRisk = art.detectedStatus === 'HIGH_RISK';
          const isCleared = art.detectedStatus === 'ACCESSIBLE';

          const markerBg = isBlocked
            ? 'bg-red-600'
            : isHighRisk
            ? 'bg-[#ff3e00]'
            : isCleared
            ? 'bg-emerald-600'
            : 'bg-yellow-500';
          const pulseRing = isBlocked
            ? 'bg-red-600 animate-ping opacity-75'
            : isHighRisk
            ? 'bg-[#ff3e00] animate-pulse opacity-60'
            : 'hidden';

          const iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="absolute -inset-2 rounded-full ${pulseRing}"></div>
              <div class="relative w-8 h-8 rounded-full border-2 border-black ${markerBg} text-white flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a] font-mono text-xs font-black">
                ${isBlocked ? '🚨' : isHighRisk ? '⚠️' : '📰'}
              </div>
              <div class="absolute -bottom-4 bg-black text-white text-[9px] px-1.5 py-0.5 border border-neutral-700 whitespace-nowrap font-mono font-bold uppercase shadow">
                ${art.extractedHighway}
              </div>
            </div>
          `;

          const icon = L.divIcon({
            html: iconHtml,
            className: 'custom-news-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([lat, lng], { icon });
          marker.bindTooltip(
            `<div class="p-2.5 bg-black border-2 border-white text-white font-mono text-xs max-w-xs shadow-2xl">
              <div class="flex items-center justify-between gap-2 border-b border-neutral-700 pb-1 mb-1.5">
                <span class="text-[#ff3e00] font-black uppercase text-[10px]">LIVE INDIA NEWS DISRUPTION</span>
                <span class="px-1.5 py-0.5 ${markerBg} text-white font-black text-[9px] uppercase">${art.detectedStatus}</span>
              </div>
              <div class="font-bold text-white text-xs mb-1">${art.title}</div>
              <div class="text-neutral-300 text-[11px] mb-1.5">${art.impactSummary}</div>
              <div class="text-[10px] text-neutral-400 border-t border-neutral-800 pt-1">
                <div><strong>Corridor:</strong> ${art.extractedHighway} • ${art.extractedLocation}</div>
                <div><strong>Source:</strong> 🇮🇳 ${art.source} • ${art.publishedAt}</div>
              </div>
            </div>`,
            { sticky: true }
          );

          marker.on('click', () => {
            if (onSelectNewsArticle) {
              onSelectNewsArticle(art);
            } else if (onOpenNewsRadar) {
              onOpenNewsRadar();
            }
          });

          newsLayerGroupRef.current?.addLayer(marker);
        });
      }
    }
  }, [
    roads,
    vehicles,
    incidents,
    newsArticles,
    filters,
    selectedRoadId,
    selectedVehicleId,
    activeView,
    lang,
    onSelectRoad,
    onSelectVehicle,
    onSelectIncident,
    onSelectNewsArticle,
    onOpenNewsRadar
  ]);

  const jumpToScope = (scope: MapViewScope) => {
    setActiveScope(scope);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (scope === 'world') {
      map.flyTo([20, 10], 2, { duration: 1.2 });
    } else if (scope === 'india') {
      map.flyTo([22.5, 82.5], 5, { duration: 1.0 });
    } else {
      map.flyTo([26.2, 92.5], 7, { duration: 0.8 });
    }
  };

  const resetView = () => {
    jumpToScope('ner');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
  };

  const activeNewsDisruptionsCount = newsArticles.filter(
    (a) => a.detectedStatus === 'BLOCKED' || a.detectedStatus === 'HIGH_RISK'
  ).length;

  return (
    <div
      id="gis-map-container"
      className={`relative w-full overflow-hidden border-2 border-black bg-neutral-900 transition-all duration-300 shadow-[4px_4px_0px_#0a0a0a] ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'h-[460px] md:h-[560px]'
      }`}
    >
      {/* Map Target */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Emergency Mode Banner Overlay */}
      {emergencyModeActive && (
        <div className="absolute top-3 left-3 right-3 z-10 bg-[#ff3e00] border-2 border-black px-3 py-2 flex items-center justify-between text-white shadow-[3px_3px_0px_#0a0a0a]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-white animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider font-mono">
              {t.emergency.activeTitle}
            </span>
          </div>
          <span className="text-[11px] text-white font-mono font-bold uppercase">{t.emergency.safetyGuideTitle}</span>
        </div>
      )}

      {/* Top Map Controls with Clear Category Labels */}
      <div
        className={`absolute ${
          emergencyModeActive ? 'top-14' : 'top-3'
        } left-3 z-10 flex flex-col gap-1.5 max-w-[calc(100%-145px)] pointer-events-auto`}
      >
        {/* View Mode Row with VIEW label */}
        <div className="flex items-center gap-1">
          <div className="bg-black text-white px-1.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] shrink-0">
            VIEW
          </div>
          <div
            id="gis-layer-toggle-control"
            className="flex items-center bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] p-0.5 gap-0.5"
            role="group"
            aria-label="Map Layer Control"
          >
            {(
              [
                { id: 'satellite', label: 'Satellite' as GisViewMode, display: 'Satellite', icon: Globe },
                { id: 'roadmap', label: 'Road Map' as GisViewMode, display: 'Roads', icon: MapIcon },
                { id: 'heatmap', label: 'Accessibility Heatmap' as GisViewMode, display: 'Heatmap', icon: Flame }
              ]
            ).map(({ id, label, display, icon: Icon }) => {
              const isActive = activeView === label;
              return (
                <button
                  key={id}
                  id={`btn-layer-${id}`}
                  type="button"
                  onClick={() => setActiveView(label)}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0a0a0a] text-white shadow-[1px_1px_0px_#ff3e00]'
                      : 'bg-transparent text-[#0a0a0a] hover:bg-neutral-100 hover:text-black'
                  }`}
                  title={`Switch to ${label} view`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#ff3e00]' : 'text-[#0a0a0a]'}`} />
                  <span>{display}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scope and Offline Row with SCOPE label */}
        <div className="flex items-center gap-1 flex-wrap">
          <div className="bg-black text-white px-1.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] shrink-0">
            SCOPE
          </div>
          <div
            id="gis-scope-control"
            className="flex items-center bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] p-0.5 gap-0.5"
            role="group"
            aria-label="Map View Scope"
          >
            <button
              type="button"
              id="btn-scope-ner"
              onClick={() => jumpToScope('ner')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                activeScope === 'ner'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#ff3e00]'
                  : 'bg-transparent text-black hover:bg-neutral-100'
              }`}
              title="Northeast India (NER) Focus"
            >
              <Compass className="w-3.5 h-3.5 text-[#ff3e00]" />
              <span>NER</span>
            </button>

            <button
              type="button"
              id="btn-scope-india"
              onClick={() => jumpToScope('india')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                activeScope === 'india'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#ff3e00]'
                  : 'bg-transparent text-black hover:bg-neutral-100'
              }`}
              title="All-India View"
            >
              <span>🇮🇳</span>
              <span>India</span>
            </button>

            <button
              type="button"
              id="btn-scope-world"
              onClick={() => jumpToScope('world')}
              className={`px-2 py-1 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer flex items-center gap-1 ${
                activeScope === 'world'
                  ? 'bg-black text-white shadow-[1px_1px_0px_#ff3e00]'
                  : 'bg-transparent text-black hover:bg-neutral-100'
              }`}
              title="Complete World Map"
            >
              <Globe className="w-3.5 h-3.5 text-[#ff3e00]" />
              <span>World</span>
            </button>
          </div>

          {/* Download Offline Map Area Button */}
          <button
            id="btn-download-offline-map-area"
            type="button"
            onClick={() => setShowOfflineDownloadModal(true)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs font-mono font-black uppercase transition-all whitespace-nowrap cursor-pointer bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a]"
            title="Download Offline Map Area (Cache Tiles for North Eastern Region)"
          >
            <Download className="w-3.5 h-3.5 text-[#ff3e00]" />
            <span>Offline</span>
            {offlinePackages.length > 0 && (
              <span className="px-1 py-0.2 bg-emerald-500 text-black text-[9px] font-black border border-black">
                {offlinePackages.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Offline Mode Active Banner */}
      {(isOfflineSimulated || (typeof navigator !== 'undefined' && !navigator.onLine)) && (
        <div className={`absolute ${emergencyModeActive ? 'top-20' : 'top-24 sm:top-16'} left-3 z-15 bg-amber-400 border-2 border-black px-2.5 py-1 flex items-center gap-2 text-black text-xs font-mono font-black shadow-[2px_2px_0px_#0a0a0a] animate-pulse`}>
          <WifiOff className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="hidden sm:inline">
            {t.gis.offlineModeActive || 'Offline Mode: Serving Cached Tiles'}
          </span>
          <span className="inline sm:hidden">Offline Mode</span>
          <button
            type="button"
            onClick={() => setShowOfflineDownloadModal(true)}
            className="px-1.5 py-0.2 bg-black text-white text-[9px] uppercase font-bold hover:bg-neutral-800 cursor-pointer"
          >
            Manage
          </button>
        </div>
      )}

      {/* Map Control Overlay (Top-Right) - Fully Labeled & Structured */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
        {onOpenNewsRadar && (
          <button
            id="btn-open-news-radar"
            type="button"
            onClick={onOpenNewsRadar}
            className="w-full px-2.5 py-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] transition-all flex items-center justify-between gap-2 text-xs font-black font-mono uppercase cursor-pointer"
            title="Open Live News & Disaster Disruption Radar"
          >
            <div className="flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-[#ff3e00] shrink-0" />
              <span>News Radar</span>
            </div>
            {activeNewsDisruptionsCount > 0 && (
              <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-black border border-black">
                {activeNewsDisruptionsCount}
              </span>
            )}
          </button>
        )}

        <button
          id="btn-map-filter"
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`w-full px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition-all flex items-center gap-1.5 text-xs font-black font-mono uppercase cursor-pointer ${
            showFilterDrawer
              ? 'bg-[#0a0a0a] text-white'
              : 'bg-white text-black hover:bg-neutral-100'
          }`}
          title={t.gis.layerControls}
        >
          <Filter className="w-3.5 h-3.5 shrink-0" />
          <span>GIS Layers</span>
        </button>

        <button
          id="btn-map-reset"
          onClick={resetView}
          className="w-full px-2.5 py-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] transition-colors flex items-center gap-1.5 text-xs font-black font-mono uppercase cursor-pointer"
          title="Reset to Northeast Regional Hub View"
        >
          <Compass className="w-4 h-4 text-[#ff3e00] shrink-0" />
          <span>Reset NER</span>
        </button>

        <button
          id="btn-map-fullscreen"
          onClick={toggleFullscreen}
          className="w-full px-2.5 py-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] transition-colors flex items-center gap-1.5 text-xs font-black font-mono uppercase cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-4 h-4 shrink-0" />
              <span>Exit Full</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-4 h-4 text-black shrink-0" />
              <span>Fullscreen</span>
            </>
          )}
        </button>
      </div>

      {/* Filter & Layer Selection Drawer */}
      {showFilterDrawer && (
        <div className="absolute top-3 right-3 z-30 w-72 max-w-[calc(100%-24px)] bg-white border-2 border-black p-4 shadow-[4px_4px_0px_#0a0a0a] text-xs font-mono space-y-3 text-[#0a0a0a]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <span className="font-black uppercase tracking-wider text-[#0a0a0a] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.gis.layerControls}
            </span>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="text-black hover:text-[#ff3e00] font-black text-sm"
            >
              ✕
            </button>
          </div>

          {/* Quick View Layer Selection inside Drawer */}
          <div className="border-b-2 border-neutral-200 pb-2.5">
            <span className="text-[10px] font-black uppercase text-neutral-500 block mb-1.5">
              Base View Mode
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(['Satellite', 'Road Map', 'Accessibility Heatmap'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setActiveView(mode)}
                  className={`px-1.5 py-1 text-[10px] font-mono font-bold uppercase border border-black transition-colors ${
                    activeView === mode
                      ? 'bg-black text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-black'
                  }`}
                >
                  {mode === 'Accessibility Heatmap' ? 'Heatmap' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase text-neutral-500 block mb-1">
              Visible Elements
            </span>
            {[
              { key: 'roads', label: 'Road Corridors', color: 'bg-emerald-600' },
              { key: 'vehicles', label: 'Active Fleet', color: 'bg-[#ff3e00]' },
              { key: 'incidents', label: 'Hazard Incidents', color: 'bg-black' },
              { key: 'newsAlerts', label: 'News Road Disruptions', color: 'bg-red-600' },
              { key: 'hospitals', label: 'Hospitals & Hubs', color: 'bg-blue-600' }
            ].map(({ key, label, color }) => (
              <label
                key={key}
                className="flex items-center justify-between p-1.5 border border-black bg-[#f4f4f4] hover:bg-neutral-100 cursor-pointer text-[#0a0a0a] font-bold uppercase text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 border border-black ${color}`} />
                  <span>{label}</span>
                </div>
                <input
                  type="checkbox"
                  checked={(filters as any)[key]}
                  onChange={(e) => setFilters({ ...filters, [key]: e.target.checked })}
                  className="rounded-none border-2 border-black text-black focus:ring-0 cursor-pointer"
                />
              </label>
            ))}
          </div>

          {/* Offline Area Cache Section in Drawer */}
          <div className="border-t-2 border-neutral-200 pt-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-neutral-500 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-[#ff3e00]" /> Offline Tile Cache
              </span>
              <span className="text-[10px] font-bold text-emerald-600">{storageInfo.formattedSize}</span>
            </div>
            <div className="text-[11px] text-neutral-600">
              {offlinePackages.length} North Eastern state {offlinePackages.length === 1 ? 'area' : 'areas'} cached
            </div>
            <button
              id="btn-drawer-download-offline-area"
              type="button"
              onClick={() => {
                setShowFilterDrawer(false);
                setShowOfflineDownloadModal(true);
              }}
              className="w-full py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 border border-black shadow-[2px_2px_0px_#ff3e00] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#ff3e00]" />
              <span>{t.gis.downloadOfflineArea || 'Download Offline Area'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Map Legend (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 z-10 bg-white border-2 border-black px-3 py-2 text-[10px] space-y-1.5 text-[#0a0a0a] font-mono font-bold uppercase shadow-[3px_3px_0px_#0a0a0a] pointer-events-none sm:pointer-events-auto">
        <div className="font-black text-black mb-1 flex items-center justify-between gap-2 border-b border-neutral-300 pb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#ff3e00] border border-black"></span>
            <span>{activeView === 'Accessibility Heatmap' ? 'Accessibility Heatmap' : t.gis.legendTitle}</span>
          </div>
          <span className="text-[9px] px-1 py-0.2 bg-neutral-900 text-white font-mono">
            {activeView === 'Accessibility Heatmap' ? 'HEATMAP' : activeView.toUpperCase()}
          </span>
        </div>

        {activeView === 'Accessibility Heatmap' ? (
          <div className="space-y-1.5 pt-0.5 min-w-[200px]">
            <div className="flex items-center justify-between text-[9px] font-bold">
              <span className="text-red-600 font-mono">0% Impassable</span>
              <span className="text-yellow-600 font-mono">50% Caution</span>
              <span className="text-emerald-600 font-mono">100% Free Flow</span>
            </div>
            <div className="w-full h-2 border border-black bg-gradient-to-r from-red-600 via-yellow-400 to-emerald-500 shadow-inner" />
            <div className="grid grid-cols-2 gap-2 text-[9px] pt-1 text-neutral-700">
              <div>
                <span>Corridor Flow: </span>
                <strong className="text-emerald-600">76% Avg</strong>
              </div>
              <div>
                <span>Hazard Halos: </span>
                <strong className="text-red-600">{incidents.length} Active</strong>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-emerald-600 border border-black"></span>
              <span>{t.status.accessible}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-yellow-500 border border-black"></span>
              <span>{t.status.moderate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-[#ff3e00] border border-black"></span>
              <span>{t.status.highRisk}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 bg-black border border-neutral-300"></span>
              <span>{t.status.blocked}</span>
            </div>
          </>
        )}
      </div>

      {/* Territorial Scope & World Map Guarantee (Bottom-Right, above Leaflet zoom) */}
      <div className="hidden md:flex absolute bottom-3 right-14 z-10 items-center gap-1.5 bg-black/90 text-white border-2 border-neutral-700 px-2.5 py-1 text-[10px] font-mono shadow-[2px_2px_0px_#000000]">
        <Globe className="w-3.5 h-3.5 text-[#ff3e00]" />
        <span>World Map Canvas</span>
        <span className="text-neutral-500">•</span>
        <span className="text-emerald-400 font-bold">🇮🇳 Road Blocks: India Only</span>
        {activeScope === 'world' && (
          <>
            <span className="text-neutral-500">•</span>
            <span className="text-[#ff3e00] font-bold uppercase animate-pulse">Global Scale</span>
          </>
        )}
      </div>

      {/* Offline Map Download Modal */}
      <DownloadOfflineMapModal
        isOpen={showOfflineDownloadModal}
        onClose={() => setShowOfflineDownloadModal(false)}
        lang={currentLang}
        currentMapViewBounds={getCurrentMapBounds()}
        onPanToState={handlePanToOfflineArea}
        activeLayerMode={activeView}
      />
    </div>
  );
};

