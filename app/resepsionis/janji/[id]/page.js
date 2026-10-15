"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import {
  getJanjiById,
  updateJanjiStatus,
  rescheduleJanji,
  getAvailableSlots,
} from "@/lib/services/janjiService";
import { getUserById } from "@/lib/services/userService";
import { getLayananById } from "@/lib/services/layananService";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  CalendarDays,
  XCircle,
  UserCheck,
  AlertCircle,
  Phone,
} from "lucide-react";

export default function RincianKelolaJanjiResepsionisPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [janji, setJanji] = useState(null);
  const [pasien, setPasien] = useState(null);
  const [dokter, setDokter] = useState(null);
  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Action states
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Modal Pembatalan
  const [showBatalModal, setShowBatalModal] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");

  // Modal Jadwal Ulang
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newTanggal, setNewTanggal] = useState("");
  const [newJam, setNewJam] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const j = await getJanjiById(id);
      if (!j) {
        setJanji(null);
        return;
      }
      setJanji(j);
      const [pData, dData, lData] = await Promise.all([
        getUserById(j.pasienId),
        getUserById(j.dokterId),
        getLayananById(j.layananId),
      ]);
      setPasien(pData);
      setDokter(dData);
      setLayanan(lData);
    } catch (err) {
      console.error("Error loading janji detail:", err);
      setErrorMsg("Gagal memuat rincian janji: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Handle Konfirmasi (PRD 4.7: Konfirmasi hanya untuk janji Menunggu)
  const handleKonfirmasi = async () => {
    if (!confirm("Konfirmasi janji temu pasien ini?")) return;
    setIsProcessing(true);
    setErrorMsg("");
    try {
      await updateJanjiStatus(id, "dikonfirmasi");
      setSuccessMsg("Janji berhasil dikonfirmasi.");
      await fetchDetail();
    } catch (err) {
      console.error("Error confirming:", err);
      setErrorMsg("Gagal mengonfirmasi janji: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Tandai Hadir (PRD 4.7: Hanya untuk janji Dikonfirmasi pada hari ini)
  const handleTandaiHadir = async () => {
    if (!confirm("Tandai pasien telah hadir di klinik? Janji akan muncul di Dasbor Dokter.")) return;
    setIsProcessing(true);
    setErrorMsg("");
    try {
      await updateJanjiStatus(id, "hadir");
      setSuccessMsg("Pasien telah ditandai Hadir di klinik dan siap diperiksa dokter.");
      await fetchDetail();
    } catch (err) {
      console.error("Error marking present:", err);
      setErrorMsg("Gagal menandai hadir: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Batalkan
  const handleBatalSubmit = async (e) => {
    e.preventDefault();
    if (!alasanBatal.trim()) {
      alert("Alasan pembatalan wajib diisi.");
      return;
    }
    setIsProcessing(true);
    setErrorMsg("");
    try {
      await updateJanjiStatus(id, "dibatalkan", alasanBatal.trim());
      setSuccessMsg("Janji berhasil dibatalkan dan slot kembali dibuka.");
      setShowBatalModal(false);
      await fetchDetail();
    } catch (err) {
      console.error("Error cancelling:", err);
      setErrorMsg("Gagal membatalkan janji: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger loading slots when newTanggal changes in reschedule modal
  useEffect(() => {
    async function loadNewSlots() {
      if (!newTanggal || !janji || !layanan) return;
      try {
        setLoadingRescheduleSlots(true);
        const slots = await getAvailableSlots(janji.dokterId, newTanggal, layanan.durasiMenit || 30);
        setRescheduleSlots(slots);
        setNewJam("");
      } catch (err) {
        console.error("Error loading reschedule slots:", err);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    }
    loadNewSlots();
  }, [newTanggal, janji, layanan]);

  // Handle Reschedule Submit
  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!newTanggal || !newJam) {
      alert("Pilih tanggal dan jam baru.");
      return;
    }
    setIsProcessing(true);
    setErrorMsg("");
    try {
      await rescheduleJanji(id, newTanggal, newJam, layanan?.durasiMenit || 30, janji.dokterId);
      setSuccessMsg(`Janji berhasil dijadwalkan ulang ke ${newTanggal} jam ${newJam} WIB.`);
      setShowRescheduleModal(false);
      await fetchDetail();
    } catch (err) {
      console.error("Error rescheduling:", err);
      setErrorMsg("Gagal menjadwalkan ulang: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "menunggu":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Menunggu Konfirmasi</span>;
      case "dikonfirmasi":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Dikonfirmasi</span>;
      case "hadir":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">Hadir di Klinik</span>;
      case "selesai":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</span>;
      case "dibatalkan":
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Dibatalkan</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Validasi tombol PRD 4.7
  const isFinalStatus = janji?.status === "selesai" || janji?.status === "dibatalkan";
  const canKonfirmasi = janji?.status === "menunggu";
  const isToday = janji?.tanggal === todayStr;
  const canTandaiHadir = janji?.status === "dikonfirmasi" && isToday;

  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <div className="max-w-3xl mx-auto py-6">
        <Link
          href="/resepsionis/janji"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rekah-blue transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kelola Janji</span>
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-rekah-muted mt-2">Memuat rincian janji...</p>
          </div>
        ) : !janji ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">Janji tidak ditemukan</h2>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs text-rekah-muted uppercase tracking-wider font-semibold">
                  Kelola Janji Pasien
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">
                  {pasien?.nama || "Pasien"}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-rekah-blue" />
                  <span>No. HP: {pasien?.noHp || "Belum ada no HP"}</span>
                </p>
              </div>
              <div>{getStatusBadge(janji.status)}</div>
            </div>

            {/* Alerts */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button onClick={() => setSuccessMsg("")} className="text-xs text-emerald-600 hover:underline">Tutup</button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button onClick={() => setErrorMsg("")} className="text-xs text-red-600 hover:underline">Tutup</button>
              </div>
            )}

            {/* Pembatalan jika dibatalkan */}
            {janji.status === "dibatalkan" && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <span className="font-bold block mb-1">Janji ini telah dibatalkan:</span>
                <span className="italic">{janji.alasanBatal || "Dibatalkan oleh pasien."}</span>
              </div>
            )}

            {/* Grid Detail Janji */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Layanan Gigi</span>
                <p className="text-base font-bold text-gray-900 mt-1">{layanan?.nama || "Layanan"}</p>
                <p className="text-xs text-rekah-muted mt-0.5 tabular-nums">
                  Rp {Number(layanan?.harga || 0).toLocaleString("id-ID")} · {layanan?.durasiMenit} Menit
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Dokter Dituju</span>
                <p className="text-base font-bold text-gray-900 mt-1">{dokter?.nama || dokter?.email}</p>
                <p className="text-xs text-rekah-muted mt-0.5">Spesialis Klinik Gigi Senyum Rekah</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Tanggal Janji</span>
                <p className="text-base font-bold text-gray-900 tabular-nums mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-rekah-blue" />
                  <span>{janji.tanggal}</span>
                  {isToday && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      HARI INI
                    </span>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Jam Kunjungan</span>
                <p className="text-base font-bold text-gray-900 tabular-nums mt-1 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rekah-blue" />
                  <span>{janji.jam} WIB</span>
                </p>
              </div>
            </div>

            {/* Keluhan Pasien */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-400 font-semibold block uppercase mb-1">Keluhan Pasien</span>
              <p className="text-sm text-gray-800 italic">"{janji.keluhan}"</p>
            </div>

            {/* Catatan Perawatan Tidak Tampil (PRD 4.7 & 4.8) */}
            <div className="p-3 bg-gray-100 rounded-xl text-center text-xs text-gray-500 italic">
              🔒 Catatan medis & tindakan perawatan dokter bersifat rahasia dan tidak ditampilkan di menu resepsionis.
            </div>

            {/* Tombol Aksi Resepsionis Sesuai PRD 4.7 */}
            {!isFinalStatus ? (
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                {canKonfirmasi && (
                  <button
                    onClick={handleKonfirmasi}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Janji</span>
                  </button>
                )}

                {canTandaiHadir && (
                  <button
                    onClick={handleTandaiHadir}
                    disabled={isProcessing}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Tandai Hadir di Klinik</span>
                  </button>
                )}

                <button
                  onClick={() => setShowRescheduleModal(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Jadwal Ulang</span>
                </button>

                <button
                  onClick={() => setShowBatalModal(true)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Batalkan Janji</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 text-right">
                <p className="text-xs text-gray-400 italic">
                  Janji berstatus {janji.status} tidak dapat diubah lagi (PRD 4.7).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal Batalkan dengan Alasan (PRD 4.7) */}
        {showBatalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-2">Batalkan Janji Temu</h2>
              <p className="text-xs text-rekah-muted mb-4">
                Masukkan alasan pembatalan. Alasan ini akan tampil pada rincian janji pasien.
              </p>

              <form onSubmit={handleBatalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Alasan Pembatalan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={alasanBatal}
                    onChange={(e) => setAlasanBatal(e.target.value)}
                    placeholder="Contoh: Pasien berhalangan hadir atau dokter berhalangan mendadak."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBatalModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Menyimpan..." : "Konfirmasi Batalkan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Jadwal Ulang (PRD 4.7: memilih tanggal dan slot kosong baru) */}
        {showRescheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-2">Jadwalkan Ulang Janji</h2>
              <p className="text-xs text-rekah-muted mb-4">
                Pilih tanggal dan slot jam kosong baru untuk dokter {dokter?.nama || "Dokter"}.
              </p>

              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Tanggal Baru <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newTanggal}
                    onChange={(e) => setNewTanggal(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Pilih Jam Baru (Slot Kosong) <span className="text-red-500">*</span>
                  </label>
                  {loadingRescheduleSlots ? (
                    <p className="text-xs text-gray-500 py-2">Memeriksa slot kosong...</p>
                  ) : !newTanggal ? (
                    <p className="text-xs text-gray-400 py-2">Pilih tanggal baru terlebih dahulu.</p>
                  ) : rescheduleSlots.length === 0 ? (
                    <p className="text-xs text-red-500 py-2">Tidak ada slot kosong pada tanggal ini.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                      {rescheduleSlots.map((slot) => (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setNewJam(slot)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold tabular-nums border transition ${
                            newJam === slot
                              ? "bg-rekah-blue text-white border-rekah-blue"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowRescheduleModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing || !newJam}
                    className="px-4 py-2 rounded-lg bg-rekah-blue text-white text-xs font-bold hover:bg-rekah-blue-dark transition shadow-sm disabled:opacity-50"
                  >
                    {isProcessing ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
