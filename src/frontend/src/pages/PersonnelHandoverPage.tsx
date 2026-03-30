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
import { Pencil, Plus, Search, Trash2, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddPersonnelHandover,
  useDeletePersonnelHandover,
  useGetPersonnelHandovers,
  useUpdatePersonnelHandover,
} from "../hooks/useQueries";
import type { PersonnelHandoverRecord } from "../types";

const statusClass: Record<string, string> = {
  Planlandı: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  handoverDate: "",
  leavingEmployee: "",
  leavingPosition: "",
  receivingEmployee: "",
  receivingPosition: "",
  department: "",
  handoverType: "Görev Devri",
  tasksSummary: "",
  pendingTasks: "",
  keyContacts: "",
  handoverDocs: "",
  completionDate: "",
  status: "Planlandı",
  notes: "",
};

export function PersonnelHandoverPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetPersonnelHandovers(companyId);
  const addMut = useAddPersonnelHandover();
  const updateMut = useUpdatePersonnelHandover();
  const deleteMut = useDeletePersonnelHandover();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PersonnelHandoverRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<PersonnelHandoverRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: PersonnelHandoverRecord) {
    setEditing(r);
    setForm({
      handoverDate: r.handoverDate,
      leavingEmployee: r.leavingEmployee,
      leavingPosition: r.leavingPosition,
      receivingEmployee: r.receivingEmployee,
      receivingPosition: r.receivingPosition,
      department: r.department,
      handoverType: r.handoverType,
      tasksSummary: r.tasksSummary,
      pendingTasks: r.pendingTasks,
      keyContacts: r.keyContacts,
      handoverDocs: r.handoverDocs,
      completionDate: r.completionDate,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.leavingEmployee || !form.handoverDate) {
      toast.error("Devreden personel ve tarih zorunludur.");
      return;
    }
    if (editing) {
      await updateMut.mutateAsync({ ...editing, ...form });
      toast.success("Kayıt güncellendi.");
    } else {
      await addMut.mutateAsync({ companyId: companyId!, ...form });
      toast.success("Görev devri eklendi.");
    }
    setOpen(false);
  }

  async function handleDelete(r: PersonnelHandoverRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.leavingEmployee.toLowerCase().includes(search.toLowerCase()) ||
      r.receivingEmployee.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const ongoingCount = records.filter(
    (r) => r.status === "Devam Ediyor" || r.status === "Planlandı",
  ).length;
  const completedCount = records.filter(
    (r) => r.status === "Tamamlandı",
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
            <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center">
              <UserCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Personel Görev Devri
              </h1>
              <p className="text-sm text-gray-500">
                Görev devir teslim kayıtları ve takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="personnel-handover.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Devir Ekle
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
              label: "Toplam Devir",
              value: totalCount,
              color: "text-indigo-600",
            },
            {
              label: "Devam Eden / Planlı",
              value: ongoingCount,
              color: "text-yellow-600",
            },
            {
              label: "Tamamlandı",
              value: completedCount,
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
              placeholder="Personel adı veya departman ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto"
              data-ocid="personnel-handover.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="personnel-handover.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="personnel-handover.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Tarih",
                      "Devreden",
                      "Görevi",
                      "Devralan",
                      "Departman",
                      "Tür",
                      "Tamamlanma",
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
                      data-ocid={`personnel-handover.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.handoverDate}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {r.leavingEmployee}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {r.leavingPosition}
                      </td>
                      <td className="px-4 py-3">{r.receivingEmployee}</td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.handoverType}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.completionDate || "-"}
                      </td>
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
                              data-ocid={`personnel-handover.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`personnel-handover.delete_button.${i + 1}`}
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
            data-ocid="personnel-handover.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Devir Düzenle" : "Görev Devri Ekle"}
              </DialogTitle>
              <DialogDescription>
                Görev devir teslim bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Devir Tarihi *</Label>
                <Input
                  type="date"
                  value={form.handoverDate}
                  onChange={(e) => sf("handoverDate", e.target.value)}
                  data-ocid="personnel-handover.input"
                />
              </div>
              <div>
                <Label>Devir Türü</Label>
                <Select
                  value={form.handoverType}
                  onValueChange={(v) => sf("handoverType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Görev Devri",
                      "İzin Devri",
                      "Proje Devri",
                      "Emeklilik",
                      "İstifa",
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
                <Label>Devreden Personel *</Label>
                <Input
                  value={form.leavingEmployee}
                  onChange={(e) => sf("leavingEmployee", e.target.value)}
                />
              </div>
              <div>
                <Label>Devredenin Pozisyonu</Label>
                <Input
                  value={form.leavingPosition}
                  onChange={(e) => sf("leavingPosition", e.target.value)}
                />
              </div>
              <div>
                <Label>Devralan Personel</Label>
                <Input
                  value={form.receivingEmployee}
                  onChange={(e) => sf("receivingEmployee", e.target.value)}
                />
              </div>
              <div>
                <Label>Devralanın Pozisyonu</Label>
                <Input
                  value={form.receivingPosition}
                  onChange={(e) => sf("receivingPosition", e.target.value)}
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
                <Label>Tamamlanma Tarihi</Label>
                <Input
                  type="date"
                  value={form.completionDate}
                  onChange={(e) => sf("completionDate", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Devredilen Görevler Özeti</Label>
                <Textarea
                  value={form.tasksSummary}
                  onChange={(e) => sf("tasksSummary", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Bekleyen/Devam Eden İşler</Label>
                <Textarea
                  value={form.pendingTasks}
                  onChange={(e) => sf("pendingTasks", e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <Label>Önemli Kişiler/Temaslar</Label>
                <Input
                  value={form.keyContacts}
                  onChange={(e) => sf("keyContacts", e.target.value)}
                />
              </div>
              <div>
                <Label>Devredilen Dokümanlar</Label>
                <Input
                  value={form.handoverDocs}
                  onChange={(e) => sf("handoverDocs", e.target.value)}
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
                    {["Planlandı", "Devam Ediyor", "Tamamlandı", "İptal"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
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
                data-ocid="personnel-handover.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="personnel-handover.submit_button"
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
                {deleteConfirm?.leavingEmployee} - {deleteConfirm?.handoverDate}{" "}
                kaydını silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="personnel-handover.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="personnel-handover.confirm_button"
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
