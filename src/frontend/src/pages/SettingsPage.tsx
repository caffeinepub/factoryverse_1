import { Button } from "@/components/ui/button";
import { CheckCircle2, Copy, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";

const modeLabel: Record<string, string> = {
  Relocation: "Taşıma",
  Greenfield: "Kurulum",
  Hybrid: "Hibrit",
};

export function SettingsPage() {
  const { session, logout } = useAuth();
  const { navigate } = useNavigation();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (session?.userCode) {
      navigator.clipboard.writeText(session.userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Kod kopyalandı");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("landing");
  };

  return (
    <AppLayout title="Ayarlar">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg"
      >
        <h1 className="font-display font-bold text-2xl text-foreground mb-6">
          Ayarlar
        </h1>

        <div
          className="bg-card rounded-xl border border-border shadow-card p-6 mb-4"
          data-ocid="settings.company.panel"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            Şirket Bilgileri
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Şirket Adı
              </p>
              <p className="text-foreground font-medium">
                {session?.companyName ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Operasyon Modu
              </p>
              <p className="text-foreground font-medium">
                {session?.companyMode
                  ? (modeLabel[session.companyMode] ?? session.companyMode)
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Hesap Türü
              </p>
              <p className="text-foreground font-medium capitalize">
                {session?.userType === "admin" ? "Yönetici" : "Personel"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Erişim Kodunuz
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-foreground/5 border border-border rounded-lg px-4 py-2.5 font-mono text-sm font-bold tracking-widest text-foreground">
                  {session?.userCode ?? ""}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyCode}
                  data-ocid="settings.copy_code.button"
                >
                  {copied ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Bu kodu güvenli bir yerde saklayın
              </p>
            </div>
          </div>
        </div>

        <div
          className="bg-card rounded-xl border border-border shadow-card p-6"
          data-ocid="settings.account.panel"
        >
          <h2 className="font-display font-semibold text-foreground mb-4">
            Hesap İşlemleri
          </h2>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleLogout}
            data-ocid="settings.logout.button"
          >
            <LogOut size={16} />
            Çıkış Yap
          </Button>
        </div>
      </motion.div>
    </AppLayout>
  );
}
