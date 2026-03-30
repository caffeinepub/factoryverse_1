import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Company, Machine, Personnel } from "../backend";
import type {
  AbsenceRecord,
  ActionPlan,
  BudgetItem,
  BudgetRevisionRecord,
  CalibrationRecord,
  CapacityRecord,
  ChemicalRecord,
  ComplaintRecord,
  ContactEntry,
  EmployeePerfReview,
  EnergyEfficiencyTarget,
  EquipmentMaintenanceHistory,
  EquipmentRental,
  InspectionRecord,
  InsurancePolicy,
  JobApplication,
  MaintenanceCostRecord,
  MaintenanceRecord,
  Milestone,
  MoldRecord,
  ProductionRecord,
  Project,
  ProjectRiskItem,
  PurchaseRequest,
  SafetyIncident,
  SafetyIncidentRecord,
  SopEntry,
  StaffingPlan,
  StockCountRecord,
  SubcontractorJob,
  Supplier,
  SupplierOrder,
  TrainingProgramRecord,
  VehicleRecord,
  WarrantyRecord,
} from "../types";
import { useActor } from "./useActor";

export function useGetCompanyInfo(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Company | null>({
    queryKey: ["companyInfo", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return null;
      return actor.getCompanyInfo(userCode);
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useGetMachines(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Machine[]>({
    queryKey: ["machines", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return actor.getMachines(userCode);
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useGetPersonnel(adminCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Personnel[]>({
    queryKey: ["personnel", adminCode],
    queryFn: async () => {
      if (!actor || !adminCode) return [];
      return actor.getCompanyPersonnel(adminCode);
    },
    enabled: !!actor && !isFetching && !!adminCode,
  });
}

export interface DashboardStats {
  totalMachines?: number;
  activeMachines?: number;
  maintenanceMachines?: number;
  brokenMachines?: number;
  totalPersonnel?: number;
  totalProjects?: number;
  activeProjects?: number;
  completedProjects?: number;
  totalMaintenance?: number;
  pendingMaintenance?: number;
  totalSuppliers?: number;
  openIncidents?: number;
  totalBudgetItems?: number;
  activeAlerts?: number;
  [key: string]: unknown;
}

export function useGetDashboardStats(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<DashboardStats>({
    queryKey: ["dashboardStats", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return {};
      const raw = await actor.getDashboardStats(userCode);
      try {
        return JSON.parse(raw) as DashboardStats;
      } catch {
        return {};
      }
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddMachine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      name: string;
      machineType: string;
      serialNumber: string;
      location: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addMachine(
        params.adminCode,
        params.name,
        params.machineType,
        params.serialNumber,
        params.location,
        params.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["machines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateMachine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      machineId: string;
      name: string;
      machineType: string;
      serialNumber: string;
      location: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateMachine(
        params.adminCode,
        params.machineId,
        params.name,
        params.machineType,
        params.serialNumber,
        params.location,
        params.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["machines"] }),
  });
}

export function useUpdateMachineStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userCode: string;
      machineId: string;
      status: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateMachineStatus(
        params.userCode,
        params.machineId,
        params.status,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["machines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteMachine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; machineId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteMachine(params.adminCode, params.machineId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["machines"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useAddPersonnel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      inviteCode: string;
      role: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.addPersonnelToCompany(
        params.adminCode,
        params.inviteCode,
        params.role,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["personnel"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdatePersonnelRole() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      personnelId: string;
      role: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updatePersonnelRole(
        params.adminCode,
        params.personnelId,
        params.role,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personnel"] }),
  });
}

export function useRemovePersonnel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; personnelId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removePersonnelFromCompany(
        params.adminCode,
        params.personnelId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personnel"] }),
  });
}

export function useRegisterCompany() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: { name: string; mode: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerCompany(params.name, params.mode);
    },
  });
}

export function useSelfRegisterPersonnel() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.selfRegisterPersonnel(name);
    },
  });
}

// --- Projects ---

export function useGetProjects(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Project[]>({
    queryKey: ["projects", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getProjects(userCode) as Promise<Project[]>;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      name: string;
      description: string;
      startDate: string;
      endDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addProject(
        params.adminCode,
        params.name,
        params.description,
        params.startDate,
        params.endDate,
      ) as Promise<Project>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      projectId: string;
      name: string;
      description: string;
      startDate: string;
      endDate: string;
      status: string;
      progress: number;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateProject(
        params.adminCode,
        params.projectId,
        params.name,
        params.description,
        params.startDate,
        params.endDate,
        params.status,
        BigInt(params.progress),
      ) as Promise<Project>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; projectId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteProject(
        params.adminCode,
        params.projectId,
      ) as Promise<boolean>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// --- Maintenance ---

export function useGetMaintenanceRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<MaintenanceRecord[]>({
    queryKey: ["maintenance", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getMaintenanceRecords(userCode) as Promise<
        MaintenanceRecord[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddMaintenanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      machineId: string;
      machineName: string;
      maintenanceType: string;
      description: string;
      scheduledDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addMaintenanceRecord(
        params.adminCode,
        params.machineId,
        params.machineName,
        params.maintenanceType,
        params.description,
        params.scheduledDate,
        params.notes,
      ) as Promise<MaintenanceRecord>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateMaintenanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      recordId: string;
      description: string;
      scheduledDate: string;
      completedDate: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateMaintenanceRecord(
        params.adminCode,
        params.recordId,
        params.description,
        params.scheduledDate,
        params.completedDate,
        params.status,
        params.notes,
      ) as Promise<MaintenanceRecord>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteMaintenanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteMaintenanceRecord(
        params.adminCode,
        params.recordId,
      ) as Promise<boolean>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// --- Suppliers ---

export function useGetSuppliers(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Supplier[]>({
    queryKey: ["suppliers", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getSuppliers(userCode) as Promise<Supplier[]>;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddSupplier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      name: string;
      category: string;
      contactPerson: string;
      phone: string;
      email: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addSupplier(
        params.adminCode,
        params.name,
        params.category,
        params.contactPerson,
        params.phone,
        params.email,
        params.notes,
      ) as Promise<Supplier>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useUpdateSupplier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      supplierId: string;
      name: string;
      category: string;
      contactPerson: string;
      phone: string;
      email: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateSupplier(
        params.adminCode,
        params.supplierId,
        params.name,
        params.category,
        params.contactPerson,
        params.phone,
        params.email,
        params.status,
        params.notes,
      ) as Promise<Supplier>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteSupplier() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; supplierId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteSupplier(
        params.adminCode,
        params.supplierId,
      ) as Promise<boolean>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["suppliers"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// --- Safety ---

export function useGetSafetyIncidents(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<SafetyIncident[]>({
    queryKey: ["safety", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getSafetyIncidents(userCode) as Promise<
        SafetyIncident[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

// --- Budget ---

export function useGetBudgetItems(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<BudgetItem[]>({
    queryKey: ["budget", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getBudgetItems(userCode) as Promise<BudgetItem[]>;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

// --- Documents ---

export function useGetDocuments(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").Document[]>({
    queryKey: ["documents", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getDocuments(userCode) as Promise<
        import("../types").Document[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

// --- Inventory ---

export function useGetInventoryItems(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").InventoryItem[]>({
    queryKey: ["inventory", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getInventoryItems(userCode) as Promise<
        import("../types").InventoryItem[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

// --- Alerts ---

export function useGetAlerts(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").Alert[]>({
    queryKey: ["alerts", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getAlerts(userCode) as Promise<
        import("../types").Alert[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddAlert() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      title: string;
      description: string;
      alertType: string;
      priority: string;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addAlert(
        params.adminCode,
        params.title,
        params.description,
        params.alertType,
        params.priority,
        params.dueDate,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDismissAlert() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; alertId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).dismissAlert(params.adminCode, params.alertId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

export function useDeleteAlert() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; alertId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteAlert(params.adminCode, params.alertId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });
}

// --- Tasks ---

export function useGetTasks(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").Task[]>({
    queryKey: ["tasks", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getTasks(userCode) as Promise<
        import("../types").Task[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      projectId: string;
      title: string;
      description: string;
      assignedTo: string;
      priority: string;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addTask(
        params.adminCode,
        params.projectId,
        params.title,
        params.description,
        params.assignedTo,
        params.priority,
        params.dueDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      taskId: string;
      title: string;
      description: string;
      assignedTo: string;
      priority: string;
      status: string;
      dueDate: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateTask(
        params.adminCode,
        params.taskId,
        params.title,
        params.description,
        params.assignedTo,
        params.priority,
        params.status,
        params.dueDate,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; taskId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteTask(params.adminCode, params.taskId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

// --- Leave Requests ---

export function useGetLeaveRequests(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").LeaveRequest[]>({
    queryKey: ["leaveRequests", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getLeaveRequests(userCode) as Promise<
        import("../types").LeaveRequest[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      userCode: string;
      personnelName: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addLeaveRequest(
        params.userCode,
        params.personnelName,
        params.leaveType,
        params.startDate,
        params.endDate,
        params.reason,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

export function useReviewLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      adminCode: string;
      requestId: string;
      status: string;
      reviewNote: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).reviewLeaveRequest(
        params.adminCode,
        params.requestId,
        params.status,
        params.reviewNote,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

export function useDeleteLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { adminCode: string; requestId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteLeaveRequest(
        params.adminCode,
        params.requestId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leaveRequests"] }),
  });
}

// --- Shifts ---

export function useGetShifts(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").Shift[]>({
    queryKey: ["shifts", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getShifts(userCode) as Promise<
        import("../types").Shift[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddShift() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      shiftType: string;
      date: string;
      startTime: string;
      endTime: string;
      assignedPersonnel: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addShift(
        p.adminCode,
        p.title,
        p.shiftType,
        p.date,
        p.startTime,
        p.endTime,
        p.assignedPersonnel,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shifts"] }),
  });
}

export function useUpdateShift() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      shiftId: string;
      title: string;
      shiftType: string;
      date: string;
      startTime: string;
      endTime: string;
      assignedPersonnel: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateShift(
        p.adminCode,
        p.shiftId,
        p.title,
        p.shiftType,
        p.date,
        p.startTime,
        p.endTime,
        p.assignedPersonnel,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shifts"] }),
  });
}

export function useDeleteShift() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; shiftId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteShift(p.adminCode, p.shiftId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shifts"] }),
  });
}

// --- Training Records ---

export function useGetTrainingRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").TrainingRecord[]>({
    queryKey: ["trainingRecords", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getTrainingRecords(userCode) as Promise<
        import("../types").TrainingRecord[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddTrainingRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      trainingType: string;
      provider: string;
      personnelName: string;
      personnelCode: string;
      startDate: string;
      endDate: string;
      expiryDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addTrainingRecord(
        p.adminCode,
        p.title,
        p.trainingType,
        p.provider,
        p.personnelName,
        p.personnelCode,
        p.startDate,
        p.endDate,
        p.expiryDate,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainingRecords"] }),
  });
}

export function useUpdateTrainingRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recId: string;
      title: string;
      trainingType: string;
      provider: string;
      personnelName: string;
      personnelCode: string;
      startDate: string;
      endDate: string;
      expiryDate: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateTrainingRecord(
        p.adminCode,
        p.recId,
        p.title,
        p.trainingType,
        p.provider,
        p.personnelName,
        p.personnelCode,
        p.startDate,
        p.endDate,
        p.expiryDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainingRecords"] }),
  });
}

export function useDeleteTrainingRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteTrainingRecord(p.adminCode, p.recId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainingRecords"] }),
  });
}

// --- Quality Checks ---

export function useGetQualityChecks(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").QualityCheck[]>({
    queryKey: ["qualityChecks", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getQualityChecks(userCode) as Promise<
        import("../types").QualityCheck[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddQualityCheck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      checkType: string;
      machineId: string;
      machineName: string;
      inspector: string;
      checkDate: string;
      score: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addQualityCheck(
        p.adminCode,
        p.title,
        p.checkType,
        p.machineId,
        p.machineName,
        p.inspector,
        p.checkDate,
        p.score,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qualityChecks"] }),
  });
}

export function useUpdateQualityCheck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      checkId: string;
      title: string;
      checkType: string;
      machineId: string;
      machineName: string;
      inspector: string;
      checkDate: string;
      status: string;
      score: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateQualityCheck(
        p.adminCode,
        p.checkId,
        p.title,
        p.checkType,
        p.machineId,
        p.machineName,
        p.inspector,
        p.checkDate,
        p.status,
        p.score,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qualityChecks"] }),
  });
}

export function useDeleteQualityCheck() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; checkId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteQualityCheck(p.adminCode, p.checkId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["qualityChecks"] }),
  });
}

// --- Visitor Entries ---

export function useGetVisitorEntries(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").VisitorEntry[]>({
    queryKey: ["visitorEntries", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getVisitorEntries(userCode) as Promise<
        import("../types").VisitorEntry[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddVisitorEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      visitorName: string;
      visitorType: string;
      company: string;
      purpose: string;
      hostName: string;
      entryDate: string;
      entryTime: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addVisitorEntry(
        p.adminCode,
        p.visitorName,
        p.visitorType,
        p.company,
        p.purpose,
        p.hostName,
        p.entryDate,
        p.entryTime,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitorEntries"] }),
  });
}

export function useUpdateVisitorEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      entryId: string;
      visitorName: string;
      visitorType: string;
      company: string;
      purpose: string;
      hostName: string;
      entryDate: string;
      entryTime: string;
      exitTime: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateVisitorEntry(
        p.adminCode,
        p.entryId,
        p.visitorName,
        p.visitorType,
        p.company,
        p.purpose,
        p.hostName,
        p.entryDate,
        p.entryTime,
        p.exitTime,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitorEntries"] }),
  });
}

export function useDeleteVisitorEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; entryId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteVisitorEntry(p.adminCode, p.entryId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["visitorEntries"] }),
  });
}

// --- Fault Reports ---

export function useGetFaultReports(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").FaultReport[]>({
    queryKey: ["faultReports", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getFaultReports(userCode) as Promise<
        import("../types").FaultReport[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddFaultReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      machineId: string;
      machineName: string;
      title: string;
      faultType: string;
      severity: string;
      reportedBy: string;
      reportDate: string;
      description: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addFaultReport(
        p.adminCode,
        p.machineId,
        p.machineName,
        p.title,
        p.faultType,
        p.severity,
        p.reportedBy,
        p.reportDate,
        p.description,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faultReports"] }),
  });
}

export function useUpdateFaultReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      faultId: string;
      title: string;
      faultType: string;
      severity: string;
      reportedBy: string;
      reportDate: string;
      description: string;
      cause: string;
      resolution: string;
      status: string;
      resolutionDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateFaultReport(
        p.adminCode,
        p.faultId,
        p.title,
        p.faultType,
        p.severity,
        p.reportedBy,
        p.reportDate,
        p.description,
        p.cause,
        p.resolution,
        p.status,
        p.resolutionDate,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faultReports"] }),
  });
}

export function useDeleteFaultReport() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; faultId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteFaultReport(p.adminCode, p.faultId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["faultReports"] }),
  });
}

// --- Work Orders ---

export function useGetWorkOrders(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<import("../types").WorkOrder[]>({
    queryKey: ["workOrders", userCode],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getWorkOrders(userCode) as Promise<
        import("../types").WorkOrder[]
      >;
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}

export function useAddWorkOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      orderType: string;
      machineId: string;
      machineName: string;
      assignedTo: string;
      priority: string;
      scheduledDate: string;
      description: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addWorkOrder(
        p.adminCode,
        p.title,
        p.orderType,
        p.machineId,
        p.machineName,
        p.assignedTo,
        p.priority,
        p.scheduledDate,
        p.description,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workOrders"] }),
  });
}

export function useUpdateWorkOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      orderId: string;
      title: string;
      orderType: string;
      machineId: string;
      machineName: string;
      assignedTo: string;
      priority: string;
      status: string;
      scheduledDate: string;
      completedDate: string;
      description: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateWorkOrder(
        p.adminCode,
        p.orderId,
        p.title,
        p.orderType,
        p.machineId,
        p.machineName,
        p.assignedTo,
        p.priority,
        p.status,
        p.scheduledDate,
        p.completedDate,
        p.description,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workOrders"] }),
  });
}

export function useDeleteWorkOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; orderId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteWorkOrder(p.adminCode, p.orderId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workOrders"] }),
  });
}

// ===== ASSETS =====
export function useGetAssets(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").Asset[]>({
    queryKey: ["assets", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () => {
      return (actor as any).getAssets(userCode) as Promise<
        import("../types").Asset[]
      >;
    },
  });
}

export function useAddAsset() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      name: string;
      category: string;
      serialNumber: string;
      location: string;
      condition: string;
      purchaseDate: string;
      purchaseValue: string;
      currentValue: string;
      responsible: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addAsset(
        p.adminCode,
        p.name,
        p.category,
        p.serialNumber,
        p.location,
        p.condition,
        p.purchaseDate,
        p.purchaseValue,
        p.currentValue,
        p.responsible,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      assetId: string;
      name: string;
      category: string;
      serialNumber: string;
      location: string;
      condition: string;
      purchaseDate: string;
      purchaseValue: string;
      currentValue: string;
      responsible: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateAsset(
        p.adminCode,
        p.assetId,
        p.name,
        p.category,
        p.serialNumber,
        p.location,
        p.condition,
        p.purchaseDate,
        p.purchaseValue,
        p.currentValue,
        p.responsible,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDeleteAsset() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; assetId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteAsset(p.adminCode, p.assetId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

// ===== PERFORMANCE RECORDS =====
export function useGetPerformanceRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").PerformanceRecord[]>({
    queryKey: ["performanceRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () => {
      return (actor as any).getPerformanceRecords(userCode) as Promise<
        import("../types").PerformanceRecord[]
      >;
    },
  });
}

export function useAddPerformanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      kpiType: string;
      period: string;
      personnelOrDept: string;
      targetValue: string;
      actualValue: string;
      unit: string;
      evaluationDate: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addPerformanceRecord(
        p.adminCode,
        p.title,
        p.kpiType,
        p.period,
        p.personnelOrDept,
        p.targetValue,
        p.actualValue,
        p.unit,
        p.evaluationDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performanceRecords"] }),
  });
}

export function useUpdatePerformanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      title: string;
      kpiType: string;
      period: string;
      personnelOrDept: string;
      targetValue: string;
      actualValue: string;
      unit: string;
      evaluationDate: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updatePerformanceRecord(
        p.adminCode,
        p.recordId,
        p.title,
        p.kpiType,
        p.period,
        p.personnelOrDept,
        p.targetValue,
        p.actualValue,
        p.unit,
        p.evaluationDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performanceRecords"] }),
  });
}

export function useDeletePerformanceRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deletePerformanceRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["performanceRecords"] }),
  });
}

// ===== ENERGY RECORDS =====
export function useGetEnergyRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").EnergyRecord[]>({
    queryKey: ["energyRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () => {
      return (actor as any).getEnergyRecords(userCode) as Promise<
        import("../types").EnergyRecord[]
      >;
    },
  });
}

export function useAddEnergyRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      energyType: string;
      period: string;
      location: string;
      unit: string;
      consumption: string;
      cost: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addEnergyRecord(
        p.adminCode,
        p.energyType,
        p.period,
        p.location,
        p.unit,
        p.consumption,
        p.cost,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["energyRecords"] }),
  });
}

