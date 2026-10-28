"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "../db";
import { users } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getCurrentTenant } from "../data/tenant";
import { revalidatePath } from "next/cache";
import { sendEmail, EMAIL_CODES } from "../email";
import { sendSms, isSmsAuthEnabled } from "../sms";

import { cookies } from "next/headers";

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        const identifier = formData.get('identifier') as string;
        
        const cookieStore = await cookies();
        const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        const tenantId = envTenantId || cookieStore.get('dernekte_tenant_id')?.value || '';

        // 1. Sign In (No Redirect)
        await signIn('credentials', { ...Object.fromEntries(formData), tenantId, redirect: false });

        redirect('/dashboard/home');

    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Giriş başarısız. Bilgilerinizi kontrol edin.';
                default:
                    return 'Bir hata oluştu.';
            }
        }
        throw error;
    }
}

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}

export async function changePassword(prevState: any, formData: FormData) {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
        return { message: "Yeni şifreler eşleşmiyor.", errors: { confirmPassword: ["Şifreler eşleşmiyor"] } };
    }

    if (newPassword.length < 6) {
        return { message: "Şifre en az 6 karakter olmalıdır." };
    }

    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) {
        return { message: "Oturum bulunamadı." };
    }

    const userId = tenantData.userId;

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId)
    });

    if (!user || !user.password) {
        return { message: "Kullanıcı bulunamadı." };
    }

    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordsMatch) {
        return { message: "Mevcut şifre yanlış." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));

    revalidatePath("/dashboard");
    return { message: "Şifre başarıyla güncellendi.", success: true };
}

export async function updateForcedPassword(prevState: any, formData: FormData) {
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) return { message: "Şifreler eşleşmiyor.", success: false };
    if (newPassword.length < 6) return { message: "Şifre en az 6 karakter olmalıdır.", success: false };

    const tenantData = await getCurrentTenant();
    if (!tenantData?.userId) return { message: "Oturum hatası. Lütfen tekrar giriş yapın.", success: false };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.update(users)
        .set({ password: hashedPassword, forcePasswordChange: false })
        .where(eq(users.id, tenantData.userId));

    revalidatePath("/dashboard");
    redirect("/dashboard/home");
}

