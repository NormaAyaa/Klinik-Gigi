"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getAllUsers, updateUserRole, toggleUserActive } from "@/lib/services/userService";
import {
  Users,
  Search,
  UserCheck,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

export default function KelolaPenggunaPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
      setErrorMsg("Gagal memuat pengguna: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Super Admin</span>;
      case "dokter":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">Dokter</span>;
      case "resepsionis":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">Resepsionis</span>;
      case "pasien":
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Pasien</span>;
    }
  };

  const filtered = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const nama = (u.nama || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const role = (u.role || "").toLowerCase();
    return nama.includes(term) || email.includes(term) || role.includes(term);
  });

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Pengguna</h1>
            <p className="text-sm text-rekah-muted">
              Ubah peran pengguna (Dokter, Resepsionis, Pasien) dan kelola status aktif akun
            </p>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-xs text-emerald-600 hover:underline">Tutup</button>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg("")} className="text-xs text-red-600 hover:underline">Tutup</button>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, email, atau peran..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue bg-white text-gray-900"
          />
        </div>

        {/* Tabel Pengguna Sesuai PRD 4.13: Nama, Email, Peran, Status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-xs text-rekah-muted">Memuat daftar pengguna...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Nama Pengguna</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Peran Akun</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((u) => {
                    const isSelf = currentUser && currentUser.uid === u.id;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-rekah-blue-light text-rekah-blue flex items-center justify-center font-bold text-xs">
                            {u.nama?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <span>{u.nama || "Pengguna"}</span>
                            {isSelf && (
                              <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">
                                Akun Anda
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                        <td className="px-6 py-4">
                          {u.aktif ? (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Aktif
                            </span>
                          ) : (
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-200">
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/pengguna/${u.id}`}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition inline-flex items-center gap-1 shadow-sm"
                          >
                            <span>Ubah Peran / Status</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}
