"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getJanjiByPasien } from "@/lib/services/janjiService";
import { getAllUsers } from "@/lib/services/userService";
import { getAllLayanan } from "@/lib/services/layananService";
import { Calendar, Clock, Plus, ArrowRight, User } from "lucide-react";

export default function DaftarJanjiPasienPage() {
  const { user } = useAuth();
  const [janjiList, setJanjiList] = useState([]);
  const [dokterMap, setDokterMap] = useState({});
  const [layananMap, setLayananMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJanji() {
      if (!user) return;
      try {
        setLoading(true);
        const [list, dokters, layanans] = await Promise.all([
          getJanjiByPasien(user.uid),
          getAllUsers(),
          getAllLayanan(),
        ]);

        const dMap = {};
        dokters.forEach((d) => { dMap[d.id] = d.nama || d.email; });

        const lMap = {};
        layanans.forEach((l) => { lMap[l.id] = l.nama; });

        setDokterMap(dMap);
        setLayananMap(lMap);
        setJanjiList(list);
      } catch (err) {
        console.error("Error loading janji list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJanji();
  }, [user]);

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

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Janji Saya</h1>
            <p className="text-sm text-rekah-muted">
              Daftar seluruh janji temu Anda, diurutkan dari tanggal terdekat
            </p>
          </div>

          <Link
            href="/janji/baru"
            className="px-4 py-2.5 rounded-xl bg-rekah-blue text-white text-sm font-medium hover:bg-rekah-blue-dark transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Janji Baru</span>
          </Link>
        </div>

        {/* Tabel Janji */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-xs text-rekah-muted">Memuat daftar janji temu...</p>
            </div>
          ) : janjiList.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">Belum ada riwayat janji temu</p>
              <p className="text-xs text-rekah-muted mt-1">
                Jadwalkan kunjungan pertama Anda sekarang.
              </p>
              <Link
                href="/janji/baru"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rekah-blue text-white text-xs font-medium hover:bg-rekah-blue-dark transition"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Janji</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Tanggal</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Jam</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Dokter</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Layanan</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase text-gray-600">Rincian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {janjiList.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900 tabular-nums">
                        {j.tanggal}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium tabular-nums">
                        {j.jam} WIB
                      </td>
                      <td className="px-6 py-4 text-gray-800">
                        {dokterMap[j.dokterId] || "Dokter Gigi"}
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {layananMap[j.layananId] || "Layanan Gigi"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(j.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/janji/${j.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rekah-blue hover:underline"
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
