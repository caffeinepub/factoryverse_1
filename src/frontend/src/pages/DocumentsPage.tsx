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
import { useQueryClient } from "@tanstack/react-query";
import { Archive, FileText, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { useGetDocuments } from "../hooks/useQueries";
import type { Document } from "../types";

const categoryOptions = [
  "Teknik Çizim",
  "İzin/Ruhsat",
  "Sözleşme",
  "Kullanım Kılavuzu",
  "Rapor",
  "Diğer",
];

const categoryColors: Record<string, string> = {
  "Teknik Çizim": "bg-blue-100 text-blue-700",
  "İzin/Ruhsat": "bg-orange-100 text-orange-700",
  Sözleşme: "bg-purple-100 text-purple-700",
  "Kullanım Kılavuzu": "bg-teal-100 text-teal-700",
  Rapor: "bg-indigo-100 text-indigo-700",
  Diğer: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  name: "",
  category: "Teknik Çizim",
  documentType: "",
  referenceNumber: "",
  date: "",
  description: "",
  linkedMachineId: "",
  linkedProjectId: "",
};

export function DocumentsPage() {
  const { session } = useAuth();
  const { actor } = useActor();
  const qc = useQueryClient();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: docs = [], isLoading } = useGetDocuments(userCode);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Document | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalDocs = docs.length;
  const activeDocs = docs.filter((d) => d.status === "active").length;
  const archivedDocs = docs.filter((d) => d.status === "archived").length;

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (doc: Document) => {
    setEditTarget(doc);
    setForm({
      name: doc.name,
      category: doc.category,
      documentType: doc.documentType,
      referenceNumber: doc.referenceNumber,
      date: doc.date,
      description: doc.description,
      linkedMachineId: doc.linkedMachineId,
      linkedProjectId: doc.linkedProjectId,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!actor || !adminCode) return;
    if (!form.name.trim()) {
      toast.error("Belge adı zorunludur");
      return;
    }
    setSaving(true);
    try {
      if (editTarget) {
        await (actor as any).updateDocument(
          adminCode,
          editTarget.id,
          form.name,
          form.category,
          form.documentType,
          form.referenceNumber,
          form.date,
          form.description,
          form.linkedMachineId,
          form.linkedProjectId,
          editTarget.status,
        );
        toast.success("Belge güncellendi");
      } else {
        await (actor as any).addDocument(
          adminCode,
          form.name,
          form.category,
          form.documentType,
          form.referenceNumber,
          form.date,
          form.description,
          form.linkedMachineId,
          form.linkedProjectId,
        );
        toast.success("Belge eklendi");
      }
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDialogOpen(false);
    } catch {
      toast.error("İşlem başarısız");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !adminCode || !deleteId) return;
    setDeleting(true);
    try {
      await (actor as any).deleteDocument(adminCode, deleteId);
      toast.success("Belge silindi");
      qc.invalidateQueries({ queryKey: ["documents"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
      setDeleteId(null);
    } catch {
      toast.error("Silme başarısız");
    } finally {
      setDeleting(false);
    }
  };

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                Doküman Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Teknik belgeler ve dokümanlar
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="documents.primary_button"
            >
              <Plus size={16} className="mr-2" />
              Belge Ekle
            </Button>
          )}
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-sm text-gray-500 mb-1">Toplam Belge</div>
            <div className="text-3xl font-bold text-gray-900">{totalDocs}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="text-sm text-gray-500 mb-1">Aktif</div>
            <div className="text-3xl font-bold text-green-600">
              {activeDocs}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Archive size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500">Arşiv</span>
            </div>
            <div className="text-3xl font-bold text-gray-400">
              {archivedDocs}
            </div>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {isLoading ? (
            <div
              className="flex items-center justify-center py-16 text-gray-400"
              data-ocid="documents.loading_state"
            >
              <Loader2 size={24} className="animate-spin mr-2" />
              Yükleniyor...
            </div>
          ) : docs.length === 0 ? (
            <div
              className="text-center py-16 text-gray-400"
              data-ocid="documents.empty_state"
            >
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Henüz belge yok</p>
              {isAdmin && (
                <p className="text-sm mt-1">
                  İlk belgeyi eklemek için yukarıdaki butona tıklayın
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="documents.table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Belge Adı
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Tür
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Referans No
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Tarih
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    {isAdmin && (
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        İşlem
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {docs.map((doc, idx) => (
                    <tr
                      key={doc.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      data-ocid={`documents.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 text-sm">
                          {doc.name}
                        </div>
                        {doc.description && (
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {doc.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            categoryColors[doc.category] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {doc.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">
                        {doc.documentType || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {doc.referenceNumber || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                        {doc.date || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            doc.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {doc.status === "active" ? "Aktif" : "Arşiv"}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => openEdit(doc)}
                              data-ocid={`documents.edit_button.${idx + 1}`}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(doc.id)}
                              data-ocid={`documents.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => !o && setDialogOpen(false)}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="documents.dialog"
          aria-describedby="documents-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Belge Düzenle" : "Yeni Belge Ekle"}
            </DialogTitle>
            <DialogDescription id="documents-dialog-description">
              Belge bilgilerini doldurun
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="doc-name">Belge Adı *</Label>
              <Input
                id="doc-name"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Belge adı"
                data-ocid="documents.input"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Kategori</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setField("category", v)}
              >
                <SelectTrigger data-ocid="documents.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="doc-type">Belge Türü</Label>
                <Input
                  id="doc-type"
                  value={form.documentType}
                  onChange={(e) => setField("documentType", e.target.value)}
                  placeholder="PDF, AutoCAD..."
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="doc-ref">Referans No</Label>
                <Input
                  id="doc-ref"
                  value={form.referenceNumber}
                  onChange={(e) => setField("referenceNumber", e.target.value)}
                  placeholder="REF-001"
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="doc-date">Tarih</Label>
              <Input
                id="doc-date"
                type="date"
                value={form.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="doc-desc">Açıklama</Label>
              <Textarea
                id="doc-desc"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Belge açıklaması"
                rows={3}
                data-ocid="documents.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="doc-machine">Bağlı Makine ID</Label>
                <Input
                  id="doc-machine"
                  value={form.linkedMachineId}
                  onChange={(e) => setField("linkedMachineId", e.target.value)}
                  placeholder="Opsiyonel"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="doc-project">Bağlı Proje ID</Label>
                <Input
                  id="doc-project"
                  value={form.linkedProjectId}
                  onChange={(e) => setField("linkedProjectId", e.target.value)}
                  placeholder="Opsiyonel"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="documents.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="documents.submit_button"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editTarget ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent
          data-ocid="documents.modal"
          aria-describedby="documents-delete-description"
        >
          <DialogHeader>
            <DialogTitle>Belgeyi Sil</DialogTitle>
            <DialogDescription id="documents-delete-description">
              Bu belge kalıcı olarak silinecek. Devam etmek istiyor musunuz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="documents.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              data-ocid="documents.confirm_button"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
