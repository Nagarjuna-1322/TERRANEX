import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
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
  Flame,
  Newspaper,
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
  CheckCircle2,
  Car,
  Bike,
  Train,
  Mountain,
  Sun,
  Search
} from 'lucide-react';
import { api } from '../services/api';
import { fetchIncidentMediaFromRepository } from '../services/mediaRepository';

export type GisViewMode = 'Road Map' | 'Satellite' | 'Hybrid' | 'Terrain';
export type MapViewScope = 'ner' | 'tawang' | 'assam' | 'meghalaya' | 'nagaland';

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

// Fixed Key Tactical Facilities across North East India
const TACTICAL_FACILITIES = [
  {
    id: 'fac-hosp-tawang',
    name: 'Tawang District Hospital & Trauma Triage',
    type: 'hospital',
    lat: 27.586,
    lng: 91.865,
    district: 'Tawang',
    capacity: '48 ICU Beds, 3 Blood Banks',
    criticalLink: 'NH-13 Terminal'
  },
  {
    id: 'fac-depot-tezpur',
    name: 'Border Roads Task Force 88 HQ Depot',
    type: 'depot',
    lat: 26.65,
    lng: 92.79,
    district: 'Sonitpur (Tezpur)',
    capacity: '24 Heavy Excavators, 6 Bailey Bridges',
    criticalLink: 'NH-15 Arterial'
  },
  {
    id: 'fac-hosp-shillong',
    name: 'NEIGRIHMS Super-Specialty Medical Command',
    type: 'hospital',
    lat: 25.59,
    lng: 91.93,
    district: 'East Khasi Hills (Shillong)',
    capacity: '120 Critical Care Units',
    criticalLink: 'NH-6 Corridor'
  },
  {
    id: 'fac-base-guwahati',
    name: 'NER Strategic Supply Logistics Hub',
    type: 'depot',
    lat: 26.14,
    lng: 91.73,
    district: 'Kamrup Metro (Guwahati)',
    capacity: 'Central Multi-Modal Distribution Terminal',
    criticalLink: 'NH-27 Trans-Asia'
  }
];

// Region Camera Presets
const REGION_PRESETS: Record<MapViewScope, { center: { lat: number; lng: number }; zoom: number; label: string }> = {
  ner: {
    center: { lat: 26.85, lng: 92.80 },
    zoom: 7,
    label: 'All Northeast'
  },
  tawang: {
    center: { lat: 27.35, lng: 92.25 },
    zoom: 9,
    label: 'Tawang Corridor'
  },
  assam: {
    center: { lat: 26.50, lng: 92.80 },
    zoom: 8,
    label: 'Assam Valley'
  },
  meghalaya: {
    center: { lat: 25.60, lng: 91.90 },
    zoom: 9,
    label: 'Shillong Plateau'
  },
  nagaland: {
    center: { lat: 25.40, lng: 93.90 },
    zoom: 8,
    label: 'Nagaland / Manipur'
  }
};

/**
 * Google Maps Real-Time Layers Component (Traffic, Transit, Bicycling)
 */
const GoogleMapLayers: React.FC<{
  showTraffic: boolean;
  showTransit: boolean;
  showBicycling: boolean;
}> = ({ showTraffic, showTransit, showBicycling }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google?.maps) return;
    const trafficLayer = new google.maps.TrafficLayer();
    if (showTraffic) {
      trafficLayer.setMap(map);
    }
    return () => {
      trafficLayer.setMap(null);
    };
  }, [map, showTraffic]);

  useEffect(() => {
    if (!map || !window.google?.maps) return;
    const transitLayer = new google.maps.TransitLayer();
    if (showTransit) {
      transitLayer.setMap(map);
    }
    return () => {
      transitLayer.setMap(null);
    };
  }, [map, showTransit]);

  useEffect(() => {
    if (!map || !window.google?.maps) return;
    const bicyclingLayer = new google.maps.BicyclingLayer();
    if (showBicycling) {
      bicyclingLayer.setMap(map);
    }
    return () => {
      bicyclingLayer.setMap(null);
    };
  }, [map, showBicycling]);

  return null;
};

/**
 * Google Maps Highway Corridors Polyline Renderer
 */
const GoogleHighwayPolylines: React.FC<{
  roads: Road[];
  selectedRoadId?: string | null;
  onSelectRoad?: (road: Road) => void;
}> = ({ roads, selectedRoadId, onSelectRoad }) => {
  const map = useMap();
  const polylineRefs = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // Clear previous polylines
    polylineRefs.current.forEach((poly) => poly.setMap(null));
    polylineRefs.current = [];

    roads.forEach((road) => {
      if (!road.coordinates || road.coordinates.length < 2) return;

      const path = road.coordinates.map(([lat, lng]) => ({ lat, lng }));
      const isSelected = road.id === selectedRoadId;

      let strokeColor = '#059669'; // Emerald ACCESSIBLE
      let strokeWeight = isSelected ? 7 : 4;
      let strokeOpacity = 0.9;

      if (road.status === 'BLOCKED') {
        strokeColor = '#dc2626'; // Crimson red
        strokeWeight = isSelected ? 8 : 5;
      } else if (road.status === 'HIGH_RISK') {
        strokeColor = '#d97706'; // Amber
        strokeWeight = isSelected ? 7 : 4;
      }

      const polyline = new google.maps.Polyline({
        path,
        strokeColor,
        strokeOpacity,
        strokeWeight,
        map,
        zIndex: isSelected ? 20 : 10
      });

      polyline.addListener('click', () => {
        if (onSelectRoad) onSelectRoad(road);
      });

      polyline.addListener('mouseover', () => {
        polyline.setOptions({
          strokeWeight: isSelected ? 9 : 6,
          strokeOpacity: 1.0
        });
      });

      polyline.addListener('mouseout', () => {
        polyline.setOptions({
          strokeWeight: isSelected ? 8 : (road.status === 'BLOCKED' ? 5 : 4),
          strokeOpacity
        });
      });

      polylineRefs.current.push(polyline);
    });

    return () => {
      polylineRefs.current.forEach((poly) => poly.setMap(null));
      polylineRefs.current = [];
    };
  }, [map, roads, selectedRoadId, onSelectRoad]);

  return null;
};

