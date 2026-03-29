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
import { FlaskConical, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddChemicalRecord,
  useDeleteChemicalRecord,
  useGetChemicalRecords,
  useUpdateChemicalRecord,
} from "../hooks/useQueries";
import type { ChemicalRecord } from "../types";

const hazardClass: Record<string, string> = {
  Yanıcı: "bg-red-100 text-red-800",
  Toksik: "bg-purple-100 text-purple-800",
  Korozif: "bg-orange-100 text-orange-800",
  Oksitleyici: "bg-yellow-100 text-yellow-800",
  Patlayıcı: "bg-red-200 text-red-900",
  "Çevreye Zararlı": "bg-green-100 text-green-800",
  Diğer: "bg-gray-100 text-gray-700",
};

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Azaldı: "bg-yellow-100 text-yellow-800",
  Tükendi: "bg-red-100 text-red-800",
  "Süresi Doldu": "bg-red-200 text-red-900",
  "İmha Edildi": "bg-gray-100 text-gray-600",
};

const emptyForm = {
  chemicalName: "",
  casNumber: "",
  hazardClass: "Yanıcı",
  storageLocation: "",
  quantity: "",
  unit: "lt",
  supplierName: "",
  expiryDate: "",
  sdsNumber: "",
  status: "Aktif",
  notes: "",
};

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / 86400000);
}

