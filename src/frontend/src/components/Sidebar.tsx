import {
  Activity,
  AlertCircle,
  AlertOctagon,
  ArrowRightLeft,
  Award,
  Banknote,
  BarChart2,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  ClipboardEdit,
  ClipboardList,
  Clock,
  Cpu,
  DollarSign,
  Factory,
  FileBarChart,
  FileEdit,
  FileSignature,
  FileText,
  Flag,
  FlaskConical,
  FolderCheck,
  FolderKanban,
  Gauge,
  GitBranch,
  GitMerge,
  GraduationCap,
  HardHat,
  Heart,
  Home,
  Layers,
  LayoutDashboard,
  Leaf,
  Library,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  Phone,
  PieChart,
  Receipt,
  Scale,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  UserX,
  Users,
  Warehouse,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { type Page, useNavigation } from "../contexts/NavigationContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  page: Page;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const S = 15;

const navGroups: NavGroup[] = [
  {
    id: "main",
    label: "Ana Ekran",
    icon: <Home size={S} />,
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={S} />,
        page: "dashboard",
      },
      {
        label: "KPI Dashboard",
        icon: <BarChart2 size={S} />,
        page: "kpi-dashboard",
      },
      { label: "Raporlama", icon: <BarChart3 size={S} />, page: "reports" },
      { label: "Bildirimler", icon: <Bell size={S} />, page: "alerts" },
      { label: "Ayarlar", icon: <Settings size={S} />, page: "settings" },
    ],
  },
  {
    id: "hr",
    label: "İnsan Kaynakları",
    icon: <Users size={S} />,
    items: [
      { label: "Personel", icon: <Users size={S} />, page: "personnel" },
      { label: "İnsan Kaynakları", icon: <UserCog size={S} />, page: "hr" },
      { label: "Norm Kadro", icon: <Users size={S} />, page: "staffing-plan" },
      {
        label: "İzin Yönetimi",
        icon: <CalendarCheck size={S} />,
        page: "leave",
      },
      {
        label: "Devamsızlık Takibi",
        icon: <UserX size={S} />,
        page: "absence-tracking",
      },
      { label: "Vardiya Planlama", icon: <Clock size={S} />, page: "shifts" },
      {
        label: "Vardiya Çizelgesi",
        icon: <CalendarDays size={S} />,
        page: "personnel-shift-schedule",
      },
      {
        label: "Vardiya Raporları",
        icon: <ClipboardList size={S} />,
        page: "shift-reports",
      },
      {
        label: "Personel Rotasyonu",
        icon: <ArrowRightLeft size={S} />,
        page: "personnel-rotation",
      },
      {
        label: "Görev Devri",
        icon: <UserCheck size={S} />,
        page: "personnel-handover",
      },
      {
        label: "Kariyer Planlama",
        icon: <TrendingUp size={S} />,
        page: "career-planning",
      },
      {
        label: "Performans Değerlendirme",
        icon: <Star size={S} />,
        page: "perf-review",
      },
      {
        label: "Yetenek Matrisi",
        icon: <GraduationCap size={S} />,
        page: "skills-matrix",
      },
      {
        label: "Memnuniyet Anketi",
        icon: <Heart size={S} />,
        page: "satisfaction-surveys",
      },
      {
        label: "İş Başvuruları",
        icon: <BriefcaseBusiness size={S} />,
        page: "job-applications",
      },
      {
        label: "Eğitim & Sertifika",
        icon: <GraduationCap size={S} />,
        page: "training",
      },
      {
        label: "Eğitim Programı",
        icon: <BookOpen size={S} />,
        page: "training-program",
      },
      {
        label: "Eğitim Sertifikaları",
        icon: <Award size={S} />,
        page: "training-certs",
      },
      {
        label: "Maaş & Ücret Takibi",
        icon: <Banknote size={S} />,
        page: "salary-tracking",
      },
      {
        label: "İzin Talep Yönetimi",
        icon: <CalendarPlus size={S} />,
        page: "leave-requests",
      },
    ],
  },
  {
    id: "production",
    label: "Üretim & Kalite",
    icon: <Factory size={S} />,
    items: [
      {
        label: "Üretim Takibi",
        icon: <Factory size={S} />,
        page: "production",
      },
      {
        label: "Kalite Kontrol",
        icon: <ClipboardCheck size={S} />,
        page: "quality",
      },
      {
        label: "Kalite Kontrol Formu",
        icon: <ClipboardCheck size={S} />,
        page: "qc-forms",
      },
      {
        label: "Üretim Kalite Raporu",
        icon: <BarChart3 size={S} />,
        page: "production-quality",
      },
      {
        label: "Kalite Hedefleri",
        icon: <Target size={S} />,
        page: "quality-targets",
      },
      {
        label: "Kapasite Planlama",
        icon: <Gauge size={S} />,
        page: "capacity",
      },
      {
        label: "Kalıp & Aparat Takibi",
        icon: <Layers size={S} />,
        page: "molds",
      },
    ],
  },
  {
    id: "maintenance",
    label: "Bakım & Ekipman",
    icon: <Wrench size={S} />,
    items: [
      { label: "Makineler", icon: <Wrench size={S} />, page: "machines" },
      { label: "Bakım", icon: <Wrench size={S} />, page: "maintenance" },
      { label: "Arıza Takibi", icon: <Zap size={S} />, page: "faults" },
      {
        label: "İş Emirleri",
        icon: <ClipboardList size={S} />,
        page: "workorders",
      },
      {
        label: "Bakım Takvimi",
        icon: <CalendarClock size={S} />,
        page: "maintenance-calendar",
      },
      {
        label: "Bakım Maliyeti",
        icon: <DollarSign size={S} />,
        page: "maintenance-cost",
      },
      {
        label: "Bakım Bütçe Planlama",
        icon: <DollarSign size={S} />,
        page: "maintenance-budget",
      },
      {
        label: "Kalibrasyon Takibi",
        icon: <Activity size={S} />,
        page: "calibration",
      },
      {
        label: "Ekipman Bakım Geçmişi",
        icon: <ClipboardList size={S} />,
        page: "equipment-maintenance",
      },
      {
        label: "Ekipman Kiralama",
        icon: <Truck size={S} />,
        page: "equipment-rental",
      },
      {
        label: "Ekipman Ömür Takibi",
        icon: <Cpu size={S} />,
        page: "equipment-lifecycle",
      },
      {
        label: "Ekipman Arıza Analizi",
        icon: <Zap size={S} />,
        page: "equipment-fault-analysis",
      },
      {
        label: "Ekipman Enerji Tüketimi",
        icon: <Zap size={S} />,
        page: "equipment-energy",
      },
      {
        label: "Teçhizat Kullanım Analizi",
        icon: <BarChart2 size={S} />,
        page: "equipment-utilization",
      },
      { label: "MGBF Yönetimi", icon: <Activity size={S} />, page: "mtbf" },
      {
        label: "Yedek Parça Takibi",
        icon: <Package size={S} />,
        page: "spare-parts",
      },
      {
        label: "Yedek Parça Siparişleri",
        icon: <ShoppingCart size={S} />,
        page: "spare-parts-orders",
      },
    ],
  },
  {
    id: "supply",
    label: "Tedarik & Depo",
    icon: <Package size={S} />,
    items: [
      { label: "Tedarikçiler", icon: <Truck size={S} />, page: "suppliers" },
      {
        label: "Tedarikçi Değerlendirme",
        icon: <Star size={S} />,
        page: "supplier-eval",
      },
      {
        label: "Tedarikçi Siparişleri",
        icon: <ShoppingBag size={S} />,
        page: "supplier-orders",
      },
      {
        label: "Tedarikçi Sözleşmeleri",
        icon: <FileSignature size={S} />,
        page: "supplier-contracts",
      },
      {
        label: "Tedarikçi Skorkartı",
        icon: <BarChart3 size={S} />,
        page: "supplier-scorecard",
      },
      {
        label: "Tedarikçi Şikayetleri",
        icon: <AlertCircle size={S} />,
        page: "supplier-complaints",
      },
      {
        label: "Satın Alma Talepleri",
        icon: <ShoppingCart size={S} />,
        page: "purchase-requests",
      },
      {
        label: "Tedarik Zinciri",
        icon: <GitMerge size={S} />,
        page: "supplychain",
      },
      {
        label: "Stok Sayımı",
        icon: <ClipboardList size={S} />,
        page: "stockcount",
      },
      { label: "Envanter", icon: <Package size={S} />, page: "inventory" },
      {
        label: "Kimyasal & Tehlikeli Madde",
        icon: <FlaskConical size={S} />,
        page: "chemicals",
      },
      {
        label: "Depo Yönetimi",
        icon: <Warehouse size={S} />,
        page: "warehouse",
      },
      {
        label: "Hammadde Takibi",
        icon: <Layers size={S} />,
        page: "raw-materials",
      },
    ],
  },
  {
    id: "safety",
    label: "Güvenlik & Çevre",
    icon: <ShieldAlert size={S} />,
    items: [
      { label: "İSG", icon: <ShieldAlert size={S} />, page: "safety" },
      {
        label: "Güvenlik Olayı Takibi",
        icon: <AlertOctagon size={S} />,
        page: "safety-incident",
      },
      {
        label: "İş Sağlığı Takibi",
        icon: <Heart size={S} />,
        page: "occupational-health",
      },
      {
        label: "Güvenlik Turu Takibi",
        icon: <ShieldCheck size={S} />,
        page: "security-tours",
      },
      { label: "Çevre & Atık", icon: <Leaf size={S} />, page: "environment" },
      {
        label: "Çevre Ölçüm Takibi",
        icon: <Leaf size={S} />,
        page: "env-measurements",
      },
      {
        label: "Atık Bertaraf Takibi",
        icon: <Leaf size={S} />,
        page: "waste-disposal",
      },
      {
        label: "Atık Geri Dönüşüm Takibi",
        icon: <Leaf size={S} />,
        page: "waste-recycling",
      },
      {
        label: "Kök Neden Analizi",
        icon: <Search size={S} />,
        page: "root-cause-analysis",
      },
    ],
  },
  {
    id: "finance",
    label: "Finans & Bütçe",
    icon: <TrendingUp size={S} />,
    items: [
      { label: "Bütçe", icon: <TrendingUp size={S} />, page: "budget" },
      {
        label: "Bütçe Revizyon Takibi",
        icon: <FileEdit size={S} />,
        page: "budget-revision",
      },
      {
        label: "Maliyet Analizi",
        icon: <PieChart size={S} />,
        page: "costanalysis",
      },
      {
        label: "Genel Gider Yönetimi",
        icon: <Receipt size={S} />,
        page: "general-expenses",
      },
      {
        label: "Tesis Bakım Maliyeti",
        icon: <DollarSign size={S} />,
        page: "facility-maint-cost",
      },
      {
        label: "Fatura Yönetimi",
        icon: <Receipt size={S} />,
        page: "invoice-management",
      },
    ],
  },
  {
    id: "projects",
    label: "Proje Yönetimi",
    icon: <FolderKanban size={S} />,
    items: [
      { label: "Projeler", icon: <FolderKanban size={S} />, page: "projects" },
      { label: "Görevler", icon: <CheckSquare size={S} />, page: "tasks" },
      {
        label: "Kilometre Taşları",
        icon: <Flag size={S} />,
        page: "milestones",
      },
      {
        label: "Proje Risk Kaydı",
        icon: <ShieldAlert size={S} />,
        page: "project-risks",
      },
      {
        label: "Proje Değişiklik Yönetimi",
        icon: <GitMerge size={S} />,
        page: "project-changes",
      },
      {
        label: "Proje Kaynakları",
        icon: <Layers size={S} />,
        page: "project-resources",
      },
      {
        label: "Proje Durum Raporları",
        icon: <FileBarChart size={S} />,
        page: "project-status-reports",
      },
      {
        label: "Proje Kapanış Raporu",
        icon: <FolderCheck size={S} />,
        page: "project-closure",
      },
      {
        label: "Aksiyon Planları",
        icon: <Target size={S} />,
        page: "action-plans",
      },
      {
        label: "İş Akışı Yönetimi",
        icon: <GitBranch size={S} />,
        page: "workflows",
      },
    ],
  },
  {
    id: "facility",
    label: "Tesis & Altyapı",
    icon: <Building2 size={S} />,
    items: [
      {
        label: "Sabit Kıymetler",
        icon: <Building2 size={S} />,
        page: "assets",
      },
      {
        label: "Araç & Taşıt Takibi",
        icon: <Truck size={S} />,
        page: "vehicles",
      },
      {
        label: "Araç Muayene Takibi",
        icon: <ClipboardCheck size={S} />,
        page: "vehicle-inspection",
      },
      {
        label: "Kira Yönetimi",
        icon: <Building2 size={S} />,
        page: "lease-management",
      },
      {
        label: "Tesis Hasarı",
        icon: <Building2 size={S} />,
        page: "facility-damage",
      },
      {
        label: "Tesis Bakım Planı",
        icon: <Home size={S} />,
        page: "facility-maint-plan",
      },
      {
        label: "Tesis Temizlik Planı",
        icon: <Home size={S} />,
        page: "facility-cleaning",
      },
      {
        label: "Tesis Enerji Haritası",
        icon: <MapPin size={S} />,
        page: "energy-map",
      },
      { label: "Enerji Takibi", icon: <Zap size={S} />, page: "energy" },
      {
        label: "Enerji Verimliliği Hedefleri",
        icon: <Leaf size={S} />,
        page: "energy-targets",
      },
      {
        label: "Elektrik/Mekanik Proje",
        icon: <Zap size={S} />,
        page: "elec-mech-projects",
      },
      {
        label: "Taşeron İş Takibi",
        icon: <HardHat size={S} />,
        page: "subcontractor",
      },
    ],
  },
  {
    id: "documents",
    label: "Doküman & Uyum",
    icon: <FileText size={S} />,
    items: [
      { label: "Dokümanlar", icon: <FileText size={S} />, page: "documents" },
      {
        label: "SOP Kütüphanesi",
        icon: <Library size={S} />,
        page: "sop-library",
      },
      {
        label: "Doküman Revizyon Takibi",
        icon: <ClipboardEdit size={S} />,
        page: "doc-revision",
      },
      {
        label: "Malzeme Sertifika Takibi",
        icon: <Award size={S} />,
        page: "material-certs",
      },
      {
        label: "Hukuki Uyum Takibi",
        icon: <Scale size={S} />,
        page: "legal-compliance",
      },
      {
        label: "Sigorta Poliçeleri",
        icon: <BriefcaseBusiness size={S} />,
        page: "insurance",
      },
      {
        label: "Sözleşmeler",
        icon: <FileSignature size={S} />,
        page: "contracts",
      },
      {
        label: "Garanti Takibi",
        icon: <ShieldCheck size={S} />,
        page: "warranty",
      },
      {
        label: "Personel Yetki Matrisi",
        icon: <ShieldCheck size={S} />,
        page: "personnel-auth",
      },
    ],
  },
  {
    id: "audit",
    label: "Denetim & İletişim",
    icon: <ClipboardCheck size={S} />,
    items: [
      { label: "Risk Yönetimi", icon: <ShieldCheck size={S} />, page: "risk" },
      {
        label: "Denetim & Teftiş",
        icon: <ClipboardCheck size={S} />,
        page: "audits",
      },
      {
        label: "Saha Denetimi",
        icon: <Search size={S} />,
        page: "field-audits",
      },
      {
        label: "Muayene & Gözetim",
        icon: <Search size={S} />,
        page: "inspection-management",
      },
      {
        label: "Şikayet & Geri Bildirim",
        icon: <MessageSquare size={S} />,
        page: "complaints",
      },
      { label: "Performans", icon: <Target size={S} />, page: "performance" },
      {
        label: "İletişim Rehberi",
        icon: <Phone size={S} />,
        page: "contact-directory",
      },
      {
        label: "Ziyaretçi Takibi",
        icon: <UserCheck size={S} />,
        page: "visitors",
      },
      {
        label: "Müşteri Siparişleri",
        icon: <ShoppingBag size={S} />,
        page: "customer-orders",
      },
    ],
  },
];

