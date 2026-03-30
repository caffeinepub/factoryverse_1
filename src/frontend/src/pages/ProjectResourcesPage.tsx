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
import { AlertTriangle, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface ProjectResource {
  id: string;
  companyId: string;
  projectName: string;
  resourceType: string;
  resourceName: string;
  plannedQty: string;
  actualQty: string;
  unit: string;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

const statusClass: Record<string, string> = {
  Planlandı: "bg-blue-100 text-blue-800",
  Aktif: "bg-green-100 text-green-800",
  Tamamlandı: "bg-gray-100 text-gray-700",
};

const emptyForm = {
  projectName: "",
  resourceType: "İnsan Kaynağı",
  resourceName: "",
  plannedQty: "",
  actualQty: "",
  unit: "",
  allocationPercent: "0",
  startDate: "",
  endDate: "",
  status: "Planlandı",
  notes: "",
};

export function ProjectResourcesPage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<ProjectResource[]>([
    {
      id: "1",
      companyId,
      projectName: "Fabrika Kurulum Projesi",
      resourceType: "İnsan Kaynağı",
      resourceName: "Mühendislik Ekibi",
      plannedQty: "5",
      actualQty: "4",
      unit: "Kişi",
      allocationPercent: 80,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      status: "Aktif",
      notes: "Bir mühendis eksik.",
      createdAt: "2026-01-01",
    },
    {
      id: "2",
      companyId,
      projectName: "Fabrika Kurulum Projesi",
      resourceType: "Ekipman",
      resourceName: "CNC Tezgah",
      plannedQty: "3",
      actualQty: "3",
      unit: "Adet",
      allocationPercent: 95,
      startDate: "2026-02-01",
      endDate: "2026-11-30",
      status: "Aktif",
      notes: "Kapasite limiti yaklaşıyor.",
      createdAt: "2026-01-15",
    },
    {
      id: "3",
      companyId,
      projectName: "ERP Entegrasyon Projesi",
      resourceType: "Bütçe",
      resourceName: "Yazılım Lisansları",
      plannedQty: "150000",
      actualQty: "120000",
      unit: "TL",
      allocationPercent: 60,
      startDate: "2026-03-01",
      endDate: "2026-09-30",
      status: "Planlandı",
      notes: "",
      createdAt: "2026-02-01",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectResource | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectResource | null>(
    null,
  );

  const highAllocation = records.filter((r) => r.allocationPercent > 90).length;
  const avgAllocation =
    records.length > 0
      ? Math.round(
          records.reduce((s, r) => s + r.allocationPercent, 0) / records.length,
        )
      : 0;

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: ProjectResource) {
    setEditing(r);
    setForm({
      projectName: r.projectName,
      resourceType: r.resourceType,
      resourceName: r.resourceName,
      plannedQty: r.plannedQty,
      actualQty: r.actualQty,
      unit: r.unit,
      allocationPercent: String(r.allocationPercent),
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.projectName.trim() || !form.resourceName.trim()) {
      toast.error("Proje adı ve kaynak adı zorunludur.");
      return;
    }
    const alloc = Math.min(
      100,
      Math.max(0, Number(form.allocationPercent) || 0),
    );
    if (editing) {
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editing.id ? { ...r, ...form, allocationPercent: alloc } : r,
        ),
      );
      toast.success("Güncellendi.");
    } else {
      const newRecord: ProjectResource = {
        id: Date.now().toString(),
        companyId,
        ...form,
        allocationPercent: alloc,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setRecords((prev) => [newRecord, ...prev]);
      toast.success("Eklendi.");
    }
    setOpen(false);
  }

  function handleDelete(r: ProjectResource) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const stats = [
    { label: "Toplam Kaynak", val: records.length, color: "indigo" },
    {
      label: "Aktif",
      val: records.filter((r) => r.status === "Aktif").length,
      color: "green",
    },
    { label: "Ort. Tahsis %", val: `${avgAllocation}%`, color: "blue" },
    { label: ">90% Tahsis", val: highAllocation, color: "red" },
  ];

  function allocationBarColor(pct: number) {
    if (pct > 90) return "bg-red-500";
    if (pct > 70) return "bg-orange-500";
    return "bg-indigo-500";
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Layers className="text-indigo-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Proje Kaynak Planlama
              </h1>
              <p className="text-sm text-gray-500">
                Proje bazlı kaynak tahsisi ve kullanım takibi
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="project-resources.primary_button"
          >
            <Plus size={16} className="mr-1" /> Kaynak Ekle
          </Button>
        </div>

        {highAllocation > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {highAllocation} kaynağın tahsis oranı %90 üzerinde!
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
              data-ocid="project-resources.empty_state"
            >
              Henüz kaynak kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Proje",
                      "Kaynak Tipi",
                      "Kaynak Adı",
                      "Planlanan",
                      "Gerçekleşen",
                      "Tahsis %",
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
                      data-ocid={`project-resources.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium">{r.projectName}</td>
                      <td className="px-4 py-3">{r.resourceType}</td>
                      <td className="px-4 py-3">{r.resourceName}</td>
                      <td className="px-4 py-3">
                        {r.plannedQty} {r.unit}
                      </td>
                      <td className="px-4 py-3">
                        {r.actualQty} {r.unit}
                      </td>
                      <td className="px-4 py-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${allocationBarColor(r.allocationPercent)}`}
                              style={{ width: `${r.allocationPercent}%` }}
                            />
                          </div>
                          <span
                            className={`text-xs font-semibold ${r.allocationPercent > 90 ? "text-red-600" : "text-gray-700"}`}
                          >
                            {r.allocationPercent}%
                          </span>
                        </div>
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
                            data-ocid={`project-resources.edit_button.${i + 1}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                            data-ocid={`project-resources.delete_button.${i + 1}`}
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
            data-ocid="project-resources.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Kaynak Düzenle" : "Kaynak Ekle"}
              </DialogTitle>
              <DialogDescription>
                Proje kaynak bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Proje Adı *</Label>
                <Input
                  value={form.projectName}
                  onChange={(e) => sf("projectName", e.target.value)}
                  data-ocid="project-resources.input"
                />
              </div>
              <div>
                <Label>Kaynak Tipi</Label>
                <Select
                  value={form.resourceType}
                  onValueChange={(v) => sf("resourceType", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["İnsan Kaynağı", "Ekipman", "Malzeme", "Bütçe"].map(
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
                <Label>Kaynak Adı *</Label>
                <Input
                  value={form.resourceName}
                  onChange={(e) => sf("resourceName", e.target.value)}
                />
              </div>
              <div>
                <Label>Planlanan Miktar</Label>
                <Input
                  value={form.plannedQty}
                  onChange={(e) => sf("plannedQty", e.target.value)}
                />
              </div>
              <div>
                <Label>Gerçekleşen Miktar</Label>
                <Input
                  value={form.actualQty}
                  onChange={(e) => sf("actualQty", e.target.value)}
                />
              </div>
              <div>
                <Label>Birim</Label>
                <Input
                  value={form.unit}
                  onChange={(e) => sf("unit", e.target.value)}
                  placeholder="Kişi, Adet, TL..."
                />
              </div>
              <div>
                <Label>Tahsis % (0-100)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.allocationPercent}
                  onChange={(e) => sf("allocationPercent", e.target.value)}
                />
              </div>
              <div>
                <Label>Başlangıç Tarihi</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => sf("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => sf("endDate", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => sf("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Planlandı", "Aktif", "Tamamlandı"].map((s) => (
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
                data-ocid="project-resources.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="project-resources.submit_button"
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
              <DialogTitle>Kaynak Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.resourceName} kaydını silmek istediğinizden emin
                misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="project-resources.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="project-resources.confirm_button"
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
