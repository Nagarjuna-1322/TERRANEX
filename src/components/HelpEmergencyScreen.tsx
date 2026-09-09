import React, { useState } from 'react';
import { Language, TRANSLATIONS } from '../translations';
import { speakText, stopSpeaking } from '../utils/speech';
import {
  PhoneCall,
  Radio,
  Volume2,
  VolumeX,
  Hospital
} from 'lucide-react';

interface HelpEmergencyScreenProps {
  lang: Language;
  onSendSOS: () => void;
  onOpenMap: () => void;
}

export const HelpEmergencyScreen: React.FC<HelpEmergencyScreenProps> = ({
  lang,
  onSendSOS,
  onOpenMap
}) => {
  const [sosSent, setSosSent] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleTriggerSOS = () => {
    setSosSent(true);
    onSendSOS();
    if (lang === 'hi') {
      speakText('आपकी आपातकालीन सूचना कंट्रोल रूम को भेज दी गई है। बचाव दल को आपकी लोकेशन मिल गई है।', 'hi');
    } else if (lang === 'as') {
      speakText('আপোনাৰ জৰুৰীকালীন বাৰ্তা প্ৰেৰণ কৰা হৈছে। সহায় সোনকালে পাব।', 'as');
    } else {
      speakText('Emergency SOS broadcasted to the nearest disaster management room with your live coordinates.', 'en');
    }
  };

  const handlePlaySafetyGuide = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const text =
      lang === 'hi'
        ? 'आपातकालीन निर्देश: यदि आप भूस्खलन या पहाड़ पर फंसे हैं, तो गाड़ी को ढलान से दूर सुरक्षित जगह पर रोकें। इंजन बंद न करें अगर ठंड ज्यादा हो। फोन पर एक सौ बारह या एक हज़ार सतहत्तर डायल करें। घबराएं नहीं, सहायता उपलब्ध है।'
        : lang === 'as'
        ? 'জৰুৰীকালীন নিৰ্দেশনা: ভূমিস্খলনৰ স্থানৰ পৰা গাড়ী সুৰক্ষিত স্থানলৈ নিয়ক। ১১২ বা ১০৭৭ নম্বৰত ফোন কৰক। ভয় নাখাব, সাহায্য প্ৰস্তুত আছে।'
        : 'Emergency safety instruction: If stranded near a landslide or hill slope, pull over to stable ground away from steep cliff walls. Call 112 or 1077 for immediate recovery.';

    setIsPlayingAudio(true);
    speakText(text, lang, () => setIsPlayingAudio(false));
  };

  return (
    <div className="space-y-6 pb-24 text-[#0a0a0a]">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider">
            {t.emergency.safetyGuideTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 text-white">
            {t.emergency.activeTitle}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-white/90 mt-1 max-w-xl">
            {t.emergency.sosDesc}
          </p>
        </div>

        <button
          onClick={handlePlaySafetyGuide}
          className="px-4 py-3 bg-white text-black hover:bg-yellow-300 font-black text-xs uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center gap-2 self-stretch sm:self-auto justify-center"
        >
          {isPlayingAudio ? (
            <>
              <VolumeX className="w-4 h-4 text-red-600" />
              {t.emergency.stopAudio}
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#ff3e00]" />
              {t.emergency.listenSafety}
            </>
          )}
        </button>
      </div>

      {/* Big One-Tap SOS Button */}
      <div className="bg-white border-3 border-red-600 p-6 shadow-[5px_5px_0px_#0a0a0a] text-center space-y-4">
        <div className="max-w-md mx-auto space-y-2">
          <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 border-2 border-black flex items-center justify-center">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="text-xl font-black uppercase text-black">
            {t.emergency.sosTitle}
          </h3>
          <p className="text-xs font-bold text-neutral-600">
            {t.emergency.sosDesc}
          </p>
        </div>

        <button
          onClick={handleTriggerSOS}
          className={`w-full max-w-md mx-auto py-4 px-6 border-2 border-black text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_#0a0a0a] transition flex items-center justify-center gap-3 ${
            sosSent
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-[#ff3e00] hover:bg-red-700 text-white'
          }`}
        >
          <Radio className="w-5 h-5" />
          {sosSent ? t.emergency.broadcastSentBtn : t.emergency.broadcastSosBtn}
        </button>
      </div>

      {/* Toll-Free Emergency Helpline Cards */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_#0a0a0a] space-y-4">
        <h3 className="text-base font-black uppercase text-black">
          {t.emergency.directCallsTitle}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 112 */}
          <a
            href="tel:112"
            className="p-4 bg-red-50 hover:bg-red-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-black uppercase text-red-700 block">
                {t.emergency.h112Title}
              </span>
              <div className="text-3xl font-black font-mono text-black mt-1">112</div>
              <span className="text-[11px] font-bold text-neutral-600">{t.emergency.h112Sub}</span>
            </div>
            <div className="w-12 h-12 bg-red-600 text-white border-2 border-black flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              <PhoneCall className="w-6 h-6" />
            </div>
          </a>

          {/* 1077 */}
          <a
            href="tel:1077"
            className="p-4 bg-amber-50 hover:bg-amber-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-black uppercase text-amber-800 block">
                {t.emergency.h1077Title}
              </span>
              <div className="text-3xl font-black font-mono text-black mt-1">1077</div>
              <span className="text-[11px] font-bold text-neutral-600">{t.emergency.h1077Sub}</span>
            </div>
            <div className="w-12 h-12 bg-amber-500 text-black border-2 border-black flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              <PhoneCall className="w-6 h-6" />
            </div>
          </a>

          {/* 108 */}
          <a
            href="tel:108"
            className="p-4 bg-green-50 hover:bg-green-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-between group"
          >
            <div>
              <span className="text-xs font-black uppercase text-green-800 block">
                {t.emergency.h108Title}
              </span>
              <div className="text-3xl font-black font-mono text-black mt-1">108</div>
              <span className="text-[11px] font-bold text-neutral-600">{t.emergency.h108Sub}</span>
            </div>
            <div className="w-12 h-12 bg-green-600 text-white border-2 border-black flex items-center justify-center font-bold text-lg group-hover:scale-105 transition">
              <PhoneCall className="w-6 h-6" />
            </div>
          </a>
        </div>
      </div>

      {/* Safe Centers & Hospitals */}
      <div className="bg-[#f4f4f4] border-2 border-black p-5 sm:p-6 shadow-[4px_4px_0px_#0a0a0a] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black uppercase text-black flex items-center gap-2">
            <Hospital className="w-5 h-5 text-[#ff3e00]" />
            {t.emergency.nearbyHospitalsTitle}
          </h3>
          <button
            onClick={onOpenMap}
            className="px-3 py-1 bg-white hover:bg-neutral-100 border border-black text-xs font-black uppercase shadow-[1px_1px_0px_#0a0a0a]"
          >
            {t.emergency.viewOnMap}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-black">
                {t.emergency.tawangHospital}
              </div>
              <p className="text-xs font-bold text-neutral-600">{t.emergency.tawangHospitalDesc}</p>
              <span className="text-[10px] font-mono text-neutral-500">Arunachal • 3,048m</span>
            </div>
            <a
              href="tel:03794222223"
              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]"
            >
              <PhoneCall className="w-3 h-3" /> Call
            </a>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-black">
                {t.emergency.bhalukpongShelter}
              </div>
              <p className="text-xs font-bold text-neutral-600">{t.emergency.bhalukpongShelterDesc}</p>
              <span className="text-[10px] font-mono text-neutral-500">Kameng Sector • Foothills</span>
            </div>
            <a
              href="tel:1077"
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]"
            >
              <PhoneCall className="w-3 h-3" /> Call
            </a>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-black">
                Gauhati Medical College & Hospital (GMCH)
              </div>
              <p className="text-xs font-bold text-neutral-600">Level-1 Apex Trauma & Anti-Venom ICU</p>
              <span className="text-[10px] font-mono text-neutral-500">Guwahati, Assam</span>
            </div>
            <a
              href="tel:03612529457"
              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]"
            >
              <PhoneCall className="w-3 h-3" /> Call
            </a>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-black">
                BRO Project Vartak (Border Roads HQ)
              </div>
              <p className="text-xs font-bold text-neutral-600">Heavy Earthmoving & Landslide Clearing</p>
              <span className="text-[10px] font-mono text-neutral-500">Tezpur-Tenga-Tawang Axis</span>
            </div>
            <a
              href="tel:03712230122"
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]"
            >
              <PhoneCall className="w-3 h-3" /> BRO
            </a>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-black">
                BRO Project Sewak (Nagaland & Manipur)
              </div>
              <p className="text-xs font-bold text-neutral-600">NH-29 Chumukedima Subsidence Unit</p>
              <span className="text-[10px] font-mono text-neutral-500">Dimapur-Kohima Base</span>
            </div>
            <a
              href="tel:03862248555"
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black text-[10px] font-black uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]"
            >
              <PhoneCall className="w-3 h-3" /> BRO
            </a>
          </div>

          <div className="p-3.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between">
            <div>
              <div className="text-xs font-black uppercase text-black">
                STNM Multispeciality Referral Hospital
              </div>
              <p className="text-xs font-bold text-neutral-600">Teesta Gorge High Altitude Trauma</p>
              <span className="text-[10px] font-mono text-neutral-500">Sochakgang, Gangtok</span>
            </div>
            <a
              href="tel:03592202022"
              className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase border border-black flex items-center gap-1 shadow-[1px_1px_0px_#000]"
            >
              <PhoneCall className="w-3 h-3" /> Call
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
