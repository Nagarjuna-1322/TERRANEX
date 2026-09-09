import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, BatteryCharging, Signal } from 'lucide-react';

interface MobileStatusBarProps {
  isOnline: boolean;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ isOnline }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#0a0a0a] text-white px-4 py-1.5 flex items-center justify-between text-[11px] font-mono select-none z-50">
      {/* Time & Location Carrier */}
      <div className="flex items-center gap-1.5 font-black">
        <span>{timeStr || '09:41 AM'}</span>
        <span className="text-[9px] px-1 py-0.2 bg-neutral-800 text-neutral-300 font-bold uppercase tracking-wider">
          NER 5G
        </span>
      </div>

      {/* Dynamic Camera Notch Center */}
      <div className="hidden sm:flex items-center justify-center">
        <div className="w-16 h-3.5 bg-neutral-900 border border-neutral-700 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-neutral-600"></div>
        </div>
      </div>

      {/* Hardware Status: Signal, Network, Battery */}
      <div className="flex items-center gap-2 text-neutral-200">
        <Signal className="w-3.5 h-3.5 text-neutral-100" />
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        )}
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-bold">96%</span>
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
