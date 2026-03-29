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
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddPerformanceRecord,
  useDeletePerformanceRecord,
  useGetPerformanceRecords,
  useUpdatePerformanceRecord,
} from "../hooks/useQueries";
import type { PerformanceRecord } from "../types";

const kpiTypeLabels: Record<string, string> = {
  individual: "Bireysel",
  department: "Departman",
};

const periodLabels: Record<string, string> = {
  monthly: "Aylık",
  quarterly: "Çeyreklik",
  annual: "Yıllık",
};

const statusLabels: Record<string, string> = {
  "on-target": "Hedefte",
  "above-target": "Hedef Üstü",
  "below-target": "Hedef Altı",
};

const statusClass: Record<string, string> = {
  "on-target": "bg-blue-100 text-blue-800",
  "above-target": "bg-green-100 text-green-800",
  "below-target": "bg-red-100 text-red-800",
};

const empty = {
  title: "",
  kpiType: "individual",
  period: "monthly",
  personnelOrDept: "",
  targetValue: "",
  actualValue: "",
  unit: "",
  evaluationDate: "",
  status: "on-target",
  notes: "",
};

export function PerformancePage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetPerformanceRecords(userCode);
  const addRecord = useAddPerformanceRecord();
  const updateRecord = useUpdatePerformanceRecord();
  const deleteRecord = useDeletePerformanceRecord();

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<PerformanceRecord | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = records.filter((r) => {
    if (filterType !== "all" && r.kpiType !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const aboveCount = records.filter((r) => r.status === "above-target").length;
  const belowCount = records.filter((r) => r.status === "below-target").length;

  function openAdd() {
    setEditItem(null);
    setForm({ ...empty });
    setShowDialog(true);
  }

  function openEdit(r: PerformanceRecord) {
    setEditItem(r);
    setForm({
      title: r.title,
      kpiType: r.kpiType,
      period: r.period,
      personnelOrDept: r.personnelOrDept,
      targetValue: r.targetValue,
      actualValue: r.actualValue,
      unit: r.unit,
      evaluationDate: r.evaluationDate,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("Başlık gerekli");
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
            <div className="p-2 rounded-lg bg-indigo-100">
              <Target className="text-indigo-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Performans Takibi
              </h1>
              <p className="text-sm text-gray-500">
                KPI ve performans göstergelerini yönetin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="performance.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kayıt Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam KPI",
              value: records.length,
              color: "text-indigo-600",
            },
            { label: "Hedef Üstü", value: aboveCount, color: "text-green-600" },
            { label: "Hedef Altı", value: belowCount, color: "text-red-600" },
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40" data-ocid="performance.select">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              {Object.entries(kpiTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44" data-ocid="performance.select">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
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
              data-ocid="performance.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="performance.empty_state"
            >
              Kayıt bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Başlık",
                    "Tür",
                    "Dönem",
                    "Personel/Dept.",
                    "Hedef",
                    "Gerçek",
                    "Birim",
                    "Değ. Tarihi",
                    "Durum",
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
                    data-ocid={`performance.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {kpiTypeLabels[r.kpiType] ?? r.kpiType}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {periodLabels[r.period] ?? r.period}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.personnelOrDept}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.targetValue}</td>
                    <td className="px-4 py-3 text-gray-600">{r.actualValue}</td>
                    <td className="px-4 py-3 text-gray-500">{r.unit}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.evaluationDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabels[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            data-ocid={`performance.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`performance.delete_button.${idx + 1}`}
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
          aria-describedby="perf-dialog-desc"
          data-ocid="performance.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kaydı Düzenle" : "Yeni Kayıt Ekle"}
            </DialogTitle>
            <DialogDescription id="perf-dialog-desc">
              Performans kaydı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) => f("title", e.target.value)}
                data-ocid="performance.input"
              />
            </div>
            <div className="space-y-1">
              <Label>KPI Türü</Label>
              <Select
                value={form.kpiType}
                onValueChange={(v) => f("kpiType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(kpiTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Dönem</Label>
              <Select value={form.period} onValueChange={(v) => f("period", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(periodLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Personel / Departman</Label>
              <Input
                value={form.personnelOrDept}
                onChange={(e) => f("personnelOrDept", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Hedef Değer</Label>
              <Input
                value={form.targetValue}
                onChange={(e) => f("targetValue", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Gerçekleşen Değer</Label>
              <Input
                value={form.actualValue}
                onChange={(e) => f("actualValue", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Input
                value={form.unit}
                onChange={(e) => f("unit", e.target.value)}
                placeholder="%, adet, saat…"
              />
            </div>
            <div className="space-y-1">
              <Label>Değerlendirme Tarihi</Label>
              <Input
                type="date"
                value={form.evaluationDate}
                onChange={(e) => f("evaluationDate", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={3}
                data-ocid="performance.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="performance.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="performance.submit_button"
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
          aria-describedby="perf-del-desc"
          data-ocid="performance.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="perf-del-desc">
              Bu kaydı silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="performance.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="performance.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
