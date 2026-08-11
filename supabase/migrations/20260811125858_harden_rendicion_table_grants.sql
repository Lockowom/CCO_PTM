begin;

-- La aplicación solo accede mediante RPCs permission-gated y la Edge Function.
-- Se revocan incluso los grants implícitos de Data API; RLS queda como segunda capa.
revoke all on table
  public.rendicion_centros_costo,
  public.rendicion_colaboradores,
  public.rendicion_categorias,
  public.rendicion_subcategorias,
  public.rendicion_categoria_subcategoria,
  public.rendicion_public_links,
  public.rendiciones,
  public.rendicion_items,
  public.rendicion_fotos,
  public.rendicion_public_log
from anon, authenticated;

revoke all on sequence public.rendiciones_folio_seq from anon, authenticated;
revoke all on sequence public.rendicion_public_log_id_seq from anon, authenticated;

commit;
