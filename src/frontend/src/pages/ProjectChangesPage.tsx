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
import { GitMerge, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddProjectChange,
  useDeleteProjectChange,
  useGetProjectChanges,
  useUpdateProjectChange,
} from "../hooks/useQueries";
import type { ProjectChangeRecord } from "../types";

const priorityClass: Record<string, string> = {
  Düşük: "bg-gray-100 text-gray-800",
  Orta: "bg-blue-100 text-blue-800",
  Yüksek: "bg-orange-100 text-orange-800",
  Acil: "bg-red-100 text-red-800",
};

const approvalClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
};

const emptyForm = {
  projectName: "",
  changeRequestNo: "",
  changeType: "",
  description: "",
  requester: "",
  requestDate: "",
  impactScope: "",
  impactCost: "",
  impactTime: "",
  priority: "Orta",
  approvalStatus: "Beklemede",
  approvedBy: "",
  implementationDate: "",
  notes: "",
};

export function ProjectChangesPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetProjectChanges(companyId);
  const addMut = useAddProjectChange();
  const updateMut = useUpdateProjectChange();
  const deleteMut = useDeleteProjectChange();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectChangeRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<ProjectChangeRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: ProjectChangeRecord) {
    setEditing(r);
    setForm({
      projectName: r.projectName,
      changeRequestNo: r.changeRequestNo,
      changeType: r.changeType,
      description: r.description,
      requester: r.requester,
      requestDate: r.requestDate,
      impactScope: r.impactScope,
      impactCost: r.impactCost,
      impactTime: r.impactTime,
      priority: r.priority,
      approvalStatus: r.approvalStatus,
      approvedBy: r.approvedBy,
      implementationDate: r.implementationDate,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.projectName || !form.changeRequestNo) {
      toast.error("Proje adı ve talep numarası zorunludur.");
      return;
    }
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...form });
      toast.success("Kayıt güncellendi.");
    } else {
      await addMut.mutateAsync({ companyId: companyId!, ...form });
      toast.success("Kayıt eklendi.");
    }
    setOpen(false);
  }

  async function handleDelete(r: ProjectChangeRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.projectName.toLowerCase().includes(search.toLowerCase()) ||
      r.changeRequestNo.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const pendingCount = records.filter(
    (r) => r.approvalStatus === "Beklemede",
  ).length;
  const approvedCount = records.filter(
    (r) => r.approvalStatus === "Onaylandı",
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
            <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center">
              <GitMerge size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Proje Değişiklik Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Proje değişiklik talepleri ve onay takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="project-changes.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Talep Ekle
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
              label: "Toplam Talep",
              value: totalCount,
              color: "text-indigo-600",
            },
            {
              label: "Onay Bekliyor",
              value: pendingCount,
              color: "text-yellow-600",
            },
            {
              label: "Onaylandı",
              value: approvedCount,
              color: "text-green-600",
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
              placeholder="Proje adı veya talep numarası ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="project-changes.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="project-changes.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="project-changes.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Proje",
                      "Talep No",
                      "Değişiklik Türü",
                      "Talep Eden",
                      "Talep Tarihi",
                      "Öncelik",
                      "Onay Durumu",
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
                      data-ocid={`project-changes.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.projectName}</td>
                      <td className="px-4 py-3">{r.changeRequestNo}</td>
                      <td className="px-4 py-3">{r.changeType}</td>
                      <td className="px-4 py-3">{r.requester}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.requestDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[r.priority] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${approvalClass[r.approvalStatus] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.approvalStatus}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`project-changes.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`project-changes.delete_button.${i + 1}`}
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
            data-ocid="project-changes.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Talep Düzenle" : "Değişiklik Talebi Ekle"}
              </DialogTitle>
              <DialogDescription>
                Proje değişiklik talep bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Proje Adı *</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) => sf("projectName", e.target.value)}
                  data-ocid="project-changes.input"
                />
              </div>
              <div>
                <Label>Talep No *</Label>
                <Input
                  value={form.changeRequestNo}
                  onChange={(e) => sf("changeRequestNo", e.target.value)}
                />
              </div>
              <div>
                <Label>Değişiklik Türü</Label>
                <Input
                  value={form.changeType}
                  onChange={(e) => sf("changeType", e.target.value)}
                />
              </div>
              <div>
                <Label>Talep Eden</Label>
                <Input
                  value={form.requester}
                  onChange={(e) => sf("requester", e.target.value)}
                />
              </div>
              <div>
                <Label>Talep Tarihi</Label>
                <Input
                  type="date"
                  value={form.requestDate}
                  onChange={(e) => sf("requestDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Etki Kapsamı</Label>
                <Input
                  value={form.impactScope}
                  onChange={(e) => sf("impactScope", e.target.value)}
                />
              </div>
              <div>
                <Label>Maliyet Etkisi</Label>
                <Input
                  value={form.impactCost}
                  onChange={(e) => sf("impactCost", e.target.value)}
                />
              </div>
              <div>
                <Label>Süre Etkisi</Label>
                <Input
                  value={form.impactTime}
                  onChange={(e) => sf("impactTime", e.target.value)}
                />
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => sf("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Acil"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Onay Durumu</Label>
                <Select
                  value={form.approvalStatus}
                  onValueChange={(v) => sf("approvalStatus", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beklemede", "Onaylandı", "Reddedildi"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Onaylayan</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) => sf("approvedBy", e.target.value)}
                />
              </div>
              <div>
                <Label>Uygulama Tarihi</Label>
                <Input
                  type="date"
                  value={form.implementationDate}
                  onChange={(e) => sf("implementationDate", e.target.value)}
                />
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
                data-ocid="project-changes.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="project-changes.submit_button"
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
                {deleteConfirm?.projectName} - {deleteConfirm?.changeRequestNo}{" "}
                talebini silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="project-changes.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="project-changes.confirm_button"
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
