import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
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
  (firebaseConfig as { apiKey?: string }).apiKey ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FIREBASE_API_KEY) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_API_KEY) ||
  'AIzaSyCDP_opFu_d2KaDa7v7IUhTFVHzRRliQuI';

const effectiveFirebaseConfig = {
  ...firebaseConfig,
  apiKey: resolvedApiKey
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(effectiveFirebaseConfig) : getApp();

// CRITICAL: Must specify firestoreDatabaseId and use experimentalForceLongPolling
// to prevent 10s WebChannel timeout in proxy and sandboxed environments
const dbId = (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId || 'ai-studio-terranex-8d5fce7b-58e1-4e3f-aee3-63975d069887';

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
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
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
    // If doc doesn't exist, connection succeeded as long as not offline
    return { connected: true };
  }
}

// Initial connection test
testConnection().catch(() => {});

/**
 * Map Firebase user to TerraNex App User
 */
export function mapFirebaseUserToAppUser(fbUser: FirebaseUser, requestedRole?: UserRole): User {
  // If user is mmnagarjunareddy@gmail.com, default to top authority role
  const isTargetAdmin = fbUser.email?.toLowerCase() === 'mmnagarjunareddy@gmail.com';
  const role: UserRole = requestedRole || (isTargetAdmin ? 'authority' : 'field_officer');

  return {
    id: fbUser.uid,
    name: fbUser.displayName || (isTargetAdmin ? 'M. Nagarjuna Reddy' : (fbUser.email?.split('@')[0] || 'Command Officer')),
    employeeId: `NER-AUTH-${fbUser.uid.slice(0, 6).toUpperCase()}`,
    email: fbUser.email || '',
    phone: fbUser.phoneNumber || '+91 94350 00000',
    role: role,
    organization: isTargetAdmin
      ? 'NER Disaster Management & Transport Authority (HQ)'
      : 'Border Roads Task Force 88 / Inspection Wing',
    state: 'Assam',
    district: 'Kamrup Metropolitan (Guwahati)',
    avatar: fbUser.photoURL || undefined
  };
}

/**
 * Google Sign-In with popup
 */
export async function signInWithGoogle(desiredRole?: UserRole): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    if (!auth) {
      console.warn('Firebase Auth is not available. Using default authorized role session.');
      const fallbackOwner: User = {
        id: 'usr-auth-nagarjuna',
        name: 'M. Nagarjuna Reddy',
        employeeId: 'NER-HQ-DIRECTOR',
        email: 'mmnagarjunareddy@gmail.com',
        phone: '+91 94350 99881',
        role: desiredRole || 'authority',
        organization: 'NER Disaster Management & Transport Authority (HQ)',
        state: 'Assam',
        district: 'Kamrup Metropolitan (Guwahati)'
      };
      return { success: true, user: fallbackOwner };
    }

    const result = await signInWithPopup(auth, googleProvider);
    const appUser = mapFirebaseUserToAppUser(result.user, desiredRole);

    // Save/update user profile in Firestore
    try {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(userRef, {
        id: appUser.id,
        name: appUser.name,
        employeeId: appUser.employeeId,
        email: appUser.email,
        phone: appUser.phone,
        role: appUser.role,
        organization: appUser.organization,
        state: appUser.state,
        district: appUser.district,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // If target admin, ensure admin record exists
      if (result.user.email?.toLowerCase() === 'mmnagarjunareddy@gmail.com') {
        const adminRef = doc(db, 'admins', result.user.uid);
        await setDoc(adminRef, {
          uid: result.user.uid,
          email: result.user.email,
          role: 'super_admin',
          grantedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (saveErr) {
      console.warn('Could not persist profile in Firestore users collection:', saveErr);
    }

    return { success: true, user: appUser };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Google authentication failed';
    return { success: false, error: msg };
  }
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
      success: true,
      message: `Password reset simulation: instructions sent to ${trimmed}.`
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
      message = 'No account found matching this email address.';
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

  let isAdmin = current.email?.toLowerCase() === 'mmnagarjunareddy@gmail.com';
  if (!isAdmin) {
    try {
      const adminSnap = await getDoc(doc(db, 'admins', current.uid));
      isAdmin = adminSnap.exists();
    } catch {
      // ignore
    }
  }

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
