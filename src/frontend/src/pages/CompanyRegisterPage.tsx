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
import { useRegisterCompany } from "../hooks/useQueries";

type Mode = "Relocation" | "Greenfield" | "Hybrid";

const modes: {
  value: Mode;
  label: string;
  description: string;
  emoji: string;
}[] = [
  {
    value: "Relocation",
    label: "Taşıma",
    description: "Mevcut fabrikayı yeni lokasyona taşıma",
    emoji: "🏭",
  },
  {
    value: "Greenfield",
    label: "Kurulum",
    description: "Sıfırdan fabrika kurulum projesi",
    emoji: "🔨",
  },
  {
    value: "Hybrid",
    label: "Hibrit",
    description: "Taşıma + kurulum kombinasyonu",
    emoji: "⚡",
  },
];

export function CompanyRegisterPage() {
  const { navigate } = useNavigation();
  const [companyName, setCompanyName] = useState("");
  const [selectedMode, setSelectedMode] = useState<Mode | null>(null);
  const [adminCode, setAdminCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const registerMutation = useRegisterCompany();

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      toast.error("Şirket adı zorunludur");
      return;
    }
    if (!selectedMode) {
      toast.error("Operasyon modu seçiniz");
      return;
    }
    try {
      const company = await registerMutation.mutateAsync({
        name: companyName.trim(),
        mode: selectedMode,
      });
      setAdminCode(company.adminCode);
    } catch (e) {
      toast.error(
        `Kayıt başarısız: ${e instanceof Error ? e.message : "Bilinmeyen hata"}`,
      );
    }
  };

  const copyCode = () => {
    if (adminCode) {
      navigator.clipboard.writeText(adminCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Kod kopyalandı!");
    }
  };

  if (adminCode) {
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
          data-ocid="company_register.success.panel"
        >
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="font-display font-bold text-2xl text-foreground mb-1">
              Şirket Oluşturuldu!
            </h2>
            <p className="text-muted-foreground text-sm">
              {companyName} başarıyla kayıt edildi
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="text-amber-600 mt-0.5 flex-shrink-0"
              />
              <p className="text-amber-800 text-sm font-medium">
                Bu kodu kaydedin! Giriş için tek kimlik bilginizdir. Kaybolması
                durumunda kurtarılamaz.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
              Yönetici Erişim Kodu
            </Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-foreground/5 border border-border rounded-lg px-4 py-3 font-mono text-lg font-bold tracking-widest text-foreground">
                {adminCode}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyCode}
                className="flex-shrink-0"
                data-ocid="company_register.copy.button"
              >
                {copied ? (
                  <CheckCircle2 size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} />
                )}
              </Button>
            </div>
          </div>

          <Button
            className="w-full bg-primary text-white"
            onClick={() => navigate("login")}
            data-ocid="company_register.goto_login.button"
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
        className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
      >
        <button
          type="button"
          onClick={() => navigate("landing")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          data-ocid="company_register.back.button"
        >
          <ArrowLeft size={16} /> Geri
        </button>

        <h1 className="font-display font-bold text-2xl text-foreground mb-1">
          Şirket Oluştur
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Yeni bir FactoryVerse şirketi oluşturun
        </p>

        <div className="space-y-6">
          <div>
            <Label htmlFor="companyName" className="mb-2 block">
              Şirket Adı
            </Label>
            <Input
              id="companyName"
              placeholder="Örn: Tekno Metal A.Ş."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              data-ocid="company_register.name.input"
            />
          </div>

          <div>
            <Label className="mb-3 block">Operasyon Modu</Label>
            <div className="grid grid-cols-1 gap-3">
              {modes.map((m) => (
                <button
                  type="button"
                  key={m.value}
                  onClick={() => setSelectedMode(m.value)}
                  className={[
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                    selectedMode === m.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40",
                  ].join(" ")}
                  data-ocid={`company_register.mode_${m.value.toLowerCase()}.button`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {m.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.description}
                    </p>
                  </div>
                  {selectedMode === m.value && (
                    <CheckCircle2
                      size={18}
                      className="ml-auto text-primary flex-shrink-0"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="w-full bg-primary text-white"
            onClick={handleSubmit}
            disabled={registerMutation.isPending}
            data-ocid="company_register.submit.button"
          >
            {registerMutation.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              "Şirket Oluştur"
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
