import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddTrainingRecord,
  useDeleteTrainingRecord,
  useGetTrainingRecords,
  useUpdateTrainingRecord,
} from "../hooks/useQueries";
import type { TrainingRecord } from "../types";

const trainingTypes = [
  "Güvenlik",
  "Teknik",
  "Operatör",
  "Yangın",
  "İlk Yardım",
  "Sertifikasyon",
  "Diğer",
];
const statusConfig: Record<string, { label: string; cls: string }> = {
  planned: { label: "Planlandı", cls: "bg-blue-100 text-blue-700" },
  ongoing: { label: "Devam Ediyor", cls: "bg-amber-100 text-amber-700" },
  completed: { label: "Tamamlandı", cls: "bg-green-100 text-green-700" },
  expired: { label: "Süresi Doldu", cls: "bg-red-100 text-red-700" },
};

function daysUntilExpiry(expiryDate: string): number | null {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate).getTime();
  const now = new Date().getTime();
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
}

interface TrainingForm {
  title: string;
  trainingType: string;
  provider: string;
  personnelName: string;
  personnelCode: string;
  startDate: string;
  endDate: string;
  expiryDate: string;
  status: string;
  notes: string;
}

const emptyForm: TrainingForm = {
  title: "",
  trainingType: "Güvenlik",
  provider: "",
  personnelName: "",
  personnelCode: "",
  startDate: "",
  endDate: "",
  expiryDate: "",
  status: "planned",
  notes: "",
};

