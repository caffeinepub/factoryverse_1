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
import { AlertTriangle, Flag, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMilestone,
  useDeleteMilestone,
  useGetMilestones,
  useUpdateMilestone,
} from "../hooks/useQueries";
import type { Milestone } from "../types";

const statusClass: Record<string, string> = {
  Planlandı: "bg-gray-100 text-gray-700",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Tamamlandı: "bg-green-100 text-green-800",
  Gecikti: "bg-red-100 text-red-800",
  İptal: "bg-gray-200 text-gray-500",
};

function isOverdue(m: Milestone) {
  if (!m.plannedDate || m.status === "Tamamlandı" || m.status === "İptal")
    return false;
  return new Date(m.plannedDate).getTime() < Date.now();
}

const emptyForm = {
  projectName: "",
  milestoneName: "",
  description: "",
  plannedDate: "",
  actualDate: "",
  completionPercent: "0",
  deliverables: "",
  assignedTo: "",
  status: "Planlandı",
  notes: "",
};

export function MilestonesPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetMilestones(companyId);
  const addMut = useAddMilestone();
  const updateMut = useUpdateMilestone();
  const deleteMut = useDeleteMilestone();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Milestone | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: Milestone) {
    setEditing(r);
    setForm({
      projectName: r.projectName,
      milestoneName: r.milestoneName,
      description: r.description,
      plannedDate: r.plannedDate,
      actualDate: r.actualDate,
      completionPercent: r.completionPercent,
      deliverables: r.deliverables,
      assignedTo: r.assignedTo,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId) return;
    if (!form.milestoneName) {
      toast.error("Kilometre taşı adı zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Kilometre taşı güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Kilometre taşı eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: Milestone) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const overdue = records.filter(isOverdue).length;
  const sf = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Flag className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Proje Kilometre Taşları
              </h1>
              <p className="text-sm text-gray-500">
                Proje milestone takibi ve ilerleme
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="milestones.primary_button"
            >
              <Plus size={16} className="mr-1" /> Milestone Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam", val: records.length, color: "indigo" },
            {
              label: "Tamamlandı",
              val: records.filter((r) => r.status === "Tamamlandı").length,
              color: "green",
            },
            {
              label: "Devam Eden",
              val: records.filter((r) => r.status === "Devam Ediyor").length,
              color: "blue",
            },
            { label: "Geciken", val: overdue, color: "red" },
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

        {overdue > 0 && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2">
            <AlertTriangle className="text-amber-500 shrink-0" size={18} />
            <p className="text-sm text-amber-800">
              {overdue} kilometre taşı gecikmiş durumda.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="milestones.empty_state"
            >
              Henüz kilometre taşı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Proje",
                      "Milestone",
                      "Planlanan",
                      "Gerçekleşen",
                      "İlerleme",
                      "Sorumlu",
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
                      className={`border-b last:border-0 hover:bg-gray-50 ${isOverdue(r) ? "bg-red-50" : ""}`}
                      data-ocid={`milestones.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-gray-500">
                        {r.projectName}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.milestoneName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isOverdue(r) ? "text-red-600 font-semibold" : ""
                          }
                        >
                          {r.plannedDate || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.actualDate || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{
                                width: `${Math.min(100, Number.parseFloat(r.completionPercent) || 0)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {r.completionPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{r.assignedTo}</td>
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
                              data-ocid={`milestones.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`milestones.delete_button.${i + 1}`}
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
              <DialogTitle>
                {editing ? "Milestone Düzenle" : "Milestone Ekle"}
              </DialogTitle>
              <DialogDescription>
                Kilometre taşı bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Proje Adı</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) => sf("projectName", e.target.value)}
                />
              </div>
              <div>
                <Label>Milestone Adı *</Label>
                <Input
                  value={form.milestoneName}
                  onChange={(e) => sf("milestoneName", e.target.value)}
                />
              </div>
              <div>
                <Label>Planlanan Tarih</Label>
                <Input
                  type="date"
                  value={form.plannedDate}
                  onChange={(e) => sf("plannedDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Gerçekleşen Tarih</Label>
                <Input
                  type="date"
                  value={form.actualDate}
                  onChange={(e) => sf("actualDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Tamamlanma %</Label>
                <Input
                  value={form.completionPercent}
                  onChange={(e) => sf("completionPercent", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu</Label>
                <Input
                  value={form.assignedTo}
                  onChange={(e) => sf("assignedTo", e.target.value)}
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
                    {[
                      "Planlandı",
                      "Devam Ediyor",
                      "Tamamlandı",
                      "Gecikti",
                      "İptal",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Çıktılar/Teslim edilecekler</Label>
                <Input
                  value={form.deliverables}
                  onChange={(e) => sf("deliverables", e.target.value)}
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
              <DialogTitle>Milestone Sil</DialogTitle>
              <DialogDescription>
                "{deleteConfirm?.milestoneName}" silinecek. Emin misiniz?
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
