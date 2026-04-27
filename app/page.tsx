"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Task } from "@/types/task";

type StatusFilter = "semua" | "aktif" | "terlambat" | "selesai";

function getStatus(task: Task): "aktif" | "terlambat" | "selesai" {
  if (task.selesai) return "selesai";
  const now = new Date();
  const deadline = new Date(task.deadline);
  return deadline < now ? "terlambat" : "aktif";
}

function getTimeLeft(deadline: string): string {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  if (diff <= 0) {
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} hari yang lalu`;
    if (hours > 0) return `${hours} jam yang lalu`;
    return "Baru saja lewat";
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} hari lagi`;
  if (hours > 0) return `${hours} jam lagi`;
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} menit lagi`;
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PublicPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("semua");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const fetchTasks = async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("deadline", { ascending: true });
      setTasks(data || []);
      setLoading(false);
    };
    fetchTasks();

    const channel = supabase
      .channel("tasks-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = tasks.filter((t) => {
    if (filter === "semua") return true;
    return getStatus(t) === filter;
  });

  const counts = {
    semua: tasks.length,
    aktif: tasks.filter((t) => getStatus(t) === "aktif").length,
    terlambat: tasks.filter((t) => getStatus(t) === "terlambat").length,
    selesai: tasks.filter((t) => getStatus(t) === "selesai").length,
  };

  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#0d0d0d] sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5c518] flex items-center justify-center">
              <span className="text-black font-black text-sm">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">TugasKu</h1>
              <p className="text-[#666] text-xs mt-0.5">Daftar tugas kelas</p>
            </div>
          </div>
          <a
            href="/admin"
            className="text-xs text-[#444] hover:text-[#666] transition-colors"
          >
            Admin →
          </a>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {(["semua", "aktif", "terlambat", "selesai"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f
                  ? f === "aktif"
                    ? "bg-[#22c55e] text-black"
                    : f === "terlambat"
                    ? "bg-[#ef4444] text-white"
                    : f === "selesai"
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#f5c518] text-black"
                  : "bg-[#1a1a1a] text-[#666] hover:text-[#999]"
              }`}
            >
              {f === "semua" ? "Semua" : f === "aktif" ? "Masih Ada Waktu" : f === "terlambat" ? "Terlambat" : "Selesai"}
              <span className="ml-1.5 opacity-70">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">
              {filter === "aktif" ? "🎉" : filter === "terlambat" ? "✅" : "📭"}
            </div>
            <p className="text-[#444] text-sm">
              {filter === "aktif"
                ? "Tidak ada tugas yang perlu dikerjakan"
                : filter === "terlambat"
                ? "Tidak ada tugas yang terlambat"
                : "Belum ada tugas"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((task) => {
              const status = getStatus(task);
              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 transition-all ${
                    status === "terlambat"
                      ? "border-[#ef4444]/30 bg-[#ef4444]/5"
                      : status === "selesai"
                      ? "border-[#3b82f6]/20 bg-[#1a1a1a] opacity-60"
                      : "border-[#1e1e1e] bg-[#141414] hover:border-[#2a2a2a]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            status === "aktif"
                              ? "bg-[#22c55e]/15 text-[#22c55e]"
                              : status === "terlambat"
                              ? "bg-[#ef4444]/15 text-[#ef4444]"
                              : "bg-[#3b82f6]/15 text-[#3b82f6]"
                          }`}
                        >
                          <span>{status === "aktif" ? "⏳" : status === "terlambat" ? "⚠️" : "✅"}</span>
                          {status === "aktif"
                            ? getTimeLeft(task.deadline)
                            : status === "terlambat"
                            ? getTimeLeft(task.deadline)
                            : "Selesai"}
                        </span>
                        <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                          {task.tipe === "teori" ? "📖 Teori" : "🔬 Praktikum"}
                        </span>
                      </div>
                      <h3
                        className={`font-semibold text-base leading-tight ${
                          status === "selesai" ? "text-[#555] line-through" : "text-white"
                        }`}
                      >
                        {task.nama_tugas}
                      </h3>
                      {task.deskripsi && (
                        <p className="text-[#555] text-sm mt-1 line-clamp-2">{task.deskripsi}</p>
                      )}
                      <p className="text-[#3a3a3a] text-xs mt-2">
                        📅 {formatDeadline(task.deadline)}
                      </p>
                    </div>
                    {task.link_pengumpulan && (
                      <a
                        href={task.link_pengumpulan}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 mt-0.5 px-3 py-1.5 bg-[#f5c518] text-black text-xs font-bold rounded-lg hover:bg-[#f5c518]/90 transition-colors"
                      >
                        Kumpul
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
