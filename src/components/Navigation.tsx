import React from 'react';
import { User } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import {
  Home,
  Map,
  Truck,
  Bell,
  User as UserIcon,
  PlusCircle,
  Navigation as NavIcon,
  Radio,
  Globe,
  Sparkles,
  Search,
  Wifi,
  WifiOff,
  HelpCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

export interface NavigationProps {
  currentUser: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  isOnline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  emergencyMode: boolean;
  onToggleEmergency: () => void;
  onOpenSearch: () => void;
  onOpenAssistant?: () => void;
  unreadAlertCount: number;
  simpleMode: boolean;
  onToggleSimpleMode: () => void;
  onOpenNewsRadar?: () => void;
  activeNewsDisruptionsCount?: number;
  isWideLayout?: boolean;
  onToggleWideLayout?: () => void;
  onOpenGuide?: () => void;
  onOpenDemo?: () => void;
}

export interface NavTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  isLive?: boolean;
  badge?: number;
  hint?: string;
}

// Helper to get unified navigation tabs for bottom dock
export const getNavigationTabs = (
  currentUser: User,
  simpleMode: boolean,
  lang: Language,
  unreadAlertCount: number
): NavTabItem[] => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if (simpleMode) {
    return [
      { id: 'home', label: t.nav.home || 'Home', icon: Home, hint: 'Overview' },
      { id: 'map', label: t.nav.map || 'Live GIS Map', icon: Map, isLive: true, hint: 'Corridors' },
      { id: 'report', label: t.nav.report || 'Report', icon: PlusCircle, highlight: true, hint: 'Ground SOS' },
      { id: 'help', label: t.nav.help || 'Emergency', icon: Radio, hint: '112 / BRO' },
      { id: 'profile', label: t.nav.profile || 'Profile', icon: UserIcon, hint: 'Settings' }
    ];
  }

  if (currentUser.role === 'field_officer') {
    return [
      { id: 'home', label: t.nav.home || 'Home', icon: Home, hint: 'Command Hub' },
      { id: 'map', label: t.nav.map || 'Live GIS Map', icon: Map, isLive: true, hint: 'Tactical GIS' },
      { id: 'report', label: t.nav.report || 'Report', icon: PlusCircle, highlight: true, hint: 'Hazard Log' },
      { id: 'alerts', label: t.nav.alerts || 'Alerts', icon: Bell, badge: unreadAlertCount, hint: 'Disruptions' },
      { id: 'profile', label: t.nav.profile || 'Profile', icon: UserIcon, hint: 'Field Officer' }
    ];
  }

  if (currentUser.role === 'driver') {
    return [
      { id: 'home', label: t.nav.home || 'Home', icon: Home, hint: 'Cab Overview' },
      { id: 'map', label: t.nav.map || 'Live GIS Map', icon: Map, isLive: true, hint: 'GPS Radar' },
      { id: 'route', label: t.nav.route || 'Routes', icon: NavIcon, highlight: true, hint: 'Navigation' },
      { id: 'alerts', label: t.nav.alerts || 'Alerts', icon: Bell, badge: unreadAlertCount, hint: 'Hazards' },
      { id: 'profile', label: t.nav.profile || 'Profile', icon: UserIcon, hint: 'Convoy Pilot' }
    ];
  }

  // Default & Authority / Administration
  return [
    { id: 'home', label: t.nav.home || 'Home', icon: Home, hint: 'Command Center' },
    { id: 'map', label: t.nav.map || 'Live GIS Map', icon: Map, isLive: true, hint: 'All Corridors' },
    { id: 'route', label: t.nav.route || 'Routes', icon: NavIcon, hint: 'Route Matrix' },
    { id: 'alerts', label: t.nav.alerts || 'Alerts', icon: Bell, badge: unreadAlertCount, hint: 'Alert Feed' },
    { id: 'profile', label: t.nav.profile || 'Profile', icon: UserIcon, hint: 'Roles' }
  ];
};

/**
 * Top Header Navigation with Prominent Language Selector
 */
