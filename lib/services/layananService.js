import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "layanan";

export async function getAllLayanan() {
  const colRef = collection(db, COLLECTION_NAME);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getActiveLayanan() {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where("aktif", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLayananById(id) {
  const docRef = doc(db, COLLECTION_NAME, id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createLayanan({ nama, durasiMenit, harga, aktif = true }) {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    nama: nama.trim(),
    durasiMenit: Number(durasiMenit),
    harga: Number(harga),
    aktif: Boolean(aktif),
  });
  return docRef.id;
}

export async function updateLayanan(id, { nama, durasiMenit, harga, aktif }) {
  const docRef = doc(db, COLLECTION_NAME, id);
  const data = {};
  if (nama !== undefined) data.nama = nama.trim();
  if (durasiMenit !== undefined) data.durasiMenit = Number(durasiMenit);
  if (harga !== undefined) data.harga = Number(harga);
  if (aktif !== undefined) data.aktif = Boolean(aktif);

  await updateDoc(docRef, data);
}

export async function toggleLayananStatus(id, currentStatus) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { aktif: !currentStatus });
}
