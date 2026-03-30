export interface Project {
  id: string;
  companyId: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: bigint;
  createdAt: bigint;
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
  createdAt: bigint;
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
  createdAt: bigint;
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
  createdAt: bigint;
}

export interface BudgetItem {
  id: string;
  companyId: string;
  name: string;
  category: string;
  itemType: string;
  plannedAmount: number;
  actualAmount: number;
  projectId: string;
  date: string;
  notes: string;
  status: string;
  createdAt: bigint;
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
  createdAt: bigint;
}

export interface InventoryItem {
  id: string;
  companyId: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  location: string;
  supplierName: string;
  notes: string;
  status: string;
  createdAt: bigint;
}

export interface Alert {
  id: string;
  companyId: string;
  title: string;
  description: string;
  alertType: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: bigint;
}

export interface Task {
  id: string;
  companyId: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: bigint;
}

export interface LeaveRequest {
  id: string;
  companyId: string;
  personnelCode: string;
  personnelName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  reviewedBy: string;
  reviewNote: string;
  createdAt: bigint;
}

export interface Shift {
  id: string;
  companyId: string;
  title: string;
  shiftType: string;
  date: string;
  startTime: string;
  endTime: string;
  assignedPersonnel: string;
  status: string;
  notes: string;
  createdAt: bigint;
}

export interface TrainingRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface QualityCheck {
  id: string;
  companyId: string;
  title: string;
  checkType: string;
  machineId: string;
  machineName: string;
  inspector: string;
  checkDate: string;
  status: string;
  score: string;
  notes: string;
  createdAt: bigint;
}

