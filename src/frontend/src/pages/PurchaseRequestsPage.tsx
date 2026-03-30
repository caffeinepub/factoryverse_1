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
import { Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddPurchaseRequest,
  useDeletePurchaseRequest,
  useGetPurchaseRequests,
  useUpdatePurchaseRequest,
} from "../hooks/useQueries";
import type { PurchaseRequest } from "../types";

const statusClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
  "Satın Alındı": "bg-blue-100 text-blue-800",
  "Teslim Edildi": "bg-indigo-100 text-indigo-800",
};

const categories = [
  "Hammadde",
  "Yedek Parça",
  "Ekipman",
  "Sarf Malzeme",
  "Hizmet",
  "Diğer",
];
const currencies = ["TRY", "USD", "EUR"];
const statuses = [
  "Beklemede",
  "Onaylandı",
  "Reddedildi",
  "Satın Alındı",
  "Teslim Edildi",
];

const emptyForm = {
  itemName: "",
  quantity: "",
  unit: "",
  estimatedCost: "",
  currency: "TRY",
  requestedBy: "",
  department: "",
  requestDate: "",
  neededByDate: "",
  supplier: "",
  category: "Sarf Malzeme",
  justification: "",
  status: "Beklemede",
  approvedBy: "",
  approvalDate: "",
  notes: "",
};

export function PurchaseRequestsPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetPurchaseRequests(companyId);
  const addMut = useAddPurchaseRequest();
  const updateMut = useUpdatePurchaseRequest();
  const deleteMut = useDeletePurchaseRequest();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseRequest | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<PurchaseRequest | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: PurchaseRequest) {
    setEditing(r);
    setForm({
      itemName: r.itemName,
      quantity: r.quantity,
      unit: r.unit,
      estimatedCost: r.estimatedCost,
      currency: r.currency,
      requestedBy: r.requestedBy,
      department: r.department,
      requestDate: r.requestDate,
      neededByDate: r.neededByDate,
      supplier: r.supplier,
      category: r.category,
      justification: r.justification,
      status: r.status,
      approvedBy: r.approvedBy,
      approvalDate: r.approvalDate,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId) return;
    if (!form.itemName) {
      toast.error("Ürün/Hizmet adı zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Talep güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Talep eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: PurchaseRequest) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Talep silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const totalCostTRY = records
    .filter((r) => r.currency === "TRY")
    .reduce((s, r) => s + (Number.parseFloat(r.estimatedCost) || 0), 0);
  const sf = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ShoppingCart className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Satın Alma Talep Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Satın alma talepleri ve onay akışı
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="purchase_requests.primary_button"
            >
              <Plus size={16} className="mr-1" /> Talep Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Toplam Talep", val: records.length, color: "indigo" },
            {
              label: "Bekleyen",
              val: records.filter((r) => r.status === "Beklemede").length,
              color: "yellow",
            },
            {
              label: "Onaylanan",
              val: records.filter((r) => r.status === "Onaylandı").length,
              color: "green",
            },
            {
              label: "Toplam Tutar (TRY)",
              val: `₺${totalCostTRY.toLocaleString("tr-TR")}`,
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
              data-ocid="purchase_requests.empty_state"
            >
              Henüz satın alma talebi yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ürün/Hizmet",
                      "Miktar",
                      "Tutar",
                      "Talep Eden",
                      "Departman",
                      "Kategori",
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
                      data-ocid={`purchase_requests.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.itemName}</td>
                      <td className="px-4 py-3">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="px-4 py-3">
                        {r.estimatedCost} {r.currency}
                      </td>
                      <td className="px-4 py-3">{r.requestedBy}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.category}</td>
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
                              data-ocid={`purchase_requests.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`purchase_requests.delete_button.${i + 1}`}
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Talep Düzenle" : "Talep Ekle"}
              </DialogTitle>
              <DialogDescription>
                Satın alma talebi bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ürün/Hizmet Adı *</Label>
                <Input
                  value={form.itemName}
                  onChange={(e) => sf("itemName", e.target.value)}
                />
              </div>
              <div>
                <Label>Miktar</Label>
                <Input
                  value={form.quantity}
                  onChange={(e) => sf("quantity", e.target.value)}
                />
              </div>
              <div>
                <Label>Birim</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => sf("unit", e.target.value)}
                  placeholder="Adet, kg, lt..."
                />
              </div>
              <div>
                <Label>Tahmini Tutar</Label>
                <Input
                  value={form.estimatedCost}
                  onChange={(e) => sf("estimatedCost", e.target.value)}
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
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Talep Eden</Label>
                <Input
                  value={form.requestedBy}
                  onChange={(e) => sf("requestedBy", e.target.value)}
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
                <Label>Talep Tarihi</Label>
                <Input
                  type="date"
                  value={form.requestDate}
                  onChange={(e) => sf("requestDate", e.target.value)}
                />
              </div>
              <div>
                <Label>İhtiyaç Tarihi</Label>
                <Input
                  type="date"
                  value={form.neededByDate}
                  onChange={(e) => sf("neededByDate", e.target.value)}
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
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => sf("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
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
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
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
                <Label>Onay Tarihi</Label>
                <Input
                  type="date"
                  value={form.approvalDate}
                  onChange={(e) => sf("approvalDate", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Gerekçe</Label>
                <Textarea
                  value={form.justification}
                  onChange={(e) => sf("justification", e.target.value)}
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
              <DialogTitle>Talep Sil</DialogTitle>
              <DialogDescription>
                "{deleteConfirm?.itemName}" talebini silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
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
