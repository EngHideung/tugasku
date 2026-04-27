"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Task } from "@/types/task";

// =============================================
// GANTI PASSWORD ADMIN DI SINI
const ADMIN_PASSWORD = "komti2024";
// =============================================

type FormData = {
  nama_tugas: string;
  deadline: string;
  tipe: "teori" | "praktikum";
  link_pengumpulan: string;
  deskripsi: string;
  soal: string;
};

const emptyForm: FormData = {
  nama_tugas: "",
  deadline: "",
  tipe: "teori",
  link_pengumpulan: "",
  deskripsi: "",
  soal: "",
};

function getStatus(task: Task): "aktif" | "terlambat" | "selesai" {
  if (task.selesai) return "selesai";
  return new Date(task.deadline) < new Date() ? "terlambat" : "aktif";
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput("");
    }
  };

  useEffect(() => {
    if (!authed) return;
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
      .channel("tasks-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchTasks)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [authed]);

  const handleSubmit = async () => {
    if (!form.nama_tugas || !form.deadline) return;
    setSubmitting(true);
    const supabase = createClient();

    if (editId) {
      await supabase.from("tasks").update({
        nama_tugas: form.nama_tugas,
        deadline: form.deadline,
        tipe: form.tipe,
        link_pengumpulan: form.link_pengumpulan || null,
        deskripsi: form.deskripsi || null,
        soal: form.soal || null,
        updated_at: new Date().toISOString(),
      }).eq("id", editId);
    } else {
      await supabase.from("tasks").insert({
        nama_tugas: form.nama_tugas,
        deadline: form.deadline,
        tipe: form.tipe,
        link_pengumpulan: form.link_pengumpulan || null,
        deskripsi: form.deskripsi || null,
        soal: form.soal || null,
        selesai: false,
      });
    }

    setForm(emptyForm);
    setShowForm(false);
    setEditId(null);
    setSubmitting(false);
  };

  const handleToggleSelesai = async (task: Task) => {
    const supabase = createClient();
    await supabase.from("tasks").update({
      selesai: !task.selesai,
      updated_at: new Date().toISOString(),
    }).eq("id", task.id);
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", id);
    setDeleteConfirm(null);
  };

  const handleEdit = (task: Task) => {
    const deadlineLocal = new Date(task.deadline);
    const offset = deadlineLocal.getTimezoneOffset();
    const local = new Date(deadlineLocal.getTime() - offset * 60000);
    const formatted = local.toISOString().slice(0, 16);

    setForm({
      nama_tugas: task.nama_tugas,
      deadline: formatted,
      tipe: task.tipe,
      link_pengumpulan: task.link_pengumpulan || "",
      deskripsi: task.deskripsi || "",
      soal: task.soal || "",
    });
    setEditId(task.id);
    setShowForm(true);
  };

  // LOGIN SCREEN
  if (!authed) {
    return (
      <main className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#f5c518] flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-black text-lg">T</span>
            </div>
            <h1 className="text-white font-bold text-xl">Admin Panel</h1>
            <p className="text-[#555] text-sm mt-1">Masuk untuk kelola tugas</p>
          </div>

          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6">
            <div className="mb-4">
              <label className="text-[#888] text-xs font-medium block mb-1.5">Password</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Masukkan password admin"
                className={`w-full bg-[#1a1a1a] border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#f5c518]/50 transition-colors ${
                  passwordError ? "border-[#ef4444]/50" : "border-[#2a2a2a]"
                }`}
              />
              {passwordError && (
                <p className="text-[#ef4444] text-xs mt-1.5">Password salah</p>
              )}
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#f5c518] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#f5c518]/90 transition-colors"
            >
              Masuk
            </button>
          </div>

          <p className="text-center mt-4">
            <a href="/" className="text-[#444] text-xs hover:text-[#666] transition-colors">
              ← Lihat tugas
            </a>
          </p>
        </div>
      </main>
    );
  }

  // ADMIN PANEL
  return (
    <main className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <header className="border-b border-[#1e1e1e] bg-[#0d0d0d] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f5c518] flex items-center justify-center">
              <span className="text-black font-black text-sm">T</span>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-none">Admin Panel</h1>
              <p className="text-[#666] text-xs mt-0.5">{tasks.length} tugas total</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" className="text-xs text-[#444] hover:text-[#666] transition-colors">
              Lihat Publik →
            </a>
            <button
              onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
              className="bg-[#f5c518] text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#f5c518]/90 transition-colors"
            >
              + Tambah Tugas
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Form tambah/edit */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 z-20 flex items-end sm:items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-5 border-b border-[#1e1e1e] flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">
                  {editId ? "Edit Tugas" : "Tambah Tugas Baru"}
                </h2>
                <button
                  onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }}
                  className="text-[#555] hover:text-white transition-colors text-lg leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Nama tugas */}
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Nama Tugas *</label>
                  <input
                    type="text"
                    value={form.nama_tugas}
                    onChange={(e) => setForm({ ...form, nama_tugas: e.target.value })}
                    placeholder="Contoh: Laporan Praktikum Kimia"
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#f5c518]/50 transition-colors"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Deadline *</label>
                  <input
                    type="datetime-local"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#f5c518]/50 transition-colors"
                  />
                </div>

                {/* Tipe */}
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Tipe</label>
                  <div className="flex gap-2">
                    {(["teori", "praktikum"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setForm({ ...form, tipe: t })}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                          form.tipe === t
                            ? "bg-[#f5c518] text-black"
                            : "bg-[#1a1a1a] text-[#666] border border-[#2a2a2a] hover:text-[#999]"
                        }`}
                      >
                        {t === "teori" ? "📖 Teori" : "🔬 Praktikum"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Link pengumpulan */}
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Link Pengumpulan</label>
                  <input
                    type="url"
                    value={form.link_pengumpulan}
                    onChange={(e) => setForm({ ...form, link_pengumpulan: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#f5c518]/50 transition-colors"
                  />
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Deskripsi / Catatan</label>
                  <textarea
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    placeholder="Keterangan tambahan..."
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#f5c518]/50 transition-colors resize-none"
                  />
                </div>

                {/* Soal */}
                <div>
                  <label className="text-[#888] text-xs font-medium block mb-1.5">Soal / Instruksi</label>
                  <textarea
                    value={form.soal}
                    onChange={(e) => setForm({ ...form, soal: e.target.value })}
                    placeholder="Detail soal atau instruksi..."
                    rows={3}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#f5c518]/50 transition-colors resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.nama_tugas || !form.deadline}
                  className="w-full bg-[#f5c518] text-black font-bold py-2.5 rounded-lg text-sm hover:bg-[#f5c518]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambah Tugas"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Konfirmasi hapus */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 z-20 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl w-full max-w-sm p-6">
              <h3 className="text-white font-semibold mb-2">Hapus Tugas?</h3>
              <p className="text-[#555] text-sm mb-5">Tindakan ini tidak bisa dibatalkan.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-[#888] py-2 rounded-lg text-sm hover:text-white transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 bg-[#ef4444] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#ef4444]/90 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Aktif", count: tasks.filter(t => getStatus(t) === "aktif").length, color: "text-[#22c55e]" },
            { label: "Terlambat", count: tasks.filter(t => getStatus(t) === "terlambat").length, color: "text-[#ef4444]" },
            { label: "Selesai", count: tasks.filter(t => getStatus(t) === "selesai").length, color: "text-[#3b82f6]" },
          ].map((s) => (
            <div key={s.label} className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-3 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-[#555] text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Task list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-[#1a1a1a] animate-pulse" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#444] text-sm mb-4">Belum ada tugas</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#f5c518] text-black text-sm font-bold px-4 py-2 rounded-lg"
            >
              + Tambah Tugas Pertama
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const status = getStatus(task);
              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 ${
                    status === "terlambat"
                      ? "border-[#ef4444]/30 bg-[#ef4444]/5"
                      : status === "selesai"
                      ? "border-[#1e1e1e] bg-[#111] opacity-60"
                      : "border-[#1e1e1e] bg-[#141414]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          status === "aktif" ? "bg-[#22c55e]/15 text-[#22c55e]"
                          : status === "terlambat" ? "bg-[#ef4444]/15 text-[#ef4444]"
                          : "bg-[#3b82f6]/15 text-[#3b82f6]"
                        }`}>
                          {status === "aktif" ? "⏳ Aktif" : status === "terlambat" ? "⚠️ Terlambat" : "✅ Selesai"}
                        </span>
                        <span className="text-xs text-[#555] bg-[#1a1a1a] px-2 py-0.5 rounded-full">
                          {task.tipe === "teori" ? "📖 Teori" : "🔬 Praktikum"}
                        </span>
                      </div>
                      <h3 className={`font-semibold text-base ${status === "selesai" ? "text-[#444] line-through" : "text-white"}`}>
                        {task.nama_tugas}
                      </h3>
                      {task.deskripsi && (
                        <p className="text-[#555] text-xs mt-1 line-clamp-1">{task.deskripsi}</p>
                      )}
                      <p className="text-[#3a3a3a] text-xs mt-1.5">
                        📅 {formatDeadline(task.deadline)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleToggleSelesai(task)}
                        title={task.selesai ? "Tandai belum selesai" : "Tandai selesai"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors ${
                          task.selesai
                            ? "bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30"
                            : "bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20"
                        }`}
                      >
                        {task.selesai ? "↩" : "✓"}
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        title="Edit tugas"
                        className="w-8 h-8 rounded-lg bg-[#1a1a1a] text-[#666] hover:text-white flex items-center justify-center text-sm transition-colors"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(task.id)}
                        title="Hapus tugas"
                        className="w-8 h-8 rounded-lg bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444]/20 flex items-center justify-center text-sm transition-colors"
                      >
                        ✕
                      </button>
                    </div>
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
