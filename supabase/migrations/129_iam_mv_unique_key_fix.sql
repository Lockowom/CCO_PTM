-- ============================================================================
--  129_iam_mv_unique_key_fix.sql — Fix MV de permisos (Fase 7)
--  REFRESH ... CONCURRENTLY exige un índice único de columnas simples (no
--  expresiones). Se rehace la MV con clave natural (assignment_id, permission_id).
--  (Nota: la migración 131 luego pasa el refresh a NO concurrente por la rama de
--   delegación; este archivo documenta el estado intermedio aplicado.)
-- ============================================================================
drop materialized view if exists iam.mv_user_permissions;

create materialized view iam.mv_user_permissions as
select a.id as assignment_id, rp.permission_id,
       a.principal_id as user_id, p.codigo as permission,
       a.scope_type, a.scope_id, a.scope_code
from iam.assignments a
join iam.role_permissions rp on rp.role_id = a.role_id
join iam.permissions p on p.id = rp.permission_id
join iam.roles r on r.id = a.role_id and r.activo
where a.principal_type = 'user'
  and (a.expires_at is null or a.expires_at > now())
with data;

create unique index mv_user_perms_uidx on iam.mv_user_permissions (assignment_id, permission_id);
create index mv_user_perms_lookup_idx on iam.mv_user_permissions (user_id, permission);
