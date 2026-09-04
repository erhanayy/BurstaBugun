import { db } from './lib/db';
import { users } from './lib/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    const tempPassword = "FB" + Math.floor(100000 + Math.random() * 900000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    console.log("Looking for user: gg@fbiad.org");
    
    const user = await db.query.users.findFirst({
        where: eq(users.email, "gg@fbiad.org")
    });
    
    if (!user) {
        console.log("User not found!");
        process.exit(1);
    }
    
    await db.update(users)
        .set({ 
            password: hashedPassword
        })
        .where(eq(users.id, user.id));
        
    console.log(`Update successful!`);
    console.log(`New Email: gg@fbiad.org`);
    console.log(`Temp Password: ${tempPassword}`);
    process.exit(0);
}

main().catch(console.error);
