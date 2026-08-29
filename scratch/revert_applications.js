const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const updateRes = await pool.query(`
    UPDATE applications 
    SET user_id = '1fef1b24-4fb1-4882-87b1-848ed0815488' 
    WHERE user_id = '6db8eece-6bd8-4191-8df4-60def0978c81'
  `);
  console.log("Reverted applications:", updateRes.rowCount);
  process.exit(0);
})();
