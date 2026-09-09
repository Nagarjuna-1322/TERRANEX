import React from 'react';
import { AlertTriangle, CheckCircle2, Navigation, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation, getLocalizedHighwayName } from '../translations';

interface DynamicRerouteModalProps {
  vehicleNumber?: string;
  blockedRoadCode?: string;
  reason?: string;
  onAcceptReroute: () => void;
  onViewOptions: () => void;
  onDismiss: () => void;
}

export const DynamicRerouteModal: React.FC<DynamicRerouteModalProps> = ({
  vehicleNumber = 'TNX-1042',
  blockedRoadCode = 'NH-13',
  reason,
  onAcceptReroute,
  onViewOptions,
  onDismiss
}) => {
  const { t, lang } = useTranslation();

  const modalText = {
    badge: lang === 'hi' ? 'गंभीर कॉकपिट अलर्ट' : lang === 'as' ? 'গুৰুতৰ ককপিট সতৰ্কতা' : 'CRITICAL COCKPIT ALERT',
    title: lang === 'hi' ? 'तत्काल मार्ग अवरोध' : lang === 'as' ? 'তাৎক্ষণিক পথ বাধা' : 'Immediate Route Disruption',
    vehicleLabel: lang === 'hi' ? 'वाहन:' : lang === 'as' ? 'বাহন:' : 'Vehicle:',
    blockedBadge: lang === 'hi' ? 'बंद है' : lang === 'as' ? 'বন্ধ আছে' : 'BLOCKED',
    corridorClosed: lang === 'hi'
      ? 'आपका आवंटित पारगमन गलियारा आपातकालीन कमान द्वारा बंद कर दिया गया है।'
      : lang === 'as'
      ? 'আপোনাৰ নিৰ্ধাৰিত পথ জৰুৰীকালীন নিৰ্দেশনাত বন্ধ কৰা হৈছে।'
      : 'Your assigned transit corridor has been closed by emergency command.',
    defaultReason: lang === 'hi'
      ? 'तेंगा के पास किमी 81.3 पर भारी 450 वर्ग मीटर भूस्खलन'
      : lang === 'as'
      ? 'টেঙাৰ সমীপৰ ৮১.৩ কিমি স্থানত ৪৫০ বৰ্গ মিটাৰ ভূমিস্খলন'
      : 'Active 450m³ Landslide at Km 81.3 near Tenga',
    causeLabel: lang === 'hi' ? 'कारण:' : lang === 'as' ? 'কাৰণ:' : 'Cause:',
    safeCorridorTitle: lang === 'hi' ? 'अनुशंसित सुरक्षित गलियारा' : lang === 'as' ? 'পৰামৰ্শিত সুৰক্ষিত পথ' : 'Recommended Safe Corridor',
    safeCorridorName: lang === 'hi' ? 'शेरगांव दक्षिण बाईपास' : lang === 'as' ? 'শ্বেৰগাঁও দক্ষিণ বাইপাছ' : 'Shergaon South Bypass',
    etaAdjustment: lang === 'hi' ? 'अनुमानित समय वृद्धि' : lang === 'as' ? 'সময় সালসলনি' : 'ETA Adjustment',
    etaVal: lang === 'hi' ? '+32 मिनट' : lang === 'as' ? '+৩২ মিনিট' : '+32 minutes',
    etaSub: lang === 'hi' ? 'न्यूनतम देरी' : lang === 'as' ? 'নূন্যতম বিলম্ব' : 'Minimal delay',
    riskReduction: lang === 'hi' ? 'जोखिम में कमी' : lang === 'as' ? 'বিপদ হ্ৰাস' : 'Risk Reduction',
    riskVal: lang === 'hi' ? '-62% की गिरावट' : lang === 'as' ? '-৬২% হ্ৰাস' : '-62% drop',
    riskSub: lang === 'hi' ? '86% → 24% जोखिम' : lang === 'as' ? '৮৬% → ২৪% বিপদ' : '86% → 24% hazard',
    aiAdvice: lang === 'hi'
      ? 'सक्रिय भूस्खलन क्षेत्र से पूर्णतः सुरक्षित। सीमा सड़क संगठन द्वारा मार्ग सत्यापित।'
      : lang === 'as'
      ? 'সক্ৰিয় ভূমিস্খলন ক্ষেত্ৰৰ পৰা সম্পূৰ্ণ আঁতৰত। সীমান্ত পথ সংস্থাৰ দ্বাৰা প্ৰমাণিত।'
      : 'Avoids the active landslide zone completely. Asphalt verified by Border Roads Taskforce.',
    acceptBtn: lang === 'hi' ? 'एआई वैकल्पिक मार्ग स्वीकारें (रूट बी)' : lang === 'as' ? 'AI বৈকল্পিক পথ মানি লওক (ৰুট B)' : 'Accept AI Reroute (Route B)',
    viewOptionsBtn: lang === 'hi' ? 'मार्ग तुलना देखें' : lang === 'as' ? 'পথ তুলনা চাওক' : 'View Matrix'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-lg bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden text-[#0a0a0a]">
        {/* Warning Header */}
        <div className="bg-[#f4f4f4] px-5 py-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ff3e00] text-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#ff3e00] block">
                {modalText.badge}
              </span>
              <h3 className="massive-type text-base sm:text-lg font-black text-black leading-tight uppercase">
                {modalText.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="border-2 border-black bg-white hover:bg-neutral-100 text-black text-xs p-1.5 shadow-[2px_2px_0px_#0a0a0a] font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="p-3.5 bg-red-50 border-2 border-black space-y-1 shadow-[2px_2px_0px_#ff3e00]">
            <div className="font-bold text-black flex items-center justify-between">
              <span>{modalText.vehicleLabel} <strong className="font-mono text-black font-black">{vehicleNumber}</strong></span>
              <span className="px-2 py-0.5 border border-black bg-[#ff3e00] text-white font-mono text-[10px] font-black uppercase">
                {blockedRoadCode} {modalText.blockedBadge}
              </span>
            </div>
            <p className="text-neutral-700 pt-1 font-medium">
              {modalText.corridorClosed}
            </p>
            <div className="text-[11px] text-[#ff3e00] font-mono font-bold uppercase">
              {modalText.causeLabel} {reason || modalText.defaultReason}
            </div>
          </div>

          {/* AI Recommended Reroute Card */}
          <div className="p-4 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="text-xs font-black text-black font-mono uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#ff3e00]" /> {modalText.safeCorridorTitle}
              </span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-neutral-100 text-black border border-black uppercase">
                {modalText.safeCorridorName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <span className="text-neutral-600 text-[10px] uppercase font-bold block">{modalText.etaAdjustment}</span>
                <span className="text-base font-black font-mono text-black">{modalText.etaVal}</span>
                <span className="text-[10px] text-neutral-500 block uppercase font-bold mt-0.5">{modalText.etaSub}</span>
              </div>
              <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
                <span className="text-neutral-600 text-[10px] uppercase font-bold block">{modalText.riskReduction}</span>
                <span className="text-base font-black font-mono text-[#ff3e00]">{modalText.riskVal}</span>
                <span className="text-[10px] text-neutral-600 block uppercase font-bold mt-0.5">{modalText.riskSub}</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black text-[11px] text-black flex items-center gap-2 font-bold">
              <TrendingDown className="w-4 h-4 text-[#ff3e00] shrink-0" />
              <span>
                {modalText.aiAdvice}
              </span>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-t-2 border-black flex flex-col sm:flex-row items-center gap-2.5">
          <button
            id="btn-accept-reroute-modal"
            onClick={onAcceptReroute}
            className="w-full sm:flex-1 py-3 px-4 bg-[#ff3e00] hover:bg-black text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            {modalText.acceptBtn}
          </button>

          <button
            id="btn-view-route-options"
            onClick={onViewOptions}
            className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-neutral-100 text-black text-xs font-black uppercase font-mono border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#ff3e00]" /> {modalText.viewOptionsBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
