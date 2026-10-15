"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getJanjiById, batalkanJanjiPasien } from "@/lib/services/janjiService";
import { getUserById } from "@/lib/services/userService";
import { getLayananById } from "@/lib/services/layananService";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function RincianJanjiPasienPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const id = params?.id;

  const [janji, setJanji] = useState(null);
  const [dokter, setDokter] = useState(null);
  const [layanan, setLayanan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id || !user) return;
      try {
        setLoading(true);
        const j = await getJanjiById(id);

        // PRD 4.3.2: Bila ID di alamat diganti dengan janji orang lain, tampil "Janji tidak ditemukan"
        if (!j || (j.pasienId !== user.uid && role !== "super_admin")) {
          setJanji(null);
          return;
        }

        setJanji(j);
        const [docData, layData] = await Promise.all([
          getUserById(j.dokterId),
          getLayananById(j.layananId),
        ]);
        setDokter(docData);
        setLayanan(layData);
      } catch (err) {
        console.error("Error loading janji details:", err);
        setErrorMsg("Gagal memuat rincian janji: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user, role]);

  const handleBatal = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan janji temu ini? Jam praktik ini akan dikembalikan menjadi kosong.")) {
      return;
    }

    setCancelling(true);
    try {
      await batalkanJanjiPasien(id);
      const updated = await getJanjiById(id);
      setJanji(updated);
    } catch (err) {
      console.error("Error cancelling janji:", err);
      alert("Gagal membatalkan janji: " + err.message);
    } finally {
      setCancelling(false);
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

  // Validasi PRD 4.3.2: Pasien hanya bisa membatalkan janji Menunggu atau Dikonfirmasi, paling lambat H-1
  const todayStr = new Date().toISOString().split("T")[0];
  const canCancel =
    janji &&
    (janji.status === "menunggu" || janji.status === "dikonfirmasi") &&
    janji.tanggal > todayStr;

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <div className="w-full py-2 space-y-6">
        <Link
          href="/janji"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rekah-blue transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Janji Saya</span>
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
            <p className="text-sm text-gray-500 mt-1">
              Data janji ini tidak tersedia atau Anda tidak memiliki hak akses untuk membukanya.
            </p>
            <Link
              href="/janji"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-rekah-blue text-white text-xs font-medium hover:bg-rekah-blue-dark transition"
            >
              Kembali ke Daftar Janji
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs text-rekah-muted uppercase tracking-wider font-semibold">
                  Rincian Janji Temu
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                  {layanan?.nama || "Layanan Gigi"}
                </h1>
              </div>
              <div>{getStatusBadge(janji.status)}</div>
            </div>

            {/* Jika Dibatalkan oleh Resepsionis dengan Alasan (PRD 4.3.2) */}
            {janji.status === "dibatalkan" && janji.alasanBatal && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                <span className="font-bold block mb-0.5">Alasan Pembatalan dari Klinik:</span>
                <span>{janji.alasanBatal}</span>
              </div>
            )}

            {/* Grid Informasi */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Tanggal Kunjungan</span>
                <p className="text-base font-bold text-gray-900 tabular-nums mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rekah-blue" />
                  <span>{janji.tanggal}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Slot Jam Praktik</span>
                <p className="text-base font-bold text-gray-900 tabular-nums mt-1 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rekah-blue" />
                  <span>{janji.jam} WIB</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Dokter Pemeriksa</span>
                <p className="text-base font-bold text-gray-900 mt-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-rekah-blue" />
                  <span>{dokter?.nama || "drg. Spesialis"}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 font-semibold block uppercase">Tarif & Estimasi Durasi</span>
                <p className="text-base font-bold text-gray-900 mt-1 tabular-nums">
                  Rp {Number(layanan?.harga || 0).toLocaleString("id-ID")} ({layanan?.durasiMenit || 30} mnt)
                </p>
              </div>
            </div>

            {/* Keluhan */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-400 font-semibold block uppercase mb-1">Keluhan Pasien</span>
              <p className="text-sm text-gray-800 leading-relaxed italic">
                "{janji.keluhan}"
              </p>
            </div>

            {/* Aksi Pembatalan */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {canCancel ? (
                <>
                  <p className="text-xs text-gray-500">
                    Pembatalan dapat dilakukan mandiri maksimal H-1 sebelum tanggal janji.
                  </p>
                  <button
                    onClick={handleBatal}
                    disabled={cancelling}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium transition shadow-sm disabled:opacity-50"
                  >
                    {cancelling ? "Membatalkan..." : "Batalkan Janji Temu"}
                  </button>
                </>
              ) : janji.status === "selesai" ? (
                <div className="w-full flex items-center justify-between text-sm">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Pemeriksaan telah selesai
                  </span>
                  <Link
                    href="/riwayat"
                    className="text-rekah-blue font-semibold hover:underline"
                  >
                    Lihat Catatan Perawatan &rarr;
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  {janji.status === "dibatalkan"
                    ? "Janji temu ini telah dibatalkan."
                    : "Tombol pembatalan tidak tampil pada hari H janji temu."}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
