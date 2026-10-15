"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import RouteGuard from "@/components/RouteGuard";
import { getJanjiByPasien } from "@/lib/services/janjiService";
import { getCatatanByPasien } from "@/lib/services/catatanService";
import { getAllUsers } from "@/lib/services/userService";
import { getAllLayanan } from "@/lib/services/layananService";
import {
  FileText,
  Calendar,
  User,
  Activity,
  CheckCircle2,
  Smile,
} from "lucide-react";

export default function RiwayatPerawatanPasienPage() {
  const { user } = useAuth();
  const [completedList, setCompletedList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRiwayat() {
      if (!user) return;
      try {
        setLoading(true);
        const [allJanji, catatans, dokters, layanans] = await Promise.all([
          getJanjiByPasien(user.uid),
          getCatatanByPasien(user.uid),
          getAllUsers(),
          getAllLayanan(),
        ]);

        const dokterMap = {};
        dokters.forEach((d) => { dokterMap[d.id] = d.nama || d.email; });

        const layananMap = {};
        layanans.forEach((l) => { layananMap[l.id] = l.nama; });

        const catatanMap = {};
        catatans.forEach((c) => {
          catatanMap[c.janjiId] = c;
        });

        // PRD 4.4: Hanya janji berstatus Selesai, dari yang terbaru
        const selesai = allJanji
          .filter((j) => j.status === "selesai")
          .map((j) => ({
            ...j,
            dokterNama: dokterMap[j.dokterId] || "Dokter Gigi",
            layananNama: layananMap[j.layananId] || "Layanan Gigi",
            catatanData: catatanMap[j.id] || null,
          }));

        // Urutkan dari yang terbaru (tanggal descending)
        selesai.sort((a, b) => {
          const tA = `${a.tanggal} ${a.jam}`;
          const tB = `${b.tanggal} ${b.jam}`;
          return tB.localeCompare(tA);
        });

        setCompletedList(selesai);
      } catch (err) {
        console.error("Error loading riwayat perawatan:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRiwayat();
  }, [user]);

  return (
    <RouteGuard allowedRoles={["pasien"]}>
      <div className="w-full space-y-6 py-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Perawatan</h1>
          <p className="text-sm text-rekah-muted">
            Catatan tindakan medis dan instruksi perawatan dari dokter gigi yang telah selesai
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-rekah-muted mt-2">Memuat riwayat kunjungan...</p>
          </div>
        ) : completedList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center shadow-sm">
            <Smile className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-gray-700">Belum ada riwayat perawatan selesai</h2>
            <p className="text-xs text-rekah-muted mt-1 max-w-sm mx-auto">
              Setelah janji temu Anda diperiksa oleh dokter dan ditandai selesai, catatan tindakan dokter akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:border-rekah-blue transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{item.layananNama}</h3>
                      <p className="text-xs text-rekah-muted flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{item.dokterNama}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-800 tabular-nums block">
                      {item.tanggal} · {item.jam} WIB
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                      Selesai
                    </span>
                  </div>
                </div>

                {/* Tindakan & Catatan Dokter Sesuai PRD 4.4 */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                      Tindakan Medis
                    </span>
                    <p className="text-sm font-medium text-gray-900">
                      {item.catatanData?.tindakan || "Pemeriksaan dan tindakan klinis rutin."}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                      Catatan / Pesan Dokter
                    </span>
                    <p className="text-sm text-gray-700 italic">
                      {item.catatanData?.catatan || "Tidak ada catatan khusus."}
                    </p>
                  </div>
                </div>

                {item.keluhan && (
                  <p className="mt-3 text-xs text-gray-400">
                    Keluhan awal: <span className="text-gray-600">{item.keluhan}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
