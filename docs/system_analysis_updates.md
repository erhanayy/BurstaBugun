# Sistem Analiz Güncellemeleri

Bu dosya yeni geliştirilen her özelliğin çalışma mantıklarını, akışlarını ve analiz detaylarını barındırır. Yeni bir eklenti / feature geliştirildiğinde mimari detaylarıyla birlikte buraya işlenmelidir.

## 1. Bildirim Sistemi ve Arka Plan Tetikleyicileri (Triggers)
- **Açıklama:** Sistemde gerçekleşen kritik eylemlerde ilgili kullanıcılara anında bildirim (web-push) gönderilmesini sağlayan altyapı.
- **Mantık:** 
  - `user_notification_settings` tablosundan kullanıcının aktif izinleri kontrol edilir.
  - İzin verilmişse `createNotification` fonksiyonu aracılığıyla bildirimler `notifications` tablosuna yazılır.
- **Tetikleme Noktaları (Triggers):**
  - Seçim (Placement): Öğrenci, Sponsor tarafından bir fona seçildiğinde (`selectBursiyer`).
  - Referans Onayı: Bir Referans, onayını sisteme kaydettiğinde (`processReferenceApproval`).
  - Ödeme: Zamanı gelen bir tahsisat admin tarafından `Paid` yapıldığında (`markAsPaid`).

## 2. Kümülatif Kazanç Limiti (MAX_MONTHLY_LIMIT)
- **Açıklama:** Öğrencinin haksız zenginleşmesini veya fondaki bütçelerin adaletsiz dağıtımını önleyen güvenlik kilidi.
- **Mantık:**
  - `system_parameters` tablosunda `MAX_MONTHLY_LIMIT` isimli global değişken kontrol edilir.
  - Sponsor, havuzdaki bir öğrenciyi fona seçmeye tıkladığında öğrencinin halihazırda bağlı olduğu (Aktif) tüm `fundSelections` kayıtlarının ödemeleri (amount) toplanır.
  - Sınır aşılıyorsa hata fırlatılır. Aşılmıyorsa onaya izin verilir.
- **Arayüz Etkileri:** Bursiyer havuzundaki liste görünümünde öğrenci hali hazırda para alıyorsa `AlertTriangle` komponenti ile amber renkli bir uyarı ve kalan tutar limiti panel üzerinden Sporsor'a gösterilir.

## 3. Sistem Parametreleri ve İzolasyon (Admin Ekranı)
- **Açıklama:** Hardcoded (Koda gömülü) kısıtlamaların terk edilerek tamamen Admin paneline taşınması ve Multi-Tenant mimarisine (Her vakfın kendi kısıtlarını belirlemesi) entegrasyonu.
- **Mantık:**
  - `system_parameters` tablosunda parametreler global değil, **tenantId** bazlı (Composite Unique Index: tenantId + key) tutulur.
  - "Sistem Yönetimi" menüsünün altında `/dashboard/admin/parameters` ekranında bu kısıt değişiklikleri (Örn: `MAX_MONTHLY_LIMIT`, `MASK_STUDENT_NAMES`) anlık olarak yapılabilir.
  - **MASK_STUDENT_NAMES (İsim Maskeleme):** Aktif edildiğinde Bursveren/Sponsor/Kurum yetkisindeki kullanıcılar "Bursiyer Havuzu" ve "Fona Dahil Öğrenciler" listesinde öğrenci isimlerini gizlilik gereği (Örn: `A.Y.` veya `F.E.A.`) formatında baş harfleriyle görürler. Admin yetkisindekiler ve öğrencinin kendisi veriyi her zaman açık formatta görebilir. Restarta gerek yoktur.
## 4. Kullanıcı Deneyimi Header Logoları
- **Açıklama:** Sisteme giriş yapıldığında Top-Right Header (Sağ üst) köşesinin profesyonel Dashboard stiline oturtulması.
- **Mantık:** 
  - Notification Popover (Bildirim zili, okundu sayacı, dinleyici altyapı).
  - Kullanıcı isminin baş harflerinden (Split ile) oluşturulan gradient yuvarlak Profil ikonu.
  - BurstaBugün marka logosu (Image bileşeni).

## 5. Sözleşmeler Modülü (My Contracts)
- **Açıklama:** Kvkk, Kullanıcı Koşulları vb. yasal belgelerin versiyonlu şekilde sürüm atlamasını sağlayan, kullanıcılar giriş yaptığında eski sözleşmelerde eksiklik varsa tamamlamalarını zorlayan kapı kilidi sistemi.
- **Mantık:** 
  - Admin (Sistem Yönetimi -> Sözleşmeler) her bir metni yazar ve "Yayınla" der. Versiyon artar.
  - Kullanıcı login olduğunda Layout bazında `ContractEnforcer` devreye girer. Onaylanmamış sürüm varsa ana ekrana değil zorunlu onay popupına düşer. Onayladıkça `userAgreements` onayı işaretlenir.

