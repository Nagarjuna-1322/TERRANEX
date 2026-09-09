import React from 'react';
import {
  HelpCircle,
  X,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Truck,
  Shield,
  Layers,
  Newspaper,
  WifiOff,
  Navigation,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../translations';

interface GuideHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectTab?: (tab: string) => void;
  onOpenNewsRadar?: () => void;
  onOpenDemoWalkthrough?: () => void;
}

export const GuideHelpModal: React.FC<GuideHelpModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectTab,
  onOpenNewsRadar,
  onOpenDemoWalkthrough
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="guide-help-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
    >
      <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] w-full max-w-3xl my-auto text-[#0a0a0a] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-black text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#ff3e00] text-white flex items-center justify-center font-black font-mono text-sm border border-white">
              ?
            </div>
            <div>
              <h2
                id="guide-modal-title"
                className="text-base sm:text-lg font-black uppercase tracking-tight font-mono text-white"
              >
                TerraNex Quick Guide & Legend
              </h2>
              <p className="text-xs text-neutral-300 font-sans">
                Everything you need to understand how the platform protects Northeast corridors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 bg-white hover:bg-neutral-200 text-black border border-white flex items-center justify-center font-black transition cursor-pointer"
            title="Close Guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto font-sans text-sm">
          {/* 1. Core Purpose */}
          <div className="bg-[#f8f9fa] border-2 border-black p-4 shadow-[2px_2px_0px_#0a0a0a]">
            <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase tracking-wider font-mono">
              SYSTEM OVERVIEW
            </span>
            <h3 className="text-base font-black uppercase mt-1.5 text-black">
              What is TerraNex?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 mt-1 leading-relaxed">
              <strong>TerraNex</strong> is an all-weather highway logistics and disaster intelligence command system designed specifically for the rugged terrain of <strong>Northeast India (NER)</strong>. It monitors steep mountain passes, detects landslides and weather risks in real time, routes medical & supply convoys safely, and provides instant emergency assistance even when cellular networks fail.
            </p>
          </div>

          {/* 2. Color Codes & Highway Status */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 font-mono mb-2">
              1. Highway Status & Color Codes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border border-black shrink-0" />
                  <span className="font-black text-xs uppercase text-emerald-900 font-mono">
                    ACCESSIBLE (GREEN)
                  </span>
                </div>
                <p className="text-xs text-neutral-700">
                  Highway is completely open with stable pavement, normal cruising speeds, and low weather risk. Safe for all heavy vehicles and passenger transit.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-amber-500 border border-black shrink-0 animate-pulse" />
                  <span className="font-black text-xs uppercase text-amber-900 font-mono">
                    HIGH RISK (YELLOW)
                  </span>
                </div>
                <p className="text-xs text-neutral-700">
                  Precipitation &gt; 35mm/h, steep slope saturation, or dense fog. Speed restrictions enforced. Convoy tracking active with alternate bypasses on standby.
                </p>
              </div>

              <div className="p-3 bg-red-50 border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-red-600 border border-black shrink-0 animate-ping" />
                  <span className="font-black text-xs uppercase text-red-900 font-mono">
                    BLOCKED (RED)
                  </span>
                </div>
                <p className="text-xs text-neutral-700">
                  Debris/mudslide, rockfall, or waterlogging blocking both lanes. Autonomous rerouting triggers immediately to divert convoys around the blockage.
                </p>
              </div>
            </div>
          </div>

          {/* 3. User Modes Explained */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 font-mono mb-2">
              2. App Modes & Roles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs uppercase text-black font-mono">
                    🟢 Easy / Citizen Mode
                  </span>
                  <span className="text-[10px] bg-black text-white px-1.5 py-0.2 font-mono font-bold">DEFAULT</span>
                </div>
                <p className="text-xs text-neutral-600">
                  Simplified, high-contrast interface designed for local citizens, civilian commuters, and drivers. Provides immediate highway status, audio alerts, and direct 1-tap SOS assistance.
                </p>
              </div>

              <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-xs uppercase text-black font-mono">
                    ⚙️ Officer / Command Mode
                  </span>
                  <span className="text-[10px] bg-neutral-200 text-black px-1.5 py-0.2 font-mono font-bold">TACTICAL</span>
                </div>
                <p className="text-xs text-neutral-600">
                  Full command dashboard for Logistics Authorities (IAS), BRO Engineers, and Field Officers. Features real-time convoy telemetry, GIS heatmaps, and what-if scenario simulations.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Key Platform Features */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 font-mono mb-2">
              3. Core Intelligent Modules
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-neutral-50 border-2 border-black flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Layers className="w-4 h-4 text-[#ff3e00]" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase text-black font-mono">
                    Tactical GIS Map & Heatmap
                  </h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Switch between <strong>Satellite</strong> imagery, standard <strong>Road Map</strong>, and an <strong>Accessibility Heatmap</strong> that illustrates real-time transport velocity across all 7 Northeast states. Jump between NER, India, and World scopes instantly.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border-2 border-black flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Newspaper className="w-4 h-4 text-[#ff3e00]" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase text-black font-mono">
                    Live News Radar (NER Disruption Monitor)
                  </h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Continuously scans Indian regional news outlets (Assam Tribune, Arunachal Times, PTI, DD News) for road blockages, bridge washouts, and flash floods. With one click, apply extracted disruptions directly to your navigation map.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border-2 border-black flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Truck className="w-4 h-4 text-[#ff3e00]" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase text-black font-mono">
                    Driver Progress Tracking &amp; Color-Coded ETA Confidence
                  </h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Real-time in-cab milestone visualizer showing estimated arrival times paired with a color-coded confidence score (Green &ge;80% High Confidence, Amber 50-79% Weather Caution, Red &lt;50% Road Blockage Ahead). Dynamically recalculates as road conditions and alternate bypass routes change.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border-2 border-black flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <WifiOff className="w-4 h-4 text-[#ff3e00]" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase text-black font-mono">
                    100% Offline-Resilient Telemetry
                  </h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Mountain valleys frequently have zero network reception. TerraNex caches GIS map packages locally on your device and queues incident reports until cellular or satellite signal is restored.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 border-2 border-black flex items-start gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Radio className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h5 className="text-xs font-black uppercase text-black font-mono">
                    Emergency Crisis SOS & Direct Helplines
                  </h5>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    One-touch emergency beacon transmits your precise GPS coordinates, corridor code, and vehicle details to the nearest Border Roads Organisation (BRO) and SDRF disaster response unit. Includes direct 112, 1077, and 108 calling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-100 border-t-2 border-black flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenDemoWalkthrough && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDemoWalkthrough();
                }}
                className="px-3 py-2 bg-black hover:bg-neutral-800 text-white font-mono text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#ff3e00] flex items-center gap-1.5 cursor-pointer"
              >
                <span>🎬 Launch 10-Step Demo</span>
              </button>
            )}

            {onOpenNewsRadar && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNewsRadar();
                }}
                className="px-3 py-2 bg-white hover:bg-neutral-200 text-black font-mono text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center gap-1.5 cursor-pointer"
              >
                <Newspaper className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span>Open News Radar</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#ff3e00] hover:bg-black text-white font-mono text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer"
          >
            Got it, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
