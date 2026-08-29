"use client";

import { useTransition, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Loader2, Plus, Calendar, Image as ImageIcon, AlignLeft, Info, Users, CreditCard, Clock } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createFund } from "@/lib/actions/funds";

const fundSchema = z.object({
    title: z.string().min(5, "Lütfen fon adını giriniz."),
    description: z.string().min(10, "Lütfen fon amacını veya detaylarını giriniz."),
    period: z.string().min(1, "Lütfen bir eğitim/fon dönemi seçiniz."),
    startDate: z.string().min(1, "Lütfen başlama tarihini seçiniz."),
    endDate: z.string().min(1, "Lütfen bitiş tarihini seçiniz."),
    durationMonths: z.coerce.number().min(1, "Lütfen süreyi giriniz."),
    targetStudentCount: z.coerce.number().min(1, "Lütfen hedef kapasite giriniz.").default(1),
    monthlyLimit: z.coerce.number().min(0).optional().default(0),
    paymentMethod: z.string().min(1, "Ödeme şekli seçiniz.").default('monthly'),
    photoUrl: z.string().optional(),
});

type Season = {
    id: string;
    period: string;
    isActive: boolean;
    appStartDate: Date | null;
    appEndDate: Date | null;
    fundStartDate: Date | null;
    fundEndDate: Date | null;
    sponsorPaymentStartDate: Date | null;
    sponsorPaymentEndDate: Date | null;
    studentPaymentStartDate: Date | null;
    studentPaymentEndDate: Date | null;
    seasonStartDate: Date | null;
    seasonEndDate: Date | null;
    defaultFundAmount: number | null;
    defaultFundDuration: number | null;
};

