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
import { Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddPersonnelAuth,
  useDeletePersonnelAuth,
  useGetPersonnelAuths,
  useUpdatePersonnelAuth,
} from "../hooks/useQueries";
import type { PersonnelAuthRecord } from "../types";

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Süresi Dolmuş": "bg-red-100 text-red-800",
  "Askıya Alındı": "bg-gray-100 text-gray-800",
};

function expiryClass(dateStr: string): string {
  if (!dateStr) return "";
  const diff =
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "text-red-600 font-semibold";
  if (diff <= 30) return "text-orange-500 font-semibold";
  return "";
}

const emptyForm = {
  employeeName: "",
  department: "",
  authType: "",
  scope: "",
  grantedBy: "",
  grantDate: "",
  expiryDate: "",
  status: "Aktif",
  notes: "",
};

export function PersonnelAuthPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetPersonnelAuths(companyId);
  const addMut = useAddPersonnelAuth();
  const updateMut = useUpdatePersonnelAuth();
  const deleteMut = useDeletePersonnelAuth();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PersonnelAuthRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<PersonnelAuthRecord | null>(null);
  const [search, setSearch] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: PersonnelAuthRecord) {
    setEditing(r);
    setForm({
      employeeName: r.employeeName,
      department: r.department,
      authType: r.authType,
      scope: r.scope,
      grantedBy: r.grantedBy,
      grantDate: r.grantDate,
      expiryDate: r.expiryDate,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!form.employeeName || !form.authType) {
      toast.error("Personel adı ve yetki türü zorunludur.");
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

  async function handleDelete(r: PersonnelAuthRecord) {
    await deleteMut.mutateAsync({ id: r.id, companyId: companyId! });
    toast.success("Kayıt silindi.");
    setDeleteConfirm(null);
  }

  const filtered = records.filter(
    (r) =>
      r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      r.department.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCount = records.length;
  const activeCount = records.filter((r) => r.status === "Aktif").length;
  const expiredCount = records.filter(
    (r) => r.status === "Süresi Dolmuş",
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
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Personel Yetki Matrisi
              </h1>
              <p className="text-sm text-gray-500">
                Personel yetki kayıtları ve geçerlilik takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="personnel-auth.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Yetki Ekle
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
              label: "Toplam Yetki",
              value: totalCount,
              color: "text-indigo-600",
            },
            { label: "Aktif", value: activeCount, color: "text-green-600" },
            {
              label: "Süresi Dolmuş",
              value: expiredCount,
              color: "text-red-600",
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
              data-ocid="personnel-auth.search_input"
            />
          </div>
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="personnel-auth.loading_state"
            >
              Yükleniyor...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="personnel-auth.empty_state"
            >
              Kayıt bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    {[
                      "Personel",
                      "Departman",
                      "Yetki Türü",
                      "Kapsam",
                      "Veren",
                      "Veriliş Tarihi",
                      "Bitiş Tarihi",
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
                      data-ocid={`personnel-auth.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.employeeName}
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.authType}</td>
                      <td className="px-4 py-3">{r.scope}</td>
                      <td className="px-4 py-3">{r.grantedBy}</td>
                      <td className="px-4 py-3">{r.grantDate}</td>
                      <td className={`px-4 py-3 ${expiryClass(r.expiryDate)}`}>
                        {r.expiryDate || "-"}
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
                              data-ocid={`personnel-auth.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => setDeleteConfirm(r)}
                              data-ocid={`personnel-auth.delete_button.${i + 1}`}
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
            data-ocid="personnel-auth.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Yetki Düzenle" : "Yetki Ekle"}
              </DialogTitle>
              <DialogDescription>
                Personel yetki bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Personel Adı *</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) => sf("employeeName", e.target.value)}
                  data-ocid="personnel-auth.input"
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
                <Label>Yetki Türü *</Label>
                <Input
                  value={form.authType}
                  onChange={(e) => sf("authType", e.target.value)}
                />
              </div>
              <div>
                <Label>Kapsam</Label>
                <Input
                  value={form.scope}
                  onChange={(e) => sf("scope", e.target.value)}
                />
              </div>
              <div>
                <Label>Yetki Veren</Label>
                <Input
                  value={form.grantedBy}
                  onChange={(e) => sf("grantedBy", e.target.value)}
                />
              </div>
              <div>
                <Label>Veriliş Tarihi</Label>
                <Input
                  type="date"
                  value={form.grantDate}
                  onChange={(e) => sf("grantDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
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
                    {["Aktif", "Süresi Dolmuş", "Askıya Alındı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
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
                data-ocid="personnel-auth.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="personnel-auth.submit_button"
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
                {deleteConfirm?.employeeName} - {deleteConfirm?.authType}{" "}
                yetkisini silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="personnel-auth.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                data-ocid="personnel-auth.confirm_button"
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
