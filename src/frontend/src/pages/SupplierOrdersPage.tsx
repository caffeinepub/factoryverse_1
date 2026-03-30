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
import { AlertTriangle, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSupplierOrder,
  useDeleteSupplierOrder,
  useGetSupplierOrders,
  useUpdateSupplierOrder,
} from "../hooks/useQueries";
import type { SupplierOrder } from "../types";

const statusClass: Record<string, string> = {
  "Sipariş Verildi": "bg-blue-100 text-blue-800",
  Yolda: "bg-orange-100 text-orange-800",
  "Teslim Alındı": "bg-green-100 text-green-800",
  İptal: "bg-red-100 text-red-800",
  Gecikmiş: "bg-rose-100 text-rose-800",
};

const emptyForm = {
  orderNumber: "",
  supplierName: "",
  orderDate: "",
  expectedDelivery: "",
  actualDelivery: "",
  itemDescription: "",
  quantity: "",
  unit: "Adet",
  unitPrice: "",
  currency: "TRY",
  totalAmount: "",
  responsiblePerson: "",
  status: "Sipariş Verildi",
  notes: "",
};

export function SupplierOrdersPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetSupplierOrders(companyId);
  const addMut = useAddSupplierOrder();
  const updateMut = useUpdateSupplierOrder();
  const deleteMut = useDeleteSupplierOrder();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierOrder | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<SupplierOrder | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: SupplierOrder) {
    setEditing(r);
    setForm({
      orderNumber: r.orderNumber,
      supplierName: r.supplierName,
      orderDate: r.orderDate,
      expectedDelivery: r.expectedDelivery,
      actualDelivery: r.actualDelivery,
      itemDescription: r.itemDescription,
      quantity: r.quantity,
      unit: r.unit,
      unitPrice: r.unitPrice,
      currency: r.currency,
      totalAmount: r.totalAmount,
      responsiblePerson: r.responsiblePerson,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.supplierName) {
      toast.error("Tedarikçi adı zorunludur.");
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

  async function handleDelete(r: SupplierOrder) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const today = new Date();
  const delayedCount = records.filter((r) => {
    if (r.status === "Teslim Alındı" || r.status === "İptal") return false;
    if (!r.expectedDelivery) return false;
    return new Date(r.expectedDelivery) < today;
  }).length;

  const totalValue = records.reduce(
    (s, r) => s + (Number.parseFloat(r.totalAmount) || 0),
    0,
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <ShoppingBag className="text-violet-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Tedarikçi Sipariş Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Tedarikçi sipariş ve teslimat durumu takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="supplier-orders.primary_button"
            >
              <Plus size={16} className="mr-1" /> Sipariş Ekle
            </Button>
          )}
        </div>

        {delayedCount > 0 && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-rose-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {delayedCount} sipariş beklenen teslimat tarihini geçti!
            </span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Toplam Sipariş", val: records.length, color: "indigo" },
            {
              label: "Yolda",
              val: records.filter((r) => r.status === "Yolda").length,
              color: "orange",
            },
            {
              label: "Teslim Alındı",
              val: records.filter((r) => r.status === "Teslim Alındı").length,
              color: "green",
            },
            {
              label: "Toplam Tutar",
              val: `₺${totalValue.toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`,
              color: "violet",
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
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="supplier-orders.empty_state"
            >
              Henüz sipariş kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Sipariş No",
                      "Tedarikçi",
                      "Ürün/Açıklama",
                      "Miktar",
                      "Birim Fiyat",
                      "Toplam",
                      "Sipariş Tarihi",
                      "Beklenen Teslimat",
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
                      data-ocid={`supplier-orders.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.orderNumber}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.supplierName}
                      </td>
                      <td className="px-4 py-3">{r.itemDescription}</td>
                      <td className="px-4 py-3">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="px-4 py-3">
                        {r.unitPrice} {r.currency}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.totalAmount} {r.currency}
                      </td>
                      <td className="px-4 py-3 text-xs">{r.orderDate}</td>
                      <td className="px-4 py-3 text-xs">
                        {r.expectedDelivery}
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
                              data-ocid={`supplier-orders.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`supplier-orders.delete_button.${i + 1}`}
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
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="supplier-orders.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Sipariş Düzenle" : "Sipariş Ekle"}
              </DialogTitle>
              <DialogDescription>
                Tedarikçi sipariş bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Sipariş Numarası</Label>
                <Input
                  value={form.orderNumber}
                  onChange={(e) => sf("orderNumber", e.target.value)}
                  data-ocid="supplier-orders.input"
                />
              </div>
              <div>
                <Label>Tedarikçi Adı *</Label>
                <Input
                  value={form.supplierName}
                  onChange={(e) => sf("supplierName", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Ürün/Hizmet Açıklaması</Label>
                <Input
                  value={form.itemDescription}
                  onChange={(e) => sf("itemDescription", e.target.value)}
                />
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => sf("quantity", e.target.value)}
                />
              </div>
              <div>
                <Label>Birim</Label>
                <Select value={form.unit} onValueChange={(v) => sf("unit", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Adet", "Kg", "Ton", "Lt", "m²", "m³", "Paket"].map(
                      (u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Birim Fiyat</Label>
                <Input
                  type="number"
                  value={form.unitPrice}
                  onChange={(e) => sf("unitPrice", e.target.value)}
                />
              </div>
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => sf("currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["TRY", "USD", "EUR", "GBP"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Toplam Tutar</Label>
                <Input
                  type="number"
                  value={form.totalAmount}
                  onChange={(e) => sf("totalAmount", e.target.value)}
                />
              </div>
              <div>
                <Label>Sipariş Tarihi</Label>
                <Input
                  type="date"
                  value={form.orderDate}
                  onChange={(e) => sf("orderDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Beklenen Teslimat</Label>
                <Input
                  type="date"
                  value={form.expectedDelivery}
                  onChange={(e) => sf("expectedDelivery", e.target.value)}
                />
              </div>
              <div>
                <Label>Gerçek Teslimat</Label>
                <Input
                  type="date"
                  value={form.actualDelivery}
                  onChange={(e) => sf("actualDelivery", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsiblePerson}
                  onChange={(e) => sf("responsiblePerson", e.target.value)}
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
                    {[
                      "Sipariş Verildi",
                      "Yolda",
                      "Teslim Alındı",
                      "Gecikmiş",
                      "İptal",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
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
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="supplier-orders.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="supplier-orders.submit_button"
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
              <DialogTitle>Sipariş Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.supplierName} siparişini silmek istediğinizden
                emin misiniz?
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
