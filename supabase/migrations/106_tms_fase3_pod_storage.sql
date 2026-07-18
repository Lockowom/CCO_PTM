-- ============================================================================
--  106_tms_fase3_pod_storage.sql  ·  TMS (Transporte) — Fase 3: evidencia POD
--  Bucket privado para la prueba de entrega (foto + firma) que captura la app
--  del chofer. Las imágenes se sirven con URL firmada (nunca públicas).
-- ============================================================================
insert into storage.buckets (id, name, public) values ('tms-pod','tms-pod', false)
on conflict (id) do nothing;

drop policy if exists tms_pod_insert on storage.objects;
drop policy if exists tms_pod_select on storage.objects;
drop policy if exists tms_pod_update on storage.objects;
create policy tms_pod_insert on storage.objects for insert to authenticated with check (bucket_id = 'tms-pod');
create policy tms_pod_select on storage.objects for select to authenticated using (bucket_id = 'tms-pod');
create policy tms_pod_update on storage.objects for update to authenticated using (bucket_id = 'tms-pod');
