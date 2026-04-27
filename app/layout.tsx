import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TugasKu - Daftar Tugas Kelas",
  description: "Pantau deadline tugas kelas kamu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
