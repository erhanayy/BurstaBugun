const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const res = await pool.query("SELECT id FROM users WHERE id::text LIKE '1fef1b24%'");
  console.log("Users:", res.rows);
  const res2 = await pool.query("SELECT id FROM users WHERE id::text LIKE '6db8eece%'");
  console.log("Users 2:", res2.rows);
  process.exit(0);
})();
