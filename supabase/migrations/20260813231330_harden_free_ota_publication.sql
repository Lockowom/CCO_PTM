-- La publicación CI se mueve de RPC público a Edge Function con autenticación
-- propia. Las tablas mantienen un deny-all explícito para clientes directos.

drop function if exists public.ota_publish_bundle(text,text,text,text,bigint,text,text);

create policy mobile_ota_bundles_deny_direct
  on public.mobile_ota_bundles for all to anon, authenticated
  using (false) with check (false);
create policy mobile_ota_channels_deny_direct
  on public.mobile_ota_channels for all to anon, authenticated
  using (false) with check (false);
create policy mobile_ota_devices_deny_direct
  on public.mobile_ota_devices for all to anon, authenticated
  using (false) with check (false);
create policy mobile_ota_events_deny_direct
  on public.mobile_ota_events for all to anon, authenticated
  using (false) with check (false);
