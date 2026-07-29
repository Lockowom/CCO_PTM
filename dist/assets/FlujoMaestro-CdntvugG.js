import { j as t } from './query-vendor-CojWQiBV.js';
import { u as $e, r as d } from './react-vendor-CA7EHQ1X.js';
import {
  bD as ze,
  z as Oe,
  X as K,
  cj as _e,
  ck as Fe,
  cl as Le,
  cm as Be,
  cn as qe,
  b7 as Ve,
  bK as Ue,
  co as We,
  c1 as Xe,
  cp as Ye,
  ad as Ge,
  Y as Z,
  a3 as He,
  U as Je,
  cq as Ke,
  aR as Ze,
  ah as Qe,
  b as et,
  bC as tt,
  t as D
} from './ui-vendor-C7KFTQPV.js';
import { s as fe, u as at } from './index-C11uFGei.js';
import './supabase-vendor-jY4wIOEF.js';
const ot = {
    titulo: 'Flujo Maestro CCO',
    descripcion:
      'Modelo de procesos completo del sistema CCO, construido en el Modelador de Procesos. Copia fiel del modelo del usuario (importable desde el modelador con Importar; precargado como flujo por defecto con el boton CCO).',
    version: '1.1',
    fecha: '2026-07-18'
  },
  nt = [
    { id: 'n1', type: 'inicio', label: 'Recepción Nacional', x: -148, y: -299, w: 128, h: 46 },
    {
      id: 'n3',
      type: 'decision',
      label: `Calidad
¿conforme?`,
      x: -17,
      y: -207,
      w: 164,
      h: 58
    },
    {
      id: 'n4',
      type: 'tarea',
      label: 'Almacenaje Fisico Productos',
      x: -373,
      y: 131,
      w: 152,
      h: 54
    },
    {
      id: 'n5',
      type: 'tarea',
      label: `Acción
correctiva`,
      x: 320,
      y: 127,
      w: 152,
      h: 54
    },
    { id: 'n9', type: 'tarea', label: 'En Proceso', x: 1394, y: -489, w: 152, h: 54 },
    {
      id: 'n32',
      type: 'decision',
      label: 'Certificado de Salida "CALIDAD"',
      x: 2039,
      y: -540,
      w: 164,
      h: 58
    },
    { id: 'n33', type: 'tarea', label: 'Shipping', x: 1394, y: -372, w: 152, h: 54 },
    { id: 'n41', type: 'tarea', label: 'Registro N.V', x: 1392, y: -585, w: 152, h: 54 },
    { id: 'n53', type: 'tarea', label: 'Transporte Propio', x: 1605, y: -102, w: 152, h: 54 },
    { id: 'n55', type: 'tarea', label: 'Currier (Inyección)', x: 1388, y: -100, w: 152, h: 54 },
    {
      id: 'n56',
      type: 'tarea',
      label: 'Currier (Retiro/Pick up)',
      x: 1178,
      y: -100,
      w: 152,
      h: 54
    },
    { id: 'n64', type: 'fin', label: 'Entregado', x: 1219, y: 456, w: 128, h: 46 },
    { id: 'n68', type: 'inicio', label: 'TMS Transporte', x: 1914, y: -386, w: 128, h: 46 },
    { id: 'n78', type: 'decision', label: 'Tipo Despacho', x: 1388, y: -234, w: 164, h: 58 },
    { id: 'n83', type: 'decision', label: 'Asignar Vehículo', x: 2043, y: -133, w: 164, h: 58 },
    { id: 'n84', type: 'tarea', label: 'Planificar Ruta', x: 1786, y: 38, w: 152, h: 54 },
    { id: 'n85', type: 'tarea', label: 'Programado', x: 2227, y: -221, w: 152, h: 54 },
    { id: 'n86', type: 'tarea', label: 'En Carga', x: 1632, y: 117, w: 152, h: 54 },
    { id: 'n87', type: 'tarea', label: 'Despachado', x: 1475, y: 196, w: 152, h: 54 },
    { id: 'n94', type: 'tarea', label: 'Incidencias', x: 1502, y: 433, w: 152, h: 54 },
    { id: 'n97', type: 'inicio', label: 'En Ruta', x: 1220, y: 319, w: 128, h: 46 },
    { id: 'n101', type: 'tarea', label: 'Reprogramar', x: 2228, y: 153, w: 152, h: 54 },
    { id: 'n103', type: 'tarea', label: 'POD (Proof of Delivery)', x: 1207, y: 573, w: 152, h: 54 },
    { id: 'n115', type: 'tarea', label: 'Crear Orden Transporte', x: 2496, y: -393, w: 152, h: 54 },
    { id: 'n116', type: 'tarea', label: 'Asignar Chofer', x: 1931, y: -44, w: 152, h: 54 },
    { id: 'n123', type: 'tarea', label: 'Retraso', x: 1802, y: 298, w: 152, h: 54 },
    { id: 'n124', type: 'tarea', label: 'Dirección Incorrecta', x: 1805, y: 535, w: 152, h: 54 },
    { id: 'n126', type: 'tarea', label: 'Producto Dañado', x: 1805, y: 613, w: 152, h: 54 },
    { id: 'n127', type: 'tarea', label: 'Cliente Ausente', x: 1804, y: 458, w: 152, h: 54 },
    { id: 'n128', type: 'tarea', label: 'Accidente', x: 1805, y: 377, w: 152, h: 54 },
    { id: 'n135', type: 'fin', label: 'Cerrado', x: 1217, y: 715, w: 128, h: 46 },
    { id: 'n138', type: 'tarea', label: 'Pendiente Asignación', x: 2365, y: -313, w: 152, h: 54 },
    { id: 'n141', type: 'tarea', label: 'Resolver', x: 2230, y: 435, w: 152, h: 54 },
    { id: 'n144', type: 'inicio', label: 'Recepción Importacions', x: 16, y: -359, w: 128, h: 46 },
    { id: 'n147', type: 'fin', label: 'Registro Ubicaciones', x: 20, y: -16, w: 128, h: 46 },
    { id: 'n149', type: 'tarea', label: 'Ajustes', x: -372, y: 367, w: 152, h: 54 },
    { id: 'n151', type: 'inicio', label: 'Conteo Ciclico', x: -360, y: 254, w: 128, h: 46 },
    {
      id: 'n158',
      type: 'inicio',
      label: 'Analisis Estancia del Producto "CALIDAD"',
      x: -5,
      y: 233,
      w: 128,
      h: 46
    },
    {
      id: 'n161',
      type: 'decision',
      label: 'Generacion Dictamen Producto',
      x: -17,
      y: 401,
      w: 164,
      h: 58
    },
    { id: 'n164', type: 'tarea', label: 'Proximo a Vencer', x: -422, y: 580, w: 152, h: 54 },
    { id: 'n165', type: 'tarea', label: 'Faltante/Sobrante', x: 188, y: 603, w: 152, h: 54 },
    { id: 'n166', type: 'tarea', label: 'Vencido', x: -11, y: 558, w: 152, h: 54 },
    { id: 'n167', type: 'tarea', label: 'Daño Empaque', x: -224, y: 602, w: 152, h: 54 },
    { id: 'n168', type: 'tarea', label: 'Dañado', x: 439, y: 576, w: 152, h: 54 },
    {
      id: 'n174',
      type: 'tarea',
      label: 'Traspaso Sistemico "INVENTARIO"',
      x: -20,
      y: 934,
      w: 152,
      h: 54
    },
    {
      id: 'n182',
      type: 'inicio',
      label: 'Generación Ticket a Servicio Tecnico',
      x: 448,
      y: 734,
      w: 128,
      h: 46
    },
    {
      id: 'n186',
      type: 'decision',
      label: 'Producto Operativo "Vendible"',
      x: 429,
      y: 844,
      w: 164,
      h: 58
    },
    { id: 'n190', type: 'tarea', label: 'NO', x: 316, y: 959, w: 152, h: 54 },
    { id: 'n191', type: 'tarea', label: 'SI', x: 539, y: 960, w: 152, h: 54 },
    {
      id: 'n194',
      type: 'tarea',
      label: 'Producto queda de baja / donante piezas',
      x: 197,
      y: 1072,
      w: 152,
      h: 54
    },
    { id: 'n199', type: 'tarea', label: 'Se Genera Informe', x: 429, y: 1083, w: 152, h: 54 },
    { id: 'n206', type: 'fin', label: 'Se Cierra el caso', x: 440, y: 1220, w: 128, h: 46 },
    { id: 'n210', type: 'inicio', label: 'Tarea de calidad', x: -210, y: 1171, w: 128, h: 46 },
    { id: 'n216', type: 'fin', label: 'Fin Tarea Calidad', x: -8, y: 1223, w: 128, h: 46 },
    { id: 'n221', type: 'inicio', label: '"Modulo Carga Masiva"', x: 633, y: -961, w: 128, h: 46 },
    {
      id: 'n222',
      type: 'tarea',
      label: 'Subida N.V (PTM - ORANGE - FARMAPACK)',
      x: 957,
      y: -801,
      w: 152,
      h: 54
    },
    { id: 'n223', type: 'tarea', label: 'Codigos Maestros', x: 488, y: -816, w: 152, h: 54 },
    {
      id: 'n224',
      type: 'tarea',
      label: 'Trazabilidad de Productos',
      x: 1181,
      y: -967,
      w: 152,
      h: 54
    },
    { id: 'n225', type: 'tarea', label: 'Lotes/Series', x: 888, y: -963, w: 152, h: 54 },
    { id: 'n232', type: 'tarea', label: 'Cubicaje Productos', x: 725, y: -836, w: 152, h: 54 },
    { id: 'n233', type: 'tarea', label: 'Ficha Técnica Productos', x: 724, y: -743, w: 152, h: 54 },
    { id: 'n237', type: 'tarea', label: 'Carteles', x: 727, y: -639, w: 152, h: 54 },
    { id: 'n238', type: 'tarea', label: 'Analisis Conteo', x: 270, y: -1122, w: 152, h: 54 },
    { id: 'n239', type: 'tarea', label: 'Tareas Ciclico', x: 384, y: -957, w: 152, h: 54 },
    { id: 'n240', type: 'tarea', label: 'Analisis Codigos', x: 107, y: -956, w: 152, h: 54 },
    {
      id: 'n241',
      type: 'tarea',
      label: 'Ventana de Traspasos/Ajustes',
      x: 281,
      y: -816,
      w: 152,
      h: 54
    },
    { id: 'n248', type: 'inicio', label: 'Panel PTM', x: 1405, y: -685, w: 128, h: 46 },
    { id: 'n251', type: 'tarea', label: 'Mapa Calor "Layaout"', x: -691, y: -549, w: 152, h: 54 },
    { id: 'n257', type: 'tarea', label: 'Direcciones', x: 887, y: -1075, w: 152, h: 54 },
    {
      id: 'n259',
      type: 'inicio',
      label: 'Info para la creación de Tickets Servicio Tecnico',
      x: 2062,
      y: -779,
      w: 128,
      h: 46
    },
    { id: 'n260', type: 'tarea', label: 'TV', x: 1676, y: -585, w: 152, h: 54 },
    { id: 'n261', type: 'tarea', label: 'Dashboard', x: 1676, y: -755, w: 152, h: 54 },
    { id: 'n262', type: 'tarea', label: 'Consulta N.V', x: 1677, y: -672, w: 152, h: 54 },
    { id: 'n270', type: 'tarea', label: 'Cliente se contacta', x: 2937, y: -781, w: 152, h: 54 },
    {
      id: 'n271',
      type: 'fin',
      label: 'Cierre del caso CONFORME / NO CONFORME',
      x: 1710,
      y: -1264,
      w: 128,
      h: 46
    },
    { id: 'n274', type: 'inicio', label: 'Post Venta', x: 2953, y: 1179, w: 128, h: 46 },
    {
      id: 'n277',
      type: 'tarea',
      label: 'Levantamiento de ticket "Link Publico"',
      x: 2782,
      y: -691,
      w: 152,
      h: 54
    },
    { id: 'n278', type: 'tarea', label: 'Mediante Correo', x: 2788, y: -876, w: 152, h: 54 },
    {
      id: 'n281',
      type: 'tarea',
      label: 'Creacion de Ticket Unico segun  tipo de solicitud',
      x: 2440,
      y: -783,
      w: 152,
      h: 54
    },
    { id: 'n287', type: 'decision', label: 'Tecnico Asignado', x: 2129, y: -979, w: 164, h: 58 },
    {
      id: 'n289',
      type: 'decision',
      label: 'Fecha/hora de  Agendamiento',
      x: 2264,
      y: -889,
      w: 164,
      h: 58
    },
    { id: 'n293', type: 'tarea', label: 'Informe del tecnico', x: 1982, y: -1076, w: 152, h: 54 },
    { id: 'n295', type: 'tarea', label: 'Trazabilidad del caso', x: 1854, y: -1159, w: 152, h: 54 }
  ],
  lt = [
    { id: 'e16', from: 'n3', to: 'n4', label: 'conforme' },
    { id: 'e17', from: 'n3', to: 'n5', label: 'no conforme' },
    { id: 'e18', from: 'n5', to: 'n4', label: '' },
    { id: 'e36', from: 'n32', to: 'n33', label: '' },
    { id: 'e37', from: 'n9', to: 'n33', label: '' },
    { id: 'e43', from: 'n41', to: 'n9', label: '' },
    { id: 'e69', from: 'n53', to: 'n68', label: '' },
    { id: 'e79', from: 'n33', to: 'n78', label: '' },
    { id: 'e80', from: 'n78', to: 'n56', label: '' },
    { id: 'e81', from: 'n78', to: 'n55', label: '' },
    { id: 'e82', from: 'n78', to: 'n53', label: '' },
    { id: 'e92', from: 'n86', to: 'n87', label: '' },
    { id: 'e98', from: 'n56', to: 'n97', label: '' },
    { id: 'e99', from: 'n55', to: 'n97', label: '' },
    { id: 'e106', from: 'n87', to: 'n97', label: '' },
    { id: 'e107', from: 'n97', to: 'n94', label: '' },
    { id: 'e111', from: 'n97', to: 'n64', label: '' },
    { id: 'e112', from: 'n64', to: 'n103', label: '' },
    { id: 'e117', from: 'n68', to: 'n115', label: '' },
    { id: 'e119', from: 'n83', to: 'n116', label: '' },
    { id: 'e120', from: 'n85', to: 'n83', label: '' },
    { id: 'e121', from: 'n116', to: 'n84', label: '' },
    { id: 'e122', from: 'n84', to: 'n86', label: '' },
    { id: 'e129', from: 'n94', to: 'n123', label: '' },
    { id: 'e130', from: 'n94', to: 'n128', label: '' },
    { id: 'e131', from: 'n94', to: 'n127', label: '' },
    { id: 'e132', from: 'n94', to: 'n124', label: '' },
    { id: 'e133', from: 'n94', to: 'n126', label: '' },
    { id: 'e134', from: 'n101', to: 'n85', label: '' },
    { id: 'e136', from: 'n103', to: 'n135', label: '' },
    { id: 'e139', from: 'n115', to: 'n138', label: '' },
    { id: 'e140', from: 'n138', to: 'n85', label: '' },
    { id: 'e142', from: 'n127', to: 'n141', label: '' },
    { id: 'e143', from: 'n141', to: 'n101', label: '' },
    { id: 'e145', from: 'n1', to: 'n3', label: '' },
    { id: 'e146', from: 'n144', to: 'n3', label: '' },
    { id: 'e148', from: 'n4', to: 'n147', label: '' },
    { id: 'e152', from: 'n123', to: 'n141', label: '' },
    { id: 'e153', from: 'n128', to: 'n141', label: '' },
    { id: 'e154', from: 'n124', to: 'n141', label: '' },
    { id: 'e155', from: 'n126', to: 'n141', label: '' },
    { id: 'e156', from: 'n4', to: 'n151', label: '' },
    { id: 'e157', from: 'n151', to: 'n149', label: '' },
    { id: 'e159', from: 'n4', to: 'n158', label: '' },
    { id: 'e162', from: 'n158', to: 'n161', label: '' },
    { id: 'e169', from: 'n161', to: 'n168', label: '' },
    { id: 'e170', from: 'n161', to: 'n166', label: '' },
    { id: 'e171', from: 'n161', to: 'n167', label: '' },
    { id: 'e172', from: 'n161', to: 'n164', label: '' },
    { id: 'e173', from: 'n161', to: 'n165', label: '' },
    { id: 'e175', from: 'n166', to: 'n174', label: '' },
    { id: 'e176', from: 'n165', to: 'n174', label: '' },
    { id: 'e177', from: 'n167', to: 'n174', label: '' },
    { id: 'e178', from: 'n164', to: 'n174', label: '' },
    { id: 'e180', from: 'n168', to: 'n174', label: '' },
    { id: 'e184', from: 'n168', to: 'n182', label: '' },
    { id: 'e189', from: 'n182', to: 'n186', label: '' },
    { id: 'e193', from: 'n186', to: 'n190', label: '' },
    { id: 'e196', from: 'n186', to: 'n191', label: '' },
    { id: 'e200', from: 'n191', to: 'n199', label: '' },
    { id: 'e201', from: 'n190', to: 'n199', label: '' },
    { id: 'e207', from: 'n194', to: 'n206', label: '' },
    { id: 'e208', from: 'n199', to: 'n206', label: '' },
    { id: 'e212', from: 'n210', to: 'n174', label: '' },
    { id: 'e213', from: 'n210', to: 'n182', label: '' },
    { id: 'e218', from: 'n206', to: 'n216', label: '' },
    { id: 'e219', from: 'n194', to: 'n174', label: '' },
    { id: 'e220', from: 'n174', to: 'n216', label: '' },
    { id: 'e226', from: 'n222', to: 'n41', label: '' },
    { id: 'e227', from: 'n225', to: 'n224', label: '' },
    { id: 'e228', from: 'n221', to: 'n222', label: '' },
    { id: 'e229', from: 'n221', to: 'n225', label: '' },
    { id: 'e230', from: 'n147', to: 'n158', label: '' },
    { id: 'e231', from: 'n221', to: 'n223', label: '' },
    { id: 'e234', from: 'n223', to: 'n232', label: '' },
    { id: 'e236', from: 'n232', to: 'n224', label: '' },
    { id: 'e242', from: 'n223', to: 'n147', label: '' },
    { id: 'e243', from: 'n223', to: 'n237', label: '' },
    { id: 'e244', from: 'n223', to: 'n233', label: '' },
    { id: 'e247', from: 'n223', to: 'n241', label: '' },
    { id: 'e250', from: 'n248', to: 'n41', label: '' },
    { id: 'e252', from: 'n147', to: 'n251', label: '' },
    { id: 'e253', from: 'n238', to: 'n240', label: '' },
    { id: 'e254', from: 'n239', to: 'n238', label: '' },
    { id: 'e255', from: 'n223', to: 'n239', label: '' },
    { id: 'e256', from: 'n239', to: 'n240', label: '' },
    { id: 'e258', from: 'n221', to: 'n257', label: '' },
    { id: 'e263', from: 'n41', to: 'n262', label: '' },
    { id: 'e264', from: 'n41', to: 'n261', label: '' },
    { id: 'e265', from: 'n41', to: 'n260', label: '' },
    { id: 'e266', from: 'n262', to: 'n259', label: '' },
    { id: 'e269', from: 'n32', to: 'n9', label: '' },
    { id: 'e272', from: 'n262', to: 'n32', label: '' },
    { id: 'e273', from: 'n190', to: 'n194', label: '' },
    { id: 'e275', from: 'n64', to: 'n274', label: '' },
    { id: 'e276', from: 'n274', to: 'n270', label: '' },
    { id: 'e279', from: 'n270', to: 'n278', label: '' },
    { id: 'e280', from: 'n270', to: 'n277', label: '' },
    { id: 'e282', from: 'n259', to: 'n281', label: '' },
    { id: 'e285', from: 'n277', to: 'n281', label: '' },
    { id: 'e286', from: 'n278', to: 'n281', label: '' },
    { id: 'e291', from: 'n281', to: 'n289', label: '' },
    { id: 'e292', from: 'n289', to: 'n287', label: '' },
    { id: 'e294', from: 'n287', to: 'n293', label: '' },
    { id: 'e296', from: 'n293', to: 'n295', label: '' },
    { id: 'e297', from: 'n295', to: 'n271', label: '' },
    { id: 'e298', from: 'n295', to: 'n271', label: '' },
    { id: 'e299', from: 'n295', to: 'n271', label: '' }
  ],
  Q = { _meta: ot, nodes: nt, edges: lt },
  it = {
    titulo: 'MASTER DATA',
    descripcion:
      'Datos maestros del sistema (productos, clientes, direcciones, series, lotes, catálogos). Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  rt = [
    { id: 'n1', type: 'inicio', label: 'Datos Maestros', x: -360, y: 60, w: 128, h: 46 },
    { id: 'n2', type: 'tarea', label: 'Productos', x: -40, y: -40, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Clientes', x: 190, y: -40, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Direcciones', x: -40, y: 60, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'Series', x: 190, y: 60, w: 152, h: 54 },
    { id: 'n6', type: 'tarea', label: 'Lotes', x: -40, y: 160, w: 152, h: 54 },
    { id: 'n7', type: 'tarea', label: 'Catálogos', x: 190, y: 160, w: 152, h: 54 }
  ],
  st = [
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n1', to: 'n3', label: '' },
    { id: 'e3', from: 'n1', to: 'n4', label: '' },
    { id: 'e4', from: 'n1', to: 'n5', label: '' },
    { id: 'e5', from: 'n1', to: 'n6', label: '' },
    { id: 'e6', from: 'n1', to: 'n7', label: '' }
  ],
  dt = { _meta: it, nodes: rt, edges: st },
  ct = {
    titulo: 'WAREHOUSE (WMS)',
    descripcion:
      'Flujo de bodega: recepción, ubicación, conteo, calidad, ajustes, inventario. Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  bt = [
    { id: 'n0', type: 'inicio', label: 'Ingreso Mercadería', x: -560, y: 0, w: 128, h: 46 },
    { id: 'n1', type: 'tarea', label: 'Recepción', x: -360, y: 0, w: 152, h: 54 },
    { id: 'n2', type: 'tarea', label: 'Ubicación', x: -150, y: 0, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Conteo', x: 60, y: 0, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Calidad', x: 270, y: 0, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'Ajustes', x: 480, y: 0, w: 152, h: 54 },
    { id: 'n6', type: 'fin', label: 'Inventario', x: 690, y: 0, w: 128, h: 46 }
  ],
  pt = [
    { id: 'e0', from: 'n0', to: 'n1', label: '' },
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n2', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' },
    { id: 'e5', from: 'n5', to: 'n6', label: '' }
  ],
  mt = { _meta: ct, nodes: bt, edges: pt },
  xt = {
    titulo: 'OPERACIONES',
    descripcion:
      'Ciclo de la Nota de Venta: NV, proceso, picking, packing, shipping. Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  ft = [
    { id: 'n0', type: 'inicio', label: 'Registro N.V.', x: -560, y: 0, w: 128, h: 46 },
    { id: 'n1', type: 'tarea', label: 'NV', x: -360, y: 0, w: 152, h: 54 },
    { id: 'n2', type: 'tarea', label: 'Proceso', x: -150, y: 0, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Picking', x: 60, y: 0, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Packing', x: 270, y: 0, w: 152, h: 54 },
    { id: 'n5', type: 'fin', label: 'Shipping', x: 480, y: 0, w: 128, h: 46 }
  ],
  ut = [
    { id: 'e0', from: 'n0', to: 'n1', label: '' },
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n2', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' }
  ],
  ht = { _meta: xt, nodes: ft, edges: ut },
  yt = {
    titulo: 'TMS',
    descripcion:
      'Transporte propio: orden, vehículos, choferes, rutas, GPS y prueba de entrega (POD). Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  gt = [
    { id: 'n1', type: 'inicio', label: 'Orden Transporte', x: -520, y: 60, w: 128, h: 46 },
    { id: 'n2', type: 'tarea', label: 'Vehículos', x: -260, y: -60, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Choferes', x: -260, y: 60, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Rutas', x: -40, y: 60, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'GPS', x: 180, y: 60, w: 152, h: 54 },
    { id: 'n6', type: 'fin', label: 'POD', x: 400, y: 60, w: 128, h: 46 }
  ],
  wt = [
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n1', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' },
    { id: 'e5', from: 'n5', to: 'n6', label: '' },
    { id: 'e6', from: 'n2', to: 'n4', label: 'asignar' }
  ],
  jt = { _meta: yt, nodes: gt, edges: wt },
  vt = {
    titulo: 'POSTVENTA',
    descripcion:
      'Servicio técnico: ticket, agenda, técnico, informe, cliente, cierre. Sub-diagrama derivado del plano maestro (docs/flujo-maestro-cco.json). Importable en el Modelador con ⬆ Importar.',
    version: '1.0',
    fecha: '2026-07-18'
  },
  Nt = [
    { id: 'n0', type: 'inicio', label: 'Solicitud Cliente', x: -560, y: 0, w: 128, h: 46 },
    { id: 'n1', type: 'tarea', label: 'Ticket', x: -360, y: 0, w: 152, h: 54 },
    { id: 'n2', type: 'tarea', label: 'Agenda', x: -150, y: 0, w: 152, h: 54 },
    { id: 'n3', type: 'tarea', label: 'Técnico', x: 60, y: 0, w: 152, h: 54 },
    { id: 'n4', type: 'tarea', label: 'Informe', x: 270, y: 0, w: 152, h: 54 },
    { id: 'n5', type: 'tarea', label: 'Cliente', x: 480, y: 0, w: 152, h: 54 },
    { id: 'n6', type: 'fin', label: 'Cierre', x: 690, y: 0, w: 128, h: 46 }
  ],
  kt = [
    { id: 'e0', from: 'n0', to: 'n1', label: '' },
    { id: 'e1', from: 'n1', to: 'n2', label: '' },
    { id: 'e2', from: 'n2', to: 'n3', label: '' },
    { id: 'e3', from: 'n3', to: 'n4', label: '' },
    { id: 'e4', from: 'n4', to: 'n5', label: '' },
    { id: 'e5', from: 'n5', to: 'n6', label: '' }
  ],
  Ct = { _meta: vt, nodes: Nt, edges: kt };
