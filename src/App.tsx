import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Road, Vehicle, Delivery, Incident, Alert, WeatherData, RouteOption, NewsArticle } from './types';
import { INITIAL_USER, INITIAL_ROADS, INITIAL_VEHICLES, INITIAL_DELIVERIES, INITIAL_INCIDENTS, INITIAL_ALERTS, INITIAL_WEATHER } from './data/nerData';
import { INITIAL_INDIA_NEWS_ARTICLES, analyzeIndianNewsText } from './data/newsData';
import { Language } from './translations';
import { api } from './services/api';
import { OfflineSyncService } from './services/offlineSync';

// Components
import { SplashScreen, LoginScreen, OnboardingScreen } from './components/AuthScreens';
import { TopNavigation, BottomNavigation } from './components/Navigation';
import { AuthorityDashboard } from './components/AuthorityDashboard';
import { FieldOfficerHome } from './components/FieldOfficerHome';
import { DriverDashboard } from './components/DriverDashboard';
import { AlertCenterScreen, AnalyticsScreen } from './components/AlertCenterScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { GisMap } from './components/GisMap';
import { SihDemoController } from './components/SihDemoController';
import { SimpleUserHome } from './components/SimpleUserHome';
import { HelpEmergencyScreen } from './components/HelpEmergencyScreen';
import { LiveNewsIntelligenceModal } from './components/LiveNewsIntelligenceModal';
import { GuideHelpModal } from './components/GuideHelpModal';

