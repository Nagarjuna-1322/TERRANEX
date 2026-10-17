# Security and deployment

## Authentication and roles

Firebase Authentication is the only credential authority. Enable Email/Password and/or Google sign-in in your Firebase project. Legacy demo login, registration, and OTP API routes return HTTP 410. Failed requests never create sessions or simulate successful writes.

The server verifies Firebase ID tokens including revocation with Firebase Admin. Configure Application Default Credentials through workload identity, or GOOGLE_APPLICATION_CREDENTIALS pointing to a service-account JSON file outside this repository. The project must match the browser Firebase project. Never put service-account keys or the Gemini key in VITE_ variables or commit them.

Provision custom claims from a trusted Admin SDK environment: role must be authority, field_officer, driver, or analyst. admin: true also grants authority access. Drivers need a vehicleId claim to update their assigned vehicle. Newly registered accounts have no operational permissions until provisioned. Clients cannot select their privilege level, and email addresses never confer admin access. Refresh the ID token or sign in again after role changes.

Example in a trusted Node environment with Application Default Credentials:

~~~js
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
initializeApp();
await getAuth().setCustomUserClaims('FIREBASE_UID', { role: 'authority' });
// Driver example: { role: 'driver', vehicleId: 'veh-tnx1042' }
~~~

All operational reads require an assigned role. Authority users can issue commands; field officers can submit incidents and sync incident reports; drivers can update only their assigned vehicle. Only authorities can read audit logs. Demo mutations require both authority access and ENABLE_DEMO=true (disabled by default).

## Firestore

Set VITE_FIREBASE_* values from .env.example for your project. Set the database in firebase.json to the same VITE_FIREBASE_DATABASE_ID (use (default) for the default database), then deploy with firebase deploy --only firestore:rules --project YOUR_PROJECT_ID. The checked-in Firebase configuration contains placeholders. Committing rules does not deploy them.

Public operational writes and reads are denied. Operational reads require trusted claims; only authorities can upload operational snapshots. Browser audit writes and admin-registry writes are denied. Profile owners cannot change authorization fields. Admin custom claims must be provisioned through a trusted environment, not user profile documents. Review existing admin accounts and stored data before deployment, since earlier rules allowed public writes.

## Production checks

Use Node 24, npm ci, npm run lint, npm test, npm run build, and npm start. The production entry point serves only dist/client, never the server bundle or source maps. Vercel uses the same client output directory. API errors are JSON, and API responses are not cached. Requests and AI inputs are bounded and rate limited; AI responses are validated before being used as structured operational data.

npm audit is enforced in CI alongside type checking, regression tests, and the production build. Re-run audit regularly; a clean report reflects known advisories at check time.

## Remaining prototype limits

Operational API data is seeded example data held in memory, not a durable live logistics database. It resets on process restart and diverges between serverless instances. Cloud snapshots are separate from that store. Do not use this prototype for real dispatch or emergency decisions until shared transactional persistence, trusted telemetry, and persistent audit trails are implemented. AI and deterministic recommendations are illustrative, not verified road safety advice.

Rate limits use per-process memory and the direct peer IP; a multi-instance deployment needs a shared limiter store and an explicitly trusted proxy configuration. Browser offline reports are account-scoped but remain local browser data, and offline sync currently supports incident reports only. Live Firebase login, deployed rules, cloud IAM, and live Gemini responses require deployment credentials and must be verified in the target environment. The browser bundle still has a size warning.

## Reporting a vulnerability

Report privately through this repository's GitHub Security Advisories page when private reporting is enabled. Otherwise contact the repository owner privately; do not include credentials, personal data, or exploit details in public issues. Only the latest main branch is maintained.
