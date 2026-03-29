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
import { Pencil, Plus, Trash2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddEnergyRecord,
  useDeleteEnergyRecord,
  useGetEnergyRecords,
  useUpdateEnergyRecord,
} from "../hooks/useQueries";
import type { EnergyRecord } from "../types";

const typeLabels: Record<string, string> = {
  electric: "Elektrik",
  water: "Su",
  gas: "Doğalgaz",
  fuel: "Yakıt",
  other: "Diğer",
};

const typeClass: Record<string, string> = {
  electric: "bg-yellow-100 text-yellow-800",
  water: "bg-blue-100 text-blue-800",
  gas: "bg-orange-100 text-orange-800",
  fuel: "bg-red-100 text-red-800",
  other: "bg-gray-100 text-gray-700",
};

const unitOptions: Record<string, string> = {
  electric: "kWh",
  water: "m³",
  gas: "m³",
  fuel: "L",
  other: "Birim",
};

const empty = {
  energyType: "electric",
  period: "",
  location: "",
  unit: "kWh",
  consumption: "",
  cost: "",
  notes: "",
};

export function EnergyPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? "") : "";

  const { data: records = [], isLoading } = useGetEnergyRecords(userCode);
  const addRecord = useAddEnergyRecord();
  const updateRecord = useUpdateEnergyRecord();
  const deleteRecord = useDeleteEnergyRecord();

  const [filterType, setFilterType] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editItem, setEditItem] = useState<EnergyRecord | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = records.filter((r) =>
    filterType === "all" ? true : r.energyType === filterType,
  );

  const totalCost = records.reduce((sum, r) => {
    const n = Number.parseFloat(r.cost);
    return sum + (Number.isNaN(n) ? 0 : n);
  }, 0);

  const electricCost = records
    .filter((r) => r.energyType === "electric")
    .reduce((sum, r) => sum + (Number.parseFloat(r.cost) || 0), 0);

  function openAdd() {
    setEditItem(null);
    setForm({ ...empty });
    setShowDialog(true);
  }

  function openEdit(r: EnergyRecord) {
    setEditItem(r);
    setForm({
      energyType: r.energyType,
      period: r.period,
      location: r.location,
      unit: r.unit,
      consumption: r.consumption,
      cost: r.cost,
      notes: r.notes,
    });
    setShowDialog(true);
  }

  async function handleSubmit() {
    if (!form.period.trim() || !form.consumption.trim()) {
      toast.error("Dönem ve tüketim gerekli");
      return;
    }
    try {
      if (editItem) {
        await updateRecord.mutateAsync({
          adminCode,
          recordId: editItem.id,
          ...form,
        });
        toast.success("Kayıt güncellendi");
      } else {
        await addRecord.mutateAsync({ adminCode, ...form });
        toast.success("Kayıt eklendi");
      }
      setShowDialog(false);
    } catch {
      toast.error("İşlem başarısız");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRecord.mutateAsync({ adminCode, recordId: deleteTarget });
      toast.success("Kayıt silindi");
      setDeleteTarget(null);
    } catch {
      toast.error("Silme başarısız");
    }
  }

  const f = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Zap className="text-yellow-600" size={24} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Enerji Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Elektrik, su, gaz ve yakıt tüketimini izleyin
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="energy.open_modal_button"
            >
              <Plus size={16} className="mr-1" /> Kayıt Ekle
            </Button>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Toplam Kayıt",
              value: records.length,
              color: "text-indigo-600",
            },
            {
              label: "Toplam Maliyet",
              value: `₺${totalCost.toLocaleString("tr-TR")}`,
              color: "text-green-600",
            },
            {
              label: "Elektrik Maliyeti",
              value: `₺${electricCost.toLocaleString("tr-TR")}`,
              color: "text-yellow-600",
            },
          ].map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>{c.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44" data-ocid="energy.select">
              <SelectValue placeholder="Tür" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Türler</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          {isLoading ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="energy.loading_state"
            >
              Yükleniyor…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="energy.empty_state"
            >
              Kayıt bulunamadı
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  {[
                    "Tür",
                    "Dönem",
                    "Konum",
                    "Tüketim",
                    "Maliyet",
                    "Notlar",
                    "",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-50 transition-colors"
                    data-ocid={`energy.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeClass[r.energyType] ?? "bg-gray-100 text-gray-700"}`}
                      >
                        {typeLabels[r.energyType] ?? r.energyType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.period}</td>
                    <td className="px-4 py-3 text-gray-600">{r.location}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {r.consumption} {r.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      ₺
                      {Number.parseFloat(r.cost || "0").toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {r.notes || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEdit(r)}
                            data-ocid={`energy.edit_button.${idx + 1}`}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeleteTarget(r.id)}
                            data-ocid={`energy.delete_button.${idx + 1}`}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="energy-dialog-desc"
          data-ocid="energy.dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {editItem ? "Kayıt Düzenle" : "Yeni Kayıt Ekle"}
            </DialogTitle>
            <DialogDescription id="energy-dialog-desc">
              Enerji tüketim bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <Label>Enerji Türü</Label>
              <Select
                value={form.energyType}
                onValueChange={(v) => {
                  f("energyType", v);
                  f("unit", unitOptions[v] ?? "Birim");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Dönem (örn. 2026-01) *</Label>
              <Input
                value={form.period}
                onChange={(e) => f("period", e.target.value)}
                placeholder="YYYY-MM"
                data-ocid="energy.input"
              />
            </div>
            <div className="space-y-1">
              <Label>Konum / Tesis</Label>
              <Input
                value={form.location}
                onChange={(e) => f("location", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Birim</Label>
              <Input
                value={form.unit}
                onChange={(e) => f("unit", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Tüketim Miktarı *</Label>
              <Input
                type="number"
                value={form.consumption}
                onChange={(e) => f("consumption", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Maliyet (₺)</Label>
              <Input
                type="number"
                value={form.cost}
                onChange={(e) => f("cost", e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                rows={2}
                data-ocid="energy.textarea"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              data-ocid="energy.cancel_button"
            >
              İptal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={addRecord.isPending || updateRecord.isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="energy.submit_button"
            >
              {editItem ? "Güncelle" : "Ekle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <DialogContent
          aria-describedby="energy-del-desc"
          data-ocid="energy.modal"
        >
          <DialogHeader>
            <DialogTitle>Kaydı Sil</DialogTitle>
            <DialogDescription id="energy-del-desc">
              Bu kaydı silmek istediğinize emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="energy.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteRecord.isPending}
              data-ocid="energy.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
