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
import { BookOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddTrainingProgramRecord,
  useDeleteTrainingProgramRecord,
  useGetTrainingProgramRecords,
  useUpdateTrainingProgramRecord,
} from "../hooks/useQueries";
import type { TrainingProgramRecord } from "../types";

const statusClass: Record<string, string> = {
  Planlandı: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-red-100 text-red-800",
};

const programTypes = [
  "Teknik Eğitim",
  "İSG Eğitimi",
  "Kalite Eğitimi",
  "Oryantasyon",
  "Liderlik",
  "Yazılım",
  "Diğer",
];
const statuses = ["Planlandı", "Devam Ediyor", "Tamamlandı", "İptal"];

const emptyForm = {
  title: "",
  programType: "",
  trainer: "",
  department: "",
  plannedDate: "",
  plannedEndDate: "",
  location: "",
  maxParticipants: "",
  participants: "",
  status: "Planlandı",
  cost: "",
  objectives: "",
  notes: "",
};

export function TrainingProgramPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";
  const { data: records = [], isLoading } =
    useGetTrainingProgramRecords(userCode);
  const addMutation = useAddTrainingProgramRecord();
  const updateMutation = useUpdateTrainingProgramRecord();
  const deleteMutation = useDeleteTrainingProgramRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingProgramRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const total = records.length;
  const completed = records.filter((r) => r.status === "Tamamlandı").length;
  const planned = records.filter((r) => r.status === "Planlandı").length;

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }
  function openEdit(r: TrainingProgramRecord) {
    setEditing(r);
    setForm({
      title: r.title,
      programType: r.programType,
      trainer: r.trainer,
      department: r.department,
      plannedDate: r.plannedDate,
      plannedEndDate: r.plannedEndDate,
      location: r.location,
      maxParticipants: r.maxParticipants,
      participants: r.participants,
      status: r.status,
      cost: r.cost,
      objectives: r.objectives,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!adminCode) return toast.error("Sadece yöneticiler işlem yapabilir.");
    if (!form.title || !form.programType)
      return toast.error("Lütfen zorunlu alanları doldurun.");
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          adminCode,
          recordId: editing.id,
          ...form,
        });
        toast.success("Kayıt güncellendi.");
      } else {
        await addMutation.mutateAsync({ adminCode, ...form });
        toast.success("Program eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete() {
    if (!adminCode || !deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Kayıt silindi.");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Eğitim Programı Planlama
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Eğitim takvimi ve katılımcı yönetimi
            </p>
          </div>
          {adminCode && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Program Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Program",
              value: total,
              color: "bg-indigo-50 border-indigo-200",
            },
            {
              label: "Tamamlanan",
              value: completed,
              color: "bg-green-50 border-green-200",
            },
            {
              label: "Planlanan",
              value: planned,
              color: "bg-blue-50 border-blue-200",
            },
          ].map((c) => (
            <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-center py-12">Yükleniyor...</p>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p>Henüz eğitim programı yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Program Adı",
                    "Tür",
                    "Eğitmen",
                    "Departman",
                    "Başlangıç",
                    "Bitiş",
                    "Katılımcı",
                    "Durum",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-gray-500 font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.programType}</td>
                    <td className="px-4 py-3 text-gray-600">{r.trainer}</td>
                    <td className="px-4 py-3 text-gray-600">{r.department}</td>
                    <td className="px-4 py-3 text-gray-500">{r.plannedDate}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.plannedEndDate}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.maxParticipants
                        ? `${r.participants ? r.participants.split(",").length : 0}/${r.maxParticipants}`
                        : r.participants}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    {adminCode && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="text-gray-400 hover:text-indigo-600"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(r.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Programı Düzenle" : "Yeni Eğitim Programı"}
            </DialogTitle>
            <DialogDescription>
              Eğitim programı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Program Adı *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Program Türü *</Label>
              <Select
                value={form.programType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, programType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {programTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Eğitmen</Label>
              <Input
                value={form.trainer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trainer: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Departman</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={form.plannedDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, plannedDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={form.plannedEndDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, plannedEndDate: e.target.value }))
                }
              />
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
              <Label>Maks. Katılımcı</Label>
              <Input
                type="number"
                value={form.maxParticipants}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxParticipants: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Maliyet (TRY)</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cost: e.target.value }))
                }
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Katılımcılar (virgülle ayırın)</Label>
              <Input
                value={form.participants}
                onChange={(e) =>
                  setForm((f) => ({ ...f, participants: e.target.value }))
                }
                placeholder="Ali Veli, Ahmet Yılmaz"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Hedefler</Label>
              <Textarea
                value={form.objectives}
                onChange={(e) =>
                  setForm((f) => ({ ...f, objectives: e.target.value }))
                }
                rows={2}
              />
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription>
              Bu eğitim programı silinecek. Emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
