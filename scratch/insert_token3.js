const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await pool.query("INSERT INTO moka_tokens (user_id, token_code) VALUES ('1fef1b24-4fb1-4882-87b1-848ed0815488', 'f9aa63f3-6593-4383-8f51-68309b97b765')");
  console.log("Token inserted for 1fef1b24...");
  process.exit(0);
})();
