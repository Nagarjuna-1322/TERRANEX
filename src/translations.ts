import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'as';

export interface Translations {
  appName: string;
  tagline: string;
  subTagline: string;
  easyMode: string;
  officerMode: string;
  easyModeTitle: string;
  officerModeTitle: string;
  liveEvaluation: string;
  scenarioPipeline: string;
  stepOf: string;
  openDemo: string;
  closeDemo: string;
  emergencySOS: string;
  nav: {
    home: string;
    map: string;
    logistics: string;
    alerts: string;
    profile: string;
    report: string;
    incidents: string;
    route: string;
    delivery: string;
    simulation: string;
    analytics: string;
    help: string;
  };
  roles: {
    authority: string;
    field_officer: string;
    driver: string;
    analyst: string;
  };
  kpi: {
    activeVehicles: string;
    activeDeliveries: string;
    roadBlockages: string;
    highRiskCorridors: string;
    atRiskDeliveries: string;
    regionalAccessibility: string;
    accessible: string;
    restricted: string;
    blocked: string;
    systemStatus: string;
    normalOps: string;
  };
  aiRisk: {
    title: string;
    currentRisk: string;
    riskScore: string;
    predictionText: string;
    primaryFactors: string;
    viewAnalysis: string;
    disruptionProb: string;
    confidence: string;
    factors: string;
  };
  status: {
    accessible: string;
    moderate: string;
    highRisk: string;
    blocked: string;
    critical: string;
    high: string;
    medium: string;
    low: string;
    inTransit: string;
    delayed: string;
    delivered: string;
    rerouted: string;
    open: string;
    caution: string;
  };
  emergency: {
    title: string;
    activeTitle: string;
    criticalIncidents: string;
    blockedCorridors: string;
    atRiskDeliveries: string;
    emergencyVehicles: string;
    safeRoutes: string;
    findSafestRoute: string;
    sosTitle: string;
    sosDesc: string;
    broadcastSosBtn: string;
    broadcastSentBtn: string;
    safetyGuideTitle: string;
    stopAudio: string;
    listenSafety: string;
    directCallsTitle: string;
    nearbyHospitalsTitle: string;
    viewOnMap: string;
    open247: string;
    safeShelter: string;
    h112Title: string;
    h112Sub: string;
    h1077Title: string;
    h1077Sub: string;
    h108Title: string;
    h108Sub: string;
    tawangHospital: string;
    tawangHospitalDesc: string;
    bhalukpongShelter: string;
    bhalukpongShelterDesc: string;
  };
  offline: {
    title: string;
    desc: string;
    pendingQueue: string;
    syncNow: string;
    syncSuccess: string;
    online: string;
    offline: string;
    clearQueue: string;
    cacheInfo: string;
    itemsCount: string;
  };
  actions: {
    reportIncident: string;
    submit: string;
    cancel: string;
    acceptReroute: string;
    viewOptions: string;
    simulate: string;
    markBlocked: string;
    unmarkBlocked: string;
    createAlert: string;
    findAlternate: string;
    assignTeam: string;
    logout: string;
    close: string;
    compareRoutes: string;
    viewOnMap: string;
    search: string;
  };
  profile: {
    title: string;
    signOut: string;
    roleSimulation: string;
    localizationTitle: string;
    offlineSyncTitle: string;
    auditTrailTitle: string;
    traceabilityRecord: string;
    employeeId: string;
    organization: string;
  };
  voice: {
    handsFreeBadge: string;
    askRoadStatus: string;
    listeningHeading: string;
    listeningSub: string;
    micPromptSub: string;
    speakBtn: string;
    listeningBtn: string;
    fullBriefing: string;
    stopAudio: string;
    micActiveTitle: string;
    micActiveSub: string;
    quickPromptsTitle: string;
    spokenResultTitle: string;
    viewBypassBtn: string;
  };
  simple: {
    dangerBlocked: string;
    dangerDesc: string;
    safeAltAvailable: string;
    shergaonOpen: string;
    openSafeDetourBtn: string;
    allClear: string;
    allClearHeading: string;
    allClearDesc: string;
    directActionsTitle: string;
    mapCardTitle: string;
    mapCardDesc: string;
    reportCardTitle: string;
    reportCardDesc: string;
    routeCardTitle: string;
    routeCardDesc: string;
    sosCardTitle: string;
    sosCardDesc: string;
    sosCardSent: string;
    roadListTitle: string;
    roadListSubtitle: string;
    filterAll: string;
    filterBlocked: string;
    filterOpen: string;
    helplinesTitle: string;
    helplinesSubtitle: string;
    callNow: string;
  };
  authority: {
    overwatchTitle: string;
    telemetryLive: string;
    overwatchDesc: string;
    crisisPostBtn: string;
    whatIfBtn: string;
    regionalAccessibilityHeader: string;
    highRiskHeader: string;
    priorityFleetHeader: string;
    evaluateCorridorBtn: string;
    optimizeAllBtn: string;
    commandHq: string;
    convoys: string;
    inActiveTransit: string;
    deliveries: string;
    suppliesEnRoute: string;
    blockages: string;
    corridorsClosed: string;
    highRisk: string;
    probOver70: string;
    atRiskDel: string;
    requiresReroute: string;
    regionalArterial: string;
    corridorLength: string;
    accessiblePct: string;
    restrictedPct: string;
    blockedPct: string;
    aiRiskMatrix: string;
    postureElevated: string;
    predictiveModelSub: string;
    optimizeAllCorridors: string;
    disruptionOutlook: string;
    disruptionOutlookDesc: string;
    primaryDrivers: string;
    heavyPrecipitation: string;
    steepSlope: string;
    activeDebris: string;
    executiveDirective: string;
    executiveDirectiveDesc: string;
    openTacticalMap: string;
    liveNewsEngine: string;
    indiaOnly: string;
    bulletinsActive: string;
    newsEngineDesc: string;
    openNewsRadarBtn: string;
    monitoredCorridors: string;
    inspectAiFactors: string;
    priorityDeliveries: string;
    rankedCriticality: string;
    priorityScore: string;
    riskScoreLabel: string;
  };
  driver: {
    cockpitTitle: string;
    pilotLabel: string;
    cockpitDesc: string;
    emergencySosBtn: string;
    sosSentAlert: string;
    corridorBlockedAhead: string;
    rockslideWarning: string;
    aiRerouteTitle: string;
    acceptRerouteBtn: string;
    compareAlternativesBtn: string;
    reportHazardBtn: string;
    consignmentTitle: string;
    coldChainVerified: string;
    transitMilestones: string;
    bypassedSuccessMsg: string;
    vehicleLabel: string;
    pilotName: string;
    aiRerouteDesc: string;
    stageDispatched: string;
    stageLoaded: string;
    stageDeparted: string;
    stageInTransit: string;
    stageHighPass: string;
    stageHandover: string;
  };
  field: {
    officerPost: string;
    sectorLabel: string;
    officerDesc: string;
    reportIncidentBtn: string;
    syncPendingBtn: string;
    recentIncidentsTitle: string;
    filterAll: string;
    filterPending: string;
    filterVerified: string;
    filterResolved: string;
    networkStatus: string;
    onlineSynced: string;
    offlineMode: string;
    onlineDesc: string;
    offlineDesc: string;
    syncPendingCount: string;
  };
  alertsScreen: {
    earlyWarning: string;
    totalInQueue: string;
    commandTitle: string;
    commandDesc: string;
    acknowledgeBtn: string;
    locateGisBtn: string;
    triggerRerouteBtn: string;
    filterAll: string;
    filterCritical: string;
    filterHigh: string;
    filterMedium: string;
    filterInfo: string;
    noAlerts: string;
    acknowledgedBtn: string;
  };
  newsRadar: {
    title: string;
    activeCount: string;
    aiSynced: string;
    scanBtn: string;
  };
  analyticsScreen: {
    headerBadge: string;
    benchmarkLabel: string;
    title: string;
    subtitle: string;
    avgRiskReduction: string;
    hoursSaved: string;
    criticalDeliveries: string;
    predictionAccuracy: string;
    hazardBreakdown: string;
    vulnerableCorridors: string;
  };
  gis: {
    title: string;
    subtitle: string;
    layerControls: string;
    legendTitle: string;
    accessible: string;
    moderate: string;
    highRisk: string;
    blocked: string;
    compareBtn: string;
    downloadOfflineArea: string;
    offlineModeActive: string;
  };
  modals: {
    roadDetails: {
      title: string;
      currentStatus: string;
      keyFactors: string;
      markBlocked: string;
      markAccessible: string;
      findAlternate: string;
      createAlert: string;
      historicalSlides: string;
      elevation: string;
    };
    routeComparison: {
      title: string;
      primaryBlocked: string;
      recommendedDetour: string;
      duration: string;
      distance: string;
      riskIndex: string;
      selectRouteBtn: string;
    };
    dynamicReroute: {
      title: string;
      hazardDetected: string;
      bypassCalculated: string;
      acceptBtn: string;
      compareBtn: string;
      dismissBtn: string;
    };
    incidentReport: {
      title: string;
      selectRoad: string;
      hazardType: string;
      severity: string;
      description: string;
      voiceNote: string;
      submitBtn: string;
    };
    whatIf: {
      title: string;
      rainIntensity: string;
      cloudburst: string;
      runSimBtn: string;
      impactSummary: string;
    };
    search: {
      placeholder: string;
      title: string;
      all: string;
      roads: string;
      vehicles: string;
      incidents: string;
    };
    aiAssistant: {
      title: string;
      subtitle: string;
      placeholder: string;
      sendBtn: string;
      suggestions: string;
    };
    newsModal: {
      title: string;
      subtitle: string;
      scanBtn: string;
      showOnMap: string;
      impact: string;
      confidence: string;
      syncEmergency: string;
      indiaOnly: string;
    };
  };
  demoMode: {
    sihFlow: string;
    step: string;
    simulateRain: string;
    predictLandslide: string;
    blockRoad: string;
    reportIncident: string;
    recalculateRoute: string;
    rerouteVehicle: string;
    activateEmergency: string;
    resetDemo: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: 'TerraNex',
    tagline: 'Predict. Decide. Reroute. Deliver.',
    subTagline: 'AI-Powered Logistics Resilience for the Northeast',
    easyMode: 'EASY MODE',
    officerMode: 'OFFICER VIEW',
    easyModeTitle: 'Switch to Full Officer View',
    officerModeTitle: 'Switch to Easy Mode',
    liveEvaluation: 'SIH • LIVE EVALUATION',
    scenarioPipeline: 'Scenario Pipeline',
    stepOf: 'Step {0} of 10',
    openDemo: 'Open 10-Step Evaluator Demo',
    closeDemo: 'Close Scenario Suite',
    emergencySOS: 'SOS',
    nav: {
      home: 'Home',
      map: 'Live GIS Map',
      logistics: 'Logistics',
      alerts: 'Alerts',
      profile: 'Profile',
      report: 'Report Incident',
      incidents: 'Field Incidents',
      route: 'Route Navigation',
      delivery: 'My Cargo',
      simulation: 'Scenario Simulator',
      analytics: 'Analytics',
      help: 'Help (112)'
    },
    roles: {
      authority: 'District Administration / Authority',
      field_officer: 'Field Inspection Officer',
      driver: 'Logistics Driver / Operator',
      analyst: 'Intelligence Analyst'
    },
    kpi: {
      activeVehicles: 'Active Vehicles',
      activeDeliveries: 'Active Deliveries',
      roadBlockages: 'Road Blockages',
      highRiskCorridors: 'High-Risk Corridors',
      atRiskDeliveries: 'At-Risk Deliveries',
      regionalAccessibility: 'Regional Accessibility',
      accessible: 'Accessible',
      restricted: 'Restricted',
      blocked: 'Blocked',
      systemStatus: 'System Status',
      normalOps: 'Normal Operations'
    },
    aiRisk: {
      title: 'AI REGIONAL RISK INTELLIGENCE',
      currentRisk: 'Current Risk Level',
      riskScore: 'Risk Score',
      predictionText: 'Risk expected to surge significantly over the next 6 hours due to monsoon cloudburst.',
      primaryFactors: 'Primary Contributing Factors',
      viewAnalysis: 'View Explainable AI Breakdown',
      disruptionProb: 'Disruption Probability',
      confidence: 'Model Confidence',
      factors: 'Monsoon Saturation • Steep Gradient • Historical Landslide Frequency'
    },
    status: {
      accessible: 'Accessible',
      moderate: 'Moderate Risk',
      highRisk: 'High Risk',
      blocked: 'Blocked',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      inTransit: 'In Transit',
      delayed: 'Delayed',
      delivered: 'Delivered',
      rerouted: 'Rerouted',
      open: 'Open',
      caution: 'Caution'
    },
    emergency: {
      title: 'EMERGENCY CRISIS MODE',
      activeTitle: 'COMMAND POST EMERGENCY TRIAGE',
      criticalIncidents: 'Critical Incidents',
      blockedCorridors: 'Blocked Corridors',
      atRiskDeliveries: 'At-Risk Deliveries',
      emergencyVehicles: 'Emergency Medical Convoys',
      safeRoutes: 'Vetted Safe Corridors',
      findSafestRoute: 'Calculate Safest Convoy Route',
      sosTitle: 'One-Tap Emergency SOS',
      sosDesc: 'Transmits your live coordinates to the NER Disaster Relief HQ instantly.',
      broadcastSosBtn: '🚨 BROADCAST EMERGENCY SOS NOW',
      broadcastSentBtn: '✅ SOS BROADCAST SENT!',
      safetyGuideTitle: '24x7 EMERGENCY RESPONSE',
      stopAudio: 'Stop Audio',
      listenSafety: '🔊 Listen Safety Instructions',
      directCallsTitle: 'Direct Phone Calls (Toll-Free)',
      nearbyHospitalsTitle: 'Nearby Hospitals & Relief Centers',
      viewOnMap: 'View on Map',
      open247: 'OPEN 24/7',
      safeShelter: 'SAFE SHELTER',
      h112Title: 'National Emergency',
      h112Sub: '24x7 Available • Police & Rescue',
      h1077Title: 'Disaster Relief Control',
      h1077Sub: 'Landslide & Flood Operations',
      h108Title: 'Medical Ambulance',
      h108Sub: 'Trauma Care & Doctors',
      tawangHospital: 'Tawang District Hospital',
      tawangHospitalDesc: 'ICU, Trauma Ward, Blood Bank • Open 24 Hours',
      bhalukpongShelter: 'Bhalukpong Relief Camp',
      bhalukpongShelterDesc: 'Food, Clean Water, Safe Staging Area'
    },
    offline: {
      title: 'OFFLINE FIELD MODE',
      desc: 'No network detected. Field reports and GPS telemetry will be cached locally and synced automatically upon reconnection.',
      pendingQueue: 'Pending Sync Queue',
      syncNow: 'Synchronize Data Now',
      syncSuccess: 'All local records successfully synced with central server.',
      online: 'Network Connected',
      offline: 'Operating Offline',
      clearQueue: 'Clear Queue',
      cacheInfo: 'TerraNex uses progressive offline caching to ensure zero data loss in mountainous corridors.',
      itemsCount: 'items'
    },
    actions: {
      reportIncident: 'Report Road Incident',
      submit: 'Submit & Run AI Assessment',
      cancel: 'Cancel',
      acceptReroute: 'Accept AI Reroute',
      viewOptions: 'Compare Route Alternatives',
      simulate: 'Run Simulation',
      markBlocked: 'Mark Road Blocked',
      unmarkBlocked: 'Mark Road Accessible',
      createAlert: 'Broadcast Emergency Alert',
      findAlternate: 'Find Alternate Corridor',
      assignTeam: 'Dispatch Quick Reaction Team',
      logout: 'Sign Out',
      close: 'Close',
      compareRoutes: 'Compare Routes',
      viewOnMap: 'View on GIS',
      search: 'Search'
    },
    profile: {
      title: 'OPERATOR PROFILE',
      signOut: 'Sign Out',
      roleSimulation: 'SIH Evaluator Role Simulation:',
      localizationTitle: 'Multilingual NER Localization',
      offlineSyncTitle: 'Offline Sync & Cache Engine',
      auditTrailTitle: 'System Audit Trail (Immutable Log)',
      traceabilityRecord: 'SIH Traceability Record',
      employeeId: 'ID',
      organization: 'Organization'
    },
    voice: {
      handsFreeBadge: 'Hands-Free Speech Guidance',
      askRoadStatus: 'Ask Road Accessibility by Voice',
      listeningHeading: 'Listening... Speak now!',
      listeningSub: 'Say: "Is the road to Tawang open?" or "Which highway is blocked?"',
      micPromptSub: 'Speak your route or destination — the assistant evaluates road accessibility and replies in speech.',
      speakBtn: 'SPEAK',
      listeningBtn: 'Listening',
      fullBriefing: '🔊 Listen Full Briefing',
      stopAudio: 'Stop Audio',
      micActiveTitle: 'Microphone Active... Listening for speech',
      micActiveSub: 'System answers automatically when you finish speaking',
      quickPromptsTitle: 'Or tap any quick voice prompt to hear spoken status:',
      spokenResultTitle: 'Spoken Road Accessibility Status',
      viewBypassBtn: 'View Safe Bypass Detour'
    },
    simple: {
      dangerBlocked: '⚠️ ALERT: ROAD IS BLOCKED',
      dangerDesc: 'Rockslide blocking both lanes. No vehicles can pass through this section.',
      safeAltAvailable: '✅ SAFE ALTERNATE ROUTE',
      shergaonOpen: 'Shergaon Bypass is Open',
      openSafeDetourBtn: 'Open Safe Detour',
      allClear: 'ALL CLEAR',
      allClearHeading: 'All Main Roads are Safe & Open',
      allClearDesc: 'No major road blockages reported. Safe for transit.',
      directActionsTitle: 'DIRECT QUICK ACTIONS',
      mapCardTitle: 'View Road Map',
      mapCardDesc: 'Green is open, Red is blocked',
      reportCardTitle: 'Report Road Issue',
      reportCardDesc: '1-tap photo or voice note',
      routeCardTitle: 'My Safe Route',
      routeCardDesc: 'Turn-by-turn guidance and detour',
      sosCardTitle: 'Emergency SOS',
      sosCardDesc: 'Alerts control room instantly',
      sosCardSent: 'SOS SENT!',
      roadListTitle: 'Road Highway Status (Open vs Blocked)',
      roadListSubtitle: 'Green = Safe & Open | Red = Blocked',
      filterAll: 'All',
      filterBlocked: 'Blocked',
      filterOpen: 'Open',
      helplinesTitle: 'Direct Emergency Helplines (Tap to Call)',
      helplinesSubtitle: 'Toll-free government emergency lines active 24/7.',
      callNow: 'Call'
    },
    authority: {
      overwatchTitle: 'COMMAND POST OVERWATCH',
      telemetryLive: 'TELEMETRY: LIVE // 2M AGO',
      overwatchDesc: 'Real-time multi-modal logistics oversight across 7 Northeast states with proactive AI disruption prediction.',
      crisisPostBtn: 'CRISIS POST',
      whatIfBtn: 'WHAT-IF SIM',
      regionalAccessibilityHeader: 'REGIONAL ACCESSIBILITY',
      highRiskHeader: 'CRITICAL CORRIDOR VULNERABILITY',
      priorityFleetHeader: 'ACTIVE SUPPLY FLEET DISPATCH',
      evaluateCorridorBtn: 'Evaluate Corridor',
      optimizeAllBtn: 'OPTIMIZE ALL FLEET CORRIDORS',
      commandHq: 'NORTH EAST INTEGRATED COMMAND HQ',
      convoys: 'Convoys Active',
      inActiveTransit: 'in active transit',
      deliveries: 'Deliveries Safe',
      suppliesEnRoute: 'supplies en-route',
      blockages: 'Road Blockages',
      corridorsClosed: 'corridors closed',
      highRisk: 'High-Risk Zones',
      probOver70: 'probability > 70%',
      atRiskDel: 'At-Risk Deliveries',
      requiresReroute: 'requires reroute',
      regionalArterial: 'Regional Arterial Network',
      corridorLength: 'Total 2,420 km monitored',
      accessiblePct: 'Accessible',
      restrictedPct: 'Restricted',
      blockedPct: 'Blocked',
      aiRiskMatrix: 'AI Terrain Risk Matrix',
      postureElevated: 'POSTURE: ELEVATED RISK',
      predictiveModelSub: 'Dynamic multi-factor terrain vulnerability model',
      optimizeAllCorridors: 'Optimize All Corridors',
      disruptionOutlook: '24-Hour Disruption Outlook',
      disruptionOutlookDesc: 'Anticipated corridor instability across high-altitude passes.',
      primaryDrivers: 'Primary Risk Drivers',
      heavyPrecipitation: 'Precipitation > 45mm/h',
      steepSlope: 'Slope > 42° Shear',
      activeDebris: 'Active Saturated Silt',
      executiveDirective: 'Executive Directive',
      executiveDirectiveDesc: 'Reroute all Class-A cryogenic and pediatric life-support convoys through verified lower valleys.',
      openTacticalMap: 'Open Tactical Map View',
      liveNewsEngine: 'LIVE DEFENSE & DISASTER RADAR',
      indiaOnly: 'INDIA DISASTER WIRE ONLY',
      bulletinsActive: 'Live Bulletins Active',
      newsEngineDesc: 'Official real-time feeds from Assam SDMA, BRO, IMD & Northeast Traffic Control.',
      openNewsRadarBtn: 'Open Emergency Radar',
      monitoredCorridors: 'MONITORED REGIONAL CORRIDORS',
      inspectAiFactors: 'Inspect AI Risk Factors',
      priorityDeliveries: 'CRITICAL SUPPLY FLEET TRACKER',
      rankedCriticality: 'Ranked by consignment criticality and corridor hazard exposure.',
      priorityScore: 'Priority Index',
      riskScoreLabel: 'Corridor Risk'
    },
    driver: {
      cockpitTitle: 'TACTICAL DRIVER COCKPIT',
      pilotLabel: 'PILOT',
      cockpitDesc: 'Active navigation telemetry, dynamic detour alerts, and cold-chain integrity monitoring.',
      emergencySosBtn: 'EMERGENCY SOS',
      sosSentAlert: 'SOS SENT TO ESCORT',
      corridorBlockedAhead: 'CORRIDOR BLOCKED AHEAD',
      rockslideWarning: 'Active 450m³ Rockslide on NH-13 at Km 81.3',
      aiRerouteTitle: 'AI RECOMMENDED REROUTE',
      acceptRerouteBtn: 'ACCEPT RECOMMENDED REROUTE',
      compareAlternativesBtn: 'COMPARE ALL 3 ALTERNATIVES',
      reportHazardBtn: 'REPORT GROUND HAZARD',
      consignmentTitle: 'CONSIGNMENT MANIFEST & SENSORS',
      coldChainVerified: 'Cold-Chain Integrity Verified',
      transitMilestones: 'TRANSIT MILESTONES',
      bypassedSuccessMsg: 'Successfully rerouted via Shergaon Bypass (NH-15/27). Safe arrival anticipated.',
      vehicleLabel: 'VEHICLE',
      pilotName: 'Pilot: Rajesh Sharma',
      aiRerouteDesc: 'Alternative via Shergaon Bypass clears blocked section. Adds 14km (+22 min) while reducing landslide risk by 74%.',
      stageDispatched: 'Dispatched from Hub',
      stageLoaded: 'Cold-Chain Loaded & Calibrated',
      stageDeparted: 'Transit Initiated',
      stageInTransit: 'Active Transit on NH-13',
      stageHighPass: 'Approaching High-Risk Sector',
      stageHandover: 'Destination Base Handover'
    },
    field: {
      officerPost: 'FIELD INSPECTION POST • SECTOR 3',
      sectorLabel: 'SECTOR',
      officerDesc: 'Log ground truth disruptions, capture GPS coordinates & evidence, and classify terrain risks with AI.',
      reportIncidentBtn: 'Report Ground Incident',
      syncPendingBtn: 'Sync Pending Reports',
      recentIncidentsTitle: 'RECENT GROUND TRUTH INCIDENTS',
      filterAll: 'All',
      filterPending: 'Pending',
      filterVerified: 'Verified',
      filterResolved: 'Resolved',
      networkStatus: 'COMMUNICATION TELEMETRY',
      onlineSynced: 'ONLINE // SATELLITE SYNCED',
      offlineMode: 'OFFLINE MODE // STORE & FORWARD',
      onlineDesc: 'Direct uplink active to Integrated Command Overwatch.',
      offlineDesc: 'Reports will cache locally and automatically transmit upon reconnection.',
      syncPendingCount: 'Reports Pending Upload'
    },
    alertsScreen: {
      earlyWarning: 'EARLY WARNING DISPATCH',
      totalInQueue: 'Total Alerts In Queue',
      commandTitle: 'Regional Alert Command',
      commandDesc: 'Real-time multi-hazard warnings synthesized from radar, geological slope sensors, and officer field reports.',
      acknowledgeBtn: 'Acknowledge Alert',
      locateGisBtn: 'Locate on GIS',
      triggerRerouteBtn: 'Trigger Multi-Factor Reroute',
      filterAll: 'ALL',
      filterCritical: 'CRITICAL',
      filterHigh: 'HIGH',
      filterMedium: 'MEDIUM',
      filterInfo: 'INFO',
      noAlerts: 'No active alerts matching filter.',
      acknowledgedBtn: 'Acknowledged'
    },
    newsRadar: {
      title: 'LIVE NORTHEAST DISASTER & HIGHWAY RADAR',
      activeCount: 'Active Road Bulletins',
      aiSynced: 'Live Satellite & Wire Stream',
      scanBtn: 'Scan Live Wire'
    },
    analyticsScreen: {
      headerBadge: 'REGIONAL LOGISTICS INTELLIGENCE',
      benchmarkLabel: 'Q3 Performance Benchmark',
      title: 'Accessibility & Disruption Analytics',
      subtitle: 'Longitudinal historical analysis comparing AI predictive rerouting outcomes against legacy transit corridors.',
      avgRiskReduction: 'Average Risk Reduction',
      hoursSaved: 'Travel Hours Saved',
      criticalDeliveries: 'Critical Deliveries',
      predictionAccuracy: 'Prediction Accuracy',
      hazardBreakdown: 'Incident Breakdown by Hazard Category',
      vulnerableCorridors: 'Most Vulnerable Arterial Corridors'
    },
    gis: {
      title: 'Tactical Northeast GIS Operational Surface',
      subtitle: 'Real-time Leaflet GIS mapping with live GPS vehicle vectors, weather layers, and roadblock telemetry.',
      layerControls: 'GIS Layer Controls',
      legendTitle: 'NER Road Accessibility',
      accessible: 'ACCESSIBLE',
      moderate: 'MODERATE RISK',
      highRisk: 'HIGH RISK',
      blocked: 'BLOCKED (Debris/Landslide)',
      compareBtn: 'Compare Routes',
      downloadOfflineArea: 'Download Offline Area',
      offlineModeActive: 'Offline Map Active (Cached Tiles)'
    },
    modals: {
      roadDetails: {
        title: 'Highway Disruption & Vulnerability Details',
        currentStatus: 'CURRENT ACCESSIBILITY STATUS',
        keyFactors: 'AI Risk Analysis & Terrain Factors',
        markBlocked: 'Mark as Blocked',
        markAccessible: 'Mark as Accessible',
        findAlternate: 'Find Alternate Safe Corridor',
        createAlert: 'Broadcast Public Alert',
        historicalSlides: 'Historical Landslides',
        elevation: 'Elevation Gradient'
      },
      routeComparison: {
        title: 'Multi-Factor Route Corridor Evaluation',
        primaryBlocked: 'Primary Corridor Blocked',
        recommendedDetour: 'Recommended Alternate Corridor',
        duration: 'Estimated Duration',
        distance: 'Total Distance',
        riskIndex: 'Landslide Risk Index',
        selectRouteBtn: 'Select This Corridor & Reroute Fleet'
      },
      dynamicReroute: {
        title: 'CRITICAL REROUTING ALERT',
        hazardDetected: 'Major landslide detected directly on your assigned route on NH-13.',
        bypassCalculated: 'AI has calculated a verified safe corridor via Shergaon Bypass.',
        acceptBtn: 'ACCEPT AI REROUTE',
        compareBtn: 'COMPARE ALL OPTIONS',
        dismissBtn: 'DISMISS'
      },
      incidentReport: {
        title: 'Report Road Incident / Hazard',
        selectRoad: 'Select Highway / Corridor',
        hazardType: 'Hazard Classification',
        severity: 'Severity Level',
        description: 'Ground Observation Notes',
        voiceNote: 'Spoken Audio Voice Note',
        submitBtn: 'Submit & Analyze with AI'
      },
      whatIf: {
        title: 'What-If Disruption Scenario Simulator',
        rainIntensity: 'Monsoon Cloudburst Rainfall',
        cloudburst: 'Simulate Flash Flood River Swell',
        runSimBtn: 'Run Predictive Disruption Simulation',
        impactSummary: 'Predicted Road Blockage Summary'
      },
      search: {
        placeholder: 'Search roads, vehicles, drivers, incidents, alerts...',
        title: 'Unified Multi-Entity Search',
        all: 'All Types',
        roads: 'Roads',
        vehicles: 'Vehicles',
        incidents: 'Incidents'
      },
      aiAssistant: {
        title: 'AI Grounded Logistics Copilot',
        subtitle: 'Real-time assistant for road accessibility, weather, and alternate routes',
        placeholder: 'Ask anything about road conditions, weather, or rerouting...',
        sendBtn: 'Ask Copilot',
        suggestions: 'Suggested Inquiries'
      },
      newsModal: {
        title: 'LIVE NORTHEAST DISASTER & HIGHWAY RADAR',
        subtitle: 'Aggregating verified road closures, cloudburst incidents, and disaster advisories across Northeast India.',
        scanBtn: 'SCAN LIVE BULLETINS',
        showOnMap: 'Locate Corridor on Map',
        impact: 'Logistics Corridor Impact',
        confidence: 'Confidence Score',
        syncEmergency: 'Emergency System Sync Active',
        indiaOnly: 'INDIA DISASTER WIRE ONLY'
      }
    },
    demoMode: {
      sihFlow: 'SIH Live Demonstration Storyline',
      step: 'Step',
      simulateRain: '1. Heavy Monsoon Rain Begins',
      predictLandslide: '2. AI Predicts Landslide Risk',
      blockRoad: '3. Landslide Blocks NH-13',
      reportIncident: '4. Field Officer Reports Incident',
      recalculateRoute: '5. AI Computes Alternate Corridor',
      rerouteVehicle: '6. Driver Accepts Reroute',
      activateEmergency: '7. Toggle Emergency Command Mode',
      resetDemo: 'Reset Scenario State'
    }
  },
  hi: {
    appName: 'टेरानेक्स (TerraNex)',
    tagline: 'पूर्वानुमान। निर्णय। नया मार्ग। सुरक्षित आपूर्ति।',
    subTagline: 'पूर्वोत्तर भारत हेतु एआई-आधारित लॉजिस्टिक्स रेजिलिएंस',
    easyMode: 'सरल मोड',
    officerMode: 'विस्तृत मोड',
    easyModeTitle: 'विस्तृत अधिकारी दृश्य पर स्विच करें',
    officerModeTitle: 'सरल मोड पर स्विच करें',
    liveEvaluation: 'एसआईएच • लाइव मूल्यांकन',
    scenarioPipeline: 'परिदृश्य अनुक्रम',
    stepOf: 'चरण {0} / 10',
    openDemo: '१०-चरणीय डेमो खोलें',
    closeDemo: 'डेमो बंद करें',
    emergencySOS: 'आपातकाल',
    nav: {
      home: 'मुख्य पृष्ठ',
      map: 'लाइव जीआईएस मानचित्र',
      logistics: 'लॉजिस्टिक्स',
      alerts: 'चेतावनी',
      profile: 'प्रोफ़ाइल',
      report: 'घटना दर्ज करें',
      incidents: 'क्षेत्रीय घटनाएं',
      route: 'मार्ग नेविगेशन',
      delivery: 'मेरी खेप',
      simulation: 'सिम्युलेटर',
      analytics: 'एनालिटिक्स',
      help: 'मदद (112)'
    },
    roles: {
      authority: 'ज़िला प्रशासन / नियंत्रण कक्ष',
      field_officer: 'फील्ड निरीक्षण अधिकारी',
      driver: 'लॉजिस्टिक्स चालक / ऑपरेटर',
      analyst: 'डेटा विश्लेषक'
    },
    kpi: {
      activeVehicles: 'सक्रिय वाहन',
      activeDeliveries: 'सक्रिय आपूर्ति',
      roadBlockages: 'अवरुद्ध सड़कें',
      highRiskCorridors: 'उच्च जोखिम वाले मार्ग',
      atRiskDeliveries: 'जोखिमग्रस्त खेप',
      regionalAccessibility: 'क्षेत्रीय सुगमता',
      accessible: 'सुगम',
      restricted: 'प्रतिबंधित',
      blocked: 'अवरुद्ध',
      systemStatus: 'सिस्टम स्थिति',
      normalOps: 'सामान्य संचालन'
    },
    aiRisk: {
      title: 'एआई क्षेत्रीय जोखिम विश्लेषण',
      currentRisk: 'वर्तमान जोखिम स्तर',
      riskScore: 'जोखिम अंक',
      predictionText: 'आगामी 6 घंटों में भारी मानसूनी वर्षा के कारण जोखिम में तीव्र वृद्धि का अनुमान है।',
      primaryFactors: 'प्रमुख कारण',
      viewAnalysis: 'एआई विश्लेषण देखें',
      disruptionProb: 'बाधा की संभावना',
      confidence: 'मॉडल सटीकता',
      factors: 'मानसूनी संतृप्ति • खड़ी ढलान • ऐतिहासिक भूस्खलन आवृत्ति'
    },
    status: {
      accessible: 'सुगम (Accessible)',
      moderate: 'मध्यम जोखिम',
      highRisk: 'उच्च जोखिम (High Risk)',
      blocked: 'अवरुद्ध (Blocked)',
      critical: 'अति-गंभीर',
      high: 'उच्च',
      medium: 'मध्यम',
      low: 'निम्न',
      inTransit: 'मार्ग में (In Transit)',
      delayed: 'विलंबित',
      delivered: 'वितरित',
      rerouted: 'नया मार्ग',
      open: 'खुला है',
      caution: 'सावधान'
    },
    emergency: {
      title: 'आपातकालीन आपदा मोड',
      activeTitle: 'कमांड सेंटर आपातकालीन नियंत्रण',
      criticalIncidents: 'गंभीर घटनाएं',
      blockedCorridors: 'अवरुद्ध गलियारे',
      atRiskDeliveries: 'जोखिम में खेप',
      emergencyVehicles: 'आपातकालीन चिकित्सा वाहन',
      safeRoutes: 'सुरक्षित वैकल्पिक मार्ग',
      findSafestRoute: 'सुरक्षित काफिला मार्ग चुनें',
      sosTitle: 'एक-क्लिक में मदद संदेश भेजें',
      sosDesc: 'यह बटन दबाते ही आपकी जीपीएस लोकेशन तुरंत निकटतम कंट्रोल रूम और राहत दल को चली जाएगी।',
      broadcastSosBtn: '🚨 अभी आपातकालीन SOS भेजें',
      broadcastSentBtn: '✅ मदद संदेश भेजा जा चुका है!',
      safetyGuideTitle: '२४x७ आपातकालीन सहायता',
      stopAudio: 'आवाज़ रोकें',
      listenSafety: '🔊 सुरक्षा निर्देश सुनें',
      directCallsTitle: 'सीधे फोन करें (टोल-फ्री नंबर)',
      nearbyHospitalsTitle: 'नजदीकी अस्पताल व राहत शिविर',
      viewOnMap: 'नक्शे में देखें',
      open247: '२४ घंटे खुला',
      safeShelter: 'सुरक्षित आश्रय',
      h112Title: 'राष्ट्रीय आपातकाल',
      h112Sub: '२४ घंटे उपलब्ध • पुलिस व बचाव',
      h1077Title: 'आपदा नियंत्रण कक्ष',
      h1077Sub: 'भूस्खलन व बाढ़ सहायता',
      h108Title: 'एम्बुलेंस / डॉक्टर',
      h108Sub: 'तुरंत डॉक्टर व चिकित्सा',
      tawangHospital: 'तवांग जिला अस्पताल',
      tawangHospitalDesc: 'ICU, ट्रॉमा वार्ड, ब्लड बैंक • २४ घंटे खुला',
      bhalukpongShelter: 'भालुकपॉन्ग राहत शिविर',
      bhalukpongShelterDesc: 'भोजन, पानी, सुरक्षित रुकने की व्यवस्था'
    },
    offline: {
      title: 'ऑफ़लाइन फील्ड मोड',
      desc: 'नेटवर्क उपलब्ध नहीं है। रिपोर्ट और जीपीएस डेटा स्थानीय रूप से सुरक्षित है और कनेक्टिविटी मिलते ही स्वतः सिंक हो जाएगा।',
      pendingQueue: 'लंबित सिंक कतार',
      syncNow: 'डेटा अभी सिंक करें',
      syncSuccess: 'सभी रिकॉर्ड केंद्रीय सर्वर से सफलतापूर्वक सिंक हो गए हैं।',
      online: 'नेटवर्क जुड़ा हुआ',
      offline: 'ऑफ़लाइन कार्यशील',
      clearQueue: 'कतार खाली करें',
      cacheInfo: 'पहाड़ी घाटियों में बिना नेटवर्क के भी डेटा सुरक्षित रखने हेतु प्रगतिशील कैशिंग।',
      itemsCount: 'मद'
    },
    actions: {
      reportIncident: 'सड़क अवरोध दर्ज करें',
      submit: 'सबमिट एवं एआई जांच करें',
      cancel: 'रद्द करें',
      acceptReroute: 'नया मार्ग स्वीकारें',
      viewOptions: 'वैकल्पिक मार्ग देखें',
      simulate: 'सिम्युलेशन चलाएं',
      markBlocked: 'सड़क को अवरुद्ध चिह्नित करें',
      unmarkBlocked: 'सड़क को सुगम चिह्नित करें',
      createAlert: 'अलर्ट जारी करें',
      findAlternate: 'वैकल्पिक मार्ग खोजें',
      assignTeam: 'त्वरित कार्यदल भेजें',
      logout: 'लॉग आउट',
      close: 'बंद करें',
      compareRoutes: 'मार्ग तुलना',
      viewOnMap: 'मानचित्र पर देखें',
      search: 'खोजें'
    },
    profile: {
      title: 'ऑपरेटर प्रोफ़ाइल',
      signOut: 'लॉग आउट',
      roleSimulation: 'एसआईएच मूल्यांकनकर्ता भूमिका सिमुलेशन:',
      localizationTitle: 'बहुभाषी पूर्वोत्तर स्थानीयकरण',
      offlineSyncTitle: 'ऑफ़लाइन सिंक एवं कैश इंजन',
      auditTrailTitle: 'सिस्टम ऑडिट ट्रेल (अपरिवर्तनीय रिकॉर्ड)',
      traceabilityRecord: 'एसआईएच ट्रेसेबिलिटी रिकॉर्ड',
      employeeId: 'आईडी',
      organization: 'संगठन'
    },
    voice: {
      handsFreeBadge: 'बिना पढ़े सिर्फ़ बोलकर पूछें',
      askRoadStatus: 'माइक दबाएं और सड़क का हाल पूछें',
      listeningHeading: 'हम सुन रहे हैं... बोलिए!',
      listeningSub: 'जैसे बोलें: "तवांग का रास्ता खुला है क्या?" या "कौन सी सड़क बंद है?"',
      micPromptSub: 'तवांग, शिलॉन्ग, तेजपुर या किसी भी सड़क का नाम बोलें — सिस्टम बोलकर जवाब देगा।',
      speakBtn: 'बोलें',
      listeningBtn: 'सुन रहा हूँ',
      fullBriefing: '🔊 पूरा हाल सुनें',
      stopAudio: 'आवाज़ रोकें',
      micActiveTitle: 'माइक चालू है... आवाज़ पहचानी जा रही है',
      micActiveSub: 'बोलना समाप्त करने पर अपने आप जवाब मिलेगा',
      quickPromptsTitle: 'या किसी एक सवाल को दबाकर तुरंत जवाब सुनें:',
      spokenResultTitle: 'सड़क सुगमता स्थिति',
      viewBypassBtn: 'सुरक्षित बाईपास मार्ग देखें'
    },
    simple: {
      dangerBlocked: '⚠️ सावधान: रास्ता बंद है',
      dangerDesc: 'चट्टान और मलबा गिरने (लैंडस्लाइड) से सड़क दोनों तरफ से बंद है। गाड़ियां नहीं जा सकतीं।',
      safeAltAvailable: '✅ सुरक्षित विकल्प उपलब्ध',
      shergaonOpen: 'शेरगांव बाईपास खुला है',
      openSafeDetourBtn: 'नया सुरक्षित मार्ग देखें',
      allClear: 'रास्ता साफ़ है',
      allClearHeading: 'सभी मुख्य रास्ते खुले हैं',
      allClearDesc: 'कोई बड़ी रुकावट नहीं है। आप आराम से यात्रा कर सकते हैं।',
      directActionsTitle: 'मुख्य सुविधाएं (आसान काम)',
      mapCardTitle: 'रास्ते का नक्शा',
      mapCardDesc: 'हरा रास्ता = खुला, लाल = बंद',
      reportCardTitle: 'सड़क पर खतरा बताएं',
      reportCardDesc: 'फोटो खींचें या बोलकर बताएं',
      routeCardTitle: 'मेरा सुरक्षित रास्ता',
      routeCardDesc: 'गाड़ी कहां तक पहुंची और अगला मोड़',
      sosCardTitle: 'मदद मांगें (SOS)',
      sosCardDesc: 'कंट्रोल रूम को तुरंत लोकेशन भेजें',
      sosCardSent: 'मदद भेजी गई!',
      roadListTitle: 'सड़कों का हाल (खुली और बंद सड़कें)',
      roadListSubtitle: 'हरा = सुरक्षित और खुला | लाल = बंद या ख़तरा',
      filterAll: 'सभी',
      filterBlocked: 'बंद',
      filterOpen: 'खुला',
      helplinesTitle: 'आपातकालीन फोन नंबर (तुरंत कॉल करें)',
      helplinesSubtitle: 'मुसीबत में किसी भी नंबर पर सीधा फोन मिला सकते हैं (निःशुल्क)',
      callNow: 'कॉल करें'
    },
    authority: {
      overwatchTitle: 'कमांड पोस्ट निरीक्षण',
      telemetryLive: 'टेलीमेट्री: लाइव // २ मि. पूर्व',
      overwatchDesc: 'पूर्वोत्तर के ७ राज्यों में पूर्व-सक्रिय एआई व्यवधान पूर्वानुमान के साथ रीयल-टाइम लॉजिस्टिक्स प्रबंधन।',
      crisisPostBtn: 'संकट पोस्ट',
      whatIfBtn: 'सिम्युलेटर',
      regionalAccessibilityHeader: 'क्षेत्रीय सुगमता',
      highRiskHeader: 'अति-संवेदनशील गलियारे',
      priorityFleetHeader: 'सक्रिय आपूर्ति काफिला',
      evaluateCorridorBtn: 'सड़क जांचें',
      optimizeAllBtn: 'समस्त मार्गों का अनुकूलन',
      commandHq: 'पूर्वोत्तर एकीकृत कमान मुख्यालय',
      convoys: 'सक्रिय काफिले',
      inActiveTransit: 'मार्ग में गतिशील',
      deliveries: 'सुरक्षित आपूर्तियां',
      suppliesEnRoute: 'रास्ते में सामग्री',
      blockages: 'सड़क अवरोध',
      corridorsClosed: 'बंद गलियारे',
      highRisk: 'अति-संवेदनशील क्षेत्र',
      probOver70: 'संभावना > ७०%',
      atRiskDel: 'जोखिम में खेप',
      requiresReroute: 'नया मार्ग आवश्यक',
      regionalArterial: 'क्षेत्रीय मुख्य सड़क नेटवर्क',
      corridorLength: 'कुल २,४२० किमी निगरानी',
      accessiblePct: 'सुगम (खुला)',
      restrictedPct: 'प्रतिबंधित',
      blockedPct: 'अवरुद्ध',
      aiRiskMatrix: 'एआई भू-भाग जोखिम मैट्रिक्स',
      postureElevated: 'स्थिति: उच्च जोखिम',
      predictiveModelSub: 'बहु-कारकीय पूर्व-सक्रिय इलाके का जोखिम मॉडल',
      optimizeAllCorridors: 'समस्त मार्गों का अनुकूलन',
      disruptionOutlook: '२४ घंटे का व्यवधान दृष्टिकोण',
      disruptionOutlookDesc: 'उच्च पर्वतीय दर्रों में सड़क अस्थिरता का पूर्वानुमान।',
      primaryDrivers: 'मुख्य जोखिम कारक',
      heavyPrecipitation: 'वर्षा > ४५ मिमी/घंटा',
      steepSlope: 'ढलान > ४२° तीव्र कोण',
      activeDebris: 'सक्रिय कीचड़ व मलबा',
      executiveDirective: 'उच्च प्रशासनिक निर्देश',
      executiveDirectiveDesc: 'सभी श्रेणी-ए क्रायोजेनिक और जीवन रक्षक बाल चिकित्सा वाहनों को सुरक्षित निचले मार्गों से भेजें।',
      openTacticalMap: 'सामरिक मानचित्र खोलें',
      liveNewsEngine: 'लाइव सुरक्षा एवं आपदा रडार',
      indiaOnly: 'केवल भारत आपदा बुलेटिन',
      bulletinsActive: 'लाइव बुलेटिन सक्रिय',
      newsEngineDesc: 'असम राज्य आपदा प्रबंधन, बीआरओ, मौसम विभाग व पूर्वोत्तर ट्रैफिक से लाइव बुलेटिन।',
      openNewsRadarBtn: 'आपातकालीन रडार खोलें',
      monitoredCorridors: 'निगरानी में प्रमुख गलियारे',
      inspectAiFactors: 'एआई जोखिम कारक देखें',
      priorityDeliveries: 'अति-आवश्यक आपूर्ति काफिला ट्रैकर',
      rankedCriticality: 'सामग्री की प्राथमिकता एवं मार्ग के जोखिम के आधार पर क्रमबद्ध।',
      priorityScore: 'प्राथमिकता सूचकांक',
      riskScoreLabel: 'मार्ग जोखिम'
    },
    driver: {
      cockpitTitle: 'लॉजिस्टिक्स चालक कॉकपिट',
      pilotLabel: 'चालक',
      cockpitDesc: 'सक्रिय नेविगेशन टेलीमेट्री, त्वरित डायवर्जन अलर्ट और कोल्ड-चेन निगरानी।',
      emergencySosBtn: 'आपातकालीन SOS',
      sosSentAlert: 'सुरक्षा दल को SOS भेजा गया',
      corridorBlockedAhead: 'आगे का रास्ता अवरुद्ध है',
      rockslideWarning: 'एनएच-13 पर किमी 81.3 के पास 450 घनमीटर का भूस्खलन',
      aiRerouteTitle: 'एआई द्वारा सुझाया नया मार्ग',
      acceptRerouteBtn: 'नया मार्ग स्वीकार करें',
      compareAlternativesBtn: 'तीनों वैकल्पिक मार्गों की तुलना करें',
      reportHazardBtn: 'सड़क पर बाधा की सूचना दें',
      consignmentTitle: 'खेप विवरण एवं सेंसर डेटा',
      coldChainVerified: 'शीत-शृंखला (कोल्ड चेन) सुरक्षित',
      transitMilestones: 'यात्रा के प्रमुख पड़ाव',
      bypassedSuccessMsg: 'शेरगांव बाईपास के रास्ते सुरक्षित नया मार्ग अपनाया गया। समय पर सुरक्षित आगमन अनुमानित है।',
      vehicleLabel: 'वाहन',
      pilotName: 'चालक: राजेश शर्मा',
      aiRerouteDesc: 'शेरगांव बाईपास के माध्यम से वैकल्पिक मार्ग अवरुद्ध भाग से बचाता है। १४ किमी (+२२ मिनट) अतिरिक्त, भूस्खलन जोखिम में ७४% कमी।',
      stageDispatched: 'डिपो से प्रस्थान',
      stageLoaded: 'कोल्ड-चेन लोड एवं कैलिब्रेटेड',
      stageDeparted: 'यात्रा शुरू',
      stageInTransit: 'एनएच-13 पर गतिमान',
      stageHighPass: 'संवेदनशील क्षेत्र के समीप',
      stageHandover: 'गंतव्य बेस पर सुपुर्दगी'
    },
    field: {
      officerPost: 'फील्ड निरीक्षण चौकी • सेक्टर 3',
      sectorLabel: 'सेक्टर',
      officerDesc: 'जमीनी रुकावटें दर्ज करें, जीपीएस व प्रमाण एकत्र करें तथा एआई से जोखिम श्रेणी तय करें।',
      reportIncidentBtn: 'जमीनी घटना दर्ज करें',
      syncPendingBtn: 'लंबित रिपोर्ट सिंक करें',
      recentIncidentsTitle: 'हाल की जमीनी घटनाएं',
      filterAll: 'सभी',
      filterPending: 'लंबित',
      filterVerified: 'सत्यापित',
      filterResolved: 'समाधान हुआ',
      networkStatus: 'संचार टेलीमेट्री',
      onlineSynced: 'ऑनलाइन // उपग्रह से जुड़ा',
      offlineMode: 'ऑफ़लाइन मोड // स्थानीय संग्रह',
      onlineDesc: 'एकीकृत कमान मुख्यालय से सीधा संपर्क सक्रिय।',
      offlineDesc: 'रिपोर्ट स्थानीय रूप से सुरक्षित रहेंगी और कनेक्शन मिलते ही अपने आप भेजी जाएंगी।',
      syncPendingCount: 'अपलोड के लिए लंबित रिपोर्ट'
    },
    alertsScreen: {
      earlyWarning: 'पूर्व चेतावनी प्रसारण',
      totalInQueue: 'कुल सक्रिय अलर्ट',
      commandTitle: 'क्षेत्रीय चेतावनी कमान',
      commandDesc: 'रडार, ढलान सेंसर और फील्ड रिपोर्ट द्वारा संकलित बहु-आपदा चेतावनी।',
      acknowledgeBtn: 'अलर्ट स्वीकारें',
      locateGisBtn: 'नक्शे पर देखें',
      triggerRerouteBtn: 'नया सुरक्षित मार्ग खोजें',
      filterAll: 'सभी',
      filterCritical: 'अति-गंभीर',
      filterHigh: 'उच्च',
      filterMedium: 'मध्यम',
      filterInfo: 'सूचना',
      noAlerts: 'फ़िल्टर से मेल खाती कोई सक्रिय चेतावनी नहीं है।',
      acknowledgedBtn: 'स्वीकृत'
    },
    newsRadar: {
      title: 'लाइव पूर्वोत्तर आपदा एवं राजमार्ग रडार',
      activeCount: 'सक्रिय सड़क बुलेटिन',
      aiSynced: 'लाइव उपग्रह एवं समाचार स्ट्रीम',
      scanBtn: 'लाइव बुलेटिन स्कैन करें'
    },
    analyticsScreen: {
      headerBadge: 'क्षेत्रीय लॉजिस्टिक्स एनालिटिक्स',
      benchmarkLabel: 'तिमाही प्रदर्शन बेंचमार्क',
      title: 'सुगमता एवं व्यवधान विश्लेषण',
      subtitle: 'पारंपरिक मार्गों की तुलना में एआई-आधारित मार्ग परिवर्तन के परिणामों का ऐतिहासिक विश्लेषण।',
      avgRiskReduction: 'औसत जोखिम में कमी',
      hoursSaved: 'बचाया गया यात्रा समय',
      criticalDeliveries: 'अति-आवश्यक आपूर्ति',
      predictionAccuracy: 'पूर्वानुमान सटीकता',
      hazardBreakdown: 'आपदा श्रेणी के अनुसार वर्गीकरण',
      vulnerableCorridors: 'सर्वाधिक संवेदनशील मुख्य मार्ग'
    },
    gis: {
      title: 'सामरिक पूर्वोत्तर जीआईएस संचालन पृष्ठ',
      subtitle: 'लाइव जीपीएस वाहन वेक्टर, मौसम परतों और सड़क अवरोध टेलीमेट्री के साथ रीयल-टाइम मानचित्र।',
      layerControls: 'जीआईएस परत नियंत्रण',
      legendTitle: 'सड़क सुगमता स्थिति',
      accessible: 'सुगम (खुला)',
      moderate: 'मध्यम जोखिम',
      highRisk: 'उच्च जोखिम',
      blocked: 'अवरुद्ध (मलबा/भूस्खलन)',
      compareBtn: 'मार्ग तुलना',
      downloadOfflineArea: 'ऑफलाइन मैप डाउनलोड करें',
      offlineModeActive: 'ऑफलाइन मैप सक्रिय (संग्रहीत टाइल्स)'
    },
    modals: {
      roadDetails: {
        title: 'सड़क व्यवधान एवं संवेदनशीलता विवरण',
        currentStatus: 'वर्तमान सुगमता स्थिति',
        keyFactors: 'एआई जोखिम विश्लेषण एवं भू-कारक',
        markBlocked: 'सड़क अवरुद्ध चिह्नित करें',
        markAccessible: 'सड़क खुली चिह्नित करें',
        findAlternate: 'वैकल्पिक सुरक्षित मार्ग खोजें',
        createAlert: 'सार्वजनिक अलर्ट जारी करें',
        historicalSlides: 'ऐतिहासिक भूस्खलन',
        elevation: 'ऊंचाई व ढलान'
      },
      routeComparison: {
        title: 'बहु-आयामी वैकल्पिक मार्ग तुलना',
        primaryBlocked: 'मुख्य मार्ग अवरुद्ध है',
        recommendedDetour: 'सुझाया गया सुरक्षित मार्ग',
        duration: 'अनुमानित समय',
        distance: 'कुल दूरी',
        riskIndex: 'भूस्खलन जोखिम सूचकांक',
        selectRouteBtn: 'यह मार्ग चुनें एवं काफिले को नया मार्ग दें'
      },
      dynamicReroute: {
        title: 'अति-महत्वपूर्ण मार्ग परिवर्तन चेतावनी',
        hazardDetected: 'आपके वर्तमान मार्ग एनएच-13 पर बड़ा भूस्खलन दर्ज हुआ है।',
        bypassCalculated: 'एआई ने शेरगांव बाईपास के जरिए सुरक्षित मार्ग तैयार किया है।',
        acceptBtn: 'नया मार्ग स्वीकार करें',
        compareBtn: 'सभी विकल्प देखें',
        dismissBtn: 'हटाएं'
      },
      incidentReport: {
        title: 'सड़क घटना / खतरे की रिपोर्ट दर्ज करें',
        selectRoad: 'राजमार्ग / सड़क चुनें',
        hazardType: 'खतरे का प्रकार',
        severity: 'गंभीरता का स्तर',
        description: 'घटना का विवरण',
        voiceNote: 'आवाज़ में रिकॉर्ड करें',
        submitBtn: 'सबमिट करें व एआई जांचें'
      },
      whatIf: {
        title: 'परिदृश्य सिम्युलेटर',
        rainIntensity: 'मानसूनी वर्षा तीव्रता',
        cloudburst: 'फ्लैश फ्लड नदी उफान अनुकरण',
        runSimBtn: 'पूर्वानुमान सिम्युलेशन चलाएं',
        impactSummary: 'संभावित सड़क अवरोध सारांश'
      },
      search: {
        placeholder: 'सड़क, वाहन, चालक, घटना या अलर्ट खोजें...',
        title: 'एकीकृत खोज प्रणाली',
        all: 'सभी',
        roads: 'सड़कें',
        vehicles: 'वाहन',
        incidents: 'घटनाएं'
      },
      aiAssistant: {
        title: 'एआई लॉजिस्टिक्स सहायक',
        subtitle: 'सड़क सुगमता, मौसम और वैकल्पिक मार्गों के लिए रीयल-टाइम सहायक',
        placeholder: 'सड़क, मौसम या वैकल्पिक मार्ग के बारे में कुछ भी पूछें...',
        sendBtn: 'पूछें',
        suggestions: 'सुझाए गए प्रश्न'
      },
      newsModal: {
        title: 'लाइव पूर्वोत्तर आपदा एवं राजमार्ग रडार',
        subtitle: 'पूर्वोत्तर भारत में सत्यापित सड़क अवरोधों, बादल फटने और आपदा बुलेटिनों का संकलन।',
        scanBtn: 'लाइव बुलेटिन स्कैन करें',
        showOnMap: 'नक्शे पर गलियारा देखें',
        impact: 'लॉजिस्टिक्स गलियारे पर प्रभाव',
        confidence: 'विश्वसनीयता स्कोर',
        syncEmergency: 'आपातकालीन प्रणाली सिंक सक्रिय',
        indiaOnly: 'केवल भारत आपदा बुलेटिन'
      }
    },
    demoMode: {
      sihFlow: 'एसआईएच लाइव प्रस्तुति अनुक्रम',
      step: 'चरण',
      simulateRain: '१. भारी मानसूनी वर्षा शुरू',
      predictLandslide: '२. एआई भूस्खलन की भविष्यवाणी',
      blockRoad: '३. एनएच-13 पर भूस्खलन',
      reportIncident: '४. फील्ड अधिकारी द्वारा रिपोर्ट',
      recalculateRoute: '५. एआई नया सुरक्षित मार्ग सुझाता है',
      rerouteVehicle: '६. चालक द्वारा नया मार्ग स्वीकृत',
      activateEmergency: '७. आपातकालीन कमांड मोड चालू',
      resetDemo: 'स्थिति रीसेट करें'
    }
  },
  as: {
    appName: 'টেৰানেক্স (TerraNex)',
    tagline: 'পূৰ্বাভাস। সিদ্ধান্ত। বিকল্প পথ। নিৰাপদ যোগান।',
    subTagline: 'উত্তৰ-পূৰ্বাঞ্চলৰ বাবে এআই-চালিত লজিষ্টিক ব্যৱস্থাপনা',
    easyMode: 'সহজ মোড',
    officerMode: 'অফিচাৰ মোড',
    easyModeTitle: 'অফিচাৰ দৃশ্যলৈ যাওক',
    officerModeTitle: 'সহজ মোডলৈ যাওক',
    liveEvaluation: 'এছআইএইচ • লাইভ মূল্যায়ন',
    scenarioPipeline: 'পৰিস্থিতি পৰিক্ৰমা',
    stepOf: 'পদক্ষেপ {0} / ১০',
    openDemo: '১০-পদক্ষেপৰ ডেমো খোলক',
    closeDemo: 'ডেমো বন্ধ কৰক',
    emergencySOS: 'জৰুৰীকালীন',
    nav: {
      home: 'মুখ্য পৃষ্ঠা',
      map: 'লাইভ জিআইএছ মানচিত্ৰ',
      logistics: 'পৰিবহণ',
      alerts: 'সতৰ্কবাৰ্তা',
      profile: 'প্ৰফাইল',
      report: 'তথ্য পঞ্জীয়ন',
      incidents: 'ক্ষেত্ৰৰ ঘটনা',
      route: 'ৰূপৰেখা',
      delivery: 'মোৰ ভঁৰাল',
      simulation: 'চিমুলেচন',
      analytics: 'বিশ্লেষণ',
      help: 'সহায়তা (১১২)'
    },
    roles: {
      authority: 'জিলা প্ৰশাসন / কন্ট্ৰল ৰুম',
      field_officer: 'ক্ষেত্ৰ পৰিদৰ্শন বিষয়া',
      driver: 'যানবাহন চালক / চালক',
      analyst: 'তথ্য বিশ্লেষক'
    },
    kpi: {
      activeVehicles: 'সক্ৰিয় বাহন',
      activeDeliveries: 'সক্ৰিয় যোগান',
      roadBlockages: 'বন্ধ পথসমূহ',
      highRiskCorridors: 'উচ্চ বিপদজনক পথ',
      atRiskDeliveries: 'বিপদাপন্ন যোগান',
      regionalAccessibility: 'আঞ্চলিক সুগমতা',
      accessible: 'মুকলি',
      restricted: 'সীমিত',
      blocked: 'সম্পূৰ্ণ বন্ধ',
      systemStatus: 'ব্যৱস্থাৰ অৱস্থা',
      normalOps: 'স্বাভাৱিক কামকাজ'
    },
    aiRisk: {
      title: 'এআই আঞ্চলিক বিপদাশংকা বিশ্লেষণ',
      currentRisk: 'বৰ্তমানৰ বিপদাশংকাৰ মাত্ৰা',
      riskScore: 'বিপদাশংকা স্কোৰ',
      predictionText: 'অহা ৬ ঘণ্টাত ধাৰাসাৰ বৰষুণৰ ফলত পথ বন্ধ হোৱাৰ সম্ভাৱনা বৃদ্ধি পাইছে।',
      primaryFactors: 'মুখ্য কাৰণসমূহ',
      viewAnalysis: 'এআই বিশ্লেষণ চাওক',
      disruptionProb: 'বাধাৰ সম্ভাৱনা',
      confidence: 'মডেল নিৰ্ভৰযোগ্যতা',
      factors: 'ধাৰাসাৰ বৰষুণ • পাহাৰীয়া ঢাল • পূৰ্বৰ ভূমিস্খলনৰ তথ্য'
    },
    status: {
      accessible: 'মুকলি (Accessible)',
      moderate: 'মধ্যমীয়া বিপদ',
      highRisk: 'উচ্চ সংকট (High Risk)',
      blocked: 'বন্ধ (Blocked)',
      critical: 'অতি জৰুৰী',
      high: 'উচ্চ',
      medium: 'মধ্যম',
      low: 'निम्न',
      inTransit: 'পথত (In Transit)',
      delayed: 'পলম হৈছে',
      delivered: 'বিতৰণ সম্পূৰ্ণ',
      rerouted: 'নতুন পথ',
      open: 'মুকলি আছে',
      caution: 'সাৱধান'
    },
    emergency: {
      title: 'জৰুৰীকালীন সংকট অৱস্থা',
      activeTitle: 'কমাণ্ড প’ষ্ট জৰুৰীকালীন সমন্বয়',
      criticalIncidents: 'গুৰুতৰ ঘটনা',
      blockedCorridors: 'বন্ধ হৈ থকা পথ',
      atRiskDeliveries: 'বিপদত পৰা যোগান',
      emergencyVehicles: 'জৰুৰীকালীন চিকিৎসা বাহন',
      safeRoutes: 'নিৰাপদ বিকল্প পথ',
      findSafestRoute: 'নিৰাপদ পথ নিৰ্ণয় কৰক',
      sosTitle: 'এটা টিপাতে জৰুৰীকালীন বাৰ্তা',
      sosDesc: 'এই বুটামটো টিপিলে আপোনাৰ জিপিএছ স্থানাংক লগে লগে উদ্ধাৰকাৰী দললৈ যাব।',
      broadcastSosBtn: '🚨 এতিয়াই জৰুৰীকালীন SOS পঠাওক',
      broadcastSentBtn: '✅ জৰুৰীকালীন বাৰ্তা প্ৰেৰণ কৰা হ’ল!',
      safetyGuideTitle: '২৪x৭ জৰুৰীকালীন সাহায্য',
      stopAudio: 'শব্দ বন্ধ কৰক',
      listenSafety: '🔊 সুৰক্ষা নিৰ্দেশনা শুনক',
      directCallsTitle: 'প্ৰত্যক্ষ ফোন সেৱা (বিনামূলীয়া)',
      nearbyHospitalsTitle: 'নিকটৱৰ্তী চিকিৎসালয় আৰু সাহায্য শিবিৰ',
      viewOnMap: 'মানচিত্ৰত চাওক',
      open247: '২৪ ঘণ্টা মুকলি',
      safeShelter: 'সুৰক্ষিত আশ্ৰয়স্থল',
      h112Title: 'ৰাষ্ট্ৰীয় জৰুৰীকালীন',
      h112Sub: '২৪ ঘণ্টা সেৱা • আৰক্ষী আৰু উদ্ধাৰ',
      h1077Title: 'দূৰ্যোগ নিয়ন্ত্ৰণ',
      h1077Sub: 'ভূমিস্খলন আৰু বান সাহায্য',
      h108Title: 'চিকিৎসা এম্বুলেন্স',
      h108Sub: 'চিকিৎসক আৰু জৰুৰীকালীন সেৱা',
      tawangHospital: 'তাৱাং জিলা চিকিৎসালয়',
      tawangHospitalDesc: 'আইচিইউ, ট্ৰমা ৱাৰ্ড, ৰক্ত বেংক • ২৪ ঘণ্টা সেৱা',
      bhalukpongShelter: 'ভালুকপং সাহায্য শিবিৰ',
      bhalukpongShelterDesc: 'খাদ্য, বিশুদ্ধ পানী আৰু সুৰক্ষিত থকাৰ ব্যৱস্থা'
    },
    offline: {
      title: 'অফলাইন ফিল্ড মোড',
      desc: 'ইন্টাৰনেট সেৱা নাই। আপোনাৰ প্ৰতিবেদনসমূহ স্থানীয়ভাৱে জমা থাকিব আৰু নেটৱৰ্ক পোৱাৰ লগে লগে স্বয়ংক্রিয়ভাৱে আপলোড হ’ব।',
      pendingQueue: 'বাকী থকা প্ৰতিবেদন',
      syncNow: 'এতিয়াই আপলোড কৰক',
      syncSuccess: 'সকলো তথ্য কেন্দ্ৰীয় চাৰ্ভাৰত সফলভাৱে যোগ কৰা হ’ল।',
      online: 'নেটৱৰ্ক উপলব্ধ',
      offline: 'অফলাইন চলি আছে',
      clearQueue: 'তালিকা খালী কৰক',
      cacheInfo: 'দুৰ্গম অঞ্চলত নিৰৱচ্ছিন্নভাৱে তথ্য সংৰক্ষণ কৰিবলৈ অফলাইন কেছিং ব্যৱস্থা।',
      itemsCount: 'বস্তু'
    },
    actions: {
      reportIncident: 'পথ অৱৰোধ পঞ্জীয়ন কৰক',
      submit: 'দাখিল আৰু এআই পৰীক্ষা',
      cancel: 'বাতিল কৰক',
      acceptReroute: 'নতুন পথ গ্ৰহণ কৰক',
      viewOptions: 'বিকল্প পথসমূহ চাওক',
      simulate: 'চিমুলেচন চলাওক',
      markBlocked: 'পথ বন্ধ বুলি চিহ্নিত কৰক',
      unmarkBlocked: 'পথ মুকলি বুলি চিহ্নিত কৰক',
      createAlert: 'সতৰ্কবাৰ্তা প্ৰেৰণ কৰক',
      findAlternate: 'বিকল্প পথ সন্ধান কৰক',
      assignTeam: 'উদ্ধাৰকাৰী দল প্ৰেৰণ কৰক',
      logout: 'লগ আউট',
      close: 'বন্ধ কৰক',
      compareRoutes: 'পথৰ তুলনা',
      viewOnMap: 'মানচিত্ৰত স্থান',
      search: 'সন্ধান'
    },
    profile: {
      title: 'ব্যৱহাৰকাৰী প্ৰফাইল',
      signOut: 'লগ আউট',
      roleSimulation: 'এছআইএইচ ভূমিকা চিমুলেচন:',
      localizationTitle: 'বহুভাষিক উত্তৰ-পূৰ্বাঞ্চল সেৱা',
      offlineSyncTitle: 'অফলাইন সংৰক্ষণ ব্যৱস্থা',
      auditTrailTitle: 'চিষ্টেম অডিট তথ্য (স্থায়ী ৰেকৰ্ড)',
      traceabilityRecord: 'এছআইএইচ সংৰক্ষিত তথ্য',
      employeeId: 'পৰিচয় নম্বৰ',
      organization: 'সংগঠন'
    },
    voice: {
      handsFreeBadge: 'কেৱল মাত মাতি সুধক',
      askRoadStatus: 'মাইক টিপি বাটৰ খবৰ লওক',
      listeningHeading: 'শুনি আছোঁ... কওক!',
      listeningSub: 'কওক: "তাৱাং পথ মুকলি আছেনে?" বা "কোনটো পথ বন্ধ?"',
      micPromptSub: 'তাৱাং, শ্বিলং বা যিকোনো পথৰ নাম কওক — চিষ্টেমে উত্তৰ দিব।',
      speakBtn: 'কওক',
      listeningBtn: 'শুনি আছোঁ',
      fullBriefing: '🔊 সকলো শুনক',
      stopAudio: 'শব্দ বন্ধ কৰক',
      micActiveTitle: 'মাইক সক্ৰিয়... কথা শুনা হৈছে',
      micActiveSub: 'কথা কোৱা শেষ হ’লে উত্তৰ পোৱা যাব',
      quickPromptsTitle: 'বা তলৰ যিকোনো এটা প্ৰশ্ন টিপি উত্তৰ শুনক:',
      spokenResultTitle: 'পথৰ সুগমতা স্থিতি',
      viewBypassBtn: 'সুৰক্ষিত বাইপাছ পথ চাওক'
    },
    simple: {
      dangerBlocked: '⚠️ সাৱধান: পথ সম্পূৰ্ণ বন্ধ',
      dangerDesc: 'ভূমিস্খলনৰ বাবে পথ সম্পূৰ্ণৰূপে বন্ধ হৈ আছে। কোনো গাড়ী যাব নোৱাৰে।',
      safeAltAvailable: '✅ সুৰক্ষিত বিকল্প উপলব্ধ',
      shergaonOpen: 'শ্বেৰগাঁও বাইপাছ মুকলি আছে',
      openSafeDetourBtn: 'নতুন পথ চাওক',
      allClear: 'পথ মুকলি',
      allClearHeading: 'সকলো পথ মুকলি আছে',
      allClearDesc: 'কোনো ডাঙৰ বাধা নাই। যাত্ৰা নিৰাপদ।',
      directActionsTitle: 'প্ৰধান সেৱাসমূহ',
      mapCardTitle: 'পথৰ মানচিত্ৰ',
      mapCardDesc: 'সেউজীয়া = মুকলি, ৰঙা = বন্ধ',
      reportCardTitle: 'পথৰ সমস্যা জনাওক',
      reportCardDesc: 'ফটো তোলক বা কওক',
      routeCardTitle: 'মোৰ সুৰক্ষিত পথ',
      routeCardDesc: 'গাড়ীৰ দিশ আৰু সময়',
      sosCardTitle: 'জৰুৰীকালীন সাহায্য',
      sosCardDesc: 'কন্ট্ৰ’ল ৰুমলৈ খবৰ পঠাওক',
      sosCardSent: 'বাৰ্তা প্ৰেৰণ কৰা হ’ল!',
      roadListTitle: 'পথসমূহৰ বৰ্তমান অৱস্থা',
      roadListSubtitle: 'সেউজীয়া = মুকলি | ৰঙা = বন্ধ বা বিপদ',
      filterAll: 'সকলো',
      filterBlocked: 'বন্ধ',
      filterOpen: 'মুকলি',
      helplinesTitle: 'জৰুৰীকালীন ফোন নম্বৰ',
      helplinesSubtitle: 'বিনামূলীয়া চৰকাৰী জৰুৰীকালীন সেৱা ২৪ ঘণ্টা উপলব্ধ।',
      callNow: 'কল কৰক'
    },
    authority: {
      overwatchTitle: 'কমাণ্ড প’ষ্ট নিৰীক্ষণ',
      telemetryLive: 'টেলিমেট্ৰী: লাইভ // ২ মিনিট পূৰ্বে',
      overwatchDesc: 'পূৰ্বানুমানভিত্তিক এআই প্ৰযুক্তিৰে উত্তৰ-পূৰ্বাঞ্চলৰ ৭ খন ৰাজ্যৰ সামগ্ৰিক পৰিবহণ পৰ্যবেক্ষণ।',
      crisisPostBtn: 'সংকট নিয়ন্ত্ৰণ',
      whatIfBtn: 'চিমুলেচন',
      regionalAccessibilityHeader: 'আঞ্চলিক সুগমতা',
      highRiskHeader: 'সংবেদনশীল পথসমূহ',
      priorityFleetHeader: 'সক্ৰিয় যোগান কনভয়',
      evaluateCorridorBtn: 'পথ পৰীক্ষা কৰক',
      optimizeAllBtn: 'সকলো পথ পুনৰীক্ষণ কৰক',
      commandHq: 'উত্তৰ-পূব সংহত কমাণ্ড মুখ্য কাৰ্যালয়',
      convoys: 'সক্ৰিয় কনভয়',
      inActiveTransit: 'যাত্ৰাত আছে',
      deliveries: 'সুৰক্ষিত বিতৰণ',
      suppliesEnRoute: 'পথত থকা সামগ্ৰী',
      blockages: 'পথ অৱৰোধ',
      corridorsClosed: 'বন্ধ পথসমূহ',
      highRisk: 'সংবেদনশীল অঞ্চল',
      probOver70: 'সম্ভাৱনা > ৭০%',
      atRiskDel: 'বিপদত থকা সামগ্ৰী',
      requiresReroute: 'নতুন পথৰ প্ৰয়োজন',
      regionalArterial: 'আঞ্চলিক মুখ্য পথ নেটৱৰ্ক',
      corridorLength: 'মুঠ ২,৪২০ কিমি নিৰীক্ষণ',
      accessiblePct: 'মুকলি (সচল)',
      restrictedPct: 'নিয়ন্ত্ৰিত',
      blockedPct: 'বন্ধ',
      aiRiskMatrix: 'এআই ভূ-প্ৰকৃতি বিপদ মেট্ৰিক্স',
      postureElevated: 'স্থিতি: উচ্চ বিপদাশংকা',
      predictiveModelSub: 'বহু-কাৰক বিশিষ্ট এআই পূৰ্বাভাস মডেল',
      optimizeAllCorridors: 'সকলো পথ পুনৰীক্ষণ কৰক',
      disruptionOutlook: '২৪ ঘণ্টাৰ বিঘ্নিত সম্ভাৱনা',
      disruptionOutlookDesc: 'উচ্চ পাহাৰীয়া এলেকাত পথ বন্ধ হোৱাৰ পূৰ্বানুমান।',
      primaryDrivers: 'মুখ্য বিপদৰ কাৰকসমূহ',
      heavyPrecipitation: 'বৰষুণ > ৪৫ মিমি/ঘণ্টা',
      steepSlope: 'ঢাল > ৪২° অতি থিয়',
      activeDebris: 'সক্ৰিয় পলস আৰু বোকা',
      executiveDirective: 'উচ্চ প্ৰশাসনিক নিৰ্দেশনা',
      executiveDirectiveDesc: 'সকলো গুৰুত্বপূৰ্ণ চিকিৎসা আৰু শিশু খাদ্য কনভয় বিকল্প নিম্ন উপত্যকাৰ পথেৰে প্ৰেৰণ কৰক।',
      openTacticalMap: 'মানচিত্ৰ দৰ্শন খোলক',
      liveNewsEngine: 'লাইভ সুৰক্ষা আৰু দুৰ্যোগ ৰাডাৰ',
      indiaOnly: 'কেৱল ভাৰত দুৰ্যোগ বুলেটিন',
      bulletinsActive: 'লাইভ বুলেটিন সক্ৰিয়',
      newsEngineDesc: 'অসম দুৰ্যোগ ব্যৱস্থাপনা, বিআৰঅ’, বতৰ বিজ্ঞান বিভাগ আৰু আৰক্ষীৰ পৰা লাইভ তথ্য।',
      openNewsRadarBtn: 'জৰুৰীকালীন ৰাডাৰ খোলক',
      monitoredCorridors: 'নিৰীক্ষণাধীন মুখ্য পথসমূহ',
      inspectAiFactors: 'এআই বিপদৰ কাৰকসমূহ চাওক',
      priorityDeliveries: 'গুৰুত্বপূৰ্ণ যোগান কনভয় ট্ৰেকাৰ',
      rankedCriticality: 'সামগ্ৰীৰ জৰুৰী প্ৰয়োজন আৰু পথৰ বিপদৰ ভিত্তিত নিৰ্ণীত।',
      priorityScore: 'প্ৰাথমিকতা সূচক',
      riskScoreLabel: 'পথৰ বিপদ'
    },
    driver: {
      cockpitTitle: 'চালক ককপিট',
      pilotLabel: 'চালক',
      cockpitDesc: 'সক্ৰিয় নেভিগেচন, বিকল্প পথৰ সতৰ্কবাৰ্তা আৰু সংৰক্ষিত সামগ্ৰী নিৰীক্ষণ।',
      emergencySosBtn: 'জৰুৰীকালীন SOS',
      sosSentAlert: 'সুৰক্ষা বাহিনীলৈ SOS প্ৰেৰণ',
      corridorBlockedAhead: 'আগলৈ পথ বন্ধ হৈ আছে',
      rockslideWarning: 'NH-13 ৰ ৮১.৩ কিমি স্থানত ভূমিস্খলন',
      aiRerouteTitle: 'এআই প্ৰস্তাবিত নতুন পথ',
      acceptRerouteBtn: 'নতুন পথ গ্ৰহণ কৰক',
      compareAlternativesBtn: '৩ টা বিকল্প পথৰ তুলনা চাওক',
      reportHazardBtn: 'পথৰ সমস্যাৰ খবৰ দিয়ক',
      consignmentTitle: 'সামগ্ৰীৰ তথ্য আৰু সংবেদনশীলতা',
      coldChainVerified: 'কোল্ড-চেইন সুৰক্ষিত',
      transitMilestones: 'যাত্ৰাৰ মাইলৰ খুঁটিসমূহ',
      bypassedSuccessMsg: 'শ্বেৰগাঁও বাইপাছেৰে সফলভাৱে নতুন পথ লোৱা হ’ল। নিৰাপদে গৈ পোৱাৰ সম্ভাৱনা।',
      vehicleLabel: 'বাহন',
      pilotName: 'চালক: ৰাজেশ শৰ্মা',
      aiRerouteDesc: 'শ্বেৰগাঁও বাইপাচ হৈ বিকল্প পথে অৱৰুদ্ধ এলেকা এৰাই চলে। ১৪ কিমি অতিৰিক্ত (+২২ মিনিট), ভূমিস্খলনৰ বিপদ ৭৪% কম।',
      stageDispatched: 'ডিপোৰ পৰা প্ৰস্থান',
      stageLoaded: 'কোল্ড-চেইন লোড আৰু পৰীক্ষিত',
      stageDeparted: 'যাত্ৰা আৰম্ভ',
      stageInTransit: 'এনএইচ-১৩ ত গতিশীল',
      stageHighPass: 'সংবেদনশীল এলেকাৰ ওচৰত',
      stageHandover: 'গন্তব্য স্থানত অৰ্পণ'
    },
    field: {
      officerPost: 'ক্ষেত্ৰ পৰিদৰ্শন চকী • ছেক্টৰ ৩',
      sectorLabel: 'ছেক্টৰ',
      officerDesc: 'বাস্তৱ অৱস্থাৰ তথ্য দিয়ক, জিপিএছ সংগ্ৰহ কৰক আৰু এআইৰ সহায়ত সংকট বিশ্লেষণ কৰক।',
      reportIncidentBtn: 'ক্ষেত্ৰৰ ঘটনা পঞ্জীয়ন কৰক',
      syncPendingBtn: 'বাকী থকা প্ৰতিবেদন আপলোড কৰক',
      recentIncidentsTitle: 'শেহতীয়া ফিল্ড প্ৰতিবেদনসমূহ',
      filterAll: 'সকলো',
      filterPending: 'বিচাৰাধীন',
      filterVerified: 'পৰীক্ষিত',
      filterResolved: 'সমাধান হ’ল',
      networkStatus: 'যোগাযোগ টেলিমেট্ৰী',
      onlineSynced: 'অনলাইন // উপগ্ৰহ সংযোগ সক্ৰিয়',
      offlineMode: 'অফলাইন মোড // স্থানীয় সংৰক্ষণ',
      onlineDesc: 'সংহত কমাণ্ড মুখ্য কাৰ্যালয়ৰ সৈতে পোনপটীয়া সংযোগ।',
      offlineDesc: 'প্ৰতিবেদনসমূহ সংৰক্ষিত থাকিব আৰু সংযোগ পোৱাৰ লগে লগে আপলোড হ’ব।',
      syncPendingCount: 'আপলোডৰ অপেক্ষাত থকা প্ৰতিবেদন'
    },
    alertsScreen: {
      earlyWarning: 'আগতীয়া সতৰ্কবাৰ্তা সম্প্ৰচাৰ',
      totalInQueue: 'মুঠ সতৰ্কবাৰ্তা',
      commandTitle: 'আঞ্চলিক সতৰ্কবাৰ্তা কেন্দ্ৰ',
      commandDesc: 'ৰাডাৰ, মাটিৰ সংবেদনশীলতা আৰু বিষয়াৰ প্ৰতিবেদনৰ দ্বাৰা প্ৰস্তুত কৰা সতৰ্কবাৰ্তা।',
      acknowledgeBtn: 'সতৰ্কবাৰ্তা নিশ্চিত কৰক',
      locateGisBtn: 'মানচিত্ৰত স্থান চাওক',
      triggerRerouteBtn: 'বিকল্প পথ নিৰ্ণয় কৰক',
      filterAll: 'সকলো',
      filterCritical: 'অতি জৰুৰী',
      filterHigh: 'উচ্চ',
      filterMedium: 'মধ্যম',
      filterInfo: 'তথ্য',
      noAlerts: 'কোনো সতৰ্কবাৰ্তা নাই।',
      acknowledgedBtn: 'নিশ্চিত কৰা হ’ল'
    },
    newsRadar: {
      title: 'লাইভ উত্তৰ-পূৰ্বাঞ্চল দুৰ্যোগ আৰু ঘাইপথ ৰাডাৰ',
      activeCount: 'সক্ৰিয় পথ বুলেটিন',
      aiSynced: 'উপগ্ৰহ আৰু সংবাদ সেৱা সক্ৰিয়',
      scanBtn: 'লাইভ বুলেটিন চাওক'
    },
    analyticsScreen: {
      headerBadge: 'আঞ্চলিক পৰিবহণ বিশ্লেষণ',
      benchmarkLabel: 'ত্ৰৈমাসিক প্ৰদৰ্শন মান',
      title: 'সুগমতা আৰু বাধাৰ বিশ্লেষণ',
      subtitle: 'পুৰণি পথৰ তুলনাত এআইৰ নতুন পথৰ সফলতাৰ ঐতিহাসিক বিশ্লেষণ।',
      avgRiskReduction: 'গড় সংকট হ্ৰাস',
      hoursSaved: 'ৰাহি হোৱা যাত্ৰাৰ সময়',
      criticalDeliveries: 'জৰুৰীকালীন যোগান',
      predictionAccuracy: 'পূৰ্বানুমানৰ শুদ্ধতা',
      hazardBreakdown: 'বিপদৰ প্ৰকাৰ অনুসৰি বিভাজন',
      vulnerableCorridors: 'অধিক বিপদজনক মুখ্য পথসমূহ'
    },
    gis: {
      title: 'সামৰিক উত্তৰ-পূৰ্বাঞ্চল জিআইএছ পৰিচালনা পৃষ্ঠ',
      subtitle: 'লাইভ জিপিএছ বাহন, বতৰ আৰু পথ অৱৰোধৰ তথ্য সংলগ্ন মানচিত্ৰ।',
      layerControls: 'জিআইএছ লেয়াৰ নিয়ন্ত্ৰণ',
      legendTitle: 'পথৰ সুগমতা স্থিতি',
      accessible: 'মুকলি',
      moderate: 'মধ্যমীয়া বিপদ',
      highRisk: 'উচ্চ বিপদ',
      blocked: 'বন্ধ (ভূমিস্খলন/ধ্বংসাৱশেষ)',
      compareBtn: 'পথৰ তুলনা',
      downloadOfflineArea: 'অফলাইন মেপ ডাউনলোড কৰক',
      offlineModeActive: 'অফলাইন মেপ সক্ৰিয় (কেশ্বড টাইলছ)'
    },
    modals: {
      roadDetails: {
        title: 'পথ অৱৰোধ আৰু সংকটৰ তথ্য',
        currentStatus: 'বৰ্তমানৰ পথ অৱস্থা',
        keyFactors: 'এআই বিপদ বিশ্লেষণ',
        markBlocked: 'পথ বন্ধ ঘোষণা কৰক',
        markAccessible: 'পথ মুকলি ঘোষণা কৰক',
        findAlternate: 'বিকল্প সুৰক্ষিত পথ বিচাৰক',
        createAlert: 'সতৰ্কবাৰ্তা জাৰি কৰক',
        historicalSlides: 'পূৰ্বৰ ভূমিস্খলন',
        elevation: 'উচ্চতা আৰু ঢাল'
      },
      routeComparison: {
        title: 'বিকল্প পথৰ তুলনামূলক বিশ্লেষণ',
        primaryBlocked: 'মুখ্য পথ বন্ধ হৈ আছে',
        recommendedDetour: 'প্ৰস্তাবিত সুৰক্ষিত পথ',
        duration: 'আনুমানিক সময়',
        distance: 'মুঠ দূৰত্ব',
        riskIndex: 'ভূমিস্খলন বিপদ সূচক',
        selectRouteBtn: 'এই পথ নিৰ্বাচন কৰক আৰু বাহন পঠাওক'
      },
      dynamicReroute: {
        title: 'গুৰুতৰ বিকল্প পথৰ জাননী',
        hazardDetected: 'আপোনাৰ পথ NH-13 ত ভূমিস্खলন হৈছে।',
        bypassCalculated: 'এআইৰ সহায়ত শ্বেৰগাঁও বাইপাছেৰে সুৰক্ষিত বিকল্প সাজু কৰা হৈছে।',
        acceptBtn: 'নতুন পথ গ্ৰহণ কৰক',
        compareBtn: 'সকলো বিকল্প চাওক',
        dismissBtn: 'বাতিল'
      },
      incidentReport: {
        title: 'পথৰ দুৰ্ঘটনা বা বিপদৰ তথ্য জনাওক',
        selectRoad: 'ঘাইপথ নিৰ্বাচন কৰক',
        hazardType: 'বিপদৰ শ্ৰেণী',
        severity: 'সংকটৰ মাত্ৰা',
        description: 'ঘটনাৰ বিৱৰণ',
        voiceNote: 'মাত মাতি ৰেকৰ্ড কৰক',
        submitBtn: 'দাখিল কৰক আৰু এআই পৰীক্ষা'
      },
      whatIf: {
        title: 'পৰিস্থিতি অনুকৰণ চিমুলেচন',
        rainIntensity: 'বৰষুণৰ মাত্ৰা',
        cloudburst: 'বানপানী অনুকৰণ',
        runSimBtn: 'চিমুলেচন চলাওক',
        impactSummary: 'সম্ভাব্য পথ বন্ধৰ তালিকা'
      },
      search: {
        placeholder: 'পথ, বাহন, চালক, ঘটনা বা সতৰ্কবাৰ্তা সন্ধান কৰক...',
        title: 'সংহত সন্ধান প্ৰণালী',
        all: 'সকলো',
        roads: 'পথসমূহ',
        vehicles: 'বাহনসমূহ',
        incidents: 'ঘটনাসমূহ'
      },
      aiAssistant: {
        title: 'এআই পৰিবহণ সহায়ক',
        subtitle: 'পথৰ সুগমতা, বতৰ আৰু বিকল্প পথৰ বাবে তাৎক্ষণিক সহায়ক',
        placeholder: 'পথৰ অৱস্থা, বতৰ বা বিকল্প পথৰ বিষয়ে সোধক...',
        sendBtn: 'সুধক',
        suggestions: 'প্ৰস্তাবিত প্ৰশ্নসমূহ'
      },
      newsModal: {
        title: 'লাইভ উত্তৰ-পূৰ্বাঞ্চল দুৰ্যোগ আৰু ঘাইপথ ৰাডাৰ',
        subtitle: 'উত্তৰ-পূব ভাৰতৰ সক্ৰিয় পথ অৱৰোধ, ডাৱৰ বিস্ফোৰণ আৰু চৰকাৰী সতৰ্কবাৰ্তাৰ সংকলন।',
        scanBtn: 'লাইভ বুলেটিন চাওক',
        showOnMap: 'মানচিত্ৰত পথৰ স্থান চাওক',
        impact: 'পৰিবহণ পথত প্ৰভাৱ',
        confidence: 'বিশ্বাসযোগ্যতা নম্বৰ',
        syncEmergency: 'জৰুৰীকালীন ব্যৱস্থা সক্ৰিয়',
        indiaOnly: 'কেৱল ভাৰত দুৰ্যোগ বুলেটিন'
      }
    },
    demoMode: {
      sihFlow: 'এছআইএইচ লাইভ ডেমো পৰিক্ৰমা',
      step: 'পদক্ষেপ',
      simulateRain: '১. প্ৰচণ্ড বৰষুণ আৰম্ভ',
      predictLandslide: '২. এআই ভূমিস্খলনৰ পূৰ্বাভাস',
      blockRoad: '৩. এনএইচ-১৩ পথত ভূমিস্খলন',
      reportIncident: '৪. ফিল্ড অফিচাৰৰ প্ৰতিবেদন',
      recalculateRoute: '৫. এআই বিকল্প সুৰক্ষিত পথ নিৰ্ণয়',
      rerouteVehicle: '৬. চালকে নতুন পথ বাচি ল’লে',
      activateEmergency: '৭. জৰুৰীকালীন কমাণ্ড সক্ৰিয়',
      resetDemo: 'অৱস্থা পুনঃনিৰ্ধাৰণ কৰক'
    }
  }
};

