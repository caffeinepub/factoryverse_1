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
import { ClipboardCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddQCForm,
  useDeleteQCForm,
  useGetQCForms,
  useUpdateQCForm,
} from "../hooks/useQueries";
import type { QCFormRecord } from "../types";

const statusClass: Record<string, string> = {
  Geçti: "bg-green-100 text-green-800",
  Başarısız: "bg-red-100 text-red-800",
  Koşullu: "bg-yellow-100 text-yellow-800",
};

const emptyForm = {
  formDate: "",
  productName: "",
  productionLine: "",
  inspector: "",
  inspectionType: "Giriş",
  totalItems: "",
  passedItems: "",
  failedItems: "",
  defectCount: "",
  defectDescription: "",
  status: "Geçti",
  actionRequired: "",
  notes: "",
};

export function QCFormPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetQCForms(companyId);
  const addMut = useAddQCForm();
  const updateMut = useUpdateQCForm();
  const deleteMut = useDeleteQCForm();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QCFormRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<QCFormRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: QCFormRecord) {
    setEditing(r);
    setForm({
      formDate: r.formDate,
      productName: r.productName,
      productionLine: r.productionLine,
      inspector: r.inspector,
      inspectionType: r.inspectionType,
      totalItems: r.totalItems,
      passedItems: r.passedItems,
      failedItems: r.failedItems,
      defectCount: r.defectCount,
      defectDescription: r.defectDescription,
      status: r.status,
      actionRequired: r.actionRequired,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.formDate || !form.productName) {
      toast.error("Tarih ve ürün adı zorunludur.");
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

  async function handleDelete(r: QCFormRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const passed = records.filter((r) => r.status === "Geçti").length;
  const failed = records.filter((r) => r.status === "Başarısız").length;

  function rejectionRate(total: string, fail: string) {
    const t = Number(total);
    const f = Number(fail);
    if (!t) return "—";
    return `%${((f / t) * 100).toFixed(1)}`;
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ClipboardCheck className="text-green-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Kalite Kontrol Formu
              </h1>
              <p className="text-sm text-gray-500">
                Ürün ve süreç kalite kontrol takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="qc-forms.primary_button"
            >
              <Plus size={16} className="mr-1" /> Form Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Form", val: records.length, color: "indigo" },
            { label: "Geçen", val: passed, color: "green" },
            { label: "Başarısız", val: failed, color: "red" },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>
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
              data-ocid="qc-forms.empty_state"
            >
              Henüz kalite kontrol formu yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Tarih",
                      "Ürün",
                      "Hat",
                      "Muayene Türü",
                      "Toplam",
                      "Geçen",
                      "Başarısız",
                      "Red Oranı",
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
                      data-ocid={`qc-forms.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">{r.formDate}</td>
                      <td className="px-4 py-3">{r.productName}</td>
                      <td className="px-4 py-3">{r.productionLine || "—"}</td>
                      <td className="px-4 py-3">{r.inspectionType}</td>
                      <td className="px-4 py-3">{r.totalItems}</td>
                      <td className="px-4 py-3 text-green-600">
                        {r.passedItems}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        {r.failedItems}
                      </td>
                      <td className="px-4 py-3">
                        {rejectionRate(r.totalItems, r.failedItems)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusClass[r.status] ?? "bg-gray-100"
                          }`}
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
                              data-ocid={`qc-forms.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`qc-forms.delete_button.${i + 1}`}
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
            data-ocid="qc-forms.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Formu Düzenle" : "Kalite Kontrol Formu Ekle"}
              </DialogTitle>
              <DialogDescription>
                Kalite kontrol bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={form.formDate}
                  onChange={(e) => sf("formDate", e.target.value)}
                  data-ocid="qc-forms.input"
                />
              </div>
              <div>
                <Label>Ürün Adı *</Label>
                <Input
                  value={form.productName}
                  onChange={(e) => sf("productName", e.target.value)}
                />
              </div>
              <div>
                <Label>Üretim Hattı</Label>
                <Input
                  value={form.productionLine}
                  onChange={(e) => sf("productionLine", e.target.value)}
                />
              </div>
              <div>
                <Label>Denetçi</Label>
                <Input
                  value={form.inspector}
                  onChange={(e) => sf("inspector", e.target.value)}
                />
              </div>
              <div>
                <Label>Muayene Türü</Label>
                <Select
                  value={form.inspectionType}
                  onValueChange={(v) => sf("inspectionType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Giriş", "Süreç", "Final", "Periyodik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Toplam Adet</Label>
                <Input
                  value={form.totalItems}
                  onChange={(e) => sf("totalItems", e.target.value)}
                />
              </div>
              <div>
                <Label>Geçen Adet</Label>
                <Input
                  value={form.passedItems}
                  onChange={(e) => sf("passedItems", e.target.value)}
                />
              </div>
              <div>
                <Label>Başarısız Adet</Label>
                <Input
                  value={form.failedItems}
                  onChange={(e) => sf("failedItems", e.target.value)}
                />
              </div>
              <div>
                <Label>Hata Sayısı</Label>
                <Input
                  value={form.defectCount}
                  onChange={(e) => sf("defectCount", e.target.value)}
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
                    {["Geçti", "Başarısız", "Koşullu"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Hata Açıklaması</Label>
                <Textarea
                  value={form.defectDescription}
                  onChange={(e) => sf("defectDescription", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Gerekli Aksiyon</Label>
                <Textarea
                  value={form.actionRequired}
                  onChange={(e) => sf("actionRequired", e.target.value)}
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
                data-ocid="qc-forms.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="qc-forms.submit_button"
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
              <DialogTitle>Formu Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.productName} - {deleteConfirm?.formDate} formunu
                silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="qc-forms.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="qc-forms.confirm_button"
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
