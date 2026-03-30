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
import { CareerPlanningPage } from "./pages/CareerPlanningPage";
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
import { EnergyMapPage } from "./pages/EnergyMapPage";
import { EnergyPage } from "./pages/EnergyPage";
import { EnergyTargetsPage } from "./pages/EnergyTargetsPage";
import { EnvMeasurementsPage } from "./pages/EnvMeasurementsPage";
import { EnvironmentPage } from "./pages/EnvironmentPage";
import { EquipmentEnergyPage } from "./pages/EquipmentEnergyPage";
import { EquipmentFaultAnalysisPage } from "./pages/EquipmentFaultAnalysisPage";
import { EquipmentLifecyclePage } from "./pages/EquipmentLifecyclePage";
import { EquipmentMaintenanceHistoryPage } from "./pages/EquipmentMaintenanceHistoryPage";
import { EquipmentRentalPage } from "./pages/EquipmentRentalPage";
import { EquipmentUtilizationPage } from "./pages/EquipmentUtilizationPage";
import { FacilityCleaningPage } from "./pages/FacilityCleaningPage";
import { FacilityDamagePage } from "./pages/FacilityDamagePage";
import { FacilityMaintenanceCostPage } from "./pages/FacilityMaintenanceCostPage";
import { FacilityMaintenancePlanPage } from "./pages/FacilityMaintenancePlanPage";
import { FaultsPage } from "./pages/FaultsPage";
import { FieldAuditPage } from "./pages/FieldAuditPage";
import { GeneralExpensePage } from "./pages/GeneralExpensePage";
import { HRPage } from "./pages/HRPage";
import { InspectionManagementPage } from "./pages/InspectionManagementPage";
import { InsurancePage } from "./pages/InsurancePage";
import { InventoryPage } from "./pages/InventoryPage";
import { JobApplicationsPage } from "./pages/JobApplicationsPage";
import { KPIDashboardPage } from "./pages/KPIDashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { LeaseManagementPage } from "./pages/LeaseManagementPage";
import { LeavePage } from "./pages/LeavePage";
import { LegalCompliancePage } from "./pages/LegalCompliancePage";
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
import { OccupationalHealthPage } from "./pages/OccupationalHealthPage";
import { PerformancePage } from "./pages/PerformancePage";
import { PersonnelAuthPage } from "./pages/PersonnelAuthPage";
import { PersonnelHandoverPage } from "./pages/PersonnelHandoverPage";
import { PersonnelPage } from "./pages/PersonnelPage";
import { PersonnelRotationPage } from "./pages/PersonnelRotationPage";
import { PersonnelSelfRegisterPage } from "./pages/PersonnelSelfRegisterPage";
import { PersonnelShiftSchedulePage } from "./pages/PersonnelShiftSchedulePage";
import { ProductionPage } from "./pages/ProductionPage";
import { ProductionQualityPage } from "./pages/ProductionQualityPage";
import { ProjectChangesPage } from "./pages/ProjectChangesPage";
import { ProjectClosureReportPage } from "./pages/ProjectClosureReportPage";
import { ProjectResourcesPage } from "./pages/ProjectResourcesPage";
import { ProjectRisksPage } from "./pages/ProjectRisksPage";
import { ProjectStatusReportsPage } from "./pages/ProjectStatusReportsPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { PurchaseRequestsPage } from "./pages/PurchaseRequestsPage";
import { QCFormPage } from "./pages/QCFormPage";
import { QualityPage } from "./pages/QualityPage";
import { QualityTargetsPage } from "./pages/QualityTargetsPage";
import { RawMaterialsPage } from "./pages/RawMaterialsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { RiskPage } from "./pages/RiskPage";
import { RootCauseAnalysisPage } from "./pages/RootCauseAnalysisPage";
import { SafetyIncidentPage } from "./pages/SafetyIncidentPage";
import { SafetyPage } from "./pages/SafetyPage";
import { SatisfactionSurveyPage } from "./pages/SatisfactionSurveyPage";
import { SecurityToursPage } from "./pages/SecurityToursPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ShiftReportsPage } from "./pages/ShiftReportsPage";
import { ShiftsPage } from "./pages/ShiftsPage";
import { SkillsMatrixPage } from "./pages/SkillsMatrixPage";
import { SopLibraryPage } from "./pages/SopLibraryPage";
import { SparePartsOrdersPage } from "./pages/SparePartsOrdersPage";
import { SparePartsPage } from "./pages/SparePartsPage";
import { StaffingPlanPage } from "./pages/StaffingPlanPage";
import { StockCountPage } from "./pages/StockCountPage";
import { SubcontractorPage } from "./pages/SubcontractorPage";
import { SupplierComplaintsPage } from "./pages/SupplierComplaintsPage";
import { SupplierContractsPage } from "./pages/SupplierContractsPage";
import { SupplierEvalPage } from "./pages/SupplierEvalPage";
import { SupplierOrdersPage } from "./pages/SupplierOrdersPage";
import { SupplierScorecardPage } from "./pages/SupplierScorecardPage";
import { SuppliersPage } from "./pages/SuppliersPage";
import { SupplyChainPage } from "./pages/SupplyChainPage";
import { TasksPage } from "./pages/TasksPage";
import { TrainingCertsPage } from "./pages/TrainingCertsPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrainingProgramPage } from "./pages/TrainingProgramPage";
import { VehicleInspectionPage } from "./pages/VehicleInspectionPage";
import { VehiclesPage } from "./pages/VehiclesPage";
import { VisitorsPage } from "./pages/VisitorsPage";
import { WarehousePage } from "./pages/WarehousePage";
import { WarrantyPage } from "./pages/WarrantyPage";
import { WasteDisposalPage } from "./pages/WasteDisposalPage";
import { WasteRecyclingPage } from "./pages/WasteRecyclingPage";
import { WorkOrdersPage } from "./pages/WorkOrdersPage";
import { WorkflowsPage } from "./pages/WorkflowsPage";

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
  "equipment-maintenance",
  "perf-review",
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
  "vehicle-inspection",
  "legal-compliance",
  "project-resources",
  "env-measurements",
  "equipment-fault-analysis",
  "supplier-contracts",
  "career-planning",
  "energy-map",
  "supplier-scorecard",
  "occupational-health",
  "waste-recycling",
  "facility-cleaning",
  "spare-parts",
  "personnel-shift-schedule",
  "security-tours",
  "quality-targets",
  "spare-parts-orders",
  "facility-maint-cost",
  "personnel-rotation",
  "project-status-reports",
  "equipment-energy",
  "root-cause-analysis",
  "supplier-complaints",
  "project-closure",
  "equipment-utilization",
  "training-certs",
  "workflows",
  "kpi-dashboard",
  "warehouse",
  "raw-materials",
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
    case "vehicle-inspection":
      return <VehicleInspectionPage />;
    case "legal-compliance":
      return <LegalCompliancePage />;
    case "project-resources":
      return <ProjectResourcesPage />;
    case "env-measurements":
      return <EnvMeasurementsPage />;
    case "equipment-fault-analysis":
      return <EquipmentFaultAnalysisPage />;
    case "supplier-contracts":
      return <SupplierContractsPage />;
    case "career-planning":
      return <CareerPlanningPage />;
    case "energy-map":
      return <EnergyMapPage />;
    case "supplier-scorecard":
      return <SupplierScorecardPage />;
    case "occupational-health":
      return <OccupationalHealthPage />;
    case "waste-recycling":
      return <WasteRecyclingPage />;
    case "facility-cleaning":
      return <FacilityCleaningPage />;
    case "spare-parts":
      return <SparePartsPage />;
    case "personnel-shift-schedule":
      return <PersonnelShiftSchedulePage />;
    case "security-tours":
      return <SecurityToursPage />;
    case "quality-targets":
      return <QualityTargetsPage />;
    case "spare-parts-orders":
      return <SparePartsOrdersPage />;
    case "facility-maint-cost":
      return <FacilityMaintenanceCostPage />;
    case "personnel-rotation":
      return <PersonnelRotationPage />;
    case "project-status-reports":
      return <ProjectStatusReportsPage />;
    case "equipment-energy":
      return <EquipmentEnergyPage />;
    case "root-cause-analysis":
      return <RootCauseAnalysisPage />;
    case "supplier-complaints":
      return <SupplierComplaintsPage />;
    case "project-closure":
      return <ProjectClosureReportPage />;
    case "equipment-utilization":
      return <EquipmentUtilizationPage />;
    case "training-certs":
      return <TrainingCertsPage />;
    case "workflows":
      return <WorkflowsPage />;
    case "kpi-dashboard":
      return <KPIDashboardPage />;
    case "warehouse":
      return <WarehousePage />;
    case "raw-materials":
      return <RawMaterialsPage />;
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