export const TopNavigation: React.FC<NavigationProps> = ({
  currentUser,
  lang,
  onLangChange,
  isOnline,
  onToggleOffline,
  pendingSyncCount,
  emergencyMode,
  onToggleEmergency,
  onOpenSearch,
  simpleMode,
  onToggleSimpleMode,
  isWideLayout = false,
  onToggleWideLayout,
  onOpenGuide,
  onOpenDemo
}) => {
  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-40 w-full bg-[#f8f9fa] border-b-2 border-black px-2.5 sm:px-4 py-2 flex flex-col gap-2 shadow-xs select-none"
    >
      {/* Top Bar: TerraNex Name, Citizen/Officer Badge & Language Selector */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: App Branding & Role Mode */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#ff3e00] text-white flex items-center justify-center font-black font-mono text-sm tracking-tighter border-2 border-black shadow-[1.5px_1.5px_0px_#0a0a0a]">
            TNX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-black tracking-tight text-[#0a0a0a] uppercase font-sans leading-none">
                TerraNex
              </span>
              <button
                type="button"
                id="btn-toggle-role-mode"
                onClick={onToggleSimpleMode}
                className="px-1.5 py-0.5 bg-black hover:bg-neutral-800 text-white text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer transition shadow-[1px_1px_0px_#ff3e00]"
                title="Tap to switch between Citizen Mode and Tactical Officer Mode"
              >
                {simpleMode ? '🟢 Citizen' : '⚙️ Officer'}
              </button>
            </div>
            <p className="text-[10px] font-bold text-neutral-500 hidden sm:block">
              Northeast Corridor Command
            </p>
          </div>
        </div>

        {/* Right: Language Selector */}
        <div
          id="top-language-selector"
          className="flex items-center bg-white border-2 border-black p-0.5 shadow-[2px_2px_0px_#0a0a0a] shrink-0"
        >
          <div className="flex items-center gap-1 px-1.5 py-0.5 text-[#ff3e00]">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-black hidden sm:inline">
              Language:
            </span>
          </div>
          <div className="flex items-center gap-0.5 font-sans">
            {[
              { code: 'en' as Language, short: 'EN', full: 'English' },
              { code: 'hi' as Language, short: 'हि', full: 'हिन्दी' },
              { code: 'as' as Language, short: 'অ', full: 'অসমীয়া' }
            ].map((item) => {
              const isSelected = lang === item.code;
              return (
                <button
                  key={item.code}
                  id={`top-lang-switch-${item.code}`}
                  type="button"
                  onClick={() => onLangChange(item.code)}
                  className={`px-2 py-0.5 text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white font-black shadow-[1px_1px_0px_#ff3e00]'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-black'
                  }`}
                  title={`Switch Language to ${item.full} / भाषा बदलें`}
                >
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.full}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Small Box Below the Name of TerraNex: Contains [ Guide | Demo | View Mode | Wifi | Search | SOS ] */}
      <div
        id="terranex-tools-box"
        className="w-full bg-white border-2 border-black p-1 sm:p-1.5 shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none touch-pan-x"
      >
        {/* 1. Guide Button */}
        {onOpenGuide && (
          <button
            id="btn-header-guide"
            type="button"
            onClick={onOpenGuide}
            className="px-2 py-1 bg-white hover:bg-neutral-100 border border-black text-xs font-mono font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0 transition"
            title="Open TerraNex Guide & Status Legend"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#ff3e00]" />
            <span>Guide</span>
          </button>
        )}

        {/* 2. Demo Walkthrough Button */}
        {onOpenDemo && (
          <button
            id="btn-header-demo"
            type="button"
            onClick={onOpenDemo}
            className="px-2 py-1 bg-[#171717] hover:bg-black text-white border border-black text-xs font-mono font-black flex items-center gap-1 shadow-[2px_2px_0px_#ff3e00] cursor-pointer shrink-0 transition"
            title="Open 10-Step Interactive SIH Walkthrough"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Demo</span>
          </button>
        )}

        {/* 3. Mobile Phone vs Wide View Layout Toggle */}
        {onToggleWideLayout && (
          <button
            id="btn-header-compact-toggle"
            type="button"
            onClick={onToggleWideLayout}
            className="px-2 py-1 bg-white hover:bg-neutral-100 border border-black text-xs font-mono font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0 transition"
            title={isWideLayout ? 'Switch to Mobile Smartphone Frame' : 'Switch to Wide Dashboard View'}
          >
            {isWideLayout ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#ff3e00]" />
                <span>Mobile</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-neutral-800" />
                <span>Wide</span>
              </>
            )}
          </button>
        )}

        {/* 4. Offline / Online Sync Indicator Button */}
        <button
          id="btn-header-wifi-toggle"
          type="button"
          onClick={onToggleOffline}
          className={`px-2 py-1 border border-black text-xs font-mono font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0 transition ${
            isOnline
              ? 'bg-[#d1fae5] hover:bg-[#a7f3d0] text-emerald-900'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900 animate-pulse'
          }`}
          title={isOnline ? 'Online mode active (Click to simulate offline mountain corridor)' : 'Offline mode active (Click to reconnect)'}
        >
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-amber-700" />
          )}
          {pendingSyncCount > 0 && (
            <span className="px-1 bg-amber-500 text-white text-[8px] font-black border border-black">
              {pendingSyncCount}
            </span>
          )}
        </button>

        {/* 5. Quick Search Button */}
        <button
          id="btn-header-search"
          type="button"
          onClick={onOpenSearch}
          className="w-7 h-7 bg-white hover:bg-neutral-100 border border-black flex items-center justify-center shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0 transition"
          title="Search highways, vehicles, and alerts"
        >
          <Search className="w-3.5 h-3.5 text-black" />
        </button>

        {/* 6. Emergency SOS Button */}
        <button
          id="btn-toggle-emergency"
          type="button"
          onClick={onToggleEmergency}
          className={`px-2.5 sm:px-3 py-1 border-2 border-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition ${
            emergencyMode
              ? 'bg-[#ff3e00] text-white animate-pulse shadow-[2px_2px_0px_#0a0a0a]'
              : 'bg-red-600 text-white hover:bg-red-700 shadow-[2px_2px_0px_#0a0a0a]'
          }`}
          title="Emergency SOS Broadcast"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>SOS</span>
        </button>
      </div>
    </header>
  );
};

/**
 * Bottom Navigation Dock - Kept at bottom on all devices so users can simply switch
 * between Home, Live GIS Maps, Routes, Alerts, and Profile.
 */
export const BottomNavigation: React.FC<NavigationProps> = ({
  currentUser,
  currentTab,
  onTabChange,
  lang,
  unreadAlertCount,
  simpleMode
}) => {
  const navTabs = getNavigationTabs(currentUser, simpleMode, lang, unreadAlertCount);

  return (
    <div
      id="app-bottom-nav-container"
      className="w-full bg-white border-t-2 border-black shadow-[0px_-4px_20px_rgba(0,0,0,0.14)] shrink-0 z-40 sticky bottom-0"
    >
      <nav
        id="app-bottom-nav"
        aria-label="Bottom Navigation Tabs"
        className="w-full flex items-stretch justify-between"
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-bottom-${tab.id}`}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 sm:py-2.5 px-1 min-h-[54px] sm:min-h-[58px] transition-all cursor-pointer border-r last:border-r-0 border-neutral-200 select-none ${
                tab.highlight && !isActive
                  ? 'bg-neutral-900 text-white hover:bg-black'
                  : isActive
                  ? 'bg-[#0a0a0a] text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black'
              }`}
            >
              {/* Top Accent Line for Active Tab */}
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-1 bg-[#ff3e00]" />
              )}

              {/* Icon with Badges & Live Status */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform ${
                    isActive ? 'text-[#ff3e00] scale-105 stroke-[2.4]' : 'stroke-[1.9]'
                  }`}
                />

                {/* Pulse Green Indicator for Live GIS Map */}
                {tab.isLive && (
                  <span
                    className="absolute -top-1 -right-2 flex h-2 w-2"
                    title="Live satellite GIS active"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}

                {/* Unread Alert Badge */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-3 bg-[#ff3e00] text-white text-[9px] font-black px-1.5 py-0.2 rounded-full border border-black font-mono leading-tight animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Tab Title Label */}
              <span
                className={`text-[10px] sm:text-xs tracking-tight mt-1 whitespace-nowrap font-mono uppercase ${
                  isActive ? 'font-black text-white' : 'font-bold text-neutral-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Smartphone Bottom Home Indicator Bar */}
      <div className="w-full pb-1.5 pt-1 flex justify-center items-center bg-white border-t border-neutral-100">
        <div className="w-28 h-1 bg-neutral-950/30 rounded-full" />
      </div>
    </div>
  );
};

/**
 * Composite Navigation (default export for backwards compatibility)
 */
export const Navigation: React.FC<NavigationProps> = (props) => {
  return (
    <>
      <TopNavigation {...props} />
      <BottomNavigation {...props} />
    </>
  );
};

