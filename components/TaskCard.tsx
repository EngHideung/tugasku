'use client'

import { useState } from 'react'
import { Task } from '@/types'
import {
  Calendar,
  Link2,
  BookOpen,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { format, differenceInDays, isPast, isToday } from 'date-fns'
import { id as idLocale } from 'date-fns/locale/id'

interface TaskCardProps {
  task: Task
  onToggle?: (id: string, selesai: boolean) => void
  onDelete?: (id: string) => void
}

function getDeadlineStatus(deadline: string) {
  const d = new Date(deadline)
  if (isPast(d) && !isToday(d)) return 'overdue'
  if (isToday(d)) return 'today'
  const diff = differenceInDays(d, new Date())
  if (diff <= 2) return 'urgent'
  return 'normal'
}

const statusConfig = {
  overdue: { label: 'Terlambat', cls: 'bg-red-100 text-red-700 border-red-200' },
  today: { label: 'Hari ini!', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  urgent: { label: 'Segera', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  normal: { label: '', cls: '' },
}

export default function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const deadlineStatus = getDeadlineStatus(task.deadline)

  const formattedDeadline = format(new Date(task.deadline), 'EEEE, d MMMM yyyy • HH:mm', { locale: idLocale })
  const daysLeft = differenceInDays(new Date(task.deadline), new Date())

  return (
    <div
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-md ${
        task.selesai
          ? 'border-gray-200 opacity-60'
          : deadlineStatus === 'overdue'
          ? 'border-red-200 shadow-sm shadow-red-50'
          : deadlineStatus === 'today'
          ? 'border-orange-200 shadow-sm shadow-orange-50'
          : 'border-gray-200 hover:border-blue-200'
      }`}
    >
      {/* Top accent bar */}
      {!task.selesai && (
        <div
          className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
            deadlineStatus === 'overdue'
              ? 'bg-red-400'
              : deadlineStatus === 'today'
              ? 'bg-orange-400'
              : deadlineStatus === 'urgent'
              ? 'bg-yellow-400'
              : 'bg-blue-400'
          }`}
        />
      )}

      <div className="p-5 pt-6">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Checkbox - hanya tampil kalau onToggle ada */}
          {onToggle ? (
            <button
              onClick={() => onToggle(task.id, !task.selesai)}
              className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
              title={task.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
            >
              {task.selesai ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
          ) : (
            /* Icon status read-only */
            <div className="mt-0.5 flex-shrink-0">
              {task.selesai ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : deadlineStatus === 'overdue' ? (
                <Circle className="w-5 h-5 text-red-400" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300" />
              )}
            </div>
          )}

          {/* Title & badges */}
          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-gray-900 leading-snug ${
                task.selesai ? 'line-through text-gray-400' : ''
              }`}
            >
              {task.nama_tugas}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {/* Tipe */}
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                  task.tipe === 'praktikum'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {task.tipe === 'praktikum' ? (
                  <FlaskConical className="w-3 h-3" />
                ) : (
                  <BookOpen className="w-3 h-3" />
                )}
                {task.tipe === 'praktikum' ? 'Praktikum' : 'Teori'}
              </span>

              {/* Deadline status badge */}
              {!task.selesai && deadlineStatus !== 'normal' && (
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusConfig[deadlineStatus].cls}`}
                >
                  {statusConfig[deadlineStatus].label}
                </span>
              )}

              {task.selesai && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                  ✓ Selesai
                </span>
              )}
            </div>
          </div>

          {/* Delete button - hanya tampil kalau onDelete ada */}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="flex-shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              title="Hapus tugas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-1.5 mt-3 ml-8 text-sm text-gray-500">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{formattedDeadline}</span>
          {!task.selesai && !isPast(new Date(task.deadline)) && (
            <span className="text-gray-400">
              ({daysLeft === 0 ? 'hari ini' : `${daysLeft} hari lagi`})
            </span>
          )}
        </div>

        {/* Link pengumpulan */}
        {task.link_pengumpulan && (
          <div className="flex items-center gap-1.5 mt-1.5 ml-8">
            <Link2 className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
            <a
              href={task.link_pengumpulan}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 truncate"
            >
              Link Pengumpulan
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        )}

        {/* Expand toggle */}
        {(task.soal || task.deskripsi || task.screenshot_url) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 mt-3 ml-8 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" /> Sembunyikan detail
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Lihat detail
              </>
            )}
          </button>
        )}

        {/* Expandable detail section */}
        {expanded && (
          <div className="mt-4 ml-8 space-y-4 border-t border-gray-100 pt-4">
            {task.soal && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Soal / Tugas
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                  {task.soal}
                </p>
              </div>
            )}

            {task.deskripsi && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Deskripsi
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {task.deskripsi}
                </p>
              </div>
            )}

            {task.screenshot_url && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Screenshot
                </p>
                <a href={task.screenshot_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={task.screenshot_url}
                    alt="Screenshot tugas"
                    className="rounded-xl border border-gray-200 max-h-64 object-contain hover:opacity-90 transition-opacity cursor-zoom-in"
                  />
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
