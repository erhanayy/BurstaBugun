"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Info, CreditCard, User as UserIcon } from "lucide-react";

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

import { submitManualPayment } from "@/lib/actions/admin-payments";
import { Phone } from "lucide-react";

const paymentSchema = z.object({
    fundId: z.string().min(1, "Lütfen bir EFT/Havale fonu seçiniz."),
    newUserName: z.string().min(1, "Lütfen Ad Soyad giriniz."),
    newUserEmail: z.string().email("Lütfen geçerli bir e-posta adresi giriniz."),
    newUserPhone: z.string().optional(),
    amount: z.coerce.number().min(1, "Lütfen geçerli bir tutar giriniz."),
    paymentDate: z.string().min(1, "Lütfen ödeme tarihini seçiniz."),
    studentCountTarget: z.coerce.number().min(0).default(0),
    supporterType: z.string().default("recurring"),
    notes: z.string().optional(),
});

export function PaymentForm({ eftFunds, tenantId }: { eftFunds: any[], tenantId: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isNewUser, setIsNewUser] = useState(false);
    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            fundId: "",
            newUserName: "",
            newUserEmail: "",
            newUserPhone: "",
            amount: 0,
            paymentDate: "", // initialized in useEffect to avoid hydration error
            studentCountTarget: 0,
            supporterType: "recurring",
            notes: "",
        },
    });

    useEffect(() => {
        form.setValue("paymentDate", new Date().toISOString().split("T")[0]);
    }, [form]);

    function onSubmit(values: z.infer<typeof paymentSchema>) {
        startTransition(async () => {
            try {
                const result = await submitManualPayment(values, tenantId);
                if (result.success) {
                    toast.success("Tahsilat başarıyla kaydedildi! Yeni bir kayıt girebilirsiniz.");
                    form.reset({
                        ...values,
                        newUserName: "",
                        newUserEmail: "",
                        newUserPhone: "",
                        amount: 0,
                        studentCountTarget: 0
                    });
                    // We don't redirect so the user can enter another one quickly
                    router.refresh();
                } else {
                    toast.error(result.error || "Tahsilat eklenirken hata oluştu.");
                }
            } catch (error: any) {
                toast.error(error.message || "Bilinmeyen bir hata oluştu.");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* FON SEÇİMİ */}
                <FormField
                    control={form.control}
                    name="fundId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hedef Fon (Sadece EFT Fonları) *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Bir EFT fonu seçiniz" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {eftFunds.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                                    ))}
                                    {eftFunds.length === 0 && (
                                        <SelectItem value="none" disabled>Hiçbir EFT fonu bulunamadı.</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* KULLANICI SEÇİMİ */}
                <div className="bg-gray-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <FormLabel className="text-base font-semibold">Bağışçı Bilgileri *</FormLabel>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="newUserName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input placeholder="Ad Soyad *" className="pl-10 h-12" {...field} value={field.value || ""} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newUserEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="email" placeholder="E-posta *" className="h-12" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newUserPhone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative flex items-center">
                                            <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                            <PhoneInput placeholder="00 90 5XX XXX XX XX" className="flex h-12 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 pl-10" value={field.value ?? ""} onChange={field.onChange} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <p className="text-xs text-gray-500">Not: Eğer girilen e-posta adresi sistemde kayıtlıysa, ödeme otomatik olarak o kişinin hesabına işlenir. Kayıtlı değilse yeni bir gölge hesap oluşturulur.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tutar (TL) *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input type="number" className="pl-10 h-12 text-lg font-semibold" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="paymentDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tahsilat Tarihi *</FormLabel>
                                <FormControl>
                                    <Input type="date" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="studentCountTarget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Öğrenci Taahhüdü (Hedef)</FormLabel>
                                <FormControl>
                                    <Input type="number" min="0" className="h-12" {...field} />
                                </FormControl>
                                <p className="text-xs text-gray-500 mt-1">Serbest bağış ise 0 bırakın.</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supporterType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Destekçi Tipi *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-gray-50 border-gray-200">
                                            <SelectValue placeholder="Seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="recurring">Daimi Destekçi</SelectItem>
                                        <SelectItem value="one_time">Tek Seferlik Destekçi</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={isPending} className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-xl">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Tahsilatı Kaydet
                    </Button>
                </div>
            </form>
        </Form>
    );
}
