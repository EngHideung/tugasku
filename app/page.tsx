'use client'

import { useState, useEffect, useMemo } from 'react'
import { Task } from '@/types'
import TaskCard from '@/components/TaskCard'
import { createClient } from '@/lib/supabase'
import {
  ListTodo,
  CheckSquare,
  Clock,
  Search,
  BookOpen,
  FlaskConical,
  SlidersHorizontal,
  AlertTriangle,
} from 'lucide-react'

type FilterStatus = 'semua' | 'aktif' | 'terlambat' | 'selesai'
type FilterTipe = 'semua' | 'teori' | 'praktikum'
type SortBy = 'deadline' | 'nama' | 'created'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('aktif')
  const [filterTipe, setFilterTipe] = useState<FilterTipe>('semua')
  const [sortBy, setSortBy] = useState<SortBy>('deadline')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const fetchTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .order('deadline', { ascending: true })
      setTasks(data || [])
      setLoading(false)
    }

    fetchTasks()

    const channel = supabase
      .channel('tasks-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const getTaskStatus = (task: Task): 'aktif' | 'terlambat' | 'selesai' => {
    if (task.selesai) return 'selesai'
    return new Date(task.deadline) < new Date() ? 'terlambat' : 'aktif'
  }

  const filtered = useMemo(() => {
    return tasks
      .filter(t => {
        const status = getTaskStatus(t)
        const matchStatus = filterStatus === 'semua' || status === filterStatus
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
    aktif: tasks.filter(t => getTaskStatus(t) === 'aktif').length,
    terlambat: tasks.filter(t => getTaskStatus(t) === 'terlambat').length,
    selesai: tasks.filter(t => getTaskStatus(t) === 'selesai').length,
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
                <p className="text-xs text-gray-400 mt-0.5">Daftar tugas kelas</p>
              </div>
            </div>
            <a
              href="/admin"
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.aktif}</p>
            <p className="text-xs text-gray-400 mt-0.5">Masih ada waktu</p>
          </div>
          <div className={`rounded-2xl border p-4 text-center ${stats.terlambat > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <p className={`text-2xl font-bold ${stats.terlambat > 0 ? 'text-red-600' : 'text-gray-900'}`}>{stats.terlambat}</p>
            <p className="text-xs text-gray-400 mt-0.5">Terlambat</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.selesai}</p>
            <p className="text-xs text-gray-400 mt-0.5">Selesai</p>
          </div>
        </div>

        {/* Search & Filter */}
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
                <div className="flex gap-2 flex-wrap">
                  {([
                    { value: 'semua', label: 'Semua', icon: <ListTodo className="w-3 h-3" /> },
                    { value: 'aktif', label: 'Aktif', icon: <Clock className="w-3 h-3" /> },
                    { value: 'terlambat', label: 'Terlambat', icon: <AlertTriangle className="w-3 h-3" /> },
                    { value: 'selesai', label: 'Selesai', icon: <CheckSquare className="w-3 h-3" /> },
                  ] as { value: FilterStatus; label: string; icon: React.ReactNode }[]).map(s => (
                    <button key={s.value} onClick={() => setFilterStatus(s.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filterStatus === s.value
                          ? s.value === 'terlambat' ? 'bg-red-600 text-white'
                            : s.value === 'selesai' ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s.icon}{s.label}
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

        {/* Task list */}
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
            <p className="text-sm text-gray-400">
              {tasks.length === 0 ? 'Admin belum menambahkan tugas' : 'Coba ubah filter atau kata kunci pencarian'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 font-medium px-1">{filtered.length} tugas ditampilkan</p>
            {filtered.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
