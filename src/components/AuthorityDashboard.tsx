import React from 'react';
import { User, Road, Vehicle, Delivery, Incident, NewsArticle } from '../types';
import {
  Truck,
  Package,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  Sparkles,
  Navigation,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Activity,
  Newspaper
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedHighwayName,
  getLocalizedRoadStatus,
  getLocalizedDeliveryStatus,
  getLocalizedCargo,
  getLocalizedWeather,
  getLocalizedLocation
} from '../translations';

interface AuthorityDashboardProps {
  currentUser: User;
  roads: Road[];
  vehicles: Vehicle[];
  deliveries: Delivery[];
  incidents: Incident[];
  newsArticles?: NewsArticle[];
  onSelectRoad: (road: Road) => void;
  onSelectDelivery: (delivery: Delivery) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onOpenSimulation: () => void;
  onOpenEmergency: () => void;
  onOpenMap: () => void;
  onOptimizeAll: () => void;
  onOpenNewsRadar?: () => void;
}

export const AuthorityDashboard: React.FC<AuthorityDashboardProps> = ({
  currentUser,
  roads,
  vehicles,
  deliveries,
  incidents,
  newsArticles = [],
  onSelectRoad,
  onSelectDelivery,
  onSelectVehicle,
  onOpenSimulation,
  onOpenEmergency,
  onOpenMap,
  onOptimizeAll,
  onOpenNewsRadar
}) => {
  const { t, lang } = useTranslation();
  const highRiskRoads = roads.filter((r) => r.status === 'HIGH_RISK' || r.status === 'BLOCKED');
  const criticalDeliveries = deliveries.filter((d) => d.priorityScore > 80);

  // Regional Accessibility Calculation
  const totalRoads = roads.length || 1;
  const blockedCount = roads.filter((r) => r.status === 'BLOCKED').length;
  const restrictedCount = roads.filter((r) => r.status === 'HIGH_RISK' || r.accessibility === 'Restricted').length;
  const accessibleCount = totalRoads - blockedCount - restrictedCount;

  const blockedPct = Math.round((blockedCount / totalRoads) * 100);
  const restrictedPct = Math.round((restrictedCount / totalRoads) * 100);
  const accessiblePct = 100 - blockedPct - restrictedPct;

  return (
    <div className="space-y-6 pb-20 text-[#0a0a0a]">
      {/* Top Greeting & Operational Status Banner */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase tracking-widest">
              {t.authority.commandHq || 'NER COMMAND HQ • GUWAHATI'}
            </span>
            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#0a0a0a]/50 font-mono">
              {t.authority.telemetryLive}
            </span>
          </div>
          <h1 className="massive-type text-2xl sm:text-4xl text-[#0a0a0a] uppercase tracking-tighter mt-2">
            {t.authority.overwatchTitle} // {currentUser.name}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 max-w-xl mt-1">
            {t.authority.overwatchDesc}
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            id="btn-dash-emergency"
            onClick={onOpenEmergency}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#ff3e00] hover:bg-red-600 border-2 border-black text-white text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0a0a0a]"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            {t.authority.crisisPostBtn}
          </button>

          <button
            id="btn-dash-what-if"
            onClick={onOpenSimulation}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-neutral-100 border-2 border-black text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-[3px_3px_0px_#0a0a0a]"
          >
            <Sliders className="w-4 h-4 text-[#ff3e00]" />
            {t.authority.whatIfBtn}
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] font-mono">
          <div className="flex items-center justify-between text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans mb-1">
            <span>{t.authority.convoys || 'Convoys'}</span>
            <Truck className="w-4 h-4 text-[#0a0a0a]" />
          </div>
          <div className="massive-type text-4xl text-[#0a0a0a] leading-none">126</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]/50 font-sans mt-1">
            {t.authority.inActiveTransit || 'In active transit'}
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] font-mono">
          <div className="flex items-center justify-between text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans mb-1">
            <span>{t.authority.deliveries || 'Deliveries'}</span>
            <Package className="w-4 h-4 text-[#0a0a0a]" />
          </div>
          <div className="massive-type text-4xl text-[#0a0a0a] leading-none">89</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]/50 font-sans mt-1">
            {t.authority.suppliesEnRoute || 'Supplies en route'}
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] font-mono">
          <div className="flex items-center justify-between text-[#ff3e00] text-[10px] font-black uppercase tracking-[0.2em] font-sans mb-1">
            <span>{t.authority.blockages || 'Blockages'}</span>
            <XCircle className="w-4 h-4 text-[#ff3e00]" />
          </div>
          <div className="massive-type text-4xl text-[#ff3e00] leading-none">{blockedCount}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#ff3e00] font-sans mt-1">
            {t.authority.corridorsClosed || 'Corridors closed'}
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] font-mono">
          <div className="flex items-center justify-between text-[#ff3e00] text-[10px] font-black uppercase tracking-[0.2em] font-sans mb-1">
            <span>{t.authority.highRisk || 'High-Risk'}</span>
            <AlertTriangle className="w-4 h-4 text-[#ff3e00]" />
          </div>
          <div className="massive-type text-4xl text-[#0a0a0a] leading-none">{restrictedCount}</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#0a0a0a]/60 font-sans mt-1">
            {t.authority.probOver70 || 'Probability > 70%'}
          </div>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] font-mono col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] font-sans mb-1">
            <span>{t.authority.atRiskDel || 'At-Risk Del.'}</span>
            <Activity className="w-4 h-4 text-[#0a0a0a]" />
          </div>
          <div className="massive-type text-4xl text-[#ff3e00] leading-none">17</div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#ff3e00] font-sans mt-1">
            {t.authority.requiresReroute || 'Requires reroute'}
          </div>
        </div>
      </div>

      {/* Regional Accessibility Status Bar (Section 10) */}
      <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-black text-[#0a0a0a] uppercase tracking-[0.2em] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#ff3e00]" /> {t.authority.regionalArterial || 'Regional Arterial Network Accessibility'}
          </span>
          <span className="text-[10px] font-mono font-bold uppercase text-[#0a0a0a]/60 tracking-wider">
            {t.authority.corridorLength || 'Corridor Length: 2,420 KM'}
          </span>
        </div>

        {/* Stacked Accessibility Progress Bar */}
        <div className="w-full h-4 bg-[#f4f4f4] border-2 border-black flex overflow-hidden">
          <div
            style={{ width: `${accessiblePct}%` }}
            className="h-full bg-[#0a0a0a] transition-all duration-500"
            title={`${t.authority.accessiblePct || 'Accessible'}: ${accessiblePct}%`}
          />
          <div
            style={{ width: `${restrictedPct}%` }}
            className="h-full bg-[#ff3e00] transition-all duration-500"
            title={`${t.authority.restrictedPct || 'Restricted'}: ${restrictedPct}%`}
          />
          <div
            style={{ width: `${blockedPct}%` }}
            className="h-full bg-neutral-400 transition-all duration-500"
            title={`${t.authority.blockedPct || 'Blocked'}: ${blockedPct}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider pt-1 font-mono">
          <span className="flex items-center gap-1.5 text-[#0a0a0a]">
            <span className="w-3 h-3 bg-[#0a0a0a] border border-black inline-block"></span> {t.authority.accessiblePct || 'Accessible'} ({accessiblePct}%)
          </span>
          <span className="flex items-center gap-1.5 text-[#ff3e00]">
            <span className="w-3 h-3 bg-[#ff3e00] border border-black inline-block"></span> {t.authority.restrictedPct || 'Restricted'} ({restrictedPct}%)
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600">
            <span className="w-3 h-3 bg-neutral-400 border border-black inline-block"></span> {t.authority.blockedPct || 'Blocked'} ({blockedPct}%)
          </span>
        </div>
      </div>

      {/* AI Regional Risk Spotlight Card (Section 11) */}
      <div className="p-6 bg-[#0a0a0a] text-white border-2 border-black shadow-[4px_4px_0px_#ff3e00] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-[#0a0a0a] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#ff3e00]">
              <Sparkles className="w-5 h-5 text-[#ff3e00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg uppercase tracking-tight text-white">
                  {t.authority.aiRiskMatrix || 'AI Disruption Risk Matrix'}
                </span>
                <span className="px-2 py-0.5 bg-[#ff3e00] text-white font-mono text-[10px] font-black uppercase tracking-widest">
                  {t.authority.postureElevated || 'POSTURE: ELEVATED (63/100)'}
                </span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-0.5">
                {t.authority.predictiveModelSub || 'Predictive model trained on 10 years of Geological Survey & IMD Doppler radar'}
              </p>
            </div>
          </div>

          <button
            id="btn-optimize-all-routes"
            onClick={onOptimizeAll}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition flex items-center gap-2 shadow-[2px_2px_0px_#ff3e00]"
          >
            <Navigation className="w-3.5 h-3.5" /> {t.authority.optimizeAllCorridors || t.authority.optimizeAllBtn}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 bg-[#171717] border-2 border-white/20">
            <span className="text-[10px] text-[#ff3e00] font-mono font-black uppercase tracking-widest block">
              {t.authority.disruptionOutlook || 'Disruption Outlook'}
            </span>
            <p className="text-white font-bold mt-1.5 leading-relaxed">
              {t.authority.disruptionOutlookDesc || 'Landslide likelihood elevated to 82% in high-altitude passes due to antecedent soil saturation.'}
            </p>
          </div>

          <div className="p-4 bg-[#171717] border-2 border-white/20">
            <span className="text-[10px] text-[#ff3e00] font-mono font-black uppercase tracking-widest block">
              {t.authority.primaryDrivers || 'Primary Contributing Drivers'}
            </span>
            <ul className="text-neutral-200 mt-1.5 space-y-1 font-mono text-[11px]">
              <li>• {t.authority.heavyPrecipitation || 'Heavy precipitation (48.5 mm/h)'}</li>
              <li>• {t.authority.steepSlope || 'Steep slope shear stress (>35°)'}</li>
              <li>• {t.authority.activeDebris || '3 active debris flows near Tenga gorge'}</li>
            </ul>
          </div>

          <div className="p-4 bg-[#171717] border-2 border-white/20 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-[#ff3e00] font-mono font-black uppercase tracking-widest block">
                {t.authority.executiveDirective || 'Executive Directive'}
              </span>
              <p className="text-white font-bold mt-1.5 text-xs leading-relaxed">
                {t.authority.executiveDirectiveDesc || 'Reroute anti-venom & oxygen convoys via Shergaon South Bypass corridor immediately.'}
              </p>
            </div>
            <button
              onClick={onOpenMap}
              className="text-[#ff3e00] hover:text-white text-xs font-black uppercase tracking-wider font-mono mt-2 text-left flex items-center gap-1 transition"
            >
              {t.authority.openTacticalMap || 'Open Tactical GIS Map →'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Indian News & Roadblock Intelligence Bar */}
      <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black text-white flex items-center justify-center border border-black shrink-0">
            <Newspaper className="w-5 h-5 text-[#ff3e00]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-xs uppercase tracking-tight text-black">
                {t.authority.liveNewsEngine || 'Live Disaster & News Intelligence Engine'}
              </span>
              <span className="px-1.5 py-0.2 bg-[#ff3e00] text-white text-[9px] font-black uppercase">
                {t.authority.indiaOnly || 'India Only'}
              </span>
              <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-bold">
                {newsArticles.length} {t.authority.bulletinsActive || 'Bulletins Active'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 mt-0.5">
              {t.authority.newsEngineDesc || 'Live NLP analysis of BRO bulletins, ASDMA dispatches, and press reports continuously updates route hazards.'}
            </p>
          </div>
        </div>

        {onOpenNewsRadar && (
          <button
            type="button"
            onClick={onOpenNewsRadar}
            className="px-3.5 py-2 bg-black hover:bg-[#ff3e00] text-white text-xs font-black uppercase tracking-wider border-2 border-black transition flex items-center gap-2 shrink-0 cursor-pointer shadow-[2px_2px_0px_#ff3e00]"
          >
            <Newspaper className="w-3.5 h-3.5" />
            {t.authority.openNewsRadarBtn || 'Open News Radar'} ({newsArticles.filter((a) => a.detectedStatus === 'BLOCKED' || a.detectedStatus === 'HIGH_RISK').length})
          </button>
        )}
      </div>

      {/* Two Columns: High-Risk Corridors & Critical Deliveries (Sections 14, 18, 19) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active High-Risk Corridors */}
        <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#0a0a0a] flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4 text-[#ff3e00]" /> {t.authority.monitoredCorridors || t.authority.highRiskHeader}
            </h3>
            <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500 font-mono">
              {t.authority.inspectAiFactors || 'Inspect AI Factors'}
            </span>
          </div>

          <div className="space-y-2.5">
            {roads.slice(0, 4).map((road) => (
              <div
                key={road.id}
                id={`card-road-${road.code.toLowerCase()}`}
                onClick={() => onSelectRoad(road)}
                className="p-3.5 bg-[#f4f4f4] hover:bg-white border-2 border-black cursor-pointer transition shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-[#0a0a0a] text-sm">{road.code}</span>
                    <span className="text-xs font-black uppercase tracking-tight text-[#0a0a0a]">
                      {getLocalizedHighwayName(road.code, lang) || road.name}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mt-1">
                    {getLocalizedLocation(road.state, lang)} • {getLocalizedWeather(road.weatherCondition, lang)} ({road.rainfallMmH} mm/h)
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider block mb-1 border border-black ${
                      road.status === 'BLOCKED'
                        ? 'bg-[#ff3e00] text-white'
                        : road.status === 'HIGH_RISK'
                        ? 'bg-[#0a0a0a] text-white'
                        : 'bg-white text-[#0a0a0a]'
                    }`}
                  >
                    {getLocalizedRoadStatus(road.status, lang)}
                  </span>
                  <span className="text-xs font-bold text-[#0a0a0a]">
                    {t.authority.riskScoreLabel || 'Risk'}: <strong className="font-black text-sm">{road.riskScore}</strong>/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Supply Deliveries */}
        <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-2">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#0a0a0a] flex items-center gap-2 font-mono">
              <Package className="w-4 h-4 text-[#0a0a0a]" /> {t.authority.priorityDeliveries || t.authority.priorityFleetHeader}
            </h3>
            <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500 font-mono">
              {t.authority.rankedCriticality || 'Ranked Criticality'}
            </span>
          </div>

          <div className="space-y-2.5">
            {criticalDeliveries.slice(0, 4).map((del) => (
              <div
                key={del.id}
                id={`card-delivery-${del.deliveryCode.toLowerCase()}`}
                onClick={() => onSelectDelivery(del)}
                className="p-3.5 bg-[#f4f4f4] hover:bg-white border-2 border-black cursor-pointer transition shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-xs px-1.5 py-0.5 bg-[#0a0a0a] text-white">{del.deliveryCode}</span>
                    <span className="text-xs font-black uppercase tracking-tight text-[#0a0a0a] truncate max-w-[180px] sm:max-w-[220px]">
                      {getLocalizedCargo(del.cargo, lang)}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mt-1">
                    {getLocalizedLocation(del.origin, lang)} → <strong className="text-[#0a0a0a]">{getLocalizedLocation(del.destination, lang)}</strong>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider block mb-1 border border-black ${
                      del.status === 'REROUTED'
                        ? 'bg-[#0a0a0a] text-white'
                        : del.status === 'DELAYED'
                        ? 'bg-[#ff3e00] text-white'
                        : 'bg-white text-[#0a0a0a]'
                    }`}
                  >
                    {getLocalizedDeliveryStatus(del.status, lang)}
                  </span>
                  <span className="text-xs font-black text-[#ff3e00]">
                    {t.authority.priorityScore || 'Priority'} {del.priorityScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

