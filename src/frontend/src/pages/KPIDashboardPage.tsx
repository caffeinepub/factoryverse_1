import {
  Activity,
  CheckCircle2,
  ClipboardCheck,
  FolderKanban,
  LayoutDashboard,
  Leaf,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";

const platformStats = [
  {
    id: "modules",
    label: "100+ Aktif Modül",
    sub: "Kapsamlı yönetim araçları",
    icon: <LayoutDashboard className="text-primary" size={28} />,
  },
  {
    id: "tracking",
    label: "Kapsamlı Takip",
    sub: "Her süreç uçtan uca izlenir",
    icon: <Activity className="text-green-600" size={28} />,
  },
  {
    id: "realtime",
    label: "Gerçek Zamanlı Veriler",
    sub: "Anlık bildirim ve uyarılar",
    icon: <Zap className="text-yellow-500" size={28} />,
  },
  {
    id: "integrated",
    label: "Tam Entegre",
    sub: "Tüm modüller birbiriyle bağlı",
    icon: <TrendingUp className="text-indigo-600" size={28} />,
  },
];

const operationalAreas = [
  {
    id: "personnel",
    label: "Personel & İK",
    icon: <Users size={22} className="text-blue-600" />,
    moduleCount: 12,
    desc: "İşe alım, kariyer, vardiya, devamsızlık, rotasyon",
  },
  {
    id: "equipment",
    label: "Ekipman & Makineler",
    icon: <Wrench size={22} className="text-orange-600" />,
    moduleCount: 10,
    desc: "Bakım, arıza analizi, ömür takibi, kalibrasyon",
  },
  {
    id: "maintenance",
    label: "Bakım Yönetimi",
    icon: <ClipboardCheck size={22} className="text-purple-600" />,
    moduleCount: 8,
    desc: "Takvim, maliyet, bütçe, iş emirleri, geçmiş",
  },
  {
    id: "quality",
    label: "Kalite & Üretim",
    icon: <Activity size={22} className="text-green-600" />,
    moduleCount: 9,
    desc: "KKF, üretim takibi, kalite raporları, hedefler",
  },
  {
    id: "safety",
    label: "İSG & Güvenlik",
    icon: <ShieldCheck size={22} className="text-red-600" />,
    moduleCount: 7,
    desc: "Olay takibi, güvenlik turu, iş sağlığı, kaza",
  },
  {
    id: "energy",
    label: "Enerji & Çevre",
    icon: <Leaf size={22} className="text-emerald-600" />,
    moduleCount: 6,
    desc: "Enerji haritası, atık, çevre ölçüm, verimlilik",
  },
  {
    id: "supply",
    label: "Tedarik Zinciri",
    icon: <Truck size={22} className="text-cyan-600" />,
    moduleCount: 8,
    desc: "Tedarikçi, sipariş, sözleşme, şikayet takibi",
  },
  {
    id: "projects",
    label: "Proje Yönetimi",
    icon: <FolderKanban size={22} className="text-violet-600" />,
    moduleCount: 9,
    desc: "Projeler, milestone, risk, kaynak, durum raporu",
  },
];

const moduleCategories = [
  "Personel Yönetimi & İnsan Kaynakları",
  "Makine & Ekipman Takibi",
  "Bakım Planlama & Yönetimi",
  "Kalite Kontrol & Üretim",
  "İş Sağlığı & Güvenliği",
  "Enerji Verimliliği & Çevre",
  "Tedarik Zinciri & Satın Alma",
  "Proje Yönetimi & Takibi",
  "Mali Yönetim & Bütçe",
  "Denetim & Uyum",
  "Tesis Yönetimi",
  "Raporlama & Analitik",
];

export function KPIDashboardPage() {
  return (
    <AppLayout title="KPI Dashboard">
      <div className="p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <LayoutDashboard className="text-primary" size={26} />
            KPI Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform performans özeti ve operasyonel göstergeler
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map((s, i) => (
            <div
              key={s.id}
              className="bg-card rounded-xl border p-5 flex items-start gap-4"
              data-ocid={`kpi-dashboard.card.${i + 1}`}
            >
              <div className="p-2 bg-muted rounded-lg">{s.icon}</div>
              <div>
                <p className="font-bold text-foreground text-base">{s.label}</p>
                <p className="text-muted-foreground text-sm mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Operasyonel Alanlar
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {operationalAreas.map((area, i) => (
              <div
                key={area.id}
                className="bg-card rounded-xl border p-4 space-y-2"
                data-ocid={`kpi-dashboard.panel.${i + 1}`}
              >
                <div className="flex items-center gap-2">
                  {area.icon}
                  <span className="font-semibold text-foreground text-sm">
                    {area.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">
                    {area.moduleCount}
                  </span>
                  <span className="text-muted-foreground text-xs">modül</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {area.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">
            Platform Özeti
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {moduleCategories.map((cat, i) => (
              <div
                key={cat}
                className="flex items-center gap-2 text-sm"
                data-ocid={`kpi-dashboard.item.${i + 1}`}
              >
                <CheckCircle2
                  size={16}
                  className="text-green-500 flex-shrink-0"
                />
                <span className="text-foreground">{cat}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-center text-foreground font-medium">
              FactoryVerse — Fabrika operasyonlarınızı tek platformda yönetin.
            </p>
            <p className="text-center text-muted-foreground text-sm mt-1">
              100+ modül ile tüm süreçlerinizi takip edin, optimize edin ve
              raporlayın.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
