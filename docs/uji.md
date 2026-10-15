# Tabel Hasil Pengujian Aplikasi: Portal Janji Senyum Rekah

Dokumen ini disusun untuk memenuhi **Tahap 6: Uji dengan Empat Akun** dan pengujian alur inti pada Tugas Mandiri Sesi 6.

---

## 1. Daftar Akun Uji Coba

| No | Peran (`role`) | Nama Akun | Email Akun Uji | Catatan Hak Akses |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Super Admin** | Bu Ratna | `ratna@senyumrekah.id` | Pemilik klinik, memiliki hak akses penuh ke semua modul |
| 2 | **Resepsionis** | Laras | `laras@senyumrekah.id` | Mengonfirmasi janji, jadwal ulang, batalkan, tandai hadir |
| 3 | **Dokter** | drg. Bima | `bima@senyumrekah.id` | Memeriksa janji miliknya, mengisi tindakan & catatan |
| 4 | **Pasien** | Andi Pratama | `andi@gmail.com` | Membuat janji temu, membatalkan janji, melihat riwayat |

> **Catatan:** Kata sandi seluruh akun uji coba adalah `password123` (minimal 6 karakter sesuai PRD).

---

## 2. Tabel Uji Hak Akses & Route Guard (20 Skenario)

Uji coba dilakukan dengan mengetikkan langsung alamat URL pada kolom pencarian browser (*direct URL navigation*) untuk memverifikasi ketahanan proteksi *route guard*.

| No | Akun Pengguna | Yang Dilakukan | Hasil yang Diharapkan | Hasil Pengujian Nyata | Lolos? |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 1 | Pengunjung (Belum Masuk) | Buka `/beranda` | Dialihkan ke `/masuk?redirectUrl=%2Fberanda` | Dialihkan ke `/masuk` dengan mulus | ☑ |
| 2 | Pengunjung (Belum Masuk) | Buka `/resepsionis` | Dialihkan ke `/masuk?redirectUrl=%2Fresepsionis` | Dialihkan ke `/masuk` dengan mulus | ☑ |
| 3 | Pengunjung (Belum Masuk) | Buka `/dokter` | Dialihkan ke `/masuk?redirectUrl=%2Fdokter` | Dialihkan ke `/masuk` dengan mulus | ☑ |
| 4 | Pengunjung (Belum Masuk) | Buka `/admin` | Dialihkan ke `/masuk?redirectUrl=%2Fadmin` | Dialihkan ke `/masuk` dengan mulus | ☑ |
| 5 | Pasien (`pasien`) | Buka `/beranda` | Halaman beranda terbuka, tampil janji terdekat | Halaman terbuka normal | ☑ |
| 6 | Pasien (`pasien`) | Ketik `/resepsionis` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 7 | Pasien (`pasien`) | Ketik `/dokter` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 8 | Pasien (`pasien`) | Ketik `/admin` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 9 | Resepsionis (`resepsionis`) | Buka `/resepsionis` | Dasbor resepsionis terbuka, tampil janji per dokter | Halaman terbuka normal | ☑ |
| 10 | Resepsionis (`resepsionis`) | Ketik `/beranda` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 11 | Resepsionis (`resepsionis`) | Ketik `/dokter` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 12 | Resepsionis (`resepsionis`) | Ketik `/admin` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 13 | Dokter (`dokter`) | Buka `/dokter` | Dasbor dokter terbuka, tampil janji miliknya hari ini | Halaman terbuka normal | ☑ |
| 14 | Dokter (`dokter`) | Ketik `/beranda` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 15 | Dokter (`dokter`) | Ketik `/resepsionis` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 16 | Dokter (`dokter`) | Ketik `/admin` | Muncul tampilan **Akses Ditolak (403)** | Muncul Akses Ditolak & tombol kembali | ☑ |
| 17 | Super Admin (`super_admin`) | Buka `/admin` | Dasbor admin terbuka, tampil ringkasan kunjungan | Halaman terbuka normal | ☑ |
| 18 | Super Admin (`super_admin`) | Buka `/beranda` | Halaman terbuka (Super Admin berhak akses semua) | Halaman terbuka normal | ☑ |
| 19 | Super Admin (`super_admin`) | Buka `/resepsionis` | Halaman terbuka (Super Admin berhak akses semua) | Halaman terbuka normal | ☑ |
| 20 | Super Admin (`super_admin`) | Buka `/dokter` | Halaman terbuka (Super Admin berhak akses semua) | Halaman terbuka normal | ☑ |

---

## 3. Uji Muat Ulang Halaman (*Page Reload Persistence Test*)

Memverifikasi tidak adanya kedipan layar (*flash of unauthorized content*) atau terlempar keluar saat pengguna menekan tombol F5 / Muat Ulang:

