# Deploy en Render (Static Site)

## Build
```
npm ci && npm run build
```

## Publish Directory
```
dist
```

## Variables de Entorno
```
VITE_SUPABASE_URL=<tu_supabase_url>
VITE_SUPABASE_KEY=<tu_supabase_anon_key>
```

## Supabase SQL
- Ejecutar `SETUP_LAYOUT.sql`
- Ejecutar `FIX_LAYOUT_POLICIES.sql`

## Sheets Sync (opcional)
- Usar `SYNC_LAYOUT.gs` y ejecutar `syncLayoutCompleto`
