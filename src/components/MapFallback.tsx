import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Road, Vehicle, Incident } from '../types';
import { isLatLng, normalizePath } from '../utils/mapCoordinates';

interface Props {
  roads: Road[];
  vehicles: Vehicle[];
  incidents: Incident[];
  center: { lat: number; lng: number };
  zoom: number;
  viewMode: 'Road Map' | 'Satellite' | 'Hybrid' | 'Terrain';
  facilities: { id: string; name: string; lat: number; lng: number; type: string }[];
  userLocation?: { lat: number; lng: number } | null;
  onSelectRoad?: (road: Road) => void;
  onSelectVehicle?: (vehicle: Vehicle) => void;
  onSelectIncident?: (incident: Incident) => void;
}

export function MapFallback({ roads, vehicles, incidents, center, zoom, viewMode, facilities, userLocation, onSelectRoad, onSelectVehicle, onSelectIncident }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current).setView([center.lat, center.lng], zoom);
    map.current = instance;
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      instance.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    setTileError(false);
    const layers = L.layerGroup().addTo(instance);
    const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
    const url = viewMode === 'Road Map' ? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      : esri + (viewMode === 'Terrain' ? 'World_Shaded_Relief' : 'World_Imagery') + '/MapServer/tile/{z}/{y}/{x}';
    L.tileLayer(url, {
      attribution: viewMode === 'Road Map' ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        : 'Tiles &copy; Esri; Sources: Esri, Maxar, Earthstar Geographics, USGS and the GIS User Community',
      maxNativeZoom: viewMode === 'Terrain' ? 13 : 19, maxZoom: 19
    }).on('tileerror', () => setTileError(true)).addTo(layers);
    if (viewMode === 'Hybrid' || viewMode === 'Terrain') {
      L.tileLayer(esri + 'Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19, attribution: 'Labels &copy; Esri and contributors'
      }).on('tileerror', () => setTileError(true)).addTo(layers);
    }
    return () => { layers.remove(); };
  }, [viewMode]);

  useEffect(() => {
    map.current?.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const layer = L.layerGroup().addTo(instance);
    facilities.forEach((facility) => {
      if (!isLatLng(facility)) return;
      const label = document.createElement('span');
      label.textContent = facility.name;
      L.circleMarker([facility.lat, facility.lng], { radius: 8, color: facility.type === 'hospital' ? '#be123c' : '#92400e', fillColor: '#fff', fillOpacity: 1 })
        .addTo(layer).bindTooltip(label).bindPopup(label.cloneNode(true) as HTMLElement);
    });
    if (isLatLng(userLocation)) L.circleMarker([userLocation.lat, userLocation.lng], { radius: 10, color: '#059669', fillOpacity: 1 }).addTo(layer).bindTooltip('Your location');
    roads.forEach((road) => {
      const coordinates = normalizePath(road.coordinates);
      if (coordinates.length < 2) return;
      const line = L.polyline(coordinates, {
        color: road.status === 'BLOCKED' ? '#dc2626' : road.status === 'HIGH_RISK' ? '#d97706' : '#059669',
        weight: 5
      }).addTo(layer);
      const label = document.createElement('span');
      label.textContent = road.code + ' — ' + road.name;
      line.bindTooltip(label).on('click', () => onSelectRoad?.(road));
    });
    vehicles.forEach((vehicle) => {
      if (!isLatLng(vehicle.currentLocation)) return;
      L.circleMarker([vehicle.currentLocation.lat, vehicle.currentLocation.lng], {
        radius: 7, color: '#1d4ed8', fillOpacity: 1
      }).addTo(layer).on('click', () => onSelectVehicle?.(vehicle));
    });
    incidents.forEach((incident) => {
      if (!isLatLng(incident)) return;
      L.circleMarker([incident.lat, incident.lng], {
        radius: 9, color: '#dc2626', fillOpacity: 0.8
      }).addTo(layer).on('click', () => onSelectIncident?.(incident));
    });
    return () => { layer.remove(); };
  }, [roads, vehicles, incidents, facilities, userLocation, onSelectRoad, onSelectVehicle, onSelectIncident]);

  return (
    <div className="relative isolate h-full w-full">
      <div ref={container} className="h-full w-full" aria-label="Interactive OpenStreetMap" />
      <div role="status" className="absolute left-12 right-3 top-3 z-[500] bg-white text-black border-2 border-black p-3 text-xs shadow-md">
        {tileError
          ? 'Map tiles could not load. Available roads and markers are still shown; check your connection.'
          : 'Interactive map. Traffic, Transit and 3D buttons open external map views (↗).'}
      </div>
    </div>
  );
}

export class MapErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  constructor(public props: React.PropsWithChildren) { super(props); }
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error('Map rendering failed:', error); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="border-2 border-black bg-white p-8 text-black space-y-3">
        <h2 className="font-bold">The map could not be displayed</h2>
        <p>Your session is still active. You can retry or use the other tabs.</p>
        <button className="bg-black text-white px-4 py-2" onClick={() => window.location.reload()}>Retry map</button>
      </div>
    );
  }
}
