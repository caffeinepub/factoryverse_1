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
  ClipboardCheck,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface VehicleInspectionRecord {
  id: string;
  companyId: string;
  plate: string;
  vehicleType: string;
  inspectionType: string;
  inspectorName: string;
  inspectionDate: string;
  result: string;
  nextInspectionDate: string;
  notes: string;
  createdAt: string;
}

const resultClass: Record<string, string> = {
  Geçti: "bg-green-100 text-green-800",
  Kaldı: "bg-red-100 text-red-800",
  Bekliyor: "bg-yellow-100 text-yellow-800",
};

const emptyForm = {
  plate: "",
  vehicleType: "",
  inspectionType: "Periyodik",
  inspectorName: "",
  inspectionDate: "",
  result: "Bekliyor",
  nextInspectionDate: "",
  notes: "",
};

export function VehicleInspectionPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<VehicleInspectionRecord[]>([
    {
      id: "1",
      companyId,
      plate: "34 ABC 123",
      vehicleType: "Kamyon",
      inspectionType: "Periyodik",
      inspectorName: "TÜVTÜRK Gebze",
      inspectionDate: "2025-12-10",
      result: "Geçti",
      nextInspectionDate: "2026-12-10",
      notes: "Tüm kontroller başarılı.",
      createdAt: "2025-12-10",
    },
    {
      id: "2",
      companyId,
      plate: "06 DEF 456",
      vehicleType: "Forklift",
      inspectionType: "LPG",
      inspectorName: "Ankara Muayene İstasyonu",
      inspectionDate: "2025-11-05",
      result: "Geçti",
      nextInspectionDate: "2026-04-15",
      notes: "",
      createdAt: "2025-11-05",
    },
    {
      id: "3",
      companyId,
      plate: "16 GHI 789",
      vehicleType: "Binek Araç",
      inspectionType: "Egzoz",
      inspectorName: "Bursa TÜVTÜRK",
      inspectionDate: "2025-10-20",
      result: "Kaldı",
      nextInspectionDate: "2026-03-25",
      notes: "Egzoz emisyon değerleri yüksek. Bakım gerekli.",
      createdAt: "2025-10-20",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VehicleInspectionRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<VehicleInspectionRecord | null>(null);

  const today = new Date();

  function nextDateBadge(dateStr: string) {
    if (!dateStr) return "bg-gray-100 text-gray-600";
    const diff =
      (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "bg-red-100 text-red-800";
    if (diff <= 30) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  }

  const approaching = records.filter((r) => {
    if (!r.nextInspectionDate) return false;
    const diff =
      (new Date(r.nextInspectionDate).getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: VehicleInspectionRecord) {
    setEditing(r);
    setForm({
      plate: r.plate,
      vehicleType: r.vehicleType,
      inspectionType: r.inspectionType,
      inspectorName: r.inspectorName,
      inspectionDate: r.inspectionDate,
      result: r.result,
      nextInspectionDate: r.nextInspectionDate,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.plate.trim()) {
      toast.error("Plaka zorunludur.");
      return;
    }
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
      toast.success("Güncellendi.");
    } else {
      const newRecord: VehicleInspectionRecord = {
        id: Date.now().toString(),
        companyId,
        ...form,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRecords((prev) => [newRecord, ...prev]);
      toast.success("Eklendi.");
    }
    setOpen(false);
  }

  function handleDelete(r: VehicleInspectionRecord) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const stats = [
    { label: "Toplam Kayıt", val: records.length, color: "indigo" },
    {
      label: "Geçti",
      val: records.filter((r) => r.result === "Geçti").length,
      color: "green",
    },
    {
      label: "Kaldı",
      val: records.filter((r) => r.result === "Kaldı").length,
      color: "red",
    },
    { label: "Yaklaşan (≤30 gün)", val: approaching, color: "orange" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardCheck className="text-blue-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Araç Muayene Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Araç periyodik muayene kayıtları ve takibi
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="vehicle-inspection.primary_button"
          >
            <Plus size={16} className="mr-1" /> Muayene Ekle
          </Button>
        </div>

        {approaching > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {approaching} aracın muayene tarihi 30 gün içinde!
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
              <p className={`text-3xl font-bold text-${c.color}-600`}>
                {c.val}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="vehicle-inspection.empty_state"
            >
              Henüz muayene kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Plaka",
                      "Araç Tipi",
                      "Muayene Tipi",
                      "Muayene Yeri",
                      "Muayene Tarihi",
                      "Sonuç",
                      "Sonraki Muayene",
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
                      data-ocid={`vehicle-inspection.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.plate}</td>
                      <td className="px-4 py-3">{r.vehicleType}</td>
                      <td className="px-4 py-3">{r.inspectionType}</td>
                      <td className="px-4 py-3">{r.inspectorName}</td>
                      <td className="px-4 py-3">{r.inspectionDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${resultClass[r.result] ?? "bg-gray-100"}`}
                        >
                          {r.result}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${nextDateBadge(r.nextInspectionDate)}`}
                        >
                          {r.nextInspectionDate}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1 hover:text-indigo-600 text-gray-400"
                            data-ocid={`vehicle-inspection.edit_button.${i + 1}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                            data-ocid={`vehicle-inspection.delete_button.${i + 1}`}
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
            data-ocid="vehicle-inspection.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Muayene Düzenle" : "Muayene Ekle"}
              </DialogTitle>
              <DialogDescription>
                Araç muayene bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Plaka *</Label>
                <Input
                  value={form.plate}
                  onChange={(e) => sf("plate", e.target.value)}
                  data-ocid="vehicle-inspection.input"
                />
              </div>
              <div>
                <Label>Araç Tipi</Label>
                <Input
                  value={form.vehicleType}
                  onChange={(e) => sf("vehicleType", e.target.value)}
                />
              </div>
              <div>
                <Label>Muayene Tipi</Label>
                <Select
                  value={form.inspectionType}
                  onValueChange={(v) => sf("inspectionType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Periyodik", "Egzoz", "LPG", "Kasko"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Muayene Yeri/Kişi</Label>
                <Input
                  value={form.inspectorName}
                  onChange={(e) => sf("inspectorName", e.target.value)}
                />
              </div>
              <div>
                <Label>Muayene Tarihi</Label>
                <Input
                  type="date"
                  value={form.inspectionDate}
                  onChange={(e) => sf("inspectionDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Sonuç</Label>
                <Select
                  value={form.result}
                  onValueChange={(v) => sf("result", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Geçti", "Kaldı", "Bekliyor"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Sonraki Muayene Tarihi</Label>
                <Input
                  type="date"
                  value={form.nextInspectionDate}
                  onChange={(e) => sf("nextInspectionDate", e.target.value)}
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
                data-ocid="vehicle-inspection.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="vehicle-inspection.submit_button"
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
              <DialogTitle>Muayene Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.plate} kaydını silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="vehicle-inspection.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="vehicle-inspection.confirm_button"
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
