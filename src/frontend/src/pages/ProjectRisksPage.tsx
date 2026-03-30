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
import { Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddProjectRiskItem,
  useDeleteProjectRiskItem,
  useGetProjectRiskItems,
  useUpdateProjectRiskItem,
} from "../hooks/useQueries";
import type { ProjectRiskItem } from "../types";

const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  Azaltılıyor: "bg-orange-100 text-orange-800",
  Kapalı: "bg-green-100 text-green-800",
  "Kabul Edildi": "bg-blue-100 text-blue-800",
};

function getRiskLevel(
  probability: string,
  impact: string,
): { label: string; cls: string } {
  const score = (v: string) => (v === "Yüksek" ? 3 : v === "Orta" ? 2 : 1);
  const p = score(probability);
  const i = score(impact);
  if (p === 3 && i === 3)
    return { label: "Kritik", cls: "bg-red-100 text-red-800" };
  if (p >= 2 && i >= 2 && (p === 3 || i === 3))
    return { label: "Yüksek", cls: "bg-orange-100 text-orange-800" };
  if (p === 2 && i === 2)
    return { label: "Orta", cls: "bg-yellow-100 text-yellow-800" };
  return { label: "Düşük", cls: "bg-green-100 text-green-800" };
}

const emptyForm = {
  riskTitle: "",
  projectName: "",
  riskCategory: "Teknik",
  probability: "Orta",
  impact: "Orta",
  mitigationPlan: "",
  owner: "",
  status: "Açık",
  notes: "",
};

export function ProjectRisksPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetProjectRiskItems(companyId);
  const addMut = useAddProjectRiskItem();
  const updateMut = useUpdateProjectRiskItem();
  const deleteMut = useDeleteProjectRiskItem();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRiskItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectRiskItem | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: ProjectRiskItem) {
    setEditing(r);
    setForm({
      riskTitle: r.riskTitle,
      projectName: r.projectName,
      riskCategory: r.riskCategory,
      probability: r.probability,
      impact: r.impact,
      mitigationPlan: r.mitigationPlan,
      owner: r.owner,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.riskTitle) {
      toast.error("Risk başlığı zorunludur.");
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

  async function handleDelete(r: ProjectRiskItem) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const openCount = records.filter((r) => r.status === "Açık").length;
  const criticalHighCount = records.filter((r) => {
    const lvl = getRiskLevel(r.probability, r.impact).label;
    return lvl === "Kritik" || lvl === "Yüksek";
  }).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldAlert className="text-red-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Proje Risk Kaydı
              </h1>
              <p className="text-sm text-gray-500">
                Proje riskleri, olasılık-etki matrisi ve azaltma planları
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="project-risks.primary_button"
            >
              <Plus size={16} className="mr-1" /> Risk Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Risk", val: records.length, color: "indigo" },
            { label: "Açık Riskler", val: openCount, color: "red" },
            {
              label: "Kritik + Yüksek",
              val: criticalHighCount,
              color: "orange",
            },
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

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
        ) : records.length === 0 ? (
          <div
            className="p-8 text-center text-gray-400"
            data-ocid="project-risks.empty_state"
          >
            Henüz risk kaydı yok.
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map((r, i) => {
              const level = getRiskLevel(r.probability, r.impact);
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl shadow-sm border p-5"
                  data-ocid={`project-risks.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${level.cls}`}
                        >
                          {level.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                        >
                          {r.status}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {r.riskCategory}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {r.riskTitle}
                      </h3>
                      {r.projectName && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Proje: {r.projectName}
                        </p>
                      )}
                      <div className="mt-2 flex gap-4 text-xs text-gray-600">
                        <span>
                          Olasılık: <strong>{r.probability}</strong>
                        </span>
                        <span>
                          Etki: <strong>{r.impact}</strong>
                        </span>
                        {r.owner && (
                          <span>
                            Sahip: <strong>{r.owner}</strong>
                          </span>
                        )}
                      </div>
                      {r.mitigationPlan && (
                        <p className="mt-2 text-sm text-gray-700 bg-gray-50 rounded p-2">
                          <span className="font-medium">Azaltma Planı:</span>{" "}
                          {r.mitigationPlan}
                        </p>
                      )}
                    </div>
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="p-1 hover:text-indigo-600 text-gray-400"
                          data-ocid={`project-risks.edit_button.${i + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(r)}
                          className="p-1 hover:text-red-500 text-gray-400"
                          data-ocid={`project-risks.delete_button.${i + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="project-risks.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Risk Düzenle" : "Risk Ekle"}
              </DialogTitle>
              <DialogDescription>
                Proje riski bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Risk Başlığı *</Label>
                <Input
                  value={form.riskTitle}
                  onChange={(e) => sf("riskTitle", e.target.value)}
                  data-ocid="project-risks.input"
                />
              </div>
              <div className="col-span-2">
                <Label>Proje Adı</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) => sf("projectName", e.target.value)}
                />
              </div>
              <div>
                <Label>Risk Kategorisi</Label>
                <Select
                  value={form.riskCategory}
                  onValueChange={(v) => sf("riskCategory", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Teknik",
                      "Mali",
                      "Operasyonel",
                      "Dış",
                      "İnsan Kaynağı",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sorumlu</Label>
                <Input
                  value={form.owner}
                  onChange={(e) => sf("owner", e.target.value)}
                />
              </div>
              <div>
                <Label>Olasılık</Label>
                <Select
                  value={form.probability}
                  onValueChange={(v) => sf("probability", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Etki</Label>
                <Select
                  value={form.impact}
                  onValueChange={(v) => sf("impact", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek"].map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
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
                    {["Açık", "Azaltılıyor", "Kapalı", "Kabul Edildi"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Azaltma Planı</Label>
                <Textarea
                  value={form.mitigationPlan}
                  onChange={(e) => sf("mitigationPlan", e.target.value)}
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
                data-ocid="project-risks.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="project-risks.submit_button"
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
              <DialogTitle>Risk Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.riskTitle} kaydını silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="project-risks.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="project-risks.confirm_button"
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
