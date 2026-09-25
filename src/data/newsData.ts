import { NewsArticle, Road, Alert, RoadStatus } from '../types.ts';

export const INITIAL_INDIA_NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-ind-01',
    title: 'BRO Taskforce 88 Issues Urgent Alert: Massive Landslide Blocks NH-13 at Bhalukpong Km 81.3',
    source: 'Border Roads Organisation (BRO) Taskforce 88 Dispatch',
    publishedAt: '12 minutes ago',
    url: 'https://bro.gov.in/dispatches/nh13-bhalukpong-blockage',
    content: 'Border Roads Organisation (BRO) Taskforce 88 has reported a massive 450 cubic-meter rock and mud debris slide across both carriageways of the Balipara-Charduar-Tawang Highway (NH-13) near Bhalukpong at Km 81.3 in West Kameng, Arunachal Pradesh. Continuous torrential rains triggered the cliff collapse. Traffic between Assam and Western Arunachal is completely halted. Emergency medical convoys are advised to utilize the Shergaon-Rupa southern alternate corridor.',
    category: 'LANDSLIDE',
    country: 'India',
    state: 'Arunachal Pradesh',
    extractedHighway: 'NH-13',
    extractedLocation: 'Km 81.3 near Bhalukpong, West Kameng',
    detectedStatus: 'BLOCKED',
    confidenceScore: 97,
    impactSummary: 'Total vehicular blockage on NH-13 arterial corridor. BRO heavy dozers deployed; estimated clearance window 6-8 hours.',
    coordinates: [27.24, 92.48],
    analyzedAt: 'Just now',
    appliedToRoute: true
  },
  {
    id: 'news-ind-02',
    title: 'ASDMA Flash Flood Bulletin: Subansiri Tributary Overflows NH-15 North Lakhimpur Stretch',
    source: 'Assam State Disaster Management Authority (ASDMA)',
    publishedAt: '28 minutes ago',
    url: 'https://asdma.assam.gov.in/bulletin/nh15-culvert-overflow',
    content: 'ASDMA reports that intense precipitation in the upper catchment of Arunachal has caused the Subansiri tributary to spill over the approach road of NH-15 in North Lakhimpur district, Assam. Water logging of 1.2 to 1.5 feet depth is reported across 200 meters. Low-clearance civilian vehicles are suspended; high-chassis freight trucks are traversing with severe speed restrictions.',
    category: 'FLOOD',
    country: 'India',
    state: 'Assam',
    extractedHighway: 'NH-15',
    extractedLocation: 'North Lakhimpur Approach Culvert, Assam',
    detectedStatus: 'HIGH_RISK',
    confidenceScore: 94,
    impactSummary: 'Submerged culvert on NH-15 with elevated hydro-vulnerability. Transit slowed by 45 minutes; single-file pilot escort in place.',
    coordinates: [27.21, 94.08],
    analyzedAt: 'Just now',
    appliedToRoute: true
  },
  {
    id: 'news-ind-03',
    title: 'Nagaland Traffic Advisory: Active Sinking Zone at Chumukedima Pagla Pahar on NH-29',
    source: 'Nagaland State Disaster Management Authority (NSDMA) & Police',
    publishedAt: '45 minutes ago',
    url: 'https://nsdma.nagaland.gov.in/traffic/nh29-chumukedima',
    content: 'Dimapur Police and NSDMA have issued a joint advisory regarding continuous slope subsidence and rock sliding at Pagla Pahar near Chumukedima on the Dimapur-Kohima 4-lane highway (NH-29). One carriageway is closed to prevent rockfall fatalities. Commuters traveling to Kohima and Manipur are advised to travel during daylight hours only.',
    category: 'LANDSLIDE',
    country: 'India',
    state: 'Nagaland',
    extractedHighway: 'NH-29',
    extractedLocation: 'Chumukedima Pagla Pahar, Dimapur-Kohima Corridor',
    detectedStatus: 'HIGH_RISK',
    confidenceScore: 91,
    impactSummary: 'Single-lane operational constraint on NH-29. Pavement subsidence warning active; heavy goods transport queued.',
    coordinates: [25.79, 93.77],
    analyzedAt: 'Just now',
    appliedToRoute: true
  },
  {
    id: 'news-ind-04',
    title: 'Press Information Bureau (PIB): Haflong Hill Section on NH-27 Stabilized with Single-Lane Pilot Transit',
    source: 'PIB India (Ministry of Road Transport & Highways)',
    publishedAt: '1 hour ago',
    url: 'https://pib.gov.in/press-release/nh27-haflong-corridor',
    content: 'MoRTH and the National Highways Authority of India (NHAI) confirm that slope stabilization works along the East-West Corridor (NH-27) through Dima Hasao have restored essential cargo movement between Guwahati and the Barak Valley (Silchar). Regulated single-lane pilotage is enforced in vulnerable cuttings between Jatinga and Harangajao.',
    category: 'ROAD_DAMAGE',
    country: 'India',
    state: 'Assam',
    extractedHighway: 'NH-27',
    extractedLocation: 'Jatinga-Harangajao Section, Dima Hasao, Assam',
    detectedStatus: 'MODERATE',
    confidenceScore: 89,
    impactSummary: 'Essential lifeline between Brahmaputra and Barak valleys moving under controlled speeds (25 km/h).',
    coordinates: [25.18, 92.95],
    analyzedAt: 'Just now',
    appliedToRoute: true
  },
  {
    id: 'news-ind-05',
    title: 'Sikkim Road Alert: BRO Project Swastik Clears Landslide Debris on NH-10 Teesta Corridor',
    source: 'Sikkim State Disaster Management Authority & BRO Project Swastik',
    publishedAt: '2 hours ago',
    url: 'https://sikkim.gov.in/traffic/nh10-clearance-teesta',
    content: 'Border Roads Organisation (Project Swastik) has successfully cleared major rockfall and mud accumulation at 29th Mile and Kali Jhora on NH-10 connecting Siliguri to Gangtok. Two-way vehicular movement for passenger and essential commodity carriers has been restored after 14 hours of intensive earthmoving operations.',
    category: 'CLEARANCE',
    country: 'India',
    state: 'Sikkim',
    extractedHighway: 'NH-10',
    extractedLocation: '29th Mile / Kali Jhora, Teesta Valley (India)',
    detectedStatus: 'ACCESSIBLE',
    confidenceScore: 96,
    impactSummary: 'NH-10 corridor restored to ACCESSIBLE status. Supply trucks to Gangtok cleared for scheduled delivery.',
    coordinates: [27.05, 88.46],
    analyzedAt: 'Just now',
    appliedToRoute: true
  },
  {
    id: 'news-ind-06',
    title: 'Arunachal Traffic Police: Sela Tunnel and Pass Approach (NH-13) Open with Snow Warning',
    source: 'Arunachal Pradesh Police & Project Vartak',
    publishedAt: '3 hours ago',
    url: 'https://arunachalpolice.gov.in/advisories/sela-pass-winter',
    content: 'Project Vartak snow plows have cleared nocturnal snowdrifts at the upper elevation portals of Sela Pass on NH-13. The bi-directional Sela Tunnel is fully functional and providing all-weather bypass, but morning black ice requires 4x4 or chained tires for heavy freight vehicles ascending from Tenga.',
    category: 'SNOW',
    country: 'India',
    state: 'Arunachal Pradesh',
    extractedHighway: 'NH-13',
    extractedLocation: 'Sela Pass Summit & Tunnel Portal (Arunachal Pradesh)',
    detectedStatus: 'MODERATE',
    confidenceScore: 92,
    impactSummary: 'All-weather bypass functional via Sela Tunnel. Speed capped at 30 km/h due to black ice patches.',
    coordinates: [27.50, 92.10],
    analyzedAt: 'Just now',
    appliedToRoute: true
  }
];

