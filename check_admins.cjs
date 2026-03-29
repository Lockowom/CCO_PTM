const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './tms-backend-node/.env' });
const fs = require('fs');

let envContent = '';
try {
  envContent = fs.readFileSync('./tms-backend-node/CCO_PTM/.env', 'utf8');
} catch(e) {}

const supabaseUrlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const supabaseKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = supabaseUrlMatch ? supabaseUrlMatch[1].trim() : process.env.SUPABASE_URL;
const key = supabaseKeyMatch ? supabaseKeyMatch[1].trim() : process.env.SUPABASE_KEY;

if (!url || !key) {
    console.log("No se encontraron credenciales de Supabase.");
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkAdmins() {
  const { data, error } = await supabase
    .from('tms_usuarios')
    .select('id, nombre, email, rol, activo, es_admin_delegado')
    .ilike('rol', '%ADMIN%');

  if (error) {
    console.error("Error consultando BD:", error);
    return;
  }
  
  console.log("=== LISTA DE ADMINISTRADORES EN LA BASE DE DATOS ===");
  console.table(data);
  
  // Buscar también administradores delegados que podrían no tener el rol 'ADMIN'
  const { data: delegados, error: errDel } = await supabase
    .from('tms_usuarios')
    .select('id, nombre, email, rol, activo, es_admin_delegado')
    .eq('es_admin_delegado', true)
    .not('rol', 'ilike', '%ADMIN%');
    
  if (delegados && delegados.length > 0) {
      console.log("\n=== LISTA DE ADMINISTRADORES DELEGADOS ===");
      console.table(delegados);
  }
}

checkAdmins();