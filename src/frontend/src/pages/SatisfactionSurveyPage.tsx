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
import { Heart, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSatisfactionSurvey,
  useDeleteSatisfactionSurvey,
  useGetSatisfactionSurveys,
  useUpdateSatisfactionSurvey,
} from "../hooks/useQueries";
import type { SatisfactionSurveyRecord } from "../types";

const statusClass: Record<string, string> = {
  Planlanan: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
};

const emptyForm = {
  surveyPeriod: "",
  surveyDate: "",
  department: "",
  totalEmployees: "",
  respondents: "",
  managementScore: "",
  workEnvironmentScore: "",
  careerScore: "",
  compensationScore: "",
  overallScore: "",
  topStrength: "",
  topWeakness: "",
  status: "Planlanan",
  notes: "",
};

export function SatisfactionSurveyPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } =
    useGetSatisfactionSurveys(companyId);
  const addMut = useAddSatisfactionSurvey();
  const updateMut = useUpdateSatisfactionSurvey();
  const deleteMut = useDeleteSatisfactionSurvey();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SatisfactionSurveyRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<SatisfactionSurveyRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: SatisfactionSurveyRecord) {
    setEditing(r);
    setForm({
      surveyPeriod: r.surveyPeriod,
      surveyDate: r.surveyDate,
      department: r.department,
      totalEmployees: r.totalEmployees,
      respondents: r.respondents,
      managementScore: r.managementScore,
      workEnvironmentScore: r.workEnvironmentScore,
      careerScore: r.careerScore,
      compensationScore: r.compensationScore,
      overallScore: r.overallScore,
      topStrength: r.topStrength,
      topWeakness: r.topWeakness,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.surveyPeriod || !form.department) {
      toast.error("Dönem ve departman zorunludur.");
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

  async function handleDelete(r: SatisfactionSurveyRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const completed = records.filter((r) => r.status === "Tamamlandı");
  const avgOverall =
    completed.length > 0
      ? (
          completed.reduce((a, r) => a + (Number(r.overallScore) || 0), 0) /
          completed.length
        ).toFixed(1)
      : "—";
  const avgParticipation =
    completed.length > 0
      ? (
          completed.reduce(
            (a, r) =>
              a +
              (Number(r.totalEmployees)
                ? (Number(r.respondents) / Number(r.totalEmployees)) * 100
                : 0),
            0,
          ) / completed.length
        ).toFixed(1)
      : "—";

  function participationRate(total: string, resp: string) {
    const t = Number(total);
    const r = Number(resp);
    if (!t) return "—";
    return `%${((r / t) * 100).toFixed(0)}`;
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="text-purple-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Çalışan Memnuniyet Anketi
              </h1>
              <p className="text-sm text-gray-500">
                Çalışan memnuniyet anketi sonuçları ve trend analizi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="satisfaction-surveys.primary_button"
            >
              <Plus size={16} className="mr-1" /> Anket Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Anket", val: records.length, color: "indigo" },
            {
              label: "Ortalama Memnuniyet",
              val: avgOverall !== "—" ? `${avgOverall}/10` : "—",
              color: "purple",
            },
            {
              label: "Ort. Katılım Oranı",
              val: avgParticipation !== "—" ? `%${avgParticipation}` : "—",
              color: "green",
            },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>
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
              data-ocid="satisfaction-surveys.empty_state"
            >
              Henüz anket sonucu yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Dönem",
                      "Departman",
                      "Katılım",
                      "Katılım Oranı",
                      "Yönetim",
                      "Çalışma Ortamı",
                      "Kariyer",
                      "Ücret",
                      "Genel Puan",
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
                      data-ocid={`satisfaction-surveys.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">{r.surveyPeriod}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">
                        {r.respondents}/{r.totalEmployees}
                      </td>
                      <td className="px-4 py-3">
                        {participationRate(r.totalEmployees, r.respondents)}
                      </td>
                      <td className="px-4 py-3">
                        {r.managementScore ? `${r.managementScore}/10` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.workEnvironmentScore
                          ? `${r.workEnvironmentScore}/10`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.careerScore ? `${r.careerScore}/10` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.compensationScore
                          ? `${r.compensationScore}/10`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {r.overallScore ? `${r.overallScore}/10` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusClass[r.status] ?? "bg-gray-100"
                          }`}
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
                              data-ocid={`satisfaction-surveys.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`satisfaction-surveys.delete_button.${i + 1}`}
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
            data-ocid="satisfaction-surveys.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Anketi Düzenle" : "Anket Sonucu Ekle"}
              </DialogTitle>
              <DialogDescription>
                Çalışan memnuniyet anketi bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Anket Dönemi *</Label>
                <Input
                  value={form.surveyPeriod}
                  placeholder="2024-Q1"
                  onChange={(e) => sf("surveyPeriod", e.target.value)}
                  data-ocid="satisfaction-surveys.input"
                />
              </div>
              <div>
                <Label>Anket Tarihi</Label>
                <Input
                  type="date"
                  value={form.surveyDate}
                  onChange={(e) => sf("surveyDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Departman *</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Toplam Çalışan</Label>
                <Input
                  value={form.totalEmployees}
                  onChange={(e) => sf("totalEmployees", e.target.value)}
                />
              </div>
              <div>
                <Label>Katılımcı Sayısı</Label>
                <Input
                  value={form.respondents}
                  onChange={(e) => sf("respondents", e.target.value)}
                />
              </div>
              <div>
                <Label>Yönetim Puanı (0-10)</Label>
                <Input
                  value={form.managementScore}
                  onChange={(e) => sf("managementScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Çalışma Ortamı (0-10)</Label>
                <Input
                  value={form.workEnvironmentScore}
                  onChange={(e) => sf("workEnvironmentScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Kariyer Gelişimi (0-10)</Label>
                <Input
                  value={form.careerScore}
                  onChange={(e) => sf("careerScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Ücret/Yan Haklar (0-10)</Label>
                <Input
                  value={form.compensationScore}
                  onChange={(e) => sf("compensationScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Genel Puan (0-10)</Label>
                <Input
                  value={form.overallScore}
                  onChange={(e) => sf("overallScore", e.target.value)}
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
                    {["Planlanan", "Devam Ediyor", "Tamamlandı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Güçlü Yön</Label>
                <Input
                  value={form.topStrength}
                  onChange={(e) => sf("topStrength", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Gelişim Alanı</Label>
                <Input
                  value={form.topWeakness}
                  onChange={(e) => sf("topWeakness", e.target.value)}
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
                data-ocid="satisfaction-surveys.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="satisfaction-surveys.submit_button"
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
              <DialogTitle>Anketi Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.surveyPeriod} - {deleteConfirm?.department}{" "}
                anketini silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="satisfaction-surveys.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="satisfaction-surveys.confirm_button"
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
