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
  useAddAudit,
  useDeleteAudit,
  useGetAudits,
  useUpdateAudit,
} from "../hooks/useQueries";
import type { AuditRecord } from "../types";

const auditTypeLabels: Record<string, string> = {
  internal: "İç Denetim",
  external: "Dış Denetim",
  regulatory: "Yasal Denetim",
  certification: "Sertifikasyon",
};

const auditTypeClass: Record<string, string> = {
  internal: "bg-indigo-100 text-indigo-800",
  external: "bg-purple-100 text-purple-800",
  regulatory: "bg-red-100 text-red-800",
  certification: "bg-green-100 text-green-800",
};

const resultLabels: Record<string, string> = {
  passed: "Geçti",
  failed: "Kaldı",
  conditional: "Koşullu",
};

const resultClass: Record<string, string> = {
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  conditional: "bg-yellow-100 text-yellow-800",
};

const statusLabels: Record<string, string> = {
  planned: "Planlandı",
  inprogress: "Devam Ediyor",
  completed: "Tamamlandı",
  closed: "Kapatıldı",
};

const statusClass: Record<string, string> = {
  planned: "bg-gray-100 text-gray-700",
  inprogress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  closed: "bg-slate-100 text-slate-700",
};

const emptyForm = {
  title: "",
  auditType: "internal",
  auditor: "",
  auditDate: "",
  scope: "",
  result: "passed",
  findingsCount: "0",
  correctiveActions: "",
  dueDate: "",
  status: "planned",
  notes: "",
};

export function AuditsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetAudits(userCode);
  const addAudit = useAddAudit();
  const updateAudit = useUpdateAudit();
  const deleteAudit = useDeleteAudit();

  const [filterType, setFilterType] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<AuditRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = records.filter((r) =>
    filterType === "all" ? true : r.auditType === filterType,
  );

  const passedCount = records.filter((r) => r.result === "passed").length;
  const pendingCount = records.filter(
    (r) => r.status === "planned" || r.status === "inprogress",
  ).length;

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: AuditRecord) {
    setEditItem(r);
    setForm({
      title: r.title,
      auditType: r.auditType,
      auditor: r.auditor,
      auditDate: r.auditDate,
      scope: r.scope,
      result: r.result,
      findingsCount: r.findingsCount,
      correctiveActions: r.correctiveActions,
      dueDate: r.dueDate,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.title.trim() || !form.auditor.trim()) {
      toast.error("Başlık ve denetçi gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateAudit.mutateAsync({
          adminCode,
          auditId: editItem.id,
          ...form,
        });
        toast.success("Denetim güncellendi");
      } else {
        await addAudit.mutateAsync({ adminCode, ...form });
        toast.success("Denetim eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAudit.mutateAsync({ adminCode, auditId: deleteTarget });
      toast.success("Denetim silindi");
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
              <ClipboardCheck className="text-purple-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Denetim & Teftiş Takibi
              </h1>
              <p className="text-sm text-gray-500">
                İç ve dış denetimlerinizi yönetin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="audits.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Denetim Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Denetim",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Geçti",
              value: passedCount,
              color: "text-green-600",
            },
            {
              label: "Bekleyen / Devam Eden",
              value: pendingCount,
              color: "text-amber-600",
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44" data-ocid="audits.select">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              {Object.entries(auditTypeLabels).map(([k, v]) => (
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
              data-ocid="audits.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="audits.empty_state"
            >
              Denetim kaydı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Başlık",
                    "Tür",
                    "Denetçi",
                    "Denetim Tarihi",
                    "Kapsam",
                    "Sonuç",
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
                    data-ocid={`audits.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.title}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          auditTypeClass[r.auditType] ??
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {auditTypeLabels[r.auditType] ?? r.auditType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.auditor}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.auditDate || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {r.scope || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          resultClass[r.result] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {resultLabels[r.result] ?? r.result}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          statusClass[r.status] ?? "bg-gray-100 text-gray-700"
                        }`}
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
                            data-ocid={`audits.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`audits.delete_button.${idx + 1}`}
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
          aria-describedby="audit-dialog-desc"
          data-ocid="audits.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Denetim Düzenle" : "Yeni Denetim Kaydı"}
            </DialogTitle>
            <DialogDescription id="audit-dialog-desc">
              Denetim bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Başlık *</Label>
              <Input
                value={form.title}
                onChange={(e) => f("title", e.target.value)}
                placeholder="Denetim başlığı"
                data-ocid="audits.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Denetim Türü</Label>
              <Select
                value={form.auditType}
                onValueChange={(v) => f("auditType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(auditTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Denetçi *</Label>
              <Input
                value={form.auditor}
                onChange={(e) => f("auditor", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Denetim Tarihi</Label>
              <Input
                type="date"
                value={form.auditDate}
                onChange={(e) => f("auditDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Bitiş / Son Tarih</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => f("dueDate", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Kapsam</Label>
              <Input
                value={form.scope}
                onChange={(e) => f("scope", e.target.value)}
                placeholder="Denetim kapsamı"
              />
            </div>
            <div className="space-y-1">
              <Label>Sonuç</Label>
              <Select value={form.result} onValueChange={(v) => f("result", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passed">Geçti</SelectItem>
                  <SelectItem value="failed">Kaldı</SelectItem>
                  <SelectItem value="conditional">Koşullu</SelectItem>
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
                  <SelectItem value="planned">Planlandı</SelectItem>
                  <SelectItem value="inprogress">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="closed">Kapatıldı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Bulgu Sayısı</Label>
              <Input
                type="number"
                value={form.findingsCount}
                onChange={(e) => f("findingsCount", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Düzeltici Eylemler</Label>
              <Input
                value={form.correctiveActions}
                onChange={(e) => f("correctiveActions", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="audits.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="audits.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addAudit.isPending || updateAudit.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="audits.submit_button"
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
          aria-describedby="audit-del-desc"
          data-ocid="audits.modal"
        >
          <DialogHeader>
            <DialogTitle>Denetimi Sil</DialogTitle>
            <DialogDescription id="audit-del-desc">
              Bu denetim kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="audits.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteAudit.isPending}
              data-ocid="audits.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
