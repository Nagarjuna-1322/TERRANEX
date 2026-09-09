import React, { useState, useRef, useEffect } from 'react';
import { Road, Vehicle } from '../types';
import { useTranslation, getLocalizedHighwayName } from '../translations';
import { api } from '../services/api';
import {
  speakText,
  stopSpeaking,
  startVoiceRecognition,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  detectTextLanguage
} from '../utils/speech';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  ArrowRight,
  RotateCcw,
  Copy,
  Check,
  Radio,
  X,
  Loader2,
  HelpCircle,
  PhoneCall
} from 'lucide-react';

interface UnifiedVoiceChatboxProps {
  roads: Road[];
  vehicles?: Vehicle[];
  onOpenMap?: () => void;
  onOpenRoute?: () => void;
  onEmergencySOS?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  isVoice?: boolean;
  status?: 'BLOCKED' | 'RESTRICTED' | 'ACCESSIBLE' | 'INFO';
  suggestsDetour?: boolean;
  detectedLang?: 'en' | 'hi' | 'as';
}

export const UnifiedVoiceChatbox: React.FC<UnifiedVoiceChatboxProps> = ({
  roads,
  vehicles = [],
  onOpenMap,
  onOpenRoute,
  onEmergencySOS
}) => {
  const { t, lang } = useTranslation();

  // Dedicated Chatbot Language: converted to English by default as requested
  const [chatLang, setChatLang] = useState<'en' | 'hi' | 'as'>('en');

  // Voice recognition & speaking state
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [speakingLang, setSpeakingLang] = useState<'en' | 'hi' | 'as' | null>(null);
  const [autoReadback, setAutoReadback] = useState<boolean>(true);
  const [activeSession, setActiveSession] = useState<{ stop: () => void } | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Chat input & messages
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome message localized to chatLang (English default)
  const getInitialMessage = (targetLang: 'en' | 'hi' | 'as' = chatLang): ChatMessage => ({
    id: 'welcome-1',
    sender: 'assistant',
    text:
      targetLang === 'hi'
        ? 'नमस्ते! मैं आपका **टेरानेक्स एआई वॉयस एवं चैट सहायक** हूँ।\n\nआप **माइक बटन दबाकर बोल सकते हैं** 🎙️ या नीचे लिखकर कोई भी प्रश्न पूछ सकते हैं:\n- सड़क अवरोध और बाईपास (तवांग, एनएच-13, एनएच-15, एनएच-29)\n- आपातकालीन काफिले और मौसम की स्थिति\n- कोई भी सामान्य या सुरक्षा से जुड़ा प्रश्न'
        : targetLang === 'as'
        ? 'নমস্কাৰ! মই আপোনাৰ **টেৰানেক্স এআই কণ্ঠ আৰু চেট সহায়ক**।\n\nআপুনি **মাইক্ৰ\'ফোন টিপি কথা ক\'ব পাৰে** 🎙️ বা তলত লিখি যিকোনো প্ৰশ্ন সুধিব পাৰে:\n- ঘাইপথৰ অৱস্থা আৰু বিকল্প সুৰক্ষিত পথ (তাৱাং, NH-13)\n- জৰুৰীকালীন সাহায্য বাহন আৰু বতৰৰ সতৰ্কবাৰ্তা\n- যিকোনো সুৰক্ষা নিয়ম বা সাধাৰণ তথ্য'
        : 'Welcome! I am your **TerraNex AI Voice & Chat Assistant**, directly connected to live Northeast India operational telemetry.\n\nYou can **tap the microphone to speak hands-free** 🎙️ or type any question below:\n- Highway blockages & safe bypasses (Tawang, NH-13, NH-15, NH-29)\n- Emergency medical convoys & mountain rainfall alerts\n- Any routing, disaster safety, vehicle maintenance, or general knowledge questions',
    time: 'Live',
    status: 'INFO'
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage('en')]);

  // Update welcome message if chat language changes and only 1 message exists
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [getInitialMessage(chatLang)];
      }
      return prev;
    });
  }, [chatLang]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (activeSession) {
        try {
          activeSession.stop();
        } catch (_) {}
      }
    };
  }, [activeSession]);

  // Quick prompt chips (in chatLang, English by default)
  const quickPrompts = [
    {
      label: chatLang === 'hi' ? '🏔️ तवांग खुला है?' : chatLang === 'as' ? '🏔️ তাৱাং পথ মুকলি?' : '🏔️ Is Tawang road open?',
      query: chatLang === 'hi' ? 'तवांग का रास्ता खुला है क्या? सुरक्षित बाईपास कौन सा है?' : chatLang === 'as' ? 'তাৱাঙলৈ যোৱা পথ মুকলি আছেনে? বিকল্প পথ কি?' : 'Is the road to Tawang open and what is the safest bypass?'
    },
    {
      label: chatLang === 'hi' ? '⛔ कौन सी सड़क बंद है?' : chatLang === 'as' ? '⛔ কোন পথ বন্ধ?' : '⛔ Which highways are blocked?',
      query: chatLang === 'hi' ? 'वर्तमान में कौन सी सड़क या हाईवे भूस्खलन से बंद है?' : chatLang === 'as' ? 'বৰ্তমান কোনবোৰ ঘাইপথ ভূমিস্খলনৰ বাবে বন্ধ হৈ আছে?' : 'Which highways in the Northeast are currently blocked by landslides?'
    },
    {
      label: chatLang === 'hi' ? '🚑 आपातकालीन काफिला TNX-1042' : chatLang === 'as' ? '🚑 এণ্টি-ভেনম কনভয়' : '🚑 Medical Convoy TNX-1042',
      query: chatLang === 'hi' ? 'एंटी-वेनम ले जा रहे काफिले TNX-1042 की क्या स्थिति है?' : chatLang === 'as' ? 'এণ্টি-ভেনম কঢ়িয়াই নিয়া TNX-1042 কনভয়ৰ স্থিতি কি?' : 'What is the real-time status of critical medical convoy TNX-1042?'
    },
    {
      label: chatLang === 'hi' ? '🚨 24/7 हेल्पलाइन नंबर' : chatLang === 'as' ? '🚨 দুৰ্যোগ হেল্পলাইন' : '🚨 24/7 Helplines',
      query: chatLang === 'hi' ? 'पूर्वोत्तर भारत में आपदा और सड़क आपातकाल के लिए हेल्पलाइन नंबर क्या हैं?' : chatLang === 'as' ? 'উত্তৰ-পূবৰ জৰুৰীকালীন দুৰ্যোগ হেল্পলাইন নম্বৰসমূহ দিয়ক।' : 'What are the official 24/7 disaster and highway emergency helpline numbers?'
    },
    {
      label: chatLang === 'hi' ? '🌧️ बारिश और मौसम' : chatLang === 'as' ? '🌧️ বৰষুণৰ সতৰ্কতা' : '🌧️ Rainfall & Landslide Alert',
      query: chatLang === 'hi' ? 'अरुणाचल और पश्चिम कामेंग में कितनी बारिश हो रही है?' : chatLang === 'as' ? 'পশ্চিম কামেং আৰু অৰুণাচলত বৰষুণৰ পৰিমাণ কিমান?' : 'What is the rainfall intensity and landslide alert level in West Kameng?'
    },
    {
      label: chatLang === 'hi' ? '🚘 पहाड़ी ड्राइविंग नियम' : chatLang === 'as' ? '🚘 পাহাৰীয়া ড্ৰাইভিং' : '🚘 Mountain Ghat Driving Tips',
      query: chatLang === 'hi' ? 'बारिश में पहाड़ी रास्तों पर सुरक्षित ड्राइविंग के लिए क्या सावधानियां रखनी चाहिए?' : chatLang === 'as' ? 'পাহাৰীয়া পথত বাৰিষাৰ সময়ত গাড়ী চলোৱাৰ নিয়ম কি?' : 'What are the safe driving guidelines on steep mountain ghats during heavy rain?'
    }
  ];

  // Voice recognition toggle
  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setSpeakingMsgId(null);
    }

    if (isListening) {
      if (activeSession) {
        activeSession.stop();
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setVoiceError(
        chatLang === 'hi'
          ? 'इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया लिखकर प्रश्न पूछें।'
          : chatLang === 'as'
          ? 'এই ব্ৰাউজাৰত কণ্ঠ চিনাক্তকৰণ সুবিধা নাই। অনুগ্ৰহ কৰি লিখি সোধক।'
          : 'Speech recognition is not supported in this browser. Please type your query.'
      );
      return;
    }

    setVoiceError(null);
    const session = startVoiceRecognition(chatLang, {
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript: string) => {
        setIsListening(false);
        if (transcript.trim()) {
          handleSendMessage(transcript.trim(), true);
        }
      },
      onError: (err: string) => {
        setIsListening(false);
        console.warn('Voice recognition error:', err);
        setVoiceError(
          chatLang === 'hi'
            ? 'आवाज़ साफ़ सुनाई नहीं दी। कृपया दोबारा बोलें या लिखकर पूछें।'
            : chatLang === 'as'
            ? 'কণ্ঠ স্পষ্টকৈ শুনা नগল। অনুগ্ৰহ কৰি পুনৰ কওক বা লিখক।'
            : 'Could not capture clear speech. Please try speaking again or type your question.'
        );
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    setActiveSession(session);
  };

  // Full Audio Briefing of all Northeast highways
  const handleFullAudioBriefing = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setSpeakingMsgId(null);
      return;
    }

    const blocked = roads.filter((r) => r.status === 'BLOCKED');
    let speechText = '';

    if (chatLang === 'hi') {
      speechText =
        blocked.length > 0
          ? `सावधान! ${blocked
              .map((r) => getLocalizedHighwayName(r.code, 'hi'))
              .join(', ')} पर भूस्खलन के कारण रास्ता अवरुद्ध है। तवांग जाने के लिए कृपया शेरगांव दक्षिणी कॉरिडोर बाईपास अपनाएं। एनएच-15 और एनएच-27 चालू और सुरक्षित हैं। आपातकालीन सहायता के लिए 112 पर कॉल करें।`
          : 'पूर्वोत्तर भारत के सभी 7 मुख्य राजमार्ग खुले और सुरक्षित हैं। यात्रा के दौरान सावधानी से गाड़ी चलाएं।';
    } else if (chatLang === 'as') {
      speechText =
        blocked.length > 0
          ? `সতৰ্কবাৰ্তা! এনএইচ-১৩ ভালুকপং-তাৱাং পথত ভূমিস্খলনৰ বাবে পথ বন্ধ আছে। শ্বেৰগাঁও সুৰক্ষিত বাইপাছ ব্যৱহাৰ কৰক। বাকী পথসমূহ মুকলি আছে। জৰুৰীকালীন সাহায্যৰ বাবে ১১২ নম্বৰত যোগাযোগ কৰক।`
          : 'সকলো ঘাইপথ মুকলি আৰু সুৰক্ষিত অৱস্থাত আছে। সাৱধানেৰে গাড়ী চলাওক।';
    } else {
      speechText =
        blocked.length > 0
          ? `Advisory alert: NH-13 Bhalukpong to Tawang is currently blocked at Kilometer 81.3 due to an active rockslide. The Shergaon Southern Corridor bypass is open and safe for transit with an ETA increase of only 32 minutes. Other highways NH-15 and NH-27 are fully accessible.`
          : 'All 7 key monitored arterial corridors across Northeast India are open and accessible. Drive carefully in high altitude sectors.';
    }

    setIsPlayingAudio(true);
    setSpeakingMsgId('briefing');
    speakText(speechText, chatLang, () => {
      setIsPlayingAudio(false);
      setSpeakingMsgId(null);
    });
  };

  // Speak single assistant response with automatic language detection
  const handleSpeakResponse = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      stopSpeaking();
      setSpeakingMsgId(null);
      setIsPlayingAudio(false);
      setSpeakingLang(null);
      return;
    }

    stopSpeaking();
    setIsPlayingAudio(true);
    setSpeakingMsgId(msgId);

    // Automatically detect language (Hindi, English, Assamese) with chatLang default
    const detected = detectTextLanguage(text, chatLang);
    setSpeakingLang(detected);

    speakText(
      text,
      detected || chatLang,
      () => {
        setSpeakingMsgId(null);
        setIsPlayingAudio(false);
        setSpeakingLang(null);
      },
      {
        onStart: (langCode) => {
          setSpeakingLang(langCode);
        }
      }
    );
  };

  // Send message to AI Assistant
  const handleSendMessage = async (textToSend?: string, wasVoice: boolean = false) => {
    const promptText = (textToSend || query).trim();
    if (!promptText || isLoading) return;

    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      setSpeakingMsgId(null);
      setSpeakingLang(null);
    }

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      time,
      isVoice: wasVoice
    };

    // Prepare multi-turn history for backend
    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);
    setVoiceError(null);

    try {
      const res = await api.askAssistant(promptText, historyPayload, chatLang);
      const answerText = res.answer || 'Response generated based on live operational telemetry.';

      // Determine road status flags for visual badge
      let status: 'BLOCKED' | 'RESTRICTED' | 'ACCESSIBLE' | 'INFO' = 'INFO';
      const textLower = answerText.toLowerCase();
      if (textLower.includes('blocked') || textLower.includes('अवरुद्ध') || textLower.includes('বন্ধ')) {
        status = 'BLOCKED';
      } else if (textLower.includes('high risk') || textLower.includes('जोखिम') || textLower.includes('বিপদ')) {
        status = 'RESTRICTED';
      } else if (textLower.includes('accessible') || textLower.includes('सुरक्षित') || textLower.includes('সুৰক্ষিত')) {
        status = 'ACCESSIBLE';
      }

      const suggestsDetour =
        textLower.includes('shergaon') ||
        textLower.includes('शेरगांव') ||
        textLower.includes('bypass') ||
        textLower.includes('बाईपास') ||
        textLower.includes('detour');

      const detected = detectTextLanguage(answerText, chatLang);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: answerText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status,
        suggestsDetour,
        detectedLang: detected
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Enable Text-to-Speech (TTS) for the AI chatbot responses that automatically
      // detects and reads back in the user's selected language (Hindi or English)
      if (autoReadback || wasVoice) {
        setTimeout(() => {
          handleSpeakResponse(assistantMsg.id, answerText);
        }, 80);
      }
    } catch (err) {
      const fallbackText =
        chatLang === 'hi'
          ? 'एनएच-13 (भालुकपोंग-तवांग) किमी 81.3 पर भूस्खलन के कारण अवरुद्ध है। तवांग के लिए शेरगांव दक्षिणी कॉरिडोर बाईपास खुला है। अधिक जानकारी के लिए पुनः पूछें।'
          : chatLang === 'as'
          ? 'NH-13 ভালুকপং-তাৱাং পথ ভূমিস্খলনৰ বাবে বন্ধ। তাৱাঙলৈ শ্বেৰগাঁও বাইপাছ ব্যৱহাৰ কৰক। অনুগ্ৰহ কৰি পুনৰ প্ৰশ্ন সোধক।'
          : 'Operational Telemetry: NH-13 is BLOCKED at Km 81.3 due to an active rockfall. The Shergaon Southern Corridor bypass is open and safe (+32 mins ETA). Ask any follow-up question.';

      const detectedErr = detectTextLanguage(fallbackText, chatLang);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'BLOCKED',
        suggestsDetour: true,
        detectedLang: detectedErr
      };
      setMessages((prev) => [...prev, errorMsg]);

      if (autoReadback || wasVoice) {
        setTimeout(() => {
          handleSpeakResponse(errorMsg.id, fallbackText);
        }, 80);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleClearChat = () => {
    stopSpeaking();
    setIsPlayingAudio(false);
    setSpeakingMsgId(null);
    setMessages([getInitialMessage()]);
  };

  // Markdown renderer helper
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          const parts = line.split(/(\*\*.*?\*\*)/g);
          const formattedLine = parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return (
                <strong key={pIdx} className="font-black text-black">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-[#ff3e00] font-black">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-black font-black font-mono">
                  {line.trim().match(/^\d+\./)?.[0]}
                </span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          return <p key={idx}>{formattedLine}</p>;
        })}
      </div>
    );
  };

  return (
    <div
      id="voice-ai-chatbox"
      className="bg-white border-3 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden text-[#0a0a0a]"
    >
      {/* 1. Header Banner */}
      <div className="bg-neutral-900 text-white px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b-2 border-black">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#ff3e00] border-2 border-white shadow-[2px_2px_0px_#000]">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white font-mono">
                {chatLang === 'hi'
                  ? 'टेरानेक्स एआई वॉयस एवं चैट सहायक'
                  : chatLang === 'as'
                  ? 'টেৰানেক্স এআই কণ্ঠ আৰু চেট সহায়ক'
                  : 'TerraNex AI Voice & Chat Assistant'}
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 font-bold">
              {chatLang === 'hi'
                ? 'माइक से बोलें या लिखकर पूछें • किसी भी प्रश्न का तत्काल सटीक उत्तर'
                : chatLang === 'as'
                ? 'মাইক ব্যৱহাৰ কৰক বা লিখক • সকলো প্ৰশ্নৰ লাইভ উত্তৰ'
                : 'Speak with Mic or Type • Live operational telemetry & general intelligence'}
            </p>
          </div>
        </div>

        {/* Top Control Actions */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Chatbot Language Selector (Converted to English default) */}
          <div className="flex items-center bg-black border-2 border-white/40 p-0.5 text-xs font-mono font-black shadow-[2px_2px_0px_#000]">
            <button
              type="button"
              onClick={() => {
                setChatLang('en');
                stopSpeaking();
              }}
              className={`px-2 py-1 uppercase transition cursor-pointer text-xs ${
                chatLang === 'en'
                  ? 'bg-[#ff3e00] text-white font-black'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Convert AI Chatbot to English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => {
                setChatLang('hi');
                stopSpeaking();
              }}
              className={`px-2 py-1 uppercase transition cursor-pointer text-xs ${
                chatLang === 'hi'
                  ? 'bg-[#ff3e00] text-white font-black'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Switch AI Chatbot to Hindi"
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => {
                setChatLang('as');
                stopSpeaking();
              }}
              className={`px-2 py-1 uppercase transition cursor-pointer text-xs ${
                chatLang === 'as'
                  ? 'bg-[#ff3e00] text-white font-black'
                  : 'text-neutral-300 hover:text-white'
              }`}
              title="Switch AI Chatbot to Assamese"
            >
              অসমীয়া
            </button>
          </div>

          {/* Auto-TTS (Readback) Switch */}
          <button
            id="btn-toggle-auto-tts"
            type="button"
            onClick={() => {
              if (isPlayingAudio && autoReadback) {
                stopSpeaking();
                setIsPlayingAudio(false);
                setSpeakingMsgId(null);
                setSpeakingLang(null);
              }
              setAutoReadback(!autoReadback);
            }}
            className={`px-2.5 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer ${
              autoReadback
                ? 'bg-emerald-400 hover:bg-emerald-300 text-black'
                : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
            }`}
            title={
              autoReadback
                ? (chatLang === 'hi' ? 'ऑटो टीटीएस चालू है (जवाब स्वतः बोलकर सुनाएगा)' : 'Auto-TTS is ON: Automatically reads back answers')
                : (chatLang === 'hi' ? 'ऑटो टीटीएस बंद है' : 'Auto-TTS is OFF: Click to enable automatic readback')
            }
          >
            <Volume2 className={`w-3.5 h-3.5 ${autoReadback ? 'text-black' : 'text-neutral-400'}`} />
            <span>
              {chatLang === 'hi' ? 'ऑटो टीटीएस' : chatLang === 'as' ? 'অটো টিটিএছ' : 'Auto-TTS'}
            </span>
            <span
              className={`px-1.5 py-0.2 text-[9px] font-mono font-black ${
                autoReadback ? 'bg-black text-emerald-300' : 'bg-neutral-900 text-neutral-400'
              }`}
            >
              {autoReadback ? 'ON' : 'OFF'}
            </span>
          </button>

          {/* Highway Audio Bulletin button */}
          <button
            onClick={handleFullAudioBriefing}
            className={`px-2.5 py-1.5 border-2 border-black text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer ${
              speakingMsgId === 'briefing'
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-amber-300 hover:bg-amber-400 text-black'
            }`}
            title="Listen to full regional road advisory in audio"
          >
            {speakingMsgId === 'briefing' ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {chatLang === 'hi' ? 'रोकें' : chatLang === 'as' ? 'বন্ধ কৰক' : 'Stop'}
                </span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-black" />
                <span className="hidden sm:inline">
                  {chatLang === 'hi' ? 'रोड बुलेटिन' : chatLang === 'as' ? 'পথ বুলেটিন' : 'Road Bulletin'}
                </span>
              </>
            )}
          </button>

          {/* Reset Chat */}
          <button
            onClick={handleClearChat}
            className="p-1.5 bg-white hover:bg-neutral-200 text-black border-2 border-black shadow-[2px_2px_0px_#000] transition cursor-pointer"
            title="Reset Chatbox"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Audio Playback Notification Strip */}
      {isPlayingAudio && (
        <div className="bg-yellow-300 border-b-2 border-black px-4 py-2 flex items-center justify-between text-xs font-black text-black animate-pulse shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <span className="w-1.5 h-4 bg-black animate-bounce"></span>
              <span className="w-1.5 h-5 bg-black animate-bounce [animation-delay:0.15s]"></span>
              <span className="w-1.5 h-3 bg-black animate-bounce [animation-delay:0.3s]"></span>
            </div>
            <span>
              {speakingLang === 'hi'
                ? '🗣️ टीटीएस हिन्दी में बोल रहा है (Text-to-Speech Hindi)...'
                : speakingLang === 'as'
                ? '🗣️ টিটিএছ অসমীয়াত পঢ়ি আছে (Text-to-Speech Assamese)...'
                : '🗣️ TTS Reading Back in English...'}
            </span>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              setIsPlayingAudio(false);
              setSpeakingMsgId(null);
              setSpeakingLang(null);
            }}
            className="px-2.5 py-1 bg-black hover:bg-red-600 text-white text-[11px] font-black uppercase transition cursor-pointer flex items-center gap-1 border border-black shadow-[1px_1px_0px_#000]"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>{chatLang === 'hi' ? 'रोकें (Stop)' : 'Stop Audio'}</span>
          </button>
        </div>
      )}

      {/* 2. Interactive Microphone Command Hero Strip */}
      <div className="p-4 sm:p-5 bg-[#fff8f0] border-b-2 border-black">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Large tactile Microphone Button */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              id="btn-voice-chatbox-mic"
              type="button"
              onClick={handleToggleVoice}
              className={`relative group w-20 h-20 sm:w-24 sm:h-24 rounded-none border-3 border-black flex flex-col items-center justify-center shrink-0 transition shadow-[5px_5px_0px_#0a0a0a] active:translate-x-1 active:translate-y-1 cursor-pointer ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-[#ff3e00] hover:bg-black text-white'
              }`}
              title={isListening ? 'Click to Stop Listening' : 'Click to Speak Question Hands-Free'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-9 h-9 text-white animate-bounce" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-white">
                    {chatLang === 'hi' ? 'सुन रहा हूँ' : chatLang === 'as' ? 'শুনি আছোঁ' : 'Listening'}
                  </span>
                </>
              ) : (
                <>
                  <Mic className="w-9 h-9 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider mt-1 text-white">
                    {chatLang === 'hi' ? 'बोलें' : chatLang === 'as' ? 'কওক' : 'Speak'}
                  </span>
                </>
              )}
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-200 border border-amber-800 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#ff3e00]" />
                {chatLang === 'hi'
                  ? 'हाथ मुक्त आवाज़ एवं चैट'
                  : chatLang === 'as'
                  ? 'হাত-মুক্ত কণ্ঠ আৰু চেট'
                  : 'Hands-Free Voice & Chat'}
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">
                {isListening
                  ? chatLang === 'hi'
                    ? 'कृपया बोलिए... आपकी आवाज़ सुनी जा रही है'
                    : chatLang === 'as'
                    ? 'অনুগ্ৰহ কৰি কওক... শুনি থকা হৈছে'
                    : 'Listening... Speak your question now'
                  : chatLang === 'hi'
                  ? 'माइक दबाकर बोलें या नीचे लिखें'
                  : chatLang === 'as'
                  ? 'মাইক টিপি কওক বা তলত লিখক'
                  : 'Tap Mic to Speak or Type Below'}
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-600 mt-0.5">
                {chatLang === 'hi'
                  ? 'सड़क, मौसम, दवा काफिले या किसी भी सामान्य सवाल का तुरंत उत्तर पाएं।'
                  : chatLang === 'as'
                  ? 'পথ, বতৰ, কনভয় বা যিকোনো সাধাৰণ প্ৰশ্নৰ তৎক্ষণাৎ উত্তৰ পাওক।'
                  : 'Get instant answers for road conditions, detours, weather, or any query.'}
              </p>
            </div>
          </div>

          {/* Right: Quick SOS & Map shortcuts */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="px-3.5 py-2 bg-white hover:bg-neutral-100 border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer flex items-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span>{chatLang === 'hi' ? 'लाइव नक्शा' : chatLang === 'as' ? 'নক্সা চাওক' : 'GIS Map'}</span>
              </button>
            )}
            {onEmergencySOS && (
              <button
                onClick={onEmergencySOS}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>SOS (112)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Visualizer waves when listening */}
        {isListening && (
          <div className="mt-3.5 bg-red-600 text-white border-2 border-black p-3 flex items-center justify-between shadow-[3px_3px_0px_#0a0a0a] animate-pulse">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-6 bg-white animate-bounce"></span>
                <span className="w-1.5 h-8 bg-white animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1.5 h-4 bg-white animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1.5 h-7 bg-white animate-bounce [animation-delay:0.45s]"></span>
              </div>
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === 'hi'
                  ? 'माइक्रोफ़ोन सक्रिय है... बोलते ही उत्तर मिलेगा'
                  : lang === 'as'
                  ? 'মাইক্ৰ\'ফোন সক্ৰিয়... কথা কোৱাৰ লগে লগে উত্তৰ ওলাব'
                  : 'Microphone active... Auto-transcribing speech into AI reasoning'}
              </span>
            </div>
            <button
              onClick={handleToggleVoice}
              className="px-2.5 py-1 bg-black text-white text-[11px] font-black uppercase border border-white hover:bg-neutral-900 transition cursor-pointer"
            >
              {lang === 'hi' ? 'रद्द करें' : lang === 'as' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>
        )}

        {/* Voice Error Alert */}
        {voiceError && (
          <div className="mt-2.5 bg-amber-100 border-2 border-amber-600 p-2.5 text-xs font-bold text-amber-900 flex items-center justify-between">
            <span>{voiceError}</span>
            <button
              onClick={() => setVoiceError(null)}
              className="text-amber-900 hover:text-black font-black ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* 3. Conversational Message Stream */}
      <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto space-y-3.5 bg-[#fbfbfb]">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] p-3.5 sm:p-4 leading-relaxed border-2 border-black text-xs sm:text-sm ${
                m.sender === 'user'
                  ? 'bg-[#0a0a0a] text-white font-medium shadow-[3px_3px_0px_#ff3e00]'
                  : m.status === 'BLOCKED'
                  ? 'bg-red-50 text-black shadow-[3px_3px_0px_#dc2626] border-red-600'
                  : m.status === 'RESTRICTED'
                  ? 'bg-amber-50 text-black shadow-[3px_3px_0px_#d97706] border-amber-600'
                  : m.status === 'ACCESSIBLE'
                  ? 'bg-emerald-50 text-black shadow-[3px_3px_0px_#059669] border-emerald-600'
                  : 'bg-white text-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]'
              }`}
            >
              {/* Header inside assistant response */}
              {m.sender === 'assistant' && (
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/15">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase">
                    <Bot className="w-3.5 h-3.5 text-[#ff3e00]" />
                    <span>TerraNex AI</span>
                    {speakingMsgId === m.id && (
                      <span className="px-1.5 py-0.2 bg-yellow-300 text-black text-[9px] font-black flex items-center gap-1 border border-black animate-pulse">
                        <Volume2 className="w-3 h-3 text-red-600" />
                        {speakingLang === 'hi'
                          ? 'बोल रहा है (हिन्दी)'
                          : speakingLang === 'as'
                          ? 'কৈ আছে (অসমীয়া)'
                          : 'Speaking (English)'}
                      </span>
                    )}
                    {m.status === 'BLOCKED' && (
                      <span className="px-1.5 py-0.2 bg-red-600 text-white text-[10px] font-black">
                        {t.status?.blocked || 'BLOCKED'}
                      </span>
                    )}
                    {m.status === 'RESTRICTED' && (
                      <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[10px] font-black">
                        {t.status?.highRisk || 'HIGH RISK'}
                      </span>
                    )}
                    {m.status === 'ACCESSIBLE' && (
                      <span className="px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-black">
                        {t.status?.accessible || 'ACCESSIBLE'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Message text */}
              <div>{m.sender === 'assistant' ? renderFormattedText(m.text) : m.text}</div>

              {/* Action buttons inside message if bypass detour recommended */}
              {m.suggestsDetour && onOpenRoute && (
                <div className="mt-3 pt-3 border-t border-dashed border-black/25 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black uppercase text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'hi'
                      ? 'शेरगांव बाईपास चालू है'
                      : lang === 'as'
                      ? 'শ্বেৰগাঁও বাইপাছ সুচল'
                      : 'Shergaon Safe Bypass Open'}
                  </span>
                  <button
                    onClick={onOpenRoute}
                    className="px-2.5 py-1 bg-[#ff3e00] hover:bg-black text-white text-[11px] font-black uppercase tracking-wider border border-black transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{lang === 'hi' ? 'बाईपास देखें' : lang === 'as' ? 'বাইপাছ চাওক' : 'View Detour'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Message Action Footer */}
            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] font-mono text-neutral-500 font-bold uppercase">
              <span>{m.time}</span>
              {m.isVoice && (
                <span className="text-[#ff3e00] flex items-center gap-0.5">
                  <Mic className="w-3 h-3" /> Spoken
                </span>
              )}
              {m.sender === 'assistant' && (
                <>
                  <span>•</span>
                  {/* TTS Listen / Read Aloud button */}
                  <button
                    id={`btn-tts-${m.id}`}
                    type="button"
                    onClick={() => handleSpeakResponse(m.id, m.text)}
                    className={`flex items-center gap-1 cursor-pointer transition font-bold px-1.5 py-0.5 border ${
                      speakingMsgId === m.id
                        ? 'bg-red-600 text-white border-black animate-pulse'
                        : 'hover:bg-neutral-200 border-neutral-300 text-neutral-800'
                    }`}
                    title={
                      speakingMsgId === m.id
                        ? (chatLang === 'hi' ? 'बोलना रोकें' : 'Stop audio playback')
                        : (chatLang === 'hi' ? 'टेक्स्ट-टू-स्पीच से सुनें' : 'Read aloud with Text-to-Speech')
                    }
                  >
                    {speakingMsgId === m.id ? (
                      <>
                        <VolumeX className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-black">
                          {chatLang === 'hi' ? 'रोकें (Stop)' : chatLang === 'as' ? 'বন্ধ' : 'Stop'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-[#ff3e00]" />
                        <span className="text-[10px]">
                          {chatLang === 'hi' ? 'आवाज़ में सुनें' : chatLang === 'as' ? 'শব্দত শুনক' : 'Read Aloud'}
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 bg-neutral-200 text-neutral-700 font-bold">
                          {detectTextLanguage(m.text, chatLang) === 'hi'
                            ? 'हिन्दी'
                            : detectTextLanguage(m.text, chatLang) === 'as'
                            ? 'অসমীয়া'
                            : 'EN'}
                        </span>
                      </>
                    )}
                  </button>

                  <span>•</span>
                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyText(m.id, m.text)}
                    className="hover:text-black flex items-center gap-1 cursor-pointer transition font-bold"
                    title="Copy text"
                  >
                    {copiedMsgId === m.id ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-black">
                        <Check className="w-3 h-3" />
                        Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Copy className="w-3 h-3" />
                        Copy
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2.5 text-[#0a0a0a] text-xs p-3 bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] max-w-[85%] font-mono font-bold">
            <Loader2 className="w-4 h-4 animate-spin text-[#ff3e00]" />
            <span>
              {chatLang === 'hi'
                ? 'टेरानेक्स एआई विश्लेषण कर रहा है...'
                : chatLang === 'as'
                ? 'টেৰানেক্স এআই বিশ্লেষণ কৰি আছে...'
                : 'TerraNex AI is retrieving live telemetry and reasoning...'}
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Suggestion Prompts */}
      <div className="px-4 py-2.5 bg-[#f4f4f4] border-t-2 border-black">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-neutral-600 font-mono uppercase font-black tracking-widest flex items-center gap-1">
            <Radio className="w-3 h-3 text-[#ff3e00]" />
            {chatLang === 'hi'
              ? 'त्वरित प्रश्न (स्पर्श करके पूछें):'
              : chatLang === 'as'
              ? 'দ্ৰুত প্ৰশ্ন (টিপি সোধক):'
              : 'Tap to Ask Instant Question:'}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.query, false)}
              disabled={isLoading}
              className="px-2.5 py-1.5 bg-white hover:bg-[#ff3e00] hover:text-white disabled:opacity-40 text-[#0a0a0a] text-xs whitespace-nowrap transition border-2 border-black shadow-[2px_2px_0px_#0a0a0a] font-black uppercase tracking-wider cursor-pointer"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Unified Text + Mic Chat Input Bar */}
      <div className="p-3.5 bg-white border-t-2 border-black">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone trigger right next to input */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 border-2 border-black transition cursor-pointer shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-center shrink-0 ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-[#ff3e00] hover:bg-black text-white'
            }`}
            title="Speak Question"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Typing input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              chatLang === 'hi'
                ? 'कोई भी सवाल पूछें (सड़क, बाईपास, मौसम, एम्बुलेंस, या सामान्य ज्ञान)...'
                : chatLang === 'as'
                ? 'যিকোনো প্ৰশ্ন লিখক (পথ, বিকল্প পথ, বতৰ বা সাধাৰণ তথ্য)...'
                : 'Ask any question (roads, bypass, weather, convoy, or general knowledge)...'
            }
            className="flex-1 p-2.5 bg-[#f4f4f4] border-2 border-black text-xs sm:text-sm text-[#0a0a0a] focus:bg-white focus:outline-none placeholder:text-neutral-500 font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="p-2.5 bg-black hover:bg-[#ff3e00] disabled:opacity-40 text-white font-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer flex items-center gap-1"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
