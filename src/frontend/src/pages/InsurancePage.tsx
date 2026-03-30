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
  useAddInsurancePolicy,
  useDeleteInsurancePolicy,
  useGetInsurancePolicies,
  useUpdateInsurancePolicy,
} from "../hooks/useQueries";
import type { InsurancePolicy } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Süresi Doldu": "bg-red-100 text-red-800",
  İptal: "bg-gray-100 text-gray-700",
  "Yenileme Bekliyor": "bg-orange-100 text-orange-800",
};

const emptyForm = {
  policyName: "",
  policyNumber: "",
  insuranceCompany: "",
  insuranceType: "İşyeri Sigortası",
  coverageAmount: "",
  currency: "TRY",
  premium: "",
  startDate: "",
  endDate: "",
  contactPerson: "",
  description: "",
  status: "Aktif",
  notes: "",
};

export function InsurancePage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetInsurancePolicies(companyId);
  const addMut = useAddInsurancePolicy();
  const updateMut = useUpdateInsurancePolicy();
  const deleteMut = useDeleteInsurancePolicy();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InsurancePolicy | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<InsurancePolicy | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: InsurancePolicy) {
    setEditing(r);
    setForm({
      policyName: r.policyName,
      policyNumber: r.policyNumber,
      insuranceCompany: r.insuranceCompany,
      insuranceType: r.insuranceType,
      coverageAmount: r.coverageAmount,
      currency: r.currency,
      premium: r.premium,
      startDate: r.startDate,
      endDate: r.endDate,
      contactPerson: r.contactPerson,
      description: r.description,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.policyName) {
      toast.error("Poliçe adı zorunludur.");
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

  async function handleDelete(r: InsurancePolicy) {
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
    if (!r.endDate) return false;
    const diff =
      (new Date(r.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="text-blue-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Sigorta Poliçe Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Şirket sigorta poliçeleri ve yenileme takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Poliçe Ekle
            </Button>
          )}
        </div>

        {expiringSoon > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {expiringSoon} poliçenin son tarihi 30 gün içinde doluyor!
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Poliçe", val: records.length, color: "indigo" },
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
              Henüz poliçe kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Poliçe Adı",
                      "Poliçe No",
                      "Sigorta Şirketi",
                      "Tür",
                      "Teminat",
                      "Prim",
                      "Bitiş Tarihi",
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
                    const daysLeft = r.endDate
                      ? Math.ceil(
                          (new Date(r.endDate).getTime() - today.getTime()) /
                            (1000 * 60 * 60 * 24),
                        )
                      : null;
                    const expiryColor =
                      daysLeft !== null && daysLeft <= 0
                        ? "text-red-600"
                        : daysLeft !== null && daysLeft <= 30
                          ? "text-orange-600"
                          : "text-gray-700";
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {r.policyName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {r.policyNumber}
                        </td>
                        <td className="px-4 py-3">{r.insuranceCompany}</td>
                        <td className="px-4 py-3">{r.insuranceType}</td>
                        <td className="px-4 py-3">
                          {Number(r.coverageAmount).toLocaleString("tr-TR")}{" "}
                          {r.currency}
                        </td>
                        <td className="px-4 py-3">
                          {Number(r.premium).toLocaleString("tr-TR")}{" "}
                          {r.currency}
                        </td>
                        <td className={`px-4 py-3 font-medium ${expiryColor}`}>
                          {r.endDate}
                          {daysLeft !== null &&
                            daysLeft <= 30 &&
                            daysLeft > 0 && (
                              <span className="ml-1 text-xs">
                                ({daysLeft}g)
                              </span>
                            )}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Poliçe Düzenle" : "Poliçe Ekle"}
              </DialogTitle>
              <DialogDescription>
                Sigorta poliçesi bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Poliçe Adı *</Label>
                <Input
                  value={form.policyName}
                  onChange={(e) => sf("policyName", e.target.value)}
                />
              </div>
              <div>
                <Label>Poliçe Numarası</Label>
                <Input
                  value={form.policyNumber}
                  onChange={(e) => sf("policyNumber", e.target.value)}
                />
              </div>
              <div>
                <Label>Sigorta Şirketi</Label>
                <Input
                  value={form.insuranceCompany}
                  onChange={(e) => sf("insuranceCompany", e.target.value)}
                />
              </div>
              <div>
                <Label>Sigorta Türü</Label>
                <Select
                  value={form.insuranceType}
                  onValueChange={(v) => sf("insuranceType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "İşyeri Sigortası",
                      "Makine Sigortası",
                      "Sorumluluk Sigortası",
                      "İş Kazası Sigortası",
                      "Araç Sigortası",
                      "Sağlık Sigortası",
                      "Yangın Sigortası",
                      "Diğer",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Teminat Tutarı</Label>
                <Input
                  value={form.coverageAmount}
                  onChange={(e) => sf("coverageAmount", e.target.value)}
                />
              </div>
              <div>
                <Label>Yıllık Prim</Label>
                <Input
                  value={form.premium}
                  onChange={(e) => sf("premium", e.target.value)}
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
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => sf("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => sf("endDate", e.target.value)}
                />
              </div>
              <div>
                <Label>İletişim Kişisi</Label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => sf("contactPerson", e.target.value)}
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
                    {[
                      "Aktif",
                      "Süresi Doldu",
                      "İptal",
                      "Yenileme Bekliyor",
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
                <Textarea
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
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
              <DialogTitle>Poliçe Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.policyName} poliçesini silmek istediğinizden
                emin misiniz?
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
