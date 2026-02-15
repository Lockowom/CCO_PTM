# 🚀 Sistema de Monitoreo Logístico en Tiempo Real

Sistema completo de gestión logística construido con Google Apps Script y Google Sheets como base de datos.

## ⚡ Inicio Rápido

### ¿Tienes pantalla en blanco después del login?

👉 **[VER SOLUCIÓN AQUÍ](SOLUCION_PANTALLA_BLANCA.md)** 👈

### Instalación Rápida

1. **Crear Google Spreadsheet** y copiar su ID
2. **Abrir Apps Script** (Extensiones > Apps Script)
3. **Copiar TODOS los archivos** (12 .gs + 9 .html)
4. **Configurar SPREADSHEET_ID** en Code.gs
5. **Ejecutar `setupSheets()`** para crear las hojas
6. **Ejecutar `runFullDiagnostic()`** para verificar que todo funciona
7. **Desplegar como aplicación web**
8. **Login**: admin@sistema.com / admin123

📖 **[Guía de instalación completa](INSTALACION.md)**

## 🔍 Diagnóstico del Sistema

Si tienes problemas, ejecuta estas funciones en Apps Script:

```javascript
// Diagnóstico completo (recomendado)
runFullDiagnostic()

// Diagnóstico rápido
quickDiagnostic()

// Arreglar usuario admin
fixAdminUser()

// Probar login
testLogin()
```

## 🚀 Características Principales

- ✅ **Autenticación segura** con hash SHA-256
- ✅ **Dashboard en tiempo real** con KPIs y métricas
- ✅ **Gestión completa del flujo logístico**:
  - Recepción de mercancía
  - Control de inventario
  - Picking y packing de órdenes
  - Despacho y seguimiento
  - Confirmación de entregas
- ✅ **Sistema de alertas** automáticas
- ✅ **Reportes y análisis** de operaciones
- ✅ **Interfaz responsive** compatible con móviles

## 📋 Módulos del Sistema

### Backend (Google Apps Script) - 12 archivos

1. **Code.gs** - Routing principal y configuración
2. **Setup.gs** - Configuración inicial de hojas
3. **Database.gs** - Operaciones CRUD genéricas
4. **Auth.gs** - Autenticación y sesiones
5. **Inventory.gs** - Gestión de inventario
6. **Reception.gs** - Recepción de mercancía
7. **Orders.gs** - Gestión de órdenes
8. **Dispatch.gs** - Despachos y envíos
9. **Delivery.gs** - Confirmación de entregas
10. **Dashboard.gs** - Métricas y KPIs
11. **Reports.gs** - Reportes y análisis
12. **FixUser.gs** - Utilidad para arreglar usuarios
13. **Diagnostico.gs** - 🆕 Diagnóstico del sistema

### Frontend (HTML) - 9 archivos

1. **Login.html** - Página de inicio de sesión
2. **Simple_Page.html** - 🆕 Página de diagnóstico post-login
3. **DashboardMain.html** - Dashboard principal funcional
4. **Dashboard_Page.html** - Dashboard completo con gráficos
5. **Reception_Page.html** - Módulo de recepción
6. **Inventory_Page.html** - Módulo de inventario
7. **Picking_Page.html** - Módulo de picking/packing
8. **Dispatch_Page.html** - Módulo de despacho
9. **Delivery_Page.html** - Módulo de entregas
10. **Reports_Page.html** - Módulo de reportes

## 📊 Estructura de Datos

El sistema utiliza 8 hojas en Google Sheets:

1. **Usuarios** - Gestión de usuarios y roles
2. **Órdenes** - Órdenes de pedido
3. **Inventario** - Stock de productos
4. **Recepciones** - Registro de mercancía entrante
5. **Guias** - Guías de picking
6. **Despachos** - Envíos y transportistas
7. **Entregas** - Confirmaciones de entrega
8. **Sesiones** - Sesiones activas de usuarios

## 🎯 Flujo del Proceso

```
Recepción → Almacenamiento → Picking → Packing → Despacho → Entrega
```

Cada etapa tiene su propia interfaz y validaciones.

## 🐛 Solución de Problemas

### 🔴 Problema: Pantalla en blanco después del login

**Solución rápida:**
1. Ejecuta `runFullDiagnostic()` en Apps Script
2. Revisa los logs (Ver > Registros)
3. Sigue las recomendaciones que aparezcan

**[Ver guía completa de solución](SOLUCION_PANTALLA_BLANCA.md)**

### 🔴 Problema: Error de autenticación

