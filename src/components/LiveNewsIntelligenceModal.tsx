import React, { useState } from 'react';
import { NewsArticle, Road, Alert, RoadStatus } from '../types';
import { useTranslation, getLocalizedHighwayName, getLocalizedRoadStatus, getLocalizedLocation } from '../translations';
import {
  Newspaper,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  MapPin,
  RefreshCw,
  Plus,
  Send,
  ShieldCheck,
  Zap,
  ArrowRight,
  Filter,
  X,
  Compass,
  FileText
} from 'lucide-react';

interface LiveNewsIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: NewsArticle[];
  roads?: Road[];
  onApplyNewsImpact?: (article: NewsArticle) => Promise<void>;
  onApplyImpact?: (article: NewsArticle) => Promise<void>;
  onAnalyzeCustomText?: (text: string, source: string) => Promise<NewsArticle>;
  onAnalyzeCustom?: (text: string, source: string) => Promise<NewsArticle>;
  onShowOnMap?: (article: NewsArticle) => void;
  onRefreshFeed?: () => Promise<void>;
}

export const LiveNewsIntelligenceModal: React.FC<LiveNewsIntelligenceModalProps> = ({
  isOpen,
  onClose,
  articles = [],
  roads = [],
  onApplyNewsImpact,
  onApplyImpact,
  onAnalyzeCustomText,
  onAnalyzeCustom,
  onShowOnMap,
  onRefreshFeed
}) => {
  const { t, lang } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [applyingArticleId, setApplyingArticleId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Custom article analysis state
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [customText, setCustomText] = useState<string>('');
  const [customSource, setCustomSource] = useState<string>('Indian Highway Agency Dispatch');
  const [isAnalyzingCustom, setIsAnalyzingCustom] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleScan = async () => {
    setIsScanning(true);
    try {
      if (onRefreshFeed) {
        await onRefreshFeed();
      }
      setNotificationMsg('Live Indian disaster & highway news feed scanned and updated.');
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = async (article: NewsArticle) => {
    setApplyingArticleId(article.id);
    try {
      const applyFn = onApplyNewsImpact || onApplyImpact;
      if (applyFn) {
        await applyFn(article);
      }
      setNotificationMsg(
        `Route ${article.extractedHighway} updated to ${article.detectedStatus}. Emergency alert broadcast to operations dispatch.`
      );
      setTimeout(() => setNotificationMsg(null), 5000);
    } catch (err) {
      console.error('Apply impact error:', err);
    } finally {
      setApplyingArticleId(null);
    }
  };

  const handleAnalyzeCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsAnalyzingCustom(true);
    try {
      const analyzeFn = onAnalyzeCustomText || onAnalyzeCustom;
      if (analyzeFn) {
        const newArticle = await analyzeFn(customText, customSource);
        setCustomText('');
        setShowCustomInput(false);
        setNotificationMsg(
          `Article analyzed! Detected ${newArticle.extractedHighway} (${newArticle.detectedStatus}) at ${newArticle.extractedLocation}.`
        );
        setTimeout(() => setNotificationMsg(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingCustom(false);
    }
  };

  const loadSample = (sampleType: 'landslide' | 'flood' | 'clearance' | 'sinking') => {
    if (sampleType === 'landslide') {
      setCustomSource('Border Roads Organisation (BRO) Taskforce 88');
      setCustomText(
        'BRO Taskforce 88 reports intense rockfall and mud accumulation at Km 81.3 near Bhalukpong on Balipara-Charduar-Tawang Highway (NH-13). Both lanes are totally blocked. Civilian transport suspended; BRO earthmovers deployed.'
      );
    } else if (sampleType === 'flood') {
      setCustomSource('Assam State Disaster Management Authority (ASDMA)');
      setCustomText(
        'ASDMA Bulletin: Heavy monsoon rainfall caused Subansiri river overflow across NH-15 North Lakhimpur section. Water depth 1.4 feet. High risk warning issued for freight corridors.'
      );
    } else if (sampleType === 'clearance') {
      setCustomSource('Sikkim SDMA & Project Swastik');
      setCustomText(
        'Project Swastik engineers confirm that NH-10 Teesta valley landslide debris at Kali Jhora has been cleared. Normal traffic resumed for essential supplies into Gangtok.'
      );
    } else {
      setCustomSource('Nagaland Traffic Police Advisory');
      setCustomText(
        'Pagla Pahar sinking stretch on NH-29 near Chumukedima has developed deep surface cracks. Single-lane slow transit enforced; heavy transit delayed by 2 hours.'
      );
    }
  };

  const filteredArticles = articles.filter((art) => {
    if (selectedCategory !== 'ALL' && art.category !== selectedCategory) return false;
    if (selectedState !== 'ALL' && art.state !== selectedState) return false;
    return true;
  });

  const blockedCount = articles.filter((a) => a.detectedStatus === 'BLOCKED').length;
  const highRiskCount = articles.filter((a) => a.detectedStatus === 'HIGH_RISK').length;
  const clearedCount = articles.filter((a) => a.detectedStatus === 'ACCESSIBLE').length;

  return (
    <div
      id="live-news-intelligence-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-labelledby="modal-news-title"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white border-4 border-black shadow-[8px_8px_0px_#0a0a0a] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-black text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff3e00] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#ffffff]">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="modal-news-title" className="text-base sm:text-lg font-black uppercase tracking-tight text-white font-mono">
                  Live News & Disruption Intelligence Engine
                </h2>
                <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase tracking-widest border border-white">
                  Strictly India Data
                </span>
                <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest">
                  Live Route Sync
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-mono mt-0.5">
                Real-time ingestion and NLP analysis of Indian highway news, BRO alerts, ASDMA bulletins, and disaster press releases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              id="btn-scan-news"
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="px-3 py-1.5 bg-[#ff3e00] hover:bg-[#e03700] text-white text-xs font-black uppercase font-mono tracking-wider border-2 border-white shadow-[2px_2px_0px_#ffffff] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              {isScanning ? 'Scanning Indian News...' : 'Scan Live News'}
            </button>
            <button
              id="btn-close-news-modal"
              type="button"
              onClick={onClose}
              className="p-1.5 bg-white text-black hover:bg-neutral-200 border-2 border-white transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="px-4 py-2 bg-emerald-500 text-black font-mono text-xs font-black border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 fill-current" />
              <span>{notificationMsg}</span>
            </div>
            <button onClick={() => setNotificationMsg(null)} className="text-black font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Operational Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b-2 border-black bg-neutral-100 text-xs font-mono">
          <div className="p-2.5 sm:p-3 border-r border-b sm:border-b-0 border-black flex items-center gap-2">
            <div className="w-3 h-3 bg-black" />
            <div>
              <div className="text-[10px] text-neutral-600 font-bold uppercase">Articles Ingested</div>
              <div className="text-sm font-black text-black">{articles.length} Bulletins</div>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 border-r border-b sm:border-b-0 border-black flex items-center gap-2 bg-red-50">
            <div className="w-3 h-3 bg-red-600" />
            <div>
              <div className="text-[10px] text-red-700 font-bold uppercase">Active Indian Roadblocks</div>
              <div className="text-sm font-black text-red-700">{blockedCount} Blocked</div>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 border-r border-black flex items-center gap-2 bg-orange-50">
            <div className="w-3 h-3 bg-orange-500" />
            <div>
              <div className="text-[10px] text-orange-800 font-bold uppercase">High Risk Warnings</div>
              <div className="text-sm font-black text-orange-800">{highRiskCount} Corridors</div>
            </div>
          </div>
          <div className="p-2.5 sm:p-3 flex items-center gap-2 bg-emerald-50">
            <div className="w-3 h-3 bg-emerald-600" />
            <div>
              <div className="text-[10px] text-emerald-800 font-bold uppercase">Restored / Cleared</div>
              <div className="text-sm font-black text-emerald-800">{clearedCount} Normal Flow</div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-3 bg-white border-b-2 border-black flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-black text-black">
              <Filter className="w-3.5 h-3.5 text-[#ff3e00]" /> Filter:
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold uppercase border-2 border-black bg-white cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              <option value="LANDSLIDE">Landslides</option>
              <option value="FLOOD">Flash Floods</option>
              <option value="ROAD_DAMAGE">Road Damage</option>
              <option value="SNOW">Snow Hazard</option>
              <option value="CLEARANCE">Clearance / Restored</option>
            </select>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-2.5 py-1 text-xs font-mono font-bold uppercase border-2 border-black bg-white cursor-pointer"
            >
              <option value="ALL">All Indian States (NER)</option>
              <option value="Assam">Assam</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Manipur">Manipur</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Tripura">Tripura</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="px-3 py-1 bg-[#0a0a0a] hover:bg-neutral-800 text-white text-xs font-mono font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#ff3e00] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#ff3e00]" />
            {showCustomInput ? 'Hide Input Box' : 'Analyze Custom News / Bulletin'}
          </button>
        </div>

        {/* Custom Article Ingestion Box */}
        {showCustomInput && (
          <form
            onSubmit={handleAnalyzeCustom}
            className="p-4 bg-neutral-50 border-b-2 border-black space-y-3 font-mono animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ff3e00]" /> Ingest Live Article / PIB Press Release
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="text-neutral-500">Quick Samples:</span>
                <button
                  type="button"
                  onClick={() => loadSample('landslide')}
                  className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black cursor-pointer"
                >
                  Landslide
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('flood')}
                  className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black cursor-pointer"
                >
                  Flood
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('clearance')}
                  className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black cursor-pointer"
                >
                  Clearance
                </button>
                <button
                  type="button"
                  onClick={() => loadSample('sinking')}
                  className="px-1.5 py-0.5 border border-black bg-white hover:bg-neutral-100 text-black cursor-pointer"
                >
                  Subsidence
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <label className="text-[10px] font-black uppercase text-neutral-600 block mb-0.5">
                  Source Name / Agency
                </label>
                <input
                  type="text"
                  value={customSource}
                  onChange={(e) => setCustomSource(e.target.value)}
                  placeholder="e.g. BRO Taskforce / The Assam Tribune"
                  className="w-full px-2.5 py-1.5 text-xs border-2 border-black bg-white font-mono"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black uppercase text-neutral-600 block mb-0.5">
                  News Bulletin / Dispatch Text
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste Indian highway bulletin or disaster report here..."
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs border-2 border-black bg-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                className="px-3 py-1.5 border-2 border-black bg-white text-black text-xs font-black uppercase font-mono hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAnalyzingCustom || !customText.trim()}
                className="px-4 py-1.5 bg-[#0a0a0a] hover:bg-[#ff3e00] text-white text-xs font-black uppercase font-mono tracking-wider border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isAnalyzingCustom ? 'Analyzing with NLP Engine...' : 'Run Live Analysis & Sync'}
              </button>
            </div>
          </form>
        )}

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-neutral-100">
          {filteredArticles.length === 0 ? (
            <div className="p-8 text-center bg-white border-2 border-black font-mono">
              <p className="text-sm font-bold text-neutral-700">No news articles found for current filter criteria.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSelectedState('ALL');
                }}
                className="mt-3 px-3 py-1 bg-black text-white text-xs font-black uppercase"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isBlocked = article.detectedStatus === 'BLOCKED';
              const isHighRisk = article.detectedStatus === 'HIGH_RISK';
              const isCleared = article.detectedStatus === 'ACCESSIBLE';

              // Find matching road from roads prop
              const matchedRoad = (roads || []).find(
                (r) =>
                  r.code === article.extractedHighway ||
                  r.code.replace('-', '') === article.extractedHighway.replace('-', '')
              );

              return (
                <div
                  key={article.id}
                  id={`article-${article.id}`}
                  className={`p-4 border-2 border-black shadow-[4px_4px_0px_#0a0a0a] font-mono transition-all ${
                    isBlocked
                      ? 'bg-red-50 border-red-600'
                      : isHighRisk
                      ? 'bg-orange-50'
                      : isCleared
                      ? 'bg-emerald-50'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-neutral-300 pb-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-wider">
                          🇮🇳 {article.source}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {article.publishedAt}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-neutral-200 text-neutral-800 font-bold uppercase">
                          {article.state}, India
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-[#0a0a0a] leading-snug">
                        {article.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1.5 self-start shrink-0">
                      <span
                        className={`px-2.5 py-1 text-xs font-black uppercase border-2 border-black tracking-wide ${
                          isBlocked
                            ? 'bg-red-600 text-white'
                            : isHighRisk
                            ? 'bg-[#ff3e00] text-white'
                            : isCleared
                            ? 'bg-emerald-600 text-white'
                            : 'bg-yellow-400 text-black'
                        }`}
                      >
                        {isBlocked
                          ? (lang === 'hi' ? '🚨 सड़क अवरुद्ध' : lang === 'as' ? '🚨 পথ বন্ধ' : '🚨 ROAD BLOCKED')
                          : isHighRisk
                          ? (lang === 'hi' ? '⚠️ उच्च जोखिम' : lang === 'as' ? '⚠️ উচ্চ বিপদ' : '⚠️ HIGH RISK')
                          : isCleared
                          ? (lang === 'hi' ? '✅ मार्ग बहाल' : lang === 'as' ? '✅ পথ মুকলি' : '✅ CLEARED & RESTORED')
                          : (lang === 'hi' ? '🟡 मध्यम यातायात' : lang === 'as' ? '🟡 মধ্যম যাতায়াত' : '🟡 MODERATE TRANSIT')}
                      </span>
                    </div>
                  </div>

                  {/* Impact Summary & Entity Extraction */}
                  <div className="my-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="md:col-span-2 space-y-1.5">
                      <p className="text-neutral-700 leading-relaxed text-xs">
                        {article.content}
                      </p>
                      <div className="p-2 bg-white border border-black text-[11px] text-neutral-800">
                        <strong className="text-[#ff3e00] font-black uppercase block mb-0.5">
                          {lang === 'hi' ? 'पहचाना गया प्रभाव:' : lang === 'as' ? 'প্ৰত্যক্ষ প্ৰভাৱ:' : 'Extracted Operational Impact:'}
                        </strong>
                        {article.impactSummary}
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border border-black space-y-1.5 text-[11px]">
                      <div>
                        <span className="text-neutral-500 font-bold uppercase text-[10px] block">
                          {lang === 'hi' ? 'लक्षित गलियारा' : lang === 'as' ? 'লক্ষ্য পথ' : 'Target Corridor'}
                        </span>
                        <strong className="text-sm font-black text-black">
                          {getLocalizedHighwayName(article.extractedHighway, lang)}
                        </strong>
                        <span className="text-neutral-600 text-[10px] block truncate">
                          {getLocalizedLocation(article.extractedLocation, lang)}
                        </span>
                      </div>

                      <div className="border-t border-neutral-200 pt-1">
                        <span className="text-neutral-500 font-bold uppercase text-[10px] block">NLP Confidence</span>
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-neutral-200 border border-black">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${article.confidenceScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-black text-[10px]">{article.confidenceScore}%</span>
                        </div>
                      </div>

                      {matchedRoad && (
                        <div className="border-t border-neutral-200 pt-1">
                          <span className="text-neutral-500 font-bold uppercase text-[10px] block">
                            {lang === 'hi' ? 'वर्तमान सड़क स्थिति' : lang === 'as' ? 'বৰ্তমান পথৰ অৱস্থা' : 'Current Road State'}
                          </span>
                          <span
                            className={`font-black text-[10px] px-1.5 py-0.5 border border-black inline-block ${
                              matchedRoad.status === 'BLOCKED'
                                ? 'bg-black text-white'
                                : matchedRoad.status === 'HIGH_RISK'
                                ? 'bg-[#ff3e00] text-white'
                                : 'bg-emerald-500 text-black'
                            }`}
                          >
                            {getLocalizedRoadStatus(matchedRoad.status, lang)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-300 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onShowOnMap?.(article)}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-black font-black uppercase border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#ff3e00]" />
                        {lang === 'hi' ? 'मानचित्र पर देखें' : lang === 'as' ? 'মানচিত্ৰত চাওক' : 'Show on World Map'}
                      </button>

                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-bold uppercase text-[11px] flex items-center gap-1"
                        >
                          {lang === 'hi' ? 'आधिकारिक स्रोत' : lang === 'as' ? 'চৰকাৰী উৎস' : 'Official Source'} <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApply(article)}
                      disabled={applyingArticleId === article.id}
                      className={`px-4 py-1.5 font-mono font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center gap-1.5 cursor-pointer ${
                        article.appliedToRoute
                          ? 'bg-neutral-900 text-white hover:bg-black'
                          : 'bg-[#ff3e00] hover:bg-[#e03700] text-white'
                      }`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${applyingArticleId === article.id ? 'animate-spin' : ''}`} />
                      {applyingArticleId === article.id
                        ? (lang === 'hi' ? 'मार्ग एवं आपातकाल अद्यतन...' : lang === 'as' ? 'পথ আৰু জৰুৰী তথ্য আপডেট...' : 'Updating Route & Emergencies...')
                        : article.appliedToRoute
                        ? (lang === 'hi' ? 'पुनः समन्वयित करें' : lang === 'as' ? 'পুনৰ সংলগ্ন কৰক' : 'Re-Sync to Route & Emergency')
                        : (lang === 'hi' ? 'मार्ग से जोड़ें व आपातकाल प्रसारित करें' : lang === 'as' ? 'পথ সংলগ্ন আৰু জৰুৰী সতৰ্কতা প্ৰচাৰ' : 'Sync to Route & Broadcast Emergency')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-200 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-xs font-mono gap-2">
          <div className="flex items-center gap-2 text-[11px] text-neutral-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Strict Indian Corridor Scope: All roadblocks and incidents validated within Indian territory.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-black text-white text-xs font-black uppercase font-mono"
          >
            Close Intelligence Radar
          </button>
        </div>
      </div>
    </div>
  );
};
