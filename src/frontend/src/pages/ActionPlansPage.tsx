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
import { AlertTriangle, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddActionPlan,
  useDeleteActionPlan,
  useGetActionPlans,
  useUpdateActionPlan,
} from "../hooks/useQueries";
import type { ActionPlan } from "../types";

const priorityClass: Record<string, string> = {
  Düşük: "bg-gray-100 text-gray-700",
  Orta: "bg-blue-100 text-blue-800",
  Yüksek: "bg-orange-100 text-orange-800",
  Kritik: "bg-red-100 text-red-800 font-semibold",
};
const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  title: "",
  actionType: "Düzeltici",
  priority: "Orta",
  responsiblePerson: "",
  department: "",
  dueDate: "",
  completionDate: "",
  linkedIssue: "",
  description: "",
  status: "Açık",
  notes: "",
};

function isOverdue(r: ActionPlan) {
  if (!r.dueDate || r.status === "Tamamlandı" || r.status === "İptal")
    return false;
  return new Date(r.dueDate).getTime() < Date.now();
}

export function ActionPlansPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetActionPlans(companyId);
  const addMut = useAddActionPlan();
  const updateMut = useUpdateActionPlan();
  const deleteMut = useDeleteActionPlan();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActionPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<ActionPlan | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: ActionPlan) {
    setEditing(r);
    setForm({
      title: r.title,
      actionType: r.actionType,
      priority: r.priority,
      responsiblePerson: r.responsiblePerson,
      department: r.department,
      dueDate: r.dueDate,
      completionDate: r.completionDate,
      linkedIssue: r.linkedIssue,
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
        toast.success("Aksiyon güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Aksiyon eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: ActionPlan) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Aksiyon silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const total = records.length;
  const open_ = records.filter((r) => r.status === "Açık").length;
  const done = records.filter((r) => r.status === "Tamamlandı").length;
  const overdue = records.filter(isOverdue).length;

  const sf = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Target className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Aksiyon Planı Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Düzeltici, önleyici ve iyileştirme aksiyonları
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="action_plans.primary_button"
            >
              <Plus size={16} className="mr-1" /> Aksiyon Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam", val: total, color: "indigo" },
            { label: "Açık", val: open_, color: "red" },
            { label: "Tamamlandı", val: done, color: "green" },
            { label: "Geciken", val: overdue, color: "orange" },
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
              {overdue} aksiyon gecikmiş durumda.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="action_plans.empty_state"
            >
              Henüz aksiyon kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Başlık",
                      "Tür",
                      "Öncelik",
                      "Sorumlu",
                      "Bitiş",
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
                      data-ocid={`action_plans.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.title}
                        {r.linkedIssue && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({r.linkedIssue})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">{r.actionType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${priorityClass[r.priority] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.responsiblePerson}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isOverdue(r) ? "text-red-600 font-semibold" : ""
                          }
                        >
                          {r.dueDate || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
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
                              data-ocid={`action_plans.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`action_plans.delete_button.${i + 1}`}
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
                {editing ? "Aksiyon Düzenle" : "Aksiyon Ekle"}
              </DialogTitle>
              <DialogDescription>
                Aksiyon planı bilgilerini girin.
              </DialogDescription>
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
                <Label>Tür</Label>
                <Select
                  value={form.actionType}
                  onValueChange={(v) => sf("actionType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düzeltici", "Önleyici", "İyileştirme"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => sf("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Kritik"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsiblePerson}
                  onChange={(e) => sf("responsiblePerson", e.target.value)}
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => sf("dueDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Tamamlanma Tarihi</Label>
                <Input
                  type="date"
                  value={form.completionDate}
                  onChange={(e) => sf("completionDate", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>İlgili Sorun</Label>
                <Input
                  value={form.linkedIssue}
                  onChange={(e) => sf("linkedIssue", e.target.value)}
                  placeholder="Bulgu, olay ref..."
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
                    {["Açık", "Devam Ediyor", "Tamamlandı", "İptal"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
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
              <DialogTitle>Aksiyon Sil</DialogTitle>
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
