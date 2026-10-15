"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Calendar,
  Clock,
  User,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Settings,
  Activity,
  ChevronDown,
  Stethoscope,
  PlusCircle,
} from "lucide-react";

export default function Navbar() {
  const { user, userProfile, role, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("logging_out", "true");
      }
      await logout();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/";
    }
  };

  const getRoleBadge = (r) => {
    switch (r) {
      case "super_admin":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">Super Admin</span>;
      case "dokter":
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-300">Dokter</span>;
      case "resepsionis":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">Resepsionis</span>;
      case "pasien":
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">Pasien</span>;
    }
  };

  const isActive = (href) => {
    if (href === "/beranda" || href === "/resepsionis" || href === "/dokter" || href === "/admin" || href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-2 sm:top-3 z-50 w-full px-3 sm:px-6 lg:px-8 transition-all">
      <div className="w-full max-w-[1720px] mx-auto">
        {/* Floating Pill Capsule Navbar (Careplus Medical Design) */}
        <div className="rounded-full bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 sm:px-7 py-2.5 sm:py-3 flex items-center justify-between">
          
          {/* 1. Left: Careplus Medical Brand Logo */}
          <Link
            href={
              user
                ? role === "super_admin"
                  ? "/admin"
                  : role === "dokter"
                  ? "/dokter"
                  : role === "resepsionis"
                  ? "/resepsionis"
                  : "/beranda"
                : "/"
            }
            className="flex items-center space-x-2.5 group cursor-pointer"
          >
            {/* Medical Cross Icon (matching Careplus mockup) */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#20B4A8] to-[#0EA5E9] flex items-center justify-center text-white shadow-md shadow-teal-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                <path d="M10.5 3.5a1.5 1.5 0 0 1 3 0V9h5.5a1.5 1.5 0 0 1 0 3H13.5v5.5a1.5 1.5 0 0 1-3 0V12H5a1.5 1.5 0 0 1 0-3h5.5V3.5z" />
              </svg>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-black text-gray-950 text-sm sm:text-base tracking-tight leading-none">
                CAREPLUS <span className="text-teal-600 font-extrabold text-[10px] sm:text-xs">· SENYUM REKAH</span>
              </span>
              <span className="text-[9px] sm:text-[10px] text-teal-600 font-extrabold tracking-widest uppercase mt-0.5 leading-none">
                MEDICAL CARE
              </span>
            </div>
          </Link>

          {/* 2. Center: Desktop Navigation Links (Home, Services, Departments, Doctors, Contact) */}
          <nav className="hidden md:flex items-center space-x-5 lg:space-x-7">
            {/* Home Link */}
            <Link
              href={user ? "/beranda" : "/"}
              className={`text-xs sm:text-sm font-bold tracking-tight transition ${
                isActive("/beranda") || isActive("/")
                  ? "text-[#20B4A8]"
                  : "text-gray-700 hover:text-[#20B4A8]"
              }`}
            >
              Home
            </Link>

            {/* Role Specific Center Links */}
            {user && role === "dokter" && (
              <Link
                href="/dokter"
                className={`text-xs sm:text-sm font-bold tracking-tight transition flex items-center gap-1 ${
                  isActive("/dokter")
                    ? "text-[#20B4A8]"
                    : "text-gray-700 hover:text-[#20B4A8]"
                }`}
              >
                <span>Dasbor Dokter</span>
              </Link>
            )}

            {user && (role === "pasien" || role === "super_admin") && (
              <Link
                href="/janji"
                className={`text-xs sm:text-sm font-bold tracking-tight transition ${
                  isActive("/janji") && !isActive("/janji/baru")
                    ? "text-[#20B4A8]"
                    : "text-gray-700 hover:text-[#20B4A8]"
                }`}
              >
                Janji Saya
              </Link>
            )}

            {user && (role === "resepsionis" || role === "super_admin") && (
              <Link
                href="/resepsionis"
                className={`text-xs sm:text-sm font-bold tracking-tight transition ${
                  isActive("/resepsionis")
                    ? "text-[#20B4A8]"
                    : "text-gray-700 hover:text-[#20B4A8]"
                }`}
              >
                Dasbor Resepsionis
              </Link>
            )}

            {/* Standard Mockup Links (Services, Departments, Doctors, Contact) */}
            <Link
              href="/beranda#layanan"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#20B4A8] tracking-tight transition"
            >
              Services
            </Link>

            <Link
              href="/beranda#tentang"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#20B4A8] tracking-tight transition"
            >
              Departments
            </Link>

            <Link
              href="/beranda#dokter"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#20B4A8] tracking-tight transition"
            >
              Doctors
            </Link>

            <Link
              href="/beranda#kontak"
              className="text-xs sm:text-sm font-bold text-gray-700 hover:text-[#20B4A8] tracking-tight transition"
            >
              Contact
            </Link>

            {/* Super Admin Menu Dropdown */}
            {user && role === "super_admin" && (
              <div className="relative inline-block text-left">
                <button
                  type="button"
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className={`text-xs sm:text-sm font-bold tracking-tight transition inline-flex items-center gap-1 ${
                    isActive("/admin")
                      ? "text-amber-800 font-black"
                      : "text-gray-700 hover:text-amber-800"
                  }`}
                >
                  <span>Admin Menu</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {adminDropdownOpen && (
                  <div
                    onMouseLeave={() => setAdminDropdownOpen(false)}
                    className="origin-top-left absolute left-0 mt-3 w-52 rounded-2xl shadow-xl bg-white/95 backdrop-blur-md ring-1 ring-black/5 py-1 z-50 divide-y divide-gray-100 border border-gray-100"
                  >
                    <div className="py-1">
                      <Link
                        href="/admin"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Dasbor Ringkasan
                      </Link>
                      <Link
                        href="/admin/pengguna"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Kelola Pengguna
                      </Link>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/admin/layanan"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Kelola Layanan
                      </Link>
                      <Link
                        href="/admin/jadwal-dokter"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Jadwal Dokter
                      </Link>
                      <Link
                        href="/admin/laporan"
                        onClick={() => setAdminDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Laporan Kunjungan
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* 3. Right: Book Appointment Pill Button & User Info */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* User Profile Pill */}
                <Link
                  href="/profil"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-gray-200/80 shadow-xs transition active:scale-95"
                  title="Buka Profil Akun"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#20B4A8] to-[#0EA5E9] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {userProfile?.nama?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-gray-900 max-w-[110px] truncate leading-none">
                      {userProfile?.nama || user.email?.split("@")[0]}
                    </span>
                    <div className="mt-0.5 leading-none">{getRoleBadge(role)}</div>
                  </div>
                </Link>

                {/* Primary Pill Button: Book Appointment (Visible for patients and desktop) */}
                <Link
                  href="/janji/baru"
                  className="hidden md:inline-flex items-center justify-center px-5 py-2 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold text-xs shadow-md shadow-teal-500/25 active:scale-95 transition-all"
                >
                  Book Appointment
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200/80 transition text-xs font-bold active:scale-95 cursor-pointer shadow-xs"
                  title="Keluar dari Portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  href="/masuk"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-gray-700 hover:text-[#20B4A8] transition active:scale-95"
                >
                  Masuk
                </Link>
                <Link
                  href="/janji/baru"
                  className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] hover:from-[#19A397] hover:to-[#0284C7] text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center"
                >
                  Book Appointment
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-500 hover:text-teal-600 hover:bg-gray-100 transition active:scale-95 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* 4. Mobile Menu Dropdown (Floating card below pill) */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-3xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl p-5 space-y-3 animate-fadeIn">
            {user && (
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-gray-950">{userProfile?.nama || user.email}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                {getRoleBadge(role)}
              </div>
            )}

            <div className="space-y-1 text-sm font-bold text-gray-700">
              <Link
                href={user ? "/beranda" : "/"}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
              >
                Home
              </Link>

              {user && role === "dokter" && (
                <Link
                  href="/dokter"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-teal-700 bg-teal-50/50 hover:bg-teal-50 transition"
                >
                  Dasbor Dokter
                </Link>
              )}

              {user && (role === "pasien" || role === "super_admin") && (
                <>
                  <Link
                    href="/janji"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
                  >
                    Janji Saya
                  </Link>
                  <Link
                    href="/riwayat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
                  >
                    Riwayat Perawatan
                  </Link>
                </>
              )}

              {user && (role === "resepsionis" || role === "super_admin") && (
                <>
                  <Link
                    href="/resepsionis"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
                  >
                    Dasbor Resepsionis
                  </Link>
                  <Link
                    href="/resepsionis/janji"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
                  >
                    Kelola Janji
                  </Link>
                  <Link
                    href="/resepsionis/pasien"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
                  >
                    Data Pasien
                  </Link>
                </>
              )}

              {user && role === "super_admin" && (
                <>
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 transition"
                  >
                    Dasbor Admin
                  </Link>
                  <Link
                    href="/admin/pengguna"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 transition"
                  >
                    Kelola Pengguna
                  </Link>
                  <Link
                    href="/admin/layanan"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 transition"
                  >
                    Kelola Layanan
                  </Link>
                  <Link
                    href="/admin/jadwal-dokter"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-amber-800 hover:bg-amber-50 transition"
                  >
                    Jadwal Praktik Dokter
                  </Link>
                </>
              )}

              <Link
                href="/beranda#layanan"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
              >
                Services
              </Link>
              <Link
                href="/beranda#tentang"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
              >
                Departments
              </Link>
              <Link
                href="/beranda#dokter"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
              >
                Doctors
              </Link>
              <Link
                href="/beranda#kontak"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-[#20B4A8] transition"
              >
                Contact
              </Link>
            </div>

            <div className="pt-2">
              <Link
                href="/janji/baru"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-[#20B4A8] to-[#0EA5E9] text-white font-bold text-xs text-center shadow-md flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>
            </div>

            {user && (
              <div className="pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Akun</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
