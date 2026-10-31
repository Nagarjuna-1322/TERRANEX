import React, { useEffect, useState } from 'react';
import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps';

export function GoogleMapLoader({ children, fallback, onUnavailable }: React.PropsWithChildren<{ fallback: React.ReactNode; onUnavailable: () => void }>) {
  const status = useApiLoadingStatus();
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (status === APILoadingStatus.LOADED) return;
    const timer = window.setTimeout(() => setTimedOut(true), 15000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE || timedOut) onUnavailable();
  }, [status, timedOut, onUnavailable]);

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE || timedOut) return fallback;
  if (status !== APILoadingStatus.LOADED) {
    return <div role="status" className="h-full flex items-center justify-center text-white">Loading map…</div>;
  }
  return children;
}
