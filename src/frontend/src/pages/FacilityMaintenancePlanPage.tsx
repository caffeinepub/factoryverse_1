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
import { Home, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddFacilityMaintenancePlan,
  useDeleteFacilityMaintenancePlan,
  useGetFacilityMaintenancePlans,
  useUpdateFacilityMaintenancePlan,
} from "../hooks/useQueries";
import type { FacilityMaintenancePlanRecord } from "../types";

const statusClass: Record<string, string> = {
  Planlandı: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  Gecikmiş: "bg-red-100 text-red-800",
  İptal: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  facilityArea: "",
  maintenanceType: "",
  description: "",
  frequency: "Aylık",
  lastMaintenanceDate: "",
  nextMaintenanceDate: "",
  estimatedDuration: "",
  contractor: "",
  estimatedCost: "",
  currency: "TRY",
  responsible: "",
  priority: "Orta",
  status: "Planlandı",
  notes: "",
};

export function FacilityMaintenancePlanPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } =
    useGetFacilityMaintenancePlans(companyId);
  const addMut = useAddFacilityMaintenancePlan();
  const updateMut = useUpdateFacilityMaintenancePlan();
  const deleteMut = useDeleteFacilityMaintenancePlan();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FacilityMaintenancePlanRecord | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<FacilityMaintenancePlanRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: FacilityMaintenancePlanRecord) {
    setEditing(r);
    setForm({
      facilityArea: r.facilityArea,
      maintenanceType: r.maintenanceType,
      description: r.description,
      frequency: r.frequency,
      lastMaintenanceDate: r.lastMaintenanceDate,
      nextMaintenanceDate: r.nextMaintenanceDate,
      estimatedDuration: r.estimatedDuration,
      contractor: r.contractor,
      estimatedCost: r.estimatedCost,
      currency: r.currency,
      responsible: r.responsible,
      priority: r.priority,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.facilityArea || !form.maintenanceType) {
      toast.error("Tesis alanı ve bakım türü zorunludur.");
      return;
    }
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...form });
      toast.success("Kayıt güncellendi.");
    } else {
      await addMut.mutateAsync({ companyId: companyId!, ...form });
      toast.success("Bakım planı eklendi.");
    }
    setOpen(false);
  }

  async function handleDelete(r: FacilityMaintenancePlanRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.facilityArea.toLowerCase().includes(search.toLowerCase()) ||
      r.maintenanceType.toLowerCase().includes(search.toLowerCase()),
  );

  const today = new Date();
  const totalCount = records.length;
  const overdueCount = records.filter((r) => {
    if (!r.nextMaintenanceDate) return false;
    return new Date(r.nextMaintenanceDate) < today && r.status !== "Tamamlandı";
  }).length;
  const upcomingCount = records.filter((r) => {
    if (!r.nextMaintenanceDate) return false;
    const diff =
      (new Date(r.nextMaintenanceDate).getTime() - today.getTime()) /
      (1000 * 3600 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  function getDateClass(dateStr: string, status: string) {
    if (!dateStr || status === "Tamamlandı") return "";
    const diff =
      (new Date(dateStr).getTime() - today.getTime()) / (1000 * 3600 * 24);
    if (diff < 0) return "text-red-600 font-semibold";
    if (diff <= 30) return "text-orange-500 font-semibold";
    return "";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium"
          >
            ⚠️ {overdueCount} bakım planı gecikmiş durumda!
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Home size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tesis Bakım Planı
              </h1>
              <p className="text-sm text-gray-500">
                Tesis alanlarına yönelik bakım planları ve takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="facility-maint-plan.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Plan Ekle
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Toplam Plan",
              value: totalCount,
              color: "text-indigo-600",
            },
            { label: "Gecikmiş", value: overdueCount, color: "text-red-600" },
            {
              label: "30 Gün İçinde",
              value: upcomingCount,
              color: "text-orange-500",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border shadow-sm"
        >
          <div className="p-4 border-b flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <Input
              placeholder="Tesis alanı veya bakım türü ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="facility-maint-plan.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="facility-maint-plan.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="facility-maint-plan.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Tesis Alanı",
                      "Bakım Türü",
                      "Periyot",
                      "Son Bakım",
                      "Sonraki Bakım",
                      "Sorumlu",
                      "Öncelik",
                      "Durum",
                      "",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50"
                      data-ocid={`facility-maint-plan.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.facilityArea}
                      </td>
                      <td className="px-4 py-3">{r.maintenanceType}</td>
                      <td className="px-4 py-3">{r.frequency}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.lastMaintenanceDate || "-"}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${getDateClass(r.nextMaintenanceDate, r.status)}`}
                      >
                        {r.nextMaintenanceDate || "-"}
                      </td>
                      <td className="px-4 py-3">{r.responsible}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.priority === "Yüksek"
                              ? "bg-red-100 text-red-700"
                              : r.priority === "Orta"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`facility-maint-plan.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`facility-maint-plan.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="facility-maint-plan.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Plan Düzenle" : "Bakım Planı Ekle"}
              </DialogTitle>
              <DialogDescription>
                Tesis bakım planı bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Tesis Alanı *</Label>
                <Input
                  value={form.facilityArea}
                  onChange={(e) => sf("facilityArea", e.target.value)}
                  placeholder="Üretim Salonu, Depo..."
                  data-ocid="facility-maint-plan.input"
                />
              </div>
              <div>
                <Label>Bakım Türü *</Label>
                <Input
                  value={form.maintenanceType}
                  onChange={(e) => sf("maintenanceType", e.target.value)}
                  placeholder="Elektrik, HVAC, Zemin..."
                />
              </div>
              <div>
                <Label>Periyot</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => sf("frequency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Haftalık",
                      "Aylık",
                      "3 Aylık",
                      "6 Aylık",
                      "Yıllık",
                      "İhtiyaç Halinde",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => sf("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Son Bakım Tarihi</Label>
                <Input
                  type="date"
                  value={form.lastMaintenanceDate}
                  onChange={(e) => sf("lastMaintenanceDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Sonraki Bakım Tarihi</Label>
                <Input
                  type="date"
                  value={form.nextMaintenanceDate}
                  onChange={(e) => sf("nextMaintenanceDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Tahmini Süre (saat)</Label>
                <Input
                  value={form.estimatedDuration}
                  onChange={(e) => sf("estimatedDuration", e.target.value)}
                />
              </div>
              <div>
                <Label>Yüklenici / Firma</Label>
                <Input
                  value={form.contractor}
                  onChange={(e) => sf("contractor", e.target.value)}
                />
              </div>
              <div>
                <Label>Tahmini Maliyet</Label>
                <Input
                  value={form.estimatedCost}
                  onChange={(e) => sf("estimatedCost", e.target.value)}
                />
              </div>
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => sf("currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["TRY", "USD", "EUR"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sorumlu</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) => sf("responsible", e.target.value)}
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
                      "Planlandı",
                      "Devam Ediyor",
                      "Tamamlandı",
                      "Gecikmiş",
                      "İptal",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
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
                data-ocid="facility-maint-plan.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="facility-maint-plan.submit_button"
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
              <DialogTitle>Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.facilityArea} - {deleteConfirm?.maintenanceType}{" "}
                kaydını silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="facility-maint-plan.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="facility-maint-plan.confirm_button"
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
