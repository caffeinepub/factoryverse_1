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
import { BarChart3, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface SupplierScorecard {
  id: string;
  companyId: string;
  supplierName: string;
  period: string;
  deliveryScore: number;
  qualityScore: number;
  priceScore: number;
  communicationScore: number;
  overallScore: number;
  notes: string;
  status: string;
}

function calcOverall(d: number, q: number, p: number, c: number): number {
  return Math.round((d + q + p + c) / 4);
}

function scoreStatus(overall: number): string {
  if (overall >= 80) return "İyi";
  if (overall >= 50) return "Orta";
  return "Zayıf";
}

const statusClass: Record<string, string> = {
  İyi: "bg-green-100 text-green-800",
  Orta: "bg-orange-100 text-orange-800",
  Zayıf: "bg-red-100 text-red-800",
};

const emptyForm = {
  supplierName: "",
  period: "",
  deliveryScore: 0,
  qualityScore: 0,
  priceScore: 0,
  communicationScore: 0,
  notes: "",
};

export function SupplierScorecardPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<SupplierScorecard[]>([
    {
      id: "1",
      companyId,
      supplierName: "Siemens Türkiye A.Ş.",
      period: "2025-Q1",
      deliveryScore: 90,
      qualityScore: 88,
      priceScore: 75,
      communicationScore: 92,
      overallScore: 86,
      notes: "Teslimat ve iletişim performansı mükemmel.",
      status: "İyi",
    },
    {
      id: "2",
      companyId,
      supplierName: "Bosch Rexroth TR",
      period: "2025-Q1",
      deliveryScore: 65,
      qualityScore: 70,
      priceScore: 60,
      communicationScore: 55,
      overallScore: 63,
      notes: "Fiyat konusunda iyileştirme bekleniyor.",
      status: "Orta",
    },
    {
      id: "3",
      companyId,
      supplierName: "Karsan Makine Ltd.",
      period: "2025-Q1",
      deliveryScore: 40,
      qualityScore: 45,
      priceScore: 55,
      communicationScore: 35,
      overallScore: 44,
      notes:
        "Genel performans yetersiz, alternatif tedarikçi değerlendirilecek.",
      status: "Zayıf",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: SupplierScorecard) => {
    setForm({
      supplierName: r.supplierName,
      period: r.period,
      deliveryScore: r.deliveryScore,
      qualityScore: r.qualityScore,
      priceScore: r.priceScore,
      communicationScore: r.communicationScore,
      notes: r.notes,
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const overall = calcOverall(
      Number(form.deliveryScore),
      Number(form.qualityScore),
      Number(form.priceScore),
      Number(form.communicationScore),
    );
    const status = scoreStatus(overall);
    if (editId) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editId
            ? {
                ...r,
                ...form,
                deliveryScore: Number(form.deliveryScore),
                qualityScore: Number(form.qualityScore),
                priceScore: Number(form.priceScore),
                communicationScore: Number(form.communicationScore),
                overallScore: overall,
                status,
              }
            : r,
        ),
      );
      toast.success("Kayıt güncellendi");
    } else {
      const newRec: SupplierScorecard = {
        id: Date.now().toString(),
        companyId,
        ...form,
        deliveryScore: Number(form.deliveryScore),
        qualityScore: Number(form.qualityScore),
        priceScore: Number(form.priceScore),
        communicationScore: Number(form.communicationScore),
        overallScore: overall,
        status,
      };
      setRecords((prev) => [newRec, ...prev]);
      toast.success("Skorkart eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const total = records.length;
  const avgScore =
    total > 0
      ? Math.round(records.reduce((s, r) => s + r.overallScore, 0) / total)
      : 0;
  const goodCount = records.filter((r) => r.status === "İyi").length;
  const weakCount = records.filter((r) => r.status === "Zayıf").length;

  const stats = [
    { label: "Toplam Kayıt", value: total, color: "text-indigo-600" },
    { label: "Ort. Genel Puan", value: avgScore, color: "text-blue-600" },
    { label: "İyi Performans", value: goodCount, color: "text-green-600" },
    { label: "Zayıf Performans", value: weakCount, color: "text-red-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <BarChart3 className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Tedarikçi Performans Skorkartı
              </h1>
              <p className="text-sm text-gray-500">
                Tedarikçi performans puanlarını dönemsel olarak takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="scorecard.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
          </Button>
        </div>

        {/* Stat Cards */}
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

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="scorecard.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Tedarikçi</th>
                <th className="px-4 py-3">Dönem</th>
                <th className="px-4 py-3">Teslimat</th>
                <th className="px-4 py-3">Kalite</th>
                <th className="px-4 py-3">Fiyat</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Genel</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`scorecard.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.supplierName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.period}</td>
                  <td className="px-4 py-3">
                    <ScoreBar value={r.deliveryScore} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar value={r.qualityScore} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar value={r.priceScore} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar value={r.communicationScore} />
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBar value={r.overallScore} bold />
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
                        data-ocid={`scorecard.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`scorecard.delete_button.${idx + 1}`}
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
                    data-ocid="scorecard.empty_state"
                  >
                    Henüz kayıt yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="scorecard-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Skorkart Düzenle" : "Yeni Skorkart Ekle"}
            </DialogTitle>
            <DialogDescription id="scorecard-dialog-desc">
              Tedarikçi dönemsel performans puanlarını girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="scorecard.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Tedarikçi Adı</Label>
                <Input
                  value={form.supplierName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, supplierName: e.target.value }))
                  }
                  data-ocid="scorecard.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Dönem (örn. 2025-Q1)</Label>
                <Input
                  value={form.period}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, period: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Teslimat Puanı (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.deliveryScore}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      deliveryScore: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Kalite Puanı (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.qualityScore}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      qualityScore: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Fiyat Puanı (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.priceScore}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      priceScore: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>İletişim Puanı (0-100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.communicationScore}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      communicationScore: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notlar</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={2}
                  data-ocid="scorecard.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="scorecard.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="scorecard.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="scorecard-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="scorecard-del-desc">
              Bu skorkart kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="scorecard.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="scorecard.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function ScoreBar({ value, bold }: { value: number; bold?: boolean }) {
  const color =
    value >= 80 ? "bg-green-500" : value >= 50 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-xs ${bold ? "font-bold text-gray-800" : "text-gray-600"}`}
      >
        {value}
      </span>
    </div>
  );
}
