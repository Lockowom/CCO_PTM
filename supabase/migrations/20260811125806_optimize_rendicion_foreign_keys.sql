begin;

create index if not exists rendicion_cat_sub_subcategoria_idx
  on public.rendicion_categoria_subcategoria(subcategoria_codigo);
create index if not exists rendicion_fotos_item_idx
  on public.rendicion_fotos(item_id);
create index if not exists rendicion_items_categoria_subcategoria_idx
  on public.rendicion_items(categoria_codigo, subcategoria_codigo);
create index if not exists rendicion_links_created_by_idx
  on public.rendicion_public_links(created_by);
create index if not exists rendicion_log_report_idx
  on public.rendicion_public_log(rendicion_id);
create index if not exists rendiciones_centro_costo_idx
  on public.rendiciones(centro_costo_id);
create index if not exists rendiciones_public_link_idx
  on public.rendiciones(public_link_id);

commit;