export function useUpdateEnergyRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      energyType: string;
      period: string;
      location: string;
      unit: string;
      consumption: string;
      cost: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateEnergyRecord(
        p.adminCode,
        p.recordId,
        p.energyType,
        p.period,
        p.location,
        p.unit,
        p.consumption,
        p.cost,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["energyRecords"] }),
  });
}

export function useDeleteEnergyRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteEnergyRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["energyRecords"] }),
  });
}

// ===== CONTRACTS =====
export function useGetContracts(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").Contract[]>({
    queryKey: ["contracts", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () => {
      return (actor as any).getContracts(userCode) as Promise<
        import("../types").Contract[]
      >;
    },
  });
}

export function useAddContract() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      counterparty: string;
      contractType: string;
      startDate: string;
      endDate: string;
      value: string;
      status: string;
      responsible: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addContract(
        p.adminCode,
        p.title,
        p.counterparty,
        p.contractType,
        p.startDate,
        p.endDate,
        p.value,
        p.status,
        p.responsible,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useUpdateContract() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      contractId: string;
      title: string;
      counterparty: string;
      contractType: string;
      startDate: string;
      endDate: string;
      value: string;
      status: string;
      responsible: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateContract(
        p.adminCode,
        p.contractId,
        p.title,
        p.counterparty,
        p.contractType,
        p.startDate,
        p.endDate,
        p.value,
        p.status,
        p.responsible,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

export function useDeleteContract() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; contractId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteContract(p.adminCode, p.contractId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contracts"] }),
  });
}

// ===== WASTE / ENVIRONMENT =====
export function useGetWasteRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").WasteRecord[]>({
    queryKey: ["wasteRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getWasteRecords(userCode) as Promise<
        import("../types").WasteRecord[]
      >,
  });
}
export function useAddWasteRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      wasteType: string;
      description: string;
      quantity: string;
      unit: string;
      disposalMethod: string;
      disposalDate: string;
      responsible: string;
      cost: string;
      complianceStatus: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addWasteRecord(
        p.adminCode,
        p.wasteType,
        p.description,
        p.quantity,
        p.unit,
        p.disposalMethod,
        p.disposalDate,
        p.responsible,
        p.cost,
        p.complianceStatus,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wasteRecords"] }),
  });
}
export function useUpdateWasteRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      wasteType: string;
      description: string;
      quantity: string;
      unit: string;
      disposalMethod: string;
      disposalDate: string;
      responsible: string;
      cost: string;
      complianceStatus: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateWasteRecord(
        p.adminCode,
        p.recordId,
        p.wasteType,
        p.description,
        p.quantity,
        p.unit,
        p.disposalMethod,
        p.disposalDate,
        p.responsible,
        p.cost,
        p.complianceStatus,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wasteRecords"] }),
  });
}
export function useDeleteWasteRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteWasteRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wasteRecords"] }),
  });
}

// ===== AUDITS =====
export function useGetAudits(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").AuditRecord[]>({
    queryKey: ["audits", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getAudits(userCode) as Promise<
        import("../types").AuditRecord[]
      >,
  });
}
export function useAddAudit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      auditType: string;
      auditor: string;
      auditDate: string;
      scope: string;
      result: string;
      findingsCount: string;
      correctiveActions: string;
      dueDate: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addAudit(
        p.adminCode,
        p.title,
        p.auditType,
        p.auditor,
        p.auditDate,
        p.scope,
        p.result,
        p.findingsCount,
        p.correctiveActions,
        p.dueDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }),
  });
}
export function useUpdateAudit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      auditId: string;
      title: string;
      auditType: string;
      auditor: string;
      auditDate: string;
      scope: string;
      result: string;
      findingsCount: string;
      correctiveActions: string;
      dueDate: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateAudit(
        p.adminCode,
        p.auditId,
        p.title,
        p.auditType,
        p.auditor,
        p.auditDate,
        p.scope,
        p.result,
        p.findingsCount,
        p.correctiveActions,
        p.dueDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }),
  });
}
export function useDeleteAudit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; auditId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteAudit(p.adminCode, p.auditId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["audits"] }),
  });
}

