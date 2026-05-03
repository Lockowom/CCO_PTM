# ✅ CHECKLIST DE VERIFICACIÓN

Úsalo antes de cada pase a producción (PR/Merge a main) para asegurar que las mejoras se aplicaron correctamente.

## 📦 Performance & Bundle
- [ ] ¿El reporte de `vite build` muestra chunks menores a 500kb?
- [ ] ¿Las rutas usan `React.lazy()` y `Suspense`?
- [ ] ¿Se eliminaron dependencias sin uso en `package.json`?
- [ ] ¿Las imágenes pesadas están en formato `.webp`?

## 📶 Modo Offline & Datos
- [ ] ¿Aparece el toast de "Señal Perdida" al desconectar el Wi-Fi?
- [ ] ¿Se guardan las operaciones de Picking en Dexie (`WMS_Offline_DB`) al estar sin red?
- [ ] ¿Al reconectar el Wi-Fi, la consola muestra "Sincronizando operaciones pendientes"?
- [ ] ¿Las mutaciones de inventario usan la caché optimista de TanStack Query?

## 🎨 UI & Experiencia (Cyber-Logística)
- [ ] ¿El Dashboard principal carga sin parpadeos de CSS?
- [ ] ¿Los colores `wms-dark` y `wms-neon` se ven correctamente en los monitores de TV del almacén?
- [ ] ¿Las transiciones entre módulos tienen el efecto de "Slide y Fade" suave (GSAP)?
- [ ] ¿Las tablas largas (ej. Kardex) mantienen un scroll fluido (React Virtual)?

## ♿ Accesibilidad
- [ ] ¿Es posible navegar el menú principal usando solo la tecla `Tab`?
- [ ] ¿Los botones críticos de Inbound/Outbound tienen contraste suficiente (WCAG AA mínimo)?
- [ ] ¿Hay `aria-labels` en los íconos (Lucide-React) que funcionan como botones?