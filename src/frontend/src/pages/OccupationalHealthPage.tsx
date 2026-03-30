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
import { AlertTriangle, Heart, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface OccupationalHealthRecord {
  id: string;
  companyId: string;
  employeeName: string;
  examType: string;
  examDate: string;
  nextExamDate: string;
  result: string;
  doctor: string;
  notes: string;
}

const resultClass: Record<string, string> = {
  Uygun: "bg-green-100 text-green-800",
  "Uygun Değil": "bg-red-100 text-red-800",
  Kısıtlı: "bg-orange-100 text-orange-800",
};

const emptyForm = {
  employeeName: "",
  examType: "Periyodik",
  examDate: "",
  nextExamDate: "",
  result: "Uygun",
  doctor: "",
  notes: "",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function OccupationalHealthPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<OccupationalHealthRecord[]>([
    {
      id: "1",
      companyId,
      employeeName: "Mehmet Çelik",
      examType: "Periyodik",
      examDate: "2025-01-10",
      nextExamDate: "2026-01-10",
      result: "Uygun",
      doctor: "Dr. Ayşe Kaya",
      notes: "",
    },
    {
      id: "2",
      companyId,
      employeeName: "Fatma Demir",
      examType: "İşe Giriş",
      examDate: "2025-02-15",
      nextExamDate: "2026-02-15",
      result: "Uygun",
      doctor: "Dr. Ali Yıldız",
      notes: "",
    },
    {
      id: "3",
      companyId,
      employeeName: "Hüseyin Arslan",
      examType: "Periyodik",
      examDate: "2024-11-20",
      nextExamDate: "2025-04-10",
      result: "Kısıtlı",
      doctor: "Dr. Ayşe Kaya",
      notes: "Ağır kaldırma kısıtlaması mevcut.",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const upcomingCount = records.filter(
    (r) => daysUntil(r.nextExamDate) <= 30 && daysUntil(r.nextExamDate) >= 0,
  ).length;

  const hasWarning = upcomingCount > 0;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: OccupationalHealthRecord) => {
    setForm({
      employeeName: r.employeeName,
      examType: r.examType,
      examDate: r.examDate,
      nextExamDate: r.nextExamDate,
      result: r.result,
      doctor: r.doctor,
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
      toast.success("Muayene kaydı eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const total = records.length;
  const uygunCount = records.filter((r) => r.result === "Uygun").length;
  const uygunDegil = records.filter((r) => r.result === "Uygun Değil").length;

  const stats = [
    { label: "Toplam Kayıt", value: total, color: "text-indigo-600" },
    { label: "Uygun", value: uygunCount, color: "text-green-600" },
    { label: "Uygun Değil", value: uygunDegil, color: "text-red-600" },
    {
      label: "Yaklaşan Muayene",
      value: upcomingCount,
      color: "text-orange-600",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <Heart className="text-rose-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                İş Sağlığı Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Personel periyodik ve işe giriş muayenelerini takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="occupational.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
          </Button>
        </div>

        {hasWarning && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-orange-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{upcomingCount} personelin</strong> muayene tarihi 30 gün
              içinde dolmaktadır.
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
          <table className="w-full text-sm" data-ocid="occupational.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Çalışan</th>
                <th className="px-4 py-3">Muayene Türü</th>
                <th className="px-4 py-3">Muayene Tarihi</th>
                <th className="px-4 py-3">Sonraki Muayene</th>
                <th className="px-4 py-3">Sonuç</th>
                <th className="px-4 py-3">Doktor</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const days = daysUntil(r.nextExamDate);
                const dateClass =
                  days < 0
                    ? "text-red-600 font-semibold"
                    : days <= 30
                      ? "text-orange-500 font-semibold"
                      : "text-gray-600";
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    data-ocid={`occupational.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.employeeName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.examType}</td>
                    <td className="px-4 py-3 text-gray-600">{r.examDate}</td>
                    <td className={`px-4 py-3 ${dateClass}`}>
                      {r.nextExamDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          resultClass[r.result] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {r.result}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.doctor}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="text-gray-400 hover:text-indigo-600"
                          data-ocid={`occupational.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500"
                          data-ocid={`occupational.delete_button.${idx + 1}`}
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="occupational.empty_state"
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
          aria-describedby="occupational-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Kaydı Düzenle" : "Yeni Muayene Kaydı"}
            </DialogTitle>
            <DialogDescription id="occupational-dialog-desc">
              Personel sağlık muayene bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="occupational.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Çalışan Adı</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, employeeName: e.target.value }))
                  }
                  data-ocid="occupational.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Muayene Türü</Label>
                <Select
                  value={form.examType}
                  onValueChange={(v) => setForm((p) => ({ ...p, examType: v }))}
                >
                  <SelectTrigger data-ocid="occupational.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Periyodik", "İşe Giriş", "Ayrılış", "Özel"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Sonuç</Label>
                <Select
                  value={form.result}
                  onValueChange={(v) => setForm((p) => ({ ...p, result: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Uygun", "Uygun Değil", "Kısıtlı"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Muayene Tarihi</Label>
                <Input
                  type="date"
                  value={form.examDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, examDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Sonraki Muayene</Label>
                <Input
                  type="date"
                  value={form.nextExamDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nextExamDate: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Doktor</Label>
                <Input
                  value={form.doctor}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, doctor: e.target.value }))
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
                  data-ocid="occupational.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="occupational.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="occupational.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="occupational-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="occupational-del-desc">
              Bu muayene kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="occupational.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="occupational.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
