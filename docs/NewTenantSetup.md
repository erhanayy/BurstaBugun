# Yeni Vakıf (Tenant) Kurulum Rehberi

Bu belge, sisteme yeni bir kurum, vakıf veya dernek (Tenant) ekleneceğinde izlenecek adımları açıklamaktadır. Sistem **Single Codebase (Tek Kod Tabanı)** ve **Shared Database (Ortak Veritabanı)** mantığı ile tasarlandığı için her yeni müşteri için kod çoğaltmaya (yeni branch açmaya) gerek yoktur.

## 1. Veritabanı Kaydı Oluşturma
Yeni bir kurum geldiğinde ilk iş veritabanında (`tenants` tablosu) ona özel bir kayıt açmaktır.

*   `tenants` tablosuna girin.
*   Yeni bir satır ekleyin:
    *   **shortName:** Kısa ad (Örn: `Yıldız`)
    *   **longName:** Uzun ad (Örn: `Yıldız Eğitim Vakfı`)
    *   **primaryColor:** Kurumun ana marka rengi (Örn: `#E11D48` - Kırmızı)
    *   **logoUrl:** Kuruma ait logonun adresi (Örn: `/yildiz-logo.png` veya tam URL)
    *   **features:** İsteğe bağlı, kuruma özel açık/kapalı olacak özellikler JSON'ı (Örn: `{"hasCustomForm": true}`)
*   Kaydı tamamladığınızda veritabanının atadığı o benzersiz **Tenant ID**'yi (UUID formatındaki kimlik) kopyalayın. Örn: `d1b2c3a4-5678-90ab-cdef-1234567890ab`.

## 2. Sunucuya Dağıtım (Deployment)
Kodu sunucuya veya bulut platformuna (Vercel, Cloud Run, VPS vb.) yükleyin. Yeni vakıf için ayrı bir proje ortamı ayarlayın ve alan adını (`yildizvakfi.org` gibi) bağlayın.

## 3. Sistemi O Vakfa Kilitlemek (Environment Variables)
Uygulamanın sadece "Yıldız Vakfı" verileriyle çalışması ve o kimliğe bürünmesi için sunucu ayarlarına (Environment Variables) girin ve şu değeri ekleyin:

```env
NEXT_PUBLIC_TENANT_ID=d1b2c3a4-5678-90ab-cdef-1234567890ab
```

Bu ayarı kaydedip sunucuyu başlattığınızda sistem artık o vakfa kilitlenir. Arayüz rengi kırmızıya döner, logo değişir ve başka vakıfların hiçbir verisi o ekranda görünmez.

---

## Sıkça Sorulan Sorular (SSS)

### Müşteri tamamen kendine özel, farklı bir tasarım ("Giydirme") isterse ne yapacağız?
Eğer bir vakıf sadece renk ve logo değiştirmekle kalmayıp tamamen farklı bir sayfa tasarımı (örneğin farklı bir Login ekranı dizilimi) isterse kodu yine ayırmak (branch açmak) zorunda değiliz.
Çözüm: **Feature Flags (Özellik Bayrakları)** veya **Theme Layouts** kullanmaktır.

*   **Yöntem:** `tenants` tablosundaki `features` JSON alanına örneğin `{"theme": "premium", "customLogin": true}` gibi bir değer gireriz.
*   **Kod Tarafı:** `app/login/page.tsx` içinde basit bir kontrol yaparız:
    ```tsx
    if (tenantInfo.features?.customLogin) {
        return <CustomYildizLoginForm />
    }
    return <DefaultLoginForm />
    ```
Bu sayede her müşterinin isteğini aynı kod içinde, sadece "if-else" veya dinamik component yapısıyla, projenin bakım kolaylığını kaybetmeden yönetebiliriz.