// Helper for local highway naming
export function getLocalizedHighwayName(code: string, lang: Language): string {
  switch (code) {
    case 'NH-13':
      return lang === 'hi'
        ? 'भालुकपॉन्ग से तवांग मार्ग (NH-13)'
        : lang === 'as'
        ? 'ভালুকপং-তাৱাং সংযোগী পথ (NH-13)'
        : 'Bhalukpong to Tawang (NH-13)';
    case 'NH-27':
      return lang === 'hi'
        ? 'गुवाहाटी से शिलॉन्ग मार्ग (NH-27)'
        : lang === 'as'
        ? 'গুৱাহাটী-শ্বিলং ঘাইপথ (NH-27)'
        : 'Guwahati to Shillong (NH-27)';
    case 'NH-15':
      return lang === 'hi'
        ? 'तेजपुर से पासीघाट मार्ग (NH-15)'
        : lang === 'as'
        ? 'তেজপুৰ-পাছিঘাট ঘাইপথ (NH-15)'
        : 'Tezpur to Pasighat (NH-15)';
    case 'NH-29':
      return lang === 'hi'
        ? 'दीमापुर से कोहिमा मार्ग (NH-29)'
        : lang === 'as'
        ? 'ডিমাপুৰ-কহিমা ঘাইপথ (NH-29)'
        : 'Dimapur to Kohima (NH-29)';
    case 'NH-10':
      return lang === 'hi'
        ? 'सिलीगुड़ी से गंगटोक मार्ग (NH-10)'
        : lang === 'as'
        ? 'শিলিগুৰি-গেংটক পথ (NH-10)'
        : 'Siliguri to Gangtok (NH-10)';
    case 'NH-306':
      return lang === 'hi'
        ? 'सिलचर से आइजोल मार्ग (NH-306)'
        : lang === 'as'
        ? 'শিলচৰ-আইজল ঘাইপথ (NH-306)'
        : 'Silchar to Aizawl (NH-306)';
    case 'NH-208':
      return lang === 'hi'
        ? 'कुमारघाट से अगरतला मार्ग (NH-208)'
        : lang === 'as'
        ? 'কুমাৰঘাট-আগৰতলা ঘাইপথ (NH-208)'
        : 'Kumarghat to Agartala (NH-208)';
    default:
      return code;
  }
}

