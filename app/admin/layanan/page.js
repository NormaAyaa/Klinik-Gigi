"use client";

import React, { useState, useEffect } from "react";
import RouteGuard from "@/components/RouteGuard";
import {
  getAllLayanan,
  createLayanan,
  updateLayanan,
  toggleLayananStatus,
} from "@/lib/services/layananService";
import { seedInitialLayanan } from "@/lib/seedData";
import {
  Sparkles,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Database,
  Clock,
  DollarSign,
  Search,
} from "lucide-react";

export default function AdminLayananPage() {
  const [layananList, setLayananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formNama, setFormNama] = useState("");
  const [formDurasi, setFormDurasi] = useState(30);
  const [formHarga, setFormHarga] = useState("");
  const [formAktif, setFormAktif] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchLayanan = async () => {
    try {
      setLoading(true);
      const data = await getAllLayanan();
      setLayananList(data);
    } catch (err) {
      console.error("Error fetching layanan:", err);
      setErrorMsg("Gagal memuat data layanan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayanan();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormNama("");
    setFormDurasi(30);
    setFormHarga("");
    setFormAktif(true);
    setErrorMsg("");
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormNama(item.nama);
    setFormDurasi(item.durasiMenit);
    setFormHarga(item.harga.toString());
    setFormAktif(item.aktif);
    setErrorMsg("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi PRD 4.14: Durasi kelipatan 30 menit
    const durasi = Number(formDurasi);
    if (durasi <= 0 || durasi % 30 !== 0) {
      setErrorMsg("Durasi layanan harus berupa kelipatan 30 menit (contoh: 30, 60, 90).");
      return;
    }
    const harga = Number(formHarga);
    if (isNaN(harga) || harga < 0) {
      setErrorMsg("Harga layanan harus berupa angka valid.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateLayanan(editingId, {
          nama: formNama,
          durasiMenit: durasi,
          harga: harga,
          aktif: formAktif,
        });
        setSuccessMsg("Layanan berhasil diperbarui.");
      } else {
        await createLayanan({
          nama: formNama,
          durasiMenit: durasi,
          harga: harga,
          aktif: formAktif,
        });
        setSuccessMsg("Layanan baru berhasil ditambahkan.");
      }
      setShowModal(false);
      await fetchLayanan();
    } catch (err) {
      console.error("Save error:", err);
      setErrorMsg("Gagal menyimpan layanan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleLayananStatus(item.id, item.aktif);
      await fetchLayanan();
      setSuccessMsg(`Status layanan "${item.nama}" berhasil diubah.`);
    } catch (err) {
      console.error("Toggle error:", err);
      setErrorMsg("Gagal mengubah status layanan: " + err.message);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      const res = await seedInitialLayanan();
      setSuccessMsg(res.message);
      await fetchLayanan();
    } catch (err) {
      console.error("Seed error:", err);
      setErrorMsg("Gagal mengisi data seed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = layananList.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <RouteGuard allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Layanan Klinik</h1>
            <p className="text-sm text-rekah-muted">
              Atur daftar tindakan, durasi (kelipatan 30 menit), dan tarif harga layanan gigi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSeed}
              className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 shadow-sm"
              title="Isi data layanan awal jika database masih kosong"
            >
              <Database className="w-4 h-4 text-rekah-blue" />
              <span>Muat Data Awal (Seed)</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-lg bg-rekah-blue text-white text-sm font-medium hover:bg-rekah-blue-dark transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Layanan</span>
            </button>
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
            placeholder="Cari layanan gigi..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rekah-blue bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-rekah-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-sm text-rekah-muted">Memuat daftar layanan...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">Belum ada layanan yang tersimpan.</p>
              <button
                onClick={handleSeed}
                className="mt-3 inline-flex items-center gap-2 text-sm text-rekah-blue font-semibold hover:underline"
              >
                Klik di sini untuk mengisi 6 layanan klinik default
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Nama Layanan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Durasi</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Tarif / Harga</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.nama}</td>
                      <td className="px-6 py-4 text-gray-600 tabular-nums">{item.durasiMenit} Menit</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold tabular-nums">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        {item.aktif ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-2.5 py-1 text-xs rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => handleToggle(item)}
                          className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
                            item.aktif
                              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          }`}
                        >
                          {item.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {editingId ? "Ubah Layanan" : "Tambah Layanan Baru"}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Nama Layanan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Contoh: Cabut Gigi"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Durasi (Menit) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formDurasi}
                    onChange={(e) => setFormDurasi(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none bg-white"
                  >
                    <option value={30}>30 Menit</option>
                    <option value={60}>60 Menit</option>
                    <option value={90}>90 Menit</option>
                    <option value={120}>120 Menit</option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">Harus kelipatan 30 menit sesuai PRD.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                    Tarif Harga (Rupiah) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formHarga}
                    onChange={(e) => setFormHarga(e.target.value)}
                    placeholder="250000"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-rekah-blue outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="aktifCheckbox"
                    checked={formAktif}
                    onChange={(e) => setFormAktif(e.target.checked)}
                    className="w-4 h-4 text-rekah-blue rounded border-gray-300 focus:ring-rekah-blue"
                  />
                  <label htmlFor="aktifCheckbox" className="text-sm font-medium text-gray-800">
                    Layanan Aktif (Dapat dipilih pasien)
                  </label>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{errorMsg}</p>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-rekah-blue text-white text-sm font-medium hover:bg-rekah-blue-dark transition shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
