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
import { Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddRiskRecord,
  useDeleteRiskRecord,
  useGetRiskRecords,
  useUpdateRiskRecord,
} from "../hooks/useQueries";
import type { RiskRecord } from "../types";

const probabilityLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

const impactLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
};

const riskLevelLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  critical: "Kritik",
};

const riskLevelClass: Record<string, string> = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  open: "Açık",
  inprogress: "İşlemde",
  mitigated: "Azaltıldı",
  closed: "Kapatıldı",
};

const statusClass: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  inprogress: "bg-blue-100 text-blue-800",
  mitigated: "bg-yellow-100 text-yellow-800",
  closed: "bg-green-100 text-green-800",
};

const emptyForm = {
  title: "",
  category: "operational",
  probability: "medium",
  impact: "medium",
  riskLevel: "medium",
  description: "",
  owner: "",
  mitigationPlan: "",
  status: "open",
  reviewDate: "",
  notes: "",
};

export function RiskPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetRiskRecords(userCode);
  const addRecord = useAddRiskRecord();
  const updateRecord = useUpdateRiskRecord();
  const deleteRecord = useDeleteRiskRecord();

  const [filterStatus, setFilterStatus] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<RiskRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = records.filter((r) =>
    filterStatus === "all" ? true : r.status === filterStatus,
  );

  const openCount = records.filter((r) => r.status === "open").length;
  const criticalCount = records.filter(
    (r) => r.riskLevel === "critical",
  ).length;

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: RiskRecord) {
    setEditItem(r);
    setForm({
      title: r.title,
      category: r.category,
      probability: r.probability,
      impact: r.impact,
      riskLevel: r.riskLevel,
      description: r.description,
      owner: r.owner,
      mitigationPlan: r.mitigationPlan,
      status: r.status,
      reviewDate: r.reviewDate,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.title.trim()) {
      toast.error("Başlık gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Risk güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Risk eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Risk silindi");
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
            <div className="p-2 rounded-lg bg-orange-100">
              <ShieldCheck className="text-orange-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Risk Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Riskleri olasılık ve etki matrisine göre takip edin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="risk.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Risk Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Risk",
              value: records.length,
              color: "text-indigo-600",
            },
            { label: "Açık Risk", value: openCount, color: "text-red-600" },
            {
              label: "Kritik Risk",
              value: criticalCount,
              color: "text-orange-600",
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
            <SelectTrigger className="w-44" data-ocid="risk.select">
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
              data-ocid="risk.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="risk.empty_state"
            >
              Risk kaydı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Başlık",
                    "Kategori",
                    "Olasılık",
                    "Etki",
                    "Risk Seviyesi",
                    "Sorumlu",
                    "Durum",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-ocid={`risk.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.category}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {probabilityLabels[r.probability] ?? r.probability}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {impactLabels[r.impact] ?? r.impact}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskLevelClass[r.riskLevel] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {riskLevelLabels[r.riskLevel] ?? r.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.owner || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {statusLabels[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            data-ocid={`risk.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`risk.delete_button.${idx + 1}`}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="risk-dialog-desc"
          data-ocid="risk.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Risk Düzenle" : "Yeni Risk Kaydı"}
            </DialogTitle>
            <DialogDescription id="risk-dialog-desc">
              Risk bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) => f("title", e.target.value)}
                placeholder="Risk başlığı"
                data-ocid="risk.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => f("category", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "operational",
                    "financial",
                    "technical",
                    "safety",
                    "environmental",
                    "other",
                  ].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Sorumlu</Label>
              <Input
                value={form.owner}
                onChange={(e) => f("owner", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Olasılık</Label>
              <Select
                value={form.probability}
                onValueChange={(v) => f("probability", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Etki</Label>
              <Select value={form.impact} onValueChange={(v) => f("impact", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Risk Seviyesi</Label>
              <Select
                value={form.riskLevel}
                onValueChange={(v) => f("riskLevel", v)}
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
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Açık</SelectItem>
                  <SelectItem value="inprogress">İşlemde</SelectItem>
                  <SelectItem value="mitigated">Azaltıldı</SelectItem>
                  <SelectItem value="closed">Kapatıldı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Gözden Geçirme Tarihi</Label>
              <Input
                type="date"
                value={form.reviewDate}
                onChange={(e) => f("reviewDate", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Açıklama</Label>
              <Textarea
                value={form.description}
                onChange={(e) => f("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Azaltma Planı</Label>
              <Textarea
                value={form.mitigationPlan}
                onChange={(e) => f("mitigationPlan", e.target.value)}
                rows={2}
                data-ocid="risk.textarea"
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Input
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="risk.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="risk.submit_button"
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
        <DialogContent aria-describedby="risk-del-desc" data-ocid="risk.modal">
          <DialogHeader>
            <DialogTitle>Riski Sil</DialogTitle>
            <DialogDescription id="risk-del-desc">
              Bu risk kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="risk.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="risk.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
