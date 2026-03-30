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
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface QualityTarget {
  id: string;
  companyId: string;
  metricName: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  period: "Aylık" | "Çeyreklik" | "Yıllık";
  department: string;
  status: "Hedefe Ulaşıldı" | "Devam Ediyor" | "Hedefe Ulaşılamadı";
}

const statusClass: Record<string, string> = {
  "Hedefe Ulaşıldı": "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  "Hedefe Ulaşılamadı": "bg-red-100 text-red-800",
};

const emptyForm = {
  metricName: "",
  targetValue: 0,
  currentValue: 0,
  unit: "",
  period: "Aylık" as QualityTarget["period"],
  department: "",
  status: "Devam Ediyor" as QualityTarget["status"],
};

export function QualityTargetsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<QualityTarget[]>([
    {
      id: "1",
      companyId,
      metricName: "Müşteri Şikayet Oranı",
      targetValue: 2,
      currentValue: 1.4,
      unit: "%",
      period: "Aylık",
      department: "Kalite Güvence",
      status: "Hedefe Ulaşıldı",
    },
    {
      id: "2",
      companyId,
      metricName: "Üretim Hata Oranı",
      targetValue: 1.5,
      currentValue: 1.8,
      unit: "%",
      period: "Çeyreklik",
      department: "Üretim",
      status: "Devam Ediyor",
    },
    {
      id: "3",
      companyId,
      metricName: "İlk Geçiş Verimi",
      targetValue: 95,
      currentValue: 88,
      unit: "%",
      period: "Yıllık",
      department: "Kalite Kontrol",
      status: "Hedefe Ulaşılamadı",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const achievedCount = records.filter(
    (r) => r.status === "Hedefe Ulaşıldı",
  ).length;
  const ongoingCount = records.filter(
    (r) => r.status === "Devam Ediyor",
  ).length;
  const failedCount = records.filter(
    (r) => r.status === "Hedefe Ulaşılamadı",
  ).length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: QualityTarget) => {
    setForm({
      metricName: r.metricName,
      targetValue: r.targetValue,
      currentValue: r.currentValue,
      unit: r.unit,
      period: r.period,
      department: r.department,
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
      toast.success("Kalite hedefi eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam Hedef", value: records.length, color: "text-indigo-600" },
    { label: "Ulaşılan", value: achievedCount, color: "text-green-600" },
    { label: "Devam Eden", value: ongoingCount, color: "text-blue-600" },
    { label: "Ulaşılamayan", value: failedCount, color: "text-red-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Target className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Kalite Hedefleri Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Kalite metriklerini ve hedeflere ulaşma durumunu izleyin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="quality-targets.open_modal_button"
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
          <table className="w-full text-sm" data-ocid="quality-targets.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Metrik</th>
                <th className="px-4 py-3">Departman</th>
                <th className="px-4 py-3">Dönem</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">Gerçekleşen</th>
                <th className="px-4 py-3">İlerleme</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const progress = Math.min(
                  100,
                  r.targetValue > 0
                    ? Math.round((r.currentValue / r.targetValue) * 100)
                    : 0,
                );
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    data-ocid={`quality-targets.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.metricName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.department}</td>
                    <td className="px-4 py-3 text-gray-600">{r.period}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.targetValue} {r.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.currentValue} {r.unit}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 min-w-[80px]">
                          <div
                            className="h-2 rounded-full bg-indigo-500 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-9 text-right">
                          {progress}%
                        </span>
                      </div>
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
                          data-ocid={`quality-targets.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500"
                          data-ocid={`quality-targets.delete_button.${idx + 1}`}
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
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="quality-targets.empty_state"
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
          aria-describedby="quality-targets-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Hedefi Düzenle" : "Yeni Kalite Hedefi"}
            </DialogTitle>
            <DialogDescription id="quality-targets-dialog-desc">
              Kalite hedefi bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="quality-targets.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Metrik Adı</Label>
                <Input
                  value={form.metricName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, metricName: e.target.value }))
                  }
                  data-ocid="quality-targets.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, department: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Birim</Label>
                <Input
                  value={form.unit}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, unit: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Hedef Değer</Label>
                <Input
                  type="number"
                  value={form.targetValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      targetValue: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Gerçekleşen Değer</Label>
                <Input
                  type="number"
                  value={form.currentValue}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      currentValue: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Dönem</Label>
                <Select
                  value={form.period}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      period: v as QualityTarget["period"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="quality-targets.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Aylık", "Çeyreklik", "Yıllık"].map((t) => (
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
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      status: v as QualityTarget["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Hedefe Ulaşıldı",
                      "Devam Ediyor",
                      "Hedefe Ulaşılamadı",
                    ].map((t) => (
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
              data-ocid="quality-targets.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="quality-targets.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="quality-targets-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="quality-targets-del-desc">
              Bu kalite hedefi kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="quality-targets.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="quality-targets.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