// ===== RISK MANAGEMENT =====
export function useGetRiskRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").RiskRecord[]>({
    queryKey: ["riskRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getRiskRecords(userCode) as Promise<
        import("../types").RiskRecord[]
      >,
  });
}
export function useAddRiskRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      category: string;
      probability: string;
      impact: string;
      riskLevel: string;
      description: string;
      owner: string;
      mitigationPlan: string;
      status: string;
      reviewDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addRiskRecord(
        p.adminCode,
        p.title,
        p.category,
        p.probability,
        p.impact,
        p.riskLevel,
        p.description,
        p.owner,
        p.mitigationPlan,
        p.status,
        p.reviewDate,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["riskRecords"] }),
  });
}
export function useUpdateRiskRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      title: string;
      category: string;
      probability: string;
      impact: string;
      riskLevel: string;
      description: string;
      owner: string;
      mitigationPlan: string;
      status: string;
      reviewDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateRiskRecord(
        p.adminCode,
        p.recordId,
        p.title,
        p.category,
        p.probability,
        p.impact,
        p.riskLevel,
        p.description,
        p.owner,
        p.mitigationPlan,
        p.status,
        p.reviewDate,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["riskRecords"] }),
  });
}
export function useDeleteRiskRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteRiskRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["riskRecords"] }),
  });
}

// ===== SUPPLY CHAIN =====
export function useGetSupplyChainRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").SupplyChainRecord[]>({
    queryKey: ["supplyChainRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getSupplyChainRecords(userCode) as Promise<
        import("../types").SupplyChainRecord[]
      >,
  });
}
export function useAddSupplyChainRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      itemName: string;
      supplierName: string;
      category: string;
      orderedQuantity: string;
      deliveredQuantity: string;
      unit: string;
      orderDate: string;
      expectedDate: string;
      deliveryDate: string;
      leadTimeDays: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addSupplyChainRecord(
        p.adminCode,
        p.itemName,
        p.supplierName,
        p.category,
        p.orderedQuantity,
        p.deliveredQuantity,
        p.unit,
        p.orderDate,
        p.expectedDate,
        p.deliveryDate,
        p.leadTimeDays,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplyChainRecords"] }),
  });
}
export function useUpdateSupplyChainRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      itemName: string;
      supplierName: string;
      category: string;
      orderedQuantity: string;
      deliveredQuantity: string;
      unit: string;
      orderDate: string;
      expectedDate: string;
      deliveryDate: string;
      leadTimeDays: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateSupplyChainRecord(
        p.adminCode,
        p.recordId,
        p.itemName,
        p.supplierName,
        p.category,
        p.orderedQuantity,
        p.deliveredQuantity,
        p.unit,
        p.orderDate,
        p.expectedDate,
        p.deliveryDate,
        p.leadTimeDays,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplyChainRecords"] }),
  });
}
export function useDeleteSupplyChainRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteSupplyChainRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplyChainRecords"] }),
  });
}

// ===== HR TRACKING =====
export function useGetHRRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").HRRecord[]>({
    queryKey: ["hrRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getHRRecords(userCode) as Promise<
        import("../types").HRRecord[]
      >,
  });
}
export function useAddHRRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      name: string;
      department: string;
      position: string;
      employmentType: string;
      startDate: string;
      salary: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addHRRecord(
        p.adminCode,
        p.name,
        p.department,
        p.position,
        p.employmentType,
        p.startDate,
        p.salary,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hrRecords"] }),
  });
}
export function useUpdateHRRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      name: string;
      department: string;
      position: string;
      employmentType: string;
      startDate: string;
      salary: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateHRRecord(
        p.adminCode,
        p.recordId,
        p.name,
        p.department,
        p.position,
        p.employmentType,
        p.startDate,
        p.salary,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hrRecords"] }),
  });
}
export function useDeleteHRRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteHRRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["hrRecords"] }),
  });
}

// ===== PROJECT COST ANALYSIS =====
export function useGetCostAnalysisRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").CostAnalysisRecord[]>({
    queryKey: ["costAnalysisRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getCostAnalysisRecords(userCode) as Promise<
        import("../types").CostAnalysisRecord[]
      >,
  });
}
export function useAddCostAnalysisRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      projectName: string;
      costCategory: string;
      description: string;
      plannedAmount: string;
      actualAmount: string;
      date: string;
      responsible: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addCostAnalysisRecord(
        p.adminCode,
        p.projectName,
        p.costCategory,
        p.description,
        p.plannedAmount,
        p.actualAmount,
        p.date,
        p.responsible,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["costAnalysisRecords"] }),
  });
}
export function useUpdateCostAnalysisRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      projectName: string;
      costCategory: string;
      description: string;
      plannedAmount: string;
      actualAmount: string;
      date: string;
      responsible: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateCostAnalysisRecord(
        p.adminCode,
        p.recordId,
        p.projectName,
        p.costCategory,
        p.description,
        p.plannedAmount,
        p.actualAmount,
        p.date,
        p.responsible,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["costAnalysisRecords"] }),
  });
}
export function useDeleteCostAnalysisRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteCostAnalysisRecord(p.adminCode, p.recordId);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["costAnalysisRecords"] }),
  });
}

// ===== MAINTENANCE CALENDAR =====
export function useGetMaintenanceCalendarRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").MaintenanceCalendarRecord[]>({
    queryKey: ["maintenanceCalendarRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getMaintenanceCalendarRecords(userCode) as Promise<
        import("../types").MaintenanceCalendarRecord[]
      >,
  });
}
export function useAddMaintenanceCalendarRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      machineId: string;
      machineName: string;
      maintenanceType: string;
      frequency: string;
      nextDueDate: string;
      lastDoneDate: string;
      responsible: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addMaintenanceCalendarRecord(
        p.adminCode,
        p.title,
        p.machineId,
        p.machineName,
        p.maintenanceType,
        p.frequency,
        p.nextDueDate,
        p.lastDoneDate,
        p.responsible,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["maintenanceCalendarRecords"] }),
  });
}
export function useUpdateMaintenanceCalendarRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      title: string;
      machineId: string;
      machineName: string;
      maintenanceType: string;
      frequency: string;
      nextDueDate: string;
      lastDoneDate: string;
      responsible: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateMaintenanceCalendarRecord(
        p.adminCode,
        p.recordId,
        p.title,
        p.machineId,
        p.machineName,
        p.maintenanceType,
        p.frequency,
        p.nextDueDate,
        p.lastDoneDate,
        p.responsible,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["maintenanceCalendarRecords"] }),
  });
}
export function useDeleteMaintenanceCalendarRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteMaintenanceCalendarRecord(
        p.adminCode,
        p.recordId,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["maintenanceCalendarRecords"] }),
  });
}

// ===== SUPPLIER EVALUATION =====
export function useGetSupplierEvalRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<import("../types").SupplierEvalRecord[]>({
    queryKey: ["supplierEvalRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () =>
      (actor as any).getSupplierEvalRecords(userCode) as Promise<
        import("../types").SupplierEvalRecord[]
      >,
  });
}
export function useAddSupplierEvalRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      supplierName: string;
      evaluationPeriod: string;
      qualityScore: string;
      deliveryScore: string;
      priceScore: string;
      serviceScore: string;
      overallScore: string;
      recommendation: string;
      evaluatedBy: string;
      evaluationDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addSupplierEvalRecord(
        p.adminCode,
        p.supplierName,
        p.evaluationPeriod,
        p.qualityScore,
        p.deliveryScore,
        p.priceScore,
        p.serviceScore,
        p.overallScore,
        p.recommendation,
        p.evaluatedBy,
        p.evaluationDate,
        p.notes,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["supplierEvalRecords"] }),
  });
}
export function useUpdateSupplierEvalRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      supplierName: string;
      evaluationPeriod: string;
      qualityScore: string;
      deliveryScore: string;
      priceScore: string;
      serviceScore: string;
      overallScore: string;
      recommendation: string;
      evaluatedBy: string;
      evaluationDate: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateSupplierEvalRecord(
        p.adminCode,
        p.recordId,
        p.supplierName,
        p.evaluationPeriod,
        p.qualityScore,
        p.deliveryScore,
        p.priceScore,
        p.serviceScore,
        p.overallScore,
        p.recommendation,
        p.evaluatedBy,
        p.evaluationDate,
        p.notes,
      );
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["supplierEvalRecords"] }),
  });
}
export function useDeleteSupplierEvalRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteSupplierEvalRecord(p.adminCode, p.recordId);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["supplierEvalRecords"] }),
  });
}

// ── Capacity Records ────────────────────────────────────────────────────────
export function useGetCapacityRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<CapacityRecord[]>({
    queryKey: ["capacityRecords"],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getCapacityRecords(userCode);
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}
export function useAddCapacityRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      resourceName: string;
      resourceType: string;
      totalCapacity: string;
      usedCapacity: string;
      unit: string;
      period: string;
      responsible: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addCapacityRecord(
        p.adminCode,
        p.resourceName,
        p.resourceType,
        p.totalCapacity,
        p.usedCapacity,
        p.unit,
        p.period,
        p.responsible,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["capacityRecords"] }),
  });
}
export function useUpdateCapacityRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      resourceName: string;
      resourceType: string;
      totalCapacity: string;
      usedCapacity: string;
      unit: string;
      period: string;
      responsible: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateCapacityRecord(
        p.adminCode,
        p.recordId,
        p.resourceName,
        p.resourceType,
        p.totalCapacity,
        p.usedCapacity,
        p.unit,
        p.period,
        p.responsible,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["capacityRecords"] }),
  });
}
export function useDeleteCapacityRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteCapacityRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["capacityRecords"] }),
  });
}

// ── Calibration Records ─────────────────────────────────────────────────────
export function useGetCalibrationRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<CalibrationRecord[]>({
    queryKey: ["calibrationRecords"],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getCalibrationRecords(userCode);
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}
export function useAddCalibrationRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      instrumentName: string;
      serialNumber: string;
      category: string;
      lastCalibrationDate: string;
      nextCalibrationDate: string;
      calibrationInterval: string;
      calibratedBy: string;
      location: string;
      certificateNo: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).addCalibrationRecord(
        p.adminCode,
        p.instrumentName,
        p.serialNumber,
        p.category,
        p.lastCalibrationDate,
        p.nextCalibrationDate,
        p.calibrationInterval,
        p.calibratedBy,
        p.location,
        p.certificateNo,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calibrationRecords"] }),
  });
}
export function useUpdateCalibrationRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      instrumentName: string;
      serialNumber: string;
      category: string;
      lastCalibrationDate: string;
      nextCalibrationDate: string;
      calibrationInterval: string;
      calibratedBy: string;
      location: string;
      certificateNo: string;
      status: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).updateCalibrationRecord(
        p.adminCode,
        p.recordId,
        p.instrumentName,
        p.serialNumber,
        p.category,
        p.lastCalibrationDate,
        p.nextCalibrationDate,
        p.calibrationInterval,
        p.calibratedBy,
        p.location,
        p.certificateNo,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calibrationRecords"] }),
  });
}
export function useDeleteCalibrationRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      if (!actor) throw new Error("Actor not ready");
      return (actor as any).deleteCalibrationRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calibrationRecords"] }),
  });
}