export async function forgotPassword(prevState: any, formData: FormData) {
    const emailInput = (formData.get("email") as string)?.trim() || '';
    const phoneInput = (formData.get("phone") as string)?.trim() || '';

    console.log("[forgotPassword] emailInput:", emailInput, "phoneInput:", phoneInput);

    if (!emailInput || !phoneInput) {
        return { message: "Lütfen e-posta adresinizi ve telefonunuzu girin.", success: false };
    }

    const cookieStore = await cookies();
    const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
    const tenantId = envTenantId || cookieStore.get('dernekte_tenant_id')?.value || '';

    // 1. Find user by exact match of email AND phone AND tenantId (or null for super admins)
    const user = await db.query.users.findFirst({
        where: (users, { eq, and, or, isNull }) => and(
            eq(users.email, emailInput),
            eq(users.phoneNumber, phoneInput),
            tenantId ? or(
                eq(users.tenantId, tenantId),
                isNull(users.tenantId)
            ) : undefined
        )
    });

    console.log("[forgotPassword] user found:", user ? `id=${user.id}, email=${user.email}` : "NOT FOUND");

    if (user && user.email) {
        // 2. Generate temporary password
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let temporaryPassword = '';
        for (let i = 0; i < 8; i++) {
            temporaryPassword += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // 3. Hash and update DB
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        await db.update(users)
            .set({ password: hashedPassword, forcePasswordChange: true })
            .where(eq(users.id, user.id));

        // 4. Send email
        const result = await sendEmail({
            code: EMAIL_CODES.SIFRE_GONDERIMI,
            sentTo: user.email,
            subject: 'Geçici Şifreniz - DernekteBugün',
            body: `
                <h2>Merhaba ${user.fullName},</h2>
                <p>Şifre sıfırlama talebiniz üzerine geçici şifreniz oluşturuldu.</p>
                <p><strong>Geçici Şifre:</strong> <code style="background:#f3f4f6;padding:4px 8px;border-radius:4px;font-size:16px;">${temporaryPassword}</code></p>
                <p>Lütfen bu şifre ile giriş yapın. Giriş yaptıktan sonra şifrenizi değiştirmeniz istenecektir.</p>
                <br/>
                <p>DernekteBugün Yönetimi</p>
            `,
            screen: 'forgot-password',
        });
        console.log("[forgotPassword] sendEmail result:", JSON.stringify(result));
    }

    // Always return success to prevent user enumeration
    return { message: "Eğer kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.", success: true };
}

export async function checkSmsAuthEnabled(): Promise<boolean> {
    return isSmsAuthEnabled();
}

export async function sendPasswordResetOtp(phone: string) {
    try {
        const cleanPhone = (phone || "").trim();
        const digits = cleanPhone.replace(/\D/g, "");
        if (digits.length < 10) {
            return {
                success: false,
                message: "Lütfen geçerli 10 haneli cep telefonu numaranızı giriniz (örn: 05XX XXX XX XX)."
            };
        }
        const last10 = digits.slice(-10);

        const cookieStore = await cookies();
        const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        const tenantId = envTenantId || cookieStore.get('dernekte_tenant_id')?.value || '';

        const user = await db.query.users.findFirst({
            where: (users, { and, or, isNull }) => and(
                sql`regexp_replace(${users.phoneNumber}, '[^0-9]', '', 'g') LIKE ${'%' + last10}`,
                tenantId ? or(eq(users.tenantId, tenantId), isNull(users.tenantId)) : undefined
            )
        });

        if (!user) {
            return {
                success: false,
                message: "Bu telefon numarasına ait bir kullanıcı hesabı bulunamadı."
            };
        }

        // 6 haneli OTP kodu üret
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 dakika geçerli

        await db.update(users)
            .set({
                verificationCode: otp,
                verificationCodeExpiresAt: expiresAt,
            })
            .where(eq(users.id, user.id));

        // SMS gönder
        const targetPhone = user.phoneNumber || cleanPhone;
        const smsResult = await sendSms({
            to: targetPhone,
            message: `Sayin ${user.fullName || 'Uyemiz'}, DernekteBugun sifre sifirlama dogrulama kodunuz: ${otp}. Bu kod 3 dakika gecerlidir.`,
            screen: 'forgot-password'
        });

        if (!smsResult.success) {
            return {
                success: false,
                message: smsResult.error || "SMS gönderilirken bir hata oluştu. Lütfen tekrar deneyin."
            };
        }

        // Maskelenmiş telefon (örn: 0532 *** ** 12)
        const masked = `05${last10.slice(1, 4)} *** ** ${last10.slice(-2)}`;

        return {
            success: true,
            maskedPhone: masked,
            phone: targetPhone,
            isMock: smsResult.isMock || false,
            message: smsResult.isMock
                ? `Test Modu: Doğrulama kodunuz (${otp}) oluşturuldu (SIFRELER.md dosyasında görüntülenebilir).`
                : `${masked} numaralı telefonunuza 6 haneli doğrulama kodu gönderildi.`
        };
    } catch (error: any) {
        console.error("[sendPasswordResetOtp] Hata:", error);
        return { success: false, message: "İşlem sırasında beklenmeyen bir hata oluştu." };
    }
}

export async function resetPasswordWithOtp(data: {
    phone: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
}) {
    try {
        const { phone, otp, newPassword, confirmPassword } = data;

        if (!newPassword || newPassword.length < 6) {
            return { success: false, message: "Yeni şifre en az 6 karakter olmalıdır." };
        }
        if (newPassword !== confirmPassword) {
            return { success: false, message: "Girilen şifreler birbiriyle eşleşmiyor." };
        }
        if (!otp || otp.trim().length !== 6) {
            return { success: false, message: "Lütfen 6 haneli doğrulama kodunu eksiksiz giriniz." };
        }

        const digits = (phone || "").replace(/\D/g, "");
        if (digits.length < 10) {
            return { success: false, message: "Geçersiz telefon numarası." };
        }
        const last10 = digits.slice(-10);

        const cookieStore = await cookies();
        const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
        const tenantId = envTenantId || cookieStore.get('dernekte_tenant_id')?.value || '';

        const user = await db.query.users.findFirst({
            where: (users, { and, or, isNull }) => and(
                sql`regexp_replace(${users.phoneNumber}, '[^0-9]', '', 'g') LIKE ${'%' + last10}`,
                tenantId ? or(eq(users.tenantId, tenantId), isNull(users.tenantId)) : undefined
            )
        });

        if (!user) {
            return { success: false, message: "Kullanıcı bulunamadı." };
        }

        if (!user.verificationCode || user.verificationCode.trim() !== otp.trim()) {
            return { success: false, message: "Girdiğiniz doğrulama kodu hatalı." };
        }

        if (!user.verificationCodeExpiresAt || new Date() > new Date(user.verificationCodeExpiresAt)) {
            return {
                success: false,
                message: "Doğrulama kodunun süresi dolmuş. Lütfen 'Kodu Tekrar Gönder' butonuna basarak yeni kod isteyin."
            };
        }

        // Yeni şifreyi hashle ve kaydet, doğrulama kodunu temizle
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.update(users)
            .set({
                password: hashedPassword,
                verificationCode: null,
                verificationCodeExpiresAt: null,
                forcePasswordChange: false,
            })
            .where(eq(users.id, user.id));

        return {
            success: true,
            message: "Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz."
        };
    } catch (error: any) {
        console.error("[resetPasswordWithOtp] Hata:", error);
        return { success: false, message: "Şifre güncellenirken bir hata oluştu." };
    }
}


