# BurstaBugün - Uçtan Uca (E2E) Test Senaryoları

Bu doküman, uygulamanın MVP ve lansman öncesi son kalite kontrolünü sağlamak amacıyla hem otomatik (browser agent) hem de manuel test edilen kritik süreçleri (Kritik Rotaları) listelemektedir.

## 1. Yetkilendirme ve Sözleşmeler
- **[OK - Otomatik Test Yazıldı] [T1.1] Kayıt (Register) ve OTP:** Yeni bir "Bursiyer" veya "Bursveren" tipinde hesabın başarıyla oluşturulup `SIFRELER.md` dosyasına kaydedilmesi.
- **[OK - Otomatik Test Yazıldı] [T1.2] Oturum Açma (Login):** Geçerli e-posta ve şifre ile sisteme dahil olunması.
- **[OK - Otomatik Test Yazıldı] [T1.3] Sözleşme Kilidi (Contract Enforcer):** İlk girişte (veya yeni güncellenen sözleşmelerde) kullanıcının ana sayfaya (dashboard) menüler tıklanamaz halde erişmesinin engellenmesi ve pop-up onay mekanizmasının başarıyla çalışması.

## 2. Admin (Sistem Yöneticisi)
- **[OK - Otomatik Test Yazıldı] [T2.1] Sistem Parametreleri:** `/dashboard/admin/parameters` ekranında `MAX_MONTHLY_LIMIT` ayarının (örn: 5000 TL) başarıyla değiştirilebilmesi ve veritabanına yansıması.
- **[OK - Otomatik Test Yazıldı] [T2.2] Sözleşme Yayınlama:** Yeni bir KVKK veya Kullanıcı sözleşmesi metni eklendiğinde versiyonun 1 artması ve kullanıcılara "Zorunlu Onay" tetiklenmesi.
- **[OK - Otomatik Test Yazıldı] [T2.3] Ödeme Yönetimi (Admin Wallet):** Aktif ödeme limitlerinin "Ödendi" ( markAsPaid ) yapılarak statülerinin güncellenmesi ve bursiyerlere "Ödemeniz yapıldı" bildiriminin düşmesi.

## 3. Sponsor (Fon Yönetimi ve Havuz)
- **[OK - Otomatik Test Yazıldı] [T3.1] Fon Oluşturma:** Geçerli tarih, aylık kota ve kapasite parametreleriyle (Örn: Hedef: 5 kişi, Limit: 1000 TL) sorunsuz yeni bir aktif fon oluşturabilmek.
- **[OK - Otomatik Test Yazıldı] [T3.2] Davet Gönderme:** Açılan Fon detayına girip (Participans) "Yeni Davet Gönder" üzerinden bir başka bağışçıyı veya davetliyi güvenli bir linkle (token) aktarmak.
- **[OK - Otomatik Test Yazıldı] [T3.3] Havuz Kontrolü (Bursiyer Havuzu):** Filtreler yardımıyla havuza düşmüş (Muhtar ve Akademisyen onayı bitmiş) öğrencileri sıralamak.
- **[OK - Otomatik Test Yazıldı] [T3.4] Karar ve Atama:** Öğrenciyi seçerken "Aylık Kazanç Limiti" engelleyicisine bilerek takılıp hatayı (Alert) almak; ardından limiti aşmayan bir adayı başarıyla fona almak ve aday/fon ödeme `payments` kuyruğunun (takviminin) oluşması.

## 4. Bursiyer (Aday) ve Referans (Değerlendirici)
- **[OK - Otomatik Test Yazıldı] [T4.1] Başvuru Formu:** Oluşturulan Sistem Formunu (Dynamic JSON Form Builder) sekmeler ve doldurulması zorunlu alanlar ihlal edilmeden kaydetmek.
- **[OK - Otomatik Test Yazıldı] [T4.2] Referans İsteği (Davet):** Başvuru kartı üzerinden "Mahalle Muhtarı" ve "Üniversite Hocası" ekleyip onlara değerlendirme emaili (token) paslayabilmek.
- **[OK - Otomatik Test Yazıldı] [T4.3] Referans Onayı:** Referans rölüyle girildiğinde `invitations` panelinden adayın başvurusu için "Onaylıyorum (Gerçektir)" diyebilmek.
- **[OK - Otomatik Test Yazıldı] [T4.4] Bildirim Zili Testi:** Referans onay verdiğinde veya fona dahil edildiğinde Bursiyer'in sağ üst ekranındaki `Bildirim Zili` ikonuna "+1" rakamının düşmesi ve içini görebilmesi.
