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
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddSkillMatrixRecord,
  useDeleteSkillMatrixRecord,
  useGetSkillMatrixRecords,
  useUpdateSkillMatrixRecord,
} from "../hooks/useQueries";
import type { SkillMatrixRecord } from "../types";

const LEVELS = [
  "1 - Farkında",
  "2 - Temel",
  "3 - Orta",
  "4 - İleri",
  "5 - Uzman",
];

const levelColor: Record<string, string> = {
  "1 - Farkında": "bg-red-100 text-red-700",
  "2 - Temel": "bg-orange-100 text-orange-700",
  "3 - Orta": "bg-yellow-100 text-yellow-700",
  "4 - İleri": "bg-blue-100 text-blue-700",
  "5 - Uzman": "bg-green-100 text-green-700",
};

const emptyForm = {
  employeeName: "",
  department: "",
  position: "",
  skillName: "",
  skillCategory: "Teknik",
  proficiencyLevel: "3 - Orta",
  targetLevel: "4 - İleri",
  lastAssessmentDate: "",
  assessor: "",
  notes: "",
};

export function SkillsMatrixPage() {
  const { session } = useAuth();
  const isAdmin = (session as any)?.role === "admin";
  const companyId =
    (session as any)?.companyId ?? (session as any)?.loginCode ?? null;
  const { data: records = [], isLoading } = useGetSkillMatrixRecords(companyId);
  const addMut = useAddSkillMatrixRecord();
  const updateMut = useUpdateSkillMatrixRecord();
  const deleteMut = useDeleteSkillMatrixRecord();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SkillMatrixRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<SkillMatrixRecord | null>(
    null,
  );
  const [filterDept, setFilterDept] = useState("");

  const sf = (k: keyof typeof emptyForm, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }
  function openEdit(r: SkillMatrixRecord) {
    setEditing(r);
    setForm({
      employeeName: r.employeeName,
      department: r.department,
      position: r.position,
      skillName: r.skillName,
      skillCategory: r.skillCategory,
      proficiencyLevel: r.proficiencyLevel,
      targetLevel: r.targetLevel,
      lastAssessmentDate: r.lastAssessmentDate,
      assessor: r.assessor,
      notes: r.notes,
    });
    setOpen(true);
  }

  async function handleSave() {
    if (!companyId || !form.employeeName || !form.skillName) {
      toast.error("Çalışan adı ve yetenek zorunludur.");
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

  async function handleDelete(r: SkillMatrixRecord) {
    try {
      await deleteMut.mutateAsync({ id: r.id, companyId: r.companyId });
      toast.success("Silindi.");
      setDeleteConfirm(null);
    } catch {
      toast.error("Silme başarısız.");
    }
  }

  const departments = Array.from(
    new Set(records.map((r) => r.department).filter(Boolean)),
  );
  const filtered = filterDept
    ? records.filter((r) => r.department === filterDept)
    : records;

  const gapCount = records.filter((r) => {
    const lvl = Number(r.proficiencyLevel.charAt(0));
    const tgt = Number(r.targetLevel.charAt(0));
    return lvl < tgt;
  }).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <GraduationCap className="text-purple-600" size={22} />
            </div>
            <div>
              <h1
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
              >
                Yetenek Matrisi
              </h1>
              <p className="text-sm text-gray-500">
                Çalışan yetkinlik haritası ve gelişim takibi
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button
              onClick={openAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus size={16} className="mr-1" /> Yetenek Ekle
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Toplam Kayıt", val: records.length, color: "indigo" },
            { label: "Gelişim Gereken", val: gapCount, color: "orange" },
            {
              label: "Uzman Düzey",
              val: records.filter((r) => r.proficiencyLevel.startsWith("5"))
                .length,
              color: "green",
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

        <div className="flex items-center gap-3">
          <Select value={filterDept} onValueChange={setFilterDept}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Departmana göre filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tümü</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Yükleniyor...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              Henüz yetenek kaydı yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Çalışan",
                      "Departman",
                      "Yetenek",
                      "Kategori",
                      "Mevcut Seviye",
                      "Hedef Seviye",
                      "Değerlendirici",
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
                  {filtered.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-medium">
                        {r.employeeName}
                      </td>
                      <td className="px-4 py-3">{r.department}</td>
                      <td className="px-4 py-3">{r.skillName}</td>
                      <td className="px-4 py-3">{r.skillCategory}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor[r.proficiencyLevel] ?? "bg-gray-100"}`}
                        >
                          {r.proficiencyLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor[r.targetLevel] ?? "bg-gray-100"}`}
                        >
                          {r.targetLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.assessor}</td>
                      <td className="px-4 py-3">
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
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Yetenek Düzenle" : "Yetenek Ekle"}
              </DialogTitle>
              <DialogDescription>
                Çalışan yetkinlik bilgilerini girin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div>
                <Label>Çalışan Adı *</Label>
                <Input
                  value={form.employeeName}
                  onChange={(e) => sf("employeeName", e.target.value)}
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) => sf("department", e.target.value)}
                />
              </div>
              <div>
                <Label>Pozisyon</Label>
                <Input
                  value={form.position}
                  onChange={(e) => sf("position", e.target.value)}
                />
              </div>
              <div>
                <Label>Yetenek Adı *</Label>
                <Input
                  value={form.skillName}
                  onChange={(e) => sf("skillName", e.target.value)}
                />
              </div>
              <div>
                <Label>Kategori</Label>
                <Select
                  value={form.skillCategory}
                  onValueChange={(v) => sf("skillCategory", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Teknik",
                      "Davranışsal",
                      "Liderlik",
                      "Güvenlik",
                      "Kalite",
                      "Diğer",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Değerlendirici</Label>
                <Input
                  value={form.assessor}
                  onChange={(e) => sf("assessor", e.target.value)}
                />
              </div>
              <div>
                <Label>Mevcut Seviye</Label>
                <Select
                  value={form.proficiencyLevel}
                  onValueChange={(v) => sf("proficiencyLevel", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Hedef Seviye</Label>
                <Select
                  value={form.targetLevel}
                  onValueChange={(v) => sf("targetLevel", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Son Değerlendirme Tarihi</Label>
                <Input
                  type="date"
                  value={form.lastAssessmentDate}
                  onChange={(e) => sf("lastAssessmentDate", e.target.value)}
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
              <DialogTitle>Yetenek Kaydı Sil</DialogTitle>
              <DialogDescription>
                {deleteConfirm?.employeeName} - {deleteConfirm?.skillName}{" "}
                kaydını silmek istiyor musunuz?
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
