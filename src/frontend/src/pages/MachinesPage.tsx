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
import { Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Machine } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddMachine,
  useDeleteMachine,
  useGetMachines,
  useUpdateMachine,
  useUpdateMachineStatus,
} from "../hooks/useQueries";

const statusOptions = [
  { value: "Active", label: "Aktif", cls: "bg-green-100 text-green-800" },
  {
    value: "Maintenance",
    label: "Bakımda",
    cls: "bg-amber-100 text-amber-800",
  },
  { value: "Broken", label: "Arızalı", cls: "bg-red-100 text-red-800" },
];

const machineTypes = [
  "CNC Tezgah",
  "Pres Makinesi",
  "Kaynak Makinesi",
  "Konveyör",
  "Kompresör",
  "Robot Kolu",
  "Tornalama Tezgahı",
  "Diğer",
];

interface MachineFormData {
  name: string;
  machineType: string;
  serialNumber: string;
  location: string;
  notes: string;
}

const emptyForm: MachineFormData = {
  name: "",
  machineType: "",
  serialNumber: "",
  location: "",
  notes: "",
};

export function MachinesPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";
  const machinesQuery = useGetMachines(userCode);
  const addMutation = useAddMachine();
  const updateMutation = useUpdateMachine();
  const statusMutation = useUpdateMachineStatus();
  const deleteMutation = useDeleteMachine();

  const [addOpen, setAddOpen] = useState(false);
  const [editMachine, setEditMachine] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [form, setForm] = useState<MachineFormData>(emptyForm);

  const machines = machinesQuery.data ?? [];

  const updateForm = (k: keyof MachineFormData, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleAdd = async () => {
    if (!form.name || !form.machineType || !form.serialNumber) {
      toast.error("Makine adı, türü ve seri numarası zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: userCode!,
        name: form.name,
        machineType: form.machineType,
        serialNumber: form.serialNumber,
        location: form.location,
        notes: form.notes,
      });
      toast.success("Makine eklendi");
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const openEdit = (m: Machine) => {
    setEditMachine(m);
    setForm({
      name: m.name,
      machineType: m.machineType,
      serialNumber: m.serialNumber,
      location: m.location,
      notes: m.notes,
    });
  };

  const handleUpdate = async () => {
    if (!editMachine) return;
    try {
      await updateMutation.mutateAsync({
        adminCode: userCode!,
        machineId: editMachine.serialNumber,
        name: form.name,
        machineType: form.machineType,
        serialNumber: form.serialNumber,
        location: form.location,
        notes: form.notes,
      });
      toast.success("Makine güncellendi");
      setEditMachine(null);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleStatusChange = async (m: Machine, status: string) => {
    try {
      await statusMutation.mutateAsync({
        userCode: userCode!,
        machineId: m.serialNumber,
        status,
      });
      toast.success("Durum güncellendi");
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        adminCode: userCode!,
        machineId: deleteTarget.serialNumber,
      });
      toast.success("Makine silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  return (
    <AppLayout title="Makineler">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Makineler
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {machines.length} makine kayıtlı
            </p>
          </div>
          {isAdmin && (
            <Button
              className="bg-primary text-white gap-2"
              onClick={() => {
                setForm(emptyForm);
                setAddOpen(true);
              }}
              data-ocid="machines.add_machine.button"
            >
              <Plus size={16} /> Makine Ekle
            </Button>
          )}
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="machines.table"
        >
          {machinesQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : machines.length === 0 ? (
            <div className="p-12 text-center" data-ocid="machines.empty_state">
              <Wrench
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <h3 className="font-semibold text-foreground mb-1">
                Henüz makine yok
              </h3>
              <p className="text-muted-foreground text-sm">
                İlk makinenizi ekleyerek başlayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Makine Adı",
                      "Tür",
                      "Seri No",
                      "Konum",
                      "Durum",
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
                  {machines.map((m, i) => (
                    <tr
                      key={m.serialNumber}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`machines.item.${i + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {m.name}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {m.machineType}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {m.serialNumber}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {m.location || "—"}
                      </td>
                      <td className="px-5 py-3">
                        {isAdmin ? (
                          <Select
                            value={m.status}
                            onValueChange={(v) => handleStatusChange(m, v)}
                          >
                            <SelectTrigger
                              className="h-7 w-32 text-xs"
                              data-ocid={`machines.status.select.${i + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}
                                  >
                                    {s.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              statusOptions.find((s) => s.value === m.status)
                                ?.cls ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statusOptions.find((s) => s.value === m.status)
                              ?.label ?? m.status}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(m)}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              data-ocid={`machines.edit_button.${i + 1}`}
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(m)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              data-ocid={`machines.delete_button.${i + 1}`}
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

      {/* Add Machine Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-machine-desc"
          data-ocid="machines.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Makine Ekle</DialogTitle>
            <DialogDescription id="add-machine-desc">
              Yeni bir makine kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          <MachineForm form={form} updateForm={updateForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="machines.add.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              data-ocid="machines.add.submit_button"
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

      {/* Edit Machine Modal */}
      <Dialog
        open={!!editMachine}
        onOpenChange={(o) => {
          if (!o) setEditMachine(null);
        }}
      >
        <DialogContent
          aria-describedby="edit-machine-desc"
          data-ocid="machines.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Makine Düzenle</DialogTitle>
            <DialogDescription id="edit-machine-desc">
              Makine bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <MachineForm form={form} updateForm={updateForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditMachine(null)}
              data-ocid="machines.edit.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-ocid="machines.edit.submit_button"
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

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent
          aria-describedby="delete-machine-desc"
          data-ocid="machines.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Makineyi Sil</DialogTitle>
            <DialogDescription id="delete-machine-desc">
              <strong>{deleteTarget?.name}</strong> makinesi silinecek. Bu işlem
              geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="machines.delete.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-ocid="machines.delete.confirm_button"
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

function MachineForm({
  form,
  updateForm,
}: {
  form: {
    name: string;
    machineType: string;
    serialNumber: string;
    location: string;
    notes: string;
  };
  updateForm: (
    k: "name" | "machineType" | "serialNumber" | "location" | "notes",
    v: string,
  ) => void;
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Makine Adı *</Label>
          <Input
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="Örn: CNC-01"
            data-ocid="machines.form.name.input"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Makine Türü *</Label>
          <Select
            value={form.machineType}
            onValueChange={(v) => updateForm("machineType", v)}
          >
            <SelectTrigger data-ocid="machines.form.type.select">
              <SelectValue placeholder="Seçin" />
            </SelectTrigger>
            <SelectContent>
              {machineTypes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5 block">Seri Numarası *</Label>
          <Input
            value={form.serialNumber}
            onChange={(e) => updateForm("serialNumber", e.target.value)}
            placeholder="SN-12345"
            data-ocid="machines.form.serial.input"
          />
        </div>
        <div>
          <Label className="mb-1.5 block">Konum</Label>
          <Input
            value={form.location}
            onChange={(e) => updateForm("location", e.target.value)}
            placeholder="A Holu, Hat 3"
            data-ocid="machines.form.location.input"
          />
        </div>
      </div>
      <div>
        <Label className="mb-1.5 block">Notlar</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => updateForm("notes", e.target.value)}
          placeholder="Ek bilgiler..."
          rows={3}
          data-ocid="machines.form.notes.textarea"
        />
      </div>
    </div>
  );
}
