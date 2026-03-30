import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddComplaintRecord,
  useDeleteComplaintRecord,
  useGetComplaintRecords,
  useUpdateComplaintRecord,
} from "../hooks/useQueries";
import type { ComplaintRecord } from "../types";

const statusClass: Record<string, string> = {
  Açık: "bg-blue-100 text-blue-800",
  İnceleniyor: "bg-yellow-100 text-yellow-800",
  Çözüldü: "bg-green-100 text-green-800",
  Kapatıldı: "bg-gray-100 text-gray-700",
  Reddedildi: "bg-red-100 text-red-800",
};

const priorityClass: Record<string, string> = {
  Düşük: "bg-gray-100 text-gray-700",
  Orta: "bg-blue-100 text-blue-700",
  Yüksek: "bg-orange-100 text-orange-700",
  Kritik: "bg-red-100 text-red-700",
};

const categories = [
  "Ürün Kalitesi",
  "Teslimat",
  "Müşteri Hizmetleri",
  "Teknik Destek",
  "Fiyatlandırma",
  "Personel",
  "Süreç",
  "Diğer",
];
const sources = [
  "Müşteri",
  "Personel",
  "Tedarikçi",
  "Denetim",
  "Yönetim",
  "Diğer",
];

const emptyForm = {
  title: "",
  category: "",
  source: "",
  submittedBy: "",
  assignedTo: "",
  priority: "Orta",
  status: "Açık",
  description: "",
  resolution: "",
  submissionDate: new Date().toISOString().split("T")[0],
  closedDate: "",
  notes: "",
};

export function ComplaintsPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";
  const { data: records = [], isLoading } = useGetComplaintRecords(userCode);
  const addMut = useAddComplaintRecord();
  const updateMut = useUpdateComplaintRecord();
  const deleteMut = useDeleteComplaintRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ComplaintRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<ComplaintRecord | null>(
    null,
  );
  const [filterStatus, setFilterStatus] = useState("Tümü");

  function openAdd() {
    setEditing(null);
    setForm({
      ...emptyForm,
      submissionDate: new Date().toISOString().split("T")[0],
    });
    setOpen(true);
  }

  function openEdit(r: ComplaintRecord) {
    setEditing(r);
    setForm({
      title: r.title,
      category: r.category,
      source: r.source,
      submittedBy: r.submittedBy,
      assignedTo: r.assignedTo,
      priority: r.priority,
      status: r.status,
      description: r.description,
      resolution: r.resolution,
      submissionDate: r.submissionDate,
      closedDate: r.closedDate,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!adminCode) return;
    if (!form.title || !form.category) {
      toast.error("Başlık ve kategori zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({
          adminCode,
          recordId: editing.id,
          ...form,
        });
        toast.success("Kayıt güncellendi.");
      } else {
        await addMut.mutateAsync({ adminCode, ...form });
        toast.success("Şikayet eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: ComplaintRecord) {
    if (!adminCode) return;
    try {
      await deleteMut.mutateAsync({ adminCode, recordId: r.id });
      toast.success("Kayıt silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const filtered =
    filterStatus === "Tümü"
      ? records
      : records.filter((r) => r.status === filterStatus);

  const openCount = records.filter((r) => r.status === "Açık").length;
  const inProgressCount = records.filter(
    (r) => r.status === "İnceleniyor",
  ).length;
  const resolvedCount = records.filter((r) => r.status === "Çözüldü").length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MessageSquare className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Şikayet & Geri Bildirim
              </h1>
              <p className="text-sm text-gray-500">
                Şikayet yönetimi ve çözüm takibi
              </p>
            </div>
          </div>
          {adminCode && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Şikayet Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Açık",
              count: openCount,
              color: "bg-blue-50 border-blue-200 text-blue-700",
            },
            {
              label: "İnceleniyor",
              count: inProgressCount,
              color: "bg-yellow-50 border-yellow-200 text-yellow-700",
            },
            {
              label: "Çözüldü",
              count: resolvedCount,
              color: "bg-green-50 border-green-200 text-green-700",
            },
          ].map((c) => (
            <div key={c.label} className={`rounded-lg border p-4 ${c.color}`}>
              <div className="text-2xl font-bold">{c.count}</div>
              <div className="text-sm">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["Tümü", "Açık", "İnceleniyor", "Çözüldü", "Kapatıldı"].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Başlık",
                      "Kategori",
                      "Kaynak",
                      "Bildiren",
                      "Atanan",
                      "Öncelik",
                      "Tarih",
                      "Durum",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">
                        {r.title}
                      </td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3">{r.source}</td>
                      <td className="px-4 py-3">{r.submittedBy}</td>
                      <td className="px-4 py-3">{r.assignedTo}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[r.priority] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.submissionDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {adminCode && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="p-1 hover:text-indigo-600 text-gray-400"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Şikayet Düzenle" : "Şikayet Ekle"}
              </DialogTitle>
              <DialogDescription>
                Şikayet veya geri bildirim bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Başlık *</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Şikayet başlığı"
                />
              </div>
              <div>
                <Label>Kategori *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kaynak</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bildiren</Label>
                <Input
                  value={form.submittedBy}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, submittedBy: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <Label>Atanan Kişi</Label>
                <Input
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, assignedTo: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Kritik"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Açık",
                      "İnceleniyor",
                      "Çözüldü",
                      "Kapatıldı",
                      "Reddedildi",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Başvuru Tarihi</Label>
                <Input
                  type="date"
                  value={form.submissionDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, submissionDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Kapanış Tarihi</Label>
                <Input
                  type="date"
                  value={form.closedDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, closedDate: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Şikayet detayları..."
                />
              </div>
              <div className="col-span-2">
                <Label>Çözüm</Label>
                <Textarea
                  value={form.resolution}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, resolution: e.target.value }))
                  }
                  rows={2}
                  placeholder="Çözüm açıklaması..."
                />
              </div>
              <div className="col-span-2">
                <Label>Notlar</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editing ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <Dialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Şikayet Sil</DialogTitle>
              <DialogDescription>
                "{deleteConfirm?.title}" kaydını silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
