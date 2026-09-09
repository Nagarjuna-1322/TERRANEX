import React, { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCw, Loader2, Check } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  pullPrompt?: string;
  releasePrompt?: string;
  refreshingPrompt?: string;
  containerId?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  className = '',
  pullPrompt = 'Pull down to refresh',
  releasePrompt = 'Release to refresh',
  refreshingPrompt = 'Updating live telemetry...',
  containerId
}) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [justRefreshed, setJustRefreshed] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>('Just now');

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const hasVibratedRef = useRef<boolean>(false);

  const THRESHOLD = 54;
  const MAX_PULL = 82;

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setPullDistance(THRESHOLD); // keep indicator visible during refresh

    const startTime = Date.now();
    try {
      await onRefresh();
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      // Ensure smooth animation: minimum 500ms spinner display
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, 500 - elapsed);
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setJustRefreshed(true);
        const now = new Date();
        setLastRefreshedAt(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
        setTimeout(() => setJustRefreshed(false), 2000);
      }, delay);
    }
  }, [onRefresh, isRefreshing]);

  // Touch Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop <= 1) {
      startYRef.current = e.touches[0].clientY;
      isDraggingRef.current = true;
      hasVibratedRef.current = false;
    } else {
      startYRef.current = null;
      isDraggingRef.current = false;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop > 1) {
      startYRef.current = null;
      isDraggingRef.current = false;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Damped non-linear resistance formula
      const damped = Math.min(MAX_PULL, Math.pow(diff, 0.82) * 1.6);
      setPullDistance(damped);

      if (damped >= THRESHOLD && !hasVibratedRef.current) {
        if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
          navigator.vibrate(12);
        }
        hasVibratedRef.current = true;
      }
    } else {
      setPullDistance(0);
    }
  };

  const onTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  };

  // Mouse Drag handlers for desktop / emulator preview testing
  const onMouseDown = (e: React.MouseEvent) => {
    if (isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop <= 1) {
      startYRef.current = e.clientY;
      isDraggingRef.current = true;
      hasVibratedRef.current = false;
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing) return;
    const container = containerRef.current;
    if (container && container.scrollTop > 1) {
      startYRef.current = null;
      isDraggingRef.current = false;
      setPullDistance(0);
      return;
    }

    const diff = e.clientY - startYRef.current;
    if (diff > 0) {
      const damped = Math.min(MAX_PULL, Math.pow(diff, 0.82) * 1.6);
      setPullDistance(damped);
    } else {
      setPullDistance(0);
    }
  };

  const onMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  };

  const isReadyToRelease = pullDistance >= THRESHOLD;
  const rotationAngle = Math.min(360, (pullDistance / THRESHOLD) * 270);

  return (
    <div
      id={containerId}
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      className={`relative select-none ${className}`}
    >
      {/* Pull Indicator Header */}
      <div
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 4 ? 1 : 0,
          transition: isDraggingRef.current ? 'none' : 'height 0.25s ease-out, opacity 0.2s'
        }}
        className="w-full overflow-hidden flex items-center justify-center pointer-events-none"
      >
        <div className="flex items-center gap-2 px-3 py-1 bg-black text-white border-2 border-black shadow-[2px_2px_0px_#ff3e00] rounded-full text-xs font-mono font-bold">
          {isRefreshing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-[#ff3e00] animate-spin" />
              <span className="text-[11px]">{refreshingPrompt}</span>
            </>
          ) : isReadyToRelease ? (
            <>
              <RotateCw className="w-3.5 h-3.5 text-[#ff3e00] transition-transform rotate-180" />
              <span className="text-[11px] text-[#ff3e00]">{releasePrompt}</span>
            </>
          ) : (
            <>
              <RotateCw
                className="w-3.5 h-3.5 text-neutral-400"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              />
              <span className="text-[11px] text-neutral-300">{pullPrompt}</span>
            </>
          )}
        </div>
      </div>

      {/* Success Banner when just refreshed */}
      {justRefreshed && (
        <div className="mx-1 mb-2 px-2.5 py-1 bg-emerald-50 border border-emerald-600 text-emerald-900 text-[10px] font-mono font-bold flex items-center justify-between shadow-[1px_1px_0px_#000] animate-fade-in">
          <div className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Telemetry updated live</span>
          </div>
          <span className="text-neutral-500 font-normal">Synced {lastRefreshedAt}</span>
        </div>
      )}

      {/* Content wrapper */}
      <div
        style={{
          transform: isDraggingRef.current ? `translateY(${Math.min(16, pullDistance * 0.25)}px)` : 'none',
          transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
