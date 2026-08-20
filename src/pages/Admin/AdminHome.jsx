import { Link } from 'react-router-dom';
import {
  Activity,
  Boxes,
  Building2,
  Database,
  FileUp,
  Eye,
  FileClock,
  KeyRound,
  MapPin,
  Network,
  Receipt,
  ShieldCheck,
  Ticket,
  UploadCloud,
  UserRoundCog,
  Workflow
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const DOMAINS = [
  {
    id: 'identity',
    label: 'Identidad',
    description: 'Usuarios, seguridad y superficies autorizadas.',
    items: [
      {
        path: '/admin/access',
        title: 'Control de Acceso',
        description: 'IAM 2.0, perfiles y permisos efectivos.',
        icon: UserRoundCog
      },
      {
        path: '/seguridad',
        title: 'Seguridad',
        description: 'MFA y protección de la cuenta propia.',
        icon: ShieldCheck
      },
      {
        path: '/admin/views',
        title: 'Vistas',
        description: 'Catálogo de vistas y accesos operativos.',
        icon: Eye
      }
    ]
  },
  {
    id: 'operation',
    label: 'Operación',
    description: 'Maestros y movimientos de soporte operacional.',
    items: [
      {
        path: '/admin/locations',
        title: 'Ubicaciones',
        description: 'Gestión unificada de ubicaciones WMS.',
        icon: MapPin
      },
      {
        path: '/admin/location-requests',
        title: 'Solicitudes',
        description: 'Transferencias y ubicaciones no correspondientes.',
        icon: FileClock
      },
      {
        path: '/admin/bodegas-softland',
        title: 'Bodegas',
        description: 'Catálogo oficial de bodegas Softland.',
        icon: Building2
      },
      {
        path: '/inbound/data-import',
        title: 'Importaciones',
        description: 'Carga masiva con trazabilidad y validación.',
        icon: FileUp
      },
      {
        path: '/admin/rendiciones',
        title: 'Rendiciones',
        description: 'Revisión, edición y exportación de gastos.',
        icon: Receipt
      }
    ]
  },
  {
    id: 'platform',
    label: 'Plataforma',
    description: 'Automatización, integraciones y mantenimiento controlado.',
    items: [
      {
        path: '/admin/workflows',
        title: 'Workflows',
        description: 'Procesos, estados y ejecuciones.',
        icon: Workflow
      },
      {
        path: '/admin/eventos',
        title: 'Eventos',
        description: 'Motor de eventos y notificaciones.',
        icon: Network
      },
      {
        path: '/admin/api',
        title: 'API Keys',
        description: 'Claves, scopes y actividad de integraciones.',
        icon: KeyRound
      },
      {
        path: '/admin/cleanup',
        title: 'Cleanup',
        description: 'Limpiezas administrativas auditadas.',
        icon: Boxes
      }
    ]
  },
  {
    id: 'observability',
    label: 'Observabilidad',
    description: 'Salud, errores, latencia y trazabilidad de cargas.',
    items: [
      {
        path: '/admin/monitor',
        title: 'Monitor',
        description: 'Estado operacional en tiempo real.',
        icon: Activity
      },
      {
        path: '/admin/observability',
        title: 'Errores y latencia',
        description: 'Incidentes, degradación y evidencia.',
        icon: Database
      },
      {
        path: '/admin/upload-history',
        title: 'Upload History',
        description: 'Historial y resultado de cargas masivas.',
        icon: UploadCloud
      },
      {
        path: '/admin/tickets',
        title: 'Tickets TI',
        description: 'Solicitudes técnicas y seguimiento.',
        icon: Ticket
      }
    ]
  }
];

export default function AdminHome() {
  const { canAccessRoute } = useAuth();
  const domains = DOMAINS.map((domain) => ({
    ...domain,
    items: domain.items.filter((item) => canAccessRoute(item.path))
  })).filter((domain) => domain.items.length > 0);

  return (
    <main className="admin-home-v2">
      <PageHeader
        title="Administración"
        description="Herramientas agrupadas por propósito y filtradas por acceso IAM efectivo."
      />
      {domains.length === 0 ? (
        <EmptyState title="Sin herramientas administrativas disponibles" />
      ) : (
        <div className="admin-domain-grid">
          {domains.map((domain) => (
            <section
              key={domain.id}
              className="admin-domain"
              aria-labelledby={`admin-${domain.id}`}
            >
              <header>
                <span>CCO 2.0</span>
                <h2 id={`admin-${domain.id}`}>{domain.label}</h2>
                <p>{domain.description}</p>
              </header>
              <div className="admin-tool-grid">
                {domain.items.map(({ path, title, description, icon: Icon }) => (
                  <Link key={path} to={path} className="admin-tool-card">
                    <span className="admin-tool-card__icon">
                      <Icon size={20} />
                    </span>
                    <span className="admin-tool-card__copy">
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <span className="admin-tool-card__status">Disponible</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export { DOMAINS as ADMIN_DOMAINS };
