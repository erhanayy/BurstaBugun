'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, KeyRound, Smartphone, CheckCircle2, ShieldCheck, Eye, EyeOff, RotateCw } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { sendPasswordResetOtp, resetPasswordWithOtp } from "@/lib/actions/auth";

export default function SmsForgotPasswordForm() {
    // Adım kontrolü: 'phone' -> 'otp' -> 'success'
    const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');

    // Telefon Formu State'leri
    const [phone, setPhone] = useState('00 90 ');
    const [maskedPhone, setMaskedPhone] = useState('');
    const [targetPhone, setTargetPhone] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    // OTP ve Şifre State'leri
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Mesaj & Bilgilendirme
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    // Sayaç (3 dakika = 180 saniye)
    const [countdown, setCountdown] = useState(180);
    const [canResend, setCanResend] = useState(false);

    // Sayaç yönetimi
    useEffect(() => {
        let timer: any = null;
        if (step === 'otp' && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [step, countdown]);

    const formatTimer = (sec: number) => {
        const mins = Math.floor(sec / 60);
        const secs = sec % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 1. Adım: Telefon Numarası ile Doğrulama Kodu İste
    const handleSendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMessage(null);
        setInfoMessage(null);
        setIsSendingOtp(true);

        try {
            const result = await sendPasswordResetOtp(phone);
            if (result.success) {
                setMaskedPhone(result.maskedPhone || phone);
                setTargetPhone(result.phone || phone);
                setInfoMessage(result.message || "Doğrulama kodu telefonunuza SMS olarak gönderildi.");
                setStep('otp');
                setCountdown(180);
                setCanResend(false);
            } else {
                setErrorMessage(result.message || "Doğrulama kodu gönderilemedi.");
            }
        } catch (error: any) {
            setErrorMessage("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // 2. Adım: Kodu Tekrar Gönder
    const handleResendOtp = async () => {
        if (!canResend) return;
        setErrorMessage(null);
        setInfoMessage(null);
        setIsSendingOtp(true);

        try {
            const result = await sendPasswordResetOtp(targetPhone || phone);
            if (result.success) {
                setInfoMessage(result.message || "Yeni doğrulama kodu gönderildi.");
                setCountdown(180);
                setCanResend(false);
            } else {
                setErrorMessage(result.message || "Yeni kod gönderilemedi.");
            }
        } catch (error) {
            setErrorMessage("Kod gönderilirken bir hata oluştu.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    // 3. Adım: Doğrulama Kodu ve Yeni Şifre ile Sıfırla
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (newPassword.length < 6) {
            setErrorMessage("Yeni şifreniz en az 6 karakter olmalıdır.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Girdiğiniz yeni şifreler birbiriyle eşleşmiyor.");
            return;
        }

        if (otp.trim().length !== 6) {
            setErrorMessage("Lütfen 6 haneli doğrulama kodunu giriniz.");
            return;
        }

        setIsResetting(true);

        try {
            const result = await resetPasswordWithOtp({
                phone: targetPhone || phone,
                otp: otp.trim(),
                newPassword,
                confirmPassword,
            });

            if (result.success) {
                setStep('success');
            } else {
                setErrorMessage(result.message || "Şifre sıfırlama işlemi başarısız.");
            }
        } catch (error) {
            setErrorMessage("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4 py-8">
            <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-zinc-700">

                {/* ÜST BAŞLIK ALANI */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        {step === 'success' ? (
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        ) : step === 'otp' ? (
                            <ShieldCheck className="w-8 h-8" />
                        ) : (
                            <Smartphone className="w-8 h-8" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {step === 'success'
                            ? "Şifreniz Güncellendi!"
                            : step === 'otp'
                                ? "Doğrulama & Yeni Şifre"
                                : "Şifremi Unuttum"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                        {step === 'success'
                            ? "Yeni şifreniz başarıyla kaydedildi. Artık sisteme yeni şifrenizle giriş yapabilirsiniz."
                            : step === 'otp'
                                ? `${maskedPhone} numaralı telefonunuza gönderilen 6 haneli kodu ve yeni şifrenizi giriniz.`
                                : "Kayıtlı cep telefonu numaranızı girin. Size SMS ile doğrulama kodu göndereceğiz."}
                    </p>
                </div>

                {/* HATA MESAJI */}
                {errorMessage && (
                    <div className="p-4 rounded-lg mb-6 text-sm font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
                        {errorMessage}
                    </div>
                )}

                {/* BİLGİ MESAJI */}
                {infoMessage && (
                    <div className="p-4 rounded-lg mb-6 text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        {infoMessage}
                    </div>
                )}

                {/* ADIM 1: TELEFON NUMARASI GİRİŞİ */}
                {step === 'phone' && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cep Telefonu Numarası
                            </label>
                            <PhoneInput
                                name="phone"
                                value={phone}
                                onChange={setPhone}
                                required={true}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                                Sisteme kayıtlı cep telefonu numaranızı başında sıfır olmadan da girebilirsiniz.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isSendingOtp}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isSendingOtp ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Kod Gönderiliyor...
                                </>
                            ) : (
                                "Doğrulama Kodu Gönder"
                            )}
                        </button>
                    </form>
                )}

                {/* ADIM 2: OTP DOĞRULAMA & YENİ ŞİFRE BELİRLEME */}
                {step === 'otp' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    SMS Doğrulama Kodu
                                </label>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {countdown > 0 ? `Kalan Süre: ${formatTimer(countdown)}` : 'Süre Doldu'}
                                </span>
                            </div>
                            <input
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="6 Haneli Kod"
                                required
                                autoFocus
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-center tracking-widest text-2xl font-mono font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Yeni Şifre
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="En az 6 karakter"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Yeni Şifre Tekrarı
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Yeni şifrenizi tekrar girin"
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isResetting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
                        >
                            {isResetting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Şifre Güncelleniyor...
                                </>
                            ) : (
                                "Şifremi Güncelle"
                            )}
                        </button>

                        {/* Kodu Tekrar Gönder / Numarayı Değiştir */}
                        <div className="flex items-center justify-between pt-2 text-xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('phone');
                                    setOtp('');
                                    setErrorMessage(null);
                                    setInfoMessage(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
                            >
                                Numarayı Değiştir
                            </button>

                            <button
                                type="button"
                                disabled={!canResend || isSendingOtp}
                                onClick={handleResendOtp}
                                className={`flex items-center gap-1 font-medium ${canResend
                                    ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                                    : "text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <RotateCw className={`w-3.5 h-3.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                                {canResend ? "Kodu Tekrar Gönder" : `Tekrar gönder (${formatTimer(countdown)})`}
                            </button>
                        </div>
                    </form>
                )}

                {/* ADIM 3: BAŞARILI DURUMU */}
                {step === 'success' && (
                    <div className="space-y-4">
                        <Link
                            href="/login"
                            className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-sm"
                        >
                            Giriş Yap
                        </Link>
                    </div>
                )}

                {/* ALT BAĞLANTI: GİRİŞ EKRANINA DÖN */}
                {step !== 'success' && (
                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 flex items-center justify-center gap-2 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Giriş ekranına dön
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
