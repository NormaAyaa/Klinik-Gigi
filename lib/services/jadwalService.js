import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "jadwal_dokter";

export function getNamaHari(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  return days[date.getDay()];
}

export async function getAllJadwalDokter() {
  const colRef = collection(db, COLLECTION_NAME);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getJadwalByDokter(dokterId) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where("dokterId", "==", dokterId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getJadwalByDokterAndHari(dokterId, hari) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(
    colRef,
    where("dokterId", "==", dokterId),
    where("hari", "==", hari.toLowerCase())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function createJadwalDokter({ dokterId, hari, jamMulai, jamSelesai }) {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    dokterId,
    hari: hari.toLowerCase(),
    jamMulai,
    jamSelesai,
  });
  return docRef.id;
}

export async function updateJadwalDokter(id, { hari, jamMulai, jamSelesai }) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    hari: hari.toLowerCase(),
    jamMulai,
    jamSelesai,
  });
}

export async function deleteJadwalDokter(id) {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
