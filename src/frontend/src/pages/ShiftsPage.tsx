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
import { Clock, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddShift,
  useDeleteShift,
  useGetShifts,
  useUpdateShift,
} from "../hooks/useQueries";
import type { Shift } from "../types";

const shiftTypes = ["Sabah", "Öğle", "Gece", "Özel"];
const statusConfig: Record<string, { label: string; cls: string }> = {
  active: { label: "Aktif", cls: "bg-green-100 text-green-700" },
  completed: { label: "Tamamlandı", cls: "bg-blue-100 text-blue-700" },
  cancelled: { label: "İptal", cls: "bg-red-100 text-red-700" },
};

interface ShiftForm {
  title: string;
  shiftType: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedPersonnel: string;
  status: string;
  notes: string;
}

const emptyForm: ShiftForm = {
  title: "",
  shiftType: "Sabah",
  date: "",
  startTime: "",
  endTime: "",
  assignedPersonnel: "",
  status: "active",
  notes: "",
};

export function ShiftsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";

  const shiftsQuery = useGetShifts(userCode);
  const addMutation = useAddShift();
  const updateMutation = useUpdateShift();
  const deleteMutation = useDeleteShift();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Shift | null>(null);
  const [form, setForm] = useState<ShiftForm>(emptyForm);
  const [filterType, setFilterType] = useState("all");

  const shifts = shiftsQuery.data ?? [];
  const updateForm = (k: keyof ShiftForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filtered =
    filterType === "all"
      ? shifts
      : shifts.filter((s) => s.shiftType === filterType);

  const activeCount = shifts.filter((s) => s.status === "active").length;
  const totalToday = shifts.filter(
    (s) => s.date === new Date().toISOString().split("T")[0],
  ).length;

  const handleAdd = async () => {
    if (!form.title || !form.date) {
      toast.error("Başlık ve tarih zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        title: form.title,
        shiftType: form.shiftType,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        assignedPersonnel: form.assignedPersonnel,
        notes: form.notes,
      });
      toast.success("Vardiya oluşturuldu");
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
        shiftId: editTarget.id,
        title: form.title,
        shiftType: form.shiftType,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        assignedPersonnel: form.assignedPersonnel,
        status: form.status,
        notes: form.notes,
      });
      toast.success("Vardiya güncellendi");
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
        shiftId: deleteTarget.id,
      });
      toast.success("Vardiya silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const FormFields = () => (
    <div className="space-y-4 py-2">
      <div>
        <Label className="mb-1.5 block">Başlık *</Label>
        <Input
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
          placeholder="Vardiya başlığı"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Vardiya Türü</Label>
          <Select
            value={form.shiftType}
            onValueChange={(v) => updateForm("shiftType", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shiftTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Tarih *</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => updateForm("date", e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Başlangıç Saati</Label>
          <Input
            type="time"
            value={form.startTime}
            onChange={(e) => updateForm("startTime", e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Bitiş Saati</Label>
          <Input
            type="time"
            value={form.endTime}
            onChange={(e) => updateForm("endTime", e.target.value)}
          />
        </div>
      </div>
      <div>
        <Label className="mb-1.5 block">Atanan Personel</Label>
        <Input
          value={form.assignedPersonnel}
          onChange={(e) => updateForm("assignedPersonnel", e.target.value)}
          placeholder="Personel adı veya kodu"
        />
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
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="completed">Tamamlandı</SelectItem>
              <SelectItem value="cancelled">İptal</SelectItem>
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
    <AppLayout title="Vardiya Planlama">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Toplam Vardiya",
              count: shifts.length,
              cls: "text-indigo-700 bg-indigo-50 border-indigo-200",
            },
            {
              label: "Aktif",
              count: activeCount,
              cls: "text-green-700 bg-green-50 border-green-200",
            },
            {
              label: "Bugün",
              count: totalToday,
              cls: "text-blue-700 bg-blue-50 border-blue-200",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.cls}`}>
              <p className="text-2xl font-bold font-display">{s.count}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-foreground">
              Vardiyalar
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {shifts.length} vardiya kayıtlı
            </p>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              {shiftTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setForm(emptyForm);
                setAddOpen(true);
              }}
              data-ocid="shifts.add.button"
            >
              <Plus size={16} /> Vardiya Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="shifts.table"
        >
          {shiftsQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="shifts.empty_state">
              <Clock size={40} className="text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                Vardiya bulunamadı
              </h3>
              <p className="text-muted-foreground text-sm">
                Vardiya eklemek için butona tıklayın
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
                      "Tarih",
                      "Saat",
                      "Personel",
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
                  {filtered.map((s, i) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`shifts.item.${i + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {s.title}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.shiftType}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.date || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.startTime && s.endTime
                          ? `${s.startTime} – ${s.endTime}`
                          : s.startTime || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {s.assignedPersonnel || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={`text-xs ${statusConfig[s.status]?.cls ?? ""}`}
                        >
                          {statusConfig[s.status]?.label ?? s.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditTarget(s);
                                setForm({
                                  title: s.title,
                                  shiftType: s.shiftType,
                                  date: s.date,
                                  startTime: s.startTime,
                                  endTime: s.endTime,
                                  assignedPersonnel: s.assignedPersonnel,
                                  status: s.status,
                                  notes: s.notes,
                                });
                              }}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              data-ocid={`shifts.edit.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(s)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              data-ocid={`shifts.delete.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-shift-desc"
          data-ocid="shifts.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Vardiya Ekle</DialogTitle>
            <DialogDescription id="add-shift-desc">
              Yeni vardiya planı oluşturun
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
          aria-describedby="edit-shift-desc"
          data-ocid="shifts.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Vardiyayı Düzenle
            </DialogTitle>
            <DialogDescription id="edit-shift-desc">
              Vardiya bilgilerini güncelleyin
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
        <DialogContent aria-describedby="delete-shift-desc">
          <DialogHeader>
            <DialogTitle className="font-display">Vardiyayı Sil</DialogTitle>
            <DialogDescription id="delete-shift-desc">
              <strong>{deleteTarget?.title}</strong> vardiyası silinecek.
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