// Localized Road Status (small information)
export function getLocalizedRoadStatus(status: string, lang: Language): string {
  const s = (status || '').toUpperCase();
  if (s === 'BLOCKED') {
    return lang === 'hi' ? 'अवरुद्ध (Blocked)' : lang === 'as' ? 'অৱৰুদ্ধ (বন্ধ)' : 'Blocked';
  }
  if (s === 'HIGH_RISK') {
    return lang === 'hi' ? 'उच्च जोखिम (High Risk)' : lang === 'as' ? 'উচ্চ বিপদাশংকা' : 'High Risk';
  }
  if (s === 'MODERATE') {
    return lang === 'hi' ? 'मध्यम जोखिम (Moderate)' : lang === 'as' ? 'মধ্যম বিপদাশংকা' : 'Moderate';
  }
  if (s === 'ACCESSIBLE') {
    return lang === 'hi' ? 'सुगम (Accessible)' : lang === 'as' ? 'মুকলি (সচল)' : 'Accessible';
  }
  return status;
}

// Localized Incident Type
export function getLocalizedIncidentType(type: string, lang: Language): string {
  const t = (type || '').toUpperCase();
  if (t === 'LANDSLIDE') {
    return lang === 'hi' ? 'भूस्खलन (Landslide)' : lang === 'as' ? 'ভূমিস্খলন' : 'Landslide';
  }
  if (t === 'MUDSLIDE') {
    return lang === 'hi' ? 'मलबे का बहाव (Mudslide)' : lang === 'as' ? 'বোকাস্খলন' : 'Mudslide';
  }
  if (t === 'FLOOD') {
    return lang === 'hi' ? 'बाढ़ (Flood)' : lang === 'as' ? 'বানপানী' : 'Flood';
  }
  if (t === 'ROAD_DAMAGE') {
    return lang === 'hi' ? 'सड़क क्षति (Road Damage)' : lang === 'as' ? 'পথৰ ক্ষতি' : 'Road Damage';
  }
  if (t === 'BRIDGE_COLLAPSE') {
    return lang === 'hi' ? 'पुल क्षति (Bridge Damage)' : lang === 'as' ? 'দলং ক্ষতি' : 'Bridge Collapse';
  }
  if (t === 'CLOUDBURST') {
    return lang === 'hi' ? 'बादल फटना (Cloudburst)' : lang === 'as' ? 'ডাৱৰ বিস্ফোৰণ' : 'Cloudburst';
  }
  if (t === 'ROCKFALL') {
    return lang === 'hi' ? 'चट्टान गिरना (Rockfall)' : lang === 'as' ? 'শিল খহি পৰা' : 'Rockfall';
  }
  return type;
}