// ── Production Records ────────────────────────────────────────────────────────
export function useGetProductionRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ProductionRecord[]>({
    queryKey: ["productionRecords"],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getProductionRecords(userCode);
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}
export function useAddProductionRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      productName: string;
      productionLine: string;
      shiftType: string;
      operator: string;
      plannedQuantity: string;
      actualQuantity: string;
      defectQuantity: string;
      unit: string;
      productionDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addProductionRecord(
        p.adminCode,
        p.productName,
        p.productionLine,
        p.shiftType,
        p.operator,
        p.plannedQuantity,
        p.actualQuantity,
        p.defectQuantity,
        p.unit,
        p.productionDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productionRecords"] }),
  });
}
export function useUpdateProductionRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      productName: string;
      productionLine: string;
      shiftType: string;
      operator: string;
      plannedQuantity: string;
      actualQuantity: string;
      defectQuantity: string;
      unit: string;
      productionDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateProductionRecord(
        p.adminCode,
        p.recordId,
        p.productName,
        p.productionLine,
        p.shiftType,
        p.operator,
        p.plannedQuantity,
        p.actualQuantity,
        p.defectQuantity,
        p.unit,
        p.productionDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productionRecords"] }),
  });
}
export function useDeleteProductionRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteProductionRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["productionRecords"] }),
  });
}

// ── Chemical Records ────────────────────────────────────────────────────────
export function useGetChemicalRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ChemicalRecord[]>({
    queryKey: ["chemicalRecords"],
    queryFn: async () => {
      if (!actor || !userCode) return [];
      return (actor as any).getChemicalRecords(userCode);
    },
    enabled: !!actor && !isFetching && !!userCode,
  });
}
export function useAddChemicalRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      chemicalName: string;
      casNumber: string;
      hazardClass: string;
      storageLocation: string;
      quantity: string;
      unit: string;
      supplierName: string;
      expiryDate: string;
      sdsNumber: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addChemicalRecord(
        p.adminCode,
        p.chemicalName,
        p.casNumber,
        p.hazardClass,
        p.storageLocation,
        p.quantity,
        p.unit,
        p.supplierName,
        p.expiryDate,
        p.sdsNumber,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicalRecords"] }),
  });
}
export function useUpdateChemicalRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      chemicalName: string;
      casNumber: string;
      hazardClass: string;
      storageLocation: string;
      quantity: string;
      unit: string;
      supplierName: string;
      expiryDate: string;
      sdsNumber: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateChemicalRecord(
        p.adminCode,
        p.recordId,
        p.chemicalName,
        p.casNumber,
        p.hazardClass,
        p.storageLocation,
        p.quantity,
        p.unit,
        p.supplierName,
        p.expiryDate,
        p.sdsNumber,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicalRecords"] }),
  });
}
export function useDeleteChemicalRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteChemicalRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["chemicalRecords"] }),
  });
}

export function useGetMoldRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<MoldRecord[]>({
    queryKey: ["moldRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () => {
      return (actor as any).getMoldRecords(userCode);
    },
  });
}

export function useAddMoldRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      moldName: string;
      moldCode: string;
      category: string;
      material: string;
      location: string;
      usageCount: string;
      maxUsageCount: string;
      lastMaintenanceDate: string;
      nextMaintenanceDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addMoldRecord(
        p.adminCode,
        p.moldName,
        p.moldCode,
        p.category,
        p.material,
        p.location,
        p.usageCount,
        p.maxUsageCount,
        p.lastMaintenanceDate,
        p.nextMaintenanceDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moldRecords"] }),
  });
}

export function useUpdateMoldRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      moldName: string;
      moldCode: string;
      category: string;
      material: string;
      location: string;
      usageCount: string;
      maxUsageCount: string;
      lastMaintenanceDate: string;
      nextMaintenanceDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateMoldRecord(
        p.adminCode,
        p.recordId,
        p.moldName,
        p.moldCode,
        p.category,
        p.material,
        p.location,
        p.usageCount,
        p.maxUsageCount,
        p.lastMaintenanceDate,
        p.nextMaintenanceDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moldRecords"] }),
  });
}

export function useDeleteMoldRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteMoldRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["moldRecords"] }),
  });
}

export function useGetStockCountRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<StockCountRecord[]>({
    queryKey: ["stockCountRecords", userCode],
    enabled: !!actor && !!userCode,
    queryFn: async () => {
      return (actor as any).getStockCountRecords(userCode);
    },
  });
}

export function useAddStockCountRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      itemName: string;
      itemCode: string;
      category: string;
      location: string;
      expectedQty: string;
      actualQty: string;
      unit: string;
      countDate: string;
      countedBy: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addStockCountRecord(
        p.adminCode,
        p.itemName,
        p.itemCode,
        p.category,
        p.location,
        p.expectedQty,
        p.actualQty,
        p.unit,
        p.countDate,
        p.countedBy,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockCountRecords"] }),
  });
}

export function useUpdateStockCountRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      itemName: string;
      itemCode: string;
      category: string;
      location: string;
      expectedQty: string;
      actualQty: string;
      unit: string;
      countDate: string;
      countedBy: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateStockCountRecord(
        p.adminCode,
        p.recordId,
        p.itemName,
        p.itemCode,
        p.category,
        p.location,
        p.expectedQty,
        p.actualQty,
        p.unit,
        p.countDate,
        p.countedBy,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockCountRecords"] }),
  });
}

export function useDeleteStockCountRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteStockCountRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockCountRecords"] }),
  });
}

// ===== VEHICLE RECORDS =====
export function useGetVehicleRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<VehicleRecord[]>({
    queryKey: ["vehicleRecords", userCode],
    enabled: !!actor && !isFetching && !!userCode,
    queryFn: async () => {
      return (actor as any).getVehicleRecords(userCode);
    },
  });
}

export function useAddVehicleRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      plate: string;
      brand: string;
      model: string;
      year: string;
      vehicleType: string;
      department: string;
      driver: string;
      inspectionDate: string;
      insuranceDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addVehicleRecord(
        p.adminCode,
        p.plate,
        p.brand,
        p.model,
        p.year,
        p.vehicleType,
        p.department,
        p.driver,
        p.inspectionDate,
        p.insuranceDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicleRecords"] }),
  });
}

export function useUpdateVehicleRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      plate: string;
      brand: string;
      model: string;
      year: string;
      vehicleType: string;
      department: string;
      driver: string;
      inspectionDate: string;
      insuranceDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateVehicleRecord(
        p.adminCode,
        p.recordId,
        p.plate,
        p.brand,
        p.model,
        p.year,
        p.vehicleType,
        p.department,
        p.driver,
        p.inspectionDate,
        p.insuranceDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicleRecords"] }),
  });
}

export function useDeleteVehicleRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteVehicleRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicleRecords"] }),
  });
}

// ===== COMPLAINT RECORDS =====
export function useGetComplaintRecords(userCode: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ComplaintRecord[]>({
    queryKey: ["complaintRecords", userCode],
    enabled: !!actor && !isFetching && !!userCode,
    queryFn: async () => {
      return (actor as any).getComplaintRecords(userCode);
    },
  });
}

export function useAddComplaintRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      category: string;
      source: string;
      submittedBy: string;
      assignedTo: string;
      priority: string;
      status: string;
      description: string;
      resolution: string;
      submissionDate: string;
      closedDate: string;
      notes: string;
    }) => {
      return (actor as any).addComplaintRecord(
        p.adminCode,
        p.title,
        p.category,
        p.source,
        p.submittedBy,
        p.assignedTo,
        p.priority,
        p.status,
        p.description,
        p.resolution,
        p.submissionDate,
        p.closedDate,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaintRecords"] }),
  });
}

export function useUpdateComplaintRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      title: string;
      category: string;
      source: string;
      submittedBy: string;
      assignedTo: string;
      priority: string;
      status: string;
      description: string;
      resolution: string;
      submissionDate: string;
      closedDate: string;
      notes: string;
    }) => {
      return (actor as any).updateComplaintRecord(
        p.adminCode,
        p.recordId,
        p.title,
        p.category,
        p.source,
        p.submittedBy,
        p.assignedTo,
        p.priority,
        p.status,
        p.description,
        p.resolution,
        p.submissionDate,
        p.closedDate,
        p.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaintRecords"] }),
  });
}

export function useDeleteComplaintRecord() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteComplaintRecord(p.adminCode, p.recordId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["complaintRecords"] }),
  });
}

// ===================== BAKIM MALİYETİ TAKİBİ =====================
export function useGetMaintenanceCostRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<MaintenanceCostRecord[]>({
    queryKey: ["maintenanceCostRecords", userCode],
    queryFn: async () => {
      if (!userCode || !actor) return [];
      return (actor as any).getMaintenanceCostRecords(userCode);
    },
    enabled: !!userCode && !!actor,
  });
}

export function useAddMaintenanceCostRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      workOrderId: string;
      workOrderTitle: string;
      costType: string;
      description: string;
      amount: string;
      currency: string;
      vendor: string;
      invoiceNumber: string;
      costDate: string;
      approvedBy: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addMaintenanceCostRecord(
        p.adminCode,
        p.workOrderId,
        p.workOrderTitle,
        p.costType,
        p.description,
        p.amount,
        p.currency,
        p.vendor,
        p.invoiceNumber,
        p.costDate,
        p.approvedBy,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenanceCostRecords"] }),
  });
}

export function useUpdateMaintenanceCostRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      workOrderId: string;
      workOrderTitle: string;
      costType: string;
      description: string;
      amount: string;
      currency: string;
      vendor: string;
      invoiceNumber: string;
      costDate: string;
      approvedBy: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateMaintenanceCostRecord(
        p.adminCode,
        p.recordId,
        p.workOrderId,
        p.workOrderTitle,
        p.costType,
        p.description,
        p.amount,
        p.currency,
        p.vendor,
        p.invoiceNumber,
        p.costDate,
        p.approvedBy,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenanceCostRecords"] }),
  });
}

export function useDeleteMaintenanceCostRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteMaintenanceCostRecord(
        p.adminCode,
        p.recordId,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["maintenanceCostRecords"] }),
  });
}

// ===================== EĞİTİM PROGRAMI PLANLAMA =====================
export function useGetTrainingProgramRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<TrainingProgramRecord[]>({
    queryKey: ["trainingProgramRecords", userCode],
    queryFn: async () => {
      if (!userCode || !actor) return [];
      return (actor as any).getTrainingProgramRecords(userCode);
    },
    enabled: !!userCode && !!actor,
  });
}

export function useAddTrainingProgramRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      programType: string;
      trainer: string;
      department: string;
      plannedDate: string;
      plannedEndDate: string;
      location: string;
      maxParticipants: string;
      participants: string;
      status: string;
      cost: string;
      objectives: string;
      notes: string;
    }) => {
      return (actor as any).addTrainingProgramRecord(
        p.adminCode,
        p.title,
        p.programType,
        p.trainer,
        p.department,
        p.plannedDate,
        p.plannedEndDate,
        p.location,
        p.maxParticipants,
        p.participants,
        p.status,
        p.cost,
        p.objectives,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trainingProgramRecords"] }),
  });
}

export function useUpdateTrainingProgramRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      title: string;
      programType: string;
      trainer: string;
      department: string;
      plannedDate: string;
      plannedEndDate: string;
      location: string;
      maxParticipants: string;
      participants: string;
      status: string;
      cost: string;
      objectives: string;
      notes: string;
    }) => {
      return (actor as any).updateTrainingProgramRecord(
        p.adminCode,
        p.recordId,
        p.title,
        p.programType,
        p.trainer,
        p.department,
        p.plannedDate,
        p.plannedEndDate,
        p.location,
        p.maxParticipants,
        p.participants,
        p.status,
        p.cost,
        p.objectives,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trainingProgramRecords"] }),
  });
}

export function useDeleteTrainingProgramRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteTrainingProgramRecord(
        p.adminCode,
        p.recordId,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trainingProgramRecords"] }),
  });
}

// ===================== GÜVENLİK OLAYI TAKİBİ =====================
export function useGetSafetyIncidentRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<SafetyIncidentRecord[]>({
    queryKey: ["safetyIncidentRecords", userCode],
    queryFn: async () => {
      if (!userCode || !actor) return [];
      return (actor as any).getSafetyIncidentRecords(userCode);
    },
    enabled: !!userCode && !!actor,
  });
}

export function useAddSafetyIncidentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      title: string;
      incidentType: string;
      severity: string;
      location: string;
      incidentDate: string;
      reportedBy: string;
      injured: string;
      description: string;
      immediateAction: string;
      rootCause: string;
      correctiveAction: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addSafetyIncidentRecord(
        p.adminCode,
        p.title,
        p.incidentType,
        p.severity,
        p.location,
        p.incidentDate,
        p.reportedBy,
        p.injured,
        p.description,
        p.immediateAction,
        p.rootCause,
        p.correctiveAction,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["safetyIncidentRecords"] }),
  });
}

export function useUpdateSafetyIncidentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      title: string;
      incidentType: string;
      severity: string;
      location: string;
      incidentDate: string;
      reportedBy: string;
      injured: string;
      description: string;
      immediateAction: string;
      rootCause: string;
      correctiveAction: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateSafetyIncidentRecord(
        p.adminCode,
        p.recordId,
        p.title,
        p.incidentType,
        p.severity,
        p.location,
        p.incidentDate,
        p.reportedBy,
        p.injured,
        p.description,
        p.immediateAction,
        p.rootCause,
        p.correctiveAction,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["safetyIncidentRecords"] }),
  });
}

export function useDeleteSafetyIncidentRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteSafetyIncidentRecord(p.adminCode, p.recordId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["safetyIncidentRecords"] }),
  });
}

// ===================== BÜTÇE REVİZYON TAKİBİ =====================
export function useGetBudgetRevisionRecords(userCode: string | null) {
  const { actor } = useActor();
  return useQuery<BudgetRevisionRecord[]>({
    queryKey: ["budgetRevisionRecords", userCode],
    queryFn: async () => {
      if (!userCode || !actor) return [];
      return (actor as any).getBudgetRevisionRecords(userCode);
    },
    enabled: !!userCode && !!actor,
  });
}

export function useAddBudgetRevisionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      budgetTitle: string;
      revisionNumber: string;
      originalAmount: string;
      revisedAmount: string;
      changeReason: string;
      requestedBy: string;
      approvedBy: string;
      revisionDate: string;
      approvalDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).addBudgetRevisionRecord(
        p.adminCode,
        p.budgetTitle,
        p.revisionNumber,
        p.originalAmount,
        p.revisedAmount,
        p.changeReason,
        p.requestedBy,
        p.approvedBy,
        p.revisionDate,
        p.approvalDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["budgetRevisionRecords"] }),
  });
}

export function useUpdateBudgetRevisionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      adminCode: string;
      recordId: string;
      budgetTitle: string;
      revisionNumber: string;
      originalAmount: string;
      revisedAmount: string;
      changeReason: string;
      requestedBy: string;
      approvedBy: string;
      revisionDate: string;
      approvalDate: string;
      status: string;
      notes: string;
    }) => {
      return (actor as any).updateBudgetRevisionRecord(
        p.adminCode,
        p.recordId,
        p.budgetTitle,
        p.revisionNumber,
        p.originalAmount,
        p.revisedAmount,
        p.changeReason,
        p.requestedBy,
        p.approvedBy,
        p.revisionDate,
        p.approvalDate,
        p.status,
        p.notes,
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["budgetRevisionRecords"] }),
  });
}

export function useDeleteBudgetRevisionRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (p: { adminCode: string; recordId: string }) => {
      return (actor as any).deleteBudgetRevisionRecord(p.adminCode, p.recordId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["budgetRevisionRecords"] }),
  });
}

// ===== LOCAL STORAGE HELPERS =====
function lsGet<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}
function lsSet<T>(key: string, val: T[]) {
  localStorage.setItem(key, JSON.stringify(val));
}
function lsKey(ns: string, companyId: string) {
  return `fv_${ns}_${companyId}`;
}

// ===== ACTION PLANS =====

export function useGetActionPlans(companyId: string | null) {
  return useQuery<ActionPlan[]>({
    queryKey: ["actionPlans", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<ActionPlan>(lsKey("actionPlans", companyId));
    },
  });
}
export function useAddActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<ActionPlan, "id" | "createdAt">) => {
      const all = lsGet<ActionPlan>(lsKey("actionPlans", p.companyId));
      const rec: ActionPlan = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("actionPlans", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["actionPlans", v.companyId] }),
  });
}
export function useUpdateActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: ActionPlan) => {
      const all = lsGet<ActionPlan>(lsKey("actionPlans", p.companyId));
      lsSet(
        lsKey("actionPlans", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["actionPlans", v.companyId] }),
  });
}
export function useDeleteActionPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<ActionPlan>(lsKey("actionPlans", p.companyId));
      lsSet(
        lsKey("actionPlans", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["actionPlans", v.companyId] }),
  });
}

// ===== PURCHASE REQUESTS =====
export function useGetPurchaseRequests(companyId: string | null) {
  return useQuery<PurchaseRequest[]>({
    queryKey: ["purchaseRequests", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<PurchaseRequest>(lsKey("purchaseRequests", companyId));
    },
  });
}
export function useAddPurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<PurchaseRequest, "id" | "createdAt">) => {
      const all = lsGet<PurchaseRequest>(
        lsKey("purchaseRequests", p.companyId),
      );
      const rec: PurchaseRequest = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("purchaseRequests", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["purchaseRequests", v.companyId] }),
  });
}
export function useUpdatePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: PurchaseRequest) => {
      const all = lsGet<PurchaseRequest>(
        lsKey("purchaseRequests", p.companyId),
      );
      lsSet(
        lsKey("purchaseRequests", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["purchaseRequests", v.companyId] }),
  });
}
export function useDeletePurchaseRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<PurchaseRequest>(
        lsKey("purchaseRequests", p.companyId),
      );
      lsSet(
        lsKey("purchaseRequests", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["purchaseRequests", v.companyId] }),
  });
}

// ===== ABSENCE RECORDS =====
export function useGetAbsenceRecords(companyId: string | null) {
  return useQuery<AbsenceRecord[]>({
    queryKey: ["absenceRecords", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<AbsenceRecord>(lsKey("absenceRecords", companyId));
    },
  });
}
export function useAddAbsenceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<AbsenceRecord, "id" | "createdAt">) => {
      const all = lsGet<AbsenceRecord>(lsKey("absenceRecords", p.companyId));
      const rec: AbsenceRecord = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("absenceRecords", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["absenceRecords", v.companyId] }),
  });
}
export function useUpdateAbsenceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: AbsenceRecord) => {
      const all = lsGet<AbsenceRecord>(lsKey("absenceRecords", p.companyId));
      lsSet(
        lsKey("absenceRecords", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["absenceRecords", v.companyId] }),
  });
}
export function useDeleteAbsenceRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<AbsenceRecord>(lsKey("absenceRecords", p.companyId));
      lsSet(
        lsKey("absenceRecords", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["absenceRecords", v.companyId] }),
  });
}

// ===== MILESTONES =====
export function useGetMilestones(companyId: string | null) {
  return useQuery<Milestone[]>({
    queryKey: ["milestones", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<Milestone>(lsKey("milestones", companyId));
    },
  });
}
export function useAddMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<Milestone, "id" | "createdAt">) => {
      const all = lsGet<Milestone>(lsKey("milestones", p.companyId));
      const rec: Milestone = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("milestones", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["milestones", v.companyId] }),
  });
}
export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Milestone) => {
      const all = lsGet<Milestone>(lsKey("milestones", p.companyId));
      lsSet(
        lsKey("milestones", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["milestones", v.companyId] }),
  });
}
export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<Milestone>(lsKey("milestones", p.companyId));
      lsSet(
        lsKey("milestones", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["milestones", v.companyId] }),
  });
}

// ===== CONTACTS =====
export function useGetContacts(companyId: string | null) {
  return useQuery<ContactEntry[]>({
    queryKey: ["contacts", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<ContactEntry>(lsKey("contacts", companyId));
    },
  });
}
export function useAddContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<ContactEntry, "id" | "createdAt">) => {
      const all = lsGet<ContactEntry>(lsKey("contacts", p.companyId));
      const rec: ContactEntry = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("contacts", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["contacts", v.companyId] }),
  });
}
export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: ContactEntry) => {
      const all = lsGet<ContactEntry>(lsKey("contacts", p.companyId));
      lsSet(
        lsKey("contacts", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["contacts", v.companyId] }),
  });
}
export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<ContactEntry>(lsKey("contacts", p.companyId));
      lsSet(
        lsKey("contacts", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["contacts", v.companyId] }),
  });
}

// ===== SOP LIBRARY =====
export function useGetSopEntries(companyId: string | null) {
  return useQuery<SopEntry[]>({
    queryKey: ["sopEntries", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<SopEntry>(lsKey("sopEntries", companyId));
    },
  });
}
export function useAddSopEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<SopEntry, "id" | "createdAt">) => {
      const all = lsGet<SopEntry>(lsKey("sopEntries", p.companyId));
      const rec: SopEntry = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("sopEntries", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["sopEntries", v.companyId] }),
  });
}
export function useUpdateSopEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: SopEntry) => {
      const all = lsGet<SopEntry>(lsKey("sopEntries", p.companyId));
      lsSet(
        lsKey("sopEntries", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["sopEntries", v.companyId] }),
  });
}
export function useDeleteSopEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<SopEntry>(lsKey("sopEntries", p.companyId));
      lsSet(
        lsKey("sopEntries", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["sopEntries", v.companyId] }),
  });
}

// ===== STAFFING PLAN =====
export function useGetStaffingPlans(companyId: string | null) {
  return useQuery<StaffingPlan[]>({
    queryKey: ["staffingPlans", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<StaffingPlan>(lsKey("staffingPlans", companyId));
    },
  });
}
export function useAddStaffingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<StaffingPlan, "id" | "createdAt">) => {
      const all = lsGet<StaffingPlan>(lsKey("staffingPlans", p.companyId));
      const rec: StaffingPlan = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("staffingPlans", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["staffingPlans", v.companyId] }),
  });
}
export function useUpdateStaffingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: StaffingPlan) => {
      const all = lsGet<StaffingPlan>(lsKey("staffingPlans", p.companyId));
      lsSet(
        lsKey("staffingPlans", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["staffingPlans", v.companyId] }),
  });
}
export function useDeleteStaffingPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<StaffingPlan>(lsKey("staffingPlans", p.companyId));
      lsSet(
        lsKey("staffingPlans", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["staffingPlans", v.companyId] }),
  });
}

// ===== SUBCONTRACTOR JOBS =====
export function useGetSubcontractorJobs(companyId: string | null) {
  return useQuery<SubcontractorJob[]>({
    queryKey: ["subcontractorJobs", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<SubcontractorJob>(lsKey("subcontractorJobs", companyId));
    },
  });
}
export function useAddSubcontractorJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<SubcontractorJob, "id" | "createdAt">) => {
      const all = lsGet<SubcontractorJob>(
        lsKey("subcontractorJobs", p.companyId),
      );
      const rec: SubcontractorJob = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("subcontractorJobs", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["subcontractorJobs", v.companyId] }),
  });
}
export function useUpdateSubcontractorJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: SubcontractorJob) => {
      const all = lsGet<SubcontractorJob>(
        lsKey("subcontractorJobs", p.companyId),
      );
      lsSet(
        lsKey("subcontractorJobs", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["subcontractorJobs", v.companyId] }),
  });
}
export function useDeleteSubcontractorJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<SubcontractorJob>(
        lsKey("subcontractorJobs", p.companyId),
      );
      lsSet(
        lsKey("subcontractorJobs", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["subcontractorJobs", v.companyId] }),
  });
}

