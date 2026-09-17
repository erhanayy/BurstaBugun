"use server";

import { db } from "../db";
import { chatRooms, chatRoomMembers, chatMessages, chatMessageReads, users, parametersTenantSeasons, applications, funds, fundContributors, tenantUsers } from "../db/schema";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { getCurrentTenant } from "../data/tenant";
import { revalidatePath } from "next/cache";

// Sadece odaya üye olup olmadığını kontrol eden yardımcı fonksiyon
async function isUserInRoom(roomId: string, userId: string) {
    const member = await db.query.chatRoomMembers.findFirst({
        where: and(
            eq(chatRoomMembers.roomId, roomId),
            eq(chatRoomMembers.userId, userId)
        )
    });
    return member;
}

export async function syncDynamicGroups() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return;

    // Get active season
    const activeSeasonParam = await db.query.parametersTenantSeasons.findFirst({
        where: eq(parametersTenantSeasons.tenantId, tenantData.tenantId),
        orderBy: [desc(parametersTenantSeasons.isActive), desc(parametersTenantSeasons.seasonStartDate)]
    });
    
    if (!activeSeasonParam) return;
    const seasonName = activeSeasonParam.period; // e.g., '2026-2027'

    // Group Names
    const bursiyerGroupName = `${seasonName} Bursiyer`;
    const bursverenGroupName = `${seasonName} Bursveren`;

    // 1. Ensure Bursiyer Group
    let bursiyerGroup = await db.query.chatRooms.findFirst({
        where: and(
            eq(chatRooms.tenantId, tenantData.tenantId),
            eq(chatRooms.name, bursiyerGroupName),
            eq(chatRooms.type, 'group')
        )
    });

    if (!bursiyerGroup) {
        const [newGroup] = await db.insert(chatRooms).values({
            tenantId: tenantData.tenantId,
            name: bursiyerGroupName,
            type: 'group',
            isLocked: true // Varsayılan kilitli
        }).returning();
        bursiyerGroup = newGroup;
    }

    // 2. Ensure Bursveren Group
    let bursverenGroup = await db.query.chatRooms.findFirst({
        where: and(
            eq(chatRooms.tenantId, tenantData.tenantId),
            eq(chatRooms.name, bursverenGroupName),
            eq(chatRooms.type, 'group')
        )
    });

    if (!bursverenGroup) {
        const [newGroup] = await db.insert(chatRooms).values({
            tenantId: tenantData.tenantId,
            name: bursverenGroupName,
            type: 'group',
            isLocked: true // Varsayılan kilitli
        }).returning();
        bursverenGroup = newGroup;
    }

    // Find Active Bursiyerler
    const activeBursiyerler = await db.query.applications.findMany({
        where: and(
            eq(applications.tenantId, tenantData.tenantId),
            eq(applications.status, 'active')
        )
    });
    const bursiyerUserIds = activeBursiyerler.map(a => a.userId);

    // Find Bursverenler (Funds' creators/contributors)
    const activeFunds = await db.query.funds.findMany({
        where: eq(funds.tenantId, tenantData.tenantId)
    });
    const bursverenUserIds = new Set(activeFunds.map(f => f.userId));
    // Also include contributors
    const contributors = await db.query.fundContributors.findMany();
    contributors.forEach(c => {
        if (c.userId) bursverenUserIds.add(c.userId);
    });

    // Sync Members function
    const syncGroupMembers = async (roomId: string, targetUserIds: string[]) => {
        const existing = await db.query.chatRoomMembers.findMany({ where: eq(chatRoomMembers.roomId, roomId) });
        const existingIds = new Set(existing.map(e => e.userId));
        
        // Admins should always be in these groups
        const admins = await db.query.tenantUsers.findMany({
            where: and(
                eq(tenantUsers.tenantId, tenantData.tenantId),
                inArray(tenantUsers.role, ['admin', 'superadmin'])
            )
        });
        
        const allTargets = new Set([...targetUserIds, ...admins.map(a => a.userId)]);

        // Find missing
        const toAdd = Array.from(allTargets).filter(id => !existingIds.has(id));
        
        if (toAdd.length > 0) {
            await db.insert(chatRoomMembers).values(
                toAdd.map(uid => ({
                    roomId: roomId,
                    userId: uid,
                    role: admins.some(a => a.userId === uid) ? 'admin' : 'member'
                }))
            );
        }
    };

    if (bursiyerGroup) await syncGroupMembers(bursiyerGroup.id, bursiyerUserIds);
    if (bursverenGroup) await syncGroupMembers(bursverenGroup.id, Array.from(bursverenUserIds));
}

