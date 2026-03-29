import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Box,
  FolderKanban,
  ShieldAlert,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { AppLayout } from "../components/AppLayout";
import { useAuth } from "../contexts/AuthContext";
import {
  useGetBudgetItems,
  useGetDashboardStats,
  useGetInventoryItems,
  useGetMachines,
  useGetMaintenanceRecords,
  useGetProjects,
  useGetSafetyIncidents,
} from "../hooks/useQueries";

function StatChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-primary">{icon}</div>
        <h2 className="font-display font-semibold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

export function ReportsPage() {
  const { session } = useAuth();
  const userCode = session?.userCode ?? null;

  const statsQuery = useGetDashboardStats(userCode);
  const machinesQuery = useGetMachines(userCode);
  const projectsQuery = useGetProjects(userCode);
  const safetyQuery = useGetSafetyIncidents(userCode);
  const maintenanceQuery = useGetMaintenanceRecords(userCode);
  const budgetQuery = useGetBudgetItems(userCode);
  const inventoryQuery = useGetInventoryItems(userCode);

  const stats = statsQuery.data ?? {};
  const machines = machinesQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const incidents = safetyQuery.data ?? [];
  const maintenance = maintenanceQuery.data ?? [];
  const budgetItems = budgetQuery.data ?? [];
  const inventory = inventoryQuery.data ?? [];

  const isLoading =
    statsQuery.isLoading ||
    machinesQuery.isLoading ||
    projectsQuery.isLoading ||
    safetyQuery.isLoading ||
    maintenanceQuery.isLoading ||
    budgetQuery.isLoading ||
    inventoryQuery.isLoading;

  // Derived stats
  const machineStats = {
    active: machines.filter((m) => m.status === "Active").length,
    maintenance: machines.filter((m) => m.status === "Maintenance").length,
    broken: machines.filter((m) => m.status === "Broken").length,
  };

  const projectStats = {
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    on_hold: projects.filter((p) => p.status === "on_hold").length,
  };

  const safetyStats = {
    low: incidents.filter((i) => i.severity === "low").length,
    medium: incidents.filter((i) => i.severity === "medium").length,
    high: incidents.filter((i) => i.severity === "high").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
  };

  const maintenanceStats = {
    preventive: maintenance.filter((m) => m.maintenanceType === "preventive")
      .length,
    corrective: maintenance.filter((m) => m.maintenanceType === "corrective")
      .length,
  };

  const totalPlanned = budgetItems.reduce(
    (sum, b) => sum + (b.plannedAmount ?? 0),
    0,
  );
  const totalActual = budgetItems.reduce(
    (sum, b) => sum + (b.actualAmount ?? 0),
    0,
  );
  const budgetDiff = totalPlanned - totalActual;

  const lowStockCount = inventory.filter(
    (i) => i.currentStock <= i.minimumStock,
  ).length;

  const fmt = (n: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(n);

  const kpiCards = [
    {
      label: "Toplam Makine",
      value: stats.totalMachines ?? machines.length,
      icon: <Wrench size={18} className="text-primary" />,
      bg: "bg-primary/10",
    },
    {
      label: "Aktif Projeler",
      value: stats.activeProjects ?? projectStats.active,
      icon: <FolderKanban size={18} className="text-violet-600" />,
      bg: "bg-violet-100",
    },
    {
      label: "Açık ISG Olayları",
      value:
        stats.openIncidents ??
        incidents.filter((i) => i.status === "open").length,
      icon: <ShieldAlert size={18} className="text-red-600" />,
      bg: "bg-red-100",
    },
    {
      label: "Bekleyen Bakım",
      value:
        stats.pendingMaintenance ??
        maintenance.filter((m) => m.status === "pending").length,
      icon: <Wrench size={18} className="text-orange-600" />,
      bg: "bg-orange-100",
    },
    {
      label: "Düşük Stok",
      value: lowStockCount,
      icon: <Box size={18} className="text-amber-600" />,
      bg: "bg-amber-100",
    },
    {
      label: "Bütçe Kalemleri",
      value: budgetItems.length,
      icon: <TrendingUp size={18} className="text-green-600" />,
      bg: "bg-green-100",
    },
  ];

  return (
    <AppLayout title="Raporlama">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Raporlama
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tüm modüllerin özet istatistikleri
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4" data-ocid="reports.loading_state">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((k) => (
                <Skeleton key={k} className="h-20 rounded-xl" />
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((k) => (
                <Skeleton key={k} className="h-40 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* KPI Bar */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {kpiCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      card.bg
                    }`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display text-foreground">
                      {card.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail Sections */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Machines */}
              <SectionCard
                title="Makineler Durum Dağılımı"
                icon={<Wrench size={18} />}
              >
                <StatChip
                  label="Aktif"
                  value={machineStats.active}
                  color="bg-green-500"
                />
                <StatChip
                  label="Bakımda"
                  value={machineStats.maintenance}
                  color="bg-amber-500"
                />
                <StatChip
                  label="Arızalı"
                  value={machineStats.broken}
                  color="bg-red-500"
                />
              </SectionCard>

              {/* Projects */}
              <SectionCard
                title="Projeler Durum Dağılımı"
                icon={<FolderKanban size={18} />}
              >
                <StatChip
                  label="Aktif"
                  value={projectStats.active}
                  color="bg-violet-500"
                />
                <StatChip
                  label="Tamamlandı"
                  value={projectStats.completed}
                  color="bg-green-500"
                />
                <StatChip
                  label="Beklemede"
                  value={projectStats.on_hold}
                  color="bg-gray-400"
                />
              </SectionCard>

              {/* Safety */}
              <SectionCard
                title="İSG Olayları - Şiddet"
                icon={<ShieldAlert size={18} />}
              >
                <StatChip
                  label="Düşük"
                  value={safetyStats.low}
                  color="bg-green-500"
                />
                <StatChip
                  label="Orta"
                  value={safetyStats.medium}
                  color="bg-amber-500"
                />
                <StatChip
                  label="Yüksek"
                  value={safetyStats.high}
                  color="bg-orange-500"
                />
                <StatChip
                  label="Kritik"
                  value={safetyStats.critical}
                  color="bg-red-600"
                />
              </SectionCard>

              {/* Maintenance */}
              <SectionCard
                title="Bakım Kayıtları - Tür"
                icon={<Wrench size={18} />}
              >
                <StatChip
                  label="Önleyici"
                  value={maintenanceStats.preventive}
                  color="bg-blue-500"
                />
                <StatChip
                  label="Düzeltici"
                  value={maintenanceStats.corrective}
                  color="bg-orange-500"
                />
              </SectionCard>
            </div>

            {/* Budget Summary */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-primary" />
                <h2 className="font-display font-semibold text-foreground">
                  Bütçe Özeti
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Planlanan</p>
                  <p className="text-2xl font-bold font-display text-foreground">
                    {fmt(totalPlanned)}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-indigo-200">
                    <div className="h-1.5 rounded-full bg-indigo-500 w-full" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Gerçekleşen</p>
                  <p className="text-2xl font-bold font-display text-foreground">
                    {fmt(totalActual)}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-green-200">
                    <div
                      className="h-1.5 rounded-full bg-green-500"
                      style={{
                        width: totalPlanned
                          ? `${Math.min(100, (totalActual / totalPlanned) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Fark</p>
                  <p
                    className={`text-2xl font-bold font-display ${
                      budgetDiff >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {budgetDiff >= 0 ? "+" : ""}
                    {fmt(budgetDiff)}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-muted">
                    <div
                      className={`h-1.5 rounded-full ${
                        budgetDiff >= 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </AppLayout>
  );
}
