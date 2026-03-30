import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import {
  NavigationProvider,
  useNavigation,
} from "./contexts/NavigationContext";
import { AbsenceTrackingPage } from "./pages/AbsenceTrackingPage";
import { ActionPlansPage } from "./pages/ActionPlansPage";
import { AlertsPage } from "./pages/AlertsPage";
import { AssetsPage } from "./pages/AssetsPage";
import { AuditsPage } from "./pages/AuditsPage";
import { BudgetPage } from "./pages/BudgetPage";
import { BudgetRevisionPage } from "./pages/BudgetRevisionPage";
import { CalibrationPage } from "./pages/CalibrationPage";
import { CapacityPage } from "./pages/CapacityPage";
import { ChemicalsPage } from "./pages/ChemicalsPage";
import { CompanyRegisterPage } from "./pages/CompanyRegisterPage";
import { ComplaintsPage } from "./pages/ComplaintsPage";
import { ContactDirectoryPage } from "./pages/ContactDirectoryPage";
import { ContractsPage } from "./pages/ContractsPage";
import { CostAnalysisPage } from "./pages/CostAnalysisPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocRevisionPage } from "./pages/DocRevisionPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { ElecMechProjectPage } from "./pages/ElecMechProjectPage";
import { EmployeePerfReviewPage } from "./pages/EmployeePerfReviewPage";
import { EnergyPage } from "./pages/EnergyPage";
import { EnergyTargetsPage } from "./pages/EnergyTargetsPage";
import { EnvironmentPage } from "./pages/EnvironmentPage";
import { EquipmentLifecyclePage } from "./pages/EquipmentLifecyclePage";
import { EquipmentMaintenanceHistoryPage } from "./pages/EquipmentMaintenanceHistoryPage";
import { EquipmentRentalPage } from "./pages/EquipmentRentalPage";
import { FacilityDamagePage } from "./pages/FacilityDamagePage";
import { FacilityMaintenancePlanPage } from "./pages/FacilityMaintenancePlanPage";
import { FaultsPage } from "./pages/FaultsPage";
import { FieldAuditPage } from "./pages/FieldAuditPage";
import { GeneralExpensePage } from "./pages/GeneralExpensePage";
import { HRPage } from "./pages/HRPage";
import { InspectionManagementPage } from "./pages/InspectionManagementPage";
import { InsurancePage } from "./pages/InsurancePage";
import { InventoryPage } from "./pages/InventoryPage";
import { JobApplicationsPage } from "./pages/JobApplicationsPage";
import { LandingPage } from "./pages/LandingPage";
import { LeaseManagementPage } from "./pages/LeaseManagementPage";
import { LeavePage } from "./pages/LeavePage";
import { LoginPage } from "./pages/LoginPage";
import { MTBFPage } from "./pages/MTBFPage";
import { MachinesPage } from "./pages/MachinesPage";
import { MaintenanceBudgetPage } from "./pages/MaintenanceBudgetPage";
import { MaintenanceCalendarPage } from "./pages/MaintenanceCalendarPage";
import { MaintenanceCostPage } from "./pages/MaintenanceCostPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { MaterialCertPage } from "./pages/MaterialCertPage";
import { MilestonesPage } from "./pages/MilestonesPage";
import { MoldsPage } from "./pages/MoldsPage";
import { PerformancePage } from "./pages/PerformancePage";
import { PersonnelAuthPage } from "./pages/PersonnelAuthPage";
import { PersonnelHandoverPage } from "./pages/PersonnelHandoverPage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { PersonnelSelfRegisterPage } from "./pages/PersonnelSelfRegisterPage";
import { ProductionPage } from "./pages/ProductionPage";
import { ProductionQualityPage } from "./pages/ProductionQualityPage";
import { ProjectChangesPage } from "./pages/ProjectChangesPage";
import { ProjectRisksPage } from "./pages/ProjectRisksPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { PurchaseRequestsPage } from "./pages/PurchaseRequestsPage";
import { QCFormPage } from "./pages/QCFormPage";
import { QualityPage } from "./pages/QualityPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RiskPage } from "./pages/RiskPage";
import { SafetyIncidentPage } from "./pages/SafetyIncidentPage";
import { SafetyPage } from "./pages/SafetyPage";
import { SatisfactionSurveyPage } from "./pages/SatisfactionSurveyPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShiftReportsPage } from "./pages/ShiftReportsPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { SkillsMatrixPage } from "./pages/SkillsMatrixPage";
import { SopLibraryPage } from "./pages/SopLibraryPage";
import { StaffingPlanPage } from "./pages/StaffingPlanPage";
import { StockCountPage } from "./pages/StockCountPage";
import { SubcontractorPage } from "./pages/SubcontractorPage";
import { SupplierEvalPage } from "./pages/SupplierEvalPage";
import { SupplierOrdersPage } from "./pages/SupplierOrdersPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { SupplyChainPage } from "./pages/SupplyChainPage";
import { TasksPage } from "./pages/TasksPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrainingProgramPage } from "./pages/TrainingProgramPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { VisitorsPage } from "./pages/VisitorsPage";
import { WarrantyPage } from "./pages/WarrantyPage";
import { WasteDisposalPage } from "./pages/WasteDisposalPage";
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
  "vehicles",
  "complaints",
  "settings",
  "safety-incident",
  "budget-revision",
  "maintenance-cost",
  "training-program",
  "action-plans",
  "purchase-requests",
  "absence-tracking",
  "milestones",
  "contact-directory",
  "sop-library",
  "staffing-plan",
  "subcontractor",
  "insurance",
  "energy-targets",
  "equipment-rental",
  "job-applications",
  "warranty",
  "project-risks",
  "equipment-maintenance-history",
  "employee-perf-review",
  "supplier-orders",
  "inspection-management",
  "lease-management",
  "skills-matrix",
  "mtbf",
  "shift-reports",
  "maintenance-budget",
  "qc-forms",
  "field-audits",
  "satisfaction-surveys",
  "elec-mech-projects",
  "general-expenses",
  "material-certs",
  "production-quality",
  "waste-disposal",
  "personnel-auth",
  "facility-damage",
  "project-changes",
  "doc-revision",
  "equipment-lifecycle",
  "personnel-handover",
  "facility-maint-plan",
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
    case "vehicles":
      return <VehiclesPage />;
    case "complaints":
      return <ComplaintsPage />;
    case "safety-incident":
      return <SafetyIncidentPage />;
    case "budget-revision":
      return <BudgetRevisionPage />;
    case "maintenance-cost":
      return <MaintenanceCostPage />;
    case "training-program":
      return <TrainingProgramPage />;
    case "action-plans":
      return <ActionPlansPage />;
    case "purchase-requests":
      return <PurchaseRequestsPage />;
    case "absence-tracking":
      return <AbsenceTrackingPage />;
    case "milestones":
      return <MilestonesPage />;
    case "contact-directory":
      return <ContactDirectoryPage />;
    case "sop-library":
      return <SopLibraryPage />;
    case "staffing-plan":
      return <StaffingPlanPage />;
    case "subcontractor":
      return <SubcontractorPage />;
    case "insurance":
      return <InsurancePage />;
    case "energy-targets":
      return <EnergyTargetsPage />;
    case "equipment-rental":
      return <EquipmentRentalPage />;
    case "job-applications":
      return <JobApplicationsPage />;
    case "warranty":
      return <WarrantyPage />;
    case "project-risks":
      return <ProjectRisksPage />;
    case "equipment-maintenance":
      return <EquipmentMaintenanceHistoryPage />;
    case "perf-review":
      return <EmployeePerfReviewPage />;
    case "supplier-orders":
      return <SupplierOrdersPage />;
    case "inspection-management":
      return <InspectionManagementPage />;
    case "settings":
      return <SettingsPage />;
    case "lease-management":
      return <LeaseManagementPage />;
    case "skills-matrix":
      return <SkillsMatrixPage />;
    case "mtbf":
      return <MTBFPage />;
    case "shift-reports":
      return <ShiftReportsPage />;
    case "maintenance-budget":
      return <MaintenanceBudgetPage />;
    case "qc-forms":
      return <QCFormPage />;
    case "field-audits":
      return <FieldAuditPage />;
    case "satisfaction-surveys":
      return <SatisfactionSurveyPage />;
    case "elec-mech-projects":
      return <ElecMechProjectPage />;
    case "general-expenses":
      return <GeneralExpensePage />;
    case "material-certs":
      return <MaterialCertPage />;
    case "production-quality":
      return <ProductionQualityPage />;
    case "waste-disposal":
      return <WasteDisposalPage />;
    case "personnel-auth":
      return <PersonnelAuthPage />;
    case "facility-damage":
      return <FacilityDamagePage />;
    case "project-changes":
      return <ProjectChangesPage />;
    case "doc-revision":
      return <DocRevisionPage />;
    case "equipment-lifecycle":
      return <EquipmentLifecyclePage />;
    case "personnel-handover":
      return <PersonnelHandoverPage />;
    case "facility-maint-plan":
      return <FacilityMaintenancePlanPage />;
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
