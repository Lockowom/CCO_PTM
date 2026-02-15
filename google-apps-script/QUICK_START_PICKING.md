# 🚀 QUICK START - PICKING MODULE

## ⚡ EN 30 SEGUNDOS

```
1. Abrir módulo Picking
2. Click "Empezar Picking" en una N.V
3. Para cada producto:
   - Click "Ubicación" → Seleccionar ubicación
   O
   - Click "..." → "Producto no encontrado" / "Producto dañado"
4. Click "Picking Completo"
5. ✅ N.V migrada a PACKING
```

---

## 🎯 BOTONES PRINCIPALES

### 📍 Botón "Ubicación"
- Muestra ubicaciones disponibles del producto
- Click en ubicación → Pickea el producto
- Descuenta stock automáticamente
- Marca producto con ✅ verde

### ⋮ Botón "..." (Opciones)
- **Producto no encontrado**: Registra en OBS, no descuenta stock
- **Producto dañado**: Selecciona ubicación, registra en OBS

### 🟡 Faltante PROD BIG TICKET
- Vuelve N.V a "PENDIENTE PICKING"
- NO mueve datos
- Para productos grandes faltantes

### 🟡 Faltante PROD MINI TICKET
- Vuelve N.V a "PENDIENTE PICKING"
- NO mueve datos
- Para productos pequeños faltantes

### 🟢 Picking Completo
- Migra N.V a PACKING
- BORRA de PICKING
- Actualiza estado en N.V DIARIAS

---

## 📊 INDICADORES

### Progreso: "X/Y"
- X = Productos pickeados
- Y = Total de productos
- 🔵 Azul: 0 pickeados
- 🟡 Amarillo: Algunos pickeados
- 🟢 Verde: Todos pickeados

### Estados de Productos
- ⏳ **Pendiente**: Gris, sin check
- ✅ **Pickeado**: Verde, con check
- ⚠️ **Faltante**: Amarillo, con exclamación

---

## 🔄 FLUJO RÁPIDO

```
N.V DIARIAS
    ↓ (copia)
PICKING ← Trabajas aquí
    ↓ (mueve = copia + borra)
PACKING
    ↓ (mueve = copia + borra)
SHIPPING
```

---

## ⚠️ PROBLEMAS COMUNES

### "No se ven ubicaciones"
→ Códigos no coinciden o stock = 0
→ Ejecutar: `DIAGNOSTICO_RAPIDO()`

### "N.V bloqueada"
→ Otro usuario está trabajando en ella
→ Esperar o pedir que salga

### "Error al confirmar"
→ Stock insuficiente
→ Verificar CANTIDAD_CONTADA > 0

---

## 📁 HOJAS IMPORTANTES

- **PICKING**: Datos temporales (se borran al completar)
- **PACKING**: Siguiente paso después de picking
- **OBS**: Observaciones de productos
- **UBICACIONES**: Stock por ubicación
- **PICKING_LOG**: Log de operaciones
- **ESTADO_LOG**: Log de cambios de estado

---

## 🎯 ATAJOS MENTALES

1. **Ubicación** = Pickear normal
2. **...** = Problemas con el producto
3. **Faltante** = Volver atrás
4. **Completo** = Siguiente paso

---

## ✅ CHECKLIST RÁPIDO

Antes de completar picking:
- [ ] Todos los productos tienen estado (pickeado/faltante)
- [ ] Productos no encontrados registrados en OBS
- [ ] Productos dañados registrados en OBS con ubicación
- [ ] Progreso muestra "X/X" en verde

---

**¡LISTO PARA USAR!** 🎉
