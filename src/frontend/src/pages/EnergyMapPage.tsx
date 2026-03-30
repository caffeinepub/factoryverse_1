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
import { AlertTriangle, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface EnergyZone {
  id: string;
  companyId: string;
  zoneName: string;
  zoneType: string;
  energyType: string;
  monthlyConsumption: string;
  unit: string;
  monthlyCost: string;
  targetConsumption: string;
  meterNo: string;
  responsiblePerson: string;
  anomaly: string;
  notes: string;
}

const anomalyClass: Record<string, string> = {
  Normal: "bg-green-100 text-green-800",
  Uyarı: "bg-yellow-100 text-yellow-800",
  Kritik: "bg-red-100 text-red-800",
};

const emptyForm = {
  zoneName: "",
  zoneType: "Üretim Hattı",
  energyType: "Elektrik",
  monthlyConsumption: "",
  unit: "kWh",
  monthlyCost: "",
  targetConsumption: "",
  meterNo: "",
  responsiblePerson: "",
  anomaly: "Normal",
  notes: "",
};

export function EnergyMapPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [zones, setZones] = useState<EnergyZone[]>([
    {
      id: "1",
      companyId,
      zoneName: "Üretim Hattı A",
      zoneType: "Üretim Hattı",
      energyType: "Elektrik",
      monthlyConsumption: "45200",
      unit: "kWh",
      monthlyCost: "31640",
      targetConsumption: "40000",
      meterNo: "MTR-001",
      responsiblePerson: "Kadir Şahin",
      anomaly: "Uyarı",
      notes: "Hedefin %13 üzerinde tüketim",
    },
    {
      id: "2",
      companyId,
      zoneName: "Kompresör Odası",
      zoneType: "Yardımcı Tesis",
      energyType: "Elektrik",
      monthlyConsumption: "12800",
      unit: "kWh",
      monthlyCost: "8960",
      targetConsumption: "13000",
      meterNo: "MTR-002",
      responsiblePerson: "Levent Akça",
      anomaly: "Normal",
      notes: "",
    },
    {
      id: "3",
      companyId,
      zoneName: "Kazan Dairesi",
      zoneType: "Isıtma/Soğutma",
      energyType: "Doğalgaz",
      monthlyConsumption: "9800",
      unit: "m³",
      monthlyCost: "11760",
      targetConsumption: "8000",
      meterNo: "MTR-003",
      responsiblePerson: "Serkan Özdemir",
      anomaly: "Kritik",
      notes: "Isı yalıtım kaybı inceleniyor",
    },
    {
      id: "4",
      companyId,
      zoneName: "Ofis Bloğu",
      zoneType: "İdari",
      energyType: "Elektrik",
      monthlyConsumption: "5400",
      unit: "kWh",
      monthlyCost: "3780",
      targetConsumption: "6000",
      meterNo: "MTR-004",
      responsiblePerson: "İnsan Kaynakları",
      anomaly: "Normal",
      notes: "",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EnergyZone | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<EnergyZone | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(z: EnergyZone) {
    setEditing(z);
    setForm({
      zoneName: z.zoneName,
      zoneType: z.zoneType,
      energyType: z.energyType,
      monthlyConsumption: z.monthlyConsumption,
      unit: z.unit,
      monthlyCost: z.monthlyCost,
      targetConsumption: z.targetConsumption,
      meterNo: z.meterNo,
      responsiblePerson: z.responsiblePerson,
      anomaly: z.anomaly,
      notes: z.notes,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.zoneName.trim()) {
      toast.error("Bölge adı zorunludur.");
      return;
    }
    if (editing) {
      setZones((prev) =>
        prev.map((z) => (z.id === editing.id ? { ...z, ...form } : z)),
      );
      toast.success("Güncellendi.");
    } else {
      setZones((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Enerji bölgesi eklendi.");
    }
    setOpen(false);
  }

  function handleDelete(z: EnergyZone) {
    setZones((prev) => prev.filter((x) => x.id !== z.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const totalCost = zones.reduce((s, z) => s + (Number(z.monthlyCost) || 0), 0);
  const criticalZones = zones.filter((z) => z.anomaly === "Kritik").length;
  const warningZones = zones.filter((z) => z.anomaly === "Uyarı").length;

  const stats = [
    { label: "Toplam Bölge", val: zones.length, color: "indigo" },
    { label: "Kritik", val: criticalZones, color: "red" },
    { label: "Uyarı", val: warningZones, color: "orange" },
    {
      label: "Aylık Toplam Maliyet (₺)",
      val: totalCost.toLocaleString("tr-TR"),
      color: "purple",
    },
  ];

  function deviationPct(consumption: string, target: string) {
    const c = Number(consumption);
    const t = Number(target);
    if (!t) return null;
    const pct = Math.round(((c - t) / t) * 100);
    return pct;
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="text-green-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Tesis Enerji Haritası
              </h1>
              <p className="text-sm text-gray-500">
                Tesis bölgelerine göre enerji tüketimi ve maliyet haritalaması
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="energy-map.primary_button"
          >
            <Plus size={16} className="mr-1" /> Bölge Ekle
          </Button>
        </div>

        {(criticalZones > 0 || warningZones > 0) && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {criticalZones} kritik, {warningZones} uyarı seviyesinde enerji
              tüketim anomalisi tespit edildi.
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

        {/* Zone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.length === 0 ? (
            <div
              className="col-span-2 bg-white rounded-xl shadow-sm border p-8 text-center text-gray-400"
              data-ocid="energy-map.empty_state"
            >
              Henüz enerji bölgesi yok.
            </div>
          ) : (
            zones.map((z, i) => {
              const dev = deviationPct(
                z.monthlyConsumption,
                z.targetConsumption,
              );
              const consumptionPct = z.targetConsumption
                ? Math.min(
                    Math.round(
                      (Number(z.monthlyConsumption) /
                        Number(z.targetConsumption)) *
                        100,
                    ),
                    150,
                  )
                : 0;
              const barColor =
                z.anomaly === "Kritik"
                  ? "bg-red-500"
                  : z.anomaly === "Uyarı"
                    ? "bg-orange-400"
                    : "bg-green-500";
              return (
                <motion.div
                  key={z.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl shadow-sm border p-5"
                  data-ocid={`energy-map.item.${i + 1}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {z.zoneName}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${anomalyClass[z.anomaly] ?? "bg-gray-100"}`}
                        >
                          {z.anomaly}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {z.zoneType} · {z.energyType} · Sayaç:{" "}
                        {z.meterNo || "—"}
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                        <span>
                          Tüketim:{" "}
                          <span className="font-medium text-gray-800">
                            {Number(z.monthlyConsumption).toLocaleString(
                              "tr-TR",
                            )}{" "}
                            {z.unit}
                          </span>
                        </span>
                        <span>
                          Hedef:{" "}
                          <span className="font-medium text-gray-800">
                            {z.targetConsumption
                              ? `${Number(z.targetConsumption).toLocaleString("tr-TR")} ${z.unit}`
                              : "—"}
                          </span>
                        </span>
                        <span>
                          Aylık Maliyet:{" "}
                          <span className="font-medium text-gray-800">
                            ₺{Number(z.monthlyCost).toLocaleString("tr-TR")}
                          </span>
                        </span>
                        <span>
                          Sorumlu:{" "}
                          <span className="font-medium text-gray-800">
                            {z.responsiblePerson || "—"}
                          </span>
                        </span>
                      </div>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          Tüketim / Hedef
                        </span>
                        {dev !== null && (
                          <span
                            className={`text-xs font-semibold ${dev > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {dev > 0 ? `+${dev}%` : `${dev}%`}
                          </span>
                        )}
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${Math.min(consumptionPct, 100)}%` }}
                        />
                      </div>
                      {z.notes && (
                        <p className="text-xs text-gray-400 mt-2">{z.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(z)}
                        className="p-1 hover:text-indigo-600 text-gray-400"
                        data-ocid={`energy-map.edit_button.${i + 1}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(z)}
                        className="p-1 hover:text-red-500 text-gray-400"
                        data-ocid={`energy-map.delete_button.${i + 1}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            className="max-w-lg max-h-[90vh] overflow-y-auto"
            data-ocid="energy-map.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Bölge Düzenle" : "Enerji Bölgesi Ekle"}
              </DialogTitle>
              <DialogDescription>
                Tesis bölgesi enerji tüketim bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Bölge Adı *</Label>
                <Input
                  value={form.zoneName}
                  onChange={(e) => sf("zoneName", e.target.value)}
                  data-ocid="energy-map.input"
                />
              </div>
              <div>
                <Label>Bölge Türü</Label>
                <Select
                  value={form.zoneType}
                  onValueChange={(v) => sf("zoneType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Üretim Hattı",
                      "Yardımcı Tesis",
                      "Isıtma/Soğutma",
                      "İdari",
                      "Depo",
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
                <Label>Enerji Türü</Label>
                <Select
                  value={form.energyType}
                  onValueChange={(v) => sf("energyType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Elektrik", "Doğalgaz", "Su", "Buhar", "Yakıt"].map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Aylık Tüketim</Label>
                <Input
                  type="number"
                  value={form.monthlyConsumption}
                  onChange={(e) => sf("monthlyConsumption", e.target.value)}
                />
              </div>
              <div>
                <Label>Birim</Label>
                <Select value={form.unit} onValueChange={(v) => sf("unit", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["kWh", "m³", "litre", "kg", "kcal"].map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hedef Tüketim</Label>
                <Input
                  type="number"
                  value={form.targetConsumption}
                  onChange={(e) => sf("targetConsumption", e.target.value)}
                />
              </div>
              <div>
                <Label>Aylık Maliyet (₺)</Label>
                <Input
                  type="number"
                  value={form.monthlyCost}
                  onChange={(e) => sf("monthlyCost", e.target.value)}
                />
              </div>
              <div>
                <Label>Sayaç No</Label>
                <Input
                  value={form.meterNo}
                  onChange={(e) => sf("meterNo", e.target.value)}
                />
              </div>
              <div>
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsiblePerson}
                  onChange={(e) => sf("responsiblePerson", e.target.value)}
                />
              </div>
              <div>
                <Label>Anomali Durumu</Label>
                <Select
                  value={form.anomaly}
                  onValueChange={(v) => sf("anomaly", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Normal", "Uyarı", "Kritik"].map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
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
                data-ocid="energy-map.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="energy-map.submit_button"
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
              <DialogTitle>Bölgeyi Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.zoneName} bölgesini silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="energy-map.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="energy-map.confirm_button"
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
