import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    await db.execute(sql`ALTER TABLE "parameters_tenant_seasons" ADD COLUMN IF NOT EXISTS "global_student_quota" integer;`);
    console.log("Migration applied successfully!");
    process.exit(0);
}
main().catch(console.error);
