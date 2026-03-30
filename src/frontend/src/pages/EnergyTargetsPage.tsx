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
import {
  useAddEnergyTarget,
  useDeleteEnergyTarget,
  useGetEnergyTargets,
  useUpdateEnergyTarget,
} from "../hooks/useQueries";
import type { EnergyEfficiencyTarget } from "../types";

const statusClass: Record<string, string> = {
  Hedefte: "bg-green-100 text-green-800",
  "Hedef Altı": "bg-red-100 text-red-800",
  İyileşiyor: "bg-blue-100 text-blue-800",
  Tamamlandı: "bg-purple-100 text-purple-800",
};

const emptyForm = {
  targetName: "",
  energyType: "Elektrik",
  baselineValue: "",
  targetValue: "",
  currentValue: "",
  unit: "kWh",
  year: new Date().getFullYear().toString(),
  period: "Yıllık",
  responsible: "",
  measures: "",
  status: "İyileşiyor",
  notes: "",
};

export function EnergyTargetsPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetEnergyTargets(companyId);
  const addMut = useAddEnergyTarget();
  const updateMut = useUpdateEnergyTarget();
  const deleteMut = useDeleteEnergyTarget();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EnergyEfficiencyTarget | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<EnergyEfficiencyTarget | null>(null);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: EnergyEfficiencyTarget) {
    setEditing(r);
    setForm({
      targetName: r.targetName,
      energyType: r.energyType,
      baselineValue: r.baselineValue,
      targetValue: r.targetValue,
      currentValue: r.currentValue,
      unit: r.unit,
      year: r.year,
      period: r.period,
      responsible: r.responsible,
      measures: r.measures,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    if (!companyId) return;
    if (!form.targetName) {
      toast.error("Hedef adı zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateMut.mutateAsync({ ...editing, ...form });
        toast.success("Güncellendi.");
      } else {
        await addMut.mutateAsync({ companyId, ...form });
        toast.success("Eklendi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: EnergyEfficiencyTarget) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const onTrack = records.filter(
    (r) => r.status === "Hedefte" || r.status === "Tamamlandı",
  ).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="text-green-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Enerji Verimliliği Hedefleri
              </h1>
              <p className="text-sm text-gray-500">
                Tüketim azaltma hedefleri, gerçekleşen değerler ve ilerleme
                takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Hedef Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Hedef", val: records.length, color: "indigo" },
            { label: "Hedefte", val: onTrack, color: "green" },
            {
              label: "Hedef Altı",
              val: records.filter((r) => r.status === "Hedef Altı").length,
              color: "red",
            },
          ].map((c) => (
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
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Henüz enerji verimliliği hedefi yok.
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {records.map((r, i) => {
                const baseline = Number(r.baselineValue) || 1;
                const current = Number(r.currentValue) || 0;
                const target = Number(r.targetValue) || 0;
                const savingPercent =
                  baseline > 0
                    ? Math.round(((baseline - current) / baseline) * 100)
                    : 0;
                const progressToTarget =
                  baseline > 0 && baseline !== target
                    ? Math.min(
                        Math.round(
                          ((baseline - current) / (baseline - target)) * 100,
                        ),
                        100,
                      )
                    : 0;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-gray-50 rounded-xl border p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {r.targetName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.energyType} · {r.period} · {r.year} · Sorumlu:{" "}
                          {r.responsible}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1 hover:text-indigo-600 text-gray-400"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Baz Değer</p>
                        <p className="font-bold text-gray-700">
                          {r.baselineValue} {r.unit}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Hedef</p>
                        <p className="font-bold text-green-600">
                          {r.targetValue} {r.unit}
                        </p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-400">Mevcut</p>
                        <p className="font-bold text-indigo-600">
                          {r.currentValue} {r.unit}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Hedefe İlerleme</span>
                        <span>
                          {progressToTarget}% · Tasarruf: {savingPercent}%
                        </span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progressToTarget >= 100 ? "bg-green-500" : "bg-indigo-500"}`}
                          style={{ width: `${Math.max(progressToTarget, 0)}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Hedef Düzenle" : "Hedef Ekle"}
              </DialogTitle>
              <DialogDescription>
                Enerji verimliliği hedef bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Hedef Adı *</Label>
                <Input
                  value={form.targetName}
                  onChange={(e) => sf("targetName", e.target.value)}
                />
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
                    {[
                      "Elektrik",
                      "Doğalgaz",
                      "Su",
                      "Yakıt",
                      "Buhar",
                      "Hava Basınçlı",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Birim</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => sf("unit", e.target.value)}
                />
              </div>
              <div>
                <Label>Baz Değer</Label>
                <Input
                  value={form.baselineValue}
                  onChange={(e) => sf("baselineValue", e.target.value)}
                />
              </div>
              <div>
                <Label>Hedef Değer</Label>
                <Input
                  value={form.targetValue}
                  onChange={(e) => sf("targetValue", e.target.value)}
                />
              </div>
              <div>
                <Label>Mevcut Değer</Label>
                <Input
                  value={form.currentValue}
                  onChange={(e) => sf("currentValue", e.target.value)}
                />
              </div>
              <div>
                <Label>Yıl</Label>
                <Input
                  value={form.year}
                  onChange={(e) => sf("year", e.target.value)}
                />
              </div>
              <div>
                <Label>Dönem</Label>
                <Select
                  value={form.period}
                  onValueChange={(v) => sf("period", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Yıllık", "Çeyreklik", "Aylık"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) => sf("responsible", e.target.value)}
                />
              </div>
              <div>
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => sf("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Hedefte", "Hedef Altı", "İyileşiyor", "Tamamlandı"].map(
                      (s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Alınan Önlemler</Label>
                <Textarea
                  value={form.measures}
                  onChange={(e) => sf("measures", e.target.value)}
                  rows={2}
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
              <Button variant="outline" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button
                onClick={handleSave}
                disabled={addMut.isPending || updateMut.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
              <DialogTitle>Hedef Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.targetName} hedefini silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
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
