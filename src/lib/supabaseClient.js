// supabaseClient.js - Cliente de Supabase configurado para TMS-CCO
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_KEY');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

