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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Plus, Receipt, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface Invoice {
  id: string;
  tip: "gelen" | "giden";
  faturaNo: string;
  taraf: string;
  tutar: number;
  paraBirimi: "TRY" | "USD" | "EUR";
  vadeTarihi: string;
  odemeDurumu: "Ödendi" | "Beklemede" | "Vadesi Geçti";
  aciklama: string;
}

const statusClass: Record<string, string> = {
  Ödendi: "bg-green-100 text-green-800",
  Beklemede: "bg-amber-100 text-amber-800",
  "Vadesi Geçti": "bg-red-100 text-red-800",
};

const today = new Date();
const todayStr = today.toISOString().split("T")[0];
const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];

function computeStatus(
  vadeTarihi: string,
  current: Invoice["odemeDurumu"],
): Invoice["odemeDurumu"] {
  if (current === "Ödendi") return "Ödendi";
  if (vadeTarihi < todayStr) return "Vadesi Geçti";
  return "Beklemede";
}

const emptyForm = {
  tip: "gelen" as Invoice["tip"],
  faturaNo: "",
  taraf: "",
  tutar: 0,
  paraBirimi: "TRY" as Invoice["paraBirimi"],
  vadeTarihi: "",
  odemeDurumu: "Beklemede" as Invoice["odemeDurumu"],
  aciklama: "",
};

const SEED: Invoice[] = [
  {
    id: "1",
    tip: "gelen",
    faturaNo: "FTR-2026-001",
    taraf: "Teknik Malzeme A.Ş.",
    tutar: 45000,
    paraBirimi: "TRY",
    vadeTarihi: "2026-04-15",
    odemeDurumu: "Beklemede",
    aciklama: "Yedek parça tedariki",
  },
  {
    id: "2",
    tip: "gelen",
    faturaNo: "FTR-2026-002",
    taraf: "Enerji Dağıtım Ltd.",
    tutar: 12800,
    paraBirimi: "TRY",
    vadeTarihi: "2026-02-28",
    odemeDurumu: "Vadesi Geçti",
    aciklama: "Elektrik faturası",
  },
  {
    id: "3",
    tip: "gelen",
    faturaNo: "FTR-2026-003",
    taraf: "SKF Türkiye",
    tutar: 8500,
    paraBirimi: "EUR",
    vadeTarihi: "2026-04-30",
    odemeDurumu: "Ödendi",
    aciklama: "Rulman siparişi",
  },
  {
    id: "4",
    tip: "giden",
    faturaNo: "GDN-2026-001",
    taraf: "ABC Müşteri Sanayi",
    tutar: 180000,
    paraBirimi: "TRY",
    vadeTarihi: "2026-04-10",
    odemeDurumu: "Beklemede",
    aciklama: "Üretim çıktısı",
  },
  {
    id: "5",
    tip: "giden",
    faturaNo: "GDN-2026-002",
    taraf: "XYZ Otomotiv",
    tutar: 95000,
    paraBirimi: "TRY",
    vadeTarihi: "2026-03-20",
    odemeDurumu: "Ödendi",
    aciklama: "Parça teslimatı",
  },
  {
    id: "6",
    tip: "giden",
    faturaNo: "GDN-2026-003",
    taraf: "Mega Holding",
    tutar: 25000,
    paraBirimi: "USD",
    vadeTarihi: "2026-02-15",
    odemeDurumu: "Vadesi Geçti",
    aciklama: "Servis bedeli",
  },
];

