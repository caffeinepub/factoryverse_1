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
import { Leaf, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface WasteRecycling {
  id: string;
  companyId: string;
  wasteType: string;
  quantity: number;
  recyclingCompany: string;
  date: string;
  status: string;
  notes: string;
}

const statusClass: Record<string, string> = {
  Bekliyor: "bg-yellow-100 text-yellow-800",
  "Teslim Edildi": "bg-blue-100 text-blue-800",
  İşlendi: "bg-green-100 text-green-800",
};

const wasteTypeClass: Record<string, string> = {
  Kağıt: "bg-amber-100 text-amber-800",
  Plastik: "bg-blue-100 text-blue-800",
  Metal: "bg-gray-200 text-gray-700",
  Cam: "bg-cyan-100 text-cyan-800",
  Elektronik: "bg-purple-100 text-purple-800",
  Organik: "bg-green-100 text-green-800",
};

const wasteTypes = [
  "Kağıt",
  "Plastik",
  "Metal",
  "Cam",
  "Elektronik",
  "Organik",
];

const emptyForm = {
  wasteType: "Kağıt",
  quantity: 0,
  recyclingCompany: "",
  date: "",
  status: "Bekliyor",
  notes: "",
};

export function WasteRecyclingPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<WasteRecycling[]>([
    {
      id: "1",
      companyId,
      wasteType: "Metal",
      quantity: 340,
      recyclingCompany: "ÇevreGeri A.Ş.",
      date: "2025-03-05",
      status: "İşlendi",
      notes: "",
    },
    {
      id: "2",
      companyId,
      wasteType: "Plastik",
      quantity: 120,
      recyclingCompany: "EkoÇözüm Ltd.",
      date: "2025-03-15",
      status: "Teslim Edildi",
      notes: "Sarı konteynerlerden toplandi.",
    },
    {
      id: "3",
      companyId,
      wasteType: "Elektronik",
      quantity: 55,
      recyclingCompany: "TechRecycle TR",
      date: "2025-03-25",
      status: "Bekliyor",
      notes: "Eski bilgisayar ekipmanları dahil.",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: WasteRecycling) => {
    setForm({
      wasteType: r.wasteType,
      quantity: r.quantity,
      recyclingCompany: r.recyclingCompany,
      date: r.date,
      status: r.status,
      notes: r.notes,
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editId
            ? { ...r, ...form, quantity: Number(form.quantity) }
            : r,
        ),
      );
      toast.success("Kayıt güncellendi");
    } else {
      setRecords((prev) => [
        {
          id: Date.now().toString(),
          companyId,
          ...form,
          quantity: Number(form.quantity),
        },
        ...prev,
      ]);
      toast.success("Geri dönüşüm kaydı eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const total = records.length;
  const totalKg = records.reduce((s, r) => s + r.quantity, 0);
  const teslimCount = records.filter(
    (r) => r.status === "Teslim Edildi",
  ).length;
  const islendi = records.filter((r) => r.status === "İşlendi").length;

  const stats = [
    { label: "Toplam Kayıt", value: total, color: "text-indigo-600" },
    { label: "Toplam Miktar (kg)", value: totalKg, color: "text-blue-600" },
    { label: "Teslim Edildi", value: teslimCount, color: "text-orange-600" },
    { label: "İşlendi", value: islendi, color: "text-green-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Leaf className="text-green-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Atık Geri Dönüşüm Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Atık türleri ve geri dönüşüm süreçlerini yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="recycling.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
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
          <table className="w-full text-sm" data-ocid="recycling.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Atık Türü</th>
                <th className="px-4 py-3">Miktar (kg)</th>
                <th className="px-4 py-3">Geri Dönüşüm Firması</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Notlar</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`recycling.item.${idx + 1}`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        wasteTypeClass[r.wasteType] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.wasteType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    {r.quantity}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.recyclingCompany}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusClass[r.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                    {r.notes}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-gray-400 hover:text-indigo-600"
                        data-ocid={`recycling.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`recycling.delete_button.${idx + 1}`}
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="recycling.empty_state"
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
          aria-describedby="recycling-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Kaydı Düzenle" : "Yeni Geri Dönüşüm Kaydı"}
            </DialogTitle>
            <DialogDescription id="recycling-dialog-desc">
              Atık geri dönüşüm bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="recycling.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Atık Türü</Label>
                <Select
                  value={form.wasteType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, wasteType: v }))
                  }
                >
                  <SelectTrigger data-ocid="recycling.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {wasteTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Miktar (kg)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, quantity: Number(e.target.value) }))
                  }
                  data-ocid="recycling.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Geri Dönüşüm Firması</Label>
                <Input
                  value={form.recyclingCompany}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, recyclingCompany: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Bekliyor", "Teslim Edildi", "İşlendi"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notlar</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                  data-ocid="recycling.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="recycling.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="recycling.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="recycling-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="recycling-del-desc">
              Bu geri dönüşüm kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="recycling.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="recycling.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
