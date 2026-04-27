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

## 3. Sistem Parametreleri (Admin Ekranı)
- **Açıklama:** Hardcoded (Koda gömülü) kısıtlamaların terk edilerek tamamen Admin paneline taşınması.
- **Mantık:**
  - `system_parameters` isimli yeni PostgreSQL tablosu.
  - "Sistem Yönetimi" menüsünün altında `/dashboard/admin/parameters` ekranında bu kısıt değişiklikleri anlık olarak yapılabilir. Değişiklik kaydedildiği anda yeni sınırlar yürürlüğe girer. Restarta gerek yoktur.

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
