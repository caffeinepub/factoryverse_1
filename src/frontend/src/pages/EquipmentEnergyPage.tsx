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
import { Pencil, Trash2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface EnergyRecord {
  id: string;
  companyId: string;
  equipmentName: string;
  equipmentCode: string;
  location: string;
  energyType: "Elektrik" | "Doğalgaz" | "Buhar";
  period: string;
  targetConsumption: number;
  actualConsumption: number;
  cost: number;
  notes: string;
}

const energyTypeUnit: Record<string, string> = {
  Elektrik: "kWh",
  Doğalgaz: "m³",
  Buhar: "ton",
};

const emptyForm = {
  equipmentName: "",
  equipmentCode: "",
  location: "",
  energyType: "Elektrik" as EnergyRecord["energyType"],
  period: "",
  targetConsumption: 0,
  actualConsumption: 0,
  cost: 0,
  notes: "",
};

export function EquipmentEnergyPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<EnergyRecord[]>([
    {
      id: "1",
      companyId,
      equipmentName: "CNC Torna Tezgahı",
      equipmentCode: "CNC-001",
      location: "Üretim Hattı A",
      energyType: "Elektrik",
      period: "2026-03",
      targetConsumption: 1200,
      actualConsumption: 1450,
      cost: 4350,
      notes: "Hedef aşımı inceleniyor",
    },
    {
      id: "2",
      companyId,
      equipmentName: "Kompresör K-200",
      equipmentCode: "KMP-002",
      location: "Kompresör Odası",
      energyType: "Elektrik",
      period: "2026-03",
      targetConsumption: 800,
      actualConsumption: 760,
      cost: 2280,
      notes: "",
    },
    {
      id: "3",
      companyId,
      equipmentName: "Isıtma Kazanı",
      equipmentCode: "KZN-001",
      location: "Enerji Merkezi",
      energyType: "Doğalgaz",
      period: "2026-03",
      targetConsumption: 500,
      actualConsumption: 480,
      cost: 3360,
      notes: "Verimli çalışıyor",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const overTargetCount = records.filter(
    (r) => r.actualConsumption > r.targetConsumption,
  ).length;
  const totalConsumption = records
    .filter((r) => r.energyType === "Elektrik")
    .reduce((s, r) => s + r.actualConsumption, 0);
  const totalCost = records.reduce((s, r) => s + r.cost, 0);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: EnergyRecord) => {
    setForm({
      equipmentName: r.equipmentName,
      equipmentCode: r.equipmentCode,
      location: r.location,
      energyType: r.energyType,
      period: r.period,
      targetConsumption: r.targetConsumption,
      actualConsumption: r.actualConsumption,
      cost: r.cost,
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
      toast.success("Kayıt eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Kayıt silindi");
  };

  const stats = [
    {
      label: "Toplam Ekipman",
      value: records.length,
      color: "text-yellow-600",
    },
    {
      label: "Toplam Tüketim (kWh)",
      value: totalConsumption.toLocaleString("tr-TR"),
      color: "text-indigo-600",
    },
    {
      label: "Toplam Maliyet",
      value: `₺${totalCost.toLocaleString("tr-TR")}`,
      color: "text-green-600",
    },
    { label: "Hedef Aşımı", value: overTargetCount, color: "text-red-600" },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Zap className="text-yellow-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Ekipman Enerji Tüketimi
              </h1>
              <p className="text-sm text-gray-500">
                Ekipman bazlı enerji tüketimini ve maliyetleri takip edin
              </p>
            </div>
          </div>
          <Button
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={openAdd}
            data-ocid="equipment-energy.primary_button"
          >
            + Kayıt Ekle
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
                <th className="px-4 py-3">Ekipman</th>
                <th className="px-4 py-3">Konum</th>
                <th className="px-4 py-3">Enerji Türü</th>
                <th className="px-4 py-3">Dönem</th>
                <th className="px-4 py-3">Hedef</th>
                <th className="px-4 py-3">Gerçekleşen</th>
                <th className="px-4 py-3">İlerleme</th>
                <th className="px-4 py-3">Maliyet</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const pct = r.targetConsumption
                  ? Math.round(
                      (r.actualConsumption / r.targetConsumption) * 100,
                    )
                  : 0;
                const overTarget = r.actualConsumption > r.targetConsumption;
                const unit = energyTypeUnit[r.energyType] ?? "";
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    data-ocid={`equipment-energy.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {r.equipmentName}
                      </p>
                      <p className="text-xs text-gray-400">{r.equipmentCode}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.location}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {r.energyType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.period}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.targetConsumption.toLocaleString("tr-TR")} {unit}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {r.actualConsumption.toLocaleString("tr-TR")} {unit}
                    </td>
                    <td className="px-4 py-3 w-32">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            overTarget ? "bg-red-500" : "bg-green-500"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{pct}%</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ₺{r.cost.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      {overTarget ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Hedef Aşıldı
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          className="text-gray-400 hover:text-yellow-600"
                          data-ocid={`equipment-energy.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500"
                          data-ocid={`equipment-energy.delete_button.${idx + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="equipment-energy.empty_state"
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
        <DialogContent className="max-w-lg" aria-describedby="ee-dialog-desc">
          <DialogHeader>
            <DialogTitle>{editId ? "Kaydı Düzenle" : "Yeni Kayıt"}</DialogTitle>
            <DialogDescription id="ee-dialog-desc">
              Ekipman enerji tüketim bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Ekipman Adı</Label>
                <Input
                  value={form.equipmentName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, equipmentName: e.target.value }))
                  }
                  data-ocid="equipment-energy.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Ekipman Kodu</Label>
                <Input
                  value={form.equipmentCode}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, equipmentCode: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Konum</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Enerji Türü</Label>
                <Select
                  value={form.energyType}
                  onValueChange={(v) =>
                    setForm((p) => ({
                      ...p,
                      energyType: v as EnergyRecord["energyType"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="equipment-energy.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Elektrik", "Doğalgaz", "Buhar"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Dönem (YYYY-MM)</Label>
                <Input
                  value={form.period}
                  placeholder="2026-03"
                  onChange={(e) =>
                    setForm((p) => ({ ...p, period: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Hedef Tüketim</Label>
                <Input
                  type="number"
                  value={form.targetConsumption}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      targetConsumption: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Gerçekleşen Tüketim</Label>
                <Input
                  type="number"
                  value={form.actualConsumption}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      actualConsumption: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Maliyet (₺)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cost: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notlar</Label>
                <Input
                  value={form.notes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, notes: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="equipment-energy.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={handleSave}
              data-ocid="equipment-energy.save_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="ee-del-desc">
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="ee-del-desc">
              Bu kayıt kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="equipment-energy.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="equipment-energy.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
