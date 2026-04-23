"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, Trash2, CheckCircle2, Clock, XCircle, Send, ArrowLeft, ShieldAlert, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { addReference, deleteReference, resendReferenceRequest } from "@/lib/actions/reference";

export default function ReferencesClient({ application }: { application: any }) {
    const references = application.references || [];

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    const hasMuhtar = references.some((r: any) => r.title === 'muhtar');
    const hasTeacher = references.some((r: any) => r.title === 'teacher');

    // Default to the first available role
    const [title, setTitle] = useState<"muhtar" | "teacher">(!hasMuhtar ? "muhtar" : "teacher");

    const isFull = hasMuhtar && hasTeacher;

    // Onaylananlar
    const approvedMuhtar = references.some((r: any) => r.title === 'muhtar' && r.status === 'approved');
    const approvedTeacher = references.some((r: any) => r.title === 'teacher' && r.status === 'approved');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !fullName || !title) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }

        setIsSubmitting(true);
        try {
            await addReference(application.id, email, fullName, title as any);
            toast.success("Referans isteği başarıyla e-posta ile iletildi.");
            setFullName("");
            setEmail("");
            // Update the title selection to opposite role automatically
            setTitle(title === "muhtar" ? "teacher" : "muhtar");
        } catch (err: any) {
            toast.error(err.message || "Bir hata oluştu.");
        }
        setIsSubmitting(false);
    };

    const handleDelete = async (refId: string) => {
        if (!confirm("Bu referansı kaldırmak istediğinize emin misiniz?")) return;

        setIsSubmitting(true);
        try {
            const res = await deleteReference(refId, application.id);
            if (res.success) {
                toast.success("Referans kaldırıldı.");
            }
        } catch (err: any) {
            toast.error(err.message || "Silinemedi.");
        }
        setIsSubmitting(false);
    };

    const handleResend = async (refId: string) => {
        if (!confirm("Hatırlatma/Tekrar inceleme isteği göndermek istediğinize emin misiniz?")) return;

        setIsSubmitting(true);
        try {
            const res = await resendReferenceRequest(refId, application.id);
            if (res.success) {
                toast.success("Referans daveti yenilendi ve durum Bekliyor'a çekildi.");
            }
        } catch (err: any) {
            toast.error(err.message || "İşlem başarısız.");
        }
        setIsSubmitting(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı</span>;
            case 'rejected': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3.5 h-3.5" /> Reddedildi</span>;
            default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> Bekliyor</span>;
        }
    };

    const getTitleTranslation = (t: string) => {
        switch (t) {
            case 'muhtar': return 'Mahalle Muhtarı';
            case 'teacher': return 'Üniversite Hocası / Akademisyen';
            default: return 'Diğer';
        }
    };

    return (
        <div className="space-y-6">
            <Link href="/dashboard/applications" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Başvurularıma Dön
            </Link>

            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Referans Yönetimi</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Başvurunuzun değerlendirme havuzuna düşmesi için zorunlu referansların sisteme kaydedilmesi ve onaylarının alınması gerekmektedir.
                </p>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 rounded-xl p-5 mb-8 flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200/90 leading-relaxed">
                        <strong className="block mb-1 font-semibold text-yellow-900 dark:text-yellow-100">Önemli Hatırlatma</strong>
                        <p>Sistemin güvenliği ve şeffaflığı gereğince referans tercihleriniz şu kurallara tabidir:</p>
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                            <li><strong>Mahalle Muhtarı:</strong> İkametgahınızın bulunduğu mahallenin aktif ve resmi kayıtlı muhtarı olmalıdır.</li>
                            <li><strong>Akademisyen:</strong> İlgili dönemde eğitim aldığınız üniversite ve fakültenin bağlı öğretim üyesi olmalıdır.</li>
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-xl border ${hasMuhtar ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'} flex justify-between items-center`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${hasMuhtar ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">Muhtar Referansı</p>
                                <p className="text-xs text-gray-500">{hasMuhtar ? (approvedMuhtar ? 'Onay Alındı' : 'Bekliyor') : 'Eksik, hemen ekleyin.'}</p>
                            </div>
                        </div>
                        {hasMuhtar && approvedMuhtar && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    </div>

                    <div className={`p-4 rounded-xl border ${hasTeacher ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30' : 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'} flex justify-between items-center`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${hasTeacher ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm">Akademisyen Referansı</p>
                                <p className="text-xs text-gray-500">{hasTeacher ? (approvedTeacher ? 'Onay Alındı' : 'Bekliyor') : 'Eksik, hemen ekleyin.'}</p>
                            </div>
                        </div>
                        {hasTeacher && approvedTeacher && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Gerçekleşen Referans İstekleri</h3>
                <div className="space-y-4 mb-8">
                    {references.length === 0 ? (
                        <div className="py-8 text-center bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                            <p className="text-gray-500 text-sm">Henüz hiçbir referans talebi oluşturmadınız.</p>
                        </div>
                    ) : (
                        references.map((r: any) => (
                            <div key={r.id} className="flex flex-col p-4 bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-zinc-800 rounded-xl gap-4">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold">
                                            {r.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{r.fullName}</h4>
                                            <p className="text-xs text-gray-500">{r.email} • {getTitleTranslation(r.title)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        {getStatusBadge(r.status)}
                                        {r.status === 'pending' && (
                                            <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} disabled={isSubmitting} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 shrink-0 ml-auto sm:ml-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                        {r.status === 'rejected' && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => handleResend(r.id)} disabled={isSubmitting} className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 shrink-0 ml-auto sm:ml-0">
                                                    <RefreshCcw className="w-4 h-4 mr-1" /> Hatırlat / Yeniden Gönder
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} disabled={isSubmitting} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 shrink-0">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {r.status === 'rejected' && r.comment && (
                                    <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-800 dark:text-red-300 w-full border border-red-100 dark:border-red-900/30">
                                        <strong className="block mb-1">Red Sebebi / Notu:</strong>
                                        {(() => {
                                            try {
                                                const parse = JSON.parse(r.comment);
                                                return parse.note || r.comment;
                                            } catch (e) {
                                                return r.comment;
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {!isFull ? (
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
                        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-600" />
                            Yeni Referans İsteği Gönder
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            Eklediğiniz kişiye, onu referans sistemine davet eden bir e-posta iletilecektir. Maksimum 2 kişi (1 Muhtar, 1 Akademisyen) ekleyebilirsiniz.
                        </p>

                        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Referansın Tam Adı</label>
                                <Input placeholder="Örn: Ahmet Yılmaz" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">E-Posta Adresi</label>
                                <Input type="email" placeholder="ornek@mail.com" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unvan / Rol</label>
                                <Select value={title} onValueChange={(val: any) => setTitle(val)} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Rol seçin" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {!hasMuhtar && <SelectItem value="muhtar">Mahalle Muhtarı</SelectItem>}
                                        {!hasTeacher && <SelectItem value="teacher">Üniversite Hocası / Akademisyen</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="md:col-span-2 pt-2">
                                <Button type="submit" disabled={isSubmitting || !title} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                    {isSubmitting ? 'Gönderiliyor...' : 'E-Posta Davetiyesini Gönder'}
                                </Button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl p-6 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                        <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-100 mb-1">Tüm Referanslar Eklendi</h3>
                        <p className="text-emerald-700 dark:text-emerald-300/80 text-sm">
                            Gerekli olan maksimum referans sayısına (1 Muhtar, 1 Akademisyen) ulaştınız. Onay süreçlerini ekran üzerinden takip edebilirsiniz. Yeni bir referans eklemek istiyorsanız mevcut olanı silmeniz gerekir.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}
