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
import { Pencil, PieChart, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddCostAnalysisRecord,
  useDeleteCostAnalysisRecord,
  useGetCostAnalysisRecords,
  useUpdateCostAnalysisRecord,
} from "../hooks/useQueries";
import type { CostAnalysisRecord } from "../types";

const categoryLabels: Record<string, string> = {
  equipment: "Ekipman",
  labor: "İşçilik",
  material: "Malzeme",
  logistics: "Lojistik",
  installation: "Kurulum",
  consulting: "Danışmanlık",
  other: "Diğer",
};
const statusLabels: Record<string, string> = {
  planned: "Planlandı",
  inprogress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal",
};
const statusClass: Record<string, string> = {
  planned: "bg-blue-100 text-blue-800",
  inprogress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-700",
};

const empty = {
  projectName: "",
  costCategory: "equipment",
  description: "",
  plannedAmount: "",
  actualAmount: "",
  date: "",
  responsible: "",
  status: "planned",
  notes: "",
};

export function CostAnalysisPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const { data: records = [], isLoading } = useGetCostAnalysisRecords(userCode);
  const addRecord = useAddCostAnalysisRecord();
  const updateRecord = useUpdateCostAnalysisRecord();
  const deleteRecord = useDeleteCostAnalysisRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CostAnalysisRecord | null>(null);
  const [form, setForm] = useState(empty);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(r: CostAnalysisRecord) {
    setEditing(r);
    setForm({
      projectName: r.projectName,
      costCategory: r.costCategory,
      description: r.description,
      plannedAmount: r.plannedAmount,
      actualAmount: r.actualAmount,
      date: r.date,
      responsible: r.responsible,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }
  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.projectName || !form.description) {
      toast.error("Proje adı ve açıklama zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateRecord.mutateAsync({
          adminCode: session?.userCode ?? "",
          recordId: editing.id,
          ...form,
        });
        toast.success("Kayıt güncellendi.");
      } else {
        await addRecord.mutateAsync({
          adminCode: session?.userCode ?? "",
          ...form,
        });
        toast.success("Maliyet kalemi kaydedildi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: CostAnalysisRecord) {
    if (!confirm(`"${r.description}" silinsin mi?`)) return;
    try {
      await deleteRecord.mutateAsync({
        adminCode: session?.userCode ?? "",
        recordId: r.id,
      });
      toast.success("Silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  }

  const totalPlanned = records.reduce(
    (s, r) => s + (Number.parseFloat(r.plannedAmount) || 0),
    0,
  );
  const totalActual = records.reduce(
    (s, r) => s + (Number.parseFloat(r.actualAmount) || 0),
    0,
  );
  const variance = totalActual - totalPlanned;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
              <PieChart className="text-primary" size={26} />
              Proje Maliyet Analizi
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Proje bazlı maliyet kalemleri ve bütçe karşılaştırması
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} className="gap-2">
              <Plus size={16} /> Yeni Kalem
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Toplam Planlanan</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              ₺{totalPlanned.toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Toplam Gerçekleşen</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              ₺{totalActual.toLocaleString("tr-TR")}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Fark (Sapma)</p>
            <p
              className={`text-2xl font-bold mt-1 ${variance > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {variance > 0 ? "+" : ""}₺{variance.toLocaleString("tr-TR")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Henüz maliyet kalemi yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Proje
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Açıklama
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Planlanan (₺)
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Gerçekleşen (₺)
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Sapma
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Durum
                    </th>
                    {isAdmin && <th className="text-right px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => {
                    const p = Number.parseFloat(r.plannedAmount) || 0;
                    const a = Number.parseFloat(r.actualAmount) || 0;
                    const diff = a - p;
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {r.projectName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {categoryLabels[r.costCategory] ?? r.costCategory}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                          {r.description}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          ₺{p.toLocaleString("tr-TR")}
                        </td>
                        <td className="px-4 py-3 text-gray-900">
                          ₺{a.toLocaleString("tr-TR")}
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "text-gray-500"}`}
                        >
                          {diff > 0 ? "+" : ""}₺{diff.toLocaleString("tr-TR")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                          >
                            {statusLabels[r.status] ?? r.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEdit(r)}
                              >
                                <Pencil size={14} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500"
                                onClick={() => handleDelete(r)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Kalemi Düzenle" : "Yeni Maliyet Kalemi"}
            </DialogTitle>
            <DialogDescription>
              Proje maliyet bilgilerini doldurun.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Proje Adı *</Label>
              <Input
                value={form.projectName}
                onChange={(e) => set("projectName", e.target.value)}
                placeholder="Proje adı"
              />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select
                value={form.costCategory}
                onValueChange={(v) => set("costCategory", v)}
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
              <Label>Tarih</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Açıklama *</Label>
              <Input
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Kalem açıklaması"
              />
            </div>
            <div className="space-y-1">
              <Label>Planlanan (₺)</Label>
              <Input
                value={form.plannedAmount}
                onChange={(e) => set("plannedAmount", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label>Gerçekleşen (₺)</Label>
              <Input
                value={form.actualAmount}
                onChange={(e) => set("actualAmount", e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label>Sorumlu</Label>
              <Input
                value={form.responsible}
                onChange={(e) => set("responsible", e.target.value)}
                placeholder="Sorumlu kişi"
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planlandı</SelectItem>
                  <SelectItem value="inprogress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
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
              disabled={addRecord.isPending || updateRecord.isPending}
            >
              {editing ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
