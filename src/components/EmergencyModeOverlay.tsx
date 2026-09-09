import React from 'react';
import {
  Radio,
  AlertTriangle,
  XCircle,
  Truck,
  ShieldCheck,
  Hospital,
  Navigation,
  CheckCircle2,
  X
} from 'lucide-react';
import { useTranslation } from '../translations';

interface EmergencyModeOverlayProps {
  onClose: () => void;
  onCalculateMedicalConvoyRoute: () => void;
}

export const EmergencyModeOverlay: React.FC<EmergencyModeOverlayProps> = ({
  onClose,
  onCalculateMedicalConvoyRoute
}) => {
  const { lang } = useTranslation();

  const text = {
    badge: lang === 'hi' ? 'कमांड सेंटर संकट प्रोटोकॉल' : lang === 'as' ? 'নিয়ন্ত্ৰণ কেন্দ্ৰ জৰুৰীকালীন প্ৰট’কল' : 'COMMAND CENTER CRISIS PROTOCOL',
    title: lang === 'hi' ? 'आपातकालीन संचालन मोड' : lang === 'as' ? 'জৰুৰীকালীন কাৰ্যকৰী ম’ড' : 'Emergency Operations Mode',
    criticalIncidents: lang === 'hi' ? 'गंभीर घटनाएं' : lang === 'as' ? 'গুৰুতৰ দুৰ্ঘটনা' : 'Critical Incidents',
    blockedCorridors: lang === 'hi' ? 'अवरुद्ध मार्ग' : lang === 'as' ? 'বন্ধ পথসমূহ' : 'Blocked Corridors',
    atRiskDeliveries: lang === 'hi' ? 'जोखिम में आपूर्ति' : lang === 'as' ? 'বিপদসংকুল যোগান' : 'At-Risk Deliveries',
    emergencyConvoys: lang === 'hi' ? 'आपातकालीन काफिले' : lang === 'as' ? 'জৰুৰীকালীন কনভয়' : 'Emergency Convoys',
    vettedSafeCorridors: lang === 'hi' ? 'सत्यापित सुरक्षित मार्ग' : lang === 'as' ? 'সুৰক্ষিত পৰীক্ষিত পথ' : 'Vetted Safe Corridors',
    triageDirectives: lang === 'hi' ? 'कार्यकारी आपातकालीन निर्देश:' : lang === 'as' ? 'কাৰ্যবাহী জৰুৰীকালীন নিৰ্দেশনা:' : 'Executive Triage Directives:',
    d1: lang === 'hi'
      ? 'प्रवेश चौकियों (भालुकपॉन्ग, सेवोक, दीमापुर) पर सभी गैर-आवश्यक वाणिज्यिक वाहन रोक दिए गए हैं।'
      : lang === 'as'
      ? 'প্ৰৱেশদ্বাৰৰ পৰীক্ষাচৌকীসমূহত সকলো অবিনশ্বৰ বাণিজ্যিক পৰিবহণ স্থগিত ৰখা হৈছে।'
      : 'All commercial non-perishable transport halted at gateway checkpoints (Bhalukpong, Sevoke, Dimapur).',
    d2: lang === 'hi'
      ? 'ऑक्सीजन, रक्त प्लाज्मा और एंटी-वेनम आपूर्ति के लिए प्राथमिकता अधिकार लागू।'
      : lang === 'as'
      ? 'অক্সিজেন, তেজৰ প্লাজমা আৰু ঔষধ যোগানৰ বাবে অগ্ৰাধিকাৰ নিশ্চিত কৰা হৈছে।'
      : 'Priority right-of-way enforced for Cryogenic Oxygen, Blood Plasma, and Anti-Venom convoys.',
    d3: lang === 'hi'
      ? 'तेंगा किमी 81.3 और चुमुकेदिमा धंसाव क्षेत्र में मलबे की सफाई हेतु भारी मशीनें तैनात।'
      : lang === 'as'
      ? 'টেঙা আৰু চুমুকেডিমাৰ ভূমিস্খলন স্থানলৈ বুলড’জাৰ আৰু জেচিবি প্ৰেৰণ কৰা হৈছে।'
      : 'Earthmoving machinery deployed under escort to Km 81.3 Tenga and Chumukedima subsidence zones.',
    tawangTitle: lang === 'hi' ? 'तवांग काफिला ट्राइएज' : lang === 'as' ? 'তাৱাং কনভয় সুৰক্ষা' : 'Tawang Convoy Triage',
    tawangDesc: lang === 'hi'
      ? 'आपातकालीन दवाएं ले जा रहा वाहन TNX-1042 भालुकपॉन्ग पहुंच रहा है। NH-13 भूस्खलन से बचने के लिए सुरक्षित मार्ग खोजें।'
      : lang === 'as'
      ? 'জৰুৰীকালীন ঔষধ লৈ যোৱা বাহন TNX-1042 ভালুকপং পাইছেহি। NH-13ৰ ভূমিস্খলন এৰাই চলিবলৈ বিকল্প পথ সন্ধান কৰক।'
      : 'Vehicle TNX-1042 carrying emergency anti-venom is approaching Bhalukpong. Calculate the safest alternate path bypassing the active NH-13 rockslide.',
    findRouteBtn: lang === 'hi'
      ? 'चिकित्सा काफिले हेतु सुरक्षित मार्ग (शेरगांव बाईपास)'
      : lang === 'as'
      ? 'চিকিৎসা কনভয়ৰ বাবে সুৰক্ষিত পথ বাছক (শ্বেৰগাঁও বাইপাছ)'
      : 'Find Safest Route for Medical Convoy (Shergaon Bypass)',
    hospitalTitle: lang === 'hi' ? 'क्षेत्रीय अस्पताल आपूर्ति बफर' : lang === 'as' ? 'আঞ্চলিক চিকিৎসালয়ৰ যোগান বাফাৰ' : 'Regional Hospital Supply Buffer',
    hospitalDesc: lang === 'hi'
      ? 'तवांग जिला अस्पताल में आपात भंडार केवल 4.5 घंटे का शेष है। शेरगांव बाईपास 5 घंटे 52 मिनट में सुरक्षित डिलीवरी सुनिश्चित करता है।'
      : lang === 'as'
      ? 'তাৱাং জিলা চিকিৎসালয়ৰ ঔষধৰ মজুত মাত্ৰ ৪.৫ ঘণ্টাৰ। শ্বেৰগাঁও বাইপাছে ৫ ঘণ্টা ৫২ মিনিটত সুৰক্ষিত যোগান নিশ্চিত কৰিব।'
      : 'Tawang District Hospital isolation ward reserve stands at 4.5 hours. Shergaon bypass ensures arrival in 5h 52m without entering hazardous fracture zones.',
    escortCleared: lang === 'hi'
      ? 'कलाकतांग चेकपोस्ट पर समर्पित सैन्य सुरक्षा एस्कॉर्ट तैनात।'
      : lang === 'as'
      ? 'কলাকতাং চেকপষ্টত নিৰাপত্তাৰক্ষীৰ দল সাজু কৰা হৈছে।'
      : 'Dedicated military escort cleared at Kalaktang checkpoint.',
    returnBtn: lang === 'hi' ? 'कमांड डैशबोर्ड पर वापस जाएं' : lang === 'as' ? 'কমাণ্ড ডেশ্বব’ৰ্ডলৈ উভতি যাওক' : 'Return to Command Dashboard'
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f4f4f4]/95 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between text-[#0a0a0a] border-4 border-black animate-fade-in font-mono">
      {/* Top Banner */}
      <div>
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ff3e00] border-2 border-black text-white shadow-[3px_3px_0px_#0a0a0a]">
              <Radio className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-xs font-black text-[#ff3e00] uppercase tracking-widest block">
                {text.badge}
              </span>
              <h1 className="massive-type text-xl sm:text-2xl font-black text-black tracking-tight uppercase">
                {text.title}
              </h1>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white border-2 border-black text-black shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crisis Status Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
          <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-center font-mono">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider block font-bold">
              {text.criticalIncidents}
            </span>
            <span className="text-2xl font-black text-[#ff3e00]">8</span>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-center font-mono">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider block font-bold">
              {text.blockedCorridors}
            </span>
            <span className="text-2xl font-black text-black">13</span>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-center font-mono">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider block font-bold">
              {text.atRiskDeliveries}
            </span>
            <span className="text-2xl font-black text-[#ff3e00]">17</span>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-center font-mono">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider block font-bold">
              {text.emergencyConvoys}
            </span>
            <span className="text-2xl font-black text-black">12</span>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] text-center font-mono col-span-2 sm:col-span-1">
            <span className="text-[10px] text-neutral-600 uppercase tracking-wider block font-bold">
              {text.vettedSafeCorridors}
            </span>
            <span className="text-2xl font-black text-black">7</span>
          </div>
        </div>

        {/* Strategic Triage Instructions */}
        <div className="p-4 bg-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] mb-6 space-y-2 text-xs font-mono">
          <span className="font-black text-[#ff3e00] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#ff3e00]" /> {text.triageDirectives}
          </span>
          <ul className="space-y-1.5 text-neutral-800 list-disc list-inside font-bold uppercase text-[11px]">
            <li>{text.d1}</li>
            <li>{text.d2}</li>
            <li>{text.d3}</li>
          </ul>
        </div>

        {/* Priority Emergency Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-3">
            <div className="flex items-center gap-2 font-black text-black font-mono uppercase text-sm">
              <ShieldCheck className="w-5 h-5 text-[#ff3e00]" /> {text.tawangTitle}
            </div>
            <p className="text-xs text-neutral-700 font-medium leading-relaxed">
              {text.tawangDesc}
            </p>
            <button
              id="btn-emergency-calculate-route"
              onClick={onCalculateMedicalConvoyRoute}
              className="w-full py-3 bg-[#ff3e00] hover:bg-black text-white font-black text-xs border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              {text.findRouteBtn}
            </button>
          </div>

          <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-3">
            <div className="flex items-center gap-2 font-black text-black font-mono uppercase text-sm">
              <Hospital className="w-5 h-5 text-[#ff3e00]" /> {text.hospitalTitle}
            </div>
            <p className="text-xs text-neutral-700 font-medium leading-relaxed">
              {text.hospitalDesc}
            </p>
            <div className="p-2.5 bg-neutral-100 border-2 border-black text-black text-xs font-mono font-bold uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff3e00] shrink-0" />
              <span>{text.escortCleared}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dismiss */}
      <div className="pt-6 border-t-2 border-black flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-[#0a0a0a] hover:bg-neutral-800 text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[3px_3px_0px_#0a0a0a] transition cursor-pointer"
        >
          {text.returnBtn}
        </button>
      </div>
    </div>
  );
};
