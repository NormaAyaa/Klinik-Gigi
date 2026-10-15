"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";
import { getAllJanjiTemu } from "@/lib/services/janjiService";
import { getAllUsers } from "@/lib/services/userService";
import { getAllLayanan } from "@/lib/services/layananService";
import {
  Calendar,
  Clock,
  Filter,
  User,
  ArrowRight,
  Search,
} from "lucide-react";

function KelolaJanjiContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStatusFilter = searchParams.get("status") || "semua";
  const initialDateFilter = searchParams.get("tanggal") || "";

  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [dateFilter, setDateFilter] = useState(initialDateFilter);
  const [searchTerm, setSearchTerm] = useState("");

  const [janjiList, setJanjiList] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [layananMap, setLayananMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Sync state to URL params (PRD 4.7: saringan yang dipilih ikut tersimpan di alamat halaman)
  const updateQueryParams = (newStatus, newDate) => {
    const params = new URLSearchParams();
    if (newStatus && newStatus !== "semua") params.set("status", newStatus);
    if (newDate) params.set("tanggal", newDate);
    const queryString = params.toString();
    router.replace(`/resepsionis/janji${queryString ? `?${queryString}` : ""}`);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    updateQueryParams(val, dateFilter);
  };

  const handleDateChange = (val) => {
    setDateFilter(val);
    updateQueryParams(statusFilter, val);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [allJanji, allUsers, allLayanan] = await Promise.all([
          getAllJanjiTemu(),
          getAllUsers(),
          getAllLayanan(),
        ]);

        const uMap = {};
        allUsers.forEach((u) => { uMap[u.id] = u.nama || u.email; });

        const lMap = {};
        allLayanan.forEach((l) => { lMap[l.id] = l.nama; });

        setUserMap(uMap);
        setLayananMap(lMap);
        setJanjiList(allJanji);
      } catch (err) {
        console.error("Error loading janji data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "menunggu":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Menunggu</span>;
      case "dikonfirmasi":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Dikonfirmasi</span>;
      case "hadir":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Hadir</span>;
      case "selesai":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Selesai</span>;
      case "dibatalkan":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  // Filter list
  const filtered = janjiList.filter((item) => {
    if (statusFilter !== "semua" && item.status !== statusFilter) return false;
    if (dateFilter && item.tanggal !== dateFilter) return false;
    if (searchTerm) {
      const pasienName = (userMap[item.pasienId] || "").toLowerCase();
      const dokterName = (userMap[item.dokterId] || "").toLowerCase();
      const layananName = (layananMap[item.layananId] || "").toLowerCase();
      const term = searchTerm.toLowerCase();
      return pasienName.includes(term) || dokterName.includes(term) || layananName.includes(term);
    }
    return true;
  });

  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Janji Temu</h1>
          <p className="text-sm text-rekah-muted">
            Konfirmasi janji baru, jadwal ulang, batalkan dengan alasan, dan tandai kehadiran pasien
          </p>
        </div>

        {/* Filter Bar (PRD 4.7: Saringan status dan tanggal) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
              <Filter className="w-4 h-4 text-rekah-blue" />
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-rekah-blue"
            >
              <option value="semua">Semua Status</option>
              <option value="menunggu">Menunggu Konfirmasi</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="hadir">Hadir di Klinik</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 ml-2">
              <Calendar className="w-4 h-4 text-rekah-blue" />
              <span>Tanggal:</span>
            </div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => handleDateChange(e.target.value)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-rekah-blue"
            />
            {dateFilter && (
              <button
                onClick={() => handleDateChange("")}
                className="text-xs text-rekah-blue hover:underline"
              >
                Reset Tanggal
              </button>
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pasien / dokter..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-rekah-blue bg-white text-gray-900"
            />
          </div>
        </div>

        {/* Tabel Janji Sesuai PRD 4.7: Tanggal, Jam, Pasien, Dokter, Layanan, Status */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-xs text-rekah-muted">Memuat data janji temu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">Tidak ada janji yang cocok dengan saringan</p>
              <p className="text-xs text-rekah-muted mt-1">Coba ubah filter status atau tanggal di atas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Tanggal</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Jam</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Pasien</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Dokter</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Layanan</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase text-gray-600">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900 tabular-nums">
                        {j.tanggal}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium tabular-nums">
                        {j.jam} WIB
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {userMap[j.pasienId] || "Pasien"}
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {userMap[j.dokterId] || "Dokter Gigi"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {layananMap[j.layananId] || "Layanan Gigi"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(j.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/resepsionis/janji/${j.id}`}
                          className="px-3 py-1.5 rounded-lg bg-rekah-blue text-white text-xs font-medium hover:bg-rekah-blue-dark transition inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Buka</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </RouteGuard>
  );
}

export default function KelolaJanjiResepsionisPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Memuat kelola janji...</div>}>
      <KelolaJanjiContent />
    </Suspense>
  );
}