function findGroupForPage(p: string): string | null {
  for (const g of navGroups) {
    if (g.items.some((item) => item.page === p)) return g.id;
  }
  return null;
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { session, logout } = useAuth();
  const { page, navigate } = useNavigation();

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const groupId = findGroupForPage(page);
    return groupId ? new Set([groupId]) : new Set(["main"]);
  });

  useEffect(() => {
    const groupId = findGroupForPage(page);
    if (groupId) {
      setOpenGroups((prev) => {
        if (prev.has(groupId)) return prev;
        return new Set([...prev, groupId]);
      });
    }
  }, [page]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNavigate = (p: Page) => {
    navigate(p);
    onMobileClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate("landing");
    onMobileClose?.();
  };

  const initials = session?.companyName
    ? session.companyName.slice(0, 2).toUpperCase()
    : "FV";

  const sidebarContent = (
    <div
      className="flex flex-col h-full"
      style={{
        background:
          "linear-gradient(180deg, #1A1340 0%, #2A1B66 50%, #3B2A8F 100%)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
          }}
        >
          FV
        </div>
        <span className="text-white font-bold text-lg leading-none">
          FactoryVerse
        </span>
        {isMobileOpen !== undefined && (
          <button
            type="button"
            onClick={onMobileClose}
            className="ml-auto text-white/60 hover:text-white"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      {session && (
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {session.companyName}
              </p>
              <p className="text-white/50 text-xs capitalize">
                {session.userType === "admin" ? "Yönetici" : "Personel"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nav Groups */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {navGroups.map((group) => {
          const isOpen = openGroups.has(group.id);
          const hasActive = group.items.some((item) => item.page === page);

          return (
            <div key={group.id}>
              {/* Group header button */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={[
                  "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-150",
                  hasActive
                    ? "text-white/90"
                    : isOpen
                      ? "text-white/70"
                      : "text-white/40 hover:text-white/70",
                ].join(" ")}
              >
                <span className="flex-shrink-0">{group.icon}</span>
                <span className="flex-1 text-left">{group.label}</span>
                {isOpen ? (
                  <ChevronDown size={13} className="flex-shrink-0" />
                ) : (
                  <ChevronRight size={13} className="flex-shrink-0" />
                )}
              </button>

              {/* Group items */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`${group.id}-items`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="pl-3 pb-1 space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = page === item.page;
                        return (
                          <button
                            type="button"
                            key={item.page}
                            onClick={() => handleNavigate(item.page)}
                            className={[
                              "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-150 text-left",
                              isActive
                                ? "bg-white/15 text-white font-medium"
                                : "text-white/55 hover:text-white hover:bg-white/10",
                            ].join(" ")}
                            data-ocid={`nav.${item.page}.link`}
                          >
                            <span
                              className={`flex-shrink-0 ${
                                isActive ? "text-white" : "text-white/40"
                              }`}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-150"
          data-ocid="nav.logout.button"
        >
          <LogOut size={16} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-shrink-0 flex-col h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-[260px] z-50 lg:hidden overflow-y-auto"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
