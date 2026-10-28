import fs from "fs";
import path from "path";

export interface SendSmsOptions {
    to: string;
    message: string;
    screen?: string;
}

export interface SendSmsResult {
    success: boolean;
    jobId?: string;
    error?: string;
    isMock?: boolean;
}

// SMS Kimlik Doğrulama özelliği aktif mi?
export function isSmsAuthEnabled(): boolean {
    return process.env.ENABLE_SMS_AUTH === "true" || process.env.NEXT_PUBLIC_ENABLE_SMS_AUTH === "true";
}

// Telefon numarasını Netgsm formatına (905XXXXXXXXX) dönüştürür
export function normalizePhoneForNetgsm(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 10) {
        return "90" + digits.slice(-10);
    }
    return digits;
}

// Localhost / Test için SIFRELER.md dosyasına loglama
function logToDevFile(message: string) {
    try {
        const filePath = path.join(process.cwd(), "SIFRELER.md");
        const timestamp = new Date().toLocaleString("tr-TR");
        const formatted = `\n[${timestamp}] ${message}\n`;
        fs.appendFileSync(filePath, formatted);
    } catch (e) {
        console.error("[SMS Log] SIFRELER.md dosyasına yazılamadı:", e);
    }
}

/**
 * Netgsm üzerinden SMS gönderir.
 * Eğer Netgsm bilgileri .env içinde tanımlı değilse veya dev ortamındaysa Mock modunda çalışır.
 */
export async function sendSms(options: SendSmsOptions): Promise<SendSmsResult> {
    const { to, message, screen = "system" } = options;

    const usercode = process.env.NETGSM_USERCODE;
    const password = process.env.NETGSM_PASSWORD;
    const header = process.env.NETGSM_HEADER;

    const gsmno = normalizePhoneForNetgsm(to);

    // NetGSM Hata Kodu Açıklamaları
    const netgsmErrors: Record<string, string> = {
        "20": "Mesaj metni hatalı veya karakter sınırı aşıldı.",
        "30": "Geçersiz kullanıcı adı veya şifre (Netgsm API izni kapalı olabilir).",
        "40": "Mesaj başlığı (gönderici adı) hatalı veya onaylanmamış.",
        "50": "Abone hesabında SMS kredisi yok / bakiye yetersiz.",
        "51": "Abonelik aktif değil.",
        "70": "Hatalı parametre veya telefon formatı.",
        "85": "Mükerrer gönderim engeli (aynı numaraya 1 dakika içinde aynı mesaj gönderilemez).",
    };

    // 1. Eğer Netgsm API bilgileri tanımlıysa gerçek SMS gönder
    if (usercode && password && header) {
        try {
            console.log(`[sendSms] Netgsm gönderimi başlatılıyor: To=${gsmno}, Header=${header}, Screen=${screen}`);
            
            const params = new URLSearchParams({
                usercode: usercode.trim(),
                password: password.trim(),
                gsmno: gsmno,
                message: message,
                msgheader: header.trim(),
                dil: "TR",
            });

            const response = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params.toString()}`, {
                method: "GET",
                headers: {
                    "User-Agent": "BurstaBugun/1.0",
                },
                cache: "no-store",
            });

            const responseText = (await response.text()).trim();
            console.log(`[sendSms] Netgsm yanıtı:`, responseText);

            // Başarılı yanıtlar: "00 12345678", "01 ...", "02 ..." şeklinde başlar
            const firstTwoDigits = responseText.substring(0, 2);
            if (firstTwoDigits === "00" || firstTwoDigits === "01" || firstTwoDigits === "02") {
                const parts = responseText.split(" ");
                const jobId = parts[1] || responseText;
                return { success: true, jobId };
            }

            // Hata kodu analizi
            const errorDesc = netgsmErrors[firstTwoDigits] || `Netgsm Hata Kodu: ${responseText}`;
            console.error(`[sendSms] Netgsm Gönderim Hatası:`, errorDesc);
            return { success: false, error: errorDesc };
        } catch (error: any) {
            console.error("[sendSms] Netgsm bağlantı hatası:", error);
            return { success: false, error: error.message || "SMS servisine bağlanılamadı." };
        }
    }

    // 2. Netgsm bilgileri henüz girilmediyse: MOCK MODU (Test Modu)
    console.warn(`[sendSms - MOCK MODE] Netgsm bilgileri henüz .env'de tanımlı değil. SMS simüle edildi:`);
    console.warn(`  Alıcı: ${gsmno}`);
    console.warn(`  Mesaj: ${message}`);

    logToDevFile(
        `SMS GÖNDERİMİ (MOCK MODU - ${screen}):\n` +
        `- Alıcı: ${to} (Netgsm: ${gsmno})\n` +
        `- Mesaj: ${message}\n` +
        `- Not: Netgsm bilgileri tanımlandığında bu mesaj gerçek SMS olarak iletilecektir.`
    );

    return {
        success: true,
        isMock: true,
        jobId: `mock_${Date.now()}`,
    };
}
