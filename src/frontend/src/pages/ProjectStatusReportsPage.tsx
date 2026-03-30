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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileBarChart, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface ProjectStatusReport {
  id: string;
  companyId: string;
  projectName: string;
  projectCode: string;
  reportPeriod: string;
  reportDate: string;
  overallProgress: number;
  budget: number;
  spent: number;
  plannedMilestones: number;
  completedMilestones: number;
  openIssues: number;
  risks: string;
  achievements: string;
  nextSteps: string;
  status: "Yeşil" | "Sarı" | "Kırmızı";
  preparedBy: string;
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  Yeşil: { label: "Yeşil - Yolunda", cls: "bg-green-100 text-green-800" },
  Sarı: { label: "Sarı - Dikkat", cls: "bg-yellow-100 text-yellow-800" },
  Kırmızı: { label: "Kırmızı - Kritik", cls: "bg-red-100 text-red-800" },
};

const emptyForm = {
  projectName: "",
  projectCode: "",
  reportPeriod: "",
  reportDate: "",
  overallProgress: 0,
  budget: 0,
  spent: 0,
  plannedMilestones: 0,
  completedMilestones: 0,
  openIssues: 0,
  risks: "",
  achievements: "",
  nextSteps: "",
  status: "Yeşil" as ProjectStatusReport["status"],
  preparedBy: "",
};

