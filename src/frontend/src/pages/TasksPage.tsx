import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddTask,
  useDeleteTask,
  useGetProjects,
  useGetTasks,
  useUpdateTask,
} from "../hooks/useQueries";
import type { Task } from "../types";

const priorityConfig: Record<string, { label: string; cls: string }> = {
  low: { label: "Düşük", cls: "bg-slate-100 text-slate-700" },
  medium: { label: "Orta", cls: "bg-blue-100 text-blue-700" },
  high: { label: "Yüksek", cls: "bg-orange-100 text-orange-700" },
  critical: { label: "Kritik", cls: "bg-red-100 text-red-700" },
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  todo: { label: "Yapılacak", cls: "bg-gray-100 text-gray-700" },
  "in-progress": { label: "Devam Ediyor", cls: "bg-blue-100 text-blue-700" },
  done: { label: "Tamamlandı", cls: "bg-green-100 text-green-700" },
};

interface TaskForm {
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
}

const emptyForm: TaskForm = {
  projectId: "",
  title: "",
  description: "",
  assignedTo: "",
  priority: "medium",
  status: "todo",
  dueDate: "",
};

export function TasksPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";

  const tasksQuery = useGetTasks(userCode);
  const projectsQuery = useGetProjects(userCode);
  const addMutation = useAddTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const tasks = tasksQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const updateForm = (k: keyof TaskForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  });

  const getProjectName = (projectId: string) =>
    projects.find((p) => p.id === projectId)?.name ??
    (projectId ? projectId : "—");

  const handleAdd = async () => {
    if (!form.title) {
      toast.error("Görev başlığı zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        projectId: form.projectId,
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        priority: form.priority,
        dueDate: form.dueDate,
      });
      toast.success("Görev eklendi");
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({
      projectId: t.projectId,
      title: t.title,
      description: t.description,
      assignedTo: t.assignedTo,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
    });
  };

  const handleUpdate = async () => {
    if (!editTask) return;
    try {
      await updateMutation.mutateAsync({
        adminCode: userCode!,
        taskId: editTask.id,
        title: form.title,
        description: form.description,
        assignedTo: form.assignedTo,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate,
      });
      toast.success("Görev güncellendi");
      setEditTask(null);
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
        taskId: deleteTarget.id,
      });
      toast.success("Görev silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const inProgressCount = tasks.filter(
    (t) => t.status === "in-progress",
  ).length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <AppLayout title="Görev Yönetimi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Yapılacak",
              count: todoCount,
              cls: "text-gray-700 bg-gray-50 border-gray-200",
            },
            {
              label: "Devam Ediyor",
              count: inProgressCount,
              cls: "text-blue-700 bg-blue-50 border-blue-200",
            },
            {
              label: "Tamamlandı",
              count: doneCount,
              cls: "text-green-700 bg-green-50 border-green-200",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.cls}`}>
              <p className="text-2xl font-bold font-display">{s.count}</p>
              <p className="text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-foreground">
              Görevler
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {tasks.length} görev kayıtlı
            </p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-36"
              data-ocid="tasks.filter_status.select"
            >
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="todo">Yapılacak</SelectItem>
              <SelectItem value="in-progress">Devam Ediyor</SelectItem>
              <SelectItem value="done">Tamamlandı</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger
              className="w-36"
              data-ocid="tasks.filter_priority.select"
            >
              <SelectValue placeholder="Öncelik" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Öncelikler</SelectItem>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="critical">Kritik</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setForm(emptyForm);
                setAddOpen(true);
              }}
              data-ocid="tasks.add_task.button"
            >
              <Plus size={16} /> Görev Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="tasks.table"
        >
          {tasksQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="tasks.empty_state">
              <CheckSquare
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <h3 className="font-semibold text-foreground mb-1">
                Görev bulunamadı
              </h3>
              <p className="text-muted-foreground text-sm">
                Yeni bir görev ekleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Başlık",
                      "Proje",
                      "Atanan",
                      "Öncelik",
                      "Durum",
                      "Bitiş",
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
                  {filtered.map((t, i) => (
                    <tr
                      key={t.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`tasks.item.${i + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {t.title}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {getProjectName(t.projectId)}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {t.assignedTo || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={`text-xs ${priorityConfig[t.priority]?.cls ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {priorityConfig[t.priority]?.label ?? t.priority}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={`text-xs ${statusConfig[t.status]?.cls ?? "bg-gray-100 text-gray-600"}`}
                        >
                          {statusConfig[t.status]?.label ?? t.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {t.dueDate || "—"}
                      </td>
                      <td className="px-5 py-3">
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(t)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              data-ocid={`tasks.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(t)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              data-ocid={`tasks.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-task-desc"
          data-ocid="tasks.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Görev Ekle</DialogTitle>
            <DialogDescription id="add-task-desc">
              Yeni görev kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <TaskFormFields
            form={form}
            updateForm={updateForm}
            projects={projects}
            showStatus={false}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
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
        open={!!editTask}
        onOpenChange={(o) => {
          if (!o) setEditTask(null);
        }}
      >
        <DialogContent
          aria-describedby="edit-task-desc"
          data-ocid="tasks.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Görevi Düzenle</DialogTitle>
            <DialogDescription id="edit-task-desc">
              Görev bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <TaskFormFields
            form={form}
            updateForm={updateForm}
            projects={projects}
            showStatus={true}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTask(null)}>
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
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
        <DialogContent aria-describedby="delete-task-desc">
          <DialogHeader>
            <DialogTitle className="font-display">Görevi Sil</DialogTitle>
            <DialogDescription id="delete-task-desc">
              <strong>{deleteTarget?.title}</strong> görevi silinecek. Bu işlem
              geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
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

function TaskFormFields({
  form,
  updateForm,
  projects,
  showStatus,
}: {
  form: TaskForm;
  updateForm: (k: keyof TaskForm, v: string) => void;
  projects: { id: string; name: string }[];
  showStatus: boolean;
}) {
  return (
    <div className="space-y-4 py-2">
      <div>
        <Label className="mb-1.5 block">Görev Başlığı *</Label>
        <Input
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
          placeholder="Örn: Makine kurulum testi"
          data-ocid="tasks.form.title.input"
        />
      </div>
      <div>
        <Label className="mb-1.5 block">Açıklama</Label>
        <Textarea
          value={form.description}
          onChange={(e) => updateForm("description", e.target.value)}
          placeholder="Görev detayları..."
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Proje</Label>
          <Select
            value={form.projectId || "_none"}
            onValueChange={(v) =>
              updateForm("projectId", v === "_none" ? "" : v)
            }
          >
            <SelectTrigger data-ocid="tasks.form.project.select">
              <SelectValue placeholder="Proje seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Proje yok</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1.5 block">Atanan Kişi</Label>
          <Input
            value={form.assignedTo}
            onChange={(e) => updateForm("assignedTo", e.target.value)}
            placeholder="Ad Soyad"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Öncelik</Label>
          <Select
            value={form.priority}
            onValueChange={(v) => updateForm("priority", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Düşük</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek</SelectItem>
              <SelectItem value="critical">Kritik</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {showStatus ? (
          <div>
            <Label className="mb-1.5 block">Durum</Label>
            <Select
              value={form.status}
              onValueChange={(v) => updateForm("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Yapılacak</SelectItem>
                <SelectItem value="in-progress">Devam Ediyor</SelectItem>
                <SelectItem value="done">Tamamlandı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label className="mb-1.5 block">Bitiş Tarihi</Label>
            <Input
              type="date"
              value={form.dueDate}
              onChange={(e) => updateForm("dueDate", e.target.value)}
            />
          </div>
        )}
      </div>
      {showStatus && (
        <div>
          <Label className="mb-1.5 block">Bitiş Tarihi</Label>
          <Input
            type="date"
            value={form.dueDate}
            onChange={(e) => updateForm("dueDate", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