// Localized Incident / Alert Severity
export function getLocalizedSeverity(sev: string, lang: Language): string {
  const s = (sev || '').toUpperCase();
  if (s === 'CRITICAL') {
    return lang === 'hi' ? 'अति-गंभीर (Critical)' : lang === 'as' ? 'চৰম বিপদ' : 'Critical';
  }
  if (s === 'HIGH') {
    return lang === 'hi' ? 'उच्च (High)' : lang === 'as' ? 'উচ্চ' : 'High';
  }
  if (s === 'MEDIUM') {
    return lang === 'hi' ? 'मध्यम (Medium)' : lang === 'as' ? 'মধ্যম' : 'Medium';
  }
  if (s === 'LOW') {
    return lang === 'hi' ? 'कम (Low)' : lang === 'as' ? 'নিম্ন' : 'Low';
  }
  return sev;
}

// Localized Delivery & Vehicle Status
export function getLocalizedDeliveryStatus(status: string, lang: Language): string {
  const s = (status || '').toUpperCase();
  if (s === 'IN_TRANSIT') {
    return lang === 'hi' ? 'पारगमन में (In Transit)' : lang === 'as' ? 'পৰিবহনত' : 'In Transit';
  }
  if (s === 'REROUTED') {
    return lang === 'hi' ? 'पुनः निर्देशित (Rerouted)' : lang === 'as' ? 'নতুন পথত (Rerouted)' : 'Rerouted';
  }
  if (s === 'DELAYED') {
    return lang === 'hi' ? 'विलंबित (Delayed)' : lang === 'as' ? 'পলম (Delayed)' : 'Delayed';
  }
  if (s === 'DELIVERED') {
    return lang === 'hi' ? 'वितरित (Delivered)' : lang === 'as' ? 'যোগান সম্পন্ন' : 'Delivered';
  }
  if (s === 'SCHEDULED') {
    return lang === 'hi' ? 'निर्धारित' : lang === 'as' ? 'নিৰ্ধাৰিত' : 'Scheduled';
  }
  return status;
}

