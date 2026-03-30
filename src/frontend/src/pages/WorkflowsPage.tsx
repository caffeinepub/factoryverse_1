import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Edit, GitBranch, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Status = "Bekliyor" | "Devam Ediyor" | "Tamamlandı" | "İptal";
type Priority = "Yüksek" | "Orta" | "Düşük";

interface Workflow {
  id: string;
  name: string;
  steps: string;
  responsible: string;
  department: string;
  priority: Priority;
  status: Status;
  startDate: string;
  dueDate: string;
}

const today = new Date();

const sampleData: Workflow[] = [
  {
    id: "1",
    name: "Yeni Ekipman Onayı",
    steps: "Talep → Teknik İnceleme → Bütçe Onayı → Satın Alma",
    responsible: "Ahmet Yılmaz",
    department: "Satın Alma",
    priority: "Yüksek",
    status: "Devam Ediyor",
    startDate: "2026-03-01",
    dueDate: "2026-04-15",
  },
  {
    id: "2",
    name: "Personel İşe Alım",
    steps: "İlan → Başvuru → Mülakat → Teklif → Onboarding",
    responsible: "Fatma Kaya",
    department: "İK",
    priority: "Orta",
    status: "Bekliyor",
    startDate: "2026-03-10",
    dueDate: "2026-05-01",
  },
  {
    id: "3",
    name: "Bakım İş Emri Kapatma",
    steps: "Arıza → İş Emri → Bakım → Test → Kapatma",
    responsible: "Mehmet Demir",
    department: "Bakım",
    priority: "Yüksek",
    status: "Tamamlandı",
    startDate: "2026-02-15",
    dueDate: "2026-03-01",
  },
  {
    id: "4",
    name: "Kalite Denetimi",
    steps: "Planlama → Kontrol → Rapor → Aksiyon",
    responsible: "Elif Şahin",
    department: "Kalite",
    priority: "Orta",
    status: "Devam Ediyor",
    startDate: "2026-03-20",
    dueDate: "2026-03-25",
  },
  {
    id: "5",
    name: "Tedarikçi Değerlendirme",
    steps: "Anket → Puanlama → Karar",
    responsible: "Ali Çelik",
    department: "Tedarik",
    priority: "Düşük",
    status: "İptal",
    startDate: "2026-01-10",
    dueDate: "2026-02-10",
  },
];

const statusColors: Record<Status, string> = {
  Bekliyor: "bg-blue-100 text-blue-800",
  "Devam Ediyor": "bg-yellow-100 text-yellow-800",
  Tamamlandı: "bg-green-100 text-green-800",
  İptal: "bg-gray-100 text-gray-800",
};

const priorityColors: Record<Priority, string> = {
  Yüksek: "bg-red-100 text-red-800",
  Orta: "bg-orange-100 text-orange-800",
  Düşük: "bg-green-100 text-green-800",
};

function isOverdue(w: Workflow) {
  return (
    new Date(w.dueDate) < today &&
    w.status !== "Tamamlandı" &&
    w.status !== "İptal"
  );
}

const emptyForm: Omit<Workflow, "id"> = {
  name: "",
  steps: "",
  responsible: "",
  department: "",
  priority: "Orta",
  status: "Bekliyor",
  startDate: "",
  dueDate: "",
};

export function WorkflowsPage() {
  const [records, setRecords] = useState<Workflow[]>(sampleData);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered =
    filter === "all" ? records : records.filter((r) => r.status === filter);
  const active = records.filter((r) => r.status === "Devam Ediyor").length;
  const completed = records.filter((r) => r.status === "Tamamlandı").length;
  const overdue = records.filter(isOverdue).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (r: Workflow) => {
    setEditing(r);
    setForm({
      name: r.name,
      steps: r.steps,
      responsible: r.responsible,
      department: r.department,
      priority: r.priority,
      status: r.status,
      startDate: r.startDate,
      dueDate: r.dueDate,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setRecords((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...editing, ...form } : r)),
      );
    } else {
      setRecords((prev) => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <GitBranch className="text-primary" size={26} />
            İş Akışı Yönetimi
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Süreç ve iş akışı takibi
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="workflows.primary_button">
          <Plus size={16} className="mr-2" /> Yeni Akış
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Toplam</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {records.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Aktif</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{active}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Tamamlandı</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completed}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Gecikmiş</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{overdue}</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList data-ocid="workflows.tab">
          <TabsTrigger value="all">Tümü</TabsTrigger>
          <TabsTrigger value="Bekliyor">Bekliyor</TabsTrigger>
          <TabsTrigger value="Devam Ediyor">Devam Ediyor</TabsTrigger>
          <TabsTrigger value="Tamamlandı">Tamamlandı</TabsTrigger>
          <TabsTrigger value="İptal">İptal</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Akış Adı
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Sorumlu
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Departman
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Öncelik
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Bitiş
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Durum
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                className="border-t hover:bg-muted/20"
                data-ocid={`workflows.item.${i + 1}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.steps}</p>
                </td>
                <td className="px-4 py-3">{r.responsible}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.department}
                </td>
                <td className="px-4 py-3">
                  <Badge className={priorityColors[r.priority]}>
                    {r.priority}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {isOverdue(r) && (
                      <AlertTriangle size={14} className="text-red-500" />
                    )}
                    <span
                      className={isOverdue(r) ? "text-red-600 font-medium" : ""}
                    >
                      {r.dueDate}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={statusColors[r.status]}>{r.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(r)}
                      data-ocid={`workflows.edit_button.${i + 1}`}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setRecords((prev) => prev.filter((x) => x.id !== r.id))
                      }
                      data-ocid={`workflows.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                  data-ocid="workflows.empty_state"
                >
                  Bu kategoride iş akışı yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="workflows.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "İş Akışı Düzenle" : "Yeni İş Akışı"}
            </DialogTitle>
            <DialogDescription>İş akışı bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Akış Adı</Label>
              <Input
                data-ocid="workflows.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="İş akışı adı"
              />
            </div>
            <div>
              <Label>Süreç Adımları</Label>
              <Textarea
                data-ocid="workflows.textarea"
                value={form.steps}
                onChange={(e) =>
                  setForm((p) => ({ ...p, steps: e.target.value }))
                }
                placeholder="Adım1 → Adım2 → Adım3"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sorumlu Kişi</Label>
                <Input
                  value={form.responsible}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, responsible: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Departman</Label>
                <Input
                  value={form.department}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, department: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Öncelik</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, priority: v as Priority }))
                  }
                >
                  <SelectTrigger data-ocid="workflows.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Yüksek", "Orta", "Düşük"] as const).map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Durum</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, status: v as Status }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      [
                        "Bekliyor",
                        "Devam Ediyor",
                        "Tamamlandı",
                        "İptal",
                      ] as const
                    ).map((t) => (
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
                <Label>Başlangıç</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, startDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Bitiş</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                data-ocid="workflows.cancel_button"
              >
                İptal
              </Button>
              <Button onClick={handleSave} data-ocid="workflows.submit_button">
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
