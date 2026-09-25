import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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
} from './src/data/nerData.ts';
import { INITIAL_INDIA_NEWS_ARTICLES, analyzeIndianNewsText, INDIA_HIGHWAY_DIRECTORY } from './src/data/newsData.ts';
import { Road, Vehicle, Delivery, Incident, Alert, AuditLog, SimulationParams, SimulationResult, NewsArticle } from './src/types.ts';
import { generateMediaForIncident } from './src/services/mediaRepository.ts';

// In-memory operational store with deep copy so demo updates persist across requests
let roads: Road[] = JSON.parse(JSON.stringify(INITIAL_ROADS));
let vehicles: Vehicle[] = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
let deliveries: Delivery[] = JSON.parse(JSON.stringify(INITIAL_DELIVERIES));
let incidents: Incident[] = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
let alerts: Alert[] = JSON.parse(JSON.stringify(INITIAL_ALERTS));
let auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let newsArticles: NewsArticle[] = JSON.parse(JSON.stringify(INITIAL_INDIA_NEWS_ARTICLES));
let emergencyModeActive = false;

// Lazy initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    } catch (err) {
      console.warn('Gemini API init skipped or failed:', err);
    }
  }
  return aiClient;
}

export const app = express();
app.use(express.json({ limit: '10mb' }));

