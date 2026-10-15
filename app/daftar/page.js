"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  UserPlus,
  AlertCircle,
  User,
  Stethoscope,
  Users,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function DaftarPage() {
  const router = useRouter();
  const { user, role, registerWithEmail, loginWithGoogle, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState("pasien");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    {
      id: "pasien",
      title: "Pasien",
      desc: "Buat janji temu & akses rekam medis",
      icon: User,
      badge: "Umum",
      color: "border-emerald-300 bg-emerald-50/50 text-emerald-800",
      activeBg: "border-rekah-blue bg-cyan-50/70 ring-2 ring-rekah-blue",
    },
    {
      id: "dokter",
      title: "Dokter Gigi",
      desc: "Periksa pasien & isi rekam medis",
      icon: Stethoscope,
      badge: "Medis",
      color: "border-purple-300 bg-purple-50/50 text-purple-800",
      activeBg: "border-purple-600 bg-purple-50 ring-2 ring-purple-600",
    },
    {
      id: "resepsionis",
      title: "Resepsionis",
      desc: "Konfirmasi janji & kelola antrean",
      icon: Users,
      badge: "Front Desk",
      color: "border-blue-300 bg-blue-50/50 text-blue-800",
      activeBg: "border-blue-600 bg-blue-50 ring-2 ring-blue-600",
    },
    {
      id: "super_admin",
      title: "Super Admin",
      desc: "Kelola akun, layanan & laporan",
      icon: ShieldAlert,
      badge: "Manajemen",
      color: "border-amber-300 bg-amber-50/50 text-amber-800",
      activeBg: "border-amber-600 bg-amber-50 ring-2 ring-amber-600",
    },
  ];

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      if (role === "super_admin") router.replace("/admin");
      else if (role === "dokter") router.replace("/dokter");
      else if (role === "resepsionis") router.replace("/resepsionis");
      else router.replace("/beranda");
    }
  }, [user, role, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nama.trim()) {
      setErrorMsg("Nama lengkap wajib diisi.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }
    const cleanHp = noHp.trim();
    if (!/^08\d{8,11}$/.test(cleanHp)) {
      setErrorMsg("Nomor HP harus berupa angka dan diawali 08 (10-13 digit).");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithEmail({
        nama: nama.trim(),
        email: email.trim().toLowerCase(),
        password,
        noHp: cleanHp,
        role: selectedRole,
      });

      // Redirect ke dashboard sesuai role yang dipilih
      if (selectedRole === "super_admin") router.replace("/admin");
      else if (selectedRole === "dokter") router.replace("/dokter");
      else if (selectedRole === "resepsionis") router.replace("/resepsionis");
      else router.replace("/beranda");
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Email ini sudah terdaftar. Silakan masuk atau gunakan email lain.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("Kata sandi terlalu lemah. Gunakan minimal 6 karakter.");
      } else {
        setErrorMsg(err.message || "Gagal mendaftar akun baru.");
      }
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      // Google sign in defaultnya pasien
    } catch (err) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg("Gagal mendaftar dengan Google: " + err.message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 bg-white p-6 sm:p-10 rounded-3xl border border-gray-200 shadow-lg font-sans">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-rekah-blue-light text-rekah-blue rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-2xl">
          🦷
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Daftar Akun Baru</h1>
        <p className="text-xs sm:text-sm text-rekah-muted mt-1">
          Klinik Gigi Senyum Rekah Semarang — Pilih peran akun yang ingin Anda daftarkan
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* PILIHAN PERAN (ROLE SELECTOR) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Pilih Peran Akun <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roleOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedRole === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSelectedRole(opt.id)}
                  className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                    isSelected
                      ? opt.activeBg
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? "bg-rekah-blue text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-900">{opt.title}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-rekah-blue" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{opt.desc}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-gray-100 text-[11px] text-gray-600 flex items-center gap-1.5">
            <span className="font-semibold text-gray-800">Peran Dipilih:</span>
            <span className="uppercase font-bold text-rekah-blue">
              {roleOptions.find((r) => r.id === selectedRole)?.title}
            </span>
            <span className="text-gray-400">• Langsung masuk ke dasbor yang sesuai setelah mendaftar</span>
          </div>
        </div>

        {/* NAMA LENGKAP */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder={
              selectedRole === "dokter"
                ? "Contoh: drg. Ahmad Fauzi, Sp.KG"
                : selectedRole === "resepsionis"
                ? "Contoh: Maya Resepsionis"
                : selectedRole === "super_admin"
                ? "Contoh: Admin Hendra"
                : "Contoh: Andi Pratama"
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              selectedRole === "dokter"
                ? "dokter.ahmad@senyumrekah.id"
                : selectedRole === "super_admin"
                ? "admin@senyumrekah.id"
                : "nama@email.com"
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
          />
        </div>

        {/* NOMOR HP */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Nomor HP (WhatsApp) <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            required
            value={noHp}
            onChange={(e) => setNoHp(e.target.value)}
            placeholder="081234567890"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
          />
          <p className="text-[11px] text-gray-500 mt-1">Diawali 08 dan hanya angka (10-13 digit).</p>
        </div>

        {/* KATA SANDI */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Kata Sandi <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-rekah-blue text-white font-bold hover:bg-rekah-blue-dark transition shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>
            {isSubmitting
              ? "Mendaftarkan..."
              : `Daftar Sebagai ${roleOptions.find((r) => r.id === selectedRole)?.title}`}
          </span>
        </button>
      </form>

      {/* Pembatas Google */}
      {selectedRole === "pasien" && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">Atau</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition text-sm flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Daftar Cepat dengan Google (Pasien)</span>
          </button>
        </>
      )}

      <p className="mt-6 text-center text-xs text-gray-500">
        Sudah punya akun?{" "}
        <Link href="/masuk" className="text-rekah-blue font-semibold hover:underline">
          Masuk di Sini
        </Link>
      </p>
    </div>
  );
}
