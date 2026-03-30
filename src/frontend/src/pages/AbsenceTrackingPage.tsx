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
import { Pencil, Plus, Trash2, UserX } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddAbsenceRecord,
  useDeleteAbsenceRecord,
  useGetAbsenceRecords,
  useUpdateAbsenceRecord,
} from "../hooks/useQueries";
import type { AbsenceRecord } from "../types";

const statusClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
};

const absenceTypes = [
  "Yıllık İzin",
  "Hastalık İzni",
  "Mazeret İzni",
  "Ücretsiz İzin",
  "Doğum İzni",
  "Yas İzni",
];

const emptyForm = {
  employeeName: "",
  department: "",
  absenceType: "Yıllık İzin",
  startDate: "",
  endDate: "",
  days: "",
  reason: "",
  approvedBy: "",
  status: "Beklemede",
  notes: "",
};

export function AbsenceTrackingPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetAbsenceRecords(companyId);
  const addMut = useAddAbsenceRecord();
  const updateMut = useUpdateAbsenceRecord();
  const deleteMut = useDeleteAbsenceRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AbsenceRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<AbsenceRecord | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: AbsenceRecord) {
    setEditing(r);
    setForm({
      employeeName: r.employeeName,
      department: r.department,
      absenceType: r.absenceType,
      startDate: r.startDate,
      endDate: r.endDate,
      days: r.days,
      reason: r.reason,
      approvedBy: r.approvedBy,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId) return;
    if (!form.employeeName) {
      toast.error("Çalışan adı zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("İzin güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("İzin eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: AbsenceRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("İzin silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const totalDays = records
    .filter((r) => r.status === "Onaylandı")
    .reduce((s, r) => s + (Number.parseFloat(r.days) || 0), 0);
  const sf = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UserX className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Devamsızlık Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Çalışan izin ve devamsızlık kayıtları
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="absence_tracking.primary_button"
            >
              <Plus size={16} className="mr-1" /> İzin Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Kayıt", val: records.length, color: "indigo" },
            {
              label: "Onaylanan",
              val: records.filter((r) => r.status === "Onaylandı").length,
              color: "green",
            },
            { label: "Toplam Gün (Onaylı)", val: totalDays, color: "blue" },
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
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="absence_tracking.empty_state"
            >
              Henüz izin kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Çalışan",
                      "Departman",
                      "İzin Türü",
                      "Başlangıç",
                      "Bitiş",
                      "Gün",
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
                      data-ocid={`absence_tracking.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.employeeName}
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.absenceType}</td>
                      <td className="px-4 py-3">{r.startDate}</td>
                      <td className="px-4 py-3">{r.endDate}</td>
                      <td className="px-4 py-3 font-semibold">{r.days}</td>
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
                              data-ocid={`absence_tracking.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`absence_tracking.delete_button.${i + 1}`}
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
                {editing ? "İzin Düzenle" : "İzin Ekle"}
              </DialogTitle>
              <DialogDescription>
                Devamsızlık/izin bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Çalışan Adı *</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) => sf("employeeName", e.target.value)}
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
                <Label>İzin Türü</Label>
                <Select
                  value={form.absenceType}
                  onValueChange={(v) => sf("absenceType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {absenceTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => sf("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => sf("endDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Gün Sayısı</Label>
                <Input
                  value={form.days}
                  onChange={(e) => sf("days", e.target.value)}
                />
              </div>
              <div>
                <Label>Onaylayan</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) => sf("approvedBy", e.target.value)}
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
                    {["Beklemede", "Onaylandı", "Reddedildi"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Sebep</Label>
                <Textarea
                  value={form.reason}
                  onChange={(e) => sf("reason", e.target.value)}
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
              <DialogTitle>İzin Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.employeeName} adına ait kaydı silmek
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
