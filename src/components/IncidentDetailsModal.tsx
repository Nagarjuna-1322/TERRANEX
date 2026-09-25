import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Incident, IncidentMediaItem } from '../types.ts';
import { api } from '../services/api.ts';
import { fetchIncidentMediaFromRepository } from '../services/mediaRepository.ts';
import {
  AlertTriangle,
  XCircle,
  ShieldAlert,
  Navigation,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Camera,
  Video,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Compass,
  CheckCircle2
} from 'lucide-react';
import {
  useTranslation,
  getLocalizedIncidentType,
  getLocalizedSeverity,
  getLocalizedHighwayName,
  getLocalizedRole
} from '../translations';

interface IncidentDetailsModalProps {
  incident: Incident;
  onClose: () => void;
  onMarkRoadBlocked: (incident: Incident) => void;
  onCreateAlert: (incident: Incident) => void;
  onFindAlternateRoute: (incident: Incident) => void;
  onAssignTeam: (incident: Incident) => void;
}

export const IncidentDetailsModal: React.FC<IncidentDetailsModalProps> = ({
  incident,
  onClose,
  onMarkRoadBlocked,
  onCreateAlert,
  onFindAlternateRoute,
  onAssignTeam
}) => {
  const { t, lang } = useTranslation();

  // Media repository states
  const [mediaList, setMediaList] = useState<IncidentMediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(true);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState<boolean>(false);
  const [isFullscreenLightbox, setIsFullscreenLightbox] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Simulated Video Player states
  const [isPlayingVideo, setIsPlayingVideo] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0); // 0 to 100
  const [videoCurrentSec, setVideoCurrentSec] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  // Fetch incident media from repository
  useEffect(() => {
    let isMounted = true;
    setLoadingMedia(true);

    api
      .getIncidentMedia(incident)
      .then((res) => {
        if (isMounted) {
          if (res && res.media && res.media.length > 0) {
            setMediaList(res.media);
          } else {
            // Fallback to client generator
            fetchIncidentMediaFromRepository(incident).then((fallbackMedia) => {
              if (isMounted) setMediaList(fallbackMedia);
            });
          }
          setLoadingMedia(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          fetchIncidentMediaFromRepository(incident).then((fallbackMedia) => {
            if (isMounted) {
              setMediaList(fallbackMedia);
              setLoadingMedia(false);
            }
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [incident]);

  // Filtered media items
  const filteredMedia = mediaList.filter((item) => {
    if (mediaFilter === 'all') return true;
    return item.type === mediaFilter;
  });

  // Clamp active index when filter changes
  useEffect(() => {
    if (activeIndex >= filteredMedia.length) {
      setActiveIndex(0);
    }
    // Stop video when switching filter
    setIsPlayingVideo(false);
    setVideoProgress(0);
    setVideoCurrentSec(0);
  }, [mediaFilter, filteredMedia.length]);

  const currentItem = filteredMedia[activeIndex] || filteredMedia[0] || null;

  // Video duration parsing (e.g. "0:48" -> 48 seconds)
  const totalDurationSec = React.useMemo(() => {
    if (!currentItem?.duration) return 45;
    const parts = currentItem.duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 45;
  }, [currentItem]);

  // Video playback loop timer
  useEffect(() => {
    if (!isPlayingVideo || currentItem?.type !== 'video') return;

    const interval = setInterval(() => {
      setVideoCurrentSec((prev) => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= totalDurationSec) {
          // Loop video playback
          setVideoProgress(0);
          return 0;
        }
        setVideoProgress((next / totalDurationSec) * 100);
        return next;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [isPlayingVideo, currentItem, totalDurationSec, playbackSpeed]);

  // Navigation Handlers
  const handlePrev = useCallback(() => {
    if (filteredMedia.length <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? filteredMedia.length - 1 : prev - 1));
    setIsPlayingVideo(false);
    setVideoProgress(0);
    setVideoCurrentSec(0);
  }, [filteredMedia.length]);

  const handleNext = useCallback(() => {
    if (filteredMedia.length <= 1) return;
    setActiveIndex((prev) => (prev === filteredMedia.length - 1 ? 0 : prev + 1));
    setIsPlayingVideo(false);
    setVideoProgress(0);
    setVideoCurrentSec(0);
  }, [filteredMedia.length]);

  // Keyboard navigation for carousel & lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Escape') {
        if (isFullscreenLightbox) {
          setIsFullscreenLightbox(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, isFullscreenLightbox, onClose]);

  // Handle image error fallback
  const handleImageError = (id: string) => {
    setImageErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Download snapshot mock
  const handleDownloadSnapshot = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto font-mono">
      <div className="relative w-full max-w-2xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden my-auto text-[#0a0a0a]">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#f4f4f4] border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-lg sm:text-xl font-black font-mono text-[#ff3e00] border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0px_#0a0a0a]">
              {incident.incidentCode}
            </span>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight uppercase tracking-tight">
                {getLocalizedIncidentType(incident.type, lang)} ({getLocalizedSeverity(incident.severity, lang)} {t.incidentModal?.severity || 'Severity'})
              </h3>
              <div className="text-[11px] text-neutral-600 font-mono font-bold uppercase">
                {t.alertsScreen?.corridorLabel || 'Corridor'}: <strong className="text-black">{incident.roadCode} ({getLocalizedHighwayName(incident.roadCode, lang)})</strong> · {incident.reportedAt}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer transition font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
          
          {/* Tactical Media Repository Section */}
          <div className="border-2 border-black bg-[#fbfbfb] shadow-[3px_3px_0px_#0a0a0a] overflow-hidden">
            
            {/* Repository Bar & Filters */}
            <div className="px-3 py-2 bg-[#0a0a0a] text-white flex flex-wrap items-center justify-between gap-2 border-b-2 border-black">
              <div className="flex items-center gap-2 text-[11px] font-bold">
                <Layers className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span className="uppercase tracking-wider">Tactical Media Archive</span>
                <span className="text-neutral-400 font-normal">·</span>
                <span className="text-neutral-300 font-normal">
                  {mediaList.length} records available
                </span>
              </div>

              {/* Media Type Filter Tabs */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMediaFilter('all')}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase transition border ${
                    mediaFilter === 'all'
                      ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  All ({mediaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaFilter('image')}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase transition border flex items-center gap-1 ${
                    mediaFilter === 'image'
                      ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  <Camera className="w-2.5 h-2.5" /> Photos ({mediaList.filter((m) => m.type === 'image').length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaFilter('video')}
                  className={`px-2 py-0.5 text-[10px] font-bold uppercase transition border flex items-center gap-1 ${
                    mediaFilter === 'video'
                      ? 'bg-[#ff3e00] text-white border-[#ff3e00]'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
                  }`}
                >
                  <Video className="w-2.5 h-2.5" /> Video ({mediaList.filter((m) => m.type === 'video').length})
                </button>
              </div>
            </div>

            {/* Main Carousel Media Viewport */}
            {loadingMedia ? (
              <div className="h-60 sm:h-72 flex flex-col items-center justify-center bg-neutral-900 text-white p-6 space-y-3">
                <div className="w-8 h-8 border-2 border-[#ff3e00] border-t-transparent animate-spin rounded-none" />
                <div className="text-[11px] font-bold tracking-wide uppercase text-neutral-300 text-center">
                  Querying NER Tactical Media Repository...
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  Synchronizing drone feeds & satellite orthomosaics for {incident.incidentCode}
                </div>
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                <Camera className="w-8 h-8 mb-2 opacity-50 text-neutral-400" />
                <p className="font-bold">No media matching filter.</p>
                <button
                  onClick={() => setMediaFilter('all')}
                  className="mt-2 text-[#ff3e00] underline font-bold"
                >
                  Reset filter to view all
                </button>
              </div>
            ) : (
              <div className="relative group bg-neutral-950">
                {/* Visual Canvas Area */}
                <div className="relative h-60 sm:h-72 overflow-hidden flex items-center justify-center select-none bg-neutral-900">
                  {currentItem && !imageErrorMap[currentItem.id] ? (
                    <img
                      src={currentItem.url}
                      alt={currentItem.title}
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError(currentItem.id)}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    /* High-Fidelity Tactical SVG Mesh Fallback */
                    <div className="w-full h-full relative flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 text-neutral-300 p-6">
                      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ff3e00_1px,transparent_1px)] [background-size:16px_16px]" />
                      <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                        {currentItem?.type === 'video' ? (
                          <Video className="w-12 h-12 text-[#ff3e00]" />
                        ) : (
                          <Camera className="w-12 h-12 text-[#ff3e00]" />
                        )}
                        <span className="font-bold uppercase tracking-wider text-white text-xs">
                          {currentItem?.title || 'Tactical Recon Capture'}
                        </span>
                        <span className="text-[10px] text-neutral-400 max-w-sm">
                          {currentItem?.description || 'Field photographic record archived by NER surveillance unit.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Top Overlay HUD Bar */}
                  <div className="absolute top-0 inset-x-0 p-2.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-[11px] font-mono z-10">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#ff3e00] text-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                        {currentItem?.type === 'video' ? 'VIDEO FOOTAGE' : '4K HIGH-RES'}
                      </span>
                      <span className="text-neutral-300 text-[10px] font-bold hidden sm:inline">
                        {currentItem?.resolution}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-white text-[11px] font-black tabular-nums">
                        {String(activeIndex + 1).padStart(2, '0')} / {String(filteredMedia.length).padStart(2, '0')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsFullscreenLightbox(true)}
                        aria-label="Inspect in full resolution"
                        className="p-1 bg-black/60 hover:bg-black text-white border border-white/30 cursor-pointer transition flex items-center gap-1 text-[10px] font-bold"
                        title="Open Fullscreen Lightbox"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Expand</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Video Player Overlay (When media is video) */}
                  {currentItem?.type === 'video' && (
                    <div className="absolute inset-0 z-20 flex flex-col justify-between">
                      {/* Central Play/Pause Trigger if not playing */}
                      {!isPlayingVideo ? (
                        <div className="m-auto flex flex-col items-center">
                          <button
                            type="button"
                            onClick={() => setIsPlayingVideo(true)}
                            aria-label="Play video footage"
                            className="w-14 h-14 rounded-full bg-[#ff3e00] hover:bg-white text-white hover:text-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_#0a0a0a] transition transform hover:scale-105 cursor-pointer"
                          >
                            <Play className="w-6 h-6 ml-1 fill-current" />
                          </button>
                          <span className="mt-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                            Play Footage · {currentItem.duration || '0:48'}
                          </span>
                        </div>
                      ) : (
                        /* Simulated Live Video Telemetry HUD */
                        <div className="w-full h-full flex flex-col justify-between p-3 bg-black/25 pointer-events-none">
                          <div className="flex items-center justify-between text-white text-[10px] font-mono">
                            <span className="flex items-center gap-1.5 text-red-500 font-black animate-pulse">
                              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> REC [LIVE FEED]
                            </span>
                            <span className="text-white bg-black/60 px-1.5 py-0.5 border border-white/20">
                              ALT {currentItem.cameraMetadata?.altitudeMeters || 148}M · HDG {currentItem.cameraMetadata?.azimuthDeg || 214}°
                            </span>
                          </div>

                          {/* Optical Reticle / Crosshair */}
                          <div className="self-center flex flex-col items-center opacity-40 text-white">
                            <div className="w-10 h-0.5 bg-white mb-2" />
                            <div className="w-0.5 h-10 bg-white -mt-7" />
                          </div>

                          <div className="text-white text-[10px] font-mono flex items-center justify-between bg-black/60 px-2 py-1 border border-white/20">
                            <span>GPS: {incident.lat.toFixed(4)}° N, {incident.lng.toFixed(4)}° E</span>
                            <span>{formatTime(videoCurrentSec)} / {formatTime(totalDurationSec)}</span>
                          </div>
                        </div>
                      )}

                      {/* Video Player Scrubber & Controls Bar */}
                      <div className="p-2 bg-neutral-950/95 border-t border-neutral-800 text-white flex items-center gap-2 z-30">
                        <button
                          type="button"
                          onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                          aria-label={isPlayingVideo ? 'Pause' : 'Play'}
                          className="w-7 h-7 flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer"
                        >
                          {isPlayingVideo ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>

                        {/* Progress Scrubber */}
                        <div
                          className="flex-1 h-2 bg-neutral-800 border border-neutral-700 cursor-pointer relative"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = (e.clientX - rect.left) / rect.width;
                            const clamped = Math.max(0, Math.min(1, pos));
                            setVideoCurrentSec(clamped * totalDurationSec);
                            setVideoProgress(clamped * 100);
                          }}
                        >
                          <div
                            className="h-full bg-[#ff3e00]"
                            style={{ width: `${videoProgress}%` }}
                          />
                        </div>

                        <span className="text-[10px] font-mono text-neutral-300 tabular-nums">
                          {formatTime(videoCurrentSec)} / {formatTime(totalDurationSec)}
                        </span>

                        {/* Speed Toggle */}
                        <button
                          type="button"
                          onClick={() => setPlaybackSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 0.5 : 1))}
                          className="px-1.5 py-0.5 text-[9px] font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 cursor-pointer"
                          title="Playback speed"
                        >
                          {playbackSpeed}x
                        </button>

                        {/* Mute Toggle */}
                        <button
                          type="button"
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-1 text-neutral-400 hover:text-white cursor-pointer"
                          title={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Prev / Next Carousel Arrow Controls */}
                  {filteredMedia.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous media"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/80 hover:bg-[#ff3e00] text-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer transition z-30"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next media"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/80 hover:bg-[#ff3e00] text-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] cursor-pointer transition z-30"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Media Metadata & Caption Strip */}
                {currentItem && (
                  <div className="p-3 bg-white border-t-2 border-black space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="font-black text-xs uppercase text-black tracking-tight">
                        {currentItem.title}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#f4f4f4] hover:bg-neutral-200 text-black border border-black flex items-center gap-1 cursor-pointer transition"
                        >
                          <Info className="w-3 h-3 text-[#ff3e00]" />
                          {showTelemetryDrawer ? 'Hide Sensor Data' : 'Sensor Telemetry'}
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-600 font-medium">
                      Source: <strong className="text-black">{currentItem.source}</strong> · <span>{currentItem.timestamp}</span> · <span>{currentItem.fileSizeBytes}</span>
                    </div>

                    <p className="text-[11px] text-neutral-800 leading-relaxed font-bold">
                      {currentItem.description}
                    </p>

                    {/* Sensor Telemetry Drawer */}
                    {showTelemetryDrawer && currentItem.cameraMetadata && (
                      <div className="mt-2 p-2.5 bg-[#f4f4f4] border-2 border-black space-y-1 text-[10px] font-mono">
                        <div className="font-black uppercase text-black border-b border-neutral-300 pb-1 flex items-center justify-between">
                          <span>Camera / Sensor Technical Specifications</span>
                          <span className="text-[#ff3e00]">CALIBRATED RTK</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-neutral-700">
                          <div>
                            Sensor Device: <strong className="text-black">{currentItem.cameraMetadata.device || 'NER Recon Unit'}</strong>
                          </div>
                          <div>
                            Optics: <strong className="text-black">{currentItem.cameraMetadata.focalLength || 'Standard Wide'}</strong>
                          </div>
                          <div>
                            Altitude AGL: <strong className="text-black">{currentItem.cameraMetadata.altitudeMeters || 140} meters</strong>
                          </div>
                          <div>
                            Gimbal Azimuth: <strong className="text-black">{currentItem.cameraMetadata.azimuthDeg || 180}°</strong>
                          </div>
                          <div>
                            GPS Fix: <strong className="text-black">{incident.lat.toFixed(4)}° N, {incident.lng.toFixed(4)}° E</strong>
                          </div>
                          <div>
                            Storage Format: <strong className="text-black">RAW / DNG + ProRes 422</strong>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Horizontal Thumbnail Strip Carousel */}
                {filteredMedia.length > 1 && (
                  <div className="px-3 py-2.5 bg-[#f4f4f4] border-t-2 border-black flex items-center gap-2 overflow-x-auto">
                    {filteredMedia.map((item, idx) => {
                      const isSelected = idx === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveIndex(idx);
                            setIsPlayingVideo(false);
                            setVideoProgress(0);
                            setVideoCurrentSec(0);
                          }}
                          className={`relative flex-shrink-0 w-16 h-12 border-2 transition overflow-hidden cursor-pointer ${
                            isSelected
                              ? 'border-[#ff3e00] shadow-[2px_2px_0px_#0a0a0a] scale-105'
                              : 'border-black opacity-75 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            onError={() => handleImageError(item.id)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            {item.type === 'video' ? (
                              <div className="w-5 h-5 rounded-full bg-black/80 flex items-center justify-center text-white">
                                <Play className="w-2.5 h-2.5 ml-0.5 fill-current" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 bg-black/80 flex items-center justify-center text-white">
                                <Camera className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-[#ff3e00]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Description & Officer Observation */}
          <div className="p-3.5 bg-[#f4f4f4] border-2 border-black space-y-1 shadow-[2px_2px_0px_#0a0a0a]">
            <span className="text-neutral-600 text-[10px] uppercase font-mono font-bold block">
              {t.incidentModal?.fieldOfficerObservations || 'Field Officer Observations:'}:
            </span>
            <p className="text-neutral-900 text-xs font-bold leading-relaxed">{incident.description}</p>
            <div className="text-neutral-600 text-[11px] pt-1 font-bold">
              {t.incidentModal?.reportedBy || 'Reported by'}: <strong className="text-black">{incident.reportedBy}</strong> ({getLocalizedRole(incident.reportedRole, lang)})
            </div>
          </div>

          {/* AI Multimodal Classification Box */}
          {incident.aiClassification && (
            <div className="p-3.5 bg-white border-2 border-black space-y-2 shadow-[3px_3px_0px_#0a0a0a]">
              <div className="flex items-center justify-between border-b-2 border-black pb-1.5">
                <span className="font-black text-black font-mono text-xs uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#ff3e00]" /> {t.incidentModal?.aiDisruptionAssessment || 'AI Disruption Impact Assessment'}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 bg-[#f4f4f4] text-black border border-black font-black uppercase">
                  {incident.aiClassification.confidence}% {t.fieldOfficer?.confidence || 'Confidence'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-800 space-y-1 font-bold">
                <div>
                  Impact: <strong className="text-black font-black">{incident.aiClassification.roadImpact}</strong>
                </div>
                <p className="leading-relaxed text-neutral-700">{incident.aiClassification.recommendedAction}</p>
              </div>
            </div>
          )}

          {/* Logistics Impact Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.incidentModal?.vehiclesAffected || 'Vehicles Affected'}</span>
              <span className="text-base font-black text-black">{incident.vehiclesAffected}</span>
            </div>
            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.incidentModal?.deliveriesImpacted || 'Deliveries Impacted'}</span>
              <span className="text-base font-black text-[#ff3e00]">{incident.deliveriesAffected}</span>
            </div>
            <div className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a]">
              <span className="text-neutral-600 text-[10px] uppercase font-bold block">{t.incidentModal?.disruptionRisk || 'Disruption Risk'}</span>
              <span className="text-base font-black text-black">{incident.aiRiskScore}/100</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#f4f4f4] border-t-2 border-black grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            id="btn-incident-mark-blocked"
            onClick={() => onMarkRoadBlocked(incident)}
            className="p-2 bg-red-600 hover:bg-black text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" /> {t.fieldOfficer?.markBlocked || 'Mark Blocked'}
          </button>

          <button
            id="btn-incident-create-alert"
            onClick={() => onCreateAlert(incident)}
            className="p-2 bg-white hover:bg-neutral-100 text-black text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff3e00]" /> {t.incidentModal?.broadcastAlert || 'Broadcast Alert'}
          </button>

          <button
            id="btn-incident-find-alternate"
            onClick={() => onFindAlternateRoute(incident)}
            className="p-2 bg-[#ff3e00] hover:bg-black text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" /> {t.incidentModal?.alternate || 'Alternate'}
          </button>

          <button
            id="btn-incident-assign-team"
            onClick={() => onAssignTeam(incident)}
            className="p-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-white" /> {t.incidentModal?.assignTeam || 'Assign Team'}
          </button>
        </div>
      </div>

      {/* Fullscreen High-Resolution Lightbox Modal */}
      {isFullscreenLightbox && currentItem && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col justify-between text-white font-mono p-3 sm:p-6 animate-fadeIn">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#ff3e00] text-white text-[10px] font-black uppercase">
                  {currentItem.resolution}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-white uppercase truncate max-w-md">
                  {currentItem.title}
                </h4>
              </div>
              <div className="text-[11px] text-neutral-400">
                {incident.incidentCode} · {incident.roadCode} · {currentItem.source}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom In / Out Controls */}
              <div className="flex items-center bg-neutral-900 border border-neutral-700 p-0.5">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((prev) => Math.max(1, prev - 0.25))}
                  className="p-1.5 hover:bg-neutral-800 text-white cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] px-2 font-mono tabular-nums">
                  {Math.round(lightboxZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((prev) => Math.min(3, prev + 0.25))}
                  className="p-1.5 hover:bg-neutral-800 text-white cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                {lightboxZoom !== 1 && (
                  <button
                    type="button"
                    onClick={() => setLightboxZoom(1)}
                    className="p-1.5 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer border-l border-neutral-800"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Download Recon Snapshot */}
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-bold uppercase flex items-center gap-1 cursor-pointer transition"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Archived</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </>
                )}
              </button>

              {/* Close Lightbox */}
              <button
                type="button"
                onClick={() => {
                  setIsFullscreenLightbox(false);
                  setLightboxZoom(1);
                }}
                className="w-8 h-8 flex items-center justify-center bg-white text-black font-bold border-2 border-black hover:bg-neutral-200 cursor-pointer transition"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lightbox Image Stage with Zoom */}
          <div className="flex-1 relative overflow-auto flex items-center justify-center my-3 select-none">
            <div
              className="transition-transform duration-200 ease-out max-h-full max-w-full flex items-center justify-center"
              style={{ transform: `scale(${lightboxZoom})` }}
            >
              <img
                src={currentItem.url}
                alt={currentItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] max-w-[90vw] object-contain shadow-2xl border border-neutral-800"
              />
            </div>

            {/* Lightbox Next/Prev floating controls */}
            {filteredMedia.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/80 hover:bg-[#ff3e00] text-white border-2 border-white/50 cursor-pointer transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-black/80 hover:bg-[#ff3e00] text-white border-2 border-white/50 cursor-pointer transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Bar with Telemetry */}
          <div className="bg-neutral-900 border border-neutral-800 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white uppercase text-[11px]">
                {currentItem.description}
              </div>
              <div className="text-[10px] text-neutral-400">
                Captured by {currentItem.source} · File size: {currentItem.fileSizeBytes} · Lat {incident.lat.toFixed(4)}, Lng {incident.lng.toFixed(4)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentItem.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-neutral-800 text-neutral-300 text-[10px] border border-neutral-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
