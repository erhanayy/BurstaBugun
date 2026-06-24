# BurstaBugün (Burs Yönetim Sistemi)

Bu proje, FBİAD Vakfı'nın burs başvuru, değerlendirme ve tahsilat/dağıtım süreçlerini yöneten Next.js tabanlı platformudur.

## 🚀 Canlı Ortam (Deployment) Bilgileri

Sistem Google Cloud Run üzerinde barındırılmaktadır. Yeni bir geliştirici sistemi devraldığında aşağıdaki bilgilere dikkat etmelidir:

- **Google Cloud Projesi:** `dernektebugun-492221`
- **Cloud Run Servis Adı:** `bursta-fbiad` (ÖNEMLİ: Servis adı `burstabugun` DEĞİLDİR! `burstabugun` eski bir test servisidir, canlı trafik `bursta-fbiad` üzerinden akar.)
- **Bölge (Region):** `europe-west1`
- **Canlı (Custom) Domain:** `burs.fbiadvakfi.org`

### Nasıl Deploy Edilir?

Terminalden projeyi deploy etmek için aşağıdaki komutu kullanmalısınız. **Uyarı:** `gcloud run deploy --set-env-vars` komutu ortam değişkenlerini **üzerine yazar (ezerek siler)**. Bu nedenle canlı şifreleri kaybetmemek için ya konsol üzerinden manuel deploy yapın ya da `--update-env-vars` komutunu kullanın. Örnek deploy komutu:

```bash
gcloud run deploy bursta-fbiad \
  --source . \
  --project dernektebugun-492221 \
  --region europe-west1 \
  --allow-unauthenticated \
  --update-env-vars="LIVE_ENV=true"
```

## 🗄️ Veritabanı Bilgileri

Proje, Google Cloud SQL üzerinde barınan bir PostgreSQL veritabanına `Drizzle ORM` ile bağlanır.

- **Cloud SQL Instance:** `Dernek-db-v2`
- **Veritabanı Adı:** `bursta-bugun`
- **Canlı (Production) IP Adresi:** `34.38.207.47`
- **Bağlantı URL Formatı (`DATABASE_URL`):** `postgresql://postgres:<SIFRE>@34.38.207.47:5432/bursta-bugun` (Canlı şifreler `.env` veya Google Cloud konsolundadır).

*Not: Şifreleme işlemleri (OTP vs.) geliştirme ortamında `SIFRELER.md` dosyasına yazılır, canlıda ise Resend SMTP üzerinden mail atılır.*

## ⚙️ Önemli Ortam Değişkenleri ve Mimari Notlar

- `LIVE_ENV`: Next.js'in `NEXT_PUBLIC_` değişkenlerini **derleme anında (build-time)** kodun içine gömme huyundan dolayı, projenin canlıda mı yoksa localhost'ta mı çalıştığını anlamak için kullanılır. Cloud Run'da mutlaka `LIVE_ENV=true` olmalıdır. Aksi takdirde Moka ödeme akışı yanlışlıkla `localhost:3005`'e yönlenir.
- **Moka Ödeme Yönlendirmesi:** Bu sistem doğrudan Moka ile iletişim kurmaz. Moka oturum başlatma ve geri dönüş işlemlerini `FBIADVakfiWeb` projesi (fbiad-web) yapar. Bu proje sadece `app-payment` URL'sini üreterek kullanıcıyı Web projesine gönderir. Moka limitlerine takılmamak için ödeme payload'u `fbiad-bagis|BAGIS-1234|...` şeklinde çok kısa bir string olarak Base64URL ile şifrelenip gönderilir.