async function pe(S = 'maestro') {
  const { data: M } = await fe
    .from('tms_flujo_modelos')
    .select('modelo,titulo,updated_at,updated_by')
    .eq('codigo', S)
    .maybeSingle();
  return M;
}
async function St(S, M, j) {
  const { data: Y, error: b } = await fe.rpc('flujo_guardar', {
    p_codigo: S,
    p_titulo: M,
    p_modelo: j
  });
  return b ? { ok: !1, error: b.message } : Y || { ok: !0 };
}
const V = {
    inicio: { pill: !0, dim: [128, 46] },
    fin: { pill: !0, dim: [128, 46] },
    tarea: { pill: !1, dim: [152, 54] },
    decision: { diamond: !0, dim: [164, 58] }
  },
  Mt = {
    light: {
      inicio: { fill: '#ecfdf5', border: '#10b981', text: '#047857' },
      fin: { fill: '#fff7ed', border: '#f97316', text: '#c2410c' },
      tarea: { fill: '#ffffff', border: '#2f6f9f', text: '#1e3a4f' },
      decision: { fill: '#fffbeb', border: '#d97706', text: '#92400e' }
    },
    dark: {
      inicio: { fill: '#0e2a20', border: '#10b981', text: '#6ee7b7' },
      fin: { fill: '#3a1f10', border: '#f97316', text: '#fdba74' },
      tarea: { fill: '#14213b', border: '#4b7bb5', text: '#cfe0f5' },
      decision: { fill: '#2e2513', border: '#caa14a', text: '#f5d98a' }
    }
  },
  Pt = {
    light: {
      canvasBg: void 0,
      dot: 'theme(colors.slate.200)',
      border: 'border-slate-200',
      edge: '#b6c2d1',
      arrow: '#94a3b8',
      labelBg: '#ffffff',
      labelBorder: '#e2e8f0',
      labelText: '#64748b',
      diamondBg: '#eef1f5'
    },
    dark: {
      canvasBg: '#0e1626',
      dot: 'rgba(148,163,184,0.14)',
      border: 'border-slate-700',
      edge: '#3f4f68',
      arrow: '#64748b',
      labelBg: '#16223a',
      labelBorder: '#2c3b55',
      labelText: '#94a3b8',
      diamondBg: '#1b2740'
    }
  },
  me = [
    { codigo: 'maestro', titulo: 'Flujo Maestro', seed: Q },
    { codigo: 'master-data', titulo: 'Master Data', seed: dt },
    { codigo: 'warehouse-wms', titulo: 'Warehouse (WMS)', seed: mt },
    { codigo: 'operaciones', titulo: 'Operaciones', seed: ht },
    { codigo: 'tms', titulo: 'TMS', seed: jt },
    { codigo: 'postventa', titulo: 'Postventa', seed: Ct }
  ],
  Dt = [
    [/registro n\.?v|ingresar/i, '/panel/ingresar'],
    [/consulta n\.?v/i, '/panel/info'],
    [/panel ptm|dashboard/i, '/panel'],
    [/modo tv|^tv$/i, '/panel/tv'],
    [/tms|transporte|orden transporte|pod|ruta|chofer|veh[ií]culo/i, '/tms/control'],
    [/post ?venta|servicio tecnico|ticket/i, '/postventa/tickets'],
    [/conteo/i, '/inventory/conteo'],
    [/analisis codigos/i, '/inventory/analisis'],
    [/carteles/i, '/inventory/carteles'],
    [/traspaso|ajustes/i, '/inventory/traspasos'],
    [/carga masiva|subida n\.?v/i, '/inbound/data-import'],
    [/recepci[oó]n/i, '/inbound/reception'],
    [/cubicaje/i, '/inbound/cubing'],
    [/ubicaciones|layaout|mapa calor/i, '/queries/heatmap'],
    [/calidad|dictamen|monitoreo/i, '/quality/monitoreo']
  ],
  xe = (S) => (Dt.find(([M]) => M.test(S || '')) || [])[1] || null,
  At = {
    'master-data':
      /producto|cliente|direccion|serie|lote|cat[aá]logo|codigos maestros|ficha t[eé]cnica|cubicaje|trazabilidad de producto/i,
    'warehouse-wms':
      /recepci[oó]n|ubicaci|conteo|calidad|ajuste|inventario|almacenaje|traspaso|dictamen|vencido|da[ñn]ad|empaque|faltante|sobrante|mapa calor|layaout|analisis|estancia/i,
    operaciones:
      /\bn\.?v\b|en proceso|shipping|picking|packing|currier|entregado|registro n|panel ptm|modo tv|dashboard|consulta n|carga masiva|subida n|certificado de salida/i,
    tms: /tms|transporte|veh[ií]culo|chofer|ruta|\bpod\b|orden transporte|incidencia|despachado|en carga|programado|asignar|reprogramar|retraso|accidente|cliente ausente|direcci[oó]n incorrecta|resolver|pendiente asignaci|tipo despacho|en ruta/i,
    postventa:
      /ticket|servicio tecnico|post ?venta|informe del tecnico|t[eé]cnico|agendamiento|cliente se contacta|trazabilidad del caso|producto operativo|donante|se cierra el caso|se genera informe|link publico/i
  };
