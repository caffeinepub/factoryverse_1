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
import { Pencil, Search, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface RCARecord {
  id: string;
  companyId: string;
  analysisNo: string;
  problemTitle: string;
  category: "Üretim" | "Kalite" | "Güvenlik" | "Bakım" | "Çevre";
  severity: "Düşük" | "Orta" | "Yüksek" | "Kritik";
  detectedDate: string;
  rootCause: string;
  contributingFactors: string;
  correctiveAction: string;
  preventiveAction: string;
  responsible: string;
  dueDate: string;
  status: "Açık" | "Devam Ediyor" | "Kapalı";
}

const severityClass: Record<string, string> = {
  Düşük: "bg-green-100 text-green-800",
  Orta: "bg-yellow-100 text-yellow-800",
  Yüksek: "bg-orange-100 text-orange-800",
  Kritik: "bg-red-100 text-red-800",
};

const statusClass: Record<string, string> = {
  Açık: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Kapalı: "bg-green-100 text-green-800",
};

const emptyForm = {
  analysisNo: "",
  problemTitle: "",
  category: "Üretim" as RCARecord["category"],
  severity: "Orta" as RCARecord["severity"],
  detectedDate: "",
  rootCause: "",
  contributingFactors: "",
  correctiveAction: "",
  preventiveAction: "",
  responsible: "",
  dueDate: "",
  status: "Açık" as RCARecord["status"],
};

export function RootCauseAnalysisPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<RCARecord[]>([
    {
      id: "1",
      companyId,
      analysisNo: "RCA-2026-001",
      problemTitle: "Hat 3'te Ürün Kalitesi Düşüşü",
      category: "Kalite",
      severity: "Yüksek",
      detectedDate: "2026-03-05",
      rootCause: "Kalıp aşınması nedeniyle boyut sapması",
      contributingFactors:
        "Bakım planı gecikmesi, operatör farkındalığı eksikliği",
      correctiveAction: "Kalıp değişimi yapıldı",
      preventiveAction: "Periyodik kalıp kontrolü takvime eklendi",
      responsible: "Ahmet Yılmaz",
      dueDate: "2026-03-20",
      status: "Devam Ediyor",
    },
    {
      id: "2",
      companyId,
      analysisNo: "RCA-2026-002",
      problemTitle: "Konveyör Bandı Arızası",
      category: "Bakım",
      severity: "Kritik",
      detectedDate: "2026-02-28",
      rootCause: "Motor sargı bozulması",
      contributingFactors: "Aşırı yükleme, soğutma yetersizliği",
      correctiveAction: "Motor değişimi tamamlandı",
      preventiveAction: "Yük sensörü takıldı",
      responsible: "Mehmet Demir",
      dueDate: "2026-03-10",
      status: "Kapalı",
    },
    {
      id: "3",
      companyId,
      analysisNo: "RCA-2026-003",
      problemTitle: "Kimyasal Sızıntı Olayı",
      category: "Güvenlik",
      severity: "Yüksek",
      detectedDate: "2026-03-12",
      rootCause: "Boru bağlantı contası yıpranması",
      contributingFactors: "Uzun süreli kullanım, basınç dalgalanmaları",
      correctiveAction: "Conta değişimi yapıldı",
      preventiveAction: "Tüm boru bağlantıları kontrol edilecek",
      responsible: "Fatma Kaya",
      dueDate: "2026-04-01",
      status: "Açık",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const openCount = records.filter((r) => r.status === "Açık").length;
  const inProgressCount = records.filter(
    (r) => r.status === "Devam Ediyor",
  ).length;
  const closedCount = records.filter((r) => r.status === "Kapalı").length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: RCARecord) => {
    setForm({
      analysisNo: r.analysisNo,
      problemTitle: r.problemTitle,
      category: r.category,
      severity: r.severity,
      detectedDate: r.detectedDate,
      rootCause: r.rootCause,
      contributingFactors: r.contributingFactors,
      correctiveAction: r.correctiveAction,
      preventiveAction: r.preventiveAction,
      responsible: r.responsible,
      dueDate: r.dueDate,
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
      toast.success("Analiz eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    { label: "Toplam Analiz", value: records.length, color: "text-purple-600" },
    { label: "Açık", value: openCount, color: "text-blue-600" },
    { label: "Devam Ediyor", value: inProgressCount, color: "text-yellow-600" },
    { label: "Kapalı", value: closedCount, color: "text-green-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Search className="text-purple-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Kök Neden Analizi
              </h1>
              <p className="text-sm text-gray-500">
                Sorun kök neden analizlerini kaydedin ve takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={openAdd}
            data-ocid="rca.primary_button"
          >
            + Analiz Ekle
          </Button>
        </div>

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
                <th className="px-4 py-3">Analiz No</th>
                <th className="px-4 py-3">Problem</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Şiddet</th>
                <th className="px-4 py-3">Tespit Tarihi</th>
                <th className="px-4 py-3">Sorumlu</th>
                <th className="px-4 py-3">Termin</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`rca.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">
                    {r.analysisNo}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {r.problemTitle}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                      {r.rootCause}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        severityClass[r.severity] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.detectedDate}</td>
                  <td className="px-4 py-3 text-gray-600">{r.responsible}</td>
                  <td className="px-4 py-3 text-gray-600">{r.dueDate}</td>
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
                        className="text-gray-400 hover:text-purple-600"
                        data-ocid={`rca.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`rca.delete_button.${idx + 1}`}
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
                    data-ocid="rca.empty_state"
                  >
                    Henüz analiz kaydı yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="rca-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Analizi Düzenle" : "Yeni Analiz"}
            </DialogTitle>
            <DialogDescription id="rca-dialog-desc">
              Kök neden analiz bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Analiz No</Label>
                <Input
                  value={form.analysisNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, analysisNo: e.target.value }))
                  }
                  data-ocid="rca.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as RCARecord["status"] }))
                  }
                >
                  <SelectTrigger data-ocid="rca.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Açık", "Devam Ediyor", "Kapalı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Problem Başlığı</Label>
                <Input
                  value={form.problemTitle}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, problemTitle: e.target.value }))
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
                      category: v as RCARecord["category"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Üretim", "Kalite", "Güvenlik", "Bakım", "Çevre"].map(
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
                <Label>Şiddet</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      severity: v as RCARecord["severity"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Kritik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tespit Tarihi</Label>
                <Input
                  type="date"
                  value={form.detectedDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, detectedDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, responsible: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Termin Tarihi</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Kök Neden</Label>
                <Input
                  value={form.rootCause}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rootCause: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Katkıda Bulunan Faktörler</Label>
                <Input
                  value={form.contributingFactors}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      contributingFactors: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Düzeltici Faaliyet</Label>
                <Input
                  value={form.correctiveAction}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, correctiveAction: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Önleyici Faaliyet</Label>
                <Input
                  value={form.preventiveAction}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, preventiveAction: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="rca.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleSave}
              data-ocid="rca.save_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="rca-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="rca-del-desc">
              Bu analiz kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="rca.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="rca.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