// ===== INSURANCE POLICIES =====
export function useGetInsurancePolicies(companyId: string | null) {
  return useQuery<InsurancePolicy[]>({
    queryKey: ["insurancePolicies", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<InsurancePolicy>(lsKey("insurancePolicies", companyId));
    },
  });
}
export function useAddInsurancePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<InsurancePolicy, "id" | "createdAt">) => {
      const all = lsGet<InsurancePolicy>(
        lsKey("insurancePolicies", p.companyId),
      );
      const rec: InsurancePolicy = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("insurancePolicies", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["insurancePolicies", v.companyId] }),
  });
}
export function useUpdateInsurancePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: InsurancePolicy) => {
      const all = lsGet<InsurancePolicy>(
        lsKey("insurancePolicies", p.companyId),
      );
      lsSet(
        lsKey("insurancePolicies", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["insurancePolicies", v.companyId] }),
  });
}
export function useDeleteInsurancePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<InsurancePolicy>(
        lsKey("insurancePolicies", p.companyId),
      );
      lsSet(
        lsKey("insurancePolicies", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["insurancePolicies", v.companyId] }),
  });
}

// ===== ENERGY EFFICIENCY TARGETS =====
export function useGetEnergyTargets(companyId: string | null) {
  return useQuery<EnergyEfficiencyTarget[]>({
    queryKey: ["energyTargets", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<EnergyEfficiencyTarget>(lsKey("energyTargets", companyId));
    },
  });
}
export function useAddEnergyTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<EnergyEfficiencyTarget, "id" | "createdAt">) => {
      const all = lsGet<EnergyEfficiencyTarget>(
        lsKey("energyTargets", p.companyId),
      );
      const rec: EnergyEfficiencyTarget = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("energyTargets", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["energyTargets", v.companyId] }),
  });
}
export function useUpdateEnergyTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: EnergyEfficiencyTarget) => {
      const all = lsGet<EnergyEfficiencyTarget>(
        lsKey("energyTargets", p.companyId),
      );
      lsSet(
        lsKey("energyTargets", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["energyTargets", v.companyId] }),
  });
}
export function useDeleteEnergyTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<EnergyEfficiencyTarget>(
        lsKey("energyTargets", p.companyId),
      );
      lsSet(
        lsKey("energyTargets", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["energyTargets", v.companyId] }),
  });
}

// ===== EQUIPMENT RENTALS =====
export function useGetEquipmentRentals(companyId: string | null) {
  return useQuery<EquipmentRental[]>({
    queryKey: ["equipmentRentals", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<EquipmentRental>(lsKey("equipmentRentals", companyId));
    },
  });
}
export function useAddEquipmentRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<EquipmentRental, "id" | "createdAt">) => {
      const all = lsGet<EquipmentRental>(
        lsKey("equipmentRentals", p.companyId),
      );
      const rec: EquipmentRental = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("equipmentRentals", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["equipmentRentals", v.companyId] }),
  });
}
export function useUpdateEquipmentRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: EquipmentRental) => {
      const all = lsGet<EquipmentRental>(
        lsKey("equipmentRentals", p.companyId),
      );
      lsSet(
        lsKey("equipmentRentals", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["equipmentRentals", v.companyId] }),
  });
}
export function useDeleteEquipmentRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<EquipmentRental>(
        lsKey("equipmentRentals", p.companyId),
      );
      lsSet(
        lsKey("equipmentRentals", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["equipmentRentals", v.companyId] }),
  });
}

// ===== JOB APPLICATIONS =====
export function useGetJobApplications(companyId: string | null) {
  return useQuery<JobApplication[]>({
    queryKey: ["jobApplications", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<JobApplication>(lsKey("jobApplications", companyId));
    },
  });
}
export function useAddJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<JobApplication, "id" | "createdAt">) => {
      const all = lsGet<JobApplication>(lsKey("jobApplications", p.companyId));
      const rec: JobApplication = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("jobApplications", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["jobApplications", v.companyId] }),
  });
}
export function useUpdateJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: JobApplication) => {
      const all = lsGet<JobApplication>(lsKey("jobApplications", p.companyId));
      lsSet(
        lsKey("jobApplications", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["jobApplications", v.companyId] }),
  });
}
export function useDeleteJobApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<JobApplication>(lsKey("jobApplications", p.companyId));
      lsSet(
        lsKey("jobApplications", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["jobApplications", v.companyId] }),
  });
}

// ===== WARRANTY RECORDS =====
export function useGetWarrantyRecords(companyId: string | null) {
  return useQuery<WarrantyRecord[]>({
    queryKey: ["warrantyRecords", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<WarrantyRecord>(lsKey("warrantyRecords", companyId));
    },
  });
}
export function useAddWarrantyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<WarrantyRecord, "id" | "createdAt">) => {
      const all = lsGet<WarrantyRecord>(lsKey("warrantyRecords", p.companyId));
      const rec: WarrantyRecord = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("warrantyRecords", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["warrantyRecords", v.companyId] }),
  });
}
export function useUpdateWarrantyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: WarrantyRecord) => {
      const all = lsGet<WarrantyRecord>(lsKey("warrantyRecords", p.companyId));
      lsSet(
        lsKey("warrantyRecords", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["warrantyRecords", v.companyId] }),
  });
}
export function useDeleteWarrantyRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<WarrantyRecord>(lsKey("warrantyRecords", p.companyId));
      lsSet(
        lsKey("warrantyRecords", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["warrantyRecords", v.companyId] }),
  });
}

// ===== PROJECT RISK ITEMS =====
export function useGetProjectRiskItems(companyId: string | null) {
  return useQuery<ProjectRiskItem[]>({
    queryKey: ["projectRiskItems", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<ProjectRiskItem>(lsKey("projectRiskItems", companyId));
    },
  });
}
export function useAddProjectRiskItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<ProjectRiskItem, "id" | "createdAt">) => {
      const all = lsGet<ProjectRiskItem>(
        lsKey("projectRiskItems", p.companyId),
      );
      const rec: ProjectRiskItem = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("projectRiskItems", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["projectRiskItems", v.companyId] }),
  });
}
export function useUpdateProjectRiskItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: ProjectRiskItem) => {
      const all = lsGet<ProjectRiskItem>(
        lsKey("projectRiskItems", p.companyId),
      );
      lsSet(
        lsKey("projectRiskItems", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["projectRiskItems", v.companyId] }),
  });
}
export function useDeleteProjectRiskItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<ProjectRiskItem>(
        lsKey("projectRiskItems", p.companyId),
      );
      lsSet(
        lsKey("projectRiskItems", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["projectRiskItems", v.companyId] }),
  });
}

// ===== EQUIPMENT MAINTENANCE HISTORY =====
export function useGetEquipmentMaintenanceHistory(companyId: string | null) {
  return useQuery<EquipmentMaintenanceHistory[]>({
    queryKey: ["equipmentMaintenanceHistory", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<EquipmentMaintenanceHistory>(
        lsKey("equipmentMaintenanceHistory", companyId),
      );
    },
  });
}
export function useAddEquipmentMaintenanceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<EquipmentMaintenanceHistory, "id" | "createdAt">,
    ) => {
      const all = lsGet<EquipmentMaintenanceHistory>(
        lsKey("equipmentMaintenanceHistory", p.companyId),
      );
      const rec: EquipmentMaintenanceHistory = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("equipmentMaintenanceHistory", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["equipmentMaintenanceHistory", v.companyId],
      }),
  });
}
export function useUpdateEquipmentMaintenanceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: EquipmentMaintenanceHistory) => {
      const all = lsGet<EquipmentMaintenanceHistory>(
        lsKey("equipmentMaintenanceHistory", p.companyId),
      );
      lsSet(
        lsKey("equipmentMaintenanceHistory", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["equipmentMaintenanceHistory", v.companyId],
      }),
  });
}
export function useDeleteEquipmentMaintenanceHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<EquipmentMaintenanceHistory>(
        lsKey("equipmentMaintenanceHistory", p.companyId),
      );
      lsSet(
        lsKey("equipmentMaintenanceHistory", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["equipmentMaintenanceHistory", v.companyId],
      }),
  });
}

// ===== EMPLOYEE PERFORMANCE REVIEW =====
export function useGetEmployeePerfReviews(companyId: string | null) {
  return useQuery<EmployeePerfReview[]>({
    queryKey: ["employeePerfReviews", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<EmployeePerfReview>(lsKey("employeePerfReviews", companyId));
    },
  });
}
export function useAddEmployeePerfReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<EmployeePerfReview, "id" | "createdAt">) => {
      const all = lsGet<EmployeePerfReview>(
        lsKey("employeePerfReviews", p.companyId),
      );
      const rec: EmployeePerfReview = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("employeePerfReviews", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["employeePerfReviews", v.companyId] }),
  });
}
export function useUpdateEmployeePerfReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: EmployeePerfReview) => {
      const all = lsGet<EmployeePerfReview>(
        lsKey("employeePerfReviews", p.companyId),
      );
      lsSet(
        lsKey("employeePerfReviews", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["employeePerfReviews", v.companyId] }),
  });
}
export function useDeleteEmployeePerfReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<EmployeePerfReview>(
        lsKey("employeePerfReviews", p.companyId),
      );
      lsSet(
        lsKey("employeePerfReviews", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["employeePerfReviews", v.companyId] }),
  });
}

// ===== SUPPLIER ORDERS =====
export function useGetSupplierOrders(companyId: string | null) {
  return useQuery<SupplierOrder[]>({
    queryKey: ["supplierOrders", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<SupplierOrder>(lsKey("supplierOrders", companyId));
    },
  });
}
export function useAddSupplierOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<SupplierOrder, "id" | "createdAt">) => {
      const all = lsGet<SupplierOrder>(lsKey("supplierOrders", p.companyId));
      const rec: SupplierOrder = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("supplierOrders", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["supplierOrders", v.companyId] }),
  });
}
export function useUpdateSupplierOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: SupplierOrder) => {
      const all = lsGet<SupplierOrder>(lsKey("supplierOrders", p.companyId));
      lsSet(
        lsKey("supplierOrders", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["supplierOrders", v.companyId] }),
  });
}
export function useDeleteSupplierOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<SupplierOrder>(lsKey("supplierOrders", p.companyId));
      lsSet(
        lsKey("supplierOrders", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["supplierOrders", v.companyId] }),
  });
}

// ===== INSPECTION RECORDS =====
export function useGetInspectionRecords(companyId: string | null) {
  return useQuery<InspectionRecord[]>({
    queryKey: ["inspectionRecords", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<InspectionRecord>(lsKey("inspectionRecords", companyId));
    },
  });
}
export function useAddInspectionRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Omit<InspectionRecord, "id" | "createdAt">) => {
      const all = lsGet<InspectionRecord>(
        lsKey("inspectionRecords", p.companyId),
      );
      const rec: InspectionRecord = {
        ...p,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      lsSet(lsKey("inspectionRecords", p.companyId), [...all, rec]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["inspectionRecords", v.companyId] }),
  });
}
export function useUpdateInspectionRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: InspectionRecord) => {
      const all = lsGet<InspectionRecord>(
        lsKey("inspectionRecords", p.companyId),
      );
      lsSet(
        lsKey("inspectionRecords", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["inspectionRecords", v.companyId] }),
  });
}
export function useDeleteInspectionRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<InspectionRecord>(
        lsKey("inspectionRecords", p.companyId),
      );
      lsSet(
        lsKey("inspectionRecords", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["inspectionRecords", v.companyId] }),
  });
}