export function InvoiceManagementPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? "guest";
  const isAdmin = session?.userType === "admin";

  const storageKey = `invoices_${userCode}`;
  const [records, setRecords] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });

  const save = (updated: Invoice[]) => {
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [formTip, setFormTip] = useState<Invoice["tip"]>("gelen");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const gelenList = records.filter((r) => r.tip === "gelen");
  const gidenList = records.filter((r) => r.tip === "giden");

  const totalInvoices = records.length;
  const pendingAmount = records
    .filter((r) => r.odemeDurumu !== "Ödendi" && r.paraBirimi === "TRY")
    .reduce((s, r) => s + r.tutar, 0);
  const overdueCount = records.filter(
    (r) => r.odemeDurumu === "Vadesi Geçti",
  ).length;

  const stats = [
    { label: "Toplam Fatura", value: totalInvoices, color: "text-indigo-600" },
    {
      label: "Bekleyen Tutar (TRY)",
      value: `₺${pendingAmount.toLocaleString("tr-TR")}`,
      color: "text-amber-600",
    },
    { label: "Vadesi Geçen", value: overdueCount, color: "text-red-600" },
    {
      label: "Ödenen",
      value: records.filter((r) => r.odemeDurumu === "Ödendi").length,
      color: "text-green-600",
    },
  ];

  const openAdd = (tip: Invoice["tip"]) => {
    setFormTip(tip);
    setForm({ ...emptyForm, tip });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const status = computeStatus(form.vadeTarihi, form.odemeDurumu);
    const newRec: Invoice = {
      id: Date.now().toString(),
      ...form,
      tip: formTip,
      odemeDurumu: status,
    };
    save([newRec, ...records]);
    toast.success("Fatura eklendi");
    setDialogOpen(false);
  };

  const handleDelete = () => {
    save(records.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Fatura silindi");
  };

  const InvoiceTable = ({
    list,
    tip,
  }: { list: Invoice[]; tip: Invoice["tip"] }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-700">
          {tip === "gelen" ? "Gelen Faturalar" : "Giden Faturalar"} (
          {list.length})
        </span>
        {isAdmin && (
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => openAdd(tip)}
            data-ocid={`invoice.${tip}.open_modal_button`}
          >
            <Plus size={14} className="mr-1" /> Ekle
          </Button>
        )}
      </div>
      <table className="w-full text-sm" data-ocid={`invoice.${tip}.table`}>
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Fatura No</th>
            <th className="px-4 py-3">
              {tip === "gelen" ? "Tedarikçi" : "Müşteri"}
            </th>
            <th className="px-4 py-3">Tutar</th>
            <th className="px-4 py-3">Para Birimi</th>
            <th className="px-4 py-3">Vade Tarihi</th>
            <th className="px-4 py-3">Durum</th>
            {isAdmin && <th className="px-4 py-3" />}
          </tr>
        </thead>
        <tbody>
          {list.map((r, idx) => {
            const isNearDue =
              r.odemeDurumu === "Beklemede" &&
              r.vadeTarihi <= in7Days &&
              r.vadeTarihi >= todayStr;
            return (
              <tr
                key={r.id}
                className="border-b border-gray-50 hover:bg-gray-50"
                data-ocid={`invoice.${tip}.item.${idx + 1}`}
              >
                <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">
                  {r.faturaNo}
                </td>
                <td className="px-4 py-3 text-gray-700">{r.taraf}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {r.tutar.toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-3 text-gray-600">{r.paraBirimi}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      isNearDue ? "text-amber-600 font-medium" : "text-gray-600"
                    }
                  >
                    {r.vadeTarihi}
                    {isNearDue && " ⚠"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.odemeDurumu] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {r.odemeDurumu}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDeleteId(r.id)}
                      className="text-gray-400 hover:text-red-500"
                      data-ocid={`invoice.delete_button.${idx + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
          {list.length === 0 && (
            <tr>
              <td
                colSpan={7}
                className="px-4 py-8 text-center text-gray-400"
                data-ocid={`invoice.${tip}.empty_state`}
              >
                Henüz fatura yok
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Receipt className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Fatura Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Gelen ve giden faturaları takip edin
              </p>
            </div>
          </div>
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

        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{overdueCount} faturanın</strong> vadesi geçmiş!
            </span>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="gelen">
          <TabsList>
            <TabsTrigger value="gelen" data-ocid="invoice.gelen.tab">
              Gelen Faturalar ({gelenList.length})
            </TabsTrigger>
            <TabsTrigger value="giden" data-ocid="invoice.giden.tab">
              Giden Faturalar ({gidenList.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gelen" className="mt-4">
            <InvoiceTable list={gelenList} tip="gelen" />
          </TabsContent>
          <TabsContent value="giden" className="mt-4">
            <InvoiceTable list={gidenList} tip="giden" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="invoice-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {formTip === "gelen" ? "Gelen" : "Giden"} Fatura Ekle
            </DialogTitle>
            <DialogDescription id="invoice-dialog-desc">
              Fatura bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="invoice.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Fatura No</Label>
                <Input
                  value={form.faturaNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, faturaNo: e.target.value }))
                  }
                  data-ocid="invoice.input"
                />
              </div>
              <div className="space-y-1">
                <Label>
                  {formTip === "gelen" ? "Tedarikçi" : "Müşteri"} Adı
                </Label>
                <Input
                  value={form.taraf}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, taraf: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tutar</Label>
                <Input
                  type="number"
                  value={form.tutar}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tutar: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Para Birimi</Label>
                <Select
                  value={form.paraBirimi}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      paraBirimi: v as Invoice["paraBirimi"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="invoice.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["TRY", "USD", "EUR"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Vade Tarihi</Label>
                <Input
                  type="date"
                  value={form.vadeTarihi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, vadeTarihi: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Ödeme Durumu</Label>
                <Select
                  value={form.odemeDurumu}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      odemeDurumu: v as Invoice["odemeDurumu"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beklemede", "Ödendi", "Vadesi Geçti"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Açıklama</Label>
                <Input
                  value={form.aciklama}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, aciklama: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="invoice.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="invoice.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="invoice-del-desc">
          <DialogHeader>
            <DialogTitle>Faturayı Sil</DialogTitle>
            <DialogDescription id="invoice-del-desc">
              Bu fatura kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="invoice.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="invoice.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
