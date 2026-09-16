# Google Cloud Run Deployment Analiz ve Tasarım Dokümanı

Bu doküman, **ŞirketteBugün** ve **DernekteBugün** projelerinin Google Cloud Run (Serverless) altyapısında standart ve güvenli bir şekilde nasıl canlıya (production) alındığını, versiyon yönetiminin nasıl yapıldığını, mimari tasarım kurallarını detaylandırır. Yeni veya güncel bir deployment yapılmadan önce **kesinlikle** bu standartlara bakılmalıdır.

## 1. Mimari Tasarım (Deployment Architecture)

Projeler herhangi bir geleneksel Sanal Makineye (Virtual Machine / EC2 / Compute Engine) ihtiyaç **duymadan**, Google'ın **Cloud Run** servisleri üzerinden "Container-as-a-Service" yapısıyla serverless (sunucusuz) olarak koşturulur. 

Avantajları:
- **Zero-downtime Deployments:** Yeni versiyon hazır olana kadar eskisi trafik almaya devam eder.
- **Otomatik Ölçeklendirme (Auto-scaling):** Kullanıcı trafiği arttıkça anında yeni container'lar kopyalanır. Trafik yokken sıfıra inip (scale-to-zero) maliyetleri bitirir.
- **Güvenlik ve İzolasyon:** Her tenant izole bir Next.js runtime üzerinde tam performanslı çalışır.

### Alan Adı ve SSL Yönlendirmeleri
Google Cloud Run üzerinden proje dış dünyaya bir CNAME kaydına bağlanılarak yansıtılır.
- **BurstaBugun (FBİAD Vakfı):** `www.fbiadvakfi.org` => CNAME `ghs.googlehosted.com`
- **ŞirketteBugün:** `sirkette.bugunai.com` => CNAME `ghs.googlehosted.com`
- **DernekteBugün:** `dernekte.bugunai.com` => CNAME `ghs.googlehosted.com`

---

## 2. Ortam Değişkenleri (Environment Variables) Güvenliği

Google Cloud Run platformunda `.env.local` veya `.env` dosyaları projeyle GİT üzerinden veya manuel olarak YÜKLENMEZ. Güvenlik ve best-practice gereği enviroment (ortam değişkeni) verileri doğrudan deployment (`gcloud run deploy`) komutuna flag (`--set-env-vars`) olarak sağlanır.

### BurstaBugun (FBİAD Vakfı) .env Çekirdek Yapısı
- `DATABASE_URL`: postgresql://postgres:Sifre@IPAdresi:5432/bursta-bugun
- `AUTH_SECRET`: super_secret_generated_key_for_local_dev
- `EMAIL_SENDER`: noreply@fbiadvakfi.org
- `RESEND_API_KEY`: re_*****
- `NEXT_PUBLIC_TENANT_ID`: cfc00202-11c1-48dd-ae63-35fd44c60977

---

## 3. Canlıya Alma (Deployment) Süreci ve Komutları

Deployment lokal bilgisayar üzerinden kaynak kod ile yapılır (`--source .`). Google Cloud Run bu komut çalıştırıldığında arka planda `npm run build` komutunu çalıştırarak imajı oluşturur.

### BurstaBugun (FBİAD) Deployment Komutu (Kısa Kullanım)
Google Cloud Run, mevcut ortam değişkenlerinizi (env vars) zaten saklar. Yalnızca koddaki güncellemeleri canlıya almak istediğinizde aşağıdaki komut yeterlidir:
```bash
gcloud run deploy bursta-fbiad --source . --region europe-west1
```

### BurstaBugun (FBİAD) Deployment Komutu (İlk Kurulum veya Ortam Değişkeni Güncelleme)
```bash
gcloud run deploy bursta-fbiad \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --vpc-egress all-traffic \
  --vpc-network bursta-vpc \
  --vpc-subnet bursta-subnet-2 \
  --set-env-vars="AUTH_SECRET=super_secret_generated_key_for_local_dev,AUTH_TRUST_HOST=true,DATABASE_URL=postgresql://postgres:***dB2026***@34.38.207.47:5432/bursta-bugun,EMAIL_API_TOKEN=db_email_token_2024_dernektebugun,EMAIL_SENDER=noreply@fbiadvakfi.org,LIVE_ENV=true,NEXT_PUBLIC_APP_URL=https://www.fbiadvakfi.org,NEXT_PUBLIC_TENANT_ID=cfc00202-11c1-48dd-ae63-35fd44c60977,NEXT_PUBLIC_VAPID_PUBLIC_KEY=BBE_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX,RESEND_API_KEY=re_********_******************,VAPID_PRIVATE_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

*Not:* Eklenen yeni API key'leri, Token'lar (Örn: VAPID_KEY vb.) sisteme entegre edildikçe bu komutlardaki `--set-env-vars=""` argüman listesine virgülle ayrılıp sırasıyla eklenmek **zorundadır**.

---

## 4. Gelecekte Dikkat Edilmesi Gereken Riskler & Kontroller

1. **Paket Senkronizasyonu Kontrolü (Build Check):** Deployment öncesi projenin lokalde `npm run build` testinden başarıyla geçtiğinden %100 emin olunmalıdır. Hatalı tip (type mismatch) veya bozuk importlar içeren bir proje Google Cloud Build üzerinde "Failed to build" (İnşa edilemedi) hatasına neden olacaktır.
2. **Next.js Caching Mekanizmaları:** Yeni kurduğumuz `.js` mimarilerinde veya resim kullanımlarında bir CSS/Scale değişikliği yapılırsa, tarayıcıların bunu yakalaması için önbellek kıran url argümanları (örneğin logo-v4.png veya ?v=2) gibi yaklaşımlara dikkat edilmelidir.
3. **Database URL Değişimi:** Farklı projelerin (Dernek vs Şirket) database'leri production (canlı ortam) verileri olduğundan, birbiriyle çaprazlanmamasına / taşırken kopyala-yapıştır hatası yapılmamasına azami özen gösterilmelidir. Oluşan en ufak url hatası tüm sistemi çökertebilir.
4. **Zorunlu Versiyon Göstergesi (Version Sync):** En güncel kod alındığında deployment komutunu girmeden hemen önce otomatik `node scripts/generate-version.js` ile About sayfasında görünecek versiyon numaralarının güncellenip GitHub'a push edilmesi bir proje standartı olarak korunmalıdır.

Sürüm ve Dağıtım Yönetimi: **Antigravity AI Assistant & Erhan Ayyıldız**
