// hooks/useDeadlineNotifications.ts
'use client';

import { useEffect } from 'react';
import { checkAndNotifyDeadlines } from '@/lib/notifications';

interface Task {
  id?: string;
  nama_tugas: string;
  deadline: string;
  selesai: boolean;
}

/**
 * Hook ini dipanggil di komponen utama yang punya daftar tasks.
 * Otomatis cek deadline dan kirim notifikasi saat tasks berubah.
 */
export function useDeadlineNotifications(tasks: Task[]) {
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    // Sedikit delay biar halaman selesai load dulu
    const timer = setTimeout(() => {
      checkAndNotifyDeadlines(tasks, 48); // notif kalau <= 48 jam lagi
    }, 2000);
    return () => clearTimeout(timer);
  }, [tasks]);
}
