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
import { ArrowRightLeft, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface PersonnelRotation {
  id: string;
  companyId: string;
  personnelName: string;
  currentDepartment: string;
  currentPosition: string;
  targetDepartment: string;
  targetPosition: string;
  rotationDate: string;
  duration: string;
  reason: string;
  status: "Planlandı" | "Aktif" | "Tamamlandı" | "İptal";
  approvedBy: string;
}

const statusClass: Record<string, string> = {
  Planlandı: "bg-blue-100 text-blue-800",
  Aktif: "bg-green-100 text-green-800",
  Tamamlandı: "bg-gray-100 text-gray-700",
  İptal: "bg-red-100 text-red-800",
};

const emptyForm = {
  personnelName: "",
  currentDepartment: "",
  currentPosition: "",
  targetDepartment: "",
  targetPosition: "",
  rotationDate: "",
  duration: "",
  reason: "",
  status: "Planlandı" as PersonnelRotation["status"],
  approvedBy: "",
};

export function PersonnelRotationPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<PersonnelRotation[]>([
    {
      id: "1",
      companyId,
      personnelName: "Ahmet Kaya",
      currentDepartment: "Üretim",
      currentPosition: "Operatör",
      targetDepartment: "Kalite Kontrol",
      targetPosition: "Kalite Teknisyeni",
      rotationDate: "2026-04-01",
      duration: "3 Ay",
      reason: "Çok yönlü yetkinlik geliştirme",
      status: "Planlandı",
      approvedBy: "Müdür Yılmaz",
    },
    {
      id: "2",
      companyId,
      personnelName: "Zeynep Arslan",
      currentDepartment: "Depo & Lojistik",
      currentPosition: "Depo Sorumlusu",
      targetDepartment: "Satın Alma",
      targetPosition: "Satın Alma Uzmanı",
      rotationDate: "2026-03-01",
      duration: "6 Ay",
      reason: "Kariyer gelişimi",
      status: "Aktif",
      approvedBy: "İK Direktörü",
    },
    {
      id: "3",
      companyId,
      personnelName: "Mehmet Demir",
      currentDepartment: "Bakım",
      currentPosition: "Bakım Teknisyeni",
      targetDepartment: "Üretim",
      targetPosition: "Üretim Teknisyeni",
      rotationDate: "2025-10-01",
      duration: "3 Ay",
      reason: "Üretim bilgisi kazanımı",
      status: "Tamamlandı",
      approvedBy: "Fabrika Müdürü",
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

  const openEdit = (r: PersonnelRotation) => {
    setForm({
      personnelName: r.personnelName,
      currentDepartment: r.currentDepartment,
      currentPosition: r.currentPosition,
      targetDepartment: r.targetDepartment,
      targetPosition: r.targetPosition,
      rotationDate: r.rotationDate,
      duration: r.duration,
      reason: r.reason,
      status: r.status,
      approvedBy: r.approvedBy,
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
      toast.success("Rotasyon planı eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const activeCount = records.filter((r) => r.status === "Aktif").length;
  const plannedCount = records.filter((r) => r.status === "Planlandı").length;

  const stats = [
    {
      label: "Toplam Rotasyon",
      value: records.length,
      color: "text-indigo-600",
    },
    { label: "Aktif", value: activeCount, color: "text-green-600" },
    { label: "Planlandı", value: plannedCount, color: "text-blue-600" },
    {
      label: "Tamamlanan",
      value: records.filter((r) => r.status === "Tamamlandı").length,
      color: "text-gray-600",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ArrowRightLeft className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Personel Rotasyon Planı
              </h1>
              <p className="text-sm text-gray-500">
                Departmanlar arası personel rotasyonlarını planlayın
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
          >
            + Rotasyon Ekle
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

        <div className="space-y-3">
          {records.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-semibold text-gray-900">
                      {r.personnelName}
                    </p>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {r.currentDepartment} / {r.currentPosition}
                    </span>
                    <ArrowRightLeft size={14} className="text-indigo-400" />
                    <span className="bg-indigo-50 px-2 py-0.5 rounded text-xs text-indigo-700">
                      {r.targetDepartment} / {r.targetPosition}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>
                      Tarih: <strong>{r.rotationDate}</strong>
                    </span>
                    <span>
                      Süre: <strong>{r.duration}</strong>
                    </span>
                    <span>
                      Onaylayan: <strong>{r.approvedBy}</strong>
                    </span>
                  </div>
                  {r.reason && (
                    <p className="mt-1 text-xs text-gray-400 italic">
                      {r.reason}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(r)}
                    className="text-gray-400 hover:text-indigo-600"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {records.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
              Henüz rotasyon kaydı yok
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby="pr-dialog-desc">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Rotasyonu Düzenle" : "Yeni Rotasyon"}
            </DialogTitle>
            <DialogDescription id="pr-dialog-desc">
              Personel rotasyon bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Personel Adı</Label>
                <Input
                  value={form.personnelName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, personnelName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Mevcut Departman</Label>
                <Input
                  value={form.currentDepartment}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      currentDepartment: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Mevcut Pozisyon</Label>
                <Input
                  value={form.currentPosition}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currentPosition: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Hedef Departman</Label>
                <Input
                  value={form.targetDepartment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, targetDepartment: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Hedef Pozisyon</Label>
                <Input
                  value={form.targetPosition}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, targetPosition: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Rotasyon Tarihi</Label>
                <Input
                  type="date"
                  value={form.rotationDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rotationDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Süre (örn. 3 Ay)</Label>
                <Input
                  value={form.duration}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, duration: e.target.value }))
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
                      status: v as PersonnelRotation["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Planlandı", "Aktif", "Tamamlandı", "İptal"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Onaylayan</Label>
                <Input
                  value={form.approvedBy}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, approvedBy: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Gerekçe</Label>
                <Input
                  value={form.reason}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, reason: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="pr-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="pr-del-desc">
              Bu rotasyon kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
