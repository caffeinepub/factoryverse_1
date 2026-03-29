import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Building2, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useActor } from "../hooks/useActor";

type LoginMode = "admin" | "personnel";

export function LoginPage() {
  const { navigate } = useNavigation();
  const { login } = useAuth();
  const { actor } = useActor();
  const [mode, setMode] = useState<LoginMode>("admin");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleModeChange = (newMode: LoginMode) => {
    setMode(newMode);
    setCode("");
  };

  const handleLogin = async () => {
    if (code.trim().length < 6) {
      toast.error("Geçerli bir erişim kodu giriniz");
      return;
    }
    if (!actor) {
      toast.error("Sistem hazır değil, lütfen bekleyin");
      return;
    }
    setLoading(true);
    try {
      const trimmedCode = code.trim();
      const company = await actor.getCompanyInfo(trimmedCode);

      if (!company) {
        toast.error(
          mode === "admin"
            ? "Geçersiz şirket kodu. Lütfen tekrar deneyin."
            : "Geçersiz personel giriş kodu. Lütfen tekrar deneyin.",
        );
        return;
      }

      const resolvedType =
        company.adminCode === trimmedCode ? "admin" : "personnel";

      if (mode === "admin" && resolvedType !== "admin") {
        toast.error(
          "Bu kod bir şirket kodu değil. Personel girişini kullanın.",
        );
        return;
      }
      if (mode === "personnel" && resolvedType !== "personnel") {
        toast.error(
          "Bu kod bir personel kodu değil. Şirket girişini kullanın.",
        );
        return;
      }

      login({
        userCode: trimmedCode,
        userType: resolvedType,
        companyName: company.name,
        companyMode: company.mode,
      });
      navigate("dashboard");
    } catch (e) {
      toast.error(
        `Giriş hatası: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = mode === "admin";

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
          data-ocid="login.back.button"
        >
          <ArrowLeft size={16} /> Geri
        </button>

        <div className="text-center mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold font-display text-lg mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
            }}
          >
            FV
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">
            Giriş Yap
          </h1>
          <p className="text-muted-foreground text-sm">Giriş türünüzü seçin</p>
        </div>

        {/* Mode selector tabs */}
        <div
          className="flex rounded-xl bg-slate-100 p-1 mb-6"
          data-ocid="login.tab"
        >
          <button
            type="button"
            onClick={() => handleModeChange("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              isAdmin
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            data-ocid="login.admin.tab"
          >
            <Building2 size={15} />
            Şirket Girişi
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("personnel")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
              !isAdmin
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
            data-ocid="login.personnel.tab"
          >
            <Users size={15} />
            Personel Girişi
          </button>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: isAdmin ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="accessCode" className="mb-2 block">
              {isAdmin ? "Şirket Erişim Kodu" : "Personel Giriş Kodu"}
            </Label>
            <Input
              id="accessCode"
              placeholder={
                isAdmin
                  ? "12 karakterli şirket kodunuz"
                  : "12 karakterli personel giriş kodunuz"
              }
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="font-mono tracking-wider text-center"
              data-ocid="login.code.input"
            />
          </div>

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handleLogin}
            disabled={loading}
            data-ocid="login.submit.button"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Giriş Yapılıyor...
              </>
            ) : isAdmin ? (
              "Şirket Girişi Yap"
            ) : (
              "Personel Girişi Yap"
            )}
          </Button>

          <div className="text-center pt-2 space-y-2">
            {!isAdmin && (
              <p className="text-sm text-muted-foreground">
                Henüz kaydınız yok mu?{" "}
                <button
                  type="button"
                  onClick={() => navigate("personnel-self-register")}
                  className="text-indigo-600 font-semibold hover:underline"
                  data-ocid="login.goto_personnel_register.link"
                >
                  Personel Kaydı
                </button>
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Yeni şirket mi?{" "}
              <button
                type="button"
                onClick={() => navigate("company-register")}
                className="text-indigo-600 font-semibold hover:underline"
                data-ocid="login.goto_register.link"
              >
                Şirket Oluştur
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
