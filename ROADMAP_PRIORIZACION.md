# 🗺️ ROADMAP DE PRIORIZACIÓN (6 Semanas)

Plan de ataque para implementar las mejoras en CCO WMS maximizando el impacto con el menor esfuerzo posible.

## FASE 1: CRÍTICA (Semanas 1-2)
*Enfocada en Performance y Estabilidad Base*

1.  **Code Splitting (React.lazy)**
    *   **Impacto:** Alto (Reduce carga inicial)
    *   **Esfuerzo:** Medio
2.  **Optimización de Imágenes y Assets**
    *   **Impacto:** Alto
    *   **Esfuerzo:** Bajo
3.  **Caché Offline Básica (TanStack Query + Dexie)**
    *   **Impacto:** Crítico (Evita bloqueos en almacén)
    *   **Esfuerzo:** Alto
4.  **Accesibilidad Básica (Contraste y Teclado)**
    *   **Impacto:** Medio
    *   **Esfuerzo:** Bajo

## FASE 2: ALTA (Semanas 3-4)
*Enfocada en Experiencia de Usuario y Escalabilidad de UI*

5.  **Virtualización de Listas (React Virtual)**
    *   **Impacto:** Alto (Kardex e Historiales rápidos)
    *   **Esfuerzo:** Medio
6.  **Rediseño Cyber-Logístico (Glassmorphism)**
    *   **Impacto:** Alto (Percepción de calidad)
    *   **Esfuerzo:** Medio
7.  **Monitoreo de Errores (Sentry)**
    *   **Impacto:** Alto
    *   **Esfuerzo:** Bajo

## FASE 3: MEDIA (Semanas 5-6)
*Enfocada en Deuda Técnica y Seguridad*

8.  **Implementar 2FA**
    *   **Impacto:** Medio
    *   **Esfuerzo:** Alto
9.  **Migración de Contextos Pesados a Zustand**
    *   **Impacto:** Medio (Reduce re-renders innecesarios)
    *   **Esfuerzo:** Alto
10. **Pruebas Unitarias y E2E (Vitest / Cypress)**
    *   **Impacto:** Medio (Prevención a largo plazo)
    *   **Esfuerzo:** Muy Alto