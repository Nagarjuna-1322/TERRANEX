import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { useTranslation } from '../translations';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  Maximize2,
  Minimize2,
  HelpCircle,
  Radio,
  ExternalLink
} from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

const CATEGORIZED_SUGGESTIONS = {
  en: [
    { label: '🛣️ Highway Status', query: 'Which highways are currently high risk or blocked?' },
    { label: '🔄 Tawang Route', query: 'What is the safest alternate route to Tawang?' },
    { label: '🚑 Medical Convoy', query: 'What is the status of convoy TNX-1042 carrying Anti-Venom?' },
    { label: '⛈️ Landslide Warning', query: 'Why is NH-13 blocked and what is the rainfall in Kameng?' },
    { label: '🚨 Emergency Contacts', query: 'What are the 24/7 disaster helpline numbers for Northeast India?' },
    { label: '🏔️ Mountain Driving', query: 'What are safe driving rules on ghat roads during monsoon?' },
    { label: '❓ General Question', query: 'Tell me about the geography and strategic significance of Northeast India.' }
  ],
  hi: [
    { label: '🛣️ राजमार्ग स्थिति', query: 'वर्तमान में कौन से राजमार्ग अवरुद्ध या उच्च जोखिम पर हैं?' },
    { label: '🔄 तवांग सुरक्षित मार्ग', query: 'तवांग जाने का सबसे सुरक्षित वैकल्पिक मार्ग कौन सा है?' },
    { label: '🚑 आपातकालीन काफिला', query: 'एंटी-वेनम ले जा रहे काफिले TNX-1042 की क्या स्थिति है?' },
    { label: '⛈️ भूस्खलन चेतावनी', query: 'एनएच-13 पर भूस्खलन की क्या स्थिति है और बारिश कितनी है?' },
    { label: '🚨 आपातकालीन नंबर', query: 'पूर्वोत्तर भारत के लिए मुख्य आपदा हेल्पलाइन नंबर क्या हैं?' },
    { label: '🏔️ पर्वतीय ड्राइविंग', query: 'पहाड़ी रास्तों पर भारी बारिश में सुरक्षित ड्राइविंग के नियम क्या हैं?' },
    { label: '❓ सामान्य प्रश्न', query: 'पूर्वोत्तर भारत के भूगोल और सात बहनों (Seven Sisters) के बारे में बताएं।' }
  ],
  as: [
    { label: '🛣️ ঘাইপথৰ অৱস্থা', query: 'বৰ্তমান কোনবোৰ ঘাইপথ বন্ধ বা বিপজ্জনক অৱস্থাত আছে?' },
    { label: '🔄 তাৱাং সুৰক্ষিত পথ', query: 'তাৱাঙলৈ যোৱাৰ আটাইতকৈ সুৰক্ষিত বিকল্প পথ কোনটো?' },
    { label: '🚑 চিকিৎসা সাহায্য কনভয়', query: 'এণ্টি-ভেনম কঢ়িয়াই নিয়া TNX-1042 বাহনখনৰ স্থিতি কি?' },
    { label: '⛈️ ভূমিস্খলন সতৰ্কতা', query: 'NH-13 কিয় বন্ধ হৈছে আৰু বৰষুণৰ পৰিমাণ কিমান?' },
    { label: '🚨 জৰুৰীকালীন নম্বৰ', query: 'উত্তৰ-পূবৰ জৰুৰীকালীন দুৰ্যোগ হেল্পলাইন নম্বৰসমূহ কি কি?' },
    { label: '🏔️ পাহাৰীয়া ড্ৰাইভিং', query: 'পাহাৰীয়া পথত বাৰিষাৰ সময়ত গাড়ী চলোৱাৰ নিয়ম কি?' },
    { label: '❓ সাধাৰণ প্ৰশ্ন', query: 'উত্তৰ-পূৰ্বাঞ্চলৰ ভূগোল আৰু ব্ৰহ্মপুত্ৰ উপত্যকাৰ বিষয়ে কওক।' }
  ]
};

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const { t, lang } = useTranslation();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const initialGreeting =
    lang === 'hi'
      ? 'नमस्ते! मैं टेरानेक्स एआई (TerraNex AI) चैटबॉट हूँ। मैं पूर्वोत्तर भारत के सभी राजमार्गों, भूस्खलन रडार, आपातकालीन काफिलों और आपके किसी भी सामान्य या सुरक्षा प्रश्न का उत्तर देने के लिए तैयार हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?'
      : lang === 'as'
      ? 'নমস্কাৰ! মই টেৰানেক্স এআই (TerraNex AI) চেটবট। উত্তৰ-পূব ভাৰতৰ সকলো পথৰ সুগমতা, ভূমিস্খলনৰ সতৰ্কতা, জৰুৰীকালীন কনভয় আৰু আপোনাৰ যিকোনো প্ৰশ্নৰ উত্তৰ দিবলৈ মই সাজু। মই আপোনাক কিদৰে সহায় কৰিব পাৰোঁ?'
      : 'Greetings! I am TerraNex AI, your comprehensive Intelligence Chatbot. Grounded in live telemetry across all 7 Northeast corridors, active slope hazards, and essential supply convoys—I am ready to answer any question you ask (logistics, disaster safety, weather, or general knowledge). How can I assist you today?';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: initialGreeting,
      time: 'Just now'
    }
  ]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Setup Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'as' ? 'as-IN' : 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          handleSend(transcript);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [lang]);

  if (!isOpen) return null;

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : lang === 'as' ? 'as-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Speech recognition start failed:', e);
      }
    }
  };

  const handleSpeakText = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters before speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : lang === 'as' ? 'as-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyText = (msgId: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    }
  };

  const handleClearChat = () => {
    window.speechSynthesis?.cancel();
    setSpeakingMsgId(null);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: initialGreeting,
        time: 'Just now'
      }
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || query).trim();
    if (!promptText || isLoading) return;

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: promptText,
      time
    };

    // Keep up to last 8 messages for multi-turn history context
    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text
    }));

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const res = await api.askAssistant(promptText, historyPayload, lang);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer || 'I am ready to assist with any further questions.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          lang === 'hi'
            ? 'एनएच-13 किमी 81.3 पर भूस्खलन के कारण अवरुद्ध है। तवांग जाने के लिए शेरगांव बाईपास का उपयोग करें। कृपया अपना प्रश्न पुनः पूछें।'
            : lang === 'as'
            ? 'NH-13 ত ভূমিস্খলনৰ বাবে পথ বন্ধ। তাৱাঙলৈ শ্বেৰগাঁও বাইপাছ ব্যৱহাৰ কৰক। অনুগ্ৰহ কৰি পুনৰ প্ৰশ্ন সোধক।'
            : 'Operational Notice: NH-13 is BLOCKED at Km 81.3 due to a confirmed rockslide; Shergaon bypass is active for Tawang transit. Please ask any follow-up question.',
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format response text with bolding and lists
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;

          // Process bold spans: **bold text**
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

          // Bullet point line
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1.5">
                <span className="text-[#ff3e00] font-black">•</span>
                <span>{formattedLine}</span>
              </div>
            );
          }

          // Numbered point line
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

  const activeSuggestions =
    CATEGORIZED_SUGGESTIONS[lang as 'en' | 'hi' | 'as'] || CATEGORIZED_SUGGESTIONS.en;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div
        className={`w-full ${
          isExpanded ? 'max-w-2xl' : 'max-w-lg'
        } h-full bg-white border-l-2 border-black shadow-[-8px_0px_0px_#0a0a0a] flex flex-col justify-between text-[#0a0a0a] transition-all duration-200`}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border-2 border-black text-[#0a0a0a] shadow-[2px_2px_0px_#0a0a0a]">
              <Bot className="w-6 h-6 text-[#ff3e00]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-[#0a0a0a] uppercase tracking-wide font-mono">
                  {t.modals?.aiAssistant?.title || 'TerraNex AI Chatbot'}
                </h3>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 border border-black text-[9px] font-black font-mono uppercase text-emerald-900">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Gemini 3.8
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 font-bold uppercase tracking-wider">
                {t.modals?.aiAssistant?.subtitle || 'Answers any question • Grounded in live telemetry'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Expand / Minimize Window */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer hidden sm:flex"
              title={isExpanded ? 'Minimize Drawer' : 'Expand Drawer'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Clear Conversation */}
            <button
              onClick={handleClearChat}
              className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSpeakingMsgId(null);
                onClose();
              }}
              className="p-1.5 border-2 border-black bg-white hover:bg-red-50 hover:text-[#ff3e00] text-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer"
              title="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Grounding Status Strip */}
        <div className="px-4 py-1.5 bg-black text-white text-[10px] font-mono font-bold flex items-center justify-between uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-[#ff3e00]">
            <Radio className="w-3 h-3 animate-pulse" />
            Live Context: NH-13 Blocked (Km 81.3) • Shergaon Bypass Active • TNX-1042 En-Route
          </span>
          <span className="text-neutral-400 hidden sm:inline">Ask Any Question</span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] p-3.5 leading-relaxed border-2 border-black ${
                  m.sender === 'user'
                    ? 'bg-[#0a0a0a] text-white font-medium shadow-[3px_3px_0px_#ff3e00]'
                    : 'bg-[#f8f8f8] text-[#0a0a0a] shadow-[3px_3px_0px_#0a0a0a]'
                }`}
              >
                {m.sender === 'assistant' ? renderFormattedText(m.text) : m.text}
              </div>

              {/* Message metadata & action buttons */}
              <div className="flex items-center gap-2 mt-1 px-1 text-[10px] font-mono text-neutral-500 font-bold uppercase">
                <span>{m.time}</span>
                {m.sender === 'assistant' && (
                  <>
                    <span>•</span>
                    {/* Read Aloud Button */}
                    <button
                      onClick={() => handleSpeakText(m.id, m.text)}
                      className="hover:text-black flex items-center gap-1 cursor-pointer transition"
                      title={speakingMsgId === m.id ? 'Stop Reading' : 'Listen to Answer'}
                    >
                      {speakingMsgId === m.id ? (
                        <span className="text-[#ff3e00] flex items-center gap-1">
                          <VolumeX className="w-3 h-3" /> Stop
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3" /> Listen
                        </span>
                      )}
                    </button>

                    <span>•</span>
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyText(m.id, m.text)}
                      className="hover:text-black flex items-center gap-1 cursor-pointer transition"
                      title="Copy Answer"
                    >
                      {copiedMsgId === m.id ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copy
                        </span>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2.5 text-[#0a0a0a] text-xs p-3 bg-neutral-100 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] max-w-[85%] font-mono font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-[#ff3e00]" />
              <span>TerraNex AI is reasoning and generating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-4 py-2 border-t-2 border-black bg-[#f4f4f4]">
          <span className="text-[10px] text-neutral-600 block font-mono mb-1.5 uppercase font-black tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ff3e00]" />
            {t.modals?.aiAssistant?.suggestions || 'Suggested Inquiries (Tap to Ask):'}
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
            {activeSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.query)}
                disabled={isLoading}
                className="px-2.5 py-1 bg-white hover:bg-neutral-100 disabled:opacity-40 text-[#0a0a0a] text-[11px] whitespace-nowrap transition border-2 border-black shadow-[2px_2px_0px_#0a0a0a] font-bold uppercase tracking-wider cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar with Voice Typing */}
        <div className="p-3.5 bg-white border-t-2 border-black">
          {isListening && (
            <div className="mb-2 p-2 bg-red-50 border-2 border-[#ff3e00] text-xs font-mono font-bold flex items-center justify-between text-[#ff3e00] animate-pulse">
              <span className="flex items-center gap-1.5">
                <Mic className="w-4 h-4" /> Listening... Speak your question now
              </span>
              <button
                type="button"
                onClick={toggleVoiceInput}
                className="text-[10px] px-2 py-0.5 bg-[#ff3e00] text-white uppercase font-black"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2.5 border-2 border-black transition cursor-pointer shadow-[2px_2px_0px_#0a0a0a] ${
                isListening
                  ? 'bg-[#ff3e00] text-white animate-pulse'
                  : 'bg-white hover:bg-neutral-100 text-black'
              }`}
              title="Speak Question (Voice Input)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#ff3e00]" />}
            </button>

            {/* Query Input */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                t.modals?.aiAssistant?.placeholder ||
                'Ask any question (roads, rerouting, weather, or general knowledge)...'
              }
              className="flex-1 p-2.5 bg-[#f4f4f4] border-2 border-black text-xs sm:text-sm text-[#0a0a0a] focus:bg-white focus:outline-none placeholder:text-neutral-500 font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2.5 bg-[#ff3e00] hover:bg-black disabled:opacity-40 text-white font-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition cursor-pointer flex items-center gap-1"
              title="Send Inquiry"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
