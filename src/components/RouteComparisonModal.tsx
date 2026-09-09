import React, { useState } from 'react';
import { RouteOption } from '../types';
import { TA_WANG_ROUTE_OPTIONS } from '../data/nerData';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Navigation,
  Shield,
  Zap,
  TrendingDown,
  Info
} from 'lucide-react';
import { useTranslation, getLocalizedWeather } from '../translations';

interface RouteComparisonModalProps {
  onClose: () => void;
  onSelectRoute: (route: RouteOption) => void;
  targetVehicleNumber?: string;
  targetCargo?: string;
}

export const RouteComparisonModal: React.FC<RouteComparisonModalProps> = ({
  onClose,
  onSelectRoute,
  targetVehicleNumber = 'TNX-1042',
  targetCargo
}) => {
  const { lang } = useTranslation();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-shergaon-bypass');
  const routes = TA_WANG_ROUTE_OPTIONS;

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[1];

  const defaultCargo = lang === 'hi'
    ? 'आपातकालीन एंटी-वेनम और बाल चिकित्सा ट्रॉमा किट'
    : lang === 'as'
    ? 'জৰুৰীকালীন এণ্টি-ভেনম আৰু শিশু চিকিৎসা কিট'
    : 'Emergency Anti-Venom & Pediatric Trauma Kits';

  const t = {
    title: lang === 'hi' ? 'रणनीतिक मार्ग अनुकूलन' : lang === 'as' ? 'কৌশলগত পথ অনুকূলন' : 'Tactical Route Optimization',
    engineBadge: lang === 'hi' ? 'एआई निर्णय इंजन' : lang === 'as' ? 'AI সিদ্ধান্ত ইঞ্জিন' : 'AI DECISION ENGINE',
    vehicle: lang === 'hi' ? 'वाहन:' : lang === 'as' ? 'বাহন:' : 'Vehicle:',
    cargo: lang === 'hi' ? 'कार्गो:' : lang === 'as' ? 'সামগ্ৰী:' : 'Cargo:',
    costFormulaTitle: lang === 'hi' ? 'बहु-कारक लागत अनुकूलन:' : lang === 'as' ? 'বহু-কাৰক খৰচ অনুকূলন:' : 'Multi-Factor Cost Optimization:',
    costFormula: lang === 'hi'
      ? 'लागत = यात्रा समय + दूरी + मौसम जोखिम + ढलान अस्थिरता + व्यवधान संभावना'
      : lang === 'as'
      ? 'খৰচ = ভ্ৰমণ সময় + দূৰত্ব + বতৰৰ বিপদ + স্খলনৰ সম্ভাৱনা + বিঘিনিৰ আশংকা'
      : 'Cost = Travel Time + Distance + Weather Risk + Slope Fracture + Disruption Probability',
    aiBest: lang === 'hi' ? '★ एआई अनुशंसित सर्वश्रेष्ठ' : lang === 'as' ? '★ AI পৰামৰ্শিত শ্ৰেষ্ঠ' : '★ AI RECOMMENDED BEST',
    criticalAvoid: lang === 'hi' ? '✕ गंभीर - बचें' : lang === 'as' ? '✕ গুৰুতৰ বিপদ - এৰক' : '✕ CRITICAL AVOID',
    distance: lang === 'hi' ? 'दूरी:' : lang === 'as' ? 'দূৰত্ব:' : 'Distance:',
    eta: lang === 'hi' ? 'अनुमानित समय:' : lang === 'as' ? 'আনুমানিক সময়:' : 'Estimated ETA:',
    disruptionRisk: lang === 'hi' ? 'व्यवधान जोखिम:' : lang === 'as' ? 'বিঘিনিৰ আশংকা:' : 'Disruption Risk:',
    weatherRisk: lang === 'hi' ? 'मौसम जोखिम:' : lang === 'as' ? 'বতৰৰ বিপদ:' : 'Weather Risk:',
    trafficDensity: lang === 'hi' ? 'यातायात घनत्व:' : lang === 'as' ? 'যান-বাহনৰ চাপ:' : 'Traffic Density:',
    selectBest: lang === 'hi' ? 'अनुशंसित गलियारा चुनें' : lang === 'as' ? 'পৰামৰ্শিত পথ বাছক' : 'Select Recommended Corridor',
    highRisk: lang === 'hi' ? 'उच्च जोखिम खतरा' : lang === 'as' ? 'অধিক বিপদসংকুল' : 'High Risk Hazard',
    selectBackup: lang === 'hi' ? 'वैकल्पिक मार्ग चुनें' : lang === 'as' ? 'বিকল্প পথ বাছক' : 'Select Backup',
    aiEvaluation: lang === 'hi' ? 'स्पष्टीकरणात्मक एआई मार्ग मूल्यांकन:' : lang === 'as' ? 'AI ব্যাখ্যাত্মক পথ মূল্যায়ন:' : 'Explainable AI Route Evaluation:',
    riskReductionNote: lang === 'hi'
      ? 'जोखिम में -62% कमी (सीधे NH-13 की तुलना में), एंटी-वेनम का सुरक्षित पारगमन सुनिश्चित।'
      : lang === 'as'
      ? 'NH-13ৰ তুলনাত -৬২% বিপদ হ্ৰাস, ঔষধৰ সুৰক্ষিত যোগান নিশ্চিত।'
      : 'Risk Reduction: -62% compared to direct NH-13, ensuring safe transit of anti-venom.',
    close: lang === 'hi' ? 'बंद करें' : lang === 'as' ? 'বন্ধ কৰক' : 'Close',
    commitBtn: lang === 'hi' ? 'वाहन प्रेषित करें' : lang === 'as' ? 'বাহন প্ৰেৰণ নিশ্চিত কৰক' : 'Commit & Dispatch Vehicle'
  };

  const getLocalizedRouteName = (name: string) => {
    if (name.includes('Shergaon')) {
      return lang === 'hi' ? 'रूट बी: शेरगांव बाईपास' : lang === 'as' ? 'ৰুট B: শ্বেৰগাঁও বাইপাছ' : name;
    }
    if (name.includes('Primary') || name.includes('Direct')) {
      return lang === 'hi' ? 'प्राथमिक मार्ग (NH-13 प्रत्यक्ष)' : lang === 'as' ? 'মুখ্য পথ (NH-13 প্ৰত্যক্ষ)' : name;
    }
    if (name.includes('Orang') || name.includes('Kalaktang')) {
      return lang === 'hi' ? 'रूट सी: ओरांग-कलाकतांग धमनी' : lang === 'as' ? 'ৰুট C: ওৰাং-কলাকতাং পথ' : name;
    }
    return name;
  };

  const getLocalizedTraffic = (traffic: string) => {
    if (traffic.toLowerCase().includes('heavy') || traffic.toLowerCase().includes('congested')) {
      return lang === 'hi' ? 'अत्यधिक' : lang === 'as' ? 'অতি বেছি' : traffic;
    }
    if (traffic.toLowerCase().includes('mod')) {
      return lang === 'hi' ? 'मध्यम' : lang === 'as' ? 'মধ্যম' : traffic;
    }
    if (traffic.toLowerCase().includes('low') || traffic.toLowerCase().includes('light')) {
      return lang === 'hi' ? 'कम / सुगम' : lang === 'as' ? 'কম / মুক্ত' : traffic;
    }
    return traffic;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-4xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-black text-black shadow-[2px_2px_0px_#0a0a0a]">
              <Navigation className="w-5 h-5 text-[#ff3e00]" />
            </div>
            <div>
              <h3 className="massive-type text-sm sm:text-base flex items-center gap-2 font-black uppercase text-black">
                {t.title}
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ff3e00] text-white border border-black uppercase font-black">
                  {t.engineBadge}
                </span>
              </h3>
              <div className="text-xs text-neutral-600 mt-0.5 font-bold uppercase">
                {t.vehicle} <span className="text-black font-mono font-black">{targetVehicleNumber}</span> • {t.cargo}{' '}
                <span className="text-neutral-800">{targetCargo || defaultCargo}</span>
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

        {/* Cost Formula Explanation Bar */}
        <div className="px-5 py-2.5 bg-[#f4f4f4] border-b-2 border-black text-xs text-black flex flex-wrap items-center justify-between gap-2 font-bold uppercase">
          <span className="font-mono text-[#ff3e00] font-black flex items-center gap-1.5 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.costFormulaTitle}
          </span>
          <span className="font-mono text-[10px] text-neutral-700">
            {t.costFormula}
          </span>
        </div>

        {/* Content Comparison Table & Cards */}
        <div className="p-5 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {routes.map((route) => {
              const isBest = route.status === 'RECOMMENDED';
              const isAvoid = route.status === 'AVOID';
              const isSelected = selectedRouteId === route.id;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-4 border-2 border-black cursor-pointer transition-all relative flex flex-col justify-between ${
                    isBest
                      ? 'bg-white shadow-[4px_4px_0px_#ff3e00] ring-2 ring-black'
                      : isAvoid
                      ? 'bg-red-50 opacity-90 shadow-[3px_3px_0px_#0a0a0a]'
                      : 'bg-white shadow-[3px_3px_0px_#0a0a0a] hover:bg-neutral-50'
                  } ${isSelected ? 'ring-2 ring-[#ff3e00]' : ''}`}
                >
                  {isBest && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-[#ff3e00] text-white text-[9px] font-black tracking-wider font-mono uppercase border border-black shadow">
                      {t.aiBest}
                    </div>
                  )}
                  {isAvoid && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 bg-black text-white text-[9px] font-black tracking-wider font-mono uppercase border border-black shadow">
                      {t.criticalAvoid}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm text-[#0a0a0a] uppercase">
                        {getLocalizedRouteName(route.name)}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mb-3 font-medium">
                      {route.pathDescription}
                    </p>

                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-600 uppercase font-bold text-[10px]">{t.distance}</span>
                        <span className="font-black text-black">{route.distanceKm} km</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-600 uppercase font-bold text-[10px]">{t.eta}</span>
                        <span className="font-black text-black">{route.eta}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-600 uppercase font-bold text-[10px]">{t.disruptionRisk}</span>
                        <span
                          className={`font-black ${
                            route.riskPercentage > 70
                              ? 'text-[#ff3e00]'
                              : route.riskPercentage > 35
                              ? 'text-amber-600'
                              : 'text-black'
                          }`}
                        >
                          {route.riskPercentage}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-200">
                        <span className="text-neutral-600 uppercase font-bold text-[10px]">{t.weatherRisk}</span>
                        <span className="text-black font-bold uppercase">{getLocalizedWeather(route.weatherRisk, lang)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-neutral-600 uppercase font-bold text-[10px]">{t.trafficDensity}</span>
                        <span className="text-black font-bold uppercase">{getLocalizedTraffic(route.traffic)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-black">
                    <span
                      className={`block text-center text-[10px] font-black uppercase tracking-wider py-1.5 border border-black ${
                        isBest
                          ? 'bg-[#ff3e00] text-white'
                          : isAvoid
                          ? 'bg-black text-white'
                          : 'bg-[#f4f4f4] text-black'
                      }`}
                    >
                      {isBest ? t.selectBest : isAvoid ? t.highRisk : t.selectBackup}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Justification for Selected Route */}
          <div className="p-4 bg-[#f4f4f4] border-2 border-black text-xs space-y-2 font-mono">
            <div className="flex items-center gap-2 text-black font-black uppercase tracking-wider">
              <Shield className="w-4 h-4 text-[#ff3e00]" /> {t.aiEvaluation} {getLocalizedRouteName(selectedRoute.name)}:
            </div>
            <p className="text-neutral-800 leading-relaxed text-xs font-bold">{selectedRoute.explanation}</p>
            {selectedRoute.status === 'RECOMMENDED' && (
              <div className="p-2.5 bg-white border-2 border-black text-black flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#ff3e00] shrink-0" />
                <span className="font-bold uppercase text-[11px]">
                  <strong>{t.riskReductionNote}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-[#f4f4f4] border-t-2 border-black flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-xs font-bold uppercase cursor-pointer"
          >
            {t.close}
          </button>

          <button
            id="btn-confirm-route"
            onClick={() => onSelectRoute(selectedRoute)}
            className="px-5 py-2.5 bg-[#ff3e00] hover:bg-black text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t.commitBtn} ({getLocalizedRouteName(selectedRoute.name).split(':')[0] || selectedRoute.name.split(' ')[0]})
          </button>
        </div>
      </div>
    </div>
  );
};
