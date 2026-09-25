import { User, Road, Vehicle, Delivery, Incident, WeatherData, DistrictResilience, AuditLog, RouteOption } from '../types.ts';

export const INITIAL_USER: User = {
  id: 'usr-auth-01',
  name: 'Rajesh Sharma, IAS',
  employeeId: 'NER-IAS-2018',
  email: 'rajesh.sharma@terranex.gov.in',
  phone: '+91 94360 12849',
  role: 'authority',
  organization: 'NER Logistics Authority & Border Infrastructure Command',
  state: 'Assam',
  district: 'Kamrup Metro'
};

export const INITIAL_ROADS: Road[] = [
  {
    id: 'road-nh13',
    code: 'NH-13',
    name: 'Trans-Arunachal Highway (Bhalukpong-Tawang)',
    state: 'Arunachal Pradesh',
    districts: ['West Kameng', 'Tawang'],
    status: 'HIGH_RISK',
    riskScore: 78,
    disruptionProbability: 82,
    predictedDisruptionWindow: 'Next 6 hours',
    avgSpeedKmH: 32,
    weatherCondition: 'Heavy Rainfall & Dense Fog',
    rainfallMmH: 48.5,
    recentIncidentCount: 3,
    accessibility: 'RESTRICTED',
    recommendedAction: 'Prepare alternate corridor via Tezpur-Shergaon bypass or delay non-critical convoys',
    elevationMeters: 2240,
    slopeAngleDeg: 38,
    historicalLandslideCount: 14,
    alternateCorridorId: 'road-nh15-alt',
    alternateCorridorName: 'NH-15 South Corridor via Shergaon Bypass',
    coordinates: [
      [26.985, 92.65], // Bhalukpong
      [27.15, 92.52],  // Tenga valley
      [27.35, 92.24],  // Dirang
      [27.50, 92.05],  // Sela Pass
      [27.586, 91.86]  // Tawang
    ],
    contributingFactors: [
      { name: 'Heavy Rainfall', score: 25, description: '48.5 mm/h sustained precipitation saturating upper strata' },
      { name: 'Slope Susceptibility', score: 21, description: '38° steep fractured schist & shale mountain wall' },
      { name: 'Historical Incidents', score: 17, description: '14 mudslides documented at Km 72-84 in monsoon cycles' },
      { name: 'Road Condition', score: 12, description: 'Single-lane gravel widening sector vulnerable to erosion' },
      { name: 'Traffic Bottleneck', score: 5, description: 'Convoy queue density near Sela approach' }
    ]
  },
  {
    id: 'road-nh15',
    code: 'NH-15',
    name: 'Northern Brahmaputra Arterial (Baihhata-Tezpur-Lakhimpur)',
    state: 'Assam',
    districts: ['Kamrup', 'Darrang', 'Sonitpur', 'Lakhimpur'],
    status: 'ACCESSIBLE',
    riskScore: 24,
    disruptionProbability: 18,
    predictedDisruptionWindow: 'Next 24 hours (Stable)',
    avgSpeedKmH: 58,
    weatherCondition: 'Moderate Showers',
    rainfallMmH: 12.2,
    recentIncidentCount: 1,
    accessibility: 'ACCESSIBLE',
    recommendedAction: 'Primary viable corridor for Arunachal & upper Assam supply convoys',
    elevationMeters: 110,
    slopeAngleDeg: 6,
    historicalLandslideCount: 1,
    coordinates: [
      [26.18, 91.75], // Guwahati
      [26.35, 92.12], // Mangaldai
      [26.65, 92.79], // Tezpur
      [26.95, 93.85], // Biswanath
      [27.23, 94.10]  // North Lakhimpur
    ],
    contributingFactors: [
      { name: 'Culvert Waterlogging', score: 10, description: 'Localized drainage overflow at Km 114' },
      { name: 'Pavement Friction', score: 7, description: 'Wet surface reduced braking friction' },
      { name: 'Heavy Goods Traffic', score: 5, description: 'Commercial tanker volume' },
      { name: 'Rainfall', score: 2, description: 'Intermittent squalls' }
    ]
  },
  {
    id: 'road-nh27',
    code: 'NH-27',
    name: 'East-West Expressway Spine (Guwahati-Nagaon-Daboka)',
    state: 'Assam',
    districts: ['Kamrup Metro', 'Marigaon', 'Nagaon'],
    status: 'ACCESSIBLE',
    riskScore: 16,
    disruptionProbability: 9,
    predictedDisruptionWindow: 'Clear for 48 hours',
    avgSpeedKmH: 74,
    weatherCondition: 'Overcast, Light Breeze',
    rainfallMmH: 4.0,
    recentIncidentCount: 0,
    accessibility: 'ACCESSIBLE',
    recommendedAction: 'Maintain normal tactical logistics dispatch speeds',
    elevationMeters: 65,
    slopeAngleDeg: 2,
    historicalLandslideCount: 0,
    coordinates: [
      [26.14, 91.73], // Guwahati
      [26.18, 92.15], // Jagiroad
      [26.34, 92.68], // Nagaon
      [26.02, 92.95]  // Doboka junction
    ],
    contributingFactors: [
      { name: 'Traffic Volume', score: 9, description: 'High commercial logistics density' },
      { name: 'Road Works', score: 5, description: 'Bridge deck resurfacing at Jagiroad bypass' },
      { name: 'Weather', score: 2, description: 'Light mist' }
    ]
  },
  {
    id: 'road-nh29',
    code: 'NH-29',
    name: 'Naga Hills Lifeline (Dimapur-Kohima-Imphal)',
    state: 'Nagaland & Manipur',
    districts: ['Dimapur', 'Kohima', 'Senapati', 'Imphal West'],
    status: 'HIGH_RISK',
    riskScore: 71,
    disruptionProbability: 68,
    predictedDisruptionWindow: 'Next 12 hours',
    avgSpeedKmH: 28,
    weatherCondition: 'Torrential Downpour & Ridge Winds',
    rainfallMmH: 36.8,
    recentIncidentCount: 4,
    accessibility: 'RESTRICTED',
    recommendedAction: 'Restrict heavy tonnage trailers; enforce convoy escort past Zubza',
    elevationMeters: 1440,
    slopeAngleDeg: 34,
    historicalLandslideCount: 19,
    alternateCorridorId: 'road-nh29-alt',
    alternateCorridorName: 'Peducha-Tsiesema bypass bypass',
    coordinates: [
      [25.90, 93.72], // Dimapur
      [25.75, 93.95], // Chumukedima / Medziphema
      [25.67, 94.10], // Kohima
      [25.32, 94.02], // Senapati
      [24.81, 93.93]  // Imphal
    ],
    contributingFactors: [
      { name: 'Chumukedima Subsidence', score: 24, description: 'Active soil slippage near 4-lane cliff cut' },
      { name: 'Torrential Precipitation', score: 22, description: '36.8 mm/h rainfall with flash runoffs' },
      { name: 'Gradients & Hairpins', score: 14, description: 'Heavy vehicle crawl causing 4km backlog' },
      { name: 'Historical Failures', score: 11, description: 'Seasonal roadbed sinking' }
    ]
  },
  {
    id: 'road-nh10',
    code: 'NH-10',
    name: 'Teesta Gorge Corridor (Sevoke-Kalimpong-Gangtok)',
    state: 'Sikkim & West Bengal',
    districts: ['Darjeeling', 'Kalimpong', 'Pakyong', 'East Sikkim'],
    status: 'MODERATE',
    riskScore: 54,
    disruptionProbability: 46,
    predictedDisruptionWindow: 'Next 18 hours',
    avgSpeedKmH: 36,
    weatherCondition: 'Intermittent Showers & River Swell',
    rainfallMmH: 22.0,
    recentIncidentCount: 2,
    accessibility: 'RESTRICTED',
    recommendedAction: 'Monitor Teesta river gauge; maintain earthmoving crews at 29th Mile',
    elevationMeters: 1650,
    slopeAngleDeg: 42,
    historicalLandslideCount: 22,
    coordinates: [
      [26.88, 88.47], // Sevoke
      [27.08, 88.52], // Teesta Bazaar
      [27.18, 88.55], // Rangpo checkpoint
      [27.24, 88.60], // Singtam
      [27.33, 88.61]  // Gangtok
    ],
    contributingFactors: [
      { name: 'Teesta River Scour', score: 20, description: 'Toe erosion of embankment along 29th Mile' },
      { name: 'Gorge Rockfall Risk', score: 16, description: 'Overhanging unstable boulders' },
      { name: 'Precipitation Level', score: 12, description: '22 mm/h localized rain' },
      { name: 'Single Lane Blockages', score: 6, description: 'Occasional breakdown pauses' }
    ]
  },
  {
    id: 'road-nh306',
    code: 'NH-306',
    name: 'Barak-Mizoram Ridge (Silchar-Kolasib-Aizawl)',
    state: 'Assam & Mizoram',
    districts: ['Cachar', 'Kolasib', 'Aizawl'],
    status: 'MODERATE',
    riskScore: 48,
    disruptionProbability: 38,
    predictedDisruptionWindow: 'Next 24 hours',
    avgSpeedKmH: 34,
    weatherCondition: 'Drizzle & Low Clouds',
    rainfallMmH: 14.5,
    recentIncidentCount: 1,
    accessibility: 'ACCESSIBLE',
    recommendedAction: 'Single axle trucks recommended; verify Vairengte gate clear',
    elevationMeters: 1130,
    slopeAngleDeg: 28,
    historicalLandslideCount: 8,
    coordinates: [
      [24.83, 92.79], // Silchar
      [24.50, 92.75], // Vairengte gate
      [24.22, 92.67], // Kolasib
      [23.73, 92.71]  // Aizawl
    ],
    contributingFactors: [
      { name: 'Clay Soil Softening', score: 18, description: 'Soft red clay slush causing traction loss' },
      { name: 'Narrow Ridge Roads', score: 15, description: 'Single vehicle passing bays' },
      { name: 'Moderate Rain', score: 10, description: 'Continuous light moisture' },
      { name: 'Heavy Supply Convoy', score: 5, description: 'Fuel tankers queue' }
    ]
  },
  {
    id: 'road-nh208',
    code: 'NH-208',
    name: 'Tripura Inter-State Corridor (Kumarghat-Agartala)',
    state: 'Tripura',
    districts: ['North Tripura', 'Dhalai', 'West Tripura'],
    status: 'ACCESSIBLE',
    riskScore: 22,
    disruptionProbability: 14,
    predictedDisruptionWindow: 'Clear for 72 hours',
    avgSpeedKmH: 62,
    weatherCondition: 'Clear with Scattered Cloud',
    rainfallMmH: 2.0,
    recentIncidentCount: 0,
    accessibility: 'ACCESSIBLE',
    recommendedAction: 'All freight categories operating normally',
    elevationMeters: 45,
    slopeAngleDeg: 4,
    historicalLandslideCount: 1,
    coordinates: [
      [24.16, 92.02], // Kumarghat
      [23.95, 91.85], // Ambassa
      [23.83, 91.50], // Teliamura
      [23.83, 91.28]  // Agartala
    ],
    contributingFactors: [
      { name: 'Bridge Inspection', score: 12, description: 'Annual structural check at Manu river' },
      { name: 'Local Traffic', score: 7, description: 'Market day agricultural carts' },
      { name: 'Weather', score: 3, description: 'Dry road surface' }
    ]
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-tnx1042',
    vehicleNumber: 'TNX-1042',
    type: 'EMERGENCY',
    driverName: 'Tsering Dorjee',
    driverPhone: '+91 94360 88219',
    cargo: 'Emergency Anti-Venom & Pediatric Trauma Kits',
    cargoPriority: 'CRITICAL',
    origin: 'Guwahati Military Base Logistics Depot',
    destination: 'Tawang District Hospital Relief Center',
    currentLocation: {
      lat: 27.21,
      lng: 92.42,
      name: 'Between Bhalukpong & Dirang (Approach Km 78)'
    },
    speedKmH: 34,
    status: 'IN_TRANSIT',
    currentRoadId: 'road-nh13',
    currentRoadCode: 'NH-13',
    distanceRemainingKm: 248,
    eta: '7h 04m',
    predictedDelayMinutes: 48,
    riskLevel: 'HIGH',
    activeRouteId: 'route-nh13-primary',
    lastGpsUpdate: '1 minute ago (Live Telemetry)',
    heading: 320,
    isRerouted: false
  },
  {
    id: 'veh-tnx1021',
    vehicleNumber: 'TNX-1021',
    type: 'LOGISTICS',
    driverName: 'Bikram Saikia',
    driverPhone: '+91 98640 12398',
    cargo: 'Cold-Chain Insulin & Newborn Vaccines',
    cargoPriority: 'HIGH',
    origin: 'Tezpur Medical College Regional Depot',
    destination: 'Itanagar Tomo Riba Institute of Health Sciences',
    currentLocation: {
      lat: 26.85,
      lng: 93.15,
      name: 'NH-15 Gohpur bypass'
    },
    speedKmH: 52,
    status: 'IN_TRANSIT',
    currentRoadId: 'road-nh15',
    currentRoadCode: 'NH-15',
    distanceRemainingKm: 118,
    eta: '2h 15m',
    predictedDelayMinutes: 12,
    riskLevel: 'LOW',
    activeRouteId: 'route-nh15-main',
    lastGpsUpdate: 'Just now',
    heading: 45
  },
  {
    id: 'veh-tnx2015',
    vehicleNumber: 'TNX-2015',
    type: 'EMERGENCY',
    driverName: 'Emlang Lyngdoh',
    driverPhone: '+91 98560 44211',
    cargo: 'Cryogenic Liquid Medical Oxygen Tanks',
    cargoPriority: 'CRITICAL',
    origin: 'Guwahati Refineries Plant',
    destination: 'NEIGRIHMS Shillong',
    currentLocation: {
      lat: 25.92,
      lng: 91.87,
      name: 'Umiam Lake Viaduct ascent'
    },
    speedKmH: 42,
    status: 'IN_TRANSIT',
    currentRoadId: 'road-nh27',
    currentRoadCode: 'NH-27 / GS Road',
    distanceRemainingKm: 42,
    eta: '1h 10m',
    predictedDelayMinutes: 5,
    riskLevel: 'LOW',
    activeRouteId: 'route-shillong-direct',
    lastGpsUpdate: '30 seconds ago',
    heading: 180
  },
  {
    id: 'veh-tnx3044',
    vehicleNumber: 'TNX-3044',
    type: 'LOGISTICS',
    driverName: 'Kevi Angami',
    driverPhone: '+91 94364 77610',
    cargo: 'Disaster Relief Grain & Water Purification Kits',
    cargoPriority: 'HIGH',
    origin: 'Dimapur FCI Grain Silo Complex',
    destination: 'Kohima Civil Administration Warehouse',
    currentLocation: {
      lat: 25.79,
      lng: 93.88,
      name: 'Near Medziphema Cliff Corridor'
    },
    speedKmH: 26,
    status: 'DELAYED',
    currentRoadId: 'road-nh29',
    currentRoadCode: 'NH-29',
    distanceRemainingKm: 38,
    eta: '2h 45m',
    predictedDelayMinutes: 55,
    riskLevel: 'HIGH',
    activeRouteId: 'route-nh29-spine',
    lastGpsUpdate: '2 minutes ago',
    heading: 135
  },
  {
    id: 'veh-tnx4011',
    vehicleNumber: 'TNX-4011',
    type: 'EMERGENCY',
    driverName: 'Lalremruata',
    driverPhone: '+91 98623 90114',
    cargo: 'Whole Blood Units & Surgical Trauma Packs',
    cargoPriority: 'CRITICAL',
    origin: 'Silchar Medical College Blood Bank',
    destination: 'Aizawl Civil Hospital Emergency Triage',
    currentLocation: {
      lat: 24.38,
      lng: 92.71,
      name: 'Kolasib Northern Pass'
    },
    speedKmH: 31,
    status: 'IN_TRANSIT',
    currentRoadId: 'road-nh306',
    currentRoadCode: 'NH-306',
    distanceRemainingKm: 84,
    eta: '3h 10m',
    predictedDelayMinutes: 20,
    riskLevel: 'MEDIUM',
    activeRouteId: 'route-nh306-mizoram',
    lastGpsUpdate: '1 minute ago',
    heading: 195
  },
  {
    id: 'veh-tnx5092',
    vehicleNumber: 'TNX-5092',
    type: 'CONSTRUCTION',
    driverName: 'Phurba Bhutia',
    driverPhone: '+91 97330 55190',
    cargo: 'Heavy Hydraulic Excavator & Bailey Bridge Panels',
    cargoPriority: 'MEDIUM',
    origin: 'Sevoke BRO Base Workshop',
    destination: 'Singtam Disaster Response Base',
    currentLocation: {
      lat: 27.12,
      lng: 88.51,
      name: 'Teesta Low Dam Site IV'
    },
    speedKmH: 28,
    status: 'IN_TRANSIT',
    currentRoadId: 'road-nh10',
    currentRoadCode: 'NH-10',
    distanceRemainingKm: 56,
    eta: '2h 05m',
    predictedDelayMinutes: 18,
    riskLevel: 'MEDIUM',
    activeRouteId: 'route-nh10-teesta',
    lastGpsUpdate: '3 minutes ago',
    heading: 30
  }
];

