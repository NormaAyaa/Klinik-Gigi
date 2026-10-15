"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getUserById } from "@/lib/services/userService";
import { getCatatanByDokterAndPasien } from "@/lib/services/catatanService";
import { getAllJanjiTemu } from "@/lib/services/janjiService";
import { getAllLayanan } from "@/lib/services/layananService";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  AlertCircle,
  FileText,
  Activity,
  CheckCircle2,
  Stethoscope,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function RiwayatPasienDokterPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const pasienId = params?.id;

  const [pasien, setPasien] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!pasienId || !user) return;
      try {
        setLoading(true);
        const [pData, catatans, allJanji, allLayanan] = await Promise.all([
          getUserById(pasienId),
          getCatatanByDokterAndPasien(user.uid, pasienId),
          getAllJanjiTemu(),
          getAllLayanan(),
        ]);

        // PRD 4.11: Bila ID diganti dengan pasien yang belum pernah ia tangani, tampil "Pasien tidak ditemukan"
        if (!pData || (catatans.length === 0 && role !== "super_admin")) {
          setPasien(null);
          return;
        }

        setPasien(pData);

        const janjiMap = {};
        allJanji.forEach((j) => { janjiMap[j.id] = j; });

        const layananMap = {};
        allLayanan.forEach((l) => { layananMap[l.id] = l.nama; });

        const combined = catatans.map((c) => {
          const janjiData = janjiMap[c.janjiId] || {};
          return {
            ...c,
            tanggal: janjiData.tanggal || "-",
            jam: janjiData.jam || "-",
            layananNama: layananMap[janjiData.layananId] || "Layanan Gigi",
          };
        });

        // Urutkan dari yang terbaru
        combined.sort((a, b) => (b.tanggal || "").localeCompare(a.tanggal || ""));

        setHistoryList(combined);
      } catch (err) {
        console.error("Error loading patient history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [pasienId, user, role]);

  return (
    <RouteGuard allowedRoles={["dokter", "super_admin"]}>
      <div className="w-full space-y-6 font-sans">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm active:scale-95 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-600" />
            <span>Kembali ke Dasbor Dokter</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-500 mt-3 font-medium">Memeriksa riwayat medis pasien...</p>
          </div>
        ) : !pasien ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Pasien tidak ditemukan</h2>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Pasien ini belum pernah Anda tangani dalam riwayat kunjungan selesai klinik Senyum Rekah (PRD 4.11).
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-[#E2F1F5] via-[#EDF7F9] to-[#E5F3F7] rounded-[28px] border border-white/80 p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/80 text-teal-800 border border-white/90 shadow-sm inline-flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-teal-600" />
                    Rekam Riwayat Perawatan Pasien
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                    {pasien.nama}
                  </h1>
                  <p className="text-xs text-gray-600 max-w-xl">
                    Daftar tindakan medis dan catatan klinis yang pernah Anda berikan kepada pasien ini di klinik Senyum Rekah.
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/90 text-right">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">Total Perawatan Selesai</span>
                  <span className="text-2xl font-black text-teal-900 tabular-nums">
                    {historyList.length} Sesi
                  </span>
                </div>
              </div>
            </div>

            {/* LIST RIWAYAT CATATAN */}
            <div className="space-y-4">
              {historyList.map((item, index) => (
                <div
                  key={item.id || index}
                  className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-7 shadow-sm space-y-4 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <h3 className="font-black text-gray-900 text-base">{item.layananNama}</h3>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 tabular-nums">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.tanggal}</span>
                        <span>•</span>
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.jam} WIB</span>
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1 self-start sm:self-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tindakan Selesai
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 block mb-1">
                        Tindakan Medis yang Diberikan:
                      </span>
                      <p className="text-sm font-bold text-gray-900 leading-relaxed">{item.tindakan}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block mb-1">
                        Catatan Dokter & Edukasi Pasien:
                      </span>
                      <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed italic">
                        "{item.catatan}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
