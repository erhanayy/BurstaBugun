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

## 9. 15.07.2026 Süreç ve Kullanıcı Deneyimi (UX) Güncellemeleri
- **Eski Bursiyer Muafiyeti (Exemption):** FBİAD Vakfı gibi kurumlara özel olarak, eski bursiyerlerin Muhtar ve Akademisyen referans zorunluluğundan muaf tutulması için altyapı kuruldu.
  - Sisteme `ENABLE_FORMER_STUDENT_EXEMPTION` ve `EXEMPTION_QUESTION_TEXT` parametreleri eklendi.
  - Öğrenci referans ekranında "Eski Bursiyerim" dediğinde süreç "Admin Onayına" (waiting_reference) düşer.
  - Admin panelinde `Muafiyet Onayları` sayfasında, onay verilirse öğrenci direkt `in_pool` (Havuz) statüsüne alınır; reddedilirse (isteğe bağlı red nedeni ile) referans girmesi için tekrar standart sürece yönlendirilir.
- **Dinamik Dashboard Durum Bildirimleri:** Öğrenci ana ekranında (Dashboard) gösterilen "Referans Onayları Bekleniyor" metni, eğer öğrencinin henüz hiç referansı yoksa "Referans Bilgileri Bekleniyor (Lütfen Giriniz)" olarak daha anlaşılır bir formata güncellendi.
- **Gelişmiş Bildirim (Notification) Sistemi:** Genel menüsü altına tüm kullanıcılar için "Bildirimler" sekmesi eklendi. Kullanıcıların geçmişe dönük aldıkları tüm onay/red/ödeme vb. sistem bildirimlerini geriye dönük görüntüleyebileceği, okundu/okunmadı takibini yapabileceği bir arayüz geliştirildi.
- **Localhost SIFRELER.md Loglama:** Kayıt aşamasında üretilen ilk şifrelerin ve OTP kodlarının, yalnızca yerel geliştirme (development) ortamında `SIFRELER.md` dosyasına yazılması sağlandı. Canlı ortamda bu işlem atlanarak güvenlik standartları korundu.

## 10. 09.10.2026 Dönem Bazlı Kümülatif Limit ve Havuz Tahsisat Kontrolü
- **Açıklama:** Bursiyer havuzundaki fon seçiminde ve fona atama anındaki kümülatif burs limiti (`MAX_MONTHLY_LIMIT`) kontrolünde, öğrencinin geçmiş tüm yıllardaki (2024-2025, 2025-2026 vb.) eski burslarının yeni dönem limitini kilitlemesi sorunu çözüldü.
- **Mantık:**
  - `getStudentsAllocationsStats(userIds, targetPeriod)` ve `selectBursiyer(applicationId, fundId)` fonksiyonlarına hedef fon dönemi filtresi eklendi.
  - Hedef dönemin UUID'si veya metin karşılığı (`parametersTenantSeasons`) dinamik olarak çözümlenerek, yalnızca seçilen fon ile **aynı döneme ait** aktif fon seçimleri (`fundSelections.isActive = true`) toplama dahil edildi.
  - Böylece eski bursiyerlerin (örn: Evin Darılmaz) geçmiş yıllarda aldığı tutarlar yeni sezondaki (2026-2027) bursiyer havuzunda temiz (0 TL) görünmekte ve yeni fona atanmaları limit aşımı hatasına takılmadan sağlanmaktadır.