export const INITIAL_DELIVERIES: Delivery[] = [
  {
    id: 'del-tx20481',
    deliveryCode: '#TX-20481',
    cargo: 'Emergency Anti-Venom & Pediatric Trauma Kits',
    priority: 'CRITICAL',
    priorityScore: 98,
    priorityReasons: [
      'Critical medical supplies for high-altitude isolation ward',
      'Remote mountainous destination with 0 local manufacturing',
      'Strict 12-hour cold life deadline on biological serums'
    ],
    origin: 'Guwahati Military Base Logistics Depot',
    destination: 'Tawang District Hospital Relief Center',
    vehicleId: 'veh-tnx1042',
    vehicleNumber: 'TNX-1042',
    status: 'IN_TRANSIT',
    currentStage: 'IN_TRANSIT',
    eta: '7h 04m',
    predictedDelayMinutes: 48,
    riskLevel: 'HIGH',
    deadline: 'Today, 21:00 IST',
    populationServed: 48500,
    affectedDistricts: ['Tawang', 'West Kameng'],
    medicalConvoy: true
  },
  {
    id: 'del-tx20482',
    deliveryCode: '#TX-20482',
    cargo: 'Cold-Chain Insulin & Newborn Vaccines',
    priority: 'HIGH',
    priorityScore: 84,
    priorityReasons: [
      'Universal immunization batch for state capital clinics',
      'Refrigeration unit dependent on vehicle inverter power'
    ],
    origin: 'Tezpur Medical College Regional Depot',
    destination: 'Itanagar Tomo Riba Institute of Health Sciences',
    vehicleId: 'veh-tnx1021',
    vehicleNumber: 'TNX-1021',
    status: 'IN_TRANSIT',
    currentStage: 'IN_TRANSIT',
    eta: '2h 15m',
    predictedDelayMinutes: 12,
    riskLevel: 'LOW',
    deadline: 'Today, 18:30 IST',
    populationServed: 125000,
    affectedDistricts: ['Papum Pare'],
    medicalConvoy: false
  },
  {
    id: 'del-tx20483',
    deliveryCode: '#TX-20483',
    cargo: 'Cryogenic Liquid Medical Oxygen Tanks',
    priority: 'CRITICAL',
    priorityScore: 96,
    priorityReasons: [
      'ICU life-support pipeline replenishment for regional hospital',
      'Hazardous pressurized cargo requires vetted road grade'
    ],
    origin: 'Guwahati Refineries Plant',
    destination: 'NEIGRIHMS Shillong',
    vehicleId: 'veh-tnx2015',
    vehicleNumber: 'TNX-2015',
    status: 'IN_TRANSIT',
    currentStage: 'IN_TRANSIT',
    eta: '1h 10m',
    predictedDelayMinutes: 5,
    riskLevel: 'LOW',
    deadline: 'Today, 16:45 IST',
    populationServed: 820000,
    affectedDistricts: ['East Khasi Hills'],
    medicalConvoy: true
  },
  {
    id: 'del-tx20484',
    deliveryCode: '#TX-20484',
    cargo: 'Disaster Relief Grain & Water Purification Kits',
    priority: 'HIGH',
    priorityScore: 78,
    priorityReasons: [
      'Subsidized food buffer following localized monsoon washout',
      'Public distribution shops facing 3-day stock exhaustion'
    ],
    origin: 'Dimapur FCI Grain Silo Complex',
    destination: 'Kohima Civil Administration Warehouse',
    vehicleId: 'veh-tnx3044',
    vehicleNumber: 'TNX-3044',
    status: 'DELAYED',
    currentStage: 'IN_TRANSIT',
    eta: '2h 45m',
    predictedDelayMinutes: 55,
    riskLevel: 'HIGH',
    deadline: 'Today, 20:00 IST',
    populationServed: 115000,
    affectedDistricts: ['Kohima'],
    medicalConvoy: false
  },
  {
    id: 'del-tx20485',
    deliveryCode: '#TX-20485',
    cargo: 'Whole Blood Units & Surgical Trauma Packs',
    priority: 'CRITICAL',
    priorityScore: 94,
    priorityReasons: [
      'O-Negative reserve shortage in district referral operating theaters',
      'Active medical convoy under district magistracy requisition'
    ],
    origin: 'Silchar Medical College Blood Bank',
    destination: 'Aizawl Civil Hospital Emergency Triage',
    vehicleId: 'veh-tnx4011',
    vehicleNumber: 'TNX-4011',
    status: 'IN_TRANSIT',
    currentStage: 'IN_TRANSIT',
    eta: '3h 10m',
    predictedDelayMinutes: 20,
    riskLevel: 'MEDIUM',
    deadline: 'Today, 19:15 IST',
    populationServed: 400000,
    affectedDistricts: ['Aizawl', 'Kolasib'],
    medicalConvoy: true
  }
];

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'inc-2041',
    incidentCode: '#INC-2041',
    type: 'Landslide',
    severity: 'High',
    lat: 27.24,
    lng: 92.48,
    roadId: 'road-nh13',
    roadCode: 'NH-13',
    reportedBy: 'Inspector P. T. Khon (Border Roads Post)',
    reportedRole: 'Field Officer',
    reportedAt: '14 minutes ago',
    status: 'ACTIVE',
    description: 'Debris wall collapsed across both lanes at Km 81.3 near Tenga gorge. Approximately 450 cubic meters of wet rock and mud deposited on roadbed.',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
    aiClassification: {
      incidentType: 'Landslide',
      severity: 'High',
      roadImpact: 'FULL_BLOCKAGE',
      confidence: 91,
      recommendedAction: 'Restrict civilian traffic immediately; deploy BRO Dozer Unit 4; activate Shergaon South alternate corridor for essential medical supply convoys.'
    },
    vehiclesAffected: 7,
    deliveriesAffected: 4,
    aiRiskScore: 82
  },
  {
    id: 'inc-2039',
    incidentCode: '#INC-2039',
    type: 'Flood',
    severity: 'Medium',
    lat: 27.21,
    lng: 94.08,
    roadId: 'road-nh15',
    roadCode: 'NH-15',
    reportedBy: 'Sub-Divisional Officer A. Bora',
    reportedRole: 'Field Officer',
    reportedAt: '1 hour ago',
    status: 'INVESTIGATING',
    description: 'Subansiri tributary overflowed approach culvert. Water depth 1.2 feet over a 150-meter stretch. Heavy trucks passing with caution; low-chassis cars restricted.',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
    aiClassification: {
      incidentType: 'Flood',
      severity: 'Medium',
      roadImpact: 'PARTIAL_RESTRICTION',
      confidence: 88,
      recommendedAction: 'Place speed limit 15 km/h; monitor river water gauge every 30 minutes.'
    },
    vehiclesAffected: 3,
    deliveriesAffected: 2,
    aiRiskScore: 54
  },
  {
    id: 'inc-2038',
    incidentCode: '#INC-2038',
    type: 'Road Damage',
    severity: 'High',
    lat: 25.73,
    lng: 94.02,
    roadId: 'road-nh29',
    roadCode: 'NH-29',
    reportedBy: 'Highway Patrol Team Alpha',
    reportedRole: 'Field Officer',
    reportedAt: '2 hours ago',
    status: 'ACTIVE',
    description: 'Longitudinal road fracture and pavement collapse over 40 meters on the valley side. One-way bottleneck enforced with flag personnel.',
    imageUrl: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=600&q=80',
    aiClassification: {
      incidentType: 'Road Damage',
      severity: 'High',
      roadImpact: 'PARTIAL_RESTRICTION',
      confidence: 93,
      recommendedAction: 'Divert commercial multi-axle freight to Peducha bypass. Restrict convoy axle weight to 16 metric tons.'
    },
    vehiclesAffected: 9,
    deliveriesAffected: 5,
    aiRiskScore: 74
  }
];

