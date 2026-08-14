import { db } from '../lib/db';
import { applicationForms, applications } from '../lib/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
    const forms = await db.query.applicationForms.findMany({
        limit: 1,
        orderBy: [desc(applicationForms.createdAt)]
    });
    console.log("FORM STEPS:");
    if (forms.length > 0) {
        console.log(JSON.stringify(forms[0].steps, null, 2));
    }

    const apps = await db.query.applications.findMany({
        limit: 1,
        orderBy: [desc(applications.createdAt)]
    });
    console.log("\nANSWERS JSON:");
    if (apps.length > 0) {
        console.log(apps[0].answersJson);
    }
}

main().catch(console.error).finally(() => process.exit(0));
