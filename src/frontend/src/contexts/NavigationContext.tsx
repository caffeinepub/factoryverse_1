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
