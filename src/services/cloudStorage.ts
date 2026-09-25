import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './firebase';
import {
  Road,
  Vehicle,
  Delivery,
  Incident,
  Alert,
  WeatherData,
  NewsArticle,
  AuditLog
} from '../types';
import {
  INITIAL_ROADS,
  INITIAL_VEHICLES,
  INITIAL_DELIVERIES,
  INITIAL_INCIDENTS,
  INITIAL_WEATHER,
  INITIAL_ALERTS,
  INITIAL_AUDIT_LOGS
} from '../data/nerData';
import { INITIAL_INDIA_NEWS_ARTICLES } from '../data/newsData';

export interface CloudStorageStats {
  roadsCount: number;
  vehiclesCount: number;
  deliveriesCount: number;
  incidentsCount: number;
  alertsCount: number;
  weatherCount: number;
  newsCount: number;
  totalRecords: number;
  lastSyncedAt: string | null;
  status: 'connected' | 'offline' | 'syncing' | 'error';
  databaseId: string;
  projectId: string;
}

/**
 * Transforms Road entity to Firestore compatible format (replaces nested coordinate arrays with object maps)
 */
export function cleanRoadForFirestore(road: Road): any {
  return {
    ...road,
    coordinates: (road.coordinates || []).map((c: any) => {
      if (Array.isArray(c)) {
        return { lat: c[0], lng: c[1] };
      }
      if (c && typeof c === 'object' && typeof c.lat === 'number') {
        return { lat: c.lat, lng: c.lng };
      }
      return { lat: 0, lng: 0 };
    })
  };
}

/**
 * Parses Road entity from Firestore back to App format with [lat, lng][] polyline coordinates
 */
export function parseRoadFromFirestore(data: any): Road {
  let coordinates: [number, number][] = [];
  if (Array.isArray(data.coordinates)) {
    coordinates = data.coordinates.map((c: any) => {
      if (Array.isArray(c)) {
        return [c[0], c[1]] as [number, number];
      }
      if (c && typeof c === 'object' && typeof c.lat === 'number' && typeof c.lng === 'number') {
        return [c.lat, c.lng] as [number, number];
      }
      return [0, 0] as [number, number];
    });
  }
  return {
    ...data,
    coordinates
  };
}

