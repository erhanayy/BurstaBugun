"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { submitWizardApplication, saveDraftApplication } from "@/lib/actions/wizard";
import { ChevronRight, ChevronLeft, Check, UploadCloud, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";

export default function WizardClient({ form, tenantId, userId, existingAnswers = {}, existingDraftId = null, previousAnswers = null }: { form: any; tenantId: string; userId: string; existingAnswers?: any; existingDraftId?: string | null; previousAnswers?: any }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>(existingAnswers || {});
    const [draftId, setDraftId] = useState<string | null>(existingDraftId);
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
    const [isCompleted, setIsCompleted] = useState(false);
    const [showCopyPrompt, setShowCopyPrompt] = useState(!!previousAnswers && (!existingAnswers || Object.keys(existingAnswers).length === 0));

    const steps = form.steps || [];
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return null;

    const handleNext = () => {
        let hasError = false;
        currentStep.fields.forEach((f: any) => {
            if (f.required && !answers[f.name]) {
                hasError = true;
                toast.error(`Lütfen zorunlu alanı doldurun: ${f.name}`);
            }
        });
        if (hasError) return;

        setCurrentStepIndex(currentStepIndex + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFileUpload = async (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await res.json();
            setAnswers(prev => ({ ...prev, [fieldName]: data.url }));
            toast.success("Dosya başarıyla yüklendi.");
        } catch (err: any) {
            toast.error(err.message || "Dosya yüklenemedi.");
        } finally {
            setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
            e.target.value = ''; // Reset input to allow re-uploading same file
        }
    };

    const handlePrev = () => {
        setCurrentStepIndex(Math.max(0, currentStepIndex - 1));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        const res = await saveDraftApplication({
            draftId: draftId || undefined,
            tenantId,
            userId,
            formId: form.id,
            answersJson: JSON.stringify(answers),
        });

        if (res.success) {
            toast.success("Taslak başarıyla kaydedildi! Devam edebilirsiniz.");
            if (res.draftId) setDraftId(res.draftId);
        } else {
            toast.error(res.error || "Taslak kaydedilemedi.");
        }
        setSavingDraft(false);
    };

    const handleSubmit = async () => {
        let hasError = false;
        currentStep.fields.forEach((f: any) => {
            if (f.required && !answers[f.name]) {
                hasError = true;
                toast.error(`Lütfen zorunlu alanı doldurun: ${f.name}`);
            }
        });
        if (hasError) return;

        setLoading(true);
        const res = await submitWizardApplication({
            draftId: draftId || undefined,
            tenantId,
            userId,
            formId: form.id,
            answersJson: JSON.stringify(answers),
        });

        if (res.success) {
            toast.success("Başvurunuz başarıyla alındı!");
            setIsCompleted(true);
        } else {
            toast.error(res.error || "Başvuru gönderilirken bir hata oluştu.");
        }
        setLoading(false);
    };

    if (isCompleted) {
        return (
            <div className="max-w-2xl mx-auto mt-12 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Başvurunuz Alındı!</h2>
                <p className="text-gray-500 mb-6">Form başarıyla sisteme aktarıldı. Sonuçlar ve davetler için profilinizi kontrol etmeye devam ediniz.</p>
                <Button onClick={() => window.location.href = "/dashboard/applications"} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                    Kayıtlarıma Git
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pt-6 pb-20">
            {/* Header & Progress */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{form.title}</h1>
                <p className="text-gray-500 mt-2">{form.description}</p>
            </div>

            {showCopyPrompt && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 rounded-xl p-5 sm:p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-md"><Copy className="w-4 h-4" /></span>
                            Eski Başvurunuz Bulundu
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">Sistemde önceden doldurduğunuz bir başvurunuz var. Verilerinizi buraya otomatik aktarmak ister misiniz? Değişen alanları düzelterek hızlıca ilerleyebilirsiniz.</p>
                    </div>
                    <div className="flex w-full sm:w-auto gap-3 shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowCopyPrompt(false)}
                            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                        >
                            İptal
                        </Button>
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                                setAnswers(previousAnswers);
                                setShowCopyPrompt(false);
                                toast.success("Önceki başvuru bilgileriniz kopyalandı!");
                            }}
                        >
                            Bilgilerimi Aktar
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-6 mb-8 gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {steps.map((step: any, index: number) => {
                    const isActive = index === currentStepIndex;
                    const isPast = index < currentStepIndex;
                    return (
                        <div key={index} className="flex flex-col items-center flex-1 min-w-[80px]">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors z-10 
                                ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-md' :
                                    isPast ? 'bg-blue-100 border-blue-600 text-blue-600' :
                                        'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-400'}`}>
                                {isPast ? <Check className="w-5 h-5" /> : index + 1}
                            </div>
                            <span className={`text-[10px] sm:text-xs mt-2 font-medium text-center truncate w-full px-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                {step.title}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-zinc-800 pb-4">
                    {currentStep.title}
                </h2>

                <div className="space-y-6">
                    {currentStep.fields.map((field: any) => (
                        <div key={field.id} className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {field.name} {field.required && <span className="text-red-500">*</span>}
                            </label>

                            {field.type === 'text' && (
                                <Input
                                    value={answers[field.name] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [field.name]: e.target.value })}
                                    className="bg-gray-50 dark:bg-zinc-950/50"
                                />
                            )}

                            {field.type === 'textarea' && (
                                <Textarea
                                    value={answers[field.name] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [field.name]: e.target.value })}
                                    className="bg-gray-50 dark:bg-zinc-950/50 min-h-[100px]"
                                />
                            )}

                            {field.type === 'number' && (
                                <Input
                                    type="number"
                                    step="any"
                                    value={answers[field.name] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [field.name]: e.target.value })}
                                    className="bg-gray-50 dark:bg-zinc-950/50"
                                />
                            )}

                            {field.type === 'listbox' && (
                                <Select value={answers[field.name] || ''} onValueChange={(val) => setAnswers({ ...answers, [field.name]: val })}>
                                    <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-950/50">
                                        <SelectValue placeholder="Seçiniz..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {field.options?.split(';').map((opt: string, i: number) => (
                                            <SelectItem key={i} value={opt.trim()}>{opt.trim()}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {field.type === 'date' && (
                                <Input
                                    type="date"
                                    value={answers[field.name] || ''}
                                    onChange={(e) => setAnswers({ ...answers, [field.name]: e.target.value })}
                                    className="bg-gray-50 dark:bg-zinc-950/50 w-full"
                                />
                            )}

                            {field.type === 'file' && (
                                <div className="space-y-3">
                                    {answers[field.name] ? (
                                        <div className="flex flex-col sm:flex-row items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                                            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                            <div className="flex-1 min-w-0 text-center sm:text-left">
                                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 truncate">Dosya Yüklendi</p>
                                                <a href={answers[field.name]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-block truncate w-full max-w-xs">{answers[field.name].split('/').pop()}</a>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setAnswers(prev => ({ ...prev, [field.name]: '' }))} className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-700">Değiştir / Kaldır</Button>
                                        </div>
                                    ) : (
                                        <label className={`block border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group relative ${uploadingFiles[field.name] ? 'opacity-50 pointer-events-none' : ''}`}>
                                            {uploadingFiles[field.name] ? (
                                                <div className="py-4">
                                                    <span className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin inline-block mb-3"></span>
                                                    <p className="text-sm font-medium text-gray-600">Yükleniyor...</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="w-10 h-10 mx-auto text-gray-400 group-hover:text-blue-500 mb-3 transition-colors" />
                                                    <p className="text-sm font-medium text-gray-600">Buraya tıklayarak dosya yükleyin</p>
                                                    <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG vb. (Max 10MB)</p>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(field.name, e)} />
                                                </>
                                            )}
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {currentStep.fields.length === 0 && (
                        <p className="text-sm text-gray-500 italic">Bu ekranda doldurulacak alan bulunmuyor.</p>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-8 mt-8 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                            variant="outline"
                            onClick={handlePrev}
                            disabled={currentStepIndex === 0}
                            className="w-28"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" /> Geri
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={handleSaveDraft}
                            disabled={savingDraft || loading}
                            className="w-full sm:w-auto text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                        >
                            {savingDraft ? <span className="animate-spin mr-2">⌛</span> : <Save className="w-4 h-4 mr-1" />}
                            Taslağı Kaydet
                        </Button>
                    </div>

                    {currentStepIndex < steps.length - 1 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 w-full sm:w-auto"
                        >
                            İleri <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || savingDraft}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 shadow-md w-full sm:w-auto"
                        >
                            {loading ? <span className="animate-spin mr-2">⌛</span> : <Check className="w-4 h-4 mr-1" />}
                            Başvuruyu Tamamla
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
