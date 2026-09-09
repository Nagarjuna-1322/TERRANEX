import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  CloudRain,
  Brain,
  Truck,
  ShieldAlert,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info
} from 'lucide-react';

interface SihDemoControllerProps {
  currentStep?: number;
  onStepChange: (step: number) => void;
  onReset?: () => void;
  isLoading?: boolean;
  activeRoad?: any;
  activeVehicle?: any;
}

export const SIH_STEPS = [
  {
    step: 1,
    title: 'Convoy Departure',
    tagline: 'Guwahati → Tawang Medical Dispatch',
    desc: 'Vehicle TNX-1042 departs carrying emergency anti-venom & trauma kits for high-altitude isolation wards.',
    icon: Truck,
    color: 'text-emerald-400'
  },
  {
    step: 2,
    title: 'Monsoon Cloudburst',
    tagline: 'Heavy Rainfall in Kameng Sector',
    desc: 'Precipitation surges to 48.5 mm/h along NH-13 Bhalukpong approach. Saturated slopes destabilize.',
    icon: CloudRain,
    color: 'text-cyan-400'
  },
  {
    step: 3,
    title: 'AI Disruption Prediction',
    tagline: '82% Disruption Probability Forecast',
    desc: 'AI model evaluates 38° slope, rainfall rate, and 14 historical failures, predicting critical closure within 6h.',
    icon: Brain,
    color: 'text-amber-400'
  },
  {
    step: 4,
    title: 'Field Officer Ground Intel',
    tagline: 'Incident Report with GPS & Photo',
    desc: 'Inspector Khon captures 450m³ rock & mud debris across both lanes at Km 81.3 near Tenga gorge.',
    icon: MapPin,
    color: 'text-orange-400'
  },
  {
    step: 5,
    title: 'AI Computer Vision Classification',
    tagline: 'Landslide Classified (91% Confidence)',
    desc: 'Multimodal vision classifies incident as FULL ROAD BLOCKAGE, immediately recommending convoy diversion.',
    icon: Sparkles,
    color: 'text-purple-400'
  },
  {
    step: 6,
    title: 'Autonomous Road Blockage',
    tagline: 'NH-13 Status → BLOCKED',
    desc: 'Central GIS updates NH-13 to BLOCKED (Red dashed status). All dependent dispatch systems alert authorities.',
    icon: ShieldAlert,
    color: 'text-red-400'
  },
  {
    step: 7,
    title: 'Driver Threat Warning',
    tagline: 'Vehicle TNX-1042 Alerted in Cockpit',
    desc: 'Driver Tsering Dorjee receives urgent in-cab notification: "Route ahead blocked. Alternate route available."',
    icon: AlertTriangle,
    color: 'text-red-400'
  },
  {
    step: 8,
    title: 'Multi-Factor Route Matrix',
    tagline: 'Route A (86% Risk) vs Route B (24% Risk)',
    desc: 'Optimizer calculates Shergaon South Bypass (+32 mins, 24% risk) vs hazardous direct NH-13 (86% risk).',
    icon: Brain,
    color: 'text-cyan-400'
  },
  {
    step: 9,
    title: 'Dynamic Reroute Execution',
    tagline: 'Vehicle Accepts Shergaon Bypass',
    desc: '1-click reroute commits TNX-1042 to Route B. Telemetry switches instantly without pausing convoy transit.',
    icon: CheckCircle2,
    color: 'text-emerald-400'
  },
  {
    step: 10,
    title: 'Delivery Preserved',
    tagline: 'Critical Anti-Venom Arriving on Time',
    desc: 'Authority command center receives confirmation: Life-saving cargo preserved, catastrophic 4h delay averted!',
    icon: CheckCircle2,
    color: 'text-emerald-400'
  }
];

