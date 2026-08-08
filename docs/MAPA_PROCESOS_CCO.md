# Mapa de Procesos y Arquitectura Funcional CCO

**Responsable:** TI / Administración CCO  
**Actualización:** automática en cada build  
**Revisión recomendada:** mensual y antes de cada cambio estructural

## Propósito

El módulo `Administración → Mapa de Procesos` documenta cómo está construido el CCO y permite recorrer la dependencia real entre:

`Módulo → Pantalla/Componente → Función/Acción → Tabla, RPC o Edge Function`

La vista principal se genera desde el código fuente. El editor manual anterior se conserva como `Flujo operativo` para diagramar procesos de negocio que no pueden deducirse automáticamente.

## Alcance

Incluye:

- módulos y pantallas registrados en el catálogo central;
- rutas y permisos de acceso;
- servicios reutilizables del frontend;
- funciones exportadas y acciones locales que consultan Supabase;
- tablas, RPC, Storage y Edge Functions utilizados por la aplicación;
- relaciones directas entre los elementos anteriores;
- ubicación del archivo fuente para investigar o modificar cada función.

No incluye automáticamente reglas de negocio que solamente existan como conocimiento informal. Esas reglas deben documentarse en el editor de flujo operativo.

## Responsabilidades

| Actividad                              | Responsable       | Aprueba        | Consultado       | Informado           |
| -------------------------------------- | ----------------- | -------------- | ---------------- | ------------------- |
| Agregar una pantalla o función         | Desarrollo        | TI             | Área usuaria     | Administración      |
| Revisar descripción y dueño del módulo | TI                | Administración | Área responsable | Usuarios clave      |
| Validar conexiones de datos            | Desarrollo        | TI             | DBA/Supabase     | Administración      |
| Mantener flujos manuales               | Dueño del proceso | Administración | TI               | Usuarios del módulo |

## Funcionamiento

1. `scripts/generate_architecture_catalog.mjs` inspecciona las rutas, servicios, componentes y Edge Functions.
2. El generador crea `src/data/ccoArchitecture.generated.json` con identificadores determinísticos.
3. El build ejecuta el generador antes de compilar.
4. `ArchitectureExplorer.jsx` presenta la vista general, la trazabilidad de conexiones y el catálogo técnico.
5. Las pruebas comprueban que todas las rutas estén documentadas y que ninguna conexión apunte a un elemento inexistente.

## Cómo agregar funciones en el futuro

1. Registra toda pantalla nueva en `src/config/modules.js` y en el router de `src/App.jsx`.
2. Ubica las operaciones de datos reutilizables en un archivo de servicio y expórtalas con un nombre descriptivo.
3. Añade un comentario JSDoc o comentario inmediatamente anterior si la finalidad no resulta evidente por el nombre.
4. Usa llamadas explícitas `supabase.from(...)`, `supabase.rpc(...)` o `supabase.functions.invoke(...)`; el generador detectará el recurso.
5. Ejecuta:

   ```bash
   npm run gen:architecture
   npm test
   npm run build
   ```

6. Abre `Administración → Mapa de Procesos`, busca la función y confirma sus entradas y salidas.

## Excepciones

| Escenario                              | Acción                                                                                                     |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Una función no aparece                 | Confirmar que está exportada o que realiza una llamada de datos detectable. Añadir comentario y regenerar. |
| Una pantalla aparece sin archivo       | Revisar que la ruta use un componente lazy registrado en `App.jsx`.                                        |
| Una regla de negocio no está en código | Documentarla en `Flujo operativo`; no inventar una conexión técnica.                                       |
| El catálogo parece antiguo             | Ejecutar `npm run gen:architecture` y revisar la huella mostrada al pie del módulo.                        |
| Un módulo todavía no está operativo    | Marcarlo como oculto en la metadata; conservarlo documentado para futuras reactivaciones.                  |

## Métricas de control

| Métrica                            |   Objetivo | Validación                              |
| ---------------------------------- | ---------: | --------------------------------------- |
| Rutas configuradas documentadas    |       100% | Prueba `architectureCatalog.test.js`    |
| Conexiones con extremos válidos    |       100% | Prueba de integridad del catálogo       |
| Funciones con descripción y fuente |       100% | Prueba de trazabilidad                  |
| Catálogo regenerado en producción  | Cada build | `prebuild` y huella visible en pantalla |
