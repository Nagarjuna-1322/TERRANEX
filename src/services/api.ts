import { auth, signInWithEmail, registerWithEmail, sendPasswordReset } from './firebase';
import {
  Road,
  Vehicle,
  Delivery,
  Incident,
  IncidentType,
  IncidentSeverity,
  IncidentMediaItem,
  Alert,
  WeatherData,
  DistrictResilience,
  SimulationParams,
  SimulationResult,
  AuditLog,
  NewsArticle
} from '../types';
const API_BASE = '/api';

/** Authenticated API requests fail explicitly without simulating successful operations. */
async function safeFetch<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  const user = auth?.currentUser;
  if (user) headers.set('Authorization', 'Bearer ' + await user.getIdToken());
  const res = await fetch(url, { ...init, headers, signal: init?.signal || AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error('Request failed (' + res.status + '). Please check your permissions and connection.');
  if (!(res.headers.get('content-type') || '').includes('application/json')) throw new Error('Invalid API response');
  return await res.json() as T;
}

export const api = {
  // Firebase is the only credential authority. API failures never create sessions.
  login: async (email = '', password = '', _role?: string) => signInWithEmail(email, password),
  register: async (data: { email: string; password: string; name?: string }) => registerWithEmail(data),
  forgotPassword: async (identifier: string) => sendPasswordReset(identifier),
  verifyOtp: async (_otp: string, _newPassword?: string): Promise<{ success: boolean; message: string; error?: string }> => ({ success: false, message: 'Use the Firebase password reset link sent to your email.' }),

  // Dashboard
  getDashboard: async () => {
    return safeFetch(
      `${API_BASE}/dashboard`,
      undefined
    );
  },

  // Roads
  getRoads: async () => {
    return safeFetch<{ roads: Road[] }>(
      `${API_BASE}/roads`,
      undefined
    );
  },

  getRoad: async (id: string) => {
    return safeFetch<{ road: Road }>(
      `${API_BASE}/roads/${encodeURIComponent(id)}`,
      undefined
    );
  },

  updateRoadStatus: async (
    id: string,
    statusOrData: string | { status?: string; accessibility?: string; riskScore?: number; reason?: string; officerName?: string },
    accessibility?: string
  ) => {
    const body = typeof statusOrData === 'string'
      ? { status: statusOrData, accessibility: accessibility || statusOrData }
      : statusOrData;

    return safeFetch<{ success: boolean; road: Road }>(
      `${API_BASE}/roads/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );
  },

  getInitialData: async () => {
    const [roads, vehicles, deliveries, incidents, alerts, weather, dashboard] = await Promise.all([
      api.getRoads(), api.getVehicles(), api.getDeliveries(), api.getIncidents(), api.getAlerts(), api.getWeather(), api.getDashboard()
    ]);
    return { roads: roads.roads, vehicles: vehicles.vehicles, deliveries: deliveries.deliveries,
      incidents: incidents.incidents, alerts: alerts.alerts, weather: weather.weather, dashboard };
  },

  // Vehicles
  getVehicles: async () => {
    return safeFetch<{ vehicles: Vehicle[] }>(
      `${API_BASE}/vehicles`,
      undefined
    );
  },

  getVehicle: async (id: string) => {
    return safeFetch<{ vehicle: Vehicle }>(
      `${API_BASE}/vehicles/${encodeURIComponent(id)}`,
      undefined
    );
  },

  updateVehicleLocation: async (id: string, location: { lat: number; lng: number; speedKmH?: number; heading?: number }) => {
    return safeFetch<{ success: boolean; vehicle: Vehicle }>(
      `${API_BASE}/vehicles/${encodeURIComponent(id)}/location`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      }
    );
  },

  // Deliveries
  getDeliveries: async () => {
    return safeFetch<{ deliveries: Delivery[] }>(
      `${API_BASE}/deliveries`,
      undefined
    );
  },

  getDelivery: async (id: string) => {
    return safeFetch<{ delivery: Delivery }>(
      `${API_BASE}/deliveries/${encodeURIComponent(id)}`,
      undefined
    );
  },

  // Incidents
  getIncidents: async () => {
    return safeFetch<{ incidents: Incident[] }>(
      `${API_BASE}/incidents`,
      undefined
    );
  },

  createIncident: async (incidentData: Partial<Incident>) => {
    return safeFetch<{ success: boolean; incident: Incident }>(
      `${API_BASE}/incidents`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      }
    );
  },

  getIncidentMedia: async (incident: Incident): Promise<{ success: boolean; media: IncidentMediaItem[] }> => {
    return safeFetch(
      `${API_BASE}/incidents/${incident.id}/media`,
      undefined
    );
  },

  classifyIncidentAi: async (data: { description: string; roadCode?: string; lat?: number; lng?: number; imageBase64?: string }): Promise<{
    success: boolean;
    aiClassification: {
      incidentType: IncidentType;
      severity: IncidentSeverity;
      roadImpact: 'NO_IMPACT' | 'PARTIAL_RESTRICTION' | 'FULL_BLOCKAGE';
      confidence: number;
      recommendedAction: string;
    };
  }> => {
    return safeFetch(
      `${API_BASE}/incidents/ai-classify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }
    );
  },

  // Routing
  optimizeRoute: async (params?: any) => {
    return safeFetch(
      `${API_BASE}/routes/optimize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params || {})
      }
    );
  },

  rerouteVehicle: async (vehicleId: string, routeId: string, reason?: string) => {
    return safeFetch<{ success: boolean; vehicle: Vehicle; delivery?: Delivery }>(
      `${API_BASE}/routes/reroute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, routeId, reason })
      }
    );
  },

  // Weather & Risk
  getWeather: async () => {
    return safeFetch<{ weather: WeatherData[] }>(
      `${API_BASE}/weather`,
      undefined
    );
  },

  getRiskCorridors: async () => {
    return safeFetch(
      `${API_BASE}/risk/corridors`,
      undefined
    );
  },

  // Alerts
  getAlerts: async (role: string = 'authority') => {
    return safeFetch<{ alerts: Alert[] }>(
      `${API_BASE}/alerts?role=${encodeURIComponent(role)}`,
      undefined
    );
  },

  createAlert: async (alertData: Partial<Alert>) => {
    return safeFetch<{ success: boolean; alert: Alert }>(
      `${API_BASE}/alerts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      }
    );
  },

  acknowledgeAlert: async (id: string) => {
    return safeFetch(
      `${API_BASE}/alerts/${encodeURIComponent(id)}/read`,
      { method: 'PATCH' }
    );
  },

  // Offline Sync
  syncOfflineQueue: async (items: any[]): Promise<{
    success: boolean;
    syncedCount: number;
    syncedIds: string[];
    timestamp: string;
  }> => {
    return safeFetch(
      `${API_BASE}/sync`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      }
    );
  },

  // Simulation
  runSimulation: async (params: SimulationParams): Promise<{
    success: boolean;
    result: SimulationResult;
  }> => {
    return safeFetch(
      `${API_BASE}/simulation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      }
    );
  },

  // Districts
  getDistricts: async () => {
    return safeFetch(
      `${API_BASE}/districts`,
      undefined
    );
  },

  getDistrictIntelligence: async (id: string) => {
    return safeFetch(
      `${API_BASE}/districts/${encodeURIComponent(id)}/intelligence`,
      undefined
    );
  },

  // Analytics & Audit
  getAnalytics: async () => {
    return safeFetch(
      `${API_BASE}/analytics`,
      undefined
    );
  },

  getAuditLogs: async (): Promise<{ auditLogs: AuditLog[] }> => {
    return safeFetch(
      `${API_BASE}/audit-logs`,
      undefined
    );
  },

  // Emergency Mode
  toggleEmergencyMode: async () => {
    return safeFetch(
      `${API_BASE}/emergency-mode`,
      { method: 'POST' }
    );
  },

  // AI Assistant
  askAssistant: async (
    question: string,
    history?: Array<{ sender: 'user' | 'assistant'; text: string }>,
    lang?: string
  ): Promise<{ answer: string }> => {
    return safeFetch(
      `${API_BASE}/ai/assistant`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, lang })
      }
    );
  },

  // SIH Demo Steps
  triggerDemoStep: async (step: number) => {
    return safeFetch(
      `${API_BASE}/demo/step`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step })
      }
    );
  },

  resetDemo: async () => {
    return safeFetch(
      `${API_BASE}/demo/reset`,
      { method: 'POST' }
    );
  },

  // News Intelligence Endpoints
  getNews: async () => {
    return safeFetch<{ articles: NewsArticle[] }>(
      `${API_BASE}/news`,
      undefined
    );
  },

  analyzeNews: async (text: string, source?: string) => {
    return safeFetch<{ success: boolean; article: NewsArticle }>(
      `${API_BASE}/news/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source })
      }
    );
  },

  applyNewsImpact: async (articleId: string) => {
    return safeFetch<{ success: boolean; article: NewsArticle; road?: Road; alert?: Alert }>(
      `${API_BASE}/news/apply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      }
    );
  }
};
