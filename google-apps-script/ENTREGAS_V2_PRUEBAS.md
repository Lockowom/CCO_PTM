# Entregas Enhanced V2 - Guía de Pruebas Rápidas

## ⚡ Pruebas Rápidas (5 minutos)

### ✅ Test 1: Carga Inicial (30 segundos)
1. Abrir módulo de Entregas
2. **Verificar**: Skeleton screens animados aparecen
3. **Verificar**: Entregas cargan en < 2 segundos
4. **Verificar**: Estadísticas muestran números correctos
5. **Verificar**: Cards tienen colores según estado

**Resultado Esperado**: ✅ Todo carga correctamente con animaciones

---

### ✅ Test 2: Búsqueda (1 minuto)
1. Escribir en barra de búsqueda: "95447"
2. **Verificar**: Resultados filtran en tiempo real
3. **Verificar**: Contador muestra número correcto
4. Hacer clic en botón X (clear)
5. **Verificar**: Búsqueda se limpia y muestra todas

**Resultado Esperado**: ✅ Búsqueda funciona instantáneamente

---

### ✅ Test 3: Filtros (1 minuto)
1. Hacer clic en filtro "En Ruta"
2. **Verificar**: Solo muestra entregas en ruta
3. **Verificar**: Botón "En Ruta" está activo (azul)
4. Hacer clic en "Todos"
5. **Verificar**: Muestra todas las entregas

**Resultado Esperado**: ✅ Filtros funcionan correctamente

---

### ✅ Test 4: Cambio de Estado - ENTREGADO (2 minutos)
1. Seleccionar una entrega "EN RUTA"
2. Hacer clic en "Cambiar Estado"
3. Seleccionar "ENTREGADO"
4. **Verificar**: Aparece campo de foto (obligatorio)
5. Hacer clic en "Confirmar" sin foto
6. **Verificar**: Muestra error y shake animation
7. Hacer clic en "Tomar Foto"
8. Capturar foto
9. **Verificar**: Muestra preview e indicador de calidad
10. Hacer clic en "Confirmar"
11. **Verificar**: Botón muestra "Procesando..."
12. **Verificar**: Toast de éxito aparece
13. **Verificar**: Card se anima con pulso
14. **Verificar**: Estadísticas se actualizan con animación

**Resultado Esperado**: ✅ Cambio exitoso con todas las validaciones

---

### ✅ Test 5: Validaciones (30 segundos)
1. Intentar RECHAZADO sin motivo
2. **Verificar**: Error y shake
3. Intentar REPROGRAMADO sin fecha
4. **Verificar**: Error y shake
5. Intentar REPROGRAMADO con fecha pasada
6. **Verificar**: Error "debe ser futura"

**Resultado Esperado**: ✅ Todas las validaciones funcionan

---

## 🔍 Pruebas Detalladas (15 minutos)

### Test 6: Modo Offline (3 minutos)
1. Abrir DevTools (F12)
2. Network tab → Offline
3. **Verificar**: Indicador cambia a "Sin conexión"
4. **Verificar**: Toast de advertencia aparece
5. Intentar cambiar estado
6. **Verificar**: Cambio se guarda localmente
7. Network tab → Online
8. **Verificar**: Indicador cambia a "Conectado"
9. **Verificar**: Toast "Sincronizando X cambios"
10. **Verificar**: Cambios se aplican automáticamente

**Resultado Esperado**: ✅ Modo offline funciona perfectamente

---

### Test 7: Tiempo Real (5 minutos)
**Requiere 2 dispositivos o 2 navegadores**

1. Abrir en Dispositivo A y B
2. En Dispositivo A: Cambiar estado de N.V 12345
3. En Dispositivo B: Esperar 5-10 segundos
4. **Verificar**: Notificación aparece en B
5. **Verificar**: Card se anima en B
6. **Verificar**: Lista se actualiza en B
7. **Verificar**: Estadísticas se actualizan en B

**Resultado Esperado**: ✅ Sincronización en tiempo real funciona

---

### Test 8: Animaciones (2 minutos)
1. Cambiar estado de una entrega
2. **Verificar**: Card hace pulso (0.6s)
3. **Verificar**: Badge de estado se anima
4. **Verificar**: Estadísticas cuentan progresivamente
5. Hacer clic en botón
6. **Verificar**: Ripple effect aparece
7. Intentar validación incorrecta
8. **Verificar**: Campo hace shake

**Resultado Esperado**: ✅ Todas las animaciones son suaves

---

### Test 9: Cámara y Compresión (3 minutos)
1. Cambiar a ENTREGADO
2. Tomar foto de alta resolución (> 2MB)
3. **Verificar**: Foto se comprime automáticamente
4. **Verificar**: Tamaño final < 500KB (ver console)
5. **Verificar**: Indicador de calidad aparece
6. Tomar foto muy oscura
7. **Verificar**: Indicador muestra "⚠️ Foto muy oscura"
8. **Verificar**: Toast sugiere tomar otra

**Resultado Esperado**: ✅ Compresión y detección funcionan

---