// ===== LEASE RECORDS =====
export function useGetLeaseRecords(companyId: string | null) {
  return useQuery<import("../types").LeaseRecord[]>({
    queryKey: ["leaseRecords", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").LeaseRecord>(
        lsKey("leaseRecords", companyId),
      );
    },
  });
}
export function useAddLeaseRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").LeaseRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").LeaseRecord>(
        lsKey("leaseRecords", p.companyId),
      );
      lsSet(lsKey("leaseRecords", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["leaseRecords", v.companyId] }),
  });
}
export function useUpdateLeaseRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").LeaseRecord) => {
      const all = lsGet<import("../types").LeaseRecord>(
        lsKey("leaseRecords", p.companyId),
      );
      lsSet(
        lsKey("leaseRecords", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["leaseRecords", v.companyId] }),
  });
}
export function useDeleteLeaseRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").LeaseRecord>(
        lsKey("leaseRecords", p.companyId),
      );
      lsSet(
        lsKey("leaseRecords", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["leaseRecords", v.companyId] }),
  });
}

// ===== SKILL MATRIX =====
export function useGetSkillMatrixRecords(companyId: string | null) {
  return useQuery<import("../types").SkillMatrixRecord[]>({
    queryKey: ["skillMatrix", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").SkillMatrixRecord>(
        lsKey("skillMatrix", companyId),
      );
    },
  });
}
export function useAddSkillMatrixRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").SkillMatrixRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").SkillMatrixRecord>(
        lsKey("skillMatrix", p.companyId),
      );
      lsSet(lsKey("skillMatrix", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["skillMatrix", v.companyId] }),
  });
}
export function useUpdateSkillMatrixRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").SkillMatrixRecord) => {
      const all = lsGet<import("../types").SkillMatrixRecord>(
        lsKey("skillMatrix", p.companyId),
      );
      lsSet(
        lsKey("skillMatrix", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["skillMatrix", v.companyId] }),
  });
}
export function useDeleteSkillMatrixRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").SkillMatrixRecord>(
        lsKey("skillMatrix", p.companyId),
      );
      lsSet(
        lsKey("skillMatrix", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["skillMatrix", v.companyId] }),
  });
}

// ===== MTBF RECORDS =====
export function useGetMTBFRecords(companyId: string | null) {
  return useQuery<import("../types").MTBFRecord[]>({
    queryKey: ["mtbfRecords", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").MTBFRecord>(
        lsKey("mtbfRecords", companyId),
      );
    },
  });
}
export function useAddMTBFRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").MTBFRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").MTBFRecord>(
        lsKey("mtbfRecords", p.companyId),
      );
      lsSet(lsKey("mtbfRecords", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["mtbfRecords", v.companyId] }),
  });
}
export function useUpdateMTBFRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").MTBFRecord) => {
      const all = lsGet<import("../types").MTBFRecord>(
        lsKey("mtbfRecords", p.companyId),
      );
      lsSet(
        lsKey("mtbfRecords", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["mtbfRecords", v.companyId] }),
  });
}
export function useDeleteMTBFRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").MTBFRecord>(
        lsKey("mtbfRecords", p.companyId),
      );
      lsSet(
        lsKey("mtbfRecords", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["mtbfRecords", v.companyId] }),
  });
}

// ===== SHIFT REPORTS =====
export function useGetShiftReports(companyId: string | null) {
  return useQuery<import("../types").ShiftReportRecord[]>({
    queryKey: ["shiftReports", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").ShiftReportRecord>(
        lsKey("shiftReports", companyId),
      );
    },
  });
}
export function useAddShiftReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").ShiftReportRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").ShiftReportRecord>(
        lsKey("shiftReports", p.companyId),
      );
      lsSet(lsKey("shiftReports", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["shiftReports", v.companyId] }),
  });
}
export function useUpdateShiftReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").ShiftReportRecord) => {
      const all = lsGet<import("../types").ShiftReportRecord>(
        lsKey("shiftReports", p.companyId),
      );
      lsSet(
        lsKey("shiftReports", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["shiftReports", v.companyId] }),
  });
}
export function useDeleteShiftReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").ShiftReportRecord>(
        lsKey("shiftReports", p.companyId),
      );
      lsSet(
        lsKey("shiftReports", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["shiftReports", v.companyId] }),
  });
}

// ===== MAINTENANCE BUDGETS =====
export function useGetMaintenanceBudgets(companyId: string | null) {
  return useQuery<import("../types").MaintenanceBudgetRecord[]>({
    queryKey: ["maintenanceBudgets", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").MaintenanceBudgetRecord>(
        lsKey("maintenanceBudgets", companyId),
      );
    },
  });
}
export function useAddMaintenanceBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").MaintenanceBudgetRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").MaintenanceBudgetRecord>(
        lsKey("maintenanceBudgets", p.companyId),
      );
      lsSet(lsKey("maintenanceBudgets", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["maintenanceBudgets", v.companyId] }),
  });
}
export function useUpdateMaintenanceBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").MaintenanceBudgetRecord) => {
      const all = lsGet<import("../types").MaintenanceBudgetRecord>(
        lsKey("maintenanceBudgets", p.companyId),
      );
      lsSet(
        lsKey("maintenanceBudgets", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["maintenanceBudgets", v.companyId] }),
  });
}
export function useDeleteMaintenanceBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").MaintenanceBudgetRecord>(
        lsKey("maintenanceBudgets", p.companyId),
      );
      lsSet(
        lsKey("maintenanceBudgets", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["maintenanceBudgets", v.companyId] }),
  });
}

// ===== QC FORMS =====
export function useGetQCForms(companyId: string | null) {
  return useQuery<import("../types").QCFormRecord[]>({
    queryKey: ["qcForms", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").QCFormRecord>(
        lsKey("qcForms", companyId),
      );
    },
  });
}
export function useAddQCForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").QCFormRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").QCFormRecord>(
        lsKey("qcForms", p.companyId),
      );
      lsSet(lsKey("qcForms", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["qcForms", v.companyId] }),
  });
}
export function useUpdateQCForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").QCFormRecord) => {
      const all = lsGet<import("../types").QCFormRecord>(
        lsKey("qcForms", p.companyId),
      );
      lsSet(
        lsKey("qcForms", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["qcForms", v.companyId] }),
  });
}
export function useDeleteQCForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").QCFormRecord>(
        lsKey("qcForms", p.companyId),
      );
      lsSet(
        lsKey("qcForms", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["qcForms", v.companyId] }),
  });
}

// ===== FIELD AUDITS =====
export function useGetFieldAudits(companyId: string | null) {
  return useQuery<import("../types").FieldAuditRecord[]>({
    queryKey: ["fieldAudits", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").FieldAuditRecord>(
        lsKey("fieldAudits", companyId),
      );
    },
  });
}
export function useAddFieldAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").FieldAuditRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").FieldAuditRecord>(
        lsKey("fieldAudits", p.companyId),
      );
      lsSet(lsKey("fieldAudits", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["fieldAudits", v.companyId] }),
  });
}
export function useUpdateFieldAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").FieldAuditRecord) => {
      const all = lsGet<import("../types").FieldAuditRecord>(
        lsKey("fieldAudits", p.companyId),
      );
      lsSet(
        lsKey("fieldAudits", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["fieldAudits", v.companyId] }),
  });
}
export function useDeleteFieldAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").FieldAuditRecord>(
        lsKey("fieldAudits", p.companyId),
      );
      lsSet(
        lsKey("fieldAudits", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["fieldAudits", v.companyId] }),
  });
}

// ===== SATISFACTION SURVEYS =====
export function useGetSatisfactionSurveys(companyId: string | null) {
  return useQuery<import("../types").SatisfactionSurveyRecord[]>({
    queryKey: ["satisfactionSurveys", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").SatisfactionSurveyRecord>(
        lsKey("satisfactionSurveys", companyId),
      );
    },
  });
}
export function useAddSatisfactionSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").SatisfactionSurveyRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").SatisfactionSurveyRecord>(
        lsKey("satisfactionSurveys", p.companyId),
      );
      lsSet(lsKey("satisfactionSurveys", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["satisfactionSurveys", v.companyId] }),
  });
}
export function useUpdateSatisfactionSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").SatisfactionSurveyRecord) => {
      const all = lsGet<import("../types").SatisfactionSurveyRecord>(
        lsKey("satisfactionSurveys", p.companyId),
      );
      lsSet(
        lsKey("satisfactionSurveys", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["satisfactionSurveys", v.companyId] }),
  });
}
export function useDeleteSatisfactionSurvey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").SatisfactionSurveyRecord>(
        lsKey("satisfactionSurveys", p.companyId),
      );
      lsSet(
        lsKey("satisfactionSurveys", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["satisfactionSurveys", v.companyId] }),
  });
}

// ===== ELEC/MECH PROJECTS =====
export function useGetElecMechProjects(companyId: string | null) {
  return useQuery<import("../types").ElecMechProjectRecord[]>({
    queryKey: ["elecMechProjects", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").ElecMechProjectRecord>(
        lsKey("elecMechProjects", companyId),
      );
    },
  });
}
export function useAddElecMechProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").ElecMechProjectRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").ElecMechProjectRecord>(
        lsKey("elecMechProjects", p.companyId),
      );
      lsSet(lsKey("elecMechProjects", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["elecMechProjects", v.companyId] }),
  });
}
export function useUpdateElecMechProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").ElecMechProjectRecord) => {
      const all = lsGet<import("../types").ElecMechProjectRecord>(
        lsKey("elecMechProjects", p.companyId),
      );
      lsSet(
        lsKey("elecMechProjects", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["elecMechProjects", v.companyId] }),
  });
}
export function useDeleteElecMechProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").ElecMechProjectRecord>(
        lsKey("elecMechProjects", p.companyId),
      );
      lsSet(
        lsKey("elecMechProjects", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["elecMechProjects", v.companyId] }),
  });
}

// ===== GENERAL EXPENSES =====
export function useGetGeneralExpenses(companyId: string | null) {
  return useQuery<import("../types").GeneralExpenseRecord[]>({
    queryKey: ["generalExpenses", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").GeneralExpenseRecord>(
        lsKey("generalExpenses", companyId),
      );
    },
  });
}
export function useAddGeneralExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").GeneralExpenseRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").GeneralExpenseRecord>(
        lsKey("generalExpenses", p.companyId),
      );
      lsSet(lsKey("generalExpenses", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["generalExpenses", v.companyId] }),
  });
}
export function useUpdateGeneralExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").GeneralExpenseRecord) => {
      const all = lsGet<import("../types").GeneralExpenseRecord>(
        lsKey("generalExpenses", p.companyId),
      );
      lsSet(
        lsKey("generalExpenses", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["generalExpenses", v.companyId] }),
  });
}
export function useDeleteGeneralExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").GeneralExpenseRecord>(
        lsKey("generalExpenses", p.companyId),
      );
      lsSet(
        lsKey("generalExpenses", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["generalExpenses", v.companyId] }),
  });
}

