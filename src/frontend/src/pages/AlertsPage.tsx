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
import { Bell, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddAlert,
  useDeleteAlert,
  useDismissAlert,
  useGetAlerts,
} from "../hooks/useQueries";
import type { Alert } from "../types";

const alertTypeLabels: Record<string, string> = {
  maintenance_due: "Bakım Tarihi",
  task_deadline: "Görev Süresi",
  low_stock: "Düşük Stok",
  safety: "İSG",
  general: "Genel",
};

const alertTypeClass: Record<string, string> = {
  maintenance_due: "bg-orange-100 text-orange-800",
  task_deadline: "bg-violet-100 text-violet-800",
  low_stock: "bg-amber-100 text-amber-800",
  safety: "bg-red-100 text-red-800",
  general: "bg-indigo-100 text-indigo-800",
};

const priorityLabels: Record<string, string> = {
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const priorityClass: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
};

const emptyForm = {
  title: "",
  description: "",
  alertType: "general",
  priority: "medium",
  dueDate: "",
};

type FilterTab = "all" | "active" | "dismissed";

export function AlertsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: alerts = [], isLoading } = useGetAlerts(userCode);
  const addAlert = useAddAlert();
  const dismissAlert = useDismissAlert();
  const deleteAlert = useDeleteAlert();

  const [tab, setTab] = useState<FilterTab>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = alerts.filter((a) => {
    if (tab === "active") return a.status === "active";
    if (tab === "dismissed") return a.status === "dismissed";
    return true;
  });

  const handleAdd = async () => {
    if (!form.title.trim()) {
      toast.error("Başlık zorunludur");
      return;
    }
    try {
      await addAlert.mutateAsync({
        adminCode,
        title: form.title,
        description: form.description,
        alertType: form.alertType,
        priority: form.priority,
        dueDate: form.dueDate,
      });
      toast.success("Uyarı eklendi");
      setDialogOpen(false);
      setForm(emptyForm);
    } catch {
      toast.error("Uyarı eklenemedi");
    }
  };

  const handleDismiss = async (alert: Alert) => {
    try {
      await dismissAlert.mutateAsync({ adminCode, alertId: alert.id });
      toast.success("Uyarı kapatıldı");
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAlert.mutateAsync({ adminCode, alertId: deleteId });
      toast.success("Uyarı silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "active", label: "Aktif" },
    { key: "dismissed", label: "Kapatıldı" },
  ];

  return (
    <AppLayout title="Bildirimler">
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
              Bildirimler
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Bakım, görev ve stok uyarılarını yönetin
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setDialogOpen(true)}
              data-ocid="alerts.open_modal_button"
            >
              <Plus size={16} className="mr-1.5" />
              Yeni Uyarı
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2" data-ocid="alerts.tab">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="alerts.loading_state"
          >
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-card"
            data-ocid="alerts.empty_state"
          >
            <Bell size={40} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Gösterilecek uyarı yok
            </p>
            {isAdmin && tab === "all" && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setDialogOpen(true)}
              >
                İlk Uyarıyı Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((alert, idx) => (
              <div
                key={alert.id}
                className={`rounded-xl border bg-card p-4 transition-opacity ${
                  alert.status === "dismissed" ? "opacity-60" : ""
                }`}
                data-ocid={`alerts.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">
                        {alert.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          alertTypeClass[alert.alertType] ??
                          "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {alertTypeLabels[alert.alertType] ?? alert.alertType}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          priorityClass[alert.priority] ??
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {priorityLabels[alert.priority] ?? alert.priority}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          alert.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {alert.status === "active" ? "Aktif" : "Kapatıldı"}
                      </span>
                    </div>
                    {alert.description && (
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    )}
                    {alert.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Son tarih: {alert.dueDate}
                      </p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {alert.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(alert)}
                          disabled={dismissAlert.isPending}
                          data-ocid={`alerts.secondary_button.${idx + 1}`}
                        >
                          Kapat
                        </Button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteId(alert.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        data-ocid={`alerts.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="alerts.dialog">
          <DialogHeader>
            <DialogTitle>Yeni Uyarı Ekle</DialogTitle>
            <DialogDescription>Uyarı bilgilerini doldurun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="alert-title">Başlık *</Label>
              <Input
                id="alert-title"
                placeholder="Uyarı başlığı"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                data-ocid="alerts.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-description">Açıklama</Label>
              <Textarea
                id="alert-description"
                placeholder="Uyarı açıklaması..."
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                data-ocid="alerts.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tür</Label>
                <Select
                  value={form.alertType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, alertType: v }))
                  }
                >
                  <SelectTrigger data-ocid="alerts.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance_due">
                      Bakım Tarihi
                    </SelectItem>
                    <SelectItem value="task_deadline">Görev Süresi</SelectItem>
                    <SelectItem value="low_stock">Düşük Stok</SelectItem>
                    <SelectItem value="safety">İSG</SelectItem>
                    <SelectItem value="general">Genel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm((p) => ({ ...p, priority: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alert-due">Son Tarih (isteğe bağlı)</Label>
              <Input
                id="alert-due"
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="alerts.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleAdd}
              disabled={addAlert.isPending}
              data-ocid="alerts.submit_button"
            >
              {addAlert.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent data-ocid="alerts.modal">
          <DialogHeader>
            <DialogTitle>Uyarıyı Sil</DialogTitle>
            <DialogDescription>
              Bu uyarı kalıcı olarak silinecek. Devam etmek istiyor musunuz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="alerts.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAlert.isPending}
              data-ocid="alerts.confirm_button"
            >
              {deleteAlert.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
