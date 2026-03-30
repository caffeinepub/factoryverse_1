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
import { Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface CustomerOrder {
  id: string;
  siparisNo: string;
  musteriAdi: string;
  urun: string;
  miktar: number;
  birim: string;
  siparisTarihi: string;
  teslimatTarihi: string;
  oncelik: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  durum: "Yeni" | "İşlemde" | "Hazır" | "Teslim Edildi" | "İptal";
}

const priorityClass: Record<string, string> = {
  Düşük: "bg-gray-100 text-gray-700",
  Orta: "bg-blue-100 text-blue-700",
  Yüksek: "bg-amber-100 text-amber-700",
  Kritik: "bg-red-100 text-red-700",
};

const statusClass: Record<string, string> = {
  Yeni: "bg-gray-100 text-gray-700",
  İşlemde: "bg-blue-100 text-blue-700",
  Hazır: "bg-green-100 text-green-700",
  "Teslim Edildi": "bg-emerald-100 text-emerald-700",
  İptal: "bg-red-100 text-red-700",
};

const emptyForm = {
  siparisNo: "",
  musteriAdi: "",
  urun: "",
  miktar: 0,
  birim: "Adet",
  siparisTarihi: "",
  teslimatTarihi: "",
  oncelik: "Orta" as CustomerOrder["oncelik"],
  durum: "Yeni" as CustomerOrder["durum"],
};

const SEED: CustomerOrder[] = [
  {
    id: "1",
    siparisNo: "SP-2026-001",
    musteriAdi: "ABC Otomotiv A.Ş.",
    urun: "Konveyör Bandı Modülü",
    miktar: 5,
    birim: "Adet",
    siparisTarihi: "2026-03-01",
    teslimatTarihi: "2026-04-15",
    oncelik: "Yüksek",
    durum: "İşlemde",
  },
  {
    id: "2",
    siparisNo: "SP-2026-002",
    musteriAdi: "XYZ Sanayi Ltd.",
    urun: "Hidrolik Silindir",
    miktar: 20,
    birim: "Adet",
    siparisTarihi: "2026-03-05",
    teslimatTarihi: "2026-04-20",
    oncelik: "Orta",
    durum: "Hazır",
  },
  {
    id: "3",
    siparisNo: "SP-2026-003",
    musteriAdi: "Mega Holding",
    urun: "CNC İşlenmiş Parça",
    miktar: 100,
    birim: "Kg",
    siparisTarihi: "2026-02-20",
    teslimatTarihi: "2026-03-30",
    oncelik: "Kritik",
    durum: "Teslim Edildi",
  },
  {
    id: "4",
    siparisNo: "SP-2026-004",
    musteriAdi: "Teknoloji Grubu",
    urun: "Sensör Montaj Kiti",
    miktar: 50,
    birim: "Takım",
    siparisTarihi: "2026-03-10",
    teslimatTarihi: "2026-05-01",
    oncelik: "Düşük",
    durum: "Yeni",
  },
  {
    id: "5",
    siparisNo: "SP-2026-005",
    musteriAdi: "Beta Makine",
    urun: "Redüktör Dişlisi",
    miktar: 10,
    birim: "Adet",
    siparisTarihi: "2026-01-15",
    teslimatTarihi: "2026-02-28",
    oncelik: "Yüksek",
    durum: "İptal",
  },
];

export function CustomerOrdersPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? "guest";
  const isAdmin = session?.userType === "admin";

  const storageKey = `customer_orders_${userCode}`;
  const [records, setRecords] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });

  const save = (updated: CustomerOrder[]) => {
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterDurum, setFilterDurum] = useState<string>("Tümü");

  const filtered =
    filterDurum === "Tümü"
      ? records
      : records.filter((r) => r.durum === filterDurum);

  const pending = records.filter(
    (r) => r.durum === "Yeni" || r.durum === "İşlemde",
  ).length;
  const delivered = records.filter((r) => r.durum === "Teslim Edildi").length;
  const cancelled = records.filter((r) => r.durum === "İptal").length;

  const stats = [
    {
      label: "Toplam Sipariş",
      value: records.length,
      color: "text-indigo-600",
    },
    { label: "Bekleyen", value: pending, color: "text-amber-600" },
    { label: "Teslim Edildi", value: delivered, color: "text-green-600" },
    { label: "İptal", value: cancelled, color: "text-red-600" },
  ];

  const handleSave = () => {
    const newRec: CustomerOrder = { id: Date.now().toString(), ...form };
    save([newRec, ...records]);
    toast.success("Sipariş eklendi");
    setDialogOpen(false);
    setForm({ ...emptyForm });
  };

  const handleDelete = () => {
    save(records.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Sipariş silindi");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ShoppingBag className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Müşteri Sipariş Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Müşteri siparişlerini ve teslimat durumlarını yönetin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setDialogOpen(true)}
              data-ocid="orders.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Yeni Sipariş
            </Button>
          )}
        </div>

        {/* Stats */}
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

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Filtrele:</span>
          <div className="w-48">
            <Select value={filterDurum} onValueChange={setFilterDurum}>
              <SelectTrigger data-ocid="orders.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Tümü",
                  "Yeni",
                  "İşlemde",
                  "Hazır",
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="orders.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Sipariş No</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Ürün</th>
                <th className="px-4 py-3">Miktar</th>
                <th className="px-4 py-3">Teslimat Tarihi</th>
                <th className="px-4 py-3">Öncelik</th>
                <th className="px-4 py-3">Durum</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`orders.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">
                    {r.siparisNo}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.musteriAdi}</td>
                  <td className="px-4 py-3 text-gray-700">{r.urun}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.miktar} {r.birim}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.teslimatTarihi}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[r.oncelik] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {r.oncelik}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.durum] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {r.durum}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`orders.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="orders.empty_state"
                  >
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="orders-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>Yeni Müşteri Siparişi</DialogTitle>
            <DialogDescription id="orders-dialog-desc">
              Sipariş bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="orders.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Sipariş No</Label>
                <Input
                  value={form.siparisNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, siparisNo: e.target.value }))
                  }
                  data-ocid="orders.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Müşteri Adı</Label>
                <Input
                  value={form.musteriAdi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, musteriAdi: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Ürün / Hizmet</Label>
                <Input
                  value={form.urun}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, urun: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Miktar</Label>
                <Input
                  type="number"
                  value={form.miktar}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, miktar: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Birim</Label>
                <Input
                  value={form.birim}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, birim: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Sipariş Tarihi</Label>
                <Input
                  type="date"
                  value={form.siparisTarihi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, siparisTarihi: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Teslimat Tarihi</Label>
                <Input
                  type="date"
                  value={form.teslimatTarihi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, teslimatTarihi: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Öncelik</Label>
                <Select
                  value={form.oncelik}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      oncelik: v as CustomerOrder["oncelik"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="orders.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Kritik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.durum}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      durum: v as CustomerOrder["durum"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Yeni", "İşlemde", "Hazır", "Teslim Edildi", "İptal"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="orders.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="orders.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="orders-del-desc">
          <DialogHeader>
            <DialogTitle>Siparişi Sil</DialogTitle>
            <DialogDescription id="orders-del-desc">
              Bu sipariş kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="orders.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="orders.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