// Localized Cargo Information
export function getLocalizedCargo(cargo: string, lang: Language): string {
  if (!cargo || lang === 'en') return cargo;
  if (cargo.includes('Anti-Venom') || cargo.includes('Trauma Kits')) {
    return lang === 'hi'
      ? 'आपातकालीन एंटी-वेनम और ट्रॉमा किट'
      : 'জৰুৰীকালীন এণ্টি-ভেনম আৰু ট্ৰমা কিট';
  }
  if (cargo.includes('Insulin') || cargo.includes('Vaccines')) {
    return lang === 'hi'
      ? 'कोल्ड-चेन इंसुलिन और नवजात शिशु के टीके'
      : 'শীতল-শৃংখল ইনচুলিন আৰু নৱজাতকৰ ভেকচিন';
  }
  if (cargo.includes('Oxygen')) {
    return lang === 'hi'
      ? 'क्रायोजेनिक तरल चिकित्सा ऑक्सीजन टैंक'
      : 'ক্ৰায়’জেনিক তৰল চিকিৎসা অক্সিজেন টেংক';
  }
  if (cargo.includes('Grain') || cargo.includes('Water Purification')) {
    return lang === 'hi'
      ? 'आपदा राहत खाद्यान्न और जल शोधन किट'
      : 'দুৰ্যোগ সাহায্য খাদ্য আৰু পানী বিশুদ্ধকৰণ কিট';
  }
  if (cargo.includes('Blood') || cargo.includes('Surgical')) {
    return lang === 'hi'
      ? 'रक्त इकाइयाँ और सर्जिकल ट्रॉमा पैक'
      : 'তেজৰ ইউনিট আৰু শল্য চিকিৎসা ট্ৰমা পেক';
  }
  if (cargo.includes('Excavator') || cargo.includes('Bailey Bridge')) {
    return lang === 'hi'
      ? 'भारी उत्खननकर्ता व बेली ब्रिज पैनल'
      : 'গধুৰ মেচিন আৰু বেইলি দলং পেনেল';
  }
  return cargo;
}

