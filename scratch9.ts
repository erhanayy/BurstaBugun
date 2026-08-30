import { db } from "./lib/db";
import { users } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function run() {
    const dbUser = await db.query.users.findFirst({
        where: eq(users.id, '6db8eece-6bd8-4191-8df4-60def0978c81')
    });
    
    const adSoyad = dbUser?.fullName || 'Bilinmeyen Kullanıcı';
    const isArdaErel = adSoyad.toLowerCase().includes('arda erel');
    console.log({ adSoyad, isArdaErel });
}
run();
