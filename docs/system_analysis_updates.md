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

## 15. 28.10.2026 Burs Taahhütleri (Pledge CRM) ve Manuel Tahsilat Akıllı Bursveren Seçim Modülü
- **Açıklama:** Burs Taahhütleri (`/dashboard/admin/pledges`) ekranından "Tahsilat Gir" yapıldığında veya Manuel Tahsilat (`/dashboard/admin/payments/new`) ekranında bağışçı e-postasını harici ekranlardan arayıp kopyalama zorunluluğunu ortadan kaldıran, kayıtlı bursverenleri akıllı eşleştiren ve aranabilir seçim sunan altyapı geliştirildi.
- **Geliştirilen Bileşenler ve İş Akışı:**
  1. **Taahhüt Özet Bilgi Kartı:**
     - Taahhüt satırından tahsilat modalı açıldığında, en üstte taahhüt sahibinin adı, hedeflenen toplam tutar, taahhüt edilen öğrenci sayısı ve kalan bakiye şık bir özet kartı olarak gösterilir.
  2. **Akıllı Otomatik Eşleştirme (Smart Matching):**
     - Taahhüt sahibinin adı, soyadı ve telefonu sistemdeki kayıtlı bursverenler (`sponsor` / `admin`) ile taranır.
     - Eşleşme sağlandığında bağışçı seçim alanında ilgili bursveren otomatik olarak seçili getirilir (`userId`, `email`, `phone`). Yöneticinin e-posta arama ve yazma ihtiyacı ortadan kaldırılır.
  3. **Aranabilir Bursveren Seçici (Combobox):**
     - Türkçe karakter (İ/ı, Ş/ş vb.) destekli ve telefon/e-posta aramalı hızlı filtreleme mekanizması eklendi.
     - Seçilen kullanıcı yeşil onay kartında gösterilir, istenirse tek tıkla "Değiştir" butonuyla başka bir bursverene geçilebilir.
  4. **Yeni / Gölge Bağışçı Modu:**
     - Sistemde kayıtlı olmayan kişiler için "+ Listede Yok, Yeni Bağışçı Gir" butonuyla manuel giriş moduna geçiş imkanı sağlandı.
     - Girilen e-posta adresiyle sistemde kayıt yoksa otomatik `shadow_user` şifresi ve `sponsor` rolüyle gölge bursveren hesabı oluşturulur.
  5. **Önbellek Revalidasyonu:**
     - `submitManualPayment` fonksiyonunda `/dashboard/admin/pledges` ve `/dashboard/admin/donations` sayfaları revalidate edilerek taahhüt tablosundaki gerçekleşen tutarın ve durumun anında güncellenmesi sağlandı.

