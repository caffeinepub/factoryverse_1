import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Company, Machine, Personnel } from "../backend";
import type {
  BudgetItem,
  CalibrationRecord,
  CapacityRecord,
  ChemicalRecord,
  ComplaintRecord,
  MaintenanceRecord,
  MoldRecord,
  ProductionRecord,
  Project,
  SafetyIncident,
  StockCountRecord,
  Supplier,
  VehicleRecord,
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
