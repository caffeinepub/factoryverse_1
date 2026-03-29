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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSupplier,
  useDeleteSupplier,
  useGetSuppliers,
  useUpdateSupplier,
} from "../hooks/useQueries";
import type { Supplier } from "../types";

const statusOptions = [
  { value: "active", label: "Aktif", cls: "bg-green-100 text-green-800" },
  { value: "inactive", label: "Pasif", cls: "bg-gray-100 text-gray-600" },
];

const categories = [
  "Taşıma",
  "Kurulum",
  "Elektrik",
  "İnşaat",
  "Mühendislik",
  "Lojistik",
  "Diğer",
];

interface SupplierFormData {
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
  notes: string;
}

const emptyForm: SupplierFormData = {
  name: "",
  category: "Diğer",
  contactPerson: "",
  phone: "",
  email: "",
  status: "active",
  notes: "",
};

export function SuppliersPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const suppliersQuery = useGetSuppliers(userCode);
  const addMutation = useAddSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const [addOpen, setAddOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierFormData>(emptyForm);

  const suppliers = suppliersQuery.data ?? [];
  const updateForm = (k: keyof SupplierFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name) {
      toast.error("Firma adı zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        name: form.name,
        category: form.category,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        notes: form.notes,
      });
      toast.success("Tedarikçi eklendi");
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const openEdit = (s: Supplier) => {
    setEditSupplier(s);
    setForm({
      name: s.name,
      category: s.category,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      status: s.status,
      notes: s.notes,
    });
  };

  const handleUpdate = async () => {
    if (!editSupplier) return;
    try {
      await updateMutation.mutateAsync({
        adminCode: userCode!,
        supplierId: editSupplier.id,
        name: form.name,
        category: form.category,
        contactPerson: form.contactPerson,
        phone: form.phone,
        email: form.email,
        status: form.status,
        notes: form.notes,
      });
      toast.success("Tedarikçi güncellendi");
      setEditSupplier(null);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        adminCode: userCode!,
        supplierId: deleteTarget.id,
      });
      toast.success("Tedarikçi silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  return (
    <AppLayout title="Tedarikçiler">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Tedarikçiler
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {suppliers.length} tedarikçi kayıtlı
            </p>
          </div>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setForm(emptyForm);
                setAddOpen(true);
              }}
              data-ocid="suppliers.add_supplier.button"
            >
              <Plus size={16} /> Tedarikçi Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="suppliers.table"
        >
          {suppliersQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="p-12 text-center" data-ocid="suppliers.empty_state">
              <Truck size={40} className="text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                Henüz tedarikçi yok
              </h3>
              <p className="text-muted-foreground text-sm">
                İlk tedarikçiyi ekleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Firma Adı",
                      "Kategori",
                      "İletişim Kişisi",
                      "Telefon",
                      "E-posta",
                      "Durum",
                      "İşlem",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s, i) => {
                    const statusOpt = statusOptions.find(
                      (o) => o.value === s.status,
                    );
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        data-ocid={`suppliers.item.${i + 1}`}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {s.name}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.category}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.contactPerson || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.phone || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {s.email || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusOpt?.cls ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {statusOpt?.label ?? s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(s)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                data-ocid={`suppliers.edit_button.${i + 1}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(s)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                data-ocid={`suppliers.delete_button.${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-supplier-desc"
          data-ocid="suppliers.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Tedarikçi Ekle</DialogTitle>
            <DialogDescription id="add-supplier-desc">
              Yeni tedarikçi kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <SupplierForm
            form={form}
            updateForm={updateForm}
            showStatus={false}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="suppliers.add.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              data-ocid="suppliers.add.submit_button"
            >
              {addMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editSupplier}
        onOpenChange={(o) => {
          if (!o) setEditSupplier(null);
        }}
      >
        <DialogContent
          aria-describedby="edit-supplier-desc"
          data-ocid="suppliers.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Tedarikçi Düzenle
            </DialogTitle>
            <DialogDescription id="edit-supplier-desc">
              Tedarikçi bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <SupplierForm form={form} updateForm={updateForm} showStatus={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditSupplier(null)}
              data-ocid="suppliers.edit.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-ocid="suppliers.edit.submit_button"
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Kaydet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent
          aria-describedby="delete-supplier-desc"
          data-ocid="suppliers.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Tedarikçiyi Sil</DialogTitle>
            <DialogDescription id="delete-supplier-desc">
              <strong>{deleteTarget?.name}</strong> silinecek. Bu işlem geri
              alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="suppliers.delete.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-ocid="suppliers.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function SupplierForm({
  form,
  updateForm,
  showStatus,
}: {
  form: SupplierFormData;
  updateForm: (k: keyof SupplierFormData, v: string) => void;
  showStatus: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Firma Adı *</Label>
          <Input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Örn: ABC Lojistik"
            data-ocid="suppliers.form.name.input"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Kategori</Label>
          <Select
            value={form.category}
            onValueChange={(v) => updateForm("category", v)}
          >
            <SelectTrigger data-ocid="suppliers.form.category.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">İletişim Kişisi</Label>
          <Input
            value={form.contactPerson}
            onChange={(e) => updateForm("contactPerson", e.target.value)}
            placeholder="Ad Soyad"
            data-ocid="suppliers.form.contactperson.input"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Telefon</Label>
          <Input
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
            placeholder="+90 5xx xxx xx xx"
            data-ocid="suppliers.form.phone.input"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">E-posta</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => updateForm("email", e.target.value)}
            placeholder="info@firma.com"
            data-ocid="suppliers.form.email.input"
          />
        </div>
        {showStatus && (
          <div>
            <Label className="mb-1.5 block">Durum</Label>
            <Select
              value={form.status}
              onValueChange={(v) => updateForm("status", v)}
            >
              <SelectTrigger data-ocid="suppliers.form.status.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div>
        <Label className="mb-1.5 block">Notlar</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => updateForm("notes", e.target.value)}
          placeholder="Ek bilgiler..."
          rows={2}
          data-ocid="suppliers.form.notes.textarea"
        />
      </div>
    </div>
  );
}
