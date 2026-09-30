import pkg from 'pg';
const { Client } = pkg;
const client = new Client({ 
  connectionString: 'postgresql://postgres:xyz%40%2312345prasad@db.uluntujrwgxolgjyoglu.supabase.co:5432/postgres' 
});

await client.connect();
console.log('Connected.\n');

const tables = ['profiles', 'study_plans', 'questionnaire_responses', 'feedback'];
for (const t of tables) {
  const r = await client.query(
    `SELECT column_name, data_type, is_nullable, column_default 
     FROM information_schema.columns 
     WHERE table_schema='public' AND table_name=$1 
     ORDER BY ordinal_position`, 
    [t]
  );
  console.log('=== TABLE:', t.toUpperCase(), '===');
  r.rows.forEach(c => console.log(`  ${c.column_name} | ${c.data_type} | nullable:${c.is_nullable} | default:${c.column_default}`));
  console.log('');
}

// Also get all constraints
const constraints = await client.query(`
  SELECT tc.table_name, tc.constraint_name, tc.constraint_type, cc.check_clause
  FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
  WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
  ORDER BY tc.table_name
`);
console.log('=== CHECK CONSTRAINTS ===');
constraints.rows.forEach(c => console.log(`  ${c.table_name} | ${c.constraint_name} | ${c.check_clause}`));

await client.end();
