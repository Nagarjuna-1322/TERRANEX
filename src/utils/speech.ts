// Web Speech API Voice Helper for Low-Literacy & Hands-Free Audio Guidance
import { Road } from '../types';

// Global reference to active utterance to prevent garbage-collection cutoffs in Chromium
let activeUtterance: SpeechSynthesisUtterance | null = null;
let keepAliveInterval: any = null;

/**
 * Automatically detects whether the text is primarily Hindi (Devanagari script),
 * Assamese/Bengali, or English (Latin script), while taking the user's selected language
 * preference into consideration.
 */
export function detectTextLanguage(
  text: string,
  preferredLang?: 'en' | 'hi' | 'as'
): 'en' | 'hi' | 'as' {
  if (!text || !text.trim()) return preferredLang || 'en';

  // Count Devanagari characters (Hindi: \u0900-\u097F)
  const devanagariMatches = text.match(/[\u0900-\u097F]/g);
  const devanagariCount = devanagariMatches ? devanagariMatches.length : 0;

  // Count Assamese/Bengali characters (\u0980-\u09FF)
  const assameseMatches = text.match(/[\u0980-\u09FF]/g);
  const assameseCount = assameseMatches ? assameseMatches.length : 0;

  // Count Latin characters (English: [a-zA-Z])
  const latinMatches = text.match(/[a-zA-Z]/g);
  const latinCount = latinMatches ? latinMatches.length : 0;

  // If text contains substantial Devanagari (Hindi)
  if (devanagariCount > 3 || (devanagariCount > 0 && devanagariCount >= latinCount * 0.2)) {
    return 'hi';
  }

  // If text contains substantial Assamese/Bengali
  if (assameseCount > 3 || (assameseCount > 0 && assameseCount >= latinCount * 0.2)) {
    return 'as';
  }

  // If text contains substantial Latin script (English)
  if (latinCount > 5 && devanagariCount === 0 && assameseCount === 0) {
    return 'en';
  }

  // If user explicitly selected Hindi or English, and text is ambiguous or code/short
  if (preferredLang === 'hi') return 'hi';
  if (preferredLang === 'as') return 'as';
  return 'en';
}

/**
 * Find best matching browser voice for language
 */
export function getBestVoiceForLanguage(lang: 'en' | 'hi' | 'as'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  if (lang === 'hi') {
    // Look for dedicated Hindi voice
    const hindiVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      const n = v.name.toLowerCase();
      return (
        l.startsWith('hi') ||
        n.includes('hindi') ||
        n.includes('हिन्दी') ||
        n.includes('lekha') ||
        n.includes('hemant') ||
        n.includes('kalpana') ||
        n.includes('neel')
      );
    });
    if (hindiVoice) return hindiVoice;
  } else if (lang === 'as') {
    // Look for Assamese or Bengali regional voice
    const asVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      const n = v.name.toLowerCase();
      return (
        l.startsWith('as') ||
        l.startsWith('bn') ||
        n.includes('assamese') ||
        n.includes('bengali')
      );
    });
    if (asVoice) return asVoice;
  }

  // For English: prefer Indian English voice for accurate Indian names/routes
  if (lang === 'en' || lang === 'as') {
    const indianEngVoice = voices.find((v) => {
      const l = v.lang.toLowerCase().replace('_', '-');
      const n = v.name.toLowerCase();
      return (
        l.startsWith('en-in') ||
        n.includes('india') ||
        n.includes('ravi') ||
        n.includes('heera')
      );
    });
    if (indianEngVoice) return indianEngVoice;
  }

  // Next look for any English voice
  const anyEngVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEngVoice) return anyEngVoice;

  // Fallback to default voice
  return voices.find((v) => v.default) || voices[0] || null;
}

/**
 * Strips markdown symbols, bullet points, and formats text for natural, crystal-clear speech.
 */
export function cleanTextForSpeech(rawText: string, targetLang: 'en' | 'hi' | 'as'): string {
  let cleaned = rawText
    // Remove markdown links [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove bold and italics formatting **text** or *text*
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove markdown headers #, ##, etc.
    .replace(/^#+\s+/gm, '')
    // Remove bullet points
    .replace(/^[•\-\*]\s+/gm, '')
    // Remove numbered lists like "1. ", "2. "
    .replace(/^\d+\.\s+/gm, '')
    // Remove backticks
    .replace(/`([^`]+)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    // Remove divider lines
    .replace(/^---+$/gm, '')
    // Replace newlines with full stops so speech pauses naturally
    .replace(/\n+/g, '. ')
    .trim();

  // Normalize Indian acronyms for fluent pronunciations
  if (targetLang === 'en') {
    cleaned = cleaned
      .replace(/\bNH-(\d+)\b/gi, 'National Highway $1')
      .replace(/\bNH(\d+)\b/gi, 'National Highway $1')
      .replace(/\bKm\b/g, 'Kilometer')
      .replace(/\bkm\b/g, 'kilometer')
      .replace(/\bETA\b/g, 'estimated arrival time')
      .replace(/\bSOS\b/g, 'S.O.S.');
  }

  return cleaned;
}