export function FundForm({ seasons, isAdmin, onSuccessRedirect }: { seasons?: Season[], isAdmin?: boolean, onSuccessRedirect?: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [seasonError, setSeasonError] = useState("");
    
    // Aktif sezonları filtreleyelim
    const activeSeasons = useMemo(() => seasons?.filter(s => s.isActive) || [], [seasons]);

    const form = useForm<any>({
        resolver: zodResolver(fundSchema),
        defaultValues: {
            title: "",
            description: "",
            period: "",
            monthlyLimit: 0,
            paymentMethod: "monthly",
            photoUrl: "",
            startDate: "",
            endDate: "",
            durationMonths: 1,
            targetStudentCount: 1,
        },
    });

    const period = form.watch("period");
    const selectedSeason = useMemo(() => activeSeasons.find(s => s.id === period), [period, activeSeasons]);
    
    useEffect(() => {
        if (!period || period === "none") {
            setSeasonError("");
            return;
        }
        
        if (selectedSeason) {
            // Check dates for fund creation
            const now = new Date();
            if (selectedSeason.fundStartDate && selectedSeason.fundEndDate) {
                const sDate = new Date(selectedSeason.fundStartDate);
                const eDate = new Date(selectedSeason.fundEndDate);
                if (now < sDate || now > eDate) {
                    setSeasonError("Seçilen sezon için fon oluşturma süresi dolmuştur veya henüz başlamamıştır.");
                } else {
                    setSeasonError("");
                }
            } else {
                setSeasonError("");
            }

            // Set defaults and calculate dates based on the season
            if (selectedSeason.defaultFundAmount) {
                form.setValue("monthlyLimit", selectedSeason.defaultFundAmount);
            }
            if (selectedSeason.defaultFundDuration) {
                form.setValue("durationMonths", selectedSeason.defaultFundDuration);
            }
            
            // Set Sponsor Payment Dates (Credit Card Charge Dates)
            if (selectedSeason.sponsorPaymentStartDate) {
                const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                const localStart = (new Date(new Date(selectedSeason.sponsorPaymentStartDate).getTime() - tzOffset)).toISOString().split("T")[0];
                form.setValue("startDate", localStart);
            } else if (selectedSeason.fundStartDate) {
                // Fallback to fund start date if sponsor payment is missing
                const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                const localStart = (new Date(new Date(selectedSeason.fundStartDate).getTime() - tzOffset)).toISOString().split("T")[0];
                form.setValue("startDate", localStart);
            }

            if (selectedSeason.sponsorPaymentEndDate) {
                const tzOffset = (new Date()).getTimezoneOffset() * 60000;
                const localEnd = (new Date(new Date(selectedSeason.sponsorPaymentEndDate).getTime() - tzOffset)).toISOString().split("T")[0];
                form.setValue("endDate", localEnd);
            }
        }
    }, [period, selectedSeason, form]);

    function onSubmit(values: z.infer<typeof fundSchema>) {
        startTransition(async () => {
            try {
                const parsedValues = {
                    ...values,
                    startDate: new Date(values.startDate),
                    endDate: new Date(values.endDate),
                    durationMonths: Number(values.durationMonths),
                    targetStudentCount: Number(values.targetStudentCount),
                    paymentMethod: values.paymentMethod,
                };

                const result = await createFund(parsedValues as any);

                if (result.success) {
                    toast.success("Fon başarıyla oluşturuldu!");
                    if (onSuccessRedirect) {
                        router.push(onSuccessRedirect.replace('{fundId}', result.fundId));
                    } else {
                        router.push(`/dashboard/funds`);
                    }
                    router.refresh();
                }
            } catch (error: any) {
                toast.error(error.message || "Fon oluşturulurken bir hata meydana geldi.");
            }
        });
    }

    const formatDate = (date: Date | null) => {
        if (!date) return "-";
        return format(new Date(date), "dd.MM.yyyy");
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {seasonError && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium flex items-center gap-2">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        {seasonError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FON ADI */}
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Fon Adı *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Info className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input placeholder="Örn: 2025 Yılı Gelişim Burs Paketi" className="pl-10 h-12" {...field} value={field.value ?? ""} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* FON DÖNEMİ */}
                    <FormField
                        control={form.control}
                        name="period"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Fon Dönemi *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500">
                                            <SelectValue placeholder="Bir eğitim dönemi seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {activeSeasons.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.period}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* DÖNEM BİLGİLERİ GÖSTERİMİ (READ-ONLY) */}
                    {selectedSeason && (
                        <div className="col-span-1 md:col-span-2 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/40 p-5 rounded-2xl space-y-4">
                            <h3 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Seçilen Dönem Özeti ({selectedSeason.period})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Genel Dönem</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedSeason.seasonStartDate)} - {formatDate(selectedSeason.seasonEndDate)}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Öğrenci Başvurusu</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedSeason.appStartDate)} - {formatDate(selectedSeason.appEndDate)}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Fon Yaratma (Açık)</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedSeason.fundStartDate)} - {formatDate(selectedSeason.fundEndDate)}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Öğrenci Ödemeleri</span>
                                    <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(selectedSeason.studentPaymentStartDate)} - {formatDate(selectedSeason.studentPaymentEndDate)}</span>
                                </div>
                            </div>
                            <div className="pt-3 border-t border-blue-200/50 dark:border-blue-800/50 flex gap-6">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Standart Tutar</span>
                                    <span className="font-bold text-green-700 dark:text-green-400">{selectedSeason.defaultFundAmount || 0} ₺ / Ay</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Standart Süre</span>
                                    <span className="font-bold text-blue-700 dark:text-blue-400">{selectedSeason.defaultFundDuration || 0} Ay</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* GİZLİ ALANLAR (Form Submission İçin) */}
                    <input type="hidden" {...form.register("monthlyLimit")} />
                    <input type="hidden" {...form.register("durationMonths")} />

                    {/* DEĞİŞTİRİLEBİLİR ALANLAR */}
                    <FormField
                        control={form.control}
                        name="targetStudentCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Öğrenci Sayısı (Kapasite) *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input type="number" placeholder="Örn: 2" className="pl-10 h-12" {...field} value={field.value ?? ""} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ödeme Şekli *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="pl-4 h-12">
                                            <SelectValue placeholder="Ödeme şekli seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="upfront">Peşin</SelectItem>
                                        <SelectItem value="monthly">Taksitli</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* KREDİ KARTI ÇEKİM TARİHLERİ (OTOMATİK/READ-ONLY) */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-zinc-800/30 p-5 rounded-2xl border border-gray-100 dark:border-zinc-800">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-sm font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <CreditCard className="w-4 h-4" />
                                Kredi Kartından Çekim Başlangıç Bitiş Tarihleri
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">Bu tarihler seçilen fon döneminin "Bursveren Ödeme Dönemi" parametrelerine göre otomatik belirlenmektedir.</p>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-500">Başlangıç Tarihi</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input 
                                                type="date" 
                                                className="pl-10 h-12 bg-gray-100 text-gray-600 dark:bg-zinc-900 dark:text-gray-400 cursor-not-allowed border-dashed border-gray-300"
                                                readOnly
                                                tabIndex={-1}
                                                {...field} 
                                                value={field.value ?? ""} 
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-500">Bitiş Tarihi</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                            <Input 
                                                type="date" 
                                                className="pl-10 h-12 bg-gray-100 text-gray-600 dark:bg-zinc-900 dark:text-gray-400 cursor-not-allowed border-dashed border-gray-300" 
                                                readOnly 
                                                tabIndex={-1} 
                                                {...field} 
                                                value={field.value ?? ""} 
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* GÖRSEL VE AMAÇ */}
                    <FormField
                        control={form.control}
                        name="photoUrl"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Fon Görseli / Kapak Fotoğrafı</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="pl-10 pt-3 h-12"
                                            {...fieldProps}
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const loadingToast = toast.loading("Fotoğraf yükleniyor...");
                                                    const formData = new FormData();
                                                    formData.append("file", file);

                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            body: formData
                                                        });
                                                        const data = await res.json();

                                                        toast.dismiss(loadingToast);

                                                        if (data.url) {
                                                            onChange(data.url);
                                                            toast.success("Fotoğraf başarıyla eklendi.");
                                                        } else {
                                                            onChange("");
                                                            toast.error(data.error || "Yükleme başarısız.");
                                                        }
                                                    } catch (error) {
                                                        toast.dismiss(loadingToast);
                                                        toast.error("Dosya yüklenemedi.");
                                                        onChange("");
                                                    }
                                                } else {
                                                    onChange("");
                                                }
                                            }}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Fon Amacı ve Detayları *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <AlignLeft className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Textarea
                                            placeholder="Bu fonun sağladığı avantajlar, vizyonu veya detayları..."
                                            className="pl-10 h-32 resize-none"
                                            {...field}
                                            value={field.value ?? ""}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        İptal
                    </Button>
                    <Button type="submit" disabled={isPending || !!seasonError} className="h-12 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all rounded-xl">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Fonu Oluştur ve Sisteme Ekle
                    </Button>
                </div>
            </form>
        </Form>
    );
}
