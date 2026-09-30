import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

async function run() {
  const client = new Client({
    connectionString: "postgresql://postgres:xyz%40%2312345prasad@db.uluntujrwgxolgjyoglu.supabase.co:5432/postgres",
  });
  
  try {
    await client.connect();
    console.log("Connected to Supabase.");

    const files = [
      '../supabase_setup.sql',
      '../supabase_setup_part2.sql',
      '../supabase_setup_part3.sql',
      '../supabase_setup_part4.sql',
      '../supabase_drop_constraints.sql',
      '../supabase_schema_fix.sql',
      '../supabase_fix_profiles.sql',
      '../supabase_final_fix.sql'
    ];

    for (const file of files) {
      if (fs.existsSync(file)) {
        console.log(`Executing ${file}...`);
        const sql = fs.readFileSync(file, 'utf8');
        try {
          await client.query(sql);
          console.log(`Success: ${file}`);
        } catch (queryErr) {
          console.error(`Error in ${file}:`, queryErr.message);
        }
      }
    }
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    await client.end();
  }
}

run();
