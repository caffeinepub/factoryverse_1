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
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddStockCountRecord,
  useDeleteStockCountRecord,
  useGetStockCountRecords,
  useUpdateStockCountRecord,
} from "../hooks/useQueries";
import type { StockCountRecord } from "../types";

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Beklemede: "bg-yellow-100 text-yellow-800",
  İptal: "bg-gray-100 text-gray-600",
};

const categoryList = [
  "Ham Madde",
  "Yarı Mamul",
  "Bitmiş Ürün",
  "Yedek Parça",
  "Sarf Malzeme",
  "Diğer",
];
const unitList = ["Adet", "Kg", "Lt", "m", "m²", "m³", "Kutu", "Paket"];

const emptyForm = {
  itemName: "",
  itemCode: "",
  category: "",
  location: "",
  expectedQty: "",
  actualQty: "",
  unit: "Adet",
  countDate: "",
  countedBy: "",
  status: "Tamamlandı",
  notes: "",
};

function getDiff(
  expected: string,
  actual: string,
): { value: number; label: string; cls: string } {
  const e = Number.parseFloat(expected) || 0;
  const a = Number.parseFloat(actual) || 0;
  const diff = a - e;
  if (diff === 0)
    return { value: 0, label: "Eşleşiyor", cls: "text-green-600" };
  if (diff > 0) return { value: diff, label: `+${diff}`, cls: "text-blue-600" };
  return { value: diff, label: `${diff}`, cls: "text-red-600" };
}

export function StockCountPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetStockCountRecords(userCode);
  const addRecord = useAddStockCountRecord();
  const updateRecord = useUpdateStockCountRecord();
  const deleteRecord = useDeleteStockCountRecord();

  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<StockCountRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowDialog(true);
  }

  function openEdit(r: StockCountRecord) {
    setEditing(r);
    setForm({
      itemName: r.itemName,
      itemCode: r.itemCode,
      category: r.category,
      location: r.location,
      expectedQty: r.expectedQty,
      actualQty: r.actualQty,
      unit: r.unit,
      countDate: r.countDate,
      countedBy: r.countedBy,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!form.itemName) {
      toast.error("Ürün adı zorunludur.");
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
        toast.success("Sayım kaydı eklendi.");
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

  const diffRecords = records.filter((r) => {
    const e = Number.parseFloat(r.expectedQty) || 0;
    const a = Number.parseFloat(r.actualQty) || 0;
    return e !== a;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              Stok Sayımı
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Periyodik envanter sayımı ve fark analizi
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} className="flex items-center gap-2">
              <Plus size={16} /> Sayım Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Toplam Kayıt</p>
            <p className="text-2xl font-bold text-indigo-600">
              {records.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Eşleşiyor</p>
            <p className="text-2xl font-bold text-green-600">
              {records.length - diffRecords.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Fark Var</p>
            <p className="text-2xl font-bold text-red-500">
              {diffRecords.length}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p>Henüz sayım kaydı yok.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Ürün Adı
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Kod
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Beklenen
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Gerçek
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Fark
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Sayım Tarihi
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">
                      Durum
                    </th>
                    {isAdmin && <th className="px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => {
                    const diff = getDiff(r.expectedQty, r.actualQty);
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">{r.itemName}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {r.itemCode}
                        </td>
                        <td className="px-4 py-3">{r.category}</td>
                        <td className="px-4 py-3">
                          {r.expectedQty} {r.unit}
                        </td>
                        <td className="px-4 py-3">
                          {r.actualQty} {r.unit}
                        </td>
                        <td className={`px-4 py-3 font-semibold ${diff.cls}`}>
                          {diff.label}
                        </td>
                        <td className="px-4 py-3">{r.countDate || "-"}</td>
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
                    );
                  })}
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
              {editing ? "Sayım Güncelle" : "Yeni Sayım Kaydı"}
            </DialogTitle>
            <DialogDescription>Stok sayım bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Ürün Adı *</Label>
              <Input
                value={form.itemName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, itemName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Ürün Kodu</Label>
              <Input
                value={form.itemCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, itemCode: e.target.value }))
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
              <Label>Konum</Label>
              <Input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Beklenen Miktar</Label>
              <Input
                type="number"
                value={form.expectedQty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, expectedQty: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Gerçek Miktar</Label>
              <Input
                type="number"
                value={form.actualQty}
                onChange={(e) =>
                  setForm((f) => ({ ...f, actualQty: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Select
                value={form.unit}
                onValueChange={(v) => setForm((f) => ({ ...f, unit: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitList.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sayım Tarihi</Label>
              <Input
                type="date"
                value={form.countDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, countDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Sayan Kişi</Label>
              <Input
                value={form.countedBy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, countedBy: e.target.value }))
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
