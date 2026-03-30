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
import { Leaf, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddWasteDisposal,
  useDeleteWasteDisposal,
  useGetWasteDisposals,
  useUpdateWasteDisposal,
} from "../hooks/useQueries";
import type { WasteDisposalRecord } from "../types";

const complianceClass: Record<string, string> = {
  Uyumlu: "bg-green-100 text-green-800",
  Uyumsuz: "bg-red-100 text-red-800",
  Beklemede: "bg-yellow-100 text-yellow-800",
};

const statusClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-gray-100 text-gray-800",
};

const emptyForm = {
  disposalDate: "",
  wasteType: "",
  disposalMethod: "Düzenli Depolama",
  quantity: "",
  unit: "kg",
  vendor: "",
  regulatoryCode: "",
  cost: "",
  currency: "TRY",
  responsible: "",
  complianceStatus: "Beklemede",
  status: "Beklemede",
  notes: "",
};

export function WasteDisposalPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetWasteDisposals(companyId);
  const addMut = useAddWasteDisposal();
  const updateMut = useUpdateWasteDisposal();
  const deleteMut = useDeleteWasteDisposal();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WasteDisposalRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<WasteDisposalRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: WasteDisposalRecord) {
    setEditing(r);
    setForm({
      disposalDate: r.disposalDate,
      wasteType: r.wasteType,
      disposalMethod: r.disposalMethod,
      quantity: r.quantity,
      unit: r.unit,
      vendor: r.vendor,
      regulatoryCode: r.regulatoryCode,
      cost: r.cost,
      currency: r.currency,
      responsible: r.responsible,
      complianceStatus: r.complianceStatus,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.disposalDate || !form.wasteType) {
      toast.error("Tarih ve atık türü zorunludur.");
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

  async function handleDelete(r: WasteDisposalRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.wasteType.toLowerCase().includes(search.toLowerCase()) ||
      r.vendor.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const compliantCount = records.filter(
    (r) => r.complianceStatus === "Uyumlu",
  ).length;
  const pendingCount = records.filter((r) => r.status === "Beklemede").length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Atık Bertaraf Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Atık bertaraf kayıtları ve uyum durumu
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="waste-disposal.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kayıt Ekle
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
              label: "Toplam Kayıt",
              value: totalCount,
              color: "text-indigo-600",
            },
            { label: "Uyumlu", value: compliantCount, color: "text-green-600" },
            {
              label: "Beklemede",
              value: pendingCount,
              color: "text-yellow-600",
            },
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
              placeholder="Atık türü veya satıcı ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="waste-disposal.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="waste-disposal.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="waste-disposal.empty_state"
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
                      "Atık Türü",
                      "Bertaraf Yöntemi",
                      "Miktar",
                      "Satıcı",
                      "Maliyet",
                      "Uyum Durumu",
                      "Durum",
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
                      data-ocid={`waste-disposal.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.disposalDate}
                      </td>
                      <td className="px-4 py-3">{r.wasteType}</td>
                      <td className="px-4 py-3">{r.disposalMethod}</td>
                      <td className="px-4 py-3">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="px-4 py-3">{r.vendor}</td>
                      <td className="px-4 py-3">
                        {r.cost} {r.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${complianceClass[r.complianceStatus] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.complianceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`waste-disposal.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`waste-disposal.delete_button.${i + 1}`}
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
            data-ocid="waste-disposal.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Kayıt Düzenle" : "Atık Bertaraf Ekle"}
              </DialogTitle>
              <DialogDescription>
                Atık bertaraf bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Bertaraf Tarihi *</Label>
                <Input
                  type="date"
                  value={form.disposalDate}
                  onChange={(e) => sf("disposalDate", e.target.value)}
                  data-ocid="waste-disposal.input"
                />
              </div>
              <div>
                <Label>Atık Türü *</Label>
                <Input
                  value={form.wasteType}
                  onChange={(e) => sf("wasteType", e.target.value)}
                />
              </div>
              <div>
                <Label>Bertaraf Yöntemi</Label>
                <Select
                  value={form.disposalMethod}
                  onValueChange={(v) => sf("disposalMethod", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Düzenli Depolama",
                      "Yakma",
                      "Geri Dönüşüm",
                      "Kompostlama",
                      "Kimyasal Arıtma",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select value={form.unit} onValueChange={(v) => sf("unit", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["kg", "ton", "litre", "m3", "adet"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Satıcı / Firma</Label>
                <Input
                  value={form.vendor}
                  onChange={(e) => sf("vendor", e.target.value)}
                />
              </div>
              <div>
                <Label>Mevzuat Kodu</Label>
                <Input
                  value={form.regulatoryCode}
                  onChange={(e) => sf("regulatoryCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Maliyet</Label>
                <Input
                  value={form.cost}
                  onChange={(e) => sf("cost", e.target.value)}
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
                <Label>Sorumlu</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) => sf("responsible", e.target.value)}
                />
              </div>
              <div>
                <Label>Uyum Durumu</Label>
                <Select
                  value={form.complianceStatus}
                  onValueChange={(v) => sf("complianceStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Uyumlu", "Uyumsuz", "Beklemede"].map((s) => (
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
                    {["Beklemede", "Tamamlandı", "İptal"].map((s) => (
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
                data-ocid="waste-disposal.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="waste-disposal.submit_button"
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
                {deleteConfirm?.wasteType} - {deleteConfirm?.disposalDate}{" "}
                kaydını silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="waste-disposal.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="waste-disposal.confirm_button"
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
