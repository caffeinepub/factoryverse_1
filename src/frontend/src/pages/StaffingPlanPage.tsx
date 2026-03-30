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
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddStaffingPlan,
  useDeleteStaffingPlan,
  useGetStaffingPlans,
  useUpdateStaffingPlan,
} from "../hooks/useQueries";
import type { StaffingPlan } from "../types";

const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Tamamlandı: "bg-green-100 text-green-800",
  Donduruldu: "bg-gray-100 text-gray-700",
};

const priorityClass: Record<string, string> = {
  Kritik: "bg-red-100 text-red-700",
  Yüksek: "bg-orange-100 text-orange-700",
  Normal: "bg-blue-100 text-blue-700",
  Düşük: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  department: "",
  position: "",
  requiredCount: "",
  currentCount: "",
  openPositions: "",
  employmentType: "Tam Zamanlı",
  priority: "Normal",
  plannedDate: "",
  recruiter: "",
  status: "Açık",
  notes: "",
};

export function StaffingPlanPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetStaffingPlans(companyId);
  const addMut = useAddStaffingPlan();
  const updateMut = useUpdateStaffingPlan();
  const deleteMut = useDeleteStaffingPlan();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StaffingPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<StaffingPlan | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: StaffingPlan) {
    setEditing(r);
    setForm({
      department: r.department,
      position: r.position,
      requiredCount: r.requiredCount,
      currentCount: r.currentCount,
      openPositions: r.openPositions,
      employmentType: r.employmentType,
      priority: r.priority,
      plannedDate: r.plannedDate,
      recruiter: r.recruiter,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.position) {
      toast.error("Pozisyon zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: StaffingPlan) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const openCount = records.filter((r) => r.status === "Açık").length;
  const totalOpen = records.reduce(
    (s, r) => s + (Number(r.openPositions) || 0),
    0,
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Norm Kadro Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Departman bazlı kadro planlama ve açık pozisyon takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Pozisyon Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Pozisyon", val: records.length, color: "indigo" },
            { label: "Açık İşe Alım", val: openCount, color: "red" },
            { label: "Açık Koltuk Sayısı", val: totalOpen, color: "orange" },
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

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Henüz kadro planı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Departman",
                      "Pozisyon",
                      "Gereken",
                      "Mevcut",
                      "Açık",
                      "Tür",
                      "Öncelik",
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
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3 font-medium">{r.position}</td>
                      <td className="px-4 py-3 text-center">
                        {r.requiredCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.currentCount}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-red-600">
                        {r.openPositions}
                      </td>
                      <td className="px-4 py-3">{r.employmentType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[r.priority] ?? "bg-gray-100"}`}
                        >
                          {r.priority}
                        </span>
                      </td>
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Pozisyon Düzenle" : "Pozisyon Ekle"}
              </DialogTitle>
              <DialogDescription>
                Kadro planlama bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Pozisyon *</Label>
                <Input
                  value={form.position}
                  onChange={(e) => sf("position", e.target.value)}
                />
              </div>
              <div>
                <Label>Gereken Kişi Sayısı</Label>
                <Input
                  value={form.requiredCount}
                  onChange={(e) => sf("requiredCount", e.target.value)}
                />
              </div>
              <div>
                <Label>Mevcut Kişi Sayısı</Label>
                <Input
                  value={form.currentCount}
                  onChange={(e) => sf("currentCount", e.target.value)}
                />
              </div>
              <div>
                <Label>Açık Pozisyon Sayısı</Label>
                <Input
                  value={form.openPositions}
                  onChange={(e) => sf("openPositions", e.target.value)}
                />
              </div>
              <div>
                <Label>İstihdam Türü</Label>
                <Select
                  value={form.employmentType}
                  onValueChange={(v) => sf("employmentType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Tam Zamanlı",
                      "Yarı Zamanlı",
                      "Sözleşmeli",
                      "Stajyer",
                    ].map((t) => (
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
                    {["Kritik", "Yüksek", "Normal", "Düşük"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Label>İşe Alım Sorumlusu</Label>
                <Input
                  value={form.recruiter}
                  onChange={(e) => sf("recruiter", e.target.value)}
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
                    {["Açık", "Devam Ediyor", "Tamamlandı", "Donduruldu"].map(
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
              <DialogTitle>Pozisyon Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.position} pozisyonunu silmek istediğinizden emin
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
