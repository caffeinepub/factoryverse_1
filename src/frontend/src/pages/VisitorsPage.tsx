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
import { LogOut, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddVisitorEntry,
  useDeleteVisitorEntry,
  useGetVisitorEntries,
  useUpdateVisitorEntry,
} from "../hooks/useQueries";
import type { VisitorEntry } from "../types";

const visitorTypeLabels: Record<string, string> = {
  visitor: "Ziyaretçi",
  contractor: "Yüklenici",
  inspector: "Denetçi",
  supplier: "Tedarikçi",
};

const statusLabels: Record<string, string> = {
  inside: "İçeride",
  exited: "Çıktı",
};

const statusClass: Record<string, string> = {
  inside: "bg-green-100 text-green-800",
  exited: "bg-gray-100 text-gray-700",
};

const emptyAddForm = {
  visitorName: "",
  visitorType: "visitor",
  company: "",
  purpose: "",
  hostName: "",
  entryDate: "",
  entryTime: "",
  notes: "",
};

export function VisitorsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: entries = [], isLoading } = useGetVisitorEntries(userCode);
  const addMutation = useAddVisitorEntry();
  const updateMutation = useUpdateVisitorEntry();
  const deleteMutation = useDeleteVisitorEntry();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<VisitorEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState(emptyAddForm);
  const [editForm, setEditForm] = useState<{
    visitorName: string;
    visitorType: string;
    company: string;
    purpose: string;
    hostName: string;
    entryDate: string;
    entryTime: string;
    exitTime: string;
    status: string;
    notes: string;
  }>({
    visitorName: "",
    visitorType: "visitor",
    company: "",
    purpose: "",
    hostName: "",
    entryDate: "",
    entryTime: "",
    exitTime: "",
    status: "inside",
    notes: "",
  });
  const [filterType, setFilterType] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const todayCount = entries.filter((e) => e.entryDate === today).length;
  const insideCount = entries.filter((e) => e.status === "inside").length;
  const exitedCount = entries.filter((e) => e.status === "exited").length;

  const openAdd = () => {
    setAddForm(emptyAddForm);
    setAddDialogOpen(true);
  };

  const openEdit = (entry: VisitorEntry) => {
    setEditTarget(entry);
    setEditForm({
      visitorName: entry.visitorName,
      visitorType: entry.visitorType,
      company: entry.company,
      purpose: entry.purpose,
      hostName: entry.hostName,
      entryDate: entry.entryDate,
      entryTime: entry.entryTime,
      exitTime: entry.exitTime,
      status: entry.status,
      notes: entry.notes,
    });
    setEditDialogOpen(true);
  };

  const handleCheckout = async (entry: VisitorEntry) => {
    const now = new Date();
    const exitTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    try {
      await updateMutation.mutateAsync({
        adminCode,
        entryId: entry.id,
        visitorName: entry.visitorName,
        visitorType: entry.visitorType,
        company: entry.company,
        purpose: entry.purpose,
        hostName: entry.hostName,
        entryDate: entry.entryDate,
        entryTime: entry.entryTime,
        exitTime,
        status: "exited",
        notes: entry.notes,
      });
      toast.success(`${entry.visitorName} çıkış yaptı`);
    } catch {
      toast.error("Çıkış kaydedilemedi");
    }
  };

  const handleAdd = async () => {
    if (!addForm.visitorName || !addForm.entryDate) {
      toast.error("Ziyaretçi adı ve tarih zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({ adminCode, ...addForm });
      toast.success("Ziyaretçi kaydedildi");
      setAddDialogOpen(false);
    } catch {
      toast.error("Kayıt başarısız");
    }
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    try {
      await updateMutation.mutateAsync({
        adminCode,
        entryId: editTarget.id,
        ...editForm,
      });
      toast.success("Ziyaretçi güncellendi");
      setEditDialogOpen(false);
    } catch {
      toast.error("Güncelleme başarısız");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ adminCode, entryId: deleteId });
      toast.success("Ziyaretçi kaydı silindi");
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    }
  };

  const filtered =
    filterType === "all"
      ? entries
      : entries.filter((e) => e.visitorType === filterType);

  const isAdding = addMutation.isPending;
  const isUpdating = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <AppLayout title="Ziyaretçi Takibi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Ziyaret",
              value: entries.length,
              color: "text-indigo-600",
            },
            { label: "İçeride", value: insideCount, color: "text-green-600" },
            { label: "Çıktı", value: exitedCount, color: "text-gray-600" },
            { label: "Bugün", value: todayCount, color: "text-amber-600" },
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
            {["all", "visitor", "contractor", "inspector", "supplier"].map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterType === t
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  data-ocid="visitors.tab"
                >
                  {t === "all" ? "Tümü" : visitorTypeLabels[t]}
                </button>
              ),
            )}
          </div>
          {isAdmin && (
            <Button onClick={openAdd} data-ocid="visitors.primary_button">
              <Plus size={16} className="mr-2" /> Ziyaretçi Ekle
            </Button>
          )}
        </div>

        {/* Table / empty state */}
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20"
            data-ocid="visitors.loading_state"
          >
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-gray-400"
            data-ocid="visitors.empty_state"
          >
            <UserCheck size={48} className="mb-4 opacity-40" />
            <p className="text-lg font-medium">Henüz ziyaretçi kaydı yok</p>
            <p className="text-sm mt-1">Yeni bir ziyaretçi kaydı ekleyin</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Ziyaretçi",
                      "Tür",
                      "Şirket",
                      "Amaç",
                      "Ev Sahibi",
                      "Tarih",
                      "Giriş",
                      "Çıkış",
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
                  {filtered.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      data-ocid={`visitors.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {entry.visitorName}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {visitorTypeLabels[entry.visitorType] ??
                          entry.visitorType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.company || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.purpose || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.hostName || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.entryDate}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.entryTime || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {entry.exitTime || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[entry.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[entry.status] ?? entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isAdmin && entry.status === "inside" && (
                            <button
                              type="button"
                              onClick={() => handleCheckout(entry)}
                              title="Çıkış Yaptır"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                              data-ocid={`visitors.secondary_button.${idx + 1}`}
                            >
                              <LogOut size={14} />
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEdit(entry)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                data-ocid={`visitors.edit_button.${idx + 1}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteId(entry.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                data-ocid={`visitors.delete_button.${idx + 1}`}
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
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="visitors.dialog">
          <DialogHeader>
            <DialogTitle>Yeni Ziyaretçi</DialogTitle>
            <DialogDescription>
              Ziyaretçi giriş bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Ziyaretçi Adı *</Label>
              <Input
                value={addForm.visitorName}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, visitorName: e.target.value }))
                }
                placeholder="Ad Soyad"
                data-ocid="visitors.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tür</Label>
                <Select
                  value={addForm.visitorType}
                  onValueChange={(v) =>
                    setAddForm((p) => ({ ...p, visitorType: v }))
                  }
                >
                  <SelectTrigger data-ocid="visitors.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitor">Ziyaretçi</SelectItem>
                    <SelectItem value="contractor">Yüklenici</SelectItem>
                    <SelectItem value="inspector">Denetçi</SelectItem>
                    <SelectItem value="supplier">Tedarikçi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Şirket</Label>
                <Input
                  value={addForm.company}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, company: e.target.value }))
                  }
                  placeholder="Şirket adı"
                />
              </div>
            </div>
            <div>
              <Label>Ziyaret Amacı</Label>
              <Input
                value={addForm.purpose}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, purpose: e.target.value }))
                }
                placeholder="Toplantı, denetim, teslimat..."
              />
            </div>
            <div>
              <Label>Ev Sahibi / Karşılayan</Label>
              <Input
                value={addForm.hostName}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, hostName: e.target.value }))
                }
                placeholder="Ad Soyad"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giriş Tarihi *</Label>
                <Input
                  type="date"
                  value={addForm.entryDate}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, entryDate: e.target.value }))
                  }
                  data-ocid="visitors.input"
                />
              </div>
              <div>
                <Label>Giriş Saati</Label>
                <Input
                  type="time"
                  value={addForm.entryTime}
                  onChange={(e) =>
                    setAddForm((p) => ({ ...p, entryTime: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notlar</Label>
              <Textarea
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Ek notlar..."
                rows={2}
                data-ocid="visitors.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              data-ocid="visitors.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleAdd}
              disabled={isAdding}
              data-ocid="visitors.submit_button"
            >
              {isAdding ? "Kaydediliyor..." : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="visitors.dialog">
          <DialogHeader>
            <DialogTitle>Ziyaretçi Düzenle</DialogTitle>
            <DialogDescription>
              Ziyaretçi bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Ziyaretçi Adı</Label>
              <Input
                value={editForm.visitorName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, visitorName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tür</Label>
                <Select
                  value={editForm.visitorType}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, visitorType: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visitor">Ziyaretçi</SelectItem>
                    <SelectItem value="contractor">Yüklenici</SelectItem>
                    <SelectItem value="inspector">Denetçi</SelectItem>
                    <SelectItem value="supplier">Tedarikçi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durum</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, status: v }))
                  }
                >
                  <SelectTrigger data-ocid="visitors.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inside">İçeride</SelectItem>
                    <SelectItem value="exited">Çıktı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Şirket</Label>
                <Input
                  value={editForm.company}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, company: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Amaç</Label>
                <Input
                  value={editForm.purpose}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, purpose: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Ev Sahibi</Label>
              <Input
                value={editForm.hostName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, hostName: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={editForm.entryDate}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, entryDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Giriş</Label>
                <Input
                  type="time"
                  value={editForm.entryTime}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, entryTime: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Çıkış</Label>
                <Input
                  type="time"
                  value={editForm.exitTime}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, exitTime: e.target.value }))
                  }
                />
              </div>
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
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-ocid="visitors.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={isUpdating}
              data-ocid="visitors.submit_button"
            >
              {isUpdating ? "Kaydediliyor..." : "Güncelle"}
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
        <DialogContent data-ocid="visitors.dialog">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription>
              Bu ziyaretçi kaydını silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="visitors.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              data-ocid="visitors.confirm_button"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
