# BurstaBugün & FBİAD Vakfı - Proje Yol Haritası (Roadmap)

## Tamamlanan Aşama (Faz 1)
- [x] BurstaBugün ve FBİAD Vakfı için Çoklu-Kurum (Multi-Tenant) altyapısının kurulması.
- [x] FBİAD Vakfı'na özel Beyaz Etiket (White-Label) giydirmeleri (Özel logolar, altın/kum arka plan, lacivert kurumsal renk kodları).
- [x] Kurumlar arası veri ve arayüz izolasyonu (`NEXT_PUBLIC_TENANT_ID` Strict Mode).
- [x] Yetkisiz girişlerde (Unauthorized) yönlendirme ve oturum yönetimi.

## Gelecek Planlamalar (Faz 2 & İleri Seviye Özellikler)

### 1. Sunucu ve Deploy (Yayına Alma) Süreçleri
- [ ] Uygulamaların Google Cloud Run üzerine (Port 3004 ve 3005) kesintisiz bir şekilde eklenmesi ve yayınlanması.

### 2. FBİAD Vakfı Özel Mobil Uygulama ve Web Entegrasyonu
- [ ] **Mobil Arayüz:** FBİAD Vakfı Mobil uygulaması için ekran tasarımlarının ve entegrasyonlarının yapılması.
- [ ] **Web Sitesi:** FBİAD Vakfı için tanıtım ve bilgilendirme amaçlı özel internet sitesi (Landing Page) hazırlanması.

### 3. Ödeme ve Finansal Altyapı
- [ ] **Sanal POS Entegrasyonu:** Anlaşmalı banka/kurum üzerinden Kredi Kartı çekim ekranının (Sanal POS) geliştirilmesi.
- [ ] **Uygulama İçi Yönlendirme:** Mobil ve web uygulamaları içinden ödeme (Sponsorluk/Bağış) işlemleri için bu yeni kredi kartı ödeme ekranına güvenli yönlendirme yapılması.

### 4. Mağaza (Store) Yönetimi ve Yayınlama
- [ ] **Geliştirici Hesapları:** FBİAD Vakfı adına Apple App Store ve Google Play Store'da resmi kullanıcı (geliştirici) hesaplarının açılması.
- [ ] **Uygulama Gönderimi:** Hazırlanan FBİAD Mobil uygulamasının bu mağazalara yüklenmesi ve yayınlanma sürecinin yönetilmesi.
