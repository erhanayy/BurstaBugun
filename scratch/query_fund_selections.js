const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const res = await pool.query("SELECT * FROM fund_selections WHERE sponsor_id::text LIKE '1fef1b24%' OR sponsor_id::text LIKE '6db8eece%'");
  console.log("Fund Selections:", res.rows);
  process.exit(0);
})();
