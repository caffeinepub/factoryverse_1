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
import {
  CalendarCheck,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddLeaveRequest,
  useDeleteLeaveRequest,
  useGetLeaveRequests,
  useReviewLeaveRequest,
} from "../hooks/useQueries";
import type { LeaveRequest } from "../types";

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: "Beklemede", cls: "bg-amber-100 text-amber-700" },
  approved: { label: "Onaylandı", cls: "bg-green-100 text-green-700" },
  rejected: { label: "Reddedildi", cls: "bg-red-100 text-red-700" },
};

const leaveTypes = [
  "Yıllık İzin",
  "Hastalık İzni",
  "Mazeret İzni",
  "Ücretsiz İzin",
  "Diğer",
];

interface RequestForm {
  personnelName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

const emptyForm: RequestForm = {
  personnelName: "",
  leaveType: "Yıllık İzin",
  startDate: "",
  endDate: "",
  reason: "",
};

export function LeavePage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;
  const isAdmin = session?.userType === "admin";

  const requestsQuery = useGetLeaveRequests(userCode);
  const addMutation = useAddLeaveRequest();
  const reviewMutation = useReviewLeaveRequest();
  const deleteMutation = useDeleteLeaveRequest();

  const [addOpen, setAddOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<LeaveRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeaveRequest | null>(null);
  const [form, setForm] = useState<RequestForm>(emptyForm);
  const [reviewNote, setReviewNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const requests = requestsQuery.data ?? [];
  const updateForm = (k: keyof RequestForm, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const filtered =
    filterStatus === "all"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const handleAdd = async () => {
    if (!form.personnelName || !form.startDate || !form.endDate) {
      toast.error("Ad, başlangıç ve bitiş tarihi zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        userCode: userCode!,
        personnelName: form.personnelName,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
      });
      toast.success("İzin talebi oluşturuldu");
      setAddOpen(false);
      setForm(emptyForm);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleReview = async (status: "approved" | "rejected") => {
    if (!reviewTarget) return;
    try {
      await reviewMutation.mutateAsync({
        adminCode: userCode!,
        requestId: reviewTarget.id,
        status,
        reviewNote,
      });
      toast.success(
        status === "approved" ? "Talep onaylandı" : "Talep reddedildi",
      );
      setReviewTarget(null);
      setReviewNote("");
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync({
        adminCode: userCode!,
        requestId: deleteTarget.id,
      });
      toast.success("Talep silindi");
      setDeleteTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  return (
    <AppLayout title="İzin Yönetimi">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Beklemede",
              count: pendingCount,
              cls: "text-amber-700 bg-amber-50 border-amber-200",
            },
            {
              label: "Onaylandı",
              count: approvedCount,
              cls: "text-green-700 bg-green-50 border-green-200",
            },
            {
              label: "Reddedildi",
              count: rejectedCount,
              cls: "text-red-700 bg-red-50 border-red-200",
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
              İzin Talepleri
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {requests.length} talep kayıtlı
            </p>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger
              className="w-40"
              data-ocid="leave.filter_status.select"
            >
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="pending">Beklemede</SelectItem>
              <SelectItem value="approved">Onaylandı</SelectItem>
              <SelectItem value="rejected">Reddedildi</SelectItem>
            </SelectContent>
          </Select>
          <Button
            className="bg-primary text-white gap-2"
            onClick={() => {
              setForm(emptyForm);
              setAddOpen(true);
            }}
            data-ocid="leave.add_request.button"
          >
            <Plus size={16} /> İzin Talebi
          </Button>
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="leave.table"
        >
          {requestsQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center" data-ocid="leave.empty_state">
              <CalendarCheck
                size={40}
                className="text-muted-foreground mx-auto mb-3"
              />
              <h3 className="font-semibold text-foreground mb-1">
                İzin talebi bulunamadı
              </h3>
              <p className="text-muted-foreground text-sm">
                İzin talebi oluşturmak için butona tıklayın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {[
                      "Personel",
                      "İzin Türü",
                      "Başlangıç",
                      "Bitiş",
                      "Neden",
                      "Durum",
                      "Not",
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
                  {filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`leave.item.${i + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {r.personnelName}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.leaveType}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.startDate || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {r.endDate || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted-foreground max-w-[150px] truncate">
                        {r.reason || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          className={`text-xs ${statusConfig[r.status]?.cls ?? ""}`}
                        >
                          {statusConfig[r.status]?.label ?? r.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs max-w-[120px] truncate">
                        {r.reviewNote || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          {isAdmin && r.status === "pending" && (
                            <button
                              type="button"
                              onClick={() => {
                                setReviewTarget(r);
                                setReviewNote("");
                              }}
                              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                              data-ocid={`leave.review_button.${i + 1}`}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(r)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              data-ocid={`leave.delete_button.${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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
          aria-describedby="add-leave-desc"
          data-ocid="leave.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              İzin Talebi Oluştur
            </DialogTitle>
            <DialogDescription id="add-leave-desc">
              Yeni izin talebi oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Adı Soyadı *</Label>
              <Input
                value={form.personnelName}
                onChange={(e) => updateForm("personnelName", e.target.value)}
                placeholder="Ad Soyad"
                data-ocid="leave.form.name.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">İzin Türü</Label>
              <Select
                value={form.leaveType}
                onValueChange={(v) => updateForm("leaveType", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block">Başlangıç *</Label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => updateForm("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Bitiş *</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => updateForm("endDate", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block">Açıklama</Label>
              <Textarea
                value={form.reason}
                onChange={(e) => updateForm("reason", e.target.value)}
                placeholder="İzin sebebi..."
                rows={2}
              />
            </div>
          </div>
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
                "Gönder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={!!reviewTarget}
        onOpenChange={(o) => {
          if (!o) setReviewTarget(null);
        }}
      >
        <DialogContent
          aria-describedby="review-leave-desc"
          data-ocid="leave.review.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              Talebi Değerlendir
            </DialogTitle>
            <DialogDescription id="review-leave-desc">
              <strong>{reviewTarget?.personnelName}</strong> kişisinin{" "}
              {reviewTarget?.leaveType} talebi ({reviewTarget?.startDate} –{" "}
              {reviewTarget?.endDate})
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="mb-1.5 block">
              Değerlendirme Notu (isteğe bağlı)
            </Label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Onay/ret sebebi..."
              rows={2}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewTarget(null)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview("rejected")}
              disabled={reviewMutation.isPending}
              className="gap-1"
            >
              <XCircle size={14} /> Reddet
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white gap-1"
              onClick={() => handleReview("approved")}
              disabled={reviewMutation.isPending}
            >
              <CheckCircle2 size={14} /> Onayla
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
        <DialogContent aria-describedby="delete-leave-desc">
          <DialogHeader>
            <DialogTitle className="font-display">Talebi Sil</DialogTitle>
            <DialogDescription id="delete-leave-desc">
              <strong>{deleteTarget?.personnelName}</strong> kişisinin izin
              talebi silinecek.
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
