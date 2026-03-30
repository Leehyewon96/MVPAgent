import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, set, onValue, push } from 'firebase/database';
import { db, rtdb } from './config';

// ── Firestore helpers ──

export async function getDocument(collectionName, docId) {
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getCollection(collectionName, constraints = []) {
  const q = query(collection(db, collectionName), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateDocument(collectionName, docId, data) {
  await updateDoc(doc(db, collectionName, docId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

// ── Realtime Database helpers ──

export function subscribeToRealtimeData(path, callback) {
  const dbRef = ref(rtdb, path);
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.val());
  });
}

export async function writeRealtimeData(path, data) {
  await set(ref(rtdb, path), data);
}

export async function pushRealtimeData(path, data) {
  const newRef = push(ref(rtdb, path));
  await set(newRef, { ...data, timestamp: Date.now() });
  return newRef.key;
}

export { where, orderBy, limit, serverTimestamp };
