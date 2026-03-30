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
import { AlertCircle, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SupplierComplaint {
  id: string;
  companyId: string;
  complaintNo: string;
  supplierName: string;
  category: "Kalite" | "Teslimat" | "Fatura" | "İletişim" | "Diğer";
  description: string;
  impact: "Düşük" | "Orta" | "Yüksek";
  complaintDate: string;
  responseDueDate: string;
  resolutionDate: string;
  assignedTo: string;
  status: "Beklemede" | "İnceleniyor" | "Çözüldü" | "Reddedildi";
}

const statusClass: Record<string, string> = {
  Beklemede: "bg-yellow-100 text-yellow-800",
  İnceleniyor: "bg-blue-100 text-blue-800",
  Çözüldü: "bg-green-100 text-green-800",
  Reddedildi: "bg-gray-100 text-gray-600",
};

const impactClass: Record<string, string> = {
  Düşük: "bg-green-100 text-green-800",
  Orta: "bg-yellow-100 text-yellow-800",
  Yüksek: "bg-red-100 text-red-800",
};

function isPastDue(
  responseDueDate: string,
  status: SupplierComplaint["status"],
) {
  if (status === "Çözüldü" || status === "Reddedildi") return false;
  if (!responseDueDate) return false;
  return new Date(responseDueDate) < new Date();
}

const emptyForm = {
  complaintNo: "",
  supplierName: "",
  category: "Kalite" as SupplierComplaint["category"],
  description: "",
  impact: "Orta" as SupplierComplaint["impact"],
  complaintDate: "",
  responseDueDate: "",
  resolutionDate: "",
  assignedTo: "",
  status: "Beklemede" as SupplierComplaint["status"],
};

export function SupplierComplaintsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<SupplierComplaint[]>([
    {
      id: "1",
      companyId,
      complaintNo: "SC-2026-001",
      supplierName: "Metalurji A.Ş.",
      category: "Kalite",
      description:
        "Teslim edilen çelik levhaların tolerans dışı olduğu tespit edildi.",
      impact: "Yüksek",
      complaintDate: "2026-03-02",
      responseDueDate: "2026-03-12",
      resolutionDate: "",
      assignedTo: "Ali Öztürk",
      status: "İnceleniyor",
    },
    {
      id: "2",
      companyId,
      complaintNo: "SC-2026-002",
      supplierName: "Lojistik Plus Ltd.",
      category: "Teslimat",
      description: "Sipariş 5 gün gecikmeli teslim edildi, üretim durdu.",
      impact: "Yüksek",
      complaintDate: "2026-02-25",
      responseDueDate: "2026-03-07",
      resolutionDate: "2026-03-08",
      assignedTo: "Zeynep Çelik",
      status: "Çözüldü",
    },
    {
      id: "3",
      companyId,
      complaintNo: "SC-2026-003",
      supplierName: "Kimya Tedarik Co.",
      category: "Fatura",
      description: "Fatura tutarında anlaşılan fiyat ile uyumsuzluk var.",
      impact: "Orta",
      complaintDate: "2026-03-10",
      responseDueDate: "2026-03-25",
      resolutionDate: "",
      assignedTo: "Murat Yıldız",
      status: "Beklemede",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const pendingCount = records.filter((r) => r.status === "Beklemede").length;
  const reviewingCount = records.filter(
    (r) => r.status === "İnceleniyor",
  ).length;
  const resolvedCount = records.filter((r) => r.status === "Çözüldü").length;
  const pastDueCount = records.filter((r) =>
    isPastDue(r.responseDueDate, r.status),
  ).length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: SupplierComplaint) => {
    setForm({
      complaintNo: r.complaintNo,
      supplierName: r.supplierName,
      category: r.category,
      description: r.description,
      impact: r.impact,
      complaintDate: r.complaintDate,
      responseDueDate: r.responseDueDate,
      resolutionDate: r.resolutionDate,
      assignedTo: r.assignedTo,
      status: r.status,
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...form } : r)),
      );
      toast.success("Kayıt güncellendi");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Şikayet eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam", value: records.length, color: "text-orange-600" },
    { label: "Beklemede", value: pendingCount, color: "text-yellow-600" },
    { label: "İnceleniyor", value: reviewingCount, color: "text-blue-600" },
    { label: "Çözüldü", value: resolvedCount, color: "text-green-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <AlertCircle className="text-orange-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Tedarikçi Şikayet Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Tedarikçi şikayetlerini kaydedin ve çözüm sürecini takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white"
            onClick={openAdd}
            data-ocid="supplier-complaints.primary_button"
          >
            + Şikayet Ekle
          </Button>
        </div>

        {pastDueCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{pastDueCount} şikayetin</strong> yanıt tarihi geçti!
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Şikayet No</th>
                <th className="px-4 py-3">Tedarikçi</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Etki</th>
                <th className="px-4 py-3">Şikayet Tarihi</th>
                <th className="px-4 py-3">Yanıt Tarihi</th>
                <th className="px-4 py-3">Atanan</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${
                    isPastDue(r.responseDueDate, r.status) ? "bg-red-50/30" : ""
                  }`}
                  data-ocid={`supplier-complaints.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {r.complaintNo}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.supplierName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        impactClass[r.impact] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.impact}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.complaintDate}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        isPastDue(r.responseDueDate, r.status)
                          ? "text-red-600 font-semibold"
                          : "text-gray-600"
                      }
                    >
                      {r.responseDueDate}
                      {isPastDue(r.responseDueDate, r.status) && " ⚠"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusClass[r.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(r)}
                        className="text-gray-400 hover:text-orange-600"
                        data-ocid={`supplier-complaints.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`supplier-complaints.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="supplier-complaints.empty_state"
                  >
                    Henüz şikayet kaydı yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="sc-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Şikayeti Düzenle" : "Yeni Şikayet"}
            </DialogTitle>
            <DialogDescription id="sc-dialog-desc">
              Tedarikçi şikayet bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Şikayet No</Label>
                <Input
                  value={form.complaintNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, complaintNo: e.target.value }))
                  }
                  data-ocid="supplier-complaints.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      status: v as SupplierComplaint["status"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="supplier-complaints.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Beklemede", "İnceleniyor", "Çözüldü", "Reddedildi"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Tedarikçi Adı</Label>
                <Input
                  value={form.supplierName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplierName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      category: v as SupplierComplaint["category"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Kalite", "Teslimat", "Fatura", "İletişim", "Diğer"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Etki Düzeyi</Label>
                <Select
                  value={form.impact}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      impact: v as SupplierComplaint["impact"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Açıklama</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Şikayet Tarihi</Label>
                <Input
                  type="date"
                  value={form.complaintDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, complaintDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Yanıt Tarihi</Label>
                <Input
                  type="date"
                  value={form.responseDueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, responseDueDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Çözüm Tarihi</Label>
                <Input
                  type="date"
                  value={form.resolutionDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, resolutionDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Atanan Kişi</Label>
                <Input
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, assignedTo: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="supplier-complaints.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={handleSave}
              data-ocid="supplier-complaints.save_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="sc-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="sc-del-desc">
              Bu şikayet kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="supplier-complaints.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="supplier-complaints.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
