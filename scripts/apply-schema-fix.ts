import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Applying schema changes directly...");
    try {
        // 1. Add tenant_id column
        await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tenant_id" uuid REFERENCES "tenants"("id");`);
        console.log("tenant_id column added.");
        
        // 2. Drop the existing unique constraint on phone_number
        await db.execute(sql`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_phone_number_unique";`);
        console.log("users_phone_number_unique dropped.");
        
        // 3. Add the new composite unique constraint
        await db.execute(sql`ALTER TABLE "users" ADD CONSTRAINT "users_phone_number_tenant_id_unique" UNIQUE ("phone_number", "tenant_id");`);
        console.log("users_phone_number_tenant_id_unique added.");
        
        console.log("Schema changes applied successfully.");
    } catch (e) {
        console.error("Error applying schema:", e);
    }
    process.exit(0);
}

main();
