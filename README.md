# Portal Janji Senyum Rekah (Klinik Gigi Semarang Center)

Aplikasi web janji temu dan catatan rekam medis perawatan klinik gigi modern dengan 4 peran pengguna (`pasien`, `dokter`, `resepsionis`, `admin`) berbasis **Next.js 14 (App Router)**, **Tailwind CSS**, dan **Firebase (Authentication & Cloud Firestore)**.

---

## 🌐 Tautan Live Demo
- **URL Netlify**: [https://senyumrekah.netlify.app](https://senyumrekah.netlify.app)
- **Status Deploy**: Production Ready (CI/CD via Netlify Next.js Runtime v5)

---

## 🔑 Kredensial Akun Demo (Semua Role)

Anda dapat langsung masuk menggunakan akun demo yang telah disediakan di bawah ini:

| Role / Peran | Nama Akun | Email | Kata Sandi | Halaman Utama / Dasbor |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Super Admin Lilies | `Lilies123@gmail.com` | `Lilies123` | `/admin` |
| **Dokter Gigi** | drg. Norma Suci | `normasucicd@gmail.com` | `Ayacantik18` | `/dokter` |
| **Resepsionis** | Resepsionis Oyen | `Oyen123@gmail.com` | `Oyen123` | `/resepsionis` |
| **Pasien** | Mayang | `Mayang123@gmail.com` | `Mayang123` | `/beranda` atau `/` |

> *Catatan: Anda juga dapat mendaftar akun baru dengan peran apapun secara langsung melalui menu [Daftar Akun](https://senyumrekah.netlify.app/daftar).*

---

## ✨ Fitur Unggulan

1. **Autentikasi Multi-Role & Route Guard**:
   - Pendaftaran dan login dengan pemilihan 4 peran (`pasien`, `dokter`, `resepsionis`, `admin`).
   - Proteksi rute otomatis dengan *RouteGuard* sehingga pengguna diarahkan ke dasbor sesuai peran.
   - Logout yang aman dan langsung kembali ke Beranda utama.
2. **Beranda & Profil Klinik Interaktif**:
   - Tampilan hero modern beresolusi tinggi, informasi fasilitas, jadwal buka klinik Semarang Center (WIB).
   - Menu cepat: Layanan Gigi, Dokter Spesialis, Tarif Transparan, Promo, Before & After, dan Ulasan Pasien.
3. **Pemesanan Janji Temu Pasien**:
   - Pasien dapat memilih layanan gigi, dokter spesialis, tanggal & slot jam praktik dokter secara realtime.
   - Rincian janji temu, riwayat janji, dan pembatalan janji temu.
4. **Dasbor Dokter Gigi**:
   - Melihat daftar pasien terjadwal hari ini, riwayat pemeriksaan, status kehadiran, dan pengisian rekam medis / catatan tindakan.
5. **Dasbor Resepsionis**:
   - Mengelola dan mengonfirmasi janji temu pasien (Menunggu Konfirmasi, Dikonfirmasi, Selesai, Dibatalkan).
   - Validasi status pembayaran (Belum Bayar, Lunas).
6. **Dasbor Super Admin**:
   - Manajemen jadwal praktik dokter per hari dan jam.
   - Kelola katalog tarif & layanan gigi.
   - Manajemen hak akses pengguna (promosi peran, nonaktifkan akun).

---

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repository ini:**
   ```bash
   git clone <URL_REPOSITORY>
   cd "TUGAS MANDIRI 6"
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

4. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

5. **Build produksi:**
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Dokumen Tugas & Referensi
- **`docs/rancangan.md`**: Matriks Akses 5 kolom, Peta Route lengkap, dan jawaban 4 keputusan arsitektur.
- **`docs/PRD.md`**: Product Requirements Document (PRD).
- **`docs/uji.md`**: 34 skenario pengujian 4 akun, reload test, alur end-to-end, dan privasi.
