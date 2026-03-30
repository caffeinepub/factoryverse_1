# FactoryVerse – v43: Personel Modül Yetkilendirme Sistemi

## Current State

FactoryVerse v42 is live with 134 operational modules, a 11-group collapsible sidebar, and two login types (admin/personnel). Currently, all logged-in users see all 134 modules regardless of their role. There is no module-level access control for personnel. The backend has `registerCompany`, `registerPersonnel`, `getCompanyPersonnel` and CRUD for 134 modules. The `AuthSession` stores `userCode`, `userType`, `companyName`, `companyMode`, `userName`.

## Requested Changes (Diff)

### Add
- Backend: `PermissionRole` type (id, companyId, name, modules: [Text]) + stable storage
- Backend: `PersonnelPermission` type (loginCode, companyId, roleId, additionalModules, removedModules) + stable storage
- Backend: `addPermissionRole(adminCode, roleName, modules)` → PermissionRole
- Backend: `updatePermissionRole(adminCode, roleId, roleName, modules)` → PermissionRole
- Backend: `deletePermissionRole(adminCode, roleId)` → Bool
- Backend: `getPermissionRoles(adminCode)` → [PermissionRole]
- Backend: `setPersonnelPermission(adminCode, loginCode, roleId, additionalModules, removedModules)` → PersonnelPermission
- Backend: `getPersonnelPermission(adminCode, loginCode)` → ?PersonnelPermission
- Backend: `getMyAllowedModules(loginCode)` → ?[Text] (null = unrestricted, array = specific allowed pages)
- Frontend: `PermissionRolesPage.tsx` – Yetki Yönetimi page with two tabs:
  - Tab 1 "Roller": create/edit/delete named roles; each role selects from all 134 module page IDs via checkboxes grouped by sidebar category
  - Tab 2 "Personel Yetkileri": list company personnel; assign a role to each person; optional per-person add/remove module overrides
- Frontend: Add `allowedModules: string[] | null` to `AuthSession` (null = all modules)
- Frontend: On personnel login, call `getMyAllowedModules` and store result in session
- Frontend: Sidebar filters nav items so only allowed modules appear (admin always sees all)
- Frontend: Add "Yetki Yönetimi" item to sidebar Ana Ekran group (admin only, hidden for personnel)
- Frontend: Add route `permission-roles` to App.tsx

### Modify
- `AuthContext.tsx`: Add `allowedModules` field to `AuthSession`; persist in localStorage
- `LoginPage.tsx`: After successful personnel login, call `getMyAllowedModules` and include result in login session
- `Sidebar.tsx`: Filter each nav item against `allowedModules` for personnel sessions; add Yetki Yönetimi link for admins
- `backend.d.ts`: Add new types and methods
- `backend.did.js`: Add new IDL entries
- `main.mo`: Append permission system code

### Remove
- Nothing removed

## Implementation Plan

1. Append PermissionRole and PersonnelPermission types + stable vars + all 6 backend methods to `main.mo`
2. Update `backend.d.ts` with new interfaces and method signatures
3. Update `backend.did.js` with new IDL definitions
4. Update `AuthContext.tsx` to add `allowedModules: string[] | null` to session
5. Update `LoginPage.tsx` to fetch `getMyAllowedModules` after personnel login
6. Create `PermissionRolesPage.tsx` with Rol Yönetimi + Personel Yetkileri tabs
7. Update `Sidebar.tsx` to filter modules per session + add Yetki Yönetimi link
8. Update `App.tsx` to add `permission-roles` route
9. Validate and deploy
