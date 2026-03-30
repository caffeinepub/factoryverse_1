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
import { Pencil, Plus, Trash2, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddEquipmentRental,
  useDeleteEquipmentRental,
  useGetEquipmentRentals,
  useUpdateEquipmentRental,
} from "../hooks/useQueries";
import type { EquipmentRental } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Teslim Edildi": "bg-blue-100 text-blue-800",
  İptal: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  equipmentName: "",
  supplier: "",
  startDate: "",
  endDate: "",
  dailyRate: "",
  currency: "TRY",
  responsible: "",
  location: "",
  status: "Aktif",
  notes: "",
};

export function EquipmentRentalPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetEquipmentRentals(companyId);
  const addMut = useAddEquipmentRental();
  const updateMut = useUpdateEquipmentRental();
  const deleteMut = useDeleteEquipmentRental();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentRental | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<EquipmentRental | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: EquipmentRental) {
    setEditing(r);
    setForm({
      equipmentName: r.equipmentName,
      supplier: r.supplier,
      startDate: r.startDate,
      endDate: r.endDate,
      dailyRate: r.dailyRate,
      currency: r.currency,
      responsible: r.responsible,
      location: r.location,
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

  async function handleDelete(r: EquipmentRental) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="text-blue-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Ekipman Kiralama Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Kiralık ekipman ve süre yönetimi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="equipment-rental.primary_button"
            >
              <Plus size={16} className="mr-1" /> Kiralama Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Kiralama", val: records.length, color: "indigo" },
            {
              label: "Aktif",
              val: records.filter((r) => r.status === "Aktif").length,
              color: "green",
            },
            {
              label: "Teslim Edildi",
              val: records.filter((r) => r.status === "Teslim Edildi").length,
              color: "blue",
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
              data-ocid="equipment-rental.empty_state"
            >
              Henüz kiralama kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ekipman",
                      "Tedarikçi",
                      "Başlangıç",
                      "Bitiş",
                      "Günlük Ücret",
                      "Para Birimi",
                      "Sorumlu",
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
                      data-ocid={`equipment-rental.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.equipmentName}
                      </td>
                      <td className="px-4 py-3">{r.supplier}</td>
                      <td className="px-4 py-3">{r.startDate}</td>
                      <td className="px-4 py-3">{r.endDate}</td>
                      <td className="px-4 py-3">
                        {Number(r.dailyRate).toLocaleString("tr-TR")}
                      </td>
                      <td className="px-4 py-3">{r.currency}</td>
                      <td className="px-4 py-3">{r.responsible}</td>
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
                              data-ocid={`equipment-rental.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`equipment-rental.delete_button.${i + 1}`}
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
            data-ocid="equipment-rental.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Kiralama Düzenle" : "Kiralama Ekle"}
              </DialogTitle>
              <DialogDescription>
                Ekipman kiralama bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ekipman Adı *</Label>
                <Input
                  value={form.equipmentName}
                  onChange={(e) => sf("equipmentName", e.target.value)}
                  data-ocid="equipment-rental.input"
                />
              </div>
              <div>
                <Label>Tedarikçi</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => sf("supplier", e.target.value)}
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
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => sf("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => sf("endDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Günlük Ücret</Label>
                <Input
                  value={form.dailyRate}
                  onChange={(e) => sf("dailyRate", e.target.value)}
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
                    {["TRY", "USD", "EUR"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Lokasyon</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
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
                    {["Aktif", "Teslim Edildi", "İptal"].map((s) => (
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
                data-ocid="equipment-rental.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="equipment-rental.submit_button"
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
              <DialogTitle>Kiralama Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.equipmentName} kaydını silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="equipment-rental.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="equipment-rental.confirm_button"
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
