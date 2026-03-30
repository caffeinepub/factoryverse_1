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
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddElecMechProject,
  useDeleteElecMechProject,
  useGetElecMechProjects,
  useUpdateElecMechProject,
} from "../hooks/useQueries";
import type { ElecMechProjectRecord } from "../types";

const statusClass: Record<string, string> = {
  Planlama: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  "Askıya Alındı": "bg-gray-100 text-gray-700",
  İptal: "bg-red-100 text-red-800",
};

const emptyForm = {
  projectCode: "",
  projectName: "",
  projectType: "Elektrik",
  area: "",
  contractor: "",
  startDate: "",
  endDate: "",
  budget: "",
  currency: "TRY",
  progress: "",
  responsible: "",
  status: "Planlama",
  description: "",
  notes: "",
};

export function ElecMechProjectPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetElecMechProjects(companyId);
  const addMut = useAddElecMechProject();
  const updateMut = useUpdateElecMechProject();
  const deleteMut = useDeleteElecMechProject();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ElecMechProjectRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<ElecMechProjectRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: ElecMechProjectRecord) {
    setEditing(r);
    setForm({
      projectCode: r.projectCode,
      projectName: r.projectName,
      projectType: r.projectType,
      area: r.area,
      contractor: r.contractor,
      startDate: r.startDate,
      endDate: r.endDate,
      budget: r.budget,
      currency: r.currency,
      progress: r.progress,
      responsible: r.responsible,
      status: r.status,
      description: r.description,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.projectName) {
      toast.error("Proje adı zorunludur.");
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

  async function handleDelete(r: ElecMechProjectRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const ongoing = records.filter((r) => r.status === "Devam Ediyor").length;
  const completed = records.filter((r) => r.status === "Tamamlandı").length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="text-yellow-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Elektrik/Mekanik Proje Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Tesis elektrik ve mekanik proje yönetimi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="elec-mech-project.primary_button"
            >
              <Plus size={16} className="mr-1" /> Proje Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Proje", val: records.length, color: "indigo" },
            { label: "Devam Eden", val: ongoing, color: "yellow" },
            { label: "Tamamlanan", val: completed, color: "green" },
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
              data-ocid="elec-mech-project.empty_state"
            >
              Henüz proje kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Kod",
                      "Proje Adı",
                      "Tür",
                      "Alan",
                      "Yüklenici",
                      "Başlangıç",
                      "Bitiş",
                      "İlerleme",
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
                      data-ocid={`elec-mech-project.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {r.projectCode || "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">{r.projectName}</td>
                      <td className="px-4 py-3">{r.projectType}</td>
                      <td className="px-4 py-3">{r.area || "—"}</td>
                      <td className="px-4 py-3">{r.contractor || "—"}</td>
                      <td className="px-4 py-3">{r.startDate}</td>
                      <td className="px-4 py-3">{r.endDate || "—"}</td>
                      <td className="px-4 py-3">
                        {r.progress ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Number(r.progress),
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {r.progress}%
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
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
                              data-ocid={`elec-mech-project.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`elec-mech-project.delete_button.${i + 1}`}
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
            data-ocid="elec-mech-project.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Proje Düzenle" : "Yeni Proje Ekle"}
              </DialogTitle>
              <DialogDescription>
                Elektrik/mekanik proje bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Proje Kodu</Label>
                <Input
                  value={form.projectCode}
                  placeholder="EMP-001"
                  onChange={(e) => sf("projectCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Proje Türü</Label>
                <Select
                  value={form.projectType}
                  onValueChange={(v) => sf("projectType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Elektrik",
                      "Mekanik",
                      "Elektrik+Mekanik",
                      "HVAC",
                      "Yangın",
                      "Diğer",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Proje Adı *</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) => sf("projectName", e.target.value)}
                  data-ocid="elec-mech-project.input"
                />
              </div>
              <div>
                <Label>Alan / Bölge</Label>
                <Input
                  value={form.area}
                  onChange={(e) => sf("area", e.target.value)}
                />
              </div>
              <div>
                <Label>Yüklenici</Label>
                <Input
                  value={form.contractor}
                  onChange={(e) => sf("contractor", e.target.value)}
                />
              </div>
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => sf("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => sf("endDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bütçe</Label>
                <Input
                  value={form.budget}
                  onChange={(e) => sf("budget", e.target.value)}
                />
              </div>
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => sf("currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["TRY", "USD", "EUR"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>İlerleme (%)</Label>
                <Input
                  value={form.progress}
                  placeholder="0-100"
                  onChange={(e) => sf("progress", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) => sf("responsible", e.target.value)}
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
                    {[
                      "Planlama",
                      "Devam Ediyor",
                      "Tamamlandı",
                      "Askıya Alındı",
                      "İptal",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
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
                data-ocid="elec-mech-project.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="elec-mech-project.submit_button"
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
              <DialogTitle>Projeyi Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.projectName} projesini silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="elec-mech-project.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="elec-mech-project.confirm_button"
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
