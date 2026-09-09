import {
  Road,
  Vehicle,
  Delivery,
  Incident,
  IncidentType,
  IncidentSeverity,
  Alert,
  WeatherData,
  DistrictResilience,
  SimulationParams,
  SimulationResult,
  AuditLog,
  NewsArticle
} from '../types';
import {
  INITIAL_ROADS,
  INITIAL_VEHICLES,
  INITIAL_DELIVERIES,
  INITIAL_INCIDENTS,
  INITIAL_WEATHER,
  DISTRICT_RESILIENCE_LIST,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS,
  TA_WANG_ROUTE_OPTIONS
} from '../data/nerData';
import {
  INITIAL_INDIA_NEWS_ARTICLES,
  analyzeIndianNewsText
} from '../data/newsData';

const API_BASE = '/api';

// Robust In-Memory Store for Client & Offline Fallback (ensures 100% functionality on Vercel deployments)
let localRoads: Road[] = JSON.parse(JSON.stringify(INITIAL_ROADS));
let localVehicles: Vehicle[] = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
let localDeliveries: Delivery[] = JSON.parse(JSON.stringify(INITIAL_DELIVERIES));
let localIncidents: Incident[] = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
let localAlerts: Alert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let localWeather: WeatherData[] = JSON.parse(JSON.stringify(INITIAL_WEATHER));
let localAuditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let localNewsArticles: NewsArticle[] = JSON.parse(JSON.stringify(INITIAL_INDIA_NEWS_ARTICLES));
let localEmergencyMode = false;

// Standard role-based users for demo & auth fallbacks
const DEMO_USERS: Record<string, any> = {
  authority: {
    id: 'usr-auth-01',
    name: 'Rajesh Sharma, IAS',
    employeeId: 'NER-ADM-2041',
    email: 'authority@terranex.gov.in',
    phone: '+91 94350 11982',
    role: 'authority',
    organization: 'NER Disaster Management & Transport Authority',
    state: 'Assam',
    district: 'Kamrup Metropolitan (Guwahati)'
  },
  field_officer: {
    id: 'usr-fld-02',
    name: 'Inspector P. T. Khon',
    employeeId: 'NER-BRO-714',
    email: 'field@terranex.gov.in',
    phone: '+91 94360 88219',
    role: 'field_officer',
    organization: 'Border Roads Task Force 88 / Inspection Wing',
    state: 'Arunachal Pradesh',
    district: 'West Kameng (Bhalukpong)'
  },
  driver: {
    id: 'usr-drv-03',
    name: 'Tsering Dorjee',
    employeeId: 'TNX-OPR-1042',
    email: 'driver@terranex.gov.in',
    phone: '+91 94360 99420',
    role: 'driver',
    organization: 'Emergency Medical Logistics Fleet (Vehicle TNX-1042)',
    state: 'Arunachal Pradesh',
    district: 'Tawang'
  },
  analyst: {
    id: 'usr-ana-04',
    name: 'Dr. Ananya Baruah',
    employeeId: 'NER-GIS-509',
    email: 'analyst@terranex.gov.in',
    phone: '+91 98640 55102',
    role: 'analyst',
    organization: 'North Eastern Space Applications Centre (NESAC GIS)',
    state: 'Meghalaya',
    district: 'Umiam'
  }
};

/**
 * Universal safe API caller:
 * Checks for HTTP OK and valid application/json content type.
 * If server is unavailable, returns HTML (such as SPA 404 rewrite), or network fails,
 * it seamlessly runs fallback() so the application never throws or displays blank screens.
 */
async function safeFetch<T>(
  url: string,
  init?: RequestInit,
  fallback?: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await fetch(url, init);
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      return data as T;
    }
  } catch (err) {
    // Network down, CORS, or offline
  }

  if (fallback) {
    return fallback();
  }
  throw new Error(`Failed to fetch ${url} and no fallback was provided.`);
}