export const CloudStorageService = {
  /**
   * Upload all initial/current application datasets directly into Firebase Cloud Firestore
   */
  async uploadCompleteDataToCloud(customData?: {
    roads?: Road[];
    vehicles?: Vehicle[];
    deliveries?: Delivery[];
    incidents?: Incident[];
    alerts?: Alert[];
    weather?: WeatherData[];
    newsArticles?: NewsArticle[];
    auditLogs?: AuditLog[];
  }): Promise<{ success: boolean; totalUploaded: number; error?: string }> {
    try {
      const roads = customData?.roads || INITIAL_ROADS;
      const vehicles = customData?.vehicles || INITIAL_VEHICLES;
      const deliveries = customData?.deliveries || INITIAL_DELIVERIES;
      const incidents = customData?.incidents || INITIAL_INCIDENTS;
      const alerts = customData?.alerts || INITIAL_ALERTS;
      const weather = customData?.weather || INITIAL_WEATHER;
      const newsArticles = customData?.newsArticles || INITIAL_INDIA_NEWS_ARTICLES;
      const auditLogs = customData?.auditLogs || INITIAL_AUDIT_LOGS;

      let count = 0;

      // Roads (using cleanRoadForFirestore to avoid nested arrays error)
      for (const r of roads) {
        try {
          const payload = cleanRoadForFirestore(r);
          await setDoc(doc(db, 'roads', r.id), {
            ...payload,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `roads/${r.id}`);
        }
      }

      // Vehicles
      for (const v of vehicles) {
        try {
          await setDoc(doc(db, 'vehicles', v.id), {
            ...v,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `vehicles/${v.id}`);
        }
      }

      // Deliveries
      for (const d of deliveries) {
        try {
          await setDoc(doc(db, 'deliveries', d.id), {
            ...d,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `deliveries/${d.id}`);
        }
      }

      // Incidents
      for (const inc of incidents) {
        try {
          await setDoc(doc(db, 'incidents', inc.id), {
            ...inc,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `incidents/${inc.id}`);
        }
      }

      // Alerts
      for (const al of alerts) {
        try {
          await setDoc(doc(db, 'alerts', al.id), {
            ...al,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `alerts/${al.id}`);
        }
      }

      // Weather
      for (const w of weather) {
        try {
          const wId = `${w.state}_${w.region}`.replace(/[^a-zA-Z0-9_\-]/g, '_').toLowerCase();
          await setDoc(doc(db, 'weather', wId), {
            ...w,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `weather`);
        }
      }

      // News Articles
      for (const n of newsArticles) {
        try {
          await setDoc(doc(db, 'newsArticles', n.id), {
            ...n,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `newsArticles/${n.id}`);
        }
      }

      // Audit Logs
      for (const log of auditLogs) {
        try {
          await setDoc(doc(db, 'auditLogs', log.id), {
            ...log,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `auditLogs/${log.id}`);
        }
      }

      // Metadata record
      await setDoc(doc(db, 'cloudSyncMeta', 'status'), {
        id: 'status',
        lastSyncedAt: new Date().toISOString(),
        syncedBy: auth.currentUser?.email || 'admin@terranex.gov.in',
        recordsCount: count,
        status: 'VERIFIED_ACTIVE'
      }, { merge: true });

      return { success: true, totalUploaded: count };
    } catch (err) {
      console.error('Failed to upload complete data to cloud:', err);
      return {
        success: false,
        totalUploaded: 0,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  },

  /**
   * Fetch complete data from Firebase Firestore
   */
  async fetchCompleteDataFromCloud(): Promise<{
    roads: Road[];
    vehicles: Vehicle[];
    deliveries: Delivery[];
    incidents: Incident[];
    alerts: Alert[];
    weather: WeatherData[];
    newsArticles: NewsArticle[];
    meta?: any;
  }> {
    const results = {
      roads: [] as Road[],
      vehicles: [] as Vehicle[],
      deliveries: [] as Delivery[],
      incidents: [] as Incident[],
      alerts: [] as Alert[],
      weather: [] as WeatherData[],
      newsArticles: [] as NewsArticle[],
      meta: null as any
    };

    // Roads
    try {
      const snap = await getDocs(collection(db, 'roads'));
      results.roads = snap.docs.map((d) => parseRoadFromFirestore(d.data()));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'roads');
    }

    // Vehicles
    try {
      const snap = await getDocs(collection(db, 'vehicles'));
      results.vehicles = snap.docs.map((d) => d.data() as Vehicle);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'vehicles');
    }

    // Deliveries
    try {
      const snap = await getDocs(collection(db, 'deliveries'));
      results.deliveries = snap.docs.map((d) => d.data() as Delivery);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'deliveries');
    }

    // Incidents
    try {
      const snap = await getDocs(collection(db, 'incidents'));
      results.incidents = snap.docs.map((d) => d.data() as Incident);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'incidents');
    }

    // Alerts
    try {
      const snap = await getDocs(collection(db, 'alerts'));
      results.alerts = snap.docs.map((d) => d.data() as Alert);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'alerts');
    }

    // Weather
    try {
      const snap = await getDocs(collection(db, 'weather'));
      results.weather = snap.docs.map((d) => d.data() as WeatherData);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'weather');
    }

    // News
    try {
      const snap = await getDocs(collection(db, 'newsArticles'));
      results.newsArticles = snap.docs.map((d) => d.data() as NewsArticle);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'newsArticles');
    }

    return results;
  },

  /**
   * Save / update a single incident in Cloud Firestore
   */
  async saveIncident(incident: Incident): Promise<void> {
    try {
      await setDoc(doc(db, 'incidents', incident.id), {
        ...incident,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `incidents/${incident.id}`);
    }
  },

  /**
   * Update road status in Cloud Firestore
   */
  async updateRoadStatus(roadId: string, status: string, accessibility: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'roads', roadId), {
        status,
        accessibility,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `roads/${roadId}`);
    }
  },

  /**
   * Update vehicle reroute in Cloud Firestore
   */
  async rerouteVehicle(vehicleId: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      await updateDoc(doc(db, 'vehicles', vehicleId), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `vehicles/${vehicleId}`);
    }
  },

  /**
   * Add new emergency alert to Cloud Firestore
   */
  async addAlert(alert: Alert): Promise<void> {
    try {
      await setDoc(doc(db, 'alerts', alert.id), {
        ...alert,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `alerts/${alert.id}`);
    }
  },

  /**
   * Query cloud storage statistics to verify data presence in the cloud
   */
  async getCloudStorageStats(): Promise<CloudStorageStats> {
    const stats: CloudStorageStats = {
      roadsCount: 0,
      vehiclesCount: 0,
      deliveriesCount: 0,
      incidentsCount: 0,
      alertsCount: 0,
      weatherCount: 0,
      newsCount: 0,
      totalRecords: 0,
      lastSyncedAt: null,
      status: 'connected',
      databaseId: 'ai-studio-terranex-8d5fce7b-58e1-4e3f-aee3-63975d069887',
      projectId: 'sinuous-cathode-v8chg'
    };

    try {
      const [rSnap, vSnap, dSnap, iSnap, aSnap, wSnap, nSnap] = await Promise.all([
        getDocs(collection(db, 'roads')).catch(() => ({ size: 0, docs: [] })),
        getDocs(collection(db, 'vehicles')).catch(() => ({ size: 0, docs: [] })),
        getDocs(collection(db, 'deliveries')).catch(() => ({ size: 0, docs: [] })),
        getDocs(collection(db, 'incidents')).catch(() => ({ size: 0, docs: [] })),
        getDocs(collection(db, 'alerts')).catch(() => ({ size: 0, docs: [] })),
        getDocs(collection(db, 'weather')).catch(() => ({ size: 0, docs: [] })),
        getDocs(collection(db, 'newsArticles')).catch(() => ({ size: 0, docs: [] }))
      ]);

      stats.roadsCount = rSnap.size || 0;
      stats.vehiclesCount = vSnap.size || 0;
      stats.deliveriesCount = dSnap.size || 0;
      stats.incidentsCount = iSnap.size || 0;
      stats.alertsCount = aSnap.size || 0;
      stats.weatherCount = wSnap.size || 0;
      stats.newsCount = nSnap.size || 0;
      stats.totalRecords =
        stats.roadsCount +
        stats.vehiclesCount +
        stats.deliveriesCount +
        stats.incidentsCount +
        stats.alertsCount +
        stats.weatherCount +
        stats.newsCount;
      stats.lastSyncedAt = new Date().toISOString();
      stats.status = 'connected';
    } catch (err) {
      stats.status = 'error';
    }

    return stats;
  }
};
