'use client'

import { useState, useEffect, useMemo } from 'react'
import { Task, CreateTaskInput } from '@/types'
import TaskCard from '@/components/TaskCard'
import AddTaskModal from '@/components/AddTaskModal'
import {
  Plus,
  ListTodo,
  CheckSquare,
  Clock,
  Search,
  BookOpen,
  FlaskConical,
  SlidersHorizontal,
} from 'lucide-react'

type FilterStatus = 'semua' | 'aktif' | 'selesai'
type FilterTipe = 'semua' | 'teori' | 'praktikum'
type SortBy = 'deadline' | 'nama' | 'created'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('aktif')
  const [filterTipe, setFilterTipe] = useState<FilterTipe>('semua')
  const [sortBy, setSortBy] = useState<SortBy>('deadline')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks')
      const data = await res.json()
      setTasks(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (input: CreateTaskInput) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const newTask = await res.json()
    setTasks(prev => [newTask, ...prev])
  }

  const handleToggle = async (id: string, selesai: boolean) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, selesai } : t)))
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selesai }),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus tugas ini?')) return
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        const matchStatus =
          filterStatus === 'semua' ||
          (filterStatus === 'aktif' && !t.selesai) ||
          (filterStatus === 'selesai' && t.selesai)
        const matchTipe = filterTipe === 'semua' || t.tipe === filterTipe
        const matchSearch =
          !search ||
          t.nama_tugas.toLowerCase().includes(search.toLowerCase()) ||
          (t.soal || '').toLowerCase().includes(search.toLowerCase())
        return matchStatus && matchTipe && matchSearch
      })
      .sort((a, b) => {
        if (sortBy === 'deadline')
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        if (sortBy === 'nama') return a.nama_tugas.localeCompare(b.nama_tugas)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [tasks, filterStatus, filterTipe, search, sortBy])

  const stats = useMemo(() => ({
    aktif: tasks.filter(t => !t.selesai).length,
    selesai: tasks.filter(t => t.selesai).length,
    urgent: tasks.filter(t => {
      if (t.selesai) return false
      const diff = Math.ceil((new Date(t.deadline).getTime() - Date.now()) / 86400000)
      return diff <= 2 && diff >= 0
    }).length,
  }), [tasks])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <ListTodo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-lg leading-none">TugasKu</h1>
                <p className="text-xs text-gray-400 mt-0.5">Track semua tugasmu</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Tugas</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.aktif}</p>
            <p className="text-xs text-gray-400 mt-0.5">Belum selesai</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.selesai}</p>
            <p className="text-xs text-gray-400 mt-0.5">Selesai</p>
          </div>
          <div className={`rounded-2xl border p-4 text-center ${stats.urgent > 0 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
            <p className={`text-2xl font-bold ${stats.urgent > 0 ? 'text-orange-600' : 'text-gray-900'}`}>{stats.urgent}</p>
            <p className="text-xs text-gray-400 mt-0.5">Segera habis</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari tugas..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>

          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</p>
                <div className="flex gap-2">
                  {(['semua', 'aktif', 'selesai'] as FilterStatus[]).map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {s === 'aktif' && <Clock className="w-3 h-3" />}
                      {s === 'selesai' && <CheckSquare className="w-3 h-3" />}
                      {s === 'semua' && <ListTodo className="w-3 h-3" />}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tipe</p>
                <div className="flex gap-2">
                  {(['semua', 'teori', 'praktikum'] as FilterTipe[]).map(t => (
                    <button key={t} onClick={() => setFilterTipe(t)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterTipe === t ? (t === 'praktikum' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {t === 'teori' && <BookOpen className="w-3 h-3" />}
                      {t === 'praktikum' && <FlaskConical className="w-3 h-3" />}
                      {t === 'semua' && <ListTodo className="w-3 h-3" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Urutkan</p>
                <div className="flex gap-2">
                  {(['deadline', 'nama', 'created'] as SortBy[]).map(s => (
                    <button key={s} onClick={() => setSortBy(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sortBy === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {s === 'deadline' ? 'Deadline' : s === 'nama' ? 'Nama A-Z' : 'Terbaru'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-600 mb-1">
              {tasks.length === 0 ? 'Belum ada tugas' : 'Tidak ada tugas ditemukan'}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {tasks.length === 0 ? 'Yuk tambahkan tugas pertamamu!' : 'Coba ubah filter atau kata kunci pencarian'}
            </p>
            {tasks.length === 0 && (
              <button onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Tambah Tugas
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium px-1">{filtered.length} tugas ditampilkan</p>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>

      <button
        onClick={() => setShowModal(true)}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {showModal && <AddTaskModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
    </div>
  )
}
