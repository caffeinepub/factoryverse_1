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
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddInspectionRecord,
  useDeleteInspectionRecord,
  useGetInspectionRecords,
  useUpdateInspectionRecord,
} from "../hooks/useQueries";
import type { InspectionRecord } from "../types";

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  "Devam Ediyor": "bg-blue-100 text-blue-800",
  Planlandı: "bg-gray-100 text-gray-700",
  "Aksiyon Bekliyor": "bg-orange-100 text-orange-800",
  Kapatıldı: "bg-purple-100 text-purple-800",
};

const riskClass: Record<string, string> = {
  Kritik: "bg-red-100 text-red-800",
  Yüksek: "bg-orange-100 text-orange-800",
  Orta: "bg-yellow-100 text-yellow-800",
  Düşük: "bg-green-100 text-green-800",
};

const emptyForm = {
  inspectionTitle: "",
  inspectionType: "İç Denetim",
  location: "",
  inspectionDate: "",
  inspector: "",
  scope: "",
  findings: "",
  riskLevel: "Orta",
  correctiveActions: "",
  deadline: "",
  responsiblePerson: "",
  status: "Tamamlandı",
  notes: "",
};

export function InspectionManagementPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetInspectionRecords(companyId);
  const addMut = useAddInspectionRecord();
  const updateMut = useUpdateInspectionRecord();
  const deleteMut = useDeleteInspectionRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InspectionRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<InspectionRecord | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: InspectionRecord) {
    setEditing(r);
    setForm({
      inspectionTitle: r.inspectionTitle,
      inspectionType: r.inspectionType,
      location: r.location,
      inspectionDate: r.inspectionDate,
      inspector: r.inspector,
      scope: r.scope,
      findings: r.findings,
      riskLevel: r.riskLevel,
      correctiveActions: r.correctiveActions,
      deadline: r.deadline,
      responsiblePerson: r.responsiblePerson,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.inspectionTitle) {
      toast.error("Muayene başlığı zorunludur.");
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

  async function handleDelete(r: InspectionRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const criticalCount = records.filter(
    (r) => r.riskLevel === "Kritik" || r.riskLevel === "Yüksek",
  ).length;
  const actionPending = records.filter(
    (r) => r.status === "Aksiyon Bekliyor",
  ).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <Search className="text-sky-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Muayene & Gözetim Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                İç/dış muayene ve gözetim kayıtları, bulgular, aksiyon takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="inspection.primary_button"
            >
              <Plus size={16} className="mr-1" /> Muayene Ekle
            </Button>
          )}
        </div>

        {(criticalCount > 0 || actionPending > 0) && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {criticalCount > 0 &&
                `${criticalCount} yüksek/kritik riskli bulgu`}
              {criticalCount > 0 && actionPending > 0 ? " · " : ""}
              {actionPending > 0 && `${actionPending} aksiyon bekliyor`}
            </span>
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Toplam Kayıt", val: records.length, color: "indigo" },
            {
              label: "Tamamlandı",
              val: records.filter((r) => r.status === "Tamamlandı").length,
              color: "green",
            },
            { label: "Aksiyon Bekliyor", val: actionPending, color: "orange" },
            { label: "Kritik/Yüksek Risk", val: criticalCount, color: "red" },
          ].map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold text-${c.color}-600`}>
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
              data-ocid="inspection.empty_state"
            >
              Henüz muayene kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Başlık",
                      "Tür",
                      "Lokasyon",
                      "Tarih",
                      "Denetçi",
                      "Risk Seviyesi",
                      "Son Tarih",
                      "Sorumlu",
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
                      data-ocid={`inspection.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.inspectionTitle}
                      </td>
                      <td className="px-4 py-3 text-xs">{r.inspectionType}</td>
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-4 py-3 text-xs">{r.inspectionDate}</td>
                      <td className="px-4 py-3">{r.inspector}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskClass[r.riskLevel] ?? "bg-gray-100"}`}
                        >
                          {r.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{r.deadline}</td>
                      <td className="px-4 py-3">{r.responsiblePerson}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
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
                              data-ocid={`inspection.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`inspection.delete_button.${i + 1}`}
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
            data-ocid="inspection.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Muayene Düzenle" : "Muayene Ekle"}
              </DialogTitle>
              <DialogDescription>
                Muayene ve gözetim bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Muayene Başlığı *</Label>
                <Input
                  value={form.inspectionTitle}
                  onChange={(e) => sf("inspectionTitle", e.target.value)}
                  data-ocid="inspection.input"
                />
              </div>
              <div>
                <Label>Muayene Türü</Label>
                <Select
                  value={form.inspectionType}
                  onValueChange={(v) => sf("inspectionType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "İç Denetim",
                      "Dış Denetim",
                      "Teknik Muayene",
                      "Güvenlik Denetimi",
                      "Çevre Denetimi",
                      "Kalite Denetimi",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lokasyon</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                />
              </div>
              <div>
                <Label>Muayene Tarihi</Label>
                <Input
                  type="date"
                  value={form.inspectionDate}
                  onChange={(e) => sf("inspectionDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Denetçi</Label>
                <Input
                  value={form.inspector}
                  onChange={(e) => sf("inspector", e.target.value)}
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
                    {["Kritik", "Yüksek", "Orta", "Düşük"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aksiyon Son Tarihi</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => sf("deadline", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsiblePerson}
                  onChange={(e) => sf("responsiblePerson", e.target.value)}
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
                    {[
                      "Tamamlandı",
                      "Devam Ediyor",
                      "Planlandı",
                      "Aksiyon Bekliyor",
                      "Kapatıldı",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Kapsam</Label>
                <Textarea
                  value={form.scope}
                  onChange={(e) => sf("scope", e.target.value)}
                  rows={2}
                />
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
                <Label>Düzeltici Aksiyonlar</Label>
                <Textarea
                  value={form.correctiveActions}
                  onChange={(e) => sf("correctiveActions", e.target.value)}
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
                data-ocid="inspection.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="inspection.submit_button"
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
              <DialogTitle>Muayene Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.inspectionTitle} kaydını silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
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
