# FactoryVerse

## Current State
v22 modules (MaintenanceCostPage, TrainingProgramPage, SafetyIncidentPage, BudgetRevisionPage) exist as page files and are in Sidebar/NavigationContext but are NOT connected in App.tsx (missing imports and switch cases). The app has 40+ operational modules.

## Requested Changes (Diff)

### Add
- Connect v22 pages in App.tsx (imports + switch cases for: maintenance-cost, training-program, safety-incident, budget-revision)
- 6 new frontend-only modules using localStorage pattern (consistent with recent modules):
  1. **Aksiyon Planı Takibi** (page: `action-plans`) - corrective/preventive action plans, responsible, deadline, priority, status, linked issue
  2. **Satın Alma Talep Yönetimi** (page: `purchase-requests`) - purchase requests, item/qty/cost, requestor, department, approval status
  3. **Devamsızlık Takibi** (page: `absence-tracking`) - employee absences, type (izin/hastalık/mazeret), date range, approved/rejected
  4. **Proje Kilometre Taşları** (page: `milestones`) - project milestones, linked project, planned vs actual date, completion %
  5. **İletişim Rehberi** (page: `contact-directory`) - internal/external contacts, department, role, phone/email
  6. **SOP & Prosedür Kütüphanesi** (page: `sop-library`) - procedure/SOP records, category, revision number, effective date, owner, status
- Add all 10 new routes to NavigationContext Page type
- Add all 10 new items to Sidebar navItems
- Add types for new modules to types.ts
- Add hooks to useQueries.ts for new modules

### Modify
- App.tsx: add imports and switch cases for v22 + 6 new pages
- NavigationContext.tsx: add 6 new page strings to Page type
- Sidebar.tsx: add 6 new nav items
- types.ts: add 6 new interfaces
- useQueries.ts: add CRUD hooks for 6 new modules

### Remove
- Nothing

## Implementation Plan
1. Update NavigationContext Page type to include 6 new pages
2. Add 6 new interfaces to types.ts
3. Add localStorage-based CRUD hooks to useQueries.ts for 6 new modules
4. Create 6 new page files following existing patterns
5. Update Sidebar with 6 new items
6. Update App.tsx: import all 10 new pages + add switch cases
7. Validate build