export function TrainingPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";

  const recordsQuery = useGetTrainingRecords(userCode);
  const addMutation = useAddTrainingRecord();
  const updateMutation = useUpdateTrainingRecord();
  const deleteMutation = useDeleteTrainingRecord();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TrainingRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingRecord | null>(null);
  const [form, setForm] = useState<TrainingForm>(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");

  const records = recordsQuery.data ?? [];
  const updateForm = (k: keyof TrainingForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filtered =
    filterStatus === "all"
      ? records
      : records.filter((r) => r.status === filterStatus);

  const completedCount = records.filter((r) => r.status === "completed").length;
  const expiringCount = records.filter((r) => {
    const d = daysUntilExpiry(r.expiryDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  const expiredCount = records.filter((r) => {
    const d = daysUntilExpiry(r.expiryDate);
    return d !== null && d < 0;
  }).length;

  const handleAdd = async () => {
    if (!form.title || !form.personnelName) {
      toast.error("Başlık ve personel adı zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        title: form.title,
        trainingType: form.trainingType,
        provider: form.provider,
        personnelName: form.personnelName,
        personnelCode: form.personnelCode,
        startDate: form.startDate,
        endDate: form.endDate,
        expiryDate: form.expiryDate,
        notes: form.notes,
      });
      toast.success("Eğitim kaydı oluşturuldu");
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({
        adminCode: userCode!,
        recId: editTarget.id,
        title: form.title,
        trainingType: form.trainingType,
        provider: form.provider,
        personnelName: form.personnelName,
        personnelCode: form.personnelCode,
        startDate: form.startDate,
        endDate: form.endDate,
        expiryDate: form.expiryDate,
        status: form.status,
        notes: form.notes,
      });
      toast.success("Kayıt güncellendi");
      setEditTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        adminCode: userCode!,
        recId: deleteTarget.id,
      });
      toast.success("Kayıt silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const FormFields = () => (
    <div className="space-y-4 py-2">
      <div>
        <Label className="mb-1.5 block">Eğitim Başlığı *</Label>
        <Input
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
          placeholder="Eğitim adı"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Eğitim Türü</Label>
          <Select
            value={form.trainingType}
            onValueChange={(v) => updateForm("trainingType", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {trainingTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Sağlayıcı / Kurum</Label>
          <Input
            value={form.provider}
            onChange={(e) => updateForm("provider", e.target.value)}
            placeholder="Eğitim kurumu"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Personel Adı *</Label>
          <Input
            value={form.personnelName}
            onChange={(e) => updateForm("personnelName", e.target.value)}
            placeholder="Ad Soyad"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Personel Kodu</Label>
          <Input
            value={form.personnelCode}
            onChange={(e) => updateForm("personnelCode", e.target.value)}
            placeholder="Opsiyonel"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label className="mb-1.5 block">Başlangıç</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => updateForm("startDate", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Bitiş</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => updateForm("endDate", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Sertifika Son Tarihi</Label>
          <Input
            type="date"
            value={form.expiryDate}
            onChange={(e) => updateForm("expiryDate", e.target.value)}
          />
        </div>
      </div>
      {editTarget && (
        <div>
          <Label className="mb-1.5 block">Durum</Label>
          <Select
            value={form.status}
            onValueChange={(v) => updateForm("status", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planlandı</SelectItem>
              <SelectItem value="ongoing">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="expired">Süresi Doldu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div>
        <Label className="mb-1.5 block">Notlar</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => updateForm("notes", e.target.value)}
          placeholder="Ek notlar..."
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <AppLayout title="Eğitim & Sertifika Takibi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Tamamlanan",
              count: completedCount,
              cls: "text-green-700 bg-green-50 border-green-200",
            },
            {
              label: "Yakında Sona Erecek",
              count: expiringCount,
              cls: "text-amber-700 bg-amber-50 border-amber-200",
            },
            {
              label: "Süresi Dolmuş",
              count: expiredCount,
              cls: "text-red-700 bg-red-50 border-red-200",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.cls}`}>
              <p className="text-2xl font-bold font-display">{s.count}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Expiry warning banner */}
        {expiringCount > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-amber-700">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">
              {expiringCount} sertifikanın süresi 30 gün içinde dolacak. Lütfen
              yenileme sürecini başlatın.
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-foreground">
              Eğitim & Sertifika Kayıtları
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {records.length} kayıt
            </p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="planned">Planlandı</SelectItem>
              <SelectItem value="ongoing">Devam Ediyor</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="expired">Süresi Doldu</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setForm(emptyForm);
                setAddOpen(true);
              }}
              data-ocid="training.add.button"
            >
              <Plus size={16} /> Eğitim Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="training.table"
        >
          {recordsQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="training.empty_state">
              <GraduationCap
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <h3 className="font-semibold text-foreground mb-1">
                Eğitim kaydı bulunamadı
              </h3>
              <p className="text-muted-foreground text-sm">
                Eğitim/sertifika eklemek için butona tıklayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Başlık",
                      "Tür",
                      "Personel",
                      "Sağlayıcı",
                      "Bitiş",
                      "Son Tarih",
                      "Durum",
                      "İşlem",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => {
                    const days = daysUntilExpiry(r.expiryDate);
                    const nearExpiry = days !== null && days >= 0 && days <= 30;
                    const isExpired = days !== null && days < 0;
                    return (
                      <tr
                        key={r.id}
                        className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${isExpired ? "bg-red-50/40" : nearExpiry ? "bg-amber-50/40" : ""}`}
                        data-ocid={`training.item.${i + 1}`}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {r.title}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.trainingType}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.personnelName}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.provider || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.endDate || "—"}
                        </td>
                        <td className="px-5 py-3">
                          {r.expiryDate ? (
                            <span
                              className={`text-xs font-medium ${isExpired ? "text-red-600" : nearExpiry ? "text-amber-600" : "text-muted-foreground"}`}
                            >
                              {r.expiryDate}
                              {nearExpiry && days !== null && ` (${days}g)`}
                              {isExpired && " (!!)"}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            className={`text-xs ${statusConfig[r.status]?.cls ?? ""}`}
                          >
                            {statusConfig[r.status]?.label ?? r.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          {isAdmin && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditTarget(r);
                                  setForm({
                                    title: r.title,
                                    trainingType: r.trainingType,
                                    provider: r.provider,
                                    personnelName: r.personnelName,
                                    personnelCode: r.personnelCode,
                                    startDate: r.startDate,
                                    endDate: r.endDate,
                                    expiryDate: r.expiryDate,
                                    status: r.status,
                                    notes: r.notes,
                                  });
                                }}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                data-ocid={`training.edit.${i + 1}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(r)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                data-ocid={`training.delete.${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-training-desc"
          className="max-w-lg"
          data-ocid="training.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Eğitim / Sertifika Ekle
            </DialogTitle>
            <DialogDescription id="add-training-desc">
              Yeni eğitim veya sertifika kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Kaydet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
      >
        <DialogContent
          aria-describedby="edit-training-desc"
          className="max-w-lg"
          data-ocid="training.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Kaydı Düzenle</DialogTitle>
            <DialogDescription id="edit-training-desc">
              Eğitim kaydını güncelleyin
            </DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleEdit}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Güncelle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent aria-describedby="delete-training-desc">
          <DialogHeader>
            <DialogTitle className="font-display">Kaydı Sil</DialogTitle>
            <DialogDescription id="delete-training-desc">
              <strong>{deleteTarget?.title}</strong> eğitim kaydı silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
