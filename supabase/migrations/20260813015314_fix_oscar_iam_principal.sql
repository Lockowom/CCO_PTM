-- iam.users usa el UUID de Auth, no el UUID del perfil tms_usuarios.
delete from iam.assignments a
using iam.roles r, public.tms_usuarios u
where a.role_id=r.id and r.codigo='rendiciones_oscar'
  and lower(btrim(u.nombre))='oscar leiva'
  and a.principal_id=u.id;

insert into iam.assignments(id,principal_type,principal_id,role_id,scope_type,scope_id,scope_code,granted_at)
select gen_random_uuid(),'user'::iam.principal_type,u.auth_uid,r.id,'global'::iam.scope_type,null,null,now()
from public.tms_usuarios u cross join iam.roles r
where lower(btrim(u.nombre))='oscar leiva' and u.auth_uid is not null and r.codigo='rendiciones_oscar'
  and not exists(
    select 1 from iam.assignments a where a.principal_type='user' and a.principal_id=u.auth_uid
      and a.role_id=r.id and a.scope_type='global'
  );

select authz.refresh_permissions();