export const SihDemoController: React.FC<SihDemoControllerProps> = ({
  currentStep = 1,
  onStepChange,
  onReset,
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeStepMeta = SIH_STEPS[currentStep - 1] || SIH_STEPS[0];
  const StepIcon = activeStepMeta.icon;

  const nextStep = () => {
    if (currentStep < 10) onStepChange(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) onStepChange(currentStep - 1);
  };

  return (
    <div className="w-full bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] overflow-hidden">
      {/* Top Bar Header */}
      <div className="bg-[#0a0a0a] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-black">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 bg-[#ff3e00] inline-block"></span>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white font-mono flex items-center gap-1.5">
            Smart India Hackathon // Live Demo Pipeline
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-demo-toggle-expand"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[10px] px-2.5 py-1 bg-white text-[#0a0a0a] border border-black font-black uppercase tracking-wider hover:bg-neutral-200 transition"
          >
            {isExpanded ? 'Compact View' : 'All 10 Steps'}
          </button>
          {onReset && (
            <button
              id="btn-demo-reset"
              onClick={onReset}
              disabled={isLoading}
              className="text-[10px] px-2.5 py-1 bg-[#ff3e00] text-white font-black uppercase tracking-wider border border-black flex items-center gap-1 hover:bg-red-600 transition"
              title="Reset to default baseline"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Active Step Presentation Spotlight */}
      <div className="p-4 bg-[#f4f4f4]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Step Icon & Description */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#0a0a0a] text-white border-2 border-black flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#ff3e00] shrink-0">
              <span className="font-mono text-lg">{currentStep < 10 ? `0${currentStep}` : currentStep}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase tracking-widest">
                  STEP {currentStep} / 10
                </span>
                <span className="text-base font-black uppercase tracking-tight text-[#0a0a0a]">{activeStepMeta.title}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#ff3e00] mt-0.5">{activeStepMeta.tagline}</p>
              <p className="text-xs font-medium text-neutral-800 mt-1 max-w-2xl leading-relaxed">{activeStepMeta.desc}</p>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <button
              id="btn-demo-prev"
              onClick={prevStep}
              disabled={currentStep <= 1 || isLoading}
              className="px-3 py-1.5 bg-white border-2 border-black text-[#0a0a0a] font-bold text-xs uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 shadow-[2px_2px_0px_#0a0a0a] transition flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <button
              id="btn-demo-next"
              onClick={nextStep}
              disabled={currentStep >= 10 || isLoading}
              className="px-4 py-1.5 bg-[#0a0a0a] hover:bg-[#ff3e00] border-2 border-black text-white font-black text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shadow-[3px_3px_0px_#0a0a0a] transition flex items-center gap-1.5"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Timeline Blocks */}
        <div className="mt-4 pt-3 border-t-2 border-black/10 grid grid-cols-10 gap-1.5">
          {SIH_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => onStepChange(s.step)}
              className={`h-2 border border-black transition-all ${
                s.step === currentStep
                  ? 'bg-[#ff3e00]'
                  : s.step < currentStep
                  ? 'bg-[#0a0a0a]'
                  : 'bg-white hover:bg-neutral-200'
              }`}
              title={`Step ${s.step}: ${s.title}`}
            />
          ))}
        </div>
      </div>

      {/* Expanded Grid of All 10 Steps */}
      {isExpanded && (
        <div className="p-4 bg-white border-t-2 border-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
          {SIH_STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = s.step === currentStep;
            return (
              <button
                key={s.step}
                onClick={() => {
                  onStepChange(s.step);
                  setIsExpanded(false);
                }}
                className={`p-2.5 border-2 text-left transition-all ${
                  isCurrent
                    ? 'border-black bg-[#ff3e00] text-white shadow-[2px_2px_0px_#0a0a0a]'
                    : s.step < currentStep
                    ? 'border-black bg-[#0a0a0a] text-white'
                    : 'border-black/30 bg-[#f4f4f4] text-[#0a0a0a] hover:border-black'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider">STEP {s.step}</span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="font-black uppercase truncate">{s.title}</div>
                <div className={`text-[10px] line-clamp-2 mt-0.5 font-medium ${isCurrent || s.step < currentStep ? 'opacity-80' : 'text-neutral-600'}`}>{s.tagline}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
