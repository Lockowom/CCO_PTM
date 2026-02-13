# TMS CCO | Control Logístico

Sistema de gestión de transporte y logística (TMS) para operaciones de almacén, distribución y despacho.

## 🚀 Stack Tecnológico

- **React 18** + **Vite** — Frontend moderno y rápido
- **Supabase** — Base de datos, autenticación y realtime
- **TailwindCSS** — Estilos utilitarios
- **React Router v6** — Navegación SPA
- **Leaflet** — Mapas interactivos
- **Chart.js / Recharts** — Gráficos y visualizaciones
- **GSAP** — Animaciones

## 📦 Módulos

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Panel principal con métricas y KPIs |
| **TMS** | Planificación de rutas, torre de control, conductores, app móvil |
| **Inbound** | Recepción y entrada de mercadería |
| **Outbound** | Notas de venta, picking, packing, despacho |
| **Inventario** | Control de stock y layout de bodega |
| **Consultas** | Lotes, direcciones, estado de ventas, ubicaciones, historial |
| **Admin** | Gestión de usuarios, roles, vistas y mediciones |

## ⚙️ Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/Lockowom/CCO_PTM.git
cd CCO_PTM
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu_anon_key_aqui
```

### 4. Iniciar en desarrollo
```bash
npm run dev
```

### 5. Build para producción
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
CCO_PTM/
├── public/
├── src/
│   ├── components/        # Componentes reutilizables (Layout, Navbar, Sidebar)
│   ├── context/           # Contexto de autenticación (AuthContext)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Cliente Supabase
│   ├── pages/             # Páginas organizadas por módulo
│   │   ├── Admin/         # Usuarios, Roles, Vistas, Mediciones
│   │   ├── Inbound/       # Entrada, Recepción
│   │   ├── Inventory/     # Stock, Layout
│   │   ├── Outbound/      # Notas de Venta, Picking, Packing, Despacho
│   │   ├── Queries/       # Consultas varias
│   │   └── TMS/           # Torre de Control, Rutas, Conductores
│   ├── App.jsx            # Rutas y permisos
│   ├── main.jsx           # Entry point
│   └── supabase.js        # Config Supabase
├── .env.example           # Plantilla de variables de entorno
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🔐 Seguridad

- Las credenciales de Supabase se manejan mediante **variables de entorno** (`.env`)
- El sistema de **permisos por rol** controla el acceso a cada módulo
- Cambios de permisos se sincronizan en **tiempo real** vía Supabase Realtime

## 🌐 Deploy

Consulta [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) para instrucciones de despliegue en Render.

## 📄 Licencia

Proyecto privado — Todos los derechos reservados.
