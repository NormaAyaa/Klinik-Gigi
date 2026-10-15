"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getJanjiById, updateJanjiStatus } from "@/lib/services/janjiService";
import { getUserById } from "@/lib/services/userService";
import { getLayananById } from "@/lib/services/layananService";
import {
  createCatatanPerawatan,
  getCatatanByJanji,
} from "@/lib/services/catatanService";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  History,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";

export default function PemeriksaanDokterPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const id = params?.id;

  const [janji, setJanji] = useState(null);
  const [pasien, setPasien] = useState(null);
  const [layanan, setLayanan] = useState(null);
  const [existingCatatan, setExistingCatatan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form input
  const [tindakan, setTindakan] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const quickTindakan = [
    "Pembersihan Karang Gigi (Scaling Supra & Subgingival)",
    "Penambalan Estetik Komposit Resin Mikrohibrid",
    "Perawatan Saluran Akar (PSA) Ekstirpasi Pulpa",
    "Pencabutan Gigi Tanpa Komplikasi (Ekstraksi)",
    "Aplikasi Fluoride Topikal & Polish Prophylaxis",
  ];

  const quickCatatan = [
    "Hindari makanan keras dan minuman sangat panas/dingin selama 24 jam.",
    "Bila ada nyeri, konsumsi analgesik Paracetamol 500mg tiap 8 jam pasca makan.",
    "Jadwalkan kunjungan kontrol 7 hari ke depan untuk evaluasi jaringan lunak.",
    "Gunakan benang gigi (dental floss) dan sikat gigi berbulu halus 2x sehari.",
  ];

  const loadData = async () => {
    if (!id || !user) return;
    try {
      setLoading(true);
      const j = await getJanjiById(id);

      // PRD 4.10: Hanya janji milik dokter itu yang bisa dibuka.
      // Bila ID diganti dengan janji dokter lain, tampil "Janji tidak ditemukan".
      if (!j || (j.dokterId !== user.uid && role !== "super_admin")) {
        setJanji(null);
        return;
      }

      setJanji(j);
      const [pData, lData, cData] = await Promise.all([
        getUserById(j.pasienId),
        getLayananById(j.layananId),
        getCatatanByJanji(j.id),
      ]);
      setPasien(pData);
      setLayanan(lData);
      setExistingCatatan(cData);
      if (cData) {
        setTindakan(cData.tindakan || "");
        setCatatan(cData.catatan || "");
      }
    } catch (err) {
      console.error("Error loading examination page:", err);
      setErrorMsg("Gagal memuat rincian janji: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, user, role]);

  // Submit pemeriksaan & Tandai Selesai (PRD 4.10)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!tindakan.trim()) {
      setErrorMsg("Tindakan medis wajib diisi.");
      return;
    }
    if (!catatan.trim()) {
      setErrorMsg("Catatan dokter wajib diisi.");
      return;
    }

    if (!confirm("Tandai pemeriksaan selesai dan simpan catatan medis ke rekam pasien?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Simpan catatan perawatan
      await createCatatanPerawatan({
        janjiId: janji.id,
        pasienId: janji.pasienId,
        dokterId: janji.dokterId,
        tindakan: tindakan.trim(),
        catatan: catatan.trim(),
      });

      // 2. Ubah status janji jadi Selesai
      await updateJanjiStatus(janji.id, "selesai");

      setSuccessMsg("Pemeriksaan selesai. Catatan perawatan berhasil disimpan dan dapat langsung diakses oleh pasien!");
      await loadData();
    } catch (err) {
      console.error("Error completing examination:", err);
      setErrorMsg("Gagal menyelesaikan pemeriksaan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["dokter", "super_admin"]}>
      <div className="w-full space-y-6 font-sans">
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dokter"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
            <span>Kembali ke Dasbor Dokter</span>
          </Link>

          {pasien && (
            <Link
              href={`/dokter/pasien/${pasien.id || janji.pasienId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-teal-200 bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 transition shadow-sm active:scale-95"
            >
              <History className="w-3.5 h-3.5 text-teal-600" />
              <span>Lihat Riwayat Medis Pasien</span>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Memuat lembar rekam medis pasien...</p>
          </div>
        ) : !janji ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Janji tidak ditemukan</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Janji ini tidak terdaftar atau bukan ditugaskan kepada Anda sesuai hak akses PRD dokter.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* HERO CARD HEADER */}
            <div className="bg-gradient-to-br from-[#E2F1F5] via-[#EDF7F9] to-[#E5F3F7] rounded-[28px] border border-white/80 p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/80 text-teal-800 border border-white/90 shadow-sm flex items-center gap-1.5">
                      <Stethoscope className="w-3 h-3 text-teal-600" />
                      Lembar Rekam Medis
                    </span>
                    <span className="text-xs text-gray-500">ID: {janji.id?.substring(0, 8)}...</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                    {pasien?.nama || "Pasien Pemeriksaan"}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-semibold text-gray-800">
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                      {layanan?.nama || "Layanan Gigi"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Durasi: {layanan?.durasiMenit || 30} Menit
                    </span>
                  </div>
                </div>

                <div className="sm:text-right bg-white/80 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-3.5 sm:p-0 rounded-2xl border sm:border-0 border-white/90">
                  <span className="text-[11px] font-bold text-gray-500 block uppercase">Jadwal Sesi</span>
                  <span className="text-base font-black text-gray-950 tabular-nums">
                    {janji.tanggal} · {janji.jam} WIB
                  </span>
                  <div className="mt-1.5">
                    {janji.status === "hadir" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 animate-pulse inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                        Pasien Siap Diperiksa
                      </span>
                    ) : janji.status === "selesai" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Pemeriksaan Selesai
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 capitalize">
                        Status: {janji.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ALERTS */}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2 shadow-sm animate-fadeIn">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Berhasil Disimpan!</p>
                  <p className="text-emerald-700 mt-0.5">{successMsg}</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-start gap-2 shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Perhatian</p>
                  <p className="text-red-600 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* 2-COLUMN MAIN WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Examination & Notes (8/12 - 68%) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Keluhan Pasien Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                      💬
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Keluhan Awal dari Pasien (Anamnesis)
                    </h3>
                  </div>
                  <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80">
                    <p className="text-sm font-medium text-gray-800 italic leading-relaxed">
                      "{janji.keluhan || "Tidak ada keluhan tertulis."}"
                    </p>
                  </div>
                </div>

                {/* FORM PEMERIKSAAN MEDIS */}
                {janji.status === "selesai" || existingCatatan ? (
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-5 bg-gradient-to-b from-white to-emerald-50/20">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Pemeriksaan Telah Ditandai Selesai</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        Tersimpan Permanen
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1.5 tracking-wider">
                        Tindakan Medis yang Diberikan:
                      </span>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <p className="text-sm font-bold text-gray-900 leading-relaxed">{tindakan}</p>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase block mb-1.5 tracking-wider">
                        Catatan Dokter, Edukasi & Resep:
                      </span>
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{catatan}</p>
                      </div>
                    </div>
                  </div>
                ) : janji.status === "hadir" ? (
                  <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                          Tindakan Medis yang Dilakukan <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-gray-400">Wajib diisi</span>
                      </div>
                      <input
                        type="text"
                        required
                        value={tindakan}
                        onChange={(e) => setTindakan(e.target.value)}
                        placeholder="Contoh: Scaling supragingival rahang atas dan penambalan komposit gigi 36"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#20B4A8] focus:border-[#20B4A8] outline-none text-gray-900 bg-white transition shadow-xs"
                      />
                      
                      {/* Quick chips for tindakan */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-gray-400 mr-1 font-semibold">Saran Cepat:</span>
                        {quickTindakan.map((t, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setTindakan(t)}
                            className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-[11px] text-gray-600 border border-gray-200 transition cursor-pointer"
                          >
                            + {t.split("(")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-800">
                          Catatan Dokter, Edukasi Pasien & Resep Obat <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[11px] text-gray-400">Akan tampil di akun pasien</span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder="Contoh: Hindari makanan yang terlalu panas/dingin selama 24 jam. Pasien diinstruksikan menjaga oral hygiene dan kontrol 1 minggu lagi..."
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#20B4A8] focus:border-[#20B4A8] outline-none text-gray-900 bg-white transition leading-relaxed shadow-xs"
                      ></textarea>

                      {/* Quick chips for catatan */}
                      <div className="mt-2.5 space-y-1.5">
                        <span className="text-[11px] text-gray-400 font-semibold block">Templat Anjuran Pasca Tindakan:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {quickCatatan.map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCatatan((prev) => (prev ? `${prev}\n- ${c}` : `- ${c}`))}
                              className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-teal-50 hover:text-teal-700 text-[11px] text-gray-600 border border-gray-200 transition cursor-pointer text-left"
                            >
                              + {c.substring(0, 36)}...
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-black text-sm shadow-lg shadow-teal-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          {isSubmitting ? "Menyimpan & Menyelesaikan..." : "Simpan Rekam Medis & Selesaikan Kunjungan"}
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white rounded-3xl p-8 border border-gray-200 text-center shadow-sm space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Pasien Belum Berstatus Hadir</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                      Sesuai SOP alur klinik Senyum Rekah, lembar rekam medis hanya dapat diisi dan diselesaikan setelah resepsionis menandai pasien <span className="font-bold text-purple-700">Hadir</span> di klinik.
                    </p>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Patient Details & Clinical Meta (4/12 - 32%) */}
              <div className="lg:col-span-4 space-y-6">
                {/* Patient Profile Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                    <User className="w-4 h-4 text-teal-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Identitas Pasien
                    </h3>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white flex items-center justify-center font-black text-base shadow-sm">
                      {pasien?.nama?.charAt(0) || "P"}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-950 text-sm">
                        {pasien?.nama || "Pasien Pemeriksaan"}
                      </h4>
                      <p className="text-xs text-gray-500">Pasien Terdaftar</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{pasien?.email || "Tidak ada email"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{pasien?.telepon || "0812-xxxx-xxxx"}</span>
                    </div>
                  </div>

                  {pasien && (
                    <div className="pt-2">
                      <Link
                        href={`/dokter/pasien/${pasien.id || janji.pasienId}`}
                        className="w-full py-2.5 px-4 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-teal-200/80 shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-teal-600" />
                        <span>Lihat Riwayat Perawatan Sebelumnya</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                      </Link>
                    </div>
                  )}
                </div>

                {/* Layanan & Biaya Card */}
                <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                    Paket Layanan
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {layanan?.nama || "Layanan Gigi"}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {layanan?.deskripsi || "Prosedur kesehatan gigi dan mulut profesional Senyum Rekah."}
                  </p>
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500 font-medium">Estimasi Biaya:</span>
                    <span className="font-black text-gray-900">
                      Rp {(layanan?.harga || 150000).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* SOP & Privacy Badge */}
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs text-teal-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>Kerahasiaan Medis Terjamin</span>
                  </div>
                  <p className="text-[11px] text-teal-800/80 leading-relaxed">
                    Catatan medis ini hanya dapat diakses oleh Anda (dokter yang memeriksa) dan pasien terkait. Resepsionis tidak dapat melihat lembar rekam medis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