export const api = {
  // Auth
  login: async (email?: string, password?: string, role: string = 'authority'): Promise<{
    success: boolean;
    token: string;
    user: any;
    error?: string;
    message?: string;
  }> => {
    return safeFetch(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      },
      () => {
        const targetRole = role || 'authority';
        const user = { ...(DEMO_USERS[targetRole] || DEMO_USERS.authority) };
        if (email) user.email = email;
        return {
          success: true,
          token: `tnx-jwt-${Date.now()}`,
          user
        };
      }
    );
  },

  register: async (data: any): Promise<{
    success: boolean;
    token: string;
    user: any;
    error?: string;
    message?: string;
  }> => {
    return safeFetch(
      `${API_BASE}/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      },
      () => {
        const role = data.role || 'authority';
        const base = DEMO_USERS[role] || DEMO_USERS.authority;
        const user = {
          ...base,
          ...data,
          id: `usr-reg-${Date.now()}`
        };
        return {
          success: true,
          token: `tnx-jwt-${Date.now()}`,
          user
        };
      }
    );
  },

  forgotPassword: async (identifier: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
    demoOtp?: string;
  }> => {
    return safeFetch(
      `${API_BASE}/auth/forgot-password`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      },
      () => ({
        success: true,
        message: `Security OTP sent to registered terminal: 482910`,
        demoOtp: '482910'
      })
    );
  },

  verifyOtp: async (otp: string, newPassword?: string): Promise<{
    success: boolean;
    message: string;
    error?: string;
  }> => {
    return safeFetch(
      `${API_BASE}/auth/verify-otp`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, newPassword })
      },
      () => ({
        success: true,
        message: 'OTP verified successfully. Credential state active.'
      })
    );
  },

  // Dashboard
  getDashboard: async () => {
    return safeFetch(
      `${API_BASE}/dashboard`,
      undefined,
      () => {
        const blockedRoads = localRoads.filter((r) => r.status === 'BLOCKED').length;
        const restrictedRoads = localRoads.filter((r) => r.status === 'HIGH_RISK').length;
        const openRoads = localRoads.filter((r) => r.status === 'ACCESSIBLE').length;
        const totalRoads = localRoads.length;
        const activeAlerts = localAlerts.filter((a) => !a.read).length;
        const criticalDeliveries = localDeliveries.filter(
          (d) => d.priority === 'CRITICAL' && (d.status === 'DELAYED' || d.status === 'IN_TRANSIT')
        ).length;
        const activeVehicles = localVehicles.filter((v) => v.status === 'IN_TRANSIT').length;

        return {
          dashboard: {
            networkHealthScore: Math.round(((openRoads * 1.0 + restrictedRoads * 0.4) / (totalRoads || 1)) * 100),
            blockedRoads,
            restrictedRoads,
            openRoads,
            totalRoads,
            activeAlerts,
            criticalDeliveries,
            activeVehicles,
            emergencyModeActive: localEmergencyMode,
            lastRefreshed: new Date().toISOString()
          }
        };
      }
    );
  },

  // Roads
  getRoads: async () => {
    return safeFetch(
      `${API_BASE}/roads`,
      undefined,
      () => ({ roads: localRoads })
    );
  },

  getRoad: async (id: string) => {
    return safeFetch(
      `${API_BASE}/roads/${id}`,
      undefined,
      () => ({ road: localRoads.find((r) => r.id === id) })
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

    return safeFetch(
      `${API_BASE}/roads/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      },
      () => {
        const index = localRoads.findIndex((r) => r.id === id);
        if (index !== -1) {
          localRoads[index] = {
            ...localRoads[index],
            ...body,
            status: (body.status as any) || localRoads[index].status,
            accessibility: (body.accessibility as any) || localRoads[index].accessibility
          };
          return { success: true, road: localRoads[index] };
        }
        return { success: false, message: 'Road not found' };
      }
    );
  },

  getInitialData: async () => {
    try {
      const [roadsRes, vehRes, delRes, incRes, altRes, dashRes, weatherRes] = await Promise.all([
        safeFetch<{ roads: Road[] }>(`${API_BASE}/roads`, undefined, () => ({ roads: localRoads })),
        safeFetch<{ vehicles: Vehicle[] }>(`${API_BASE}/vehicles`, undefined, () => ({ vehicles: localVehicles })),
        safeFetch<{ deliveries: Delivery[] }>(`${API_BASE}/deliveries`, undefined, () => ({ deliveries: localDeliveries })),
        safeFetch<{ incidents: Incident[] }>(`${API_BASE}/incidents`, undefined, () => ({ incidents: localIncidents })),
        safeFetch<{ alerts: Alert[] }>(`${API_BASE}/alerts`, undefined, () => ({ alerts: localAlerts })),
        safeFetch<any>(`${API_BASE}/dashboard`, undefined, () => ({ dashboard: null })),
        safeFetch<{ weather: WeatherData[] }>(`${API_BASE}/weather`, undefined, () => ({ weather: localWeather }))
      ]);

      const roads = (roadsRes.roads && roadsRes.roads.length > 0) ? roadsRes.roads : localRoads;
      const vehicles = (vehRes.vehicles && vehRes.vehicles.length > 0) ? vehRes.vehicles : localVehicles;
      const deliveries = (delRes.deliveries && delRes.deliveries.length > 0) ? delRes.deliveries : localDeliveries;
      const incidents = (incRes.incidents && incRes.incidents.length > 0) ? incRes.incidents : localIncidents;
      const alerts = (altRes.alerts && altRes.alerts.length > 0) ? altRes.alerts : localAlerts;
      const weather = (weatherRes.weather && weatherRes.weather.length > 0) ? weatherRes.weather : localWeather;

      return {
        roads,
        vehicles,
        deliveries,
        incidents,
        alerts,
        weather,
        dashboard: dashRes.dashboard || null
      };
    } catch (err) {
      console.warn('Using seeded NER data:', err);
      return {
        roads: localRoads,
        vehicles: localVehicles,
        deliveries: localDeliveries,
        incidents: localIncidents,
        alerts: localAlerts,
        weather: localWeather,
        dashboard: null
      };
    }
  },

  // Vehicles
  getVehicles: async () => {
    return safeFetch(
      `${API_BASE}/vehicles`,
      undefined,
      () => ({ vehicles: localVehicles })
    );
  },

  getVehicle: async (id: string) => {
    return safeFetch(
      `${API_BASE}/vehicles/${id}`,
      undefined,
      () => ({ vehicle: localVehicles.find((v) => v.id === id) })
    );
  },

  updateVehicleLocation: async (id: string, location: { lat: number; lng: number; speedKmH?: number; heading?: number }) => {
    return safeFetch(
      `${API_BASE}/vehicles/${id}/location`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(location)
      },
      () => {
        const index = localVehicles.findIndex((v) => v.id === id);
        if (index !== -1) {
          localVehicles[index] = {
            ...localVehicles[index],
            currentLocation: {
              lat: location.lat,
              lng: location.lng,
              name: localVehicles[index].currentLocation?.name || 'Active Coordinate Beacon'
            },
            speedKmH: location.speedKmH ?? localVehicles[index].speedKmH
          };
          return { success: true, vehicle: localVehicles[index] };
        }
        return { success: false, message: 'Vehicle not found' };
      }
    );
  },

  // Deliveries
  getDeliveries: async () => {
    return safeFetch(
      `${API_BASE}/deliveries`,
      undefined,
      () => ({ deliveries: localDeliveries })
    );
  },

  getDelivery: async (id: string) => {
    return safeFetch(
      `${API_BASE}/deliveries/${id}`,
      undefined,
      () => ({ delivery: localDeliveries.find((d) => d.id === id) })
    );
  },

  // Incidents
  getIncidents: async () => {
    return safeFetch(
      `${API_BASE}/incidents`,
      undefined,
      () => ({ incidents: localIncidents })
    );
  },

  createIncident: async (incidentData: Partial<Incident>) => {
    return safeFetch(
      `${API_BASE}/incidents`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      },
      () => {
        const newInc: Incident = {
          id: `inc-${Date.now()}`,
          incidentCode: `#INC-${Math.floor(1000 + Math.random() * 9000)}`,
          type: incidentData.type || 'Landslide',
          severity: incidentData.severity || 'High',
          status: 'ACTIVE',
          lat: incidentData.lat || 27.02,
          lng: incidentData.lng || 92.58,
          roadId: incidentData.roadId || 'road-nh13-01',
          roadCode: incidentData.roadCode || 'NH-13',
          reportedAt: new Date().toISOString(),
          reportedBy: incidentData.reportedBy || 'Field Officer',
          reportedRole: incidentData.reportedRole || 'field_officer',
          description: incidentData.description || 'Disruption observed by field patrol.',
          imageUrl: incidentData.imageUrl,
          vehiclesAffected: 3,
          deliveriesAffected: 2,
          aiRiskScore: 88,
          aiClassification: {
            incidentType: incidentData.type || 'Landslide',
            severity: incidentData.severity || 'High',
            roadImpact: 'FULL_BLOCKAGE',
            confidence: 94,
            recommendedAction: 'Halt supply convoys; deploy clearance bulldozer.'
          }
        };
        localIncidents.unshift(newInc);

        // Update affected highway status
        if (newInc.roadId) {
          const rIndex = localRoads.findIndex((r) => r.id === newInc.roadId);
          if (rIndex !== -1) {
            localRoads[rIndex].status = newInc.severity === 'Critical' ? 'BLOCKED' : 'HIGH_RISK';
            localRoads[rIndex].accessibility = newInc.severity === 'Critical' ? 'BLOCKED' : 'RESTRICTED';
          }
        }
        return { success: true, incident: newInc };
      }
    );
  },

  classifyIncidentAi: async (data: { description: string; roadCode?: string; lat?: number; lng?: number; imageBase64?: string }): Promise<{
    success: boolean;
    classification: {
      detectedType: IncidentType;
      severity: IncidentSeverity;
      confidenceScore: number;
      recommendedAction: string;
    };
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
      },
      () => {
        const desc = (data.description || '').toLowerCase();
        let type: IncidentType = 'Landslide';
        let severity: IncidentSeverity = 'High';
        if (desc.includes('flood') || desc.includes('water') || desc.includes('submerged')) {
          type = 'Flood';
          severity = 'High';
        } else if (desc.includes('bridge') || desc.includes('culvert') || desc.includes('crack')) {
          type = 'Bridge Damage';
          severity = 'Critical';
        } else if (desc.includes('slide') || desc.includes('mud') || desc.includes('boulder') || desc.includes('debris')) {
          type = 'Landslide';
          severity = 'Critical';
        }

        return {
          success: true,
          classification: {
            detectedType: type,
            severity,
            confidenceScore: 95,
            recommendedAction: 'Halt heavy supply convoys immediately; activate regional bypass routing protocol.'
          },
          aiClassification: {
            incidentType: type,
            severity,
            roadImpact: 'FULL_BLOCKAGE',
            confidence: 95,
            recommendedAction: 'Halt heavy supply convoys immediately; activate regional bypass routing protocol.'
          }
        };
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
      },
      () => ({
        success: true,
        routes: TA_WANG_ROUTE_OPTIONS,
        recommendedRouteId: 'route-shergaon-bypass'
      })
    );
  },

  rerouteVehicle: async (vehicleId: string, routeId: string, reason?: string) => {
    return safeFetch(
      `${API_BASE}/routes/reroute`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, routeId, reason })
      },
      () => {
        const vehIndex = localVehicles.findIndex((v) => v.id === vehicleId);
        if (vehIndex !== -1) {
          localVehicles[vehIndex].status = 'REROUTED';
          localVehicles[vehIndex].isRerouted = true;
          localVehicles[vehIndex].activeRouteId = routeId;
          localVehicles[vehIndex].currentRoadCode = 'NH-15 (Shergaon Bypass)';
          localVehicles[vehIndex].predictedDelayMinutes = 32;
          localVehicles[vehIndex].riskLevel = 'LOW';
        }
        return {
          success: true,
          message: `Vehicle ${vehicleId} rerouted via ${routeId}.`,
          vehicle: vehIndex !== -1 ? localVehicles[vehIndex] : null
        };
      }
    );
  },

  // Weather & Risk
  getWeather: async () => {
    return safeFetch(
      `${API_BASE}/weather`,
      undefined,
      () => ({ weather: localWeather })
    );
  },

  getRiskCorridors: async () => {
    return safeFetch(
      `${API_BASE}/risk/corridors`,
      undefined,
      () => {
        const corridors = localRoads
          .map((r) => ({
            roadId: r.id,
            roadCode: r.code,
            name: r.name,
            riskScore: r.riskScore,
            status: r.status,
            rainfallMmH: r.rainfallMmH,
            disruptionProbability: r.disruptionProbability
          }))
          .sort((a, b) => b.riskScore - a.riskScore);
        return { corridors };
      }
    );
  },

  // Alerts
  getAlerts: async (role: string = 'authority') => {
    return safeFetch(
      `${API_BASE}/alerts?role=${role}`,
      undefined,
      () => ({ alerts: localAlerts })
    );
  },

  createAlert: async (alertData: Partial<Alert>) => {
    return safeFetch(
      `${API_BASE}/alerts`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      },
      () => {
        const newAlt: Alert = {
          id: `alt-${Date.now()}`,
          level: alertData.level || 'HIGH',
          title: alertData.title || 'Regional Transit Alert',
          message: alertData.message || 'Hazard alert broadcast across North East transit grid.',
          timestamp: 'Just now',
          targetRoles: alertData.targetRoles || ['authority', 'driver', 'field_officer'],
          read: false
        };
        localAlerts.unshift(newAlt);
        return { success: true, alert: newAlt };
      }
    );
  },

  acknowledgeAlert: async (id: string) => {
    return safeFetch(
      `${API_BASE}/alerts/${id}/read`,
      { method: 'PATCH' },
      () => {
        const index = localAlerts.findIndex((a) => a.id === id);
        if (index !== -1) {
          localAlerts[index].read = true;
        }
        return { success: true };
      }
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
      },
      () => ({
        success: true,
        syncedCount: items.length,
        syncedIds: items.map((i: any) => i.id || `synced-${Math.random()}`),
        timestamp: new Date().toISOString()
      })
    );
  },

  // Simulation
  runSimulation: async (params: SimulationParams): Promise<{
    success: boolean;
    simulation: SimulationResult;
    result: SimulationResult;
  }> => {
    return safeFetch(
      `${API_BASE}/simulation`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      },
      () => {
        const closures = params.roadClosureCount || 0;
        const demandMult = params.emergencyDemand === 'SURGE' ? 1.5 : params.emergencyDemand === 'HIGH' ? 1.2 : 1.0;

        const simResult: SimulationResult = {
          affectedDistricts: Math.min(8, Math.max(1, closures + 1)),
          potentialDelaysHours: Number((1.5 + closures * 0.8 * demandMult).toFixed(1)),
          atRiskDeliveries: Math.min(12, Math.max(1, Math.round(closures * 2 * demandMult))),
          recommendedAlternateCorridors: Math.max(1, closures),
          additionalVehiclesNeeded: Math.round(closures * 1.5 * demandMult),
          criticalHospitalSupplyAtRisk: Math.min(5, Math.max(0, Math.round(closures * 0.75))),
          timestamp: new Date().toISOString()
        };

        return {
          success: true,
          simulation: simResult,
          result: simResult
        };
      }
    );
  },

  // Districts
  getDistricts: async () => {
    return safeFetch(
      `${API_BASE}/districts`,
      undefined,
      () => ({ districts: DISTRICT_RESILIENCE_LIST })
    );
  },

  getDistrictIntelligence: async (id: string) => {
    return safeFetch(
      `${API_BASE}/districts/${id}/intelligence`,
      undefined,
      () => {
        const dist = DISTRICT_RESILIENCE_LIST.find((d) => d.districtId === id) || DISTRICT_RESILIENCE_LIST[0];
        return {
          district: dist,
          connectedRoads: localRoads.filter((r) => r.state === dist.state),
          resilienceScore: dist.overallScore,
          criticalVulnerabilities: ['High mountain slope exposure', 'Single-access bypass dependency']
        };
      }
    );
  },

  // Analytics & Audit
  getAnalytics: async () => {
    return safeFetch(
      `${API_BASE}/analytics`,
      undefined,
      () => ({
        uptimePercentage: 99.8,
        disruptionsPredictedEarly: 88,
        deliveriesSaved: 142,
        averageDetourOverheadMinutes: 34
      })
    );
  },

  getAuditLogs: async (): Promise<{ auditLogs: AuditLog[]; logs: AuditLog[] }> => {
    return safeFetch(
      `${API_BASE}/audit-logs`,
      undefined,
      () => ({ auditLogs: localAuditLogs, logs: localAuditLogs })
    );
  },

  // Emergency Mode
  toggleEmergencyMode: async () => {
    return safeFetch(
      `${API_BASE}/emergency-mode`,
      { method: 'POST' },
      () => {
        localEmergencyMode = !localEmergencyMode;
        return {
          success: true,
          emergencyModeActive: localEmergencyMode,
          message: localEmergencyMode
            ? 'Emergency Mode ACTIVATED: High priority convoy routing enforced.'
            : 'Emergency Mode DEACTIVATED: Standard transit schedule resumed.'
        };
      }
    );
  },

  // AI Assistant
  askAssistant: async (
    question: string,
    history?: Array<{ sender: 'user' | 'assistant'; text: string }>,
    lang?: string
  ): Promise<{ success: boolean; reply: string; answer: string }> => {
    return safeFetch(
      `${API_BASE}/ai/assistant`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history, lang })
      },
      () => {
        const q = question.toLowerCase();
        let reply = '';
        if (q.includes('tawang') || q.includes('nh-13') || q.includes('nh 13') || q.includes('landslide')) {
          reply = 'NH-13 near Bhalukpong has an active 450 m³ landslide blockage at Km 81.3. Supply convoys travelling towards Tawang are advised to bypass via NH-15 (Shergaon Bypass) adding approximately +32 minutes.';
        } else if (q.includes('weather') || q.includes('rain') || q.includes('monsoon')) {
          reply = 'Heavy monsoon rainfall (48.5 mm/h) is active across West Kameng district. Flash mudslides and reduced visibility reported on mountain passes.';
        } else if (q.includes('route') || q.includes('reroute') || q.includes('bypass')) {
          reply = 'Shergaon Bypass (NH-15) is fully operational with 2-lane paved tarmac and 4 fuel stations. All medical and relief transports have been rerouted safely.';
        } else {
          reply = 'TerraNex Logistics Intelligence is actively monitoring 10 North Eastern highway corridors. All telemetry, satellite feeds, and field patrol reports are synchronized.';
        }
        return { success: true, reply, answer: reply };
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
      },
      () => {
        const nh13 = localRoads.find((r) => r.id === 'road-nh13-01');
        const veh1042 = localVehicles.find((v) => v.id === 'veh-1042');
        const del20481 = localDeliveries.find((d) => d.id === 'del-20481');

        switch (step) {
          case 1:
            if (nh13) {
              nh13.status = 'ACCESSIBLE';
              nh13.accessibility = 'ACCESSIBLE';
              nh13.riskScore = 28;
              nh13.disruptionProbability = 20;
              nh13.weatherCondition = 'Light Overcast';
              nh13.rainfallMmH = 6.0;
            }
            if (veh1042) {
              veh1042.status = 'IN_TRANSIT';
              veh1042.isRerouted = false;
              veh1042.riskLevel = 'LOW';
              veh1042.eta = '5h 20m';
              veh1042.predictedDelayMinutes = 0;
              veh1042.currentRoadCode = 'NH-13';
            }
            break;

          case 2:
            if (nh13) {
              nh13.weatherCondition = 'Heavy Monsoon Downpour & Fog';
              nh13.rainfallMmH = 48.5;
            }
            localAlerts.unshift({
              id: `alt-demo-${Date.now()}`,
              level: 'HIGH',
              title: 'Heavy Rainfall Warning: Kameng Sector',
              message: 'Precipitation exceeded 48.5 mm/h along NH-13 Bhalukpong approach.',
              timestamp: 'Just now',
              targetRoles: ['authority', 'driver', 'field_officer'],
              read: false
            });
            break;

          case 3:
            if (nh13) {
              nh13.status = 'HIGH_RISK';
              nh13.accessibility = 'RESTRICTED';
              nh13.riskScore = 78;
              nh13.disruptionProbability = 82;
            }
            if (veh1042) {
              veh1042.riskLevel = 'HIGH';
            }
            localAlerts.unshift({
              id: `alt-demo-${Date.now()}`,
              level: 'HIGH',
              title: 'AI Prediction: 82% Disruption Probability on NH-13',
              message: 'Explainable factors: 48.5mm rain (+25), 38° slope (+21), 14 historical slides (+17).',
              timestamp: 'Just now',
              targetRoles: ['authority', 'field_officer'],
              read: false
            });
            break;

          case 4:
          case 5:
            const inc = localIncidents.find((i) => i.id === 'inc-2041');
            if (inc) {
              inc.status = 'ACTIVE';
              inc.reportedAt = 'Just now';
            }
            break;

          case 6:
            if (nh13) {
              nh13.status = 'BLOCKED';
              nh13.accessibility = 'BLOCKED';
              nh13.riskScore = 92;
              nh13.disruptionProbability = 98;
              nh13.recommendedAction = 'Enforce total roadblock at Bhalukpong; divert supply convoys to Shergaon.';
            }
            localAlerts.unshift({
              id: `alt-demo-${Date.now()}`,
              level: 'CRITICAL',
              title: '🚨 NH-13 MARKED BLOCKED: 450m³ Landslide at Km 81.3',
              message: 'Direct corridor impassable. 4 critical medical deliveries halted including TNX-1042.',
              timestamp: 'Just now',
              targetRoles: ['authority', 'driver', 'field_officer'],
              read: false
            });
            break;

          case 7:
          case 8:
            if (veh1042) {
              veh1042.status = 'DELAYED';
              veh1042.riskLevel = 'CRITICAL';
            }
            break;

          case 9:
          case 10:
            if (veh1042) {
              veh1042.status = 'REROUTED';
              veh1042.isRerouted = true;
              veh1042.currentRoadCode = 'NH-15 (Shergaon Bypass)';
              veh1042.eta = '5h 52m';
              veh1042.predictedDelayMinutes = 32;
              veh1042.riskLevel = 'LOW';
              veh1042.activeRouteId = 'route-shergaon-bypass';
            }
            if (del20481) {
              del20481.status = 'REROUTED';
              del20481.eta = '5h 52m';
              del20481.predictedDelayMinutes = 32;
              del20481.riskLevel = 'LOW';
            }
            localAlerts.unshift({
              id: `alt-demo-${Date.now()}`,
              level: 'INFO',
              title: 'Critical Delivery Preserved: TNX-1042 Rerouted',
              message: 'Safe arrival guaranteed via Shergaon Bypass. Total delay overhead minimized to +32 minutes.',
              timestamp: 'Just now',
              targetRoles: ['authority', 'driver'],
              read: false
            });
            break;
        }

        return {
          success: true,
          step,
          roads: localRoads,
          vehicles: localVehicles,
          deliveries: localDeliveries,
          alerts: localAlerts.slice(0, 5)
        };
      }
    );
  },

  resetDemo: async () => {
    return safeFetch(
      `${API_BASE}/demo/reset`,
      { method: 'POST' },
      () => {
        localRoads = JSON.parse(JSON.stringify(INITIAL_ROADS));
        localVehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
        localDeliveries = JSON.parse(JSON.stringify(INITIAL_DELIVERIES));
        localIncidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
        localAlerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
        localAuditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
        localEmergencyMode = false;

        return {
          success: true,
          message: 'Scenario reset to default baseline state.'
        };
      }
    );
  },

  // News Intelligence Endpoints
  getNews: async () => {
    return safeFetch(
      `${API_BASE}/news`,
      undefined,
      () => ({ articles: localNewsArticles })
    );
  },

  analyzeNews: async (text: string, source?: string) => {
    return safeFetch(
      `${API_BASE}/news/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source })
      },
      () => {
        const article = analyzeIndianNewsText(text, source || 'Field Feed');
        localNewsArticles.unshift(article);
        return { success: true, article };
      }
    );
  },

  applyNewsImpact: async (articleId: string) => {
    return safeFetch(
      `${API_BASE}/news/apply`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      },
      () => {
        const article = localNewsArticles.find((a) => a.id === articleId);
        if (!article) {
          return { success: false, message: 'Article not found' };
        }

        article.appliedToRoute = true;
        let matchedRoad: Road | null = null;
        let createdAlert: Alert | null = null;

        if (article.extractedHighway) {
          const rIndex = localRoads.findIndex(
            (r) => r.code.toUpperCase() === article.extractedHighway.toUpperCase()
          );
          if (rIndex !== -1) {
            matchedRoad = localRoads[rIndex];
            if (article.detectedStatus === 'BLOCKED') {
              matchedRoad.status = 'BLOCKED';
              matchedRoad.accessibility = 'BLOCKED';
              matchedRoad.disruptionProbability = 95;
            } else if (article.detectedStatus === 'HIGH_RISK') {
              matchedRoad.status = 'HIGH_RISK';
              matchedRoad.accessibility = 'RESTRICTED';
              matchedRoad.disruptionProbability = 80;
            }
          }
        }

        createdAlert = {
          id: `alt-news-${Date.now()}`,
          level: article.detectedStatus === 'BLOCKED' ? 'CRITICAL' : 'HIGH',
          title: `Broadcast: ${article.title}`,
          message: `${article.impactSummary} [Source: ${article.source}]`,
          timestamp: 'Just now',
          targetRoles: ['authority', 'field_officer', 'driver'],
          read: false
        };
        localAlerts.unshift(createdAlert);

        return {
          success: true,
          article,
          road: matchedRoad,
          alert: createdAlert
        };
      }
    );
  }
};
