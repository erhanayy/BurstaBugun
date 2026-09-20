"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { 
    FileSpreadsheet, Upload, Download, Plus, Search, 
    User, Mail, Phone, Calendar, ArrowRightLeft, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, Edit2, Trash2, Check, X
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PledgeForm } from "./pledge-form";
import { importPledgesFromExcel, matchPaymentToPledge, deletePledge, updatePledgeTarget } from "@/lib/actions/admin-pledges";

export function PledgesClient({
    periods,
    activePeriod,
    initialPledges,
    unmatchedPayments
}: {
    periods: any[];
    activePeriod: any;
    initialPledges: any[];
    unmatchedPayments: any[];
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

    // Edit Target State
    const [editingPledgeId, setEditingPledgeId] = useState<string | null>(null);
    const [editingTargetValue, setEditingTargetValue] = useState(1);

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
            "Taahhüt Tutarı": p.targetAmount,
            "Ödeme Toplamı": p.actualAmount,
            "Statü": p.actualAmount >= p.targetAmount ? "Tamamlandı" : "Devam Ediyor"
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
                                        <th className="px-6 py-4 text-center">Gerçekleşen / Hedef Tutar</th>
                                        <th className="px-6 py-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {filteredPledges.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
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
                                                        <div className="flex items-center justify-center gap-2 group">
                                                            <Badge variant="outline" className={`px-3 py-1 ${isFulfilled ? 'border-green-200 bg-green-100 text-green-700' : 'border-yellow-200 bg-yellow-100 text-yellow-700'}`}>
                                                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p.actualAmount)} / {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(p.targetAmount)}
                                                            </Badge>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(p.id)} disabled={isPending}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                            {!isFulfilled && (
                                                                <Button variant="outline" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                                                    <Mail className="w-3.5 h-3.5 mr-1" />
                                                                    Hatırlat
                                                                </Button>
                                                            )}
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => {
                                                                    setSelectedPledgeForMatch(p);
                                                                    setMatchModalOpen(true);
                                                                }}
                                                            >
                                                                <LinkIcon className="w-3.5 h-3.5 mr-1" />
                                                                Eşleştir
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
        </div>
    );
}
