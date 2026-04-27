export type Task = {
  id: string;
  nama_tugas: string;
  deadline: string;
  tipe: "teori" | "praktikum";
  link_pengumpulan: string | null;
  soal: string | null;
  deskripsi: string | null;
  screenshot_url: string | null;
  selesai: boolean;
  created_at: string;
  updated_at: string;
};
