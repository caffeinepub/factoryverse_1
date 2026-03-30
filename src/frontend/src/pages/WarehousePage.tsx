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
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Package,
  Pencil,
  Plus,
  Trash2,
  Warehouse,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface WarehouseRecord {
  id: string;
  companyId: string;
  warehouseName: string;
  location: string;
  areaSqm: number;
  capacityTon: number;
  currentLoadTon: number;
  responsible: string;
  status: "Aktif" | "Pasif" | "Bakımda";
}

const statusClass: Record<string, string> = {
  Aktif: "bg-green-100 text-green-800",
  Pasif: "bg-gray-100 text-gray-600",
  Bakımda: "bg-amber-100 text-amber-800",
};

const emptyForm = {
  warehouseName: "",
  location: "",
  areaSqm: 0,
  capacityTon: 0,
  currentLoadTon: 0,
  responsible: "",
  status: "Aktif" as WarehouseRecord["status"],
};

export function WarehousePage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<WarehouseRecord[]>([
    {
      id: "1",
      companyId,
      warehouseName: "Ana Üretim Deposu",
      location: "Fabrika A Blok",
      areaSqm: 2500,
      capacityTon: 500,
      currentLoadTon: 380,
      responsible: "Ahmet Kaya",
      status: "Aktif",
    },
    {
      id: "2",
      companyId,
      warehouseName: "Hammadde Deposu",
      location: "Giriş Kapısı Yanı",
      areaSqm: 1800,
      capacityTon: 300,
      currentLoadTon: 285,
      responsible: "Mehmet Yılmaz",
      status: "Aktif",
    },
    {
      id: "3",
      companyId,
      warehouseName: "Mamul Ürün Deposu",
      location: "Fabrika B Blok",
      areaSqm: 3200,
      capacityTon: 800,
      currentLoadTon: 620,
      responsible: "Ayşe Demir",
      status: "Aktif",
    },
    {
      id: "4",
      companyId,
      warehouseName: "Yedek Parça Deposu",
      location: "Teknik Servis Yanı",
      areaSqm: 600,
      capacityTon: 50,
      currentLoadTon: 12,
      responsible: "Can Öztürk",
      status: "Aktif",
    },
    {
      id: "5",
      companyId,
      warehouseName: "Kimyasal Madde Deposu",
      location: "Tesis Kuzey Köşesi",
      areaSqm: 450,
      capacityTon: 80,
      currentLoadTon: 74,
      responsible: "Fatma Şahin",
      status: "Aktif",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const totalWarehouses = records.length;
  const activeWarehouses = records.filter((r) => r.status === "Aktif").length;
  const totalCapacity = records.reduce((s, r) => s + r.capacityTon, 0);
  const totalLoad = records.reduce((s, r) => s + r.currentLoadTon, 0);
  const overallPct =
    totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0;
  const criticalCount = records.filter(
    (r) => r.capacityTon > 0 && (r.currentLoadTon / r.capacityTon) * 100 >= 90,
  ).length;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogOpen(true);
  };

  const openEdit = (r: WarehouseRecord) => {
    setForm({
      warehouseName: r.warehouseName,
      location: r.location,
      areaSqm: r.areaSqm,
      capacityTon: r.capacityTon,
      currentLoadTon: r.currentLoadTon,
      responsible: r.responsible,
      status: r.status,
    });
    setEditId(r.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editId) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editId ? { ...r, ...form } : r)),
      );
      toast.success("Depo kaydı güncellendi");
    } else {
      setRecords((prev) => [
        { id: Date.now().toString(), companyId, ...form },
        ...prev,
      ]);
      toast.success("Depo eklendi");
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast.success("Depo kaydı silindi");
  };

  const stats = [
    {
      label: "Toplam Depo",
      value: totalWarehouses,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Aktif Depo",
      value: activeWarehouses,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Kapasite Doluluk",
      value: `%${overallPct}`,
      color: overallPct >= 90 ? "text-red-600" : "text-amber-600",
      bg: overallPct >= 90 ? "bg-red-50" : "bg-amber-50",
    },
    {
      label: "Kritik Uyarı",
      value: criticalCount,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <AppLayout title="Depo Yönetimi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Warehouse className="text-indigo-600" size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Depo Yönetimi
              </h1>
              <p className="text-sm text-gray-500">
                Depo alanları, kapasite ve doluluk takibi
              </p>
            </div>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={openAdd}
            data-ocid="warehouse.open_modal_button"
          >
            <Plus size={16} className="mr-1" /> Depo Ekle
          </Button>
        </div>

        {/* Critical warning banner */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            <AlertTriangle size={16} />
            <span>
              <strong>{criticalCount} depo</strong> kritik doluluk seviyesinde
              (%90 ve üzeri)!
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`${s.bg} rounded-xl border border-white shadow-sm p-4`}
            >
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold font-display ${s.color}`}>
                {s.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Table - desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm" data-ocid="warehouse.table">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">Depo Adı</th>
                <th className="px-4 py-3">Konum</th>
                <th className="px-4 py-3">Alan (m²)</th>
                <th className="px-4 py-3">Kapasite (ton)</th>
                <th className="px-4 py-3">Doluluk</th>
                <th className="px-4 py-3">Sorumlu</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {records.map((r, idx) => {
                const pct =
                  r.capacityTon > 0
                    ? Math.round((r.currentLoadTon / r.capacityTon) * 100)
                    : 0;
                const isCritical = pct >= 90;
                return (
                  <tr
                    key={r.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                    data-ocid={`warehouse.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.warehouseName}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.location}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.areaSqm.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.capacityTon}</td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={pct}
                          className="h-2 flex-1"
                          style={
                            {
                              "--progress-foreground": isCritical
                                ? "#ef4444"
                                : "#6366f1",
                            } as React.CSSProperties
                          }
                        />
                        <span
                          className={`text-xs font-semibold min-w-[36px] text-right ${
                            isCritical ? "text-red-600" : "text-gray-600"
                          }`}
                        >
                          %{pct}
                        </span>
                        {isCritical && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            Kritik
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.responsible}</td>
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
                          data-ocid={`warehouse.edit_button.${idx + 1}`}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="text-gray-400 hover:text-red-500"
                          data-ocid={`warehouse.delete_button.${idx + 1}`}
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
                    colSpan={8}
                    className="px-4 py-8 text-center text-gray-400"
                    data-ocid="warehouse.empty_state"
                  >
                    Henüz depo kaydı yok
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards - mobile */}
        <div className="md:hidden space-y-3">
          {records.map((r, idx) => {
            const pct =
              r.capacityTon > 0
                ? Math.round((r.currentLoadTon / r.capacityTon) * 100)
                : 0;
            const isCritical = pct >= 90;
            return (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 p-4 space-y-3"
                data-ocid={`warehouse.item.${idx + 1}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {r.warehouseName}
                    </p>
                    <p className="text-xs text-gray-500">{r.location}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      statusClass[r.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Doluluk</span>
                    <span
                      className={isCritical ? "text-red-600 font-semibold" : ""}
                    >
                      {r.currentLoadTon}/{r.capacityTon} ton (%{pct})
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Sorumlu: {r.responsible}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="text-gray-400 hover:text-indigo-600"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(r.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {records.length === 0 && (
            <div
              className="bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center"
              data-ocid="warehouse.empty_state"
            >
              <Package size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-gray-400 text-sm">Henüz depo kaydı yok</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg"
          aria-describedby="warehouse-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>{editId ? "Depoyu Düzenle" : "Yeni Depo"}</DialogTitle>
            <DialogDescription id="warehouse-dialog-desc">
              Depo bilgilerini doldurun.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2" data-ocid="warehouse.dialog">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1">
                <Label>Depo Adı</Label>
                <Input
                  value={form.warehouseName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, warehouseName: e.target.value }))
                  }
                  data-ocid="warehouse.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Konum</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Alan (m²)</Label>
                <Input
                  type="number"
                  value={form.areaSqm}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, areaSqm: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Kapasite (ton)</Label>
                <Input
                  type="number"
                  value={form.capacityTon}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      capacityTon: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Mevcut Yük (ton)</Label>
                <Input
                  type="number"
                  value={form.currentLoadTon}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      currentLoadTon: Number(e.target.value),
                    }))
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
                      status: v as WarehouseRecord["status"],
                    }))
                  }
                >
                  <SelectTrigger data-ocid="warehouse.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Aktif", "Pasif", "Bakımda"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, responsible: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="warehouse.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSave}
              data-ocid="warehouse.submit_button"
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent aria-describedby="warehouse-del-desc">
          <DialogHeader>
            <DialogTitle>Depoyu Sil</DialogTitle>
            <DialogDescription id="warehouse-del-desc">
              Bu depo kaydı kalıcı olarak silinecek.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              data-ocid="warehouse.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-ocid="warehouse.confirm_button"
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
