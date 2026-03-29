# FactoryVerse

## Current State
v19 deployed with 25+ modules. Latest additions: Üretim Takibi, Kimyasal & Tehlikeli Madde Yönetimi.

## Requested Changes (Diff)

### Add
- **Kalıp & Aparat Takibi**: Mold/fixture inventory, usage count tracking, maintenance plans, status badges
- **Stok Sayımı**: Periodic stock count records, expected vs actual quantity, difference analysis, count status

### Modify
- App.tsx: add routes for molds and stockcount pages
- Sidebar.tsx: add nav items for both new modules
- backend.d.ts: add type definitions and function signatures
- main.mo: add persistent storage and CRUD for both modules

### Remove
- Nothing

## Implementation Plan
1. Add MoldRecord and StockCountRecord types + CRUD to main.mo
2. Update backend.d.ts with new types and function signatures
3. Create MoldsPage.tsx (kalıp & aparat takibi)
4. Create StockCountPage.tsx (stok sayımı)
5. Update App.tsx to add imports and routes
6. Update Sidebar.tsx to add nav items
