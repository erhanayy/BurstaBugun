"use client";

import { useState, useTransition } from "react";
import { saveSignedDocumentDefinition, deleteSignedDocumentDefinition } from "@/lib/actions/signed-documents";
import { FileText, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface DocDefinition {
    id: string;
    tenantId: string;
    name: string;
    targetRole: string;
    isPeriodic: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface DocumentDefinitionFormProps {
    initialDefinitions: DocDefinition[];
}

export function DocumentDefinitionForm({ initialDefinitions }: DocumentDefinitionFormProps) {
    const [definitions, setDefinitions] = useState<DocDefinition[]>(initialDefinitions);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [targetRole, setTargetRole] = useState<'all' | 'applicant' | 'sponsor_reference'>('applicant');
    const [isPeriodic, setIsPeriodic] = useState(true);
    const [isPending, startTransition] = useTransition();

    const handleEdit = (def: DocDefinition) => {
        setEditingId(def.id);
        setName(def.name);
        setTargetRole(def.targetRole as any);
        setIsPeriodic(def.isPeriodic);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setEditingId(null);
        setName("");
        setTargetRole("applicant");
        setIsPeriodic(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Lütfen doküman adını giriniz.");
            return;
        }

        startTransition(async () => {
            try {
                await saveSignedDocumentDefinition({
                    id: editingId || undefined,
                    name: name.trim(),
                    targetRole,
                    isPeriodic,
                });

                toast.success(editingId ? "Doküman tanımı güncellendi." : "Yeni doküman tanımı kaydedildi.");
                handleCancel();
                // Sayfayı yenilemek yerine mevcut listeyi server revalidation sonrasında senkron tut
                window.location.reload();
            } catch (err: any) {
                toast.error(err.message || "Bir hata oluştu.");
            }
        });
    };

    const handleDelete = async (id: string, docName: string) => {
        if (!confirm(`"${docName}" doküman tanımını silmek istediğinize emin misiniz? Buna bağlı teslim kayıtları da silinecektir.`)) {
            return;
        }

        startTransition(async () => {
            try {
                await deleteSignedDocumentDefinition(id);
                setDefinitions(prev => prev.filter(d => d.id !== id));
                toast.success("Doküman tanımı silindi.");
            } catch (err: any) {
                toast.error(err.message || "Silme işlemi başarısız.");
            }
        });
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'applicant': return 'Bursiyer';
            case 'sponsor_reference': return 'Bursveren / Referans';
            case 'all': return 'Herkes';
            default: return role;
        }
    };

    return (
        <div className="space-y-8">
            {/* Üst Kart: Tanımlama / Düzenleme Formu */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {editingId ? "Doküman Tanımını Düzenle" : "Yeni İmzalı Doküman Tanımla"}
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Öğrencilerden veya ilgililerden ıslak imzalı / fiziki olarak teslim alınacak evrakları tanımlayın
                            </p>
                        </div>
                    </div>
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" /> Düzenlemeyi İptal Et
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Doküman Adı */}
                        <div className="md:col-span-2">
                            <label htmlFor="doc-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Doküman Adı <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="doc-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Örn: Islak İmzalı KVKK Onay Formu, Burs Taahhütnamesi..."
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>

                        {/* Kimden Alınacak */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Kimden Alınacak?
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'applicant', label: 'Bursiyer' },
                                    { value: 'sponsor_reference', label: 'Bursveren / Referans' },
                                    { value: 'all', label: 'Herkes' },
                                ].map((role) => (
                                    <label
                                        key={role.value}
                                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all text-center ${
                                            targetRole === role.value
                                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm'
                                                : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="targetRole"
                                            value={role.value}
                                            checked={targetRole === role.value}
                                            onChange={() => setTargetRole(role.value as any)}
                                            className="sr-only"
                                        />
                                        <span>{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Dönem Bazlı mı? */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Dönem Bazlı mı?
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <label
                                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                        isPeriodic
                                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm'
                                            : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="isPeriodic"
                                        checked={isPeriodic}
                                        onChange={() => setIsPeriodic(true)}
                                        className="sr-only"
                                    />
                                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                    <div>
                                        <div className="font-semibold">Evet (Dönemlik)</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">Her eğitim döneminde ayrı alınır</div>
                                    </div>
                                </label>

                                <label
                                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                        !isPeriodic
                                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 shadow-sm'
                                            : 'border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-gray-400'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="isPeriodic"
                                        checked={!isPeriodic}
                                        onChange={() => setIsPeriodic(false)}
                                        className="sr-only"
                                    />
                                    <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                                    <div>
                                        <div className="font-semibold">Hayır (Tek Seferlik)</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">Tüm dönemler için 1 kez yeterlidir</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Vazgeç
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isPending}
                            id="btn-save-doc-def"
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 disabled:opacity-50 transition-all"
                        >
                            {isPending ? (
                                <span>Kaydediliyor...</span>
                            ) : (
                                <>
                                    {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    <span>{editingId ? "Güncellemeyi Kaydet" : "Dokümanı Tanımla"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Alt Tablo: Tanımlanmış Dokümanlar Listesi */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                            Tanımlı İmzalı Dokümanlar
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Toplam {definitions.length} adet doküman tanımı bulunmaktadır
                        </p>
                    </div>
                </div>

                {definitions.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-zinc-700" />
                        <p className="text-sm font-medium">Henüz imzalı doküman tanımı yapılmamış.</p>
                        <p className="text-xs text-gray-400 mt-1">Yukarıdaki formu kullanarak ilk dokümanı tanımlayabilirsiniz.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                            <thead className="bg-gray-50/75 dark:bg-zinc-800/50 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-3.5">Doküman Adı</th>
                                    <th className="px-6 py-3.5">Kimden Alınacak</th>
                                    <th className="px-6 py-3.5">Dönem Kapsamı</th>
                                    <th className="px-6 py-3.5">Durum</th>
                                    <th className="px-6 py-3.5 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {definitions.map((def) => (
                                    <tr key={def.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span>{def.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200">
                                                {getRoleLabel(def.targetRole)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {def.isPeriodic ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    Dönem Bazlı
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                    Tek Seferlik (Genel)
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {def.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                    Pasif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(def)}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                                    title="Düzenle"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(def.id, def.name)}
                                                    disabled={isPending}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Sil"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
