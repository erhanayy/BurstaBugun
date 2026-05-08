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
    console.log(`Generating ${count} mock student(s) for FBİAD...`);

    // Get FBİAD Tenant
    const tenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, "cfc00202-11c1-48dd-ae63-35fd44c60977")
    });

    if (!tenant) {
        console.error("FBİAD tenant not found.");
        process.exit(1);
    }

    // Get FBİAD Fund
    const fundObj = await db.query.funds.findFirst({
        where: eq(funds.tenantId, tenant.id)
    });

    if (!fundObj) {
        console.error("No funds created yet for FBİAD! Please create a fund first.");
        process.exit(1);
    }

    // Get FBİAD Form (Optional)
    const formObj = await db.query.applicationForms.findFirst({
        where: eq(applicationForms.tenantId, tenant.id)
    });

    const hashedPassword = await bcrypt.hash("071907", 10);

    for (let i = 0; i < count; i++) {
        const userId = crypto.randomUUID();
        const randNum = Math.floor(1000 + Math.random() * 9000);
        const email = `ogrenci_fbiad_${randNum}@test.com`;

        // 1. Create User
        await db.insert(users).values({
            id: userId,
            fullName: `FBİAD Bursiyer ${randNum}`,
            email: email,
            phoneNumber: `555${Math.floor(1000000 + Math.random() * 9000000)}`,
            password: hashedPassword,
            forcePasswordChange: false,
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
            fullName: `FBİAD Bursiyer ${randNum}`,
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
            formId: formObj?.id || null,
            status: "in_pool",
            answersJson: JSON.stringify(mockAnswers)
        });

        // 4. Create References (Muhtar & Teacher)
        await db.insert(references).values({
            applicationId: applicationId,
            email: `muhtar_${randNum}@test.com`,
            fullName: `Muhtar Ahmet ${randNum}`,
            title: "muhtar",
            status: "approved",
            comment: "Bu öğrenciyi mahallemizden yıllardır tanırım, ailesinin durumu gerçekten zayıftır. Burs verilmesini kesinlikle uygun görüyorum."
        });

        await db.insert(references).values({
            applicationId: applicationId,
            email: `hoca_${randNum}@test.com`,
            fullName: `Prof. Dr. Ayşe ${randNum}`,
            title: "teacher",
            status: "approved",
            comment: "Derslerimde oldukça çalışkan ve başarılı bir öğrencidir. Desteklenmesi akademik hedeflerine ulaşmasını hızlandıracaktır."
        });

        console.log(`Created student: FBİAD Bursiyer ${randNum} | Email: ${email}`);
    }

    console.log(`\nSuccessfully generated ${count} applications for FBİAD.`);
    process.exit(0);
}

main().catch(console.error);
