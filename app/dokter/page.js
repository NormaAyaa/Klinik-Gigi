"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getAllJanjiTemu, createJanjiTemu, updateJanjiStatus } from "@/lib/services/janjiService";
import { getAllUsers } from "@/lib/services/userService";
import { getAllLayanan } from "@/lib/services/layananService";
import { getJadwalByDokter } from "@/lib/services/jadwalService";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  FileText,
  Stethoscope,
  Users,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  Search,
  PlusCircle,
  HelpCircle,
  Flame,
  ChevronRight,
} from "lucide-react";

export default function DasborDokterPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState("antrean"); // 'antrean' | 'mendatang' | 'riwayat'

  const [janjiHariIni, setJanjiHariIni] = useState([]);
  const [janjiMendatang, setJanjiMendatang] = useState([]);
  const [riwayatSelesai, setRiwayatSelesai] = useState([]);
  const [allDoctorJanji, setAllDoctorJanji] = useState([]);

  const [userMap, setUserMap] = useState({});
  const [layananMap, setLayananMap] = useState({});
  const [doctorSchedule, setDoctorSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  // Clinical memo in local state
  const [clinicalMemo, setClinicalMemo] = useState(
    "Pastikan pemeriksaan vitalitas pulpa dan foto rontgen sebelum preparasi tumpatan dalam."
  );

  // Checklist Ruang Praktik
  const [checklist, setChecklist] = useState({
    dentalUnit: true,
    autoclaveSterile: true,
    intraoralReady: true,
    glovesMaskReady: true,
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [allJanji, allUsers, allLayanan, schedules] = await Promise.all([
        getAllJanjiTemu(),
        getAllUsers(),
        getAllLayanan(),
        getJadwalByDokter(user.uid),
      ]);

      const uMap = {};
      allUsers.forEach((u) => { uMap[u.id] = u.nama || u.email; });

      const lMap = {};
      allLayanan.forEach((l) => { lMap[l.id] = l.nama; });

      setUserMap(uMap);
      setLayananMap(lMap);
      setDoctorSchedule(schedules);

      // Filter janji milik dokter yang sedang login (PRD 4.9: Janji dokter lain tidak tampil)
      const myJanji = allJanji.filter((j) => j.dokterId === user.uid);
      setAllDoctorJanji(myJanji);

      // 1. Janji Hari Ini
      const todayList = myJanji
        .filter((j) => j.tanggal === todayStr)
        .sort((a, b) => a.jam.localeCompare(b.jam));
      setJanjiHariIni(todayList);

      // 2. Janji Mendatang (besok dan seterusnya)
      const upcomingList = myJanji
        .filter((j) => j.tanggal > todayStr && j.status !== "dibatalkan")
        .sort((a, b) => `${a.tanggal} ${a.jam}`.localeCompare(`${b.tanggal} ${b.jam}`));
      setJanjiMendatang(upcomingList);

      // 3. Riwayat Selesai
      const finishedList = myJanji
        .filter((j) => j.status === "selesai")
        .sort((a, b) => `${b.tanggal} ${b.jam}`.localeCompare(`${a.tanggal} ${a.jam}`));
      setRiwayatSelesai(finishedList);
    } catch (err) {
      console.error("Error loading doctor workstation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Helper untuk membuat pasien demo uji coba hari ini berstatus 'hadir' (Siap diperiksa)
  const handleCreateDemoPatient = async () => {
    if (!user) return;
    setIsCreatingDemo(true);
    try {
      // Cari layanan pertama
      const layananIds = Object.keys(layananMap);
      const chosenLayanan = layananIds.length > 0 ? layananIds[0] : "layanan_default";

      // Jam sekarang dibulatkan ke format HH:mm
      const now = new Date();
      const currentJam = `${String(now.getHours()).padStart(2, "0")}:${String(
        Math.floor(now.getMinutes() / 30) * 30
      ).padStart(2, "0")}`;

      const newJanjiId = await createJanjiTemu({
        pasienId: "demo_pasien_uji",
        dokterId: user.uid,
        layananId: chosenLayanan,
        tanggal: todayStr,
        jam: currentJam,
        keluhan: "Gigi geraham bawah ngilu berdenyut sejak 2 hari lalu saat minum air dingin.",
        durasiMenit: 30,
      });

      // Tandai langsung berstatus 'hadir' (Siap diperiksa di klinik)
      await updateJanjiStatus(newJanjiId, "hadir");

      await loadData();
    } catch (err) {
      console.error("Gagal membuat pasien demo:", err);
    } finally {
      setIsCreatingDemo(false);
    }
  };

  // KPIs
  const readyPatientsCount = janjiHariIni.filter((j) => j.status === "hadir").length;
  const todayTotalCount = janjiHariIni.length;
  const todayFinishedCount = janjiHariIni.filter((j) => j.status === "selesai").length;
  const uniquePatientsCount = new Set(allDoctorJanji.map((j) => j.pasienId)).size;

  const getStatusBadge = (status) => {
    switch (status) {
      case "hadir":
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-800 border border-purple-300 animate-pulse flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            Siap Diperiksa
          </span>
        );
      case "selesai":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case "dikonfirmasi":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Dikonfirmasi
          </span>
        );
      case "menunggu":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Menunggu Kedatangan
          </span>
        );
      case "dibatalkan":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <RouteGuard allowedRoles={["dokter", "super_admin"]}>
      <div className="w-full space-y-6 pb-12 font-sans">
        {/* 1. CAREPLUS CLINICAL HERO HEADER */}
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#E2F1F5] via-[#EDF7F9] to-[#E5F3F7] border border-white/80 p-6 sm:p-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-teal-800 text-xs font-bold border border-white/90 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white flex items-center justify-center text-[10px] font-bold">
                  🩺
                </div>
                <span>RUANG PRAKTIK POLI GIGI 01</span>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Praktik Aktif
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                Selamat Bertugas, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0E7490] via-[#0EA5E9] to-[#20B4A8]">
                  drg. {userProfile?.nama || user?.email?.split("@")[0] || "Dokter"}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                Kelola antrean kunjungan pasien hari ini ({todayStr}), isi lembar pemeriksaan medis terenkripsi, dan pantau riwayat perawatan pasien dengan akurat.
              </p>
            </div>

            {/* Quick Action Pill Buttons */}
            <div className="flex flex-wrap sm:flex-col items-start lg:items-end gap-3 z-10">
              <button
                onClick={handleCreateDemoPatient}
                disabled={isCreatingDemo}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold text-xs shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isCreatingDemo ? "Menyiapkan..." : "+ Tambah Pasien Siap Periksa (Uji Coba)"}</span>
              </button>

              <button
                onClick={loadData}
                className="px-4 py-2 rounded-full bg-white text-gray-700 border border-gray-200 text-xs font-semibold hover:bg-gray-50 shadow-sm active:scale-95 transition flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Refresh Data Antrean</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. TOP 4 CLINICAL KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1: Siap Diperiksa */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-purple-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-purple-50/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                Siap Diperiksa
              </span>
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-purple-900 tabular-nums">
                {readyPatientsCount}
              </span>
              <span className="text-xs text-purple-600 font-semibold">Pasien di Klinik</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Menunggu di ruang tunggu/dental chair</p>
          </div>

          {/* KPI 2: Total Jadwal Hari Ini */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Jadwal Hari Ini
              </span>
              <div className="w-9 h-9 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center font-bold">
                <Calendar className="w-5 h-5 text-[#20B4A8]" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 tabular-nums">
                {todayTotalCount}
              </span>
              <span className="text-xs text-gray-500 font-semibold">Total Terjadwal</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Tanggal {todayStr}</p>
          </div>

          {/* KPI 3: Selesai Diperiksa */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Pemeriksaan Selesai
              </span>
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-900 tabular-nums">
                {todayFinishedCount}
              </span>
              <span className="text-xs text-emerald-600 font-semibold">Selesai Hari Ini</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Rekam medis otomatis tersimpan</p>
          </div>

          {/* KPI 4: Total Pasien Saya */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Total Pasien
              </span>
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-blue-900 tabular-nums">
                {uniquePatientsCount}
              </span>
              <span className="text-xs text-blue-600 font-semibold">Pasien Ditangani</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Riwayat seluruh kunjungan</p>
          </div>
        </div>

        {/* 3. MAIN WORKSTATION 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Main Clinical Workflow & Tabs (8/12 - 68%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TAB SELECTOR HEADER */}
            <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm flex items-center gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab("antrean")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "antrean"
                    ? "bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Antrean Hari Ini ({janjiHariIni.length})</span>
                {readyPatientsCount > 0 && (
                  <span className="bg-white text-purple-900 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {readyPatientsCount} Siap
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("mendatang")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "mendatang"
                    ? "bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Jadwal Mendatang ({janjiMendatang.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("riwayat")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === "riwayat"
                    ? "bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Riwayat Pasien Selesai ({riwayatSelesai.length})</span>
              </button>
            </div>

            {/* TAB 1: ANTREAN HARI INI */}
            {activeTab === "antrean" && (
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                    <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-xs text-gray-500 mt-2">Memuat antrean pasien...</p>
                  </div>
                ) : janjiHariIni.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center border border-gray-200 shadow-sm space-y-3">
                    <div className="w-16 h-16 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mx-auto text-3xl shadow-inner">
                      🦷
                    </div>
                    <h3 className="font-bold text-gray-900 text-base">Tidak Ada Pasien Terjadwal Hari Ini</h3>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      Belum ada pasien yang melakukan booking pada jadwal praktik Anda hari ini ({todayStr}). Anda dapat memeriksa jadwal untuk hari esok atau mencoba simulasi pemeriksaan pasien sekarang.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={handleCreateDemoPatient}
                        disabled={isCreatingDemo}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold text-xs shadow-md shadow-teal-500/25 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Simulasikan Pasien Hadir Sekarang</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {janjiHariIni.map((j) => {
                      const isReady = j.status === "hadir";
                      return (
                        <div
                          key={j.id}
                          className={`bg-white rounded-3xl p-5 sm:p-6 border transition shadow-sm hover:shadow-md ${
                            isReady
                              ? "border-purple-300 ring-2 ring-purple-100 bg-gradient-to-br from-white via-purple-50/20 to-white"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl flex-shrink-0 ${
                                  isReady
                                    ? "bg-purple-100 text-purple-700 shadow-inner"
                                    : "bg-cyan-50 text-rekah-blue"
                                }`}
                              >
                                {isReady ? "🩺" : "🦷"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-base font-extrabold text-gray-900">
                                    {userMap[j.pasienId] || "Pasien Senyum Rekah"}
                                  </h3>
                                  {isReady && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider">
                                      Antrean Dental
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-teal-700 font-semibold mt-0.5">
                                  {layananMap[j.layananId] || "Layanan Gigi"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                              {getStatusBadge(j.status)}
                            </div>
                          </div>

                          <div className="pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-8 space-y-1.5 text-xs text-gray-600">
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-gray-900 tabular-nums flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{j.jam} WIB</span>
                                </span>
                                <span className="text-gray-300">•</span>
                                <span>Durasi: {j.durasiMenit || 30} Menit</span>
                              </div>

                              {j.keluhan && (
                                <p className="text-xs text-gray-700 italic bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                                  <span className="font-bold not-italic text-gray-900">Keluhan Pasien:</span> &ldquo;{j.keluhan}&rdquo;
                                </p>
                              )}
                            </div>

                            <div className="sm:col-span-4 flex items-center justify-start sm:justify-end gap-2 pt-2 sm:pt-0">
                              {isReady ? (
                                <Link
                                  href={`/dokter/janji/${j.id}`}
                                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Stethoscope className="w-4 h-4" />
                                  <span>Mulai Periksa 🩺</span>
                                </Link>
                              ) : j.status === "selesai" ? (
                                <Link
                                  href={`/dokter/janji/${j.id}`}
                                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition flex items-center justify-center gap-1"
                                >
                                  <span>Lihat Rekam Medis</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              ) : (
                                <Link
                                  href={`/dokter/janji/${j.id}`}
                                  className="w-full sm:w-auto px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition flex items-center justify-center gap-1"
                                >
                                  <span>Rincian</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: JADWAL MENDATANG */}
            {activeTab === "mendatang" && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Jadwal Pasien Mendatang</h3>
                    <p className="text-xs text-gray-500">Pasien yang telah melakukan reservasi untuk hari-hari berikutnya</p>
                  </div>
                  <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    {janjiMendatang.length} Janji Terjadwal
                  </span>
                </div>

                {janjiMendatang.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    Belum ada janji temu terdaftar untuk jadwal praktik mendatang.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {janjiMendatang.map((j) => (
                      <div key={j.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{userMap[j.pasienId] || "Pasien"}</span>
                            <span className="text-xs text-teal-700 font-semibold">• {layananMap[j.layananId]}</span>
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-3">
                            <span>📅 {j.tanggal}</span>
                            <span>⏰ {j.jam} WIB</span>
                            <span>⏱️ {j.durasiMenit || 30} Menit</span>
                          </p>
                          {j.keluhan && (
                            <p className="text-[11px] text-gray-600 italic">"{j.keluhan}"</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {getStatusBadge(j.status)}
                          <Link
                            href={`/dokter/pasien/${j.pasienId}`}
                            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold transition"
                          >
                            Riwayat Medis Pasien
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: RIWAYAT PASIEN SELESAI */}
            {activeTab === "riwayat" && (
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Riwayat Pasien Selesai Diperiksa</h3>
                    <p className="text-xs text-gray-500">Daftar tindakan medis dan diagnosis yang pernah Anda selesaikan</p>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {riwayatSelesai.length} Pasien
                  </span>
                </div>

                {riwayatSelesai.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-500">
                    Belum ada riwayat pemeriksaan selesai oleh akun dokter ini.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {riwayatSelesai.map((j) => (
                      <div key={j.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{userMap[j.pasienId] || "Pasien"}</span>
                            <span className="text-xs text-teal-700 font-semibold">• {layananMap[j.layananId]}</span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Diselesaikan pada: {j.tanggal} pukul {j.jam} WIB
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <Link
                            href={`/dokter/janji/${j.id}`}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white text-xs font-bold shadow-sm hover:opacity-95 transition"
                          >
                            Buka Lembar Medis
                          </Link>
                          <Link
                            href={`/dokter/pasien/${j.pasienId}`}
                            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-semibold transition"
                          >
                            Semua Riwayat Pasien
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY CLINICAL TOOLS & WIDGETS (4/12 - 32%) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* WIDGET 1: JADWAL PRAKTIK DOKTER */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white flex items-center justify-center font-bold text-sm">
                  🩺
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Jadwal Praktik Saya
                  </h4>
                  <p className="text-[10px] text-gray-500">Klinik Gigi Senyum Rekah</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {doctorSchedule.length === 0 ? (
                  <p className="text-gray-500 text-xs">Jadwal praktik belum diatur di database.</p>
                ) : (
                  doctorSchedule.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-gray-100 flex items-center justify-between capitalize font-semibold"
                    >
                      <span className="text-gray-900">{s.hari}</span>
                      <span className="text-teal-700 font-bold tabular-nums">
                        {s.jamMulai} - {s.jamSelesai} WIB
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 text-[11px] text-gray-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Slot jam otomatis disesuaikan 30 menit per janji</span>
              </div>
            </div>

            {/* WIDGET 2: REFERENSI TINDAKAN & DURASI */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 pb-2 border-b border-gray-100">
                Referensi Prosedur Klinis
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-700 font-medium">Scaling Ultrasonic</span>
                  <span className="font-bold text-gray-900">30 Menit</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-700 font-medium">Tambal Komposit</span>
                  <span className="font-bold text-gray-900">30 Menit</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-700 font-medium">Cabut Gigi Dewasa</span>
                  <span className="font-bold text-gray-900">30 Menit</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-700 font-medium">Perawatan Saluran Akar</span>
                  <span className="font-bold text-gray-900">60 Menit</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-700 font-medium">In-Clinic Bleaching</span>
                  <span className="font-bold text-gray-900">60 Menit</span>
                </div>
              </div>
            </div>

            {/* WIDGET 3: CHECKLIST STERILISASI RUANG POLI */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 pb-2 border-b border-gray-100">
                Kesiapan Ruang Praktik
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.dentalUnit}
                    onChange={(e) => setChecklist({ ...checklist, dentalUnit: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className={checklist.dentalUnit ? "text-gray-800 font-medium" : "text-gray-400"}>
                    Unit Dental Chair & Suction Siap
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.autoclaveSterile}
                    onChange={(e) => setChecklist({ ...checklist, autoclaveSterile: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className={checklist.autoclaveSterile ? "text-gray-800 font-medium" : "text-gray-400"}>
                    Tray Instrumen Autoclave Steril
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.intraoralReady}
                    onChange={(e) => setChecklist({ ...checklist, intraoralReady: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className={checklist.intraoralReady ? "text-gray-800 font-medium" : "text-gray-400"}>
                    Sensor X-Ray & Kamera Intraoral
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.glovesMaskReady}
                    onChange={(e) => setChecklist({ ...checklist, glovesMaskReady: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <span className={checklist.glovesMaskReady ? "text-gray-800 font-medium" : "text-gray-400"}>
                    APD Medis (Handscoon & Masker)
                  </span>
                </label>
              </div>
            </div>

            {/* WIDGET 4: CATATAN KLINIS SEMENTARA (MEMO) */}
            <div className="bg-gradient-to-br from-cyan-900 to-[#0E7490] text-white rounded-3xl p-6 shadow-md space-y-2">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <ClipboardCheck className="w-4 h-4" />
                <span>Memo Klinis Dokter</span>
              </div>
              <textarea
                rows={3}
                value={clinicalMemo}
                onChange={(e) => setClinicalMemo(e.target.value)}
                placeholder="Tulis catatan cepat selama shift praktik..."
                className="w-full bg-white/10 text-white placeholder-cyan-200 text-xs rounded-xl p-2.5 border border-white/20 outline-none focus:border-cyan-300 transition"
              ></textarea>
              <p className="text-[10px] text-cyan-200">
                Catatan sementara untuk dokter saat bertugas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
