"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getActiveLayanan } from "@/lib/services/layananService";
import { getUsersByRole } from "@/lib/services/userService";
import { getJadwalByDokter, getNamaHari } from "@/lib/services/jadwalService";
import {
  getAvailableSlots,
  createJanjiTemu,
} from "@/lib/services/janjiService";
import {
  Calendar,
  Clock,
  User,
  Activity,
  AlertCircle,
  CheckCircle2,
  Send,
  HelpCircle,
} from "lucide-react";

export default function BuatJanjiBaruPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [layananList, setLayananList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form selections
  const [selectedLayananId, setSelectedLayananId] = useState("");
  const [selectedDokterId, setSelectedDokterId] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [selectedJam, setSelectedJam] = useState("");
  const [keluhan, setKeluhan] = useState("");

  // Doctor practice days
  const [doctorActiveDays, setDoctorActiveDays] = useState([]);

  // Available slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Min date: PRD 4.3.1: "Validasi: tanggal paling cepat besok (H+1)"
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [layanans, dokters] = await Promise.all([
          getActiveLayanan(),
          getUsersByRole("dokter", true),
        ]);
        setLayananList(layanans);
        setDokterList(dokters);
      } catch (err) {
        console.error("Error loading initial booking data:", err);
        setErrorMsg("Gagal memuat data formulir: " + err.message);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, []);

  // When doctor changes, load their scheduled days
  useEffect(() => {
    async function loadDoctorSchedule() {
      if (!selectedDokterId) {
        setDoctorActiveDays([]);
        return;
      }
      try {
        const schedules = await getJadwalByDokter(selectedDokterId);
        setDoctorActiveDays(schedules.map((s) => s.hari.toLowerCase()));
      } catch (err) {
        console.error("Error loading doctor schedule:", err);
      }
    }
    loadDoctorSchedule();
    setSelectedJam("");
    setAvailableSlots([]);
  }, [selectedDokterId]);

  // When Layanan, Dokter, or Tanggal changes, calculate available slots
  useEffect(() => {
    async function loadSlots() {
      if (!selectedLayananId || !selectedDokterId || !selectedTanggal) {
        setAvailableSlots([]);
        return;
      }

      const hariDipilih = getNamaHari(selectedTanggal);
      if (hariDipilih === "minggu") {
        setErrorMsg("Klinik tutup pada hari Minggu. Silakan pilih hari Senin sampai Sabtu.");
        setAvailableSlots([]);
        return;
      }

      if (doctorActiveDays.length > 0 && !doctorActiveDays.includes(hariDipilih)) {
        setErrorMsg(`Dokter yang dipilih tidak berpraktik pada hari ${hariDipilih.toUpperCase()}. Silakan pilih hari lain.`);
        setAvailableSlots([]);
        return;
      }

      setErrorMsg("");
      const selectedLayanan = layananList.find((l) => l.id === selectedLayananId);
      if (!selectedLayanan) return;

      try {
        setLoadingSlots(true);
        const slots = await getAvailableSlots(
          selectedDokterId,
          selectedTanggal,
          selectedLayanan.durasiMenit
        );
        setAvailableSlots(slots);
        if (slots.length === 0) {
          setErrorMsg("Semua slot jam praktik dokter pada tanggal ini sudah penuh. Silakan pilih tanggal lain.");
        }
      } catch (err) {
        console.error("Error loading slots:", err);
        setErrorMsg("Gagal memuat slot kosong: " + err.message);
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [selectedLayananId, selectedDokterId, selectedTanggal, doctorActiveDays, layananList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedLayananId) {
      setErrorMsg("Pilih layanan terlebih dahulu.");
      return;
    }
    if (!selectedDokterId) {
      setErrorMsg("Pilih dokter terlebih dahulu.");
      return;
    }
    if (!selectedTanggal) {
      setErrorMsg("Pilih tanggal janji temu.");
      return;
    }
    if (!selectedJam) {
      setErrorMsg("Pilih slot jam yang tersedia.");
      return;
    }
    if (!keluhan.trim()) {
      setErrorMsg("Isi keluhan atau catatan yang dirasakan.");
      return;
    }

    const selectedLayanan = layananList.find((l) => l.id === selectedLayananId);

    setIsSubmitting(true);
    try {
      // Cek kembali ketersediaan slot sebelum submit (mencegah bentrok detik terakhir)
      const freshSlots = await getAvailableSlots(
        selectedDokterId,
        selectedTanggal,
        selectedLayanan.durasiMenit
      );
      if (!freshSlots.includes(selectedJam)) {
        setErrorMsg("Slot ini baru saja terisi oleh pasien lain. Silakan pilih jam lain.");
        setAvailableSlots(freshSlots);
        setSelectedJam("");
        setIsSubmitting(false);
        return;
      }

      const janjiId = await createJanjiTemu({
        pasienId: user.uid,
        dokterId: selectedDokterId,
        layananId: selectedLayananId,
        tanggal: selectedTanggal,
        jam: selectedJam,
        keluhan: keluhan.trim(),
        durasiMenit: selectedLayanan.durasiMenit,
      });

      // Bawa ke rincian janji temu (PRD 4.3.1 langkah 6)
      router.push(`/janji/${janjiId}`);
    } catch (err) {
      console.error("Booking submit error:", err);
      setErrorMsg("Gagal membuat janji: " + err.message);
      setIsSubmitting(false);
    }
  };

  const selectedLayananObj = layananList.find((l) => l.id === selectedLayananId);
  const selectedDokterObj = dokterList.find((d) => d.id === selectedDokterId);

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <div className="w-full py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Formulir Booking (7/12) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6 pb-4 border-b border-gray-100">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-rekah-blue text-xs font-semibold mb-2 border border-cyan-100">
                <span>🦷 Reservasi Pasien Resmi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Buat Janji Temu Baru</h1>
              <p className="text-xs sm:text-sm text-rekah-muted mt-1">
                Pilih tindakan gigi, dokter, dan tentukan jam yang tidak bertabrakan dengan jadwal pasien lain.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loadingInitial ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-rekah-muted mt-2">Menyiapkan data layanan & dokter...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Pilih Layanan */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1 flex items-center justify-between">
                    <span>1. Pilih Layanan Gigi <span className="text-red-500">*</span></span>
                    {selectedLayananObj && (
                      <span className="text-rekah-blue font-bold text-xs">
                        Rp {Number(selectedLayananObj.harga).toLocaleString("id-ID")} ({selectedLayananObj.durasiMenit} Menit)
                      </span>
                    )}
                  </label>
                  <select
                    required
                    value={selectedLayananId}
                    onChange={(e) => setSelectedLayananId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none bg-white text-gray-900"
                  >
                    <option value="">-- Pilih Jenis Layanan --</option>
                    {layananList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama} — Rp {Number(item.harga).toLocaleString("id-ID")} ({item.durasiMenit} Menit)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Pilih Dokter */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    2. Pilih Dokter Gigi <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedDokterId}
                    onChange={(e) => setSelectedDokterId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none bg-white text-gray-900"
                  >
                    <option value="">-- Pilih Dokter Spesialis --</option>
                    {dokterList.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.nama || doc.email}
                      </option>
                    ))}
                  </select>
                  {doctorActiveDays.length > 0 && (
                    <p className="text-[11px] text-rekah-muted mt-1 capitalize">
                      Hari praktik: {doctorActiveDays.join(", ")}
                    </p>
                  )}
                </div>

                {/* 3. Pilih Tanggal */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    3. Tanggal Kunjungan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={minDateStr}
                    value={selectedTanggal}
                    onChange={(e) => setSelectedTanggal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none text-gray-900 bg-white"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Pemesanan dilakukan paling cepat untuk besok (H+1).
                  </p>
                </div>

                {/* 4. Slot Jam Tersedia */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    4. Pilih Slot Jam Praktik yang Kosong <span className="text-red-500">*</span>
                  </label>

                  {loadingSlots ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-rekah-muted">
                      Memeriksa ketersediaan jam kosong...
                    </div>
                  ) : !selectedTanggal || !selectedDokterId || !selectedLayananId ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-gray-200">
                      Pilih Layanan, Dokter, dan Tanggal terlebih dahulu untuk menampilkan jam praktik yang kosong.
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div className="p-4 bg-amber-50 rounded-xl text-center text-xs text-amber-800 border border-amber-200">
                      Tidak ada slot kosong yang tersedia pada hari/tanggal ini. Silakan pilih hari lain.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                      {availableSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedJam(slot)}
                          className={`py-2 px-3 rounded-full text-xs font-bold tabular-nums border transition active:scale-95 ${
                            selectedJam === slot
                              ? "bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white border-transparent shadow-md shadow-teal-500/20"
                              : "bg-gray-50 hover:bg-cyan-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          {slot} WIB
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. Keluhan */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    5. Keluhan Pasien <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={keluhan}
                    onChange={(e) => setKeluhan(e.target.value)}
                    placeholder="Contoh: Gigi geraham kiri ngilu saat makan makanan dingin"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none text-gray-900 bg-white"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedJam}
                    className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold shadow-md shadow-teal-500/25 active:scale-95 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Menyimpan Janji..." : "Kirim Janji Temu"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Kolom Kanan: Ringkasan Rencana & Jaminan Klinik (5/12) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            {/* Live Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rekah-blue" />
                <span>Ringkasan Rencana Kunjungan</span>
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tindakan / Layanan</span>
                  <span className="font-bold text-gray-900 text-right">
                    {selectedLayananObj ? selectedLayananObj.nama : "Belum dipilih"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Dokter Gigi</span>
                  <span className="font-bold text-gray-900 text-right">
                    {selectedDokterObj ? (selectedDokterObj.nama || selectedDokterObj.email) : "Belum dipilih"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tanggal Kunjungan</span>
                  <span className="font-bold text-gray-900 tabular-nums">
                    {selectedTanggal || "Belum dipilih"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Jam Praktik</span>
                  <span className="font-bold text-rekah-blue tabular-nums">
                    {selectedJam ? `${selectedJam} WIB` : "Belum dipilih"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Estimasi Durasi</span>
                  <span className="font-bold text-gray-900">
                    {selectedLayananObj ? `${selectedLayananObj.durasiMenit} Menit` : "-"}
                  </span>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Estimasi Biaya</span>
                  <span className="text-base font-extrabold text-rekah-blue">
                    {selectedLayananObj ? `Rp ${Number(selectedLayananObj.harga).toLocaleString("id-ID")}` : "Rp 0"}
                  </span>
                </div>
              </div>
            </div>

            {/* Jaminan Layanan Klinik */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Jaminan Senyum Rekah
              </h4>
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bebas Bentrok:</strong> Slot waktu yang Anda pilih terkunci eksklusif per pasien.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Fleksibilitas:</strong> Dapat dibatalkan mandiri paling lambat H-1 (24 jam sebelum jadwal).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Steril 100%:</strong> Seluruh peralatan disterilisasi dengan autoclave berstandar medis rumah sakit.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
