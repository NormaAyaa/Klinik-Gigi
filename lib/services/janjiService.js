import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getJadwalByDokterAndHari } from "./jadwalService";

// Helper konversi jam "HH:mm" ke menit dari tengah malam
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

// Helper konversi menit ke "HH:mm"
function minutesToTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// Helper nama hari dari tanggal YYYY-MM-DD
export function getNamaHari(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  return days[date.getDay()];
}

/**
 * Menghitung slot kosong yang tersedia untuk dokter, tanggal, dan durasi layanan tertentu
 * Sesuai PRD 4.3.1: Slot disusun per 30 menit dari jam praktik dan menyaring bentrok dengan slot_terisi
 */
export async function getAvailableSlots(dokterId, tanggal, durasiMenit) {
  if (!dokterId || !tanggal || !durasiMenit) return [];

  const hari = getNamaHari(tanggal);
  if (hari === "minggu") return []; // Klinik tutup hari Minggu (PRD 1)

  const jadwal = await getJadwalByDokterAndHari(dokterId, hari);
  if (!jadwal) return [];

  const startJadwal = timeToMinutes(jadwal.jamMulai);
  const endJadwal = timeToMinutes(jadwal.jamSelesai);

  // Ambil semua slot yang sudah terisi untuk dokter dan tanggal tersebut
  const slotCol = collection(db, "slot_terisi");
  const qSlot = query(
    slotCol,
    where("dokterId", "==", dokterId),
    where("tanggal", "==", tanggal)
  );
  const slotSnap = await getDocs(qSlot);
  const occupiedSlots = slotSnap.docs.map((d) => {
    const data = d.data();
    const start = timeToMinutes(data.jam);
    const end = start + (data.durasiMenit || 30);
    return { start, end };
  });

  const available = [];
  const serviceDuration = Number(durasiMenit);

  // Periksa interval setiap 30 menit
  for (let current = startJadwal; current + serviceDuration <= endJadwal; current += 30) {
    const candidateStart = current;
    const candidateEnd = current + serviceDuration;

    // Cek apakah bertabrakan / tumpang tindih dengan janji yang sudah ada
    const hasConflict = occupiedSlots.some((slot) => {
      return candidateStart < slot.end && candidateEnd > slot.start;
    });

    if (!hasConflict) {
      available.push(minutesToTime(candidateStart));
    }
  }

  return available;
}

/**
 * Membuat janji temu baru oleh pasien (PRD 4.3.1)
 */
export async function createJanjiTemu({
  pasienId,
  dokterId,
  layananId,
  tanggal,
  jam,
  keluhan,
  durasiMenit,
}) {
  const janjiCol = collection(db, "janji_temu");
  const janjiDoc = await addDoc(janjiCol, {
    pasienId,
    dokterId,
    layananId,
    tanggal,
    jam,
    keluhan: keluhan.trim(),
    status: "menunggu",
    alasanBatal: "",
    dibuatPada: serverTimestamp(),
  });

  // Catat di slot_terisi dengan ID dokumen yang sama persis (PRD 4.3.1 & 7.1)
  const slotRef = doc(db, "slot_terisi", janjiDoc.id);
  await setDoc(slotRef, {
    dokterId,
    tanggal,
    jam,
    durasiMenit: Number(durasiMenit),
  });

  return janjiDoc.id;
}

/**
 * Mengambil daftar janji temu milik pasien
 */
export async function getJanjiByPasien(pasienId) {
  const col = collection(db, "janji_temu");
  const q = query(col, where("pasienId", "==", pasienId));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Urutkan dari tanggal terdekat
  list.sort((a, b) => {
    const tA = `${a.tanggal} ${a.jam}`;
    const tB = `${b.tanggal} ${b.jam}`;
    return tA.localeCompare(tB);
  });

  return list;
}

/**
 * Mengambil rincian 1 janji temu
 */
export async function getJanjiById(id) {
  const docRef = doc(db, "janji_temu", id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Mengambil seluruh janji temu (untuk Resepsionis dan Super Admin)
 */
export async function getAllJanjiTemu() {
  const col = collection(db, "janji_temu");
  const snap = await getDocs(col);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  list.sort((a, b) => {
    const tA = `${a.tanggal} ${a.jam}`;
    const tB = `${b.tanggal} ${b.jam}`;
    return tB.localeCompare(tA);
  });

  return list;
}

/**
 * Resepsionis memperbarui status janji (konfirmasi, hadir, dibatalkan)
 */
export async function updateJanjiStatus(janjiId, newStatus, alasanBatal = "") {
  const janjiRef = doc(db, "janji_temu", janjiId);
  const updateData = { status: newStatus };
  if (alasanBatal) {
    updateData.alasanBatal = alasanBatal.trim();
  }

  await updateDoc(janjiRef, updateData);

  // Jika dibatalkan, hapus dari slot_terisi agar slot jam kembali kosong
  if (newStatus === "dibatalkan") {
    try {
      const slotRef = doc(db, "slot_terisi", janjiId);
      await deleteDoc(slotRef);
    } catch (err) {
      console.error("Error removing slot_terisi on cancellation:", err);
    }
  }
}

/**
 * Resepsionis menjadwalkan ulang janji ke tanggal & jam baru (PRD 4.7)
 */
export async function rescheduleJanji(janjiId, newTanggal, newJam, durasiMenit, dokterId) {
  const janjiRef = doc(db, "janji_temu", janjiId);
  await updateDoc(janjiRef, {
    tanggal: newTanggal,
    jam: newJam,
  });

  // Perbarui atau buat ulang slot_terisi
  const slotRef = doc(db, "slot_terisi", janjiId);
  await setDoc(slotRef, {
    dokterId,
    tanggal: newTanggal,
    jam: newJam,
    durasiMenit: Number(durasiMenit || 30),
  });
}

/**
 * Pasien membatalkan janjinya sendiri (PRD 4.3.2)
 */
export async function batalkanJanjiPasien(janjiId) {
  const janjiRef = doc(db, "janji_temu", janjiId);
  const snap = await getDoc(janjiRef);
  if (!snap.exists()) throw new Error("Janji tidak ditemukan.");

  const data = snap.data();
  if (data.status !== "menunggu" && data.status !== "dikonfirmasi") {
    throw new Error("Hanya janji berstatus Menunggu atau Dikonfirmasi yang dapat dibatalkan.");
  }

  // Ubah status jadi dibatalkan
  await updateDoc(janjiRef, { status: "dibatalkan" });

  // Hapus entri slot_terisi agar slot jam kembali kosong
  try {
    const slotRef = doc(db, "slot_terisi", janjiId);
    await deleteDoc(slotRef);
  } catch (err) {
    console.error("Error removing slot_terisi on patient cancellation:", err);
  }
}
