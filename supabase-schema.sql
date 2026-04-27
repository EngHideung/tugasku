-- Jalankan SQL ini di Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_tugas TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  tipe TEXT NOT NULL CHECK (tipe IN ('teori', 'praktikum')),
  link_pengumpulan TEXT,
  soal TEXT,
  deskripsi TEXT,
  screenshot_url TEXT,
  selesai BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (biar bisa diakses public)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: semua orang bisa baca, tambah, edit, hapus
-- (karena ini public task list, tidak ada auth)
CREATE POLICY "Public access" ON tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Index untuk performa
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_tasks_selesai ON tasks(selesai);
