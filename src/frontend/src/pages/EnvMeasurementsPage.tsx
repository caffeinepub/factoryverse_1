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
import { Leaf, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface EnvMeasurement {
  id: string;
  companyId: string;
  measurementType: string;
  location: string;
  measurementDate: string;
  measuredValue: string;
  unit: string;
  limitValue: string;
  result: string;
  inspectorName: string;
  notes: string;
  createdAt: string;
}

const resultClass: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  Uyarı: "bg-yellow-100 text-yellow-800",
  Kritik: "bg-red-100 text-red-800",
};

const emptyForm = {
  measurementType: "Gürültü",
  location: "",
  measurementDate: "",
  measuredValue: "",
  unit: "",
  limitValue: "",
  result: "Normal",
  inspectorName: "",
  notes: "",
};

export function EnvMeasurementsPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<EnvMeasurement[]>([
    {
      id: "1",
      companyId,
      measurementType: "Gürültü",
      location: "Üretim Sahası A",
      measurementDate: "2026-01-15",
      measuredValue: "82",
      unit: "dB",
      limitValue: "85",
      result: "Normal",
      inspectorName: "İSG Uzmanı Ali Kaya",
      notes: "Limit değerlerin altında.",
      createdAt: "2026-01-15",
    },
    {
      id: "2",
      companyId,
      measurementType: "Toz",
      location: "Taşlama Bölümü",
      measurementDate: "2026-02-10",
      measuredValue: "12",
      unit: "mg/m³",
      limitValue: "10",
      result: "Uyarı",
      inspectorName: "Çevre Mühendisi Selin Çelik",
      notes: "Havalandırma sistemi kontrol edilmeli.",
      createdAt: "2026-02-10",
    },
    {
      id: "3",
      companyId,
      measurementType: "Hava Kalitesi",
      location: "Boya Kabini",
      measurementDate: "2026-03-05",
      measuredValue: "450",
      unit: "ppm VOC",
      limitValue: "300",
      result: "Kritik",
      inspectorName: "Dış Denetim Firması",
      notes: "Acil eylem planı hazırlandı.",
      createdAt: "2026-03-05",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EnvMeasurement | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<EnvMeasurement | null>(
    null,
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: EnvMeasurement) {
    setEditing(r);
    setForm({
      measurementType: r.measurementType,
      location: r.location,
      measurementDate: r.measurementDate,
      measuredValue: r.measuredValue,
      unit: r.unit,
      limitValue: r.limitValue,
      result: r.result,
      inspectorName: r.inspectorName,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.location.trim()) {
      toast.error("Konum zorunludur.");
      return;
    }
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
      toast.success("Güncellendi.");
    } else {
      const newRecord: EnvMeasurement = {
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

  function handleDelete(r: EnvMeasurement) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const stats = [
    { label: "Toplam Ölçüm", val: records.length, color: "indigo" },
    {
      label: "Normal",
      val: records.filter((r) => r.result === "Normal").length,
      color: "green",
    },
    {
      label: "Uyarı",
      val: records.filter((r) => r.result === "Uyarı").length,
      color: "yellow",
    },
    {
      label: "Kritik",
      val: records.filter((r) => r.result === "Kritik").length,
      color: "red",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Leaf className="text-emerald-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Çevre Ölçüm Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Çevresel ölçüm kayıtları ve limit değer karşılaştırması
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="env-measurements.primary_button"
          >
            <Plus size={16} className="mr-1" /> Ölçüm Ekle
          </Button>
        </div>

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
              data-ocid="env-measurements.empty_state"
            >
              Henüz ölçüm kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ölçüm Tipi",
                      "Konum",
                      "Ölçüm Tarihi",
                      "Ölçülen",
                      "Limit",
                      "Ölçüm Yapan",
                      "Sonuç",
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
                      data-ocid={`env-measurements.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.measurementType}
                      </td>
                      <td className="px-4 py-3">{r.location}</td>
                      <td className="px-4 py-3">{r.measurementDate}</td>
                      <td className="px-4 py-3">
                        {r.measuredValue} {r.unit}
                      </td>
                      <td className="px-4 py-3">
                        {r.limitValue} {r.unit}
                      </td>
                      <td className="px-4 py-3">{r.inspectorName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${resultClass[r.result] ?? "bg-gray-100"}`}
                        >
                          {r.result}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1 hover:text-indigo-600 text-gray-400"
                            data-ocid={`env-measurements.edit_button.${i + 1}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                            data-ocid={`env-measurements.delete_button.${i + 1}`}
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
            data-ocid="env-measurements.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Ölçüm Düzenle" : "Ölçüm Ekle"}
              </DialogTitle>
              <DialogDescription>
                Çevre ölçüm bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Ölçüm Tipi</Label>
                <Select
                  value={form.measurementType}
                  onValueChange={(v) => sf("measurementType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Gürültü",
                      "Toz",
                      "Hava Kalitesi",
                      "Su",
                      "Toprak",
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
                <Label>Konum *</Label>
                <Input
                  value={form.location}
                  onChange={(e) => sf("location", e.target.value)}
                  data-ocid="env-measurements.input"
                />
              </div>
              <div>
                <Label>Ölçüm Tarihi</Label>
                <Input
                  type="date"
                  value={form.measurementDate}
                  onChange={(e) => sf("measurementDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Ölçüm Yapan</Label>
                <Input
                  value={form.inspectorName}
                  onChange={(e) => sf("inspectorName", e.target.value)}
                />
              </div>
              <div>
                <Label>Ölçülen Değer</Label>
                <Input
                  value={form.measuredValue}
                  onChange={(e) => sf("measuredValue", e.target.value)}
                />
              </div>
              <div>
                <Label>Limit Değer</Label>
                <Input
                  value={form.limitValue}
                  onChange={(e) => sf("limitValue", e.target.value)}
                />
              </div>
              <div>
                <Label>Birim</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => sf("unit", e.target.value)}
                  placeholder="dB, mg/m³, ppm..."
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
                    {["Normal", "Uyarı", "Kritik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                data-ocid="env-measurements.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="env-measurements.submit_button"
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
              <DialogTitle>Ölçüm Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.measurementType} - {deleteConfirm?.location}{" "}
                kaydını silmek istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="env-measurements.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="env-measurements.confirm_button"
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
