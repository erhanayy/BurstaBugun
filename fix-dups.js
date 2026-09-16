const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const res = await pool.query(`
        SELECT * FROM payments 
        WHERE notes LIKE 'Web üzerinden gelen EFT/Havale ödemesi. Bağış ID:%'
    `);
    
    console.log("Found assigned donations payments:", res.rows.length);
    for (const p of res.rows) {
        // Extract donation ID
        const match = p.notes.match(/Bağış ID: (.*)/);
        if (match) {
            const donationId = match[1];
            
            const manualRes = await pool.query(`
                SELECT * FROM payments 
                WHERE amount = $1 AND payment_method = 'wire_transfer' AND id != $2
                AND user_id = $3
            `, [p.amount, p.id, p.user_id]);
            
            if (manualRes.rows.length > 0) {
                console.log(`Fixing duplicate for user ${p.user_id}...`);
                
                await pool.query('BEGIN');
                try {
                    // 1. Delete duplicate payment
                    await pool.query(`DELETE FROM payments WHERE id = $1`, [p.id]);
                    
                    // 2. Reduce fundContributors amount
                    await pool.query(`
                        UPDATE fund_contributors 
                        SET amount = amount - $1
                        WHERE user_id = $2 AND fund_id = $3
                    `, [p.amount, p.user_id, p.fund_id]);
                    
                    // 3. Reduce funds collected_amount
                    await pool.query(`
                        UPDATE funds 
                        SET collected_amount = collected_amount - $1
                        WHERE id = $2
                    `, [p.amount, p.fund_id]);
                    
                    await pool.query('COMMIT');
                    console.log(`Duplicate ${p.id} removed and balances updated.`);
                } catch(e) {
                    await pool.query('ROLLBACK');
                    console.error("Error fixing duplicate", e);
                }
            }
        }
    }
    pool.end();
}
run();
