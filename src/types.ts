export type UserRole = 'authority' | 'field_officer' | 'driver' | 'analyst';

export interface User {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  role: UserRole;
  organization: string;
  state: string;
  district: string;
  avatar?: string;
}

export type RoadStatus = 'ACCESSIBLE' | 'MODERATE' | 'HIGH_RISK' | 'BLOCKED';

export interface RoadRiskFactor {
  name: string;
  score: number;
  description: string;
}

export interface Road {
  id: string;
  code: string; // e.g. NH-13, NH-15, NH-27
  name: string;
  state: string;
  districts: string[];
  status: RoadStatus;
  riskScore: number; // 0-100
  disruptionProbability: number; // 0-100%
  predictedDisruptionWindow: string; // e.g. "Next 6 hours"
  avgSpeedKmH: number;
  weatherCondition: string;
  rainfallMmH: number;
  recentIncidentCount: number;
  accessibility: 'ACCESSIBLE' | 'RESTRICTED' | 'BLOCKED';
  recommendedAction: string;
  coordinates: [number, number][]; // lat, lng polyline
  contributingFactors: RoadRiskFactor[];
  elevationMeters: number;
  slopeAngleDeg: number;
  historicalLandslideCount: number;
  alternateCorridorId?: string;
  alternateCorridorName?: string;
}

export type VehicleType = 'LOGISTICS' | 'EMERGENCY' | 'CONSTRUCTION';
export type VehicleStatus = 'IN_TRANSIT' | 'IDLE' | 'LOADING' | 'ARRIVED' | 'DELAYED' | 'REROUTED';

export interface Vehicle {
  id: string;
  vehicleNumber: string; // e.g. TNX-1042
  type: VehicleType;
  driverName: string;
  driverPhone: string;
  cargo: string;
  cargoPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  origin: string;
  destination: string;
  currentLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  speedKmH: number;
  status: VehicleStatus;
  currentRoadId: string;
  currentRoadCode: string;
  distanceRemainingKm: number;
  eta: string; // e.g. "7h 04m"
  predictedDelayMinutes: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  activeRouteId: string;
  lastGpsUpdate: string;
  heading: number; // 0-360 deg
  isRerouted?: boolean;
}

export type DeliveryStage = 'DISPATCHED' | 'LOADED' | 'DEPARTED' | 'IN_TRANSIT' | 'NEAR_DESTINATION' | 'DELIVERED';

export interface Delivery {
  id: string;
  deliveryCode: string; // e.g. #TX-20481
  cargo: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number; // 0-100
  priorityReasons: string[];
  origin: string;
  destination: string;
  vehicleId: string;
  vehicleNumber: string;
  status: 'IN_TRANSIT' | 'DELAYED' | 'DELIVERED' | 'REROUTED';
  currentStage: DeliveryStage;
  eta: string;
  predictedDelayMinutes: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deadline: string;
  populationServed: number;
  affectedDistricts: string[];
  medicalConvoy?: boolean;
}

export type IncidentType =
  | 'Landslide'
  | 'Flood'
  | 'Road Damage'
  | 'Bridge Damage'
  | 'Traffic Congestion'
  | 'Vehicle Breakdown'
  | 'Debris'
  | 'Weather Hazard'
  | 'Other';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Incident {
  id: string;
  incidentCode: string; // e.g. #INC-2041
  type: IncidentType;
  severity: IncidentSeverity;
  lat: number;
  lng: number;
  roadId: string;
  roadCode: string;
  reportedBy: string;
  reportedRole: string;
  reportedAt: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
  description: string;
  imageUrl?: string;
  aiClassification?: {
    incidentType: IncidentType;
    severity: IncidentSeverity;
    roadImpact: 'NO_IMPACT' | 'PARTIAL_RESTRICTION' | 'FULL_BLOCKAGE';
    confidence: number;
    recommendedAction: string;
  };
  vehiclesAffected: number;
  deliveriesAffected: number;
  aiRiskScore: number;
}

