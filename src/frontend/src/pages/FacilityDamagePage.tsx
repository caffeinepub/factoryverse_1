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
import { Building2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddFacilityDamage,
  useDeleteFacilityDamage,
  useGetFacilityDamages,
  useUpdateFacilityDamage,
} from "../hooks/useQueries";
import type { FacilityDamageRecord } from "../types";

const severityClass: Record<string, string> = {
  Hafif: "bg-blue-100 text-blue-800",
  Orta: "bg-yellow-100 text-yellow-800",
  Ciddi: "bg-orange-100 text-orange-800",
  Kritik: "bg-red-100 text-red-800",
};

const repairClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Onarımda: "bg-blue-100 text-blue-800",
  Tamamlandı: "bg-green-100 text-green-800",
};

const emptyForm = {
  damageDate: "",
  location: "",
  damageType: "",
  severity: "Orta",
  description: "",
  reportedBy: "",
  estimatedCost: "",
  currency: "TRY",
  repairStatus: "Beklemede",
  completionDate: "",
  responsible: "",
  notes: "",
};

export function FacilityDamagePage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetFacilityDamages(companyId);
  const addMut = useAddFacilityDamage();
  const updateMut = useUpdateFacilityDamage();
  const deleteMut = useDeleteFacilityDamage();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FacilityDamageRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<FacilityDamageRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: FacilityDamageRecord) {
    setEditing(r);
    setForm({
      damageDate: r.damageDate,
      location: r.location,
      damageType: r.damageType,
      severity: r.severity,
      description: r.description,
      reportedBy: r.reportedBy,
      estimatedCost: r.estimatedCost,
      currency: r.currency,
      repairStatus: r.repairStatus,
      completionDate: r.completionDate,
      responsible: r.responsible,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.damageDate || !form.location) {
      toast.error("Tarih ve lokasyon zorunludur.");
      return;
    }
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...form });
      toast.success("Kayıt güncellendi.");
    } else {
      await addMut.mutateAsync({ companyId: companyId!, ...form });
      toast.success("Kayıt eklendi.");
    }
    setOpen(false);
  }

  async function handleDelete(r: FacilityDamageRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.location.toLowerCase().includes(search.toLowerCase()) ||
      r.damageType.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const pendingCount = records.filter(
    (r) => r.repairStatus === "Beklemede",
  ).length;
  const criticalCount = records.filter((r) => r.severity === "Kritik").length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tesis Hasar Kayıtları
              </h1>
              <p className="text-sm text-gray-500">
                Tesis hasar kayıtları ve onarım takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="facility-damage.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Hasar Ekle
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Toplam Hasar",
              value: totalCount,
              color: "text-indigo-600",
            },
            {
              label: "Beklemede",
              value: pendingCount,
              color: "text-yellow-600",
            },
            { label: "Kritik", value: criticalCount, color: "text-red-600" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border shadow-sm"
        >
          <div className="p-4 border-b flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <Input
              placeholder="Lokasyon veya hasar türü ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="facility-damage.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="facility-damage.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="facility-damage.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Tarih",
                      "Lokasyon",
                      "Hasar Türü",
                      "Şiddet",
                      "Tahmini Maliyet",
                      "Sorumlu",
                      "Onarım Durumu",
                      "",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50"
                      data-ocid={`facility-damage.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.damageDate}
                      </td>
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-4 py-3">{r.damageType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityClass[r.severity] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.estimatedCost} {r.currency}
                      </td>
                      <td className="px-4 py-3">{r.responsible}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${repairClass[r.repairStatus] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.repairStatus}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`facility-damage.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`facility-damage.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </Button>
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
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="facility-damage.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Hasar Düzenle" : "Hasar Ekle"}
              </DialogTitle>
              <DialogDescription>
                Tesis hasar bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Hasar Tarihi *</Label>
                <Input
                  type="date"
                  value={form.damageDate}
                  onChange={(e) => sf("damageDate", e.target.value)}
                  data-ocid="facility-damage.input"
                />
              </div>
              <div>
                <Label>Lokasyon *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                />
              </div>
              <div>
                <Label>Hasar Türü</Label>
                <Input
                  value={form.damageType}
                  onChange={(e) => sf("damageType", e.target.value)}
                />
              </div>
              <div>
                <Label>Şiddet</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => sf("severity", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Hafif", "Orta", "Ciddi", "Kritik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Bildiren</Label>
                <Input
                  value={form.reportedBy}
                  onChange={(e) => sf("reportedBy", e.target.value)}
                />
              </div>
              <div>
                <Label>Tahmini Maliyet</Label>
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
                    {["TRY", "USD", "EUR"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Onarım Durumu</Label>
                <Select
                  value={form.repairStatus}
                  onValueChange={(v) => sf("repairStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beklemede", "Onarımda", "Tamamlandı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tamamlanma Tarihi</Label>
                <Input
                  type="date"
                  value={form.completionDate}
                  onChange={(e) => sf("completionDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) => sf("responsible", e.target.value)}
                />
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
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="facility-damage.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="facility-damage.submit_button"
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
              <DialogTitle>Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.location} - {deleteConfirm?.damageDate} kaydını
                silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="facility-damage.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="facility-damage.confirm_button"
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