export const INITIAL_WEATHER: WeatherData[] = [
  {
    region: 'Western Arunachal & Kameng High Ranges',
    state: 'Arunachal Pradesh',
    temperatureC: 14,
    condition: 'Heavy Mountain Downpour & Cloudburst Alert',
    rainfallMmH: 48.5,
    humidityPercent: 96,
    windSpeedKmh: 42,
    visibilityKm: 0.8,
    severeWarning: 'IMD Red Alert: Flash floods & severe slope failure risk active for next 12 hours',
    impactLevel: 'HIGH',
    affectedCorridorCount: 3,
    affectedDeliveryCount: 6,
    estimatedDelayStr: '+1h 45m'
  },
  {
    region: 'Central Brahmaputra Valley & Foothills',
    state: 'Assam',
    temperatureC: 28,
    condition: 'Intermittent Monsoon Showers',
    rainfallMmH: 14.2,
    humidityPercent: 88,
    windSpeedKmh: 18,
    visibilityKm: 6.5,
    severeWarning: null,
    impactLevel: 'LOW',
    affectedCorridorCount: 1,
    affectedDeliveryCount: 2,
    estimatedDelayStr: '+15m'
  },
  {
    region: 'Naga Hills Ridge & Barail Range',
    state: 'Nagaland & Manipur',
    temperatureC: 19,
    condition: 'Torrential Ridge Rain & Valley Mist',
    rainfallMmH: 36.8,
    humidityPercent: 94,
    windSpeedKmh: 34,
    visibilityKm: 1.4,
    severeWarning: 'IMD Orange Alert: Landslide warnings along NH-29 & NH-2',
    impactLevel: 'HIGH',
    affectedCorridorCount: 2,
    affectedDeliveryCount: 5,
    estimatedDelayStr: '+1h 10m'
  },
  {
    region: 'Meghalaya Plateau & Khasi Hills',
    state: 'Meghalaya',
    temperatureC: 21,
    condition: 'Dense Fog & Steady Showers',
    rainfallMmH: 26.0,
    humidityPercent: 95,
    windSpeedKmh: 24,
    visibilityKm: 2.1,
    severeWarning: null,
    impactLevel: 'MEDIUM',
    affectedCorridorCount: 1,
    affectedDeliveryCount: 3,
    estimatedDelayStr: '+30m'
  }
];

