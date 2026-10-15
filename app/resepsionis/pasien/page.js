"use client";

import React, { useState, useEffect } from "react";
import RouteGuard from "@/components/RouteGuard";
import { getUsersByRole } from "@/lib/services/userService";
import { Search, Phone, Mail, User, Users } from "lucide-react";

export default function DataPasienResepsionisPage() {
  const [pasienList, setPasienList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPasien() {
      try {
        setLoading(true);
        const list = await getUsersByRole("pasien", false);
        setPasienList(list);
      } catch (err) {
        console.error("Error loading patient list:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPasien();
  }, []);

  const filtered = pasienList.filter((p) => {
    const term = searchTerm.toLowerCase();
    const nama = (p.nama || "").toLowerCase();
    const email = (p.email || "").toLowerCase();
    const noHp = (p.noHp || "").toLowerCase();
    return nama.includes(term) || email.includes(term) || noHp.includes(term);
  });

  return (
    <RouteGuard allowedRoles={["resepsionis"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pasien</h1>
          <p className="text-sm text-rekah-muted">
            Direktori kontak pasien klinik untuk keperluan konfirmasi dan komunikasi
          </p>
        </div>

        {/* Pencarian (PRD 4.8: Laras mengetik "Andi" untuk mendapat nomor HP-nya) */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Ketik nama atau nomor HP pasien (contoh: Andi)..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue bg-white text-gray-900"
          />
        </div>

        {/* Tabel Data Pasien */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-xs text-rekah-muted">Memuat data pasien...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-gray-700 text-sm">Tidak ada pasien yang ditemukan</p>
              <p className="text-xs text-rekah-muted mt-1">Coba kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Nama Pasien</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Nomor HP (WhatsApp)</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase text-gray-600">Status Akun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-rekah-blue-light text-rekah-blue flex items-center justify-center text-xs font-bold">
                          {p.nama?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                        <span>{p.nama || "Pasien"}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {p.email}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 tabular-nums">
                        {p.noHp ? (
                          <a
                            href={`tel:${p.noHp}`}
                            className="text-rekah-blue hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{p.noHp}</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 italic text-xs">Belum diisi</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {p.aktif ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Aktif
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Catatan Privasi Medis */}
        <div className="text-xs text-gray-400 italic text-center">
          * Catatan perawatan dan rekam medis pasien dilindungi undang-undang privasi dan hanya dapat diakses oleh dokter pemeriksa.
        </div>
      </div>
    </RouteGuard>
  );
}
