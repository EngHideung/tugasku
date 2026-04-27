export type TaskType = 'teori' | 'praktikum'

export interface Task {
  id: string
  nama_tugas: string
  deadline: string
  tipe: TaskType
  link_pengumpulan?: string
  soal?: string
  deskripsi?: string
  screenshot_url?: string
  selesai: boolean
  created_at: string
  updated_at: string
}

export interface CreateTaskInput {
  nama_tugas: string
  deadline: string
  tipe: TaskType
  link_pengumpulan?: string
  soal?: string
  deskripsi?: string
  screenshot_url?: string
}