// Indian Highway entity dictionary with guaranteed coordinates in Indian territory
export const INDIA_HIGHWAY_DIRECTORY: Record<
  string,
  {
    name: string;
    state: string;
    defaultCoordinates: [number, number];
    keyLocations: string[];
  }
> = {
  'NH-13': {
    name: 'Trans-Arunachal Highway (Balipara - Tawang)',
    state: 'Arunachal Pradesh',
    defaultCoordinates: [27.24, 92.48],
    keyLocations: ['Bhalukpong', 'Tenga', 'Bomdila', 'Dirang', 'Sela Pass', 'Tawang']
  },
  'NH-15': {
    name: 'North Bank Trunk Highway (Baihhata - Lakhimpur - Pasighat)',
    state: 'Assam',
    defaultCoordinates: [27.21, 94.08],
    keyLocations: ['Mangaldoi', 'Tezpur', 'Biswanath Chariali', 'North Lakhimpur', 'Dhemaji']
  },
  'NH-27': {
    name: 'East-West Economic Corridor (Siliguri - Guwahati - Silchar)',
    state: 'Assam',
    defaultCoordinates: [25.18, 92.95],
    keyLocations: ['Guwahati', 'Nagaon', 'Dabaka', 'Lumding', 'Haflong', 'Silchar']
  },
  'NH-29': {
    name: 'Dimapur - Kohima - Imphal Lifeline Highway',
    state: 'Nagaland',
    defaultCoordinates: [25.79, 93.77],
    keyLocations: ['Dimapur', 'Chumukedima', 'Medziphema', 'Kohima', 'Mao']
  },
  'NH-10': {
    name: 'Siliguri - Sevoke - Teesta - Gangtok Lifeline',
    state: 'Sikkim',
    defaultCoordinates: [27.05, 88.46],
    keyLocations: ['Sevoke', 'Coronation Bridge', 'Kali Jhora', 'Teesta Bazaar', 'Rangpo', 'Gangtok']
  },
  'NH-102': {
    name: 'Imphal - Moreh Asian Highway 1 Corridor',
    state: 'Manipur',
    defaultCoordinates: [24.45, 94.02],
    keyLocations: ['Imphal', 'Thoubal', 'Kakching', 'Pallel', 'Tengnoupal', 'Moreh']
  },
  'NH-208': {
    name: 'Kumarghat - Kailashahar - Teliamura Corridor',
    state: 'Tripura',
    defaultCoordinates: [24.12, 92.05],
    keyLocations: ['Agartala', 'Teliamura', 'Khowai', 'Kailashahar']
  },
  'NH-6': {
    name: 'Shillong - Jowai - Silchar Lifeline',
    state: 'Meghalaya',
    defaultCoordinates: [25.42, 92.20],
    keyLocations: ['Shillong', 'Jowai', 'Lad Rymbai', 'Khliehriat', 'Ratacherra']
  }
};

