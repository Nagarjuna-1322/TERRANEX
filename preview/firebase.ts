// Used only by the separate review server. Never imported by the production build.
import { INITIAL_USER } from '../src/data/nerData';

const demoUser = { ...INITIAL_USER, id: 'review-demo', name: 'Review User', email: 'review@example.test' };
const listeners = new Set<(user: unknown) => void>();
export const auth = { currentUser: null };
export const db = null;
export const OperationType = { LIST: 'list', WRITE: 'write', GET: 'get' };
export const mapFirebaseUserToAppUser = () => demoUser;

export function onAuthStateChanged(_auth: unknown, callback: (user: unknown) => void) {
  listeners.add(callback);
  queueMicrotask(() => { if (listeners.has(callback)) callback(localStorage.getItem('tnx_review_signed_out') ? null : demoUser); });
  return () => { listeners.delete(callback); };
}
export async function signOutFirebase() {
  localStorage.setItem('tnx_review_signed_out', 'true');
  listeners.forEach(callback => callback(null));
}
async function signIn() {
  localStorage.removeItem('tnx_review_signed_out');
  listeners.forEach(callback => callback(demoUser));
  return { success: true, token: '', user: demoUser };
}
export const signInWithGoogle = signIn;
export const signInWithEmail = signIn;
export const registerWithEmail = signIn;
export async function sendPasswordReset() {
  return { success: false, message: 'Password reset is disabled in the review demo.' };
}
export function handleFirestoreError(error: unknown): never { throw error; }
