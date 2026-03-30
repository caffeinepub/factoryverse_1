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
import { AlertTriangle, Award, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMaterialCert,
  useDeleteMaterialCert,
  useGetMaterialCerts,
  useUpdateMaterialCert,
} from "../hooks/useQueries";
import type { MaterialCertRecord } from "../types";

const emptyForm = {
  materialName: "",
  materialCode: "",
  supplier: "",
  certType: "CE",
  certNumber: "",
  issueDate: "",
  expiryDate: "",
  standard: "",
  issuedBy: "",
  status: "Geçerli",
  description: "",
  notes: "",
};

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function MaterialCertPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetMaterialCerts(companyId);
  const addMut = useAddMaterialCert();
  const updateMut = useUpdateMaterialCert();
  const deleteMut = useDeleteMaterialCert();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaterialCertRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<MaterialCertRecord | null>(
    null,
  );

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: MaterialCertRecord) {
    setEditing(r);
    setForm({
      materialName: r.materialName,
      materialCode: r.materialCode,
      supplier: r.supplier,
      certType: r.certType,
      certNumber: r.certNumber,
      issueDate: r.issueDate,
      expiryDate: r.expiryDate,
      standard: r.standard,
      issuedBy: r.issuedBy,
      status: r.status,
      description: r.description,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.materialName) {
      toast.error("Malzeme adı zorunludur.");
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

  async function handleDelete(r: MaterialCertRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const expiringSoon = records.filter((r) => {
    const d = daysUntil(r.expiryDate);
    return d !== null && d >= 0 && d <= 30;
  }).length;
  const expired = records.filter((r) => {
    const d = daysUntil(r.expiryDate);
    return d !== null && d < 0;
  }).length;

  function expiryClass(dateStr: string) {
    const d = daysUntil(dateStr);
    if (d === null) return "text-gray-500";
    if (d < 0) return "text-red-600 font-semibold";
    if (d <= 30) return "text-yellow-600 font-semibold";
    return "text-gray-700";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Award className="text-orange-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Malzeme Sertifika Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Malzeme uygunluk sertifikaları ve son tarih takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="material-cert.primary_button"
            >
              <Plus size={16} className="mr-1" /> Sertifika Ekle
            </Button>
          )}
        </div>

        {expiringSoon > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
            <AlertTriangle size={16} />
            <span>
              {expiringSoon} sertifikanın geçerlilik süresi 30 gün içinde
              dolacak.
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Sertifika", val: records.length, color: "indigo" },
            { label: "Yakında Dolacak", val: expiringSoon, color: "yellow" },
            { label: "Süresi Geçmiş", val: expired, color: "red" },
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
              data-ocid="material-cert.empty_state"
            >
              Henüz sertifika kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Malzeme",
                      "Kod",
                      "Tedarikçi",
                      "Sertifika Türü",
                      "Sertifika No",
                      "Standart",
                      "Düzenleme",
                      "Son Geçerlilik",
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
                      data-ocid={`material-cert.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.materialName}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {r.materialCode || "—"}
                      </td>
                      <td className="px-4 py-3">{r.supplier || "—"}</td>
                      <td className="px-4 py-3">{r.certType}</td>
                      <td className="px-4 py-3">{r.certNumber || "—"}</td>
                      <td className="px-4 py-3">{r.standard || "—"}</td>
                      <td className="px-4 py-3">{r.issueDate || "—"}</td>
                      <td className={`px-4 py-3 ${expiryClass(r.expiryDate)}`}>
                        {r.expiryDate || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            r.status === "Geçerli"
                              ? "bg-green-100 text-green-800"
                              : r.status === "Süresi Geçmiş"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
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
                              data-ocid={`material-cert.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`material-cert.delete_button.${i + 1}`}
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
            data-ocid="material-cert.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Sertifika Düzenle" : "Sertifika Ekle"}
              </DialogTitle>
              <DialogDescription>
                Malzeme sertifikası bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Malzeme Adı *</Label>
                <Input
                  value={form.materialName}
                  onChange={(e) => sf("materialName", e.target.value)}
                  data-ocid="material-cert.input"
                />
              </div>
              <div>
                <Label>Malzeme Kodu</Label>
                <Input
                  value={form.materialCode}
                  onChange={(e) => sf("materialCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Tedarikçi</Label>
                <Input
                  value={form.supplier}
                  onChange={(e) => sf("supplier", e.target.value)}
                />
              </div>
              <div>
                <Label>Sertifika Türü</Label>
                <Select
                  value={form.certType}
                  onValueChange={(v) => sf("certType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "CE",
                      "ISO",
                      "TSE",
                      "RoHS",
                      "REACH",
                      "Malzeme Test",
                      "Kaynak",
                      "Diğer",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sertifika No</Label>
                <Input
                  value={form.certNumber}
                  onChange={(e) => sf("certNumber", e.target.value)}
                />
              </div>
              <div>
                <Label>Standart</Label>
                <Input
                  value={form.standard}
                  placeholder="EN ISO 9001"
                  onChange={(e) => sf("standard", e.target.value)}
                />
              </div>
              <div>
                <Label>Düzenleyen Kurum</Label>
                <Input
                  value={form.issuedBy}
                  onChange={(e) => sf("issuedBy", e.target.value)}
                />
              </div>
              <div>
                <Label>Düzenleme Tarihi</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => sf("issueDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Son Geçerlilik Tarihi</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => sf("expiryDate", e.target.value)}
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
                    {["Geçerli", "Yenileniyor", "Süresi Geçmiş"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => sf("description", e.target.value)}
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
                data-ocid="material-cert.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="material-cert.submit_button"
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
              <DialogTitle>Sertifikayı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.materialName} sertifikasını silmek
                istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="material-cert.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="material-cert.confirm_button"
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
