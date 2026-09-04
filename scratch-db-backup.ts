import { db } from './lib/db';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function backupDatabase() {
    console.log("Starting database backup...");

    // Get all tables in the public schema
    const result = await db.execute(sql`
        SELECT tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT LIKE 'bc_%' 
        AND tablename != 'drizzle_migrations';
    `);

    const tables = result.rows as { tablename: string }[];
    
    console.log(`Found ${tables.length} tables to backup.`);

    for (const table of tables) {
        const tableName = table.tablename;
        const backupName = `bc_20260901_${tableName}`;
        
        console.log(`Backing up ${tableName} to ${backupName}...`);
        
        try {
            // Drop if exists to avoid errors on rerun
            await db.execute(sql.raw(`DROP TABLE IF EXISTS ${backupName};`));
            
            // Create backup table
            await db.execute(sql.raw(`CREATE TABLE ${backupName} AS SELECT * FROM ${tableName};`));
            console.log(`✅ Success: ${backupName}`);
        } catch (error: any) {
            console.error(`❌ Error backing up ${tableName}:`, error.message);
        }
    }

    console.log("Database backup completed successfully.");
    process.exit(0);
}

backupDatabase().catch(console.error);
