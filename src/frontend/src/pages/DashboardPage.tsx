import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  Bell,
  Factory,
  FolderKanban,
  LayoutDashboard,
  Plus,
  ShieldAlert,
  TrendingUp,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../contexts/NavigationContext";
import { useGetDashboardStats, useGetMachines } from "../hooks/useQueries";

const modeLabel: Record<string, string> = {
  Relocation: "Taşıma",
  Greenfield: "Kurulum",
  Hybrid: "Hibrit",
};

const statusLabel: Record<string, string> = {
  Active: "Aktif",
  Maintenance: "Bakımda",
  Broken: "Arızalı",
};

const statusClass: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Maintenance: "bg-amber-100 text-amber-800",
  Broken: "bg-red-100 text-red-800",
};

const KPI_SKELETON_KEYS = [
  "k1",
  "k2",
  "k3",
  "k4",
  "k5",
  "k6",
  "k7",
  "k8",
  "k9",
];
const MACHINE_SKELETON_KEYS = ["m1", "m2", "m3"];

export function DashboardPage() {
  const { session } = useAuth();
  const { navigate } = useNavigation();
  const userCode = session?.userCode ?? null;
  const statsQuery = useGetDashboardStats(userCode);
  const machinesQuery = useGetMachines(userCode);

  const stats = statsQuery.data ?? {};
  const machines = machinesQuery.data ?? [];
  const recentMachines = machines.slice(0, 5);

  const kpiCards = [
    {
      label: "Aktif Uyarılar",
      value: stats.activeAlerts ?? 0,
      icon: <Bell size={20} className="text-rose-600" />,
      bg: "bg-rose-100",
    },
    {
      label: "Toplam Makine",
      value: stats.totalMachines ?? machines.length,
      icon: <Wrench size={20} className="text-primary" />,
      bg: "bg-primary/10",
    },
    {
      label: "Aktif Makineler",
      value:
        stats.activeMachines ??
        machines.filter((m) => m.status === "Active").length,
      icon: <Activity size={20} className="text-green-600" />,
      bg: "bg-green-100",
    },
    {
      label: "Bakımda",
      value:
        stats.maintenanceMachines ??
        machines.filter((m) => m.status === "Maintenance").length,
      icon: <AlertTriangle size={20} className="text-amber-600" />,
      bg: "bg-amber-100",
    },
    {
      label: "Personel",
      value: stats.totalPersonnel ?? 0,
      icon: <Users size={20} className="text-indigo-600" />,
      bg: "bg-indigo-100",
    },
    {
      label: "Aktif Projeler",
      value: stats.activeProjects ?? 0,
      icon: <FolderKanban size={20} className="text-violet-600" />,
      bg: "bg-violet-100",
    },
    {
      label: "Bekleyen Bakım",
      value: stats.pendingMaintenance ?? 0,
      icon: <Wrench size={20} className="text-orange-600" />,
      bg: "bg-orange-100",
    },
    {
      label: "Tedarikçiler",
      value: stats.totalSuppliers ?? 0,
      icon: <Truck size={20} className="text-teal-600" />,
      bg: "bg-teal-100",
    },
    {
      label: "Açık İSG Olayları",
      value: stats.openIncidents ?? 0,
      icon: <ShieldAlert size={20} className="text-red-600" />,
      bg: "bg-red-100",
    },
    {
      label: "Bütçe Kalemleri",
      value: stats.totalBudgetItems ?? 0,
      icon: <TrendingUp size={20} className="text-emerald-600" />,
      bg: "bg-emerald-100",
    },
    {
      label: "Toplam Modül",
      value: 134,
      icon: <LayoutDashboard size={20} className="text-cyan-600" />,
      bg: "bg-cyan-100",
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Hoş geldiniz,{" "}
            <span className="text-primary">{session?.companyName}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {session?.companyMode
              ? `Mod: ${modeLabel[session.companyMode] ?? session.companyMode}`
              : ""}
          </p>
        </div>

        {/* KPI Cards */}
        {statsQuery.isLoading || machinesQuery.isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {KPI_SKELETON_KEYS.map((k) => (
              <Skeleton key={k} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {kpiCards.map((card) => (
              <div
                key={card.label}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}
                >
                  {card.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold font-display text-foreground leading-tight">
                    {String(card.value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Machines */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold font-display text-foreground">
              Son Eklenen Makineler
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("machines")}
              data-ocid="dashboard.machines.link"
            >
              Tümünü Gör
            </Button>
          </div>
          {machinesQuery.isLoading ? (
            <div className="space-y-2">
              {MACHINE_SKELETON_KEYS.map((k) => (
                <Skeleton key={k} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : recentMachines.length === 0 ? (
            <div
              className="bg-card rounded-xl border border-dashed border-border p-8 text-center"
              data-ocid="dashboard.machines.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                Henüz makine eklenmemiş
              </p>
              {session?.userType === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("machines")}
                  data-ocid="dashboard.machines.primary_button"
                >
                  <Plus size={14} className="mr-1" />
                  Makine Ekle
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {recentMachines.map((m, idx) => (
                  <div
                    key={m.name + m.createdAt}
                    className="flex items-center justify-between px-4 py-3"
                    data-ocid={`dashboard.machines.item.${idx + 1}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {m.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {m.machineType} · {m.location}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusClass[m.status] ?? "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabel[m.status] ?? m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {session?.userType === "admin" && (
          <div>
            <h2 className="text-base font-semibold font-display text-foreground mb-3">
              Hızlı Erişim
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Personel",
                  page: "personnel" as const,
                  icon: <Users size={16} />,
                },
                {
                  label: "Projeler",
                  page: "projects" as const,
                  icon: <FolderKanban size={16} />,
                },
                {
                  label: "Bakım",
                  page: "maintenance" as const,
                  icon: <Wrench size={16} />,
                },
                {
                  label: "İSG",
                  page: "safety" as const,
                  icon: <ShieldAlert size={16} />,
                },
                {
                  label: "Üretim",
                  page: "production" as const,
                  icon: <Factory size={16} />,
                },
                {
                  label: "Kalite",
                  page: "quality" as const,
                  icon: <Activity size={16} />,
                },
                {
                  label: "KPI Dashboard",
                  page: "kpi-dashboard" as const,
                  icon: <LayoutDashboard size={16} />,
                },
                {
                  label: "Raporlama",
                  page: "reports" as const,
                  icon: <TrendingUp size={16} />,
                },
                {
                  label: "Tedarikçiler",
                  page: "suppliers" as const,
                  icon: <Truck size={16} />,
                },
                {
                  label: "Bütçe",
                  page: "budget" as const,
                  icon: <TrendingUp size={16} />,
                },
              ].map((item) => (
                <Button
                  key={item.page}
                  variant="outline"
                  className="h-12 gap-2"
                  onClick={() => navigate(item.page)}
                  data-ocid={`dashboard.${item.page}.link`}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
