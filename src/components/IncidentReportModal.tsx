import React, { useState } from 'react';
import { IncidentType, IncidentSeverity } from '../types';
import { OfflineSyncService } from '../services/offlineSync';
import { api } from '../services/api';
import {
  Camera,
  Upload,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  WifiOff,
  RotateCw,
  Eye
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedHighwayName,
  getLocalizedIncidentType
} from '../translations';

interface IncidentReportModalProps {
  onClose: () => void;
  onReportSubmitted: (incident: any) => void;
  isOnline: boolean;
  defaultRoadCode?: string;
  defaultRoadId?: string;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    name: 'Landslide (NH-13)',
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    type: 'Landslide' as IncidentType,
    severity: 'High' as IncidentSeverity,
    desc: '450m³ boulder and mud debris collapsed across both lanes at Km 81.3 near Tenga gorge.'
  },
  {
    name: 'Flood / Overflow (NH-15)',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    type: 'Flood' as IncidentType,
    severity: 'Medium' as IncidentSeverity,
    desc: 'Subansiri river tributary submerged culvert approach with 1.2ft fast moving water.'
  },
  {
    name: 'Road Subsidence (NH-29)',
    url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80',
    type: 'Road Damage' as IncidentType,
    severity: 'High' as IncidentSeverity,
    desc: '40-meter longitudinal pavement fracture with valley-side collapse near Chumukedima.'
  }
];

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  onClose,
  onReportSubmitted,
  isOnline,
  defaultRoadCode = 'NH-13',
  defaultRoadId = 'road-nh13'
}) => {
  const { t, lang } = useTranslation();
  const [incidentType, setIncidentType] = useState<IncidentType>('Landslide');
  const [severity, setSeverity] = useState<IncidentSeverity>('High');
  const [roadCode, setRoadCode] = useState<string>(defaultRoadCode);
  const [roadId, setRoadId] = useState<string>(defaultRoadId);
  const [accessibility, setAccessibility] = useState<'Accessible' | 'Restricted' | 'Blocked'>('Blocked');
  const [description, setDescription] = useState<string>(
    lang === 'hi'
      ? 'चट्टान और भारी मलबा गिरने से सड़क बंद हो गई है।'
      : lang === 'as'
      ? 'শিলা আৰু ভূমিস্খলনৰ বাবে পথ বন্ধ হৈ পৰিছে।'
      : 'Active rock and mud debris collapsed across both carriage lanes. No heavy vehicle can pass.'
  );
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_PHOTO_PRESETS[0].url);

  // GPS Telemetry (Simulated real GPS sensor read)
  const [gps, setGps] = useState({
    lat: 27.2418,
    lng: 92.4822,
    accuracy: '±3.8m',
    timestamp: 'Live GPS Sensor Lock'
  });

  const [isClassifying, setIsClassifying] = useState<boolean>(false);
  const [aiClassification, setAiClassification] = useState<any>({
    incidentType: 'Landslide',
    severity: 'High',
    roadImpact: 'FULL_BLOCKAGE',
    confidence: 91,
    recommendedAction: 'Restrict traffic and reroute essential supplies via Southern bypass corridor.'
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Run AI classification
  const handleRunAiClassification = async () => {
    setIsClassifying(true);
    try {
      const res = await api.classifyIncidentAi({
        description,
        roadCode,
        lat: gps.lat,
        lng: gps.lng
      });
      if (res.aiClassification) {
        setAiClassification(res.aiClassification);
        setIncidentType(res.aiClassification.incidentType || incidentType);
        setSeverity(res.aiClassification.severity || severity);
      }
    } catch (err) {
      console.error('AI classification error:', err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reportData = {
      roadId,
      roadCode,
      type: incidentType,
      severity,
      accessibility,
      description,
      imageUrl,
      lat: gps.lat,
      lng: gps.lng,
      vehiclesAffected: severity === 'Critical' ? 45 : severity === 'High' ? 24 : 10,
      deliveriesAffected: severity === 'Critical' ? 8 : 3,
      aiClassification,
      status: 'ACTIVE' as const,
      reportedBy: 'Field Inspector (Mobile Device)',
      reportedRole: 'field_officer' as const
    };

    try {
      if (isOnline) {
        const res = await api.createIncident(reportData);
        onReportSubmitted(res.incident || reportData);
      } else {
        // Enqueue into offline store
        OfflineSyncService.enqueueItem('INCIDENT_REPORT', reportData);
        onReportSubmitted({
          ...reportData,
          id: `offline-${Date.now()}`,
          incidentCode: `#OFFLINE-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
          reportedAt: 'Saved in Local Queue'
        });
      }
    } catch (err) {
      // Fallback offline queue
      OfflineSyncService.enqueueItem('INCIDENT_REPORT', reportData);
      onReportSubmitted({
        ...reportData,
        id: `offline-${Date.now()}`,
        incidentCode: `#OFFLINE-SYNC-${Math.floor(1000 + Math.random() * 9000)}`,
        reportedAt: 'Saved in Local Queue'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPreset = (preset: (typeof SAMPLE_PHOTO_PRESETS)[0]) => {
    setImageUrl(preset.url);
    setIncidentType(preset.type);
    setSeverity(preset.severity);
    setDescription(preset.desc);
    if (preset.type === 'Landslide') {
      setRoadCode('NH-13');
      setRoadId('road-nh13');
      setGps({ lat: 27.2418, lng: 92.4822, accuracy: '±3.8m', timestamp: 'Live GPS Sensor Lock' });
    } else if (preset.type === 'Flood') {
      setRoadCode('NH-15');
      setRoadId('road-nh15');
      setGps({ lat: 27.214, lng: 94.085, accuracy: '±4.2m', timestamp: 'Live GPS Sensor Lock' });
    } else {
      setRoadCode('NH-29');
      setRoadId('road-nh29');
      setGps({ lat: 25.731, lng: 94.028, accuracy: '±5.0m', timestamp: 'Live GPS Sensor Lock' });
    }
  };

  // Localized UI strings based on active language
  const modalText = {
    title: lang === 'hi' ? 'सड़क पर समस्या बताएं' : lang === 'as' ? 'পথৰ সমস্যা অৱগত কৰক' : 'Report Road Hazard',
    subtitle: lang === 'hi' ? '1-क्लिक में फोटो और जानकारी सीधे कंट्रोल रूम को भेजें' : lang === 'as' ? '১-ক্লিকতে ফটো আৰু তথ্য প্ৰশাসনলৈ প্ৰেৰণ কৰক' : '1-click hazard reporting sent directly to command post',
    offlineBadge: lang === 'hi' ? 'ऑफ़लाइन' : lang === 'as' ? 'অফলাইন' : 'OFFLINE',
    step1: lang === 'hi' ? '1. क्या परेशानी है? (खतरे का प्रकार चुनें):' : lang === 'as' ? '১. কি সমস্যা হৈছে? (বিপদ বাছনি কৰক):' : '1. What is the issue? (Select hazard type):',
    step2: lang === 'hi' ? '2. फोटो का नमूना या अपनी फोटो:' : lang === 'as' ? '২. ফটোৰ নমুনা বা নিজৰ ফটো:' : '2. Sample photo or your captured photo:',
    step3: lang === 'hi' ? '3. कौन सी सड़क / हाईवे है?' : lang === 'as' ? '৩. কোনটো পথ বা ঘাইপথ?' : '3. Which road / highway corridor?',
    step4: lang === 'hi' ? '4. रास्ता खुला है या बंद?' : lang === 'as' ? '৪. পথটো মুকলি নে বন্ধ?' : '4. Is the road open or blocked?',
    step5: lang === 'hi' ? '5. विवरण या बोलकर बताएं:' : lang === 'as' ? '৫. বিৱৰণ বা কণ্ঠৰে কওক:' : '5. Details or voice note:',
    voiceBtn: lang === 'hi' ? '🎙️ बोलकर जोड़ें' : lang === 'as' ? '🎙️ কণ্ঠ বাৰ্তা যোগ কৰক' : '🎙️ Add Voice Note',
    placeholder: lang === 'hi' ? 'समस्या के बारे में लिखें या ऊपर दिए गए बटन से बोलें...' : lang === 'as' ? 'সমস্যাৰ বিষয়ে লিখক বা কণ্ঠ বাৰ্তা ব্যৱহাৰ কৰক...' : 'Describe the hazard or use voice note above...',
    gpsLocked: lang === 'hi' ? 'जीपीएस लोकेशन अपने आप जुड़ गई है' : lang === 'as' ? 'GPS স্থান স্বয়ংক্ৰিয়ভাৱে সংলগ্ন হৈছে' : 'GPS location automatically attached',
    cancel: lang === 'hi' ? 'रद्द करें' : lang === 'as' ? 'বাতিল কৰক' : 'Cancel',
    submitting: lang === 'hi' ? 'भेज रहे हैं...' : lang === 'as' ? 'প্ৰেৰণ কৰি থকা হৈছে...' : 'Sending report...',
    submit: lang === 'hi' ? '✅ अभी रिपोर्ट भेजें' : lang === 'as' ? '✅ এতিয়াই প্ৰতিবেদন পঠাওক' : '✅ Submit Hazard Report',
    hazardCats: [
      {
        type: 'Landslide' as IncidentType,
        label: lang === 'hi' ? 'चट्टान गिरी / भूस्खलन' : lang === 'as' ? 'শিলাস্খলন / ভূমিস্খলন' : 'Landslide / Rockfall',
        sub: 'Landslide',
        icon: '🪨'
      },
      {
        type: 'Flood' as IncidentType,
        label: lang === 'hi' ? 'पानी भरा / बाढ़' : lang === 'as' ? 'পানী ভৰা / বান' : 'Water / River Flood',
        sub: 'Flood',
        icon: '🌊'
      },
      {
        type: 'Road Damage' as IncidentType,
        label: lang === 'hi' ? 'सड़क टूटी / धंसी' : lang === 'as' ? 'পথ ভগা / ক্ষতিগ্ৰস্ত' : 'Road Damage / Crack',
        sub: 'Road Damage',
        icon: '🚧'
      },
      {
        type: 'Traffic Congestion' as IncidentType,
        label: lang === 'hi' ? 'भारी जाम' : lang === 'as' ? 'যান-জঁট' : 'Traffic Jam',
        sub: 'Congestion',
        icon: '🚚'
      }
    ],
    statusOptions: [
      {
        value: 'Blocked',
        label: lang === 'hi' ? '⛔ रास्ता पूरी तरह बंद है (Blocked)' : lang === 'as' ? '⛔ পথ সম্পূৰ্ণৰূপে বন্ধ (Blocked)' : '⛔ Road Completely Blocked'
      },
      {
        value: 'Restricted',
        label: lang === 'hi' ? '⚠️ धीमे-धीमे निकल रहे हैं (Restricted)' : lang === 'as' ? '⚠️ লেহেমীয়া গতিৰে চলাচল (Restricted)' : '⚠️ Single Lane / Slow Moving (Restricted)'
      },
      {
        value: 'Accessible',
        label: lang === 'hi' ? '✅ रास्ता खुला है (Accessible)' : lang === 'as' ? '✅ পথ মুকলি আছে (Accessible)' : '✅ Road is Open & Clear (Accessible)'
      }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-2xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ff3e00] text-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg uppercase tracking-tight text-black flex items-center gap-2">
                {modalText.title}
                {!isOnline && (
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white border border-black flex items-center gap-1 uppercase font-bold">
                    <WifiOff className="w-3 h-3" /> {modalText.offlineBadge}
                  </span>
                )}
              </h3>
              <div className="text-xs text-neutral-600 font-bold">
                {modalText.subtitle}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] font-black flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Visual Category Selector */}
          <div>
            <span className="text-xs font-black text-black uppercase tracking-wider block mb-2">
              {modalText.step1}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {modalText.hazardCats.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => {
                    setIncidentType(item.type);
                    if (item.type === 'Landslide') {
                      setDescription(
                        lang === 'hi'
                          ? 'चट्टान और भारी मलबा गिरने से सड़क बंद हो गई है।'
                          : lang === 'as'
                          ? 'শিলা আৰু ভূমিস্খলনৰ বাবে পথ বন্ধ হৈ পৰিছে।'
                          : '450m³ boulder and mud debris collapsed across both lanes at Km 81.3.'
                      );
                      setRoadCode('NH-13');
                      setAccessibility('Blocked');
                    } else if (item.type === 'Flood') {
                      setDescription(
                        lang === 'hi'
                          ? 'सड़क पर पानी भर जाने से गाड़ियां रुकी हैं।'
                          : lang === 'as'
                          ? 'পথত পানী ভৰি পৰাৰ ফলত যানবাহন আবদ্ধ হৈ পৰিছে।'
                          : 'Subansiri river tributary submerged culvert approach with fast moving water.'
                      );
                      setRoadCode('NH-15');
                      setAccessibility('Blocked');
                    } else if (item.type === 'Road Damage') {
                      setDescription(
                        lang === 'hi'
                          ? 'सड़क धंसने व टूटने से आवाजाही बाधित है।'
                          : lang === 'as'
                          ? 'পথ ভাঙি যোৱাৰ বাবে চলাচল ব্যাহত হৈছে।'
                          : '40-meter longitudinal pavement fracture with valley-side collapse.'
                      );
                      setRoadCode('NH-29');
                      setAccessibility('Restricted');
                    } else {
                      setDescription(
                        lang === 'hi'
                          ? 'लंबा जाम लगा हुआ है।'
                          : lang === 'as'
                          ? 'দীঘলীয়া যান-জঁটৰ সৃষ্টি হৈছে।'
                          : 'Heavy traffic congestion due to slow freight convoy movement.'
                      );
                      setAccessibility('Restricted');
                    }
                  }}
                  className={`p-3 border-2 border-black text-center transition shadow-[2px_2px_0px_#0a0a0a] flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    incidentType === item.type
                      ? 'bg-[#ff3e00] text-white font-black scale-[1.02]'
                      : 'bg-white text-black hover:bg-neutral-100 font-bold'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-black uppercase">{item.label}</span>
                  <span className={`text-[10px] ${incidentType === item.type ? 'text-white/90' : 'text-neutral-500'}`}>
                    {item.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets with Real Photos */}
          <div>
            <span className="text-xs font-black text-black uppercase tracking-wider block mb-1.5">
              {modalText.step2}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_PHOTO_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-1.5 border-2 border-black text-left transition shadow-[2px_2px_0px_#0a0a0a] cursor-pointer ${
                    imageUrl === p.url
                      ? 'bg-black text-white font-black'
                      : 'bg-white text-black hover:bg-neutral-100 font-bold'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-16 object-cover border border-black mb-1" />
                  <div className="font-black truncate text-[10px] uppercase">
                    {getLocalizedIncidentType(p.type, lang)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Road Selection & Road Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-black text-black uppercase block mb-1">
                {modalText.step3}
              </label>
              <select
                value={roadCode}
                onChange={(e) => setRoadCode(e.target.value)}
                className="w-full p-2.5 bg-white border-2 border-black text-black font-bold focus:border-[#ff3e00] focus:outline-none text-xs"
              >
                <option value="NH-13">NH-13 ({getLocalizedHighwayName('NH-13', lang)})</option>
                <option value="NH-27">NH-27 ({getLocalizedHighwayName('NH-27', lang)})</option>
                <option value="NH-15">NH-15 ({getLocalizedHighwayName('NH-15', lang)})</option>
                <option value="NH-29">NH-29 ({getLocalizedHighwayName('NH-29', lang)})</option>
                <option value="NH-10">NH-10 ({getLocalizedHighwayName('NH-10', lang)})</option>
              </select>
            </div>

            <div>
              <label className="font-black text-black uppercase block mb-1">
                {modalText.step4}
              </label>
              <select
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value as any)}
                className="w-full p-2.5 bg-white border-2 border-black text-black font-bold focus:border-[#ff3e00] focus:outline-none text-xs"
              >
                {modalText.statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description with Audio Helper */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-black text-black uppercase">
                {modalText.step5}
              </label>
              <button
                type="button"
                onClick={() => {
                  setDescription((prev) =>
                    prev +
                    (lang === 'hi'
                      ? ' [आवाज़ से दर्ज: गाड़ियां रुकी हैं, राहत दल की ज़रूरत है]'
                      : lang === 'as'
                      ? ' [কণ্ঠৰে নথিভুক্ত: সাহায্য দলৰ প্ৰয়োজন]'
                      : ' [Voice Note Added: Vehicles waiting, clearance team requested]')
                  );
                }}
                className="px-2 py-0.5 bg-yellow-300 border border-black text-[10px] font-black uppercase flex items-center gap-1 hover:bg-yellow-400 cursor-pointer"
              >
                {modalText.voiceBtn}
              </button>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-white border-2 border-black text-black font-medium focus:border-[#ff3e00] focus:outline-none text-xs"
              placeholder={modalText.placeholder}
            />
          </div>

          {/* Location status */}
          <div className="p-2.5 bg-green-50 border-2 border-green-600 flex items-center justify-between text-xs font-bold text-green-900">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-green-700" />
              <span>{modalText.gpsLocked} ({gps.accuracy})</span>
            </span>
            <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-mono font-black">
              LIVE
            </span>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] font-black uppercase text-xs cursor-pointer"
            >
              {modalText.cancel}
            </button>

            <button
              id="btn-submit-incident-modal"
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-6 bg-[#ff3e00] hover:bg-black text-white border-2 border-black shadow-[3px_3px_0px_#0a0a0a] font-black uppercase text-xs tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>{modalText.submitting}</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{modalText.submit}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
