import { Badge } from "@/components/ui/badge";
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
import { ClipboardCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddQualityCheck,
  useDeleteQualityCheck,
  useGetQualityChecks,
  useUpdateQualityCheck,
} from "../hooks/useQueries";
import type { QualityCheck } from "../types";

const checkTypeLabels: Record<string, string> = {
  production: "Üretim",
  installation: "Kurulum",
  assembly: "Montaj",
  final: "Final",
  other: "Diğer",
};

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  passed: "Geçti",
  failed: "Başarısız",
  needs_action: "Aksiyon Gerekli",
};

const statusClass: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800",
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  needs_action: "bg-amber-100 text-amber-800",
};

const emptyForm = {
  title: "",
  checkType: "production",
  machineId: "",
  machineName: "",
  inspector: "",
  checkDate: "",
  score: "",
  notes: "",
};

export function QualityPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: checks = [], isLoading } = useGetQualityChecks(userCode);
  const addMutation = useAddQualityCheck();
  const updateMutation = useUpdateQualityCheck();
  const deleteMutation = useDeleteQualityCheck();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QualityCheck | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editStatus, setEditStatus] = useState("pending");
  const [filterType, setFilterType] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setEditStatus("pending");
    setDialogOpen(true);
  };

  const openEdit = (check: QualityCheck) => {
    setEditTarget(check);
    setForm({
      title: check.title,
      checkType: check.checkType,
      machineId: check.machineId,
      machineName: check.machineName,
      inspector: check.inspector,
      checkDate: check.checkDate,
      score: check.score,
      notes: check.notes,
    });
    setEditStatus(check.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.checkDate) {
      toast.error("Başlık ve tarih zorunludur");
      return;
    }
    try {
      if (editTarget) {
        await updateMutation.mutateAsync({
          adminCode,
          checkId: editTarget.id,
          title: form.title,
          checkType: form.checkType,
          machineId: form.machineId,
          machineName: form.machineName,
          inspector: form.inspector,
          checkDate: form.checkDate,
          status: editStatus,
          score: form.score,
          notes: form.notes,
        });
        toast.success("Kalite kontrolü güncellendi");
      } else {
        await addMutation.mutateAsync({
          adminCode,
          title: form.title,
          checkType: form.checkType,
          machineId: form.machineId,
          machineName: form.machineName,
          inspector: form.inspector,
          checkDate: form.checkDate,
          score: form.score,
          notes: form.notes,
        });
        toast.success("Kalite kontrolü eklendi");
      }
      setDialogOpen(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ adminCode, checkId: deleteId });
      toast.success("Kalite kontrolü silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const filtered =
    filterType === "all"
      ? checks
      : checks.filter((c) => c.checkType === filterType);

  const total = checks.length;
  const passed = checks.filter((c) => c.status === "passed").length;
  const failed = checks.filter((c) => c.status === "failed").length;
  const pending = checks.filter((c) => c.status === "pending").length;

  const isSaving = addMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <AppLayout title="Kalite Kontrol">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Toplam Kontrol", value: total, color: "text-indigo-600" },
            { label: "Geçti", value: passed, color: "text-green-600" },
            { label: "Başarısız", value: failed, color: "text-red-600" },
            { label: "Bekliyor", value: pending, color: "text-blue-600" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className={`text-2xl font-bold font-display ${card.color}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {[
              "all",
              "production",
              "installation",
              "assembly",
              "final",
              "other",
            ].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterType === t
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                data-ocid={"quality.tab"}
              >
                {t === "all" ? "Tümü" : checkTypeLabels[t]}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button onClick={openAdd} data-ocid="quality.primary_button">
              <Plus size={16} className="mr-2" /> Yeni Kontrol
            </Button>
          )}
        </div>

        {/* Table / empty state */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="quality.loading_state"
          >
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-gray-400"
            data-ocid="quality.empty_state"
          >
            <ClipboardCheck size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">Henüz kalite kontrolü yok</p>
            <p className="text-sm mt-1">Yeni bir kontrol kaydı ekleyin</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Başlık",
                      "Tür",
                      "Makine",
                      "Denetçi",
                      "Tarih",
                      "Puan",
                      "Durum",
                      "İşlem",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((check, idx) => (
                    <tr
                      key={check.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      data-ocid={`quality.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {check.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {checkTypeLabels[check.checkType] ?? check.checkType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {check.machineName || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {check.inspector || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {check.checkDate}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {check.score || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[check.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[check.status] ?? check.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(check)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                data-ocid={`quality.edit_button.${idx + 1}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(check.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                data-ocid={`quality.delete_button.${idx + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="quality.dialog">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Kontrol Düzenle" : "Yeni Kalite Kontrolü"}
            </DialogTitle>
            <DialogDescription>
              Kalite kontrol kaydı bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Kontrol başlığı"
                data-ocid="quality.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tür</Label>
                <Select
                  value={form.checkType}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, checkType: v }))
                  }
                >
                  <SelectTrigger data-ocid="quality.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="production">Üretim</SelectItem>
                    <SelectItem value="installation">Kurulum</SelectItem>
                    <SelectItem value="assembly">Montaj</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={form.checkDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, checkDate: e.target.value }))
                  }
                  data-ocid="quality.input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Makine ID</Label>
                <Input
                  value={form.machineId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, machineId: e.target.value }))
                  }
                  placeholder="MK-001"
                />
              </div>
              <div>
                <Label>Makine Adı</Label>
                <Input
                  value={form.machineName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, machineName: e.target.value }))
                  }
                  placeholder="CNC Tezgahı"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Denetçi</Label>
                <Input
                  value={form.inspector}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, inspector: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <Label>Puan</Label>
                <Input
                  value={form.score}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, score: e.target.value }))
                  }
                  placeholder="85/100"
                />
              </div>
            </div>
            {editTarget && (
              <div>
                <Label>Durum</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger data-ocid="quality.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="passed">Geçti</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                    <SelectItem value="needs_action">
                      Aksiyon Gerekli
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Kontrol notları..."
                rows={3}
                data-ocid="quality.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="quality.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="quality.submit_button"
            >
              {isSaving ? "Kaydediliyor..." : editTarget ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(o) => {
          if (!o) setDeleteId(null);
        }}
      >
        <DialogContent data-ocid="quality.dialog">
          <DialogHeader>
            <DialogTitle>Kontrolü Sil</DialogTitle>
            <DialogDescription>
              Bu kalite kontrolünü silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="quality.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              data-ocid="quality.confirm_button"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
