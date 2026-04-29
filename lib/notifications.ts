// lib/notifications.ts

/**
 * Minta izin notifikasi dari browser.
 * Return: 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  return await Notification.requestPermission();
}

/**
 * Daftarkan service worker.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (e) {
    console.error('SW registration failed:', e);
    return null;
  }
}

/**
 * Kirim notifikasi lokal (tanpa server) untuk tugas yang deadline-nya dekat.
 * Dipanggil saat halaman dibuka.
 */
export function showDeadlineNotification(params: {
  namatugas: string;
  hoursLeft: number;
  taskId?: string;
}) {
  const { namatugas, hoursLeft, taskId } = params;

  if (Notification.permission !== 'granted') return;
  if (!('serviceWorker' in navigator)) return;

  let body = '';
  if (hoursLeft <= 0) {
    body = `⚠️ Sudah lewat deadline!`;
  } else if (hoursLeft <= 24) {
    body = `⏰ Deadline dalam ${Math.round(hoursLeft)} jam lagi!`;
  } else {
    body = `📅 Deadline besok — jangan lupa!`;
  }

  // Gunakan SW jika tersedia, fallback ke Notification biasa
  navigator.serviceWorker.ready
    .then((reg) => {
      reg.showNotification(`📚 ${namatugas}`, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `task-${taskId ?? namatugas}`,
        requireInteraction: true,
        data: { url: '/' },
      } as NotificationOptions);
    })
    .catch(() => {
      // fallback
      new Notification(`📚 ${namatugas}`, { body, icon: '/favicon.ico' });
    });
}

/**
 * Cek semua tugas dan kirim notifikasi untuk yang hampir deadline.
 * hoursThreshold: berapa jam sebelum deadline kita notifik (default 48 jam)
 */
export function checkAndNotifyDeadlines(
  tasks: Array<{ id?: string; nama_tugas: string; deadline: string; selesai: boolean }>,
  hoursThreshold = 48
) {
  if (Notification.permission !== 'granted') return;

  const now = new Date();

  // Biar tidak spam, simpan task yang sudah dinotifikasi hari ini
  const notifiedKey = 'tugasku_notified_' + now.toISOString().slice(0, 10);
  const alreadyNotified: string[] = JSON.parse(
    localStorage.getItem(notifiedKey) ?? '[]'
  );

  const updatedNotified = [...alreadyNotified];

  tasks.forEach((task) => {
    if (task.selesai) return;

    const deadlineDate = new Date(task.deadline);
    const hoursLeft = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Hanya notifikasi yang <= threshold jam ke depan (dan belum lewat lebih dari 1 jam)
    if (hoursLeft > hoursThreshold || hoursLeft < -1) return;

    const taskKey = task.id ?? task.nama_tugas;
    if (alreadyNotified.includes(taskKey)) return;

    showDeadlineNotification({
      namatugas: task.nama_tugas,
      hoursLeft,
      taskId: taskKey,
    });

    updatedNotified.push(taskKey);
  });

  localStorage.setItem(notifiedKey, JSON.stringify(updatedNotified));

  // Bersihkan key lama (> 3 hari)
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('tugasku_notified_') && key !== notifiedKey) {
      localStorage.removeItem(key);
    }
  }
}