## 16. 28.10.2026 Telefon Odaklı Kimlik Doğrulama, NetGSM Entegrasyonu ve Özellik Bayrağı (Feature Flag)
- **Açıklama:** Kullanıcıların sisteme sadece e-posta ile değil, cep telefonu numarası ile de giriş yapabilmesini sağlayan ikili kimlik doğrulama mimarisi kuruldu. Sürekli SMS OTP maliyetini engellemek için normal girişlerde şifre doğrulaması korunurken, "Şifremi Unuttum" akışı NetGSM SMS OTP (6 haneli tek kullanımlık kod) mekanizmasına taşındı. Süreç, geçiş sürecinde esneklik sağlamak amacıyla `ENABLE_SMS_AUTH` özellik bayrağına (Feature Flag) bağlandı.
- **Geliştirilen Bileşenler ve İş Akışı:**
  1. **İkili Kimlik ile Giriş (E-Posta VEYA Cep Telefonu):**
     - `auth.ts` içerisindeki `getUserByIdentifier` fonksiyonu geliştirildi.
     - Giriş alanına girilen değer `@` içeriyorsa e-posta üzerinden, içermiyorsa tüm boşluk ve özel karakterler temizlenerek son 10 hanesi üzerinden `users.phoneNumber` ile eşleştirilir.
     - `0532...`, `532...`, `0090...` veya `+90...` formatlarındaki tüm girişler sorunsuz karşılanır.
     - Kullanıcı her girişte SMS maliyetine katlanmadan şifresiyle hızlıca giriş yapabilir.
  2. **NetGSM Servis Modülü (`lib/sms.ts`):**
     - NetGSM GET API (`https://api.netgsm.com.tr/sms/send/get`) entegrasyonu yazıldı.
     - Telefon numaralarını NetGSM standartı olan `905XXXXXXXXX` formatına normalize eden `normalizePhoneForNetgsm` fonksiyonu eklendi.
     - `sendSms` fonksiyonu; `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER` ortam değişkenleri tanımlıysa gerçek SMS iletimi yapar.
     - Bilgiler tanımlı değilse güvenli **Test (Mock) Modu**'nda çalışır: Üretilen OTP kodunu ve SMS metnini sunucu konsoluna ve `SIFRELER.md` dosyasına kaydeder.
  3. **Şifre Sıfırlama OTP Sunucu Aksiyonları (`lib/actions/auth.ts`):**
     - `sendPasswordResetOtp(phone)`: Telefon numarasını doğrular, kullanıcıyı bulur, 3 dakika geçerli 6 haneli OTP kodu üretir, veritabanına kaydeder ve SMS gönderir.
     - `resetPasswordWithOtp({ phone, otp, newPassword, confirmPassword })`: Girilen OTP kodunu ve geçerlilik süresini doğrular. Yeni şifreyi bcrypt ile hash'leyerek günceller, OTP kodunu temizler.
  4. **Özellik Bayrağı (Feature Flag) Kontrollü Ekran (`app/forgot-password/page.tsx`):**
     - `isSmsAuthEnabled()` fonksiyonu (`ENABLE_SMS_AUTH === 'true'`) kontrol edilir.
     - `ENABLE_SMS_AUTH=true` olduğunda: Telefon girilen, SMS OTP doğrulanan ve yeni şifre belirlenen 3 adımlı modern arayüz (`sms-forgot-password-form.tsx`) çalışır (3 dakikalık geri sayım sayacı, kodu tekrar gönder, numarayı değiştir seçenekleriyle).
     - `ENABLE_SMS_AUTH=false` olduğunda: Mevcut e-posta ve telefon doğrulama akışı (`legacy-forgot-password-form.tsx`) hiçbir kesintiye uğramadan çalışmaya devam eder.

## 17. 28.10.2026 Vakıf Dönemsel Bütçe, Kasa ve Nakit Akışı Yönetim Modülü
- **Açıklama:** Vakfın burs bağışları, bursiyer ödemeleri, açılış kasa/banka devirleri, operasyonel idari giderleri ve ek finansman gelirlerini tek çatı altında konsolide eden "Yönetimsel Dönemsel Bütçe ve Kasa/Nakit Akışı" modülü geliştirildi.
- **Menü Yapısı ve Yetkilendirme:**
  - Ana menüde (Desktop & Mobile) yalnızca `admin` ve `isSuperAdmin` yetkisine sahip kullanıcıların görebileceği yeni **"Bütçe"** başlığı (`storageKey="budget-admin"`) açıldı.
  - Başlık altında iki ana sayfa konumlandırıldı:
    1. **Bütçe ve Kasa Raporu** (`/dashboard/admin/budget`, İkon: `PieChart`)
    2. **Banka Hesapları** (`/dashboard/admin/bank-accounts`, İkon: `Landmark`)
