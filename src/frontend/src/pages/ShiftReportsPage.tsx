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
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddShiftReport,
  useDeleteShiftReport,
  useGetShiftReports,
  useUpdateShiftReport,
} from "../hooks/useQueries";
import type { ShiftReportRecord } from "../types";

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Taslak: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  reportDate: "",
  shiftType: "Sabah",
  department: "",
  supervisor: "",
  plannedProduction: "",
  actualProduction: "",
  unit: "Adet",
  scrapQuantity: "",
  workerCount: "",
  machineUtilization: "",
  issues: "",
  actions: "",
  status: "Tamamlandı",
  notes: "",
};

export function ShiftReportsPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetShiftReports(companyId);
  const addMut = useAddShiftReport();
  const updateMut = useUpdateShiftReport();
  const deleteMut = useDeleteShiftReport();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftReportRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<ShiftReportRecord | null>(
    null,
  );

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: ShiftReportRecord) {
    setEditing(r);
    setForm({
      reportDate: r.reportDate,
      shiftType: r.shiftType,
      department: r.department,
      supervisor: r.supervisor,
      plannedProduction: r.plannedProduction,
      actualProduction: r.actualProduction,
      unit: r.unit,
      scrapQuantity: r.scrapQuantity,
      workerCount: r.workerCount,
      machineUtilization: r.machineUtilization,
      issues: r.issues,
      actions: r.actions,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.reportDate || !form.department) {
      toast.error("Tarih ve departman zorunludur.");
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

  async function handleDelete(r: ShiftReportRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  // Efficiency calculations
  const totalPlanned = records.reduce(
    (a, r) => a + (Number(r.plannedProduction) || 0),
    0,
  );
  const totalActual = records.reduce(
    (a, r) => a + (Number(r.actualProduction) || 0),
    0,
  );
  const efficiency =
    totalPlanned > 0 ? Math.round((totalActual / totalPlanned) * 100) : 0;

  function effColor(planned: string, actual: string) {
    const p = Number(planned);
    const a = Number(actual);
    if (!p) return "text-gray-700";
    const eff = (a / p) * 100;
    if (eff >= 95) return "text-green-600 font-medium";
    if (eff >= 80) return "text-yellow-600";
    return "text-red-600";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <ClipboardList className="text-cyan-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Vardiya Üretim Raporları
              </h1>
              <p className="text-sm text-gray-500">
                Vardiya bazlı üretim özeti ve verimlilik takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Rapor Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Toplam Rapor", val: records.length, color: "indigo" },
            { label: "Toplam Planlanan", val: totalPlanned, color: "blue" },
            { label: "Toplam Gerçekleşen", val: totalActual, color: "green" },
            {
              label: "Genel Verimlilik",
              val: `%${efficiency}`,
              color:
                efficiency >= 95
                  ? "green"
                  : efficiency >= 80
                    ? "yellow"
                    : "red",
            },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>
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
              Henüz vardiya raporu yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Tarih",
                      "Vardiya",
                      "Departman",
                      "Sorumlu",
                      "Planlanan",
                      "Gerçekleşen",
                      "Fire",
                      "Mak. Kullanım %",
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
                      <td className="px-4 py-3">{r.reportDate}</td>
                      <td className="px-4 py-3">{r.shiftType}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.supervisor}</td>
                      <td className="px-4 py-3">
                        {r.plannedProduction} {r.unit}
                      </td>
                      <td
                        className={`px-4 py-3 ${effColor(r.plannedProduction, r.actualProduction)}`}
                      >
                        {r.actualProduction} {r.unit}
                      </td>
                      <td className="px-4 py-3">{r.scrapQuantity}</td>
                      <td className="px-4 py-3">
                        {r.machineUtilization
                          ? `%${r.machineUtilization}`
                          : "—"}
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
                {editing ? "Rapor Düzenle" : "Vardiya Raporu Ekle"}
              </DialogTitle>
              <DialogDescription>
                Vardiya üretim bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) => sf("reportDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Vardiya</Label>
                <Select
                  value={form.shiftType}
                  onValueChange={(v) => sf("shiftType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sabah", "Öğleden Sonra", "Gece", "Tam Gün"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departman *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu/Ustabaşı</Label>
                <Input
                  value={form.supervisor}
                  onChange={(e) => sf("supervisor", e.target.value)}
                />
              </div>
              <div>
                <Label>Planlanan Üretim</Label>
                <Input
                  value={form.plannedProduction}
                  onChange={(e) => sf("plannedProduction", e.target.value)}
                />
              </div>
              <div>
                <Label>Gerçekleşen Üretim</Label>
                <Input
                  value={form.actualProduction}
                  onChange={(e) => sf("actualProduction", e.target.value)}
                />
              </div>
              <div>
                <Label>Birim</Label>
                <Select value={form.unit} onValueChange={(v) => sf("unit", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Adet", "Kg", "Ton", "Metre", "Litre"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fire Miktarı</Label>
                <Input
                  value={form.scrapQuantity}
                  onChange={(e) => sf("scrapQuantity", e.target.value)}
                />
              </div>
              <div>
                <Label>İşçi Sayısı</Label>
                <Input
                  value={form.workerCount}
                  onChange={(e) => sf("workerCount", e.target.value)}
                />
              </div>
              <div>
                <Label>Mak. Kullanım (%)</Label>
                <Input
                  value={form.machineUtilization}
                  placeholder="0-100"
                  onChange={(e) => sf("machineUtilization", e.target.value)}
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
                    {["Tamamlandı", "Devam Ediyor", "Taslak"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Sorunlar</Label>
                <Textarea
                  value={form.issues}
                  onChange={(e) => sf("issues", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Alınan Aksiyonlar</Label>
                <Textarea
                  value={form.actions}
                  onChange={(e) => sf("actions", e.target.value)}
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
              <DialogTitle>Rapor Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.reportDate} - {deleteConfirm?.shiftType}{" "}
                raporunu silmek istediğinizden emin misiniz?
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