### Test 10: Mobile Responsive (2 minutos)
1. Abrir DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Seleccionar iPhone o Android
4. **Verificar**: Grid de stats cambia a 2 columnas
5. **Verificar**: Filtros tienen scroll horizontal
6. **Verificar**: Botones son full-width
7. **Verificar**: Cards se apilan verticalmente
8. **Verificar**: Todo es touch-friendly

**Resultado Esperado**: ✅ Responsive design funciona

---

## 🐛 Checklist de Problemas Comunes

### ❌ No carga entregas
- [ ] Verificar que `getEntregasPorUsuario()` existe
- [ ] Revisar console para errores
- [ ] Verificar permisos de usuario
- [ ] Probar con otro usuario

### ❌ No funciona cámara
- [ ] Verificar que es HTTPS (no HTTP)
- [ ] Verificar permisos del navegador
- [ ] Probar con input file (galería)
- [ ] Revisar console para errores

### ❌ No sincroniza en tiempo real
- [ ] Verificar que `getCambiosDesde()` existe
- [ ] Revisar console para errores de polling
- [ ] Verificar conexión a internet
- [ ] Esperar 5-10 segundos

### ❌ Animaciones lentas
- [ ] Verificar número de entregas (< 100)
- [ ] Cerrar otras pestañas
- [ ] Probar en otro navegador
- [ ] Verificar hardware del dispositivo

### ❌ Foto muy grande
- [ ] Verificar que compresión está activa
- [ ] Revisar console para tamaño final
- [ ] Ajustar calidad en código si necesario
- [ ] Probar con foto más pequeña

---

## 📊 Matriz de Pruebas

| Test | Funcionalidad | Tiempo | Prioridad | Estado |
|------|---------------|--------|-----------|--------|
| 1 | Carga Inicial | 30s | 🔴 Alta | ⬜ |
| 2 | Búsqueda | 1m | 🔴 Alta | ⬜ |
| 3 | Filtros | 1m | 🔴 Alta | ⬜ |
| 4 | Cambio Estado | 2m | 🔴 Alta | ⬜ |
| 5 | Validaciones | 30s | 🔴 Alta | ⬜ |
| 6 | Modo Offline | 3m | 🟡 Media | ⬜ |
| 7 | Tiempo Real | 5m | 🟡 Media | ⬜ |
| 8 | Animaciones | 2m | 🟢 Baja | ⬜ |
| 9 | Cámara | 3m | 🟡 Media | ⬜ |
| 10 | Responsive | 2m | 🟡 Media | ⬜ |

**Total**: ~20 minutos para todas las pruebas

---

## 🎯 Criterios de Aceptación

### ✅ Mínimo Aceptable (Tests 1-5)
- Carga correctamente
- Búsqueda funciona
- Filtros funcionan
- Cambio de estado funciona
- Validaciones funcionan

### ✅ Recomendado (Tests 1-9)
- Todo lo anterior +
- Modo offline funciona
- Tiempo real funciona
- Animaciones suaves
- Cámara y compresión funcionan

### ✅ Ideal (Tests 1-10)
- Todo lo anterior +
- Responsive design perfecto

---

## 📝 Reporte de Pruebas

### Información del Test
- **Fecha**: _______________
- **Tester**: _______________
- **Dispositivo**: _______________
- **Navegador**: _______________
- **Versión**: V2.0

### Resultados
- Tests Pasados: ___ / 10
- Tests Fallados: ___ / 10
- Bugs Encontrados: ___

### Bugs Encontrados
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Comentarios
_______________________________________________
_______________________________________________
_______________________________________________

### Aprobación
- [ ] ✅ Aprobado para producción
- [ ] ⚠️ Aprobado con observaciones
- [ ] ❌ Requiere correcciones

**Firma**: _______________

---

## 🚀 Comandos Útiles para Debugging

### Console Commands
```javascript
// Ver estado actual del módulo
EntregasDebug.module

// Ver entregas cargadas
EntregasDebug.module.entregas

// Forzar refresh
EntregasDebug.module.refresh()

// Ver cambios pendientes offline
EntregasDebug.offline.obtenerPendientes()

// Limpiar caché
EntregasDebug.offline.limpiarCache()

// Detener polling
EntregasDebug.realtime.detenerPolling()

// Iniciar polling
EntregasDebug.realtime.iniciarPolling()
```

### Network Tab
- Filtrar por "getEntregasPorUsuario" para ver llamadas
- Filtrar por "getCambiosDesde" para ver polling
- Verificar tamaño de respuestas

### Performance Tab
- Grabar durante 10 segundos
- Verificar que FPS > 50
- Verificar que no hay memory leaks

---

## ✅ Checklist Final

Antes de aprobar para producción:

- [ ] Todos los tests críticos (1-5) pasan
- [ ] No hay errores en console
- [ ] Funciona en Chrome
- [ ] Funciona en Safari (iOS)
- [ ] Funciona en Chrome (Android)
- [ ] Responsive design correcto
- [ ] Animaciones suaves
- [ ] Modo offline funciona
- [ ] Tiempo real funciona
- [ ] Documentación completa

**Si todos los checks están ✅, estás listo para deployment!**

---

**Versión**: 2.0  
**Última actualización**: Enero 2026  
**Próxima revisión**: Después del deployment
