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
import { AlertTriangle, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SecurityTour {
  id: string;
  companyId: string;
  tourName: string;
  area: string;
  guardName: string;
  scheduledDate: string;
  scheduledTime: string;
  actualCompletionTime: string;
  findings: string;
  status: "Tamamlandı" | "Gecikmiş" | "Bekliyor";
}

const statusClass: Record<string, string> = {
  Tamamlandı: "bg-green-100 text-green-800",
  Gecikmiş: "bg-red-100 text-red-800",
  Bekliyor: "bg-yellow-100 text-yellow-800",
};

const emptyForm = {
  tourName: "",
  area: "",
  guardName: "",
  scheduledDate: "",
  scheduledTime: "",
  actualCompletionTime: "",
  findings: "",
  status: "Bekliyor" as SecurityTour["status"],
};

export function SecurityToursPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<SecurityTour[]>([
    {
      id: "1",
      companyId,
      tourName: "Sabah Genel Turu",
      area: "Tüm Tesis",
      guardName: "Hasan Çelik",
      scheduledDate: "2026-03-30",
      scheduledTime: "07:00",
      actualCompletionTime: "07:45",
      findings: "Bölge D kapısı kilit açık bulundu, kapatıldı.",
      status: "Tamamlandı",
    },
    {
      id: "2",
      companyId,
      tourName: "Gece Güvenlik Turu",
      area: "Depo & Üretim",
      guardName: "Murat Doğan",
      scheduledDate: "2026-03-29",
      scheduledTime: "23:00",
      actualCompletionTime: "",
      findings: "",
      status: "Gecikmiş",
    },
    {
      id: "3",
      companyId,
      tourName: "Öğle Çevre Turu",
      area: "Dış Alan & Otopark",
      guardName: "Hasan Çelik",
      scheduledDate: "2026-03-30",
      scheduledTime: "12:30",
      actualCompletionTime: "",
      findings: "",
      status: "Bekliyor",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const lateCount = records.filter((r) => r.status === "Gecikmiş").length;
  const doneCount = records.filter((r) => r.status === "Tamamlandı").length;
  const pendingCount = records.filter((r) => r.status === "Bekliyor").length;
  const hasWarning = lateCount > 0;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: SecurityTour) => {
    setForm({
      tourName: r.tourName,
      area: r.area,
      guardName: r.guardName,
      scheduledDate: r.scheduledDate,
      scheduledTime: r.scheduledTime,
      actualCompletionTime: r.actualCompletionTime,
      findings: r.findings,
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
      toast.success("Güvenlik turu eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam", value: records.length, color: "text-indigo-600" },
    { label: "Tamamlandı", value: doneCount, color: "text-green-600" },
    { label: "Gecikmiş", value: lateCount, color: "text-red-600" },
    { label: "Bekliyor", value: pendingCount, color: "text-yellow-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ShieldCheck className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Güvenlik Turu Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Tesis güvenlik turlarını ve bulgularını yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="security-tours.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
          </Button>
        </div>

        {hasWarning && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{lateCount} tur</strong> gecikmiş durumda!
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
          <table className="w-full text-sm" data-ocid="security-tours.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Tur Adı</th>
                <th className="px-4 py-3">Alan</th>
                <th className="px-4 py-3">Güvenlik Görevlisi</th>
                <th className="px-4 py-3">Planlanan Tarih</th>
                <th className="px-4 py-3">Planlanan Saat</th>
                <th className="px-4 py-3">Tamamlanma</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`security-tours.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.tourName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.area}</td>
                  <td className="px-4 py-3 text-gray-600">{r.guardName}</td>
                  <td className="px-4 py-3 text-gray-600">{r.scheduledDate}</td>
                  <td className="px-4 py-3 text-gray-600">{r.scheduledTime}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.actualCompletionTime || "-"}
                  </td>
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
                        className="text-gray-400 hover:text-indigo-600"
                        data-ocid={`security-tours.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`security-tours.delete_button.${idx + 1}`}
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
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="security-tours.empty_state"
                  >
                    Henüz kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="security-tours-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Turu Düzenle" : "Yeni Güvenlik Turu"}
            </DialogTitle>
            <DialogDescription id="security-tours-dialog-desc">
              Güvenlik turu bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="security-tours.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Tur Adı</Label>
                <Input
                  value={form.tourName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, tourName: e.target.value }))
                  }
                  data-ocid="security-tours.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Alan</Label>
                <Input
                  value={form.area}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, area: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Güvenlik Görevlisi</Label>
                <Input
                  value={form.guardName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, guardName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Planlanan Tarih</Label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, scheduledDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Planlanan Saat</Label>
                <Input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, scheduledTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Tamamlanma Saati</Label>
                <Input
                  type="time"
                  value={form.actualCompletionTime}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      actualCompletionTime: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      status: v as SecurityTour["status"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="security-tours.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Tamamlandı", "Gecikmiş", "Bekliyor"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Bulgular</Label>
                <Textarea
                  value={form.findings}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, findings: e.target.value }))
                  }
                  rows={2}
                  data-ocid="security-tours.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="security-tours.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="security-tours.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="security-tours-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="security-tours-del-desc">
              Bu güvenlik turu kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="security-tours.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="security-tours.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