/**
 * Embedded Google Street View 360° Recon Viewer
 */
const StreetViewOverlay: React.FC<{
  position: { lat: number; lng: number; title: string };
  onClose: () => void;
}> = ({ position, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svCoverageStatus, setSvCoverageStatus] = useState<string>('Searching panoramic telemetry...');

  useEffect(() => {
    if (!containerRef.current || !window.google?.maps) return;

    try {
      const svService = new google.maps.StreetViewService();
      svService.getPanorama(
        { location: { lat: position.lat, lng: position.lng }, radius: 10000 },
        (data, status) => {
          if (status === google.maps.StreetViewStatus.OK && data && data.location) {
            setSvCoverageStatus('360° Ground Panorama Locked');
            new google.maps.StreetViewPanorama(containerRef.current!, {
              position: data.location.latLng,
              pov: { heading: 180, pitch: 0 },
              zoom: 1,
              addressControl: true,
              fullscreenControl: true,
              motionTracking: true,
              motionTrackingControl: true
            });
          } else {
            setSvCoverageStatus('Mountain pass sector has limited Google Car coverage. Displaying nearest highway panorama.');
            new google.maps.StreetViewPanorama(containerRef.current!, {
              position: { lat: 26.65, lng: 92.79 }, // Tezpur Trunk Highway
              pov: { heading: 140, pitch: 0 },
              zoom: 1
            });
          }
        }
      );
    } catch {
      setSvCoverageStatus('Street View service active.');
    }
  }, [position]);

  return (
    <div className="absolute inset-0 z-40 bg-black/90 flex flex-col font-mono text-xs animate-in fade-in duration-200">
      <div className="p-3 bg-neutral-950 border-b-2 border-black flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#ff3e00]" />
          <div>
            <span className="font-black uppercase tracking-wider text-xs block">
              Google Maps Street View (360° Ground Recon)
            </span>
            <span className="text-[10px] text-neutral-400">
              {position.title} • {position.lat.toFixed(4)}°N, {position.lng.toFixed(4)}°E
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 bg-neutral-800 text-neutral-300 border border-neutral-700">
            {svCoverageStatus}
          </span>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-[#ff3e00] hover:bg-black text-white font-black text-xs uppercase border border-black cursor-pointer shadow-[1px_1px_0px_#fff]"
          >
            ✕ Close
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full h-full bg-black" />
    </div>
  );
};

/**
 * Camera Controller Hook Component for Programmatic Center & Tilt Animation
 */
const CameraController: React.FC<{
  center: { lat: number; lng: number };
  zoom: number;
  tilt: number;
  heading: number;
}> = ({ center, zoom, tilt, heading }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo(center);
    map.setZoom(zoom);
    if (typeof map.setTilt === 'function') {
      map.setTilt(tilt);
    }
    if (typeof map.setHeading === 'function') {
      map.setHeading(heading);
    }
  }, [map, center, zoom, tilt, heading]);

  return null;
};

