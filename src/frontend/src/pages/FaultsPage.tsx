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
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddFaultReport,
  useDeleteFaultReport,
  useGetFaultReports,
  useUpdateFaultReport,
} from "../hooks/useQueries";
import type { FaultReport } from "../types";

const faultTypeLabels: Record<string, string> = {
  mechanical: "Mekanik",
  electrical: "Elektrik",
  software: "Yazılım",
  hydraulic: "Hidrolik",
  pneumatic: "Pnömatik",
  other: "Diğer",
};

const severityLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  critical: "Kritik",
};

const severityClass: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "Devam Ediyor",
  resolved: "Çözüldü",
  closed: "Kapatıldı",
};

const statusClass: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-blue-100 text-blue-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};

const emptyAdd = {
  machineId: "",
  machineName: "",
  title: "",
  faultType: "mechanical",
  severity: "medium",
  reportedBy: "",
  reportDate: "",
  description: "",
  notes: "",
};

export function FaultsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: faults = [], isLoading } = useGetFaultReports(userCode);
  const addMutation = useAddFaultReport();
  const updateMutation = useUpdateFaultReport();
  const deleteMutation = useDeleteFaultReport();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FaultReport | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [addForm, setAddForm] = useState(emptyAdd);
  const [editForm, setEditForm] = useState({
    title: "",
    faultType: "mechanical",
    severity: "medium",
    reportedBy: "",
    reportDate: "",
    description: "",
    cause: "",
    resolution: "",
    status: "open",
    resolutionDate: "",
    notes: "",
  });

  const openCount = faults.filter((f) => f.status === "open").length;
  const inProgressCount = faults.filter(
    (f) => f.status === "in_progress",
  ).length;
  const _resolvedCount = faults.filter(
    (f) => f.status === "resolved" || f.status === "closed",
  ).length;
  const criticalCount = faults.filter((f) => f.severity === "critical").length;

  const openEdit = (f: FaultReport) => {
    setEditTarget(f);
    setEditForm({
      title: f.title,
      faultType: f.faultType,
      severity: f.severity,
      reportedBy: f.reportedBy,
      reportDate: f.reportDate,
      description: f.description,
      cause: f.cause,
      resolution: f.resolution,
      status: f.status,
      resolutionDate: f.resolutionDate,
      notes: f.notes,
    });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    if (!addForm.title || !addForm.reportDate) {
      toast.error("Başlık ve tarih zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({ adminCode, ...addForm });
      toast.success("Arıza kaydedildi");
      setAddOpen(false);
      setAddForm(emptyAdd);
    } catch {
      toast.error("Kayıt başarısız");
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({
        adminCode,
        faultId: editTarget.id,
        ...editForm,
      });
      toast.success("Arıza güncellendi");
      setEditOpen(false);
    } catch {
      toast.error("Güncelleme başarısız");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ adminCode, faultId: deleteId });
      toast.success("Arıza kaydı silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const filtered =
    filterStatus === "all"
      ? faults
      : faults.filter((f) => f.status === filterStatus);

  return (
    <AppLayout title="Arıza Takibi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Arıza",
              value: faults.length,
              color: "text-indigo-600",
            },
            { label: "Açık", value: openCount, color: "text-red-600" },
            {
              label: "Devam Ediyor",
              value: inProgressCount,
              color: "text-blue-600",
            },
            { label: "Kritik", value: criticalCount, color: "text-orange-600" },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
            >
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold font-display ${c.color}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {["all", "open", "in_progress", "resolved", "closed"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s === "all" ? "Tümü" : statusLabels[s]}
              </button>
            ))}
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setAddForm(emptyAdd);
                setAddOpen(true);
              }}
            >
              <Plus size={16} className="mr-2" /> Arıza Ekle
            </Button>
          )}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <AlertTriangle size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">Arıza kaydı bulunamadı</p>
            <p className="text-sm mt-1">Yeni bir arıza kaydı ekleyin</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Başlık",
                      "Makine",
                      "Tür",
                      "Şiddet",
                      "Raporlayan",
                      "Tarih",
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
                  {filtered.map((fault, _idx) => (
                    <tr
                      key={fault.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {fault.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fault.machineName || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {faultTypeLabels[fault.faultType] ?? fault.faultType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityClass[fault.severity] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {severityLabels[fault.severity] ?? fault.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fault.reportedBy || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {fault.reportDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[fault.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[fault.status] ?? fault.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(fault)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(fault.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Arıza Kaydı</DialogTitle>
            <DialogDescription>Arıza bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Başlık *</Label>
              <Input
                value={addForm.title}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Arıza başlığı"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Makine Adı</Label>
                <Input
                  value={addForm.machineName}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, machineName: e.target.value }))
                  }
                  placeholder="Makine adı"
                />
              </div>
              <div>
                <Label>Makine ID</Label>
                <Input
                  value={addForm.machineId}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, machineId: e.target.value }))
                  }
                  placeholder="Opsiyonel"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Arıza Türü</Label>
                <Select
                  value={addForm.faultType}
                  onValueChange={(v) =>
                    setAddForm((p) => ({ ...p, faultType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Mekanik</SelectItem>
                    <SelectItem value="electrical">Elektrik</SelectItem>
                    <SelectItem value="software">Yazılım</SelectItem>
                    <SelectItem value="hydraulic">Hidrolik</SelectItem>
                    <SelectItem value="pneumatic">Pnömatik</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Şiddet</Label>
                <Select
                  value={addForm.severity}
                  onValueChange={(v) =>
                    setAddForm((p) => ({ ...p, severity: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Raporlayan</Label>
                <Input
                  value={addForm.reportedBy}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, reportedBy: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                />
              </div>
              <div>
                <Label>Tarih *</Label>
                <Input
                  type="date"
                  value={addForm.reportDate}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, reportDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Arıza detayları..."
                rows={2}
              />
            </div>
            <div>
              <Label>Notlar</Label>
              <Textarea
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleAdd} disabled={addMutation.isPending}>
              {addMutation.isPending ? "Kaydediliyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Arıza Düzenle</DialogTitle>
            <DialogDescription>
              Arıza bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Başlık</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Arıza Türü</Label>
                <Select
                  value={editForm.faultType}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, faultType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mechanical">Mekanik</SelectItem>
                    <SelectItem value="electrical">Elektrik</SelectItem>
                    <SelectItem value="software">Yazılım</SelectItem>
                    <SelectItem value="hydraulic">Hidrolik</SelectItem>
                    <SelectItem value="pneumatic">Pnömatik</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Şiddet</Label>
                <Select
                  value={editForm.severity}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, severity: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Durum</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Açık</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="resolved">Çözüldü</SelectItem>
                    <SelectItem value="closed">Kapatıldı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Çözüm Tarihi</Label>
                <Input
                  type="date"
                  value={editForm.resolutionDate}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      resolutionDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Neden / Kök Sebep</Label>
              <Textarea
                value={editForm.cause}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, cause: e.target.value }))
                }
                placeholder="Arıza sebebi..."
                rows={2}
              />
            </div>
            <div>
              <Label>Çözüm</Label>
              <Textarea
                value={editForm.resolution}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, resolution: e.target.value }))
                }
                placeholder="Uygulanan çözüm..."
                rows={2}
              />
            </div>
            <div>
              <Label>Notlar</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              İptal
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Kaydediliyor..." : "Güncelle"}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription>
              Bu arıza kaydını silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