export interface VisitorEntry {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface FaultReport {
  id: string;
  companyId: string;
  machineId: string;
  machineName: string;
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
  createdAt: bigint;
}

export interface WorkOrder {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface Asset {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface PerformanceRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface EnergyRecord {
  id: string;
  companyId: string;
  energyType: string;
  period: string;
  location: string;
  unit: string;
  consumption: string;
  cost: string;
  notes: string;
  createdAt: bigint;
}

export interface Contract {
  id: string;
  companyId: string;
  title: string;
  counterparty: string;
  contractType: string;
  startDate: string;
  endDate: string;
  value: string;
  status: string;
  responsible: string;
  notes: string;
  createdAt: bigint;
}

export interface WasteRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface AuditRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface RiskRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface SupplyChainRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface HRRecord {
  id: string;
  companyId: string;
  name: string;
  department: string;
  position: string;
  employmentType: string;
  startDate: string;
  salary: string;
  status: string;
  notes: string;
  createdAt: bigint;
}

export interface CostAnalysisRecord {
  id: string;
  companyId: string;
  projectName: string;
  costCategory: string;
  description: string;
  plannedAmount: string;
  actualAmount: string;
  date: string;
  responsible: string;
  status: string;
  notes: string;
  createdAt: bigint;
}

export interface MaintenanceCalendarRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface SupplierEvalRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface CapacityRecord {
  id: string;
  companyId: string;
  resourceName: string;
  resourceType: string;
  totalCapacity: string;
  usedCapacity: string;
  unit: string;
  period: string;
  responsible: string;
  status: string;
  notes: string;
  createdAt: bigint;
}

export interface CalibrationRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface ProductionRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface ChemicalRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface MoldRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface StockCountRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface VehicleRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface ComplaintRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface MaintenanceCostRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface TrainingProgramRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface SafetyIncidentRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface BudgetRevisionRecord {
  id: string;
  companyId: string;
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
  createdAt: bigint;
}

export interface ActionPlan {
  id: string;
  companyId: string;
  title: string;
  actionType: string;
  priority: string;
  responsiblePerson: string;
  department: string;
  dueDate: string;
  completionDate: string;
  linkedIssue: string;
  description: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface PurchaseRequest {
  id: string;
  companyId: string;
  itemName: string;
  quantity: string;
  unit: string;
  estimatedCost: string;
  currency: string;
  requestedBy: string;
  department: string;
  requestDate: string;
  neededByDate: string;
  supplier: string;
  category: string;
  justification: string;
  status: string;
  approvedBy: string;
  approvalDate: string;
  notes: string;
  createdAt: number;
}

export interface AbsenceRecord {
  id: string;
  companyId: string;
  employeeName: string;
  department: string;
  absenceType: string;
  startDate: string;
  endDate: string;
  days: string;
  reason: string;
  approvedBy: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface Milestone {
  id: string;
  companyId: string;
  projectName: string;
  milestoneName: string;
  description: string;
  plannedDate: string;
  actualDate: string;
  completionPercent: string;
  deliverables: string;
  assignedTo: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface ContactEntry {
  id: string;
  companyId: string;
  name: string;
  company: string;
  contactType: string;
  department: string;
  role: string;
  phone: string;
  email: string;
  mobile: string;
  address: string;
  notes: string;
  createdAt: number;
}

export interface SopEntry {
  id: string;
  companyId: string;
  title: string;
  category: string;
  documentNumber: string;
  revisionNumber: string;
  effectiveDate: string;
  expiryDate: string;
  owner: string;
  department: string;
  description: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface StaffingPlan {
  id: string;
  companyId: string;
  department: string;
  position: string;
  requiredCount: string;
  currentCount: string;
  openPositions: string;
  employmentType: string;
  priority: string;
  plannedDate: string;
  recruiter: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface SubcontractorJob {
  id: string;
  companyId: string;
  jobTitle: string;
  subcontractorName: string;
  contactPerson: string;
  startDate: string;
  endDate: string;
  contractValue: string;
  currency: string;
  scope: string;
  location: string;
  supervisor: string;
  completionPercent: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface InsurancePolicy {
  id: string;
  companyId: string;
  policyName: string;
  policyNumber: string;
  insuranceCompany: string;
  insuranceType: string;
  coverageAmount: string;
  currency: string;
  premium: string;
  startDate: string;
  endDate: string;
  contactPerson: string;
  description: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface EnergyEfficiencyTarget {
  id: string;
  companyId: string;
  targetName: string;
  energyType: string;
  baselineValue: string;
  targetValue: string;
  currentValue: string;
  unit: string;
  year: string;
  period: string;
  responsible: string;
  measures: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface EquipmentRental {
  id: string;
  companyId: string;
  equipmentName: string;
  supplier: string;
  startDate: string;
  endDate: string;
  dailyRate: string;
  currency: string;
  responsible: string;
  location: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface JobApplication {
  id: string;
  companyId: string;
  positionName: string;
  applicantName: string;
  applicationDate: string;
  source: string;
  department: string;
  status: string;
  interviewDate: string;
  interviewer: string;
  notes: string;
  createdAt: number;
}

export interface WarrantyRecord {
  id: string;
  companyId: string;
  itemName: string;
  brand: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyStartDate: string;
  warrantyEndDate: string;
  supplier: string;
  warrantyType: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface ProjectRiskItem {
  id: string;
  companyId: string;
  riskTitle: string;
  projectName: string;
  riskCategory: string;
  probability: string;
  impact: string;
  mitigationPlan: string;
  owner: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface EquipmentMaintenanceHistory {
  id: string;
  companyId: string;
  equipmentName: string;
  equipmentCode: string;
  maintenanceType: string;
  maintenanceDate: string;
  performedBy: string;
  duration: string;
  cost: string;
  partsReplaced: string;
  description: string;
  nextMaintenanceDate: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface EmployeePerfReview {
  id: string;
  companyId: string;
  employeeName: string;
  department: string;
  position: string;
  reviewPeriod: string;
  reviewDate: string;
  reviewer: string;
  targetScore: string;
  actualScore: string;
  technicalScore: string;
  behaviorScore: string;
  teamworkScore: string;
  strengths: string;
  improvements: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface SupplierOrder {
  id: string;
  companyId: string;
  orderNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery: string;
  itemDescription: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  currency: string;
  totalAmount: string;
  responsiblePerson: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface InspectionRecord {
  id: string;
  companyId: string;
  inspectionTitle: string;
  inspectionType: string;
  location: string;
  inspectionDate: string;
  inspector: string;
  scope: string;
  findings: string;
  riskLevel: string;
  correctiveActions: string;
  deadline: string;
  responsiblePerson: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface LeaseRecord {
  id: string;
  companyId: string;
  propertyName: string;
  propertyType: string;
  landlord: string;
  landlordContact: string;
  address: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: string;
  currency: string;
  depositAmount: string;
  paymentDueDay: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface SkillMatrixRecord {
  id: string;
  companyId: string;
  employeeName: string;
  department: string;
  position: string;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: string;
  targetLevel: string;
  lastAssessmentDate: string;
  assessor: string;
  notes: string;
  createdAt: number;
}

export interface MTBFRecord {
  id: string;
  companyId: string;
  equipmentName: string;
  equipmentCode: string;
  department: string;
  failureDate: string;
  failureTime: string;
  restoredDate: string;
  restoredTime: string;
  failureDescription: string;
  rootCause: string;
  repairDuration: string;
  responsiblePerson: string;
  downtimeCost: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface ShiftReportRecord {
  id: string;
  companyId: string;
  reportDate: string;
  shiftType: string;
  department: string;
  supervisor: string;
  plannedProduction: string;
  actualProduction: string;
  unit: string;
  scrapQuantity: string;
  workerCount: string;
  machineUtilization: string;
  issues: string;
  actions: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface MaintenanceBudgetRecord {
  id: string;
  companyId: string;
  budgetYear: string;
  period: string;
  department: string;
  category: string;
  description: string;
  plannedAmount: string;
  approvedAmount: string;
  spentAmount: string;
  currency: string;
  status: string;
  approvedBy: string;
  notes: string;
  createdAt: number;
}

export interface QCFormRecord {
  id: string;
  companyId: string;
  formDate: string;
  productName: string;
  productionLine: string;
  inspector: string;
  inspectionType: string;
  totalItems: string;
  passedItems: string;
  failedItems: string;
  defectCount: string;
  defectDescription: string;
  status: string;
  actionRequired: string;
  notes: string;
  createdAt: number;
}

export interface FieldAuditRecord {
  id: string;
  companyId: string;
  auditDate: string;
  location: string;
  auditType: string;
  auditor: string;
  department: string;
  checklistScore: string;
  maxScore: string;
  nonConformityCount: string;
  riskLevel: string;
  findings: string;
  correctiveActionDeadline: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface SatisfactionSurveyRecord {
  id: string;
  companyId: string;
  surveyPeriod: string;
  surveyDate: string;
  department: string;
  totalEmployees: string;
  respondents: string;
  managementScore: string;
  workEnvironmentScore: string;
  careerScore: string;
  compensationScore: string;
  overallScore: string;
  topStrength: string;
  topWeakness: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface ElecMechProjectRecord {
  id: string;
  companyId: string;
  projectCode: string;
  projectName: string;
  projectType: string;
  area: string;
  contractor: string;
  startDate: string;
  endDate: string;
  budget: string;
  currency: string;
  progress: string;
  responsible: string;
  status: string;
  description: string;
  notes: string;
  createdAt: number;
}

export interface GeneralExpenseRecord {
  id: string;
  companyId: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  approvedBy: string;
  invoiceNumber: string;
  department: string;
  paymentMethod: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface MaterialCertRecord {
  id: string;
  companyId: string;
  materialName: string;
  materialCode: string;
  supplier: string;
  certType: string;
  certNumber: string;
  issueDate: string;
  expiryDate: string;
  standard: string;
  issuedBy: string;
  status: string;
  description: string;
  notes: string;
  createdAt: number;
}

export interface ProductionQualityRecord {
  id: string;
  companyId: string;
  reportDate: string;
  productionLine: string;
  productName: string;
  shift: string;
  totalProduced: string;
  accepted: string;
  rejected: string;
  reworked: string;
  defectType: string;
  defectCause: string;
  responsible: string;
  corrective: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface WasteDisposalRecord {
  id: string;
  companyId: string;
  disposalDate: string;
  wasteType: string;
  disposalMethod: string;
  quantity: string;
  unit: string;
  vendor: string;
  regulatoryCode: string;
  cost: string;
  currency: string;
  responsible: string;
  complianceStatus: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface PersonnelAuthRecord {
  id: string;
  companyId: string;
  employeeName: string;
  department: string;
  authType: string;
  scope: string;
  grantedBy: string;
  grantDate: string;
  expiryDate: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface FacilityDamageRecord {
  id: string;
  companyId: string;
  damageDate: string;
  location: string;
  damageType: string;
  severity: string;
  description: string;
  reportedBy: string;
  estimatedCost: string;
  currency: string;
  repairStatus: string;
  completionDate: string;
  responsible: string;
  notes: string;
  createdAt: number;
}

export interface ProjectChangeRecord {
  id: string;
  companyId: string;
  projectName: string;
  changeRequestNo: string;
  changeType: string;
  description: string;
  requester: string;
  requestDate: string;
  impactScope: string;
  impactCost: string;
  impactTime: string;
  priority: string;
  approvalStatus: string;
  approvedBy: string;
  implementationDate: string;
  notes: string;
  createdAt: number;
}

export interface DocRevisionRecord {
  id: string;
  companyId: string;
  docTitle: string;
  docCode: string;
  revisionNo: string;
  revisionDate: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
  changesSummary: string;
  department: string;
  category: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface EquipmentLifecycleRecord {
  id: string;
  companyId: string;
  equipmentName: string;
  equipmentCode: string;
  brand: string;
  model: string;
  location: string;
  installationDate: string;
  expectedLifeYears: string;
  endOfLifeDate: string;
  lastMaintenanceDate: string;
  purchaseCost: string;
  currency: string;
  replacementCost: string;
  responsible: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface PersonnelHandoverRecord {
  id: string;
  companyId: string;
  handoverDate: string;
  leavingEmployee: string;
  leavingPosition: string;
  receivingEmployee: string;
  receivingPosition: string;
  department: string;
  handoverType: string;
  tasksSummary: string;
  pendingTasks: string;
  keyContacts: string;
  handoverDocs: string;
  completionDate: string;
  status: string;
  notes: string;
  createdAt: number;
}

export interface FacilityMaintenancePlanRecord {
  id: string;
  companyId: string;
  facilityArea: string;
  maintenanceType: string;
  description: string;
  frequency: string;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  estimatedDuration: string;
  contractor: string;
  estimatedCost: string;
  currency: string;
  responsible: string;
  priority: string;
  status: string;
  notes: string;
  createdAt: number;
}
