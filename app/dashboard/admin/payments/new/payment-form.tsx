"use client";

import { useTransition, useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
    Loader2, Plus, CreditCard, User as UserIcon, CheckCircle2, 
    Search, UserPlus, Phone, Mail, ArrowLeft, Check, Sparkles, AlertCircle
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { submitManualPayment } from "@/lib/actions/admin-payments";

const paymentSchema = z.object({
    fundId: z.string().min(1, "Lütfen bir EFT/Havale fonu seçiniz."),
    userId: z.string().optional(),
    newUserName: z.string().optional(),
    newUserEmail: z.string().optional(),
    newUserPhone: z.string().optional(),
    amount: z.coerce.number().min(1, "Lütfen geçerli bir tutar giriniz."),
    paymentDate: z.string().min(1, "Lütfen ödeme tarihini seçiniz."),
    studentCountTarget: z.coerce.number().min(0).default(0),
    supporterType: z.string().default("recurring"),
    notes: z.string().optional(),
    pledgeId: z.string().optional(),
}).superRefine((data, ctx) => {
    // Eğer kayıtlı kullanıcı seçilmediyse (yeni/manuel mod), Ad Soyad ve E-posta zorunludur
    if (!data.userId) {
        if (!data.newUserName || data.newUserName.trim().length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Lütfen Ad Soyad giriniz.",
                path: ["newUserName"]
            });
        }
        if (!data.newUserEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.newUserEmail.trim())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Lütfen geçerli bir e-posta adresi giriniz.",
                path: ["newUserEmail"]
            });
        }
    }
});

function turkishToLower(str: string = "") {
    return str
        .replace(/İ/g, "i")
        .replace(/I/g, "ı")
        .toLowerCase();
}

function findMatchingUser(
    users: any[],
    name?: string,
    phone?: string,
    email?: string
) {
    if (!users || users.length === 0) return null;

    const norm = (s?: string) => s ? turkishToLower(s).replace(/[\s\-_.]+/g, '') : '';
    const normPhone = (p?: string) => p ? p.replace(/\D/g, '').slice(-10) : '';

    const targetEmail = norm(email);
    const targetName = norm(name);
    const targetPhoneDigits = normPhone(phone);

    // 1. E-posta Birebir Eşleşmesi (Varsa)
    if (targetEmail) {
        const match = users.find(u => norm(u.email) === targetEmail);
        if (match) return match;
    }

    // 2. Hem Ad Soyad HEM Telefon Eşleşmesi (En yüksek güvenilirlik)
    if (targetName && targetPhoneDigits.length >= 7) {
        const match = users.find(u => {
            const uName = norm(u.fullName);
            const uPhoneDigits = normPhone(u.phoneNumber || u.phone);
            return uName === targetName && uPhoneDigits.endsWith(targetPhoneDigits);
        });
        if (match) return match;
    }

    // 3. Ad Soyad Birebir Eşleşmesi
    if (targetName) {
        const match = users.find(u => norm(u.fullName) === targetName);
        if (match) return match;
    }

    // 4. Telefon Birebir Eşleşmesi (Son 10 hane)
    if (targetPhoneDigits.length >= 10) {
        const match = users.find(u => {
            const uPhoneDigits = normPhone(u.phoneNumber || u.phone);
            return uPhoneDigits.length >= 10 && uPhoneDigits === targetPhoneDigits;
        });
        if (match) return match;
    }

    return null;
}

export interface PaymentFormProps {
    eftFunds: any[];
    users?: any[];
    tenantId: string;
    initialData?: {
        pledgeId?: string;
        pledgeFullName?: string;
        pledgeTargetAmount?: number;
        pledgeActualAmount?: number;
        pledgeTargetStudentCount?: number;
        newUserName?: string;
        newUserEmail?: string;
        newUserPhone?: string;
        amount?: number;
    };
    onSuccess?: () => void;
}

