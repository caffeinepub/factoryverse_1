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
import { Award, Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface TrainingCert {
  id: string;
  employeeName: string;
  certName: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  certType: "Mesleki" | "Güvenlik" | "Kalite" | "Diğer";
}

const today = new Date();
const addDays = (d: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + d);
  return dt.toISOString().split("T")[0];
};

const sampleData: TrainingCert[] = [
  {
    id: "1",
    employeeName: "Ahmet Yılmaz",
    certName: "Forklift Operatörü",
    issuer: "MEB",
    issueDate: "2022-03-15",
    expiryDate: addDays(200),
    certType: "Mesleki",
  },
  {
    id: "2",
    employeeName: "Fatma Kaya",
    certName: "İş Güvenliği Uzmanı",
    issuer: "TÜRKAK",
    issueDate: "2021-06-01",
    expiryDate: addDays(20),
    certType: "Güvenlik",
  },
  {
    id: "3",
    employeeName: "Mehmet Demir",
    certName: "ISO 9001 Denetçi",
    issuer: "BSI",
    issueDate: "2020-11-20",
    expiryDate: addDays(-10),
    certType: "Kalite",
  },
  {
    id: "4",
    employeeName: "Elif Şahin",
    certName: "Elektrik İç Tesisat",
    issuer: "TEDAŞ",
    issueDate: "2023-01-10",
    expiryDate: addDays(400),
    certType: "Mesleki",
  },
  {
    id: "5",
    employeeName: "Ali Çelik",
    certName: "İlk Yardım",
    issuer: "Kızılay",
    issueDate: "2022-09-05",
    expiryDate: addDays(15),
    certType: "Güvenlik",
  },
];

function getStatusBadge(expiryDate: string) {
  const exp = new Date(expiryDate);
  const diff = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
  if (diff < 0)
    return <Badge className="bg-red-100 text-red-800">Süresi Doldu</Badge>;
  if (diff <= 30)
    return (
      <Badge className="bg-yellow-100 text-yellow-800">Son {diff} Gün</Badge>
    );
  return <Badge className="bg-green-100 text-green-800">Geçerli</Badge>;
}

const emptyForm: Omit<TrainingCert, "id"> = {
  employeeName: "",
  certName: "",
  issuer: "",
  issueDate: "",
  expiryDate: "",
  certType: "Mesleki",
};

export function TrainingCertsPage() {
  const [records, setRecords] = useState<TrainingCert[]>(sampleData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TrainingCert | null>(null);
  const [form, setForm] = useState(emptyForm);

  const expiringSoon = records.filter((r) => {
    const diff = Math.ceil(
      (new Date(r.expiryDate).getTime() - today.getTime()) / 86400000,
    );
    return diff >= 0 && diff <= 30;
  }).length;
  const expired = records.filter((r) => new Date(r.expiryDate) < today).length;

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };
  const openEdit = (r: TrainingCert) => {
    setEditing(r);
    setForm({
      employeeName: r.employeeName,
      certName: r.certName,
      issuer: r.issuer,
      issueDate: r.issueDate,
      expiryDate: r.expiryDate,
      certType: r.certType,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.employeeName.trim() || !form.certName.trim()) return;
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
            <Award className="text-primary" size={26} />
            Eğitim Sertifikaları
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Çalışan sertifika kayıtları ve son tarih takibi
          </p>
        </div>
        <Button onClick={openAdd} data-ocid="training-certs.primary_button">
          <Plus size={16} className="mr-2" /> Sertifika Ekle
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Toplam Sertifika</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {records.length}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Yakında Dolacak</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {expiringSoon}
          </p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Süresi Dolmuş</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{expired}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Çalışan
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Sertifika
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Kurum
              </th>
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground">
                Tür
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
            {records.map((r, i) => (
              <tr
                key={r.id}
                className="border-t hover:bg-muted/20"
                data-ocid={`training-certs.item.${i + 1}`}
              >
                <td className="px-4 py-3 font-medium">{r.employeeName}</td>
                <td className="px-4 py-3">{r.certName}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.issuer}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{r.certType}</Badge>
                </td>
                <td className="px-4 py-3">{r.expiryDate}</td>
                <td className="px-4 py-3">{getStatusBadge(r.expiryDate)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(r)}
                      data-ocid={`training-certs.edit_button.${i + 1}`}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setRecords((prev) => prev.filter((x) => x.id !== r.id))
                      }
                      data-ocid={`training-certs.delete_button.${i + 1}`}
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                  data-ocid="training-certs.empty_state"
                >
                  Henüz sertifika yok
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent data-ocid="training-certs.dialog">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Sertifika Düzenle" : "Yeni Sertifika"}
            </DialogTitle>
            <DialogDescription>
              Sertifika bilgilerini doldurun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Çalışan Adı</Label>
              <Input
                data-ocid="training-certs.input"
                value={form.employeeName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, employeeName: e.target.value }))
                }
                placeholder="Çalışan adı"
              />
            </div>
            <div>
              <Label>Sertifika Adı</Label>
              <Input
                value={form.certName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, certName: e.target.value }))
                }
                placeholder="Sertifika adı"
              />
            </div>
            <div>
              <Label>Veren Kurum</Label>
              <Input
                value={form.issuer}
                onChange={(e) =>
                  setForm((p) => ({ ...p, issuer: e.target.value }))
                }
                placeholder="Kurum adı"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Veriliş Tarihi</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, issueDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Bitiş Tarihi</Label>
                <Input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, expiryDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Sertifika Türü</Label>
              <Select
                value={form.certType}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    certType: v as TrainingCert["certType"],
                  }))
                }
              >
                <SelectTrigger data-ocid="training-certs.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["Mesleki", "Güvenlik", "Kalite", "Diğer"] as const).map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                data-ocid="training-certs.cancel_button"
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                data-ocid="training-certs.submit_button"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
