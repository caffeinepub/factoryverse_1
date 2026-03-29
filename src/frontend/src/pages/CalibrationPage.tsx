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
  useAddCalibrationRecord,
  useDeleteCalibrationRecord,
  useGetCalibrationRecords,
  useUpdateCalibrationRecord,
} from "../hooks/useQueries";
import type { CalibrationRecord } from "../types";

const categoryClass: Record<string, string> = {
  Uzunluk: "bg-blue-100 text-blue-800",
  Basınç: "bg-orange-100 text-orange-800",
  Sıcaklık: "bg-red-100 text-red-800",
  Ağırlık: "bg-purple-100 text-purple-800",
  Diğer: "bg-gray-100 text-gray-700",
};

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Süresi Dolmuş": "bg-red-100 text-red-800",
  "Kalibrasyon Gerekli": "bg-orange-100 text-orange-800",
};

const emptyForm = {
  instrumentName: "",
  serialNumber: "",
  category: "Uzunluk",
  lastCalibrationDate: "",
  nextCalibrationDate: "",
  calibrationInterval: "",
  calibratedBy: "",
  location: "",
  certificateNo: "",
  status: "Aktif",
  notes: "",
};

export function CalibrationPage() {
  const { session } = useAuth();
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetCalibrationRecords(userCode);
  const addRecord = useAddCalibrationRecord();
  const updateRecord = useUpdateCalibrationRecord();
  const deleteRecord = useDeleteCalibrationRecord();

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<CalibrationRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const in30Days = new Date(Date.now() + 30 * 86400000)
    .toISOString()
    .split("T")[0];

  const overdue = records.filter(
    (r) => r.nextCalibrationDate && r.nextCalibrationDate < today,
  );
  const dueSoon = records.filter(
    (r) =>
      r.nextCalibrationDate &&
      r.nextCalibrationDate >= today &&
      r.nextCalibrationDate <= in30Days,
  );
  const activeCount = records.filter((r) => r.status === "Aktif").length;

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: CalibrationRecord) {
    setEditItem(r);
    setForm({
      instrumentName: r.instrumentName,
      serialNumber: r.serialNumber,
      category: r.category,
      lastCalibrationDate: r.lastCalibrationDate,
      nextCalibrationDate: r.nextCalibrationDate,
      calibrationInterval: r.calibrationInterval,
      calibratedBy: r.calibratedBy,
      location: r.location,
      certificateNo: r.certificateNo,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.instrumentName.trim()) {
      toast.error("Alet adı gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Kayıt güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Kayıt eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Kayıt silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız");
    }
  }

  const f = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  function nextCalDateClass(date: string) {
    if (!date) return "text-gray-600";
    if (date < today) return "text-red-600 font-semibold";
    if (date <= in30Days) return "text-orange-600 font-semibold";
    return "text-gray-600";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100">
              <Activity className="text-sky-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Kalibrasyon Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Ölçüm aletleri kalibrasyon tarihi takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="calibration.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Alet Ekle
            </Button>
          )}
        </div>

        {(overdue.length > 0 || dueSoon.length > 0) && (
          <div className="space-y-2">
            {overdue.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                ⚠ {overdue.length} aletin kalibrasyon tarihi geçti!
              </div>
            )}
            {dueSoon.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
                🔔 {dueSoon.length} aletin kalibrasyonu 30 gün içinde yapılmalı.
              </div>
            )}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Alet",
              value: records.length,
              color: "text-indigo-600",
            },
            { label: "Aktif", value: activeCount, color: "text-green-600" },
            {
              label: "Yaklaşan (30 gün)",
              value: dueSoon.length,
              color: "text-orange-600",
            },
            {
              label: "Süresi Geçmiş",
              value: overdue.length,
              color: "text-red-600",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="calibration.loading_state"
            >
              Yükleniyor…
            </div>
          ) : records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="calibration.empty_state"
            >
              Kalibrasyon kaydı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Alet Adı",
                    "Seri No",
                    "Kategori",
                    "Son Kalibrasyon",
                    "Sonraki Kalibrasyon",
                    "Sorumlu",
                    "Konum",
                    "Sertifika No",
                    "Durum",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-ocid={`calibration.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.instrumentName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.serialNumber || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryClass[r.category] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.lastCalibrationDate || "—"}
                    </td>
                    <td
                      className={`px-4 py-3 ${nextCalDateClass(r.nextCalibrationDate)}`}
                    >
                      {r.nextCalibrationDate || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.calibratedBy || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.certificateNo || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            data-ocid={`calibration.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`calibration.delete_button.${idx + 1}`}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="calibration-dialog-desc"
          data-ocid="calibration.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kaydı Düzenle" : "Yeni Kalibrasyon Aleti"}
            </DialogTitle>
            <DialogDescription id="calibration-dialog-desc">
              Kalibrasyon bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Alet Adı *</Label>
              <Input
                value={form.instrumentName}
                onChange={(e) => f("instrumentName", e.target.value)}
                placeholder="Örn: Dijital Kumpas"
                data-ocid="calibration.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Seri Numarası</Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => f("serialNumber", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => f("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Uzunluk", "Basınç", "Sıcaklık", "Ağırlık", "Diğer"].map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Son Kalibrasyon Tarihi</Label>
              <Input
                type="date"
                value={form.lastCalibrationDate}
                onChange={(e) => f("lastCalibrationDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sonraki Kalibrasyon Tarihi</Label>
              <Input
                type="date"
                value={form.nextCalibrationDate}
                onChange={(e) => f("nextCalibrationDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Kalibrasyon Aralığı</Label>
              <Input
                value={form.calibrationInterval}
                onChange={(e) => f("calibrationInterval", e.target.value)}
                placeholder="365 gün"
              />
            </div>
            <div className="space-y-1">
              <Label>Kalibrasyon Yapan</Label>
              <Input
                value={form.calibratedBy}
                onChange={(e) => f("calibratedBy", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Konum</Label>
              <Input
                value={form.location}
                onChange={(e) => f("location", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sertifika No</Label>
              <Input
                value={form.certificateNo}
                onChange={(e) => f("certificateNo", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Süresi Dolmuş">Süresi Dolmuş</SelectItem>
                  <SelectItem value="Kalibrasyon Gerekli">
                    Kalibrasyon Gerekli
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="calibration.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="calibration.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="calibration.submit_button"
            >
              {editItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          aria-describedby="calibration-del-desc"
          data-ocid="calibration.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="calibration-del-desc">
              Bu kalibrasyon kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="calibration.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="calibration.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
