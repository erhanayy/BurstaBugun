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
            // Check if there's a manual payment with same amount on the same day for the same user?
            // Actually, the original payment was created by submitManualPayment.
            const manualRes = await pool.query(`
                SELECT * FROM payments 
                WHERE amount = $1 AND payment_method = 'wire_transfer' AND id != $2
                AND user_id = $3
            `, [p.amount, p.id, p.user_id]);
            
            if (manualRes.rows.length > 0) {
                console.log(`Duplicate found for user ${p.user_id}!`);
                console.log("Assigned Payment ID:", p.id, "Amount:", p.amount);
                console.log("Original Manual Payment ID:", manualRes.rows[0].id);
                console.log("---");
            }
        }
    }
    pool.end();
}
run();
