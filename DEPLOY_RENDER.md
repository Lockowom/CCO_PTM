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

## Configuración de Redirección (IMPORTANTE)
Para evitar errores 404 al recargar páginas:
1. Ir al Dashboard de Render > Tu servicio Static Site.
2. Ir a la pestaña **Redirects/Rewrites**.
3. Agregar la siguiente regla:
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`

## Supabase SQL
- Ejecutar `SETUP_LAYOUT.sql`
- Ejecutar `FIX_LAYOUT_POLICIES.sql`

## Sheets Sync (opcional)
- Usar `SYNC_LAYOUT.gs` y ejecutar `syncLayoutCompleto`
