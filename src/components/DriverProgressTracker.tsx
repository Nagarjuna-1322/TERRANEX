import React, { useState } from 'react';
import { Vehicle, Road, RoadStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  ShieldCheck,
  MapPin,
  CloudRain,
  Mountain,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight,
  Activity,
  Navigation,
  RefreshCw,
  TrendingDown
} from 'lucide-react';
import { useTranslation, getLocalizedLocation } from '../translations';

interface Waypoint {
  id: string;
  name: string;
  subName: string;
  km: number;
  elevationM: number;
  passedTime?: string;
  projectedEta?: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  roadStatus: RoadStatus;
  segmentConfidence: number;
  hazardNote?: string;
  weatherNote?: string;
}

interface DriverProgressTrackerProps {
  vehicle: Vehicle;
  roads: Road[];
  isRerouted: boolean;
  onAcceptReroute?: () => void;
  onOpenRouteOptions?: () => void;
}

export const DriverProgressTracker: React.FC<DriverProgressTrackerProps> = ({
  vehicle,
  roads,
  isRerouted,
  onAcceptReroute,
  onOpenRouteOptions
}) => {
  const { lang } = useTranslation();
  const [selectedWaypointId, setSelectedWaypointId] = useState<string>('wp-munna');
  const [showFactorsBreakdown, setShowFactorsBreakdown] = useState<boolean>(false);

  // Identify active road relevant to this vehicle (NH-13 by default in the NER corridor)
  const nh13 = roads.find((r) => r.code === 'NH-13') || roads[0];
  const isRoadBlocked = nh13 ? nh13.status === 'BLOCKED' : false;
  const isHighRisk = nh13 ? nh13.status === 'HIGH_RISK' : false;

  // Calculate dynamic confidence score based on road condition and reroute status
  let confidenceScore = 91;
  let confidenceLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'HIGH';
  let confidenceStatusText = 'High Confidence — On Schedule';
  let delayMinutes = 0;
  let delayReason = 'Clear all-weather corridor clearance';

  if (isRoadBlocked && !isRerouted) {
    confidenceScore = 26;
    confidenceLevel = 'LOW';
    confidenceStatusText = 'Critical Risk — Route Blocked Ahead';
    delayMinutes = 240;
    delayReason = 'Severe rockslide blocking both lanes at NH-13 Km 198';
  } else if (isRerouted) {
    // Rerouted via Shergaon bypass
    confidenceScore = 88;
    confidenceLevel = 'HIGH';
    confidenceStatusText = 'High Confidence — Stable Bypass Active';
    delayMinutes = 32;
    delayReason = 'Controlled 34 km/h bypass speed via Shergaon South corridor';
  } else if (isHighRisk) {
    confidenceScore = 64;
    confidenceLevel = 'MODERATE';
    confidenceStatusText = 'Moderate Confidence — Heavy Rain Caution';
    delayMinutes = 45;
    delayReason = 'Precipitation > 45mm/h and high-altitude fog near Sela approach';
  }

  // Dynamic Waypoints along Guwahati -> Tawang Transit Axis (248 km total)
  const waypoints: Waypoint[] = [
    {
      id: 'wp-guwahati',
      name: getLocalizedLocation('Guwahati', lang),
      subName: 'Central Logistics Depot',
      km: 0,
      elevationM: 55,
      passedTime: '06:30 IST',
      status: 'COMPLETED',
      roadStatus: 'ACCESSIBLE',
      segmentConfidence: 98,
      hazardNote: 'Clear dual-carriageway NH-27 sector',
      weatherNote: '28°C • Overcast, dry pavement'
    },
    {
      id: 'wp-bhalukpong',
      name: getLocalizedLocation('Bhalukpong', lang),
      subName: 'Arunachal Gateway Post',
      km: 78,
      elevationM: 213,
      passedTime: '08:45 IST',
      status: 'COMPLETED',
      roadStatus: 'ACCESSIBLE',
      segmentConfidence: 95,
      hazardNote: 'Inner Line Permit security scan completed',
      weatherNote: '24°C • Light rain 12mm/h'
    },
    {
      id: 'wp-tenga',
      name: 'Tenga Valley',
      subName: 'Army Brigade Foothills',
      km: 134,
      elevationM: 1480,
      passedTime: '11:20 IST',
      status: 'COMPLETED',
      roadStatus: 'ACCESSIBLE',
      segmentConfidence: 91,
      hazardNote: 'River valley sector cleared by BRO Project Vartak',
      weatherNote: '19°C • Moderate mist'
    },
    {
      id: 'wp-munna',
      name: isRerouted ? 'Shergaon Bypass' : 'Munna Camp / Dirang',
      subName: isRerouted ? 'South Corridor Bypass' : 'NH-13 Critical Junction',
      km: 185,
      elevationM: 2150,
      projectedEta: isRerouted ? '14:15 IST' : isRoadBlocked ? 'BLOCKED (+4h)' : '14:25 IST',
      status: 'ACTIVE',
      roadStatus: isRerouted ? 'ACCESSIBLE' : nh13 ? nh13.status : 'HIGH_RISK',
      segmentConfidence: isRerouted ? 89 : isRoadBlocked ? 22 : 60,
      hazardNote: isRerouted
        ? 'Shergaon alternate bypass open with gravel reinforcement'
        : isRoadBlocked
        ? 'Active landslide blocking both lanes at Km 198'
        : 'Saturated cut-slopes, single-lane alternating convoy',
      weatherNote: '14°C • Continuous mountain rain 38mm/h'
    },
    {
      id: 'wp-sela',
      name: 'Sela Pass Summit',
      subName: 'High-Pass Tunnel Portal',
      km: 218,
      elevationM: 4170,
      projectedEta: isRerouted ? '15:35 IST' : isRoadBlocked ? '19:40 IST' : '15:55 IST',
      status: 'UPCOMING',
      roadStatus: isRoadBlocked && !isRerouted ? 'HIGH_RISK' : 'MODERATE',
      segmentConfidence: isRoadBlocked && !isRerouted ? 42 : 76,
      hazardNote: 'Sub-zero frost & dense fog; convoy escort active',
      weatherNote: '2°C • Thick fog, visibility 40m'
    },
    {
      id: 'wp-tawang',
      name: getLocalizedLocation('Tawang', lang),
      subName: 'District Apex Hospital',
      km: 248,
      elevationM: 3048,
      projectedEta: isRerouted ? '16:45 IST' : isRoadBlocked ? '21:15 IST' : '17:15 IST',
      status: 'UPCOMING',
      roadStatus: 'ACCESSIBLE',
      segmentConfidence: isRoadBlocked && !isRerouted ? 31 : 92,
      hazardNote: 'Final medical receiving bay & cryogenic cold storage',
      weatherNote: '9°C • Intermittent rain'
    }
  ];

  const activeWaypoint = waypoints.find((w) => w.id === selectedWaypointId) || waypoints[3];

  // Colors based on confidence level
  const confidenceColorClasses = {
    HIGH: {
      badgeBg: 'bg-emerald-500',
      badgeBorder: 'border-emerald-700',
      textColor: 'text-emerald-900',
      boxBg: 'bg-emerald-50',
      boxBorder: 'border-emerald-600',
      glow: 'shadow-[3px_3px_0px_#059669]',
      label: 'HIGH CONFIDENCE',
      dotColor: 'bg-emerald-500'
    },
    MODERATE: {
      badgeBg: 'bg-amber-500',
      badgeBorder: 'border-amber-700',
      textColor: 'text-amber-900',
      boxBg: 'bg-amber-50',
      boxBorder: 'border-amber-600',
      glow: 'shadow-[3px_3px_0px_#d97706]',
      label: 'MODERATE CONFIDENCE',
      dotColor: 'bg-amber-500'
    },
    LOW: {
      badgeBg: 'bg-red-600',
      badgeBorder: 'border-red-800',
      textColor: 'text-red-900',
      boxBg: 'bg-red-50',
      boxBorder: 'border-red-600',
      glow: 'shadow-[3px_3px_0px_#dc2626]',
      label: 'LOW CONFIDENCE / DELAY RISK',
      dotColor: 'bg-red-600'
    }
  }[confidenceLevel];

  // Helper for waypoint segment badge
  const getWaypointConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-100 border-emerald-500';
    if (score >= 50) return 'text-amber-700 bg-amber-100 border-amber-500';
    return 'text-red-700 bg-red-100 border-red-500';
  };

  // Helper for road status label
  const getRoadStatusBadge = (status: RoadStatus) => {
    switch (status) {
      case 'ACCESSIBLE':
        return <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-black uppercase font-mono">CLEAR</span>;
      case 'MODERATE':
        return <span className="px-1.5 py-0.5 bg-yellow-500 text-black text-[9px] font-black uppercase font-mono">CAUTION</span>;
      case 'HIGH_RISK':
        return <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[9px] font-black uppercase font-mono">HIGH RISK</span>;
      case 'BLOCKED':
        return <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase font-mono animate-pulse">BLOCKED</span>;
      default:
        return null;
    }
  };

  return (
    <div
      id="driver-progress-tracker"
      className="bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] overflow-hidden"
    >
      {/* Header Bar */}
      <div className="bg-black text-white p-4 border-b-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#ff3e00] text-white border border-white flex items-center justify-center font-mono font-black text-xs shrink-0 shadow-[2px_2px_0px_#fff]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#ff3e00]">
                CORRIDOR PROGRESS &amp; ETA ENGINE
              </span>
              <span className="px-1.5 py-0.2 bg-white/20 text-white text-[9px] font-mono uppercase font-bold">
                {isRerouted ? 'Bypass: SH-1' : 'Direct: NH-13'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight font-mono text-white mt-0.5">
              Guwahati <span className="text-[#ff3e00]">➔</span> Tawang Medical Axis
            </h2>
          </div>
        </div>

        {/* ETA & Confidence Pill Header */}
        <div className="flex items-center gap-2 font-mono shrink-0">
          <div className="px-3 py-1.5 bg-neutral-900 border border-neutral-700 text-right">
            <span className="text-[9px] text-neutral-400 block font-sans uppercase font-bold">Projected ETA</span>
            <span className="text-sm sm:text-base font-black text-white">
              {isRerouted ? '16:45 IST' : isRoadBlocked ? '21:15 IST (+4h)' : '17:15 IST'}
            </span>
          </div>

          <div
            className={`px-3 py-1.5 border-2 border-black flex items-center gap-2 ${confidenceColorClasses.badgeBg} text-white shadow-[2px_2px_0px_#000]`}
            title={`ETA Confidence Score: ${confidenceScore}% based on road status`}
          >
            <div className="text-right">
              <span className="text-[9px] uppercase font-black block font-sans leading-none opacity-90">
                ETA Confidence
              </span>
              <span className="text-base sm:text-lg font-black font-mono leading-none">
                {confidenceScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Confidence Alert & Road Status Banner */}
      <div className={`p-4 border-b-2 border-black ${confidenceColorClasses.boxBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black shrink-0 shadow-[2px_2px_0px_#000] ${
            confidenceLevel === 'HIGH' ? 'bg-emerald-500 text-white' : confidenceLevel === 'MODERATE' ? 'bg-amber-500 text-black' : 'bg-red-600 text-white animate-pulse'
          }`}>
            {confidenceLevel === 'HIGH' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : confidenceLevel === 'MODERATE' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider px-2 py-0.5 bg-black text-white">
                {confidenceColorClasses.label}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-700">
                Score: <strong>{confidenceScore}/100</strong>
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-black mt-1">
              {confidenceStatusText}
            </h3>
            <p className="text-xs font-medium text-neutral-700 mt-0.5 leading-relaxed">
              {delayReason}
            </p>
          </div>
        </div>

        {/* Action Button for Low Confidence / Blockage */}
        {confidenceLevel === 'LOW' && onAcceptReroute && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onAcceptReroute}
              className="px-4 py-2.5 bg-red-600 hover:bg-black text-white font-mono text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-1.5 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Accept Shergaon Bypass</span>
            </button>
          </div>
        )}

        {/* Completed Reroute Confirmation */}
        {isRerouted && (
          <div className="px-3 py-1.5 bg-white border-2 border-black shadow-[2px_2px_0px_#000] text-xs font-mono font-bold text-neutral-800 flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Shergaon Bypass Committed</span>
          </div>
        )}
      </div>

      {/* Progress Metric Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-black font-mono text-center divide-x-2 divide-black bg-[#f8f9fa]">
        <div className="p-3">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 font-sans block">Distance Covered</span>
          <div className="text-xl sm:text-2xl font-black text-black mt-0.5">
            185 <span className="text-xs text-neutral-500">/ 248 KM</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 block mt-0.5 font-sans">
            74.5% traversed
          </span>
        </div>

        <div className="p-3">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 font-sans block">Transit Speed</span>
          <div className="text-xl sm:text-2xl font-black text-black mt-0.5">
            {vehicle.speedKmH || 34} <span className="text-xs text-neutral-500">KM/H</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 block mt-0.5 font-sans">
            Hill sector safe limit
          </span>
        </div>

        <div className="p-3">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 font-sans block">Remaining Time</span>
          <div className="text-xl sm:text-2xl font-black text-black mt-0.5">
            {isRerouted ? '2h 30m' : isRoadBlocked ? '6h 45m' : '2h 50m'}
          </div>
          <span className={`text-[10px] font-bold block mt-0.5 font-sans ${delayMinutes > 60 ? 'text-red-600' : 'text-neutral-600'}`}>
            {delayMinutes > 0 ? `+${delayMinutes}m delay factor` : 'On target'}
          </span>
        </div>

        <div className="p-3">
          <span className="text-[9px] uppercase font-black tracking-widest text-neutral-500 font-sans block">Active Elevation</span>
          <div className="text-xl sm:text-2xl font-black text-[#ff3e00] mt-0.5">
            2,150 <span className="text-xs text-neutral-500">M</span>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 block mt-0.5 font-sans">
            Munna Camp ridge
          </span>
        </div>
      </div>

      {/* Visual Multi-Checkpoint Progress Bar Track */}
      <div className="p-4 sm:p-5 border-b-2 border-black bg-white">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black uppercase tracking-wider font-mono text-black flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#ff3e00]" />
            <span>Interactive Waypoint Route Track</span>
          </h4>
          <span className="text-[10px] font-mono text-neutral-500 font-bold">
            Tap checkpoint to inspect terrain &amp; ETA
          </span>
        </div>

        {/* Responsive Progress Bar */}
        <div className="relative pt-6 pb-4">
          {/* Background Connecting Track Line */}
          <div className="absolute top-9 left-4 right-4 h-2 bg-neutral-200 border-2 border-black rounded-full overflow-hidden">
            {/* Completed Green Fill (74.5%) */}
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: '60%' }}
            />
            {/* Active Hazard/Bypass Section */}
            <div
              className={`h-full transition-all duration-500 ${
                isRerouted ? 'bg-emerald-400' : isRoadBlocked ? 'bg-red-600 animate-pulse' : 'bg-amber-400'
              }`}
              style={{ width: '15%', marginLeft: '60%' }}
            />
          </div>

          {/* Checkpoint Nodes */}
          <div className="relative flex items-center justify-between">
            {waypoints.map((wp, idx) => {
              const isSelected = wp.id === activeWaypoint.id;
              const isCurrent = wp.status === 'ACTIVE';
              const isDone = wp.status === 'COMPLETED';

              return (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => setSelectedWaypointId(wp.id)}
                  className={`group flex flex-col items-center cursor-pointer transition-transform ${
                    isSelected ? 'scale-105' : 'hover:scale-102'
                  }`}
                  style={{ width: `${100 / waypoints.length}%` }}
                >
                  {/* Floating Vehicle Marker above active node */}
                  {isCurrent && (
                    <div className="absolute -top-7 z-20 flex flex-col items-center animate-bounce">
                      <div className="px-2 py-0.5 bg-black text-white text-[9px] font-mono font-black uppercase tracking-wider border border-white shadow-[1px_1px_0px_#000] flex items-center gap-1">
                        <Truck className="w-3 h-3 text-[#ff3e00]" />
                        <span>TNX-1042</span>
                      </div>
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-black" />
                    </div>
                  )}

                  {/* Circle Indicator */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black flex items-center justify-center font-mono text-[10px] font-black z-10 transition shadow-[2px_2px_0px_#000] ${
                      isSelected
                        ? 'ring-3 ring-[#ff3e00] ring-offset-1'
                        : ''
                    } ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? isRerouted
                          ? 'bg-[#ff3e00] text-white animate-pulse'
                          : isRoadBlocked
                          ? 'bg-red-600 text-white animate-ping'
                          : 'bg-[#ff3e00] text-white'
                        : 'bg-white text-neutral-700'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Waypoint Label */}
                  <div className="mt-2 text-center max-w-[85px] sm:max-w-[110px]">
                    <span className={`text-[10px] sm:text-xs font-black uppercase font-mono block truncate ${
                      isSelected ? 'text-[#ff3e00]' : 'text-black'
                    }`}>
                      {wp.name}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-500 font-sans block truncate">
                      {wp.passedTime || wp.projectedEta}
                    </span>
                    {/* Mini Confidence Chip */}
                    <span className={`inline-block px-1 py-0.2 text-[8px] font-mono font-black border mt-0.5 ${getWaypointConfidenceColor(wp.segmentConfidence)}`}>
                      {wp.segmentConfidence}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Checkpoint Intelligence Detail Card */}
      <div className="p-4 sm:p-5 bg-[#fbfbfb] border-b-2 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black text-white flex items-center justify-center font-mono font-black text-xs">
              <MapPin className="w-3.5 h-3.5 text-[#ff3e00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase font-mono text-black">
                  {activeWaypoint.name}
                </span>
                <span className="text-[10px] text-neutral-500 font-bold">
                  ({activeWaypoint.subName})
                </span>
                {getRoadStatusBadge(activeWaypoint.roadStatus)}
              </div>
              <p className="text-[11px] text-neutral-600 font-mono">
                Corridor Km: <strong>{activeWaypoint.km}</strong> • Elevation: <strong>{activeWaypoint.elevationM}m</strong>
              </p>
            </div>
          </div>

          {/* Segment ETA & Confidence Badge */}
          <div className="flex items-center gap-2 font-mono">
            <div className="px-2.5 py-1 bg-white border border-black text-right shadow-[1px_1px_0px_#000]">
              <span className="text-[8px] uppercase font-bold text-neutral-500 block font-sans">
                {activeWaypoint.passedTime ? 'Passed Time' : 'Estimated Arrival'}
              </span>
              <span className="text-xs font-black text-black">
                {activeWaypoint.passedTime || activeWaypoint.projectedEta}
              </span>
            </div>

            <div className={`px-2.5 py-1 border border-black text-right shadow-[1px_1px_0px_#000] ${getWaypointConfidenceColor(activeWaypoint.segmentConfidence)}`}>
              <span className="text-[8px] uppercase font-bold block font-sans">Confidence</span>
              <span className="text-xs font-black">
                {activeWaypoint.segmentConfidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Sector Road Status & Hazard Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
          <div className="p-3 bg-white border border-black shadow-[2px_2px_0px_#0a0a0a]">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
              <Mountain className="w-3.5 h-3.5 text-[#ff3e00]" />
              <span>Ground &amp; Pavement Condition</span>
            </div>
            <p className="font-bold text-neutral-800 leading-snug">
              {activeWaypoint.hazardNote}
            </p>
          </div>

          <div className="p-3 bg-white border border-black shadow-[2px_2px_0px_#0a0a0a]">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-600" />
              <span>Atmospheric &amp; Weather Factors</span>
            </div>
            <p className="font-bold text-neutral-800 leading-snug">
              {activeWaypoint.weatherNote}
            </p>
          </div>
        </div>
      </div>

      {/* Confidence Calculation Factors Toggle / Breakdown */}
      <div className="p-4 bg-white">
        <button
          type="button"
          onClick={() => setShowFactorsBreakdown(!showFactorsBreakdown)}
          className="w-full py-2 px-3 bg-neutral-100 hover:bg-neutral-200 border border-black font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#ff3e00]" />
            <span>How ETA Confidence is calculated (4 Core Indices)</span>
          </span>
          <span className="text-[10px] font-black">{showFactorsBreakdown ? '▲ HIDE' : '▼ VIEW'}</span>
        </button>

        {showFactorsBreakdown && (
          <div className="mt-3 p-4 bg-[#f8f9fa] border-2 border-black space-y-3 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 bg-white border border-black">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[11px] uppercase">1. Pavement Clearance (40%)</span>
                  <span className="font-mono font-bold text-xs">
                    {isRoadBlocked && !isRerouted ? '20/100 (Blocked)' : '95/100 (Open)'}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 mt-1.5 border border-black">
                  <div
                    className={`h-full ${isRoadBlocked && !isRerouted ? 'bg-red-600' : 'bg-emerald-500'}`}
                    style={{ width: isRoadBlocked && !isRerouted ? '20%' : '95%' }}
                  />
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Continuously scans BRO border logs and obstacle reports along NH-13 and bypass arteries.
                </p>
              </div>

              <div className="p-2.5 bg-white border border-black">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[11px] uppercase">2. Rainfall &amp; Mud Saturation (25%)</span>
                  <span className="font-mono font-bold text-xs">
                    {nh13 ? `${Math.round(100 - nh13.rainfallMmH)}/100` : '75/100'}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 mt-1.5 border border-black">
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: '65%' }}
                  />
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Doppler radar monitors mm/h precipitation to predict mudflow thresholds within 3 hours.
                </p>
              </div>

              <div className="p-2.5 bg-white border border-black">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[11px] uppercase">3. High-Pass Sela Elevation (20%)</span>
                  <span className="font-mono font-bold text-xs">78/100 (Fog Alert)</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 mt-1.5 border border-black">
                  <div className="h-full bg-blue-500" style={{ width: '78%' }} />
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  At 4,170m elevation, temperature drops, ice crusting, and reduced visibility impact convoy velocity.
                </p>
              </div>

              <div className="p-2.5 bg-white border border-black">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-[11px] uppercase">4. Convoy Flow &amp; Telemetry (15%)</span>
                  <span className="font-mono font-bold text-xs">90/100 (Nominal)</span>
                </div>
                <div className="w-full bg-neutral-200 h-1.5 mt-1.5 border border-black">
                  <div className="h-full bg-emerald-500" style={{ width: '90%' }} />
                </div>
                <p className="text-[10px] text-neutral-600 mt-1">
                  Active GPS pings confirm average transit velocity of 34 km/h across the Western Kameng axis.
                </p>
              </div>
            </div>

            <div className="p-2 bg-neutral-100 border border-neutral-300 text-[10px] text-neutral-600 font-mono">
              Formula: Confidence = (Pavement × 0.40) + (Precipitation × 0.25) + (Elevation × 0.20) + (Telemetry × 0.15)
            </div>
          </div>
        )}
      </div>

      {/* Footer Control Strip */}
      <div className="p-3 bg-neutral-100 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-neutral-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="text-[10px] uppercase font-bold">Telemetry Live • GPS Synced</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenRouteOptions && (
            <button
              type="button"
              onClick={onOpenRouteOptions}
              className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black border border-black font-bold uppercase text-[10px] shadow-[1px_1px_0px_#000] cursor-pointer flex items-center gap-1"
            >
              <span>Compare Route Options</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
