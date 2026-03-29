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
import { AlertTriangle, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMoldRecord,
  useDeleteMoldRecord,
  useGetMoldRecords,
  useUpdateMoldRecord,
} from "../hooks/useQueries";
import type { MoldRecord } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Bakımda: "bg-yellow-100 text-yellow-800",
  "Kullanım Dışı": "bg-red-100 text-red-800",
  "Limit Doldu": "bg-orange-100 text-orange-800",
};

const categoryList = [
  "Enjeksiyon",
  "Sıkıştırma",
  "Baskı",
  "Döküm",
  "Aparat",
  "Fikstür",
  "Diğer",
];
const materialList = [
  "Çelik",
  "Alüminyum",
  "Bakır",
  "Plastik",
  "Kompozit",
  "Diğer",
];

const emptyForm = {
  moldName: "",
  moldCode: "",
  category: "",
  material: "",
  location: "",
  usageCount: "0",
  maxUsageCount: "",
  lastMaintenanceDate: "",
  nextMaintenanceDate: "",
  status: "Aktif",
  notes: "",
};

export function MoldsPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetMoldRecords(userCode);
  const addRecord = useAddMoldRecord();
  const updateRecord = useUpdateMoldRecord();
  const deleteRecord = useDeleteMoldRecord();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<MoldRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(r: MoldRecord) {
    setEditing(r);
    setForm({
      moldName: r.moldName,
      moldCode: r.moldCode,
      category: r.category,
      material: r.material,
      location: r.location,
      usageCount: r.usageCount,
      maxUsageCount: r.maxUsageCount,
      lastMaintenanceDate: r.lastMaintenanceDate,
      nextMaintenanceDate: r.nextMaintenanceDate,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.moldName || !form.moldCode) {
      toast.error("Kalıp adı ve kodu zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editing.id,
          ...form,
        });
        toast.success("Kayıt güncellendi.");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Kalıp eklendi.");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: id });
      toast.success("Kayıt silindi.");
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const isNearLimit = (r: MoldRecord) => {
    const usage = Number.parseInt(r.usageCount) || 0;
    const max = Number.parseInt(r.maxUsageCount) || 0;
    return max > 0 && usage / max >= 0.9;
  };

  const nearLimitCount = records.filter(isNearLimit).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              Kalıp & Aparat Takibi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kalıp ve aparat envanteri, kullanım sayısı ve bakım planlaması
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} className="flex items-center gap-2">
              <Plus size={16} /> Kalıp Ekle
            </Button>
          )}
        </div>

        {nearLimitCount > 0 && (
          <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {nearLimitCount} kalıp kullanım limitine yaklaştı (%90+).
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Toplam Kalıp</p>
            <p className="text-2xl font-bold text-indigo-600">
              {records.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Aktif</p>
            <p className="text-2xl font-bold text-green-600">
              {records.filter((r) => r.status === "Aktif").length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Bakımda / Kullanım Dışı</p>
            <p className="text-2xl font-bold text-yellow-600">
              {records.filter((r) => r.status !== "Aktif").length}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Layers size={40} className="mx-auto mb-3 opacity-40" />
            <p>Henüz kalıp kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Kalıp Adı
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Kod
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Kullanım
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Konum
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Son Bakım
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Durum
                    </th>
                    {isAdmin && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`hover:bg-gray-50 ${isNearLimit(r) ? "bg-orange-50" : ""}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.moldName}</td>
                      <td className="px-4 py-3 text-gray-500">{r.moldCode}</td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            isNearLimit(r)
                              ? "text-orange-600 font-semibold"
                              : ""
                          }
                        >
                          {r.usageCount}
                          {r.maxUsageCount ? ` / ${r.maxUsageCount}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-4 py-3">
                        {r.lastMaintenanceDate || "-"}
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
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Kalıp Güncelle" : "Yeni Kalıp Ekle"}
            </DialogTitle>
            <DialogDescription>
              Kalıp & aparat bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Kalıp Adı *</Label>
              <Input
                value={form.moldName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, moldName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Kalıp Kodu *</Label>
              <Input
                value={form.moldCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, moldCode: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categoryList.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Malzeme</Label>
              <Select
                value={form.material}
                onValueChange={(v) => setForm((f) => ({ ...f, material: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {materialList.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Konum</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Mevcut Kullanım Sayısı</Label>
              <Input
                type="number"
                value={form.usageCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, usageCount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Maksimum Kullanım Sayısı</Label>
              <Input
                type="number"
                value={form.maxUsageCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxUsageCount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusClass).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Son Bakım Tarihi</Label>
              <Input
                type="date"
                value={form.lastMaintenanceDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    lastMaintenanceDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Sonraki Bakım Tarihi</Label>
              <Input
                type="date"
                value={form.nextMaintenanceDate}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    nextMaintenanceDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSave}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
