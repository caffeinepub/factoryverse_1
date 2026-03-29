import { ArrowRight, Factory, Hammer, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useNavigation } from "../contexts/NavigationContext";

export function LandingPage() {
  const { navigate } = useNavigation();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #1A1340 0%, #2A1B66 40%, #3B2A8F 70%, #4F46E5 100%)",
      }}
    >
      {/* Top nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold font-display"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            FV
          </div>
          <span className="text-white font-display font-bold text-xl">
            FactoryVerse
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate("login")}
          className="text-white/70 hover:text-white text-sm font-medium transition-colors"
          data-ocid="landing.login.link"
        >
          Giriş Yap
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <Factory size={13} />
            Endüstriyel Operasyon Platformu
          </div>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-4">
            Fabrika Operasyonlarınızı
            <br />
            <span style={{ color: "#A5B4FC" }}>Yönetin</span>
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-12">
            Fabrika taşıma ve sıfırdan kurulum projelerinizi tek platformdan
            yönetin. Makine, personel ve süreç takibi.
          </p>
        </motion.div>

        {/* CTA Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <button
            type="button"
            onClick={() => navigate("company-register")}
            className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-6 text-left transition-all duration-200"
            data-ocid="landing.company_register.button"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/60 flex items-center justify-center mb-4">
              <Factory size={20} className="text-white" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-1">
              Şirket Kaydı
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Şirketinizi oluşturun ve operasyonları yönetmeye başlayın
            </p>
            <span className="text-white/70 group-hover:text-white text-sm flex items-center gap-1 font-medium transition-colors">
              Başla{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("login")}
            className="group bg-white rounded-2xl p-6 text-left transition-all duration-200 hover:shadow-xl"
            data-ocid="landing.login.button"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Truck size={20} className="text-primary" />
            </div>
            <h3 className="text-foreground font-display font-bold text-lg mb-1">
              Giriş Yap
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Erişim kodunuzla sisteme giriş yapın
            </p>
            <span className="text-primary text-sm flex items-center gap-1 font-medium">
              Giriş{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("personnel-self-register")}
            className="group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-2xl p-6 text-left transition-all duration-200"
            data-ocid="landing.personnel_register.button"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Hammer size={20} className="text-white" />
            </div>
            <h3 className="text-white font-display font-bold text-lg mb-1">
              Personel Kaydı
            </h3>
            <p className="text-white/50 text-sm mb-4">
              Kendi kaydınızı oluşturun, kodunuzu yöneticinize verin
            </p>
            <span className="text-white/70 group-hover:text-white text-sm flex items-center gap-1 font-medium transition-colors">
              Kayıt Ol{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </button>
        </motion.div>
      </main>
    </div>
  );
}
