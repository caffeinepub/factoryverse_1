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
  useAddMaintenanceBudget,
  useDeleteMaintenanceBudget,
  useGetMaintenanceBudgets,
  useUpdateMaintenanceBudget,
} from "../hooks/useQueries";
import type { MaintenanceBudgetRecord } from "../types";

const statusClass: Record<string, string> = {
  Taslak: "bg-gray-100 text-gray-700",
  Onaylandı: "bg-green-100 text-green-800",
  Revize: "bg-yellow-100 text-yellow-800",
  Reddedildi: "bg-red-100 text-red-800",
};

const emptyForm = {
  budgetYear: "",
  period: "Q1",
  department: "",
  category: "Mekanik",
  description: "",
  plannedAmount: "",
  approvedAmount: "",
  spentAmount: "",
  currency: "TRY",
  status: "Taslak",
  approvedBy: "",
  notes: "",
};

export function MaintenanceBudgetPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetMaintenanceBudgets(companyId);
  const addMut = useAddMaintenanceBudget();
  const updateMut = useUpdateMaintenanceBudget();
  const deleteMut = useDeleteMaintenanceBudget();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceBudgetRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<MaintenanceBudgetRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: MaintenanceBudgetRecord) {
    setEditing(r);
    setForm({
      budgetYear: r.budgetYear,
      period: r.period,
      department: r.department,
      category: r.category,
      description: r.description,
      plannedAmount: r.plannedAmount,
      approvedAmount: r.approvedAmount,
      spentAmount: r.spentAmount,
      currency: r.currency,
      status: r.status,
      approvedBy: r.approvedBy,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.budgetYear || !form.department) {
      toast.error("Yıl ve departman zorunludur.");
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

  async function handleDelete(r: MaintenanceBudgetRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const approved = records.filter((r) => r.status === "Onaylandı").length;
  const totalPlanned = records.reduce(
    (a, r) => a + (Number(r.plannedAmount) || 0),
    0,
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Bakım Bütçe Planlama
              </h1>
              <p className="text-sm text-gray-500">
                Departman bazlı bakım bütçe takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="maintenance-budget.primary_button"
            >
              <Plus size={16} className="mr-1" /> Bütçe Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Bütçe Kalemi",
              val: records.length,
              color: "indigo",
            },
            { label: "Onaylanan", val: approved, color: "green" },
            {
              label: "Planlanan Toplam (TRY)",
              val: totalPlanned.toLocaleString("tr-TR"),
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
              data-ocid="maintenance-budget.empty_state"
            >
              Henüz bütçe kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Yıl",
                      "Dönem",
                      "Departman",
                      "Kategori",
                      "Planlanan",
                      "Onaylanan",
                      "Harcanan",
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
                      data-ocid={`maintenance-budget.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">{r.budgetYear}</td>
                      <td className="px-4 py-3">{r.period}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3">
                        {Number(r.plannedAmount).toLocaleString("tr-TR")}{" "}
                        {r.currency}
                      </td>
                      <td className="px-4 py-3">
                        {r.approvedAmount
                          ? `${Number(r.approvedAmount).toLocaleString("tr-TR")} ${r.currency}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.spentAmount
                          ? `${Number(r.spentAmount).toLocaleString("tr-TR")} ${r.currency}`
                          : "—"}
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
                              data-ocid={`maintenance-budget.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`maintenance-budget.delete_button.${i + 1}`}
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
            data-ocid="maintenance-budget.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Bütçe Düzenle" : "Bütçe Kalemi Ekle"}
              </DialogTitle>
              <DialogDescription>
                Bakım bütçe bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Bütçe Yılı *</Label>
                <Input
                  value={form.budgetYear}
                  placeholder="2024"
                  onChange={(e) => sf("budgetYear", e.target.value)}
                  data-ocid="maintenance-budget.input"
                />
              </div>
              <div>
                <Label>Dönem</Label>
                <Select
                  value={form.period}
                  onValueChange={(v) => sf("period", v)}
                >
                  <SelectTrigger data-ocid="maintenance-budget.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Q1", "Q2", "Q3", "Q4", "Yıllık"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departman *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => sf("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Mekanik",
                      "Elektrik",
                      "Hidrolik",
                      "Pnömatik",
                      "Genel",
                      "Diğer",
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
                <Input
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
                />
              </div>
              <div>
                <Label>Planlanan Tutar</Label>
                <Input
                  value={form.plannedAmount}
                  onChange={(e) => sf("plannedAmount", e.target.value)}
                />
              </div>
              <div>
                <Label>Onaylanan Tutar</Label>
                <Input
                  value={form.approvedAmount}
                  onChange={(e) => sf("approvedAmount", e.target.value)}
                />
              </div>
              <div>
                <Label>Harcanan Tutar</Label>
                <Input
                  value={form.spentAmount}
                  onChange={(e) => sf("spentAmount", e.target.value)}
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
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => sf("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Taslak", "Onaylandı", "Revize", "Reddedildi"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Onaylayan</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) => sf("approvedBy", e.target.value)}
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
                data-ocid="maintenance-budget.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="maintenance-budget.submit_button"
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
              <DialogTitle>Bütçe Kalemini Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.department} - {deleteConfirm?.budgetYear}{" "}
                kaydını silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="maintenance-budget.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="maintenance-budget.confirm_button"
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
