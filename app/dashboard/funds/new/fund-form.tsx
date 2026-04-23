"use client";

import { useTransition, useEffect } from "react";
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
    photoUrl: z.string().optional(),
});

export function FundForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<any>({
        resolver: zodResolver(fundSchema),
        defaultValues: {
            title: "",
            description: "",
            period: "",
            monthlyLimit: 0,
            photoUrl: "",
            startDate: "",
            endDate: "",
            durationMonths: "",
            targetStudentCount: 1,
        },
    });

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
                                <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="pl-4">
                                            <SelectValue placeholder="Dönem seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="2024-2025">2024-2025 Güz/Bahar</SelectItem>
                                        <SelectItem value="2025-2026">2025-2026 Güz/Bahar</SelectItem>
                                        <SelectItem value="2026-2027">2026-2027 Güz/Bahar</SelectItem>
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
                                        <Input type="number" placeholder="1500" className="pl-10" {...field} value={field.value ?? ""} />
                                    </div>
                                </FormControl>
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
                                        <Input type="number" placeholder="Örn: 2" className="pl-10" {...field} value={field.value ?? ""} />
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
                                        <Input type="date" className="pl-10" {...field} value={field.value ?? ""} />
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
                                <Select onValueChange={field.onChange} value={field.value || undefined} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="pl-4">
                                            <SelectValue placeholder="Süre seçiniz" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                            <SelectItem key={month} value={month.toString()}>{month} Ay</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        <Input type="date" className="pl-10 bg-gray-50 dark:bg-zinc-800 text-gray-500 cursor-not-allowed focus-visible:ring-0" readOnly tabIndex={-1} {...field} value={field.value ?? ""} />
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
                                            className="pl-10 pt-1.5"
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
                    <Button type="submit" disabled={isPending} className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors min-w-[200px]">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Fonu Oluştur ve Sisteme Ekle
                    </Button>
                </div>
            </form>
        </Form>
    );
}
