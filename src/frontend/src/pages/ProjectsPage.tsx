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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FolderKanban, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddProject,
  useDeleteProject,
  useGetProjects,
  useUpdateProject,
} from "../hooks/useQueries";
import type { Project } from "../types";

const statusOptions = [
  { value: "planned", label: "Planlandı", cls: "bg-blue-100 text-blue-800" },
  {
    value: "active",
    label: "Devam Ediyor",
    cls: "bg-green-100 text-green-800",
  },
  { value: "completed", label: "Tamamlandı", cls: "bg-gray-100 text-gray-800" },
  { value: "paused", label: "Beklemede", cls: "bg-amber-100 text-amber-800" },
];

interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  progress: string;
}

const emptyForm: ProjectFormData = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "planned",
  progress: "0",
};

export function ProjectsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const projectsQuery = useGetProjects(userCode);
  const addMutation = useAddProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [addOpen, setAddOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [form, setForm] = useState<ProjectFormData>(emptyForm);

  const projects = projectsQuery.data ?? [];
  const updateForm = (k: keyof ProjectFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name) {
      toast.error("Proje adı zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      toast.success("Proje eklendi");
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const openEdit = (p: Project) => {
    setEditProject(p);
    setForm({
      name: p.name,
      description: p.description,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status,
      progress: String(p.progress),
    });
  };

  const handleUpdate = async () => {
    if (!editProject) return;
    try {
      await updateMutation.mutateAsync({
        adminCode: userCode!,
        projectId: editProject.id,
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        progress: Number(form.progress),
      });
      toast.success("Proje güncellendi");
      setEditProject(null);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        adminCode: userCode!,
        projectId: deleteTarget.id,
      });
      toast.success("Proje silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  return (
    <AppLayout title="Projeler">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Projeler
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {projects.length} proje kayıtlı
            </p>
          </div>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setForm(emptyForm);
                setAddOpen(true);
              }}
              data-ocid="projects.add_project.button"
            >
              <Plus size={16} /> Proje Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="projects.table"
        >
          {projectsQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center" data-ocid="projects.empty_state">
              <FolderKanban
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <h3 className="font-semibold text-foreground mb-1">
                Henüz proje yok
              </h3>
              <p className="text-muted-foreground text-sm">
                İlk projeyi ekleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Proje Adı",
                      "Açıklama",
                      "Başlangıç",
                      "Bitiş",
                      "Durum",
                      "İlerleme",
                      "İşlem",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p, i) => {
                    const statusOpt = statusOptions.find(
                      (s) => s.value === p.status,
                    );
                    const progressNum = Number(p.progress);
                    return (
                      <tr
                        key={p.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                        data-ocid={`projects.item.${i + 1}`}
                      >
                        <td className="px-5 py-3 font-medium text-foreground">
                          {p.name}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground max-w-[200px] truncate">
                          {p.description || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {p.startDate || "—"}
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {p.endDate || "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusOpt?.cls ?? "bg-gray-100 text-gray-600"}`}
                          >
                            {statusOpt?.label ?? p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <Progress
                              value={progressNum}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-8 text-right">
                              {progressNum}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEdit(p)}
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                data-ocid={`projects.edit_button.${i + 1}`}
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(p)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                                data-ocid={`projects.delete_button.${i + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-project-desc"
          data-ocid="projects.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Proje Ekle</DialogTitle>
            <DialogDescription id="add-project-desc">
              Yeni proje kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <ProjectForm form={form} updateForm={updateForm} showStatus={false} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="projects.add.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              data-ocid="projects.add.submit_button"
            >
              {addMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editProject}
        onOpenChange={(o) => {
          if (!o) setEditProject(null);
        }}
      >
        <DialogContent
          aria-describedby="edit-project-desc"
          data-ocid="projects.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Proje Düzenle</DialogTitle>
            <DialogDescription id="edit-project-desc">
              Proje bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <ProjectForm form={form} updateForm={updateForm} showStatus={true} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProject(null)}
              data-ocid="projects.edit.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-ocid="projects.edit.submit_button"
            >
              {updateMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Kaydet"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent
          aria-describedby="delete-project-desc"
          data-ocid="projects.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Projeyi Sil</DialogTitle>
            <DialogDescription id="delete-project-desc">
              <strong>{deleteTarget?.name}</strong> projesi silinecek. Bu işlem
              geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="projects.delete.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-ocid="projects.delete.confirm_button"
            >
              {deleteMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function ProjectForm({
  form,
  updateForm,
  showStatus,
}: {
  form: ProjectFormData;
  updateForm: (k: keyof ProjectFormData, v: string) => void;
  showStatus: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <Label className="mb-1.5 block">Proje Adı *</Label>
        <Input
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          placeholder="Örn: Hat Taşıma - A"
          data-ocid="projects.form.name.input"
        />
      </div>
      <div>
        <Label className="mb-1.5 block">Açıklama</Label>
        <Textarea
          value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
          placeholder="Proje hakkında bilgi..."
          rows={3}
          data-ocid="projects.form.description.textarea"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Başlangıç Tarihi</Label>
          <Input
            type="date"
            value={form.startDate}
            onChange={(e) => updateForm("startDate", e.target.value)}
            data-ocid="projects.form.startdate.input"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Bitiş Tarihi</Label>
          <Input
            type="date"
            value={form.endDate}
            onChange={(e) => updateForm("endDate", e.target.value)}
            data-ocid="projects.form.enddate.input"
          />
        </div>
      </div>
      {showStatus && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block">Durum</Label>
            <Select
              value={form.status}
              onValueChange={(v) => updateForm("status", v)}
            >
              <SelectTrigger data-ocid="projects.form.status.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "planned", label: "Planlandı" },
                  { value: "active", label: "Devam Ediyor" },
                  { value: "completed", label: "Tamamlandı" },
                  { value: "paused", label: "Beklemede" },
                ].map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">İlerleme (0-100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => updateForm("progress", e.target.value)}
              data-ocid="projects.form.progress.input"
            />
          </div>
        </div>
      )}
    </div>
  );
}
