"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import { getAllJanjiTemu } from "@/lib/services/janjiService";
import { getUsersByRole } from "@/lib/services/userService";
import { getAllLayanan } from "@/lib/services/layananService";
import {
  BarChart3,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

function LaporanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentYearMonth = new Date().toISOString().substring(0, 7); // "2026-10"
  const initialMonth = searchParams.get("bulan") || currentYearMonth;

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [janjiList, setJanjiList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync selectedMonth to URL query param (PRD 4.16: Bulan yang dipilih tersimpan di alamat halaman)
  const handleMonthChange = (e) => {
    const val = e.target.value;
    setSelectedMonth(val);
    router.replace(`/admin/laporan?bulan=${val}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allJanji, dokters, layanans] = await Promise.all([
          getAllJanjiTemu(),
          getUsersByRole("dokter", false),
          getAllLayanan(),
        ]);
        setJanjiList(allJanji);
        setDokterList(dokters);
        setLayananList(layanans);
      } catch (err) {
        console.error("Error loading report data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // PRD 4.16: Kunjungan dihitung dari janji berstatus Selesai pada bulan yang dipilih
  const selesaiInMonth = janjiList.filter(
    (j) => j.status === "selesai" && j.tanggal?.startsWith(selectedMonth)
  );

  // Rekapitulasi per dokter
  const doctorStats = dokterList.map((doc) => {
    const count = selesaiInMonth.filter((j) => j.dokterId === doc.id).length;
    return {
      id: doc.id,
      nama: doc.nama || doc.email,
      email: doc.email,
      count,
    };
  });

  // Rekapitulasi per layanan
  const serviceStats = layananList.map((lay) => {
    const count = selesaiInMonth.filter((j) => j.layananId === lay.id).length;
    return {
      id: lay.id,
      nama: lay.nama,
      durasiMenit: lay.durasiMenit,
      count,
    };
  });

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan Kunjungan Klinik</h1>
            <p className="text-sm text-rekah-muted">
              Rekapitulasi jumlah pasien yang selesai ditangani per dokter dan per layanan gigi
            </p>
          </div>

          {/* Pemilih Bulan Sesuai PRD 4.16 */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-300 shadow-sm self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-rekah-blue" />
            <label className="text-xs font-semibold text-gray-700">Pilih Periode Bulan:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="text-xs font-bold text-gray-900 bg-transparent outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Ringkasan Angka */}
        <div className="p-6 bg-gradient-to-r from-rekah-blue to-teal-700 rounded-2xl text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
              Total Kunjungan Pasien Selesai Periode {selectedMonth}
            </span>
            <div className="text-3xl font-extrabold mt-1 tabular-nums">
              {selesaiInMonth.length} Pasien
            </div>
          </div>
          <div className="text-xs text-cyan-100 max-w-xs">
            Dihitung otomatis dari seluruh janji temu berstatus <strong>Selesai</strong> pada bulan yang dipilih.
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-rekah-muted mt-2">Menyusun laporan bulanan...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabel 1: Jumlah Kunjungan per Dokter (PRD 4.16) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-rekah-blue" />
                  <span>Kunjungan per Dokter Gigi</span>
                </h2>
                <span className="text-xs font-semibold text-gray-500">{doctorStats.length} Dokter</span>
              </div>

              <div className="divide-y divide-gray-100">
                {doctorStats.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-500">Belum ada akun dokter.</p>
                ) : (
                  doctorStats.map((d) => (
                    <div key={d.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{d.nama}</p>
                        <p className="text-xs text-gray-500">{d.email}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-rekah-blue tabular-nums">
                          {d.count}
                        </span>
                        <span className="text-xs text-gray-500 block">kunjungan</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tabel 2: Jumlah Kunjungan per Layanan (PRD 4.16) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rekah-blue" />
                  <span>Kunjungan per Jenis Layanan</span>
                </h2>
                <span className="text-xs font-semibold text-gray-500">{serviceStats.length} Layanan</span>
              </div>

              <div className="divide-y divide-gray-100">
                {serviceStats.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-500">Belum ada data layanan.</p>
                ) : (
                  serviceStats.map((l) => (
                    <div key={l.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{l.nama}</p>
                        <p className="text-xs text-gray-500">{l.durasiMenit} Menit per tindakan</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-emerald-600 tabular-nums">
                          {l.count}
                        </span>
                        <span className="text-xs text-gray-500 block">tindakan</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 italic text-center">
          * Catatan Batasan v1 (PRD 4.16 & Bab 9): Ekspor berkas spreadsheet/PDF serta kalkulasi omzet kasir tidak termasuk dalam lingkup versi 1.
        </p>
      </div>
    </RouteGuard>
  );
}

export default function LaporanAdminPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Memuat laporan kunjungan...</div>}>
      <LaporanContent />
    </Suspense>
  );
}