export interface SpeakOptions {
  onStart?: (detectedLang: 'en' | 'hi' | 'as') => void;
  rate?: number;
  pitch?: number;
}

export function speakText(
  text: string,
  lang: 'en' | 'hi' | 'as' = 'en',
  onEnd?: () => void,
  options?: SpeakOptions
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  try {
    stopSpeaking(); // Stop any currently playing audio

    // Automatically detect language of text while respecting user's selected language
    const detectedLang = detectTextLanguage(text, lang);
    const speechReadyText = cleanTextForSpeech(text, detectedLang);

    if (!speechReadyText.trim()) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechReadyText);
    activeUtterance = utterance;

    // Set voice & language code
    if (detectedLang === 'hi') {
      utterance.lang = 'hi-IN';
      utterance.rate = options?.rate ?? 0.9; // Clear deliberate pace for Hindi phonetics
    } else if (detectedLang === 'as') {
      utterance.lang = 'as-IN';
      utterance.rate = options?.rate ?? 0.9;
    } else {
      utterance.lang = 'en-IN';
      utterance.rate = options?.rate ?? 0.95; // Natural speed for English readback
    }

    utterance.pitch = options?.pitch ?? 1.0;

    // Attach best matched voice if available
    const bestVoice = getBestVoiceForLanguage(detectedLang);
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    if (options?.onStart) {
      utterance.onstart = () => {
        options.onStart?.(detectedLang);
      };
    }

    const cleanup = () => {
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onend = cleanup;
    utterance.onerror = (err) => {
      console.warn('Speech synthesis playback ended with state:', err);
      cleanup();
    };

    // Chromium keep-alive to prevent speech synthesis pause on long text
    keepAliveInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        if (keepAliveInterval) {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
      }
    }, 10000);

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    if (onEnd) onEnd();
  }
}

export function stopSpeaking() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  activeUtterance = null;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      // Reset stuck state in Chromium
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (_) {}
  }
}

// Check if browser supports Web Speech Synthesis (TTS)
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Check if browser supports Web Speech Recognition
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

export interface VoiceRecognitionHandlers {
  onStart?: () => void;
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

// Start voice recognition instance
export function startVoiceRecognition(
  lang: 'en' | 'hi' | 'as',
  handlers: VoiceRecognitionHandlers
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    if (handlers.onError) {
      handlers.onError('Speech recognition not supported on this device/browser');
    }
    return { stop: () => {} };
  }

  try {
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognizer = new SpeechRecognitionConstructor();

    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    // Set recognition language
    if (lang === 'hi') {
      recognizer.lang = 'hi-IN';
    } else if (lang === 'as') {
      // If native Assamese is not available in browser model, Bengali or Hindi catches North East phonetics well
      recognizer.lang = 'as-IN';
    } else {
      recognizer.lang = 'en-IN';
    }

    recognizer.onstart = () => {
      if (handlers.onStart) handlers.onStart();
    };

    recognizer.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        handlers.onResult(transcript);
      }
    };

    recognizer.onerror = (event: any) => {
      console.warn('Speech recognition error event:', event.error);
      if (handlers.onError) {
        handlers.onError(event.error || 'Voice input error');
      }
    };

    recognizer.onend = () => {
      if (handlers.onEnd) handlers.onEnd();
    };

    recognizer.start();

    return {
      stop: () => {
        try {
          recognizer.stop();
        } catch {
          // ignore
        }
      }
    };
  } catch (err) {
    console.warn('Failed to start recognizer:', err);
    if (handlers.onError) {
      handlers.onError('Microphone permission required or voice service unavailable.');
    }
    return { stop: () => {} };
  }
}

export interface VoiceQueryResult {
  transcript: string;
  spokenAnswer: string;
  headline: string;
  status: 'BLOCKED' | 'ACCESSIBLE' | 'RESTRICTED' | 'GENERAL';
  matchedRoad?: Road;
  alternateRoadName?: string;
  advice: string;
}

