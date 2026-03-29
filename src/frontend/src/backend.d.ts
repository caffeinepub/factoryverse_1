import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Machine {
    status: string;
    name: string;
    createdAt: Time;
    serialNumber: string;
    notes: string;
    location: string;
    machineType: string;
    lastMaintenanceDate?: Time;
    companyId: string;
}
export interface Company {
    mode: string;
    name: string;
    createdAt: Time;
    adminCode: string;
}
export type Time = bigint;
export interface UserProfile {
    associatedCode?: string;
    name: string;
}
export interface Personnel {
    loginCode: string;
    name: string;
    createdAt: Time;
    role: string;
    isActive: boolean;
    inviteCode: string;
    companyId?: string;
}
export interface Project {
    id: string;
    companyId: string;
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
    progress: bigint;
    createdAt: Time;
}
export interface MaintenanceRecord {
    id: string;
    companyId: string;
    machineId: string;
    machineName: string;
    maintenanceType: string;
    description: string;
    scheduledDate: string;
    completedDate: string;
    status: string;
    notes: string;
    createdAt: Time;
}
export interface Supplier {
    id: string;
    companyId: string;
    name: string;
    category: string;
    contactPerson: string;
    phone: string;
    email: string;
    status: string;
    notes: string;
    createdAt: Time;
}
export interface SafetyIncident {
    id: string;
    companyId: string;
    title: string;
    incidentType: string;
    severity: string;
    date: string;
    location: string;
    description: string;
    reportedBy: string;
    status: string;
    actions: string;
    createdAt: Time;
}
export interface BudgetItem {
    id: string;
    companyId: string;
    name: string;
    category: string;
    itemType: string;
    plannedAmount: string;
    actualAmount: string;
    projectId: string;
    date: string;
    notes: string;
    status: string;
    createdAt: Time;
}
export interface Document {
    id: string;
    companyId: string;
    name: string;
    category: string;
    documentType: string;
    referenceNumber: string;
    date: string;
    description: string;
    linkedMachineId: string;
    linkedProjectId: string;
    status: string;
    createdAt: Time;
}
export interface InventoryItem {
    id: string;
    companyId: string;
    name: string;
    category: string;
    unit: string;
    currentStock: bigint;
    minimumStock: bigint;
    location: string;
    supplierName: string;
    notes: string;
    status: string;
    createdAt: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMachine(adminCode: string, name: string, machineType: string, serialNumber: string, location: string, notes: string): Promise<Machine>;
    addPersonnelToCompany(adminCode: string, inviteCode: string, role: string): Promise<Personnel>;
    addProject(adminCode: string, name: string, description: string, startDate: string, endDate: string): Promise<Project>;
    addMaintenanceRecord(adminCode: string, machineId: string, machineName: string, maintenanceType: string, description: string, scheduledDate: string, notes: string): Promise<MaintenanceRecord>;
    addSupplier(adminCode: string, name: string, category: string, contactPerson: string, phone: string, email: string, notes: string): Promise<Supplier>;
    addSafetyIncident(adminCode: string, title: string, incidentType: string, severity: string, date: string, location: string, description: string, reportedBy: string, actions: string): Promise<SafetyIncident>;
    addBudgetItem(adminCode: string, name: string, category: string, itemType: string, plannedAmount: string, actualAmount: string, projectId: string, date: string, notes: string): Promise<BudgetItem>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMachine(adminCode: string, machineId: string): Promise<boolean>;
    deleteProject(adminCode: string, projectId: string): Promise<boolean>;
    deleteMaintenanceRecord(adminCode: string, recordId: string): Promise<boolean>;
    deleteSupplier(adminCode: string, supplierId: string): Promise<boolean>;
    deleteSafetyIncident(adminCode: string, incidentId: string): Promise<boolean>;
    deleteBudgetItem(adminCode: string, itemId: string): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompanyInfo(userCode: string): Promise<Company | null>;
    getCompanyPersonnel(adminCode: string): Promise<Array<Personnel>>;
    getDashboardStats(userCode: string): Promise<string>;
    getMachineById(userCode: string, machineId: string): Promise<Machine | null>;
    getMachines(userCode: string): Promise<Array<Machine>>;
    getMaintenanceRecords(userCode: string): Promise<Array<MaintenanceRecord>>;
    getProjects(userCode: string): Promise<Array<Project>>;
    getSuppliers(userCode: string): Promise<Array<Supplier>>;
    getSafetyIncidents(userCode: string): Promise<Array<SafetyIncident>>;
    getBudgetItems(userCode: string): Promise<Array<BudgetItem>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerCompany(name: string, mode: string): Promise<Company>;
    removePersonnelFromCompany(adminCode: string, personnelId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selfRegisterPersonnel(name: string): Promise<Personnel>;
    updateMachine(adminCode: string, machineId: string, name: string, machineType: string, serialNumber: string, location: string, notes: string): Promise<Machine>;
    updateMachineStatus(userCode: string, machineId: string, status: string): Promise<Machine>;
    updateMaintenanceRecord(adminCode: string, recordId: string, description: string, scheduledDate: string, completedDate: string, status: string, notes: string): Promise<MaintenanceRecord>;
    updatePersonnelRole(adminCode: string, personnelId: string, role: string): Promise<Personnel>;
    updateProject(adminCode: string, projectId: string, name: string, description: string, startDate: string, endDate: string, status: string, progress: bigint): Promise<Project>;
    updateSupplier(adminCode: string, supplierId: string, name: string, category: string, contactPerson: string, phone: string, email: string, status: string, notes: string): Promise<Supplier>;
    updateSafetyIncident(adminCode: string, incidentId: string, title: string, incidentType: string, severity: string, date: string, location: string, description: string, reportedBy: string, status: string, actions: string): Promise<SafetyIncident>;
    updateBudgetItem(adminCode: string, itemId: string, name: string, category: string, itemType: string, plannedAmount: string, actualAmount: string, projectId: string, date: string, notes: string, status: string): Promise<BudgetItem>;
    addDocument(adminCode: string, name: string, category: string, documentType: string, referenceNumber: string, date: string, description: string, linkedMachineId: string, linkedProjectId: string): Promise<Document>;
    addInventoryItem(adminCode: string, name: string, category: string, unit: string, currentStock: bigint, minimumStock: bigint, location: string, supplierName: string, notes: string): Promise<InventoryItem>;
    deleteDocument(adminCode: string, docId: string): Promise<boolean>;
    deleteInventoryItem(adminCode: string, itemId: string): Promise<boolean>;
    getDocuments(userCode: string): Promise<Array<Document>>;
    getInventoryItems(userCode: string): Promise<Array<InventoryItem>>;
    updateDocument(adminCode: string, docId: string, name: string, category: string, documentType: string, referenceNumber: string, date: string, description: string, linkedMachineId: string, linkedProjectId: string, status: string): Promise<Document>;
    updateInventoryItem(adminCode: string, itemId: string, name: string, category: string, unit: string, currentStock: bigint, minimumStock: bigint, location: string, supplierName: string, notes: string): Promise<InventoryItem>;
}