// ===== MATERIAL CERTS =====
export function useGetMaterialCerts(companyId: string | null) {
  return useQuery<import("../types").MaterialCertRecord[]>({
    queryKey: ["materialCerts", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").MaterialCertRecord>(
        lsKey("materialCerts", companyId),
      );
    },
  });
}
export function useAddMaterialCert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").MaterialCertRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").MaterialCertRecord>(
        lsKey("materialCerts", p.companyId),
      );
      lsSet(lsKey("materialCerts", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["materialCerts", v.companyId] }),
  });
}
export function useUpdateMaterialCert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").MaterialCertRecord) => {
      const all = lsGet<import("../types").MaterialCertRecord>(
        lsKey("materialCerts", p.companyId),
      );
      lsSet(
        lsKey("materialCerts", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["materialCerts", v.companyId] }),
  });
}
export function useDeleteMaterialCert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").MaterialCertRecord>(
        lsKey("materialCerts", p.companyId),
      );
      lsSet(
        lsKey("materialCerts", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["materialCerts", v.companyId] }),
  });
}

// ===== PRODUCTION QUALITY =====
export function useGetProductionQuality(companyId: string | null) {
  return useQuery<import("../types").ProductionQualityRecord[]>({
    queryKey: ["productionQuality", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").ProductionQualityRecord>(
        lsKey("productionQuality", companyId),
      );
    },
  });
}
export function useAddProductionQuality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").ProductionQualityRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").ProductionQualityRecord>(
        lsKey("productionQuality", p.companyId),
      );
      lsSet(lsKey("productionQuality", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["productionQuality", v.companyId] }),
  });
}
export function useUpdateProductionQuality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").ProductionQualityRecord) => {
      const all = lsGet<import("../types").ProductionQualityRecord>(
        lsKey("productionQuality", p.companyId),
      );
      lsSet(
        lsKey("productionQuality", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["productionQuality", v.companyId] }),
  });
}
export function useDeleteProductionQuality() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").ProductionQualityRecord>(
        lsKey("productionQuality", p.companyId),
      );
      lsSet(
        lsKey("productionQuality", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["productionQuality", v.companyId] }),
  });
}

// ===== WASTE DISPOSALS =====
export function useGetWasteDisposals(companyId: string | null) {
  return useQuery<import("../types").WasteDisposalRecord[]>({
    queryKey: ["wasteDisposals", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").WasteDisposalRecord>(
        lsKey("wasteDisposals", companyId),
      );
    },
  });
}
export function useAddWasteDisposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").WasteDisposalRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").WasteDisposalRecord>(
        lsKey("wasteDisposals", p.companyId),
      );
      lsSet(lsKey("wasteDisposals", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["wasteDisposals", v.companyId] }),
  });
}
export function useUpdateWasteDisposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").WasteDisposalRecord) => {
      const all = lsGet<import("../types").WasteDisposalRecord>(
        lsKey("wasteDisposals", p.companyId),
      );
      lsSet(
        lsKey("wasteDisposals", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["wasteDisposals", v.companyId] }),
  });
}
export function useDeleteWasteDisposal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").WasteDisposalRecord>(
        lsKey("wasteDisposals", p.companyId),
      );
      lsSet(
        lsKey("wasteDisposals", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["wasteDisposals", v.companyId] }),
  });
}

// ===== PERSONNEL AUTHS =====
export function useGetPersonnelAuths(companyId: string | null) {
  return useQuery<import("../types").PersonnelAuthRecord[]>({
    queryKey: ["personnelAuths", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").PersonnelAuthRecord>(
        lsKey("personnelAuths", companyId),
      );
    },
  });
}
export function useAddPersonnelAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").PersonnelAuthRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").PersonnelAuthRecord>(
        lsKey("personnelAuths", p.companyId),
      );
      lsSet(lsKey("personnelAuths", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["personnelAuths", v.companyId] }),
  });
}
export function useUpdatePersonnelAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").PersonnelAuthRecord) => {
      const all = lsGet<import("../types").PersonnelAuthRecord>(
        lsKey("personnelAuths", p.companyId),
      );
      lsSet(
        lsKey("personnelAuths", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["personnelAuths", v.companyId] }),
  });
}
export function useDeletePersonnelAuth() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").PersonnelAuthRecord>(
        lsKey("personnelAuths", p.companyId),
      );
      lsSet(
        lsKey("personnelAuths", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["personnelAuths", v.companyId] }),
  });
}

// ===== FACILITY DAMAGES =====
export function useGetFacilityDamages(companyId: string | null) {
  return useQuery<import("../types").FacilityDamageRecord[]>({
    queryKey: ["facilityDamages", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").FacilityDamageRecord>(
        lsKey("facilityDamages", companyId),
      );
    },
  });
}
export function useAddFacilityDamage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").FacilityDamageRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").FacilityDamageRecord>(
        lsKey("facilityDamages", p.companyId),
      );
      lsSet(lsKey("facilityDamages", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["facilityDamages", v.companyId] }),
  });
}
export function useUpdateFacilityDamage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").FacilityDamageRecord) => {
      const all = lsGet<import("../types").FacilityDamageRecord>(
        lsKey("facilityDamages", p.companyId),
      );
      lsSet(
        lsKey("facilityDamages", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["facilityDamages", v.companyId] }),
  });
}
export function useDeleteFacilityDamage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").FacilityDamageRecord>(
        lsKey("facilityDamages", p.companyId),
      );
      lsSet(
        lsKey("facilityDamages", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["facilityDamages", v.companyId] }),
  });
}

// ===== PROJECT CHANGES =====
export function useGetProjectChanges(companyId: string | null) {
  return useQuery<import("../types").ProjectChangeRecord[]>({
    queryKey: ["projectChanges", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").ProjectChangeRecord>(
        lsKey("projectChanges", companyId),
      );
    },
  });
}
export function useAddProjectChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").ProjectChangeRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").ProjectChangeRecord>(
        lsKey("projectChanges", p.companyId),
      );
      lsSet(lsKey("projectChanges", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["projectChanges", v.companyId] }),
  });
}
export function useUpdateProjectChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").ProjectChangeRecord) => {
      const all = lsGet<import("../types").ProjectChangeRecord>(
        lsKey("projectChanges", p.companyId),
      );
      lsSet(
        lsKey("projectChanges", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["projectChanges", v.companyId] }),
  });
}
export function useDeleteProjectChange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").ProjectChangeRecord>(
        lsKey("projectChanges", p.companyId),
      );
      lsSet(
        lsKey("projectChanges", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["projectChanges", v.companyId] }),
  });
}

// ===== DOKÜMAN REVİZYON TAKİBİ =====
export function useGetDocRevisions(companyId: string | null) {
  return useQuery<import("../types").DocRevisionRecord[]>({
    queryKey: ["docRevisions", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").DocRevisionRecord>(
        lsKey("docRevisions", companyId),
      );
    },
  });
}
export function useAddDocRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").DocRevisionRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").DocRevisionRecord>(
        lsKey("docRevisions", p.companyId),
      );
      lsSet(lsKey("docRevisions", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["docRevisions", v.companyId] }),
  });
}
export function useUpdateDocRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").DocRevisionRecord) => {
      const all = lsGet<import("../types").DocRevisionRecord>(
        lsKey("docRevisions", p.companyId),
      );
      lsSet(
        lsKey("docRevisions", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["docRevisions", v.companyId] }),
  });
}
export function useDeleteDocRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").DocRevisionRecord>(
        lsKey("docRevisions", p.companyId),
      );
      lsSet(
        lsKey("docRevisions", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["docRevisions", v.companyId] }),
  });
}

// ===== EKİPMAN ÖMÜR TAKİBİ =====
export function useGetEquipmentLifecycles(companyId: string | null) {
  return useQuery<import("../types").EquipmentLifecycleRecord[]>({
    queryKey: ["equipmentLifecycles", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").EquipmentLifecycleRecord>(
        lsKey("equipmentLifecycles", companyId),
      );
    },
  });
}
export function useAddEquipmentLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").EquipmentLifecycleRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").EquipmentLifecycleRecord>(
        lsKey("equipmentLifecycles", p.companyId),
      );
      lsSet(lsKey("equipmentLifecycles", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["equipmentLifecycles", v.companyId] }),
  });
}
export function useUpdateEquipmentLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").EquipmentLifecycleRecord) => {
      const all = lsGet<import("../types").EquipmentLifecycleRecord>(
        lsKey("equipmentLifecycles", p.companyId),
      );
      lsSet(
        lsKey("equipmentLifecycles", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["equipmentLifecycles", v.companyId] }),
  });
}
export function useDeleteEquipmentLifecycle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").EquipmentLifecycleRecord>(
        lsKey("equipmentLifecycles", p.companyId),
      );
      lsSet(
        lsKey("equipmentLifecycles", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["equipmentLifecycles", v.companyId] }),
  });
}

// ===== PERSONEL GÖREV DEVRİ =====
export function useGetPersonnelHandovers(companyId: string | null) {
  return useQuery<import("../types").PersonnelHandoverRecord[]>({
    queryKey: ["personnelHandovers", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").PersonnelHandoverRecord>(
        lsKey("personnelHandovers", companyId),
      );
    },
  });
}
export function useAddPersonnelHandover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<import("../types").PersonnelHandoverRecord, "id" | "createdAt">,
    ) => {
      const all = lsGet<import("../types").PersonnelHandoverRecord>(
        lsKey("personnelHandovers", p.companyId),
      );
      lsSet(lsKey("personnelHandovers", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["personnelHandovers", v.companyId] }),
  });
}
export function useUpdatePersonnelHandover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").PersonnelHandoverRecord) => {
      const all = lsGet<import("../types").PersonnelHandoverRecord>(
        lsKey("personnelHandovers", p.companyId),
      );
      lsSet(
        lsKey("personnelHandovers", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["personnelHandovers", v.companyId] }),
  });
}
export function useDeletePersonnelHandover() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").PersonnelHandoverRecord>(
        lsKey("personnelHandovers", p.companyId),
      );
      lsSet(
        lsKey("personnelHandovers", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({ queryKey: ["personnelHandovers", v.companyId] }),
  });
}

// ===== TESİS BAKIM PLANI =====
export function useGetFacilityMaintenancePlans(companyId: string | null) {
  return useQuery<import("../types").FacilityMaintenancePlanRecord[]>({
    queryKey: ["facilityMaintenancePlans", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return [];
      return lsGet<import("../types").FacilityMaintenancePlanRecord>(
        lsKey("facilityMaintenancePlans", companyId),
      );
    },
  });
}
export function useAddFacilityMaintenancePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      p: Omit<
        import("../types").FacilityMaintenancePlanRecord,
        "id" | "createdAt"
      >,
    ) => {
      const all = lsGet<import("../types").FacilityMaintenancePlanRecord>(
        lsKey("facilityMaintenancePlans", p.companyId),
      );
      lsSet(lsKey("facilityMaintenancePlans", p.companyId), [
        ...all,
        { ...p, id: crypto.randomUUID(), createdAt: Date.now() },
      ]);
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["facilityMaintenancePlans", v.companyId],
      }),
  });
}
export function useUpdateFacilityMaintenancePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: import("../types").FacilityMaintenancePlanRecord) => {
      const all = lsGet<import("../types").FacilityMaintenancePlanRecord>(
        lsKey("facilityMaintenancePlans", p.companyId),
      );
      lsSet(
        lsKey("facilityMaintenancePlans", p.companyId),
        all.map((x) => (x.id === p.id ? p : x)),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["facilityMaintenancePlans", v.companyId],
      }),
  });
}
export function useDeleteFacilityMaintenancePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; companyId: string }) => {
      const all = lsGet<import("../types").FacilityMaintenancePlanRecord>(
        lsKey("facilityMaintenancePlans", p.companyId),
      );
      lsSet(
        lsKey("facilityMaintenancePlans", p.companyId),
        all.filter((x) => x.id !== p.id),
      );
    },
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: ["facilityMaintenancePlans", v.companyId],
      }),
  });
}
