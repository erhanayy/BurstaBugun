"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/lib/actions/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, Loader2 } from "lucide-react";

type UserOption = {
    id: string;
    name: string;
    role: string;
};

export default function NewGroupForm({ users }: { users: UserOption[] }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
    }, [users, search]);

    const handleToggle = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleSelectAllFiltered = () => {
        const unselectedFiltered = filteredUsers.filter(u => !selectedIds.includes(u.id));
        if (unselectedFiltered.length > 0) {
            setSelectedIds(prev => [...prev, ...unselectedFiltered.map(u => u.id)]);
        } else {
            const filteredIds = filteredUsers.map(u => u.id);
            setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return setError("Grup adı zorunludur.");
        if (selectedIds.length === 0) return setError("En az 1 kişi seçmelisiniz.");

        setIsLoading(true);
        setError(null);
        
        try {
            const res = await createGroup(name.trim(), selectedIds);
            if (res.success) {
                router.push("/dashboard/messages");
                router.refresh();
            } else {
                setError(res.error || "Grup oluşturulamadı.");
            }
        } catch (err) {
            setError("Sunucu hatası.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Grup Adı</Label>
                <Input 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Örn: Hukuk Fakültesi Öğrencileri"
                    required
                />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                    <Label>Katılımcılar ({selectedIds.length} seçildi)</Label>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder="Kişi ara..." 
                            className="pl-9 h-8 text-sm"
                        />
                    </div>
                </div>

                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg max-h-96 overflow-y-auto">
                    <div className="p-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2 sticky top-0 bg-gray-50 dark:bg-zinc-900 z-10">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={handleSelectAllFiltered}
                        >
                            <Users className="w-3 h-3 mr-1" /> Görünenleri Seç / Kaldır
                        </Button>
                    </div>
                    
                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                        {filteredUsers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">Kişi bulunamadı.</div>
                        ) : (
                            filteredUsers.map(user => (
                                <label key={user.id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer">
                                    <Checkbox 
                                        checked={selectedIds.includes(user.id)} 
                                        onCheckedChange={(c) => handleToggle(user.id, c as boolean)}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Grubu Oluştur
                </Button>
            </div>
        </form>
    );
}