## 6. Multi-Tenant ve White-Label Mimarisi (Tek Kod Tabanı)
- **Açıklama:** BurstaBugün kod tabanının kopyalanmasına (branch) gerek kalmadan, tek bir sistem üzerinden sonsuz sayıda bağımsız kuruma (Örn: FBİAD Vakfı) özel hizmet verilebilmesi altyapısı.
- **Mantık:** 
  - `NEXT_PUBLIC_TENANT_ID` ortam değişkeni kullanılarak sistem tamamen tek bir vakfın verilerine kilitlenebilir (Strict Mode).
  - Değişken verildiğinde `getPublicTenantInfo` ve `getCurrentTenant` fonksiyonları çerezlere bakmaksızın doğrudan hedef Tenant'ı aktif eder. Login ekranı, logolar, renkler (`primaryColor`) tamamen bu vakfın veritabanı ayarlarından çekilir.
  - Eğer kullanıcı bu vakfın üyesi değilse sisteme girişi otomatik olarak reddedilir (Tam İzolasyon).
  - SuperAdmin (`isApplicationAdmin: true`) sisteme girdiğinde tüm kurumları yönetebilir ve Header'daki "Tenant Switcher" ikonu ile vakıflar arası gezinti yapabilir. Ancak `NEXT_PUBLIC_TENANT_ID` verilmiş "Strict Mode" çalışıyorsa, SuperAdmin bile olsa Tenant Switcher gizlenerek sunucunun bütünlüğü korunur.
  - Yeni kayıtlar (`/register`), eğer Strict Mode aktifse otomatik olarak varsayılan kurum yerine, kilitli olan Tenant'a kaydedilir.

## 7. 09.06.2026 Canlı Ortam (Production) Güncellemeleri
- **Kurumsal İmaj & CSS:** Cloud Run'da Tailwind CSS'in v4 versiyonunun `@source` yapılandırması ayarlanarak canlı ortamda CSS yüklenmemesi sorunu çözüldü.
- **Güvenlik / Auth:** NextAuth'un Google Cloud arkasında çalışabilmesi için `AUTH_TRUST_HOST=true` ayarı yapıldı.
- **E-posta ve DNS:** fbiadvakfi.org alan adı Google Cloud'da yönlendirildi. noreply@fbiadvakfi.org için Resend API entegre edildi.
- **Database IP Sorunu:** `.env.production` içerisindeki hatalı IP adresi güncellenerek "Sonsuz Giriş" hatası ve "Veritabanı Zaman Aşımı" çözüldü.
- **Statik Önbellek İptali:** `app/login/page.tsx` sayfalarına `export const dynamic = 'force-dynamic'` eklenerek Next.js'in Tenant logolarını önbelleklemesi engellendi.
- **BCC Sistemi:** Sistemden giden tüm e-postaların arka planda `erhanayyildiz@gmail.com` adresine BCC (gizli karbon kopya) olarak da düşmesi sağlandı.
- **Dinamik Mail Şablonu:** E-posta içeriklerindeki statik "BurstaBugün" metinleri, kullanıcının kayıt olduğu vakfın adına (Örn: FBİAD Vakfı) göre dinamik olarak değişecek şekilde güncellendi.

## 8. 11.06.2026 Mantıksal Hata (Business Logic) Güncellemeleri
- **Ödeme Servis Adresi:** `FBIADVakfiWeb` mobil/web entegrasyonu içindeki ödeme onay (webhook) API'sinin, production ortamında `localhost:3003`'e istek atması engellendi. Artık yerelde `3004`, canlıda `https://burs.fbiadvakfi.org` üzerinden çalışacak şekilde düzeltildi ve `fbiad-web` Cloud Run servisine deploy edildi.
- **Dönem Parametrelerinin Kilitlenmesi:** Fon Oluşturma ekranında, seçilen döneme ait sistem parametreleri (Aylık Tutar, Fon Süresi, Başlangıç Tarihi) belirlenmişse, bu değerler forma otomatik dolarak **Admin dahil herkes için kilitli (readOnly)** hale getirildi.
- **Ödeme Takvimi Değişikliği:** Öğrenci bir fona atandığında (sponsor onayı), oluşturulan otomatik taksitlendirme mantığı güncellendi:
  - **1. Taksit:** Beklemeksizin anında fonun **Başlangıç Tarihi**ne (ilk ödeme günü) planlandı.
  - **2. ve Sonraki Taksitler:** Başlangıç tarihini takip eden ayların **1. gününe** denk gelecek şekilde hesaplanmaya başlandı.
