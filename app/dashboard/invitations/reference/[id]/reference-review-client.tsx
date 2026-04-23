"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle, ShieldAlert, XCircle, FileText, UserCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { processReferenceApproval } from "@/lib/actions/reference";

export default function ReferenceReviewClient({ reference }: { reference: any }) {
    const router = useRouter();
    const app = reference.application;
    const answers = app.answersJson ? JSON.parse(app.answersJson) : {};
    const steps = app.form?.steps || [];

    const isMuhtar = reference.title === 'muhtar';

    // Sorular
    const [q1, setQ1] = useState<"yes" | "no" | null>(null);
    const [q2, setQ2] = useState<"yes" | "no" | null>(null);
    const [q3, setQ3] = useState<"yes" | "no" | null>(null);
    const [q4, setQ4] = useState<"yes" | "no" | null>(null);
    const [q5, setQ5] = useState<"yes" | "no" | null>(null);

    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionType, setActionType] = useState<"approved" | "rejected" | null>(null);

    const allYes = q1 === "yes" && q2 === "yes" && q3 === "yes" && q4 === "yes" && q5 === "yes";

    const handleApprove = async () => {
        if (!allYes) {
            toast.error("Öğrenciye onay verebilmek için tüm sorulara EVET demelisiniz.");
            return;
        }

        setIsSubmitting(true);
        setActionType("approved");

        try {
            const data = JSON.stringify({ q1, q2, q3, q4, q5, note: comment });
            const res = await processReferenceApproval(reference.id, "approved", data);

            if (res.success) {
                toast.success("Başvuru tarafınızca başarıyla onaylandı.");
                router.push("/dashboard/invitations");
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!comment.trim() || comment.length < 10) {
            toast.error("Lütfen reddetme sebebini detaylıca belirtin (En az 10 karakter).");
            return;
        }

        setIsSubmitting(true);
        setActionType("rejected");

        try {
            const data = JSON.stringify({ q1, q2, q3, q4, q5, note: comment });
            const res = await processReferenceApproval(reference.id, "rejected", data);

            if (res.success) {
                toast.success("Başvuru reddedildi ve yetkililere bildirildi.");
                router.push("/dashboard/invitations");
                router.refresh();
            }
        } catch (err: any) {
            toast.error(err.message || "Bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (reference.status !== 'pending') {
        return (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800">
                    <CheckCircle className={`w-8 h-8 ${reference.status === 'approved' ? 'text-emerald-500' : 'text-red-500'}`} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bu başvuru onay sürecini tamamladınız.</h2>
                <p className="text-gray-500">Değerlendirme sonucunuz sisteme işlenmiştir.</p>
                <Link href="/dashboard/invitations" className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                    Geri Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <Link href="/dashboard/invitations" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Davetlere Dön
            </Link>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                        <UserCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Öğrenci Referans İncelemesi
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Öğrenci: <strong className="text-gray-800 dark:text-gray-200">{app.user?.fullName}</strong> ({isMuhtar ? 'Mahalle Muhtarı Onayı' : 'Akademisyen Onayı'})
                        </p>
                    </div>
                </div>

                <div className="mb-10">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40 rounded-xl p-5 flex items-start gap-3 mb-6">
                        <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200/90 leading-relaxed">
                            <strong className="block mb-1 font-semibold text-blue-900 dark:text-blue-100">Dikkat</strong>
                            Lütfen öğrencinin beyan ettiği bilgileri dikkatlice inceleyin. İncelemenizi tamamladıktan sonra, sayfanın en altındaki yeminli onay sorularını yanıtlayarak değerlendirmenizi tamamlayın.
                        </div>
                    </div>

                    {/* Salt Okunur Form Alanları */}
                    <div className="space-y-8 bg-gray-50 dark:bg-zinc-950 p-6 rounded-xl border border-gray-100 dark:border-zinc-800">
                        <h3 className="font-bold text-lg border-b border-gray-200 dark:border-zinc-800 pb-3">{app.form?.title} Girişleri</h3>
                        {steps.map((step: any, sIdx: number) => (
                            <div key={step.id || sIdx} className="space-y-4">
                                <h4 className="font-semibold text-gray-700 dark:text-gray-300">{step.title}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                    {step.fields.map((field: any, fIdx: number) => {
                                        const val = answers[field.name];
                                        return (
                                            <div key={fIdx} className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                                                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1 block">{field.name}</span>
                                                {field.type === 'file' ? (
                                                    val ? (
                                                        <a href={val} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium break-all text-sm">
                                                            <FileText className="w-4 h-4" /> Dosyayı Aç
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-sm">Yüklenmedi</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                                                        {val || <span className="text-gray-400 italic">Belirtilmedi</span>}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Onay Formu */}
                <div className="border-t-2 border-gray-100 dark:border-zinc-800 pt-8 mt-8">
                    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-l-4 border-emerald-500 pl-3">Değerlendirme Soruları</h2>

                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl gap-4">
                            <span className="font-medium text-gray-800 dark:text-gray-200">1. Öğrenciyi ve/veya ailesini şahsen tanıyorum.</span>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q1" value="yes" checked={q1 === "yes"} onChange={() => setQ1("yes")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Evet</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q1" value="no" checked={q1 === "no"} onChange={() => setQ1("no")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Hayır</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl gap-4">
                            <span className="font-medium text-gray-800 dark:text-gray-200">2. {isMuhtar ? "Öğrenci resmi olarak benim mahallemde ikamet etmektedir." : "Öğrenci aktif olarak benim okulumda/fakültemde okumaktadır."}</span>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q2" value="yes" checked={q2 === "yes"} onChange={() => setQ2("yes")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Evet</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q2" value="no" checked={q2 === "no"} onChange={() => setQ2("no")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Hayır</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl gap-4">
                            <span className="font-medium text-gray-800 dark:text-gray-200">3. Öğrencinin formda beyan ettiği bilgilerin doğruluğunu onaylıyorum.</span>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q3" value="yes" checked={q3 === "yes"} onChange={() => setQ3("yes")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Evet</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q3" value="no" checked={q3 === "no"} onChange={() => setQ3("no")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Hayır</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl gap-4">
                            <span className="font-medium text-gray-800 dark:text-gray-200">4. Öğrencinin mali durumu sebebiyle bu bursa ihtiyacı olduğunu onaylıyorum.</span>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q4" value="yes" checked={q4 === "yes"} onChange={() => setQ4("yes")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Evet</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q4" value="no" checked={q4 === "no"} onChange={() => setQ4("no")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Hayır</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl gap-4">
                            <span className="font-medium text-gray-800 dark:text-gray-200">5. Bursiyerlerin adil seçimini etkileyeceğini bilerek verdiğim bu bilgilerin doğru olduğunu kabul ediyor ve onaylıyorum.</span>
                            <div className="flex items-center gap-6">
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q5" value="yes" checked={q5 === "yes"} onChange={() => setQ5("yes")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Evet</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer font-medium">
                                    <input type="radio" name="q5" value="no" checked={q5 === "no"} onChange={() => setQ5("no")} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                                    <span>Hayır</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2 mt-4 relative">
                            <label className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                Eklemek İstediğiniz Not (Red veriyorsanız zorunludur)
                            </label>
                            <Textarea
                                placeholder="Açıklama veya reddetme sebebi girebilirsiniz..."
                                className="min-h-[100px]"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4 justify-end">
                        <Button
                            variant="destructive"
                            size="lg"
                            className="w-full sm:w-auto"
                            disabled={isSubmitting}
                            onClick={handleReject}
                        >
                            {isSubmitting && actionType === 'rejected' ? 'İşleniyor...' : <><XCircle className="w-5 h-5 mr-2" /> Başvuruyu Reddet</>}
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                            disabled={isSubmitting || !allYes}
                            onClick={handleApprove}
                        >
                            {isSubmitting && actionType === 'approved' ? 'İşleniyor...' : <><CheckCircle className="w-5 h-5 mr-2" /> Öğrenciyi Onayla ve Referans Ol</>}
                        </Button>
                    </div>

                    {!allYes && (
                        <p className="text-xs text-center text-gray-500 mt-4">
                            * Onay butonunun aktif olması için yukarıdaki 5 soruya da "Evet" cevabı vermelisiniz. Eğer bilgiler uyuşmuyorsa, gerekli notu düşerek başvuruyu reddedebilirsiniz.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
