"use client";

import { useTransition, useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Calendar, TurkishLira, Image as ImageIcon, AlignLeft, Info, Users } from "lucide-react";

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
    durationMonths: z.string().min(1, "Lütfen süreyi seçiniz."),
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
    defaultFundAmount: number | null;
    defaultFundDuration: number | null;
};

export function FundForm({ seasons, isAdmin }: { seasons?: Season[], isAdmin?: boolean }) {
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
            durationMonths: "",
            targetStudentCount: 1,
        },
    });

    const period = form.watch("period");
    
    useEffect(() => {
        if (!period || period === "none") {
            setSeasonError("");
            return;
        }
        
        const selectedSeason = activeSeasons.find(s => s.id === period);
        if (selectedSeason) {
            // Check dates
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

            // Set defaults if available and user is not admin (or even if admin, set defaults)
            if (selectedSeason.defaultFundAmount) form.setValue("monthlyLimit", selectedSeason.defaultFundAmount);
            if (selectedSeason.defaultFundDuration) form.setValue("durationMonths", selectedSeason.defaultFundDuration.toString());
        }
    }, [period, activeSeasons, form]);

    const startDate = form.watch("startDate");
    const durationMonths = form.watch("durationMonths");

    useEffect(() => {
        if (startDate && durationMonths) {
            const date = new Date(startDate);
            const months = parseInt(durationMonths);
            if (!isNaN(months)) {
                date.setMonth(date.getMonth() + months);
                form.setValue("endDate", date.toISOString().split("T")[0]);
            }
        }
    }, [startDate, durationMonths, form]);

    function onSubmit(values: z.infer<typeof fundSchema>) {
        startTransition(async () => {
            try {
                const parsedValues = {
                    ...values,
                    startDate: new Date(values.startDate),
                    endDate: new Date(values.endDate),
                    durationMonths: parseInt(values.durationMonths),
                    targetStudentCount: values.targetStudentCount,
                    paymentMethod: values.paymentMethod,
                };

                const result = await createFund(parsedValues as any);

                if (result.success) {
                    toast.success("Fon başarıyla oluşturuldu!");
                    router.push(`/dashboard/funds`);
                    router.refresh(); // Go back to cards and refresh
                }
            } catch (error: any) {
                toast.error(error.message || "Fon oluşturulurken bir hata meydana geldi.");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                {seasonError && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
                        {seasonError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Fon Adı *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Info className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input placeholder="Örn: 2025 Yılı Gelişim Burs Paketi" className="pl-10" {...field} value={field.value ?? ""} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="period"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fon Dönemi *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-12 bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500">
                                            <SelectValue placeholder="Bir eğitim dönemi seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">Sezon Bağımsız / Özel</SelectItem>
                                        {activeSeasons.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.period}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="monthlyLimit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Aylık Taahhüt Tutarı (₺)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <TurkishLira className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input 
                                            type="number" 
                                            placeholder="1500" 
                                            className="h-12 bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500 pl-10" 
                                            readOnly={!isAdmin && period !== "none" && activeSeasons.find(s => s.id === period)?.defaultFundAmount != null}
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
                        name="paymentMethod"
                        render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Ödeme Şekli *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="pl-4 h-12">
                                            <SelectValue placeholder="Ödeme şekli seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="upfront">Kredi Kartı ile Tek Seferde Peşin (Tüm Dönem)</SelectItem>
                                        <SelectItem value="monthly">Aylık Kredi Kartı Provizyonu (Taksit Taksit)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="targetStudentCount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Öğrenci Sayısı (Kapasite) *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input type="number" placeholder="Örn: 2" className="pl-10 h-12" {...field} value={field.value ?? ""} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Başlangıç Tarihi *</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input 
                                            type="date" 
                                            className="pl-10 h-12 bg-gray-50 border-gray-200"
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
                        name="durationMonths"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Fon Süresi (Ay) *</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="h-12 bg-gray-50 border-gray-200 focus:ring-blue-500 focus:border-blue-500"
                                        {...field}
                                        readOnly={!isAdmin && period !== "none" && activeSeasons.find(s => s.id === period)?.defaultFundDuration != null}
                                    />
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
                                <FormLabel>Bitiş Tarihi (Otomatik Hesaplanır)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input type="date" className="pl-10 h-12 bg-gray-50 cursor-not-allowed" readOnly tabIndex={-1} {...field} value={field.value ?? ""} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="photoUrl"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem className="col-span-1 md:col-span-2">
                                <FormLabel>Fon Görseli / Kapak Fotoğrafı</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <ImageIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            className="pl-10 pt-2.5 h-12"
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
                                            placeholder="Bu fonun sağladığı avantajlar, vizyonu veya ne kadarlık ortak / öğrenci bütçelendiği gibi detaylar..."
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
