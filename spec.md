# FactoryVerse — v40 Final Build

## Current State

The app is at v39 with 130+ pages covering HR, production, maintenance, procurement, safety, finance, projects, facility, compliance, and audit. Sidebar uses 11 collapsible category groups. Backend is Motoko-based with full persistence. All core modules are implemented.

Pages already existing (partial list of notable ones):
- HR: personnel, hr, staffing-plan, leave, absence-tracking, shifts, personnel-shift-schedule, shift-reports, personnel-rotation, personnel-handover, career-planning, perf-review, skills-matrix, satisfaction-surveys, job-applications, training, training-program, training-certs
- Production: production, quality, qc-forms, production-quality, quality-targets, capacity, molds
- Maintenance: machines, maintenance, faults, workorders, maintenance-calendar, maintenance-cost, maintenance-budget, calibration, equipment-maintenance, equipment-rental, equipment-lifecycle, equipment-fault-analysis, equipment-energy, equipment-utilization, mtbf, spare-parts, spare-parts-orders
- Supply: suppliers, supplier-eval, supplier-orders, supplier-contracts, supplier-scorecard, supplier-complaints, purchase-requests, supplychain, stockcount, inventory, chemicals, warehouse, raw-materials
- Safety: safety, safety-incident, occupational-health, security-tours, environment, env-measurements, waste-disposal, waste-recycling, root-cause-analysis
- Finance: budget, budget-revision, costanalysis, general-expenses, facility-maint-cost
- Projects: projects, tasks, milestones, project-risks, project-changes, project-resources, project-status-reports, project-closure, action-plans, workflows
- Facility: assets, vehicles, vehicle-inspection, lease-management, facility-damage, facility-maint-plan, facility-cleaning, energy-map, energy, energy-targets, elec-mech-projects, subcontractor
- Documents: documents, sop-library, doc-revision, material-certs, legal-compliance, insurance, contracts, warranty, personnel-auth
- Audit: risk, audits, field-audits, inspection-management, complaints, performance, contact-directory, visitors

## Requested Changes (Diff)

### Add
- **Maaş & Ücret Takibi** (`salary-tracking`) — personnel salary records, pay periods, net/gross amounts, payment status (HR group)
- **Fatura Yönetimi** (`invoice-management`) — inbound/outbound invoices, supplier/customer, due date alerts, payment status (Finance group)
- **Müşteri Sipariş Takibi** (`customer-orders`) — customer order management, order status, delivery dates, priority (new Müşteri group OR Audit group)
- **İzin Talep Yönetimi** (`leave-requests`) — employee leave request workflow, approval/rejection, leave type, dates, approver tracking (HR group)

### Modify
- Dashboard: add module count summary card ("Toplam Modül: X"), update quick access grid to include Finance and Supply shortcuts
- Sidebar: add 4 new items to appropriate groups (HR gets salary + leave-requests; Finance gets invoice-management; Audit/Denetim gets customer-orders)

### Remove
- Nothing to remove

## Implementation Plan

1. Create 4 new page files:
   - `SalaryTrackingPage.tsx` — table of salary records, add/edit modal, pay period filter, gross/net/status columns, totals summary
   - `InvoiceManagementPage.tsx` — inbound & outbound tabs, invoice no, party name, amount, due date with color alert, status badge
   - `CustomerOrdersPage.tsx` — order list with customer name, product, quantity, order date, delivery date, priority badge, status flow
   - `LeaveRequestsPage.tsx` — leave request list with employee name, leave type (Yıllık/Mazeret/Hastalık/Doğum), start/end date, days, status (Beklemede/Onaylandı/Reddedildi), approver, action buttons for admin

2. Register routes in `App.tsx`: `salary-tracking`, `invoice-management`, `customer-orders`, `leave-requests`

3. Update `Sidebar.tsx`:
   - HR group: add Maaş & Ücret Takibi (DollarSign icon), İzin Talep Yönetimi (CalendarCheck icon) 
   - Finance group: add Fatura Yönetimi (Receipt icon)
   - Audit group: add Müşteri Siparişleri (ShoppingBag icon)

4. Update `DashboardPage.tsx`:
   - Add "Toplam Modül" KPI card (static count ~134)
   - Add Finance and Supply shortcuts to quick access grid
