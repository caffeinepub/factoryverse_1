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
import { FileEdit, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddBudgetRevisionRecord,
  useDeleteBudgetRevisionRecord,
  useGetBudgetRevisionRecords,
  useUpdateBudgetRevisionRecord,
} from "../hooks/useQueries";
import type { BudgetRevisionRecord } from "../types";

const statusClass: Record<string, string> = {
  Taslak: "bg-gray-100 text-gray-700",
  "Onay Bekliyor": "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
};
const statuses = ["Taslak", "Onay Bekliyor", "Onaylandı", "Reddedildi"];

const emptyForm = {
  budgetTitle: "",
  revisionNumber: "",
  originalAmount: "",
  revisedAmount: "",
  changeReason: "",
  requestedBy: "",
  approvedBy: "",
  revisionDate: "",
  approvalDate: "",
  status: "Taslak",
  notes: "",
};

export function BudgetRevisionPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";
  const { data: records = [], isLoading } =
    useGetBudgetRevisionRecords(userCode);
  const addMutation = useAddBudgetRevisionRecord();
  const updateMutation = useUpdateBudgetRevisionRecord();
  const deleteMutation = useDeleteBudgetRevisionRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetRevisionRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const totalIncrease = records.reduce((sum, r) => {
    const diff =
      (Number.parseFloat(r.revisedAmount) || 0) -
      (Number.parseFloat(r.originalAmount) || 0);
    return sum + diff;
  }, 0);
  const approved = records.filter((r) => r.status === "Onaylandı").length;
  const pending = records.filter((r) => r.status === "Onay Bekliyor").length;

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }
  function openEdit(r: BudgetRevisionRecord) {
    setEditing(r);
    setForm({
      budgetTitle: r.budgetTitle,
      revisionNumber: r.revisionNumber,
      originalAmount: r.originalAmount,
      revisedAmount: r.revisedAmount,
      changeReason: r.changeReason,
      requestedBy: r.requestedBy,
      approvedBy: r.approvedBy,
      revisionDate: r.revisionDate,
      approvalDate: r.approvalDate,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!adminCode) return toast.error("Sadece yöneticiler işlem yapabilir.");
    if (!form.budgetTitle || !form.originalAmount)
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
        toast.success("Revizyon kaydedildi.");
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
              Bütçe Revizyon Takibi
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Bütçe revizyon geçmişi ve onay akışı
            </p>
          </div>
          {adminCode && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Revizyon Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Net Değişim (TRY)",
              value:
                (totalIncrease >= 0 ? "+" : "") +
                totalIncrease.toLocaleString("tr-TR"),
              color:
                totalIncrease >= 0
                  ? "bg-orange-50 border-orange-200"
                  : "bg-green-50 border-green-200",
            },
            {
              label: "Onaylanan",
              value: approved,
              color: "bg-green-50 border-green-200",
            },
            {
              label: "Onay Bekleyen",
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
            <FileEdit size={48} className="mx-auto mb-3 opacity-30" />
            <p>Henüz bütçe revizyonu yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Bütçe Adı",
                    "Rev. No",
                    "Orijinal (TRY)",
                    "Revize (TRY)",
                    "Fark",
                    "Talep Eden",
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
                {records.map((r) => {
                  const diff =
                    (Number.parseFloat(r.revisedAmount) || 0) -
                    (Number.parseFloat(r.originalAmount) || 0);
                  return (
                    <tr
                      key={r.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.budgetTitle}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        #{r.revisionNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {Number.parseFloat(r.originalAmount).toLocaleString(
                          "tr-TR",
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {Number.parseFloat(r.revisedAmount).toLocaleString(
                          "tr-TR",
                        )}
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold ${diff >= 0 ? "text-red-600" : "text-green-600"}`}
                      >
                        {diff >= 0 ? "+" : ""}
                        {diff.toLocaleString("tr-TR")}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.requestedBy}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {r.revisionDate}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Revizyonu Düzenle" : "Yeni Bütçe Revizyonu"}
            </DialogTitle>
            <DialogDescription>
              Bütçe revizyon bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Bütçe Adı *</Label>
              <Input
                value={form.budgetTitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budgetTitle: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Revizyon No</Label>
              <Input
                value={form.revisionNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, revisionNumber: e.target.value }))
                }
                placeholder="R001"
              />
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
              <Label>Orijinal Bütçe (TRY) *</Label>
              <Input
                type="number"
                value={form.originalAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, originalAmount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Revize Bütçe (TRY)</Label>
              <Input
                type="number"
                value={form.revisedAmount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, revisedAmount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Talep Eden</Label>
              <Input
                value={form.requestedBy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requestedBy: e.target.value }))
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
              />
            </div>
            <div className="space-y-1">
              <Label>Revizyon Tarihi</Label>
              <Input
                type="date"
                value={form.revisionDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, revisionDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Onay Tarihi</Label>
              <Input
                type="date"
                value={form.approvalDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, approvalDate: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Değişiklik Nedeni</Label>
              <Textarea
                value={form.changeReason}
                onChange={(e) =>
                  setForm((f) => ({ ...f, changeReason: e.target.value }))
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
              Bu bütçe revizyonu silinecek. Emin misiniz?
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