## 11. 23.10.2026 Oturum Süresi (Session Timeout) ve Güvenlik Yönlendirmesi
- **Açıklama:** Kullanıcıların doğrudan linklere tıkladığında varsayılan 30 günlük NextAuth oturum süresi nedeniyle şifresiz giriş yapması engellendi; finansal ve kişisel veri güvenliği için kurumsal oturum zaman aşımı devreye alındı.
- **Mantık:**
  - `auth.config.ts` dosyasına `session` yapılandırması eklenerek `maxAge: 7200` (2 saat) ve `updateAge: 900` (15 dakika) olarak sınırlandırıldı.
  - **Kayan Oturum (Rolling Session):** Kullanıcı platformda aktif işlem yaptıkça oturum süresi otomatik olarak uzar; inaktif kaldığında ise 2 saat sonra oturum düşer.
  - `app/dashboard/layout.tsx` içerisinde oturumsuz (`!session?.user`) durumlar doğrudan `/login` sayfasına yönlendirilecek şekilde güncellendi.
  - Next.js 16 standartlarına uygun olarak `proxy.ts` dosyası yapılandırıldı ve `/dashboard` rotalarına gelen yetkisiz veya oturumu dolmuş isteklerin sayfa derlenmeden önce ağ katmanında anında `/login`'e yönlendirilmesi sağlandı.
  - `auth.ts` içerisindeki callbacks bloğuna `...authConfig.callbacks` eklenerek yapılandırma bütünlüğü ve yetkilendirme kontrolleri korundu.

## 12. 23.10.2026 İmzalı Evrak Tanımları ve Takip Modülü (Signed Document Tracking)
- **Açıklama:** Vakfın yasal ve idari süreçlerde öğrencilerden/ilgililerden ıslak imzalı fiziki kağıtları (örn: KVKK Onay Formu, Burs Taahhütnamesi) teslim alması ve eksik evrak takibini dijital olarak yönetebilmesi için tanım tabanlı takip altyapısı geliştirildi.
- **Veritabanı Modeli:**
  - `signed_document_definitions`: Doküman adı, kimden alınacağı (`applicant`, `sponsor_reference`, `all`), dönem bazlı mı (`is_periodic: true/false`), tenantId ve aktiflik alanları eklendi.
  - `signed_document_submissions`: Öğrencinin teslim durumu (`is_received: true/false`), teslim tarihi (`received_at`), teslimi sisteme işleyen admin (`received_by`), dönem (`period`), öğrenci (`user_id`, `application_id`) alanlarıyla takip kayıtları modellendi.
- **Ekranlar ve İşlevsellik:**
  - **İmzalı Evrak Tanımları (`/dashboard/admin/required-documents`):** Sistem Yönetimi (Ayarlar) menüsü altına eklendi. Yöneticilerin yeni evrak tanımlayabilmesini, dönemlik mi tek seferlik mi olduğunu belirleyebilmesini, mevcut tanımları düzenleyip silebilmesini sağlayan form ve liste yapısı kuruldu.
  - **İmzalı Evrak Takibi (`/dashboard/admin/document-tracking`):** Bursiyer Yönetimi menüsü altına Seçenek B (Dikey Liste) formatında eklendi.
    - **Öğrenci Kapsamı:** Yalnızca fona seçilmiş olan bursiyerler listelenir.
    - **Filtreler:** Dönem (Season), Doküman Adı, Ad Soyad (Arama Çubuğu) ve Teslim Durumu (Tümü / Teslim Alınanlar / Eksikler).
    - **Tek Tıkla Teslim Kontrolü (Check):** Tablodaki Checkbox ile sayfa yenilenmeden (Optimistic UI) evrak teslim durumu anında kaydedilir, teslim tarihi ve işleyen admin loglanır.
    - **Excel Aktarımı:** Filtrelenmiş tüm liste tek tıkla Excel formatında indirilebilir.

## 13. 26.10.2026 Canlı Ortam (Production) Dağıtımı (Revision: bursta-fbiad-00079-5rf / bursta-fbiad-00080-pvr)
- **Açıklama:** Son dönemde geliştirilen özellikler ve hata düzeltmeleri Google Cloud Run üzerinde `bursta-fbiad` servisine deploy edildi (%100 trafik yönlendirildi).
- **Canlıya Alınan Başlıca Yenilikler:**
  - **Moka Detaylı Hata Gösterimi:** Kredi Kartı Abonelikleri (`/dashboard/subscriptions`) ekranında Moka'dan dönen genel "Success" yerine, saklı kart bulunamaması veya banka ret sebepleri (`Kart Sahibine Açık Olmayan İşlem`, `Banka Red Kodu` vb.) detaylı hata mesajı gösterimi canlıya alındı.
  - **2 Saatlik Oturum Güvenliği (Session Timeout):** 2 saatlik oturum süresi ve inaktif kullanıcıların doğrudan `/login` sayfasına yönlendirilmesi (Next.js 16 `proxy.ts`) canlı ortamda aktif edildi.
  - **İmzalı Evrak Yönetimi:** "İmzalı Evrak Tanımları" (`/dashboard/admin/required-documents`) ve "İmzalı Evrak Takibi" (`/dashboard/admin/document-tracking`) ekranları canlıya taşındı.

