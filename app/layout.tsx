import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MyTugas — Track Tugas',
  description: 'Aplikasi tracking tugas kuliah/sekolah yang simpel dan cepat',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  )
}
