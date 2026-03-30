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
import { AlertTriangle, Home, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface FacilityCleaning {
  id: string;
  companyId: string;
  area: string;
  period: string;
  responsible: string;
  lastDoneDate: string;
  nextPlannedDate: string;
  status: string;
  notes: string;
}

const statusClass: Record<string, string> = {
  Zamanında: "bg-green-100 text-green-800",
  Gecikmiş: "bg-red-100 text-red-800",
  Bekliyor: "bg-yellow-100 text-yellow-800",
};

const emptyForm = {
  area: "",
  period: "Haftalık",
  responsible: "",
  lastDoneDate: "",
  nextPlannedDate: "",
  status: "Bekliyor",
  notes: "",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function FacilityCleaningPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<FacilityCleaning[]>([
    {
      id: "1",
      companyId,
      area: "Üretim Hattı A",
      period: "Günlük",
      responsible: "Temizlik Ekibi 1",
      lastDoneDate: "2025-03-29",
      nextPlannedDate: "2025-03-30",
      status: "Zamanında",
      notes: "",
    },
    {
      id: "2",
      companyId,
      area: "Depo Alanı",
      period: "Haftalık",
      responsible: "Temizlik Ekibi 2",
      lastDoneDate: "2025-03-10",
      nextPlannedDate: "2025-03-17",
      status: "Gecikmiş",
      notes: "Ekipman arızası nedeniyle gecikti.",
    },
    {
      id: "3",
      companyId,
      area: "Ofis Katı",
      period: "Günlük",
      responsible: "Temizlik Ekibi 1",
      lastDoneDate: "2025-03-28",
      nextPlannedDate: "2025-04-02",
      status: "Bekliyor",
      notes: "",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const overdueCount = records.filter((r) => r.status === "Gecikmiş").length;
  const hasOverdue = overdueCount > 0;
  const thisWeek = records.filter((r) => {
    const d = daysUntil(r.nextPlannedDate);
    return d >= 0 && d <= 7;
  }).length;
  const onTimeCount = records.filter((r) => r.status === "Zamanında").length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: FacilityCleaning) => {
    setForm({
      area: r.area,
      period: r.period,
      responsible: r.responsible,
      lastDoneDate: r.lastDoneDate,
      nextPlannedDate: r.nextPlannedDate,
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
      toast.success("Temizlik planı eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam Plan", value: records.length, color: "text-indigo-600" },
    { label: "Gecikmiş", value: overdueCount, color: "text-red-600" },
    { label: "Bu Hafta", value: thisWeek, color: "text-orange-600" },
    { label: "Zamanında", value: onTimeCount, color: "text-green-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Home className="text-blue-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Tesis Temizlik Planı
              </h1>
              <p className="text-sm text-gray-500">
                Tesis alan temizlik planlarını ve takibini yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="cleaning.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
          </Button>
        </div>

        {hasOverdue && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{overdueCount} alan</strong> için temizlik planı gecikmiş
              durumda!
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
          <table className="w-full text-sm" data-ocid="cleaning.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Alan</th>
                <th className="px-4 py-3">Periyot</th>
                <th className="px-4 py-3">Sorumlu</th>
                <th className="px-4 py-3">Son Yapıldı</th>
                <th className="px-4 py-3">Sonraki Plan</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`cleaning.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.area}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.period}</td>
                  <td className="px-4 py-3 text-gray-600">{r.responsible}</td>
                  <td className="px-4 py-3 text-gray-600">{r.lastDoneDate}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.nextPlannedDate}
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
                        data-ocid={`cleaning.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`cleaning.delete_button.${idx + 1}`}
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
                    data-ocid="cleaning.empty_state"
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
          aria-describedby="cleaning-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Planı Düzenle" : "Yeni Temizlik Planı"}
            </DialogTitle>
            <DialogDescription id="cleaning-dialog-desc">
              Tesis temizlik planı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="cleaning.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Alan Adı</Label>
                <Input
                  value={form.area}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, area: e.target.value }))
                  }
                  data-ocid="cleaning.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Periyot</Label>
                <Select
                  value={form.period}
                  onValueChange={(v) => setForm((p) => ({ ...p, period: v }))}
                >
                  <SelectTrigger data-ocid="cleaning.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Günlük", "Haftalık", "Aylık", "Çeyreklik"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {["Zamanında", "Gecikmiş", "Bekliyor"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Sorumlu</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, responsible: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Son Yapıldı</Label>
                <Input
                  type="date"
                  value={form.lastDoneDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastDoneDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Sonraki Plan</Label>
                <Input
                  type="date"
                  value={form.nextPlannedDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nextPlannedDate: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notlar</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                  data-ocid="cleaning.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="cleaning.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="cleaning.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="cleaning-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="cleaning-del-desc">
              Bu temizlik planı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="cleaning.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="cleaning.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
