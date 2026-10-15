"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import { getAllJanjiTemu } from "@/lib/services/janjiService";
import { getUsersByRole } from "@/lib/services/userService";
import { getAllLayanan } from "@/lib/services/layananService";
import { getAllUsers } from "@/lib/services/userService";
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CalendarCheck,
} from "lucide-react";

export default function DasborResepsionisPage() {
  const router = useRouter();
  const [janjiList, setJanjiList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [layananMap, setLayananMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Hari ini YYYY-MM-DD
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allJanji, dokters, allUsers, allLayanan] = await Promise.all([
          getAllJanjiTemu(),
          getUsersByRole("dokter", false),
          getAllUsers(),
          getAllLayanan(),
        ]);

        const uMap = {};
        allUsers.forEach((u) => { uMap[u.id] = u.nama || u.email; });

        const lMap = {};
        allLayanan.forEach((l) => { lMap[l.id] = l.nama; });

        setUserMap(uMap);
        setLayananMap(lMap);
        setDokterList(dokters);
        setJanjiList(allJanji);
      } catch (err) {
        console.error("Error loading receptionist dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Jumlah menunggu konfirmasi (PRD 4.6)
  const waitingCount = janjiList.filter((j) => j.status === "menunggu").length;

  // Janji hari ini (PRD 4.6)
  const todayAppointments = janjiList.filter((j) => j.tanggal === todayStr);

  const getStatusBadge = (status) => {
    switch (status) {
      case "menunggu":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Menunggu</span>;
      case "dikonfirmasi":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Dikonfirmasi</span>;
      case "hadir":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Hadir</span>;
      case "selesai":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</span>;
      case "dibatalkan":
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">Batal</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dasbor Resepsionis</h1>
          <p className="text-sm text-rekah-muted">
            Ringkasan janji hari ini per dokter dan daftar janji yang menunggu konfirmasi
          </p>
        </div>

        {/* Kartu Menunggu Konfirmasi (PRD 4.6: mengklik angka -> masuk Kelola Janji dengan saringan Menunggu) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/resepsionis/janji?status=menunggu"
            className="p-6 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md hover:border-amber-300 transition block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Menunggu Konfirmasi
              </span>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-900 tabular-nums">
                {waitingCount}
              </span>
              <span className="text-xs text-amber-700">janji baru</span>
            </div>
            <p className="mt-2 text-xs text-amber-800 font-medium flex items-center gap-1">
              <span>Buka Kelola Janji dengan saringan Menunggu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </Link>

          <Link
            href="/resepsionis/janji"
            className="p-6 bg-blue-50 rounded-2xl border border-blue-200 shadow-sm hover:shadow-md hover:border-blue-300 transition block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Total Janji Hari Ini
              </span>
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-blue-900 tabular-nums">
                {todayAppointments.length}
              </span>
              <span className="text-xs text-blue-700">kunjungan terdaftar ({todayStr})</span>
            </div>
            <p className="mt-2 text-xs text-blue-800 font-medium flex items-center gap-1">
              <span>Buka semua jadwal di Kelola Janji</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </Link>
        </div>

        {/* PRD 4.6: Janji Hari Ini: satu kolom per dokter */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Jadwal Janji Hari Ini per Dokter ({todayStr})
              </h2>
              <p className="text-xs text-rekah-muted">
                Dipantau langsung oleh resepsionis untuk mencatat konfirmasi dan kehadiran pasien
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-rekah-muted mt-2">Memuat jadwal dokter...</p>
            </div>
          ) : dokterList.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Belum ada akun dokter terdaftar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {dokterList.map((doc) => {
                const docAppointments = todayAppointments.filter((j) => j.dokterId === doc.id);
                return (
                  <div key={doc.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-rekah-blue-light text-rekah-blue flex items-center justify-center font-bold text-xs">
                          🩺
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">{doc.nama || doc.email}</h3>
                      </div>
                      <span className="text-xs text-gray-500 font-semibold tabular-nums">
                        {docAppointments.length} Pasien
                      </span>
                    </div>

                    {docAppointments.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-4 text-center">
                        Tidak ada janji pasien untuk hari ini.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {docAppointments.map((j) => (
                          <Link
                            key={j.id}
                            href={`/resepsionis/janji/${j.id}`}
                            className="block p-3 rounded-lg bg-white border border-gray-200 hover:border-rekah-blue transition"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-900 tabular-nums">
                                {j.jam} WIB
                              </span>
                              {getStatusBadge(j.status)}
                            </div>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              {userMap[j.pasienId] || "Pasien"}
                            </p>
                            <p className="text-xs text-rekah-muted mt-0.5">
                              {layananMap[j.layananId] || "Layanan"}
                            </p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
