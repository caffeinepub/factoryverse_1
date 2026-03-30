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
import { AlertOctagon, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSafetyIncidentRecord,
  useDeleteSafetyIncidentRecord,
  useGetSafetyIncidentRecords,
  useUpdateSafetyIncidentRecord,
} from "../hooks/useQueries";
import type { SafetyIncidentRecord } from "../types";

const severityClass: Record<string, string> = {
  "Ramak Kala": "bg-yellow-100 text-yellow-800",
  Hafif: "bg-blue-100 text-blue-800",
  Orta: "bg-orange-100 text-orange-800",
  Ağır: "bg-red-100 text-red-800",
  Ölümlü: "bg-red-200 text-red-900 font-bold",
};
const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  Araştırılıyor: "bg-yellow-100 text-yellow-800",
  Kapatıldı: "bg-green-100 text-green-800",
};

const incidentTypes = [
  "İş Kazası",
  "Meslek Hastalığı",
  "Ramak Kala",
  "Yangın",
  "Kimyasal Maruz Kalma",
  "Düşme",
  "Diğer",
];
const severities = ["Ramak Kala", "Hafif", "Orta", "Ağır", "Ölümlü"];
const statuses = ["Açık", "Araştırılıyor", "Kapatıldı"];

const emptyForm = {
  title: "",
  incidentType: "",
  severity: "Hafif",
  location: "",
  incidentDate: "",
  reportedBy: "",
  injured: "",
  description: "",
  immediateAction: "",
  rootCause: "",
  correctiveAction: "",
  status: "Açık",
  notes: "",
};

export function SafetyIncidentPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const adminCode = isAdmin ? (userCode ?? "") : "";
  const { data: records = [], isLoading } =
    useGetSafetyIncidentRecords(userCode);
  const addMutation = useAddSafetyIncidentRecord();
  const updateMutation = useUpdateSafetyIncidentRecord();
  const deleteMutation = useDeleteSafetyIncidentRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SafetyIncidentRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const open_ = records.filter((r) => r.status === "Açık").length;
  const investigating = records.filter(
    (r) => r.status === "Araştırılıyor",
  ).length;
  const severe = records.filter(
    (r) => r.severity === "Ağır" || r.severity === "Ölümlü",
  ).length;

  function openAdd() {
    setEditing(null);
    setForm({ ...emptyForm });
    setOpen(true);
  }
  function openEdit(r: SafetyIncidentRecord) {
    setEditing(r);
    setForm({
      title: r.title,
      incidentType: r.incidentType,
      severity: r.severity,
      location: r.location,
      incidentDate: r.incidentDate,
      reportedBy: r.reportedBy,
      injured: r.injured,
      description: r.description,
      immediateAction: r.immediateAction,
      rootCause: r.rootCause,
      correctiveAction: r.correctiveAction,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSubmit() {
    if (!adminCode) return toast.error("Sadece yöneticiler işlem yapabilir.");
    if (!form.title || !form.incidentType)
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
        toast.success("Olay kaydedildi.");
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
              Güvenlik Olayı Takibi
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              İş kazaları, ramak kala olayları ve düzeltici faaliyetler
            </p>
          </div>
          {adminCode && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Olay Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Açık Olay",
              value: open_,
              color: "bg-red-50 border-red-200",
            },
            {
              label: "Araştırılıyor",
              value: investigating,
              color: "bg-yellow-50 border-yellow-200",
            },
            {
              label: "Ağır / Ölümlü",
              value: severe,
              color: "bg-orange-50 border-orange-200",
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
            <AlertOctagon size={48} className="mx-auto mb-3 opacity-30" />
            <p>Henüz güvenlik olayı kaydı yok.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Olay Başlığı",
                    "Tür",
                    "Şiddet",
                    "Konum",
                    "Tarih",
                    "Raporlayan",
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
                    <td className="px-4 py-3 text-gray-600">
                      {r.incidentType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${severityClass[r.severity] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {r.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.location}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {r.incidentDate}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.reportedBy}</td>
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
              {editing ? "Olayı Düzenle" : "Yeni Güvenlik Olayı"}
            </DialogTitle>
            <DialogDescription>
              Güvenlik olayı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Olay Başlığı *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Olay Türü *</Label>
              <Select
                value={form.incidentType}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, incidentType: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Şiddet</Label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm((f) => ({ ...f, severity: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {severities.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Olay Tarihi</Label>
              <Input
                type="date"
                value={form.incidentDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, incidentDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Raporlayan</Label>
              <Input
                value={form.reportedBy}
                onChange={(e) =>
                  setForm((f) => ({ ...f, reportedBy: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Yaralı / Etkilenen</Label>
              <Input
                value={form.injured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, injured: e.target.value }))
                }
                placeholder="İsim veya yok"
              />
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
            <div className="col-span-2 space-y-1">
              <Label>Olay Açıklaması</Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Acil Alınan Önlem</Label>
              <Textarea
                value={form.immediateAction}
                onChange={(e) =>
                  setForm((f) => ({ ...f, immediateAction: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Kök Neden</Label>
              <Textarea
                value={form.rootCause}
                onChange={(e) =>
                  setForm((f) => ({ ...f, rootCause: e.target.value }))
                }
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Düzeltici Faaliyet</Label>
              <Textarea
                value={form.correctiveAction}
                onChange={(e) =>
                  setForm((f) => ({ ...f, correctiveAction: e.target.value }))
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
                rows={1}
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
              Bu güvenlik olayı silinecek. Emin misiniz?
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
