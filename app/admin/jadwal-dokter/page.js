"use client";

import React, { useState, useEffect } from "react";
import RouteGuard from "@/components/RouteGuard";
import { getUsersByRole } from "@/lib/services/userService";
import {
  getAllJadwalDokter,
  createJadwalDokter,
  updateJadwalDokter,
  deleteJadwalDokter,
} from "@/lib/services/jadwalService";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
} from "lucide-react";

const HARI_LIST = [
  { id: "senin", label: "Senin" },
  { id: "selasa", label: "Selasa" },
  { id: "rabu", label: "Rabu" },
  { id: "kamis", label: "Kamis" },
  { id: "jumat", label: "Jumat" },
  { id: "sabtu", label: "Sabtu" },
];

export default function AdminJadwalDokterPage() {
  const [dokterList, setDokterList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDokterId, setSelectedDokterId] = useState("");

  // Form state
  const [formHari, setFormHari] = useState("senin");
  const [formJamMulai, setFormJamMulai] = useState("09:00");
  const [formJamSelesai, setFormJamSelesai] = useState("15:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dokters, schedules] = await Promise.all([
        getUsersByRole("dokter", false),
        getAllJadwalDokter(),
      ]);
      setDokterList(dokters);
      setJadwalList(schedules);
      if (dokters.length > 0 && !selectedDokterId) {
        setSelectedDokterId(dokters[0].id);
      }
    } catch (err) {
      console.error("Error fetching jadwal data:", err);
      setErrorMsg("Gagal memuat jadwal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddJadwal = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedDokterId) {
      setErrorMsg("Pilih dokter terlebih dahulu.");
      return;
    }

    // Validasi PRD 4.15: Jam selesai setelah jam mulai
    if (formJamSelesai <= formJamMulai) {
      setErrorMsg("Jam selesai harus lebih akhir daripada jam mulai.");
      return;
    }

    // Validasi PRD 4.15: Satu dokter satu jadwal per hari
    const existing = jadwalList.find(
      (j) => j.dokterId === selectedDokterId && j.hari === formHari
    );
    if (existing) {
      setErrorMsg(`Dokter ini sudah memiliki jadwal pada hari ${formHari.toUpperCase()}. Hapus jadwal lama jika ingin mengganti.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await createJadwalDokter({
        dokterId: selectedDokterId,
        hari: formHari,
        jamMulai: formJamMulai,
        jamSelesai: formJamSelesai,
      });
      setSuccessMsg(`Jadwal hari ${formHari.toUpperCase()} berhasil disimpan.`);
      await fetchData();
    } catch (err) {
      console.error("Add jadwal error:", err);
      setErrorMsg("Gagal menambahkan jadwal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, hari) => {
    if (!confirm(`Hapus jadwal praktik hari ${hari.toUpperCase()}?`)) return;
    try {
      await deleteJadwalDokter(id);
      setSuccessMsg(`Jadwal hari ${hari.toUpperCase()} berhasil dihapus.`);
      await fetchData();
    } catch (err) {
      console.error("Delete jadwal error:", err);
      setErrorMsg("Gagal menghapus jadwal: " + err.message);
    }
  };

  const selectedDokter = dokterList.find((d) => d.id === selectedDokterId);
  const dokterSchedules = jadwalList.filter((j) => j.dokterId === selectedDokterId);

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Jadwal Praktik Dokter</h1>
          <p className="text-sm text-rekah-muted">
            Atur hari (Senin s/d Sabtu) serta jam mulai dan jam selesai praktik untuk setiap dokter gigi
          </p>
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

        {/* Pilih Dokter Selector */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
            Pilih Dokter Gigi
          </label>
          {loading ? (
            <p className="text-sm text-gray-500">Memuat daftar dokter...</p>
          ) : dokterList.length === 0 ? (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
              Belum ada akun dokter gigi di sistem. Silakan daftarkan akun baru lalu ubah perannya menjadi <strong>Dokter</strong> di menu <strong>Kelola Pengguna</strong>.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dokterList.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDokterId(d.id)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 border ${
                    selectedDokterId === d.id
                      ? "bg-rekah-blue text-white border-rekah-blue shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{d.nama || d.email}</span>
                  {!d.aktif && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">(Nonaktif)</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedDokter && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Tambah Jadwal */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-rekah-blue" />
                <span>Tambah Hari Praktik</span>
              </h2>

              <form onSubmit={handleAddJadwal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Hari Praktik <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formHari}
                    onChange={(e) => setFormHari(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none bg-white capitalize"
                  >
                    {HARI_LIST.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Jam Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formJamMulai}
                      onChange={(e) => setFormJamMulai(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                      Jam Selesai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      required
                      value={formJamSelesai}
                      onChange={(e) => setFormJamSelesai(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-lg bg-rekah-blue text-white text-sm font-medium hover:bg-rekah-blue-dark transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}</span>
                </button>
              </form>
            </div>

            {/* List Jadwal Aktif Dokter */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Jadwal Aktif: {selectedDokter.nama || selectedDokter.email}</span>
                <span className="text-xs text-rekah-muted font-normal">{dokterSchedules.length} hari terdaftar</span>
              </h2>

              {dokterSchedules.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Dokter ini belum memiliki jadwal praktik. Tambahkan jadwal di samping.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dokterSchedules.map((j) => (
                    <div
                      key={j.id}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between hover:border-rekah-blue transition"
                    >
                      <div>
                        <p className="font-bold text-gray-900 capitalize text-sm">{j.hari}</p>
                        <p className="text-xs text-rekah-muted flex items-center gap-1 mt-0.5 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-rekah-blue" />
                          <span>{j.jamMulai} - {j.jamSelesai} WIB</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDelete(j.id, j.hari)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
