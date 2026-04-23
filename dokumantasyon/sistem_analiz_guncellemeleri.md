# BurstaBugun Sistem Analizi ve Kurallar Dokümanı

Bu doküman, sistem üzerinde yapılan son geliştirmelerin ve iş kurallarının (business logic) teknik analizini içermektedir. Projenin ilerleyen fazlarında veya yeni geliştiricilerin katılımında bu kurallar baz alınmalıdır.

## 1. Finansal Ödeme Emirleri (Taksitlendirme) Altyapısı

Bursiyer seçimi ve ödemelerin takibi, "dinamik sorgulama" mantığından çıkartılıp **"Kesinleşmiş Ödeme Emirleri (Taksit)"** mantığına geçirilmiştir.

### 1.1 Taksit (Ödeme Emri) Oluşturma Kuralları
- **Tetikleyici (Trigger):** Fon sahibi (Sponsor), kendi oluşturduğu fonun havuzundan bir aday seçtiğinde (selectBursiyer aksiyonu) çalışır.
- **Takvim Ötelemesi (+2 Ay Kuralı):** Bursun başladığı aya (fonun *startDate* değeri) sistem standart olarak `+2` ay ekler. (Örn: Fon 18 Nisan'da başladıysa, kredi kartından tahsilat Mayıs'ta yapılır, öğrenciye ödeme ise 1 Haziran'da gerçekleşir).
- **Sabitleme:** Hesaplanan tüm ödeme emirleri ilgili ayın **1. gününe** kilitlenir (`setDate(1)`).

### 1.2 Ödemesi Gelenler (Upcoming) ve Geçmiş Ödemeler (History) İlişkisi
- **Ödemesi Gelenler (Bekleyen):** Sadece `status = 'pending'` olan ödeme emirleri (payments) listelenir. Bu sayfa sayfaya ilk girişte (default) "Tüm Aylar" ve "Tüm Yıllar" filtresi ile açılır. Kullanıcı, ekrandaki checkbox'lar yardımıyla ödendi bildirimi yaptığında, seçili taksitlerin durumu `completed`'a döner ve ekranı terk ederler.
- **Geçmiş Ödemeler (Tamamlananlar):** Sadece `status = 'completed'` veya `failed` vb. kesinleşmiş olanlar listelenir. Bekleyen (`pending`) hiçbir ödeme emri geçmişte görünmez.

### 1.3 İptal ve Geri Alma (Revert) Mekanizması
- Geçmiş Ödemeler ekranında bir ödeme "İptal Et / Kaldır" butonuna tıklanıldığında, kayıt veritabanından silinmez (`DELETE` çalışmaz). 
- Bunun yerine kaydın statüsü geri alınarak yeniden `'pending'` değerine atanır.
- Bu işlem sayesinde finansal kayıtlar hiçbir zaman kaybolmaz; iptal edilen kayıt eşzamanlı olarak tekrar "Ödemesi Gelenler" sayfasına düşer ve döngüsel bütünlük sağlanır.

## 2. Referans Sistemi (Değerlendirme Onayları)
Sistemde Bursiyer referans onaylarının (Mahalle Muhtarı ve Üniversite Hocası) güvenli olarak toplanması amaçlanmıştır.

### 2.1 İsimlendirme Çakışmaları ve Modüller
- **İlgili İşlem:** `processReferenceApproval` (Referans isteklerinin `approved` / `rejected` yapılması ve gerekçe yazılması).
- **Listeleme:** `getReferenceRequests` modülü; ilgili referans şahsının e-posta adresini (Kendi açtığı platform profili e-postası `users.email` ile referans dosyasındaki e-posta) karşılaştırır. Sadece uyuşan adreslere yönlendirilmiş istekleri "Referans Onayları" sayfasında görüntüler.

## Mimarideki Avantajlar
Sistemin veritabanında fiziksel ödeme satırları tutması (taksit ödemeleri); ilerleyen dönemde kredi kartı entegrasyonu (Iyzico/Stripe), geciken ödemelerin tespiti ve toplam borç bakiyesinin (Sponsor Ödeme Detayları Ekranı) sağlıklı render edilmesi için zemin hazırlamıştır.
