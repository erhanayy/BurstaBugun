"use client";

import { useState } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Plus, Trash2, LayoutList, ChevronRight, GripVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createForm, deleteForm, updateForm } from "@/lib/actions/forms";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Edit } from "lucide-react";

export default function FormsAdminClient({ tenantId, initialForms }: { tenantId: string, initialForms: any[] }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form builder state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [referenceMailTemplate, setReferenceMailTemplate] = useState("Değerli {isim}, {ogrenci} isimli öğrenci burs başvurusu için sizi referans göstermiştir. Başvuruyu onaylamak için lütfen sisteme giriş yapınız.");
    const [steps, setSteps] = useState<{ id: string, title: string, fields: any[] }[]>([
        { id: "step-1", title: "Kişisel Bilgiler", fields: [] }
    ]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    const addStep = () => {
        const newSteps = [...steps, { id: `step-${Date.now()}`, title: "Yeni Adım", fields: [] }];
        setSteps(newSteps);
        setActiveStepIndex(newSteps.length - 1);
    };

    const updateStep = (index: number, val: string) => {
        const newSteps = [...steps];
        newSteps[index].title = val;
        setSteps(newSteps);
    };

    const removeStep = (index: number) => {
        if (steps.length === 1) return toast.error("En az 1 adım kalmalıdır.");
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
        if (activeStepIndex >= newSteps.length) {
            setActiveStepIndex(newSteps.length - 1);
        } else if (activeStepIndex === index) {
            setActiveStepIndex(Math.max(0, index - 1));
        }
    };

    const moveStep = (index: number, direction: 'up' | 'down') => {
        const newSteps = [...steps];
        if (direction === 'up' && index > 0) {
            [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
            if (activeStepIndex === index) setActiveStepIndex(index - 1);
            else if (activeStepIndex === index - 1) setActiveStepIndex(index);
        } else if (direction === 'down' && index < newSteps.length - 1) {
            [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            if (activeStepIndex === index) setActiveStepIndex(index + 1);
            else if (activeStepIndex === index + 1) setActiveStepIndex(index);
        }
        setSteps(newSteps);
    };

    const addField = (stepIndex: number) => {
        const newSteps = [...steps];
        newSteps[stepIndex].fields.push({ id: `f-${Date.now()}`, name: "", type: "text", required: false, options: "" });
        setSteps(newSteps);
    };

    const updateField = (stepIndex: number, fieldIndex: number, key: string, value: any) => {
        const newSteps = [...steps];
        newSteps[stepIndex].fields[fieldIndex][key] = value;
        setSteps(newSteps);
    };

    const removeField = (stepIndex: number, fieldIndex: number) => {
        const newSteps = [...steps];
        newSteps[stepIndex].fields = newSteps[stepIndex].fields.filter((_, i) => i !== fieldIndex);
        setSteps(newSteps);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return toast.error("Form başlığı zorunludur.");
        if (steps.length === 0) return toast.error("En az bir adım (ekran) eklemelisiniz.");
        if (steps.some(s => !s.title.trim())) return toast.error("Eksik adım isimlerini doldurun.");

        let hasError = false;
        steps.forEach(s => {
            if (s.fields.some(f => !f.name.trim())) {
                toast.error(`"${s.title}" adımındaki eksik alan isimlerini doldurun.`);
                hasError = true;
            }
        });
        if (hasError) return;

        setLoading(true);
        const payload = {
            tenantId,
            title,
            description,
            referenceMailTemplate,
            steps
        };

        let res;
        if (editingId) {
            res = await updateForm({ id: editingId, ...payload });
        } else {
            res = await createForm(payload);
        }

        if (res.success) {
            toast.success(`Form başarıyla ${editingId ? 'güncellendi' : 'oluşturuldu'}.`);
            handleClose();
        } else {
            toast.error(res.error || "Bir hata oluştu.");
        }
        setLoading(false);
    };

    const handleClose = () => {
        setIsAddOpen(false);
        setEditingId(null);
        setTitle("");
        setDescription("");
        setReferenceMailTemplate("Değerli {isim}, {ogrenci} isimli öğrenci burs başvurusu için sizi referans göstermiştir. Başvuruyu onaylamak için lütfen sisteme giriş yapınız.");
        setSteps([{ id: "step-1", title: "Kişisel Bilgiler", fields: [] }]);
        setActiveStepIndex(0);
    };

    const handleEdit = (form: any) => {
        setEditingId(form.id);
        setTitle(form.title);
        setDescription(form.description || "");
        setReferenceMailTemplate(form.referenceMailTemplate || "Değerli {isim}, {ogrenci} isimli öğrenci burs başvurusu için sizi referans göstermiştir. Başvuruyu onaylamak için lütfen sisteme giriş yapınız.");
        setSteps(form.steps || [{ id: "step-1", title: "Kişisel Bilgiler", fields: [] }]);
        setActiveStepIndex(0);
        setIsAddOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Silerseniz, eski verilere erişimde sorun olabilir. Emin misiniz?")) return;
        const res = await deleteForm(id);
        if (res.success) {
            toast.success("Form silindi.");
        } else {
            toast.error(res.error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Başvuru Tasarımcısı (Builder)</h2>
                    <p className="text-sm text-gray-500 mt-1">Bursiyer adaylarının dolduracağı dinamik başvuru wizard ekranlarını yaratın.</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsAddOpen(true); }}>
                    <DialogTrigger asChild>
                        <button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm w-full sm:w-auto justify-center shrink-0">
                            <Plus className="w-5 h-5" />
                            Yeni Form Tanımla
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ maxWidth: '1000px', width: '90vw' }}>
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Başvuru Formunu Güncelle" : "Yeni Başvuru Formu Şablonu İşle"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-6 mt-4 pb-12">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Form Başlığı <span className="text-red-500">*</span></label>
                                    <Input placeholder="Örn: 2026 Üniversite Burs Başvurusu" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-600">Açıklama / Yönerge</label>
                                    <Input placeholder="Bursiyerin formu açtığında göreceği açıklama..." value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-600">Referans E-Posta Şablonu</label>
                                    <Textarea className="min-h-[80px] text-sm" placeholder="Değerli {isim}, {ogrenci} isimli öğrenci sizi referans göstermiştir..." value={referenceMailTemplate} onChange={e => setReferenceMailTemplate(e.target.value)} />
                                    <p className="text-[10px] text-gray-500">Değişkenler: {'{isim}'}, {'{ogrenci}'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 dark:border-zinc-700 pt-6 mt-4 flex flex-col md:flex-row gap-6 h-[350px]">
                                {/* LEFT COLUMN: Steps Navigation */}
                                <div className="w-full md:w-1/3 bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 h-full overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="text-base font-bold text-gray-900 dark:text-white">Ekranlar (Adımlar)</label>
                                        <span className="text-xs text-gray-500">{steps.length} Ekran</span>
                                    </div>
                                    <div className="space-y-2 pb-4">
                                        {steps.map((step, sIdx) => {
                                            const isActive = sIdx === activeStepIndex;
                                            return (
                                                <div
                                                    key={step.id}
                                                    onClick={() => setActiveStepIndex(sIdx)}
                                                    className={`cursor-pointer group flex flex-col gap-2 p-3 rounded-lg border transition-all ${isActive
                                                        ? 'bg-white dark:bg-zinc-800 border-blue-500 shadow-sm'
                                                        : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-zinc-800/80'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-center w-full">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{sIdx + 1}</span>
                                                            <span className={`font-medium text-sm truncate ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {step.title || 'İsimsiz Adım'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); removeStep(sIdx); }}
                                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Sıralama Kontrolleri */}
                                                    {isActive && (
                                                        <div className="flex justify-between items-center text-xs text-gray-400 pt-1 border-t border-gray-100 dark:border-zinc-700 mt-1">
                                                            <span>Sıralama:</span>
                                                            <div className="flex gap-1">
                                                                <button disabled={sIdx === 0} onClick={(e) => { e.stopPropagation(); moveStep(sIdx, 'up'); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-30">Yukarı</button>
                                                                <button disabled={sIdx === steps.length - 1} onClick={(e) => { e.stopPropagation(); moveStep(sIdx, 'down'); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-30">Aşağı</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="pt-2">
                                        <Button type="button" variant="outline" onClick={addStep} className="mt-2 w-full border-dashed text-blue-600 bg-blue-50/50 hover:bg-blue-100">
                                            <Plus className="w-4 h-4 mr-1" /> Yeni Adım / Ekran Ekle
                                        </Button>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Active Step Fields */}
                                <div className="w-full md:w-2/3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 h-full overflow-y-auto">
                                    {steps[activeStepIndex] ? (
                                        <>
                                            <div className="mb-6">
                                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Aktif Seçili Ekranın Başlığı</label>
                                                <Input
                                                    value={steps[activeStepIndex].title}
                                                    onChange={e => updateStep(activeStepIndex, e.target.value)}
                                                    className="font-medium text-lg border-b-2 border-x-0 border-t-0 border-gray-200 focus-visible:ring-0 focus-visible:border-blue-500 rounded-none px-0"
                                                    placeholder="Örn: Eğitim Bilgileri"
                                                />
                                            </div>

                                            <div className="space-y-4 pr-2 pb-2">
                                                <div className="flex justify-between items-center sticky top-0 bg-white dark:bg-zinc-900 pb-2 z-10 border-b border-gray-100 dark:border-zinc-800">
                                                    <span className="font-semibold text-sm">Bu Ekrandaki Sorular:</span>
                                                    <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-gray-600">{steps[activeStepIndex].fields.length} Alan</span>
                                                </div>

                                                {steps[activeStepIndex].fields.length === 0 ? (
                                                    <div className="text-center py-10 text-sm text-gray-500 bg-gray-50 dark:bg-zinc-800/30 rounded border border-dashed border-gray-300 dark:border-zinc-700">
                                                        Bu adıma (ekrana) henüz hiçbir soru / alan eklemediniz.<br />
                                                        Aşağıdaki butonu kullanarak ekleyebilirsiniz.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {steps[activeStepIndex].fields.map((field, fIdx) => (
                                                            <div key={field.id} className="flex flex-col gap-4 bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 shadow-sm relative group">
                                                                {/* First Row: Field Name */}
                                                                <div className="w-full space-y-1">
                                                                    <label className="text-[10px] uppercase font-bold text-gray-500">Alan Adı / Soru</label>
                                                                    <Input
                                                                        placeholder="Örn: Lise Adı, veya Aylık Geliri"
                                                                        value={field.name}
                                                                        onChange={e => updateField(activeStepIndex, fIdx, 'name', e.target.value)}
                                                                        className="bg-white dark:bg-zinc-950 w-full"
                                                                    />
                                                                </div>

                                                                {/* Second Row: Type & Properties */}
                                                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full">
                                                                    <div className="flex-1 space-y-1 w-full sm:w-auto">
                                                                        <label className="text-[10px] uppercase font-bold text-gray-500">Veri Türü</label>
                                                                        <Select value={field.type} onValueChange={(val) => updateField(activeStepIndex, fIdx, 'type', val)}>
                                                                            <SelectTrigger className="bg-white dark:bg-zinc-950 w-full">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="text">Kısa Metin</SelectItem>
                                                                                <SelectItem value="textarea">Uzun Metin (Not)</SelectItem>
                                                                                <SelectItem value="number">Sayısal / Parasal Değer</SelectItem>
                                                                                <SelectItem value="date">Tarih</SelectItem>
                                                                                <SelectItem value="listbox">Seçmeli Kutu (Listbox)</SelectItem>
                                                                                <SelectItem value="file">Dosya Yükleme Alanı</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 pb-2 shrink-0">
                                                                        <Switch
                                                                            checked={field.required}
                                                                            onCheckedChange={checked => updateField(activeStepIndex, fIdx, 'required', checked)}
                                                                            id={`req-${field.id}`}
                                                                        />
                                                                        <label htmlFor={`req-${field.id}`} className="text-xs font-semibold text-gray-600 dark:text-gray-400 cursor-pointer">Zorunlu Sorulsun</label>
                                                                    </div>
                                                                    <button type="button" onClick={() => removeField(activeStepIndex, fIdx)} className="text-red-400 hover:text-red-600 sm:pb-2 p-2 sm:p-0 transition-colors self-end sm:self-auto shrink-0" title="Soruyu Sil">
                                                                        <Trash2 className="w-5 h-5 mx-auto" />
                                                                    </button>
                                                                </div>
                                                                {field.type === 'listbox' && (
                                                                    <div className="w-full space-y-1 pt-2 border-t border-gray-200 dark:border-zinc-700">
                                                                        <label className="text-[10px] uppercase font-bold text-gray-500">Seçenekler</label>
                                                                        <Input
                                                                            placeholder="Seçenekleri noktalı virgül (;) ile ayırarak yazın. Örn: Evet;Hayır"
                                                                            value={field.options || ""}
                                                                            onChange={e => updateField(activeStepIndex, fIdx, 'options', e.target.value)}
                                                                            className="bg-white dark:bg-zinc-950 w-full text-sm font-medium"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {/* PINNED BUTTON */}
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 shrink-0">
                                                <Button type="button" variant="outline" onClick={() => addField(activeStepIndex)} className="w-full border-dashed text-blue-600 bg-blue-50/50 hover:bg-blue-100">
                                                    <Plus className="w-5 h-5 mr-2" /> Bu Aşamaya Yeni Alan Ekle
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">Görüntülenecek ekran yok.</div>
                                    )}
                                </div>
                            </div>

                            {/* Fixed bottom action */}
                            <div className="mt-8 flex justify-end sticky bottom-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm p-4 border-t shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] rounded-b-lg">
                                <Button type="submit" disabled={loading} className="w-full sm:w-auto min-w-[200px] bg-blue-600 hover:bg-blue-700">
                                    {loading && <span className="mr-2 animate-spin">⌛</span>}
                                    Yayınla ve Formu Kaydet
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialForms.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-500 bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-200 dark:border-zinc-800 border-dashed">
                        <LayoutList className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" />
                        <p className="text-lg">Henüz hiç başvuru formu tanımlanmadı.</p>
                        <p className="text-sm mt-1">Öğrencilerin göreceği formları sıfırdan inşa edebilirsiniz.</p>
                    </div>
                ) : (
                    initialForms.map(form => {
                        const totalFields = form.steps.reduce((acc: number, step: any) => acc + (step.fields?.length || 0), 0);
                        return (
                            <div key={form.id} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm relative group flex flex-col h-full hover:shadow-md hover:border-blue-400 transition-all duration-300">
                                <div className="mb-4">
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white leading-tight">{form.title}</h3>
                                    {form.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{form.description}</p>}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-900/30">
                                            <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">{form.steps?.length || 0}</span>
                                            <span className="text-xs text-blue-600/70 font-medium uppercase tracking-wider">Adım / Ekran</span>
                                        </div>
                                        <div className="flex-1 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-900/30">
                                            <span className="block text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalFields}</span>
                                            <span className="text-xs text-emerald-600/70 font-medium uppercase tracking-wider">Soru Sayısı</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-3">
                                        <div className="text-xs font-semibold text-gray-400 mb-2 uppercase">Adımlar</div>
                                        <ul className="text-sm font-medium text-gray-700 dark:text-gray-300 space-y-1">
                                            {form.steps.slice(0, 3).map((s: any, i: number) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-700 text-gray-500 text-[10px] flex justify-center items-center flex-shrink-0">{i + 1}</span>
                                                    <span className="truncate">{s.title}</span>
                                                </li>
                                            ))}
                                            {form.steps.length > 3 && (
                                                <li className="text-xs text-gray-400 pl-7 pt-1 italic">...ve {form.steps.length - 3} adım daha</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                                        {format(new Date(form.createdAt), "d MMM yyyy", { locale: tr })}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleEdit(form)} className="text-sm font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1">
                                            <Edit className="w-4 h-4" /> Düzenle
                                        </button>
                                        <button onClick={() => handleDelete(form.id)} className="text-sm font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1">
                                            <Trash2 className="w-4 h-4" /> Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}
