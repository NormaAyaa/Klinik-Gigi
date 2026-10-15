"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { LogIn, AlertCircle } from "lucide-react";

function MasukContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirectUrl");

  const { user, role, userProfile, loginWithEmail, loginWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to appropriate role dashboard
  useEffect(() => {
    if (!loading && user) {
      if (userProfile && userProfile.aktif === false) {
        setErrorMsg("Akun Anda dinonaktifkan. Hubungi klinik.");
        return;
      }
      if (redirectUrl) {
        router.replace(redirectUrl);
      } else {
        const userRole = role || userProfile?.role || "pasien";
        if (userRole === "super_admin") router.replace("/admin");
        else if (userRole === "dokter") router.replace("/dokter");
        else if (userRole === "resepsionis") router.replace("/resepsionis");
        else router.replace("/beranda");
      }
    }
  }, [user, role, userProfile, loading, redirectUrl, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErrorMsg("Email atau kata sandi salah. Silakan coba lagi.");
      } else if (err.code === "auth/too-many-requests") {
        setErrorMsg("Terlalu banyak percobaan gagal. Silakan coba sesaat lagi.");
      } else {
        setErrorMsg(err.message || "Gagal masuk ke akun.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      // redirect handled by useEffect
    } catch (err) {
      console.error("Google sign in error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setErrorMsg("Gagal masuk dengan akun Google: " + err.message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto my-8 bg-white p-6 sm:p-10 rounded-3xl border border-gray-100 shadow-lg font-sans">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-rekah-blue-light text-rekah-blue rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-2xl">
          🦷
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Masuk ke Portal</h1>
        <p className="text-sm text-rekah-muted mt-1">
          Klinik Gigi Senyum Rekah Semarang Center
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
          />
        </div>

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
          className="w-full mt-2 py-2.5 px-4 rounded-lg bg-rekah-blue text-white font-medium hover:bg-rekah-blue-dark transition shadow-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{isSubmitting ? "Memproses..." : "Masuk"}</span>
        </button>
      </form>

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
        <span>Masuk dengan Google</span>
      </button>

      <p className="mt-6 text-center text-xs text-gray-500">
        Belum punya akun?{" "}
        <Link href="/daftar" className="text-rekah-blue font-semibold hover:underline">
          Daftar Pasien Baru
        </Link>
      </p>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Memuat formulir masuk...</div>}>
      <MasukContent />
    </Suspense>
  );
}
