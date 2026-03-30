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
import { Building2, DollarSign, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface FacilityMaintenanceCost {
  id: string;
  companyId: string;
  area: string;
  workType: string;
  contractor: string;
  invoiceNo: string;
  invoiceDate: string;
  amount: number;
  currency: string;
  category: "Elektrik" | "Mekanik" | "İnşaat" | "Temizlik" | "Diğer";
  approvalStatus: "Beklemede" | "Onaylandı" | "Reddedildi";
  notes: string;
}

const approvalClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
};

const categoryClass: Record<string, string> = {
  Elektrik: "bg-yellow-100 text-yellow-700",
  Mekanik: "bg-blue-100 text-blue-700",
  İnşaat: "bg-orange-100 text-orange-700",
  Temizlik: "bg-green-100 text-green-700",
  Diğer: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  area: "",
  workType: "",
  contractor: "",
  invoiceNo: "",
  invoiceDate: "",
  amount: 0,
  currency: "TRY",
  category: "Elektrik" as FacilityMaintenanceCost["category"],
  approvalStatus: "Beklemede" as FacilityMaintenanceCost["approvalStatus"],
  notes: "",
};

export function FacilityMaintenanceCostPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<FacilityMaintenanceCost[]>([
    {
      id: "1",
      companyId,
      area: "Üretim Hattı A",
      workType: "Elektrik Pano Bakımı",
      contractor: "Elektrik Servis A.Ş.",
      invoiceNo: "INV-2026-0112",
      invoiceDate: "2026-02-15",
      amount: 12500,
      currency: "TRY",
      category: "Elektrik",
      approvalStatus: "Onaylandı",
      notes: "Yıllık periyodik bakım",
    },
    {
      id: "2",
      companyId,
      area: "Depo",
      workType: "Sprinkler Sistem Bakımı",
      contractor: "Yangın Güvenlik Ltd.",
      invoiceNo: "INV-2026-0148",
      invoiceDate: "2026-03-01",
      amount: 8750,
      currency: "TRY",
      category: "Mekanik",
      approvalStatus: "Beklemede",
      notes: "",
    },
    {
      id: "3",
      companyId,
      area: "Ofis Blok",
      workType: "Çatı Onarımı",
      contractor: "Yapı Tek İnşaat",
      invoiceNo: "INV-2026-0177",
      invoiceDate: "2026-03-10",
      amount: 22000,
      currency: "TRY",
      category: "İnşaat",
      approvalStatus: "Beklemede",
      notes: "Acil onarım",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const totalApproved = records
    .filter((r) => r.approvalStatus === "Onaylandı")
    .reduce((s, r) => s + r.amount, 0);
  const totalPending = records
    .filter((r) => r.approvalStatus === "Beklemede")
    .reduce((s, r) => s + r.amount, 0);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: FacilityMaintenanceCost) => {
    setForm({
      area: r.area,
      workType: r.workType,
      contractor: r.contractor,
      invoiceNo: r.invoiceNo,
      invoiceDate: r.invoiceDate,
      amount: r.amount,
      currency: r.currency,
      category: r.category,
      approvalStatus: r.approvalStatus,
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
      toast.success("Maliyet kaydı eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam Kayıt", value: records.length, color: "text-indigo-600" },
    {
      label: "Onaylanan",
      value: `₺${totalApproved.toLocaleString("tr-TR")}`,
      color: "text-green-600",
    },
    {
      label: "Onay Bekleyen",
      value: `₺${totalPending.toLocaleString("tr-TR")}`,
      color: "text-yellow-600",
    },
    {
      label: "Toplam Maliyet",
      value: `₺${(totalApproved + totalPending).toLocaleString("tr-TR")}`,
      color: "text-blue-600",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <DollarSign className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Tesis Bakım Maliyeti
              </h1>
              <p className="text-sm text-gray-500">
                Alan bazlı tesis bakım maliyetlerini takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
          >
            + Kayıt Ekle
          </Button>
        </div>

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
                <th className="px-4 py-3">Alan</th>
                <th className="px-4 py-3">İş Türü</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Yüklenici</th>
                <th className="px-4 py-3">Fatura No</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Onay</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-1">
                    <Building2 size={13} className="text-gray-400" /> {r.area}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{r.workType}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${categoryClass[r.category] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.contractor}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {r.invoiceNo}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.invoiceDate}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₺{r.amount.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${approvalClass[r.approvalStatus] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {r.approvalStatus}
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
                    Henüz kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="fmc-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Kaydı Düzenle" : "Yeni Maliyet Kaydı"}
            </DialogTitle>
            <DialogDescription id="fmc-dialog-desc">
              Tesis bakım maliyet bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Alan / Bölge</Label>
                <Input
                  value={form.area}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, area: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>İş Türü</Label>
                <Input
                  value={form.workType}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, workType: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      category: v as FacilityMaintenanceCost["category"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Elektrik", "Mekanik", "İnşaat", "Temizlik", "Diğer"].map(
                      (c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Onay Durumu</Label>
                <Select
                  value={form.approvalStatus}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      approvalStatus:
                        v as FacilityMaintenanceCost["approvalStatus"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beklemede", "Onaylandı", "Reddedildi"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Yüklenici / Firma</Label>
                <Input
                  value={form.contractor}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, contractor: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Fatura No</Label>
                <Input
                  value={form.invoiceNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, invoiceNo: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Fatura Tarihi</Label>
                <Input
                  type="date"
                  value={form.invoiceDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, invoiceDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tutar (₺)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, amount: Number(e.target.value) }))
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
        <DialogContent aria-describedby="fmc-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="fmc-del-desc">
              Bu maliyet kaydı kalıcı olarak silinecek.
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