// API Routes
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'TerraNex NER Logistics Intelligence API',
      timestamp: new Date().toISOString(),
      roadsCount: roads.length,
      vehiclesCount: vehicles.length,
      emergencyModeActive
    });
  });

  // 1. Auth endpoints
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password, role } = req.body;

    // Demo role presets
    const demoUsers: Record<string, any> = {
      authority: {
        id: 'usr-auth-01',
        name: 'Rajesh Sharma, IAS',
        employeeId: 'NER-ADM-2041',
        email: email || 'authority@terranex.gov.in',
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
        email: email || 'field@terranex.gov.in',
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
        email: email || 'driver@terranex.gov.in',
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
        email: email || 'analyst@terranex.gov.in',
        phone: '+91 98640 55102',
        role: 'analyst',
        organization: 'North Eastern Space Applications Centre (NESAC GIS)',
        state: 'Meghalaya',
        district: 'Umiam'
      }
    };

    const targetRole = role || 'authority';
    const user = demoUsers[targetRole] || demoUsers.authority;

    res.json({
      success: true,
      token: `tnx_jwt_${Date.now()}_${user.id}`,
      user
    });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, employeeId, email, phone, organization, state, district, role } = req.body;
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name || 'Officer',
      employeeId: employeeId || `NER-${Math.floor(1000 + Math.random() * 9000)}`,
      email: email || 'user@terranex.gov.in',
      phone: phone || '+91 94000 00000',
      role: role || 'field_officer',
      organization: organization || 'NER Field Logistics Unit',
      state: state || 'Assam',
      district: district || 'Kamrup'
    };

    res.json({
      success: true,
      message: 'Account registered successfully. Activated for SIH prototype.',
      token: `tnx_jwt_${Date.now()}_${newUser.id}`,
      user: newUser
    });
  });

  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { identifier } = req.body;
    res.json({
      success: true,
      message: `Verification OTP generated for ${identifier || 'employee ID'}.`,
      otpDemo: '4821'
    });
  });

  app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
    const { otp, newPassword } = req.body;
    if (otp === '4821' || otp.length === 4) {
      res.json({
        success: true,
        message: 'Password reset successfully. Please login with your new credentials.'
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid OTP entered. Please try 4821.' });
    }
  });

  // 2. Dashboard KPIs & Accessibility Aggregator
  app.get('/api/dashboard', (req: Request, res: Response) => {
    const totalRoads = roads.length;
    const accessibleRoads = roads.filter((r) => r.status === 'ACCESSIBLE').length;
    const restrictedRoads = roads.filter((r) => r.status === 'MODERATE' || r.status === 'HIGH_RISK').length;
    const blockedRoads = roads.filter((r) => r.status === 'BLOCKED').length;

    const accessiblePct = Math.round((accessibleRoads / totalRoads) * 100);
    const restrictedPct = Math.round((restrictedRoads / totalRoads) * 100);
    const blockedPct = 100 - accessiblePct - restrictedPct;

    const activeVehicles = vehicles.filter((v) => v.status === 'IN_TRANSIT' || v.status === 'DELAYED').length;
    const activeDeliveries = deliveries.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'DELAYED').length;
    const highRiskCorridors = roads.filter((r) => r.status === 'HIGH_RISK' || r.riskScore >= 70).length;
    const atRiskDeliveries = deliveries.filter((d) => d.riskLevel === 'HIGH' || d.riskLevel === 'CRITICAL').length;

    // AI Regional Risk Score calculation
    const avgRiskScore = Math.round(roads.reduce((acc, r) => acc + r.riskScore, 0) / (roads.length || 1));
    const currentRiskLevel = avgRiskScore > 70 ? 'CRITICAL' : avgRiskScore > 50 ? 'MEDIUM' : 'LOW';

    res.json({
      kpis: {
        activeVehicles: activeVehicles + 120, // scaled realistic representation
        activeDeliveries: activeDeliveries + 83,
        roadBlockages: blockedRoads,
        highRiskCorridors,
        atRiskDeliveries: atRiskDeliveries + 13
      },
      accessibility: {
        accessiblePercent: accessiblePct,
        restrictedPercent: restrictedPct,
        blockedPercent: blockedPct
      },
      aiRegionalRisk: {
        riskLevel: currentRiskLevel,
        score: avgRiskScore,
        prediction: 'Risk expected to surge significantly over next 6 hours in Western Arunachal and Naga Hills.',
        primaryFactors: [
          'Torrential Monsoon Cloudburst (48.5 mm/h in Kameng)',
          'Steep Slope Landslide Susceptibility (38°-42° schist rock)',
          'Active Flash Flood alerts along Brahmaputra tributaries'
        ]
      },
      emergencyModeActive
    });
  });

  // 3. Roads endpoints
  app.get('/api/roads', (req: Request, res: Response) => {
    res.json({ roads });
  });

  app.get('/api/roads/:id', (req: Request, res: Response) => {
    const road = roads.find((r) => r.id === req.params.id);
    if (!road) return res.status(404).json({ error: 'Road corridor not found' });
    res.json({ road });
  });

  app.patch('/api/roads/:id', (req: Request, res: Response) => {
    const { status, accessibility, riskScore, recommendedAction } = req.body;
    const roadIndex = roads.findIndex((r) => r.id === req.params.id);
    if (roadIndex === -1) return res.status(404).json({ error: 'Road not found' });

    const prev = roads[roadIndex];
    roads[roadIndex] = {
      ...prev,
      status: status || prev.status,
      accessibility: accessibility || prev.accessibility,
      riskScore: riskScore !== undefined ? riskScore : prev.riskScore,
      recommendedAction: recommendedAction || prev.recommendedAction
    };

    // Log in audit trail
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      officerName: req.body.officerName || 'District Authority',
      role: 'Authority',
      action: `Updated status of ${prev.code} to ${roads[roadIndex].status}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      location: prev.name,
      previousState: prev.status,
      newState: roads[roadIndex].status,
      details: req.body.reason || 'Manual override / Incident verification'
    });

    res.json({ success: true, road: roads[roadIndex] });
  });

  // 4. Vehicles endpoints
  app.get('/api/vehicles', (req: Request, res: Response) => {
    res.json({ vehicles });
  });

  app.get('/api/vehicles/:id', (req: Request, res: Response) => {
    const vehicle = vehicles.find((v) => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ vehicle });
  });

  app.post('/api/vehicles/:id/location', (req: Request, res: Response) => {
    const { lat, lng, speedKmH, heading } = req.body;
    const vehicle = vehicles.find((v) => v.id === req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    vehicle.currentLocation.lat = lat ?? vehicle.currentLocation.lat;
    vehicle.currentLocation.lng = lng ?? vehicle.currentLocation.lng;
    vehicle.speedKmH = speedKmH ?? vehicle.speedKmH;
    vehicle.heading = heading ?? vehicle.heading;
    vehicle.lastGpsUpdate = 'Just now (GPS Stream)';

    res.json({ success: true, vehicle });
  });

  // 5. Deliveries endpoints
  app.get('/api/deliveries', (req: Request, res: Response) => {
    res.json({ deliveries });
  });

  app.get('/api/deliveries/:id', (req: Request, res: Response) => {
    const delivery = deliveries.find((d) => d.id === req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery record not found' });
    res.json({ delivery });
  });

  // 6. Incidents endpoints
  app.get('/api/incidents', (req: Request, res: Response) => {
    res.json({ incidents });
  });

  app.get('/api/incidents/:id/media', (req: Request, res: Response) => {
    const incidentId = req.params.id;
    const inc = incidents.find((i) => i.id === incidentId);
    if (!inc) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    const media = generateMediaForIncident(inc);
    res.json({ success: true, incidentId, media });
  });

  app.post('/api/incidents', (req: Request, res: Response) => {
    const {
      type,
      severity,
      lat,
      lng,
      roadId,
      roadCode,
      reportedBy,
      reportedRole,
      description,
      imageUrl,
      accessibility
    } = req.body;

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      incidentCode: `#INC-${Math.floor(2050 + Math.random() * 500)}`,
      type: type || 'Landslide',
      severity: severity || 'High',
      lat: Number(lat) || 27.24,
      lng: Number(lng) || 92.48,
      roadId: roadId || 'road-nh13',
      roadCode: roadCode || 'NH-13',
      reportedBy: reportedBy || 'Field Officer',
      reportedRole: reportedRole || 'Field Officer',
      reportedAt: 'Just now',
      status: 'ACTIVE',
      description: description || 'Reported blockage in mountainous terrain.',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
      aiClassification: {
        incidentType: type || 'Landslide',
        severity: severity || 'High',
        roadImpact: severity === 'Critical' || severity === 'High' ? 'FULL_BLOCKAGE' : 'PARTIAL_RESTRICTION',
        confidence: 91,
        recommendedAction: 'Restrict civilian traffic; dispatch local dozer team; reroute essential supply vehicles to southern corridor.'
      },
      vehiclesAffected: 6,
      deliveriesAffected: 4,
      aiRiskScore: 84
    };

    incidents.unshift(newIncident);

    // If severe, update road status automatically
    if (newIncident.severity === 'High' || newIncident.severity === 'Critical') {
      const targetRoad = roads.find((r) => r.id === newIncident.roadId);
      if (targetRoad) {
        targetRoad.status = 'BLOCKED';
        targetRoad.accessibility = 'BLOCKED';
        targetRoad.riskScore = 88;
        targetRoad.disruptionProbability = 94;
      }

      // Generate alert
      alerts.unshift({
        id: `alt-${Date.now()}`,
        level: 'CRITICAL',
        title: `${newIncident.type} on ${newIncident.roadCode} reported by ${newIncident.reportedBy}`,
        message: `${newIncident.description.slice(0, 100)}... AI classified as ${newIncident.aiClassification?.roadImpact}.`,
        timestamp: 'Just now',
        targetRoles: ['authority', 'driver', 'field_officer'],
        roadId: newIncident.roadId,
        read: false
      });
    }

    // Add audit log
    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      officerName: newIncident.reportedBy,
      role: 'Field Officer',
      action: `Submitted Incident ${newIncident.incidentCode} (${newIncident.type})`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      location: `${newIncident.roadCode} (${newIncident.lat.toFixed(2)}, ${newIncident.lng.toFixed(2)})`,
      previousState: 'Unreported',
      newState: newIncident.severity,
      details: newIncident.description
    });

    res.json({ success: true, incident: newIncident });
  });

  // AI Incident Classification with Gemini or calibrated NER model
  app.post('/api/incidents/ai-classify', async (req: Request, res: Response) => {
    const { description, imageBase64, roadCode, lat, lng } = req.body;

    const ai = getAI();
    let classificationResult = {
      incidentType: 'Landslide',
      severity: 'High',
      roadImpact: 'FULL_BLOCKAGE',
      confidence: 91,
      recommendedAction: 'Restrict traffic and reroute essential supplies via Southern bypass corridor.',
      reasoning: 'Geological slope profile and saturated mountain soil indicate active debris flow across both carriage lanes.'
    };

    if (ai) {
      try {
        const prompt = `You are the TerraNex AI Logistics Vision and Incident Classifier for Northeast India mountainous roads (NH-13, NH-15, NH-29).
Classify the following road incident description and location:
Road: ${roadCode || 'NH-13'}
Location: Lat ${lat || 27.24}, Lng ${lng || 92.48}
Officer Description: ${description || 'Debris and mud collapsed over roadbed.'}

Respond in strict JSON format:
{
  "incidentType": "Landslide" | "Flood" | "Road Damage" | "Bridge Damage" | "Traffic Congestion" | "Vehicle Breakdown" | "Debris" | "Weather Hazard",
  "severity": "Low" | "Medium" | "High" | "Critical",
  "roadImpact": "NO_IMPACT" | "PARTIAL_RESTRICTION" | "FULL_BLOCKAGE",
  "confidence": number (between 80 and 99),
  "recommendedAction": "string actionable protocol",
  "reasoning": "brief explainable AI explanation"
}`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        if (response.text) {
          const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          classificationResult = { ...classificationResult, ...parsed };
        }
      } catch (err) {
        console.warn('Gemini incident classification fallback used:', err);
      }
    }

    res.json({ success: true, aiClassification: classificationResult });
  });

  // 7. Route Optimization & Rerouting
  app.post('/api/routes/optimize', (req: Request, res: Response) => {
    const { origin, destination, cargoPriority, vehicleType } = req.body;

    // Evaluate using cost formula:
    // Route Cost = Travel Time + Distance + Weather Risk + Road Risk + Disruption Risk + Traffic + Priority
    const routes = TA_WANG_ROUTE_OPTIONS.map((route) => {
      let penalty = 0;
      if (route.id === 'route-nh13-direct') {
        const nh13 = roads.find((r) => r.id === 'road-nh13');
        if (nh13?.status === 'BLOCKED') {
          penalty += 80;
        }
      }
      return {
        ...route,
        costScore: Number((route.costScore + penalty).toFixed(1)),
        status: penalty > 50 ? 'AVOID' : route.status
      };
    });

    res.json({
      origin: origin || 'Guwahati Depot',
      destination: destination || 'Tawang District Hospital',
      cargoPriority: cargoPriority || 'CRITICAL',
      recommendedRouteId: 'route-shergaon-bypass',
      routes
    });
  });

  app.post('/api/routes/reroute', (req: Request, res: Response) => {
    const { vehicleId, routeId, reason } = req.body;
    const vehicle = vehicles.find((v) => v.id === (vehicleId || 'veh-tnx1042'));

    if (vehicle) {
      vehicle.activeRouteId = routeId || 'route-shergaon-bypass';
      vehicle.status = 'REROUTED';
      vehicle.isRerouted = true;
      vehicle.currentRoadCode = 'NH-15 (Shergaon Bypass)';
      vehicle.eta = '5h 52m';
      vehicle.predictedDelayMinutes = 32;
      vehicle.riskLevel = 'LOW';
    }

    const delivery = deliveries.find((d) => d.vehicleId === (vehicleId || 'veh-tnx1042'));
    if (delivery) {
      delivery.status = 'REROUTED';
      delivery.eta = '5h 52m';
      delivery.predictedDelayMinutes = 32;
      delivery.riskLevel = 'LOW';
    }

    alerts.unshift({
      id: `alt-${Date.now()}`,
      level: 'HIGH',
      title: `Vehicle ${vehicle?.vehicleNumber || 'TNX-1042'} Rerouted Successfully`,
      message: `Switched to Shergaon Southern Corridor Bypass. Risk reduced from 86% to 24%. ETA overhead: +32m.`,
      timestamp: 'Just now',
      targetRoles: ['authority', 'driver'],
      vehicleId: vehicle?.id,
      read: false
    });

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      officerName: 'Authority / Control Room',
      role: 'Authority',
      action: `Approved Reroute for ${vehicle?.vehicleNumber || 'TNX-1042'}`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST',
      location: 'NER Logistics Command',
      previousState: 'Route A (NH-13)',
      newState: 'Route B (Shergaon Bypass)',
      details: reason || 'Avoided confirmed NH-13 landslide blockage.'
    });

    res.json({
      success: true,
      message: 'Vehicle rerouted onto optimized safe corridor.',
      vehicle,
      delivery
    });
  });

  // 8. Weather endpoints
  app.get('/api/weather', (req: Request, res: Response) => {
    res.json({ weather: INITIAL_WEATHER });
  });

  // 9. Risk & Disruption corridors
  app.get('/api/risk/corridors', (req: Request, res: Response) => {
    const riskCorridors = roads.map((r) => ({
      roadId: r.id,
      code: r.code,
      name: r.name,
      riskScore: r.riskScore,
      disruptionProbability: r.disruptionProbability,
      predictionWindow: r.predictedDisruptionWindow,
      status: r.status,
      accessibility: r.accessibility,
      rainfallMmH: r.rainfallMmH,
      contributingFactors: r.contributingFactors,
      recommendedAction: r.recommendedAction
    }));

    res.json({ corridors: riskCorridors });
  });

  // 10. Alerts endpoints
  app.get('/api/alerts', (req: Request, res: Response) => {
    const role = (req.query.role as string) || 'authority';
    const filtered = alerts.filter((a) => !a.targetRoles || a.targetRoles.includes(role as any));
    res.json({ alerts: filtered });
  });

  app.post('/api/alerts', (req: Request, res: Response) => {
    const { level, title, message, targetRoles, roadId, vehicleId } = req.body;
    const newAlert: Alert = {
      id: `alt-${Date.now()}`,
      level: level || 'HIGH',
      title: title || 'Logistics Operational Alert',
      message: message || 'System notice regarding transport condition.',
      timestamp: 'Just now',
      targetRoles: targetRoles || ['authority', 'driver', 'field_officer'],
      roadId,
      vehicleId,
      read: false
    };

    alerts.unshift(newAlert);
    res.json({ success: true, alert: newAlert });
  });

  // 10b. News & Live Intelligence endpoints (Strictly India data)
  app.get('/api/news', (req: Request, res: Response) => {
    res.json({ articles: newsArticles });
  });

  app.post('/api/news/analyze', async (req: Request, res: Response) => {
    const { text, source } = req.body;
    let article: NewsArticle;

    const ai = getAI();
    if (ai && text && typeof text === 'string' && text.length > 20) {
      try {
        const prompt = `You are a real-time transport intelligence system monitoring highways in the North Eastern Region of India.
Analyze this news report or disaster bulletin strictly within India (Assam, Arunachal Pradesh, Meghalaya, Nagaland, Sikkim, Manipur, Mizoram, Tripura, West Bengal):
"""${text}"""

Extract JSON with exact keys:
{
  "title": string,
  "highway": string (e.g. "NH-13", "NH-15", "NH-27", "NH-29", "NH-10", "NH-102", "NH-208", "NH-6"),
  "location": string (specific Indian location/district),
  "state": string (Indian state),
  "category": "LANDSLIDE" | "FLOOD" | "ROAD_DAMAGE" | "SNOW" | "CLEARANCE" | "WEATHER",
  "status": "BLOCKED" | "HIGH_RISK" | "MODERATE" | "ACCESSIBLE",
  "impactSummary": string,
  "confidenceScore": number (85-98)
}
Return ONLY valid JSON. No markdown ticks.`;
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        const respText = response.text || '';
        const cleaned = respText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        const highwayMatch = INDIA_HIGHWAY_DIRECTORY[parsed.highway] || INDIA_HIGHWAY_DIRECTORY['NH-13'];
        article = {
          id: `news-ai-${Date.now()}`,
          title: parsed.title || text.substring(0, 80),
          source: source || 'Live Indian Disaster Management Feed',
          publishedAt: 'Live (Just now)',
          content: text,
          category: parsed.category || 'LANDSLIDE',
          country: 'India',
          state: parsed.state || highwayMatch.state,
          extractedHighway: parsed.highway || 'NH-13',
          extractedLocation: parsed.location || highwayMatch.keyLocations[0],
          detectedStatus: parsed.status || 'HIGH_RISK',
          confidenceScore: parsed.confidenceScore || 96,
          impactSummary: parsed.impactSummary || 'Road disruption updated from live Indian news analysis.',
          coordinates: highwayMatch.defaultCoordinates,
          analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          appliedToRoute: false,
          isLiveRealtime: true
        };
      } catch (e) {
        console.warn('AI analysis fallback to NLP parser:', e);
        article = analyzeIndianNewsText(text || '', source || 'Live India Disaster Dispatch');
      }
    } else {
      article = analyzeIndianNewsText(text || '', source || 'Live India Disaster Dispatch');
    }

    newsArticles.unshift(article);
    res.json({ success: true, article });
  });

  app.post('/api/news/apply', (req: Request, res: Response) => {
    const { articleId } = req.body;
    const article = newsArticles.find((a) => a.id === articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Find road by highway code
    const targetRoad = roads.find(
      (r) =>
        r.code === article.extractedHighway ||
        r.code.replace('-', '') === article.extractedHighway.replace('-', '')
    );
    let updatedAlert: Alert | null = null;

    if (targetRoad) {
      targetRoad.status = article.detectedStatus;
      targetRoad.accessibility =
        article.detectedStatus === 'BLOCKED'
          ? 'BLOCKED'
          : article.detectedStatus === 'HIGH_RISK'
          ? 'RESTRICTED'
          : 'ACCESSIBLE';
      targetRoad.recommendedAction = article.impactSummary;
      if (article.detectedStatus === 'BLOCKED') {
        targetRoad.riskScore = 95;
        targetRoad.disruptionProbability = 95;
      } else if (article.detectedStatus === 'HIGH_RISK') {
        targetRoad.riskScore = 78;
        targetRoad.disruptionProbability = 75;
      } else if (article.detectedStatus === 'ACCESSIBLE') {
        targetRoad.riskScore = 18;
        targetRoad.disruptionProbability = 10;
      }
    }

    article.appliedToRoute = true;

    // Generate emergency alert
    const alertLevel =
      article.detectedStatus === 'BLOCKED'
        ? 'CRITICAL'
        : article.detectedStatus === 'HIGH_RISK'
        ? 'HIGH'
        : article.detectedStatus === 'MODERATE'
        ? 'MEDIUM'
        : 'INFO';

    updatedAlert = {
      id: `alt-news-${Date.now()}`,
      level: alertLevel,
      title: `LIVE NEWS ALERT: ${article.extractedHighway} ${article.detectedStatus}`,
      message: `${article.extractedLocation}: ${article.impactSummary} (Source: ${article.source})`,
      timestamp: 'Just now',
      targetRoles: ['authority', 'driver', 'field_officer'],
      roadId: targetRoad?.id,
      read: false
    };
    alerts.unshift(updatedAlert);

    res.json({
      success: true,
      article,
      road: targetRoad,
      alert: updatedAlert
    });
  });

  // 11. Offline sync endpoint
  app.post('/api/sync', (req: Request, res: Response) => {
    const { items } = req.body; // Array of OfflineSyncItem
    const syncedIds: string[] = [];

    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        if (item.type === 'INCIDENT_REPORT' && item.payload) {
          const payload = item.payload;
          const incId = `inc-sync-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          incidents.unshift({
            id: incId,
            incidentCode: `#INC-SYNC-${Math.floor(3000 + Math.random() * 900)}`,
            type: payload.type || 'Landslide',
            severity: payload.severity || 'High',
            lat: payload.lat || 27.24,
            lng: payload.lng || 92.48,
            roadId: payload.roadId || 'road-nh13',
            roadCode: payload.roadCode || 'NH-13',
            reportedBy: payload.reportedBy || 'Offline Field Officer',
            reportedRole: 'Field Officer',
            reportedAt: 'Synced just now (recorded offline)',
            status: 'ACTIVE',
            description: payload.description || 'Synced offline incident record.',
            imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
            aiClassification: payload.aiClassification || {
              incidentType: payload.type || 'Landslide',
              severity: 'High',
              roadImpact: 'FULL_BLOCKAGE',
              confidence: 92,
              recommendedAction: 'Reroute active essential convoys'
            },
            vehiclesAffected: 5,
            deliveriesAffected: 3,
            aiRiskScore: 82
          });
        }
        syncedIds.push(item.id);
      });
    }

    res.json({
      success: true,
      syncedCount: syncedIds.length,
      syncedIds,
      timestamp: new Date().toISOString()
    });
  });

  // 12. What-If Scenario Simulator
  app.post('/api/simulation', (req: Request, res: Response) => {
    const params: SimulationParams = req.body;
    const rain = params.rainfallIncreasePercent || 0;
    const traffic = params.trafficIncreasePercent || 0;
    const closures = params.roadClosureCount || 0;
    const demand = params.emergencyDemand || 'NORMAL';

    // Mathematical modeling of cascading delays and risk
    const demandMultiplier = demand === 'SURGE' ? 1.8 : demand === 'HIGH' ? 1.4 : 1.0;
    const delayHours = Number((1.2 + (rain * 0.04) + (traffic * 0.03) + (closures * 0.6)).toFixed(1));
    const atRisk = Math.min(48, Math.round(14 + (rain * 0.2) + (closures * 4) * demandMultiplier));
    const affectedDistricts = Math.min(10, Math.round(4 + closures + (rain > 20 ? 2 : 0)));
    const alternateCorridors = Math.max(1, Math.min(8, 3 + closures));
    const additionalVehicles = Math.round(6 + (closures * 2) * demandMultiplier);

    const result: SimulationResult = {
      affectedDistricts,
      potentialDelaysHours: delayHours,
      atRiskDeliveries: atRisk,
      recommendedAlternateCorridors: alternateCorridors,
      additionalVehiclesNeeded: additionalVehicles,
      criticalHospitalSupplyAtRisk: Math.round(atRisk * 0.4),
      timestamp: new Date().toISOString()
    };

    res.json({ success: true, params, result });
  });

  // 13. Districts and Resilience
  app.get('/api/districts', (req: Request, res: Response) => {
    res.json({ districts: DISTRICT_RESILIENCE_LIST });
  });

  app.get('/api/districts/:id/intelligence', (req: Request, res: Response) => {
    const district = DISTRICT_RESILIENCE_LIST.find((d) => d.districtId === req.params.id);
    if (!district) return res.status(404).json({ error: 'District not found' });
    res.json({ district });
  });

  // 14. Analytics endpoint
  app.get('/api/analytics', (req: Request, res: Response) => {
    res.json({
      incidentsByType: [
        { type: 'Landslide', count: 18, percentage: 46 },
        { type: 'Flood / Waterlogging', count: 11, percentage: 28 },
        { type: 'Road Fracture', count: 6, percentage: 15 },
        { type: 'Bridge Inspection', count: 3, percentage: 8 },
        { type: 'Vehicle Breakdown', count: 1, percentage: 3 }
      ],
      incidentsByDistrict: [
        { district: 'West Kameng (Arunachal)', incidents: 8, risk: 'Critical' },
        { district: 'Kohima (Nagaland)', incidents: 6, risk: 'High' },
        { district: 'East Sikkim (Sikkim)', incidents: 5, risk: 'Medium' },
        { district: 'Lakhimpur (Assam)', incidents: 4, risk: 'Medium' },
        { district: 'Cachar (Assam)', incidents: 3, risk: 'Low' }
      ],
      deliveryPerformance: {
        avgDelayMinutes: 38,
        etaAccuracyPercent: 91.4,
        reroutesSuccessRate: 98.2,
        criticalDeliveryPreservationRate: 100
      },
      disruptionTrends: [
        { hour: '00:00', riskIndex: 32 },
        { hour: '04:00', riskIndex: 44 },
        { hour: '08:00', riskIndex: 68 },
        { hour: '12:00', riskIndex: 82 },
        { hour: '16:00', riskIndex: 79 },
        { hour: '20:00', riskIndex: 64 }
      ]
    });
  });

  // 15. Emergency Mode Toggle
  app.post('/api/emergency-mode', (req: Request, res: Response) => {
    emergencyModeActive = !emergencyModeActive;
    alerts.unshift({
      id: `alt-${Date.now()}`,
      level: 'CRITICAL',
      title: emergencyModeActive ? '🚨 EMERGENCY DISASTER PROTOCOL ACTIVATED' : 'Standard Logistics Posture Restored',
      message: emergencyModeActive
        ? 'Regional triage active. All priority non-emergency freight halted. Vetted corridors reserved for medical & ration convoys.'
        : 'Normal multi-corridor transit regulations resumed.',
      timestamp: 'Just now',
      targetRoles: ['authority', 'driver', 'field_officer'],
      read: false
    });

    res.json({ success: true, emergencyModeActive });
  });

  // 16. Audit Logs
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    res.json({ auditLogs });
  });

  // 17. AI Logistics Assistant grounded in real-time data & general intelligence
  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const { question, history, lang = 'en' } = req.body;
    const ai = getAI();

    // Prepare live operational context
    const blockedRoadCodes = roads.filter((r) => r.status === 'BLOCKED').map((r) => `${r.code} (${r.name})`);
    const highRiskCodes = roads.filter((r) => r.status === 'HIGH_RISK').map((r) => `${r.code} (${r.name}, risk: ${r.riskScore}/100)`);
    const accessibleCodes = roads.filter((r) => r.status === 'ACCESSIBLE').map((r) => r.code);
    const criticalDeliveries = deliveries
      .filter((d) => d.priority === 'CRITICAL')
      .map((d) => `${d.vehicleNumber} carrying ${d.cargo} to ${d.destination} (Status: ${d.status}, ETA: ${d.eta})`);

    const liveContext = `
TERRANEX LIVE LOGISTICS & DISASTER TELEMETRY (NORTHEAST INDIA):
- Current Blocked Corridors: ${blockedRoadCodes.join(', ') || 'None currently blocked'}
- High-Risk Corridors: ${highRiskCodes.join('; ') || 'None'}
- Fully Accessible Corridors: ${accessibleCodes.join(', ')}
- Primary Route NH-13 (Bhalukpong-Tawang): Risk 78/100, Disruption Probability 82%, Monsoon Downpour (48.5 mm/h), Active Landslide at Km 81.3 (450 m³ debris).
- Recommended Bypass to Tawang: Shergaon Southern Corridor Bypass via NH-15 (+32 mins ETA, risk only 24% vs 86% direct).
- Active Critical Convoys: ${criticalDeliveries.join('; ')}
- Emergency Mode Active: ${emergencyModeActive ? 'YES (Full Emergency Mobilization)' : 'NO (Normal Operations)'}
- Monitored Corridors: NH-13, NH-15, NH-27, NH-29, NH-10, NH-102, NH-208, NH-6 across Assam, Arunachal Pradesh, Meghalaya, Nagaland, Sikkim, Manipur, Mizoram, Tripura.
- Emergency Helplines: National Emergency Unified: 112, NDRF Disaster Control: 1078, Medical Ambulance: 108, Police: 100, Fire: 101, BRO HQ Control Room: 03780-222120.
`;

    if (ai) {
      try {
        // Build conversational history if provided
        let historyPrompt = '';
        if (Array.isArray(history) && history.length > 0) {
          historyPrompt = '\nRecent Conversation History:\n' +
            history.slice(-6).map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n') + '\n';
        }

        const languageInstruction =
          lang === 'hi'
            ? 'Respond in fluent, natural, and helpful Hindi (हिन्दी) script.'
            : lang === 'as'
            ? 'Respond in fluent, natural, and helpful Assamese (অসমীয়া) script.'
            : 'Respond in clear, helpful, well-structured English. If the user asked in another language, reply in that language.';

        const systemPrompt = `You are TerraNex AI, the intelligent, friendly, and comprehensive AI Chatbot and Logistics Intelligence Copilot for India's North Eastern Region (developed for Smart India Hackathon).

YOUR CORE DIRECTIVE:
You MUST answer ANY AND ALL questions asked by the user. You are NOT limited to logistics.
1. If the user asks about roads, landslides, weather, convoys, routes, or disaster safety in Northeast India, utilize the live operational telemetry below to give precise, authoritative, grounded facts.
2. If the user asks general knowledge questions (science, history, mathematics, geography, coding, health, first-aid, vehicle maintenance, disaster survival, daily conversation, culture, language translation, etc.), answer thoroughly, accurately, and politely!
3. If the user asks greetings ("hi", "hello", "who are you"), introduce yourself warmly and outline how you can help.
4. Format your responses with clean markdown (bold terms, bulleted points, clear paragraphs) for maximum readability.
5. ${languageInstruction}

${liveContext}
${historyPrompt}
User Question: ${question}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: systemPrompt
        });

        if (response.text) {
          return res.json({ answer: response.text });
        }
      } catch (err) {
        console.warn('Gemini chat error, switching to rich deterministic responder:', err);
      }
    }

    // Rich multi-domain semantic fallback when offline or API key is not present
    const q = (question || '').trim().toLowerCase();
    let fallbackAnswer = '';

    if (lang === 'hi') {
      if (q.includes('नमस्ते') || q.includes('हैलो') || q.includes('कौन') || q.includes('मदद') || q.includes('hello') || q.includes('hi')) {
        fallbackAnswer = `नमस्ते! मैं **टेरानेक्स एआई (TerraNex AI)** हूँ—पूर्वोत्तर भारत का स्मार्ट लॉजिस्टिक्स और सड़क सुरक्षा सहायक।\n\nमैं आपकी कैसे मदद कर सकता हूँ:\n- 🛣️ **राजमार्ग स्थिति:** एनएच-13, एनएच-15, एनएच-27, एनएच-29 की लाइव स्थिति।\n- 🔄 **वैकल्पिक मार्ग:** भूस्खलन से बचने के लिए शेरगांव बाईपास जैसे सुरक्षित मार्ग।\n- 🚑 **आपातकालीन काफिले:** दवाओं और आवश्यक सामग्री की ट्रैकिंग।\n- 🌦️ **मौसम एवं भूस्खलन चेतावनी:** भारी बारिश और ढलान जोखिम का विश्लेषण।\n- ❓ **सामान्य ज्ञान एवं सुरक्षा:** किसी भी प्रकार के प्रश्न का उत्तर।\n\nआप मुझसे कुछ भी पूछ सकते हैं!`;
      } else if (q.includes('मार्ग') || q.includes('सड़क') || q.includes('हाईवे') || q.includes('ब्लॉक') || q.includes('corridor') || q.includes('nh-13')) {
        fallbackAnswer = `वर्तमान में **एनएच-13 (भालुकपोंग-तवांग)** पर किमी 81.3 पर सक्रिय भूस्खलन के कारण मार्ग **अवरुद्ध (BLOCKED)** है।\n- **एनएच-29 (दीमापुर-कोहिमा):** भारी बारिश के कारण **उच्च जोखिम (HIGH RISK)** पर है।\n- **एनएच-15 और एनएच-27:** पूरी तरह से **सुरक्षित एवं चालू (ACCESSIBLE)** हैं।\n- **तवांग हेतु वैकल्पिक मार्ग:** शेरगांव दक्षिणी कॉरिडोर बाईपास का उपयोग करें।`;
      } else if (q.includes('तवांग') || q.includes('tawang') || q.includes('सुरक्षित')) {
        fallbackAnswer = `तवांग पहुँचने का सबसे सुरक्षित रास्ता **शेरगांव बाईपास (मार्ग B)** है:\n- मार्ग: गुवाहाटी → ओरंग → कलाकतांग → शेरगांव → रूपा → तवांग।\n- यह सीधे मार्ग की तुलना में केवल **+32 मिनट** अधिक लेता है, जबकि भूस्खलन का जोखिम **86% से घटकर 24%** रह जाता है।`;
      } else if (q.includes('दवा') || q.includes('काफिला') || q.includes('डिलीवरी') || q.includes('tnx-1042')) {
        fallbackAnswer = `काफिला **TNX-1042** तवांग के लिए जीवनरक्षक एंटी-वेनम ले जा रहा है। एनएच-13 पर भूस्खलन के कारण इसे शेरगांव बाईपास पर पुनः निर्देशित (rerouted) किया गया है, जिससे इसका जोखिम 63% कम हुआ है। संशोधित ईटीए 5 घंटे 52 मिनट है।`;
      } else if (q.includes('नंबर') || q.includes('हेल्पलाइन') || q.includes('आपातकालीन') || q.includes('फोन') || q.includes('emergency')) {
        fallbackAnswer = `महत्वपूर्ण आपातकालीन हेल्पलाइन नंबर:\n- 🚨 **राष्ट्रीय एकीकृत आपातकाल:** 112\n- 🌊 **एनडीआरएफ आपदा नियंत्रण:** 1078\n- 🚑 **एम्बुलेंस:** 108\n- 👮 **पुलिस नियंत्रण कक्ष:** 100\n- 🚧 **बीआरओ (BRO) मार्ग नियंत्रण:** 03780-222120`;
      } else {
        fallbackAnswer = `आपके प्रश्न: "${question}" के संदर्भ में:\n\nटेरानेक्स एआई लगातार पूर्वोत्तर के 7 रणनीतिक गलियारों की निगरानी कर रहा है।\n- **वर्तमान स्थिति:** एनएच-13 पर किमी 81.3 पर भूस्खलन अवरोध है।\n- **सुरक्षा परामर्श:** पर्वतीय क्षेत्रों में भारी बारिश (48.5 मिमी/घंटा) के दौरान अनावश्यक यात्रा से बचें, लो-गियर इंजन ब्रेकिंग का उपयोग करें।\n- आप मुझसे किसी भी सड़क, मौसम, सुरक्षा उपाय या सामान्य ज्ञान के बारे में पूछ सकते हैं!`;
      }
    } else if (lang === 'as') {
      if (q.includes('নমস্কাৰ') || q.includes('কোন') || q.includes('সহায়') || q.includes('hello') || q.includes('hi')) {
        fallbackAnswer = `নমস্কাৰ! মই **টেৰানেক্স এআই (TerraNex AI)**—উত্তৰ-পূব ভাৰতৰ স্মাৰ্ট পৰিবহণ আৰু পথ সুৰক্ষা সহায়ক।\n\nমই আপোনাক সকলো প্ৰশ্নৰ উত্তৰ দিব পাৰোঁ:\n- 🛣️ **ঘাইপথৰ অৱস্থা:** NH-13, NH-15, NH-27, NH-29 ইত্যাদি।\n- 🔄 **বিকল্প সুৰক্ষিত পথ:** শ্বেৰগাঁও বাইপাছৰ দৰে সুৰক্ষিত বিকল্প।\n- 🚑 **জৰুৰীকালীন সাহায্য বাহন:** ঔষধ আৰু অত্যাৱশ্যকীয় সামগ্ৰীৰ স্থিতি।\n- 🌦️ **বতৰ আৰু ভূমিস্খলন সতৰ্কতা:** লাইভ বৰষুণ আৰু ঢালৰ বিপদাশংকা।\n- ❓ **সাধাৰণ জ্ঞান আৰু সুৰক্ষা নিয়ম:** যিকোনো প্ৰশ্ন সুধিব পাৰে!`;
      } else if (q.includes('পথ') || q.includes('ৰাস্তা') || q.includes('বন্ধ') || q.includes('nh-13')) {
        fallbackAnswer = `বৰ্তমান **NH-13 (ভালুকপুং-তাৱাং)** পথত কিমি ৮১.৩ অংশত ভূমিস্খলনৰ বাবে পথ সম্পূৰ্ণ **বন্ধ (BLOCKED)** হৈ আছে।\n- **NH-29 (ডিমাপুৰ-কহিমা):** উচ্চ বিপদাশংকাৰ অধীনত।\n- **NH-15 আৰু NH-27:** সম্পূৰ্ণ সুচল আৰু সুৰক্ষিত।\n- **তাৱাং যাত্ৰাৰ বাবে:** শ্বেৰগাঁও বাইপাছ পথ ব্যৱহাৰ কৰক।`;
      } else if (q.includes('তাৱাং') || q.includes('tawang') || q.includes('সুৰক্ষিত পথ')) {
        fallbackAnswer = `তাৱাঙলৈ যাবলৈ আটাইতকৈ সুৰক্ষিত পথ হ'ল **শ্বেৰগাঁও বাইপাছ (ৰুট B)**:\n- পথ: গুৱাহাটী → ওৰাং → কালাকটাং → শ্বেৰগাঁও → ৰূপা → তাৱাং।\n- এই পথেৰে মাত্র **+৩২ মিনিট** অধিক সময় লাগে, কিন্তু ভূমিস্খলনৰ বিপদাশংকা **৮৬% ৰ পৰা ২৪% লৈ** হ্রাস পায়।`;
      } else {
        fallbackAnswer = `আপোনাৰ প্ৰশ্ন: "${question}" সম্পৰ্কে:\n\nটেৰানেক্স এআই উত্তৰ-পূৰ্বাঞ্চলৰ ৭টা গুৰুত্বপূৰ্ণ পথ আৰু কনভয়ৰ লাইভ নিৰীক্ষণ কৰি আছে।\n- **জৰুৰীকালীন হেল্পলাইন:** ১১২ (ৰাষ্ট্ৰীয় জৰুৰী সেৱা), ১০৭৮ (এনডিআৰএফ), ১০৮ (এম্বুলেন্স)।\n- পাহাৰীয়া পথত সাৱধানে গাড়ী চলাওক আৰু তীক্ষ্ণ পাকত কম গতি ব্যৱহাৰ কৰক।\n- আপুনি যিকোনো পথ, বতৰ বা সাধাৰণ তথ্যৰ বিষয়ে মোক প্ৰশ্ন সুধিব পাৰে!`;
      }
    } else {
      // English Fallback
      if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('who are you') || q.includes('help') || q.includes('what can you do')) {
        fallbackAnswer = `Hello! I am **TerraNex AI**, your intelligent Assistant & Logistics Copilot for Northeast India (SIH Platform).\n\nI am equipped to answer **all questions** you have, including:\n- 🛣️ **Live Road & Highway Conditions:** Real-time disruption telemetry for NH-13, NH-15, NH-27, NH-29, NH-10, NH-102, NH-208, and NH-6.\n- 🔄 **Safe Dynamic Reroutes:** Alternate mountain corridors (such as the Shergaon Southern Bypass) to avoid landslides.\n- 🚑 **Critical Convoy Tracking:** Monitoring cold-chain medical supplies (e.g., Anti-Venom, Insulin) to remote high-altitude destinations.\n- ⛈️ **Weather & Slope Hazards:** Mountain rainfall intensity, landslide probability thresholds, and flash flood alerts.\n- 🛡️ **Disaster Safety & First Aid:** Mountain driving safety protocols, breakdown handling, and emergency response.\n- 🌐 **General Knowledge & Geography:** Questions about Northeast India, routes, history, science, and general information.\n\nHow can I help you right now?`;
      } else if (q.includes('corridor') || q.includes('high risk') || q.includes('blocked') || q.includes('nh-13') || q.includes('road')) {
        fallbackAnswer = `Here is the current road accessibility status across key Northeast corridors:\n\n- 🚨 **NH-13 (Bhalukpong-Tawang):** **BLOCKED** at Km 81.3 due to a 450 m³ debris rockslide. Heavy rainfall (48.5 mm/h). Transit suspended.\n- ⚠️ **NH-29 (Dimapur-Kohima):** **HIGH RISK** (Risk Score 72/100) due to slope subsidence near Chumukedima.\n- ✅ **NH-15 (North Bank Trunk Road):** **FULLY ACCESSIBLE** (Risk Score 18/100) — safe for transit.\n- ✅ **NH-27 (East-West Highway Corridor):** **FULLY ACCESSIBLE** (Risk Score 12/100).\n- ✅ **NH-10 (Siliguri-Gangtok):** **ACCESSIBLE WITH CAUTION** near Teesta Valley.\n\n*Recommendation:* For Tawang-bound convoys, use the **Shergaon Bypass via NH-15**.`;
      } else if (q.includes('tawang') || q.includes('safest route') || q.includes('sela') || q.includes('bypass') || q.includes('shergaon')) {
        fallbackAnswer = `The safest verified corridor to Tawang is **Route B: Shergaon Southern Corridor Bypass**:\n\n- **Route:** Guwahati → NH-15 (Orang) → Kalaktang → Shergaon → Rupa → Bomdila → Tawang.\n- **Travel Time:** ~6h 15m (+32 mins compared to direct NH-13).\n- **Risk Profile:** Landslide hazard is reduced from **86% down to 24%** (a 62% hazard reduction).\n- **Terrain Quality:** Well-paved all-weather road maintained by Border Roads Organisation (Project Vartak).`;
      } else if (q.includes('delivery') || q.includes('delayed') || q.includes('medicine') || q.includes('tnx-1042') || q.includes('anti-venom') || q.includes('convoy')) {
        fallbackAnswer = `Active Status for Convoy **TNX-1042**:\n\n- **Cargo:** Emergency Anti-Venom Vials (Critical Medical Supply).\n- **Destination:** Tawang District Civil Hospital.\n- **Initial Route:** Direct NH-13 via Bhalukpong.\n- **Incident:** Blocked at Km 81.3 by active rockfall.\n- **AI Action:** Auto-rerouted to the Shergaon Bypass.\n- **Revised ETA:** 5 hours 52 minutes (on schedule, cold-chain temperature maintained at 3.8°C).`;
      } else if (q.includes('emergency') || q.includes('helpline') || q.includes('phone') || q.includes('contact') || q.includes('ndrf') || q.includes('call')) {
        fallbackAnswer = `Essential 24/7 Disaster & Emergency Helplines:\n\n- 🚨 **National Unified Emergency:** **112**\n- 🌊 **NDRF Disaster Response Control:** **1078** (or 011-24363260)\n- 🚑 **Emergency Medical Ambulance:** **108**\n- 👮 **Police Control Room:** **100**\n- 🚧 **Border Roads Organisation (BRO) HQ:** **03780-222120**\n- 🚒 **Fire & Rescue Service:** **101**\n- 📡 **State Disaster Management Authority (SDMA):** **1070** / **1077**`;
      } else if (q.includes('landslide') || q.includes('caught') || q.includes('stuck') || q.includes('safety') || q.includes('tips')) {
        fallbackAnswer = `**Crucial Landslide Safety Protocol for Mountain Corridors:**\n\n1. **Do NOT Attempt to Cross Active Mud:** Mud and small stones precede massive debris avalanches. Never drive into running scree.\n2. **Turn Vehicle Around or Back Away:** If you see tumbling rocks or cracked tarmac, reverse immediately to a wide turnout.\n3. **Stay in the Vehicle or Find Solid Ridge Ground:** If trapped between slides, remain inside the vehicle with hazard flashers on, away from the downslope edge.\n4. **Alert Control Room:** Press the **SOS button** on TerraNex or dial **112** with your nearest highway kilometer marker.\n5. **Wait for BRO Clearances:** Heavy bulldozers and Quick Reaction Teams (QRT) clear primary blockages within 2 to 4 hours.`;
      } else if (q.includes('rain') || q.includes('weather') || q.includes('monsoon') || q.includes('cloudburst')) {
        fallbackAnswer = `**Live Weather & Rainfall Telemetry:**\n\n- **Kameng Sector (Arunachal Pradesh):** Heavy monsoon downpour exceeding **48.5 mm/h**. Soil moisture saturation is at 94%, triggering slope instability warnings.\n- **Naga Hills (Nagaland):** IMD Orange Alert with **36.8 mm/h** rainfall; risk of road subsidence.\n- **Guwahati (Kamrup Metro):** Light showers at **12.4 mm/h**; transit normal.\n- **Meghalaya Plateau (Cherrapunji/Sohra):** Moderate fog and rainfall at **28.2 mm/h**; reduced visibility on NH-6.`;
      } else if (q.includes('drive') || q.includes('driving') || q.includes('brake') || q.includes('fog') || q.includes('mountain')) {
        fallbackAnswer = `**Safe Mountain Driving Guidelines on Ghat Roads:**\n\n- **Engine Braking:** Always use lower gears (1st or 2nd) on steep descents to prevent brake pad overheating and brake fade.\n- **Fog Navigation:** Use low-beam headlights and yellow fog lamps. High beams reflect back off fog and blind oncoming drivers.\n- **Horn on Blind Curves:** Sound your horn before every hairpin bend (Z-bends) on NH-13 and NH-29.\n- **Uphill Right of Way:** Vehicles travelling uphill have the right of way. Pull over slightly to let ascending trucks pass.`;
      } else {
        fallbackAnswer = `Regarding your inquiry: **"${question}"**\n\nAs your AI Assistant, I can provide operational guidance, road safety insights, and general answers:\n\n- **Logistics Status:** 7 arterial Northeast highways are currently monitored. NH-13 is blocked at Km 81.3, while NH-15 and NH-27 are clear.\n- **Assistance Available:** You can ask me about specific highway routes, emergency helplines, landslide safety tips, convoy tracking, weather forecasts, or any general question.\n\nFeel free to ask a follow-up question or specify a destination!`;
      }
    }

    res.json({ answer: fallbackAnswer });
  });

  // 18. SIH 10-Step Deterministic Demo Controller Engine
  app.post('/api/demo/step', (req: Request, res: Response) => {
    const { step } = req.body; // 1 to 10
    const nh13 = roads.find((r) => r.id === 'road-nh13');
    const veh1042 = vehicles.find((v) => v.id === 'veh-tnx1042');
    const del20481 = deliveries.find((d) => d.id === 'del-tx20481');

    switch (step) {
      case 1: // Convoy departs normal
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

      case 2: // Heavy rain begins
        if (nh13) {
          nh13.weatherCondition = 'Heavy Monsoon Downpour & Fog';
          nh13.rainfallMmH = 48.5;
        }
        alerts.unshift({
          id: `alt-demo-${Date.now()}`,
          level: 'HIGH',
          title: 'Heavy Rainfall Warning: Kameng Sector',
          message: 'Precipitation exceeded 48.5 mm/h along NH-13 Bhalukpong approach.',
          timestamp: 'Just now',
          targetRoles: ['authority', 'driver', 'field_officer'],
          read: false
        });
        break;

      case 3: // AI Disruption prediction surges to 82%
        if (nh13) {
          nh13.status = 'HIGH_RISK';
          nh13.accessibility = 'RESTRICTED';
          nh13.riskScore = 78;
          nh13.disruptionProbability = 82;
        }
        if (veh1042) {
          veh1042.riskLevel = 'HIGH';
        }
        alerts.unshift({
          id: `alt-demo-${Date.now()}`,
          level: 'HIGH',
          title: 'AI Prediction: 82% Disruption Probability on NH-13',
          message: 'Explainable factors: 48.5mm rain (+25), 38° slope (+21), 14 historical slides (+17).',
          timestamp: 'Just now',
          targetRoles: ['authority', 'field_officer'],
          read: false
        });
        break;

      case 4: // Field officer reports landslide
      case 5: // AI classifies landslide
        // Add active incident
        const inc = incidents.find((i) => i.id === 'inc-2041');
        if (inc) {
          inc.status = 'ACTIVE';
          inc.reportedAt = 'Just now';
        }
        break;

      case 6: // Road officially marked BLOCKED
        if (nh13) {
          nh13.status = 'BLOCKED';
          nh13.accessibility = 'BLOCKED';
          nh13.riskScore = 92;
          nh13.disruptionProbability = 98;
          nh13.recommendedAction = 'Enforce total roadblock at Bhalukpong; divert supply convoys to Shergaon.';
        }
        alerts.unshift({
          id: `alt-demo-${Date.now()}`,
          level: 'CRITICAL',
          title: '🚨 NH-13 MARKED BLOCKED: 450m³ Landslide at Km 81.3',
          message: 'Direct corridor impassable. 4 critical medical deliveries halted including TNX-1042.',
          timestamp: 'Just now',
          targetRoles: ['authority', 'driver', 'field_officer'],
          read: false
        });
        break;

      case 7: // Driver receives blocked notification
      case 8: // System compares routes
        if (veh1042) {
          veh1042.status = 'DELAYED';
          veh1042.riskLevel = 'CRITICAL';
        }
        break;

      case 9: // Reroute accepted
      case 10: // Authority receives confirmation
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
        alerts.unshift({
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

    res.json({
      success: true,
      step,
      roads,
      vehicles,
      deliveries,
      alerts: alerts.slice(0, 5)
    });
  });

  app.post('/api/demo/reset', (req: Request, res: Response) => {
    roads = JSON.parse(JSON.stringify(INITIAL_ROADS));
    vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    deliveries = JSON.parse(JSON.stringify(INITIAL_DELIVERIES));
    incidents = JSON.parse(JSON.stringify(INITIAL_INCIDENTS));
    alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
    auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    emergencyModeActive = false;

    res.json({
      success: true,
      message: 'Scenario reset to default baseline state.'
    });
  });

  // Standalone / Container Server runner
  export async function startServer() {
    const PORT = 3000;

    // Vite middleware setup
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`TerraNex Server listening on http://0.0.0.0:${PORT}`);
    });
  }

  if (!process.env.VERCEL) {
    startServer().catch((err) => {
      console.error('Failed to start server:', err);
    });
  }
