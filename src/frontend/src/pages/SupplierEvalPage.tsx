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
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSupplierEvalRecord,
  useDeleteSupplierEvalRecord,
  useGetSupplierEvalRecords,
  useUpdateSupplierEvalRecord,
} from "../hooks/useQueries";
import type { SupplierEvalRecord } from "../types";

const recommendationLabels: Record<string, string> = {
  continue: "Devam Et",
  review: "Değerlendir",
  terminate: "Kes",
};

const recommendationClass: Record<string, string> = {
  continue: "bg-green-100 text-green-800",
  review: "bg-yellow-100 text-yellow-800",
  terminate: "bg-red-100 text-red-800",
};

const scoreOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const emptyForm = {
  supplierName: "",
  evaluationPeriod: "",
  qualityScore: "7",
  deliveryScore: "7",
  priceScore: "7",
  serviceScore: "7",
  overallScore: "7",
  recommendation: "continue",
  evaluatedBy: "",
  evaluationDate: "",
  notes: "",
};

function ScoreBar({ score }: { score: string }) {
  const val = Number.parseInt(score, 10) || 0;
  const color =
    val >= 8 ? "bg-green-500" : val >= 5 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-200">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${val * 10}%` }}
        />
      </div>
      <span className="text-xs font-medium">{score}/10</span>
    </div>
  );
}

export function SupplierEvalPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetSupplierEvalRecords(userCode);
  const addRecord = useAddSupplierEvalRecord();
  const updateRecord = useUpdateSupplierEvalRecord();
  const deleteRecord = useDeleteSupplierEvalRecord();

  const [filterRec, setFilterRec] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<SupplierEvalRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = records.filter((r) =>
    filterRec === "all" ? true : r.recommendation === filterRec,
  );

  const avgOverall =
    records.length > 0
      ? (
          records.reduce(
            (s, r) => s + (Number.parseInt(r.overallScore, 10) || 0),
            0,
          ) / records.length
        ).toFixed(1)
      : "—";
  const terminateCount = records.filter(
    (r) => r.recommendation === "terminate",
  ).length;

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: SupplierEvalRecord) {
    setEditItem(r);
    setForm({
      supplierName: r.supplierName,
      evaluationPeriod: r.evaluationPeriod,
      qualityScore: r.qualityScore,
      deliveryScore: r.deliveryScore,
      priceScore: r.priceScore,
      serviceScore: r.serviceScore,
      overallScore: r.overallScore,
      recommendation: r.recommendation,
      evaluatedBy: r.evaluatedBy,
      evaluationDate: r.evaluationDate,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.supplierName.trim()) {
      toast.error("Tedarikçi adı gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Değerlendirme güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Değerlendirme eklendi");
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
      toast.success("Değerlendirme silindi");
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
            <div className="p-2 rounded-lg bg-amber-100">
              <Star className="text-amber-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Tedarikçi Değerlendirme
              </h1>
              <p className="text-sm text-gray-500">
                Tedarikçileri kalite, teslimat, fiyat ve hizmet kriterlerine
                göre puanlayın
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="suppliereval.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Değerlendirme Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Değerlendirme",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Ort. Genel Puan",
              value: avgOverall,
              color: "text-green-600",
            },
            {
              label: "İlişki Kesilecek",
              value: terminateCount,
              color: "text-red-600",
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
          <Select value={filterRec} onValueChange={setFilterRec}>
            <SelectTrigger className="w-44" data-ocid="suppliereval.select">
              <SelectValue placeholder="Öneri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öneriler</SelectItem>
              {Object.entries(recommendationLabels).map(([k, v]) => (
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
              data-ocid="suppliereval.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="suppliereval.empty_state"
            >
              Değerlendirme bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Tedarikçi",
                    "Dönem",
                    "Kalite",
                    "Teslimat",
                    "Fiyat",
                    "Hizmet",
                    "Genel",
                    "Değerlendiren",
                    "Öneri",
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
                    data-ocid={`suppliereval.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.supplierName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.evaluationPeriod || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={r.qualityScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={r.deliveryScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={r.priceScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={r.serviceScore} />
                    </td>
                    <td className="px-4 py-3">
                      <ScoreBar score={r.overallScore} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.evaluatedBy || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${recommendationClass[r.recommendation] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {recommendationLabels[r.recommendation] ??
                          r.recommendation}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            data-ocid={`suppliereval.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`suppliereval.delete_button.${idx + 1}`}
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
          aria-describedby="se-dialog-desc"
          data-ocid="suppliereval.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem
                ? "Değerlendirme Düzenle"
                : "Yeni Tedarikçi Değerlendirme"}
            </DialogTitle>
            <DialogDescription id="se-dialog-desc">
              Tedarikçi değerlendirme bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Tedarikçi Adı *</Label>
              <Input
                value={form.supplierName}
                onChange={(e) => f("supplierName", e.target.value)}
                placeholder="Tedarikçi adı"
                data-ocid="suppliereval.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Değerlendirme Dönemi</Label>
              <Input
                value={form.evaluationPeriod}
                onChange={(e) => f("evaluationPeriod", e.target.value)}
                placeholder="Ör: 2026 Q1"
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
            <div className="space-y-1">
              <Label>Kalite Puanı (1-10)</Label>
              <Select
                value={form.qualityScore}
                onValueChange={(v) => f("qualityScore", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scoreOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Teslimat Puanı (1-10)</Label>
              <Select
                value={form.deliveryScore}
                onValueChange={(v) => f("deliveryScore", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scoreOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fiyat Puanı (1-10)</Label>
              <Select
                value={form.priceScore}
                onValueChange={(v) => f("priceScore", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scoreOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Hizmet Puanı (1-10)</Label>
              <Select
                value={form.serviceScore}
                onValueChange={(v) => f("serviceScore", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scoreOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Genel Puan (1-10)</Label>
              <Select
                value={form.overallScore}
                onValueChange={(v) => f("overallScore", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scoreOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Öneri</Label>
              <Select
                value={form.recommendation}
                onValueChange={(v) => f("recommendation", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="continue">Devam Et</SelectItem>
                  <SelectItem value="review">Değerlendir</SelectItem>
                  <SelectItem value="terminate">Kes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Değerlendiren</Label>
              <Input
                value={form.evaluatedBy}
                onChange={(e) => f("evaluatedBy", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="suppliereval.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="suppliereval.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="suppliereval.submit_button"
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
          aria-describedby="se-del-desc"
          data-ocid="suppliereval.modal"
        >
          <DialogHeader>
            <DialogTitle>Değerlendirmeyi Sil</DialogTitle>
            <DialogDescription id="se-del-desc">
              Bu değerlendirmeyi silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="suppliereval.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="suppliereval.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
