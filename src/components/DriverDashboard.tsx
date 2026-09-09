import React, { useState } from 'react';
import { User, Vehicle, Delivery, Road } from '../types';
import { INITIAL_VEHICLES } from '../data/nerData';
import { DriverProgressTracker } from './DriverProgressTracker';
import {
  Truck,
  Package,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Compass,
  PhoneCall,
  ArrowRight,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedCargo,
  getLocalizedLocation
} from '../translations';

interface DriverDashboardProps {
  currentUser: User;
  vehicles: Vehicle[];
  roads: Road[];
  onAcceptReroute: () => void;
  onOpenRouteOptions: () => void;
  onOpenReportModal: () => void;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  currentUser,
  vehicles,
  roads,
  onAcceptReroute,
  onOpenRouteOptions,
  onOpenReportModal
}) => {
  const { t, lang } = useTranslation();
  // Find vehicle assigned to driver or default to TNX-1042
  const safeVehicles = vehicles && vehicles.length > 0 ? vehicles : INITIAL_VEHICLES;
  const vehicle = safeVehicles.find((v) => v.vehicleNumber === 'TNX-1042') || safeVehicles[0];
  const isRerouted = vehicle ? vehicle.status === 'REROUTED' : false;

  // Delivery Milestone Stages localized
  const stages = [
    { label: t.driver.stageDispatched || 'Dispatched', sub: `${getLocalizedLocation('Guwahati', lang)} Depot`, done: true },
    { label: t.driver.stageLoaded || 'Loaded & Sealed', sub: t.driver.coldChainVerified || 'Cold Storage Verified', done: true },
    { label: t.driver.stageDeparted || 'Departed Gateway', sub: `${getLocalizedLocation('Bhalukpong', lang)} Check`, done: true },
    { label: t.driver.stageInTransit || 'In Transit', sub: isRerouted ? `${getLocalizedLocation('Shergaon', lang)} Bypass` : 'En route NH-13', active: true },
    { label: t.driver.stageHighPass || 'Sela High-Pass', sub: 'Elevation 4,170m', done: false },
    { label: t.driver.stageHandover || 'Handover Delivery', sub: `${getLocalizedLocation('Tawang', lang)} Hospital`, done: false }
  ];

  const [sosTriggered, setSosTriggered] = useState(false);

  return (
    <div className="space-y-6 pb-20 text-[#0a0a0a]">
      {/* Driver Cockpit Header */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase tracking-widest">
              {t.driver.cockpitTitle}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              {t.driver.vehicleLabel || 'VEHICLE'} // {vehicle.vehicleNumber}
            </span>
          </div>
          <h1 className="massive-type text-2xl sm:text-4xl uppercase tracking-tighter text-[#0a0a0a] mt-2">
            {t.driver.pilotLabel} // {vehicle.driverName}
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 max-w-xl mt-1">
            {t.driver.cockpitDesc}
          </p>
        </div>

        {/* SOS Button */}
        <button
          onClick={() => setSosTriggered(!sosTriggered)}
          className={`px-5 py-2.5 border-2 border-black text-xs font-black uppercase tracking-wider font-mono transition flex items-center gap-2 shadow-[3px_3px_0px_#0a0a0a] ${
            sosTriggered
              ? 'bg-[#ff3e00] text-white animate-pulse'
              : 'bg-white hover:bg-neutral-100 text-[#ff3e00]'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          {sosTriggered ? t.driver.sosSentAlert : t.driver.emergencySosBtn}
        </button>
      </div>

      {/* Disruption Alert Card (if not yet rerouted, or showing reroute status) */}
      {!isRerouted ? (
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#ff3e00] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ff3e00] text-white border-2 border-black flex items-center justify-center font-black shadow-[2px_2px_0px_#0a0a0a] shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-[#0a0a0a] text-white font-mono text-[10px] font-black uppercase tracking-widest">
                {t.driver.corridorBlockedAhead}
              </span>
              <h3 className="massive-type text-xl sm:text-2xl uppercase tracking-tight text-[#0a0a0a] mt-1">
                {t.driver.rockslideWarning}
              </h3>
            </div>
          </div>

          <p className="text-xs font-bold text-neutral-700 leading-relaxed uppercase tracking-wide">
            {t.driver.aiRerouteDesc || 'Central Command has shut down direct NH-13 passage. The AI routing engine has synthesized an immediate safe bypass via Shergaon.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              id="btn-driver-accept-reroute"
              onClick={onAcceptReroute}
              className="w-full sm:flex-1 py-3.5 px-5 bg-[#ff3e00] hover:bg-[#0a0a0a] text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> {t.driver.acceptRerouteBtn}
            </button>
            <button
              onClick={onOpenRouteOptions}
              className="w-full sm:w-auto py-3.5 px-5 bg-white hover:bg-neutral-100 border-2 border-black text-[#0a0a0a] font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
            >
              {t.driver.compareAlternativesBtn}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#ff3e00]" />
              <span className="font-black text-sm uppercase tracking-wider text-[#0a0a0a] font-mono">
                {t.driver.bypassedSuccessMsg}
              </span>
            </div>
            <span className="px-2 py-0.5 bg-[#0a0a0a] text-white font-mono text-[10px] font-black uppercase tracking-widest">
              RISK: 24% (-62%)
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-600">
            {t.driver.coldChainVerified} • Border Roads Taskforce cleared road conditions through Kalaktang pass.
          </p>
        </div>
      )}

      {/* Visual Progress Tracking with Color-Coded ETA Confidence */}
      <DriverProgressTracker
        vehicle={vehicle}
        roads={roads}
        isRerouted={isRerouted}
        onAcceptReroute={onAcceptReroute}
        onOpenRouteOptions={onOpenRouteOptions}
      />

      {/* Convoy Telemetry Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 font-mono text-center">
        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] block font-sans">ETA</span>
          <span className="massive-type text-3xl text-[#0a0a0a] block mt-1">{vehicle.eta}</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block font-sans mt-1">Arrival prob 94%</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] block font-sans">Distance</span>
          <span className="massive-type text-3xl text-[#0a0a0a] block mt-1">248 KM</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block font-sans mt-1">Avg 34 km/h</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] block font-sans">Cold-Chain</span>
          <span className="massive-type text-3xl text-[#ff3e00] block mt-1">3.8°C</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff3e00] block font-sans mt-1">Target 2-8°C</span>
        </div>

        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a]">
          <span className="text-[#0a0a0a]/60 text-[10px] font-black uppercase tracking-[0.2em] block font-sans">Route Risk</span>
          <span className={`massive-type text-3xl block mt-1 ${isRerouted ? 'text-[#0a0a0a]' : 'text-[#ff3e00]'}`}>
            {vehicle.riskScore}/100
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block font-sans mt-1">
            {isRerouted ? 'LOW RISK' : 'HIGH RISK'}
          </span>
        </div>
      </div>

      {/* Cargo Dossier */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[#0a0a0a] font-mono flex items-center gap-2">
            <Package className="w-4 h-4 text-[#ff3e00]" /> {t.driver.consignmentTitle}
          </h3>
          <span className="px-2 py-0.5 bg-[#ff3e00] text-white font-mono text-[10px] font-black uppercase tracking-widest">
            PRIORITY: 98/100 (CRITICAL)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500 block">Cargo Description</span>
            <span className="font-black text-sm uppercase tracking-tight text-[#0a0a0a] mt-0.5 block">
              {getLocalizedCargo(vehicle.cargo, lang)}
            </span>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mt-1">
              Weight: 4.8 Metric Tonnes • Cryo Container ({t.driver.coldChainVerified})
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-neutral-500 block">Transit Vector</span>
            <div className="font-black text-sm uppercase tracking-tight text-[#0a0a0a] mt-0.5">
              {getLocalizedLocation(vehicle.origin, lang)} <span className="text-[#ff3e00]">→</span> <strong>{getLocalizedLocation(vehicle.destination, lang)}</strong>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mt-1">
              Consignee: Chief Medical Superintendent, {getLocalizedLocation(vehicle.destination, lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Tracker (Section 17) */}
      <div className="p-6 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-4">
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-[#0a0a0a] font-mono flex items-center gap-2 border-b-2 border-black pb-2">
          <Clock className="w-4 h-4 text-[#0a0a0a]" /> {t.driver.transitMilestones}
        </h3>

        <div className="relative pl-6 space-y-5 border-l-2 border-black">
          {stages.map((stage, idx) => (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 w-4 h-4 border-2 border-black ${
                  stage.done
                    ? 'bg-[#0a0a0a]'
                    : stage.active
                    ? 'bg-[#ff3e00]'
                    : 'bg-white'
                }`}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black uppercase tracking-wider ${stage.active ? 'text-[#ff3e00]' : 'text-[#0a0a0a]'}`}>
                    {stage.label}
                  </span>
                  {stage.active && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#0a0a0a] text-white font-black uppercase">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">{stage.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Driver Ground Report Prompt */}
      <div className="p-4 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between text-xs">
        <div>
          <span className="font-black uppercase tracking-wider text-[#0a0a0a] block">
            {t.driver.reportHazardBtn}
          </span>
          <span className="text-neutral-600 text-[11px] font-bold">
            Report ground conditions instantly even without internet.
          </span>
        </div>
        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#ff3e00] text-white font-black uppercase tracking-wider font-mono text-xs transition shrink-0 border border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
        >
          {t.driver.reportHazardBtn}
        </button>
      </div>
    </div>
  );
};

