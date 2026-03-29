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
import { Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMaintenanceRecord,
  useDeleteMaintenanceRecord,
  useGetMaintenanceRecords,
  useUpdateMaintenanceRecord,
} from "../hooks/useQueries";
import type { MaintenanceRecord } from "../types";

const statusOptions = [
  { value: "pending", label: "Bekliyor", cls: "bg-amber-100 text-amber-800" },
  { value: "done", label: "Tamamlandı", cls: "bg-green-100 text-green-800" },
];

const maintenanceTypes = [
  { value: "preventive", label: "Önleyici" },
  { value: "corrective", label: "Düzeltici" },
  { value: "emergency", label: "Acil" },
];

interface AddFormData {
  machineId: string;
  machineName: string;
  maintenanceType: string;
  description: string;
  scheduledDate: string;
  notes: string;
}

interface EditFormData {
  description: string;
  scheduledDate: string;
  completedDate: string;
  status: string;
  notes: string;
}

const emptyAddForm: AddFormData = {
  machineId: "",
  machineName: "",
  maintenanceType: "preventive",
  description: "",
  scheduledDate: "",
  notes: "",
};

export function MaintenancePage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const recordsQuery = useGetMaintenanceRecords(userCode);
  const addMutation = useAddMaintenanceRecord();
  const updateMutation = useUpdateMaintenanceRecord();
  const deleteMutation = useDeleteMaintenanceRecord();

  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRecord | null>(
    null,
  );
  const [addForm, setAddForm] = useState<AddFormData>(emptyAddForm);
  const [editForm, setEditForm] = useState<EditFormData>({
    description: "",
    scheduledDate: "",
    completedDate: "",
    status: "pending",
    notes: "",
  });

  const records = recordsQuery.data ?? [];

  const handleAdd = async () => {
    if (!addForm.machineId || !addForm.machineName) {
      toast.error("Makine ID ve adı zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        machineId: addForm.machineId,
        machineName: addForm.machineName,
        maintenanceType: addForm.maintenanceType,
        description: addForm.description,
        scheduledDate: addForm.scheduledDate,
        notes: addForm.notes,
      });
      toast.success("Bakım kaydı eklendi");
      setAddOpen(false);
      setAddForm(emptyAddForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const openEdit = (r: MaintenanceRecord) => {
    setEditRecord(r);
    setEditForm({
      description: r.description,
      scheduledDate: r.scheduledDate,
      completedDate: r.completedDate,
      status: r.status,
      notes: r.notes,
    });
  };

  const handleUpdate = async () => {
    if (!editRecord) return;
    try {
      await updateMutation.mutateAsync({
        adminCode: userCode!,
        recordId: editRecord.id,
        description: editForm.description,
        scheduledDate: editForm.scheduledDate,
        completedDate: editForm.completedDate,
        status: editForm.status,
        notes: editForm.notes,
      });
      toast.success("Bakım kaydı güncellendi");
      setEditRecord(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        adminCode: userCode!,
        recordId: deleteTarget.id,
      });
      toast.success("Bakım kaydı silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  return (
    <AppLayout title="Bakım Yönetimi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Bakım Yönetimi
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {records.length} bakım kaydı
            </p>
          </div>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setAddForm(emptyAddForm);
                setAddOpen(true);
              }}
              data-ocid="maintenance.add_record.button"
            >
              <Plus size={16} /> Bakım Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="maintenance.table"
        >
          {recordsQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="maintenance.empty_state"
            >
              <Wrench
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <h3 className="font-semibold text-foreground mb-1">
                Henüz bakım kaydı yok
              </h3>
              <p className="text-muted-foreground text-sm">
                İlk bakım kaydını ekleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Makine",
                      "Bakım Türü",
                      "Açıklama",
                      "Planlanan Tarih",
                      "Tamamlanma",
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
                  {records.map((r, i) => {
                    const statusOpt = statusOptions.find(
                      (s) => s.value === r.status,
                    );
                    const typeOpt = maintenanceTypes.find(
                      (t) => t.value === r.maintenanceType,
                    );
                    return (
                      <tr
                        key={r.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        data-ocid={`maintenance.item.${i + 1}`}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          <div>{r.machineName}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.machineId}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {typeOpt?.label ?? r.maintenanceType}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground max-w-[150px] truncate">
                          {r.description || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.scheduledDate || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {r.completedDate || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusOpt?.cls ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {statusOpt?.label ?? r.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(r)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                data-ocid={`maintenance.edit_button.${i + 1}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(r)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                data-ocid={`maintenance.delete_button.${i + 1}`}
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
          aria-describedby="add-maint-desc"
          data-ocid="maintenance.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Bakım Kaydı Ekle</DialogTitle>
            <DialogDescription id="add-maint-desc">
              Yeni bakım kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Makine ID *</Label>
                <Input
                  value={addForm.machineId}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, machineId: e.target.value }))
                  }
                  placeholder="SN-12345"
                  data-ocid="maintenance.form.machineid.input"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Makine Adı *</Label>
                <Input
                  value={addForm.machineName}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, machineName: e.target.value }))
                  }
                  placeholder="CNC-01"
                  data-ocid="maintenance.form.machinename.input"
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Bakım Türü</Label>
              <Select
                value={addForm.maintenanceType}
                onValueChange={(v) =>
                  setAddForm((p) => ({ ...p, maintenanceType: v }))
                }
              >
                <SelectTrigger data-ocid="maintenance.form.type.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Açıklama</Label>
              <Textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Bakım detayları..."
                rows={2}
                data-ocid="maintenance.form.description.textarea"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Planlanan Tarih</Label>
              <Input
                type="date"
                value={addForm.scheduledDate}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, scheduledDate: e.target.value }))
                }
                data-ocid="maintenance.form.scheduleddate.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Notlar</Label>
              <Textarea
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Ek notlar..."
                rows={2}
                data-ocid="maintenance.form.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="maintenance.add.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              data-ocid="maintenance.add.submit_button"
            >
              {addMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editRecord}
        onOpenChange={(o) => {
          if (!o) setEditRecord(null);
        }}
      >
        <DialogContent
          aria-describedby="edit-maint-desc"
          data-ocid="maintenance.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Bakım Kaydını Düzenle
            </DialogTitle>
            <DialogDescription id="edit-maint-desc">
              Bakım bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Açıklama</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                data-ocid="maintenance.edit.description.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Planlanan Tarih</Label>
                <Input
                  type="date"
                  value={editForm.scheduledDate}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      scheduledDate: e.target.value,
                    }))
                  }
                  data-ocid="maintenance.edit.scheduleddate.input"
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Tamamlanma Tarihi</Label>
                <Input
                  type="date"
                  value={editForm.completedDate}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      completedDate: e.target.value,
                    }))
                  }
                  data-ocid="maintenance.edit.completeddate.input"
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Durum</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger data-ocid="maintenance.edit.status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Notlar</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
                data-ocid="maintenance.edit.notes.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditRecord(null)}
              data-ocid="maintenance.edit.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-ocid="maintenance.edit.submit_button"
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Kaydet"
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
        <DialogContent
          aria-describedby="delete-maint-desc"
          data-ocid="maintenance.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Bakım Kaydını Sil
            </DialogTitle>
            <DialogDescription id="delete-maint-desc">
              <strong>{deleteTarget?.machineName}</strong> için bakım kaydı
              silinecek. Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="maintenance.delete.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-ocid="maintenance.delete.confirm_button"
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
