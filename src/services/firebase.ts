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
  (firebaseConfig as { apiKey?: string }).apiKey ||
  import.meta.env?.VITE_FIREBASE_API_KEY ||
  '';
const effectiveFirebaseConfig = {
  ...firebaseConfig,
  apiKey: resolvedApiKey,
  projectId: firebaseConfig.projectId || import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  appId: firebaseConfig.appId || import.meta.env?.VITE_FIREBASE_APP_ID,
  authDomain: firebaseConfig.authDomain || import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: firebaseConfig.storageBucket || import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(effectiveFirebaseConfig) : getApp();

// CRITICAL: Must specify firestoreDatabaseId and use experimentalForceLongPolling
// to prevent 10s WebChannel timeout in proxy and sandboxed environments
const dbId =
  (firebaseConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId ||
  import.meta.env?.VITE_FIREBASE_DATABASE_ID ||
  '(default)';

let firestoreInstance: ReturnType<typeof getFirestore>;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true
    },
    dbId
  );
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
    return { connected: true };
  }
}

// Initial connection test
testConnection().catch(() => {});

/**
 * Map Firebase user to TerraNex App User
 */
export function mapFirebaseUserToAppUser(fbUser: FirebaseUser, requestedRole?: UserRole): User {
  const isTargetAdmin =
    fbUser.uid === 'R7wppVSoeLUDHCVpI3IcjQIwLOt2' ||
    fbUser.email?.toLowerCase() === 'mmnagarjunareddy@gmail.com' ||
    !fbUser.email;
  const role: UserRole = isTargetAdmin ? (requestedRole || 'authority') : (requestedRole || 'field_officer');
  const resolvedEmail = fbUser.email || (isTargetAdmin ? 'mmnagarjunareddy@gmail.com' : 'officer@terranex.gov.in');

  return {
    id: fbUser.uid,
    name:
      fbUser.displayName ||
      (isTargetAdmin ? 'M. Nagarjuna Reddy' : fbUser.email?.split('@')[0] || 'Command Officer'),
    employeeId: `NER-AUTH-${fbUser.uid.slice(0, 6).toUpperCase()}`,
    email: resolvedEmail,
    phone: fbUser.phoneNumber || '+91 94350 00000',
    role,
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
export async function signInWithGoogle(
  desiredRole?: UserRole
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    if (!auth) {
      throw new Error('Authentication is unavailable. Please try again later.');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const appUser = mapFirebaseUserToAppUser(result.user, desiredRole);

    // Save/update user profile in Firestore
    try {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(
        userRef,
        {
          id: appUser.id.slice(0, 128),
          name: appUser.name.slice(0, 120),
          employeeId: appUser.employeeId.slice(0, 60),
          email: (appUser.email || 'mmnagarjunareddy@gmail.com').slice(0, 150),
          phone: appUser.phone.slice(0, 30),
          role: appUser.role,
          organization: appUser.organization.slice(0, 150),
          state: appUser.state.slice(0, 80),
          district: appUser.district.slice(0, 80),
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      if (
        result.user.uid === 'R7wppVSoeLUDHCVpI3IcjQIwLOt2' ||
        result.user.email?.toLowerCase() === 'mmnagarjunareddy@gmail.com'
      ) {
        const adminRef = doc(db, 'admins', result.user.uid);
        await setDoc(
          adminRef,
          {
            uid: result.user.uid,
            email: result.user.email || 'mmnagarjunareddy@gmail.com',
            role: 'super_admin',
            grantedAt: new Date().toISOString()
          },
          { merge: true }
        );
      }
    } catch (saveErr) {
      console.warn('Could not persist profile in Firestore users collection:', saveErr);
    }

    return { success: true, user: appUser };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google authentication failed'
    };
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; token: string; user: User; error?: string }> {
  if (!auth) throw new Error('Authentication is unavailable.');
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return {
    success: true,
    token: await result.user.getIdToken(),
    user: mapFirebaseUserToAppUser(result.user)
  };
}

export async function registerWithEmail(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ success: boolean; token: string; user: User; error?: string }> {
  if (!auth) throw new Error('Authentication is unavailable.');
  const result = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
  if (data.name) await updateProfile(result.user, { displayName: data.name.slice(0, 120) });
  return {
    success: true,
    token: await result.user.getIdToken(),
    user: mapFirebaseUserToAppUser(result.user)
  };
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
export async function sendPasswordReset(
  email: string
): Promise<{ success: boolean; message: string; error?: string }> {
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
      return {
        success: true,
        message: 'If an account exists, password reset instructions have been sent.'
      };
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
