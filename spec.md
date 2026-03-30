# FactoryVerse

## Current State
v24 is live with 50+ modules. Latest modules: Norm Kadro, Taşeron İş Takibi, Sigorta Poliçe, Enerji Verimliliği. All use localStorage via useQueries.ts hooks with lsGet/lsSet pattern.

## Requested Changes (Diff)

### Add
- **Ekipman Kiralama Takibi** (`equipment-rental`) - rental equipment records: equipment name, supplier, rental start/end date, daily/monthly rate, currency, responsible person, status (Aktif/Teslim Edildi/İptal), location, notes. Summary cards: total, active, cost total.
- **İş Başvuru Yönetimi** (`job-applications`) - job application tracking: position name, applicant name, application date, source (LinkedIn/Referans/İş İlanı/Diğer), department, status (Başvuru Alındı/Mülakat/Teknik Test/Teklif/Kabul Edildi/Reddedildi), interview date, interviewer, notes. Summary cards: total, active interviews, accepted.
- **Garanti Takibi** (`warranty`) - warranty records for equipment/assets: item name, brand, model, serial number, purchase date, warranty start/end date, supplier, warranty type (Üretici/Tedarikçi/Uzatılmış), status (Aktif/Süresi Doldu/Talep Açıldı), 30-day expiry warning banner, notes.
- **Proje Risk Kaydı** (`project-risks`) - project-specific risk register: risk title, project name, risk category (Teknik/Mali/Operasyonel/Dış/İnsan Kaynağı), probability (Düşük/Orta/Yüksek), impact (Düşük/Orta/Yüksek), risk level computed badge (Low/Medium/High/Critical based on matrix), mitigation plan, owner, status (Açık/Azaltılıyor/Kapalı/Kabul Edildi), notes.

### Modify
- `types.ts`: Add 4 new interfaces: EquipmentRental, JobApplication, WarrantyRecord, ProjectRiskItem
- `useQueries.ts`: Add CRUD hooks for all 4 new types
- `App.tsx`: Add 4 new page imports, routes, protectedPages entries
- `Sidebar.tsx`: Add 4 new nav items with appropriate icons

### Remove
- Nothing

## Implementation Plan
1. Add interfaces to types.ts
2. Add CRUD hooks to useQueries.ts using lsGet/lsSet pattern
3. Create 4 page components following existing pattern
4. Update App.tsx with imports/routes
5. Update Sidebar.tsx with nav items
6. Validate
