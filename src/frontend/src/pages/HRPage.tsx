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
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddHRRecord,
  useDeleteHRRecord,
  useGetHRRecords,
  useUpdateHRRecord,
} from "../hooks/useQueries";
import type { HRRecord } from "../types";

const statusLabels: Record<string, string> = {
  active: "Aktif",
  passive: "Pasif",
  leave: "İzinde",
};
const statusClass: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  passive: "bg-gray-100 text-gray-700",
  leave: "bg-yellow-100 text-yellow-800",
};
const employmentLabels: Record<string, string> = {
  fulltime: "Tam Zamanlı",
  parttime: "Yarı Zamanlı",
  contract: "Sözleşmeli",
  intern: "Stajyer",
};

const empty = {
  name: "",
  department: "",
  position: "",
  employmentType: "fulltime",
  startDate: "",
  salary: "",
  status: "active",
  notes: "",
};

export function HRPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const { data: records = [], isLoading } = useGetHRRecords(userCode);
  const addRecord = useAddHRRecord();
  const updateRecord = useUpdateHRRecord();
  const deleteRecord = useDeleteHRRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HRRecord | null>(null);
  const [form, setForm] = useState(empty);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(r: HRRecord) {
    setEditing(r);
    setForm({
      name: r.name,
      department: r.department,
      position: r.position,
      employmentType: r.employmentType,
      startDate: r.startDate,
      salary: r.salary,
      status: r.status,
      notes: r.notes,
    });
    setOpen(true);
  }
  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    if (!form.name || !form.department || !form.position) {
      toast.error("Ad, departman ve pozisyon zorunludur.");
      return;
    }
    try {
      if (editing) {
        await updateRecord.mutateAsync({
          adminCode: session?.userCode ?? "",
          recordId: editing.id,
          ...form,
        });
        toast.success("Kayıt güncellendi.");
      } else {
        await addRecord.mutateAsync({
          adminCode: session?.userCode ?? "",
          ...form,
        });
        toast.success("Personel kaydedildi.");
      }
      setOpen(false);
    } catch {
      toast.error("İşlem başarısız.");
    }
  }

  async function handleDelete(r: HRRecord) {
    if (!confirm(`"${r.name}" silinsin mi?`)) return;
    try {
      await deleteRecord.mutateAsync({
        adminCode: session?.userCode ?? "",
        recordId: r.id,
      });
      toast.success("Silindi.");
    } catch {
      toast.error("Silinemedi.");
    }
  }

  const activeCount = records.filter((r) => r.status === "active").length;
  const departments = [...new Set(records.map((r) => r.department))].length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-2">
              <UserCog className="text-primary" size={26} />
              İnsan Kaynakları Takibi
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Personel profilleri, pozisyonlar ve istihdam bilgileri
            </p>
          </div>
          {isAdmin && (
            <Button onClick={openAdd} className="gap-2">
              <Plus size={16} /> Yeni Kayıt
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Toplam Personel</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {records.length}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Aktif Personel</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {activeCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm text-gray-500">Departman Sayısı</p>
            <p className="text-3xl font-bold text-primary mt-1">
              {departments}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Henüz personel kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Ad Soyad
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Departman
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Pozisyon
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Türü
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Başlangıç
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Maaş (₺)
                    </th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">
                      Durum
                    </th>
                    {isAdmin && <th className="text-right px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records.map((r) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.department}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.position}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {employmentLabels[r.employmentType] ?? r.employmentType}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.startDate}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.salary ? `₺${r.salary}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass[r.status] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {statusLabels[r.status] ?? r.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEdit(r)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => handleDelete(r)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Kaydı Düzenle" : "Yeni Personel Kaydı"}
            </DialogTitle>
            <DialogDescription>İK bilgilerini doldurun.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Ad Soyad *</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ad Soyad"
              />
            </div>
            <div className="space-y-1">
              <Label>Departman *</Label>
              <Input
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="Üretim, Bakım..."
              />
            </div>
            <div className="space-y-1">
              <Label>Pozisyon *</Label>
              <Input
                value={form.position}
                onChange={(e) => set("position", e.target.value)}
                placeholder="Mühendis, Teknisyen..."
              />
            </div>
            <div className="space-y-1">
              <Label>İstihdam Türü</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) => set("employmentType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Tam Zamanlı</SelectItem>
                  <SelectItem value="parttime">Yarı Zamanlı</SelectItem>
                  <SelectItem value="contract">Sözleşmeli</SelectItem>
                  <SelectItem value="intern">Stajyer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Başlangıç Tarihi</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Maaş (₺)</Label>
              <Input
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
                placeholder="Aylık maaş"
              />
            </div>
            <div className="space-y-1">
              <Label>Durum</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="passive">Pasif</SelectItem>
                  <SelectItem value="leave">İzinde</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Notlar</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
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
              disabled={addRecord.isPending || updateRecord.isPending}
            >
              {editing ? "Güncelle" : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
