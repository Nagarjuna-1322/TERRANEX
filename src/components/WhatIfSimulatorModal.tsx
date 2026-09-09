import React, { useState } from 'react';
import { SimulationParams, SimulationResult } from '../types';
import { api } from '../services/api';
import {
  Sliders,
  CloudRain,
  Car,
  XCircle,
  Zap,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Truck,
  ShieldAlert
} from 'lucide-react';

interface WhatIfSimulatorModalProps {
  onClose: () => void;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({ onClose }) => {
  const [params, setParams] = useState<SimulationParams>({
    rainfallIncreasePercent: 30,
    trafficIncreasePercent: 20,
    roadClosureCount: 2,
    emergencyDemand: 'HIGH'
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult>({
    affectedDistricts: 7,
    potentialDelaysHours: 2.4,
    atRiskDeliveries: 14,
    recommendedAlternateCorridors: 5,
    additionalVehiclesNeeded: 8,
    criticalHospitalSupplyAtRisk: 6,
    timestamp: new Date().toISOString()
  });

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const res = await api.runSimulation(params);
      if (res.result) {
        setResult(res.result);
      }
    } catch (err) {
      console.warn('Simulation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-3xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff3e00] text-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="massive-type font-black text-sm sm:text-base flex items-center gap-2 uppercase">
                Logistics Scenario Simulator
                <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white border border-black uppercase font-bold">
                  WHAT-IF STRESS TESTING
                </span>
              </h3>
              <div className="text-xs text-neutral-600 font-bold uppercase">
                Predict supply-chain vulnerabilities under cascading weather and traffic crises
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a]"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
            {/* Rainfall Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-black uppercase flex items-center gap-1.5 font-black">
                  <CloudRain className="w-3.5 h-3.5 text-[#ff3e00]" /> Additional Rainfall
                </span>
                <span className="font-mono font-black text-[#ff3e00]">+{params.rainfallIncreasePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={params.rainfallIncreasePercent}
                onChange={(e) => setParams({ ...params, rainfallIncreasePercent: Number(e.target.value) })}
                className="w-full accent-[#ff3e00] cursor-pointer"
              />
              <span className="text-[10px] text-neutral-600 uppercase font-bold block">Triggers mudslides and culvert washouts in foothills</span>
            </div>

            {/* Traffic Congestion Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-black uppercase flex items-center gap-1.5 font-black">
                  <Car className="w-3.5 h-3.5 text-[#ff3e00]" /> Commercial Traffic Surge
                </span>
                <span className="font-mono font-black text-black">+{params.trafficIncreasePercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={params.trafficIncreasePercent}
                onChange={(e) => setParams({ ...params, trafficIncreasePercent: Number(e.target.value) })}
                className="w-full accent-black cursor-pointer"
              />
              <span className="text-[10px] text-neutral-600 uppercase font-bold block">Reduces corridor average speed on single-lane sectors</span>
            </div>

            {/* Road Closures Count */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-black uppercase flex items-center gap-1.5 font-black">
                  <XCircle className="w-3.5 h-3.5 text-red-600" /> Concurrent Road Closures
                </span>
                <span className="font-mono font-black text-red-600">{params.roadClosureCount} corridors</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                step="1"
                value={params.roadClosureCount}
                onChange={(e) => setParams({ ...params, roadClosureCount: Number(e.target.value) })}
                className="w-full accent-red-600 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-600 uppercase font-bold block">Major arteries severed (e.g. NH-13, NH-29)</span>
            </div>

            {/* Emergency Demand */}
            <div className="space-y-1.5">
              <span className="text-black uppercase flex items-center gap-1.5 font-black">
                <Zap className="w-3.5 h-3.5 text-[#ff3e00]" /> Medical & Relief Demand Posture
              </span>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(['NORMAL', 'HIGH', 'SURGE'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setParams({ ...params, emergencyDemand: lvl })}
                    className={`py-1.5 border-2 border-black font-mono text-[11px] font-black uppercase transition shadow-[2px_2px_0px_#0a0a0a] ${
                      params.emergencyDemand === lvl
                        ? 'bg-[#ff3e00] text-white'
                        : 'bg-white text-black hover:bg-neutral-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Simulate Action Button */}
          <div className="flex justify-center">
            <button
              id="btn-run-simulation"
              onClick={handleSimulate}
              disabled={isLoading}
              className="px-8 py-3 bg-[#ff3e00] hover:bg-black text-white font-black text-xs border-2 border-black shadow-[4px_4px_0px_#0a0a0a] transition flex items-center gap-2 font-mono uppercase tracking-wider"
            >
              <Zap className="w-4 h-4" />
              {isLoading ? 'Computing Stress Engine...' : 'Run Scenario Simulation'}
            </button>
          </div>

          {/* Simulation Output Dashboard */}
          {result && (
            <div className="p-4 bg-white border-2 border-black space-y-4 shadow-[3px_3px_0px_#0a0a0a]">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-black text-black font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#ff3e00]" /> Predictive Impact Analysis
                </span>
                <span className="text-[10px] text-neutral-600 font-mono font-bold uppercase">
                  Generated {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono">
                <div className="p-3 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                  <span className="text-neutral-600 text-[10px] block uppercase font-bold">Affected Districts</span>
                  <span className="text-xl font-black text-black">{result.affectedDistricts}</span>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">isolated / restricted</span>
                </div>

                <div className="p-3 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                  <span className="text-neutral-600 text-[10px] block uppercase font-bold">Potential Added Delays</span>
                  <span className="text-xl font-black text-[#ff3e00]">+{result.potentialDelaysHours} hrs</span>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">avg supply lag</span>
                </div>

                <div className="p-3 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                  <span className="text-neutral-600 text-[10px] block uppercase font-bold">At-Risk Deliveries</span>
                  <span className="text-xl font-black text-red-600">{result.atRiskDeliveries}</span>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">
                    ({result.criticalHospitalSupplyAtRisk} hospital convoys)
                  </span>
                </div>

                <div className="p-3 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                  <span className="text-neutral-600 text-[10px] block uppercase font-bold">Recommended Alternate</span>
                  <span className="text-xl font-black text-black">{result.recommendedAlternateCorridors}</span>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">bypass corridors ready</span>
                </div>

                <div className="p-3 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a] col-span-2 sm:col-span-2">
                  <span className="text-neutral-600 text-[10px] block uppercase font-bold">Additional Vehicles Needed</span>
                  <span className="text-xl font-black text-[#ff3e00]">+{result.additionalVehiclesNeeded} units</span>
                  <span className="text-[10px] text-neutral-600 block uppercase font-bold">
                    Reserve fleet mobilization required to maintain delivery throughput
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#f4f4f4] border-t-2 border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-neutral-100 text-black text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a]"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
