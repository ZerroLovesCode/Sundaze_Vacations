/**
 * @file firebase.ts
 *
 * Firebase application initialisation for Voyager AI.
 *
 * This module exports a single `db` (Firestore) instance that is shared across
 * all server-side API routes via the `@/lib/firebase` alias.
 *
 * Key decisions:
 *
 *  1. `firebase/firestore/lite` (not `firebase/firestore`)
 *     The lite variant uses plain HTTP REST for each operation. The full SDK
 *     uses gRPC WebSocket streams designed for browser real-time listeners;
 *     in a Node.js server environment those streams cause persistent connection
 *     errors and extremely slow response times. The lite SDK is the correct
 *     choice for any serverless or server-side workload.
 *
 *  2. Hot-reload guard (`getApps().length` check)
 *     Next.js hot module replacement re-evaluates module files on each save.
 *     Without this guard, each HMR cycle would call `initializeApp()` again,
 *     producing "Firebase: Firebase App named '[DEFAULT]' already exists" errors.
 *     The guard checks whether an app is already registered and reuses it.
 *
 *  3. Environment variables
 *     All config values are `NEXT_PUBLIC_` prefixed so they are available in
 *     both the server (API routes) and browser (if needed in future).
 *     The Firebase Web API key is NOT a secret — it is a client-side project
 *     identifier. Firestore Security Rules on the Firebase Console control
 *     actual data access.
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore/lite";

// Compose the config object from environment variables set in .env.local
// (and via Cloud Run's --set-env-vars for production).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ---------------------------------------------------------------------------
// Singleton initialisation — safe for both cold starts and HMR reloads.
// ---------------------------------------------------------------------------
let app: FirebaseApp;
if (!getApps().length) {
  // First load: create the Firebase app.
  app = initializeApp(firebaseConfig);
} else {
  // Subsequent loads (HMR / module cache): reuse the existing app.
  app = getApps()[0];
}

/** Firestore Lite database instance — imported by API route handlers. */
export const db: Firestore = getFirestore(app);

export default app;
