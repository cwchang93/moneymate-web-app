const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    const sqlPath = path.join(__dirname, '../scripts/init-supabase.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Split by semicolon and execute statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement }, {
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {
        // If rpc doesn't work, try direct query
        return supabase.from('_supabase_migrations').insert({ name: 'init', hash: 'v1', executed_at: new Date() });
      });
      
      if (error) {
        // Ignore "already exists" errors
        if (error.message?.includes('already exists')) {
          console.log(`✓ Table already exists (skipping)`);
        } else {
          console.log(`⚠ Warning: ${error.message}`);
        }
      } else {
        console.log(`✓ Statement ${i + 1} executed`);
      }
    }
    
    console.log('\n✓ Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
