'use client'

import { useState } from 'react'
import { CreateTaskInput, TaskType } from '@/types'
import { X, Plus, BookOpen, FlaskConical, Calendar, Link2, FileText, Info, Image } from 'lucide-react'

interface AddTaskModalProps {
  onClose: () => void
  onAdd: (task: CreateTaskInput) => Promise<void>
}

export default function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CreateTaskInput>({
    nama_tugas: '',
    deadline: '',
    tipe: 'teori',
    link_pengumpulan: '',
    soal: '',
    deskripsi: '',
    screenshot_url: '',
  })

  const handleSubmit = async () => {
    if (!form.nama_tugas.trim() || !form.deadline) return
    setLoading(true)
    try {
      await onAdd({
        ...form,
        link_pengumpulan: form.link_pengumpulan || undefined,
        soal: form.soal || undefined,
        deskripsi: form.deskripsi || undefined,
        screenshot_url: form.screenshot_url || undefined,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all placeholder-gray-400"
  const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Tambah Tugas Baru</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Nama tugas */}
          <div>
            <label className={labelCls}>Nama Tugas *</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Contoh: Laporan Praktikum Fisika Bab 3"
              value={form.nama_tugas}
              onChange={e => setForm(f => ({ ...f, nama_tugas: e.target.value }))}
            />
          </div>

          {/* Deadline & Tipe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Deadline *</span>
              </label>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Tipe</label>
              <div className="flex gap-2">
                {(['teori', 'praktikum'] as TaskType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, tipe: t }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-xl border transition-all ${
                      form.tipe === t
                        ? t === 'teori'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-purple-600 text-white border-purple-600'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {t === 'teori' ? <BookOpen className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5" />}
                    {t === 'teori' ? 'Teori' : 'Praktikum'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Link pengumpulan */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> Link Pengumpulan</span>
            </label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://classroom.google.com/..."
              value={form.link_pengumpulan}
              onChange={e => setForm(f => ({ ...f, link_pengumpulan: e.target.value }))}
            />
          </div>

          {/* Soal */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Soal / Tugas</span>
            </label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Tulis soal atau deskripsi tugas di sini..."
              value={form.soal}
              onChange={e => setForm(f => ({ ...f, soal: e.target.value }))}
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Catatan Tambahan</span>
            </label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder="Informasi tambahan, catatan, dll..."
              value={form.deskripsi}
              onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
            />
          </div>

          {/* Screenshot URL */}
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1"><Image className="w-3 h-3" /> URL Screenshot</span>
            </label>
            <input
              type="url"
              className={inputCls}
              placeholder="https://i.imgur.com/... atau link gambar"
              value={form.screenshot_url}
              onChange={e => setForm(f => ({ ...f, screenshot_url: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">Upload gambar ke Imgur atau ImgBB dulu, lalu paste linknya di sini</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.nama_tugas.trim() || !form.deadline || loading}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Tambah Tugas
          </button>
        </div>
      </div>
    </div>
  )
}