export const DISTRICT_RESILIENCE_LIST: DistrictResilience[] = [
  {
    districtId: 'dist-tawang',
    name: 'Tawang',
    state: 'Arunachal Pradesh',
    connectivity: 52,
    roadReliability: 48,
    weatherRisk: 86,
    supplyCoverage: 64,
    emergencyAccess: 55,
    overallScore: 58,
    status: 'MODERATE',
    activeVehicles: 6,
    activeDeliveries: 4,
    blockedRoads: 1,
    highRiskCorridors: 2,
    activeIncidents: 3,
    weather: 'Torrential Rain / Sela Fog'
  },
  {
    districtId: 'dist-kamrup',
    name: 'Kamrup Metropolitan (Guwahati Hub)',
    state: 'Assam',
    connectivity: 94,
    roadReliability: 91,
    weatherRisk: 22,
    supplyCoverage: 96,
    emergencyAccess: 95,
    overallScore: 92,
    status: 'HIGH',
    activeVehicles: 48,
    activeDeliveries: 34,
    blockedRoads: 0,
    highRiskCorridors: 0,
    activeIncidents: 0,
    weather: 'Overcast, 28°C'
  },
  {
    districtId: 'dist-papumpare',
    name: 'Papum Pare (Itanagar Capital)',
    state: 'Arunachal Pradesh',
    connectivity: 76,
    roadReliability: 70,
    weatherRisk: 42,
    supplyCoverage: 82,
    emergencyAccess: 74,
    overallScore: 73,
    status: 'HIGH',
    activeVehicles: 14,
    activeDeliveries: 9,
    blockedRoads: 0,
    highRiskCorridors: 1,
    activeIncidents: 1,
    weather: 'Light Rain'
  },
  {
    districtId: 'dist-kohima',
    name: 'Kohima',
    state: 'Nagaland',
    connectivity: 62,
    roadReliability: 54,
    weatherRisk: 74,
    supplyCoverage: 69,
    emergencyAccess: 61,
    overallScore: 63,
    status: 'MODERATE',
    activeVehicles: 12,
    activeDeliveries: 8,
    blockedRoads: 1,
    highRiskCorridors: 2,
    activeIncidents: 2,
    weather: 'Heavy Rain & Low Visibility'
  },
  {
    districtId: 'dist-khasi',
    name: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    connectivity: 86,
    roadReliability: 82,
    weatherRisk: 38,
    supplyCoverage: 89,
    emergencyAccess: 88,
    overallScore: 84,
    status: 'HIGH',
    activeVehicles: 22,
    activeDeliveries: 15,
    blockedRoads: 0,
    highRiskCorridors: 0,
    activeIncidents: 0,
    weather: 'Dense Fog'
  },
  {
    districtId: 'dist-cachar',
    name: 'Cachar (Silchar Logistics Hub)',
    state: 'Assam',
    connectivity: 75,
    roadReliability: 68,
    weatherRisk: 46,
    supplyCoverage: 79,
    emergencyAccess: 72,
    overallScore: 71,
    status: 'HIGH',
    activeVehicles: 16,
    activeDeliveries: 11,
    blockedRoads: 0,
    highRiskCorridors: 1,
    activeIncidents: 1,
    weather: 'Light Drizzle'
  },
  {
    districtId: 'dist-aizawl',
    name: 'Aizawl',
    state: 'Mizoram',
    connectivity: 64,
    roadReliability: 58,
    weatherRisk: 62,
    supplyCoverage: 71,
    emergencyAccess: 66,
    overallScore: 65,
    status: 'MODERATE',
    activeVehicles: 9,
    activeDeliveries: 6,
    blockedRoads: 0,
    highRiskCorridors: 1,
    activeIncidents: 1,
    weather: 'Humid Mist'
  }
];

