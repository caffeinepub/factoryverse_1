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
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { useGetSafetyIncidents } from "../hooks/useQueries";
import type { SafetyIncident } from "../types";

const incidentTypeLabels: Record<string, string> = {
  accident: "Kaza",
  "near-miss": "Ramak Kala",
  "unsafe-condition": "Güvensiz Durum",
  observation: "Gözlem",
};

const severityLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  critical: "Kritik",
};

const severityClass: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  open: "Açık",
  investigating: "İnceleniyor",
  resolved: "Çözüldü",
};

const statusClass: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  investigating: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
};

const emptyForm = {
  title: "",
  incidentType: "observation",
  severity: "low",
  date: "",
  location: "",
  description: "",
  reportedBy: "",
  actions: "",
};

export function SafetyPage() {
  const { session } = useAuth();
  const { actor } = useActor();
  const qc = useQueryClient();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = session?.userType === "admin" ? session.userCode : "";

  const { data: incidents = [], isLoading } = useGetSafetyIncidents(userCode);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SafetyIncident | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (incident: SafetyIncident) => {
    setEditTarget(incident);
    setForm({
      title: incident.title,
      incidentType: incident.incidentType,
      severity: incident.severity,
      date: incident.date,
      location: incident.location,
      description: incident.description,
      reportedBy: incident.reportedBy,
      actions: incident.actions,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!actor || !adminCode) return;
    if (!form.title.trim() || !form.date) {
      toast.error("Başlık ve tarih zorunludur");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await (actor as any).updateSafetyIncident(
          adminCode,
          editTarget.id,
          form.title,
          form.incidentType,
          form.severity,
          form.date,
          form.location,
          form.description,
          form.reportedBy,
          editTarget.status,
          form.actions,
        );
        toast.success("Olay güncellendi");
      } else {
        await (actor as any).addSafetyIncident(
          adminCode,
          form.title,
          form.incidentType,
          form.severity,
          form.date,
          form.location,
          form.description,
          form.reportedBy,
          form.actions,
        );
        toast.success("Olay eklendi");
      }
      qc.invalidateQueries({ queryKey: ["safety"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDialogOpen(false);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !adminCode || !deleteId) return;
    setDeleting(true);
    try {
      await (actor as any).deleteSafetyIncident(adminCode, deleteId);
      toast.success("Olay silindi");
      qc.invalidateQueries({ queryKey: ["safety"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout title="İSG Olayları">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              İSG Olayları
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              İş sağlığı ve güvenliği olaylarını kaydedin ve takip edin
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} data-ocid="safety.open_modal_button">
              <Plus size={16} className="mr-1.5" />
              Olay Ekle
            </Button>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="safety.loading_state"
          >
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : incidents.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-card"
            data-ocid="safety.empty_state"
          >
            <ShieldAlert size={40} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Henüz kayıtlı İSG olayı yok
            </p>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={openAdd}
              >
                İlk Olayı Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Başlık
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tür
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Şiddet
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tarih
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Konum
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Raporlayan
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Durum
                    </th>
                    {isAdmin && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident, idx) => (
                    <tr
                      key={incident.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`safety.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {incident.title}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {incidentTypeLabels[incident.incidentType] ??
                          incident.incidentType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityClass[incident.severity] ?? "bg-gray-100 text-gray-800"}`}
                        >
                          {severityLabels[incident.severity] ??
                            incident.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {incident.date}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {incident.location}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {incident.reportedBy}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[incident.status] ?? "bg-gray-100 text-gray-800"}`}
                        >
                          {statusLabels[incident.status] ?? incident.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => openEdit(incident)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              data-ocid={`safety.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(incident.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              data-ocid={`safety.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {incidents.map((incident, idx) => (
                <div
                  key={incident.id}
                  className="p-4 space-y-2"
                  data-ocid={`safety.item.${idx + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">
                      {incident.title}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${severityClass[incident.severity] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {severityLabels[incident.severity] ?? incident.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {incidentTypeLabels[incident.incidentType] ??
                        incident.incidentType}
                    </span>
                    <span>·</span>
                    <span>{incident.date}</span>
                    <span>·</span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full font-medium ${statusClass[incident.status] ?? "bg-gray-100 text-gray-800"}`}
                    >
                      {statusLabels[incident.status] ?? incident.status}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => openEdit(incident)}
                        className="text-xs text-primary flex items-center gap-1"
                        data-ocid={`safety.edit_button.${idx + 1}`}
                      >
                        <Pencil size={13} /> Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(incident.id)}
                        className="text-xs text-destructive flex items-center gap-1"
                        data-ocid={`safety.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={13} /> Sil
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="safety.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Olayı Düzenle" : "Yeni Olay Ekle"}
            </DialogTitle>
            <DialogDescription>İSG olay bilgilerini doldurun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="safety-title">Başlık *</Label>
              <Input
                id="safety-title"
                placeholder="Olay başlığı"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="safety.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Olay Türü</Label>
                <Select
                  value={form.incidentType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, incidentType: v }))
                  }
                >
                  <SelectTrigger data-ocid="safety.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="accident">Kaza</SelectItem>
                    <SelectItem value="near-miss">Ramak Kala</SelectItem>
                    <SelectItem value="unsafe-condition">
                      Güvensiz Durum
                    </SelectItem>
                    <SelectItem value="observation">Gözlem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Şiddet</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => setForm((p) => ({ ...p, severity: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="safety-date">Tarih *</Label>
                <Input
                  id="safety-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="safety-location">Konum</Label>
                <Input
                  id="safety-location"
                  placeholder="Konum"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="safety-reported">Raporlayan</Label>
              <Input
                id="safety-reported"
                placeholder="Ad Soyad"
                value={form.reportedBy}
                onChange={(e) =>
                  setForm((p) => ({ ...p, reportedBy: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="safety-description">Açıklama</Label>
              <Textarea
                id="safety-description"
                placeholder="Olay açıklaması..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                data-ocid="safety.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="safety-actions">Alınan Önlemler</Label>
              <Textarea
                id="safety-actions"
                placeholder="Alınan veya planlanan önlemler..."
                value={form.actions}
                onChange={(e) =>
                  setForm((p) => ({ ...p, actions: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="safety.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-ocid="safety.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent data-ocid="safety.modal">
          <DialogHeader>
            <DialogTitle>Olayı Sil</DialogTitle>
            <DialogDescription>
              Bu olay kaydı kalıcı olarak silinecek. Devam etmek istiyor
              musunuz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="safety.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              data-ocid="safety.confirm_button"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
