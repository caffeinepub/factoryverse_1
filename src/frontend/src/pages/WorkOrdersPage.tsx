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
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddWorkOrder,
  useDeleteWorkOrder,
  useGetWorkOrders,
  useUpdateWorkOrder,
} from "../hooks/useQueries";
import type { WorkOrder } from "../types";

const orderTypeLabels: Record<string, string> = {
  maintenance: "Bakım",
  repair: "Onarım",
  inspection: "Muayene",
  installation: "Kurulum",
  other: "Diğer",
};

const priorityLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  urgent: "Acil",
};

const priorityClass: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

const statusClass: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-700",
};

const emptyAdd = {
  title: "",
  orderType: "maintenance",
  machineId: "",
  machineName: "",
  assignedTo: "",
  priority: "medium",
  scheduledDate: "",
  description: "",
  notes: "",
};

export function WorkOrdersPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: orders = [], isLoading } = useGetWorkOrders(userCode);
  const addMutation = useAddWorkOrder();
  const updateMutation = useUpdateWorkOrder();
  const deleteMutation = useDeleteWorkOrder();

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WorkOrder | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [addForm, setAddForm] = useState(emptyAdd);
  const [editForm, setEditForm] = useState({
    title: "",
    orderType: "maintenance",
    machineId: "",
    machineName: "",
    assignedTo: "",
    priority: "medium",
    status: "pending",
    scheduledDate: "",
    completedDate: "",
    description: "",
    notes: "",
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const inProgressCount = orders.filter(
    (o) => o.status === "in_progress",
  ).length;
  const _completedCount = orders.filter((o) => o.status === "completed").length;
  const urgentCount = orders.filter((o) => o.priority === "urgent").length;

  const openEdit = (o: WorkOrder) => {
    setEditTarget(o);
    setEditForm({
      title: o.title,
      orderType: o.orderType,
      machineId: o.machineId,
      machineName: o.machineName,
      assignedTo: o.assignedTo,
      priority: o.priority,
      status: o.status,
      scheduledDate: o.scheduledDate,
      completedDate: o.completedDate,
      description: o.description,
      notes: o.notes,
    });
    setEditOpen(true);
  };

  const handleAdd = async () => {
    if (!addForm.title || !addForm.scheduledDate) {
      toast.error("Başlık ve planlanan tarih zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({ adminCode, ...addForm });
      toast.success("İş emri oluşturuldu");
      setAddOpen(false);
      setAddForm(emptyAdd);
    } catch {
      toast.error("İş emri oluşturulamadı");
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({
        adminCode,
        orderId: editTarget.id,
        ...editForm,
      });
      toast.success("İş emri güncellendi");
      setEditOpen(false);
    } catch {
      toast.error("Güncelleme başarısız");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ adminCode, orderId: deleteId });
      toast.success("İş emri silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  return (
    <AppLayout title="İş Emirleri">
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
              label: "Toplam İş Emri",
              value: orders.length,
              color: "text-indigo-600",
            },
            {
              label: "Bekliyor",
              value: pendingCount,
              color: "text-yellow-600",
            },
            {
              label: "Devam Ediyor",
              value: inProgressCount,
              color: "text-blue-600",
            },
            { label: "Acil", value: urgentCount, color: "text-red-600" },
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
            {["all", "pending", "in_progress", "completed", "cancelled"].map(
              (s) => (
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
              ),
            )}
          </div>
          {isAdmin && (
            <Button
              onClick={() => {
                setAddForm(emptyAdd);
                setAddOpen(true);
              }}
            >
              <Plus size={16} className="mr-2" /> İş Emri Oluştur
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
            <ClipboardList size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">İş emri bulunamadı</p>
            <p className="text-sm mt-1">Yeni bir iş emri oluşturun</p>
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
                      "Atanan",
                      "Öncelik",
                      "Planlanan",
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
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {order.title}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {orderTypeLabels[order.orderType] ?? order.orderType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.machineName || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.assignedTo || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[order.priority] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {priorityLabels[order.priority] ?? order.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {order.scheduledDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[order.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(order)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(order.id)}
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
            <DialogTitle>Yeni İş Emri</DialogTitle>
            <DialogDescription>İş emri bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Başlık *</Label>
              <Input
                value={addForm.title}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="İş emri başlığı"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tür</Label>
                <Select
                  value={addForm.orderType}
                  onValueChange={(v) =>
                    setAddForm((p) => ({ ...p, orderType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Bakım</SelectItem>
                    <SelectItem value="repair">Onarım</SelectItem>
                    <SelectItem value="inspection">Muayene</SelectItem>
                    <SelectItem value="installation">Kurulum</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={addForm.priority}
                  onValueChange={(v) =>
                    setAddForm((p) => ({ ...p, priority: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                <Label>Atanan Kişi</Label>
                <Input
                  value={addForm.assignedTo}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, assignedTo: e.target.value }))
                  }
                  placeholder="Ad Soyad"
                />
              </div>
            </div>
            <div>
              <Label>Planlanan Tarih *</Label>
              <Input
                type="date"
                value={addForm.scheduledDate}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, scheduledDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="İş emri detayları..."
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
              {addMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>İş Emri Düzenle</DialogTitle>
            <DialogDescription>
              İş emri bilgilerini güncelleyin.
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
                <Label>Tür</Label>
                <Select
                  value={editForm.orderType}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, orderType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Bakım</SelectItem>
                    <SelectItem value="repair">Onarım</SelectItem>
                    <SelectItem value="inspection">Muayene</SelectItem>
                    <SelectItem value="installation">Kurulum</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, priority: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
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
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="in_progress">Devam Ediyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tamamlanma Tarihi</Label>
                <Input
                  type="date"
                  value={editForm.completedDate}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      completedDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Atanan Kişi</Label>
              <Input
                value={editForm.assignedTo}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, assignedTo: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Açıklama</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, description: e.target.value }))
                }
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
            <DialogTitle>İş Emrini Sil</DialogTitle>
            <DialogDescription>
              Bu iş emrini silmek istediğinizden emin misiniz?
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