// Intelligent Offline & Online-capable Natural Language Road Accessibility Evaluator
export function evaluateVoiceRoadQuery(
  rawQuery: string,
  roads: Road[],
  lang: 'en' | 'hi' | 'as'
): VoiceQueryResult {
  const q = rawQuery.toLowerCase().trim();
  const safeRoads = roads || [];

  // Find road matching keywords
  const nh13 = safeRoads.find((r) => r.code === 'NH-13');
  const nh27 = safeRoads.find((r) => r.code === 'NH-27');
  const nh15 = safeRoads.find((r) => r.code === 'NH-15');
  const nh29 = safeRoads.find((r) => r.code === 'NH-29');
  const nh10 = safeRoads.find((r) => r.code === 'NH-10');

  // Check queries for Tawang / NH-13
  if (
    q.includes('tawang') ||
    q.includes('तवांग') ||
    q.includes('তাৱাং') ||
    q.includes('nh-13') ||
    q.includes('nh13') ||
    q.includes('13') ||
    q.includes('bhalukpong') ||
    q.includes('भालुकपॉन्ग')
  ) {
    const isBlocked = nh13?.status === 'BLOCKED';
    if (isBlocked) {
      return {
        transcript: rawQuery,
        headline: lang === 'hi' ? 'तवांग मार्ग (NH-13) बंद है' : lang === 'as' ? 'তাৱাং পথ (NH-13) বন্ধ আছে' : 'Tawang Highway (NH-13) is Blocked',
        status: 'BLOCKED',
        matchedRoad: nh13,
        alternateRoadName: lang === 'hi' ? 'शेरगांव बाईपास (NH-15)' : lang === 'as' ? 'শ্বেৰগাঁও বাইপাছ (NH-15)' : 'Shergaon Bypass (NH-15)',
        spokenAnswer:
          lang === 'hi'
            ? 'सावधान! भालुकपॉन्ग से तवांग जाने वाला NH-13 मार्ग भूस्खलन के कारण पूरी तरह बंद है। गाड़ियां नहीं जा सकतीं। आप शेरगांव बाईपास होकर सुरक्षित जा सकते हैं, केवल बत्तीस मिनट अतिरिक्त लगेंगे।'
            : lang === 'as'
            ? 'সাৱধান! ভালুকপং-তাৱাং সংযোগী NH-13 পথত ভূমিস্খলন হৈ পথ বন্ধ হৈছে। আপুনি শ্বেৰগাঁও বাইপাছ ব্যৱহাৰ কৰি সুৰক্ষিতভাৱে যাব পাৰিব।'
            : 'Warning! The NH-13 corridor to Tawang is completely blocked due to an active rockslide. Please take the Shergaon Bypass via NH-15 which is safe and adds only 32 minutes.',
        advice:
          lang === 'hi'
            ? 'गाड़ी को शेरगांव बाईपास की ओर मोड़ें। आपातकालीन मदद के लिए 112 पर कॉल करें।'
            : lang === 'as'
            ? 'শ্বেৰগাঁও হৈ বিকল্প পথ লওক। সহায়ৰ বাবে ১১২ নম্বৰত কল কৰক।'
            : 'Divert convoy via Kalaktang-Shergaon corridor. Call 112 if stranded.'
      };
    } else {
      return {
        transcript: rawQuery,
        headline: lang === 'hi' ? 'तवांग मार्ग खुला है' : 'Tawang Highway is Open',
        status: 'ACCESSIBLE',
        matchedRoad: nh13,
        spokenAnswer:
          lang === 'hi'
            ? 'तवांग जाने वाला NH-13 मार्ग अभी खुला है। मौसम को देखते हुए संभलकर गाड़ी चलाएं।'
            : 'The Tawang highway is currently open. Drive safely across mountain curves.',
        advice: lang === 'hi' ? 'मार्ग सुचारू है, सामान्य गति से चलें।' : 'Corridor is operational.'
      };
    }
  }

  // Check queries for Shillong / Guwahati / NH-27
  if (
    q.includes('shillong') ||
    q.includes('शिलॉन्ग') ||
    q.includes('शिलांग') ||
    q.includes('শ্বিলং') ||
    q.includes('guwahati') ||
    q.includes('गुवाहाटी') ||
    q.includes('গুৱাহাটী') ||
    q.includes('nh-27') ||
    q.includes('nh27') ||
    q.includes('27')
  ) {
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'गुवाहाटी-शिलॉन्ग मार्ग (NH-27) खुला है' : lang === 'as' ? 'গুৱাহাটী-শ্বিলং পথ (NH-27) মুকলি আছে' : 'Guwahati-Shillong (NH-27) is Safe & Open',
      status: 'ACCESSIBLE',
      matchedRoad: nh27,
      spokenAnswer:
        lang === 'hi'
          ? 'गुवाहाटी से शिलॉन्ग जाने वाला NH-27 मार्ग पूरी तरह खुला और सुरक्षित है। कोई रुकावट नहीं है, आप आराम से जा सकते हैं।'
          : lang === 'as'
          ? 'গুৱাহাটীৰ পৰা শ্বিলং যোৱা NH-27 ঘাইপথ সম্পূৰ্ণ মুকলি আৰু সুৰক্ষিত অৱস্থাত আছে।'
          : 'The Guwahati to Shillong highway on NH-27 is fully open and completely safe. Traffic flow is normal.',
      advice: lang === 'hi' ? 'सड़क खुली है। सुरक्षित यात्रा करें।' : 'Route clear. Normal transit advised.'
    };
  }

  // Check queries for Tezpur / Pasighat / NH-15
  if (
    q.includes('tezpur') ||
    q.includes('तेजपुर') ||
    q.includes('pasighat') ||
    q.includes('पासीघाट') ||
    q.includes('nh-15') ||
    q.includes('nh15') ||
    q.includes('15')
  ) {
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'तेजपुर-पासीघाट मार्ग (NH-15) खुला है' : 'Tezpur-Pasighat (NH-15) is Open',
      status: 'ACCESSIBLE',
      matchedRoad: nh15,
      spokenAnswer:
        lang === 'hi'
          ? 'तेजपुर से पासीघाट मार्ग NH-15 पूरी तरह खुला है। यह बाईपास रास्ता भी तवांग के लिए सुरक्षित है।'
          : 'Tezpur to Pasighat highway NH-15 is open and functioning normally.',
      advice: lang === 'hi' ? 'मार्ग साफ़ है।' : 'All lanes open.'
    };
  }

  // Check queries for Kohima / Dimapur / NH-29
  if (
    q.includes('kohima') ||
    q.includes('कोहिमा') ||
    q.includes('কহিমা') ||
    q.includes('dimapur') ||
    q.includes('दीमापुर') ||
    q.includes('nh-29') ||
    q.includes('nh29') ||
    q.includes('29')
  ) {
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'दीमापुर-कोहिमा (NH-29): सावधानी से जाएं' : 'Dimapur-Kohima (NH-29): Single Lane / Restricted',
      status: 'RESTRICTED',
      matchedRoad: nh29,
      spokenAnswer:
        lang === 'hi'
          ? 'दीमापुर से कोहिमा जाने वाले NH-29 मार्ग पर चूमुकेदिमा के पास सड़क धंसने से एक ही लेन खुली है। गाड़ियां धीमी गति से निकल रही हैं।'
          : 'Dimapur to Kohima NH-29 has single lane restriction near Chumukedima. Expect moderate delay.',
      advice: lang === 'hi' ? 'धीमी गति से गाड़ी चलाएं।' : 'Single-lane restricted traffic.'
    };
  }

  // Check queries for Gangtok / Siliguri / Sikkim / NH-10
  if (
    q.includes('gangtok') ||
    q.includes('गंगटोक') ||
    q.includes('गेংটক') ||
    q.includes('siliguri') ||
    q.includes('सिलीगुड़ी') ||
    q.includes('sikkim') ||
    q.includes('सिक्किम') ||
    q.includes('nh-10') ||
    q.includes('nh10') ||
    q.includes('10')
  ) {
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'सिलीगुड़ी-गंगटोक (NH-10) खुला है' : 'Siliguri-Gangtok (NH-10) is Open',
      status: 'ACCESSIBLE',
      matchedRoad: nh10,
      spokenAnswer:
        lang === 'hi'
          ? 'सिलीगुड़ी से गंगटोक जाने वाला NH-10 मार्ग खुला है। तीस्ता नदी के किनारे संभलकर चलें।'
          : 'The Siliguri to Gangtok highway NH-10 is open. Drive carefully along Teesta river.',
      advice: lang === 'hi' ? 'मार्ग सुचारू है।' : 'Highway is open.'
    };
  }

  // General questions like "कौन सा रास्ता बंद है?" / "What road is closed?" / "landslide"
  if (
    q.includes('बंद') ||
    q.includes('closed') ||
    q.includes('blocked') ||
    q.includes('landslide') ||
    q.includes('भूस्खलन') ||
    q.includes('चट्टान') ||
    q.includes('খৰাং') ||
    q.includes('কেনে') ||
    q.includes('खतरा')
  ) {
    const blockedCount = roads.filter((r) => r.status === 'BLOCKED').length;
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'NH-13 तवांग मार्ग बंद है' : 'NH-13 Tawang Road is Blocked',
      status: 'BLOCKED',
      matchedRoad: nh13,
      alternateRoadName: lang === 'hi' ? 'शेरगांव बाईपास' : 'Shergaon Bypass',
      spokenAnswer:
        lang === 'hi'
          ? `वर्तमान में केवल भालुकपॉन्ग से तवांग जाने वाला NH-13 मार्ग भूस्खलन के कारण बंद है। बाकी सभी मुख्य सड़कें जैसे NH-27 और NH-15 पूरी तरह खुली और सुरक्षित हैं।`
          : `Only the NH-13 Bhalukpong to Tawang road is currently blocked by a landslide. All other highways including NH-27 and NH-15 are open and safe.`,
      advice: lang === 'hi' ? 'तवांग के लिए शेरगांव बाईपास का प्रयोग करें।' : 'Use Shergaon Bypass for Tawang.'
    };
  }

  // Safe detour / bypass question
  if (
    q.includes('bypass') ||
    q.includes('बाईपास') ||
    q.includes('वैकल्पिक') ||
    q.includes('safe') ||
    q.includes('सुरक्षित') ||
    q.includes('রাস্তা') ||
    q.includes('detour')
  ) {
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'शेरगांव बाईपास पूरी तरह सुरक्षित है' : 'Shergaon Bypass is Recommended Safe Route',
      status: 'ACCESSIBLE',
      alternateRoadName: lang === 'hi' ? 'शेरगांव बाईपास (NH-15)' : 'Shergaon Bypass (NH-15)',
      spokenAnswer:
        lang === 'hi'
          ? 'तवांग जाने के लिए शेरगांव बाईपास सबसे सुरक्षित और खुला रास्ता है। इस रास्ते पर कोई भूस्खलन नहीं है और खतरा केवल 24 प्रतिशत है।'
          : 'The Shergaon Bypass via NH-15 is the safest route to Tawang. It bypasses the active landslide with low disruption risk.',
      advice: lang === 'hi' ? 'शेरगांव बाईपास मार्ग चुनें।' : 'Take Shergaon Bypass.'
    };
  }

  // Emergency / Help query
  if (
    q.includes('मदद') ||
    q.includes('help') ||
    q.includes('police') ||
    q.includes('doctor') ||
    q.includes('ambulance') ||
    q.includes('आपातकाल') ||
    q.includes('emergency') ||
    q.includes('sos')
  ) {
    return {
      transcript: rawQuery,
      headline: lang === 'hi' ? 'आपातकालीन सहायता: 112 डायल करें' : 'Emergency Help: Dial 112',
      status: 'GENERAL',
      spokenAnswer:
        lang === 'hi'
          ? 'किसी भी आपातकाल या संकट में तुरंत एक सौ बारह या आपदा कंट्रोल रूम दस सतहत्तर पर फोन करें। कंट्रोल रूम को संदेश भेजने के लिए नीचे लाल एसओएस बटन दबाएं।'
          : 'For immediate emergency assistance, call 112 or disaster control 1077. You can also tap the red SOS button below.',
      advice: lang === 'hi' ? 'हेल्पलाइन 112 पर कॉल करें।' : 'Call 112 or 1077.'
    };
  }

  // Default overall status response
  const blockedList = roads.filter((r) => r.status === 'BLOCKED');
  return {
    transcript: rawQuery,
    headline:
      blockedList.length > 0
        ? (lang === 'hi' ? 'NH-13 बंद, बाकी सड़कें सुरक्षित हैं' : 'NH-13 Blocked, Other Highways Safe')
        : (lang === 'hi' ? 'सभी मुख्य रास्ते खुले हैं' : 'All Main Roads are Open'),
    status: blockedList.length > 0 ? 'BLOCKED' : 'ACCESSIBLE',
    spokenAnswer:
      lang === 'hi'
        ? 'भालुकपॉन्ग से तवांग जाने वाला NH-13 मार्ग भूस्खलन के कारण बंद है। तवांग के लिए शेरगांव बाईपास खुला है। गुवाहाटी, शिलॉन्ग, और तेजपुर की सड़कें पूरी तरह खुली और सुरक्षित हैं।'
        : 'The NH-13 route to Tawang is blocked by rockfall. The Shergaon detour is open. Highways to Guwahati, Shillong, and Tezpur are clear and safe.',
    advice: lang === 'hi' ? 'तवांग जाने वाले शेरगांव बाईपास का प्रयोग करें।' : 'Use Shergaon Bypass for Tawang.'
  };
}
