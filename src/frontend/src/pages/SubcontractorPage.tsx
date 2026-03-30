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
import { HardHat, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSubcontractorJob,
  useDeleteSubcontractorJob,
  useGetSubcontractorJobs,
  useUpdateSubcontractorJob,
} from "../hooks/useQueries";
import type { SubcontractorJob } from "../types";

const statusClass: Record<string, string> = {
  Planlı: "bg-yellow-100 text-yellow-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-red-100 text-red-800",
};

const emptyForm = {
  jobTitle: "",
  subcontractorName: "",
  contactPerson: "",
  startDate: "",
  endDate: "",
  contractValue: "",
  currency: "TRY",
  scope: "",
  location: "",
  supervisor: "",
  completionPercent: "0",
  status: "Planlı",
  notes: "",
};

export function SubcontractorPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetSubcontractorJobs(companyId);
  const addMut = useAddSubcontractorJob();
  const updateMut = useUpdateSubcontractorJob();
  const deleteMut = useDeleteSubcontractorJob();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SubcontractorJob | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<SubcontractorJob | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: SubcontractorJob) {
    setEditing(r);
    setForm({
      jobTitle: r.jobTitle,
      subcontractorName: r.subcontractorName,
      contactPerson: r.contactPerson,
      startDate: r.startDate,
      endDate: r.endDate,
      contractValue: r.contractValue,
      currency: r.currency,
      scope: r.scope,
      location: r.location,
      supervisor: r.supervisor,
      completionPercent: r.completionPercent,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.jobTitle) {
      toast.error("İş tanımı zorunludur.");
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

  async function handleDelete(r: SubcontractorJob) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const activeCount = records.filter((r) => r.status === "Devam Ediyor").length;
  const totalValue = records.reduce(
    (s, r) => s + (Number(r.contractValue) || 0),
    0,
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <HardHat className="text-orange-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Taşeron İş Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Alt yüklenici iş emirleri ve sözleşme takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> İş Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam İş", val: records.length, color: "indigo" },
            { label: "Devam Eden", val: activeCount, color: "blue" },
            {
              label: "Toplam Sözleşme Değeri",
              val: totalValue.toLocaleString("tr-TR"),
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
            <div className="p-8 text-center text-gray-400">
              Henüz taşeron iş kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "İş Tanımı",
                      "Taşeron",
                      "Başlangıç",
                      "Bitiş",
                      "Sözleşme Değeri",
                      "Tamamlanma",
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
                    >
                      <td className="px-4 py-3 font-medium">{r.jobTitle}</td>
                      <td className="px-4 py-3">{r.subcontractorName}</td>
                      <td className="px-4 py-3">{r.startDate}</td>
                      <td className="px-4 py-3">{r.endDate}</td>
                      <td className="px-4 py-3">
                        {Number(r.contractValue).toLocaleString("tr-TR")}{" "}
                        {r.currency}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(Number(r.completionPercent), 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {r.completionPercent}%
                          </span>
                        </div>
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
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "İş Düzenle" : "İş Ekle"}</DialogTitle>
              <DialogDescription>
                Taşeron iş bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>İş Tanımı *</Label>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => sf("jobTitle", e.target.value)}
                />
              </div>
              <div>
                <Label>Taşeron Firma</Label>
                <Input
                  value={form.subcontractorName}
                  onChange={(e) => sf("subcontractorName", e.target.value)}
                />
              </div>
              <div>
                <Label>İletişim Kişisi</Label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => sf("contactPerson", e.target.value)}
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
                <Label>Sözleşme Değeri</Label>
                <Input
                  value={form.contractValue}
                  onChange={(e) => sf("contractValue", e.target.value)}
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
                    {["TRY", "USD", "EUR", "GBP"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lokasyon</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                />
              </div>
              <div>
                <Label>Denetçi</Label>
                <Input
                  value={form.supervisor}
                  onChange={(e) => sf("supervisor", e.target.value)}
                />
              </div>
              <div>
                <Label>Tamamlanma %</Label>
                <Input
                  value={form.completionPercent}
                  onChange={(e) => sf("completionPercent", e.target.value)}
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
                    {["Planlı", "Devam Ediyor", "Tamamlandı", "İptal"].map(
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
                <Label>Kapsam</Label>
                <Textarea
                  value={form.scope}
                  onChange={(e) => sf("scope", e.target.value)}
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
              <DialogTitle>İş Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.jobTitle} kaydını silmek istediğinizden emin
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
