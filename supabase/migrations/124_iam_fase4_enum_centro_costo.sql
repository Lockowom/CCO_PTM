-- ============================================================================
--  124_iam_fase4_enum_centro_costo.sql — IAM Fase 4 (pre-req)
--  Agrega el valor 'centro_costo' al enum de ámbitos. Debe ir en su PROPIA
--  migración (ADD VALUE no puede usarse en la misma tx donde se define).
-- ============================================================================
alter type iam.scope_type add value if not exists 'centro_costo';
