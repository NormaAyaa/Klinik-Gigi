import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLLECTION_NAME = "users";

export async function getAllUsers() {
  const colRef = collection(db, COLLECTION_NAME);
  const snap = await getDocs(colRef);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserById(uid) {
  const docRef = doc(db, COLLECTION_NAME, uid);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function getUsersByRole(role, activeOnly = true) {
  const colRef = collection(db, COLLECTION_NAME);
  let q;
  if (activeOnly) {
    q = query(colRef, where("role", "==", role), where("aktif", "==", true));
  } else {
    q = query(colRef, where("role", "==", role));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateUserRole(uid, newRole) {
  const validRoles = ["pasien", "resepsionis", "dokter", "super_admin"];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Role tidak valid. Harus salah satu dari: ${validRoles.join(", ")}`);
  }
  const docRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(docRef, { role: newRole });
}

export async function toggleUserActive(uid, currentStatus) {
  const docRef = doc(db, COLLECTION_NAME, uid);
  await updateDoc(docRef, { aktif: !currentStatus });
}
