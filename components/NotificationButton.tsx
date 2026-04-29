// components/NotificationButton.tsx
'use client';

import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
  requestNotificationPermission,
  registerServiceWorker,
} from '@/lib/notifications';

export default function NotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setSupported(true);
      setPermission(Notification.permission);
      // Daftarkan SW saat komponen mount
      registerServiceWorker();
    }
  }, []);

  if (!supported) return null;

  const handleClick = async () => {
    if (permission === 'granted') {
      // Tidak bisa cabut izin lewat JS, arahkan user ke settings
      alert(
        'Untuk mematikan notifikasi, buka pengaturan browser kamu dan blokir notifikasi dari situs ini.'
      );
      return;
    }
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      // Kirim notifikasi test
      new Notification('TugasKu 🎉', {
        body: 'Notifikasi deadline tugas berhasil diaktifkan!',
        icon: '/favicon.ico',
      });
    }
  };

  if (permission === 'denied') {
    return (
      <button
        title="Notifikasi diblokir — ubah di pengaturan browser"
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 text-gray-400 cursor-not-allowed"
        disabled
      >
        <BellOff size={16} />
        <span className="hidden sm:inline">Notifikasi Diblokir</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      title={permission === 'granted' ? 'Notifikasi aktif' : 'Aktifkan notifikasi deadline'}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        permission === 'granted'
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
      }`}
    >
      <Bell size={16} />
      <span className="hidden sm:inline">
        {permission === 'granted' ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
      </span>
    </button>
  );
}
