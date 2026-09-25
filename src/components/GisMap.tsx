import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Road, Vehicle, Incident, IncidentMediaItem, NewsArticle, UserLocation } from '../types';
import { Language, TRANSLATIONS, getLocalizedHighwayName, getLocalizedIncidentType, getLocalizedSeverity } from '../translations';
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
  Wifi,
  Crosshair,
  MapPin,
  Locate,
  Navigation,
  Menu,
  X,
  Camera,
  Video,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Info,
  ExternalLink,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { DownloadOfflineMapModal } from './DownloadOfflineMapModal';
import {
  setupLeafletOfflineTileHandling,
  offlineMapManager,
  OfflineMapPackage
} from '../services/offlineMapService';
import { OfflineSyncService } from '../services/offlineSync';
import { api } from '../services/api';
import { fetchIncidentMediaFromRepository } from '../services/mediaRepository';

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
  selectedIncidentId?: string | null;
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
  selectedIncidentId,
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
  const userLocationLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeView, setActiveView] = useState<GisViewMode>(initialViewMode);
  const [activeScope, setActiveScope] = useState<MapViewScope>('ner');
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Tactical Incident Recon Media Carousel States (In-Map)
  const [selectedMapIncident, setSelectedMapIncident] = useState<Incident | null>(() => {
    if (selectedIncidentId) {
      return incidents.find((i) => i.id === selectedIncidentId) || null;
    }
    return incidents.length > 0 ? incidents[0] : null;
  });
  const [showMapMediaDrawer, setShowMapMediaDrawer] = useState<boolean>(false);
  const [isMediaDrawerMinimized, setIsMediaDrawerMinimized] = useState<boolean>(false);
  const [mapMediaList, setMapMediaList] = useState<IncidentMediaItem[]>([]);
  const [loadingMapMedia, setLoadingMapMedia] = useState<boolean>(false);
  const [mapMediaFilter, setMapMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [mapActiveIndex, setMapActiveIndex] = useState<number>(0);
  const [isMapPlayingVideo, setIsMapPlayingVideo] = useState<boolean>(false);
  const [mapVideoProgress, setMapVideoProgress] = useState<number>(0);
  const [mapVideoCurrentSec, setMapVideoCurrentSec] = useState<number>(0);
  const [mapPlaybackSpeed, setMapPlaybackSpeed] = useState<number>(1);
  const [showMapSensorTelemetry, setShowMapSensorTelemetry] = useState<boolean>(false);
  const [mapImageErrorMap, setMapImageErrorMap] = useState<Record<string, boolean>>({});

  // Sync selectedIncidentId prop if provided
  useEffect(() => {
    if (selectedIncidentId) {
      const match = incidents.find((i) => i.id === selectedIncidentId);
      if (match) {
        setSelectedMapIncident(match);
        setShowMapMediaDrawer(true);
        setIsMediaDrawerMinimized(false);
      }
    }
  }, [selectedIncidentId, incidents]);

  // Fetch Incident Media for Selected Incident in Map
  useEffect(() => {
    if (!selectedMapIncident) {
      setMapMediaList([]);
      return;
    }

    let isMounted = true;
    setLoadingMapMedia(true);
    setMapActiveIndex(0);
    setIsMapPlayingVideo(false);
    setMapVideoProgress(0);
    setMapVideoCurrentSec(0);

    api
      .getIncidentMedia(selectedMapIncident)
      .then((res) => {
        if (isMounted) {
          if (res && res.media && res.media.length > 0) {
            setMapMediaList(res.media);
          } else {
            fetchIncidentMediaFromRepository(selectedMapIncident).then((fallback) => {
              if (isMounted) setMapMediaList(fallback);
            });
          }
          setLoadingMapMedia(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          fetchIncidentMediaFromRepository(selectedMapIncident).then((fallback) => {
            if (isMounted) {
              setMapMediaList(fallback);
              setLoadingMapMedia(false);
            }
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMapIncident]);

  // Filtered in-map media items
  const mapFilteredMedia = useMemo(() => {
    return mapMediaList.filter((item) => {
      if (mapMediaFilter === 'all') return true;
      return item.type === mapMediaFilter;
    });
  }, [mapMediaList, mapMediaFilter]);

  const activeMapMedia = mapFilteredMedia[mapActiveIndex] || mapFilteredMedia[0] || null;

  const mapTotalDurationSec = useMemo(() => {
    if (!activeMapMedia?.duration) return 45;
    const parts = activeMapMedia.duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 45;
  }, [activeMapMedia]);

  // In-map video simulation playback loop
  useEffect(() => {
    if (!isMapPlayingVideo || activeMapMedia?.type !== 'video') return;

    const interval = setInterval(() => {
      setMapVideoCurrentSec((prev) => {
        const next = prev + 0.25 * mapPlaybackSpeed;
        if (next >= mapTotalDurationSec) {
          setMapVideoProgress(0);
          return 0;
        }
        setMapVideoProgress((next / mapTotalDurationSec) * 100);
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isMapPlayingVideo, activeMapMedia, mapTotalDurationSec, mapPlaybackSpeed]);

  const handleMapPrevMedia = () => {
    if (mapFilteredMedia.length <= 1) return;
    setMapActiveIndex((prev) => (prev === 0 ? mapFilteredMedia.length - 1 : prev - 1));
    setIsMapPlayingVideo(false);
    setMapVideoProgress(0);
    setMapVideoCurrentSec(0);
  };

  const handleMapNextMedia = () => {
    if (mapFilteredMedia.length <= 1) return;
    setMapActiveIndex((prev) => (prev === mapFilteredMedia.length - 1 ? 0 : prev + 1));
    setIsMapPlayingVideo(false);
    setMapVideoProgress(0);
    setMapVideoCurrentSec(0);
  };

  const formatSecTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // User Geolocation States
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showLocationMenu, setShowLocationMenu] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [isLiveWatching, setIsLiveWatching] = useState<boolean>(false);
  const geoWatchIdRef = useRef<number | null>(null);

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
    bridges: true,
    userLocation: true
  });

  const [showMapMenu, setShowMapMenu] = useState(false);
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

    // Create layer groups in order: heatmap underneath roads, markers, news disruptions, and user location on top
    heatmapLayerGroupRef.current = L.layerGroup().addTo(map);
    roadLayerGroupRef.current = L.layerGroup().addTo(map);
    markerLayerGroupRef.current = L.layerGroup().addTo(map);
    newsLayerGroupRef.current = L.layerGroup().addTo(map);
    userLocationLayerGroupRef.current = L.layerGroup().addTo(map);

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
      if (geoWatchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      try {
        map.remove();
      } catch (e) {
        // ignore if already removed
      }
      mapInstanceRef.current = null;
      userLocationLayerGroupRef.current = null;
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
            <div class="mt-1 pt-1 border-t border-red-900 text-[9px] text-[#ff3e00] font-mono font-bold flex items-center gap-1">
              <span>📸 Click to view Recon Carousel & feeds</span>
            </div>
          </div>`,
          { sticky: true }
        );

        marker.on('click', () => {
          setSelectedMapIncident(incident);
          setShowMapMediaDrawer(true);
          setIsMediaDrawerMinimized(false);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([incident.lat, incident.lng], 12, { duration: 0.8 });
          }
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

  // ----------------------------------------------------
  // Helper: Haversine distance in KM
  // ----------------------------------------------------
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // ----------------------------------------------------
  // Helper: Match or approximate location to named regions
  // ----------------------------------------------------
  const getApproximatePlaceName = (lat: number, lng: number): string => {
    const landmarks = [
      { name: 'Guwahati (NER Central Logistics Hub), Assam', lat: 26.1445, lng: 91.7362, radius: 0.35 },
      { name: 'Dispur (Capital Complex), Assam', lat: 26.1408, lng: 91.7904, radius: 0.15 },
      { name: 'Jalukbari Inter-State Terminal, Guwahati', lat: 26.155, lng: 91.662, radius: 0.2 },
      { name: 'Khanapara (Assam-Meghalaya Gateway)', lat: 26.113, lng: 91.821, radius: 0.2 },
      { name: 'Shillong Logistics Depot, Meghalaya', lat: 25.5788, lng: 91.8933, radius: 0.3 },
      { name: 'Tawang Strategic Base, Arunachal Pradesh', lat: 27.586, lng: 91.86, radius: 0.3 },
      { name: 'Bhalukpong Checkpost, Arunachal Pradesh', lat: 27.014, lng: 92.645, radius: 0.25 },
      { name: 'Bomdila Mountain Corridor, Arunachal', lat: 27.264, lng: 92.422, radius: 0.25 },
      { name: 'Itanagar Administrative Hub, Arunachal', lat: 27.0844, lng: 93.6053, radius: 0.3 },
      { name: 'Tezpur Transit Depot, Assam', lat: 26.6528, lng: 92.7926, radius: 0.3 },
      { name: 'Silchar Distribution Center, Assam', lat: 24.8333, lng: 92.7789, radius: 0.3 },
      { name: 'Kohima District Center, Nagaland', lat: 25.6751, lng: 94.1086, radius: 0.3 },
      { name: 'Dimapur Freight Railhead, Nagaland', lat: 25.9095, lng: 93.7266, radius: 0.3 },
      { name: 'Imphal Valley Relief Hub, Manipur', lat: 24.817, lng: 93.9368, radius: 0.3 },
      { name: 'Aizawl Regional Depot, Mizoram', lat: 23.7271, lng: 92.7176, radius: 0.3 },
      { name: 'Agartala Border Center, Tripura', lat: 23.8315, lng: 91.2868, radius: 0.3 },
      { name: 'Gangtok Mountain Hub, Sikkim', lat: 27.3389, lng: 88.6065, radius: 0.3 }
    ];

    for (const place of landmarks) {
      const dLat = Math.abs(lat - place.lat);
      const dLng = Math.abs(lng - place.lng);
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist <= place.radius) {
        return place.name;
      }
    }

    if (lat >= 24 && lat <= 29 && lng >= 89 && lng <= 97) {
      return `North Eastern Region (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
    }
    return `Location (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`;
  };

  // ----------------------------------------------------
  // Presets & Geolocation Handlers
  // ----------------------------------------------------
  const setPresetLocation = (key: 'guwahati' | 'dispur' | 'tawang' | 'shillong' | 'itanagar') => {
    const presets: Record<string, { lat: number; lng: number; name: string }> = {
      guwahati: { lat: 26.1445, lng: 91.7362, name: 'Guwahati Metro, Assam (NER Hub)' },
      dispur: { lat: 26.1408, lng: 91.7904, name: 'Dispur Capital Complex, Assam' },
      tawang: { lat: 27.586, lng: 91.86, name: 'Tawang Logistics Depot, Arunachal Pradesh' },
      shillong: { lat: 25.5788, lng: 91.8933, name: 'Shillong Tactical Hub, Meghalaya' },
      itanagar: { lat: 27.0844, lng: 93.6053, name: 'Itanagar Civil Center, Arunachal Pradesh' }
    };
    const target = presets[key] || presets.guwahati;
    const loc: UserLocation = {
      lat: target.lat,
      lng: target.lng,
      accuracy: 15,
      timestamp: Date.now(),
      address: target.name,
      source: 'preset'
    };
    setUserLocation(loc);
    setShowLocationMenu(false);
    setLocationMessage(`📍 Location set to: ${target.name}`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 14, { duration: 1.2 });
    }
    setTimeout(() => setLocationMessage(null), 4000);
  };

  const locateUserViaGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by this browser. Showing Guwahati Hub.');
      setPresetLocation('guwahati');
      setTimeout(() => setLocationMessage(null), 4000);
      return;
    }

    setIsLocating(true);
    setLocationMessage('Acquiring high-precision GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 20);
        const placeName = getApproximatePlaceName(lat, lng);

        const loc: UserLocation = {
          lat,
          lng,
          accuracy,
          timestamp: pos.timestamp || Date.now(),
          address: placeName,
          source: 'gps'
        };

        setUserLocation(loc);
        setIsLocating(false);
        setLocationMessage(`📍 GPS Located: ${placeName} (±${accuracy}m)`);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
        }

        setTimeout(() => setLocationMessage(null), 4500);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation notice:', err.message);
        let notice = 'Could not acquire GPS position. Displaying Guwahati Hub.';
        if (err.code === 1) {
          notice = 'Location permission denied. Showing Guwahati Hub (Assam).';
        } else if (err.code === 2) {
          notice = 'GPS position unavailable. Showing Guwahati Hub (Assam).';
        } else if (err.code === 3) {
          notice = 'GPS timeout. Showing Guwahati Hub (Assam).';
        }
        setLocationMessage(notice);
        // Automatic fallback to Guwahati as requested
        setPresetLocation('guwahati');
        setTimeout(() => setLocationMessage(null), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const toggleLiveTracking = () => {
    if (isLiveWatching) {
      if (geoWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      setIsLiveWatching(false);
      setLocationMessage('Live location tracking paused.');
      setTimeout(() => setLocationMessage(null), 3000);
    } else {
      if (!navigator.geolocation) {
        setLocationMessage('Geolocation not supported by browser.');
        setTimeout(() => setLocationMessage(null), 3000);
        return;
      }
      setIsLiveWatching(true);
      setLocationMessage('Live GPS tracking enabled.');
      setTimeout(() => setLocationMessage(null), 3000);
      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy || 20);
          const placeName = getApproximatePlaceName(lat, lng);
          setUserLocation({
            lat,
            lng,
            accuracy,
            timestamp: pos.timestamp || Date.now(),
            address: placeName,
            source: 'gps'
          });
        },
        (err) => {
          console.warn('Watch position notice:', err.message);
          setIsLiveWatching(false);
        },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }
  };

  // ----------------------------------------------------
  // Render User Location Layer on Map
  // ----------------------------------------------------
  useEffect(() => {
    const layer = userLocationLayerGroupRef.current;
    if (!layer || !mapInstanceRef.current) return;
    layer.clearLayers();

    if (!userLocation || !filters.userLocation) return;

    const { lat, lng, accuracy, address, source, timestamp } = userLocation;

    // 1. Accuracy Circle with animated radar boundary
    const circle = L.circle([lat, lng], {
      radius: Math.max(accuracy, 25),
      color: '#2563eb',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 2,
      dashArray: '4, 4'
    });
    layer.addLayer(circle);

    // 2. High-visibility Tactical Marker with glowing radar rings
    const iconHtml = `
      <div class="relative flex items-center justify-center cursor-pointer group" style="width: 36px; height: 36px;">
        <div class="absolute -inset-3 rounded-full bg-blue-500/25 animate-ping pointer-events-none"></div>
        <div class="absolute -inset-1 rounded-full bg-blue-600/40 animate-pulse pointer-events-none"></div>
        <div class="relative w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.9)] font-black">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7" stroke-width="2.5" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          </svg>
          <div class="absolute w-2 h-2 rounded-full bg-cyan-300 ring-1 ring-blue-800"></div>
        </div>
        <div class="absolute -bottom-5 bg-black/95 text-white font-mono text-[9px] font-black uppercase px-2 py-0.5 border border-blue-400 whitespace-nowrap shadow-md flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          YOU ARE HERE
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'custom-user-location-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const marker = L.marker([lat, lng], { icon, zIndexOffset: 1500 });

    // Calculate proximity to key logistical assets
    let nearestRoadStr = 'Corridor Grid';
    let minRoadDist = Infinity;
    roads.forEach((r) => {
      if (r.coordinates && r.coordinates.length > 0) {
        r.coordinates.forEach(([cLat, cLng]) => {
          const d = calculateDistanceKm(lat, lng, cLat, cLng);
          if (d < minRoadDist) {
            minRoadDist = d;
            nearestRoadStr = `${r.code} (${r.name}) • ${d} km away`;
          }
        });
      }
    });

    let nearestVehicleStr = 'No active vehicles nearby';
    let minVehDist = Infinity;
    vehicles.forEach((v) => {
      const d = calculateDistanceKm(lat, lng, v.currentLocation.lat, v.currentLocation.lng);
      if (d < minVehDist) {
        minVehDist = d;
        nearestVehicleStr = `${v.vehicleNumber} (${v.type}) • ${d} km away`;
      }
    });

    marker.bindTooltip(
      `<div class="p-3 bg-black border-2 border-blue-500 text-white font-mono text-xs max-w-xs shadow-2xl">
        <div class="flex items-center justify-between gap-2 border-b border-neutral-700 pb-1.5 mb-2">
          <span class="text-cyan-400 font-black uppercase text-[11px] flex items-center gap-1">
            📍 YOUR CURRENT LOCATION
          </span>
          <span class="px-1.5 py-0.5 ${source === 'gps' ? 'bg-blue-600' : 'bg-emerald-600'} text-white font-black text-[9px] uppercase">
            ${source === 'gps' ? 'LIVE GPS' : 'PRESET'}
          </span>
        </div>
        <div class="font-bold text-white text-xs mb-1.5">${address || 'Detected Position'}</div>
        <div class="text-neutral-300 text-[11px] space-y-1 mb-2 font-mono">
          <div><strong>Coordinates:</strong> ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E</div>
          <div><strong>GPS Accuracy:</strong> ±${accuracy} meters</div>
          <div><strong>Time:</strong> ${new Date(timestamp).toLocaleTimeString()}</div>
        </div>
        <div class="text-[10px] text-cyan-300 bg-blue-950/70 border border-blue-800 p-1.5 space-y-0.5">
          <div><strong>Nearest Corridor:</strong> ${nearestRoadStr}</div>
          <div><strong>Nearest Fleet Unit:</strong> ${nearestVehicleStr}</div>
        </div>
      </div>`,
      { sticky: true }
    );

    marker.on('click', () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.0 });
      }
    });

    layer.addLayer(marker);
  }, [userLocation, filters.userLocation, roads, vehicles]);

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

      {/* Offline Mode Active Banner (Compact top-left) */}
      {(isOfflineSimulated || (typeof navigator !== 'undefined' && !navigator.onLine)) && (
        <div className={`absolute ${emergencyModeActive ? 'top-14' : 'top-3'} left-3 z-15 bg-amber-400 border-2 border-black px-2.5 py-1 flex items-center gap-2 text-black text-xs font-mono font-black shadow-[2px_2px_0px_#0a0a0a] animate-pulse pointer-events-auto`}>
          <WifiOff className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="hidden sm:inline">
            {t.gis.offlineModeActive || 'Offline Mode: Cached Tiles'}
          </span>
          <span className="inline sm:hidden">Offline</span>
          <button
            type="button"
            onClick={() => setShowOfflineDownloadModal(true)}
            className="px-1.5 py-0.2 bg-black text-white text-[9px] uppercase font-bold hover:bg-neutral-800 cursor-pointer"
          >
            Manage
          </button>
        </div>
      )}

      {/* Top-Right Corner Controls: LOCATE ME + 3-LINE MENU BUTTON */}
      <div className={`absolute ${emergencyModeActive ? 'top-14' : 'top-3'} right-3 z-20 flex items-center gap-1.5 pointer-events-auto`}>
        {/* User Geolocation Action Button with Dropdown */}
        <div className="relative">
          <div className="flex items-stretch border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
            <button
              id="btn-my-location"
              type="button"
              onClick={() => {
                if (userLocation && mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.0 });
                } else {
                  locateUserViaGps();
                }
              }}
              className={`px-2.5 py-1.5 transition-all flex items-center gap-1.5 text-xs font-black font-mono uppercase cursor-pointer ${
                userLocation
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : isLocating
                  ? 'bg-amber-300 text-black animate-pulse'
                  : 'bg-white hover:bg-neutral-100 text-black'
              }`}
              title="Access GPS location and show on map"
            >
              <Crosshair className={`w-3.5 h-3.5 shrink-0 ${isLocating ? 'animate-spin text-black' : userLocation ? 'text-white' : 'text-blue-600'}`} />
              <span className="truncate">{isLocating ? 'Locating...' : userLocation ? 'My Location' : 'Locate Me'}</span>
            </button>
            <button
              type="button"
              id="btn-location-dropdown-toggle"
              onClick={(e) => {
                e.stopPropagation();
                setShowLocationMenu(!showLocationMenu);
                setShowMapMenu(false);
              }}
              className={`px-1.5 border-l border-black flex items-center justify-center cursor-pointer ${
                userLocation ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-neutral-100 hover:bg-neutral-200 text-black'
              }`}
              title="Location options"
            >
              <span className="text-[10px] font-mono">▼</span>
            </button>
          </div>

          {/* Location Dropdown Menu */}
          {showLocationMenu && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] z-40 p-2 text-xs font-mono text-black space-y-1.5">
              <div className="font-black uppercase text-[10px] text-neutral-500 border-b border-neutral-200 pb-1 flex items-center justify-between">
                <span>Location Access</span>
                <button
                  type="button"
                  onClick={() => setShowLocationMenu(false)}
                  className="text-neutral-400 hover:text-black font-bold"
                >
                  ✕
                </button>
              </div>

              <button
                type="button"
                id="btn-detect-gps-opt"
                onClick={() => {
                  setShowLocationMenu(false);
                  locateUserViaGps();
                }}
                className="w-full text-left px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 font-bold flex items-center gap-2 cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="truncate">
                  <div className="text-[11px] font-black uppercase">Detect Live GPS</div>
                  <div className="text-[9px] text-blue-700 font-normal">Browser navigator.geolocation</div>
                </div>
              </button>

              <div className="text-[9px] font-black uppercase text-neutral-500 pt-1 border-t border-neutral-100">
                Regional Presets:
              </div>

              <button
                type="button"
                id="btn-preset-dispur"
                onClick={() => setPresetLocation('dispur')}
                className="w-full text-left px-2 py-1 hover:bg-neutral-100 border border-neutral-200 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>📍 Dispur Capital</span>
                <span className="text-[9px] text-neutral-500 font-mono">Assam</span>
              </button>

              <button
                type="button"
                id="btn-preset-tawang"
                onClick={() => setPresetLocation('tawang')}
                className="w-full text-left px-2 py-1 hover:bg-neutral-100 border border-neutral-200 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>📍 Tawang Depot</span>
                <span className="text-[9px] text-neutral-500 font-mono">Arunachal</span>
              </button>

              <button
                type="button"
                id="btn-preset-shillong"
                onClick={() => setPresetLocation('shillong')}
                className="w-full text-left px-2 py-1 hover:bg-neutral-100 border border-neutral-200 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>📍 Shillong Hub</span>
                <span className="text-[9px] text-neutral-500 font-mono">Meghalaya</span>
              </button>

              <button
                type="button"
                id="btn-preset-itanagar"
                onClick={() => setPresetLocation('itanagar')}
                className="w-full text-left px-2 py-1 hover:bg-neutral-100 border border-neutral-200 font-medium flex items-center justify-between cursor-pointer"
              >
                <span>📍 Itanagar Center</span>
                <span className="text-[9px] text-neutral-500 font-mono">Arunachal</span>
              </button>
            </div>
          )}
        </div>

        {/* Tactical Recon Feeds Button */}
        <div className="relative">
          <button
            id="btn-gis-recon-feeds"
            type="button"
            onClick={() => {
              if (!selectedMapIncident && incidents.length > 0) {
                setSelectedMapIncident(incidents[0]);
              }
              setShowMapMediaDrawer(!showMapMediaDrawer);
              setIsMediaDrawerMinimized(false);
              setShowMapMenu(false);
              setShowLocationMenu(false);
            }}
            className={`px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition-all flex items-center gap-1.5 text-xs font-black font-mono uppercase cursor-pointer ${
              showMapMediaDrawer
                ? 'bg-[#ff3e00] text-white shadow-[2px_2px_0px_#0a0a0a]'
                : 'bg-white hover:bg-neutral-100 text-black'
            }`}
            title="Inspect 4K Drone, Dashcam & Satellite Feeds"
          >
            <Camera className={`w-4 h-4 shrink-0 ${showMapMediaDrawer ? 'text-white' : 'text-[#ff3e00]'}`} />
            <span className="hidden sm:inline font-mono font-black">RECON FEEDS</span>
            <span className={`px-1 py-0.2 text-[9px] font-black border ${showMapMediaDrawer ? 'bg-black text-white border-white' : 'bg-black text-white border-black'}`}>
              {incidents.length}
            </span>
          </button>
        </div>

        {/* 3-Line Menu Button */}
        <div className="relative">
          <button
            id="btn-gis-3line-menu"
            type="button"
            onClick={() => {
              setShowMapMenu(!showMapMenu);
              setShowLocationMenu(false);
            }}
            className={`px-2.5 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition-all flex items-center gap-1.5 text-xs font-black font-mono uppercase cursor-pointer ${
              showMapMenu
                ? 'bg-black text-white shadow-[2px_2px_0px_#ff3e00]'
                : 'bg-white hover:bg-neutral-100 text-black'
            }`}
            title="Map Controls & GIS Layers Menu"
            aria-expanded={showMapMenu}
          >
            <Menu className={`w-4 h-4 shrink-0 ${showMapMenu ? 'text-[#ff3e00]' : 'text-black'}`} />
            <span className="hidden sm:inline font-mono font-black">MENU</span>
            {(activeNewsDisruptionsCount > 0 || offlinePackages.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-[#ff3e00] animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {/* 3-Line Menu Popover (All Map Controls Organized in Order) */}
      {showMapMenu && (
        <div
          id="gis-map-menu-dropdown"
          className="absolute top-12 right-3 z-30 w-80 max-w-[calc(100%-24px)] max-h-[calc(100%-60px)] overflow-y-auto bg-white border-2 border-black p-3.5 shadow-[4px_4px_0px_#0a0a0a] text-xs font-mono text-black space-y-3.5 pointer-events-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <div className="flex items-center gap-2 font-black uppercase text-xs">
              <Menu className="w-4 h-4 text-[#ff3e00]" />
              <span>Map Controls & Tools</span>
            </div>
            <button
              type="button"
              id="btn-close-map-menu"
              onClick={() => setShowMapMenu(false)}
              className="text-neutral-500 hover:text-black font-black text-sm p-0.5 cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 1. VIEW MODE (Satellite | Roads | Heatmap) */}
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 font-black text-black">
                <span>VIEW</span>
              </span>
              <span className="text-[9px] text-neutral-400 uppercase">Basemap Layer</span>
            </div>
            <div
              id="gis-layer-toggle-control"
              className="grid grid-cols-3 gap-1 bg-[#f4f4f4] p-1 border-2 border-black"
              role="group"
              aria-label="Map Layer Control"
            >
              {[
                { id: 'satellite', label: 'Satellite' as GisViewMode, display: 'Satellite', icon: Globe },
                { id: 'roadmap', label: 'Road Map' as GisViewMode, display: 'Roads', icon: MapIcon },
                { id: 'heatmap', label: 'Accessibility Heatmap' as GisViewMode, display: 'Heatmap', icon: Flame }
              ].map(({ id, label, display, icon: Icon }) => {
                const isActive = activeView === label;
                return (
                  <button
                    key={id}
                    id={`btn-layer-${id}`}
                    type="button"
                    onClick={() => setActiveView(label)}
                    className={`flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#0a0a0a] text-white border-black shadow-[1px_1px_0px_#ff3e00]'
                        : 'bg-white text-[#0a0a0a] hover:bg-neutral-100 border-neutral-300'
                    }`}
                    title={`Switch to ${label} view`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#ff3e00]' : 'text-neutral-700'}`} />
                    <span>{display}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. MAP SCOPE (NER | India | World) */}
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1 font-black text-black">
                <span>SCOPE</span>
              </span>
              <span className="text-[9px] text-neutral-400 uppercase">Geographic Region</span>
            </div>
            <div
              id="gis-scope-control"
              className="grid grid-cols-3 gap-1 bg-[#f4f4f4] p-1 border-2 border-black"
              role="group"
              aria-label="Map View Scope"
            >
              <button
                type="button"
                id="btn-scope-ner"
                onClick={() => jumpToScope('ner')}
                className={`flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer border ${
                  activeScope === 'ner'
                    ? 'bg-black text-white border-black shadow-[1px_1px_0px_#ff3e00]'
                    : 'bg-white text-black hover:bg-neutral-100 border-neutral-300'
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
                className={`flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer border ${
                  activeScope === 'india'
                    ? 'bg-black text-white border-black shadow-[1px_1px_0px_#ff3e00]'
                    : 'bg-white text-black hover:bg-neutral-100 border-neutral-300'
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
                className={`flex items-center justify-center gap-1 py-1.5 text-[10px] sm:text-xs font-mono font-black uppercase transition-all cursor-pointer border ${
                  activeScope === 'world'
                    ? 'bg-black text-white border-black shadow-[1px_1px_0px_#ff3e00]'
                    : 'bg-white text-black hover:bg-neutral-100 border-neutral-300'
                }`}
                title="Complete World Map"
              >
                <Globe className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span>World</span>
              </button>
            </div>
          </div>

          {/* 3. QUICK TOOLS (Offline | News Radar | Reset NER | Fullscreen) */}
          <div>
            <div className="text-[10px] font-black uppercase text-neutral-600 mb-1">
              <span className="font-black text-black">QUICK TOOLS</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {/* Offline Pack Button */}
              <button
                id="btn-download-offline-map-area"
                type="button"
                onClick={() => {
                  setShowOfflineDownloadModal(true);
                  setShowMapMenu(false);
                }}
                className="flex items-center justify-between px-2 py-2 text-[11px] font-mono font-black uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
                title="Download Offline Map Tiles"
              >
                <div className="flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#ff3e00] shrink-0" />
                  <span>Offline</span>
                </div>
                {offlinePackages.length > 0 && (
                  <span className="px-1 py-0.2 bg-emerald-500 text-black text-[9px] font-black border border-black">
                    {offlinePackages.length}
                  </span>
                )}
              </button>

              {/* News Radar Button */}
              {onOpenNewsRadar ? (
                <button
                  id="btn-open-news-radar"
                  type="button"
                  onClick={() => {
                    onOpenNewsRadar();
                    setShowMapMenu(false);
                  }}
                  className="flex items-center justify-between px-2 py-2 text-[11px] font-mono font-black uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
                  title="Open Live News & Disaster Disruption Radar"
                >
                  <div className="flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-[#ff3e00] shrink-0" />
                    <span>News Radar</span>
                  </div>
                  {activeNewsDisruptionsCount > 0 && (
                    <span className="px-1 py-0.2 bg-red-600 text-white text-[9px] font-black border border-black">
                      {activeNewsDisruptionsCount}
                    </span>
                  )}
                </button>
              ) : (
                <div />
              )}

              {/* Reset NER Button */}
              <button
                id="btn-map-reset"
                type="button"
                onClick={resetView}
                className="flex items-center gap-1.5 px-2 py-2 text-[11px] font-mono font-black uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
                title="Reset to Northeast Regional Hub View"
              >
                <Compass className="w-3.5 h-3.5 text-[#ff3e00] shrink-0" />
                <span>Reset NER</span>
              </button>

              {/* Fullscreen Button */}
              <button
                id="btn-map-fullscreen"
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-2 py-2 text-[11px] font-mono font-black uppercase bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Exit Full</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-black shrink-0" />
                    <span>Fullscreen</span>
                  </>
                )}
              </button>

              {/* Recon Feeds Quick Tool */}
              <button
                id="btn-menu-recon-feeds"
                type="button"
                onClick={() => {
                  if (!selectedMapIncident && incidents.length > 0) {
                    setSelectedMapIncident(incidents[0]);
                  }
                  setShowMapMediaDrawer(true);
                  setIsMediaDrawerMinimized(false);
                  setShowMapMenu(false);
                }}
                className="col-span-2 flex items-center justify-between px-2 py-2 text-[11px] font-mono font-black uppercase bg-[#f4f4f4] hover:bg-neutral-200 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
                title="Open 4K Recon Media Carousel & Feeds"
              >
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#ff3e00] shrink-0" />
                  <span>Tactical Recon Feeds</span>
                </div>
                <span className="px-1.5 py-0.2 bg-[#ff3e00] text-white text-[9px] font-black border border-black">
                  {incidents.length} Incidents
                </span>
              </button>
            </div>
          </div>

          {/* 4. GIS LAYERS */}
          <div className="border-t-2 border-neutral-200 pt-2.5">
            <div className="text-[10px] font-black uppercase text-neutral-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-black text-black">
                <Filter className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span>GIS LAYERS</span>
              </span>
              <span className="text-[9px] text-neutral-400 uppercase">Feature Filters</span>
            </div>
            <div className="space-y-1">
              {[
                { key: 'roads', label: 'Road Corridors', color: 'bg-emerald-600' },
                { key: 'vehicles', label: 'Active Fleet', color: 'bg-[#ff3e00]' },
                { key: 'incidents', label: 'Hazard Incidents', color: 'bg-black' },
                { key: 'newsAlerts', label: 'News Road Disruptions', color: 'bg-red-600' },
                { key: 'hospitals', label: 'Hospitals & Hubs', color: 'bg-blue-600' },
                { key: 'userLocation', label: 'User GPS Location', color: 'bg-blue-500' }
              ].map(({ key, label, color }) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-1.5 border border-black bg-[#f4f4f4] hover:bg-neutral-100 cursor-pointer text-[#0a0a0a] font-bold uppercase text-[10px]"
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

            {/* Offline Area Cache Quick Summary */}
            <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center justify-between text-[10px] text-neutral-600">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-[#ff3e00]" /> Cached: {storageInfo.formattedSize}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowMapMenu(false);
                  setShowOfflineDownloadModal(true);
                }}
                className="font-black text-black underline uppercase hover:text-[#ff3e00] cursor-pointer"
              >
                Manage Tiles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating In-Map Tactical Incident Recon Media Carousel Drawer */}
      {showMapMediaDrawer && selectedMapIncident && (
        <div
          id="gis-recon-media-drawer"
          className={`absolute top-14 right-3 z-30 bg-white border-2 border-black shadow-[5px_5px_0px_#0a0a0a] text-black font-mono pointer-events-auto transition-all ${
            isMediaDrawerMinimized
              ? 'w-72 max-w-[calc(100%-24px)]'
              : 'w-84 sm:w-96 max-w-[calc(100%-24px)]'
          }`}
        >
          {/* Header Bar */}
          <div className="px-3 py-2 bg-[#0a0a0a] text-white flex items-center justify-between border-b-2 border-black">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff3e00] animate-pulse" />
              <div className="flex items-center gap-1.5 text-xs font-black uppercase">
                <Camera className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span>Recon Feed</span>
                <span className="text-[#ff3e00]">{selectedMapIncident.incidentCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMediaDrawerMinimized(!isMediaDrawerMinimized)}
                className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-xs font-bold cursor-pointer"
                title={isMediaDrawerMinimized ? 'Expand Recon Drawer' : 'Minimize'}
              >
                {isMediaDrawerMinimized ? '+' : '–'}
              </button>
              <button
                type="button"
                onClick={() => setShowMapMediaDrawer(false)}
                className="w-6 h-6 flex items-center justify-center bg-neutral-800 hover:bg-[#ff3e00] text-white border border-neutral-700 text-xs font-bold cursor-pointer"
                title="Close Recon Drawer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Minimized Content */}
          {isMediaDrawerMinimized ? (
            <div className="p-2.5 bg-[#fbfbfb] flex items-center justify-between text-[11px]">
              <div>
                <span className="font-bold text-black">{selectedMapIncident.roadCode}</span>
                <span className="text-neutral-500 ml-1">({selectedMapIncident.type})</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaDrawerMinimized(false)}
                className="px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase hover:bg-neutral-800 cursor-pointer"
              >
                Expand View
              </button>
            </div>
          ) : (
            /* Expanded Media Carousel Content */
            <div className="p-3 space-y-2.5 max-h-[72vh] overflow-y-auto text-xs">
              
              {/* Incident Selector & Corridor Switcher */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-neutral-600 font-bold uppercase">
                  <span>Incident Corridor:</span>
                  <span className="text-[#ff3e00] font-black">{selectedMapIncident.severity} Severity</span>
                </div>
                <select
                  value={selectedMapIncident.id}
                  onChange={(e) => {
                    const match = incidents.find((inc) => inc.id === e.target.value);
                    if (match) {
                      setSelectedMapIncident(match);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([match.lat, match.lng], 12, { duration: 0.8 });
                      }
                    }
                  }}
                  className="w-full p-1.5 bg-[#f4f4f4] border-2 border-black text-xs font-bold font-mono cursor-pointer focus:outline-none focus:ring-0"
                >
                  {incidents.map((inc) => (
                    <option key={inc.id} value={inc.id}>
                      {inc.incidentCode} — {inc.roadCode} ({inc.type}, {inc.severity})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center justify-between gap-1 pt-1 border-t border-neutral-200">
                <span className="text-[10px] text-neutral-500 uppercase font-bold">
                  {mapMediaList.length} Archived Feeds
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMapMediaFilter('all')}
                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border cursor-pointer ${
                      mapMediaFilter === 'all'
                        ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    All ({mapMediaList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMediaFilter('image')}
                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border cursor-pointer flex items-center gap-0.5 ${
                      mapMediaFilter === 'image'
                        ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <Camera className="w-2.5 h-2.5" /> Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMediaFilter('video')}
                    className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border cursor-pointer flex items-center gap-0.5 ${
                      mapMediaFilter === 'video'
                        ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                        : 'bg-neutral-100 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    <Video className="w-2.5 h-2.5" /> Video
                  </button>
                </div>
              </div>

              {/* Carousel Viewport */}
              {loadingMapMedia ? (
                <div className="h-44 flex flex-col items-center justify-center bg-neutral-900 text-white space-y-2 p-4 border border-black">
                  <div className="w-6 h-6 border-2 border-[#ff3e00] border-t-transparent animate-spin rounded-none" />
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Connecting to Tactical Repository...
                  </span>
                </div>
              ) : mapFilteredMedia.length === 0 ? (
                <div className="h-36 flex flex-col items-center justify-center bg-neutral-100 text-neutral-500 p-4 border border-black text-center">
                  <Camera className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-[11px] font-bold">No media records found</span>
                  <button
                    onClick={() => setMapMediaFilter('all')}
                    className="text-[10px] text-[#ff3e00] underline font-bold mt-1"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                <div className="relative group bg-neutral-950 border border-black overflow-hidden">
                  <div className="relative h-44 sm:h-48 flex items-center justify-center select-none overflow-hidden bg-neutral-900">
                    {activeMapMedia && !mapImageErrorMap[activeMapMedia.id] ? (
                      <img
                        src={activeMapMedia.url}
                        alt={activeMapMedia.title}
                        referrerPolicy="no-referrer"
                        onError={() => setMapImageErrorMap((prev) => ({ ...prev, [activeMapMedia.id]: true }))}
                        className="w-full h-full object-cover transition-opacity duration-300"
                      />
                    ) : (
                      <div className="w-full h-full relative flex flex-col items-center justify-center bg-neutral-900 text-neutral-300 p-4 text-center">
                        <Camera className="w-8 h-8 text-[#ff3e00] mb-1" />
                        <span className="font-bold text-[11px] uppercase text-white">
                          {activeMapMedia?.title || 'Tactical Recon Capture'}
                        </span>
                      </div>
                    )}

                    {/* Top HUD Badges */}
                    <div className="absolute top-0 inset-x-0 p-2 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-[10px] font-mono z-10">
                      <span className="bg-[#ff3e00] text-white px-1.5 py-0.5 text-[9px] font-black uppercase">
                        {activeMapMedia?.type === 'video' ? 'VIDEO FEED' : '4K HIGH-RES'}
                      </span>
                      <span className="text-white font-mono font-bold text-[10px] tabular-nums bg-black/60 px-1 py-0.2">
                        {String(mapActiveIndex + 1).padStart(2, '0')} / {String(mapFilteredMedia.length).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Video Player in Map */}
                    {activeMapMedia?.type === 'video' && (
                      <div className="absolute inset-0 z-20 flex flex-col justify-between">
                        {!isMapPlayingVideo ? (
                          <div className="m-auto flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => setIsMapPlayingVideo(true)}
                              className="w-11 h-11 rounded-full bg-[#ff3e00] hover:bg-white text-white hover:text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#0a0a0a] cursor-pointer transition transform hover:scale-105"
                            >
                              <Play className="w-5 h-5 ml-0.5 fill-current" />
                            </button>
                            <span className="mt-1 px-1.5 py-0.2 bg-black/80 text-white text-[9px] font-bold uppercase border border-white/20">
                              Play Telemetry · {activeMapMedia.duration || '0:48'}
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col justify-between p-2 bg-black/20 pointer-events-none">
                            <div className="flex items-center justify-between text-white text-[9px] font-mono">
                              <span className="text-red-500 font-bold flex items-center gap-1 animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> REC [LIVE]
                              </span>
                              <span className="bg-black/60 px-1">
                                ALT {activeMapMedia.cameraMetadata?.altitudeMeters || 148}M
                              </span>
                            </div>
                            <div className="text-white text-[9px] font-mono flex items-center justify-between bg-black/70 px-1.5 py-0.5">
                              <span>GPS: {selectedMapIncident.lat.toFixed(4)}°, {selectedMapIncident.lng.toFixed(4)}°</span>
                              <span>{formatSecTime(mapVideoCurrentSec)} / {formatSecTime(mapTotalDurationSec)}</span>
                            </div>
                          </div>
                        )}

                        {/* Scrubber Bar */}
                        <div className="p-1.5 bg-neutral-950/95 border-t border-neutral-800 text-white flex items-center gap-1.5 z-30">
                          <button
                            type="button"
                            onClick={() => setIsMapPlayingVideo(!isMapPlayingVideo)}
                            className="w-6 h-6 flex items-center justify-center bg-neutral-800 text-white cursor-pointer"
                          >
                            {isMapPlayingVideo ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                          </button>
                          <div
                            className="flex-1 h-1.5 bg-neutral-800 cursor-pointer relative"
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const pos = (e.clientX - rect.left) / rect.width;
                              const clamped = Math.max(0, Math.min(1, pos));
                              setMapVideoCurrentSec(clamped * mapTotalDurationSec);
                              setMapVideoProgress(clamped * 100);
                            }}
                          >
                            <div className="h-full bg-[#ff3e00]" style={{ width: `${mapVideoProgress}%` }} />
                          </div>
                          <span className="text-[9px] text-neutral-300 font-mono tabular-nums">
                            {formatSecTime(mapVideoCurrentSec)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Prev / Next Carousel Controls */}
                    {mapFilteredMedia.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handleMapPrevMedia}
                          aria-label="Previous record"
                          className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/80 hover:bg-[#ff3e00] text-white border border-black cursor-pointer z-30"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleMapNextMedia}
                          aria-label="Next record"
                          className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/80 hover:bg-[#ff3e00] text-white border border-black cursor-pointer z-30"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Caption & Metadata in Card */}
                  {activeMapMedia && (
                    <div className="p-2 bg-white border-t border-black space-y-1">
                      <div className="font-black text-xs uppercase text-black truncate">
                        {activeMapMedia.title}
                      </div>
                      <div className="text-[10px] text-neutral-600 flex items-center justify-between">
                        <span>{activeMapMedia.source}</span>
                        <span>{activeMapMedia.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-neutral-800 font-medium line-clamp-2">
                        {activeMapMedia.description}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <button
                          type="button"
                          onClick={() => setShowMapSensorTelemetry(!showMapSensorTelemetry)}
                          className="text-[#ff3e00] font-bold underline flex items-center gap-1 cursor-pointer"
                        >
                          <Info className="w-2.5 h-2.5" />
                          {showMapSensorTelemetry ? 'Hide Sensor Data' : 'Sensor Telemetry'}
                        </button>
                        <span className="text-neutral-500 font-mono">{activeMapMedia.fileSizeBytes}</span>
                      </div>

                      {showMapSensorTelemetry && activeMapMedia.cameraMetadata && (
                        <div className="p-1.5 bg-[#f4f4f4] border border-neutral-300 text-[9px] space-y-0.5 text-neutral-700 font-mono">
                          <div>Device: <strong className="text-black">{activeMapMedia.cameraMetadata.device || 'NER Recon Unit'}</strong></div>
                          <div>Optics: <strong className="text-black">{activeMapMedia.cameraMetadata.focalLength || 'Wide'}</strong></div>
                          <div>Altitude AGL: <strong className="text-black">{activeMapMedia.cameraMetadata.altitudeMeters || 140}m</strong></div>
                          <div>Heading: <strong className="text-black">{activeMapMedia.cameraMetadata.azimuthDeg || 180}°</strong></div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Strip Carousel */}
                  {mapFilteredMedia.length > 1 && (
                    <div className="p-1.5 bg-[#f4f4f4] border-t border-black flex items-center gap-1.5 overflow-x-auto">
                      {mapFilteredMedia.map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setMapActiveIndex(idx);
                            setIsMapPlayingVideo(false);
                            setMapVideoProgress(0);
                            setMapVideoCurrentSec(0);
                          }}
                          className={`relative w-12 h-9 border flex-shrink-0 cursor-pointer overflow-hidden ${
                            idx === mapActiveIndex
                              ? 'border-[#ff3e00] border-2 shadow-[1px_1px_0px_#0a0a0a]'
                              : 'border-neutral-400 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={() => setMapImageErrorMap((prev) => ({ ...prev, [item.id]: true }))}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            {item.type === 'video' ? (
                              <Play className="w-2.5 h-2.5 text-white fill-current" />
                            ) : (
                              <Camera className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div className="pt-1 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (mapInstanceRef.current && selectedMapIncident) {
                      mapInstanceRef.current.flyTo([selectedMapIncident.lat, selectedMapIncident.lng], 13, { duration: 1.0 });
                    }
                  }}
                  className="flex-1 py-1.5 bg-[#f4f4f4] hover:bg-neutral-200 border-2 border-black text-black font-black uppercase text-[10px] flex items-center justify-center gap-1 cursor-pointer transition shadow-[1px_1px_0px_#0a0a0a]"
                >
                  <Crosshair className="w-3 h-3 text-[#ff3e00]" /> Center Map
                </button>

                {onSelectIncident && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMapIncident) {
                        onSelectIncident(selectedMapIncident);
                      }
                    }}
                    className="flex-1 py-1.5 bg-black hover:bg-[#ff3e00] text-white font-black uppercase text-[10px] flex items-center justify-center gap-1 cursor-pointer transition shadow-[1px_1px_0px_#0a0a0a]"
                  >
                    <ExternalLink className="w-3 h-3" /> Full Intel Report
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Notice Toast */}
      {locationMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-black text-white border-2 border-blue-400 px-3 py-1.5 text-xs font-mono shadow-[3px_3px_0px_#0a0a0a] flex items-center gap-2 pointer-events-auto">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 animate-bounce" />
          <span className="font-bold">{locationMessage}</span>
          <button
            type="button"
            onClick={() => setLocationMessage(null)}
            className="text-neutral-400 hover:text-white ml-1 font-mono text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating User Location HUD (Positioned safely above bottom-left legend) */}
      {userLocation && filters.userLocation && (
        <div className="absolute bottom-28 sm:bottom-28 left-3 z-20 bg-white border-2 border-black p-2.5 shadow-[3px_3px_0px_#0a0a0a] max-w-xs sm:max-w-sm font-mono text-xs text-black pointer-events-auto">
          <div className="flex items-center justify-between gap-2 border-b border-neutral-200 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5 font-black text-blue-600 uppercase text-[11px]">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping shrink-0" />
              <span>User Location Active</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase text-white ${userLocation.source === 'gps' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                {userLocation.source === 'gps' ? 'LIVE GPS' : 'PRESET'}
              </span>
              <button
                type="button"
                onClick={() => setUserLocation(null)}
                className="text-neutral-400 hover:text-black text-xs font-bold px-1"
                title="Dismiss location marker"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="font-bold text-black text-xs truncate mb-1">
            {userLocation.address || 'Detected Position'}
          </div>

          <div className="text-[10px] text-neutral-600 space-y-0.5 mb-2 font-mono">
            <div>Coords: {userLocation.lat.toFixed(5)}° N, {userLocation.lng.toFixed(5)}° E</div>
            <div>Accuracy: ±{userLocation.accuracy}m</div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-100">
            <button
              type="button"
              id="btn-recenter-user-location"
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.0 });
                }
              }}
              className="flex-1 py-1 bg-black hover:bg-neutral-800 text-white text-[10px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer"
            >
              <Crosshair className="w-3 h-3 text-blue-400" />
              <span>Center Map</span>
            </button>

            <button
              type="button"
              id="btn-toggle-live-tracking"
              onClick={toggleLiveTracking}
              className={`px-2 py-1 text-[10px] font-black uppercase border border-black cursor-pointer flex items-center gap-1 ${
                isLiveWatching ? 'bg-blue-600 text-white' : 'bg-neutral-100 hover:bg-neutral-200 text-black'
              }`}
              title={isLiveWatching ? 'Pause Live Tracking' : 'Enable Continuous Live Tracking'}
            >
              <Navigation className={`w-3 h-3 ${isLiveWatching ? 'animate-pulse text-white' : 'text-neutral-700'}`} />
              <span>{isLiveWatching ? 'Tracking ON' : 'Track'}</span>
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

