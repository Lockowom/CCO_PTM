-- 091_centro_costos_vendedores.sql
-- ============================================================================
--  Carga la hoja CENTRO COSTOS (vendedor → centro de costo + división) al
--  catálogo de vendedores (`tms_panel_vendedores`). Los vendedores marcados
--  "NO ACTIVO" quedan inactivos. Upsert por nombre (se administra en
--  Configuración → Vendedores). Completa la cascada NV → vendedor → c.costo/div.
-- ============================================================================
insert into public.tms_panel_vendedores (nombre, centro_costo, division, activo) values
 ('CM Jorge Norambuena','1-06','DIV. INSTITUCIONAL',true),
 ('CM Maria Jose Morales','1-06','DIV. INSTITUCIONAL',true),
 ('Daniela Silva NO ACTIVO','1-06','DIV. INSTITUCIONAL',false),
 ('Diego Bertoni NO ACTIVO','1-03','DIV. COMERCIO',false),
 ('Directo Empresa','1-10','DIRECTO EMPRESA',true),
 ('Distribuidores','1-03','DIV. COMERCIO',true),
 ('Div. Institucional','1-06','DIV. INSTITUCIONAL',true),
 ('Fernando Fernandez NO ACTIVO','1-03','DIV. COMERCIO',false),
 ('Gabriela Machuca -Universidades-','1-12','PROYECTO',true),
 ('Gonzalo Flores NO ACTIVO','1-03','DIV. COMERCIO',false),
 ('Jenny Garcia','1-10','DIRECTO EMPRESA',true),
 ('Jenny Garcia - Institucional -','1-07','e-COMERCE',true),
 ('Maria Jose Morales','1-06','DIV. INSTITUCIONAL',true),
 ('MP Diego Bertoni','1-03','DIV. COMERCIO',true),
 ('MP Gabriela Machuca NO ACTIVO','1-12','PROYECTO',false),
 ('MP Jorge Norambuena NO ACTIVO','1-06','DIV. INSTITUCIONAL',false),
 ('MP Maria Jose Morales','1-06','DIV. INSTITUCIONAL',true),
 ('NO ACTIVO Oliver Concha','1-03','DIV. COMERCIO',false),
 ('PR Diego Bertoni','1-03','DIV. COMERCIO',true),
 ('PR Gonzaloz Flores','1-03','DIV. COMERCIO',true),
 ('PR Valentina Figueroa','1-03','DIV. COMERCIO',true),
 ('PR Xenia Briones','1-03','DIV. COMERCIO',true),
 ('PR Yannira Morales','1-03','DIV. COMERCIO',true),
 ('Proyecto','1-12','PROYECTO',true),
 ('PTM Store','1-10','PTM',true),
 ('Roxibeth Requena','1-06','DIV. INSTITUCIONAL',true),
 ('Sebastian Abeleida','1-06','DIV. INSTITUCIONAL',true),
 ('Sebastian Fraiman','1-10','DIRECTO EMPRESA',true),
 ('Servicio Tecnico y Post Venta','1-09','SERVICIO TECNICO Y POST VENTA',true),
 ('Valentina Figueroa','1-03','DIV. COMERCIO',true),
 ('Xenia Briones','1-03','DIV. COMERCIO',true),
 ('Ximena Sanchez','1-06','DIV. INSTITUCIONAL',true),
 ('Yannira Morales','1-03','DIV. COMERCIO',true),
 ('Dayana Rondon','1-70','OPUSPAC - FARMAPACK',true),
 ('MARIELA WEIGANDT','1-70','OPUSPAC - FARMAPACK',true),
 ('PR Gonzalo Flores NO ACTIVO','1-03','DIV. COMERCIO',false),
 ('PR Oliver Concha NO ACTIVO','1-03','DIV. COMERCIO',false)
on conflict (nombre) do update
  set centro_costo = excluded.centro_costo, division = excluded.division,
      activo = excluded.activo, updated_at = now();
