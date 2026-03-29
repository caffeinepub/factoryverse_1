import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  NavigationProvider,
  useNavigation,
} from "./contexts/NavigationContext";
import { AlertsPage } from "./pages/AlertsPage";
import { AssetsPage } from "./pages/AssetsPage";
import { AuditsPage } from "./pages/AuditsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { CalibrationPage } from "./pages/CalibrationPage";
import { CapacityPage } from "./pages/CapacityPage";
import { ChemicalsPage } from "./pages/ChemicalsPage";
import { CompanyRegisterPage } from "./pages/CompanyRegisterPage";
import { ContractsPage } from "./pages/ContractsPage";
import { CostAnalysisPage } from "./pages/CostAnalysisPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { EnergyPage } from "./pages/EnergyPage";
import { EnvironmentPage } from "./pages/EnvironmentPage";
import { FaultsPage } from "./pages/FaultsPage";
import { HRPage } from "./pages/HRPage";
import { InventoryPage } from "./pages/InventoryPage";
import { LandingPage } from "./pages/LandingPage";
import { LeavePage } from "./pages/LeavePage";
import { LoginPage } from "./pages/LoginPage";
import { MachinesPage } from "./pages/MachinesPage";
import { MaintenanceCalendarPage } from "./pages/MaintenanceCalendarPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { MoldsPage } from "./pages/MoldsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { PersonnelSelfRegisterPage } from "./pages/PersonnelSelfRegisterPage";
import { ProductionPage } from "./pages/ProductionPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { QualityPage } from "./pages/QualityPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RiskPage } from "./pages/RiskPage";
import { SafetyPage } from "./pages/SafetyPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { StockCountPage } from "./pages/StockCountPage";
import { SupplierEvalPage } from "./pages/SupplierEvalPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { SupplyChainPage } from "./pages/SupplyChainPage";
import { TasksPage } from "./pages/TasksPage";
import { TrainingPage } from "./pages/TrainingPage";
import { VisitorsPage } from "./pages/VisitorsPage";
import { WorkOrdersPage } from "./pages/WorkOrdersPage";

const protectedPages = [
  "dashboard",
  "machines",
  "personnel",
  "projects",
  "maintenance",
  "suppliers",
  "safety",
  "budget",
  "documents",
  "inventory",
  "alerts",
  "reports",
  "tasks",
  "leave",
  "shifts",
  "training",
  "quality",
  "visitors",
  "faults",
  "workorders",
  "assets",
  "performance",
  "energy",
  "contracts",
  "environment",
  "audits",
  "risk",
  "supplychain",
  "hr",
  "costanalysis",
  "maintenance-calendar",
  "supplier-eval",
  "capacity",
  "calibration",
  "production",
  "chemicals",
  "molds",
  "stockcount",
  "settings",
] as const;

function AppRouter() {
  const { session } = useAuth();
  const { page, navigate } = useNavigation();

  if (
    session &&
    (page === "landing" ||
      page === "login" ||
      page === "company-register" ||
      page === "personnel-self-register")
  ) {
    navigate("dashboard");
    return null;
  }

  if (
    !session &&
    protectedPages.includes(page as (typeof protectedPages)[number])
  ) {
    navigate("landing");
    return null;
  }

  switch (page) {
    case "landing":
      return <LandingPage />;
    case "company-register":
      return <CompanyRegisterPage />;
    case "login":
      return <LoginPage />;
    case "personnel-self-register":
      return <PersonnelSelfRegisterPage />;
    case "dashboard":
      return <DashboardPage />;
    case "machines":
      return <MachinesPage />;
    case "personnel":
      return <PersonnelPage />;
    case "projects":
      return <ProjectsPage />;
    case "maintenance":
      return <MaintenancePage />;
    case "suppliers":
      return <SuppliersPage />;
    case "safety":
      return <SafetyPage />;
    case "budget":
      return <BudgetPage />;
    case "documents":
      return <DocumentsPage />;
    case "inventory":
      return <InventoryPage />;
    case "alerts":
      return <AlertsPage />;
    case "reports":
      return <ReportsPage />;
    case "tasks":
      return <TasksPage />;
    case "leave":
      return <LeavePage />;
    case "shifts":
      return <ShiftsPage />;
    case "training":
      return <TrainingPage />;
    case "quality":
      return <QualityPage />;
    case "visitors":
      return <VisitorsPage />;
    case "faults":
      return <FaultsPage />;
    case "workorders":
      return <WorkOrdersPage />;
    case "assets":
      return <AssetsPage />;
    case "performance":
      return <PerformancePage />;
    case "energy":
      return <EnergyPage />;
    case "contracts":
      return <ContractsPage />;
    case "environment":
      return <EnvironmentPage />;
    case "audits":
      return <AuditsPage />;
    case "risk":
      return <RiskPage />;
    case "supplychain":
      return <SupplyChainPage />;
    case "hr":
      return <HRPage />;
    case "costanalysis":
      return <CostAnalysisPage />;
    case "maintenance-calendar":
      return <MaintenanceCalendarPage />;
    case "supplier-eval":
      return <SupplierEvalPage />;
    case "capacity":
      return <CapacityPage />;
    case "calibration":
      return <CalibrationPage />;
    case "production":
      return <ProductionPage />;
    case "chemicals":
      return <ChemicalsPage />;
    case "molds":
      return <MoldsPage />;
    case "stockcount":
      return <StockCountPage />;
    case "settings":
      return <SettingsPage />;
    default:
      return <LandingPage />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppRouter />
        <Toaster richColors position="top-right" />
      </NavigationProvider>
    </AuthProvider>
  );
}
