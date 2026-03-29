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
import { Gauge, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddCapacityRecord,
  useDeleteCapacityRecord,
  useGetCapacityRecords,
  useUpdateCapacityRecord,
} from "../hooks/useQueries";
import type { CapacityRecord } from "../types";

const resourceTypeClass: Record<string, string> = {
  Makine: "bg-indigo-100 text-indigo-800",
  "İnsan Kaynağı": "bg-emerald-100 text-emerald-800",
};

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Pasif: "bg-gray-100 text-gray-600",
  Bakımda: "bg-yellow-100 text-yellow-800",
};

const emptyForm = {
  resourceName: "",
  resourceType: "Makine",
  totalCapacity: "",
  usedCapacity: "",
  unit: "",
  period: "",
  responsible: "",
  status: "Aktif",
  notes: "",
};

function utilizationColor(pct: number) {
  if (pct > 80) return "text-red-600 font-semibold";
  if (pct >= 60) return "text-yellow-600 font-semibold";
  return "text-green-600 font-semibold";
}

export function CapacityPage() {
  const { session } = useAuth();
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetCapacityRecords(userCode);
  const addRecord = useAddCapacityRecord();
  const updateRecord = useUpdateCapacityRecord();
  const deleteRecord = useDeleteCapacityRecord();

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<CapacityRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("all");

  const avgUtil = records.length
    ? records.reduce((sum, r) => {
        const t = Number.parseFloat(r.totalCapacity) || 0;
        const u = Number.parseFloat(r.usedCapacity) || 0;
        return sum + (t > 0 ? (u / t) * 100 : 0);
      }, 0) / records.length
    : 0;

  const highUtilization = records.filter((r) => {
    const t = Number.parseFloat(r.totalCapacity) || 0;
    const u = Number.parseFloat(r.usedCapacity) || 0;
    return t > 0 && (u / t) * 100 > 90;
  });

  const machineCount = records.filter(
    (r) => r.resourceType === "Makine",
  ).length;
  const hrCount = records.filter(
    (r) => r.resourceType === "İnsan Kaynağı",
  ).length;

  const filtered = records.filter((r) =>
    filterType === "all" ? true : r.resourceType === filterType,
  );

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: CapacityRecord) {
    setEditItem(r);
    setForm({
      resourceName: r.resourceName,
      resourceType: r.resourceType,
      totalCapacity: r.totalCapacity,
      usedCapacity: r.usedCapacity,
      unit: r.unit,
      period: r.period,
      responsible: r.responsible,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.resourceName.trim()) {
      toast.error("Kaynak adı gerekli");
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-100">
              <Gauge className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Kapasite Planlama
              </h1>
              <p className="text-sm text-gray-500">
                Makine ve insan kaynağı kapasite takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="capacity.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kaynak Ekle
            </Button>
          )}
        </div>

        {highUtilization.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            ⚠ {highUtilization.length} kaynak %90 üzeri kapasite kullanımına
            sahip!
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Kaynak",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Ort. Kullanım",
              value: `${avgUtil.toFixed(0)}%`,
              color:
                avgUtil > 80
                  ? "text-red-600"
                  : avgUtil >= 60
                    ? "text-yellow-600"
                    : "text-green-600",
            },
            { label: "Makine", value: machineCount, color: "text-indigo-600" },
            {
              label: "İnsan Kaynağı",
              value: hrCount,
              color: "text-emerald-600",
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

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48" data-ocid="capacity.select">
              <SelectValue placeholder="Kaynak Türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              <SelectItem value="Makine">Makine</SelectItem>
              <SelectItem value="İnsan Kaynağı">İnsan Kaynağı</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="capacity.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="capacity.empty_state"
            >
              Kapasite kaydı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Kaynak Adı",
                    "Tür",
                    "Dönem",
                    "Kapasite",
                    "Kullanım %",
                    "Sorumlu",
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
                {filtered.map((r, idx) => {
                  const total = Number.parseFloat(r.totalCapacity) || 0;
                  const used = Number.parseFloat(r.usedCapacity) || 0;
                  const pct = total > 0 ? (used / total) * 100 : 0;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                      data-ocid={`capacity.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.resourceName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${resourceTypeClass[r.resourceType] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.resourceType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.period || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.usedCapacity} / {r.totalCapacity} {r.unit}
                      </td>
                      <td className={`px-4 py-3 ${utilizationColor(pct)}`}>
                        {pct.toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.responsible || "—"}
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
                              data-ocid={`capacity.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(r.id)}
                              data-ocid={`capacity.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="capacity-dialog-desc"
          data-ocid="capacity.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kaydı Düzenle" : "Yeni Kaynak"}
            </DialogTitle>
            <DialogDescription id="capacity-dialog-desc">
              Kapasite kaydı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Kaynak Adı *</Label>
              <Input
                value={form.resourceName}
                onChange={(e) => f("resourceName", e.target.value)}
                placeholder="Örn: CNC Torna Makinesi"
                data-ocid="capacity.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Kaynak Türü</Label>
              <Select
                value={form.resourceType}
                onValueChange={(v) => f("resourceType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Makine">Makine</SelectItem>
                  <SelectItem value="İnsan Kaynağı">İnsan Kaynağı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Pasif">Pasif</SelectItem>
                  <SelectItem value="Bakımda">Bakımda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Toplam Kapasite</Label>
              <Input
                type="number"
                value={form.totalCapacity}
                onChange={(e) => f("totalCapacity", e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1">
              <Label>Kullanılan Kapasite</Label>
              <Input
                type="number"
                value={form.usedCapacity}
                onChange={(e) => f("usedCapacity", e.target.value)}
                placeholder="75"
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Input
                value={form.unit}
                onChange={(e) => f("unit", e.target.value)}
                placeholder="saat, adet, %..."
              />
            </div>
            <div className="space-y-1">
              <Label>Dönem</Label>
              <Input
                value={form.period}
                onChange={(e) => f("period", e.target.value)}
                placeholder="Ocak 2026"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Sorumlu</Label>
              <Input
                value={form.responsible}
                onChange={(e) => f("responsible", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="capacity.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="capacity.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="capacity.submit_button"
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
          aria-describedby="capacity-del-desc"
          data-ocid="capacity.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="capacity-del-desc">
              Bu kapasite kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="capacity.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="capacity.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
