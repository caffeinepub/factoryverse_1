import {
  ArrowRight,
  CheckCircle2,
  Factory,
  Hammer,
  KeyRound,
  LayoutDashboard,
  Truck,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { type Page, useNavigation } from "../contexts/NavigationContext";

const steps: {
  number: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action: Page | null;
  actionLabel: string | null;
  highlight: boolean;
}[] = [
  {
    number: "01",
    icon: Factory,
    title: "Şirket Kaydı Oluşturun",
    description:
      'Ana sayfadaki "Şirket Kaydı" butonuna tıklayın. Şirket adı, tipi (taşıma/kurulum/hibrit) ve yetkili bilgilerini girin. Kayıt tamamlanınca size özel 12 karakterlik erişim kodu oluşturulur.',
    action: "company-register",
    actionLabel: "Şirket Kaydı",
    highlight: false,
  },
  {
    number: "02",
    icon: KeyRound,
    title: "Erişim Kodunuzla Giriş Yapın",
    description:
      'Kayıt sonrası size verilen 12 karakterlik şirket kodunu kopyalayın. "Giriş Yap" sayfasında "Şirket Girişi" sekmesine bu kodu girerek sisteme bağlanın.',
    action: "login",
    actionLabel: "Giriş Yap",
    highlight: true,
  },
  {
    number: "03",
    icon: UserPlus,
    title: "Personel Ekleyin",
    description:
      'Dashboard\'dan "İnsan Kaynakları" grubuna gidin ve Personel Yönetimi modülünden çalışanlarınızı ekleyin. Her personele otomatik benzersiz bir kod üretilir -- bu kodu çalışanınıza iletin.',
    action: null,
    actionLabel: null,
    highlight: false,
  },
  {
    number: "04",
    icon: LayoutDashboard,
    title: "Modülleri Kullanmaya Başlayın",
    description:
      "Soldaki menüden 11 kategori altında 40+ modüle erişin: Üretim, Bakım, Tedarik, Güvenlik, Finans ve daha fazlası. Tüm veriler otomatik olarak kaydedilir ve şirketinize özel tutulur.",
    action: null,
    actionLabel: null,
    highlight: false,
  },
];

const faqs = [
  {
    q: "Personel kodu nasıl alınır?",
    a: 'Personel, "Personel Kaydı" sayfasından kendi kaydını oluşturur ve sistem ona özel bir kod üretir. Bu kodu yöneticiye iletir; yönetici kodu sisteme tanımladıktan sonra personel giriş yapabilir.',
  },
  {
    q: "Şirket kodum kaybolursa ne olur?",
    a: "Giriş sayfasındaki kodu tekrar girmeniz gerekir. Kodunuzu güvenli bir yerde (e-posta, not uygulaması) saklayın; şu an kod sıfırlama özelliği mevcut değildir.",
  },
  {
    q: "Birden fazla şirket kaydedebilir miyim?",
    a: "Evet. Her şirket kayıt ayrı bir kod alır. Farklı kodlarla giriş yaparak şirketler arasında geçiş yapabilirsiniz. Veriler birbirinden tamamen izole tutulur.",
  },
  {
    q: "Verilerim nerede saklanıyor?",
    a: "Tüm veriler Internet Computer (ICP) blok zinciri üzerinde çalışan merkezi olmayan bir altyapıda kalıcı olarak depolanır. Sunucu arızası veya veri kaybı riski minimum düzeydedir.",
  },
];

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
      <main className="flex-1 flex flex-col items-center px-6 py-16">
        <div className="w-full max-w-4xl mx-auto text-center">
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mx-auto mb-20"
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

          {/* How to Use */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-20"
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-xs font-medium px-3 py-1 rounded-full border border-white/15 mb-3">
                <CheckCircle2 size={12} />
                Nasıl Kullanılır?
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                4 Adımda Başlayın
              </h2>
              <p className="text-white/50 text-sm mt-2">
                İlk girişten modül yönetimine kadar tüm süreç
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.08 }}
                  className={`rounded-2xl p-6 text-left border ${
                    step.highlight
                      ? "bg-white border-white/80"
                      : "bg-white/8 border-white/15"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        step.highlight ? "bg-primary/10" : "bg-white/15"
                      }`}
                    >
                      <step.icon
                        size={20}
                        className={
                          step.highlight ? "text-primary" : "text-white"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold mb-1 font-mono tracking-widest ${
                          step.highlight ? "text-primary/60" : "text-white/30"
                        }`}
                      >
                        {step.number}
                      </div>
                      <h3
                        className={`font-display font-bold text-base mb-2 ${
                          step.highlight ? "text-gray-900" : "text-white"
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          step.highlight ? "text-gray-500" : "text-white/50"
                        }`}
                      >
                        {step.description}
                      </p>
                      {step.action && step.actionLabel && (
                        <button
                          type="button"
                          onClick={() => step.action && navigate(step.action)}
                          className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-all ${
                            step.highlight
                              ? "text-primary hover:gap-2.5"
                              : "text-white/60 hover:text-white hover:gap-2.5"
                          }`}
                        >
                          {step.actionLabel}
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-xl text-white">
                Sık Sorulan Sorular
              </h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                  className="bg-white/8 border border-white/12 rounded-xl p-5 text-left"
                >
                  <p className="text-white font-medium text-sm mb-2">{faq.q}</p>
                  <p className="text-white/50 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
