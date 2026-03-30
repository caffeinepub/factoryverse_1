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
import { Pencil, Phone, Plus, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddContact,
  useDeleteContact,
  useGetContacts,
  useUpdateContact,
} from "../hooks/useQueries";
import type { ContactEntry } from "../types";

const emptyForm = {
  name: "",
  company: "",
  contactType: "İç",
  department: "",
  role: "",
  phone: "",
  email: "",
  mobile: "",
  address: "",
  notes: "",
};

export function ContactDirectoryPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetContacts(companyId);
  const addMut = useAddContact();
  const updateMut = useUpdateContact();
  const deleteMut = useDeleteContact();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ContactEntry | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<ContactEntry | null>(null);
  const [search, setSearch] = useState("");

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: ContactEntry) {
    setEditing(r);
    setForm({
      name: r.name,
      company: r.company,
      contactType: r.contactType,
      department: r.department,
      role: r.role,
      phone: r.phone,
      email: r.email,
      mobile: r.mobile,
      address: r.address,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId) return;
    if (!form.name) {
      toast.error("Ad zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Kişi güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Kişi eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: ContactEntry) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Kişi silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const q = search.toLowerCase();
  const filtered = records.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q),
  );

  const sf = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Phone className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                İletişim Rehberi
              </h1>
              <p className="text-sm text-gray-500">
                İç ve dış kişi, tedarikçi ve kurum rehberi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              data-ocid="contact_directory.primary_button"
            >
              <Plus size={16} className="mr-1" /> Kişi Ekle
            </Button>
          )}
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ad, departman veya rol ile ara..."
            className="pl-9"
            data-ocid="contact_directory.search_input"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="contact_directory.empty_state"
            >
              {search ? "Arama sonucu bulunamadı." : "Henüz kişi kaydı yok."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ad",
                      "Tür",
                      "Departman",
                      "Görev",
                      "Firma",
                      "Telefon",
                      "E-posta",
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
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                      data-ocid={`contact_directory.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${r.contactType === "İç" ? "bg-indigo-100 text-indigo-800" : "bg-gray-100 text-gray-700"}`}
                        >
                          {r.contactType}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.role}</td>
                      <td className="px-4 py-3">{r.company || "-"}</td>
                      <td className="px-4 py-3">
                        {r.phone || r.mobile || "-"}
                      </td>
                      <td className="px-4 py-3 text-indigo-600">
                        {r.email || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="p-1 hover:text-indigo-600 text-gray-400"
                              data-ocid={`contact_directory.edit_button.${i + 1}`}
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(r)}
                              className="p-1 hover:text-red-500 text-gray-400"
                              data-ocid={`contact_directory.delete_button.${i + 1}`}
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Kişi Düzenle" : "Kişi Ekle"}
              </DialogTitle>
              <DialogDescription>İletişim bilgilerini girin.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ad Soyad *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => sf("name", e.target.value)}
                />
              </div>
              <div>
                <Label>Tür</Label>
                <Select
                  value={form.contactType}
                  onValueChange={(v) => sf("contactType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="İç">İç</SelectItem>
                    <SelectItem value="Dış">Dış</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Firma</Label>
                <Input
                  value={form.company}
                  onChange={(e) => sf("company", e.target.value)}
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
                <Label>Görev/Pozisyon</Label>
                <Input
                  value={form.role}
                  onChange={(e) => sf("role", e.target.value)}
                />
              </div>
              <div>
                <Label>Telefon</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => sf("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Mobil</Label>
                <Input
                  value={form.mobile}
                  onChange={(e) => sf("mobile", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>E-posta</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => sf("email", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Adres</Label>
                <Input
                  value={form.address}
                  onChange={(e) => sf("address", e.target.value)}
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
              <DialogTitle>Kişi Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.name} kişisini silmek istediğinizden emin
                misiniz?
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
