Render Static Site
Build: npm ci && npm run build
Publish Directory: dist
Environment:
- VITE_SUPABASE_URL=https://vtrtyzbgpsvqwbfoudaf.supabase.co
- VITE_SUPABASE_KEY=sb_publishable_...

Supabase SQL
- Run SETUP_LAYOUT.sql
- Run FIX_LAYOUT_POLICIES.sql

Sheets Sync (optional)
- Use SYNC_LAYOUT.gs and run syncLayoutCompleto