export function PaymentForm({ 
    eftFunds, 
    users = [], 
    tenantId,
    initialData,
    onSuccess 
}: PaymentFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Bağışçı modu: 'registered' (Kayıtlı bursveren) veya 'new' (Yeni gölge bağışçı)
    const [donorMode, setDonorMode] = useState<"registered" | "new">("registered");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            fundId: "",
            userId: undefined,
            newUserName: initialData?.newUserName || "",
            newUserEmail: initialData?.newUserEmail || "",
            newUserPhone: initialData?.newUserPhone || "",
            amount: initialData?.amount || 0,
            paymentDate: "", 
            studentCountTarget: 0,
            supporterType: "recurring",
            notes: "",
            pledgeId: initialData?.pledgeId,
        },
    });

    // Varsayılan bugünün tarihi
    useEffect(() => {
        form.setValue("paymentDate", new Date().toISOString().split("T")[0]);
    }, [form]);

    // Otomatik Eşleştirme (Smart Matching on Mount / Change)
    useEffect(() => {
        if (initialData?.newUserName || initialData?.newUserPhone || initialData?.newUserEmail) {
            const matched = findMatchingUser(
                users,
                initialData.newUserName,
                initialData.newUserPhone,
                initialData.newUserEmail
            );
            if (matched) {
                setSelectedUser(matched);
                form.setValue("userId", matched.id);
                form.setValue("newUserName", matched.fullName || initialData.newUserName || "");
                form.setValue("newUserEmail", matched.email || "");
                form.setValue("newUserPhone", matched.phoneNumber || matched.phone || initialData.newUserPhone || "");
                setDonorMode("registered");
            } else {
                setSelectedUser(null);
                form.setValue("userId", undefined);
                form.setValue("newUserName", initialData.newUserName || "");
                form.setValue("newUserEmail", initialData.newUserEmail || "");
                form.setValue("newUserPhone", initialData.newUserPhone || "");
            }
        }
    }, [initialData, users, form]);

    // Dışarı tıklandığında arama açılır kutusunu kapatma
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Arama filtreleme
    const filteredUsers = useMemo(() => {
        if (!userSearchTerm.trim()) {
            return users.slice(0, 15);
        }
        const q = turkishToLower(userSearchTerm.trim());
        const qDigits = userSearchTerm.replace(/\D/g, "");
        return users.filter(u => {
            const name = turkishToLower(u.fullName || "");
            const email = turkishToLower(u.email || "");
            const phone = (u.phoneNumber || u.phone || "").replace(/\D/g, "");
            return name.includes(q) || email.includes(q) || (qDigits.length >= 3 && phone.includes(qDigits));
        }).slice(0, 20);
    }, [users, userSearchTerm]);

    const handleSelectRegisteredUser = (user: any) => {
        setSelectedUser(user);
        form.setValue("userId", user.id, { shouldValidate: true });
        form.setValue("newUserName", user.fullName, { shouldValidate: true });
        form.setValue("newUserEmail", user.email || "", { shouldValidate: true });
        form.setValue("newUserPhone", user.phoneNumber || user.phone || "", { shouldValidate: true });
        setIsSearchOpen(false);
        setUserSearchTerm("");
    };

    const handleClearSelectedUser = () => {
        setSelectedUser(null);
        form.setValue("userId", undefined);
        form.setValue("newUserName", "");
        form.setValue("newUserEmail", "");
        form.setValue("newUserPhone", "");
        setUserSearchTerm("");
        setIsSearchOpen(true);
    };

    const handleSwitchToNewDonor = () => {
        setDonorMode("new");
        setSelectedUser(null);
        form.setValue("userId", undefined);
        // Taahhüt sahibinin adını hazır getir
        if (initialData?.newUserName) {
            form.setValue("newUserName", initialData.newUserName);
        }
        if (initialData?.newUserPhone) {
            form.setValue("newUserPhone", initialData.newUserPhone);
        }
    };

    const handleSwitchToRegistered = () => {
        setDonorMode("registered");
        // Eğer taahhüt sahibi kayıtlılar arasında varsa tekrar seçili getir
        if (initialData?.newUserName) {
            const matched = findMatchingUser(
                users,
                initialData.newUserName,
                initialData.newUserPhone,
                initialData.newUserEmail
            );
            if (matched) {
                handleSelectRegisteredUser(matched);
            }
        }
    };

    function onSubmit(values: z.infer<typeof paymentSchema>) {
        startTransition(async () => {
            try {
                // Seçilen moda göre payload hazırla
                const payload = {
                    ...values,
                    userId: donorMode === "registered" ? selectedUser?.id : undefined,
                    newUserName: donorMode === "registered" ? selectedUser?.fullName : values.newUserName,
                    newUserEmail: donorMode === "registered" ? (selectedUser?.email || "") : values.newUserEmail,
                    newUserPhone: donorMode === "registered" ? (selectedUser?.phoneNumber || selectedUser?.phone || "") : values.newUserPhone,
                };

                const result = await submitManualPayment(payload, tenantId);
                if (result.success) {
                    toast.success("Tahsilat başarıyla kaydedildi!");
                    form.reset({
                        ...values,
                        amount: 0,
                        studentCountTarget: 0,
                        notes: "",
                    });
                    router.refresh();
                    onSuccess?.();
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
                
                {/* 1. TAAHHÜT ÖZET KARTI (Varsa) */}
                {initialData?.pledgeId && (
                    <div className="bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                    İlgili Taahhüt Kaydı
                                </div>
                                <div className="text-base font-bold text-gray-900 dark:text-white">
                                    {initialData.pledgeFullName || initialData.newUserName}
                                </div>
                                {initialData.pledgeTargetStudentCount ? (
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Taahhüt: {initialData.pledgeTargetStudentCount} Öğrenci
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {initialData.pledgeTargetAmount !== undefined && (
                            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-blue-200/60">
                                <div className="text-xs text-gray-500">Hedeflenen Tutar</div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(initialData.pledgeTargetAmount)}
                                </div>
                                {initialData.pledgeActualAmount !== undefined && (
                                    <div className="text-[11px] text-gray-500">
                                        Tahsil Edilen: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(initialData.pledgeActualAmount)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. HEDEF FON SEÇİMİ */}
                <FormField
                    control={form.control}
                    name="fundId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Hedef Fon (Sadece EFT Fonları) *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
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

                {/* 3. BAĞIŞÇI BİLGİLERİ (Kayıtlı Seçim veya Yeni Giriş) */}
                <div className="bg-gray-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <FormLabel className="text-base font-semibold text-gray-900 dark:text-white">
                                Bağışçı / Ödeyen Kişi *
                            </FormLabel>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {donorMode === "registered" 
                                    ? "Sistemde kayıtlı bursverenler arasından arama yapabilir veya seçebilirsiniz."
                                    : "Listede olmayan yeni bir bağışçı için gölge hesap oluşturulur."}
                            </p>
                        </div>

                        {/* Mod Değiştirme Butonu */}
                        {donorMode === "registered" ? (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={handleSwitchToNewDonor}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 h-8 self-start sm:self-auto"
                            >
                                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                Listede Yok, Yeni Bağışçı Gir
                            </Button>
                        ) : (
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={handleSwitchToRegistered}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 h-8 self-start sm:self-auto"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                Kayıtlı Bursveren Seçimine Dön
                            </Button>
                        )}
                    </div>

                    {/* MOD 1: KAYITLI BURSVEREN SEÇİMİ */}
                    {donorMode === "registered" && (
                        <div>
                            {selectedUser ? (
                                /* SEÇİLMİŞ KULLANICI KARTI */
                                <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {selectedUser.fullName}
                                                </span>
                                                <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[10px]">
                                                    Kayıtlı Bursveren
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                                                {selectedUser.email ? (
                                                    <span className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-gray-400" />
                                                        {selectedUser.email}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600 text-[11px]">(E-posta kayıtlı değil)</span>
                                                )}
                                                {(selectedUser.phoneNumber || selectedUser.phone) && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3 text-gray-400" />
                                                        {selectedUser.phoneNumber || selectedUser.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleClearSelectedUser}
                                        className="h-8 text-xs font-medium self-end sm:self-auto"
                                    >
                                        Değiştir
                                    </Button>
                                </div>
                            ) : (
                                /* ARAMA VE SEÇİM KUTUSU */
                                <div className="relative" ref={searchRef}>
                                    <div className="relative">
                                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Bursveren ara (Ad Soyad, E-posta veya Telefon)..."
                                            className="pl-10 h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                                            value={userSearchTerm}
                                            onChange={(e) => {
                                                setUserSearchTerm(e.target.value);
                                                setIsSearchOpen(true);
                                            }}
                                            onFocus={() => setIsSearchOpen(true)}
                                        />
                                    </div>

                                    {/* Arama Sonuçları Açılır Listesi */}
                                    {isSearchOpen && (
                                        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                            {filteredUsers.length > 0 ? (
                                                <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                                    {filteredUsers.map((u) => (
                                                        <div
                                                            key={u.id}
                                                            onClick={() => handleSelectRegisteredUser(u)}
                                                            className="p-3 hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition-colors"
                                                        >
                                                            <div>
                                                                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                                                    {u.fullName}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 mt-0.5">
                                                                    {u.email && <span>{u.email}</span>}
                                                                    {u.email && (u.phoneNumber || u.phone) && <span>•</span>}
                                                                    {(u.phoneNumber || u.phone) && (
                                                                        <span>{u.phoneNumber || u.phone}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Check className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="p-6 text-center">
                                                    <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        Eşleşen bursveren bulunamadı
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 mb-3">
                                                        Bu kişi henüz sistemde kayıtlı değilse yeni bağışçı olarak ekleyebilirsiniz.
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            setIsSearchOpen(false);
                                                            handleSwitchToNewDonor();
                                                            if (userSearchTerm.trim()) {
                                                                form.setValue("newUserName", userSearchTerm.trim());
                                                            }
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5 mr-1" />
                                                        Yeni Bağışçı Girişine Geç
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!selectedUser && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1.5">
                                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                            Lütfen yukarıdaki arama kutusundan bir bursveren seçin veya "Yeni Bağışçı Gir" butonunu kullanın.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* MOD 2: YENİ / GÖLGE BAĞIŞÇI GİRİŞİ */}
                    {donorMode === "new" && (
                        <div className="space-y-4 pt-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="newUserName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-semibold">Ad Soyad *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <UserIcon className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                                    <Input 
                                                        placeholder="Ad Soyad" 
                                                        className="pl-9 h-11 bg-white dark:bg-zinc-900" 
                                                        {...field} 
                                                        value={field.value || ""} 
                                                    />
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
                                            <FormLabel className="text-xs font-semibold">E-posta *</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                                                    <Input 
                                                        type="email" 
                                                        placeholder="ornek@fbiadvakfi.org" 
                                                        className="pl-9 h-11 bg-white dark:bg-zinc-900" 
                                                        {...field} 
                                                        value={field.value || ""} 
                                                    />
                                                </div>
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
                                            <FormLabel className="text-xs font-semibold">Telefon</FormLabel>
                                            <FormControl>
                                                <div className="relative flex items-center">
                                                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 z-10" />
                                                    <PhoneInput 
                                                        placeholder="00 90 5XX XXX XX XX" 
                                                        className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-zinc-900 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 pl-9" 
                                                        value={field.value ?? ""} 
                                                        onChange={field.onChange} 
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                Not: Girilen e-posta sistemde kayıtlıysa ödeme doğrudan o hesaba işlenir. Kayıtlı değilse otomatik yeni bir gölge bursveren hesabı oluşturulur.
                            </p>
                        </div>
                    )}
                </div>

                {/* 4. TUTAR, TARİH VE DETAYLAR (1 SATIRA 2 ALAN) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Tutar (TL) *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input 
                                            type="number" 
                                            className="pl-11 h-12 text-lg font-bold bg-white dark:bg-zinc-900" 
                                            {...field} 
                                        />
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
                                <FormLabel className="font-semibold">Tahsilat Tarihi *</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="date" 
                                        className="h-12 bg-white dark:bg-zinc-900" 
                                        {...field} 
                                    />
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
                                <FormLabel className="font-semibold">Öğrenci Taahhüdü (Hedef)</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        min="0" 
                                        className="h-12 bg-white dark:bg-zinc-900" 
                                        {...field} 
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="supporterType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Destekçi Tipi *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
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

                {/* 5. BUTONLAR */}
                <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 flex justify-end gap-3">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.back()}
                        className="h-11 px-5"
                    >
                        İptal
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isPending || (donorMode === "registered" && !selectedUser)} 
                        className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md rounded-xl font-medium"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Tahsilatı Kaydet
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
