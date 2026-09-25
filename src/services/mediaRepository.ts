import { Incident, IncidentMediaItem } from '../types.ts';

// Comprehensive Repository of High-Resolution Imagery and Video Records
// from the NER Tactical Reconnaissance & Disaster Logistics Archive
export const HYPOTHETICAL_MEDIA_ARCHIVE: Record<string, IncidentMediaItem[]> = {
  'inc-2041': [
    {
      id: 'med-2041-01',
      incidentId: 'inc-2041',
      type: 'image',
      title: 'BRO UAV Eagle-4 Aerial 4K Orthomosaic',
      description: '4K orthomosaic aerial survey showing ~450 m³ wet schist and granite boulder deposition completely sealing both lanes at Km 81.3 near Tenga gorge.',
      source: 'Border Roads Task Force 88 / Drone Wing',
      timestamp: '14m ago (08:12 IST)',
      resolution: '3840 × 2160 (4K UHD)',
      url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '18.4 MB',
      cameraMetadata: {
        device: 'DJI Matrice 300 RTK + Zenmuse P1',
        focalLength: '35mm Full-Frame Equivalent',
        altitudeMeters: 148,
        azimuthDeg: 214,
        coordinates: [27.2402, 92.4812]
      },
      tags: ['Aerial Recon', '4K Drone', 'Debris Footprint', 'Active Slide']
    },
    {
      id: 'med-2041-02',
      incidentId: 'inc-2041',
      type: 'video',
      title: 'Patrol Alpha Forward Dashcam (Approach Km 81.1)',
      description: 'On-scene mobile unit dashboard telemetry recording as emergency vehicle approaches the initial police barricade 200m south of slide zone.',
      source: 'NER Highway Police Patrol Cruiser 04',
      timestamp: '22m ago (08:04 IST)',
      resolution: '1920 × 1080 (60 fps HDR)',
      duration: '0:48',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '42.6 MB',
      cameraMetadata: {
        device: 'BlackVue DR970X Plus 4K UHD Dashcam',
        focalLength: '155° Ultra-Wide Glass Lens',
        altitudeMeters: 1720,
        azimuthDeg: 342,
        coordinates: [27.2389, 92.4795]
      },
      tags: ['Video Telemetry', 'Dashcam', 'Road Approach', 'Heavy Rain']
    },
    {
      id: 'med-2041-03',
      incidentId: 'inc-2041',
      type: 'image',
      title: 'FLIR Thermal Infiltration Multi-Spectral Scan',
      description: 'Multi-spectral infrared radiometry showing sub-surface groundwater saturation (high blue/cyan gradient) saturating the upper shear plane.',
      source: 'NESAC Geo-Satellite & UAV Thermal Sensor',
      timestamp: '35m ago (07:51 IST)',
      resolution: '2560 × 1440 (Sensor Telemetry)',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '12.8 MB',
      cameraMetadata: {
        device: 'FLIR Vue Pro R Radiometric Microbolometer',
        focalLength: '19mm LWIR 7.5-13.5 µm',
        altitudeMeters: 210,
        azimuthDeg: 195,
        coordinates: [27.2415, 92.4828]
      },
      tags: ['Thermal Scan', 'Subsurface Water', 'Risk Modeling']
    },
    {
      id: 'med-2041-04',
      incidentId: 'inc-2041',
      type: 'video',
      title: 'BRO Heavy Dozer Unit 4 Clearance Feed',
      description: 'Live field operations feed from the operator cab of Caterpillar D8 bulldozer executing initial cut-in on the northern flank.',
      source: 'BRO Dozer Unit 4 Ground Crew',
      timestamp: '5m ago (08:21 IST)',
      resolution: '1920 × 1080 (30 fps Live)',
      duration: '1:14',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '64.1 MB',
      cameraMetadata: {
        device: 'Ruggedized Axis P1375 Fixed Heavy Cam',
        focalLength: '28-85mm f/1.2',
        altitudeMeters: 1740,
        azimuthDeg: 28,
        coordinates: [27.2405, 92.4808]
      },
      tags: ['Clearance Live', 'Heavy Machinery', 'Bulldozer Feed']
    },
    {
      id: 'med-2041-05',
      incidentId: 'inc-2041',
      type: 'image',
      title: 'High-Res Telephoto Retaining Wall Stress Inspection',
      description: 'Ultra-telephoto optical inspection of downhill reinforced concrete retaining wall showing 8mm shear fissures under hydrostatic pressure.',
      source: 'Field Structural Reconnaissance Unit 2',
      timestamp: '48m ago (07:38 IST)',
      resolution: '4096 × 2160 (Cinema 4K)',
      url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '21.5 MB',
      cameraMetadata: {
        device: 'Sony Alpha 1 + FE 200-600mm G OSS',
        focalLength: '450mm f/6.3',
        altitudeMeters: 1690,
        azimuthDeg: 162,
        coordinates: [27.2398, 92.4804]
      },
      tags: ['Structural Crack', 'Retaining Wall', 'Engineering Audit']
    }
  ],
  'inc-2039': [
    {
      id: 'med-2039-01',
      incidentId: 'inc-2039',
      type: 'video',
      title: 'Subansiri River Tributary Drone Flyover',
      description: 'Low-altitude drone footage capturing water surging over the approach culvert 1.2 ft deep with warning beacons flashing.',
      source: 'State Disaster Management Drone Wing',
      timestamp: '42m ago',
      resolution: '3840 × 2160 (4K UHD)',
      duration: '0:36',
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '38.2 MB',
      cameraMetadata: {
        device: 'DJI Inspire 3 Zenmuse X9-8K Air',
        focalLength: '24mm DL Mount',
        altitudeMeters: 45,
        azimuthDeg: 120,
        coordinates: [27.2114, 94.0821]
      },
      tags: ['Waterlogging', 'Flood Surge', '4K Drone']
    },
    {
      id: 'med-2039-02',
      incidentId: 'inc-2039',
      type: 'image',
      title: 'Culvert Water Gauge Calibration Marker',
      description: 'Field inspection photography documenting river gauge level at +1.2 ft above asphalt crown. Low-chassis vehicular transit prohibited.',
      source: 'PWD Road Inspector Alpha',
      timestamp: '55m ago',
      resolution: '3024 × 4032 (High-Res)',
      url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '14.1 MB',
      cameraMetadata: {
        device: 'Leica SL2-S + Vario-Elmarit 24-70mm',
        focalLength: '50mm f/2.8',
        altitudeMeters: 110,
        azimuthDeg: 85,
        coordinates: [27.2108, 94.0815]
      },
      tags: ['Water Gauge', 'Road Bed', 'Field Photo']
    },
    {
      id: 'med-2039-03',
      incidentId: 'inc-2039',
      type: 'image',
      title: 'Sentinel-2 Hydrographic Runoff Overlay',
      description: 'Multi-spectral hydrographic runoff map showing rainfall catchment surge rate currently at 88% upstream saturation.',
      source: 'NESAC Hydrology Command Center',
      timestamp: '1h 10m ago',
      resolution: '2048 × 2048 (Satellite GIS)',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '11.5 MB',
      cameraMetadata: {
        device: 'Sentinel-2 MSI Multispectral Instrument',
        focalLength: 'Orbital Multispectral Sensor',
        altitudeMeters: 786000,
        azimuthDeg: 0,
        coordinates: [27.21, 94.08]
      },
      tags: ['Satellite GIS', 'Hydrographic', 'Catchment Basin']
    }
  ],
  'inc-2038': [
    {
      id: 'med-2038-01',
      incidentId: 'inc-2038',
      type: 'image',
      title: 'Geotechnical Longitudinal Asphalt Shear Fracture',
      description: '4K macro ground inspection of the 40-meter longitudinal roadbed fracture and pavement displacement on the valley side.',
      source: 'BRO Pavement Integrity Task Force',
      timestamp: '1h 45m ago',
      resolution: '3840 × 2160 (4K UHD)',
      url: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '16.7 MB',
      cameraMetadata: {
        device: 'Canon EOS R5 + RF 24-70mm f/2.8L',
        focalLength: '32mm f/4.0',
        altitudeMeters: 1450,
        azimuthDeg: 170,
        coordinates: [25.7321, 94.0215]
      },
      tags: ['Road Fracture', 'Structural Defect', 'Pavement Shift']
    },
    {
      id: 'med-2038-02',
      incidentId: 'inc-2038',
      type: 'video',
      title: 'Single-Lane Bottleneck Convoy Flow Camera',
      description: 'Fixed solar-powered traffic surveillance stream monitoring flag personnel enforcing alternate one-way convoy flow.',
      source: 'NHIDCL Corridor Traffic Monitoring Camera 09',
      timestamp: '18m ago',
      resolution: '1920 × 1080 (30 fps)',
      duration: '0:52',
      url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '31.4 MB',
      cameraMetadata: {
        device: 'Hikvision DarkFighter 4K PTZ Camera',
        focalLength: '5.9-135mm Optical Zoom',
        altitudeMeters: 1460,
        azimuthDeg: 285,
        coordinates: [25.7315, 94.0208]
      },
      tags: ['Traffic Bottleneck', 'Live Stream', 'One-Way Transit']
    },
    {
      id: 'med-2038-03',
      incidentId: 'inc-2038',
      type: 'image',
      title: 'Borehole Inclinometer & Valley Subsidence Vector Map',
      description: 'Sub-base soil displacement telemetry indicating a 3.2° creeping tilt towards the southern gorge over the past 48 hours.',
      source: 'Geological Survey of India (GSI NER)',
      timestamp: '2h 10m ago',
      resolution: '2560 × 1440',
      url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '13.9 MB',
      cameraMetadata: {
        device: 'GSI Geotechnical Inclinometer Array',
        focalLength: 'Telemetry Sensor System',
        altitudeMeters: 1445,
        azimuthDeg: 180,
        coordinates: [25.7328, 94.0222]
      },
      tags: ['Inclinometer', 'Subsidence', 'Soil Mechanics']
    }
  ]
};

