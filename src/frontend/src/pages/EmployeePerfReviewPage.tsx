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
  useAddEmployeePerfReview,
  useDeleteEmployeePerfReview,
  useGetEmployeePerfReviews,
  useUpdateEmployeePerfReview,
} from "../hooks/useQueries";
import type { EmployeePerfReview } from "../types";

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Planlandı: "bg-gray-100 text-gray-700",
};

function scoreColor(score: string, target: string) {
  const s = Number.parseFloat(score);
  const t = Number.parseFloat(target);
  if (!s || !t) return "text-gray-700";
  if (s >= t) return "text-green-600 font-semibold";
  if (s >= t * 0.8) return "text-orange-500 font-semibold";
  return "text-red-600 font-semibold";
}

const emptyForm = {
  employeeName: "",
  department: "",
  position: "",
  reviewPeriod: "",
  reviewDate: "",
  reviewer: "",
  targetScore: "100",
  actualScore: "",
  technicalScore: "",
  behaviorScore: "",
  teamworkScore: "",
  strengths: "",
  improvements: "",
  status: "Tamamlandı",
  notes: "",
};

export function EmployeePerfReviewPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } =
    useGetEmployeePerfReviews(companyId);
  const addMut = useAddEmployeePerfReview();
  const updateMut = useUpdateEmployeePerfReview();
  const deleteMut = useDeleteEmployeePerfReview();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmployeePerfReview | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<EmployeePerfReview | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: EmployeePerfReview) {
    setEditing(r);
    setForm({
      employeeName: r.employeeName,
      department: r.department,
      position: r.position,
      reviewPeriod: r.reviewPeriod,
      reviewDate: r.reviewDate,
      reviewer: r.reviewer,
      targetScore: r.targetScore,
      actualScore: r.actualScore,
      technicalScore: r.technicalScore,
      behaviorScore: r.behaviorScore,
      teamworkScore: r.teamworkScore,
      strengths: r.strengths,
      improvements: r.improvements,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.employeeName) {
      toast.error("Çalışan adı zorunludur.");
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

  async function handleDelete(r: EmployeePerfReview) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const avgScore =
    records.length > 0
      ? (
          records.reduce(
            (s, r) => s + (Number.parseFloat(r.actualScore) || 0),
            0,
          ) / records.length
        ).toFixed(1)
      : "0";

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="text-amber-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Çalışan Performans Değerlendirmesi
              </h1>
              <p className="text-sm text-gray-500">
                Dönemsel performans değerlendirme kayıtları
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="perf-review.primary_button"
            >
              <Plus size={16} className="mr-1" /> Değerlendirme Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Değerlendirme",
              val: records.length,
              color: "indigo",
            },
            {
              label: "Tamamlanan",
              val: records.filter((r) => r.status === "Tamamlandı").length,
              color: "green",
            },
            { label: "Ortalama Puan", val: avgScore, color: "amber" },
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
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="perf-review.empty_state"
            >
              Henüz değerlendirme kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Çalışan",
                      "Departman",
                      "Pozisyon",
                      "Dönem",
                      "Değerlendirici",
                      "Hedef",
                      "Gerçekleşen",
                      "Teknik",
                      "Davranış",
                      "Takım",
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
                  {records.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                      data-ocid={`perf-review.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.employeeName}
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.position}</td>
                      <td className="px-4 py-3 text-xs">{r.reviewPeriod}</td>
                      <td className="px-4 py-3">{r.reviewer}</td>
                      <td className="px-4 py-3">{r.targetScore}</td>
                      <td
                        className={`px-4 py-3 ${scoreColor(r.actualScore, r.targetScore)}`}
                      >
                        {r.actualScore}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.technicalScore}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.behaviorScore}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {r.teamworkScore}
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
                              data-ocid={`perf-review.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`perf-review.delete_button.${i + 1}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="perf-review.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Değerlendirme Düzenle" : "Değerlendirme Ekle"}
              </DialogTitle>
              <DialogDescription>
                Çalışan performans değerlendirme bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Çalışan Adı *</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) => sf("employeeName", e.target.value)}
                  data-ocid="perf-review.input"
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Pozisyon</Label>
                <Input
                  value={form.position}
                  onChange={(e) => sf("position", e.target.value)}
                />
              </div>
              <div>
                <Label>Değerlendirme Dönemi</Label>
                <Input
                  value={form.reviewPeriod}
                  onChange={(e) => sf("reviewPeriod", e.target.value)}
                  placeholder="Ör: 2025 Q1"
                />
              </div>
              <div>
                <Label>Değerlendirme Tarihi</Label>
                <Input
                  type="date"
                  value={form.reviewDate}
                  onChange={(e) => sf("reviewDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Değerlendirici</Label>
                <Input
                  value={form.reviewer}
                  onChange={(e) => sf("reviewer", e.target.value)}
                />
              </div>
              <div>
                <Label>Hedef Puan</Label>
                <Input
                  type="number"
                  value={form.targetScore}
                  onChange={(e) => sf("targetScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Gerçekleşen Puan</Label>
                <Input
                  type="number"
                  value={form.actualScore}
                  onChange={(e) => sf("actualScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Teknik Puan</Label>
                <Input
                  type="number"
                  value={form.technicalScore}
                  onChange={(e) => sf("technicalScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Davranış Puanı</Label>
                <Input
                  type="number"
                  value={form.behaviorScore}
                  onChange={(e) => sf("behaviorScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Takım Çalışması</Label>
                <Input
                  type="number"
                  value={form.teamworkScore}
                  onChange={(e) => sf("teamworkScore", e.target.value)}
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
                    {["Tamamlandı", "Devam Ediyor", "Planlandı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Güçlü Yönler</Label>
                <Textarea
                  value={form.strengths}
                  onChange={(e) => sf("strengths", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Gelişim Alanları</Label>
                <Textarea
                  value={form.improvements}
                  onChange={(e) => sf("improvements", e.target.value)}
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
                data-ocid="perf-review.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="perf-review.submit_button"
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
              <DialogTitle>Değerlendirme Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.employeeName} kaydını silmek istediğinizden emin
                misiniz?
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