| No | Akun Pengguna | Halaman Diuji | Yang Dilakukan | Hasil yang Diharapkan | Hasil Pengujian Nyata | Lolos? |
| :-: | :--- | :--- | :--- | :--- | :--- | :-: |
| 21 | Pasien | `/beranda` | Tekan Refresh (F5) | Tampil indikator memuat sesaat, lalu tetap di `/beranda` tanpa berkedip Akses Ditolak | Tetap login & halaman tampil sempurna | ☑ |
| 22 | Resepsionis | `/resepsionis` | Tekan Refresh (F5) | Tampil indikator memuat sesaat, lalu tetap di `/resepsionis` tanpa berkedip Akses Ditolak | Tetap login & halaman tampil sempurna | ☑ |
| 23 | Dokter | `/dokter` | Tekan Refresh (F5) | Tampil indikator memuat sesaat, lalu tetap di `/dokter` tanpa berkedip Akses Ditolak | Tetap login & halaman tampil sempurna | ☑ |
| 24 | Super Admin | `/admin` | Tekan Refresh (F5) | Tampil indikator memuat sesaat, lalu tetap di `/admin` tanpa berkedip Akses Ditolak | Tetap login & halaman tampil sempurna | ☑ |

---

## 4. Uji Alur Inti End-to-End (Tahap 7)

Alur inti bisnis klinik gigi Senyum Rekah diuji menggunakan data nyata di Cloud Firestore:

| No | Langkah Alur Inti | Aksi Pengguna | Keterangan & Bukti Firestore | Lolos? |
| :-: | :--- | :--- | :--- | :-: |
| 25 | **Langkah 1: Pasien Buat Janji (4.3.1)** | Pasien Andi masuk &rarr; buka `/janji/baru` &rarr; pilih layanan Scaling, dokter drg. Bima, tanggal esok hari &rarr; pilih slot kosong 10:00 &rarr; isi keluhan &rarr; Kirim. | Dokumen tersimpan di koleksi `janji_temu` (status: `"menunggu"`) dan entri ID yang sama tersimpan di `slot_terisi`. | ☑ |
| 26 | **Langkah 2: Resepsionis Konfirmasi (4.7)** | Resepsionis Laras masuk &rarr; buka `/resepsionis/janji` &rarr; klik janji Andi &rarr; klik tombol **Konfirmasi**. | Status janji di `janji_temu` berubah menjadi `"dikonfirmasi"`. | ☑ |
| 27 | **Langkah 3: Resepsionis Tandai Hadir (4.7)** | Saat hari-H tiba dan pasien tiba di klinik &rarr; Laras klik **Tandai Hadir**. | Status janji berubah menjadi `"hadir"`. Di Dasbor Dokter drg. Bima muncul badge **"Siap diperiksa"**. | ☑ |
| 28 | **Langkah 4: Dokter Isi Pemeriksaan (4.10)** | drg. Bima klik janji Andi di `/dokter` &rarr; halaman `/dokter/janji/[id]` terbuka &rarr; isi tindakan & catatan perawatan &rarr; klik **Tandai Selesai**. | Dokumen `catatan_perawatan` tersimpan di Firestore dan status janji di `janji_temu` menjadi `"selesai"`. | ☑ |
| 29 | **Langkah 5: Pasien Baca Riwayat (4.4)** | Pasien Andi membuka `/riwayat`. | Tindakan medis dan instruksi catatan dokter langsung tampil pada riwayat perawatan Andi. | ☑ |

---

## 5. Uji Batasan Keamanan & Privasi

| No | Skenario Keamanan | Yang Dilakukan | Hasil yang Diharapkan | Hasil Pengujian Nyata | Lolos? |
| :-: | :--- | :--- | :--- | :--- | :-: |
| 30 | Kerahasiaan Catatan Medis (PRD 4.8) | Resepsionis membuka `/resepsionis/janji/[id]` atau `/resepsionis/pasien` | Catatan perawatan dokter **tidak ditampilkan** sama sekali | Catatan medis tersembunyi & aman | ☑ |
| 31 | Isolasi Pasien Dokter Lain (PRD 4.10) | drg. Bima mengetik URL janji temu milik drg. Sinta | Muncul tampilan **"Janji tidak ditemukan"** | Ditolak dengan pesan "Janji tidak ditemukan" | ☑ |
| 32 | Akun Dinonaktifkan (PRD 4.1) | Super Admin menonaktifkan akun &rarr; pengguna mencoba login | Muncul pesan: *"Akun Anda dinonaktifkan. Hubungi klinik."* | Pengguna diblokir masuk | ☑ |
| 33 | Dokumen Tidak Tertimpa (PRD 2.2) | Pengguna login kembali dengan Google untuk kedua kali | Peran dan data yang sudah ada tidak tertimpa/reset | Profil dan role tetap terjaga utuh | ☑ |
| 34 | Bebas Password di Firestore (PRD 2.2) | Cek field di dokumen `users/{uid}` | Tidak ada field kata sandi yang disimpan di Firestore | Hanya nama, email, noHp, role, aktif, dibuatPada | ☑ |
