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
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddFieldAudit,
  useDeleteFieldAudit,
  useGetFieldAudits,
  useUpdateFieldAudit,
} from "../hooks/useQueries";
import type { FieldAuditRecord } from "../types";

const riskClass: Record<string, string> = {
  Düşük: "bg-green-100 text-green-800",
  Orta: "bg-yellow-100 text-yellow-800",
  Yüksek: "bg-orange-100 text-orange-800",
  Kritik: "bg-red-100 text-red-800",
};

const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Kapalı: "bg-green-100 text-green-800",
};

const emptyForm = {
  auditDate: "",
  location: "",
  auditType: "Güvenlik",
  auditor: "",
  department: "",
  checklistScore: "",
  maxScore: "",
  nonConformityCount: "",
  riskLevel: "Orta",
  findings: "",
  correctiveActionDeadline: "",
  status: "Açık",
  notes: "",
};

export function FieldAuditPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetFieldAudits(companyId);
  const addMut = useAddFieldAudit();
  const updateMut = useUpdateFieldAudit();
  const deleteMut = useDeleteFieldAudit();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FieldAuditRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<FieldAuditRecord | null>(
    null,
  );

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: FieldAuditRecord) {
    setEditing(r);
    setForm({
      auditDate: r.auditDate,
      location: r.location,
      auditType: r.auditType,
      auditor: r.auditor,
      department: r.department,
      checklistScore: r.checklistScore,
      maxScore: r.maxScore,
      nonConformityCount: r.nonConformityCount,
      riskLevel: r.riskLevel,
      findings: r.findings,
      correctiveActionDeadline: r.correctiveActionDeadline,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.auditDate || !form.location) {
      toast.error("Tarih ve lokasyon zorunludur.");
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

  async function handleDelete(r: FieldAuditRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const openCount = records.filter((r) => r.status === "Açık").length;
  const criticalCount = records.filter((r) => r.riskLevel === "Kritik").length;

  function scoreDisplay(score: string, max: string) {
    const s = Number(score);
    const m = Number(max);
    if (!m) return score || "—";
    const pct = Math.round((s / m) * 100);
    return `${s}/${m} (%${pct})`;
  }

  function deadlineColor(deadline: string) {
    if (!deadline) return "";
    const today = new Date();
    const d = new Date(deadline);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-red-600 font-medium";
    if (diff <= 7) return "text-orange-500 font-medium";
    return "";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Search className="text-orange-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Saha Denetim Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Saha denetim bulguları ve aksiyon takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="field-audits.primary_button"
            >
              <Plus size={16} className="mr-1" /> Denetim Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Denetim", val: records.length, color: "indigo" },
            { label: "Açık", val: openCount, color: "red" },
            { label: "Kritik Risk", val: criticalCount, color: "orange" },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>
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
              data-ocid="field-audits.empty_state"
            >
              Henüz saha denetimi yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Tarih",
                      "Lokasyon",
                      "Tür",
                      "Denetçi",
                      "Skor",
                      "Uygunsuzluk",
                      "Risk",
                      "Aksiyon Tarihi",
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
                      data-ocid={`field-audits.item.${i + 1}`}
                    >
                      <td className="px-4 py-3">{r.auditDate}</td>
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-4 py-3">{r.auditType}</td>
                      <td className="px-4 py-3">{r.auditor || "—"}</td>
                      <td className="px-4 py-3">
                        {scoreDisplay(r.checklistScore, r.maxScore)}
                      </td>
                      <td className="px-4 py-3">
                        {r.nonConformityCount || "0"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            riskClass[r.riskLevel] ?? "bg-gray-100"
                          }`}
                        >
                          {r.riskLevel}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 ${deadlineColor(r.correctiveActionDeadline)}`}
                      >
                        {r.correctiveActionDeadline || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            statusClass[r.status] ?? "bg-gray-100"
                          }`}
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
                              data-ocid={`field-audits.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`field-audits.delete_button.${i + 1}`}
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
            data-ocid="field-audits.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Denetim Düzenle" : "Saha Denetimi Ekle"}
              </DialogTitle>
              <DialogDescription>
                Saha denetim bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Denetim Tarihi *</Label>
                <Input
                  type="date"
                  value={form.auditDate}
                  onChange={(e) => sf("auditDate", e.target.value)}
                  data-ocid="field-audits.input"
                />
              </div>
              <div>
                <Label>Lokasyon *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                />
              </div>
              <div>
                <Label>Denetim Türü</Label>
                <Select
                  value={form.auditType}
                  onValueChange={(v) => sf("auditType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Güvenlik", "Çevre", "Kalite", "Süreç", "5S"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Denetçi</Label>
                <Input
                  value={form.auditor}
                  onChange={(e) => sf("auditor", e.target.value)}
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Checklist Puanı</Label>
                <Input
                  value={form.checklistScore}
                  onChange={(e) => sf("checklistScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Maksimum Puan</Label>
                <Input
                  value={form.maxScore}
                  onChange={(e) => sf("maxScore", e.target.value)}
                />
              </div>
              <div>
                <Label>Uygunsuzluk Sayısı</Label>
                <Input
                  value={form.nonConformityCount}
                  onChange={(e) => sf("nonConformityCount", e.target.value)}
                />
              </div>
              <div>
                <Label>Risk Seviyesi</Label>
                <Select
                  value={form.riskLevel}
                  onValueChange={(v) => sf("riskLevel", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Kritik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aksiyon Son Tarihi</Label>
                <Input
                  type="date"
                  value={form.correctiveActionDeadline}
                  onChange={(e) =>
                    sf("correctiveActionDeadline", e.target.value)
                  }
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
                    {["Açık", "Devam Ediyor", "Kapalı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Bulgular</Label>
                <Textarea
                  value={form.findings}
                  onChange={(e) => sf("findings", e.target.value)}
                  rows={2}
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
                data-ocid="field-audits.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="field-audits.submit_button"
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
              <DialogTitle>Denetim Kaydını Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.location} - {deleteConfirm?.auditDate} kaydını
                silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="field-audits.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="field-audits.confirm_button"
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
