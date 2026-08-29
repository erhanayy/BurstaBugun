const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await pool.query("INSERT INTO moka_tokens (user_id, token_code) VALUES ('6db8eece-6bd8-4191-8df4-60def0978c81', 'f9aa63f3-6593-4383-8f51-68309b97b765')");
  console.log("Token inserted");
  process.exit(0);
})();
