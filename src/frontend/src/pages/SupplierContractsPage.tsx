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
import {
  AlertTriangle,
  FileSignature,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SupplierContract {
  id: string;
  companyId: string;
  supplierName: string;
  contractNo: string;
  contractType: string;
  startDate: string;
  endDate: string;
  value: string;
  currency: string;
  autoRenew: string;
  contactPerson: string;
  status: string;
  notes: string;
}

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  "Yakında Bitiyor": "bg-orange-100 text-orange-800",
  "Sona Erdi": "bg-red-100 text-red-800",
  İptal: "bg-gray-100 text-gray-600",
  Müzakere: "bg-blue-100 text-blue-800",
};

const emptyForm = {
  supplierName: "",
  contractNo: "",
  contractType: "Hizmet",
  startDate: "",
  endDate: "",
  value: "",
  currency: "TRY",
  autoRenew: "Hayır",
  contactPerson: "",
  status: "Aktif",
  notes: "",
};

export function SupplierContractsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const today = new Date();

  const [records, setRecords] = useState<SupplierContract[]>([
    {
      id: "1",
      companyId,
      supplierName: "Siemens Türkiye A.Ş.",
      contractNo: "SC-2025-001",
      contractType: "Bakım & Servis",
      startDate: "2025-01-01",
      endDate: "2026-01-01",
      value: "450000",
      currency: "TRY",
      autoRenew: "Evet",
      contactPerson: "Ali Yılmaz",
      status: "Aktif",
      notes: "",
    },
    {
      id: "2",
      companyId,
      supplierName: "Linde Gaz A.Ş.",
      contractNo: "SC-2025-002",
      contractType: "Tedarik",
      startDate: "2024-06-01",
      endDate: "2025-06-01",
      value: "180000",
      currency: "TRY",
      autoRenew: "Hayır",
      contactPerson: "Mehmet Kaya",
      status: "Sona Erdi",
      notes: "Yenileme teklifi bekleniyor",
    },
    {
      id: "3",
      companyId,
      supplierName: "ABB Elektrik Sanayi",
      contractNo: "SC-2025-003",
      contractType: "Ekipman Kiralama",
      startDate: "2025-09-01",
      endDate: "2026-03-15",
      value: "95000",
      currency: "EUR",
      autoRenew: "Hayır",
      contactPerson: "Deniz Arslan",
      status: "Yakında Bitiyor",
      notes: "Uzatma görüşmeleri başladı",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierContract | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<SupplierContract | null>(
    null,
  );

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function endDateBadge(dateStr: string) {
    if (!dateStr) return "";
    const diff =
      (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "bg-red-100 text-red-800";
    if (diff <= 30) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  }

  const expiringSoon = records.filter((r) => {
    if (!r.endDate) return false;
    const diff =
      (new Date(r.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: SupplierContract) {
    setEditing(r);
    setForm({
      supplierName: r.supplierName,
      contractNo: r.contractNo,
      contractType: r.contractType,
      startDate: r.startDate,
      endDate: r.endDate,
      value: r.value,
      currency: r.currency,
      autoRenew: r.autoRenew,
      contactPerson: r.contactPerson,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.supplierName.trim()) {
      toast.error("Tedarikçi adı zorunludur.");
      return;
    }
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
      toast.success("Güncellendi.");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Sözleşme eklendi.");
    }
    setOpen(false);
  }

  function handleDelete(r: SupplierContract) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const activeContracts = records.filter((r) => r.status === "Aktif").length;
  const totalValue = records
    .filter((r) => r.currency === "TRY")
    .reduce((s, r) => s + (Number(r.value) || 0), 0);

  const stats = [
    { label: "Toplam Sözleşme", val: records.length, color: "indigo" },
    { label: "Aktif", val: activeContracts, color: "green" },
    { label: "Yakında Bitiyor", val: expiringSoon, color: "orange" },
    {
      label: "Toplam Değer (TRY)",
      val: totalValue.toLocaleString("tr-TR"),
      color: "purple",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileSignature className="text-blue-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Tedarikçi Sözleşme Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Tedarikçi sözleşmeleri, süreler ve yenileme takibi
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="supplier-contracts.primary_button"
          >
            <Plus size={16} className="mr-1" /> Sözleşme Ekle
          </Button>
        </div>

        {expiringSoon > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {expiringSoon} sözleşmenin bitiş tarihi 30 gün içinde!
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((c) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border p-4"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600 mt-1`}>
                {c.val}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="supplier-contracts.empty_state"
            >
              Henüz sözleşme kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Tedarikçi",
                      "Sözleşme No",
                      "Tür",
                      "Başlangıç",
                      "Bitiş",
                      "Değer",
                      "Para Birimi",
                      "Otomatik Yenileme",
                      "İletişim",
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
                      data-ocid={`supplier-contracts.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.supplierName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {r.contractNo}
                      </td>
                      <td className="px-4 py-3">{r.contractType}</td>
                      <td className="px-4 py-3">{r.startDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${endDateBadge(r.endDate)}`}
                        >
                          {r.endDate}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.value
                          ? Number(r.value).toLocaleString("tr-TR")
                          : "-"}
                      </td>
                      <td className="px-4 py-3">{r.currency}</td>
                      <td className="px-4 py-3">{r.autoRenew}</td>
                      <td className="px-4 py-3">{r.contactPerson}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1 hover:text-indigo-600 text-gray-400"
                            data-ocid={`supplier-contracts.edit_button.${i + 1}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                            data-ocid={`supplier-contracts.delete_button.${i + 1}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
            data-ocid="supplier-contracts.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Sözleşme Düzenle" : "Sözleşme Ekle"}
              </DialogTitle>
              <DialogDescription>
                Tedarikçi sözleşme bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Tedarikçi Adı *</Label>
                <Input
                  value={form.supplierName}
                  onChange={(e) => sf("supplierName", e.target.value)}
                  data-ocid="supplier-contracts.input"
                />
              </div>
              <div>
                <Label>Sözleşme No</Label>
                <Input
                  value={form.contractNo}
                  onChange={(e) => sf("contractNo", e.target.value)}
                />
              </div>
              <div>
                <Label>Sözleşme Türü</Label>
                <Select
                  value={form.contractType}
                  onValueChange={(v) => sf("contractType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Hizmet",
                      "Tedarik",
                      "Bakım & Servis",
                      "Ekipman Kiralama",
                      "Danışmanlık",
                      "Diğer",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => sf("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => sf("endDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Değer</Label>
                <Input
                  type="number"
                  value={form.value}
                  onChange={(e) => sf("value", e.target.value)}
                />
              </div>
              <div>
                <Label>Para Birimi</Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => sf("currency", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["TRY", "USD", "EUR", "GBP"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Otomatik Yenileme</Label>
                <Select
                  value={form.autoRenew}
                  onValueChange={(v) => sf("autoRenew", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Evet", "Hayır"].map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      "Aktif",
                      "Yakında Bitiyor",
                      "Sona Erdi",
                      "İptal",
                      "Müzakere",
                    ].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>İletişim Kişisi</Label>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => sf("contactPerson", e.target.value)}
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
                data-ocid="supplier-contracts.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="supplier-contracts.submit_button"
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
              <DialogTitle>Sözleşme Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.supplierName} sözleşmesini silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="supplier-contracts.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="supplier-contracts.confirm_button"
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
