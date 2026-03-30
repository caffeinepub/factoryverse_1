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
import { Activity, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMTBFRecord,
  useDeleteMTBFRecord,
  useGetMTBFRecords,
  useUpdateMTBFRecord,
} from "../hooks/useQueries";
import type { MTBFRecord } from "../types";

const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  Çözüldü: "bg-green-100 text-green-800",
  İnceleniyor: "bg-yellow-100 text-yellow-800",
};

const emptyForm = {
  equipmentName: "",
  equipmentCode: "",
  department: "",
  failureDate: "",
  failureTime: "",
  restoredDate: "",
  restoredTime: "",
  failureDescription: "",
  rootCause: "",
  repairDuration: "",
  responsiblePerson: "",
  downtimeCost: "",
  status: "Açık",
  notes: "",
};

export function MTBFPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetMTBFRecords(companyId);
  const addMut = useAddMTBFRecord();
  const updateMut = useUpdateMTBFRecord();
  const deleteMut = useDeleteMTBFRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MTBFRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<MTBFRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: MTBFRecord) {
    setEditing(r);
    setForm({
      equipmentName: r.equipmentName,
      equipmentCode: r.equipmentCode,
      department: r.department,
      failureDate: r.failureDate,
      failureTime: r.failureTime,
      restoredDate: r.restoredDate,
      restoredTime: r.restoredTime,
      failureDescription: r.failureDescription,
      rootCause: r.rootCause,
      repairDuration: r.repairDuration,
      responsiblePerson: r.responsiblePerson,
      downtimeCost: r.downtimeCost,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.equipmentName) {
      toast.error("Ekipman adı zorunludur.");
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

  async function handleDelete(r: MTBFRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  // Calculate average repair duration
  const durValues = records
    .map((r) => Number(r.repairDuration))
    .filter((v) => !Number.isNaN(v) && v > 0);
  const avgRepair =
    durValues.length > 0
      ? (durValues.reduce((a, b) => a + b, 0) / durValues.length).toFixed(1)
      : "—";

  // Group failures by equipment
  const equipmentGroups = records.reduce(
    (acc, r) => {
      acc[r.equipmentName] = (acc[r.equipmentName] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const mostFailed = Object.entries(equipmentGroups).sort(
    (a, b) => b[1] - a[1],
  )[0];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="text-red-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                MGBF Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Ortalama arızalar arası süre ve güvenilirlik takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Arıza Kaydı Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Toplam Arıza", val: records.length, color: "indigo" },
            {
              label: "Açık Kayıtlar",
              val: records.filter((r) => r.status === "Açık").length,
              color: "red",
            },
            {
              label: "Ort. Onarım Süresi (s)",
              val: avgRepair,
              color: "orange",
            },
            {
              label: "En Çok Arıza",
              val: mostFailed ? mostFailed[0].substring(0, 10) : "—",
              color: "purple",
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
              Henüz arıza kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ekipman",
                      "Kod",
                      "Departman",
                      "Arıza Tarihi",
                      "Onarım Süresi (s)",
                      "Kök Neden",
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
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.equipmentName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.equipmentCode}
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">
                        {r.failureDate} {r.failureTime}
                      </td>
                      <td className="px-4 py-3">{r.repairDuration}</td>
                      <td className="px-4 py-3 max-w-[150px] truncate">
                        {r.rootCause}
                      </td>
                      <td className="px-4 py-3">{r.responsiblePerson}</td>
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
                {editing ? "Arıza Düzenle" : "Arıza Kaydı Ekle"}
              </DialogTitle>
              <DialogDescription>
                MGBF arıza bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Ekipman Adı *</Label>
                <Input
                  value={form.equipmentName}
                  onChange={(e) => sf("equipmentName", e.target.value)}
                />
              </div>
              <div>
                <Label>Ekipman Kodu</Label>
                <Input
                  value={form.equipmentCode}
                  onChange={(e) => sf("equipmentCode", e.target.value)}
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
                <Label>Sorumlu</Label>
                <Input
                  value={form.responsiblePerson}
                  onChange={(e) => sf("responsiblePerson", e.target.value)}
                />
              </div>
              <div>
                <Label>Arıza Tarihi</Label>
                <Input
                  type="date"
                  value={form.failureDate}
                  onChange={(e) => sf("failureDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Arıza Saati</Label>
                <Input
                  type="time"
                  value={form.failureTime}
                  onChange={(e) => sf("failureTime", e.target.value)}
                />
              </div>
              <div>
                <Label>Onarım Tarihi</Label>
                <Input
                  type="date"
                  value={form.restoredDate}
                  onChange={(e) => sf("restoredDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Onarım Saati</Label>
                <Input
                  type="time"
                  value={form.restoredTime}
                  onChange={(e) => sf("restoredTime", e.target.value)}
                />
              </div>
              <div>
                <Label>Onarım Süresi (saat)</Label>
                <Input
                  value={form.repairDuration}
                  placeholder="Örn: 2.5"
                  onChange={(e) => sf("repairDuration", e.target.value)}
                />
              </div>
              <div>
                <Label>Duruş Maliyeti</Label>
                <Input
                  value={form.downtimeCost}
                  onChange={(e) => sf("downtimeCost", e.target.value)}
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
                    {["Açık", "İnceleniyor", "Çözüldü"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Arıza Açıklaması</Label>
                <Textarea
                  value={form.failureDescription}
                  onChange={(e) => sf("failureDescription", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Kök Neden</Label>
                <Textarea
                  value={form.rootCause}
                  onChange={(e) => sf("rootCause", e.target.value)}
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
              <DialogTitle>Arıza Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.equipmentName} arıza kaydını silmek
                istediğinizden emin misiniz?
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
