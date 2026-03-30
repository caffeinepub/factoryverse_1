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
import { AlertTriangle, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddWarrantyRecord,
  useDeleteWarrantyRecord,
  useGetWarrantyRecords,
  useUpdateWarrantyRecord,
} from "../hooks/useQueries";
import type { WarrantyRecord } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Süresi Doldu": "bg-red-100 text-red-800",
  "Talep Açıldı": "bg-orange-100 text-orange-800",
};

const emptyForm = {
  itemName: "",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  warrantyStartDate: "",
  warrantyEndDate: "",
  supplier: "",
  warrantyType: "Üretici",
  status: "Aktif",
  notes: "",
};

export function WarrantyPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetWarrantyRecords(companyId);
  const addMut = useAddWarrantyRecord();
  const updateMut = useUpdateWarrantyRecord();
  const deleteMut = useDeleteWarrantyRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WarrantyRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<WarrantyRecord | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: WarrantyRecord) {
    setEditing(r);
    setForm({
      itemName: r.itemName,
      brand: r.brand,
      model: r.model,
      serialNumber: r.serialNumber,
      purchaseDate: r.purchaseDate,
      warrantyStartDate: r.warrantyStartDate,
      warrantyEndDate: r.warrantyEndDate,
      supplier: r.supplier,
      warrantyType: r.warrantyType,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.itemName) {
      toast.error("Ürün adı zorunludur.");
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

  async function handleDelete(r: WarrantyRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const today = new Date();
  const expiringSoon = records.filter((r) => {
    if (!r.warrantyEndDate) return false;
    const diff =
      (new Date(r.warrantyEndDate).getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  function endDateColor(dateStr: string) {
    if (!dateStr) return "text-gray-700";
    const diff =
      (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 0) return "text-red-600 font-medium";
    if (diff <= 30) return "text-orange-600 font-medium";
    return "text-gray-700";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ShieldCheck className="text-emerald-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Garanti Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Ürün garanti kayıtları ve bitiş tarihi takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="warranty.primary_button"
            >
              <Plus size={16} className="mr-1" /> Garanti Ekle
            </Button>
          )}
        </div>

        {expiringSoon > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {expiringSoon} garantinin son tarihi 30 gün içinde doluyor!
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Kayıt", val: records.length, color: "indigo" },
            {
              label: "Aktif",
              val: records.filter((r) => r.status === "Aktif").length,
              color: "green",
            },
            {
              label: "30 Gün İçinde Dolan",
              val: expiringSoon,
              color: "orange",
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
              data-ocid="warranty.empty_state"
            >
              Henüz garanti kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ürün Adı",
                      "Marka/Model",
                      "Seri No",
                      "Tedarikçi",
                      "Garanti Türü",
                      "Garanti Bitiş",
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
                      data-ocid={`warranty.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.itemName}</td>
                      <td className="px-4 py-3">
                        {r.brand} {r.model}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {r.serialNumber}
                      </td>
                      <td className="px-4 py-3">{r.supplier}</td>
                      <td className="px-4 py-3">{r.warrantyType}</td>
                      <td
                        className={`px-4 py-3 ${endDateColor(r.warrantyEndDate)}`}
                      >
                        {r.warrantyEndDate}
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
                              data-ocid={`warranty.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`warranty.delete_button.${i + 1}`}
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
            data-ocid="warranty.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Garanti Düzenle" : "Garanti Ekle"}
              </DialogTitle>
              <DialogDescription>
                Garanti kaydı bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ürün Adı *</Label>
                <Input
                  value={form.itemName}
                  onChange={(e) => sf("itemName", e.target.value)}
                  data-ocid="warranty.input"
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
                <Label>Seri Numarası</Label>
                <Input
                  value={form.serialNumber}
                  onChange={(e) => sf("serialNumber", e.target.value)}
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
                <Label>Satın Alma Tarihi</Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => sf("purchaseDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Garanti Başlangıç</Label>
                <Input
                  type="date"
                  value={form.warrantyStartDate}
                  onChange={(e) => sf("warrantyStartDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Garanti Bitiş</Label>
                <Input
                  type="date"
                  value={form.warrantyEndDate}
                  onChange={(e) => sf("warrantyEndDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Garanti Türü</Label>
                <Select
                  value={form.warrantyType}
                  onValueChange={(v) => sf("warrantyType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Üretici", "Tedarikçi", "Uzatılmış"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {["Aktif", "Süresi Doldu", "Talep Açıldı"].map((s) => (
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
                data-ocid="warranty.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="warranty.submit_button"
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
              <DialogTitle>Garanti Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.itemName} kaydını silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="warranty.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="warranty.confirm_button"
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
