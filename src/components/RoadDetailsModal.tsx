import React from 'react';
import { Road } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Navigation,
  CloudRain,
  Mountain,
  History,
  ShieldAlert,
  Compass,
  Gauge,
  Info
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedHighwayName,
  getLocalizedRoadStatus,
  getLocalizedWeather,
  getLocalizedLocation
} from '../translations';

interface RoadDetailsModalProps {
  road: Road;
  onClose: () => void;
  onMarkBlocked: (road: Road) => void;
  onFindAlternate: (road: Road) => void;
  onCreateAlert: (road: Road) => void;
}

export const RoadDetailsModal: React.FC<RoadDetailsModalProps> = ({
  road,
  onClose,
  onMarkBlocked,
  onFindAlternate,
  onCreateAlert
}) => {
  const { t, lang } = useTranslation();
  const isBlocked = road.status === 'BLOCKED';
  const isHighRisk = road.status === 'HIGH_RISK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-2xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black font-mono text-[#ff3e00] border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#0a0a0a]">
              {road.code}
            </span>
            <div>
              <h3 className="massive-type font-black text-sm sm:text-base leading-tight uppercase">
                {getLocalizedHighwayName(road.code, lang)}
              </h3>
              <div className="text-xs text-neutral-600 font-bold uppercase">
                {road.state} • {t.alertsScreen?.districtLabel || 'Districts'}: {road.districts.map(d => getLocalizedLocation(d, lang)).join(', ')}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Banner */}
          <div
            className={`p-3.5 border-2 border-black flex items-center justify-between shadow-[3px_3px_0px_#0a0a0a] ${
              isBlocked
                ? 'bg-red-50 text-black'
                : isHighRisk
                ? 'bg-amber-50 text-black'
                : road.status === 'MODERATE'
                ? 'bg-yellow-50 text-black'
                : 'bg-neutral-50 text-black'
            }`}
          >
            <div className="flex items-center gap-3">
              {isBlocked ? (
                <XCircle className="w-6 h-6 text-[#ff3e00] animate-pulse" />
              ) : isHighRisk ? (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-black" />
              )}
              <div>
                <div className="font-black text-xs uppercase tracking-wider font-mono">
                  {t.fieldOfficer?.roadStatusTitle || 'ROAD STATUS'}: {getLocalizedRoadStatus(road.status, lang)}
                </div>
                <div className="text-xs text-neutral-700 font-bold">
                  {t.fieldOfficer?.accessibility || 'Accessibility'}: <strong className="text-black font-black">{getLocalizedRoadStatus(road.accessibility, lang)}</strong>
                </div>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-xs text-neutral-600 uppercase font-bold">{t.fieldOfficer?.riskScore || 'Risk Score'}</div>
              <div className="text-xl font-black text-black">{road.riskScore} <span className="text-xs text-neutral-500">/100</span></div>
            </div>
          </div>

          {/* AI Disruption Intelligence Box */}
          <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-black font-mono flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#ff3e00]" /> {t.fieldOfficer?.predictiveAccessibility || 'Predictive Accessibility Intelligence'}
              </span>
              <span className="text-[11px] font-mono font-black px-2 py-0.5 bg-neutral-100 text-black border border-black uppercase">
                {t.fieldOfficer?.confidence || 'Confidence'}: 87%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.fieldOfficer?.disruptionProb || 'Disruption Prob'}</span>
                <span className="text-base font-black text-[#ff3e00]">{road.disruptionProbability}%</span>
              </div>
              <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.fieldOfficer?.riskWindow || 'Risk Window'}</span>
                <span className="text-xs font-black text-black">{road.predictedDisruptionWindow}</span>
              </div>
              <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.fieldOfficer?.avgSpeed || 'Avg Speed'}</span>
                <span className="text-base font-black text-black">{road.avgSpeedKmH} km/h</span>
              </div>
              <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.fieldOfficer?.incidents || 'Incidents'}</span>
                <span className="text-base font-black text-[#ff3e00]">{road.recentIncidentCount}</span>
              </div>
            </div>

            {/* Explainable Contributing Factors */}
            <div className="pt-2">
              <span className="text-[11px] font-black text-black uppercase tracking-wider block mb-2 font-mono">
                {t.fieldOfficer?.factorBreakdown || 'Explainable Factor Breakdown'}:
              </span>
              <div className="space-y-2">
                {road.contributingFactors.map((factor, idx) => (
                  <div key={idx} className="p-2 bg-[#f4f4f4] border-2 border-black flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-black uppercase">{factor.name}</span>
                      <p className="text-[11px] text-neutral-600 font-medium">{factor.description}</p>
                    </div>
                    <span className="font-mono font-black text-black px-2 py-0.5 bg-white border border-black ml-2 whitespace-nowrap">
                      +{factor.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Geological & Weather Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center gap-3">
              <CloudRain className="w-5 h-5 text-[#ff3e00] shrink-0" />
              <div>
                <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.fieldOfficer?.weatherRainfall || 'Weather & Rainfall'}</span>
                <span className="font-black text-black uppercase">{getLocalizedWeather(road.weatherCondition, lang)}</span>
                <div className="font-mono text-black font-bold text-[11px]">{road.rainfallMmH} mm/h {t.fieldOfficer?.precipitation || 'precipitation'}</div>
              </div>
            </div>

            <div className="p-3 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center gap-3">
              <Mountain className="w-5 h-5 text-black shrink-0" />
              <div>
                <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.fieldOfficer?.topographicProfile || 'Topographic Profile'}</span>
                <span className="font-black text-black uppercase">{road.elevationMeters}m | {t.fieldOfficer?.slope || 'Slope'} {road.slopeAngleDeg}°</span>
                <div className="font-mono text-[#ff3e00] font-bold text-[11px]">{road.historicalLandslideCount} {t.fieldOfficer?.historicalSlides || 'historical slides'}</div>
              </div>
            </div>
          </div>

          {/* Recommended Action */}
          <div className="p-3.5 bg-[#f4f4f4] border-2 border-black text-xs shadow-[2px_2px_0px_#0a0a0a]">
            <span className="font-black text-black uppercase tracking-wider font-mono block mb-1">
              {t.fieldOfficer?.recommendedAction || 'Recommended Tactical Action'}
            </span>
            <p className="text-neutral-800 leading-relaxed font-medium">{road.recommendedAction}</p>
            {road.alternateCorridorName && (
              <div className="mt-2 text-black font-black uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#ff3e00]" />
                {t.fieldOfficer?.viableAlternate || 'Viable Alternate'}: {road.alternateCorridorName}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#f4f4f4] border-t-2 border-black flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {!isBlocked ? (
              <button
                id="btn-modal-mark-blocked"
                onClick={() => onMarkBlocked(road)}
                className="px-3 py-2 bg-red-600 hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" /> {t.fieldOfficer?.markBlocked || 'Mark Blocked'}
              </button>
            ) : (
              <button
                id="btn-modal-mark-accessible"
                onClick={() => onMarkBlocked(road)}
                className="px-3 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.fieldOfficer?.reopenCorridor || 'Re-open Corridor'}
              </button>
            )}

            <button
              id="btn-modal-create-alert"
              onClick={() => onCreateAlert(road)}
              className="px-3 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.fieldOfficer?.createAlert || 'Create Alert'}
            </button>
          </div>

          <button
            id="btn-modal-find-alternate"
            onClick={() => onFindAlternate(road)}
            className="px-4 py-2 bg-[#ff3e00] hover:bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> {t.fieldOfficer?.findAlternate || 'Find Alternate Route'}
          </button>
        </div>
      </div>
    </div>
  );
};
