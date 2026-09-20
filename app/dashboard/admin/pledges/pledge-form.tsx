"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, User, Phone, Mail } from "lucide-react";

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

import { createPledge } from "@/lib/actions/admin-pledges";

const pledgeSchema = z.object({
    fullName: z.string().min(2, "Lütfen ad soyad giriniz."),
    email: z.string().email("Geçerli bir e-posta giriniz.").optional().or(z.literal("")),
    phone: z.string().optional(),
    targetStudentCount: z.coerce.number().min(1, "En az 1 öğrenci taahhüt edilmelidir."),
});

export function PledgeForm({ periodId, onSuccess }: { periodId: string; onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();
    const form = useForm<z.infer<typeof pledgeSchema>>({
        resolver: zodResolver(pledgeSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            targetStudentCount: 1,
        },
    });

    function onSubmit(values: z.infer<typeof pledgeSchema>) {
        startTransition(async () => {
            try {
                const result = await createPledge({
                    ...values,
                    periodId
                });
                
                if (result.success) {
                    toast.success("Taahhüt başarıyla oluşturuldu.");
                    form.reset();
                    onSuccess();
                }
            } catch (error: any) {
                toast.error(error.message || "Bir hata oluştu.");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ad Soyad *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input placeholder="Bağışçı Adı Soyadı" className="pl-9" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-posta</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input type="email" placeholder="E-posta adresi (Opsiyonel)" className="pl-9" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefon</FormLabel>
                                <FormControl>
                                    <div className="relative flex items-center">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                                        <PhoneInput placeholder="00 90 5XX XXX XX XX" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9" value={field.value ?? ""} onChange={field.onChange} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="targetStudentCount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Taahhüt Edilen Öğrenci Adedi *</FormLabel>
                            <FormControl>
                                <Input type="number" min="1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                        Kaydet
                    </Button>
                </div>
            </form>
        </Form>
    );
}
