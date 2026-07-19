-- Endurecimiento: las herramientas del Asistente IA NO deben ser invocables por
-- el rol anon (aunque su gate interno ya bloquea sin auth.uid). Solo authenticated.
revoke all on function public.ia_kpis() from anon;
revoke all on function public.ia_buscar_operaciones(text,text,int) from anon;
revoke all on function public.ia_buscar_stock(text,int) from anon;
revoke all on function public.ia_tickets(text,text,int) from anon;
