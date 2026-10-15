"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, Phone, Mail, Shield, CheckCircle2, AlertCircle, Save } from "lucide-react";

export default function ProfilPage() {
  const { user, userProfile, role, refreshProfile } = useAuth();
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (userProfile) {
      setNama(userProfile.nama || "");
      setNoHp(userProfile.noHp || "");
    }
  }, [userProfile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!nama.trim()) {
      setErrorMsg("Nama tidak boleh kosong.");
      return;
    }

    const cleanHp = noHp.trim();
    if (cleanHp && !/^08\d{8,11}$/.test(cleanHp)) {
      setErrorMsg("Nomor HP harus berupa angka dan diawali 08 (10-13 digit).");
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        nama: nama.trim(),
        noHp: cleanHp,
      });
      await refreshProfile();
      setSuccessMsg("Profil berhasil diperbarui!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setErrorMsg("Gagal menyimpan profil: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (r) => {
    switch (r) {
      case "super_admin":
        return "Super Admin (Pemilik Klinik)";
      case "dokter":
        return "Dokter Gigi";
      case "resepsionis":
        return "Resepsionis";
      case "pasien":
      default:
        return "Pasien";
    }
  };

  return (
    <RouteGuard allowedRoles={[]}>
      <div className="max-w-2xl mx-auto py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-rekah-blue-light text-rekah-blue flex items-center justify-center font-bold text-2xl">
              {userProfile?.nama?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-sm text-rekah-muted">
                Perbarui nama dan nomor kontak Anda
              </p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-gray-400" />
                <span>Nama Lengkap</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>Email (Tidak dapat diubah)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>Nomor HP (WhatsApp)</span>
              </label>
              <input
                type="tel"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue text-sm text-gray-900 bg-white"
              />
              <p className="text-[11px] text-gray-500 mt-1">Diawali 08 dan hanya angka.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-gray-400" />
                <span>Peran Akun</span>
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium flex items-center justify-between">
                <span>{getRoleLabel(role)}</span>
                <span className="text-xs text-gray-400">Dikelola Super Admin</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 rounded-lg bg-rekah-blue text-white font-medium hover:bg-rekah-blue-dark transition shadow-sm disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
}
