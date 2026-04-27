import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyTugasGwejh - Daftar Tugas Kelas",
  description: "Pantau deadline tugas kelas",
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
