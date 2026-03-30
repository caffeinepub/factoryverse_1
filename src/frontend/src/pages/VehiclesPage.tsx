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
import { AlertTriangle, Pencil, Plus, Trash2, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddVehicleRecord,
  useDeleteVehicleRecord,
  useGetVehicleRecords,
  useUpdateVehicleRecord,
} from "../hooks/useQueries";
import type { VehicleRecord } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Bakımda: "bg-yellow-100 text-yellow-800",
  "Kullanım Dışı": "bg-red-100 text-red-800",
  Satıldı: "bg-gray-100 text-gray-700",
};

const vehicleTypes = [
  "Binek",
  "Kamyonet",
  "Kamyon",
  "Forklift",
  "İş Makinesi",
  "Minibüs",
  "Otobüs",
  "Diğer",
];

const emptyForm = {
  plate: "",
  brand: "",
  model: "",
  year: "",
  vehicleType: "",
  department: "",
  driver: "",
  inspectionDate: "",
  insuranceDate: "",
  status: "Aktif",
  notes: "",
};

function isExpiringSoon(dateStr: string) {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function isExpired(dateStr: string) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

export function VehiclesPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";
  const { data: records = [], isLoading } = useGetVehicleRecords(userCode);
  const addMut = useAddVehicleRecord();
  const updateMut = useUpdateVehicleRecord();
  const deleteMut = useDeleteVehicleRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<VehicleRecord | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: VehicleRecord) {
    setEditing(r);
    setForm({
      plate: r.plate,
      brand: r.brand,
      model: r.model,
      year: r.year,
      vehicleType: r.vehicleType,
      department: r.department,
      driver: r.driver,
      inspectionDate: r.inspectionDate,
      insuranceDate: r.insuranceDate,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!adminCode) return;
    if (!form.plate || !form.brand || !form.vehicleType) {
      toast.error("Plaka, marka ve araç tipi zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({
          adminCode,
          recordId: editing.id,
          ...form,
        });
        toast.success("Araç güncellendi.");
      } else {
        await addMut.mutateAsync({ adminCode, ...form });
        toast.success("Araç eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: VehicleRecord) {
    if (!adminCode) return;
    try {
      await deleteMut.mutateAsync({ adminCode, recordId: r.id });
      toast.success("Araç silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const soonInspection = records.filter(
    (r) => isExpiringSoon(r.inspectionDate) || isExpiringSoon(r.insuranceDate),
  );
  const expiredRecords = records.filter(
    (r) => isExpired(r.inspectionDate) || isExpired(r.insuranceDate),
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Truck className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Araç & Taşıt Takibi
              </h1>
              <p className="text-sm text-gray-500">Muayene ve sigorta takibi</p>
            </div>
          </div>
          {adminCode && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Araç Ekle
            </Button>
          )}
        </div>

        {(soonInspection.length > 0 || expiredRecords.length > 0) && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-2">
            <AlertTriangle
              className="text-amber-500 mt-0.5 shrink-0"
              size={18}
            />
            <p className="text-sm text-amber-800">
              {expiredRecords.length > 0 && (
                <span className="font-semibold">
                  {expiredRecords.length} araçta muayene/sigorta süresi dolmuş.{" "}
                </span>
              )}
              {soonInspection.length > 0 && (
                <span>
                  {soonInspection.length} araçta muayene/sigorta 30 gün içinde
                  sona eriyor.
                </span>
              )}
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Henüz araç kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Plaka",
                      "Marka/Model",
                      "Tip",
                      "Departman",
                      "Sürücü",
                      "Muayene",
                      "Sigorta",
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-700">
                        {r.plate}
                      </td>
                      <td className="px-4 py-3">
                        {r.brand} {r.model} {r.year && `(${r.year})`}
                      </td>
                      <td className="px-4 py-3">{r.vehicleType}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.driver}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isExpired(r.inspectionDate)
                              ? "text-red-600 font-semibold"
                              : isExpiringSoon(r.inspectionDate)
                                ? "text-amber-600 font-semibold"
                                : "text-gray-700"
                          }
                        >
                          {r.inspectionDate || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isExpired(r.insuranceDate)
                              ? "text-red-600 font-semibold"
                              : isExpiringSoon(r.insuranceDate)
                                ? "text-amber-600 font-semibold"
                                : "text-gray-700"
                          }
                        >
                          {r.insuranceDate || "-"}
                        </span>
                      </td>
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
                {editing ? "Araç Düzenle" : "Araç Ekle"}
              </DialogTitle>
              <DialogDescription>
                Araç ve taşıt bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Plaka *</Label>
                <Input
                  value={form.plate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plate: e.target.value }))
                  }
                  placeholder="34 ABC 123"
                />
              </div>
              <div>
                <Label>Marka *</Label>
                <Input
                  value={form.brand}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, brand: e.target.value }))
                  }
                  placeholder="Ford"
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={form.model}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, model: e.target.value }))
                  }
                  placeholder="Transit"
                />
              </div>
              <div>
                <Label>Yıl</Label>
                <Input
                  value={form.year}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, year: e.target.value }))
                  }
                  placeholder="2022"
                />
              </div>
              <div>
                <Label>Araç Tipi *</Label>
                <Select
                  value={form.vehicleType}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, vehicleType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
                  placeholder="Lojistik"
                />
              </div>
              <div>
                <Label>Sürücü</Label>
                <Input
                  value={form.driver}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, driver: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <Label>Muayene Tarihi</Label>
                <Input
                  type="date"
                  value={form.inspectionDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, inspectionDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Sigorta Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.insuranceDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, insuranceDate: e.target.value }))
                  }
                />
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
                    {["Aktif", "Bakımda", "Kullanım Dışı", "Satıldı"].map(
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
              <DialogTitle>Araç Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.plate} plakalı aracı silmek istediğinizden emin
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
