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
import { Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface CareerPlan {
  id: string;
  companyId: string;
  employeeName: string;
  department: string;
  currentPosition: string;
  targetPosition: string;
  planPeriod: string;
  mentorName: string;
  developmentAreas: string;
  trainings: string;
  targetDate: string;
  progress: string;
  status: string;
  notes: string;
}

const statusClass: Record<string, string> = {
  Planlama: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  "Askıya Alındı": "bg-gray-100 text-gray-600",
};

const emptyForm = {
  employeeName: "",
  department: "",
  currentPosition: "",
  targetPosition: "",
  planPeriod: "12 Ay",
  mentorName: "",
  developmentAreas: "",
  trainings: "",
  targetDate: "",
  progress: "0",
  status: "Planlama",
  notes: "",
};

export function CareerPlanningPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<CareerPlan[]>([
    {
      id: "1",
      companyId,
      employeeName: "Ahmet Çelik",
      department: "Üretim",
      currentPosition: "Üretim Operatörü",
      targetPosition: "Vardiya Şefi",
      planPeriod: "18 Ay",
      mentorName: "Ercan Doğan",
      developmentAreas: "Liderlik, kalite yönetimi",
      trainings: "ISO 9001, Liderlik Eğitimi",
      targetDate: "2026-06-01",
      progress: "35",
      status: "Devam Ediyor",
      notes: "",
    },
    {
      id: "2",
      companyId,
      employeeName: "Selin Yıldız",
      department: "Kalite",
      currentPosition: "Kalite Teknisyeni",
      targetPosition: "Kalite Mühendisi",
      planPeriod: "24 Ay",
      mentorName: "Hasan Karademir",
      developmentAreas: "İstatistiksel proses kontrol, ölçüm sistemleri",
      trainings: "Six Sigma Green Belt, MSA",
      targetDate: "2027-01-01",
      progress: "20",
      status: "Planlama",
      notes: "Eğitim programı hazırlanıyor",
    },
    {
      id: "3",
      companyId,
      employeeName: "Murat Yılmaz",
      department: "Bakım",
      currentPosition: "Bakım Teknisyeni",
      targetPosition: "Bakım Şefi",
      planPeriod: "12 Ay",
      mentorName: "Ali Güven",
      developmentAreas: "Planlı bakım, ekip yönetimi",
      trainings: "TPM, CMMS Kullanımı",
      targetDate: "2025-12-31",
      progress: "75",
      status: "Devam Ediyor",
      notes: "",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareerPlan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<CareerPlan | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: CareerPlan) {
    setEditing(r);
    setForm({
      employeeName: r.employeeName,
      department: r.department,
      currentPosition: r.currentPosition,
      targetPosition: r.targetPosition,
      planPeriod: r.planPeriod,
      mentorName: r.mentorName,
      developmentAreas: r.developmentAreas,
      trainings: r.trainings,
      targetDate: r.targetDate,
      progress: r.progress,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.employeeName.trim()) {
      toast.error("Çalışan adı zorunludur.");
      return;
    }
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
      toast.success("Güncellendi.");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Kariyer planı eklendi.");
    }
    setOpen(false);
  }

  function handleDelete(r: CareerPlan) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const avgProgress =
    records.length > 0
      ? Math.round(
          records.reduce((s, r) => s + (Number(r.progress) || 0), 0) /
            records.length,
        )
      : 0;

  const stats = [
    { label: "Toplam Plan", val: records.length, color: "indigo" },
    {
      label: "Devam Eden",
      val: records.filter((r) => r.status === "Devam Ediyor").length,
      color: "yellow",
    },
    {
      label: "Tamamlanan",
      val: records.filter((r) => r.status === "Tamamlandı").length,
      color: "green",
    },
    { label: "Ort. İlerleme", val: `%${avgProgress}`, color: "purple" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Personel Kariyer Planlama
              </h1>
              <p className="text-sm text-gray-500">
                Kariyer hedefleri, gelişim alanları ve ilerleme takibi
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="career-planning.primary_button"
          >
            <Plus size={16} className="mr-1" /> Plan Ekle
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600 mt-1`}>
                {c.val}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          {records.length === 0 ? (
            <div
              className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400"
              data-ocid="career-planning.empty_state"
            >
              Henüz kariyer planı yok.
            </div>
          ) : (
            records.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-xl shadow-sm border p-5"
                data-ocid={`career-planning.item.${i + 1}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {r.employeeName}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                      >
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {r.department} · {r.currentPosition} →{" "}
                      <span className="font-medium text-indigo-600">
                        {r.targetPosition}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 text-xs text-gray-500">
                      <span>Plan Süresi: {r.planPeriod}</span>
                      <span>Mentor: {r.mentorName || "—"}</span>
                      <span>Hedef Tarih: {r.targetDate || "—"}</span>
                      <span className="col-span-2">
                        Gelişim Alanları: {r.developmentAreas || "—"}
                      </span>
                      <span className="col-span-2">
                        Eğitimler: {r.trainings || "—"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">İlerleme</span>
                        <span className="text-xs font-semibold text-indigo-600">
                          %{r.progress}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                          style={{
                            width: `${Math.min(Number(r.progress), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="p-1 hover:text-indigo-600 text-gray-400"
                      data-ocid={`career-planning.edit_button.${i + 1}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(r)}
                      className="p-1 hover:text-red-500 text-gray-400"
                      data-ocid={`career-planning.delete_button.${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="career-planning.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Plan Düzenle" : "Kariyer Planı Ekle"}
              </DialogTitle>
              <DialogDescription>
                Çalışan kariyer geliştirme planını girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Çalışan Adı *</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) => sf("employeeName", e.target.value)}
                  data-ocid="career-planning.input"
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Mevcut Pozisyon</Label>
                <Input
                  value={form.currentPosition}
                  onChange={(e) => sf("currentPosition", e.target.value)}
                />
              </div>
              <div>
                <Label>Hedef Pozisyon</Label>
                <Input
                  value={form.targetPosition}
                  onChange={(e) => sf("targetPosition", e.target.value)}
                />
              </div>
              <div>
                <Label>Plan Süresi</Label>
                <Select
                  value={form.planPeriod}
                  onValueChange={(v) => sf("planPeriod", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["6 Ay", "12 Ay", "18 Ay", "24 Ay", "36 Ay"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mentor</Label>
                <Input
                  value={form.mentorName}
                  onChange={(e) => sf("mentorName", e.target.value)}
                />
              </div>
              <div>
                <Label>Hedef Tarih</Label>
                <Input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => sf("targetDate", e.target.value)}
                />
              </div>
              <div>
                <Label>İlerleme (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) => sf("progress", e.target.value)}
                />
              </div>
              <div>
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => sf("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Planlama",
                      "Devam Ediyor",
                      "Tamamlandı",
                      "Askıya Alındı",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Gelişim Alanları</Label>
                <Textarea
                  value={form.developmentAreas}
                  onChange={(e) => sf("developmentAreas", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Planlanan Eğitimler</Label>
                <Textarea
                  value={form.trainings}
                  onChange={(e) => sf("trainings", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Notlar</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => sf("notes", e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="career-planning.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="career-planning.submit_button"
              >
                {editing ? "Güncelle" : "Ekle"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!deleteConfirm}
          onOpenChange={() => setDeleteConfirm(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Plan Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.employeeName} kariyer planını silmek
                istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="career-planning.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="career-planning.confirm_button"
              >
                Sil
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