// Localized Weather Conditions
export function getLocalizedWeather(weather: string, lang: Language): string {
  if (!weather || lang === 'en') return weather;
  if (weather.includes('Heavy Monsoon Cloudburst')) {
    return lang === 'hi' ? 'भारी मानसूनी बादल फटना' : 'প্ৰচণ্ড ডাৱৰ বিস্ফোৰণ';
  }
  if (weather.includes('Torrential Rain') || weather.includes('Heavy Rain')) {
    return lang === 'hi' ? 'मूसलाधार मानसूनी बारिश' : 'ধাৰাসাৰ বৰষুণ';
  }
  if (weather.includes('Flash Flood')) {
    return lang === 'hi' ? 'अचानक बाढ़ व घना कोहरा' : 'হঠাত্ বান আৰু ডাঠ কুঁৱলী';
  }
  if (weather.includes('Mist') || weather.includes('Fog')) {
    return lang === 'hi' ? 'पर्वतीय ठंडा कोहरा' : 'পাহাৰীয়া ডাঠ কুঁৱলী';
  }
  if (weather.includes('Mudflow') || weather.includes('Debris')) {
    return lang === 'hi' ? 'सक्रिय मलबे का बहाव' : 'সক্ৰিয় বোকাস্খলন';
  }
  if (weather.includes('Clear')) {
    return lang === 'hi' ? 'साफ मौसम' : 'ফৰকাল বতৰ';
  }
  return weather;
}

