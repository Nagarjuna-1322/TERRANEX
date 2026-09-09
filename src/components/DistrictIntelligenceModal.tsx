import React, { useState } from 'react';
import { DistrictResilience } from '../types';
import { DISTRICT_RESILIENCE_LIST } from '../data/nerData';
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Truck,
  Package,
  XCircle,
  AlertTriangle,
  CloudRain,
  Activity,
  Gauge
} from 'lucide-react';
import { useTranslation, getLocalizedWeather, getLocalizedLocation } from '../translations';

interface DistrictIntelligenceModalProps {
  initialDistrictId?: string;
  onClose: () => void;
}

export const DistrictIntelligenceModal: React.FC<DistrictIntelligenceModalProps> = ({
  initialDistrictId = 'dist-tawang',
  onClose
}) => {
  const { lang } = useTranslation();
  const [selectedId, setSelectedId] = useState<string>(initialDistrictId);
  const district = DISTRICT_RESILIENCE_LIST.find((d) => d.districtId === selectedId) || DISTRICT_RESILIENCE_LIST[0];

  const t = {
    title: lang === 'hi' ? 'जिला सुगम्यता आसूचना' : lang === 'as' ? 'জিলা সুগমতা চোৰাংচোৱা' : 'District Accessibility Intelligence',
    benchmarkBadge: lang === 'hi' ? 'नेसाक मानक' : lang === 'as' ? 'NESAC মানদণ্ড' : 'NESAC BENCHMARK',
    subTitle: lang === 'hi' ? 'अंतर-जिला रसद भेद्यता सूचकांक' : lang === 'as' ? 'আন্তঃ-জিলা যোগান দুৰ্বলতা সূচক' : 'Cross-district logistical vulnerability index',
    currentWeather: lang === 'hi' ? 'वर्तमान मौसम:' : lang === 'as' ? 'বৰ্তমান বতৰ:' : 'Current Weather:',
    resilienceIndex: lang === 'hi' ? 'लचीलापन सूचकांक' : lang === 'as' ? 'স্থিতিস্থাপকতা সূচক' : 'Resilience Index',
    activeVehicles: lang === 'hi' ? 'सक्रिय वाहन' : lang === 'as' ? 'সক্ৰিয় বাহন' : 'Active Vehicles',
    activeDeliveries: lang === 'hi' ? 'सक्रिय वितरण' : lang === 'as' ? 'সক্ৰিয় যোগান' : 'Active Deliveries',
    blockedRoads: lang === 'hi' ? 'अवरुद्ध सड़कें' : lang === 'as' ? 'বন্ধ পথসমূহ' : 'Blocked Roads',
    riskCorridors: lang === 'hi' ? 'जोखिम गलियारे' : lang === 'as' ? 'বিপদসংকুল পথ' : 'Risk Corridors',
    incidents: lang === 'hi' ? 'घटनाएं' : lang === 'as' ? 'দুৰ্ঘটনা' : 'Incidents',
    breakdownTitle: lang === 'hi' ? 'बहु-कारक लचीलापन घटक विश्लेषण:' : lang === 'as' ? 'বহু-কাৰক স্থিতিস্থাপকতা বিশ্লেষণ:' : 'Multi-Factor Resilience Component Breakdown:',
    statusLabel: (status: string) => {
      if (status === 'HIGH') return lang === 'hi' ? 'उच्च' : lang === 'as' ? 'উচ্চ' : 'HIGH';
      if (status === 'MODERATE') return lang === 'hi' ? 'मध्यम' : lang === 'as' ? 'মধ্যম' : 'MODERATE';
      return lang === 'hi' ? 'कम' : lang === 'as' ? 'কম' : 'LOW';
    },
    closeBtn: lang === 'hi' ? 'आसूचना बंद करें' : lang === 'as' ? 'বন্ধ কৰক' : 'Close Intelligence'
  };

  const getLocalizedDistrictName = (name: string) => {
    return getLocalizedLocation(name, lang);
  };

  const breakdownItems = [
    {
      name: lang === 'hi' ? 'सड़क अवसंरचना विश्वसनीयता' : lang === 'as' ? 'পথ আন্তঃগাঁথনি নিৰ্ভৰযোগ্যতা' : 'Road Infrastructure Reliability',
      score: district.roadReliability,
      desc: lang === 'hi'
        ? 'भूस्खलन के विरुद्ध सड़क की मजबूती व पुल भार क्षमता'
        : lang === 'as'
        ? 'ভূমিস্খলনৰ বিৰুদ্ধে পথৰ স্থায়িত্ব আৰু দলংৰ ক্ষমতা'
        : 'Pavement durability against landslides & bridge load ratings'
    },
    {
      name: lang === 'hi' ? 'बहु-मॉडल मार्ग संपर्क' : lang === 'as' ? 'বহু-মডেল পথ সংযোগ' : 'Multi-Modal Route Connectivity',
      score: district.connectivity,
      desc: lang === 'hi'
        ? 'राज्य की राजधानियों को जोड़ने वाले वैकल्पिक गलियारे'
        : lang === 'as'
        ? 'ৰাজধানীসমূহক সংযোগ কৰা বিকল্প পথ'
        : 'Redundant corridor alternates connecting to state capitals'
    },
    {
      name: lang === 'hi' ? 'आवश्यक आपूर्ति बफर' : lang === 'as' ? 'প্ৰয়োজনীয় যোগান বাফাৰ' : 'Essential Supply Coverage Buffer',
      score: district.supplyCoverage,
      desc: lang === 'hi'
        ? 'अन्न भंडार, ईंधन भंडार एवं ऑक्सीजन आपूर्ति के सुरक्षित दिन'
        : lang === 'as'
        ? 'খাদ্য ভঁৰাল, ইন্ধন আৰু অক্সিজেনৰ মজুত'
        : 'Grain warehouses, fuel reserves, and oxygen stockpile days'
    },
    {
      name: lang === 'hi' ? 'आपातकालीन चिकित्सा पहुंच' : lang === 'as' ? 'জৰুৰীকালীন চিকিৎসা প্ৰৱেশাধিকাৰ' : 'Emergency Medical Access',
      score: district.emergencyAccess,
      desc: lang === 'hi'
        ? 'ट्रॉमा सेंटर्स और आईसीयू तक काफिले का यात्रा समय'
        : lang === 'as'
        ? 'ট্ৰমা কেন্দ্ৰ আৰু আইচিইউ পাবলৈ কনভয়ৰ যাত্ৰা সময়'
        : 'Convoy transit time to referral trauma units & ICUs'
    },
    {
      name: lang === 'hi' ? 'मौसम खतरे से सुरक्षा' : lang === 'as' ? 'বতৰৰ বিপদ প্ৰতিৰোধ' : 'Weather Threat Resistance',
      score: 100 - district.weatherRisk,
      desc: lang === 'hi'
        ? 'बादल फटने और अचानक बाढ़ से निपटने की क्षमता'
        : lang === 'as'
        ? 'ডাৱৰ বিস্ফোৰণ আৰু হঠাত হোৱা বান প্ৰতিৰোধ ক্ষমতা'
        : 'Vulnerability to cloudbursts, Teesta river swell, flash floods'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-3xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white border-2 border-black text-black shadow-[2px_2px_0px_#0a0a0a]">
              <ShieldCheck className="w-5 h-5 text-[#ff3e00]" />
            </div>
            <div>
              <h3 className="massive-type font-black text-sm sm:text-base flex items-center gap-2 uppercase">
                {t.title}
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#ff3e00] text-white border border-black uppercase font-black">
                  {t.benchmarkBadge}
                </span>
              </h3>
              <div className="text-xs text-neutral-600 font-bold uppercase">{t.subTitle}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* District Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
            {DISTRICT_RESILIENCE_LIST.map((d) => (
              <button
                key={d.districtId}
                onClick={() => setSelectedId(d.districtId)}
                className={`px-3 py-1.5 font-mono text-xs whitespace-nowrap uppercase transition border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer ${
                  selectedId === d.districtId
                    ? 'bg-[#ff3e00] text-white font-black'
                    : 'bg-white text-black hover:bg-neutral-100 font-bold'
                }`}
              >
                {getLocalizedDistrictName(d.name).split(' ')[0]} ({d.overallScore})
              </button>
            ))}
          </div>

          {/* District Spotlight Header */}
          <div className="p-4 bg-[#f4f4f4] border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#0a0a0a]">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff3e00]" />
                <h4 className="massive-type text-base font-black text-black uppercase">
                  {getLocalizedDistrictName(district.name)}
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 border border-black bg-white text-black font-bold uppercase">
                  {district.state}
                </span>
              </div>
              <div className="text-xs text-neutral-700 mt-1 flex items-center gap-2 font-bold uppercase">
                <CloudRain className="w-3.5 h-3.5 text-black" /> {t.currentWeather} {getLocalizedWeather(district.weather, lang)}
              </div>
            </div>

            {/* Overall Score Badge */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <div className="text-right font-mono">
                <span className="text-[10px] text-neutral-600 block uppercase font-bold">{t.resilienceIndex}</span>
                <span className="text-2xl font-black text-black">{district.overallScore}</span>
                <span className="text-xs text-neutral-500 font-bold">/100</span>
              </div>
              <span
                className={`px-2.5 py-1 text-xs font-black font-mono uppercase border-2 border-black shadow-[2px_2px_0px_#0a0a0a] ${
                  district.status === 'HIGH'
                    ? 'bg-black text-white'
                    : district.status === 'MODERATE'
                    ? 'bg-amber-400 text-black'
                    : 'bg-[#ff3e00] text-white'
                }`}
              >
                {t.statusLabel(district.status)}
              </span>
            </div>
          </div>

          {/* Operational Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-center">
            <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.activeVehicles}</span>
              <span className="text-base font-black text-black">{district.activeVehicles}</span>
            </div>
            <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.activeDeliveries}</span>
              <span className="text-base font-black text-black">{district.activeDeliveries}</span>
            </div>
            <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.blockedRoads}</span>
              <span className={`text-base font-black ${district.blockedRoads > 0 ? 'text-[#ff3e00]' : 'text-black'}`}>
                {district.blockedRoads}
              </span>
            </div>
            <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.riskCorridors}</span>
              <span className="text-base font-black text-[#ff3e00]">{district.highRiskCorridors}</span>
            </div>
            <div className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] col-span-2 sm:col-span-1">
              <span className="text-neutral-600 text-[10px] block uppercase font-bold">{t.incidents}</span>
              <span className="text-base font-black text-black">{district.activeIncidents}</span>
            </div>
          </div>

          {/* Resilience Sub-Indices Progress Bars */}
          <div className="p-4 bg-white border-2 border-black space-y-3 shadow-[3px_3px_0px_#0a0a0a]">
            <span className="text-[11px] font-black text-black uppercase tracking-wider font-mono block">
              {t.breakdownTitle}
            </span>

            <div className="space-y-3">
              {breakdownItems.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between font-bold uppercase text-[11px]">
                    <span className="text-black">{item.name}</span>
                    <span className="font-mono font-black text-black">{item.score}/100</span>
                  </div>
                  <div className="w-full h-2.5 bg-neutral-200 border-2 border-black overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.score >= 75 ? 'bg-black' : item.score >= 50 ? 'bg-[#ff3e00]' : 'bg-red-600'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-600 font-medium">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#f4f4f4] border-t-2 border-black flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-xs font-black uppercase tracking-wider cursor-pointer"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
