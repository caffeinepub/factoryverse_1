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
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface ShiftSchedule {
  id: string;
  companyId: string;
  employeeName: string;
  department: string;
  shiftType: "Sabah" | "Öğle" | "Gece";
  date: string;
  startTime: string;
  endTime: string;
  status: "Planlandı" | "Tamamlandı" | "İptal";
  notes: string;
}

const statusClass: Record<string, string> = {
  Planlandı: "bg-blue-100 text-blue-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-red-100 text-red-800",
};

const shiftClass: Record<string, string> = {
  Sabah: "bg-yellow-100 text-yellow-800",
  Öğle: "bg-sky-100 text-sky-800",
  Gece: "bg-purple-100 text-purple-800",
};

const emptyForm = {
  employeeName: "",
  department: "",
  shiftType: "Sabah" as ShiftSchedule["shiftType"],
  date: "",
  startTime: "",
  endTime: "",
  status: "Planlandı" as ShiftSchedule["status"],
  notes: "",
};

export function PersonnelShiftSchedulePage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<ShiftSchedule[]>([
    {
      id: "1",
      companyId,
      employeeName: "Ahmet Kaya",
      department: "Üretim",
      shiftType: "Sabah",
      date: "2026-04-01",
      startTime: "06:00",
      endTime: "14:00",
      status: "Planlandı",
      notes: "",
    },
    {
      id: "2",
      companyId,
      employeeName: "Fatma Demir",
      department: "Kalite Kontrol",
      shiftType: "Öğle",
      date: "2026-04-01",
      startTime: "14:00",
      endTime: "22:00",
      status: "Planlandı",
      notes: "",
    },
    {
      id: "3",
      companyId,
      employeeName: "Mehmet Yılmaz",
      department: "Bakım",
      shiftType: "Gece",
      date: "2026-03-31",
      startTime: "22:00",
      endTime: "06:00",
      status: "Tamamlandı",
      notes: "Sorunsuz tamamlandı.",
    },
    {
      id: "4",
      companyId,
      employeeName: "Zeynep Arslan",
      department: "Depo",
      shiftType: "Sabah",
      date: "2026-03-30",
      startTime: "06:00",
      endTime: "14:00",
      status: "İptal",
      notes: "Personel izin talebi.",
    },
  ]);

  const [filter, setFilter] = useState<string>("Tümü");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const filtered =
    filter === "Tümü" ? records : records.filter((r) => r.shiftType === filter);

  const sabahCount = records.filter((r) => r.shiftType === "Sabah").length;
  const ogleCount = records.filter((r) => r.shiftType === "Öğle").length;
  const geceCount = records.filter((r) => r.shiftType === "Gece").length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: ShiftSchedule) => {
    setForm({
      employeeName: r.employeeName,
      department: r.department,
      shiftType: r.shiftType,
      date: r.date,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      notes: r.notes,
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
      toast.success("Vardiya eklendi");
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
    { label: "Sabah Vardiyası", value: sabahCount, color: "text-yellow-600" },
    { label: "Öğle Vardiyası", value: ogleCount, color: "text-sky-600" },
    { label: "Gece Vardiyası", value: geceCount, color: "text-purple-600" },
  ];

  const filterTabs = ["Tümü", "Sabah", "Öğle", "Gece"];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <CalendarDays className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Personel Vardiya Çizelgesi
              </h1>
              <p className="text-sm text-gray-500">
                Personel vardiya planlarını ve çizelgelerini yönetin
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="shift-schedule.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Ekle
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

        <div className="flex gap-2" data-ocid="shift-schedule.tab">
          {filterTabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === t
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="shift-schedule.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Personel</th>
                <th className="px-4 py-3">Departman</th>
                <th className="px-4 py-3">Vardiya</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Başlangıç</th>
                <th className="px-4 py-3">Bitiş</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr
                  key={r.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                  data-ocid={`shift-schedule.item.${idx + 1}`}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {r.employeeName}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.department}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        shiftClass[r.shiftType] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.shiftType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.date}</td>
                  <td className="px-4 py-3 text-gray-600">{r.startTime}</td>
                  <td className="px-4 py-3 text-gray-600">{r.endTime}</td>
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
                        data-ocid={`shift-schedule.edit_button.${idx + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteId(r.id)}
                        className="text-gray-400 hover:text-red-500"
                        data-ocid={`shift-schedule.delete_button.${idx + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="shift-schedule.empty_state"
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
          aria-describedby="shift-schedule-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>
              {editId ? "Vardiyayı Düzenle" : "Yeni Vardiya"}
            </DialogTitle>
            <DialogDescription id="shift-schedule-dialog-desc">
              Vardiya bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="shift-schedule.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Personel Adı</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, employeeName: e.target.value }))
                  }
                  data-ocid="shift-schedule.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, department: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Vardiya Tipi</Label>
                <Select
                  value={form.shiftType}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      shiftType: v as ShiftSchedule["shiftType"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="shift-schedule.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Sabah", "Öğle", "Gece"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tarih</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
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
                      status: v as ShiftSchedule["status"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Planlandı", "Tamamlandı", "İptal"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Başlangıç Saati</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Bitiş Saati</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, endTime: e.target.value }))
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
                  data-ocid="shift-schedule.textarea"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="shift-schedule.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="shift-schedule.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="shift-schedule-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="shift-schedule-del-desc">
              Bu vardiya kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="shift-schedule.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="shift-schedule.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