export const INITIAL_ALERTS = [
  {
    id: 'alt-1',
    level: 'CRITICAL' as const,
    title: 'NH-13 Corridor Blocked near Bhalukpong',
    message: 'Active landslide at Km 81.3. 4 essential medical deliveries affected including TNX-1042 emergency convoy.',
    timestamp: '2 minutes ago',
    targetRoles: ['authority', 'driver', 'field_officer'] as any,
    roadId: 'road-nh13',
    vehicleId: 'veh-tnx1042',
    deliveryId: 'del-tx20481',
    read: false
  },
  {
    id: 'alt-2',
    level: 'HIGH' as const,
    title: 'Flash Flood Prediction on NH-15 North Lakhimpur',
    message: 'Heavy rainfall exceeding 48mm/h may trigger culvert washouts in next 4 hours. Recommend high-chassis routing.',
    timestamp: '15 minutes ago',
    targetRoles: ['authority', 'field_officer'] as any,
    roadId: 'road-nh15',
    read: false
  },
  {
    id: 'alt-3',
    level: 'MEDIUM' as const,
    title: 'Vehicle TNX-3044 Running 55m Behind ETA',
    message: 'Chumukedima pavement subsidence delaying FCI disaster grain transport to Kohima.',
    timestamp: '32 minutes ago',
    targetRoles: ['authority', 'driver'] as any,
    vehicleId: 'veh-tnx3044',
    read: true
  },
  {
    id: 'alt-4',
    level: 'INFO' as const,
    title: 'Field Team 4 Deployed with Satellite Comms',
    message: 'Team successfully logged offline damage report; automatic synchronization completed upon entering Bhalukpong relay.',
    timestamp: '48 minutes ago',
    targetRoles: ['authority', 'field_officer'] as any,
    read: true
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-101',
    officerName: 'Rajesh Sharma, IAS (Divisional Logistics Commissioner)',
    role: 'Authority',
    action: 'Approved Dynamic Reroute for Convoy TNX-1042',
    timestamp: '08:42 IST',
    location: 'NER Central Logistics Command, Guwahati',
    previousState: 'Route A (NH-13 Direct via Bhalukpong)',
    newState: 'Route B (Shergaon Southern Corridor Bypass)',
    details: 'Preserved critical anti-venom supply to Tawang; projected ETA saved 3h 18m versus awaiting clearance.'
  },
  {
    id: 'aud-102',
    officerName: 'Inspector P. T. Khon',
    role: 'Field Officer',
    action: 'Logged Landslide Incident & Marked Road Restricted',
    timestamp: '08:28 IST',
    location: 'Km 81.3, West Kameng, Arunachal Pradesh (27.24, 92.48)',
    previousState: 'NH-13 ACCESSIBLE',
    newState: 'NH-13 HIGH_RISK / RESTRICTED',
    details: 'Uploaded photo with automated GPS coordinate tag. AI classified as 91% Landslide full blockage.'
  },
  {
    id: 'aud-103',
    officerName: 'Col. Sanjeev Mech (BRO Taskforce 88)',
    role: 'Authority',
    action: 'Dispatched Earthmoving Excavator Team & Dozer Unit',
    timestamp: '08:35 IST',
    location: 'Tenga Base Camp',
    previousState: 'Incident Pending Response',
    newState: 'Clearing Crew Assigned (ETA 35m)',
    details: 'Cleared for high-priority heavy plant transit.'
  }
];

