import React from 'react';
import { Incident } from '../types';
import {
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Navigation,
  Users,
  MapPin,
  Clock,
  Truck,
  Package,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedIncidentType,
  getLocalizedSeverity,
  getLocalizedHighwayName,
  getLocalizedRole
} from '../translations';

interface IncidentDetailsModalProps {
  incident: Incident;
  onClose: () => void;
  onMarkRoadBlocked: (incident: Incident) => void;
  onCreateAlert: (incident: Incident) => void;
  onFindAlternateRoute: (incident: Incident) => void;
  onAssignTeam: (incident: Incident) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  onClose,
  onMarkRoadBlocked,
  onCreateAlert,
  onFindAlternateRoute,
  onAssignTeam
}) => {
  const { t, lang } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black font-mono text-[#ff3e00] border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#0a0a0a]">
              {incident.incidentCode}
            </span>
            <div>
              <h3 className="massive-type font-black text-sm sm:text-base leading-tight uppercase">
                {getLocalizedIncidentType(incident.type, lang)} ({getLocalizedSeverity(incident.severity, lang)} {t.incidentModal?.severity || 'Severity'})
              </h3>
              <div className="text-xs text-neutral-600 font-mono font-bold uppercase">
                {t.alertsScreen?.corridorLabel || 'Corridor'}: <strong className="text-black">{incident.roadCode} ({getLocalizedHighwayName(incident.roadCode, lang)})</strong> • {t.incidentModal?.reportedAt || 'Reported'} {incident.reportedAt}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Image & Location Snapshot */}
          {incident.imageUrl && (
            <div className="relative h-44 border-2 border-black overflow-hidden bg-neutral-100 shadow-[3px_3px_0px_#0a0a0a]">
              <img src={incident.imageUrl} alt="Incident" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-3">
                <div className="flex items-center justify-between w-full font-mono text-[11px] text-white">
                  <span className="flex items-center gap-1.5 font-bold uppercase">
                    <MapPin className="w-3.5 h-3.5 text-[#ff3e00]" />
                    Lat {incident.lat.toFixed(4)}, Lng {incident.lng.toFixed(4)}
                  </span>
                  <span className="px-2 py-0.5 bg-[#ff3e00] text-white border border-black font-black uppercase text-[10px]">
                    STATUS: {incident.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="p-3.5 bg-[#f4f4f4] border-2 border-black space-y-1 shadow-[2px_2px_0px_#0a0a0a]">
            <span className="text-neutral-600 text-[10px] uppercase font-mono font-bold block">
              {t.incidentModal?.fieldOfficerObservations || 'Field Officer Observations:'}:
            </span>
            <p className="text-neutral-900 text-xs font-bold leading-relaxed">{incident.description}</p>
            <div className="text-neutral-600 text-[11px] pt-1 font-bold">
              {t.incidentModal?.reportedBy || 'Reported by'}: <strong className="text-black">{incident.reportedBy}</strong> ({getLocalizedRole(incident.reportedRole, lang)})
            </div>
          </div>

          {/* AI Multimodal Classification Box */}
          {incident.aiClassification && (
            <div className="p-3.5 bg-white border-2 border-black space-y-2 shadow-[3px_3px_0px_#0a0a0a]">
              <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
                <span className="font-black text-black font-mono text-xs uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff3e00]" /> {t.incidentModal?.aiDisruptionAssessment || 'AI Disruption Impact Assessment'}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-[#f4f4f4] text-black border border-black font-black uppercase">
                  {incident.aiClassification.confidence}% {t.fieldOfficer?.confidence || 'Confidence'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-800 space-y-1 font-bold">
                <div>
                  Impact: <strong className="text-black font-black">{incident.aiClassification.roadImpact}</strong>
                </div>
                <p className="leading-relaxed text-neutral-700">{incident.aiClassification.recommendedAction}</p>
              </div>
            </div>
          )}

          {/* Logistics Impact Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.incidentModal?.vehiclesAffected || 'Vehicles Affected'}</span>
              <span className="text-base font-black text-black">{incident.vehiclesAffected}</span>
            </div>
            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.incidentModal?.deliveriesImpacted || 'Deliveries Impacted'}</span>
              <span className="text-base font-black text-[#ff3e00]">{incident.deliveriesAffected}</span>
            </div>
            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.incidentModal?.disruptionRisk || 'Disruption Risk'}</span>
              <span className="text-base font-black text-black">{incident.aiRiskScore}/100</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-5 py-3.5 bg-[#f4f4f4] border-t-2 border-black grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            id="btn-incident-mark-blocked"
            onClick={() => onMarkRoadBlocked(incident)}
            className="p-2 bg-red-600 hover:bg-black text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" /> {t.fieldOfficer?.markBlocked || 'Mark Blocked'}
          </button>

          <button
            id="btn-incident-create-alert"
            onClick={() => onCreateAlert(incident)}
            className="p-2 bg-white hover:bg-neutral-100 text-black text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.incidentModal?.broadcastAlert || 'Broadcast Alert'}
          </button>

          <button
            id="btn-incident-find-alternate"
            onClick={() => onFindAlternateRoute(incident)}
            className="p-2 bg-[#ff3e00] hover:bg-black text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> {t.incidentModal?.alternate || 'Alternate'}
          </button>

          <button
            id="btn-incident-assign-team"
            onClick={() => onAssignTeam(incident)}
            className="p-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-white" /> {t.incidentModal?.assignTeam || 'Assign Team'}
          </button>
        </div>
      </div>
    </div>
  );
};
