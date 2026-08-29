const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await pool.query("INSERT INTO moka_tokens (user_id, token_code) VALUES ('1fef1b24-9b2f-410a-b365-5eb7dbd48600', 'f9aa63f3-6593-4383-8f51-68309b97b765')");
  console.log("Token inserted for 1fef1b24");
  process.exit(0);
})();
