import { db } from './lib/db';
import { applications, references } from './lib/db/schema';
import { eq, inArray, and } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    console.log("Looking for students who bypassed references...");
    
    // Find all applications in pool, selected, or active
    const apps = await db.query.applications.findMany({
        where: inArray(applications.status, ['in_pool', 'selected', 'active']),
        with: {
            references: true,
            user: true
        }
    });
    
    console.log(`Found ${apps.length} applications in pool/selected/active.`);
    
    let count = 0;
    
    for (const app of apps) {
        // Count approved references
        const approvedRefs = app.references.filter(r => r.status === 'approved');
        
        // If they have less than 2 approved references, they must have bypassed via exemption!
        if (approvedRefs.length < 2) {
            console.log(`Fixing ${app.user?.fullName} (App ID: ${app.id}) - Approved refs: ${approvedRefs.length}`);
            
            // Set isExemptionRequested to true so they show up as "Eski Öğrenci"
            await db.update(applications)
                .set({ isExemptionRequested: true })
                .where(eq(applications.id, app.id));
                
            count++;
        }
    }
    
    console.log(`Successfully fixed ${count} old students.`);
    process.exit(0);
}

main().catch(console.error);
