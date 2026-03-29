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
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { useGetInventoryItems } from "../hooks/useQueries";
import type { InventoryItem } from "../types";

const categoryOptions = [
  "Yedek Parça",
  "Sarf Malzeme",
  "Ekipman",
  "Kimyasal",
  "Diğer",
];

const unitOptions = ["Adet", "Kg", "Litre", "Metre", "Kutu"];

const stockBadge = (status: string) => {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-700";
    case "low":
      return "bg-orange-100 text-orange-700";
    case "out":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const stockLabel = (status: string) => {
  switch (status) {
    case "available":
      return "Yeterli";
    case "low":
      return "Düşük";
    case "out":
      return "Tükendi";
    default:
      return status;
  }
};

const emptyForm = {
  name: "",
  category: "Yedek Parça",
  unit: "Adet",
  currentStock: "0",
  minimumStock: "1",
  location: "",
  supplierName: "",
  notes: "",
};

export function InventoryPage() {
  const { session } = useAuth();
  const { actor } = useActor();
  const qc = useQueryClient();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: items = [], isLoading } = useGetInventoryItems(userCode);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalItems = items.length;
  const availableItems = items.filter((i) => i.status === "available").length;
  const lowItems = items.filter((i) => i.status === "low").length;
  const outItems = items.filter((i) => i.status === "out").length;
  const hasWarning = lowItems > 0 || outItems > 0;

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: String(item.currentStock),
      minimumStock: String(item.minimumStock),
      location: item.location,
      supplierName: item.supplierName,
      notes: item.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!actor || !adminCode) return;
    if (!form.name.trim()) {
      toast.error("Malzeme adı zorunludur");
      return;
    }
    setSaving(true);
    try {
      const currentStock = Number.parseInt(form.currentStock) || 0;
      const minimumStock = Number.parseInt(form.minimumStock) || 1;
      if (editTarget) {
        await (actor as any).updateInventoryItem(
          adminCode,
          editTarget.id,
          form.name,
          form.category,
          form.unit,
          BigInt(currentStock),
          BigInt(minimumStock),
          form.location,
          form.supplierName,
          form.notes,
        );
        toast.success("Kalem güncellendi");
      } else {
        await (actor as any).addInventoryItem(
          adminCode,
          form.name,
          form.category,
          form.unit,
          BigInt(currentStock),
          BigInt(minimumStock),
          form.location,
          form.supplierName,
          form.notes,
        );
        toast.success("Kalem eklendi");
      }
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDialogOpen(false);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !adminCode || !deleteId) return;
    setDeleting(true);
    try {
      await (actor as any).deleteInventoryItem(adminCode, deleteId);
      toast.success("Kalem silindi");
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Envanter & Yedek Parça
              </h1>
              <p className="text-sm text-gray-500">Stok ve malzeme takibi</p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="inventory.primary_button"
            >
              <Plus size={16} className="mr-2" />
              Kalem Ekle
            </Button>
          )}
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Toplam Kalem</div>
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Stok Yeterli</div>
            <div className="text-2xl font-bold text-green-600">
              {availableItems}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Düşük Stok</div>
            <div className="text-2xl font-bold text-orange-500">{lowItems}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="text-xs text-gray-500 mb-1">Stok Yok</div>
            <div className="text-2xl font-bold text-red-500">{outItems}</div>
          </div>
        </motion.div>

        {/* Low stock warning */}
        {hasWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6"
          >
            <AlertTriangle
              size={18}
              className="text-orange-500 flex-shrink-0"
            />
            <span className="text-sm text-orange-700 font-medium">
              {outItems > 0
                ? `${outItems} kalem tükendi, ${lowItems} kalem düşük stokta.`
                : `${lowItems} kalem düşük stokta.`}{" "}
              Tedarikçilerle iletişime geçin.
            </span>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div
              className="flex items-center justify-center py-16 text-gray-400"
              data-ocid="inventory.loading_state"
            >
              <Loader2 size={24} className="animate-spin mr-2" />
              Yükleniyor...
            </div>
          ) : items.length === 0 ? (
            <div
              className="text-center py-16 text-gray-400"
              data-ocid="inventory.empty_state"
            >
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Henüz kalem yok</p>
              {isAdmin && (
                <p className="text-sm mt-1">
                  İlk kalemi eklemek için yukarıdaki butona tıklayın
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="inventory.table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Malzeme
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Min. Stok
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Konum
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    {isAdmin && (
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        İşlem
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      data-ocid={`inventory.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {item.name}
                        </div>
                        <div className="text-xs text-gray-400">{item.unit}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {Number(item.currentStock)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500 text-sm hidden sm:table-cell">
                        {Number(item.minimumStock)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {item.location || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stockBadge(item.status)}`}
                        >
                          {stockLabel(item.status)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => openEdit(item)}
                              data-ocid={`inventory.edit_button.${idx + 1}`}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(item.id)}
                              data-ocid={`inventory.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => !o && setDialogOpen(false)}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="inventory.dialog"
          aria-describedby="inventory-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Kalem Düzenle" : "Yeni Kalem Ekle"}
            </DialogTitle>
            <DialogDescription id="inventory-dialog-description">
              Stok bilgilerini doldurun
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="inv-name">Malzeme Adı *</Label>
              <Input
                id="inv-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Malzeme adı"
                data-ocid="inventory.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setField("category", v)}
                >
                  <SelectTrigger data-ocid="inventory.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Birim</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setField("unit", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="inv-current">Mevcut Stok</Label>
                <Input
                  id="inv-current"
                  type="number"
                  min="0"
                  value={form.currentStock}
                  onChange={(e) => setField("currentStock", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="inv-min">Minimum Stok</Label>
                <Input
                  id="inv-min"
                  type="number"
                  min="0"
                  value={form.minimumStock}
                  onChange={(e) => setField("minimumStock", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv-location">Konum</Label>
              <Input
                id="inv-location"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="Depo A, Raf 3..."
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv-supplier">Tedarikçi</Label>
              <Input
                id="inv-supplier"
                value={form.supplierName}
                onChange={(e) => setField("supplierName", e.target.value)}
                placeholder="Tedarikçi adı"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="inv-notes">Notlar</Label>
              <Textarea
                id="inv-notes"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Ek bilgiler"
                rows={2}
                data-ocid="inventory.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="inventory.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="inventory.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent
          data-ocid="inventory.modal"
          aria-describedby="inventory-delete-description"
        >
          <DialogHeader>
            <DialogTitle>Kalemi Sil</DialogTitle>
            <DialogDescription id="inventory-delete-description">
              Bu stok kalemi kalıcı olarak silinecek. Devam etmek istiyor
              musunuz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="inventory.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              data-ocid="inventory.confirm_button"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
