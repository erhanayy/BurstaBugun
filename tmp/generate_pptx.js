const pptxgen = require("/tmp/pptx_gen/node_modules/pptxgenjs");
const pptx = new pptxgen();

pptx.layout = 'LAYOUT_16x9';

// Slide 1: Kapak
let slide1 = pptx.addSlide();
slide1.background = { color: "1E3A5F" }; // Dark Blue
slide1.addText("BurstaBugün", { x: 1, y: 2, w: '80%', fontSize: 54, bold: true, color: "FFFFFF", align: 'center' });
slide1.addText("Yeni Nesil Eğitim Fonu Yönetim Platformu", { x: 1, y: 3.2, w: '80%', fontSize: 28, color: "E2E8F0", align: 'center' });
slide1.addShape(pptx.ShapeType.rect, { x: 0, y: '85%', w: '100%', h: '15%', fill: { color: "2563EB" } });

// Slide 2: Problemler
let slide2 = pptx.addSlide();
slide2.addText("Geleneksel Burs Sistemlerindeki Temel Sorunlar", { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: "1E3A5F" });
slide2.addText([
    { text: "İzlenebilirlik Kaybı", options: { bold: true, bullet: true, color: "E11D48", fontSize: 24 } },
    { text: "Bağışçı, yardımının kime ve ne zaman ulaştığını göremez.\n", options: { fontSize: 20, color: "475569" } },
    { text: "Ağır Operasyonel Yük", options: { bold: true, bullet: true, color: "E11D48", fontSize: 24 } },
    { text: "Evrak inceleme, referans arama ve mülakatlar zaman tüketir.\n", options: { fontSize: 20, color: "475569" } },
    { text: "Güven Problemi", options: { bold: true, bullet: true, color: "E11D48", fontSize: 24 } },
    { text: "Gerçekten ihtiyacı olan doğru öğrenciye ulaşılıyor mu?", options: { fontSize: 20, color: "475569" } }
], { x: 0.5, y: 1.5, w: '60%', h: 4 });

// Add an image to Slide 2
slide2.addImage({ path: "/Users/erhanayyildiz/Desktop/Work/BurstaBugun/public/bursiyer-login.jpeg", x: 6.5, y: 1.5, w: 3, h: 3, sizing: { type: "contain" } });

// Slide 3: Çözüm
let slide3 = pptx.addSlide();
slide3.background = { color: "F8FAFC" };
slide3.addText("Çözüm: BurstaBugün Eko-Sistemi", { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: "1E3A5F" });
slide3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.5, w: 9, h: 3.5, fill: { color: "FFFFFF" }, line: { color: "E2E8F0" } });
slide3.addText([
    { text: "Tamamen Dijital:", options: { bold: true, color: "2563EB" } },
    { text: " Manuel süreçlere ve Excel tablolarına son.\n", options: { color: "334155" } },
    { text: "Şeffaf ve Açık:", options: { bold: true, color: "2563EB" } },
    { text: " Bağışçı, yardımlarının yeşerdiğini saniye saniye izler.\n", options: { color: "334155" } },
    { text: "Kapalı Devre ve Güvenli:", options: { bold: true, color: "2563EB" } },
    { text: " Çift aşamalı dijital onay ve e-devlet uyumlu altyapı.", options: { color: "334155" } }
], { x: 1, y: 2, w: 8, fontSize: 24, bullet: { type: 'number' } });

// Slide 4: Fon Yönetimi
let slide4 = pptx.addSlide();
slide4.addText("1. Dinamik 'Bağışçı Merkezli' Fon Yönetimi", { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: "1E3A5F" });
slide4.addText([
    { text: "Bağışçı kendi fonunu kurar (Örn: Eğitim Meşalesi Fonu).", options: { bullet: true } },
    { text: "Bütçe planlamasını, kapasiteyi ve süreyi bağışçı belirler.", options: { bullet: true } },
    { text: "Dilerse dostlarına davet yollayarak fonu birlikte büyütebilirler (Ortak Havuz).", options: { bullet: true } }
], { x: 0.5, y: 2, w: '90%', fontSize: 24, color: "334155" });

// Slide 5: Aday Havuzu
let slide5 = pptx.addSlide();
slide5.addText("2. Merkezi ve Şeffaf Aday Havuzu", { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: "1E3A5F" });
slide5.addText([
    { text: "Adaylar kurumun formlarına e-devlet bilgileriyle kaydolur.", options: { bullet: true } },
    { text: "Onaylı adaylar güvenli 'Bursiyer Havuzu'nda toplanır.", options: { bullet: true } },
    { text: "Bağışçılar bu havuza girip, kendi kriterlerine uygun öğrencileri bizzat seçer.", options: { bullet: true } }
], { x: 0.5, y: 2, w: '90%', fontSize: 24, color: "334155" });

// Slide 6: Referans Sistemi
let slide6 = pptx.addSlide();
slide6.addText("3. Çift Aşamalı Güvenlik: Dijital Referans", { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: "1E3A5F" });
slide6.addText([
    { text: "Öğrenciler başvuruya mutlaka 2 resmi referans (Muhtar, Akademisyen vb.) ekler.", options: { bullet: true } },
    { text: "Sistem, referanslara otomatik E-posta/SMS gönderir.", options: { bullet: true } },
    { text: "Referans dijital ortamda onaylayana kadar aday havuza düşmez.", options: { bullet: true } },
    { text: "Kurumun saha araştırması yükü sıfırlanır, %100 güven sağlanır.", options: { bullet: true, color: "16A34A", bold: true } }
], { x: 0.5, y: 2, w: '90%', fontSize: 24, color: "334155" });

// Slide 7: Dashboard
let slide7 = pptx.addSlide();
slide7.addText("4. Akıllı Dashboard & Finansal İzlenebilirlik", { x: 0.5, y: 0.5, w: '90%', fontSize: 32, bold: true, color: "1E3A5F" });
slide7.addText([
    { text: "Bağışçı Modülü: 'Kaç gence ulaştım? Gerçekleşen harcamalarım ne kadar?'", options: { bullet: true } },
    { text: "Yönetici Modülü: Tüm fonların, onayların ve para akışının tek ekrandan kontrolü.", options: { bullet: true } },
    { text: "Referans Modülü: 'Benim kefil olduğum kaç öğrenci burs alıyor?'", options: { bullet: true } }
], { x: 0.5, y: 2, w: '90%', fontSize: 24, color: "334155" });

// Slide 8: Kapanış
let slide8 = pptx.addSlide();
slide8.background = { color: "1E3A5F" };
slide8.addText("Neden BurstaBugün?", { x: 1, y: 1.5, w: '80%', fontSize: 44, bold: true, color: "FFFFFF", align: 'center' });
slide8.addText([
    { text: "Bağışçılarınızı pasif bir kaynaktan, aktif bir 'Fon Yöneticisine' dönüştürün.\n", options: { fontSize: 28, color: "E2E8F0" } },
    { text: "Tam şeffaflık ile güven tazeleyin, sürdürülebilir bağış akışı yaratın.", options: { fontSize: 24, color: "93C5FD", bold: true } }
], { x: 1, y: 3, w: '80%', align: 'center' });

pptx.writeFile({ fileName: "/Users/erhanayyildiz/Desktop/Work/BurstaBugun/docs/BurstaBugun_Sunum.pptx" }).then(() => {
    console.log("PPTX generated successfully.");
});