export const TA_WANG_ROUTE_OPTIONS: RouteOption[] = [
  {
    id: 'route-nh13-direct',
    name: 'Route A (NH-13 Direct via Bhalukpong)',
    distanceKm: 287,
    eta: '5h 20m',
    riskPercentage: 86,
    traffic: 'High',
    weatherRisk: 'High',
    status: 'AVOID',
    pathDescription: 'Guwahati → Baihhata → Bhalukpong → Tenga → Sela Pass → Tawang',
    coordinates: [
      [26.18, 91.75],
      [26.65, 92.79],
      [26.985, 92.65],
      [27.15, 92.52],
      [27.35, 92.24],
      [27.50, 92.05],
      [27.586, 91.86]
    ],
    roadIds: ['road-nh15', 'road-nh13'],
    costScore: 92.4,
    explanation: 'Blocked by confirmed 450m³ landslide at Km 81.3. Severe risk of recurring debris slides under 48.5mm/h rainfall.'
  },
  {
    id: 'route-shergaon-bypass',
    name: 'Route B (Shergaon Southern Corridor Bypass)',
    distanceKm: 304,
    eta: '5h 52m',
    riskPercentage: 24,
    traffic: 'Low',
    weatherRisk: 'Low',
    status: 'RECOMMENDED',
    pathDescription: 'Guwahati → Orang → Kalaktang → Shergaon → Rupa → Tawang',
    coordinates: [
      [26.18, 91.75],
      [26.55, 92.35],
      [26.85, 92.10],
      [27.12, 92.25],
      [27.35, 92.24],
      [27.50, 92.05],
      [27.586, 91.86]
    ],
    roadIds: ['road-nh15', 'road-nh15-alt'],
    costScore: 36.8,
    explanation: 'BEST ALTERNATIVE: Avoids the fractured Tenga cliff. Gentle ridge slope, verified asphalt integrity, zero active blockages. +32 minutes ETA overhead saves 4+ hours of landslide stoppage!'
  },
  {
    id: 'route-rowta-rupa-alt',
    name: 'Route C (Rowta - Kalaktang - Rupa All-India Alternate)',
    distanceKm: 312,
    eta: '6h 05m',
    riskPercentage: 34,
    traffic: 'Medium',
    weatherRisk: 'Low',
    status: 'BACKUP',
    pathDescription: 'Guwahati → Udalguri → Rowta → Kalaktang → Rupa → Dirang → Tawang (100% Indian Corridor)',
    coordinates: [
      [26.18, 91.75],
      [26.50, 92.05],
      [26.75, 92.15],
      [27.12, 92.25],
      [27.35, 92.24],
      [27.50, 92.05],
      [27.586, 91.86]
    ],
    roadIds: ['road-nh15', 'road-nh15-alt'],
    costScore: 42.5,
    explanation: 'ALL-INDIA BACKUP CORRIDOR: 100% within Assam and Arunachal Pradesh (India). Stable arterial mountain link with zero foreign border transit delays.'
  }
];
