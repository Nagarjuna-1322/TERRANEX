import React from 'react';
import { User, Incident, Road } from '../types';
import { OfflineSyncService } from '../services/offlineSync';
import { PullToRefresh } from './PullToRefresh';
import {
  PlusCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  RotateCw,
  MapPin,
  Camera,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedIncidentType,
  getLocalizedSeverity,
  getLocalizedLocation
} from '../translations';

interface FieldOfficerHomeProps {
  currentUser: User;
  incidents: Incident[];
  roads: Road[];
  onOpenReportModal: () => void;
  onSelectIncident: (incident: Incident) => void;
  isOnline: boolean;
  onSyncOffline: () => void;
  pendingSyncCount: number;
  onRefresh?: () => Promise<void> | void;
}

export const FieldOfficerHome: React.FC<FieldOfficerHomeProps> = ({
  currentUser,
  incidents,
  roads,
  onOpenReportModal,
  onSelectIncident,
  isOnline,
  onSyncOffline,
  pendingSyncCount,
  onRefresh
}) => {
  const { t, lang } = useTranslation();

  return (
    <div className="space-y-6 pb-20 text-[#0a0a0a]">
      {/* Officer Header Card */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase tracking-widest">
              {t.field.postSectorTitle || 'FIELD INSPECTION POST • SECTOR 3'}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              {t.field.sectorLabel || 'SECTOR'} // {currentUser.district ? getLocalizedLocation(currentUser.district, lang) : getLocalizedLocation('West Kameng', lang)}
            </span>
          </div>
          <h1 className="massive-type text-2xl sm:text-4xl uppercase tracking-tighter text-[#0a0a0a] mt-2">
            {t.field.officerLabel || 'OFFICER'} // {currentUser.name}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 max-w-xl mt-1">
            {t.field.officerSubtitle || 'Log ground truth disruptions, capture GPS coordinates & evidence, and classify terrain risks with AI.'}
          </p>
        </div>

        {/* Big Report Incident CTA */}
        <button
          id="btn-officer-report-incident"
          onClick={onOpenReportModal}
          className="px-5 py-3.5 bg-[#ff3e00] hover:bg-[#0a0a0a] text-white font-black text-xs uppercase tracking-wider font-mono border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2 self-stretch sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          {t.field.reportIncidentBtn || 'Report Ground Incident'}
        </button>
      </div>

      {/* Offline Status & Sync Queue Banner (Section 27 & 28) */}
      <div
        className={`p-5 border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isOnline
            ? 'bg-white text-[#0a0a0a]'
            : 'bg-[#ff3e00] text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black ${
              isOnline ? 'bg-[#0a0a0a] text-white' : 'bg-white text-[#ff3e00] animate-pulse'
            }`}
          >
            {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-black text-xs font-mono uppercase tracking-widest">
              {t.field.networkStatus || 'NETWORK STATUS'} // {isOnline ? (t.field.statusOnline || 'ONLINE & TELEMETRY SYNCED') : (t.field.statusOffline || 'OFFLINE MODE ACTIVE (ZERO CONNECTIVITY)')}
            </div>
            <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${isOnline ? 'text-neutral-600' : 'text-white/90'}`}>
              {isOnline
                ? (t.field.onlineDesc || 'All field reports synchronized with central NER command database.')
                : (t.field.offlineDesc || 'Reports, photos & GPS points are cached securely on local device.')}
            </p>
          </div>
        </div>

        {pendingSyncCount > 0 && (
          <button
            id="btn-officer-sync-now"
            onClick={onSyncOffline}
            className="px-4 py-2.5 bg-white text-[#0a0a0a] hover:bg-neutral-100 font-black text-xs font-mono border-2 border-black uppercase tracking-wider flex items-center gap-2 transition self-stretch sm:self-auto shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
          >
            <RotateCw className="w-4 h-4 animate-spin text-[#ff3e00]" /> {t.field.syncQueueBtn || 'Sync Queue'} ({pendingSyncCount})
          </button>
        )}
      </div>

      {/* Field Operations Metrics (Section 23) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono">
        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans block mb-1">
            {t.field.nearbyIncidents || 'Nearby Incidents'}
          </span>
          <div className="massive-type text-4xl text-[#ff3e00] leading-none">05</div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block font-sans mt-1">
            {t.field.within25Km || 'Within 25 km'}
          </span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans block mb-1">
            {t.field.inspectRequired || 'Inspect Required'}
          </span>
          <div className="massive-type text-4xl text-[#0a0a0a] leading-none">03</div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block font-sans mt-1">
            {t.field.rainfallAlerts || 'Rainfall alerts'}
          </span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans block mb-1">
            {t.field.highRiskSectors || 'High-Risk Sectors'}
          </span>
          <div className="massive-type text-4xl text-[#ff3e00] leading-none">02</div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block font-sans mt-1">
            Km 81.3 & Chumuk.
          </span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans block mb-1">
            {t.field.queuedReports || 'Queued Reports'}
          </span>
          <div className="massive-type text-4xl text-[#0a0a0a] leading-none">{pendingSyncCount}</div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block font-sans mt-1">
            {t.field.queuedForSync || 'Queued for sync'}
          </span>
        </div>
      </div>

      {/* Recent Field Ground Incidents Log with Pull-to-Refresh */}
      <PullToRefresh
        onRefresh={onRefresh || onSyncOffline}
        pullPrompt="Pull down to refresh incident list"
        releasePrompt="Release to update incidents..."
        refreshingPrompt="Updating ground incident logs..."
      >
        <div className="p-4 sm:p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-[#0a0a0a] flex items-center gap-2 font-mono">
              <FileText className="w-4 h-4 text-[#ff3e00]" /> {t.field.activeGroundIncidents || 'Active Ground Incidents in Sector'}
            </h3>
            <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500 font-mono">
              {t.field.actionDetails || 'Action Details'}
            </span>
          </div>

          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="p-4 bg-[#f4f4f4] hover:bg-white border-2 border-black cursor-pointer transition shadow-[2px_2px_0px_#0a0a0a] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  {inc.imageUrl ? (
                    <img
                      src={inc.imageUrl}
                      alt={inc.type}
                      className="w-16 h-16 object-cover border-2 border-black shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white border-2 border-black flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-[#ff3e00]" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs px-1.5 py-0.5 bg-[#0a0a0a] text-white">{inc.incidentCode}</span>
                      <span className="font-black text-xs uppercase tracking-tight text-[#0a0a0a]">
                        {getLocalizedIncidentType(inc.type, lang)}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 border border-black bg-white text-[#0a0a0a] font-bold">
                        {t.field.corridorLabel || 'Corridor'} {inc.roadCode}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-700 mt-1 line-clamp-1 uppercase tracking-wide">
                      {inc.description}
                    </p>
                    <div className="text-[10px] text-neutral-500 font-mono font-bold uppercase mt-1 flex items-center gap-2">
                      <span>Lat {inc.lat.toFixed(3)}, Lng {inc.lng.toFixed(3)}</span>
                      <span>• {inc.reportedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center font-mono shrink-0">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-black ${
                      inc.severity === 'Critical'
                        ? 'bg-[#ff3e00] text-white'
                        : 'bg-[#0a0a0a] text-white'
                    }`}
                  >
                    {getLocalizedSeverity(inc.severity, lang)}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#0a0a0a] mt-1 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3 text-[#ff3e00]" /> {t.field.aiVerified || 'AI Verified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
};

