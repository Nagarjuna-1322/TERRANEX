import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import type { RequestHandler } from 'express';
import { rateLimit } from 'express-rate-limit';

type VerifyToken = (token: string) => Promise<DecodedIdToken>;
export const authenticate = (verify: VerifyToken = async token => {
  const app = getApps()[0] || initializeApp();
  return getAuth(app).verifyIdToken(token, true);
}): RequestHandler => async (req, res, next) => {
  if (req.path === '/health' && req.method === 'GET') return next();
  if (req.path.startsWith('/auth/')) {
    res.status(410).json({ error: 'Use Firebase Authentication to sign in, register, or reset your password.' });
    return;
  }
  const match = /^Bearer ([^\s]+)$/.exec(req.headers.authorization || '');
  if (!match) { res.status(401).json({ error: 'Authentication required' }); return; }
  try {
    res.locals.identity = await verify(match[1]);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
};

export const authorize: RequestHandler = (req, res, next) => {
  if (req.path === '/health' && req.method === 'GET') return next();
  const identity = res.locals.identity as DecodedIdToken;
  const role = identity.role;
  const authority = identity.admin === true || role === 'authority';
  if (req.path.startsWith('/demo/')) {
    if (process.env.ENABLE_DEMO !== 'true' || !authority) {
      res.status(403).json({ error: 'Demo operations disabled' }); return;
    }
  }
  const operational = authority || ['field_officer', 'driver', 'analyst'].includes(role);
  if (!operational) { res.status(403).json({ error: 'An administrator must assign an operational role' }); return; }
  if (req.method === 'GET') {
    if (req.path === '/audit-logs' && !authority) { res.status(403).json({ error: 'Authority role required' }); return; }
    return next();
  }
  const readOnly = ['/routes/optimize', '/simulation', '/ai/assistant', '/incidents/ai-classify'];
  if (readOnly.includes(req.path) || authority) return next();
  if ((req.path === '/incidents' || req.path === '/sync') && role === 'field_officer') return next();
  const vehicle = /^\/vehicles\/([^/]+)\/location$/.exec(req.path);
  if (vehicle && role === 'driver' && identity.vehicleId === vehicle[1]) return next();
  res.status(403).json({ error: 'Insufficient permissions' });
};

export const apiLimiter = rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false });
export const aiLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false });

