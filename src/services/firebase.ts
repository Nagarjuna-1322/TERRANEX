import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, UserRole } from '../types';

// Ensure apiKey is always present in Firebase configuration
const resolvedApiKey =
  import.meta.env?.VITE_FIREBASE_API_KEY ||
  (firebaseConfig as { apiKey?: string }).apiKey ||
  '';
const effectiveFirebaseConfig = {
  ...firebaseConfig,
  apiKey: resolvedApiKey,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(effectiveFirebaseConfig) : getApp();

// CRITICAL: Must specify firestoreDatabaseId and use experimentalForceLongPolling
// to prevent 10s WebChannel timeout in proxy and sandboxed environments
const dbId = import.meta.env?.VITE_FIREBASE_DATABASE_ID || (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || '(default)';

let firestoreInstance: ReturnType<typeof getFirestore>;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalForceLongPolling: true
  }, dbId);
} catch {
  firestoreInstance = getFirestore(app, dbId);
}
export const db = firestoreInstance;

// Initialize Firebase Auth defensively
let authInstance: ReturnType<typeof getAuth> | null = null;
try {
  authInstance = getAuth(app);
} catch (authInitErr) {
  console.warn('Firebase Auth initialization warning:', authInitErr);
}
export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  console.error('Firestore operation failed', { operationType, path });
  throw new Error('Unable to access cloud data. Check your connection and permissions.');
}

/**
 * Validates connection to Firestore at app initialization
 */
export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { connected: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return { connected: false, error: 'The client is offline' };
    }
    return { connected: false, error: 'Unable to connect to Firestore' };
  }
}

// Initial connection test
testConnection().catch(() => {});

/**
 * Map Firebase user to TerraNex App User
 */
export async function mapFirebaseUserToAppUser(fbUser: FirebaseUser, _requestedRole?: UserRole): Promise<User> {
  const { claims } = await fbUser.getIdTokenResult();
  if (claims.admin !== true && !['authority', 'field_officer', 'driver', 'analyst'].includes(String(claims.role))) {
    throw new Error('Account created. Ask your administrator to assign an operational role, then sign in again.');
  }
  const role: UserRole = claims.admin === true ? 'authority' :
    ['authority', 'field_officer', 'driver', 'analyst'].includes(String(claims.role)) ? claims.role as UserRole : 'driver';
  return {
    id: fbUser.uid, name: fbUser.displayName || 'TerraNex User', employeeId: '',
    email: fbUser.email || '', phone: fbUser.phoneNumber || '', role,
    organization: '', state: '', district: '', avatar: fbUser.photoURL || undefined
  };
}

export async function signInWithGoogle(_desiredRole?: UserRole): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    if (!auth) throw new Error('Authentication is unavailable. Please try again later.');
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: await mapFirebaseUserToAppUser(result.user) };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; token: string; user: User; error?: string }> {
  if (!auth) throw new Error('Authentication is unavailable.');
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return { success: true, token: await result.user.getIdToken(), user: await mapFirebaseUserToAppUser(result.user) };
}

export async function registerWithEmail(data: { email: string; password: string; name?: string }): Promise<{ success: boolean; token: string; user: User; error?: string }> {
  if (!auth) throw new Error('Authentication is unavailable.');
  const result = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
  if (data.name) await updateProfile(result.user, { displayName: data.name.slice(0, 200) });
  // Operational roles are assigned by administrators using custom claims.
  return { success: true, token: await result.user.getIdToken(), user: await mapFirebaseUserToAppUser(result.user) };
}

/**
 * Sign out user
 */
export async function signOutFirebase(): Promise<void> {
  if (auth) {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out error:', err);
    }
  }
}

// Re-export sendPasswordResetEmail for direct consumption
export { sendPasswordResetEmail };

/**
 * Sends a password reset email to the specified user address via Firebase Authentication.
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message: string; error?: string }> {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      success: false,
      message: 'Please enter a valid email address.',
      error: 'Email is required'
    };
  }

  if (!auth) {
    return {
      success: false,
      message: 'Authentication is unavailable. Please try again later.'
    };
  }

  try {
    await sendPasswordResetEmail(auth, trimmed);
    return {
      success: true,
      message: `Password reset link dispatched to ${trimmed}. Please check your inbox and follow instructions.`
    };
  } catch (error: any) {
    const code = error?.code || '';
    let message = 'Failed to send password reset email. Please try again.';

    if (code === 'auth/user-not-found') {
      return { success: true, message: 'If an account exists, password reset instructions have been sent.' };
    } else if (code === 'auth/invalid-email') {
      message = 'Please provide a valid email address.';
    } else if (code === 'auth/missing-email') {
      message = 'Email address cannot be empty.';
    } else if (code === 'auth/too-many-requests') {
      message = 'Too many requests. Please wait a moment before trying again.';
    } else if (code === 'auth/network-request-failed') {
      message = 'Network error. Please verify your connection and retry.';
    } else if (error?.message) {
      message = error.message;
    }

    return {
      success: false,
      message,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Get detailed verification info for current user
 */
export async function getVerifiedAuthStatus(): Promise<{
  isAuthenticated: boolean;
  uid?: string;
  email?: string;
  displayName?: string;
  emailVerified?: boolean;
  providerId?: string;
  creationTime?: string;
  lastSignInTime?: string;
  isAdmin?: boolean;
  tokenResult?: any;
}> {
  const current = auth?.currentUser;
  if (!current) {
    return { isAuthenticated: false };
  }

  const claims = (await current.getIdTokenResult()).claims;
  const isAdmin = claims.admin === true || claims.role === 'authority';

  let tokenResult = null;
  try {
    tokenResult = await current.getIdTokenResult();
  } catch (err) {
    console.warn('Could not get token result:', err);
  }

  return {
    isAuthenticated: true,
    uid: current.uid,
    email: current.email || undefined,
    displayName: current.displayName || undefined,
    emailVerified: current.emailVerified,
    providerId: current.providerData?.[0]?.providerId || 'firebase',
    creationTime: current.metadata.creationTime,
    lastSignInTime: current.metadata.lastSignInTime,
    isAdmin,
    tokenResult: tokenResult
      ? {
          issuedAtTime: tokenResult.issuedAtTime,
          expirationTime: tokenResult.expirationTime,
          authTime: tokenResult.authTime,
          signInProvider: tokenResult.signInProvider
        }
      : null
  };
}