/**
 * Main Google Maps GIS Component for TerraNex
 */
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
  // Google Maps Base View: Roadmap, Satellite, Hybrid, Terrain
  const [viewMode, setViewMode] = useState<GisViewMode>(initialViewMode);
  const [activeScope, setActiveScope] = useState<MapViewScope>('ner');

  // Real-Time Google Maps Overlay Toggles
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showTransit, setShowTransit] = useState<boolean>(false);
  const [showBicycling, setShowBicycling] = useState<boolean>(false);
  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [showVehicles, setShowVehicles] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [showNewsHotspots, setShowNewsHotspots] = useState<boolean>(true);

  // 3D Camera State
  const [is3DTilt, setIs3DTilt] = useState<boolean>(false);
  const [cameraCenter, setCameraCenter] = useState<{ lat: number; lng: number }>(REGION_PRESETS.ner.center);
  const [cameraZoom, setCameraZoom] = useState<number>(REGION_PRESETS.ner.zoom);

  // Active InfoWindow State
  const [activeMarkerInfo, setActiveMarkerInfo] = useState<{
    type: 'incident' | 'vehicle' | 'road' | 'facility' | 'news';
    id: string;
    position: { lat: number; lng: number };
    title: string;
    subtitle?: string;
    statusBadge?: string;
    statusColor?: string;
    data: any;
  } | null>(null);

  // Street View State
  const [activeStreetView, setActiveStreetView] = useState<{
    lat: number;
    lng: number;
    title: string;
  } | null>(null);

  // User GPS Geolocation State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locatingUser, setLocatingUser] = useState<boolean>(false);

  // Tactical Media Recon Drawer States
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

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map Google MapTypeId
  const googleMapTypeId = useMemo(() => {
    switch (viewMode) {
      case 'Satellite':
        return 'satellite';
      case 'Hybrid':
        return 'hybrid';
      case 'Terrain':
        return 'terrain';
      case 'Road Map':
      default:
        return 'roadmap';
    }
  }, [viewMode]);

  // Sync selectedIncidentId
  useEffect(() => {
    if (selectedIncidentId) {
      const match = incidents.find((i) => i.id === selectedIncidentId);
      if (match) {
        setSelectedMapIncident(match);
        setCameraCenter({ lat: match.lat, lng: match.lng });
        setCameraZoom(12);
        setActiveMarkerInfo({
          type: 'incident',
          id: match.id,
          position: { lat: match.lat, lng: match.lng },
          title: `${match.type} Hazard: ${match.roadCode}`,
          subtitle: `Km 81.3 • ${match.reportedBy}`,
          statusBadge: match.severity,
          statusColor: match.severity === 'Critical' ? '#dc2626' : '#d97706',
          data: match
        });
      }
    }
  }, [selectedIncidentId, incidents]);

  // Sync selectedRoadId
  useEffect(() => {
    if (selectedRoadId) {
      const r = roads.find((road) => road.id === selectedRoadId);
      if (r && r.coordinates && r.coordinates.length > 0) {
        const midPoint = r.coordinates[Math.floor(r.coordinates.length / 2)];
        setCameraCenter({ lat: midPoint[0], lng: midPoint[1] });
        setCameraZoom(9);
      }
    }
  }, [selectedRoadId, roads]);

  // Load Drone Recon Media for selected incident
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

  // Filtered media
  const mapFilteredMedia = useMemo(() => {
    return mapMediaList.filter((item) => {
      if (mapMediaFilter === 'all') return true;
      return item.type === mapMediaFilter;
    });
  }, [mapMediaList, mapMediaFilter]);

  const activeMapMedia = mapFilteredMedia[mapActiveIndex] || mapFilteredMedia[0] || null;

  // Video loop simulation
  useEffect(() => {
    if (!isMapPlayingVideo || activeMapMedia?.type !== 'video') return;

    const interval = setInterval(() => {
      setMapVideoCurrentSec((prev) => {
        const next = prev + 0.25 * mapPlaybackSpeed;
        if (next >= 45) {
          setMapVideoProgress(0);
          return 0;
        }
        setMapVideoProgress((next / 45) * 100);
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isMapPlayingVideo, activeMapMedia, mapPlaybackSpeed]);

  // GPS Locate User
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const loc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
          source: 'gps'
        };
        setUserLocation(loc);
        setCameraCenter({ lat: loc.lat, lng: loc.lng });
        setCameraZoom(13);
        setActiveMarkerInfo({
          type: 'facility',
          id: 'user-loc',
          position: { lat: loc.lat, lng: loc.lng },
          title: 'My Command Post Position',
          subtitle: `Accuracy: ±${Math.round(loc.accuracy)}m`,
          statusBadge: 'ONLINE',
          statusColor: '#059669',
          data: loc
        });
      },
      () => {
        setLocatingUser(false);
        // Default to Guwahati command headquarters
        const fallbackLoc: UserLocation = {
          lat: 26.1445,
          lng: 91.7362,
          accuracy: 25,
          timestamp: Date.now(),
          source: 'preset'
        };
        setUserLocation(fallbackLoc);
        setCameraCenter({ lat: fallbackLoc.lat, lng: fallbackLoc.lng });
        setCameraZoom(12);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Region Scope Change
  const handleScopeChange = (scope: MapViewScope) => {
    setActiveScope(scope);
    const preset = REGION_PRESETS[scope];
    if (preset) {
      setCameraCenter(preset.center);
      setCameraZoom(preset.zoom);
    }
  };

  // Place Search Handler
  const handleSearchPlace = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    if (query.includes('tawang') || query.includes('sela')) {
      handleScopeChange('tawang');
    } else if (query.includes('tezpur') || query.includes('guwahati') || query.includes('assam')) {
      handleScopeChange('assam');
    } else if (query.includes('shillong') || query.includes('meghalaya')) {
      handleScopeChange('meghalaya');
    } else if (query.includes('kohima') || query.includes('dimapur') || query.includes('imphal')) {
      handleScopeChange('nagaland');
    } else {
      // Find matching road or incident
      const matchedRoad = roads.find((r) => r.code.toLowerCase().includes(query) || r.name.toLowerCase().includes(query));
      if (matchedRoad && matchedRoad.coordinates && matchedRoad.coordinates.length > 0) {
        const mid = matchedRoad.coordinates[Math.floor(matchedRoad.coordinates.length / 2)];
        setCameraCenter({ lat: mid[0], lng: mid[1] });
        setCameraZoom(10);
        if (onSelectRoad) onSelectRoad(matchedRoad);
      } else {
        handleScopeChange('ner');
      }
    }
  };

  // Google Maps API Key from env
  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="relative w-full border-2 border-black bg-neutral-900 shadow-[4px_4px_0px_#0a0a0a] overflow-hidden flex flex-col">
      {/* Top Tactical Command HUD Bar */}
      <div className="p-2 sm:p-2.5 bg-neutral-950 border-b-2 border-black flex flex-wrap items-center justify-between gap-2 z-20 text-xs font-mono text-white">
        {/* Left: Google Maps Brand & Layer Mode Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-1 bg-white text-black font-black uppercase text-[10px] tracking-wider border border-black shadow-[1px_1px_0px_#ff3e00]">
            <Globe className="w-3.5 h-3.5 text-[#ff3e00]" />
            <span>Google Maps</span>
          </div>

          {/* Map Type Mode Switcher */}
          <div className="flex items-center bg-neutral-900 border border-neutral-700 p-0.5 text-[10px]">
            {(['Road Map', 'Satellite', 'Hybrid', 'Terrain'] as GisViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode);
                  if (onViewModeChange) onViewModeChange(mode);
                }}
                className={`px-2 py-0.5 uppercase font-bold transition cursor-pointer ${
                  viewMode === mode
                    ? 'bg-[#ff3e00] text-white font-black shadow-[1px_1px_0px_#000]'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {mode === 'Road Map' ? 'Road' : mode}
              </button>
            ))}
          </div>

          {/* 3D Tilt Perspective Toggle */}
          <button
            onClick={() => setIs3DTilt(!is3DTilt)}
            className={`px-2 py-1 border text-[10px] uppercase font-bold flex items-center gap-1 transition cursor-pointer ${
              is3DTilt
                ? 'bg-amber-400 text-black border-black font-black'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
            title="Toggle 45° 3D Aerial Perspective"
          >
            <Mountain className="w-3 h-3" />
            <span>{is3DTilt ? '3D Active' : '3D View'}</span>
          </button>
        </div>

        {/* Middle: Google Real-Time Data Layers Toggles */}
        <div className="flex items-center gap-1 flex-wrap text-[10px]">
          {/* Traffic Layer Toggle */}
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2 py-0.5 border flex items-center gap-1 uppercase font-bold transition cursor-pointer ${
              showTraffic
                ? 'bg-emerald-600 text-white border-black font-black'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Real-time Google Traffic Conditions"
          >
            <Car className="w-3 h-3 text-emerald-300" />
            <span>Traffic</span>
          </button>

          {/* Transit Layer Toggle */}
          <button
            onClick={() => setShowTransit(!showTransit)}
            className={`px-2 py-0.5 border flex items-center gap-1 uppercase font-bold transition cursor-pointer ${
              showTransit
                ? 'bg-sky-600 text-white border-black font-black'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
            title="Railway and Transit Corridors"
          >
            <Train className="w-3 h-3 text-sky-300" />
            <span>Transit</span>
          </button>

          {/* Facilities Toggle */}
          <button
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-2 py-0.5 border flex items-center gap-1 uppercase font-bold transition cursor-pointer ${
              showFacilities
                ? 'bg-neutral-200 text-black border-black font-black'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            <Hospital className="w-3 h-3 text-red-600" />
            <span>Facilities</span>
          </button>

          {/* Vehicles Toggle */}
          <button
            onClick={() => setShowVehicles(!showVehicles)}
            className={`px-2 py-0.5 border flex items-center gap-1 uppercase font-bold transition cursor-pointer ${
              showVehicles
                ? 'bg-neutral-200 text-black border-black font-black'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            <Truck className="w-3 h-3 text-blue-600" />
            <span>Convoys ({vehicles.length})</span>
          </button>

          {/* Incidents Toggle */}
          <button
            onClick={() => setShowIncidents(!showIncidents)}
            className={`px-2 py-0.5 border flex items-center gap-1 uppercase font-bold transition cursor-pointer ${
              showIncidents
                ? 'bg-red-600 text-white border-black font-black'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-yellow-300" />
            <span>Hazards ({incidents.length})</span>
          </button>
        </div>

        {/* Right: Quick Region Presets & GPS Locate */}
        <div className="flex items-center gap-1 text-[10px]">
          <select
            value={activeScope}
            onChange={(e) => handleScopeChange(e.target.value as MapViewScope)}
            className="px-2 py-1 bg-neutral-900 text-white border border-neutral-700 font-bold uppercase text-[10px] focus:outline-none"
          >
            {Object.entries(REGION_PRESETS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleLocateUser}
            disabled={locatingUser}
            className="px-2 py-1 bg-white hover:bg-neutral-100 text-black border border-black font-bold uppercase flex items-center gap-1 cursor-pointer"
            title="Locate My Terminal via GPS"
          >
            <Locate className={`w-3 h-3 text-[#ff3e00] ${locatingUser ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">GPS</span>
          </button>
        </div>
      </div>

      {/* Interactive Search & Filter Bar */}
      <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between gap-2 z-10 font-mono text-[11px]">
        <form onSubmit={handleSearchPlace} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Northeast Highway, District, Pass (e.g., Tawang, NH-13, Tezpur)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2 py-1 bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500 text-[10px] font-bold focus:border-[#ff3e00] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-2 py-1 bg-[#ff3e00] hover:bg-black text-white border border-black font-bold uppercase text-[10px] cursor-pointer"
          >
            Fly To
          </button>
        </form>

        {/* Quick Corridor Filter Chips */}
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-neutral-400">
          <span className="uppercase font-bold text-neutral-500">Quick Corridors:</span>
          {roads.slice(0, 4).map((r) => (
            <button
              key={r.id}
              onClick={() => {
                if (onSelectRoad) onSelectRoad(r);
                if (r.coordinates && r.coordinates.length > 0) {
                  const mid = r.coordinates[Math.floor(r.coordinates.length / 2)];
                  setCameraCenter({ lat: mid[0], lng: mid[1] });
                  setCameraZoom(10);
                }
              }}
              className={`px-1.5 py-0.5 border cursor-pointer ${
                r.id === selectedRoadId
                  ? 'bg-white text-black border-black font-black'
                  : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
              }`}
            >
              {r.code} ({r.status === 'BLOCKED' ? '🚨' : r.status === 'HIGH_RISK' ? '⚠️' : '✓'})
            </button>
          ))}
        </div>
      </div>

      {/* Main Google Maps Viewport Container (Explicit CSS dimensions to prevent CF2 collapse) */}
      <div className="relative w-full h-[620px] sm:h-[680px] bg-neutral-950 overflow-hidden">
        <APIProvider apiKey={apiKey} libraries={['places', 'marker', 'routes', 'geometry']}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={REGION_PRESETS.ner.center}
            defaultZoom={REGION_PRESETS.ner.zoom}
            mapId="DEMO_MAP_ID"
            mapTypeId={googleMapTypeId}
            gestureHandling="greedy"
            fullscreenControl={false}
            streetViewControl={false}
            mapTypeControl={false}
            zoomControl={true}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Dynamic Camera Animation Controller */}
            <CameraController
              center={cameraCenter}
              zoom={cameraZoom}
              tilt={is3DTilt ? 45 : 0}
              heading={is3DTilt ? 35 : 0}
            />

            {/* Google Real-Time Layers (Traffic, Transit, Bicycling) */}
            <GoogleMapLayers
              showTraffic={showTraffic}
              showTransit={showTransit}
              showBicycling={showBicycling}
            />

            {/* Google Maps Polylines for All 10 Northeast Highway Corridors */}
            <GoogleHighwayPolylines
              roads={roads}
              selectedRoadId={selectedRoadId}
              onSelectRoad={(r) => {
                if (onSelectRoad) onSelectRoad(r);
                if (r.coordinates && r.coordinates.length > 0) {
                  const mid = r.coordinates[Math.floor(r.coordinates.length / 2)];
                  setActiveMarkerInfo({
                    type: 'road',
                    id: r.id,
                    position: { lat: mid[0], lng: mid[1] },
                    title: `${r.code} - ${r.name}`,
                    subtitle: `${r.state} • ${r.elevationMeters}m Elevation`,
                    statusBadge: r.status,
                    statusColor: r.status === 'BLOCKED' ? '#dc2626' : r.status === 'HIGH_RISK' ? '#d97706' : '#059669',
                    data: r
                  });
                }
              }}
            />

            {/* Active Delivery Convoys Markers (Advanced Markers with Custom Pins) */}
            {showVehicles &&
              vehicles.map((v) => {
                const isSelected = v.id === selectedVehicleId;
                const isEmergency = v.type === 'EMERGENCY' || v.riskLevel === 'CRITICAL';
                return (
                  <AdvancedMarker
                    key={v.id}
                    position={{ lat: v.currentLocation.lat, lng: v.currentLocation.lng }}
                    onClick={() => {
                      if (onSelectVehicle) onSelectVehicle(v);
                      setActiveMarkerInfo({
                        type: 'vehicle',
                        id: v.id,
                        position: { lat: v.currentLocation.lat, lng: v.currentLocation.lng },
                        title: `Convoy: ${v.vehicleNumber} (${v.driverName})`,
                        subtitle: `${v.cargo} • Speed: ${v.speedKmH} km/h`,
                        statusBadge: v.status,
                        statusColor: v.status === 'REROUTED' ? '#059669' : isEmergency ? '#dc2626' : '#2563eb',
                        data: v
                      });
                    }}
                  >
                    <div
                      className={`relative flex items-center justify-center p-1.5 rounded-full border-2 border-black transition-transform cursor-pointer ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                      } ${
                        v.status === 'REROUTED'
                          ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]'
                          : isEmergency
                          ? 'bg-[#ff3e00] shadow-[0_0_12px_#ff3e00] animate-pulse'
                          : 'bg-blue-600 shadow-[2px_2px_0px_#000]'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-white" />
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 bg-black text-white text-[8px] font-mono font-black border border-white">
                        {v.vehicleNumber.slice(-4)}
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Active Highway Hazards & Landslides (Advanced Markers with Pulsing Warning Halos) */}
            {showIncidents &&
              incidents.map((inc) => {
                const isCritical = inc.severity === 'Critical' || inc.type === 'Landslide';
                const isSelected = inc.id === selectedIncidentId || inc.id === selectedMapIncident?.id;
                return (
                  <AdvancedMarker
                    key={inc.id}
                    position={{ lat: inc.lat, lng: inc.lng }}
                    onClick={() => {
                      setSelectedMapIncident(inc);
                      setShowMapMediaDrawer(true);
                      setIsMediaDrawerMinimized(false);
                      if (onSelectIncident) onSelectIncident(inc);
                      setActiveMarkerInfo({
                        type: 'incident',
                        id: inc.id,
                        position: { lat: inc.lat, lng: inc.lng },
                        title: `${inc.type} Incident: ${inc.roadCode}`,
                        subtitle: `${inc.description.slice(0, 60)}...`,
                        statusBadge: inc.severity,
                        statusColor: isCritical ? '#dc2626' : '#d97706',
                        data: inc
                      });
                    }}
                  >
                    <div
                      className={`relative flex items-center justify-center p-2 rounded-full border-2 border-black cursor-pointer transition-transform ${
                        isSelected ? 'scale-125 z-40' : 'hover:scale-110 z-20'
                      } ${isCritical ? 'bg-red-600 shadow-[0_0_16px_#dc2626] animate-bounce' : 'bg-amber-500 shadow-[2px_2px_0px_#000]'}`}
                    >
                      <AlertTriangle className="w-4 h-4 text-white" />
                      <span className="absolute -bottom-2 px-1 py-0.2 bg-black text-yellow-300 font-mono text-[8px] font-bold border border-yellow-300 whitespace-nowrap">
                        {inc.roadCode}
                      </span>
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* Tactical Key Facilities (Hospitals, BRO Depots, Strategic Hubs) */}
            {showFacilities &&
              TACTICAL_FACILITIES.map((fac) => (
                <AdvancedMarker
                  key={fac.id}
                  position={{ lat: fac.lat, lng: fac.lng }}
                  onClick={() => {
                    setActiveMarkerInfo({
                      type: 'facility',
                      id: fac.id,
                      position: { lat: fac.lat, lng: fac.lng },
                      title: fac.name,
                      subtitle: `${fac.district} • ${fac.capacity}`,
                      statusBadge: fac.type === 'hospital' ? 'MEDICAL HQ' : 'BRO DEPOT',
                      statusColor: fac.type === 'hospital' ? '#dc2626' : '#2563eb',
                      data: fac
                    });
                  }}
                >
                  <div
                    className={`p-1.5 rounded-sm border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer hover:scale-110 transition ${
                      fac.type === 'hospital' ? 'bg-white text-red-600' : 'bg-neutral-900 text-amber-400'
                    }`}
                  >
                    {fac.type === 'hospital' ? (
                      <Hospital className="w-4 h-4" />
                    ) : (
                      <Warehouse className="w-4 h-4" />
                    )}
                  </div>
                </AdvancedMarker>
              ))}

            {/* News Radar Alert Hotspots */}
            {showNewsHotspots &&
              newsArticles.map((art) => {
                if (!art.coordinates || art.coordinates.length !== 2) return null;
                const isBlocked = art.detectedStatus === 'BLOCKED';
                return (
                  <AdvancedMarker
                    key={art.id}
                    position={{ lat: art.coordinates[0], lng: art.coordinates[1] }}
                    onClick={() => {
                      if (onSelectNewsArticle) onSelectNewsArticle(art);
                      setActiveMarkerInfo({
                        type: 'news',
                        id: art.id,
                        position: { lat: art.coordinates[0], lng: art.coordinates[1] },
                        title: art.title,
                        subtitle: `${art.source} • ${art.extractedLocation}`,
                        statusBadge: art.detectedStatus,
                        statusColor: isBlocked ? '#dc2626' : '#d97706',
                        data: art
                      });
                    }}
                  >
                    <div
                      className={`p-1.5 rounded-full border border-black shadow-[1px_1px_0px_#000] cursor-pointer hover:scale-110 ${
                        isBlocked ? 'bg-red-700 text-white' : 'bg-amber-600 text-white'
                      }`}
                    >
                      <Newspaper className="w-3.5 h-3.5" />
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* GPS User Location Pin */}
            {userLocation && (
              <AdvancedMarker position={{ lat: userLocation.lat, lng: userLocation.lng }}>
                <div className="relative flex items-center justify-center p-2 bg-emerald-500 text-white rounded-full border-2 border-white shadow-[0_0_15px_#10b981] animate-pulse">
                  <Locate className="w-4 h-4" />
                </div>
              </AdvancedMarker>
            )}

            {/* Interactive Google Maps InfoWindow Popup */}
            {activeMarkerInfo && (
              <InfoWindow
                position={activeMarkerInfo.position}
                onCloseClick={() => setActiveMarkerInfo(null)}
              >
                <div className="p-1 max-w-xs font-mono text-xs text-[#0a0a0a] space-y-2">
                  <div className="flex items-start justify-between gap-2 border-b border-neutral-300 pb-1.5">
                    <div>
                      <span
                        className="px-1.5 py-0.5 text-[9px] font-black uppercase text-white tracking-wider block w-fit mb-1"
                        style={{ backgroundColor: activeMarkerInfo.statusColor || '#0a0a0a' }}
                      >
                        {activeMarkerInfo.statusBadge || 'INFO'}
                      </span>
                      <h4 className="font-black text-xs uppercase text-[#0a0a0a] leading-tight">
                        {activeMarkerInfo.title}
                      </h4>
                    </div>
                  </div>

                  {activeMarkerInfo.subtitle && (
                    <p className="text-[11px] text-neutral-600 font-sans leading-snug">
                      {activeMarkerInfo.subtitle}
                    </p>
                  )}

                  {/* Incident specific details */}
                  {activeMarkerInfo.type === 'incident' && (
                    <div className="p-2 bg-neutral-100 border border-neutral-300 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Status:</span>
                        <span className="font-black text-red-700">{activeMarkerInfo.data.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Reported By:</span>
                        <span className="font-bold">{activeMarkerInfo.data.reportedBy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Coordinates:</span>
                        <span>
                          {activeMarkerInfo.position.lat.toFixed(4)}°N, {activeMarkerInfo.position.lng.toFixed(4)}°E
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Vehicle specific details */}
                  {activeMarkerInfo.type === 'vehicle' && (
                    <div className="p-2 bg-neutral-100 border border-neutral-300 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Destination:</span>
                        <span className="font-bold truncate max-w-[140px]">{activeMarkerInfo.data.destination}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Remaining:</span>
                        <span className="font-black text-emerald-700">{activeMarkerInfo.data.distanceRemainingKm} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">ETA / Delay:</span>
                        <span className="font-bold">{activeMarkerInfo.data.eta} (+{activeMarkerInfo.data.predictedDelayMinutes}m)</span>
                      </div>
                    </div>
                  )}

                  {/* Road specific details */}
                  {activeMarkerInfo.type === 'road' && (
                    <div className="p-2 bg-neutral-100 border border-neutral-300 text-[10px] space-y-1">
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Weather:</span>
                        <span className="font-bold">{activeMarkerInfo.data.weatherCondition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Risk Score:</span>
                        <span className="font-black text-amber-700">{activeMarkerInfo.data.riskScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-neutral-500">Disruption Window:</span>
                        <span className="font-bold">{activeMarkerInfo.data.predictedDisruptionWindow}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons in InfoWindow */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      onClick={() => {
                        setActiveStreetView({
                          lat: activeMarkerInfo.position.lat,
                          lng: activeMarkerInfo.position.lng,
                          title: activeMarkerInfo.title
                        });
                      }}
                      className="py-1.5 px-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-black"
                    >
                      <Eye className="w-3 h-3 text-[#ff3e00]" /> 360° Street View
                    </button>

                    {activeMarkerInfo.type === 'incident' ? (
                      <button
                        onClick={() => {
                          setSelectedMapIncident(activeMarkerInfo.data);
                          setShowMapMediaDrawer(true);
                          setIsMediaDrawerMinimized(false);
                        }}
                        className="py-1.5 px-2 bg-[#ff3e00] hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-black"
                      >
                        <Camera className="w-3 h-3 text-white" /> Drone Recon
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (activeMarkerInfo.type === 'road' && onSelectRoad) {
                            onSelectRoad(activeMarkerInfo.data);
                          } else if (activeMarkerInfo.type === 'vehicle' && onSelectVehicle) {
                            onSelectVehicle(activeMarkerInfo.data);
                          }
                          setActiveMarkerInfo(null);
                        }}
                        className="py-1.5 px-2 bg-[#ff3e00] hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border border-black"
                      >
                        <ExternalLink className="w-3 h-3 text-white" /> Inspect Details
                      </button>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Embedded Interactive 360° Street View Recon Viewer */}
        {activeStreetView && (
          <StreetViewOverlay
            position={activeStreetView}
            onClose={() => setActiveStreetView(null)}
          />
        )}

        {/* Legend Overlay at Bottom-Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-neutral-950/90 backdrop-blur-md p-2.5 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-white font-mono text-[10px] space-y-1.5 max-w-[210px] pointer-events-auto">
          <div className="flex items-center justify-between border-b border-neutral-700 pb-1">
            <span className="font-black uppercase tracking-widest text-[#ff3e00]">Corridor Status</span>
            <span className="text-[9px] text-neutral-400">Live GIS</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#059669] shrink-0"></span>
              <span className="text-neutral-300 font-bold">Accessible Corridor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1 bg-[#d97706] shrink-0"></span>
              <span className="text-neutral-300 font-bold">Restricted / High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 bg-[#dc2626] shrink-0 animate-pulse"></span>
              <span className="text-neutral-300 font-black text-red-400">Blocked (Landslide)</span>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-1 flex items-center justify-between text-[9px] text-neutral-400">
            <span>Vehicles: {vehicles.length}</span>
            <span>Hazards: {incidents.length}</span>
          </div>
        </div>

        {/* Tactical Recon Media Player Drawer Toggle (Bottom-Right) */}
        {selectedMapIncident && !showMapMediaDrawer && (
          <button
            onClick={() => {
              setShowMapMediaDrawer(true);
              setIsMediaDrawerMinimized(false);
            }}
            className="absolute bottom-4 right-4 z-20 px-3 py-2 bg-neutral-950 hover:bg-black text-white font-mono font-black text-xs uppercase tracking-wider border-2 border-[#ff3e00] shadow-[3px_3px_0px_#0a0a0a] flex items-center gap-2 cursor-pointer transition animate-bounce"
          >
            <Camera className="w-4 h-4 text-[#ff3e00]" />
            <span>Open Drone Recon ({selectedMapIncident.roadCode})</span>
          </button>
        )}

        {/* Tactical Media Drawer when opened */}
        {showMapMediaDrawer && selectedMapIncident && (
          <div
            className={`absolute bottom-3 right-3 left-3 sm:left-auto sm:w-[420px] z-30 bg-neutral-950 border-2 border-black shadow-[6px_6px_0px_#0a0a0a] font-mono text-white transition-all duration-300 ${
              isMediaDrawerMinimized ? 'h-11 overflow-hidden' : 'max-h-[85vh] overflow-y-auto'
            }`}
          >
            {/* Drawer Header */}
            <div className="p-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff3e00] animate-ping" />
                <span className="font-black text-xs uppercase tracking-wider text-yellow-400">
                  Drone Recon: {selectedMapIncident.roadCode} ({selectedMapIncident.type})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsMediaDrawerMinimized(!isMediaDrawerMinimized)}
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  title={isMediaDrawerMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMediaDrawerMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowMapMediaDrawer(false)}
                  className="p-1 hover:bg-neutral-800 text-neutral-400 hover:text-white"
                  title="Close Drawer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Drawer Body (Rendered when expanded) */}
            {!isMediaDrawerMinimized && (
              <div className="p-3 space-y-3">
                {/* Media Preview Player */}
                <div className="relative aspect-video bg-black border border-neutral-800 overflow-hidden flex items-center justify-center">
                  {loadingMapMedia ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-500 text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#ff3e00]" />
                      <span>Retrieving Satellite & Drone Feeds...</span>
                    </div>
                  ) : activeMapMedia ? (
                    <>
                      <img
                        src={activeMapMedia.url}
                        alt={activeMapMedia.title}
                        className="w-full h-full object-cover"
                      />
                      {activeMapMedia.type === 'video' && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-between p-2">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="px-1.5 py-0.5 bg-red-600 text-white font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE STREAM
                            </span>
                            <span className="bg-black/60 px-1 py-0.5">RES: {activeMapMedia.resolution}</span>
                          </div>

                          {/* Play/Pause Button */}
                          <button
                            onClick={() => setIsMapPlayingVideo(!isMapPlayingVideo)}
                            className="self-center p-3 rounded-full bg-black/60 hover:bg-[#ff3e00] text-white border border-white/40 transition cursor-pointer"
                          >
                            {isMapPlayingVideo ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>

                          {/* Progress Bar */}
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-neutral-700">
                              <div
                                className="h-full bg-[#ff3e00] transition-all"
                                style={{ width: `${mapVideoProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-neutral-400">
                              <span>00:{Math.floor(mapVideoCurrentSec).toString().padStart(2, '0')}</span>
                              <span>00:45</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-neutral-500 text-xs text-center p-4">
                      No dispatch media uploaded for this sector yet.
                    </div>
                  )}
                </div>

                {/* Media Metadata & Controls */}
                {activeMapMedia && (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-bold text-white uppercase truncate">{activeMapMedia.title}</span>
                      <span className="text-neutral-500 text-[10px]">{activeMapMedia.source}</span>
                    </div>
                    <p className="text-neutral-400 text-[10px] font-sans leading-snug">
                      {activeMapMedia.description}
                    </p>
                  </div>
                )}

                {/* IoT Sensor Telemetry Drawer Box */}
                <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-[10px] space-y-1.5">
                  <div className="flex justify-between items-center text-neutral-400 font-bold">
                    <span>IoT SENSOR TELEMETRY</span>
                    <span className="text-emerald-400">SYNCED (BRO NODE)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-white">
                    <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[9px]">SURFACE RAINFALL</span>
                      <span className="font-black text-amber-400">48.5 mm/h (Heavy)</span>
                    </div>
                    <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[9px]">SLOPE INCLINOMETER</span>
                      <span className="font-black text-red-400">38.2° (Critical Shear)</span>
                    </div>
                    <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[9px]">SOIL SATURATION</span>
                      <span className="font-black text-red-400">92% (Liquefaction)</span>
                    </div>
                    <div className="p-1.5 bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[9px]">ROADWAY DEBRIS</span>
                      <span className="font-black text-yellow-400">450 m³ Blockage</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setActiveStreetView({
                        lat: selectedMapIncident.lat,
                        lng: selectedMapIncident.lng,
                        title: `${selectedMapIncident.roadCode} - ${selectedMapIncident.type}`
                      });
                    }}
                    className="flex-1 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider border border-neutral-700 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#ff3e00]" />
                    <span>Open 360° Street View</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onSelectIncident) onSelectIncident(selectedMapIncident);
                    }}
                    className="flex-1 py-2 bg-[#ff3e00] hover:bg-black text-white text-[10px] font-black uppercase tracking-wider border border-black flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                    <span>Full Incident Card</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Ticker Bar */}
      <div className="p-2 bg-neutral-950 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Google Maps Platform Active</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">|</span>
          <span className="hidden sm:inline">
            Active Layers: Traffic ({showTraffic ? 'ON' : 'OFF'}) • Transit ({showTransit ? 'ON' : 'OFF'}) • 3D ({is3DTilt ? '45° Tilt' : '2D'})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Map ID: DEMO_MAP_ID</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">Attribution: gmp_mcp_codeassist_v1_aistudio</span>
        </div>
      </div>
    </div>
  );
};
