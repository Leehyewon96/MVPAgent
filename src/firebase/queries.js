import { isConfigured } from './config';

let firestoreModules = null;
let realtimeModules = null;

async function getFirestoreModules() {
  if (!isConfigured) return null;
  if (!firestoreModules) {
    const { db } = await import('./config');
    const fs = await import('firebase/firestore');
    firestoreModules = { db, ...fs };
  }
  return firestoreModules;
}

async function getRealtimeModules() {
  if (!isConfigured) return null;
  if (!realtimeModules) {
    const { rtdb } = await import('./config');
    const rt = await import('firebase/database');
    realtimeModules = { rtdb, ...rt };
  }
  return realtimeModules;
}

// ── Firestore helpers ──

export async function getDocument(collectionName, docId) {
  const m = await getFirestoreModules();
  if (!m) return null;
  const snap = await m.getDoc(m.doc(m.db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getCollection(collectionName, constraints = []) {
  const m = await getFirestoreModules();
  if (!m) return [];
  const q = m.query(m.collection(m.db, collectionName), ...constraints);
  const snap = await m.getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addDocument(collectionName, data) {
  const m = await getFirestoreModules();
  if (!m) return null;
  const docRef = await m.addDoc(m.collection(m.db, collectionName), {
    ...data,
    createdAt: m.serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument(collectionName, docId, data) {
  const m = await getFirestoreModules();
  if (!m) return;
  await m.updateDoc(m.doc(m.db, collectionName, docId), {
    ...data,
    updatedAt: m.serverTimestamp(),
  });
}

export async function deleteDocument(collectionName, docId) {
  const m = await getFirestoreModules();
  if (!m) return;
  await m.deleteDoc(m.doc(m.db, collectionName, docId));
}

// ── Realtime Database helpers ──

export function subscribeToRealtimeData(path, callback) {
  if (!isConfigured) return () => {};
  let unsubscribe = () => {};
  getRealtimeModules().then((m) => {
    if (!m) return;
    const dbRef = m.ref(m.rtdb, path);
    unsubscribe = m.onValue(dbRef, (snapshot) => callback(snapshot.val()));
  });
  return () => unsubscribe();
}

export async function writeRealtimeData(path, data) {
  const m = await getRealtimeModules();
  if (!m) return;
  await m.set(m.ref(m.rtdb, path), data);
}

export async function pushRealtimeData(path, data) {
  const m = await getRealtimeModules();
  if (!m) {
    console.info('[Dev Mode] pushRealtimeData skipped:', path);
    return `mock_${Date.now()}`;
  }
  const newRef = m.push(m.ref(m.rtdb, path));
  await m.set(newRef, { ...data, timestamp: Date.now() });
  return newRef.key;
}

// Re-export query constraint builders (safe — these are just function factories)
export const where = (...args) =>
  isConfigured ? import('firebase/firestore').then((m) => m.where(...args)) : null;
export const orderBy = (...args) =>
  isConfigured ? import('firebase/firestore').then((m) => m.orderBy(...args)) : null;
export const limit = (...args) =>
  isConfigured ? import('firebase/firestore').then((m) => m.limit(...args)) : null;
export const serverTimestamp = () =>
  isConfigured ? import('firebase/firestore').then((m) => m.serverTimestamp()) : null;
