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
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMaintenanceCalendarRecord,
  useDeleteMaintenanceCalendarRecord,
  useGetMaintenanceCalendarRecords,
  useUpdateMaintenanceCalendarRecord,
} from "../hooks/useQueries";
import type { MaintenanceCalendarRecord } from "../types";

const frequencyLabels: Record<string, string> = {
  daily: "Günlük",
  weekly: "Haftalık",
  monthly: "Aylık",
  quarterly: "3 Aylık",
  yearly: "Yıllık",
};

const typeLabels: Record<string, string> = {
  preventive: "Önleyici",
  periodic: "Periyodik",
  inspection: "Kontrol",
  calibration: "Kalibrasyon",
};

const statusLabels: Record<string, string> = {
  active: "Aktif",
  overdue: "Gecikmiş",
  completed: "Tamamlandı",
  paused: "Durduruldu",
};

const statusClass: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  paused: "bg-gray-100 text-gray-600",
};

const emptyForm = {
  title: "",
  machineId: "",
  machineName: "",
  maintenanceType: "preventive",
  frequency: "monthly",
  nextDueDate: "",
  lastDoneDate: "",
  responsible: "",
  status: "active",
  notes: "",
};

export function MaintenanceCalendarPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } =
    useGetMaintenanceCalendarRecords(userCode);
  const addRecord = useAddMaintenanceCalendarRecord();
  const updateRecord = useUpdateMaintenanceCalendarRecord();
  const deleteRecord = useDeleteMaintenanceCalendarRecord();

  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<MaintenanceCalendarRecord | null>(
    null,
  );
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const overdueRecords = records.filter(
    (r) => r.nextDueDate && r.nextDueDate < today && r.status === "active",
  );
  const upcomingRecords = records.filter((r) => {
    if (!r.nextDueDate || r.status !== "active") return false;
    const due = new Date(r.nextDueDate);
    const diffDays = (due.getTime() - Date.now()) / 86400000;
    return diffDays >= 0 && diffDays <= 7;
  });

  const filtered = records.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus,
  );

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: MaintenanceCalendarRecord) {
    setEditItem(r);
    setForm({
      title: r.title,
      machineId: r.machineId,
      machineName: r.machineName,
      maintenanceType: r.maintenanceType,
      frequency: r.frequency,
      nextDueDate: r.nextDueDate,
      lastDoneDate: r.lastDoneDate,
      responsible: r.responsible,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("Başlık gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Plan güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Plan eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Plan silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız");
    }
  }

  const f = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100">
              <CalendarClock className="text-violet-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Bakım Takvimi
              </h1>
              <p className="text-sm text-gray-500">
                Önleyici bakım planları ve periyodik hatırlatıcılar
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="maintcal.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Plan Ekle
            </Button>
          )}
        </div>

        {overdueRecords.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            ⚠ {overdueRecords.length} bakım planının son tarihi geçti!
          </div>
        )}
        {upcomingRecords.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-800">
            🔔 {upcomingRecords.length} bakım planı önümüzdeki 7 gün içinde
            yapılacak.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Plan",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Gecikmiş",
              value: overdueRecords.length,
              color: "text-red-600",
            },
            {
              label: "Bu Hafta",
              value: upcomingRecords.length,
              color: "text-yellow-600",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44" data-ocid="maintcal.select">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="maintcal.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="maintcal.empty_state"
            >
              Bakım planı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Başlık",
                    "Makine",
                    "Tür",
                    "Periyot",
                    "Son Yapılan",
                    "Sonraki Tarih",
                    "Sorumlu",
                    "Durum",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, idx) => {
                  const isOverdue =
                    r.nextDueDate &&
                    r.nextDueDate < today &&
                    r.status === "active";
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 transition-colors ${isOverdue ? "bg-red-50" : ""}`}
                      data-ocid={`maintcal.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.machineName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {typeLabels[r.maintenanceType] ?? r.maintenanceType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {frequencyLabels[r.frequency] ?? r.frequency}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.lastDoneDate || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}
                      >
                        {r.nextDueDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.responsible || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[r.status] ?? r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`maintcal.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(r.id)}
                              data-ocid={`maintcal.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="maintcal-dialog-desc"
          data-ocid="maintcal.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Plan Düzenle" : "Yeni Bakım Planı"}
            </DialogTitle>
            <DialogDescription id="maintcal-dialog-desc">
              Bakım planı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) => f("title", e.target.value)}
                placeholder="Bakım planı başlığı"
                data-ocid="maintcal.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Makine Adı</Label>
              <Input
                value={form.machineName}
                onChange={(e) => f("machineName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sorumlu</Label>
              <Input
                value={form.responsible}
                onChange={(e) => f("responsible", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Bakım Türü</Label>
              <Select
                value={form.maintenanceType}
                onValueChange={(v) => f("maintenanceType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Periyot</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => f("frequency", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Son Yapılan Tarih</Label>
              <Input
                type="date"
                value={form.lastDoneDate}
                onChange={(e) => f("lastDoneDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sonraki Tarih</Label>
              <Input
                type="date"
                value={form.nextDueDate}
                onChange={(e) => f("nextDueDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="maintcal.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="maintcal.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="maintcal.submit_button"
            >
              {editItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          aria-describedby="maintcal-del-desc"
          data-ocid="maintcal.modal"
        >
          <DialogHeader>
            <DialogTitle>Planı Sil</DialogTitle>
            <DialogDescription id="maintcal-del-desc">
              Bu bakım planını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="maintcal.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="maintcal.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
