# TMS CCO | Control Logístico

Sistema de gestión de transporte y logística (TMS) para operaciones de almacén, distribución y despacho.

## 🚀 Stack Tecnológico

- **React 18** + **Vite** — Frontend moderno y rápido
- **Supabase** — Base de datos, autenticación y realtime
- **TailwindCSS** — Estilos utilitarios
- **React Router v6** — Navegación SPA
- **Leaflet** — Mapas interactivos
- **Chart.js / Recharts** — Gráficos y visualizaciones
- **Lucide React** — Iconografía moderna

## 📦 Módulos Principales

### 📊 Dashboard & Control
| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Panel principal con métricas y KPIs en tiempo real |
| **Torre de Control** | Monitoreo en vivo de entregas y flota |
| **Usuarios Activos** | **(Nuevo)** Monitor de sesiones en tiempo real (Heartbeat) |
| **Reportes de Tiempos** | **(Nuevo)** Análisis detallado de productividad (Activo vs Ocio) |

### 🚛 Operaciones Logísticas (TMS)
| Módulo | Descripción |
|--------|-------------|
| **Planificación** | Creación y optimización de rutas de reparto |
| **Conductores** | Gestión de flota y perfiles de choferes |
| **App Móvil** | **(Actualizado)** Interfaz para conductores con **Escáner QR** y Auto-Login |

### 📥 Inbound (Entrada)
| Módulo | Descripción |
|--------|-------------|
| **Recepción** | Control de llegada de mercadería |
| **Entrada** | Registro y ubicación de productos |

### 📤 Outbound (Salida)
| Módulo | Descripción |
|--------|-------------|
| **Notas de Venta** | **(Mejorado)** Gestión agrupada de pedidos con acciones masivas |
| **Picking** | **(Mejorado)** Interfaz optimizada, bloqueo de usuario y picking parcial |
| **Packing** | **(Mejorado)** Alertas de picking incompleto y verificación de items |
| **Despacho** | Generación de rutas y asignación de transporte |

### 🏢 Administración
| Módulo | Descripción |
|--------|-------------|
| **Usuarios y Roles** | Gestión de permisos y accesos |
| **Configuración** | Control de vistas y parámetros globales |
| **Soporte TI** | **(Nuevo)** Sistema de tickets y reportes de errores |
| **Limpieza** | Herramientas para mantenimiento de base de datos |

## ✨ Características Destacadas

### 🔒 Seguridad y Control
- **Bloqueo de Tareas:** Evita que dos usuarios trabajen en la misma N.V. (Picking/Packing).
- **Auto-Auth Móvil:** La App de conductores detecta automáticamente si el usuario es un conductor válido.
- **Permisos Granulares:** Control de acceso por rol a nivel de ruta y componente.

### 📱 App Móvil para Conductores
- **Escáner QR Integrado:** Uso de cámara para validar entregas.
- **Modo Offline/Online:** Sincronización automática.
- **Gestión de Estados:** Confirmación, rechazo (con motivos) y reprogramación.
- **Responsive:** Interfaz adaptada a cualquier dispositivo móvil.

### ⚡ Eficiencia Operativa
- **Agrupación Inteligente:** Las N.V. con múltiples items se muestran consolidadas.
- **Alertas Visuales:** Notificación inmediata en Packing si un pedido viene incompleto.
- **Medición de Tiempos:** Registro silencioso de tiempos activos y muertos para análisis posterior.

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
> **Nota:** El proyecto frontend se encuentra en la carpeta raíz `CCO_PTM`. Asegúrate de estar en el directorio correcto.

### 5. Build para producción
```bash
npm run build
```

## 📁 Estructura del Proyecto

```
CCO_PTM/
├── public/
├── src/
│   ├── components/        # Componentes reutilizables (Layout, Navbar, Sidebar, Widgets)
│   ├── context/           # Contextos (Auth, Config)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Cliente Supabase
│   ├── pages/             # Páginas organizadas por módulo
│   │   ├── Admin/         # Usuarios, Roles, Vistas, Mediciones, Tickets, UsuariosActivos
│   │   ├── Inbound/       # Entrada, Recepción
│   │   ├── Inventory/     # Stock, Layout
│   │   ├── Outbound/      # Notas de Venta, Picking, Packing, Despacho
│   │   ├── Queries/       # Consultas varias
│   │   └── TMS/           # Torre de Control, Rutas, Conductores, MobileApp
│   ├── App.jsx            # Rutas y permisos
│   ├── main.jsx           # Entry point
│   └── supabase.js        # Config Supabase
├── .env.example           # Plantilla de variables de entorno
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🌐 Deploy

Consulta [DEPLOY_RENDER.md](./DEPLOY_RENDER.md) para instrucciones de despliegue en Render.

## 📄 Licencia

Proyecto privado — Todos los derechos reservados.
