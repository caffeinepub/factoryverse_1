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
import { CalendarPlus, CheckCircle, Plus, Trash2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface LeaveRequest {
  id: string;
  personelAdi: string;
  izinTipi:
    | "Yıllık İzin"
    | "Mazeret İzni"
    | "Hastalık İzni"
    | "Doğum İzni"
    | "Ücretsiz İzin";
  baslangicTarihi: string;
  bitisTarihi: string;
  gunSayisi: number;
  onaylayanKisi: string;
  durum: "Beklemede" | "Onaylandı" | "Reddedildi";
  aciklama: string;
}

const statusClass: Record<string, string> = {
  Beklemede: "bg-amber-100 text-amber-800",
  Onaylandı: "bg-green-100 text-green-800",
  Reddedildi: "bg-red-100 text-red-800",
};

const izinTipiClass: Record<string, string> = {
  "Yıllık İzin": "bg-blue-100 text-blue-700",
  "Mazeret İzni": "bg-purple-100 text-purple-700",
  "Hastalık İzni": "bg-orange-100 text-orange-700",
  "Doğum İzni": "bg-pink-100 text-pink-700",
  "Ücretsiz İzin": "bg-gray-100 text-gray-700",
};

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

const emptyForm = {
  personelAdi: "",
  izinTipi: "Yıllık İzin" as LeaveRequest["izinTipi"],
  baslangicTarihi: "",
  bitisTarihi: "",
  gunSayisi: 0,
  onaylayanKisi: "",
  durum: "Beklemede" as LeaveRequest["durum"],
  aciklama: "",
};

const SEED: LeaveRequest[] = [
  {
    id: "1",
    personelAdi: "Ahmet Yılmaz",
    izinTipi: "Yıllık İzin",
    baslangicTarihi: "2026-04-07",
    bitisTarihi: "2026-04-11",
    gunSayisi: 5,
    onaylayanKisi: "Müdür Bey",
    durum: "Onaylandı",
    aciklama: "Tatil planı",
  },
  {
    id: "2",
    personelAdi: "Fatma Kaya",
    izinTipi: "Hastalık İzni",
    baslangicTarihi: "2026-04-01",
    bitisTarihi: "2026-04-03",
    gunSayisi: 3,
    onaylayanKisi: "",
    durum: "Beklemede",
    aciklama: "Doktor raporu mevcut",
  },
  {
    id: "3",
    personelAdi: "Mehmet Demir",
    izinTipi: "Mazeret İzni",
    baslangicTarihi: "2026-03-28",
    bitisTarihi: "2026-03-28",
    gunSayisi: 1,
    onaylayanKisi: "İK Müdürü",
    durum: "Reddedildi",
    aciklama: "Üretim yoğunluğu sebebiyle",
  },
  {
    id: "4",
    personelAdi: "Zeynep Çelik",
    izinTipi: "Doğum İzni",
    baslangicTarihi: "2026-05-01",
    bitisTarihi: "2026-07-31",
    gunSayisi: 92,
    onaylayanKisi: "",
    durum: "Beklemede",
    aciklama: "Doğum öncesi hazırlık",
  },
  {
    id: "5",
    personelAdi: "Emre Şahin",
    izinTipi: "Yıllık İzin",
    baslangicTarihi: "2026-04-14",
    bitisTarihi: "2026-04-18",
    gunSayisi: 5,
    onaylayanKisi: "Üretim Şefi",
    durum: "Onaylandı",
    aciklama: "",
  },
];

export function LeaveRequestsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? "guest";
  const isAdmin = session?.userType === "admin";

  const storageKey = `leave_requests_${userCode}`;
  const [records, setRecords] = useState<LeaveRequest[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : SEED;
    } catch {
      return SEED;
    }
  });

  const save = (updated: LeaveRequest[]) => {
    setRecords(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [filterTip, setFilterTip] = useState<string>("Tümü");
  const [filterDurum, setFilterDurum] = useState<string>("Tümü");

  const filtered = records
    .filter((r) => filterTip === "Tümü" || r.izinTipi === filterTip)
    .filter((r) => filterDurum === "Tümü" || r.durum === filterDurum);

  const approved = records.filter((r) => r.durum === "Onaylandı").length;
  const pending = records.filter((r) => r.durum === "Beklemede").length;
  const rejected = records.filter((r) => r.durum === "Reddedildi").length;

  const stats = [
    { label: "Toplam Talep", value: records.length, color: "text-indigo-600" },
    { label: "Onaylanan", value: approved, color: "text-green-600" },
    { label: "Beklemede", value: pending, color: "text-amber-600" },
    { label: "Reddedilen", value: rejected, color: "text-red-600" },
  ];

  const handleApprove = (id: string, newDurum: LeaveRequest["durum"]) => {
    save(records.map((r) => (r.id === id ? { ...r, durum: newDurum } : r)));
    toast.success(
      newDurum === "Onaylandı" ? "İzin onaylandı" : "İzin reddedildi",
    );
  };

  const handleSave = () => {
    const days =
      form.gunSayisi || calcDays(form.baslangicTarihi, form.bitisTarihi);
    const newRec: LeaveRequest = {
      id: Date.now().toString(),
      ...form,
      gunSayisi: days,
    };
    save([newRec, ...records]);
    toast.success("İzin talebi eklendi");
    setDialogOpen(false);
    setForm({ ...emptyForm });
  };

  const handleDelete = () => {
    save(records.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <CalendarPlus className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                İzin Talep Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Personel izin taleplerini yönetin ve onaylayın
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setDialogOpen(true)}
              data-ocid="leavereq.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Yeni Talep
            </Button>
          )}
        </div>

        {/* Stats */}
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

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">Filtrele:</span>
          <div className="w-48">
            <Select value={filterTip} onValueChange={setFilterTip}>
              <SelectTrigger data-ocid="leavereq.select">
                <SelectValue placeholder="İzin Tipi" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Tümü",
                  "Yıllık İzin",
                  "Mazeret İzni",
                  "Hastalık İzni",
                  "Doğum İzni",
                  "Ücretsiz İzin",
                ].map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={filterDurum} onValueChange={setFilterDurum}>
              <SelectTrigger>
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                {["Tümü", "Beklemede", "Onaylandı", "Reddedildi"].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="leavereq.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Personel</th>
                <th className="px-4 py-3">İzin Tipi</th>
                <th className="px-4 py-3">Başlangıç</th>
                <th className="px-4 py-3">Bitiş</th>
                <th className="px-4 py-3">Gün</th>
                <th className="px-4 py-3">Durum</th>
                {isAdmin && <th className="px-4 py-3">İşlem</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`leavereq.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.personelAdi}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${izinTipiClass[r.izinTipi] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      {r.izinTipi}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {r.baslangicTarihi}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.bitisTarihi}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700">
                    {r.gunSayisi}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.durum] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {r.durum}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {r.durum === "Beklemede" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(r.id, "Onaylandı")}
                              className="text-green-500 hover:text-green-700"
                              title="Onayla"
                              data-ocid={`leavereq.confirm_button.${idx + 1}`}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(r.id, "Reddedildi")}
                              className="text-red-400 hover:text-red-600"
                              title="Reddet"
                              data-ocid={`leavereq.cancel_button.${idx + 1}`}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500 ml-1"
                          data-ocid={`leavereq.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="leavereq.empty_state"
                  >
                    Kayıt bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="leavereq-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>Yeni İzin Talebi</DialogTitle>
            <DialogDescription id="leavereq-dialog-desc">
              İzin talep bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="leavereq.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Personel Adı</Label>
                <Input
                  value={form.personelAdi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, personelAdi: e.target.value }))
                  }
                  data-ocid="leavereq.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>İzin Tipi</Label>
                <Select
                  value={form.izinTipi}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      izinTipi: v as LeaveRequest["izinTipi"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="leavereq.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Yıllık İzin",
                      "Mazeret İzni",
                      "Hastalık İzni",
                      "Doğum İzni",
                      "Ücretsiz İzin",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.baslangicTarihi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, baslangicTarihi: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.bitisTarihi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bitisTarihi: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Gün Sayısı</Label>
                <Input
                  type="number"
                  value={
                    form.gunSayisi ||
                    calcDays(form.baslangicTarihi, form.bitisTarihi)
                  }
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      gunSayisi: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Onaylayan Kişi</Label>
                <Input
                  value={form.onaylayanKisi}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, onaylayanKisi: e.target.value }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Açıklama (opsiyonel)</Label>
                <Input
                  value={form.aciklama}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, aciklama: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="leavereq.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="leavereq.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="leavereq-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="leavereq-del-desc">
              Bu izin talebi kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="leavereq.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="leavereq.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