// Modals
import { RoadDetailsModal } from './components/RoadDetailsModal';
import { RouteComparisonModal } from './components/RouteComparisonModal';
import { DynamicRerouteModal } from './components/DynamicRerouteModal';
import { IncidentReportModal } from './components/IncidentReportModal';
import { IncidentDetailsModal } from './components/IncidentDetailsModal';
import { WhatIfSimulatorModal } from './components/WhatIfSimulatorModal';
import { DistrictIntelligenceModal } from './components/DistrictIntelligenceModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { EmergencyModeOverlay } from './components/EmergencyModeOverlay';
import { PullToRefresh } from './components/PullToRefresh';
import { CloudStorageService } from './services/cloudStorage';
import { auth, mapFirebaseUserToAppUser } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { Play, Sliders, MapPin, Truck, RefreshCw, Newspaper, Globe, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation & Screen Flow States: Open directly to Login screen
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('tnx_onboarded') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<Language>('en');
  const [simpleMode, setSimpleMode] = useState<boolean>(true);

  // Network & Persistence States
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Core Data States
  const [roads, setRoads] = useState<Road[]>(INITIAL_ROADS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [weather, setWeather] = useState<WeatherData[]>(INITIAL_WEATHER);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(INITIAL_INDIA_NEWS_ARTICLES);

  // Selected Entities & Modals
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [showRouteComparison, setShowRouteComparison] = useState<boolean>(false);
  const [showDynamicReroute, setShowDynamicReroute] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showSimulationModal, setShowSimulationModal] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showNewsModal, setShowNewsModal] = useState<boolean>(false);
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Auto-sync with Firebase auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setCurrentUser(mapFirebaseUserToAppUser(fbUser));
      }
    });
    return () => unsubscribe();
  }, []);

  // Layout View Mode (Mobile Phone View by default)
  const [isWideLayout, setIsWideLayout] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tnx_wide_layout');
      if (saved === 'wide') return true;
      return false; // Dedicated mobile application view by default
    }
    return false;
  });

  const handleToggleWideLayout = () => {
    setIsWideLayout((prev) => {
      const next = !prev;
      localStorage.setItem('tnx_wide_layout', next ? 'wide' : 'mobile');
      return next;
    });
  };

  // SIH 10-Step Demo Controller Drawer / Banner
  const [showDemoController, setShowDemoController] = useState<boolean>(false);
  const [currentDemoStep, setCurrentDemoStep] = useState<number>(1);

  // Load live data from server & cloud storage on startup
  const refreshData = useCallback(async () => {
    try {
      const data = await api.getInitialData();
      if (data.roads && data.roads.length > 0) setRoads(data.roads);
      if (data.vehicles && data.vehicles.length > 0) setVehicles(data.vehicles);
      if (data.deliveries && data.deliveries.length > 0) setDeliveries(data.deliveries);
      if (data.incidents && data.incidents.length > 0) setIncidents(data.incidents);
      if (data.alerts && data.alerts.length > 0) setAlerts(data.alerts);
      if (data.weather && data.weather.length > 0) setWeather(data.weather);
    } catch (err) {
      console.warn('Using seeded data offline:', err);
    }
    try {
      const newsData = await api.getNews();
      if (newsData && newsData.articles && newsData.articles.length > 0) {
        setNewsArticles(newsData.articles);
      }
    } catch (err) {
      console.warn('Using seeded news articles offline:', err);
    }

    // Check Cloud Storage Persistence (Firebase Firestore)
    try {
      const cloudStats = await CloudStorageService.getCloudStorageStats();
      if (cloudStats.totalRecords === 0) {
        // Automatically seed complete data to Cloud Firestore if cloud database is empty
        await CloudStorageService.uploadCompleteDataToCloud({
          roads: INITIAL_ROADS,
          vehicles: INITIAL_VEHICLES,
          deliveries: INITIAL_DELIVERIES,
          incidents: INITIAL_INCIDENTS,
          alerts: INITIAL_ALERTS,
          weather: INITIAL_WEATHER,
          newsArticles: INITIAL_INDIA_NEWS_ARTICLES
        });
      } else {
        // Cloud has existing persistence! Merge live cloud data
        const cloudData = await CloudStorageService.fetchCompleteDataFromCloud();
        if (cloudData.roads.length > 0) setRoads(cloudData.roads);
        if (cloudData.vehicles.length > 0) setVehicles(cloudData.vehicles);
        if (cloudData.deliveries.length > 0) setDeliveries(cloudData.deliveries);
        if (cloudData.incidents.length > 0) setIncidents(cloudData.incidents);
        if (cloudData.alerts.length > 0) setAlerts(cloudData.alerts);
        if (cloudData.weather.length > 0) setWeather(cloudData.weather);
        if (cloudData.newsArticles.length > 0) setNewsArticles(cloudData.newsArticles);
      }
    } catch (cloudErr) {
      console.warn('Cloud Storage sync:', cloudErr);
    }

    setPendingSyncCount(OfflineSyncService.getQueue().length);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Handle applying news impact to road status and alerts
  const handleApplyNewsImpact = useCallback(async (article: NewsArticle) => {
    try {
      const res = await api.applyNewsImpact(article.id);
      if (res.road) {
        setRoads((prev) =>
          prev.map((r) => (r.id === res.road.id ? { ...r, ...res.road } : r))
        );
      }
      if (res.alert) {
        setAlerts((prev) => [res.alert, ...prev]);
      }
      setNewsArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, appliedToRoute: true } : a))
      );
    } catch (err) {
      // Local offline fallback
      setRoads((prev) =>
        prev.map((r) => {
          const match =
            r.code.toLowerCase() === article.extractedHighway.toLowerCase() ||
            r.code.replace('-', '').toLowerCase() === article.extractedHighway.replace('-', '').toLowerCase();
          if (match) {
            return {
              ...r,
              status: article.detectedStatus,
              accessibility:
                article.detectedStatus === 'BLOCKED'
                  ? 'BLOCKED'
                  : article.detectedStatus === 'HIGH_RISK'
                  ? 'RESTRICTED'
                  : 'ACCESSIBLE',
              recommendedAction: article.impactSummary
            };
          }
          return r;
        })
      );
      setNewsArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, appliedToRoute: true } : a))
      );
    }
  }, []);

  const handleAnalyzeCustomNews = useCallback(async (text: string, source: string) => {
    try {
      const res = await api.analyzeNews(text, source);
      if (res.article) {
        setNewsArticles((prev) => [res.article, ...prev]);
        return res.article;
      }
      throw new Error('Analysis returned no article');
    } catch (err) {
      const parsed = analyzeIndianNewsText(text, source);
      setNewsArticles((prev) => [parsed, ...prev]);
      return parsed;
    }
  }, []);

  const handleShowNewsOnMap = useCallback((article: NewsArticle) => {
    setShowNewsModal(false);
    setActiveTab('map');
    const matched = (roads || []).find(
      (r) =>
        r.code.toLowerCase() === article.extractedHighway.toLowerCase() ||
        r.code.replace('-', '').toLowerCase() === article.extractedHighway.replace('-', '').toLowerCase()
    );
    if (matched) {
      setSelectedRoad(matched);
    }
  }, [roads]);

  // Synchronize with demo step triggers
  const handleDemoStepChange = useCallback((step: number) => {
    setCurrentDemoStep(step);
    refreshData();

    switch (step) {
      case 1:
        setActiveTab('home');
        break;
      case 2:
        setActiveTab('map');
        break;
      case 3:
        setActiveTab('map');
        break;
      case 4: {
        const nh13 = (roads || []).find((r) => r.code === 'NH-13');
        if (nh13) setSelectedRoad(nh13);
        break;
      }
      case 5: {
        // Mark NH-13 blocked
        const nh13 = (roads || []).find((r) => r.code === 'NH-13');
        if (nh13) {
          handleRoadBlocked(nh13);
        }
        setShowDynamicReroute(true);
        break;
      }
      case 6:
        setShowDynamicReroute(true);
        break;
      case 7:
        // Step 7: Driver Dashboard with in-cab alert & visual ETA confidence tracker
        setCurrentUser((prev) => (prev ? { ...prev, role: 'driver' } : null));
        setActiveTab('home');
        setShowDynamicReroute(false);
        setShowRouteComparison(false);
        break;
      case 8:
        setShowRouteComparison(true);
        break;
      case 9:
        // Step 9: Accept reroute and show updated Driver Progress Tracker
        handleAcceptReroute();
        setShowRouteComparison(false);
        setCurrentUser((prev) => (prev ? { ...prev, role: 'driver' } : null));
        setActiveTab('home');
        break;
      case 10:
        setCurrentUser((prev) => (prev ? { ...prev, role: 'authority' } : null));
        setActiveTab('analytics');
        break;
      default:
        break;
    }
  }, [roads, refreshData]);

  // Mark Road Blocked Action
  const handleRoadBlocked = async (road: Road) => {
    const isNowBlocked = road.status !== 'BLOCKED';
    try {
      const res = await api.updateRoadStatus(
        road.id,
        isNowBlocked ? 'BLOCKED' : 'ACCESSIBLE',
        isNowBlocked ? 'Blocked' : 'Accessible'
      );
      if (res.road) {
        setRoads((prev) => prev.map((r) => (r.id === res.road.id ? res.road : r)));
      }
    } catch {
      setRoads((prev) =>
        prev.map((r) =>
          r.id === road.id
            ? {
                ...r,
                status: isNowBlocked ? 'BLOCKED' : 'ACCESSIBLE',
                accessibility: isNowBlocked ? 'Blocked' : 'Accessible'
              }
            : r
        )
      );
    }

    if (isNowBlocked) {
      // Trigger dynamic reroute alert for convoy pilots
      setShowDynamicReroute(true);
    }

    // Persist to Cloud Firestore
    CloudStorageService.updateRoadStatus(
      road.id,
      isNowBlocked ? 'BLOCKED' : 'ACCESSIBLE',
      isNowBlocked ? 'Blocked' : 'Accessible'
    ).catch((e) => console.warn('Cloud update road:', e));
  };

  // Accept Reroute Action
  const handleAcceptReroute = async () => {
    try {
      const v = (vehicles || []).find((veh) => veh.vehicleNumber === 'TNX-1042');
      if (v) {
        const res = await api.rerouteVehicle(v.id, 'route-shergaon-bypass');
        if (res.vehicle) {
          setVehicles((prev) => prev.map((item) => (item.id === res.vehicle.id ? res.vehicle : item)));
        }
        CloudStorageService.rerouteVehicle(v.id, {
          status: 'REROUTED',
          eta: '5h 52m',
          riskLevel: 'LOW'
        }).catch((e) => console.warn('Cloud reroute vehicle:', e));
      }
    } catch {
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicleNumber === 'TNX-1042'
            ? { ...v, status: 'REROUTED', eta: '5h 52m', riskLevel: 'LOW' }
            : v
        )
      );
    }
    setShowDynamicReroute(false);
    setShowRouteComparison(false);
    setActiveTab('route');
  };

  // Sync Offline Queue
  const handleSyncOffline = async () => {
    const res = await OfflineSyncService.processQueue();
    if (res.syncedCount > 0) {
      setPendingSyncCount(OfflineSyncService.getQueue().length);
      refreshData();
    }
  };

  // Flow checks: Open LoginScreen immediately on startup so user completes authentication
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          localStorage.setItem('tnx_onboarded', 'true');
          setHasOnboarded(true);
        }}
      />
    );
  }

  const unreadAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-[#0a0a0a] flex flex-col font-sans selection:bg-[#ff3e00] selection:text-white relative">
      {/* Top Header Navigation with Prominent Language Switcher */}
        <TopNavigation
          currentUser={currentUser}
          currentTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          lang={lang}
          onLangChange={setLang}
          isOnline={isOnline}
          onToggleOffline={() => {
            const next = !isOnline;
            setIsOnline(next);
            if (next) handleSyncOffline();
          }}
          pendingSyncCount={pendingSyncCount}
          emergencyMode={emergencyMode}
          onToggleEmergency={() => setEmergencyMode(!emergencyMode)}
          onOpenSearch={() => setShowSearchModal(true)}
          unreadAlertCount={unreadAlertCount}
          simpleMode={simpleMode}
          onToggleSimpleMode={() => setSimpleMode(!simpleMode)}
          onOpenNewsRadar={() => setShowNewsModal(true)}
          activeNewsDisruptionsCount={newsArticles.filter((a) => a.detectedStatus === 'BLOCKED' || a.detectedStatus === 'HIGH_RISK').length}
          isWideLayout={isWideLayout}
          onToggleWideLayout={handleToggleWideLayout}
          onOpenGuide={() => setShowGuideModal(true)}
          onOpenDemo={() => setShowDemoController((prev) => !prev)}
        />

        {/* Interactive 10-Step Demo Controller Drawer */}
        {showDemoController && (
          <div className="p-3 bg-neutral-950 border-b-2 border-black relative z-30 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-white font-mono text-xs">
              <span className="text-[#ff3e00] font-black uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                SIH Live Highway Walkthrough (Step {currentDemoStep} of 10)
              </span>
              <button
                type="button"
                onClick={() => setShowDemoController(false)}
                className="text-neutral-400 hover:text-white text-[11px] font-bold uppercase cursor-pointer"
              >
                ✕ Close Walkthrough
              </button>
            </div>
            <SihDemoController
              currentStep={currentDemoStep}
              onStepChange={handleDemoStepChange}
              onReset={() => {
                handleDemoStepChange(1);
                setShowDemoController(false);
              }}
            />
          </div>
        )}

        {/* Main Content Viewport - Optimized for Smooth Scrolling */}
        <main className="flex-1 w-full overflow-y-auto px-3 sm:px-4 pt-3 pb-6 touch-pan-y scroll-smooth">
          {/* Streamlined Mobile Disruption Notification Banner (Shown only when roadblocks detected) */}
          {newsArticles.filter((a) => a.detectedStatus === 'BLOCKED' || a.detectedStatus === 'HIGH_RISK').length > 0 && (
            <button
              type="button"
              id="btn-mobile-news-alert"
              onClick={() => setShowNewsModal(true)}
              className="w-full mb-3 px-3 py-2 bg-black text-white border-2 border-black flex items-center justify-between text-xs font-mono font-bold shadow-[2px_2px_0px_#ff3e00] transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff3e00] animate-ping shrink-0" />
                <span className="text-[11px] text-neutral-200 truncate">
                  <strong className="text-white">
                    {newsArticles.filter((a) => a.detectedStatus === 'BLOCKED' || a.detectedStatus === 'HIGH_RISK').length} Highway Blockages
                  </strong>{' '}
                  Active
                </span>
              </div>
              <span className="text-[10px] text-[#ff3e00] uppercase font-black shrink-0">Radar &gt;</span>
            </button>
          )}

          {/* Tab Switching Body */}
          {activeTab === 'home' && (
            <PullToRefresh
              onRefresh={refreshData}
              pullPrompt="Pull down to refresh highway feed"
              releasePrompt="Release to update telemetry..."
              refreshingPrompt="Fetching latest NER data..."
            >
              {simpleMode ? (
                <SimpleUserHome
                  roads={roads}
                  vehicles={vehicles}
                  incidents={incidents}
                  lang={lang}
                  onOpenMap={() => setActiveTab('map')}
                  onOpenReportModal={() => setShowReportModal(true)}
                  onOpenRoute={() => setActiveTab('route')}
                  onSelectRoad={(r) => setSelectedRoad(r)}
                  onEmergencySOS={() => setEmergencyMode(true)}
                  onSelectIncident={(inc) => setSelectedIncident(inc)}
                />
              ) : (
                <>
                  {currentUser.role === 'authority' && (
                    <AuthorityDashboard
                      currentUser={currentUser}
                      roads={roads}
                      vehicles={vehicles}
                      deliveries={deliveries}
                      incidents={incidents}
                      newsArticles={newsArticles}
                      onSelectRoad={(r) => setSelectedRoad(r)}
                      onSelectDelivery={(d) => {
                        const v = (vehicles || []).find((veh) => veh.id === d.vehicleId);
                        if (v && roads && roads.length > 0) setSelectedRoad(roads[0]);
                      }}
                      onSelectVehicle={(v) => {
                        setActiveTab('map');
                      }}
                      onOpenSimulation={() => setShowSimulationModal(true)}
                      onOpenEmergency={() => setEmergencyMode(true)}
                      onOpenMap={() => setActiveTab('map')}
                      onOptimizeAll={() => setShowRouteComparison(true)}
                      onOpenNewsRadar={() => setShowNewsModal(true)}
                    />
                  )}

                  {currentUser.role === 'field_officer' && (
                    <FieldOfficerHome
                      currentUser={currentUser}
                      incidents={incidents}
                      roads={roads}
                      onOpenReportModal={() => setShowReportModal(true)}
                      onSelectIncident={(inc) => setSelectedIncident(inc)}
                      isOnline={isOnline}
                      onSyncOffline={handleSyncOffline}
                      pendingSyncCount={pendingSyncCount}
                      onRefresh={refreshData}
                    />
                  )}

                  {currentUser.role === 'driver' && (
                    <DriverDashboard
                      currentUser={currentUser}
                      vehicles={vehicles}
                      roads={roads}
                      onAcceptReroute={handleAcceptReroute}
                      onOpenRouteOptions={() => setShowRouteComparison(true)}
                      onOpenReportModal={() => setShowReportModal(true)}
                    />
                  )}

                  {currentUser.role === 'analyst' && (
                    <AnalyticsScreen
                      roads={roads}
                      onOpenDistrict={(id) => setSelectedDistrictId(id)}
                    />
                  )}
                </>
              )}
            </PullToRefresh>
          )}

        {/* Interactive Tactical GIS Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-2 pb-6">
            <div className="flex items-center justify-between bg-white border-2 border-black p-2 shadow-[2px_2px_0px_#0a0a0a]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#ff3e00]" />
                <h2 className="text-xs font-black text-black uppercase font-mono tracking-tight">
                  NER Live GIS Map
                </h2>
              </div>

              <button
                onClick={() => setShowRouteComparison(true)}
                className="px-2 py-1 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider hover:bg-neutral-800 transition flex items-center gap-1 shadow-[1px_1px_0px_#ff3e00] cursor-pointer"
              >
                <Truck className="w-3 h-3 text-[#ff3e00]" /> Compare
              </button>
            </div>

            <GisMap
              roads={roads}
              vehicles={vehicles}
              incidents={incidents}
              newsArticles={newsArticles}
              selectedRoadId={selectedRoad?.id}
              selectedVehicleId={null}
              selectedIncidentId={selectedIncident?.id}
              emergencyModeActive={emergencyMode}
              lang={lang}
              onSelectRoad={(r) => setSelectedRoad(r)}
              onSelectVehicle={(v) => {
                const r = (roads || []).find((road) => road.code === v.currentRoadCode);
                if (r) setSelectedRoad(r);
              }}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              onSelectNewsArticle={(art) => handleShowNewsOnMap(art)}
              onOpenNewsRadar={() => setShowNewsModal(true)}
            />
          </div>
        )}

        {/* Route Optimization View for Drivers/Logistics */}
        {(activeTab === 'route' || activeTab === 'logistics') && (
          <DriverDashboard
            currentUser={currentUser}
            vehicles={vehicles}
            roads={roads}
            onAcceptReroute={handleAcceptReroute}
            onOpenRouteOptions={() => setShowRouteComparison(true)}
            onOpenReportModal={() => setShowReportModal(true)}
          />
        )}

        {/* Field Reporting Tab */}
        {activeTab === 'report' && (
          <FieldOfficerHome
            currentUser={currentUser}
            incidents={incidents}
            roads={roads}
            onOpenReportModal={() => setShowReportModal(true)}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            isOnline={isOnline}
            onSyncOffline={handleSyncOffline}
            pendingSyncCount={pendingSyncCount}
            onRefresh={refreshData}
          />
        )}

        {/* Incidents Tab */}
        {activeTab === 'incidents' && (
          <FieldOfficerHome
            currentUser={currentUser}
            incidents={incidents}
            roads={roads}
            onOpenReportModal={() => setShowReportModal(true)}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            isOnline={isOnline}
            onSyncOffline={handleSyncOffline}
            pendingSyncCount={pendingSyncCount}
            onRefresh={refreshData}
          />
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <AlertCenterScreen
            alerts={alerts}
            onAcknowledgeAlert={async (id) => {
              try {
                await api.acknowledgeAlert(id);
                setAlerts((prev) =>
                  prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
                );
              } catch {
                setAlerts((prev) =>
                  prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
                );
              }
            }}
            onViewOnMap={(roadCode) => {
              const r = (roads || []).find((rd) => rd.code === roadCode);
              if (r) setSelectedRoad(r);
              setActiveTab('map');
            }}
            onTriggerReroute={() => setShowRouteComparison(true)}
          />
        )}

        {/* Simulation Tab */}
        {activeTab === 'simulation' && (
          <WhatIfSimulatorModal onClose={() => setActiveTab('home')} />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsScreen
            roads={roads}
            onOpenDistrict={(id) => setSelectedDistrictId(id)}
          />
        )}

        {/* Dedicated Help & Emergency Tab (Simple Mode & Direct Call) */}
        {activeTab === 'help' && (
          <HelpEmergencyScreen
            lang={lang}
            onSendSOS={() => setEmergencyMode(true)}
            onOpenMap={() => setActiveTab('map')}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            lang={lang}
            onLangChange={setLang}
            onSwitchRole={(newRole) => {
              setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
              setActiveTab('home');
            }}
            isOnline={isOnline}
            onSyncNow={handleSyncOffline}
          />
        )}
      </main>

      {/* Bottom Navigation Dock - Kept at bottom of application so user can simply switch tabs */}
      <BottomNavigation
        currentUser={currentUser}
        currentTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        lang={lang}
        onLangChange={setLang}
        isOnline={isOnline}
        onToggleOffline={() => {
          const next = !isOnline;
          setIsOnline(next);
          if (next) handleSyncOffline();
        }}
        pendingSyncCount={pendingSyncCount}
        emergencyMode={emergencyMode}
        onToggleEmergency={() => setEmergencyMode(!emergencyMode)}
        onOpenSearch={() => setShowSearchModal(true)}
        unreadAlertCount={unreadAlertCount}
        simpleMode={simpleMode}
        onToggleSimpleMode={() => setSimpleMode(!simpleMode)}
        onOpenNewsRadar={() => setShowNewsModal(true)}
        activeNewsDisruptionsCount={newsArticles.filter((a) => a.detectedStatus === 'BLOCKED' || a.detectedStatus === 'HIGH_RISK').length}
        isWideLayout={isWideLayout}
        onToggleWideLayout={handleToggleWideLayout}
        onOpenGuide={() => setShowGuideModal(true)}
        onOpenDemo={() => setShowDemoController((prev) => !prev)}
      />

      {/* Global Modals */}

      {/* Road Details & AI Disruption Modal */}
      {selectedRoad && (
        <RoadDetailsModal
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
          onMarkBlocked={(r) => handleRoadBlocked(r)}
          onFindAlternate={() => {
            setSelectedRoad(null);
            setShowRouteComparison(true);
          }}
          onCreateAlert={(r) => {
            setSelectedRoad(null);
            setActiveTab('alerts');
          }}
        />
      )}

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onMarkRoadBlocked={(inc) => {
            const r = (roads || []).find((rd) => rd.code === inc.roadCode);
            if (r) handleRoadBlocked(r);
            setSelectedIncident(null);
          }}
          onCreateAlert={() => {
            setSelectedIncident(null);
            setActiveTab('alerts');
          }}
          onFindAlternateRoute={() => {
            setSelectedIncident(null);
            setShowRouteComparison(true);
          }}
          onAssignTeam={() => setSelectedIncident(null)}
        />
      )}

      {/* Multi-Factor Route Optimization Comparison Modal */}
      {showRouteComparison && (
        <RouteComparisonModal
          onClose={() => setShowRouteComparison(false)}
          onSelectRoute={() => handleAcceptReroute()}
        />
      )}

      {/* Dynamic Cockpit Rerouting Alert Modal */}
      {showDynamicReroute && (
        <DynamicRerouteModal
          onAcceptReroute={handleAcceptReroute}
          onViewOptions={() => {
            setShowDynamicReroute(false);
            setShowRouteComparison(true);
          }}
          onDismiss={() => setShowDynamicReroute(false)}
        />
      )}

      {/* Field Ground Incident Reporting Modal */}
      {showReportModal && (
        <IncidentReportModal
          onClose={() => setShowReportModal(false)}
          onReportSubmitted={(newInc) => {
            setIncidents((prev) => [newInc, ...prev]);
            setShowReportModal(false);
            setPendingSyncCount(OfflineSyncService.getQueue().length);
            CloudStorageService.saveIncident(newInc).catch((e) => console.warn('Cloud save incident:', e));
          }}
          isOnline={isOnline}
        />
      )}

      {/* Scenario Simulator Modal */}
      {showSimulationModal && (
        <WhatIfSimulatorModal onClose={() => setShowSimulationModal(false)} />
      )}

      {/* District Intelligence Modal */}
      {selectedDistrictId && (
        <DistrictIntelligenceModal
          initialDistrictId={selectedDistrictId}
          onClose={() => setSelectedDistrictId(null)}
        />
      )}

      {/* Global Multi-Entity Search Modal */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        roads={roads}
        vehicles={vehicles}
        deliveries={deliveries}
        incidents={incidents}
        onSelectRoad={(r) => setSelectedRoad(r)}
        onSelectVehicle={(v) => {
          const r = (roads || []).find((road) => road.code === v.currentRoadCode);
          if (r) setSelectedRoad(r);
          setActiveTab('map');
        }}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
      />

      {/* Emergency Crisis Command Center Overlay */}
      {emergencyMode && (
        <EmergencyModeOverlay
          onClose={() => setEmergencyMode(false)}
          onCalculateMedicalConvoyRoute={() => {
            setEmergencyMode(false);
            setShowRouteComparison(true);
          }}
        />
      )}

      {/* Live Indian News & Roadblock Intelligence Modal */}
      <LiveNewsIntelligenceModal
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
        articles={newsArticles}
        roads={roads}
        onApplyNewsImpact={handleApplyNewsImpact}
        onApplyImpact={handleApplyNewsImpact}
        onShowOnMap={handleShowNewsOnMap}
        onAnalyzeCustomText={handleAnalyzeCustomNews}
        onAnalyzeCustom={handleAnalyzeCustomNews}
        onRefreshFeed={refreshData}
      />

      {/* System Guide & Map Legend Modal */}
      <GuideHelpModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        lang={lang}
        onOpenNewsRadar={() => {
          setShowGuideModal(false);
          setShowNewsModal(true);
        }}
        onOpenDemoWalkthrough={() => {
          setShowGuideModal(false);
          setShowDemoController(true);
        }}
      />
    </div>
  );
}
