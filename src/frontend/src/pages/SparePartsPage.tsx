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
import { AlertTriangle, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SparePart {
  id: string;
  companyId: string;
  partName: string;
  partCode: string;
  compatibleEquipment: string;
  quantityInStock: number;
  minimumStock: number;
  location: string;
  supplier: string;
  unitPrice: number;
  lastRestockDate: string;
  status: "Yeterli" | "Kritik" | "Stok Yok";
}

const statusClass: Record<string, string> = {
  Yeterli: "bg-green-100 text-green-800",
  Kritik: "bg-orange-100 text-orange-800",
  "Stok Yok": "bg-red-100 text-red-800",
};

const emptyForm = {
  partName: "",
  partCode: "",
  compatibleEquipment: "",
  quantityInStock: 0,
  minimumStock: 0,
  location: "",
  supplier: "",
  unitPrice: 0,
  lastRestockDate: "",
  status: "Yeterli" as SparePart["status"],
};

export function SparePartsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<SparePart[]>([
    {
      id: "1",
      companyId,
      partName: "V Kayış 6x1060",
      partCode: "VK-6060-A",
      compatibleEquipment: "Kompresör KMP-200",
      quantityInStock: 12,
      minimumStock: 5,
      location: "Raf A-12",
      supplier: "Teknik Parça A.Ş.",
      unitPrice: 85,
      lastRestockDate: "2026-01-15",
      status: "Yeterli",
    },
    {
      id: "2",
      companyId,
      partName: "Rulman 6205-2RS",
      partCode: "RLM-6205",
      compatibleEquipment: "Konveyör Motoru M-03",
      quantityInStock: 3,
      minimumStock: 5,
      location: "Raf B-04",
      supplier: "SKF Türkiye",
      unitPrice: 220,
      lastRestockDate: "2025-12-20",
      status: "Kritik",
    },
    {
      id: "3",
      companyId,
      partName: "O-Ring Seti 50mm",
      partCode: "OR-50-KIT",
      compatibleEquipment: "Hidrolik Ünitesi HU-01",
      quantityInStock: 0,
      minimumStock: 10,
      location: "Raf C-02",
      supplier: "Hidropar Ltd.",
      unitPrice: 45,
      lastRestockDate: "2025-11-10",
      status: "Stok Yok",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const criticalCount = records.filter((r) => r.status === "Kritik").length;
  const outOfStockCount = records.filter((r) => r.status === "Stok Yok").length;
  const hasWarning = criticalCount > 0 || outOfStockCount > 0;
  const totalValue = records.reduce(
    (sum, r) => sum + r.quantityInStock * r.unitPrice,
    0,
  );

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: SparePart) => {
    setForm({
      partName: r.partName,
      partCode: r.partCode,
      compatibleEquipment: r.compatibleEquipment,
      quantityInStock: r.quantityInStock,
      minimumStock: r.minimumStock,
      location: r.location,
      supplier: r.supplier,
      unitPrice: r.unitPrice,
      lastRestockDate: r.lastRestockDate,
      status: r.status,
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...form } : r)),
      );
      toast.success("Kayıt güncellendi");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Yedek parça eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam Parça", value: records.length, color: "text-indigo-600" },
    { label: "Kritik Stok", value: criticalCount, color: "text-orange-600" },
    { label: "Stok Yok", value: outOfStockCount, color: "text-red-600" },
    {
      label: "Toplam Değer",
      value: `₺${totalValue.toLocaleString("tr-TR")}`,
      color: "text-green-600",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Package className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Yedek Parça Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Yedek parça stoklarını ve ikmal durumunu yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="spareparts.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
          </Button>
        </div>

        {hasWarning && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-orange-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{outOfStockCount} parça</strong> stokta yok,{" "}
              <strong>{criticalCount} parça</strong> kritik seviyede!
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="spareparts.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Parça Adı</th>
                <th className="px-4 py-3">Kod</th>
                <th className="px-4 py-3">Uyumlu Ekipman</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Min. Stok</th>
                <th className="px-4 py-3">Konum</th>
                <th className="px-4 py-3">Birim Fiyat</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`spareparts.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.partName}
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    {r.partCode}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.compatibleEquipment}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {r.quantityInStock}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.minimumStock}</td>
                  <td className="px-4 py-3 text-gray-600">{r.location}</td>
                  <td className="px-4 py-3 text-gray-600">
                    ₺{r.unitPrice.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusClass[r.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-gray-400 hover:text-indigo-600"
                        data-ocid={`spareparts.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`spareparts.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="spareparts.empty_state"
                  >
                    Henüz kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="spareparts-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Parçayı Düzenle" : "Yeni Yedek Parça"}
            </DialogTitle>
            <DialogDescription id="spareparts-dialog-desc">
              Yedek parça bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="spareparts.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Parça Adı</Label>
                <Input
                  value={form.partName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, partName: e.target.value }))
                  }
                  data-ocid="spareparts.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Parça Kodu</Label>
                <Input
                  value={form.partCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, partCode: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as SparePart["status"] }))
                  }
                >
                  <SelectTrigger data-ocid="spareparts.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Yeterli", "Kritik", "Stok Yok"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Uyumlu Ekipman</Label>
                <Input
                  value={form.compatibleEquipment}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      compatibleEquipment: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Stok Miktarı</Label>
                <Input
                  type="number"
                  value={form.quantityInStock}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      quantityInStock: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Min. Stok</Label>
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
              <div className="space-y-1">
                <Label>Konum</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
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
              <div className="col-span-2 space-y-1">
                <Label>Tedarikçi</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Son İkmal Tarihi</Label>
                <Input
                  type="date"
                  value={form.lastRestockDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastRestockDate: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="spareparts.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="spareparts.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="spareparts-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="spareparts-del-desc">
              Bu yedek parça kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="spareparts.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="spareparts.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
