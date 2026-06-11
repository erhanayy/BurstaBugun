# BurstaBugün & FBİAD Vakfı - Geliştirme Analizleri ve Güncellemeler (Implementation Logs)

Bu dosya, projede yapılan önemli mantıksal değişikliklerin (business logic), canlı ortam güncellemelerinin ve teknik analizlerin kaydedildiği yerdir.

---
### 📝 09.06.2026 Canlı Ortam (Production) Güncellemeleri
- **Kurumsal İmaj & CSS:** Cloud Run'da Tailwind CSS'in v4 versiyonunun `@source` yapılandırması ayarlanarak canlı ortamda CSS yüklenmemesi sorunu çözüldü.
- **Güvenlik / Auth:** NextAuth'un Google Cloud arkasında çalışabilmesi için `AUTH_TRUST_HOST=true` ayarı yapıldı.
- **E-posta ve DNS:** fbiadvakfi.org alan adı Google Cloud'da yönlendirildi. noreply@fbiadvakfi.org için Resend API entegre edildi.
- **Database IP Sorunu:** `.env.production` içerisindeki hatalı IP adresi güncellenerek "Sonsuz Giriş" hatası ve "Veritabanı Zaman Aşımı" çözüldü.
- **Statik Önbellek İptali:** `app/login/page.tsx` sayfalarına `export const dynamic = 'force-dynamic'` eklenerek Next.js'in Tenant logolarını önbelleklemesi engellendi.
- **BCC Sistemi:** Sistemden giden tüm e-postaların arka planda `erhanayyildiz@gmail.com` adresine BCC (gizli karbon kopya) olarak da düşmesi sağlandı.
- **Dinamik Mail Şablonu:** E-posta içeriklerindeki statik "BurstaBugün" metinleri, kullanıcının kayıt olduğu vakfın adına (Örn: FBİAD Vakfı) göre dinamik olarak değişecek şekilde güncellendi.

---
### 📝 11.06.2026 Mantıksal Hata (Business Logic) Güncellemeleri
- **Ödeme Servis Adresi:** `FBIADVakfiWeb` mobil/web entegrasyonu içindeki ödeme onay (webhook) API'sinin, production ortamında `localhost:3003`'e istek atması engellendi. Artık yerelde `3004`, canlıda `https://burs.fbiadvakfi.org` üzerinden çalışacak şekilde düzeltildi ve `fbiad-web` Cloud Run servisine deploy edildi.
- **Dönem Parametrelerinin Kilitlenmesi:** Fon Oluşturma ekranında, seçilen döneme ait sistem parametreleri (Aylık Tutar, Fon Süresi, Başlangıç Tarihi) belirlenmişse, bu değerler forma otomatik dolarak **Admin dahil herkes için kilitli (readOnly)** hale getirildi.
- **Ödeme Takvimi Değişikliği:** Öğrenci bir fona atandığında (sponsor onayı), oluşturulan otomatik taksitlendirme mantığı güncellendi:
  - **1. Taksit:** Beklemeksizin anında fonun **Başlangıç Tarihi**ne (ilk ödeme günü) planlandı.
  - **2. ve Sonraki Taksitler:** Başlangıç tarihini takip eden ayların **1. gününe** denk gelecek şekilde hesaplanmaya başlandı.
