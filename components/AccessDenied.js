"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

export default function AccessDenied({ message }) {
  const router = useRouter();
  const { role } = useAuth();

  const getHomeRoute = () => {
    switch (role) {
      case "super_admin":
        return "/admin";
      case "dokter":
        return "/dokter";
      case "resepsionis":
        return "/resepsionis";
      case "pasien":
      default:
        return "/beranda";
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 shadow-md p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
        
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {message || "Maaf, Anda tidak memiliki izin untuk membuka halaman ini. Halaman ini hanya diperuntukkan bagi peran tertentu di Klinik Senyum Rekah."}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <Link
            href={getHomeRoute()}
            className="px-4 py-2.5 rounded-lg bg-rekah-blue text-white text-sm font-medium hover:bg-rekah-blue-dark transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Ke Halaman Utama</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