export async function getMyRooms() {
    // Mevcut kodunuzdan önce çağırın
    await syncDynamicGroups();

    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: 'Oturum bulunamadı' };

    // Kullanıcının üye olduğu odaları getir
    const members = await db.query.chatRoomMembers.findMany({
        where: eq(chatRoomMembers.userId, tenantData.userId),
        with: {
            room: {
                with: {
                    messages: {
                        orderBy: [desc(chatMessages.createdAt)],
                        limit: 1, // Son mesajı al
                    }
                }
            }
        }
    });

    // Her oda için okunmamış mesaj sayısını bul
    // (Okunmamış = mesaj var, ancak kullanıcının chatMessageReads kaydı yok veya readAt < mesaj.createdAt)
    // Basitlik adına Drizzle ile okunmamış sayısı: (Toplam Mesaj - Okunan Mesaj)
    
    const roomsWithDetails = await Promise.all(members.map(async (m) => {
        const room = m.room;
        
        // Okunmamış mesaj sayısı
        const unreadResult = await db.execute(sql`
            SELECT COUNT(*) as count 
            FROM chat_messages cm
            LEFT JOIN chat_message_reads cmr ON cm.id = cmr.message_id AND cmr.user_id = ${tenantData.userId}
            WHERE cm.room_id = ${room.id} AND cmr.id IS NULL AND cm.sender_id != ${tenantData.userId}
        `);
        const unreadCount = Number(unreadResult[0]?.count || 0);

        // Eğer direct ise karşı tarafın adını bul
        let displayName = room.name;
        if (room.type === 'direct') {
            const otherMember = await db.query.chatRoomMembers.findFirst({
                where: and(
                    eq(chatRoomMembers.roomId, room.id),
                    sql`${chatRoomMembers.userId} != ${tenantData.userId}`
                ),
                with: { user: true }
            });
            displayName = otherMember?.user?.fullName || "Bilinmeyen Kullanıcı";
        }

        return {
            id: room.id,
            name: displayName || "İsimsiz Grup",
            type: room.type,
            isLocked: room.isLocked,
            lastMessage: room.messages[0]?.content || null,
            lastMessageAt: room.messages[0]?.createdAt || room.createdAt,
            unreadCount,
            myRole: m.role
        };
    }));

    // Son mesaja göre sırala
    roomsWithDetails.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    return { success: true, rooms: roomsWithDetails };
}

export async function getRoomMessages(roomId: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: 'Oturum bulunamadı' };

    const member = await isUserInRoom(roomId, tenantData.userId);
    if (!member) return { success: false, error: 'Bu odayı görüntüleme yetkiniz yok.' };

    const messages = await db.query.chatMessages.findMany({
        where: eq(chatMessages.roomId, roomId),
        orderBy: [desc(chatMessages.createdAt)],
        limit: 100, // Son 100 mesaj
        with: {
            sender: true
        }
    });

    // Mesajları okunmuş olarak işaretle
    if (messages.length > 0) {
        // Okunmamışları bulup insert yap
        const unreadMessageIds = await db.execute(sql`
            SELECT cm.id 
            FROM chat_messages cm
            LEFT JOIN chat_message_reads cmr ON cm.id = cmr.message_id AND cmr.user_id = ${tenantData.userId}
            WHERE cm.room_id = ${roomId} AND cmr.id IS NULL AND cm.sender_id != ${tenantData.userId}
        `);
        
        const idsToMark = unreadMessageIds.map(row => row.id as string);
        if (idsToMark.length > 0) {
            await db.insert(chatMessageReads).values(
                idsToMark.map(id => ({
                    messageId: id,
                    userId: tenantData.userId
                }))
            );
        }
    }

    // Arayüz için eskiden yeniye sıralı gönder
    return { success: true, messages: messages.reverse() };
}

export async function sendMessage(roomId: string, content: string) {
    const tenantData = await getCurrentTenant();
    if (!tenantData) return { success: false, error: 'Oturum bulunamadı' };

    if (!content || !content.trim()) return { success: false, error: 'Mesaj boş olamaz.' };

    const member = await isUserInRoom(roomId, tenantData.userId);
    if (!member) return { success: false, error: 'Bu odaya mesaj gönderme yetkiniz yok.' };

    const room = await db.query.chatRooms.findFirst({ where: eq(chatRooms.id, roomId) });
    if (!room) return { success: false, error: 'Oda bulunamadı.' };

    if (room.isLocked && member.role !== 'admin') {
        return { success: false, error: 'Bu grup yoruma kapalıdır.' };
    }

    try {
        await db.insert(chatMessages).values({
            roomId,
            senderId: tenantData.userId,
            content: content.trim()
        });

        revalidatePath('/dashboard/messages');
        return { success: true };
    } catch (error) {
        console.error("Mesaj gönderme hatası:", error);
        return { success: false, error: 'Mesaj gönderilemedi.' };
    }
}

// Yönetici fonksiyonları
export async function createGroup(name: string, userIds: string[]) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.role !== 'admin' && tenantData.role !== 'superadmin')) {
        return { success: false, error: 'Yetkisiz işlem.' };
    }

    try {
        const [room] = await db.insert(chatRooms).values({
            tenantId: tenantData.tenantId,
            name,
            type: 'group',
            createdBy: tenantData.userId
        }).returning();

        // Kendini admin olarak ekle
        await db.insert(chatRoomMembers).values({
            roomId: room.id,
            userId: tenantData.userId,
            role: 'admin'
        });

        // Diğerlerini ekle
        if (userIds.length > 0) {
            await db.insert(chatRoomMembers).values(
                userIds.map(uid => ({
                    roomId: room.id,
                    userId: uid,
                    role: 'member' as const
                }))
            );
        }

        revalidatePath('/dashboard/messages');
        return { success: true, roomId: room.id };
    } catch (e) {
        return { success: false, error: 'Grup oluşturulamadı.' };
    }
}

export async function toggleRoomLock(roomId: string, isLocked: boolean) {
    const tenantData = await getCurrentTenant();
    if (!tenantData || (tenantData.role !== 'admin' && tenantData.role !== 'superadmin')) {
        return { success: false, error: 'Yetkisiz işlem.' };
    }

    try {
        await db.update(chatRooms).set({ isLocked }).where(eq(chatRooms.id, roomId));
        
        // Sistem mesajı at
        await db.insert(chatMessages).values({
            roomId,
            content: isLocked ? "Grup yöneticiler tarafından yoruma kapatıldı." : "Grup yoruma açıldı.",
            isSystemMessage: true
        });

        revalidatePath('/dashboard/messages');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'İşlem başarısız.' };
    }
}
