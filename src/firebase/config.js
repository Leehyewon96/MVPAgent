import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

export let isConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

let app = null;
let auth = null;
let db = null;
let rtdb = null;
let functions = null;

if (isConfigured) {
  try {
    const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL;

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      ...(databaseURL?.startsWith('https://') ? { databaseURL } : {}),
    };

    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);

    if (databaseURL?.startsWith('https://')) {
      rtdb = getDatabase(app);
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    isConfigured = false;
  }
}

export { auth, db, rtdb, functions };
export default app;