// Localized City / Location Names
export function getLocalizedLocation(loc: string, lang: Language): string {
  if (!loc || lang === 'en') return loc;
  const map: Record<string, { hi: string; as: string }> = {
    'Guwahati': { hi: 'गुवाहाटी', as: 'গুৱাহাটী' },
    'Tawang': { hi: 'तवांग', as: 'তাৱাং' },
    'Bhalukpong': { hi: 'भालुकपॉन्ग', as: 'ভালুকপং' },
    'Tezpur': { hi: 'तेजपुर', as: 'তেজপুৰ' },
    'Pasighat': { hi: 'पासीघाट', as: 'পাছিঘাট' },
    'Shillong': { hi: 'शिलॉन्ग', as: 'শ্বিলং' },
    'Dimapur': { hi: 'दीमापुर', as: 'ডিমাপুৰ' },
    'Kohima': { hi: 'कोहिमा', as: 'কহিমা' },
    'Siliguri': { hi: 'सिलीगुड़ी', as: 'শিলিগুৰি' },
    'Gangtok': { hi: 'गंगटोक', as: 'গেংটক' },
    'Silchar': { hi: 'सिलचर', as: 'শিলচৰ' },
    'Aizawl': { hi: 'आइजोल', as: 'আইজল' },
    'Kumarghat': { hi: 'कुमारघाट', as: 'কুমাৰঘাট' },
    'Agartala': { hi: 'अगरतला', as: 'আগৰতলা' },
    'Shergaon': { hi: 'शेरगांव', as: 'শ্বেৰগাঁও' },
    'Shergaon Bypass': { hi: 'शेरगांव बाईपास', as: 'শ্বেৰগাঁও বাইপাছ' },
    'West Kameng': { hi: 'पश्चिम कामेंग', as: 'পশ্চিম কামেং' },
    'Papum Pare': { hi: 'पापुम पारे', as: 'পাপুম পাৰে' }
  };
  return map[loc] ? map[loc][lang] || loc : loc;
}

