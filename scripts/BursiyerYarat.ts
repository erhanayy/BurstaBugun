import { db } from "../lib/db";
import { users, applications, tenants, tenantUsers, funds, applicationForms, references } from "../lib/db/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const dummyHedefler = [
    "İleride yapay zeka alanında uzmanlaşıp ülkeme faydalı bir mühendis olmak istiyorum.",
    "Hedefim tıp fakültesini dereceyle bitirip saygın bir cerrah olmaktır.",
    "Büyük bir teknoloji firmasında veri bilimcisi olarak çalışıp inovasyonlara imza atmak.",
    "Toplumsal sorumluluk projeleri geliştirecek bir yazılım ekibinin lideri olmak."
];

const dummyHikayeler = [
    "Küçüklüğümden beri matematiğe ve bilgisayarlara ilgim vardı. Zor şartlarda okusam da pes etmedim.",
    "Ailemin maddi durumu yeterli olmasa da her zaman kitaplarla ve bilimi takip ederek kendimi geliştirdim.",
    "Lisedeyken katıldığım bir olimpiyat hayatımı değiştirdi. Şimdi o tutkuyla üniversiteme devam ediyorum.",
    "Okumak için memleketimden ayrıldığım günden beri tek gayem hedeflerime en iyi şekilde ulaşmak oldu."
];

function getRandomItem(arr: string[]): string {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
    const countArg = process.argv[2];
    const count = parseInt(countArg) || 1;
    console.log(`Generating ${count} mock student(s)...`);

    // Get Tenant
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.shortName, "BurstaBugün")
    });

    if (!tenant) {
        console.error("Default tenant not found.");
        process.exit(1);
    }

    // Get a Fund (Fallback to first active fund if possible)
    const fundObj = await db.query.funds.findFirst();

    if (!fundObj) {
        console.error("No funds created yet! Please create a fund first.");
        process.exit(1);
    }

    // Get a Form
    const formObj = await db.query.applicationForms.findFirst();

    const hashedPassword = await bcrypt.hash("071907", 10);

    for (let i = 0; i < count; i++) {
        const userId = crypto.randomUUID();
        const email = `ogrenci_${userId.split('-')[0]}@test.com`;

        // 1. Create User
        await db.insert(users).values({
            id: userId,
            fullName: `Öğrenci ${userId.split('-')[0]}`,
            email: email,
            phoneNumber: `555${Math.floor(1000000 + Math.random() * 9000000)}`,
            password: hashedPassword,
            forcePasswordChange: false, // Don't ask for pass change
            isActive: true
        });

        // 2. Link to tenant
        await db.insert(tenantUsers).values({
            tenantId: tenant.id,
            userId: userId,
            role: "applicant",
            status: "active"
        });

        // 3. Create Mock Application
        const mockAnswers = {
            fullName: `Öğrenci ${userId.split('-')[0]}`,
            hedef: getRandomItem(dummyHedefler),
            hikayem: getRandomItem(dummyHikayeler),
            gpa: (Math.random() * 1.5 + 2.5).toFixed(2), // Random GPA between 2.50 and 4.00
            university: "Boğaziçi Üniversitesi",
            department: "Bilgisayar Mühendisliği"
        };

        const applicationId = crypto.randomUUID();

        await db.insert(applications).values({
            id: applicationId,
            tenantId: tenant.id,
            userId: userId,
            fundId: fundObj.id,
            formId: formObj?.id,
            status: "in_pool",
            answersJson: JSON.stringify(mockAnswers)
        });

        // 4. Create References (Muhtar & Teacher)
        await db.insert(references).values({
            applicationId: applicationId,
            email: `muhtar_${userId.split('-')[0]}@test.com`,
            fullName: `Muhtar Ahmet ${userId.split('-')[0]}`,
            title: "muhtar",
            status: "approved",
            comment: "Bu öğrenciyi mahallemizden yıllardır tanırım, ailesinin durumu gerçekten zayıftır. Burs verilmesini kesinlikle uygun görüyorum."
        });

        await db.insert(references).values({
            applicationId: applicationId,
            email: `hoca_${userId.split('-')[0]}@test.com`,
            fullName: `Prof. Dr. Ayşe ${userId.split('-')[0]}`,
            title: "teacher",
            status: "approved",
            comment: "Derslerimde oldukça çalışkan ve başarılı bir öğrencidir. Desteklenmesi akademik hedeflerine ulaşmasını hızlandıracaktır."
        });

        console.log(`Created student: Öğrenci ${userId.split('-')[0]} | Email: ${email}`);
    }

    console.log("Done!");
    process.exit(0);
}

main().catch(console.error);
