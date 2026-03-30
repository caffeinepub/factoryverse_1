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
import { Banknote, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SalaryRecord {
  id: string;
  personelAdi: string;
  departman: string;
  donem: string;
  brutUcret: number;
  netUcret: number;
  odemeDurumu: "Ödendi" | "Beklemede" | "Gecikti";
}

const statusClass: Record<string, string> = {
  Ödendi: "bg-green-100 text-green-800",
  Beklemede: "bg-amber-100 text-amber-800",
  Gecikti: "bg-red-100 text-red-800",
};

const emptyForm = {
  personelAdi: "",
  departman: "",
  donem: "",
  brutUcret: 0,
  netUcret: 0,
  odemeDurumu: "Beklemede" as SalaryRecord["odemeDurumu"],
};

const SEED: SalaryRecord[] = [
  {
    id: "1",
    personelAdi: "Ahmet Yılmaz",
    departman: "Üretim",
    donem: "2026-03",
    brutUcret: 28000,
    netUcret: 21500,
    odemeDurumu: "Ödendi",
  },
  {
    id: "2",
    personelAdi: "Fatma Kaya",
    departman: "İnsan Kaynakları",
    donem: "2026-03",
    brutUcret: 32000,
    netUcret: 24800,
    odemeDurumu: "Ödendi",
  },
  {
    id: "3",
    personelAdi: "Mehmet Demir",
    departman: "Bakım",
    donem: "2026-03",
    brutUcret: 25000,
    netUcret: 19200,
    odemeDurumu: "Beklemede",
  },
  {
    id: "4",
    personelAdi: "Zeynep Çelik",
    departman: "Kalite",
    donem: "2026-03",
    brutUcret: 30000,
    netUcret: 23100,
    odemeDurumu: "Gecikti",
  },
  {
    id: "5",
    personelAdi: "Emre Şahin",
    departman: "Satın Alma",
    donem: "2026-02",
    brutUcret: 27000,
    netUcret: 20800,
    odemeDurumu: "Ödendi",
  },
];

export function SalaryTrackingPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? "guest";
  const isAdmin = session?.userType === "admin";

  const storageKey = `salary_records_${userCode}`;
  const [records, setRecords] = useState<SalaryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });

  const save = (updated: SalaryRecord[]) => {
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const totalBrut = records.reduce((s, r) => s + r.brutUcret, 0);
  const totalNet = records.reduce((s, r) => s + r.netUcret, 0);
  const pendingCount = records.filter((r) => r.odemeDurumu !== "Ödendi").length;

  const stats = [
    {
      label: "Toplam Personel",
      value: records.length,
      color: "text-indigo-600",
    },
    {
      label: "Toplam Brüt",
      value: `₺${totalBrut.toLocaleString("tr-TR")}`,
      color: "text-blue-600",
    },
    {
      label: "Toplam Net",
      value: `₺${totalNet.toLocaleString("tr-TR")}`,
      color: "text-green-600",
    },
    {
      label: "Bekleyen Ödemeler",
      value: pendingCount,
      color: "text-amber-600",
    },
  ];

  const handleSave = () => {
    const newRecord: SalaryRecord = {
      id: Date.now().toString(),
      ...form,
    };
    save([newRecord, ...records]);
    toast.success("Maaş kaydı eklendi");
    setDialogOpen(false);
    setForm({ ...emptyForm });
  };

  const handleDelete = () => {
    save(records.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Banknote className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Maaş & Ücret Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Personel maaş ve ödeme durumlarını yönetin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setDialogOpen(true)}
              data-ocid="salary.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Yeni Ekle
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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="salary.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Personel Adı</th>
                <th className="px-4 py-3">Departman</th>
                <th className="px-4 py-3">Dönem</th>
                <th className="px-4 py-3">Brüt Ücret</th>
                <th className="px-4 py-3">Net Ücret</th>
                <th className="px-4 py-3">Ödeme Durumu</th>
                {isAdmin && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`salary.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.personelAdi}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.departman}</td>
                  <td className="px-4 py-3 text-gray-600">{r.donem}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₺{r.brutUcret.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    ₺{r.netUcret.toLocaleString("tr-TR")}
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
                        data-ocid={`salary.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="salary.empty_state"
                  >
                    Henüz kayıt yok
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
          aria-describedby="salary-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>Yeni Maaş Kaydı</DialogTitle>
            <DialogDescription id="salary-dialog-desc">
              Personel maaş bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="salary.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Personel Adı</Label>
                <Input
                  value={form.personelAdi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, personelAdi: e.target.value }))
                  }
                  data-ocid="salary.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Departman</Label>
                <Input
                  value={form.departman}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, departman: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Dönem (YYYY-MM)</Label>
                <Input
                  value={form.donem}
                  placeholder="2026-03"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, donem: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Brüt Ücret (₺)</Label>
                <Input
                  type="number"
                  value={form.brutUcret}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      brutUcret: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Net Ücret (₺)</Label>
                <Input
                  type="number"
                  value={form.netUcret}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, netUcret: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Ödeme Durumu</Label>
                <Select
                  value={form.odemeDurumu}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      odemeDurumu: v as SalaryRecord["odemeDurumu"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="salary.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Ödendi", "Beklemede", "Gecikti"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="salary.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="salary.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="salary-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="salary-del-desc">
              Bu maaş kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="salary.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="salary.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
