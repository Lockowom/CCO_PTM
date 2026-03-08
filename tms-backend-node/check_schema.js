const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vtrtyzbgpsvqwbfoudaf.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0cnR5emJncHN2cXdiZm91ZGFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzMwMDQsImV4cCI6MjA4NjMwOTAwNH0.NijuPeeOMwLyM8H_AiagKXEut1TMr2qkQZ6CHLn4RSM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase.from('tms_usuarios').select('*').limit(1);
    console.log(error ? 'Error: ' + error.message : Object.keys(data[0] || {}).join(', '));
}

run();
