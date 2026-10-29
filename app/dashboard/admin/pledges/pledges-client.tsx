"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { 
    FileSpreadsheet, Upload, Download, Plus, Search, 
    User, Mail, Phone, Calendar, ArrowRightLeft, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, Edit2, Trash2, Check, X, Banknote,
    MessageCircle, Send
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PledgeForm } from "./pledge-form";
import { PaymentForm } from "../payments/new/payment-form";
import { 
    importPledgesFromExcel, 
    matchPaymentToPledge, 
    deletePledge, 
    updatePledgeTarget, 
    getPledgePayments, 
    deletePledgePayment,
    sendPledgeEmailReminder 
} from "@/lib/actions/admin-pledges";

export function PledgesClient({
    periods,
    activePeriod,
    initialPledges,
    unmatchedPayments,
    eftFunds = [],
    allUsers = [],
    tenantId
}: {
    periods: any[];
    activePeriod: any;
    initialPledges: any[];
    unmatchedPayments: any[];
    eftFunds?: any[];
    allUsers?: any[];
    tenantId?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Manual Match State
    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [selectedPledgeForMatch, setSelectedPledgeForMatch] = useState<any>(null);
    const [matchSearchTerm, setMatchSearchTerm] = useState("");

    // Manual Payment Entry State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPledgeForPayment, setSelectedPledgeForPayment] = useState<any>(null);
    const [pledgePayments, setPledgePayments] = useState<any[]>([]);
    const [isFetchingPayments, setIsFetchingPayments] = useState(false);

    useEffect(() => {
        if (selectedPledgeForPayment && paymentModalOpen) {
            setIsFetchingPayments(true);
            getPledgePayments(selectedPledgeForPayment.id)
                .then(data => setPledgePayments(data))
                .catch(err => console.error("Error fetching payments:", err))
                .finally(() => setIsFetchingPayments(false));
        } else {
            setPledgePayments([]);
        }
    }, [selectedPledgeForPayment, paymentModalOpen]);

    // Edit Target State
    const [editingPledgeId, setEditingPledgeId] = useState<string | null>(null);
    const [editingTargetValue, setEditingTargetValue] = useState(1);

    // Email Reminder State
    const [emailPledge, setEmailPledge] = useState<any>(null);
    const [isEmailSending, setIsEmailSending] = useState(false);

    // Format phone for WhatsApp
    const formatPhoneForWhatsapp = (phone: string | null | undefined): string | null => {
        if (!phone) return null;
        let clean = phone.replace(/\D/g, '');
        if (clean.startsWith('0090')) {
            clean = clean.substring(2);
        } else if (clean.startsWith('090')) {
            clean = clean.substring(1);
        } else if (clean.startsWith('90')) {
            // ok
        } else if (clean.startsWith('05')) {
            clean = '9' + clean;
        } else if (clean.startsWith('5')) {
            clean = '90' + clean;
        }
        return clean.length >= 10 ? clean : null;
    };

    // Generate WhatsApp text
    const generateWhatsappMessage = (p: any) => {
        const formatTL = (val: number) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val) + " ₺";
        const dueMonth = p.dueMonthName || 'Aralık';
        const dueMonthsCount = p.dueMonths || 5;

        return `Sayın ${p.fullName},

FBİAD Vakfı ${p.periodName || '2026-2027'} burs dönemi kapsamında ${p.targetStudentCount} öğrenci için vermiş olduğunuz değerli burs taahhüdünüz için teşekkür ederiz.

Dönem burs planlamamız doğrultusunda ${dueMonth} ayı sonu dahil (${dueMonthsCount} aylık) vadesi gelen burs katkı payınız ${formatTL(p.dueTargetAmount)}, şu ana kadar sistemimize yansıyan ödemeniz ${formatTL(p.actualAmount)}'dir.

📌 Güncel vadesi gelen bakiye: ${formatTL(p.dueRemainingDebt)}'dir.

ℹ️ Neden Bir Sonraki Ayı (${dueMonth}) Baz Alıyoruz?
Öğrencilerimize ulaştırılan burs tutarlarından herhangi bir komisyon veya banka kesintisi yapılmaması adına, kredi kartı tahsilatları aracı ödeme kuruluşunda 33 gün yasal blokede bekledikten sonra vakfımıza aktarılmaktadır. Burs ödemelerinin takviminde aksama yaşanmaması için planlamamız bu vadeye göre yürütülmektedir.

💳 Kredi Kartı ile Ödeme İçin:
Mobil uygulamamıza giriş yapabilir veya doğrudan burs portalımız üzerinden ödemenizi tamamlayabilirsiniz:
https://burs.fbiadvakfi.org/

🏦 Havale / EFT ile Ödeme İçin:
Vakfımızın resmi banka hesap bilgilerine aşağıdaki sayfadan ulaşabilirsiniz:
https://fbiadvakfi.org/bagis/havale

(Not: Havale/EFT ödemelerinde açıklama kısmına adınızı-soyadınızı yazmayı ve dekontu FBİAD Burs Komitesi ile paylaşmayı lütfen unutmayınız.)

Geleceğimiz olan öğrencilerimiz adına kıymetli destekleriniz için sonsuz teşekkür ederiz.
FBİAD Vakfı Yönetimi`;
    };

    const handleWhatsappReminder = (p: any) => {
        if (!p.phone) {
            toast.error("Bu bağışçının kayıtlı telefon numarası bulunamadı.");
            return;
        }
        const cleanPhone = formatPhoneForWhatsapp(p.phone);
        if (!cleanPhone) {
            toast.error("Geçerli bir telefon numarası bulunamadı.");
            return;
        }
        const text = generateWhatsappMessage(p);

        // Mobil cihazlarda doğrudan uygulamayı açması için wa.me, masaüstünde ise sekme açılmasını önleyip doğrudan WhatsApp Desktop uygulamasını açması için whatsapp://
        const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
            window.open(waUrl, "_blank");
        } else {
            // Önce WhatsApp Desktop uygulamasını (whatsapp://) dene
            let hasAppOpened = false;
            const handleBlur = () => {
                hasAppOpened = true;
            };
            window.addEventListener('blur', handleBlur, { once: true });

            const waDesktopUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
            const link = document.createElement('a');
            link.href = waDesktopUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Eğer WhatsApp Desktop yüklü değilse (bilgisayar uygulamayı açamaz ve pencere odağını kaybetmezse), 1.5 sn sonra otomatik WhatsApp Web'e yönlendir
            setTimeout(() => {
                window.removeEventListener('blur', handleBlur);
                if (!hasAppOpened && document.hasFocus()) {
                    const waWebUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
                    window.open(waWebUrl, "_blank");
                }
            }, 1500);
        }

        toast.success(`${p.fullName} için WhatsApp açılıyor...`);
    };

    const handleConfirmSendEmail = async () => {
        if (!emailPledge) return;
        setIsEmailSending(true);
        try {
            const res = await sendPledgeEmailReminder(emailPledge.id);
            if (res.success) {
                toast.success(`${emailPledge.fullName} bağışçısına e-posta başarıyla gönderildi.`);
                setEmailPledge(null);
            } else {
                toast.error(res.error || "E-posta gönderilemedi.");
            }
        } catch (err: any) {
            toast.error("E-posta gönderilirken bir hata oluştu.");
        } finally {
            setIsEmailSending(false);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sort unmatched payments alphabetically by name
    const sortedUnmatchedPayments = [...unmatchedPayments].sort((a, b) => {
        const nameA = a.user?.fullName || "ZZZ"; // Push "Bilinmiyor" or missing to bottom
        const nameB = b.user?.fullName || "ZZZ";
        return nameA.localeCompare(nameB, 'tr');
    });

    const filteredModalPayments = sortedUnmatchedPayments.filter(up => 
        (up.user?.fullName || "").toLowerCase().includes(matchSearchTerm.toLowerCase())
    );

    // Filter Pledges
    const filteredPledges = initialPledges.filter(p => {
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (p.phone && p.phone.includes(searchTerm)) ||
                              (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()));
        
        let matchesStatus = true;
        if (statusFilter === "fulfilled") {
            matchesStatus = p.actualAmount >= p.targetAmount;
        } else if (statusFilter === "pending") {
            matchesStatus = p.actualAmount < p.targetAmount;
        }

        return matchesSearch && matchesStatus;
    });

    const handlePeriodChange = (periodId: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('period', periodId);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const text = evt.target?.result as string;
                const wb = XLSX.read(text, { type: 'string' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                
                // Read and clean the data to make it a plain object
                let data = XLSX.utils.sheet_to_json(ws);
                data = JSON.parse(JSON.stringify(data));

                if (data.length === 0) {
                    toast.error("Excel dosyası boş.");
                    return;
                }

                // Verify period column - fallback to checking keys for encoding issues just in case
                const firstRow = data[0] as any;
                const periodKey = Object.keys(firstRow).find(k => k.toLowerCase().includes('n' /* in case Dönem is corrupted */) && k.toLowerCase().includes('m')) || 'Dönem';
                
                if (!firstRow['Dönem'] && !firstRow[periodKey]) {
                    toast.error("Excel dosyasında 'Dönem' kolonu bulunamadı.");
                    return;
                }
                const rowPeriod = firstRow['Dönem'] || firstRow[periodKey];
                
                if (rowPeriod !== activePeriod.period) {
                    toast.error(`Excel'deki dönem (${rowPeriod}) ile sistemdeki aktif dönem (${activePeriod.period}) eşleşmiyor.`);
                    return;
                }

                toast.info("Excel içe aktarılıyor...");
                
                startTransition(async () => {
                    const result = await importPledgesFromExcel(activePeriod.id, data as any[]);
                    if (result?.success) {
                        toast.success(`${result.importedCount} kayıt eklendi. ${result.skippedCount} mükerrer kayıt atlandı.`);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    } else {
                        toast.error("İçe aktarma başarısız.");
                    }
                });

            } catch (err) {
                console.error(err);
                toast.error("Excel okunurken hata oluştu. Formatı kontrol edin.");
            }
        };
        reader.readAsText(file); // Default is UTF-8 which correctly reads Mac TextEdit CSVs
    };

    const handleMatch = (paymentId: string) => {
        if (!selectedPledgeForMatch) return;
        
        startTransition(async () => {
            const result = await matchPaymentToPledge(paymentId, selectedPledgeForMatch.id);
            if (result.success) {
                toast.success("Eşleştirme başarıyla yapıldı.");
                setMatchModalOpen(false);
                setSelectedPledgeForMatch(null);
            }
        });
    };

    const handleDelete = (pledgeId: string) => {
        if (!confirm("Bu taahhüdü silmek istediğinize emin misiniz?")) return;
        startTransition(async () => {
            const result = await deletePledge(pledgeId);
            if (result.success) toast.success("Taahhüt silindi.");
        });
    };

    const handleDeletePayment = (transactionId: string) => {
        if (!confirm("Bu tahsilatı silmek/geri almak istediğinize emin misiniz?")) return;
        startTransition(async () => {
            const result = await deletePledgePayment(transactionId);
            if (result.success) {
                toast.success("Tahsilat silindi.");
                if (selectedPledgeForPayment) {
                    getPledgePayments(selectedPledgeForPayment.id)
                        .then(data => setPledgePayments(data));
                }
            }
        });
    };

    const handleSaveTarget = (pledgeId: string) => {
        startTransition(async () => {
            const result = await updatePledgeTarget(pledgeId, editingTargetValue);
            if (result.success) {
                toast.success("Hedef güncellendi.");
                setEditingPledgeId(null);
            }
        });
    };

    const exportToExcel = () => {
        if (filteredPledges.length === 0) {
            toast.error("Dışa aktarılacak veri bulunamadı.");
            return;
        }

        const exportData = filteredPledges.map(p => ({
            "Bursveren Adı": p.fullName,
            "İletişim": p.phone || p.email || "-",
            "Taahhüt Bursiyer Sayısı": p.targetStudentCount,
            "Hedeflenen Vade": `${p.dueMonthName || 'Aralık'} Sonu (${p.dueMonths || 5} Ay)`,
            "Vadesi Gelen Tutar (TL)": p.dueTargetAmount || 0,
            "Ödeme Toplamı (TL)": p.actualAmount || 0,
            "Güncel Vade Borcu (TL)": p.dueRemainingDebt > 0 ? -p.dueRemainingDebt : 0,
            "Vade Durumu": p.isDueFulfilled ? "Vadesinde Ödendi" : `Borçlu (-${p.dueRemainingDebt} TL)`,
            "Sezon Toplam Taahhüt (TL)": p.targetAmount,
            "Sezon Genel Statü": p.actualAmount >= p.targetAmount ? "Tamamlandı" : "Devam Ediyor"
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Taahhütler");
        
        XLSX.writeFile(workbook, `Burs_Taahhutleri_${format(new Date(), "yyyyMMdd")}.xlsx`);
    };

    return (
        <div className="space-y-6">
            
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="w-full sm:w-64">
                        <label className="text-xs text-gray-500 mb-1 block">Aktif Dönem</label>
                        <Select value={activePeriod.id} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="bg-gray-50">
                                <SelectValue placeholder="Dönem Seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {periods.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.period} {p.isActive ? "(Aktif)" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-end gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="*/*"
                        className="hidden" 
                    />
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
                        <Upload className="w-4 h-4 mr-2 text-green-600" />
                        Excel'den Yükle
                    </Button>
                    <Button variant="outline" onClick={exportToExcel} disabled={filteredPledges.length === 0}>
                        <Download className="w-4 h-4 mr-2 text-blue-600" />
                        Excel'e Aktar
                    </Button>

                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Taahhüt Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Yeni Taahhüt Ekle</DialogTitle>
                            </DialogHeader>
                            <PledgeForm periodId={activePeriod.id} onSuccess={() => setIsAddModalOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Tabs defaultValue="pledges" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                    <TabsTrigger value="pledges">Taahhütler ({filteredPledges.length})</TabsTrigger>
                    <TabsTrigger value="unmatched">Taahhütsüz Gelenler ({unmatchedPayments.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pledges" className="mt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Ad Soyad, Telefon, E-posta Ara..." 
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-64">
                                <SelectValue placeholder="Durum Filtresi" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Hepsi</SelectItem>
                                <SelectItem value="fulfilled">Taahhüdünü Gerçekleştirenler</SelectItem>
                                <SelectItem value="pending">Gerçekleştirmeyenler</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Bağışçı</th>
                                        <th className="px-6 py-4">İletişim</th>
                                        <th className="px-6 py-4 text-center">Taahhüt Edilen</th>
                                        <th className="px-6 py-4 text-center">
                                            <div>Güncel Vade Borcu</div>
                                            <div className="text-[10px] font-normal text-gray-400 normal-case">
                                                (Bugün + 35 Gün: {filteredPledges[0]?.dueMonthName || 'Aralık'} Sonu)
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-center">Gerçekleşen / Hedef Tutar</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {filteredPledges.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                Bu kriterlere uygun taahhüt bulunamadı.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPledges.map((p) => {
                                            const isFulfilled = p.actualAmount >= p.targetAmount;
                                            return (
                                                <tr key={p.id} className={`hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors ${isFulfilled ? 'bg-green-50/30 dark:bg-green-900/10' : 'bg-yellow-50/30 dark:bg-yellow-900/10'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                            {p.fullName}
                                                            {isFulfilled && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {format(new Date(p.createdAt), "dd MMM yyyy", { locale: tr })}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1 text-gray-600 dark:text-gray-400">
                                                            {p.email && <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/>{p.email}</div>}
                                                            {p.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/>{p.phone}</div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="font-medium text-gray-700 dark:text-gray-300">
                                                            {p.targetStudentCount} Öğrenci
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center">
                                                            {p.dueRemainingDebt > 0 ? (
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className="px-3 py-1 border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 font-bold"
                                                                    title={`Güncel Vade Borcu: -${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(p.dueRemainingDebt)} ₺ / Vadesi Gelen: ${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(p.dueTargetAmount)} ₺ (${p.dueMonths} Ay)`}
                                                                >
                                                                    -{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(p.dueRemainingDebt)} ₺ / {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(p.dueTargetAmount)} ₺
                                                                </Badge>
                                                            ) : (
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className="px-3 py-1 border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300 font-semibold"
                                                                    title={`Vadesinde Ödendi (Borç: 0 ₺) / Vadesi Gelen: ${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(p.dueTargetAmount)} ₺ (${p.dueMonths} Ay)`}
                                                                >
                                                                    0 ₺ / {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(p.dueTargetAmount)} ₺
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2 group">
                                                            <Badge variant="outline" className={`px-3 py-1 ${isFulfilled ? 'border-green-200 bg-green-100 text-green-700' : 'border-yellow-200 bg-yellow-100 text-yellow-700'}`}>
                                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p.actualAmount)} / {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p.targetAmount)}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            {!isFulfilled && (
                                                                <>
                                                                    <Button 
                                                                        size="icon" 
                                                                        variant="ghost" 
                                                                        className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                                                        title="WhatsApp ile Hatırlat"
                                                                        onClick={() => handleWhatsappReminder(p)}
                                                                    >
                                                                        <MessageCircle className="w-4 h-4" />
                                                                    </Button>
                                                                    <Button 
                                                                        size="icon" 
                                                                        variant="ghost" 
                                                                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                                                        title="E-Posta ile Hatırlat"
                                                                        onClick={() => {
                                                                            if (!p.email) {
                                                                                toast.error(`${p.fullName} için sistemde kayıtlı e-posta adresi bulunamadı.`);
                                                                                return;
                                                                            }
                                                                            setEmailPledge(p);
                                                                        }}
                                                                    >
                                                                        <Mail className="w-4 h-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                                title="Eşleştir"
                                                                onClick={() => {
                                                                    setSelectedPledgeForMatch(p);
                                                                    setMatchModalOpen(true);
                                                                }}
                                                            >
                                                                <LinkIcon className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                title="Tahsilat Gir"
                                                                onClick={() => {
                                                                    setSelectedPledgeForPayment(p);
                                                                    setPaymentModalOpen(true);
                                                                }}
                                                            >
                                                                <Banknote className="w-4 h-4" />
                                                            </Button>
                                                            <Button 
                                                                size="icon" 
                                                                variant="ghost" 
                                                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" 
                                                                title="Sil"
                                                                onClick={() => handleDelete(p.id)} 
                                                                disabled={isPending}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="unmatched" className="mt-6">
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 bg-amber-50/50 dark:bg-amber-900/10 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800 dark:text-amber-200">
                                <p className="font-semibold mb-1">Sürpriz Bağışçılar ve Yetim Tahsilatlar</p>
                                <p>Aşağıdaki ödemeler sistemde herhangi bir taahhüt ile eşleşmemiştir. İsim veya numara hataları yüzünden eşleşmeyenleri <b>Taahhütler sekmesindeki "Eşleştir"</b> butonu ile bağlayabilirsiniz.</p>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Ödeme Yapan Kullanıcı</th>
                                        <th className="px-6 py-4">Tutar & Not</th>
                                        <th className="px-6 py-4">Tarih</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {sortedUnmatchedPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                Eşleşmemiş ödeme bulunmuyor. Her şey yolunda!
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedUnmatchedPayments.map((up) => (
                                            <tr key={up.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {up.user?.fullName || "Bilinmeyen Kullanıcı"}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {up.user?.email || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(up.amount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[200px]" title={up.notes}>
                                                        {up.notes || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                    {format(new Date(up.paymentDate || up.createdAt), "dd MMM yyyy HH:mm", { locale: tr })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Match Modal */}
            <Dialog open={matchModalOpen} onOpenChange={open => { setMatchModalOpen(open); if(!open) setMatchSearchTerm(""); }}>
                <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
                    <div className="p-6 pb-2">
                        <DialogHeader>
                            <DialogTitle>Tahsilat Eşleştir: {selectedPledgeForMatch?.fullName}</DialogTitle>
                        </DialogHeader>
                    </div>
                    
                    <div className="px-6 space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Bu taahhüt için bağlayacağınız ödemeyi seçin.</p>
                            <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Seçtiğiniz ödemenin tutarı otomatik olarak taahhüdün gerçekleşen bakiyesine eklenecektir.</p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Bağışçı adına göre ara..." 
                                className="pl-9"
                                value={matchSearchTerm}
                                onChange={(e) => setMatchSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 min-h-[300px]">
                        <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 bg-gray-50/95 dark:bg-zinc-800/95 backdrop-blur">Ödeme Yapan</th>
                                        <th className="px-4 py-3 bg-gray-50/95 dark:bg-zinc-800/95 backdrop-blur">Tutar</th>
                                        <th className="px-4 py-3 bg-gray-50/95 dark:bg-zinc-800/95 backdrop-blur">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {filteredModalPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                Aramanıza uygun eşleşmemiş ödeme bulunamadı.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredModalPayments.map(up => (
                                            <tr key={up.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium">{up.user?.fullName || "Bilinmiyor"}</div>
                                                    <div className="text-xs text-gray-500">{format(new Date(up.paymentDate || up.createdAt), "dd MMM yyyy")}</div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(up.amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button size="sm" onClick={() => handleMatch(up.id)} disabled={isPending}>
                                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bunu Bağla"}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Manual Payment Modal */}
            <Dialog open={paymentModalOpen} onOpenChange={open => { 
                setPaymentModalOpen(open); 
                if (!open) {
                    setSelectedPledgeForPayment(null);
                    setPledgePayments([]);
                }
            }}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tahsilat Yönetimi: {selectedPledgeForPayment?.fullName}</DialogTitle>
                    </DialogHeader>
                    {selectedPledgeForPayment && tenantId && (
                        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Yeni Tahsilat Gir</h3>
                                <PaymentForm 
                                    eftFunds={eftFunds} 
                                    users={allUsers} 
                                    tenantId={tenantId}
                                    initialData={{
                                        pledgeId: selectedPledgeForPayment.id,
                                        pledgeFullName: selectedPledgeForPayment.fullName,
                                        pledgeTargetAmount: selectedPledgeForPayment.targetAmount,
                                        pledgeActualAmount: selectedPledgeForPayment.actualAmount,
                                        pledgeTargetStudentCount: selectedPledgeForPayment.targetStudentCount,
                                        newUserName: selectedPledgeForPayment.fullName,
                                        newUserEmail: selectedPledgeForPayment.email || "",
                                        newUserPhone: selectedPledgeForPayment.phone || "",
                                        amount: selectedPledgeForPayment.targetAmount - selectedPledgeForPayment.actualAmount > 0 ? selectedPledgeForPayment.targetAmount - selectedPledgeForPayment.actualAmount : 0
                                    }}
                                    onSuccess={() => {
                                        // setPaymentModalOpen(false) yapmıyoruz, tahsilatları güncelliyoruz.
                                        getPledgePayments(selectedPledgeForPayment.id)
                                            .then(data => setPledgePayments(data));
                                        router.refresh();
                                    }}
                                />
                            </div>
                            
                            <div className="bg-gray-50/50 dark:bg-zinc-800/20 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 flex flex-col h-full">
                                <h3 className="text-sm font-semibold mb-4 text-gray-700 dark:text-gray-300">Geçmiş Tahsilatlar (Bu Dönem)</h3>
                                
                                {isFetchingPayments ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                    </div>
                                ) : pledgePayments.length === 0 ? (
                                    <div className="text-sm text-gray-500 text-center py-8 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
                                        Henüz tahsilat bulunmuyor.
                                    </div>
                                ) : (
                                    <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
                                        {pledgePayments.map(tx => (
                                            <div key={tx.id} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm">
                                                <div>
                                                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tx.allocatedAmount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {format(new Date(tx.payment?.paymentDate || tx.createdAt), "dd MMM yyyy", { locale: tr })}
                                                    </div>
                                                </div>
                                                <Button 
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                    title="Tahsilatı Sil"
                                                    onClick={() => handleDeletePayment(tx.id)}
                                                    disabled={isPending}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Email Reminder Confirmation Dialog */}
            <Dialog open={!!emailPledge} onOpenChange={(open) => { if (!open) setEmailPledge(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-indigo-950 dark:text-white">
                            <Mail className="w-5 h-5 text-indigo-600" />
                            E-Posta Hatırlatması Gönder
                        </DialogTitle>
                        <DialogDescription>
                            Bağışçıya dönem burs katkı payı ve güncel vade durumunu içeren bilgilendirme e-postası gönderilecektir.
                        </DialogDescription>
                    </DialogHeader>

                    {emailPledge && (
                        <div className="space-y-4 py-2 text-sm">
                            <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-gray-100 dark:border-zinc-700 space-y-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Bağışçı:</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{emailPledge.fullName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">E-Posta:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{emailPledge.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Taahhüt:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{emailPledge.targetStudentCount} Öğrenci</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Vadesi Gelen Tutar:</span>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">
                                        {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(emailPledge.dueTargetAmount)} ₺ ({emailPledge.dueMonths} Ay)
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sistemdeki Ödeme:</span>
                                    <span className="font-medium text-emerald-600">
                                        {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(emailPledge.actualAmount)} ₺
                                    </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-zinc-700 font-semibold">
                                    <span className="text-red-600">Güncel Vade Borcu:</span>
                                    <span className="text-red-600 text-base">
                                        {new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(emailPledge.dueRemainingDebt)} ₺
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                E-posta içerisinde kredi kartı ödemeleri için mobil uygulama yönlendirmesi, Havale/EFT için vakıf web sitesi linki ve dekont paylaşım notu yer alacaktır.
                            </p>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setEmailPledge(null)}
                                    disabled={isEmailSending}
                                >
                                    Vazgeç
                                </Button>
                                <Button 
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
                                    onClick={handleConfirmSendEmail}
                                    disabled={isEmailSending}
                                >
                                    {isEmailSending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Gönderiliyor...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            E-Posta Gönder
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
