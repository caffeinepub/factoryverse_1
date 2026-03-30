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
import { Pencil, Plus, Receipt, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddGeneralExpense,
  useDeleteGeneralExpense,
  useGetGeneralExpenses,
  useUpdateGeneralExpense,
} from "../hooks/useQueries";
import type { GeneralExpenseRecord } from "../types";

const categoryColors: Record<string, string> = {
  Ofis: "bg-blue-100 text-blue-800",
  Ulaşım: "bg-purple-100 text-purple-800",
  Yemek: "bg-orange-100 text-orange-800",
  Temizlik: "bg-teal-100 text-teal-800",
  Güvenlik: "bg-red-100 text-red-800",
  Haberleşme: "bg-indigo-100 text-indigo-800",
  Diğer: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  expenseDate: "",
  category: "Ofis",
  description: "",
  amount: "",
  currency: "TRY",
  paidBy: "",
  approvedBy: "",
  invoiceNumber: "",
  department: "",
  paymentMethod: "Nakit",
  status: "Beklemede",
  notes: "",
};

export function GeneralExpensePage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetGeneralExpenses(companyId);
  const addMut = useAddGeneralExpense();
  const updateMut = useUpdateGeneralExpense();
  const deleteMut = useDeleteGeneralExpense();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GeneralExpenseRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<GeneralExpenseRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: GeneralExpenseRecord) {
    setEditing(r);
    setForm({
      expenseDate: r.expenseDate,
      category: r.category,
      description: r.description,
      amount: r.amount,
      currency: r.currency,
      paidBy: r.paidBy,
      approvedBy: r.approvedBy,
      invoiceNumber: r.invoiceNumber,
      department: r.department,
      paymentMethod: r.paymentMethod,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.description || !form.amount) {
      toast.error("Açıklama ve tutar zorunludur.");
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

  async function handleDelete(r: GeneralExpenseRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const totalAmount = records.reduce((a, r) => a + (Number(r.amount) || 0), 0);
  const approved = records.filter((r) => r.status === "Onaylandı").length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Receipt className="text-green-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Genel Gider Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Şirket genel gider ve harcama takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="general-expense.primary_button"
            >
              <Plus size={16} className="mr-1" /> Gider Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Gider", val: records.length, color: "indigo" },
            { label: "Onaylanan", val: approved, color: "green" },
            {
              label: "Toplam Tutar (TRY)",
              val: totalAmount.toLocaleString("tr-TR"),
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
              data-ocid="general-expense.empty_state"
            >
              Henüz gider kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Tarih",
                      "Kategori",
                      "Açıklama",
                      "Tutar",
                      "Departman",
                      "Ödeyen",
                      "Ödeme Yöntemi",
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
                      data-ocid={`general-expense.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">{r.expenseDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            categoryColors[r.category] ?? "bg-gray-100"
                          }`}
                        >
                          {r.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.description}</td>
                      <td className="px-4 py-3 font-medium">
                        {Number(r.amount).toLocaleString("tr-TR")} {r.currency}
                      </td>
                      <td className="px-4 py-3">{r.department || "—"}</td>
                      <td className="px-4 py-3">{r.paidBy || "—"}</td>
                      <td className="px-4 py-3">{r.paymentMethod}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === "Onaylandı"
                              ? "bg-green-100 text-green-800"
                              : r.status === "Reddedildi"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
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
                              data-ocid={`general-expense.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`general-expense.delete_button.${i + 1}`}
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
            data-ocid="general-expense.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Gider Düzenle" : "Gider Ekle"}
              </DialogTitle>
              <DialogDescription>Gider bilgilerini girin.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => sf("expenseDate", e.target.value)}
                  data-ocid="general-expense.input"
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
                      "Ofis",
                      "Ulaşım",
                      "Yemek",
                      "Temizlik",
                      "Güvenlik",
                      "Haberleşme",
                      "Kırtasiye",
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
                <Label>Açıklama *</Label>
                <Input
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
                />
              </div>
              <div>
                <Label>Tutar *</Label>
                <Input
                  value={form.amount}
                  onChange={(e) => sf("amount", e.target.value)}
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
                <Label>Ödeyen</Label>
                <Input
                  value={form.paidBy}
                  onChange={(e) => sf("paidBy", e.target.value)}
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Fatura No</Label>
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => sf("invoiceNumber", e.target.value)}
                />
              </div>
              <div>
                <Label>Ödeme Yöntemi</Label>
                <Select
                  value={form.paymentMethod}
                  onValueChange={(v) => sf("paymentMethod", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Nakit", "Kredi Kartı", "Banka Transferi", "Çek"].map(
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
                    {["Beklemede", "Onaylandı", "Reddedildi"].map((s) => (
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
                data-ocid="general-expense.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="general-expense.submit_button"
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
              <DialogTitle>Gideri Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.description} kaydını silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="general-expense.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="general-expense.confirm_button"
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
