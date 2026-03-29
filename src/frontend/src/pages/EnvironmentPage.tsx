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
import { Leaf, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddWasteRecord,
  useDeleteWasteRecord,
  useGetWasteRecords,
  useUpdateWasteRecord,
} from "../hooks/useQueries";
import type { WasteRecord } from "../types";

const wasteTypeLabels: Record<string, string> = {
  solid: "Katı Atık",
  liquid: "Sıvı Atık",
  hazardous: "Tehlikeli Atık",
  recyclable: "Geri Dönüşüm",
  other: "Diğer",
};

const wasteTypeClass: Record<string, string> = {
  solid: "bg-gray-100 text-gray-700",
  liquid: "bg-blue-100 text-blue-800",
  hazardous: "bg-red-100 text-red-800",
  recyclable: "bg-green-100 text-green-800",
  other: "bg-gray-100 text-gray-600",
};

const complianceLabels: Record<string, string> = {
  compliant: "Uyumlu",
  review: "İncelemede",
  noncompliant: "Uyumsuz",
};

const complianceClass: Record<string, string> = {
  compliant: "bg-green-100 text-green-800",
  review: "bg-yellow-100 text-yellow-800",
  noncompliant: "bg-red-100 text-red-800",
};

const disposalLabels: Record<string, string> = {
  landfill: "Düzenli Depolama",
  incineration: "Yakma",
  recycling: "Geri Dönüşüm",
  treatment: "Arıtma",
  other: "Diğer",
};

const emptyForm = {
  wasteType: "solid",
  description: "",
  quantity: "",
  unit: "kg",
  disposalMethod: "landfill",
  disposalDate: "",
  responsible: "",
  cost: "",
  complianceStatus: "compliant",
  notes: "",
};

export function EnvironmentPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetWasteRecords(userCode);
  const addRecord = useAddWasteRecord();
  const updateRecord = useUpdateWasteRecord();
  const deleteRecord = useDeleteWasteRecord();

  const [filterType, setFilterType] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<WasteRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = records.filter((r) =>
    filterType === "all" ? true : r.wasteType === filterType,
  );

  const compliantCount = records.filter(
    (r) => r.complianceStatus === "compliant",
  ).length;

  const totalCost = records.reduce((sum, r) => {
    const n = Number.parseFloat(r.cost);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: WasteRecord) {
    setEditItem(r);
    setForm({
      wasteType: r.wasteType,
      description: r.description,
      quantity: r.quantity,
      unit: r.unit,
      disposalMethod: r.disposalMethod,
      disposalDate: r.disposalDate,
      responsible: r.responsible,
      cost: r.cost,
      complianceStatus: r.complianceStatus,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.description.trim() || !form.quantity.trim()) {
      toast.error("Açıklama ve miktar gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Kayıt güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Kayıt eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Kayıt silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız");
    }
  }

  const f = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Leaf className="text-green-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Çevre & Atık Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Atık ve çevre kayıtlarını takip edin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="environment.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kayıt Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Kayıt",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Uyumlu Kayıt",
              value: compliantCount,
              color: "text-green-600",
            },
            {
              label: "Toplam Bertaraf Maliyeti",
              value: `₺${totalCost.toLocaleString("tr-TR")}`,
              color: "text-teal-600",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44" data-ocid="environment.select">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              {Object.entries(wasteTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="environment.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="environment.empty_state"
            >
              Kayıt bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Atık Türü",
                    "Açıklama",
                    "Miktar",
                    "Bertaraf Yöntemi",
                    "Bertaraf Tarihi",
                    "Uyum Durumu",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-ocid={`environment.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          wasteTypeClass[r.wasteType] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {wasteTypeLabels[r.wasteType] ?? r.wasteType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                      {r.description}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.quantity} {r.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {disposalLabels[r.disposalMethod] ?? r.disposalMethod}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.disposalDate || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          complianceClass[r.complianceStatus] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {complianceLabels[r.complianceStatus] ??
                          r.complianceStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            data-ocid={`environment.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`environment.delete_button.${idx + 1}`}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="env-dialog-desc"
          data-ocid="environment.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kayıt Düzenle" : "Yeni Atık Kaydı"}
            </DialogTitle>
            <DialogDescription id="env-dialog-desc">
              Atık ve çevre bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Atık Türü</Label>
              <Select
                value={form.wasteType}
                onValueChange={(v) => f("wasteType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(wasteTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Uyum Durumu</Label>
              <Select
                value={form.complianceStatus}
                onValueChange={(v) => f("complianceStatus", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compliant">Uyumlu</SelectItem>
                  <SelectItem value="review">İncelemede</SelectItem>
                  <SelectItem value="noncompliant">Uyumsuz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Açıklama *</Label>
              <Input
                value={form.description}
                onChange={(e) => f("description", e.target.value)}
                placeholder="Atık açıklaması"
                data-ocid="environment.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Miktar *</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => f("quantity", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Select value={form.unit} onValueChange={(v) => f("unit", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["kg", "ton", "litre", "m3", "adet"].map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Bertaraf Yöntemi</Label>
              <Select
                value={form.disposalMethod}
                onValueChange={(v) => f("disposalMethod", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(disposalLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Bertaraf Tarihi</Label>
              <Input
                type="date"
                value={form.disposalDate}
                onChange={(e) => f("disposalDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sorumlu</Label>
              <Input
                value={form.responsible}
                onChange={(e) => f("responsible", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Maliyet (₺)</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) => f("cost", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="environment.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="environment.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="environment.submit_button"
            >
              {editItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          aria-describedby="env-del-desc"
          data-ocid="environment.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="env-del-desc">
              Bu atık kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="environment.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="environment.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