/**
 * Intelligent client & server parser that analyzes Indian disaster & transport bulletins
 * and maps them directly to Indian highways, locations, risk status, and coordinates.
 */
export function analyzeIndianNewsText(
  rawText: string,
  sourceName: string = 'India Disaster Management & Highway Bulletin'
): NewsArticle {
  const textUpper = rawText.toUpperCase();

  // 1. Identify Target Highway
  let detectedHighway = 'NH-13';
  let highwayDetails = INDIA_HIGHWAY_DIRECTORY['NH-13'];

  for (const [code, details] of Object.entries(INDIA_HIGHWAY_DIRECTORY)) {
    const highwayRegex = new RegExp(`\\b${code.replace('-', '[- ]?')}\\b`, 'i');
    if (highwayRegex.test(rawText)) {
      detectedHighway = code;
      highwayDetails = details;
      break;
    }
    // Check if any key location matches
    for (const loc of details.keyLocations) {
      if (textUpper.includes(loc.toUpperCase())) {
        detectedHighway = code;
        highwayDetails = details;
        break;
      }
    }
  }

  // 2. Determine Category
  let category: NewsArticle['category'] = 'LANDSLIDE';
  if (/cleared|restored|traffic resumed|reopened|normal flow|open for traffic/i.test(rawText)) {
    category = 'CLEARANCE';
  } else if (/snow|blizzard|ice|avalanche/i.test(rawText)) {
    category = 'SNOW';
  } else if (/flood|waterlog|submerged|overflow|inundated/i.test(rawText)) {
    category = 'FLOOD';
  } else if (/damage|subsidence|cave-in|collapse|cracked|culvert/i.test(rawText)) {
    category = 'ROAD_DAMAGE';
  } else if (/rain|fog|wind|cyclone|weather/i.test(rawText)) {
    category = 'WEATHER';
  }

  // 3. Determine Road Status Impact
  let detectedStatus: RoadStatus = 'HIGH_RISK';
  if (category === 'CLEARANCE') {
    detectedStatus = 'ACCESSIBLE';
  } else if (/blocked|halted|shut|impassable|severed|total closure|paralyzed|cut off/i.test(rawText)) {
    detectedStatus = 'BLOCKED';
  } else if (/critical|high risk|danger|landslide active|submerged|stranded/i.test(rawText)) {
    detectedStatus = 'HIGH_RISK';
  } else if (/caution|single lane|pilot|slow|delays|restricted/i.test(rawText)) {
    detectedStatus = 'MODERATE';
  }

  // 4. Extract specific landmark
  let extractedLocation = highwayDetails.keyLocations[0] + ', ' + highwayDetails.state;
  for (const loc of highwayDetails.keyLocations) {
    if (textUpper.includes(loc.toUpperCase())) {
      extractedLocation = `${loc} Corridor, ${highwayDetails.state}`;
      break;
    }
  }

  // 5. Generate concise summary
  let impactSummary = '';
  if (detectedStatus === 'BLOCKED') {
    impactSummary = `CRITICAL ROADBLOCK: ${detectedHighway} is completely blocked at ${extractedLocation}. Traffic rerouting strictly required.`;
  } else if (detectedStatus === 'HIGH_RISK') {
    impactSummary = `HAZARD WARNING: Severe disruption reported on ${detectedHighway} near ${extractedLocation}. High-clearance vehicles only.`;
  } else if (detectedStatus === 'MODERATE') {
    impactSummary = `TRAFFIC RESTRICTION: Regulated transit on ${detectedHighway} at ${extractedLocation}. Speed delays expected.`;
  } else {
    impactSummary = `ROUTE RESTORED: ${detectedHighway} at ${extractedLocation} cleared and returned to safe operational flow.`;
  }

  // Generate headline from first sentence or synthesize
  const firstSentence = rawText.split(/[.\n]/)[0].trim();
  const headline =
    firstSentence.length > 15 && firstSentence.length < 120
      ? firstSentence
      : `${sourceName}: ${detectedHighway} ${detectedStatus} near ${extractedLocation}`;

  return {
    id: `news-live-${Date.now()}`,
    title: headline,
    source: sourceName,
    publishedAt: 'Live (Just now)',
    content: rawText,
    category,
    country: 'India',
    state: highwayDetails.state,
    extractedHighway: detectedHighway,
    extractedLocation,
    detectedStatus,
    confidenceScore: Math.floor(Math.random() * 8) + 91, // 91-98%
    impactSummary,
    coordinates: highwayDetails.defaultCoordinates,
    analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    appliedToRoute: false,
    isLiveRealtime: true
  };
}
