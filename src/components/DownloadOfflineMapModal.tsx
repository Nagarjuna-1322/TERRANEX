import React, { useState, useEffect } from 'react';
import {
  Download,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Compass,
  WifiOff,
  Wifi,
  Layers,
  MapPin,
  RefreshCw,
  X,
  Radio,
  Shield,
  Zap,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import {
  NER_STATE_AREAS,
  NerStateArea,
  OfflineMapPackage,
  DownloadProgress,
  offlineMapManager,
  getTileCoordinatesForBounds
} from '../services/offlineMapService';
import { OfflineSyncService } from '../services/offlineSync';
import { Language, TRANSLATIONS } from '../translations';

interface DownloadOfflineMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  currentMapViewBounds?: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null;
  onPanToState?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }, zoom?: number) => void;
  activeLayerMode?: 'Road Map' | 'Satellite' | 'Accessibility Heatmap';
}

export const DownloadOfflineMapModal: React.FC<DownloadOfflineMapModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  currentMapViewBounds,
  onPanToState,
  activeLayerMode = 'Road Map'
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'packages' | 'guide'>('download');
  const [selectedStateId, setSelectedStateId] = useState<string>('ner-arunachal');
  const [selectedDetailLevel, setSelectedDetailLevel] = useState<'standard' | 'corridor' | 'high'>('corridor');
  const [selectedLayer, setSelectedLayer] = useState<'Road Map' | 'Satellite' | 'Accessibility Heatmap'>(activeLayerMode);
  const [packages, setPackages] = useState<OfflineMapPackage[]>([]);
  const [storageInfo, setStorageInfo] = useState<{ formattedSize: string; totalTiles: number; totalBytes: number }>({
    formattedSize: '0 KB',
    totalTiles: 0,
    totalBytes: 0
  });

  // Download state
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Offline simulation state
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(OfflineSyncService.isSimulatedOffline());

  useEffect(() => {
    const unsub = offlineMapManager.subscribe((pkgs) => {
      setPackages(pkgs);
      offlineMapManager.getStorageUsage().then(setStorageInfo);
    });

    const unsubSync = OfflineSyncService.subscribe((_, isOnline) => {
      setIsOfflineSimulated(OfflineSyncService.isSimulatedOffline());
    });

    return () => {
      unsub();
      unsubSync();
    };
  }, []);

  if (!isOpen) return null;

  const currentLang = lang || 'en';

  // Calculate zoom range based on detail level
  const getZoomRange = (level: 'standard' | 'corridor' | 'high') => {
    switch (level) {
      case 'standard':
        return { minZoom: 6, maxZoom: 8 };
      case 'corridor':
        return { minZoom: 6, maxZoom: 10 };
      case 'high':
        return { minZoom: 6, maxZoom: 12 };
    }
  };

  const selectedState = NER_STATE_AREAS.find((s) => s.id === selectedStateId) || NER_STATE_AREAS[1];

  // Dynamic estimate of tiles & size
  const { minZoom, maxZoom } = getZoomRange(selectedDetailLevel);
  const estimatedTiles = getTileCoordinatesForBounds(selectedState.bounds, minZoom, maxZoom).length;
  const estimatedMB = ((estimatedTiles * 22) / 1024).toFixed(1);

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadSuccess(null);
    setProgress(null);

    try {
      const pkg = await offlineMapManager.downloadAreaTiles(
        selectedState,
        selectedLayer,
        minZoom,
        maxZoom,
        (p) => {
          setProgress(p);
        }
      );

      setDownloadSuccess(
        currentLang === 'hi'
          ? `${pkg.stateName} के ${pkg.downloadedTiles} मैप टाइल्स सफलतापूर्वक डाउनलोड हो गए!`
          : `Successfully cached ${pkg.downloadedTiles} offline map tiles for ${pkg.stateName}!`
      );
      setIsDownloading(false);
      offlineMapManager.getStorageUsage().then(setStorageInfo);
    } catch (err: any) {
      if (err.message?.includes('aborted')) {
        setDownloadError('Download cancelled.');
      } else {
        setDownloadError(err.message || 'Failed to download offline tiles.');
      }
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    offlineMapManager.cancelActiveDownload();
    setIsDownloading(false);
  };

  const handleDeletePackage = async (packageId: string) => {
    await offlineMapManager.deletePackage(packageId);
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all downloaded offline map tiles? Navigation in zero-network mountain zones will require internet connectivity.')) {
      await offlineMapManager.clearAllCachedTiles();
    }
  };

  const toggleOfflineSimulation = () => {
    const newState = OfflineSyncService.toggleSimulatedOffline();
    setIsOfflineSimulated(newState);
  };

  const handlePanToPackage = (pkg: OfflineMapPackage) => {
    if (onPanToState) {
      onPanToState(pkg.bounds, pkg.minZoom + 1);
      onClose();
    }
  };

  return (
    <div
      id="modal-download-offline-map"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-mono"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border-2 border-black shadow-[8px_8px_0px_#0a0a0a] text-[#0a0a0a] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0a0a0a] text-white p-4 flex items-center justify-between border-b-2 border-black shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#ff3e00] text-black border border-black shadow-[2px_2px_0px_#fff]">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-wide uppercase">
                  {currentLang === 'hi' ? 'ऑफलाइन मैप क्षेत्र डाउनलोड करें' : 'Download Offline Map Area'}
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500 text-black text-[10px] font-black uppercase">
                  NER Grid
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                {currentLang === 'hi'
                  ? 'पूर्वोत्तर भारत के राज्यों के मैप टाइल्स और राष्ट्रीय राजमार्गों को डिवाइस में सुरक्षित करें'
                  : 'Cache North Eastern region map tiles & highway vectors for zero-connectivity mountain navigation'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Offline Simulation Switch */}
            <button
              id="btn-modal-toggle-offline-simulation"
              type="button"
              onClick={toggleOfflineSimulation}
              className={`px-2.5 py-1 text-[11px] font-black uppercase flex items-center gap-1.5 border-2 border-black shadow-[2px_2px_0px_#fff] cursor-pointer transition ${
                isOfflineSimulated
                  ? 'bg-amber-400 text-black'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
              title="Test application in simulated offline mode"
            >
              {isOfflineSimulated ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-black" />
                  <span>Simulated Offline: ON</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Online Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-neutral-800 hover:bg-[#ff3e00] text-white hover:text-white border border-neutral-600 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Storage & Status Strip */}
        <div className="bg-[#fff8f0] px-4 py-2 border-b-2 border-black flex flex-wrap items-center justify-between text-xs font-bold gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-neutral-800">
              <HardDrive className="w-4 h-4 text-[#ff3e00]" />
              <span>Offline Cache:</span>
              <span className="font-black text-black px-1.5 py-0.5 bg-neutral-200 border border-black">
                {storageInfo.formattedSize}
              </span>
            </div>
            <div className="text-neutral-600">
              <span>Tiles Cached:</span> <strong className="text-black">{storageInfo.totalTiles}</strong>
            </div>
            <div className="text-neutral-600">
              <span>Saved Areas:</span> <strong className="text-black">{packages.length}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isOfflineSimulated && (
              <span className="px-2 py-0.5 bg-amber-300 text-black text-[10px] font-black border border-black flex items-center gap-1 animate-pulse">
                <WifiOff className="w-3 h-3 text-red-600" />
                SIMULATED OFFLINE ACTIVE
              </span>
            )}
            <span className="text-[10px] text-neutral-500">
              Cache: <span className="font-mono text-black">terranex-offline-tiles-v1</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b-2 border-black bg-neutral-100 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border-r-2 border-black ${
              activeTab === 'download'
                ? 'bg-white text-[#ff3e00] shadow-[inset_0_-3px_0_#ff3e00]'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>1. {currentLang === 'hi' ? 'क्षेत्र डाउनलोड करें' : 'Download New Area'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer border-r-2 border-black ${
              activeTab === 'packages'
                ? 'bg-white text-[#ff3e00] shadow-[inset_0_-3px_0_#ff3e00]'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>2. {currentLang === 'hi' ? 'संग्रहीत मैप्स' : 'Cached Areas'} ({packages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-2.5 px-3 text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-[#ff3e00] shadow-[inset_0_-3px_0_#ff3e00]'
                : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>3. {currentLang === 'hi' ? 'ऑफलाइन गाइड' : 'Offline Readiness'}</span>
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DOWNLOAD NEW AREA */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* Active Download Progress Banner */}
              {isDownloading && progress && (
                <div className="p-4 bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_#0a0a0a] space-y-2.5 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-[#ff3e00] animate-spin" />
                      <span className="text-xs font-black uppercase tracking-wide">
                        Caching Map Tiles: {progress.downloaded} / {progress.total} ({progress.percentage}%)
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold">
                      {((progress.bytesDownloaded || 0) / (1024 * 1024)).toFixed(1)} MB Cached
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-4 bg-neutral-200 border-2 border-black overflow-hidden relative">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-150"
                      style={{ width: `${progress.percentage}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-black font-mono">
                      {progress.percentage}% COMPLETE
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-600 font-mono">
                    <span>Tile Coordinate: {progress.currentTile}</span>
                    <button
                      type="button"
                      onClick={handleCancelDownload}
                      className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-[10px] border border-black cursor-pointer"
                    >
                      Cancel Download
                    </button>
                  </div>
                </div>
              )}

              {/* Success Notification */}
              {downloadSuccess && !isDownloading && (
                <div className="p-3 bg-emerald-100 border-2 border-black flex items-center justify-between text-xs font-bold text-emerald-900 shadow-[2px_2px_0px_#0a0a0a]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{downloadSuccess}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="px-2 py-1 bg-black text-white text-[10px] uppercase font-black cursor-pointer hover:bg-neutral-800"
                  >
                    View Cached
                  </button>
                </div>
              )}

              {/* Error Notification */}
              {downloadError && (
                <div className="p-3 bg-red-100 border-2 border-black flex items-center gap-2 text-xs font-bold text-red-900 shadow-[2px_2px_0px_#0a0a0a]">
                  <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}

              {/* Step 1: State Selection */}
              <div>
                <label className="block text-xs font-black uppercase text-neutral-800 mb-2 flex items-center justify-between">
                  <span>Step 1: Select North Eastern Region State / Corridor</span>
                  <span className="text-[10px] text-neutral-500 font-normal">8 NER States Available</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {NER_STATE_AREAS.map((state) => {
                    const isSelected = selectedStateId === state.id;
                    const existingPackage = packages.find((p) => p.stateId === state.id && p.status === 'completed');

                    return (
                      <div
                        key={state.id}
                        onClick={() => setSelectedStateId(state.id)}
                        className={`p-2.5 border-2 border-black cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0a0a0a] text-white shadow-[3px_3px_0px_#ff3e00]'
                            : 'bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_#0a0a0a]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-base">{state.flagEmoji}</span>
                          {existingPackage && (
                            <span className="px-1.5 py-0.2 bg-emerald-500 text-black text-[9px] font-black border border-black">
                              CACHED
                            </span>
                          )}
                        </div>
                        <div className="font-black text-xs mt-1 truncate">
                          {currentLang === 'hi' ? state.hindiName : state.englishName}
                        </div>
                        <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {state.corridorHighlight}
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-[9px] font-mono">
                          {state.highways.slice(0, 3).map((hw) => (
                            <span
                              key={hw}
                              className={`px-1 py-0.2 border ${
                                isSelected ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
                              }`}
                            >
                              {hw}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Detail Level / Zoom Selection */}
              <div className="border-t-2 border-neutral-200 pt-3">
                <label className="block text-xs font-black uppercase text-neutral-800 mb-2">
                  Step 2: Choose Resolution & Detail Level
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setSelectedDetailLevel('standard')}
                    className={`p-3 border-2 border-black cursor-pointer transition ${
                      selectedDetailLevel === 'standard'
                        ? 'bg-[#0a0a0a] text-white shadow-[3px_3px_0px_#ff3e00]'
                        : 'bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase">Standard Overview</span>
                      <span className="text-[10px] font-mono font-bold">Zoom 6–8</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${selectedDetailLevel === 'standard' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      State & major National Highway connectivity. Low storage footprint.
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-[#ff3e00]">
                      ~2 to 6 MB • Fast Download
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedDetailLevel('corridor')}
                    className={`p-3 border-2 border-black cursor-pointer transition relative ${
                      selectedDetailLevel === 'corridor'
                        ? 'bg-[#0a0a0a] text-white shadow-[3px_3px_0px_#ff3e00]'
                        : 'bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_#0a0a0a]'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-2 px-1.5 py-0.2 bg-[#ff3e00] text-white text-[9px] font-black border border-black">
                      RECOMMENDED
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase">Corridor Navigation</span>
                      <span className="text-[10px] font-mono font-bold">Zoom 6–10</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${selectedDetailLevel === 'corridor' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Full pass details, mountain turns, towns, and bypass detour branches.
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-emerald-400">
                      ~12 to 24 MB • Ideal for Convoy Travel
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedDetailLevel('high')}
                    className={`p-3 border-2 border-black cursor-pointer transition ${
                      selectedDetailLevel === 'high'
                        ? 'bg-[#0a0a0a] text-white shadow-[3px_3px_0px_#ff3e00]'
                        : 'bg-white hover:bg-neutral-50 text-black shadow-[2px_2px_0px_#0a0a0a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase">High Precision</span>
                      <span className="text-[10px] font-mono font-bold">Zoom 6–12</span>
                    </div>
                    <p className={`text-[11px] mt-1 ${selectedDetailLevel === 'high' ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      Street and bridge level zoom for remote gorge operations.
                    </p>
                    <div className="mt-2 text-[10px] font-mono font-bold text-amber-500">
                      ~35 to 70 MB • Comprehensive
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Layer Selection */}
              <div className="border-t-2 border-neutral-200 pt-3">
                <label className="block text-xs font-black uppercase text-neutral-800 mb-2">
                  Step 3: Base Map Layer Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Road Map', 'Satellite', 'Accessibility Heatmap'] as const).map((layer) => (
                    <button
                      key={layer}
                      type="button"
                      onClick={() => setSelectedLayer(layer)}
                      className={`p-2 border-2 border-black text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        selectedLayer === layer
                          ? 'bg-[#0a0a0a] text-white shadow-[2px_2px_0px_#ff3e00]'
                          : 'bg-white hover:bg-neutral-100 text-black shadow-[1px_1px_0px_#0a0a0a]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{layer === 'Accessibility Heatmap' ? 'Heatmap' : layer}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate Summary & Download Button */}
              <div className="p-4 bg-[#fff8f0] border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-neutral-700">
                    Target Area: <strong className="text-black">{selectedState.name}</strong>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono mt-0.5">
                    Estimated Tiles: <strong className="text-[#ff3e00]">{estimatedTiles} tiles</strong> • Est. Size: <strong className="text-emerald-700">~{estimatedMB} MB</strong>
                  </div>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Stores directly in browser Cache Storage (<code className="text-black">terranex-offline-tiles-v1</code>)
                  </div>
                </div>

                <button
                  id="btn-confirm-download-tiles"
                  type="button"
                  disabled={isDownloading}
                  onClick={handleStartDownload}
                  className={`w-full sm:w-auto px-5 py-3 border-2 border-black text-xs font-black uppercase tracking-wider transition shadow-[4px_4px_0px_#0a0a0a] flex items-center justify-center gap-2 cursor-pointer ${
                    isDownloading
                      ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                      : 'bg-[#ff3e00] hover:bg-[#e03700] text-white active:translate-x-0.5 active:translate-y-0.5'
                  }`}
                >
                  <Download className="w-4 h-4 text-white" />
                  <span>
                    {isDownloading
                      ? 'Downloading Offline Tiles...'
                      : `Download Area Tiles (~${estimatedMB} MB)`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE CACHED PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-black">
                    Saved Offline Map Packages ({packages.length})
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Stored locally in Cache Storage for offline rendering
                  </p>
                </div>

                {packages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-400 text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Tiles</span>
                  </button>
                )}
              </div>

              {packages.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-neutral-300 bg-neutral-50">
                  <WifiOff className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <div className="text-xs font-bold uppercase text-neutral-700">No Offline Maps Cached Yet</div>
                  <p className="text-[11px] text-neutral-500 mt-1 max-w-sm mx-auto">
                    Download map areas under Tab 1 so your fleet can navigate mountain roads without cellular data.
                  </p>
                  <button
                    onClick={() => setActiveTab('download')}
                    className="mt-3 px-3 py-1.5 bg-[#0a0a0a] text-white text-xs font-black uppercase shadow-[2px_2px_0px_#ff3e00] cursor-pointer hover:bg-neutral-800"
                  >
                    Download North East Area
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-3.5 border-2 border-black bg-white shadow-[3px_3px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-black uppercase">{pkg.stateName}</span>
                          <span className="px-1.5 py-0.2 bg-black text-white text-[9px] font-mono">
                            {pkg.layerType}
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold">
                            Zoom {pkg.minZoom}–{pkg.maxZoom}
                          </span>
                        </div>

                        <div className="text-[11px] text-neutral-600 flex items-center gap-3">
                          <span>
                            Tiles: <strong className="text-black font-mono">{pkg.downloadedTiles}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Size:{' '}
                            <strong className="text-emerald-700 font-mono">
                              {((pkg.sizeBytes || 0) / (1024 * 1024)).toFixed(1)} MB
                            </strong>
                          </span>
                          <span>•</span>
                          <span className="text-[10px] text-neutral-400">
                            {new Date(pkg.timestamp).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {pkg.highways && pkg.highways.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 text-[9px]">
                            <span className="text-neutral-500">Corridors:</span>
                            {pkg.highways.map((hw) => (
                              <span key={hw} className="px-1 py-0.2 bg-neutral-100 border border-neutral-300 text-black">
                                {hw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handlePanToPackage(pkg)}
                          className="px-2.5 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase transition flex items-center gap-1 cursor-pointer border border-black shadow-[2px_2px_0px_#ff3e00]"
                          title="Focus map on this cached area"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#ff3e00]" />
                          <span>View on Map</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1.5 bg-neutral-100 hover:bg-red-600 hover:text-white text-neutral-600 border border-black transition cursor-pointer"
                          title="Delete cached package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: OFFLINE READINESS GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-neutral-800">
              <div className="p-3.5 bg-emerald-50 border-2 border-black shadow-[3px_3px_0px_#0a0a0a] space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-800 font-black uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Northeast India Zero-Connectivity Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-950 font-sans">
                  The Brahmaputra Valley, Sela Pass approach (NH-13), and Lushai Hills have recurrent cellular dead-zones during severe monsoons. When you download an offline area, both the raster map tiles and the complete vector road network (including bypasses, relief hubs, and hospitals) are permanently cached on your device.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#0a0a0a] space-y-1">
                  <div className="flex items-center gap-1.5 font-black uppercase text-black text-[11px]">
                    <Zap className="w-3.5 h-3.5 text-[#ff3e00]" />
                    <span>How Navigation Functions Offline</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                    Leaflet’s tile renderer intercepts requests and retrieves cached PNG images directly from browser <code className="text-black font-bold">CacheStorage</code>. Your device’s physical GPS antenna tracks your convoy position without requiring cellular data or mobile tower pinging.
                  </p>
                </div>

                <div className="p-3 border-2 border-black bg-white shadow-[2px_2px_0px_#0a0a0a] space-y-1">
                  <div className="flex items-center gap-1.5 font-black uppercase text-black text-[11px]">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Incident Reports & Sync Queue</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 font-sans leading-relaxed">
                    If an officer files a road hazard report or triggers an SOS in a dead zone, the report is securely enqueued in local IndexedDB storage. As soon as connectivity returns at a valley checkpoint, the queue automatically syncs with the central command room.
                  </p>
                </div>
              </div>

              <div className="p-3 border-2 border-black bg-neutral-100 flex items-center justify-between gap-3">
                <div>
                  <div className="font-black uppercase text-[11px] text-black">Simulate Disconnected Convoy Mode</div>
                  <p className="text-[10px] text-neutral-600 font-sans">
                    Switch on Simulated Offline to test how your map and routing look with internet disconnected.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleOfflineSimulation}
                  className={`px-3 py-1.5 border-2 border-black text-xs font-black uppercase transition cursor-pointer shadow-[2px_2px_0px_#0a0a0a] ${
                    isOfflineSimulated
                      ? 'bg-amber-400 text-black'
                      : 'bg-black text-white hover:bg-neutral-800'
                  }`}
                >
                  {isOfflineSimulated ? 'Disconnect (Active)' : 'Test Offline Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-100 p-3 border-t-2 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
            <Radio className="w-3.5 h-3.5 text-[#ff3e00] animate-pulse" />
            <span>Northeast Logistics Command • GIS Tile Engine v2.4</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase transition cursor-pointer border border-black shadow-[2px_2px_0px_#0a0a0a]"
          >
            {currentLang === 'hi' ? 'बंद करें (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
