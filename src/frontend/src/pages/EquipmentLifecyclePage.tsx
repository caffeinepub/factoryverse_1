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
import { Cpu, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddEquipmentLifecycle,
  useDeleteEquipmentLifecycle,
  useGetEquipmentLifecycles,
  useUpdateEquipmentLifecycle,
} from "../hooks/useQueries";
import type { EquipmentLifecycleRecord } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Bakımda: "bg-yellow-100 text-yellow-800",
  "Ömür Sonu Yakın": "bg-orange-100 text-orange-800",
  Değiştirilmeli: "bg-red-100 text-red-800",
  "Hurdaya Ayrıldı": "bg-gray-100 text-gray-700",
};

const emptyForm = {
  equipmentName: "",
  equipmentCode: "",
  brand: "",
  model: "",
  location: "",
  installationDate: "",
  expectedLifeYears: "",
  endOfLifeDate: "",
  lastMaintenanceDate: "",
  purchaseCost: "",
  currency: "TRY",
  replacementCost: "",
  responsible: "",
  status: "Aktif",
  notes: "",
};

export function EquipmentLifecyclePage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } =
    useGetEquipmentLifecycles(companyId);
  const addMut = useAddEquipmentLifecycle();
  const updateMut = useUpdateEquipmentLifecycle();
  const deleteMut = useDeleteEquipmentLifecycle();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentLifecycleRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<EquipmentLifecycleRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: EquipmentLifecycleRecord) {
    setEditing(r);
    setForm({
      equipmentName: r.equipmentName,
      equipmentCode: r.equipmentCode,
      brand: r.brand,
      model: r.model,
      location: r.location,
      installationDate: r.installationDate,
      expectedLifeYears: r.expectedLifeYears,
      endOfLifeDate: r.endOfLifeDate,
      lastMaintenanceDate: r.lastMaintenanceDate,
      purchaseCost: r.purchaseCost,
      currency: r.currency,
      replacementCost: r.replacementCost,
      responsible: r.responsible,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.equipmentName || !form.installationDate) {
      toast.error("Ekipman adı ve kurulum tarihi zorunludur.");
      return;
    }
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...form });
      toast.success("Kayıt güncellendi.");
    } else {
      await addMut.mutateAsync({ companyId: companyId!, ...form });
      toast.success("Ekipman eklendi.");
    }
    setOpen(false);
  }

  async function handleDelete(r: EquipmentLifecycleRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
      r.equipmentCode.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const endSoonCount = records.filter((r) => {
    if (!r.endOfLifeDate) return false;
    const diff =
      (new Date(r.endOfLifeDate).getTime() - Date.now()) / (1000 * 3600 * 24);
    return diff <= 365 && diff >= 0;
  }).length;
  const replaceCount = records.filter(
    (r) => r.status === "Değiştirilmeli" || r.status === "Hurdaya Ayrıldı",
  ).length;

  function getDateClass(dateStr: string) {
    if (!dateStr) return "";
    const diff =
      (new Date(dateStr).getTime() - Date.now()) / (1000 * 3600 * 24);
    if (diff < 0) return "text-red-600 font-semibold";
    if (diff <= 365) return "text-orange-500 font-semibold";
    return "text-gray-700";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
              <Cpu size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ekipman Ömür Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Ekipman yaşam döngüsü ve yenileme planlaması
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="equipment-lifecycle.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Ekipman Ekle
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
              label: "Toplam Ekipman",
              value: totalCount,
              color: "text-indigo-600",
            },
            {
              label: "Ömür Sonu Yakın (1 Yıl)",
              value: endSoonCount,
              color: "text-orange-500",
            },
            {
              label: "Değiştirilmeli / Hurda",
              value: replaceCount,
              color: "text-red-600",
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
              placeholder="Ekipman adı veya kod ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="equipment-lifecycle.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="equipment-lifecycle.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="equipment-lifecycle.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Ekipman",
                      "Kod",
                      "Marka/Model",
                      "Kurulum",
                      "Tahmini Ömür",
                      "Ömür Sonu",
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
                <tbody className="divide-y">
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50"
                      data-ocid={`equipment-lifecycle.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.equipmentName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {r.equipmentCode}
                      </td>
                      <td className="px-4 py-3">
                        {r.brand} {r.model}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.installationDate}
                      </td>
                      <td className="px-4 py-3">
                        {r.expectedLifeYears
                          ? `${r.expectedLifeYears} yıl`
                          : "-"}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap ${getDateClass(r.endOfLifeDate)}`}
                      >
                        {r.endOfLifeDate || "-"}
                      </td>
                      <td className="px-4 py-3">{r.responsible}</td>
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
                              data-ocid={`equipment-lifecycle.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`equipment-lifecycle.delete_button.${i + 1}`}
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
            data-ocid="equipment-lifecycle.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Ekipman Düzenle" : "Ekipman Ekle"}
              </DialogTitle>
              <DialogDescription>
                Ekipman ömür bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ekipman Adı *</Label>
                <Input
                  value={form.equipmentName}
                  onChange={(e) => sf("equipmentName", e.target.value)}
                  data-ocid="equipment-lifecycle.input"
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
                <Label>Marka</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => sf("brand", e.target.value)}
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={form.model}
                  onChange={(e) => sf("model", e.target.value)}
                />
              </div>
              <div>
                <Label>Lokasyon</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                />
              </div>
              <div>
                <Label>Kurulum Tarihi *</Label>
                <Input
                  type="date"
                  value={form.installationDate}
                  onChange={(e) => sf("installationDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Tahmini Ömür (Yıl)</Label>
                <Input
                  type="number"
                  value={form.expectedLifeYears}
                  onChange={(e) => sf("expectedLifeYears", e.target.value)}
                />
              </div>
              <div>
                <Label>Ömür Sonu Tarihi</Label>
                <Input
                  type="date"
                  value={form.endOfLifeDate}
                  onChange={(e) => sf("endOfLifeDate", e.target.value)}
                />
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
                <Label>Alım Maliyeti</Label>
                <Input
                  value={form.purchaseCost}
                  onChange={(e) => sf("purchaseCost", e.target.value)}
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
                <Label>Değiştirme Maliyeti</Label>
                <Input
                  value={form.replacementCost}
                  onChange={(e) => sf("replacementCost", e.target.value)}
                />
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
                      "Aktif",
                      "Bakımda",
                      "Ömür Sonu Yakın",
                      "Değiştirilmeli",
                      "Hurdaya Ayrıldı",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                data-ocid="equipment-lifecycle.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="equipment-lifecycle.submit_button"
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
                {deleteConfirm?.equipmentName} ekipmanını silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="equipment-lifecycle.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="equipment-lifecycle.confirm_button"
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