- **Veritabanı Mimarisi (PostgreSQL DDL):**
  1. `tenant_bank_accounts`: Vakfa ait banka ve nakit kasa hesap tanımları (Banka adı, hesap tanımı, IBAN, para birimi, aktiflik durumu, sıra).
  2. `budget_opening_balances`: Dönem açılış kasa/banka devir bakiyeleri (Akademik dönem bazlı, hesap ID'si veya serbest metin hesap tanımı, devir tarihi, tutar, notlar).
  3. `budget_transactions`: Ek gelirler (`type = 'income'`) ve operasyonel giderler (`type = 'expense'`) için ortak hareket tablosu (Kategori, başlık, ilgili kurum/kişi, tutar, işlem tarihi, belge/fatura no, banka hesabı, notlar).
- **Konsolidasyon ve Hesaplama Mantığı (Single Source of Truth):**
  - Burs bağışları (`payments`) ve bursiyer ödemeleri (`student_payment_logs`) mükerrer kayıt oluşturulmadan doğrudan fon ve dönem ilişkisi üzerinden dinamik olarak toplanır.
  - Toplam Gelir = Burs Bağışları (Abonelik/KK + Havale/EFT) + Ek Finansman Gelirleri.
  - Toplam Gider = Bursiyer Dağıtımları + Operasyonel Giderler (Yazılım, danışmanlık, noter, muhasebe, banka masrafları vb.).
  - Güncel Kasa = Dönem Açılış Bakiyesi + Toplam Gelir - Toplam Gider.
  - Aylık Nakit Akışı Matrisi: Akademik sezon boyunca (Eylül-Ağustos) ay ay başlangıç kasa, gelirler, giderler, net akış ve kümülatif kapanış kasası.
- **Ekran Tasarımı ve Mobil Uyumluluk:**
  - 5 adet modern KPI Özet Kartı (Dönem Açılış, Toplam Gelir, Toplam Gider, Güncel Kasa/Banka, Taahhüt Gerçekleşme Oranı).
  - Mobil cihazlarda tablo yerine dikey kart görünümüne otomatik geçiş.
  - Hızlı İşlem Ekle modalı (`[+ Gelir / - Gider]` anlık geçiş düğmesi).
  - Hesap bazında Dönem Açılış Bakiyesi Yönetimi modalı.
  - Çok sekmeli Excel (.xlsx) dışa aktarımı (`Özet Bütçe`, `Aylık Nakit Akışı`, `İşlem Hareketleri`, `Açılış Bakiyeleri`).
- **Dağıtım Durumu:**
  - Kullanıcı talebi doğrultusunda canlıya dağıtım bekletildi. Local dev ortamında (`localhost:3004`) test için hazırlandı.

---

### 18. Burs Taahhütleri CRM — Dinamik Vade Borcu (+35 Gün Kuralı), WhatsApp & E-Posta Hatırlatma Entegrasyonu (29 Ekim 2026)

- **Gereksinim & Arka Plan:**
  - Sanal POS (Moka) ödemelerinin vakıf hesabına 33 günlük blokaj süresiyle aktarılması ve bağışçıların hatırlatma sonrasında hemen ödeme yapmama ihtimali nedeniyle nakit akışı koruma emniyeti sağlandı.
  - Formül kuralı: **Bulunduğumuz Gün + 35 Takvim Günü**.
  - Örneğin 29 Ekim 2026 için +35 gün, **3 Aralık 2026** tarihine denk gelmekte olup vadesi gelen ay **Aralık** olarak tespit edilmektedir.
  - Sezon başlangıç ayı olan Ağustos'tan Aralık ayı sonuna kadar geçen 5 aylık burs katkı payının karşılanması beklenmektedir.

- **Hesaplama Parametreleri & İş Mantığı:**
  - `dueMonths = Math.min(defaultFundDuration, Math.max(1, elapsedMonths))` (Örnek: 5 Ay)
  - `dueTargetAmount = targetStudentCount * defaultFundAmount * dueMonths` (Örnek: 1 öğrenci için 5 x 5.000 = 25.000 ₺)
  - `dueRemainingDebt = Math.max(0, dueTargetAmount - actualAmount)`
  - **Hücre Formatı & Satır Yüksekliği Optimizasyonu:**
    - Alt satırdaki açıklama kaldırıldı; komşu kolonla tam simetrik olacak şekilde tek satırlık `Rozet` yapısına dönüştürüldü: `[Güncel Vade Borcu] / [Vadesi Gelen Tutar]` (örn. `-15.000 ₺ / 25.000 ₺`).
    - Borçlu durumda (`dueRemainingDebt > 0`) belirgin **KIRMIZI rozet** (`-15.000 ₺ / 25.000 ₺`) ile gösterilir.
    - Vadesinde veya ilerisinde olan bağışçılarda **YEŞİL rozet** (`0 ₺ / 25.000 ₺`) gösterilir.
    - Rozet üzerine gelindiğinde (hover tooltip) ay detayı ve tam durum açıklaması görüntülenir.
  - Mevcut tablodaki `Gerçekleşen / Hedef Tutar` kolonunun renk ve stil yapısı değiştirilmeden korunmuştur.

- **WhatsApp Hatırlatma Entegrasyonu & Sekme Optimizasyonu:**
  - Tablo İşlemler sütununa doğrudan yeşil WhatsApp ikonu eklendi.
  - Bağışçının telefon numarası temizlenip uluslararası formata (`905XXXXXXXXX`) dönüştürülür.
  - **Masaüstü WhatsApp Desktop & Akıllı Web Fallback Entegrasyonu (`whatsapp://`):** Masaüstü tarayıcılarda (MacBook / Windows) öncelikle `whatsapp://send` yerel uygulama protokolü tetiklenerek doğrudan bilgisayarda açık olan **WhatsApp Desktop** uygulaması öne getirilir (0 saniye bekleme, 0 yeni sekme). Eğer kullanılan bilgisayarda WhatsApp Desktop yüklü değilse (pencere odağı kaybolmazsa), sistem 1.5 saniye içinde bunu otomatik olarak algılayıp tarayıcıda **WhatsApp Web** sekmesini açarak akıllı geri dönüş (fallback) sağlar.
  - Mobil cihazlarda ise doğrudan WhatsApp uygulamasını tetikleyen `https://wa.me/` protokolü çalışır.
  - **Hazır Şablon İçeriği:**
    - Bağışçı adı, bursiyer sayısı, vadesi gelen ay sonu bilgisi, vadesi gelen tutar ve güncel vade borcu şeffafça sunulur.
    - **Neden Bir Sonraki Ay Baz Alınıyor Açıklaması:** Burs ücretlerinden komisyon/kesinti olmaması adına kredi kartı ödemelerinin aracı ödeme kuruluşunda (Moka) 33 gün yasal blokede tutulduğu ve bursiyer ödeme takviminin aksamaması için vadenin buna göre hesaplandığı net bir dille izah edilir.
    - **Ödeme Yöntemlerine Özel Linkler:**
      - Kredi Kartı: `https://burs.fbiadvakfi.org/` (veya mobil uygulama)
      - Havale / EFT: `https://fbiadvakfi.org/bagis/havale`
    - Havale/EFT açıklamasına ad-soyad yazılması ve dekontun **FBİAD Burs Komitesi** ile paylaşılması notu eklenir.

- **E-Posta Hatırlatma Entegrasyonu & Veri Senkronizasyonu:**
  - Taahhüt tablosu (`pledges`) ilk Excel içe aktarımında e-posta sütunu boş geldiği için, sistemdeki kullanıcılar (`users`) tablosu ile telefon ve isim bazında çapraz eşleştirme yapıldı. 37 bağışçının gerçek ve dummy e-posta adresleri otomatik olarak taahhüt tablosuna senkronize edildi.
  - Daha önce işlevsiz olan e-posta ikonu, interaktif bir onay ve önizleme modalına bağlandı.
  - Admin `E-Posta Gönder` dediğinde `sendPledgeEmailReminder(pledgeId)` Server Action'ı çalışır.
  - Gönderilen e-postada kurumsal FBİAD Vakfı şablonu, detaylı özet tablosu, 33 günlük blokaj açıklaması, ayrıştırılmış kredi kartı ve havale linkleri ile komite dekont notu yer alır.

- **Excel Dışa Aktarım Güncellemesi:**
  - `Excel'e Aktar` çıktısına `Hedeflenen Vade`, `Vadesi Gelen Tutar (TL)`, `Güncel Vade Borcu (TL)` ve `Vade Durumu` kolonları eklendi.

- **Dağıtım Durumu:**
  - Canlıya (Cloud Run) dağıtım yapılmamıştır; yerel ortamda (`localhost:3004`) test edilmeye hazırdır.

---

### 19. Android Hibrit Mobil Uygulama & Capacitor WebView Container Mimarisi (29 Ekim 2026)

- **Gereksinim & Mimari Yaklaşım (Remote WebView Container):**
  - Google Play Store'a yüklenene kadar manuel APK indirme ve kurulum ile kullanıcıların sisteme mobil uygulama deneyimiyle erişmesi hedeflendi.
  - Kod tabanında yapılan frontend/backend güncellemelerinde kullanıcıların tekrar tekrar yeni APK indirip kurmasını önlemek amacıyla **Capacitor Remote URL (Webview Container)** modeli benimsendi.
  - Uygulama telefonda tam ekran (adres çubuğu ve tarayıcı butonları olmaksızın), kurumsal ikon ve açılış (splash) ekranı ile native bir uygulama gibi açılır; içeride doğrudan canlı sunucudaki (`https://burs.fbiadvakfi.org`) arayüzü yükler.
  - Böylece web tarafında yapılan tüm geliştirmeler, hata düzeltmeleri ve ekran güncellemeleri APK'yı yeniden derlemeye gerek kalmadan anında mobil kullanıcıların ekranına yansır.

- **Yapılandırma & Entegrasyon Parametreleri:**
  - **Uygulama Adı:** `FBİAD Vakfı` (`strings.xml` ve `capacitor.config.ts`)
  - **Paket Kimliği (Application ID):** `org.fbiadvakfi.burs`
  - **Hedef Sunucu:** `https://burs.fbiadvakfi.org` (`server.url`, `cleartext: true`)
  - **İzinler:** `android.permission.INTERNET`, `android:usesCleartextTraffic="true"` (`AndroidManifest.xml`)

- **Asset & Görsel Üretimi:**
  - `assets/icon.png` ve `assets/splash.png` (1024x1024 px) kaynaklarından `@capacitor/assets` aracıyla Android'in tüm ekran yoğunluklarına uygun (ldpi, mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) 87 adet adaptif ikon ve splash görseli üretilerek `android/app/src/main/res/` dizinine yerleştirildi.

- **Java & Gradle Derleme Uyumluluğu:**
  - Capacitor 7 ve Android Gradle Plugin 8.7.2, Java 21 gereksinimi duymaktadır.
  - Sistemdeki varsayılan Zulu 17'ye ek olarak macOS üzerindeki Android Studio uygulamasının yerleşik OpenJDK 21 çalışma zamanı (`/Applications/Android Studio.app/Contents/jbr/Contents/Home`) derleme zincirine bağlandı.
  - `./gradlew assembleDebug` komutuyla hatasız olarak `app-debug.apk` derlendi.

- **Üretilen Dosyalar ve Hızlı Komutlar:**
  - APK Çıktısı: `fbiad-vakfi.apk` (Proje kök dizini) ve `android/app/build/outputs/apk/debug/app-debug.apk` (36 MB)
  - `npm run cap:sync` -> Web varlıklarını ve ayarları Android ve iOS projelerine aktarır.
  - `npm run android:open` -> Projeyi doğrudan Android Studio arayüzünde açar.
  - `npm run android:build` -> Tek komutla Android Studio açılmadan anında yeni APK üretir.
  - `npm run ios:open` -> iOS projesini doğrudan Xcode'da açar.

- **iOS Platform Durumu & Dağıtım Notları:**
  - iOS projesi (`ios/App/App.xcworkspace`) `FBİAD Vakfı`, `org.fbiadvakfi.burs` ve `https://burs.fbiadvakfi.org` ayarları ile senkronize edildi (`pod install` başarıyla çalıştırıldı).
  - Apple'ın güvenlik ve imzalama kısıtlamaları gereği WhatsApp üzerinden doğrudan `.ipa` indirilerek kurulamamaktadır; iki test yolu sunulmuştur: (1) Safari üzerinden "Ana Ekrana Ekle" (PWA), (2) MacBook'a kabloyla bağlayıp Xcode üzerinden doğrudan cihaza derleme (Run on Device).



