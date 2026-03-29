import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  module Principal {
    public func compare(x : Principal, y : Principal) : { #less; #equal; #greater } {
      Text.compare(x.toText(), y.toText());
    };
    public func toText(x : Principal) : Text {
      x.toText();
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    associatedCode : ?Text;
  };

  stable var userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ===== TYPES =====
  type Company = {
    name : Text;
    mode : Text;
    adminCode : Text;
    createdAt : Time.Time;
  };

  type Personnel = {
    name : Text;
    role : Text;
    loginCode : Text;
    inviteCode : Text;
    isActive : Bool;
    companyId : ?Text;
    createdAt : Time.Time;
  };

  type Machine = {
    companyId : Text;
    name : Text;
    machineType : Text;
    serialNumber : Text;
    status : Text;
    location : Text;
    notes : Text;
    createdAt : Time.Time;
    lastMaintenanceDate : ?Time.Time;
  };

  type Project = {
    id : Text;
    companyId : Text;
    name : Text;
    description : Text;
    status : Text;
    startDate : Text;
    endDate : Text;
    progress : Nat;
    createdAt : Time.Time;
  };

  type MaintenanceRecord = {
    id : Text;
    companyId : Text;
    machineId : Text;
    machineName : Text;
    maintenanceType : Text;
    description : Text;
    scheduledDate : Text;
    completedDate : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type Supplier = {
    id : Text;
    companyId : Text;
    name : Text;
    category : Text;
    contactPerson : Text;
    phone : Text;
    email : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type SafetyIncident = {
    id : Text;
    companyId : Text;
    title : Text;
    incidentType : Text;
    severity : Text;
    date : Text;
    location : Text;
    description : Text;
    reportedBy : Text;
    status : Text;
    actions : Text;
    createdAt : Time.Time;
  };

  type BudgetItem = {
    id : Text;
    companyId : Text;
    name : Text;
    category : Text;
    itemType : Text;
    plannedAmount : Text;
    actualAmount : Text;
    projectId : Text;
    date : Text;
    notes : Text;
    status : Text;
    createdAt : Time.Time;
  };

  type Document = {
    id : Text;
    companyId : Text;
    name : Text;
    category : Text;
    documentType : Text;
    referenceNumber : Text;
    date : Text;
    description : Text;
    linkedMachineId : Text;
    linkedProjectId : Text;
    status : Text;
    createdAt : Time.Time;
  };

  type InventoryItem = {
    id : Text;
    companyId : Text;
    name : Text;
    category : Text;
    unit : Text;
    currentStock : Nat;
    minimumStock : Nat;
    location : Text;
    supplierName : Text;
    notes : Text;
    status : Text;
    createdAt : Time.Time;
  };

  type Alert = {
    id : Text;
    companyId : Text;
    title : Text;
    description : Text;
    alertType : Text;
    priority : Text;
    status : Text;
    dueDate : Text;
    createdAt : Time.Time;
  };

  type Task = {
    id : Text;
    companyId : Text;
    projectId : Text;
    title : Text;
    description : Text;
    assignedTo : Text;
    priority : Text;
    status : Text;
    dueDate : Text;
    createdAt : Time.Time;
  };

  type LeaveRequest = {
    id : Text;
    companyId : Text;
    personnelCode : Text;
    personnelName : Text;
    leaveType : Text;
    startDate : Text;
    endDate : Text;
    reason : Text;
    status : Text;
    reviewedBy : Text;
    reviewNote : Text;
    createdAt : Time.Time;
  };

  // ===== STORAGE =====
  stable var companies = Map.empty<Text, Company>();
  stable var personnel = Map.empty<Text, Personnel>();
  stable var machines = Map.empty<Text, Machine>();
  stable var projects = Map.empty<Text, Project>();
  stable var maintenanceRecords = Map.empty<Text, MaintenanceRecord>();
  stable var suppliers = Map.empty<Text, Supplier>();
  stable var safetyIncidents = Map.empty<Text, SafetyIncident>();
  stable var budgetItems = Map.empty<Text, BudgetItem>();
  stable var documents = Map.empty<Text, Document>();
  stable var inventoryItems = Map.empty<Text, InventoryItem>();
  stable var alerts = Map.empty<Text, Alert>();
  stable var tasks = Map.empty<Text, Task>();
  stable var leaveRequests = Map.empty<Text, LeaveRequest>();
  stable var codeCounter : Nat = 0;

  // ===== CODE GENERATION =====
  let alphabet : [Char] = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

  func natToCode(seed : Nat, length : Nat) : Text {
    let base : Nat = 36;
    var n = seed;
    var code = "";
    var i = 0;
    while (i < length) {
      let idx = n % base;
      code := Text.fromChar(alphabet[idx]) # code;
      n := n / base;
      i += 1;
    };
    code;
  };

  func newCode() : Text {
    codeCounter += 1;
    let seed = Int.abs(Time.now() / 1_000_000) + codeCounter * 999983;
    natToCode(seed, 12);
  };

  // ===== HELPERS =====
  func verifyAdminCode(adminCode : Text) : ?Text {
    for ((companyId, company) in companies.entries()) {
      if (company.adminCode == adminCode) {
        return ?companyId;
      };
    };
    null;
  };

  func getCompanyIdForUserCode(userCode : Text) : ?Text {
    switch (verifyAdminCode(userCode)) {
      case (?companyId) { return ?companyId };
      case null {};
    };
    for ((_id, person) in personnel.entries()) {
      if (person.loginCode == userCode and person.isActive) {
        return person.companyId;
      };
    };
    null;
  };

  func arrayAppend<T>(arr : [T], item : T) : [T] {
    let n = arr.size();
    let prev = arr;
    Array.tabulate<T>(n + 1, func(i) {
      if (i < n) { prev[i] } else { item };
    });
  };

  // ===== COMPANY FUNCTIONS =====
  public shared func registerCompany(name : Text, mode : Text) : async Company {
    if (name.trimStart(#char ' ') == "") {
      Runtime.trap("Company name cannot be empty");
    };
    let adminCode = newCode();
    let companyId = newCode();
    let company : Company = {
      name = name;
      mode = mode;
      adminCode = adminCode;
      createdAt = Time.now();
    };
    companies.add(companyId, company);
    company;
  };

  public query func getCompanyInfo(userCode : Text) : async ?Company {
    for ((_id, company) in companies.entries()) {
      if (company.adminCode == userCode) {
        return ?company;
      };
    };
    for ((_id, person) in personnel.entries()) {
      if (person.loginCode == userCode and person.isActive) {
        switch (person.companyId) {
          case (?cid) { return companies.get(cid) };
          case null { return null };
        };
      };
    };
    null;
  };

  // ===== PERSONNEL FUNCTIONS =====
  public shared func selfRegisterPersonnel(name : Text) : async Personnel {
    if (name.trimStart(#char ' ') == "") {
      Runtime.trap("Personnel name cannot be empty");
    };
    let inviteCode = newCode();
    let loginCode = newCode();
    let personnelId = newCode();
    let person : Personnel = {
      name = name;
      role = "";
      loginCode = loginCode;
      inviteCode = inviteCode;
      isActive = true;
      companyId = null;
      createdAt = Time.now();
    };
    personnel.add(personnelId, person);
    person;
  };

  public shared func addPersonnelToCompany(adminCode : Text, inviteCode : Text, role : Text) : async Personnel {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    var foundId : ?Text = null;
    var foundPerson : ?Personnel = null;
    for ((pid, person) in personnel.entries()) {
      if (person.inviteCode == inviteCode) {
        foundId := ?pid;
        foundPerson := ?person;
      };
    };
    switch (foundId, foundPerson) {
      case (?pid, ?person) {
        let updated : Personnel = {
          name = person.name;
          role = role;
          loginCode = person.loginCode;
          inviteCode = person.inviteCode;
          isActive = true;
          companyId = ?companyId;
          createdAt = person.createdAt;
        };
        personnel.add(pid, updated);
        updated;
      };
      case _ { Runtime.trap("Personnel not found for invite code") };
    };
  };

  public query func getCompanyPersonnel(adminCode : Text) : async [Personnel] {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    var result : [Personnel] = [];
    for ((_id, person) in personnel.entries()) {
      switch (person.companyId) {
        case (?cid) {
          if (cid == companyId) {
            result := arrayAppend(result, person);
          };
        };
        case null {};
      };
    };
    result;
  };

  public shared func updatePersonnelRole(adminCode : Text, personnelId : Text, role : Text) : async Personnel {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (personnel.get(personnelId)) {
      case null { Runtime.trap("Personnel not found") };
      case (?person) {
        let updated : Personnel = {
          name = person.name;
          role = role;
          loginCode = person.loginCode;
          inviteCode = person.inviteCode;
          isActive = person.isActive;
          companyId = person.companyId;
          createdAt = person.createdAt;
        };
        personnel.add(personnelId, updated);
        updated;
      };
    };
  };

  public shared func removePersonnelFromCompany(adminCode : Text, personnelId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (personnel.get(personnelId)) {
      case null { false };
      case (?person) {
        let updated : Personnel = {
          name = person.name;
          role = person.role;
          loginCode = person.loginCode;
          inviteCode = person.inviteCode;
          isActive = false;
          companyId = null;
          createdAt = person.createdAt;
        };
        personnel.add(personnelId, updated);
        true;
      };
    };
  };

  // ===== MACHINE FUNCTIONS =====
  public shared func addMachine(adminCode : Text, name : Text, machineType : Text, serialNumber : Text, location : Text, notes : Text) : async Machine {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let machineId = newCode();
    let machine : Machine = {
      companyId = companyId;
      name = name;
      machineType = machineType;
      serialNumber = serialNumber;
      status = "active";
      location = location;
      notes = notes;
      createdAt = Time.now();
      lastMaintenanceDate = null;
    };
    machines.add(machineId, machine);
    machine;
  };

  public query func getMachines(userCode : Text) : async [Machine] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [Machine] = [];
    for ((_id, machine) in machines.entries()) {
      if (machine.companyId == companyId) {
        result := arrayAppend(result, machine);
      };
    };
    result;
  };

  public query func getMachineById(userCode : Text, machineId : Text) : async ?Machine {
    switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?_) {};
    };
    machines.get(machineId);
  };

  public shared func updateMachine(adminCode : Text, machineId : Text, name : Text, machineType : Text, serialNumber : Text, location : Text, notes : Text) : async Machine {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (machines.get(machineId)) {
      case null { Runtime.trap("Machine not found") };
      case (?machine) {
        let updated : Machine = {
          companyId = machine.companyId;
          name = name;
          machineType = machineType;
          serialNumber = serialNumber;
          status = machine.status;
          location = location;
          notes = notes;
          createdAt = machine.createdAt;
          lastMaintenanceDate = machine.lastMaintenanceDate;
        };
        machines.add(machineId, updated);
        updated;
      };
    };
  };

  public shared func updateMachineStatus(userCode : Text, machineId : Text, status : Text) : async Machine {
    switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?_) {};
    };
    switch (machines.get(machineId)) {
      case null { Runtime.trap("Machine not found") };
      case (?machine) {
        let updated : Machine = {
          companyId = machine.companyId;
          name = machine.name;
          machineType = machine.machineType;
          serialNumber = machine.serialNumber;
          status = status;
          location = machine.location;
          notes = machine.notes;
          createdAt = machine.createdAt;
          lastMaintenanceDate = if (status == "maintenance") { ?Time.now() } else { machine.lastMaintenanceDate };
        };
        machines.add(machineId, updated);
        updated;
      };
    };
  };

  public shared func deleteMachine(adminCode : Text, machineId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (machines.get(machineId)) {
      case null { false };
      case (?_) {
        machines.remove(machineId);
        true;
      };
    };
  };

  // ===== PROJECT FUNCTIONS =====
  public shared func addProject(adminCode : Text, name : Text, description : Text, startDate : Text, endDate : Text) : async Project {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let project : Project = {
      id = id;
      companyId = companyId;
      name = name;
      description = description;
      status = "planned";
      startDate = startDate;
      endDate = endDate;
      progress = 0;
      createdAt = Time.now();
    };
    projects.add(id, project);
    project;
  };

  public query func getProjects(userCode : Text) : async [Project] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [Project] = [];
    for ((_id, project) in projects.entries()) {
      if (project.companyId == companyId) {
        result := arrayAppend(result, project);
      };
    };
    result;
  };

  public shared func updateProject(adminCode : Text, projectId : Text, name : Text, description : Text, startDate : Text, endDate : Text, status : Text, progress : Nat) : async Project {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (projects.get(projectId)) {
      case null { Runtime.trap("Project not found") };
      case (?project) {
        let updated : Project = {
          id = project.id;
          companyId = project.companyId;
          name = name;
          description = description;
          status = status;
          startDate = startDate;
          endDate = endDate;
          progress = progress;
          createdAt = project.createdAt;
        };
        projects.add(projectId, updated);
        updated;
      };
    };
  };

  public shared func deleteProject(adminCode : Text, projectId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (projects.get(projectId)) {
      case null { false };
      case (?_) {
        projects.remove(projectId);
        true;
      };
    };
  };

  // ===== MAINTENANCE FUNCTIONS =====
  public shared func addMaintenanceRecord(adminCode : Text, machineId : Text, machineName : Text, maintenanceType : Text, description : Text, scheduledDate : Text, notes : Text) : async MaintenanceRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let record : MaintenanceRecord = {
      id = id;
      companyId = companyId;
      machineId = machineId;
      machineName = machineName;
      maintenanceType = maintenanceType;
      description = description;
      scheduledDate = scheduledDate;
      completedDate = "";
      status = "pending";
      notes = notes;
      createdAt = Time.now();
    };
    maintenanceRecords.add(id, record);
    record;
  };

  public query func getMaintenanceRecords(userCode : Text) : async [MaintenanceRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [MaintenanceRecord] = [];
    for ((_id, record) in maintenanceRecords.entries()) {
      if (record.companyId == companyId) {
        result := arrayAppend(result, record);
      };
    };
    result;
  };

  public shared func updateMaintenanceRecord(adminCode : Text, recordId : Text, description : Text, scheduledDate : Text, completedDate : Text, status : Text, notes : Text) : async MaintenanceRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (maintenanceRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?record) {
        let updated : MaintenanceRecord = {
          id = record.id;
          companyId = record.companyId;
          machineId = record.machineId;
          machineName = record.machineName;
          maintenanceType = record.maintenanceType;
          description = description;
          scheduledDate = scheduledDate;
          completedDate = completedDate;
          status = status;
          notes = notes;
          createdAt = record.createdAt;
        };
        maintenanceRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteMaintenanceRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (maintenanceRecords.get(recordId)) {
      case null { false };
      case (?_) {
        maintenanceRecords.remove(recordId);
        true;
      };
    };
  };

  // ===== SUPPLIER FUNCTIONS =====
  public shared func addSupplier(adminCode : Text, name : Text, category : Text, contactPerson : Text, phone : Text, email : Text, notes : Text) : async Supplier {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let supplier : Supplier = {
      id = id;
      companyId = companyId;
      name = name;
      category = category;
      contactPerson = contactPerson;
      phone = phone;
      email = email;
      status = "active";
      notes = notes;
      createdAt = Time.now();
    };
    suppliers.add(id, supplier);
    supplier;
  };

  public query func getSuppliers(userCode : Text) : async [Supplier] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [Supplier] = [];
    for ((_id, supplier) in suppliers.entries()) {
      if (supplier.companyId == companyId) {
        result := arrayAppend(result, supplier);
      };
    };
    result;
  };

  public shared func updateSupplier(adminCode : Text, supplierId : Text, name : Text, category : Text, contactPerson : Text, phone : Text, email : Text, status : Text, notes : Text) : async Supplier {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (suppliers.get(supplierId)) {
      case null { Runtime.trap("Supplier not found") };
      case (?supplier) {
        let updated : Supplier = {
          id = supplier.id;
          companyId = supplier.companyId;
          name = name;
          category = category;
          contactPerson = contactPerson;
          phone = phone;
          email = email;
          status = status;
          notes = notes;
          createdAt = supplier.createdAt;
        };
        suppliers.add(supplierId, updated);
        updated;
      };
    };
  };

  public shared func deleteSupplier(adminCode : Text, supplierId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (suppliers.get(supplierId)) {
      case null { false };
      case (?_) {
        suppliers.remove(supplierId);
        true;
      };
    };
  };

  // ===== SAFETY INCIDENT FUNCTIONS =====
  public shared func addSafetyIncident(adminCode : Text, title : Text, incidentType : Text, severity : Text, date : Text, location : Text, description : Text, reportedBy : Text, actions : Text) : async SafetyIncident {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let incident : SafetyIncident = {
      id = id;
      companyId = companyId;
      title = title;
      incidentType = incidentType;
      severity = severity;
      date = date;
      location = location;
      description = description;
      reportedBy = reportedBy;
      status = "open";
      actions = actions;
      createdAt = Time.now();
    };
    safetyIncidents.add(id, incident);
    incident;
  };

  public query func getSafetyIncidents(userCode : Text) : async [SafetyIncident] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [SafetyIncident] = [];
    for ((_id, incident) in safetyIncidents.entries()) {
      if (incident.companyId == companyId) {
        result := arrayAppend(result, incident);
      };
    };
    result;
  };

  public shared func updateSafetyIncident(adminCode : Text, incidentId : Text, title : Text, incidentType : Text, severity : Text, date : Text, location : Text, description : Text, reportedBy : Text, status : Text, actions : Text) : async SafetyIncident {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (safetyIncidents.get(incidentId)) {
      case null { Runtime.trap("Incident not found") };
      case (?incident) {
        let updated : SafetyIncident = {
          id = incident.id;
          companyId = incident.companyId;
          title = title;
          incidentType = incidentType;
          severity = severity;
          date = date;
          location = location;
          description = description;
          reportedBy = reportedBy;
          status = status;
          actions = actions;
          createdAt = incident.createdAt;
        };
        safetyIncidents.add(incidentId, updated);
        updated;
      };
    };
  };

  public shared func deleteSafetyIncident(adminCode : Text, incidentId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (safetyIncidents.get(incidentId)) {
      case null { false };
      case (?_) {
        safetyIncidents.remove(incidentId);
        true;
      };
    };
  };

  // ===== BUDGET FUNCTIONS =====
  public shared func addBudgetItem(adminCode : Text, name : Text, category : Text, itemType : Text, plannedAmount : Text, actualAmount : Text, projectId : Text, date : Text, notes : Text) : async BudgetItem {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let item : BudgetItem = {
      id = id;
      companyId = companyId;
      name = name;
      category = category;
      itemType = itemType;
      plannedAmount = plannedAmount;
      actualAmount = actualAmount;
      projectId = projectId;
      date = date;
      notes = notes;
      status = "active";
      createdAt = Time.now();
    };
    budgetItems.add(id, item);
    item;
  };

  public query func getBudgetItems(userCode : Text) : async [BudgetItem] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [BudgetItem] = [];
    for ((_id, item) in budgetItems.entries()) {
      if (item.companyId == companyId) {
        result := arrayAppend(result, item);
      };
    };
    result;
  };

  public shared func updateBudgetItem(adminCode : Text, itemId : Text, name : Text, category : Text, itemType : Text, plannedAmount : Text, actualAmount : Text, projectId : Text, date : Text, notes : Text, status : Text) : async BudgetItem {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (budgetItems.get(itemId)) {
      case null { Runtime.trap("Budget item not found") };
      case (?item) {
        let updated : BudgetItem = {
          id = item.id;
          companyId = item.companyId;
          name = name;
          category = category;
          itemType = itemType;
          plannedAmount = plannedAmount;
          actualAmount = actualAmount;
          projectId = projectId;
          date = date;
          notes = notes;
          status = status;
          createdAt = item.createdAt;
        };
        budgetItems.add(itemId, updated);
        updated;
      };
    };
  };

  public shared func deleteBudgetItem(adminCode : Text, itemId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (budgetItems.get(itemId)) {
      case null { false };
      case (?_) {
        budgetItems.remove(itemId);
        true;
      };
    };
  };

  // ===== DASHBOARD =====
  public query func getDashboardStats(userCode : Text) : async Text {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var totalMachines = 0;
    var activeMachines = 0;
    var maintenanceMachines = 0;
    var brokenMachines = 0;
    for ((_id, machine) in machines.entries()) {
      if (machine.companyId == companyId) {
        totalMachines += 1;
        if (machine.status == "active") { activeMachines += 1 }
        else if (machine.status == "maintenance") { maintenanceMachines += 1 }
        else if (machine.status == "broken") { brokenMachines += 1 };
      };
    };
    var totalPersonnel = 0;
    for ((_id, person) in personnel.entries()) {
      switch (person.companyId) {
        case (?cid) { if (cid == companyId and person.isActive) { totalPersonnel += 1 } };
        case null {};
      };
    };
    var totalProjects = 0;
    var activeProjects = 0;
    var completedProjects = 0;
    for ((_id, project) in projects.entries()) {
      if (project.companyId == companyId) {
        totalProjects += 1;
        if (project.status == "active") { activeProjects += 1 }
        else if (project.status == "completed") { completedProjects += 1 };
      };
    };
    var totalMaintenance = 0;
    var pendingMaintenance = 0;
    for ((_id, record) in maintenanceRecords.entries()) {
      if (record.companyId == companyId) {
        totalMaintenance += 1;
        if (record.status == "pending") { pendingMaintenance += 1 };
      };
    };
    var totalSuppliers = 0;
    for ((_id, supplier) in suppliers.entries()) {
      if (supplier.companyId == companyId) { totalSuppliers += 1 };
    };
    var totalSafetyIncidents = 0;
    var openIncidents = 0;
    for ((_id, incident) in safetyIncidents.entries()) {
      if (incident.companyId == companyId) {
        totalSafetyIncidents += 1;
        if (incident.status == "open") { openIncidents += 1 };
      };
    };
    var totalBudgetItems = 0;
    for ((_id, item) in budgetItems.entries()) {
      if (item.companyId == companyId) { totalBudgetItems += 1 };
    };
    var totalDocuments = 0;
    for ((_id, doc) in documents.entries()) {
      if (doc.companyId == companyId) { totalDocuments += 1 };
    };
    var totalInventoryItems = 0;
    var lowStockItems = 0;
    for ((_id, item) in inventoryItems.entries()) {
      if (item.companyId == companyId) {
        totalInventoryItems += 1;
        if (item.status == "low" or item.status == "out") { lowStockItems += 1 };
      };
    };
    var activeAlerts = 0;
    for ((_id, alert) in alerts.entries()) {
      if (alert.companyId == companyId and alert.status == "active") { activeAlerts += 1 };
    };
    var pendingTasks = 0;
    for ((_id, task) in tasks.entries()) {
      if (task.companyId == companyId and task.status != "done") { pendingTasks += 1 };
    };
    var pendingLeaveRequests = 0;
    for ((_id, req) in leaveRequests.entries()) {
      if (req.companyId == companyId and req.status == "pending") { pendingLeaveRequests += 1 };
    };
    "{\"totalMachines\":" # debug_show(totalMachines) #
    ",\"activeMachines\":" # debug_show(activeMachines) #
    ",\"maintenanceMachines\":" # debug_show(maintenanceMachines) #
    ",\"brokenMachines\":" # debug_show(brokenMachines) #
    ",\"totalPersonnel\":" # debug_show(totalPersonnel) #
    ",\"totalProjects\":" # debug_show(totalProjects) #
    ",\"activeProjects\":" # debug_show(activeProjects) #
    ",\"completedProjects\":" # debug_show(completedProjects) #
    ",\"totalMaintenance\":" # debug_show(totalMaintenance) #
    ",\"pendingMaintenance\":" # debug_show(pendingMaintenance) #
    ",\"totalSuppliers\":" # debug_show(totalSuppliers) #
    ",\"totalSafetyIncidents\":" # debug_show(totalSafetyIncidents) #
    ",\"openIncidents\":" # debug_show(openIncidents) #
    ",\"totalBudgetItems\":" # debug_show(totalBudgetItems) #
    ",\"totalDocuments\":" # debug_show(totalDocuments) #
    ",\"totalInventoryItems\":" # debug_show(totalInventoryItems) #
    ",\"lowStockItems\":" # debug_show(lowStockItems) #
    ",\"activeAlerts\":" # debug_show(activeAlerts) #
    ",\"pendingTasks\":" # debug_show(pendingTasks) #
    ",\"pendingLeaveRequests\":" # debug_show(pendingLeaveRequests) # "}";
  };

  // ===== DOCUMENT FUNCTIONS =====
  public shared func addDocument(adminCode : Text, name : Text, category : Text, documentType : Text, referenceNumber : Text, date : Text, description : Text, linkedMachineId : Text, linkedProjectId : Text) : async Document {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let doc : Document = {
      id = id;
      companyId = companyId;
      name = name;
      category = category;
      documentType = documentType;
      referenceNumber = referenceNumber;
      date = date;
      description = description;
      linkedMachineId = linkedMachineId;
      linkedProjectId = linkedProjectId;
      status = "active";
      createdAt = Time.now();
    };
    documents.add(id, doc);
    doc;
  };

  public query func getDocuments(userCode : Text) : async [Document] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [Document] = [];
    for ((_id, doc) in documents.entries()) {
      if (doc.companyId == companyId) {
        result := arrayAppend(result, doc);
      };
    };
    result;
  };

  public shared func updateDocument(adminCode : Text, docId : Text, name : Text, category : Text, documentType : Text, referenceNumber : Text, date : Text, description : Text, linkedMachineId : Text, linkedProjectId : Text, status : Text) : async Document {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (documents.get(docId)) {
      case null { Runtime.trap("Document not found") };
      case (?doc) {
        let updated : Document = {
          id = doc.id;
          companyId = doc.companyId;
          name = name;
          category = category;
          documentType = documentType;
          referenceNumber = referenceNumber;
          date = date;
          description = description;
          linkedMachineId = linkedMachineId;
          linkedProjectId = linkedProjectId;
          status = status;
          createdAt = doc.createdAt;
        };
        documents.add(docId, updated);
        updated;
      };
    };
  };

  public shared func deleteDocument(adminCode : Text, docId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (documents.get(docId)) {
      case null { false };
      case (?_) {
        documents.remove(docId);
        true;
      };
    };
  };

  // ===== INVENTORY FUNCTIONS =====
  public shared func addInventoryItem(adminCode : Text, name : Text, category : Text, unit : Text, currentStock : Nat, minimumStock : Nat, location : Text, supplierName : Text, notes : Text) : async InventoryItem {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let stockStatus = if (currentStock == 0) { "out" } else if (currentStock <= minimumStock) { "low" } else { "available" };
    let item : InventoryItem = {
      id = id;
      companyId = companyId;
      name = name;
      category = category;
      unit = unit;
      currentStock = currentStock;
      minimumStock = minimumStock;
      location = location;
      supplierName = supplierName;
      notes = notes;
      status = stockStatus;
      createdAt = Time.now();
    };
    inventoryItems.add(id, item);
    item;
  };

  public query func getInventoryItems(userCode : Text) : async [InventoryItem] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [InventoryItem] = [];
    for ((_id, item) in inventoryItems.entries()) {
      if (item.companyId == companyId) {
        result := arrayAppend(result, item);
      };
    };
    result;
  };

  public shared func updateInventoryItem(adminCode : Text, itemId : Text, name : Text, category : Text, unit : Text, currentStock : Nat, minimumStock : Nat, location : Text, supplierName : Text, notes : Text) : async InventoryItem {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (inventoryItems.get(itemId)) {
      case null { Runtime.trap("Item not found") };
      case (?item) {
        let stockStatus = if (currentStock == 0) { "out" } else if (currentStock <= minimumStock) { "low" } else { "available" };
        let updated : InventoryItem = {
          id = item.id;
          companyId = item.companyId;
          name = name;
          category = category;
          unit = unit;
          currentStock = currentStock;
          minimumStock = minimumStock;
          location = location;
          supplierName = supplierName;
          notes = notes;
          status = stockStatus;
          createdAt = item.createdAt;
        };
        inventoryItems.add(itemId, updated);
        updated;
      };
    };
  };

  public shared func deleteInventoryItem(adminCode : Text, itemId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (inventoryItems.get(itemId)) {
      case null { false };
      case (?_) {
        inventoryItems.remove(itemId);
        true;
      };
    };
  };

  // ===== ALERT FUNCTIONS =====
  public shared func addAlert(adminCode : Text, title : Text, description : Text, alertType : Text, priority : Text, dueDate : Text) : async Alert {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let alert : Alert = {
      id = id;
      companyId = companyId;
      title = title;
      description = description;
      alertType = alertType;
      priority = priority;
      status = "active";
      dueDate = dueDate;
      createdAt = Time.now();
    };
    alerts.add(id, alert);
    alert;
  };

  public query func getAlerts(userCode : Text) : async [Alert] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    var result : [Alert] = [];
    for ((_id, alert) in alerts.entries()) {
      if (alert.companyId == companyId) {
        result := arrayAppend(result, alert);
      };
    };
    result;
  };

  public shared func dismissAlert(adminCode : Text, alertId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (alerts.get(alertId)) {
      case null { false };
      case (?alert) {
        let updated : Alert = {
          id = alert.id;
          companyId = alert.companyId;
          title = alert.title;
          description = alert.description;
          alertType = alert.alertType;
          priority = alert.priority;
          status = "dismissed";
          dueDate = alert.dueDate;
          createdAt = alert.createdAt;
        };
        alerts.add(alertId, updated);
        true;
      };
    };
  };

  public shared func deleteAlert(adminCode : Text, alertId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (alerts.get(alertId)) {
      case null { false };
      case (?_) {
        alerts.remove(alertId);
        true;
      };
    };
  };

  // ===== TASK FUNCTIONS =====
  public shared func addTask(adminCode : Text, projectId : Text, title : Text, description : Text, assignedTo : Text, priority : Text, dueDate : Text) : async Task {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let task : Task = {
      id;
      companyId;
      projectId;
      title;
      description;
      assignedTo;
      priority;
      status = "todo";
      dueDate;
      createdAt = Time.now();
    };
    tasks.add(id, task);
    task;
  };

  public shared func updateTask(adminCode : Text, taskId : Text, title : Text, description : Text, assignedTo : Text, priority : Text, status : Text, dueDate : Text) : async Task {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (tasks.get(taskId)) {
      case null { Runtime.trap("Task not found") };
      case (?t) {
        let updated : Task = {
          id = t.id;
          companyId = t.companyId;
          projectId = t.projectId;
          title;
          description;
          assignedTo;
          priority;
          status;
          dueDate;
          createdAt = t.createdAt;
        };
        tasks.add(taskId, updated);
        updated;
      };
    };
  };

  public shared func deleteTask(adminCode : Text, taskId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (tasks.get(taskId)) {
      case null { false };
      case (?_) {
        tasks.remove(taskId);
        true;
      };
    };
  };

  public query func getTasks(userCode : Text) : async [Task] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [Task] = [];
    for ((_id, task) in tasks.entries()) {
      if (task.companyId == companyId) {
        result := arrayAppend(result, task);
      };
    };
    result;
  };

  // ===== LEAVE REQUEST FUNCTIONS =====
  public shared func addLeaveRequest(userCode : Text, personnelName : Text, leaveType : Text, startDate : Text, endDate : Text, reason : Text) : async LeaveRequest {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { Runtime.trap("Invalid user code") };
      case (?id) { id };
    };
    let id = newCode();
    let req : LeaveRequest = {
      id;
      companyId;
      personnelCode = userCode;
      personnelName;
      leaveType;
      startDate;
      endDate;
      reason;
      status = "pending";
      reviewedBy = "";
      reviewNote = "";
      createdAt = Time.now();
    };
    leaveRequests.add(id, req);
    req;
  };

  public shared func reviewLeaveRequest(adminCode : Text, requestId : Text, status : Text, reviewNote : Text) : async LeaveRequest {
    let _ = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    switch (leaveRequests.get(requestId)) {
      case null { Runtime.trap("Leave request not found") };
      case (?req) {
        let updated : LeaveRequest = {
          id = req.id;
          companyId = req.companyId;
          personnelCode = req.personnelCode;
          personnelName = req.personnelName;
          leaveType = req.leaveType;
          startDate = req.startDate;
          endDate = req.endDate;
          reason = req.reason;
          status;
          reviewedBy = adminCode;
          reviewNote;
          createdAt = req.createdAt;
        };
        leaveRequests.add(requestId, updated);
        updated;
      };
    };
  };

  public shared func deleteLeaveRequest(adminCode : Text, requestId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (leaveRequests.get(requestId)) {
      case null { false };
      case (?_) {
        leaveRequests.remove(requestId);
        true;
      };
    };
  };

  public query func getLeaveRequests(userCode : Text) : async [LeaveRequest] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [LeaveRequest] = [];
    for ((_id, req) in leaveRequests.entries()) {
      if (req.companyId == companyId) {
        result := arrayAppend(result, req);
      };
    };
    result;
  };


  // ===== SHIFT TYPES =====
  type Shift = {
    id : Text;
    companyId : Text;
    title : Text;
    shiftType : Text;
    date : Text;
    startTime : Text;
    endTime : Text;
    assignedPersonnel : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  type TrainingRecord = {
    id : Text;
    companyId : Text;
    title : Text;
    trainingType : Text;
    provider : Text;
    personnelName : Text;
    personnelCode : Text;
    startDate : Text;
    endDate : Text;
    expiryDate : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  // ===== SHIFT STORAGE =====
  stable var shifts = Map.empty<Text, Shift>();
  stable var trainingRecords = Map.empty<Text, TrainingRecord>();

  // ===== SHIFT FUNCTIONS =====
  public shared func addShift(adminCode : Text, title : Text, shiftType : Text, date : Text, startTime : Text, endTime : Text, assignedPersonnel : Text, notes : Text) : async Shift {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let shift : Shift = {
      id; companyId; title; shiftType; date; startTime; endTime;
      assignedPersonnel; status = "active"; notes; createdAt = Time.now();
    };
    shifts.add(id, shift);
    shift;
  };

  public query func getShifts(userCode : Text) : async [Shift] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [Shift] = [];
    for ((_id, shift) in shifts.entries()) {
      if (shift.companyId == companyId) {
        result := arrayAppend(result, shift);
      };
    };
    result;
  };

  public shared func updateShift(adminCode : Text, shiftId : Text, title : Text, shiftType : Text, date : Text, startTime : Text, endTime : Text, assignedPersonnel : Text, status : Text, notes : Text) : async Shift {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (shifts.get(shiftId)) {
      case null { Runtime.trap("Shift not found") };
      case (?s) {
        let updated : Shift = {
          id = s.id; companyId = s.companyId;
          title; shiftType; date; startTime; endTime;
          assignedPersonnel; status; notes; createdAt = s.createdAt;
        };
        shifts.add(shiftId, updated);
        updated;
      };
    };
  };

  public shared func deleteShift(adminCode : Text, shiftId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (shifts.get(shiftId)) {
      case null { false };
      case (?_) { shifts.remove(shiftId); true };
    };
  };

  // ===== TRAINING FUNCTIONS =====
  public shared func addTrainingRecord(adminCode : Text, title : Text, trainingType : Text, provider : Text, personnelName : Text, personnelCode : Text, startDate : Text, endDate : Text, expiryDate : Text, notes : Text) : async TrainingRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let rec : TrainingRecord = {
      id; companyId; title; trainingType; provider;
      personnelName; personnelCode; startDate; endDate; expiryDate;
      status = "planned"; notes; createdAt = Time.now();
    };
    trainingRecords.add(id, rec);
    rec;
  };

  public query func getTrainingRecords(userCode : Text) : async [TrainingRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [TrainingRecord] = [];
    for ((_id, rec) in trainingRecords.entries()) {
      if (rec.companyId == companyId) {
        result := arrayAppend(result, rec);
      };
    };
    result;
  };

  public shared func updateTrainingRecord(adminCode : Text, recId : Text, title : Text, trainingType : Text, provider : Text, personnelName : Text, personnelCode : Text, startDate : Text, endDate : Text, expiryDate : Text, status : Text, notes : Text) : async TrainingRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (trainingRecords.get(recId)) {
      case null { Runtime.trap("Training record not found") };
      case (?r) {
        let updated : TrainingRecord = {
          id = r.id; companyId = r.companyId;
          title; trainingType; provider;
          personnelName; personnelCode; startDate; endDate; expiryDate;
          status; notes; createdAt = r.createdAt;
        };
        trainingRecords.add(recId, updated);
        updated;
      };
    };
  };

  public shared func deleteTrainingRecord(adminCode : Text, recId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (trainingRecords.get(recId)) {
      case null { false };
      case (?_) { trainingRecords.remove(recId); true };
    };
  };


  // ===== QUALITY CONTROL =====
  type QualityCheck = {
    id : Text;
    companyId : Text;
    title : Text;
    checkType : Text;
    machineId : Text;
    machineName : Text;
    inspector : Text;
    checkDate : Text;
    status : Text;
    score : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var qualityChecks = Map.empty<Text, QualityCheck>();

  public shared func addQualityCheck(adminCode : Text, title : Text, checkType : Text, machineId : Text, machineName : Text, inspector : Text, checkDate : Text, score : Text, notes : Text) : async QualityCheck {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let qc : QualityCheck = {
      id; companyId; title; checkType; machineId; machineName;
      inspector; checkDate; status = "pending"; score; notes; createdAt = Time.now();
    };
    qualityChecks.add(id, qc);
    qc;
  };

  public query func getQualityChecks(userCode : Text) : async [QualityCheck] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [QualityCheck] = [];
    for ((_id, qc) in qualityChecks.entries()) {
      if (qc.companyId == companyId) {
        result := arrayAppend(result, qc);
      };
    };
    result;
  };

  public shared func updateQualityCheck(adminCode : Text, checkId : Text, title : Text, checkType : Text, machineId : Text, machineName : Text, inspector : Text, checkDate : Text, status : Text, score : Text, notes : Text) : async QualityCheck {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (qualityChecks.get(checkId)) {
      case null { Runtime.trap("Quality check not found") };
      case (?q) {
        let updated : QualityCheck = {
          id = q.id; companyId = q.companyId;
          title; checkType; machineId; machineName;
          inspector; checkDate; status; score; notes; createdAt = q.createdAt;
        };
        qualityChecks.add(checkId, updated);
        updated;
      };
    };
  };

  public shared func deleteQualityCheck(adminCode : Text, checkId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (qualityChecks.get(checkId)) {
      case null { false };
      case (?_) { qualityChecks.remove(checkId); true };
    };
  };

  // ===== VISITOR & CONTRACTOR ENTRY =====
  type VisitorEntry = {
    id : Text;
    companyId : Text;
    visitorName : Text;
    visitorType : Text;
    company : Text;
    purpose : Text;
    hostName : Text;
    entryDate : Text;
    entryTime : Text;
    exitTime : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var visitorEntries = Map.empty<Text, VisitorEntry>();

  public shared func addVisitorEntry(adminCode : Text, visitorName : Text, visitorType : Text, company : Text, purpose : Text, hostName : Text, entryDate : Text, entryTime : Text, notes : Text) : async VisitorEntry {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let ve : VisitorEntry = {
      id; companyId; visitorName; visitorType; company; purpose;
      hostName; entryDate; entryTime; exitTime = ""; status = "inside"; notes; createdAt = Time.now();
    };
    visitorEntries.add(id, ve);
    ve;
  };

  public query func getVisitorEntries(userCode : Text) : async [VisitorEntry] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [VisitorEntry] = [];
    for ((_id, ve) in visitorEntries.entries()) {
      if (ve.companyId == companyId) {
        result := arrayAppend(result, ve);
      };
    };
    result;
  };

  public shared func updateVisitorEntry(adminCode : Text, entryId : Text, visitorName : Text, visitorType : Text, company : Text, purpose : Text, hostName : Text, entryDate : Text, entryTime : Text, exitTime : Text, status : Text, notes : Text) : async VisitorEntry {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (visitorEntries.get(entryId)) {
      case null { Runtime.trap("Visitor entry not found") };
      case (?v) {
        let updated : VisitorEntry = {
          id = v.id; companyId = v.companyId;
          visitorName; visitorType; company; purpose;
          hostName; entryDate; entryTime; exitTime; status; notes; createdAt = v.createdAt;
        };
        visitorEntries.add(entryId, updated);
        updated;
      };
    };
  };

  public shared func deleteVisitorEntry(adminCode : Text, entryId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (visitorEntries.get(entryId)) {
      case null { false };
      case (?_) { visitorEntries.remove(entryId); true };
    };
  };

  // ===== FAULT REPORTS (ARIZA TAKİBİ) =====
  type FaultReport = {
    id : Text;
    companyId : Text;
    machineId : Text;
    machineName : Text;
    title : Text;
    faultType : Text;
    severity : Text;
    reportedBy : Text;
    reportDate : Text;
    description : Text;
    cause : Text;
    resolution : Text;
    status : Text;
    resolutionDate : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var faultReports = Map.empty<Text, FaultReport>();

  public shared func addFaultReport(adminCode : Text, machineId : Text, machineName : Text, title : Text, faultType : Text, severity : Text, reportedBy : Text, reportDate : Text, description : Text, notes : Text) : async FaultReport {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let fr : FaultReport = {
      id; companyId; machineId; machineName; title; faultType; severity;
      reportedBy; reportDate; description; cause = ""; resolution = "";
      status = "open"; resolutionDate = ""; notes; createdAt = Time.now();
    };
    faultReports.add(id, fr);
    fr;
  };

  public query func getFaultReports(userCode : Text) : async [FaultReport] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [FaultReport] = [];
    for ((_id, fr) in faultReports.entries()) {
      if (fr.companyId == companyId) {
        result := arrayAppend(result, fr);
      };
    };
    result;
  };

  public shared func updateFaultReport(adminCode : Text, faultId : Text, title : Text, faultType : Text, severity : Text, reportedBy : Text, reportDate : Text, description : Text, cause : Text, resolution : Text, status : Text, resolutionDate : Text, notes : Text) : async FaultReport {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (faultReports.get(faultId)) {
      case null { Runtime.trap("Fault report not found") };
      case (?f) {
        let updated : FaultReport = {
          id = f.id; companyId = f.companyId;
          machineId = f.machineId; machineName = f.machineName;
          title; faultType; severity; reportedBy; reportDate; description;
          cause; resolution; status; resolutionDate; notes; createdAt = f.createdAt;
        };
        faultReports.add(faultId, updated);
        updated;
      };
    };
  };

  public shared func deleteFaultReport(adminCode : Text, faultId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (faultReports.get(faultId)) {
      case null { false };
      case (?_) { faultReports.remove(faultId); true };
    };
  };

  // ===== WORK ORDERS (İŞ EMİRLERİ) =====
  type WorkOrder = {
    id : Text;
    companyId : Text;
    title : Text;
    orderType : Text;
    machineId : Text;
    machineName : Text;
    assignedTo : Text;
    priority : Text;
    status : Text;
    scheduledDate : Text;
    completedDate : Text;
    description : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var workOrders = Map.empty<Text, WorkOrder>();

  public shared func addWorkOrder(adminCode : Text, title : Text, orderType : Text, machineId : Text, machineName : Text, assignedTo : Text, priority : Text, scheduledDate : Text, description : Text, notes : Text) : async WorkOrder {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?id) { id };
    };
    let id = newCode();
    let wo : WorkOrder = {
      id; companyId; title; orderType; machineId; machineName;
      assignedTo; priority; status = "pending"; scheduledDate;
      completedDate = ""; description; notes; createdAt = Time.now();
    };
    workOrders.add(id, wo);
    wo;
  };

  public query func getWorkOrders(userCode : Text) : async [WorkOrder] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [WorkOrder] = [];
    for ((_id, wo) in workOrders.entries()) {
      if (wo.companyId == companyId) {
        result := arrayAppend(result, wo);
      };
    };
    result;
  };

  public shared func updateWorkOrder(adminCode : Text, orderId : Text, title : Text, orderType : Text, machineId : Text, machineName : Text, assignedTo : Text, priority : Text, status : Text, scheduledDate : Text, completedDate : Text, description : Text, notes : Text) : async WorkOrder {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (workOrders.get(orderId)) {
      case null { Runtime.trap("Work order not found") };
      case (?w) {
        let updated : WorkOrder = {
          id = w.id; companyId = w.companyId;
          title; orderType; machineId; machineName;
          assignedTo; priority; status; scheduledDate; completedDate;
          description; notes; createdAt = w.createdAt;
        };
        workOrders.add(orderId, updated);
        updated;
      };
    };
  };

  public shared func deleteWorkOrder(adminCode : Text, orderId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (workOrders.get(orderId)) {
      case null { false };
      case (?_) { workOrders.remove(orderId); true };
    };
  };



  // ===== ASSETS (SABİT KIYMET YÖNETİMİ) =====
  type Asset = {
    id : Text;
    companyId : Text;
    name : Text;
    category : Text;
    serialNumber : Text;
    location : Text;
    condition : Text;
    purchaseDate : Text;
    purchaseValue : Text;
    currentValue : Text;
    responsible : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var assets = Map.empty<Text, Asset>();

  public shared func addAsset(adminCode : Text, name : Text, category : Text, serialNumber : Text, location : Text, condition : Text, purchaseDate : Text, purchaseValue : Text, currentValue : Text, responsible : Text, notes : Text) : async Asset {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let asset : Asset = {
      id; companyId; name; category; serialNumber; location; condition;
      purchaseDate; purchaseValue; currentValue; responsible; notes;
      createdAt = Time.now();
    };
    assets.add(id, asset);
    asset;
  };

  public query func getAssets(userCode : Text) : async [Asset] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [Asset] = [];
    for ((_id, a) in assets.entries()) {
      if (a.companyId == companyId) {
        result := arrayAppend(result, a);
      };
    };
    result;
  };

  public shared func updateAsset(adminCode : Text, assetId : Text, name : Text, category : Text, serialNumber : Text, location : Text, condition : Text, purchaseDate : Text, purchaseValue : Text, currentValue : Text, responsible : Text, notes : Text) : async Asset {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (assets.get(assetId)) {
      case null { Runtime.trap("Asset not found") };
      case (?a) {
        let updated : Asset = {
          id = a.id; companyId = a.companyId;
          name; category; serialNumber; location; condition;
          purchaseDate; purchaseValue; currentValue; responsible; notes;
          createdAt = a.createdAt;
        };
        assets.add(assetId, updated);
        updated;
      };
    };
  };

  public shared func deleteAsset(adminCode : Text, assetId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (assets.get(assetId)) {
      case null { false };
      case (?_) { assets.remove(assetId); true };
    };
  };

  // ===== PERFORMANCE RECORDS (PERFORMANS TAKİBİ) =====
  type PerformanceRecord = {
    id : Text;
    companyId : Text;
    title : Text;
    kpiType : Text;
    period : Text;
    personnelOrDept : Text;
    targetValue : Text;
    actualValue : Text;
    unit : Text;
    evaluationDate : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var performanceRecords = Map.empty<Text, PerformanceRecord>();

  public shared func addPerformanceRecord(adminCode : Text, title : Text, kpiType : Text, period : Text, personnelOrDept : Text, targetValue : Text, actualValue : Text, unit : Text, evaluationDate : Text, status : Text, notes : Text) : async PerformanceRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let rec : PerformanceRecord = {
      id; companyId; title; kpiType; period; personnelOrDept;
      targetValue; actualValue; unit; evaluationDate; status; notes;
      createdAt = Time.now();
    };
    performanceRecords.add(id, rec);
    rec;
  };

  public query func getPerformanceRecords(userCode : Text) : async [PerformanceRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [PerformanceRecord] = [];
    for ((_id, r) in performanceRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updatePerformanceRecord(adminCode : Text, recordId : Text, title : Text, kpiType : Text, period : Text, personnelOrDept : Text, targetValue : Text, actualValue : Text, unit : Text, evaluationDate : Text, status : Text, notes : Text) : async PerformanceRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (performanceRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : PerformanceRecord = {
          id = r.id; companyId = r.companyId;
          title; kpiType; period; personnelOrDept;
          targetValue; actualValue; unit; evaluationDate; status; notes;
          createdAt = r.createdAt;
        };
        performanceRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deletePerformanceRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (performanceRecords.get(recordId)) {
      case null { false };
      case (?_) { performanceRecords.remove(recordId); true };
    };
  };

  // ===== ENERGY RECORDS (ENERJİ TAKİBİ) =====
  type EnergyRecord = {
    id : Text;
    companyId : Text;
    energyType : Text;
    period : Text;
    location : Text;
    unit : Text;
    consumption : Text;
    cost : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var energyRecords = Map.empty<Text, EnergyRecord>();

  public shared func addEnergyRecord(adminCode : Text, energyType : Text, period : Text, location : Text, unit : Text, consumption : Text, cost : Text, notes : Text) : async EnergyRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let rec : EnergyRecord = {
      id; companyId; energyType; period; location; unit; consumption; cost; notes;
      createdAt = Time.now();
    };
    energyRecords.add(id, rec);
    rec;
  };

  public query func getEnergyRecords(userCode : Text) : async [EnergyRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [EnergyRecord] = [];
    for ((_id, r) in energyRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateEnergyRecord(adminCode : Text, recordId : Text, energyType : Text, period : Text, location : Text, unit : Text, consumption : Text, cost : Text, notes : Text) : async EnergyRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (energyRecords.get(recordId)) {
      case null { Runtime.trap("Energy record not found") };
      case (?r) {
        let updated : EnergyRecord = {
          id = r.id; companyId = r.companyId;
          energyType; period; location; unit; consumption; cost; notes;
          createdAt = r.createdAt;
        };
        energyRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteEnergyRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (energyRecords.get(recordId)) {
      case null { false };
      case (?_) { energyRecords.remove(recordId); true };
    };
  };

  // ===== CONTRACTS (SÖZLEŞME YÖNETİMİ) =====
  type Contract = {
    id : Text;
    companyId : Text;
    title : Text;
    counterparty : Text;
    contractType : Text;
    startDate : Text;
    endDate : Text;
    value : Text;
    status : Text;
    responsible : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var contracts = Map.empty<Text, Contract>();

  public shared func addContract(adminCode : Text, title : Text, counterparty : Text, contractType : Text, startDate : Text, endDate : Text, value : Text, status : Text, responsible : Text, notes : Text) : async Contract {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let c : Contract = {
      id; companyId; title; counterparty; contractType; startDate; endDate;
      value; status; responsible; notes;
      createdAt = Time.now();
    };
    contracts.add(id, c);
    c;
  };

  public query func getContracts(userCode : Text) : async [Contract] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [Contract] = [];
    for ((_id, c) in contracts.entries()) {
      if (c.companyId == companyId) {
        result := arrayAppend(result, c);
      };
    };
    result;
  };

  public shared func updateContract(adminCode : Text, contractId : Text, title : Text, counterparty : Text, contractType : Text, startDate : Text, endDate : Text, value : Text, status : Text, responsible : Text, notes : Text) : async Contract {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (contracts.get(contractId)) {
      case null { Runtime.trap("Contract not found") };
      case (?c) {
        let updated : Contract = {
          id = c.id; companyId = c.companyId;
          title; counterparty; contractType; startDate; endDate;
          value; status; responsible; notes;
          createdAt = c.createdAt;
        };
        contracts.add(contractId, updated);
        updated;
      };
    };
  };

  public shared func deleteContract(adminCode : Text, contractId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (contracts.get(contractId)) {
      case null { false };
      case (?_) { contracts.remove(contractId); true };
    };
  };


  // ===== HR TRACKING (İNSAN KAYNAKLARI TAKİBİ) =====
  type HRRecord = {
    id : Text;
    companyId : Text;
    name : Text;
    department : Text;
    position : Text;
    employmentType : Text;
    startDate : Text;
    salary : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var hrRecords = Map.empty<Text, HRRecord>();

  public shared func addHRRecord(adminCode : Text, name : Text, department : Text, position : Text, employmentType : Text, startDate : Text, salary : Text, status : Text, notes : Text) : async HRRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let r : HRRecord = {
      id; companyId; name; department; position; employmentType; startDate; salary; status; notes;
      createdAt = Time.now();
    };
    hrRecords.add(id, r);
    r;
  };

  public query func getHRRecords(userCode : Text) : async [HRRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [HRRecord] = [];
    for ((_id, r) in hrRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateHRRecord(adminCode : Text, recordId : Text, name : Text, department : Text, position : Text, employmentType : Text, startDate : Text, salary : Text, status : Text, notes : Text) : async HRRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (hrRecords.get(recordId)) {
      case null { Runtime.trap("HR record not found") };
      case (?r) {
        let updated : HRRecord = {
          id = r.id; companyId = r.companyId;
          name; department; position; employmentType; startDate; salary; status; notes;
          createdAt = r.createdAt;
        };
        hrRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteHRRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (hrRecords.get(recordId)) {
      case null { false };
      case (?_) { hrRecords.remove(recordId); true };
    };
  };

  // ===== PROJECT COST ANALYSIS (PROJE MALİYET ANALİZİ) =====
  type CostAnalysisRecord = {
    id : Text;
    companyId : Text;
    projectName : Text;
    costCategory : Text;
    description : Text;
    plannedAmount : Text;
    actualAmount : Text;
    date : Text;
    responsible : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var costAnalysisRecords = Map.empty<Text, CostAnalysisRecord>();

  public shared func addCostAnalysisRecord(adminCode : Text, projectName : Text, costCategory : Text, description : Text, plannedAmount : Text, actualAmount : Text, date : Text, responsible : Text, status : Text, notes : Text) : async CostAnalysisRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let r : CostAnalysisRecord = {
      id; companyId; projectName; costCategory; description; plannedAmount; actualAmount; date; responsible; status; notes;
      createdAt = Time.now();
    };
    costAnalysisRecords.add(id, r);
    r;
  };

  public query func getCostAnalysisRecords(userCode : Text) : async [CostAnalysisRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [CostAnalysisRecord] = [];
    for ((_id, r) in costAnalysisRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateCostAnalysisRecord(adminCode : Text, recordId : Text, projectName : Text, costCategory : Text, description : Text, plannedAmount : Text, actualAmount : Text, date : Text, responsible : Text, status : Text, notes : Text) : async CostAnalysisRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (costAnalysisRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : CostAnalysisRecord = {
          id = r.id; companyId = r.companyId;
          projectName; costCategory; description; plannedAmount; actualAmount; date; responsible; status; notes;
          createdAt = r.createdAt;
        };
        costAnalysisRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteCostAnalysisRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (costAnalysisRecords.get(recordId)) {
      case null { false };
      case (?_) { costAnalysisRecords.remove(recordId); true };
    };
  };


  // ===== KAPASİTE PLANLAMA (CAPACITY PLANNING) =====
  type CapacityRecord = {
    id : Text;
    companyId : Text;
    resourceName : Text;
    resourceType : Text;
    totalCapacity : Text;
    usedCapacity : Text;
    unit : Text;
    period : Text;
    responsible : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var capacityRecords = Map.empty<Text, CapacityRecord>();

  public shared func addCapacityRecord(adminCode : Text, resourceName : Text, resourceType : Text, totalCapacity : Text, usedCapacity : Text, unit : Text, period : Text, responsible : Text, status : Text, notes : Text) : async CapacityRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let r : CapacityRecord = {
      id; companyId; resourceName; resourceType; totalCapacity; usedCapacity; unit; period; responsible; status; notes;
      createdAt = Time.now();
    };
    capacityRecords.add(id, r);
    r;
  };

  public query func getCapacityRecords(userCode : Text) : async [CapacityRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [CapacityRecord] = [];
    for ((_id, r) in capacityRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateCapacityRecord(adminCode : Text, recordId : Text, resourceName : Text, resourceType : Text, totalCapacity : Text, usedCapacity : Text, unit : Text, period : Text, responsible : Text, status : Text, notes : Text) : async CapacityRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (capacityRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : CapacityRecord = {
          id = r.id; companyId = r.companyId;
          resourceName; resourceType; totalCapacity; usedCapacity; unit; period; responsible; status; notes;
          createdAt = r.createdAt;
        };
        capacityRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteCapacityRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (capacityRecords.get(recordId)) {
      case null { false };
      case (?_) { capacityRecords.remove(recordId); true };
    };
  };

  // ===== KALİBRASYON TAKİBİ (CALIBRATION TRACKING) =====
  type CalibrationRecord = {
    id : Text;
    companyId : Text;
    instrumentName : Text;
    serialNumber : Text;
    category : Text;
    lastCalibrationDate : Text;
    nextCalibrationDate : Text;
    calibrationInterval : Text;
    calibratedBy : Text;
    location : Text;
    certificateNo : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var calibrationRecords = Map.empty<Text, CalibrationRecord>();

  public shared func addCalibrationRecord(adminCode : Text, instrumentName : Text, serialNumber : Text, category : Text, lastCalibrationDate : Text, nextCalibrationDate : Text, calibrationInterval : Text, calibratedBy : Text, location : Text, certificateNo : Text, status : Text, notes : Text) : async CalibrationRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let r : CalibrationRecord = {
      id; companyId; instrumentName; serialNumber; category; lastCalibrationDate; nextCalibrationDate; calibrationInterval; calibratedBy; location; certificateNo; status; notes;
      createdAt = Time.now();
    };
    calibrationRecords.add(id, r);
    r;
  };

  public query func getCalibrationRecords(userCode : Text) : async [CalibrationRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [CalibrationRecord] = [];
    for ((_id, r) in calibrationRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateCalibrationRecord(adminCode : Text, recordId : Text, instrumentName : Text, serialNumber : Text, category : Text, lastCalibrationDate : Text, nextCalibrationDate : Text, calibrationInterval : Text, calibratedBy : Text, location : Text, certificateNo : Text, status : Text, notes : Text) : async CalibrationRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (calibrationRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : CalibrationRecord = {
          id = r.id; companyId = r.companyId;
          instrumentName; serialNumber; category; lastCalibrationDate; nextCalibrationDate; calibrationInterval; calibratedBy; location; certificateNo; status; notes;
          createdAt = r.createdAt;
        };
        calibrationRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteCalibrationRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (calibrationRecords.get(recordId)) {
      case null { false };
      case (?_) { calibrationRecords.remove(recordId); true };
    };
  };


  // ===== ÜRETİM TAKİBİ (PRODUCTION TRACKING) =====
  type ProductionRecord = {
    id : Text;
    companyId : Text;
    productName : Text;
    productionLine : Text;
    shiftType : Text;
    operator : Text;
    plannedQuantity : Text;
    actualQuantity : Text;
    defectQuantity : Text;
    unit : Text;
    productionDate : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var productionRecords = Map.empty<Text, ProductionRecord>();

  public shared func addProductionRecord(adminCode : Text, productName : Text, productionLine : Text, shiftType : Text, operator_ : Text, plannedQuantity : Text, actualQuantity : Text, defectQuantity : Text, unit : Text, productionDate : Text, status : Text, notes : Text) : async ProductionRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let r : ProductionRecord = {
      id; companyId; productName; productionLine; shiftType; operator = operator_; plannedQuantity; actualQuantity; defectQuantity; unit; productionDate; status; notes;
      createdAt = Time.now();
    };
    productionRecords.add(id, r);
    r;
  };

  public query func getProductionRecords(userCode : Text) : async [ProductionRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [ProductionRecord] = [];
    for ((_id, r) in productionRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateProductionRecord(adminCode : Text, recordId : Text, productName : Text, productionLine : Text, shiftType : Text, operator_ : Text, plannedQuantity : Text, actualQuantity : Text, defectQuantity : Text, unit : Text, productionDate : Text, status : Text, notes : Text) : async ProductionRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (productionRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : ProductionRecord = {
          id = r.id; companyId = r.companyId;
          productName; productionLine; shiftType; operator = operator_; plannedQuantity; actualQuantity; defectQuantity; unit; productionDate; status; notes;
          createdAt = r.createdAt;
        };
        productionRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteProductionRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (productionRecords.get(recordId)) {
      case null { false };
      case (?_) { productionRecords.remove(recordId); true };
    };
  };

  // ===== KİMYASAL & TEHLİKELİ MADDE YÖNETİMİ (CHEMICAL MANAGEMENT) =====
  type ChemicalRecord = {
    id : Text;
    companyId : Text;
    chemicalName : Text;
    casNumber : Text;
    hazardClass : Text;
    storageLocation : Text;
    quantity : Text;
    unit : Text;
    supplierName : Text;
    expiryDate : Text;
    sdsNumber : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var chemicalRecords = Map.empty<Text, ChemicalRecord>();

  public shared func addChemicalRecord(adminCode : Text, chemicalName : Text, casNumber : Text, hazardClass : Text, storageLocation : Text, quantity : Text, unit : Text, supplierName : Text, expiryDate : Text, sdsNumber : Text, status : Text, notes : Text) : async ChemicalRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let r : ChemicalRecord = {
      id; companyId; chemicalName; casNumber; hazardClass; storageLocation; quantity; unit; supplierName; expiryDate; sdsNumber; status; notes;
      createdAt = Time.now();
    };
    chemicalRecords.add(id, r);
    r;
  };

  public query func getChemicalRecords(userCode : Text) : async [ChemicalRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [ChemicalRecord] = [];
    for ((_id, r) in chemicalRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateChemicalRecord(adminCode : Text, recordId : Text, chemicalName : Text, casNumber : Text, hazardClass : Text, storageLocation : Text, quantity : Text, unit : Text, supplierName : Text, expiryDate : Text, sdsNumber : Text, status : Text, notes : Text) : async ChemicalRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (chemicalRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : ChemicalRecord = {
          id = r.id; companyId = r.companyId;
          chemicalName; casNumber; hazardClass; storageLocation; quantity; unit; supplierName; expiryDate; sdsNumber; status; notes;
          createdAt = r.createdAt;
        };
        chemicalRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteChemicalRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (chemicalRecords.get(recordId)) {
      case null { false };
      case (?_) { chemicalRecords.remove(recordId); true };
    };
  };


  // ===================== KALIP & APARAT TAKİBİ =====================
  type MoldRecord = {
    id : Text;
    companyId : Text;
    moldName : Text;
    moldCode : Text;
    category : Text;
    material : Text;
    location : Text;
    usageCount : Text;
    maxUsageCount : Text;
    lastMaintenanceDate : Text;
    nextMaintenanceDate : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var moldRecords = Map.empty<Text, MoldRecord>();

  public shared func addMoldRecord(adminCode : Text, moldName : Text, moldCode : Text, category : Text, material : Text, location : Text, usageCount : Text, maxUsageCount : Text, lastMaintenanceDate : Text, nextMaintenanceDate : Text, status : Text, notes : Text) : async MoldRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let record : MoldRecord = {
      id; companyId; moldName; moldCode; category; material; location; usageCount; maxUsageCount; lastMaintenanceDate; nextMaintenanceDate; status; notes;
      createdAt = Time.now();
    };
    moldRecords.add(id, record);
    record;
  };

  public query func getMoldRecords(userCode : Text) : async [MoldRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [MoldRecord] = [];
    for ((_id, r) in moldRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateMoldRecord(adminCode : Text, recordId : Text, moldName : Text, moldCode : Text, category : Text, material : Text, location : Text, usageCount : Text, maxUsageCount : Text, lastMaintenanceDate : Text, nextMaintenanceDate : Text, status : Text, notes : Text) : async MoldRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (moldRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : MoldRecord = {
          id = r.id; companyId = r.companyId;
          moldName; moldCode; category; material; location; usageCount; maxUsageCount; lastMaintenanceDate; nextMaintenanceDate; status; notes;
          createdAt = r.createdAt;
        };
        moldRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteMoldRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (moldRecords.get(recordId)) {
      case null { false };
      case (?_) { moldRecords.remove(recordId); true };
    };
  };

  // ===================== STOK SAYIMI =====================
  type StockCountRecord = {
    id : Text;
    companyId : Text;
    itemName : Text;
    itemCode : Text;
    category : Text;
    location : Text;
    expectedQty : Text;
    actualQty : Text;
    unit : Text;
    countDate : Text;
    countedBy : Text;
    status : Text;
    notes : Text;
    createdAt : Time.Time;
  };

  stable var stockCountRecords = Map.empty<Text, StockCountRecord>();

  public shared func addStockCountRecord(adminCode : Text, itemName : Text, itemCode : Text, category : Text, location : Text, expectedQty : Text, actualQty : Text, unit : Text, countDate : Text, countedBy : Text, status : Text, notes : Text) : async StockCountRecord {
    let companyId = switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?c) { c };
    };
    let id = newCode();
    let record : StockCountRecord = {
      id; companyId; itemName; itemCode; category; location; expectedQty; actualQty; unit; countDate; countedBy; status; notes;
      createdAt = Time.now();
    };
    stockCountRecords.add(id, record);
    record;
  };

  public query func getStockCountRecords(userCode : Text) : async [StockCountRecord] {
    let companyId = switch (getCompanyIdForUserCode(userCode)) {
      case null { return [] };
      case (?id) { id };
    };
    var result : [StockCountRecord] = [];
    for ((_id, r) in stockCountRecords.entries()) {
      if (r.companyId == companyId) {
        result := arrayAppend(result, r);
      };
    };
    result;
  };

  public shared func updateStockCountRecord(adminCode : Text, recordId : Text, itemName : Text, itemCode : Text, category : Text, location : Text, expectedQty : Text, actualQty : Text, unit : Text, countDate : Text, countedBy : Text, status : Text, notes : Text) : async StockCountRecord {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (stockCountRecords.get(recordId)) {
      case null { Runtime.trap("Record not found") };
      case (?r) {
        let updated : StockCountRecord = {
          id = r.id; companyId = r.companyId;
          itemName; itemCode; category; location; expectedQty; actualQty; unit; countDate; countedBy; status; notes;
          createdAt = r.createdAt;
        };
        stockCountRecords.add(recordId, updated);
        updated;
      };
    };
  };

  public shared func deleteStockCountRecord(adminCode : Text, recordId : Text) : async Bool {
    switch (verifyAdminCode(adminCode)) {
      case null { Runtime.trap("Invalid admin code") };
      case (?_) {};
    };
    switch (stockCountRecords.get(recordId)) {
      case null { false };
      case (?_) { stockCountRecords.remove(recordId); true };
    };
  };

};
