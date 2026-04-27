# 🚀 Panduan Deploy TugasKu

## Step 1: Setup Supabase (Database Gratis)

1. Buka https://supabase.com dan daftar/login
2. Klik **New Project**, isi nama project (misal: `tugasku`)
3. Pilih region terdekat: **Southeast Asia (Singapore)**
4. Tunggu project selesai dibuat (~2 menit)
5. Masuk ke **SQL Editor** (sidebar kiri)
6. Klik **New Query**, paste isi file `supabase-schema.sql`, lalu klik **Run**
7. Buka **Settings > API**, catat:
   - `Project URL` → ini yang dipakai di `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → ini yang dipakai di `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2: Upload ke GitHub

1. Buat repo baru di https://github.com/new
2. Di terminal/folder project:
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git remote add origin https://github.com/USERNAME/tugasku.git
   git push -u origin main
   ```

---

## Step 3: Deploy ke Vercel

1. Buka https://vercel.com dan login (bisa pakai GitHub)
2. Klik **Add New > Project**
3. Import repo `tugasku` dari GitHub
4. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` → paste Project URL dari Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → paste anon key dari Supabase
5. Klik **Deploy** dan tunggu selesai (~2 menit)
6. Website kamu langsung bisa diakses di `https://tugasku.vercel.app` (atau nama lainnya)

---

## Fitur Aplikasi

- ✅ Tambah tugas dengan nama, deadline, tipe (teori/praktikum)
- ✅ Link pengumpulan yang bisa diklik langsung
- ✅ Detail soal/tugas dan deskripsi
- ✅ Screenshot via URL gambar (upload ke Imgur/ImgBB dulu)
- ✅ Tandai tugas selesai/belum selesai
- ✅ Filter berdasarkan status, tipe, dan pencarian
- ✅ Indikator deadline (merah = terlambat, oranye = hari ini, kuning = 2 hari lagi)
- ✅ Responsive — works di HP dan desktop
- ✅ Data tersimpan di Supabase, bisa diakses dari mana saja

---

## Tips Upload Screenshot

Karena tidak ada storage khusus, gunakan layanan gratis:
- **Imgur**: https://imgur.com/upload → upload → klik kanan gambar → "Copy image address"
- **ImgBB**: https://imgbb.com → upload → copy "Direct link"

Paste linknya di kolom "URL Screenshot" saat tambah tugas.

---

## Update Aplikasi

Setiap kali push ke GitHub, Vercel otomatis re-deploy. Tinggal:
```bash
git add .
git commit -m "update"
git push
```
