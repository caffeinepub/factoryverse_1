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
import { AlertTriangle, Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddLeaseRecord,
  useDeleteLeaseRecord,
  useGetLeaseRecords,
  useUpdateLeaseRecord,
} from "../hooks/useQueries";
import type { LeaseRecord } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Sona Erdi": "bg-red-100 text-red-800",
  "Yenileme Bekliyor": "bg-yellow-100 text-yellow-800",
  İptal: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  propertyName: "",
  propertyType: "Fabrika",
  landlord: "",
  landlordContact: "",
  address: "",
  leaseStartDate: "",
  leaseEndDate: "",
  monthlyRent: "",
  currency: "TRY",
  depositAmount: "",
  paymentDueDay: "",
  status: "Aktif",
  notes: "",
};

export function LeaseManagementPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetLeaseRecords(companyId);
  const addMut = useAddLeaseRecord();
  const updateMut = useUpdateLeaseRecord();
  const deleteMut = useDeleteLeaseRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LeaseRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<LeaseRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: LeaseRecord) {
    setEditing(r);
    setForm({
      propertyName: r.propertyName,
      propertyType: r.propertyType,
      landlord: r.landlord,
      landlordContact: r.landlordContact,
      address: r.address,
      leaseStartDate: r.leaseStartDate,
      leaseEndDate: r.leaseEndDate,
      monthlyRent: r.monthlyRent,
      currency: r.currency,
      depositAmount: r.depositAmount,
      paymentDueDay: r.paymentDueDay,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.propertyName) {
      toast.error("Mülk adı zorunludur.");
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

  async function handleDelete(r: LeaseRecord) {
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
    if (!r.leaseEndDate) return false;
    const diff =
      (new Date(r.leaseEndDate).getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  function endDateColor(d: string) {
    if (!d) return "text-gray-700";
    const diff =
      (new Date(d).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff <= 0) return "text-red-600 font-medium";
    if (diff <= 30) return "text-orange-600 font-medium";
    return "text-gray-700";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="text-blue-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Kira Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Mülk kira sözleşmeleri ve ödeme takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Kira Ekle
            </Button>
          )}
        </div>

        {expiringSoon > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {expiringSoon} kira sözleşmesinin süresi 30 gün içinde doluyor!
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Sözleşme", val: records.length, color: "indigo" },
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
            <div className="p-8 text-center text-gray-400">
              Henüz kira kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Mülk Adı",
                      "Tür",
                      "Kiraya Veren",
                      "Aylık Kira",
                      "Kira Bitiş",
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
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.propertyName}
                      </td>
                      <td className="px-4 py-3">{r.propertyType}</td>
                      <td className="px-4 py-3">{r.landlord}</td>
                      <td className="px-4 py-3">
                        {r.monthlyRent} {r.currency}
                      </td>
                      <td
                        className={`px-4 py-3 ${endDateColor(r.leaseEndDate)}`}
                      >
                        {r.leaseEndDate}
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
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
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
                {editing ? "Kira Düzenle" : "Kira Ekle"}
              </DialogTitle>
              <DialogDescription>
                Kira sözleşmesi bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Mülk Adı *</Label>
                <Input
                  value={form.propertyName}
                  onChange={(e) => sf("propertyName", e.target.value)}
                />
              </div>
              <div>
                <Label>Mülk Türü</Label>
                <Select
                  value={form.propertyType}
                  onValueChange={(v) => sf("propertyType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Fabrika", "Depo", "Ofis", "Arazi", "Diğer"].map((t) => (
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
                    {["Aktif", "Sona Erdi", "Yenileme Bekliyor", "İptal"].map(
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
                <Label>Kiraya Veren</Label>
                <Input
                  value={form.landlord}
                  onChange={(e) => sf("landlord", e.target.value)}
                />
              </div>
              <div>
                <Label>İletişim</Label>
                <Input
                  value={form.landlordContact}
                  onChange={(e) => sf("landlordContact", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Adres</Label>
                <Input
                  value={form.address}
                  onChange={(e) => sf("address", e.target.value)}
                />
              </div>
              <div>
                <Label>Kira Başlangıç</Label>
                <Input
                  type="date"
                  value={form.leaseStartDate}
                  onChange={(e) => sf("leaseStartDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Kira Bitiş</Label>
                <Input
                  type="date"
                  value={form.leaseEndDate}
                  onChange={(e) => sf("leaseEndDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Aylık Kira</Label>
                <Input
                  value={form.monthlyRent}
                  onChange={(e) => sf("monthlyRent", e.target.value)}
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
              <div>
                <Label>Depozito</Label>
                <Input
                  value={form.depositAmount}
                  onChange={(e) => sf("depositAmount", e.target.value)}
                />
              </div>
              <div>
                <Label>Ödeme Günü</Label>
                <Input
                  value={form.paymentDueDay}
                  placeholder="Örn: 5"
                  onChange={(e) => sf("paymentDueDay", e.target.value)}
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
              <DialogTitle>Kira Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.propertyName} kaydını silmek istediğinizden emin
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
