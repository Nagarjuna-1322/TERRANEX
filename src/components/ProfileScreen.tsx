import React, { useState, useEffect } from 'react';
import { User, UserRole, AuditLog } from '../types';
import { Language, TRANSLATIONS } from '../translations';
import { OfflineSyncService, OfflineQueueItem } from '../services/offlineSync';
import { api } from '../services/api';
import {
  Globe,
  Database,
  History,
  LogOut,
  RotateCw,
  Trash2
} from 'lucide-react';

interface ProfileScreenProps {
  currentUser: User;
  onLogout: () => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  onSwitchRole: (role: UserRole) => void;
  isOnline: boolean;
  onSyncNow: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  currentUser,
  onLogout,
  lang,
  onLangChange,
  onSwitchRole,
  isOnline,
  onSyncNow
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [offlineItems, setOfflineItems] = useState<OfflineQueueItem[]>([]);
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  useEffect(() => {
    // Load audit logs from backend
    api.getAuditLogs().then((res) => {
      if (res.logs) setAuditLogs(res.logs);
    });
    setOfflineItems(OfflineSyncService.getQueue());
  }, []);

  const handleClearOfflineQueue = () => {
    OfflineSyncService.clearQueue();
    setOfflineItems([]);
  };

  const roleLabels: Record<UserRole, string> = {
    authority: t.roles.authority,
    field_officer: t.roles.field_officer,
    driver: t.roles.driver,
    analyst: t.roles.analyst
  };

  return (
    <div className="space-y-5 pb-20 text-[#0a0a0a] font-mono">
      {/* Profile Header */}
      <div className="p-5 bg-white border-2 border-black shadow-[4px_4px_0px_#0a0a0a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 bg-[#ff3e00] border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-center justify-center font-mono font-black text-2xl text-white">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-black uppercase tracking-tight">{currentUser.name}</h1>
              <span className="px-2 py-0.5 bg-[#f4f4f4] text-black border-2 border-black font-mono text-[10px] font-black uppercase shadow-[2px_2px_0px_#0a0a0a]">
                {roleLabels[currentUser.role] || currentUser.role}
              </span>
            </div>
            <div className="text-xs text-neutral-600 font-mono font-bold mt-0.5 uppercase">
              {t.profile.employeeId}: {currentUser.employeeId} • {currentUser.organization}
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 bg-white hover:bg-neutral-100 text-black border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-xs font-black uppercase transition flex items-center gap-1.5 self-stretch sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#ff3e00]" />
          {t.actions.logout}
        </button>
      </div>

      {/* Role Quick Switcher (SIH Evaluation Tool) */}
      <div className="p-4 bg-[#f4f4f4] border-2 border-black space-y-2 shadow-[3px_3px_0px_#0a0a0a]">
        <span className="text-[11px] font-black text-black uppercase tracking-wider font-mono block">
          {t.profile.roleSimulation}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { role: 'authority' as UserRole, label: t.roles.authority },
            { role: 'field_officer' as UserRole, label: t.roles.field_officer },
            { role: 'driver' as UserRole, label: t.roles.driver },
            { role: 'analyst' as UserRole, label: t.roles.analyst }
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => onSwitchRole(item.role)}
              className={`p-2.5 border-2 border-black transition font-black uppercase shadow-[2px_2px_0px_#0a0a0a] text-[11px] ${
                currentUser.role === item.role
                  ? 'bg-[#ff3e00] text-white'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language & Preferences */}
      <div className="p-5 bg-white border-2 border-black space-y-3 shadow-[3px_3px_0px_#0a0a0a]">
        <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-black font-mono">
          <Globe className="w-4 h-4 text-[#ff3e00]" /> {t.profile.localizationTitle}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { code: 'en' as Language, name: 'English' },
            { code: 'hi' as Language, name: 'हिन्दी (Hindi)' },
            { code: 'as' as Language, name: 'অসমীয়া (Assamese)' }
          ].map((l) => (
            <button
              key={l.code}
              onClick={() => onLangChange(l.code)}
              className={`p-3 border-2 border-black text-center transition font-black uppercase shadow-[2px_2px_0px_#0a0a0a] ${
                lang === l.code
                  ? 'bg-[#ff3e00] text-white'
                  : 'bg-[#f4f4f4] text-black hover:bg-neutral-200'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Data & Sync Status */}
      <div className="p-5 bg-white border-2 border-black space-y-3 shadow-[3px_3px_0px_#0a0a0a]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-black font-mono">
            <Database className="w-4 h-4 text-[#ff3e00]" /> {t.profile.offlineSyncTitle}
          </div>
          <span className="text-xs font-mono font-bold text-neutral-700 uppercase">
            {t.offline.pendingQueue}: <strong className="text-black font-black">{offlineItems.length}</strong> {t.offline.itemsCount}
          </span>
        </div>

        <p className="text-xs text-neutral-700 font-medium leading-relaxed">
          {t.offline.cacheInfo}
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <button
            onClick={onSyncNow}
            disabled={!isOnline || offlineItems.length === 0}
            className="px-4 py-2 bg-[#ff3e00] hover:bg-black disabled:opacity-40 text-white font-black font-mono border-2 border-black shadow-[2px_2px_0px_#0a0a0a] transition flex items-center gap-1.5 uppercase text-xs"
          >
            <RotateCw className="w-3.5 h-3.5" /> {t.offline.syncNow} ({offlineItems.length})
          </button>

          {offlineItems.length > 0 && (
            <button
              onClick={handleClearOfflineQueue}
              className="px-3 py-2 bg-white hover:bg-neutral-100 border-2 border-black shadow-[2px_2px_0px_#0a0a0a] text-red-600 font-mono text-xs font-black uppercase transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t.offline.clearQueue}
            </button>
          )}
        </div>
      </div>

      {/* Immutable Audit Trail Log (Section 37) */}
      <div className="p-5 bg-white border-2 border-black space-y-3 shadow-[3px_3px_0px_#0a0a0a]">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-black font-mono">
            <History className="w-4 h-4 text-[#ff3e00]" /> {t.profile.auditTrailTitle}
          </div>
          <span className="text-[10px] font-mono text-neutral-600 font-bold uppercase">{t.profile.traceabilityRecord}</span>
        </div>

        <div className="space-y-2 text-xs max-h-56 overflow-y-auto font-mono">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-[#f4f4f4] border-2 border-black shadow-[2px_2px_0px_#0a0a0a] flex items-start justify-between gap-2"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-black uppercase">{log.action}</span>
                  <span className="text-[10px] text-neutral-600 uppercase font-bold">by {log.actor}</span>
                </div>
                <p className="text-[11px] text-neutral-700 font-medium mt-0.5">{log.details}</p>
              </div>
              <span className="text-[10px] text-neutral-600 shrink-0 font-bold">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
