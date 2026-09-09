import React, { useState } from 'react';
import { Road, Vehicle, Incident } from '../types';
import { Language, TRANSLATIONS, getLocalizedHighwayName } from '../translations';
import { speakText } from '../utils/speech';
import {
  MapPin,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Navigation,
  Camera,
  ArrowRight,
  Phone,
  FileWarning,
  Clock
} from 'lucide-react';

interface SimpleUserHomeProps {
  roads: Road[];
  vehicles: Vehicle[];
  incidents: Incident[];
  lang: Language;
  onOpenMap: () => void;
  onOpenReportModal: () => void;
  onOpenRoute: () => void;
  onSelectRoad: (road: Road) => void;
  onEmergencySOS: () => void;
  onSelectIncident?: (incident: Incident) => void;
}

export const SimpleUserHome: React.FC<SimpleUserHomeProps> = ({
  roads,
  vehicles,
  incidents,
  lang,
  onOpenMap,
  onOpenReportModal,
  onOpenRoute,
  onSelectRoad,
  onEmergencySOS,
  onSelectIncident
}) => {
  const [sosSent, setSosSent] = useState(false);
  const [activeRoadFilter, setActiveRoadFilter] = useState<'all' | 'blocked' | 'open'>('all');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Blocked & safe roads
  const blockedRoads = roads.filter((r) => r.status === 'BLOCKED');
  const safeRoads = roads.filter((r) => r.status === 'ACCESSIBLE');
  const cautionRoads = roads.filter((r) => r.status === 'HIGH_RISK' || r.accessibility === 'Restricted');

  const handleTriggerSOS = () => {
    setSosSent(true);
    onEmergencySOS();
    if (lang === 'hi') {
      speakText('आपकी आपातकालीन सूचना पुलिस और बचाव दल को भेज दी गई है। मदद रास्ते में है।', 'hi');
    } else if (lang === 'as') {
      speakText('আপোনাৰ জৰুৰীকালীন বাৰ্তা প্ৰশাসনলৈ প্ৰেৰণ কৰা হৈছে। উদ্ধাৰকাৰী দল আহি আছে।', 'as');
    } else {
      speakText('Emergency SOS sent with your GPS location to the nearest disaster control post. Help is on the way.', 'en');
    }
  };

  // Filtered roads
  const displayedRoads = roads.filter((r) => {
    if (activeRoadFilter === 'blocked') return r.status === 'BLOCKED';
    if (activeRoadFilter === 'open') return r.status === 'ACCESSIBLE';
    return true;
  });

  return (
    <div className="space-y-4 pb-20 text-[#0a0a0a]">
      {/* 1. Big Visual Status Alert (Red Danger or Green Safe) */}
      {blockedRoads.length > 0 ? (
        <div className="bg-red-50 border-3 border-red-600 p-5 sm:p-6 shadow-[5px_5px_0px_#0a0a0a] space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-red-600 text-white border-2 border-black flex items-center justify-center shrink-0 font-black shadow-[2px_2px_0px_#0a0a0a]">
              <AlertTriangle className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="inline-block px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-wider mb-1">
                {t.simple.roadBlockedWarning}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
                {blockedRoads.map((r) => `${r.code} (${getLocalizedHighwayName(r.code, lang)})`).join(', ')}
              </h3>
              <p className="text-sm font-bold text-red-900 mt-1">
                {blockedRoads[0]?.recommendedAction || t.simple.landslideBlockedDesc}
              </p>
            </div>
          </div>

          {/* Big Solution Button for Drivers */}
          <div className="bg-white border-2 border-black p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[2px_2px_0px_#0a0a0a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 text-white border-2 border-black flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-green-700">
                  {t.simple.safeAlternateAvailable}
                </span>
                <div className="text-sm font-black text-black uppercase">
                  {blockedRoads[0]?.alternateCorridorName || t.simple.shergaonOpen}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenRoute}
              className="w-full sm:w-auto px-5 py-3 bg-[#ff3e00] hover:bg-black text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {t.simple.openSafeRoute}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border-3 border-green-600 p-5 sm:p-6 shadow-[5px_5px_0px_#0a0a0a] flex items-center gap-4">
          <div className="w-14 h-14 bg-green-600 text-white border-2 border-black flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-black uppercase">
              {t.simple.allClear}
            </span>
            <h3 className="text-xl font-black text-black uppercase mt-1">
              {t.simple.allClearTitle}
            </h3>
            <p className="text-xs font-bold text-green-900 mt-0.5">
              {t.simple.allClearDesc}
            </p>
          </div>
        </div>
      )}

      {/* 3. Four Direct Action Buttons (2x2 Mobile Grid, Large Touch Targets) */}
      <div>
        <div className="text-xs font-black uppercase tracking-widest text-neutral-600 mb-2">
          {t.simple.quickActions}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Action 1: Map */}
          <button
            onClick={onOpenMap}
            className="p-3.5 bg-white hover:bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-left transition flex flex-col justify-between group active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 border-2 border-black flex items-center justify-center group-hover:scale-105 transition">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 bg-black text-white text-[9px] font-black uppercase">
                {t.nav.map}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-black uppercase tracking-tight">
                {t.simple.actionMapTitle}
              </h4>
              <p className="text-[11px] font-bold text-neutral-600 mt-0.5 line-clamp-1">
                {t.simple.actionMapSub}
              </p>
            </div>
          </button>

          {/* Action 2: Report Problem */}
          <button
            onClick={onOpenReportModal}
            className="p-3.5 bg-white hover:bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-left transition flex flex-col justify-between group active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 border-2 border-black flex items-center justify-center group-hover:scale-105 transition">
                <Camera className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 bg-[#ff3e00] text-white text-[9px] font-black uppercase">
                {t.nav.report}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-black uppercase tracking-tight">
                {t.simple.actionReportTitle}
              </h4>
              <p className="text-[11px] font-bold text-neutral-600 mt-0.5 line-clamp-1">
                {t.simple.actionReportSub}
              </p>
            </div>
          </button>

          {/* Action 3: Route Navigation */}
          <button
            onClick={onOpenRoute}
            className="p-3.5 bg-white hover:bg-neutral-50 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-left transition flex flex-col justify-between group active:translate-x-0.5 active:translate-y-0.5"
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 border-2 border-black flex items-center justify-center group-hover:scale-105 transition">
                <Navigation className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 bg-emerald-700 text-white text-[9px] font-black uppercase">
                {t.simple.actionRouteBadge}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-black uppercase tracking-tight">
                {t.simple.actionRouteTitle}
              </h4>
              <p className="text-[11px] font-bold text-neutral-600 mt-0.5 line-clamp-1">
                {t.simple.actionRouteSub}
              </p>
            </div>
          </button>

          {/* Action 4: Emergency SOS Call */}
          <button
            onClick={handleTriggerSOS}
            className={`p-3.5 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-left transition flex flex-col justify-between group active:translate-x-0.5 active:translate-y-0.5 ${
              sosSent
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-white hover:bg-red-50 text-black'
            }`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="w-10 h-10 bg-red-100 text-red-600 border-2 border-black flex items-center justify-center group-hover:scale-105 transition">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-black uppercase">
                SOS
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-tight">
                {sosSent ? t.simple.sosSent : t.simple.actionSosTitle}
              </h4>
              <p className={`text-[11px] font-bold mt-0.5 line-clamp-1 ${sosSent ? 'text-white' : 'text-neutral-600'}`}>
                {t.simple.actionSosSub}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Simple Road Status List (Green vs Red, Big Legible Names) */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_#0a0a0a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black">
          <div>
            <h3 className="text-lg font-black uppercase text-black">
              {t.simple.roadStatusListTitle}
            </h3>
            <p className="text-xs font-bold text-neutral-600 mt-0.5">
              {t.simple.roadStatusLegend}
            </p>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center gap-1.5 text-xs font-black uppercase">
            <button
              onClick={() => setActiveRoadFilter('all')}
              className={`px-3 py-1 border-2 border-black transition ${
                activeRoadFilter === 'all'
                  ? 'bg-black text-white'
                  : 'bg-[#f4f4f4] text-black hover:bg-neutral-200'
              }`}
            >
              {t.simple.filterAll}
            </button>
            <button
              onClick={() => setActiveRoadFilter('blocked')}
              className={`px-3 py-1 border-2 border-black transition ${
                activeRoadFilter === 'blocked'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-800 hover:bg-red-100'
              }`}
            >
              {t.simple.filterBlocked}
            </button>
            <button
              onClick={() => setActiveRoadFilter('open')}
              className={`px-3 py-1 border-2 border-black transition ${
                activeRoadFilter === 'open'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-50 text-green-800 hover:bg-green-100'
              }`}
            >
              {t.simple.filterOpen}
            </button>
          </div>
        </div>

        {/* Road Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedRoads.map((road) => {
            const isBlocked = road.status === 'BLOCKED';
            const isCaution = road.status === 'HIGH_RISK' || road.accessibility === 'Restricted';

            return (
              <div
                key={road.id}
                onClick={() => onSelectRoad(road)}
                className={`p-4 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer flex items-center justify-between gap-3 ${
                  isBlocked
                    ? 'bg-red-50 hover:bg-red-100'
                    : isCaution
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-white hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 border-2 border-black flex items-center justify-center font-bold text-white shrink-0 shadow-[1px_1px_0px_#0a0a0a] ${
                      isBlocked ? 'bg-red-600' : isCaution ? 'bg-amber-500' : 'bg-green-600'
                    }`}
                  >
                    {isBlocked ? '⛔' : isCaution ? '⚠️' : '✅'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black bg-black text-white px-1.5 py-0.5">
                        {road.code}
                      </span>
                      <span className="text-xs font-black text-neutral-500">
                        {road.lengthKm} KM
                      </span>
                    </div>
                    <h5 className="font-black text-sm text-black uppercase mt-0.5">
                      {getLocalizedHighwayName(road.code, lang)}
                    </h5>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2.5 py-1 text-xs font-black uppercase border border-black inline-block ${
                      isBlocked
                        ? 'bg-red-600 text-white'
                        : isCaution
                        ? 'bg-amber-400 text-black'
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {isBlocked
                      ? t.status.blocked
                      : isCaution
                      ? t.status.highRisk
                      : t.status.accessible}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Active Ground Incidents & Field Hazard Reports */}
      {incidents && incidents.length > 0 && (
        <div className="bg-white border-2 border-black p-4 sm:p-5 shadow-[4px_4px_0px_#0a0a0a] space-y-3">
          <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
            <div className="flex items-center gap-2">
              <FileWarning className="w-4 h-4 text-[#ff3e00]" />
              <h3 className="text-sm font-black uppercase text-black font-mono tracking-tight">
                Live Incident & Hazard Reports ({incidents.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#ff3e00] text-white px-1.5 py-0.5 uppercase">
              Field Verified
            </span>
          </div>

          <div className="space-y-2.5">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident?.(inc)}
                className="p-3 bg-[#f8f8f8] hover:bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between gap-3 cursor-pointer transition active:translate-x-0.5 active:translate-y-0.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 border border-black flex items-center justify-center font-bold text-xs shrink-0 ${
                    inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : inc.severity === 'HIGH' ? 'bg-amber-500 text-black' : 'bg-neutral-800 text-white'
                  }`}>
                    {inc.type === 'LANDSLIDE' ? '⛰️' : inc.type === 'FLOOD' ? '🌊' : '⚠️'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-black bg-black text-white px-1 py-0.2">
                        {inc.roadCode || 'ROAD'}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-500 truncate">
                        {inc.locationDescription || 'Northeast Highway'}
                      </span>
                    </div>
                    <p className="text-xs font-black text-black uppercase truncate mt-0.5">
                      {inc.title || `${inc.type} Incident`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`px-1.5 py-0.5 text-[9px] font-black uppercase border border-black inline-block ${
                    inc.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-400 text-black'
                  }`}>
                    {inc.severity}
                  </span>
                  <div className="text-[9px] font-mono text-neutral-500 mt-1 flex items-center gap-0.5 justify-end">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{inc.reportedAt ? new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. One-Touch Direct Emergency Phone Helpline Numbers (112, 1077, 108) */}
      <div className="bg-[#f4f4f4] border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_#0a0a0a] space-y-3">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-[#ff3e00]" />
          <h4 className="text-sm font-black uppercase text-black">
            {t.simple.emergencyHelplinesTitle}
          </h4>
        </div>
        <p className="text-xs font-bold text-neutral-600">
          {t.simple.emergencyHelplinesSub}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          <a
            href="tel:112"
            className="p-3 bg-white hover:bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between text-black transition"
          >
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                {t.emergency.h112Title}
              </span>
              <span className="text-xl font-black font-mono text-red-600">📞 112</span>
            </div>
            <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase">
              {t.simple.callNow}
            </span>
          </a>

          <a
            href="tel:1077"
            className="p-3 bg-white hover:bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between text-black transition"
          >
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                {t.emergency.h1077Title}
              </span>
              <span className="text-xl font-black font-mono text-[#0a0a0a]">📞 1077</span>
            </div>
            <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase">
              {t.simple.callNow}
            </span>
          </a>

          <a
            href="tel:108"
            className="p-3 bg-white hover:bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between text-black transition"
          >
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-500 block">
                {t.emergency.h108Title}
              </span>
              <span className="text-xl font-black font-mono text-green-700">📞 108</span>
            </div>
            <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase">
              {t.simple.callNow}
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};
