"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getJanjiByPasien } from "@/lib/services/janjiService";
import { getUserById, getUsersByRole } from "@/lib/services/userService";
import { getLayananById, getActiveLayanan } from "@/lib/services/layananService";
import {
  Calendar,
  Clock,
  User,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  CalendarCheck,
  AlertCircle,
  Building2,
  Sparkles,
  CreditCard,
  BadgePercent,
  MessageSquare,
  MapPin,
  Phone,
  ShieldCheck,
  Heart,
  Smile,
  FileText,
  Stethoscope,
  ChevronRight,
  Info,
  Lock,
  ChevronDown,
} from "lucide-react";

export default function BerandaPasienPage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [nearestJanji, setNearestJanji] = useState(null);
  const [extraData, setExtraData] = useState({ dokterName: "", layananName: "" });
  const [loading, setLoading] = useState(true);

  // Data for floating booking bar
  const [layananList, setLayananList] = useState([]);
  const [dokterList, setDokterList] = useState([]);
  const [selectedLayanan, setSelectedLayanan] = useState("");
  const [selectedDokter, setSelectedDokter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Quick nav items
  const quickNavItems = [
    { label: "Buat Janji", icon: PlusCircle, href: "/janji/baru", highlight: true },
    { label: "Janji Saya", icon: CalendarCheck, href: "/janji" },
    { label: "Riwayat Medis", icon: FileText, href: "/riwayat" },
    { label: "Jadwal Dokter", icon: Stethoscope, href: "#dokter-praktik" },
    { label: "Tarif Layanan", icon: CreditCard, href: "/#tarif" },
    { label: "Konsultasi WA", icon: MessageSquare, href: "https://wa.me/6281234567890?text=Halo%20Klinik%20Senyum%20Rekah,%20saya%20pasien%20terdaftar%20ingin%20konsultasi", isExternal: true },
    { label: "Profil Pasien", icon: User, href: "/profil" },
  ];

  // Min date for booking is tomorrow (H+1)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split("T")[0];

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        const [list, activeLayanans, activeDokters] = await Promise.all([
          getJanjiByPasien(user.uid),
          getActiveLayanan(),
          getUsersByRole("dokter", true),
        ]);

        setLayananList(activeLayanans);
        setDokterList(activeDokters);

        // Filter upcoming appointments
        const upcoming = list.filter(
          (j) => j.status === "menunggu" || j.status === "dikonfirmasi" || j.status === "hadir"
        );
        const nearest = upcoming.length > 0 ? upcoming[0] : (list.length > 0 ? list[0] : null);

        setNearestJanji(nearest);

        if (nearest) {
          const [docSnap, laySnap] = await Promise.all([
            getUserById(nearest.dokterId),
            getLayananById(nearest.layananId),
          ]);
          setExtraData({
            dokterName: docSnap?.nama || "Dokter Gigi",
            layananName: laySnap?.nama || "Layanan Gigi",
          });
        }
      } catch (err) {
        console.error("Error loading patient beranda data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleQuickBook = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedLayanan) params.set("layananId", selectedLayanan);
    if (selectedDokter) params.set("dokterId", selectedDokter);
    if (selectedDate) params.set("tanggal", selectedDate);
    router.push(`/janji/baru?${params.toString()}`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "menunggu":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Menunggu Konfirmasi</span>;
      case "dikonfirmasi":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Dikonfirmasi</span>;
      case "hadir":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Hadir di Klinik</span>;
      case "selesai":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</span>;
      case "dibatalkan":
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Dibatalkan</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <div className="w-full space-y-8 pb-12 font-sans">
        {/* 1. CAREPLUS MEDICAL STYLE HERO CONTAINER */}
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#E2F1F5] via-[#EDF7F9] to-[#E5F3F7] border border-white/80 p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px]">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-4 z-10">
              {/* Mini Brand & Greeting Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-rekah-blue text-xs font-bold border border-white/90 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white flex items-center justify-center text-[10px] font-bold">
                  🦷
                </div>
                <span>SENYUM REKAH MEDICAL</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-700 font-semibold">Halo, {userProfile?.nama || "Pasien"}! 👋</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-950 leading-[1.1]">
                Your Health, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0E7490] via-[#0EA5E9] to-[#20B4A8]">
                  Our Priority
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 text-sm sm:text-lg leading-relaxed max-w-lg font-normal">
                Compassionate Care for You and Your Family &mdash; Perawatan gigi berstandar modern dengan ketulusan dan dokter gigi spesialis terpercaya.
              </p>

              {/* Value checkmarks */}
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-gray-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#20B4A8]" />
                  <span>Online Booking 24/7</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#20B4A8]" />
                  <span>Slot Bebas Bentrok</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#20B4A8]" />
                  <span>Rekam Medis Privat</span>
                </div>
              </div>
            </div>

            {/* Right Doctor & Patient Consultation Image */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden shadow-md border border-white/60">
              <Image
                src="/images/doctor_consultation.jpg"
                alt="Dokter Gigi Senyum Rekah Berkonsultasi dengan Pasien"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/30 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 bg-white/85 backdrop-blur-md p-2.5 rounded-xl border border-white/60 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-gray-900 leading-tight">drg. Bima Sena, Sp.KG</p>
                  <p className="text-[10px] text-rekah-blue font-semibold">Konsultasi Ramah & Nyaman</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Praktik Hari Ini
                </span>
              </div>
            </div>
          </div>

          {/* FLOATING GLASSMORPHISM BOOKING BAR (Sesuai Mockup Gambar) */}
          <div className="mt-8 bg-white/85 backdrop-blur-xl border border-white/90 rounded-2xl sm:rounded-full p-3 sm:p-4 shadow-xl shadow-cyan-950/5">
            <form onSubmit={handleQuickBook} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* 1. Department / Layanan */}
              <div className="lg:col-span-4 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-200/70">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                  Department / Layanan
                </label>
                <select
                  value={selectedLayanan}
                  onChange={(e) => setSelectedLayanan(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-900 outline-none cursor-pointer"
                >
                  <option value="">Semua Layanan Gigi</option>
                  {layananList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Doctor */}
              <div className="lg:col-span-3 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-200/70">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                  Doctor / Dokter
                </label>
                <select
                  value={selectedDokter}
                  onChange={(e) => setSelectedDokter(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-900 outline-none cursor-pointer"
                >
                  <option value="">Pilih Dokter Spesialis</option>
                  {dokterList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nama || doc.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Date */}
              <div className="lg:col-span-3 px-3 py-1.5 border-b sm:border-b-0 sm:border-r border-gray-200/70">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">
                  Date / Tanggal
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-gray-900 outline-none cursor-pointer"
                />
              </div>

              {/* 4. Action Button (The Signature Teal-Cyan Pill Button!) */}
              <div className="lg:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 2. QUICK MENU ACCESS STRIP (7 Icon Akses Cepat Minimalis) */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
            Menu Akses Cepat Pasien
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {quickNavItems.map((item, idx) => {
              const Icon = item.icon;
              return item.isExternal ? (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-400 hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-rekah-blue transition leading-tight">
                    {item.label}
                  </span>
                </a>
              ) : (
                <Link
                  key={idx}
                  href={item.href}
                  className={`bg-white p-3 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center group ${
                    item.highlight
                      ? "border-teal-300 bg-gradient-to-b from-cyan-50/50 to-white"
                      : "border-gray-200 hover:border-teal-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition ${
                      item.highlight
                        ? "bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white shadow-sm"
                        : "bg-[#F4F7F9] text-gray-700 group-hover:bg-cyan-50 group-hover:text-rekah-blue"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-rekah-blue transition leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 3. MAIN 2-COLUMN SECTION (Left Column 68%, Right Column 32%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Main Patient Operations */}
          <div className="lg:col-span-8 space-y-6">
            {/* SECTION A: KARTU JANJI TEMU TERDEKAT (PRD 4.2) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center">
                    <CalendarCheck className="w-4 h-4 text-[#20B4A8]" />
                  </div>
                  <h2 className="text-base font-bold text-gray-900">
                    Janji Temu Terdekat Anda
                  </h2>
                </div>
                <Link
                  href="/janji"
                  className="text-xs font-semibold text-rekah-blue hover:underline flex items-center gap-1"
                >
                  <span>Semua Janji</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-7 h-7 border-2 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Mengecek jadwal kunjungan Anda...</p>
                </div>
              ) : nearestJanji ? (
                <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-[#FAFCFD] to-[#F2F8FA] p-5 shadow-sm hover:border-teal-300 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-rekah-blue flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-inner">
                        🦷
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{extraData.layananName}</h3>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <User className="w-3.5 h-3.5 text-rekah-blue" />
                          <span>{extraData.dokterName}</span>
                        </p>
                      </div>
                    </div>

                    <div>{getStatusBadge(nearestJanji.status)}</div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-6">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Tanggal</span>
                        <span className="font-bold text-gray-800 tabular-nums">{nearestJanji.tanggal}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Jam Praktik</span>
                        <span className="font-bold text-gray-800 tabular-nums">{nearestJanji.jam} WIB</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Durasi</span>
                        <span className="font-bold text-gray-800 tabular-nums">{nearestJanji.durasiMenit || 30} Menit</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/janji/${nearestJanji.id}`}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white text-xs font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <span>Lihat Rincian</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {nearestJanji.keluhan && (
                    <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Catatan Keluhan:</span> &ldquo;{nearestJanji.keluhan}&rdquo;
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center bg-slate-50/50">
                  <div className="w-14 h-14 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
                    🦷
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm">Belum Ada Janji Temu Aktif</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">
                    Anda belum memiliki jadwal janji temu mendatang. Tentukan dokter spesialis pilihan Anda dan pilih jam kosong tanpa perlu antre lama.
                  </p>
                  <Link
                    href="/janji/baru"
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white text-xs font-bold shadow-md shadow-teal-500/20 active:scale-95 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Pilih Jadwal Dokter Sekarang</span>
                  </Link>
                </div>
              )}
            </div>

            {/* SECTION B: DOKTER PRAKTIK DI SENYUM REKAH */}
            <div id="dokter-praktik" className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Dokter Gigi Praktik di Senyum Rekah
                  </h3>
                  <p className="text-xs text-gray-500">Tenaga medis spesialis berdedikasi tinggi</p>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  Jadwal Resmi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doctor 1 */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAFCFD] hover:bg-white hover:border-teal-300 transition flex gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 shadow-sm">
                    <Image
                      src="/images/doctor_bima.jpg"
                      alt="drg. Bima Sena, Sp.KG"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">drg. Bima Sena, Sp.KG</h4>
                      <p className="text-[10px] text-rekah-blue font-semibold">Spesialis Konservasi Gigi</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Praktik: <span className="font-semibold text-gray-700">Senin, Rabu, Jumat (09.00 - 15.00)</span>
                      </p>
                    </div>
                    <Link
                      href="/janji/baru?dokterId=dokter_bima"
                      className="mt-2 text-[10px] font-bold text-teal-600 inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Jadwalkan Konsultasi</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Doctor 2 */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-[#FAFCFD] hover:bg-white hover:border-teal-300 transition flex gap-3.5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-100 shadow-sm">
                    <Image
                      src="/images/doctor_bima.jpg"
                      alt="drg. Sinta Dewi, Sp.Ort"
                      fill
                      className="object-cover object-top"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">drg. Sinta Dewi, Sp.Ort</h4>
                      <p className="text-[10px] text-purple-700 font-semibold">Spesialis Ortodonti (Behel)</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Praktik: <span className="font-semibold text-gray-700">Selasa, Kamis, Sabtu (13.00 - 20.00)</span>
                      </p>
                    </div>
                    <Link
                      href="/janji/baru?dokterId=dokter_sinta"
                      className="mt-2 text-[10px] font-bold text-teal-600 inline-flex items-center gap-1 hover:underline"
                    >
                      <span>Jadwalkan Konsultasi</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION C: RIWAYAT PERAWATAN & REKAM MEDIS TEASER (PRD 4.5) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Riwayat Perawatan & Rekam Medis
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Pantau diagnosis, tindakan medis, resep obat, dan anjuran dokter Anda secara privat dan aman.
                  </p>
                </div>
              </div>

              <Link
                href="/riwayat"
                className="px-5 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-800 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 active:scale-95"
              >
                <span>Buka Rekam Medis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY SIDEBAR WIDGETS */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* WIDGET 1: RESERVASI JADWAL PRAKTIK */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white flex items-center justify-center font-bold text-sm">
                  🦷
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Senyum Rekah Care
                  </h4>
                  <p className="text-[10px] text-gray-500">Reservasi Kunjungan Cepat</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-tight">
                  Buat Janji Kunjungan
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Slot otomatis per 30 menit bebas tabrakan
                </p>
              </div>

              {/* Signature Pill Button */}
              <Link
                href="/janji/baru"
                className="w-full py-3.5 px-4 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-4 h-4" />
                <span>+ BUAT JANJI SEKARANG</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>

              {/* 4 Feature Points */}
              <div className="mt-5 space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B4A8] flex-shrink-0" />
                  <span>Pilih Dokter Spesialis Favorit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B4A8] flex-shrink-0" />
                  <span>Slot Jam 30 Menit Real-Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B4A8] flex-shrink-0" />
                  <span>Konfirmasi Cepat oleh Resepsionis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#20B4A8] flex-shrink-0" />
                  <span>Bisa Dibatalkan Mandiri (H-1)</span>
                </div>
              </div>

              {/* Aesthetic Clean Medical Instrument Graphic */}
              <div className="relative h-24 w-full rounded-2xl overflow-hidden mt-5 border border-gray-100">
                <Image
                  src="/images/instruments.jpg"
                  alt="Peralatan Steril Medis Senyum Rekah"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] text-white font-semibold">
                    100% Autoclave Steril per Pasien
                  </span>
                </div>
              </div>
            </div>

            {/* WIDGET 2: KONTAK & BANTUAN KLINIK */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                  Pusat Informasi Pasien
                </span>
                <h4 className="text-sm font-extrabold text-gray-900 mt-0.5">
                  Butuh Bantuan Resepsionis?
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Staf resepsionis kami siap membantu mengatur ulang jadwal atau menjawab pertanyaan Anda.
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#20B4A8] flex-shrink-0" />
                  <span>Jl. Pandanaran No. 45, Semarang Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#20B4A8] flex-shrink-0" />
                  <span>Senin – Sabtu: 09.00 – 20.00 WIB</span>
                </div>
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Resepsionis%20Senyum%20Rekah,%20saya%20pasien%20ingin%20bertanya"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-800 text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>KIRIM PESAN WHATSAPP</span>
              </a>
            </div>

            {/* WIDGET 3: PENGINGAT PEMELIHARAAN GIGI */}
            <div className="bg-gradient-to-br from-cyan-900 to-[#0E7490] text-white rounded-3xl p-6 shadow-md">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Tips Senyum Sehat</span>
              </div>
              <h4 className="text-sm font-bold mt-1 text-white">
                Pembersihan Karang 6 Bulan Sekali
              </h4>
              <p className="text-xs text-cyan-100 mt-1 leading-relaxed">
                Pembersihan karang gigi secara teratur mencegah gusi berdarah dan menjaga gigi tetap kuat hingga usia senja.
              </p>
              <Link
                href="/janji/baru"
                className="mt-3 inline-block w-full py-2.5 px-3 rounded-full bg-white text-rekah-blue text-center text-xs font-bold hover:bg-cyan-50 transition shadow-sm active:scale-95"
              >
                Jadwalkan Scaling Sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* 4. BOTTOM 4 VALUE PILLARS */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-1.5">
                <Heart className="w-4 h-4 text-[#20B4A8]" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase">Kenyamanan Pasien</p>
              <p className="text-[11px] text-gray-500">Layanan ramah & bebas cemas</p>
            </div>

            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-1.5">
                <ShieldCheck className="w-4 h-4 text-[#20B4A8]" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase">Kualitas Terstandar</p>
              <p className="text-[11px] text-gray-500">Sterilisasi medis rumah sakit</p>
            </div>

            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-1.5">
                <User className="w-4 h-4 text-[#20B4A8]" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase">Kepercayaan Pasien</p>
              <p className="text-[11px] text-gray-500">5.200+ pasien puas di Semarang</p>
            </div>

            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-1.5">
                <Smile className="w-4 h-4 text-[#20B4A8]" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase">Senyum Percaya Diri</p>
              <p className="text-[11px] text-gray-500">Hasil estetik awet & natural</p>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