```javascript
// Ejecuta esto en Apps Script:
fixAdminUser()
```

### 🔴 Problema: Error al cargar datos

```javascript
// Verifica el sistema:
runFullDiagnostic()
```

### 🔴 Problema: Hojas no existen

```javascript
// Crea las hojas:
setupSheets()
```

## 📚 Documentación

- 📖 **[INSTALACION.md](INSTALACION.md)** - Guía de instalación paso a paso
- 🔧 **[SOLUCION_PANTALLA_BLANCA.md](SOLUCION_PANTALLA_BLANCA.md)** - Solución de problemas detallada

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con SHA-256
- ✅ Sistema de sesiones con expiración (24 horas)
- ✅ Validación de permisos por rol
- ✅ Logs de auditoría de acciones

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles (responsive design)
- ✅ Tablets
- ⚠️ Requiere JavaScript habilitado
- ⚠️ No usar modo incógnito (puede bloquear sessionStorage)

## 🔄 Actualización del Sistema

Para actualizar después de hacer cambios:

1. **Guarda** todos los archivos (Ctrl+S)
2. Ve a **Implementar > Administrar implementaciones**
3. Haz clic en el **lápiz ✏️** junto a la implementación activa
4. Cambia a **"Nueva versión"**
5. Haz clic en **"Implementar"**
6. Refresca la página de la aplicación web

## 👥 Roles de Usuario

- **ADMIN** - Acceso completo al sistema
- **OPERADOR** - Operaciones diarias
- **SUPERVISOR** - Supervisión y reportes
- **USUARIO** - Acceso limitado

## 📈 KPIs Monitoreados

- 📦 Total de órdenes
- 🔄 Órdenes activas
- 📋 Productos en inventario
- ⚠️ Stock bajo
- 🚚 Despachos pendientes
- ✅ Tasa de éxito de entregas
- ⏱️ Tiempo promedio de procesamiento

## 🛠️ Tecnologías

- Google Apps Script (JavaScript)
- Google Sheets (Base de datos)
- HTML5 + CSS3
- Bootstrap 5
- Font Awesome 6

## ✅ Checklist de Verificación

Antes de reportar un problema, verifica:

- [ ] ✅ SPREADSHEET_ID configurado en Code.gs
- [ ] ✅ setupSheets() ejecutado exitosamente
- [ ] ✅ 8 hojas creadas en el spreadsheet
- [ ] ✅ runFullDiagnostic() ejecutado sin errores
- [ ] ✅ Usuario admin existe (ejecutar fixAdminUser si es necesario)
- [ ] ✅ TODOS los archivos .gs copiados (12 archivos)
- [ ] ✅ TODOS los archivos .html copiados (9 archivos)
- [ ] ✅ Aplicación web desplegada correctamente
- [ ] ✅ Usando URL de aplicación web (no del editor)
- [ ] ✅ Permisos autorizados
- [ ] ✅ JavaScript habilitado
- [ ] ✅ No estás en modo incógnito

## 🆘 Soporte

### Pasos para obtener ayuda:

1. **Ejecuta el diagnóstico**:
   ```javascript
   runFullDiagnostic()
   ```

2. **Copia los logs**:
   - Ve a Ver > Registros en Apps Script
   - Copia todo el contenido

3. **Revisa la consola del navegador**:
   - Presiona F12
   - Ve a la pestaña "Console"
   - Copia cualquier error en rojo

4. **Proporciona esta información** al reportar el problema

## 📝 Credenciales por Defecto

Después de ejecutar `setupSheets()`:

- **Email**: admin@sistema.com
- **Password**: admin123

⚠️ **IMPORTANTE**: Cambia estas credenciales después del primer login.

## 🎓 Funciones Útiles

```javascript
// Diagnóstico completo del sistema
runFullDiagnostic()

// Diagnóstico rápido
quickDiagnostic()

// Crear/arreglar usuario admin
fixAdminUser()

// Probar login
testLogin()

// Ver todos los usuarios
listUsers()

// Crear hojas iniciales
setupSheets()
```

## 📦 Versión

**Versión**: 1.1.0  
**Última actualización**: 2024  
**Cambios recientes**:
- ✅ Agregado sistema de diagnóstico completo
- ✅ Mejorada solución de pantalla en blanco
- ✅ Agregada página de diagnóstico post-login
- ✅ Documentación mejorada

---

💡 **Tip**: Si tienes problemas, SIEMPRE ejecuta `runFullDiagnostic()` primero. Te dirá exactamente qué está mal y cómo arreglarlo.
