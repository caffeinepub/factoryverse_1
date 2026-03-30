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
import { FolderCheck, Pencil, Star, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface ClosureReport {
  id: string;
  companyId: string;
  projectName: string;
  projectCode: string;
  startDate: string;
  endDate: string;
  plannedBudget: number;
  actualBudget: number;
  plannedDuration: number;
  actualDuration: number;
  completionPct: number;
  satisfaction: number;
  achievements: string;
  lessonsLearned: string;
  status: "Taslak" | "İncelemede" | "Onaylandı" | "Arşivlendi";
}

const statusClass: Record<string, string> = {
  Taslak: "bg-gray-100 text-gray-600",
  İncelemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Arşivlendi: "bg-blue-100 text-blue-800",
};

const emptyForm = {
  projectName: "",
  projectCode: "",
  startDate: "",
  endDate: "",
  plannedBudget: 0,
  actualBudget: 0,
  plannedDuration: 0,
  actualDuration: 0,
  completionPct: 100,
  satisfaction: 4,
  achievements: "",
  lessonsLearned: "",
  status: "Taslak" as ClosureReport["status"],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={
            s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

export function ProjectClosureReportPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<ClosureReport[]>([
    {
      id: "1",
      companyId,
      projectName: "Üretim Hattı Modernizasyonu",
      projectCode: "PRJ-2025-001",
      startDate: "2025-01-15",
      endDate: "2025-12-31",
      plannedBudget: 2500000,
      actualBudget: 2680000,
      plannedDuration: 350,
      actualDuration: 365,
      completionPct: 100,
      satisfaction: 4,
      achievements: "Kapasite %30 artırıldı, enerji tüketimi %15 azaldı",
      lessonsLearned: "Tedarikçi seçiminde daha erken aksiyon alınmalıydı",
      status: "Onaylandı",
    },
    {
      id: "2",
      companyId,
      projectName: "ERP Sistemi Kurulumu",
      projectCode: "PRJ-2025-002",
      startDate: "2025-03-01",
      endDate: "2025-09-30",
      plannedBudget: 800000,
      actualBudget: 790000,
      plannedDuration: 213,
      actualDuration: 210,
      completionPct: 100,
      satisfaction: 5,
      achievements:
        "Tüm modüller zamanında devreye alındı, maliyet tasarrufu sağlandı",
      lessonsLearned: "Kullanıcı eğitimi daha erken başlanabilirdi",
      status: "Arşivlendi",
    },
    {
      id: "3",
      companyId,
      projectName: "Depo Genişletme Projesi",
      projectCode: "PRJ-2026-001",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      plannedBudget: 1200000,
      actualBudget: 1250000,
      plannedDuration: 180,
      actualDuration: 185,
      completionPct: 95,
      satisfaction: 3,
      achievements: "Depo kapasitesi %40 genişledi",
      lessonsLearned: "İnşaat malzeme fiyatları beklenenden yüksek geldi",
      status: "İncelemede",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const approvedCount = records.filter((r) => r.status === "Onaylandı").length;
  const avgSatisfaction =
    records.length > 0
      ? (
          records.reduce((s, r) => s + r.satisfaction, 0) / records.length
        ).toFixed(1)
      : "0";
  const budgetOverruns = records.filter(
    (r) => r.actualBudget > r.plannedBudget,
  ).length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: ClosureReport) => {
    setForm({
      projectName: r.projectName,
      projectCode: r.projectCode,
      startDate: r.startDate,
      endDate: r.endDate,
      plannedBudget: r.plannedBudget,
      actualBudget: r.actualBudget,
      plannedDuration: r.plannedDuration,
      actualDuration: r.actualDuration,
      completionPct: r.completionPct,
      satisfaction: r.satisfaction,
      achievements: r.achievements,
      lessonsLearned: r.lessonsLearned,
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
      toast.success("Kapanış raporu eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam Proje", value: records.length, color: "text-emerald-600" },
    { label: "Onaylanan", value: approvedCount, color: "text-green-600" },
    {
      label: "Ort. Memnuniyet",
      value: `${avgSatisfaction} / 5`,
      color: "text-yellow-600",
    },
    {
      label: "Bütçe Aşımı",
      value: budgetOverruns,
      color: "text-red-600",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FolderCheck className="text-emerald-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Proje Kapanış Raporu
              </h1>
              <p className="text-sm text-gray-500">
                Tamamlanan projelerin kapanış raporlarını yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={openAdd}
            data-ocid="project-closure.primary_button"
          >
            + Rapor Ekle
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
                <th className="px-4 py-3">Proje</th>
                <th className="px-4 py-3">Süre</th>
                <th className="px-4 py-3">Planlanan Bütçe</th>
                <th className="px-4 py-3">Gerçekleşen</th>
                <th className="px-4 py-3">Sapma</th>
                <th className="px-4 py-3">Tamamlanma</th>
                <th className="px-4 py-3">Memnuniyet</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const budgetVariance =
                  r.plannedBudget > 0
                    ? (
                        ((r.actualBudget - r.plannedBudget) / r.plannedBudget) *
                        100
                      ).toFixed(1)
                    : "0";
                const budgetOver = r.actualBudget > r.plannedBudget;
                const durationVariance = r.actualDuration - r.plannedDuration;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    data-ocid={`project-closure.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {r.projectName}
                      </p>
                      <p className="text-xs text-gray-400">{r.projectCode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <p>{r.startDate}</p>
                      <p>{r.endDate}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ₺{r.plannedBudget.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ₺{r.actualBudget.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          budgetOver ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {budgetOver ? "+" : ""}
                        {budgetVariance}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${r.completionPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600">
                          {r.completionPct}%
                        </span>
                      </div>
                      {durationVariance !== 0 && (
                        <p
                          className={`text-xs mt-0.5 ${
                            durationVariance > 0
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        >
                          {durationVariance > 0 ? "+" : ""}
                          {durationVariance} gün
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={r.satisfaction} />
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
                          className="text-gray-400 hover:text-emerald-600"
                          data-ocid={`project-closure.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500"
                          data-ocid={`project-closure.delete_button.${idx + 1}`}
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
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="project-closure.empty_state"
                  >
                    Henüz kapanış raporu yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="pcr-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Raporu Düzenle" : "Yeni Kapanış Raporu"}
            </DialogTitle>
            <DialogDescription id="pcr-dialog-desc">
              Proje kapanış raporu bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Proje Adı</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, projectName: e.target.value }))
                  }
                  data-ocid="project-closure.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Proje Kodu</Label>
                <Input
                  value={form.projectCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, projectCode: e.target.value }))
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
                      status: v as ClosureReport["status"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="project-closure.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Taslak", "İncelemede", "Onaylandı", "Arşivlendi"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Planlanan Bütçe (₺)</Label>
                <Input
                  type="number"
                  value={form.plannedBudget}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      plannedBudget: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Gerçekleşen Bütçe (₺)</Label>
                <Input
                  type="number"
                  value={form.actualBudget}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      actualBudget: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Planlanan Süre (gün)</Label>
                <Input
                  type="number"
                  value={form.plannedDuration}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      plannedDuration: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Gerçekleşen Süre (gün)</Label>
                <Input
                  type="number"
                  value={form.actualDuration}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      actualDuration: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tamamlanma % (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.completionPct}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      completionPct: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Müşteri Memnuniyeti (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.satisfaction}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      satisfaction: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Temel Başarılar</Label>
                <Input
                  value={form.achievements}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, achievements: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Alınan Dersler</Label>
                <Input
                  value={form.lessonsLearned}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lessonsLearned: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="project-closure.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSave}
              data-ocid="project-closure.save_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="pcr-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="pcr-del-desc">
              Bu kapanış raporu kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="project-closure.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="project-closure.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
