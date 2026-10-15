# Rancangan Hak Akses dan Peta Route: Portal Janji Senyum Rekah

Dokumen ini disusun sebagai Tahap 1 Tugas Mandiri Sesi 6 untuk aplikasi **Portal Janji Senyum Rekah (janji.senyumrekah.id)** mengacu pada PRD versi 1.0.

---

## 1. Matriks Akses

Keterangan simbol:
- `✓` : Memiliki akses penuh atau dapat melihat/mengelola seluruh data pada fitur tersebut.
- `✓ milik sendiri` : Hanya dapat melihat atau mengelola data milik akun pengguna sendiri.
- `✕` : Tidak memiliki akses / fitur tidak ditampilkan sama sekali.

| Fitur (Subbab PRD) | Pengunjung | Pasien (`pasien`) | Resepsionis (`resepsionis`) | Dokter (`dokter`) | Super Admin (`super_admin`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Daftar & Masuk Akun** (4.1) | ✓ | ✕ *(dialihkan)* | ✕ *(dialihkan)* | ✕ *(dialihkan)* | ✕ *(dialihkan)* |
| **Melihat Janji Terdekat** (4.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| **Membuat Janji Temu** (4.3.1) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| **Melihat Daftar & Rincian Janji** (4.3.2) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| **Membatalkan Janji Pasien** (4.3.2) | ✕ | ✓ milik sendiri (H-1) | ✕ | ✕ | ✓ |
| **Melihat Riwayat Perawatan Selesai** (4.4) | ✕ | ✓ milik sendiri | ✕ | ✕ | ✓ |
| **Melihat & Mengubah Profil Sendiri** (4.5) | ✕ | ✓ milik sendiri | ✓ milik sendiri | ✓ milik sendiri | ✓ milik sendiri |
| **Dasbor Resepsionis** (4.6) | ✕ | ✕ | ✓ | ✕ | ✓ |
| **Melihat Semua Janji & Saringan** (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| **Konfirmasi Janji Pasien** (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| **Jadwal Ulang Janji** (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| **Batalkan Janji dengan Alasan** (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| **Tandai Kehadiran Pasien** (4.7) | ✕ | ✕ | ✓ | ✕ | ✓ |
| **Melihat Kontak Data Pasien** (4.8) | ✕ | ✕ | ✓ *(tanpa catatan medis)* | ✕ | ✓ |
| **Dasbor Dokter (Jadwal Hari Ini)** (4.9) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| **Mengisi Pemeriksaan & Catatan Perawatan** (4.10) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| **Menandai Pemeriksaan Selesai** (4.10) | ✕ | ✕ | ✕ | ✓ milik sendiri | ✓ |
| **Melihat Riwayat Pasien Tertangani** (4.11) | ✕ | ✕ | ✕ | ✓ pasien yang ditangani | ✓ |
| **Dasbor Admin (Statistik & Ringkasan)** (4.12) | ✕ | ✕ | ✕ | ✕ | ✓ |
| **Kelola Pengguna & Ubah Peran** (4.13) | ✕ | ✕ | ✕ | ✕ | ✓ |
| **Nonaktifkan Akun Pengguna** (4.13) | ✕ | ✕ | ✕ | ✕ | ✓ |
| **Kelola Layanan Klinik** (4.14) | ✕ | ✕ | ✕ | ✕ | ✓ |
| **Kelola Jadwal Praktik Dokter** (4.15) | ✕ | ✕ | ✕ | ✕ | ✓ |
| **Melihat Laporan Bulanan** (4.16) | ✕ | ✕ | ✕ | ✕ | ✓ |

---

## 2. Peta Route (Route Map)

Setiap route dilindungi oleh Route Guard di sisi klien:
- **Belum Masuk:** Dialihkan ke `/masuk?redirectUrl=[alamat]`.
- **Peran Lain:** Menampilkan layar **Akses Ditolak** (403) yang ramah pengguna dengan tombol kembali.
- **Super Admin (`super_admin`):** Diizinkan membuka seluruh halaman di semua kelompok peran.

| Halaman | Alamat (URL) | Peran yang Boleh Membuka | Belum Masuk | Peran Lain |
| :--- | :--- | :--- | :--- | :--- |
| **Daftar Akun** | `/daftar` | Pengunjung (Semua sebelum login) | Buka halaman | Dialihkan ke halaman peran |
| **Masuk Akun** | `/masuk` | Pengunjung (Semua sebelum login) | Buka halaman | Dialihkan ke halaman peran |
| **Beranda Pasien** | `/beranda` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Daftar Janji Saya** | `/janji` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Buat Janji Temu** | `/janji/baru` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Rincian Janji Saya** | `/janji/[id]` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Riwayat Perawatan** | `/riwayat` | `pasien`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Profil Pengguna** | `/profil` | `pasien`, `resepsionis`, `dokter`, `super_admin` | Dialihkan ke `/masuk` | *(Semua peran punya profil)* |
| **Dasbor Resepsionis** | `/resepsionis` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Kelola Janji** | `/resepsionis/janji` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Rincian Janji (Resepsionis)** | `/resepsionis/janji/[id]` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Data Pasien** | `/resepsionis/pasien` | `resepsionis`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Dasbor Dokter** | `/dokter` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Pemeriksaan Pasien** | `/dokter/janji/[id]` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Riwayat Pasien Tertangani** | `/dokter/pasien/[id]` | `dokter`, `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Dasbor Admin** | `/admin` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Kelola Pengguna** | `/admin/pengguna` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Rincian/Ubah Pengguna** | `/admin/pengguna/[id]` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Kelola Layanan** | `/admin/layanan` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Kelola Jadwal Dokter** | `/admin/jadwal-dokter` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |
| **Laporan Kunjungan** | `/admin/laporan` | `super_admin` | Dialihkan ke `/masuk` | Akses Ditolak |

---

## 3. Keputusan Wajib Berdasarkan PRD

### 1. Bolehkah resepsionis membaca catatan perawatan?
**Jawaban:** **TIDAK BOLEH.**  
**Dasar PRD:**
- **PRD Bab 1 poin ke-5:** *"Catatan perawatan tetap rahasia. Resepsionis tidak bisa membacanya, dan dokter hanya membaca catatan pasien yang ia tangani."*
- **PRD Bab 2.3 (Tabel Hak Akses per Modul):** Modul Riwayat Perawatan bagi Resepsionis berstatus *"Tidak tampil"*.
- **PRD Bab 2.4 (Tabel Yang Tidak Boleh Dilihat):** Data Catatan perawatan bagi Resepsionis bertanda tebal: **Tidak tampil**.
- **PRD Bab 4.7:** *"Rincian untuk resepsionis tidak menampilkan catatan perawatan."*
- **PRD Bab 4.8 (Batasan v1):** *"Resepsionis tidak bisa membaca catatan perawatan dari halaman mana pun."*

---

### 2. Bolehkah drg. Bima membuka pemeriksaan janji drg. Sinta?
**Jawaban:** **TIDAK BOLEH.**  
**Dasar PRD:**
- **PRD Bab 2.3:** Dasbor Dokter dan Pemeriksaan hanya *"Penuh, hanya janji miliknya"*.
- **PRD Bab 2.4:** Data Janji pasien lain bagi Dokter: *"Hanya janji yang ia tangani"*.
- **PRD Bab 4.9:** *"Hanya janji dengan dokterId miliknya yang tampil. Janji drg. Sinta tidak terlihat oleh drg. Bima."*
- **PRD Bab 4.10 (Validasi Pemeriksaan):** *"Hanya janji milik dokter itu yang berstatus Hadir yang bisa diisi. Bila ID diganti dengan janji dokter lain, tampil 'Janji tidak ditemukan'."*

---

### 3. Bolehkah pasien melihat jam yang sudah terisi pasien lain?
**Jawaban:** **TIDAK BOLEH.**  
**Dasar PRD:**
- **PRD Bab 1 poin ke-1:** *"Janji tidak bentrok lagi. Pasien hanya bisa memilih slot jam yang masih kosong."*
- **PRD Bab 2.4:** Data Janji pasien lain bagi Pasien: bertanda tebal **Tidak tampil**.
- **PRD Bab 4.3.1 (Perilaku Otomatis):** *"Slot yang bertabrakan dengan janji lain dokter itu yang belum dibatalkan tidak ditampilkan. Untuk mengetahuinya, aplikasi membaca koleksi slot_terisi yang hanya berisi dokter, tanggal, jam, dan durasi, tanpa nama atau keluhan pasien."*

---

### 4. Halaman mana saja yang boleh dibuka Bu Ratna?
**Jawaban:** **SEMUA HALAMAN** (seluruh halaman pada keempat kelompok peran aplikasi: Pasien, Resepsionis, Dokter, dan Super Admin).  
**Dasar PRD:**
- **PRD Bab 2.1:** *"Super Admin (Bu Ratna, pemilik klinik): Semua hak tiga peran lain, ditambah mengelola pengguna, layanan, jadwal dokter, dan laporan."*
- **PRD Bab 2.3:** Hak akses Super Admin bertuliskan *"Penuh"* atau *"Lihat"* di setiap modul tanpa perkecualian.
- **PRD Bab 3.1:** *"Super Admin (semua menu peran lain, ditambah) Dasbor Admin, Kelola Pengguna, Layanan, Jadwal Dokter, Laporan."*
- **PRD Bab 4.12:** *"Menu samping Super Admin juga memuat semua menu peran lain."*
