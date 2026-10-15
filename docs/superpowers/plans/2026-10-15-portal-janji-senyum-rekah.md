# Portal Janji Senyum Rekah Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun aplikasi web klinik gigi Portal Janji Senyum Rekah (janji.senyumrekah.id) berbasis Next.js, Firebase Auth & Firestore dengan 4 peran, route guard tanpa kedip, alur inti terintegrasi, dan dokumentasi lengkap sesuai Instruksi Sesi 6 dan PRD.

**Architecture:** Client-side React Auth Context mengelola state autentikasi dan profil `users/{uid}` dari Firestore. Komponen Route Guard membungkus layout setiap peran untuk menangani loading state, pengalihan login, validasi status aktif, dan proteksi 403. Alur data bisnis dikelola lewat modul service modular yang berinteraksi langsung dengan 6 koleksi Cloud Firestore.

**Tech Stack:** Next.js 14+ (App Router, JavaScript/JSX), Tailwind CSS, Firebase Web SDK (v10 modular: `firebase/app`, `firebase/auth`, `firebase/firestore`), Lucide React.

**Spec:** [docs/superpowers/specs/2026-10-15-portal-janji-senyum-rekah-design.md](file:///d:/BOOTCAMP/PERTEMUAN%206/TUGAS%20MANDIRI%206/docs/superpowers/specs/2026-10-15-portal-janji-senyum-rekah-design.md) dan [docs/rancangan.md](file:///d:/BOOTCAMP/PERTEMUAN%206/TUGAS%20MANDIRI%206/docs/rancangan.md)

## Global Constraints

- Nama koleksi dan field Firestore HARUS mengikuti PRD 7.1 secara eksak (`users`, `layanan`, `jadwal_dokter`, `janji_temu`, `catatan_perawatan`, `slot_terisi`).
- Nilai field `role` hanya boleh salah satu dari: `"pasien"`, `"resepsionis"`, `"dokter"`, atau `"super_admin"`.
- Role awal setiap akun baru yang mendaftar adalah `"pasien"`.
- Tidak boleh menyimpan password/kata sandi di Firestore.
- Durasi layanan adalah kelipatan 30 menit.
- Super Admin (`super_admin`) memiliki hak akses membuka semua halaman di keempat kelompok peran.
- Resepsionis TIDAK BOLEH membaca atau melihat isi catatan perawatan.
- Dokter hanya boleh melihat dan memeriksa janji yang ditugaskan kepadanya (`dokterId`).
- Pasien tidak boleh melihat nama/keluhan janji pasien lain saat memilih slot jam.
- Deployment ke Netlify TIDAK DIKERJAKAN dulu sesuai permintaan pengguna.

## Review Focus

1. **Pemeriksaan status login saat reload:** Route guard harus menampilkan layar memuat tanpa berkedip atau menampilkan "Akses Ditolak" sekilas saat halaman dimuat ulang.
2. **Koleksi `slot_terisi` sinkron dengan `janji_temu`:** Saat janji dibuat, `slot_terisi` dibuat; saat janji dibatalkan, `slot_terisi` dihapus agar jam kembali terbuka.
3. **Akun berstatus `aktif: false`:** Tidak boleh mengakses halaman aplikasi dan harus melihat pesan "Akun Anda dinonaktifkan. Hubungi klinik."
4. **Validasi pembatalan pasien:** Pasien hanya bisa membatalkan janji yang berstatus `menunggu` atau `dikonfirmasi`, maksimal H-1.
5. **Dokumen `users/{uid}` tidak tertimpa:** Login Google kedua kali atau seterusnya tidak boleh mereset field `role` atau field yang sudah diubah.

---

### Task 1: Scaffolding Proyek & Konfigurasi Firebase

**Files:**
- Create: `package.json`, `next.config.mjs`, `tailwind.config.js`, `postcss.config.mjs`
- Create: `.env.local`
- Create: `lib/firebase.js`
- Create: `app/layout.js`, `app/globals.css`

**Interfaces:**
- Produces: `lib/firebase.js` mengekspor `{ app, auth, db, googleProvider }`

- [ ] **Step 1: Setup dependensi proyek Next.js**
  Inisialisasi package.json dengan dependensi: `next`, `react`, `react-dom`, `firebase`, `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss`, `postcss`, `autoprefixer`. Jalankan `npm install`.

- [ ] **Step 2: Konfigurasi Tailwind CSS dan Theme Senyum Rekah**
  Terapkan warna kustom di `tailwind.config.js`: Biru Rekah `#0E7490`, Latar `#F4F7F9`, Status warna (Menunggu `#F59E0B`, Dikonfirmasi `#2563EB`, Hadir `#7C3AED`, Selesai `#15A66A`, Dibatalkan `#E53935`).

- [ ] **Step 3: Konfigurasi `.env.local` & `lib/firebase.js`**
  Isi kunci Firebase dari konfigurasi pengguna:
  `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`.
  Inisialisasi `initializeApp`, `getAuth`, `getFirestore`, dan `GoogleAuthProvider`.

- [ ] **Step 4: Verifikasi build & koneksi**
  Jalankan `npm run build` untuk memverifikasi konfigurasi tidak memiliki syntax error.

---

### Task 2: Auth Context, User Provisioning & Layout Utama

**Files:**
- Create: `lib/context/AuthContext.js`
- Create: `components/Navbar.js`
- Modify: `app/layout.js`
- Create: `app/page.js` (Redirect ke `/masuk` atau beranda peran)
- Create: `app/masuk/page.js`, `app/daftar/page.js`

**Interfaces:**
- Produces: `useAuth()` yang mengembalikan `{ user, userProfile, role, loading, loginWithEmail, registerWithEmail, loginWithGoogle, logout }`.

- [ ] **Step 1: Implementasi `AuthContext.js`**
  Gunakan `onAuthStateChanged`. Bila user login, cari `users/{uid}`. Jika belum ada, buat dokumen dengan: `nama`, `email`, `noHp`, `role: "pasien"`, `aktif: true`, `dibuatPada: serverTimestamp()`. Bila sudah ada, gunakan data yang tersimpan tanpa menimpa.

- [ ] **Step 2: Buat Halaman `/daftar` dan `/masuk`**
  Halaman publik dengan form email/password, tombol masuk Google, dan validasi (email wajib, password >= 6 karakter, noHp diawali 08).
  Setelah masuk sukses, arahkan sesuai peran: `pasien` &rarr; `/beranda`, `resepsionis` &rarr; `/resepsionis`, `dokter` &rarr; `/dokter`, `super_admin` &rarr; `/admin`.

- [ ] **Step 3: Buat Komponen `Navbar.js`**
  Menampilkan logo Klinik Gigi Senyum Rekah, nama pengguna, badge pil peran berwarna, dan tombol Keluar. Menu navigasi ditampilkan sesuai hak akses peran yang aktif.

- [ ] **Step 4: Verifikasi alur auth**
  Uji alur pendaftaran dan login, pastikan profil `users/{uid}` terbentuk dan tidak ditimpa saat re-login.

---

### Task 3: Route Guard & Halaman Penanganan Akses

**Files:**
- Create: `components/RouteGuard.js`
- Create: `components/AccessDenied.js`
- Create: `app/(pasien)/layout.js`
- Create: `app/(resepsionis)/layout.js`
- Create: `app/(dokter)/layout.js`
- Create: `app/(admin)/layout.js`
- Create: `app/profil/page.js`

**Interfaces:**
- Produces: `<RouteGuard allowedRoles={[...]}>` melingkupi setiap subgrup route.

- [ ] **Step 1: Buat Komponen `RouteGuard.js`**
  Jika `loading === true`: tampilkan spinner memuat Senyum Rekah ("Memuat data pengguna...").
  Jika `!user`: arahkan ke `/masuk?redirectUrl=...`.
  Jika `userProfile?.aktif === false`: tampilkan pesan peringatan akun dinonaktifkan.
  Jika `allowedRoles.includes(role) || role === 'super_admin'`: render `children`.
  Jika tidak: render `<AccessDenied />`.

- [ ] **Step 2: Buat Halaman `/profil`**
  Dapat dibuka oleh keempat peran. Menampilkan nama, email (read-only), role (read-only), dan input nomor HP. Pengguna dapat memperbarui nama dan nomor HP miliknya.

---

### Task 4: Layanan Firestore & Data Seeding (Layanan & Jadwal Dokter)

**Files:**
- Create: `lib/services/layananService.js`
- Create: `lib/services/jadwalService.js`
- Create: `lib/services/userService.js`
- Create: `lib/seedData.js`
- Create: `app/admin/layanan/page.js`
- Create: `app/admin/jadwal-dokter/page.js`

**Interfaces:**
- Produces: CRUD layanan (kelipatan 30 menit, harga, status aktif), jadwal dokter per hari (Senin-Sabtu), dan seed script untuk inisialisasi awal.

- [ ] **Step 1: Implementasi `lib/services/layananService.js` & `jadwalService.js`**
  Fungsi Firestore untuk membaca layanan aktif, menambah layanan, mengubah jadwal dokter, dan query jadwal berdasarkan dokter dan hari.

- [ ] **Step 2: Buat UI Kelola Layanan & Jadwal Dokter di Admin**
  Halaman `/admin/layanan` (tambah/edit/nonaktifkan layanan) dan `/admin/jadwal-dokter` (pilih dokter, atur hari, jam mulai, jam selesai).

- [ ] **Step 3: Buat Mekanisme Seed Data Awal**
  Inisialisasi seed data default di Firestore untuk layanan (misal: "Pembersihan Karang Gigi / Scaling" 30 menit Rp 250.000, "Tambal Gigi Komposit" 30 menit Rp 300.000, "Cabut Gigi" 30 menit Rp 250.000).

---

### Task 5: Modul Pasien (Beranda, Janji Temu, Slot Kosong & Riwayat)

**Files:**
- Create: `lib/services/janjiService.js`
- Create: `app/beranda/page.js`
- Create: `app/janji/page.js`
- Create: `app/janji/baru/page.js`
- Create: `app/janji/[id]/page.js`
- Create: `app/riwayat/page.js`

**Interfaces:**
- Produces: Alur pemesanan slot jam non-bentrok, penyimpanan `janji_temu` dan `slot_terisi`, pembatalan H-1, serta riwayat perawatan selesai.

- [ ] **Step 1: Logika Perhitungan Slot Kosong**
  Di `lib/services/janjiService.js`: buat fungsi `getAvailableSlots(dokterId, tanggal, durasiMenit)`. Membaca jadwal dokter di hari tersebut, memotong per 30 menit, membaca `slot_terisi`, dan memfilter jam yang bentrok.

- [ ] **Step 2: Halaman `/janji/baru`**
  Pilih Layanan &rarr; Pilih Dokter & Tanggal (minimal besok H+1) &rarr; Tampilkan slot kosong &rarr; Isi Keluhan &rarr; Simpan janji berstatus `"menunggu"` dan masukkan entri ke `slot_terisi`.

- [ ] **Step 3: Halaman `/beranda`, `/janji`, dan `/janji/[id]`**
  `/beranda`: Janji terdekat + tombol Buat Janji.
  `/janji`: Daftar janji temu dengan badge status warna.
  `/janji/[id]`: Rincian lengkap, tombol "Batalkan Janji" (hanya untuk status menunggu/dikonfirmasi dan tanggal > hari ini). Jika dibatalkan, status jadi `"dibatalkan"` dan dokumen `slot_terisi` dihapus.

- [ ] **Step 4: Halaman `/riwayat`**
  Menampilkan daftar janji yang berstatus `"selesai"` milik pasien, menampilkan Tanggal, Dokter, Layanan, Tindakan, dan Catatan Dokter.

---

### Task 6: Modul Resepsionis (Dasbor, Kelola Janji, Data Pasien)

**Files:**
- Create: `app/resepsionis/page.js`
- Create: `app/resepsionis/janji/page.js`
- Create: `app/resepsionis/janji/[id]/page.js`
- Create: `app/resepsionis/pasien/page.js`

**Interfaces:**
- Produces: Antarmuka resepsionis untuk filter janji, konfirmasi, jadwal ulang, pembatalan dengan alasan, penandaan kehadiran, dan direktori pasien tanpa catatan medis.

- [ ] **Step 1: Halaman Dasbor `/resepsionis`**
  Menampilkan jumlah janji Menunggu Konfirmasi dan janji hari ini dikelompokkan per dokter.

- [ ] **Step 2: Halaman `/resepsionis/janji` & `/resepsionis/janji/[id]`**
  Tabel janji dengan filter status dan tanggal.
  Aksi:
  - Tombol **Konfirmasi** (untuk janji `menunggu` &rarr; `dikonfirmasi`).
  - Tombol **Jadwal Ulang** (pilih tanggal & slot kosong baru).
  - Tombol **Batalkan Janji** (input `alasanBatal`, ubah status ke `dibatalkan`, hapus `slot_terisi`).
  - Tombol **Tandai Hadir** (untuk janji `dikonfirmasi` pada hari-H &rarr; status `hadir`).
  - *Pastikan catatan perawatan tidak ditampilkan di modul resepsionis*.

- [ ] **Step 3: Halaman `/resepsionis/pasien`**
  Daftar kontak pasien (Nama, Email, No HP) dengan input pencarian cepat.

---

### Task 7: Modul Dokter (Dasbor, Pemeriksaan, Riwayat Pasien)

**Files:**
- Create: `lib/services/catatanService.js`
- Create: `app/dokter/page.js`
- Create: `app/dokter/janji/[id]/page.js`
- Create: `app/dokter/pasien/[id]/page.js`

**Interfaces:**
- Produces: Dasbor dokter khusus janji miliknya, form pemeriksaan pasien berstatus hadir, pembuatan `catatan_perawatan`, dan penandaan janji selesai.

- [ ] **Step 1: Halaman Dasbor `/dokter`**
  Menampilkan janji hari ini khusus dokter yang sedang login (`dokterId === user.uid`). Janji berstatus `hadir` diberi tanda jelas *"Siap diperiksa"*.

- [ ] **Step 2: Halaman Pemeriksaan `/dokter/janji/[id]`**
  Hanya dapat dibuka jika `dokterId === user.uid` dan status `hadir`.
  Dokter mengisi `tindakan` dan `catatan`.
  Klik **Tandai Selesai** &rarr; simpan dokumen ke `catatan_perawatan`, perbarui status janji menjadi `"selesai"`.
  Sediakan link/tombol "Lihat riwayat pasien" menuju `/dokter/pasien/[pasienId]`.

- [ ] **Step 3: Halaman `/dokter/pasien/[id]`**
  Menampilkan riwayat tindakan dan catatan pasien yang pernah ditangani oleh dokter yang sedang login.

---

### Task 8: Modul Super Admin (Dasbor, Kelola Pengguna & Laporan)

**Files:**
- Create: `app/admin/page.js`
- Create: `app/admin/pengguna/page.js`
- Create: `app/admin/pengguna/[id]/page.js`
- Create: `app/admin/laporan/page.js`

**Interfaces:**
- Produces: Dasbor statistik kunjungan & janji menunggu, manajemen peran (`pasien`, `resepsionis`, `dokter`, `super_admin`), nonaktifkan pengguna, dan laporan kunjungan per dokter & layanan per bulan.

- [ ] **Step 1: Dasbor `/admin`**
  Kartu ringkasan: Kunjungan Hari Ini, Kunjungan Bulan Ini (dihitung dari status `selesai`), Janji Menunggu Konfirmasi, dan tombol pintas ke seluruh modul.

- [ ] **Step 2: Kelola Pengguna `/admin/pengguna` & `/admin/pengguna/[id]`**
  Daftar seluruh pengguna dengan pencarian. Rincian pengguna memungkinkan Super Admin mengubah peran (`pasien`, `resepsionis`, `dokter`, `super_admin`) dan mengaktifkan/menonaktifkan akun.
  Validasi: Super Admin tidak bisa menonaktifkan atau menurunkan perannya sendiri.

- [ ] **Step 3: Halaman Laporan `/admin/laporan`**
  Filter pemilihan bulan dan tahun. Tabel 1: Jumlah kunjungan per dokter. Tabel 2: Jumlah kunjungan per jenis layanan.

---

### Task 9: Verifikasi Pengujian & Penyusunan Dokumen Uji (`docs/uji.md`)

**Files:**
- Create: `docs/uji.md`

- [ ] **Step 1: Susun Tabel Uji 4 Akun (Minimal 16 Skenario + Uji Reload)**
  Dokumentasikan 16+ skenario uji lengkap dengan hasil pengujian nyata:
  1. Pengunjung buka /beranda &rarr; dialihkan ke /masuk.
  2. Pasien buka /admin &rarr; Akses Ditolak.
  3. Pasien buka /resepsionis &rarr; Akses Ditolak.
  4. Pasien buka /dokter &rarr; Akses Ditolak.
  5. Resepsionis buka /admin &rarr; Akses Ditolak.
  6. Resepsionis buka /dokter &rarr; Akses Ditolak.
  7. Dokter buka /admin &rarr; Akses Ditolak.
  8. Dokter buka /resepsionis &rarr; Akses Ditolak.
  9. Super Admin buka /beranda &rarr; Terbuka.
  10. Super Admin buka /resepsionis &rarr; Terbuka.
  11. Super Admin buka /dokter &rarr; Terbuka.
  12. Super Admin buka /admin &rarr; Terbuka.
  13. Uji reload halaman Pasien di /beranda &rarr; Tetap login, tidak berkedip.
  14. Uji reload halaman Resepsionis di /resepsionis &rarr; Tetap login, tidak berkedip.
  15. Uji reload halaman Dokter di /dokter &rarr; Tetap login, tidak berkedip.
  16. Uji reload halaman Super Admin di /admin &rarr; Tetap login, tidak berkedip.
  17. Uji alur inti: Pembuatan janji &rarr; Konfirmasi & Hadir &rarr; Pemeriksaan Selesai &rarr; Riwayat Pasien.

- [ ] **Step 2: Verifikasi Build & Lintas Route**
  Jalankan `npm run build` dan verifikasi seluruh rute berjalan bebas error.
