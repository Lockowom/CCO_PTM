import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vtrtyzbgpsvqwbfoudaf.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_E98rNjBu7rG9mLjgI68sAw_Wr2EIp-f';

export const supabase = createClient(supabaseUrl, supabaseKey);
