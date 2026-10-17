import 'dotenv/config';
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

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const requestTracker = new Map<string, { count: number; resetAt: number }>();

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
app.disable('x-powered-by');
app.use(express.json({ limit: '10mb' }));
app.use((req: Request, res: Response, next: () => void) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const current = requestTracker.get(ip);

  if (!current || now >= current.resetAt) {
    requestTracker.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  current.count += 1;
  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please wait a moment and try again.'
    });
  }

  return next();
});
app.use((req: Request, res: Response, next: () => void) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

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
  const cleanedEmail = typeof email === 'string' ? email.trim() : '';
  const cleanedRole = typeof role === 'string' ? role.trim() : 'authority';

  if (cleanedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
    return res.status(400).json({ success: false, error: 'Invalid email format.' });
  }

  const demoUsers: Record<string, any> = {
    authority: {
      id: 'usr-auth-01',
      name: 'Rajesh Sharma, IAS',
      employeeId: 'NER-ADM-2041',
      email: cleanedEmail || 'authority@terranex.gov.in',
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
      email: cleanedEmail || 'field@terranex.gov.in',
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
      email: cleanedEmail || 'driver@terranex.gov.in',
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
      email: cleanedEmail || 'analyst@terranex.gov.in',
      phone: '+91 98640 55102',
      role: 'analyst',
      organization: 'North Eastern Space Applications Centre (NESAC GIS)',
      state: 'Meghalaya',
      district: 'Umiam'
    }
  };

  const targetRole = demoUsers[cleanedRole] ? cleanedRole : 'authority';
  const user = demoUsers[targetRole] || demoUsers.authority;

  res.json({
    success: true,
    token: `tnx_jwt_${Date.now()}_${user.id}`,
    user
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, employeeId, email, phone, organization, state, district, role } = req.body;
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  const normalizedEmail = typeof email === 'string' ? email.trim() : '';

  if (!normalizedName || normalizedName.length < 2) {
    return res.status(400).json({ success: false, error: 'Name must be at least 2 characters long.' });
  }
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(400).json({ success: false, error: 'Invalid email format.' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: normalizedName || 'Officer',
    employeeId: employeeId || `NER-${Math.floor(1000 + Math.random() * 9000)}`,
    email: normalizedEmail || 'user@terranex.gov.in',
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
  const normalizedIdentifier = typeof identifier === 'string' ? identifier.trim() : '';

  res.json({
    success: true,
    message: `Verification OTP generated for ${normalizedIdentifier || 'employee ID'}.`,
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

// rest of the file continues unchanged
