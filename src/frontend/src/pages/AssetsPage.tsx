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
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddAsset,
  useDeleteAsset,
  useGetAssets,
  useUpdateAsset,
} from "../hooks/useQueries";
import type { Asset } from "../types";

const categoryLabels: Record<string, string> = {
  machinery: "Makine/Ekipman",
  vehicle: "Araç/Vasıta",
  furniture: "Mobilya/Demirbaş",
  it: "BT Ekipmanı",
  tool: "Alet/Takım",
  other: "Diğer",
};

const conditionLabels: Record<string, string> = {
  good: "İyi",
  fair: "Orta",
  poor: "Kötü",
};

const conditionClass: Record<string, string> = {
  good: "bg-green-100 text-green-800",
  fair: "bg-yellow-100 text-yellow-800",
  poor: "bg-red-100 text-red-800",
};

const empty = {
  name: "",
  category: "machinery",
  serialNumber: "",
  location: "",
  condition: "good",
  purchaseDate: "",
  purchaseValue: "",
  currentValue: "",
  responsible: "",
  notes: "",
};

function fmt(val: string) {
  const n = Number.parseFloat(val);
  if (Number.isNaN(n)) return "₺0";
  return `₺${n.toLocaleString("tr-TR")}`;
}

export function AssetsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: assets = [], isLoading } = useGetAssets(userCode);
  const addAsset = useAddAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const [filterCategory, setFilterCategory] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<Asset | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = assets.filter((a) => {
    if (filterCategory !== "all" && a.category !== filterCategory) return false;
    if (filterCondition !== "all" && a.condition !== filterCondition)
      return false;
    return true;
  });

  const totalPurchaseValue = assets.reduce((sum, a) => {
    const n = Number.parseFloat(a.purchaseValue);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);
  const poorCount = assets.filter((a) => a.condition === "poor").length;

  function openAdd() {
    setEditItem(null);
    setForm({ ...empty });
    setShowDialog(true);
  }

  function openEdit(a: Asset) {
    setEditItem(a);
    setForm({
      name: a.name,
      category: a.category,
      serialNumber: a.serialNumber,
      location: a.location,
      condition: a.condition,
      purchaseDate: a.purchaseDate,
      purchaseValue: a.purchaseValue,
      currentValue: a.currentValue,
      responsible: a.responsible,
      notes: a.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      toast.error("Ad gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateAsset.mutateAsync({
          adminCode,
          assetId: editItem.id,
          ...form,
        });
        toast.success("Kıymet güncellendi");
      } else {
        await addAsset.mutateAsync({ adminCode, ...form });
        toast.success("Kıymet eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAsset.mutateAsync({ adminCode, assetId: deleteTarget });
      toast.success("Kıymet silindi");
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
            <div className="p-2 rounded-lg bg-indigo-100">
              <Building2 className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Sabit Kıymet Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Şirket varlıklarını takip edin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="assets.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kıymet Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Kıymet",
              value: assets.length,
              color: "text-indigo-600",
            },
            {
              label: "Toplam Satın Alma Değeri",
              value: `₺${totalPurchaseValue.toLocaleString("tr-TR")}`,
              color: "text-green-600",
            },
            { label: "Kötü Durumda", value: poorCount, color: "text-red-600" },
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

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44" data-ocid="assets.select">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {Object.entries(categoryLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCondition} onValueChange={setFilterCondition}>
            <SelectTrigger className="w-40" data-ocid="assets.select">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(conditionLabels).map(([k, v]) => (
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
              data-ocid="assets.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="assets.empty_state"
            >
              Kayıt bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Ad",
                    "Kategori",
                    "Seri No",
                    "Konum",
                    "Durum",
                    "Satın Alma",
                    "Güncel Değer",
                    "Sorumlu",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a, idx) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-ocid={`assets.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {a.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {categoryLabels[a.category] ?? a.category}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {a.serialNumber || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.location}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${conditionClass[a.condition] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {conditionLabels[a.condition] ?? a.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {fmt(a.purchaseValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {fmt(a.currentValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.responsible}</td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(a)}
                            data-ocid={`assets.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(a.id)}
                            data-ocid={`assets.delete_button.${idx + 1}`}
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
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          aria-describedby="assets-dialog-desc"
          data-ocid="assets.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kıymet Düzenle" : "Yeni Kıymet Ekle"}
            </DialogTitle>
            <DialogDescription id="assets-dialog-desc">
              Sabit kıymet bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Ad *</Label>
              <Input
                value={form.name}
                onChange={(e) => f("name", e.target.value)}
                data-ocid="assets.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => f("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={form.condition}
                onValueChange={(v) => f("condition", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(conditionLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Seri No</Label>
              <Input
                value={form.serialNumber}
                onChange={(e) => f("serialNumber", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Konum</Label>
              <Input
                value={form.location}
                onChange={(e) => f("location", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Satın Alma Tarihi</Label>
              <Input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => f("purchaseDate", e.target.value)}
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
              <Label>Satın Alma Değeri (₺)</Label>
              <Input
                type="number"
                value={form.purchaseValue}
                onChange={(e) => f("purchaseValue", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Güncel Değer (₺)</Label>
              <Input
                type="number"
                value={form.currentValue}
                onChange={(e) => f("currentValue", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={3}
                data-ocid="assets.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="assets.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addAsset.isPending || updateAsset.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="assets.submit_button"
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
          aria-describedby="assets-del-desc"
          data-ocid="assets.modal"
        >
          <DialogHeader>
            <DialogTitle>Kıymeti Sil</DialogTitle>
            <DialogDescription id="assets-del-desc">
              Bu kıymeti silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="assets.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAsset.isPending}
              data-ocid="assets.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