// Localized User Role
export function getLocalizedRole(role: string, lang: Language): string {
  if (role === 'authority') {
    return lang === 'hi' ? 'ज़िला प्रशासन / नियंत्रण कक्ष' : lang === 'as' ? 'জিলা প্ৰশাসন / কমাণ্ড' : 'District Administration';
  }
  if (role === 'field_officer') {
    return lang === 'hi' ? 'फील्ड निरीक्षण अधिकारी' : lang === 'as' ? 'ফিল্ড পৰিদৰ্শন বিষয়া' : 'Field Inspection Officer';
  }
  if (role === 'driver') {
    return lang === 'hi' ? 'लॉजिस्टिक्स चालक / ऑपरेटर' : lang === 'as' ? 'লজিষ্টিক চালক / অপাৰেটৰ' : 'Logistics Driver / Operator';
  }
  return role;
}

// Helper to format origin to destination
export function getLocalizedRouteName(origin: string, destination: string, lang: Language): string {
  const o = getLocalizedLocation(origin, lang);
  const d = getLocalizedLocation(destination, lang);
  if (lang === 'hi') return `${o} से ${d}`;
  if (lang === 'as') return `${o}ৰ পৰা ${d}`;
  return `${origin} to ${destination}`;
}

// React Context for Seamless App-Wide Language Synchronization
interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLang: (l: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  t: TRANSLATIONS.hi,
  setLang: () => {}
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLang?: Language;
}> = ({ children, initialLang = 'hi' }) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tnx_lang') as Language;
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'as')) {
        return saved;
      }
    }
    return initialLang;
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tnx_lang', newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = {
    lang,
    t: TRANSLATIONS[lang] || TRANSLATIONS.en,
    setLang
  };

  return React.createElement(LanguageContext.Provider, { value }, children);
};

export function useTranslation() {
  return useContext(LanguageContext);
}
