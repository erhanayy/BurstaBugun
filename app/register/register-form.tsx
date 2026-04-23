"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, CheckCircle2, User, Phone, Mail } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { processRegistration, verifyEmailOTP } from "@/lib/actions/auth-register";

const registerSchema = z.object({
    fullName: z.string().min(3, "Lütfen adınızı ve soyadınızı tam giriniz."),
    email: z.string().email("Geçerli bir e-posta adresi giriniz."),
    phoneNumber: z.string().min(10, "Geçerli bir telefon numarası giriniz."),
    role: z.enum(["applicant", "sponsor"], { message: "Lütfen platformu kullanım amacınızı (Rol) seçiniz." }),
});

export function RegisterForm() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [userId, setUserId] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [otpCode, setOtpCode] = useState("");

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
        },
    });

    function onSubmit(values: z.infer<typeof registerSchema>) {
        startTransition(async () => {
            try {
                const result = await processRegistration(values);
                if (result.success) {
                    setUserId(result.userId);
                    setStep(2);
                    toast.success("Doğrulama kodu e-posta adresinize gönderildi!"); // Simulated via SIFRELER.md
                }
            } catch (error: any) {
                toast.error(error.message || "Kayıt işlemi sırasında bir hata oluştu.");
            }
        });
    }

    function handleVerify() {
        if (otpCode.length !== 6) {
            toast.error("Doğrulama kodu 6 haneli olmalıdır.");
            return;
        }

        startTransition(async () => {
            try {
                const result = await verifyEmailOTP(userId!, otpCode);
                if (result.success) {
                    toast.success("Hesabınız doğrulandı! Giriş yapabilirsiniz.");
                    router.push("/login?verified=1");
                }
            } catch (error: any) {
                toast.error(error.message || "Doğrulama başarısız oldu.");
            }
        });
    }

    if (step === 2) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">E-Posta Doğrulaması</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                            Lütfen e-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Doğrulama Kodu
                        </label>
                        <Input
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="text-center text-2xl tracking-[0.5em] h-14"
                        />
                    </div>
                    <Button
                        onClick={handleVerify}
                        disabled={isPending || otpCode.length !== 6}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                        Hesabımı Doğrula
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Rol Seçimi *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 h-12">
                                        <SelectValue placeholder="Sistemi hangi amaçla kullanacaksınız?" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="applicant">Öğrenci / Bursiyer Olarak Yeralacağım</SelectItem>
                                    <SelectItem value="sponsor">Bursveren / Referans / Kurum Olarak Yeralacağım</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ad Soyad *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input placeholder="Tam adınızı giriniz" className="pl-10" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>E-Posta Adresi *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <Input type="email" placeholder="ornek@posta.com" className="pl-10" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cep Telefonu *</FormLabel>
                            <FormControl>
                                <div className="relative flex items-center">
                                    <Phone className="absolute left-3 h-5 w-5 text-gray-400 z-10" />
                                    <PhoneInput placeholder="00 90 5XX XXX XX XX" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 pl-10" value={field.value ?? ""} onChange={field.onChange} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending} className="w-full mt-6 h-12 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                    Kayıt Ol ve Doğrula
                </Button>
            </form>
        </Form>
    );
}
