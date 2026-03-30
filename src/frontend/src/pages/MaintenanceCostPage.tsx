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
import { DollarSign, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMaintenanceCostRecord,
  useDeleteMaintenanceCostRecord,
  useGetMaintenanceCostRecords,
  useUpdateMaintenanceCostRecord,
} from "../hooks/useQueries";
import type { MaintenanceCostRecord } from "../types";

const statusClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
  Ödendi: "bg-blue-100 text-blue-800",
};

const costTypes = [
  "İşçilik",
  "Malzeme",
  "Yedek Parça",
  "Dış Servis",
  "Nakliye",
  "Diğer",
];
const currencies = ["TRY", "USD", "EUR", "GBP"];
const statuses = ["Beklemede", "Onaylandı", "Reddedildi", "Ödendi"];

const emptyForm = {
  workOrderId: "",
  workOrderTitle: "",
  costType: "",
  description: "",
  amount: "",
  currency: "TRY",
  vendor: "",
  invoiceNumber: "",
  costDate: "",
  approvedBy: "",
  status: "Beklemede",
  notes: "",
};

export function MaintenanceCostPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";
  const { data: records = [], isLoading } =
    useGetMaintenanceCostRecords(userCode);
  const addMutation = useAddMaintenanceCostRecord();
  const updateMutation = useUpdateMaintenanceCostRecord();
  const deleteMutation = useDeleteMaintenanceCostRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceCostRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const totalCost = records.reduce(
    (sum, r) => sum + (Number.parseFloat(r.amount) || 0),
    0,
  );
  const paid = records.filter((r) => r.status === "Ödendi").length;
  const pending = records.filter((r) => r.status === "Beklemede").length;

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }

  function openEdit(r: MaintenanceCostRecord) {
    setEditing(r);
    setForm({
      workOrderId: r.workOrderId,
      workOrderTitle: r.workOrderTitle,
      costType: r.costType,
      description: r.description,
      amount: r.amount,
      currency: r.currency,
      vendor: r.vendor,
      invoiceNumber: r.invoiceNumber,
      costDate: r.costDate,
      approvedBy: r.approvedBy,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!adminCode) return toast.error("Sadece yöneticiler işlem yapabilir.");
    if (!form.workOrderTitle || !form.costType || !form.amount)
      return toast.error("Lütfen zorunlu alanları doldurun.");
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          adminCode,
          recordId: editing.id,
          ...form,
        });
        toast.success("Kayıt güncellendi.");
      } else {
        await addMutation.mutateAsync({ adminCode, ...form });
        toast.success("Maliyet kaydı eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete() {
    if (!adminCode || !deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Kayıt silindi.");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Bakım Maliyeti Takibi
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              İş emirlerine bağlı maliyet kayıtları ve onay takibi
            </p>
          </div>
          {adminCode && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Maliyet Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Maliyet",
              value: `${totalCost.toLocaleString("tr-TR")} TRY`,
              color: "bg-indigo-50 border-indigo-200",
            },
            {
              label: "Ödenen",
              value: paid,
              color: "bg-green-50 border-green-200",
            },
            {
              label: "Bekleyen",
              value: pending,
              color: "bg-yellow-50 border-yellow-200",
            },
          ].map((c) => (
            <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-center py-12">Yükleniyor...</p>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <DollarSign size={48} className="mx-auto mb-3 opacity-30" />
            <p>Henüz maliyet kaydı yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "İş Emri",
                    "Maliyet Türü",
                    "Açıklama",
                    "Tutar",
                    "Tedarikçi",
                    "Tarih",
                    "Durum",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-gray-500 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {r.workOrderTitle || r.workOrderId}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.costType}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                      {r.description}
                    </td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">
                      {Number.parseFloat(r.amount).toLocaleString("tr-TR")}{" "}
                      {r.currency}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.vendor}</td>
                    <td className="px-4 py-3 text-gray-500">{r.costDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    {adminCode && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="text-gray-400 hover:text-indigo-600"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Kaydı Düzenle" : "Yeni Maliyet Kaydı"}
            </DialogTitle>
            <DialogDescription>
              Bakım maliyeti bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>İş Emri Başlığı *</Label>
              <Input
                value={form.workOrderTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, workOrderTitle: e.target.value }))
                }
                placeholder="İş emri adı"
              />
            </div>
            <div className="space-y-1">
              <Label>İş Emri ID</Label>
              <Input
                value={form.workOrderId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, workOrderId: e.target.value }))
                }
                placeholder="Opsiyonel"
              />
            </div>
            <div className="space-y-1">
              <Label>Maliyet Türü *</Label>
              <Select
                value={form.costType}
                onValueChange={(v) => setForm((f) => ({ ...f, costType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {costTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tutar *</Label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <Label>Para Birimi</Label>
              <Select
                value={form.currency}
                onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Tedarikçi / Firma</Label>
              <Input
                value={form.vendor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vendor: e.target.value }))
                }
                placeholder="Tedarikçi adı"
              />
            </div>
            <div className="space-y-1">
              <Label>Fatura No</Label>
              <Input
                value={form.invoiceNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, invoiceNumber: e.target.value }))
                }
                placeholder="Fatura numarası"
              />
            </div>
            <div className="space-y-1">
              <Label>Maliyet Tarihi</Label>
              <Input
                type="date"
                value={form.costDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, costDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Onaylayan</Label>
              <Input
                value={form.approvedBy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, approvedBy: e.target.value }))
                }
                placeholder="Onaylayan kişi"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Açıklama</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription>
              Bu maliyet kaydı silinecek. Emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
