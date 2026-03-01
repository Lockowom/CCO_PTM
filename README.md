# TMS CCO | Centro de Control Operacional

Plataforma integral de gestión logística (WMS + TMS) diseñada para optimizar el flujo de operaciones desde la recepción hasta la última milla.

## 🚀 Stack Tecnológico (v2.0)

- **Frontend:** React 18 + Vite
- **Estilos:** TailwindCSS + Glassmorphism UI
- **Base de Datos:** Supabase (PostgreSQL + Realtime)
- **Animaciones:** GSAP (GreenSock)
- **Mapas:** Leaflet
- **Gráficos:** Recharts
- **Iconos:** Lucide React

## ✨ Novedades Versión 2.0

### 📊 Dashboard Operacional "Bento Grid"
Nuevo diseño de alta densidad que permite visualizar toda la operación en una sola pantalla:
- **KPIs Compactos:** Indicadores clave (N.V., Picking, Despacho) con tendencias.
- **Pipeline Visual:** Gráfico de flujo de pedidos en tiempo real.
- **Alertas Inteligentes:** Notificaciones inmediatas de quiebres de stock y refacturaciones.
- **Modo "Command Center":** Actualización automática cada 30 segundos.

### 🔐 Seguridad y Accesos
- **Login Animado:** Nueva interfaz de acceso con fondo dinámico y validación segura.
- **Session Watchdog:** Sistema de monitoreo que cierra sesiones activas si el usuario es desactivado.
- **RBAC Estricto:** Control de acceso basado en roles (Admin, Bodega, Transporte) a nivel de componente.
- **Row Level Security (RLS):** Protección de datos a nivel de base de datos.

### 📱 Módulos Mejorados
- **Picking Inteligente:**
  - Botón **"Espera Otra Zona"** para pedidos mixtos (pequeño/grande).
  - Bloqueo de concurrencia para evitar duplicidad de trabajo.
- **Consulta Maestra:** (Antiguo Historial N.V.) Buscador avanzado con filtros múltiples y detalles expandidos.
- **Torre de Control:** Visualización de flota en tiempo real con estados de entrega.

## 📦 Módulos del Sistema

### 📥 Inbound (Entrada)
| Módulo | Descripción |
|--------|-------------|
| **Recepción** | Control de llegada de proveedores y validación de OC. |
| **Ingreso** | Put-away y ubicación de mercadería en racks. |

### 📤 Outbound (Salida)
| Módulo | Descripción |
|--------|-------------|
| **Notas de Venta** | Gestión de pedidos, priorización y liberación a picking. |
| **Picking** | Preparación de pedidos con validación de ubicación y producto. |
| **Packing** | Verificación de bultos, etiquetado y control de calidad. |
| **Despacho** | Asignación de transporte y generación de manifiestos. |

### 🚛 TMS (Transporte)
| Módulo | Descripción |
|--------|-------------|
| **Planificación** | Optimización de rutas y asignación de conductores. |
| **Torre de Control** | Monitoreo GPS y gestión de incidencias en ruta. |
| **Conductores** | Gestión de perfiles y disponibilidad de flota. |

### 🏢 Administración
| Módulo | Descripción |
|--------|-------------|
| **Usuarios y Roles** | Gestión de accesos y permisos granulares. |
| **Vistas** | Configuración de interfaces por perfil. |
| **Reportes** | Análisis de productividad y tiempos de operación. |

## 🛠️ Instalación y Despliegue

### Requisitos Previos
- Node.js v18+
- Cuenta en Supabase

### Desarrollo Local
```bash
# 1. Clonar repositorio
git clone https://github.com/Lockowom/CCO_PTM.git

# 2. Instalar dependencias
cd tms-backend-node/CCO_PTM
npm install

# 3. Configurar variables de entorno (.env)
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_KEY=tu_key

# 4. Iniciar servidor
npm run dev
```

### Producción
```bash
npm run build
```

## 📄 Licencia
Proyecto privado CCO - Todos los derechos reservados 2026.
