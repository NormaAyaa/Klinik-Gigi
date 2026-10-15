import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "catatan_perawatan";

export async function createCatatanPerawatan({
  janjiId,
  pasienId,
  dokterId,
  tindakan,
  catatan,
}) {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    janjiId,
    pasienId,
    dokterId,
    tindakan: tindakan.trim(),
    catatan: catatan.trim(),
    dibuatPada: serverTimestamp(),
  });
  return docRef.id;
}

export async function getCatatanByJanji(janjiId) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where("janjiId", "==", janjiId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function getCatatanByPasien(pasienId) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(colRef, where("pasienId", "==", pasienId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCatatanByDokterAndPasien(dokterId, pasienId) {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(
    colRef,
    where("dokterId", "==", dokterId),
    where("pasienId", "==", pasienId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
