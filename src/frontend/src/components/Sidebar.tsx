import {
  Activity,
  AlertOctagon,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarClock,
  CheckSquare,
  ClipboardCheck,
  ClipboardList,
  Clock,
  DollarSign,
  Factory,
  FileEdit,
  FileSignature,
  FileText,
  Flag,
  FlaskConical,
  FolderKanban,
  Gauge,
  GitMerge,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Leaf,
  Library,
  LogOut,
  MessageSquare,
  Package,
  Phone,
  PieChart,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Truck,
  UserCheck,
  UserCog,
  UserX,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { type Page, useNavigation } from "../contexts/NavigationContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  page: Page;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    page: "dashboard",
  },
  { label: "Personel", icon: <Users size={18} />, page: "personnel" },
  { label: "Makineler", icon: <Wrench size={18} />, page: "machines" },
  { label: "Projeler", icon: <FolderKanban size={18} />, page: "projects" },
  { label: "Görevler", icon: <CheckSquare size={18} />, page: "tasks" },
  { label: "Bakım", icon: <Wrench size={18} />, page: "maintenance" },
  { label: "Arıza Takibi", icon: <Zap size={18} />, page: "faults" },
  {
    label: "İş Emirleri",
    icon: <ClipboardList size={18} />,
    page: "workorders",
  },
  { label: "Sabit Kıymetler", icon: <Building2 size={18} />, page: "assets" },
  { label: "Performans", icon: <Target size={18} />, page: "performance" },
  { label: "Enerji Takibi", icon: <Zap size={18} />, page: "energy" },
  {
    label: "Sözleşmeler",
    icon: <FileSignature size={18} />,
    page: "contracts",
  },
  { label: "Çevre & Atık", icon: <Leaf size={18} />, page: "environment" },
  {
    label: "Denetim & Teftiş",
    icon: <ClipboardCheck size={18} />,
    page: "audits",
  },
  { label: "Risk Yönetimi", icon: <ShieldCheck size={18} />, page: "risk" },
  {
    label: "Tedarik Zinciri",
    icon: <GitMerge size={18} />,
    page: "supplychain",
  },
  { label: "Tedarikçiler", icon: <Truck size={18} />, page: "suppliers" },
  { label: "İSG", icon: <ShieldAlert size={18} />, page: "safety" },
  { label: "Bütçe", icon: <TrendingUp size={18} />, page: "budget" },
  { label: "Dokümanlar", icon: <FileText size={18} />, page: "documents" },
  { label: "Envanter", icon: <Package size={18} />, page: "inventory" },
  { label: "İzin Yönetimi", icon: <CalendarCheck size={18} />, page: "leave" },
  { label: "Vardiya Planlama", icon: <Clock size={18} />, page: "shifts" },
  {
    label: "Eğitim & Sertifika",
    icon: <GraduationCap size={18} />,
    page: "training",
  },
  {
    label: "Kalite Kontrol",
    icon: <ClipboardCheck size={18} />,
    page: "quality",
  },
  {
    label: "Ziyaretçi Takibi",
    icon: <UserCheck size={18} />,
    page: "visitors",
  },
  { label: "İnsan Kaynakları", icon: <UserCog size={18} />, page: "hr" },
  {
    label: "Maliyet Analizi",
    icon: <PieChart size={18} />,
    page: "costanalysis",
  },
  {
    label: "Bakım Takvimi",
    icon: <CalendarClock size={18} />,
    page: "maintenance-calendar",
  },
  {
    label: "Tedarikçi Değerlendirme",
    icon: <Star size={18} />,
    page: "supplier-eval",
  },
  {
    label: "Kapasite Planlama",
    icon: <Gauge size={18} />,
    page: "capacity",
  },
  {
    label: "Kalibrasyon Takibi",
    icon: <Activity size={18} />,
    page: "calibration",
  },
  {
    label: "Üretim Takibi",
    icon: <Factory size={18} />,
    page: "production",
  },
  {
    label: "Kimyasal & Tehlikeli Madde",
    icon: <FlaskConical size={18} />,
    page: "chemicals",
  },
  {
    label: "Kalıp & Aparat Takibi",
    icon: <Layers size={18} />,
    page: "molds",
  },
  {
    label: "Stok Sayımı",
    icon: <ClipboardList size={18} />,
    page: "stockcount",
  },
  {
    label: "Araç & Taşıt Takibi",
    icon: <Truck size={18} />,
    page: "vehicles",
  },
  {
    label: "Şikayet & Geri Bildirim",
    icon: <MessageSquare size={18} />,
    page: "complaints",
  },
  {
    label: "Bakım Maliyeti",
    icon: <DollarSign size={18} />,
    page: "maintenance-cost",
  },
  {
    label: "Eğitim Programı",
    icon: <BookOpen size={18} />,
    page: "training-program",
  },
  {
    label: "Güvenlik Olayı",
    icon: <AlertOctagon size={18} />,
    page: "safety-incident",
  },
  {
    label: "Bütçe Revizyon",
    icon: <FileEdit size={18} />,
    page: "budget-revision",
  },
  {
    label: "Aksiyon Planları",
    icon: <Target size={18} />,
    page: "action-plans",
  },
  {
    label: "Satın Alma Talepleri",
    icon: <ShoppingCart size={18} />,
    page: "purchase-requests",
  },
  {
    label: "Devamsızlık Takibi",
    icon: <UserX size={18} />,
    page: "absence-tracking",
  },
  { label: "Kilometre Taşları", icon: <Flag size={18} />, page: "milestones" },
  {
    label: "İletişim Rehberi",
    icon: <Phone size={18} />,
    page: "contact-directory",
  },
  {
    label: "SOP Kütüphanesi",
    icon: <Library size={18} />,
    page: "sop-library",
  },
  { label: "Bildirimler", icon: <Bell size={18} />, page: "alerts" },
  { label: "Raporlama", icon: <BarChart3 size={18} />, page: "reports" },
  { label: "Ayarlar", icon: <Settings size={18} />, page: "settings" },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const { session, logout } = useAuth();
  const { page, navigate } = useNavigation();

  const handleNavigate = (item: NavItem) => {
    navigate(item.page);
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

  const SidebarContent = () => (
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
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold font-display flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
          }}
        >
          FV
        </div>
        <span className="text-white font-display font-bold text-lg leading-none">
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
            <div className="w-9 h-9 rounded-full bg-primary/80 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = page === item.page;
          return (
            <button
              type="button"
              key={item.label}
              onClick={() => handleNavigate(item)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10",
              ].join(" ")}
              data-ocid={`nav.${item.page}.link`}
            >
              <span className={isActive ? "text-white" : ""}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
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
          <LogOut size={18} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-[250px] flex-shrink-0 flex-col h-screen sticky top-0">
        <SidebarContent />
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
              className="fixed left-0 top-0 h-full w-[260px] z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
