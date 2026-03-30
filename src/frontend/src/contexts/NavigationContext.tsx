import { type ReactNode, createContext, useContext, useState } from "react";

export type Page =
  | "landing"
  | "company-register"
  | "login"
  | "personnel-self-register"
  | "dashboard"
  | "machines"
  | "personnel"
  | "projects"
  | "maintenance"
  | "suppliers"
  | "safety"
  | "budget"
  | "documents"
  | "inventory"
  | "alerts"
  | "reports"
  | "tasks"
  | "leave"
  | "shifts"
  | "training"
  | "quality"
  | "visitors"
  | "faults"
  | "workorders"
  | "assets"
  | "performance"
  | "energy"
  | "contracts"
  | "environment"
  | "audits"
  | "risk"
  | "supplychain"
  | "hr"
  | "costanalysis"
  | "maintenance-calendar"
  | "supplier-eval"
  | "capacity"
  | "calibration"
  | "production"
  | "chemicals"
  | "molds"
  | "stockcount"
  | "vehicles"
  | "complaints"
  | "maintenance-cost"
  | "training-program"
  | "safety-incident"
  | "budget-revision"
  | "action-plans"
  | "purchase-requests"
  | "absence-tracking"
  | "milestones"
  | "contact-directory"
  | "sop-library"
  | "staffing-plan"
  | "subcontractor"
  | "insurance"
  | "energy-targets"
  | "equipment-rental"
  | "job-applications"
  | "warranty"
  | "project-risks"
  | "equipment-maintenance"
  | "perf-review"
  | "supplier-orders"
  | "inspection-management"
  | "lease-management"
  | "skills-matrix"
  | "mtbf"
  | "shift-reports"
  | "maintenance-budget"
  | "qc-forms"
  | "field-audits"
  | "satisfaction-surveys"
  | "elec-mech-projects"
  | "general-expenses"
  | "material-certs"
  | "production-quality"
  | "waste-disposal"
  | "personnel-auth"
  | "facility-damage"
  | "project-changes"
  | "doc-revision"
  | "equipment-lifecycle"
  | "personnel-handover"
  | "facility-maint-plan"
  | "settings";

interface NavContextValue {
  page: Page;
  navigate: (p: Page) => void;
}

const NavContext = createContext<NavContextValue>({
  page: "landing",
  navigate: () => {},
});

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("landing");
  return (
    <NavContext.Provider value={{ page, navigate: setPage }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavContext);
}
