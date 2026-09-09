import React, { useState, useMemo } from 'react';
import { Road, Vehicle, Delivery, Incident } from '../types';
import { Search, Truck, Navigation, AlertTriangle, MapPin, X, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  roads: Road[];
  vehicles: Vehicle[];
  deliveries: Delivery[];
  incidents: Incident[];
  onSelectRoad: (road: Road) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onSelectIncident: (incident: Incident) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  roads,
  vehicles,
  deliveries,
  incidents,
  onSelectRoad,
  onSelectVehicle,
  onSelectIncident
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return { roads: [], vehicles: [], deliveries: [], incidents: [] };
    const q = query.toLowerCase();

    return {
      roads: roads.filter(
        (r) =>
          r.code.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.state.toLowerCase().includes(q) ||
          r.districts.some((d) => d.toLowerCase().includes(q))
      ),
      vehicles: vehicles.filter(
        (v) =>
          v.vehicleNumber.toLowerCase().includes(q) ||
          v.cargo.toLowerCase().includes(q) ||
          v.driverName.toLowerCase().includes(q) ||
          v.destination.toLowerCase().includes(q)
      ),
      deliveries: deliveries.filter(
        (d) =>
          d.deliveryCode.toLowerCase().includes(q) ||
          d.cargo.toLowerCase().includes(q) ||
          d.destination.toLowerCase().includes(q) ||
          d.origin.toLowerCase().includes(q)
      ),
      incidents: incidents.filter(
        (i) =>
          i.incidentCode.toLowerCase().includes(q) ||
          i.type.toLowerCase().includes(q) ||
          i.roadCode.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      )
    };
  }, [query, roads, vehicles, deliveries, incidents]);

  if (!isOpen) return null;

  const totalHits =
    searchResults.roads.length +
    searchResults.vehicles.length +
    searchResults.deliveries.length +
    searchResults.incidents.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
      <div className="w-full max-w-2xl bg-white border-2 border-black shadow-[6px_6px_0px_#0a0a0a] overflow-hidden text-[#0a0a0a]">
        {/* Search Bar Input */}
        <div className="p-3.5 bg-[#f4f4f4] border-b-2 border-black flex items-center gap-3">
          <Search className="w-5 h-5 text-[#ff3e00] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search NH-13, TNX-1042, Anti-Venom, Tawang, Landslide..."
            className="w-full bg-transparent text-sm sm:text-base text-[#0a0a0a] focus:outline-none placeholder:text-neutral-500 font-bold font-mono uppercase"
          />
          {query && (
            <button onClick={() => setQuery('')} className="px-2 py-1 bg-white border border-black text-black font-bold uppercase text-[10px]">
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-neutral-100 text-black shadow-[2px_2px_0px_#0a0a0a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-8 text-center text-neutral-500 space-y-1">
              <p className="font-bold">Type to search across road corridors, logistics vehicles, incidents, and supplies.</p>
              <p className="text-[11px] font-mono">Example: "TNX-1042", "NH-13", "Landslide", "Tawang"</p>
            </div>
          ) : totalHits === 0 ? (
            <div className="py-8 text-center text-neutral-600 font-bold">
              No results found for "<span className="text-[#ff3e00]">{query}</span>"
            </div>
          ) : (
            <>
              {/* Vehicles */}
              {searchResults.vehicles.length > 0 && (
                <div>
                  <span className="text-[10px] font-black text-black font-mono uppercase tracking-wider block mb-1.5">
                    Vehicles ({searchResults.vehicles.length})
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.vehicles.map((v) => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectVehicle(v);
                          onClose();
                        }}
                        className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-50 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Truck className="w-4 h-4 text-[#ff3e00]" />
                          <div>
                            <span className="font-mono font-black text-black">{v.vehicleNumber}</span>
                            <span className="text-neutral-600 ml-2 font-bold uppercase truncate">Cargo: {v.cargo}</span>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px]">
                          <span className="text-black font-bold">ETA: {v.eta}</span>
                          <span className="text-neutral-500 ml-2 font-bold uppercase">({v.status})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Roads */}
              {searchResults.roads.length > 0 && (
                <div>
                  <span className="text-[10px] font-black text-black font-mono uppercase tracking-wider block mb-1.5">
                    Road Corridors ({searchResults.roads.length})
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.roads.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => {
                          onSelectRoad(r);
                          onClose();
                        }}
                        className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-50 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Navigation className="w-4 h-4 text-[#ff3e00]" />
                          <div>
                            <span className="font-mono font-black text-black">{r.code}</span>
                            <span className="text-neutral-600 ml-2 font-bold uppercase">{r.name}</span>
                          </div>
                        </div>
                        <span
                          className={`font-mono text-[10px] font-black px-2 py-0.5 border border-black uppercase tracking-wider ${
                            r.status === 'BLOCKED'
                              ? 'bg-[#ff3e00] text-white'
                              : r.status === 'HIGH_RISK'
                              ? 'bg-amber-400 text-black'
                              : 'bg-black text-white'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incidents */}
              {searchResults.incidents.length > 0 && (
                <div>
                  <span className="text-[10px] font-black text-[#ff3e00] font-mono uppercase tracking-wider block mb-1.5">
                    Field Disruption Incidents ({searchResults.incidents.length})
                  </span>
                  <div className="space-y-1.5">
                    {searchResults.incidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => {
                          onSelectIncident(inc);
                          onClose();
                        }}
                        className="p-2.5 bg-white border-2 border-black shadow-[2px_2px_0px_#0a0a0a] hover:bg-neutral-50 cursor-pointer flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-[#ff3e00]" />
                          <div>
                            <span className="font-mono font-black text-black">{inc.incidentCode}</span>
                            <span className="text-neutral-700 ml-2 font-bold uppercase">
                              {inc.type} on {inc.roadCode}
                            </span>
                          </div>
                        </div>
                        <span className="text-black font-mono text-[10px] font-black border border-black px-1.5 py-0.5 bg-neutral-100 uppercase">{inc.severity} Severity</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
