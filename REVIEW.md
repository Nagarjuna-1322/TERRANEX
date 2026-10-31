# TERRANEX map and session review

Base GitHub commit: 457c20077ca242431524defc5b6fe694525ff704. This change fixes map loading and Firebase session restoration.

## Confirmed causes

The original map used the Firebase API key when a Maps key was absent. Browser testing of the original component returned Google Maps ApiTargetBlockedMapError. The key is blocked from calling Maps; this is separate from Firebase sign-in. A missing vehicle currentLocation also reproduced an uncaught null.lat exception and a blank React screen. The actual user's Firestore data was not read, so malformed live GPS records remain a possible additional cause rather than a confirmed live-data finding.

App initially rendered login while Firebase was still restoring its saved session. Its auth observer ignored signed-out states, and logout swallowed failures. Firebase already defaults to persistent sessions in supported browsers; the old code does not prove the user's saved account was actually erased.

## Fixes

- Initialize Firebase Auth with IndexedDB and localStorage persistence. Wait for its first auth event before showing login. Handle signed-out events, initialization errors and logout errors.
- Stop using a Firebase key as a Maps key. Optional VITE_GOOGLE_MAPS_API_KEY is documented in .env.example.
- Fall back to the already-installed Leaflet library and OpenStreetMap if the Maps key is absent, rejected, fails loading or takes over 15 seconds. Roads, GPS, region selection, convoy and incident markers remain interactive. Road, Satellite, Hybrid and Terrain styles and Facilities work in fallback mode. Traffic and Transit open Google Maps at the selected region; 3D opens Google Earth. These external buttons are labeled with an arrow. Embedded Google layers and Street View still require a valid Maps key.
- Validate GPS coordinates and normalize road coordinate tuples / Firestore objects. A map-specific error boundary keeps navigation and the session available on render failures.
- Handle profile audit-history network failures.

## Verification

Type check, production build and all 12 automated tests passed. Browser checks covered the original null-location crash, the fixed rendering, failed and stalled Google Maps loads, mobile layout without horizontal overflow, login, reload, tab reopen, full browser restart, explicit logout and logout across tabs. Session checks used the real Firebase browser SDK with isolated mocked identity responses; no real password or production account was used.

## Review preview

Open http://127.0.0.1:5174 on this computer. This is the updated full app with sample data and simulated sign-in, prominently labeled REVIEW DEMO. It cannot modify the live backend. To restart it, run:

    npx vite --config preview/vite.config.ts --host 127.0.0.1 --port 5174

The normal production entry still uses real Firebase authentication. The preview config refuses production builds. Run npm run dev to test the normal application; live API access also requires the existing server credentials and role configuration.

## Remaining validation

Your own Google account sign-in and deployed domain still need user verification. Google Maps features require a separately authorized Maps JavaScript API key with the correct referrer restrictions and billing / API configuration. OpenStreetMap tiles require connectivity. Browser storage clearing, private browsing, revoked credentials, or Firebase account changes can still require sign-in again. The production build retains an existing large-bundle warning. This work is not an exhaustive security audit of every screen or live backend.
