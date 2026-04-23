"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { sendFundInvitation } from "@/lib/actions/invitations";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { User, Loader2, Send } from "lucide-react";

const inviteSchema = z.object({
    inviteeName: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    inviteeEmail: z.string().email("Geçerli bir e-posta adresi girin"),
    inviteePhone: z.string().optional(),
});

export function InviteDialog({ fundId }: { fundId: string }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof inviteSchema>>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            inviteeName: "",
            inviteeEmail: "",
            inviteePhone: "",
        },
    });

    async function onSubmit(values: z.infer<typeof inviteSchema>) {
        setIsLoading(true);
        try {
            const res = await sendFundInvitation({
                fundId,
                inviteeName: values.inviteeName,
                inviteeEmail: values.inviteeEmail,
                inviteePhone: values.inviteePhone || "",
            });

            if (res.success) {
                toast.success(`${values.inviteeName} başarıyla davet edildi!`);
                form.reset({
                    inviteeName: "",
                    inviteeEmail: "",
                    inviteePhone: "",
                });
                // Keep the dialog open for back-to-back invitations
            }
        } catch (error: any) {
            toast.error(error.message || "Davetiye gönderilirken bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    }

    // Handles native Dialog state resetting on close
    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="font-semibold shadow-sm sm:w-auto w-full">
                    <User className="w-4 h-4 mr-2" />
                    Yeni Davetiye Gönder
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[calc(100%-32px)] rounded-xl sm:rounded-2xl border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-indigo-900 dark:text-indigo-400">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full hidden sm:block">
                            <Send className="w-5 h-5" />
                        </div>
                        Davetiye Oluştur
                    </DialogTitle>
                    <DialogDescription className="text-sm mt-2 text-gray-500">
                        Davet ettiğiniz kişi mailindeki bağlantıya tıkladığında otomatik olarak bu fonla eşleşecektir. Peş peşe birden fazla davet gönderebilirsiniz.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="inviteeName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700 dark:text-gray-300">Ad Soyad <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Örn: Ayşe Yılmaz" className="h-12 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 placeholder:text-gray-400" value={field.value ?? ""} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="inviteeEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700 dark:text-gray-300">E-posta <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="ornek@mail.com" className="h-12 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 placeholder:text-gray-400" value={field.value ?? ""} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="inviteePhone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold text-gray-700 dark:text-gray-300">Telefon <span className="text-gray-400 font-normal text-xs">(İsteğe bağlı)</span></FormLabel>
                                        <FormControl>
                                            <PhoneInput className="flex h-12 w-full rounded-md border bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 px-3 py-2 text-sm placeholder:text-gray-400" value={field.value ?? ""} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="w-full sm:w-1/3 h-12 order-2 sm:order-1 font-semibold text-gray-600 dark:text-gray-300 border-gray-200 dark:border-zinc-800"
                            >
                                Kapat
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-2/3 h-12 order-1 sm:order-2 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                            >
                                {isLoading ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Kaydediliyor...</>
                                ) : (
                                    <><Send className="w-5 h-5 mr-2" /> Kaydet ve Gönder</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
