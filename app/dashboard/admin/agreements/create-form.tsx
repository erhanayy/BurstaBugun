"use client";

import { useState } from "react";
import { createContractVersion } from "@/lib/actions/agreements";
import { Button } from "@/components/ui/button";

export function CreateContractForm() {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formEl = e.currentTarget;
        setLoading(true);
        const formData = new FormData(formEl);

        try {
            await createContractVersion({
                type: formData.get("type") as any,
                title: formData.get("title") as string,
                version: formData.get("version") as string,
                content: formData.get("content") as string,
            });
            alert("Yeni sözleşme versiyonu başarıyla yayınlandı. Kullanıcılar ana sayfaya giriş yaptıklarında imzalamak zorunda kalacaklar.");
            formEl.reset();
        } catch (error) {
            console.error(error);
            alert("Hata oluştu");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1">
            <div>
                <label className="block text-sm font-medium mb-1">Sözleşme Tipi</label>
                <select name="type" required className="w-full text-sm border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5">
                    <option value="USER_AGREEMENT">Kullanıcı (Portal) Sözleşmesi</option>
                    <option value="KVKK">KVKK ve Veri Paylaşım Sözleşmesi</option>
                    <option value="STUDENT_AGREEMENT">Öğrenci Yalan Beyan Taahhütnamesi</option>
                    <option value="OTHER">Diğer</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <input name="title" required placeholder="Örn: Güncel Uygulama Sözleşmesi" className="w-full text-sm border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5" />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Versiyon</label>
                <input name="version" required placeholder="Örn: 1.0.2 / 2026-Nisan" className="w-full text-sm border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5" />
            </div>

            <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Sözleşme İçeriği</label>
                <textarea name="content" required placeholder="Sözleşme metnini buraya yapıştırın..." rows={6} className="w-full h-full min-h-[150px] text-sm border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 rounded-lg p-2.5 resize-y"></textarea>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 mt-auto">
                {loading ? "Kaydediliyor..." : "Yeni Versiyonu Yayınla"}
            </Button>
        </form>
    );
}
