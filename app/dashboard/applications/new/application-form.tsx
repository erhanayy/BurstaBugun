"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

import { submitApplication } from "@/lib/actions/application";

const formSchema = z.object({
    fundId: z.string().min(1, "Lütfen başvuru yapacağınız fonu seçin."),
    tckn: z.string().length(11, "TCKN 11 haneli olmalıdır."),
    schoolName: z.string().min(3, "Okul adı zorunludur."),
    programName: z.string().min(3, "Bölüm adı zorunludur."),
    gpa: z.string().min(1, "Not ortalaması zorunludur (örn: 3.50)."),
    familyIncome: z.string().min(1, "Aylık hane halkı geliri zorunludur."),
    motivationLetter: z.string().min(20, "Lütfen kendinizi ve neden bu bursa başvurduğunuzu detaylıca anlatın."),
});

export function ApplicationForm({ funds }: { funds: any[] }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fundId: "",
            tckn: "",
            schoolName: "",
            programName: "",
            gpa: "",
            familyIncome: "",
            motivationLetter: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            try {
                await submitApplication(values);
                toast.success("Başvurunuz başarıyla alındı!");
            } catch (error: any) {
                toast.error(error.message || "Başvuru sırasında bir hata oluştu.");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">

                <FormField
                    control={form.control}
                    name="fundId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Başvuru Yapılacak Fon *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Burs fonu seçiniz..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {funds.map((f) => (
                                        <SelectItem key={f.id} value={f.id}>
                                            {f.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="tckn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>TC Kimlik No *</FormLabel>
                                <FormControl>
                                    <Input placeholder="11 haneli kimlik numaranız" maxLength={11} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="familyIncome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Aylık Hane Halkı Geliri (₺) *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: 25000" type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="schoolName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Okul / Üniversite Adı *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Boğaziçi Üniversitesi" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="programName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bölüm / Program Adı *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: Bilgisayar Mühendisliği" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="gpa"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Not Ortalaması *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Örn: 3.50" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="motivationLetter"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motivasyon Mektubu *</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Neden bu bursa başvuruyorsunuz? Gelecek hedefleriniz nelerdir?"
                                    className="min-h-[150px] resize-y"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
                    <Button type="submit" disabled={isPending} className="w-full md:w-auto px-8">
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Başvuruyu Tamamla
                    </Button>
                </div>
            </form>
        </Form>
    );
}
