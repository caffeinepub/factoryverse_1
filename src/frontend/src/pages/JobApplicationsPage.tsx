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
import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddJobApplication,
  useDeleteJobApplication,
  useGetJobApplications,
  useUpdateJobApplication,
} from "../hooks/useQueries";
import type { JobApplication } from "../types";

const statusClass: Record<string, string> = {
  "Başvuru Alındı": "bg-gray-100 text-gray-700",
  Mülakat: "bg-blue-100 text-blue-800",
  "Teknik Test": "bg-orange-100 text-orange-800",
  Teklif: "bg-purple-100 text-purple-800",
  "Kabul Edildi": "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
};

const emptyForm = {
  positionName: "",
  applicantName: "",
  applicationDate: "",
  source: "İş İlanı",
  department: "",
  status: "Başvuru Alındı",
  interviewDate: "",
  interviewer: "",
  notes: "",
};

export function JobApplicationsPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetJobApplications(companyId);
  const addMut = useAddJobApplication();
  const updateMut = useUpdateJobApplication();
  const deleteMut = useDeleteJobApplication();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JobApplication | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<JobApplication | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: JobApplication) {
    setEditing(r);
    setForm({
      positionName: r.positionName,
      applicantName: r.applicantName,
      applicationDate: r.applicationDate,
      source: r.source,
      department: r.department,
      status: r.status,
      interviewDate: r.interviewDate,
      interviewer: r.interviewer,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.positionName || !form.applicantName) {
      toast.error("Pozisyon ve başvuran adı zorunludur.");
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

  async function handleDelete(r: JobApplication) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const activeCount = records.filter(
    (r) => r.status !== "Kabul Edildi" && r.status !== "Reddedildi",
  ).length;
  const acceptedCount = records.filter(
    (r) => r.status === "Kabul Edildi",
  ).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BriefcaseBusiness className="text-purple-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                İş Başvuru Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Başvuru süreçleri ve aday takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="job-applications.primary_button"
            >
              <Plus size={16} className="mr-1" /> Başvuru Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Başvuru", val: records.length, color: "indigo" },
            { label: "Aktif Süreçtekiler", val: activeCount, color: "purple" },
            { label: "Kabul Edildi", val: acceptedCount, color: "green" },
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
              data-ocid="job-applications.empty_state"
            >
              Henüz başvuru kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Pozisyon",
                      "Başvuran",
                      "Başvuru Tarihi",
                      "Kaynak",
                      "Departman",
                      "Mülakatçı",
                      "Mülakat Tarihi",
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
                      data-ocid={`job-applications.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.positionName}
                      </td>
                      <td className="px-4 py-3">{r.applicantName}</td>
                      <td className="px-4 py-3">{r.applicationDate}</td>
                      <td className="px-4 py-3">{r.source}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.interviewer}</td>
                      <td className="px-4 py-3">{r.interviewDate}</td>
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
                              data-ocid={`job-applications.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`job-applications.delete_button.${i + 1}`}
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
            data-ocid="job-applications.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Başvuru Düzenle" : "Başvuru Ekle"}
              </DialogTitle>
              <DialogDescription>
                İş başvurusu bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Pozisyon Adı *</Label>
                <Input
                  value={form.positionName}
                  onChange={(e) => sf("positionName", e.target.value)}
                  data-ocid="job-applications.input"
                />
              </div>
              <div>
                <Label>Başvuran Adı *</Label>
                <Input
                  value={form.applicantName}
                  onChange={(e) => sf("applicantName", e.target.value)}
                />
              </div>
              <div>
                <Label>Başvuru Tarihi</Label>
                <Input
                  type="date"
                  value={form.applicationDate}
                  onChange={(e) => sf("applicationDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Kaynak</Label>
                <Select
                  value={form.source}
                  onValueChange={(v) => sf("source", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["LinkedIn", "Referans", "İş İlanı", "Diğer"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
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
                      "Başvuru Alındı",
                      "Mülakat",
                      "Teknik Test",
                      "Teklif",
                      "Kabul Edildi",
                      "Reddedildi",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Mülakat Tarihi</Label>
                <Input
                  type="date"
                  value={form.interviewDate}
                  onChange={(e) => sf("interviewDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Mülakatçı</Label>
                <Input
                  value={form.interviewer}
                  onChange={(e) => sf("interviewer", e.target.value)}
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
                data-ocid="job-applications.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="job-applications.submit_button"
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
              <DialogTitle>Başvuru Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.applicantName} başvurusunu silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="job-applications.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="job-applications.confirm_button"
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
