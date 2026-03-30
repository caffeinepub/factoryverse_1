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
import { BarChart3, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddProductionQuality,
  useDeleteProductionQuality,
  useGetProductionQuality,
  useUpdateProductionQuality,
} from "../hooks/useQueries";
import type { ProductionQualityRecord } from "../types";

const emptyForm = {
  reportDate: "",
  productionLine: "",
  productName: "",
  shift: "Sabah",
  totalProduced: "",
  accepted: "",
  rejected: "",
  reworked: "",
  defectType: "",
  defectCause: "",
  responsible: "",
  corrective: "",
  status: "Açık",
  notes: "",
};

export function ProductionQualityPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetProductionQuality(companyId);
  const addMut = useAddProductionQuality();
  const updateMut = useUpdateProductionQuality();
  const deleteMut = useDeleteProductionQuality();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductionQualityRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<ProductionQualityRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: ProductionQualityRecord) {
    setEditing(r);
    setForm({
      reportDate: r.reportDate,
      productionLine: r.productionLine,
      productName: r.productName,
      shift: r.shift,
      totalProduced: r.totalProduced,
      accepted: r.accepted,
      rejected: r.rejected,
      reworked: r.reworked,
      defectType: r.defectType,
      defectCause: r.defectCause,
      responsible: r.responsible,
      corrective: r.corrective,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.productName || !form.reportDate) {
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

  async function handleDelete(r: ProductionQualityRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const totalProduced = records.reduce(
    (a, r) => a + (Number(r.totalProduced) || 0),
    0,
  );
  const totalRejected = records.reduce(
    (a, r) => a + (Number(r.rejected) || 0),
    0,
  );
  const rejectionRate =
    totalProduced > 0
      ? ((totalRejected / totalProduced) * 100).toFixed(1)
      : "0.0";

  function rejectRateClass(rejected: string, total: string) {
    if (!total || !rejected) return "";
    const rate = (Number(rejected) / Number(total)) * 100;
    if (rate >= 5) return "text-red-600 font-semibold";
    if (rate >= 2) return "text-yellow-600";
    return "text-green-600";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Üretim Kalite Raporu
              </h1>
              <p className="text-sm text-gray-500">
                Hat bazlı kalite ve red oranı takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="production-quality.primary_button"
            >
              <Plus size={16} className="mr-1" /> Rapor Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Rapor", val: records.length, color: "indigo" },
            {
              label: "Toplam Üretim",
              val: totalProduced.toLocaleString("tr-TR"),
              color: "blue",
            },
            {
              label: "Genel Red Oranı",
              val: `${rejectionRate}%`,
              color:
                Number(rejectionRate) >= 5
                  ? "red"
                  : Number(rejectionRate) >= 2
                    ? "yellow"
                    : "green",
            },
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
              data-ocid="production-quality.empty_state"
            >
              Henüz kalite raporu yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Tarih",
                      "Hat",
                      "Ürün",
                      "Vardiya",
                      "Üretilen",
                      "Kabul",
                      "Red",
                      "Yeniden İşlem",
                      "Red Oranı",
                      "Hata Türü",
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
                  {records.map((r, i) => {
                    const rate =
                      r.totalProduced && Number(r.totalProduced) > 0
                        ? (
                            (Number(r.rejected) / Number(r.totalProduced)) *
                            100
                          ).toFixed(1)
                        : "—";
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b last:border-0 hover:bg-gray-50"
                        data-ocid={`production-quality.item.${i + 1}`}
                      >
                        <td className="px-4 py-3">{r.reportDate}</td>
                        <td className="px-4 py-3">{r.productionLine}</td>
                        <td className="px-4 py-3 font-medium">
                          {r.productName}
                        </td>
                        <td className="px-4 py-3">{r.shift}</td>
                        <td className="px-4 py-3">{r.totalProduced}</td>
                        <td className="px-4 py-3 text-green-600">
                          {r.accepted || "—"}
                        </td>
                        <td className="px-4 py-3 text-red-600">
                          {r.rejected || "—"}
                        </td>
                        <td className="px-4 py-3 text-yellow-600">
                          {r.reworked || "—"}
                        </td>
                        <td
                          className={`px-4 py-3 ${
                            rate !== "—"
                              ? rejectRateClass(r.rejected, r.totalProduced)
                              : ""
                          }`}
                        >
                          {rate !== "—" ? `${rate}%` : "—"}
                        </td>
                        <td className="px-4 py-3">{r.defectType || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              r.status === "Kapalı"
                                ? "bg-green-100 text-green-800"
                                : r.status === "İncelemede"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
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
                                data-ocid={`production-quality.edit_button.${i + 1}`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(r)}
                                className="p-1 hover:text-red-500 text-gray-400"
                                data-ocid={`production-quality.delete_button.${i + 1}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="production-quality.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Rapor Düzenle" : "Kalite Raporu Ekle"}
              </DialogTitle>
              <DialogDescription>
                Üretim kalite raporu bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={form.reportDate}
                  onChange={(e) => sf("reportDate", e.target.value)}
                  data-ocid="production-quality.input"
                />
              </div>
              <div>
                <Label>Vardiya</Label>
                <Select
                  value={form.shift}
                  onValueChange={(v) => sf("shift", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sabah", "Öğleden Sonra", "Gece"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Üretim Hattı</Label>
                <Input
                  value={form.productionLine}
                  onChange={(e) => sf("productionLine", e.target.value)}
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
                <Label>Toplam Üretilen</Label>
                <Input
                  value={form.totalProduced}
                  onChange={(e) => sf("totalProduced", e.target.value)}
                />
              </div>
              <div>
                <Label>Kabul Edilen</Label>
                <Input
                  value={form.accepted}
                  onChange={(e) => sf("accepted", e.target.value)}
                />
              </div>
              <div>
                <Label>Reddedilen</Label>
                <Input
                  value={form.rejected}
                  onChange={(e) => sf("rejected", e.target.value)}
                />
              </div>
              <div>
                <Label>Yeniden İşleme Giren</Label>
                <Input
                  value={form.reworked}
                  onChange={(e) => sf("reworked", e.target.value)}
                />
              </div>
              <div>
                <Label>Hata Türü</Label>
                <Input
                  value={form.defectType}
                  onChange={(e) => sf("defectType", e.target.value)}
                />
              </div>
              <div>
                <Label>Hata Nedeni</Label>
                <Input
                  value={form.defectCause}
                  onChange={(e) => sf("defectCause", e.target.value)}
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
                    {["Açık", "İncelemede", "Kapalı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Düzeltici Faaliyet</Label>
                <Textarea
                  value={form.corrective}
                  onChange={(e) => sf("corrective", e.target.value)}
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
                data-ocid="production-quality.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="production-quality.submit_button"
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
              <DialogTitle>Raporu Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.productName} raporunu silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="production-quality.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="production-quality.confirm_button"
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
