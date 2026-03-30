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
import { AlertTriangle, Pencil, Plus, Scale, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";

interface LegalComplianceRecord {
  id: string;
  companyId: string;
  regulationName: string;
  category: string;
  responsiblePerson: string;
  dueDate: string;
  status: string;
  priority: string;
  notes: string;
  createdAt: string;
}

const statusClass: Record<string, string> = {
  Uyumlu: "bg-green-100 text-green-800",
  Uyumsuz: "bg-red-100 text-red-800",
  İnceleniyor: "bg-yellow-100 text-yellow-800",
};

const priorityClass: Record<string, string> = {
  Yüksek: "bg-red-100 text-red-700",
  Orta: "bg-orange-100 text-orange-700",
  Düşük: "bg-blue-100 text-blue-700",
};

const emptyForm = {
  regulationName: "",
  category: "İş Hukuku",
  responsiblePerson: "",
  dueDate: "",
  status: "İnceleniyor",
  priority: "Orta",
  notes: "",
};

export function LegalCompliancePage() {
  const { session } = useAuth();
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? "demo";

  const [records, setRecords] = useState<LegalComplianceRecord[]>([
    {
      id: "1",
      companyId,
      regulationName: "İş Sağlığı ve Güvenliği Kanunu (6331)",
      category: "İSG",
      responsiblePerson: "Ahmet Yılmaz",
      dueDate: "2026-06-30",
      status: "Uyumlu",
      priority: "Yüksek",
      notes: "Tüm eğitimler tamamlandı.",
      createdAt: "2025-01-10",
    },
    {
      id: "2",
      companyId,
      regulationName: "Çevre Yönetimi Yönetmeliği",
      category: "Çevre",
      responsiblePerson: "Fatma Kaya",
      dueDate: "2026-03-15",
      status: "İnceleniyor",
      priority: "Orta",
      notes: "Çevre izni yenileme süreci devam ediyor.",
      createdAt: "2025-02-05",
    },
    {
      id: "3",
      companyId,
      regulationName: "KVKK Uyum Gereklilikleri",
      category: "Diğer",
      responsiblePerson: "Mehmet Demir",
      dueDate: "2026-04-01",
      status: "Uyumsuz",
      priority: "Yüksek",
      notes: "Politika güncellemesi gerekiyor.",
      createdAt: "2025-03-20",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LegalComplianceRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] =
    useState<LegalComplianceRecord | null>(null);

  const today = new Date();

  const approaching = records.filter((r) => {
    if (!r.dueDate) return false;
    const diff =
      (new Date(r.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  }).length;

  function dueDateHighlight(dateStr: string) {
    if (!dateStr) return "";
    const diff =
      (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "text-red-600 font-semibold";
    if (diff <= 30) return "text-orange-600 font-semibold";
    return "text-gray-700";
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: LegalComplianceRecord) {
    setEditing(r);
    setForm({
      regulationName: r.regulationName,
      category: r.category,
      responsiblePerson: r.responsiblePerson,
      dueDate: r.dueDate,
      status: r.status,
      priority: r.priority,
      notes: r.notes,
    });
    setOpen(true);
  }

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleSave() {
    if (!form.regulationName.trim()) {
      toast.error("Yönetmelik adı zorunludur.");
      return;
    }
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...form } : r)),
      );
      toast.success("Güncellendi.");
    } else {
      const newRecord: LegalComplianceRecord = {
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

  function handleDelete(r: LegalComplianceRecord) {
    setRecords((prev) => prev.filter((x) => x.id !== r.id));
    toast.success("Silindi.");
    setDeleteConfirm(null);
  }

  const stats = [
    { label: "Toplam", val: records.length, color: "indigo" },
    {
      label: "Uyumlu",
      val: records.filter((r) => r.status === "Uyumlu").length,
      color: "green",
    },
    {
      label: "Uyumsuz",
      val: records.filter((r) => r.status === "Uyumsuz").length,
      color: "red",
    },
    {
      label: "İnceleniyor",
      val: records.filter((r) => r.status === "İnceleniyor").length,
      color: "yellow",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Scale className="text-purple-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Hukuki Uyum Takibi
              </h1>
              <p className="text-sm text-gray-500">
                Yasal düzenlemeler ve uyum durumu takibi
              </p>
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            data-ocid="legal-compliance.primary_button"
          >
            <Plus size={16} className="mr-1" /> Uyum Kaydı Ekle
          </Button>
        </div>

        {approaching > 0 && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-orange-800">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {approaching} kaydın son tarihi 30 gün içinde!
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
              data-ocid="legal-compliance.empty_state"
            >
              Henüz uyum kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Yönetmelik Adı",
                      "Kategori",
                      "Sorumlu",
                      "Son Tarih",
                      "Öncelik",
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
                      data-ocid={`legal-compliance.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 font-medium max-w-xs truncate">
                        {r.regulationName}
                      </td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3">{r.responsiblePerson}</td>
                      <td
                        className={`px-4 py-3 ${dueDateHighlight(r.dueDate)}`}
                      >
                        {r.dueDate}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityClass[r.priority] ?? "bg-gray-100"}`}
                        >
                          {r.priority}
                        </span>
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
                            data-ocid={`legal-compliance.edit_button.${i + 1}`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(r)}
                            className="p-1 hover:text-red-500 text-gray-400"
                            data-ocid={`legal-compliance.delete_button.${i + 1}`}
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
            data-ocid="legal-compliance.dialog"
          >
            <DialogHeader>
              <DialogTitle>
                {editing ? "Kayıt Düzenle" : "Uyum Kaydı Ekle"}
              </DialogTitle>
              <DialogDescription>
                Yasal uyum bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2">
                <Label>Yönetmelik Adı *</Label>
                <Input
                  value={form.regulationName}
                  onChange={(e) => sf("regulationName", e.target.value)}
                  data-ocid="legal-compliance.input"
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => sf("category", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["İş Hukuku", "Çevre", "İSG", "Vergi", "Diğer"].map(
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
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsiblePerson}
                  onChange={(e) => sf("responsiblePerson", e.target.value)}
                />
              </div>
              <div>
                <Label>Son Tarih</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => sf("dueDate", e.target.value)}
                />
              </div>
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => sf("priority", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Yüksek", "Orta", "Düşük"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {["Uyumlu", "Uyumsuz", "İnceleniyor"].map((s) => (
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
                data-ocid="legal-compliance.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                data-ocid="legal-compliance.submit_button"
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
              <DialogTitle>Kayıt Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.regulationName} kaydını silmek istediğinizden
                emin misiniz?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                data-ocid="legal-compliance.cancel_button"
              >
                İptal
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                data-ocid="legal-compliance.confirm_button"
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
