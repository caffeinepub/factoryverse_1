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
import {
  AlertTriangle,
  FileSignature,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddContract,
  useDeleteContract,
  useGetContracts,
  useUpdateContract,
} from "../hooks/useQueries";
import type { Contract } from "../types";

const typeLabels: Record<string, string> = {
  purchase: "Satın Alma",
  service: "Hizmet",
  maintenance: "Bakım",
  rental: "Kiralama",
  other: "Diğer",
};

const statusLabels: Record<string, string> = {
  active: "Aktif",
  expired: "Süresi Doldu",
  draft: "Taslak",
  cancelled: "İptal",
};

const statusClass: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
  draft: "bg-gray-100 text-gray-700",
  cancelled: "bg-orange-100 text-orange-700",
};

const empty = {
  title: "",
  counterparty: "",
  contractType: "service",
  startDate: "",
  endDate: "",
  value: "",
  status: "active",
  responsible: "",
  notes: "",
};

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function ContractsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: contracts = [], isLoading } = useGetContracts(userCode);
  const addContract = useAddContract();
  const updateContract = useUpdateContract();
  const deleteContract = useDeleteContract();

  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<Contract | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = contracts.filter((c) =>
    filterStatus === "all" ? true : c.status === filterStatus,
  );

  const activeCount = contracts.filter((c) => c.status === "active").length;
  const expiringCount = contracts.filter((c) => {
    const d = daysUntil(c.endDate);
    return d !== null && d >= 0 && d <= 30 && c.status === "active";
  }).length;
  const totalValue = contracts.reduce((sum, c) => {
    const n = Number.parseFloat(c.value);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  function openAdd() {
    setEditItem(null);
    setForm({ ...empty });
    setShowDialog(true);
  }

  function openEdit(c: Contract) {
    setEditItem(c);
    setForm({
      title: c.title,
      counterparty: c.counterparty,
      contractType: c.contractType,
      startDate: c.startDate,
      endDate: c.endDate,
      value: c.value,
      status: c.status,
      responsible: c.responsible,
      notes: c.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.counterparty.trim()) {
      toast.error("Başlık ve karşı taraf gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateContract.mutateAsync({
          adminCode,
          contractId: editItem.id,
          ...form,
        });
        toast.success("Sözleşme güncellendi");
      } else {
        await addContract.mutateAsync({ adminCode, ...form });
        toast.success("Sözleşme eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteContract.mutateAsync({ adminCode, contractId: deleteTarget });
      toast.success("Sözleşme silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız");
    }
  }

  const f = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <FileSignature className="text-purple-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Sözleşme Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Tedarikçi ve yüklenici sözleşmelerini takip edin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="contracts.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Sözleşme Ekle
            </Button>
          )}
        </div>

        {expiringCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <AlertTriangle className="text-orange-500" size={20} />
            <span className="text-sm font-medium text-orange-800">
              {expiringCount} sözleşmenin bitiş tarihi 30 gün içinde!
            </span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Sözleşme",
              value: contracts.length,
              color: "text-indigo-600",
            },
            {
              label: "Aktif Sözleşme",
              value: activeCount,
              color: "text-green-600",
            },
            {
              label: "Toplam Değer",
              value: `₺${totalValue.toLocaleString("tr-TR")}`,
              color: "text-purple-600",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44" data-ocid="contracts.select">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="contracts.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="contracts.empty_state"
            >
              Kayıt bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Başlık",
                    "Karşı Taraf",
                    "Tür",
                    "Başlangıç",
                    "Bitiş",
                    "Değer",
                    "Durum",
                    "Sorumlu",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((c, idx) => {
                  const days = daysUntil(c.endDate);
                  const expiringSoon =
                    days !== null &&
                    days >= 0 &&
                    days <= 30 &&
                    c.status === "active";
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50 transition-colors ${expiringSoon ? "bg-orange-50" : ""}`}
                      data-ocid={`contracts.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {c.title}
                        {expiringSoon && (
                          <span className="ml-2 text-xs text-orange-600 font-medium">
                            ({days}g kaldı)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {c.counterparty}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {typeLabels[c.contractType] ?? c.contractType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.startDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.endDate || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₺
                        {Number.parseFloat(c.value || "0").toLocaleString(
                          "tr-TR",
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[c.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[c.status] ?? c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {c.responsible || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(c)}
                              data-ocid={`contracts.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(c.id)}
                              data-ocid={`contracts.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          aria-describedby="contracts-dialog-desc"
          data-ocid="contracts.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Sözleşme Düzenle" : "Yeni Sözleşme Ekle"}
            </DialogTitle>
            <DialogDescription id="contracts-dialog-desc">
              Sözleşme bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) => f("title", e.target.value)}
                data-ocid="contracts.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Karşı Taraf *</Label>
              <Input
                value={form.counterparty}
                onChange={(e) => f("counterparty", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Sözleşme Türü</Label>
              <Select
                value={form.contractType}
                onValueChange={(v) => f("contractType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => f("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Bitiş Tarihi</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => f("endDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Değer (₺)</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) => f("value", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sorumlu Kişi</Label>
              <Input
                value={form.responsible}
                onChange={(e) => f("responsible", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="contracts.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="contracts.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addContract.isPending || updateContract.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="contracts.submit_button"
            >
              {editItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          aria-describedby="contracts-del-desc"
          data-ocid="contracts.modal"
        >
          <DialogHeader>
            <DialogTitle>Sözleşmeyi Sil</DialogTitle>
            <DialogDescription id="contracts-del-desc">
              Bu sözleşmeyi silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="contracts.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteContract.isPending}
              data-ocid="contracts.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
