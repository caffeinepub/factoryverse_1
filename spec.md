# FactoryVerse — v39 Final Stabilization

## Current State
- 100+ modül tamamlanmış durumda (v38 itibarıyla)
- Sidebar: 100+ madde düz liste halinde, hiç kategori grubu yok — kullanılamaz UX
- App.tsx'de iki route uyumsuzluğu: `equipment-maintenance-history` ve `employee-perf-review` protectedPages'de yanlış isimlendirme
- Eksik modüller: Depo Yönetimi, Hammadde Takibi
- Dashboard: temel KPI kartları var ama modül başarımı ve hızlı erişim zayıf

## Requested Changes (Diff)

### Add
- `WarehousePage.tsx` — Depo Yönetimi: depo alanları, bölge/doluluk takibi, stok konumu, kapasite uyarısı
- `RawMaterialsPage.tsx` — Hammadde Takibi: hammadde envanteri, tedarikçi kaynağı, min stok uyarısı, birim tüketim
- Sidebar'a bu 2 yeni modül eklenir, "Tedarik & Depo" grubu altına

### Modify
- **Sidebar.tsx**: Düz 100+ madde yerine 11 collapsible kategori grubu. Her grup başlık + chevron ikonuyla açılır/kapanır. Aktif sayfanın bulunduğu grup otomatik açık. Gruplar:
  1. Ana Ekran (Dashboard, KPI, Raporlama, Bildirimler, Ayarlar)
  2. İnsan Kaynakları (Personel, HR, Norm Kadro, İzin, Devamsızlık, Vardiya Planlama, Vardiya Çizelgesi, Rotasyon, Görev Devri, Kariyer, Perf. Değerlendirme, Yetenek Matrisi, Memnuniyet Anketi, İş Başvuruları, Eğitim & Sertifika, Eğitim Programı, Eğitim Sertifikaları)
  3. Üretim & Kalite (Üretim, Kalite, KK Formu, Üretim Kalite Raporu, Kalite Hedefleri, Kapasite, Vardiya Raporları, Kalıp & Aparat)
  4. Bakım & Ekipman (Makineler, Bakım, Arıza, İş Emirleri, Bakım Takvimi, Bakım Maliyeti, Bakım Bütçe, Kalibrasyon, Ekipman Bakım Geçmişi, Ekipman Kiralama, Ekipman Ömür, Arıza Analizi, Ekipman Enerji, Teçhizat Kullanım, MGBF, Yedek Parça, Yedek Parça Siparişleri)
  5. Tedarik & Depo (Tedarikçiler, Tedarikçi Değerlendirme, Tedarikçi Siparişleri, Tedarikçi Sözleşmeleri, Tedarikçi Skorkartı, Tedarikçi Şikayetleri, Satın Alma, Tedarik Zinciri, Stok Sayımı, Envanter, Kimyasal, Depo Yönetimi, Hammadde Takibi)
  6. Güvenlik & Çevre (İSG, Güvenlik Olayı, İş Sağlığı, Güvenlik Turu, Çevre & Atık, Çevre Ölçüm, Atık Bertaraf, Geri Dönüşüm, Kök Neden Analizi)
  7. Finans & Bütçe (Bütçe, Bütçe Revizyon, Maliyet Analizi, Genel Gider, Bakım Maliyeti, Tesis Bakım Maliyeti)
  8. Proje Yönetimi (Projeler, Görevler, Kilometre Taşları, Proje Risk, Proje Değişiklik, Proje Kaynakları, Proje Durum Raporları, Proje Kapanış Raporu, Aksiyon Planları, İş Akışı)
  9. Tesis & Altyapı (Sabit Kıymetler, Araç & Taşıt, Araç Muayene, Kira Yönetimi, Tesis Hasarı, Tesis Bakım Planı, Tesis Temizlik Planı, Tesis Enerji Haritası, Enerji Takibi, Enerji Verimliliği, Elektrik/Mekanik Proje, Taşeron İş)
  10. Doküman & Uyum (Dokümanlar, SOP, Doküman Revizyon, Malzeme Sertifika, Hukuki Uyum, Sigorta Poliçeleri, Sözleşmeler, Garanti, Personel Yetki)
  11. Denetim & İletişim (Risk, Denetim, Saha Denetimi, Muayene, Şikayet, Performans, İletişim, Ziyaretçi)
- **NavigationContext.tsx**: `warehouse` ve `raw-materials` page type eklenir
- **App.tsx**: Yeni route'lar eklenir; `equipment-maintenance-history` → `equipment-maintenance`, `employee-perf-review` → `perf-review` protectedPages düzeltilir
- **DashboardPage.tsx**: Modül istatistik kart sayısı güncellenir, Hızlı Erişim alanına KPI Dashboard ve Raporlama linkleri eklenir

### Remove
- Sidebar'dan düz navItems array (gruplandırılmış yapıyla değiştirilir)

## Implementation Plan
1. `WarehousePage.tsx` yaz: depo alanları CRUD, bölge/konum, doluluk %, kapasite uyarısı (%90+)
2. `RawMaterialsPage.tsx` yaz: hammadde envanteri, min stok uyarısı (kritik badge), tüketim oranı
3. `NavigationContext.tsx` güncelle: `warehouse` ve `raw-materials` tipleri ekle
4. `App.tsx` güncelle: import'lar, routes, protectedPages düzeltmeleri
5. `Sidebar.tsx` tamamen yeniden yaz: collapsible NavGroup bileşeni, 11 grup, aktif grup auto-expand, arama kutusu (isteğe bağlı)
6. `DashboardPage.tsx` güncelle: hızlı erişim linkleri güncelle
7. Validate & deploy
