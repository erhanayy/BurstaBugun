const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const res = await pool.query(`
    SELECT p.id, f.title as fund_name, p.status, p.payment_method, u.id as sponsor_id, u.full_name as sponsor_name
    FROM payments p
    INNER JOIN funds f ON p.fund_id = f.id
    INNER JOIN applications a ON p.application_id = a.id
    LEFT JOIN fund_selections fs ON fs.fund_id = p.fund_id AND fs.application_id = p.application_id
    LEFT JOIN users u ON fs.sponsor_id = u.id
    WHERE p.status = 'pending' AND p.payment_method = 'subscription'
  `);
  console.log("Dashboard Data:", res.rows);
  process.exit(0);
})();