function zt() {
  var ce, be;
  const S = $e(),
    { hasPermission: M, user: j } = at(),
    Y =
      M('manage_workflows') ||
      (j == null ? void 0 : j.rol) === 'ADMIN' ||
      (j == null ? void 0 : j.es_admin_delegado),
    [b, ue] = d.useState('maestro'),
    [m, g] = d.useState({ nodes: [], edges: [] }),
    [ee, he] = d.useState('Flujo Maestro CCO'),
    [U, G] = d.useState(!1),
    [c, ye] = d.useState(!1),
    [H, te] = d.useState(''),
    [s, u] = d.useState(null),
    [p, R] = d.useState(null),
    [T, E] = d.useState(null),
    [$, ge] = d.useState(() => {
      try {
        return localStorage.getItem('fm_tema') || 'dark';
      } catch {
        return 'dark';
      }
    }),
    P = $ === 'dark',
    x = Mt[$],
    v = Pt[$];
  d.useEffect(() => {
    try {
      localStorage.setItem('fm_tema', $);
    } catch {}
  }, [$]);
  const W = d.useRef(null),
    ae = d.useRef(null),
    [h, z] = d.useState({ s: 0.55, x: 0, y: 0 }),
    oe = d.useRef(1),
    y = d.useRef(null),
    A = d.useRef(null),
    ne = (e) => g((a) => ({ ...a, nodes: e(a.nodes) })),
    N = () => G(!0),
    J = (e) => {
      let a = 0;
      ([...(e.nodes || []), ...(e.edges || [])].forEach((o) => {
        const l = parseInt(String(o.id).replace(/\D/g, ''), 10) || 0;
        l > a && (a = l);
      }),
        (oe.current = a + 1));
    },
    le = (e) => e + oe.current++,
    O = d.useMemo(() => Object.fromEntries(m.nodes.map((e) => [e.id, e])), [m.nodes]),
    _ = d.useCallback((e) => {
      const a = W.current;
      if (!a || !e.length) return;
      const o = Math.min(...e.map((w) => w.x)),
        l = Math.min(...e.map((w) => w.y)),
        i = Math.max(...e.map((w) => w.x + w.w)),
        r = Math.max(...e.map((w) => w.y + w.h)),
        n = i - o,
        k = r - l,
        C = a.clientWidth,
        B = a.clientHeight,
        q = Math.min(C / n, B / k) * 0.9;
      z({ s: q, x: -o * q + (C - n * q) / 2, y: -l * q + (B - k * q) / 2 });
    }, []),
    we = () => _(m.nodes),
    X = d.useCallback(
      async (e) => {
        var i, r;
        const a = me.find((n) => n.codigo === e);
        let o = null,
          l = null;
        try {
          const n = await pe(e);
          (i = n == null ? void 0 : n.modelo) != null &&
            i.nodes &&
            ((o = n.modelo), (l = n.titulo));
        } catch {}
        (o ||
          ((o = { nodes: a.seed.nodes, edges: a.seed.edges }),
          (l = ((r = a.seed._meta) == null ? void 0 : r.titulo) || a.titulo)),
          g({ nodes: o.nodes.map((n) => ({ ...n })), edges: o.edges.map((n) => ({ ...n })) }),
          he(l || a.titulo),
          J(o),
          G(!1),
          u(null),
          E(null),
          R(null),
          requestAnimationFrame(() => _(o.nodes)));
      },
      [_]
    );
  d.useEffect(() => {
    X('maestro');
  }, [X]);
  const je = (e) => {
      e !== b &&
        ((U &&
          !window.confirm('Tienes cambios sin guardar. ¿Cambiar de diagrama y descartarlos?')) ||
          (ue(e), X(e)));
    },
    ve = (e) => {
      e.preventDefault();
      const a = W.current.getBoundingClientRect(),
        o = e.clientX - a.left,
        l = e.clientY - a.top;
      z((i) => {
        const r = Math.min(2.5, Math.max(0.1, i.s * (e.deltaY < 0 ? 1.12 : 0.89))),
          n = r / i.s;
        return { s: r, x: o - (o - i.x) * n, y: l - (l - i.y) * n };
      });
    },
    Ne = (e) => {
      e.target.closest('[data-node]') ||
        e.target.closest('[data-elabel]') ||
        (u(null), E(null), (A.current = { x: e.clientX, y: e.clientY }));
    },
    ke = (e) => {
      if (y.current) {
        const a = (e.clientX - y.current.px) / h.s,
          o = (e.clientY - y.current.py) / h.s;
        ((y.current.px = e.clientX),
          (y.current.py = e.clientY),
          (y.current.moved = !0),
          ne((l) => l.map((i) => (i.id === y.current.id ? { ...i, x: i.x + a, y: i.y + o } : i))));
        return;
      }
      if (A.current) {
        const a = e.clientX - A.current.x,
          o = e.clientY - A.current.y;
        ((A.current = { x: e.clientX, y: e.clientY }),
          z((l) => ({ ...l, x: l.x + a, y: l.y + o })));
      }
    },
    ie = () => {
      var e;
      ((e = y.current) != null && e.moved && N(), (y.current = null), (A.current = null));
    },
    Ce = (e, a) => {
      (e.stopPropagation(),
        p === null &&
          (u({ kind: 'node', id: a.id }),
          c && (y.current = { id: a.id, px: e.clientX, py: e.clientY, moved: !1 })));
    },
    Se = (e, a) => {
      if ((e.stopPropagation(), p !== null)) {
        if (p === '') {
          R(a.id);
          return;
        }
        (p !== a.id &&
          (g((o) => ({ ...o, edges: [...o.edges, { id: le('e'), from: p, to: a.id, label: '' }] })),
          N()),
          R(''));
        return;
      }
      c || E(a);
    },
    Me = (e, a) => {
      if ((e.stopPropagation(), !c)) return;
      const o = window.prompt('Etiqueta del nodo:', a.label);
      o != null && F(a.id, { label: o });
    },
    F = (e, a) => {
      (ne((o) => o.map((l) => (l.id === e ? { ...l, ...a } : l))), N());
    },
    Pe = (e, a) => {
      (g((o) => ({ ...o, edges: o.edges.map((l) => (l.id === e ? { ...l, ...a } : l)) })), N());
    },
    De = (e) => {
      const a = W.current,
        o = (a.clientWidth / 2 - h.x) / h.s,
        l = (a.clientHeight / 2 - h.y) / h.s,
        i = V[e].dim,
        r = {
          id: le('n'),
          type: e,
          label: e === 'decision' ? '¿Decisión?' : 'Nuevo',
          x: Math.round(o - i[0] / 2),
          y: Math.round(l - i[1] / 2),
          w: i[0],
          h: i[1]
        };
      (g((n) => ({ ...n, nodes: [...n.nodes, r] })), u({ kind: 'node', id: r.id }), N());
    },
    L = d.useCallback(() => {
      s &&
        (s.kind === 'node'
          ? g((e) => ({
              nodes: e.nodes.filter((a) => a.id !== s.id),
              edges: e.edges.filter((a) => a.from !== s.id && a.to !== s.id)
            }))
          : g((e) => ({ ...e, edges: e.edges.filter((a) => a.id !== s.id) })),
        u(null),
        N());
    }, [s]);
  d.useEffect(() => {
    const e = (a) => {
      c &&
        (a.key === 'Delete' || a.key === 'Backspace') &&
        s &&
        !/input|textarea|select/i.test(a.target.tagName) &&
        (a.preventDefault(), L());
    };
    return (window.addEventListener('keydown', e), () => window.removeEventListener('keydown', e));
  }, [c, s, L]);
  const Ae = async () => {
      const e = await St(b, ee, m);
      e != null && e.ok
        ? (D.success('Diagrama guardado'), G(!1))
        : D.error((e == null ? void 0 : e.error) || 'No se pudo guardar');
    },
    Ie = () => {
      const e = new Blob(
          [
            JSON.stringify(
              { _meta: { titulo: ee, codigo: b }, nodes: m.nodes, edges: m.edges },
              null,
              2
            )
          ],
          { type: 'application/json' }
        ),
        a = URL.createObjectURL(e),
        o = document.createElement('a');
      ((o.href = a), (o.download = `flujo-${b}.json`), o.click(), URL.revokeObjectURL(a));
    },
    Re = (e) => {
      var l;
      const a = (l = e.target.files) == null ? void 0 : l[0];
      if (!a) return;
      const o = new FileReader();
      ((o.onload = () => {
        try {
          const i = JSON.parse(o.result);
          if (!Array.isArray(i.nodes) || !Array.isArray(i.edges)) throw 0;
          (g({ nodes: i.nodes.map((r) => ({ ...r })), edges: i.edges.map((r) => ({ ...r })) }),
            J(i),
            N(),
            requestAnimationFrame(() => _(i.nodes)),
            D.success('Importado — recuerda Guardar'));
        } catch {
          D.error('JSON inválido (se espera {nodes, edges})');
        }
      }),
        o.readAsText(a),
        (e.target.value = ''));
    },
    Te = async () => {
      var r;
      if (b === 'maestro') return;
      const e = At[b];
      if (!e) {
        D.error('Este diagrama no tiene filtro de dominio');
        return;
      }
      if (
        U &&
        !window.confirm(
          'Se reemplazará el contenido actual con el recorte del maestro. ¿Continuar?'
        )
      )
        return;
      let a = null;
      try {
        const n = await pe('maestro');
        (r = n == null ? void 0 : n.modelo) != null && r.nodes && (a = n.modelo);
      } catch {}
      a || (a = { nodes: Q.nodes, edges: Q.edges });
      const o = a.nodes.filter((n) => e.test(n.label || ''));
      if (!o.length) {
        D.error('El maestro no tiene nodos de este dominio');
        return;
      }
      const l = new Set(o.map((n) => n.id)),
        i = a.edges.filter((n) => l.has(n.from) && l.has(n.to));
      (g({ nodes: o.map((n) => ({ ...n })), edges: i.map((n) => ({ ...n })) }),
        J({ nodes: o, edges: i }),
        N(),
        requestAnimationFrame(() => _(o)),
        D.success(`Recortado: ${o.length} nodos · ${i.length} conexiones (revisa y Guarda)`));
    },
    re = (e, a, o) => {
      const l = e.x + e.w / 2,
        i = e.y + e.h / 2,
        r = a - l,
        n = o - i;
      if (!r && !n) return { x: l, y: i };
      const k = e.w / 2,
        C = e.h / 2,
        B = Math.min(r ? k / Math.abs(r) : 1 / 0, n ? C / Math.abs(n) : 1 / 0);
      return { x: l + r * B, y: i + n * B };
    },
    se = H.trim().toLowerCase(),
    de = T && xe(T.label),
    f = (s == null ? void 0 : s.kind) === 'node' ? O[s.id] : null,
    I = (s == null ? void 0 : s.kind) === 'edge' ? m.edges.find((e) => e.id === s.id) : null,
    Ee = [
      ['tarea', Ue],
      ['decision', We],
      ['inicio', Xe],
      ['fin', Ye]
    ];
  return t.jsxs('div', {
    className: 'anim-fade-up mx-[calc(50%-50vw)] px-3 sm:px-6 lg:px-8 pb-6',
    children: [
      t.jsxs('div', {
        className: 'flex items-start justify-between gap-3 flex-wrap mb-3',
        children: [
          t.jsxs('div', {
            className: 'flex items-center gap-3',
            children: [
              t.jsx('div', {
                className:
                  'w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white grid place-items-center shadow-lg shadow-orange-500/20',
                children: t.jsx(ze, { size: 22 })
              }),
              t.jsxs('div', {
                children: [
                  t.jsxs('h1', {
                    className: 'text-xl font-black text-slate-800 leading-tight',
                    children: [
                      'Mapa de Procesos',
                      ' ',
                      U &&
                        t.jsx('span', {
                          className: 'text-orange-500 text-sm align-middle',
                          children: '• sin guardar'
                        })
                    ]
                  }),
                  t.jsxs('p', {
                    className: 'text-[13px] text-slate-500',
                    children: [
                      m.nodes.length,
                      ' nodos · ',
                      m.edges.length,
                      ' conexiones ·',
                      ' ',
                      c ? 'edición' : 'vista'
                    ]
                  })
                ]
              })
            ]
          }),
          t.jsxs('div', {
            className: 'flex items-center gap-2 flex-wrap',
            children: [
              t.jsx('select', {
                value: b,
                onChange: (e) => je(e.target.value),
                className:
                  'py-2 px-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 bg-white outline-none focus:border-orange-400',
                children: me.map((e) =>
                  t.jsx('option', { value: e.codigo, children: e.titulo }, e.codigo)
                )
              }),
              t.jsxs('div', {
                className: 'relative',
                children: [
                  t.jsx(Oe, {
                    size: 15,
                    className: 'absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400'
                  }),
                  t.jsx('input', {
                    value: H,
                    onChange: (e) => te(e.target.value),
                    placeholder: 'Resaltar…',
                    className:
                      'pl-8 pr-7 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-orange-400 w-32'
                  }),
                  H &&
                    t.jsx('button', {
                      onClick: () => te(''),
                      className: 'absolute right-2 top-1/2 -translate-y-1/2 text-slate-400',
                      children: t.jsx(K, { size: 14 })
                    })
                ]
              }),
              t.jsxs('div', {
                className:
                  'flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1',
                children: [
                  t.jsx('button', {
                    onClick: () => z((e) => ({ ...e, s: Math.max(0.1, e.s * 0.89) })),
                    className:
                      'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500',
                    children: t.jsx(_e, { size: 16 })
                  }),
                  t.jsxs('span', {
                    className: 'text-[11px] font-mono text-slate-400 w-9 text-center',
                    children: [Math.round(h.s * 100), '%']
                  }),
                  t.jsx('button', {
                    onClick: () => z((e) => ({ ...e, s: Math.min(2.5, e.s * 1.12) })),
                    className:
                      'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500',
                    children: t.jsx(Fe, { size: 16 })
                  }),
                  t.jsx('button', {
                    onClick: we,
                    title: 'Ajustar',
                    className:
                      'w-8 h-8 rounded-lg hover:bg-slate-100 grid place-items-center text-slate-500',
                    children: t.jsx(Le, { size: 15 })
                  })
                ]
              }),
              t.jsx('button', {
                onClick: () => ge((e) => (e === 'dark' ? 'light' : 'dark')),
                title: P ? 'Cambiar a claro' : 'Cambiar a oscuro',
                className:
                  'w-9 h-9 rounded-xl bg-white border border-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50',
                children: P ? t.jsx(Be, { size: 16 }) : t.jsx(qe, { size: 16 })
              }),
              Y &&
                t.jsxs('button', {
                  onClick: () => {
                    (ye((e) => !e), R(null), u(null), E(null));
                  },
                  className: `inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors ${c ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`,
                  children: [t.jsx(Ve, { size: 15 }), ' ', c ? 'Salir' : 'Editar']
                })
            ]
          })
        ]
      }),
      c &&
        t.jsxs('div', {
          className:
            'flex items-center gap-1.5 flex-wrap mb-2 bg-white border border-slate-200 rounded-xl px-2 py-1.5',
          children: [
            t.jsx('span', {
              className: 'text-[10px] font-black text-slate-400 uppercase mr-1',
              children: 'Agregar'
            }),
            Ee.map(([e, a]) =>
              t.jsxs(
                'button',
                {
                  onClick: () => De(e),
                  className:
                    'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-600 hover:bg-slate-100',
                  children: [t.jsx(a, { size: 13 }), ' ', e[0].toUpperCase() + e.slice(1)]
                },
                e
              )
            ),
            t.jsx('span', { className: 'w-px h-5 bg-slate-200 mx-1' }),
            t.jsxs('button', {
              onClick: () => {
                (R(p === null ? '' : null), u(null));
              },
              className: `inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold ${p !== null ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`,
              children: [t.jsx(Ge, { size: 13 }), ' Conectar']
            }),
            t.jsxs('button', {
              onClick: L,
              disabled: !s,
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 disabled:opacity-40',
              children: [t.jsx(Z, { size: 13 }), ' Borrar']
            }),
            t.jsx('span', { className: 'w-px h-5 bg-slate-200 mx-1' }),
            t.jsxs('button', {
              onClick: Ie,
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100',
              children: [t.jsx(He, { size: 13 }), ' Exportar']
            }),
            t.jsxs('button', {
              onClick: () => {
                var e;
                return (e = ae.current) == null ? void 0 : e.click();
              },
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100',
              children: [t.jsx(Je, { size: 13 }), ' Importar']
            }),
            t.jsx('input', {
              ref: ae,
              type: 'file',
              accept: 'application/json,.json',
              onChange: Re,
              className: 'hidden'
            }),
            b !== 'maestro' &&
              t.jsxs('button', {
                onClick: Te,
                title: 'Extrae del Flujo Maestro los nodos de este dominio',
                className:
                  'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-orange-600 hover:bg-orange-50',
                children: [t.jsx(Ke, { size: 13 }), ' Recortar del maestro']
              }),
            t.jsxs('button', {
              onClick: () => X(b),
              className:
                'inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-bold text-slate-500 hover:bg-slate-100',
              children: [t.jsx(Ze, { size: 13 }), ' Recargar']
            }),
            t.jsxs('button', {
              onClick: Ae,
              disabled: !U,
              className:
                'ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40',
              children: [t.jsx(Qe, { size: 14 }), ' Guardar']
            })
          ]
        }),
      t.jsxs('div', {
        ref: W,
        onWheel: ve,
        onPointerDown: Ne,
        onPointerMove: ke,
        onPointerUp: ie,
        onPointerLeave: ie,
        className: `relative overflow-hidden rounded-2xl border [background-size:22px_22px] select-none ${v.border} ${P ? 'bg-[radial-gradient(rgba(148,163,184,0.14)_1px,transparent_1px)]' : 'bg-[radial-gradient(theme(colors.slate.200)_1px,transparent_1px)] bg-white'} ${p !== null ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`,
        style: {
          height: 'calc(100vh - 190px)',
          minHeight: 480,
          touchAction: 'none',
          backgroundColor: v.canvasBg
        },
        children: [
          t.jsxs('div', {
            className: 'absolute top-0 left-0',
            style: {
              transform: `translate(${h.x}px,${h.y}px) scale(${h.s})`,
              transformOrigin: '0 0'
            },
            children: [
              t.jsxs('svg', {
                className: 'absolute top-0 left-0',
                width: '1',
                height: '1',
                style: { overflow: 'visible' },
                children: [
                  t.jsx('defs', {
                    children: t.jsx('marker', {
                      id: 'fm-arrow',
                      markerWidth: '9',
                      markerHeight: '9',
                      refX: '7',
                      refY: '3',
                      orient: 'auto',
                      children: t.jsx('path', { d: 'M0,0 L7,3 L0,6 Z', fill: v.arrow })
                    })
                  }),
                  m.edges.map((e) => {
                    const a = O[e.from],
                      o = O[e.to];
                    if (!a || !o) return null;
                    const l = re(a, o.x + o.w / 2, o.y + o.h / 2),
                      i = re(o, a.x + a.w / 2, a.y + a.h / 2),
                      r = (l.x + i.x) / 2,
                      n = (l.y + i.y) / 2,
                      k = (s == null ? void 0 : s.kind) === 'edge' && s.id === e.id;
                    return t.jsxs(
                      'g',
                      {
                        children: [
                          t.jsx('path', {
                            d: `M ${l.x} ${l.y} L ${i.x} ${i.y}`,
                            stroke: k ? '#f97316' : v.edge,
                            strokeWidth: k ? 2.4 : 1.6,
                            fill: 'none',
                            markerEnd: 'url(#fm-arrow)'
                          }),
                          t.jsx('path', {
                            d: `M ${l.x} ${l.y} L ${i.x} ${i.y}`,
                            stroke: 'transparent',
                            strokeWidth: '14',
                            fill: 'none',
                            style: { cursor: c ? 'pointer' : 'default', pointerEvents: 'stroke' },
                            onPointerDown: (C) => {
                              (C.stopPropagation(), c && u({ kind: 'edge', id: e.id }));
                            }
                          }),
                          e.label &&
                            t.jsxs('g', {
                              'data-elabel': !0,
                              onPointerDown: (C) => {
                                (C.stopPropagation(), c && u({ kind: 'edge', id: e.id }));
                              },
                              style: { cursor: c ? 'pointer' : 'default' },
                              children: [
                                t.jsx('rect', {
                                  x: r - e.label.length * 3.2 - 4,
                                  y: n - 8,
                                  width: e.label.length * 6.4 + 8,
                                  height: 16,
                                  rx: 4,
                                  fill: v.labelBg,
                                  stroke: k ? '#f97316' : v.labelBorder
                                }),
                                t.jsx('text', {
                                  x: r,
                                  y: n + 3,
                                  textAnchor: 'middle',
                                  fontSize: '10',
                                  fontFamily: 'ui-monospace,monospace',
                                  fill: v.labelText,
                                  children: e.label
                                })
                              ]
                            })
                        ]
                      },
                      e.id
                    );
                  })
                ]
              }),
              m.nodes.map((e) => {
                const a = { ...(V[e.type] || V.tarea), ...(x[e.type] || x.tarea) },
                  o = se && e.label.toLowerCase().includes(se),
                  l = (s == null ? void 0 : s.kind) === 'node' && s.id === e.id,
                  i = p === e.id,
                  r = e.color || a.border;
                return t.jsxs(
                  'div',
                  {
                    'data-node': !0,
                    onPointerDown: (n) => Ce(n, e),
                    onClick: (n) => Se(n, e),
                    onDoubleClick: (n) => Me(n, e),
                    className:
                      'absolute flex items-center justify-center text-center px-2 font-semibold leading-tight shadow-sm',
                    style: {
                      left: e.x,
                      top: e.y,
                      width: e.w,
                      height: e.h,
                      background: a.fill,
                      color: a.text,
                      border: `2px solid ${o || l || i ? '#f97316' : r}`,
                      borderRadius: a.pill ? 999 : 12,
                      fontSize: 12,
                      whiteSpace: 'pre-line',
                      cursor: c
                        ? p !== null
                          ? 'crosshair'
                          : 'grab'
                        : xe(e.label)
                          ? 'pointer'
                          : 'default',
                      boxShadow: o || l || i ? '0 0 0 4px rgba(249,115,22,.25)' : void 0
                    },
                    children: [
                      a.diamond &&
                        t.jsx('span', {
                          style: {
                            position: 'absolute',
                            top: -9,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: 11,
                            color: r,
                            background: v.diamondBg,
                            padding: '0 3px',
                            borderRadius: 4
                          },
                          children: '◆'
                        }),
                      e.label
                    ]
                  },
                  e.id
                );
              })
            ]
          }),
          c &&
            (f || I) &&
            t.jsxs('div', {
              className: `absolute top-3 right-3 w-60 border rounded-xl shadow-lg p-3 space-y-2.5 ${P ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`,
              children: [
                t.jsxs('div', {
                  className: 'flex items-center justify-between',
                  children: [
                    t.jsxs('span', {
                      className:
                        'text-[10px] font-black text-slate-400 uppercase inline-flex items-center gap-1',
                      children: [t.jsx(et, { size: 12 }), ' Propiedades']
                    }),
                    t.jsx('button', {
                      onClick: () => u(null),
                      className: 'text-slate-400 hover:text-slate-200',
                      children: t.jsx(K, { size: 14 })
                    })
                  ]
                }),
                f &&
                  t.jsxs(t.Fragment, {
                    children: [
                      t.jsxs('label', {
                        className: 'block',
                        children: [
                          t.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Etiqueta'
                          }),
                          t.jsx('textarea', {
                            rows: 2,
                            value: f.label,
                            onChange: (e) => F(f.id, { label: e.target.value }),
                            className:
                              'mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400 resize-none'
                          })
                        ]
                      }),
                      t.jsxs('label', {
                        className: 'block',
                        children: [
                          t.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Tipo'
                          }),
                          t.jsxs('select', {
                            value: f.type,
                            onChange: (e) => {
                              const a = e.target.value;
                              F(f.id, { type: a, w: V[a].dim[0], h: V[a].dim[1], color: void 0 });
                            },
                            className:
                              'mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400',
                            children: [
                              t.jsx('option', { value: 'tarea', children: 'Tarea' }),
                              t.jsx('option', { value: 'decision', children: 'Decisión' }),
                              t.jsx('option', { value: 'inicio', children: 'Inicio' }),
                              t.jsx('option', { value: 'fin', children: 'Fin' })
                            ]
                          })
                        ]
                      }),
                      t.jsxs('div', {
                        className: 'flex items-center gap-2',
                        children: [
                          t.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Color'
                          }),
                          t.jsx('input', {
                            type: 'color',
                            value: f.color || x[f.type].border,
                            onChange: (e) => F(f.id, { color: e.target.value }),
                            className: 'w-8 h-8 rounded border border-slate-200 p-0.5'
                          }),
                          f.color &&
                            t.jsx('button', {
                              onClick: () => F(f.id, { color: void 0 }),
                              className:
                                'text-[11px] font-bold text-slate-400 hover:text-slate-600',
                              children: 'reset'
                            }),
                          t.jsxs('button', {
                            onClick: L,
                            className:
                              'ml-auto inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600',
                            children: [t.jsx(Z, { size: 12 }), ' Borrar']
                          })
                        ]
                      })
                    ]
                  }),
                I &&
                  t.jsxs(t.Fragment, {
                    children: [
                      t.jsxs('label', {
                        className: 'block',
                        children: [
                          t.jsx('span', {
                            className: 'text-[10px] font-bold text-slate-500 uppercase',
                            children: 'Etiqueta de la conexión'
                          }),
                          t.jsx('input', {
                            value: I.label || '',
                            onChange: (e) => Pe(I.id, { label: e.target.value }),
                            placeholder: '(sin etiqueta)',
                            className:
                              'mt-1 w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[13px] outline-none focus:border-orange-400'
                          })
                        ]
                      }),
                      t.jsxs('div', {
                        className: 'text-[11px] text-slate-400',
                        children: [
                          (ce = O[I.from]) == null ? void 0 : ce.label,
                          ' → ',
                          (be = O[I.to]) == null ? void 0 : be.label
                        ]
                      }),
                      t.jsxs('button', {
                        onClick: L,
                        className:
                          'inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-600',
                        children: [t.jsx(Z, { size: 12 }), ' Borrar conexión']
                      })
                    ]
                  })
              ]
            }),
          T &&
            !c &&
            t.jsxs('div', {
              className: `absolute bottom-3 right-3 w-64 border rounded-xl shadow-lg p-3 ${P ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`,
              children: [
                t.jsxs('div', {
                  className: 'flex items-start justify-between gap-2',
                  children: [
                    t.jsx('span', {
                      className: 'text-[10px] font-black text-slate-400 uppercase',
                      children: T.type
                    }),
                    t.jsx('button', {
                      onClick: () => E(null),
                      className: 'text-slate-400 hover:text-slate-200',
                      children: t.jsx(K, { size: 14 })
                    })
                  ]
                }),
                t.jsx('p', {
                  className: `text-[14px] font-black mt-0.5 whitespace-pre-line ${P ? 'text-slate-100' : 'text-slate-800'}`,
                  children: T.label
                }),
                de
                  ? t.jsxs('button', {
                      onClick: () => S(de),
                      className:
                        'mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-orange-500 text-white text-[12px] font-bold hover:bg-orange-600',
                      children: [t.jsx(tt, { size: 13 }), ' Ir al módulo']
                    })
                  : t.jsx('p', {
                      className: 'text-[11px] text-slate-400 mt-2',
                      children: 'Sin módulo asociado directo.'
                    })
              ]
            }),
          t.jsxs('div', {
            className: `absolute bottom-3 left-3 backdrop-blur border rounded-xl px-3 py-2 flex flex-wrap items-center gap-3 text-[10px] ${P ? 'bg-slate-900/80 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-500'}`,
            children: [
              t.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  t.jsx('span', {
                    className: 'w-3 h-3 rounded-full border-2',
                    style: { borderColor: x.inicio.border, background: x.inicio.fill }
                  }),
                  ' ',
                  'Inicio'
                ]
              }),
              t.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  t.jsx('span', {
                    className: 'w-3 h-3 rounded border-2',
                    style: { borderColor: x.tarea.border, background: x.tarea.fill }
                  }),
                  ' ',
                  'Tarea'
                ]
              }),
              t.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  t.jsx('span', {
                    className: 'w-3 h-3 rounded border-2',
                    style: { borderColor: x.decision.border, background: x.decision.fill }
                  }),
                  ' ',
                  'Decisión'
                ]
              }),
              t.jsxs('span', {
                className: 'inline-flex items-center gap-1',
                children: [
                  t.jsx('span', {
                    className: 'w-3 h-3 rounded-full border-2',
                    style: { borderColor: x.fin.border, background: x.fin.fill }
                  }),
                  ' ',
                  'Fin'
                ]
              }),
              c
                ? t.jsx('span', {
                    className: 'italic',
                    children:
                      p !== null
                        ? p === ''
                          ? 'toca ORIGEN'
                          : 'toca DESTINO'
                        : 'arrastra · doble clic renombra · Supr borra'
                  })
                : t.jsx('span', { className: 'italic', children: 'clic en un nodo para ver / ir' })
            ]
          })
        ]
      })
    ]
  });
}
export { zt as default };
