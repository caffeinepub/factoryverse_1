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
import { Loader2, Plus, UserMinus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Personnel } from "../backend";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useAddPersonnel,
  useGetPersonnel,
  useRemovePersonnel,
  useUpdatePersonnelRole,
} from "../hooks/useQueries";

const roles = ["Admin", "Manager", "Technician", "Viewer"];
const roleLabel: Record<string, string> = {
  Admin: "Yönetici",
  Manager: "Müdür",
  Technician: "Teknisyen",
  Viewer: "Görüntüleyici",
};

export function PersonnelPage() {
  const { session } = useAuth();
  const isAdmin = session?.userType === "admin";
  const adminCode = isAdmin ? (session?.userCode ?? null) : null;
  const personnelQuery = useGetPersonnel(adminCode);
  const addMutation = useAddPersonnel();
  const roleMutation = useUpdatePersonnelRole();
  const removeMutation = useRemovePersonnel();

  const [addOpen, setAddOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [selectedRole, setSelectedRole] = useState("Technician");
  const [removeTarget, setRemoveTarget] = useState<Personnel | null>(null);

  const personnel = personnelQuery.data ?? [];

  const handleAdd = async () => {
    if (!inviteCode.trim()) {
      toast.error("Davet kodu zorunludur");
      return;
    }
    try {
      await addMutation.mutateAsync({
        adminCode: adminCode!,
        inviteCode: inviteCode.trim(),
        role: selectedRole,
      });
      toast.success("Personel eklendi");
      setAddOpen(false);
      setInviteCode("");
      setSelectedRole("Technician");
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleRoleChange = async (p: Personnel, role: string) => {
    try {
      await roleMutation.mutateAsync({
        adminCode: adminCode!,
        personnelId: p.loginCode,
        role,
      });
      toast.success("Rol güncellendi");
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await removeMutation.mutateAsync({
        adminCode: adminCode!,
        personnelId: removeTarget.loginCode,
      });
      toast.success("Personel kaldırıldı");
      setRemoveTarget(null);
    } catch (e) {
      toast.error(`Hata: ${e instanceof Error ? e.message : "Bilinmeyen"}`);
    }
  };

  if (!isAdmin) {
    return (
      <AppLayout title="Personel">
        <div className="bg-card rounded-xl border border-border shadow-card p-8 text-center">
          <Users size={40} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">
            Personel listesi yalnızca yöneticiler için
          </h3>
          <p className="text-muted-foreground text-sm">
            Bu sayfayı görüntülemek için yönetici erişimine ihtiyacınız var
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Personel">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Personel
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {personnel.length} personel kayıtlı
            </p>
          </div>
          <Button
            className="bg-primary text-white gap-2"
            onClick={() => setAddOpen(true)}
            data-ocid="personnel.add_personnel.button"
          >
            <Plus size={16} /> Personel Ekle
          </Button>
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card"
          data-ocid="personnel.table"
        >
          {personnelQuery.isLoading ? (
            <div className="p-5 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : personnel.length === 0 ? (
            <div className="p-12 text-center" data-ocid="personnel.empty_state">
              <Users size={40} className="text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">
                Henüz personel yok
              </h3>
              <p className="text-muted-foreground text-sm">
                Personel eklemek için davet kodunu kullanın
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b border-border">
                    {["Ad Soyad", "Giriş Kodu", "Rol", "Durum", "İşlem"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {personnel.map((p, i) => (
                    <tr
                      key={p.loginCode}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      data-ocid={`personnel.item.${i + 1}`}
                    >
                      <td className="px-5 py-3 font-medium text-foreground">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {p.loginCode}
                      </td>
                      <td className="px-5 py-3">
                        <Select
                          value={p.role}
                          onValueChange={(v) => handleRoleChange(p, v)}
                        >
                          <SelectTrigger
                            className="h-7 w-36 text-xs"
                            data-ocid={`personnel.role.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r} value={r}>
                                {roleLabel[r] ?? r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            p.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(p)}
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                          data-ocid={`personnel.delete_button.${i + 1}`}
                        >
                          <UserMinus size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add Personnel Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent
          aria-describedby="add-personnel-desc"
          data-ocid="personnel.add.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Personel Ekle</DialogTitle>
            <DialogDescription id="add-personnel-desc">
              Personelin davet kodunu girin ve rol atayın
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-1.5 block">Davet Kodu</Label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Personelin davet kodu"
                className="font-mono tracking-wider"
                data-ocid="personnel.add.invite_code.input"
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Rol</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger data-ocid="personnel.add.role.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabel[r] ?? r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="personnel.add.cancel_button"
            >
              İptal
            </Button>
            <Button
              className="bg-primary text-white"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              data-ocid="personnel.add.submit_button"
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

      {/* Remove Confirm */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(o) => {
          if (!o) setRemoveTarget(null);
        }}
      >
        <DialogContent
          aria-describedby="remove-personnel-desc"
          data-ocid="personnel.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">Personeli Kaldır</DialogTitle>
            <DialogDescription id="remove-personnel-desc">
              <strong>{removeTarget?.name}</strong> şirketten kaldırılacak.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveTarget(null)}
              data-ocid="personnel.delete.cancel_button"
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removeMutation.isPending}
              data-ocid="personnel.delete.confirm_button"
            >
              {removeMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Kaldır"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
