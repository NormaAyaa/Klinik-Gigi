"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import {
  ShieldCheck,
  Sparkles,
  Heart,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  Star,
  MessageSquare,
  Phone,
  MapPin,
  CreditCard,
  BadgePercent,
  UserCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Stethoscope,
  Smile,
  Award,
  Flame,
} from "lucide-react";

export default function HomePage() {
  const { user, role, userProfile } = useAuth();
  const [selectedServiceModal, setSelectedServiceModal] = useState(null);
  const [activeBeforeAfterTab, setActiveBeforeAfterTab] = useState("all");

  const quickNav = [
    { label: "Tentang Klinik", icon: Building2, href: "#tentang" },
    { label: "Layanan Gigi", icon: Sparkles, href: "#layanan" },
    { label: "Dokter Kami", icon: UserCheck, href: "#dokter" },
    { label: "Tarif & Biaya", icon: CreditCard, href: "#tarif" },
    { label: "Promo & Paket", icon: BadgePercent, href: "#promo" },
    { label: "Ulasan Pasien", icon: MessageSquare, href: "#ulasan" },
    { label: "Lokasi & Kontak", icon: MapPin, href: "#kontak" },
  ];

  const infoCards = [
    {
      title: "Tentang Klinik",
      desc: "Fasilitas modern higienis dengan ruang tunggu nyaman & ramah anak di pusat kota Semarang.",
      img: "/images/reception.jpg",
      tag: "Higienis & Nyaman",
      action: "Lihat Fasilitas",
    },
    {
      title: "Layanan Lengkap",
      desc: "Perawatan komprehensif mulai dari scaling, tambal estetik, saluran akar hingga behel & bleaching.",
      img: "/images/instruments.jpg",
      tag: "Spesialisasi Gigi",
      action: "Lihat Layanan",
    },
    {
      title: "Teknologi Terkini",
      desc: "Dilengkapi Digital 3D Dental X-Ray & sistem sterilisasi autoclave standar medis rumah sakit.",
      img: "/images/hero_clinic.jpg",
      tag: "Standar Medis",
      action: "Lihat Teknologi",
    },
    {
      title: "Pencegahan Rutin",
      desc: "Edukasi kesehatan mulut berkala dan pembersihan karang gigi terjadwal demi senyum cemerlang.",
      img: "/images/before_after.jpg",
      tag: "Senyum Sehat",
      action: "Tips Sehat",
    },
  ];

  const servicesList = [
    {
      nama: "Pembersihan Karang Gigi (Scaling)",
      durasi: "30 Menit",
      harga: "Rp 250.000",
      desc: "Menghilangkan plak & karang gigi membandel dengan teknologi ultrasonic tanpa merusak enamel.",
    },
    {
      nama: "Tambal Gigi Estetik Komposit",
      durasi: "30 Menit",
      harga: "Rp 300.000",
      desc: "Penambalan lubang gigi menggunakan resin komposit dengan warna senada gigi asli Anda.",
    },
    {
      nama: "Cabut Gigi Dewasa Minim Nyeri",
      durasi: "30 Menit",
      harga: "Rp 250.000",
      desc: "Ekstraksi gigi dengan teknik anestesi lembut dan pendampingan dokter spesialis bedah mulut.",
    },
    {
      nama: "Perawatan Saluran Akar (Endodontik)",
      durasi: "60 Menit",
      harga: "Rp 600.000",
      desc: "Menyelamatkan gigi yang terinfeksi parah agar tetap dapat dipertahankan tanpa perlu dicabut.",
    },
    {
      nama: "Pemutihan Gigi (In-Clinic Bleaching)",
      durasi: "60 Menit",
      harga: "Rp 1.500.000",
      desc: "Mencerahkan gigi hingga 3-4 shade lebih putih bersinar dalam satu kali sesi perawatan.",
    },
    {
      nama: "Konsultasi & Pemeriksaan Rutin",
      durasi: "30 Menit",
      harga: "Rp 100.000",
      desc: "Pemeriksaan menyeluruh rongga mulut dengan kamera intraoral & rontgen digital jika diperlukan.",
    },
  ];

  const getDashboardLink = () => {
    if (role === "super_admin") return "/admin";
    if (role === "dokter") return "/dokter";
    if (role === "resepsionis") return "/resepsionis";
    return "/beranda";
  };

  return (
    <div className="w-full text-gray-800 pb-16 font-sans">
      {/* Logged in notification banner */}
      {user && (
        <div className="bg-gradient-to-r from-cyan-900 to-rekah-blue text-white px-4 py-2.5 text-xs sm:text-sm font-medium shadow-sm rounded-2xl mb-6">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                Halo, <strong>{userProfile?.nama || user.email}</strong>! Anda masuk sebagai{" "}
                <span className="uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded text-[11px]">
                  {role || "Pasien"}
                </span>
              </span>
            </div>
            <Link
              href={getDashboardLink()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-rekah-blue hover:bg-rekah-blue-light font-semibold text-xs transition shadow-sm"
            >
              <span>Buka Dasbor Saya</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full pt-1 space-y-8">
        {/* 1. HERO COVER SECTION */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white shadow-xl border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] items-stretch">
            {/* Left Content Column */}
            <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-between z-10 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-5 border border-cyan-400/30 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Pelayanan Estetik & Kesehatan Gigi Modern</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white drop-shadow-sm font-display">
                  Senyum Sehat, <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-200">
                    Percaya Diri
                  </span>{" "}
                  Setiap Hari
                </h1>

                <p className="mt-4 text-sm sm:text-base text-gray-200/90 font-normal leading-relaxed max-w-md">
                  Perawatan gigi modern, higienis, dan minim rasa sakit untuk seluruh keluarga bersama dokter gigi spesialis terpercaya di Semarang.
                </p>
              </div>

              {/* 3 Value Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2 text-cyan-300 border border-white/15">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-200 leading-tight">
                    Sterilisasi Medis
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2 text-cyan-300 border border-white/15">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-200 leading-tight">
                    Teknologi Digital
                  </span>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-2 text-cyan-300 border border-white/15">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold text-gray-200 leading-tight">
                    Pendekatan Personal
                  </span>
                </div>
              </div>
            </div>

            {/* Right Clinic Image Column */}
            <div className="lg:col-span-6 relative min-h-[260px] lg:min-h-full">
              <Image
                src="/images/hero_clinic.jpg"
                alt="Interior Klinik Gigi Senyum Rekah Semarang Center"
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-white/40 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rekah-blue text-white flex items-center justify-center text-xs font-bold">
                  🦷
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-900 leading-tight">DENTAL CLINIC</p>
                  <p className="text-[9px] text-gray-500 leading-none">Semarang Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CLINIC IDENTITY & QUICK ACTION BAR (Profil Komunitas / Klinik) */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-100 border-2 border-rekah-blue/20 flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
              🦷
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  Klinik Gigi Senyum Rekah Semarang Center
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-rekah-blue border border-blue-200">
                  Terverifikasi
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Perawatan gigi modern dengan ketulusan dan standar tertinggi
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 text-xs text-gray-500">
                <div className="flex items-center text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-gray-900 ml-1">4.9</span>
                  <span className="text-gray-400 ml-1">(5.200+ Pasien)</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Buka Hari Ini (09.00 - 20.00 WIB)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Link
              href={user ? "/janji/baru" : "/masuk?redirectUrl=/janji/baru"}
              className="flex-1 md:flex-none px-6 py-2.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white text-xs sm:text-sm font-bold shadow-md shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Buat Janji Temu</span>
            </Link>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20Klinik%20Gigi%20Senyum%20Rekah,%20saya%20ingin%20bertanya%20mengenai%20jadwal%20perawatan"
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-none px-5 py-2.5 rounded-full bg-white text-gray-700 border border-gray-300 text-xs sm:text-sm font-bold hover:bg-gray-50 transition active:scale-95 flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Konsultasi WA</span>
            </a>
          </div>
        </div>

        {/* 3. QUICK MENU STRIP (МЕНЮ СООБЩЕСТВА - 7 Kotak Icon) */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 px-1">
            Menu Akses Cepat
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {quickNav.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.href}
                  className="bg-white p-3 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-rekah-blue/40 hover:-translate-y-0.5 transition duration-200 flex flex-col items-center text-center group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F4F7F9] text-gray-700 group-hover:bg-cyan-50 group-hover:text-rekah-blue flex items-center justify-center mb-2 transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-rekah-blue transition leading-tight">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* 4. MAIN 2-COLUMN SECTION (Kiri Konten Utama 68%, Kanan Sticky Widgets 32%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-8">
            {/* SECTION A: INFORMATIONAL 4-CARDS (Информационные блоки) */}
            <div id="tentang">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
                  Informasi Klinik
                </h3>
                <span className="text-xs text-rekah-blue font-semibold">Senyum Rekah Care</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col group"
                  >
                    <div className="relative h-36 w-full overflow-hidden bg-gray-100">
                      <Image
                        src={card.img}
                        alt={card.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {card.tag}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-rekah-blue transition">
                          {card.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                          {card.desc}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedServiceModal(card)}
                        className="mt-3 text-xs font-bold text-rekah-blue inline-flex items-center gap-1 hover:underline pt-2 border-t border-gray-100 w-full text-left"
                      >
                        <span>{card.action}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION B: DOKTER KAMI (Подробнее о клинике & Врачи) */}
            <div id="dokter" className="bg-white rounded-2xl p-5 sm:p-7 border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 relative h-64 md:h-72 w-full rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                  <Image
                    src="/images/doctor_bima.jpg"
                    alt="drg. Bima & Tim Dokter Gigi Senyum Rekah"
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-gray-200/60 text-center shadow-md">
                    <p className="text-xs font-bold text-gray-900 leading-tight">drg. Bima Sena, Sp.KG</p>
                    <p className="text-[10px] text-rekah-blue font-semibold">Spesialis Konservasi Gigi</p>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-rekah-blue bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                    Tim Medis Berdedikasi
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug uppercase">
                    Kami Menciptakan Senyum yang Menginspirasi
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                    Klinik kami memadukan pengalaman dokter spesialis, teknologi perawatan terkini, dan perhatian tulus kepada setiap pasien. Kami mengutamakan prosedur minim rasa sakit dan hasil estetik yang bertahan lama.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Dokter Berpengalaman</p>
                        <p className="text-[10px] text-gray-500">Spesialis & bersertifikat</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Peralatan Modern</p>
                        <p className="text-[10px] text-gray-500">Standar higienis medis</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                        <Smile className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Bebas Nyeri & Cemas</p>
                        <p className="text-[10px] text-gray-500">Teknik anestesi halus</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">Garansi Mutu</p>
                        <p className="text-[10px] text-gray-500">Kepuasan hasil nyata</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION C: BEFORE & AFTER GALLERY (Примеры работ) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Contoh Hasil Perawatan Gigi (Before & After)
                  </h3>
                  <p className="text-xs text-gray-500">Transformasi senyum nyata pasien Senyum Rekah</p>
                </div>
                <span className="text-[11px] font-bold text-rekah-blue bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200 self-start sm:self-auto">
                  Hasil Klinis Asli
                </span>
              </div>

              {/* High-res Before & After Showcase Image */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                <div className="relative h-64 sm:h-80 w-full">
                  <Image
                    src="/images/before_after.jpg"
                    alt="Komparasi Hasil Sebelum dan Sesudah Perawatan Gigi"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* 4 Treatment transformation highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-900">Bleaching Estetik</p>
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">3-4 Tingkat Lebih Putih</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-900">Behel / Orthodontik</p>
                  <p className="text-[10px] text-blue-700 font-semibold mt-0.5">Rata Sempurna & Rapi</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-900">Tambal Gigi Depan</p>
                  <p className="text-[10px] text-purple-700 font-semibold mt-0.5">Warna Alami Tanpa Celah</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-900">Scaling Ultrasonik</p>
                  <p className="text-[10px] text-cyan-700 font-semibold mt-0.5">Bebas Karang & Gusi Sehat</p>
                </div>
              </div>
            </div>

            {/* SECTION D: TARIF & BIAYA TRANSPARAN */}
            <div id="tarif" className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Tarif Layanan Transparan
                  </h3>
                  <p className="text-xs text-gray-500">Biaya tertera jelas tanpa ada biaya tersembunyi</p>
                </div>
                <Link
                  href={user ? "/janji/baru" : "/masuk"}
                  className="text-xs font-bold text-rekah-blue hover:underline"
                >
                  Pilih Layanan →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {servicesList.map((svc, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-gray-200/80 hover:border-rekah-blue/40 bg-[#FAFCFD] hover:bg-white transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900">{svc.nama}</h4>
                        <span className="text-[10px] font-bold text-rekah-blue bg-cyan-50 px-2 py-0.5 rounded flex-shrink-0">
                          {svc.durasi}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug">{svc.desc}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-gray-900">{svc.harga}</span>
                      <Link
                        href={user ? "/janji/baru" : "/masuk?redirectUrl=/janji/baru"}
                        className="text-[10px] font-bold text-rekah-blue hover:underline"
                      >
                        Pesan Slot
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION E: TESTIMONI PASIEN (Отзывы пациентов) */}
            <div id="ulasan" className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Ulasan & Pengalaman Pasien
                  </h3>
                  <p className="text-xs text-gray-500">Kepuasan ribuan pasien Senyum Rekah di Semarang</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Review 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-100 text-rekah-blue flex items-center justify-center font-bold text-xs">
                        SR
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">Siti Rahmawati</p>
                        <p className="text-[10px] text-gray-500">Pasien Scaling & Tambal</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400 text-xs mb-2">
                      {"★★★★★"}
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      &ldquo;Dokternya sangat ramah dan sabar menjelaskan kondisi gigi saya. Scaling sama sekali tidak ngilu. Kliniknya sangat bersih!&rdquo;
                    </p>
                  </div>
                </div>

                {/* Review 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        DP
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">Dimas Pratama</p>
                        <p className="text-[10px] text-gray-500">Pasien Ortodonti (Behel)</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400 text-xs mb-2">
                      {"★★★★★"}
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      &ldquo;Sistem booking online di portalnya mantap banget! Datang langsung masuk tanpa nunggu lama, jadwalnya tepat waktu.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Review 3 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/70 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                        AL
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">Amanda Lestari</p>
                        <p className="text-[10px] text-gray-500">Pasien Bleaching Gigi</p>
                      </div>
                    </div>
                    <div className="flex text-amber-400 text-xs mb-2">
                      {"★★★★★"}
                    </div>
                    <p className="text-xs text-gray-700 italic leading-relaxed">
                      &ldquo;Hasil bleaching memuaskan banget, putih natural dan gak bikin gigi ngilu. Sangat recommended buat warga Semarang.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - STICKY WIDGETS (Виджет сообщества) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            {/* WIDGET 1: JADWALKAN KUNJUNGAN (Запишитесь на приём) */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 mb-4">
                <div className="w-8 h-8 rounded-lg bg-rekah-blue text-white flex items-center justify-center font-bold text-sm">
                  🦷
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Senyum Rekah Semarang Center
                  </h4>
                  <p className="text-[10px] text-gray-500">Sistem Reservasi Resmi</p>
                </div>
              </div>

              <div className="text-center mb-4">
                <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-tight">
                  Jadwalkan Kunjungan Anda
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Pilih dokter, layanan, dan waktu terbaik tanpa antre
                </p>
              </div>

              {/* Main CTA Button */}
              <Link
                href={user ? "/janji/baru" : "/masuk?redirectUrl=/janji/baru"}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rekah-blue to-cyan-700 text-white font-bold text-sm hover:from-rekah-blue-dark hover:to-cyan-800 transition shadow-md flex items-center justify-center gap-2 group"
              >
                <Calendar className="w-4 h-4" />
                <span>BUAT JANJI SEKARANG</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>

              {/* 4 Feature Points with Icons */}
              <div className="mt-5 space-y-2.5 text-xs text-gray-600">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Booking Janji Online 24/7 Kapan Saja</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Pengingat Jadwal Kunjungan Otomatis</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Slot Jam Dokter Real-time (30 Menit)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span>Akses Riwayat Rekam Medis Pribadi</span>
                </div>
              </div>

              {/* Visual Instrument Accent Image */}
              <div className="relative h-28 w-full rounded-xl overflow-hidden mt-5 border border-gray-100">
                <Image
                  src="/images/instruments.jpg"
                  alt="Instrumen Steril Klinik Gigi Senyum Rekah"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white font-semibold">
                    100% Instrumen Steril per Pasien
                  </span>
                </div>
              </div>
            </div>

            {/* WIDGET 2: ADA PERTANYAAN? (Есть вопросы? Мы на связи!) */}
            <div id="kontak" className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rekah-blue">
                  Pusat Bantuan
                </span>
                <h4 className="text-sm font-extrabold text-gray-900 mt-0.5">
                  Ada Pertanyaan? Kami Siap Membantu!
                </h4>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Konsultasikan keluhan gigi Anda bersama staf resepsionis ramah kami via WhatsApp atau telepon.
                </p>
              </div>

              <div className="space-y-2 pt-1 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rekah-blue flex-shrink-0" />
                  <span>Jl. Pandanaran No. 45, Semarang Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rekah-blue flex-shrink-0" />
                  <span>Senin – Sabtu: 09.00 – 20.00 WIB</span>
                </div>
              </div>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Klinik%20Senyum%20Rekah,%20saya%20ingin%20konsultasi"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-gray-800 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>KIRIM PESAN WHATSAPP</span>
              </a>
            </div>

            {/* WIDGET 3: PROMO & PAKET KHUSUS */}
            <div id="promo" className="bg-gradient-to-br from-cyan-900 to-rekah-blue text-white rounded-2xl p-5 shadow-md">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Paket Spesial Bulan Ini</span>
              </div>
              <h4 className="text-base font-bold mt-1 text-white">
                Paket Senyum Bersinar
              </h4>
              <p className="text-xs text-cyan-100 mt-1">
                Scaling menyeluruh + Polishing gigi + Konsultasi Dokter hanya <strong>Rp 299.000</strong> (Hemat 30%).
              </p>
              <Link
                href={user ? "/janji/baru" : "/masuk?redirectUrl=/janji/baru"}
                className="mt-3 inline-block w-full py-2 px-3 rounded-lg bg-white text-rekah-blue text-center text-xs font-bold hover:bg-cyan-50 transition shadow-sm"
              >
                Klaim Promo Ini
              </Link>
            </div>
          </div>
        </div>

        {/* 5. BOTTOM 4 VALUE PILLARS (Paling Bawah Seperti di Mockup) */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm mt-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-rekah-blue" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Kenyamanan Pasien</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Perhatian tulus pada setiap kunjungan</p>
            </div>

            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5 text-rekah-blue" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Kualitas Teruji</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Standar sterilisasi & medis terakreditasi</p>
            </div>

            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-2">
                <UserCheck className="w-5 h-5 text-rekah-blue" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Kepercayaan Pasien</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Ribuan keluarga puas di Semarang</p>
            </div>

            <div className="flex flex-col items-center pt-2 md:pt-0">
              <div className="w-10 h-10 rounded-full bg-cyan-50 text-rekah-blue flex items-center justify-center mb-2">
                <Smile className="w-5 h-5 text-rekah-blue" />
              </div>
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Senyum Percaya Diri</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Hasil estetika natural & memukau</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETAIL INFORMASI */}
      {selectedServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-48 w-full bg-gray-100">
              <Image
                src={selectedServiceModal.img}
                alt={selectedServiceModal.title}
                fill
                className="object-cover"
              />
              <button
                onClick={() => setSelectedServiceModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 flex items-center justify-center shadow-md transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <span className="text-[10px] font-bold text-rekah-blue bg-cyan-50 px-2 py-0.5 rounded-full">
                {selectedServiceModal.tag}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-1">
                {selectedServiceModal.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {selectedServiceModal.desc}
              </p>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-gray-100 space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Protokol higienis sterilisasi medis per pasien</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Konsultasi pra-tindakan transparan tanpa biaya tak terduga</span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSelectedServiceModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Tutup
                </button>
                <Link
                  href={user ? "/janji/baru" : "/masuk?redirectUrl=/janji/baru"}
                  className="px-4 py-2 rounded-xl bg-rekah-blue text-white text-xs font-bold hover:bg-rekah-blue-dark transition shadow-sm"
                >
                  Buat Janji Kunjungan
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