export function ProjectStatusReportsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<ProjectStatusReport[]>([
    {
      id: "1",
      companyId,
      projectName: "Fabrika Taşınma Projesi",
      projectCode: "PROJ-2026-A",
      reportPeriod: "Mart 2026",
      reportDate: "2026-03-28",
      overallProgress: 65,
      budget: 5000000,
      spent: 3200000,
      plannedMilestones: 12,
      completedMilestones: 8,
      openIssues: 3,
      risks: "Ekipman teslimat gecikmesi",
      achievements: "Altyapı kurulumu tamamlandı, hat montajı başladı",
      nextSteps: "Enerji bağlantısı, test üretimi",
      status: "Yeşil",
      preparedBy: "Ali Vural",
    },
    {
      id: "2",
      companyId,
      projectName: "ERP Entegrasyon Projesi",
      projectCode: "PROJ-2026-B",
      reportPeriod: "Mart 2026",
      reportDate: "2026-03-28",
      overallProgress: 42,
      budget: 800000,
      spent: 420000,
      plannedMilestones: 8,
      completedMilestones: 3,
      openIssues: 6,
      risks: "Kaynak yetersizliği, kapsam kayması",
      achievements: "Temel modüller kuruldu, eğitimler başladı",
      nextSteps: "Veri migrasyonu, canlıya geçiş planı",
      status: "Sarı",
      preparedBy: "Deniz Şen",
    },
    {
      id: "3",
      companyId,
      projectName: "Yeni Depo Yapımı",
      projectCode: "PROJ-2026-C",
      reportPeriod: "Mart 2026",
      reportDate: "2026-03-28",
      overallProgress: 18,
      budget: 2500000,
      spent: 600000,
      plannedMilestones: 10,
      completedMilestones: 2,
      openIssues: 9,
      risks: "İzin gecikmeleri, malzeme fiyat artışı",
      achievements: "Zemin etüdü tamamlandı",
      nextSteps: "İnşaat izni, temel kazısı",
      status: "Kırmızı",
      preparedBy: "Caner Koç",
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

  const openEdit = (r: ProjectStatusReport) => {
    const { id: _id, companyId: _cid, ...rest } = r;
    setForm(rest);
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...form } : r)),
      );
      toast.success("Rapor güncellendi");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Proje durum raporu eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Rapor silindi");
  };

  const redCount = records.filter((r) => r.status === "Kırmızı").length;
  const yellowCount = records.filter((r) => r.status === "Sarı").length;
  const stats = [
    { label: "Toplam Rapor", value: records.length, color: "text-indigo-600" },
    {
      label: "Yolunda (Yeşil)",
      value: records.filter((r) => r.status === "Yeşil").length,
      color: "text-green-600",
    },
    { label: "Dikkat (Sarı)", value: yellowCount, color: "text-yellow-600" },
    { label: "Kritik (Kırmızı)", value: redCount, color: "text-red-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileBarChart className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Proje Durum Raporları
              </h1>
              <p className="text-sm text-gray-500">
                Dönemsel proje ilerleme ve durum raporlarını yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
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

        <div className="space-y-4">
          {records.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {r.projectName}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {r.projectCode}
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[r.status]?.cls ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {statusConfig[r.status]?.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {r.reportPeriod} · {r.reportDate}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Genel İlerleme</span>
                      <span className="font-semibold text-gray-700">
                        {r.overallProgress}%
                      </span>
                    </div>
                    <Progress value={r.overallProgress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Bütçe</p>
                      <p className="font-semibold text-gray-800">
                        ₺{r.budget.toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Harcanan</p>
                      <p
                        className={`font-semibold ${r.spent > r.budget ? "text-red-600" : "text-gray-800"}`}
                      >
                        ₺{r.spent.toLocaleString("tr-TR")}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Kilometre Taşı</p>
                      <p className="font-semibold text-gray-800">
                        {r.completedMilestones}/{r.plannedMilestones}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500">Açık Sorun</p>
                      <p
                        className={`font-semibold ${r.openIssues > 5 ? "text-red-600" : r.openIssues > 2 ? "text-yellow-600" : "text-gray-800"}`}
                      >
                        {r.openIssues}
                      </p>
                    </div>
                  </div>

                  {(r.achievements || r.nextSteps) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                      {r.achievements && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Başarılar:{" "}
                          </span>
                          {r.achievements}
                        </div>
                      )}
                      {r.nextSteps && (
                        <div>
                          <span className="font-medium text-gray-700">
                            Sonraki Adımlar:{" "}
                          </span>
                          {r.nextSteps}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-400">
                    Hazırlayan: {r.preparedBy}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
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
              </div>
            </motion.div>
          ))}
          {records.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              Henüz rapor yok
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="psr-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Raporu Düzenle" : "Yeni Proje Durum Raporu"}
            </DialogTitle>
            <DialogDescription id="psr-dialog-desc">
              Proje durum raporu bilgilerini girin.
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
                      status: v as ProjectStatusReport["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Yeşil", "Sarı", "Kırmızı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Rapor Dönemi</Label>
                <Input
                  value={form.reportPeriod}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reportPeriod: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Rapor Tarihi</Label>
                <Input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reportDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Genel İlerleme (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.overallProgress}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      overallProgress: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Bütçe (₺)</Label>
                <Input
                  type="number"
                  value={form.budget}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, budget: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Harcanan (₺)</Label>
                <Input
                  type="number"
                  value={form.spent}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, spent: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Planlanan Kilometre Taşı</Label>
                <Input
                  type="number"
                  value={form.plannedMilestones}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      plannedMilestones: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tamamlanan Kilometre Taşı</Label>
                <Input
                  type="number"
                  value={form.completedMilestones}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      completedMilestones: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Açık Sorun Sayısı</Label>
                <Input
                  type="number"
                  value={form.openIssues}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      openIssues: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Riskler</Label>
                <Input
                  value={form.risks}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, risks: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Başarılar</Label>
                <Input
                  value={form.achievements}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, achievements: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Sonraki Adımlar</Label>
                <Input
                  value={form.nextSteps}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, nextSteps: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Hazırlayan</Label>
                <Input
                  value={form.preparedBy}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, preparedBy: e.target.value }))
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
        <DialogContent aria-describedby="psr-del-desc">
          <DialogHeader>
            <DialogTitle>Raporu Sil</DialogTitle>
            <DialogDescription id="psr-del-desc">
              Bu proje durum raporu kalıcı olarak silinecek.
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
