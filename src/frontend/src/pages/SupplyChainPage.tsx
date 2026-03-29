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
import { GitMerge, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSupplyChainRecord,
  useDeleteSupplyChainRecord,
  useGetSupplyChainRecords,
  useUpdateSupplyChainRecord,
} from "../hooks/useQueries";
import type { SupplyChainRecord } from "../types";

const statusLabels: Record<string, string> = {
  ordered: "Sipariş Verildi",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  delayed: "Gecikti",
  cancelled: "İptal Edildi",
};

const statusClass: Record<string, string> = {
  ordered: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  delayed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  itemName: "",
  supplierName: "",
  category: "",
  orderedQuantity: "",
  deliveredQuantity: "0",
  unit: "adet",
  orderDate: "",
  expectedDate: "",
  deliveryDate: "",
  leadTimeDays: "",
  status: "ordered",
  notes: "",
};

export function SupplyChainPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetSupplyChainRecords(userCode);
  const addRecord = useAddSupplyChainRecord();
  const updateRecord = useUpdateSupplyChainRecord();
  const deleteRecord = useDeleteSupplyChainRecord();

  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<SupplyChainRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const filtered = records.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus,
  );

  const deliveredCount = records.filter((r) => r.status === "delivered").length;
  const delayedCount = records.filter((r) => r.status === "delayed").length;
  // Warn if expectedDate < today and not delivered/cancelled
  const overdue = records.filter(
    (r) =>
      r.expectedDate &&
      r.expectedDate < today &&
      r.status !== "delivered" &&
      r.status !== "cancelled",
  );

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: SupplyChainRecord) {
    setEditItem(r);
    setForm({
      itemName: r.itemName,
      supplierName: r.supplierName,
      category: r.category,
      orderedQuantity: r.orderedQuantity,
      deliveredQuantity: r.deliveredQuantity,
      unit: r.unit,
      orderDate: r.orderDate,
      expectedDate: r.expectedDate,
      deliveryDate: r.deliveryDate,
      leadTimeDays: r.leadTimeDays,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.itemName.trim() || !form.supplierName.trim()) {
      toast.error("Malzeme adı ve tedarikçi gerekli");
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
            <div className="p-2 rounded-lg bg-cyan-100">
              <GitMerge className="text-cyan-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Tedarik Zinciri Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Sipariş ve teslimat süreçlerini izleyin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="supplychain.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kayıt Ekle
            </Button>
          )}
        </div>

        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            ⚠ {overdue.length} sipariş beklenen teslim tarihini geçti!
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Sipariş",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Teslim Edildi",
              value: deliveredCount,
              color: "text-green-600",
            },
            {
              label: "Geciken",
              value: delayedCount + overdue.length,
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

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48" data-ocid="supplychain.select">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="supplychain.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="supplychain.empty_state"
            >
              Kayıt bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Malzeme",
                    "Tedarikçi",
                    "Kategori",
                    "Miktar",
                    "Sipariş Tarihi",
                    "Beklenen Teslim",
                    "Teslim Süresi",
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
                  const isOverdue =
                    r.expectedDate &&
                    r.expectedDate < today &&
                    r.status !== "delivered" &&
                    r.status !== "cancelled";
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 transition-colors ${isOverdue ? "bg-red-50" : ""}`}
                      data-ocid={`supplychain.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.itemName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {r.supplierName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.category || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.orderedQuantity} {r.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.orderDate || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}
                      >
                        {r.expectedDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.leadTimeDays ? `${r.leadTimeDays} gün` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`supplychain.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(r.id)}
                              data-ocid={`supplychain.delete_button.${idx + 1}`}
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
          aria-describedby="sc-dialog-desc"
          data-ocid="supplychain.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kaydı Düzenle" : "Yeni Tedarik Kaydı"}
            </DialogTitle>
            <DialogDescription id="sc-dialog-desc">
              Tedarik ve sipariş bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Malzeme Adı *</Label>
              <Input
                value={form.itemName}
                onChange={(e) => f("itemName", e.target.value)}
                placeholder="Malzeme / ekipman adı"
                data-ocid="supplychain.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Tedarikçi *</Label>
              <Input
                value={form.supplierName}
                onChange={(e) => f("supplierName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Input
                value={form.category}
                onChange={(e) => f("category", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sipariş Miktarı</Label>
              <Input
                type="number"
                value={form.orderedQuantity}
                onChange={(e) => f("orderedQuantity", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Teslim Edilen Miktar</Label>
              <Input
                type="number"
                value={form.deliveredQuantity}
                onChange={(e) => f("deliveredQuantity", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Select value={form.unit} onValueChange={(v) => f("unit", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["adet", "kg", "ton", "litre", "m", "m2", "m3", "paket"].map(
                    (u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sipariş Tarihi</Label>
              <Input
                type="date"
                value={form.orderDate}
                onChange={(e) => f("orderDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Beklenen Teslim</Label>
              <Input
                type="date"
                value={form.expectedDate}
                onChange={(e) => f("expectedDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Gerçek Teslim Tarihi</Label>
              <Input
                type="date"
                value={form.deliveryDate}
                onChange={(e) => f("deliveryDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Teslim Süresi (Gün)</Label>
              <Input
                type="number"
                value={form.leadTimeDays}
                onChange={(e) => f("leadTimeDays", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordered">Sipariş Verildi</SelectItem>
                  <SelectItem value="shipped">Kargoda</SelectItem>
                  <SelectItem value="delivered">Teslim Edildi</SelectItem>
                  <SelectItem value="delayed">Gecikti</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="supplychain.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="supplychain.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="supplychain.submit_button"
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
          aria-describedby="sc-del-desc"
          data-ocid="supplychain.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="sc-del-desc">
              Bu tedarik kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="supplychain.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="supplychain.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
