import React, { useState } from 'react';
import { Alert, Road } from '../types';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Navigation,
  MapPin,
  Clock,
  Sparkles,
  Filter,
  Check
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedSeverity,
  getLocalizedHighwayName,
  getLocalizedLocation
} from '../translations';
import { INITIAL_ROADS } from '../data/nerData';

interface AlertCenterScreenProps {
  alerts: Alert[];
  roads?: Road[];
  onAcknowledgeAlert: (alertId: string) => void;
  onViewOnMap: (roadCode?: string) => void;
  onTriggerReroute: (roadCode?: string) => void;
}

export const AlertCenterScreen: React.FC<AlertCenterScreenProps> = ({
  alerts,
  roads = INITIAL_ROADS,
  onAcknowledgeAlert,
  onViewOnMap,
  onTriggerReroute
}) => {
  const { t, lang } = useTranslation();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity.toUpperCase() === filter;
  });

  return (
    <div className="space-y-5 pb-20 text-[#0a0a0a] font-sans">
      {/* Header */}
      <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ff3e00] text-white font-black uppercase tracking-wider border border-black">
              {t.alertsScreen?.earlyWarningDispatch || 'EARLY WARNING DISPATCH'}
            </span>
            <span className="text-xs text-neutral-600 font-mono font-bold uppercase">
              {alerts.length} {t.alertsScreen?.totalAlertsInQueue || 'Total Alerts In Queue'}
            </span>
          </div>
          <h1 className="massive-type text-2xl sm:text-3xl text-[#0a0a0a] uppercase tracking-tight mt-1">
            {t.alertsScreen?.title || 'Regional Alert Command'}
          </h1>
          <p className="text-xs text-neutral-600 max-w-xl mt-0.5 font-medium">
            {t.alertsScreen?.subtitle || 'Real-time multi-hazard warnings synthesized from radar, geological slope sensors, and officer field reports.'}
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-[#f4f4f4] p-1 border-2 border-black text-xs font-mono">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 transition font-black uppercase text-[11px] cursor-pointer ${
                filter === f
                  ? 'bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#ff3e00]'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {f === 'ALL'
                ? t.alertsScreen?.filterAll || 'ALL'
                : f === 'CRITICAL'
                ? t.alertsScreen?.filterCritical || 'CRITICAL'
                : f === 'HIGH'
                ? t.alertsScreen?.filterHigh || 'HIGH'
                : f === 'MEDIUM'
                ? t.alertsScreen?.filterMedium || 'MEDIUM'
                : t.alertsScreen?.filterInfo || 'INFO'}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] text-neutral-500 font-mono text-xs uppercase font-bold">
            {t.alertsScreen?.noAlertsMatch || 'No active alerts matching filter'} "{filter}".
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`p-4 sm:p-5 border-2 border-black transition-all ${
                  isCritical
                    ? 'bg-red-50 shadow-[4px_4px_0px_#ff3e00]'
                    : isHigh
                    ? 'bg-amber-50 shadow-[4px_4px_0px_#0a0a0a]'
                    : 'bg-white shadow-[4px_4px_0px_#0a0a0a]'
                } ${alert.acknowledged ? 'opacity-65' : ''}`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-2 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-white ${
                        isCritical
                          ? 'bg-[#ff3e00]'
                          : isHigh
                          ? 'bg-amber-600'
                          : 'bg-black'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </span>

                    <div>
                      <h3 className="font-black text-sm sm:text-base text-[#0a0a0a] uppercase tracking-tight font-mono">{alert.title}</h3>
                      <div className="text-[11px] text-neutral-600 font-mono mt-0.5 flex items-center gap-2 font-bold uppercase flex-wrap">
                        <span>
                          {t.alertsScreen?.corridorLabel || 'Corridor'}: <strong className="text-black">{alert.roadCode} ({getLocalizedHighwayName(alert.roadCode, lang)})</strong>
                        </span>
                        <span>• {alert.timestamp}</span>
                        {alert.district && (
                          <span>
                            • {t.alertsScreen?.districtLabel || 'District'}: {getLocalizedLocation(alert.district, lang)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`px-2.5 py-0.5 border-2 border-black text-[10px] font-mono font-black uppercase tracking-wider ${
                        isCritical
                          ? 'bg-[#ff3e00] text-white'
                          : isHigh
                          ? 'bg-amber-500 text-black'
                          : 'bg-black text-white'
                      }`}
                    >
                      {getLocalizedSeverity(alert.severity, lang)}
                    </span>

                    {alert.acknowledged && (
                      <span className="px-2 py-0.5 bg-white text-black border-2 border-black text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#ff3e00]" /> {t.alertsScreen?.acknowledgedBadge || 'Acknowledged'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-800 leading-relaxed mb-3 font-medium">{alert.description}</p>

                {/* AI Tactical Directive Box */}
                {alert.recommendedAction && (
                  <div className="p-3 bg-[#f4f4f4] border-2 border-black text-xs mb-3 space-y-1 font-mono">
                    <span className="text-[10px] font-black text-[#ff3e00] uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.alertsScreen?.aiDirectiveLabel || 'AI Tactical Directive'}:
                    </span>
                    <p className="text-[#0a0a0a] text-xs font-bold">{alert.recommendedAction}</p>
                  </div>
                )}

                {/* Card Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t-2 border-black text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] font-bold transition flex items-center gap-1.5 text-[11px] uppercase cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" /> {t.alertsScreen?.acknowledgeBtn || 'Acknowledge Alert'}
                      </button>
                    )}

                    <button
                      onClick={() => onViewOnMap(alert.roadCode)}
                      className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] font-bold transition flex items-center gap-1.5 text-[11px] uppercase cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.alertsScreen?.locateOnGisBtn || 'Locate on GIS'}
                    </button>
                  </div>

                  <button
                    onClick={() => onTriggerReroute(alert.roadCode)}
                    className="px-4 py-1.5 bg-[#ff3e00] hover:bg-black text-white font-black uppercase tracking-wider transition flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" /> {t.alertsScreen?.triggerRerouteBtn || 'Trigger Multi-Factor Reroute'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const AnalyticsScreen: React.FC<{
  roads: Road[];
  onOpenDistrict: (distId: string) => void;
}> = ({ roads, onOpenDistrict }) => {
  const { t, lang } = useTranslation();
  return (
    <div className="space-y-5 pb-20 text-[#0a0a0a] font-sans">
      {/* Header */}
      <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white font-black uppercase tracking-wider border border-black">
            REGIONAL LOGISTICS INTELLIGENCE
          </span>
          <span className="text-xs text-neutral-600 font-mono font-bold uppercase">Q3 Performance Benchmark</span>
        </div>
        <h1 className="massive-type text-2xl sm:text-3xl text-[#0a0a0a] uppercase tracking-tight mt-1">
          Accessibility & Disruption Analytics
        </h1>
        <p className="text-xs text-neutral-600 max-w-xl mt-0.5 font-medium">
          Longitudinal historical analysis comparing AI predictive rerouting outcomes against legacy transit corridors.
        </p>
      </div>

      {/* AI Impact Scorecard (Section 34) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-neutral-600 text-[11px] font-bold uppercase block mb-1">Average Risk Reduction</span>
          <span className="text-2xl font-black text-[#ff3e00]">-62.4%</span>
          <span className="text-[10px] text-neutral-500 block uppercase font-bold">via predictive corridors</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-neutral-600 text-[11px] font-bold uppercase block mb-1">Travel Hours Saved</span>
          <span className="text-2xl font-black text-black">3.8 hrs</span>
          <span className="text-[10px] text-neutral-500 block uppercase font-bold">per mountainous convoy</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-neutral-600 text-[11px] font-bold uppercase block mb-1">Critical Deliveries</span>
          <span className="text-2xl font-black text-[#ff3e00]">98.4%</span>
          <span className="text-[10px] text-neutral-500 block uppercase font-bold">zero stockouts</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-neutral-600 text-[11px] font-bold uppercase block mb-1">Prediction Accuracy</span>
          <span className="text-2xl font-black text-black">91.8%</span>
          <span className="text-[10px] text-neutral-500 block uppercase font-bold">ground truth verified</span>
        </div>
      </div>

      {/* Incident Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
          <h3 className="font-black text-xs uppercase tracking-wider text-black font-mono">
            Incident Breakdown by Hazard Category
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { type: 'Landslides & Rockfall', pct: 42, count: '64 recorded', color: 'bg-[#ff3e00]' },
              { type: 'Flash Floods & River Swell', pct: 28, count: '43 recorded', color: 'bg-black' },
              { type: 'Road & Pavement Fracture', pct: 18, count: '27 recorded', color: 'bg-amber-500' },
              { type: 'Bridge Load Restriction', pct: 12, count: '18 recorded', color: 'bg-neutral-600' }
            ].map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-[#0a0a0a] uppercase">{item.type}</span>
                  <span className="font-mono text-black font-black">{item.pct}% ({item.count})</span>
                </div>
                <div className="w-full h-2.5 bg-[#f4f4f4] overflow-hidden border border-black">
                  <div className={`h-full ${item.color} border-r border-black`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top High-Risk Corridors */}
        <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
          <h3 className="font-black text-xs uppercase tracking-wider text-black font-mono">
            Most Vulnerable Arterial Corridors
          </h3>

          <div className="space-y-2.5 text-xs font-mono">
            {roads.map((road) => (
              <div
                key={road.id}
                className="p-3 bg-[#f4f4f4] border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_#0a0a0a]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[#ff3e00]">{road.code}</span>
                    <span className="text-black font-bold uppercase">{getLocalizedHighwayName(road.code, lang)}</span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-bold uppercase">{road.state} • {road.historicalLandslideCount} historical slides</div>
                </div>

                <div className="text-right font-mono">
                  <span className="text-sm font-black text-[#ff3e00]">{road.riskScore}</span>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">Risk Score</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