## 14. 26.10.2026 Bursveren Ödeme Yöntemi Güncelleme Modülü (Payment Method Update & 3D Secure Re-auth)
- **Açıklama:** Kredi kartı son kullanım tarihi dolan veya kartını değiştirmek isteyen bursverenlerin, 3D Secure SMS doğrulaması ile yeni kartlarını sisteme kaydedebilmelerini ve sıradaki bekleyen taksitlerini tahsil ederek sonraki aylık çekimleri bu yeni kart üzerinden devam ettirebilmelerini sağlayan modül geliştirildi.
- **Mimari Mantık:**
  - PCI-DSS ve güvenlik gereği BurstaBugün platformunda kart numarası/CVC tutulmamakta, kart saklama ve ilk 3D doğrulama FBİAD Vakfı Web (`FBIADVakfiWeb`) sanal POS katmanı üzerinden yürütülmektedir.
  - Bankacılık ve Moka kuralı gereği yeni bir `CardToken` oluşturulabilmesi için gerçek bir 3D Secure ödeme işleminin (`IsTokenized: 1`) başarıyla tamamlanması şarttır.
- **Geliştirilen Bileşenler ve İş Akışı:**
  1. **Sol Menü (Navigasyon):** `app/dashboard/layout.tsx` üzerinde Sponsor ve Katılımcı (Contributor) rolleri için masaüstü ve mobil menülere **"Ödeme Yöntemini Değiştir"** (`/dashboard/payment-method`) linki eklendi.
  2. **Yeni Ekran (`/dashboard/payment-method`):**
     - Bursverenin bekleyen en erken tarihli taksiti (`status = 'pending'`, `paymentMethod = 'subscription'`) dinamik olarak sorgulanır.
     - Fon Adı, Taksit Dönemi (Ay/Yıl), Tutar ve Kalan Taksit Sayısı gösterilir.
     - "Nasıl Çalışır?" bilgilendirmesi ile sıradaki taksitin yeni karttan 3D Secure ile çekileceği ve gelecek ayların bu karta bağlanacağı şeffafça açıklanır.
     - `PaymentMethodButton` bileşeni ile kullanıcı doğrudan güvenli web ödeme akışına yönlendirilir.
  3. **Tekil Taksit Ödeme Oturumu (`lib/actions/payment-session.ts`):**
     - `createSinglePaymentSession(paymentId)` fonksiyonu yazıldı. Tüm fon borcu yerine yalnızca seçilen tekil taksit tutarını kapsayan güvenli JWT üretilerek `FBIADVakfiWeb/app-payment` rotasına yönlendirme sağlandı.
  4. **Token Yönetimi ve İleriki Kayıtların Güncellenmesi:**
     - `app/api/webhooks/payment-complete/route.ts` içerisinde: 3D Secure başarıyla tamamlandığında Moka'dan dönen yeni `tokenCode` kaydedilirken, kullanıcının önceki süresi dolmuş tüm token'ları `isActive: false` yapılarak yeni token `isActive: true` olarak eklendi.
     - `lib/actions/moka-actions.ts` içerisinde: Admin toplu çekim yaptığında her zaman kullanıcının en son aktif token'ını (`isActive: true`, `orderBy: desc(createdAt)`) getiren sorgu devreye alındı.


- **Canlıya Dağıtım ve Doğrulama (Revision: bursta-fbiad-00081-dnw):**
  - Google Cloud Run servisine başarıyla deploy edildi (%100 trafik yönlendirildi).
  - Bursveren menüsünde "Ödeme Yöntemini Değiştir" bağlantısı ve `/dashboard/payment-method` ekranı canlı ortamda doğrulanarak kullanıma açıldı.
