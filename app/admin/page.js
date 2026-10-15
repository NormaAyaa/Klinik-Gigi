"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import RouteGuard from "@/components/RouteGuard";
import { getAllJanjiTemu } from "@/lib/services/janjiService";
import { getAllUsers } from "@/lib/services/userService";
import {
  CalendarCheck,
  CalendarDays,
  AlertCircle,
  Users,
  Settings,
  Calendar,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";

export default function DasborAdminPage() {
  const [janjiList, setJanjiList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [allJanji, allUsers] = await Promise.all([
          getAllJanjiTemu(),
          getAllUsers(),
        ]);
        setJanjiList(allJanji);
        setUserList(allUsers);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  // PRD 4.12:
  // Kunjungan hari ini: jumlah janji berstatus Selesai hari ini
  const visitsToday = janjiList.filter(
    (j) => j.status === "selesai" && j.tanggal === todayStr
  ).length;

  // Kunjungan bulan ini: jumlah janji berstatus Selesai bulan ini
  const visitsThisMonth = janjiList.filter(
    (j) => j.status === "selesai" && j.tanggal.startsWith(currentMonthStr)
  ).length;

  // Menunggu konfirmasi: jumlah janji berstatus Menunggu
  const waitingCount = janjiList.filter((j) => j.status === "menunggu").length;

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <div className="space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
            Hak Akses Penuh: Super Admin
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
            Dasbor Klinik Gigi Senyum Rekah
          </h1>
          <p className="text-sm text-rekah-muted mt-1">
            Ringkasan operasional klinik, laporan kunjungan pasien, dan pengelolaan seluruh modul sistem
          </p>
        </div>

        {/* 3 Kartu Statistik Utama Sesuai PRD 4.12 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Kunjungan Hari Ini */}
          <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Kunjungan Hari Ini
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-gray-900 tabular-nums">
                {visitsToday}
              </span>
              <span className="text-xs text-gray-500">pasien selesai ({todayStr})</span>
            </div>
            <p className="mt-2 text-xs text-rekah-muted">Janji berstatus selesai pada hari ini</p>
          </div>

          {/* 2. Kunjungan Bulan Ini (Mengklik membuka laporan bulan berjalan - PRD 4.12) */}
          <Link
            href={`/admin/laporan?bulan=${currentMonthStr}`}
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-rekah-blue hover:shadow-md transition block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Kunjungan Bulan Ini
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-rekah-blue tabular-nums">
                {visitsThisMonth}
              </span>
              <span className="text-xs text-gray-500">pasien selesai</span>
            </div>
            <p className="mt-2 text-xs text-rekah-blue font-semibold flex items-center gap-1">
              <span>Buka Laporan Bulan Ini &rarr;</span>
            </p>
          </Link>

          {/* 3. Menunggu Konfirmasi */}
          <Link
            href="/resepsionis/janji?status=menunggu"
            className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-amber-400 hover:shadow-md transition block"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Menunggu Konfirmasi
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-amber-600 tabular-nums">
                {waitingCount}
              </span>
              <span className="text-xs text-gray-500">perlu tindakan</span>
            </div>
            <p className="mt-2 text-xs text-amber-700 font-semibold flex items-center gap-1">
              <span>Buka daftar antrean konfirmasi &rarr;</span>
            </p>
          </Link>
        </div>

        {/* Pintasan Kelola Modul Admin (PRD 3.1 & 4.12) */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Modul Manajemen Klinik</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/pengguna"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-rekah-blue hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Kelola Pengguna</h3>
                <p className="text-xs text-rekah-muted mt-1">
                  Ubah peran (Dokter, Resepsionis, Pasien) dan kelola status akun pengguna
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-rekah-blue flex items-center gap-1">
                <span>{userList.length} Akun Terdaftar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/admin/layanan"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-rekah-blue hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Settings className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Kelola Layanan</h3>
                <p className="text-xs text-rekah-muted mt-1">
                  Atur tarif harga, durasi per 30 menit, dan status aktif layanan klinik
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-rekah-blue flex items-center gap-1">
                <span>Buka Pengaturan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href="/admin/jadwal-dokter"
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-rekah-blue hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Jadwal Praktik Dokter</h3>
                <p className="text-xs text-rekah-muted mt-1">
                  Atur jadwal hari praktik (Senin-Sabtu) dan jam praktik untuk dokter
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-rekah-blue flex items-center gap-1">
                <span>Buka Jadwal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>

            <Link
              href={`/admin/laporan?bulan=${currentMonthStr}`}
              className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-rekah-blue hover:shadow transition flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">Laporan Kunjungan</h3>
                <p className="text-xs text-rekah-muted mt-1">
                  Statistik rekapitulasi pasien selesai per dokter dan per jenis layanan
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-rekah-blue flex items-center gap-1">
                <span>Buka Laporan Bulanan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Akses ke Ruang Peran Lain (PRD 4.12: Menu samping Super Admin juga memuat semua menu peran lain) */}
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <h2 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-rekah-blue" />
            <span>Pemeriksaan Lintas Peran (Super Admin Access)</span>
          </h2>
          <p className="text-xs text-rekah-muted mb-4">
            Sebagai Super Admin, Anda memiliki hak istimewa untuk membuka dan mengawasi langsung halaman kerja ketiga peran lainnya:
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/resepsionis"
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 hover:border-rekah-blue hover:text-rekah-blue transition shadow-sm"
            >
              Buka Dasbor Resepsionis &rarr;
            </Link>
            <Link
              href="/dokter"
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 hover:border-rekah-blue hover:text-rekah-blue transition shadow-sm"
            >
              Buka Ruang Praktik Dokter &rarr;
            </Link>
            <Link
              href="/beranda"
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 hover:border-rekah-blue hover:text-rekah-blue transition shadow-sm"
            >
              Buka Beranda Pasien &rarr;
            </Link>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
