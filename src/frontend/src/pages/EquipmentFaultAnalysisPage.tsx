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
import { AlertOctagon, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface FaultRecord {
  id: string;
  companyId: string;
  equipmentName: string;
  faultCode: string;
  faultType: string;
  severity: string;
  occurrenceDate: string;
  rootCause: string;
  correctiveAction: string;
  downtime: string;
  cost: string;
  status: string;
  notes: string;
}

const severityClass: Record<string, string> = {
  Düşük: "bg-green-100 text-green-800",
  Orta: "bg-yellow-100 text-yellow-800",
  Yüksek: "bg-orange-100 text-orange-800",
  Kritik: "bg-red-100 text-red-800",
};

const statusClass: Record<string, string> = {
  Açık: "bg-red-100 text-red-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Kapalı: "bg-green-100 text-green-800",
};

const emptyForm = {
  equipmentName: "",
  faultCode: "",
  faultType: "Mekanik",
  severity: "Orta",
  occurrenceDate: "",
  rootCause: "",
  correctiveAction: "",
  downtime: "",
  cost: "",
  status: "Açık",
  notes: "",
};

export function EquipmentFaultAnalysisPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<FaultRecord[]>([
    {
      id: "1",
      companyId,
      equipmentName: "CNC Torna Tezgahı #3",
      faultCode: "F-2025-001",
      faultType: "Mekanik",
      severity: "Yüksek",
      occurrenceDate: "2025-11-10",
      rootCause: "Rulman aşınması",
      correctiveAction: "Rulman değişimi yapıldı",
      downtime: "4",
      cost: "2500",
      status: "Kapalı",
      notes: "",
    },
    {
      id: "2",
      companyId,
      equipmentName: "Hidrolik Pres #1",
      faultCode: "F-2025-002",
      faultType: "Hidrolik",
      severity: "Kritik",
      occurrenceDate: "2025-12-05",
      rootCause: "Hidrolik hortum patlaması",
      correctiveAction: "Acil tamir talebi açıldı",
      downtime: "12",
      cost: "8000",
      status: "Devam Ediyor",
      notes: "Yedek parça sipariş edildi",
    },
    {
      id: "3",
      companyId,
      equipmentName: "Konveyör Bant #2",
      faultCode: "F-2025-003",
      faultType: "Elektrik",
      severity: "Orta",
      occurrenceDate: "2025-12-18",
      rootCause: "Motor sargı arızası",
      correctiveAction: "Motor rewinding planlanıyor",
      downtime: "6",
      cost: "3200",
      status: "Açık",
      notes: "",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FaultRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<FaultRecord | null>(null);

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: FaultRecord) {
    setEditing(r);
    setForm({
      equipmentName: r.equipmentName,
      faultCode: r.faultCode,
      faultType: r.faultType,
      severity: r.severity,
      occurrenceDate: r.occurrenceDate,
      rootCause: r.rootCause,
      correctiveAction: r.correctiveAction,
      downtime: r.downtime,
      cost: r.cost,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!form.equipmentName.trim()) {
      toast.error("Ekipman adı zorunludur.");
      return;
    }
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
      toast.success("Güncellendi.");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Arıza kaydı eklendi.");
    }
    setOpen(false);
  }

  function handleDelete(r: FaultRecord) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const totalDowntime = records.reduce(
    (s, r) => s + (Number(r.downtime) || 0),
    0,
  );
  const totalCost = records.reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const openCount = records.filter(
    (r) => r.status === "Açık" || r.status === "Devam Ediyor",
  ).length;

  const stats = [
    { label: "Toplam Arıza", val: records.length, color: "indigo" },
    { label: "Açık/Devam Eden", val: openCount, color: "red" },
    { label: "Toplam Duruş (saat)", val: totalDowntime, color: "orange" },
    {
      label: "Toplam Maliyet (₺)",
      val: totalCost.toLocaleString("tr-TR"),
      color: "purple",
    },
  ];

  const criticalCount = records.filter(
    (r) => r.severity === "Kritik" && r.status !== "Kapalı",
  ).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Zap className="text-red-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Ekipman Arıza Analizi
              </h1>
              <p className="text-sm text-gray-500">
                Ekipman arızaları, kök neden ve düzeltici faaliyet takibi
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="equipment-fault.primary_button"
          >
            <Plus size={16} className="mr-1" /> Arıza Ekle
          </Button>
        </div>

        {criticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800">
            <AlertOctagon size={18} />
            <span className="text-sm font-medium">
              {criticalCount} kritik seviyede açık arıza mevcut!
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

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {records.length === 0 ? (
            <div
              className="p-8 text-center text-gray-400"
              data-ocid="equipment-fault.empty_state"
            >
              Henüz arıza kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Ekipman",
                      "Arıza Kodu",
                      "Tür",
                      "Şiddet",
                      "Tarih",
                      "Kök Neden",
                      "Duruş (sa)",
                      "Maliyet (₺)",
                      "Durum",
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
                      data-ocid={`equipment-fault.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.equipmentName}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{r.faultCode}</td>
                      <td className="px-4 py-3">{r.faultType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityClass[r.severity] ?? "bg-gray-100"}`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.occurrenceDate}</td>
                      <td className="px-4 py-3 max-w-[160px] truncate">
                        {r.rootCause}
                      </td>
                      <td className="px-4 py-3 text-center">{r.downtime}</td>
                      <td className="px-4 py-3">
                        {r.cost ? Number(r.cost).toLocaleString("tr-TR") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100"}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(r)}
                            className="p-1 hover:text-indigo-600 text-gray-400"
                            data-ocid={`equipment-fault.edit_button.${i + 1}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                            data-ocid={`equipment-fault.delete_button.${i + 1}`}
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
            data-ocid="equipment-fault.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Arıza Düzenle" : "Yeni Arıza Kaydı"}
              </DialogTitle>
              <DialogDescription>
                Arıza bilgilerini ve analiz detaylarını girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Ekipman Adı *</Label>
                <Input
                  value={form.equipmentName}
                  onChange={(e) => sf("equipmentName", e.target.value)}
                  data-ocid="equipment-fault.input"
                />
              </div>
              <div>
                <Label>Arıza Kodu</Label>
                <Input
                  value={form.faultCode}
                  onChange={(e) => sf("faultCode", e.target.value)}
                />
              </div>
              <div>
                <Label>Arıza Türü</Label>
                <Select
                  value={form.faultType}
                  onValueChange={(v) => sf("faultType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Mekanik",
                      "Elektrik",
                      "Hidrolik",
                      "Pnömatik",
                      "Yazılım",
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
                <Label>Şiddet</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => sf("severity", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Düşük", "Orta", "Yüksek", "Kritik"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Oluşma Tarihi</Label>
                <Input
                  type="date"
                  value={form.occurrenceDate}
                  onChange={(e) => sf("occurrenceDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Duruş Süresi (saat)</Label>
                <Input
                  type="number"
                  value={form.downtime}
                  onChange={(e) => sf("downtime", e.target.value)}
                />
              </div>
              <div>
                <Label>Maliyet (₺)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) => sf("cost", e.target.value)}
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
                    {["Açık", "Devam Ediyor", "Kapalı"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Kök Neden</Label>
                <Textarea
                  value={form.rootCause}
                  onChange={(e) => sf("rootCause", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="col-span-2">
                <Label>Düzeltici Faaliyet</Label>
                <Textarea
                  value={form.correctiveAction}
                  onChange={(e) => sf("correctiveAction", e.target.value)}
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
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                data-ocid="equipment-fault.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="equipment-fault.submit_button"
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
              <DialogTitle>Arıza Kaydını Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.equipmentName} arıza kaydını silmek
                istediğinizden emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="equipment-fault.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="equipment-fault.confirm_button"
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