const statuses = ['ACCESSIBLE', 'MODERATE', 'HIGH_RISK', 'BLOCKED'];
const incidentTypes = ['Landslide', 'Flood', 'Road Damage', 'Bridge Damage', 'Traffic Congestion', 'Vehicle Breakdown', 'Debris', 'Weather Hazard', 'Other'];
const object = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 4000) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;
const number = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const optional = (b: Record<string, any>, key: string, check: (v: any) => boolean) => b[key] === undefined || check(b[key]);
const image = (v: unknown) => typeof v === 'string' && v.length <= 2_000_000 && (/^https:\/\/[^\s]+$/.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v));
export function validIncident(b: unknown): boolean {
  return object(b) && incidentTypes.includes(b.type) && ['Low', 'Medium', 'High', 'Critical'].includes(b.severity)
    && number(b.lat, -90, 90) && number(b.lng, -180, 180) && text(b.roadId, 128) && text(b.description)
    && optional(b, 'roadCode', v => text(v, 128)) && optional(b, 'imageUrl', image);
}
export function validBody(route: string, b: unknown): boolean {
  if (!object(b)) return false;
  // Bound nested values and reject prototype keys before any handler uses them.
  const safe = (v: any, depth = 0): boolean => depth <= 8 && (v === null || typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length <= 2_000_000) || (Array.isArray(v) ? v.length <= 100 && v.every(x => safe(x, depth + 1)) : object(v) && Object.entries(v).every(([k,x]) => !['__proto__','constructor','prototype'].includes(k) && safe(x, depth + 1))));
  if (!safe(b)) return false;
  if (/^\/roads\/[^/]+$/.test(route)) return Object.keys(b).length > 0
    && optional(b,'status',v=>statuses.includes(v)) && optional(b,'accessibility',v=>['ACCESSIBLE','RESTRICTED','BLOCKED'].includes(v))
    && optional(b,'riskScore',v=>number(v,0,100)) && optional(b,'recommendedAction',text) && optional(b,'reason',text);
  if (/^\/vehicles\/[^/]+\/location$/.test(route)) return number(b.lat,-90,90) && number(b.lng,-180,180)
    && optional(b,'speedKmH',v=>number(v,0,300)) && optional(b,'heading',v=>number(v,0,360));
  switch(route) {
    case '/incidents': return validIncident(b);
    case '/incidents/ai-classify': return text(b.description) && optional(b,'imageBase64',v=>typeof v==='string' && v.length<=2_000_000 && /^(?:data:image\/(?:png|jpeg|webp);base64,)?[A-Za-z0-9+/=]+$/.test(v));
    case '/ai/assistant': return text(b.question) && optional(b,'lang',v=>['en','hi','as'].includes(v)) && optional(b,'history',v=>Array.isArray(v) && v.length<=20 && v.every(h=>object(h) && ['user','assistant','ai','bot'].includes(h.sender) && text(h.text)));
    case '/news/analyze': return text(b.text,20000) && optional(b,'source',v=>text(v,200));
    case '/news/apply': return text(b.articleId,128);
    case '/routes/reroute': return text(b.vehicleId,128) && text(b.routeId,128) && optional(b,'reason',text);
    case '/routes/optimize': return text(b.origin,200) && text(b.destination,200);
    case '/alerts': return text(b.title,200) && text(b.message) && ['CRITICAL','HIGH','MEDIUM','INFO'].includes(b.level) && optional(b,'targetRoles',v=>Array.isArray(v) && v.length<=4 && v.every(r=>['authority','field_officer','driver','analyst'].includes(r)));
    case '/simulation': return number(b.rainfallIncreasePercent,0,500) && number(b.trafficIncreasePercent,0,500) && number(b.roadClosureCount,0,100) && Number.isInteger(b.roadClosureCount) && ['NORMAL','HIGH','SURGE'].includes(b.emergencyDemand);
    case '/sync': return Array.isArray(b.items) && b.items.length<=100 && b.items.every(i=>object(i) && text(i.id,128) && i.type==='INCIDENT_REPORT' && validIncident(i.payload));
    case '/demo/step': return Number.isInteger(b.step) && b.step>=1 && b.step<=10;
    case '/demo/reset': case '/emergency-mode': return Object.keys(b).length===0;
    default: return false;
  }
}
export const validateRequest: RequestHandler = (req,res,next) => {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  if (!validBody(req.path,req.body)) { res.status(400).json({ error: 'Invalid request payload' }); return; }
  const identity = res.locals.identity as DecodedIdToken;
  req.body.officerName = identity.name || identity.uid;
  req.body.reportedBy = identity.name || identity.uid;
  req.body.reportedRole = identity.role || 'authority';
  if (req.path === '/sync') for (const item of req.body.items) {
    item.payload.reportedBy = req.body.reportedBy;
    delete item.payload.aiClassification;
  }
  next();
};

export function validNewsAnalysis(b: unknown): boolean {
  return object(b) && text(b.title,200) && text(b.highway,20) && text(b.location,200) && text(b.state,100)
    && ['LANDSLIDE','FLOOD','ROAD_DAMAGE','SNOW','CLEARANCE','WEATHER'].includes(b.category)
    && statuses.includes(b.status) && text(b.impactSummary) && number(b.confidenceScore,0,100);
}
export function validClassification(b: unknown): boolean {
  return object(b) && incidentTypes.includes(b.incidentType) && ['Low','Medium','High','Critical'].includes(b.severity)
    && ['NO_IMPACT','PARTIAL_RESTRICTION','FULL_BLOCKAGE'].includes(b.roadImpact)
    && number(b.confidence,0,100) && text(b.recommendedAction) && text(b.reasoning);
}