export interface RouteOption {
  id: string;
  name: string; // Route A, Route B, Route C
  distanceKm: number;
  eta: string;
  riskPercentage: number;
  traffic: 'Low' | 'Medium' | 'High';
  weatherRisk: 'Low' | 'Medium' | 'High';
  status: 'RECOMMENDED' | 'AVOID' | 'BACKUP';
  pathDescription: string;
  coordinates: [number, number][];
  roadIds: string[];
  costScore: number;
  explanation: string;
}

export interface Alert {
  id: string;
  level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  targetRoles: UserRole[];
  roadId?: string;
  vehicleId?: string;
  deliveryId?: string;
  read: boolean;
  actionUrl?: string;
}

export interface WeatherData {
  region: string;
  state: string;
  temperatureC: number;
  condition: string;
  rainfallMmH: number;
  humidityPercent: number;
  windSpeedKmh: number;
  visibilityKm: number;
  severeWarning: string | null;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedCorridorCount: number;
  affectedDeliveryCount: number;
  estimatedDelayStr: string;
}

export interface DistrictResilience {
  districtId: string;
  name: string;
  state: string;
  connectivity: number;
  roadReliability: number;
  weatherRisk: number;
  supplyCoverage: number;
  emergencyAccess: number;
  overallScore: number;
  status: 'HIGH' | 'MODERATE' | 'LOW';
  activeVehicles: number;
  activeDeliveries: number;
  blockedRoads: number;
  highRiskCorridors: number;
  activeIncidents: number;
  weather: string;
}

export interface SimulationParams {
  rainfallIncreasePercent: number;
  trafficIncreasePercent: number;
  roadClosureCount: number;
  emergencyDemand: 'NORMAL' | 'HIGH' | 'SURGE';
}

export interface SimulationResult {
  affectedDistricts: number;
  potentialDelaysHours: number;
  atRiskDeliveries: number;
  recommendedAlternateCorridors: number;
  additionalVehiclesNeeded: number;
  criticalHospitalSupplyAtRisk: number;
  timestamp: string;
}

export interface OfflineSyncItem {
  id: string;
  type: 'INCIDENT_REPORT' | 'ROAD_STATUS_UPDATE' | 'GPS_LOG';
  payload: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retryCount: number;
}

export interface AuditLog {
  id: string;
  officerName: string;
  role: string;
  action: string;
  timestamp: string;
  location: string;
  previousState: string;
  newState: string;
  details: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string; // e.g., 'ASDMA Assam', 'BRO Taskforce 88', 'PIB India', 'The Hindu (Northeast)', 'DD News India', 'IMD Bulletin'
  publishedAt: string;
  url?: string;
  content: string;
  category: 'LANDSLIDE' | 'FLOOD' | 'ROAD_DAMAGE' | 'SNOW' | 'CLEARANCE' | 'WEATHER';
  country: 'India';
  state: string; // Indian state e.g., 'Assam', 'Arunachal Pradesh', 'Meghalaya', 'Nagaland', 'Sikkim', 'Manipur', 'Mizoram', 'Tripura'
  extractedHighway: string; // e.g., 'NH-13', 'NH-15', 'NH-27', 'NH-29', 'NH-10'
  extractedLocation: string; // Indian landmark e.g., 'Bhalukpong Km 81.3, West Kameng'
  detectedStatus: RoadStatus; // 'BLOCKED' | 'HIGH_RISK' | 'MODERATE' | 'ACCESSIBLE'
  confidenceScore: number; // 0-100
  impactSummary: string;
  coordinates: [number, number]; // Strictly inside India [lat, lng]
  analyzedAt: string;
  appliedToRoute: boolean;
  isLiveRealtime?: boolean;
}

export interface NewsAnalysisResult {
  article: NewsArticle;
  affectedRoad?: Road;
  updatedEmergencyAlert?: Alert;
  statusChanged: boolean;
  previousStatus?: RoadStatus;
  newStatus?: RoadStatus;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  source: 'gps' | 'preset';
}