export function ChemicalsPage() {
  const { session } = useAuth();
  const userCode =
    (session as any)?.loginCode ?? (session as any)?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetChemicalRecords(userCode);
  const addRecord = useAddChemicalRecord();
  const updateRecord = useUpdateChemicalRecord();
  const deleteRecord = useDeleteChemicalRecord();

  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<ChemicalRecord | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterHazard, setFilterHazard] = useState("all");

  const expiringSoon = records.filter((r) => {
    const d = daysUntil(r.expiryDate);
    return d !== null && d >= 0 && d <= 30;
  });
  const expired = records.filter((r) => {
    const d = daysUntil(r.expiryDate);
    return d !== null && d < 0;
  });

  const filtered = records.filter((r) =>
    filterHazard === "all" ? true : r.hazardClass === filterHazard,
  );

  function openAdd() {
    setEditItem(null);
    setForm({ ...emptyForm });
    setShowDialog(true);
  }

  function openEdit(r: ChemicalRecord) {
    setEditItem(r);
    setForm({
      chemicalName: r.chemicalName,
      casNumber: r.casNumber,
      hazardClass: r.hazardClass,
      storageLocation: r.storageLocation,
      quantity: r.quantity,
      unit: r.unit,
      supplierName: r.supplierName,
      expiryDate: r.expiryDate,
      sdsNumber: r.sdsNumber,
      status: r.status,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.chemicalName.trim()) {
      toast.error("Kimyasal adı gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Kayıt güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Kayıt eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Kayıt silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız");
    }
  }

  const f = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <FlaskConical className="text-orange-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Kimyasal & Tehlikeli Madde Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Kimyasal envanter ve güvenlik takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="chemicals.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kimyasal Ekle
            </Button>
          )}
        </div>

        {expired.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            ⚠ {expired.length} kimyasalın son kullanma tarihi geçmiş!
          </div>
        )}
        {expiringSoon.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3 text-sm text-yellow-700">
            ⏰ {expiringSoon.length} kimyasalın son kullanma tarihi 30 gün
            içinde doluyor.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Toplam Kimyasal",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Aktif",
              value: records.filter((r) => r.status === "Aktif").length,
              color: "text-green-600",
            },
            {
              label: "Yakında Dolacak",
              value: expiringSoon.length,
              color: "text-yellow-600",
            },
            {
              label: "Süresi Dolmuş",
              value: expired.length,
              color: "text-red-600",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterHazard} onValueChange={setFilterHazard}>
            <SelectTrigger className="w-52" data-ocid="chemicals.select">
              <SelectValue placeholder="Tehlike Sınıfı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Sınıflar</SelectItem>
              <SelectItem value="Yanıcı">Yanıcı</SelectItem>
              <SelectItem value="Toksik">Toksik</SelectItem>
              <SelectItem value="Korozif">Korozif</SelectItem>
              <SelectItem value="Oksitleyici">Oksitleyici</SelectItem>
              <SelectItem value="Patlayıcı">Patlayıcı</SelectItem>
              <SelectItem value="Çevreye Zararlı">Çevreye Zararlı</SelectItem>
              <SelectItem value="Diğer">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="chemicals.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="chemicals.empty_state"
            >
              Kimyasal kaydı bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Kimyasal Adı",
                    "CAS No",
                    "Tehlike Sınıfı",
                    "Miktar",
                    "Depo Yeri",
                    "SDS No",
                    "Son Kullanma",
                    "Durum",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, idx) => {
                  const days = daysUntil(r.expiryDate);
                  const isExpired = days !== null && days < 0;
                  const isWarn = days !== null && days >= 0 && days <= 30;
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-gray-50 transition-colors ${isExpired ? "bg-red-50" : isWarn ? "bg-yellow-50" : ""}`}
                      data-ocid={`chemicals.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.chemicalName}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                        {r.casNumber || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${hazardClass[r.hazardClass] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.hazardClass}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.quantity} {r.unit}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.storageLocation || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.sdsNumber || "—"}
                      </td>
                      <td
                        className={`px-4 py-3 text-xs ${isExpired ? "text-red-600 font-semibold" : isWarn ? "text-yellow-600 font-semibold" : "text-gray-600"}`}
                      >
                        {r.expiryDate || "—"}
                        {isExpired ? " ⚠" : isWarn ? " ⏰" : ""}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                              data-ocid={`chemicals.edit_button.${idx + 1}`}
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setDeleteTarget(r.id)}
                              data-ocid={`chemicals.delete_button.${idx + 1}`}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="chemicals-dialog-desc"
          data-ocid="chemicals.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kaydı Düzenle" : "Yeni Kimyasal"}
            </DialogTitle>
            <DialogDescription id="chemicals-dialog-desc">
              Kimyasal madde bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Kimyasal Adı *</Label>
              <Input
                value={form.chemicalName}
                onChange={(e) => f("chemicalName", e.target.value)}
                placeholder="Örn: Aseton"
                data-ocid="chemicals.input"
              />
            </div>
            <div className="space-y-1">
              <Label>CAS Numarası</Label>
              <Input
                value={form.casNumber}
                onChange={(e) => f("casNumber", e.target.value)}
                placeholder="67-64-1"
              />
            </div>
            <div className="space-y-1">
              <Label>Tehlike Sınıfı</Label>
              <Select
                value={form.hazardClass}
                onValueChange={(v) => f("hazardClass", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yanıcı">Yanıcı</SelectItem>
                  <SelectItem value="Toksik">Toksik</SelectItem>
                  <SelectItem value="Korozif">Korozif</SelectItem>
                  <SelectItem value="Oksitleyici">Oksitleyici</SelectItem>
                  <SelectItem value="Patlayıcı">Patlayıcı</SelectItem>
                  <SelectItem value="Çevreye Zararlı">
                    Çevreye Zararlı
                  </SelectItem>
                  <SelectItem value="Diğer">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Depolama Yeri</Label>
              <Input
                value={form.storageLocation}
                onChange={(e) => f("storageLocation", e.target.value)}
                placeholder="Kimyasal Deposu A"
              />
            </div>
            <div className="space-y-1">
              <Label>SDS Numarası</Label>
              <Input
                value={form.sdsNumber}
                onChange={(e) => f("sdsNumber", e.target.value)}
                placeholder="SDS-001"
              />
            </div>
            <div className="space-y-1">
              <Label>Miktar</Label>
              <Input
                type="number"
                value={form.quantity}
                onChange={(e) => f("quantity", e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Input
                value={form.unit}
                onChange={(e) => f("unit", e.target.value)}
                placeholder="lt, kg, adet"
              />
            </div>
            <div className="space-y-1">
              <Label>Tedarikçi</Label>
              <Input
                value={form.supplierName}
                onChange={(e) => f("supplierName", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Son Kullanma Tarihi</Label>
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => f("expiryDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select value={form.status} onValueChange={(v) => f("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Azaldı">Azaldı</SelectItem>
                  <SelectItem value="Tükendi">Tükendi</SelectItem>
                  <SelectItem value="Süresi Doldu">Süresi Doldu</SelectItem>
                  <SelectItem value="İmha Edildi">İmha Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="chemicals.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="chemicals.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="chemicals.submit_button"
            >
              {editItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          aria-describedby="chemicals-del-desc"
          data-ocid="chemicals.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="chemicals-del-desc">
              Bu kimyasal kaydını silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="chemicals.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="chemicals.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
