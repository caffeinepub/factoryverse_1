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
import { Factory, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddProductionRecord,
  useDeleteProductionRecord,
  useGetProductionRecords,
  useUpdateProductionRecord,
} from "../hooks/useQueries";
import type { ProductionRecord } from "../types";

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Planlandı: "bg-gray-100 text-gray-700",
  Duraklatıldı: "bg-yellow-100 text-yellow-800",
  İptal: "bg-red-100 text-red-800",
};

const shiftClass: Record<string, string> = {
  Sabah: "bg-amber-100 text-amber-800",
  "Öğleden Sonra": "bg-orange-100 text-orange-800",
  Gece: "bg-indigo-100 text-indigo-800",
};

const emptyForm = {
  productName: "",
  productionLine: "",
  shiftType: "Sabah",
  operator: "",
  plannedQuantity: "",
  actualQuantity: "",
  defectQuantity: "0",
  unit: "adet",
  productionDate: "",
  status: "Planlandı",
  notes: "",
};

export function ProductionPage() {
  const { session } = useAuth();
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetProductionRecords(userCode);
  const addRecord = useAddProductionRecord();
  const updateRecord = useUpdateProductionRecord();
  const deleteRecord = useDeleteProductionRecord();

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<ProductionRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const totalPlanned = records.reduce(
    (s, r) => s + (Number.parseFloat(r.plannedQuantity) || 0),
    0,
  );
  const totalActual = records.reduce(
    (s, r) => s + (Number.parseFloat(r.actualQuantity) || 0),
    0,
  );
  const totalDefects = records.reduce(
    (s, r) => s + (Number.parseFloat(r.defectQuantity) || 0),
    0,
  );
  const defectRate =
    totalActual > 0 ? ((totalDefects / totalActual) * 100).toFixed(1) : "0.0";

  const filtered = records.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus,
  );

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: ProductionRecord) {
    setEditItem(r);
    setForm({
      productName: r.productName,
      productionLine: r.productionLine,
      shiftType: r.shiftType,
      operator: r.operator,
      plannedQuantity: r.plannedQuantity,
      actualQuantity: r.actualQuantity,
      defectQuantity: r.defectQuantity,
      unit: r.unit,
      productionDate: r.productionDate,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.productName.trim()) {
      toast.error("Ürün adı gerekli");
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
              <Factory className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Üretim Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Üretim emirleri ve performans takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="production.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Üretim Emri Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Emir",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Planlanan",
              value: totalPlanned.toLocaleString(),
              color: "text-gray-700",
            },
            {
              label: "Gerçekleşen",
              value: totalActual.toLocaleString(),
              color: "text-green-600",
            },
            {
              label: "Hata Oranı",
              value: `${defectRate}%`,
              color:
                Number.parseFloat(defectRate) > 5
                  ? "text-red-600"
                  : "text-green-600",
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48" data-ocid="production.select">
              <SelectValue placeholder="Durum Filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="Planlandı">Planlandı</SelectItem>
              <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
              <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
              <SelectItem value="Duraklatıldı">Duraklatıldı</SelectItem>
              <SelectItem value="İptal">İptal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="production.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="production.empty_state"
            >
              Üretim kaydı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Ürün",
                    "Hat",
                    "Vardiya",
                    "Operatör",
                    "Planlanan",
                    "Gerçekleşen",
                    "Hata",
                    "Tarih",
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
                  const planned = Number.parseFloat(r.plannedQuantity) || 0;
                  const actual = Number.parseFloat(r.actualQuantity) || 0;
                  const pct =
                    planned > 0 ? Math.round((actual / planned) * 100) : 0;
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                      data-ocid={`production.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.productName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.productionLine || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${shiftClass[r.shiftType] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.shiftType}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.operator || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.plannedQuantity} {r.unit}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            pct >= 100
                              ? "text-green-600 font-semibold"
                              : pct >= 80
                                ? "text-yellow-600"
                                : "text-red-600"
                          }
                        >
                          {r.actualQuantity} {r.unit} ({pct}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.defectQuantity} {r.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.productionDate || "—"}
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
                              data-ocid={`production.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(r.id)}
                              data-ocid={`production.delete_button.${idx + 1}`}
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
          aria-describedby="production-dialog-desc"
          data-ocid="production.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kaydı Düzenle" : "Yeni Üretim Emri"}
            </DialogTitle>
            <DialogDescription id="production-dialog-desc">
              Üretim emri bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Ürün Adı *</Label>
              <Input
                value={form.productName}
                onChange={(e) => f("productName", e.target.value)}
                placeholder="Örn: Motor Gövdesi A100"
                data-ocid="production.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Üretim Hattı</Label>
              <Input
                value={form.productionLine}
                onChange={(e) => f("productionLine", e.target.value)}
                placeholder="Hat-1"
              />
            </div>
            <div className="space-y-1">
              <Label>Vardiya</Label>
              <Select
                value={form.shiftType}
                onValueChange={(v) => f("shiftType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sabah">Sabah</SelectItem>
                  <SelectItem value="Öğleden Sonra">Öğleden Sonra</SelectItem>
                  <SelectItem value="Gece">Gece</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Operatör</Label>
              <Input
                value={form.operator}
                onChange={(e) => f("operator", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Üretim Tarihi</Label>
              <Input
                type="date"
                value={form.productionDate}
                onChange={(e) => f("productionDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Planlanan Miktar</Label>
              <Input
                type="number"
                value={form.plannedQuantity}
                onChange={(e) => f("plannedQuantity", e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1">
              <Label>Gerçekleşen Miktar</Label>
              <Input
                type="number"
                value={form.actualQuantity}
                onChange={(e) => f("actualQuantity", e.target.value)}
                placeholder="95"
              />
            </div>
            <div className="space-y-1">
              <Label>Hatalı Adet</Label>
              <Input
                type="number"
                value={form.defectQuantity}
                onChange={(e) => f("defectQuantity", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Input
                value={form.unit}
                onChange={(e) => f("unit", e.target.value)}
                placeholder="adet"
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planlandı">Planlandı</SelectItem>
                  <SelectItem value="Devam Ediyor">Devam Ediyor</SelectItem>
                  <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                  <SelectItem value="Duraklatıldı">Duraklatıldı</SelectItem>
                  <SelectItem value="İptal">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="production.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="production.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="production.submit_button"
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
          aria-describedby="production-del-desc"
          data-ocid="production.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="production-del-desc">
              Bu üretim kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="production.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="production.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
