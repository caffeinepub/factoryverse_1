import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { BarChart2, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface EquipmentUtilization {
  id: string;
  name: string;
  department: string;
  plannedHours: number;
  actualHours: number;
  notes: string;
}

const sampleData: EquipmentUtilization[] = [
  {
    id: "1",
    name: "CNC Tezgah #1",
    department: "Üretim",
    plannedHours: 160,
    actualHours: 148,
    notes: "Verimli çalışıyor",
  },
  {
    id: "2",
    name: "Kaynak Makinesi",
    department: "Montaj",
    plannedHours: 120,
    actualHours: 72,
    notes: "Bakım gerekli",
  },
  {
    id: "3",
    name: "Hidrolik Pres",
    department: "İmalat",
    plannedHours: 200,
    actualHours: 40,
    notes: "Arıza var",
  },
  {
    id: "4",
    name: "Lazer Kesim",
    department: "Üretim",
    plannedHours: 180,
    actualHours: 162,
    notes: "Optimum",
  },
  {
    id: "5",
    name: "Torna Tezgahı",
    department: "Makine",
    plannedHours: 140,
    actualHours: 95,
    notes: "Operatör eksikliği",
  },
];

function getEfficiencyBadge(pct: number) {
  if (pct >= 80)
    return <Badge className="bg-green-100 text-green-800">Yüksek</Badge>;
  if (pct >= 50)
    return <Badge className="bg-yellow-100 text-yellow-800">Orta</Badge>;
  return <Badge className="bg-red-100 text-red-800">Düşük</Badge>;
}

function getBarColor(pct: number) {
  if (pct >= 80) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

const emptyForm: Omit<EquipmentUtilization, "id"> = {
  name: "",
  department: "",
  plannedHours: 0,
  actualHours: 0,
  notes: "",
};

export function EquipmentUtilizationPage() {
  const [records, setRecords] = useState<EquipmentUtilization[]>(sampleData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EquipmentUtilization | null>(null);
  const [form, setForm] = useState(emptyForm);

  const utilizationPct = (r: EquipmentUtilization) =>
    r.plannedHours > 0 ? Math.round((r.actualHours / r.plannedHours) * 100) : 0;

  const avgUtilization =
    records.length > 0
      ? Math.round(
          records.reduce((s, r) => s + utilizationPct(r), 0) / records.length,
        )
      : 0;
  const highCount = records.filter((r) => utilizationPct(r) >= 80).length;
  const lowCount = records.filter((r) => utilizationPct(r) < 50).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (r: EquipmentUtilization) => {
    setEditing(r);
    setForm({
      name: r.name,
      department: r.department,
      plannedHours: r.plannedHours,
      actualHours: r.actualHours,
      notes: r.notes,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)),
      );
    } else {
      setRecords((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <BarChart2 className="text-primary" size={26} />
            Teçhizat Kullanım Analizi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ekipman kullanım oranları ve verimlilik takibi
          </p>
        </div>
        <Button
          onClick={openAdd}
          data-ocid="equipment-utilization.primary_button"
        >
          <Plus size={16} className="mr-2" /> Yeni Ekipman
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Toplam Ekipman</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {records.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Ort. Kullanım</p>
          <p className="text-3xl font-bold text-primary mt-1">
            {avgUtilization}%
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4 flex gap-4">
          <div>
            <p className="text-muted-foreground text-xs">Yüksek ≥80%</p>
            <p className="text-2xl font-bold text-green-600">{highCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Düşük &lt;50%</p>
            <p className="text-2xl font-bold text-red-600">{lowCount}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Ekipman
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Departman
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Planlanan
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Gerçek
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Kullanım
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Verimlilik
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => {
              const pct = utilizationPct(r);
              return (
                <tr
                  key={r.id}
                  className="border-t hover:bg-muted/20"
                  data-ocid={`equipment-utilization.item.${i + 1}`}
                >
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.department}
                  </td>
                  <td className="px-4 py-3">{r.plannedHours}h</td>
                  <td className="px-4 py-3">{r.actualHours}h</td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getBarColor(pct)}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium w-9">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{getEfficiencyBadge(pct)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(r)}
                        data-ocid={`equipment-utilization.edit_button.${i + 1}`}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(r.id)}
                        data-ocid={`equipment-utilization.delete_button.${i + 1}`}
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {records.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                  data-ocid="equipment-utilization.empty_state"
                >
                  Henüz kayıt yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="equipment-utilization.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ekipman Düzenle" : "Yeni Ekipman"}
            </DialogTitle>
            <DialogDescription>
              Ekipman kullanım bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Ekipman Adı</Label>
              <Input
                data-ocid="equipment-utilization.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ekipman adı"
              />
            </div>
            <div>
              <Label>Departman</Label>
              <Input
                value={form.department}
                onChange={(e) =>
                  setForm((p) => ({ ...p, department: e.target.value }))
                }
                placeholder="Departman"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Planlanan Saat</Label>
                <Input
                  type="number"
                  value={form.plannedHours}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      plannedHours: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div>
                <Label>Gerçek Saat</Label>
                <Input
                  type="number"
                  value={form.actualHours}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      actualHours: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Notlar..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                data-ocid="equipment-utilization.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="equipment-utilization.submit_button"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
