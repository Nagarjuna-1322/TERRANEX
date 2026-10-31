export function isLatLng(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== 'object') return false;
  const { lat, lng } = value as { lat?: unknown; lng?: unknown };
  return typeof lat === 'number' && Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    typeof lng === 'number' && Number.isFinite(lng) && Math.abs(lng) <= 180;
}

export function normalizePath(value: unknown): [number, number][] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((point) => {
    const position = Array.isArray(point) ? { lat: point[0], lng: point[1] } : point;
    return isLatLng(position) ? [[position.lat, position.lng] as [number, number]] : [];
  });
}
