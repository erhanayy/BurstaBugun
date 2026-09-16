"use client";

import { useState, useEffect, useRef } from "react";
import { getMyRooms, getRoomMessages, sendMessage, toggleRoomLock } from "@/lib/actions/chat";
import { Search, Send, Lock, Unlock, Users, Info, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Room = {
    id: string;
    name: string;
    type: 'direct' | 'group';
    isLocked: boolean;
    lastMessage: string | null;
    lastMessageAt: Date;
    unreadCount: number;
    myRole: 'admin' | 'member';
};

type Message = {
    id: string;
    roomId: string;
    senderId: string | null;
    content: string;
    isSystemMessage: boolean;
    createdAt: Date;
    sender?: { fullName: string };
};

export default function ChatLayout({ initialRooms, currentUserId, isAdmin }: { initialRooms: Room[], currentUserId: string, isAdmin: boolean }) {
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeRoom = rooms.find(r => r.id === activeRoomId);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Polling logic
    useEffect(() => {
        const interval = setInterval(async () => {
            // Update room list (for badges/last messages)
            const roomRes = await getMyRooms();
            if (roomRes.success && roomRes.rooms) {
                setRooms(roomRes.rooms as any);
            }

            // Update active room messages
            if (activeRoomId) {
                const msgRes = await getRoomMessages(activeRoomId);
                if (msgRes.success && msgRes.messages) {
                    setMessages(msgRes.messages as any);
                }
            }
        }, 5000); // 5 seconds polling
        return () => clearInterval(interval);
    }, [activeRoomId]);

    // Load messages when room changes
    useEffect(() => {
        if (!activeRoomId) return;
        
        const load = async () => {
            setIsLoadingMessages(true);
            const msgRes = await getRoomMessages(activeRoomId);
            if (msgRes.success && msgRes.messages) {
                setMessages(msgRes.messages as any);
                
                // Clear unread badge locally for instant UI update
                setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, unreadCount: 0 } : r));
            }
            setIsLoadingMessages(false);
        };
        load();
    }, [activeRoomId]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRoomId || !messageInput.trim() || isSending) return;

        const content = messageInput;
        setMessageInput(""); // Optimistic clear
        setIsSending(true);
        
        // Optimistic UI
        const tempMsg: Message = {
            id: 'temp-' + Date.now(),
            roomId: activeRoomId,
            senderId: currentUserId,
            content,
            isSystemMessage: false,
            createdAt: new Date(),
        };
        setMessages(prev => [...prev, tempMsg]);

        const res = await sendMessage(activeRoomId, content);
        if (!res.success) {
            alert(res.error || "Mesaj gönderilemedi");
            // Rollback optimistic (in real app, we'd remove it, but next polling handles it usually)
        }
        setIsSending(false);
    };

    const handleToggleLock = async () => {
        if (!activeRoomId || !activeRoom) return;
        const res = await toggleRoomLock(activeRoomId, !activeRoom.isLocked);
        if (res.success) {
            setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, isLocked: !r.isLocked } : r));
        } else {
            alert(res.error);
        }
    };

    const filteredRooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const canSend = activeRoom && (!activeRoom.isLocked || activeRoom.myRole === 'admin');

    return (
        <>
            {/* Sidebar (Rooms) */}
            <div className={`w-full md:w-80 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mesajlar</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input 
                            placeholder="Sohbet ara..." 
                            className="pl-9 bg-gray-50 dark:bg-zinc-800 border-none h-9 text-sm"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredRooms.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500">Sohbet bulunamadı.</div>
                    ) : (
                        <div className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                            {filteredRooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => setActiveRoomId(room.id)}
                                    className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors flex gap-3 ${activeRoomId === room.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                        {room.type === 'group' ? <Users className="w-6 h-6" /> : <UserAvatar name={room.name} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">{room.name}</h3>
                                            {room.lastMessageAt && (
                                                <span className="text-[11px] text-gray-400 shrink-0">
                                                    {format(new Date(room.lastMessageAt), 'HH:mm')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {room.isLocked && <Lock className="w-3 h-3 inline mr-1 text-gray-400" />}
                                                {room.lastMessage || 'Henüz mesaj yok'}
                                            </p>
                                            {room.unreadCount > 0 && (
                                                <span className="shrink-0 bg-blue-600 text-white text-[10px] font-bold px-1.5 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center">
                                                    {room.unreadCount > 99 ? '99+' : room.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#efeae2] dark:bg-zinc-950/50 relative ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
                {!activeRoomId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center mb-4 text-blue-500">
                            <MessageSquare className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">BurstaBugün Mesajlaşma</h3>
                        <p className="text-sm max-w-sm">Sol taraftan bir sohbet seçerek mesajlaşmaya başlayabilirsiniz.</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 px-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <button className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full" onClick={() => setActiveRoomId(null)}>
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                                    {activeRoom?.type === 'group' ? <Users className="w-5 h-5" /> : <UserAvatar name={activeRoom?.name || ""} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{activeRoom?.name}</h3>
                                    <p className="text-xs text-gray-500">
                                        {activeRoom?.type === 'group' ? 'Grup Sohbeti' : 'Birebir Sohbet'}
                                    </p>
                                </div>
                            </div>

                            {activeRoom?.type === 'group' && isAdmin && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={activeRoom.isLocked ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-gray-500"}
                                    onClick={handleToggleLock}
                                    title={activeRoom.isLocked ? "Grubu Yoruma Aç" : "Grubu Yoruma Kapat"}
                                >
                                    {activeRoom.isLocked ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
                                    {activeRoom.isLocked ? "Kilitli" : "Açık"}
                                </Button>
                            )}
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {isLoadingMessages && messages.length === 0 ? (
                                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const showName = !isMe && activeRoom?.type === 'group' && (i === 0 || messages[i-1].senderId !== msg.senderId);

                                    if (msg.isSystemMessage) {
                                        return (
                                            <div key={msg.id} className="flex justify-center my-4">
                                                <div className="bg-yellow-100/80 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs px-3 py-1.5 rounded-md border border-yellow-200/50">
                                                    {msg.content}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {showName && (
                                                <span className="text-xs text-gray-500 ml-1 mb-1 font-medium">
                                                    {msg.sender?.fullName || 'Bilinmiyor'}
                                                </span>
                                            )}
                                            <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                                                isMe 
                                                    ? 'bg-[#dcf8c6] dark:bg-emerald-900/40 text-gray-900 dark:text-gray-100 rounded-tr-sm shadow-sm' 
                                                    : 'bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 rounded-tl-sm shadow-sm border border-gray-100 dark:border-zinc-800'
                                            }`}>
                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                                <div className="text-[10px] text-gray-500 text-right mt-1 opacity-70">
                                                    {format(new Date(msg.createdAt), 'HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        {canSend ? (
                            <form onSubmit={handleSend} className="bg-[#f0f2f5] dark:bg-zinc-900 p-3 flex gap-2 shrink-0">
                                <Input 
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    placeholder="Bir mesaj yazın..." 
                                    className="flex-1 rounded-full bg-white dark:bg-zinc-950 border-none shadow-sm focus-visible:ring-1 focus-visible:ring-blue-500"
                                />
                                <Button 
                                    type="submit" 
                                    disabled={!messageInput.trim() || isSending}
                                    className="rounded-full w-10 h-10 p-0 shrink-0 bg-blue-600 hover:bg-blue-700 shadow-sm disabled:opacity-50"
                                >
                                    <Send className="w-4 h-4 ml-1" />
                                </Button>
                            </form>
                        ) : (
                            <div className="bg-[#f0f2f5] dark:bg-zinc-900 p-4 text-center text-sm text-gray-500 shrink-0">
                                <Info className="w-4 h-4 inline mr-2" />
                                Bu gruba sadece yöneticiler mesaj gönderebilir.
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function UserAvatar({ name }: { name: string }) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return <span className="text-xl font-medium">{initial}</span>;
}
