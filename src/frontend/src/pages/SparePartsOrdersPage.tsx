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
import { AlertTriangle, Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SparePartsOrder {
  id: string;
  companyId: string;
  orderNo: string;
  partName: string;
  partCode: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status:
    | "Beklemede"
    | "Sipariş Verildi"
    | "Kargoda"
    | "Teslim Edildi"
    | "İptal";
  notes: string;
}

const statusClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  "Sipariş Verildi": "bg-blue-100 text-blue-800",
  Kargoda: "bg-purple-100 text-purple-800",
  "Teslim Edildi": "bg-green-100 text-green-800",
  İptal: "bg-red-100 text-red-800",
};

const emptyForm = {
  orderNo: "",
  partName: "",
  partCode: "",
  quantity: 1,
  unitPrice: 0,
  supplier: "",
  orderDate: "",
  expectedDate: "",
  status: "Beklemede" as SparePartsOrder["status"],
  notes: "",
};

function isDelayed(expectedDate: string, status: SparePartsOrder["status"]) {
  if (status === "Teslim Edildi" || status === "İptal") return false;
  if (!expectedDate) return false;
  return new Date(expectedDate) < new Date();
}

export function SparePartsOrdersPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<SparePartsOrder[]>([
    {
      id: "1",
      companyId,
      orderNo: "SPO-2026-001",
      partName: "Rulman 6205-2RS",
      partCode: "RLM-6205",
      quantity: 10,
      unitPrice: 220,
      supplier: "SKF Türkiye",
      orderDate: "2026-03-01",
      expectedDate: "2026-03-15",
      status: "Kargoda",
      notes: "Acil sipariş",
    },
    {
      id: "2",
      companyId,
      orderNo: "SPO-2026-002",
      partName: "O-Ring Seti 50mm",
      partCode: "OR-50-KIT",
      quantity: 20,
      unitPrice: 45,
      supplier: "Hidropar Ltd.",
      orderDate: "2026-03-10",
      expectedDate: "2026-03-20",
      status: "Sipariş Verildi",
      notes: "",
    },
    {
      id: "3",
      companyId,
      orderNo: "SPO-2026-003",
      partName: "V Kayış 6x1060",
      partCode: "VK-6060-A",
      quantity: 5,
      unitPrice: 85,
      supplier: "Teknik Parça A.Ş.",
      orderDate: "2026-02-20",
      expectedDate: "2026-03-05",
      status: "Teslim Edildi",
      notes: "Teslim tamam",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const delayedCount = records.filter((r) =>
    isDelayed(r.expectedDate, r.status),
  ).length;
  const pendingCount = records.filter(
    (r) =>
      r.status === "Beklemede" ||
      r.status === "Sipariş Verildi" ||
      r.status === "Kargoda",
  ).length;
  const totalValue = records.reduce(
    (sum, r) => sum + r.quantity * r.unitPrice,
    0,
  );

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: SparePartsOrder) => {
    setForm({
      orderNo: r.orderNo,
      partName: r.partName,
      partCode: r.partCode,
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      supplier: r.supplier,
      orderDate: r.orderDate,
      expectedDate: r.expectedDate,
      status: r.status,
      notes: r.notes,
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
      toast.success("Sipariş eklendi");
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
      label: "Toplam Sipariş",
      value: records.length,
      color: "text-indigo-600",
    },
    { label: "Aktif Sipariş", value: pendingCount, color: "text-blue-600" },
    { label: "Geciken", value: delayedCount, color: "text-red-600" },
    {
      label: "Toplam Tutar",
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
              <ShoppingCart className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Yedek Parça Siparişleri
              </h1>
              <p className="text-sm text-gray-500">
                Yedek parça sipariş süreçlerini takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
          >
            + Sipariş Ekle
          </Button>
        </div>

        {delayedCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{delayedCount} sipariş</strong> beklenen teslim tarihini
              geçti!
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
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Sipariş No</th>
                <th className="px-4 py-3">Parça Adı</th>
                <th className="px-4 py-3">Tedarikçi</th>
                <th className="px-4 py-3">Miktar</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Sipariş Tarihi</th>
                <th className="px-4 py-3">Beklenen Teslim</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    isDelayed(r.expectedDate, r.status) ? "bg-red-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {r.orderNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.partName}
                    <span className="ml-1 text-xs text-gray-400">
                      ({r.partCode})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.supplier}</td>
                  <td className="px-4 py-3 font-semibold">{r.quantity}</td>
                  <td className="px-4 py-3 text-gray-700">
                    ₺{(r.quantity * r.unitPrice).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.orderDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        isDelayed(r.expectedDate, r.status)
                          ? "text-red-600 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {r.expectedDate}
                      {isDelayed(r.expectedDate, r.status) && " ⚠"}
                    </span>
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
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Henüz sipariş yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="spo-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Siparişi Düzenle" : "Yeni Sipariş"}
            </DialogTitle>
            <DialogDescription id="spo-dialog-desc">
              Yedek parça sipariş bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Sipariş No</Label>
                <Input
                  value={form.orderNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, orderNo: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      status: v as SparePartsOrder["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Beklemede",
                      "Sipariş Verildi",
                      "Kargoda",
                      "Teslim Edildi",
                      "İptal",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Parça Adı</Label>
                <Input
                  value={form.partName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, partName: e.target.value }))
                  }
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
                <Label>Miktar</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: Number(e.target.value) }))
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
              <div className="space-y-1">
                <Label>Sipariş Tarihi</Label>
                <Input
                  type="date"
                  value={form.orderDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, orderDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Beklenen Teslim</Label>
                <Input
                  type="date"
                  value={form.expectedDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expectedDate: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notlar</Label>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="spo-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="spo-del-desc">
              Bu sipariş kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
