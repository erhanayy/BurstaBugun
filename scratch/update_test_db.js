const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await pool.query("UPDATE payments SET payment_method = 'subscription' WHERE fund_id = '1c83c2cd-7817-4cf6-9c15-1891d421a869'");
  console.log("Updated test records");
  process.exit(0);
})();
