"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getUserById, updateUserRole, toggleUserActive } from "@/lib/services/userService";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  Save,
  Power,
} from "lucide-react";

export default function UbahPenggunaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { user: currentUser } = useAuth();

  const [targetUser, setTargetUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("pasien");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isSelf = currentUser && currentUser.uid === id;

  const fetchUser = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const u = await getUserById(id);
      if (!u) {
        setTargetUser(null);
        return;
      }
      setTargetUser(u);
      setSelectedRole(u.role || "pasien");
    } catch (err) {
      console.error("Error loading user:", err);
      setErrorMsg("Gagal memuat pengguna: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validasi PRD 4.13: Bu Ratna tidak bisa menurunkan peran akunnya sendiri
    if (isSelf && selectedRole !== "super_admin") {
      setErrorMsg("Anda tidak bisa menurunkan peran akun Anda sendiri dari Super Admin.");
      return;
    }

    setIsSaving(true);
    try {
      await updateUserRole(id, selectedRole);
      setSuccessMsg(`Peran pengguna berhasil diubah menjadi ${selectedRole.toUpperCase()}.`);
      await fetchUser();
    } catch (err) {
      console.error("Error updating role:", err);
      setErrorMsg("Gagal mengubah peran: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    // Validasi PRD 4.13: Bu Ratna tidak bisa menonaktifkan akunnya sendiri
    if (isSelf) {
      alert("Anda tidak bisa menonaktifkan akun Anda sendiri!");
      return;
    }

    const actionText = targetUser.aktif ? "menonaktifkan" : "mengaktifkan kembali";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${targetUser.nama || targetUser.email}?`)) {
      return;
    }

    try {
      await toggleUserActive(id, targetUser.aktif);
      setSuccessMsg(`Status akun berhasil diubah menjadi ${!targetUser.aktif ? "AKTIF" : "NONAKTIF"}.`);
      await fetchUser();
    } catch (err) {
      console.error("Error toggling active status:", err);
      setErrorMsg("Gagal mengubah status aktif: " + err.message);
    }
  };

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <div className="max-w-xl mx-auto py-6">
        <Link
          href="/admin/pengguna"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-rekah-blue transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kelola Pengguna</span>
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-rekah-muted mt-2">Memuat rincian akun...</p>
          </div>
        ) : !targetUser ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900">Pengguna Tidak Ditemukan</h2>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-rekah-blue-light text-rekah-blue flex items-center justify-center font-bold text-2xl">
                {targetUser.nama?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{targetUser.nama || "Pengguna"}</h1>
                <p className="text-xs text-rekah-muted">{targetUser.email}</p>
                <div className="mt-1">
                  {targetUser.aktif ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Akun Aktif
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200">
                      Akun Dinonaktifkan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Alerts */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Informasi Akun */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 font-semibold block uppercase">Nomor HP</span>
                <span className="font-bold text-gray-800">{targetUser.noHp || "Belum diisi"}</span>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase">UID Firebase</span>
                <span className="font-mono text-gray-600 truncate block">{targetUser.id}</span>
              </div>
            </div>

            {/* Form Ubah Peran (PRD 4.13) */}
            <form onSubmit={handleSaveRole} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rekah-blue" />
                  <span>Pilih Peran Akun (Role) <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none bg-white text-gray-900"
                >
                  <option value="pasien">Pasien (Akses Beranda, Janji Saya, Riwayat)</option>
                  <option value="resepsionis">Resepsionis (Akses Dasbor, Kelola Janji, Data Pasien)</option>
                  <option value="dokter">Dokter (Akses Dasbor Dokter, Pemeriksaan, Riwayat Pasien)</option>
                  <option value="super_admin">Super Admin (Akses Penuh Semua Modul & Pengaturan)</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Saat pengguna masuk lagi, ia akan otomatis diarahkan ke dasbor perannya masing-masing.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-lg bg-rekah-blue text-white text-sm font-semibold hover:bg-rekah-blue-dark transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan Peran"}</span>
              </button>
            </form>

            {/* Tombol Nonaktifkan Akun (PRD 4.13) */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Status Aktivitas Akun</span>
                <span className="text-[11px] text-gray-500">
                  {targetUser.aktif
                    ? "Akun nonaktif tidak bisa lagi membuka halaman mana pun (PRD 4.13)."
                    : "Aktifkan kembali agar akun dapat login dan menggunakan portal."}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleActive}
                disabled={isSelf}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                  isSelf
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : targetUser.aktif
                    ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{targetUser.aktif ? "Nonaktifkan Akun" : "Aktifkan Akun"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
