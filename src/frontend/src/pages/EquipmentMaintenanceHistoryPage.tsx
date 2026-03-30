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
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddEquipmentMaintenanceHistory,
  useDeleteEquipmentMaintenanceHistory,
  useGetEquipmentMaintenanceHistory,
  useUpdateEquipmentMaintenanceHistory,
} from "../hooks/useQueries";
import type { EquipmentMaintenanceHistory } from "../types";

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Planlandı: "bg-gray-100 text-gray-700",
  İptal: "bg-red-100 text-red-800",
};

const emptyForm = {
  equipmentName: "",
  equipmentCode: "",
  maintenanceType: "Önleyici",
  maintenanceDate: "",
  performedBy: "",
  duration: "",
  cost: "",
  partsReplaced: "",
  description: "",
  nextMaintenanceDate: "",
  status: "Tamamlandı",
  notes: "",
};

export function EquipmentMaintenanceHistoryPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } =
    useGetEquipmentMaintenanceHistory(companyId);
  const addMut = useAddEquipmentMaintenanceHistory();
  const updateMut = useUpdateEquipmentMaintenanceHistory();
  const deleteMut = useDeleteEquipmentMaintenanceHistory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentMaintenanceHistory | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<EquipmentMaintenanceHistory | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: EquipmentMaintenanceHistory) {
    setEditing(r);
    setForm({
      equipmentName: r.equipmentName,
      equipmentCode: r.equipmentCode,
      maintenanceType: r.maintenanceType,
      maintenanceDate: r.maintenanceDate,
      performedBy: r.performedBy,
      duration: r.duration,
      cost: r.cost,
      partsReplaced: r.partsReplaced,
      description: r.description,
      nextMaintenanceDate: r.nextMaintenanceDate,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.equipmentName) {
      toast.error("Ekipman adı zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: EquipmentMaintenanceHistory) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const totalCost = records.reduce(
    (sum, r) => sum + (Number.parseFloat(r.cost) || 0),
    0,
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <ClipboardList className="text-cyan-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Ekipman Bakım Geçmişi
              </h1>
              <p className="text-sm text-gray-500">
                Ekipman bakım kayıtları ve geçmiş takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="equip-maint.primary_button"
            >
              <Plus size={16} className="mr-1" /> Bakım Kaydı Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Kayıt", val: records.length, color: "indigo" },
            {
              label: "Tamamlanan",
              val: records.filter((r) => r.status === "Tamamlandı").length,
              color: "green",
            },
            {
              label: "Toplam Maliyet (₺)",
              val: totalCost.toLocaleString("tr-TR", {
                maximumFractionDigits: 0,
              }),
              color: "cyan",
            },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold text-${c.color}-600`}>
                {c.val}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="equip-maint.empty_state"
            >
              Henüz bakım kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ekipman",
                      "Kod",
                      "Bakım Türü",
                      "Bakım Tarihi",
                      "Yapan Kişi",
                      "Süre",
                      "Maliyet",
                      "Sonraki Bakım",
                      "Durum",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold text-gray-600"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                      data-ocid={`equip-maint.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.equipmentName}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.equipmentCode}
                      </td>
                      <td className="px-4 py-3">{r.maintenanceType}</td>
                      <td className="px-4 py-3">{r.maintenanceDate}</td>
                      <td className="px-4 py-3">{r.performedBy}</td>
                      <td className="px-4 py-3">{r.duration}</td>
                      <td className="px-4 py-3">
                        {r.cost ? `₺${r.cost}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {r.nextMaintenanceDate || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="p-1 hover:text-indigo-600 text-gray-400"
                              data-ocid={`equip-maint.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`equip-maint.delete_button.${i + 1}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="equip-maint.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Bakım Kaydı Düzenle" : "Bakım Kaydı Ekle"}
              </DialogTitle>
              <DialogDescription>
                Ekipman bakım bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ekipman Adı *</Label>
                <Input
                  value={form.equipmentName}
                  onChange={(e) => sf("equipmentName", e.target.value)}
                  data-ocid="equip-maint.input"
                />
              </div>
              <div>
                <Label>Ekipman Kodu</Label>
                <Input
                  value={form.equipmentCode}
                  onChange={(e) => sf("equipmentCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Bakım Türü</Label>
                <Select
                  value={form.maintenanceType}
                  onValueChange={(v) => sf("maintenanceType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Önleyici",
                      "Düzeltici",
                      "Arıza Bakımı",
                      "Periyodik",
                      "Ön İzleme",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bakım Tarihi</Label>
                <Input
                  type="date"
                  value={form.maintenanceDate}
                  onChange={(e) => sf("maintenanceDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Yapan Kişi</Label>
                <Input
                  value={form.performedBy}
                  onChange={(e) => sf("performedBy", e.target.value)}
                />
              </div>
              <div>
                <Label>Süre (saat)</Label>
                <Input
                  value={form.duration}
                  onChange={(e) => sf("duration", e.target.value)}
                />
              </div>
              <div>
                <Label>Maliyet (₺)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) => sf("cost", e.target.value)}
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
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => sf("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Tamamlandı", "Devam Ediyor", "Planlandı", "İptal"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Değiştirilen Parçalar</Label>
                <Input
                  value={form.partsReplaced}
                  onChange={(e) => sf("partsReplaced", e.target.value)}
                />
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
                data-ocid="equip-maint.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="equip-maint.submit_button"
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
              <DialogTitle>Bakım Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.equipmentName} kaydını silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
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
