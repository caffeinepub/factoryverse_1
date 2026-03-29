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
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { useGetBudgetItems } from "../hooks/useQueries";
import type { BudgetItem } from "../types";

const categoryOptions = ["Makine", "İşçilik", "Nakliye", "Altyapı", "Diğer"];

const emptyForm = {
  name: "",
  category: "Makine",
  itemType: "expense",
  plannedAmount: "",
  actualAmount: "",
  projectId: "",
  date: "",
  notes: "",
};

function formatAmount(amount: number) {
  return `${amount.toLocaleString("tr-TR")} ₺`;
}

export function BudgetPage() {
  const { session } = useAuth();
  const { actor } = useActor();
  const qc = useQueryClient();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = session?.userType === "admin" ? session.userCode : "";

  const { data: items = [], isLoading } = useGetBudgetItems(userCode);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalIncome = items
    .filter((i) => i.itemType === "income")
    .reduce((s, i) => s + Number(i.plannedAmount), 0);
  const totalExpense = items
    .filter((i) => i.itemType === "expense")
    .reduce((s, i) => s + Number(i.plannedAmount), 0);
  const netBudget = totalIncome - totalExpense;

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: BudgetItem) => {
    setEditTarget(item);
    setForm({
      name: item.name,
      category: item.category,
      itemType: item.itemType,
      plannedAmount: String(item.plannedAmount),
      actualAmount: String(item.actualAmount),
      projectId: item.projectId,
      date: item.date,
      notes: item.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!actor || !adminCode) return;
    if (!form.name.trim() || !form.date) {
      toast.error("Ad ve tarih zorunludur");
      return;
    }
    setSaving(true);
    try {
      const planned = Number.parseFloat(form.plannedAmount) || 0;
      const actual = Number.parseFloat(form.actualAmount) || 0;
      if (editTarget) {
        await (actor as any).updateBudgetItem(
          adminCode,
          editTarget.id,
          form.name,
          form.category,
          form.itemType,
          planned,
          actual,
          form.projectId,
          form.date,
          form.notes,
          editTarget.status,
        );
        toast.success("Kalem güncellendi");
      } else {
        await (actor as any).addBudgetItem(
          adminCode,
          form.name,
          form.category,
          form.itemType,
          planned,
          actual,
          form.projectId,
          form.date,
          form.notes,
        );
        toast.success("Kalem eklendi");
      }
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDialogOpen(false);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !adminCode || !deleteId) return;
    setDeleting(true);
    try {
      await (actor as any).deleteBudgetItem(adminCode, deleteId);
      toast.success("Kalem silindi");
      qc.invalidateQueries({ queryKey: ["budget"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppLayout title="Bütçe Takibi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Bütçe Takibi
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Proje gelir ve gider kalemlerini takip edin
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} data-ocid="budget.open_modal_button">
              <Plus size={16} className="mr-1.5" />
              Kalem Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <ArrowUpCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toplam Gelir</p>
              <p className="font-bold text-foreground text-lg leading-tight">
                {formatAmount(totalIncome)}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <ArrowDownCircle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Toplam Gider</p>
              <p className="font-bold text-foreground text-lg leading-tight">
                {formatAmount(totalExpense)}
              </p>
            </div>
          </div>
          <div
            className={`bg-card rounded-xl border p-4 flex items-center gap-3 ${netBudget >= 0 ? "border-green-200" : "border-red-200"}`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${netBudget >= 0 ? "bg-emerald-100" : "bg-red-100"}`}
            >
              <Wallet
                size={20}
                className={netBudget >= 0 ? "text-emerald-600" : "text-red-600"}
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Bütçe</p>
              <p
                className={`font-bold text-lg leading-tight ${netBudget >= 0 ? "text-emerald-700" : "text-red-700"}`}
              >
                {formatAmount(netBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-16"
            data-ocid="budget.loading_state"
          >
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : items.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-card"
            data-ocid="budget.empty_state"
          >
            <TrendingUp size={40} className="text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              Henüz bütçe kalemi yok
            </p>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={openAdd}
              >
                İlk Kalemi Ekle
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Ad
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tür
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Planlanan
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      Gerçekleşen
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Tarih
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Notlar
                    </th>
                    {isAdmin && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`budget.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.category}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            item.itemType === "income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.itemType === "income" ? "Gelir" : "Gider"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-foreground">
                        {formatAmount(Number(item.plannedAmount))}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {formatAmount(Number(item.actualAmount))}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.date}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                        {item.notes}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="text-muted-foreground hover:text-primary transition-colors"
                              data-ocid={`budget.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(item.id)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                              data-ocid={`budget.delete_button.${idx + 1}`}
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

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 space-y-1.5"
                  data-ocid={`budget.item.${idx + 1}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">
                      {item.name}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.itemType === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.itemType === "income" ? "Gelir" : "Gider"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {formatAmount(Number(item.plannedAmount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.category} · {item.date}
                  </p>
                  {isAdmin && (
                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => openEdit(item)}
                        className="text-xs text-primary flex items-center gap-1"
                        data-ocid={`budget.edit_button.${idx + 1}`}
                      >
                        <Pencil size={13} /> Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(item.id)}
                        className="text-xs text-destructive flex items-center gap-1"
                        data-ocid={`budget.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={13} /> Sil
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="budget.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Kalemi Düzenle" : "Yeni Kalem Ekle"}
            </DialogTitle>
            <DialogDescription>
              Bütçe kalemi bilgilerini doldurun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="budget-name">Ad *</Label>
              <Input
                id="budget-name"
                placeholder="Kalem adı"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                data-ocid="budget.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger data-ocid="budget.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Tür</Label>
                <Select
                  value={form.itemType}
                  onValueChange={(v) => setForm((p) => ({ ...p, itemType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Gelir</SelectItem>
                    <SelectItem value="expense">Gider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="budget-planned">Planlanan Tutar (₺)</Label>
                <Input
                  id="budget-planned"
                  type="number"
                  placeholder="0"
                  value={form.plannedAmount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, plannedAmount: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget-actual">Gerçekleşen Tutar (₺)</Label>
                <Input
                  id="budget-actual"
                  type="number"
                  placeholder="0"
                  value={form.actualAmount}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, actualAmount: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="budget-date">Tarih *</Label>
                <Input
                  id="budget-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget-project">Proje ID (opsiyonel)</Label>
                <Input
                  id="budget-project"
                  placeholder="Proje referansı"
                  value={form.projectId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, projectId: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget-notes">Notlar</Label>
              <Textarea
                id="budget-notes"
                placeholder="Ek notlar..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
                data-ocid="budget.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="budget.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-ocid="budget.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent data-ocid="budget.modal">
          <DialogHeader>
            <DialogTitle>Kalemi Sil</DialogTitle>
            <DialogDescription>
              Bu bütçe kalemi kalıcı olarak silinecek. Devam etmek istiyor
              musunuz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="budget.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              data-ocid="budget.confirm_button"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