/**
 * Generate contextual hypothetical media records for any dynamic or newly submitted incident.
 */
export function generateMediaForIncident(incident: Incident): IncidentMediaItem[] {
  if (HYPOTHETICAL_MEDIA_ARCHIVE[incident.id]) {
    return HYPOTHETICAL_MEDIA_ARCHIVE[incident.id];
  }

  // Pre-seed based on incident type and severity
  const isVideoIncident = incident.severity === 'Critical' || incident.severity === 'High';
  const primaryImgUrl = incident.imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=85';

  const generatedItems: IncidentMediaItem[] = [
    {
      id: `med-${incident.id}-01`,
      incidentId: incident.id,
      type: 'image',
      title: `${incident.roadCode} ${incident.type} Initial Field Survey`,
      description: incident.description || `Primary ground verification image captured at Lat ${incident.lat.toFixed(4)}, Lng ${incident.lng.toFixed(4)}.`,
      source: `${incident.reportedBy} (${incident.reportedRole || 'Field Officer'})`,
      timestamp: incident.reportedAt || 'Just now',
      resolution: '3840 × 2160 (4K UHD)',
      url: primaryImgUrl,
      thumbnailUrl: primaryImgUrl,
      fileSizeBytes: '16.5 MB',
      cameraMetadata: {
        device: 'Field Recon Mobile Unit Mark IV',
        focalLength: '24mm f/1.8 Wide',
        altitudeMeters: Math.round(incident.lat * 45 + 500),
        azimuthDeg: Math.round(incident.lng * 2) % 360,
        coordinates: [incident.lat, incident.lng]
      },
      tags: ['Field Report', incident.type, incident.roadCode, 'High-Res']
    },
    {
      id: `med-${incident.id}-02`,
      incidentId: incident.id,
      type: isVideoIncident ? 'video' : 'image',
      title: `${incident.roadCode} Tactical Drone Aerial Sweep`,
      description: `High-resolution aerial reconnaissance sweep of ${incident.roadCode} corridor surveying affected vehicular tailbacks.`,
      source: 'NER Rapid Response UAV Wing',
      timestamp: '6m ago',
      resolution: isVideoIncident ? '1920 × 1080 (60 fps HDR)' : '3840 × 2160 (4K)',
      duration: isVideoIncident ? '0:45' : undefined,
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: isVideoIncident ? '36.8 MB' : '15.2 MB',
      cameraMetadata: {
        device: 'DJI Matrice 350 RTK Recon',
        focalLength: '40mm Telephoto',
        altitudeMeters: Math.round(incident.lat * 50 + 600),
        azimuthDeg: 215,
        coordinates: [incident.lat, incident.lng]
      },
      tags: ['Aerial Recon', 'Drone Surveillance', incident.severity]
    },
    {
      id: `med-${incident.id}-03`,
      incidentId: incident.id,
      type: 'image',
      title: `${incident.roadCode} Geological Stability & Moisture Map`,
      description: `NESAC satellite terrain elevation and slope risk index computed for this sector.`,
      source: 'NESAC Geospatial Analytics Unit',
      timestamp: '18m ago',
      resolution: '2560 × 1440 (Satellite)',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
      thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80',
      fileSizeBytes: '12.4 MB',
      cameraMetadata: {
        device: 'Cartosat-3 High-Resolution Imager',
        focalLength: 'Panchromatic 0.28m GSD',
        altitudeMeters: 505000,
        azimuthDeg: 0,
        coordinates: [incident.lat, incident.lng]
      },
      tags: ['Satellite', 'Topography', 'Terrain Risk']
    }
  ];

  return generatedItems;
}

/**
 * Asynchronously fetch media items for a given incident from the hypothetical repository,
 * simulating realistic tactical repository latency and caching.
 */
export async function fetchIncidentMediaFromRepository(incident: Incident): Promise<IncidentMediaItem[]> {
  // Simulate network query to regional GIS media server (250-400ms)
  await new Promise((resolve) => setTimeout(resolve, 300));
  return generateMediaForIncident(incident);
}
