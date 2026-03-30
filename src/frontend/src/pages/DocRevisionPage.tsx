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
import { FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddDocRevision,
  useDeleteDocRevision,
  useGetDocRevisions,
  useUpdateDocRevision,
} from "../hooks/useQueries";
import type { DocRevisionRecord } from "../types";

const statusClass: Record<string, string> = {
  Taslak: "bg-gray-100 text-gray-700",
  İncelemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
  Yürürlükte: "bg-indigo-100 text-indigo-800",
  Arşivlendi: "bg-slate-100 text-slate-700",
};

const emptyForm = {
  docTitle: "",
  docCode: "",
  revisionNo: "",
  revisionDate: "",
  preparedBy: "",
  reviewedBy: "",
  approvedBy: "",
  changesSummary: "",
  department: "",
  category: "",
  status: "Taslak",
  notes: "",
};

export function DocRevisionPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetDocRevisions(companyId);
  const addMut = useAddDocRevision();
  const updateMut = useUpdateDocRevision();
  const deleteMut = useDeleteDocRevision();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DocRevisionRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<DocRevisionRecord | null>(
    null,
  );
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: DocRevisionRecord) {
    setEditing(r);
    setForm({
      docTitle: r.docTitle,
      docCode: r.docCode,
      revisionNo: r.revisionNo,
      revisionDate: r.revisionDate,
      preparedBy: r.preparedBy,
      reviewedBy: r.reviewedBy,
      approvedBy: r.approvedBy,
      changesSummary: r.changesSummary,
      department: r.department,
      category: r.category,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.docTitle || !form.revisionDate) {
      toast.error("Doküman adı ve tarih zorunludur.");
      return;
    }
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...form });
      toast.success("Kayıt güncellendi.");
    } else {
      await addMut.mutateAsync({ companyId: companyId!, ...form });
      toast.success("Revizyon eklendi.");
    }
    setOpen(false);
  }

  async function handleDelete(r: DocRevisionRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.docTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.docCode.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const approvedCount = records.filter(
    (r) => r.status === "Onaylandı" || r.status === "Yürürlükte",
  ).length;
  const draftCount = records.filter(
    (r) => r.status === "Taslak" || r.status === "İncelemede",
  ).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Doküman Revizyon Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Doküman revizyon geçmişi ve onay durumu
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="doc-revision.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Revizyon Ekle
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Toplam Doküman",
              value: totalCount,
              color: "text-indigo-600",
            },
            {
              label: "Onaylı / Yürürlükte",
              value: approvedCount,
              color: "text-green-600",
            },
            {
              label: "Taslak / İncelemede",
              value: draftCount,
              color: "text-yellow-600",
            },
          ].map((c) => (
            <div
              key={c.label}
              className="bg-white rounded-xl border p-4 shadow-sm"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border shadow-sm"
        >
          <div className="p-4 border-b flex items-center gap-2">
            <Search size={16} className="text-gray-400" />
            <Input
              placeholder="Doküman adı veya kod ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="doc-revision.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="doc-revision.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="doc-revision.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Doküman Adı",
                      "Kod",
                      "Rev No",
                      "Tarih",
                      "Hazırlayan",
                      "Onaylayan",
                      "Departman",
                      "Durum",
                      "",
                    ].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50"
                      data-ocid={`doc-revision.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.docTitle}</td>
                      <td className="px-4 py-3 text-gray-500">{r.docCode}</td>
                      <td className="px-4 py-3">{r.revisionNo}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.revisionDate}
                      </td>
                      <td className="px-4 py-3">{r.preparedBy}</td>
                      <td className="px-4 py-3">{r.approvedBy}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`doc-revision.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`doc-revision.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
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

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="doc-revision.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Revizyon Düzenle" : "Revizyon Ekle"}
              </DialogTitle>
              <DialogDescription>
                Doküman revizyon bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Doküman Adı *</Label>
                <Input
                  value={form.docTitle}
                  onChange={(e) => sf("docTitle", e.target.value)}
                  data-ocid="doc-revision.input"
                />
              </div>
              <div>
                <Label>Doküman Kodu</Label>
                <Input
                  value={form.docCode}
                  onChange={(e) => sf("docCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Revizyon No</Label>
                <Input
                  value={form.revisionNo}
                  onChange={(e) => sf("revisionNo", e.target.value)}
                  placeholder="Rev.01"
                />
              </div>
              <div>
                <Label>Revizyon Tarihi *</Label>
                <Input
                  type="date"
                  value={form.revisionDate}
                  onChange={(e) => sf("revisionDate", e.target.value)}
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
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => sf("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Prosedür",
                      "Talimat",
                      "Form",
                      "Politika",
                      "Teknik Doküman",
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
                <Label>Hazırlayan</Label>
                <Input
                  value={form.preparedBy}
                  onChange={(e) => sf("preparedBy", e.target.value)}
                />
              </div>
              <div>
                <Label>İnceleyen</Label>
                <Input
                  value={form.reviewedBy}
                  onChange={(e) => sf("reviewedBy", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Onaylayan</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) => sf("approvedBy", e.target.value)}
                />
              </div>
              <div className="col-span-2">
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
                      "Taslak",
                      "İncelemede",
                      "Onaylandı",
                      "Reddedildi",
                      "Yürürlükte",
                      "Arşivlendi",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Değişiklik Özeti</Label>
                <Textarea
                  value={form.changesSummary}
                  onChange={(e) => sf("changesSummary", e.target.value)}
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
                data-ocid="doc-revision.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="doc-revision.submit_button"
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
              <DialogTitle>Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.docTitle} - Rev {deleteConfirm?.revisionNo}{" "}
                kaydını silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="doc-revision.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="doc-revision.confirm_button"
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
