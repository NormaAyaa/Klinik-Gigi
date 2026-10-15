"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import AccessDenied from "./AccessDenied";
import { AlertTriangle, LogOut } from "lucide-react";

export default function RouteGuard({ allowedRoles = [], children }) {
  const { user, userProfile, role, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      if (typeof window !== "undefined" && sessionStorage.getItem("logging_out")) {
        sessionStorage.removeItem("logging_out");
        window.location.href = "/";
        return;
      }
      // Not logged in -> redirect to /masuk with return URL
      router.replace(`/masuk?redirectUrl=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, pathname, router]);

  // 1. Loading state: Show clean spinner without flickering or deciding anything yet
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-rekah-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-rekah-muted">
          Memeriksa izin akses...
        </p>
      </div>
    );
  }

  // 2. Not logged in yet
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-gray-500">Mengarahkan ke halaman masuk...</p>
      </div>
    );
  }

  // 3. Inactive account (PRD 4.1 & 4.13: "Akun Anda dinonaktifkan. Hubungi klinik.")
  if (userProfile && userProfile.aktif === false) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-amber-200 shadow-md p-6 text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Akun Dinonaktifkan</h2>
          <p className="mt-2 text-sm text-gray-600">
            Akun Anda dinonaktifkan. Hubungi klinik untuk mengaktifkan kembali akun Anda.
          </p>
          <button
            onClick={() => logout()}
            className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Role check: super_admin can open EVERYTHING, or user has one of allowedRoles
  const isAllowed = allowedRoles.length === 0 || role === "super_admin" || allowedRoles.includes(role);

  if (!isAllowed) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
