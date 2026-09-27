import { db } from "../lib/db";
import { users, applications, funds, fundSelections } from "../lib/db/schema";
import { eq, ilike } from "drizzle-orm";

const csvData = `2025-2026,Aleyna Gül GÜRSOY,0090 551 032 0732,Evet
2025-2026,Arda DOĞAN,0090 530 113 0744,Evet
2025-2026,Asya Nur KARABİBER,0090 505 388 3705,Evet
2025-2026,AYŞE YILMAZ,0090 552 836 3817,Hayır
2025-2026,Berfin ŞİMŞEK,0090 541 199 9569,Hayır
2025-2026,Buse Uğur,0090 539 372 8560,Evet
2025-2026,Büşra YİRMİBEŞ,0090 539 890 2796,Evet
2025-2026,Cemile KESKİN,0090 531 450 4328,Hayır
2025-2026,CEYDA KAYMAK,0090 538 747 6143,Evet
2025-2026,Cumali KAYA,0090 544 405 7113,Evet
2025-2026,Deniz ÇETİN,0090 541 734 8930,Hayır
2025-2026,Doluay BATMAZ,0090 530 279 7695,Evet
2025-2026,Erengül Büşra ÇAĞAN,0090 539 950 8973,Hayır
2025-2026,Evin Darılmaz,0090 531 356 0127,Hayır
2025-2026,Gülsüm Uğur,0090 551 547 9007,Hayır
2025-2026,Gülşah GÖY,0090 531 863 6185,Evet
2025-2026,Leyla Su Kozan (Hatice KAPKINER),0090 505 675 7406,Evet
2025-2026,Jibril YAHUZA,0090 542 104 7242,Evet
2025-2026,Kevser EŞREFOĞLU,0090 555 071 6016,Evet
2025-2026,MAKBULE SEVİNTİ,0090 552 8283409,Hayır
2025-2026,Merve uysal,0090 501 125 4102,Evet
2025-2026,Nilay AKBULUT,0090 534 920 9046,Evet
2025-2026,Nisanur YILDIRIM,0090 541 260 7795,Evet
2025-2026,Rabia AKÇAY,0090 541 147 8720,Hayır
2025-2026,Sıla KÖSE,0090 553 886 2702,Hayır
2025-2026,Sıla özdemir,0090 544 575 2523,Hayır
2025-2026,Suna TAŞKIN,0090 534 245 4016,Hayır
2025-2026,Tuana YILDIZ,0090 546 580 6210,Evet
2025-2026,Vahide Çabukel,0090 546 482 0921,Evet
2025-2026,Yağmur AVCI,0090 546 858 4516,Hayır
2025-2026,Yağmur ÖZDOĞAN,0090 551 001 2969,Hayır
2025-2026,Zeynep ÇAKMAK,0090 551 014 4592,Evet
2025-2026,Şebnem Semizer,0090 553 683 3307,Hayır
2025-2026,Caner Destegül,0090 555 068 8113,Evet
2025-2026,Hatice Yüksel,0090 534 881 9547,Evet
2025-2026,Görkem Tetik,0090 545 402 2871,Hayır
2025-2026,Ömer Ali Yücel,0090 542 293 6640,Evet
2025-2026,İpeksu Altan,0090 545 275 0215,Evet
2025-2026,Ecemnur Kazancı,0090 536 276 1892,Hayır
2025-2026,Ahmet Mirza Göktan,0090 530 880 3231,Evet
2025-2026,Zümra Karadaş,0090 507 230 7470,Evet
2025-2026,Nilay Bahadır,0090 551 395 3256,Evet
2025-2026,Yağmur Sağır,0090 535 834 0532,Hayır
2025-2026,Merve Yüksel,0090 534 865 9731,Evet
2025-2026,Azra Melike Kaymaz,0090 552 268 9934,Evet
2025-2026,Şeval Aleyna Kapkaç,0090 539 695 0802,Evet
2025-2026,Batuhan Bozkurt,0090 538 587 8158,Hayır
2025-2026,Sıla Ertürk,0090 539 677 9561,Hayır
2025-2026,Hanımşah Göy,0090 505 702 0797,Hayır
2025-2026,Saliha Nur Duva,0090 537 833 2256,Evet
2025-2026,İrem Gündüz,0090 539 934 4464,Hayır
2025-2026,Ceren Gündüz,0090 539 934 4464,Evet
2025-2026,İlkim Elif Sarı,0090 542 362 6964,Evet
2025-2026,Ayşe Naz İrer,0090 545 698 3160,Hayır
2025-2026,Ennur Balandi,0090 532 735 9356,Evet
2025-2026,Nisannur Taçyıldız,0090 535 023 2645,Evet
2025-2026,Zeynep Özdoğan,0090 501 124 5363,Hayır
2025-2026,Sudenaz Ünal,0090 530 442 6414,Evet
2025-2026,Özge Sakallı,0090 534 305 9973,Hayır
2025-2026,Ali Emir Lehimler,0090 530 945 6072,Evet
2025-2026,Şilan Horoz,0090 552 630 2596,Evet
2025-2026,İklimya Zümra Gündüz,0090 539 549 05 76,Hayır
2025-2026,Betül Işıltan,0090 542 267 96 43,Evet
2025-2026,Banu Deniz,0090 545 469 72 18,Evet
2025-2026,Elif Sena Büyükkarış,0090 536 884 82 75,Evet
2025-2026,Nur Sümeyra CAN,0090 546 618 79 18,Evet
2025-2026,Mehmet Faik Canan,0090 531 241 78 01,Evet`;

async function main() {
    const lines = csvData.trim().split('\n');
    const fund = await db.query.funds.findFirst({
        where: ilike(funds.title, '%2025-2026 FBIAD%')
    });
    
    const sels = await db.query.fundSelections.findMany({
        where: eq(fundSelections.fundId, fund.id),
        with: {
            application: {
                with: { user: true }
            }
        }
    });
    
    console.log(`Found ${sels.length} fund selections.`);
    
    // Check which one from the CSV is NOT in the sels
    const inSels = sels.map(s => {
        const phone = s.application.user.phoneNumber ? s.application.user.phoneNumber.replace(/[\s-]/g, '').replace(/^0090/, '').replace(/^\+90/, '').replace(/^0/, '') : '';
        return {
            name: s.application.user.fullName.toLowerCase().trim(),
            phone,
            email: s.application.user.email?.toLowerCase().trim()
        };
    });
    
    const missing = [];
    for (const line of lines) {
        const parts = line.split(',');
        const name = parts[1].trim();
        const p = parts[2].trim().replace(/[\s-]/g, '').replace(/^0090/, '').replace(/^\+90/, '').replace(/^0/, '');
        
        let found = inSels.find(s => s.name === name.toLowerCase() || s.phone === p);
        // Also if the name is close:
        if (!found) {
            found = inSels.find(s => s.name.includes(name.toLowerCase()) || name.toLowerCase().includes(s.name));
        }
        
        if (!found) {
            missing.push(name);
        }
    }
    
    console.log("Missing from fundSelections:", missing);
    process.exit(0);
}
main();
