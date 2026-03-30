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
import { AlertTriangle, BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSopEntry,
  useDeleteSopEntry,
  useGetSopEntries,
  useUpdateSopEntry,
} from "../hooks/useQueries";
import type { SopEntry } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Revizyon: "bg-yellow-100 text-yellow-800",
  İptal: "bg-gray-100 text-gray-600",
  Taslak: "bg-blue-100 text-blue-800",
};

const categories = [
  "Üretim",
  "Bakım",
  "Kalite",
  "İSG",
  "İK",
  "Satın Alma",
  "Lojistik",
  "Diğer",
];

function isExpiringSoon(dateStr: string) {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

const emptyForm = {
  title: "",
  category: "Üretim",
  documentNumber: "",
  revisionNumber: "1",
  effectiveDate: "",
  expiryDate: "",
  owner: "",
  department: "",
  description: "",
  status: "Aktif",
  notes: "",
};

export function SopLibraryPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetSopEntries(companyId);
  const addMut = useAddSopEntry();
  const updateMut = useUpdateSopEntry();
  const deleteMut = useDeleteSopEntry();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SopEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<SopEntry | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: SopEntry) {
    setEditing(r);
    setForm({
      title: r.title,
      category: r.category,
      documentNumber: r.documentNumber,
      revisionNumber: r.revisionNumber,
      effectiveDate: r.effectiveDate,
      expiryDate: r.expiryDate,
      owner: r.owner,
      department: r.department,
      description: r.description,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId) return;
    if (!form.title) {
      toast.error("Başlık zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("SOP güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("SOP eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: SopEntry) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("SOP silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const expiring = records.filter(
    (r) => r.status === "Aktif" && isExpiringSoon(r.expiryDate),
  ).length;
  const sf = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BookOpen className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                SOP & Prosedür Kütüphanesi
              </h1>
              <p className="text-sm text-gray-500">
                Standart operasyon prosedürleri ve dokümanlar
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="sop_library.primary_button"
            >
              <Plus size={16} className="mr-1" /> SOP Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam", val: records.length, color: "indigo" },
            {
              label: "Aktif",
              val: records.filter((r) => r.status === "Aktif").length,
              color: "green",
            },
            {
              label: "Revizyon Bekleyen",
              val: records.filter((r) => r.status === "Revizyon").length,
              color: "yellow",
            },
            { label: "Süresi Yaklaşan", val: expiring, color: "orange" },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold text-${c.color}-600`}>
                {c.val}
              </p>
            </motion.div>
          ))}
        </div>

        {expiring > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <p className="text-sm text-amber-800">
              {expiring} SOP/prosedürün geçerlilik süresi 30 gün içinde dolacak.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="sop_library.empty_state"
            >
              Henüz SOP kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Başlık",
                      "Kategori",
                      "Dok. No",
                      "Rev.",
                      "Geçerlilik",
                      "Son Tarih",
                      "Departman",
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
                  {records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-b last:border-0 hover:bg-gray-50 ${isExpiringSoon(r.expiryDate) ? "bg-amber-50" : ""}`}
                      data-ocid={`sop_library.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.title}</td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {r.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.revisionNumber}
                      </td>
                      <td className="px-4 py-3">{r.effectiveDate || "-"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isExpiringSoon(r.expiryDate)
                              ? "text-amber-600 font-semibold"
                              : ""
                          }
                        >
                          {r.expiryDate || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="p-1 hover:text-indigo-600 text-gray-400"
                              data-ocid={`sop_library.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`sop_library.delete_button.${i + 1}`}
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "SOP Düzenle" : "SOP Ekle"}</DialogTitle>
              <DialogDescription>Prosedür bilgilerini girin.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Başlık *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => sf("title", e.target.value)}
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => sf("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Doküman No</Label>
                <Input
                  value={form.documentNumber}
                  onChange={(e) => sf("documentNumber", e.target.value)}
                  placeholder="SOP-001"
                />
              </div>
              <div>
                <Label>Revizyon No</Label>
                <Input
                  value={form.revisionNumber}
                  onChange={(e) => sf("revisionNumber", e.target.value)}
                />
              </div>
              <div>
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => sf("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Aktif", "Revizyon", "İptal", "Taslak"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Yürürlük Tarihi</Label>
                <Input
                  type="date"
                  value={form.effectiveDate}
                  onChange={(e) => sf("effectiveDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Geçerlilik Son Tarihi</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => sf("expiryDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Döküman Sahibi</Label>
                <Input
                  value={form.owner}
                  onChange={(e) => sf("owner", e.target.value)}
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Notlar</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => sf("notes", e.target.value)}
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

        <Dialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>SOP Sil</DialogTitle>
              <DialogDescription>
                "{deleteConfirm?.title}" dökümanını silmek istediğinizden emin
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
