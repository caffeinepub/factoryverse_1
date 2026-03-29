import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigation } from "../contexts/NavigationContext";
import { useSelfRegisterPersonnel } from "../hooks/useQueries";

interface CodeResult {
  loginCode: string;
  inviteCode: string;
  name: string;
}

export function PersonnelSelfRegisterPage() {
  const { navigate } = useNavigation();
  const [name, setName] = useState("");
  const [result, setResult] = useState<CodeResult | null>(null);
  const [copied, setCopied] = useState<"login" | "invite" | null>(null);
  const registerMutation = useSelfRegisterPersonnel();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("İsim zorunludur");
      return;
    }
    try {
      const personnel = await registerMutation.mutateAsync(name.trim());
      setResult({
        loginCode: personnel.loginCode,
        inviteCode: personnel.inviteCode,
        name: personnel.name,
      });
    } catch (e) {
      toast.error(
        `Kayıt başarısız: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      );
    }
  };

  const copyCode = (type: "login" | "invite") => {
    const code = type === "login" ? result?.loginCode : result?.inviteCode;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast.success("Kod kopyalandı!");
    }
  };

  if (result) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background:
            "linear-gradient(135deg, #1A1340 0%, #2A1B66 50%, #4F46E5 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
          data-ocid="personnel_register.success.panel"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-1">
              Kayıt Başarılı!
            </h2>
            <p className="text-muted-foreground text-sm">
              Hoş geldiniz, {result.name}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-amber-600 mt-0.5 flex-shrink-0"
              />
              <p className="text-amber-800 text-sm font-medium">
                Davet kodunuzu yöneticinize verin. Giriş kodunuzu güvenli bir
                yerde saklayın.
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Giriş Kodunuz (Saklayın)
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-foreground/5 border border-border rounded-lg px-4 py-3 font-mono text-base font-bold tracking-widest text-foreground">
                  {result.loginCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyCode("login")}
                  data-ocid="personnel_register.copy_login.button"
                >
                  {copied === "login" ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Davet Kodunuz (Yöneticiye Verin)
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-primary/5 border border-primary/30 rounded-lg px-4 py-3 font-mono text-base font-bold tracking-widest text-primary">
                  {result.inviteCode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyCode("invite")}
                  data-ocid="personnel_register.copy_invite.button"
                >
                  {copied === "invite" ? (
                    <CheckCircle2 size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-primary text-white"
            onClick={() => navigate("login")}
            data-ocid="personnel_register.goto_login.button"
          >
            Giriş Sayfasına Git
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background:
          "linear-gradient(135deg, #1A1340 0%, #2A1B66 50%, #4F46E5 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
      >
        <button
          type="button"
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          data-ocid="personnel_register.back.button"
        >
          <ArrowLeft size={16} /> Geri
        </button>

        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Personel Kaydı
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Adınızı girin, size giriş ve davet kodları üretilecek
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="personnelName" className="mb-2 block">
              Adınız Soyadınız
            </Label>
            <Input
              id="personnelName"
              placeholder="Örn: Ahmet Yılmaz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              data-ocid="personnel_register.name.input"
            />
          </div>

          <Button
            className="w-full bg-primary text-white"
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
            data-ocid="personnel_register.submit.button"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Kayıt Ol"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
