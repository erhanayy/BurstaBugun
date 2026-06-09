"use server";

import { db } from "@/lib/db";
import { users, tenants, tenantUsers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { sendEmail, EMAIL_CODES } from "@/lib/email";

// Helper to append to SIFRELER.md
function logToDevFile(message: string) {
    try {
        const filePath = path.join(process.cwd(), "SIFRELER.md");
        const timestamp = new Date().toLocaleString("tr-TR");
        const formatted = `\n[${timestamp}] ${message}\n`;
        fs.appendFileSync(filePath, formatted);
    } catch (e) {
        console.error("Failed to log to SIFRELER.md", e);
    }
}

export async function processRegistration(data: any) {
    try {
        const { fullName, email, phoneNumber, role } = data;

        if (!email || !phoneNumber || !role) {
            return { error: "Lütfen zorunlu alanları doldurunuz." };
        }

        // Create or find Tenant
        const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        let targetTenant;

        if (envTenantId) {
            targetTenant = await db.query.tenants.findFirst({
                where: eq(tenants.id, envTenantId)
            });
        }

        if (!targetTenant) {
            // Fallback to Global Tenant
            targetTenant = await db.query.tenants.findFirst({
                where: eq(tenants.shortName, "BurstaBugün")
            });

            if (!targetTenant) {
                const [newTenant] = await db.insert(tenants).values({
                    shortName: "BurstaBugün",
                    longName: "BurstaBugün Platformu",
                }).returning();
                targetTenant = newTenant;
            }
        }

        // Check existing based on tenant isolation
        const existingEmail = await db.query.users.findFirst({
            where: (users, { and, eq }) => and(
                eq(users.email, email),
                eq(users.tenantId, targetTenant.id)
            )
        });
        if (existingEmail) return { error: "Bu e-posta adresi bu platformda zaten kayıtlı." };

        const existingPhone = await db.query.users.findFirst({
            where: (users, { and, eq }) => and(
                eq(users.phoneNumber, phoneNumber),
                eq(users.tenantId, targetTenant.id)
            )
        });
        if (existingPhone) return { error: "Bu telefon numarası bu platformda zaten kayıtlı." };

        // Generate Pass & OTP
        const firstPassword = "Burs" + Math.floor(1000 + Math.random() * 9000) + "!";
        const hashedPassword = await bcrypt.hash(firstPassword, 10);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit

        // Insert User
        const [newUser] = await db.insert(users).values({
            tenantId: targetTenant.id,
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            verificationCode: otpCode,
            forcePasswordChange: true, // "şifre değiştirme vb. testler için" -> forces them to change
            isActive: false // Will activate on OTP verify
        }).returning();

        // Link user to tenant
        await db.insert(tenantUsers).values({
            tenantId: targetTenant.id,
            userId: newUser.id,
            role: role,
            status: 'active'
        });

        // Send Email
        await sendEmail({
            code: EMAIL_CODES.SIFRE_GONDERIMI,
            sentTo: email,
            subject: `Hesap Doğrulama ve İlk Şifreniz - ${targetTenant.longName}`,
            body: `
                <h2>Merhaba ${fullName},</h2>
                <p>Aramıza hoş geldiniz! Hesabınızı doğrulamak için aşağıdaki kodu kullanabilirsiniz:</p>
                <p><strong>Doğrulama (OTP) Kodu:</strong> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:16px;">${otpCode}</code></p>
                <p>Doğrulama işleminden sonra sisteme giriş yapabilmeniz için geçici şifreniz aşağıdadır. Lütfen ilk girişinizde şifrenizi değiştirin.</p>
                <p><strong>Geçici Şifreniz:</strong> <code>${firstPassword}</code></p>
                <br/>
                <p>${targetTenant.longName} Yönetimi</p>
            `,
            screen: 'register',
        });

        return {
            success: true,
            userId: newUser.id
        };
    } catch (e: any) {
        console.error("Register Error:", e);
        return { error: e.message || "Kayıt işlemi sırasında bir hata oluştu." };
    }
}

export async function verifyEmailOTP(userId: string, otpCode: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user) throw new Error("Kullanıcı bulunamadı.");
    if (user.verificationCode !== otpCode) throw new Error("Hatalı doğrulama kodu!");

    await db.update(users)
        .set({
            isActive: true,
            verificationCode: null
        })
        .where(eq(users.id, userId));

    return { success: true };
}
