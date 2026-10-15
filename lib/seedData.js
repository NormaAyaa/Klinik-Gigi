import { collection, getDocs, addDoc, doc, setDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const DEFAULT_LAYANAN = [
  { nama: "Pembersihan Karang Gigi (Scaling)", durasiMenit: 30, harga: 250000, aktif: true },
  { nama: "Tambal Gigi Komposit", durasiMenit: 30, harga: 300000, aktif: true },
  { nama: "Cabut Gigi Dewasa", durasiMenit: 30, harga: 250000, aktif: true },
  { nama: "Perawatan Saluran Akar", durasiMenit: 60, harga: 600000, aktif: true },
  { nama: "Pemutihan Gigi (Bleaching)", durasiMenit: 60, harga: 1500000, aktif: true },
  { nama: "Konsultasi & Pemeriksaan Rutin", durasiMenit: 30, harga: 100000, aktif: true },
];

export async function seedInitialLayanan() {
  const colRef = collection(db, "layanan");
  const existingSnap = await getDocs(colRef);

  if (!existingSnap.empty) {
    return { count: existingSnap.size, message: "Layanan sudah ada sebelumnya." };
  }

  let added = 0;
  for (const item of DEFAULT_LAYANAN) {
    await addDoc(colRef, item);
    added++;
  }

  return { count: added, message: `Berhasil menambahkan ${added} layanan default.` };
}
