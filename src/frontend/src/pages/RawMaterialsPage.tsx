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
import { AlertTriangle, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface RawMaterial {
  id: string;
  companyId: string;
  materialName: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  supplier: string;
  unitPrice: number;
  lastUpdated: string;
}

function getStockStatus(
  current: number,
  minimum: number,
): "Kritik" | "Uyarı" | "Normal" {
  if (current < minimum) return "Kritik";
  if (current < minimum * 1.3) return "Uyarı";
  return "Normal";
}

const statusClass: Record<string, string> = {
  Kritik: "bg-red-100 text-red-800",
  Uyarı: "bg-amber-100 text-amber-800",
  Normal: "bg-green-100 text-green-800",
};

const emptyForm = {
  materialName: "",
  category: "Metal",
  unit: "Adet",
  currentStock: 0,
  minimumStock: 0,
  supplier: "",
  unitPrice: 0,
  lastUpdated: new Date().toISOString().split("T")[0],
};

export function RawMaterialsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<RawMaterial[]>([
    {
      id: "1",
      companyId,
      materialName: "Çelik Boru Ø50mm",
      category: "Metal",
      unit: "Adet",
      currentStock: 150,
      minimumStock: 50,
      supplier: "MetalMart A.Ş.",
      unitPrice: 85,
      lastUpdated: "2026-03-15",
    },
    {
      id: "2",
      companyId,
      materialName: "Alüminyum Profil 6063",
      category: "Metal",
      unit: "Metre",
      currentStock: 45,
      minimumStock: 100,
      supplier: "Alüm-Tek Ltd.",
      unitPrice: 120,
      lastUpdated: "2026-03-10",
    },
    {
      id: "3",
      companyId,
      materialName: "Polietilen Granül",
      category: "Polimer",
      unit: "Kg",
      currentStock: 2800,
      minimumStock: 1000,
      supplier: "Petrokimya A.Ş.",
      unitPrice: 32,
      lastUpdated: "2026-03-20",
    },
    {
      id: "4",
      companyId,
      materialName: "Endüstriyel Boyar Madde",
      category: "Kimyasal",
      unit: "Litre",
      currentStock: 85,
      minimumStock: 200,
      supplier: "Kim-San Ltd.",
      unitPrice: 215,
      lastUpdated: "2026-02-28",
    },
    {
      id: "5",
      companyId,
      materialName: "Yüksek Yoğunluklu Köpük",
      category: "Hammadde",
      unit: "M³",
      currentStock: 12,
      minimumStock: 10,
      supplier: "FoamTech A.Ş.",
      unitPrice: 450,
      lastUpdated: "2026-03-18",
    },
    {
      id: "6",
      companyId,
      materialName: "Bakır Tel 2.5mm²",
      category: "Elektrik",
      unit: "Metre",
      currentStock: 320,
      minimumStock: 500,
      supplier: "ElektroMet A.Ş.",
      unitPrice: 18,
      lastUpdated: "2026-03-05",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const criticalCount = records.filter(
    (r) => getStockStatus(r.currentStock, r.minimumStock) === "Kritik",
  ).length;
  const warningCount = records.filter(
    (r) => getStockStatus(r.currentStock, r.minimumStock) === "Uyarı",
  ).length;
  const totalValue = records.reduce(
    (s, r) => s + r.currentStock * r.unitPrice,
    0,
  );
  const supplierCount = new Set(records.map((r) => r.supplier)).size;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: RawMaterial) => {
    setForm({
      materialName: r.materialName,
      category: r.category,
      unit: r.unit,
      currentStock: r.currentStock,
      minimumStock: r.minimumStock,
      supplier: r.supplier,
      unitPrice: r.unitPrice,
      lastUpdated: r.lastUpdated,
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...form } : r)),
      );
      toast.success("Hammadde güncellendi");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Hammadde eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    {
      label: "Toplam Malzeme",
      value: records.length,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Kritik Stok",
      value: criticalCount,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Uyarı Seviyesi",
      value: warningCount,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Tedarikçi Sayısı",
      value: supplierCount,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  const categories = [
    "Metal",
    "Polimer",
    "Kimyasal",
    "Elektrik",
    "Hammadde",
    "Diğer",
  ];
  const units = ["Adet", "Kg", "Metre", "Litre", "M³", "Ton", "Paket"];

  return (
    <AppLayout title="Hammadde Takibi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Layers className="text-violet-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Hammadde Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Hammadde envanteri ve stok durumu yönetimi
              </p>
            </div>
          </div>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={openAdd}
            data-ocid="rawmaterials.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Malzeme Ekle
          </Button>
        </div>

        {/* Warning banner */}
        {(criticalCount > 0 || warningCount > 0) && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              {criticalCount > 0 && (
                <>
                  <strong>{criticalCount} malzeme</strong> kritik stok
                  seviyesinde!{" "}
                </>
              )}
              {warningCount > 0 && (
                <>
                  <strong>{warningCount} malzeme</strong> uyarı seviyesinde.
                </>
              )}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`${s.bg} rounded-xl border border-white shadow-sm p-4`}
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold font-display ${s.color}`}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Total value */}
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-100 px-5 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Toplam Stok Değeri
          </span>
          <span className="text-xl font-bold font-display text-violet-700">
            ₺{totalValue.toLocaleString("tr-TR")}
          </span>
        </div>

        {/* Table - desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="rawmaterials.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Malzeme Adı</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Birim</th>
                <th className="px-4 py-3">Mevcut Stok</th>
                <th className="px-4 py-3">Min. Stok</th>
                <th className="px-4 py-3">Tedarikçi</th>
                <th className="px-4 py-3">Birim Fiyat</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Son Güncelleme</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const status = getStockStatus(r.currentStock, r.minimumStock);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    data-ocid={`rawmaterials.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.materialName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.category}</td>
                    <td className="px-4 py-3 text-gray-600">{r.unit}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {r.currentStock.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.minimumStock.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.supplier}</td>
                    <td className="px-4 py-3 text-gray-600">
                      ₺{r.unitPrice.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusClass[status] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.lastUpdated}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="text-gray-400 hover:text-violet-600"
                          data-ocid={`rawmaterials.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500"
                          data-ocid={`rawmaterials.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="rawmaterials.empty_state"
                  >
                    Henüz hammadde kaydı yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards - mobile */}
        <div className="md:hidden space-y-3">
          {records.map((r, idx) => {
            const status = getStockStatus(r.currentStock, r.minimumStock);
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 p-4 space-y-2"
                data-ocid={`rawmaterials.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {r.materialName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {r.category} · {r.supplier}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[status]}`}
                  >
                    {status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                  <span>
                    Stok:{" "}
                    <strong>
                      {r.currentStock} {r.unit}
                    </strong>
                  </span>
                  <span>
                    Min:{" "}
                    <strong>
                      {r.minimumStock} {r.unit}
                    </strong>
                  </span>
                  <span>
                    Fiyat: <strong>₺{r.unitPrice}</strong>
                  </span>
                  <span>
                    Güncelleme: <strong>{r.lastUpdated}</strong>
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="text-gray-400 hover:text-violet-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
          {records.length === 0 && (
            <div
              className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center"
              data-ocid="rawmaterials.empty_state"
            >
              <Layers size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">Henüz hammadde kaydı yok</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="rawmaterials-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Malzemeyi Düzenle" : "Yeni Hammadde"}
            </DialogTitle>
            <DialogDescription id="rawmaterials-dialog-desc">
              Hammadde bilgilerini doldurun.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="rawmaterials.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Malzeme Adı</Label>
                <Input
                  value={form.materialName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, materialName: e.target.value }))
                  }
                  data-ocid="rawmaterials.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger data-ocid="rawmaterials.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Birim</Label>
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((p) => ({ ...p, unit: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Mevcut Stok</Label>
                <Input
                  type="number"
                  value={form.currentStock}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      currentStock: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Minimum Stok</Label>
                <Input
                  type="number"
                  value={form.minimumStock}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      minimumStock: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Tedarikçi</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Birim Fiyat (₺)</Label>
                <Input
                  type="number"
                  value={form.unitPrice}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      unitPrice: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Son Güncelleme</Label>
                <Input
                  type="date"
                  value={form.lastUpdated}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastUpdated: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="rawmaterials.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleSave}
              data-ocid="rawmaterials.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="rawmaterials-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="rawmaterials-del-desc">
              Bu hammadde kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="rawmaterials.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="rawmaterials.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
